import { mp, step, table, figure, note } from '../lib.mjs';

const svg = `
<text class="d-s" x="20" y="22">FIVE THINGS THAT SLOW A MAC – AND WHERE ACTIVITY MONITOR SHOWS THEM</text>
<rect class="d-box" x="20" y="40" width="128" height="120" rx="8"/><text class="d-t" x="84" y="70" text-anchor="middle">After</text><text class="d-t" x="84" y="90" text-anchor="middle">update</text><text class="d-s" x="84" y="122" text-anchor="middle">indexing,</text><text class="d-s" x="84" y="140" text-anchor="middle">photo analysis</text>
<rect class="d-box" x="160" y="40" width="128" height="120" rx="8"/><text class="d-t" x="224" y="70" text-anchor="middle">Storage</text><text class="d-t" x="224" y="90" text-anchor="middle">nearly full</text><text class="d-s" x="224" y="122" text-anchor="middle">Storage</text><text class="d-s" x="224" y="140" text-anchor="middle">settings</text>
<rect class="d-box" x="300" y="40" width="128" height="120" rx="8"/><text class="d-t" x="364" y="70" text-anchor="middle">One app</text><text class="d-t" x="364" y="90" text-anchor="middle">hogging CPU</text><text class="d-s" x="364" y="122" text-anchor="middle">CPU tab</text><text class="d-s" x="364" y="140" text-anchor="middle">% CPU column</text>
<rect class="d-box" x="440" y="40" width="128" height="120" rx="8"/><text class="d-t" x="504" y="70" text-anchor="middle">Memory</text><text class="d-t" x="504" y="90" text-anchor="middle">pressure</text><text class="d-s" x="504" y="122" text-anchor="middle">Memory tab</text><text class="d-s" x="504" y="140" text-anchor="middle">pressure graph</text>
<rect class="d-box" x="580" y="40" width="128" height="120" rx="8"/><text class="d-t" x="644" y="70" text-anchor="middle">Login</text><text class="d-t" x="644" y="90" text-anchor="middle">items</text><text class="d-s" x="644" y="122" text-anchor="middle">General ></text><text class="d-s" x="644" y="140" text-anchor="middle">Login Items</text>
<path class="d-fill-g" d="M20 176 h128 v8 h-128z"/><path class="d-fill-a" d="M160 176 h128 v8 h-128z"/><path class="d-fill-a" d="M300 176 h128 v8 h-128z"/><path class="d-fill-a" d="M440 176 h128 v8 h-128z"/><path class="d-fill-g" d="M580 176 h128 v8 h-128z"/>
<text class="d-s" x="20" y="210">Green: usually fixes itself or is harmless to change · amber: needs a decision from you</text>`;

export default {
  slug: 'mac-running-slow', kind: 'guide',
  short: 'Mac running slow',
  kicker: 'Guide · macOS',
  title: 'Mac Running Slow: Check These Five Things First',
  description: 'Mac slow after an update or for no clear reason? Check background indexing, storage, runaway apps, memory pressure and login items – no cleaner apps needed.',
  h1: 'Mac running slow: check these five things first',
  cardText: 'Spinning wheel, slow apps, loud fan. Five checks with Activity Monitor and System Settings – and why cleaner apps aren’t one of them.',
  chips: ['macOS', 'Activity Monitor', 'Storage'],
  lede: 'A slow Mac rarely needs a “cleaner” app. Most of the time one of five things is behind it, and macOS shows you which – in Activity Monitor and in the Storage settings. Check them in this order.',
  applies: 'macOS 13 Ventura and later; macOS 12 and earlier (paths noted)',
  checked: 'Apple Support – Mac User Guide, Activity Monitor User Guide',
  versions: ['macnew', 'macold'],
  sections: [
    { id: 'first', h2: 'Before you change anything', html: `
<p>“Slow” is vague, and the fix depends on what kind of slow you have. A Mac that crawls for a day after a major macOS update is doing scheduled background work and will recover by itself. A Mac that has slowed down gradually over months is more often short on storage or running too many things at login. A Mac that suddenly becomes hot and loud usually has one app or process working flat out.</p>
<p>The five checks below are ordered so that the ones that change nothing come first. Two built-in tools do most of the work: Activity Monitor, which shows what is using the processor, memory and disk right now, and the Storage settings, which show what fills the drive. Neither needs anything installed.</p>
${figure('mac-fig', 'Five common causes of a slow Mac and where to see each one', svg, 'Each cause leaves a trace you can see without extra software. Start with the left box if you just updated.', '0 0 720 220')}` },
    { id: 'overview', h2: 'The five checks at a glance', html: `
${table('Five causes of a slow Mac', ['Check', 'Where to look', 'Typical sign', 'What to do'], [
  ['1 · Recent update', 'Activity Monitor > CPU', 'Processes like mds or photoanalysisd busy', 'Keep the Mac on power and wait'],
  ['2 · Storage', 'Storage settings', 'Only a small share of the drive free', 'Delete or move large files'],
  ['3 · Runaway app', 'Activity Monitor > CPU, sort by % CPU', 'One app near the top for minutes', 'Quit or update that app'],
  ['4 · Memory pressure', 'Activity Monitor > Memory', 'Pressure graph yellow or red', 'Close apps, fewer browser tabs'],
  ['5 · Login items', 'Login Items settings', 'Many apps start with the Mac', 'Remove what you don’t need']
])}
<p>Open Activity Monitor from ${mp({ macnew: 'Finder > Applications > Utilities > Activity Monitor', macold: 'Finder > Applications > Utilities > Activity Monitor' })}, or with Spotlight (Command + Space, type “Activity”).</p>` },
    { id: 'update', h2: '1 · Just updated? Give it time', html: `
${step(1, { title: 'Look for indexing and analysis after an update', time: 'a few minutes to check', body: `<p>After a major update, macOS rebuilds its Spotlight search index and the Photos app may analyze your library again. In Activity Monitor’s CPU tab you may see processes such as <code>mds</code>, <code>mds_stores</code> or <code>photoanalysisd</code> near the top. This is expected work. Keep the Mac plugged in and awake for a while; it usually settles within hours to a day or so, depending on how many files and photos you have.</p>` })}` },
    { id: 'storage', h2: '2 · Storage nearly full', html: `
${step(2, { title: 'Check how much space is free', time: 'about 5 min', body: `<p>Open ${mp({ macnew: 'Apple menu > System Settings > General > Storage', macold: 'Apple menu > About This Mac > Storage > Manage…' })}. macOS needs free space for memory swap, caches and updates. When the drive is almost full, everything slows down and updates fail. The Storage page lists categories and recommendations, such as emptying the Trash automatically or storing files in iCloud.</p>` })}
${step(3, { risk: 'setting', title: 'Remove or move large files', time: '15 min or more', body: `<p>Sort documents by size and look at old downloads, video files and unused apps. Move what you want to keep to an external drive. Delete only what you recognise.</p>`, undo: 'Deleted files stay in the Trash until you empty it – restore them from there with Put Back.' })}` },
    { id: 'cpu', h2: '3 · One app working too hard', html: `
${step(4, { title: 'Sort Activity Monitor by % CPU', time: 'about 2 min', body: `<p>In the CPU tab, click the “% CPU” column so the busiest processes are at the top. A browser tab, a sync app or a game stuck at high values for minutes is the likely cause of heat, fan noise and sluggishness. In browsers, each tab may appear as a separate process; the browser’s own task manager shows which site it is.</p>` })}
${step(5, { risk: 'setting', title: 'Quit the app properly – or force quit if it hangs', time: 'about 1 min', body: `<p>Quit the app normally first (Command + Q) so it can save. If it doesn’t respond, use Apple menu > Force Quit. Don’t force quit processes you don’t recognise in Activity Monitor; many belong to macOS itself.</p>`, undo: 'Open the app again. Unsaved changes in a force-quit app may be lost.' })}` },
    { id: 'memory', h2: '4 · Memory pressure', html: `
${step(6, { title: 'Read the memory pressure graph', time: 'about 2 min', body: `<p>The Memory tab in Activity Monitor has a small graph at the bottom. Green means memory is fine. Yellow means macOS is compressing and swapping more; red means it is short of memory and the Mac will feel slow. The number of gigabytes “used” matters less than this color – macOS deliberately uses spare memory for caching.</p>` })}
<p>If the graph is often yellow or red, close apps you aren’t using and reduce open browser tabs. If it stays red with only your usual apps open, the Mac may simply have too little memory for your workload.</p>` },
    { id: 'login', h2: '5 · Too many login items', html: `
${step(7, { risk: 'setting', title: 'Review what starts with the Mac', time: 'about 5 min', body: `<p>Open ${mp({ macnew: 'System Settings > General > Login Items (called Login Items & Extensions in newer versions)', macold: 'System Preferences > Users & Groups > (your user) > Login Items' })}. Remove apps you don’t need at startup with the minus button. Below, newer macOS versions list background items you can switch off.</p>`, undo: 'Add the app again with the plus button, or switch its background item back on.' })}
${note('warn', 'Skip the cleaner apps.', '<p>“Mac cleaner” and “optimizer” apps promise speed but mostly delete caches that macOS rebuilds anyway – and some are adware. macOS’s own Storage settings and Activity Monitor cover everything on this page.</p>')}
<p>If the Mac is still slow after all five checks, restart it, install pending updates in ${mp({ macnew: 'System Settings > General > Software Update', macold: 'System Preferences > Software Update' })}, and contact Apple Support through its official website if problems remain.</p>` }
  ],
  faq: [
    ['Why is my Mac slow after a macOS update?', 'macOS rebuilds the Spotlight index and other background data after big updates, and Photos may reanalyze your library. Keep the Mac on power; it typically recovers by itself within hours to a day.'],
    ['How much free space does a Mac need?', 'Apple doesn’t publish one fixed number for everyday use. In practice, keep a comfortable margin free, and more before a major macOS update, which needs several gigabytes to install.'],
    ['Do I need a Mac cleaner app?', 'No. macOS manages caches itself, and Storage settings plus Activity Monitor show what you need. Some cleaner apps are classified as adware.'],
    ['Is a lot of “used” memory a problem?', 'Not by itself. Watch the memory pressure graph: green is fine even if most memory is used, because macOS uses free memory for caching.'],
    ['What is kernel_task using so much CPU?', 'On many Macs, kernel_task uses CPU time to keep the processor cooler when the Mac is hot. Make sure the vents aren’t blocked and the Mac isn’t lying on a soft surface.']
  ],
  sources: [
    ['Apple Support – Activity Monitor User Guide', 'https://support.apple.com/guide/activity-monitor/welcome/mac'],
    ['Apple Support – Mac User Guide: free up storage space', 'https://support.apple.com/'],
    ['Apple Support – Mac User Guide: open items automatically when you log in', null]
  ],
  related: ['/guides/which-windows-macos-version/', '/diagnose/mac-printer-not-printing/', '/guides/tech-support-scams/', '/guides/windows-update-stuck/']
};
