// ClickSolve Guide – small HTML helpers used by the page sources.
// Everything here runs at build time; the browser never receives template strings with user input.

export const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const VERSIONS = {
  win11: 'Windows 11',
  win10: 'Windows 10',
  macnew: 'macOS 13 Ventura or later',
  macold: 'macOS 12 Monterey or earlier',
  ios: 'iPhone / iPad',
  android: 'Android'
};
export const VERSION_KEYS = Object.keys(VERSIONS);

/** Menu path that follows the version switcher. `paths` maps version keys to a path string. */
export function mp(paths) {
  const first = VERSION_KEYS.find((k) => paths[k]) || Object.keys(paths)[0];
  return `<span class="mpath" data-paths="${esc(JSON.stringify(paths))}"><span class="mp-os">${esc(VERSIONS[first] || '')}</span>${esc(paths[first])}</span>`;
}

const RISK = {
  harmless: ['Harmless', 'Nothing changes on your device that you would need to undo.'],
  setting: ['Changes a setting', 'Changes one setting; the undo is listed with the step.'],
  admin: ['Admin needed', 'Needs an administrator account or password.'],
  last: ['Last resort', 'Removes saved settings or data; do the other checks first.']
};
export const riskLabel = (k) => `<span class="risk risk-${k}" title="${esc(RISK[k][1])}">${RISK[k][0]}</span>`;
export const RISK_TEXT = RISK;

/** A terminal command with copy button and a plain explanation. os: 'win' | 'mac'. */
export function cmd({ os, code, what, not, admin = false, shell }) {
  const label = os === 'win' ? (shell || 'Command Prompt or Terminal') : (shell || 'Terminal');
  return `<div class="cmd" data-os="${os}"><div class="cmd-head"><span class="cmd-os">${os === 'win' ? 'Windows' : 'macOS'} · ${esc(label)}</span>${admin ? riskLabel('admin') : ''}<button type="button" class="copy" data-copy="${esc(code)}">Copy</button></div>
<pre><code>${esc(code)}</code></pre>
<p class="cmd-what"><b>What it does:</b> ${what}</p>${not ? `<p class="cmd-not"><b>What it does not do:</b> ${not}</p>` : ''}</div>`;
}

/** A numbered step for guide pages. */
export function step(n, { title, risk = 'harmless', time, body, undo }) {
  return `<div class="step"><div class="step-head"><span class="step-n">${String(n).padStart(2, '0')}</span><h3>${title}</h3></div>
<p class="step-meta">${riskLabel(risk)}${time ? `<span class="step-time">${esc(time)}</span>` : ''}</p>
${body}${undo ? `<p class="undo"><b>Undo:</b> ${undo}</p>` : ''}</div>`;
}

export function table(caption, head, rows) {
  return `<div class="tablewrap"><table><caption>${caption}</caption><thead><tr>${head.map((h) => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => i === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}

export function figure(id, title, svgBody, caption, viewBox = '0 0 720 300') {
  return `<figure class="fig"><svg viewBox="${viewBox}" role="img" aria-labelledby="${id}-t"><title id="${id}-t">${esc(title)}</title>${svgBody}</svg><figcaption>${caption}</figcaption></figure>`;
}

export const note = (kind, title, body) => `<aside class="note note-${kind}"><p class="note-t">${title}</p>${body}</aside>`;
