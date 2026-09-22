# Nested methods v5 — locked before craft build
Date: 2026-09-22 · Lead lock (not a stack tour for Cayleb)

## Skills nested into this rebuild
| Lane | Source | How it binds the build |
| --- | --- | --- |
| Acceptance | `design/gauntlet/FROZEN-BAR-v5-breathtaking.md` | Only PASS/FAIL authority for SITE craft |
| Product brief | `design/BRIEF-v5-breathtaking.md` | Audience / job / one action / Persuade route |
| Evidence | `design/research/PORTFOLIO-BEST-PRACTICES-EVIDENCE.md` | Awwwards weight, case-study depth, one signature |
| Anti-slop portfolio craft | taste-skill (`design-taste-frontend`) | Infer dials; ban AI-slop patterns; animation discipline |
| Production UI craft | `frontend-design` | One aesthetic direction; typography-led; no generic SaaS purple |
| Motion engine | Official GSAP skills: core, timeline, ScrollTrigger, performance | One signature scroll/timeline moment; `gsap.matchMedia` + `prefers-reduced-motion`; transform/opacity only |
| Modern platform | Modern Web Guidance (Chrome) + current CSS | Semantic HTML, focus-visible, container-friendly layout, no legacy layout hacks; prefer modern APIs where they replace polyfills |

## Motion contract (GSAP)
1. Exactly **one** signature moment (scrubbed or choreographed timeline tied to story).
2. All decorative motion created inside `gsap.matchMedia()` with a `(prefers-reduced-motion: reduce)` branch that uses `duration: 0` / no scrub / static finals.
3. Animate **x/y/scale/rotation/opacity (autoAlpha)** only — never width/top/left for motion.
4. Register ScrollTrigger once; kill/revert on teardown; refresh only after real layout changes.
5. No second animation system (no anime.js + GSAP together). Shoelace/other UI kits only if they do not fight the motion clock.

## IA contract (persuade)
1. Above-the-fold: name + one positioning sentence + one primary CTA.
2. Work: ≥3 deep case studies (problem → role → craft → outcome), not a gadget wall.
3. Truth locks: dotz, Sophos, Solomon, apotheka-site; PDM Forge = simulator case study only.
4. Brand: dark digital bandit (clean, premium), mauve on dark, Swiss negative space. CRT/scanline/sticker-grunge as primary = FAIL.

## Stack decision (lead)
- **Ship craft as a greenfield static site** in-repo (replace rejected v4 surfaces; archive prior under `archive/pre-v5/`).
- GSAP + ScrollTrigger via official CDN or npm pin; no Lenis unless scroll jank forces it (add only with single-ticker sync).
- No Next.js migration in this piece — evidence clusters on Next for awards, but craft floors (type, space, case studies, one signature) do not require it; migration is a later piece if needed after craft PASS.

## Publish rule
Draft + screenshots for Cayleb grading. **No production alias cutover** until explicit sign-off for that exact deploy.
