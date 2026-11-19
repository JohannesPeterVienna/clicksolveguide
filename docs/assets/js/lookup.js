/*
 * ClickSolve Guide – reference lookup UI: the "paste what the screen says" box, the table filters
 * and the CSV export of the reference tables. Results are built with createElement and textContent
 * only. Nothing typed here leaves the browser: the data file is a static file from this site.
 */
(function () {
  'use strict';
  var R = window.CSGRef;
  if (!R) return;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
  function today() {
    var d = new Date();
    function p(x) { return (x < 10 ? '0' : '') + x; }
    return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
  }

  /* ---------- lookup box ---------- */
  var box = document.getElementById('lookup');
  var data = null, loading = null;
  function load() {
    if (data) return Promise.resolve(data);
    if (!loading) {
      var src = box.getAttribute('data-src');
      loading = fetch(src, { credentials: 'omit' }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      }).then(function (j) { data = j; return j; }, function (e) { loading = null; throw e; });
    }
    return loading;
  }

  function resultCard(r, q) {
    var card = el('article', 'lk-card');
    card.setAttribute('data-kind', r.kind);
    card.setAttribute('data-found', r.found ? 'yes' : 'no');
    var KIND = { chrome: 'Chrome network error', wu: 'Windows Update error', http: 'HTTP status code', port: 'Network port', ip: 'IP address', winbuild: 'Windows build' };
    card.appendChild(el('p', 'diag-kicker', KIND[r.kind] + (r.found ? '' : ' · not in the list')));
    card.appendChild(el('h3', 'lk-title', r.title));
    if (r.lines.length) {
      var dl = el('dl', 'lk-lines');
      r.lines.forEach(function (l) { dl.appendChild(el('dt', null, l.k)); dl.appendChild(el('dd', null, l.v)); });
      card.appendChild(dl);
    }
    if (r.meaning) {
      var m = el('p', 'lk-meaning');
      m.appendChild(el('b', null, r.found ? 'What it tells you: ' : 'Note: '));
      m.appendChild(document.createTextNode(r.meaning));
      card.appendChild(m);
    }
    var links = el('p', 'lk-links');
    function link(o, cls, ext) {
      var a = el('a', cls, o.label);
      a.href = o.href;
      if (ext) a.rel = 'noopener';
      links.appendChild(a);
    }
    if (r.next) link(r.next, 'btn');
    if (r.ext) link(r.ext, 'btn ghost', true);
    if (r.page) link(r.page, 'btn ghost');
    card.appendChild(links);
    if (r.source) card.appendChild(el('p', 'small', 'Source: ' + r.source));
    var share = R.shareQuery(q);
    if (r.share && share) {
      var b = el('button', 'copy lk-share', 'Copy link to this result');
      b.type = 'button';
      b.setAttribute('data-copy', location.origin + (box.getAttribute('data-share-path') || location.pathname) + '#' + share);
      card.appendChild(b);
    } else if (r.kind === 'ip') {
      card.appendChild(el('p', 'small', 'No share link for addresses: an IP address can identify a connection, so it is never put into a link.'));
    }
    return card;
  }

  function run(q, focus) {
    var out = document.getElementById('lookup-out');
    clear(out);
    q = String(q || '').trim();
    if (!q) { out.appendChild(el('p', 'lk-none', 'Type or paste a code, an address or a number first.')); return; }
    if (!R.classify(q).length) {
      out.appendChild(el('p', 'lk-none', 'That does not look like something this lookup knows. It understands Chrome codes (ERR_…, DNS_PROBE_…), Windows Update codes (0x8024…), HTTP status codes (404), IP addresses (192.168.1.20 or fe80::1), port numbers (631) and Windows build numbers (26100.4946).'));
      return;
    }
    out.appendChild(el('p', 'lk-none', 'Loading the reference data…'));
    load().then(function (d) {
      clear(out);
      var rs = R.lookup(d, q, today());
      if (rs.length > 1) out.appendChild(el('p', 'small', 'This number can mean ' + rs.length + ' different things – all are shown.'));
      rs.forEach(function (r) { out.appendChild(resultCard(r, q)); });
      out.appendChild(el('p', 'small', 'Reference data retrieved from the sources on ' + d.retrieved + '.'));
      if (focus) { var h = out.querySelector('.lk-title'); if (h) { h.tabIndex = -1; h.focus(); } }
    }, function () {
      clear(out);
      out.appendChild(el('p', 'lk-none', 'The reference data could not be loaded. Check your connection and try again – the tables on the reference pages work without it.'));
    });
  }

  if (box) {
    var form = document.getElementById('lookup-form'), input = document.getElementById('lookup-q');
    form.addEventListener('submit', function (e) { e.preventDefault(); run(input.value, true); });
    box.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('button[data-q]') : null;
      if (!b) return;
      input.value = b.getAttribute('data-q');
      run(input.value, false);
    });
    // a query handed over from a guide or diagnosis page (kept in this tab's session storage, never in the address)
    var handed = '';
    try { handed = sessionStorage.getItem('csg-lookup') || ''; sessionStorage.removeItem('csg-lookup'); } catch (e) { handed = ''; }
    var shared = R.readShare(location.hash);
    if (handed && !shared) {
      input.value = handed.slice(0, 80);
      run(input.value, false);
    }
    var fromHash = function () {
      if (!/(^#|&)q=/.test(location.hash)) return;
      var q = R.readShare(location.hash);
      // valid or not: the fragment leaves the address bar (an invalid one is simply dropped)
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* keep the hash */ }
      if (!q) return;
      input.value = q;
      run(q, false);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash); // a shared link opened while this page is already showing
    box.classList.add('ready');
  }

  /* ---------- "look it up" forms on guide and diagnosis pages: hand the text to the reference page ---------- */
  function jump(q) {
    q = String(q || '').trim().slice(0, 80);
    if (!q) return;
    try { sessionStorage.setItem('csg-lookup', q); } catch (e) { /* storage blocked: codes can still travel in the fragment */ }
    var share = R.shareQuery(q);
    location.href = '/reference/' + (share ? '#' + share : '');
  }
  var jumps = document.querySelectorAll('form[data-lookup-jump]');
  for (var j = 0; j < jumps.length; j++) jumps[j].addEventListener('submit', function (e) {
    e.preventDefault();
    jump(e.target.querySelector('input').value);
  });
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('button[data-jump]') : null;
    if (b) jump(b.getAttribute('data-jump'));
  });

  /* ---------- table filter ---------- */
  var filters = document.querySelectorAll('input[data-filter-for]');
  for (var i = 0; i < filters.length; i++) (function (inp) {
    var table = document.getElementById(inp.getAttribute('data-filter-for'));
    var count = document.getElementById(inp.getAttribute('data-count'));
    if (!table) return;
    var rows = table.tBodies[0].rows, total = rows.length;
    function apply() {
      var shown = 0;
      for (var r = 0; r < total; r++) {
        var ok = R.matches(rows[r].textContent, inp.value);
        rows[r].hidden = !ok;
        if (ok) shown++;
      }
      if (count) count.textContent = inp.value.trim() ? shown + ' of ' + total + ' rows match' : total + ' rows';
    }
    inp.addEventListener('input', apply);
    apply();
  })(filters[i]);

  /* ---------- CSV export of a table (visible rows) ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('button[data-csv-for]') : null;
    if (!b) return;
    var table = document.getElementById(b.getAttribute('data-csv-for'));
    if (!table) return;
    var out = [], trs = table.rows;
    for (var r = 0; r < trs.length; r++) {
      if (trs[r].hidden) continue;
      var cells = [];
      for (var c = 0; c < trs[r].cells.length; c++) cells.push(trs[r].cells[c].textContent.replace(/\s+/g, ' ').trim());
      out.push(cells);
    }
    out.push(['Source', b.getAttribute('data-source') || '']);
    var blob = new Blob(['﻿' + R.toCsv(out)], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = b.getAttribute('data-file') || 'clicksolveguide-table.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  });
})();
