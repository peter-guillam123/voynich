import re, html, json, os, collections

HTML_DIR = "/private/tmp/claude-501/-Users-cjmoran-Desktop-Claude-projects-Work-Voynich/4090f11e-67f7-4121-8c05-58cd967bb748/scratchpad/html"
OUT = "/Users/cjmoran/Desktop/Claude projects/Work/Voynich/data/folios.json"

def text(s):
    t = re.sub(r'<BR\s*/?>', '\n', s, flags=re.I)
    t = re.sub(r'<[^>]+>', ' ', t)
    t = html.unescape(t)
    t = re.sub(r'[ \t\r]+', ' ', t)
    t = re.sub(r'\s*\n\s*', '\n', t)
    return t.strip()

def sentences(t):
    t = t.replace('\n', ' ')
    t = re.sub(r'\s+', ' ', t).strip()
    return [x.strip() for x in re.split(r'(?<=[.!?])\s+', t) if x.strip()]

SECTION_MAP = [
    (r'herbal page', 'herbal'),
    (r'astronomical page', 'astronomical'),
    (r'zodiac page', 'zodiac'),
    (r'cosmological page', 'cosmological'),
    (r'biological', 'biological'),
    (r'pharmaceutical page', 'pharmaceutical'),
    (r'recipes page', 'recipes'),
    (r'text-only', 'text'),
]
FOLDOUT_FOLIOS = {67, 68, 70, 72, 85, 86, 89, 90, 95, 101, 102}
BOILER = [
    r'For general information about [^.]*?see here\s*\.?',
    r'It has the folio (?:nr|number)\.? \(\d+\) in (?:the )?upper right corner\.?',
    r'\(\s*see also here\s*\)',
]

def clip(s, n=120):
    s = re.sub(r'\s+', ' ', s).strip()
    if len(s) <= n:
        return s
    cut = s[:n-1].rsplit(' ', 1)[0].rstrip(',;:')
    return cut + '…'

def folio_number(pid):
    m = re.match(r'f(\d+)', pid)
    return int(m.group(1)) if m else None

entries = []
problems = []

for q in range(1, 21):
    path = os.path.join(HTML_DIR, f"q{q:02d}.html")
    s = open(path, encoding='utf-8', errors='replace').read()
    if '<TH CLASS="Ph"' not in s:
        problems.append(f"q{q:02d}: no page blocks (404 / quire absent)")
        continue
    parts = re.split(r'<TH CLASS="Ph" ID="([^"]+)">', s)
    for i in range(1, len(parts), 2):
        pid = parts[i]
        body = parts[i+1]
        body = body.split('<TH CLASS="Fh"')[0]   # stop at next folio header

        g = re.search(r'<H4>(?:General description|Description)</H4>\s*<P>(.*?)</P>', body, re.S)
        gen = text(g.group(1)) if g else ''
        if not g:
            problems.append(f"{pid}: no general description block")
        gen_sents = sentences(gen)
        section_raw = gen_sents[0] if gen_sents else None
        section = None
        for pat, val in SECTION_MAP:
            if section_raw and re.search(pat, section_raw, re.I):
                section = val
                break
        if section is None:
            # fall back: scan the whole general description, then treat a page of text as 'text'
            for pat, val in SECTION_MAP:
                if re.search(pat, gen, re.I):
                    section = val
                    break
            if section is None and re.search(r'lines of text|text-only', gen, re.I):
                section = 'text'
            problems.append(f"{pid}: section mapped to '{section}' by fallback from '{clip(section_raw, 100)}'")

        il = re.search(r'<H4>Illustration\(s\)</H4>(.*?)<H4>', body, re.S)
        ill = text(il.group(1)) if il else ''
        ill = re.sub(r'Herbal drawing characterisation.*', '', ill, flags=re.S).strip()
        ill = re.sub(r'The fragments of herbs.*', '', ill, flags=re.S).strip()
        ill_sents = sentences(ill)

        # note: prefer the illustration description; else the general description minus boilerplate
        gen_clean = gen
        for b in BOILER:
            gen_clean = re.sub(b, '', gen_clean, flags=re.I)
        gen_clean_sents = sentences(gen_clean)
        if section == 'text' and len(gen_clean_sents) > 1:
            note = ' '.join(gen_clean_sents[1:3])
        elif ill_sents and ill_sents[0] not in ('', '\xa0'):
            note = ill_sents[0]
            if len(note) < 60 and len(ill_sents) > 1:
                note = note + ' ' + ill_sents[1]
        elif len(gen_clean_sents) > 1:
            note = ' '.join(gen_clean_sents[1:3])
        elif gen_clean_sents:
            note = gen_clean_sents[0]
        else:
            note = ''
        if pid == 'f116v':
            # last page; condensed from the site's own general description
            note = 'Last page: a few lines of text mixing apparent Latin, German and Voynichese, with small marginal drawings.'
        note = clip(note)

        lm = re.search(r'Currier language:\s*([^<\n]*)', body)
        lang_raw = lm.group(1).strip() if lm else None
        language = lang_raw if lang_raw in ('A', 'B') else None
        if lang_raw is None:
            problems.append(f"{pid}: no Currier language line")

        rz = re.search(r'RZ language:\s*([^<\n]*)', body)
        rz_raw = rz.group(1).strip() if rz else None

        hm = re.search(r'LFD hand:\s*([^<\n]*)', body)
        hand_raw = hm.group(1).strip() if hm else None
        hand = None
        if hand_raw is None:
            problems.append(f"{pid}: no LFD hand line")
        elif re.fullmatch(r'[1-5]', hand_raw):
            hand = int(hand_raw)
        else:
            m = re.match(r'([1-5])', hand_raw)
            hand = int(m.group(1)) if m else None
            problems.append(f"{pid}: LFD hand given as '{hand_raw}' (recorded hand={hand}, hand_raw kept)")

        fn = folio_number(pid)
        foldout = pid == 'fRos' or (fn in FOLDOUT_FOLIOS)

        e = collections.OrderedDict()
        e['folio'] = pid
        e['quire'] = q
        e['section'] = section
        e['language'] = language
        e['hand'] = hand
        e['foldout'] = foldout
        e['note'] = note
        if section_raw and (section is None or section not in (section_raw or '').lower() or section in ('text', 'biological', 'cosmological')):
            e['section_raw'] = clip(section_raw, 160)
        if hand_raw is not None and not re.fullmatch(r'[1-5]', hand_raw):
            e['hand_raw'] = hand_raw
        if lang_raw is not None and lang_raw not in ('A', 'B'):
            e['language_raw'] = lang_raw
        if rz_raw:
            e['rz_language'] = rz_raw
        entries.append(e)

# Missing folios, inserted in manuscript order
MISSING = {
    12: 2, 59: 8, 60: 8, 61: 8, 62: 8, 63: 8, 64: 8, 74: 12,
    91: 16, 92: 16, 97: 18, 98: 18, 109: 20, 110: 20,
}
def missing_entry(n, side, q):
    return collections.OrderedDict([
        ('folio', f'f{n}{side}'), ('quire', q), ('missing', True),
        ('section', None), ('language', None), ('hand', None), ('foldout', False),
        ('note', f'Folio {n} is missing from the manuscript.'),
    ])

def sort_key(e):
    pid = e['folio']
    if pid == 'fRos':
        return (86, 0, 0, 0)   # the Rosettes sheet sits between f85 and f86 panels
    m = re.match(r'f(\d+)([rv])(\d*)', pid)
    return (int(m.group(1)), 0 if m.group(2) == 'r' else 1, 0, 0)

# Insert missing entries after the last page of the preceding folio, preserving site order otherwise
final = []
present_nums = sorted({folio_number(e['folio']) for e in entries if folio_number(e['folio'])})
inserted = set()
for e in entries:
    final.append(e)
    fn = folio_number(e['folio'])
for n in sorted(MISSING):
    q = MISSING[n]
    # find index of the last entry with folio number < n
    idx = max(i for i, e in enumerate(final) if (folio_number(e['folio']) or 86) < n)
    final.insert(idx+1, missing_entry(n, 'r', q))
    final.insert(idx+2, missing_entry(n, 'v', q))

with open(OUT, 'w', encoding='utf-8') as f:
    json.dump(final, f, ensure_ascii=False, indent=1)

print("entries:", len(final))
print("pages described:", len(entries), "missing entries:", len(final)-len(entries))
print("sections:", collections.Counter(e['section'] for e in final))
print("language:", collections.Counter(e['language'] for e in final))
print("hand:", collections.Counter(e['hand'] for e in final))
print("foldout:", sum(1 for e in final if e['foldout']))
print("PROBLEMS:")
for p in problems: print("  ", p)
print("ORDER:", ' '.join(e['folio'] for e in final))
