# Gauntlet bar — portfolio max-quality (frozen 2026-09-22)
PASS only when ALL items are VERIFIED with a named check.

## Site (energetic + hire-ready)
1. **Production live + 200** — `GET https://agentic-resume-nine.vercel.app/` returns HTTP 200; HTML `<title>` and visible H1 identify Cayleb Alvarez-James / portfolio. Verify: URL fetch + screenshot of above-the-fold.
2. **Hero hierarchy (energetic, measurable)** — Above-the-fold hero uses a display-style heading with computed `font-size` ≥ `clamp(2.25rem, …)` (or ≥36px at 1280px viewport) and one primary CTA (hire/contact or flagship project) with visible focus ring on keyboard Tab. Verify: DevTools computed styles + keyboard screenshot.
3. **Primary CTA contrast** — Primary CTA text/icon vs fill meets ≥4.5:1 contrast (WCAG AA). Verify: contrast sampler / axe-ish color check on screenshot + CSS colors.
4. **Reduced motion** — With `prefers-reduced-motion: reduce`, no continuous/infinite animation or auto-playing motion on hero/nav. Verify: browser emulation + 3s screen recording or before/after screenshots.
5. **Outbound project links work** — From the live site, click/fetch links to `github.com/cayleb-james2008/dotz` and at least two of `sophos`, `solomon`, `apotheka-site`; each lands on a public repo (HTTP 200, not 404). Verify: link click or HEAD/GET.
6. **Honesty on demos/case studies** — Any simulator, demo, or case-study framing on the site uses explicit wording (e.g. “simulator”, “demo”, “case study”) and does not claim live production users/revenue/customers without a cited public source on-page. Verify: full-page text scan + screenshot of each such claim.

## Identity
7. **GitHub login + display name** — Profile `https://github.com/cayleb-james2008` shows login `cayleb-james2008` and display name **Cayleb Alvarez-James**; site footer/header name matches exactly. Verify: profile fetch + site screenshot.
8. **Attribution consistency** — Public repos graded below are under `cayleb-james2008` (owner), not a fork of an unrelated account presented as original work without credit. Verify: GitHub repo owner field on each graded repo.

## Flagship repo (dotz) + two other public repos
Grade **dotz** plus any **two** of: `sophos`, `solomon`, `apotheka-site`.
9. **README try-path** — Each graded repo README has a clone → install/build → first-success path a stranger can follow without private context; commands are copy-pasteable. Verify: README fetch + dry-run of listed commands (or documented blocker logged as FAIL).
10. **README honesty** — Each graded README states scope/limits; if a feature is a simulator, demo, or non-production path, that is stated in the README (not only on the site). Verify: README text search for overclaims vs labeled limits.
11. **CI green on default branch** — Each graded repo with GitHub Actions (or equivalent) shows the latest default-branch workflow run **success**; if no CI exists, FAIL (resume-grade requires an automated check). Verify: Actions tab / checks API on default branch.
12. **LICENSE present** — Each graded public repo has a root `LICENSE` (or clearly linked license file). Verify: file fetch at repo root.

## Hard rules
- Never weaken a check to pass.
- Builder never grades own work; grader must be a separate pass with named evidence (URL, screenshot, command output) per item.

## Identifier note (adversary amendment 2026-09-22 — no checks weakened)
Canonical live URL for item 1 is the production alias actually serving the project: `https://agentic-resume-nine.vercel.app/` (same Vercel project). Graded repo slugs under `cayleb-james2008` are the real public names: `dotz`, and two of `sophos`, `solomon`, `apotheka-site` (bar’s sophos/solomon/apotheka-site strings map to these; do not substitute weaker repos).

## Adversary amendments 2026-09-22b (additive)
13. Mobile usable @ 390px — no horizontal overflow; demos operable without hover.
14. Hero scroll animation — scroll-linked; static under prefers-reduced-motion.
15. In-page demos — landing has interactive demos for dotz, sophos, solomon, + PDM or apotheka; each changes on-page state.
16. Character/imagery — original mascot + project imagery present and loadable.

## Adversary amendments 2026-09-22c (restart)
17. **Layout restart** — Site IA/layout must be a greenfield structure (not incremental CSS on the rejected layout). Verify: lead screenshot compare vs prior sticky-demo-wall pattern; distinct nav/hero/work rhythm.
18. **Art system match** — Mascot + project marks share Y2K/cyberpunk grit with hero video poster/reel. Verify: side-by-side asset check.
19. **anime.js + UI kit** — anime.js loaded; primary interactive controls use the chosen UI library primitives. Verify: network/script tags + DOM.
