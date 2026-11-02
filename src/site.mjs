// Home, hub pages, About, How we check, Contact, Imprint, Privacy and 404 – written for clicksolveguide.com.
import { table, figure, riskLabel } from './lib.mjs';

export const ORDER = [
  'wifi-connected-no-internet', 'site-cant-be-reached', 'one-website-wont-load', 'printer-offline-windows-11',
  'mac-printer-not-printing', 'laptop-wont-connect-wifi',
  'iphone-wont-connect-wifi', 'android-connected-no-internet', 'dns-server-not-responding', 'windows-update-stuck',
  'mac-running-slow', 'bluetooth-not-working-windows-11', 'restart-router-right-way', 'which-windows-macos-version',
  'tech-support-scams'
];

// The previous site's paths are unknown; these are the standard old addresses, each sent to its new page.
export const OLD_URLS = [
  ['/about.html', '/about/'],
  ['/imprint.html', '/imprint/'],
  ['/privacy.html', '/privacy/'],
  ['/advertise.html', '/contact/'],
  ['/contact.html', '/contact/']
];

const RIS = 'https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10007517';

const chainSvg = (states, id, title, caption) => {
  const rows = [['Device', 'Other devices fail too', 'clear'], ['Wi-Fi', 'Cable test fails as well', 'clear'], ['Router', 'Restart helped', 'likely'], ['ISP', 'Status page: no outage', 'clear'], ['Service', 'Every site fails', 'clear']];
  let s = '';
  rows.forEach(([n, why, st], i) => {
    const y = 10 + i * 64;
    const cls = st === 'clear' ? 'd-box-g' : 'd-box-a';
    s += `<rect class="${cls}" x="10" y="${y}" width="380" height="52" rx="8"/>`;
    s += `<text class="d-t" x="28" y="${y + 24}"${st === 'clear' ? ' text-decoration="line-through"' : ''}>${n}</text>`;
    s += `<text class="d-s" x="28" y="${y + 42}">${why}</text>`;
    s += `<text class="${st === 'clear' ? 'd-tg' : 'd-ta'}" x="372" y="${y + 32}" text-anchor="end">${st === 'clear' ? 'RULED OUT' : 'LIKELY HERE'}</text>`;
    if (i < rows.length - 1) s += `<path class="d-line" d="M200 ${y + 52} v12"/>`;
  });
  return `<figure class="hero-fig"><svg viewBox="0 0 400 334" role="img" aria-labelledby="${id}-t"><title id="${id}-t">${title}</title>${s}</svg><figcaption>${caption}</figcaption></figure>`;
};

export function sitePages({ content, esc, crumbsHtml, crumbsLd, ld, ORIGIN, REVIEWED, ISO, ORG }) {
  const tools = content.filter((c) => c.kind === 'tool');
  const guides = content.filter((c) => c.kind === 'guide');
  const card = (c) => `<li><a class="card" href="${c.path}"><span class="k">${esc(c.kicker)}</span><h3>${esc(c.h1)}</h3><p>${esc(c.cardText || c.description)}</p><span class="chips">${(c.chips || []).map((x) => `<span class="chip">${esc(x)}</span>`).join('')}</span></a></li>`;
  const legal = (kicker, h1, inner) => `<article class="prose"><span class="kicker">${kicker}</span><h1>${h1}</h1>${inner}<p class="changelog">Last updated: ${REVIEWED}</p></article>`;
  const web = { '@context': 'https://schema.org', '@type': 'WebSite', name: 'ClickSolve Guide', url: ORIGIN + '/', inLanguage: 'en-US', publisher: ORG };

  const home = {
    path: '/', kind: 'home', loader: true,
    title: 'ClickSolve Guide – find where the tech problem is, then fix it',
    description: 'Guided checks for Wi-Fi, websites, printers and laptops that rule out device, Wi-Fi, router, provider and service one by one – with safe, versioned steps.',
    h1: 'Find where the problem is. Then fix it.',
    jsonld: [web],
    body: `<section class="hero">
<div><span class="kicker">Layer diagnosis · no downloads · no phone numbers</span>
<h1>Find where the problem is. Then fix it.</h1>
<p class="lede">Most “12 fixes for…” lists make you try everything. ClickSolve Guide asks a few yes-or-no questions first and crosses out what works – your device, the Wi-Fi, the router, your provider, the website – until one layer is left. Then you get only the steps for that layer, for your version of Windows, macOS, iPhone or Android.</p>
<p class="row"><a class="btn" href="/diagnose/wifi-connected-no-internet/">Start: Wi-Fi but no internet</a><a class="btn ghost" href="/diagnose/">All diagnoses</a></p></div>
<div class="hero-map">${chainSvg(['clear', 'clear', 'likely', 'clear', 'clear'], 'home-chain', 'Layer map example: device, Wi-Fi, provider and service crossed out, router marked as likely', 'A finished diagnosis: four layers ruled out by simple checks, one left. That is where the fix starts – not with a network reset.')}</div>
</section>
<section aria-labelledby="diag-h"><h2 id="diag-h">Pick the symptom</h2>
<p class="prose">Each diagnosis is an interactive decision tree. Your answers update the layer map on the page, and the fix log records what you checked – ready to download or print for IT, your provider or a repair shop.</p>
<ul class="cards">${tools.map(card).join('')}</ul></section>
<section class="band" aria-labelledby="how-h"><div class="wrap" style="padding:0">
<h2 id="how-h">How a layer diagnosis works</h2>
<ol class="rules">
<li><span class="mono">01</span><b>One check at a time</b>Each question is a test you can do in a minute or two – another device, a second browser, the router's light.</li>
<li><span class="mono">02</span><b>Answers cross out layers</b>If your phone loads pages on the same Wi-Fi, the router and provider work. The map shows it.</li>
<li><span class="mono">03</span><b>Steps for your system</b>Menu paths switch between Windows 11 and 10, current and older macOS, iPhone and Android.</li>
<li><span class="mono">04</span><b>Every step labeled</b>${riskLabel('harmless')} ${riskLabel('setting')} ${riskLabel('admin')} ${riskLabel('last')} – with the undo next to it.</li>
</ol></div></section>
<section aria-labelledby="guides-h"><h2 id="guides-h">Guides</h2>
<p class="prose">Explanations for the error messages and situations that don't need a full decision tree – each with the same version switcher, risk labels and copyable commands.</p>
<ul class="cards">${guides.map(card).join('')}</ul></section>
<section class="prose" aria-labelledby="why-h"><h2 id="why-h">Why “where” comes before “how”</h2>
<p>A connection to a website passes through five places: your device, its Wi-Fi link, your router, your internet provider and the service itself. A fault in any of them can look the same on screen – a spinning wheel or “No internet”. Generic fix lists don't know which one you have, so they suggest resetting things that were never broken: network settings, browser profiles, sometimes the router itself, with all its settings.</p>
<p>The quickest way to the real cause is to rule out layers with checks that change nothing. Does another device on the same Wi-Fi work? Then the router and the provider are fine, and you can stop looking there. Does the site open on mobile data? Then the website is up. Two or three answers like these usually leave one layer – and the fixes for that layer are short.</p>
<p>The guides on this site follow the official documentation from Microsoft, Apple, Google and printer makers, and they say so on each page. Read <a href="/how-we-check/">how we check our guides</a>, including what we can't promise.</p></section>
<aside class="scam" aria-labelledby="home-scam"><h2 id="home-scam">What this site never does</h2><p>ClickSolve Guide never shows a phone number, never offers remote access, and never recommends “optimizer”, “cleaner” or “driver updater” tools. Anyone who calls or pops up claiming your computer is infected is not support. <a href="/guides/tech-support-scams/">How to spot tech support scams</a>.</p></aside>`
  };

  const hub = (path, name, kicker, title, description, h1, intro, list) => ({
    path, kind: 'hub', loader: false, title, description, h1,
    jsonld: [crumbsLd([['Home', '/'], [name, path]])],
    body: `${crumbsHtml([['Home', '/'], [name, path]])}<span class="kicker">${kicker}</span><h1>${h1}</h1>${intro}<ul class="cards">${list.map(card).join('')}</ul>`
  });

  const diagnoseHub = hub('/diagnose/', 'Diagnoses', 'Interactive decision trees', 'Guided tech diagnoses: Wi-Fi, websites, printers, laptops',
    'Six interactive diagnoses that find the failing layer – device, Wi-Fi, router, provider or service – before you change anything. With fix log export.',
    'Guided diagnoses',
    `<div class="prose"><p class="lede">Each diagnosis asks one question at a time. Every answer crosses layers off the map until the likely culprit is left – then you see only the steps that fit, for your system.</p>
<p>The diagnoses run entirely in your browser. Your answers and notes are kept in this browser's local storage so you can come back after restarting the router; nothing is sent to us or anyone else. At any point you can download the fix log as a text file or print it. It lists the checks you did, your answers, the result and the recommended steps with their menu paths – the kind of record that saves time with an internet provider's support line, a company help desk or a repair shop.</p>
<p>Every step carries a risk label. “Harmless” steps change nothing. “Changes a setting” comes with the undo. “Admin needed” means you will be asked for an administrator password. “Last resort” steps remove saved settings and only appear after the gentler checks. If a diagnosis reaches a security warning – for example a certificate warning on a website – it stops and tells you what is safe to do. It never explains how to click past such a warning.</p>
<p>Not sure which one to pick? If nothing loads at all, start with <a href="/diagnose/wifi-connected-no-internet/">Wi-Fi connected but no internet</a>. If only one address fails, start with <a href="/diagnose/one-website-wont-load/">one website won't load</a>.</p></div>`,
    tools);

  const guidesHub = hub('/guides/', 'Guides', 'Explained step by step', 'Tech guides: DNS, Windows Update, Bluetooth, routers, scams',
    'Plain-English guides for DNS errors, stuck Windows updates, slow Macs, Bluetooth, iPhone and Android Wi-Fi, router restarts and tech support scams.',
    'Guides',
    `<div class="prose"><p class="lede">Some problems are better explained than branched: what a message means, what is safe to try in which order, and when to stop and get help.</p>
<p>Each guide states which systems it applies to, when it was last reviewed and which official documentation it was checked against. Menu paths follow the version switcher, so Windows 10 users don't read Windows 11 menus and the other way round. Commands come with a copy button and a sentence on what they do – and what they don't do – so you never paste something you don't understand.</p>
<p>The guides deliberately avoid third-party “repair” tools. When software is needed, it comes from the operating system itself or from the device maker's official website. The <a href="/guides/tech-support-scams/">tech support scam guide</a> explains why: fake support pages and pop-ups are one of the most common ways people lose money while trying to fix a computer.</p>
<p>Looking for an interactive check instead? The <a href="/diagnose/">diagnoses</a> ask questions and narrow the cause down for you.</p></div>`,
    guides);

  const methodFig = figure('method-fig', 'How a ClickSolve diagnosis is built: symptom, layer checks, result, steps with risk labels',
    `<rect class="d-box" x="10" y="30" width="150" height="70" rx="8"/><text class="d-t" x="85" y="62" text-anchor="middle">Symptom</text><text class="d-s" x="85" y="84" text-anchor="middle">what you see</text>
<path class="d-line" d="M162 65 h36"/><path class="d-fill-m" d="M198 59 l10 6 -10 6z"/>
<rect class="d-box-g" x="210" y="30" width="170" height="70" rx="8"/><text class="d-t" x="295" y="62" text-anchor="middle">Layer checks</text><text class="d-tg" x="295" y="84" text-anchor="middle">change nothing</text>
<path class="d-line" d="M382 65 h36"/><path class="d-fill-m" d="M418 59 l10 6 -10 6z"/>
<rect class="d-box-a" x="430" y="30" width="130" height="70" rx="8"/><text class="d-t" x="495" y="62" text-anchor="middle">Result</text><text class="d-ta" x="495" y="84" text-anchor="middle">likely layer</text>
<path class="d-line" d="M562 65 h36"/><path class="d-fill-m" d="M598 59 l10 6 -10 6z"/>
<rect class="d-box" x="610" y="30" width="100" height="70" rx="8"/><text class="d-t" x="660" y="62" text-anchor="middle">Steps</text><text class="d-s" x="660" y="84" text-anchor="middle">+ undo</text>
<text class="d-s" x="10" y="140">Order of steps inside a result:</text>
<rect class="d-box-g" x="10" y="156" width="160" height="34" rx="5"/><text class="d-tg" x="90" y="178" text-anchor="middle">HARMLESS</text>
<rect class="d-box" x="186" y="156" width="170" height="34" rx="5"/><text class="d-s" x="271" y="178" text-anchor="middle">CHANGES A SETTING</text>
<rect class="d-box-a" x="372" y="156" width="160" height="34" rx="5"/><text class="d-ta" x="452" y="178" text-anchor="middle">ADMIN NEEDED</text>
<rect class="d-box-r" x="548" y="156" width="160" height="34" rx="5"/><text class="d-tr" x="628" y="178" text-anchor="middle">LAST RESORT</text>`,
    'Checks come before fixes, and fixes are ordered from harmless to last resort. A step that cannot be undone is never the first suggestion.', '0 0 720 200');

  const howWeCheck = {
    path: '/how-we-check/', kind: 'about', loader: false,
    title: 'How we check our guides – ClickSolve Guide method',
    description: 'How ClickSolve Guide builds its layer diagnoses, which sources the steps are checked against, what the risk labels mean and what we cannot promise.',
    h1: 'How we check our guides',
    jsonld: [crumbsLd([['Home', '/'], ['How we check', '/how-we-check/']])],
    body: `${crumbsHtml([['Home', '/'], ['How we check', '/how-we-check/']])}<article class="prose"><span class="kicker">Method</span><h1>How we check our guides</h1>
<p class="lede">A troubleshooting guide is only useful if its menu paths exist on your screen and its steps don't make things worse. This page explains how ClickSolve Guide is put together, what each page is checked against, and where the limits are.</p>
<p class="trust"><span><b>Reviewed ${REVIEWED}</b></span><span>Applies to: every diagnosis and guide on this site</span></p>
<h2 id="layers">The layer model</h2>
<p>Every diagnosis on this site uses the same idea: a request from your screen passes through layers, and a fault sits in one of them. For internet problems the layers are your <b>device</b>, the <b>Wi-Fi</b> link, the <b>router</b>, your internet <b>provider (ISP)</b> and the <b>service</b> – the website or app at the other end. Printer problems use a shorter chain: computer and print queue, connection, router, printer.</p>
<p>A good check rules out a whole layer without changing anything. “Does another device on the same Wi-Fi work?” clears router and provider in one go. “Does the site open on mobile data?” clears the website. We order the checks so that the cheapest, safest and most informative ones come first, and we only show fixes once the layer is narrowed down.</p>
${methodFig}
<h2 id="trees">How a decision tree is written</h2>
<p>Each diagnosis is stored as a small data file: questions, possible answers, which layers each answer rules out or makes suspicious, and the result each path leads to. Before the site is published, an automated test walks through every possible path of every tree. It fails the build if a path ends nowhere, loops, refers to a missing step, or offers a step that changes a setting without saying how to undo it. The same code that runs the tree in your browser is used in that test.</p>
<p>The trees are deliberately short. If a question doesn't change the outcome, it is removed. If two answers lead to the same steps, they are merged.</p>
<h2 id="versions">Menu paths and versions</h2>
<p>Menus differ between Windows 11 and Windows 10, and macOS renamed System Preferences to System Settings in macOS 13 Ventura. Every menu path on this site is written separately for each version it applies to, and the version switcher shows the one you choose. Android is harder: phone makers rename menus, so Android paths name the stock Android wording and, where it differs, Samsung's. When we are not sure a path is identical on every build, we write it more generally (“Settings > Network & internet”) rather than inventing a precise-looking path.</p>
<h2 id="sources">What each page is checked against</h2>
<p>Steps and menu paths are compared with the official documentation of the company that makes the product: Microsoft Support and Microsoft Learn for Windows and its commands, Apple Support and the macOS, iPhone and iPad user guides, Google's Chrome and Android help, and the printer makers' own support sites. Security advice follows consumer-protection agencies such as the U.S. Federal Trade Commission. Each page lists its sources at the bottom and shows the date it was last reviewed.</p>
<p>We do not claim lab testing on hardware we don't have. The trust line on each page says what a page was checked against, not that someone reproduced every fault on every device.</p>
<h2 id="risk">Risk labels</h2>
${table('The four risk labels used on every step', ['Label', 'Meaning', 'Example'], [
  [riskLabel('harmless'), 'Reads information or restarts something. Nothing to undo.', 'Running <code>ipconfig</code>, restarting the router'],
  [riskLabel('setting'), 'Changes one setting. The undo is printed with the step.', 'Forgetting a Wi-Fi network, changing DNS servers'],
  [riskLabel('admin'), 'Needs an administrator account or password.', 'Restarting the Print Spooler, flushing DNS on a Mac'],
  [riskLabel('last'), 'Removes saved settings or data; only after the other steps.', 'Windows Network reset, resetting the Mac printing system']
])}
<h2 id="never">What we leave out on purpose</h2>
<ul><li>No phone numbers – ours or anyone else's. Support numbers belong on your contract, receipt or the maker's official site.</li>
<li>No “optimizer”, “cleaner”, “driver updater” or remote-access tools. Drivers come from Windows Update, macOS updates or the device maker.</li>
<li>No instructions for getting past certificate or security warnings. A diagnosis that reaches one stops and lists only safe actions.</li>
<li>No registry edits for everyday problems.</li></ul>
<h2 id="limits">Limits</h2>
<p>A decision tree can only follow the answers it gets. If a check is misread – a router light that looks normal but isn't – the result can point to the wrong layer. That's why every result says why it was reached, and why “Back one step” is always available. Company-managed computers may have menus locked or changed by IT; in that case your IT department is the right first contact. For hardware faults, the device maker's support is the place to go.</p>
<h2 id="corrections">Corrections and review</h2>
<p>When an operating system update changes a menu, or a reader reports a path that doesn't match, the page is corrected and its review date changes. You can report errors through the <a href="/contact/">contact page</a>. Pages are reviewed again after major Windows, macOS, iOS and Android releases.</p>
<p class="changelog">Last updated: ${REVIEWED}</p></article>`
  };

  const about = {
    path: '/about/', kind: 'about', loader: false,
    title: 'About ClickSolve Guide – who publishes it and how it works',
    description: 'Who publishes ClickSolve Guide, how the layer diagnoses and fix log work, how the content is checked, how the site is financed and what it cannot do.',
    h1: 'About ClickSolve Guide',
    jsonld: [crumbsLd([['Home', '/'], ['About', '/about/']])],
    body: `${crumbsHtml([['Home', '/'], ['About', '/about/']])}${legal('About', 'About ClickSolve Guide', `<p class="lede">ClickSolve Guide helps you find out <i>where</i> a technical problem sits – on your device, in the Wi-Fi, at the router, at your provider or at the service – before you start changing settings.</p>
<h2 id="who">Who publishes the site</h2>
<p>ClickSolve Guide is published by AdStern, an advertising agency based in Vienna, Austria (full details in the <a href="/imprint/">imprint</a>). The site is financed by advertising shown on diagnosis and guide pages. No hardware maker, software vendor or internet provider pays for mentions, and the guides contain no affiliate links.</p>
<h2 id="method">Method in short</h2>
<p>Each diagnosis is a decision tree: a question, a quick check, an answer that rules layers in or out. The visible layer map shows what has been ruled out. Results show only the steps for the remaining layer, written for the system you choose – Windows 11 or 10, macOS 13 or later or older macOS, iPhone and iPad, or Android. Every step has a risk label and, if it changes something, an undo. The full method is on <a href="/how-we-check/">How we check our guides</a>.</p>
<h2 id="checks">How the content is checked</h2>
<p>Menu paths, commands and steps are compared with the manufacturers' own documentation – Microsoft, Apple, Google and the printer makers – and every page names its sources and shows its review date. An automated test walks every path of every decision tree before publication. When we are not certain that a menu is named the same way on every version, we describe it more generally instead of guessing.</p>
<h2 id="limits">What the site cannot do</h2>
<p>It cannot see your device or network, so a result is a well-founded likelihood, not a certainty. It doesn't replace your company's IT department, your provider's line check or a hardware repair. It never offers remote support or phone help.</p>
<h2 id="data">Your data</h2>
<p>Diagnosis answers, notes and your chosen system version are stored only in your browser (local storage). The fix log is created in your browser too; nothing is uploaded. Details on advertising and analytics are in the <a href="/privacy/">privacy policy</a>.</p>
<h2 id="history">History</h2>
<p>The first version of this site was a single browser checklist covering four common problems, with a notes field, a report download and four short guides. The idea – one check after another, with a record at the end – is still the core. In November 2026 the site was rebuilt from scratch: the checklist became six branching diagnoses with a layer map and fix log, and the short guides became the full guides you can find under <a href="/guides/">Guides</a>.</p>`)}`
  };

  const contact = {
    path: '/contact/', kind: 'legal', loader: false,
    title: 'Contact ClickSolve Guide – corrections and feedback',
    description: 'How to reach the publisher of ClickSolve Guide by email, how corrections to menu paths are handled, and why the site offers no phone or remote support.',
    h1: 'Contact',
    jsonld: [crumbsLd([['Home', '/'], ['Contact', '/contact/']])],
    body: `${crumbsHtml([['Home', '/'], ['Contact', '/contact/']])}${legal('Contact', 'Contact', `<p class="lede">ClickSolve Guide is published by AdStern in Vienna, Austria. Write to <a href="mailto:office@adstern.com">office@adstern.com</a>; the postal address is in the <a href="/imprint/">imprint</a>.</p>
<h2 id="corrections">Corrections</h2>
<p>If a menu path or command doesn't match what you see, tell us the page, the step, your system and its version (for example “Windows 11 24H2” or “macOS 15”) and what your screen shows instead. Confirmed errors are corrected and the page's review date changes.</p>
<h2 id="no-support">No personal tech support</h2>
<p>We don't offer individual troubleshooting, phone calls or remote sessions, and we never will. If someone contacts you claiming to be ClickSolve Guide support, it is not us. For your device, contact its maker through its official website; for your connection, use the contact details on your provider's contract or bill.</p>
<h2 id="ads">Advertising</h2>
<p>We don't sell sponsored articles or paid links. Advertising on the site is delivered by Google AdSense and is always labeled “Advertisement”.</p>
<p>How we handle data is described in the <a href="/privacy/">privacy policy</a>.</p>`)}`
  };

  const imprint = {
    path: '/imprint/', kind: 'legal', loader: false,
    title: 'Imprint – ClickSolve Guide legal notice (AdStern, Vienna)',
    description: 'Legal notice for clicksolveguide.com under § 5 Austrian E-Commerce Act and § 25 Media Act: publisher, contact, business details and trade authority.',
    h1: 'Imprint',
    jsonld: [crumbsLd([['Home', '/'], ['Imprint', '/imprint/']])],
    body: `${crumbsHtml([['Home', '/'], ['Imprint', '/imprint/']])}${legal('Legal notice', 'Imprint', `<p>Information according to § 5 of the Austrian E-Commerce Act (ECG) and disclosure according to § 25 of the Austrian Media Act (MedienG).</p>
<h2 id="owner">Media owner and publisher</h2>
<p>AdStern<br>Seilerstätte 8<br>1010 Vienna<br>Austria</p>
<p>Email: <a href="mailto:office@adstern.com">office@adstern.com</a></p>
<h2 id="company">Business information</h2>
<ul><li>Business activity: advertising agency (Werbeagentur)</li>
<li>VAT ID: ATU54682507</li>
<li>Competent trade authority: Magistratisches Bezirksamt für den 1./8. Bezirk, Vienna</li>
<li>Member of the Vienna Economic Chamber (WKO Wien), Fachgruppe Werbung und Marktkommunikation</li>
<li>Applicable trade law: Gewerbeordnung 1994, published in the <a href="${RIS}" rel="noopener">Austrian Legal Information System (RIS)</a></li></ul>
<h2 id="line">Editorial line (§ 25 MedienG)</h2>
<p>ClickSolve Guide publishes interactive diagnoses and guides that help people locate and fix everyday problems with computers, phones, Wi-Fi, routers and printers. The information is general; it does not replace the device manufacturer's support or professional IT services.</p>
<h2 id="links">External links</h2>
<p>Links to other websites were checked when a page was last reviewed. We have no control over their content and are not responsible for it.</p>
<h2 id="disputes">Consumer disputes</h2>
<p>This website does not sell goods or services to consumers.</p>`)}`
  };

  const privacy = {
    path: '/privacy/', kind: 'legal', loader: false,
    title: 'Privacy policy – ClickSolve Guide (ads, consent, analytics)',
    description: 'How clicksolveguide.com processes data: GitHub Pages hosting, Google AdSense with consent, Google Analytics 4, diagnosis answers kept in your browser.',
    h1: 'Privacy policy',
    jsonld: [crumbsLd([['Home', '/'], ['Privacy', '/privacy/']])],
    body: `${crumbsHtml([['Home', '/'], ['Privacy', '/privacy/']])}${legal('Privacy', 'Privacy policy', `<p>This policy describes which personal data is processed when you visit clicksolveguide.com, why, on what legal basis, and which rights you have.</p>
<h2 id="controller">Controller</h2>
<p>AdStern, Seilerstätte 8, 1010 Vienna, Austria, email <a href="mailto:office@adstern.com">office@adstern.com</a>. Further details are in the <a href="/imprint/">imprint</a>.</p>
<h2 id="hosting">Hosting</h2>
<p>The site consists of static files served by GitHub Pages, a service of GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA. To deliver a page, your browser sends technical data to GitHub's servers: your IP address, the requested address, date and time, browser type and the referring page. GitHub uses this data to deliver and secure the service and may keep it in server logs for a limited time. Legal basis: our legitimate interest in operating a reliable and secure website (Art. 6(1)(f) GDPR). Transfers to the USA are based on the EU–U.S. Data Privacy Framework or standard contractual clauses. More in the <a href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement" rel="noopener">GitHub General Privacy Statement</a>.</p>
<h2 id="tools">Diagnosis answers, notes and fix logs</h2>
<p>The diagnoses run entirely in your browser. Your answers, the notes you type and the system version you choose are saved in your browser's local storage on your device so that a diagnosis can continue after a restart. The fix log is created in your browser when you download or print it. None of this is sent to us, to Google or to anyone else, and it is not used for advertising or analytics. You can delete it by clearing this site's data in your browser settings or with “Start over” in a diagnosis (which clears the answers; delete the notes text yourself).</p>
<h2 id="ads">Advertising with Google AdSense</h2>
<p>Diagnosis and guide pages show advertising delivered by Google AdSense, provided by Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ireland (for users outside the EEA, the UK and Switzerland: Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA). AdSense uses cookies and similar technologies to show ads, limit how often you see the same ad, measure performance and prevent fraud.</p>
<p><b>Third party vendors, including Google, use cookies to serve ads based on a user's prior visits to this website or other websites.</b> Google's use of advertising cookies enables it and its partners to serve ads to users based on their visit to this site and/or other sites on the Internet.</p>
<p>You can opt out of personalized advertising in <a href="https://adssettings.google.com" rel="noopener">Google Ads Settings</a>, at <a href="https://www.aboutads.info/choices/" rel="noopener">www.aboutads.info</a>, or in Europe at <a href="https://www.youronlinechoices.eu/" rel="noopener">www.youronlinechoices.eu</a>. How Google uses data from sites that use its services is explained at <a href="https://policies.google.com/technologies/partner-sites" rel="noopener">policies.google.com/technologies/partner-sites</a>.</p>
<p><b>Consent.</b> If you visit from the European Economic Area, the United Kingdom or Switzerland, a consent message from Google's certified consent management platform (IAB Transparency &amp; Consent Framework) appears before cookies or similar technologies that require consent are used. Personalized ads require your consent. Non-personalized ads, which rely on page content and approximate location, also use cookies or identifiers for frequency capping, reporting and fraud prevention, so they also require consent to storing and accessing information on your device. Without that consent, Google can show only limited ads that do not use cookies or local storage for advertising and are not personalized; Google still processes technical data such as your IP address to deliver them and to prevent fraud. Legal basis: your consent (Art. 6(1)(a) GDPR and § 165(3) of the Austrian Telecommunications Act 2021). You can change or withdraw your choice at any time with <button type="button" class="linklike" data-privacy-settings>Privacy settings</button> – the same link is in the footer of every page.</p>
<h2 id="analytics">Google Analytics 4</h2>
<p>We use Google Analytics 4 (Google Ireland Limited / Google LLC) to learn which diagnoses and guides are used, so we can improve them. Before any Google script runs, every page sets Google Consent Mode to “denied” for advertising and analytics storage and switches Google Analytics off. In the EEA, the UK and Switzerland, Google Analytics is loaded only after you consent in the consent message to storing and accessing information on a device (TCF purpose 1), to Google as a vendor and to analytics. Elsewhere it is loaded only when the consent message reports analytics as granted or not requiring consent and confirms that you have not opted out under a U.S. state privacy law; missing or unclear signals keep it off. If you withdraw consent under “Privacy settings”, Consent Mode returns to “denied” and Google Analytics is switched off at once. Your diagnosis answers and notes are never sent to Google Analytics. Google Analytics 4 does not log or store IP addresses. Event data is deleted after the retention period set in our account, at most 14 months. Legal basis: your consent (Art. 6(1)(a) GDPR). Transfers to Google LLC in the USA are based on the EU–U.S. Data Privacy Framework.</p>
<h2 id="fonts">Fonts and other resources</h2>
<p>The fonts Schibsted Grotesk and JetBrains Mono are served from this website itself. Apart from the Google advertising and analytics scripts described above, the site loads no scripts, styles or fonts from other servers.</p>
<h2 id="email">Email</h2>
<p>If you write to us, we use your address and message only to answer and delete them when they are no longer needed for that, unless legal retention periods apply (Art. 6(1)(b) and (f) GDPR).</p>
<h2 id="rights">Your rights</h2>
<p>You have the right of access (Art. 15 GDPR), rectification (Art. 16), erasure (Art. 17), restriction of processing (Art. 18), data portability (Art. 20) and to object to processing based on legitimate interests (Art. 21). You can withdraw consent at any time with effect for the future. Because we do not store personal data about visitors ourselves, most requests concern Google; Google's own controls are at <a href="https://myaccount.google.com/data-and-privacy" rel="noopener">myaccount.google.com</a>.</p>
<p>You have the right to lodge a complaint with a supervisory authority – in Austria the Datenschutzbehörde, Barichgasse 40–42, 1030 Vienna, <a href="mailto:dsb@dsb.gv.at">dsb@dsb.gv.at</a>, <a href="https://www.dsb.gv.at/" rel="noopener">www.dsb.gv.at</a> – or with the authority in the country where you live.</p>
<h2 id="us">Notice for U.S. residents</h2>
<p>Some U.S. state privacy laws, for example the California Consumer Privacy Act as amended by the CPRA, may treat advertising cookies used for cross-context behavioral advertising as a “sale” or “sharing” of personal information. Where such laws apply, Google's consent platform offers a “Do Not Sell or Share My Personal Information” choice on this site, which you can reopen at any time via “Privacy settings”. We do not sell personal information in any other way and do not knowingly collect personal information from children under 16.</p>
<h2 id="changes">Changes</h2>
<p>We update this policy when the services used on the site change. The date below shows the current version.</p>`)}`
  };

  const notFound = {
    path: '/404.html', kind: '404', noindex: true, loader: false,
    title: 'Page not found – ClickSolve Guide',
    description: 'This address does not exist on ClickSolve Guide. Start a diagnosis or browse the guides instead.',
    body: `<article class="prose"><span class="kicker">Error 404 · layer: this website</span><h1>This page doesn't exist</h1>
<p class="lede">Good news: your internet works – you reached our server. The address itself is wrong or the page has moved.</p>
<p>Check the address for typos, or go on from here:</p>
<ul><li><a href="/">Home page</a></li><li><a href="/diagnose/">All diagnoses</a></li><li><a href="/guides/">All guides</a></li><li><a href="/diagnose/one-website-wont-load/">One website won't load</a></li></ul></article>`
  };

  return [home, diagnoseHub, guidesHub, about, howWeCheck, contact, imprint, privacy, notFound];
}
