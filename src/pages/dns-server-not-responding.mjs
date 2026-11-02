import { mp, cmd, step, table, figure, note } from '../lib.mjs';

const svg = `
<text class="d-s" x="20" y="22">A NAME LOOKUP, STEP BY STEP</text>
<rect class="d-box" x="20" y="44" width="140" height="64" rx="8"/><text class="d-t" x="90" y="72" text-anchor="middle">Your device</text><text class="d-s" x="90" y="94" text-anchor="middle">“example.com?”</text>
<path class="d-line" d="M162 76 H212"/><text class="d-s" x="187" y="66" text-anchor="middle">1</text>
<rect class="d-box" x="214" y="44" width="140" height="64" rx="8"/><text class="d-t" x="284" y="72" text-anchor="middle">Router</text><text class="d-s" x="284" y="94" text-anchor="middle">passes it on</text>
<path class="d-line" d="M356 76 H406"/><text class="d-s" x="381" y="66" text-anchor="middle">2</text>
<rect class="d-box-a" x="408" y="44" width="150" height="64" rx="8"/><text class="d-t" x="483" y="72" text-anchor="middle">DNS server</text><text class="d-s" x="483" y="94" text-anchor="middle">usually your ISP</text>
<path class="d-line" d="M560 76 H600"/>
<rect class="d-box-g" x="602" y="44" width="110" height="64" rx="8"/><text class="d-t" x="657" y="72" text-anchor="middle">Answer</text><text class="d-tg" x="657" y="94" text-anchor="middle">a number</text>
<path class="d-red" d="M471 122 l24 24 M495 122 l-24 24"/>
<text class="d-tr" x="483" y="172" text-anchor="middle">no reply in time</text>
<text class="d-s" x="20" y="200">“DNS server not responding” = step 2 got no answer. The website itself was never contacted.</text>`;

export default {
  slug: 'dns-server-not-responding', kind: 'guide',
  short: 'DNS server not responding',
  kicker: 'Guide · Windows, macOS',
  title: 'DNS Server Not Responding: Plain-English Fix Guide',
  description: 'What “DNS server isn’t responding” really means, how to confirm it with two safe commands, and how to test another DNS server on Windows or Mac with an undo.',
  h1: 'DNS server not responding: a plain-English fix',
  cardText: 'Windows says the DNS server isn’t responding. What that means, how to confirm it, and how to switch DNS for a test with an undo.',
  chips: ['DNS', 'Router', 'ISP'],
  lede: 'Windows Network Diagnostics sometimes ends with “Your computer appears to be correctly configured, but the device or resource (DNS server) is not responding.” Translated: your device asked for a website’s address and nobody answered. Here’s how to find out who should have.',
  applies: 'Windows 11, Windows 10, macOS',
  checked: 'Microsoft Learn, Microsoft Support, Apple Support',
  versions: ['win11', 'win10', 'macnew', 'macold'],
  sections: [
    { id: 'meaning', h2: 'What DNS is, and what “not responding” means', html: `
<p>Computers find websites by number, people by name. The Domain Name System (DNS) is the service that translates one into the other. Every time you open a site, your device asks a DNS server: “what is the address of example.com?” In most homes the router hands out its own address as the DNS server and forwards the questions to servers run by your internet provider.</p>
<p>“Not responding” means the question went out and no answer came back in time. The website was never contacted. That is useful information: it narrows the problem to the path between your device and the DNS server – the router, the provider’s DNS servers, or something on your device that redirects DNS, such as a VPN or a manually entered DNS address that no longer works.</p>
${figure('dns-fig', 'A DNS lookup from device to router to DNS server, failing at the DNS server', svg, 'The lookup stops before any website is involved. That is why clearing the browser’s cache or reinstalling the browser doesn’t help here.', '0 0 720 210')}` },
    { id: 'causes', h2: 'Common causes, from likely to rare', html: `
${table('Why DNS servers stop answering', ['Cause', 'Who is affected', 'Clue', 'Fix'], [
  ['Router’s DNS forwarding hung', 'All devices at home', 'Restart fixes it for days or weeks', 'Restart router; firmware update'],
  ['Provider’s DNS servers overloaded or down', 'All customers of that provider', 'Mobile data works, home doesn’t', 'Wait, or test another DNS server'],
  ['No internet at all', 'All devices', 'Number test (ping) fails too', 'Wi-Fi diagnosis'],
  ['Old manual DNS entry on the device', 'One device', 'Others work; DNS set to a fixed address', 'Back to automatic'],
  ['VPN or security software', 'One device', 'Works with VPN paused', 'Update or reconfigure the app'],
  ['Filter blocks the DNS server you chose', 'Devices with that setting', 'Fails only on some networks', 'Use automatic DNS on that network']
])}
<p>The first question is the same as in every diagnosis on this site: do other devices on the same network have the problem? If yes, look at the router and provider. If no, look at this device.</p>` },
    { id: 'quick', h2: 'Quick checks that change nothing', html: `
${step(1, { title: 'Compare with another device and with mobile data', time: 'about 2 min', body: `<p>Open a site you rarely visit on a phone connected to the same Wi-Fi, then on the same phone with Wi-Fi switched off. If both fail on Wi-Fi but mobile data works, your network’s DNS (router or provider) is the suspect.</p>` })}
${step(2, { title: 'Restart the router the right way', time: 'about 5 min', body: `<p>Unplug it, wait 30 seconds, plug it in and give it two to five minutes. A router’s DNS forwarder can hang while everything else looks normal. See <a href="/guides/restart-router-right-way/">how to restart a router</a> for the order with separate modems.</p>` })}` },
    { id: 'confirm', h2: 'Confirm it with two commands', html: `
<p>These commands only read information. The first checks whether the internet works by number, without DNS. The second asks DNS directly.</p>
${cmd({ os: 'win', code: 'ping -n 4 1.1.1.1', what: 'sends four test packets to a public server by its number. Replies mean the connection works and only names fail.', not: 'use DNS at all, or change anything.' })}
${cmd({ os: 'mac', code: 'ping -c 4 1.1.1.1', what: 'sends four test packets by number and stops.', not: 'use DNS or change anything.' })}
${cmd({ os: 'win', code: 'nslookup example.com', what: 'asks your current DNS server for the address. “DNS request timed out” confirms the server isn’t answering; the first lines show which server was asked.', not: 'change your DNS server.' })}
${cmd({ os: 'mac', code: 'nslookup example.com', what: 'asks your current DNS server and shows which server answered (or didn’t).', not: 'change anything on the Mac.' })}
${cmd({ os: 'win', code: 'ipconfig /flushdns', what: 'clears Windows’ list of remembered lookups – useful after the DNS problem is fixed, so old failures aren’t reused.', not: 'change DNS servers or network settings.' })}
<p>If the number test fails too, the problem isn’t DNS but the whole connection – continue with the <a href="/diagnose/wifi-connected-no-internet/">Wi-Fi diagnosis</a>.</p>` },
    { id: 'change', h2: 'Testing another DNS server – with an undo', html: `
<p>If your network’s DNS is the suspect, you can point this one device at a public DNS service for a test. Widely used free resolvers include Cloudflare (1.1.1.1 and 1.0.0.1), Google Public DNS (8.8.8.8 and 8.8.4.4) and Quad9 (9.9.9.9). Each has its own privacy policy; read it if you plan to keep the setting.</p>
${step(3, { risk: 'setting', title: 'Enter a public DNS server on this device', time: 'about 5 min', body: `<p>Open ${mp({ win11: 'Settings > Network & internet > Wi-Fi > (your network) properties > DNS server assignment > Edit', win10: 'Settings > Network & Internet > Wi-Fi > (your network) > Properties > IP settings > Edit', macnew: 'System Settings > Wi-Fi > Details… next to your network > DNS', macold: 'System Preferences > Network > Wi-Fi > Advanced > DNS' })}. Write down what is there now. On Windows, switch to Manual, turn on IPv4 and enter a preferred and alternate server. On a Mac, add a server with the plus button.</p>`, undo: 'Set DNS back to Automatic (DHCP) on Windows, or remove the added servers on the Mac with the minus button.' })}
${note('warn', 'Don’t change DNS on networks that aren’t yours.', '<p>Company and school networks often require their own DNS for internal services and security filtering. A manual DNS setting can break those – and may break the same laptop on the next network you join.</p>')}
<p>If the site loads with the public server, you have confirmed that your provider’s DNS or the router’s forwarding is the problem. You can keep the setting on this device, change DNS in the router for all devices (if your router allows it), or report the fault to your provider.</p>` },
    { id: 'avoid', h2: 'What doesn’t help', html: `
<p>Because DNS failures happen before any website is contacted, several popular tips miss the target: reinstalling the browser, clearing all browser data, or “resetting TCP/IP” as a first step. Commands like <code>netsh winsock reset</code> and <code>netsh int ip reset</code> exist and need administrator rights; they are only worth trying, as a last resort, when one Windows PC fails while everything else works and simpler steps haven’t helped – and afterwards Windows needs a restart. Download tools that promise to “fix DNS” are unnecessary and should be avoided.</p>
<p>Finally, remember the device-side causes: if this is the only device with the problem, check for a VPN, a security suite with web protection, or a manual DNS entry left over from an old network.</p>` }
  ],
  faq: [
    ['Is “DNS server not responding” dangerous?', 'No. It means name lookups are failing. Nothing is infected and no data is exposed. It is a connection problem, usually at the router or the provider.'],
    ['Should I switch to 1.1.1.1 or 8.8.8.8 permanently?', 'You can, on your own devices or router, if the provider’s DNS keeps failing. Read the service’s privacy policy first, and leave DNS on automatic for company or school devices.'],
    ['Does flushing DNS fix the error?', 'Flushing clears remembered answers on your device. It helps when an old wrong answer is stuck, but not when the DNS server itself doesn’t reply.'],
    ['Why does it work on mobile data?', 'Mobile data uses the mobile provider’s DNS servers. If it works there and fails at home, your home router or your internet provider’s DNS is the cause.'],
    ['Do I need administrator rights to change DNS?', 'On Windows, changing a network’s DNS setting can ask for administrator approval on managed or standard accounts. On a Mac, network settings may ask for an administrator password.']
  ],
  sources: [
    ['Microsoft Learn – nslookup command reference', 'https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/nslookup'],
    ['Microsoft Learn – ipconfig command reference', 'https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/ipconfig'],
    ['Microsoft Support – Change TCP/IP settings in Windows', 'https://support.microsoft.com/'],
    ['Apple Support – Mac User Guide: change DNS settings', 'https://support.apple.com/'],
    ['IETF RFC 1035 – Domain names: implementation and specification', 'https://datatracker.ietf.org/doc/html/rfc1035'],
    ['Cloudflare 1.1.1.1, Google Public DNS and Quad9 – each provider’s official documentation', null]
  ],
  related: ['/diagnose/site-cant-be-reached/', '/diagnose/wifi-connected-no-internet/', '/guides/android-connected-no-internet/', '/guides/restart-router-right-way/']
};
