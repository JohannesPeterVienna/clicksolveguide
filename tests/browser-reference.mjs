// Browser check (Playwright) for the features of 18 Nov 2026: lookup, reference tables (filter, CSV),
// hand-over from guides, share links, example cases, number keys and the blank checklist.
// Usage: node tests/browser-reference.mjs   (serves docs/ locally, blocks every external request)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');

const DOCS = path.resolve('docs');
const SHOTS = process.env.SHOTS || path.resolve('screenshots');
fs.mkdirSync(SHOTS, { recursive: true });
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const srv = http.createServer((q, s) => {
  let p = decodeURIComponent(q.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(DOCS, p);
  if (!f.startsWith(DOCS) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { s.writeHead(404); s.end('not found'); return; }
  s.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); s.end(fs.readFileSync(f));
}).listen(0);
const base = `http://127.0.0.1:${srv.address().port}`;
const browser = await chromium.launch();
let fails = 0;
const ok = (cond, msg) => { if (cond) console.log('✓ ' + msg); else { fails++; console.log('✗ ' + msg); } };
const errs = [];
async function ctxPage(width, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, acceptDownloads: true, ...opts });
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errs.push(page.url() + ' pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource|net::ERR_FAILED/.test(m.text())) errs.push(page.url() + ' console: ' + m.text()); });
  page.on('dialog', (d) => { errs.push('dialog opened: ' + d.message()); d.dismiss(); });
  return { ctx, page };
}
const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
async function lookup(page, q) {
  await page.fill('#lookup-q', q);
  await page.press('#lookup-q', 'Enter');
  await page.waitForFunction(() => { const o = document.getElementById('lookup-out'); return o.children.length && !/Loading/.test(o.textContent); });
  return page.evaluate(() => ({ text: document.getElementById('lookup-out').textContent, cards: document.querySelectorAll('.lk-card').length, found: document.querySelectorAll('.lk-card[data-found="yes"]').length, injected: document.querySelectorAll('#lookup-out img, #lookup-out script, #lookup-out iframe, #lookup-out svg').length }));
}

for (const width of [390, 1366]) {
  const { ctx, page } = await ctxPage(width);
  // ----- lookup on the home page and the hub -----
  for (const u of ['/', '/reference/']) {
    await page.goto(base + u); await page.waitForSelector('#lookup.ready');
    const cases = [['ERR_NAME_NOT_RESOLVED', /host name could not be resolved/], ['dns_probe_finished_nxdomain', /domain must not exist/], ['-105', /ERR_NAME_NOT_RESOLVED/], ['0x80070422', /ERROR_SERVICE_DISABLED/], ['503', /Service Unavailable/], ['169.254.12.7', /Link Local/], ['fe80::1c2b:3aff:fe4d:5e6f', /link-local/], ['631', /Internet Printing Protocol/], ['26100.1', /Windows 11, version 24H2/]];
    let good = 0;
    for (const [q, re] of cases) { const r = await lookup(page, q); if (r.found >= 1 && re.test(r.text)) good++; else console.log('   miss: ' + q + ' -> ' + r.text.slice(0, 120)); }
    ok(good === cases.length, `${width}px ${u}: ${good}/${cases.length} lookups give the expected result`);
    ok(await overflow(page) <= 1, `${width}px ${u}: no horizontal overflow with a result shown`);
    const junk = ['<img src=x onerror=alert(1)>', '"><script>alert(1)</script>', 'javascript:alert(1)', '=HYPERLINK("http://x","y")', '999.999.999.999', '::::', 'ERR_<b>x</b>', '0xZZZZZZZZ', 'ERR_' + 'A'.repeat(75), '💥', '   '];
    let clean = 0;
    for (const q of junk) { const r = await lookup(page, q); if (r.found === 0 && r.injected === 0) clean++; else console.log('   junk produced output: ' + q); }
    ok(clean === junk.length, `${width}px ${u}: ${junk.length} nonsense inputs give no result and inject nothing`);
    // example buttons
    const n = await page.locator('#lookup .example').count();
    let exOk = 0;
    for (let i = 0; i < n; i++) { await page.locator('#lookup .example').nth(i).click(); await page.waitForFunction(() => document.querySelector('.lk-card')); if (await page.locator('.lk-card[data-found="yes"]').count()) exOk++; }
    ok(n >= 4 && exOk === n, `${width}px ${u}: all ${n} example buttons give a result`);
  }
  // share link of a result: codes yes, addresses never
  await page.goto(base + '/reference/'); await page.waitForSelector('#lookup.ready');
  await lookup(page, 'ERR_CONNECTION_RESET');
  const link = await page.getAttribute('.lk-share', 'data-copy');
  ok(/\/reference\/#q=ERR_CONNECTION_RESET$/.test(link || ''), `${width}px share link of a code: ${link}`);
  await lookup(page, '192.168.1.20');
  ok(await page.locator('.lk-share').count() === 0 && /never put into a link/.test(await page.textContent('#lookup-out')), `${width}px an IP address gets no share link`);
  await page.goto(base + '/reference/#q=ERR_CONNECTION_RESET'); await page.waitForSelector('.lk-card');
  ok(await page.inputValue('#lookup-q') === 'ERR_CONNECTION_RESET' && !(await page.evaluate(() => location.hash)), `${width}px shared link runs the lookup and the fragment is removed`);
  for (const h of ['#q=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E', '#q=192.168.1.20', '#q=%E0%A4%A', '#q=' + 'A'.repeat(500)]) {
    await page.goto(base + '/about/'); await page.goto(base + '/reference/' + h); await page.waitForSelector('#lookup.ready');
    ok(await page.locator('.lk-card').count() === 0 && await page.inputValue('#lookup-q') === '', `${width}px hostile or private fragment ignored: ${h.slice(0, 40)}`);
  }

  // ----- reference tables: filter + CSV -----
  const refs = ['chrome-error-codes', 'http-status-codes', 'ip-address-check', 'network-ports', 'windows-update-error-codes', 'windows-macos-versions', 'troubleshooting-shortcuts'];
  for (const r of refs) {
    await page.goto(base + `/reference/${r}/`);
    await page.waitForFunction(() => /rows/.test((document.querySelector('.tcount') || {}).textContent || ''));
    const res = await page.evaluate(() => [...document.querySelectorAll('input[data-filter-for]')].map((inp) => {
      const t = document.getElementById(inp.getAttribute('data-filter-for'));
      const total = t.tBodies[0].rows.length;
      const word = t.tBodies[0].rows[total - 1].cells[0].textContent.trim();
      inp.value = word; inp.dispatchEvent(new Event('input'));
      const shown = [...t.tBodies[0].rows].filter((x) => !x.hidden).length;
      inp.value = '<script>zzz-no-such-row'; inp.dispatchEvent(new Event('input'));
      const none = [...t.tBodies[0].rows].filter((x) => !x.hidden).length;
      inp.value = ''; inp.dispatchEvent(new Event('input'));
      const back = [...t.tBodies[0].rows].filter((x) => !x.hidden).length;
      return { total, shown, none, back };
    }));
    ok(res.length >= 1 && res.every((x) => x.shown >= 1 && x.shown <= x.total && x.none === 0 && x.back === x.total), `${width}px /reference/${r}/: filter narrows and resets (${res.map((x) => x.total).join('+')} rows)`);
    const [dl] = await Promise.all([page.waitForEvent('download'), page.locator('button[data-csv-for]').first().click()]);
    const csv = fs.readFileSync(await dl.path(), 'utf8');
    const lines = csv.trim().split('\r\n');
    const bad = lines.filter((l) => l.split('","').some((c) => /^"?[=+\-@]/.test(c.replace(/^"/, '"').replace(/^"/, ''))));
    ok(lines.length > 5 && /^"Source","https:\/\//.test(lines[lines.length - 1]) && bad.length === 0, `${width}px /reference/${r}/: CSV ${dl.suggestedFilename()} has ${lines.length} lines, a source line and no cell starting with = + - @`);
    ok(await overflow(page) <= 1, `${width}px /reference/${r}/: no horizontal overflow`);
    if (r === 'chrome-error-codes') ok(/"'-105"/.test(fs.readFileSync(await (await Promise.all([page.waitForEvent('download'), page.locator('button[data-csv-for="t-chrome"]').click()]))[0].path(), 'utf8')), `${width}px negative code numbers are defused in the CSV ('-105)`);
    await page.screenshot({ path: path.join(SHOTS, `ref-${r}-${width}.png`) });
  }

  // ----- hand-over from a guide and from a diagnosis -----
  await page.goto(base + '/guides/windows-update-stuck/');
  await page.fill('#jump-q', '0x80070422'); await page.press('#jump-q', 'Enter');
  await page.waitForSelector('.lk-card[data-kind="wu"]');
  ok(new URL(page.url()).pathname === '/reference/' && !(await page.evaluate(() => location.hash)), `${width}px guide → reference: code handed over, address clean`);
  await page.goto(base + '/diagnose/wifi-connected-no-internet/');
  await page.fill('#jump-q', '169.254.12.7'); await page.press('#jump-q', 'Enter');
  await page.waitForSelector('.lk-card[data-kind="ip"]');
  ok(!/169/.test(page.url()) && await page.evaluate(() => sessionStorage.getItem('csg-lookup')) === null, `${width}px diagnosis → reference: the IP address is neither in the address nor left in storage`);
  await page.goto(base + '/guides/tech-support-scams/');
  await page.locator('button[data-jump]').first().click();
  await page.waitForSelector('.lk-card[data-kind="port"]');
  ok(true, `${width}px example button on a guide opens the lookup`);

  // ----- diagnoses: examples, number keys, share link, checklist -----
  for (const u of ['/diagnose/wifi-connected-no-internet/', '/diagnose/site-cant-be-reached/', '/diagnose/one-website-wont-load/', '/diagnose/printer-offline-windows-11/', '/diagnose/mac-printer-not-printing/', '/diagnose/laptop-wont-connect-wifi/']) {
    await page.goto(base + u); await page.waitForSelector('#tool.ready');
    await page.evaluate(() => { localStorage.clear(); window.__printed = 0; window.print = () => { window.__printed++; }; });
    const n = await page.locator('#diag-examples .example').count();
    let done = 0;
    for (let i = 0; i < n; i++) { await page.locator('#diag-examples .example').nth(i).click(); if (['result', 'stop'].includes(await page.getAttribute('#diag-card', 'data-kind'))) done++; }
    ok(n >= 2 && done === n, `${width}px ${u}: ${n} example cases end in a result`);
    await page.click('#diag-reset');
    await page.focus('#diag-card .diag-q');
    await page.keyboard.press('1');
    const hist = await page.locator('#diag-hist li:not(.h-empty)').count();
    ok(hist === 1, `${width}px ${u}: key 1 picks the first answer`);
    await page.keyboard.press('9'); // no ninth answer: nothing happens
    ok(await page.locator('#diag-hist li:not(.h-empty)').count() <= 2, `${width}px ${u}: a key without an answer does nothing harmful`);
    const chk = await page.evaluate(() => document.getElementById('tool').csgChecklist());
    await page.click('#chk-print');
    const printed = await page.evaluate(() => ({ n: window.__printed, text: (document.querySelector('#print-area pre') || {}).textContent || '' }));
    ok(printed.n === 1 && printed.text === chk && /CHECK 1/.test(chk) && /RESULT A/.test(chk), `${width}px ${u}: blank checklist printed (${chk.split('\n').length} lines)`);
    ok(await overflow(page) <= 1, `${width}px ${u}: no horizontal overflow`);
  }
  await ctx.close();
}

// share link round trip (clipboard), with a different system on the receiving side
{
  const { ctx, page } = await ctxPage(1366, { permissions: ['clipboard-read', 'clipboard-write'] });
  await page.goto(base + '/diagnose/one-website-wont-load/'); await page.waitForSelector('#tool.ready');
  await page.selectOption('.vswitch select', 'macold');
  await page.fill('#diag-notes', 'SECRET-NOTE');
  for (const i of [1, 0, 0]) await page.locator('#diag-card button.answer').nth(i).click();
  await page.click('#diag-share');
  await page.waitForFunction(() => /Link copied/.test(document.getElementById('share-note').textContent));
  const link = await page.evaluate(() => navigator.clipboard.readText());
  ok(/\/diagnose\/one-website-wont-load\/#s=1\.0\.0&v=macold$/.test(link) && !/SECRET/.test(link), 'share link holds answers and system, not the notes: ' + link.replace(base, ''));
  const q1 = await page.textContent('#diag-card .diag-q');
  const other = await ctx.newPage();
  await other.goto(link); await other.waitForSelector('#tool.ready');
  await other.waitForFunction(() => document.querySelector('.vswitch select').value === 'macold');
  ok(await other.textContent('#diag-card .diag-q') === q1 && await other.locator('#diag-hist li:not(.h-empty)').count() === 3, 'opened link restores the same check and three answers');
  ok(!(await other.evaluate(() => location.hash)) && await other.inputValue('#diag-notes') === 'SECRET-NOTE' /* same browser profile: own notes stay */, 'fragment removed from the address bar after reading');
  for (const h of ['#s=9.9.9', '#s=%3Cscript%3E', '#s=1.0&v=%22onload%3D', '#s=' + '1.'.repeat(300)]) {
    await other.goto(base + '/about/'); await other.goto(base + '/diagnose/one-website-wont-load/' + h); await other.waitForSelector('#tool.ready');
    ok(await other.locator('#diag-card .diag-q').count() === 1, 'broken share fragment still renders a check: ' + h.slice(0, 30));
  }
  await ctx.close();
}

ok(errs.length === 0, 'no JavaScript errors, console errors or dialogs' + (errs.length ? ':\n   ' + errs.slice(0, 8).join('\n   ') : ''));
await browser.close(); srv.close();
console.log(fails ? `\n${fails} browser check(s) FAILED` : '\nreference browser checks passed');
process.exit(fails ? 1 : 0);
