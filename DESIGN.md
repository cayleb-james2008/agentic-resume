# Water story homepage (2026-10-15)

**Source.** The design is `docs/superpowers/specs/2026-10-15-water-story-design.md`; the plan is `docs/superpowers/plans/2026-10-15-water-story.md`. It replaces the illustrated, character-led homepage below, which is recoverable at commit `cbdd73c`.

**Idea.** Water takes the shape of whatever holds it, and so does Cayleb. One calm body of water flows into a team's shape, then branches out to every employee. That is the pitch, shown with very few words. There is no picture of him anywhere.

**Structure.** Two halves and a footer, under a slim fixed masthead.
- The water story: a tall scroll runway with a sticky full-screen stage. The name, then five short beats: the headline, shape, team (Ergon), tickets, and the price. Words sit top left.
- The official résumé: a white sheet built from `resume/resume-content.json`, the same source as the PDFs. The two downloads sit in its head, then experience, projects with Ergon first, and education and skills.
- The contact footer: email, GitHub and the PDFs.
- The guide is a plain bead with no face. It shows only in the résumé half.

**Motion.**
- One ticker (`site/js/engine/ticker.js`) drives every spring and tween. Lenis provides smooth scroll.
- One shader draws the water: a single full-screen pass on the vendored three.js 0.185.0 that blends the beat's shapes into one body. A small wave grid on the CPU gives ripples under the cursor or a finger.
- The beats are scrubbed by scroll. Each is a pure function of scroll progress (`site/js/story/timeline.js`), so scrolling back plays it in reverse. The runway is about seven screens.
- Static fallback: the runway exists only with scripts on, motion allowed, WebGL working and the 4-second failsafe not tripped. Otherwise the story is a stack of blocks: the name, then each beat's heading, line and a small inline drawing. Nothing moves and nothing is hidden.
- There are no CSS keyframes. CSS transitions are reserved for hover colour and button floods.
- Phones get a smaller wave grid and four team nodes instead of six. Tilt works only on Android; nothing is ever asked on iOS.

**Colour.** Ink water (`--raw-color-ink-900`, `#0e0f14`), a thin cyan rim (`--raw-color-cyan-400`, `#02d2e3`), on an ice ground (`--raw-color-ice-50`, `#f7fafb`). The headline is white with a difference blend, so it reads dark on ice and light on ink; where that blend is missing it falls back to plain ink. The résumé sheet is white with the same ink and cyan. Raw token values do not change, and scripts read colour through `readToken`.

**Type.** Oswald 700 for headlines, Space Grotesk for lines and body. Both are vendored.

**Claims.** The story is the offer; the résumé half is the record.
- The story says what he builds in the present tense, in few plain words. No client is named, no hours are claimed, and money never comes from anyone's hours, pay or people.
- The ticket ladder is Agent → Senior agent → Person. No model names, because the routing may change.
- The price, about $100 a person a month, is Cayleb's own 2026-10-15 figure, sized per company.
- The résumé half carries the verified status: Ergon is a Windows pilot with live checks pending. The other jobs are labelled "Work ethic". There is no certifications section.
- These claim limits are held by tests: no clients, returns, profit or revenue in the homepage copy, and EvoHedge and Maki never named (`tests/home-content.test.js`); the guide names no clients, customers or company pilots, and never RHL (`tests/home-guide.test.js`); the homepage describes the lab as recorded demos (`tests/recruiter-truth-and-resume.test.js`).
- One more limit is kept by hand, with no test behind it: RHL appears only as the moving-crew job in the résumé half.

---

# Personalized homepage (2026-10-12)

> **Superseded 2026-10-15** by the water story above. This is the illustrated, character-led homepage, recoverable at commit `cbdd73c`. Its image scripts and `assets/home/` were removed after that commit, so the paths named here exist only there.

**Source of the layout.** The layout, motion and engine are rebuilt from a third-party "recreate this site" spec, kept locally at `docs/superpowers/specs/` and git-ignored. Only the format is kept: page structure, animations and engine. All of the spec's racing imagery, names and assets are replaced. The plan is `docs/superpowers/plans/2026-10-12-personalized-homepage.md`, and its Personalization map records every substitution.

**Structure.** One light/dark sticky stack (hero → how I work), then the experience timeline, the projects block and the cyan-edged contact footer. Pixel-dissolve seams join the dark and light blocks.

**Type and colour.** Oswald 700 for display, Space Grotesk for body. The palette is near-black ink, a pale surface and one cyan accent. Tokens, the type scale and the root font bands follow the spec verbatim (`site/css/tokens.css`).

**Motion.**
- One rAF ticker drives every spring and tween, with react-spring-equivalent solver scaling and real elapsed time.
- Text reveals are pre-split at build time into an sr-only copy plus aria-hidden units.
- Lenis provides smooth scroll.
- There are no CSS keyframes. CSS transitions are reserved for hover colour, the plate inset and button floods.
- With reduced motion, nothing moves. With JavaScript off, everything is visible. A 4-second failsafe un-hides the page if the module graph fails.

**Hero.** A WebGL scene (three 0.185.0, vendored) puts a procedural headset on the illustrated portrait of Cayleb. It uses depth, normal and veil maps derived from the portrait by `scripts/home/person_maps.py`, and falls back to a contour field when WebGL is unavailable.

**How I work.** A Catmull-Rom loop through four stations (Shadow, Understand, Build, Teach) to the finish, "Whole company". A halftone dot field is drawn over the same contour field.

**Imagery.** Every image is Cayleb as a Pixar-style 3D character: brown hair, glasses, a black shirt and jeans. The seven timeline plates are scenes he generated in ChatGPT, one per job. The hero portrait, projects figure and contact figure are cut from three of those scenes by `scripts/home/derive_scenes.py`. Every image is labelled "Illustration:" in its alt and credited in the footer. Provenance is in `assets/home/PROVENANCE.md`.

**Claim limits.** These match PRODUCT.md:
- Recorded demos only.
- No clients, pilots, returns or revenue.
- RHL appears only as a moving-crew job.
- EvoHedge and Maki are private and in development.

The classic character-led homepage described below is recoverable at commit `2732c2f`.

---

# Character-led résumé remake

Sole implementer and self-review. The user's no-subagent instruction overrides local delegation defaults. Scope is the specified candidate homepage; the rejected 18409 preview and older services remain intact. No publishing, purchases, installs, local model downloads or private RHL material.

## Direction and first viewport

Experience mode: a quiet name / Mofu / Explore–Professional header. A large approved glass droplet beside the short service statement. Three work questions lead directly into the corresponding assistant. Silent ambient movement; pause available without native video chrome. The character artwork is the visual anchor, not a generated comp or a placeholder.

The signature interaction follows nine meaningful states: a concrete task, the assistant checking source records, and a named human reviewing a prepared decision. Pip uses a repair ticket and calendar hold; Folio uses proof pages and collected comments; Loam uses count blocks and order allocations. No room, space, constellation or workbench metaphor. Direct buttons and reading alternatives carry the full narrative when pinning cannot fit.

Professional mode: restrained masthead, conventional one-page résumé first, then optional examples. Same document and state; switching must preserve story/project context and keyboard focus. Supporting projects are briefly introduced immediately below the assistant demos, with detailed interactions on demand.

## Tokens

Mocha #1e1e2e; Mantle #181825; Surface #313244; Text #cdd6f4; Sky #89dceb; Peach #fab387; Green #a6e3a1. Green indicates a prepared review, not an external action. Bricolage headings, IBM Plex reading/controls; self-hosted existing files. Body 14–18px, controls at least 44px; 8px spacing unit with 16/24/40/64px groups. Varied 18/28/36px radii. Convex rims, offset soft shadows and reflected cool/peach light express the requested Aero material.

Avoid identical story panels, long technical copy, native player chrome, empty scroll runways, fake metrics, client claims, project completion inferred from a simulation, tiny decorative data, or substituted character geometry. Preserve PNG source pixels and exact manifest timing.

## Bounds and evidence

One complete implementation pass, one batched desktop/mobile rendered critique and correction, one confirmation pass. Additional repair only for failing requirements. No visual acceptance until screenshots are actually inspected. Browser reservation remains binding. Independently test asset hashes, relative links, controller syntax, state parsing/serialization, nine source constraints and all thirty receipt outputs while waiting. Required browser matrix includes mobile 320/390, short desktop, desktop, actual 200% zoom, keyboard, reduced motion, no-JS, print, history, repeated mode changes and actual frame playback.

## Sources actually read

- Handoff, concept, builder, CSS, project/reading/resume source, narrative and workflow data in the designated checkout.
- Local Anthropic frontend-design SKILL.md + overlay, pin 3b600518a637492d37c9877aeb49c2a55d939c04, Apache-2.0; current official anthropics/skills frontend-design text read through web. Applied restraint, artifact-first hierarchy, subject-specific composition and deliberate type.
- Local Impeccable v4.3.1 SKILL.md, overlay, new-work and craft-floor; installed provenance pin cb56ed6c19a07329a9fa0cd4e657bee040156593, Apache-2.0. Existing engine 0.1.5 context ran, exit 0. Pinned user direction and no subagents override its extra concept/agent rounds. Old root DESIGN.md and sidecar describe a former design; homepage plan here governs this remake. No update performed.
- nexu-io/open-design README, skills README and design-templates/AGENTS.md from official main, Apache-2.0. Read as workflow reference, not installed. Applied separate design contract, assets and runtime, with fallback reading/print.
- animate-character-assets complete SKILL.md via skills.read. Applied portable exact-duration frame adapter, semantic states, offscreen pause and approved idle for reduced motion. No regeneration or Pets actions.
- route-marketing-workflows complete SKILL.md via skills.read. Its linked cloud inventory/manifest resources failed to read. Read official pinned upstream README inventory of all 50 skills instead, plus product-marketing, copywriting, copy-editing, cro, site-architecture and copy-editing checklist. Revision 1efedbc5148b54b2f0f6c6c9fe0be62e151c7fff, MIT. Public reference text saved under this task's references with hashes printed. Applied plain-English problem/action/benefit, human approval, two audience paths and proof constraints. No conversion measurement or outreach. ai-writing-tells.md guessed path returned 404 and was not used.
- Existing HyperFrames entry, animation and creative motion-principles read. Existing GSAP is retained; this is a website frame adapter, not a new HyperFrames video composition. No CLI upgrade/install under the user's no-install constraint.
- Daedalus complete SKILL.md read. Linked UNIVERSAL_WORKFLOW.md unavailable at the advertised local location; do not claim full repository installation. Applied reversible baseline, explicit criteria and evidence-limited self-review.
- Actual saved free Aether black-octopus-6 button and green-bird-70 switch HTML/CSS read, component MIT notices retained in vendor/aether-free. Adapt those real primitives to rounded Mocha glass, normal-case Plex type and full text labels; do not claim the paid system was obtained.

Rollback: checkpoints/inherited-remake.tar.gz plus baseline.diff in this task. Branch verified rebuild/aero-character-remake-20261009, HEAD 387af02836e503c3e67f6deb0fee7149098e05d7.

## Implementation checkpoint and acceptance boundary

Explicit fictional approve/reset actions preserve independent chapter approvals in the URL. Tessa approves the provisional hold; Mina approves the pack with Rowan’s release decision pending; Dev approves the allocation with no shipment. Professional mode closes optional demonstrations initially and remembers mode-specific disclosure choices.

User-workflow follow-up references: official awwwards-animations SKILL.md read; raw LICENSE path returned 404, guidance only, no copied code. Official HyperFrames LICENSE read and verified Apache-2.0: https://github.com/heygen-com/hyperframes/blob/main/LICENSE. No new image variants, Flow/Veo clip or HyperFrames MP4 was generated; approved exact frame artwork and existing GSAP supply the opening loop. Existing static builder retained; suggested additional framework/libraries were not installed.

CUA initialization failed twice with kernel-asset quota errors. Parent confirmed UID 1000 /tmp quota nearly exhausted. No browser screenshots, recording, keyboard, zoom, print, playback, performance or rendered critique was completed. Static Impeccable detection exited 2 with 122 findings; source corrections made, rendered findings remain open. This candidate is not ready for visual acceptance. Full QA matrix and source evidence: /home/cayleb/Documents/Codex/2026-10-09/task-5/evidence/QA.md.

Existing routes retain their prior styles; this direction governs the authorized homepage remake.

## Refraction pass (2026-10-12)

Direction: the approved glass characters already refract light, so motion follows that physics instead of adding new decoration. One ambient moment lives in the hero (work → lens → spectrum → decision, sky → mauve/peach → green, matching the existing meaning of green as a prepared review). Everything else answers a visitor's action and shows what changed. Character frames are never redrawn or non-uniformly scaled; entrances use translate and uniform scale only. Generated video, if added, is environmental light only (see `design/HIGGSFIELD-SHOTS.md`).
