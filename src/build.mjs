// ClickSolve Guide – build script. Writes docs/ from src/. No dependencies: `node src/build.mjs`.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { esc, VERSIONS } from './lib.mjs';
import { sitePages, ORDER, OLD_URLS } from './site.mjs';
import { referencePages, lookupData, lookupBox, REF_ISO } from './reference.mjs';

const shopLink = fs.readFileSync(new URL('./shop-link.html', import.meta.url), 'utf8');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'docs');
const ORIGIN = 'https://clicksolveguide.com';
const GA = 'G-T00HRG2YVF';
const PUB = 'ca-pub-7811071715414905';
const REVIEWED = 'November 2, 2026';
const ISO = '2026-11-02'; // first publication
// Pages whose content changed after first publication: dateModified, "Reviewed" line, change log and sitemap.
const MOD_ISO = '2026-11-03', MOD_REVIEWED = 'November 3, 2026';
const CHANGED = {
  'wifi-connected-no-internet': 'fix log lists the risk, full text, commands for your system only and undo of every step; private-window wording; Chrome Incognito source added. Clearing the DNS cache has its own steps for iPhone, iPad and Android.',
  'site-cant-be-reached': 'fix log lists the risk, full text, commands for your system only and undo of every step. Clearing the DNS cache has its own steps for iPhone, iPad and Android.',
  'one-website-wont-load': 'fix log lists every step’s risk and undo and starts with a stop notice after a certificate warning. Clearing the DNS cache has its own steps for iPhone, iPad and Android.',
  'printer-offline-windows-11': 'fix log lists the risk, full text and undo of every step.',
  'mac-printer-not-printing': 'fix log lists the risk, full text and undo of every step.',
  'laptop-wont-connect-wifi': 'fix log lists the risk, full text and undo of every step, including the network reset’s automatic restart.',
  'android-connected-no-internet': 'Always-on VPN only blocks traffic together with “Block connections without VPN”; Android VPN source added.',
  'windows-update-stuck': 'update services stopped and started with separate commands; check for an existing SoftwareDistribution.old before renaming.'
};
const V = '20261118a';
// Changed on 2026-11-18 (Eigenwert): share link, blank checklist, example cases and number keys in the diagnoses;
// a lookup section on every diagnosis and guide. dateModified, change log and sitemap – the "Reviewed" date
// (last check against the sources) stays as it was.
const NEW_ISO = REF_ISO, NEW_DATE = 'November 18, 2026';
const TOOL_1811 = 'the diagnosis can be shared as a link (answers and system only), printed as a blank checklist of every check and result, tried with example cases and answered with the number keys';
const REFBOX = {
  'wifi-connected-no-internet': { kind: 'ip', h2: 'Check the address your device shows', text: 'The check “Which IP address does the device have?” decides between two very different causes. Type the address from your Wi-Fi details: the lookup names the range and the document that defines it and says what follows.', ex: ['169.254.12.7', '192.168.1.20', '100.72.3.9'], link: ['/reference/ip-address-check/', 'IP address check and all special ranges'] },
  'site-cant-be-reached': { kind: 'chrome', h2: 'Look up the exact code', text: 'The diagnosis groups the five most frequent codes. Chrome knows many more. Type the code from the error page: the lookup explains the ones that point to a layer and names the range of any other.', ex: ['ERR_ADDRESS_UNREACHABLE', 'DNS_PROBE_FINISHED_BAD_CONFIG', 'ERR_TOO_MANY_REDIRECTS'], link: ['/reference/chrome-error-codes/', 'All Chrome network error codes'] },
  'one-website-wont-load': { kind: 'http', h2: 'A number on the page? Look it up', text: 'If the failing page shows a three-digit number – 403, 404, 502 – the website’s server answered, and device, Wi-Fi, router, provider and DNS are ruled out in one go. The lookup says who can fix which status.', ex: ['403', '429', '502', 'ERR_TOO_MANY_REDIRECTS'], link: ['/reference/http-status-codes/', 'All HTTP status codes'] },
  'printer-offline-windows-11': { kind: 'port', h2: 'Port numbers in the printer’s settings', text: 'The printer’s “Ports” tab and a router’s or firewall’s rules name numbers such as 9100, 631 or 3702. The lookup shows what each is registered for and where it matters for printing.', ex: ['9100', '631', '3702', '5353'], link: ['/reference/network-ports/', 'Port reference'] },
  'mac-printer-not-printing': { kind: 'port', h2: 'Port numbers behind Mac printing', text: 'A Mac finds network printers by multicast DNS and prints over the Internet Printing Protocol. If a firewall or guest network is involved, these are the numbers to look for.', ex: ['5353', '631', '9100'], link: ['/reference/network-ports/', 'Port reference'] },
  'laptop-wont-connect-wifi': { kind: 'ip', h2: 'Joined, but which address?', text: 'Once the laptop joins the network, the address it receives shows whether the router answered. Type it here; an address starting with 169.254 means it did not.', ex: ['169.254.12.7', '192.168.1.20'], link: ['/reference/ip-address-check/', 'IP address check and all special ranges'] },
  'iphone-wont-connect-wifi': { kind: 'ip', h2: 'Check the address the iPhone shows', text: 'The IP address in the network’s details is a result you can read without changing anything. Type it here to see which range it is from and what that says about the router.', ex: ['169.254.12.7', '192.168.1.20'], link: ['/reference/ip-address-check/', 'IP address check and all special ranges'] },
  'android-connected-no-internet': { kind: 'ip', h2: 'Check the address the phone shows', text: 'The IP address in the Wi-Fi network’s details tells you whether the router assigned one. Private DNS, covered above, uses port 853 – the port reference says what blocks it.', ex: ['169.254.12.7', '192.168.1.20', '853'], link: ['/reference/ip-address-check/', 'IP address check and all special ranges'] },
  'dns-server-not-responding': { kind: 'chrome', h2: 'The browser’s own DNS codes', text: 'Windows says “DNS server isn’t responding”; Chrome and Edge report the same fault as DNS_PROBE or ERR_NAME codes, and each variant says something different about where the lookup failed.', ex: ['DNS_PROBE_FINISHED_BAD_CONFIG', 'DNS_PROBE_FINISHED_NXDOMAIN', 'ERR_NAME_NOT_RESOLVED', '53'], link: ['/reference/chrome-error-codes/', 'All Chrome network error codes'] },
  'windows-update-stuck': { kind: 'wu', h2: 'Look up the update error code', text: 'If Windows Update shows a code such as 0x80070422 under “Update history” or next to a failed update, type it here. The lookup explains the codes home PCs show in plain words with the next safe step, and for any other code in Microsoft’s lists gives the official name and the Microsoft page.', ex: ['0x80070422', '0x8024402F', '0x80240022'], link: ['/reference/windows-update-error-codes/', 'All Windows Update error codes'] },
  'which-windows-macos-version': { kind: 'win', h2: 'Translate the build number', text: 'winver shows an OS build such as 26100.4946. Type it here to get the Windows version, Microsoft’s end-of-updates date for it and whether newer updates are waiting.', ex: ['26100.4946', '22631', '19045'], link: ['/reference/windows-macos-versions/', 'Windows builds and macOS versions'] },
  'restart-router-right-way': { kind: 'ip', h2: 'Read the router’s internet address', text: 'After the restart, the router’s status page shows its internet (WAN) address. Type it here and the lookup names the range: public, shared by the provider (100.64.0.0/10), or private – which on a router’s internet side means it sits behind another router or modem-router.', ex: ['100.72.3.9', '192.168.1.20'], link: ['/reference/ip-address-check/', 'IP address check and all special ranges'] },
  'mac-running-slow': { kind: null, h2: 'Shortcuts for a Mac that barely reacts', text: 'When the pointer drags, the keyboard is faster: Option-Command-Esc opens Force Quit, Command–Space bar finds Activity Monitor. The shortcut reference says what each one does and when it helps.', link: ['/reference/troubleshooting-shortcuts/', 'Troubleshooting shortcuts for Mac and Windows'] },
  'bluetooth-not-working-windows-11': { kind: null, h2: 'Shortcuts to the Bluetooth switches', text: 'Windows key+A opens the panel with the Bluetooth and Airplane mode buttons, Windows key+I opens Settings, Windows key+X leads to Device Manager. The shortcut reference lists them with the situation each is for.', link: ['/reference/troubleshooting-shortcuts/', 'Troubleshooting shortcuts for Windows and Mac'] },
  'tech-support-scams': { kind: 'port', h2: 'Asked to “open a port”?', text: 'Fake support callers sometimes ask for remote access or for a port to be forwarded in the router. Type the number they named to see what it is registered for – and close a stuck pop-up from the keyboard with the shortcuts in the reference.', ex: ['3389', '22', '445'], link: ['/reference/troubleshooting-shortcuts/', 'Troubleshooting shortcuts for Windows and Mac'] }
};
// Pages changed on 2026-11-04 (overview texts, About method, ad scope in the privacy policy): sitemap lastmod.
const CHANGED_0411 = ['/diagnose/', '/guides/', '/about/', '/how-we-check/'];
// Changed on 2026-11-05: privacy policy (interim statistics window).
const CHANGED_0511 = ['/privacy/'];

// ---------- load content ----------
const content = [];
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null; // dev aid: build a subset
for (const slug of ONLY || ORDER) {
  const mod = await import(pathToFileURL(path.join(ROOT, 'src/pages', slug + '.mjs')).href);
  const pg = mod.default;
  if (pg.slug !== slug) throw new Error('slug mismatch ' + slug);
  if (!pg.sourcesNote) throw new Error(slug + ': sourcesNote missing');
  pg.path = `/${pg.kind === 'tool' ? 'diagnose' : 'guides'}/${slug}/`;
  if (pg.tree) pg.treeData = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/trees', pg.tree + '.json'), 'utf8'));
  content.push(pg);
}
const byPath = Object.fromEntries(content.map((p) => [p.path, p]));

// ---------- shared pieces ----------
const LOGO = `<svg viewBox="0 0 32 32" aria-hidden="true"><rect x="1" y="1" width="30" height="30" rx="6" fill="#0b7a55"/><rect x="7" y="7" width="18" height="3" rx="1.5" fill="#fff" opacity=".55"/><rect x="7" y="12.5" width="18" height="3" rx="1.5" fill="#fff" opacity=".55"/><rect x="7" y="18" width="18" height="3" rx="1.5" fill="#fff"/><rect x="7" y="23.5" width="18" height="3" rx="1.5" fill="#fff" opacity=".55"/><path d="M5 25 27 5" stroke="#102033" stroke-width="2.4" stroke-linecap="round"/></svg>`;
const NAV = [['Diagnoses', '/diagnose/'], ['Guides', '/guides/'], ['Reference', '/reference/'], ['Scam check', '/guides/tech-support-scams/'], ['How we check', '/how-we-check/'], ['About', '/about/']];

const CONSENT_DEFAULTS = `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});gtag('set','ads_data_redaction',true);gtag('set','url_passthrough',false);window['ga-disable-${GA}']=true;</script>`;
// Guard, first script in <head> (before consent defaults and any Google tag): local previews and tests
// (localhost, 127.0.0.1, ::1, file:) and visits with ?stats_test=1 (kept for the browser tab) set
// window.CSG_NO_GOOGLE – then no Google script is inserted at all (AdSense loader, its consent message, GA).
const GUARD = `<script>window.CSG_NO_GOOGLE=(function(l){var h=l.hostname,t=false;try{if(/[?&]stats_test=1(&|$)/.test(l.search))sessionStorage.setItem('csg-stats-test','1');t=sessionStorage.getItem('csg-stats-test')==='1';}catch(e){t=/[?&]stats_test=1(&|$)/.test(l.search);}return t||l.protocol==='file:'||h==='localhost'||h==='127.0.0.1'||h==='::1'||h==='[::1]';})(location);</script>`;
// AdSense loader at the same early place in <head> as the former static tag (right after the consent
// defaults), async and with crossorigin="anonymous"; on clicksolveguide.com it behaves like the static tag.
const ADS_SRC = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${PUB}`;
const LOADER = `<script data-ads-loader>if(!window.CSG_NO_GOOGLE){(function(){var s=document.createElement('script');s.async=true;s.src='${ADS_SRC}';s.crossOrigin='anonymous';document.head.appendChild(s);})();}</script>`;

const ld = (o) => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;
const ORG = { '@type': 'Organization', name: 'AdStern – Agentur für digitales Marketing', url: ORIGIN + '/about/', address: { '@type': 'PostalAddress', streetAddress: 'Seilerstätte 8', postalCode: '1010', addressLocality: 'Vienna', addressCountry: 'AT' } };
const crumbsLd = (crumbs) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: crumbs.map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: ORIGIN + url })) });
const crumbsHtml = (crumbs) => `<nav aria-label="Breadcrumb"><ol class="crumbs">${crumbs.map(([n, u], i) => `<li>${i === crumbs.length - 1 ? `<span aria-current="page">${esc(n)}</span>` : `<a href="${u}">${esc(n)}</a>`}</li>`).join('')}</ol></nav>`;
const adBox = (slot) => `<div class="ad" data-slot="${slot}" hidden><span class="ad-label">Advertisement</span></div>`;

function layout(pg) {
  const canonical = pg.noindex ? (pg.canonical ? `<link rel="canonical" href="${ORIGIN}${pg.canonical}">` : '') : `<link rel="canonical" href="${ORIGIN}${pg.path}">`;
  const scripts = [`<script src="/assets/js/consent.js?v=${V}" defer></script>`, `<script src="/assets/js/core.js?v=${V}" defer></script>`, `<script src="/assets/js/site.js?v=${V}" defer></script>`];
  if (pg.kind === 'tool') scripts.push(`<script src="/assets/js/diagnose.js?v=${V}" defer></script>`);
  if (pg.lookup) scripts.push(`<script src="/assets/js/refcore.js?v=${V}" defer></script>`, `<script src="/assets/js/lookup.js?v=${V}" defer></script>`);
  const cur = (u) => {
    const p = pg.path || '';
    if (p === u) return ' aria-current="page"';
    const inSection = (u === '/diagnose/' && p.startsWith('/diagnose/')) || (u === '/guides/' && p.startsWith('/guides/') && p !== '/guides/tech-support-scams/') || (u === '/reference/' && p.startsWith('/reference/'));
    return inSection ? ' aria-current="true"' : '';
  };
  return `<!doctype html>
<html lang="en-US" data-ads="${pg.loader ? 'yes' : 'no'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${GUARD}
<title>${esc(pg.title)}</title>
<meta name="description" content="${esc(pg.description)}">
${pg.noindex ? '<meta name="robots" content="noindex,follow">\n' : ''}${canonical}
<meta name="google-adsense-account" content="${PUB}">
${CONSENT_DEFAULTS}
${pg.loader ? LOADER + '\n' : ''}${pg.refresh ? `<meta http-equiv="refresh" content="0; url=${pg.refresh}">\n` : ''}<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#FFFFFF">
<meta property="og:type" content="${pg.kind === 'guide' ? 'article' : 'website'}">
<meta property="og:site_name" content="ClickSolve Guide">
<meta property="og:title" content="${esc(pg.h1 || pg.title)}">
<meta property="og:description" content="${esc(pg.description)}">
${pg.noindex ? '' : `<meta property="og:url" content="${ORIGIN}${pg.path}">\n<meta property="og:image" content="${ORIGIN}/assets/og.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image">\n`}<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/schibsted-grotesk-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/site.css?v=${V}">
${(pg.jsonld || []).map(ld).join('\n')}
${scripts.join('\n')}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<header class="top"><div class="wrap">
<a class="brand" href="/">${LOGO}<span>ClickSolve Guide<small>find the layer · then fix it</small></span></a>
<nav aria-label="Main"><ul class="nav">${NAV.map(([n, u]) => `<li><a href="${u}"${cur(u)}>${n}</a></li>`).join('')}</ul></nav>
</div></header>
<main id="main" class="wrap">
${pg.body}
</main>
<footer class="foot"><div class="wrap">
<div><h2>ClickSolve Guide</h2><p>Guided checks that find <i>where</i> a computer, phone, Wi-Fi or printer problem sits – device, Wi-Fi, router, provider or service – before anything gets changed.</p><p>No phone numbers. No download tools. No remote access. Published by AdStern, Vienna.</p></div>
<div><h2>Diagnoses</h2><ul>${content.filter((c) => c.kind === 'tool').map((c) => `<li><a href="${c.path}">${esc(c.short)}</a></li>`).join('')}</ul></div>
<div><h2>Site</h2><ul><li><a href="/reference/">Error code lookup and reference tables</a></li><li><a href="/about/">About</a></li><li><a href="/how-we-check/">How we check our guides</a></li><li><a href="/contact/">Contact</a></li><li><a href="/imprint/">Imprint</a></li><li><a href="/privacy/">Privacy policy</a></li><li><button type="button" class="linklike" data-privacy-settings>Privacy settings</button></li></ul></div>
${shopLink}</div></footer>
</body>
</html>
`;
}

// ---------- content pages ----------
const CONTROL = /<button|<select|<input|<textarea|class="cmd|<details|class="vswitch|class="tool/;
const SCAM = `<aside class="scam" aria-labelledby="scam-h"><h2 id="scam-h">Scam protection: what this site never does</h2>
<p>ClickSolve Guide never shows a phone number, never offers remote access and never recommends “PC optimizer”, “driver updater” or “cleaner” tools. If a pop-up says your device is infected and gives a number to call, it is a scam: close the browser tab (or the whole browser), don’t call, and don’t let anyone connect to your computer. Real error messages from Microsoft, Apple and Google do not ask you to phone anyone. <a href="/guides/tech-support-scams/">How to spot fake support pop-ups</a>.</p></aside>`;

const SCAM_SHORT = `<aside class="scam" aria-label="Scam protection"><p><b>Scam protection:</b> this site never shows phone numbers, never offers remote access and never recommends “optimizer” tools. A pop-up with a number to call is a scam – close it. <a href="/guides/tech-support-scams/">How to spot fake support</a>.</p></aside>`;

function vswitch(versions, id = 'vsel') {
  return `<div class="vswitch"><label for="${id}">Show steps for</label><select id="${id}">${versions.map((v) => `<option value="${v}">${esc(VERSIONS[v])}</option>`).join('')}</select><p class="vhint">Pick the system you are fixing.</p></div>`;
}

function toolShell(pg) {
  const t = pg.treeData;
  return `<section class="tool" id="tool" aria-labelledby="tool-h" style="--n:${t.layers.length}">
<div class="tool-bar"><span class="mono">Layer diagnosis · ${t.layers.length} layers</span><h2 id="tool-h">${esc(pg.toolTitle || t.title)}</h2></div>
<div class="tool-in"><div class="tool-main">
${vswitch(pg.versions)}
<div class="examples" id="diag-examples" hidden><span class="ex-label">Example cases (made up, to show how the check works):</span></div>
<ol class="layermap" aria-label="Layer map: where the problem can be">${t.layers.map((l) => `<li data-layer="${l.id}" data-state="open"><span class="lm-name">${esc(l.label)}</span><span class="lm-state">not checked</span></li>`).join('')}</ol>
<p class="lm-legend">Dashed: not checked · crossed out: ruled out · amber: suspect or likely</p>
<p class="lm-live" aria-live="polite"></p>
<div class="diag-card" id="diag-card"><p class="noscript">The guided check needs JavaScript. Every check and fix is also explained in the text below.</p></div>
</div>
<div class="tool-side">
<h3>Your answers</h3>
<ol class="hist" id="diag-hist"></ol>
<div class="tool-actions"><button type="button" id="diag-back">Back one step</button><button type="button" id="diag-reset">Start over</button></div>
<h3>Fix log</h3>
<p class="small">A record of your checks for IT, your internet provider or the store. It is created in this browser; nothing is sent.</p>
<label for="diag-notes">Your notes</label>
<textarea id="diag-notes" rows="4" placeholder="e.g. router model, when it started, error text"></textarea>
<div class="tool-actions"><button type="button" class="primary" id="log-txt">Download .txt</button><button type="button" id="log-print">Print</button></div>
<h3>Share or print the whole check</h3>
<div class="tool-actions"><button type="button" id="diag-share">Copy link to this state</button><button type="button" id="chk-print">Print blank checklist</button></div>
<p class="small" id="share-note" aria-live="polite">The link holds your answers so far and the chosen system – never your notes. The blank checklist prints every check and result of this diagnosis, for when the internet is down. Keyboard: with the focus in the check, keys 1–9 pick an answer.</p>
<pre class="fixlog-pre" id="fixlog-preview" tabindex="0" aria-label="Fix log preview"></pre>
</div></div>
<script type="application/json" id="tree-data">${JSON.stringify(t).replace(/</g, '\\u003c')}</script>
</section>`;
}

function contentBody(pg) {
  const crumbs = [['Home', '/'], [pg.kind === 'tool' ? 'Diagnoses' : 'Guides', pg.kind === 'tool' ? '/diagnose/' : '/guides/'], [pg.short, pg.path]];
  pg.crumbs = crumbs;
  const head = `${crumbsHtml(crumbs)}
<span class="kicker">${esc(pg.kicker)}</span>
<h1>${pg.h1html || esc(pg.h1)}</h1>
<p class="lede">${pg.lede}</p>
<p class="trust"><span><b>Reviewed ${CHANGED[pg.slug] ? MOD_REVIEWED : REVIEWED}</b></span><span>Applies to: ${esc(pg.applies)}</span><span>Sources: ${esc(pg.checked)}</span><span>Publisher: AdStern, Vienna</span></p>`;
  const rb = REFBOX[pg.slug];
  if (!rb) throw new Error(pg.slug + ': REFBOX entry missing');
  pg.lookup = true;
  const jump = rb.kind ? `<form class="lookup-form lookup-jump" data-lookup-jump><label for="jump-q">${esc({ ip: 'IP address', chrome: 'Chrome error code', http: 'Status code or Chrome error code', port: 'Port number', wu: 'Windows Update error code', win: 'Windows build number' }[rb.kind])}</label><div class="lookup-row"><input id="jump-q" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" maxlength="80" placeholder="e.g. ${esc(rb.ex[0])}"><button type="submit" class="btn">Look up</button></div></form>
<p class="lookup-ex"><span class="ex-label">Examples (made up):</span> ${rb.ex.map((x) => `<button type="button" class="example" data-jump="${esc(x)}">${esc(x)}</button>`).join(' ')}</p>
<p class="small">The lookup opens on the reference page and runs in your browser; what you type is not sent anywhere.</p>` : '';
  const sections = pg.sections.concat([{ id: 'lookup-here', h2: rb.h2, html: `<p>${rb.text}</p>\n${jump}\n<p><a href="${rb.link[0]}">${esc(rb.link[1])}</a> · <a href="/reference/">all reference tables</a></p>` }]);
  const secs = sections.map((s) => `<section id="${s.id}" class="prose"><h2>${s.h2}</h2>\n${s.html}</section>`);
  const hasCtl = sections.map((s) => CONTROL.test(s.html));
  // first ad: guides after the lede (before section 0), tools after section 0
  const firstAfter = pg.kind === 'tool' ? 1 : 0; // index of section before which the first ad sits
  if (hasCtl[firstAfter] || (pg.kind === 'tool' && hasCtl[0])) throw new Error(pg.slug + ': section next to the first ad contains controls');
  // mid ad: between two control-free sections, near the middle, at least two sections after the first ad
  let mid = -1, best = 1e9;
  const n0 = pg.sections.length; // the appended lookup section does not move the ad
  for (let i = firstAfter + 2; i < n0 - 1; i++) {
    if (hasCtl[i - 1] || hasCtl[i]) continue;
    const d = Math.abs(i - n0 / 2);
    if (d < best) { best = d; mid = i; }
  }
  pg.midAd = mid;
  const parts = [];
  secs.forEach((s, i) => {
    if (i === firstAfter) parts.push(adBox('afterIntro'));
    if (i === mid) parts.push(adBox('midArticle'));
    parts.push(s);
    if (pg.kind === 'guide' && i === 0 && pg.versions) parts.push(vswitch(pg.versions));
  });
  const faq = `<section id="faq" class="prose faq"><h2>Questions people ask</h2>${pg.faq.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</section>`;
  const src = `<section id="sources" class="prose sources"><h2>Sources</h2><p>${pg.sourcesNote} Menu paths and commands follow the vendors’ own documentation; menus can change with updates – <a href="/contact/">tell us</a> if one differs.</p><ul>${pg.sources.map(([n, u]) => `<li>${u ? `<a href="${u}" rel="noopener">${n}</a>` : n}</li>`).join('')}</ul></section>`;
  const rel = `<section class="prose" aria-labelledby="rel-h"><h2 id="rel-h">Related checks</h2><ul class="related">${pg.related.map((u) => { const r = byPath[u]; if (!r) { if (ONLY) return ''; throw new Error(pg.slug + ': related missing ' + u); } return `<li><a href="${u}"><span>${r.kind === 'tool' ? 'Diagnosis' : 'Guide'}</span>${esc(r.h1)}</a></li>`; }).join('')}</ul></section>`;
  const log = `<p class="changelog prose"><b>Change log:</b> ${pg.changelog || `${REVIEWED} – first published.`}${CHANGED[pg.slug] ? ` ${MOD_REVIEWED} – ${CHANGED[pg.slug]}` : ''} ${NEW_DATE} – ${pg.kind === 'tool' ? TOOL_1811 + '; ' : ''}new section “${rb.h2}” with a link to the reference tables.${pg.slug === 'one-website-wont-load' ? " November 22, 2026 – added a comparison using the same phone and a path for inconclusive observations." : ""}</p>`;
  const article = `<article>${head}
${pg.kind === 'tool' ? toolShell(pg) + SCAM_SHORT : ''}
${parts.join('\n')}
${pg.kind === 'guide' ? SCAM : ''}
${faq}
${src}
${rel}
${log}</article>`;
  return pg.kind === 'guide' ? `<div class="layout">${article}<aside class="side" aria-label="Advertisement">${adBox('sidebar')}</aside></div>` : article;
}

function contentLd(pg) {
  const url = ORIGIN + pg.path;
  const main = pg.kind === 'tool'
    ? { '@context': 'https://schema.org', '@type': 'WebApplication', name: pg.h1, url, description: pg.description, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Any – runs in the web browser', browserRequirements: 'Requires JavaScript', isAccessibleForFree: true, inLanguage: 'en-US', datePublished: ISO, dateModified: pg.slug === 'one-website-wont-load' ? '2026-11-22' : NEW_ISO, publisher: ORG }
    : { '@context': 'https://schema.org', '@type': 'Article', headline: pg.h1, description: pg.description, url, mainEntityOfPage: url, inLanguage: 'en-US', datePublished: ISO, dateModified: NEW_ISO, author: { '@type': 'Organization', name: 'ClickSolve Guide (AdStern)', url: ORIGIN + '/about/' }, publisher: ORG };
  const faq = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: pg.faq.map(([q, a]) => ({ '@type': 'Question', name: q.replace(/<[^>]+>/g, ''), acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, '') } })) };
  return [main, crumbsLd(pg.crumbs), faq];
}

// ---------- assemble ----------
const pages = [];
for (const pg of content) {
  const body = contentBody(pg);
  pages.push({ ...pg, body, loader: true, jsonld: contentLd(pg) });
}
const refPages = referencePages({ crumbsHtml, crumbsLd, ORIGIN, ORG, V });
for (const sp of sitePages({ content, esc, crumbsHtml, crumbsLd, ld, ORIGIN, REVIEWED, ISO, ORG, lookupHtml: lookupBox(V), refPages })) pages.push(sp);
for (const rp of refPages) pages.push(rp);

// old URLs -> new pages
for (const [oldPath, target] of OLD_URLS) {
  pages.push({
    path: oldPath, kind: 'redirect', noindex: true, canonical: target, refresh: target, loader: false,
    title: 'Moved – ClickSolve Guide', description: 'This page has moved to a new address on ClickSolve Guide.',
    body: `<article class="prose"><h1>This page has moved</h1><p>The new address is <a href="${target}">${ORIGIN}${target}</a>.</p></article>`
  });
}

// ---------- write ----------
function writeOut(rel, data) {
  const f = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, data);
}
for (const p of pages) {
  const rel = p.path === '/404.html' || p.path.endsWith('.html') ? p.path : p.path + 'index.html';
  writeOut(rel, layout(p));
}
writeOut('assets/data/lookup.json', JSON.stringify(lookupData()));
const indexable = pages.filter((p) => !p.noindex);
// every page except contact and imprint changed on 2026-11-18
const UNCHANGED_1811 = ['/contact/', '/imprint/'];
writeOut('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable.map((p) => `<url><loc>${ORIGIN}${p.path}</loc><lastmod>${p.path === '/diagnose/one-website-wont-load/' ? '2026-11-22' : !UNCHANGED_1811.includes(p.path) ? NEW_ISO : CHANGED_0511.includes(p.path) ? '2026-11-05' : CHANGED_0411.includes(p.path) ? '2026-11-04' : CHANGED[(p.path || '').split('/')[2]] ? MOD_ISO : ISO}</lastmod></url>`).join('\n')}\n</urlset>\n`);
writeOut('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`);
writeOut('ads.txt', 'google.com, pub-7811071715414905, DIRECT, f08c47fec0942fa0\n');
writeOut('CNAME', 'clicksolveguide.com'); // as committed on main (no trailing newline)
writeOut('.nojekyll', '');
writeOut('favicon.svg', LOGO.replace('aria-hidden="true"', 'xmlns="http://www.w3.org/2000/svg"'));

// word counts for the report
const words = (html) => {
  const m = html.match(/<main[^>]*>([\s\S]*)<\/main>/);
  return (m ? m[1] : html).replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
};
const report = pages.filter((p) => !p.noindex).map((p) => ({ path: p.path, kind: p.kind, words: words(layout(p)), midAd: p.midAd ?? null, ...(p.fromSourceWords != null ? { fromSourceWords: p.fromSourceWords } : {}) }));
fs.writeFileSync(path.join(ROOT, 'build-report.json'), JSON.stringify(report, null, 1));
console.log(`built ${pages.length} pages (${indexable.length} in sitemap)`);
for (const r of report) console.log(String(r.words).padStart(6), r.kind.padEnd(6), r.path);
