# Water story homepage: design

**Date:** 2026-10-15. Approved in chat: Cayleb chose a scroll-driven intro, ink-on-light water that "takes any shape", the headline "Show me how you work. I'll find where AI fits.", no pictures of him anywhere, the story replacing "How I work" and "Worth it", Ergon at the centre with plain-word escalation, a faceless guide, tilt only where it is free, and about 1.5 screens of intro; then approved the plan.

## Intent

Cayleb wants the résumé homepage to stop leading with an illustrated character and instead **show, visually and with very few words, what he provides and why a Forward Thinking Engineer is worth it to any business**, then hand off to an official, professional résumé.

Today the hero is a Pixar-style 3D portrait plus a glass-droplet agent (three.js, `site/js/hero/scene.js`, 1,345 lines). Illustrated versions of him also appear in the projects and contact figures, in seven experience plates and on the share card. The middle of the page is made of text-heavy sections ("How I work", "Worth it" receipts).

The new homepage has two halves:
1. **The water story.** Scroll-driven, with a few words in the top-left corner. Water is the metaphor for adaptable: it takes the shape of whatever holds it.
2. **The official résumé.** Clean and professional, built from the same résumé data as the PDFs.

## Decisions from Cayleb (2026-10-15)

1. **Positioning.** He sells himself, the adaptable engineer: he learns how a role really works, then always finds where AI and automation save a lot of time and raise quality, in any field and on anything technical. The exact title stays "Forward Thinking Engineer".
2. **Headline.** "Show me how you work. I'll find where AI fits."
   - **Support line:** "Forward Thinking Engineer. I learn the job first, then build AI and automation into it. Saves time and raises quality, in any field."
3. **Metaphor: water takes any shape.** No pouring or sloshing. One calm body of water flows into each team's shape, then branches out to every employee. That network is the agent graph. You can touch and ripple the water.
4. **Intro: driven by scroll, about 1.5 screens.** The page fades in on his name. Scrolling animates the name, a drop falls and becomes the water, and the headline lands.
5. **Look: ink on light.** Near-black water with a thin cyan rim on the ice page. The headline flips from dark to light where the water passes behind it.
6. **No pictures of him anywhere.** The character and every illustration are scrapped.
7. **The story replaces "How I work" and "Worth it".** Both text sections leave the homepage. They stay recoverable in git.
8. **Ergon is the centerpiece of the story.**
   - What it is: a personal assistant per employee, built around the apps they already use; remote management of every computer; support tickets fixed by an agent with full remote screen control.
   - Escalation is shown in plain words: **Agent → Senior agent → Person**. No model names, because the repo currently routes Haiku 5.5 → Opus 5.5 → a person and that may change.
   - Price: **about $100 a person a month**, sized per company.
9. **The résumé half holds:** experience; projects with Ergon first; education; skills plus downloads.
   - The other jobs (Dunkin', Tommy's Pizza, moving crew, plaster) are there to show **work ethic**, and are labelled that way.
   - **No certifications** (Cayleb, 2026-10-15): anyone can have an agent earn one, so they prove nothing. The section is not built.
10. **Guide:** kept, without its face. It becomes a plain ink bead with a cyan rim and no eyes, blinking or gaze.
11. **Phone tilt:** only where no permission prompt is needed (Android). Nothing is asked on iOS.

## The new page

```
masthead (fixed, slim; fades in at the end of the intro)  CAYLEB.AJ · Experience · Projects · Lab · Contact · [Résumé →] · burger
<section.story#home data-story>  tall scroll runway with a sticky 100svh stage
   canvas[data-water]: one fullscreen shader, the water
   name block: the page's only <h1> (sr-only full name + aria-hidden word spans), "Forward Thinking Engineer", scroll cue
   beat captions, top-left: one <h2> + one short line each
   overlay labels (DOM, placed from the same layout math as the shader)
   static SVG per beat: shown only with no JS, reduced motion or no WebGL
<div.resume-half#resume>  "Résumé" kicker + name, title, Remote-only, Connecticut
   <section#experience>  official experience + additional experience
   <section#work>        projects, Ergon first: name, stack, bullets, status, case study / repo links, lab link
   <section#education>   education, skills, downloads (no certifications)
<footer><section#contact>  email, GitHub, PDFs, ©. No figure, no contours.
guide (faceless bead), shown only in the résumé half
```

## The story beats

The runway is about 7 screens. Each beat is a pure function of scroll progress, so scrolling back plays it in reverse.

| Beat | Screens | What the water does | Top-left words (h2 + line) | Overlays |
|---|---|---|---|---|
| 0 Intro | 1.5 | The name fades in on load. On scroll, its letters spread, shrink and fly to the masthead wordmark. A single drop falls from the name, splashes (ripple) and settles into a calm pool across the lower ~38%. | (name block; cue "Scroll") | none |
| 1 Hero | 0.75 | A calm pool you can play with: ripples under the cursor or finger, and a slight lean with tilt on Android. | **Show me how you work. I'll find where AI fits.** + support line | none |
| 2 Shape | 1.0 | The pool lifts and flows into three silhouettes in turn (moving truck → office desk and screen → shop counter) and fills each exactly. | **Every team works differently.** I build to fit yours. | none |
| 3 Team (Ergon) | 1.25 | The water gathers into a source node and branches as channels to 6 employee nodes (4 on phones). Each fills, then wraps a thin rim around 2–3 app tiles. | **Everyone gets their own assistant.** Built around the apps they already use. | role labels (Owner, Dispatch, Front desk, Books, Crew lead, Sales), app glyphs, small "Ergon" tag |
| 4 Tickets | 1.0 | One node sends ticket drops. Most stop at the first gate with a check. One climbs to the second gate, and one reaches the person. Before the gates, a drop enters a screen outline to show the fix happens on the computer. | **Problems fix themselves.** Right on the computer. Hard ones go up. A person has the last word. | Agent → Senior agent → Person |
| 5 Worth it | 1.0 | Each node becomes a column with a low "$100/mo" mark. The water rises above it (time back) and spills into a new container. | **About $100 a person a month.** Time back to take on more work. | "$100 / mo", "+ more work" |
| 6 Drain | 0.5 | Everything drains into one waterline, which becomes the top rule of the résumé half. | none | none |

Copy follows the site's voice rules: few words, plain words, no jargon. The story describes the offer in present tense, as "Worth it" did. The résumé half carries the verified status, for example Ergon's pilot still pending live checks. No real company is named as a client, no hours are claimed, and the money never comes from anyone's hours or pay.

## How the water works

Everything runs on the vendored three.js and the existing engine. There are no new dependencies and no network requests.

- **`site/js/story/timeline.js`** (pure): `storyState(progress, layout)` returns `{beat, t, name: {x, y, scale, spread, opacity}, captions: [opacity…], masthead, slots, overlays}`. Beat boundaries come from the screen budget in the table above, with easing per beat.
- **`site/js/story/shapes.js`** (pure):
  - `layoutFor(aspect, tier)` returns a landscape layout (team fan in an arc) or a portrait one (2×2 branching).
  - `slotsFor(beat, layout)` returns up to 16 primitive slots per beat. Each slot is `{kind: circle | roundBox | capsule, center, size, radius, fill}`.
  - Every layout keeps out of the reserved top-left caption box.
  - Overlay label positions come from the same layout, so the DOM labels sit exactly on the shader's nodes.
- **`site/js/story/ripple.js`** (pure, CPU): a damped wave equation on a small `Float32Array` grid (160×90 on desktop, 96×54 on phones). It has `poke(x, y, strength)`, `step(dt)` and `energy()`, and is uploaded each frame as a `DataTexture`. This avoids float render targets entirely.
- **`site/js/story/water.js`:** a three.js `WebGLRenderer` plus one fullscreen `ShaderMaterial`. The fragment shader:
  - evaluates the SDF smooth-union (smin) of the beat's A and B slot sets, mixed by `t`, plus a small flow wobble mid-transition so morphs read as flowing water;
  - offsets the boundary and the normals with the ripple height;
  - shades an ink fill (`--raw-color-ink-900`), a thin `--raw-color-cyan-400` fresnel rim and a soft specular, on the ice background;
  - reads its colours through `tokens.js` `readToken`.
- **`site/js/story/story.js` `mount(el)`:**
  - progress comes from `triggerProgress(el, 'top top', 'bottom bottom')`, read through Lenis;
  - the loop runs with `runWhileVisible` on the shared ticker;
  - pointer and touch listeners are passive and only add ripples, so page scroll is never blocked (`touch-action: pan-y`);
  - tilt listens to `deviceorientation` only when `DeviceOrientationEvent.requestPermission` is absent;
  - it retunes only when the width changes, so iOS address-bar resizes don't thrash;
  - when the tab is hidden or the stage is off screen, it pauses;
  - on `webglcontextlost` or a shader error it adds `.story--static`.
- **`site/js/story/tier.js`** (moved from `hero/`): keeps `name`, `mobile`, `coarsePointer`, `reducedMotion`, `maxDpr` (1/1.25/1.5), `frameInterval` (CAP_60 on touch), `antialias` and `freeze`. It drops `trailSamples`, `outline` and `reveal`, and adds `rippleGrid` and `teamSize` (6, or 4 on mobile). On a frozen tier the shader renders only when scroll progress changes, with no ripples and no idle wobble.
- **Headline flip:** the caption text is white with `mix-blend-mode: difference` over the canvas, inside the same stacking context. That reads near-black on ice and near-white on ink. Where the blend mode isn't supported (`@supports not`), the text falls back to plain ink.

## Fallbacks and accessibility

- **The runway exists only when all of these hold:** `.js:not(.reveal-failsafe)`, `@media (prefers-reduced-motion: no-preference)`, and no `.story--static` class.
- **Otherwise** (no JS, reduced motion, failsafe, or no WebGL) the story renders as a normal stack of blocks: the name, then each beat's h2, line and static inline SVG (ink plus cyan, drawn in `story.py`). Nothing moves and everything is readable.
- **Load fade-in:** done with the existing reveal engine (`data-reveal` and `data-fade` on ticker springs). The veil loader is removed. There are no CSS keyframes (home-shell rule).
- **Structure:** one `<h1>` (the name). Every beat caption and résumé section is an `<h2>`, and overlays are `aria-hidden`. Deep links (`#experience`, `#work`, `#contact`) still land correctly, and subpage nav anchors are rebuilt from `content.nav`.
- **Keyboard:** the story needs no input to read. The masthead and burger are keyboard reachable with visible focus (`menu.js`, moved to `site/js/masthead/menu.js`).

## The résumé half (official)

Rendered by **`scripts/home/templates/resume_half.py`** from **`resume/resume-content.json`**, the same source as the PDFs:
- **Experience:** `experience` (title, dates, intro), then `additional_experience` under an h3 "Work ethic" with one plain line ("Real jobs, real hours. Where I learned how teams actually work.").
- **Projects:** `projects` in file order, which already puts Ergon first. Each shows name, stack, bullets, a case-study link (`projects/{slug}.html`, all five exist) or a repo link, and the lab link.
- **Education:** `education`.
- **Skills and downloads:** `skills`, plus both PDFs.

The PDFs and `resume/*` files are untouched. The jargon ban in `home-few-words` still covers only the story copy in `content.json`. The official skills list naming Python, Rust and React is expected there.

## Other pieces

- **Masthead:** extracted to `scripts/home/templates/masthead.py` and fixed at the top of the page. With JS it fades in at the end of the intro; without JS it is always visible. The nav reads Experience, Projects, Lab, Contact; the action is Résumé.
- **Contact footer:** wordmark, h2, email, GitHub and PDFs. The figure, parallax (`contact.js`, `geometry.js`) and contours go, and the copyright becomes "© 2026 Cayleb Alvarez-James."
- **Guide:**
  - `guide.py` SVG: an ink bead with a cyan rim; eyes, blink and gaze are removed.
  - `guide.js`: drops its `droplet-shape.js` import and only appears once `#resume` is in view.
  - Lines are keyed to experience, work, education and contact.
  - The "What does Cayleb do?" answer is rewritten for the new positioning, and a "What's Ergon?" question is added (≤7 words per question, ≤32 per answer).
- **Share card:** `make_share_card.py` is redrawn at 1200×630 and under 400KB. It shows the name in Oswald 700, "Forward Thinking Engineer", the headline and an ink wave with a cyan rim. Then regenerate `assets/og/card.png`. The new `meta.shareAlt` starts "Share card:".
- **Meta description:** "Cayleb Alvarez-James, Forward Thinking Engineer. Learns how you work, builds AI into it." (13 words).

## What gets removed

- **JS:**
  - all of `site/js/hero/` except `tier.js` (moved) and `menu.js` (moved);
  - `site/js/approach/*`, `site/js/experience/*`, `site/js/projects/*`, `site/js/contact/*`;
  - `engine/stack.js`, `engine/dissolve.js` and `engine/contours.js`, once nothing imports them.
- **Templates:** `hero.py`, `approach.py` (move its `heading()` helper into `markup.py`), `experience.py`, `projects.py`, `value.py`. Also `PLATE_CLIP`, `PLATE_OUTLINE` and `HERO_CTA_FRAME` in `markup.py` if unused, and the plate-clip defs in `shell.py`.
- **CSS:** `hero.css`, `approach.css`, `experience.css`, `projects.css`, `value.css`. These are replaced by `story.css` and `resume-half.css`, while `contact.css` and `guide.css` are slimmed.
- **content.json keys:** `hero`, `approach`, `experience`, `projects`, `value`, `loading`. They are replaced by `story` (intro, beats, overlays) and `resumeHalf` (kicker, labels).
- **Assets:** all of `assets/home/` (hero maps, plates, figures, `PLACEHOLDERS.json`, `PROVENANCE.md`).
- **Scripts:** `derive_scenes.py`, `derive_character.py`, `person_maps.py`, `import_images.py`, `make_plates.py`, `make_plate_sizes.py`, `make_noise.py`, `make_loop.py`, `make_placeholders.py`, `targets.py`, `check_assets.py`. The `check-release.py` call to `check_assets.py` goes too, and its link check must still cover every local `src` and `href`.
- **Legacy files not served** (`js/`, `css/`, `assets/img/`, `brag-output-*`): left alone, out of scope.

## Tests

- **Remove:**
  - `home-hero`, `home-hero-math`, `home-approach`, `home-experience`, `home-projects`, `home-canvas` (once contours and dissolve are gone);
  - `tests/py/test_person_maps.py`, `test_derive_character.py`, `test_derive_scenes.py`, `test_import_images.py`, `test_make_plates.py`.
- **Rewrite:**
  - `home-structure`: one h1 holding the sr-only name; ids `home`, `resume`, `experience`, `work`, `education`, `contact`; one h2 per résumé section; deterministic rebuild; the banned-words test kept.
  - `home-content`: the story keys exist; every limit pattern matches something; numbers trace either to the résumé or to `story.worth.price`, which is documented as Cayleb's 2026-10-15 pricing.
  - `home-few-words`: headline ≤10 words, hero support ≤22, other beat lines ≤16, description ≤16; the jargon regex kept.
  - `home-value` becomes `home-worth`: it keeps the "never saves money by taking hours, pay or people" guard, now over all homepage copy, and bans `clients?|revenue|profit|returns?`.
  - `home-polish`: drop the hero, figure and plate geometry; keep the accent-ink and focus checks.
  - `home-shell`: the new `STYLES`; the keyframe ban, the failsafe and the hiding rules kept.
  - `home-engine`: drop the `recede` and `VEIL` pins if those are removed.
  - `home-guide`: no eyes element; appears only in the résumé half.
  - `home-contact`: no figure.
  - `site-meta`: `shareAlt` starts "Share card:"; card size unchanged; "Forward Thinking Engineer" in the intro, `shareAlt` and `make_share_card.py`.
  - Also check `recruiter-*.test.js`, `subpages.test.js` and `hosted-lab-uncertainty.test.js` for removed homepage keys or copy.
- **Add:**
  - `home-story-math.test.js`:
    - `storyState` is pure and reversible, with exactly one caption fully visible at a time and the endpoints at 0 and 1;
    - slots stay in bounds and out of the caption box, with team size by tier;
    - the ripple grid's energy decays, it stays bounded, and `poke` is local;
    - the tier matrix.
  - `home-story.test.js`:
    - markup: one h1, beat h2s, a static SVG per beat;
    - the runway CSS sits under both the failsafe selector and the motion query;
    - `index.html` has **no `<img>`** and no `assets/home/` or "Illustration" anywhere in served pages.
  - `home-resume-half.test.js`: Ergon first; every case-study link resolves; education matches `resume-content.json`; a "Work ethic" h3 over the other jobs; no certifications markup at all; skills present; both PDFs linked.

## Execution

1. Commit this design as `docs/superpowers/specs/2026-10-15-water-story-design.md`.
2. Run `superpowers:writing-plans` to produce `docs/superpowers/plans/2026-10-15-water-story.md` in the repo's format (Decisions, Global Constraints, Review Focus, File Structure, `### Task N` with failing test → implement → pass → commit), then execute it with `superpowers:subagent-driven-development`. The task order:
   1. Pure math: `timeline.js`, `shapes.js`, `ripple.js`, `tier.js`, with `home-story-math` tests.
   2. `water.js` and `story.js`, plus `story.py`, `story.css` and `masthead.py`; move `menu.js`.
   3. `resume_half.py` and `resume-half.css`, with tests.
   4. Contact, guide and share card.
   5. `content.json`, `content-limits.json`, `build-home.py` (drop the hard-coded `hero.glance` check) and `shell.py` (`STYLES`, page order).
   6. Remove the dead code, assets, scripts and tests; update `check-release.py`.
   7. Docs: README, DESIGN.md (new "current" section), PRODUCT.md (current block). Note that the old homepage is recoverable at commit `cbdd73c`.
   8. Rebuild with `build-home.py` and `build-subpages.py`, then run the full suite.
3. Push to `ccr-d07f46e5-5gyzor` and open a **draft PR**. Never merge to `main` (GitHub Pages publishes it) without Cayleb's explicit "merge it".

## Verification

- **Builds:** `python3 scripts/build-home.py && python3 scripts/build-subpages.py`. Rebuilding twice gives an identical `index.html`.
- **Tests:** `node --test tests/*.test.js`, `python3 -m unittest discover -s tests/py`, `python3 scripts/check-release.py`.
- **Playwright visual QA** (Chromium at `/opt/pw-browsers`, served via `python3 -m http.server`):
  - screenshots at each beat's midpoint for 390×844, 844×390, 768×1024, 1280×800, 1440×900 and 2560×1440;
  - scroll down and back up to confirm the story reverses;
  - reduced-motion and no-JS screenshots, which should show the static story and full résumé;
  - a forced WebGL failure, which should switch to static;
  - an fps sample of rAF deltas over 3s per viewport (target ≥55fps on desktop, ≥50 at the 390 width with CPU throttling ×4);
  - keyboard tab order through the masthead, résumé links and guide;
  - zero console errors, and zero network requests to other origins.
- Send Cayleb the beat screenshots and a short scroll capture before the PR leaves draft.

## Open items (not blocking)

- **Ergon résumé and PDF bullets** stay as they are. A follow-up could add the ticket escalation and remote screen control once the other session lands them.
- **Projects and contact imagery:** both are gone with the figures. If a visual is wanted later, it can be a water motif, never a picture of him.
