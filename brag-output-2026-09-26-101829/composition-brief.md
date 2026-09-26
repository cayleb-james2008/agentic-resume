# Hyperframes Composition Brief: Portfolio — cayleb-james2008

## Objective
Create a short launch-style brag video for the portfolio site (polished).

## Output
- Composition directory: `/home/cayleb/Work/projects/agentic-resume/brag-output-2026-09-26-101829/composition/`
- Rendered video: `/home/cayleb/Work/projects/agentic-resume/brag-output-2026-09-26-101829/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 18 seconds

## Source Material
- Project root: /home/cayleb/Work/projects/agentic-resume
- Primary files read: index.html, css/styles.css (:root tokens), resume/resume.md, DESIGN.md
- Product name: cayleb-james2008 portfolio
- Tagline / strongest claim: "A portfolio where every claim has a receipt." / "Work you can audit."
- Key UI or visual moment to recreate: the site's status-badge row and its evidence citation style
- Copy that must appear verbatim:
  - "A PORTFOLIO" / "where every claim has a receipt."
  - "dotz — local-first multi-agent coding dashboard · Rust/axum/Tauri"
  - "Sophos — Windows coding-agent project · credits Prime Intellect's Prime Agent"
  - "Industry AI Suite — ten workflow apps · receipts on every claim"
  - "SearchLift · evidence SL-SRC-823863169a · sha256 b4ed4de9…01c88 · 0 issues · 0 side effects"
  - "Work you can audit." / "cayleb-james2008.github.io"
  - Badges: "VERIFIED" / "UNVERIFIED" / "WIP · INCOMPLETE"

## Creative Direction
- Tone preset: polished
- Creative direction: quiet premium product film — restraint as confidence
- Interpretation: fewer scenes, longer holds, soft crossfades, no hype
- Angle: most portfolios assert; this one cites — the honesty labels are the design system
- Hook: "A PORTFOLIO" → "where every claim has a receipt."
- Outro / punchline: "Work you can audit." + the URL
- Avoid:
  - Hype language, exclamation marks
  - Any claim beyond the site's own copy
  - Dark theme (the site is light and editorial)

## Visual Identity
- Background: #F3F6F8
- Surface: #FFFFFF
- Text: #172B3A / #4B5D69
- Accent: #B6422A (signal) and #123F70 (focus blue for the citation)
- Rule lines: #C5D0D8
- Display font: system-ui bold, generous letter-spacing
- Visual references: the site's suite-index cards, project-status badge rows, evidence section

## Storyboard
Use the storyboard in `/home/cayleb/Work/projects/agentic-resume/brag-output-2026-09-26-101829/brag-plan.md` as the creative contract.

Scene summary:
1. Hook — 4s — "A PORTFOLIO" settles; "where every claim has a receipt." beneath
2. The projects — 6s — three editorial cards arrive one by one (dotz, Sophos, Industry AI Suite)
3. The citation — 4.5s — the SearchLift evidence line types out in focus-blue mono
4. The badges + outro — 3.5s — VERIFIED / UNVERIFIED / WIP·INCOMPLETE stamps parade, then "Work you can audit." + URL

## Audio
- Audio role: minimal professional accents
- Audio arc: warm low bed throughout, gentle fade
- Music: happy-beats-business-moves-vol-11-by-ende-dot-app.mp3
- Music treatment: 0.24 volume, fade from 16s
- Music cue guidance: preset JSON at /home/cayleb/.agents/skills/brag/assets/music/cues/happy-beats-business-moves-vol-11-by-ende-dot-app.music-cues.json — one strong-cue lock for the final "Work you can audit." landing
- Audio-reactive treatment: none
- Audio-coupled moments:
  - Scene 2 cards — soft drop per card
  - Scene 3 citation — very quiet key ticks
  - Scene 4 close — one soft bell, beat-locked
- SFX selection guidance: minimal; nothing loud; remove rather than add when in doubt
- SFX analysis guidance: /home/cayleb/.agents/skills/brag/assets/sfx/sfx-analysis.md
- Exact SFX choice: Hyperframes decides exact files/timestamps/density/volume
- Audio files: copy chosen music + SFX into composition/assets/

## Hyperframes Instructions
Load `hyperframes-core`, `hyperframes-animation`, `hyperframes-creative`, `hyperframes-keyframes`, `hyperframes-cli`. /brag owns angle, copy, tone, storyboard; Hyperframes owns composition structure, exact timing, mechanics, lint, render.

Requirements:
- Light editorial theme matching the live site's tokens exactly
- Generous whitespace; editorial scale; soft crossfades
- Keep all text readable; long holds
- 18 seconds total, 1920x1080
- At least one beat-locked major reveal marked `// beat-locked`
- Run `npx hyperframes check` before render — zero errors required
