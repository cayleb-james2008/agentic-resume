# Gauntlet frozen bar v5 — breathtaking SITE craft
**Freeze date:** 2026-09-22 (America/New_York)  
**Scope:** agentic-resume hire-ready personal portfolio (SITE craft)  
**Status:** FROZEN — PASS only when EVERY numbered item is VERIFIED with named evidence (URL, screenshot, recording, command output, or contrast/measure read).  
**Supersession:** This bar **supersedes** all prior SITE craft bars for agentic-resume visual quality (including `FROZEN-BAR.md` SITE/adversary amendments 13–19 and any prior Gauntlet SITE scores). Prior SITE PASSes are **not** inherited. Parallel **repo CI** checks (section B) remain a separate track and must not be used to dilute or excuse SITE craft FAIL.

**Authority for craft measures:** nested from `design/research/PORTFOLIO-BEST-PRACTICES-EVIDENCE.md` (Awwwards-weight fundamentals, one concept + one signature, Swiss/typography-first, case-study depth over grids, motion gated by `prefers-reduced-motion`, performance/usability floors). This file is acceptance criteria only — not a build plan, stack choice, or file tree.

---

## Breathtaking quality (measurable definition)

A submission is **breathtaking** for this bar only if ALL of the following craft floors are true on the graded visuals (and on live deploy when signed off):

| Craft axis | Measurable floor |
| --- | --- |
| **Typography** | Distinct display + body hierarchy; hero display ≥ `clamp(2.25rem, …)` or ≥36px computed at 1280px viewport; body line-length readable (~45–75ch where continuous prose appears); no more than two primary type roles competing above the fold. |
| **Whitespace (Swiss)** | At least one full-viewport band (hero or work opener) shows intentional negative space: primary content occupies ≤ ~60% of the band’s visual weight (not a dense gadget wall). Verify: screenshot + rough occupancy judgment with annotated crop. |
| **One concept** | Site communicates a single positioning sentence (who + specialty + outcome for whom) above the fold in ≤3 short lines. Competing concepts (gadget playground, research-desk cosplay, sticker collage as primary identity) = FAIL. |
| **One signature moment** | Exactly **one** deliberate signature interaction or visual beat (scroll-linked, hover, or reveal) that serves the story; it must remain static or non-distracting under `prefers-reduced-motion: reduce`. Multiple competing “wow” systems = FAIL. |
| **Case-study depth** | At least **three** projects presented as case-study depth (problem → role → craft → outcome, or equivalent labeled beats with real copy), not equal-weight thumbnail waffle. Volume of projects ≠ quality. |
| **Performance / usability** | Decorative motion uses transform/opacity only where motion exists; no continuous infinite hero animation under reduced-motion; mid-phone usable @ ~390px width; LCP target ≤ ~2.5s on a cold load of the graded URL when live (or static export equivalent). Janky 3D/WebGL that drops below usable scroll = FAIL even if “creative.” |
| **A11y** | Keyboard Tab reaches primary CTA and main nav destinations with a visible focus indicator; primary interactive text/icon contrast ≥4.5:1 (WCAG AA); `prefers-reduced-motion` honored on hero/nav. |

**Design + Usability first:** gimmicks without the floors above cannot PASS. Creativity is scored only after fundamentals hold.

---

## Brand + truth locks (preconditions — FAIL if broken)

**B1. Brand lock** — Primary visual system is **minimal outline cyber-nomad: mauve on dark**, Swiss negative space. Coffee-mug lifestyle primary, sticker-grunge as dominant identity, CRT/scanline overload as the main look, or spray-and-pray unrelated theme flips = FAIL. Verify: above-the-fold + work section screenshots vs this lock.

**B2. Truthful project framing only** — Graded project set and labels:
- **dotz** — multi-agent coding dashboard (axum + Tauri); no inflated “production SaaS users” without cited public source.
- **Sophos** — Windows coding agent / Prime Intellect credit; credit stated where claim appears.
- **Solomon** — RSI fleet control, fail-closed money; fail-closed / money-safety framing must not be soft-washed into generic “AI trading.”
- **apotheka-site** — static lookbook; not claimed as dynamic product platform.
- **PDM Forge** — **SIMULATOR case study only**; page/copy must say simulator/case study; no live production users/revenue/customers claim without cited public source.

Any other project may appear only as secondary; inventing equal-weight filler to pad volume = FAIL under case-study depth.

**B3. Visuals for grading; live when signed off** — Grader accepts annotated screenshots / recordings of the built site for SITE craft. **Live deploy** of Cayleb’s Vercel resume (`https://agentic-resume-nine.vercel.app/` or successor alias he designates) is **in scope** only after his explicit sign-off for that exact publish. Until then, item A1 is N/A-hold; after sign-off, A1 is mandatory PASS.

---

## A — SITE craft (primary bar)

PASS only when each item is VERIFIED.

1. **Identity above the fold** — Visible name **Cayleb Alvarez-James**; positioning answers who / specialty / outcome-for-whom in ≤3 lines; HTML `<title>` identifies him/portfolio. Verify: above-the-fold screenshot + title read.

2. **Hero hierarchy** — Display heading meets typography floor in the breathtaking table; one primary CTA (hire/contact or flagship case study) with visible keyboard focus ring. Verify: DevTools computed font-size @ 1280px + Tab screenshot.

3. **Primary CTA contrast** — Primary CTA text/icon vs fill ≥4.5:1. Verify: contrast check on final colors.

4. **Swiss negative space** — Meets whitespace floor (intentional empty space; not sticky-demo-wall density). Verify: annotated full-viewport screenshot.

5. **One concept only** — Single coherent concept; no dual primary identities (e.g. cyber-nomad + coffee-mug, or Swiss quiet + CRT carnival). Verify: fold + work opener screenshots; written one-sentence concept on evidence sheet matching what the UI says.

6. **One signature moment** — Exactly one signature beat; gated by `prefers-reduced-motion` (static or non-distracting under reduce). Verify: normal-motion recording ≤10s + reduced-motion before/after.

7. **Reduced motion** — With `prefers-reduced-motion: reduce`, no continuous/infinite animation or auto-playing motion on hero/nav. Verify: emulation + 3s recording or paired screenshots.

8. **Keyboard path** — From load, Tab reaches primary CTA and primary nav/contact targets; focus always visible; no keyboard trap on graded path. Verify: keyboard-only walkthrough notes + screenshots.

9. **Mobile-first usability @ 390px** — No horizontal overflow on home + at least one case-study view; primary actions operable without hover; tap targets usable. Verify: 390px screenshots + overflow check.

10. **Case studies ≥3 with depth** — At least three of the truth-locked projects use problem → role → craft → outcome (or labeled equivalent) with real copy; impact-forward titles; **one focused visual per project** (not tiny equal grids of twelve). Verify: full-page captures of each case study.

11. **PDM Forge honesty** — Where PDM Forge appears, copy explicitly marks **simulator / case study**; no unverified live production metrics. Verify: text scan + screenshot.

12. **Outbound honesty links** — From the graded site, links to `github.com/cayleb-james2008/dotz` and at least two of `sophos`, `solomon`, `apotheka-site` resolve HTTP 200 (public). Verify: GET/HEAD or click.

13. **Minimal navigation + convert CTA** — Nav is minimal (not a link farm); a visible contact/hire CTA exists on home without hunting. Verify: screenshot of nav + CTA.

14. **Content over volume** — Site does **not** present equal-weight waffle across many thin projects; secondary mentions (if any) are visually subordinate to the ≥3 deep case studies. Verify: work index / home work band screenshot showing hierarchy.

15. **Motion craft floor** — If motion exists beyond the single signature: soft, story-serving, transform/opacity-oriented; no CRT gimmick overload, no fake research-desk demo theater as the product. Verify: motion recording; FAIL on listed anti-patterns (section C).

16. **Performance usability floor** — Graded experience remains scrollable/usable on mid-phone; no unbroken jank that blocks reading case studies. When live signed-off URL is graded: LCP ≤ ~2.5s cold load target recorded. Verify: device or throttled check + LCP note when live.

17. **Live publish (post sign-off)** — After Cayleb’s explicit sign-off for that exact publish: `GET` production alias returns HTTP 200; fold matches graded craft (brand lock + items 1–4). Until sign-off: mark **HOLD** (not PASS, not FAIL). Verify: fetch + screenshot vs signed build.

18. **GitHub name match** — Profile `https://github.com/cayleb-james2008` display name **Cayleb Alvarez-James**; site header/footer name matches exactly. Verify: profile fetch + site screenshot.

---

## B — Parallel repo hygiene (does NOT dilute SITE)

Grade **dotz** plus any **two** of: `sophos`, `solomon`, `apotheka-site`. These items may PASS/FAIL independently of section A. A green CI track **cannot** convert a SITE craft FAIL into PASS.

19. **README try-path** — Each graded repo README has clone → install/build → first-success path with copy-pasteable commands. Verify: README fetch + dry-run or logged blocker.

20. **README honesty** — Scope/limits stated; simulator/demo/non-production paths labeled in README. Verify: text search.

21. **CI green on default branch** — Latest default-branch workflow **success**; no CI = FAIL for this parallel item. Verify: Actions / checks API.

22. **LICENSE present** — Root `LICENSE` (or clearly linked license file). Verify: root fetch.

23. **Owner attribution** — Graded repos owned by `cayleb-james2008`, not uncredited forks presented as original. Verify: owner field.

---

## C — Explicit FAIL anti-patterns (instant SITE FAIL if primary)

Any of the following as a **primary** experience = FAIL section A regardless of partial craft:

- **CRT / scanline / terminal gimmick overload** as the main look or main interaction.
- **Fake research-desk / cosplay demos** substituting for real case-study copy and outcomes.
- **Equal-weight waffle** — many thin projects or in-page demos at equal visual weight instead of ≥3 deep case studies.
- **Spray-and-pray theme flips** — swapping skins (Y2K grit, sticker-grunge, coffee mug, gadget wall) without meeting Swiss/typography/one-concept floors.
- **Sticky demo wall** — dense interactive gadget gallery above the fold as the portfolio.
- **WebGL/3D jank** presented as craft while scroll/read/usability fails.
- **Volume theater** — more projects, more demos, more themes treated as quality.
- **Untruthful production claims** — especially PDM Forge without simulator/case-study labeling; or revenue/users without on-page cited public source.

---

## Hard rules

- Never weaken a check to pass.
- Builder never grades own work; grader is a separate pass with named evidence per numbered item.
- Do not invent stack, file tree, or implementation steps inside evidence notes — only PASS/FAIL + proof.
- Section B PASSes are recorded separately; they never offset section A FAILs.
