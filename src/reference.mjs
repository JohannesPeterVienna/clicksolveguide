// Reference section of clicksolveguide.com: lookup box, tables built from the primary sources in
// src/data/ (see src/data/extract.py) and this site's own reading of what each entry means for the
// layer diagnosis. Facts (names, numbers, dates, descriptions) come from the data files unchanged;
// the "what it tells you" texts below are ours and are labeled as such on the pages.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { esc, figure } from './lib.mjs';

const DATA = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data');
const load = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));
const chrome = load('chrome-net-errors.json');
const probe = load('chrome-dns-probe.json');
const http = load('http-status.json');
const ipSpecial = load('ip-special.json');
const portsRaw = load('ports.json');
const wu = load('wu-errors.json');
const win = load('windows-versions.json');
const mac = load('macos-versions.json');
const keys = load('shortcuts.json');
const SRC = load('sources.json');

export const RETRIEVED_ISO = SRC._retrieved; // 2026-11-18
export const RETRIEVED = 'November 18, 2026';
export const REF_ISO = '2026-11-18';

const D_SITE = { href: '/diagnose/site-cant-be-reached/', label: 'Diagnosis: “This site can’t be reached”' };
const D_ONE = { href: '/diagnose/one-website-wont-load/', label: 'Diagnosis: one website won’t load' };
const D_WIFI = { href: '/diagnose/wifi-connected-no-internet/', label: 'Diagnosis: Wi-Fi connected but no internet' };
const D_LAPTOP = { href: '/diagnose/laptop-wont-connect-wifi/', label: 'Diagnosis: laptop won’t connect to Wi-Fi' };
const G_DNS = { href: '/guides/dns-server-not-responding/', label: 'Guide: DNS server not responding' };
const G_SCAM = { href: '/guides/tech-support-scams/', label: 'Guide: tech support scams' };

// ---------- our reading of the entries (not part of the sources) ----------
const CERT = { meaning: 'A certificate error: the browser could not confirm that the site is the one it claims to be. Do not click through and do not type passwords or card numbers. Check the date and time on your device, then try the site later or from another network; if the warning stays, only the website’s owner can fix it.', next: D_ONE };
const ADVICE = {
  chrome: {
    ERR_NAME_NOT_RESOLVED: { meaning: 'The name lookup (DNS) failed, so no connection to the website was even attempted. Either the address is misspelled or no longer exists, or the DNS server your network uses gave no usable answer. If other sites open, check the spelling first, then test the DNS server.', next: D_SITE },
    ERR_INTERNET_DISCONNECTED: { meaning: 'Chrome sees no network connection on this device. The website, your provider and the internet at large were never asked – the cause sits between this device and the router.', next: D_WIFI },
    ERR_CONNECTION_TIMED_OUT: { meaning: 'The name was found, a connection was tried and nobody answered in time. DNS is not the problem. Either the server is down or overloaded, or something on the way silently drops the traffic – a firewall, a VPN or a filter. The comparison with mobile data separates the two.', next: D_SITE },
    ERR_TIMED_OUT: { meaning: 'An operation ran out of time without an answer. For a web page that means the same as a connection timeout: the server or the path to it did not respond. Compare with mobile data to see which side it follows.', next: D_SITE },
    ERR_CONNECTION_REFUSED: { meaning: 'Something at that address answered and actively refused the connection. That is different from a timeout: the path works. It fits a server whose web service is not running, an address with a wrong port, or a firewall that rejects instead of ignoring.', next: D_SITE },
    ERR_CONNECTION_RESET: { meaning: 'A connection existed and was cut off. The cut can come from the server or from anything in between that inspects traffic – security software, a company or hotel filter, a VPN. If the site opens on mobile data, look at your own network and device.', next: D_SITE },
    ERR_CONNECTION_CLOSED: { meaning: 'The other side closed the connection before sending a page. As with a reset, the server or a device in between ended it; compare with another network and another browser.', next: D_SITE },
    ERR_CONNECTION_ABORTED: { meaning: 'The connection was given up because the other side did not confirm data in time. It points to an unstable path – weak Wi-Fi, a struggling router or a server in trouble – rather than to a wrong setting.', next: D_SITE },
    ERR_CONNECTION_FAILED: { meaning: 'The connection attempt failed without a more specific reason. On its own it does not name a layer; the comparison checks (other sites, mobile data, another browser) have to.', next: D_SITE },
    ERR_ADDRESS_UNREACHABLE: { meaning: 'The device knows the server’s address but has no route to it. That is a network-level fault: the router, the provider or a VPN – not the browser and usually not the website.', next: D_WIFI },
    ERR_NETWORK_CHANGED: { meaning: 'The device’s network changed while the page was loading – a switch between Wi-Fi, cable and mobile data, a VPN connecting, or a new address from the router. Reload once. If it keeps coming back, the Wi-Fi link or the VPN is unstable.', next: D_WIFI },
    ERR_BLOCKED_BY_CLIENT: { meaning: 'Something inside the browser blocked the request – in practice an extension such as a content blocker. The network and the website are not involved. A private window, where extensions are normally off, shows it at once.', next: D_ONE },
    ERR_BLOCKED_BY_ADMINISTRATOR: { meaning: 'A policy set by whoever manages this browser or device blocks the address. On a work or school device that is IT’s decision; on a private device, check whether the browser says it is “managed” and by whom.', next: D_ONE },
    ERR_NETWORK_ACCESS_DENIED: { meaning: 'The browser was not allowed to use the network. Chromium’s own note says this is most likely a firewall – look at the firewall or security software on this device, not at the router.', next: D_ONE },
    ERR_PROXY_CONNECTION_FAILED: { meaning: 'The browser is set to use a proxy server and could not reach it. The website never saw the request. Check the proxy setting of the system or of a VPN or security app that installed one.', next: D_WIFI },
    ERR_TUNNEL_CONNECTION_FAILED: { meaning: 'A connection through a proxy could not be set up. As with other proxy errors, the place to look is the proxy or VPN configured on this device or network.', next: D_WIFI },
    ERR_TOO_MANY_REDIRECTS: { meaning: 'The site sent the browser from address to address in a circle. Either the website is misconfigured or a cookie it stored in your browser no longer fits. A private window tells the two apart.', next: D_ONE },
    ERR_EMPTY_RESPONSE: { meaning: 'The server accepted the connection and closed it without sending anything. That is the server’s or an in-between filter’s doing, not a setting in your browser.', next: D_ONE },
    ERR_SSL_PROTOCOL_ERROR: { meaning: 'Browser and server could not set up the encrypted connection. Do not look for a way round it. Test another device and another network to see whether it follows the website or your side – security software that inspects encrypted traffic can cause it.', next: D_ONE },
    ERR_SSL_VERSION_OR_CIPHER_MISMATCH: { meaning: 'Browser and server have no encryption method in common. That is decided by the server’s configuration or by software that inspects encrypted traffic; nothing on a normal home device needs changing.', next: D_ONE },
    ERR_CERT_DATE_INVALID: { meaning: 'By your device’s clock the site’s certificate is expired or not yet valid. Chromium lists three possible reasons: an attacker with an old certificate, a misconfigured server – or a wrong clock on your device. Check date, time and time zone first; do not click through.', next: D_ONE },
    ERR_HTTP_RESPONSE_CODE_FAILURE: { meaning: 'The server answered, but with an HTTP error status. The connection and DNS are fine; the status code (404, 500, 503 …) says more.', next: { href: '/reference/http-status-codes/', label: 'HTTP status codes' } },
    ERR_HTTP2_PROTOCOL_ERROR: { meaning: 'An error inside the HTTP/2 conversation with the server. Usually the website’s side or a device in between; test another network and another browser before changing anything.', next: D_ONE },
    ERR_QUIC_PROTOCOL_ERROR: { meaning: 'An error in QUIC, the transport Chrome uses for HTTP/3. Usually the website’s side or a network that handles QUIC badly; test another network and another browser.', next: D_ONE },
    ERR_FILE_NOT_FOUND: { meaning: 'A file on this device was not found – as with an address that starts with file://. No network layer is involved.' },
    ERR_INVALID_URL: { meaning: 'The address itself is not a valid URL. Check for a typing mistake, a stray space or a missing part.' },
    ERR_UNSAFE_PORT: { meaning: 'The address contains a port number that Chrome refuses to connect to for web pages. That is the browser’s own safety rule, not a network fault.', next: { href: '/reference/network-ports/', label: 'Port reference' } },
    ERR_DNS_TIMED_OUT: { meaning: 'The DNS server did not answer in time. The website was never contacted; the fault is between this device and the DNS server – router, provider or a DNS setting on the device.', next: G_DNS },
    ERR_DNS_SERVER_FAILURE: { meaning: 'The DNS server answered with a failure. The website was never contacted; test another DNS server to see whether your network’s DNS is the problem.', next: G_DNS }
  },
  chromeRange: {
    System: { meaning: 'A general or local error – files, memory, permissions or a cancelled request. On its own it does not point to the router, the provider or the website.' },
    Connection: { meaning: 'The connection to the server or to a proxy failed at network or encryption level. Compare with another website and with mobile data to see whether it follows the website or your network.', next: D_SITE },
    Certificate: CERT,
    HTTP: { meaning: 'A problem in the HTTP exchange with the server – the connection itself worked. Most of these can only be fixed by the website; a private window shows whether your browser data plays a part.', next: D_ONE },
    Cache: { meaning: 'Concerns Chrome’s local cache of earlier downloads, not the network.' },
    'DNS resolver': { meaning: 'The name lookup failed. The website was never contacted; the fault is on the way to the DNS server or at the DNS server.', next: G_DNS },
    'Certificate manager': { meaning: 'Concerns importing or managing certificates in the browser, not loading a normal web page.' },
    'FTP (obsolete)': { meaning: 'An obsolete FTP range.' },
    Blob: { meaning: 'Concerns data the page handles inside the browser, not the network.' },
    'Unnamed range': { meaning: 'Chromium’s list gives this range no name.' }
  },
  probe: {
    DNS_PROBE_FINISHED_NXDOMAIN: { meaning: 'Chrome ran its own DNS test: the DNS servers work, so the name does not exist. Check the spelling of the address. If it is right, the site’s domain may have lapsed – or a filter on your network answers “no such name” on purpose.', next: D_SITE },
    DNS_PROBE_FINISHED_NO_INTERNET: { meaning: 'Chrome’s DNS test found no internet connection at all. Start with the connection, not with the website.', next: D_WIFI },
    DNS_PROBE_FINISHED_BAD_CONFIG: { meaning: 'Chrome’s DNS test says the DNS settings are wrong or the DNS servers are down. Look for a manual DNS entry or a VPN on this device, then at the router.', next: G_DNS },
    DNS_PROBE_FINISHED_BAD_SECURE_CONFIG: { meaning: 'Chrome’s DNS test failed with the secure DNS (DNS over HTTPS) provider set in Chrome. The network’s normal DNS may be fine – check Chrome’s secure DNS setting.', next: G_DNS },
    DNS_PROBE_FINISHED_INCONCLUSIVE: { meaning: 'Chrome’s DNS test reached no conclusion. Use the comparison checks instead.', next: D_SITE },
    DNS_PROBE_STARTED: { meaning: 'Chrome is still testing DNS; the code on the page changes when the test has finished. Wait a few seconds.', next: D_SITE },
    DNS_PROBE_POSSIBLE: { meaning: 'Chrome has not run its DNS test yet; the code on the page changes when it has.', next: D_SITE },
    DNS_PROBE_NOT_RUN: { meaning: 'Chrome did not run its DNS test, so the code says nothing about the cause.', next: D_SITE }
  },
  http: {
    301: { meaning: 'The address has moved permanently; browsers follow it automatically. You only see it in tools, not as an error.' },
    302: { meaning: 'A temporary redirect; browsers follow it automatically. Seen as an “error” only when redirects loop.' },
    304: { meaning: 'Not an error: the server says your stored copy is still current.' },
    400: { meaning: 'The server rejected the request as malformed. From a browser, data stored for that site (cookies) can be the cause: test a private window, then clear that one site’s data.', next: D_ONE },
    401: { meaning: 'The server wants a valid sign-in for this address. Sign in again; if the page belongs to a company or school, the account needs access.' },
    403: { meaning: 'The server understood the request and refuses it. Your connection works. The site decides this – by account, by country or network, or by the address you come from, for example when you use a VPN.', next: D_ONE },
    404: { meaning: 'The server is up but has nothing at this exact address. Check the spelling after the domain name; an old link or bookmark is the usual reason. Nothing on your device needs fixing.' },
    408: { meaning: 'The server gave up waiting for the browser’s request. Reload once; if it repeats on a slow or unstable connection, look at the Wi-Fi link.', next: D_WIFI },
    410: { meaning: 'The page was removed on purpose and is not coming back at this address.' },
    429: { meaning: 'Too many requests from your address or account in a short time. Wait – every reload adds another request. On a shared network or VPN, the limit is shared with others.' },
    451: { meaning: 'The site withholds the page for legal reasons, typically depending on the country you connect from. Nothing is broken on your side.' },
    500: { meaning: 'The website’s server ran into an error of its own. Only the site can fix it; try again later or check its status page.', next: D_ONE },
    502: { meaning: 'A server in front of the website (gateway or proxy) got an invalid answer from the server behind it. A problem inside the website’s infrastructure – wait and retry.', next: D_ONE },
    503: { meaning: 'The server is temporarily overloaded or down for maintenance. Wait and retry; a status page often confirms it.', next: D_ONE },
    504: { meaning: 'A gateway in front of the website waited too long for the server behind it. As with 502, the website’s side.', next: D_ONE }
  },
  httpClass: {
    1: { meaning: 'Informational: an interim answer while the request continues. Not an error.' },
    2: { meaning: 'Successful: the server did what was asked. If the page still looks wrong, the cause is in the page or the browser, not in the transfer.' },
    3: { meaning: 'Redirection: the browser is sent to another address and normally follows without showing anything.' },
    4: { meaning: 'Client error class: the server answered and says the request cannot be fulfilled as sent. Your connection, DNS and the server all work; check the address, your sign-in and the site’s data in your browser.', next: D_ONE },
    5: { meaning: 'Server error class: the server answered and says it failed. Your device and network work; only the website can fix it.', next: D_ONE }
  },
  ip: {
    '169.254.0.0/16': { meaning: 'A link-local address: the device gave it to itself because no DHCP server – normally your router – answered. With such an address the device can reach neither the router nor the internet. The fault is in the link between this device and the router, not at the provider or the website.', next: D_WIFI },
    'Private-Use': { meaning: 'A private address, as a home or office router hands out. It shows that the device is joined to the network and received an address, so the device–router link works at this level. Private addresses are not visible from the internet; many devices worldwide use the same ones.', next: D_WIFI },
    '100.64.0.0/10': { meaning: 'Shared address space, reserved for the link between a customer’s router and the provider when the provider uses carrier-grade NAT. If your router shows such an address as its internet (WAN) address, you share a public address with other customers: browsing works, but port forwarding from the internet to your home cannot.' },
    '127.0.0.0/8': { meaning: 'A loopback address: it always means “this device itself”. A page or tool using it talks to software on the same computer, never to the network.' },
    '0.0.0.0/8': { meaning: 'An address a device uses for itself before it has a real one. Shown as the device’s address, it means no address has been assigned yet.', next: D_WIFI },
    '0.0.0.0/32': { meaning: 'The placeholder for “this host” before an address is assigned. Shown as the device’s address, it means it has none yet.', next: D_WIFI },
    '255.255.255.255/32': { meaning: 'The limited broadcast address: “everyone on this local network”. Never the address of a single device.' },
    '224.0.0.0/4': { meaning: 'A multicast address: used to reach a group of devices at once, for example when devices look for printers on the local network. Never the address of a single device.' },
    'ff00::/8': { meaning: 'An IPv6 multicast address: used to reach a group of devices at once. Never the address of a single device.' },
    'fe80::/10': { meaning: 'An IPv6 link-local address. Every IPv6 device has one and it only works inside the local network, so it is normal to see it next to other addresses. If it is the only IPv6 address, the network offers no IPv6 internet access – IPv4 may still work.' },
    'fc00::/7': { meaning: 'An IPv6 unique local address: the IPv6 counterpart of a private address. It works inside your network and is not reachable from the internet.' },
    '::1/128': { meaning: 'The IPv6 loopback address: “this device itself”.' },
    '::/128': { meaning: 'The unspecified IPv6 address: a device without an address yet.' },
    Documentation: { meaning: 'A range reserved for examples in manuals and documentation. A real device should never have it – if you copied it from instructions, replace it with your own value.' },
    publicV4: { meaning: 'A public IPv4 address. Behind a home router a device normally shows a private address instead; a public one means the device is connected directly to the modem or to the provider’s network, without a router in between. As the router’s internet (WAN) address it is the normal case.' },
    publicV6: { meaning: 'A public (global) IPv6 address. Unlike IPv4, it is normal for every device at home to have one: IPv6 does not need private addresses and address translation.' }
  },
  wu: {
    listed: 'Microsoft’s list names the error and the Windows Update component that reported it. It is written for IT administrators and gives no fix; the name still narrows it down – “PT” codes come from talking to the update server, “DM” from downloading, “UH” from installing, “DS” from the local update database.',
    common: 'Microsoft’s troubleshooting article covers this code with a cause and a mitigation written for administrators. Read the mitigation there; for a home PC, start with the safe steps in our guide before using any command.',
    missing: 'This code is not in Microsoft’s two lists as retrieved (Windows Update error codes by component; Common Windows Update errors). Many 0x8007… codes are general Windows errors passed through by Windows Update. Search the exact code on Microsoft’s own support site only.',
    commonUrl: SRC.wucommon.url
  }
};
for (const e of ipSpecial.v4.concat(ipSpecial.v6)) if (/^Documentation/.test(e.name)) ADVICE.ip[e.block] = ADVICE.ip.Documentation;

// where a port shows up in a diagnosis (ours); name, transport and description are IANA's
const WHERE = {
  21: 'File transfer without encryption. Rare at home today.',
  22: 'Encrypted remote command line. Should not be opened to the internet in a router’s port forwarding without need.',
  23: 'Unencrypted remote command line. A router or printer that offers it to the internet is a risk.',
  25: 'Mail transfer between mail servers. Mail apps send through 587 or 465 instead.',
  53: 'DNS lookups. If a filter or firewall blocks it, websites fail by name while a ping to a numeric address still gets replies.',
  67: 'How a device gets its address from the router (the router listens on 67, the device on 68). An address starting with 169.254 means this exchange failed.',
  68: 'The device’s side of the address assignment (see port 67).',
  80: 'Web pages without encryption (HTTP).',
  110: 'Fetching mail without encryption (POP3); 995 is the encrypted form.',
  123: 'Clock synchronisation. A device with a wrong clock shows certificate warnings on correct websites.',
  137: 'Name lookup of older Windows file and printer sharing in the local network.',
  138: 'Part of older Windows file and printer sharing in the local network.',
  139: 'Older Windows file and printer sharing in the local network.',
  143: 'Reading mail (IMAP); 993 is the encrypted form mail apps normally use.',
  161: 'Network management. Many network printers report their status over it.',
  443: 'Encrypted web pages (HTTPS) – almost every website. If 443 works and a site still fails, the fault is not a blocked port.',
  445: 'Windows file and printer sharing (SMB) in the local network. Should never be forwarded from the internet to a PC.',
  465: 'Sending mail with encryption from the start – one of the two numbers a mail app asks for under “outgoing server”.',
  500: 'Key exchange for IPsec VPNs. If a hotel or guest network blocks it, such a VPN cannot connect.',
  515: 'The older LPD way of sending print jobs to a network printer.',
  546: 'The device’s side of IPv6 address assignment (DHCPv6).',
  547: 'The router’s side of IPv6 address assignment (DHCPv6).',
  587: 'Sending mail from a mail app (“outgoing server”, with STARTTLS).',
  631: 'Internet Printing Protocol – the way current operating systems talk to network printers, including driverless printing. If the printer sits in another network, for example the guest Wi-Fi, the computer cannot reach it on this port.',
  853: 'Encrypted DNS (DNS over TLS). Networks that block it break a fixed “Private DNS” provider on a phone.',
  993: 'Reading mail with encryption (IMAP) – the “incoming server” port in most mail apps.',
  995: 'Fetching mail with encryption (POP3).',
  1194: 'OpenVPN’s registered port.',
  1900: 'Device discovery in the local network (UPnP). Lets PCs find routers, TVs and some printers.',
  3389: 'Remote Desktop. A caller who asks you to turn on remote access or to forward this port is not support.',
  3478: 'Helps voice and video calls find a path through the router (STUN).',
  3702: 'Windows’ discovery of network printers and scanners (WSD).',
  4500: 'IPsec VPN traffic through a router (NAT traversal).',
  5353: 'Multicast DNS: how devices find printers and each other by name in the local network without any setup. On a network that keeps devices apart from each other (guest Wi-Fi, “client isolation”), these messages do not get through and printers are not found automatically.',
  5355: 'Windows’ name lookup for devices in the local network when no DNS server knows them.',
  8080: 'A common second port for web pages, for example a device’s settings page.',
  9100: 'Raw print data straight to the printer. Windows’ “Standard TCP/IP Port” for printers uses it by default.'
};
const ports = portsRaw.map((p) => ({ ...p, where: WHERE[p.port] || '' }));

// IPv4/IPv6 multicast are not in the special-purpose registries; added from the RFCs so that the check does not call them public
const ip = {
  v4: ipSpecial.v4.concat([{ block: '224.0.0.0/4', name: 'Multicast', rfc: 'RFC 5771', global: 'N/A', forwardable: 'N/A', extra: true }]),
  v6: ipSpecial.v6.concat([{ block: 'ff00::/8', name: 'Multicast', rfc: 'RFC 4291', global: 'N/A', forwardable: 'N/A', extra: true }])
};

// Home/Pro and Enterprise dates only exist for General Availability Channel rows; LTSC rows have other columns
const winGA = win.map((w) => ({ product: w.product, version: w.version, build: w.build, rows: w.rows.filter((r) => /General Availability/.test(r.servicing)), ltsc: w.rows.some((r) => /LTSC/.test(r.servicing)) }));
const srcLine = (k) => `${SRC[k].name}, retrieved ${RETRIEVED_ISO}`;
export function lookupData() {
  return {
    retrieved: RETRIEVED_ISO,
    sources: { chrome: srcLine('chrome'), wu: `${SRC.wu.name}; ${SRC.wucommon.name}; retrieved ${RETRIEVED_ISO}`, http: srcLine('http'), ports: srcLine('ports'), ipv4: srcLine('ipv4'), ipv6: srcLine('ipv6'), win: `${SRC.win11.name}; ${SRC.win10.name}; retrieved ${RETRIEVED_ISO}` },
    chrome: chrome.map(({ name, code, range, desc }) => ({ name, code, range, desc })),
    probe, http, ports, ip, wu, win: winGA,
    advice: ADVICE
  };
}

// ---------- page pieces ----------
const EXAMPLES = {
  all: ['ERR_NAME_NOT_RESOLVED', '169.254.12.7', '0x80070422', '503', '631', '26100.4946'],
  chrome: ['ERR_CONNECTION_REFUSED', 'DNS_PROBE_FINISHED_NXDOMAIN', 'ERR_CERT_DATE_INVALID', '-105'],
  http: ['404', '403', '429', '502'],
  ip: ['169.254.12.7', '192.168.1.20', '100.72.3.9', 'fe80::1c2b:3aff:fe4d:5e6f'],
  wu: ['0x80070422', '0x8024402F', '0x80240022'],
  port: ['631', '9100', '5353', '53'],
  win: ['26100.4946', '22631', '19045']
};
export function lookupBox(V, kind = 'all', label = 'Error code, status code, IP address, port or Windows build') {
  return `<section class="lookup" id="lookup" data-src="/assets/data/lookup.json?v=${V}" data-share-path="/reference/" aria-labelledby="lookup-h">
<h2 id="lookup-h">${kind === 'all' ? 'Paste what the screen says' : 'Look one up'}</h2>
<form id="lookup-form" class="lookup-form"><label for="lookup-q">${label}</label>
<div class="lookup-row"><input id="lookup-q" name="q" type="text" inputmode="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" maxlength="80" placeholder="e.g. ${esc(EXAMPLES[kind][0])}"><button type="submit" class="btn">Look up</button></div></form>
<p class="lookup-ex"><span class="ex-label">Try an example:</span> ${EXAMPLES[kind].map((x) => `<button type="button" class="example" data-q="${esc(x)}">${esc(x)}</button>`).join(' ')}</p>
<div id="lookup-out" class="lookup-out" aria-live="polite"></div>
<p class="small lookup-note">The lookup runs in your browser against a data file from this site; what you type is not sent anywhere. Without JavaScript, use the tables below.</p>
</section>`;
}
const a = (o) => o ? `<a href="${o.href}">${esc(o.label.replace(/^(Diagnosis|Guide): /, ''))}</a>` : '';
function refTable(id, caption, head, rows, { file, source, filterLabel = 'Filter this table' }) {
  return `<div class="tfilter"><label for="${id}-f">${filterLabel}</label><input id="${id}-f" type="search" data-filter-for="${id}" data-count="${id}-n" autocomplete="off" spellcheck="false" maxlength="60"><span class="tcount" id="${id}-n" aria-live="polite">${rows.length} rows</span><button type="button" class="tcsv" data-csv-for="${id}" data-file="${file}" data-source="${esc(source)}">Download CSV</button></div>
<div class="tablewrap reftable"><table id="${id}"><caption>${caption}</caption><thead><tr>${head.map((h) => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>
${rows.map((r) => `<tr>${r.map((c, i) => i === 0 ? `<th scope="row">${c}</th>` : `<td>${c}</td>`).join('')}</tr>`).join('\n')}
</tbody></table></div>`;
}
const srcList = (keys, notes = {}) => `<ul>${keys.map((k) => `<li><a href="${SRC[k].url}" rel="noopener">${esc(SRC[k].name)}</a> – retrieved ${RETRIEVED}${SRC[k].updated ? `; the page states its own last update as ${esc(SRC[k].updated)}` : ''}${SRC[k].license ? `; ${esc(SRC[k].license)}` : ''}.${notes[k] ? ' ' + notes[k] : ''}</li>`).join('')}</ul>`;

export function referencePages({ crumbsHtml, crumbsLd, ORIGIN, ORG, V }) {
  const pages = [];
  const page = ({ slug, short, kicker, title, description, h1, lede, kind, label, body, sources, sourceNotes, made, related, figureHtml = '' }) => {
    const p = `/reference/${slug}/`;
    const crumbs = [['Home', '/'], ['Reference', '/reference/'], [short, p]];
    pages.push({
      path: p, kind: 'reference', loader: true, lookup: true, title, description, h1, short, refCard: { kicker, text: description },
      jsonld: [{ '@context': 'https://schema.org', '@type': 'WebPage', name: h1, url: ORIGIN + p, description, inLanguage: 'en-US', datePublished: REF_ISO, dateModified: REF_ISO, publisher: ORG }, crumbsLd(crumbs)],
      body: `${crumbsHtml(crumbs)}<article class="refpage"><span class="kicker">${kicker}</span><h1>${esc(h1)}</h1>
<p class="lede">${lede}</p>
<p class="trust"><span><b>Data retrieved ${RETRIEVED}</b></span><span>Publisher: AdStern, Vienna</span></p>
${kind ? lookupBox(V, kind, label) : ''}
${figureHtml}
${body}
<section id="sources" class="prose sources"><h2>Sources and how this page was made</h2><p>${made}</p>${srcList(sources, sourceNotes)}
<p>Found a difference to the source? <a href="/contact/">Tell us</a> – the table is rebuilt from the source and the retrieval date changes.</p></section>
<section class="prose" aria-labelledby="rel-h"><h2 id="rel-h">Use it in a check</h2><ul class="related">${related.map((r) => `<li><a href="${r.href}"><span>${r.label.split(': ')[0]}</span>${esc(r.label.split(': ').slice(1).join(': '))}</a></li>`).join('')}</ul></section>
<p class="changelog prose"><b>Change log:</b> ${RETRIEVED} – first published.</p></article>`
    });
  };

  // ----- Chrome -----
  const advFor = (e) => ADVICE.chrome[e.name] || ADVICE.chromeRange[e.range] || {};
  const own = chrome.filter((e) => ADVICE.chrome[e.name]);
  const layerSvg = (() => {
    const cols = [['Device / browser', ['BLOCKED_BY_CLIENT', 'NETWORK_ACCESS_DENIED', 'PROXY_CONNECTION_FAILED']], ['Wi-Fi / router', ['INTERNET_DISCONNECTED', 'NETWORK_CHANGED', 'ADDRESS_UNREACHABLE']], ['DNS', ['NAME_NOT_RESOLVED', 'DNS_TIMED_OUT', 'DNS_PROBE_…']], ['Website', ['CONNECTION_REFUSED', 'TOO_MANY_REDIRECTS', 'CERT_…']]];
    let s = '<text class="d-s" x="10" y="20">WHERE A CODE POINTS FIRST (EXAMPLES)</text>';
    cols.forEach(([n, list], i) => {
      const x = 10 + i * 178;
      s += `<rect class="${i === 3 ? 'd-box-a' : 'd-box'}" x="${x}" y="34" width="166" height="40" rx="6"/><text class="d-t" x="${x + 83}" y="60" text-anchor="middle">${n}</text>`;
      list.forEach((c, j) => { s += `<text class="d-s" x="${x + 83}" y="${98 + j * 22}" text-anchor="middle">${c}</text>`; });
      if (i < 3) s += `<path class="d-line" d="M${x + 166} 54 h12"/>`;
    });
    s += '<text class="d-s" x="10" y="176">Timeouts and resets are not on the map on purpose: they need the comparison checks.</text>';
    return figure('chrome-fig', 'Examples of Chrome error codes sorted by the layer they point to first', s, 'A code narrows the search, it does not finish it. CONNECTION_TIMED_OUT, for example, can be the website or a filter in your own network – only a comparison with mobile data tells.', '0 0 720 190');
  })();
  page({
    slug: 'chrome-error-codes', short: 'Chrome error codes', kicker: 'Reference · Chrome, Edge and other Chromium browsers',
    title: 'Chrome Error Codes: All ERR_ Network Errors, Explained',
    description: `All ${chrome.length} network error codes from Chromium’s source with their official description, plus what the common ones say about device, network, DNS or website.`,
    h1: 'Chrome network error codes (ERR_…)', kind: 'chrome', label: 'Chrome error code – name (ERR_…, DNS_PROBE_…) or number (-105)',
    lede: `The small grey code on a Chrome error page – ERR_NAME_NOT_RESOLVED, ERR_CONNECTION_RESET – comes from one list in Chromium’s source code. This page shows that complete list, ${chrome.length} codes with Chromium’s own one-line description, and adds for the ${own.length} codes people actually meet which layer each one points to and which check comes next.`,
    figureHtml: layerSvg,
    body: `<section class="prose" id="read"><h2>How to read a Chrome code</h2>
<p>Chromium, the open-source project behind Chrome, Edge, Brave, Opera and Vivaldi, numbers its network errors in ranges. The range already says a lot: codes from -100 to -199 are connection errors, -200 to -299 certificate errors, -300 to -399 HTTP errors, -800 to -899 errors of the built-in DNS client. The name shown on the error page is the list’s name with “ERR_” in front; the number appears on some pages and in logs.</p>
<p>Chromium’s descriptions are written for programmers and say what happened inside the browser, not what to do. The column “What it tells you” is this site’s reading for the codes where one layer is clearly indicated; where a code alone cannot decide between the website and your own network, it says so and names the comparison check that can. Codes without an entry in that column get the note for their range.</p></section>
<section class="prose" id="probe"><h2>The DNS_PROBE codes are a separate list</h2>
<p>When a name lookup fails, Chrome runs its own short DNS test and replaces the code on the page with the result. These statuses are defined in a different source file, and Chromium’s comment says the status name is what is “presented to the user as part of the DNS error page”.</p>
${refTable('t-probe', 'Chrome DNS probe statuses', ['Code on the error page', 'Chromium’s description', 'What it tells you (our reading)', 'Next check'],
    probe.map((e) => [`<code>${e.name}</code>`, esc(e.desc), esc(ADVICE.probe[e.name].meaning), a(ADVICE.probe[e.name].next)]),
    { file: 'chrome-dns-probe-statuses.csv', source: `${SRC.probe.url} – retrieved ${RETRIEVED_ISO}`, filterLabel: 'Filter the DNS probe codes' })}</section>
<section class="prose" id="common"><h2>Codes with a clear pointer</h2>
<p>These ${own.length} codes are the ones where the layer can be named from the code. Chromium’s description is quoted unchanged.</p>
${refTable('t-own', 'Chrome network errors that point to a layer', ['Code', 'No.', 'Chromium’s description', 'What it tells you (our reading)', 'Next check'],
    own.map((e) => [`<code>${e.name}</code>`, e.code, esc(e.desc), esc(advFor(e).meaning), a(advFor(e).next)]),
    { file: 'chrome-error-codes-explained.csv', source: `${SRC.chrome.url} – retrieved ${RETRIEVED_ISO}`, filterLabel: 'Filter these codes' })}</section>
<section class="prose" id="all"><h2>The complete list</h2>
<p>All ${chrome.length} entries of <code>net_error_list.h</code> in the order of the file. Where Chromium’s comment has several paragraphs, the first one is shown. Many of these never reach an error page – they are used inside the browser.</p>
${refTable('t-chrome', `All ${chrome.length} Chromium network error codes`, ['Code', 'No.', 'Range', 'Chromium’s description'],
    chrome.map((e) => [`<code>${e.name}</code>`, e.code, e.range, esc(e.desc) + (e.more ? ' <span class="small">(first paragraph)</span>' : '')]),
    { file: 'chromium-net-error-list.csv', source: `${SRC.chrome.url} – retrieved ${RETRIEVED_ISO}`, filterLabel: 'Filter all codes (name, number or word)' })}</section>`,
    sources: ['chrome', 'probe'],
    made: `The names, numbers and descriptions were extracted by a script from the two Chromium source files below, as they stood on the main branch on the retrieval date; nothing was reworded. Chromium’s code is published under a BSD-style license (Copyright The Chromium Authors). The columns marked “our reading” and the choice of the ${own.length} explained codes are ClickSolve Guide’s own work; they were not tested by provoking each error on purpose.`,
    related: [D_SITE, D_ONE, G_DNS, { href: '/reference/http-status-codes/', label: 'Reference: HTTP status codes' }]
  });

  // ----- HTTP -----
  const httpAdv = (h) => ADVICE.http[h.code] || ADVICE.httpClass[Math.floor(h.code / 100)];
  const classSvg = (() => {
    const cls = [['1xx', 'Informational', 'interim answer', 'd-box'], ['2xx', 'Successful', 'it worked', 'd-box-g'], ['3xx', 'Redirection', 'go elsewhere', 'd-box'], ['4xx', 'Client error', 'request refused', 'd-box-a'], ['5xx', 'Server error', 'server failed', 'd-box-r']];
    let s = '<text class="d-s" x="10" y="20">EVERY STATUS CODE MEANS: THE SERVER ANSWERED</text>';
    cls.forEach(([n, name, what, c], i) => {
      const x = 10 + i * 142;
      s += `<rect class="${c}" x="${x}" y="34" width="132" height="76" rx="6"/><text class="d-t" x="${x + 66}" y="62" text-anchor="middle">${n}</text><text class="d-s" x="${x + 66}" y="82" text-anchor="middle">${name}</text><text class="d-s" x="${x + 66}" y="100" text-anchor="middle">${what}</text>`;
    });
    s += '<text class="d-s" x="10" y="138">So device, Wi-Fi, router, provider and DNS all worked far enough to reach it.</text>';
    return figure('http-fig', 'The five classes of HTTP status codes', s, 'The first digit is the class (RFC 9110, section 15). On the layer map, any status code rules out everything before the website.', '0 0 720 150');
  })();
  page({
    slug: 'http-status-codes', short: 'HTTP status codes', kicker: 'Reference · every browser',
    title: 'HTTP Status Codes: Full IANA List and Who Has to Fix It',
    description: `All ${http.length} registered HTTP status codes from the IANA registry with the defining RFC, and for the ones you see in a browser: who can fix it – you or the site.`,
    h1: 'HTTP status codes: who has to fix what', kind: 'http', label: 'HTTP status code (three digits, e.g. 403)',
    lede: `“404”, “403 Forbidden”, “502 Bad Gateway”: a three-digit status code is the web server’s own answer. That is the most useful thing about it – a page that shows one has proved that your device, Wi-Fi, router, provider and DNS work. This page lists all ${http.length} codes in the official IANA registry and says, for the ones a browser shows, on which side the fix is.`,
    figureHtml: classSvg,
    body: `<section class="prose" id="read"><h2>Reading a status code as a diagnosis</h2>
<p>A status code can only appear when a connection to the server exists. If you see a browser-made page instead – “This site can’t be reached”, “Server not found” – there was no answer at all, and the <a href="/reference/chrome-error-codes/">browser’s own error code</a> is the thing to read.</p>
<p>The registry gives each code a name and the document that defines it. The column “What it tells you” is this site’s summary of that definition from the visitor’s point of view; codes without their own note get the note for their class. Whether a 403 or 429 is “your fault” is often unknowable from outside – the note says what you can try.</p></section>
<section class="prose" id="all"><h2>All registered codes</h2>
${refTable('t-http', `HTTP status codes in the IANA registry (${http.length} assigned)`, ['Code', 'Registered name', 'Defined in', 'What it tells you (our reading)', 'Next check'],
    http.map((h) => [h.code, esc(h.desc), esc(h.ref), esc(httpAdv(h).meaning), a(httpAdv(h).next)]),
    { file: 'http-status-codes.csv', source: `${SRC.http.url} – retrieved ${RETRIEVED_ISO}`, filterLabel: 'Filter by number or word' })}</section>`,
    sources: ['http'],
    made: `Code numbers, names and references were taken unchanged from the registry’s CSV file; unassigned ranges were left out. The class names follow RFC 9110, section 15. The “our reading” column is ClickSolve Guide’s own summary of the definitions in the referenced RFCs.`,
    related: [D_ONE, D_SITE, { href: '/reference/chrome-error-codes/', label: 'Reference: Chrome error codes' }]
  });

  // ----- IP -----
  const ipRows = (list) => list.map((e) => [`<code>${e.block}</code>`, esc(e.name), esc(e.rfc) + (e.extra ? ' *' : ''), e.global === 'True' ? 'yes' : e.global === 'False' ? 'no' : esc(e.global), esc((ADVICE.ip[e.block] || ADVICE.ip[e.name] || { meaning: '' }).meaning)]);
  page({
    slug: 'ip-address-check', short: 'IP address check', kicker: 'Reference · Windows, macOS, iPhone, Android, routers',
    title: 'IP Address Check: What 169.254, 192.168 or 100.64 Means',
    description: 'Type the IP address your device or router shows and see which range it belongs to, what that says about the connection and which check comes next.',
    h1: 'What does this IP address tell me?', kind: 'ip', label: 'IP address shown by your device or router (IPv4 or IPv6)',
    lede: 'The address a device shows in its Wi-Fi details is a test result. 169.254.x.x means the router never answered. 192.168.x.x means it did. 100.64.x.x on a router means the provider shares one public address among customers. Type the address and get the range, its official definition and what follows for the diagnosis.',
    body: `<section class="prose" id="read"><h2>Why the address is a check that changes nothing</h2>
<p>Reading an address needs no command and no setting: every system shows it in the details of the connected network. The <a href="/diagnose/wifi-connected-no-internet/">Wi-Fi diagnosis</a> asks for it at exactly one point – after other devices have been found working – because the answer splits the remaining causes in two: no address from the router, or an address but no traffic.</p>
<p>The check compares the address with the two IANA registries of special-purpose ranges. An address in none of them is a public address. The check never looks anything up online and does not find out “whose” address it is.</p>
<p class="small">The example buttons use made-up addresses.</p></section>
<section class="prose" id="v4"><h2>IPv4 special-purpose ranges</h2>
${refTable('t-ip4', 'IPv4 special-purpose address ranges', ['Range', 'Name in the registry', 'Defined in', 'Reachable from the internet', 'What it tells you (our reading)'], ipRows(ip.v4),
    { file: 'ipv4-special-purpose-ranges.csv', source: `${SRC.ipv4.url} – retrieved ${RETRIEVED_ISO}`, filterLabel: 'Filter IPv4 ranges' })}
<p class="small">* 224.0.0.0/4 (multicast) is not part of the special-purpose registry; it was added from RFC 5771 so that the check does not call a multicast address public.</p></section>
<section class="prose" id="v6"><h2>IPv6 special-purpose ranges</h2>
${refTable('t-ip6', 'IPv6 special-purpose address ranges', ['Range', 'Name in the registry', 'Defined in', 'Reachable from the internet', 'What it tells you (our reading)'], ipRows(ip.v6),
    { file: 'ipv6-special-purpose-ranges.csv', source: `${SRC.ipv6.url} – retrieved ${RETRIEVED_ISO}`, filterLabel: 'Filter IPv6 ranges' })}
<p class="small">* ff00::/8 (multicast) is not part of the special-purpose registry; it was added from RFC 4291.</p></section>`,
    sources: ['ipv4', 'ipv6'],
    made: 'Ranges, names, RFC references and the “globally reachable” value were taken unchanged from the registries’ CSV files (footnote markers removed). The two multicast ranges marked with * were added from their RFCs. The “our reading” column is ClickSolve Guide’s own explanation of the definitions in RFC 1918, RFC 3927, RFC 6598, RFC 1122 and RFC 4291.',
    related: [D_WIFI, D_LAPTOP, G_DNS, { href: '/reference/network-ports/', label: 'Reference: network ports' }]
  });

  // ----- ports -----
  page({
    slug: 'network-ports', short: 'Network ports', kicker: 'Reference · routers, firewalls, printers, mail apps',
    title: 'Network Ports for Home Troubleshooting (IANA Names)',
    description: `The ${new Set(ports.map((p) => p.port)).size} port numbers you meet in router, firewall, printer and mail settings, with their registered IANA service name and where each matters.`,
    h1: 'Port numbers you meet while troubleshooting', kind: 'port', label: 'Port number (0–65535)',
    lede: 'Router pages, firewall prompts, printer setups and mail apps talk in port numbers: 53, 443, 631, 9100. The official registry has thousands of entries; this page is a selection of the ones behind everyday faults – DNS, address assignment, printing, mail, VPN, device discovery – each with its registered name and the place where it turns up in a diagnosis.',
    body: `<section class="prose" id="read"><h2>How ports fit the layer map</h2>
<p>An IP address finds the device; the port number finds the service on it. A printer can be switched on, joined to the Wi-Fi and reachable by ping and still not print, because the one port the computer uses for printing is not answering or is filtered between two networks. That is why “the printer is on the guest Wi-Fi” and “the PC is on a VPN” are questions in the <a href="/diagnose/printer-offline-windows-11/">printer diagnoses</a>.</p>
<p>Service names, transport protocols and descriptions are the registry’s. The column “Where you meet it” is this site’s note. The selection is ours: it covers what the diagnoses and guides on this site touch, not every port in use.</p></section>
<section class="prose" id="all"><h2>The selection</h2>
${refTable('t-ports', 'Selected registered ports', ['Port', 'Service name', 'Transport', 'Registry description', 'Reference', 'Where you meet it (our note)'],
    ports.map((p) => [p.port, `<code>${esc(p.service)}</code>`, p.transport.join(', ').toUpperCase(), esc(p.desc), esc(p.ref || '–'), esc(p.where)]),
    { file: 'network-ports-selection.csv', source: `${SRC.ports.url} – retrieved ${RETRIEVED_ISO}`, filterLabel: 'Filter by number, name or word (try “print” or “mail”)' })}</section>`,
    sources: ['ports'],
    made: 'Port numbers, service names, transport protocols, descriptions and RFC references were taken unchanged from the registry’s CSV file; only TCP and UDP rows were used, and alias names for the same port were left out. The selection and the “Where you meet it” column are ClickSolve Guide’s own.',
    related: [{ href: '/diagnose/printer-offline-windows-11/', label: 'Diagnosis: printer offline in Windows 11' }, { href: '/diagnose/mac-printer-not-printing/', label: 'Diagnosis: Mac printer not printing' }, G_DNS, G_SCAM]
  });

  // ----- Windows Update -----
  const comps = [...new Set(wu.map((x) => x.component))];
  page({
    slug: 'windows-update-error-codes', short: 'Windows Update error codes', kicker: 'Reference · Windows 11, Windows 10',
    title: 'Windows Update Error Codes: Lookup of Microsoft’s List',
    description: `Look up a Windows Update error code such as 0x80070422: ${wu.length} entries from Microsoft’s own two lists with the official name, description and component.`,
    h1: 'Windows Update error codes (0x8024…)', kind: 'wu', label: 'Windows Update error code (0x followed by eight characters)',
    lede: `Windows Update reports failures as codes like 0x80240022. Microsoft documents them in two places written for administrators: a list of the update client’s own codes by component and a troubleshooting article for common errors. This page joins both – ${wu.length} entries – into one searchable table, so the code on your screen becomes a name and a sentence.`,
    body: `<section class="prose" id="read"><h2>What a code can and cannot tell you</h2>
<p>A Windows Update code names the part of the update client that gave up and why: it could not reach the server, a download was damaged, an installer failed, a service is disabled. It does not name the fix. Microsoft’s list by component contains no remedies at all; the troubleshooting article has a “mitigation” for each of its codes, aimed at company administrators with tools a home PC rarely needs.</p>
<p>For a home PC the order of safe steps is the same for most codes – wait, restart, free space, run the built-in troubleshooter, and only then reset the update cache. That order, with the undo for each step, is in the guide <a href="/guides/windows-update-stuck/">Windows Update stuck</a>. Use the code to check whether the cause is the network (names with PT, HTTP or TIME_OUT), the download (DM) or the installation (UH, CBS), and to describe the fault precisely if you ask for help.</p>
<p>Where the same code appears in both sources, both rows are shown. The lookup links to Microsoft’s mitigation when the troubleshooting article covers the code.</p></section>
<section class="prose" id="all"><h2>All entries</h2>
${refTable('t-wu', `Windows Update error codes from Microsoft’s documentation (${wu.length} entries in ${comps.length} groups)`, ['Code', 'Name', 'Microsoft’s description', 'Group in the source'],
    wu.map((x) => [`<code>${x.code}</code>`, `<span class="wrapany">${esc(x.message)}</span>`, esc(x.desc), esc(x.component) + (x.anchor ? ` – <a href="${SRC.wucommon.url}#${esc(x.anchor)}" rel="noopener">mitigation at Microsoft</a>` : '')]),
    { file: 'windows-update-error-codes.csv', source: `${SRC.wu.url} and ${SRC.wucommon.url} – retrieved ${RETRIEVED_ISO}`, filterLabel: 'Filter by code, name or word (try “proxy” or “download”)' })}</section>`,
    sources: ['wu', 'wucommon'],
    made: 'Codes, names and descriptions were extracted by a script from the tables of the two Microsoft Learn pages below and are quoted unchanged (codes written in upper case). Microsoft Learn documentation is licensed under CC BY 4.0. Microsoft’s mitigation texts are not copied here; the table links to them. The introduction and the reading of the name parts (PT, DM, UH) are ClickSolve Guide’s own, based on the group headings of Microsoft’s list.',
    related: [{ href: '/guides/windows-update-stuck/', label: 'Guide: Windows Update stuck' }, { href: '/reference/windows-macos-versions/', label: 'Reference: Windows builds and macOS versions' }, { href: '/guides/which-windows-macos-version/', label: 'Guide: which Windows or macOS version' }]
  });

  // ----- versions -----
  const winRows = winGA.map((w) => {
    const r = w.rows[0];
    return [`<b>${w.build}</b>`, `${esc(w.product)} ${esc(w.version)}`, r ? r.available : '–', r ? esc(r.endHome) : (w.ltsc ? 'LTSC editions only' : 'not listed as serviced'), r ? esc(r.endEnt) : (w.ltsc ? 'LTSC editions only' : 'not listed as serviced'), r ? `${r.latestBuild} (${r.latestDate})` : '–'];
  });
  const ltsc = winGA.filter((w) => w.ltsc);
  page({
    slug: 'windows-macos-versions', short: 'Windows builds and macOS versions', kicker: 'Reference · Windows 11, Windows 10, macOS',
    title: 'Windows Build Numbers and macOS Versions: Lookup Table',
    description: 'Turn a Windows build number from winver into its version and end-of-updates date, and a macOS number into its name – from Microsoft’s and Apple’s own pages.',
    h1: 'Windows build numbers and macOS versions', kind: 'win', label: 'Windows build number from winver (e.g. 26100.4946 or 22631)',
    lede: 'Support articles say “Windows 11, version 24H2”; your PC says “OS Build 26100.4946”. A Mac says “15.6”; the article says “Sequoia”. This page translates between the two, using the release tables Microsoft and Apple publish, and tells you whether Microsoft still lists your Windows version for updates.',
    body: `<section class="prose" id="read"><h2>Reading the build number</h2>
<p>Press the Windows key and R, type <code>winver</code> and press Enter. The window shows a version such as 24H2 and an OS build such as 26100.4946. The part before the dot identifies the version – it is what the table below is sorted by. The part after the dot rises with every monthly update. If it is lower than the “latest build” in the table, updates are waiting to be installed; the lookup compares the two for you.</p>
<p>On this site, menu paths are written for “Windows 11” and “Windows 10”. Any build from 22000 upward is Windows 11; builds from 10240 to 19045 are Windows 10.</p>
<p>The dates are Microsoft’s, as published on the retrieval date; Microsoft changes them from time to time. “End of updates” is the day after which that version gets no more security updates for the named editions.</p></section>
<section class="prose" id="win"><h2>Windows 11 and Windows 10 versions by build</h2>
${refTable('t-win', 'Windows 11 and Windows 10 versions by OS build number', ['OS build', 'Version', 'Available since', 'End of updates: Home, Pro', 'End of updates: Enterprise, Education', 'Latest build (date)'], winRows,
    { file: 'windows-versions-by-build.csv', source: `${SRC.win11.url} and ${SRC.win10.url} – retrieved ${RETRIEVED_ISO}`, filterLabel: 'Filter by build or version' })}
<p class="small">Rows marked “not listed as serviced” appear in Microsoft’s release history but not in its tables of current versions; “LTSC editions only” means Microsoft lists the version only for its Long-Term Servicing Channel editions, which home PCs do not run. For Windows 10 22H2 Microsoft’s table says “End of updates”; its “latest build” column refers to Extended Security Updates (ESU). ${ltsc.length ? 'Long-Term Servicing Channel editions of ' + ltsc.map((w) => w.product + ' ' + w.version).join(', ') + ' have separate, later dates on Microsoft’s pages.' : ''}</p></section>
<section class="prose" id="mac"><h2>macOS versions and names</h2>
<p>On a Mac, choose Apple menu > About This Mac. The first number is the major version; Apple’s table gives the name and the latest release of each.</p>
${refTable('t-mac', 'macOS versions and their latest release according to Apple', ['macOS', 'Latest version', 'Menu paths on this site'],
    mac.map((m) => { const major = parseFloat((m.name.match(/(\d+(?:\.\d+)?)\s*$/) || [0, 0])[1]); return [esc(m.name), m.latest, major >= 13 ? 'macOS 13 Ventura or later (System Settings)' : 'macOS 12 Monterey or earlier (System Preferences)']; }),
    { file: 'macos-versions.csv', source: `${SRC.macos.url} – retrieved ${RETRIEVED_ISO}`, filterLabel: 'Filter by name or number' })}
<p class="small">The third column is ours: it says which entry of this site’s version switcher fits. System Preferences became System Settings with macOS 13 Ventura.</p></section>`,
    sources: ['win11', 'win10', 'macos'],
    made: 'Version names, build numbers and dates were extracted by a script from the tables and headings of the Microsoft and Apple pages below and are shown unchanged. The split into “Windows 11” and “Windows 10” menu paths and the third column of the macOS table are ClickSolve Guide’s own.',
    related: [{ href: '/guides/which-windows-macos-version/', label: 'Guide: which Windows or macOS version' }, { href: '/guides/windows-update-stuck/', label: 'Guide: Windows Update stuck' }, { href: '/reference/windows-update-error-codes/', label: 'Reference: Windows Update error codes' }]
  });

  // ----- shortcuts -----
  const WHEN = {
    'Ctrl+Shift+Esc': 'An app is frozen or the PC is slow: see what uses the processor and memory, and end a hung app.',
    'Windows key+I': 'The starting point of almost every Windows menu path on this site (“Settings > …”).',
    'Windows key+X': 'Fast way to Device Manager, Terminal and other system tools when the Start menu is slow.',
    'Windows key+R': 'Runs short commands from the guides, such as winver for the version.',
    'Windows key+Pause': 'Shows the Windows edition and version without typing anything.',
    'Windows key+A': 'The panel with the Wi-Fi, Bluetooth and Airplane mode buttons – the first look in every Wi-Fi diagnosis.',
    'Windows key+Ctrl+Shift+B': 'Black or blank screen while the PC is clearly running: try this before holding the power button.',
    'Windows key+L': 'Before you hand the device to someone or walk away during a long repair step.',
    'Windows key+Shift+S': 'Capture the exact error message for your fix log instead of retyping it.',
    'Windows key+PrtScn': 'Saves the whole screen as a file – useful when an error disappears quickly.',
    'Windows key+K': 'Wireless display or speaker does not appear: this opens the list directly.',
    'Windows key+P': 'A second screen or projector stays dark: check whether the mode is “PC screen only”.',
    'Windows key+E': 'Opens File Explorer when the taskbar does not react.',
    'Alt+F4': 'Closes a window that has no reachable close button, such as a full-screen scam pop-up.',
    F5: 'Reloads a page or window after a fix, to see whether it worked.',
    'Option-Command-Esc': 'An app shows the spinning wheel: force quit that one app instead of restarting the Mac.',
    'Command–Space bar': 'Opens Terminal, Activity Monitor or System Settings by typing the name.',
    'Command-Q': 'Really quits an app – closing the window leaves most Mac apps running. Also closes a browser stuck on a scam page.',
    'Command-Comma (,)': 'Opens the settings of the app in front, for example the browser’s.',
    'Shift-Command-5': 'Capture the exact error message for your fix log.',
    'Control-Command-Q': 'Before you walk away during a long repair step.',
    'Shift-Command-Q': 'Logging out and in again restarts your login items without restarting the Mac.',
    'Control–Command–Power button': 'Last resort when nothing reacts: unsaved work is lost. Macs with Touch ID are handled differently – see Apple’s page.',
    'Control–Power button': 'Opens the restart, sleep and shut down dialog from the keyboard.',
    'Shift-Command-U': 'The folder that holds Terminal, Activity Monitor and Disk Utility.',
    'Command-Tab': 'Check which apps are open when one is hidden behind a full-screen window.',
    'Command-P': 'Opens the print dialog – the starting point of the Mac printer diagnosis.'
  };
  page({
    slug: 'troubleshooting-shortcuts', short: 'Troubleshooting shortcuts', kicker: 'Reference · Windows 11, macOS',
    title: 'Keyboard Shortcuts for Troubleshooting: Windows and Mac',
    description: `The ${keys.length} Windows 11 and Mac keyboard shortcuts that matter when something is stuck, quoted from Microsoft and Apple, with the situation each one is for.`,
    h1: 'Keyboard shortcuts for when something is stuck', kind: null,
    lede: `Microsoft’s and Apple’s shortcut lists run to several hundred entries. When an app hangs, the screen stays black or a pop-up will not close, about two dozen of them matter. This page picks those ${keys.length}, quotes what the maker says each one does and adds the situation in a diagnosis where it saves time.`,
    body: `<section class="prose" id="read"><h2>Why shortcuts belong in a diagnosis</h2>
<p>A frozen app, a missing taskbar or a full-screen fake warning takes away the mouse’s targets. The keyboard still works in most of these cases, and the shortcuts below open exactly the system tools the diagnoses and guides on this site send you to: Task Manager, Settings, the Run box, Force Quit, the screenshot tools for the fix log.</p>
<p>The key combinations and the descriptions are quoted from the makers’ pages. The Windows rows come from the Windows 11 section of Microsoft’s page. The column “When it helps” is this site’s own.</p></section>
<section class="prose" id="all"><h2>The shortcuts</h2>
${refTable('t-keys', 'Troubleshooting shortcuts for Windows 11 and macOS', ['System', 'Keys', 'What the maker says it does', 'When it helps (our note)'],
    keys.map((k) => [k.os, `<kbd>${esc(k.keys)}</kbd>`, esc(k.desc), esc(WHEN[k.keys] || '')]),
    { file: 'troubleshooting-shortcuts.csv', source: `${SRC.winkeys.url} and ${SRC.mackeys.url} – retrieved ${RETRIEVED_ISO}`, filterLabel: 'Filter (try “screenshot”, “macOS” or “frozen”)' })}</section>`,
    sources: ['winkeys', 'mackeys'],
    made: 'The shortcuts were selected by hand; their key combinations and descriptions were then extracted by a script from the two pages below and are quoted unchanged (for long Apple entries, the first sentence). The “When it helps” column is ClickSolve Guide’s own. The shortcuts were not tried on physical devices for this page.',
    related: [{ href: '/guides/mac-running-slow/', label: 'Guide: Mac running slow' }, G_SCAM, { href: '/guides/which-windows-macos-version/', label: 'Guide: which Windows or macOS version' }]
  });

  // ----- hub -----
  const hubCrumbs = [['Home', '/'], ['Reference', '/reference/']];
  const hub = {
    path: '/reference/', kind: 'hub', loader: true, lookup: true,
    title: 'Error Code Lookup and Reference Tables – ClickSolve Guide',
    description: 'Paste a Chrome error, Windows Update code, HTTP status, IP address, port or Windows build and see what it means for the diagnosis. Seven sourced tables.',
    h1: 'Look up what the screen says',
    jsonld: [crumbsLd(hubCrumbs)],
    body: `${crumbsHtml(hubCrumbs)}<span class="kicker">Reference · from the makers’ own documentation</span><h1>Look up what the screen says</h1>
<div class="prose"><p class="lede">An error code is the one precise thing a failing device tells you. Paste it here: the lookup recognises Chrome network errors, Windows Update codes, HTTP status codes, IP addresses, port numbers and Windows build numbers, shows the official definition and says which layer it points to.</p></div>
${lookupBox(V)}
<section aria-labelledby="tables-h"><h2 id="tables-h">The tables behind the lookup</h2>
<ul class="cards">${pages.map((p) => `<li><a class="card" href="${p.path}"><span class="k">${esc(p.refCard.kicker)}</span><h3>${esc(p.h1)}</h3><p>${esc(p.refCard.text)}</p></a></li>`).join('')}</ul></section>
<section class="prose" aria-labelledby="how-h"><h2 id="how-h">Where the data comes from</h2>
<p>Every table on these pages was extracted by a script from a primary source: Chromium’s source code for the Chrome codes, the IANA registries for HTTP status codes, IP ranges and ports, Microsoft Learn for Windows Update codes and Windows releases, Apple Support for macOS versions, and the two makers’ own shortcut lists. Names, numbers, dates and descriptions are shown unchanged. Each page links its source and states the day the data was retrieved – ${RETRIEVED} for this edition.</p>
<p>What ClickSolve Guide adds is clearly marked as “our reading” or “our note”: which layer of the diagnosis a code points to, and which check comes next. Those notes are derived from the definitions; nobody provoked each of the several hundred errors on a test device, and the pages do not claim so.</p>
<p>Every table can be filtered and downloaded as a CSV file with its source line. A result can be shared as a link – except IP addresses, which are never put into a link.</p></section>`
  };
  return [hub, ...pages];
}
