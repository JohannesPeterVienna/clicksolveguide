import { mp, step, table, figure, note } from '../lib.mjs';

const svg = `
<text class="d-s" x="20" y="22">ANATOMY OF A FAKE SECURITY POP-UP</text>
<rect class="d-box-r" x="20" y="36" width="440" height="190" rx="8"/>
<rect class="d-fill-r" x="20" y="36" width="440" height="30" rx="8"/>
<text class="d-w" x="36" y="56">⚠ SECURITY ALERT – SYSTEM INFECTED</text>
<text class="d-t" x="40" y="96">Your computer has been blocked.</text>
<text class="d-t" x="40" y="120">Do not restart. Call support now:</text>
<rect class="d-box" x="40" y="134" width="240" height="30" rx="4"/><text class="d-s" x="160" y="154" text-anchor="middle">(a phone number here)</text>
<text class="d-s" x="40" y="190">Full screen · alarm sound · countdown</text>
<text class="d-s" x="40" y="210">Fake logo of a well-known company</text>
<path class="d-line" d="M462 110 H500"/><text class="d-tr" x="510" y="114">1 · urgency and fear</text>
<path class="d-line" d="M282 149 H500"/><text class="d-tr" x="510" y="153">2 · a number to call</text>
<path class="d-line" d="M462 188 H500"/><text class="d-tr" x="510" y="192">3 · it’s just a web page</text>
<text class="d-s" x="510" y="222">close the tab or browser</text>`;

export default {
  slug: 'tech-support-scams', kind: 'guide',
  short: 'Tech support scams',
  kicker: 'Safety · everyone',
  title: 'Tech Support Scams: How to Spot Fake Pop-ups and Calls',
  description: 'How fake virus pop-ups, cold calls and “support” search ads work, how to close a pop-up that won’t go away, and what to do if you already let a scammer in.',
  h1: 'Tech support scams: how to spot fake pop-ups and phone numbers',
  cardText: 'Alarm pop-ups, cold calls, fake “support” numbers. How they work, how to close them, what to do if you already called.',
  chips: ['Safety', 'Pop-ups', 'Phone scams'],
  lede: 'Fake support is the most expensive mistake people make while trying to fix a computer. The pattern is always similar: an alarming message, a phone number or a call, remote access, and then a payment. Recognize the pattern and none of it works.',
  applies: 'Windows, macOS, iPhone, Android – any browser',
  checked: 'U.S. Federal Trade Commission consumer advice, Microsoft Support',
  sections: [
    { id: 'pattern', h2: 'How the scam works', html: `
<p>Tech support scams start in one of three ways. A web page suddenly fills the screen with a warning that your computer is infected or “blocked”, often with an alarm sound and a logo of a well-known company, and a phone number to call. Or someone calls you unexpectedly, claiming to be from a tech company or your internet provider, saying your computer is sending out errors. Or you search for help with a printer, an email account or a router and click an ad or result that leads to a “support” number that has nothing to do with the real company.</p>
<p>From there the script is the same: the “technician” asks you to install remote-access software, shows you harmless system logs as proof of an infection, and then asks for payment – often by gift card, wire transfer or cryptocurrency – for a repair, a “security license” or a support contract. Some also open your online banking and claim to have refunded too much money, asking you to send the difference back.</p>
${figure('scam-fig', 'Anatomy of a fake security pop-up: urgency, a phone number, and the fact that it is only a web page', svg, 'Three signs that give a fake alert away. Real security warnings from Microsoft, Apple or Google don’t ask you to call a number.', '0 0 720 235')}` },
    { id: 'signs', h2: 'Signs of a scam – and the real thing', html: `
${table('Fake support versus real support', ['Scam sign', 'What real companies do'], [
  ['A browser pop-up says your computer is infected and gives a phone number', 'Real security software reports threats in its own app, not as a web page with a number to call'],
  ['Someone calls you unexpectedly about “errors” on your computer', 'Tech companies don’t cold-call people about problems on their computer'],
  ['You are asked to install AnyDesk, TeamViewer or similar for a “check”', 'Legitimate remote support only happens when you started the contact through official channels'],
  ['Payment by gift card, wire transfer or cryptocurrency', 'No genuine company asks for gift cards as payment'],
  ['Pressure: “don’t restart”, “don’t hang up”, countdown timers', 'Real support doesn’t threaten you'],
  ['A “refund” that went in too high and must be sent back', 'This is a known script to make you send money yourself']
])}
<p>The U.S. Federal Trade Commission warns about exactly these patterns, and Microsoft states that its own error and warning messages never include phone numbers. A phone number in a pop-up is therefore a reliable sign that the message is fake.</p>` },
    { id: 'close', h2: 'How to close a fake pop-up', html: `
<p>A scam pop-up is just a web page, even when it looks like a system message. It can’t infect anything by itself being shown. Don’t click inside it – not even on “Close” or “Cancel” buttons drawn on the page – and don’t call.</p>
${step(1, { title: 'Close the tab or the browser', time: 'under 1 min', body: `<p>Press and hold Esc to leave full-screen mode, then close the tab. If the page blocks that, close the whole browser: ${mp({ win11: 'Ctrl + Shift + Esc > Task Manager > select the browser > End task', win10: 'Ctrl + Shift + Esc > Task Manager > select the browser > End task', macnew: 'Command + Option + Esc > select the browser > Force Quit', macold: 'Command + Option + Esc > select the browser > Force Quit', ios: 'swipe the browser away in the app switcher', android: 'Recent apps > swipe the browser away' })}.</p>` })}
${step(2, { title: 'Don’t restore the tabs', time: 'under 1 min', body: `<p>When you open the browser again, it may offer to restore the last session. Decline, or close the scam tab immediately before it loads fully.</p>` })}
${step(3, { risk: 'setting', title: 'Remove notification permission from unknown sites', time: 'about 3 min', body: `<p>Some fake alerts arrive as browser notifications after a site was allowed to send them. In Chrome, look under Settings > Privacy and security > Site settings > Notifications; in Safari on a Mac under Settings > Websites > Notifications. Remove sites you don’t recognise.</p>`, undo: 'Allow notifications again for a site you trust from the same settings page.' })}
${step(4, { title: 'Run the built-in security scan if you’re worried', time: '15 min or more', body: `<p>On Windows, Windows Security (Microsoft Defender) is built in – run a scan from ${mp({ win11: 'Start > Windows Security > Virus & threat protection > Quick scan', win10: 'Start > Windows Security > Virus & threat protection > Quick scan' })}. Macs have built-in protection that updates automatically. You don’t need to download anything the pop-up recommends.</p>` })}` },
    { id: 'already', h2: 'If you already called or let someone in', html: `
<p>It happens to careful people, and acting quickly limits the damage. Do these steps in this order:</p>
<ul><li><b>Hang up and disconnect.</b> End the call and disconnect the computer from the internet (Wi-Fi off or cable out) so the remote session ends.</li>
<li><b>Remove the remote-access program</b> they asked you to install, through Settings > Apps on Windows or by dragging it from Applications to the Trash on a Mac.</li>
<li><b>Call your bank or card company</b> using the number on your card or statement if you paid anything or opened online banking during the call. Ask them to block or dispute the payment.</li>
<li><b>Change passwords from another device</b> – email first, then banking and any account you signed in to while they were connected. Turn on two-step verification.</li>
<li><b>Scan the computer</b> with the built-in security tools. If they installed other programs, a reputable local repair shop can check it.</li>
<li><b>Report it.</b> In the U.S. at <a href="https://reportfraud.ftc.gov/" rel="noopener">ReportFraud.ftc.gov</a> and, for internet crime, at the FBI’s <a href="https://www.ic3.gov/" rel="noopener">IC3</a>; in the UK through the national fraud reporting service (Report Fraud, formerly Action Fraud; in Scotland, Police Scotland); elsewhere to your local police.</li></ul>
${note('stop', 'Watch out for “recovery” offers.', '<p>After a scam, victims are often contacted again by people offering to get the money back for a fee. That is a second scam. Real recovery goes through your bank and the police.</p>')}` },
    { id: 'real', h2: 'How to reach real support safely', html: `
<p>When you do need a manufacturer’s or provider’s help, start from something you already trust: the number on your contract, bill or receipt, the support section of the official app, or the company’s website reached by typing its address yourself. Be careful with search ads for “support” and “customer service”; scammers buy those too.</p>
<p>That is also why ClickSolve Guide never shows phone numbers, never offers remote access and never recommends “optimizer”, “driver updater” or “cleaner” tools. Our diagnoses produce a fix log you can hand to real support – nothing more is needed.</p>` }
  ],
  faq: [
    ['Is the remote-access software itself malware?', 'Programs like AnyDesk or TeamViewer are legitimate tools; scammers misuse them. The danger is who is connected, so uninstall any remote-access program a caller asked you to install.'],
    ['Can a pop-up infect my computer just by appearing?', 'A scam pop-up is a web page. Closing the tab or browser ends it. The danger comes from calling the number, installing what it suggests or entering data.'],
    ['Does Microsoft or Apple ever call me about a virus?', 'They don’t make unsolicited calls about problems on your computer. Treat any such call as a scam and hang up.'],
    ['I gave a scammer remote access. Is my computer ruined?', 'Not necessarily. Disconnect from the internet, remove the remote-access program, change passwords from another device, contact your bank if money was involved, and run a security scan.'],
    ['Why do they want gift cards?', 'Gift card codes are hard to trace and can be spent or resold quickly. No legitimate company asks for payment with gift cards.'],
    ['Where do I report a tech support scam?', 'In the U.S. at ReportFraud.ftc.gov and the FBI’s IC3; in the UK through the national fraud reporting service (Report Fraud, formerly Action Fraud) or Police Scotland; elsewhere with your national consumer authority or the police.']
  ],
  sourcesNote: 'Scam patterns and reporting routes follow the FTC’s consumer advice, the FBI’s IC3 and Microsoft’s guidance on support scams.',
  sources: [
    ['Federal Trade Commission – consumer advice on tech support scams', 'https://consumer.ftc.gov/'],
    ['Federal Trade Commission – ReportFraud.ftc.gov', 'https://reportfraud.ftc.gov/'],
    ['FBI Internet Crime Complaint Center (IC3)', 'https://www.ic3.gov/'],
    ['Microsoft Support – Protect yourself from tech support scams (support.microsoft.com/help/4013405)', 'https://support.microsoft.com/help/4013405'],
    ['UK national fraud reporting service (Report Fraud, formerly Action Fraud)', null]
  ],
  related: ['/diagnose/one-website-wont-load/', '/diagnose/printer-offline-windows-11/', '/guides/windows-update-stuck/', '/guides/which-windows-macos-version/']
};
