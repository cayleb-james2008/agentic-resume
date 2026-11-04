# Quote form — corrected resubmission, agent-side complete (3–4 Nov 2026)

Status: **agent-side ready and re-proven tonight; the hosted schema step is Nox's; the deploy is the site owner's yes.**
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
| `python3 tools/check_quote_flow.py --url http://127.0.0.1:3001 …` | **48/48 PASS** ("ALL CHECKS PASSED") |
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

Limits of this proof: it is **not** the hosted gateway (no CORS, no hosted keys), not Realtime, and not any real messaging.
Those stay on the hosted-step list below.

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
