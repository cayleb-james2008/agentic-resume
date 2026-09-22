# Build notes — v4 complete site restart (2026-09-22)

Builder pass against `design/BRIEF-v4-restart.md`. Greenfield IA + layout; not a patch of the sticky-demo-wall.

## What changed (IA)

| Before (rejected) | After (v4) |
|---|---|
| Sticky scroll-scrub hero + stacked demo wall | CRT **broadcast** hero with play/pause `<video>` |
| Soft mocha cup mascot | **Cyber-nomad** sticker (`assets/img/y2k/mascot-cyber-nomad.png`) |
| Classic topbar + card grid demos | Dock chrome + **channel dial** + **one Shoelace lab console** (tabbed) |
| Principles as plain list | Terminal / manifesto dump |
| Projects as equal cards | Asymmetric **zine / evidence board** |

Old HTML/CSS/JS kept under `archive/pre-v4/` for reference.

## Stack

- Static HTML / CSS / JS
- `vendor/anime.min.js` (v3.2.2) — entrances + mascot bob; gated by `prefers-reduced-motion`
- Shoelace 2.20.1 CDN — tabs, drawer, dark theme tokens remapped to Catppuccin Mocha
- Fonts: Syne + DM Sans + IBM Plex Mono

## Hero video

- Real `<video src="assets/video/hero-reel.mp4">` with `poster="assets/img/hero-poster.svg"`
- Default: poster visible until user hits **Play reel** (muted loop)
- `prefers-reduced-motion: reduce` → poster only, play control hidden
- **Not** scroll-linked scrub (that pattern was rejected)

## Character system

- Primary mark: cyber-nomad (hooded wanderer, pack, handheld terminal, Y2K grit)
- Symlink: `assets/img/stickers/mascot.png` → `../y2k/mascot-cyber-nomad.png`
- Coffee-cup / CAFFEINE.EXE mascot **scrapped** per Cayleb art change mid-build
- Brand chip: `NOMAD.LINK`

## Truthful demos (preserved from HEAD 6c72a55 copy)

| Channel | Claim |
|---|---|
| **dotz** | Multi-agent coding dashboard (axum+Tauri); scout/planner/worker/reviewer; adversarial verify; Windows-first |
| **Sophos** | Windows coding agent; Prime Intellect prime-agent port (credit); Tauri+React; beta |
| **Solomon** | RSI control plane; observe→implement→gate→ship-or-revert; fail-closed money |
| **PDM** | SIMULATOR case study only — honesty banner |
| **apotheka** | Static Depop/storefront lookbook — not a cart backend |

`demos.js` keeps the deep interactive surfaces; markup IDs unchanged so logic ports cleanly into the tab panels.

## Mobile-first

- Layout authored around ~390px; tap targets ≥44px; horizontal overflow avoided (tables scroll inside `.table-scroll`)
- Channel dial is a horizontal snap strip on narrow viewports
- Shoelace drawer for nav &lt; 860px

## Out of scope / honesty

- No Vercel deploy in this pass
- No PASS claim
- Hero MP4 may still be a placeholder reel until Cayleb swaps a model-generated file — UI does not claim otherwise
- Soft kawaii `assets/img/mocha-mascot.svg` left on disk unused

## Local preview

```bash
cd /workspace/agentic-resume
python3 -m http.server 8080
# open http://localhost:8080
```

## Files touched (primary)

- `index.html`, `projects.html`, `principles.html`, `projects/pdm-forge.html`
- `styles.css`, `site.js`, `demos.js` (IDs preserved)
- `assets/img/hero-poster.svg`, `favicon.svg`, `assets/img/stickers/*`, `assets/img/y2k/mascot-cyber-nomad.png`
- `design/BUILD-NOTES-v4-restart.md`, `archive/pre-v4/*`
