# Build notes — energetic redesign
Date: 2026-09-22
Builder lane: high-craft frontend + CSS/JS motion (no npm)

## What changed

- Visual system: hotter mocha/latte tokens, deeper espresso `--bg`, brighter `--accent` / `--accent-hot`, warmer shadows and ambient glows.
- Typography: Google font pair **Syne** (display) + **DM Sans** (body), loaded once via fonts.googleapis.com on every page.
- Motion: kinetic hero entrance (staggered `.hero-line`), ambient glow pulse, card hover lift + sheen sweep, primary CTA sheen + soft pulse. All killed under `prefers-reduced-motion: reduce`.
- Copy: punched hero headlines on Home / Projects / Principles; kept hire-ready voice; no equal-weight / honesty-theater language.
- Structure: unified nav (`nav.main`, `.topbar`, `.nav-toggle`), footer, skip link `#main`, `site.js` defer, and relative CSS/JS/favicon paths on all pages including `projects/pdm-forge.html`.
- Favicon colors aligned to new tokens.
- PDM Forge case study: kept simulator honesty banner and factual content; chrome matched to site shell.

## Tokens

| Token | Value | Role |
|-------|-------|------|
| `--bg` | `#140f0c` | Deep espresso page ground |
| `--surface` | `#221c17` | Raised mocha panels |
| `--text` / `--foam` | `#f7efe6` | Near-cream primary text |
| `--muted` | `#a89888` | Warm grey-brown secondary |
| `--accent` / `--latte` | `#e0b48a` | Bright latte accent |
| `--accent-hot` | `#f0c9a0` | CTA / glow secondary |
| `--radius` | `16px` | Generous corners |
| `--shadow` / `--shadow-warm` | warm black + espresso | Lift, not blue glow |

## Fonts

- Display: Syne 600/700/800
- Body: DM Sans 400–700 (opsz axis)
- Mono: system ui-monospace stack (tables / receipts)

## Motion

- CSS only + light `site.js` (IntersectionObserver reveal, sticky header, mobile nav, hero stagger class).
- Hero: immediate `is-in` on load + `hero-rise` per child.
- Cards: `translateY(-8px)` + radial glow + diagonal sheen `::after`.
- Primary CTA: gradient sheen animation + `cta-pulse` box-shadow; hover sheen sweep.
- Ambient: body radial gradients + slow brightness/saturate alternate.
- Reduced motion: animations/transitions forced off; reveals shown instantly; hover transforms nulled.

## Pages touched

`index.html`, `projects.html`, `principles.html`, `projects/pdm-forge.html`, `styles.css`, `site.js`, `favicon.svg`, `README.md`, `design/BUILD-NOTES.md`

## Out of scope (per brief)

No Vercel deploy from builder. No npm. No new frameworks.
