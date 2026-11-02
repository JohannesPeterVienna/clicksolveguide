import { mp, cmd, table, figure } from '../lib.mjs';

const svg = `
<text class="d-s" x="20" y="22">WHERE EACH CHROME CODE STOPS</text>
<rect class="d-box" x="20" y="44" width="120" height="60" rx="8"/><text class="d-t" x="80" y="80" text-anchor="middle">Chrome</text>
<path class="d-line" d="M142 74 H196"/>
<rect class="d-box" x="198" y="44" width="140" height="60" rx="8"/><text class="d-t" x="268" y="72" text-anchor="middle">Network</text><text class="d-s" x="268" y="92" text-anchor="middle">Wi-Fi + router</text>
<path class="d-line" d="M340 74 H394"/>
<rect class="d-box" x="396" y="44" width="130" height="60" rx="8"/><text class="d-t" x="461" y="72" text-anchor="middle">DNS</text><text class="d-s" x="461" y="92" text-anchor="middle">name → number</text>
<path class="d-line" d="M528 74 H582"/>
<rect class="d-box" x="584" y="44" width="120" height="60" rx="8"/><text class="d-t" x="644" y="72" text-anchor="middle">Server</text><text class="d-s" x="644" y="92" text-anchor="middle">the website</text>
<path class="d-red" d="M170 118 V140"/><text class="d-tr" x="170" y="160" text-anchor="middle">INTERNET_DISCONNECTED</text>
<path class="d-amber" d="M367 118 V178"/><text class="d-ta" x="367" y="196" text-anchor="middle">NAME_NOT_RESOLVED / NXDOMAIN</text>
<path class="d-amber" d="M555 118 V140"/><text class="d-ta" x="555" y="160" text-anchor="middle">TIMED_OUT</text>
<path class="d-red" d="M644 118 V214"/><text class="d-tr" x="644" y="232" text-anchor="end">REFUSED · RESET · CLOSED</text>`;

export default {
  slug: 'site-cant-be-reached', kind: 'tool', tree: 'site-cant-be-reached',
  short: 'This site can’t be reached',
  kicker: 'Diagnosis · Chrome error codes',
  title: '“This Site Can’t Be Reached” in Chrome: What to Check',
  description: 'Decode Chrome’s “This site can’t be reached” codes like NXDOMAIN, TIMED_OUT and REFUSED, then follow guided checks to the layer that is actually failing.',
  h1: '“This site can’t be reached” in Chrome: what it means and what to check',
  toolTitle: 'Chrome can’t reach the site – follow the code',
  cardText: 'DNS_PROBE_FINISHED_NXDOMAIN, TIMED_OUT, REFUSED: each code points to a different layer. Start from the code.',
  chips: ['Chrome', 'DNS', 'Website'],
  lede: 'Chrome shows the same grey error page for very different problems. The small code under the headline tells them apart. Pick the code in the diagnosis and it will lead you to the layer that failed – from a typo in the address to a block on your network.',
  applies: 'Google Chrome on Windows 11/10, macOS, iPhone/iPad, Android',
  checked: 'Google Chrome Help, Microsoft Learn',
  versions: ['win11', 'win10', 'macnew', 'macold', 'ios', 'android'],
  sections: [
    { id: 'meaning', h2: 'What the message really says', html: `
<p>“This site can’t be reached” means Chrome tried to open a connection to the address and gave up before the website sent anything back. It doesn’t say why. The reason is in the code printed underneath in capital letters – on a phone you may have to tap “Details” first. These codes come straight from Chrome’s networking code, and each one marks the point where the connection stopped.</p>
<p>Opening a website takes four steps: Chrome needs a working network, then a DNS server translates the name (example.com) into a number, then Chrome connects to that number, and finally the server answers. A code tells you which step failed – and therefore which layers you can stop worrying about. A timeout, for instance, means the name lookup already worked; there is no point in changing DNS servers for it.</p>
${figure('cant-fig', 'Diagram of the four steps of a page load and where each Chrome error code stops', svg, 'Each code marks a different stopping point. Codes on the left are about your side of the connection; codes on the right are often about the website.', '0 0 720 245')}` },
    { id: 'codes', h2: 'The common codes, decoded', html: `
${table('Common Chrome connection error codes', ['Code', 'What it means', 'Most likely layer', 'First check'], [
  ['DNS_PROBE_FINISHED_NXDOMAIN', 'DNS says this name doesn’t exist', 'Address typo, expired domain, or your DNS', 'Spelling; then mobile data'],
  ['ERR_NAME_NOT_RESOLVED', 'The name couldn’t be turned into an address', 'DNS or address', 'Spelling; then other sites'],
  ['ERR_INTERNET_DISCONNECTED', 'The device has no network at all', 'Device or Wi-Fi', 'Wi-Fi diagnosis'],
  ['ERR_CONNECTION_TIMED_OUT', 'The server didn’t answer in time', 'Website, or a block on the way', 'Mobile data comparison'],
  ['ERR_CONNECTION_REFUSED', 'Something answered and refused', 'Website (or a proxy setting)', 'Other browser, mobile data'],
  ['ERR_CONNECTION_RESET / _CLOSED', 'The connection was cut after it started', 'VPN, security filter, firewall – or the site', 'Pause VPN or web filter']
])}
<p>The table is a starting point, not a verdict. A timeout can come from a site that is down, but also from a firewall on your network that silently drops connections to it. That is why the diagnosis compares your connection with mobile data before it blames either side.</p>` },
    { id: 'dns', h2: 'Why DNS errors are the most common', html: `
<p>DNS – the Domain Name System – is the internet’s address book. Your router usually passes on the DNS servers of your internet provider, and every device in the home asks those servers whenever it opens a name. If they are slow, overloaded or filtered, Chrome reports a name error even though the website and your connection are fine.</p>
<p>NXDOMAIN is a specific answer: the DNS server replied “there is no such name”. That is normal for typos and for domains that have expired. It becomes suspicious when the same address works on mobile data, because then your network’s DNS server is giving a different answer than the rest of the internet – sometimes because of a fault, sometimes because a parental control or a company filter blocks the name on purpose.</p>
<p>Chrome adds one more layer of its own: the “Use secure DNS” setting. When it is on with a custom provider, Chrome sends lookups to that provider directly instead of using your system’s DNS. If that provider is blocked on your network, every lookup in Chrome fails while Edge or Safari on the same device work. The diagnosis checks this by comparing browsers.</p>` },
    { id: 'typos', h2: 'Typos and lookalike addresses', html: `
<p>A surprising share of NXDOMAIN errors are simple misspellings – a missing letter, a swapped pair, “.co” instead of “.com”. Retyping fixes them. The bigger risk lies in the other direction: an address that is <i>almost</i> right and does load. Scammers register lookalike domains for banks, shops and software vendors precisely because people mistype them. When you reach a page through a misspelled address, check it before entering anything.</p>
<p>For sites you use regularly, a bookmark is safer than typing or searching. Search ads can lead to lookalike pages too, especially for “support” and “download” searches.</p>` },
    { id: 'chrome', h2: 'Settings inside Chrome worth checking', html: `
<p>When the comparison shows that only Chrome fails, three settings are the usual suspects. Extensions come first: VPN, proxy, ad-blocking and security extensions all sit between Chrome and the network. Open ${mp({ win11: 'Chrome menu (⋮) > Extensions > Manage Extensions', win10: 'Chrome menu (⋮) > Extensions > Manage Extensions', macnew: 'Chrome menu (⋮) > Extensions > Manage Extensions', macold: 'Chrome menu (⋮) > Extensions > Manage Extensions', android: 'Chrome on Android has no extensions', ios: 'Chrome on iPhone has no extensions' })} and switch them off one at a time.</p>
<p>Second, secure DNS: ${mp({ win11: 'Chrome menu (⋮) > Settings > Privacy and security > Security > Use secure DNS', win10: 'Chrome menu (⋮) > Settings > Privacy and security > Security > Use secure DNS', macnew: 'Chrome menu (⋮) > Settings > Privacy and security > Security > Use secure DNS', macold: 'Chrome menu (⋮) > Settings > Privacy and security > Security > Use secure DNS', android: 'Chrome menu (⋮) > Settings > Privacy and security > Use secure DNS' })}. Note the current setting before you change it. Third, stored data for the site: clearing cached files is harmless, but clearing cookies signs you out, so limit it to the one site.</p>
<p>On a company or school computer some of these settings may be managed by IT and locked. Chrome then shows a note that your browser is managed; in that case the IT department is the right contact.</p>` },
    { id: 'commands', h2: 'Two commands that confirm a DNS problem', html: `
<p>On a computer you can ask DNS directly, without Chrome. Replace example.com with the address that fails. These commands only read information.</p>
${cmd({ os: 'win', code: 'nslookup example.com', what: 'asks your DNS server for the address of the name. “Non-existent domain” is the NXDOMAIN answer; a timeout means the DNS server didn’t reply.', not: 'contact the website or change any setting.' })}
${cmd({ os: 'mac', code: 'nslookup example.com', what: 'asks your DNS server for the name’s address and prints the reply.', not: 'change anything on the Mac.' })}
${cmd({ os: 'win', code: 'ipconfig /flushdns', what: 'empties Windows’ cache of recent lookups, so the next visit asks DNS again.', not: 'change DNS servers or delete browser data.' })}
${cmd({ os: 'mac', code: 'sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder', what: 'clears the Mac’s DNS cache; Terminal asks for your login password.', not: 'change settings or delete files.', admin: true })}
<p data-show-for="none" class="small">Phones and tablets have no command line; the diagnosis uses the mobile-data comparison instead.</p>` },
    { id: 'notyou', h2: 'When the problem isn’t on your side', html: `
<p>If the address fails on your Wi-Fi and on mobile data, and other people see the same, the website is down or unreachable – only its operator can fix that. Large services publish status pages; smaller ones may post on their official social accounts. ERR_CONNECTION_REFUSED in particular means a server actively said no, which no setting on your device can change.</p>
<p>Be wary of “is it down?” pages that offer a phone number or a download to “fix” the connection. Nothing needs to be installed to wait out a website outage, and no legitimate site asks you to call a number because another site is unreachable.</p>` }
  ],
  faq: [
    ['What does DNS_PROBE_FINISHED_NXDOMAIN mean?', 'The DNS server answered that the name does not exist. Usually the address is misspelled or the domain has expired. If the same address works on mobile data, your network’s DNS server or a filter on your network is the cause.'],
    ['Why does the site work in Edge but not in Chrome?', 'Then the network and the website are fine and something inside Chrome differs: an extension, the “Use secure DNS” setting, a proxy extension or stored site data.'],
    ['Is ERR_CONNECTION_REFUSED my fault?', 'Rarely. It means a server answered and refused the connection – typically the website is down or not accepting connections. A wrong proxy setting on your device can cause it too, which the browser comparison reveals.'],
    ['Should I change my DNS server to fix it?', 'Only as a test after the comparison shows a DNS problem on your network, and with a note of the old setting so you can undo it. For timeouts or refused connections, changing DNS doesn’t help.'],
  ],
  sourcesNote: 'The error codes are the ones Chrome itself shows; their meaning and the DNS background follow Google’s Chrome Help and the DNS specification.',
  sources: [
    ['Google Chrome Help – fixing connection errors and network settings', 'https://support.google.com/chrome/'],
    ['Microsoft Learn – nslookup and ipconfig command reference', 'https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/nslookup'],
    ['IETF RFC 1035 – Domain names: implementation and specification', 'https://datatracker.ietf.org/doc/html/rfc1035'],
    ['Apple Support – Terminal and network settings on Mac', 'https://support.apple.com/']
  ],
  related: ['/diagnose/one-website-wont-load/', '/guides/dns-server-not-responding/', '/diagnose/wifi-connected-no-internet/', '/guides/tech-support-scams/']
};
