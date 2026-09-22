# BUILD NOTES — Y2K / cyberpunk art + motion (2026-09-22)

Worker: art/motion. Parallel v4 greenfield owns IA; this pass supplies grit assets, anime.js motion, unified UI kit wiring.

## Done
1. **Assets (grungy, not soft kawaii)**
   - `assets/img/y2k/mascot-cyberpunk.png` + symlink `assets/img/stickers/mascot.png` + copy `mocha-mascot.png`
   - Cyber SVG lockups: `mocha-mascot.svg`, `hero-poster.svg`, `scene-{dotz,sophos,solomon,pdm,apotheka}.svg`, `favicon.svg`
   - Vault still: `scene-pdm-y2k.png` / `y2k/vault-gate-cyber.png` — wired as PDM demo art
   - Soft-kawaii / screenshot dumps quarantined under `assets/img/y2k/_rejected-*/` (gitignored)
2. **Motion**
   - `vendor/anime.min.js` on all pages
   - `site.js` v4: hero/mast entrance, mascot float+glitch, demo/ticket reveals, CTA hover/press, CRT play, channel→Shoelace lab tabs
   - `prefers-reduced-motion`: no anime.js motion; CRT stays poster
3. **UI kit**
   - **Shoelace 2.20.1 CDN** (dark theme + autoloader) on index + secondary pages — one vocabulary (`sl-tab-group`, tokens). Pico removed from secondary pages to avoid dual kits.
4. **Grit**
   - Catppuccin mauve tokens kept; scanlines + SVG turbulence noise overlay; chroma shadows on demo art; CRT scan/chroma layers in markup
5. **Truth copy**
   - Dotz / Sophos / Solomon / PDM SIMULATOR / apotheka wording left intact (parallel worker owns demo truth).

## TODO / gaps
- Hero MP4 still placeholder — regenerate stills when Cayleb drops model Y2K reel
- `video-frames/` still soft-era leftovers (unused by v4 HTML)
- `motion.js` leftover from mid-pass — optional; motion lives in `site.js` now
- No Vercel deploy. No PASS claim.

## Verify
```bash
python3 -m http.server 8765 -d /workspace/agentic-resume
# 390 + 1280; toggle prefers-reduced-motion in DevTools
```
