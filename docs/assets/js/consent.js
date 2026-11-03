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

  var api = { decideConsent: decideConsent, region: region, allDenied: allDenied, openPrivacyChoices: openPrivacyChoices, isLocalHost: isLocalHost, usStatusFromGpp: usStatusFromGpp, effectiveUsStatus: effectiveUsStatus, US_OPTED_OUT: 3 };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CSGConsent = api;
})(this);
