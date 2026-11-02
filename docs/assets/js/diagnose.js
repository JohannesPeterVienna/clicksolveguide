/*
 * ClickSolve Guide – diagnosis UI. Reads the JSON tree embedded in the page, renders one check at a
 * time, crosses out layers on the Layer Map and builds the fix log. DOM is built with createElement
 * and textContent only. Answers and notes stay in this browser (localStorage).
 */
(function () {
  'use strict';
  var C = window.CSGCore;
  var tool = document.getElementById('tool');
  var dataEl = document.getElementById('tree-data');
  if (!C || !tool || !dataEl) return;
  var tree;
  try { tree = JSON.parse(dataEl.textContent); } catch (e) { return; }
  var KEY = 'csg-diag-' + tree.id;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify({ answers: state.answers, notes: notes.value })); } catch (e) { /* storage blocked */ } }

  var saved = load();
  var state = C.replay(tree, saved && Array.isArray(saved.answers) ? saved.answers : []);
  var card = document.getElementById('diag-card');
  var hist = document.getElementById('diag-hist');
  var live = tool.querySelector('.lm-live');
  var notes = document.getElementById('diag-notes');
  var preview = document.getElementById('fixlog-preview');
  var mapItems = tool.querySelectorAll('.layermap li');
  if (saved && typeof saved.notes === 'string') notes.value = saved.notes;

  var WORD = { open: 'not checked', clear: 'ruled out', suspect: 'suspect', likely: 'likely here' };

  function version() { return window.CSGSite && window.CSGSite.currentVersion() || null; }

  function renderMap(prev) {
    var changed = [];
    for (var i = 0; i < mapItems.length; i++) {
      var li = mapItems[i], id = li.getAttribute('data-layer'), s = state.layers[id] || 'open';
      li.setAttribute('data-state', s);
      li.querySelector('.lm-state').textContent = WORD[s];
      if (prev && prev[id] !== s) changed.push(C.layerLabel(tree, id) + ': ' + WORD[s]);
    }
    if (changed.length) live.textContent = 'Layer map updated – ' + changed.join(', ') + '.';
  }

  function stepBox(s, n) {
    var box = el('div', 'dstep');
    var head = el('div', 'dstep-head');
    head.appendChild(el('span', 'step-n', String(n).padStart(2, '0')));
    head.appendChild(el('h4', null, s.title));
    box.appendChild(head);
    var meta = el('p', 'step-meta');
    meta.appendChild(el('span', 'risk risk-' + s.risk, C.RISKS[s.risk]));
    if (s.time) meta.appendChild(el('span', 'step-time', s.time));
    box.appendChild(meta);
    box.appendChild(el('p', null, s.text));
    if (s.paths) {
      var w = el('p', 'where');
      w.appendChild(el('b', null, 'Where: '));
      var sp = el('span', 'mpath');
      sp.setAttribute('data-paths', JSON.stringify(s.paths));
      sp.appendChild(el('span', 'mp-os', ''));
      w.appendChild(sp);
      box.appendChild(w);
    }
    (s.cmds || []).forEach(function (c) {
      var cb = el('div', 'cmd');
      cb.setAttribute('data-os', c.os);
      var ch = el('div', 'cmd-head');
      ch.appendChild(el('span', 'cmd-os', (c.os === 'win' ? 'Windows' : 'macOS') + ' · ' + (c.shell || (c.os === 'win' ? 'Command Prompt or Terminal' : 'Terminal'))));
      if (c.admin) ch.appendChild(el('span', 'risk risk-admin', C.RISKS.admin));
      var btn = el('button', 'copy', 'Copy');
      btn.type = 'button';
      btn.setAttribute('data-copy', c.code);
      btn.setAttribute('aria-label', 'Copy command: ' + c.code);
      ch.appendChild(btn);
      cb.appendChild(ch);
      var pre = el('pre'); pre.appendChild(el('code', null, c.code)); cb.appendChild(pre);
      var p1 = el('p', 'cmd-what'); p1.appendChild(el('b', null, 'What it does: ')); p1.appendChild(document.createTextNode(c.what)); cb.appendChild(p1);
      if (c.not) { var p2 = el('p', 'cmd-not'); p2.appendChild(el('b', null, 'What it does not do: ')); p2.appendChild(document.createTextNode(c.not)); cb.appendChild(p2); }
      box.appendChild(cb);
    });
    if (s.cmds && s.cmds.length) {
      var phone = el('p', 'cmd-phone', 'No command needed on a phone or tablet – use the menu path above.');
      phone.setAttribute('data-show-for', 'none');
      box.appendChild(phone);
    }
    if (s.undo) { var u = el('p', 'undo'); u.appendChild(el('b', null, 'Undo: ')); u.appendChild(document.createTextNode(s.undo)); box.appendChild(u); }
    return box;
  }

  function renderCard(focus) {
    while (card.firstChild) card.removeChild(card.firstChild);
    var n = tree.nodes[state.node];
    var kicker = el('p', 'diag-kicker');
    var h = el('h3', 'diag-q');
    h.tabIndex = -1;
    if (n.type === 'question') {
      card.setAttribute('data-kind', 'question');
      kicker.textContent = 'Check ' + String(state.path.length + 1).padStart(2, '0') + (n.layer ? ' · testing: ' + C.layerLabel(tree, n.layer) : '');
      h.textContent = n.q;
      card.appendChild(kicker); card.appendChild(h);
      if (n.hint) card.appendChild(el('p', 'diag-hint', n.hint));
      if (n.steps && n.steps.length) {
        card.appendChild(el('p', 'diag-sub', 'How to check'));
        n.steps.forEach(function (id, i) { card.appendChild(stepBox(tree.steps[id], i + 1)); });
      }
      var group = el('div', 'answers');
      group.setAttribute('role', 'group');
      group.setAttribute('aria-label', 'Your answer');
      group.appendChild(el('p', 'diag-sub', 'Your answer'));
      n.answers.forEach(function (a, i) {
        var b = el('button', 'answer', a.label);
        b.type = 'button';
        b.addEventListener('click', function () { var prev = state.layers; state = C.choose(tree, state, i); after(prev); });
        group.appendChild(b);
      });
      card.appendChild(group);
    } else {
      card.setAttribute('data-kind', n.type);
      if (n.type === 'stop') kicker.textContent = 'Hard stop';
      else kicker.textContent = n.likely ? 'Likely here: ' + [].concat(n.likely).map(function (l) { return C.layerLabel(tree, l); }).join(' + ') : 'Result';
      h.textContent = n.title;
      card.appendChild(kicker); card.appendChild(h);
      card.appendChild(el('p', 'diag-text', n.text));
      if (n.type === 'stop') {
        card.appendChild(el('p', 'diag-sub', 'What you can safely do'));
        var ul = el('ul', 'safe');
        n.safe.forEach(function (s) { ul.appendChild(el('li', null, s)); });
        card.appendChild(ul);
      }
      if (n.steps && n.steps.length) {
        card.appendChild(el('p', 'diag-sub', 'Do these steps in this order'));
        n.steps.forEach(function (id, i) { card.appendChild(stepBox(tree.steps[id], i + 1)); });
      }
      if (n.why) { var w = el('p', 'diag-why'); w.appendChild(el('b', null, 'Why this conclusion: ')); w.appendChild(document.createTextNode(n.why)); card.appendChild(w); }
      if (n.link) {
        var a = el('a', 'btn', n.link.label);
        a.href = n.link.href;
        card.appendChild(a);
      }
    }
    if (window.CSGSite) window.CSGSite.applyVersion();
    if (focus) h.focus();
  }

  function renderHistory() {
    while (hist.firstChild) hist.removeChild(hist.firstChild);
    state.path.forEach(function (p) {
      var n = tree.nodes[p.node];
      var li = el('li');
      li.appendChild(el('span', 'h-q', n.q));
      li.appendChild(el('span', 'h-a', n.answers[p.answer].label));
      hist.appendChild(li);
    });
    if (!state.path.length) hist.appendChild(el('li', 'h-empty', 'No answers yet – start with the first check.'));
    document.getElementById('diag-back').disabled = !state.path.length;
    document.getElementById('diag-reset').disabled = !state.path.length;
  }

  function logText() {
    var d = new Date();
    return C.fixLog(tree, state, { version: version(), notes: notes.value, date: d.toLocaleString(), url: location.origin + location.pathname });
  }
  function renderLog() { preview.textContent = logText(); }

  function after(prev) { renderMap(prev); renderCard(true); renderHistory(); renderLog(); save(); }

  document.getElementById('diag-back').addEventListener('click', function () { var prev = state.layers; state = C.back(tree, state); after(prev); });
  document.getElementById('diag-reset').addEventListener('click', function () { var prev = state.layers; state = C.replay(tree, []); after(prev); });
  notes.addEventListener('input', function () { renderLog(); save(); });
  document.addEventListener('csg:version', renderLog);

  document.getElementById('log-txt').addEventListener('click', function () {
    var blob = new Blob([logText()], { type: 'text/plain;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'fix-log-' + tree.id + '.txt';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  });
  document.getElementById('log-print').addEventListener('click', function () {
    var area = document.getElementById('print-area');
    if (!area) { area = el('div'); area.id = 'print-area'; document.body.appendChild(area); }
    while (area.firstChild) area.removeChild(area.firstChild);
    area.appendChild(el('pre', null, logText()));
    document.body.classList.add('print-log');
    window.print();
  });
  window.addEventListener('afterprint', function () { document.body.classList.remove('print-log'); });

  tool.classList.add('ready');
  renderMap(null); renderCard(false); renderHistory(); renderLog();
})();
