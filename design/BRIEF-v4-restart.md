# Brief v4 — Complete site restart (2026-09-22)
Author: lead (brief only). Builder must not rewrite goals.

## Why restart
Cayleb rejected the current layout entirely. Patching is forbidden. Greenfield IA + layout + components.

## Audience / job
Hiring managers on phone + laptop. <45s: energy, competence, play a real demo, open resume/GitHub.

## Locked taste (do not reopen)
- **Palette:** Catppuccin Mocha dark purple (#11111b / #1e1e2e, mauve #cba6f7, lavender #b4befe) — not latte brown
- **Art:** Grungier Y2K / cyberpunk / anime (CRT grit, chroma, scanlines, sticker wear). NOT soft kawaii
- **Motion:** anime.js + one UI library (Shoelace CDN or Pico) — coherent controls
- **Hero:** `<video>` for real MP4 (`assets/video/hero-reel.mp4` placeholder until Cayleb swaps model-generated file). Scroll-linked optional; reduced-motion → poster
- **Mascot/logos:** One character system matching the video; project marks match that grit
- **Copy/demos MUST stay truthful:**
  - **dotz** — multi-agent coding dashboard (axum+Tauri); scout/planner/worker/reviewer; adversarial verify; Windows-first desktop
  - **Sophos** — Windows coding agent; Prime Intellect prime-agent port (credit); Tauri+React; beta
  - **Solomon** — RSI fleet control plane; observe→implement→gate→ship-or-revert; fail-closed money
  - **apotheka-site** — static Depop/storefront lookbook (honest)
  - **PDM Forge** — SIMULATOR case study only

## Layout goals (new)
- Distinct from prior sticky-scroll-hero + stacked demo walls
- Clear visual hierarchy: identity → proof video → work → deep demos → contact
- Mobile-first 390px; tap ≥44px; no horizontal overflow
- High craft, cyberpunk editorial — not generic AI portfolio grid

## Stack
Static HTML/CSS/JS preferred. Vendor anime.js. One UI kit via CDN. No React build unless clearly worth it and still static-exportable.

## Deliverables
1. New `index.html` / `projects.html` / `principles.html` (or equivalent IA)
2. New `styles.css`, `site.js`, deep `demos.js`
3. Updated assets under `assets/`
4. `design/BUILD-NOTES-v4-restart.md`
5. Commit+push main as Cayleb Alvarez-James <106564347+cayleb-james2008@users.noreply.github.com>

## Out of scope
Weakening honesty labels; fake shop backends; claiming model-generated video if still ffmpeg placeholder; Vercel deploy (parent); PASS claims.

## Done when
Local screenshots 390 + 1280 look like a different site; demos still deep + truthful; anime.js motion with reduced-motion off-ramp; pushed to origin/main.

## Mascot lock (2026-09-22)
Cyber-nomad only (hood/pack/terminal). Coffee mug retired.
