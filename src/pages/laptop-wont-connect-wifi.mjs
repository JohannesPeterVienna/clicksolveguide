import { mp, table, figure } from '../lib.mjs';

const svg = `
<text class="d-s" x="20" y="22">JOINING A NETWORK: FOUR STAGES, FOUR KINDS OF FAILURE</text>
<rect class="d-box" x="20" y="44" width="155" height="76" rx="8"/><text class="d-t" x="97" y="72" text-anchor="middle">1 · Radio on</text><text class="d-s" x="97" y="96" text-anchor="middle">adapter, switch</text>
<path class="d-line" d="M177 82 H195"/>
<rect class="d-box" x="197" y="44" width="155" height="76" rx="8"/><text class="d-t" x="274" y="72" text-anchor="middle">2 · Network seen</text><text class="d-s" x="274" y="96" text-anchor="middle">band, range, hidden</text>
<path class="d-line" d="M354 82 H372"/>
<rect class="d-box" x="374" y="44" width="155" height="76" rx="8"/><text class="d-t" x="451" y="72" text-anchor="middle">3 · Password OK</text><text class="d-s" x="451" y="96" text-anchor="middle">WPA2 / WPA3</text>
<path class="d-line" d="M531 82 H549"/>
<rect class="d-box-g" x="551" y="44" width="155" height="76" rx="8"/><text class="d-t" x="628" y="72" text-anchor="middle">4 · Connected</text><text class="d-tg" x="628" y="96" text-anchor="middle">address received</text>
<text class="d-tr" x="97" y="146" text-anchor="middle">“no networks”</text>
<text class="d-tr" x="274" y="146" text-anchor="middle">“mine is missing”</text>
<text class="d-tr" x="451" y="146" text-anchor="middle">“can’t connect”</text>
<text class="d-ta" x="628" y="146" text-anchor="middle">“no internet” → other</text>
<text class="d-s" x="20" y="182">Your provider isn’t involved in stages 1–3: joining Wi-Fi happens between laptop and router only.</text>`;

export default {
  slug: 'laptop-wont-connect-wifi', kind: 'tool', tree: 'laptop-wifi',
  short: 'Laptop won’t connect to Wi-Fi',
  kicker: 'Diagnosis · Windows and Mac laptops',
  title: 'Laptop Won’t Connect to Wi-Fi: Find Where It Fails',
  description: 'Laptop can’t see or join your Wi-Fi? Find out whether the adapter, the Wi-Fi band, the password or the router is the problem – with safe Windows and Mac steps.',
  h1: 'Laptop won’t connect to Wi-Fi',
  toolTitle: 'Laptop won’t join Wi-Fi – where does it stop?',
  cardText: 'Network missing, password rejected or no networks at all? Each points to a different part of the join.',
  chips: ['Laptop', 'Wi-Fi', 'Router'],
  lede: 'A laptop that won’t get onto Wi-Fi fails at one of four stages: its radio, finding the network, agreeing on the password and security, or receiving an address. Tell the diagnosis what you see and it skips the stages that can’t be the cause.',
  applies: 'Windows 11, Windows 10, macOS laptops',
  checked: 'Microsoft Support, Apple Support',
  versions: ['win11', 'win10', 'macnew', 'macold'],
  sections: [
    { id: 'stages', h2: 'Four stages of joining a network', html: `
<p>“Won’t connect” covers several different problems, and the words you see on screen say which one you have. If the laptop lists no networks at all, its own radio is off or not working. If it lists your neighbors’ networks but not yours, it can’t receive your router’s signal – because of distance, the frequency band or a hidden network name. If it finds your network but connecting fails or the password is asked for again and again, the two sides don’t agree on the password or the security mode.</p>
<p>Only the last case – connected, but “No internet” – involves anything beyond your router, and it has <a href="/diagnose/wifi-connected-no-internet/">its own diagnosis</a>. For everything else, your internet provider isn’t involved at all, which is why the layer map crosses out the provider and the service after the first answer.</p>
${figure('laptop-fig', 'The four stages of joining a Wi-Fi network and the symptom of a failure at each stage', svg, 'Where the join stops decides where to look. The first question in the diagnosis asks exactly this.', '0 0 720 195')}` },
    { id: 'symptoms', h2: 'Symptom, stage and likely cause', html: `
${table('What you see and what it usually means', ['What you see', 'Stage', 'Likely cause', 'First check'], [
  ['No networks at all, Wi-Fi icon crossed out', 'Radio', 'Wi-Fi off, Airplane mode, function key, adapter disabled', 'Wi-Fi and Airplane mode switches'],
  ['Neighbors’ networks visible, mine missing', 'Network seen', 'Distance, band the laptop lacks, hidden network', 'Next to the router'],
  ['“Can’t connect to this network”', 'Password/security', 'Wrong or changed password, security mode, MAC filter', 'Forget network, retype'],
  ['Asks for the password again and again', 'Password/security', 'Password changed on the router, old saved profile', 'Forget network'],
  ['Connected, “No internet”', 'Beyond the join', 'Router, provider or device settings', 'Wi-Fi no-internet diagnosis']
])}
<p>On Windows, a quick look at the system tray already separates the first two rows: a globe icon or a crossed-out Wi-Fi symbol usually means the radio is off or no adapter is working; a Wi-Fi symbol with a list of networks means the radio works.</p>` },
    { id: 'radio', h2: 'When the laptop sees no networks', html: `
<p>Check the obvious first, because it is common: Wi-Fi switched off, Airplane mode on, or a Wi-Fi key pressed by accident. Many laptops have a function key with an antenna symbol, and some older ones have a physical slide switch on the edge. The software switches are in ${mp({ win11: 'Quick settings (network icon on the taskbar) > Wi-Fi and Airplane mode', win10: 'Network icon on the taskbar > Wi-Fi and Airplane mode', macnew: 'Control Center > Wi-Fi', macold: 'Wi-Fi icon in the menu bar' })}.</p>
<p>If the switches are right and still nothing appears, check whether Windows sees the adapter at all: ${mp({ win11: 'right-click Start > Device Manager > Network adapters', win10: 'right-click Start > Device Manager > Network adapters' })}. An adapter with a small down-arrow is disabled and can be enabled with a right-click. A yellow warning symbol points to a driver problem. If no wireless adapter is listed at all, Windows doesn’t detect the hardware – a driver from the laptop maker may help, otherwise it is a repair case. On a Mac, holding Option while clicking the Wi-Fi icon shows the interface details; a Mac that reports no Wi-Fi hardware needs Apple Support.</p>` },
    { id: 'bands', h2: 'When your network is missing: range, bands and hidden names', html: `
<p>Routers broadcast on 2.4 GHz and 5 GHz, and newer models on 6 GHz too. 2.4 GHz reaches further and passes walls better; 5 GHz and 6 GHz are faster but fade sooner. A laptop several rooms away may see the 2.4 GHz networks of neighbors but not your router’s 5 GHz network. Carrying the laptop next to the router is the quickest test: if the network appears there, the cause is range, and the fix is router placement or a mesh system, not a setting on the laptop.</p>
<p>If the network still doesn’t appear right next to the router while phones use it, two explanations are left. Either the router only uses a band the laptop doesn’t support – common with 6 GHz-only networks and older laptops, and with 5 GHz on very old ones – or the network is hidden. A hidden network never shows up in lists; you add it by typing its name, via ${mp({ win11: 'Settings > Network & internet > Wi-Fi > Manage known networks > Add network', win10: 'Settings > Network & Internet > Wi-Fi > Manage known networks > Add a new network', macnew: 'System Settings > Wi-Fi > Other…', macold: 'Wi-Fi menu > Join Other Network…' })}. Hiding a network name adds no real security, so many people turn it off again.</p>` },
    { id: 'password', h2: 'When the password is rejected', html: `
<p>A rejected password usually is wrong – Wi-Fi passwords are case-sensitive, and 0/O and 1/l/I are easily mixed up. The factory password is printed on the router as WPA key, Wireless key or Network key, but only applies if nobody changed it. If the laptop worked before and suddenly keeps asking for the password, the router’s password was probably changed and the laptop still holds the old one. Forgetting the network and joining fresh solves that.</p>
<p>When the right password still fails, the phone test separates the two sides. If a phone joins with the same password, the router accepts it – and the laptop’s side of the handshake is the problem: a driver, the security mode (WPA3-only networks lock out older laptops), or a random hardware address meeting a router filter. If the phone is refused too, the password or the router’s access rules are the issue. Routers can limit the number of devices, require approval for new devices in their app, or filter by hardware address.</p>` },
    { id: 'drivers', h2: 'Drivers and resets – in the right order', html: `
<p>A Wi-Fi driver update is worth trying when only the laptop has trouble, but get it from the right place: Windows Update’s optional updates, or the laptop maker’s support site for your exact model. Driver updater tools aren’t needed and some come bundled with unwanted software. On a Mac, Wi-Fi drivers arrive with macOS updates.</p>
<p>Windows’ Network reset is the last step in this diagnosis for a reason. It removes all saved Wi-Fi networks and passwords, VPN connections and custom network settings, reinstalls the network adapters and restarts the PC by itself after about five minutes – save open work first. It fixes deeply confused network settings – but you will have to enter every Wi-Fi password again, and VPN software may need reinstalling. Have the passwords at hand before you start.</p>
<p>If none of this brings the laptop online and other devices work fine, contact the laptop maker through its official website. The fix log from the diagnosis tells their support exactly what you have ruled out.</p>` }
  ],
  faq: [
    ['Does the internet provider matter if the laptop can’t join?', 'No. Joining Wi-Fi happens between the laptop and the router. The provider only matters once the laptop is connected – then “No internet” is a separate problem with its own diagnosis.'],
    ['Why can my phone connect but not my laptop?', 'The router and password work, so the difference is the laptop: an outdated saved profile, a disabled or outdated Wi-Fi adapter, a security mode the laptop doesn’t support, or a random hardware address meeting a router filter.'],
    ['Why can’t my laptop see my 5 GHz or 6 GHz network?', 'Older laptops may lack the band, and 6 GHz needs a Wi-Fi 6E or Wi-Fi 7 adapter. Higher bands also fade faster through walls. Test next to the router; if it’s still missing, use the 2.4 GHz network or check the router’s band settings.'],
    ['What is Airplane mode doing to Wi-Fi?', 'Airplane mode switches off all radios. On many laptops you can switch Wi-Fi back on while Airplane mode stays on, but the simpler check is to turn Airplane mode off.'],
    ['Will a network reset delete my files?', 'No. It deletes network settings – saved Wi-Fi networks, passwords, VPN connections – and reinstalls network adapters. Files and apps stay, but VPN apps may need to be set up again.'],
    ['Where is the Wi-Fi password?', 'If it was never changed, it’s on the router’s label as WPA key, Wireless key or Network key. Otherwise ask whoever set up the router, or look it up on a device that is already connected.']
  ],
  sourcesNote: 'Windows and Mac Wi-Fi settings follow Microsoft and Apple support documentation; band and security background follows the Wi-Fi Alliance.',
  sources: [
    ['Microsoft Support – Fix Wi-Fi connection issues in Windows', 'https://support.microsoft.com/help/10741'],
    ['Apple Support – Mac User Guide: connect to Wi-Fi and join hidden networks', 'https://support.apple.com/'],
    ['Wi-Fi Alliance – Wi-Fi 6E, Wi-Fi 7 and WPA3 overview', 'https://www.wi-fi.org/']
  ],
  related: ['/diagnose/wifi-connected-no-internet/', '/guides/iphone-wont-connect-wifi/', '/guides/restart-router-right-way/', '/guides/which-windows-macos-version/']
};
