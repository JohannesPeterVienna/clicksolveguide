import { mp, cmd, table, figure, note } from '../lib.mjs';

const svg = `
<text class="d-s" x="20" y="22">WHAT THE WI-FI ICON CHECKS</text>
<path class="d-green" d="M20 32 H300"/>
<text class="d-s" x="330" y="22">WHAT “NO INTERNET” IS ABOUT</text>
<path class="d-amber" d="M330 32 H700"/>
<rect class="d-box" x="20" y="60" width="110" height="70" rx="8"/><text class="d-t" x="75" y="92" text-anchor="middle">Device</text><text class="d-s" x="75" y="114" text-anchor="middle">laptop, phone</text>
<path class="d-dash" d="M132 95 H188"/><text class="d-s" x="160" y="84" text-anchor="middle">Wi-Fi</text>
<rect class="d-box" x="190" y="60" width="110" height="70" rx="8"/><text class="d-t" x="245" y="92" text-anchor="middle">Router</text><text class="d-s" x="245" y="114" text-anchor="middle">+ modem</text>
<path class="d-line" d="M302 95 H378"/><text class="d-s" x="340" y="84" text-anchor="middle">line</text>
<path class="d-red" d="M330 82 l20 26 M350 82 l-20 26"/>
<rect class="d-box" x="380" y="60" width="140" height="70" rx="8"/><text class="d-t" x="450" y="92" text-anchor="middle">Provider</text><text class="d-s" x="450" y="114" text-anchor="middle">ISP, DNS</text>
<path class="d-line" d="M522 95 H578"/>
<rect class="d-box" x="580" y="60" width="120" height="70" rx="8"/><text class="d-t" x="640" y="92" text-anchor="middle">Service</text><text class="d-s" x="640" y="114" text-anchor="middle">websites, apps</text>
<text class="d-s" x="20" y="170">Full Wi-Fi bars only prove the dashed part. A break anywhere to the right still shows “connected”.</text>
<text class="d-s" x="20" y="192">Example above: the line from router to provider is down – every device in the home is affected.</text>`;

export default {
  slug: 'wifi-connected-no-internet', kind: 'tool', tree: 'wifi-no-internet',
  short: 'Wi-Fi but no internet',
  kicker: 'Diagnosis · Windows, Mac, iPhone, Android',
  title: 'Wi-Fi Connected but No Internet: Guided Diagnosis',
  description: 'Wi-Fi shows connected but nothing loads? Answer a few checks and the layer map shows whether it is your device, Wi-Fi, router, provider or the service.',
  h1: 'Wi-Fi connected but no internet: guided diagnosis',
  toolTitle: 'Wi-Fi connected, no internet – find the layer',
  cardText: 'Full bars, nothing loads. Find out whether it is the device, the router or your provider before you reset anything.',
  chips: ['Device', 'Wi-Fi', 'Router', 'ISP', 'Service'],
  lede: 'Your device says it is connected – full bars, maybe “No internet, secured” – but pages won’t load. That message is about everything <i>behind</i> the Wi-Fi. Answer the checks below and watch the layer map narrow it down.',
  applies: 'Windows 11, Windows 10, macOS, iPhone/iPad, Android',
  checked: 'Microsoft Support, Apple Support, Android Help',
  versions: ['win11', 'win10', 'macnew', 'macold', 'ios', 'android'],
  sections: [
    { id: 'meaning', h2: 'What “connected, no internet” actually means', html: `
<p>Being connected to Wi-Fi and being connected to the internet are two different things. The Wi-Fi icon only reports the short radio link between your device and the router. Behind the router there are three more stages: the line to your internet provider, the provider’s network including its DNS servers, and finally the website or app you want to use. Any of them can fail while the bars stay full.</p>
<p>Operating systems notice this with a small test of their own. Shortly after joining a network, Windows, macOS, iOS and Android each try to fetch a tiny file from a test address of their maker. If that doesn’t work, you see “No internet, secured” on Windows, “No Internet Connection” under the network name on iPhone, or “Connected, no internet” or “Connected without internet” on Android. The message is a symptom, not a diagnosis: it says something between router and test server is broken, not what.</p>
<p>That’s why the diagnosis above starts with the question that removes the most suspects at once – do other devices on the same Wi-Fi work? – and only then looks at your device in detail.</p>
${figure('wifi-fig', 'The Wi-Fi icon checks only device to router; no internet means a break further along', svg, 'The Wi-Fi bars measure the first hop only. “No internet” says a later link is broken – the checks find out which one.', '0 0 720 205')}` },
    { id: 'order', h2: 'Why the order of the checks matters', html: `
<p>Most fix lists start with the heaviest tools: reset the network settings, reinstall the driver, reset the router. Those steps erase saved passwords and settings, and they are pointless if the problem is an outage at your provider. The diagnosis on this page does the opposite. It begins with checks that change nothing and rule out whole layers:</p>
<ul><li><b>Does everything fail, or only one site?</b> If other sites work, your connection is fine and the problem is the site or app. That clears four layers with one look.</li>
<li><b>Public or guest network?</b> Hotels, cafés and trains hold all traffic until you accept their terms on a sign-in page – the most common reason for “connected, no internet” away from home.</li>
<li><b>Do other devices work on the same Wi-Fi?</b> If yes, router and provider are fine and only your device remains. If no, your device is cleared and the router or provider is next.</li></ul>
<p>Only after those checks does the tree get specific: an address test for the device, the router’s internet light and a restart in the right order, a cable test that bypasses Wi-Fi, and finally the provider’s status page. Each answer is recorded in the fix log so you don’t have to remember what you already tried.</p>` },
    { id: 'layers', h2: 'The five layers at a glance', html: `
${table('Signs, quick checks and typical fixes per layer', ['Layer', 'Typical sign', 'Quickest check', 'Typical fix'], [
  ['Device', 'Only this device fails; others on the Wi-Fi work', 'Second device on the same Wi-Fi', 'Reconnect, forget network, VPN off, driver'],
  ['Wi-Fi', 'Address starts with 169.254, or sign-in page needed', 'Look up the IP address', 'Rejoin, accept terms, router device block'],
  ['Router', 'All devices fail; internet light normal or odd', 'Restart in the right order', 'Restart, firmware, check guest and parental settings'],
  ['ISP', 'All devices fail; internet light red or off', 'Provider status page on mobile data', 'Wait for repair or report the fault'],
  ['Service', 'One site or app fails, others load', 'Open three other sites', 'Site’s own status page; see the one-site diagnosis']
])}
<p>Two details make the table work in practice. First, test on a phone with mobile data switched off – otherwise the phone silently uses the cellular network and “works” even when your Wi-Fi doesn’t. Second, open sites you rarely visit, because the browser can show a cached copy of your usual home page while offline.</p>` },
    { id: 'false-alarm', h2: 'When “No internet” is a false alarm', html: `
<p>Occasionally the message is wrong: pages load fine, but Windows still shows “No internet”. That happens when the operating system’s own test address is blocked – by a strict company firewall, a home ad-blocking DNS filter, or a VPN that routes traffic in an unusual way. Windows uses a Microsoft test site for this check, Apple devices use one of Apple’s, and Android uses one of Google’s. If everything you use works, you can ignore the icon; if some apps refuse to sync because they trust the icon, ask whoever runs the filter to allow the test address.</p>
<p>The opposite also exists: the icon looks fine and the system test succeeds, but a single app fails. That is a service problem, not a Wi-Fi one, and the <a href="/diagnose/one-website-wont-load/">one-website diagnosis</a> is the better starting point.</p>` },
    { id: 'commands', h2: 'Three commands that show where it stops', html: `
<p>On a Windows PC or a Mac you can look a little deeper than the icon. These three commands only read information; none of them changes a setting. Choose your system in the switcher above the layer map and only the matching commands are shown. Open Terminal on a Mac via ${mp({ macnew: 'Finder > Applications > Utilities > Terminal', macold: 'Finder > Applications > Utilities > Terminal' })}, or on Windows right-click Start and choose ${mp({ win11: 'Terminal', win10: 'Windows PowerShell' })}.</p>
${cmd({ os: 'win', code: 'ipconfig', what: 'shows the address your PC got from the router (IPv4 Address) and the router’s own address (Default Gateway).', not: 'change or renew anything.' })}
${cmd({ os: 'mac', code: 'networksetup -getinfo Wi-Fi', what: 'shows the Mac’s Wi-Fi address and the router address.', not: 'change any network setting.' })}
${cmd({ os: 'win', code: 'ping -n 4 1.1.1.1', what: 'sends four test packets to a public server by its number; replies prove that the route through router and provider works.', not: 'test name lookup (DNS). Some networks block ping, so a timeout alone is not proof.' })}
${cmd({ os: 'mac', code: 'ping -c 4 1.1.1.1', what: 'sends four test packets by number and stops.', not: 'test DNS or change anything.' })}
${cmd({ os: 'win', code: 'nslookup example.com', what: 'asks your DNS server for the address of a name.', not: 'contact the website itself.' })}
<p data-show-for="none" class="small">On iPhone, iPad and Android there is no built-in command line; the diagnosis uses the menu paths instead.</p>
<p>Read the results like this: an address starting with 169.254 means the router never answered; replies to the number test but a failing name test mean DNS; no replies to anything with a normal address point to the router or provider.</p>` },
    { id: 'dont', h2: 'What not to do while the internet is down', html: `
<p>Three things make a connection problem worse, and they are surprisingly common:</p>
<ul><li><b>Don’t press the router’s recessed Reset button.</b> A restart means unplugging the power. The pinhole Reset button restores factory settings: your Wi-Fi name and password change back to those on the label, and on some provider connections the router then can’t log in to the internet at all until it is set up again.</li>
<li><b>Don’t install “network repair” or “optimizer” tools.</b> Windows, macOS, iOS and Android already include everything needed for these checks. Third-party repair tools add a new layer of software that can break networking further – and fake ones are a known malware route.</li>
<li><b>Don’t call numbers from search ads or pop-ups.</b> Your provider’s real number is on your contract, bill or its official website. A pop-up claiming your connection is “infected” is a scam, as our <a href="/guides/tech-support-scams/">scam guide</a> explains.</li></ul>` },
    { id: 'provider', h2: 'When it’s time to contact your provider', html: `
<p>If every device fails, the router has been restarted properly, and a cable connection fails too, the problem is almost certainly outside your home – the line, the provider’s equipment or an outage. Before you call, download the fix log from the diagnosis. It shows the support agent that you have already restarted the router, tested more than one device and checked the internet light, which usually lets them skip the first scripted steps and check your line directly.</p>
<p>Note the router’s model and the color of its lights. If the provider supplied the router, ask whether they can see it online from their side; many providers can check and restart their own equipment remotely. If they arrange a technician visit, keep the fix log – it documents when the problem started and what was ruled out.</p>` }
  ],
  faq: [
    ['Why does my phone work but my laptop says no internet?', 'If the phone is on the same Wi-Fi with mobile data switched off, the router and provider are working. The problem is on the laptop: a stuck connection, an outdated saved network, a VPN or proxy, or its Wi-Fi driver. The diagnosis follows that branch once you answer “Yes – other devices work”.'],
    ['What does an IP address starting with 169.254 mean?', 'Devices give themselves a 169.254 address when they ask the router for an address and get no answer. The device is joined to the Wi-Fi radio but not properly to the network. Rejoining the network, checking the router for a device block and restarting the router are the usual fixes.'],
    ['Will restarting the router delete my settings?', 'No. Unplugging the power and plugging it back in keeps all settings. Only the small recessed Reset button, held for several seconds, restores factory settings – avoid it unless your provider tells you to use it.'],
    ['Is “No internet, secured” a security problem?', 'No. “Secured” only means the Wi-Fi is password-protected and encrypted. “No internet” means Windows’ connectivity test failed. It says nothing about viruses or hacking.'],
    ['How long should I wait after restarting the router?', 'Give it two to five minutes. The modem first has to synchronize with the provider’s line, then the router logs in and starts its Wi-Fi. Testing too early makes a working restart look like a failure.']
  ],
  sourcesNote: 'The layer checks follow Microsoft’s Wi-Fi troubleshooting article and the Apple and Android help pages for Wi-Fi; the commands are documented in Microsoft’s command reference.',
  sources: [
    ['Microsoft Support – Fix Wi-Fi connection issues in Windows', 'https://support.microsoft.com/help/10741'],
    ['Microsoft Learn – Windows command reference: ipconfig, ping, nslookup', 'https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/ipconfig'],
    ['Apple Support – Mac User Guide and iPhone User Guide, Wi-Fi sections', 'https://support.apple.com/'],
    ['Android Help – Fix problems with Wi-Fi', 'https://support.google.com/android/'],
    ['Cloudflare – 1.1.1.1 public DNS resolver documentation (developers.cloudflare.com)', null]
  ],
  related: ['/diagnose/laptop-wont-connect-wifi/', '/guides/restart-router-right-way/', '/guides/dns-server-not-responding/', '/guides/android-connected-no-internet/']
};
