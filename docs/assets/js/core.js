/*
 * ClickSolve Guide – diagnosis core (pure functions, no DOM).
 * Used by diagnose.js in the browser and by tests/core.test.js in Node.
 *
 * A tree is JSON: { id, title, layers:[{id,label}], start, steps:{...}, nodes:{...} }.
 * Node types: "question" (answers -> next), "result" (likely layer + steps), "stop" (hard stop).
 * The state is only the list of chosen answer indexes; everything else is replayed from it,
 * so "back" and reloading from localStorage can never produce an inconsistent layer map.
 */
(function (root) {
  'use strict';

  var VERSIONS = {
    win11: 'Windows 11', win10: 'Windows 10',
    macnew: 'macOS 13 Ventura or later', macold: 'macOS 12 Monterey or earlier',
    ios: 'iPhone / iPad', android: 'Android'
  };
  var ORDER = ['win11', 'win10', 'macnew', 'macold', 'ios', 'android'];
  var RISKS = {
    harmless: 'Harmless',
    setting: 'Changes a setting',
    admin: 'Admin needed',
    last: 'Last resort'
  };

  function validateTree(t) {
    var errs = [];
    if (!t || typeof t !== 'object') return ['tree missing'];
    ['id', 'title', 'start'].forEach(function (k) { if (!t[k]) errs.push('missing ' + k); });
    if (!Array.isArray(t.layers) || t.layers.length < 3) errs.push('needs at least 3 layers');
    var layerIds = (t.layers || []).map(function (l) { return l.id; });
    var nodes = t.nodes || {}, steps = t.steps || {};
    if (!nodes[t.start]) errs.push('start node "' + t.start + '" missing');
    function checkLayers(where, list) {
      (list || []).forEach(function (l) { if (layerIds.indexOf(l) < 0) errs.push(where + ': unknown layer ' + l); });
    }
    Object.keys(steps).forEach(function (sid) {
      var s = steps[sid];
      if (!s.title || !s.text) errs.push('step ' + sid + ': title/text missing');
      if (!RISKS[s.risk]) errs.push('step ' + sid + ': bad risk ' + s.risk);
      if (s.risk === 'setting' && !s.undo) errs.push('step ' + sid + ': setting change without undo');
      if (s.risk === 'last' && !s.undo) errs.push('step ' + sid + ': last resort without undo/consequence');
      (s.cmds || []).forEach(function (c, i) {
        if (c.os !== 'win' && c.os !== 'mac') errs.push('step ' + sid + ' cmd ' + i + ': bad os');
        if (!c.code || !c.what) errs.push('step ' + sid + ' cmd ' + i + ': code/what missing');
      });
      if (s.paths) Object.keys(s.paths).forEach(function (k) { if (!VERSIONS[k]) errs.push('step ' + sid + ': unknown version ' + k); });
    });
    Object.keys(nodes).forEach(function (id) {
      var n = nodes[id];
      (n.steps || []).forEach(function (s) { if (!steps[s]) errs.push(id + ': unknown step ' + s); });
      if (n.type === 'question') {
        if (!n.q) errs.push(id + ': question text missing');
        if (!Array.isArray(n.answers) || n.answers.length < 2) errs.push(id + ': needs at least 2 answers');
        (n.answers || []).forEach(function (a, i) {
          if (!a.label) errs.push(id + ' answer ' + i + ': label missing');
          if (!nodes[a.next]) errs.push(id + ' answer ' + i + ': next "' + a.next + '" missing');
          checkLayers(id + ' answer ' + i, a.clear);
          checkLayers(id + ' answer ' + i, a.suspect);
        });
      } else if (n.type === 'result') {
        if (!n.title || !n.text) errs.push(id + ': result title/text missing');
        checkLayers(id, [].concat(n.likely || []));
      } else if (n.type === 'stop') {
        if (!n.title || !n.text || !Array.isArray(n.safe) || !n.safe.length) errs.push(id + ': stop needs title, text and safe actions');
      } else errs.push(id + ': unknown type ' + n.type);
    });
    // every node reachable, no cycles
    var seen = {}, cyc = false;
    (function walk(id, stack) {
      if (stack.indexOf(id) >= 0) { cyc = true; errs.push('cycle at ' + id); return; }
      seen[id] = true;
      var n = nodes[id];
      if (n && n.type === 'question') n.answers.forEach(function (a) { if (nodes[a.next] && !cyc) walk(a.next, stack.concat(id)); });
    })(t.start, []);
    Object.keys(nodes).forEach(function (id) { if (!seen[id]) errs.push('unreachable node ' + id); });
    return errs;
  }

  /** Replays answers from the start. Invalid indexes stop the replay (returns the valid prefix). */
  function replay(t, answers) {
    var layers = {};
    t.layers.forEach(function (l) { layers[l.id] = 'open'; });
    var node = t.start, path = [];
    for (var i = 0; i < (answers || []).length; i++) {
      var n = t.nodes[node];
      var idx = answers[i];
      if (!n || n.type !== 'question' || typeof idx !== 'number' || !n.answers[idx]) break;
      var a = n.answers[idx];
      (a.clear || []).forEach(function (l) { layers[l] = 'clear'; });
      (a.suspect || []).forEach(function (l) { if (layers[l] !== 'clear') layers[l] = 'suspect'; });
      path.push({ node: node, answer: idx });
      node = a.next;
    }
    var end = t.nodes[node];
    if (end && end.type === 'result') [].concat(end.likely || []).forEach(function (l) { layers[l] = 'likely'; });
    return { node: node, path: path, answers: path.map(function (p) { return p.answer; }), layers: layers, done: !!end && end.type !== 'question' };
  }

  function choose(t, st, idx) { return replay(t, st.answers.concat([idx])); }
  function back(t, st) { return replay(t, st.answers.slice(0, -1)); }

  function resolvePath(paths, v) {
    if (!paths) return null;
    if (paths[v]) return { os: v, label: VERSIONS[v], text: paths[v], fallback: false };
    // same family first (Windows 10 <-> 11, older <-> newer macOS)
    var sib = { win11: 'win10', win10: 'win11', macnew: 'macold', macold: 'macnew' }[v];
    var k = sib && paths[sib] ? sib : ORDER.filter(function (o) { return paths[o]; })[0];
    if (!k) return null;
    return { os: k, label: VERSIONS[k], text: paths[k], fallback: true };
  }

  function family(v) {
    if (v === 'win11' || v === 'win10') return 'win';
    if (v === 'macnew' || v === 'macold') return 'mac';
    return null;
  }

  function layerLabel(t, id) {
    for (var i = 0; i < t.layers.length; i++) if (t.layers[i].id === id) return t.layers[i].label;
    return id;
  }

  /** Plain-text fix log. opts: { version, notes, date (string), url } */
  function fixLog(t, st, opts) {
    opts = opts || {};
    var v = opts.version, L = [];
    var line = '------------------------------------------------------------';
    L.push('CLICKSOLVE GUIDE – FIX LOG');
    L.push('Problem: ' + t.title);
    if (opts.date) L.push('Created: ' + opts.date);
    if (v && VERSIONS[v]) L.push('System: ' + VERSIONS[v]);
    if (opts.url) L.push('Diagnosis: ' + opts.url);
    L.push(line);
    L.push('LAYER MAP');
    t.layers.forEach(function (l) {
      var s = st.layers[l.id];
      var word = s === 'clear' ? 'ruled out' : s === 'suspect' ? 'suspect' : s === 'likely' ? 'LIKELY HERE' : 'not checked';
      L.push('  ' + pad(l.label, 22) + word);
    });
    L.push(line);
    L.push('CHECKS AND ANSWERS');
    if (!st.path.length) L.push('  (no checks answered yet)');
    st.path.forEach(function (p, i) {
      var n = t.nodes[p.node];
      L.push((i + 1) + '. ' + n.q);
      L.push('   Answer: ' + n.answers[p.answer].label);
    });
    var end = t.nodes[st.node];
    if (end && end.type !== 'question') {
      L.push(line);
      L.push((end.type === 'stop' ? 'HARD STOP: ' : 'RESULT: ') + end.title);
      L.push(wrap(end.text, 72, '  '));
      if (end.type === 'stop') {
        L.push('  Safe actions:');
        end.safe.forEach(function (s) { L.push(wrap('- ' + s, 72, '    ', '      ')); });
      }
      var steps = (end.steps || []).map(function (id) { return t.steps[id]; });
      if (steps.length) {
        L.push('  Recommended steps:');
        steps.forEach(function (s, i) {
          L.push('  ' + (i + 1) + ') ' + s.title + ' [' + RISKS[s.risk] + (s.time ? ', ' + s.time : '') + ']');
          var p = resolvePath(s.paths, v);
          if (p) L.push('     Where: ' + (p.fallback ? p.label + ': ' : '') + p.text);
          (s.cmds || []).forEach(function (c) { if (!family(v) || c.os === family(v)) L.push('     Command (' + (c.os === 'win' ? 'Windows' : 'macOS') + '): ' + c.code); });
          if (s.undo) L.push(wrap('Undo: ' + s.undo, 72, '     '));
        });
      }
    } else {
      L.push(line);
      L.push('Diagnosis not finished. Next check: ' + (end ? end.q : ''));
    }
    var notes = (opts.notes || '').trim();
    if (notes) { L.push(line); L.push('NOTES'); notes.split(/\r?\n/).forEach(function (n) { L.push('  ' + n); }); }
    L.push(line);
    L.push('Created in your browser by clicksolveguide.com. Nothing was sent anywhere.');
    L.push('Real support staff will never ask you to install remote-access software');
    L.push('from a pop-up or to pay with gift cards.');
    return L.join('\n');
  }

  function pad(s, n) { s = String(s); while (s.length < n) s += ' '; return s; }
  function wrap(text, width, indent, rest) {
    var words = String(text).split(/\s+/), out = [], cur = indent;
    words.forEach(function (w) {
      if (cur.length + w.length + 1 > width && cur.trim()) { out.push(cur.replace(/\s+$/, '')); cur = rest || indent; }
      cur += (cur.trim() ? ' ' : '') + w;
    });
    if (cur.trim()) out.push(cur);
    return out.join('\n');
  }

  /** Every complete answer sequence (for tests). */
  function allRuns(t) {
    var runs = [];
    (function go(answers) {
      var st = replay(t, answers);
      var n = t.nodes[st.node];
      if (n.type !== 'question') { runs.push({ answers: answers, end: st.node, state: st }); return; }
      n.answers.forEach(function (_, i) { go(answers.concat([i])); });
    })([]);
    return runs;
  }

  /**
   * Suggests a version key from what the browser reports. Returns null when unsure.
   * info: { ua, maxTouchPoints, platformVersion } – platformVersion from navigator.userAgentData
   * (Chromium browsers on Windows report 13 or higher on Windows 11, 1–10 on Windows 10).
   */
  function suggestVersion(info) {
    var ua = (info && info.ua) || '';
    if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
    if (/Macintosh/.test(ua) && info.maxTouchPoints > 1) return 'ios'; // iPadOS asks for desktop pages
    if (/Android/.test(ua)) return 'android';
    if (/Windows NT 10\.0/.test(ua)) {
      var major = parseInt(info.platformVersion || '', 10);
      if (major >= 13) return 'win11';
      if (major >= 1 && major <= 12) return 'win10';
      return null; // could be either – the user agent string says "10.0" on both
    }
    if (/Mac OS X/.test(ua)) return 'macnew';
    return null;
  }

  var api = {
    VERSIONS: VERSIONS, ORDER: ORDER, RISKS: RISKS,
    validateTree: validateTree, replay: replay, choose: choose, back: back,
    resolvePath: resolvePath, family: family, layerLabel: layerLabel,
    fixLog: fixLog, allRuns: allRuns, suggestVersion: suggestVersion
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.CSGCore = api;
})(this);
