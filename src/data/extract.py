#!/usr/bin/env python3
"""ClickSolve Guide – turns the downloaded primary sources into the JSON files in src/data/.

Usage: python3 -I src/data/extract.py <dir with the downloaded files> src/data
The file names and their addresses are listed in SOURCES below (also written to sources.json).
Only identifiers and facts are taken over: code names, numbers, version names, dates, registry entries and key
combinations. Explanatory prose of the sources (code comments, Microsoft's and Apple's descriptions) is NOT copied;
the explanations on the pages are written by ClickSolve Guide (src/reference.mjs).
"""
import csv, html, json, re, sys, os

SRC, OUT = sys.argv[1], sys.argv[2]
RETRIEVED = '2026-11-18'
SOURCES = {
    'chrome': {'file': 'net_error_list.h', 'name': 'Chromium source code – net/base/net_error_list.h', 'url': 'https://chromium.googlesource.com/chromium/src/+/main/net/base/net_error_list.h', 'fetched': 'https://raw.githubusercontent.com/chromium/chromium/main/net/base/net_error_list.h', 'license': 'Copyright The Chromium Authors; BSD-style license', 'licenseUrl': 'https://chromium.googlesource.com/chromium/src/+/main/LICENSE'},
    'probe': {'file': 'net_error_info.h', 'name': 'Chromium source code – components/error_page/common/net_error_info.h', 'url': 'https://chromium.googlesource.com/chromium/src/+/main/components/error_page/common/net_error_info.h', 'license': 'Copyright The Chromium Authors; BSD-style license', 'licenseUrl': 'https://chromium.googlesource.com/chromium/src/+/main/LICENSE'},
    'http': {'file': 'http-status.csv', 'name': 'IANA – Hypertext Transfer Protocol (HTTP) Status Code Registry', 'url': 'https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml'},
    'ipv4': {'file': 'ipv4-special.csv', 'name': 'IANA – IPv4 Special-Purpose Address Registry', 'url': 'https://www.iana.org/assignments/iana-ipv4-special-registry/iana-ipv4-special-registry.xhtml'},
    'ipv6': {'file': 'ipv6-special.csv', 'name': 'IANA – IPv6 Special-Purpose Address Registry', 'url': 'https://www.iana.org/assignments/iana-ipv6-special-registry/iana-ipv6-special-registry.xhtml'},
    'ports': {'file': 'ports.csv', 'name': 'IANA – Service Name and Transport Protocol Port Number Registry', 'url': 'https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml'},
    'wu': {'file': 'wu-errors.html', 'name': 'Microsoft Learn – Windows Update error codes by component', 'url': 'https://learn.microsoft.com/en-us/windows/deployment/update/windows-update-error-reference'},
    'wucommon': {'file': 'wu-common.html', 'name': 'Microsoft Learn – Common Windows Update errors', 'url': 'https://learn.microsoft.com/en-us/troubleshoot/windows-client/installing-updates-features-roles/common-windows-update-errors'},
    'upgrade': {'file': 'upg-res.html', 'name': 'Microsoft Learn – Windows 10 upgrade resolution procedures', 'url': 'https://learn.microsoft.com/en-us/windows/deployment/upgrade/resolution-procedures'},
    'win11': {'file': 'win11-rel.html', 'name': 'Microsoft Learn – Windows 11 release information', 'url': 'https://learn.microsoft.com/en-us/windows/release-health/windows11-release-information'},
    'win10': {'file': 'win10-rel.html', 'name': 'Microsoft Learn – Windows 10 release information', 'url': 'https://learn.microsoft.com/en-us/windows/release-health/release-information'},
    'macos': {'file': 'apple-macos.html', 'name': 'Apple Support – Find out which macOS your Mac is using', 'url': 'https://support.apple.com/en-us/109033'},
    'winkeys': {'file': 'ms-shortcuts.html', 'name': 'Microsoft Support – Keyboard shortcuts in Windows', 'url': 'https://support.microsoft.com/en-us/windows/keyboard-shortcuts-in-windows-dcc61a57-8ff0-cffe-9796-cb9706c75eec'},
    'mackeys': {'file': 'apple-shortcuts.html', 'name': 'Apple Support – Mac keyboard shortcuts', 'url': 'https://support.apple.com/en-us/102650'},
}

def read(key):
    return open(os.path.join(SRC, SOURCES[key]['file']), encoding='utf-8', errors='replace').read()

def strip(x):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', '', x))).strip()

def tables(s):
    out = []
    for m in re.finditer(r'<table.*?</table>', s, re.S):
        rows = [[strip(c) for c in re.findall(r'<t[hd][^>]*>(.*?)</t[hd]>', r, re.S)] for r in re.findall(r'<tr.*?</tr>', m.group(0), re.S)]
        heads = re.findall(r'<h[23][^>]*>(.*?)</h[23]>', s[:m.start()], re.S)
        out.append((strip(heads[-1]) if heads else '', rows, m.start()))
    return out

def write(name, data):
    with open(os.path.join(OUT, name), 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
        f.write('\n')
    print(name, len(data) if isinstance(data, list) else '')

# ---- Chromium net errors ----
RANGES = [(0, 99, 'System'), (100, 199, 'Connection'), (200, 299, 'Certificate'), (300, 399, 'HTTP'), (400, 499, 'Cache'), (500, 599, 'Unnamed range'), (600, 699, 'FTP (obsolete)'), (700, 799, 'Certificate manager'), (800, 899, 'DNS resolver'), (900, 999, 'Blob')]
errs = []
for line in read('chrome').splitlines():
    m = re.match(r'NET_ERROR\((\w+),\s*(-\d+)\)', line.strip())
    if m:
        n = -int(m.group(2))
        errs.append({'name': 'ERR_' + m.group(1), 'code': int(m.group(2)), 'range': next((r[2] for r in RANGES if r[0] <= n <= r[1]), '')})
write('chrome-net-errors.json', errs)

# ---- Chrome DNS probe statuses (shown as the code on Chrome's DNS error page) ----
probe, on = [], False
for line in read('probe').splitlines():
    t = line.strip()
    if t.startswith('enum DnsProbeStatus'):
        on = True; continue
    if on and t.startswith('}'):
        break
    m = re.match(r'(DNS_PROBE_\w+),?$', t)
    if on and m and m.group(1) != 'DNS_PROBE_MAX':
        probe.append({'name': m.group(1)})
write('chrome-dns-probe.json', probe)

# ---- HTTP status codes ----
http = []
for r in csv.DictReader(read('http').splitlines()):
    if r['Description'] in ('Unassigned', '(Unused)') or '-' in r['Value']:
        continue
    http.append({'code': int(r['Value']), 'desc': r['Description'], 'ref': r['Reference'].strip('[]').replace('][', '; ')})
write('http-status.json', http)

# ---- IP special-purpose ranges ----
def special(key):
    out = []
    for r in csv.DictReader(read(key).splitlines()):
        clean = lambda v: re.sub(r'\s*\[\d+\]', '', v).strip()
        for block in clean(r['Address Block']).split(','):
            out.append({'block': block.strip(), 'name': clean(r['Name']).strip('"'), 'rfc': re.sub(r'[\[\]]', '', r['RFC']).replace('  ', ' '), 'global': clean(r['Globally Reachable']), 'forwardable': clean(r['Forwardable'])})
    return out
write('ip-special.json', {'v4': special('ipv4'), 'v6': special('ipv6')})

# ---- ports (selection; values as registered) ----
PORTS = [21, 22, 23, 25, 53, 67, 68, 80, 110, 123, 137, 138, 139, 143, 161, 443, 445, 465, 500, 515, 546, 547, 587, 631, 853, 993, 995, 1194, 1900, 3389, 3478, 3702, 4500, 5353, 5355, 8080, 9100]
SKIP_NAMES = {'www', 'www-http', 'urd', 'igmpv3lite', 'hp-pdl-datastr', 'turn', 'stun-behavior'}
ports = {}
for r in csv.reader(read('ports').splitlines()):
    if len(r) < 4 or not r[1].isdigit() or int(r[1]) not in PORTS or not r[0] or r[0] in SKIP_NAMES or r[2] not in ('tcp', 'udp'):
        continue
    k = (int(r[1]), r[0])
    p = ports.setdefault(k, {'port': int(r[1]), 'service': r[0], 'transport': [], 'desc': r[3], 'ref': ''})
    p['transport'].append(r[2])
    ref = re.sub(r'[\[\]]', '', r[8]) if len(r) > 8 else ''
    if ref.startswith('RFC') and not p['ref']:
        p['ref'] = ref
write('ports.json', sorted(ports.values(), key=lambda p: (p['port'], p['service'])))

# ---- Windows versions ----
def winver(key, product):
    s = read(key)
    out = []
    builds = dict(re.findall(r'Version ([0-9A-Za-z]+)(?: \(RTM\))? \(OS build (\d+)\)', strip(s)))
    current = {}
    for head, rows, _ in tables(s):
        if 'current versions' not in head:
            continue
        h = rows[0]
        for r in rows[1:]:
            d = dict(zip(h, r))
            ver = re.sub(r'(?<=H\d)\d$', '', d['Version'])  # footnote digit after e.g. 24H2
            m = re.search(r'\((\w+)\)', ver)
            short = m.group(1) if m else ver
            current.setdefault(short, []).append(d)
    for ver, build in builds.items():
        e = {'product': product, 'version': ver, 'build': int(build), 'rows': []}
        for d in current.get(ver, []):
            e['rows'].append({'servicing': d['Servicing option'], 'available': d['Availability date'],
                              'endHome': d.get('End of updates: Home, Pro, Pro Education, and Pro for Workstations') or d.get('Mainstream support end date'),
                              'endEnt': d.get('End of updates: Enterprise, Education, IoT Enterprise, and Enterprise multi-session') or d.get('Extended support end date'),
                              'latestBuild': d['Latest build'], 'latestDate': d['Latest revision date']})
        out.append(e)
    return out
write('windows-versions.json', winver('win11', 'Windows 11') + winver('win10', 'Windows 10'))

# ---- macOS versions ----
mac = [{'name': r[0], 'latest': r[1]} for r in tables(read('macos'))[0][1][1:]]
write('macos-versions.json', mac)

# ---- keyboard shortcuts (selection; descriptions as published) ----
WIN = ['Ctrl+Shift+Esc', 'Windows key+I', 'Windows key+X', 'Windows key+R', 'Windows key+Pause', 'Windows key+A', 'Windows key+Ctrl+Shift+B', 'Windows key+L', 'Windows key+Shift+S', 'Windows key+PrtScn', 'Windows key+K', 'Windows key+P', 'Windows key+E', 'Alt+F4', 'F5']
s = read('winkeys')
second = s.find('Copy, paste, and other general keyboard shortcuts')  # start of the Windows 10 tab
wrows = set()
for head, rows, pos in tables(s):
    if second > 0 and pos > second:
        continue
    for r in rows:
        if len(r) >= 2 and r[0] in WIN:
            wrows.add(r[0])
keys = [{'os': 'Windows 11', 'keys': k} for k in WIN if k in wrows]
MAC = ['Option-Command-Esc', 'Command–Space bar', 'Command-Q', 'Command-Comma (,)', 'Shift-Command-5', 'Control-Command-Q', 'Shift-Command-Q', 'Control–Command–Power button', 'Control–Power button', 'Shift-Command-U', 'Command-Tab', 'Command-P']
mrows = set()
for li in re.findall(r'<li[^>]*>(.*?)</li>', read('mackeys'), re.S):
    t = strip(li)
    for k in MAC:
        if t.startswith(k + ':'):
            mrows.add(k)
keys += [{'os': 'macOS', 'keys': k} for k in MAC if k in mrows]
missing = [k for k in WIN if k not in wrows] + [k for k in MAC if k not in mrows]
if missing:
    print('NOT FOUND in the sources (left out):', missing)
write('shortcuts.json', keys)

meta = {k: {x: v[x] for x in v if x != 'file'} for k, v in SOURCES.items()}
def pick(s, *pats):
    for p in pats:
        m = re.search(p, s)
        if m: return m.group(1)
    return ''
for k in ('wu', 'wucommon', 'upgrade', 'win11', 'win10', 'winkeys'):
    meta[k]['updated'] = pick(read(k), r'<meta name="updated_at" content="([^"T ]+)', r'<meta name="lastPublishedDate" content="([^" ]+)')
for k in ('macos', 'mackeys'):
    meta[k]['updated'] = pick(strip(read(k)), r'Published Date[^A-Za-z]*([A-Za-z]+ \d+, \d{4})')
for k in ('http', 'ipv4', 'ipv6', 'ports'):
    meta[k]['updated'] = ''
meta['_retrieved'] = RETRIEVED
write('sources.json', meta)

# ---- Windows Update errors: code, official name, where Microsoft documents it (no description text) ----
wu = []
for head, rows, _ in tables(read('wu')):
    if not rows or rows[0][:1] != ['Error code']:
        continue
    for r in rows[1:]:
        if len(r) >= 3 and re.match(r'0x[0-9A-Fa-f]{8}$', r[0]):
            wu.append({'code': '0x' + r[0][2:].upper(), 'name': r[1], 'src': 'wu'})
cs = read('wucommon')
for m in re.finditer(r'<h2 id="([^"]+)"[^>]*>((?:(?!</h2>).)*)</h2>\s*(<table.*?</table>)', cs, re.S):
    codes = re.findall(r'0[xX][0-9A-Fa-f]{8}', strip(m.group(2)))
    rows = [[strip(c) for c in re.findall(r'<t[hd][^>]*>(.*?)</t[hd]>', r, re.S)] for r in re.findall(r'<tr.*?</tr>', m.group(3), re.S)]
    if not codes or len(rows) < 2 or rows[0][:2] != ['Message', 'Description']:
        continue
    name = re.split(r'[;,]| - ', rows[1][0])[0].strip()
    if not re.match(r'^[A-Z][A-Z0-9_]+$', name):
        name = ''  # the source gives a sentence instead of an identifier
    for c in codes:
        wu.append({'code': '0x' + c[2:].upper(), 'name': name, 'src': 'wucommon', 'anchor': m.group(1)})
us = read('upgrade')
heads = [(m.start(), m.group(1)) for m in re.finditer(r'<h[23][^>]*id="([^"]+)"', us)]
seen = set()
for m in re.finditer(r'0x(?:C19[0-9A-Fa-f]{5}|80070070)', us):
    c = '0x' + m.group(0)[2:].upper()
    if c in seen:
        continue
    seen.add(c)
    anchor = [h[1] for h in heads if h[0] < m.start()]
    wu.append({'code': c, 'name': '', 'src': 'upgrade', 'anchor': anchor[-1] if anchor and not anchor[-1].startswith('ms--') else ''})
write('wu-errors.json', wu)
