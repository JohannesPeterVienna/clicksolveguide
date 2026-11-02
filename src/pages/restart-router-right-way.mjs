import { step, table, figure, note } from '../lib.mjs';

const svg = `
<text class="d-s" x="20" y="22">THE RESTART TIMELINE (SEPARATE MODEM AND ROUTER)</text>
<path class="d-line" d="M20 110 H700"/>
<circle class="d-fill-r" cx="40" cy="110" r="8"/><text class="d-t" x="40" y="80" text-anchor="middle">0:00</text><text class="d-s" x="40" y="140" text-anchor="middle">unplug both</text>
<circle class="d-fill-m" cx="180" cy="110" r="8"/><text class="d-t" x="180" y="80" text-anchor="middle">0:30</text><text class="d-s" x="180" y="140" text-anchor="middle">plug in modem</text>
<circle class="d-fill-a" cx="360" cy="110" r="8"/><text class="d-t" x="360" y="80" text-anchor="middle">~2–3 min</text><text class="d-s" x="360" y="140" text-anchor="middle">modem lights settle</text><text class="d-s" x="360" y="158" text-anchor="middle">→ plug in router</text>
<circle class="d-fill-g" cx="560" cy="110" r="8"/><text class="d-t" x="560" y="80" text-anchor="middle">+2–5 min</text><text class="d-s" x="560" y="140" text-anchor="middle">Wi-Fi back, test</text>
<path class="d-green" d="M560 110 H700"/>
<text class="d-s" x="20" y="200">Times are typical ranges, not guarantees – wait for the lights described in your model’s manual.</text>`;

export default {
  slug: 'restart-router-right-way', kind: 'guide',
  short: 'Restart a router the right way',
  kicker: 'Basics · home network',
  title: 'How to Restart a Router the Right Way (Not Reset It)',
  description: 'Restart, not reset: how to power-cycle a router and modem in the right order, how long to wait, what the lights mean and when a factory reset is the wrong move.',
  h1: 'How to restart a router the right way',
  cardText: 'Unplug, wait, plug in – in which order, for how long, and why the pinhole button is not a restart.',
  chips: ['Router', 'Modem', 'Basics'],
  lede: 'Restarting the router fixes a surprising number of internet problems – if it’s done in the right order and with enough patience. And it must never be confused with the reset button, which erases the router’s settings.',
  applies: 'Home routers, modems and combined modem-routers from any provider',
  checked: 'Router and provider documentation (general practice)',
  sections: [
    { id: 'why', h2: 'Why a restart helps', html: `
<p>A router is a small computer that runs for weeks or months without a break. It keeps tables of connected devices, hands out addresses, forwards name lookups and maintains the login to your provider. Over time those tables can fill up or a process can hang – while the lights look perfectly normal. A restart clears all of that and makes the router log in to the provider again.</p>
<p>That’s also why a restart is the right first step when <i>all</i> devices at home lose the internet, and the wrong one when only a single laptop has a problem: in that case the router is evidently working for everyone else. The <a href="/diagnose/wifi-connected-no-internet/">Wi-Fi diagnosis</a> asks this question before it ever suggests a restart.</p>
${figure('router-fig', 'Timeline of restarting a modem and router in the right order', svg, 'Modem first, then router, then patience. Testing too early makes a successful restart look like a failure.', '0 0 720 215')}` },
    { id: 'restart-vs-reset', h2: 'Restart vs. reset: not the same thing', html: `
${table('Restart, reset and reboot from the app compared', ['Action', 'How', 'What it changes', 'When to use'], [
  ['Restart (power cycle)', 'Unplug power, wait, plug in', 'Nothing – all settings stay', 'All devices lose internet; slow or unstable connection'],
  ['Restart from the app or admin page', '“Restart” / “Reboot” button', 'Nothing – same as a power cycle', 'When you can’t reach the plug'],
  ['Factory reset', 'Hold the recessed Reset button with a pin', 'Erases Wi-Fi name, password, provider login and all settings', 'Only on the provider’s or maker’s instruction'],
  ['Wi-Fi off/on on the router', 'Wi-Fi button or app', 'Restarts only the wireless part', 'Wi-Fi drops while cable works']
])}
${note('stop', 'Don’t press the pinhole Reset button to “restart”.', '<p>A factory reset brings back the Wi-Fi name and password from the label, deletes port forwarding and parental controls, and on many connections the router can’t go online again until the provider’s login details are re-entered.</p>')}` },
    { id: 'steps', h2: 'The restart, step by step', html: `
${step(1, { title: 'Find out what boxes you have', time: 'about 2 min', body: `<p>Many homes have one combined box from the provider (modem and router in one). Others have a separate modem – the box connected to the cable, phone or fiber line – and a router connected to it with a network cable. Mesh systems add satellite units around the home. Note which box is which before you unplug anything.</p>` })}
${step(2, { title: 'Unplug the power of every box', time: 'about 1 min', body: `<p>Pull the power plug or switch off at the power button on the back – not the Reset button. With a separate modem and router, unplug both. Leave the line cable and network cables plugged in.</p>` })}
${step(3, { title: 'Wait about 30 seconds', time: '30 s', body: `<p>This gives the devices time to power down completely. Plugging back in immediately doesn’t always clear everything.</p>` })}
${step(4, { title: 'Plug in the modem first and wait for its lights', time: '2–5 min', body: `<p>Power up the modem (or the combined box) alone. Wait until the line or internet light is steady as described in the manual – the modem has to synchronize with the provider’s line. With a combined box, this is the only box, and you can skip step 5.</p>` })}
${step(5, { title: 'Then plug in the router and mesh units', time: '2–5 min', body: `<p>Power up the router, then any mesh satellites. The router now gets a connection from a modem that is already online. Give it a few minutes to start its Wi-Fi.</p>` })}
${step(6, { title: 'Test with a site you rarely visit', time: 'about 1 min', body: `<p>Open a website you don’t normally visit, on a device connected to Wi-Fi, so you’re not looking at a cached page. If nothing works after ten minutes, the problem is probably on the provider’s side.</p>` })}` },
    { id: 'lights', h2: 'Reading the lights afterwards', html: `
<p>Every manufacturer uses its own colors, so the manual for your model is the authority. A few patterns are common, though. A light labeled Internet, Online, WAN, DSL or with a globe symbol shows the connection to the provider: steady usually means up, blinking often means it is still connecting, and red, orange or off after several minutes usually means no connection to the provider. A Wi-Fi or WLAN light shows whether wireless is on. Power and LAN lights confirm the basics.</p>
<p>Write down what you see – color and whether it blinks. If you need to call your provider, that description is the first thing they ask for, and the fix log on our diagnosis pages has room for it.</p>` },
    { id: 'often', h2: 'If you have to restart it often', html: `
<p>Needing a restart now and then is normal. Needing one every few days isn’t. Check whether the router has a firmware update – in its app or admin page, or ask the provider for their own equipment. Make sure the router isn’t overheating: keep it out of closed cabinets and off other warm devices. Older routers can also struggle with many connected devices in modern homes. If the provider supplied it, ask whether a replacement is available.</p>
<p>Some routers offer a scheduled automatic restart, for example at night. It’s a workaround, not a fix – but harmless and reversible if you want fewer interruptions while you sort out the cause.</p>` },
    { id: 'provider', h2: 'When the restart doesn’t help', html: `
<p>If all devices still have no internet after a proper restart, and the internet light stays red, orange or off, the fault is most likely on the line or at the provider. Check the provider’s status page or app using mobile data. Then contact the provider through the details on your contract, bill or official website – never a number from a search ad. Tell them you have already power-cycled modem and router in order, and what the lights show.</p>` }
  ],
  faq: [
    ['How long should I unplug the router?', 'About 30 seconds is enough for a full power-down. Then give the modem and router a few minutes each to start before you test.'],
    ['Does restarting the router delete settings?', 'No. A power cycle keeps every setting. Only a factory reset – the recessed button held for several seconds – erases them.'],
    ['Should I restart the modem or the router first?', 'Unplug both, then power up the modem first and wait until its line light is steady, then the router. With a combined box there is only one device to restart.'],
  ],
  sourcesNote: 'Routers differ by maker and provider; the restart order is common practice, and your model’s manual is the authority for its lights.',
  sources: [
    ['Your router’s or provider’s manual – meaning of the status lights for your model', null],
    ['Federal Communications Commission (FCC) – consumer guides on home broadband', 'https://www.fcc.gov/'],
    ['Microsoft Support – Fix Wi-Fi connection issues in Windows (restart modem and router)', 'https://support.microsoft.com/help/10741']
  ],
  related: ['/diagnose/wifi-connected-no-internet/', '/guides/dns-server-not-responding/', '/diagnose/printer-offline-windows-11/', '/diagnose/laptop-wont-connect-wifi/']
};
