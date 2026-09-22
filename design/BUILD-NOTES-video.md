# Hero reel — build notes

## Asset
- **Path:** `assets/video/hero-reel.mp4`
- **Format:** H.264 (yuv420p / yuvj420p), 1280×720, 16:9, muted (no audio track)
- **Duration:** ~8.0s (ffprobe)
- **Source frames:** `assets/img/video-frames/01-spawn.png` … `05-ship.png`
  - Beats 1–2: provided GenerateImage PNGs (Catppuccin purple desk)
  - Beats 3–5: PIL-rendered Catppuccin Mocha scenes (decide / vault / ship)
- **Encode:** ffmpeg `xfade` fade between stills (0.5s), 30 fps, `+faststart`

## Story beats
1. **Spawn** — dotz · agent runtime  
2. **Research** — sophos · sourced claims  
3. **Decide** — solomon · weighed verdict  
4. **Gate** — PDM Forge · simulator vault  
5. **Ship** — apotheka · storefront mosaic  

## How scroll scrub works
- Hero markup: `<video id="hero-video" src="assets/video/hero-reel.mp4" muted playsinline preload="auto" poster="assets/img/hero-poster.svg">`
- `site.js` `initScrollHero()` measures progress along `.scroll-hero__track` (sticky viewport / track height) → `p ∈ [0,1]`
- When motion is allowed: `video.currentTime = p * duration` (scrub; no autoplay reliance)
- Progress bar `#hero-progress` mirrors `p`; hint text updates by beat
- `prefers-reduced-motion: reduce`: section gets `is-poster`, video paused at `t=0`, poster SVG shown
- Canvas `#hero-canvas` remains in DOM but is `hidden` / optional; video is the primary hero

## Theme
Catppuccin Mocha purple-leaning CSS variables in `styles.css` (`--bg` `#11111b` … `--accent` mauve `#cba6f7`, `--accent-hot` lavender `#b4befe`, peach `--mocha` `#fab387` for secondary warmth). Favicon + scene SVGs remapped to the same palette.
