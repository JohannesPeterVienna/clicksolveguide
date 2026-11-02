import { mp, table, figure, note } from '../lib.mjs';

const svg = `
<text class="d-s" x="20" y="22">THREE COMPARISONS, THREE ANSWERS</text>
<rect class="d-box" x="20" y="40" width="210" height="150" rx="8"/>
<text class="d-t" x="125" y="68" text-anchor="middle">Other sites, same device</text>
<text class="d-tg" x="125" y="104" text-anchor="middle">load → network OK</text>
<text class="d-tr" x="125" y="130" text-anchor="middle">fail → connection</text>
<text class="d-s" x="125" y="170" text-anchor="middle">clears Wi-Fi, router, ISP</text>
<rect class="d-box" x="255" y="40" width="210" height="150" rx="8"/>
<text class="d-t" x="360" y="68" text-anchor="middle">Same site, mobile data</text>
<text class="d-tg" x="360" y="104" text-anchor="middle">opens → site is up</text>
<text class="d-tr" x="360" y="130" text-anchor="middle">fails → the site</text>
<text class="d-s" x="360" y="170" text-anchor="middle">clears or blames the website</text>
<rect class="d-box" x="490" y="40" width="210" height="150" rx="8"/>
<text class="d-t" x="595" y="68" text-anchor="middle">Private window</text>
<text class="d-tg" x="595" y="104" text-anchor="middle">works → browser data</text>
<text class="d-ta" x="595" y="130" text-anchor="middle">fails → device/network</text>
<text class="d-s" x="595" y="170" text-anchor="middle">splits browser from device</text>
<rect class="d-box-r" x="20" y="208" width="680" height="40" rx="6"/>
<text class="d-tr" x="360" y="233" text-anchor="middle">CERTIFICATE / PRIVACY WARNING → STOP. NO COMPARISON, NO “PROCEED”.</text>`;

export default {
  slug: 'one-website-wont-load', kind: 'tool', tree: 'one-website',
  short: 'One website won’t load',
  kicker: 'Diagnosis · any browser, any device',
  title: 'One Website Won’t Load but Others Do: Guided Check',
  description: 'Only one site fails while others load? Three comparisons show if it is the site, your browser, your device or a network filter – and stop at security warnings.',
  h1: 'One website won’t load but others do',
  toolTitle: 'One site fails – site, browser or network?',
  cardText: 'Blank page, endless loading or an error on one address only. Three comparisons find out who is responsible.',
  chips: ['Browser', 'DNS', 'Website'],
  lede: 'When every other site works, your internet connection is fine – the question is whether the problem is the site itself, your browser, your device or a filter on your network. Three comparisons answer that. If the browser shows a security warning, the diagnosis stops.',
  applies: 'Chrome, Edge, Safari, Firefox on Windows, macOS, iPhone/iPad, Android',
  checked: 'Google Chrome Help, Microsoft Support, Apple Support, Mozilla Support',
  versions: ['win11', 'win10', 'macnew', 'macold', 'ios', 'android'],
  sections: [
    { id: 'logic', h2: 'Why one failing site is a different problem', html: `
<p>If other websites load, four of the five layers on the map are already proven: your device can reach the internet, the Wi-Fi works, the router passes traffic and the provider delivers it. What remains is everything specific to this one address – the website’s servers, its domain name, your browser’s stored data for it, and any filter that treats this site differently from others.</p>
<p>Each of those can be separated with a comparison that changes nothing. Open the site on a phone using mobile data: a different network with different DNS servers. Open it in a private window: the same browser without its stored cookies and usually without extensions. Open it on another device on the same Wi-Fi: same network, different device. Three answers usually leave one suspect.</p>
${figure('one-fig', 'Three comparisons for a single failing website and what each result rules out; certificate warnings stop the diagnosis', svg, 'The comparisons that isolate a single failing site. A certificate warning is not compared – it ends the diagnosis.', '0 0 720 260')}` },
    { id: 'symptoms', h2: 'What you see, and what it usually means', html: `
${table('Symptoms of a single failing site', ['What you see', 'Usually means', 'Where the diagnosis goes'], [
  ['Certificate or privacy warning', 'The browser can’t verify the site’s identity or encryption', 'Hard stop – safe actions only'],
  ['“Can’t be reached”, timed out, not found', 'Name lookup or connection failed for this address', 'Mobile data comparison'],
  ['Blank page or endless loading', 'Broken stored data, an extension, or a script that fails', 'Private window comparison'],
  ['Login loop (signed in, sent back to login)', 'Damaged or blocked cookies for this site', 'Delete this site’s data'],
  ['Block page naming your network or provider', 'Parental control, company/school filter, or legal block', 'Ask the network owner'],
  ['Site loads but looks broken', 'Ad blocker or privacy extension blocking parts', 'Extensions one by one']
])}
<p>Write down the exact wording of any error before you try anything – the fix log on this page has a notes field for it. Wording like “NET::ERR_CERT_DATE_INVALID” or “DNS_PROBE_FINISHED_NXDOMAIN” is precise and helps anyone you ask for help later.</p>` },
    { id: 'certificates', h2: 'Certificate warnings: why the diagnosis stops', html: `
<p>Every secure website proves its identity with a certificate. When the browser can’t verify it, it shows a full-page warning: “Your connection isn’t private” in Chrome and Edge, “Warning: Potential Security Risk Ahead” in Firefox, “This Connection Is Not Private” in Safari. The page usually offers an “Advanced” link with a way to continue anyway.</p>
<p>ClickSolve Guide does not explain how to continue past such warnings, and the diagnosis ends there. The warning can be caused by something harmless – an expired certificate the site owner forgot to renew – but you can’t tell from the outside. It can also mean that someone on the network is intercepting the connection, or that you are on a lookalike site. In all of those cases, entering a password or card number is the one thing you must not do.</p>
<p>What you can safely do is listed in the stop card: close the tab, make sure your device’s clock is right (a wrong date makes valid certificates look invalid), leave public Wi-Fi, and use a bookmark or type the address yourself. If the warning appears on many well-known sites at once, the problem is your network or device, not the sites – stop banking on it until it has been checked.</p>
${note('stop', 'Never click past a certificate warning to sign in or pay.', '<p>If you already entered a password on such a page, change that password through the real site – typed or bookmarked – and turn on two-step verification.</p>')}` },
    { id: 'browser', h2: 'When only your browser is affected', html: `
<p>If the site works in a private window or a second browser, the fault is in your normal browser profile. Stored cookies and cached files for that one site are the most common cause, followed by extensions. Delete the data for this site only rather than for all sites – you’ll be signed out of this site, but nowhere else. In Safari on a Mac, that is ${mp({ macnew: 'Safari > Settings > Privacy > Manage Website Data', macold: 'Safari > Preferences > Privacy > Manage Website Data' })}; on iPhone, ${mp({ ios: 'Settings > Apps > Safari > Advanced > Website Data' })} (on older iOS versions, Safari is directly in Settings).</p>
<p>Extensions are the second suspect. Ad blockers, privacy tools, translators, coupon finders and VPN extensions all modify pages or connections. Switch them off one at a time and reload; when the site works, you have found the culprit. Many blockers let you allow a single site instead of switching the whole extension off.</p>` },
    { id: 'network', h2: 'When the network treats this site differently', html: `
<p>If the site fails on every device on your Wi-Fi but opens on mobile data, your network handles it differently from the rest of the internet. Common reasons are parental controls or “safe browsing” features in the router, a filtering DNS service set up in the router, a company or school firewall, or the provider’s own DNS having a fault or carrying out a legal block.</p>
<p>A deliberate block is not a fault. If you don’t run the network, ask the person who does. If you do, the router’s app or admin page usually lists blocked sites or content categories. The <a href="/guides/dns-server-not-responding/">DNS guide</a> explains how to test a different DNS server on one device, with an undo.</p>
<p>If only one device fails while others on the same Wi-Fi open the site, the cause sits on that device but outside the browser: an outdated DNS cache entry, a VPN, a proxy setting or security software that classifies the site as risky. If security software names a threat, take that seriously and don’t visit the site.</p>` },
    { id: 'down', h2: 'When the site itself is down', html: `
<p>When the site fails on mobile data too, you have done all you can. Large services run official status pages, and many post outages on their verified social media accounts. Type those addresses yourself. Avoid “is it down” pages that push downloads or phone numbers – a website outage never requires you to install anything or call anyone.</p>
<p>A site can also be unreachable only from your country, or block certain connections such as VPN addresses. In that case the error may look like an outage but persist for days. Contact the operator through an address you already know, for example from an old invoice or order confirmation.</p>` }
  ],
  faq: [
    ['Why does a website work on my phone but not on my computer?', 'If the phone is on the same Wi-Fi, the network delivers the site and the computer is the difference – its browser data, an extension, a VPN or its DNS cache. If the phone was on mobile data, the comparison says only that the site is up; test the phone on Wi-Fi next.'],
    ['Is it safe to click “Proceed anyway” on a certificate warning?', 'ClickSolve Guide does not recommend it, and the diagnosis stops at that point. You can’t tell from the warning whether the cause is harmless or an interception, so close the tab and use only the safe actions listed.'],
    ['Will deleting a site’s data delete my account?', 'No. Deleting cookies and cached files for one site signs you out of that site and removes its local settings in this browser. Your account on the website stays as it is.'],
    ['Why does a wrong clock cause security warnings?', 'Certificates are valid for a fixed period. If the device believes it is a different year, a valid certificate looks expired or not yet valid. Setting the time automatically fixes that without weakening any protection.'],
    ['How do I know if a site is blocked by my network?', 'A block page often names the filter or provider. Without one, the sign is that the site fails on every device on your Wi-Fi but opens on mobile data.']
  ],
  sourcesNote: 'Browser behavior and certificate warnings follow each browser maker’s help pages; certificate validity periods follow Let’s Encrypt’s documentation.',
  sources: [
    ['Google Chrome Help – privacy and certificate errors', 'https://support.google.com/chrome/'],
    ['Mozilla Support – Firefox security warnings', 'https://support.mozilla.org/'],
    ['Apple Support – Safari User Guide', 'https://support.apple.com/'],
    ['Microsoft Support – Microsoft Edge help', 'https://support.microsoft.com/'],
    ['Let’s Encrypt – how certificates and their validity periods work', 'https://letsencrypt.org/docs/']
  ],
  related: ['/diagnose/site-cant-be-reached/', '/guides/dns-server-not-responding/', '/guides/tech-support-scams/', '/diagnose/wifi-connected-no-internet/']
};
