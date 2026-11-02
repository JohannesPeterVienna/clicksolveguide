// Browser check with Playwright: every sitemap page at 390 and 1366 px.
// JS errors, horizontal overflow, ad boxes hidden by default, ad distance to controls (ads forced visible),
// every diagnosis walked to a result, fix log download, version switcher, persistence. Screenshots in SHOTS.
// Usage: node tests/browser.mjs   (serves docs/ locally, blocks every external request)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');

const DOCS = path.resolve('docs');
const SHOTS = process.env.SHOTS || path.resolve('screenshots');
fs.mkdirSync(SHOTS, { recursive: true });
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };
const srv = http.createServer((q, s) => {
  let p = decodeURIComponent(q.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(DOCS, p);
  if (!f.startsWith(DOCS) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { s.writeHead(404, { 'content-type': TYPES['.html'] }); s.end(fs.readFileSync(path.join(DOCS, '404.html'))); return; }
  s.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); s.end(fs.readFileSync(f));
}).listen(0);
const base = `http://127.0.0.1:${srv.address().port}`;
const urls = [...fs.readFileSync('docs/sitemap.xml', 'utf8').matchAll(/<loc>https:\/\/clicksolveguide\.com([^<]*)<\/loc>/g)].map((m) => m[1]);

const browser = await chromium.launch();
let fails = 0, minAdDist = Infinity, minAdWhere = '';
const bad = (msg) => { fails++; console.log('✗ ' + msg); };

async function newCtx(width, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, acceptDownloads: true, ...opts });
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
  return ctx;
}
function watch(page, errs) {
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/net::ERR_FAILED|Failed to load resource/.test(m.text())) errs.push('console: ' + m.text()); });
}

for (const width of [390, 1366]) {
  const ctx = await newCtx(width);
  for (const u of urls) {
    const page = await ctx.newPage();
    const errs = []; watch(page, errs);
    await page.goto(base + u, { waitUntil: 'load' });
    await page.waitForTimeout(250);
    const info = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      visibleAds: [...document.querySelectorAll('.ad')].filter((a) => a.offsetHeight > 0).length
    }));
    if (info.overflow > 1) errs.push('horizontal overflow ' + info.overflow + 'px');
    if (info.visibleAds) errs.push('ad box visible without slot id');
    // force every ad box visible like a filled 250 px unit and measure the gap to every control
    const dist = await page.evaluate(() => {
      document.documentElement.classList.add('has-side');
      const ads = [...document.querySelectorAll('.ad')];
      ads.forEach((a) => { a.hidden = false; a.style.minHeight = a.dataset.slot === 'sidebar' ? '600px' : '250px'; });
      const ctl = [...document.querySelectorAll('button, select, input, textarea, summary, a.btn, .cmd, .tool, .answer')]
        .map((e) => e.getBoundingClientRect()).filter((r) => r.width > 0 && r.height > 0);
      let min = Infinity;
      for (const a of ads) {
        const r = a.getBoundingClientRect();
        if (!r.width || !r.height) continue;
        for (const c of ctl) {
          const dx = Math.max(0, c.left - r.right, r.left - c.right);
          const dy = Math.max(0, c.top - r.bottom, r.top - c.bottom);
          min = Math.min(min, Math.hypot(dx, dy));
        }
      }
      return ads.length ? min : null;
    });
    if (dist !== null) {
      if (dist < minAdDist) { minAdDist = dist; minAdWhere = `${width}px ${u}`; }
      if (dist < 150) errs.push(`ad only ${Math.round(dist)} px from a control`);
    }
    if (errs.length) bad(`${width}px ${u}\n   ${errs.join('\n   ')}`);
    await page.close();
  }
  await ctx.close();
}

// ---------- every diagnosis: walk all first answers to a result, then each first-level branch ----------
const tools = urls.filter((u) => u.startsWith('/diagnose/') && u !== '/diagnose/');
for (const width of [390, 1366]) {
  const ctx = await newCtx(width);
  for (const u of tools) {
    const page = await ctx.newPage();
    const errs = []; watch(page, errs);
    await page.goto(base + u);
    await page.waitForSelector('#tool.ready');
    const firstCount = await page.locator('#diag-card .answer').count();
    for (let branch = 0; branch < firstCount; branch++) {
      await page.click('#diag-reset').catch(() => {});
      await page.locator('#diag-card .answer').nth(branch).click();
      for (let i = 0; i < 12 && await page.locator('#diag-card .answer').count(); i++) await page.locator('#diag-card .answer').first().click();
      const kind = await page.getAttribute('#diag-card', 'data-kind');
      const log = await page.textContent('#fixlog-preview');
      if (!['result', 'stop'].includes(kind) || !/RESULT:|HARD STOP:/.test(log)) errs.push(`branch ${branch} ended without result (${kind})`);
      const map = await page.$$eval('.layermap li', (ls) => ls.map((l) => l.dataset.state));
      if (!map.some((s) => s !== 'open')) errs.push(`branch ${branch}: layer map never changed`);
    }
    if (width === 1366) {
      // notes + download + persistence
      await page.fill('#diag-notes', 'router model test-123');
      const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#log-txt')]);
      const file = await dl.path();
      const txt = fs.readFileSync(file, 'utf8');
      if (!/CLICKSOLVE GUIDE – FIX LOG/.test(txt) || !/test-123/.test(txt)) errs.push('downloaded fix log incomplete');
      const before = await page.textContent('#diag-hist');
      await page.reload(); await page.waitForSelector('#tool.ready');
      if ((await page.textContent('#diag-hist')) !== before || (await page.inputValue('#diag-notes')) !== 'router model test-123') errs.push('answers/notes not restored after reload');
      // version switcher changes menu paths
      await page.click('#diag-reset');
      const sel = page.locator('.vswitch select').first();
      const opts = await sel.locator('option').evaluateAll((o) => o.map((x) => x.value));
      if (opts.length > 1) {
        const pathText = async () => page.$$eval('#diag-card .mpath, .prose .mpath', (s) => s.map((x) => x.textContent).join('|'));
        const seen = new Set();
        for (const o of opts) { await sel.selectOption(o); seen.add(await pathText()); }
        if (seen.size < 2) errs.push('version switch did not change any menu path');
      }
    }
    if (errs.length) bad(`${width}px tool ${u}\n   ${errs.join('\n   ')}`);
    else console.log(`✓ ${width}px ${u}: all ${firstCount} first-level branches reach a result`);
    await page.close();
  }
  await ctx.close();
}

// ---------- certificate warning is a hard stop ----------
{
  const ctx = await newCtx(390); const page = await ctx.newPage();
  await page.goto(base + '/diagnose/one-website-wont-load/'); await page.waitForSelector('#tool.ready');
  await page.locator('#diag-card .answer').first().click();
  const kind = await page.getAttribute('#diag-card', 'data-kind');
  const t = await page.textContent('#diag-card');
  if (kind !== 'stop' || !/Never click/.test(t) || (await page.locator('#diag-card .answer').count())) bad('certificate warning is not a hard stop');
  else console.log('✓ certificate warning ends in a hard stop without answer buttons');
  await ctx.close();
}

// ---------- copy button ----------
{
  const ctx = await newCtx(1366, { permissions: ['clipboard-read', 'clipboard-write'] }); const page = await ctx.newPage();
  await page.goto(base + '/guides/dns-server-not-responding/');
  await page.locator('.vswitch select').selectOption('win11');
  const btn = page.locator('.cmd:not([hidden]) button.copy').first();
  const code = await btn.getAttribute('data-copy');
  await btn.click(); await page.waitForTimeout(150);
  const clip = await page.evaluate(() => navigator.clipboard.readText()).catch(() => null);
  const label = await btn.textContent();
  if (clip !== code && !/Copied|Select/.test(label)) bad('copy button did not copy: ' + clip);
  else console.log(`✓ copy button copies “${code}”`);
  const hiddenMac = await page.locator('.cmd[data-os="mac"]').first().isHidden();
  if (!hiddenMac) bad('macOS command visible while Windows 11 is selected');
  await ctx.close();
}

// ---------- screenshots ----------
for (const [u, name] of [['/', 'home'], ['/diagnose/wifi-connected-no-internet/', 'wifi-tool'], ['/diagnose/printer-offline-windows-11/', 'printer-tool']]) {
  for (const width of [390, 1366]) {
    for (const scheme of ['light', 'dark']) {
      if (scheme === 'dark' && width === 390 && name !== 'wifi-tool') continue;
      const ctx = await newCtx(width, { colorScheme: scheme }); const page = await ctx.newPage();
      await page.goto(base + u); await page.waitForTimeout(300);
      if (u !== '/') { await page.waitForSelector('#tool.ready'); for (let i = 0; i < 2; i++) await page.locator('#diag-card .answer').first().click(); }
      await page.screenshot({ path: path.join(SHOTS, `${name}-${width}${scheme === 'dark' ? '-dark' : ''}.png`), fullPage: true });
      await ctx.close();
    }
  }
}

await browser.close(); srv.close();
console.log(`\nminimum distance between a forced-visible ad box and a control: ${Math.round(minAdDist)} px (${minAdWhere})`);
console.log(`screenshots: ${SHOTS}`);
if (fails) { console.log(`${fails} problem(s)`); process.exit(1); }
console.log('browser checks passed');
