import { mp, cmd, table, figure, note } from '../lib.mjs';

const svg = `
<text class="d-s" x="20" y="22">WHAT A BROWSER CAN – AND CAN’T – TELL A WEBSITE</text>
<rect class="d-box" x="20" y="40" width="330" height="150" rx="8"/>
<text class="d-t" x="185" y="66" text-anchor="middle">User-agent string</text>
<text class="d-s" x="40" y="94">Windows 10 and 11 → “Windows NT 10.0”</text>
<text class="d-s" x="40" y="116">Any recent macOS → “Mac OS X 10_15_7”</text>
<text class="d-s" x="40" y="138">iPad (desktop mode) → “Macintosh”</text>
<text class="d-tr" x="185" y="172" text-anchor="middle">FROZEN – NOT RELIABLE</text>
<rect class="d-box-g" x="370" y="40" width="330" height="150" rx="8"/>
<text class="d-t" x="535" y="66" text-anchor="middle">Client Hints (Chromium)</text>
<text class="d-s" x="390" y="94">platformVersion 13 or higher → Windows 11</text>
<text class="d-s" x="390" y="116">platformVersion 1 – 10 → Windows 10</text>
<text class="d-s" x="390" y="138">Safari / Firefox: not available</text>
<text class="d-tg" x="535" y="172" text-anchor="middle">HELPFUL ON WINDOWS ONLY</text>`;

export default {
  slug: 'which-windows-macos-version', kind: 'guide',
  short: 'Which Windows or macOS version?',
  kicker: 'Basics · every system',
  title: 'How to Tell Which Windows or macOS Version You Have',
  description: 'Find your exact Windows, macOS, iOS or Android version in seconds – with menu paths, winver and sw_vers – and learn why websites often guess it wrong.',
  h1: 'How to tell which Windows or macOS version you have',
  cardText: 'Windows 10 or 11? Ventura or Sonoma? Where to look on every system – and why your browser can’t always tell.',
  chips: ['Windows', 'macOS', 'iOS', 'Android'],
  lede: 'Menu paths, support articles and update advice all depend on your exact version. Here is where each system shows it, the two commands that answer it instantly, and what your browser reports right now.',
  applies: 'Windows 11, Windows 10, macOS, iPhone/iPad, Android',
  checked: 'Microsoft Support, Microsoft Learn, Apple Support, Android Help',
  versions: ['win11', 'win10', 'macnew', 'macold', 'ios', 'android'],
  sections: [
    { id: 'why', h2: 'Why the exact version matters', html: `
<p>Windows 11 moved many settings compared with Windows 10, and macOS replaced System Preferences with a redesigned System Settings in macOS 13 Ventura. A guide written for one version can send you looking for a button that doesn’t exist on the other. Support staff will also ask for your version early on, and whether a system still gets security updates depends on it.</p>
<p>The version has two parts worth noting: the name or number (Windows 11, macOS Sonoma, iOS 18) and, on Windows, the release such as 23H2 or 24H2 plus a build number. For most troubleshooting the first part is enough; for reporting a bug, give both.</p>
<div id="ua-report" class="note ua-report" hidden><p class="note-t">What your browser reports right now</p><dl></dl><p class="small">Read only in your browser; nothing is stored or sent.</p></div>` },
    { id: 'where', h2: 'Where each system shows its version', html: `
${table('Where to find the version on each system', ['System', 'Menu path', 'What you see'], [
  ['Windows 11', 'Settings > System > About', 'Edition (e.g. Windows 11 Home), Version (e.g. 24H2), OS build'],
  ['Windows 10', 'Settings > System > About', 'Edition (e.g. Windows 10 Pro), Version (e.g. 22H2), OS build'],
  ['macOS 13 or later', 'Apple menu > About This Mac', 'Name and number, e.g. macOS Sonoma 14.x'],
  ['macOS 12 or earlier', 'Apple menu > About This Mac', 'Name and number, e.g. macOS Monterey 12.x'],
  ['iPhone / iPad', 'Settings > General > About', 'iOS Version or iPadOS Version'],
  ['Android', 'Settings > About phone > Android version', 'Android version; Samsung: About phone > Software information']
])}
<p>The path for the system you selected above: ${mp({ win11: 'Settings > System > About (Windows specifications)', win10: 'Settings > System > About (Windows specifications)', macnew: 'Apple menu > About This Mac', macold: 'Apple menu > About This Mac', ios: 'Settings > General > About', android: 'Settings > About phone > Android version (Samsung: Settings > About phone > Software information)' })}.</p>
<p>For support requests, the hardware model is often just as useful as the system version. Windows shows the device name and processor on the same About page; the exact model is printed on a label underneath most laptops or in the PC maker’s own support app. On a Mac, About This Mac names the model and year, for example “MacBook Air (M2, 2022)”. iPhones list the model name under Settings > General > About. Note both – model and version – in the fix log of any diagnosis, and support can skip the first round of questions.</p>
<p>A quick visual hint for Windows: Windows 11 centers the Start button on the taskbar by default and uses rounded window corners; Windows 10 has Start at the far left. The taskbar can be moved, so treat that as a hint and confirm in Settings.</p>` },
    { id: 'browser', h2: 'Why websites often guess wrong', html: `
<p>Browsers send a “user-agent string” with every request, and many websites read the operating system from it. But browser makers froze parts of that string for privacy and compatibility. Windows 11 still reports itself as “Windows NT 10.0”, exactly like Windows 10. Safari and Chrome on current Macs report a fixed old macOS version number. An iPad asking for desktop pages pretends to be a Mac.</p>
<p>Chromium-based browsers such as Chrome and Edge offer a newer mechanism called User-Agent Client Hints. A site can ask for the “platform version”; on Windows, Microsoft documents that values of 13 and above mean Windows 11 and values from 1 to 10 mean Windows 10. That is what the box above uses when your browser supports it. ClickSolve Guide uses the same logic to suggest a version in its switchers – and always lets you correct it.</p>
${figure('ua-fig', 'Comparison of the frozen user-agent string and Client Hints for detecting the operating system version', svg, 'The classic user-agent string can’t tell Windows 10 from 11 or one macOS from another. Client Hints help on Windows in Chromium browsers.', '0 0 720 200')}` },
    { id: 'commands', h2: 'Two commands that answer it instantly', html: `
${cmd({ os: 'win', code: 'winver', what: 'opens a small “About Windows” window with the version (e.g. 24H2) and OS build. Type it into the Start menu search or the Run box (Windows key + R).', not: 'change anything or need administrator rights.' })}
${cmd({ os: 'mac', code: 'sw_vers', what: 'prints the product name, the macOS version number and the build in Terminal.', not: 'change anything or need a password.' })}
<p data-show-for="none" class="small">On iPhone, iPad and Android, use the About page in Settings shown above.</p>
<p>The macOS version number maps to a name: 13 is Ventura, 14 is Sonoma and 15 is Sequoia; macOS 12 is Monterey and 11 is Big Sur. Apple names each yearly release, and About This Mac shows both the name and the number.</p>` },
    { id: 'support', h2: 'Is your version still supported?', html: `
<p>Microsoft ended support for Windows 10 on October 14, 2025: after that date, regular Windows 10 installations no longer get security updates unless they are enrolled in Microsoft’s Extended Security Updates program for a limited time. Windows 11 versions are supported for a fixed period after release; Settings > Windows Update shows when a newer version is available.</p>
<p>Apple doesn’t publish fixed end dates for macOS, but in practice security updates focus on the current release and the previous ones. If Software Update no longer offers anything for your Mac, it may be too old for current macOS versions. For phones, the maker decides how long updates come – check the About page and the maker’s official support site.</p>
${note('warn', 'Pop-ups about “expired” systems can be fake.', '<p>Real update notices appear in Windows Update or Software Update, not as browser pop-ups with phone numbers. See our <a href="/guides/tech-support-scams/">scam guide</a>.</p>')}` }
  ],
  faq: [
    ['How do I know if I have Windows 10 or 11?', 'Open Settings > System > About, or type winver into the Start search. The edition line says Windows 10 or Windows 11.'],
    ['Why does a website think my Windows 11 PC is Windows 10?', 'Browsers report “Windows NT 10.0” for both. Only Chromium browsers can reveal the difference through Client Hints, and only when a site asks for it.'],
    ['What macOS version do I have?', 'Choose Apple menu > About This Mac. You see the name (such as Sonoma) and the version number. In Terminal, sw_vers prints the same.'],
    ['What do 23H2 and 24H2 mean?', 'They are Windows release names: the year (2023, 2024) and the half in which the release came out. Each release is supported for a set period.'],
    ['Is it safe to keep using Windows 10?', 'Without security updates, the risk grows over time. Microsoft ended regular support in October 2025; upgrading to Windows 11 (if the PC qualifies) or replacing the PC keeps you protected.']
  ],
  sources: [
    ['Microsoft Support – Which version of Windows operating system am I running?', 'https://support.microsoft.com/'],
    ['Microsoft Learn – Detect Windows 11 using User-Agent Client Hints (Microsoft Edge documentation)', 'https://learn.microsoft.com/'],
    ['Microsoft – Windows 10 end of support', null],
    ['Apple Support – Find out which macOS your Mac is using', 'https://support.apple.com/'],
    ['Android Help – Check and update your Android version', 'https://support.google.com/android/']
  ],
  related: ['/guides/windows-update-stuck/', '/guides/mac-running-slow/', '/guides/tech-support-scams/', '/guides/bluetooth-not-working-windows-11/']
};
