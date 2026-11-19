// Unit tests: reference lookup core (classification, IP ranges, lookups, CSV, share links).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const R = require('../docs/assets/js/refcore.js');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'docs', 'assets', 'data', 'lookup.json'), 'utf8'));
const src = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'src', 'data', f), 'utf8'));
const one = (q, today) => { const r = R.lookup(data, q, today || '2026-11-18'); assert.equal(r.length, 1, q); return r[0]; };

test('data: built from the source files without loss', () => {
  assert.equal(data.chrome.length, src('chrome-net-errors.json').length);
  assert.ok(data.chrome.length > 200);
  assert.equal(data.wu.length, new Set(src('wu-errors.json').map((x) => x.code)).size, 'one entry per code');
  assert.equal(data.http.length, src('http-status.json').length);
  assert.equal(data.retrieved, '2026-11-18');
  const names = new Set(data.chrome.map((e) => e.name));
  assert.equal(names.size, data.chrome.length, 'unique names');
  for (const k of Object.keys(data.advice.chrome)) assert.ok(names.has(k), 'advice for unknown code ' + k);
  for (const k of Object.keys(data.advice.probe)) assert.ok(data.probe.some((p) => p.name === k), k);
  for (const p of data.probe) assert.ok(data.advice.probe[p.name], p.name);
  for (const k of Object.keys(data.advice.http)) assert.ok(data.http.some((h) => String(h.code) === k), 'advice for unregistered status ' + k);
  for (const r of new Set(data.chrome.map((e) => e.range))) assert.ok(data.advice.chromeRange[r], 'range ' + r);
  for (const p of data.ports) assert.ok(p.where && p.where.length > 10, 'port note ' + p.port);
});

test('data: spot checks against the sources', () => {
  const c = (n) => data.chrome.find((e) => e.name === n);
  assert.deepEqual([c('ERR_NAME_NOT_RESOLVED').code, c('ERR_CONNECTION_REFUSED').code, c('ERR_INTERNET_DISCONNECTED').code, c('ERR_CERT_DATE_INVALID').code], [-105, -102, -106, -201]);
  assert.equal(data.http.find((h) => h.code === 404).desc, 'Not Found');
  assert.equal(data.http.find((h) => h.code === 429).ref, 'RFC 6585');
  assert.ok(data.ip.v4.some((e) => e.block === '169.254.0.0/16' && e.name === 'Link Local' && e.rfc === 'RFC 3927'));
  assert.ok(data.ports.some((p) => p.port === 631 && p.service === 'ipp'));
  assert.ok(data.wu.some((x) => x.code === '0x80240022' && x.name === 'WU_E_ALL_UPDATES_FAILED'));
  assert.equal(data.wu.find((x) => x.code === '0x80070422').name, 'ERROR_SERVICE_DISABLED', 'the named entry wins over the unnamed one');
  assert.ok(data.win.some((w) => w.build === 22631 && w.version === '23H2' && w.product === 'Windows 11'));
});

test('IPv4 parsing: strict dotted quads only', () => {
  assert.deepEqual(R.parseIPv4('192.168.1.20'), [192, 168, 1, 20]);
  for (const bad of ['256.1.1.1', '1.2.3', '1.2.3.4.5', '01.2.3.4', '1.2.3.-4', 'a.b.c.d', '', '1.2.3.4 ; rm', '1..2.3']) assert.equal(R.parseIPv4(bad), null, bad);
});

test('IPv6 parsing: compression, IPv4 tail, zone, brackets; rejects nonsense', () => {
  assert.deepEqual(R.parseIPv6('::1'), [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
  assert.deepEqual(R.parseIPv6('fe80::1%eth0').slice(0, 2), [0xfe, 0x80]);
  assert.deepEqual(R.parseIPv6('[2001:db8::ff]').slice(0, 4), [0x20, 0x01, 0x0d, 0xb8]);
  assert.deepEqual(R.parseIPv6('::ffff:192.168.1.1').slice(10), [0xff, 0xff, 192, 168, 1, 1]);
  assert.deepEqual(R.parseIPv6('1:2:3:4:5:6:7:8').length, 16);
  for (const bad of ['1:2:3:4:5:6:7', '1::2::3', ':::', 'g::1', '1:2:3:4:5:6:7:8:9', '12345::', '::1.2.3', 'fe80', '1:2:3:4:5:6:7::8']) assert.equal(R.parseIPv6(bad), null, bad);
});

test('IP ranges: most specific registry entry wins, public addresses match none', () => {
  const r4 = (a) => R.ipRange(R.parseIPv4(a), data.ip.v4);
  assert.equal(r4('169.254.12.7').block, '169.254.0.0/16');
  assert.equal(r4('192.168.1.20').name, 'Private-Use');
  assert.equal(r4('172.31.255.255').block, '172.16.0.0/12');
  assert.equal(r4('172.32.0.1'), null);
  assert.equal(r4('100.64.0.1').block, '100.64.0.0/10');
  assert.equal(r4('100.128.0.1'), null);
  assert.equal(r4('0.0.0.0').block, '0.0.0.0/32');
  assert.equal(r4('192.0.0.9').block, '192.0.0.9/32');
  assert.equal(r4('224.0.0.251').name, 'Multicast');
  assert.equal(r4('8.8.8.8'), null);
  const r6 = (a) => R.ipRange(R.parseIPv6(a), data.ip.v6);
  assert.equal(r6('fe80::1').block, 'fe80::/10');
  assert.equal(r6('fd12:3456::1').block, 'fc00::/7');
  assert.equal(r6('::1').block, '::1/128');
  assert.equal(r6('ff02::fb').name, 'Multicast');
  assert.equal(r6('2a00:1450:4001::1'), null);
});

test('classify: each kind, ambiguous numbers, and rejection of everything else', () => {
  assert.deepEqual(R.classify(' net::err_name_not_resolved '), [{ kind: 'chrome', key: 'ERR_NAME_NOT_RESOLVED' }]);
  assert.deepEqual(R.classify('DNS_PROBE_FINISHED_NXDOMAIN'), [{ kind: 'chrome', key: 'DNS_PROBE_FINISHED_NXDOMAIN' }]);
  assert.deepEqual(R.classify('-105'), [{ kind: 'chrome', key: -105 }]);
  assert.deepEqual(R.classify('0x8024402f'), [{ kind: 'wu', key: '0x8024402F' }]);
  assert.deepEqual(R.classify('404').map((c) => c.kind), ['http', 'port']);
  assert.deepEqual(R.classify('631').map((c) => c.kind), ['port']);
  assert.deepEqual(R.classify('HTTP 503'), [{ kind: 'http', key: 503 }]);
  assert.deepEqual(R.classify('26100.4946'), [{ kind: 'winbuild', key: 26100, rev: 4946 }]);
  assert.deepEqual(R.classify('10.0.22631.4460'), [{ kind: 'winbuild', key: 22631, rev: 4460 }]);
  assert.deepEqual(R.classify('19045').map((c) => c.kind), ['winbuild', 'port']);
  assert.deepEqual(R.classify('fe80::1'), [{ kind: 'ip', key: 'fe80::1' }]);
  assert.deepEqual(R.classify('9100'), [{ kind: 'port', key: 9100 }]);
  for (const junk of ['', '   ', 'hello', '<img src=x onerror=alert(1)>', 'javascript:alert(1)', '=1+1', '700000', '0x123', 'ERR_', "'; DROP TABLE", 'a'.repeat(200), '1.2.3']) assert.deepEqual(R.classify(junk), [], junk);
});

test('lookup: Chrome codes by name and number, DNS probe, unknown code', () => {
  const r = one('ERR_NAME_NOT_RESOLVED');
  assert.equal(r.found, true);
  assert.equal(r.title, 'ERR_NAME_NOT_RESOLVED (-105)');
  assert.equal(r.next.href, '/diagnose/site-cant-be-reached/');
  assert.equal(one('-105').title, r.title);
  const p = one('dns_probe_finished_nxdomain');
  assert.equal(p.found, true);
  assert.match(p.meaning, /name does not exist/);
  const cert = one('ERR_CERT_AUTHORITY_INVALID');
  assert.match(cert.meaning, /Do not click through/);
  const range = one('ERR_CACHE_MISS');
  assert.match(range.meaning, /cache/);
  assert.match(range.ext.href, /^https:\/\/chromium\.googlesource\.com\//, 'unexplained codes link to the source instead of quoting it');
  assert.equal(r.ext, undefined);
  const none = one('ERR_THIS_DOES_NOT_EXIST');
  assert.equal(none.found, false);
  assert.match(none.meaning, /not in Chromium’s list/);
  // every code of the list gets a result with a meaning
  for (const e of data.chrome) { const x = one(e.name); assert.ok(x.found && x.meaning, e.name); }
});

test('lookup: no certificate advice ever suggests a way round a warning', () => {
  for (const e of data.chrome.filter((x) => x.range === 'Certificate')) {
    const m = one(e.name).meaning;
    assert.match(m, /[Dd]o not click through/, e.name);
    assert.doesNotMatch(m, /proceed|bypass|thisisunsafe|Advanced/i, e.name);
  }
});

test('lookup: HTTP, ports, Windows Update, Windows builds', () => {
  // ambiguous numbers: only the readings that exist
  assert.equal(one('404').title, 'HTTP 404 Not Found');
  assert.equal(one('443').kind, 'port');
  assert.equal(one('19045').kind, 'winbuild');
  assert.deepEqual(R.lookup(data, '500', '2026-11-18').map((r) => r.kind), ['http', 'port'], '500 is a status and a registered port');
  assert.equal(one('299').found, false);
  assert.match(one('511').meaning, /network you are on/);
  assert.match(one('407').meaning, /proxy/);
  assert.equal(one('HTTP 599').found, false);
  assert.match(one('HTTP 599').meaning, /not assigned/);
  const ipp = one('631');
  assert.equal(ipp.found, true);
  assert.ok(ipp.lines.some((l) => /^ipp /.test(l.k)));
  const wu = one('0x80070422');
  assert.equal(wu.found, true);
  assert.match(wu.ext.href, /^https:\/\/learn\.microsoft\.com\/.*#0x80070422$/);
  assert.deepEqual(wu.lines.map((l) => l.k), ['Official name', 'Next safe step']);
  assert.equal(wu.lines[0].v, 'ERROR_SERVICE_DISABLED');
  for (const l of wu.lines) assert.ok(l.k && l.v, 'no empty heading or value');
  assert.match(one('0xC1900101').meaning, /driver/);
  const plain = one('0x80243FFF'); // in Microsoft's list, not in our selection: name + link only
  assert.equal(plain.found, true);
  assert.equal(plain.lines.length, 1);
  assert.match(plain.ext.href, /^https:\/\/learn\.microsoft\.com\//);
  const miss = one('0x12345678');
  assert.equal(miss.found, false);
  assert.doesNotMatch(miss.meaning, /general Windows errors|passed through/);
  for (const x of data.wu) { const res = one(x.code); for (const l of res.lines) assert.ok(l.k && l.v, x.code); }
  const w = one('22631.1');
  assert.equal(w.found, true);
  assert.match(w.lines[0].v, /Windows 11, version 23H2/);
  assert.match(w.meaning, /updates are waiting/);
  assert.equal(R.lookup(data, '11111', '2026-11-18')[0].found, false);
});

test('lookup: Windows end-of-updates text follows the date', () => {
  const cur = data.win.find((x) => x.rows[0] && /^\d{4}/.test(x.rows[0].endHome));
  const before = R.lookup(data, String(cur.build), '2000-01-01')[0];
  const after = R.lookup(data, String(cur.build), '2999-01-01')[0];
  assert.match(before.meaning, /serviced for Home and Pro editions until/);
  assert.match(after.meaning, /has passed/);
});

test('lookup: IP addresses – meaning per range, never shareable', () => {
  const ll = one('169.254.12.7');
  assert.equal(ll.share, false);
  assert.match(ll.meaning, /no DHCP server/);
  assert.equal(ll.next.href, '/diagnose/wifi-connected-no-internet/');
  assert.match(one('192.168.1.20').meaning, /private address/);
  assert.match(one('100.72.3.9').meaning, /carrier-grade NAT/);
  assert.match(one('8.8.8.8').meaning, /public IPv4 address/);
  assert.match(one('2a00:1450:4001::1').meaning, /public \(global\) IPv6/);
  assert.match(one('192.0.2.1').meaning, /examples in manuals/);
  assert.match(one('fe80::1').meaning, /link-local/);
  assert.equal(R.shareQuery('192.168.1.20'), '');
  assert.equal(R.shareQuery('fe80::1'), '');
  assert.equal(R.readShare('#q=192.168.1.20'), '', 'an address in a link is ignored');
});

test('lookup results hold plain strings only (rendered with textContent)', () => {
  for (const q of ['ERR_NAME_NOT_RESOLVED', '404', '631', '0x80070422', '22631.5', '10.1.2.3', 'fe80::1', 'DNS_PROBE_STARTED']) {
    for (const r of R.lookup(data, q, '2026-11-18')) {
      for (const v of [r.title, r.meaning, r.source].concat(r.lines.map((l) => l.k + l.v))) assert.equal(typeof v, 'string');
      for (const o of [r.next, r.page, r.ext]) if (o) assert.match(o.href, /^(\/[a-z0-9\/-]*|https:\/\/learn\.microsoft\.com\/[^\s"<>]*)$/);
    }
  }
});

test('share links: only codes and numbers, decoded safely', () => {
  assert.equal(R.shareQuery(' ERR_FAILED '), 'q=ERR_FAILED');
  assert.equal(R.shareQuery('<script>'), '');
  assert.equal(R.readShare('#q=ERR_NAME_NOT_RESOLVED'), 'ERR_NAME_NOT_RESOLVED');
  assert.equal(R.readShare('#q=0x80070422&x=1'), '0x80070422');
  assert.equal(R.readShare('#q=%3Cscript%3Ealert(1)%3C%2Fscript%3E'), '');
  assert.equal(R.readShare('#q=%E0%A4%A'), '', 'broken percent-encoding');
  assert.equal(R.readShare('#s=0.1'), '');
  assert.equal(R.readShare(''), '');
});

test('CSV: quoting, and = + - @ at the start of a cell are defused', () => {
  assert.equal(R.csvCell('plain'), '"plain"');
  assert.equal(R.csvCell('say "hi"'), '"say ""hi"""');
  assert.equal(R.csvCell('=1+1'), '"\'=1+1"');
  assert.equal(R.csvCell('+49'), '"\'+49"');
  assert.equal(R.csvCell('-105'), '"-105"', 'a plain negative number is not a formula');
  assert.equal(R.csvCell('-1.5'), '"-1.5"');
  assert.equal(R.csvCell('-105+cmd'), '"\'-105+cmd"');
  assert.equal(R.csvCell('-'), '"\'-"');
  assert.equal(R.csvCell('-1e5'), '"\'-1e5"');
  assert.equal(R.csvCell('@SUM(A1)'), '"\'@SUM(A1)"');
  assert.equal(R.csvCell('\t=cmd'), '"\'\t=cmd"');
  assert.equal(R.csvCell(null), '""');
  assert.equal(R.toCsv([['a', 'b,c'], ['-1', 'x\ny'], ['-x', '']]), '"a","b,c"\r\n"-1","x\ny"\r\n"\'-x",""\r\n');
});

test('table filter: every word must occur, case-insensitive', () => {
  assert.equal(R.matches('ERR_NAME_NOT_RESOLVED -105 Connection', 'name conn'), true);
  assert.equal(R.matches('ERR_NAME_NOT_RESOLVED', 'timeout'), false);
  assert.equal(R.matches('anything', '   '), true);
});

test('built pages: tables carry every row of the data', () => {
  const page = (p) => fs.readFileSync(path.join(__dirname, '..', 'docs', 'reference', p, 'index.html'), 'utf8');
  const rows = (html, id) => ((html.match(new RegExp('<table id="' + id + '">[\\s\\S]*?</table>')) || [''])[0].match(/<tr>/g) || []).length - 1;
  assert.equal(rows(page('chrome-error-codes'), 't-own'), Object.keys(data.advice.chrome).length);
  assert.equal(rows(page('chrome-error-codes'), 't-probe'), data.probe.length);
  assert.equal(rows(page('http-status-codes'), 't-http'), data.http.length);
  const sel = data.wu.filter((x) => x.meaning);
  assert.ok(sel.length >= 30 && sel.length <= 40, 'selection of 30 to 40 codes');
  assert.equal(rows(page('windows-update-error-codes'), 't-wu'), sel.length);
  assert.equal(rows(page('network-ports'), 't-ports'), data.ports.length);
  assert.equal(rows(page('ip-address-check'), 't-ip4'), data.ip.v4.length);
  assert.equal(rows(page('ip-address-check'), 't-ip6'), data.ip.v6.length);
  assert.equal(rows(page('windows-macos-versions'), 't-win'), data.win.length);
  assert.equal(rows(page('troubleshooting-shortcuts'), 't-keys'), src('shortcuts.json').length);
});

test('no source prose is shipped: lookup data and pages carry identifiers and our own texts only', () => {
  for (const e of data.chrome) assert.deepEqual(Object.keys(e).sort(), ['code', 'name', 'range']);
  for (const e of data.probe) assert.deepEqual(Object.keys(e), ['name']);
  for (const x of data.wu) assert.ok(!('desc' in x) && !('message' in x), x.code);
  for (const f of ['chrome-net-errors.json', 'chrome-dns-probe.json', 'wu-errors.json', 'shortcuts.json']) for (const e of src(f)) assert.ok(!('desc' in e), f);
  const raw = JSON.stringify(data);
  // sentences that only exist in the sources' own wording
  for (const s of ['The host name could not be resolved', 'TODO(', 'This could mean', 'so the domain must not exist', 'Open Task Manager.', 'Force quit an app', 'Automatic Updates was unable to service', 'CC BY']) {
    assert.ok(!raw.includes(s), 'lookup.json: ' + s);
    for (const p of ['chrome-error-codes', 'windows-update-error-codes', 'troubleshooting-shortcuts', 'http-status-codes']) {
      const html = fs.readFileSync(path.join(__dirname, '..', 'docs', 'reference', p, 'index.html'), 'utf8');
      assert.ok(!html.includes(s), p + ': ' + s);
    }
  }
  const chromePage = fs.readFileSync(path.join(__dirname, '..', 'docs', 'reference', 'chrome-error-codes', 'index.html'), 'utf8');
  assert.ok(!/id="t-chrome"/.test(chromePage), 'the full list of 249 codes is not a table on the page');
  assert.match(chromePage, /href="https:\/\/chromium\.googlesource\.com\/chromium\/src\/\+\/main\/LICENSE"/);
  assert.match(chromePage, /Copyright The Chromium Authors/);
});

test('Windows Update selection: every code is documented by Microsoft and has its own text and link', () => {
  const srcCodes = new Set(src('wu-errors.json').map((x) => x.code));
  const sel = data.wu.filter((x) => x.meaning);
  for (const x of sel) {
    assert.ok(srcCodes.has(x.code), x.code);
    assert.ok(x.meaning.length > 30 && x.next.length > 30, x.code);
    assert.match(x.url, /^https:\/\/learn\.microsoft\.com\/en-us\//, x.code);
    assert.doesNotMatch(x.next, /download(ed)? (a |the )?(tool|fixer|repair program)/i);
  }
  for (const must of ['0x80070422', '0xC1900101']) assert.ok(sel.some((x) => x.code === must), must);
});

test('macOS table: version switcher column from the first number of Apple’s name', async () => {
  const m = await import('../src/reference.mjs');
  assert.equal(m.macMajor('macOS 27 Golden Gate'), 27);
  assert.equal(m.macMajor('macOS Tahoe 26'), 26);
  assert.equal(m.macMajor('macOS Catalina 10.15'), 10.15);
  assert.equal(m.macMajor('Mac OS X Cheetah 10'), 10);
  assert.ok(m.macVersions.length >= 20);
  for (const v of m.macVersions) {
    const major = m.macMajor(v.name);
    assert.ok(!Number.isNaN(major), v.name);
    assert.equal(Math.floor(parseFloat(v.latest)), Math.floor(major), v.name + ': name and latest version agree');
    assert.match(m.macColumn(v.name), major >= 13 ? /Ventura or later/ : /Monterey or earlier/, v.name);
  }
  const html = fs.readFileSync(path.join(__dirname, '..', 'docs', 'reference', 'windows-macos-versions', 'index.html'), 'utf8');
  assert.match(html, /macOS 27 Golden Gate<\/th><td>[\d.]+<\/td><td>macOS 13 Ventura or later/);
  // Windows rows in descending build order
  const builds = [...html.match(/<table id="t-win">[\s\S]*?<\/table>/)[0].matchAll(/<th scope="row"><b>(\d+)<\/b>/g)].map((x) => +x[1]);
  assert.deepEqual(builds, [...builds].sort((a, b) => b - a));
  assert.ok(builds.includes(28000) && builds.includes(26300));
});
