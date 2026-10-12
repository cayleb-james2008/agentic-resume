# Personalized Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Cayleb's homepage with a single-page résumé that reproduces the reference site's layout, motion and format — with none of its racing imagery — filled with Cayleb's real experience, his AI-workflow-integrator positioning, his projects, and a 3D animated-film-style character of him.

**Architecture:** Static site, no runtime build. `scripts/build-home.py` renders `index.html` and `resume.html` from `site/content.json` (all copy, so the page reads without JavaScript); ES modules under `site/js/` add the motion layer (one shared rAF ticker, hand-written springs, scroll triggers, Lenis) and the canvases (WebGL hero, approach loop map, contour backdrops). Imagery is generated in ChatGPT (via Claude in Chrome) from one approved character sheet, then cropped and encoded by Python scripts.

**Tech Stack:** HTML/CSS/vanilla ES modules; three.js 0.185.0 and Lenis 1.3.26 self-hosted; Oswald + Space Grotesk 5.3.0 woff2 self-hosted; Python 3 stdlib + Pillow + numpy for build/asset scripts; `node --test` and `python3 -m unittest` for tests.

**Spec:** `docs/superpowers/specs/2026-10-12-layout-reference.md` (the attached reference, 5,551 lines; gitignored — it quotes a third party's source, so it never goes into this public repo; re-attach it if the file is missing). Spec references below are `§Lnnn–mmm` line ranges in that file. This plan overrides the spec wherever the **Personalization map** says so; everything not mentioned there is built as the spec says.

## Decisions from Cayleb (2026-10-12)

- **Replace the homepage.** The new page becomes `index.html`; the character-led homepage (Mofu/Pip/Folio/Loam, Explore/Professional modes) retires. Last classic commit: `2732c2f017f0f208e82953e7d37b3a2f506665c0`.
- **No racing imagery at all** — take the layout, animations and format only.
- **Figure:** a 3D animated-film-style ("Pixar-style") character of Cayleb, generated in ChatGPT from his reference image; video, if any, from Google Flow.
- **Plain résumé language** for headings and copy.
- **Positioning:** AI Workflow Integrator — shadow employees for a couple of days, understand how they work, build each person a custom agent, teach them to use it, then do it for the whole company.
- **Add EvoHedge and Maki** (private, in development). CT State is *not* added.

## Global Constraints

- Served from `https://cayleb-james2008.github.io/agentic-resume/`: every URL relative, no leading `/`, no build step at runtime.
- No third-party runtime origin: three 0.185.0, Lenis 1.3.26 and both font families are vendored under `vendor/` and `assets/fonts/` (overrides spec §L66–92's CDN import map and Google Fonts link).
- Nothing from `storage.getlayers.ai`, and no Kimi Antonelli, Mercedes, F1, GRIDO1, Italy, karting, circuit, chequered-flag, helmet-livery or racing names, marks or imagery anywhere a visitor can see.
- Tokens, type scale, root font bands, spring configs and timings are the spec's, verbatim (§L93–229, §L230–300, §L5502–5512) unless the Personalization map names a change.
- All visible copy comes from `site/content.json`. Every number in it must appear in `resume/resume-content.json` or be computed from `content.json` itself (see Task 2).
- Never on the page: "hedge fund", returns, profit, revenue, clients, "pilot", or any statement that Robert H. Lord Company (RHL) is a customer or engagement. RHL appears only as Cayleb's moving-crew job. Role details held by Cayleb's agent "outis" stay private.
- EvoHedge and Maki are always labelled private / in development, with no repo links and no performance figures. The ten Industry AI Suite workflows are always "recorded demos", never "working" workflows.
- Generated imagery: every `alt` starts with `Illustration:`; the footer credits AI-generated illustrations; no logos or brand marks inside any image.
- Motion: everything that moves is a spring or a timed tween on the shared ticker; no CSS `@keyframes`; CSS transitions only for hover colour, the plate inset and button floods (spec §L16–65).
- Every module under `site/js/` is side-effect-free at import (no `window`/`document` at top level); only `site/js/hero/scene.js` and `site/js/hero/headset.js` import `three`.
- Reduced motion, keyboard and no-JS behave as spec §L5477–5501 says; the page is fully readable with JavaScript off.
- At every commit: `node --test tests/*.test.js`, `python3 -m unittest discover -s tests/py` and `python3 scripts/check-release.py` pass.
- Work on branch `design/personalized-homepage-20261012`; `main` is the live site — merge only by Cayleb's explicit "merge it".

## Review Focus

1. **Cayleb edits `content.json` later** and a longer string overflows a fixed-size frame (277×78 plate, 220×50 button, 100-wide calendar cards, 3-up stat cells). Expected: the build fails with the field name and limit. → Task 2, `content lengths stay inside their frames`.
2. **"Alvarez-James" is far wider than the reference's name** (~6.3em vs the 6em column) and breaks badly or runs into the figure. Expected: three lines `Cayleb / Alvarez- / James` at every width, never a mid-word break. → Task 2, `name renders as three words`; Task 11 QA check.
3. **JavaScript fails or is off.** Expected: no veil, nothing stuck at `opacity: 0`, all copy visible; a module error still un-hides the page within 4s. → Task 6, `hidden states only apply under .js` and `failsafe reveals the page`.
4. **Deep links from the 13 project pages** (`../index.html#work`, `#suite`, `#contact`) land on a section that exists. Expected: each id exists on the new homepage. → Task 2, `project-page anchors resolve`.
5. **A generated image is missing or 404s.** Expected: a visible banner naming the URL, the veil still lifts, no empty plate left silently. → Task 11, `asset error banner names the url`; Task 8, `check_assets fails on a missing file`.

---

## Personalization map

What each spec element becomes. "Verbatim" means build it exactly as the spec says.

| Spec | Becomes |
|---|---|
| Fonts/libs via CDN (§L66–92) | Vendored; import map points at `./vendor/...` |
| Hero portrait of Kimi + Mercedes helmet GLB + studio HDR (§L502–2790) | Generated portrait of Cayleb (1024² maps, not 2048²); a **procedural AI headset** (`headset.js`) in place of the helmet GLB; `RoomEnvironment` in place of the HDR; no GLTF/Draco/RGBE loaders. The burn, reveal mask, wireframe wave, backdrop, tiers and every `DEFAULT_PARAMS` value stay verbatim. |
| Loading veil helmet silhouette (§L476–501) | Veil masked to Cayleb's own portrait silhouette (`veil-mask.png`, from the alpha map) |
| `driver_012`, name, meta rows, flag/rookie/Mercedes icons (§L396–421) | `Résumé · 2026`; `Cayleb / Alvarez- / James`; inline SVG pin/spark icons |
| "next race" panel + circuit thumbnail (§L422–446) | "Now building · EvoHedge" with an inline 4-node agent-graph SVG |
| Season stats Races/Podiums/Points | At a glance: Projects 5 · Workflows 10 · Languages 5 |
| watch trailer 01:26 · view profile · inst/x/youtube (§L447–475) | "See the workflow lab / 10 recorded demos" → `lab/` (becomes the intro reel if Task 17 ships) · "Résumé PDF" · github / email / résumé |
| GRIDO1 logo (masthead + footer mask) | Text wordmark `CAYLEB.AJ` in Oswald 700 (footer: accent colour, no mask) |
| Chequered-flag dissolve (§L2839–2877) | **Pixel dissolve**: same renderer, the `(x + y) % 2` parity skip removed |
| "The season so far" circuit: designer's track ribbon, flag diamonds, turn triangles, landmass halftone (§L2794–4338) | "How I work": **our own closed loop** (generated by `make_loop.py`) through four labelled stations — Shadow, Understand, Build, Teach — starting and finishing at a "Whole company" node; ribbon = the loop stroked; halftone = dots generated from the contour field; reticle squares no longer chequer (parity removed). Grid axes, hub rings, ping, corner marks, globe, lap pacing and glow stay verbatim. |
| Standings plate (F1 / 2026, P1/6/9) | AI / 2026; `01 shadow each role · 02 build their agent · 03 teach, then scale.` |
| "From karts to F1" timeline (§L4339–4716) | "Work experience" — seven rows of Cayleb's real history; side rows gain a one-line title under the year |
| "From the paddock" (§L4717–5274) | "Selected projects": Industry AI Suite report + case-study button; the stats panel shows suite figures; the calendar strip becomes a five-project strip |
| "Keep pushing forward" footer, helmet + suit plates (§L5275–5476) | "Let's work together"; one generated figure plate (no suit mask) |
| Assets table (§L5513–5551) | Replaced entirely by `assets/home/` (Task 8–9) |

---

## File Structure

```
index.html, resume.html           generated by scripts/build-home.py — never hand-edit
site/content.json                 every visible string; the copy deck Cayleb reviews
site/css/tokens.css               tier 1/2 tokens, @font-face, root font bands, band overrides
site/css/base.css                 reset, .sr-only, .js gating, focus ring, sticky stack, seams, banner
site/css/{hero,approach,experience,projects,contact,resume}.css   one file per block
site/js/main.js                   boot: ticker + Lenis, stack, section mounts, failsafe flag
site/js/engine/ticker.js          shared rAF ticker
site/js/engine/spring.js          Spring, Tween, easings, named configs
site/js/engine/scroll.js          triggerProgress, interpolate, scrubTrigger, inView
site/js/engine/reveal.js          splitUnits, mountReveal, rise
site/js/engine/stack.js           recede math + initStack
site/js/engine/contours.js        field, marchingSegments, drawContours (paddock/footer/WebGL fallback)
site/js/engine/dissolve.js        cellHash, drawDissolve (seams)
site/js/hero/{tier,fit,headset-profile}.js   pure (testable in node)
site/js/hero/{headset,scene}.js   three.js
site/js/hero/{hero,menu}.js       DOM wrapper, veil, entrance, menu sheet
site/js/approach/loop-path.js     GENERATED by scripts/home/make_loop.py — committed
site/js/approach/{map-vector,lap,dots,approach}.js
site/js/experience/{geometry,plate-shape,timeline}.js
site/js/projects/{geometry,projects}.js
site/js/contact/contact.js
scripts/build-home.py             composes templates → index.html, resume.html
scripts/home/templates/{shell,hero,approach,experience,projects,contact,resume}.py   render(content) -> str
scripts/home/{person_maps,make_noise,import_images,check_assets,make_loop}.py
vendor/three-0.185.0/, vendor/lenis-1.3.26/, vendor/PROVENANCE.json
assets/fonts/{oswald,space-grotesk}-*.woff2, assets/licenses/*
assets/home/{hero,experience,projects,contact}/...
tests/home-*.test.js, tests/py/test_*.py
```

---

### Task 1: Vendor the runtime and fonts

**Files:**
- Create: `vendor/three-0.185.0/{three.module.js,three.core.js,addons/utils/BufferGeometryUtils.js,addons/environments/RoomEnvironment.js}`, `vendor/lenis-1.3.26/lenis.mjs`, `vendor/PROVENANCE.json`
- Create: `assets/fonts/oswald-latin-{400,500,700}-normal.woff2`, `assets/fonts/space-grotesk-latin-{400,500,700}-normal.woff2`, `assets/licenses/{three-MIT,lenis-MIT,oswald-OFL,space-grotesk-OFL}.txt`
- Modify: `.gitignore` (the layout-reference entry — already added on this branch)
- Test: `tests/home-vendor.test.js`

**Interfaces:**
- Produces: import map targets `three` → `./vendor/three-0.185.0/three.module.js`, `three/addons/` → `./vendor/three-0.185.0/addons/`, `lenis` → `./vendor/lenis-1.3.26/lenis.mjs`; font files at the paths above.
- `vendor/PROVENANCE.json`: `{ "<path>": { "package": "three@0.185.0", "source": "build/three.module.js", "sha256": "<hex>" }, ... }` for every vendored file.

- [ ] **Step 1: Write the failing test** — `vendored files match provenance`: for every entry in `vendor/PROVENANCE.json`, the file exists and its sha256 equals the recorded hash; the six woff2 files and four license files exist; `vendor/three-0.185.0/three.module.js` contains `REVISION = '185'` (or `"185"`).
- [ ] **Step 2: Run** `node --test tests/home-vendor.test.js` — Expected: FAIL (no PROVENANCE.json).
- [ ] **Step 3: Fetch with `npm pack`** in the scratchpad: `three@0.185.0`, `lenis@1.3.26`, `@fontsource/oswald@5.3.0`, `@fontsource/space-grotesk@5.3.0`; extract each into its own empty directory; copy the listed files (three: `build/three.module.js`, `build/three.core.js`, `examples/jsm/utils/BufferGeometryUtils.js`, `examples/jsm/environments/RoomEnvironment.js`; Lenis: `dist/lenis.mjs`; fonts: `files/*-latin-{400,500,700}-normal.woff2`) and each package's LICENSE; write PROVENANCE.json with hashes.
- [ ] **Step 4: Run** the test — Expected: PASS.
- [ ] **Step 5: Commit** `chore: vendor three 0.185.0, lenis 1.3.26, Oswald and Space Grotesk`

---

### Task 2: Copy deck, page builder and content guards

**Files:**
- Create: `site/content.json` (exact content below), `scripts/build-home.py`, `scripts/home/templates/{shell,hero,approach,experience,projects,contact}.py`
- Generate: `index.html`
- Test: `tests/home-content.test.js`, `tests/home-structure.test.js`

**Interfaces:**
- Produces: `python3 scripts/build-home.py` writes `index.html` (and, from Task 16, `resume.html`); each template exposes `render(content: dict) -> str`.
- Section roots and ids every later task relies on: `<section data-hero id="home">`, `<section data-approach id="approach">`, `<section data-experience id="experience">`, `<section data-projects id="work">` containing an element `id="suite"` (the featured-project block), `<section data-contact id="contact">`; stack wrapper `<div data-stack>` with layers `data-stack-layer` (hero, approach) and the experience section last.
- Reveal hooks: `data-reveal="word|letter"`, `data-stagger`, `data-delay`, `data-config` (config name), `data-mode`, `data-gap` on any text that animates; the template writes the plain text inside, and Task 5 splits it.
- `<head>` contains, in order: charset, viewport, `<title>` and description from `meta`, the inline `.js` + failsafe script (Task 6 fills it), stylesheets, the import map, `<script type="module" src="site/js/main.js">`.

`site/content.json` — the copy deck (Cayleb approves this in Step 6):

```json
{
  "meta": {
    "title": "Cayleb Alvarez-James · AI workflow integrator",
    "description": "Cayleb Alvarez-James builds personal AI agents around how people already work: shadow the role, build the agent, teach it, then scale across the company.",
    "resumePdf": "Cayleb-James-polished-resume.pdf",
    "onePagePdf": "Cayleb-James-polished-one-page.pdf",
    "email": "caylebalvarezjames@gmail.com",
    "github": "https://github.com/cayleb-james2008"
  },
  "wordmark": "CAYLEB.AJ",
  "nav": [
    {"label": "Experience", "href": "#experience"},
    {"label": "How I work", "href": "#approach"},
    {"label": "Projects", "href": "#work"},
    {"label": "Lab", "href": "lab/"},
    {"label": "Contact", "href": "#contact"}
  ],
  "navAction": {"label": "Résumé", "href": "resume.html"},
  "hero": {
    "eyebrow": "Résumé · 2026",
    "nameWords": ["Cayleb", "Alvarez-", "James"],
    "meta": [
      {"icon": "pin", "label": "Connecticut, USA"},
      {"icon": "spark", "label": "AI workflow integrator"},
      {"icon": "spark", "label": "Independent developer · 2026"}
    ],
    "now": {"eyebrow": "Now building", "title": "EvoHedge", "lines": ["Autonomous trading research", "Private · in development"]},
    "glance": {"eyebrow": "At a glance", "stats": [
      {"label": "Projects", "value": "5"},
      {"label": "Workflows", "value": "10"},
      {"label": "Languages", "value": "5"}
    ]},
    "lab": {"label": "See the workflow lab", "sub": "10 recorded demos", "href": "lab/"},
    "cta": {"label": "Résumé PDF", "href": "Cayleb-James-polished-resume.pdf"},
    "links": [
      {"label": "GitHub", "href": "https://github.com/cayleb-james2008"},
      {"label": "Email", "href": "mailto:caylebalvarezjames@gmail.com"},
      {"label": "Résumé", "href": "resume.html"}
    ]
  },
  "approach": {
    "lines": ["How I", "work"],
    "intro": "Shadow each role for a couple of days. Build that person an agent that fits how they already work. Teach them to use it well, then repeat across the company.",
    "badge": ["AI", "/ 2026"],
    "rows": [["01", "shadow each role"], ["02", "build their agent"], ["03", "teach, then scale."]],
    "stations": ["Shadow", "Understand", "Build", "Teach"],
    "finish": "Whole company"
  },
  "experience": {
    "lines": ["Work", "experience"],
    "entries": [
      {"year": "2024", "frame": "centre", "copyWidth": 228, "lead": "Dunkin', 2024–2026.", "body": "Two years of customer service.", "image": "assets/home/experience/2024-dunkin.webp", "alt": "Illustration: Cayleb handing a coffee across a café counter"},
      {"year": "2024", "frame": "side", "align": "right", "title": "Tommy's Pizza", "image": "assets/home/experience/2024-pizza.webp", "alt": "Illustration: Cayleb sliding a pizza from the oven"},
      {"year": "2025", "frame": "centre", "copyWidth": 272, "lead": "Robert H. Lord Company, summers 2025 & 2026.", "body": "Moving crew: hands-on, team-based work.", "image": "assets/home/experience/2025-moving.webp", "alt": "Illustration: Cayleb carrying a moving box with a crew"},
      {"year": "2026", "frame": "side", "align": "left", "title": "David Cooke Plaster Co.", "image": "assets/home/experience/2026-plaster.webp", "alt": "Illustration: Cayleb smoothing a plaster wall"},
      {"year": "2026", "frame": "centre", "copyWidth": 278, "lead": "Portland High School, class of 2026.", "body": "Coursework in cybersecurity and AP Computer Science.", "image": "assets/home/experience/2026-school.webp", "alt": "Illustration: Cayleb coding at a classroom computer"},
      {"year": "2026", "frame": "side", "align": "right", "title": "dotz · Sophos · AI Suite", "image": "assets/home/experience/2026-builds.webp", "alt": "Illustration: Cayleb at a desk with two monitors of code"},
      {"year": "2026", "frame": "centre", "copyWidth": 284, "lead": "AI workflow integration.", "body": "Independent, AI-assisted development of local agent tools. Now focused on shadowing teams and building each person an agent they will actually use.", "image": "assets/home/experience/2026-integrator.webp", "alt": "Illustration: Cayleb beside a coworker, taking notes on how they work"}
    ]
  },
  "projects": {
    "lines": ["Selected", "projects"],
    "report": "Industry AI Suite: ten local review workflows that cite their sources and leave the decision to a person. Recorded demos, not production deployments.",
    "cta": {"label": "Case study", "href": "projects/industry-ai-suite.html"},
    "feature": {"name": "Industry AI Suite", "lines": ["Python · local LLMs", "Merged PR #1"]},
    "stats": [
      {"icon": "check", "label": "Workflows", "value": "10"},
      {"icon": "bars", "label": "Tests passed", "value": "370"},
      {"icon": "quote", "label": "Cited samples", "value": "5"},
      {"icon": "gauge", "label": "Model exchanges", "value": "6"}
    ],
    "cards": [
      {"kicker": "Rust · Tauri", "name": "dotz", "status": "Draft PR #218", "marker": "pr", "href": "projects/dotz.html"},
      {"kicker": "React · Tauri", "name": "Sophos", "status": "Draft PR #10", "marker": "pr", "href": "projects/sophos.html"},
      {"kicker": "Python · LLMs", "name": "AI Suite", "status": "Merged PR #1", "marker": "live", "href": "projects/industry-ai-suite.html"},
      {"kicker": "Python · agents", "name": "EvoHedge", "status": "Private", "marker": "ring"},
      {"kicker": "Windows · AI", "name": "Maki", "status": "Private", "marker": "ring"}
    ],
    "figure": {"image": "assets/home/projects/figure.webp", "alt": "Illustration: Cayleb typing on a laptop beside his AI agent"}
  },
  "contact": {
    "lines": ["Let's work", "together"],
    "nav": [
      {"label": "Experience", "href": "#experience"},
      {"label": "Projects", "href": "#work"},
      {"label": "Lab", "href": "lab/"},
      {"label": "Résumé", "href": "resume.html"},
      {"label": "Email", "href": "mailto:caylebalvarezjames@gmail.com"}
    ],
    "copyright": "© 2026 Cayleb Alvarez-James. Illustrations generated with AI.",
    "cta": {"label": "Download résumé", "href": "Cayleb-James-polished-resume.pdf"},
    "links": [
      {"label": "GitHub", "href": "https://github.com/cayleb-james2008"},
      {"label": "Email", "href": "mailto:caylebalvarezjames@gmail.com"},
      {"label": "One-page PDF", "href": "Cayleb-James-polished-one-page.pdf"}
    ],
    "figure": {"image": "assets/home/contact/figure.webp", "alt": "Illustration: Cayleb waving, his AI agent at his shoulder"}
  },
  "loading": {"name": "Cayleb Alvarez-James", "label": "Loading Cayleb Alvarez-James's résumé", "done": "Loaded"}
}
```

- [ ] **Step 1: Write the failing tests** in `tests/home-content.test.js`:
  - `numbers trace to the résumé` — every `/\d[\d,]*/` token in every content.json string is in the set of number tokens found anywhere in `resume/resume-content.json`, or in `{"01","02","03"}`.
  - `computed stats match` — hero `Projects` = `projects.cards.length`; `Languages` = count of comma-separated items in the résumé's `Languages` skills row; `Workflows` = `"10"`.
  - `name renders as three words` — `nameWords[0] + " " + nameWords.slice(1).join("") === resume.full_name`.
  - `employers match the résumé` — each `additional_experience.organization` (its part before ` — `) appears in some entry's `lead` or `title`; the Portland High line contains `education.school`.
  - `content lengths stay inside their frames` — limits: hero stat label ≤ 9, approach row text ≤ 20, card name ≤ 9, card kicker ≤ 16, card status ≤ 14, project stat label ≤ 15, `hero.cta.label` ≤ 12, `projects.cta.label` ≤ 12, `contact.cta.label` ≤ 16, masthead nav label ≤ 12, side-row title ≤ 26, centre `lead + body` ≤ 190; a failure message names the JSON path and its limit.
  - `banned claims stay out` — no content.json string matches `/\b(hedge fund|returns?|profit|revenue|clients?|pilot)\b/i`; the EvoHedge and Maki cards have `status` matching `/private/i` and no `href`.
- [ ] **Step 2: Write the failing tests** in `tests/home-structure.test.js` (read `index.html`):
  - exactly one `<h1>` (in the hero section), containing a `.sr-only` copy `Cayleb Alvarez-James`; five `<section>`s, the other four each with exactly one `<h2>`; ids `home`, `approach`, `experience`, `work`, `suite`, `contact` present and unique.
  - `project-page anchors resolve` — every `href="../index.html#X"` in `projects/*.html` and `lab/index.html` names an id present in `index.html`.
  - both résumé PDFs and `https://github.com/cayleb-james2008/{dotz,sophos,industry-ai-suite}` are linked; `<nav aria-label="Primary">` exists.
  - `visible text has no racing or source-site terms` — text content plus every `alt`, `aria-label` and `title` value has no match for `/\b(kimi|antonelli|mercedes|grido1|grid01|formula ?1|f1|race|racing|driver|paddock|podium|lap|circuit|chequer\w*|checkered|helmet|getlayers)\b/i`.
  - `build is reproducible` — running `python3 scripts/build-home.py` twice yields byte-identical `index.html`.
- [ ] **Step 3: Run** `node --test tests/home-content.test.js tests/home-structure.test.js` — Expected: FAIL.
- [ ] **Step 4: Implement** `build-home.py` + templates (stdlib only; `build-home.py` exits non-zero with the failing JSON path if a Task 2 length limit is exceeded, so Cayleb sees overflow at build time, not on the live page; `html.escape` on every string; markup follows the spec's element structure per block — §L333–501 hero, §L2794–2838 approach copy and plate, §L4339–4434 experience, §L4717–4894 projects, §L5275–5317 contact — with the Personalization map's substitutions; images get `width`/`height`, `decoding="async"`, `loading="lazy"` except hero assets). Write `content.json` exactly as above.
- [ ] **Step 5: Run** the tests — Expected: PASS.
- [ ] **Step 6: Copy review gate.** Send Cayleb `site/content.json` and a screenshot of the unstyled page; apply his edits; re-run the tests (Review Focus 1 catches overflow-prone edits). Do not start Task 10 or later until he has approved the copy.
- [ ] **Step 7: Commit** `feat: content deck and static homepage builder`

---

### Task 3: Résumé headline and summary match the integrator positioning

**Files:**
- Modify: `resume/resume-content.json` (`headline`, `summary`)
- Regenerate via `bash resume/build.sh`: `Cayleb-James-polished-*.{pdf,txt}`, `resume/{one-page,resume}.md`, `resume/candidate-fragment.html`, `resume/resume-fragment.html`, `resume/candidate-verification.json`
- Test: existing `tests/candidate-resume.test.js` (its résumé-content assertions), `scripts/check-release.py`

**Interfaces:**
- Consumes: Cayleb's approval from Task 2 Step 6 (this copy is reviewed in the same pass).
- Produces: `headline` = `AI workflow integrator`; `summary` =
  `AI workflow integrator. Focus: shadowing employees to learn how they work, building each person a custom AI agent that fits their day, and teaching them to use it well, then scaling across the company. Independent, AI-assisted developer of local workflow tools, desktop interfaces and source-grounded review workflows. Background includes service and hands-on work.`

- [ ] **Step 1: Update** the failing assertion first: add to `tests/candidate-resume.test.js` a test `headline is integrator` reading `resume/resume-content.json` and asserting the two values above.
- [ ] **Step 2: Run** `node --test tests/candidate-resume.test.js` — Expected: FAIL on the new test only.
- [ ] **Step 3: Edit** `resume-content.json`, then run `bash resume/build.sh` (needs ReportLab; set `PYTHON` if the default interpreter lacks it).
- [ ] **Step 4: Run** `node --test tests/*.test.js && python3 scripts/check-release.py` — Expected: PASS, one-page PDF still exactly 1 page, detailed PDF ≤ 2 pages.
- [ ] **Step 5: Commit** `feat: résumé headline and summary for AI workflow integrator roles`

---

### Task 4: Ticker and springs

**Files:**
- Create: `site/js/engine/ticker.js`, `site/js/engine/spring.js`
- Test: `tests/home-engine.test.js`

**Interfaces:**
- Produces:
  - `createTicker({ raf, caf, now }) -> { subscribe(callback: (time: number) => void, getFramerate: () => number): () => void }`; `ticker` = the default instance (binds `window.requestAnimationFrame` lazily on first subscribe). Behaviour per spec §L230–243: snapshot walk, call when `time - last > getFramerate()` with each subscriber's `last` starting at `-Infinity` (its first tick always runs), start on first subscriber, cancel on last.
  - `class Spring { constructor({ value = 0, tension, friction, mass = 1, precision = 0.01 }); value; velocity; target; set(target: number): void; jump(value: number): void; step(dtMs: number): boolean }` — 1ms substeps, 64ms cap, returns `false` once at rest (spec §L230–300).
  - `class Tween { constructor({ from, to, duration, easing }); value; step(dtMs): boolean }`; `easings = { linear, easeOutQuad, easeOutCubic, easeInOutSine }`.
  - `CONFIGS` — every named config from spec §L259–264, verbatim (`REVEAL`, `ROW`, `ITEM`, `SHEET`, `FIGURE`, `TYPE`, `YEAR`, `COPY`, `COPY_FAST {150,24}`, `NAME`, `VEIL`, `CLEAR`, `LABEL`, `PROGRESS_WAIT {10,30}`, `PROGRESS_READY {170,26}`, `YEAR_SETTLE`, `TRIGGER`).

- [ ] **Step 1: Write the failing tests:**
  - `ticker gates by framerate` — fake raf driven at 8.333ms steps for 10 ticks; a subscriber with `() => 1000/60 - 2` is called 5 times, one with `() => 0` 10 times.
  - `ticker stops on last unsubscribe` — `caf` called once after both unsubscribe.
  - `spring settles` — `new Spring({ ...CONFIGS.REVEAL })`, `set(1)`, step 16ms until it returns false: final `|value - 1| < 0.01` and total < 3000ms.
  - `spring caps a long frame` — `step(1000)` leaves the same state as `step(64)` from identical starts.
  - `tween ends exactly` — `easeInOutSine` tween 0→1 over 6000ms reaches `value === 1` and returns false.
- [ ] **Step 2: Run** `node --test tests/home-engine.test.js` — Expected: FAIL.
- [ ] **Step 3: Implement** both modules (semi-implicit Euler at 1ms: `a = (-tension * (value - target) - friction * velocity) / mass`).
- [ ] **Step 4: Run** — Expected: PASS.
- [ ] **Step 5: Commit** `feat: shared ticker and spring solver`

---

### Task 5: Scroll triggers, text reveals and the sticky stack

**Files:**
- Create: `site/js/engine/scroll.js`, `site/js/engine/reveal.js`, `site/js/engine/stack.js`
- Test: `tests/home-engine.test.js` (append)

**Interfaces:**
- Consumes: `ticker`, `Spring`, `Tween`, `CONFIGS` (Task 4).
- Produces:
  - `triggerProgress(rect: {top, height, bottom}, vh: number, start: string, end: string): number` — spec §L278–288 verbatim.
  - `interpolate(from: number|string, to: number|string, p: number): number|string` — handles a number, `"<n><unit>"` and `"fn(<n><unit>)"`; string results use `toFixed(4)` trimmed of trailing zeros.
  - `scrubTrigger(el, { start, end, from, to, apply: (value) => void, smooth?: boolean }): () => void` and `inView(el, { rootMargin, once }, callback): () => void` — spec §L271–300, including the IntersectionObserver "+10 frames" rule.
  - `splitUnits(text: string, unit: "word" | "letter"): string[][]` — words, each an array of units (word mode: `[[word], ...]`; letter mode: `[["n","e","x","t"], ...]`).
  - `mountReveal(el): void` — reads the `data-reveal` hooks from Task 2; renders a `.sr-only` copy plus `aria-hidden` word spans (flex items, `column-gap` from `data-gap`, default `0.3em`) holding inline-block unit spans; unit *i* (counted across words) springs `{opacity 0, y 0.35em}` (word) / `{0, 0.3em}` (letter) → `{1, 0em}` at `delay + i * stagger`; modes `always | once | forward` per spec §L244–262.
  - `rise(el, { from: "translateY(0.75rem)", delay, config }): void` — block-level `{opacity 0, transform} → {1, none}`.
  - `recede(nextTop: number, vh: number, phone: boolean): { transform: string, willChange: string, shade: number, visible: boolean }` — spec §L309–327 verbatim; `initStack(root: HTMLElement): () => void` wires it.

- [ ] **Step 1: Write the failing tests:**
  - `triggerProgress endpoints` — rect top = vh, `"top bottom"`→`"top top"`: 0; top = 0: 1; top = vh/2: 0.5.
  - `interpolate units` — `interpolate("0cqw", "-3.3334cqw", 0.5) === "-1.6667cqw"`; `interpolate("translateY(0.75rem)", "translateY(0rem)", 0.5) === "translateY(0.375rem)"`; `interpolate(0, 10, 0.25) === 2.5`.
  - `splitUnits` — `splitUnits("next race", "letter")` deep-equals `[["n","e","x","t"],["r","a","c","e"]]`; `splitUnits("a b", "word")` deep-equals `[["a"],["b"]]`.
  - `recede` — `(vh, vh, false)` → `{transform: "", shade: 0, visible: true}`; `(0, vh, false)` → `{transform: "scale(0.9)", shade: 0.55, visible: false}`; `(vh/2, vh, true)` → `{transform: "", shade: 0.275}`.
- [ ] **Step 2: Run** — Expected: FAIL.
- [ ] **Step 3: Implement** the three modules.
- [ ] **Step 4: Run** — Expected: PASS.
- [ ] **Step 5: Commit** `feat: scroll triggers, text reveal engine and sticky stack`

---

### Task 6: Tokens, shell, masthead and menu sheet

**Files:**
- Create: `site/css/tokens.css`, `site/css/base.css`, `site/js/main.js`, `site/js/hero/menu.js`
- Modify: `scripts/home/templates/shell.py` (head script, stylesheet links, import map, masthead markup)
- Test: `tests/home-shell.test.js`

**Interfaces:**
- Consumes: Task 4–5 engine; Task 1 vendor paths.
- Produces:
  - `tokens.css`: spec §L97–184 tier 1 and tier 2 verbatim; `@font-face` for the six woff2 files (`font-display: swap`); root bands §L188–221; the 1441–1920 overrides on `[data-hero]` and `[data-approach]` (the spec's `[data-season]`); the `short` query.
  - `base.css`: `.sr-only`; `:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px }`; stack layers (spec §L301–308); every initial hidden state written as `.js:not(.reveal-failsafe) <selector>`; `.asset-banner` (fixed top, `--raw-color-orange-500` background, black text).
  - Head inline script: `document.documentElement.classList.add("js"); history.scrollRestoration = "manual"; scrollTo(0, 0); setTimeout(() => { if (!window.__homeBooted) document.documentElement.classList.add("reveal-failsafe") }, 4000);`
  - `main.js`: sets `window.__homeBooted = true` only after every `mount()` returns; subscribes Lenis first (skipped under reduced motion); calls `initStack`, then `mount(root)` of hero, approach, experience, projects, contact (each module's export, added by its task — import what exists); above 1920 writes the root font size (spec §L201).
  - `menu.js`: `mountMenu(header): void` — burger below `xl`, full-screen sheet appended to `<body>`, `role="dialog" aria-modal="true"`, focus to close button, Escape closes, Lenis stopped while open, auto-close past 1280 (spec §L372–395).
  - Masthead: wordmark link (`aria-label="Cayleb Alvarez-James, home"`), five nav links, `[ Résumé → ]` — spec styles verbatim.

- [ ] **Step 1: Write the failing tests:**
  - `tier-1 tokens are verbatim` — tokens.css contains every `--raw-color-*` and `--raw-font-size-*` declaration in spec §L97–184 with its exact value (21 colours, 11 sizes — copy the literals into the test).
  - `hidden states only apply under .js` — in every `site/css/*.css`, each rule that sets `opacity: 0` or `visibility: hidden` has a selector starting `.js:not(.reveal-failsafe)` (exceptions by selector: `.menu-sheet[hidden]`, `.asset-banner[hidden]`, stack shade).
  - `failsafe reveals the page` — `index.html` head contains `__homeBooted` and `4000`; `main.js` sets `window.__homeBooted = true` after the mount loop.
  - `no keyframes` — no `@keyframes` in `site/css/`.
- [ ] **Step 2: Run** — Expected: FAIL.
- [ ] **Step 3: Implement**; rebuild `index.html`.
- [ ] **Step 4: Run** all tests — Expected: PASS.
- [ ] **Step 5: Commit** `feat: design tokens, page shell, masthead and menu sheet`

---

### Task 7: Contour and pixel-dissolve canvases

**Files:**
- Create: `site/js/engine/contours.js`, `site/js/engine/dissolve.js`
- Modify: `site/css/base.css` (seam band: `absolute inset-x-0 top-0; height: 34svh; pointer-events: none`)
- Test: `tests/home-canvas.test.js`

**Interfaces:**
- Produces:
  - `field(x, y, t): number` — spec §L4738–4744 verbatim (the same four-sine field the hero shader uses).
  - `marchingSegments(values: Float32Array, cols, rows, level, stepX, stepY): number[][]` — `[x1, y1, x2, y2]` per segment, the case table of §L4771–4781.
  - `drawContours(ctx, { width, height, t, colour, cells = 96 }): void` — §L4735–4783 verbatim, using the two functions above; `mountContours(canvas, colourToken): () => void` redraws at 24ms on the ticker while in view.
  - `cellHash(x, y): number` — the spec's `noise` (§L2850–2855) verbatim.
  - `drawDissolve(ctx, { width, height, cell = 24, progress, surface, accent }): void` — §L2845–2872 **with the `(x + y) % 2` line removed**; `mountDissolve(band, carry: "light" | "dark")` — trigger `"top bottom" → "top top"`, `TRIGGER` config.
- [ ] **Step 1: Write the failing tests** (fake 2D context recording calls):
  - `one corner above level is one segment` — 1×1 cell with only the top-left value above level → 1 segment from left edge to top edge.
  - `saddle draws two` — values `[a>,b<,c>,d<]` (case 10) → 2 segments; all above → 0.
  - `dissolve solid rows at rest` — `progress 0`, 240×240 band, cell 24 → rows with `y/9 <= 0.16` fully filled: `fillRect` count ≥ 20 (two full rows of 10).
  - `dissolve gone at the top` — `progress 1` → 0 `fillRect` calls.
  - `cellHash` — deterministic, in `[0, 1]` for 1,000 cells.
- [ ] **Step 2: Run** — Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** — Expected: PASS.
- [ ] **Step 5: Commit** `feat: contour backdrop and pixel dissolve canvases`

---

### Task 8: Image pipeline scripts

**Files:**
- Create: `scripts/home/person_maps.py`, `scripts/home/make_noise.py`, `scripts/home/import_images.py`, `scripts/home/check_assets.py`
- Test: `tests/py/test_person_maps.py`, `tests/py/test_import_images.py`

**Interfaces:**
- Produces:
  - `import_images.py --kind {portrait|projects-figure|contact-figure|plate} SRC DEST` and `TARGETS: dict[str, dict]` = `portrait: 1024×1024 RGBA`, `projects-figure: 1186×1024 RGBA`, `contact-figure: 1536×1024 RGBA`, `plate: 1431×1024 RGB` — centre-crop to aspect, LANCZOS resize, WebP quality 85 (alpha kept); portrait is saved as PNG for the next script.
  - `person_maps.py PORTRAIT_PNG OUT_DIR` → `person-diffuse.webp` (RGB), `person-alpha.webp` (L), `person-depth.webp` (L), `person-normal.webp` (RGB), all 1024², and `veil-mask.png` (white RGB + portrait alpha, 512 tall). Functions: `chamfer_distance(mask: np.ndarray) -> np.ndarray` (two-pass 3-4 chamfer), `depth_from_alpha(alpha, luminance) -> np.ndarray` = normalise(0.7·sqrt(normalised distance) + 0.3·luminance)·alpha, then Gaussian blur radius 6; `normals_from_depth(depth, strength=4.0) -> np.ndarray` (central differences, encoded `(n·0.5 + 0.5)·255`).
  - `make_noise.py OUT` → `noise.webp` 512² grey, sum of integer-frequency sines (exactly tileable), fixed seed.
  - `check_assets.py` → `main(root: Path = repo root) -> int`: asserts every content.json image and every hero map exists with its `TARGETS` size and alpha where RGBA; returns 1 and prints the first bad path to stderr, else 0; `if __name__ == "__main__": sys.exit(main())`. Called by `check-release.py` in Task 16.
- [ ] **Step 1: Write the failing tests:**
  - `flat depth gives straight-up normals` — every pixel within ±1 of `(128, 128, 255)`.
  - `depth is zero outside the figure` — where alpha is 0, depth is 0; the centre of a filled disc is the maximum.
  - `crop hits the target` — a 1536×1024 synthetic image through `--kind plate` comes out 1431×1024; through `--kind contact-figure` keeps an alpha channel.
  - `noise tiles` — mean `|n[:, 0] - n[:, -1]|` < 3 grey levels.
  - `check_assets fails on a missing file` — run against a temp tree missing one plate → exit code 1 and the plate path in stderr.
- [ ] **Step 2: Run** `python3 -m unittest discover -s tests/py` — Expected: FAIL.
- [ ] **Step 3: Implement** (Pillow + numpy only).
- [ ] **Step 4: Run** — Expected: PASS.
- [ ] **Step 5: Commit** `feat: image import, portrait map and noise scripts`

---

### Task 9: Generate the character and imagery (needs Cayleb)

**Files:**
- Create: `assets/home/hero/{person-diffuse,person-alpha,person-depth,person-normal,noise}.webp`, `assets/home/hero/veil-mask.png`, `assets/home/experience/*.webp` (7), `assets/home/projects/figure.webp`, `assets/home/contact/figure.webp`, `assets/home/PROVENANCE.md`

**Interfaces:**
- Consumes: Task 8 scripts; content.json image paths.
- Produces: every image content.json and Task 10 reference, passing `check_assets.py`.

- [ ] **Step 1: Read** the `chrome-browser` skill; open a new ChatGPT chat in a new tab of Cayleb's Chrome. Ask Cayleb to attach his reference image (the one that did not arrive in the planning chat) in that ChatGPT chat.
- [ ] **Step 2: Generate the character sheet** with this prompt (all later prompts start with the same style anchor, sent in the same ChatGPT chat):

  > Style anchor: 3D animated-feature-film style, stylized but clearly recognizable as the person in my reference image — same face shape, skin tone, hair and any glasses or facial hair. Soft global illumination, subtle subsurface skin, clean modern materials. Palette: near-white #F7FAFB, near-black #090A0B, one cyan accent #02D2E3. No text, no logos, no brand marks, no vehicles, no helmets.
  > Character sheet: front view, three-quarter view and a full-body standing pose, wearing a plain near-black crew-neck top. Beside him, his AI agent companion: a small floating translucent glass droplet with simple friendly eyes and a faint cyan inner glow. Plain light-grey background.

- [ ] **Step 3: Gate — Cayleb approves the sheet** (or asks for changes). Nothing else is generated until he says yes.
- [ ] **Step 4: Generate the ten images**, each with the style anchor plus:

  | File | Size asked | Prompt |
  |---|---|---|
  | hero portrait | 1024×1024, transparent | Head-and-shoulders portrait facing the camera, calm neutral expression, near-black crew-neck top; top of head 10% below the top edge, eyes 38% from the top, shoulders filling the bottom edge; no companion; transparent background. |
  | projects figure | 1536×1024, transparent | Waist-up, three-quarter view facing left, typing on a slim laptop, the companion floating beside the screen; figure fills the full height; transparent background. |
  | contact figure | 1536×1024, transparent | Waist-up facing the camera, relaxed confident pose, one hand raised in a small wave, the companion at the other shoulder; figure fills the bottom edge; transparent background. |
  | 2024-dunkin | 1536×1024 | Behind a generic café counter handing over a coffee, warm morning light. No logos or brand names anywhere. |
  | 2024-pizza | 1536×1024 | In a small pizzeria kitchen sliding a pizza out of the oven. No logos. |
  | 2025-moving | 1536×1024 | Carrying a moving box out of a house with two crewmates, summer daylight. No logos or truck branding. |
  | 2026-plaster | 1536×1024 | Smoothing a fresh plaster wall with a trowel, dusty sunlight. |
  | 2026-school | 1536×1024 | In a classroom at a computer, coding, with network-security diagrams on a whiteboard behind. |
  | 2026-builds | 1536×1024 | At a desk with two monitors of code and dashboards, the companion floating nearby, evening light. |
  | 2026-integrator | 1536×1024 | Sitting beside a coworker at her desk, watching how she works and taking notes on a tablet, the companion hovering between them. |

  Every plate also ends: "Editorial composition, subject in the left or centre third, slightly desaturated with the single cyan accent."
- [ ] **Step 5: Bring the files in.** Cayleb downloads each image and attaches it to this chat (or, with the desktop app linked, Claude stages them from his Downloads folder). Run `import_images.py` per file with the right `--kind`, then `person_maps.py` on the portrait and `make_noise.py assets/home/hero/noise.webp`.
- [ ] **Step 6: Write** `assets/home/PROVENANCE.md`: date, tool (ChatGPT image generation), the style anchor and per-image prompt, and that the reference image itself is not stored in the repo.
- [ ] **Step 7: Run** `python3 scripts/home/check_assets.py` — Expected: exit 0.
- [ ] **Step 8: Commit** `feat: generated character imagery and hero maps`

---

### Task 10: Hero scene (WebGL)

**Files:**
- Create: `site/js/hero/tier.js`, `site/js/hero/fit.js`, `site/js/hero/headset-profile.js`, `site/js/hero/headset.js`, `site/js/hero/scene.js`
- Test: `tests/home-hero-math.test.js`

**Interfaces:**
- Consumes: Task 9 hero maps; vendored three + `RoomEnvironment` + `mergeGeometries`.
- Produces:
  - `getSceneTier(env = browserEnv()): SceneTier` — spec §L593–732 verbatim except it reads `env.matchMedia`, `env.innerWidth`, `env.navigator` (default `browserEnv()` returns the `window` ones) so node can test it; `CAP_60` exported.
  - `fit.js`: `CAMERA_FOV`, `CAMERA_Y`, `DEG`, `swing(v, ampDeg, curve)`, `visibleWorldHeight(cameraZ)`, `fitSubjectToBox(params, box, canvasHeight)` — verbatim from §L738–876; no three import.
  - `HEADSET_PROFILE: [x, y][]` (radius, height; y strictly increasing, last x = 0) — `[[0.30,0],[0.40,0.06],[0.47,0.18],[0.50,0.35],[0.50,0.55],[0.47,0.72],[0.40,0.85],[0.28,0.95],[0.12,0.995],[0,1]]`; `VISOR_BAND = [0.35, 0.62]`.
  - `buildHeadset(): Group` — shell `LatheGeometry(HEADSET_PROFILE as Vector2[], 96, phiStart = 55°, phiLength = 250°)` (the gap faces +z, the camera) in `MeshStandardMaterial({ color: #1b1d24, metalness 0.6, roughness 0.35 })`, named `shell`; visor = the profile points inside `VISOR_BAND` scaled ×1.03 radially, `LatheGeometry(…, 48, phiStart = −60°, phiLength = 120°)` in `MeshPhysicalMaterial({ color: #02d2e3, roughness 0.05, clearcoat 1, opacity 0.6 })`, named `visor`.
  - `class HeroScene` — spec §L1633–2789 ported; constructor `(canvas)`, `retune()`, `beginRise()`, `setPointer(x, y)`, `setParams(partial)`, `resize(w, h)`, `update(time)`, `dispose()`, `ready`, `onReady`, `tier` — signatures unchanged.
- **Deltas from the spec's `scene.ts`** (everything else verbatim, `DEFAULT_PARAMS` included):
  1. `ASSETS = "assets/home/hero"`; the four maps are 1024² WebP.
  2. `load()` awaits only the four maps and `noise.webp`; the environment is `new PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture`; no GLTF, Draco or RGBE loaders.
  3. `buildHelmet(buildHeadset(), noise)` — the traverse applies `side = FrontSide`, `transparent`, `depthWrite = false`, `envMapIntensity = 1.3` and `injectRevealMask` to **each** mesh's material; `shellMaterial` is the mesh named `shell`; `helmetTextures` stays empty.
  4. Brightness: keep the shell's base colour and apply `shell.color.copy(SHELL_BASE).multiplyScalar(p.helmetBrightness)` (the spec's `setScalar` would turn a mapless shell white).
  5. Add the class's closing `}` (the spec's quote ends without it, §L2789).
  6. Placement constants (`helmetX/Y/Scale`, `HELMET_WORN_OFFSET`) start at the spec's values and are tuned once in Task 18 so the visor band covers the portrait's eyes at 1440×900; record the final numbers in a comment.
- [ ] **Step 1: Write the failing tests:**
  - `tier matrix` — 390 wide + coarse → `mobile`, `maxDpr 1`, `trailSamples 28`, `reveal false`, `outline false`; 900 fine → `tablet`, `1.25`, `44`, `frameInterval === CAP_60`; 1440 fine → `desktop`, `1.5`, `72`, `frameInterval 0`, `antialias true`; 1000 coarse → `mobile`; 1100 coarse → `tablet`; reduced motion → `pointerEnabled false`, `freeze true`; mobile + `saveData` → `freeze true`.
  - `fit is identity for the full canvas` — box `{top: 0, height: 800}` on an 800 canvas returns the input `subjectScale` and `subjectY`; a box of height 400 halves `subjectScale`.
  - `swing reaches the amplitude` — `swing(1, 2.5, 0) === 2.5 * DEG`; `swing(1, 8, 3)` within 1e-12 of `8 * DEG`; `swing(0, 8, 3) === 0`.
  - `headset profile is a closed dome` — y strictly increasing, all x ≥ 0, last x === 0, at least two points inside `VISOR_BAND`.
- [ ] **Step 2: Run** `node --test tests/home-hero-math.test.js` — Expected: FAIL.
- [ ] **Step 3: Implement** the five modules.
- [ ] **Step 4: Run** — Expected: PASS.
- [ ] **Step 5: Commit** `feat: hero scene with procedural agent headset`

---

### Task 11: Hero block — layout, veil, entrance and fallbacks

**Files:**
- Create: `site/css/hero.css`, `site/js/hero/hero.js`
- Modify: `scripts/home/templates/hero.py`
- Test: `tests/home-hero.test.js`

**Interfaces:**
- Consumes: `HeroScene`, `getSceneTier`, `fitSubjectToBox`, `DEFAULT_PARAMS` (Task 10); `mountReveal`, `rise`, `ticker`, `Spring`, `CONFIGS` (Tasks 4–5); `drawContours` (Task 7); `mountMenu` (Task 6).
- Produces: `mount(root: HTMLElement): void`; `VEIL = { CREEP: 0.7, CLEAR_MS: 430, PAUSE_MS: 240, LIFT_TIMEOUT_MS: 3000, GONE_AT: 0.004 }`; `ENTRANCE = { nav: 0, identity: 180, panels: 900, actions: 1500 }`; `COVERED_AFTER = 1.15`; `formatAssetError(url: string): string` → `` `Couldn't load ${url}` ``; `showAssetError(url)` un-hides `.asset-banner` and appends the message.
- Built as spec §L333–550 says, with these deltas:
  - Name: three `nameWords`, word reveal; `max-width` removed (each word is its own line by markup: words are separate flex items with `flex-basis: 100%`). The eyebrow sits beside the first word from `xl` at `left: 22.5rem; top: 0.5625rem` (spec: 20.0625rem — "CAYLEB" is wider than "KIMI"; Task 18 confirms ≥ 1.5rem clear of the B).
  - Meta icons: inline SVG `pin` (1rem) and `spark` (1rem, a 4-point star), `currentColor`.
  - "Now building" panel: `<dl>` as the spec's, the `<time>` row replaced by the two `lines`; image slot = inline SVG 78×50 of four 4px nodes joined by 1px lines, stroke `var(--foreground)`.
  - Actions: the lab item uses an inline 32×32 play SVG; CTA frame and arrow paths verbatim, label `Résumé PDF`.
  - Veil: mask `assets/home/hero/veil-mask.png`; name `cayleb alvarez-james`; labels from `content.loading`.
  - WebGL unavailable (`HeroScene` constructor throws or no `WebGLRenderingContext`): a `<canvas>` running `drawContours` with `--surface-soft`, plus `<img src="assets/home/hero/person-diffuse.webp" alt="">` with `mask-image: url(person-alpha.webp)` (luminance) placed in the fit box; veil lifts immediately.
  - Any map or image `error` event → `showAssetError(url)`; a failed scene `load()` also calls `onReady` so the veil never hangs.
- [ ] **Step 1: Write the failing tests:**
  - `asset error banner names the url` — `formatAssetError("assets/home/hero/person-depth.webp") === "Couldn't load assets/home/hero/person-depth.webp"`; `index.html` contains one `.asset-banner` with `hidden` and `role="alert"`.
  - `veil timings` — `VEIL` deep-equals the values above; `ENTRANCE` likewise.
  - `hero markup` — the veil has `role="status"` and `aria-label` = `content.loading.label`; the scene canvas has `aria-hidden="true"`.
- [ ] **Step 2: Run** — Expected: FAIL.
- [ ] **Step 3: Implement**; rebuild `index.html`.
- [ ] **Step 4: Run** all tests — Expected: PASS.
- [ ] **Step 5: Commit** `feat: hero block, loading veil and fallbacks`

---

### Task 12: How I work — the loop map

**Files:**
- Create: `scripts/home/make_loop.py`, `site/js/approach/loop-path.js` (generated), `site/js/approach/map-vector.js`, `site/js/approach/lap.js`, `site/js/approach/dots.js`, `site/js/approach/approach.js`, `site/css/approach.css`
- Modify: `scripts/home/templates/approach.py`
- Test: `tests/home-approach.test.js`

**Interfaces:**
- Consumes: `field` (Task 7), engine (Tasks 4–5), `mountDissolve` (Task 7).
- Produces:
  - `make_loop.py` writes `loop-path.js` exporting `LOOP_PATH: [x, y][]` (artboard 1440×800, 1 decimal), `LOOP_STEP = 3`, `LOOP_LENGTH`, `LOOP_MARKERS: {x, y, d, label}[]`, `LOOP_START: {x, y, label}`, `LOOP_MAP_D: string` (SVG path in map units, 2 decimals), `LOOP_MAP_LENGTH`. Algorithm: closed centripetal Catmull-Rom through `CONTROL` (below), sampled 40 points per span, resampled by arc length at step 3.0, last point set equal to the first; each station's `d` = cumulative distance at the path point nearest it; map-space values via the spec's `artboardToMap`.
    `CONTROL = [(470,560),(350,500),(340,380),(430,290),(560,250),(720,200),(880,170),(980,230),(1010,360),(940,470),(980,590),(860,650),(700,610),(580,600)]`; stations `Shadow (340,380)`, `Understand (720,200)`, `Build (1010,360)`, `Teach (860,650)`; start/finish `(470,560)` labelled `Whole company`. Labels come from `content.approach`.
  - `map-vector.js`: `MAP_VIEW`, `mapToArtboard`, `artboardToMap`, `GRID_AXES_X`, `GRID_AXIS_Y`, `GRID_DASH`, `GRID_STROKE`, `HUB`, `RINGS`, `CORNER_MARKS`, `CORNER_MARK_SIZE` — verbatim from §L2980–3114; `TRACK_RIBBON`, `LAP_CENTRELINE`, `TURNS`, `TURN_POINTS`, `FLAG_CUT`, `FLAG_DIAMONDS` are **not** ported.
  - `lap.js`: §L3128–3269 verbatim (`LAP_MS 6000`, `CORNER_BRAKE 9`, `TIME_AT`, `distanceAtTime`, `trailUpTo`, `drawTrail`, `render`) on `LOOP_PATH`/`LOOP_MARKERS`/`LOOP_STEP`, with the flag-cut `clearRect` block removed; exports `distanceAtTime`, `trailUpTo`, `TOTAL`, `render(ctx, progress, heat)`.
  - `dots.js`: `buildDotField(threshold = 0.8): { points, columns, rows, count }` — every lattice point of §L3590 `DOT_LATTICE` across 2560×1440 (60,680 points) kept where `field(x / 2560 * 7.6 * 1.778 - 6.76, y / 1440 * 7.6 - 3.8, 0) > threshold` (0.8 keeps 7,921 — the reference's density); the halftone engine §L3867–4336 verbatim except: `approach = (from, to, dt, tau) => from + (to - from) * (1 - Math.exp(-dt / Math.max(tau, 1e-4)))` (the spec omits the body); `HalftoneLight = {x, y, heat}`; only the reticle light (the `edge`/wave branches are dropped — the shipped source is `none`); the parity skip in the draw is removed, so every lit dot squares up; `MAX_RATIO` is computed inside `bake()`, not at module top level (keeps the module importable in node).
  - `approach.js` `mount(root)`: stage fit (§L2878–2893), map SVG built from `map-vector.js` + the loop (ribbon = `LOOP_MAP_D` stroked `--foreground-on-dark` width 10, round joins; the accent copy under the lap mask, mask stroke 30, `stroke-dasharray = LOOP_MAP_LENGTH + 60`, `stroke-dashoffset = 60 + reveal * LOOP_MAP_LENGTH`); station nodes = accent circles r 11 (map units); start node = 24-unit `--map-mark` square; labels = SVG `<text>` in Space Grotesk 500, 28 map units, uppercase, `--foreground-on-dark`, offset (+24, −24), fading in over 400ms when the lap passes the station's `d` (the start label when the lap completes); lap tween 6000ms easeInOutSine at IntersectionObserver 0.35, cool 800ms easeOutCubic, reticle armed after cooling; grid drift 7s, ping 4.2s, globe 10s (§L2820–2838, §L2894–2916).
  - Heading `How I / work` + white full stop, intro, rule and plate per §L2806–2838 with content from `content.approach`.
- [ ] **Step 1: Write the failing tests:**
  - `loop closes on itself` — `LOOP_PATH[0]` equals the last point; every step is 3 ± 0.05 except the last (≤ 3); all points inside 0–1440 × 0–800.
  - `stations in order` — 4 markers, `d` strictly increasing, all < `LOOP_LENGTH`; labels match `content.approach.stations`.
  - `lap pacing` — `distanceAtTime(0) === 0`, `distanceAtTime(1) === TOTAL`, non-decreasing over 200 samples; the last point of `trailUpTo(TOTAL / 2)` is within 3 units of some path point.
  - `map round trip` — `mapToArtboard(...artboardToMap(700, 400))` within 1e-9 of `[700, 400]`.
  - `dot field` — `buildDotField()` is deterministic and its `count` is between 7,500 and 8,500.
  - `approach easing` — `approach(0, 1, 0.07, 0.07)` within 1e-12 of `1 - Math.exp(-1)`.
- [ ] **Step 2: Run** — Expected: FAIL.
- [ ] **Step 3: Implement**; run `python3 scripts/home/make_loop.py` and commit its output; rebuild `index.html`.
- [ ] **Step 4: Run** all tests — Expected: PASS.
- [ ] **Step 5: Commit** `feat: how-I-work loop map with lit stations and reticle`

---

### Task 13: Work experience timeline

**Files:**
- Create: `site/js/experience/geometry.js`, `site/js/experience/plate-shape.js`, `site/js/experience/timeline.js`, `site/css/experience.css`
- Modify: `scripts/home/templates/experience.py`
- Test: `tests/home-experience.test.js`

**Interfaces:**
- Consumes: engine (Tasks 4–5), `mountDissolve`.
- Produces: `geometry.js` = §L4435–4681 verbatim (entries are `{frame}` objects read from the DOM); `plate-shape.js` = §L4685–4714 verbatim; `timeline.js` `mount(root)` = rail, rows, three parallax layers on `top`, year letter reveals (centre rows settle to 0.4 after 2200ms), copy rise, hover dim — §L4339–4434.
- Deltas: heading lines `Work` / `experience`; side rows render the year plus a `title` line (Space Grotesk 500, `type(14)`, uppercase, white, line-height 1.1, `margin-top: 0.5em`) in the same absolutely-positioned year block; images and alt text from content.
- [ ] **Step 1: Write the failing tests:**
  - `rail geometry for seven rows` — entries C,S,C,S,C,S,C → `railHeight === 2668`; `restingPoint` within 1e-9 of `2387 / 2668`.
  - `parallax figures` — `PARALLAX` deep-equals `{plate: {side: 60, centre: 20}, copy: 110}`.
  - `rows match content` — `index.html` has 7 rows in content order; centre rows carry a copy `<p>` whose bold lead equals `lead`; side rows carry the `title`.
- [ ] **Step 2: Run** — Expected: FAIL.
- [ ] **Step 3: Implement**; rebuild.
- [ ] **Step 4: Run** — Expected: PASS.
- [ ] **Step 5: Commit** `feat: work experience timeline`

---

### Task 14: Selected projects

**Files:**
- Create: `site/js/projects/geometry.js`, `site/js/projects/projects.js`, `site/css/projects.css`
- Modify: `scripts/home/templates/projects.py`
- Test: `tests/home-projects.test.js`

**Interfaces:**
- Consumes: engine, `mountContours` (`--paddock-contour`), `mountDissolve` (`carry="dark"`).
- Produces: `geometry.js` = §L4895–5272 verbatim (`px`, `type`, `FRAME`, `PORTRAIT`, `PARALLAX_PORTRAIT`, `BAND`, `INTRO`, `CTA`, `PANEL`, `MEET`, `STATS`, `CALENDAR`, `PHONE`, the narrow constants, `BRACKET_PATH`, `CTA_PATH`, `ARROW_PATH`) plus `spread(x: number): string` = `` `calc(50% + ${px(x - 720)} * var(--cal-spread, 1))` ``; `projects.js` `mount(root)` = §L4717–4894.
- Deltas: heading `Selected` / `projects` (accent full stop); report + `Case study` button; the meeting panel shows `feature`; four stat rows with inline SVG icons drawn 31U (`check`, `bars`, `quote`, `gauge`, stroke `currentColor` 1.5); five cards from `cards` (the spec's round → `kicker`, name → `name`, date → `status`; the live round is the `marker: "live"` card); markers: `pr` → the text `PR` in the spec's result style, `live` → accent disc + pulse, `ring` → white ring; cards with `href` are links; the portrait is `figure.image`; the block wrapper carries `id="work"` and the featured block `id="suite"`.
- [ ] **Step 1: Write the failing tests:** `spread(347) === "calc(50% + -25.9028cqw * var(--cal-spread, 1))"`; `CALENDAR.links` deep-equals the spec's four connectors; `index.html` shows five project cards in content order and exactly one live marker.
- [ ] **Step 2: Run** — Expected: FAIL.
- [ ] **Step 3: Implement**; rebuild.
- [ ] **Step 4: Run** — Expected: PASS.
- [ ] **Step 5: Commit** `feat: selected projects block with project strip`

---

### Task 15: Contact footer

**Files:**
- Create: `site/js/contact/contact.js`, `site/css/contact.css`
- Modify: `scripts/home/templates/contact.py`
- Test: `tests/home-contact.test.js`

**Interfaces:**
- Consumes: engine, `mountContours` (`--footer-contour`), the projects `ARROW_PATH`.
- Produces: `mount(root)` — §L5275–5476 with: heading `Let's work` / `together` (white full stop); wordmark as accent text (no mask image); nav column from `contact.nav`, letter reveals; copyright, hollow `Download résumé` CTA (path verbatim), links row; **one** figure plate `contact/figure.webp` at the spec's body-plate placement (`left: 50%; bottom: -1.225%; height: 96.078%`) with `aspect-ratio: 1.5` and no suit mask; figure parallax window `"top bottom" → "bottom bottom"`, `top` from `px(60)` to `0cqw`.
- [ ] **Step 1: Write the failing tests:** `index.html` footer has `<nav aria-label="Footer">` with five links in content order; the copyright text equals `contact.copyright`; the figure `<img>` alt starts `Illustration:`.
- [ ] **Step 2: Run** — Expected: FAIL.
- [ ] **Step 3: Implement**; rebuild.
- [ ] **Step 4: Run** — Expected: PASS.
- [ ] **Step 5: Commit** `feat: contact footer`

---

### Task 16: Retire the classic homepage, add the résumé page, update checks and docs

**Files:**
- Delete: `remake/`, `characters/`, `stage/`, `vendor/aether-free/`, `vendor/gsap-3.14.2.min.js`, `scripts/build-remake.py`, `scripts/enhance-remake.py`, `scripts/enhance-refraction.py`, `scripts/render-caustics.py`, `assets/motion/`, `tests/refraction.test.js`, `tests/remake-state.test.js`
- Create: `scripts/home/templates/resume.py`, `site/css/resume.css`
- Generate: `resume.html`
- Modify: `tests/candidate-resume.test.js`, `tests/recruiter-truth-and-resume.test.js`, `tests/recruiter-portfolio.test.js`, `scripts/check-release.py`, `README.md`, `PRODUCT.md`, `DESIGN.md`

**Interfaces:**
- Consumes: everything above; `resume/candidate-fragment.html`.
- Produces: `resume.html` — the shell's masthead + the generated résumé fragment + a slim footer, styled by `resume.css` (single column, `max-width: 46rem`, Space Grotesk body 16px, Oswald section headings, `@media print` hides masthead/footer); `check-release.py` validates the new homepage and runs `check_assets.py`.
- [ ] **Step 1: Rewrite the old homepage tests against the new page** — keep their intent: PDFs downloadable from home; the three repo links present; `doesNotMatch(home, /working workflows|10 working/i)`; `match(home, /recorded/i)`; résumé page links work. Drop assertions about `remake/site.js`, `data-nav`, `project-playground` and lab receipt links on the homepage.
- [ ] **Step 2: Run** `node --test tests/*.test.js` — Expected: FAIL (no `resume.html` page yet).
- [ ] **Step 3: Delete** the listed paths; then `git grep -nE "remake/|characters/|stage/|aether|gsap-3|hero-caustics"` — Expected: no hits outside `docs/`, `design/` and `brag-output-*`.
- [ ] **Step 4: Implement** the résumé template + CSS; in `check-release.py` remove the character-frame hash loop and the `journey-progress` assertion, add a `check_assets.main()` call; keep every PDF and candidate check.
- [ ] **Step 5: Update docs** — README "Build and validate" becomes `python3 scripts/build-home.py`, `node --test tests/*.test.js`, `python3 -m unittest discover -s tests/py`, `python3 scripts/check-release.py`; PRODUCT.md and DESIGN.md get a dated section describing the new homepage, the integrator positioning and the claim limits from Global Constraints, and that the classic homepage is recoverable at `2732c2f`.
- [ ] **Step 6: Run** all three test commands — Expected: PASS.
- [ ] **Step 7: Commit** `refactor: retire classic homepage; add résumé page and updated release checks`

---

### Task 17 (optional, can ship after launch): Google Flow intro reel

**Files:**
- Create: `assets/home/reel/intro.mp4`, `assets/home/reel/intro.vtt`, `assets/home/reel/poster.webp`
- Modify: `site/content.json` (`hero.lab` → reel), `scripts/home/templates/hero.py`, `site/js/hero/hero.js`
- Test: `tests/home-content.test.js` (append), `tests/py/test_reel.py`

**Interfaces:**
- Produces: hero action `Watch the intro` / `<m:ss>` opening a `<dialog>` with `<video controls preload="none" poster>` and captions; the lab link moves to the footer links.
- [ ] **Step 1: Write the failing tests** — `reel duration label is true`: `ffprobe` duration of `intro.mp4`, formatted `m:ss`, equals `hero.lab.sub`; the VTT has at least one cue per 8 seconds.
- [ ] **Step 2: Run** — Expected: FAIL.
- [ ] **Step 3: Generate** in Google Flow (Cayleb's Chrome): four 8-second image-to-video clips from the approved character sheet — shadowing a coworker, building at a laptop with the companion, teaching at a desk, waving to camera; no text or logos; stitch with `ffmpeg` (H.264, CRF 23, max 1280 wide, AAC or silent); write captions describing each beat; poster = first frame.
- [ ] **Step 4: Run** — Expected: PASS.
- [ ] **Step 5: Commit** `feat: Flow intro reel`

---

### Task 18: Visual QA on a preview, tuning, PR

**Files:**
- Modify: whatever the QA findings require; `site/js/hero/scene.js` placement constants

- [ ] **Step 1: Deploy a preview** with the Vercel connector to the existing `agentic-resume` project as a *preview* (never production) — ask Cayleb before the first deploy.
- [ ] **Step 2: Inspect in Cayleb's Chrome** (read the `chrome-browser` skill first) at 390×844, 768×1024, 1024×768, 1280×800, 1440×900, 1920×1080, 2560×1440 and 844×390 (`short`): screenshot every block at rest and mid-motion. Pass criteria: the name never breaks mid-word and the eyebrow clears "CAYLEB" by ≥ 1.5rem; the visor band covers the portrait's eyes at 1440×900 (tune `helmetY`, `helmetScale`, `HELMET_WORN_OFFSET`; record values); no text overlaps a figure; the loop fills once and the station labels appear in order; dissolve seams read as pixels, not a chequerboard; the sticky stack recedes to 0.9 / 55%; deep links from `projects/dotz.html` to `#work` and `#contact` land on their sections.
- [ ] **Step 3: Check behaviour** — keyboard through masthead, menu sheet (Escape, focus return), all links; `prefers-reduced-motion` (scene plays its entrance then freezes; no reticle); JavaScript disabled (all copy visible, no veil); rename one experience image on the preview → banner names it.
- [ ] **Step 4: Fix and re-run** all three test commands — Expected: PASS.
- [ ] **Step 5: Commit, push the branch and open a PR** to `main` with the screenshots; Cayleb merges.
