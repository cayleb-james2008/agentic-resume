# Gauntlet evidence — repos / identity (items 7–12)

Report-only gather, 2026-09-22 (America/New_York). No repos edited.

**Graded set:** `dotz` + peers `sophos` and `solomon` (both public under `cayleb-james2008`; featured on live site). `apotheka-site` also exists public under the same owner but was not graded this pass.

---

## 7. GitHub login + display name

**Verdict: VERIFIED**

| Check | Result |
|---|---|
| `gh api user` | `login=cayleb-james2008`, `name=Cayleb Alvarez-James`, `html_url=https://github.com/cayleb-james2008` |
| Live site header | `GET https://agentic-resume-nine.vercel.app/` → HTTP 200; `<a class="site-name" href="index.html">Cayleb Alvarez-James</a>` |
| Live site footer | `<p>Cayleb Alvarez-James · <a href="mailto:cayleb.james2008@gmail.com">…</a></p>` |
| Local `index.html` header | same `site-name` text: `Cayleb Alvarez-James` |
| Local `index.html` footer | same footer name: `Cayleb Alvarez-James` |

Display name on GitHub profile API, live header/footer, and local header/footer all match **exactly** (`Cayleb Alvarez-James`). Login matches `cayleb-james2008`.

Commands:

```bash
gh api user --jq '{login:.login, name:.name, html_url:.html_url}'
curl -sS https://agentic-resume-nine.vercel.app/ | rg 'site-name|footer class="site"' -A2
rg -n 'site-name|footer class="site"' -A2 /workspace/agentic-resume/index.html
```

---

## 8. Attribution consistency (owner of each graded repo)

**Verdict: VERIFIED**

| Repo | `owner.login` | `fork` | `parent` | Notes |
|---|---|---|---|---|
| `cayleb-james2008/dotz` | `cayleb-james2008` | `false` | `null` | original under owner |
| `cayleb-james2008/sophos` | `cayleb-james2008` | `false` | `null` | original under owner; README credits upstream Prime Intellect (not a GitHub fork of unrelated account presented as original) |
| `cayleb-james2008/solomon` | `cayleb-james2008` | `false` | `null` | original under owner |

Command:

```bash
for r in dotz sophos solomon; do
  gh api "repos/cayleb-james2008/$r" --jq '{repo:.full_name, owner:.owner.login, fork:.fork, parent:(.parent.full_name // null)}'
done
```

---

## Per-repo evidence (items 9–12)

Source for each README: `gh api repos/cayleb-james2008/<repo>/readme -H "Accept: application/vnd.github.raw"`.

### `dotz` (`main`)

#### 9. README try-path — **VERIFIED**

Clone → install/build → first-success path with copy-pasteable commands:

**Setup / install** (README `## Setup`):

```bash
npm install        # ships the agent-browser binary + the @huggingface/transformers model fetcher
npm run fetch-model    # downloads the all-MiniLM-L6-v2 ONNX model into assets/models/ (bundled by Tauri)
```

**First-success / build-and-test** (README `## Build and Test`):

```bash
# Headless backend (browser dev loop) — open http://127.0.0.1:4317
cargo run -p dotz-core --bin serve

# Native desktop window (Tauri / WebView2)
cargo tauri dev
```

Merge-gate commands also listed:

```bash
cargo fmt --all -- --check
cargo clippy -p dotz-core --all-targets -- -D warnings
cargo test -p dotz-core
```

Documented blocker (not hidden): Linux note that plain `npm install` can fail on `sharp`; `npm install --ignore-scripts` + `npm run fetch-model` is the verified path. Desktop shell needs Windows.

Dry-run of cargo/npm not executed this pass (report-only); path is documented and copy-pasteable in README.

#### 10. README honesty / limits — **VERIFIED**

Named honesty sections / quotes:

- `## What works today` — “Status as verified on this Linux host on 2026-09-18. Anything not listed here is untested.”
- Honest test results: “`cargo test -p dotz-core` … 796 passed / 17 failed … 803 passed / 10 failed with `-- --test-threads=1`”
- **Not run / needs something else:** desktop shell + installer needs Windows; live-provider tests need keys; release feed returned HTTP 404 on 2026-09-18.
- `## Notes and Caveats` — provider keys required; `ort` pre-release pin called out.
- Badge honesty: “No live-fact badges here on purpose: the release-feed URLs returned HTTP 404…”

No unlabeled production-users/revenue claim found in README scan for this pass.

#### 11. CI green on default branch — **REFUTED**

```text
default_branch=main
gh run list --repo cayleb-james2008/dotz --branch main --limit 1
→ conclusion=failure  status=completed  name=ci
  displayTitle="ci: ubuntu test step best-effort after four runner deaths (infra, not…"
  url=https://github.com/cayleb-james2008/dotz/actions/runs/35656256732
  createdAt=2026-09-21T21:17:05Z → 2026-09-21 17:17:05 EDT
```

Latest five default-branch runs are all `failure`. CI exists but latest default-branch conclusion is **not** success → bar FAIL for this item.

#### 12. LICENSE present — **VERIFIED**

```text
gh api repos/cayleb-james2008/dotz/contents/LICENSE
→ path=LICENSE  type=file  size=1367
raw head: "MIT License" / "Copyright (c) 2026 Cayleb James"
```

---

### `sophos` (`master`)

#### 9. README try-path — **VERIFIED**

Primary stranger path (download → install → launch) — README `## Quick start — download & run`:

> To try it, download the latest installer from the Releases page and follow Quick start — no manual dependencies, no admin rights needed.

| Step | What |
|---|---|
| 1. Download | `Sophos_<version>_x64-setup.exe` from Releases |
| 2. Install | Run the `.exe` → `~\AppData\Local\Sophos` |
| 3. Launch | Open **Sophos** |
| 4. Add a provider | Settings → Providers |
| 5. Chat | Start a new session |

Clone → build path also present (`## Build from source`):

```bash
node scripts/bundle.mjs
npm run tauri build
# → …/Sophos_<version>_x64-setup.exe
```

Documented blocker: “Building from source and running the app require Windows 10/11”; Linux supports frontend checks only.

#### 10. README honesty / limits — **VERIFIED**

Quotes:

- `> **⚠️ Beta Notice:** All Sophos versions before v1.0 are beta releases. Features may change, and there may be bugs. Use in production at your own risk.`
- `> **Known limitation:** \`run_code\` is **demo-mode only** for now. … programs are simulated and every output is clearly labeled`
- `## What works today` table marks native installer / e2e / cua as ❌ Needs Windows; unit tests 1116/1118; updater harness 20/24 without local signing key.
- Credits upstream: “Windows port of PrimeIntellect-ai/prime-agent… All credit for the agent runtime, daemon, and bridge belongs to the Prime Intellect team.”

#### 11. CI green on default branch — **VERIFIED**

```text
default_branch=master
gh run list --repo cayleb-james2008/sophos --branch master --limit 1
→ conclusion=success  status=completed  name=CI
  displayTitle="docs: add the rendered launch video to the README"
  url=https://github.com/cayleb-james2008/sophos/actions/runs/35620248670
  createdAt=2026-09-21T15:37:54Z → 2026-09-21 11:37:54 EDT
```

Prior run on same branch also `success`.

#### 12. LICENSE present — **VERIFIED**

```text
path=LICENSE  type=file  size=1137
raw head: "MIT License"
Copyright (c) 2025 Mario Zechner / 2026 Prime Intellect / 2026 Cayleb James
```

---

### `solomon` (`main`)

#### 9. README try-path — **VERIFIED**

Explicit try-path quote (README intro):

> **To try it:** clone this repo, run the gate with `cd src-tauri && cargo test`, then launch the dashboard with `cargo run --release`.

`## Quickstart` copy-pasteable commands:

```sh
cd src-tauri && cargo test
cargo run --release          # -> src-tauri/target/release/solomon.exe
cargo build --release
solomon run-improver --repo <path> --name <name> --once
```

Documented blockers in `## What works today`: Tauri GUI / NSIS need Windows; Linux `cargo test` had 2 env/toolchain failures recorded honestly.

#### 10. README honesty / limits — **VERIFIED**

Quotes from `## Honest status`:

- “**Solomon (the harness) is real and running.** …”
- “**The AI-CEO / autonomous-profit vision is in progress, not achieved.** … Solomon does **not** claim autonomous profit. No verified real-money profit is asserted here.”
- Python `solomon/` package called “experimental scaffolding, not part of the shipped app and not part of the CI gate.”
- `## What works today` records exact Linux results (1189 passed / 2 failed; clippy not clean on host) and lists Windows/credentials/external needs.

#### 11. CI green on default branch — **REFUTED**

```text
default_branch=main
gh run list --repo cayleb-james2008/solomon --branch main --limit 1
→ conclusion=failure  status=completed  name=ci
  displayTitle="docs: add the rendered launch video to the README"
  url=https://github.com/cayleb-james2008/solomon/actions/runs/35620246936
  createdAt=2026-09-21T15:37:53Z → 2026-09-21 11:37:53 EDT
```

Latest five default-branch runs are all `failure`. CI exists but latest default-branch conclusion is **not** success → bar FAIL for this item.

#### 12. LICENSE present — **VERIFIED**

```text
path=LICENSE  type=file  size=1069
raw head: "MIT License" / "Copyright (c) 2026 Cayleb James"
```

---

## Item rollup (7–12)

| Item | Scope | Verdict |
|---|---|---|
| 7 | GitHub login + site/local display name | **VERIFIED** |
| 8 | Owner of graded repos | **VERIFIED** |
| 9 | README try-path | **VERIFIED** (dotz, sophos, solomon) |
| 10 | README honesty/limits | **VERIFIED** (dotz, sophos, solomon) |
| 11 | CI green on default branch | **REFUTED** for `dotz` (failure) and `solomon` (failure); **VERIFIED** for `sophos` (success). Overall item 11 for the graded set: **REFUTED** (bar requires each graded repo success). |
| 12 | LICENSE at root | **VERIFIED** (dotz, sophos, solomon) |

### Blockers for PASS on 7–12 as a set

1. **dotz CI** latest `main` run conclusion=`failure` — https://github.com/cayleb-james2008/dotz/actions/runs/35656256732
2. **solomon CI** latest `main` run conclusion=`failure` — https://github.com/cayleb-james2008/solomon/actions/runs/35620246936

No repo contents were modified during this evidence gather.
