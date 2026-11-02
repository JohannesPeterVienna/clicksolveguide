import { mp, step, table, figure, note } from '../lib.mjs';

const svg = `
<text class="d-s" x="20" y="22">BLUETOOTH LAYERS: FROM THE SWITCH TO THE DEVICE</text>
<rect class="d-box" x="20" y="40" width="680" height="34" rx="6"/><text class="d-t" x="36" y="62">5 · The other device</text><text class="d-s" x="684" y="62" text-anchor="end">charged, in pairing mode, not paired elsewhere</text>
<rect class="d-box" x="20" y="80" width="680" height="34" rx="6"/><text class="d-t" x="36" y="102">4 · The pairing</text><text class="d-s" x="684" y="102" text-anchor="end">remove device, pair again</text>
<rect class="d-box" x="20" y="120" width="680" height="34" rx="6"/><text class="d-t" x="36" y="142">3 · Bluetooth Support Service</text><text class="d-s" x="684" y="142" text-anchor="end">runs in the background</text>
<rect class="d-box" x="20" y="160" width="680" height="34" rx="6"/><text class="d-t" x="36" y="182">2 · Adapter and driver</text><text class="d-s" x="684" y="182" text-anchor="end">Device Manager</text>
<rect class="d-box-g" x="20" y="200" width="680" height="34" rx="6"/><text class="d-t" x="36" y="222">1 · Switch and Airplane mode</text><text class="d-tg" x="684" y="222" text-anchor="end">check first – most common</text>`;

export default {
  slug: 'bluetooth-not-working-windows-11', kind: 'guide',
  short: 'Bluetooth not working (Windows 11)',
  kicker: 'Guide · Windows 11',
  title: 'Bluetooth Not Working on Windows 11: Fix It Step by Step',
  description: 'Bluetooth toggle missing or devices won’t pair in Windows 11? Check switch, adapter, service, pairing and the device itself – in that order, with undo notes.',
  h1: 'Bluetooth not working on Windows 11',
  cardText: 'Toggle gone, headphones won’t pair, mouse keeps dropping. Work up from the switch to the device – without driver tools.',
  chips: ['Windows 11', 'Bluetooth', 'Drivers'],
  lede: 'Bluetooth problems on Windows 11 come in three flavors: the Bluetooth switch is missing, a device won’t pair, or a paired device keeps disconnecting. Each has a different starting point, but all follow the same idea – check the layers from the bottom up.',
  applies: 'Windows 11 (Windows 10 paths shown in the switcher)',
  checked: 'Microsoft Support – Fix Bluetooth problems in Windows',
  versions: ['win11', 'win10'],
  sections: [
    { id: 'layers', h2: 'Think in layers, not in tips', html: `
<p>A Bluetooth connection depends on five things stacked on top of each other: the Bluetooth switch in Windows, the Bluetooth adapter in the PC with its driver, a Windows service that manages connections, the pairing record between the PC and the device, and the device itself – its battery and its pairing mode. Fixing a higher layer is pointless while a lower one is broken; a driver reinstall won’t help headphones that are still connected to your phone.</p>
<p>Start at the bottom. Most problems turn out to be layer 1 or layer 5, and both take a minute to check.</p>
${figure('bt-fig', 'Five layers of a Bluetooth connection on Windows, from switch to device', svg, 'Work from the bottom up. The cheapest checks – the switch and the device – are also the most common causes.', '0 0 720 245')}` },
    { id: 'symptoms', h2: 'Which symptom do you have?', html: `
${table('Bluetooth symptoms in Windows and where to start', ['Symptom', 'Likely layer', 'Start with'], [
  ['No Bluetooth button in Quick settings or Settings', 'Adapter / driver', 'Device Manager'],
  ['Bluetooth switch is there but won’t turn on', 'Adapter, driver or Airplane mode', 'Airplane mode, then restart'],
  ['Device doesn’t appear when adding', 'Device / pairing mode', 'Put the device in pairing mode'],
  ['Device paired, but no sound or no input', 'Pairing / audio output', 'Remove and pair again; choose output'],
  ['Device keeps disconnecting', 'Device battery, distance, power saving', 'Charge, move closer, power settings'],
  ['Worked yesterday, not today', 'Service or update', 'Restart the PC']
])}` },
    { id: 'basic', h2: 'Checks that change nothing', html: `
${step(1, { title: 'Check the Bluetooth switch and Airplane mode', time: 'about 1 min', body: `<p>Open ${mp({ win11: 'Quick settings (network, sound or battery icon on the taskbar) > Bluetooth tile', win10: 'Action center > Bluetooth tile' })} and make sure Bluetooth is on and Airplane mode is off. The same switch is in ${mp({ win11: 'Settings > Bluetooth & devices', win10: 'Settings > Devices > Bluetooth & other devices' })}.</p>` })}
${step(2, { title: 'Prepare the other device', time: 'about 2 min', body: `<p>Charge it. Put it in pairing mode – often by holding its power or Bluetooth button until a light flashes; the manual says how. Disconnect it from your phone or another computer first: many headphones connect to the last device they knew and ignore new ones.</p>` })}
${step(3, { title: 'Restart the PC', time: 'about 3 min', body: `<p>Use Restart from the Start menu, not Shut down. On many PCs, Shut down with Fast Startup doesn’t fully reset hardware, while Restart does.</p>` })}` },
    { id: 'pairing', h2: 'Fixing the pairing', html: `
${step(4, { risk: 'setting', title: 'Remove the device and pair it again', time: 'about 5 min', body: `<p>In ${mp({ win11: 'Settings > Bluetooth & devices > Devices', win10: 'Settings > Devices > Bluetooth & other devices' })}, select the device and choose Remove device. Put the device in pairing mode and add it again with ${mp({ win11: 'Settings > Bluetooth & devices > Add device > Bluetooth', win10: 'Settings > Devices > Add Bluetooth or other device > Bluetooth' })}.</p>`, undo: 'Pair it again with Add device; nothing else changes.' })}
${step(5, { risk: 'setting', title: 'Choose the right audio output', time: 'about 1 min', body: `<p>Headphones that connect but stay silent are often paired fine – Windows is simply sending sound elsewhere. Select them in ${mp({ win11: 'Quick settings > arrow next to the volume slider', win10: 'speaker icon on the taskbar > output list' })}.</p>`, undo: 'Select your previous output device.' })}` },
    { id: 'adapter', h2: 'When the Bluetooth switch is missing', html: `
${step(6, { risk: 'setting', title: 'Check the adapter in Device Manager', time: 'about 3 min', body: `<p>Right-click Start > Device Manager and expand Bluetooth. An adapter with a down-arrow is disabled – right-click > Enable device. A yellow warning sign means a driver problem. If there is no Bluetooth category at all, Windows doesn’t see the adapter; check whether your PC has Bluetooth (some desktops don’t) and whether it is switched off in the PC’s firmware settings.</p>`, undo: 'Disable the adapter again with the same right-click menu if needed.' })}
${step(7, { risk: 'admin', title: 'Check the Bluetooth Support Service', time: 'about 3 min', body: `<p>Search for “Services”, open it, find Bluetooth Support Service and check that it is running. If it is stopped, right-click > Start. Don’t change other services you don’t know.</p>`, undo: 'Stop the service again with right-click > Stop (normally not needed).' })}
${step(8, { risk: 'admin', title: 'Install the driver from the PC maker or Windows Update', time: 'about 15 min', body: `<p>Look in ${mp({ win11: 'Settings > Windows Update > Advanced options > Optional updates', win10: 'Settings > Update & Security > Windows Update > View optional updates' })}, or download the Bluetooth driver for your exact model from the PC or adapter maker’s official support site. Avoid driver updater tools.</p>`, undo: 'Device Manager > Bluetooth adapter > Properties > Driver > Roll Back Driver (when available).' })}` },
    { id: 'drops', h2: 'When a device keeps disconnecting', html: `
<p>Bluetooth is a short-range radio that shares the 2.4 GHz band with many Wi-Fi networks. Distance, a body or a metal desk between PC and device, and USB 3 ports or hubs very close to a small USB Bluetooth dongle can all cause dropouts. Move closer, keep a USB dongle away from other plugs (a short USB extension cable helps), and keep the device charged – many devices reduce their radio power when the battery is low.</p>
<p>Windows can also switch off devices to save power. In Device Manager, the adapter’s Properties may have a Power Management tab with “Allow the computer to turn off this device to save power”; unticking it is a reversible setting worth testing on laptops.</p>
${note('warn', 'No Bluetooth “fixer” downloads.', '<p>Everything on this page uses tools built into Windows or drivers from the PC maker. Download sites offering Bluetooth repair tools are unnecessary, and some bundle adware.</p>')}` }
  ],
  faq: [
    ['Why did the Bluetooth toggle disappear in Windows 11?', 'Windows shows the toggle only when it sees a working Bluetooth adapter. A disabled adapter, a driver problem or the adapter switched off in firmware makes it disappear. Device Manager shows which.'],
    ['My headphones are connected but there’s no sound. Why?', 'Windows is probably sending audio to another output. Choose the headphones in the output list next to the volume slider. If they offer two entries (for example “Headphones” and “Headset”), try the other.'],
    ['Should I uninstall the Bluetooth driver?', 'Only as a later step. Remove and re-pair the device first, then install a driver from Windows Update or the PC maker. Uninstalling without having the right driver at hand can leave you without Bluetooth.'],
    ['Why does my Bluetooth mouse lag?', 'Low battery, distance, interference from Wi-Fi or USB 3 devices, and power-saving settings. Charge it, move the receiver or PC closer, and test without power saving.'],
    ['Can I fix Bluetooth with a network reset?', 'Windows’ network reset targets network adapters and settings. For Bluetooth, removing and re-pairing devices and checking the adapter and driver are the relevant steps.']
  ],
  sourcesNote: 'Windows Bluetooth settings follow Microsoft Support’s Bluetooth troubleshooting pages.',
  sources: [
    ['Microsoft Support – Fix Bluetooth problems in Windows', 'https://support.microsoft.com/'],
    ['Microsoft Support – Pair a Bluetooth device in Windows', null],
    ['Bluetooth SIG – technology overview', 'https://www.bluetooth.com/']
  ],
  related: ['/guides/windows-update-stuck/', '/guides/which-windows-macos-version/', '/diagnose/laptop-wont-connect-wifi/', '/guides/tech-support-scams/']
};
