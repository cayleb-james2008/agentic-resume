# BUILD-NOTES — demos v3 (grounded in GitHub reality)

**When:** 2026-09-22 (America/New_York)  
**Scope:** Rewrite project card copy + rebuild in-page demos so someone who knows the repos nods.  
**Deploy:** not in this pass (explicit). **PASS claim:** none.

## Grounding sources

| Project | Source of truth used |
|---|---|
| **dotz** | `cayleb-james2008/dotz` README — native-Rust axum + Tauri multi-agent *coding* dashboard; scout/planner/worker/reviewer; live workflow graph + tool chips; adversarial verify before land; ONNX memory; Open Design; multi-provider; Windows-first |
| **Sophos** | `cayleb-james2008/sophos` README (`master`) — Windows-native coding agent desktop; Tauri v2 + React + Node bridge; port of PrimeIntellect-ai/prime-agent (credited); chat / agents / inbox / skills / providers; beta; terminal-green / near-black aesthetic |
| **Solomon** | `cayleb-james2008/solomon` README — RSI control plane / fleet autopilot; observe → implement → project-native test gate → ship-or-revert; CEO planner; watchdog; honest-green ship gate; fail-closed `money_guard`; keystone: never hand-patches |
| **PDM Forge** | Existing case study + SIMULATOR doctrine — deepen UI, keep honesty banner |
| **apotheka-site** | Repo contents: `.nojekyll` + `assets/` + single `index.html` Depop/storefront lookbook — **not** an e-commerce backend |

GitHub profile description blurb for Solomon (“autonomous AI-tools business…”) is older marketing text; the **README** is the product-truth used for portfolio copy (matches operator brief).

## Copy changes

- `index.html` featured cards + every demo panel head: honest one-liners + accurate stacks.
- `projects.html` all six cards rewritten the same way (including apotheka as Depop/storefront).
- Removed wrong framings: “agent console toy”, “research desk verify/reject”, “impact/risk decision bench”, fake elixir catalog as if shop backend.

## Demo → real product mapping

### dotz (`#demo-dotz`)

| Demo surface | Real product analogue |
|---|---|
| Lead + scout / planner / worker / reviewer nodes | README agent roles + WORKFLOW fan-out |
| Tool chips streaming onto nodes (`memory_recall`, `bash`, `sandbox_run`, …) | Live workflow graph tool chips / `step_tool` events |
| Phase chip: decompose → fan-out → implement → **adversarial verify** → land | Verify-before-merge reviewer gate before result lands |
| Session log | Session / WebSocket stream feel (simulated) |

Not claimed: live LLM calls, real sandbox, or shipping installer from this page.

### Sophos (`#demo-sophos`)

| Demo surface | Real product analogue |
|---|---|
| Near-black shell + Σ mark + terminal-green accents **scoped to panel** | Prime Intellect design language from Sophos README |
| File tree stub + composer | Chat session + workspace focus |
| Tool stream: `read` / `edit` / `terminal` | Daemon tool calls (file + shell) via Node bridge |
| Provider chip (cycle) | Settings → Providers |
| βeta callout + prime-agent credit | README beta notice + credits |

Not claimed: live daemon, named pipes, or installer.

### Solomon (`#demo-solomon`)

| Demo surface | Real product analogue |
|---|---|
| Lane cards (dotz / sophos / self) with metric + backlog + RED/GREEN gate | Per-repo lanes in `repos.json` + improver contracts |
| Buttons: Observe → Implement → Gate → Ship/revert | Canonical RSI loop |
| Ship blocked when gate RED; ship PR path when GREEN | Honest-green ship gate / ship-or-revert |
| **Try money-out → DENY** | `money_guard.rs` fail-closed NO-MONEY-OUT |
| Supervisor notes | Supervisor / watchdog recovery messaging |

Not claimed: autonomous profit, live money, or overnight unattended daemon (doctrine: no background processes).

### PDM Forge (`#demo-pdm`)

| Demo surface | Case-study analogue |
|---|---|
| Checkout → Mutate → Gate → Ledger hash | Governed vault pipeline stages |
| Receipts list with hashes | Audit / ledger trail |
| **SIMULATOR** banner unchanged | Honesty: no SolidWorks, no vault, no production users |
| Tamper → deadbeef | Integrity break visibility |

### apotheka-site (`#demo-apotheka`)

| Demo surface | Real repo |
|---|---|
| Tabbed gallery: Hero / Vault grid / Policies / Footer | Sections of the real static `index.html` |
| STOREFRONT honesty banner | Checkout is Depop; repo is front door + lookbook |
| Removed fake elixir/tool/kit mosaic shop | Avoids inventing e-commerce backend |

## Design / a11y notes

- Catppuccin mocha **purple** direction retained site-wide; Sophos terminal-green is **panel-scoped** only (`.demo-panel--sophos` / `.sophos-shell`).
- Tap targets ≥44px; demos use click/submit only (no hover-required controls).
- `prefers-reduced-motion: reduce` shortens demo timers and kills chip pulse / hero motion (existing `site.js` poster path unchanged).
- Mobile: workflow graph + Sophos layout stack under 720px; lane board single column.

## Files touched

- `index.html`, `projects.html`
- `demos.js` (full rebuild)
- `styles.css` (demo section rebuild; theme tokens unchanged)
- `design/BUILD-NOTES-demos-v3.md` (this file)

## Out of scope

- Vercel deploy / promotion
- Gauntlet PASS claim
- Changing product repos (dotz / sophos / solomon / apotheka-site)
