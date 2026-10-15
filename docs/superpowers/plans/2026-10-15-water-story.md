# Water Story Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the character-led homepage with (1) a scroll-driven "water takes any shape" story drawn by one fullscreen shader and (2) an official résumé half rendered from `resume/resume-content.json`. No picture of Cayleb appears anywhere.

**Architecture:**
- Pure, node-tested modules decide everything that moves:
  - `site/js/story/timeline.js` maps scroll progress to a state;
  - `shapes.js` gives the layouts and 16 SDF "slots" per frame;
  - `ripple.js` is a CPU wave grid;
  - `tier.js` is the device tier.
- `water.js` only draws that state with the vendored three.js (one `ShaderMaterial` on a fullscreen quad). `story.js` wires scroll, pointer, tilt and the DOM.
- The Python templates (`story.py`, `masthead.py`, `resume_half.py`) render the markup, including a static SVG per beat for no-JS and reduced motion.

**Tech Stack:** Python 3 templates (`scripts/home`), vanilla ES modules, vendored three.js 0.185.0 and Lenis 1.3.26, node:test, Python unittest, Playwright with Chromium at `/opt/pw-browsers` (QA only).

**Spec:** `docs/superpowers/specs/2026-10-15-water-story-design.md`

## Decisions from Cayleb (2026-10-15)

See the spec's "Decisions" list. These are the ones that bind the code:
- Headline: "Show me how you work. I'll find where AI fits."
- Scroll-driven intro of about 1.5 screens.
- Ink on light.
- No images of him.
- The story replaces "How I work" and "Worth it".
- Escalation shown as "Agent → Senior agent → Person".
- "About $100 a person a month".
- Faceless guide.
- Tilt only where no permission prompt is needed.
- The other jobs are shown as **work ethic**, under that label. **No certifications** section: anyone can have an agent earn one.

## Global Constraints

- **No third-party runtime requests.** Use only the vendored three.js (`import … from 'three'`) and Lenis through the existing import map. Add no new dependencies, and do not change `vendor/PROVENANCE.json`.
- **Every `site/js` module is side-effect-free at import.** `window.__homeBooted = true` stays the last statement of `boot()`, after every mount.
- **No `@keyframes` anywhere.** CSS transitions only for hover colour and button floods. Motion runs on the shared ticker (`site/js/engine/ticker.js`) with springs from `engine/spring.js`.
- **Any CSS rule that hides content** (`opacity: 0` or `visibility: hidden`) has a selector starting with `.js:not(.reveal-failsafe)`. The 4s failsafe in `shell.py` `HEAD_SCRIPT` stays.
- **The scroll runway exists only** under `.js:not(.reveal-failsafe)`, inside `@media (prefers-reduced-motion: no-preference)`, and on `.story:not(.story--static)`. Otherwise the story is a static stack of blocks.
- **Tokens:** `tokens.css` raw values stay verbatim. You may add tokens but not change any. The water is ink `--raw-color-ink-900 #0e0f14` with a `--raw-color-cyan-400 #02d2e3` rim on `--raw-color-ice-50 #f7fafb`. Read colours in JS with `readToken` (`engine/tokens.js`).
- **Copy:**
  - every visible string lives in `site/content.json`;
  - few words, plain words;
  - none of `loopback|daemon|JSON-RPC|Tauri|axum|Rust|React|Python|LLMs?|Clippy|SHA|provenance|deterministic|repo|PR|API|CLI|workbench|pipeline|IPC|SDK|runtime` in `content.json`;
  - none of `hedge fund|returns?|profit|revenue|clients?`;
  - no savings from hours, pay or people;
  - no model names.
- **"Forward Thinking Engineer"** is the exact title. `meta.title` is "Cayleb Alvarez-James · Forward Thinking Engineer".
- **URLs:** every local URL is relative, with no leading `/`.
- **Structure:** exactly one `<h1>` (the name), and `index.html` contains no `<img>`.
- **Untouched:** `resume/*`, the PDFs, `.txt` exports, `resume.html` content, `lab/` and the project page bodies. `scripts/build-subpages.py` reruns because nav anchors change.
- **Commits:** end every commit message with:
  ```
  Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_011JVuMT4BCNFkXTRKbEN6cC
  ```
  Never put a model identifier anywhere in the repo.

## Review Focus

1. **iOS address bar shows or hides** (height-only resize of about 50–120px): the stage must not re-layout or jump. `shouldRetune` (Task 2) is tested to ignore height-only changes under 160px, and the runway uses `svh`.
2. **Opening `index.html#experience` or `#contact` directly:** the story must render its end state, with the masthead visible and the water drained. `storyState(1)` is tested in Task 1, and the deep load is checked in Task 9.
3. **No WebGL, or the context is lost mid-scroll:** the page switches to the static story with the masthead visible, never a blank tall runway. `story.js` adds `.story--static`, and Task 9 forces `getContext` to return null.
4. **Swiping vertically on a phone over the water** must scroll the page. Listeners are passive and the canvas has `touch-action: pan-y` (asserted in Task 3).
5. **A 2560×1440 screen at the 1.5 pixel-ratio cap** must not exceed the fill budget. `renderSize` (Task 2) caps the drawn pixels at 3.7M and is tested.

## File Structure

```
site/js/story/tier.js        getStoryTier(env)                         (moved from site/js/hero/tier.js, retuned)
site/js/story/ripple.js      createRipple, rippleSize                  (pure)
site/js/story/shapes.js      CAPTION_BOX, layoutFor, slotsFor, overlaysFor, MAX_SLOTS (pure)
site/js/story/timeline.js    BEATS, RUNWAY_SCREENS, beatAt, storyState (pure)
site/js/story/view.js        shouldRetune, renderSize, toPercent       (pure helpers for story.js)
site/js/story/water.js       class Water (three.js renderer + shader)
site/js/story/story.js       mount(section, { lenis })
site/js/masthead/menu.js     mountMenu                                  (moved from site/js/hero/menu.js, unchanged API)
scripts/home/templates/masthead.py      render(content) -> str
scripts/home/templates/story.py         render(content) -> str
scripts/home/templates/resume_half.py   render(content, resume) -> str
site/css/masthead.css  site/css/story.css  site/css/resume-half.css
tests/home-story-math.test.js  tests/home-story.test.js  tests/home-resume-half.test.js  tests/home-worth.test.js
```

The following are deleted in Tasks 6 and 8:
- `site/js/hero/`, `site/js/approach/`, `site/js/experience/`, `site/js/projects/`, `site/js/contact/`;
- `site/js/engine/{stack,dissolve,contours}.js`;
- the templates `hero.py`, `approach.py`, `experience.py`, `projects.py`, `value.py`;
- `site/css/{hero,approach,experience,projects,value}.css`;
- `assets/home/` and the image scripts.

---

### Task 1: Pure story maths (tier, ripple, shapes, timeline)

**Files:**
- Create: `site/js/story/tier.js`, `site/js/story/ripple.js`, `site/js/story/shapes.js`, `site/js/story/timeline.js`
- Test: `tests/home-story-math.test.js`

**Interfaces:**
- Produces:
  - `getStoryTier(env?) -> {name:'mobile'|'tablet'|'desktop', mobile, coarsePointer, reducedMotion, maxDpr, frameInterval, pointerEnabled, rippleLong, teamSize, freeze}` and `CAP_60`.
  - `createRipple(cols, rows, {damping=0.985}?) -> {cols, rows, height: Float32Array, poke(u, v, strength, radius=2), step(), energy() -> number, toBytes(out: Uint8Array) -> Uint8Array}`
  - `rippleSize(aspect, longSide) -> [cols, rows]`
  - `MAX_SLOTS = 16`
  - Slot `= {a:[x,y], b:[x,y], th:number, r:number, fill:number}`
  - `CAPTION_BOX(aspect) -> {x0,x1,y0,y1}`
  - `layoutFor(aspect, teamSize) -> Layout`
  - `slotsFor(beatId, t, layout) -> Slot[]` (length `MAX_SLOTS`)
  - `overlaysFor(layout) -> {shape:[{x,y,index}], team:[{x,y,index,apps:[string]}], tickets:{source:{x,y}, gates:[{x,y,index}]}, worth:{price:{x,y}, more:{x,y}}}` (positions and indices only; every label comes from content, rendered by Task 3)
  - `BEATS`, `RUNWAY_SCREENS = 7`, `beatAt(progress) -> {index, id, t}`
  - `storyState(progress, layout) -> {beat, t, name:{y, scale, spread, opacity}, cue, masthead, captions:{hero,shape,team,tickets,worth}, overlays:{shape,team,tickets,worth}, slots, flow, splashAt}`
- **Coordinates:** stage units, origin bottom-left, `y ∈ [0,1]` (stage height), `x ∈ [0, aspect]`.

- [ ] **Step 1: Write the failing tests** in `tests/home-story-math.test.js`:

```js
import { getStoryTier, CAP_60 } from '../site/js/story/tier.js';
import { createRipple, rippleSize } from '../site/js/story/ripple.js';
import { CAPTION_BOX, MAX_SLOTS, layoutFor, slotsFor, overlaysFor } from '../site/js/story/shapes.js';
import { BEATS, RUNWAY_SCREENS, beatAt, storyState } from '../site/js/story/timeline.js';

const env = ({ width, coarse = false, reduced = false, saveData = false, memory = 8 }) => ({
  innerWidth: width, navigator: { connection: { saveData }, deviceMemory: memory },
  matchMedia: (q) => ({ matches: q.includes('coarse') ? coarse : q.includes('reduced-motion') ? reduced : false }),
});

test('story tier matrix', () => {
  // desktop 1440 fine: maxDpr 1.5, frameInterval 0, pointerEnabled true, rippleLong 128, teamSize 6, freeze false
  // tablet 1024 coarse: maxDpr 1.25, frameInterval CAP_60, pointerEnabled false, rippleLong 128, teamSize 6
  // mobile 390 coarse: maxDpr 1, frameInterval CAP_60, rippleLong 72, teamSize 4, freeze false
  // mobile 390 coarse + saveData: freeze true; desktop reduced: freeze true, pointerEnabled false
  // and the dropped keys stay gone: trailSamples, outline, reveal are undefined
});
test('ripple: a poke is local, energy decays, heights stay bounded', () => {
  const r = createRipple(64, 36);
  r.poke(0.5, 0.5, 1, 2);
  // cells further than 3 cells from (32,18) are exactly 0 right after the poke
  const e20 = (() => { for (let i = 0; i < 20; i++) r.step(); return r.energy(); })();
  for (let i = 0; i < 400; i++) r.step();
  assert.ok(r.energy() < e20 * 0.2);
  assert.ok(Math.max(...r.height.map(Math.abs)) <= 1);
  const bytes = r.toBytes(new Uint8Array(64 * 36));  // 0 height → 128
});
test('rippleSize keeps cells square-ish', () => {
  assert.deepEqual(rippleSize(16 / 9, 128), [128, 72]);
  assert.deepEqual(rippleSize(390 / 844, 72), [33, 72]);
});
test('beats add up to the runway and the intro is 1.5 screens', () => {
  assert.equal(BEATS.reduce((s, b) => s + b.screens, 0), RUNWAY_SCREENS);
  assert.deepEqual(BEATS.map((b) => b.id), ['intro', 'hero', 'shape', 'team', 'tickets', 'worth', 'drain']);
  assert.equal(BEATS[0].screens, 1.5);
  assert.deepEqual(beatAt(0), { index: 0, id: 'intro', t: 0 });
  assert.equal(beatAt(1).id, 'drain'); assert.equal(beatAt(1).t, 1);
});
test('storyState is pure and reversible', () => {
  const L = layoutFor(16 / 9, 6);
  for (const p of [0, 0.13, 0.5, 0.77, 1]) assert.deepEqual(storyState(p, L), storyState(p, L));
});
test('at most one caption reads at a time, and each beat with a caption shows it fully', () => {
  for (const [aspect, team] of [[16 / 9, 6], [390 / 844, 4]]) {
    const L = layoutFor(aspect, team);
    const peak = {};
    for (let i = 0; i <= 1000; i++) {
      const c = storyState(i / 1000, L).captions;
      assert.ok(Object.values(c).filter((o) => o > 0.5).length <= 1, `p=${i / 1000}`);
      for (const [k, o] of Object.entries(c)) peak[k] = Math.max(peak[k] ?? 0, o);
    }
    for (const k of ['hero', 'shape', 'team', 'tickets', 'worth']) assert.equal(peak[k], 1, k);
  }
});
test('the ends: name on screen at 0, drained and masthead shown at 1', () => {
  const L = layoutFor(16 / 9, 6);
  const s0 = storyState(0, L), s1 = storyState(1, L);
  // s0.name.opacity 1, s0.name.scale 1, s0.cue 1, s0.masthead 0
  // s1.masthead 1, s1.name.opacity 0, s1.cue 0, every caption 0
  // s1: the only active slot (r + th > 0 and fill > 0) is the waterline, whose top edge is at most y 0.03
});
test('slots stay in the stage and out of the caption box', () => {
  for (const [aspect, team] of [[16 / 9, 6], [4 / 3, 6], [844 / 390, 4], [390 / 844, 4], [768 / 1024, 6]]) {
    const L = layoutFor(aspect, team), box = CAPTION_BOX(aspect);
    for (const id of ['hero', 'shape', 'team', 'tickets', 'worth', 'drain']) for (const t of [0, 0.25, 0.5, 0.75, 1]) {
      const slots = slotsFor(id, t, L);
      assert.equal(slots.length, MAX_SLOTS);
      // for every active slot: its bounding box (a, b grown by th/2 + r) lies within x ∈ [-0.35, aspect+0.35], y ∈ [-0.35, 1]
      // and does not intersect box (x0..x1 × y0..y1)
    }
  }
});
test('the team beat fans out to teamSize people, each with two or three apps', () => {
  assert.equal(overlaysFor(layoutFor(16 / 9, 6)).team.length, 6);
  assert.equal(overlaysFor(layoutFor(390 / 844, 4)).team.length, 4);
  // every team entry: 2 ≤ apps.length ≤ 3, apps ⊂ ['mail','calendar','sheet','phone','chat']; tickets.gates.length === 3
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/home-story-math.test.js`
Expected: FAIL with `Cannot find module '../site/js/story/tier.js'`.

- [ ] **Step 3: Implement `tier.js`.** Copy `site/js/hero/tier.js` (it keeps its `browserEnv`, `CAP_60` and `isEnergySaver`) and rename the export to `getStoryTier`.
  - Remove `antialias`, `trailSamples`, `outline` and `reveal`.
  - Add `rippleLong: mobile ? 72 : 128` and `teamSize: mobile ? 4 : 6`.
  - Rewrite the header comment for the water story.
  - Leave the old `site/js/hero/tier.js` in place until Task 6.

- [ ] **Step 4: Implement `ripple.js`.** It uses two `Float32Array` buffers, `cur` and `prev`, and edges are clamped (Neumann). `step()` is:
  ```js
  next[i] = ((cur[l] + cur[r] + cur[u] + cur[d]) * 0.5 - prev[i]) * damping;  // then swap prev←cur, cur←next
  ```
  - `poke(u, v, strength, radius)` adds `strength * (1 - d/radius)²` to the cells within `radius` cells of `(u·(cols-1), v·(rows-1))`. Clamp the result to [-1, 1].
  - `energy()` is the sum of `cur[i]²`.
  - `toBytes(out)` writes `round((clamp(h,-1,1)*0.5+0.5)*255)`.
  - `rippleSize(aspect, long)` returns `aspect >= 1 ? [long, round(long/aspect)] : [round(long*aspect), long]`.
  - `height` is a getter for `cur`.

- [ ] **Step 5: Implement `shapes.js`.**
  - **Caption box.** `CAPTION_BOX(aspect)` is `{x0:0, x1:0.5*aspect, y0:0.55, y1:1}` when `aspect >= 1`, and `{x0:0, x1:aspect, y0:0.64, y1:1}` otherwise.
  - **Layout.** `layoutFor` returns `{aspect, teamSize, art:{x0,x1,y0,y1}, poolTop, nodes, source, gates, columns}`.
    - Landscape: art `{x0:0.54a, x1:0.96a, y0:0.1, y1:0.9}`, `poolTop 0.34`.
    - Portrait: art `{x0:0.06a, x1:0.94a, y0:0.06, y1:0.58}`, `poolTop 0.3`.
    - `nodes`: `teamSize` points. Landscape uses a shallow arc across the art box at `y0 + 0.22h` (ends 0.06h higher). Portrait uses a 2×2 grid in the lower 60% of the art box.
    - `source`: `(centre x, y1 − 0.08h)`.
    - `gates`: three points rising left to right from 35% to 85% of the art box width.
    - `columns`: `teamSize` x-positions across the left 75% of the art box.
  - **Slots.** `slotsFor(id, t, layout)` builds each beat from at most 16 slots and pads the rest with `{a:[0,0], b:[0,0], th:0, r:0, fill:0}`.
    - **hero:** the pool, `a:[-0.3, poolTop/2], b:[aspect+0.3, poolTop/2], th: poolTop, r:0, fill:1`.
    - **shape:** three silhouettes made of oriented boxes and circles, each at most 6 slots and centred in the art box: a moving truck (cargo box, cab, two wheel circles), a desk (top slab, two legs, monitor, stand) and a shop counter (counter, awning, two posts). `t` thirds pick the silhouette. Each third morphs for its first 40% (from the previous silhouette, or from the pool for the first), then holds.
    - **team:** a source circle (r 0.045), `teamSize` node circles (r 0.032) and `teamSize` channel capsules (`th 0, r 0.006`) from the source to each node. The channel `fill` grows over t ∈ [0.1, 0.6], staggered by `0.06·i`, and a node's r grows from 0 once its channel reaches it.
    - **tickets:** one employee node (`nodes[0]`), three gate circles (r 0.03), two channel capsules between the gates and one from the node to gate 0, and three drops (r 0.014) travelling the chain with staggered starts. Drop 0 stops at gate 0, drop 1 at gate 1 and drop 2 at gate 2.
    - **worth:** `teamSize` column boxes (width `0.5·(art width)/teamSize`) rising from `y0` to `y0 + h·(0.12 + 0.43·ease(t))`, plus a spill container box at the right 20% of the art box that fills from `t = 0.6`, and a capsule from the last column into it.
    - **drain:** the waterline `a:[-0.3,0.012], b:[aspect+0.3,0.012], th:0.012, r:0, fill:1`.
  - **Morphing between beats.** At the start of each beat (`t < 0.4`), lerp every slot field from the previous beat's `t = 1` slots to this beat's, using `easeInOutCubic(t/0.4)`. Slot i maps to slot i, and unused slots shrink to the point of their counterpart.
  - **Overlays.** `overlaysFor` returns positions from the same layout: the three shape labels under the art box, team entries at the nodes (`apps` cycles `['mail','calendar'], ['sheet','phone','mail'], ['chat','calendar']` by index), the three gates, the price at the first column's 12% mark, and "more" at the spill container.

- [ ] **Step 6: Implement `timeline.js`.**
  ```js
  export const BEATS = Object.freeze([
    { id: 'intro', screens: 1.5 }, { id: 'hero', screens: 0.75 }, { id: 'shape', screens: 1 },
    { id: 'team', screens: 1.25 }, { id: 'tickets', screens: 1 }, { id: 'worth', screens: 1 }, { id: 'drain', screens: 0.5 },
  ]);
  ```
  - **`beatAt`** maps `progress × 7` into a beat and its local t.
  - **Intro (local t):**
    - `cue = 1 − ramp(t, 0, 0.15)`;
    - `name.scale = 1 − 0.65·ease(ramp(t, 0, 0.6))`;
    - `name.y = −0.38·ease(ramp(t, 0, 0.6))` (stage heights, upward);
    - `name.spread = 0.3·ramp(t, 0, 0.5)` (em);
    - `name.opacity = 1 − ramp(t, 0.55, 0.8)`;
    - `masthead = ramp(t, 0.6, 0.9)` (1 after the intro);
    - the drop circle appears at t 0.35 at `(aspect/2, 0.5)` and falls (ease-in quad) to `poolTop·0.1` by t 0.6;
    - the pool `th` grows from 0 to `poolTop` over t ∈ [0.55, 1];
    - `splashAt = 0.6·(1.5/7)`, the global progress at which the drop lands.
  - **Captions.** A caption fades in over the first 25% of its beat and out over the last 15%. The hero caption instead starts rising at intro t 0.8 and is full by hero t 0.2. Captions are 0 outside their beat.
  - **Overlays.** An overlay follows its beat's caption opacity, except that it fades in after the beat's morph (t ≥ 0.4).
  - **`flow`** is `sin(π·min(1, t/0.4))` during a morph and 0 otherwise.
  - **Helpers.** `ramp(x, a, b)` is a clamp to 0–1. `ease` is easeInOutCubic. Keep both private.

- [ ] **Step 7: Run the tests to verify they pass**

Run: `node --test tests/home-story-math.test.js`
Expected: PASS (9 tests).

- [ ] **Step 8: Commit**

```bash
git add site/js/story tests/home-story-math.test.js
git commit -m "feat(story): pure timeline, shapes, ripple and tier for the water story"
```

---

### Task 2: The water renderer and the story mount

**Files:**
- Create: `site/js/story/view.js`, `site/js/story/water.js`, `site/js/story/story.js`
- Test: `tests/home-story-math.test.js` (append)

**Interfaces:**
- Consumes: everything Task 1 produces; `ticker`, `triggerProgress`, `runWhileVisible` and `prefersReducedMotion` from `engine/`; `readToken` from `engine/tokens.js`.
- Produces:
  - `shouldRetune(prev:{w,h}, next:{w,h}) -> boolean`
  - `renderSize(w, h, dpr, maxPixels=3.7e6) -> {width, height, ratio}`
  - `toPercent({x,y}, aspect) -> {left, top}` (numbers, %)
  - `class Water { constructor(canvas, {tier, colors}); resize(cssW, cssH, dpr); render({slots, flow, time, ripple:Uint8Array, rippleSize:[c,r], tilt:[x,y]}); dispose() }`, where the constructor throws if WebGL is unavailable;
  - `mount(section, { lenis }) -> cleanup` (Task 6 adds it to `main.js` `MOUNTS` as `['[data-story]', mountStory]`).
- **DOM hooks** (rendered by Task 3): `[data-story]` section, `[data-story-stage]`, `canvas[data-water]`, `[data-story-name]`, `[data-story-cue]`, `[data-caption="<beat>"]`, `[data-overlay="<beat>"]` with children `[data-overlay-item][data-index]`, `[data-masthead]`.

- [ ] **Step 1: Write the failing tests** (append to `tests/home-story-math.test.js`):

```js
import { shouldRetune, renderSize, toPercent } from '../site/js/story/view.js';
test('an address-bar resize never retunes; a width change does', () => {
  assert.equal(shouldRetune({ w: 390, h: 844 }, { w: 390, h: 760 }), false);
  assert.equal(shouldRetune({ w: 390, h: 844 }, { w: 390, h: 600 }), true);   // 244px: a real resize
  assert.equal(shouldRetune({ w: 390, h: 844 }, { w: 844, h: 390 }), true);
});
test('render size respects the pixel cap', () => {
  const big = renderSize(2560, 1440, 1.5);
  assert.ok(big.width * big.height <= 3.7e6);
  assert.deepEqual(renderSize(390, 844, 1), { width: 390, height: 844, ratio: 1 });
});
test('stage units map to overlay percentages', () => {
  assert.deepEqual(toPercent({ x: 0.8, y: 0.25 }, 1.6), { left: 50, top: 75 });
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `node --test tests/home-story-math.test.js`
Expected: FAIL with `Cannot find module '../site/js/story/view.js'`.

- [ ] **Step 3: Implement `view.js`.**
  - `shouldRetune` is true when the width changes, or when the height changes by 160px or more.
  - `renderSize` is `ratio = min(dpr, sqrt(maxPixels/(w·h)))`, then rounds `w·ratio` and `h·ratio`.
  - `toPercent` is `left = x/aspect·100`, `top = (1−y)·100`.

- [ ] **Step 4: Implement `water.js`.**
  - Use `WebGLRenderer({ canvas, antialias:false, alpha:false, powerPreference:'high-performance' })`, an `OrthographicCamera(-1,1,1,-1,0,1)`, `PlaneGeometry(2,2)` and a `ShaderMaterial` with `glslVersion: GLSL3`.
  - The ripple is a `DataTexture(bytes, cols, rows, RedFormat, UnsignedByteType)` with `LinearFilter` and `unpackAlignment = 1` (widths such as 33 are not multiples of 4), and `needsUpdate` is set each render.
  - Uniforms: `uRes`, `uAspect`, `uTime`, `uFlow`, `uTilt`, `uSlotA[16]` (`ax, ay, bx', by'` where `b' = a + (b−a)·fill`), `uSlotB[16]` (`th, r, active, 0`), `uRipple`, `uInk`, `uDeep` (`--raw-color-ink-950`), `uRim`, `uBg`.
  - The fragment shader, in stage units (`p = gl_FragCoord.xy / uRes.y`):
    ```glsl
    float sdOrientedBox(vec2 p, vec2 a, vec2 b, float th) {
      float l = length(b - a); if (l < 1e-5) return length(p - a) - th * 0.5;
      vec2 d = (b - a) / l; vec2 q = p - (a + b) * 0.5;
      q = mat2(d.x, -d.y, d.y, d.x) * q; q = abs(q) - vec2(l, th) * 0.5;
      return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
    }
    float smin(float a, float b, float k) { float h = max(k - abs(a - b), 0.0) / k; return min(a, b) - h * h * k * 0.25; }
    // d = smin over active slots of (sdOrientedBox(...) - r), k = 0.035
    // h = texture(uRipple, p / vec2(uAspect, 1.0)).r * 2.0 - 1.0;  d -= h * 0.012;
    // d += uFlow * 0.006 * sin(p.x * 23.0 + uTime * 0.002) * sin(p.y * 17.0 - uTime * 0.0015);
    // p.y += uTilt.x * (p.x - uAspect * 0.5) * 0.08  (before evaluating d: a leaning surface)
    // aa = fwidth(d); inside = 1.0 - smoothstep(-aa, aa, d);
    // n = normalize(vec2(dFdx(d), dFdy(d)) + vec2(0.0, 1e-6));
    // rim = (1.0 - smoothstep(0.0, 0.006, -d)) * inside * (0.55 + 0.45 * max(n.y, 0.0));
    // spec = pow(max(dot(n, normalize(vec2(-0.4, 1.0))), 0.0), 24.0) * (1.0 - smoothstep(0.0, 0.02, -d)) * inside;
    // body = mix(uDeep, uInk, smoothstep(0.0, 0.4, p.y)) + uRim * 0.12 * abs(h);
    // col = mix(uBg, body, inside); col = mix(col, uRim, rim); col += spec * 0.35;
    ```
  - `resize` applies `renderSize(cssW, cssH, min(dpr, tier.maxDpr))`.
  - `render` copies the slots into the uniform arrays (a slot is active when `r + th > 0` and `fill > 0`) and calls `renderer.render`.
  - On `webglcontextlost`, call `this.onLost?.()`.

- [ ] **Step 5: Implement `story.js` `mount(section, { lenis })`.**
  - If `prefersReducedMotion()`, return a no-op. The CSS has already kept the runway off.
  - Read `getStoryTier()`.
  - `await import('./water.js')` inside a `try`. On any throw, or when `Water`'s constructor throws, add `section.classList.add('story--static')`, set the masthead to `style.opacity = '1'`, and return.
  - `layout = layoutFor(w/h, tier.teamSize)`. Then `ripple = createRipple(...rippleSize(aspect, tier.rippleLong))` and a `bytes` buffer.
  - **Frame loop** on `runWhileVisible(stage, frame, () => tier.frameInterval)`:
    - `progress = triggerProgress(section.getBoundingClientRect(), innerHeight, 'top top', 'bottom bottom')`, then `s = storyState(progress, layout)`;
    - when `progress` crosses `s.splashAt` going forward, call `ripple.poke(0.5, 0.1, 0.9, 4)`;
    - if `!tier.freeze`, call `ripple.step()` twice per frame;
    - write the DOM:
      - name: `transform: translate3d(0, ${-s.name.y*100}svh, 0) scale(…)`, `letter-spacing: ${s.name.spread}em`, opacity;
      - cue opacity; masthead `style.opacity`;
      - each `[data-caption]`: opacity, plus `translateY((1-o)·0.75rem)`;
      - each `[data-overlay]`: opacity, and `pointer-events:none`;
    - render only when something changed: progress, `ripple.energy() > 1e-4`, `s.flow > 0`, or tilt.
  - **Overlay positions** are set once per layout. Write each item's `style.left` and `style.top` with `toPercent` and `overlaysFor(layout)`.
  - **Input:**
    - pointer: `section.addEventListener('pointermove', …, { passive: true })` pokes at the pointer, strength `min(0.6, speed·0.002)` (only if `tier.pointerEnabled`);
    - `pointerdown` pokes with 0.8 on every tier except freeze;
    - tilt: if `typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission !== 'function'`, listen to `deviceorientation` (passive) and keep `tilt = [clamp(gamma/45, -1, 1), 0]`.
  - **Resize:** a `ResizeObserver` on the stage. If `shouldRetune`, redo the layout, the ripple and the overlay positions, then call `water.resize`.
  - **Context loss:** `water.onLost` does the same as the import failure.
  - The returned cleanup removes every listener and disposes `water`.

- [ ] **Step 6: Run the tests to verify they pass**

Run: `node --test tests/home-story-math.test.js`
Expected: PASS (12 tests). `water.js` and `story.js` are browser-only. They are imported and exercised in Task 9.

- [ ] **Step 7: Commit**

```bash
git add site/js/story tests/home-story-math.test.js
git commit -m "feat(story): water shader renderer and scroll mount"
```

---

### Task 3: Story and masthead markup and CSS

**Files:**
- Create: `scripts/home/templates/story.py`, `scripts/home/templates/masthead.py`, `site/css/story.css`, `site/css/masthead.css`, `site/js/masthead/menu.js` (a `git mv` of `site/js/hero/menu.js`, with its imports re-pointed to `../engine/…`)
- Modify: `scripts/home/markup.py` (add `heading()`, moved verbatim from `templates/approach.py` with its `STOP`/`LINE_STEP` constants, plus `ICONS` `mail`, `calendar`, `sheet`, `phone`, `chat`, `screen` and `checkmark`, as 16×16 stroked SVGs like the existing ones)
- Test: `tests/home-story.test.js`

**Interfaces:**
- Consumes: `content["story"]`, the shape below (Task 6 writes it into `content.json`; this task's tests use a fixture built in the test); `content["nav"]`, `content["navAction"]`, `content["wordmark"]`; `overlaysFor` app keys from Task 1.
- Produces: `masthead.render(content) -> str` and `story.render(content) -> str`, emitting the Task 2 DOM hooks.

```json
"story": {
  "intro": { "nameWords": ["Cayleb", "Alvarez-", "James"], "title": "Forward Thinking Engineer", "cue": "Scroll" },
  "beats": [
    { "id": "hero", "headline": "Show me how you work. I'll find where AI fits.",
      "line": "Forward Thinking Engineer. I learn the job first, then build AI and automation into it. Saves time and raises quality, in any field." },
    { "id": "shape", "headline": "Every team works differently.", "line": "I build to fit yours.", "labels": ["Moving crew", "Office", "Shop"] },
    { "id": "team", "headline": "Everyone gets their own assistant.", "line": "Built around the apps they already use.", "tag": "Ergon",
      "roles": ["Owner", "Dispatch", "Front desk", "Books", "Crew lead", "Sales"] },
    { "id": "tickets", "headline": "Problems fix themselves.", "line": "Right on the computer. Hard ones go up. A person has the last word.",
      "ladder": ["Agent", "Senior agent", "Person"] },
    { "id": "worth", "headline": "About $100 a person a month.", "line": "Time back to take on more work.",
      "price": "$100 / mo", "more": "+ more work" }
  ]
}
```

- [ ] **Step 1: Write the failing tests** in `tests/home-story.test.js`. They render the templates through `python3 -c` with `sys.path` set to `scripts/home`, the real `site/content.json` merged with the fixture `story` above (write the fixture into the test as JSON), and the CSS from `site/css/story.css`:

```js
test('the story holds the one h1: the name for assistive tech, the words split for motion', () => {
  // exactly one <h1 …id="story-name"> containing <span class="sr-only">Cayleb Alvarez-James</span> and aria-hidden reveal units
  // the h1's sibling title reads "Forward Thinking Engineer"; the cue reads "Scroll" and is aria-hidden
});
test('each beat has one h2 caption, its line, and a static drawing', () => {
  // for each fixture beat id: one [data-caption="<id>"] containing exactly one <h2> with the headline and a <p> with the line,
  // and one <svg class="story-art" data-art="<id>" aria-hidden="true"> per beat
});
test('overlay labels come from content and are hidden from assistive tech', () => {
  // [data-overlay="team"] is aria-hidden="true", holds 6 [data-overlay-item] with the six roles and app icons; the "Ergon" tag
  // [data-overlay="tickets"] holds Agent, Senior agent, Person; [data-overlay="worth"] holds "$100 / mo" and "+ more work"
  // [data-overlay="shape"] holds the three labels
});
test('the water canvas is decorative and never blocks a vertical swipe', () => {
  // canvas[data-water][aria-hidden="true"] inside [data-story-stage]
  // story.css: the canvas rule has touch-action: pan-y
  // story.js: every addEventListener for pointer/touch/deviceorientation passes { passive: true }
});
test('the runway only exists for a scripted page that allows motion', () => {
  // in story.css, every rule that sets `height:` with svh on .story, or position: sticky on .story-stage, sits inside
  // @media (prefers-reduced-motion: no-preference) and its selector starts with .js:not(.reveal-failsafe) and contains .story:not(.story--static)
  // the runway height is calc(100svh * 8)   (1 stage + RUNWAY_SCREENS 7)
});
test('the headline flips over the water, with a plain fallback', () => {
  // story.css contains mix-blend-mode: difference on .story-caption inside the runway block, and an @supports not (mix-blend-mode: difference) fallback
});
test('the masthead renders the nav from content and the burger', () => {
  // <header class="masthead" data-masthead> with wordmark, nav aria-label="Primary" links in content.nav order, action link to content.navAction.href, burger aria-controls="menu-sheet"
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `node --test tests/home-story.test.js`
Expected: FAIL because `templates.story` cannot be imported.

- [ ] **Step 3: Implement `masthead.py`.** Move `masthead()` out of `hero.py` unchanged, apart from dropping `data-rise data-delay="0"`. Then move the masthead rules from `hero.css` (lines 4–30) into `masthead.css`, and make the masthead `position: fixed; inset: 0 0 auto; z-index: 30` with a solid `--background`.
  - Inside the runway media block, add `.js:not(.reveal-failsafe) [data-masthead] { opacity: 0; }`.
  - Keep the `:hover` `--accent-ink` rules.
  - Adjust `menu.js`'s comment, but not its behaviour.

- [ ] **Step 4: Implement `story.py` `render(content)`.**
  - The outer element is `<section class="story" data-story id="home" aria-labelledby="story-name">` holding `<div class="story-stage" data-story-stage>`.
  - Inside the stage:
    - `canvas[data-water]`;
    - `div.story-name[data-story-name]`, containing `h1#story-name` built with `reveal(name, "word", stagger=110, delay=120, config="REVEAL", mode="once", words=nameWords)`, then `p.story-title` with `data-fade data-delay="420"`;
    - `p.story-cue[data-story-cue][aria-hidden]` with `data-fade data-delay="700"`;
    - a `div.story-captions` with one `div.story-caption[data-caption=id]` (`h2` + `p`) per beat;
    - one `div.story-overlay[data-overlay=id][aria-hidden="true"]` per beat that has labels.
  - Overlay items carry `data-overlay-item data-index="i"`.
  - Team items each hold the role and that index's app icons (cycle `[['mail','calendar'],['sheet','phone','mail'],['chat','calendar']]`, the same order as `shapes.js`), plus one `span.story-tag` for "Ergon".
  - The tickets overlay holds the three ladder labels and an `ICONS["screen"]`.
  - **Static art.** After the stage, one `svg.story-art[data-art=id]` per beat, 600×300 `viewBox`, `aria-hidden`:
    - hero: a pool with a wavy top;
    - shape: three small silhouettes side by side;
    - team: a source dot and six channels to six dots;
    - tickets: three rising gates;
    - worth: columns over a price mark.
  - The static art uses `fill: var(--raw-color-ink-900)` and a `stroke: var(--raw-color-cyan-400)` rim, set in CSS.

- [ ] **Step 5: Implement `story.css`.**
  - **Default (static) flow:** the story is padded and on `--background`. The name block is centred. Each caption is a normal block with its `.story-art` below it. The canvas is `display: none` and overlays are `display: none`.
  - **Runway block:**
    ```css
    @media (prefers-reduced-motion: no-preference) {
      .js:not(.reveal-failsafe) .story:not(.story--static) { height: calc(100svh * 8); padding: 0; }
      .js:not(.reveal-failsafe) .story:not(.story--static) .story-stage { position: sticky; top: 0; height: 100svh; overflow: hidden; }
      .js:not(.reveal-failsafe) .story:not(.story--static) .story-canvas { display: block; position: absolute; inset: 0; width: 100%; height: 100%; touch-action: pan-y; }
      .js:not(.reveal-failsafe) .story:not(.story--static) .story-caption { position: absolute; left: var(--gutter); top: calc(var(--masthead-h) + 2rem); max-width: min(34rem, 46vw); opacity: 0; color: #fff; mix-blend-mode: difference; }
      .js:not(.reveal-failsafe) .story:not(.story--static) .story-overlay { display: block; position: absolute; inset: 0; opacity: 0; pointer-events: none; }
      .js:not(.reveal-failsafe) .story:not(.story--static) .story-art { display: none; }
    }
    ```
    - On phones (`max-width: 639px`), the caption spans the full width at the top.
    - `@supports not (mix-blend-mode: difference)` sets the caption colour to `var(--foreground)`.
  - **Type:** the hero headline uses `var(--font-display)` at `clamp(2.4rem, 5.2vw, 5.5rem)`, and the other headlines at about 70% of that. Lines use `var(--type-body)` and the muted colour.
  - **Overlay items** are absolutely positioned with `transform: translate(-50%, -50%)`, as small Space Grotesk labels, with app icons in 1.75rem rounded tiles with a 1px `--raw-color-cyan-400` border on `--background`.

- [ ] **Step 6: Run the tests to verify they pass**

Run: `node --test tests/home-story.test.js`
Expected: PASS (7 tests).

- [ ] **Step 7: Commit**

```bash
git add scripts/home/templates/story.py scripts/home/templates/masthead.py scripts/home/markup.py site/css/story.css site/css/masthead.css site/js/masthead/menu.js tests/home-story.test.js
git commit -m "feat(story): story and masthead markup, static fallbacks and runway CSS"
```

---

### Task 4: The official résumé half

**Files:**
- Create: `scripts/home/templates/resume_half.py`, `site/css/resume-half.css`
- Test: `tests/home-resume-half.test.js`

**Interfaces:**
- Consumes: `resume/resume-content.json` (`full_name`, `headline`, `location`, `work_preference`, `experience`, `additional_experience`, `projects[]` with `slug`, `name`, `stack`, `bullets`, `links`, `education`, `skills`); `content["resumeHalf"]` (below); `content["meta"]` (the PDFs and `siteUrl`).
- Produces: `resume_half.render(content, resume) -> str`, a `<div class="resume-half" id="resume">` holding `section#experience`, `section#work` and `section#education`, each with exactly one `h2`.

```json
"resumeHalf": {
  "kicker": "Résumé",
  "experience": "Experience", "projects": "Projects", "education": "Education and skills",
  "skills": "Skills", "caseStudy": "Case study",
  "workEthic": { "title": "Work ethic", "line": "Real jobs, real hours. Where I learned how teams actually work." },
  "status": { "ergon": "Windows pilot · live checks pending" },
  "lab": { "label": "See the lab", "sub": "10 recorded demos", "href": "lab/" },
  "downloads": [ { "label": "Résumé PDF", "href": "Cayleb-James-polished-resume.pdf" },
                 { "label": "One-page PDF", "href": "Cayleb-James-polished-one-page.pdf" } ]
}
```

- [ ] **Step 1: Write the failing tests** in `tests/home-resume-half.test.js` (render through `python3 -c`, as in Task 3):

```js
test('the résumé half reads like the résumé: name, title, place, both PDFs', () => {
  // contains resume.full_name, "Forward Thinking Engineer · Connecticut, USA · Remote-only", href="<pdf>" download for both PDFs
});
test('experience lists the main role, then the other jobs as work ethic', () => {
  // resume.experience.title with "&" escaped and its dates
  // an <h3> "Work ethic" and its line, followed by each additional_experience organization (split on " — ") and dates
});
test('projects come in résumé order with Ergon first, each linking its case study', () => {
  // the first <article class="resume-project"> is Ergon and carries "Windows pilot · live checks pending"
  // every project links projects/<page>.html where page = slug, except suite → industry-ai-suite; every such file exists
  // GitHub repo links from resume links are kept; links starting with meta.siteUrl are made relative
  // href="lab/" with "See the lab"
});
test('education and skills, and never certifications', () => {
  // resume.education.school and coursework; every skills row label and value
  // no /certif/i anywhere in the rendered half, even with a fixture resume.certifications [{name:"X"}] (Cayleb: certificates prove nothing)
});
test('three sections, one h2 each, ids for deep links', () => {
  // ids experience, work, education; each <section> has exactly one <h2>; no <h1>; no <img>
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `node --test tests/home-resume-half.test.js`
Expected: FAIL because `templates.resume_half` cannot be imported.

- [ ] **Step 3: Implement `resume_half.py`.**
  - Map case-study pages with `CASE_PAGES = {"suite": "projects/industry-ai-suite.html"}`, defaulting to `projects/{slug}.html`.
  - Escape everything with `text` and `attr`.
  - The head is `p.resume-half-kicker`, `p.resume-half-name`, `p.resume-half-meta` and `ul.resume-half-downloads`.
  - Experience is `article.resume-entry` (h3, `p.resume-dates`, p), then `div.resume-ethic` with `h3` = `resumeHalf.workEthic.title`, `p` = its line, and `ul.resume-jobs` (li > `span.resume-org` + `span.resume-dates`).
  - Each project is `article.resume-project` (the first also gets `resume-project--lead`): h3 name, `p.resume-stack`, an optional `p.resume-status` from `resumeHalf.status[slug]`, `ul` bullets, and `p.resume-links`.
  - Education and skills: `div.resume-edu`, then `dl.resume-skills`. Certifications are never rendered.

- [ ] **Step 4: Implement `resume-half.css`.**
  - A white sheet on `--background`, max-width 72rem, with gutters as in `site/css/resume.css`.
  - `h2` in `var(--font-display)` uppercase. A 1px ink rule above each section; the first rule is the waterline the story drains into.
  - The Ergon lead project gets a 2px `--raw-color-cyan-400` left border.
  - Accent link hover uses `--accent-ink`.
  - On desktop, projects form a two-column grid with the lead spanning both. On phones there is one column.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `node --test tests/home-resume-half.test.js`
Expected: PASS (5 tests).

- [ ] **Step 6: Commit**

```bash
git add scripts/home/templates/resume_half.py site/css/resume-half.css tests/home-resume-half.test.js
git commit -m "feat(resume-half): official résumé section from resume-content.json, Ergon first"
```

---

### Task 5: Contact without the figure, and the faceless guide

**Files:**
- Modify: `scripts/home/templates/contact.py`, `site/css/contact.css`, `scripts/home/templates/guide.py`, `site/js/guide/guide.js`, `site/js/guide/queue.js`, `site/css/guide.css`
- Test: `tests/home-contact.test.js`, `tests/home-guide.test.js`, `tests/home-polish.test.js` (the guide droplet test only)

**Interfaces:**
- Consumes: `heading()` from `markup.py` (Task 3).
- Produces:
  - `contact.render(content)` without a figure or contours;
  - the guide markup with `svg.guide-bead` (no `[data-guide-eyes]`);
  - `guide.js` exports `APPEAR_AFTER` removed, `pastStory(scrollY, resumeTop, viewport) -> boolean`, and `FOOT_LIFT`;
  - `SECTIONS = ['experience', 'work', 'education', 'contact']`.

- [ ] **Step 1: Update the tests first.**
  - **`home-contact.test.js`:** delete "the figure is labelled as an illustration", "the figure rides back into place…" and "the hollow button keeps a dark ground…". Add:
    ```js
    test('the footer has no picture and no backdrop canvas', () => {
      // the contact section has no <img, no data-figure-layer, no data-contours
    });
    test('the copyright is the content line, without an illustration credit', () => {
      // content.contact.copyright === '© 2026 Cayleb Alvarez-James.' and it is not /Illustrations/
    });
    ```
    `home-contact` imports `contact.js`'s `FIGURE_WINDOW`; remove that import.
  - **`home-guide.test.js`:**
    - delete "the eyes glance toward a point…";
    - add `pastStory` tests: `pastStory(0, 6000, 800) === false`, `pastStory(5600, 6000, 800) === true` (60% of the viewport reaches the résumé), and `pastStory(5400, 6000, 800) === false`;
    - assert `index.html` has `class="guide-bead"` and no `data-guide-eyes`;
    - leave "every guide line belongs to a section on the page" alone: Task 6 moves the line keys and the sections together.
  - In `content.json`, change only `contact.copyright` to "© 2026 Cayleb Alvarez-James." Task 6 removes `contact.figure`.
  - **`home-polish.test.js`:** replace "the guide droplet matches…" with "the guide bead is ink with a cyan rim and no face". `guide.css` should have `.guide-bead-body` filling `var(--raw-color-ink-900)` and `.guide-bead-rim` stroking `var(--raw-color-cyan-400)`, and `guide.py` should not match `/eyes|glint/`.

- [ ] **Step 2: Run them to verify they fail**

Run: `node --test tests/home-guide.test.js tests/home-contact.test.js tests/home-polish.test.js`
Expected: FAIL because `pastStory` is not exported, the eyes are still present, and the copyright mismatches.

- [ ] **Step 3: Implement the guide.**
  - **`guide.py`:** `BEAD_SVG` is the same teardrop path, with two paths (`guide-bead-body`, `guide-bead-rim`) and a short highlight stroke `guide-bead-shine`. It has no `defs` and no eyes.
  - **`guide.js`:**
    - remove the `droplet-shape.js` import, the `eyes`, `blinkAt`, `nextBlink` and `pointer` code, and the gaze block;
    - make `lines` keyed by `SECTIONS` plus greeting;
    - `onScroll` uses `pastStory(scrollY, resumeTop, innerHeight)`, with `resumeTop = document.getElementById('resume')?.offsetTop ?? Infinity`, recomputed on resize;
    - update the header comment.
  - **`queue.js`:** remove `gaze`.
  - **`guide.css`:** the `.guide-bead-*` rules.

- [ ] **Step 4: Implement contact.**
  - **`contact.py`:** remove `contact-figure-group` and the contours canvas (keep `div.contact-panel` as a plain dark panel), drop `FIGURE_SIZE`, and import `heading` from `markup`.
  - **`contact.css`:** delete the `.contact-figure*` rules.

- [ ] **Step 5: Rebuild with the current pipeline and run the whole suite**

Run: `python3 scripts/build-home.py && node --test tests/*.test.js`
Expected: PASS. `build-home.py` still renders the old blocks, but contact and guide are the new ones.

- [ ] **Step 6: Commit**

```bash
git add scripts/home/templates/contact.py site/css/contact.css scripts/home/templates/guide.py site/js/guide site/css/guide.css site/content.json index.html tests/home-guide.test.js tests/home-contact.test.js tests/home-polish.test.js
git commit -m "feat: faceless guide bead; contact footer without the figure"
```

---

### Task 6: Switch the homepage over (content, build, shell, boot) and retire the old blocks

**Files:**
- Modify: `site/content.json`, `site/content-limits.json`, `scripts/build-home.py`, `scripts/home/templates/shell.py`, `site/js/main.js`; regenerate `index.html`, `resume.html`, `projects/*.html`, `lab/index.html`, `404.html`, `sitemap.xml`
- Delete:
  - JS: `site/js/hero/`, `site/js/approach/`, `site/js/experience/`, `site/js/projects/`, `site/js/contact/`, `site/js/engine/stack.js`, `site/js/engine/dissolve.js`, `site/js/engine/contours.js`;
  - templates: `scripts/home/templates/{hero,approach,experience,projects,value}.py`;
  - CSS: `site/css/{hero,approach,experience,projects,value}.css`;
  - tests: `tests/home-hero.test.js`, `tests/home-hero-math.test.js`, `tests/home-approach.test.js`, `tests/home-experience.test.js`, `tests/home-projects.test.js`, `tests/home-canvas.test.js`, `tests/home-value.test.js`.
- Test:
  - create `tests/home-worth.test.js`;
  - rewrite parts of `tests/home-structure.test.js`, `home-content.test.js`, `home-few-words.test.js`, `home-shell.test.js`, `home-polish.test.js`, `home-engine.test.js` and `site-meta.test.js` (all but the share card, which is Task 7);
  - leave `recruiter-*.test.js`, `candidate-resume.test.js` and `subpages.test.js` unchanged, because they must pass as they are.

**Interfaces:**
- Consumes: every template from Tasks 3–5, and `mount` from `story.js`.
- Produces: the shipped homepage. `build-home.py` reads `resume/resume-content.json` and passes it to `resume_half.render`.

- [ ] **Step 1: Rewrite the tests.**
  - **`home-structure`:**
    - one h1 in the `data-story` section with the sr-only name;
    - top-level `<section>`s: `story#home`, `#experience`, `#work`, `#education` and `#contact`, where every section except the story has exactly one h2 (count h2s per section, splitting by `<section`, with no nesting);
    - ids `home`, `resume`, `experience`, `work`, `education`, `contact` exist and are unique;
    - keep "project-page anchors resolve", "résumés, repositories and primary nav", "visible text has no racing…", "build is reproducible" and "served code carries no names…";
    - add "no `<img>` on the homepage".
  - **`home-content`:**
    - in "numbers trace to the résumé", also allow `100` from `content.story.beats` worth (`/\$100/`), with a comment: "Cayleb's stated per-person monthly price, 2026-10-15";
    - remove "computed stats match", "employers match" and "generated imagery…";
    - "name renders as three words" now uses `content.story.intro.nameWords`;
    - "content lengths stay inside their frames" drops the hero and experience hard-codes;
    - "banned claims stay out" keeps the regex and the EvoHedge/Maki check against `resume.projects`, and drops the `content.projects` lines.
  - **`home-few-words`:**
    - `meta.description` ≤ 16 words;
    - hero headline ≤ 10;
    - hero line ≤ 22;
    - every other beat headline ≤ 6 and line ≤ 16;
    - every role, label and ladder entry ≤ 2 words;
    - the guide rules stay with the new line keys;
    - the jargon test stays as it is.
  - **`home-worth.test.js`** (new):
    - the hours, pay and people regex from the old `home-value` test, applied to `JSON.stringify(content.story) + JSON.stringify(content.guide) + content.meta.description`;
    - the worth beat headline matches `/\$100 a person a month/`;
    - the tickets ladder deep-equals `['Agent', 'Senior agent', 'Person']`;
    - no `Haiku|Sonnet|Opus` anywhere in `content.json`.
  - **`home-shell`:** the `allowed` list drops `\.stack-shade` and `\.asset-banner\[hidden\]`. There are no new exceptions: every story hiding rule starts with `.js:not(.reveal-failsafe)`.
  - **`home-guide`:** "every guide line belongs to a section on the page" now expects the keys `['experience', 'work', 'education', 'contact']`, each an id on `index.html`.
  - **`home-polish`:**
    - keep the three contrast tests, but the accent-ink test now checks `masthead.css` (`.masthead-action:hover` → `--accent-ink`) and `resume-half.css` (`a:hover` → `--accent-ink`);
    - delete every hero, approach, projects-figure, plate and stack test;
    - keep the landscape-phone guide test.
  - **`home-engine`:** delete the `recede` test and the `stack.js` import. Leave the `CONFIGS.VEIL` pin, because the config still exists in `spring.js`.
  - **`site-meta`:** "the headline title…" now checks `content.story.intro.title === TITLE` instead of `hero.meta`.

- [ ] **Step 2: Run the suite to verify the new expectations fail**

Run: `node --test tests/*.test.js`
Expected: FAIL in `home-structure`, `home-content`, `home-few-words`, `home-worth` and `site-meta`, because the content and `index.html` are still old.

- [ ] **Step 3: Update `content.json`.**
  - Remove `hero`, `approach`, `experience`, `projects`, `value` and `loading`.
  - Add `story` (Task 3) and `resumeHalf` (Task 4).
  - Set `meta.description` to "Cayleb Alvarez-James, Forward Thinking Engineer. Learns how you work, builds AI into it."
  - Set `nav` to `[Experience #experience, Projects #work, Lab lab/, Contact #contact]`.
  - Set `contact.copyright` to "© 2026 Cayleb Alvarez-James." and remove `contact.figure`.
  - Set `guide.lines` to:
    - `experience`: "Real jobs first. He knows how crews actually work."
    - `work`: "His own builds. Ergon puts an assistant on every desk."
    - `education`: "School, skills and the PDFs, all in one place."
    - `contact`: "Want AI built around how your team works? Say hi."
  - Rewrite the "What does Cayleb do?" answer: "He learns how your people actually work, then builds AI and automation around the apps they already use. It saves time, raises quality, and he teaches the team to run it."
  - Add a question "What's Ergon?" with the answer: "A personal assistant for every employee, built around their apps. Tickets get fixed by an agent right on the computer; hard ones go up to a person. Windows pilot, live checks pending."
  - Remove guide questions that reference removed sections.

- [ ] **Step 4: Update `content-limits.json`.** Keep:
  - `nav[].label`: 12
  - `contact.cta.label`: 16
  - `guide.greeting`: 80
  - `guide.lines.experience`, `.work`, `.education`, `.contact`: 90
  - `guide.questions[].q`: 40
  - `guide.questions[].a`: 280

  Add:
  - `story.beats[].headline`: 48
  - `story.beats[].line`: 150
  - `story.beats[].roles[]`: 10
  - `story.beats[].labels[]`: 12
  - `story.beats[].ladder[]`: 12
  - `story.intro.cue`: 10
  - `resumeHalf.kicker`: 12
  - `resumeHalf.workEthic.title`: 16
  - `resumeHalf.workEthic.line`: 80

- [ ] **Step 5: Wire the build.**
  - **`build-home.py`:**
    - import `contact, guide, masthead, resume, resume_half, shell, story`;
    - drop `CENTRE_COPY_MAX`, `STAT_LABELS_MAX` and their checks;
    - make `blocks` `{masthead, story, resume_half, contact, guide}`.
  - **`shell.py`:**
    - `STYLES = ("tokens", "base", "masthead", "story", "resume-half", "contact", "guide")`;
    - drop `PLATE_CLIP` and the defs SVG;
    - the skip link becomes `href="#resume"` "Skip to résumé";
    - the body is `{masthead}<main>{story}{resume_half}</main><footer class="site-footer">{contact}</footer>{guide}`;
    - remove `.stack` and `stack_layer`, and the asset banner;
    - keep the import map and `HEAD_SCRIPT` unchanged.
  - **`main.js`:**
    - import `mount as mountStory` from `./story/story.js` and `mountMenu` from `./masthead/menu.js`;
    - `MOUNTS = [['[data-story]', mountStory], ['[data-guide]', mountGuide]]`;
    - remove `initStack`, `mountDissolve` and `mountContours`.
  - **`base.css`:** remove the stack, seam, contours and asset-banner rules. `reveal.js` stays as it is: its `[data-hero]` skip matches nothing now, so the story's name reveals play through the normal section scope.
  - **`masthead.css`:** define `:root { --masthead-h: 4rem; --gutter: clamp(1rem, 4vw, 3rem); }` if they are not already tokens. `story.css` uses both.

- [ ] **Step 6: Delete the retired files** listed above (`git rm`).

- [ ] **Step 7: Rebuild and run everything**

Run:
```bash
python3 scripts/build-home.py && python3 scripts/build-subpages.py && node --test tests/*.test.js
```
Expected: `Built index.html and resume.html from site/content.json`, the subpages build, and all node tests pass except site-meta's share-card alt checks (Task 7). `grep -c "<img" index.html` prints `0`.

- [ ] **Step 8: Commit**

```bash
git add -A site scripts tests index.html resume.html projects lab 404.html sitemap.xml
git commit -m "feat: homepage becomes the water story and the official résumé; retire the character-led blocks"
```

---

### Task 7: The share card without the character

**Files:**
- Modify: `scripts/home/make_share_card.py`, `assets/og/card.png`, `site/content.json` (`meta.shareAlt`); regenerate `index.html` and the subpages
- Test: `tests/site-meta.test.js`

**Interfaces:**
- Consumes: the fonts `assets/fonts/oswald-latin-700-normal.woff2` and `space-grotesk-latin-500-normal.woff2` (the script already loads these with `ImageFont.truetype`).
- Produces: `assets/og/card.png`, 1200×630 and under 400KB. `meta.shareAlt` is "Share card: Cayleb Alvarez-James, Forward Thinking Engineer, above a line of ink water."

- [ ] **Step 1: Update the tests.** In `site-meta.test.js`, both `/^Illustration:/` assertions (the content check and the per-page `og:image:alt`) become `/^Share card:/`. Add an assertion that `make_share_card.py` does not match `/person-|alpha|droplet/`.

- [ ] **Step 2: Run them to verify they fail**

Run: `node --test tests/site-meta.test.js`
Expected: FAIL on `^Share card:`.

- [ ] **Step 3: Rewrite `make_share_card.py`.** Keep the `NAME`, `TITLE` (`"Forward Thinking Engineer"`), `URL`, `INK`, `MUTED` constants and the text layout.
  - Remove `numpy` use if it is unused, along with every person-map or droplet read.
  - Draw ice `#f7fafb`, then an ink `#0e0f14` water polygon whose top edge is `y = 470 + 14·sin(x/95) + 6·sin(x/37)`, with a 3px `#02d2e3` polyline along that edge.
  - Put the headline "Show me how you work. I'll find where AI fits." in Space Grotesk 500 at 34px, under the title row.
  - Put the URL in `#f7fafb` on the water.
  - Save with `optimize=True`.

- [ ] **Step 4: Regenerate and rebuild**

Run:
```bash
python3 scripts/home/make_share_card.py && python3 scripts/build-home.py && python3 scripts/build-subpages.py && node --test tests/*.test.js
```
Expected: all node tests pass.

- [ ] **Step 5: Look at the card.** Read `assets/og/card.png` as an image. Check that the name, the title and the headline are legible, and that the water edge has its cyan rim.

- [ ] **Step 6: Commit**

```bash
git add scripts/home/make_share_card.py assets/og/card.png site/content.json index.html resume.html projects lab 404.html tests/site-meta.test.js
git commit -m "feat: share card drawn from type and water, no character"
```

---

### Task 8: Remove the image pipeline and refresh the docs

**Files:**
- Delete:
  - `assets/home/` (all of it);
  - `scripts/home/{derive_scenes,derive_character,person_maps,import_images,make_plates,make_plate_sizes,make_noise,make_loop,make_placeholders,targets,check_assets}.py`;
  - `tests/py/{test_person_maps,test_derive_character,test_derive_scenes,test_import_images,test_make_plates}.py`.
- Modify: `scripts/check-release.py` (drop the `check_assets` import and assertion), `README.md`, `DESIGN.md` (new top "current" section), `PRODUCT.md` (the "Current canonical" block)

**Interfaces:** none new.

- [ ] **Step 1: Find any remaining users of the files being deleted.**
  Run: `git grep -n -E "assets/home|check_assets|person_maps|derive_|make_plate|import_images|targets\.py|PLACEHOLDERS" -- ':!docs' ':!brag-output-*'`
  Expected: hits only in the files being deleted, in `check-release.py`, and in README/DESIGN/PRODUCT. Fix any other hit.

- [ ] **Step 2: Delete the files** and edit `check-release.py`. The page loop already asserts that every local `href` and `src` resolves, which replaces the asset check.

- [ ] **Step 3: Update the docs.** Use the same short, plain voice as the existing docs:
  - **README:** "What's here" describes the two halves, and the imagery paragraph goes. History notes "The illustrated, character-led homepage is recoverable at commit `cbdd73c`".
  - **DESIGN.md:** a new top section, "Water story homepage (2026-10-15)", covering:
    - motion: one ticker, one shader, the scroll-scrubbed beats, the static fallback;
    - colour: ink water, cyan rim, ice ground;
    - type: Oswald headlines, Space Grotesk lines;
    - claims: the story is the offer, the résumé half is the record.
    Mark the previous section superseded.
  - **PRODUCT.md:** its current block lists the new blocks (story, résumé half, contact) and the positioning line "learns how a role really works, then finds where AI fits — saves time, raises quality, in any field".

- [ ] **Step 4: Run every check**

Run:
```bash
python3 scripts/build-home.py && python3 scripts/build-subpages.py && node --test tests/*.test.js && python3 -m unittest discover -s tests/py && python3 scripts/check-release.py
```
Expected:
- all node tests pass;
- the Python unittest run is OK;
- `check-release.py` prints `{"passed": true, …}`.

If `check-release.py` fails only because `pdfinfo` or ReportLab are missing in the container, record that as an environment limit in the PR rather than editing the check.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove the character image pipeline; docs describe the water story"
```

---

### Task 9: Visual QA in a real browser

**Files:**
- Create (scratchpad only, not committed): `$SCRATCH/qa.mjs`, `$SCRATCH/shots/*.png`

**Interfaces:** consumes the built site.

- [ ] **Step 1: Serve and drive.**
  - Start the site with `python3 -m http.server 8123` from the repo root (in the background).
  - In `qa.mjs`, use Playwright's `chromium.launch({ executablePath: '/opt/pw-browsers/chromium…' })`. Resolve the path with `ls /opt/pw-browsers`; if the bundled resolution works, use it.
  - At each viewport (390×844, 844×390, 768×1024, 1280×800, 1440×900, 2560×1440):
    - load `index.html`;
    - for each beat, scroll to its midpoint through `window.scrollTo(0, top + (start + 0.7·len)·innerHeight)`, wait 600ms, and screenshot `shots/<w>x<h>-<beat>.png`;
    - then scroll back to the top and screenshot again, which should match the intro.

- [ ] **Step 2: Check the fallbacks.** Take screenshots of:
  - `reducedMotion: 'reduce'`, with a full-page shot: the static story, then the résumé;
  - `javaScriptEnabled: false`, full page: the same, with the masthead visible;
  - `index.html#experience`: the masthead visible and the experience heading at the top;
  - a forced WebGL failure, with `addInitScript(() => { HTMLCanvasElement.prototype.getContext = () => null; })`: the static story and masthead, no blank runway.

- [ ] **Step 3: Measure.**
  - **Frame rate:** at 1440×900 and 390×844 (with CPDP `Emulation.setCPUThrottlingRate {rate: 4}`), scroll the team beat while sampling `requestAnimationFrame` deltas for 3s. Report the median fps. The targets are ≥ 55 on desktop and ≥ 50 on the throttled phone.
  - **Errors and network:** record `page.on('console')` errors and `page.on('request')` URLs. Expect zero console errors and zero requests that don't start with `http://localhost:8123/`.
  - **Keyboard:** press Tab 12 times from the top and list the focused elements. Expect skip link → wordmark → nav links → Résumé → burger (or nav), with focus visible.

- [ ] **Step 4: Review the screenshots** by reading them as images.
  - Captions never collide with the water or the overlays.
  - The headline flips cleanly over the water.
  - The overlays sit on their nodes.
  - The phone layouts fit.

  Fix any defect in the owning file, rerun Task 8 Step 4, and commit with message `fix(story): <what>`.

- [ ] **Step 5: Send Cayleb the shots** for 1440×900 and 390×844 (each beat), plus the reduced-motion page, with `SendUserFile`. Report the fps numbers and anything left open.

---

## Execution notes

- Tasks 1–5 add new files beside the old ones, so the existing suite stays green until Task 6 switches over.
- Task 6 is the one large, coupled change. Its reviewer should rebuild locally and diff `index.html` structure against the spec's page outline.
- Push only after Task 9: `git push -u origin ccr-d07f46e5-5gyzor`, then open a draft PR. Never merge to `main` without Cayleb's "merge it".
