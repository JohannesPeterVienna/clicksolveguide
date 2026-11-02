import { mp, step, table, figure, note } from '../lib.mjs';

const svg = `
<text class="d-s" x="20" y="22">HOW ANDROID DECIDES “CONNECTED, NO INTERNET”</text>
<rect class="d-box" x="20" y="44" width="150" height="70" rx="12"/><text class="d-t" x="95" y="74" text-anchor="middle">Phone</text><text class="d-s" x="95" y="96" text-anchor="middle">joins Wi-Fi</text>
<path class="d-line" d="M172 79 H218"/>
<rect class="d-box" x="220" y="44" width="150" height="70" rx="12"/><text class="d-t" x="295" y="74" text-anchor="middle">Router</text><text class="d-s" x="295" y="96" text-anchor="middle">gives an address</text>
<path class="d-line" d="M372 79 H418"/>
<rect class="d-box-a" x="420" y="44" width="150" height="70" rx="12"/><text class="d-t" x="495" y="74" text-anchor="middle">DNS</text><text class="d-s" x="495" y="96" text-anchor="middle">or Private DNS</text>
<path class="d-line" d="M572 79 H618"/>
<rect class="d-box" x="620" y="44" width="90" height="70" rx="12"/><text class="d-t" x="665" y="74" text-anchor="middle">Test</text><text class="d-s" x="665" y="96" text-anchor="middle">server</text>
<path class="d-dash" d="M665 116 V150 H95 V116"/>
<text class="d-s" x="380" y="172" text-anchor="middle">No answer from the test → “Connected, no internet” (or “Connected without internet”)</text>
<text class="d-ta" x="380" y="198" text-anchor="middle">A wrong Private DNS hostname breaks this step on every Wi-Fi and on mobile data</text>`;

export default {
  slug: 'android-connected-no-internet', kind: 'guide',
  short: 'Android: connected, no internet',
  kicker: 'Guide · Android phones and tablets',
  title: 'Android Says “Connected, No Internet”: What to Check',
  description: 'Android shows “Connected, no internet”? Check sign-in pages, Private DNS, date and time and the router in the right order – before you reset anything.',
  h1: 'Android says “Connected, no internet”',
  cardText: 'The Wi-Fi joins, the internet doesn’t follow. Private DNS, a sign-in page or the router – here is the order to check.',
  chips: ['Android', 'Wi-Fi', 'DNS'],
  lede: 'Android shows “Connected, no internet” when it has joined a Wi-Fi network but its own internet test fails. The cause can be the network – or one setting on the phone that many people never knew they had changed.',
  applies: 'Android 12 and later on Pixel and similar phones; Samsung Galaxy paths noted',
  checked: 'Android Help (Google), Samsung support documentation',
  sections: [
    { id: 'meaning', h2: 'What the phone is telling you', html: `
<p>After joining a Wi-Fi network, Android quietly tries to reach a test address on Google’s servers. If the reply arrives, the network gets the normal Wi-Fi icon. If it doesn’t, Android marks the network “Connected, no internet” or “Connected without internet”, depending on the phone maker and version, and may switch to mobile data in the background so apps keep working.</p>
<p>So the message means: the link to the router works, but something between the router and the internet – or in the phone’s own name lookup – does not. Android menus differ between manufacturers. The paths below use the wording of Google’s Pixel phones and add Samsung’s where it differs; on other brands look for the same words.</p>
${figure('android-fig', 'Android’s internet test after joining Wi-Fi and where it can fail', svg, 'Android checks the full path. A failure anywhere after the router shows the same message – including a misconfigured Private DNS on the phone.', '0 0 720 210')}` },
    { id: 'first', h2: 'Checks that change nothing', html: `
${step(1, { title: 'Check other devices on the same Wi-Fi', time: 'about 1 min', body: `<p>If a laptop or another phone works on the same network, the router and provider are fine and the problem is on this phone. If nothing works, restart the router first; the <a href="/diagnose/wifi-connected-no-internet/">Wi-Fi diagnosis</a> covers that path in detail.</p>` })}
${step(2, { title: 'Look for “Sign in to network”', time: 'about 1 min', body: `<p>On hotel, café or guest networks, Android shows a notification such as “Sign in to Wi-Fi network”. Tap it and accept the terms. Until then, the network has no internet for you.</p>` })}
${step(3, { title: 'Switch Wi-Fi off and on, then restart the phone', time: 'about 2 min', body: `<p>Use ${mp({ android: 'Settings > Network & internet > Internet > Wi-Fi switch (Samsung: Settings > Connections > Wi-Fi)' })}. A restart also clears a stuck network service.</p>` })}` },
    { id: 'privatedns', h2: 'Private DNS: the hidden culprit', html: `
<p>Android has a setting called Private DNS that sends all name lookups, encrypted, to a DNS provider of your choice. The default, “Automatic”, uses encryption when the network’s DNS server supports it and falls back otherwise. But if someone entered a specific provider hostname – perhaps following an ad-blocking tip – and that hostname is mistyped, no longer exists or is blocked on this network, every lookup fails. Android then reports “no internet” on Wi-Fi, and often on mobile data too.</p>
${step(4, { risk: 'setting', title: 'Set Private DNS to Automatic for a test', time: 'about 2 min', body: `<p>Open ${mp({ android: 'Settings > Network & internet > Private DNS (Samsung: Settings > Connections > More connection settings > Private DNS)' })}. If a hostname is entered, write it down and switch to Automatic. Test again.</p>`, undo: 'Select “Private DNS provider hostname” again and re-enter the hostname you wrote down.' })}
${table('Private DNS options in Android', ['Option', 'What it does', 'Good to know'], [
  ['Off', 'Uses the network’s DNS without encryption', 'Works everywhere the network’s DNS works'],
  ['Automatic', 'Encrypts when the network’s DNS supports it', 'The default; rarely causes problems'],
  ['Provider hostname', 'Always uses the named provider, encrypted', 'Fails completely if the name is wrong or blocked']
])}` },
    { id: 'clock', h2: 'Date, time and the network profile', html: `
${step(5, { risk: 'setting', title: 'Set date and time automatically', time: 'about 1 min', body: `<p>A wrong clock breaks encrypted connections, including the ones Android uses for its own checks. Use ${mp({ android: 'Settings > System > Date & time > Set time automatically (Samsung: Settings > General management > Date and time > Automatic date and time)' })}.</p>`, undo: 'Switch automatic time off and set the time manually again.' })}
${step(6, { risk: 'setting', title: 'Forget the network and join again', time: 'about 3 min', body: `<p>Tap the gear next to the network in ${mp({ android: 'Settings > Network & internet > Internet (Samsung: Settings > Connections > Wi-Fi)' })} and choose Forget. Join again with the password. On the network’s details page you will also find the privacy option (“Use randomized MAC” or similar) – routers with a device filter may block a randomized address.</p>`, undo: 'Join the network again with its password; switch the MAC option back if you changed it.' })}
${step(7, { risk: 'setting', title: 'Disconnect VPN and ad-blocking apps', time: 'about 2 min', body: `<p>VPN apps and some ad blockers route all traffic through themselves. Pause them in their app or in ${mp({ android: 'Settings > Network & internet > VPN (Samsung: Settings > Connections > More connection settings > VPN)' })}. An “Always-on VPN” that can’t connect blocks everything.</p>`, undo: 'Reconnect the VPN in its app.' })}` },
    { id: 'reset', h2: 'Last resort: reset network settings', html: `
${step(8, { risk: 'last', title: 'Reset Wi-Fi, mobile and Bluetooth settings', time: 'about 10 min', body: `<p>${mp({ android: 'Settings > System > Reset options > Reset Wi-Fi, mobile & Bluetooth (Samsung: Settings > General management > Reset > Reset network settings)' })} removes all saved Wi-Fi networks, Bluetooth pairings and mobile network settings you changed. Your apps, photos and files stay. Don’t confuse it with the factory reset in the same menu.</p>`, undo: 'No undo: join Wi-Fi networks and pair Bluetooth devices again.' })}
${note('warn', 'Two resets live next to each other.', '<p>The network reset is harmless to your data. “Erase all data (factory reset)” wipes the phone – read the option name twice.</p>')}
<p>If the phone still fails on every Wi-Fi network while other devices work, check for a system update and contact the phone maker’s support through its official website.</p>` },
    { id: 'falsealarm', h2: 'When the message is wrong', html: `
<p>Sometimes browsing works perfectly while Android insists there is no internet. That happens when the network blocks Google’s test address – some company networks, filtering DNS services and home ad-blocking setups do. Android may then prefer mobile data and use up your data plan. If you run the filter, allow Google’s connectivity check; otherwise, ask the network owner. On a network you trust, Android may also offer to stay connected anyway when you tap the network.</p>` }
  ],
  faq: [
    ['Why does my Android say connected without internet?', 'It joined the Wi-Fi but its internet test failed. Common causes: the router or provider is down, a sign-in page is waiting, Private DNS is set to a broken hostname, or a VPN can’t connect.'],
    ['What is Private DNS and should I use it?', 'It encrypts your name lookups. “Automatic” is a sensible default. A specific provider hostname works only if it is typed correctly and not blocked on the network.'],
    ['Does resetting network settings delete my photos?', 'No. It deletes saved Wi-Fi networks, Bluetooth pairings and mobile network settings. The factory reset, a separate option, is the one that erases data.'],
    ['Why does my phone use mobile data on Wi-Fi?', 'When Android thinks a Wi-Fi network has no internet, it may switch to mobile data so apps keep working. Fix the Wi-Fi problem, or turn off the switching feature in the Wi-Fi or connection preferences if you prefer.'],
    ['Are Samsung menus different?', 'Yes. Samsung uses “Connections” instead of “Network & internet” and “General management” for reset and date options. The guide lists both.']
  ],
  sourcesNote: 'Paths follow Google’s Android and Pixel help; Samsung wording follows Samsung’s own support pages and may differ by One UI version.',
  sources: [
    ['Android Help – Fix Wi-Fi connection problems and Private DNS', 'https://support.google.com/android/'],
    ['Samsung support – Galaxy Wi-Fi and network reset instructions (samsung.com support)', null],
    ['Google Pixel Help – Reset network settings', 'https://support.google.com/pixelphone/']
  ],
  related: ['/diagnose/wifi-connected-no-internet/', '/guides/dns-server-not-responding/', '/guides/iphone-wont-connect-wifi/', '/guides/restart-router-right-way/']
};
