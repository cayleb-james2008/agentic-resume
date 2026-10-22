"""Builds the static RHL site from src/data/*.json and src/home.html into the repo root.
Run: python3 src/build.py   (no dependencies)"""
import json, os, re
from html import escape as e

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
J = lambda n: json.load(open(os.path.join(ROOT, 'src/data', n), encoding='utf-8'))
PROJECTS, TEAM, LINES = J('projects.json'), J('team.json'), J('lines.json')
BY_ID = {p['id']: p for p in PROJECTS}
SITE = 'https://rhl-concept.vercel.app'
PHONE, FAX = '860.645.8700', '860.645.9100'

NAV = [('How we work', '/how-we-work'), ('Projects', '/projects'), ('Lines', '/lines'), ('Team', '/team'), ('About', '/about')]
CATS = [('k-12', 'K-12 schools'), ('private-schools', 'Private schools'), ('colleges-universities', 'Colleges'),
        ('libraries', 'Libraries'), ('auditoriums', 'Auditoriums'), ('athletic-facilities', 'Gyms and field houses'),
        ('corporate', 'Offices and civic')]
CAT = dict(CATS)
ARROW = '<svg viewBox="0 0 40 40" width="64" height="64" aria-hidden="true"><path d="M9 31 31 9M13 9h18v18" fill="none" stroke="currentColor" stroke-width="3.5"/></svg>'
TODO = '<span class="todo">Needs RHL input</span>'

def tel(n): return 'tel:+1' + re.sub(r'\D', '', n)
def plink(p): return f"/projects/{p['slug']}"

# brand matching between project credits and the line card
STRIP = r'\b(seating|furniture|international|america|athletics?|equipment|caseworks|contract)\b|\(nps\)'
def bkey(s):
    s = s.lower().replace('freshcoast', 'fresh coast')
    s = re.sub(STRIP, '', s); s = re.sub(r'\s+', ' ', s).strip()
    return {'vs': 'v/s', 'national public': 'national public'}.get(s, s)
USES = {}
for p in PROJECTS:
    for b, _ in p['products']:
        USES.setdefault(bkey(b), [])
        if p['id'] not in USES[bkey(b)]: USES[bkey(b)].append(p['id'])

def head(title, desc, path):
    full = f'{title} | Robert H. Lord Co.' if path != '/' else 'Robert H. Lord Co. | Furniture, design and installation'
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{e(full)} (website concept)</title>
<meta name="description" content="{e(desc)}">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#1F1C1D">
<meta property="og:title" content="{e(full)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:image" content="{SITE}/assets/img/showroom.jpg">
<meta property="og:url" content="{SITE}{path if path != '/' else ''}">
<link rel="icon" href="/assets/rhl-logo.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/archivo.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/site.css">
<script>document.documentElement.classList.add('js')</script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
'''

def bar(path):
    cur = lambda h: ' aria-current="page"' if path == h or path.startswith(h + '/') else ''
    links = ''.join(f'<a class="l" href="{h}"{cur(h)}>{t}</a>' for t, h in NAV)
    mlinks = ''.join(f'<a href="{h}"{cur(h)}>{t}</a>' for t, h in NAV + [('Contact', '/contact')])
    return f'''<header class="bar wrap">
  <a class="logo rise" style="--i:0" href="/"><img src="/assets/rhl-logo-light.svg" width="352" height="53" alt="Robert H. Lord Co., home"></a>
  <nav class="rise" style="--i:1" aria-label="Main">
    <div class="links">{links}</div>
    <a class="tel num" href="tel:+18606458700">{PHONE}</a>
    <a class="btn" href="/contact"{cur('/contact')}>Start a project</a>
    <button type="button" class="menu-btn" id="menu-btn" aria-expanded="false" aria-controls="menu" aria-label="Menu"><svg class="o" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M2 5h16M2 10h16M2 15h16" fill="none" stroke="currentColor" stroke-width="2"/></svg><svg class="x" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M2 2l14 14M16 2 2 16" fill="none" stroke="currentColor" stroke-width="2"/></svg></button>
  </nav>
</header>
<nav class="menu" id="menu" aria-label="Menu" hidden>{mlinks}<a class="tel" href="tel:+18606458700">Call {PHONE}</a></nav>
'''

def foot(path):
    cur = lambda h: ' aria-current="page"' if path == h else ''
    links = ''.join(f'<a href="{h}"{cur(h)}>{t}</a>' for t, h in NAV + [('Contact', '/contact')])
    return f'''<footer class="foot">
  <div class="f-st"><p>Robert H. Lord Co. provides furniture and architectural products for schools, campuses, libraries, offices and athletic facilities across New England.</p><p class="legal">&copy; 2026 Robert H. Lord Co. An Equal Opportunity Employer. Website concept.</p></div>
  <nav class="f-nav" aria-label="Footer">{links}</nav>
  <div class="f-place"><p>220 Chapel Road<br>Manchester, CT 06042</p></div>
  <div class="f-call"><a href="tel:+18606458700">{PHONE}</a><span class="num">Fax {FAX}</span></div>
  <div class="f-word"><img src="/assets/rhl-logo.svg" width="352" height="53" alt="Robert H. Lord Co."></div>
  <a class="f-go" href="/contact"><span>Start a project</span>{ARROW}</a>
</footer>
'''

DIALOG = '''<dialog class="room" id="room" aria-labelledby="room-name">
  <div class="room-in">
    <div class="room-media">
      <div class="stage" id="stage"></div>
      <div class="thumbs" id="thumbs" role="group" aria-label="Images of this project"></div>
    </div>
    <div class="room-text">
      <p class="count num" id="room-count"></p>
      <h2 id="room-name"></h2>
      <p class="where" id="room-where"></p>
      <p id="room-scope"></p>
      <dl id="room-dl"></dl>
      <p class="credit" id="room-credit"></p>
      <a class="link" id="room-url" href="/projects">See the full project</a>
      <div class="room-nav"><button type="button" id="room-prev">Previous</button><button type="button" id="room-next">Next</button></div>
    </div>
  </div>
  <button type="button" class="room-close" id="room-close" aria-label="Close"><svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M2 2l14 14M16 2 2 16" fill="none" stroke="currentColor" stroke-width="2"/></svg></button>
</dialog>
'''

def room(p, here=False):
    arch = next((v for k, v in p['credits'] if k.startswith('Architect')), '')
    return dict(name=p['name'], place=p['place'], scope=p['scope'], architect=arch, products=p['products'][:4],
                credit=p.get('photo_credit', ''), url=plink(p), here=here, photos=p['photos'],
                label='Image' if any(x['kind'] != 'photo' for x in p['photos']) else 'Photo')

def write(path, title, desc, body, data=None, dialog=False):
    html = head(title, desc, path) + bar(path) + f'<main id="main">\n{body}\n</main>\n' + foot(path)
    if dialog: html += DIALOG
    if data is not None: html += '<script type="application/json" id="data">' + json.dumps(data, ensure_ascii=False).replace('</', '<\\/') + '</script>\n'
    html += '<script src="/assets/site.js" defer></script>\n</body>\n</html>\n'
    out = os.path.join(ROOT, (path.strip('/') or 'index') + '.html')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, 'w', encoding='utf-8').write(html)
    return out

def img(src, w, h, alt='', lazy=True, cls=''):
    c = f' class="{cls}"' if cls else ''
    return f'<img{c} src="/{src}" width="{w}" height="{h}" alt="{e(alt)}"' + (' loading="lazy" decoding="async"' if lazy else '') + '>'

def cta(text='Have a project coming up?'):
    return f'''<section class="wrap contact" aria-labelledby="cta-h">
  <p class="st" data-reveal>Furnishing a school, a library or an office? Our showroom in Manchester is furnished with the lines we carry.</p>
  <figure class="ph" data-reveal style="--i:1">{img('assets/img/showroom.jpg', 1200, 800, 'Conference table and chairs in the RHL showroom, with the company logo on the screen')}<figcaption>Our showroom at 220 Chapel Road, Manchester</figcaption></figure>
  <div class="ask" data-reveal style="--i:2">
    <h2 id="cta-h">{text}</h2>
    <a class="btn" href="/contact">Start a project</a>
    <a class="tel" href="tel:+18606458700">{PHONE}</a>
    <p class="addr">220 Chapel Road<br>Manchester, CT 06042</p>
  </div>
</section>'''

# ---------------------------------------------------------------- home
def build_home():
    src = open(os.path.join(ROOT, 'src/home.html'), encoding='utf-8').read()
    concept = json.loads(open(os.path.join(ROOT, 'src/data/home-rooms.json'), encoding='utf-8').read())
    for pid, r in concept['rooms'].items():
        p = BY_ID[pid]; r.update(url=plink(p), credit=p.get('photo_credit', ''), here=False, label='Photo')
    # frames go to our own project pages
    src = re.sub(r'(<a class="frame[^"]*" href=")[^"]+(" data-p=")([^"]+)"', lambda m: m.group(1) + plink(BY_ID[m.group(3)]) + m.group(2) + m.group(3) + '"', src)
    # home filter tags follow the same rhlco categories as /projects
    TAG = {'k-12': 'k12', 'private-schools': 'independent', 'colleges-universities': 'college', 'libraries': 'library', 'corporate': 'office', 'auditoriums': 'gym', 'athletic-facilities': 'gym'}
    src = re.sub(r'data-p="([^"]+)" data-i="(\d+)" data-t="[^"]+"', lambda m: f'data-p="{m.group(1)}" data-i="{m.group(2)}" data-t="{" ".join(dict.fromkeys(TAG[c] for c in BY_ID[m.group(1)]["cats"]))}"', src)
    # chip counts and the photo count come from the frames themselves
    tags = re.findall(r'data-p="([^"]+)" data-i="\d+" data-t="([^"]+)"', src)
    def n(f): return len({p for p, t in tags if f == 'all' or f in t.split()})
    src = re.sub(r'(data-f="([a-z0-9]+)" aria-pressed="(?:true|false)">[^<]+<span class="n">)\d+', lambda m: m.group(1) + str(n(m.group(2))), src)
    src = re.sub(r'id="count" aria-live="polite">[^<]+', f'id="count" aria-live="polite">{n("all")} projects', src)
    # ledger: counts and "also in" from the project data
    def row(m):
        a, pid, b, name = m.group(1), m.group(2), m.group(3), m.group(4)
        keys = [bkey(x) for x in re.split(r' and ', name)]
        ids = [i for k in keys for i in USES.get(k, [])]; ids = list(dict.fromkeys(ids))
        also = ', '.join(BY_ID[i]['name'] for i in ids if i != pid)
        a = re.sub(r'data-also="[^"]*"', f'data-also="{e(also)}"', a)
        return f'{a}data-p="{pid}"{b}<span class="nm">{name}</span>' + m.group(5) + f'<span class="ct num">{len(ids)} project{"s" if len(ids) != 1 else ""}</span>'
    src = re.sub(r'(<button type="button" class="row" )data-p="([^"]+)"(.*?)<span class="nm">([^<]+)</span>(<span class="sp">[^<]*</span>)<span class="ct num">[^<]*</span>', row, src)
    first = re.search(r'class="row" data-p="[^"]+" data-i="\d+" data-prev="[^"]+" data-cap="[^"]+" data-also="([^"]*)"', src).group(1)
    brand = re.search(r'class="row"[^>]*>.*?<span class="nm">([^<]+)', src).group(1)
    src = re.sub(r'(<span class="also" id="pc-also">)[^<]*', lambda m: m.group(1) + (f'Also from {brand}: ' + first if first else ''), src)
    card = sum(l['card'] for l in LINES)
    src = src.replace('See all 36 projects', f'See all {len(PROJECTS)} projects').replace('All 161 lines', f'All {card} lines').replace('See all 161 lines', f'See all {card} lines').replace('line card has 161 lines', f'line card has {card} lines')
    src = src.replace('src="assets/', 'src="/assets/').replace('data-prev="assets/', 'data-prev="/assets/')
    write('/', 'Home', 'Robert H. Lord Co. provides furniture and architectural products across New England, with one account executive from start to finish, an in-house furniture crew and manufacturer-certified installers for architectural products.',
          src, data=concept, dialog=True)

# ---------------------------------------------------------------- projects
def build_projects():
    cnt = {c: sum(c in p['cats'] for p in PROJECTS) for c, _ in CATS}
    chips = f'<button type="button" class="chip" data-f="all" aria-pressed="true">All <span class="n">{len(PROJECTS)}</span></button>' + ''.join(
        f'<button type="button" class="chip" id="{c}" data-f="{c}" aria-pressed="false">{t} <span class="n">{cnt[c]}</span></button>' for c, t in CATS)
    order = sorted(PROJECTS, key=lambda p: (not p['home'], p['name']))
    cards = ''
    for p in order:
        c = p['cover']; flat = all(x['kind'] == 'product' for x in p['photos'])
        cards += (f'<a class="card" href="{plink(p)}" data-c="{" ".join(p["cats"])}"><span class="ci{" flat" if flat else ""}">'
                  f'{img(c["src"], c["w"], c["h"])}</span><b>{e(p["name"])}</b><span>{e(p["place"])}</span></a>\n')
    body = f'''<section class="wrap page-top" aria-labelledby="h1">
  <h1 id="h1" class="disp rise" style="--i:2">Our projects</h1>
  <p class="lead rise" style="--i:3">{len(PROJECTS)} schools, colleges, libraries, gyms and offices we have furnished across New England. Open any one to see what went in and who we worked with.</p>
  <div class="choose rise" style="--i:4" role="group" aria-label="Show projects for" id="pfilter">
    <span class="lbl">Show</span>{chips}
    <span class="count num" id="pcount" aria-live="polite">{len(PROJECTS)} projects</span>
  </div>
  <div class="pgrid" id="pgrid">
{cards}  </div>
</section>
{cta()}'''
    write('/projects', 'Projects', f'{len(PROJECTS)} projects by Robert H. Lord Co.: K-12 schools, private schools, colleges, libraries, auditoriums, gyms and offices across New England.', body)
    for i, p in enumerate(PROJECTS):
        build_project(p, PROJECTS[i - 1], PROJECTS[(i + 1) % len(PROJECTS)])

def build_project(p, prev, nxt):
    kinds = {x['kind'] for x in p['photos']}
    flat = kinds == {'product'}
    about = ''.join(f'<p>{e(t)}</p>' for t in p['about'])
    if not about:
        about = f'<p>{e(p["scope"])}</p>'
    dl = ''.join(f'<div><dt>{e(k)}</dt><dd>{e(v)}</dd></div>' for k, v in p['credits'])
    prods = ''.join(f'<dd><b>{e(b)}</b>' + (f' {e(i)}' if i else '') + '</dd>' for b, i in p['products'])
    kind_note = ''
    if 'board' in kinds or 'render' in kinds:
        kind_note = '<p class="kind">These are our renderings and design boards for the project, not photos of the finished rooms.</p>' if kinds <= {'board', 'render'} else '<p class="kind">Includes our renderings and design boards for the project.</p>'
    if flat:
        kind_note = '<p class="kind">Product images from the manufacturers for the furniture we supplied. Photos of the finished school are not on file yet.</p>'
    credit = f'<p class="muted">Photos: {e(p["photo_credit"])}</p>' if p.get('photo_credit') else ''
    c = p['cover']; ci = next((k for k, x in enumerate(p['photos']) if x['v'].split('/')[-1] == c['src'].split('/')[-1]), 0)
    hero = p['photos'][ci]
    thumbs = ''.join(f'<button type="button" data-open="{p["id"]}:{k}" aria-label="Open image {k + 1} of {len(p["photos"])}">{img(x["t"], 480, 320)}</button>' for k, x in enumerate(p['photos']))
    cats = ' / '.join(f'<a href="/projects#{c_}">{CAT[c_]}</a>' for c_ in p['cats'])
    scope = f'<div><dt>Scope</dt><dd>{e(p.get("scope_short", p["scope"]))}</dd></div>' if p['about'] else ''
    body = f'''<section class="wrap page-top" aria-labelledby="h1">
  <nav class="crumb rise" style="--i:2" aria-label="Breadcrumb"><a href="/projects">Projects</a> / {cats}</nav>
  <h1 id="h1" class="disp long rise" style="--i:2">{e(p["name"])}</h1>
  <p class="lead rise" style="--i:3">{e(p["place"])}</p>
  <div class="proj">
    <button type="button" class="proj-hero{' flat' if flat else ''}" data-open="{p['id']}:{ci}" aria-label="Open the images of {e(p['name'])}">{img(hero['v'], hero['w'], hero['h'], '', lazy=False)}</button>
    <div class="proj-text prose" data-reveal>{about}{kind_note}
      <div class="gallery{' flat' if flat else ''}" role="group" aria-label="All images">{thumbs}</div>
    </div>
    <div class="proj-side" data-reveal style="--i:1">
      <dl>{scope}{dl}<div><dt>What we supplied</dt>{prods}</div></dl>
      {credit}
      <p><a class="link" href="{p['source']}">This project on rhlco.com</a></p>
    </div>
  </div>
  <nav class="pn" aria-label="More projects"><a href="{plink(prev)}"><span>Previous project</span><b>{e(prev['name'])}</b></a><a class="nx" href="{plink(nxt)}"><span>Next project</span><b>{e(nxt['name'])}</b></a></nav>
</section>
{cta()}'''
    desc = f'{p["name"]}, {p["place"]}: {p.get("scope_short", p["scope"])} A Robert H. Lord Co. project.'
    write(plink(p), p['name'], desc, body, data={'rooms': {p['id']: room(p, here=True)}}, dialog=True)

# ---------------------------------------------------------------- team
GROUPS = [('exec', 'leadership', 'Leadership', ''),
          ('arch', 'architectural-products', 'Architectural products', 'Bleachers, stadium and auditorium seating, gym equipment and scoreboards. We are the exclusive New England dealer for Hussey Seating, Porter Athletic and All American Scoreboards, and this team is trained by those manufacturers.'),
          ('furn', 'furniture', 'Furniture', 'Classrooms, libraries, offices and common spaces, from the first layout to the final quote.'),
          ('install', 'installers', 'Installers', 'Our in-house install crew. They assemble and set the furniture we sell, so the people on site on install day work for RHL.')]
STATES = {'CT': 'Connecticut', 'MA': 'Massachusetts', 'RI': 'Rhode Island', 'ME': 'Maine', 'NH': 'New Hampshire', 'VT': 'Vermont'}
def areas(a):
    if not a: return ''
    return '; '.join(f'<b>{STATES[s]}</b>' + ('' if c == 'all' else ': ' + ', '.join(c)) for s, c in a.items())

def build_team():
    jump = ''.join(f'<a href="#{gid}">{t}</a>' for _, gid, t, _ in GROUPS) + '<a href="/contact#find">Find your account executive</a>'
    secs = ''
    for g, gid, title, blurb in GROUPS:
        cards = ''
        for p in [x for x in TEAM if x['group'] == g]:
            first = p['name'].split(' ')[0]
            ph = f'<a href="{tel(p["phone"])}">{p["phone"]}</a>' + (f' <span class="muted">or cell</span> <a href="{tel(p["cell"])}">{p["cell"]}</a>' if p.get('cell') else '')
            ar = f'<p class="area">Covers {areas(p["areas"])}' + (f'. Also {e(p["focus"].lower())}.' if p.get('focus') else '.') + '</p>' if p.get('areas') else ''
            msg = '' if g == 'install' else f'<p class="msg"><a class="link" href="/contact?to={p["slug"]}#message">Send {e(first)} a message</a></p>'
            bio = f'<details><summary>Read {e(first)}’s bio</summary><p>{e(p["bio"])}</p></details>' if p.get('bio') else ''
            cards += (f'<article class="person" id="{p["slug"]}">{img(p["photo"], p["size"], p["size"], "Portrait of " + p["name"])}'
                      f'<h3>{e(p["name"])}</h3><p class="t">{e(p["title"])}</p><p class="ph num">{ph}</p>{ar}{msg}{bio}</article>\n')
        blurb_html = f'<p>{e(blurb)}</p>' if blurb else ''
        secs += f'<section class="group" id="{gid}" aria-labelledby="{gid}-h"><h2 id="{gid}-h" data-reveal>{title}</h2>{blurb_html}<div class="people{" big" if g == "install" else ""}">\n{cards}</div></section>\n'
    body = f'''<section class="wrap page-top" aria-labelledby="h1">
  <h1 id="h1" class="disp rise" style="--i:2">Our team</h1>
  <p class="lead rise" style="--i:3">From the account executive who takes your first call to the crew that installs the furniture, these are the people who will work on your project.</p>
  <nav class="jump rise" style="--i:4" aria-label="Team sections">{jump}</nav>
</section>
<div class="wrap">
{secs}</div>
{cta('Want to talk to someone?')}'''
    write('/team', 'Our team', 'Meet the Robert H. Lord Co. team: leadership, account executives, project managers, estimators and the in-house furniture install crew.', body)

# ---------------------------------------------------------------- lines
def build_lines():
    card = [l for l in LINES if l['card']]
    mhec, clc = sum(l['mhec'] for l in LINES), sum(l['clc'] for l in LINES)
    items = ''
    for l in LINES:
        tags = [t for t, ok in (('mhec', l['mhec']), ('clc', l['clc']), ('card', l['card'])) if ok]
        used = USES.get(bkey(l['name']), [])
        note = []
        if l['mhec']: note.append('DAS / MHEC')
        if l['clc']: note.append('CLC')
        if not l['card']: note.append('contract list only')
        sub = ' · '.join(note)
        if used:
            sub += (' · ' if sub else '') + 'In ' + ', '.join(f'<a href="{plink(BY_ID[i])}">{e(BY_ID[i]["name"])}</a>' for i in used[:3]) + (f' and {len(used) - 3} more' if len(used) > 3 else '')
        items += f'<li data-c="{" ".join(tags)}">{e(l["name"])}{f"<span>{sub}</span>" if sub else ""}</li>\n'
    body = f'''<section class="wrap page-top" aria-labelledby="h1">
  <h1 id="h1" class="disp rise" style="--i:2">The lines we carry</h1>
  <p class="lead wide rise" style="--i:3">{len(card)} manufacturers on our line card, from classroom chairs to telescopic bleachers. Our published lists include {mhec} DAS / MHEC entries and {clc} Connecticut Library Consortium entries.</p>
</section>
<section id="contracts" class="paper-field" aria-labelledby="con-h">
  <div class="wrap con">
    <div class="con-head">
      <h2 id="con-h" class="head" data-reveal><span>Buy on</span> <span class="ind">contract</span></h2>
      <p data-reveal style="--i:1">Purchasing contracts let you buy at pre-determined discounts, and the bigger the order, the bigger the discount. If you qualify for the Connecticut State Contract or buy through MHEC, you get that pricing without going through the bid process.</p>
    </div>
    <div class="split" style="margin-top:56px">
      <div class="a prose" data-reveal>
        <p>A bid has costs people forget: preparing the bid package, answering questions, reviewing submissions and comparing products offered as “equals”. And the winning bid might not be the product you wanted, or the dealer you wanted to work with. Buying on contract avoids all of that.</p>
        <p>As of January 1, 2026, the Connecticut Department of Administrative Services (DAS) adopted the Massachusetts Higher Education Consortium (MHEC) cooperative purchasing agreement for office furniture and architectural products. Eligible Connecticut agencies and organizations can buy from contract-approved manufacturers at competitively negotiated prices. The contract runs through December 31, 2030.</p>
      </div>
      <div class="b" data-reveal style="--i:1">
        <table class="ct"><thead><tr><th scope="col">Contract</th><th scope="col" class="ref">Reference</th></tr></thead><tbody>
          <tr><td class="nm">Connecticut DAS / MHEC</td><td class="ref">MHEC MC13-C07<br>CT 25PSX0057</td></tr>
          <tr class="alt"><td class="nm">Connecticut Library Consortium</td><td class="ref">CLC F102</td></tr>
        </tbody></table>
        <div class="pdfs"><a class="link" href="https://rhlco.com/uploads/files/rhl-all-product-lines-july-2026.pdf">Full line card (PDF)</a><a class="link" href="https://rhlco.com/uploads/files/rhl-mhec-product-lines-1-1.pdf">MHEC / CT lines (PDF)</a><a class="link" href="https://rhlco.com/uploads/files/rhl-clc-product-lines.pdf">CLC lines (PDF)</a></div>
      </div>
    </div>
    <div class="excl" data-reveal>
      <h3>Exclusive New England dealer</h3>
      <ul><li><b>Hussey Seating</b><span>Telescopic bleachers, stadium and auditorium seating</span></li><li><b>Porter Athletic</b><span>Backboards, divider curtains, batting cages and gym equipment</span></li><li><b>All American Scoreboards</b><span>Scoreboards for gyms, field houses and outdoor facilities</span></li></ul>
    </div>
  </div>
</section>
<section class="wrap sec" aria-labelledby="all-h">
  <h2 id="all-h" class="head" data-reveal>Every line, A to Z</h2>
  <div class="lfilter" id="lfilter" role="group" aria-label="Filter lines">
    <button type="button" class="chip" data-f="all" aria-pressed="true">All <span class="n">{len(LINES)}</span></button>
    <button type="button" class="chip" data-f="mhec" aria-pressed="false">DAS / MHEC list <span class="n">{mhec}</span></button>
    <button type="button" class="chip" data-f="clc" aria-pressed="false">CLC list <span class="n">{clc}</span></button>
    <label class="sr" for="lsearch">Search lines</label><input class="lsearch" id="lsearch" type="search" placeholder="Search by name" autocomplete="off">
    <span class="count num" id="lcount" aria-live="polite">{len(LINES)} lines</span>
  </div>
  <p class="muted" style="margin-top:14px;max-width:62ch;font-size:var(--step-small)">The line card lists {len(card)} lines. Four more appear only on RHL's published DAS / MHEC list, for {len(LINES)} in all. Contract labels follow the lists on <a href="https://rhlco.com/manufacturers">rhlco.com</a>; ask your account executive to confirm coverage for your order.</p>
  <ul class="lgrid" id="lgrid">
{items}  </ul>
</section>
{cta()}'''
    write('/lines', 'Lines and contracts', f'The {len(card)} manufacturer lines Robert H. Lord Co. carries, the published DAS / MHEC and CLC lists, and how eligible buyers can purchase on contract.', body)

# ---------------------------------------------------------------- how we work
def build_how():
    install = [x for x in TEAM if x['group'] == 'install']
    faces = ''.join(f'<figure class="face">{img(p["photo"], p["size"], p["size"], "Portrait of " + p["name"])}<b>{e(p["name"])}</b><span>{e(p["title"])}</span></figure>' for p in install)
    m = BY_ID['malden']
    boards = ''.join(f'<a href="{plink(m)}" aria-label="Malden Police Department design image {k + 1}">{img(x["t"], 480, 320)}</a>' for k, x in enumerate(m['photos'][:8]))
    roles = [
        ('Account executive', 'One account executive is assigned to your project from start to finish. They learn what your project and your building need, give advice and recommendations, help you settle on a solution and put the plan in motion.',
         'At Crosskey Architects, after a burst pipe flooded the studio, our account executive assessed what had to be replaced, specified the new furniture and arranged the delivery and installation. <a href="/projects/crosskey-architects">See the project</a>',
         ('assets/img/l/crosskey-0.jpg', 1000, 667, 'Crosskey Architects studio with Tayco benching'), ''),
        ('Interior designers', 'Our on-staff interior designers have hands-on experience in architecture and design. They work alongside your architect and designer, or directly with you, on layouts, finishes and furniture.',
         'For the Rockville Public Library addition we did the interior design together with the library staff. <a href="/projects/rockville-public-library">See the project</a>',
         ('assets/img/r/2.jpg', 532, 666, 'RHL furniture plan for Westminster School, Cushing Hall: the dining floor plan with the chairs, tables and fabrics chosen for it', 'Furniture plan for Westminster School, Cushing Hall'), 'flat'),
        ('Estimators', 'Our estimators price budgets, bids, proposals and final quotes. They know the Connecticut State Contract, MHEC and the other purchasing contracts, so you get contract pricing where you qualify.',
         '<a href="/lines#contracts">How buying on contract works</a>',
         ('assets/img/v/malden-5.jpg', 1000, 667, 'RHL proposal board for the Malden Police Department with the desks, chairs and finishes for one room', 'Proposal board for the Malden Police Department'), 'flat'),
        ('Project managers', 'Project managers place every order promptly and accurately, and plan the logistics of each installation with you and our installers.',
         'At Middlebury College’s Virtue Field House they verified the construction dimensions, assisted with the shop drawing approvals, and provided oversight and coordination for the installation. <a href="/projects/middlebury-college-virtue-field-house">See the project</a>',
         ('assets/img/l/middlebury-0.jpg', 1000, 667, 'Overhead batting cages in Middlebury College Virtue Field House'), ''),
        ('Installers', 'Our in-house team of trained furniture installers assembles and sets the furniture we sell, efficiently and on time. Bleachers, seating and gym equipment go in with our manufacturer-certified installers. Our project managers work with clients and installers to plan the logistics of each installation.',
         '<a href="/team#installers">Meet the install crew</a>',
         ('assets/img/r/4.jpg', 534, 667, 'Installers and equipment on the floor of Harvard’s Lavietes Pavilion mid-project'), ''),
        ('Service team', 'Telescoping bleachers, overhead basketball backboards and operable partitions are large, heavy equipment that can pose a risk without regular inspection and maintenance. Our service team can inspect your equipment, perform maintenance and make needed repairs to help keep your team safe.',
         'Safety is the first and last word with this equipment.',
         ('assets/img/r/7.jpg', 534, 667, 'Telescopic bleachers at Biddeford High School printed with the school’s values'), ''),
    ]
    rows = ''
    for k, (h, d, proof, pic, flat) in enumerate(roles):
        src, w, hh, alt = pic[:4]; cap = f'<figcaption>{pic[4]}</figcaption>' if len(pic) > 4 else ''
        rid = 'service' if h == 'Service team' else re.sub(r'[^a-z]+', '-', h.lower()).strip('-')
        rows += (f'<li class="role" id="{rid}" data-reveal><h3>{h}</h3><div class="rd"><p>{d}</p><p class="proof">{proof}</p></div>'
                 f'<figure class="rp{" flat" if flat else ""}">{img(src, w, hh, alt)}{cap}</figure></li>\n')
    body = f'''<section class="wrap page-top" aria-labelledby="h1">
  <h1 id="h1" class="disp rise" style="--i:2">One company, start to finish</h1>
  <p class="lead wide rise" style="--i:3">We do more than sell furniture. Our team supports design, contract pricing, ordering and installation. Our in-house crew installs furniture, and manufacturer-certified installers handle architectural products. Our service team can inspect, maintain and repair architectural equipment.</p>
</section>
<section class="wrap sec roles" aria-labelledby="roles-h" style="padding-top:clamp(56px,6vw,96px)">
  <h2 id="roles-h" class="sr">Who works on your project</h2>
  <ol>
{rows}  </ol>
</section>
<section class="wrap sec" aria-labelledby="crew-h">
  <div class="crew">
    <div class="crew-text"><h2 id="crew-h" data-reveal>Our in-house furniture crew</h2><p data-reveal style="--i:1">The people who set your furniture on install day work for RHL. That is our head installer and our installers below.</p><a class="link" href="/team#installers" data-reveal style="--i:2">The whole team</a></div>
    <div class="faces" data-reveal>{faces}</div>
  </div>
</section>
<section class="wrap sec" aria-labelledby="boards-h">
  <div class="sec-head"><h2 id="boards-h" class="head" data-reveal>Design you can see first</h2><p data-reveal style="--i:1">Our renderings and proposal boards for the Malden Police Department: each room laid out with the desks, chairs and finishes we proposed.</p></div>
  <div class="boards" data-reveal>{boards}</div>
</section>
{cta()}'''
    write('/how-we-work', 'How we work', 'One company from start to finish: account executives, interior designers, estimators, project managers, an in-house furniture crew and a service team at Robert H. Lord Co.', body)

# ---------------------------------------------------------------- about
def build_about():
    rc = BY_ID['rhl-co']
    shots = ''.join(f'<a href="{plink(rc)}">{img(x["v"], x["w"], x["h"], "RHL showroom and offices in Manchester")}</a>' for x in [rc['photos'][2], rc['photos'][0], rc['photos'][1]])
    tl = [('1967', 'Robert “Bob” Lord founds The Robert H. Lord Company, focused on furniture for education.'),
          ('1983', 'John C. Lord joins as an account executive.'),
          ('1989', 'Peter Lord joins the company.'),
          ('1999', 'Rob Romay joins. Today he runs the Furniture Division.'),
          ('2000', 'John Lord becomes President. Peter Lord becomes Vice President.'),
          ('2003', 'Roy McNally joins to oversee the Architectural Products division.'),
          ('2014', 'We renovate our Manchester headquarters: an 8,000 sq ft showroom and open office.'),
          ('2023', 'Peter Lord becomes President & CEO.'),
          ('2026', 'Connecticut DAS adopts the MHEC purchasing contract. Our published list names 102 manufacturers.')]
    tlh = ''.join(f'<li><span class="y">{y}</span><span>{e(t)}</span></li>' for y, t in tl)
    markets = ['Higher education', 'K-12', 'Independent schools', 'Libraries', 'Corporate', 'Municipal', 'Athletic', 'Healthcare']
    body = f'''<section class="wrap page-top" aria-labelledby="h1">
  <h1 id="h1" class="disp rise" style="--i:2">Since 1967</h1>
  <p class="lead wide rise" style="--i:3">Bob Lord founded the company in 1967 to furnish schools. We still do, along with colleges, libraries, offices, town buildings, athletic facilities and healthcare buildings across New England.</p>
</section>
<section class="wrap sec" aria-labelledby="who-h" style="padding-top:clamp(56px,6vw,96px)">
  <div class="split">
    <figure class="a" data-reveal>{img('assets/img/about/peter-bob-john.jpg', 1000, 871, 'Peter, Bob and John Lord')}<figcaption>Peter, Bob and John Lord. Photo: J. Fiereck Photography</figcaption></figure>
    <div class="b prose" data-reveal style="--i:1">
      <h2 id="who-h" class="sr">Who we are</h2>
      <p>We work in partnership with your project team to create spaces that help your building, and the people in it, work better. We work closely with everyone involved so that each project, whatever its size, is cost-effective and successful.</p>
      <p>Classrooms and their furniture are not what they were 50 years ago. We keep up with how teaching and learning have changed, and we offer furniture that supports it. Our work with schools led us into public libraries, commercial offices and other specialized spaces.</p>
      <ul class="markets" aria-label="Markets we serve">{''.join(f'<li>{m}</li>' for m in markets)}</ul>
    </div>
  </div>
</section>
<section class="wrap sec" aria-labelledby="div-h">
  <div class="sec-head"><h2 id="div-h" class="head" data-reveal>Two divisions, one company</h2><p data-reveal style="--i:1">Each division has its own account executives, estimators and project managers. Both work the same way: one account executive stays on your project from start to finish.</p></div>
  <div class="divs">
    <div class="div" data-reveal><h3>Furniture</h3><p>Classrooms, libraries, offices, cafeterias and common spaces. Our on-staff interior designers support architects, designers and the people who will use the rooms, and our in-house installers set it all up.</p><p class="who">Led by <a href="/team#rob-romay">Rob Romay</a>, Vice President of Furniture, Fixtures & Equipment</p></div>
    <div class="div" data-reveal style="--i:1"><h3>Architectural products</h3><p>Telescopic bleachers, stadium and auditorium seating, basketball backboards, divider curtains, batting cages and scoreboards. We are the exclusive New England dealer for Hussey Seating, Porter Athletic and All American Scoreboards, and our team is trained by those manufacturers.</p><p class="who">Led by <a href="/team#roy-mcnally">Roy McNally</a>, Vice President of Operations & Architectural Products</p></div>
  </div>
</section>
<section class="wrap sec" id="showroom" aria-labelledby="show-h">
  <div class="sec-head"><h2 id="show-h" class="head" data-reveal>Our showroom</h2><p data-reveal style="--i:1">In 2014 we renovated our headquarters at 220 Chapel Road in Manchester. We designed it and acted as our own general contractor. The 8,000 sq ft showroom and open office are furnished with lines we carry.</p></div>
  <div class="shots" data-reveal>{shots}</div>
  <div class="todo-box" style="margin-top:24px" data-reveal><p>{TODO}Confirm showroom hours and whether visits are walk-in or by appointment.</p></div>
</section>
<section class="wrap sec" aria-labelledby="tl-h">
  <div class="split">
    <div class="a"><h2 id="tl-h" class="head" data-reveal>Along the way</h2></div>
    <ol class="b tl" data-reveal>{tlh}</ol>
  </div>
</section>
<section class="wrap sec" aria-labelledby="jobs-h">
  <div class="split">
    <div class="a"><h2 id="jobs-h" class="head" data-reveal>Working here</h2></div>
    <div class="b prose" data-reveal><p>Robert H. Lord Co. is an Equal Opportunity Employer.</p><div class="todo-box" style="margin-top:16px"><p>{TODO}Confirm current openings and how to apply.</p></div></div>
  </div>
</section>
{cta()}'''
    write('/about', 'About us', 'Robert H. Lord Co. was founded in 1967 by Robert “Bob” Lord. Two divisions, furniture and architectural products, an 8,000 sq ft showroom in Manchester, CT, and an in-house furniture crew.', body)

# ---------------------------------------------------------------- contact
def build_contact():
    reps = [dict(slug=p['slug'], name=p['name'], phone=p['phone'], photo=p['photo'], div=p['group'], areas=p['areas'])
            for p in TEAM if p.get('areas')]
    counties = {'CT': ['Fairfield', 'Hartford', 'Litchfield', 'Middlesex', 'New Haven', 'New London', 'Tolland', 'Windham'],
                'MA': ['Barnstable', 'Berkshire', 'Bristol', 'Dukes', 'Essex', 'Franklin', 'Hampden', 'Hampshire', 'Middlesex', 'Nantucket', 'Norfolk', 'Plymouth', 'Suffolk', 'Worcester']}
    opts = ''.join(f'<option value="{k}">{v}</option>' for k, v in STATES.items())
    to = ''.join(f'<option value="{p["slug"]}">{e(p["name"])}, {e(p["title"])}</option>' for p in TEAM if p['group'] != 'install')
    body = f'''<section class="wrap page-top" aria-labelledby="h1">
  <h1 id="h1" class="disp rise" style="--i:2">Start a project</h1>
  <p class="lead wide rise" style="--i:3">Call us or find the account executive for your area.</p>
  <div class="cgrid">
    <div class="call rise" style="--i:4">
      <a class="tel" href="tel:+18606458700">{PHONE}</a>
      <p class="fax num">Fax {FAX}</p>
      <address>The Robert H. Lord Company<br>220 Chapel Road<br>Manchester, CT 06042</address>
      <a class="link" href="https://www.google.com/maps/search/?api=1&amp;query=220+Chapel+Road+Manchester+CT+06042">Get directions</a>
      <p class="muted" style="font-size:var(--step-small)">{TODO}Office and showroom hours</p>
    </div>
    <figure class="rise" style="--i:5">{img(BY_ID['rhl-co']['photos'][2]['v'], BY_ID['rhl-co']['photos'][2]['w'], BY_ID['rhl-co']['photos'][2]['h'], 'Lounge chairs around a low table in the RHL showroom', lazy=False)}<figcaption>Our showroom in Manchester</figcaption></figure>
  </div>
</section>
<section class="wrap sec" id="find" aria-labelledby="find-h">
  <div class="finder">
    <div class="fh"><h2 id="find-h">Find your account executive</h2><p>Most of New England has one account executive for furniture and one for bleachers, seating and gym equipment. Pick where your building is.</p><noscript><p><a href="/team">See every account executive and the areas they cover</a></p></noscript></div>
    <div class="fc" id="finder">
      <div class="pick">
        <div class="field"><label for="f-state">State</label><select id="f-state"><option value="">Choose a state</option>{opts}</select></div>
        <div class="field" id="f-county-wrap" hidden><label for="f-county">County</label><select id="f-county"></select></div>
      </div>
      <div class="reps" id="f-out" aria-live="polite"></div>
    </div>
  </div>
</section>
<section class="wrap sec" id="message" aria-labelledby="msg-h">
  <div class="cform">
    <div class="fh"><h2 id="msg-h">Send a message</h2><p class="muted">Tell us about the building and the rooms, and when you need them ready.</p><div class="todo-box"><p>{TODO}This demo form doesn’t send messages. Use <a href="https://rhlco.com/contact/general-inquiries-form">RHL’s official general inquiries form</a> or call {PHONE}. Confirm the destination before connecting this form.</p></div></div>
    <form id="cform" novalidate>
      <div class="field full"><label for="c-to">Send to</label><select id="c-to" name="to"><option value="general">General inquiry</option>{to}</select></div>
      <div class="field"><label for="c-name">Name <span class="req">(required)</span></label><input id="c-name" name="name" autocomplete="name" required></div>
      <div class="field"><label for="c-org">Organization <span class="req">(required)</span></label><input id="c-org" name="org" autocomplete="organization" required></div>
      <div class="field"><label for="c-email">Email <span class="req">(required)</span></label><input id="c-email" name="email" type="email" autocomplete="email" required></div>
      <div class="field"><label for="c-phone">Phone</label><input id="c-phone" name="phone" type="tel" autocomplete="tel"></div>
      <div class="field full"><label for="c-msg">Message <span class="req">(required)</span></label><textarea id="c-msg" name="message" required></textarea></div>
      <div class="full"><button class="btn" type="submit">Send message</button></div>
      <p class="sent" id="c-sent" tabindex="-1" hidden role="status">This is a demo, so nothing was sent. To reach RHL today, call {PHONE}.</p>
    </form>
  </div>
</section>'''
    write('/contact', 'Contact', 'Call Robert H. Lord Co. at 860.645.8700, visit the showroom at 220 Chapel Road in Manchester, CT, or find the account executive for your area.', body,
          data={'reps': {'people': reps, 'counties': counties}})

def build_404():
    body = f'''<section class="wrap page-top" aria-labelledby="h1" style="padding-bottom:var(--sec)">
  <h1 id="h1" class="disp">Page not found</h1>
  <p class="lead">That page isn’t here. Try <a class="link" href="/projects">our projects</a>, <a class="link" href="/team">the team</a> or call {PHONE}.</p>
</section>'''
    write('/404', 'Page not found', 'Page not found.', body)

if __name__ == '__main__':
    build_home(); build_projects(); build_team(); build_lines(); build_how(); build_about(); build_contact(); build_404()
    print('built', len(PROJECTS) + 8, 'pages')
