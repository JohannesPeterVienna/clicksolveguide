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
  const UPDATED = { 'Privacy policy': 'November 4, 2026', 'About ClickSolve Guide': 'November 4, 2026', method: 'November 4, 2026' }; // pages changed after first publication
  const legal = (kicker, h1, inner) => `<article class="prose"><span class="kicker">${kicker}</span><h1>${h1}</h1>${inner}<p class="changelog">Last updated: ${UPDATED[h1] || REVIEWED}</p></article>`;
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
<section class="vorteile" aria-labelledby="vt-h"><h2 id="vt-h">What you get</h2><ul><li><b>Find the broken layer first</b><span>Device, app, account, network or service – a decision tree narrows it down.</span></li><li><b>Fixes in the right order</b><span>Safe, reversible steps first; nothing that risks your data.</span></li><li><b>A fix log to hand over</b><span>What you checked, ready to download or print for IT, support or a repair shop.</span></li><li><b>Honest about scams</b><span>No fake “support” numbers, no remote-access tricks – and how to spot them.</span></li><li><b>Runs in your browser</b><span>Your answers stay on your device; nothing is uploaded.</span></li><li><b>Free, no sign-up</b><span>No account, no paywall, no tech jargon you have to know first.</span></li></ul></section>
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

  const hub = (path, name, kicker, title, description, h1, intro, list, after = '') => ({
    path, kind: 'hub', loader: true, title, description, h1,
    jsonld: [crumbsLd([['Home', '/'], [name, path]])],
    body: `${crumbsHtml([['Home', '/'], [name, path]])}<span class="kicker">${kicker}</span><h1>${h1}</h1>${intro}<ul class="cards">${list.map(card).join('')}</ul>${after}`
  });
  // "When this fits" paragraphs below the cards: one per page, in the order of ORDER.
  const fits = (h2id, h2, lead, items) => `<section class="prose" aria-labelledby="${h2id}"><h2 id="${h2id}">${h2}</h2>${lead}${items.map(([slug, html]) => {
    const c = content.find((x) => x.slug === slug);
    if (!c) { if (process.env.ONLY) return ''; throw new Error('fits: unknown page ' + slug); }
    return `<h3><a href="${c.path}">${esc(c.h1)}</a></h3><p>${html}</p>`;
  }).join('')}</section>`;

  const diagnoseHub = hub('/diagnose/', 'Diagnoses', 'Interactive decision trees', 'Guided tech diagnoses: Wi-Fi, websites, printers, laptops',
    'Six interactive diagnoses that find the failing layer – device, Wi-Fi, router, provider or service – before you change anything. With fix log export.',
    'Guided diagnoses',
    `<div class="prose"><p class="lede">Each diagnosis asks one question at a time. Every answer crosses layers off the map until the likely culprit is left – then you see only the steps that fit, for your system.</p>
<p>The diagnoses run entirely in your browser. Your answers and notes are kept in this browser's local storage so you can come back after restarting the router; nothing is sent to us or anyone else. At any point you can download the fix log as a text file or print it. It lists the checks you did, your answers, the result and the recommended steps with their menu paths – the kind of record that saves time with an internet provider's support line, a company help desk or a repair shop.</p>
<p>Every step carries a risk label. “Harmless” steps change nothing. “Changes a setting” comes with the undo. “Admin needed” means you will be asked for an administrator password. “Last resort” steps remove saved settings and only appear after the gentler checks. If a diagnosis reaches a security warning – for example a certificate warning on a website – it stops and tells you what is safe to do. It never explains how to click past such a warning.</p>
<p>Not sure which one to pick? If nothing loads at all, start with <a href="/diagnose/wifi-connected-no-internet/">Wi-Fi connected but no internet</a>. If only one address fails, start with <a href="/diagnose/one-website-wont-load/">one website won't load</a>.</p></div>`,
    tools,
    fits('fit-h', 'When each check fits', `<p>The six diagnoses overlap on purpose – a printer that is “offline” can be a Wi-Fi problem, and a Chrome error can be a router problem. What decides the right starting point is the first thing you see on screen. The paragraphs below say which symptom each diagnosis starts from, what its first question is, and when another page is the better choice.</p>`, [
      ['wifi-connected-no-internet', 'Use this when your device shows a Wi-Fi connection – bars, sometimes “No internet, secured” – but pages and apps don’t load. The first question is whether everything fails or only one site or app, because that single answer clears four of the five layers when only one service is affected. The tree then covers sign-in pages on hotel and public networks, a stuck connection on the device, VPN or filter software, name lookup, the router and a provider outage, for Windows, macOS, iPhone, iPad and Android.'],
      ['site-cant-be-reached', 'Use this when Chrome shows its grey “This site can’t be reached” page. The first question is the small code under the headline – NXDOMAIN, TIMED_OUT, REFUSED, RESET or none – because each code points to a different layer, from a typing mistake in the address to a DNS server or a filter on your network. In Edge, Safari or Firefox the codes look different: start with the one-website diagnosis when only one address fails, or with Wi-Fi connected but no internet when nothing loads.'],
      ['one-website-wont-load', 'Use this when one address fails while other websites load normally, in any browser. The first question is what the page shows: an error, a blank or endlessly loading page, a block notice from your network, or a security warning. A certificate warning is a hard stop – the diagnosis lists only safe actions there. The other paths compare a private window or second browser, another device on the same Wi-Fi, mobile data and the site’s official status page to separate the website, your browser data or extensions, the device and the network.'],
      ['printer-offline-windows-11', 'Use this when Windows 11 or 10 lists your printer as “Offline” or jobs wait in the queue without printing. The first question is whether the printer itself is on, awake and free of error messages on its display, because no setting on the PC fixes a printer that shows an error. After that, the checks separate a USB cable, a printer that has dropped off your Wi-Fi, the router, a stuck queue or offline setting, and a hung Print Spooler.'],
      ['mac-printer-not-printing', 'Use this when a Mac doesn’t print: the queue is paused, the printer is “not connected”, or jobs disappear without a page coming out. The first question is whether the printer still appears in Printers &amp; Scanners. From there the tree reads the queue status line, checks the USB or Wi-Fi connection and compares with printing from an iPhone or iPad. Removing and re-adding the printer comes late, and resetting the printing system is the last resort – each with its undo described.'],
      ['laptop-wont-connect-wifi', 'Use this when the problem happens before the internet even starts: a Windows laptop or MacBook can’t see your network, sees it but won’t join, or rejects the password. The first question is which of those you see. If the laptop does join but then shows “No internet”, the diagnosis says so and sends you to the Wi-Fi-but-no-internet check, because the join itself is then working.']
    ]));

  const guidesHub = hub('/guides/', 'Guides', 'Explained step by step', 'Tech guides: DNS, Windows Update, Bluetooth, routers, scams',
    'Plain-English guides for DNS errors, stuck Windows updates, slow Macs, Bluetooth, iPhone and Android Wi-Fi, router restarts and tech support scams.',
    'Guides',
    `<div class="prose"><p class="lede">Some problems are better explained than branched: what a message means, what is safe to try in which order, and when to stop and get help.</p>
<p>Each guide states which systems it applies to, when it was last reviewed and which official documentation it is based on. Menu paths follow the version switcher, so Windows 10 users don't read Windows 11 menus and the other way round. Commands come with a copy button and a sentence on what they do – and what they don't do – so you never paste something you don't understand.</p>
<p>The guides deliberately avoid third-party “repair” tools. When software is needed, it comes from the operating system itself or from the device maker's official website. The <a href="/guides/tech-support-scams/">tech support scam guide</a> explains why: fake support pages and pop-ups are one of the most common ways people lose money while trying to fix a computer.</p>
<p>Looking for an interactive check instead? The <a href="/diagnose/">diagnoses</a> ask questions and narrow the cause down for you.</p></div>`,
    guides,
    fits('fit-h', 'Which guide to read when', `<p>Each guide answers one situation. If you are not sure which one is yours, the short notes below say what each guide starts from and what it leaves to another page.</p>`, [
      ['dns-server-not-responding', 'Read this when Windows Network Diagnostics reports that the DNS server isn’t responding, or when sites fail by name while the connection itself looks fine. It shows how to confirm the diagnosis with <code>ping</code> and <code>nslookup</code>, and how to try another DNS server for a test – with the steps to set it back to automatic.'],
      ['windows-update-stuck', 'Read this when an update sits at the same percentage or on “Working on updates” for a long time. A decision table separates the cases where waiting is right from those where a restart is safe, and resetting the update cache is kept for the very end.'],
      ['mac-running-slow', 'Read this when a Mac shows the spinning wheel, apps open slowly or the fan runs loud. It checks five causes in Activity Monitor and System Settings – background indexing after an update, storage, a runaway app, memory pressure and login items – without any cleaner app.'],
      ['bluetooth-not-working-windows-11', 'Read this when the Bluetooth switch is missing in Windows 11, a device won’t pair, or a paired mouse or headset keeps dropping out. It works from the switch and the adapter up to the device itself, with Windows 10 paths in the version switcher.'],
      ['restart-router-right-way', 'Read this before you unplug anything: the order for modem and router, how long to wait, what the lights usually mean afterwards, and why the pinhole reset button is not a restart. Several diagnosis and guide pages link here for their router step.'],
      ['which-windows-macos-version', 'Read this when a support article or a menu path depends on your exact system version. It shows where Windows, macOS, iOS and Android display it, two commands that answer it instantly, and why websites often guess the version wrong.'],
      ['tech-support-scams', 'Read this when a pop-up claims your device is infected, someone calls about “errors” on your computer, or you have already let a caller connect remotely. It explains the pattern, how to close a pop-up that won’t go away, and what to do in which order if money or access is involved.'],
      ['iphone-wont-connect-wifi', 'Read this when an iPhone or iPad rejects the Wi-Fi password, doesn’t list the network or shows “No Internet Connection” under its name. It starts from the small text under the network name and keeps Reset Network Settings as the last resort.'],
      ['android-connected-no-internet', 'Read this when an Android phone shows “Connected, no internet” or “Connected without internet”. It checks sign-in pages, Private DNS, date and time and the router in that order, with Samsung Galaxy menu names where they differ.']
    ]));

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
    path: '/how-we-check/', kind: 'about', loader: true,
    title: 'How we check our guides – ClickSolve Guide method',
    description: 'How ClickSolve Guide builds its layer diagnoses, which sources the steps are based on, what the risk labels mean and what we cannot promise.',
    h1: 'How we check our guides',
    jsonld: [crumbsLd([['Home', '/'], ['How we check', '/how-we-check/']])],
    body: `${crumbsHtml([['Home', '/'], ['How we check', '/how-we-check/']])}<article class="prose"><span class="kicker">Method</span><h1>How we check our guides</h1>
<p class="lede">A troubleshooting guide is only useful if its menu paths exist on your screen and its steps don't make things worse. This page explains how ClickSolve Guide is put together, which sources each page is based on, and where the limits are.</p>
<p class="trust"><span><b>Reviewed ${UPDATED.method}</b></span><span>Applies to: every diagnosis and guide on this site</span></p>
<h2 id="layers">The layer model</h2>
<p>Every diagnosis on this site uses the same idea: a request from your screen passes through layers, and a fault sits in one of them. For internet problems the layers are your <b>device</b>, the <b>Wi-Fi</b> link, the <b>router</b>, your internet <b>provider (ISP)</b> and the <b>service</b> – the website or app at the other end. Printer problems use a shorter chain: computer and print queue, connection, router, printer.</p>
<p>A good check rules out a whole layer without changing anything. “Does another device on the same Wi-Fi work?” clears router and provider in one go. “Does the site open on mobile data?” clears the website. We order the checks so that the cheapest, safest and most informative ones come first, and we only show fixes once the layer is narrowed down.</p>
${methodFig}
<h2 id="trees">How a decision tree is written</h2>
<p>Each diagnosis is stored as a small data file: questions, possible answers, which layers each answer rules out or makes suspicious, and the result each path leads to. Before the site is published, an automated test walks through every possible path of every tree. It fails the build if a path ends nowhere, loops, refers to a missing step, or offers a step that changes a setting without saying how to undo it. The same code that runs the tree in your browser is used in that test.</p>
<p>The trees are deliberately short. If a question doesn't change the outcome, it is removed. If two answers lead to the same steps, they are merged.</p>
<h2 id="versions">Menu paths and versions</h2>
<p>Menus differ between Windows 11 and Windows 10, and macOS renamed System Preferences to System Settings in macOS 13 Ventura. Every menu path on this site is written separately for each version it applies to, and the version switcher shows the one you choose. Android is harder: phone makers rename menus, so Android paths name the stock Android wording and, where it differs, Samsung's. When we are not sure a path is identical on every build, we write it more generally (“Settings > Network & internet”) rather than inventing a precise-looking path.</p>
<h2 id="sources">Which sources each page is based on</h2>
<p>Steps and menu paths follow the official documentation of the company that makes the product: Microsoft Support and Microsoft Learn for Windows and its commands, Apple Support and the macOS, iPhone and iPad user guides, Google's Chrome and Android help, and the printer makers' own support sites. Security advice follows consumer-protection agencies such as the U.S. Federal Trade Commission. Each page lists its sources at the bottom and shows the date it was last reviewed.</p>
<p>We do not claim lab testing on hardware we don't have. The source line at the top of each page names the documentation a page is based on – it does not mean someone reproduced every fault on every device. Menus can change with updates; tell us when one differs.</p>
<h2 id="review">How a page is written and reviewed</h2>
<p>Pages are written with the help of AI tools from the official documentation listed under each page. Before publication, a separate review pass checks the statements, menu paths and commands against those sources, and anything that cannot be confirmed is rewritten more generally or removed. That review consists of independent AI review passes and the automated tests described above; there is no team of human editors behind the site. AdStern, the publisher, decides what goes online and is responsible for it.</p>
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
<p class="changelog">Last updated: ${UPDATED.method}</p></article>`
  };

  const about = {
    path: '/about/', kind: 'about', loader: true,
    title: 'About ClickSolve Guide – who publishes it and how it works',
    description: 'Who publishes ClickSolve Guide, how the layer diagnoses and fix log work, how the content is put together, how the site is financed and what it cannot do.',
    h1: 'About ClickSolve Guide',
    jsonld: [crumbsLd([['Home', '/'], ['About', '/about/']])],
    body: `${crumbsHtml([['Home', '/'], ['About', '/about/']])}${legal('About', 'About ClickSolve Guide', `<p class="lede">ClickSolve Guide helps you find out <i>where</i> a technical problem sits – on your device, in the Wi-Fi, at the router, at your provider or at the service – before you start changing settings.</p>
<h2 id="who">Who publishes the site</h2>
<p>ClickSolve Guide is published by AdStern, an advertising agency based in Vienna, Austria (full details in the <a href="/imprint/">imprint</a>). It is a small independent site, not a company with a support staff or a test lab. The site is financed by advertising shown on the diagnosis, guide and overview pages; the imprint, privacy policy and contact page carry no advertising. No hardware maker, software vendor or internet provider pays for mentions, and the guides contain no affiliate links.</p>
<h2 id="method">Method in short</h2>
<p>Each diagnosis is a decision tree: a question, a quick check, an answer that rules layers in or out. The visible layer map shows what has been ruled out. Results show only the steps for the remaining layer, written for the system you choose – Windows 11 or 10, macOS 13 or later or older macOS, iPhone and iPad, or Android. Every step has a risk label and, if it changes something, an undo. The full method is on <a href="/how-we-check/">How we check our guides</a>.</p>
<h2 id="checks">How the content is put together</h2>
<p>Menu paths, commands and steps are based on the manufacturers' own documentation – Microsoft, Apple, Google and the printer makers – and every page names its sources and shows its review date. When we are not certain that a menu is named the same way on every version, we describe it more generally instead of guessing.</p>
<p>The pages are written with the help of AI tools, working from that official documentation. Before a page is published, it goes through a separate review pass that checks its statements, menu paths and commands against the sources it names; findings from that pass are fixed or the statement is removed. That review is done by independent AI review passes and automated tests, not by a team of human editors – the site does not have one. The publisher decides what is published and is responsible for it.</p>
<h2 id="tests">What the automated tests check</h2>
<p>The automated tests run before every publication and stop it when one of them fails. They walk every possible path of every decision tree and fail if a path ends nowhere, loops, refers to a missing step, or offers a step that changes a setting without an undo. They build the fix log for every path and check that it contains the answers, the result and the risk label of each step. They check that the commands shown match the system you chose, and that phones and tablets get settings paths instead of terminal commands. A page check fails on any broken internal link, and every page is loaded in a headless browser at phone and desktop width to catch script errors and layouts wider than the screen.</p>
<p>What the tests cannot do is press buttons on your router or open the settings of every phone model. Nobody at ClickSolve Guide has reproduced each fault on each device, and the pages don't claim so. The “Sources” line at the top of a page names the documentation it is based on; the “Reviewed” date is the day the page was last checked against those sources.</p>
<h2 id="corrections">Corrections</h2>
<p>Menus move with system updates, and some devices name things differently. If a step doesn't match your screen, write to us through the <a href="/contact/">contact page</a> with the page, the step and your system version. Confirmed errors are corrected, the page's review date changes and its change log says what was corrected.</p>
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
<p>We link to other websites only where they add information. We have no control over their content and are not responsible for it.</p>
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
<p>Diagnosis, guide and overview pages (the home page, the diagnosis and guide overviews, About and How we check) can show advertising; the imprint, this privacy policy and the contact page load no advertising. The advertising is delivered by Google AdSense, provided by Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ireland (for users outside the EEA, the UK and Switzerland: Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA). AdSense uses cookies and similar technologies to show ads, limit how often you see the same ad, measure performance and prevent fraud.</p>
<p><b>Third party vendors, including Google, use cookies to serve ads based on a user's prior visits to this website or other websites.</b> Google's use of advertising cookies enables it and its partners to serve ads to users based on their visit to this site and/or other sites on the Internet.</p>
<p>You can opt out of personalized advertising in <a href="https://adssettings.google.com" rel="noopener">Google Ads Settings</a>, at <a href="https://www.aboutads.info/choices/" rel="noopener">www.aboutads.info</a>, or in Europe at <a href="https://www.youronlinechoices.eu/" rel="noopener">www.youronlinechoices.eu</a>. How Google uses data from sites that use its services is explained at <a href="https://policies.google.com/technologies/partner-sites" rel="noopener">policies.google.com/technologies/partner-sites</a>.</p>
<p><b>Consent.</b> If you visit from the European Economic Area, the United Kingdom or Switzerland, a consent message from Google's certified consent management platform (IAB Transparency &amp; Consent Framework) appears before cookies or similar technologies that require consent are used. Personalized ads require your consent. Non-personalized ads, which rely on page content and approximate location, also use cookies or identifiers for frequency capping, reporting and fraud prevention, so they also require consent to storing and accessing information on your device. Without that consent, Google can show only limited ads. Limited ads do not use cookies or local storage for personalised advertising; Google may still use them for fraud prevention and frequency limits as described in its documentation, and it processes technical data such as your IP address to deliver the ads. Legal basis: your consent (Art. 6(1)(a) GDPR and § 165(3) of the Austrian Telecommunications Act 2021). You can change or withdraw your choice at any time with <button type="button" class="linklike" data-privacy-settings>Privacy settings</button> – the same link is in the footer of every page. If a U.S. state privacy law applies to your visit, the button opens Google’s U.S. opt-out dialog instead, where you can opt out of the sale or sharing of personal information and of targeted advertising; after an opt-out, ad personalization and Google Analytics stay off.</p>
<h2 id="analytics">Google Analytics 4</h2>
<p>We use Google Analytics 4 (Google Ireland Limited / Google LLC) to learn which diagnoses and guides are used, so we can improve them. Before any Google script runs, every page sets Google Consent Mode to “denied” for advertising and analytics storage and switches Google Analytics off. In the EEA, the UK and Switzerland, Google Analytics is loaded only after you consent in the consent message to storing and accessing information on a device (TCF purpose 1), to Google as a vendor and to analytics. Elsewhere it is loaded only when the consent message reports analytics as granted or not requiring consent and confirms that you have not opted out under a U.S. state privacy law; missing or unclear signals keep it off. If you withdraw consent under “Privacy settings”, Consent Mode returns to “denied” and Google Analytics is switched off at once. Your diagnosis answers and notes are never sent to Google Analytics. Google Analytics 4 does not log or store IP addresses. Event data is deleted after the retention period set in our Google Analytics property. Legal basis: your consent (Art. 6(1)(a) GDPR). Transfers to Google LLC in the USA are based on the EU–U.S. Data Privacy Framework.</p>
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
