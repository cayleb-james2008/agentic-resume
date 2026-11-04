# Quote form — corrected resubmission, agent-side complete (3–4 Nov 2026)

Status: **agent-side ready and re-proven tonight; the hosted schema step is Nox's; the deploy is the site owner's yes.**
**4 Nov 2026:** §6 audits this package line by line against disk and lists what was corrected. To *execute*, use the clean
standalone `docs/RESUBMISSION-20261104.md`, which supersedes §3 below (the history here is kept as written).
Written by the ERGON stream lead (opencode-go/deepseek-v4.1-flash) under Nox's overnight order
(`inbox/2026-11/20261104T035300Z` §2: "quote-form corrected resubmission through Nox's gated steps as far as agent-side goes").

## 1. What "corrected" means here

The workstream had **no board record**: only an order named it. The pickup (`reports/pickups/20261103/QUOTE-FORM-PICKUP-20261103.md`)
established it from disk and recorded honest unknowns. This resubmission replaces the missing/incorrect record with:

1. **A named owner gap, not a guessed owner.** Who commissioned the RHL quote form is still **unknown** (Nox or the RHL site
   owner; the RHL intake contact is not recorded on disk). FU-1 (the RHL intake pass) stays open until RHL's real intake
   method is known. No behaviour was invented to fill that gap.
2. **The real state, stated plainly:** demo-grade, connected to nothing, not deployed, publishable key empty. The earlier
   absence of a record is corrected by this document plus the board filing; it is not restated as "in progress".
3. **The scope boundary made explicit:** the app-side form and the **watcher model** are this side's; the **`rhl_demo` schema
   on the hosted project is Nox's**; the production deploy is the site owner's yes. `ergon_warehouse` is never touched.
4. **A fresh, independent-of-the-old-report proof** (section 2), run tonight on this machine against a real PostgREST, not
   quoted from the earlier session's table.

## 2. Agent-side verification run tonight (this machine, 4 Nov 2026 04:1x UTC)

Environment: `public.ecr.aws/supabase/postgres:17.11.0.006` + `public.ecr.aws/supabase/postgrest:v16.5` on a scratch podman
network (test data only, torn down after), PostgREST serving **only** `rhl_demo`, anon and service_role JWTs minted locally.
The migration applied from this repo unchanged (`supabase/migrations/20261102120000_rhl_demo_quote_requests.sql`).

| Check | Result |
|---|---|
| `python3 tools/check_quote_flow.py --url http://127.0.0.1:3001 …` | **48/48 PASS** ("ALL CHECKS PASSED"), re-run after the guard fix below (48/48 again) |
| of which: watcher logic offline (routing, refusals, put-back, 504/lost-answer, SIGTERM) | 19/19 PASS |
| of which: access model (anon insert only; no read/update/delete/status/relevant_to; empty name and space-padding refused) | PASS |
| of which: `extra` rules (object of text only, 8 KB; number/nested/array/null refused) | PASS |
| of which: flood guard (31 tickets in one request → 429, nothing saved) | PASS |
| of which: field limits at the config boundary (120/160/200/4000 accepted, +1 refused) | PASS |
| of which: service role reads, watcher claims, routes, messages, and does not notify twice | PASS |

**Browser path, end to end (the thing the old table called "not tested" for a live gateway):**

1. Built the site with `RHL_QUOTE_URL=http://127.0.0.1:3001` and an anon-role JWT (the build accepts only a publishable key or
   an anon-role JWT; it stopped on anything else, as designed): `built 44 pages`.
2. Served `contact.html`, filled `#quote` in Chromium, submitted: the page showed the thank-you, made exactly one `POST` to
   `/quote_requests`, and logged **0 console errors**.
3. The row landed (`status=new`, `relevant_to=null`); a real `tools/quote_watch.py --once` then **claimed it, routed it to
   `agent:sales-desk` (no keyword matched), and produced the notify payload** carrying the untrusted-text warning; the row
   became `status=routed`, `relevant_to=agent:sales-desk`.
4. A failed notify (bad `--notify-cmd`) put the ticket **back to `new`** instead of stranding it — observed, not assumed.

Limits of this proof: it is **not** the hosted gateway (no hosted keys, no hosted CORS configuration), not Realtime, and not
any real messaging. Those stay on the hosted-step list below. (The local PostgREST does enable CORS, so the browser proof does
exercise a real preflight; the hosted project's CORS config is still unproven.)

## 2b. Corrections from the independent check (4 Nov, after the first filing)

A fresh checker reproduced every claim above on its own pod and found three things worth fixing in the artifact, not just the
prose:

1. **Blank answers (fixed in the migration).** `btrim(x)` strips spaces only, so a name of tabs or newlines passed the "not
   blank" check (reproduced: `"\t\t\t"` -> 201). The constraints now require at least one non-whitespace character
   (`~ '[^[:space:]]'`) in `name`, `contact` and `details`; spaces, tabs and newlines are all refused (re-verified: 400 for each,
   201 for a real answer). The migration is not applied anywhere yet, so the correction costs nothing.
2. **The flood guard's trade-off was understated (fixed in `docs/QUOTE-WATCH.md`).** It is one **global** bucket with no
   attribution: 30 rows in a minute, whoever sends them. One anonymous caller can spend the whole minute's quota with a single
   request a minute and lock the form for real visitors until the minute turns (they see the error with the phone number). This
   is the first hardening item for real traffic, not a nuance.
3. **Indices added.** The throttle counts `created_at` on every insert and the watcher polls `status = new` ordered by
   `created_at`; rows are never deleted. `created_at` and `(status, created_at)` are now indexed (idempotent).
4. Reported, not changed here (FU-1 scope): `contact` has no server-side format check; `extra` can shadow a real column's name
   in the agent payload (routing reads the real column first, so it cannot misroute, but the consuming agent sees both); no PII
   retention rule (rows cannot be deleted at all).

## 2c. Idempotency proved by re-applying, because Nox may have to retry

Nox applies this migration on a project that already has schemas and data; a first attempt that fails half-way, or a second
apply after a change of mind, must not fail or duplicate objects. Proven, not asserted (transcript:
`evidence/quote-migration-idempotency-20261104.log` on the ERGON side):

- Fresh `public.ecr.aws/supabase/postgres:17.11.0.006` pod (it carries `anon`, `authenticated`, `service_role`); the migration
  applied **three times**: `psql exit=0, ERROR lines=0` each time.
- Objects afterwards, counted from the catalogs: **1** trigger, **1** policy, **7** check constraints, **3** indexes, anon
  **5** insert columns and **0** select columns, `service_role` **select+update**. Nothing duplicated by the re-applies.
- Behaviour as `role anon` on that re-applied schema: whitespace-only `name` → `quote_requests_name_check`; newline-only
  `details` → `quote_requests_details_check`; a read → `permission denied`; setting `status` → `permission denied`; a real
  answer → accepted, and the table then holds exactly one row.

Two operational notes this run adds:
1. **Apply it to a Supabase project, not bare Postgres** — the `revoke … from public, anon, authenticated` line needs those
   roles to exist. That is a property of the hosted target, not a defect, but a bare `postgres:17` container stops there.
2. **`Prefer: return=representation` is refused for `anon` by design** (the insert returns, then reading the row back needs
   SELECT, which anon does not have). The form submits with the default minimal return, so this is only a trap for anyone
   testing with `return=representation` and reading a failure as "insert broken".
3. The `if not exists` clauses make re-application safe **for this schema as written**; they would not retrofit a changed CHECK
   constraint onto a table that an older version of this file had already created. Nothing is applied anywhere yet, so that
   case does not exist today; it matters only if this file is edited after Nox applies it.

## 3. What Nox runs (the schema step is his) — exact order
1. **Create/confirm the schema on the hosted project** (`yhpjpjeedpuvcgnvfpka`), schema **`rhl_demo` only**. Apply
   `supabase/migrations/20261102120000_rhl_demo_quote_requests.sql` as **one transaction** (it is idempotent). It never
   references `ergon_warehouse`.
2. **Expose the schema**: Data API settings → Exposed schemas → add `rhl_demo`, keeping the schemas already listed
   (`public,graphql_public,ergon_warehouse`). Without this the API answers 406 for the schema.
3. **Hand back the publishable key only.** The service key stays with the watcher (the site refuses a non-publishable key at
   build time). Build: `RHL_QUOTE_KEY=<publishable> python3 src/build.py` — only `contact.html` changes.
4. **Contract check against the hosted gateway:**
   `python3 tools/check_quote_flow.py --url https://yhpjpjeedpuvcgnvfpka.supabase.co/rest/v1 --anon-key <publishable> --service-key <secret>`.
   It inserts `TEST-CHECK-…` rows, touches only those, and closes them; always pass `--service-key`. About 7 tickets per run;
   more than four runs in a minute trips the flood guard by design.
5. **Proof the exposed-schema change is live:** one `POST /rest/v1/quote_requests` with `Content-Profile: rhl_demo` and the
   publishable key → `201`; the same with `Prefer: return=representation` → refused (anon may not read back).
6. **Preview first.** The production RHL link is already shared with RHL; deploy only on the site owner's yes.

Nothing in steps 1–6 was run against any hosted project from this seat.

## 3b. Check it landed, and how to undo it (counts only — never a row)

Run these after step 1 and step 2. They read **catalogues and counts**, never a ticket's contents, so they are safe on the real
project and they prove the objects exist without trusting this document.

```sql
-- one table, and nothing else in the schema
select count(*) as tables from information_schema.tables where table_schema = 'rhl_demo';              -- expect 1
-- the seven CHECK constraints (the blank guards among them)
select conname from pg_constraint
 where conrelid = 'rhl_demo.quote_requests'::regclass and contype = 'c' order by 1;                    -- expect 7
-- one trigger, one policy, three indexes
select count(*) from pg_trigger where tgrelid = 'rhl_demo.quote_requests'::regclass and not tgisinternal;  -- expect 1
select count(*) from pg_policy  where polrelid = 'rhl_demo.quote_requests'::regclass;                      -- expect 1
select count(*) from pg_indexes where schemaname = 'rhl_demo';                                             -- expect 3
-- the access model: anon may INSERT only (on those five columns); service_role may SELECT and UPDATE
-- (anon's INSERT is a COLUMN grant, so it shows up in column_privileges, not role_table_grants — the first draft of this
-- checklist looked in the wrong view and reported anon as having nothing at all)
select grantee, string_agg(distinct privilege_type, ',' order by privilege_type) as privs
  from information_schema.column_privileges
 where table_schema = 'rhl_demo' and grantee in ('anon', 'service_role') group by grantee order by grantee;
-- expect: anon -> INSERT ; service_role -> SELECT,UPDATE
select string_agg(column_name, ',' order by column_name) as anon_insert_columns
  from information_schema.column_privileges
 where table_schema = 'rhl_demo' and grantee = 'anon' and privilege_type = 'INSERT';
-- expect: company,contact,details,extra,name   (five; and anon has 0 SELECT columns)
```

All seven queries were run against a fresh `public.ecr.aws/supabase/postgres:17.11.0.006` pod with this migration applied, and every
expectation above is that run's output.

Then the functional check is step 4's `check_quote_flow.py` (**48/48** expected; it inserts and closes its own `TEST-CHECK-…` rows).

**Undo**, if the decision goes the other way — this destroys tickets, so export them first:

```sql
drop schema if exists rhl_demo cascade;   -- the table, its indexes, trigger, policy and constraints go with it
```

and remove `rhl_demo` from Data API → Exposed schemas (step 2 reversed). Nothing outside `rhl_demo` is touched by either direction;
the migration never references `ergon_warehouse` and the drop is scoped to the schema.

**The undo was run too, not just written down:** on the same pod, `drop schema if exists rhl_demo cascade` -> `NOTICE: drop cascades to
2 other objects` (the policy and trigger), then `tables left in rhl_demo: 0`, and `ergon_warehouse` still absent. So the rollback is
one statement, it takes the objects with it, and it cannot reach another schema.

## 4. The watcher model (governs the ticket lifecycle)

`tools/quote_watch.py` is the demo agent loop, stdlib only, and it is the only thing that may route a ticket:

- polls `status = new`, oldest first, 30 s;
- routing key from `relevant_to` if set, else the first matching rule (`equals` on a whole answer, or whole-word `keywords`,
  singular/plural), else `routing.default`; an invalid target or an empty keyword stops it at start-up;
- claims with a PATCH that matches only while `status = new` (two watchers cannot both take one ticket);
- one JSON message per ticket to the notify command: `{to, ticket, received, request{...}, warning}` — the request text is
  anonymous visitor input and is labelled untrusted; the notify command **does not receive the service key**;
- a failed delivery, a lost answer or SIGTERM puts the row **back to `new`**; a 504 on the claim also re-queues; a refused
  claim is not "put back" because nothing was claimed.

Known hard-kill window (unchanged, demo level): SIGKILL/power loss between claim and delivery leaves the ticket `routed`,
not retried; a person resets it to `new`.

## 5. Still open (not this side's to close)

- **Ownership/brief** of this workstream (Nox to name it; the only order that names it is the overnight one).
- **FU-1, the RHL intake pass**: field set, real routing (division/territory/size), who is pinged and how fast, lifecycle
  beyond `new/routed/done/spam`, CAPTCHA/rate limit for real traffic, attachments, and folding in the older "Send a message"
  form. Nothing here can be settled before RHL's real process is known.
- **Agent handles** `agent:sales-desk`, `agent:architectural-ae`, `agent:furniture-ae` are placeholders; map them to real
  Ergon agents before this is shown as live.
- **Deploy** to the shared RHL link: site owner's yes only.

---

## 6. Audit, 4 November 2026 — this package checked against disk

Method: static reading of every file named below plus one consistency script (`tools/check_package.py`). **Nothing hosted was
read or written.** The 48/48 run and the three-times idempotency run are **reused, not re-run**: they are recorded evidence,
independently checked, and their logs are now in the repo. Line numbers are the tree as committed after this audit.

**What the package says, and what is true:** every headline claim holds on disk — demo-grade, connected to nothing, not
deployed, publishable key empty, 48/48 contract checks, three clean applications of the migration, a browser submit that saved
a row, and a watcher that claimed, routed and put a ticket back. What did not hold were details and one gap: the authority doc
misdescribed three things (6.1), the build accepted any endpoint silently (6.2), and the hosted instruction named an
unverified schema list (6.3). All are corrected below; none of the recorded proof was invalidated.

### 6.1 Invariant 1 — the watcher model governs, and the code agrees

`docs/QUOTE-WATCH.md` is the authority. Its clauses and `tools/quote_watch.py` were compared one by one:

| clause in QUOTE-WATCH.md | code | verdict |
|---|---|---|
| polls `status = new`, oldest first, 30 s | `quote_watch.py:108` (`?status=eq.new&order=created_at.asc&limit=50`), `:138` (interval 30) | agree |
| `relevant_to` wins, else the first matching rule, else `routing.default`; `equals` on a whole answer, `keywords` as whole words singular/plural | `quote_watch.py:57-67` | agree |
| start-up fails on a target the table would refuse or an empty keyword | `quote_watch.py:70-76`; the table's own rule is `migration:37` | agree |
| claim only while the row is still `new`, so two watchers cannot take one | `quote_watch.py:115-118` | agree |
| one JSON message per ticket, visitor text labelled untrusted | `quote_watch.py:81-82` (carries `warning`) | **doc sample omitted `warning` — fixed** (QUOTE-WATCH.md:61-62) |
| failed delivery, lost answer, SIGTERM, 5xx on the claim → back to `new` with the previous `relevant_to`; a refused claim is not put back | `quote_watch.py:97-132` | agree |
| a hard kill between claim and delivery leaves the ticket `routed`; a person resets it | no recovery code, by design | consistent, and stated as a known limit (QUOTE-WATCH.md:165-167) |
| `status` ∈ `new/routed/done/spam`; `relevant_to` is `[A-Za-z0-9:_-]{1,64}` | `migration:36-37` | agree with QUOTE-WATCH.md:36-37, 56 |

**No watcher code changed.** The code was already right; the authority document was not, in two places, and was silent in a
third. Corrections, all doc-side and all justified by the doc's own statements:

1. **The payload sample omitted `warning`** (QUOTE-WATCH.md:59-60 before). The code sends it (`quote_watch.py:81-82`), §4 of
   this document lists it, and the doc's own untrusted-text paragraph (:73-74) requires it. An agent's parser written from the
   sample would have dropped the one guard the design depends on. Fixed at :61-62.
2. **The table's `contact` minimum was undocumented.** `migration:34` requires `char_length(btrim(contact)) >= 3` as well as
   the 200 maximum; QUOTE-WATCH.md:42 listed maxima only. Fixed at :42-43.
3. **"30 new tickets in a minute" read as `status = new`.** The trigger counts tickets *created* in the minute whatever their
   status afterwards (`migration:63`). One word could have implied a weaker guard than the one installed. Fixed at :43-45.
4. **"the migration applies twice cleanly" was stale** (QUOTE-WATCH.md:136 before): the proof is three applications
   (`evidence/quote-migration-idempotency-20261104.log`; §2c above). Fixed at :136.
5. **An unsourced number was removed.** The doc claimed a "10 parallel bulk requests, which saved 29 rows against a limit of
   30" run. No transcript exists in this repo or in `~/fleet-scratch/overnight/evidence/`, so the audit cannot stand behind it.
   The evidenced result (one 31-row bulk insert → 429, nothing saved; `evidence/quote-flow-48-checks-v2.log`) replaced it at
   :136-141. The `pg_advisory_xact_lock` in `migration:62` is still the reason parallel inserts cannot all pass the count.
6. **The build's new URL guard is documented** where the key rule already was (QUOTE-WATCH.md:104-106), so the doc and the
   code still describe the same build.

### 6.2 Invariant 2 — the endpoint was already right; it is now enforced

Already correct, verified at three places: `src/data/quote.json:2` is
`https://yhpjpjeedpuvcgnvfpka.supabase.co/rest/v1`; the built `contact.html:98` carries the same string; `src/build.py:11` has
**no** hardcoded default host (it merges `quote.json` with `RHL_QUOTE_URL`/`RHL_QUOTE_KEY` only) and `:13` strips a trailing
slash. `grep` for `localhost`, `127.0.0.1` and `<20 chars>.supabase.co` across every page, script, style and config found no
scratch host and no second ref. Rebuilding the site produced a byte-identical tree (`git status` clean), so the pages on disk
are exactly what the config generates.

**Genuine defect found:** nothing enforced it. Any `RHL_QUOTE_URL` — including the scratch host this document's own §2 step 1
used (`http://127.0.0.1:3001`) — built silently into the page, and the committed page was correct only because the last build
happened to use the right config. A stale ref would have shipped with no warning. **Fixed** at `src/build.py:22-26`: the build
now stops unless the URL is this project's REST endpoint or a loopback host for a local test. Tested both ways: a stale ref →
`SystemExit` with the expected endpoint in the message; loopback → builds (the browser proof in §2 still runs).
`tools/check_package.py` (6.5) also fails if the config or the built page names any other ref.

### 6.3 Invariant 3 — `rhl_demo` only, in code and in the instructions

- **The page:** `assets/site.js:295` sends `'Content-Profile': 'rhl_demo'` on the one POST; no other profile string exists in
  the file; every built page loads that same file (`src/build.py:154`).
- **The watcher:** `tools/quote_watch.py:30` sets `Content-Profile` and `Accept-Profile` to `rhl_demo` on every call.
- **The migration:** creates `rhl_demo` and nothing else (`migration:18`); its only mention of `ergon_warehouse` is the comment
  saying it is not touched (`migration:3`); grants are on `rhl_demo.quote_requests` only (`:81-86`).
- **Shipped files contain no `public`, `ergon_warehouse`, `service_role` or `sb_secret` string** — machine-checked (6.5 b, c2).
- **The hosted instruction:** "append, keep the schemas already listed" was already right (§3 step 2), but it went on to name
  the current list as `public,graphql_public,ergon_warehouse` with no hosted read behind it. If that guess were wrong, a
  literal-minded operator could have removed a live schema. The new package states the rule without the guess, and requires
  the current list to be recorded **before** editing (`RESUBMISSION-20261104.md` §1.3, §2 step 2).

### 6.4 The other checks asked for

- **Field limits match the CHECKs exactly:** `quote.json:5-8` → 120 / 160 / 200 / 4000; `migration:32-35` → 120 / 160 / 200 /
  4000. Machine-checked per column, not by eye (6.5 d).
- **Routing rules and default agree:** `quote.json:10-16` (default `agent:sales-desk`; architectural keywords; furniture
  keywords) is read by `quote_watch.py:57-76`, which does exactly what QUOTE-WATCH.md:53-57 describes. The doc does not name
  the default's value because it is data, not behaviour; §2 step 3 records the observed route to `agent:sales-desk` for an
  answer with no keyword. No change needed.
- **The flood-guard trade-off is stated as a limit, not a feature:** QUOTE-WATCH.md:145-151 ("one global bucket with no
  attribution… a trivial denial of intake at a cost of one request a minute… the first hardening item") and
  `migration:57-58`. The §2 table row "flood guard (31 tickets → 429)" is about the guard working, not a claim that it scales.
  The one unsourced *concurrency* number was handled in 6.1(5).
- **The "not proved" list is still accurate:** QUOTE-WATCH.md:142-143 and this document's §2 ("not the hosted gateway… not
  Realtime… not any real messaging") remain true — this audit made no hosted call and holds no hosted key. The nuance added
  to the new package: hosted CORS cannot be configured or proved by SQL, only by one submit from the real origin
  (`RESUBMISSION-20261104.md` §7.2).

### 6.5 The consistency script, and proof that it can fail

`tools/check_package.py` (stdlib only, no network) fails when: (a) the quote endpoint is not
`https://yhpjpjeedpuvcgnvfpka.supabase.co/rest/v1` in the config or the built page; (b) any shipped page, script or style names
`ergon_warehouse`, `service_role` or `sb_secret`; (c) the POST's `Content-Profile` is not `rhl_demo` or any other profile is
present; (d) a form maximum differs from the migration's CHECK maximum; (e) any doc or built page names another Supabase ref;
(f) the built page's quote block differs from `quote.json` (the way a stale endpoint really ships); (g) the published key is
neither empty nor publishable.

Clean tree:

```
PASS  a1 quote.json url is the project REST endpoint
PASS  a2 built contact.html carries the same endpoint
PASS  b  no shipped file names ergon_warehouse, service_role or sb_secret
PASS  c1 site.js sends Content-Profile: rhl_demo
PASS  c2 site.js sends no other Content-Profile
PASS  c3 built pages load that same site.js
PASS  d  name: form max 120 == table max 120
PASS  d  company: form max 160 == table max 160
PASS  d  contact: form max 200 == table max 200
PASS  d  details: form max 4000 == table max 4000
PASS  e  docs/ and the built pages name only this project ref
PASS  f  built contact.html quote block matches quote.json
PASS  g  quote.json key is empty or publishable
PASS  g  contact.html key is empty or publishable

PACKAGE CONSISTENT
```

Mutated copy (`/tmp`, four changes at once — stale ref and a secret-shaped key in `quote.json`, `details` CHECK 4000→3999,
`Content-Profile`→`public` plus a `service_role` comment in `site.js`, another ref in `QUOTE-WATCH.md`): **8 FAILED**, exit 1,
covering a1, b, c1, c2, d(details), e, f, g. A second copy with a stale ref hand-edited into `contact.html` alone: **3 FAILED**
(a2, e, f) — and the same stale endpoint fed to the build
(`RHL_QUOTE_URL=https://not-this-project.supabase.co/rest/v1 python3 src/build.py`) is refused, so the build cannot produce it.

### 6.6 Other corrections made in this pass

1. **The evidence path did not resolve.** §2c cited `evidence/quote-migration-idempotency-20261104.log`, but the repo had no
   `evidence/` directory; the transcript lived in `~/fleet-scratch/overnight/evidence/`. Both cited transcripts are now in
   `evidence/` (the idempotency log and the 48-check log), and `evidence` was added to `.vercelignore` so agent-side logs are
   not published by the static deploy.
2. **"All nine lines were run…"** (§3b) — the block is seven statements. Corrected, and the seven expectations are the ones the
   new package carries.
3. **A compiled `.pyc` was tracked** (`tools/__pycache__/quote_watch.cpython-314.pyc`). Untracked and removed; `.gitignore` now
   ignores `__pycache__/` and `*.pyc`.
4. **This document is superseded for execution** by `docs/RESUBMISSION-20261104.md` (noted at the top); the history above is
   kept as written.

### 6.7 Still not proved (unchanged by this audit)

The hosted gateway's acceptance of the publishable key, hosted browser CORS, the exposed-schema change taking effect, the
project's role set, Realtime (unused), real messaging, and the rollback's raw transcript (the cascade output is quoted in §3b;
the transcript is not on disk). All of those need Nox's run, not another agent-side pass.

