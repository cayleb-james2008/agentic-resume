# RHL quote form — corrected resubmission package (4 Nov 2026)

**What this is:** the exact, ordered, idempotent steps to put the RHL demo quote form's table on the hosted Supabase project
(`yhpjpjeedpuvcgnvfpka`), each with the output to compare, plus the queries that prove it landed and the one-statement rollback.
**Written by:** the ERGON stream lead (opencode-go/deepseek-v4.1-flash), 4 Nov 2026. **Audit of the earlier package:**
`docs/RESUBMISSION-20261103.md` §6. **Authority for behaviour:** `docs/QUOTE-WATCH.md`. Nothing in this document was run
against a hosted project from this seat. Every hosted step below is **NOX**.

- [ ] Step 1 — apply the migration (schema `rhl_demo` only)
- [ ] Step 2 — append `rhl_demo` to Exposed schemas
- [ ] Step 3 — build the page with the publishable key, hand the key back
- [ ] Step 4 — contract check against the hosted gateway (expect 48/48)
- [ ] Step 5 — prove the exposed schema is live (201, and a refused read-back)
- [ ] Step 6 — preview; **deploy only on the site owner's yes** (not Nox's to take)

---

## 0. What this is, and what it does not do

The RHL demo contact page has a quote form. One submit saves one ticket in `rhl_demo.quote_requests`; a small watcher reads
`status = new`, decides who the ticket is relevant to, claims it and hands one JSON message to that agent. The anonymous role
can only insert; only the service role reads and updates.

It **does not** send email, notify anyone by itself, defend against a determined flood (see §5 and `QUOTE-WATCH.md` "Known
limits"), or exist as an Ergon feature. It **does not** touch `ergon_warehouse` — that schema holds real RHL data and the
migration only ever creates and uses `rhl_demo` (migration lines 3, 18, 84-86; proven by grep: the only mention of
`ergon_warehouse` in the migration is the comment saying it is not touched).

**Six steps, all Nox's except the last gate.** Each step is repeatable: a retry after a half-finished attempt does not fail or
duplicate anything (proven, §6). The migration is not applied anywhere yet.

---

## 1. Preconditions on the hosted project (check these first)

1. **It is the right project.** Ref `yhpjpjeedpuvcgnvfpka` (`https://yhpjpjeedpuvcgnvfpka.supabase.co`), the Ergon project.
   Not a scratch/second project. The page's endpoint was verified on disk at `src/data/quote.json:2` and in the built
   `contact.html`, and the build now refuses any other endpoint (`src/build.py`).
2. **It is a Supabase project, not a bare Postgres.** The migration revokes from `public, anon, authenticated`
   (migration line 81); those roles exist on every Supabase project and not on a plain `postgres:17` container. See trap T1.
3. **Write down the current Exposed schemas list before touching it** (Project Settings → Data API). You will *append* one
   entry in step 2 and nothing else; if you ever roll back, you edit that list back by hand. This document does not name the
   current list, because no hosted read was made from this seat to confirm it.
4. **No watcher is running against this project.** Step 4 inserts `TEST-CHECK-…` rows; a running watcher would route them and
   ping an agent. (It also closes its own rows at the end — pass `--service-key` or the rows stay `new`.)
5. **Keys:** you hand back the **publishable** key (`sb_publishable_…`, or the legacy anon JWT). The **secret** key stays with
   the watcher and is never put on the page — the build refuses anything that is not publishable.
6. **Scope:** the only schema this package creates, alters or drops is `rhl_demo`. Do not add `rhl_demo` to any other
   project, and do not create, alter, drop or read anything in `ergon_warehouse` or `public`.

---

## 2. The ordered hosted steps

Work top to bottom. Each step says what to run, whether a retry is safe, and what to compare.

### Step 1 — apply the migration **NOX**

File: `supabase/migrations/20261102120000_rhl_demo_quote_requests.sql` (the whole file — it has `begin;` … `commit;` in it,
so it is one transaction).

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20261102120000_rhl_demo_quote_requests.sql
```

Or paste the file into the project's SQL editor and run it once.

- **Idempotent:** applied three times in a row on a fresh Supabase Postgres 17 pod; `psql exit=0`, zero `ERROR` lines each
  time, and the object counts did not change (`evidence/quote-migration-idempotency-20261104.log`).
- **Expected output:** no `ERROR` line at all. `NOTICE … does not exist, skipping` on a **re-apply** is normal and harmless.
- **Compare:** `ERROR` count = 0. Then step 3 of this package (the catalogue queries) must show 1 table, 7 CHECK constraints,
  1 trigger, 1 policy, 3 indexes.
- **If it stops:** read the first error only. `role "anon" does not exist` means you are on a bare Postgres — stop, use the
  Supabase project (T1). Anything else: do not hand-edit the file; report the error.

### Step 2 — append `rhl_demo` to Exposed schemas **NOX**

Dashboard → Project Settings → Data API → **Exposed schemas** → add `rhl_demo` → save.

- **Append, do not replace.** Keep every schema already listed, exactly as it is. Removing one breaks whatever uses it (the
  real warehouse data lives in one of them).
- **Idempotent:** adding a name that is already there changes nothing; saving twice is safe.
- **Expected:** the list now shows the previous entries **plus** `rhl_demo`.
- **Why:** without it PostgREST answers `406` (`PGRST106`, "schema must be one of the following") for this schema, and the
  form shows its error message. The `notify pgrst, 'reload schema'` at the end of the migration only reloads the schema cache;
  it does not expose a schema.

### Step 3 — build the page with the publishable key, hand it back **NOX**

```bash
RHL_QUOTE_KEY=<publishable key> python3 src/build.py
```

- **Idempotent:** the same key produces a byte-identical page (re-running the build on the current tree changed nothing —
  `git status` clean after a rebuild).
- **Expected output:** `built 44 pages`. `git status --short` then lists **only** `contact.html` — the quote block exists on no
  other page. Then `python3 tools/check_package.py` must print `PACKAGE CONSISTENT` (it proves the page carries this project's
  endpoint, `Content-Profile: rhl_demo`, the form maxima equal the table's, and the key is publishable, not secret).
- **The build refuses, by design:** any key that is not `sb_publishable_…` or an anon-role JWT, and any quote URL that is not
  `https://yhpjpjeedpuvcgnvfpka.supabase.co/rest/v1` (a loopback host is allowed for local tests only). A secret key or a
  scratch endpoint stops the build instead of shipping.
- **Hand back to the agent side:** the publishable key only. The secret key does not leave your session.

### Step 4 — contract check against the hosted gateway **NOX**

```bash
python3 tools/check_quote_flow.py \
  --url https://yhpjpjeedpuvcgnvfpka.supabase.co/rest/v1 \
  --anon-key <publishable key> --service-key <secret key>
```

- **What it does:** the same calls the form and the watcher make — anon insert, every refusal (read/update/delete/status/
  `relevant_to`/blank/over-size/`extra` rules), field limits at their exact maximum and one over, the 31-row flood refusal,
  then claim → route → notify → no double notify with the service role. It touches only its own `TEST-CHECK-…` rows and closes
  them (`status = done`) at the end.
- **Idempotent but not free:** a run adds about **7** rows. More than four runs in one minute trips the flood guard (30 rows a
  minute) — that is the guard working, not a failure. Wait a minute and re-run.
- **Expected:** 48 check lines, every one `PASS`, last line `ALL CHECKS PASSED`, exit status 0. A failure prints
  `N FAILED: <labels>` — send that line back unchanged.
- **Always pass `--service-key`.** Without it the test rows stay `new` and a running watcher would ping an agent about them.

### Step 5 — prove the exposed-schema change is live **NOX**

One insert with the schema header, then the same insert asking for the row back:

```bash
curl -i -X POST "https://yhpjpjeedpuvcgnvfpka.supabase.co/rest/v1/quote_requests" \
  -H "apikey: <publishable key>" -H "Content-Type: application/json" \
  -H "Content-Profile: rhl_demo" -H "Prefer: return=minimal" \
  --data '{"name":"TEST-CHECK-schema","contact":"test@example.com","details":"TEST-CHECK-schema exposure probe"}'

curl -i -X POST "https://yhpjpjeedpuvcgnvfpka.supabase.co/rest/v1/quote_requests" \
  -H "apikey: <publishable key>" -H "Content-Type: application/json" \
  -H "Content-Profile: rhl_demo" -H "Prefer: return=representation" \
  --data '{"name":"TEST-CHECK-schema","contact":"test@example.com","details":"TEST-CHECK-schema exposure probe"}'
```

- **Expected:** the first answers **`HTTP/2 201`** (no body). The second is **refused** — `401`/`403`, because anon has no
  SELECT and cannot read the row back. That refusal is the access model working, not a broken insert (trap T2).
- **Close the test rows** (never leave them for a watcher):

```bash
curl -i -X PATCH "https://yhpjpjeedpuvcgnvfpka.supabase.co/rest/v1/quote_requests?details=like.TEST-CHECK-*" \
  -H "apikey: <secret key>" -H "Content-Type: application/json" \
  -H "Content-Profile: rhl_demo" -H "Prefer: return=minimal" \
  --data '{"status":"done"}'
```

- **Idempotent:** each attempt adds one row; the PATCH closes every `TEST-CHECK-…` row, so repeating the pair and the close is
  harmless. Use the legacy anon/service JWT as `Authorization: Bearer …` too if your project still uses JWT keys.

### Step 6 — preview **NOX**, then the deploy gate **OWNER**

Preview the built page first. The production RHL link is already shared with RHL, so deploying to it is the **site owner's
yes**, not Nox's and not the agent's. See §7.

**Nothing in steps 1–6 was run against any hosted project from this seat.** No hosted SQL, no migration, no deploy, no key
entry, no read of `ergon_warehouse`.

---

## 3. Verify it landed — catalogue queries (counts only, never a row)

Run after step 1 and step 2. They read catalogues and counts, never a ticket's contents. Copied unchanged from
`docs/RESUBMISSION-20261103.md` §3b, where they were run on the scratch pod; the expectations are that run's output.

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
-- (anon's INSERT is a COLUMN grant, so it shows up in column_privileges, not role_table_grants)
select grantee, string_agg(distinct privilege_type, ',' order by privilege_type) as privs
  from information_schema.column_privileges
 where table_schema = 'rhl_demo' and grantee in ('anon', 'service_role') group by grantee order by grantee;
-- expect: anon -> INSERT ; service_role -> SELECT,UPDATE
select string_agg(column_name, ',' order by column_name) as anon_insert_columns
  from information_schema.column_privileges
 where table_schema = 'rhl_demo' and grantee = 'anon' and privilege_type = 'INSERT';
-- expect: company,contact,details,extra,name   (five; and anon has 0 SELECT columns)
```

The 7 CHECK constraints are, by name: `quote_requests_name_check`, `quote_requests_company_check`,
`quote_requests_contact_check`, `quote_requests_details_check`, `quote_requests_status_check`,
`quote_requests_relevant_check`, `quote_requests_extra_check` (migration lines 32–41). The 3 indexes are the primary key plus
`quote_requests_created_idx` and `quote_requests_status_created_idx` (migration lines 77–78).

Then the functional proof is step 4 (`48/48`) and step 5 (`201`).

---

## 4. Rollback

One statement, if the decision goes the other way:

```sql
drop schema if exists rhl_demo cascade;
```

then remove `rhl_demo` from Data API → Exposed schemas (step 2 reversed — the drop does not edit that list).

- **Destroys tickets.** Export them first with the service key:
  `curl "https://yhpjpjeedpuvcgnvfpka.supabase.co/rest/v1/quote_requests?select=*" -H "apikey: <secret>" -H "Accept-Profile: rhl_demo"`.
- **Proven to be scoped:** on the scratch pod the drop reported `NOTICE: drop cascades to 2 other objects` (the policy and the
  trigger), left 0 tables in `rhl_demo`, and `ergon_warehouse` was still absent — the statement cannot reach another schema.
  Recorded in `docs/RESUBMISSION-20261103.md` §3b; that run's raw transcript is not in the repo. The cascade itself is standard
  Postgres: a schema drop takes its tables, policies, triggers, indexes and constraints with it.
- **Not proven:** there is no way to roll back a *deploy* from here; that is `vercel rollback` and the site owner's call.

---

## 5. The two traps

**T1 — the migration needs the Supabase roles.** The line
`revoke all on schema rhl_demo from public, anon, authenticated;` (migration line 81) and its neighbours need `anon`,
`authenticated` and `service_role` to exist. On a bare `postgres:17` container the migration stops with
`role "anon" does not exist`. That is a property of the target, not a defect: run it on the Supabase project. **Do not "fix"
it by deleting the revoke lines** — they are what keeps `authenticated` and PUBLIC out.

**T2 — `Prefer: return=representation` is refused for anon by design.** Asking for the row back on insert requires SELECT,
which anon does not have (and must not get). The form submits with `Prefer: return=minimal`, so a `401`/`403` on a
representation test is the access model answering, **not** "the insert is broken". The 201 from the minimal-return request is
the proof. (The service role may use `return=representation`; that is how the watcher proves its claim landed.)

---

## 6. What is proven agent-side, and what only Nox's run can prove

**Proven on this machine, from this repo — recorded evidence, reused here, not re-run for this package:**

| claim | where |
|---|---|
| 48/48 contract checks on a real PostgREST serving only `rhl_demo` | `evidence/quote-flow-48-checks-v2.log` |
| the migration applies three times with no error and no duplicate object | `evidence/quote-migration-idempotency-20261104.log` |
| anon insert-only, column-level; no read/update/delete/status/`relevant_to` | both logs; `tools/check_quote_flow.py` |
| blank (space/tab/newline) answers refused; limits exact at 120/160/200/4000 | migration lines 32–41; both logs (space padding; whitespace-only name; newline-only details) |
| flood guard: 31 rows in one request → 429, nothing saved | 48-check log |
| browser path: one POST, thank-you, 0 console errors; real watcher claimed, routed, notified; failed notify put the row back | `docs/RESUBMISSION-20261103.md` §2 |
| rollback cascades to the policy and trigger, leaves another schema untouched | `docs/RESUBMISSION-20261103.md` §3b (quoted; no raw transcript) |
| the site rebuilds byte-identically from source (44 pages) | re-run today: `git status` clean after `python3 src/build.py` |
| package consistency (endpoint ref, no warehouse/secret string in shipped files, `Content-Profile: rhl_demo`, form ≡ table maxima, no other ref in docs) | `python3 tools/check_package.py` → `PACKAGE CONSISTENT` |

**Only Nox's run can prove:** that the hosted gateway accepts the publishable key; that browser CORS works from the real
origin (`https://rhl-concept.vercel.app`) — the scratch PostgREST did enable CORS, but that is not the hosted configuration;
that the exposed-schema change took effect (`201`); that the project's role set is the standard one; and anything about a
real deployment. **Not used at all:** Realtime (polling is the default) and any real messaging — so neither is proved or
claimed.

---

## 7. The site-owner deploy gate

Do not deploy before all of these are true:

1. Steps 1–5 are done and their outputs match (catalogue counts, `48/48`, `201` + refused read-back).
2. The built `contact.html` carries the publishable key and one browser submit from the *hosted* page saves a row — that is the
   only proof of hosted CORS.
3. The page's own wording is still true: the quote section says this is a demo table and gives the phone number, and the
   thank-you makes no time promise (`docs/QUOTE-WATCH.md`, "Known limits"; FU-1).
4. The `agent:` handles in `routing` are placeholders until they map to real Ergon agents. Showing this as live before that is
   a false claim.

The deploy itself (`vercel deploy --prod`, or the dashboard) is the site owner's yes; the link is already shared with RHL, so a
deploy is visible to them. Rollback of a deploy is `vercel rollback`. The agent side does not deploy, does not press it, and
does not write to the hosted project.

---

*Fences honoured for this package: no hosted SQL, no migration applied, no `PATCH`/deploy/key entry, no Supabase project write,
no `ergon_warehouse` contact of any kind. The six hosted steps are Nox's; the deploy is the site owner's yes.*
