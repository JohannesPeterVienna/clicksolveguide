// Interim statistics window: pure rules in consent.js and the running page script (site.js) against a stubbed
// DOM, a stubbed clock and a missing or stubbed Google CMP (googlefc callback queue + __tcfapi).
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const K = require('../docs/assets/js/consent.js');

const JS = path.join(__dirname, '..', 'docs', 'assets', 'js');
const CONSENT_SRC = fs.readFileSync(path.join(JS, 'consent.js'), 'utf8');
const SITE_SRC = fs.readFileSync(path.join(JS, 'site.js'), 'utf8');
const CSS = fs.readFileSync(path.join(__dirname, '..', 'docs', 'assets', 'css', 'site.css'), 'utf8');
const KEY = 'csg-stats', OFF = 'ga-disable-G-T00HRG2YVF';
const DAY = 864e5;
const NOW = Date.UTC(2026, 10, 5, 12);

// ---------- tiny DOM ----------
function matches(n, sel) {
  if (!n || !n.tag) return false;
  if (sel[0] === '.') return n.className.split(/\s+/).includes(sel.slice(1));
  if (sel[0] === '#') return n.id === sel.slice(1);
  const a = sel.match(/^\[([\w-]+)\]$/);
  if (a) return a[1] in n.attrs;
  if (sel === 'header.top') return n.tag === 'header' && n.className === 'top';
  return n.tag === sel;
}
function el(tag, doc) {
  const n = {
    tag, doc, className: '', id: '', attrs: {}, children: [], parentNode: null, hidden: false, textContent: '', handlers: {},
    style: { props: {}, setProperty(k, v) { this.props[k] = v; } }, offsetHeight: 200, tabIndex: 0, type: '', href: '', title: '',
    classList: { set: new Set(), add(c) { this.set.add(c); }, remove(c) { this.set.delete(c); }, toggle(c, on) { if (on) this.set.add(c); else this.set.delete(c); }, contains(c) { return this.set.has(c); } },
    setAttribute(k, v) { this.attrs[k] = String(v); if (k === 'tabindex') this.tabIndex = Number(v); },
    getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; },
    addEventListener(ev, fn) { (this.handlers[ev] = this.handlers[ev] || []).push(fn); },
    fire(ev, e) { (this.handlers[ev] || []).forEach((fn) => fn(e)); },
    appendChild(c) { c.parentNode = this; this.children.push(c); return c; },
    insertBefore(c, ref) { c.parentNode = this; const i = this.children.indexOf(ref); if (i < 0) this.children.push(c); else this.children.splice(i, 0, c); return c; },
    get nextSibling() { const p = this.parentNode; if (!p) return null; return p.children[p.children.indexOf(this) + 1] || null; },
    all() { return this.children.flatMap((c) => [c, ...c.all()]); },
    querySelector(sel) { return this.all().find((c) => matches(c, sel)) || null; },
    querySelectorAll(sel) { return this.all().filter((c) => matches(c, sel)); },
    closest(sel) { let x = this; while (x) { if (matches(x, sel)) return x; x = x.parentNode; } return null; },
    contains(o) { let x = o; while (x) { if (x === this) return true; x = x.parentNode; } return false; },
    focus() { doc.activeElement = this; }
  };
  return n;
}
const box = (p) => p.document.body.querySelector('#statsbox');
const shown = (p) => !!box(p) && box(p).hidden === false;
const textOf = (n) => [n.textContent, ...n.children.map(textOf)].join(' ');

function page({ ads = true, stored, storage = 'ok', gpc = false, cookies = [], host = 'www.clicksolveguide.com', now = NOW } = {}) {
  const timers = []; let clock = 0;
  const calls = [], updates = [], scripts = [], cookieWrites = [];
  const store = new Map(stored === undefined ? [] : [[KEY, typeof stored === 'string' ? stored : JSON.stringify(stored)]]);
  let jar = cookies.slice();
  const document = { activeElement: null, docListeners: {} };
  Object.assign(document, {
    documentElement: null, head: null, body: null,
    createElement: (t) => el(t, document),
    getElementById: (id) => document.body.querySelector('#' + id),
    querySelector: (sel) => { const m = sel.match(/^script\[src\*="([^"]+)"\]$/); return m ? (scripts.find((s) => String(s.src).includes(m[1])) || null) : document.body.querySelector(sel); },
    querySelectorAll: (sel) => document.body.querySelectorAll(sel),
    addEventListener: (ev, fn) => { document.docListeners[ev] = fn; }
  });
  Object.defineProperty(document, 'cookie', {
    get() { return jar.join('; '); },
    set(v) {
      cookieWrites.push(v);
      const name = v.split('=')[0];
      if (/expires=Thu, 01 Jan 1970/.test(v)) jar = jar.filter((c) => c.split('=')[0] !== name);
      else if (!jar.some((c) => c.split('=')[0] === name)) jar.push(v.split(';')[0]);
    }
  });
  document.documentElement = el('html', document);
  document.documentElement.setAttribute('data-ads', ads ? 'yes' : 'no');
  document.head = el('head', document);
  document.head.appendChild = (s) => { scripts.push(s); return s; };
  document.body = el('body', document);
  const top = el('header', document); top.className = 'top'; document.body.appendChild(top);
  const main = el('main', document); main.id = 'main'; document.body.appendChild(main);
  const settings = el('button', document); settings.setAttribute('data-privacy-settings', ''); document.body.appendChild(settings);
  const localStorage = storage === 'blocked'
    ? { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); }, removeItem() { throw new Error('blocked'); } }
    : { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) };
  class FakeDate extends Date { constructor(...a) { if (a.length) super(...a); else super(now + clock); } static now() { return now + clock; } }
  const win = {
    document, localStorage, Date: FakeDate, JSON, Object, Array, String, Number, Math, isFinite, Error,
    navigator: gpc ? { globalPrivacyControl: true, userAgent: 'test' } : { userAgent: 'test' },
    location: { hostname: host, protocol: 'https:', search: '' },
    sessionStorage: localStorage,
    matchMedia: () => ({ matches: false }),
    CustomEvent: function () {},
    setTimeout: (fn, ms) => { timers.push({ at: clock + (ms || 0), fn }); return timers.length; },
    gtag: (...a) => { calls.push(a); if (a[0] === 'consent' && a[1] === 'update') updates.push(a[2]); }
  };
  win.window = win;
  const ctx = vm.createContext(win);
  vm.runInContext(CONSENT_SRC, ctx);
  vm.runInContext(SITE_SRC, ctx);
  const advance = (ms) => {
    const until = clock + ms;
    for (;;) {
      timers.sort((a, b) => a.at - b.at);
      const t = timers[0];
      if (!t || t.at > until) break;
      timers.shift(); clock = t.at; t.fn();
    }
    clock = until;
  };
  let tcf = null;
  // Google's CMP arrives: runs the queued callbacks (as googlefc does) with a stubbed __tcfapi
  const cmp = ({ tc = null, mode = null, us } = {}) => {
    win.googlefc.getGoogleConsentModeValues = () => mode;
    win.googlefc.showRevocationMessage = () => { win.revocations = (win.revocations || 0) + 1; };
    if (us !== undefined) win.googlefc.usstatesoptout = { getInitialUsStatesOptOutStatus: () => us };
    win.__tcfapi = (cmd, v, cb) => { if (cmd === 'addEventListener') { tcf = cb; if (tc) cb(tc, true); } };
    for (const item of win.googlefc.callbackQueue) {
      if (typeof item === 'function') item();
      else {
        if (item.CONSENT_API_READY) item.CONSENT_API_READY();
        if (us !== undefined && item.INITIAL_US_STATES_OPT_OUT_DATA_READY) item.INITIAL_US_STATES_OPT_OUT_DATA_READY();
      }
    }
    win.googlefc.callbackQueue = { push: (item) => { if (typeof item === 'function') item(); } };
  };
  const pick = (choice) => box(p).fire('click', { target: box(p).querySelectorAll('[data-stats-pick]').find((b) => b.getAttribute('data-stats-pick') === choice) });
  const gtm = () => scripts.filter((s) => /googletagmanager\.com\/gtag\/js/.test(s.src || ''));
  const p = {
    win, document, store, updates, calls, scripts, cookieWrites, advance, cmp, pick, gtm, settings,
    fire: (tc) => tcf(tc, true), jar: () => jar,
    clickSettings: () => settings.fire('click', { currentTarget: settings }),
    saved: () => (store.has(KEY) ? JSON.parse(store.get(KEY)) : null),
    off: () => win[OFF]
  };
  return p;
}
const hiddenTc = { gdprApplies: true, eventStatus: 'tcloaded', tcString: '', displayStatus: 'hidden', purpose: { consents: {} }, vendor: { consents: {} } };
const uiHidden = { gdprApplies: true, eventStatus: 'cmpuishown', displayStatus: 'hidden', purpose: { consents: {} }, vendor: { consents: {} } };
const decidedNo = { gdprApplies: true, eventStatus: 'useractioncomplete', tcString: 'CQ-no', purpose: { consents: { 1: false } }, vendor: { consents: { 755: false } } };
const decidedYes = { gdprApplies: true, eventStatus: 'useractioncomplete', tcString: 'CQ-yes', purpose: { consents: { 1: true } }, vendor: { consents: { 755: true } } };
const MODE_ALL = { adStoragePurposeConsentStatus: 1, adUserDataPurposeConsentStatus: 1, adPersonalizationPurposeConsentStatus: 1, analyticsStoragePurposeConsentStatus: 1 };
const rec = (choice, at = NOW - DAY) => ({ v: 1, choice, at });
const plain = (x) => JSON.parse(JSON.stringify(x)); // objects from the vm realm
const noAdGrant = (updates) => updates.every((u) => ['ad_storage', 'ad_user_data', 'ad_personalization'].every((k) => u[k] === undefined || u[k] === 'denied'));

// ---------- pure rules ----------
test('stats: cmpVoice – hidden/disabled UI and tcloaded without tcString are silent; decisions, visible UI and gdprApplies false are not', () => {
  assert.equal(K.cmpVoice(null), 'silent');
  assert.equal(K.cmpVoice(hiddenTc), 'silent');
  assert.equal(K.cmpVoice(uiHidden), 'silent');
  assert.equal(K.cmpVoice({ ...uiHidden, displayStatus: 'disabled' }), 'silent');
  assert.equal(K.cmpVoice({ ...uiHidden, displayStatus: 'visible' }), 'showing');
  assert.equal(K.cmpVoice({ gdprApplies: true, eventStatus: 'cmpuishown' }), 'showing');
  assert.equal(K.cmpVoice(decidedNo), 'decided');
  assert.equal(K.cmpVoice({ ...hiddenTc, tcString: 'CQabc' }), 'decided');
  assert.equal(K.cmpVoice({ gdprApplies: false, eventStatus: 'tcloaded', displayStatus: 'hidden' }), 'outside');
});
test('stats: stored choice – version, choice, 12 months, future timestamps and broken data', () => {
  const s = (o) => JSON.stringify(o);
  assert.deepEqual(K.readStatsChoice(s(rec('granted')), NOW), rec('granted'));
  assert.equal(K.readStatsChoice(s({ ...rec('granted'), v: 2 }), NOW), null);
  assert.equal(K.readStatsChoice(s({ ...rec('granted'), choice: 'yes' }), NOW), null);
  assert.equal(K.readStatsChoice(s(rec('granted', NOW + 60000)), NOW), null, 'future timestamp discarded');
  assert.equal(K.readStatsChoice('{broken', NOW), null);
  assert.equal(K.readStatsChoice('null', NOW), null);
  const at = Date.UTC(2025, 10, 5, 12);
  assert.equal(K.readStatsChoice(s(rec('denied', at)), at + 364 * DAY)?.choice, 'denied', 'still valid before 12 months');
  assert.equal(K.readStatsChoice(s(rec('denied', at)), K.statsExpiry(at)), null, 'asked again after 12 months');
});
test('stats: interim update sets only analytics_storage; GPC and U.S. opt-outs deny', () => {
  assert.deepEqual(K.interimUpdate(rec('granted'), false, null, null), { analytics_storage: 'granted' });
  assert.deepEqual(K.interimUpdate(rec('denied'), false, null, null), { analytics_storage: 'denied' });
  assert.deepEqual(K.interimUpdate(null, false, null, null), { analytics_storage: 'denied' });
  assert.deepEqual(K.interimUpdate(rec('granted'), true, null, null), { analytics_storage: 'denied' });
  assert.deepEqual(K.interimUpdate(rec('granted'), false, 3, null), { analytics_storage: 'denied' });
  assert.deepEqual(K.interimUpdate(rec('granted'), false, 2, 3), { analytics_storage: 'denied' });
});
test('stats: _ga cookie wipes cover the host and every parent domain, nothing else', () => {
  const w = K.gaCookieWipes('_ga=GA1.1.1; foo=1; _ga_T00HRG2YVF=GS1; _gab=x; _ga=dup', 'www.clicksolveguide.com');
  const names = [...new Set(w.map((x) => x.split('=')[0]))];
  assert.deepEqual(names.sort(), ['_ga', '_ga_T00HRG2YVF']);
  for (const n of names) for (const d of ['', '; domain=.www.clicksolveguide.com', '; domain=.clicksolveguide.com']) assert.ok(w.includes(`${n}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=/${d}`), n + d);
  assert.deepEqual(K.gaCookieWipes('', 'clicksolveguide.com'), []);
});
test('stats: Google refusal is only a clear no', () => {
  assert.equal(K.googleRefusesAnalytics(decidedNo, null), true);
  assert.equal(K.googleRefusesAnalytics(decidedYes, null), false, 'mode values not there yet');
  assert.equal(K.googleRefusesAnalytics(decidedYes, { analyticsStoragePurposeConsentStatus: 2 }), true);
  assert.equal(K.googleRefusesAnalytics(hiddenTc, null), false);
  assert.equal(K.googleRefusesAnalytics({ gdprApplies: false }, { analyticsStoragePurposeConsentStatus: 2 }), true);
  assert.equal(K.googleRefusesAnalytics({ gdprApplies: false }, { analyticsStoragePurposeConsentStatus: 1 }), false);
});

// ---------- running page ----------
test('window: CMP loads but shows nothing (tcloaded + displayStatus hidden) -> window after 3 s, not before', () => {
  const p = page();
  p.cmp({ tc: hiddenTc });
  p.fire(uiHidden); // cmpuishown with displayStatus hidden does not count as "dialog shown"
  p.advance(2900);
  assert.equal(shown(p), false);
  p.advance(200);
  assert.equal(shown(p), true);
  const b = box(p);
  assert.equal(b.getAttribute('role'), 'dialog');
  assert.equal(b.getAttribute('aria-modal'), 'false');
  assert.equal(p.document.activeElement, null, 'shown by itself: focus is not moved');
  assert.equal(b.parentNode.children[b.parentNode.children.indexOf(b) - 1].className, 'top', 'placed right after the header');
  assert.equal(p.off(), true);
  assert.equal(p.gtm().length, 0);
});
test('window: no __tcfapi at all -> window after 3 s', () => {
  const p = page();
  p.advance(3000);
  assert.equal(shown(p), true);
});
test('window: a CMP decision within 3 s -> no window, stored window choice deleted', () => {
  const p = page({ stored: rec('granted') });
  p.cmp({ tc: decidedYes, mode: MODE_ALL });
  p.advance(5000);
  assert.equal(shown(p), false);
  assert.equal(p.saved(), null);
  assert.equal(p.updates.at(-1).ad_storage, 'granted', 'the existing CMP logic decides (ads untouched)');
});
test('window: gdprApplies false -> no window, own choice deleted, existing U.S. logic decides', () => {
  const p = page({ stored: rec('granted') });
  p.cmp({ tc: { gdprApplies: false, eventStatus: 'tcloaded', tcString: '' }, mode: MODE_ALL, us: 3 });
  p.advance(5000);
  assert.equal(shown(p), false);
  assert.equal(p.saved(), null);
  assert.equal(p.gtm().length, 0, 'U.S. opt-out: no Google Analytics');
  assert.equal(p.off(), true);
});
test('window: Google message visible -> no window, stored choice kept until Google decides', () => {
  const p = page({ stored: rec('denied') });
  p.cmp({ tc: { ...uiHidden, displayStatus: 'visible' } });
  p.advance(5000);
  assert.equal(shown(p), false);
  assert.equal(p.saved().choice, 'denied');
});
test('window: Global Privacy Control -> no window, no GA even with a stored "granted"', () => {
  const p = page({ gpc: true });
  p.advance(5000);
  assert.equal(shown(p), false);
  const q = page({ gpc: true, stored: rec('granted') });
  q.advance(5000);
  assert.equal(q.gtm().length, 0);
  assert.equal(q.off(), true);
  q.clickSettings(); // on request the window explains why there is nothing to choose
  assert.equal(shown(q), true);
  assert.equal(box(q).querySelector('.statsbox-acts').hidden, true);
  assert.match(textOf(box(q)), /Global Privacy Control/);
});
test('window: Allow sets only analytics_storage, loads gtag.js once, signals and ad personalisation off', () => {
  const p = page({ cookies: ['_ga=GA1.1.5'] });
  p.advance(3000);
  const before = p.updates.length;
  p.pick('granted');
  assert.equal(shown(p), false);
  assert.deepEqual(plain(p.updates.slice(before)), [{ analytics_storage: 'granted' }]);
  assert.ok(noAdGrant(p.updates), 'ad_* never granted');
  assert.equal(p.off(), false);
  assert.equal(p.gtm().length, 1);
  assert.deepEqual(plain(p.calls.find((c) => c[0] === 'config').slice(1)), ['G-T00HRG2YVF', { allow_google_signals: false, allow_ad_personalization_signals: false }]);
  assert.equal(p.saved().choice, 'granted');
  assert.equal(p.saved().v, 1);
  assert.equal(p.saved().at, NOW + 3000);
  p.clickSettings(); p.pick('granted'); // choosing again: no second gtag.js
  assert.equal(p.gtm().length, 1);
  assert.equal(p.calls.filter((c) => c[0] === 'event').length, 0);
});
test('window: Decline / withdrawal -> GA off, analytics denied, _ga and _ga_* deleted for every domain variant', () => {
  const p = page({ cookies: ['_ga=GA1.1.5', '_ga_T00HRG2YVF=GS1', 'other=1'] });
  p.advance(3000);
  p.pick('granted');
  p.clickSettings();
  assert.equal(shown(p), true);
  assert.equal(p.document.activeElement, box(p).querySelector('#statsbox-h'), 'opened on request: focus on the heading');
  assert.match(textOf(box(p)), /allowed on November 5, 2026/);
  p.pick('denied');
  assert.equal(p.off(), true);
  assert.deepEqual(plain(p.updates.at(-1)), { analytics_storage: 'denied' });
  assert.deepEqual(p.jar(), ['other=1']);
  for (const d of ['', '; domain=.www.clicksolveguide.com', '; domain=.clicksolveguide.com']) assert.ok(p.cookieWrites.some((c) => c.startsWith('_ga_T00HRG2YVF=;') && c.endsWith('path=/' + d)), d);
  assert.equal(p.saved().choice, 'denied');
  assert.equal(p.document.activeElement, p.settings, 'focus returns to "Privacy settings"');
});
test('window: a stored "no" deletes _ga on load and keeps the window closed', () => {
  const p = page({ stored: rec('denied'), cookies: ['_ga=GA1.1.5'] });
  assert.deepEqual(p.jar(), []);
  p.advance(5000);
  assert.equal(shown(p), false);
  assert.equal(p.off(), true);
});
test('window: stored "granted" within 12 months measures without asking; older or future entries ask again', () => {
  const ok = page({ stored: rec('granted', NOW - 300 * DAY) });
  ok.advance(3000);
  assert.equal(shown(ok), false);
  assert.equal(ok.gtm().length, 1);
  assert.equal(ok.off(), false);
  const old = page({ stored: rec('granted', Date.UTC(2025, 10, 4, 12)) });
  old.advance(3000);
  assert.equal(shown(old), true);
  assert.equal(old.gtm().length, 0);
  const future = page({ stored: rec('granted', NOW + 30 * DAY) });
  future.advance(3000);
  assert.equal(shown(future), true);
  assert.equal(future.gtm().length, 0);
});
test('window: blocked localStorage throws nothing; the choice holds for the page view', () => {
  const p = page({ storage: 'blocked' });
  p.advance(3000);
  assert.equal(shown(p), true);
  p.pick('granted');
  assert.equal(p.off(), false);
  assert.equal(p.gtm().length, 1);
});
test('window: × and Escape close without storing anything; statistics stay off', () => {
  const p = page();
  p.advance(3000);
  const x = box(p).querySelector('.statsbox-x');
  assert.equal(x.textContent, '×');
  box(p).fire('click', { target: x });
  assert.equal(shown(p), false);
  assert.equal(p.saved(), null);
  p.clickSettings();
  box(p).fire('keydown', { key: 'Escape', preventDefault() {} });
  assert.equal(shown(p), false);
  assert.equal(p.saved(), null);
  assert.equal(p.off(), true);
  assert.equal(p.gtm().length, 0);
});
test('window: a later CMP decision wins – window closes, own choice deleted, Google\'s no deletes _ga', () => {
  const p = page({ cookies: ['_ga=GA1.1.5'] });
  p.cmp({ tc: hiddenTc });
  p.advance(3000);
  p.pick('granted');
  assert.equal(p.off(), false);
  p.document.cookie = '_ga=GA1.1.6';
  p.clickSettings();
  p.fire(decidedNo);
  assert.equal(shown(p), false);
  assert.equal(p.saved(), null);
  assert.equal(p.off(), true);
  assert.deepEqual(p.jar(), []);
  assert.deepEqual(plain(p.updates.at(-1)), K.allDenied());
  p.clickSettings(); // from now on "Privacy settings" opens Google's message
  assert.equal(shown(p), false);
  assert.equal(p.win.revocations, 1);
});
test('window: Google refuses analytics on load -> _ga deleted although the window was never active', () => {
  const p = page({ cookies: ['_ga=GA1.1.5', '_ga_T00HRG2YVF=GS1'] });
  p.cmp({ tc: decidedNo });
  assert.deepEqual(p.jar(), []);
  assert.equal(shown(p), false);
});
test('window: a later U.S. opt-out via GPP switches GA off while the window is in charge', () => {
  const p = page({ stored: rec('granted') });
  let gppCb = null;
  p.win.__gpp = (cmd, cb) => { if (cmd === 'addEventListener') gppCb = cb; };
  p.cmp({ tc: hiddenTc });
  p.advance(3000);
  assert.equal(p.off(), false);
  gppCb({ pingData: { signalStatus: 'ready', parsedSections: { usnat: [{ SaleOptOut: 1 }] } } }, true);
  assert.equal(p.off(), true);
  assert.deepEqual(plain(p.updates.at(-1)), { analytics_storage: 'denied' });
});
test('window: pages without ads – no timer window, no Google code; "Privacy settings" opens the window', () => {
  const p = page({ ads: false, stored: rec('granted') });
  p.advance(5000);
  assert.equal(shown(p), false);
  p.clickSettings();
  assert.equal(shown(p), true);
  assert.match(textOf(box(p)), /allowed on/);
  p.pick('granted');
  assert.equal(p.scripts.length, 0, 'no ad script, no gtag.js');
  assert.equal(p.off(), true);
  p.clickSettings();
  p.pick('denied');
  assert.equal(p.saved().choice, 'denied');
  assert.equal(p.scripts.length, 0);
});
test('window: markup and styles – equal buttons, 44 px targets, fixed position, hidden in print, no HTML strings', () => {
  const p = page();
  p.advance(3000);
  const picks = box(p).querySelectorAll('.statsbox-pick').filter((b) => b.getAttribute('data-stats-pick'));
  assert.deepEqual(picks.map((b) => [b.textContent, b.className]), [['Allow', 'statsbox-pick'], ['Decline', 'statsbox-pick']]);
  assert.equal(box(p).querySelector('#statsbox-h').tabIndex, -1);
  assert.ok(p.document.body.querySelector('.statsbox-say').getAttribute('aria-live'));
  assert.match(textOf(box(p)), /not consent to advertising/);
  assert.equal(box(p).querySelector('a').href, '/privacy/#interim-statistics');
  assert.match(CSS, /\.statsbox\{position:fixed;/);
  assert.match(CSS, /\.statsbox-pick\{[^}]*min-height:44px/);
  assert.match(CSS, /\.statsbox-x\{[^}]*width:44px;height:44px/);
  assert.match(CSS, /@media print\{\.statsbox,\.statsbox-say\{display:none!important\}/);
  assert.match(CSS, /@media \(max-width:560px\)\{\.statsbox\{left:0;right:0;bottom:0;width:auto/);
});
test('GA events: no gtag(\'event\') call anywhere without the ga-disable check', () => {
  for (const f of fs.readdirSync(JS)) {
    const src = fs.readFileSync(path.join(JS, f), 'utf8');
    for (const m of src.matchAll(/gtag\(\s*['"]event['"]/g)) {
      const before = src.slice(Math.max(0, m.index - 200), m.index);
      assert.match(before, /\['ga-disable-' \+ GA_ID\] === false/, f);
    }
  }
});
test('privacy policy: interim statistics section with anchor, linked from the analytics section, date November 5, 2026', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'docs', 'privacy', 'index.html'), 'utf8');
  assert.match(html, /<h2 id="interim-statistics">Interim statistics window<\/h2>/);
  const ga = html.slice(html.indexOf('<h2 id="analytics">'), html.indexOf('<h2 id="interim-statistics">'));
  assert.match(ga, /href="#interim-statistics"/);
  for (const s of ['csg-stats', '12 months', 'Art. 6(1)(a) GDPR', '§ 165(3)', 'Global Privacy Control', 'priority', 'Visitors from the U.S.']) assert.ok(html.includes(s), s);
  assert.match(html, /Last updated: November 5, 2026/);
});
test('pages without ads: "Google’s ad and U.S. privacy choices" loads only Google’s consent script, never adsbygoogle.js; CMP decides, GA stays off', () => {
  const p = page({ ads: false, stored: rec('granted') });
  p.advance(5000);
  p.clickSettings();
  const more = box(p).querySelector('[data-stats-google]');
  assert.ok(more && !box(p).querySelector('.statsbox-more').hidden);
  box(p).fire('click', { target: more });
  assert.equal(shown(p), false);
  assert.deepEqual(p.scripts.map((s) => s.src), ['https://fundingchoicesmessages.google.com/i/pub-7811071715414905?ers=1']);
  box(p).fire('click', { target: more }); // a second click: no second copy
  assert.equal(p.scripts.length, 1);
  p.cmp({ tc: decidedYes, mode: MODE_ALL });
  assert.equal(p.win.revocations, 2, 'revocation message opened via the prepared callback queue');
  assert.equal(p.saved(), null, 'Google decided: own choice deleted');
  assert.equal(p.off(), true);
  assert.equal(p.scripts.filter((s) => /adsbygoogle|googletagmanager/.test(s.src)).length, 0);
});
