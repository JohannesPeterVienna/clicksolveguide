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

  var api = { decideConsent: decideConsent, region: region, allDenied: allDenied };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CSGConsent = api;
})(this);
