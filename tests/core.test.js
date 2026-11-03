// Unit tests: decision-tree engine, fix log, version logic, consent decision, no-innerHTML rule.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const C = require('../docs/assets/js/core.js');
const K = require('../docs/assets/js/consent.js');

const TREES = path.join(__dirname, '..', 'src', 'trees');
const trees = fs.readdirSync(TREES).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(fs.readFileSync(path.join(TREES, f), 'utf8')));

test('there are at least the four required diagnoses', () => {
  const ids = trees.map((t) => t.id);
  for (const id of ['wifi-no-internet', 'one-website', 'printer-offline-win', 'laptop-wifi']) assert.ok(ids.includes(id), id);
});

for (const t of trees) {
  test(`tree ${t.id}: valid structure`, () => assert.deepEqual(C.validateTree(t), []));
  test(`tree ${t.id}: every path ends in a result or stop, and the map changes`, () => {
    const runs = C.allRuns(t);
    assert.ok(runs.length >= 5, 'enough branches');
    for (const r of runs) {
      const end = t.nodes[r.end];
      assert.ok(end.type === 'result' || end.type === 'stop', r.end);
      assert.equal(r.state.done, true);
      const log = C.fixLog(t, r.state, { version: 'win11', notes: 'note-xyz', date: 'D' });
      assert.match(log, /CHECKS AND ANSWERS/);
      assert.match(log, end.type === 'stop' ? /HARD STOP/ : /RESULT/);
      assert.match(log, /note-xyz/);
      r.answers.forEach((a, i) => assert.ok(log.includes(t.nodes[r.state.path[i].node].answers[a].label)));
    }
  });
  test(`tree ${t.id}: setting and last-resort steps carry an undo`, () => {
    for (const [id, s] of Object.entries(t.steps)) if (s.risk === 'setting' || s.risk === 'last') assert.ok(s.undo && s.undo.length > 20, id);
  });
}

test('layer map: answers clear and suspect layers, results mark likely', () => {
  const t = trees.find((x) => x.id === 'wifi-no-internet');
  let st = C.replay(t, []);
  assert.equal(st.layers.service, 'open');
  st = C.choose(t, st, 0); // everything fails
  assert.equal(st.layers.service, 'clear');
  st = C.choose(t, st, 1); // home network
  st = C.choose(t, st, 1); // other devices fail too
  assert.equal(st.layers.device, 'clear');
  assert.equal(st.layers.router, 'suspect');
  st = C.choose(t, st, 0); // lights normal
  st = C.choose(t, st, 0); // restart helped
  assert.equal(st.node, 'r_router_fixed');
  assert.equal(st.layers.router, 'likely');
  const b = C.back(t, st);
  assert.equal(b.node, 'q_restart');
  assert.equal(b.layers.router, 'suspect');
});

test('wifi: r_device (blames this device) is reachable only after "Yes – other devices work"', () => {
  const t = trees.find((x) => x.id === 'wifi-no-internet');
  const runs = C.allRuns(t).filter((r) => r.end === 'r_device');
  assert.ok(runs.length > 0);
  for (const r of runs) {
    const atOthers = r.state.path.find((p) => p.node === 'q_others');
    assert.ok(atOthers, 'path passes q_others');
    assert.equal(t.nodes.q_others.answers[atOthers.answer].label, 'Yes – other devices work');
  }
  // the "no other device" branch ends neutral, never in r_device
  const solo = C.allRuns(t).filter((r) => r.state.path.some((p) => p.node === 'q_others' && t.nodes.q_others.answers[p.answer].label.startsWith('I have no other')));
  assert.ok(solo.length > 0);
  for (const r of solo) assert.notEqual(r.end, 'r_device');
});

test('chrome: failing in every browser does not rule out the device', () => {
  const t = trees.find((x) => x.id === 'site-cant-be-reached');
  const a = t.nodes.q_browser.answers[1];
  assert.ok(!(a.clear || []).includes('device'));
});

test('replay ignores invalid saved answers', () => {
  const t = trees[0];
  const st = C.replay(t, [0, 99, 'x']);
  assert.equal(st.answers.length, 1);
});

test('one-website: a certificate warning is a hard stop with safe actions and no bypass advice', () => {
  const t = trees.find((x) => x.id === 'one-website');
  const st = C.replay(t, [0]);
  const n = t.nodes[st.node];
  assert.equal(n.type, 'stop');
  assert.ok(n.safe.length >= 4);
  const all = JSON.stringify(n).toLowerCase();
  assert.ok(/never click/.test(all));
  for (const s of n.safe) assert.ok(!/click (advanced|proceed)|continue to the site|accept the risk and/i.test(s), s);
});

test('resolvePath: exact, sibling and family fallback', () => {
  const p = { win11: 'A', win10: 'B', macnew: 'C' };
  assert.deepEqual([C.resolvePath(p, 'win10').text, C.resolvePath(p, 'win10').fallback], ['B', false]);
  assert.equal(C.resolvePath({ win11: 'A' }, 'win10').text, 'A');
  assert.equal(C.resolvePath({ win11: 'A' }, 'win10').fallback, true);
  assert.equal(C.resolvePath({ macnew: 'C' }, 'macold').text, 'C');
  assert.equal(C.resolvePath({ win11: 'A', macnew: 'C' }, 'ios').text, 'A');
  assert.equal(C.resolvePath(null, 'win11'), null);
});

test('fix log uses the chosen version and only matching commands', () => {
  const t = trees.find((x) => x.id === 'wifi-no-internet');
  const run = C.allRuns(t).find((r) => r.end === 'r_dns');
  const win = C.fixLog(t, run.state, { version: 'win10' });
  assert.match(win, /ipconfig \/flushdns/);
  assert.doesNotMatch(win, /dscacheutil/);
  const mac = C.fixLog(t, run.state, { version: 'macold' });
  assert.match(mac, /dscacheutil/);
  assert.doesNotMatch(mac, /ipconfig/);
});

test('suggestVersion reads only what the browser reliably reports', () => {
  const win = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
  assert.equal(C.suggestVersion({ ua: win, platformVersion: '15.0.0' }), 'win11');
  assert.equal(C.suggestVersion({ ua: win, platformVersion: '13.0.0' }), 'win11');
  assert.equal(C.suggestVersion({ ua: win, platformVersion: '10.0.0' }), 'win10');
  assert.equal(C.suggestVersion({ ua: win, platformVersion: '1.0.0' }), 'win10');
  assert.equal(C.suggestVersion({ ua: win, platformVersion: '11.0.0' }), null);
  assert.equal(C.suggestVersion({ ua: win, platformVersion: null }), null);
  assert.equal(C.suggestVersion({ ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', maxTouchPoints: 0 }), 'macnew');
  assert.equal(C.suggestVersion({ ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', maxTouchPoints: 5 }), 'ios');
  assert.equal(C.suggestVersion({ ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)' }), 'ios');
  assert.equal(C.suggestVersion({ ua: 'Mozilla/5.0 (Linux; Android 15; Pixel 9)' }), 'android');
  assert.equal(C.suggestVersion({ ua: 'Mozilla/5.0 (X11; Linux x86_64)' }), null);
});

// ---------- consent ----------
const GDPR_OK = { gdprApplies: true, eventStatus: 'useractioncomplete', purpose: { consents: { 1: true } }, vendor: { consents: { 755: true } } };
const ALL = (v) => ({ adStoragePurposeConsentStatus: v, adUserDataPurposeConsentStatus: v, adPersonalizationPurposeConsentStatus: v, analyticsStoragePurposeConsentStatus: v });

test('consent: nothing known -> all denied', () => {
  assert.deepEqual(K.decideConsent(null, null, null), K.allDenied());
  assert.deepEqual(K.decideConsent(GDPR_OK, null, null), K.allDenied());
});
test('consent: GDPR with purpose 1 + Google + granted -> granted', () => {
  assert.equal(K.decideConsent(GDPR_OK, ALL(1), null).analytics_storage, 'granted');
  assert.equal(K.decideConsent(GDPR_OK, ALL(1), null).ad_storage, 'granted');
});
test('consent: GDPR, NOT_APPLICABLE is not enough', () => {
  assert.equal(K.decideConsent(GDPR_OK, ALL(3), null).analytics_storage, 'denied');
});
test('consent: GDPR missing purpose 1, Google vendor, or TCF not loaded -> denied', () => {
  assert.deepEqual(K.decideConsent({ ...GDPR_OK, purpose: { consents: { 1: false } } }, ALL(1), 1), K.allDenied());
  assert.deepEqual(K.decideConsent({ ...GDPR_OK, vendor: { consents: {} } }, ALL(1), 1), K.allDenied());
  assert.deepEqual(K.decideConsent({ ...GDPR_OK, eventStatus: 'cmpuishown' }, ALL(1), 1), K.allDenied());
  assert.deepEqual(K.decideConsent({ ...GDPR_OK, gdprApplies: undefined, purpose: {} }, ALL(1), 1), K.allDenied());
});
test('consent: outside GDPR needs a U.S. status of 1 or 2', () => {
  const out = { gdprApplies: false };
  assert.equal(K.decideConsent(out, ALL(3), 1).analytics_storage, 'granted');
  assert.equal(K.decideConsent(out, ALL(1), 2).analytics_storage, 'granted');
  assert.deepEqual(K.decideConsent(out, ALL(1), null), K.allDenied());
  assert.deepEqual(K.decideConsent(out, ALL(1), 3), K.allDenied());
  assert.equal(K.decideConsent(out, ALL(2), 1).analytics_storage, 'denied');
});
test('consent: mixed values are decided per purpose', () => {
  const mv = { ...ALL(1), analyticsStoragePurposeConsentStatus: 2 };
  const d = K.decideConsent(GDPR_OK, mv, null);
  assert.equal(d.ad_storage, 'granted');
  assert.equal(d.analytics_storage, 'denied');
});

test('site JavaScript never writes HTML strings (textContent only)', () => {
  const dir = path.join(__dirname, '..', 'docs', 'assets', 'js');
  for (const f of fs.readdirSync(dir)) {
    const src = fs.readFileSync(path.join(dir, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    assert.doesNotMatch(src, /innerHTML|outerHTML|insertAdjacentHTML|document\.write/, f);
  }
});

test('ad slot IDs are all empty until AdSense units exist', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'docs', 'assets', 'js', 'site.js'), 'utf8');
  const block = src.match(/var SLOTS = \{([\s\S]*?)\};/)[1];
  for (const m of block.matchAll(/(\w+):\s*'([^']*)'/g)) assert.equal(m[2], '', m[1]);
});

// ---------- C1: commands only for the selected platform ----------
test('fix log: mobile platforms get no terminal commands, but the settings path or a note', () => {
  const t = trees.find((x) => x.id === 'wifi-no-internet');
  const run = C.allRuns(t).find((r) => r.end === 'r_dns');
  for (const v of ['ios', 'android']) {
    const log = C.fixLog(t, run.state, { version: v });
    assert.doesNotMatch(log, /Command \(/, v);
    assert.doesNotMatch(log, /ipconfig \/flushdns|dscacheutil|ping -[nc] 4|nslookup example\.com\n/, v);
    assert.match(log, /No terminal command on (iPhone \/ iPad|Android)/, v);
  }
  // every tree, every run, every version: commands only of the selected family
  for (const tr of trees) for (const r of C.allRuns(tr)) for (const v of C.ORDER) {
    const log = C.fixLog(tr, r.state, { version: v });
    const fam = C.family(v);
    if (!fam) assert.doesNotMatch(log, /Command \(/, `${tr.id} ${r.end} ${v}`);
    if (fam === 'win') assert.doesNotMatch(log, /Command \(macOS\)/);
    if (fam === 'mac') assert.doesNotMatch(log, /Command \(Windows\)/);
  }
});

test('commandsFor/mobileNote: only the selected platform, nothing for phones and unknown', () => {
  const s = { cmds: [{ os: 'win', code: 'ipconfig' }, { os: 'mac', code: 'ifconfig' }], paths: { win11: 'A', ios: 'Settings > Wi-Fi' } };
  assert.deepEqual(C.commandsFor(s, 'win10').map((c) => c.code), ['ipconfig']);
  assert.deepEqual(C.commandsFor(s, 'macold').map((c) => c.code), ['ifconfig']);
  assert.deepEqual(C.commandsFor(s, 'ios'), []);
  assert.deepEqual(C.commandsFor(s, 'android'), []);
  assert.deepEqual(C.commandsFor(s, null), []);
  assert.match(C.mobileNote(s, 'ios'), /settings path: Settings > Wi-Fi/);
  assert.match(C.mobileNote(s, 'android'), /no command line/);
  assert.equal(C.mobileNote(s, 'win11'), '');
  assert.equal(C.mobileNote({ paths: { ios: 'x' } }, 'ios'), '');
});

test('page script hides every command block (and its copy button) on phones and tablets', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'docs', 'assets', 'js', 'site.js'), 'utf8');
  assert.match(src, /cmds\[j\]\.hidden = fam === 'none' \|\| cmds\[j\]\.getAttribute\('data-os'\) !== fam;/);
});

// ---------- C2: safety information in TXT and print ----------
test('fix log: every listed step carries its risk label, meaning and undo', () => {
  for (const t of trees) for (const r of C.allRuns(t)) {
    const log = C.fixLog(t, r.state, { version: 'win11' });
    const listed = r.state.path.flatMap((p) => t.nodes[p.node].steps || []).concat(t.nodes[r.end].steps || []);
    for (const id of listed) {
      const s = t.steps[id];
      assert.ok(log.includes(s.title + ' [' + C.RISKS[s.risk]), `${t.id} ${id} title+risk`);
      assert.ok(log.includes('Risk: ' + C.RISKS[s.risk] + ' – '), `${t.id} ${id} risk meaning`);
      if (s.undo) assert.ok(log.replace(/\s+/g, ' ').includes('Undo: ' + s.undo.replace(/\s+/g, ' ')), `${t.id} ${id} undo`);
    }
    const n = listed.length;
    assert.ok((log.match(/ Undo: /g) || []).length >= n, `${t.id} ${r.end} undo per step`);
  }
});

test('fix log: certificate hard stop puts a stop notice at the top and keeps safe actions', () => {
  const t = trees.find((x) => x.id === 'one-website');
  const st = C.replay(t, [0]);
  const log = C.fixLog(t, st, { version: 'ios' });
  assert.match(log, /!! STOP NOTICE: The browser cannot confirm this site is genuine/);
  assert.ok(log.indexOf('STOP NOTICE') < log.indexOf('LAYER MAP'));
  assert.match(log.replace(/\s+/g, ' '), /do not bypass the warning/);
  assert.match(log, /HARD STOP: /);
  assert.match(log, /Safe actions:/);
  // print uses the same text as the download
  const ui = fs.readFileSync(path.join(__dirname, '..', 'docs', 'assets', 'js', 'diagnose.js'), 'utf8');
  assert.match(ui, /area\.appendChild\(el\('pre', null, logText\(\)\)\)/);
  assert.match(ui, /new Blob\(\[logText\(\)\]/);
  // not a stop -> no stop notice
  const ok = C.allRuns(t).find((r) => t.nodes[r.end].type === 'result');
  assert.doesNotMatch(C.fixLog(t, ok.state, {}), /STOP NOTICE/);
});

// ---------- C3: privacy settings button ----------
function stubFc({ status, withEnum = true, optOut = false, throwOn } = {}) {
  const calls = [];
  const fc = {
    showRevocationMessage() { calls.push('revocation'); if (throwOn === 'revocation') throw new Error('x'); }
  };
  if (status !== undefined) {
    fc.usstatesoptout = {
      getInitialUsStatesOptOutStatus() { if (throwOn === 'status') throw new Error('x'); return status; },
      openConfirmationDialog(cb) { calls.push('us'); cb(optOut); }
    };
    if (withEnum) fc.usstatesoptout.InitialUsStatesOptOutStatusEnum = { UNKNOWN: 0, DOES_NOT_APPLY: 1, NOT_OPTED_OUT: 2, OPTED_OUT: 3 };
  }
  return { fc, calls };
}
test('privacy settings: U.S. regulation applies -> U.S. opt-out dialog, callback gets the choice', () => {
  for (const status of [0, 2, 3]) {
    const { fc, calls } = stubFc({ status, optOut: true });
    let got = null;
    assert.equal(K.openPrivacyChoices(fc, (o) => { got = o; }), 'us');
    assert.deepEqual(calls, ['us']);
    assert.equal(got, true);
  }
  const { fc } = stubFc({ status: 2, withEnum: false, optOut: false });
  let got = null;
  assert.equal(K.openPrivacyChoices(fc, (o) => { got = o; }), 'us');
  assert.equal(got, false);
  // an opted-out visitor stays denied when consent is re-applied
  assert.deepEqual(K.decideConsent({ gdprApplies: false }, ALL(1), K.US_OPTED_OUT), K.allDenied());
});
test('privacy settings: DOES_NOT_APPLY, no U.S. API or errors -> GDPR revocation message', () => {
  for (const opt of [{ status: 1 }, { status: 1, withEnum: false }, {}, { status: 2, throwOn: 'status' }]) {
    const { fc, calls } = stubFc(opt);
    assert.equal(K.openPrivacyChoices(fc, () => {}), 'revocation', JSON.stringify(opt));
    assert.deepEqual(calls, ['revocation']);
  }
  // enum value from the CMP wins over the default 1
  const { fc, calls } = stubFc({ status: 1 });
  fc.usstatesoptout.InitialUsStatesOptOutStatusEnum = { DOES_NOT_APPLY: 7 };
  assert.equal(K.openPrivacyChoices(fc, () => {}), 'us');
  assert.deepEqual(calls, ['us']);
  // nothing reachable / throwing -> never throws
  assert.equal(K.openPrivacyChoices(undefined, () => {}), 'none');
  assert.equal(K.openPrivacyChoices(stubFc({ throwOn: 'revocation' }).fc, () => {}), 'none');
});

// ---------- G: no Google script on local hosts ----------
test('isLocalHost: localhost, 127.0.0.1, ::1, file: and ?stats_test=1 are local', () => {
  for (const [h, p] of [['localhost', 'http:'], ['127.0.0.1', 'http:'], ['::1', 'http:'], ['[::1]', 'http:'], ['', 'file:']]) assert.equal(K.isLocalHost(h, p, ''), true, h + p);
  assert.equal(K.isLocalHost('clicksolveguide.com', 'https:', '?stats_test=1'), true);
  assert.equal(K.isLocalHost('clicksolveguide.com', 'https:', '?a=1&stats_test=1'), true);
  assert.equal(K.isLocalHost('clicksolveguide.com', 'https:', '?stats_test=10'), false);
  for (const h of ['clicksolveguide.com', 'www.clicksolveguide.com', '127.0.0.2']) assert.equal(K.isLocalHost(h, 'https:', ''), false, h);
});
test('head guard + inline AdSense loader: async crossorigin tag only on the real host without stats_test', () => {
  const vm = require('node:vm');
  const html = fs.readFileSync(path.join(__dirname, '..', 'docs', 'index.html'), 'utf8');
  const guard = html.match(/<script>(window\.CSG_NO_GOOGLE=[\s\S]*?)<\/script>/)[1];
  const loader = html.match(/<script data-ads-loader>([\s\S]*?)<\/script>/)[1];
  const run = (hostname, protocol, search = '', store = {}) => {
    const added = [];
    const window = {};
    const ctx = { document: { createElement: () => ({}), head: { appendChild: (s) => added.push(s) } }, location: { hostname, protocol, search },
      sessionStorage: { setItem: (k, v) => { store[k] = v; }, getItem: (k) => (k in store ? store[k] : null) }, window };
    window.document = ctx.document;
    vm.createContext(ctx);
    vm.runInContext('var window=this;' + guard + ';' + loader, ctx);
    return added;
  };
  const prod = run('clicksolveguide.com', 'https:');
  assert.equal(prod.length, 1);
  assert.equal(prod[0].async, true);
  assert.equal(prod[0].crossOrigin, 'anonymous');
  assert.equal(prod[0].src, 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7811071715414905');
  for (const [h, p] of [['localhost', 'http:'], ['127.0.0.1', 'http:'], ['[::1]', 'http:'], ['::1', 'http:'], ['', 'file:']]) assert.equal(run(h, p).length, 0, h + p);
  const store = {};
  assert.equal(run('clicksolveguide.com', 'https:', '?stats_test=1', store).length, 0);
  assert.equal(run('clicksolveguide.com', 'https:', '', store).length, 0, 'stats_test kept for the tab');
});
test('page script guards ad and analytics loading on local hosts', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'docs', 'assets', 'js', 'site.js'), 'utf8');
  assert.match(src, /if \(LOCAL \|\| document\.querySelector\('script\[src\*="adsbygoogle\.js"\]'\)\) return;/);
  assert.match(src, /if \(gaOn \|\| LOCAL\) return;/);
});

// ---------- CS02: later U.S. opt-out changes via GPP ----------
test('GPP: opt-out state read from the current signal (stubbed __gpp listener)', () => {
  const listeners = [];
  const gpp = (cmd, cb) => { if (cmd === 'addEventListener') listeners.push(cb); };
  let status = 'unset';
  gpp('addEventListener', (evt, ok) => { if (ok) status = K.usStatusFromGpp(evt.pingData); });
  const fire = (parsedSections, extra = {}) => listeners.forEach((cb) => cb({ eventName: 'signalStatus', pingData: { signalStatus: 'ready', applicableSections: [7], parsedSections, ...extra } }, true));
  fire({ usnat: [{ SaleOptOut: 2, SharingOptOut: 2, TargetedAdvertisingOptOut: 2 }, { Gpc: false }] });
  assert.equal(status, 2);
  fire({ usnat: [{ SaleOptOut: 2, SharingOptOut: 2, TargetedAdvertisingOptOut: 1 }] }); // later change
  assert.equal(status, 3);
  fire({ usca: { SaleOptOut: 1, SharingOptOut: 2 } });
  assert.equal(status, 3);
  fire({ usnat: [{ SaleOptOut: 2, SharingOptOut: 2, TargetedAdvertisingOptOut: 2 }, { Gpc: true }] });
  assert.equal(status, 3);
  fire({ tcfeuv2: {} });
  assert.equal(status, null);
  fire({ usnat: { SaleOptOut: 2 } }, { signalStatus: 'not ready' });
  assert.equal(status, null);
  assert.equal(K.usStatusFromGpp(null), null);
});
test('GPP: without a GPP signal a U.S.-regulated visitor stays denied', () => {
  const out = { gdprApplies: false };
  assert.equal(K.effectiveUsStatus(1, null), 1); // regulation does not apply
  assert.equal(K.effectiveUsStatus(2, null), null); // initial "not opted out" alone is not enough
  assert.deepEqual(K.decideConsent(out, ALL(1), K.effectiveUsStatus(2, null)), K.allDenied());
  assert.equal(K.decideConsent(out, ALL(1), K.effectiveUsStatus(2, 2)).analytics_storage, 'granted');
  assert.deepEqual(K.decideConsent(out, ALL(1), K.effectiveUsStatus(2, 3)), K.allDenied());
  assert.deepEqual(K.decideConsent(out, ALL(1), K.effectiveUsStatus(3, 3)), K.allDenied());
});
test('page script listens to GPP and uses the effective U.S. status', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'docs', 'assets', 'js', 'site.js'), 'utf8');
  assert.match(src, /window\.__gpp\('addEventListener'/);
  assert.match(src, /C\.effectiveUsStatus\(cs\.us, cs\.gpp\)/);
});

// ---------- CS04: full step text and command conditions in TXT/print ----------
test('fix log: full step text and command conditions; network reset warns about work and restart', () => {
  const t = trees.find((x) => x.id === 'wifi-no-internet');
  const run = C.allRuns(t).find((r) => (t.nodes[r.end].steps || []).includes('s_netreset'));
  assert.ok(run, 'a result with the network reset');
  const flat = C.fixLog(t, run.state, { version: 'win11' }).replace(/\s+/g, ' ');
  assert.match(flat, /save open work first/);
  assert.match(flat, /restarts by itself after about five minutes/);
  for (const id of t.nodes[run.end].steps) assert.ok(flat.includes(t.steps[id].text.replace(/\s+/g, ' ')), id + ' text');
  const dns = C.allRuns(t).find((r) => r.end === 'r_dns');
  const log = C.fixLog(t, dns.state, { version: 'win10' }).replace(/\s+/g, ' ');
  const flush = t.steps.s_flush.cmds.find((c) => c.os === 'win');
  assert.ok(log.includes('What it does: ' + flush.what.replace(/\s+/g, ' ')));
  assert.ok(log.includes('What it does not do: ' + flush.not.replace(/\s+/g, ' ')));
});
