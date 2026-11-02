/*
 * ClickSolve Guide – page runtime.
 * 1. Ad slots: hidden until a slot ID is configured in SLOTS (all empty = nothing rendered).
 * 2. Consent: Google Consent Mode updates from the Google CMP; GA4 only when analytics is granted.
 * 3. "Privacy settings" buttons reopen the Google consent message.
 * 4. Version switcher, menu paths, command visibility and copy buttons.
 * No innerHTML anywhere: all text goes in with textContent.
 */
(function () {
  'use strict';
  var CLIENT = 'ca-pub-7811071715414905';
  var SLOTS = {
    afterIntro: '', // 970×250 / 728×90 desktop, 300×250 or 320×100 mobile – after the lede (guides) or the first explanation (tools)
    midArticle: '', // 300×250 between two text sections
    sidebar: ''     // 300×600 half page, guides only, from 1200 px, not sticky
  };
  var GA_ID = 'G-T00HRG2YVF';
  var root = document.documentElement;
  var adsPage = root.getAttribute('data-ads') === 'yes';

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } return null; }

  /* ---------------- ads ---------------- */
  function loadAdScript() {
    if (document.querySelector('script[src*="adsbygoogle.js"]')) return;
    var s = document.createElement('script');
    s.async = true; s.crossOrigin = 'anonymous';
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + CLIENT;
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
  var cs = { tc: null, modeReady: false, us: null, sent: '' };
  var gaOn = false;
  function startGA() {
    if (gaOn) return; gaOn = true;
    var s = document.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_ID);
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
    var mv = cs.modeReady && C.region(cs.tc) !== 'none' ? modeValues() : null;
    var d = C.decideConsent(cs.tc, mv, cs.us);
    var analytics = d.analytics_storage === 'granted';
    window['ga-disable-' + GA_ID] = !analytics;
    var key = JSON.stringify(d);
    if (key !== cs.sent) { cs.sent = key; gtag('consent', 'update', d); }
    if (analytics) startGA();
  }
  function fcQueue(item) {
    window.googlefc = window.googlefc || {};
    window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
    window.googlefc.callbackQueue.push(item);
  }
  function watchConsent() {
    fcQueue({
      CONSENT_API_READY: function () {
        if (typeof window.__tcfapi !== 'function') return;
        window.__tcfapi('addEventListener', 2, function (tc, ok) {
          cs.tc = ok ? tc : null;
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
        applyConsent();
      }
    });
    applyConsent();
  }
  function privacyButtons() {
    var bs = document.querySelectorAll('[data-privacy-settings]');
    for (var i = 0; i < bs.length; i++) bs[i].addEventListener('click', function () {
      cs.tc = null; cs.modeReady = false; applyConsent(); // withdraw first; the CMP reports the new choice
      fcQueue(function () { try { window.googlefc.showRevocationMessage(); } catch (e) { /* CMP not reachable */ } });
      loadAdScript();
    });
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
    for (var j = 0; j < cmds.length; j++) cmds[j].hidden = fam !== 'none' && cmds[j].getAttribute('data-os') !== fam;
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
  if (adsPage) { loadAdScript(); fillSlots(); }
  watchConsent();
  getPlatformVersion(function (pv) { initVersions(pv); browserReport(pv); });
})();
