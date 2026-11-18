/*
 * ClickSolve Guide – reference lookup core (pure functions, no DOM).
 * Used by lookup.js in the browser and by tests/reference.test.js in Node.
 *
 * The data object (assets/data/lookup.json) is built from the primary sources named on the
 * reference pages: Chromium's net_error_list.h, the IANA registries, Microsoft Learn and Apple Support.
 * Everything here only reads that data; an input never becomes markup or a formula.
 */
(function (root) {
  'use strict';

  /* ---------- IP addresses ---------- */

  /** "192.168.1.20" -> [192,168,1,20]; null when it is not a dotted IPv4 address. */
  function parseIPv4(s) {
    var m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(String(s).trim());
    if (!m) return null;
    var out = [];
    for (var i = 1; i <= 4; i++) {
      var n = parseInt(m[i], 10);
      if (n > 255 || (m[i].length > 1 && m[i].charAt(0) === '0')) return null;
      out.push(n);
    }
    return out;
  }

  /** IPv6 text -> 16 bytes; accepts "::", an embedded IPv4 tail and a %zone suffix; null when invalid. */
  function parseIPv6(s) {
    var t = String(s).trim().toLowerCase();
    if (t.charAt(0) === '[' && t.charAt(t.length - 1) === ']') t = t.slice(1, -1);
    var zone = t.indexOf('%');
    if (zone >= 0) t = t.slice(0, zone);
    if (t.indexOf(':') < 0 || !/^[0-9a-f:.]+$/.test(t) || t.length > 45) return null;
    var tail = [];
    var lastColon = t.lastIndexOf(':');
    if (t.indexOf('.') >= 0) {
      var v4 = parseIPv4(t.slice(lastColon + 1));
      if (!v4) return null;
      tail = [(v4[0] << 8) | v4[1], (v4[2] << 8) | v4[3]];
      t = t.slice(0, lastColon + 1);
      if (t.slice(-2) !== '::') t = t.slice(0, -1);
      if (t === '') return null;
    }
    var halves = t.split('::');
    if (halves.length > 2) return null;
    function groups(part) {
      if (part === '') return [];
      var gs = part.split(':'), out = [];
      for (var i = 0; i < gs.length; i++) {
        if (!/^[0-9a-f]{1,4}$/.test(gs[i])) return null;
        out.push(parseInt(gs[i], 16));
      }
      return out;
    }
    var head = groups(halves[0]), rest = halves.length === 2 ? groups(halves[1]) : [];
    if (!head || !rest) return null;
    rest = rest.concat(tail);
    var words;
    if (halves.length === 2) {
      var fill = 8 - head.length - rest.length;
      if (fill < 1) return null;
      words = head;
      for (var f = 0; f < fill; f++) words.push(0);
      words = words.concat(rest);
    } else {
      words = head.concat(rest);
      if (words.length !== 8) return null;
    }
    var bytes = [];
    for (var w = 0; w < 8; w++) { bytes.push(words[w] >> 8, words[w] & 255); }
    return bytes;
  }

  /** Does the byte array lie inside "block/len"? Works for IPv4 (4 bytes) and IPv6 (16 bytes). */
  function inBlock(bytes, block) {
    var i = block.lastIndexOf('/');
    if (i < 0) return false;
    var base = block.slice(0, i), len = parseInt(block.slice(i + 1), 10);
    var b = bytes.length === 4 ? parseIPv4(base) : parseIPv6(base);
    if (!b || b.length !== bytes.length || !(len >= 0 && len <= bytes.length * 8)) return false;
    for (var k = 0; k < bytes.length; k++) {
      var bits = Math.min(8, Math.max(0, len - k * 8));
      if (!bits) break;
      var mask = (0xff << (8 - bits)) & 0xff;
      if ((bytes[k] & mask) !== (b[k] & mask)) return false;
    }
    return true;
  }

  /** Most specific registry entry containing the address, or null (= ordinary public address). */
  function ipRange(bytes, list) {
    var best = null, bestLen = -1;
    (list || []).forEach(function (e) {
      var len = parseInt(e.block.slice(e.block.lastIndexOf('/') + 1), 10);
      if (inBlock(bytes, e.block) && len > bestLen) { best = e; bestLen = len; }
    });
    return best;
  }

  /* ---------- classification of a typed query ---------- */

  /**
   * What could this text be? Returns an array of { kind, key } – several when a number is ambiguous
   * (443 is a port, 404 is an HTTP status and could be a port). Kinds: chrome, wu, http, port, ip, winbuild.
   */
  function classify(q) {
    var t = String(q == null ? '' : q).trim();
    if (!t || t.length > 80) return [];
    var out = [];
    var m;
    if ((m = /^(?:net::)?((?:ERR|DNS_PROBE)_[A-Z0-9_]+)$/i.exec(t))) return [{ kind: 'chrome', key: m[1].toUpperCase() }];
    if ((m = /^-(\d{1,3})$/.exec(t))) return [{ kind: 'chrome', key: -parseInt(m[1], 10) }];
    if ((m = /^0x([0-9a-f]{8})$/i.exec(t))) return [{ kind: 'wu', key: '0x' + m[1].toUpperCase() }];
    if (parseIPv4(t)) return [{ kind: 'ip', key: t }];
    if (t.indexOf(':') >= 0 && parseIPv6(t)) return [{ kind: 'ip', key: t }];
    if ((m = /^(?:http\s*)?(\d{3})$/i.exec(t))) {
      var n = parseInt(m[1], 10);
      if (n >= 100 && n <= 599) out.push({ kind: 'http', key: n });
      if (/^\d+$/.test(t)) out.push({ kind: 'port', key: n });
      return out;
    }
    // Windows: "22631", "22631.4460", "10.0.22631.4460", also with "build" in front
    if ((m = /^(?:(?:os\s*)?build\s*)?(?:10\.0\.)?(\d{5})(?:\.(\d{1,5}))?$/i.exec(t))) {
      out.push({ kind: 'winbuild', key: parseInt(m[1], 10), rev: m[2] ? parseInt(m[2], 10) : null });
      if (/^\d{5}$/.test(t) && parseInt(t, 10) <= 65535) out.push({ kind: 'port', key: parseInt(t, 10) });
      return out;
    }
    if ((m = /^(?:port\s*)?(\d{1,5})$/i.exec(t)) && parseInt(m[1], 10) <= 65535) return [{ kind: 'port', key: parseInt(m[1], 10) }];
    return [];
  }

  /* ---------- lookups in the data ---------- */

  function httpClass(n) {
    return { 1: 'Informational', 2: 'Successful', 3: 'Redirection', 4: 'Client error', 5: 'Server error' }[Math.floor(n / 100)] || '';
  }

  /**
   * One query -> list of results. A result: { kind, found, title, lines:[{k,v}], meaning, next:{href,label}|null,
   * page:{href,label}, source, share } – only plain strings, rendered with textContent.
   */
  function lookup(data, q, today) {
    var results = [];
    classify(q).forEach(function (c) {
      var r = { kind: c.kind, found: false, title: '', lines: [], meaning: '', next: null, page: null, source: '', share: true };
      if (c.kind === 'chrome') {
        r.page = { href: '/reference/chrome-error-codes/', label: 'All Chrome network error codes' };
        r.source = data.sources.chrome;
        var e = null;
        data.chrome.forEach(function (x) { if (x.name === c.key || x.code === c.key) e = x; });
        var probe = null;
        (data.probe || []).forEach(function (x) { if (x.name === c.key) probe = x; });
        if (e) {
          r.found = true;
          r.title = e.name + ' (' + e.code + ')';
          r.lines.push({ k: 'Chromium’s description', v: e.desc || 'no comment in the source file' });
          r.lines.push({ k: 'Range', v: e.range + ' errors' });
          var adv = data.advice.chrome[e.name] || data.advice.chromeRange[e.range];
          if (adv) { r.meaning = adv.meaning; r.next = adv.next || null; }
        } else if (probe) {
          r.found = true;
          r.title = probe.name;
          r.lines.push({ k: 'Chromium’s description', v: probe.desc });
          r.lines.push({ k: 'Kind', v: 'Result of Chrome’s own DNS test (DNS probe status)' });
          var pa = data.advice.probe[probe.name];
          if (pa) { r.meaning = pa.meaning; r.next = pa.next || null; }
        } else {
          r.title = String(c.key);
          r.meaning = 'This code is not in Chromium’s list of network errors as retrieved on ' + data.retrieved + '. Check the spelling – the code is printed in small grey letters on Chrome’s error page.';
        }
      } else if (c.kind === 'wu') {
        r.page = { href: '/reference/windows-update-error-codes/', label: 'All Windows Update error codes' };
        r.source = data.sources.wu;
        var hits = data.wu.filter(function (x) { return x.code === c.key; });
        r.title = c.key;
        if (hits.length) {
          r.found = true;
          hits.forEach(function (h) {
            r.lines.push({ k: h.message, v: h.desc + ' (' + h.component + ')' });
          });
          var common = hits.filter(function (h) { return h.anchor; })[0];
          r.meaning = common ? data.advice.wu.common : data.advice.wu.listed;
          r.next = { href: '/guides/windows-update-stuck/', label: 'Windows Update stuck: what is safe, in which order' };
          if (common) r.ext = { href: data.advice.wu.commonUrl + '#' + common.anchor, label: 'Microsoft’s mitigation for ' + c.key };
        } else {
          r.meaning = data.advice.wu.missing;
          r.next = { href: '/guides/windows-update-stuck/', label: 'Windows Update stuck: what is safe, in which order' };
        }
      } else if (c.kind === 'http') {
        r.page = { href: '/reference/http-status-codes/', label: 'All HTTP status codes' };
        r.source = data.sources.http;
        var h = null;
        data.http.forEach(function (x) { if (x.code === c.key) h = x; });
        r.title = 'HTTP ' + c.key + (h ? ' ' + h.desc : '');
        var cls = httpClass(c.key);
        if (h) {
          r.found = true;
          r.lines.push({ k: 'Registered name', v: h.desc });
          r.lines.push({ k: 'Class', v: cls + ' (' + Math.floor(c.key / 100) + 'xx)' });
          r.lines.push({ k: 'Defined in', v: h.ref });
        } else {
          r.lines.push({ k: 'Class', v: cls + ' (' + Math.floor(c.key / 100) + 'xx)' });
        }
        var ha = data.advice.http[String(c.key)] || data.advice.httpClass[String(Math.floor(c.key / 100))];
        r.meaning = (h ? '' : 'This number is not assigned in the IANA registry (retrieved ' + data.retrieved + '); a server may still send it. ') + (ha ? ha.meaning : '');
        r.next = ha && ha.next || null;
      } else if (c.kind === 'port') {
        r.page = { href: '/reference/network-ports/', label: 'Port reference' };
        r.source = data.sources.ports;
        var ps = data.ports.filter(function (x) { return x.port === c.key; });
        r.title = 'Port ' + c.key;
        if (ps.length) {
          r.found = true;
          ps.forEach(function (p) {
            r.lines.push({ k: p.service + ' (' + p.transport.join(', ').toUpperCase() + ')', v: p.desc + (p.ref ? ' – ' + p.ref : '') });
          });
          r.meaning = ps.map(function (p) { return p.where; }).filter(Boolean).join(' ');
        } else {
          r.meaning = c.key === 0 || c.key > 65535 ? 'Port numbers run from 0 to 65535.' : 'Port ' + c.key + ' is not in the selection on this site. The full list of registered ports is the IANA registry linked on the port reference page; ports from 49152 to 65535 are never registered – they are for temporary use.';
        }
      } else if (c.kind === 'ip') {
        r.page = { href: '/reference/ip-address-check/', label: 'IP address check and special ranges' };
        r.share = false; // an address is personal data: it never goes into a link
        var v4 = parseIPv4(c.key), bytes = v4 || parseIPv6(c.key);
        var entry = ipRange(bytes, v4 ? data.ip.v4 : data.ip.v6);
        r.source = v4 ? data.sources.ipv4 : data.sources.ipv6;
        r.title = c.key;
        r.found = true;
        r.lines.push({ k: 'Type', v: v4 ? 'IPv4 address' : 'IPv6 address' });
        if (entry) {
          r.lines.push({ k: 'Range', v: entry.block + ' – ' + entry.name });
          r.lines.push({ k: 'Defined in', v: entry.rfc + (entry.extra ? ' (not part of the special-purpose registry)' : '') });
          r.lines.push({ k: 'Reachable from the internet', v: entry.global === 'True' ? 'yes' : entry.global === 'False' ? 'no' : entry.global });
          var ia = data.advice.ip[entry.block] || data.advice.ip[entry.name];
          r.meaning = ia ? ia.meaning : 'A special-purpose range. It is not an address a home device normally gets from a router.';
          r.next = ia && ia.next || null;
        } else {
          var isGlobal6 = !v4 && inBlock(bytes, '2000::/3');
          r.lines.push({ k: 'Range', v: v4 ? 'not in a special-purpose range: a public address' : (isGlobal6 ? '2000::/3 – global unicast (public) address' : 'outside the ranges assigned for use today') });
          r.meaning = v4 ? data.advice.ip.publicV4.meaning : (isGlobal6 ? data.advice.ip.publicV6.meaning : 'This IPv6 address is neither in a special-purpose range nor in 2000::/3, the block from which public addresses are handed out. Check for a typing mistake.');
        }
      } else if (c.kind === 'winbuild') {
        r.page = { href: '/reference/windows-macos-versions/', label: 'Windows builds and macOS versions' };
        r.source = data.sources.win;
        var w = null;
        data.win.forEach(function (x) { if (x.build === c.key) w = x; });
        r.title = 'Windows build ' + c.key + (c.rev != null ? '.' + c.rev : '');
        if (w) {
          r.found = true;
          r.lines.push({ k: 'Version', v: w.product + ', version ' + w.version });
          var row = w.rows[0];
          if (row) {
            r.lines.push({ k: 'Released', v: row.available + ' (' + row.servicing + ')' });
            r.lines.push({ k: 'End of updates, Home and Pro', v: row.endHome });
            r.lines.push({ k: 'End of updates, Enterprise and Education', v: row.endEnt });
            r.lines.push({ k: 'Latest build listed by Microsoft', v: row.latestBuild + ' (' + row.latestDate + ')' });
            var over = /^\d{4}-\d{2}-\d{2}$/.test(row.endHome) && today && today > row.endHome;
            var ended = !/^\d{4}/.test(row.endHome);
            var latestRev = parseInt(row.latestBuild.split('.')[1], 10);
            r.meaning = (ended || over
              ? 'Microsoft lists this version' + (over ? ' with an end date for Home and Pro that has passed (' + row.endHome + ').' : ' as “' + row.endHome + '” for Home and Pro editions.') + ' Without security updates a PC should move to a supported version; Windows Update or the PC maker says whether it can.'
              : 'Microsoft lists this version as serviced for Home and Pro editions until ' + row.endHome + '.')
              + (c.rev != null && latestRev ? (c.rev < latestRev ? ' Your build ends in .' + c.rev + ', Microsoft’s latest listed build ends in .' + latestRev + ': updates are waiting to be installed.' : ' Your build number is at Microsoft’s latest listed build (.' + latestRev + ') or newer.') : '');
          } else {
            r.meaning = 'Microsoft’s release page does not list this version among the versions that receive updates for Home and Pro editions (retrieved ' + data.retrieved + ').' + (w.ltsc ? ' Long-Term Servicing Channel (LTSC) editions of it have their own dates on Microsoft’s page.' : '') + ' Menu paths on this site: choose “' + w.product + '” in the version switcher.';
          }
          r.next = { href: '/guides/which-windows-macos-version/', label: 'Where each system shows its version' };
        } else {
          r.meaning = 'Build ' + c.key + ' is not on Microsoft’s release pages for Windows 10 and Windows 11 as retrieved on ' + data.retrieved + '. It may be a preview (Insider) build or a server edition.';
        }
      }
      results.push(r);
    });
    return results;
  }

  /* ---------- export helpers ---------- */

  /** One CSV cell: quoted, quotes doubled; a leading = + - @ (also after tab/CR) is defused with an apostrophe. */
  function csvCell(v) {
    var s = String(v == null ? '' : v);
    if (/^[=+\-@\t\r]/.test(s)) s = '\'' + s;
    return '"' + s.replace(/"/g, '""') + '"';
  }
  function toCsv(rows) {
    return rows.map(function (r) { return r.map(csvCell).join(','); }).join('\r\n') + '\r\n';
  }

  /** Query for a share link: only codes and numbers, never an address. Returns '' when it must not be shared. */
  function shareQuery(q) {
    var cs = classify(q);
    if (!cs.length || cs.some(function (c) { return c.kind === 'ip'; })) return '';
    return 'q=' + encodeURIComponent(String(q).trim());
  }
  function readShare(hash) {
    var m = /(?:^|[#&])q=([^&]*)/.exec(String(hash || ''));
    if (!m) return '';
    var v;
    try { v = decodeURIComponent(m[1]); } catch (e) { return ''; }
    v = v.slice(0, 80);
    return classify(v).length && shareQuery(v) ? v.trim() : '';
  }

  /** Row filter for the reference tables: every word of the query must occur in the row text. */
  function matches(text, query) {
    var words = String(query || '').toLowerCase().split(/\s+/).filter(Boolean);
    var t = String(text).toLowerCase();
    return words.every(function (w) { return t.indexOf(w) >= 0; });
  }

  var api = {
    parseIPv4: parseIPv4, parseIPv6: parseIPv6, inBlock: inBlock, ipRange: ipRange,
    classify: classify, lookup: lookup, httpClass: httpClass,
    csvCell: csvCell, toCsv: toCsv, shareQuery: shareQuery, readShare: readShare, matches: matches
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CSGRef = api;
})(this);
