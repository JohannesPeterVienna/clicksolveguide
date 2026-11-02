import { mp, cmd, table, figure, note } from '../lib.mjs';

const svg = `
<text class="d-s" x="20" y="22">HOW A DOCUMENT TRAVELS – AND WHERE “OFFLINE” COMES FROM</text>
<rect class="d-box" x="20" y="44" width="120" height="64" rx="8"/><text class="d-t" x="80" y="72" text-anchor="middle">App</text><text class="d-s" x="80" y="92" text-anchor="middle">Print…</text>
<path class="d-line" d="M142 76 H176"/>
<rect class="d-box-a" x="178" y="44" width="150" height="64" rx="8"/><text class="d-t" x="253" y="72" text-anchor="middle">Print queue</text><text class="d-s" x="253" y="92" text-anchor="middle">Spooler + driver</text>
<path class="d-line" d="M330 76 H364"/>
<rect class="d-box" x="366" y="44" width="150" height="64" rx="8"/><text class="d-t" x="441" y="72" text-anchor="middle">Router</text><text class="d-s" x="441" y="92" text-anchor="middle">printer’s IP address</text>
<path class="d-line" d="M518 76 H552"/>
<rect class="d-box" x="554" y="44" width="150" height="64" rx="8"/><text class="d-t" x="629" y="72" text-anchor="middle">Printer</text><text class="d-s" x="629" y="92" text-anchor="middle">awake, no error</text>
<path class="d-dash" d="M629 110 V150 H253 V110"/>
<text class="d-s" x="441" y="168" text-anchor="middle">Windows asks the printer for its status at the address it remembers.</text>
<text class="d-ta" x="441" y="196" text-anchor="middle">No answer from that address → “Offline”, wherever the break is.</text>`;

export default {
  slug: 'printer-offline-windows-11', kind: 'tool', tree: 'printer-offline-win',
  short: 'Printer offline (Windows 11)',
  kicker: 'Diagnosis · Windows 11 and 10',
  title: 'Printer Shows Offline in Windows 11: Step-by-Step Fix',
  description: 'Printer offline in Windows 11? Find out if the PC, the queue, the Wi-Fi, the router or the printer is to blame – safe steps with undo notes, no driver tools.',
  h1: 'Printer shows “Offline” in Windows 11: step by step',
  toolTitle: 'Printer offline – PC, network or printer?',
  cardText: 'Windows says offline, the printer looks fine. Find the link that broke – queue, Wi-Fi, router or printer.',
  chips: ['PC & queue', 'Connection', 'Router', 'Printer'],
  lede: '“Offline” in Windows means one thing only: the PC asked the printer for its status and got no answer. The printer may be asleep, on another network, at a new address – or Windows may simply be stuck. The diagnosis checks the cheap explanations first.',
  applies: 'Windows 11 (menu paths for Windows 10 included)',
  checked: 'Microsoft Support, printer makers’ support sites',
  versions: ['win11', 'win10'],
  sections: [
    { id: 'meaning', h2: 'What “offline” means to Windows', html: `
<p>Windows doesn’t see your printer the way you do. It remembers how it reached the printer last time – a USB port, or a network address – and asks the printer at that place for its status. If the reply doesn’t come, the printer is listed as offline. A printer can be switched on, with a full paper tray and a happy green light, and still be offline for Windows because it now has a different address on your network.</p>
<p>That is why the diagnosis begins at the printer itself and then works along the path: how is it connected, is it on the same network, can another device print to it? Each answer clears part of the chain. Only when the printer and network are proven to work does it turn to the PC’s queue, the Print Spooler and the driver.</p>
${figure('printer-fig', 'The path of a print job from app to printer, and Windows asking the printer for its status', svg, 'Windows marks a printer offline when its status question gets no answer – the break can be anywhere on the path.', '0 0 720 210')}` },
    { id: 'causes', h2: 'Why printers go offline so often', html: `
<p>Most network printers get their address from the router, just like phones and laptops. When the router restarts, after a power cut or a firmware update, it may hand the printer a different address. Windows still knocks on the old one. The same happens when the printer falls asleep deeply and wakes slowly, or when a new router comes with a new Wi-Fi name and the printer never joined it.</p>
${table('Common causes of a printer showing offline', ['Cause', 'Typical clue', 'Layer', 'Fix'], [
  ['Printer asleep or showing an error', 'Display shows jam, cover, ink, or is dark', 'Printer', 'Clear the error, wake it'],
  ['Printer on another Wi-Fi or none', 'Network report shows other name / no IP', 'Connection', 'Rejoin Wi-Fi from the printer'],
  ['New IP address after router restart', 'Phone prints, PC doesn’t; a “Copy 1” printer appears', 'Router / PC', 'Re-add printer, reserve address'],
  ['Stuck job in the queue', 'Queue shows an error job at the top', 'PC & queue', 'Cancel all jobs'],
  ['“Use Printer Offline” ticked', 'Queue window title says offline', 'PC & queue', 'Untick it'],
  ['Hung Print Spooler', 'Queue won’t empty, jobs won’t cancel', 'PC & queue', 'Restart the spooler'],
  ['Loose USB / hub', 'USB printer, intermittent', 'Connection', 'Direct port, other cable']
])}` },
    { id: 'other-device', h2: 'The one comparison that saves the most time', html: `
<p>Before touching any setting on the PC, try to print from a phone. An iPhone or iPad can use AirPrint from the Share menu; Android phones can print through the system print service or the printer maker’s plugin. If the phone prints, the printer, its Wi-Fi and the router are all fine – the problem is on the PC, and you can skip restarting the router or reconfiguring the printer. If the phone fails too, the PC is cleared and the network or the printer is the place to look.</p>
<p>This single test is the difference between ten minutes and an afternoon. It’s also the first thing a manufacturer’s support line will ask, so the fix log records the answer.</p>` },
    { id: 'pc', h2: 'Fixing the PC side: queue, copies, defaults', html: `
<p>Open the queue at ${mp({ win11: 'Settings > Bluetooth & devices > Printers & scanners > (your printer) > Open print queue', win10: 'Settings > Devices > Printers & scanners > (your printer) > Open queue' })} and cancel everything in it. One failed document at the top blocks all the others. If the queue window has a Printer menu, check that “Use Printer Offline” and “Pause Printing” are not ticked – both are easy to set by accident and survive restarts.</p>
<p>Next, look at the printer list itself. When a network printer changes address, Windows sometimes installs it a second time with “(Copy 1)” added to the name. The original entry stays offline forever while the copy works. Print to the working copy and remove the old one. If Windows keeps choosing a different default printer, turn off ${mp({ win11: 'Settings > Bluetooth & devices > Printers & scanners > Let Windows manage my default printer', win10: 'Settings > Devices > Printers & scanners > Let Windows manage my default printer' })} – with that option on, Windows picks the printer you used most recently at your current location.</p>` },
    { id: 'spooler', h2: 'Restarting the Print Spooler', html: `
<p>The Print Spooler is the Windows service that accepts documents from apps and feeds them to printers. When it hangs, jobs can’t be cancelled and every printer may show an error. Restarting it is safe – it doesn’t remove printers or drivers – but it needs administrator rights, and documents still waiting may be lost. The graphical way is the Services app: search for “Services”, find Print Spooler, right-click, Restart. The same in one line, in a Command Prompt opened with “Run as administrator”:</p>
${cmd({ os: 'win', code: 'net stop spooler && net start spooler', shell: 'Command Prompt (Run as administrator)', what: 'stops the print service and starts it again; the second part runs only if the stop succeeded.', not: 'delete printers, drivers or settings.', admin: true })}
<p>If the spooler stops again by itself shortly afterwards, a faulty printer driver is the usual reason. That is the point where reinstalling the driver from the printer maker makes sense – not before.</p>` },
    { id: 'address', h2: 'Stop it from happening again: a fixed address', html: `
<p>If the printer goes offline after every router restart, give it a fixed address. Most routers can reserve an IP address for a device – look in the router’s app or admin page for “DHCP reservation”, “address reservation” or an option like “always assign this IP address” in the device list. The printer keeps its address, and Windows always finds it where it expects it.</p>
<p>Some printers also allow a static address on the printer itself. The router reservation is usually the better choice, because the router then knows the address is taken and won’t give it to another device.</p>` },
    { id: 'safety', h2: 'Drivers and “printer support” – stay on official sites', html: `
<p>Search results for printer problems are a favorite target of fake support sites. They imitate printer brands, offer “driver downloads” or display a phone number, and the call ends with a request to install remote-access software and pay for a “repair”. Printer makers publish drivers and manuals on their own support sites, reachable by typing the brand’s address yourself.</p>
${note('warn', 'If a page asks you to call about your printer, close it.', '<p>Windows does not show phone numbers in printer error messages, and no printer needs a paid “activation” to come back online.</p>')}
<p>Windows Update also delivers many printer drivers automatically. A driver from the maker’s site is worth installing only when the printer works badly after re-adding it, or when the spooler keeps crashing.</p>` }
  ],
  faq: [
    ['Why does my printer say offline when it is on?', 'Windows reports offline when the printer doesn’t answer at the address Windows remembers. Most often the printer received a new IP address from the router, or it is on a different Wi-Fi network. The phone test in the diagnosis shows which.'],
    ['How do I turn off “Use Printer Offline” in Windows 11?', 'Open the print queue (Settings > Bluetooth & devices > Printers & scanners > your printer > Open print queue). If the window has a Printer menu, untick “Use Printer Offline” there.'],
    ['Is it safe to restart the Print Spooler?', 'Yes. It needs administrator rights and may discard documents that are still waiting, but it doesn’t remove printers, drivers or settings. Windows starts the service automatically after a restart anyway.'],
    ['Do I need a driver updater tool?', 'No. Drivers come from Windows Update or from the printer maker’s own support website. Driver updater tools are unnecessary and some are bundled with unwanted software.'],
    ['Why is there a “Copy 1” of my printer?', 'Windows installed the printer again after it appeared at a new address. Print to the copy that shows Ready, remove the offline one, and reserve the printer’s address in the router so it doesn’t happen again.']
  ],
  sources: [
    ['Microsoft Support – Fix printer connection and printing problems in Windows', 'https://support.microsoft.com/'],
    ['Microsoft Learn – Windows commands reference (net start, net stop)', 'https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/windows-commands'],
    ['HP – Why is my HP printer offline? (HP Tech Takes)', 'https://www.hp.com/us-en/tech-takes/printers/troubleshooting/why-is-my-hp-printer-offline.html'],
    ['Printer makers’ support sites (e.g. HP, Canon, Epson, Brother) – model-specific network setup', null]
  ],
  related: ['/diagnose/mac-printer-not-printing/', '/guides/restart-router-right-way/', '/guides/tech-support-scams/', '/guides/which-windows-macos-version/']
};
