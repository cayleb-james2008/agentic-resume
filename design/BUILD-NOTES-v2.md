# Build notes v2 — interactive energetic portfolio
Date: 2026-09-22 (America/New_York)
Builder: worker (Gauntlet). Briefs not rewritten.

## Goal
Upgrade the mocha portfolio into an interactive, mobile-first experience: scroll-linked hero, five in-page demos, original character/imagery, hire-ready voice.

## Stack
Vanilla HTML / CSS / JS. No npm. Google fonts (Syne + DM Sans) loaded once. Assets under `assets/img/` (SVG mascot, hero poster, five project scenes).

## Hero scroll animation
- Section `#scroll-hero` with a tall `.scroll-hero__track` (≈280vh) and sticky viewport stage.
- Canvas `#hero-canvas` scrubbed by scroll progress (5 beats: Spawn → Research → Decide → Gate → Ship).
- Poster `assets/img/hero-poster.svg` for first paint and `prefers-reduced-motion: reduce` (JS adds `.is-poster`, skips scrub; CSS forces poster).
- Progressive enhancement: if `animation-timeline: scroll()` is supported, mascot gets a scroll-driven bob (killed under reduced motion).
- Progress bar + live beat hint (`#scroll-hint`).

## In-page demos (real state, not GIFs)
| Demo | Selector | How to try |
|------|----------|------------|
| **dotz** agent console | `#demo-dotz` | Tap **Spawn scout/builder/critic**, then **Run pipeline** — log lines and status update. **Clear** resets. |
| **sophos** research desk | `#demo-sophos` | Enter a query → **Run research** → cards appear → **Verify** / **Reject** each; status counts change. |
| **solomon** decision bench | `#demo-solomon` | Pick scenario, drag Impact/Risk sliders, **Weigh verdict** — verdict box tone + score update. |
| **PDM Forge** vault toy | `#demo-pdm` | Read **SIMULATOR** banner → **Check out part** → **Run gate** → **Release (sim)** → optional **Inject tamper**. Stats + log update. |
| **apotheka-site** mosaic | `#demo-apotheka` | Tap filter chips (All/Elixirs/Tools/Kits) → mosaic tiles filter → tap a tile to select. |

Scripts: `demos.js` (demo state), `site.js` (nav, reveal, scroll scrub).

## Imagery / character
- `assets/img/mocha-mascot.svg` — espresso-cup mascot (wink, steam, latte art). Used in hero + “How I work”.
- `assets/img/hero-poster.svg` — cinematic desk/console poster.
- `assets/img/scene-{dotz,sophos,solomon,pdm,apotheka}.svg` — project stills (mocha world, not generic AI purple).
- GenerateImage unavailable in builder environment → distinctive SVG/CSS scenes (still count as imagery per brief).

## Mobile-first
- Usable at 390px: single-column demo heads, 2-col mosaic, ≥44px taps (`.btn`, `.chip`, `.mosaic-tile`, nav links, ranges).
- `overflow-x: clip` on `html`/`body`; no horizontal scroll intended.
- Demos operable without hover (buttons/inputs/ranges/chips).

## Identity / copy
- Display name **Cayleb Alvarez-James** only; GitHub **cayleb-james2008** only.
- Hire-ready energetic copy; demos labeled Demo / SIMULATOR; no equal-weight defensiveness.

## Files touched (v2)
- `index.html` — scroll hero + five demos + mascot
- `styles.css` — scroll hero, demo panels, mobile hardening
- `site.js` — canvas scrub + reduced-motion poster path
- `demos.js` — new
- `assets/img/*` — mascot, poster, scenes
- `design/BUILD-NOTES-v2.md` — this file
- `design/BRIEF-v2-interactive.md`, `design/gauntlet/*` — brief/bar (lead)

## Out of scope
No Vercel deploy from worker. No npm build. Parent git-deploys.

## How to preview locally
```bash
cd agentic-resume
python3 -m http.server 8765
# open http://127.0.0.1:8765/
```
