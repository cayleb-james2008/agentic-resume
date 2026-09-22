# BUILD-NOTES v5 — UI BUILDER (greenfield)

**Date:** 2026-09-22 (America/New_York)  
**Role:** web-design-pipeline Build step · Lead Outis  
**Identity:** Cayleb Alvarez-James · `cayleb-james2008` · dark digital **bandit** (not nomad / NOMAD.LINK)

## Design read
Hire-ready personal portfolio for technical hiring managers; Swiss-editorial + dark digital bandit; mauve on Catppuccin-dark. Dials from DESIGN-v5: VARIANCE ~6 · MOTION ~5 · DENSITY ~3.

## Archive
Prior top-level site surfaces moved to `archive/pre-v5/` (index, projects, principles, styles, demos.js, site.js, projects/, vendor/, BUILD-RECEIPT). Git history preserved (move, not `rm` of history).

## What shipped
| Path | Role |
| --- | --- |
| `index.html` | Home: identity fold, work index (≥3 deep), about, contact |
| `projects/{dotz,sophos,solomon,apotheka,pdm-forge}.html` | Case studies with Problem → Role → Craft → Outcome |
| `css/styles.css` | DESIGN-v5 tokens as CSS variables |
| `js/main.js` | Nav + **one** GSAP signature beat + hero video gating |
| `assets/img/bandit-mark.svg` | **PLACEHOLDER** mark |
| `assets/img/hero-poster-bandit.svg` | **PLACEHOLDER** poster |
| `assets/video/hero-reel.mp4` | Slot wired; file absent until Veo (pre-v5 coffee reel archived — not primary) |
| `assets/PLACEHOLDERS.md` | Asset pipeline slots for Cayleb ChatGPT image gen / Veo |

## Skills nested
| Skill / doc | How used |
| --- | --- |
| FROZEN-BAR-v5 + bandit amendment | Acceptance floors; brand lock B1′ |
| BRIEF-v5 / DESIGN-v5 / preview notes | IA, tokens, hero/work/contact wireframes |
| NESTED-METHODS-v5 | Stack lock: static greenfield + GSAP CDN |
| HIGGSFIELD-CREATIVE-METHODS | Methods only — **no paid API**; Hero Frame First, poster+muted loop |
| taste-skill (anti-slop) | Design read + dials; ban SaaS mesh / equal cards / Inter-slate defaults |
| frontend-design | One aesthetic; semantic HTML; focus-visible; tokens |
| gsap-core | `gsap.matchMedia`, tweens, autoAlpha/y only |
| gsap-timeline | Choreographed flagship reveal |
| gsap-scrolltrigger | `once` play on Work flagship enter |
| gsap-performance | transform/opacity only; will-change on flagship |

## Signature motion (exactly one)
On first scroll into the Work flagship (`.work-card--flagship` / dotz): title + copy + visual ease from `y` + `autoAlpha`; thin mauve `.work-card__stamp` draws width once. Implemented inside `gsap.matchMedia` with `(prefers-reduced-motion: reduce)` branch that snaps to static finals (no scrub, no continuous hero/nav animation).

## Media pipeline (Cayleb)
- Do **not** call paid Higgsfield from agents.
- Cayleb: **ChatGPT image gen** for bandit mark / hero stills/frames; **Veo** for hero reel from approved still.
- Site does not block on media: placeholders ship; replace files in place.

## A11y / mobile
Skip link; `:focus-visible` mauve ring; Hire CTA ≥4.5:1 (`#11111b` on `#cba6f7`); nav toggle 44px; 390px stack without gadget wall.

## Preview
```bash
cd /workspace/agentic-resume && python3 -m http.server 8765
# open http://127.0.0.1:8765/
```

## Forbidden (honored)
No Vercel production alias cutover. No self-grade PASS. No nomad mark as primary. No spending / Higgsfield API.
