// Static checks over the built site in docs/. Exit code 1 on any problem.
import fs from 'node:fs';
import path from 'node:path';

const DOCS = path.resolve('docs');
const ORIGIN = 'https://clicksolveguide.com';
const PUB = 'ca-pub-7811071715414905';
const problems = [];
const fail = (p, msg) => problems.push(`${p}: ${msg}`);

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]);
}
const htmlFiles = walk(DOCS).filter((f) => f.endsWith('.html'));
const urlOf = (f) => { const r = '/' + path.relative(DOCS, f).split(path.sep).join('/'); return r.endsWith('/index.html') ? r.slice(0, -10) : r; };
const pages = htmlFiles.map((f) => ({ file: f, url: urlOf(f), html: fs.readFileSync(f, 'utf8') }));
const sitemap = [...fs.readFileSync(path.join(DOCS, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(ORIGIN, ''));

const text = (h) => h.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ');
const words = (h) => text(h).split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

const titles = new Map(), descs = new Map();
// legal pages promise no advertising: no loader there; every other indexable page has it
const NO_LOADER = ['/imprint/', '/privacy/', '/contact/', '/404.html'];
const CONTROL = /<button|<select|<input|<textarea|<summary|class="cmd"|class="vswitch"|class="tool"/;
const report = [];

for (const p of pages) {
  const { url, html } = p;
  const indexable = sitemap.includes(url);
  const noindex = /<meta name="robots" content="noindex/.test(html);
  const isContent = /^\/(diagnose|guides)\/[a-z0-9-]+\/$/.test(url);
  const isTool = url.startsWith('/diagnose/') && isContent;

  if (!html.includes(`<meta name="google-adsense-account" content="${PUB}">`)) fail(url, 'adsense meta missing');
  const consentAt = html.indexOf("gtag('consent','default'");
  const firstGoogle = html.search(/pagead2\.googlesyndication\.com|googletagmanager\.com/);
  if (consentAt < 0) fail(url, 'consent defaults missing');
  // local/test guard: first script in <head>, before consent defaults and any Google reference
  const guardAt = html.indexOf('<script>window.CSG_NO_GOOGLE=');
  const guard = guardAt >= 0 ? html.slice(guardAt, html.indexOf('</script>', guardAt)) : '';
  if (guardAt < 0 || html.search(/<script/) !== guardAt || guardAt > consentAt) fail(url, 'local guard missing or not the first script');
  else for (const k of ['localhost', "'127.0.0.1'", "'::1'", "'file:'", 'stats_test=1']) if (!guard.includes(k)) fail(url, 'local guard misses ' + k);
  if (!/wait_for_update:500/.test(html) || !/ads_data_redaction',true/.test(html) || !/ga-disable-G-T00HRG2YVF'\]=true/.test(html)) fail(url, 'consent default details missing');
  if (firstGoogle >= 0 && firstGoogle < consentAt) fail(url, 'Google script before consent defaults');
  if (/<script[^>]+src="https:\/\/pagead2/.test(html)) fail(url, 'static AdSense tag (must be the guarded inline loader)');
  const loaderTag = (html.match(/<script data-ads-loader>([\s\S]*?)<\/script>/) || [])[1] || '';
  const loader = !!loaderTag;
  if (loader) {
    if (!loaderTag.includes(`'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${PUB}'`) || !/s\.async=true/.test(loaderTag) || !/crossOrigin='anonymous'/.test(loaderTag)) fail(url, 'AdSense loader incomplete');
    if (!loaderTag.startsWith('if(!window.CSG_NO_GOOGLE)')) fail(url, 'AdSense loader without local guard');
    // as early as the static tag was: directly after the consent defaults, before styles and other scripts
    const afterDefaults = html.slice(html.indexOf('</script>', consentAt) + 9).trimStart();
    if (!afterDefaults.startsWith('<script data-ads-loader>')) fail(url, 'AdSense loader not directly after the consent defaults');
  }
  if (NO_LOADER.includes(url) || noindex) { if (loader) fail(url, 'AdSense loader must not be on this page'); }
  else if (indexable) { if (!loader) fail(url, 'AdSense loader missing'); }
  const ads = (html.match(/class="ad"/g) || []).length;
  if (!isContent && ads) fail(url, 'ad slot on a page that must not have ads');
  if (/<script[^>]+googletagmanager/.test(html)) fail(url, 'GA loaded statically');

  if (noindex) {
    if (indexable) fail(url, 'noindex page in sitemap');
    const canon = html.match(/<link rel="canonical" href="([^"]+)"/);
    if (url === '/404.html') { if (canon) fail(url, '404 must not have a canonical'); }
    else {
      const refresh = html.match(/http-equiv="refresh" content="0; url=([^"]+)"/);
      if (!canon || !refresh) fail(url, 'redirect page needs canonical + refresh');
      else if (refresh[1] === '/' || canon[1] !== ORIGIN + refresh[1]) fail(url, 'redirect target wrong');
    }
    continue;
  }
  if (!indexable) fail(url, 'indexable page missing from sitemap');
  const title = decode((html.match(/<title>([^<]*)<\/title>/) || [])[1] || '');
  const desc = decode((html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '');
  if (title.length < 30 || title.length > 65) fail(url, `title length ${title.length}: ${title}`);
  if (desc.length < 120 || desc.length > 160) fail(url, `description length ${desc.length}`);
  if (titles.has(title)) fail(url, 'duplicate title with ' + titles.get(title)); titles.set(title, url);
  if (descs.has(desc)) fail(url, 'duplicate description with ' + descs.get(desc)); descs.set(desc, url);
  if ((html.match(/<h1[\s>]/g) || []).length !== 1) fail(url, 'needs exactly one h1');
  const canon = (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
  if (canon !== ORIGIN + url) fail(url, 'canonical mismatch ' + canon);
  const lds = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => { try { return JSON.parse(m[1]); } catch (e) { fail(url, 'bad JSON-LD'); return {}; } });
  const mainWords = words((html.match(/<main[^>]*>([\s\S]*)<\/main>/) || ['', ''])[1]);
  if (mainWords < 150) fail(url, 'too little text: ' + mainWords);

  if (isContent) {
    const types = lds.map((o) => o['@type']);
    const main = lds.find((o) => o['@type'] === (isTool ? 'WebApplication' : 'Article'));
    const mod = main && main.dateModified;
    if (!main || main.datePublished !== '2026-11-02' || !['2026-11-02', '2026-11-03'].includes(mod)) fail(url, 'main JSON-LD missing or wrong dates');
    if (!types.includes('BreadcrumbList') || !types.includes('FAQPage')) fail(url, 'BreadcrumbList/FAQPage missing');
    if (!html.includes(`Reviewed November ${mod === '2026-11-03' ? 3 : 2}, 2026`)) fail(url, 'review date missing or not matching dateModified');
    if (!/<table/.test(html)) fail(url, 'no data table');
    if (!/<figure class="fig"><svg/.test(html)) fail(url, 'no inline SVG figure');
    if (!/id="sources"/.test(html)) fail(url, 'no sources section');
    if (!/<details>/.test(html)) fail(url, 'no FAQ');
    if (isTool && !/id="tree-data"/.test(html)) fail(url, 'tool without decision tree');
    // own prose: lede + text sections (no tool, sources, related, scam box)
    const lede = (html.match(/<p class="lede">([\s\S]*?)<\/p>/) || ['', ''])[1];
    const secs = [...html.matchAll(/<section id="([a-z0-9-]+)" class="prose[^"]*">([\s\S]*?)<\/section>/g)].filter((m) => m[1] !== 'sources').map((m) => m[2].replace(/<div class="cmd"[\s\S]*?<\/p>(<p class="cmd-not">[\s\S]*?<\/p>)?<\/div>/g, ' '));
    const prose = words(lede + ' ' + secs.join(' '));
    const min = isTool ? 800 : 900;
    if (prose < min) fail(url, `own prose ${prose} < ${min}`);
    // ads: never inside the tool, never next to controls (static neighborhood check)
    for (const m of html.matchAll(/<div class="ad" data-slot="(\w+)" hidden>/g)) {
      const i = m.index;
      const before = html.slice(Math.max(0, i - 700), i), after = html.slice(i + m[0].length, i + m[0].length + 700);
      const toolStart = html.indexOf('<section class="tool"'), toolEnd = html.indexOf('</section>', html.indexOf('id="tree-data"'));
      if (toolStart >= 0 && i > toolStart && i < toolEnd) fail(url, 'ad inside the tool');
      if (m[1] !== 'sidebar' && (CONTROL.test(before.slice(-400)) || CONTROL.test(after.slice(0, 400)))) fail(url, `ad ${m[1]} close to a control in the markup`);
    }
    report.push({ url, prose, ads });
  }
  if (/\b1-8\d\d-|\(\d{3}\)\s?\d{3}-\d{4}|\+\d{1,3}[\s-]\d{2,4}[\s-]\d{3,}/.test(text(html))) fail(url, 'looks like a phone number');
}

// internal links
const exists = (u) => {
  const clean = u.split('#')[0].split('?')[0];
  if (!clean) return true;
  const f = path.join(DOCS, clean.endsWith('/') ? clean + 'index.html' : clean);
  return fs.existsSync(f);
};
for (const p of pages) {
  for (const m of p.html.matchAll(/(?:href|src)="(\/[^"]*)"/g)) if (!exists(m[1])) fail(p.url, 'broken internal link ' + m[1]);
}

// root files
const must = { 'ads.txt': 'google.com, pub-7811071715414905, DIRECT, f08c47fec0942fa0', 'CNAME': 'clicksolveguide.com', 'robots.txt': 'Sitemap: https://clicksolveguide.com/sitemap.xml' };
for (const [f, s] of Object.entries(must)) if (!fs.readFileSync(path.join(DOCS, f), 'utf8').includes(s)) fail(f, 'content wrong');
for (const u of sitemap) if (!pages.find((p) => p.url === u)) fail('sitemap', 'unknown url ' + u);
if (!fs.existsSync(path.join(DOCS, 'assets/fonts/OFL-SchibstedGrotesk.txt')) || !fs.existsSync(path.join(DOCS, 'assets/fonts/OFL-JetBrainsMono.txt'))) fail('fonts', 'OFL license file missing');

// page weight: html + css + js + preloaded/used fonts
const assetBytes = ['assets/css/site.css', 'assets/js/consent.js', 'assets/js/core.js', 'assets/js/site.js', 'assets/js/diagnose.js'].reduce((a, f) => a + fs.statSync(path.join(DOCS, f)).size, 0)
  + walk(path.join(DOCS, 'assets/fonts')).filter((f) => f.endsWith('.woff2')).reduce((a, f) => a + fs.statSync(f).size, 0);
let heaviest = 0;
for (const p of pages) { const total = Buffer.byteLength(p.html) + assetBytes; heaviest = Math.max(heaviest, total); if (total > 300 * 1024) fail(p.url, `page weight ${Math.round(total / 1024)} KB`); }

for (const r of report) console.log(`  ${String(r.prose).padStart(5)} words prose · ${r.ads} ad boxes · ${r.url}`);
console.log(`checked ${pages.length} HTML files, ${sitemap.length} sitemap URLs, heaviest page incl. all assets ${Math.round(heaviest / 1024)} KB`);
if (problems.length) { console.log('\nPROBLEMS:\n' + problems.join('\n')); process.exit(1); }
console.log('all page checks passed');
