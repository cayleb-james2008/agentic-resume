# BUILD-NOTES — v4 complete site restart

**When:** 2026-09-22 (America/New_York)  
**Author:** Builder (executor)  
**Brief:** `design/BRIEF-v4-restart.md` (authoritative — goals not rewritten)  
**Deploy:** not in this pass (no Vercel). **PASS claim:** none.

## Why / what changed

Cayleb rejected the sticky-scroll hero + stacked demo wall. This pass is a **greenfield IA**, not a patch.

| Before (pre-v4) | After (v4) |
|---|---|
| Sticky scroll-scrub hero | CRT **broadcast** panel with real `<video>` + Play control |
| Stacked demo walls | **One lab console** — Shoelace `sl-tab-group` (one surface at a time) |
| Soft mocha / latte risk | Catppuccin Mocha purple + grungy Y2K / cyberpunk stickers |
| Custom-only controls | **Shoelace** dark theme (picked over Pico) for drawer + tabs |
| — | Channel dial jumps the console |

Pre-v4 HTML/CSS/JS archived under `archive/pre-v4/`.

## IA

1. **Dock** — sticky chrome + Shoelace drawer on narrow viewports  
2. **Broadcast** — identity + CRT video (`assets/video/hero-reel.mp4`, honest placeholder label)  
3. **Channel dial** — five project punches → lab tab  
4. **Lab console** — deep demos (dotz / Sophos / Solomon / PDM / apotheka)  
5. **Boot / contact** — email, resume, projects, principles  

Also: `projects.html`, `principles.html` restyled to the same dock language.

## Stack

- Static HTML / CSS / JS  
- `vendor/anime.min.js` (v3.2.2, vendored)  
- Shoelace 2.20.1 via CDN (theme + autoloader)  
- No React build, no npm app toolchain  

## Truthful copy / demos

Content truth remains `design/BUILD-NOTES-demos-v3.md`:

- **dotz** — axum+Tauri multi-agent coding dashboard; scout/planner/worker/reviewer; adversarial verify  
- **Sophos** — Windows coding agent; prime-agent credit; beta; panel-scoped terminal green  
- **Solomon** — RSI loop; ship-or-revert; fail-closed money_guard  
- **PDM Forge** — SIMULATOR only (banner kept)  
- **apotheka-site** — static Depop lookbook (STOREFRONT banner)  

Demo element IDs unchanged so `demos.js` logic ports; UI chrome rebuilt for the console layout.

## Motion / a11y

- anime.js entrances, mascot float, tab panel mounts, CTA micro-press  
- `prefers-reduced-motion: reduce` → `motion-off`, no anime timelines, CRT stays on **poster**, timers in demos shortened  
- Tap targets ≥44px; mobile-first ~390px; no sticky-scroll scrub  

## Assets

- Mascot: `assets/img/y2k/mascot-cyberpunk.png` (+ `assets/img/stickers/mascot.png` symlink)  
- Vault art: `assets/img/y2k/vault-gate-cyber.png` (PDM intro)  
- Soft / wrong-shot art quarantined under `assets/img/y2k/_rejected-*`  
- Hero reel placeholder MP4 kept until Cayleb swaps model-generated file  

## Files

- New / replaced: `index.html`, `projects.html`, `principles.html`, `styles.css`, `site.js`, `demos.js`, `favicon.svg`, `README.md`  
- Added: `vendor/anime.min.js`, `design/BUILD-NOTES-v4-restart.md`, `archive/pre-v4/*`  
- Case study `projects/pdm-forge.html` kept (legacy topbar aliases in CSS)

## Out of scope

- Vercel deploy / promotion  
- Gauntlet PASS claim  
- Claiming the hero MP4 is model-generated  
- Fake shop backends / live vaults / live money  

## Done bar

Stranger at 390 + 1280 should see a **different website** (broadcast CRT + dial + single lab console) vs the old sticky-scroll demo wall; demos still deep + honest; pushed to `origin/main`.
