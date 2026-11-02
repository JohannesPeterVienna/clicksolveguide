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
