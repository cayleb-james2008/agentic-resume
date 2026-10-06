# Next-session handoff 2: containment candidate, tree-kill root cause, and the push blocker
**Snapshot:** 2026-10-06 19:50 UTC
**Purpose:** Continue from GitHub alone. This file is the portable handoff; it does not depend on any local computer or scratch workspace. Re-check all live refs, PRs, checks, and deployments before acting — this is a dated snapshot.
**Read first:** the previous handoff, which remains the governing context for the end goal and evidence rules: <https://github.com/cayleb-james2008/agentic-resume/blob/docs/next-session-proof-handoff/HANDOFF-NEXT-SESSION.md>

## The outcome Cayleb wants (unchanged)
Pure professionalism through proof: a polished, truthful résumé and live portfolio backed by projects that work after a fresh download and test. Show capability through inspectable evidence, never adjectives. Describe project work as independent/AI-assisted where appropriate; credit Prime Intellect for the upstream Sophos runtime/daemon/bridge and its MIT license; keep demo, local, hosted, provider-generated, and production claims distinct. **The résumé has not been submitted to Mercor. Do not submit it and do not describe all projects as complete while acceptance remains open.**

## Voice and the end state Cayleb wants (added 2026-10-06 evening)
The finished body of work should read as Cayleb, not as an AI:
- **First person, professional but casual.** Confident, plain-spoken, warm — a strong engineer explaining their work to a friendly peer. Concrete over grandiose; zero corporate filler; zero hype words (no "cutting-edge", "seamless", "revolutionary"). A little personality is welcome; swagger is fine when a fact backs it.
- **Applies to every public surface:** the résumé (web page, PDF, DOCX), the portfolio site and case studies, and the READMEs/docs of `dotz`, `sophos`, and `industry-ai-suite`. Humanize summaries and intros; keep technical precision in the details.
- **"Merged and beautified" is the END STATE, not a shortcut:** the open draft PRs (dotz #218; Sophos #9/#10/#11) are meant to land on their main branches once their acceptance gates pass. Merge deliberately, then polish the merged state — tidy docs, consistent tone, clean presentation. Humanization never outruns evidence: tone may be casual, but every claim stays scoped, dated, and honest. **Do not merge to "finish"; merge what is proven.**
- **Full repo control is the expectation:** the next agent is meant to operate across all four repos (`agentic-resume`, `dotz`, `sophos`, `industry-ai-suite`) — branches, PRs, merges, and releases. If any push is still 403, fix that access first (see Blocker); never work around it with manual credentials.

## What this session verified (evidence classes kept separate)

### Hosted (GitHub / live site, 2026-10-06)
- `agentic-resume` `main` unchanged at `476bb5623ef8b438028031faf86c55ff4520c090`; no releases.
- Live site <https://cayleb-james2008.github.io/agentic-resume/> is **byte-identical** to `main`'s `index.html` and `resume.html`; live `Cayleb-James-resume.pdf` SHA-256 `6683e120435fcdccddd64aeda300b2e11a932622514235c418746f72af32913f` matches the reviewed artifact.
- Résumé claims re-audited against live refs: dotz PR #218 and Sophos PRs #9/#10 are all still open drafts, so every "Open draft PR …" statement on the live résumé remains accurate and scoped. No résumé/site edits were needed or made this session.
- dotz PR #218 head still `51a94560247da0b1ef7deb4eacd492d446541834`. Exact-head run `37285797859` failed; its `check (ubuntu-latest)` annotation reads *"The hosted runner lost communication with the server."*
- Sophos: the handoff-1 open item (the isolated shutdown instrumentation investigation) is now resolved as a **failed diagnostic**: branch `diagnostic/pr11-graceful-shutdown-40cc1-20261006`, head `f62e19137ca205ab2934ad18a1a446366bc04ced`, run `37505376509` completed **failure** in both jobs (`cua-e2e`, `test`; each "Process completed with exit code 1"). No signoff; PR #11 (head `40cc1f65f815c331a6b10bf6220990015abb8bac`) is unchanged and still not green.
- `industry-ai-suite` `main` unchanged at `60a690c7bb3b`; no new runs or releases.

### Local diagnostic (this session's sandbox — NOT release acceptance, NOT hosted evidence)
Two verified safety findings and a complete candidate fix for dotz's escaped-descendant problem:

1. **Tree-kill root cause (strace-proven):** `posix_kill_tree` shelled out to procps `/bin/kill` as `kill -9 -<pgid>` **without `--`**. Strace shows that form executes **`kill(0, SIGKILL)` — signalling the caller's OWN process group**. This is almost certainly the true cause of the Ubuntu CI "hosted runner lost communication" failures (the repo's "infra, not code" note is wrong): the sandbox tests' tree-kill wiped the CI job's process group, killing the runner's job. It killed the local test harness the same way (observed repeatedly). Control probes: `kill -9 -- -<N>` correctly executes `kill(-<N>, SIGKILL)`; `kill -<N>` without a signal executes `kill(0, SIGTERM)`.
2. **Escaped-descendant containment (Linux):** every sandbox run now executes inside its own PID namespace via `unshare --user --map-root-user --pid --fork --mount-proc --kill-child=KILL -- <argv>`. Containment is kernel-enforced: when the namespace init (workload root) dies for any reason, the kernel SIGKILLs every remaining member including `setsid` escapees; `PR_SET_PDEATHSIG` on the wrapper tears the namespace down if the owning process dies; the wrapper is killed with the `kill(2)` **syscall** (no parser, no subprocess; pids 0 and 1 refused). **Fail closed:** if the containment probe fails, the run ends with `[containment unavailable] …` and the workload never starts. Windows (`taskkill /T`) and macOS (group kill) are unchanged and claim no escaped-descendant containment; agent-browser spawns are intentionally NOT wrapped (its persistent Chrome daemon must outlive one-shot commands — browser escapee cleanup remains open).

## The candidate: branch + exact patch (durable in this repo)
The push to `cayleb-james2008/dotz` is **blocked** (see Blocker below), so the candidate ships with this handoff as an exact `git format-patch` of the local commit:

- Local branch `fix/linux-pidns-containment-20261006`, commit `a883df5` (parent: PR #218 head `51a9456`), one file changed: `dotz-core/src/sandbox.rs` (+649/−34).
- Patch: [`patches/0001-fix-sandbox-escaped-descendant-containment-and-tree-kill-safety.patch`](./patches/0001-fix-sandbox-escaped-descendant-containment-and-tree-kill-safety.patch) — 810 lines, applies with `git am` onto `51a9456` and reproduces the commit exactly.

Reproduce in a fresh clone (this is the intended route for a repo-connected agent):

```sh
git clone https://github.com/cayleb-james2008/dotz.git && cd dotz
git checkout -b fix/linux-pidns-containment-20261006 51a94560247da0b1ef7deb4eacd492d446541834
git am /path/to/patches/0001-fix-sandbox-escaped-descendant-containment-and-tree-kill-safety.patch
```

### Tests added (failures and skips stay visible)
- `escaped_setsid_descendant_does_not_survive_normal_cleanup` — normal cleanup route (`kill_run_by_id`); asserts the `setsid` escapee dies **and** an unrelated process survives (unrelated-process isolation). RED before containment.
- `escaped_setsid_descendant_does_not_survive_timeout_cleanup` — watchdog route.
- `owner_crash_tears_down_contained_run_tree` — helper OS process is SIGKILLed; the run tree must die (PR_SET_PDEATHSIG chain). RED before containment.
- `containment_unavailable_fails_closed_without_running_workload` — helper process with a broken wrapper path; asserts the workload never executes.
- `escaped_setsid_containment_skipped_non_linux` — explicit platform-boundary skip marker.
- `kill_pid_tree_kills_grandchild_on_posix` (existing) keeps its behavioral assertion; its liveness probe is cmdline-marker-based on Linux because `$!` is namespace-local under containment.
- Test-craft note: `$0`/argv markers vanish when an exec chain (`bash -c 'single command'`, `setsid cmd`) replaces the process image — use a unique `sleep <fractional>` duration as the marker.

### Local diagnostic results (fresh, exact candidate tree)
5/5 containment tests, 35/35 `sandbox::` tests, 25/25 `browser` tests pass; `cargo clippy -p dotz-core --all-targets -- -D warnings` and `cargo fmt --all -- --check` clean. Toolchain notes for reproducing elsewhere: the sandbox needed `pkg-config` + `libssl-dev` and a glibc-2.35 link shim for the prebuilt ONNX Runtime (`__isoc23_strto*` forwarding); CI runners (glibc ≥ 2.39) need neither.

## Blocker (the one thing preventing acceptance evidence)
`git push` to `cayleb-james2008/dotz` is **denied (HTTP 403) for `freebuff-web[bot]`** — the workspace's managed GitHub credential is scoped to the connected repo (`agentic-resume`) only. Retried twice this session; same result. **No manual credential workarounds.** Unblock by connecting `cayleb-james2008/dotz` (and `cayleb-james2008/sophos` for follow-up) to the Freebuff workspace, or granting the Freebuff GitHub App write permission on those repositories. Until then the candidate exists only as the patch in this repo and the local commit hash above.

## Project acceptance status (unchanged where noted)
- **dotz:** PR #218 open draft; Linux/hosted acceptance not green. The escaped-descendant safety problem now has a candidate fix with tests, but **no acceptance claim** until the exact pushed head passes the full three-OS CI. The Windows diagnostic lane and immutable v0.2.8 lane results from handoff-1 stand unchanged.
- **Sophos:** PR #11 open draft; push + PR runs still failing; the Composition CUA blocker is unresolved with unknown root cause (do not claim a fix); the shutdown instrumentation diagnostic (run `37505376509`) failed both jobs — read its logs/artifacts for the failure detail before choosing the next diagnostic. No diagnostic result grants signoff.
- **Industry AI Suite:** `main` at `60a690c`; its evidence remains bounded local/synthetic flows and dated receipts — not live production integrations.
- **Résumé / site:** synchronized with verified facts as of this snapshot (see Hosted section). Mercor submission **not done**.

## Working rules (carried forward, plus this session's additions)
1. Treat every status above as historical until re-read. Work from GitHub; verify exact pushed heads and read results back before reporting success. Never infer acceptance from a readiness banner, compile, exit code alone, empty transcript, or partial/synthetic demonstration.
2. Keep failures, skips, and platform boundaries visible. Label results as diagnostic, local, hosted, provider-generated, or production. Mechanism probes (strace, shell A/B) are diagnostic only.
3. Narrow candidate branches; independent review before proposing integration. Do not use broad process-group kills, numeric-PID fallbacks with reuse risk, or uncontained fallbacks as proof of safe cleanup — and note that the old `kill -9 -<pgid>` form was itself a broad kill of the caller's group on Linux.
4. Do not claim the tree-kill root cause is fixed on any platform until the exact pushed head's CI says so; the local evidence is strong but diagnostic.
5. Only after evidence gates pass: synchronize résumé, PDF/DOCX, case studies, project links, and live site; verify published bytes/links against committed artifacts. Final status must say what is verified, what remains blocked, and what is merely diagnostic.

## Ordered next steps
1. **Unblock push access** for the Freebuff GitHub App on `cayleb-james2008/dotz` (and `sophos`). This is the single gate on everything below.
2. Push `fix/linux-pidns-containment-20261006` (or `git am` the patch per above and push the result), then read the exact-head CI across Windows/macOS/Linux. Success criteria: the Ubuntu lane completes **without a runner-death**, containment tests pass on Linux, and the platform-skip marker appears on the other lanes. If the Ubuntu lane still dies, the kill(0) hypothesis is incomplete — capture the run id/annotations and keep the failure visible.
3. If green, request independent review of the candidate per handoff-1 rule 3 before proposing integration into PR #218. Escaped-descendant cleanup on the **browser** path remains an open design problem (daemon lifetime vs containment) — do not paper over it.
4. For Sophos, read the failed shutdown diagnostic's artifacts (`37505376509`) before picking the next instrumented run; keep push-event and pull-request runtime paths distinct; fix the Composition CUA case only with causal, reproducible evidence.
5. Only after acceptance gates pass, sync the résumé/site with the new verified facts and **merge the proven PRs** onto their main branches (dotz #218, Sophos #9/#10/#11 as each becomes genuinely green), then polish the merged state.
6. **Humanize and beautify pass:** rewrite résumé copy, site intros, case-study prose, and the three project READMEs in Cayleb's voice — first person, professional-but-casual, approachable — without loosening any evidence claim. Verify published bytes/links after each site change.
7. Mercor submission remains Cayleb's call after the agreed completion gate.

## Durable versus non-durable work
Everything in this repo (this file + the patch) is durable. The local clone, commit `a883df5`, strace logs, and probe scripts from this session are **not** on GitHub and must not be cited as reproducible remote artifacts — the patch is the reproducible representation. Recreate anything else from public source in a new isolated branch and publish the exact test evidence needed for review.
