#!/usr/bin/env python3
"""End-to-end check of the quote-request contract, with the same calls the form and the watcher make.

  python3 tools/check_quote_flow.py --url <rest base> --anon-key <publishable key> --service-key <secret key>

Runs every check and exits 1 if any failed. It INSERTS TEST ROWS: every row's details start with TEST-CHECK-<run id>, every
probe that could change data is limited to those rows, and with --service-key all TEST-CHECK rows are closed ('done') at the
end. Without --service-key they stay 'new', and a running watcher would ping an agent about them. Safe to re-run.
"""
import argparse, contextlib, io, json, os, subprocess, sys, uuid
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from quote_watch import CONFIG, PollError, call, notify_cmd, route, run_once, validate_routing

ap = argparse.ArgumentParser()
ap.add_argument('--url', default=os.environ.get('RHL_QUOTE_URL'))
ap.add_argument('--anon-key', default=os.environ.get('RHL_QUOTE_KEY'))
ap.add_argument('--service-key', default=os.environ.get('RHL_QUOTE_SERVICE_KEY'))
a = ap.parse_args()
if not a.url or not a.anon_key:
    sys.exit('need --url and --anon-key')

fails = []
def check(label, cond, detail=''):
    print(('PASS  ' if cond else 'FAIL  ') + label + ('' if cond else f'   {detail}'))
    if not cond:
        fails.append(label)

CFG = json.load(open(CONFIG))
MARK = 'TEST-CHECK-' + uuid.uuid4().hex[:8]
ONLY = f'&details=like.{MARK}*'  # limits every probe that could change data to this run's rows
visitor = {'name': 'Check Person', 'company': None, 'contact': 'check@example.com', 'details': f'{MARK} 12 rows of telescoping bleachers'}
mark = lambda n: (MARK + ' ' + 'a' * n)[:n]  # exactly n characters, still starting with the marker
post = lambda body, prefer='return=minimal': call(a.url, a.anon_key, 'POST', '', body, prefer)

# ---- the watcher's logic, offline -------------------------------------------------------------------------------
R = {'default': 'd', 'rules': [{'to': 'a', 'field': 'topic', 'equals': ['Bleachers']}, {'to': 'b', 'keywords': ['desk', 'library', 'table']}]}
check('route: relevant_to wins', route({'relevant_to': 'x', 'details': 'desk'}, R) == 'x')
check('route: equals on an extra answer', route({'details': 'desk', 'extra': {'topic': 'bleachers'}}, R) == 'a')
check('route: keyword is a whole word, plural allowed', route({'details': 'six Desks', 'extra': {}}, R) == 'b')
check('route: "tablet" is not "table"', route({'details': 'ten tablets', 'extra': {}}, R) == 'd')
check('route: no match -> default', route({'details': 'sofa', 'extra': {}}, R) == 'd')
check('route: a keyword like "c++" matches', route({'details': 'we write c++ here'}, {'default': 'd', 'rules': [{'to': 'a', 'keywords': ['c++']}]}) == 'a')
try:
    validate_routing(CFG['routing']); ok = True
except SystemExit:
    ok = False
check('config routing targets look valid', ok)
def refused(routing):
    try:
        validate_routing(routing); return False
    except SystemExit:
        return True
check('a routing target the table would refuse is rejected at start-up', refused({'default': 'kelli@rhl.example', 'rules': []}))
check('a target with a trailing newline is rejected at start-up', refused({'default': 'agent:x\n', 'rules': []}))
check('an empty keyword (matches everything) is rejected at start-up', refused({'default': 'd', 'rules': [{'to': 'a', 'keywords': ['desk', ' ']}]}))
check('a network failure comes back as status 0, not an exception', call('http://127.0.0.1:1', 'k', 'GET')[0] == 0)
os.environ['RHL_QUOTE_SERVICE_KEY'] = 'SECRET-VALUE'
try:
    notify_cmd(f'{sys.executable} -c "import os,sys; sys.exit(3 if \'RHL_QUOTE_SERVICE_KEY\' in os.environ else 0)"')({}); ok = True
except subprocess.CalledProcessError:
    ok = False
check('the notify command does not receive the service key', ok)

ROW = {'id': 'r1', 'created_at': 't', 'name': 'n', 'company': None, 'contact': 'c@e.co', 'details': 'bleachers', 'relevant_to': None, 'extra': {}}
def fake(*script):
    calls = []
    def api(base, key, method, query='', body=None, prefer=None):
        calls.append((method, body))
        return script[len(calls) - 1] if len(calls) <= len(script) else (200, None)
    return api, calls
def boom(msg): raise RuntimeError('delivery down')
with contextlib.redirect_stderr(io.StringIO()):
    api, calls = fake((200, [ROW]), (0, 'connection dropped'), (204, None))
    run_once('u', 'k', R, api=api)
    check('claim answer lost -> ticket put back to new, no crash', calls[-1] == ('PATCH', {'status': 'new', 'relevant_to': None}))
    api, calls = fake((200, [ROW]), (200, [ROW]), (0, 'down'))
    try:
        run_once('u', 'k', R, boom, api=api); ok = True
    except Exception:
        ok = False
    check('failed delivery and failed put-back are logged, not fatal', ok)
    api, calls = fake((200, [{**ROW, 'relevant_to': 'agent:x'}]), (200, [ROW]), (204, None))
    run_once('u', 'k', R, boom, api=api)
    check('put-back restores the relevant_to the ticket had', calls[-1] == ('PATCH', {'status': 'new', 'relevant_to': 'agent:x'}))
    api, _ = fake((502, None))
    try:
        run_once('u', 'k', R, api=api); ok = False
    except PollError:
        ok = True
    check('an unreadable table raises PollError (the loop survives it)', ok)
    api, calls = fake((200, [ROW]), (504, None), (204, None))
    run_once('u', 'k', R, api=api)
    check('a gateway error (504) on a claim -> ticket put back to new', calls[-1] == ('PATCH', {'status': 'new', 'relevant_to': None}))
    api, calls = fake((200, [ROW]), (400, None))
    run_once('u', 'k', R, api=api)
    check('a refused claim (400) is not "put back" (nothing was claimed)', len(calls) == 2)
    def stopped(msg): raise KeyboardInterrupt
    api, calls = fake((200, [ROW]), (200, [ROW]), (204, None))
    try:
        run_once('u', 'k', R, stopped, api=api); ok = False
    except KeyboardInterrupt:
        ok = calls[-1] == ('PATCH', {'status': 'new', 'relevant_to': None})
    check('being stopped (SIGTERM / Ctrl-C) mid-delivery puts the ticket back, then stops', ok)

# ---- the anonymous visitor ----------------------------------------------------------------------------------------
check('anon can insert a ticket (what the form sends) -> 201', post(visitor)[0] == 201)
check('anon cannot ask for the row back (return=representation) -> denied', post(visitor, 'return=representation')[0] in (401, 403))
check('anon cannot read tickets -> denied', call(a.url, a.anon_key, 'GET', '?select=*')[0] in (401, 403))
check('anon cannot set status -> denied', post({**visitor, 'status': 'done'})[0] in (401, 403))
check('anon cannot set relevant_to -> denied', post({**visitor, 'relevant_to': 'agent:boss'})[0] in (401, 403))
check('anon cannot update -> denied', call(a.url, a.anon_key, 'PATCH', f'?status=eq.new{ONLY}', {'status': 'done'})[0] in (401, 403))
check('anon cannot delete -> denied', call(a.url, a.anon_key, 'DELETE', f'?status=eq.new{ONLY}')[0] in (401, 403))
check('empty name -> 400', post({**visitor, 'name': '  '})[0] == 400)
check('details padded with spaces past the limit -> 400', post({**visitor, 'details': MARK + ' ' * 5000})[0] == 400)
check('answers kept in extra (an object) -> 201', post({**visitor, 'extra': {'topic': 'bleachers'}})[0] == 201)
check('extra that is not an object -> 400', post({**visitor, 'extra': ['x']})[0] == 400)
check('extra over 8 KB -> 400', post({**visitor, 'extra': {'k': 'a' * 9000}})[0] == 400)
for label, bad_extra in (('a number', {'n': 5}), ('a nested object', {'a': {'b': 'c'}}), ('an array', {'a': ['b']}), ('null', {'a': None})):
    check(f'extra holding {label} is refused (answers are text only) -> 400', post({**visitor, 'extra': bad_extra})[0] == 400)
bulk = [{**visitor, 'details': f'{MARK} bulk {i}'} for i in range(31)]
check('one request with 31 tickets is refused by the flood guard -> 429', post(bulk)[0] == 429)
# The form config and the table must agree: every configured column limit is accepted at max and refused one over.
for f in CFG['fields']:
    if f.get('column') and f.get('max'):
        check(f'config {f["id"]}: {f["max"]} chars accepted, {f["max"] + 1} refused',
              post({**visitor, f['column']: mark(f['max'])})[0] == 201 and post({**visitor, f['column']: mark(f['max'] + 1)})[0] == 400)

# ---- the watcher and the service role -----------------------------------------------------------------------------
if a.service_key:
    S = a.service_key
    s, rows = call(a.url, S, 'GET', f'?status=eq.new{ONLY}')
    mine = [r for r in rows or [] if 'bleachers' in r['details'] and r['details'].startswith(MARK)]
    check('service role sees the new ticket', s == 200 and mine and mine[0]['status'] == 'new' and mine[0]['relevant_to'] is None, f'{s} {rows}')
    check('the refused bulk request saved nothing', s == 200 and not [r for r in rows if ' bulk ' in r['details']])
    got, routing = [], CFG['routing']
    run_once(a.url, S, routing, got.append, ONLY)
    first = [m for m in got if 'bleachers' in m['request']['details']]
    check('watcher routed bleachers to the architectural agent', first and first[0]['to'] == 'agent:architectural-ae', str(got))
    check('watcher message carries the answers and an untrusted-text warning', first and first[0]['request']['contact'] == 'check@example.com' and 'untrusted' in first[0]['warning'])
    s, rows = call(a.url, S, 'GET', f'?status=eq.routed{ONLY}')
    claimed = [r for r in rows or [] if 'bleachers' in r['details']]
    check('claimed row is now status=routed with relevant_to set', claimed and claimed[0]['relevant_to'] == 'agent:architectural-ae', f'{s} {rows}')
    if claimed:  # every routing target in the config must be one the table accepts
        targets = sorted({routing['default']} | {r['to'] for r in routing['rules']})
        bad = [t for t in targets if call(a.url, S, 'PATCH', f'?id=eq.{claimed[0]["id"]}', {'relevant_to': t})[0] not in (200, 204)]
        check('every routing target in the config is accepted by the table', not bad, str(bad))
    again = []
    run_once(a.url, S, routing, again.append, ONLY)
    check('a second pass does not notify again', not again, str(again))
    post({**visitor, 'details': f'{MARK} desks for a library'})
    with contextlib.redirect_stderr(io.StringIO()):
        run_once(a.url, S, routing, boom, ONLY)
    s, rows = call(a.url, S, 'GET', f'?status=eq.new{ONLY}')
    desks = [r for r in rows or [] if 'desks' in r['details']]
    check('failed delivery puts the ticket back to new, without a stale relevant_to', desks and desks[0]['relevant_to'] is None, f'{s} {rows}')
    call(a.url, S, 'PATCH', '?details=like.TEST-CHECK*', {'status': 'done'})  # leave nothing waiting for a real agent
else:
    print("\nNOTE: no --service-key, so the service-role and watcher checks were skipped and the TEST-CHECK rows stay status 'new'. "
          "Close them (or pause the watcher) so no agent is pinged about them.")

print('\n' + ('ALL CHECKS PASSED' if not fails else f'{len(fails)} FAILED: ' + '; '.join(fails)))
sys.exit(1 if fails else 0)
