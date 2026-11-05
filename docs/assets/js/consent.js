/*
 * ClickSolve Guide – consent decision.
 * Input: what Google's consent platform (Privacy & messaging, IAB TCF v2.2) reports.
 * Output: Google Consent Mode values. Rule: when in doubt, "denied".
 *
 *   tcData      – object from __tcfapi('addEventListener'), or null
 *   modeValues  – googlefc.getGoogleConsentModeValues(), or null
 *   usStatus    – googlefc.usstatesoptout.getInitialUsStatesOptOutStatus(), or null
 *
 * GDPR region (gdprApplies not false): TCF data loaded, purpose 1 consent, Google (vendor 755)
 *   consent, AND the mode value for the purpose is 1 (GRANTED).
 * Outside (gdprApplies === false): the U.S. state status must be 1 (does not apply) or
 *   2 (not opted out), and the mode value 1 (GRANTED) or 3 (NOT_APPLICABLE).
 * Interim statistics window rules: see the end of this file (only while the CMP gives no decision).
 */
(function (root) {
  'use strict';
  var GOOGLE_VENDOR = 755;
  var KEYS = {
    ad_storage: 'adStoragePurposeConsentStatus',
    ad_user_data: 'adUserDataPurposeConsentStatus',
    ad_personalization: 'adPersonalizationPurposeConsentStatus',
    analytics_storage: 'analyticsStoragePurposeConsentStatus'
  };

  function allDenied() {
    var o = {};
    Object.keys(KEYS).forEach(function (k) { o[k] = 'denied'; });
    return o;
  }

  /** 'gdpr-ok' | 'outside' | 'none' */
  function region(tcData) {
    if (!tcData || typeof tcData !== 'object') return 'none';
    if (tcData.gdprApplies === false) return 'outside';
    var ready = tcData.eventStatus === 'tcloaded' || tcData.eventStatus === 'useractioncomplete';
    var purpose1 = tcData.purpose && tcData.purpose.consents && tcData.purpose.consents[1] === true;
    var google = tcData.vendor && tcData.vendor.consents && tcData.vendor.consents[GOOGLE_VENDOR] === true;
    return ready && purpose1 && google ? 'gdpr-ok' : 'none';
  }

  function decideConsent(tcData, modeValues, usStatus) {
    var out = allDenied();
    var r = region(tcData);
    if (r === 'none' || !modeValues || typeof modeValues !== 'object') return out;
    if (r === 'outside' && usStatus !== 1 && usStatus !== 2) return out;
    Object.keys(KEYS).forEach(function (k) {
      var v = modeValues[KEYS[k]];
      var granted = r === 'gdpr-ok' ? v === 1 : (v === 1 || v === 3);
      out[k] = granted ? 'granted' : 'denied';
    });
    return out;
  }

  var US_SECTION = /^us/; // usnat, usca, usva, usco, usut, usct, ... (IAB GPP)
  var OPT_OUT_FIELDS = ['SaleOptOut', 'SharingOptOut', 'TargetedAdvertisingOptOut'];
  function segments(v) { return Object.prototype.toString.call(v) === '[object Array]' ? v : [v]; }

  /**
   * Current U.S. opt-out state from the GPP signal (__gpp 'addEventListener' / 'ping' pingData).
   * 3 = opted out (any of sale / sharing / targeted advertising = 1, or GPC set), 2 = not opted out
   * (a U.S. section is present and no opt-out), null = no usable signal (keep denied).
   */
  function usStatusFromGpp(pingData) {
    if (!pingData || typeof pingData !== 'object' || pingData.signalStatus === 'not ready') return null;
    var ps = pingData.parsedSections;
    if (!ps || typeof ps !== 'object') return null;
    var found = false, out = false;
    Object.keys(ps).forEach(function (k) {
      if (!US_SECTION.test(k)) return;
      segments(ps[k]).forEach(function (seg) {
        if (!seg || typeof seg !== 'object') return;
        OPT_OUT_FIELDS.forEach(function (f) {
          if (seg[f] === 1) out = true;
          if (seg[f] === 2 || seg[f] === 0) found = true;
        });
        if (seg.Gpc === true) out = true;
      });
    });
    return out ? 3 : (found ? 2 : null);
  }

  /**
   * U.S. status used for the consent decision: a GPP opt-out (3) always wins; otherwise 1 (does not apply)
   * from the initial CMP status, else only what the current GPP signal says; no GPP signal -> null (denied).
   */
  function effectiveUsStatus(initial, gpp) {
    if (gpp === 3) return 3; // a later GPP opt-out always wins, even over an initial DOES_NOT_APPLY (fail-closed)
    if (initial === 1) return 1;
    return gpp === 2 || gpp === 3 ? gpp : null;
  }

  /**
   * "Privacy settings": which consent dialog to open. fc = window.googlefc (may be missing).
   * U.S. state regulation applies (status is not DOES_NOT_APPLY) -> the U.S. opt-out dialog;
   * done(userDidOptOut) is called when it closes. Otherwise -> the GDPR revocation message.
   * The U.S. dialog opens only for a known status NOT_OPTED_OUT (2) or OPTED_OUT (3) (enum values if present)
   * and only when the latest TCF data (tc) does not say gdprApplies === true; UNKNOWN (0) or an EU visitor
   * gets the revocation message so consent can always be withdrawn.
   * Returns 'us' | 'revocation' | 'none' (CMP not reachable). Never throws.
   */
  function openPrivacyChoices(fc, done, tc) {
    try {
      var u = fc && fc.usstatesoptout;
      if (u && typeof u.getInitialUsStatesOptOutStatus === 'function') {
        var en = u.InitialUsStatesOptOutStatusEnum;
        var notOptedOut = en && typeof en.NOT_OPTED_OUT === 'number' ? en.NOT_OPTED_OUT : 2;
        var optedOut = en && typeof en.OPTED_OUT === 'number' ? en.OPTED_OUT : 3;
        var gdpr = !!(tc && typeof tc === 'object' && tc.gdprApplies === true);
        var status = u.getInitialUsStatesOptOutStatus();
        if ((status === notOptedOut || status === optedOut) && !gdpr && typeof u.openConfirmationDialog === 'function') {
          u.openConfirmationDialog(function (userDidOptOut) {
            try { if (done) done(!!userDidOptOut); } catch (e) { /* ignore */ }
          });
          return 'us';
        }
      }
    } catch (e) { /* fall through to the revocation message */ }
    try {
      if (fc && typeof fc.showRevocationMessage === 'function') { fc.showRevocationMessage(); return 'revocation'; }
    } catch (e) { /* CMP not reachable */ }
    return 'none';
  }

  /** Local preview or test (localhost, 127.0.0.1, ::1, file:, ?stats_test=1) – no Google script is loaded there. */
  function isLocalHost(hostname, protocol, search) {
    if (protocol === 'file:' || /[?&]stats_test=1(&|$)/.test(String(search || ''))) return true;
    var h = String(hostname || '').toLowerCase();
    return h === 'localhost' || h === '127.0.0.1' || h === '::1' || h === '[::1]';
  }

  /* ---------- interim statistics window (since 5 Nov 2026) ----------
   * Google's consent message is published but currently reports displayStatus "hidden", so no TCF decision
   * ever arrives and Google Analytics never starts. While that is so, an own small window asks for statistics
   * only. The pure rules live here (testable in Node); the window itself is built in site.js. */
  var STATS_KEY = 'csg-stats', STATS_VERSION = 1, STATS_MONTHS = 12, STATS_WAIT_MS = 3000;

  /**
   * What Google's CMP has said with this TCF event:
   *   'decided' – useractioncomplete, or tcloaded with a non-empty tcString (a stored decision)
   *   'outside' – gdprApplies === false (the site's normal logic for non-EU visitors applies)
   *   'showing' – its own message is on screen (cmpuishown or displayStatus "visible"; hidden/disabled do NOT count)
   *   'silent'  – nothing usable (no data, tcloaded without decision, cmpuishown with displayStatus hidden/disabled)
   */
  function cmpVoice(tc) {
    if (!tc || typeof tc !== 'object') return 'silent';
    if (tc.gdprApplies === false) return 'outside';
    if (tc.eventStatus === 'useractioncomplete') return 'decided';
    if (tc.eventStatus === 'tcloaded' && typeof tc.tcString === 'string' && tc.tcString !== '') return 'decided';
    if (tc.displayStatus === 'hidden' || tc.displayStatus === 'disabled') return 'silent';
    if (tc.displayStatus === 'visible' || tc.eventStatus === 'cmpuishown') return 'showing';
    return 'silent';
  }

  /** Same day and time STATS_MONTHS calendar months later (ms). */
  function statsExpiry(at) {
    var d = new Date(at);
    d.setMonth(d.getMonth() + STATS_MONTHS);
    return d.getTime();
  }

  /** Stored window choice (raw localStorage string) -> {v, choice, at} or null (missing, broken, other version, in the future, expired). */
  function readStatsChoice(raw, now) {
    var rec;
    try { rec = JSON.parse(raw); } catch (e) { return null; }
    if (!rec || typeof rec !== 'object' || rec.v !== STATS_VERSION) return null;
    if (rec.choice !== 'granted' && rec.choice !== 'denied') return null;
    if (typeof rec.at !== 'number' || !isFinite(rec.at) || rec.at > now) return null;
    return now < statsExpiry(rec.at) ? { v: rec.v, choice: rec.choice, at: rec.at } : null;
  }
  function statsRecord(choice, now) { return { v: STATS_VERSION, choice: choice === 'granted' ? 'granted' : 'denied', at: now }; }

  /**
   * Consent Mode update while the window decides: ONLY analytics_storage, never ad_* (they stay denied).
   * Granted only with a stored/selected 'granted', no Global Privacy Control and no U.S. opt-out
   * (initial CMP status 3 or a GPP opt-out 3).
   */
  function interimUpdate(rec, gpc, usInitial, gpp) {
    var ok = !!rec && rec.choice === 'granted' && gpc !== true && usInitial !== 3 && gpp !== 3;
    return { analytics_storage: ok ? 'granted' : 'denied' };
  }

  /**
   * A clear "no" to analytics from Google's CMP (then the _ga cookies are deleted, whether or not the window
   * was ever active): a real decision without purpose 1 or without Google (vendor 755), or a Consent Mode
   * analytics value DENIED (2) after a decision or outside the GDPR. Values that may still be on their way do not count.
   */
  function googleRefusesAnalytics(tc, modeValues) {
    var v = cmpVoice(tc);
    if (v === 'decided') {
      var p1 = tc.purpose && tc.purpose.consents && tc.purpose.consents[1] === true;
      var g = tc.vendor && tc.vendor.consents && tc.vendor.consents[GOOGLE_VENDOR] === true;
      if (!p1 || !g) return true;
    }
    return (v === 'decided' || v === 'outside') && !!modeValues && typeof modeValues === 'object' && modeValues.analyticsStoragePurposeConsentStatus === 2;
  }

  /** document.cookie assignments that delete every _ga / _ga_* cookie for the host itself and every parent domain. */
  function gaCookieWipes(cookieString, hostname) {
    var names = [];
    String(cookieString || '').split(';').forEach(function (c) {
      var n = c.split('=')[0].replace(/^\s+|\s+$/g, '');
      if (/^_ga($|_)/.test(n) && names.indexOf(n) < 0) names.push(n);
    });
    var parts = String(hostname || '').toLowerCase().split('.').filter(Boolean);
    var scopes = [''];
    for (var i = 0; i < parts.length - 1; i++) scopes.push('; domain=.' + parts.slice(i).join('.'));
    var out = [];
    names.forEach(function (n) {
      scopes.forEach(function (s) { out.push(n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0; path=/' + s); });
    });
    return out;
  }

  var api = { decideConsent: decideConsent, region: region, allDenied: allDenied, openPrivacyChoices: openPrivacyChoices, isLocalHost: isLocalHost, usStatusFromGpp: usStatusFromGpp, effectiveUsStatus: effectiveUsStatus, US_OPTED_OUT: 3,
    cmpVoice: cmpVoice, readStatsChoice: readStatsChoice, statsRecord: statsRecord, statsExpiry: statsExpiry, interimUpdate: interimUpdate, googleRefusesAnalytics: googleRefusesAnalytics, gaCookieWipes: gaCookieWipes,
    STATS_KEY: STATS_KEY, STATS_VERSION: STATS_VERSION, STATS_WAIT_MS: STATS_WAIT_MS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CSGConsent = api;
})(this);
