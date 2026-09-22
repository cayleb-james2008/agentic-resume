# Gauntlet blind critic V2 — SITE (1–7 spot) + amendments 13–16

**Role:** Blind critic (did not build).  
**Source under grade:** `/workspace/agentic-resume` @ `e19c7b6dce00f35ed095c396d2ab672a4104aa58` (`e19c7b6` — Interactive v2: scroll hero, five in-page demos, mocha mascot).  
**Live alias:** `https://agentic-resume-nine.vercel.app/`  
**When:** 2026-09-22 ~07:27–07:29 America/New_York (ET).  
**Hard rules:** No weakened checks; no invented evidence; **no whole-Gauntlet PASS** (item 11 CI may still fail; items 8–12 not fully re-graded here).

**Live↔source match:** production HTML/CSS/JS md5 match workspace:
- `index.html` md5 `faf4c7161655ed8c31178af2a9aba142` (live curl + source; etag same)
- `styles.css` `39b3d33d…`, `demos.js` `f87b02c2…`, `site.js` `ecb30800…`
- Vercel production deployment `dpl_DQDmN7tBRz1Vt5L7QKHx8hvBya89` — `state=READY`, `target=production`, `githubCommitSha=e19c7b6…`, created **2026-09-22 07:27:03 ET**

**Evidence artifacts:** `design/gauntlet/critic-v2-evidence/` (Chrome headless screenshots + `results.json`).

---

## Overall SITE + amendments score guidance

| Scope | Items | Verdicts this pass | Score guidance |
|---|---|---|---|
| SITE core | 1–6 | All **VERIFIED** (spot-check on live @ `e19c7b6`) | **1.0** |
| Identity | 7 | **VERIFIED** (spot-check) | holds |
| Amendments | 13–16 | All **VERIFIED** | **1.0** |
| SITE+amendments combined | 1–6 + 13–16 (10 checks) | 10/10 VERIFIED | **1.0** |

### Required fixes before SITE+amendments PASS
**None** for items 1–6 and 13–16.

### Whole Gauntlet
**Do not claim PASS.** Repo bar items **9–12** (especially **11 CI green on default branch**) were **not** re-verified in this critic pass; prior inherit/evidence still flags CI risk. This document only grades live SITE + amendments 13–16.

---

## Amendments 13–16 (primary grade)

### 13. Mobile usable @ 390px — no horizontal overflow; demos operable without hover — **VERIFIED**

**Evidence:**
- Chrome headless viewport `390×844`, `isMobile`/`hasTouch`: `documentElement.clientWidth=390`, `scrollWidth=390`, `hasHOverflow=false`, `overflowCount=0` (no element `getBoundingClientRect().right > clientW+1`). See `critic-v2-evidence/results.json` → `overflow390`; screenshots `mobile-390.png`, `mobile-390-at-demos.png`.
- Source hardening: `html/body { overflow-x: clip }`, `@media (max-width: 400px)` / `720px` demo/stack rules, tap targets `min-height/width: 44px` on `.btn, .demo-btn, .chip, …` (`styles.css` ~600–619, 963–983).
- Demos operable **without hover**: `demos.js` wires only `click` / `submit` / `input` listeners (no `mouseenter`/`mouseover`/`hover` handlers). Live tap simulation @ 390px changed state for all five demos (see item 15).

---

### 14. Hero scroll animation — scroll-linked; static under prefers-reduced-motion — **VERIFIED**

**Evidence (motion allowed):**
- Live: `.scroll-hero` gets `is-live has-scroll-timeline`; canvas `display:block; opacity:1`; hint starts `Scroll to scrub the story →`; progress `0%`.
- After scroll into track: hint `Beat 4 / 5`, progress `61.6%`; near end: `Beat 5 / 5`, progress `94.9%` (`scroll-hero.mjs` / screenshot `scroll-hero-mid.png`).
- Source: `site.js` `initScrollHero` measures scroll progress on `.scroll-hero__track` and redraws canvas (`site.js:59–242`); early-return when `prefers-reduced-motion: reduce` (`posterMode`, `is-poster`, hint `Reduced motion — static poster`, `site.js:71–76`).

**Evidence (reduced motion):**
- Emulated `prefers-reduced-motion: reduce`: section classes `scroll-hero is-poster` (not `is-live`); hint **`Reduced motion — static poster`**; poster opacity `1`; canvas `display:none`; `animatedCount=0` (no computed `animation-name` other than none).
- After scroll: still `is-poster`, same hint, progress width `0px` — **no scrub**. Screenshot `reduced-motion-hero.png`.
- CSS: second reduce block hides live canvas / forces poster (`styles.css:986–990`); global reduce kills infinite ambience/sheen (`styles.css:585–594`).

---

### 15. In-page demos — landing has interactive demos for dotz, sophos, solomon, + PDM or apotheka; each changes on-page state — **VERIFIED**

Bar requires demos for **dotz, sophos, solomon**, and **PDM or apotheka**. Live landing includes **all five** (`#demo-dotz|sophos|solomon|pdm|apotheka`).

**Chrome @ 390px click/tap (no hover) — state deltas:**

| Demo | Before → After | State change |
|---|---|---|
| **dotz** | `Agents: 0 () · Pipeline idle` → `Agents: 1 (scout) · Pipeline running`; log contains `spawn agent scout` | **yes** |
| **sophos** | `No cards yet…` → `3 sourced cards…`; `cardCount=3` | **yes** |
| **solomon** | `Adjust weights, then weigh.` → `CONDITIONAL — ship with guardrails… score 30` | **yes** |
| **PDM** | state `WIP` / part `—` → `DesignReview` / `PFV-100_revB` | **yes** |
| **apotheka** (bonus) | `Showing 6 items` → `Showing 2 items · elixir` (tiles 6→2) | **yes** |

Honesty labels present on-page: tags `Demo · …`; PDM `SIMULATOR` banner; section subcopy “not live production systems” (`index.html` demos section). Screenshot `demos-after-clicks.png`.

---

### 16. Character/imagery — original mascot + project imagery present and loadable — **VERIFIED**

**Evidence:**
- Live GET **200** for: `mocha-mascot.svg`, `hero-poster.svg`, `scene-{dotz,sophos,solomon,pdm,apotheka}.svg` (sizes match workspace files).
- In-page `<img>` audit: all eight image references `complete=true`, `naturalWidth>0`, **zero** failed `/assets/img/` responses.
- Mascot present in hero (`.scroll-hero__mascot`) and about figure with caption “House mascot — mocha energy…”; SVG aria-label `Mocha mascot — steaming espresso cup with a confident wink` (authored SVG under `assets/img/`, not a stock CDN).
- Project scene SVGs sit in each demo panel head.

Screenshots: `mobile-390.png`, `reduced-motion-hero.png`, `atf-1280.png` show mascot + poster/scene art rendered.

---

## Spot-check items 1–7 (still hold on live @ `e19c7b6`)

| # | Item | Verdict | Live evidence (this pass) |
|---|---|---|---|
| 1 | Production live + 200 | **VERIFIED** | `GET` alias → **HTTP 200**; `<title>Cayleb Alvarez-James — Portfolio</title>`; visible H1 + header name; HTML md5 matches `e19c7b6`; prod deploy SHA `e19c7b6`. Screenshot `atf-1280.png` / `mobile-390.png`. |
| 2 | Hero hierarchy | **VERIFIED** | Computed H1 @ 1280px: **`60.35px`**, weight `800`, Syne; authored clamp on `.scroll-hero__overlay h1` is `clamp(2.25rem, 7vw, 3.55rem)` (`styles.css:667`). Primary CTA `a.btn.primary` → `#demos` (“Try a demo”). `:focus-visible` outline measured `rgb(240,201,160) solid 2px` / offset `3px`. |
| 3 | Primary CTA contrast ≥4.5:1 | **VERIFIED** | Text `#140f0c` vs gradient stops `#f0c9a0` **12.30:1**, `#e0b48a` **10.03:1**, `#b8895f` **6.15:1** (all ≥4.5:1). |
| 4 | Reduced motion | **VERIFIED** | Emulation: no continuous animations (`animatedCount=0`); hero static poster path (item 14). Global CSS `animation/transition: none !important` under reduce. |
| 5 | Outbound project links | **VERIFIED** | Live links to `github.com/cayleb-james2008/{dotz,sophos,solomon,apotheka-site}` each **HTTP 200**. |
| 6 | Honesty on demos/case studies | **VERIFIED** | Demo/simulator/case-study wording on landing + PDM panel; honesty banner denies production users/vault; site copy does not claim live revenue/customers (overclaim terms only in meta/docs or honesty negations). |
| 7 | GitHub login + display name | **VERIFIED** | Profile title `cayleb-james2008 (Cayleb Alvarez-James) · GitHub`; site header + footer exact `Cayleb Alvarez-James` on live index. |

---

## Items 8–12 (not re-graded; guidance only)

| Item | This pass | Note |
|---|---|---|
| 8 Attribution | spot prior / not re-run | Owner expected `cayleb-james2008`; not blocking SITE+amendments. |
| 9 README try-path | **UNVERIFIED** | Out of scope for this SITE/amendments critic. |
| 10 README honesty | **UNVERIFIED** | Out of scope. |
| 11 CI green | **UNVERIFIED** (treat as **risk**) | Do **not** PASS whole Gauntlet while this is unchecked / historically red. |
| 12 LICENSE | **UNVERIFIED** full set | Prior notes flagged `apotheka-site` LICENSE gap; not re-fetched here. |

---

## Summary table

| # | Bar item | Verdict |
|---|---|---|
| 1 | Production live + 200 | **VERIFIED** |
| 2 | Hero hierarchy | **VERIFIED** |
| 3 | Primary CTA contrast | **VERIFIED** |
| 4 | Reduced motion | **VERIFIED** |
| 5 | Outbound project links | **VERIFIED** |
| 6 | Honesty demos/case studies | **VERIFIED** |
| 7 | GitHub login + display name | **VERIFIED** |
| 13 | Mobile 390px / no overflow / no-hover demos | **VERIFIED** |
| 14 | Scroll hero + reduced-motion static | **VERIFIED** |
| 15 | In-page demos (dotz/sophos/solomon + PDM & apotheka) | **VERIFIED** |
| 16 | Mascot + imagery loadable | **VERIFIED** |

**SITE (1–6) score guidance: 1.0**  
**Amendments (13–16) score guidance: 1.0**  
**SITE+amendments combined guidance: 1.0**  
**Whole Gauntlet: NOT PASS claimed** (CI / repo items outstanding).
