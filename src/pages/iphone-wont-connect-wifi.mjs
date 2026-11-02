import { mp, step, table, figure, note } from '../lib.mjs';

const svg = `
<text class="d-s" x="20" y="22">IPHONE WI-FI: WHICH SCREEN SAYS WHAT</text>
<rect class="d-box" x="20" y="40" width="200" height="170" rx="18"/>
<text class="d-t" x="120" y="70" text-anchor="middle">Can’t join</text>
<text class="d-s" x="120" y="96" text-anchor="middle">“Incorrect password”</text>
<text class="d-s" x="120" y="116" text-anchor="middle">“Unable to join”</text>
<text class="d-ta" x="120" y="150" text-anchor="middle">PASSWORD /</text><text class="d-ta" x="120" y="168" text-anchor="middle">ROUTER RULES</text>
<rect class="d-box" x="260" y="40" width="200" height="170" rx="18"/>
<text class="d-t" x="360" y="70" text-anchor="middle">Joined, no internet</text>
<text class="d-s" x="360" y="96" text-anchor="middle">“No Internet Connection”</text>
<text class="d-s" x="360" y="116" text-anchor="middle">under the network name</text>
<text class="d-ta" x="360" y="150" text-anchor="middle">ROUTER / ISP /</text><text class="d-ta" x="360" y="168" text-anchor="middle">SIGN-IN PAGE</text>
<rect class="d-box" x="500" y="40" width="200" height="170" rx="18"/>
<text class="d-t" x="600" y="70" text-anchor="middle">Network missing</text>
<text class="d-s" x="600" y="96" text-anchor="middle">not in the list</text>
<text class="d-s" x="600" y="116" text-anchor="middle">others can see it</text>
<text class="d-ta" x="600" y="150" text-anchor="middle">RANGE / BAND /</text><text class="d-ta" x="600" y="168" text-anchor="middle">HIDDEN NAME</text>`;

const S = (o) => o;
export default {
  slug: 'iphone-wont-connect-wifi', kind: 'guide',
  short: 'iPhone won’t connect to Wi-Fi',
  kicker: 'Guide · iPhone and iPad',
  title: 'iPhone Won’t Connect to Wi-Fi: Checks in the Right Order',
  description: 'iPhone or iPad won’t join Wi-Fi or shows “No Internet Connection”? Work through checks from harmless to last resort, with exact Settings paths and undo notes.',
  h1: 'iPhone won’t connect to Wi-Fi',
  cardText: 'Password rejected, network missing or “No Internet Connection” – what each means on an iPhone, and what to try first.',
  chips: ['iPhone', 'iPad', 'Wi-Fi'],
  lede: 'An iPhone that won’t use Wi-Fi tells you quite precisely what is wrong – if you read the small text under the network name. Here is what each message means and the order of checks that avoids resetting anything you don’t have to.',
  applies: 'iPhone and iPad with current iOS/iPadOS (older paths noted)',
  checked: 'Apple Support – iPhone User Guide',
  sections: [
    { id: 'read', h2: 'First, read what the iPhone says', html: `
<p>Open ${mp({ ios: 'Settings > Wi-Fi' })} and look at your network. Three situations look similar from a distance but have different causes. If tapping the network leads to “Incorrect password” or “Unable to join the network”, the phone and router don’t agree on the password or the security settings. If the phone joins but shows “No Internet Connection” under the network name, the Wi-Fi link works and the problem is further along – router, provider, or a sign-in page. If the network doesn’t appear at all while other devices see it, the phone can’t receive it.</p>
<p>The rest of this guide follows those three paths. The steps are ordered from harmless to last resort; stop as soon as the phone works again.</p>
${figure('iphone-fig', 'Three iPhone Wi-Fi situations and the layer each points to', svg, 'Three different screens, three different suspects. The “No Internet Connection” case is a router or provider question, not a phone setting.', '0 0 720 220')}` },
    { id: 'quick', h2: 'Quick checks that change nothing', html: `
${step(1, { title: 'Turn Wi-Fi off and on, then restart the iPhone', time: 'about 2 min', body: `<p>Switch Wi-Fi off in ${mp({ ios: 'Settings > Wi-Fi' })} for ten seconds and on again. Note that turning Wi-Fi off in Control Center only disconnects from the current network for a while; the switch in Settings turns it off properly. If that doesn’t help, restart the phone.</p>` })}
${step(2, { title: 'Check whether other devices work on the same Wi-Fi', time: 'about 1 min', body: `<p>If a laptop or another phone has internet on the same network, the router and provider are fine and the iPhone is the place to look. If nothing works, restart the router first – see <a href="/guides/restart-router-right-way/">how to restart a router the right way</a>.</p>` })}
${step(3, { title: 'Look for a sign-in page on public networks', time: 'about 1 min', body: `<p>Hotels, cafés and trains need you to accept terms on a sign-in page. The iPhone usually opens it automatically; if not, open Safari and try any address. Until you sign in, the phone shows “No Internet Connection”.</p>` })}` },
    { id: 'messages', h2: 'Messages and what to do about them', html: `
${table('iPhone Wi-Fi messages explained', ['Message or situation', 'What it means', 'What to try'], [
  ['Incorrect password', 'The router rejected the password', 'Retype it; check the router label or ask the network owner'],
  ['Unable to join the network', 'Join failed for another reason – security mode, filter, signal', 'Move closer, restart router, forget and rejoin'],
  ['No Internet Connection', 'Joined the Wi-Fi, but no internet behind it', 'Other devices? Sign-in page? Restart router'],
  ['Weak Security', 'The network uses older encryption (e.g. WPA/WPA2 TKIP or WEP)', 'Works, but update the router’s security setting'],
  ['Network not listed', 'The phone doesn’t receive it', 'Move closer; hidden network: Other…'],
  ['Wi-Fi switch greyed out', 'Hardware or software problem', 'Restart; update iOS; then Apple Support']
])}
<p>The “Weak Security” note is not an error – it is the iPhone telling you that the router uses outdated encryption. The connection works, but if it is your router, it is worth switching it to WPA2 or WPA3 in the router’s settings.</p>` },
    { id: 'settings', h2: 'Settings on the iPhone that block Wi-Fi', html: `
${step(4, { risk: 'setting', title: 'Forget the network and join again', time: 'about 3 min', body: `<p>Tap the info button (i) next to the network in ${mp({ ios: 'Settings > Wi-Fi' })} and choose Forget This Network. Then join it again with the password. This removes a stored profile that no longer matches the router – common after a new router or a changed password.</p>`, undo: 'Join the network again from the Wi-Fi list with its password.' })}
${step(5, { risk: 'setting', title: 'Check Private Wi-Fi Address for this network', time: 'about 2 min', body: `<p>The iPhone can show each network a private, made-up hardware address. Routers with a device filter or parental controls may treat that as an unknown device. The option is in ${mp({ ios: 'Settings > Wi-Fi > (i) next to the network > Private Wi-Fi Address' })}. Switch it off for your home network only if the router needs to recognise the phone.</p>`, undo: 'Switch Private Wi-Fi Address back on (or back to the previous option) for that network.' })}
${step(6, { risk: 'setting', title: 'Pause VPN and check Low Data Mode', time: 'about 2 min', body: `<p>A VPN app or a configuration profile from work or school can block traffic. Disconnect the VPN in its app or in ${mp({ ios: 'Settings > VPN (or Settings > General > VPN & Device Management)' })}. Low Data Mode, in the network’s (i) settings, pauses some background activity – it doesn’t stop browsing, but can make apps look offline.</p>`, undo: 'Reconnect the VPN and switch Low Data Mode back on if you used it.' })}` },
    { id: 'reset', h2: 'Last resort: Reset Network Settings', html: `
${step(7, { risk: 'last', title: 'Reset Network Settings', time: 'about 10 min', body: `<p>${mp({ ios: 'Settings > General > Transfer or Reset iPhone > Reset > Reset Network Settings' })} removes all saved Wi-Fi networks and passwords, VPN and APN settings and cellular settings you changed, and restores the default network configuration. On older iOS versions the option is under Settings > General > Reset. It does not erase photos, apps or other data – but don’t confuse it with “Erase All Content and Settings”, which does.</p>`, undo: 'There is no undo; you join your Wi-Fi networks again and set up VPN apps again. Have your Wi-Fi password at hand.' })}
${note('warn', 'Choose the right reset.', '<p>In the Reset menu, “Reset Network Settings” is the one you want. “Erase All Content and Settings” wipes the whole phone.</p>')}
<p>If the Wi-Fi switch is greyed out or the phone finds no networks at all even after a restart and an update, the Wi-Fi hardware may need repair. Book it through Apple Support’s official website or an Apple Store – not through a phone number from a search ad.</p>` },
    { id: 'missing', h2: 'When your network doesn’t appear', html: `
<p>Walk next to the router and refresh the list. If the network shows up there, the signal doesn’t reach where you normally use the phone; 2.4 GHz reaches further than 5 GHz and 6 GHz. If it still doesn’t appear while other devices use it, the network may be hidden – then add it by name with “Other…” at the bottom of the network list. Older iPhones don’t support 6 GHz, so a 6 GHz-only network stays invisible to them.</p>
<p>Also check whether the router has a schedule that turns Wi-Fi off at night, or a separate guest network that needs to be switched on. Both are common router features and easy to forget.</p>` }
  ],
  faq: [
    ['Why does my iPhone say “No Internet Connection”?', 'The phone joined the Wi-Fi, but the network has no working internet. Check other devices, restart the router, and on public networks look for the sign-in page. It is rarely an iPhone setting.'],
    ['Does Reset Network Settings delete my photos?', 'No. It deletes network settings – saved Wi-Fi networks and passwords, VPN settings and similar. Photos, apps and messages stay. Only “Erase All Content and Settings” wipes the phone.'],
    ['Should I turn off Private Wi-Fi Address?', 'Only for a network that needs to recognise your phone, such as a home router with a device filter. It protects your privacy on other networks, so leave it on there.'],
    ['What does “Weak Security” mean?', 'The network uses outdated encryption. The connection works, but data is less protected. If it’s your router, switch its security to WPA2 or WPA3.'],
  ],
  sourcesNote: 'Settings paths and messages follow Apple’s iPhone User Guide and Apple Support articles on Wi-Fi.',
  sources: [
    ['Apple Support – iPhone User Guide: Connect iPhone to a Wi-Fi network', 'https://support.apple.com/'],
    ['Apple Support – Use private Wi-Fi addresses on Apple devices', null],
    ['Apple Support – If your iPhone or iPad won’t connect to a Wi-Fi network', null]
  ],
  related: ['/diagnose/wifi-connected-no-internet/', '/guides/android-connected-no-internet/', '/guides/restart-router-right-way/', '/diagnose/laptop-wont-connect-wifi/']
};
