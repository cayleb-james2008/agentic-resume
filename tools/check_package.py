#!/usr/bin/env python3
"""Consistency gate for the RHL quote-form package. Standard library only; no network, no hosted access.

    python3 tools/check_package.py            # checks the tree it lives in
    python3 tools/check_package.py --root DIR # checks another copy (used to prove the checks can fail)

It fails (exit 1) when any of these is untrue:
  a  the quote endpoint is this project: https://yhpjpjeedpuvcgnvfpka.supabase.co/rest/v1, in quote.json and in the built page
  b  no shipped asset mentions ergon_warehouse, service_role or an sb_secret_ key
  c  the form's POST carries Content-Profile: rhl_demo and no other profile
  d  every quote.json field maximum equals the matching CHECK maximum in the migration
  e  no document or built page names any other Supabase project ref
  f  the built contact.html carries the quote block of the current quote.json (so a stale build cannot ship)
  g  the key published in the page is empty or publishable (never a secret key)
"""
import argparse, base64, json, os, re, sys

REF = 'yhpjpjeedpuvcgnvfpka'
ENDPOINT = f'https://{REF}.supabase.co/rest/v1'
MIGRATION = 'supabase/migrations/20261102120000_rhl_demo_quote_requests.sql'
PAGE = 'contact.html'
SHIPPED = ['assets/site.js', 'assets/site.css']
SECRETS = re.compile(r'ergon_warehouse|service_role|sb_secret')
REF_IN_TEXT = re.compile(r'\b([a-z0-9]{20})\.supabase\.co')

ap = argparse.ArgumentParser()
ap.add_argument('--root', default=os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
root = os.path.abspath(ap.parse_args().root)
path = lambda *p: os.path.join(root, *p)
read = lambda *p: open(path(*p), encoding='utf-8').read()

fails = []
def ck(label, ok, detail=''):
    print(('PASS  ' if ok else 'FAIL  ') + label + ('' if ok else f'   {detail}'))
    if not ok:
        fails.append(label)

def page_data():
    html = read(PAGE)
    m = re.search(r'<script type="application/json" id="data">(.*?)</script>', html, re.S)
    return json.loads(m.group(1)) if m else None

def publishable(k):
    if not k or k.startswith('sb_publishable_'):
        return True
    try:
        seg = k.split('.')[1]
        return k.startswith('eyJ') and json.loads(base64.urlsafe_b64decode(seg + '=' * (-len(seg) % 4))).get('role') == 'anon'
    except (ValueError, IndexError, KeyError):
        return False

try:
    cfg = json.loads(read('src/data/quote.json'))
except (OSError, ValueError) as e:
    sys.exit(f'check_package: cannot read src/data/quote.json: {e}')

# ---- a) the endpoint is this project, in config and in the page -----------------------------------------------
ck('a1 quote.json url is the project REST endpoint', cfg.get('url') == ENDPOINT, repr(cfg.get('url')))
data = None
try:
    data = page_data()
    built_url = (data or {}).get('quote', {}).get('url')
    ck('a2 built contact.html carries the same endpoint', built_url == ENDPOINT, repr(built_url))
except (OSError, ValueError, AttributeError) as e:
    ck('a2 built contact.html carries the same endpoint', False, f'{PAGE}: {e}')

# ---- b) nothing secret or warehouse-shaped reaches a shipped file --------------------------------------------
shipped = [p for p in os.listdir(root) if p.endswith('.html')] + SHIPPED
hits = []
for p in shipped:
    try:
        for m in SECRETS.finditer(read(p)):
            hits.append(f'{p}: {m.group(0)}')
    except OSError:
        pass
ck('b  no shipped file names ergon_warehouse, service_role or sb_secret', not hits, '; '.join(hits[:6]))

# ---- c) the POST profile is rhl_demo, and only that ----------------------------------------------------------
js = read('assets/site.js')
profiles = set(re.findall(r"Content-Profile['\"]?\s*:\s*['\"]([^'\"]+)", js))
ck('c1 site.js sends Content-Profile: rhl_demo', 'rhl_demo' in profiles, f'found {sorted(profiles)}')
ck('c2 site.js sends no other Content-Profile', profiles <= {'rhl_demo'}, f'found {sorted(profiles)}')
ck('c3 built pages load that same site.js', '<script src="/assets/site.js" defer>' in read(PAGE))

# ---- d) form maxima equal the table's CHECK maxima -----------------------------------------------------------
sql = read(MIGRATION)
chunks = sql.split('constraint ')[1:]
columns = {'name': 'quote_requests_name_check', 'company': 'quote_requests_company_check',
           'contact': 'quote_requests_contact_check', 'details': 'quote_requests_details_check'}
by_col = {f['column']: f['max'] for f in cfg.get('fields', []) if f.get('column')}
for col, cname in columns.items():
    chunk = next((c for c in chunks if c.startswith(cname)), None)
    m = re.search(rf'char_length\(\s*{col}\s*\)\s*<=\s*(\d+)', chunk or '')
    table_max = int(m.group(1)) if m else None
    form_max = by_col.get(col)
    ck(f'd  {col}: form max {form_max} == table max {table_max}', table_max is not None and form_max == table_max,
       f'{MIGRATION} {cname} says {table_max}')

# ---- e) no other Supabase project ref anywhere in the docs or the built pages --------------------------------
others = []
for base, _, files in os.walk(path('docs')):
    for f in files:
        if f.endswith('.md'):
            p = os.path.relpath(os.path.join(base, f), root)
            for m in REF_IN_TEXT.finditer(open(os.path.join(base, f), encoding='utf-8').read()):
                if m.group(1) != REF:
                    others.append(f'{p}: {m.group(1)}')
for p in [f for f in shipped if f.endswith('.html')] + SHIPPED:
    try:
        for m in REF_IN_TEXT.finditer(read(p)):
            if m.group(1) != REF:
                others.append(f'{p}: {m.group(1)}')
    except OSError:
        pass
ck('e  docs/ and the built pages name only this project ref', not others, '; '.join(sorted(set(others))[:6]))

# ---- f) the built page matches the current config (a stale build is the way a wrong ref ships) ---------------
if data is not None:
    built_q = data.get('quote') or {}
    want = {k: cfg.get(k) for k in ('url', 'fields')}
    got = {k: built_q.get(k) for k in ('url', 'fields')}
    ck('f  built contact.html quote block matches quote.json', want == got,
       'run python3 src/build.py')

# ---- g) the published key is publishable or empty ------------------------------------------------------------
for label, k in (('quote.json', cfg.get('key')), ('contact.html', (data or {}).get('quote', {}).get('key'))):
    ck(f'g  {label} key is empty or publishable', publishable(k), repr(k)[:24] + ('...' if k and len(k) > 24 else ''))

print('\n' + ('PACKAGE CONSISTENT' if not fails else f'{len(fails)} FAILED: ' + '; '.join(fails)))
sys.exit(1 if fails else 0)
