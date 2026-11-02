import { mp, table, figure, note } from '../lib.mjs';

const svg = `
<text class="d-s" x="20" y="22">WHAT THE QUEUE WINDOW TELLS YOU</text>
<rect class="d-box" x="20" y="40" width="680" height="44" rx="6"/>
<text class="d-t" x="40" y="68">Printer Queue</text><text class="d-s" x="680" y="68" text-anchor="end">status line ↑ read this first</text>
<rect class="d-box-a" x="20" y="100" width="215" height="110" rx="8"/>
<text class="d-ta" x="127" y="128" text-anchor="middle">“PAUSED” / ON HOLD</text>
<text class="d-s" x="127" y="156" text-anchor="middle">a job failed earlier</text>
<text class="d-s" x="127" y="178" text-anchor="middle">layer: Mac &amp; queue</text>
<text class="d-t" x="127" y="200" text-anchor="middle">→ Resume</text>
<rect class="d-box-a" x="252" y="100" width="215" height="110" rx="8"/>
<text class="d-ta" x="359" y="128" text-anchor="middle">NOT CONNECTED</text>
<text class="d-s" x="359" y="156" text-anchor="middle">Mac can’t reach it</text>
<text class="d-s" x="359" y="178" text-anchor="middle">layer: connection/router</text>
<text class="d-t" x="359" y="200" text-anchor="middle">→ network checks</text>
<rect class="d-box-a" x="484" y="100" width="216" height="110" rx="8"/>
<text class="d-ta" x="592" y="128" text-anchor="middle">JOBS VANISH</text>
<text class="d-s" x="592" y="156" text-anchor="middle">sent, but not printed</text>
<text class="d-s" x="592" y="178" text-anchor="middle">layer: printer</text>
<text class="d-t" x="592" y="200" text-anchor="middle">→ printer display</text>`;

export default {
  slug: 'mac-printer-not-printing', kind: 'tool', tree: 'mac-printer',
  short: 'Mac printer not printing',
  kicker: 'Diagnosis · macOS',
  title: 'Printer Not Printing From Mac: Guided Checks',
  description: 'Mac won’t print? Read the queue status, check the connection and compare with an iPhone – then fix the right layer, from a paused queue to resetting printing.',
  h1: 'Printer not printing from a Mac: guided checks',
  toolTitle: 'Mac won’t print – queue, connection or printer?',
  cardText: 'Paused queue, “not connected”, or jobs that vanish. The status line in the queue window is the first clue.',
  chips: ['Mac & queue', 'Connection', 'Router', 'Printer'],
  lede: 'On a Mac, the print queue window usually says what is wrong – if you know where to look. Paused, not connected, or jobs that disappear without printing: each points to a different layer. The diagnosis starts there and saves the printing-system reset for the very end.',
  applies: 'macOS 13 Ventura and later (System Settings); macOS 12 and earlier (System Preferences)',
  checked: 'Apple Support – Mac User Guide',
  versions: ['macnew', 'macold'],
  sections: [
    { id: 'status', h2: 'Start with the status line', html: `
<p>Every printer on a Mac has its own queue window. It opens automatically from the Dock while a job is printing, or from ${mp({ macnew: 'System Settings > Printers & Scanners > (your printer) > Printer Queue…', macold: 'System Preferences > Printers & Scanners > (your printer) > Open Print Queue…' })}. The line at the top of that window is the most useful piece of information you have: it reflects what macOS knows about the printer at that moment.</p>
<p>A paused queue is a Mac-side state – macOS stopped sending because an earlier job failed, and it waits for you. A “not connected” type of message means the Mac can’t reach the printer at all, so the connection, the router or the printer’s network settings are in question. Jobs that leave the queue but never come out on paper mean the Mac handed them over successfully – the problem is inside the printer.</p>
${figure('mac-fig', 'Three kinds of queue status on a Mac and the layer each points to', svg, 'The queue window’s status line splits the problem into Mac, network or printer before you change anything.', '0 0 720 220')}` },
    { id: 'paused', h2: 'Why macOS pauses printers', html: `
<p>When a job fails – the printer was off, out of paper or briefly unreachable – macOS pauses the printer’s queue so it doesn’t keep throwing documents at a printer that can’t take them. The catch: it stays paused after the printer is fine again. Many “my Mac won’t print” problems end with one click on Resume.</p>
<p>If the queue pauses again immediately, the job at the top is probably the problem. Delete it and print the document again. If even a fresh, simple document pauses the queue, the diagnosis moves on to the printer display and the network.</p>` },
    { id: 'compare', h2: 'The iPhone comparison', html: `
<p>If you have an iPhone or iPad on the same Wi-Fi, use it as a test instrument. Open a photo or web page, tap Share, then Print. AirPrint printers appear without any setup. If the iPhone prints, the printer and network work and the fault is in the Mac’s printer entry – removing and re-adding the printer usually fixes it. If the iPhone can’t find or use the printer either, the Mac is cleared and the printer’s Wi-Fi or the router comes next.</p>
${table('What each comparison result rules out', ['Result', 'Ruled out', 'Remaining suspects', 'Next step'], [
  ['iPhone prints, Mac doesn’t', 'Printer, Wi-Fi, router', 'Mac’s printer entry or driver', 'Remove and add the printer'],
  ['Neither prints', 'Mac', 'Printer, its Wi-Fi, router', 'Restart in order, check network report'],
  ['Mac prints after Resume', 'Connection, router, printer', '–', 'Done; watch for repeat pauses'],
  ['Jobs vanish, nothing prints', 'Connection, router', 'Printer', 'Printer display, error codes'],
  ['Driver or filter error', 'Connection, router, printer', 'Mac’s driver', 'Re-add with AirPrint or update']
])}` },
    { id: 'readd', h2: 'Removing and adding the printer the right way', html: `
<p>Removing a printer and adding it again makes the Mac discover it fresh at its current network address. In ${mp({ macnew: 'System Settings > Printers & Scanners', macold: 'System Preferences > Printers & Scanners' })}, select the printer and remove it (in newer versions with “Remove Printer…”, in older ones with the minus button). Then add it again (“Add Printer, Scanner or Fax…” or the plus button).</p>
<p>The add dialog has a menu labeled “Use”. For most current printers it offers AirPrint (sometimes as “Secure AirPrint”), which needs no extra software. For some models it also offers a driver from the maker. If printing fails with one choice, remove the printer and add it with the other. AirPrint is often the more reliable choice for everyday printing; a maker’s driver can unlock features such as special paper types.</p>
<p>Printer software for many models is delivered through ${mp({ macnew: 'System Settings > General > Software Update', macold: 'System Preferences > Software Update' })}. Install pending updates before you look for drivers elsewhere, and if you do need one, get it from the printer maker’s own support site.</p>` },
    { id: 'network', h2: 'When neither Mac nor iPhone can print', html: `
<p>Then the shared parts are left: the printer’s Wi-Fi and the router. Restart in a set order – printer off, router restart, wait for internet, printer on, Mac restart – so that the printer rejoins a router that is already running. If that doesn’t help, print the printer’s network configuration report from its control panel. It shows which network the printer is on and which address it has. A missing address or a different network name means the printer has to be reconnected from its own panel or the maker’s app.</p>
<p>If the printer disappears after every router restart, reserve its address in the router (often under “DHCP reservation” or “address reservation”). That is a router setting and can be removed again at any time.</p>` },
    { id: 'reset', h2: 'Reset printing system: the last resort', html: `
<p>macOS can reset its entire printing system: Control-click (or right-click) in the empty part of the printer list in Printers & Scanners and choose “Reset printing system”. It removes every printer, every waiting job and the saved printer presets. Afterwards you add each printer again. It can help when one printer stays broken even after removing and re-adding it, but it is never the first step – and on a shared Mac it affects every user’s printers.</p>
${note('warn', 'Before a reset, note what you have.', '<p>Write down each printer’s name and whether it was added as AirPrint or with a maker’s driver, so you can set them up the same way afterwards.</p>')}
<p>Stay clear of “printer fix” software and support numbers found through ads. Apple’s own documentation and the printer maker’s support site cover every step on this page.</p>` }
  ],
  faq: [
    ['Why does my Mac say the printer is paused?', 'macOS pauses a printer’s queue after a job fails, for example because the printer was off or out of paper. It stays paused until you click Resume in the queue window, even after the printer is fine again.'],
    ['What is AirPrint and do I need a driver?', 'AirPrint is Apple’s driverless printing standard, supported by most current printers. With AirPrint you don’t need extra software. Some printers also offer a model-specific driver, which you can choose when adding the printer.'],
    ['What does “Reset printing system” delete?', 'All printers, all waiting print jobs and printer presets on that Mac. It doesn’t delete documents. Afterwards you add your printers again.'],
  ],
  sourcesNote: 'All Mac settings on this page follow Apple’s Mac User Guide for Printers & Scanners.',
  sources: [
    ['Apple Support – Mac User Guide: Printers & Scanners settings, print queue and resetting the printing system', 'https://support.apple.com/'],
    ['Apple Support – About AirPrint', null],
    ['Printer makers’ support sites – network configuration report for your model', null]
  ],
  related: ['/diagnose/printer-offline-windows-11/', '/guides/mac-running-slow/', '/guides/which-windows-macos-version/', '/guides/restart-router-right-way/']
};
