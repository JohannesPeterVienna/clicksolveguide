// Reference section of clicksolveguide.com: lookup box and tables. From the primary sources (src/data/,
// see src/data/extract.py) come only identifiers and facts: code names and numbers, registry entries,
// version names, dates, key combinations. Every explanation – what an entry means, where it points on
// the layer map, the next safe step – is written by ClickSolve Guide in this file. No code comments and
// no description texts of Microsoft, Apple or Chromium are reproduced.
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
    100: { meaning: 'An interim answer: the server has seen the start of the request and the browser may send the rest. You never see it as an error.' },
    101: { meaning: 'The server agrees to switch to another protocol on this connection, for example for a live chat channel. Not an error.' },
    200: { meaning: 'The request worked and the page was delivered. If it still looks broken, the cause is in the page itself or in the browser (extensions, stored data), not in the transfer.' },
    204: { meaning: 'The request worked and the server has nothing to show for it. Normal after saving something in a web app.' },
    206: { meaning: 'The server delivered a requested part of a file – normal when a download is resumed or a video is skipped forward.' },
    301: { meaning: 'The address has moved for good; browsers follow automatically. You only notice it when redirects run in a circle.' },
    302: { meaning: 'A temporary redirect; browsers follow automatically. You only notice it when redirects run in a circle.' },
    303: { meaning: 'After a form was sent, the server points the browser to a result page. Normal behaviour.' },
    304: { meaning: 'Not an error: the server confirms that the copy your browser already stored is still current.' },
    307: { meaning: 'A temporary redirect that keeps the kind of request unchanged. Browsers follow automatically.' },
    308: { meaning: 'A permanent redirect that keeps the kind of request unchanged. Browsers follow automatically.' },
    400: { meaning: 'The server rejected the request as malformed. From a browser, data stored for that site (cookies) can be the cause: test a private window, then clear that one site’s data.', next: D_ONE },
    401: { meaning: 'The server wants a valid sign-in for this address. Sign in again; if the page belongs to a company or school, the account needs access.' },
    403: { meaning: 'The server understood the request and refuses it. Your connection works. The site decides this – by account, by country or by the address you come from, for example when you use a VPN.', next: D_ONE },
    404: { meaning: 'The server is up but has nothing at this exact address. Check the spelling after the domain name; an old link or bookmark is the usual reason. Nothing on your device needs fixing.' },
    405: { meaning: 'The page exists but does not accept this kind of request – for example a form sent to an address that only shows pages. A fault in the website or in an outdated bookmark to a form step.' },
    407: { meaning: 'The exception among the 4xx codes: this answer comes from a proxy between you and the website, not from the website. The proxy wants a sign-in. On a company or school network ask IT; on a private device check whether a proxy or a VPN app is set that should not be.', next: D_WIFI },
    408: { meaning: 'The server gave up waiting for the browser’s request. Reload once; if it repeats on a slow or unstable connection, look at the Wi-Fi link.', next: D_WIFI },
    409: { meaning: 'The request collides with the current state on the server – typically two people or two tabs changed the same thing. Reload the page and repeat the change.' },
    410: { meaning: 'The page was removed on purpose and is not coming back at this address.' },
    413: { meaning: 'What you tried to send is larger than the server accepts – usually an upload. Make the file smaller; nothing is wrong with your connection.' },
    414: { meaning: 'The address itself is too long for the server. This happens with links that carry a lot of data after the question mark; open the site from its start page instead.' },
    415: { meaning: 'The server does not accept the format of what was sent – for example an upload in a file type the site does not support.' },
    421: { meaning: 'The request reached a server that is not responsible for this address. A fault in the website’s setup or in a connection the browser reused; closing and reopening the browser makes it connect afresh.', next: D_ONE },
    426: { meaning: 'The server insists on a newer protocol than the one used. Seen with very old browsers or apps: update the browser.' },
    428: { meaning: 'The server only accepts the change with a safeguard against overwriting someone else’s edit. A matter for the web app; reload and try again.' },
    429: { meaning: 'Too many requests from your address or account in a short time. Wait – every reload adds another request. On a shared network or VPN, the limit is shared with others.' },
    431: { meaning: 'The browser sent more header data than the server accepts – for example too many or too large cookies for that site. Test a private window, then clear that one site’s cookies.', next: D_ONE },
    451: { meaning: 'The site withholds the page for legal reasons, typically depending on the country you connect from. Nothing is broken on your side.' },
    500: { meaning: 'The website’s server ran into an error of its own. Only the site can fix it; try again later or check its status page.', next: D_ONE },
    501: { meaning: 'The server does not support what the request asked it to do. A fault in the website or app, not on your device.' },
    502: { meaning: 'A server in front of the website (gateway or proxy) got an invalid answer from the server behind it. A problem inside the website’s infrastructure – wait and retry.', next: D_ONE },
    503: { meaning: 'The server is temporarily overloaded or down for maintenance. Wait and retry; a status page often confirms it.', next: D_ONE },
    504: { meaning: 'A gateway in front of the website waited too long for the server behind it. As with 502, the website’s side.', next: D_ONE },
    505: { meaning: 'The server does not support the HTTP version the request used. A server or app fault; a current browser does not cause it.' },
    511: { meaning: 'The second exception: this answer comes from the network you are on, not from the website. The network wants you to sign in first – the sign-in page of a hotel, café, train or guest Wi-Fi. Open a plain address in a new tab to get the sign-in page; until then nothing else will load.', next: D_WIFI }
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
    listed: 'Microsoft lists this code under the name shown. This site has no explanation of its own for it; Microsoft’s wording is on the linked page. For a home PC the order of safe steps is the same for most update errors and is in our guide.',
    missing: 'This code is not in the Microsoft lists this lookup uses (Windows Update error codes by component, Common Windows Update errors, Windows upgrade resolution procedures). That says nothing about how serious it is. Search the exact code on Microsoft’s own support site.'
  }
};
for (const e of ipSpecial.v4.concat(ipSpecial.v6)) if (/^Documentation/.test(e.name)) ADVICE.ip[e.block] = ADVICE.ip.Documentation;

// Windows Update: our selection of codes a home PC shows, with our own explanation and next safe step.
// [code, what it means, next safe step]. Official name and source link come from the data.
const G_WU = { href: '/guides/windows-update-stuck/', label: 'Guide: Windows Update stuck' };
const STORE = 'Windows’ own store of system files is damaged, so the update cannot be put together.';
const STORE_NEXT = 'Restart and try once more. If it returns, Microsoft’s remedy is Windows’ built-in repair (DISM with RestoreHealth, then SFC) from an administrator command prompt – the exact commands are on the linked Microsoft page. Nothing has to be downloaded for it.';
const NET_NEXT = 'Open a website to check the connection. Pause a VPN or proxy and try again; if you can, try another network. If only updates fail for hours, wait – nothing on the PC needs changing.';
const WUSEL = [
  ['0x80070422', 'The Windows Update service is switched off or not running, so nothing can be searched or installed.', 'Restart the PC. If the code returns, open the Services app, look for “Windows Update” and check that it is not set to Disabled (needs an administrator). On a work PC this is set by IT.'],
  ['0x80072EE2', 'The PC got no answer from the update server in time.', NET_NEXT],
  ['0x80072EFD', 'The connection to the update server could not be set up or timed out. Microsoft names firewalls and proxies that block its download addresses.', NET_NEXT],
  ['0x80072EFE', 'The connection to the update server was cut during the transfer.', NET_NEXT],
  ['0x80072F8F', 'The PC could not read what the update server sent; Microsoft traces this to the encryption setup (TLS 1.2) on older systems.', 'Install all other pending updates first and restart. Microsoft’s page names the update that fixes it on old systems; do not change security settings by hand.'],
  ['0x8007000D', 'A downloaded update file is damaged or incomplete.', 'Restart and let Windows download it again. If the same update fails again, the last step of our guide – resetting the update cache – makes Windows fetch it fresh.'],
  ['0x80070005', 'Windows was refused access to a file or setting it needs for the update.', 'Restart, sign in with an administrator account and retry. If it stays, the cause has to be read from Windows’ update log as Microsoft describes – a job for someone experienced, not for trial and error.'],
  ['0x80070003', 'A folder or file the update expects is not where it should be.', 'Restart and retry. If the same update fails again, reset the update cache as described at the end of our guide.'],
  ['0x80070020', 'Another program is holding a file the update needs. Microsoft names security software and similar background programs as the usual cause.', 'Restart and start the update before opening anything else. If it repeats, follow Microsoft’s clean-start instructions on the linked page.'],
  ['0x80070570', STORE, STORE_NEXT],
  ['0x80073701', STORE + ' A part of an earlier update was left half installed.', STORE_NEXT],
  ['0x800F081F', STORE + ' Files needed for the update are missing.', STORE_NEXT],
  ['0x800F0831', STORE, STORE_NEXT],
  ['0x800F0821', 'The installation step took longer than Windows allows and was stopped by its own watchdog.', 'Give the PC time: close other programs, keep it plugged in and try the update again.'],
  ['0x80070BC9', 'An earlier installation still needs a restart, or a setting keeps Windows’ installer service from starting.', 'Restart the PC (Restart, not Shut down) and try again. On a managed PC the installer setting comes from IT.'],
  ['0x80240020', 'The update needs someone signed in to finish, and nobody was.', 'Sign in, start the update again and let the PC restart when it asks.'],
  ['0x80240022', 'Every update in the batch failed. Microsoft’s most common finding is security software blocking Windows’ update folders.', 'Restart and retry. If you use third-party antivirus, check whether it reports blocking Windows Update; then run Windows’ own troubleshooter as in our guide.'],
  ['0x80242014', 'An update is waiting for its restart and blocks the next one until then.', 'Restart the PC (Restart, not Shut down), then check for updates again.'],
  ['0x80242006', 'The description data of an update is unusable.', 'Microsoft’s remedy is to make Windows download everything fresh by renaming the update cache folders – the last step in our guide, with the undo.'],
  ['0x8024000B', 'The update run was cancelled – by you, by a shutdown or by the update service itself.', 'Start “Check for updates” again and leave the PC on until it finishes.'],
  ['0x8024401B', 'A proxy server between the PC and Microsoft demands a sign-in the update service cannot give.', 'On a home PC, check whether a proxy is set in the network settings or by a VPN or filter app, and switch it off for a test. On a work PC, ask IT.'],
  ['0x80244022', 'The update server answered that it is overloaded or unavailable (the web’s status 503).', 'Wait an hour and try again. Nothing on the PC needs fixing. On a work PC the update server belongs to the company – ask IT.'],
  ['0x80200053', 'A download did not arrive as it was sent. Microsoft points to firewalls or filters that alter downloads.', 'Pause a VPN, web filter or third-party firewall for a test and retry, or try another network.'],
  ['0x8024A10A', 'The update service shut down in the middle – Microsoft describes this after long idle periods.', 'Keep the PC awake and plugged in, start the update again and stay until the download and installation finish.'],
  ['0x80240016', 'Another installation is still running, or the PC is waiting for a restart.', 'Wait a few minutes or restart the PC, then try again.'],
  ['0x8024001E', 'The update service or Windows was shutting down while the update was at work.', 'Start the PC normally and check for updates again; do not switch off during an update.'],
  ['0x80240034', 'An update could not be downloaded.', 'Check the connection and free disk space, then retry. If the same update keeps failing, reset the update cache as described at the end of our guide.'],
  ['0x8024200D', 'The downloaded update was unusable and has to be fetched again.', 'Check for updates again – Windows repeats the download by itself. Only if it loops, reset the update cache as in our guide.'],
  ['0x80244019', 'The update server did not find the requested file (the web’s status 404).', 'Wait and retry later; the fault is at the server or with an outdated update list. Only if it lasts for days, reset the update cache as in our guide.'],
  ['0x8024402C', 'The name of the update server or of a proxy could not be looked up – a DNS or proxy problem, not an update problem.', 'Test whether websites open. If names fail in general, follow the DNS guide; if a proxy is set, switch it off for a test.'],
  ['0x80240017', 'Windows found that the update does not apply to this PC.', 'Nothing to repair. If you downloaded the update by hand, check the Windows version first.'],
  ['0x8024200B', 'The installer of an update reported a failure. The code says only that, not why.', 'Restart and retry, then run Windows’ troubleshooter as in our guide. Note the KB number of the failing update for any search on Microsoft’s site.'],
  ['0x80246008', 'The update service could not reach Windows’ background download service (BITS).', 'Restart the PC, which restarts that service, and try again. The Windows troubleshooter in our guide checks these services.'],
  ['0xC1900101', 'A version upgrade was started and rolled back. Microsoft calls this a generic rollback code that usually points to a device driver that does not work with the new version; the second code after the dash on screen names the phase in which it happened.', 'Unplug everything except mouse, keyboard and screen, install current drivers from the PC maker and pending normal updates, free up space and try again.'],
  ['0xC1900200', 'The PC does not meet the minimum requirements of the Windows version it was offered.', 'Compare the PC with Microsoft’s published requirements. If it falls short, this upgrade is not for this PC – no setting changes that.'],
  ['0xC1900107', 'Leftovers of an earlier upgrade attempt still wait to be cleaned up.', 'Restart and start the upgrade again. If it repeats, Microsoft’s page describes removing temporary and system files with Windows’ own Disk Cleanup.'],
  ['0xC1900209', 'An installed program is not compatible with the new Windows version and blocks the upgrade.', 'Update or uninstall the incompatible program, then start the upgrade again. Microsoft’s page explains how to identify it.'],
  ['0xC190020E', 'There is not enough free disk space for the upgrade.', 'Free up space with Windows’ own storage settings and try again; Microsoft’s page states how much the upgrade needs.'],
  ['0x80070070', 'The disk is full: there is not enough free space to install the update or upgrade.', 'Free up space with Windows’ own storage settings and try again.']
];
const WU_ANCHOR = { '0xC1900101': '0xc1900101' };
// one entry per code: official name (when the source gives an identifier) and the most specific Microsoft page
const wuIndex = (() => {
  const rank = { wucommon: 0, upgrade: 1, wu: 2 }, m = new Map();
  for (const x of wu) {
    const e = m.get(x.code) || { code: x.code, name: '', src: null, anchor: '' };
    if (!e.name && x.name) e.name = x.name;
    if (e.src === null || rank[x.src] < rank[e.src]) { e.src = x.src; e.anchor = WU_ANCHOR[x.code] || x.anchor || ''; }
    m.set(x.code, e);
  }
  return [...m.values()].map((e) => ({ ...e, url: SRC[e.src].url + (e.anchor ? '#' + e.anchor : '') }));
})();
const wuSel = WUSEL.map(([code, meaning, next]) => {
  const e = wuIndex.find((x) => x.code === code);
  if (!e) throw new Error('Windows Update selection: ' + code + ' is not in the Microsoft sources');
  return { ...e, meaning, next };
});

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
  const sel = Object.fromEntries(wuSel.map((x) => [x.code, { meaning: x.meaning, next: x.next }]));
  return {
    retrieved: RETRIEVED_ISO,
    sources: { chrome: srcLine('chrome'), chromeUrl: SRC.chrome.url, probeUrl: SRC.probe.url, wu: `Microsoft Learn, retrieved ${RETRIEVED_ISO}`, http: srcLine('http'), ports: srcLine('ports'), ipv4: srcLine('ipv4'), ipv6: srcLine('ipv6'), win: `${SRC.win11.name}; ${SRC.win10.name}; retrieved ${RETRIEVED_ISO}` },
    chrome, probe, http, ports, ip,
    wu: wuIndex.map((e) => ({ code: e.code, name: e.name, url: e.url, ...(sel[e.code] || {}) })),
    win: winGA,
    advice: ADVICE
  };
}

/** Major version from Apple's name: the first number in it ("macOS 27 Golden Gate" -> 27, "macOS Catalina 10.15" -> 10.15). */
export function macMajor(name) {
  const m = /(\d+(?:\.\d+)?)/.exec(name);
  return m ? parseFloat(m[1]) : NaN;
}
export const macColumn = (name) => macMajor(name) >= 13 ? 'macOS 13 Ventura or later (System Settings)' : 'macOS 12 Monterey or earlier (System Preferences)';
export const macVersions = mac;

// ---------- page pieces ----------
const EXAMPLES = {
  all: ['ERR_NAME_NOT_RESOLVED', '169.254.12.7', '0x80070422', '503', '631', '26100.4946'],
  chrome: ['ERR_CONNECTION_REFUSED', 'DNS_PROBE_FINISHED_NXDOMAIN', 'ERR_CERT_DATE_INVALID', '-105'],
  http: ['404', '403', '429', '502'],
  ip: ['169.254.12.7', '192.168.1.20', '100.72.3.9', 'fe80::1c2b:3aff:fe4d:5e6f'],
  wu: ['0x80070422', '0xC1900101', '0x80240022', '0x8024402F'],
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
const srcList = (keys, notes = {}) => `<ul>${keys.map((k) => `<li><a href="${SRC[k].url}" rel="noopener">${esc(SRC[k].name)}</a> – retrieved ${RETRIEVED}${SRC[k].updated ? `; the page states its own last update as ${esc(SRC[k].updated)}` : ''}${SRC[k].license ? `; ${esc(SRC[k].license)} (<a href="${SRC[k].licenseUrl}" rel="noopener">license text</a>)` : ''}.${notes[k] ? ' ' + notes[k] : ''}</li>`).join('')}</ul>`;

export function referencePages({ crumbsHtml, crumbsLd, ORIGIN, ORG, V }) {
  const pages = [];
  const page = ({ slug, short, kicker, title, description, h1, lede, kind, label, body, sources, sourceNotes, made, related, figureHtml = '', fromSource = [] }) => {
    const p = `/reference/${slug}/`;
    const crumbs = [['Home', '/'], ['Reference', '/reference/'], [short, p]];
    pages.push({
      path: p, kind: 'reference', loader: true, lookup: true, fromSourceWords: fromSource.join(' ').split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length, title, description, h1, short, refCard: { kicker, text: description },
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
  const ranges = [...new Set(chrome.map((e) => e.range))].map((r) => { const list = chrome.filter((e) => e.range === r); const nums = list.map((e) => -e.code); return [r, list.length, Math.min(...nums), Math.max(...nums)]; });
  page({
    slug: 'chrome-error-codes', short: 'Chrome error codes', kicker: 'Reference · Chrome, Edge and other Chromium browsers',
    title: 'Chrome Error Codes Explained: Which Layer Each Points To',
    description: `${own.length} Chrome network errors and the ${probe.length} DNS_PROBE codes in plain words: what each means, whether it points to device, network, DNS or website, and the next check.`,
    h1: 'Chrome network error codes (ERR_…)', kind: 'chrome', label: 'Chrome error code – name (ERR_…, DNS_PROBE_…) or number (-105)',
    lede: `The small grey code on a Chrome error page – ERR_NAME_NOT_RESOLVED, ERR_CONNECTION_RESET – is the most precise thing the browser tells you. This page explains the ${own.length} codes that say something about where the fault sits, and the ${probe.length} results of Chrome’s own DNS test, each with the layer it points to and the check that comes next. The lookup recognises all ${chrome.length} names in Chromium’s list.`,
    figureHtml: layerSvg,
    fromSource: own.map((e) => e.name + ' ' + e.code).concat(probe.map((e) => e.name), ranges.map((r) => r[0])),
    body: `<section class="prose" id="read"><h2>How to read a Chrome code</h2>
<p>Chromium, the open-source project behind Chrome, Edge, Brave, Opera and Vivaldi, keeps its network errors in one numbered list. The name on the error page is the list’s name with “ERR_” in front; the number appears on some pages and in logs. The list is sorted into numbered ranges, and the range already says a lot:</p>
${refTable('t-ranges', 'Ranges of Chromium’s network error list', ['Range', 'Numbers in use', 'Codes', 'What a code from this range tells you'],
    ranges.map(([r, n, lo, hi]) => [esc(r), `-${lo} to -${hi}`, n, esc(ADVICE.chromeRange[r].meaning)]),
    { file: 'chrome-error-ranges.csv', source: `${SRC.chrome.url} – retrieved ${RETRIEVED_ISO}`, filterLabel: 'Filter the ranges' })}
<p>Most of the ${chrome.length} codes never reach an error page; they are used inside the browser. For a code that is not explained below, the lookup gives its number and range and links to Chromium’s source file, where each code carries a short comment for programmers.</p></section>
<section class="prose" id="common"><h2>${own.length} codes that point to a layer</h2>
<p>Names and numbers are Chromium’s. The explanations are ours: what the code means in plain words and where it points on the layer map. Where a code alone cannot decide between the website and your own network, the text says so and names the comparison check that can.</p>
${refTable('t-own', 'Chrome network errors that point to a layer', ['Code', 'No.', 'What it means and where it points', 'Next check'],
    own.map((e) => [`<code>${e.name}</code>`, e.code, esc(ADVICE.chrome[e.name].meaning), a(ADVICE.chrome[e.name].next)]),
    { file: 'chrome-error-codes-explained.csv', source: `${SRC.chrome.url} – retrieved ${RETRIEVED_ISO}`, filterLabel: 'Filter these codes' })}</section>
<section class="prose" id="probe"><h2>The DNS_PROBE codes</h2>
<p>When a name lookup fails, Chrome runs a short DNS test of its own and replaces the code on the page with the result. These ${probe.length} statuses are defined in a second source file; while the test runs, the page can briefly show one of the “not finished” statuses.</p>
${refTable('t-probe', 'Chrome DNS probe statuses', ['Code on the error page', 'What it means and where it points', 'Next check'],
    probe.map((e) => [`<code>${e.name}</code>`, esc(ADVICE.probe[e.name].meaning), a(ADVICE.probe[e.name].next)]),
    { file: 'chrome-dns-probe-statuses.csv', source: `${SRC.probe.url} – retrieved ${RETRIEVED_ISO}`, filterLabel: 'Filter the DNS probe codes' })}</section>`,
    sources: ['chrome', 'probe'],
    made: `Only the code names, their numbers and the range boundaries were taken from the two Chromium source files below, as they stood on the main branch on the retrieval date. Chromium’s comments on the codes are not reproduced here. Every explanation on this page was written by ClickSolve Guide from the meaning of the code; the errors were not provoked one by one on test devices.`,
    related: [D_SITE, D_ONE, G_DNS, { href: '/reference/http-status-codes/', label: 'Reference: HTTP status codes' }]
  });

  // ----- HTTP -----
  const classSvg = (() => {
    const cls = [['1xx', 'Informational', 'interim answer', 'd-box'], ['2xx', 'Successful', 'it worked', 'd-box-g'], ['3xx', 'Redirection', 'go elsewhere', 'd-box'], ['4xx', 'Client error', 'request refused', 'd-box-a'], ['5xx', 'Server error', 'server failed', 'd-box-r']];
    let s = '<text class="d-s" x="10" y="20">A STATUS CODE MEANS: SOMETHING ANSWERED IN HTTP</text>';
    cls.forEach(([n, name, what, c], i) => {
      const x = 10 + i * 142;
      s += `<rect class="${c}" x="${x}" y="34" width="132" height="76" rx="6"/><text class="d-t" x="${x + 66}" y="62" text-anchor="middle">${n}</text><text class="d-s" x="${x + 66}" y="82" text-anchor="middle">${name}</text><text class="d-s" x="${x + 66}" y="100" text-anchor="middle">${what}</text>`;
    });
    s += '<text class="d-s" x="10" y="138">Normally the website – except 407 (a proxy) and 511 (the network’s sign-in page).</text>';
    return figure('http-fig', 'The five classes of HTTP status codes', s, 'The first digit is the class (RFC 9110, section 15). With the two exceptions named, any status code rules out everything before the website.', '0 0 720 150');
  })();
  const withNote = http.filter((h) => ADVICE.http[h.code]);
  page({
    slug: 'http-status-codes', short: 'HTTP status codes', kicker: 'Reference · every browser',
    title: 'HTTP Status Codes: Full IANA List and Who Has to Fix It',
    description: `All ${http.length} registered HTTP status codes from the IANA registry with the defining RFC, and for ${withNote.length} of them: who can fix it – you, your network or the site.`,
    h1: 'HTTP status codes: who has to fix what', kind: 'http', label: 'HTTP status code (three digits, e.g. 403)',
    lede: `“404”, “403 Forbidden”, “502 Bad Gateway”: a three-digit status code is an answer in the web’s own protocol. That is the most useful thing about it – with two exceptions, a page that shows one has proved that your device, Wi-Fi, router, provider and DNS work. This page lists all ${http.length} codes in the official IANA registry and says, for the ${withNote.length} a browser user can meet, on which side the fix is.`,
    figureHtml: classSvg,
    fromSource: http.map((h) => h.code + ' ' + h.desc + ' ' + h.ref),
    body: `<section class="prose" id="read"><h2>Reading a status code as a diagnosis</h2>
<p>A status code can only appear when something answered the browser in HTTP. Normally that is the website’s server, and then every layer before it is ruled out in one go. Two codes are sent by something in between: <b>407</b> comes from a proxy that wants a sign-in, and <b>511</b> from the network itself – the sign-in page of a hotel or guest Wi-Fi. With those two, the website was never reached.</p>
<p>If you see a browser-made page instead – “This site can’t be reached”, “Server not found” – there was no answer at all, and the <a href="/reference/chrome-error-codes/">browser’s own error code</a> is the thing to read.</p>
${refTable('t-class', 'The five classes of status codes', ['Class', 'Name', 'What it tells you'],
    [1, 2, 3, 4, 5].map((c) => [c + 'xx', { 1: 'Informational', 2: 'Successful', 3: 'Redirection', 4: 'Client error', 5: 'Server error' }[c], esc(ADVICE.httpClass[c].meaning)]),
    { file: 'http-status-classes.csv', source: 'https://www.rfc-editor.org/rfc/rfc9110#section-15 – retrieved ' + RETRIEVED_ISO, filterLabel: 'Filter the classes' })}
<p>Whether a 403 or 429 is “your fault” is often unknowable from outside – the note says what you can try.</p></section>
<section class="prose" id="all"><h2>All registered codes</h2>
<p>Number, name and defining document are the registry’s. The fourth column is ours and is filled for the ${withNote.length} codes with something specific to say to a person in front of a browser; for the others the class note above applies.</p>
${refTable('t-http', `HTTP status codes in the IANA registry (${http.length} assigned)`, ['Code', 'Registered name', 'Defined in', 'What it tells you', 'Next check'],
    http.map((h) => { const n = ADVICE.http[h.code]; return [h.code, esc(h.desc), esc(h.ref), n ? esc(n.meaning) : '<span class="small">see class ' + Math.floor(h.code / 100) + 'xx</span>', n ? a(n.next) : '']; }),
    { file: 'http-status-codes.csv', source: `${SRC.http.url} – retrieved ${RETRIEVED_ISO}`, filterLabel: 'Filter by number or word' })}</section>`,
    sources: ['http'],
    made: `Code numbers, registered names and references were taken from the registry’s CSV file; unassigned ranges were left out. The class names follow RFC 9110, section 15. All notes are ClickSolve Guide’s own wording, written from the definitions in RFC 9110 (section 15) and RFC 6585; they describe what the code means for a visitor, not every technical case.`,
    related: [D_ONE, D_SITE, D_WIFI, { href: '/reference/chrome-error-codes/', label: 'Reference: Chrome error codes' }]
  });

  // ----- IP -----
  const ipRows = (list) => list.map((e) => [`<code>${e.block}</code>`, esc(e.name), esc(e.rfc) + (e.extra ? ' *' : ''), e.global === 'True' ? 'yes' : e.global === 'False' ? 'no' : esc(e.global), esc((ADVICE.ip[e.block] || ADVICE.ip[e.name] || { meaning: '' }).meaning)]);
  page({
    slug: 'ip-address-check', short: 'IP address check', kicker: 'Reference · Windows, macOS, iPhone, Android, routers',
    title: 'IP Address Check: What 169.254, 192.168 or 100.64 Means',
    description: 'Type the IP address your device or router shows and see which range it belongs to, what that says about the connection and which check comes next.',
    fromSource: ip.v4.concat(ip.v6).map((e) => e.block + ' ' + e.name + ' ' + e.rfc),
    h1: 'What does this IP address tell me?', kind: 'ip', label: 'IP address shown by your device or router (IPv4 or IPv6)',
    lede: 'The address a device shows in its Wi-Fi details is a test result. 169.254.x.x means the router never answered. 192.168.x.x means it did. 100.64.x.x on a router means the provider shares one public address among customers. Type the address and get the range, the document that defines it and what follows for the diagnosis.',
    body: `<section class="prose" id="read"><h2>Why the address is a check that changes nothing</h2>
<p>Reading an address needs no command and no setting: every system shows it in the details of the connected network. The <a href="/diagnose/wifi-connected-no-internet/">Wi-Fi diagnosis</a> asks for it at exactly one point – after other devices have been found working – because the answer splits the remaining causes in two: no address from the router, or an address but no traffic.</p>
<p>The check compares the address with the two IANA registries of special-purpose ranges. An address in none of them is a public address. The check never looks anything up online and does not find out “whose” address it is.</p>
<p class="small">The example buttons use made-up addresses.</p></section>
<section class="prose" id="v4"><h2>IPv4 special-purpose ranges</h2>
${refTable('t-ip4', 'IPv4 special-purpose address ranges', ['Range', 'Name in the registry', 'Defined in', 'Reachable from the internet', 'What it tells you'], ipRows(ip.v4),
    { file: 'ipv4-special-purpose-ranges.csv', source: `${SRC.ipv4.url} – retrieved ${RETRIEVED_ISO}`, filterLabel: 'Filter IPv4 ranges' })}
<p class="small">* 224.0.0.0/4 (multicast) is not part of the special-purpose registry; it was added from RFC 5771 so that the check does not call a multicast address public.</p></section>
<section class="prose" id="v6"><h2>IPv6 special-purpose ranges</h2>
${refTable('t-ip6', 'IPv6 special-purpose address ranges', ['Range', 'Name in the registry', 'Defined in', 'Reachable from the internet', 'What it tells you'], ipRows(ip.v6),
    { file: 'ipv6-special-purpose-ranges.csv', source: `${SRC.ipv6.url} – retrieved ${RETRIEVED_ISO}`, filterLabel: 'Filter IPv6 ranges' })}
<p class="small">* ff00::/8 (multicast) is not part of the special-purpose registry; it was added from RFC 4291.</p></section>`,
    sources: ['ipv4', 'ipv6'],
    made: 'Ranges, registry names, RFC references and the “globally reachable” value were taken from the registries’ CSV files (footnote markers removed). The two multicast ranges marked with * were added from their RFCs. The column “What it tells you” is ClickSolve Guide’s own explanation of the definitions in RFC 1918, RFC 3927, RFC 6598, RFC 1122 and RFC 4291.',
    related: [D_WIFI, D_LAPTOP, G_DNS, { href: '/reference/network-ports/', label: 'Reference: network ports' }]
  });

  // ----- ports -----
  page({
    slug: 'network-ports', short: 'Network ports', kicker: 'Reference · routers, firewalls, printers, mail apps',
    title: 'Network Ports for Home Troubleshooting (IANA Names)',
    description: `The ${new Set(ports.map((p) => p.port)).size} port numbers you meet in router, firewall, printer and mail settings, with their registered IANA service name and where each matters.`,
    fromSource: ports.map((p) => p.port + ' ' + p.service + ' ' + p.transport.join(' ') + ' ' + p.desc + ' ' + p.ref),
    h1: 'Port numbers you meet while troubleshooting', kind: 'port', label: 'Port number (0–65535)',
    lede: 'Router pages, firewall prompts, printer setups and mail apps talk in port numbers: 53, 443, 631, 9100. The official registry has thousands of entries; this page is a selection of the ones behind everyday faults – DNS, address assignment, printing, mail, VPN, device discovery – each with its registered name and the place where it turns up in a diagnosis.',
    body: `<section class="prose" id="read"><h2>How ports fit the layer map</h2>
<p>An IP address finds the device; the port number finds the service on it. A printer can be switched on, joined to the Wi-Fi and reachable by ping and still not print, because the one port the computer uses for printing is not answering or is filtered between two networks. That is why “the printer is on the guest Wi-Fi” and “the PC is on a VPN” are questions in the <a href="/diagnose/printer-offline-windows-11/">printer diagnoses</a>.</p>
<p>Service names, transport protocols and descriptions are the registry’s. The column “Where you meet it” is this site’s note. The selection is ours: it covers what the diagnoses and guides on this site touch, not every port in use.</p></section>
<section class="prose" id="all"><h2>The selection</h2>
${refTable('t-ports', 'Selected registered ports', ['Port', 'Service name', 'Transport', 'Registry description', 'Reference', 'Where you meet it'],
    ports.map((p) => [p.port, `<code>${esc(p.service)}</code>`, p.transport.join(', ').toUpperCase(), esc(p.desc), esc(p.ref || '–'), esc(p.where)]),
    { file: 'network-ports-selection.csv', source: `${SRC.ports.url} – retrieved ${RETRIEVED_ISO}`, filterLabel: 'Filter by number, name or word (try “print” or “mail”)' })}</section>`,
    sources: ['ports'],
    made: 'Port numbers, service names, transport protocols, the registry’s short descriptions and RFC references were taken from the registry’s CSV file; only TCP and UDP rows were used, and alias names for the same port were left out. The selection and the column “Where you meet it” are ClickSolve Guide’s own wording.',
    related: [{ href: '/diagnose/printer-offline-windows-11/', label: 'Diagnosis: printer offline in Windows 11' }, { href: '/diagnose/mac-printer-not-printing/', label: 'Diagnosis: Mac printer not printing' }, G_DNS, G_SCAM]
  });

  // ----- Windows Update -----
  page({
    slug: 'windows-update-error-codes', short: 'Windows Update error codes', kicker: 'Reference · Windows 11, Windows 10',
    title: 'Windows Update Error Codes: What They Mean, Next Safe Step',
    description: `${wuSel.length} Windows Update and upgrade error codes a home PC shows – 0x80070422, 0xC1900101 and more – in plain words, with the next safe step and Microsoft’s page.`,
    h1: 'Windows Update error codes: meaning and next safe step', kind: 'wu', label: 'Windows Update error code (0x followed by eight characters)',
    lede: `Windows Update reports failures as codes like 0x80070422. Microsoft documents several hundred of them for administrators. This page picks ${wuSel.length} that turn up on home PCs, says in plain words what each one means and names the next step that is safe to take – with a link to Microsoft’s own page for every code. The lookup also recognises the other ${wuIndex.length - wuSel.length} codes in Microsoft’s lists and sends you to the right Microsoft page.`,
    fromSource: wuSel.map((x) => x.code + ' ' + x.name),
    body: `<section class="prose" id="read"><h2>What a code can and cannot tell you</h2>
<p>A Windows Update code names what gave up: the connection to the update server, a download, the installation, Windows’ own store of system files, or – for the codes starting with 0xC19 – the upgrade to a new Windows version. That is enough to choose the right first step and to describe the fault precisely if you ask for help. It rarely names the one cause.</p>
<p>The steps below never go beyond what Windows itself offers. They follow the order of our guide <a href="/guides/windows-update-stuck/">Windows Update stuck</a> – wait, restart, free space, Windows’ own troubleshooter, and only at the end the reset of the update cache, with its undo. Where Microsoft’s remedy is a command for administrators, the row says so and links to Microsoft instead of repeating it.</p>
<p>On a PC managed by a company or school, update settings and servers belong to IT; report the code there.</p></section>
<section class="prose" id="all"><h2>The ${wuSel.length} codes</h2>
<p>Code and official name are Microsoft’s; a dash means Microsoft gives no name. Meaning and next step are our own wording, based on the Microsoft page linked in the last column.</p>
${refTable('t-wu', `${wuSel.length} Windows Update and upgrade error codes for home PCs`, ['Code', 'Official name', 'What it means', 'Next safe step', 'Microsoft’s page'],
    wuSel.map((x) => [`<code>${x.code}</code>`, x.name ? `<span class="wrapany">${esc(x.name)}</span>` : '–', esc(x.meaning), esc(x.next), `<a href="${esc(x.url)}" rel="noopener">${{ wucommon: 'Common errors', upgrade: 'Upgrade errors', wu: 'Code list' }[x.src]}</a>`]),
    { file: 'windows-update-error-codes.csv', source: `${SRC.wucommon.url} – retrieved ${RETRIEVED_ISO}`, filterLabel: 'Filter by code or word (try “proxy”, “space” or “restart”)' })}</section>`,
    sources: ['wucommon', 'wu', 'upgrade'],
    made: `The selection of ${wuSel.length} codes is ours. A build script checks that every selected code is documented on one of the three Microsoft pages below and takes from them only the code and its official name. Microsoft’s descriptions and mitigation texts are not reproduced; “What it means” and “Next safe step” were written by ClickSolve Guide after reading them, and limited to steps a home user can take without extra tools. The steps were not tried by provoking each error on a test PC.`,
    related: [G_WU, { href: '/reference/windows-macos-versions/', label: 'Reference: Windows builds and macOS versions' }, { href: '/guides/which-windows-macos-version/', label: 'Guide: which Windows or macOS version' }, G_DNS]
  });

  // ----- versions -----
  const winRows = [...winGA].sort((x, y) => y.build - x.build).map((w) => {
    const r = w.rows[0];
    return [`<b>${w.build}</b>`, `${esc(w.product)} ${esc(w.version)}`, r ? r.available : '–', r ? esc(r.endHome) : (w.ltsc ? 'LTSC editions only' : 'not listed as serviced'), r ? esc(r.endEnt) : (w.ltsc ? 'LTSC editions only' : 'not listed as serviced'), r ? `${r.latestBuild} (${r.latestDate})` : '–'];
  });
  const ltsc = winGA.filter((w) => w.ltsc);
  page({
    slug: 'windows-macos-versions', short: 'Windows builds and macOS versions', kicker: 'Reference · Windows 11, Windows 10, macOS',
    title: 'Windows Build Numbers and macOS Versions: Lookup Table',
    description: 'Turn a Windows build number from winver into its version and end-of-updates date, and a macOS number into its name – from Microsoft’s and Apple’s own pages.',
    fromSource: winRows.map((r) => r.join(' ').replace(/<[^>]+>/g, '')).concat(mac.map((m) => m.name + ' ' + m.latest)),
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
    mac.map((m) => { const major = macMajor(m.name); if (Number.isNaN(major)) throw new Error('macOS row without a version number: ' + m.name); return [esc(m.name), m.latest, macColumn(m.name)]; }),
    { file: 'macos-versions.csv', source: `${SRC.macos.url} – retrieved ${RETRIEVED_ISO}`, filterLabel: 'Filter by name or number' })}
<p class="small">The third column is ours: it says which entry of this site’s version switcher fits. System Preferences became System Settings with macOS 13 Ventura.</p></section>`,
    sources: ['win11', 'win10', 'macos'],
    made: 'Version names, build numbers and dates – facts, no prose – were extracted by a script from the tables and headings of the Microsoft and Apple pages below. The split into “Windows 11” and “Windows 10” menu paths and the third column of the macOS table are ClickSolve Guide’s own.',
    related: [{ href: '/guides/which-windows-macos-version/', label: 'Guide: which Windows or macOS version' }, { href: '/guides/windows-update-stuck/', label: 'Guide: Windows Update stuck' }, { href: '/reference/windows-update-error-codes/', label: 'Reference: Windows Update error codes' }]
  });

  // ----- shortcuts -----
  // [what it does, when it helps] – both in our own words; the key combinations are checked against the makers' pages
  const KEYS = {
    'Ctrl+Shift+Esc': ['Opens Task Manager directly.', 'An app is frozen or the PC is slow: see what uses the processor and memory, and end a hung app.'],
    'Windows key+I': ['Opens the Settings app.', 'The starting point of almost every Windows menu path on this site (“Settings > …”).'],
    'Windows key+X': ['Opens the menu you also get by right-clicking the Start button.', 'Fast way to Device Manager, Terminal and other system tools when the Start menu is slow.'],
    'Windows key+R': ['Opens the Run box for typing a command.', 'Runs short commands from the guides, such as winver for the version.'],
    'Windows key+Pause': ['Opens Settings on the System > About page.', 'Shows the Windows edition and version without typing anything.'],
    'Windows key+A': ['Opens the quick settings panel at the right end of the taskbar.', 'The panel with the Wi-Fi, Bluetooth and Airplane mode buttons – the first look in every Wi-Fi diagnosis.'],
    'Windows key+Ctrl+Shift+B': ['Wakes the display when the screen is blank or black.', 'Black screen while the PC is clearly running: try this before holding the power button.'],
    'Windows key+L': ['Locks the PC.', 'Before you hand the device to someone or walk away during a long repair step.'],
    'Windows key+Shift+S': ['Lets you mark an area of the screen and copies it as a picture.', 'Capture the exact error message for your fix log instead of retyping it.'],
    'Windows key+PrtScn': ['Saves a picture of the whole screen as a file in Pictures > Screenshots.', 'Useful when an error disappears quickly.'],
    'Windows key+K': ['Opens the Cast panel for wireless displays.', 'A wireless display does not appear: this opens the list directly.'],
    'Windows key+P': ['Opens the choice of display mode for a second screen.', 'A second screen or projector stays dark: check whether the mode is “PC screen only”.'],
    'Windows key+E': ['Opens File Explorer.', 'Reaches your files when the taskbar does not react.'],
    'Alt+F4': ['Closes the window in front.', 'Closes a window that has no reachable close button, such as a full-screen scam pop-up.'],
    F5: ['Reloads the window in front.', 'After a fix, to see whether a page or folder now loads.'],
    'Option-Command-Esc': ['Opens the Force Quit window.', 'An app shows the spinning wheel: force quit that one app instead of restarting the Mac.'],
    'Command–Space bar': ['Opens Spotlight search.', 'Opens Terminal, Activity Monitor or System Settings by typing the name.'],
    'Command-Q': ['Quits the app in front completely.', 'Closing the window leaves most Mac apps running; this ends them. Also closes a browser stuck on a scam page.'],
    'Command-Comma (,)': ['Opens the settings of the app in front.', 'Quick way into the browser’s or mail app’s settings during a check.'],
    'Shift-Command-5': ['Opens the screenshot and screen recording tool.', 'Capture the exact error message for your fix log.'],
    'Control-Command-Q': ['Locks the screen.', 'Before you walk away during a long repair step.'],
    'Shift-Command-Q': ['Logs you out of your user account, after asking.', 'Logging out and in again restarts your login items without restarting the Mac.'],
    'Control–Command–Power button': ['Forces a restart without the chance to save – on keyboards without Touch ID.', 'Last resort when nothing reacts: unsaved work is lost. Macs with Touch ID are handled differently – see Apple’s page.'],
    'Control–Power button': ['Shows the dialog for restart, sleep or shut down – on keyboards without Touch ID.', 'Restart from the keyboard when the pointer is stuck.'],
    'Shift-Command-U': ['Opens the Utilities folder in the Finder.', 'The folder that holds Terminal, Activity Monitor and Disk Utility.'],
    'Command-Tab': ['Switches to the app you used before.', 'Check which apps are open when one is hidden behind a full-screen window.'],
    'Command-P': ['Opens the print dialog.', 'The starting point of the Mac printer diagnosis.']
  };
  for (const k of keys) if (!KEYS[k.keys]) throw new Error('shortcut without text: ' + k.keys);
  page({
    slug: 'troubleshooting-shortcuts', short: 'Troubleshooting shortcuts', kicker: 'Reference · Windows 11, macOS',
    title: 'Keyboard Shortcuts for Troubleshooting: Windows and Mac',
    description: `The ${keys.length} Windows 11 and Mac keyboard shortcuts that matter when something is stuck: what each one does and the situation in a diagnosis it is for.`,
    h1: 'Keyboard shortcuts for when something is stuck', kind: null,
    lede: `Microsoft’s and Apple’s shortcut lists run to several hundred entries. When an app hangs, the screen stays black or a pop-up will not close, about two dozen of them matter. This page picks those ${keys.length} and says for each what it does and where in a diagnosis it saves time.`,
    fromSource: keys.map((k) => k.keys),
    body: `<section class="prose" id="read"><h2>Why shortcuts belong in a diagnosis</h2>
<p>A frozen app, a missing taskbar or a full-screen fake warning takes away the mouse’s targets. The keyboard still works in most of these cases, and the shortcuts below open exactly the system tools the diagnoses and guides on this site send you to: Task Manager, Settings, the Run box, Force Quit, the screenshot tools for the fix log.</p>
<p>The key combinations are the makers’ – a build script checks that each one is listed on Microsoft’s page (Windows 11 section) or Apple’s page. Both text columns are written by ClickSolve Guide; the makers’ full lists are linked under Sources.</p></section>
<section class="prose" id="all"><h2>The shortcuts</h2>
${refTable('t-keys', 'Troubleshooting shortcuts for Windows 11 and macOS', ['System', 'Keys', 'What it does', 'When it helps'],
    keys.map((k) => [k.os, `<kbd>${esc(k.keys)}</kbd>`, esc(KEYS[k.keys][0]), esc(KEYS[k.keys][1])]),
    { file: 'troubleshooting-shortcuts.csv', source: `${SRC.winkeys.url} and ${SRC.mackeys.url} – retrieved ${RETRIEVED_ISO}`, filterLabel: 'Filter (try “screenshot”, “macOS” or “frozen”)' })}</section>`,
    sources: ['winkeys', 'mackeys'],
    made: 'The selection and all texts are ClickSolve Guide’s own. From the two pages below only the key combinations were taken; the makers’ descriptions are not reproduced. The shortcuts were not tried on physical devices for this page.',
    related: [{ href: '/guides/mac-running-slow/', label: 'Guide: Mac running slow' }, G_SCAM, { href: '/guides/which-windows-macos-version/', label: 'Guide: which Windows or macOS version' }]
  });

  // ----- hub -----
  const hubCrumbs = [['Home', '/'], ['Reference', '/reference/']];
  const hub = {
    path: '/reference/', kind: 'hub', loader: true, lookup: true,
    title: 'Error Code Lookup and Reference Tables – ClickSolve Guide',
    description: 'Paste a Chrome error, Windows Update code, HTTP status, IP address, port or Windows build and see what it means for the diagnosis. Seven reference pages.',
    h1: 'Look up what the screen says',
    jsonld: [crumbsLd(hubCrumbs)],
    body: `${crumbsHtml(hubCrumbs)}<span class="kicker">Reference · from the makers’ own documentation</span><h1>Look up what the screen says</h1>
<div class="prose"><p class="lede">An error code is the one precise thing a failing device tells you. Paste it here: the lookup recognises Chrome network errors, Windows Update codes, HTTP status codes, IP addresses, port numbers and Windows build numbers, names it, says in plain words what it means and which layer it points to.</p></div>
${lookupBox(V)}
<section aria-labelledby="tables-h"><h2 id="tables-h">The tables behind the lookup</h2>
<ul class="cards">${pages.map((p) => `<li><a class="card" href="${p.path}"><span class="k">${esc(p.refCard.kicker)}</span><h3>${esc(p.h1)}</h3><p>${esc(p.refCard.text)}</p></a></li>`).join('')}</ul></section>
<section class="prose" aria-labelledby="how-h"><h2 id="how-h">Where the data comes from</h2>
<p>The facts in these tables – code names and numbers, registry entries, version names, dates, key combinations – are taken by a script from primary sources: Chromium’s source code for the Chrome codes, the IANA registries for HTTP status codes, IP ranges and ports, Microsoft Learn for Windows Update codes and Windows releases, Apple Support for macOS versions. Each page links its source and states the day the data was retrieved – ${RETRIEVED} for this edition.</p>
<p>The explanations are ours. What a code means, which layer of the diagnosis it points to and which step comes next is written by ClickSolve Guide and not copied from the makers’ documentation; where a maker’s page says more, the table links to it. The notes are derived from the definitions – nobody provoked each error on a test device, and the pages do not claim so.</p>
<p>Every table can be filtered and downloaded as a CSV file with its source line. A result can be shared as a link – except IP addresses, which are never put into a link.</p></section>`
  };
  return [hub, ...pages];
}
