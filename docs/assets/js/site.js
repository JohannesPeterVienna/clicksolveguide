/*
 * ClickSolve Guide – page runtime.
 * 1. Ad slots: hidden until a slot ID is configured in SLOTS (all empty = nothing rendered).
 * 2. Consent: Google Consent Mode updates from the Google CMP; GA4 only when analytics is granted.
 * 3. Interim statistics window: while Google's CMP gives no decision and shows nothing (~3 s after start),
 *    an own window asks for analytics only (analytics_storage; ad_* always stay denied).
 * 4. "Privacy settings" buttons reopen the Google consent message once the CMP has spoken, otherwise the window.
 * 5. Version switcher, menu paths, command visibility and copy buttons.
 * No innerHTML anywhere: all text goes in with textContent.
 */
(function () {
  'use strict';
  var CLIENT = 'ca-pub-7811071715414905';
  var SLOTS = {
    // Shared responsive AdSense units “Themen-Websites – …” (account pub-7811071715414905)
    afterIntro: '7497607759', // 970×250 / 728×90 desktop, 300×250 or 320×100 mobile – after the lede (guides) or the first explanation (tools)
    midArticle: '1292301217', // 300×250 between two text sections
    sidebar: '1292301217'     // 300×600 half page, guides only, from 1200 px, not sticky
  };
  var GA_ID = 'G-T00HRG2YVF';
  var root = document.documentElement;
  var adsPage = root.getAttribute('data-ads') === 'yes';

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } return null; }

  /* ---------------- ads ---------------- */
  // Local preview/test (localhost, 127.0.0.1, ::1, file:): never load any Google script.
  // window.CSG_NO_GOOGLE is set by the first inline script in <head> (also for ?stats_test=1).
  var LOCAL = (function () {
    if (window.CSG_NO_GOOGLE) return true;
    var K = window.CSGConsent;
    try { return K ? K.isLocalHost(location.hostname, location.protocol, location.search) : true; } catch (e) { return true; }
  })();
  function loadAdScript() {
    if (LOCAL || document.querySelector('script[src*="adsbygoogle.js"]')) return;
    var s = document.createElement('script');
    s.async = true; s.crossOrigin = 'anonymous';
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + CLIENT;
    document.head.appendChild(s);
  }
  // Pages without ads: only Google's consent script (Funding Choices), on an explicit click – never adsbygoogle.js,
  // so no ads (and no Auto ads) can appear on imprint, privacy, contact or 404.
  var FC_SRC = 'https://fundingchoicesmessages.google.com/i/pub-7811071715414905?ers=1';
  function loadConsentScript() {
    if (LOCAL || document.querySelector('script[src*="fundingchoicesmessages.google.com"]')) return;
    var s = document.createElement('script');
    s.async = true; s.src = FC_SRC;
    document.head.appendChild(s);
  }
  function fillSlots() {
    var wide = window.matchMedia('(min-width: 1200px)').matches;
    if (SLOTS.sidebar && wide && document.querySelector('.ad[data-slot="sidebar"]')) root.classList.add('has-side');
    var boxes = document.querySelectorAll('.ad[data-slot]');
    for (var i = 0; i < boxes.length; i++) {
      var box = boxes[i], name = box.getAttribute('data-slot'), id = SLOTS[name];
      if (!id || (name === 'sidebar' && !wide)) continue;
      var ins = document.createElement('ins');
      ins.className = 'adsbygoogle';
      ins.style.display = 'block';
      ins.setAttribute('data-ad-client', CLIENT);
      ins.setAttribute('data-ad-slot', id);
      if (name !== 'sidebar') { ins.setAttribute('data-ad-format', 'auto'); ins.setAttribute('data-full-width-responsive', 'true'); }
      box.appendChild(ins);
      box.hidden = false;
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) { box.hidden = true; }
    }
  }

  /* ---------------- consent + analytics ---------------- */
  var gtag = window.gtag || function () { (window.dataLayer = window.dataLayer || []).push(arguments); };
  var cs = { tc: null, modeReady: false, us: null, gpp: null, gppOn: false, sent: '' };
  var lastTc = null; // latest TCF data, kept across the click-time withdrawal
  var gaOn = false;
  // Global Privacy Control: Google Analytics stays off on every page, and the statistics window is never pushed
  var GPC = (function () { try { return navigator.globalPrivacyControl === true; } catch (e) { return false; } })();
  // Interim statistics window (see consent.js). phase:
  //   'waiting' – first ~3 s on pages with ads: Google's CMP may still decide or show its message
  //   'active'  – the CMP gave no decision and shows nothing: the window decides analytics_storage (never ad_*)
  //   'google'  – the CMP decided, shows its own message or reports gdprApplies false: only the CMP counts
  //   'quiet'   – imprint, privacy, contact, 404: no Google code; the window opens only from "Privacy settings"
  var iw = { phase: adsPage ? 'waiting' : 'quiet', rec: null, wiped: false, box: null, opener: null, say: null };
  function startGA() {
    if (gaOn || LOCAL) return;
    if (!adsPage) return; // pages without ads never load Google Analytics
    gaOn = true;
    var s = document.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
  }
  function modeValues() {
    try {
      var fc = window.googlefc;
      return fc && typeof fc.getGoogleConsentModeValues === 'function' ? fc.getGoogleConsentModeValues() || null : null;
    } catch (e) { return null; }
  }
  function applyConsent() {
    var C = window.CSGConsent;
    if (!C) return;
    var mv = null, d;
    if (iw.phase === 'active') d = C.interimUpdate(iw.rec, GPC, cs.us, cs.gpp); // the window decides: analytics_storage only
    else {
      mv = cs.modeReady && C.region(cs.tc) !== 'none' ? modeValues() : null;
      d = C.decideConsent(cs.tc, mv, C.effectiveUsStatus(cs.us, cs.gpp));
      if (GPC) d.analytics_storage = 'denied';
    }
    var analytics = adsPage && d.analytics_storage === 'granted';
    var wasOn = window['ga-disable-' + GA_ID] === false;
    window['ga-disable-' + GA_ID] = !analytics;
    var key = JSON.stringify(d);
    if (key !== cs.sent) { cs.sent = key; gtag('consent', 'update', d); }
    if (analytics) { iw.wiped = false; startGA(); }
    // Google clearly says no to analytics -> the _ga cookies go too (also when the window was never active)
    else if (iw.phase !== 'active' && !iw.wiped && C.googleRefusesAnalytics(cs.tc, mv)) { iw.wiped = true; wipeGa(); }
    // the window is in charge and GA goes (or stays) off although "granted" was chosen – GPC or a U.S. opt-out:
    // the _ga cookies go as well
    else if (iw.phase === 'active' && !iw.wiped && (wasOn || (iw.rec && iw.rec.choice === 'granted'))) { iw.wiped = true; wipeGa(); }
    if (iw.box && !iw.box.hidden) fillBox(!!iw.opener); // e.g. a GPP opt-out while the window is open: only the notice remains
  }
  function wipeGa() {
    try {
      var list = window.CSGConsent.gaCookieWipes(document.cookie, location.hostname);
      for (var i = 0; i < list.length; i++) document.cookie = list[i];
    } catch (e) { /* cookies not accessible */ }
  }
  function fcQueue(item) {
    window.googlefc = window.googlefc || {};
    window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
    window.googlefc.callbackQueue.push(item);
  }
  // current U.S. opt-out state (also later changes) from the GPP signal; without GPP it stays denied
  function watchGpp() {
    if (cs.gppOn || typeof window.__gpp !== 'function') return;
    cs.gppOn = true;
    try {
      window.__gpp('addEventListener', function (evt, ok) {
        if (!ok || !evt) return;
        var pd = evt.pingData || (evt.data && evt.data.pingData) || null;
        if (pd) { cs.gpp = window.CSGConsent ? window.CSGConsent.usStatusFromGpp(pd) : null; applyConsent(); }
      });
    } catch (e) { cs.gppOn = false; cs.gpp = null; }
  }
  function watchConsent() {
    fcQueue({
      CONSENT_API_READY: function () {
        watchGpp();
        if (typeof window.__tcfapi !== 'function') return;
        window.__tcfapi('addEventListener', 2, function (tc, ok) {
          cs.tc = ok ? tc : null;
          if (ok && tc) { lastTc = tc; hearCmp(tc); }
          if (ok && tc && tc.eventStatus === 'useractioncomplete' && window.googlefc && typeof window.googlefc.getGoogleConsentModeValues === 'function') cs.modeReady = true;
          applyConsent();
        });
      },
      CONSENT_MODE_DATA_READY: function () { cs.modeReady = true; applyConsent(); },
      INITIAL_US_STATES_OPT_OUT_DATA_READY: function () {
        try {
          var u = window.googlefc.usstatesoptout;
          cs.us = u && typeof u.getInitialUsStatesOptOutStatus === 'function' ? u.getInitialUsStatesOptOutStatus() : null;
        } catch (e) { cs.us = null; }
        watchGpp();
        applyConsent();
      }
    });
    applyConsent();
  }
  // Google's own dialogs: U.S. opt-out where a U.S. state law applies, otherwise the GDPR revocation message
  function openGoogleChoices() {
    var prev = { tc: cs.tc, modeReady: cs.modeReady };
    cs.tc = null; cs.modeReady = false; applyConsent(); // withdraw first; the CMP reports the new choice
    fcQueue(function () {
      try {
        window.CSGConsent.openPrivacyChoices(window.googlefc, function (userDidOptOut) {
          try {
            // opted out -> ads personalisation and analytics stay denied; later changes arrive via GPP
            if (userDidOptOut) cs.gpp = window.CSGConsent.US_OPTED_OUT;
            else { cs.tc = prev.tc; cs.modeReady = prev.modeReady; }
            watchGpp();
          } catch (e) { cs.gpp = null; }
          applyConsent();
        }, lastTc || prev.tc);   // latest TCF data: GDPR applies -> revocation message
      } catch (e) { /* CMP not reachable */ }
    });
    if (adsPage) loadAdScript(); else loadConsentScript(); // the callback queue above is ready before the script runs
  }
  // "Privacy settings": Google's CMP once it has spoken, otherwise (and on pages without ads) the statistics window
  function privacyButtons() {
    var bs = document.querySelectorAll('[data-privacy-settings]');
    for (var i = 0; i < bs.length; i++) bs[i].addEventListener('click', function (e) {
      var btn = e && e.currentTarget ? e.currentTarget : null;
      if (iw.phase === 'waiting') startInterim(); // asked within the first 3 s and Google has said nothing yet
      if (iw.phase === 'active' || iw.phase === 'quiet') { openBox(btn); return; }
      openGoogleChoices();
    });
  }

  /* ---------------- interim statistics window ---------------- */
  function readStats() {
    var C = window.CSGConsent, raw = null;
    if (!C) return null;
    try { raw = localStorage.getItem(C.STATS_KEY); } catch (e) { return null; }
    return raw === null || raw === undefined ? null : C.readStatsChoice(raw, Date.now());
  }
  function saveStats(choice) {
    var C = window.CSGConsent, rec = C.statsRecord(choice, Date.now());
    try { localStorage.setItem(C.STATS_KEY, JSON.stringify(rec)); } catch (e) { /* storage blocked: holds for this page view */ }
    return rec;
  }
  function forgetStats() {
    try { localStorage.removeItem(window.CSGConsent.STATS_KEY); } catch (e) { /* storage blocked: nothing stored */ }
  }
  function usOptedOut() { return cs.us === 3 || cs.gpp === 3; }
  // every TCF event: as soon as the CMP decides, shows its message or says gdprApplies false, only the CMP counts
  function hearCmp(tc) {
    var v = window.CSGConsent ? window.CSGConsent.cmpVoice(tc) : 'silent';
    if (v === 'silent') return; // includes cmpuishown with displayStatus hidden/disabled
    if (v === 'decided' || v === 'outside') forgetStats();
    closeBox(false);
    if (iw.phase === 'waiting' || iw.phase === 'active') { iw.phase = 'google'; iw.rec = null; }
  }
  function startInterim() {
    if (iw.phase !== 'waiting') return;
    iw.phase = 'active';
    iw.rec = readStats();
    applyConsent();
    if (!iw.rec && !GPC && !usOptedOut()) openBox(null);
  }
  function choose(choice) {
    if (choice === 'granted' && (GPC || usOptedOut())) { // GPC or U.S. opt-out: "Allow" is not available
      fillBox(!!iw.opener);
      announce('Google Analytics stays off because of your privacy signal or opt-out.');
      return;
    }
    iw.rec = saveStats(choice);
    if (choice !== 'granted') {
      window['ga-disable-' + GA_ID] = true;
      wipeGa();
      if (iw.phase !== 'active') gtag('consent', 'update', { analytics_storage: 'denied' });
    }
    if (iw.phase === 'active') applyConsent();
    announce(choice === 'granted' ? 'Statistics allowed. You can change this under Privacy settings.' : 'Statistics declined. Google Analytics stays off.');
    closeBox(true);
  }
  function node(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }
  function button(cls, text, attr, val) {
    var b = node('button', cls, text);
    b.type = 'button';
    b.setAttribute(attr, val || '');
    return b;
  }
  function buildBox() {
    var box = node('section', 'statsbox');
    box.id = 'statsbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'false');
    box.setAttribute('aria-labelledby', 'statsbox-h');
    box.setAttribute('aria-describedby', 'statsbox-p');
    box.hidden = true;
    var bar = node('div', 'statsbox-bar');
    bar.appendChild(node('span', 'mono', 'Statistics only · interim'));
    var x = button('statsbox-x', '×', 'data-stats-close');
    x.setAttribute('aria-label', 'Close without changing anything');
    x.title = 'Close without changing anything';
    bar.appendChild(x);
    var h = node('h2', null, 'Count this visit?');
    h.id = 'statsbox-h'; h.tabIndex = -1;
    var p = node('p', null, 'With your OK, Google Analytics (Google Ireland Ltd.) counts visits and which pages are read, and sets _ga cookies; data may be processed in the USA. Statistics only – this is not consent to advertising. Your choice is kept in this browser for 12 months. ');
    p.id = 'statsbox-p';
    var a = node('a', null, 'Privacy policy');
    a.href = '/privacy/#interim-statistics';
    p.appendChild(a);
    var acts = node('div', 'statsbox-acts');
    acts.appendChild(button('statsbox-pick', 'Allow', 'data-stats-pick', 'granted'));
    acts.appendChild(button('statsbox-pick', 'Decline', 'data-stats-pick', 'denied'));
    var one = node('div', 'statsbox-acts statsbox-one');
    one.appendChild(button('statsbox-pick', 'Close', 'data-stats-close'));
    var more = node('p', 'statsbox-more');
    more.appendChild(button('linklike', 'Google’s ad and U.S. privacy choices', 'data-stats-google'));
    [bar, h, p, node('p', 'statsbox-now'), acts, one, more].forEach(function (c) { box.appendChild(c); });
    box.addEventListener('click', function (e) {
      var t = e.target && e.target.closest ? e.target : null;
      if (!t) return;
      var pick = t.closest('[data-stats-pick]');
      if (pick) { choose(pick.getAttribute('data-stats-pick')); return; }
      if (t.closest('[data-stats-close]')) { closeBox(true); return; } // closes for now: nothing stored, statistics stay off
      if (t.closest('[data-stats-google]')) { closeBox(false); openGoogleChoices(); }
    });
    box.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.key === 'Esc') { e.preventDefault(); closeBox(true); } // never counts as consent
    });
    var say = node('p', 'statsbox-say');
    say.setAttribute('role', 'status');
    say.setAttribute('aria-live', 'polite');
    iw.say = say;
    var top = document.querySelector('header.top');
    if (top && top.parentNode) top.parentNode.insertBefore(box, top.nextSibling); // early in the tab order
    else document.body.appendChild(box);
    document.body.appendChild(say);
    return box;
  }
  function longDate(ms) {
    try { return new Date(ms).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); } catch (e) { return ''; }
  }
  function fillBox(onRequest) {
    var b = iw.box, rec = iw.phase === 'quiet' ? readStats() : iw.rec;
    var blocked = GPC || usOptedOut();
    var now = b.querySelector('.statsbox-now');
    if (GPC) now.textContent = 'Your browser sends a Global Privacy Control signal, so Google Analytics stays off on this site – there is nothing to choose.';
    else if (blocked) now.textContent = 'You opted out under a U.S. state privacy law, so Google Analytics stays off on this site.';
    else if (rec) now.textContent = 'Your current choice: ' + (rec.choice === 'granted' ? 'allowed' : 'declined') + ' on ' + longDate(rec.at) + '.';
    else now.textContent = onRequest ? 'Nothing chosen yet – statistics are off.' : '';
    if (iw.phase === 'quiet' && !blocked) now.textContent += ' This page loads no Google code; the choice applies on the guide and diagnosis pages.';
    now.hidden = !now.textContent;
    b.querySelector('.statsbox-acts').hidden = blocked;
    b.querySelector('.statsbox-one').hidden = !blocked;
    b.querySelector('.statsbox-more').hidden = !onRequest;
  }
  function announce(text) {
    var s = iw.say;
    if (!s) return;
    s.textContent = '';
    setTimeout(function () { s.textContent = text; }, 150);
  }
  function openBox(opener) {
    try {
      if (!iw.box) iw.box = buildBox();
      iw.opener = opener || null;
      fillBox(!!opener);
      iw.box.hidden = false;
      root.classList.add('statsbox-on');
      root.style.setProperty('--statsbox-room', iw.box.offsetHeight + 'px'); // the footer stays reachable
      if (opener) iw.box.querySelector('#statsbox-h').focus(); // opened on request: focus moves in
      else announce('A question about statistics appeared at the bottom of the page.'); // shown by itself: focus stays put
    } catch (e) { /* no DOM: nothing to show */ }
  }
  function closeBox(returnFocus) {
    var b = iw.box;
    if (!b || b.hidden) return;
    var inside = false;
    try { inside = b.contains(document.activeElement); } catch (e) { inside = false; }
    b.hidden = true;
    root.classList.remove('statsbox-on');
    var o = iw.opener;
    iw.opener = null;
    try {
      if (returnFocus && o && o.focus) o.focus();
      else if (inside) { var m = document.getElementById('main'); if (m) { m.setAttribute('tabindex', '-1'); m.focus(); } }
    } catch (e) { /* ignore */ }
  }

  /* ---------------- versions, menu paths, commands ---------------- */
  var CORE = window.CSGCore;
  var current = null;
  function pageVersions() {
    var sw = document.querySelector('.vswitch select');
    if (!sw) return null;
    var out = [];
    for (var i = 0; i < sw.options.length; i++) out.push(sw.options[i].value);
    return out;
  }
  function applyVersion(v) {
    if (!v) return;
    current = v;
    var fam = v === 'win11' || v === 'win10' ? 'win' : (v === 'macnew' || v === 'macold' ? 'mac' : 'none');
    var labels = CORE ? CORE.VERSIONS : {};
    var spans = document.querySelectorAll('.mpath');
    for (var i = 0; i < spans.length; i++) {
      var el = spans[i], paths;
      try { paths = JSON.parse(el.getAttribute('data-paths')); } catch (e) { continue; }
      var r = CORE ? CORE.resolvePath(paths, v) : null;
      if (!r) continue;
      var os = el.querySelector('.mp-os');
      if (!os) { os = document.createElement('span'); os.className = 'mp-os'; el.insertBefore(os, el.firstChild); }
      os.textContent = r.fallback ? (labels[r.os] || r.os) + ' only' : (labels[r.os] || r.os);
      while (os.nextSibling) el.removeChild(os.nextSibling);
      el.appendChild(document.createTextNode(r.text));
      el.classList.toggle('mp-fallback', r.fallback);
    }
    var cmds = document.querySelectorAll('.cmd[data-os]');
    // only the selected platform's commands (and copy buttons); phones and tablets get none – they use the settings path
    for (var j = 0; j < cmds.length; j++) cmds[j].hidden = fam === 'none' || cmds[j].getAttribute('data-os') !== fam;
    var notes = document.querySelectorAll('[data-show-for]');
    for (var k = 0; k < notes.length; k++) notes[k].hidden = notes[k].getAttribute('data-show-for').split(' ').indexOf(fam) < 0;
    var sels = document.querySelectorAll('.vswitch select');
    for (var m = 0; m < sels.length; m++) if (sels[m].value !== v) sels[m].value = v;
    document.dispatchEvent(new CustomEvent('csg:version', { detail: v }));
  }
  function initVersions(highEntropy) {
    var list = pageVersions();
    if (!list) return;
    var saved = store('csg-version');
    var guess = CORE ? CORE.suggestVersion({ ua: navigator.userAgent, maxTouchPoints: navigator.maxTouchPoints || 0, platformVersion: highEntropy }) : null;
    var pick = saved && list.indexOf(saved) >= 0 ? saved : (guess && list.indexOf(guess) >= 0 ? guess : list[0]);
    var hint = document.querySelector('.vswitch .vhint');
    if (hint) hint.textContent = saved ? 'Your saved choice (kept in this browser).' : (guess && list.indexOf(guess) >= 0 ? 'Suggested from what your browser reports – change it if it is wrong.' : 'Pick the system you are fixing.');
    var sels = document.querySelectorAll('.vswitch select');
    for (var i = 0; i < sels.length; i++) sels[i].addEventListener('change', function (e) { store('csg-version', e.target.value); applyVersion(e.target.value); var h = document.querySelector('.vswitch .vhint'); if (h) h.textContent = 'Your saved choice (kept in this browser).'; });
    applyVersion(pick);
  }
  function getPlatformVersion(cb) {
    try {
      var d = navigator.userAgentData;
      if (d && d.getHighEntropyValues) {
        d.getHighEntropyValues(['platformVersion']).then(function (r) { cb(r.platformVersion); }, function () { cb(null); });
        return;
      }
    } catch (e) { /* not supported */ }
    cb(null);
  }

  function copyText(text, btn) {
    function done(ok) {
      var old = btn.getAttribute('data-label') || btn.textContent;
      btn.setAttribute('data-label', old);
      btn.textContent = ok ? 'Copied' : 'Select and copy';
      setTimeout(function () { btn.textContent = old; }, 1800);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallback()); });
    else done(fallback());
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      return ok;
    }
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('button.copy') : null;
    if (b) copyText(b.getAttribute('data-copy'), b);
  });

  /* "What does my browser report?" box on the version guide */
  function browserReport(pv) {
    var box = document.getElementById('ua-report');
    if (!box) return;
    var rows = [
      ['User-agent string', navigator.userAgent],
      ['Platform version (Client Hints)', pv || 'not reported by this browser'],
      ['Touch points', String(navigator.maxTouchPoints || 0)]
    ];
    var g = CORE ? CORE.suggestVersion({ ua: navigator.userAgent, maxTouchPoints: navigator.maxTouchPoints || 0, platformVersion: pv }) : null;
    rows.push(['Best guess', g ? CORE.VERSIONS[g] + (g === 'macnew' ? ' (Safari and Chrome on a Mac do not reveal the macOS version – check About This Mac)' : '') : 'cannot tell from the browser alone – use the manual checks below']);
    var dl = box.querySelector('dl');
    rows.forEach(function (r) {
      var dt = document.createElement('dt'); dt.textContent = r[0];
      var dd = document.createElement('dd'); dd.textContent = r[1];
      dl.appendChild(dt); dl.appendChild(dd);
    });
    box.hidden = false;
  }

  window.CSGSite = { applyVersion: function () { if (current) applyVersion(current); }, currentVersion: function () { return current; } };

  privacyButtons();
  var saved = readStats();
  if (saved && saved.choice === 'denied') wipeGa(); // a stored "no": no Google Analytics cookie may linger
  if (adsPage) { loadAdScript(); fillSlots(); }
  watchConsent();
  if (adsPage) setTimeout(startInterim, window.CSGConsent ? window.CSGConsent.STATS_WAIT_MS : 3000);
  getPlatformVersion(function (pv) { initVersions(pv); browserReport(pv); });
})();
