# Next-session handoff: proof-first portfolio and engineering completion

**Snapshot:** 2026-10-06 18:00 UTC
**Purpose:** Continue from GitHub alone. This file is the portable handoff; it does not depend on this operator's local computer or private scratch files. Re-check all live refs, PRs, checks, and deployments before acting because this is a dated snapshot.

## The outcome Cayleb wants

Build a genuinely professional, technically confident Mercor profile by showing capabilities through inspectable proof—not adjectives or unsupported completion claims. The final deliverable is a polished, truthful résumé, a polished live portfolio, and projects that work when freshly downloaded and tested. **The résumé has not been submitted to Mercor. Do not treat it as ready for final submission until the required project acceptance is complete and Cayleb's stated gate is met.**

Cayleb is a Connecticut-based high-school graduate pursuing remote-only applied AI, automation, and developer-tool work. Describe project work as independent/AI-assisted where appropriate. Do not imply an engineering job, degree, sole authorship, enterprise adoption, customer outcomes, revenue, or model training without evidence. Credit Prime Intellect for the upstream Sophos runtime/daemon/bridge and its MIT license. Keep demo, local, hosted, provider-generated, and production claims distinct.

## Start here: GitHub source of truth

- Portfolio repo: <https://github.com/cayleb-james2008/agentic-resume>
- Snapshot base: `main` at `476bb5623ef8b438028031faf86c55ff4520c090`.
- Live portfolio: <https://cayleb-james2008.github.io/agentic-resume/>
- Live résumé page: <https://cayleb-james2008.github.io/agentic-resume/resume.html>
- Live PDF: <https://cayleb-james2008.github.io/agentic-resume/Cayleb-James-resume.pdf>
- Résumé source of record: `resume/resume-content.json`, `resume/resume.md`, and `resume/resume-fragment.html`. The published PDF is the reviewed artifact; do not use the historical `resume/build.sh` to overwrite it.
- Portable résumé verification: `resume/reviewed-verification.json`. It records the scope and hashes, and explicitly says résumé checks are **not** project release acceptance. Work history/education are user-supplied, not employer-verified.

The PDF and DOCX in the repository were checked as one-page documents for expected text/links and rendering/clipping; the verification record says all résumé checks passed. SHA-256: PDF `6683e120435fcdccddd64aeda300b2e11a932622514235c418746f72af32913f`; DOCX `24aa09ea7fd6153ffe1d078da264dac1363fead2424c7fdd747fda59166f4e51`. These hashes do not establish that every project is complete. The repo README describes the hosted lab as dated receipt replays, not fresh source checks; synthetic examples are labeled, and all ten full workflows are still marked unverified.

## Project acceptance status at snapshot

### Industry AI Suite

- Repo: <https://github.com/cayleb-james2008/industry-ai-suite>
- PR #2 merged; fresh-main commit at snapshot: `60a690c7bb3b7dc0aedc592a948971b398a3f2ac`.
- The merged change had a fresh-main run of 374 pytest tests, 178 subtests, and 4 Node tests. Its evidence covers bounded local/synthetic flows and dated receipts; it does not prove fresh third-party source or provider behavior for every workflow. Do not upgrade those limits into claims of live production integrations.

### dotz

- Repo: <https://github.com/cayleb-james2008/dotz>
- PR #218: <https://github.com/cayleb-james2008/dotz/pull/218> — open, draft; head `51a94560247da0b1ef7deb4eacd492d446541834` at snapshot.
- Exact-head hosted run `37285797859` failed: <https://github.com/cayleb-james2008/dotz/actions/runs/37285797859>. Overall Linux/hosted acceptance is not green.
- A separate Windows diagnostic run `37452195588` passed 64/64 and showed Memory content after restart; this is scoped candidate evidence, not release acceptance. The separate immutable v0.2.8 lane failed (61 passed, 2 failed, 5 skipped).
- The unresolved safety problem is escaped descendant cleanup: a `setsid`-style child survived cleanup in a contained regression. A local PID-namespace mechanism experiment passed 29/29 prototype checks, but that is not packaged production integration. An isolated local integration candidate retained an expected RED regression and was intentionally never pushed. **Neither private prototype is present in GitHub; do not assume it is available or claim a production fix.** Do not use broad process-group kills, numeric-PID fallbacks with reuse risk, or uncontained fallbacks as proof of safe cleanup.

### Sophos

- Repo: <https://github.com/cayleb-james2008/sophos>
- PR #11: <https://github.com/cayleb-james2008/sophos/pull/11> — open, draft; head `40cc1f65f815c331a6b10bf6220990015abb8bac` at snapshot.
- Same-head CI push run `37468149294` failed; PR run `37468153944` also failed overall. The PR runtime job passed 48/48, but the push runtime job was 47/48 and did not establish graceful shutdown/fallback cleanup. ACL checks passed with explicit platform skips; they do not waive the runtime or UI failures.
- The native Composition CUA case remains a blocker. Diagnostic branch `diagnostic/composition-wheel-ab-20261006`, commit `06267eef20124e9d7926d7c3d7c951382c9eb170`, failed run `37499821810`: seven of eight native suites passed (58 passed, one Composition failure; three explicit skips). Its pointer/wheel A/B probes did not move the app content; **the root cause is unknown**. See <https://github.com/cayleb-james2008/sophos/actions/runs/37499821810>. Do not claim the CUA issue fixed or infer a cause from those probes.
- A separate isolated shutdown instrumentation investigation was active when this snapshot was written. Its outcome is not included here; inspect GitHub for a newly pushed diagnostic branch/run before continuing. No diagnostic result grants signoff or changes PR #11 by itself.

## Working rules for the next session

1. Clone/fetch the public repos and read their current `AGENTS.md`, PR heads, Actions jobs/artifacts, release tags, and website state. Treat the status above as historical until re-read. Work from GitHub; there are no local-path dependencies in this handoff.
2. Keep each fix on a narrow candidate branch. Preserve failed tests, skips, and platform boundaries. Test the exact pushed head and read results back from GitHub before reporting success. Never infer acceptance from a readiness banner, compile, exit code alone, empty transcript, or a partial/synthetic demonstration.
3. For dotz, first solve process ownership and bounded cleanup safely, including escaped descendants, cancellation, pipes/EOF, startup/rollback failures, owner crash, and unrelated-process isolation. Require real containment and test the normal packaging/lifecycle route; fail closed if containment is unavailable. Get independent review before proposing integration.
4. For Sophos, distinguish push-event from pull-request runtime paths. Instrument shutdown boundaries without weakening assertions/timeouts/fallback checks, and fix the native Composition visibility/input problem only when evidence identifies a causal, reproducible repair. Require real UI evidence and exact-head CI.
5. Fresh-download acceptance means an independent checkout/install and representative end-to-end use with prerequisites/limits disclosed—not merely repository unit tests or a local dev run. Do not use provider-generation or live-source language unless those exact operations were observed.
6. Only after the evidence gates pass, synchronize the résumé, PDF/DOCX, case studies, project links, and live site. Verify the actual published bytes/links against the committed artifacts. Keep the résumé concise, specific, and honest; professionalism comes from reproducible evidence.
7. Final status must say what is verified, what remains blocked, and what is merely diagnostic. Mercor submission remains **not done** until Cayleb chooses to submit after the agreed completion gate.

## Durable versus non-durable work

Only material committed/pushed to GitHub is available to a repo-connected future agent. The local dotz prototype and raw Sophos diagnostic evidence mentioned above are not in the public repo. Do not claim to have read them, and do not publish their results as if they were reproducible remote artifacts. If future work is useful, recreate it from the public source in a new isolated branch and publish the exact test evidence needed for review.
