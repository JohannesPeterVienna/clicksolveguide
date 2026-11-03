import { mp, cmd, step, table, figure, note } from '../lib.mjs';

const svg = `
<text class="d-s" x="20" y="22">WHERE AN UPDATE CAN “STICK” – AND WHAT IS SAFE THERE</text>
<rect class="d-box-g" x="20" y="44" width="215" height="96" rx="8"/>
<text class="d-t" x="127" y="72" text-anchor="middle">In Settings</text>
<text class="d-s" x="127" y="94" text-anchor="middle">Downloading / Installing %</text>
<text class="d-tg" x="127" y="124" text-anchor="middle">SAFE TO USE THE PC</text>
<rect class="d-box-a" x="252" y="44" width="215" height="96" rx="8"/>
<text class="d-t" x="359" y="72" text-anchor="middle">During restart</text>
<text class="d-s" x="359" y="94" text-anchor="middle">“Working on updates”</text>
<text class="d-ta" x="359" y="124" text-anchor="middle">DON’T SWITCH OFF</text>
<rect class="d-box-r" x="484" y="44" width="216" height="96" rx="8"/>
<text class="d-t" x="592" y="72" text-anchor="middle">Error / rollback</text>
<text class="d-s" x="592" y="94" text-anchor="middle">“Undoing changes”</text>
<text class="d-tr" x="592" y="124" text-anchor="middle">LET IT FINISH</text>
<path class="d-line" d="M20 170 H700"/>
<path class="d-fill-g" d="M20 164 h220 v12 h-220z"/><path class="d-fill-a" d="M252 164 h215 v12 h-215z"/><path class="d-fill-r" d="M484 164 h216 v12 h-216z"/>
<text class="d-s" x="20" y="200">Rule of thumb on this site: judge “stuck” by the drive light and the screen together, not by the percentage alone.</text>`;

export default {
  slug: 'windows-update-stuck', kind: 'guide',
  short: 'Windows Update stuck',
  kicker: 'Guide · Windows 11 and 10',
  title: 'Windows Update Stuck: Safe Steps Before You Restart',
  description: 'Windows Update stuck at a percentage or on “Working on updates”? Know when it is safe to wait, restart or retry – and which steps to save for the very end.',
  h1: 'Windows Update stuck: safe steps before you restart',
  cardText: 'Stuck percentage or “Working on updates” for ages? When to wait, when it’s safe to restart, and what to leave alone.',
  chips: ['Windows 11', 'Windows 10', 'Updates'],
  lede: 'A Windows update that seems frozen is usually still working – and switching off at the wrong moment is the one thing that can turn a slow update into a broken installation. This guide separates the moments when waiting is right from the ones when a restart is safe.',
  applies: 'Windows 11, Windows 10',
  checked: 'Microsoft Support – Windows Update troubleshooting',
  versions: ['win11', 'win10'],
  sections: [
    { id: 'where', h2: 'Where exactly is it stuck?', html: `
<p>“Stuck” can mean three very different situations. If the update hangs in the Settings app – downloading or installing at some percentage while Windows runs normally – nothing critical is happening yet. You can keep working, restart normally, or retry. If the PC is in the middle of a restart, showing a blue screen with “Working on updates” and “Don’t turn off your PC”, Windows is replacing system files, and cutting the power can leave it unable to start. If the screen says it is undoing changes, Windows is rolling back a failed update – also a moment to wait.</p>
<p>Large updates can take a long time on older PCs, particularly those with a spinning hard disk instead of an SSD, and the percentage often stands still for long stretches while work continues underneath. The decision guide below helps you judge it.</p>
${figure('wu-fig', 'Three places where Windows Update can appear stuck and what is safe in each', svg, 'Only the first situation is a safe moment for a normal restart. In the other two, waiting is the right first step.', '0 0 720 210')}` },
    { id: 'judge', h2: 'Is it really stuck? A decision table', html: `
${table('Signs that an update is still working or truly stuck', ['What you see', 'Likely still working?', 'What to do'], [
  ['Percentage unchanged, drive activity light flickering', 'Yes', 'Wait; check again in an hour'],
  ['Percentage unchanged, fan audible, PC warm', 'Probably', 'Wait'],
  ['“Working on updates”, same screen for a long time', 'Often yes', 'Wait at least a few hours before considering a hard power-off'],
  ['Settings shows an error code', 'No – it stopped', 'Note the code, restart normally, retry'],
  ['Download stuck at 0 % for hours in Settings', 'No', 'Check internet and free space, restart, retry'],
  ['Same update fails again and again', 'No', 'Troubleshooter, free space, then last-resort steps']
])}
<p>Many laptops and PCs have a drive activity light; on others, Task Manager (Ctrl + Shift + Esc) shows disk and CPU activity while Windows is still usable. Activity means work is going on, even if the screen doesn’t move.</p>` },
    { id: 'safe', h2: 'Safe steps while Windows still runs', html: `
${step(1, { title: 'Check the internet connection and free space', time: 'about 5 min', body: `<p>A download that never moves often has no working connection – test a website. Updates also need free disk space; look at ${mp({ win11: 'Settings > System > Storage', win10: 'Settings > System > Storage' })}. If the system drive is nearly full, empty the Recycle Bin and remove large files you don’t need.</p>` })}
${step(2, { title: 'Restart normally and try again', time: 'about 15 min', body: `<p>When the update is stuck in Settings (not during a restart), a normal restart from the Start menu is safe. Then open ${mp({ win11: 'Settings > Windows Update > Check for updates', win10: 'Settings > Update & Security > Windows Update > Check for updates' })}.</p>` })}
${step(3, { title: 'Run Windows’ own troubleshooter', time: 'about 10 min', body: `<p>Windows includes an update troubleshooter. On Windows 11 it is under ${mp({ win11: 'Settings > System > Troubleshoot > Other troubleshooters > Windows Update', win10: 'Settings > Update & Security > Troubleshoot > Additional troubleshooters > Windows Update' })}; on newer builds Windows may open it in the Get Help app. It checks the update components and repairs what it can.</p>` })}
${step(4, { risk: 'setting', title: 'Pause updates for a short while', time: 'about 1 min', body: `<p>If you need the PC right now, pause updates in ${mp({ win11: 'Settings > Windows Update > Pause updates', win10: 'Settings > Update & Security > Windows Update > Pause updates for 7 days' })} and continue later, for example overnight on power.</p>`, undo: 'Click Resume updates on the same page.' })}` },
    { id: 'restart-screen', h2: 'If it hangs during the restart', html: `
<p>When the screen says “Working on updates” or “Don’t turn off your PC”, the safest course is patience. Keep a laptop plugged in. If you are unsure, leave it for several hours or overnight – a slow update finishing at 3 a.m. is better than a forced power-off in the middle of replacing system files.</p>
<p>If the screen has not changed for many hours and there is no drive activity at all, a hard power-off (holding the power button for about ten seconds) becomes the remaining option. Windows usually detects the interrupted update at the next start and rolls it back. If it doesn’t start properly, it typically offers Automatic Repair and the recovery options; Microsoft Support documents these in its recovery articles.</p>
${note('warn', 'Back up before big updates.', '<p>Large feature updates are the ones most likely to take long. A current backup of your personal files makes any outcome recoverable.</p>')}` },
    { id: 'lastresort', h2: 'Last resort: resetting the update cache', html: `
<p>If the same update keeps failing and the troubleshooter didn’t help, Windows’ download cache may be damaged. The documented fix is to stop the update services, rename the cache folder so Windows creates a fresh one, and start the services again. This needs a Command Prompt opened with “Run as administrator”. Run the lines one by one and read the answer after each:</p>
${cmd({ os: 'win', code: 'net stop wuauserv', shell: 'Command Prompt (Run as administrator)', what: 'stops the Windows Update service. Windows answers that the service was stopped – or that it is not started, which is fine too: then it was already stopped.', not: 'uninstall anything; Windows starts the service again later.', admin: true })}
${cmd({ os: 'win', code: 'net stop bits', shell: 'Command Prompt (Run as administrator)', what: 'stops the Background Intelligent Transfer Service, which downloads updates. Run it on its own line even if the first command said the service was not started – “is not started” here also just means it is already stopped.', not: 'uninstall anything; Windows starts the service again later.', admin: true })}
${cmd({ os: 'win', code: 'dir C:\\Windows\\SoftwareDistribution.old', shell: 'Command Prompt (Run as administrator)', what: 'checks whether a SoftwareDistribution.old folder is left over from an earlier attempt. “File Not Found” means you can go on. If the folder exists, the rename below would fail: delete that old folder first (rd /s /q C:\\Windows\\SoftwareDistribution.old) or rename the new one to SoftwareDistribution.old2 instead.', not: 'change anything – it only lists the folder.' })}
${cmd({ os: 'win', code: 'ren C:\\Windows\\SoftwareDistribution SoftwareDistribution.old', shell: 'Command Prompt (Run as administrator)', what: 'renames the update download folder, so Windows builds a new, empty one. Downloaded updates will be fetched again.', not: 'delete installed updates or your files. If it says access denied, a service is still running – run both stop commands again, or restart the PC and start again from the first line.', admin: true })}
${cmd({ os: 'win', code: 'net start bits', shell: 'Command Prompt (Run as administrator)', what: 'starts the download service again.', not: 'install updates by itself.', admin: true })}
${cmd({ os: 'win', code: 'net start wuauserv', shell: 'Command Prompt (Run as administrator)', what: 'starts the Windows Update service again.', not: 'install updates by itself – go to Windows Update and click Check for updates.', admin: true })}
<p>The commands are separate on purpose: chained with “&&”, the second one is skipped as soon as the first reports an error – and “service is not started” counts as one, so BITS would keep running.</p>
<p>To undo: once updates install again you can delete the SoftwareDistribution.old folder; if you want to reverse the change before that, stop the services, delete the new SoftwareDistribution folder and rename the .old folder back.</p>` },
    { id: 'avoid', h2: 'What to avoid', html: `
<p>Don’t install third-party “update fixers” or registry cleaners. Windows Update is repaired with Windows’ own tools, and fake fix tools are a common way to get malware. Don’t follow advice to delete random folders in C:\\Windows. And if a pop-up or a call claims your updates have failed and offers to fix them remotely for a fee, it is a scam – Microsoft doesn’t call people about updates. More in our <a href="/guides/tech-support-scams/">guide to tech support scams</a>.</p>
<p>Note on versions: Microsoft ended regular support for Windows 10 in October 2025. A Windows 10 PC that no longer receives security updates is worth upgrading or replacing; the <a href="/guides/which-windows-macos-version/">version guide</a> shows how to check what you have.</p>` }
  ],
  faq: [
    ['Does Windows Update need a lot of free space?', 'Feature updates need several gigabytes free on the system drive. Settings > System > Storage shows how much is free; Windows usually reports when there is not enough space.'],
    ['How long should I wait if Windows Update is stuck?', 'If the PC is restarting and shows “Working on updates”, give it several hours, or overnight, as long as there is drive activity. In the Settings app, a normal restart is safe if nothing moves for an hour or two.'],
    ['Can I turn off my PC during an update?', 'Avoid it while the screen says “Working on updates” or “Don’t turn off your PC”. Windows is replacing system files then. A hard power-off is a last resort after many hours without any activity.'],
    ['Is deleting the SoftwareDistribution folder safe?', 'Renaming it, with the update services stopped, is a documented repair step. It removes downloaded update files, not installed updates or your data, and Windows downloads what it needs again.'],
    ['Why does Windows Update keep failing?', 'Common reasons are too little free space, an unstable connection, a damaged download cache or a driver that conflicts with the update. Note the error code shown in Windows Update; it is the best search term on Microsoft’s support site.'],
    ['Does pausing updates leave me unprotected?', 'For a short time, yes – security fixes are delayed. Pause only as long as needed and resume updates as soon as you can.']
  ],
  sourcesNote: 'Steps follow Microsoft’s Windows Update troubleshooting documentation, including the documented reset of the update components.',
  sources: [
    ['Microsoft Support – Troubleshoot problems updating Windows', 'https://support.microsoft.com/'],
    ['Microsoft Learn – Windows Update troubleshooting and resetting Windows Update components', 'https://learn.microsoft.com/'],
    ['Microsoft – Windows 10 end of support information', null],
    ['Microsoft Learn – Windows commands: cmd (how && runs the next command only after success)', 'https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/cmd']
  ],
  related: ['/guides/which-windows-macos-version/', '/guides/tech-support-scams/', '/guides/bluetooth-not-working-windows-11/', '/diagnose/printer-offline-windows-11/']
};
