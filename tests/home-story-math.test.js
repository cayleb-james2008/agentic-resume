import test from 'node:test';
import assert from 'node:assert/strict';
import { getStoryTier, CAP_60 } from '../site/js/story/tier.js';
import { createRipple, rippleSize } from '../site/js/story/ripple.js';
import { CAPTION_BOX, DROP_R, GATE_R, MAX_SLOTS, NODE_R, SOURCE_R, TICKETS, layoutFor, slotsFor, overlaysFor, ticketTrip } from '../site/js/story/shapes.js';
import { BEATS, RUNWAY_SCREENS, beatAt, storyState } from '../site/js/story/timeline.js';
import { RIPPLE_STEP_MS, RIPPLE_START_OWED, WATER_DEADLINE_MS, deadline, nudgeInside, shouldRetune, renderSize, stepsFor, toPercent } from '../site/js/story/view.js';

/** A stand-in for window: width, pointer class, reduced motion, save-data, memory. */
const env = ({ width, coarse = false, reduced = false, saveData = false, memory = 8 }) => ({
  innerWidth: width,
  navigator: { connection: { saveData }, deviceMemory: memory },
  matchMedia: (q) => ({ matches: q.includes('coarse') ? coarse : q.includes('reduced-motion') ? reduced : false }),
});

/** A slot is drawn only when it has size and some fill. */
const active = (s) => s.r + s.th > 0 && s.fill > 0;

/**
 * The tight axis-aligned bounds of one slot: the oriented box from a to b
 * (half-thickness th/2 either side of the axis), grown by the rounding r. A
 * circle (a = b) is th/2 + r in every direction.
 */
const bounds = (s) => {
  const [ax, ay] = s.a, [bx, by] = s.b;
  const len = Math.hypot(bx - ax, by - ay), half = s.th / 2;
  const [gx, gy] = len > 1e-9 ? [(Math.abs(by - ay) / len) * half, (Math.abs(bx - ax) / len) * half] : [half, half];
  return {
    x0: Math.min(ax, bx) - gx - s.r, x1: Math.max(ax, bx) + gx + s.r,
    y0: Math.min(ay, by) - gy - s.r, y1: Math.max(ay, by) + gy + s.r,
  };
};
const overlaps = (p, q) => p.x0 < q.x1 && p.x1 > q.x0 && p.y0 < q.y1 && p.y1 > q.y0;
const union = (list) => ({
  x0: Math.min(...list.map((b) => b.x0)), x1: Math.max(...list.map((b) => b.x1)),
  y0: Math.min(...list.map((b) => b.y0)), y1: Math.max(...list.map((b) => b.y1)),
});

test('story tier matrix', () => {
  const desktop = getStoryTier(env({ width: 1440 }));
  assert.equal(desktop.name, 'desktop');
  assert.equal(desktop.mobile, false);
  assert.equal(desktop.maxDpr, 1.5);
  assert.equal(desktop.frameInterval, 0);
  assert.equal(desktop.pointerEnabled, true);
  assert.equal(desktop.rippleLong, 128);
  assert.equal(desktop.teamSize, 6);
  assert.equal(desktop.freeze, false);

  const tablet = getStoryTier(env({ width: 1024, coarse: true }));
  assert.equal(tablet.name, 'tablet');
  assert.equal(tablet.coarsePointer, true);
  assert.equal(tablet.maxDpr, 1.25);
  assert.equal(tablet.frameInterval, CAP_60);
  assert.equal(tablet.pointerEnabled, false);
  assert.equal(tablet.rippleLong, 128);
  assert.equal(tablet.teamSize, 6);

  const phone = getStoryTier(env({ width: 390, coarse: true }));
  assert.equal(phone.name, 'mobile');
  assert.equal(phone.mobile, true);
  assert.equal(phone.maxDpr, 1);
  assert.equal(phone.frameInterval, CAP_60);
  assert.equal(phone.rippleLong, 72);
  assert.equal(phone.teamSize, 4);
  assert.equal(phone.freeze, false);

  // Save-Data on a phone, and reduced motion anywhere, freeze the scene.
  assert.equal(getStoryTier(env({ width: 390, coarse: true, saveData: true })).freeze, true);
  const reduced = getStoryTier(env({ width: 1440, reduced: true }));
  assert.equal(reduced.reducedMotion, true);
  assert.equal(reduced.freeze, true);
  assert.equal(reduced.pointerEnabled, false);

  // What the hero tier baked into its shader and mask is gone.
  for (const dropped of ['trailSamples', 'outline', 'reveal', 'antialias']) {
    assert.equal(desktop[dropped], undefined, dropped);
    assert.equal(phone[dropped], undefined, dropped);
  }
});

test('ripple: a poke is local, energy decays, heights stay bounded', () => {
  const r = createRipple(64, 36);
  assert.equal(r.cols, 64);
  assert.equal(r.rows, 36);
  assert.equal(r.energy(), 0);
  r.poke(0.5, 0.5, 1, 2);
  assert.ok(r.energy() > 0);
  // Cells further than 3 cells from (32, 18) are exactly 0 right after the poke.
  for (let y = 0; y < 36; y++) {
    for (let x = 0; x < 64; x++) {
      if (Math.hypot(x - 32, y - 18) > 3) assert.equal(r.height[y * 64 + x], 0, `(${x},${y})`);
    }
  }
  const e20 = (() => { for (let i = 0; i < 20; i++) r.step(); return r.energy(); })();
  for (let i = 0; i < 400; i++) r.step();
  assert.ok(r.energy() < e20 * 0.2);
  assert.ok(Math.max(...r.height.map(Math.abs)) <= 1);

  // 0 height → 128; a poke only moves the bytes near it; the buffer is reused.
  const flat = createRipple(64, 36);
  const out = new Uint8Array(64 * 36);
  assert.equal(flat.toBytes(out), out);
  assert.ok(out.every((b) => b === 128));
  flat.poke(0.5, 0.5, 1, 2);
  const bytes = flat.toBytes(out);
  assert.ok(bytes[18 * 64 + 32] > 128);
  assert.equal(bytes[0], 128);
  flat.poke(0.5, 0.5, -3, 2);   // an over-strong poke clamps at -1: byte 0
  assert.ok(Math.max(...flat.height.map(Math.abs)) <= 1);
  assert.equal(flat.toBytes(out)[18 * 64 + 32] < 128, true);

  // Edges are clamped, so a poke in a corner is safe and still local.
  const corner = createRipple(16, 9);
  corner.poke(0, 0, 1, 2);
  corner.poke(1, 1, 1, 2);
  for (let i = 0; i < 50; i++) corner.step();
  assert.ok(corner.height.every(Number.isFinite));
});

test('rippleSize keeps cells square-ish', () => {
  assert.deepEqual(rippleSize(16 / 9, 128), [128, 72]);
  assert.deepEqual(rippleSize(390 / 844, 72), [33, 72]);
  assert.deepEqual(rippleSize(1, 72), [72, 72]);
});

test('beats add up to the runway and the intro is 1.5 screens', () => {
  assert.equal(BEATS.reduce((s, b) => s + b.screens, 0), RUNWAY_SCREENS);
  assert.equal(RUNWAY_SCREENS, 7);
  assert.deepEqual(BEATS.map((b) => b.id), ['intro', 'hero', 'shape', 'team', 'tickets', 'worth', 'drain']);
  assert.equal(BEATS[0].screens, 1.5);
  assert.deepEqual(beatAt(0), { index: 0, id: 'intro', t: 0 });
  assert.equal(beatAt(1).id, 'drain'); assert.equal(beatAt(1).t, 1);
  // 0.5 of the runway is 3.5 screens: a fifth of the way into the 1.25-screen team beat.
  assert.deepEqual(beatAt(0.5), { index: 3, id: 'team', t: 0.2 });
  // Out-of-range progress clamps instead of running off the ends.
  assert.deepEqual(beatAt(-1), beatAt(0));
  assert.deepEqual(beatAt(2), beatAt(1));
  assert.deepEqual(beatAt(NaN), beatAt(0));
});

test('storyState is pure and reversible', () => {
  const L = layoutFor(16 / 9, 6);
  for (const p of [0, 0.13, 0.5, 0.77, 1]) assert.deepEqual(storyState(p, L), storyState(p, L));
  // Scrolling forward and back lands on the same frame.
  const there = storyState(0.62, L);
  storyState(0.9, L); storyState(0.2, L);
  assert.deepEqual(storyState(0.62, L), there);

  // It also never jumps: a fifth of a pixel of a 5,600px runway (seven 800px screens) moves each slot drawn on both sides a hair.
  // (A slot that fades in or out of use has no size to jump from, so it is skipped.)
  const STEPS = 28000;
  for (const [aspect, team] of [[16 / 9, 6], [390 / 844, 4], [844 / 390, 4]]) {
    const layout = layoutFor(aspect, team);
    let prev = storyState(0, layout);
    for (let i = 1; i <= STEPS; i++) {
      const cur = storyState(i / STEPS, layout);
      prev.slots.forEach((s, k) => {
        const c = cur.slots[k];
        if (!active(s) || !active(c)) return;
        for (const [name, d] of [['ax', s.a[0] - c.a[0]], ['ay', s.a[1] - c.a[1]], ['bx', s.b[0] - c.b[0]],
          ['by', s.b[1] - c.b[1]], ['th', s.th - c.th], ['r', s.r - c.r], ['fill', s.fill - c.fill]]) {
          assert.ok(Math.abs(d) < 0.02, `${name} of slot ${k} jumped ${d} at step ${i} (${cur.beat})`);
        }
      });
      assert.ok(Math.abs(cur.flow - prev.flow) < 0.02, `flow jumped at step ${i}`);
      prev = cur;
    }
    // Every beat hands over to the next with the same drawn shapes (the intro to the hero exactly).
    assert.deepEqual(slotsFor('intro', 1, layout), slotsFor('hero', 0, layout));
    const order = ['hero', 'shape', 'team', 'tickets', 'worth', 'drain'];
    order.slice(1).forEach((id, i) => {
      const was = slotsFor(order[i], 1, layout).filter(active);
      const now = slotsFor(id, 0, layout).filter(active);
      assert.equal(now.length, was.length, id);
    });
  }
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

    // The hero line rises out of the intro (from intro t 0.8) and is full by hero t 0.2.
    assert.equal(storyState(1.2 / 7, L).captions.hero, 0);
    assert.ok(storyState(1.5 / 7, L).captions.hero > 0);
    assert.equal(storyState(1.65 / 7, L).captions.hero, 1);
    // A caption fades in over the first 25% of its beat and out over the last 15%.
    const start = (id) => BEATS.slice(0, BEATS.findIndex((b) => b.id === id)).reduce((n, b) => n + b.screens, 0);
    const caption = (id, t) => storyState((start(id) + t * BEATS.find((b) => b.id === id).screens) / RUNWAY_SCREENS, L).captions[id];
    for (const id of ['hero', 'shape', 'team', 'tickets', 'worth']) {
      if (id !== 'hero') {
        assert.ok(caption(id, 0.05) > 0 && caption(id, 0.05) < 0.5, `${id} fades in`);
        assert.ok(caption(id, 0.2) > 0.5 && caption(id, 0.2) < 1, `${id} is nearly in`);
        assert.ok(caption(id, 0) < 1e-9, `${id} starts at 0`);
      }
      assert.equal(caption(id, 0.5), 1);
      assert.ok(caption(id, 0.9) > 0 && caption(id, 0.9) < 1, `${id} fades out`);
      assert.ok(caption(id, 0.999) < 0.01, `${id} is gone by its end`);
    }
    // A caption is 0 outside its own beat; an overlay waits for the morph to finish (t 0.4).
    assert.equal(storyState(2.5 / 7, L).captions.team, 0);
    assert.equal(storyState((3.25 + 0.3 * 1.25) / 7, L).overlays.team, 0);
    assert.equal(storyState((3.25 + 0.7 * 1.25) / 7, L).overlays.team, 1);
    assert.equal(storyState((3.25 + 0.7 * 1.25) / 7, L).captions.team, 1);
    for (let i = 0; i <= 1000; i++) {
      const s = storyState(i / 1000, L);
      for (const k of ['shape', 'team', 'tickets', 'worth']) assert.ok(s.overlays[k] <= s.captions[k] + 1e-12, `${k} p=${i / 1000}`);
    }
  }
});

test('the ends: name on screen at 0, drained and masthead shown at 1', () => {
  const L = layoutFor(16 / 9, 6);
  const s0 = storyState(0, L), s1 = storyState(1, L);
  assert.equal(s0.name.opacity, 1);
  assert.equal(s0.name.scale, 1);
  assert.equal(s0.cue, 1);
  assert.equal(s0.masthead, 0);
  assert.equal(s1.masthead, 1);
  assert.equal(s1.name.opacity, 0);
  assert.equal(s1.cue, 0);
  for (const [k, o] of Object.entries(s1.captions)) assert.equal(o, 0, k);
  for (const [k, o] of Object.entries(s1.overlays)) assert.equal(o, 0, k);
  // The only active slot at 1 is the waterline, whose top edge is at most y 0.03.
  const live = s1.slots.filter(active);
  assert.equal(live.length, 1);
  assert.ok(Math.max(live[0].a[1], live[0].b[1]) + live[0].th / 2 + live[0].r <= 0.03);
  assert.equal(s1.flow, 0);

  // Mid-intro: the name has risen (up is positive, in stage heights) and shrunk, then gone; the drop lands at splashAt.
  const intro = (t) => storyState((t * BEATS[0].screens) / RUNWAY_SCREENS, L);
  assert.equal(s0.name.y, 0);
  assert.equal(s0.name.spread, 0);
  const near = (x, y) => assert.ok(Math.abs(x - y) < 1e-9, `${x} is not ${y}`);
  near(intro(0.6).name.scale, 0.35);
  near(intro(0.6).name.y, 0.38);
  near(intro(0.5).name.spread, 0.3);
  near(intro(0.8).name.opacity, 0);
  near(intro(0.9).masthead, 1);
  assert.ok(intro(0.3).name.y > 0 && intro(0.3).name.y < intro(0.5).name.y);
  assert.equal(s0.splashAt, (0.6 * 1.5) / 7);
  assert.equal(s1.splashAt, s0.splashAt);
  // Before 0.35 there is no drop; it hangs at the stage centre, lands at poolTop * 0.1, then joins the pool.
  assert.equal(intro(0.3).slots.filter((s) => active(s) && s.th === 0).length, 0);
  const drop = (t) => intro(t).slots.find((s) => s.th === 0 && s.r > 0);
  assert.equal(drop(0.4).a[0], L.aspect / 2);
  assert.ok(drop(0.36).a[1] > 0.49 && drop(0.36).a[1] <= 0.5);
  assert.ok(Math.abs(drop(0.6).a[1] - L.poolTop * 0.1) < 1e-9);
  assert.equal(drop(0.9), undefined);
  // The pool's top edge reaches poolTop at the end of the intro (its body runs on below the stage).
  const pool = intro(1).slots[0];
  near(pool.a[1] + pool.th / 2, L.poolTop);

  // Flow swells while the water changes shape and is 0 when it is still: never in the intro or hero,
  // at its peak halfway through a morph, and three times in the shape beat (one per silhouette).
  const at = (screens) => storyState(screens / RUNWAY_SCREENS, L).flow;
  assert.equal(at(1), 0);
  assert.equal(at(1.9), 0);
  near(at(3.25 + 0.2 * 1.25), 1);          // team: t 0.2 is half of its 0.4 morph
  assert.equal(at(3.25 + 0.5 * 1.25), 0);
  for (const k of [0, 1, 2]) near(at(2.25 + (k + 0.2) / 3), 1);   // shape: half of each silhouette's morph (u 0.2 of its third)
  assert.equal(at(2.25 + 0.2), 0);         // ... and settled by u 0.4
});

test('slots stay in the stage and out of the caption box', () => {
  const ids = ['intro', 'hero', 'shape', 'team', 'tickets', 'worth', 'drain'];
  for (const [aspect, team] of [[16 / 9, 6], [4 / 3, 6], [844 / 390, 4], [390 / 844, 4], [768 / 1024, 6]]) {
    const L = layoutFor(aspect, team), box = CAPTION_BOX(aspect);
    const sweep = [0, 0.25, 0.5, 0.75, 1, ...Array.from({ length: 101 }, (_, i) => i / 100)];   // the brief's five, then every 1%
    for (const id of ids) for (const t of sweep) {
      const slots = slotsFor(id, t, L);
      assert.equal(slots.length, MAX_SLOTS);
      for (const s of slots) {
        for (const n of [...s.a, ...s.b, s.th, s.r, s.fill]) assert.ok(Number.isFinite(n), `${id} t=${t}`);
        if (!active(s)) continue;
        // Its bounds lie within x ∈ [-0.35, aspect+0.35], y ∈ [-0.35, 1] and miss the caption box.
        const b = bounds(s);
        assert.ok(b.x0 >= -0.35 && b.x1 <= aspect + 0.35 && b.y0 >= -0.35 && b.y1 <= 1, `${aspect} ${id} t=${t} stage`);
        assert.ok(!overlaps(b, box), `${aspect} ${id} t=${t} caption box`);
      }
    }

    // The shape beat holds three silhouettes of at most six slots, centred in the art box and at most 80% of it.
    const { art } = L, w = art.x1 - art.x0, h = art.y1 - art.y0;
    for (const t of [0.25, 0.5, 0.9]) {
      const held = slotsFor('shape', t, L).filter(active);
      assert.ok(held.length >= 4 && held.length <= 6, `silhouette at ${t} has ${held.length} slots`);
      const u = union(held.map(bounds));
      assert.ok(Math.abs((u.x0 + u.x1) / 2 - (art.x0 + art.x1) / 2) < 1e-9, `${aspect} silhouette ${t} centred in x`);
      assert.ok(Math.abs((u.y0 + u.y1) / 2 - (art.y0 + art.y1) / 2) < 1e-9, `${aspect} silhouette ${t} centred in y`);
      assert.ok(u.x1 - u.x0 <= 0.8 * w + 1e-9 && u.y1 - u.y0 <= 0.8 * h + 1e-9, `${aspect} silhouette ${t} size`);
    }
    // The other beats draw inside the art box (the pool and waterline are the only wide ones).
    for (const id of ['team', 'tickets', 'worth']) {
      const u = union(slotsFor(id, 1, L).filter(active).map(bounds));
      assert.ok(u.x0 >= art.x0 - 0.05 && u.x1 <= art.x1 + 0.05 && u.y0 >= art.y0 - 0.05 && u.y1 <= art.y1 + 0.05, `${aspect} ${id} in the art box`);
    }
  }
});

test('the team beat fans out to teamSize people, each with two or three apps', () => {
  assert.equal(overlaysFor(layoutFor(16 / 9, 6)).team.length, 6);
  assert.equal(overlaysFor(layoutFor(390 / 844, 4)).team.length, 4);
  const APPS = ['mail', 'calendar', 'sheet', 'phone', 'chat'];
  for (const [aspect, team] of [[16 / 9, 6], [390 / 844, 4], [768 / 1024, 6], [844 / 390, 4]]) {
    const L = layoutFor(aspect, team), o = overlaysFor(L);
    o.team.forEach((p, i) => {
      assert.equal(p.index, i);
      assert.ok(p.apps.length >= 2 && p.apps.length <= 3, `person ${i}`);
      assert.ok(p.apps.every((a) => APPS.includes(a)), `person ${i} apps`);
      assert.ok(p.x > 0 && p.x < aspect && p.y > 0 && p.y < 1, `person ${i} on stage`);
    });
    assert.deepEqual(o.team.slice(0, 3).map((p) => p.apps), [['mail', 'calendar'], ['sheet', 'phone', 'mail'], ['chat', 'calendar']]);
    assert.equal(o.tickets.gates.length, 3);
    assert.deepEqual(o.tickets.gates.map((g) => g.index), [0, 1, 2]);
    assert.ok(o.tickets.gates[0].x < o.tickets.gates[2].x && o.tickets.gates[0].y < o.tickets.gates[2].y);
    assert.deepEqual(o.tickets.source, { x: o.team[0].x, y: o.team[0].y });
    // The team's own source is the root the channels branch from, at the layout's `source`.
    assert.deepEqual(o.source, { x: L.source[0], y: L.source[1] });
    assert.ok(o.source.x > 0 && o.source.x < aspect && o.source.y > 0 && o.source.y < 1);
    assert.equal(o.shape.length, 3);
    assert.deepEqual(o.shape.map((s) => s.index), [0, 1, 2]);
    assert.ok(o.shape.every((s) => s.y < L.art.y0 + 0.01 && s.x > L.art.x0 && s.x < L.art.x1));
    assert.ok(o.worth.price.x > L.art.x0 && o.worth.more.x < L.art.x1 && o.worth.price.x < o.worth.more.x);

    // The team slots land exactly on the overlay nodes, so DOM labels sit on the water.
    const slots = slotsFor('team', 1, L).filter(active);
    for (const p of o.team) assert.ok(slots.some((s) => s.th === 0 && s.a[0] === p.x && s.a[1] === p.y && s.r === NODE_R), `node ${p.index}`);
    assert.ok(slots.some((s) => s.th === 0 && s.a[0] === o.source.x && s.a[1] === o.source.y && s.r === SOURCE_R), 'the source');
    const tickets = slotsFor('tickets', 1, L).filter(active);
    for (const g of o.tickets.gates) assert.ok(tickets.some((s) => s.th === 0 && s.a[0] === g.x && s.a[1] === g.y && s.r === GATE_R), `gate ${g.index}`);
    // The nodes are far enough apart not to merge.
    for (let i = 0; i < o.team.length; i++) for (let j = i + 1; j < o.team.length; j++) {
      assert.ok(Math.hypot(o.team[i].x - o.team[j].x, o.team[i].y - o.team[j].y) > 0.1, `nodes ${i} and ${j}`);
    }
  }
});

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

test('the ripple clock takes a steady number of steps per frame, jitter and all', () => {
  // rAF timestamps sit on the display's grid give or take a little jitter (seeded, so the test is repeatable).
  let seed = 7;
  const jitter = (amp) => ((seed = (seed * 16807) % 2147483647) / 2147483647 * 2 - 1) * amp;
  const run = (hz, amp, frames = 600) => {
    const period = 1000 / hz, counts = [];
    let owed = RIPPLE_START_OWED, last = 0;
    for (let i = 1; i <= frames; i++) {
      const time = i * period + jitter(amp);
      const r = stepsFor(owed, time - last, RIPPLE_STEP_MS, 4);
      counts.push(r.steps);
      owed = r.owed;
      last = time;
    }
    return counts;
  };
  assert.equal(RIPPLE_STEP_MS, 1000 / 120);
  assert.equal(RIPPLE_START_OWED, RIPPLE_STEP_MS / 2);
  assert.ok(run(60, 0.05).every((n) => n === 2), '60Hz: two steps every frame');
  assert.ok(run(120, 0.2).every((n) => n === 1), '120Hz: one step every frame');

  // After a pause it catches up at most maxSteps, back on the half-step phase, then runs steady again.
  const pause = stepsFor(RIPPLE_START_OWED, 1500, RIPPLE_STEP_MS, 4);
  assert.deepEqual(pause, { steps: 4, owed: RIPPLE_START_OWED });
  let owed = pause.owed;
  for (let i = 0; i < 60; i++) {
    const r = stepsFor(owed, 1000 / 60 + jitter(0.05), RIPPLE_STEP_MS, 4);
    assert.equal(r.steps, 2, `frame ${i} after the pause`);
    owed = r.owed;
  }
  // Time never runs backwards.
  assert.deepEqual(stepsFor(RIPPLE_START_OWED, -5, RIPPLE_STEP_MS, 4), { steps: 0, owed: RIPPLE_START_OWED });
});

// --- What the browser showed (visual QA, 2026-10-15) ------------------------------------------------

/** How far point p is from the segment a–b. */
const toSegment = (p, a, b) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], len2 = dx * dx + dy * dy;
  const u = len2 ? Math.min(1, Math.max(0, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2)) : 0;
  return Math.hypot(p[0] - a[0] - u * dx, p[1] - a[1] - u * dy);
};
const STAGES = [[16 / 9, 6], [16 / 10, 6], [4 / 3, 6], [1180 / 820, 6], [844 / 390, 4], [390 / 844, 4], [360 / 800, 4], [768 / 1024, 4], [768 / 1024, 6], [1024 / 1366, 6]];

test('the pool runs on below the stage, so its underside never draws a rim along the foot', () => {
  for (const [aspect, team] of STAGES) {
    const L = layoutFor(aspect, team);
    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const pool = bounds(slotsFor('hero', t, L)[0]);
      assert.ok(pool.y0 <= -0.1, `${aspect} hero pool reaches below the stage`);
      const rising = slotsFor('intro', t, L)[0];
      assert.ok(bounds(rising).y0 <= -0.1, `${aspect} intro t=${t} pool reaches below the stage`);
      // Before it rises, all of it is under the stage: not even its top edge shows.
      if (t < 0.55) assert.ok(bounds(rising).y1 < -0.005, `${aspect} intro t=${t} the pool is out of sight`);
    }
  }
});

test('a silhouette\'s parts either join or stand clearly apart: no hairline seam between them', () => {
  for (const [aspect, team] of STAGES) {
    const L = layoutFor(aspect, team);
    for (const t of [0.28, 0.61, 0.94]) {
      const held = slotsFor('shape', t, L).filter(active).map(bounds);
      for (let i = 0; i < held.length; i++) for (let j = i + 1; j < held.length; j++) {
        const p = held[i], q = held[j];
        const dx = Math.max(0, q.x0 - p.x1, p.x0 - q.x1), dy = Math.max(0, q.y0 - p.y1, p.y0 - q.y1);
        if (dx > 0 && dy > 0) continue;   // corner to corner: no slit runs between them
        // Face to face, the smooth union bridges a gap under ~0.02 and leaves a rimmed slit up to ~0.04: a crack.
        const g = dx + dy;
        assert.ok(g === 0 || g >= 0.04, `${aspect} shape t=${t}: parts ${i} and ${j} leave a ${g.toFixed(4)} seam`);
      }
    }
  }
});

test('no team channel runs past another person, and neighbours leave room for their apps', () => {
  for (const [aspect, team] of STAGES) {
    const L = layoutFor(aspect, team);
    L.nodes.forEach((p, i) => L.nodes.forEach((q, j) => {
      if (i === j) return;
      // A channel clears every other node by its tiles' half-width and the role under it (about 0.075 stage heights).
      assert.ok(toSegment(p, L.source, q) >= 0.075, `${aspect}×${team}: the channel to ${j} passes ${toSegment(p, L.source, q).toFixed(3)} from node ${i}`);
    }));
    // Side by side on a wide stage, two people's tiles and roles need about 0.1 stage heights.
    if (aspect >= 1) for (let i = 1; i < L.nodes.length; i++) {
      const d = Math.hypot(L.nodes[i][0] - L.nodes[i - 1][0], L.nodes[i][1] - L.nodes[i - 1][1]);
      assert.ok(d >= 0.1, `${aspect}×${team}: nodes ${i - 1} and ${i} are ${d.toFixed(3)} apart`);
    }
  }
});

test('the ticket chain climbs into every gate, so the gate\'s label (above and left of it) stays off the water', () => {
  for (const [aspect, team] of STAGES) {
    const L = layoutFor(aspect, team);
    const chain = [L.nodes[0], ...L.gates];
    for (let i = 1; i < chain.length; i++) {
      const deg = (Math.atan2(chain[i][1] - chain[i - 1][1], chain[i][0] - chain[i - 1][0]) * 180) / Math.PI;
      assert.ok(deg >= 14, `${aspect}×${team}: the channel into gate ${i - 1} climbs only ${deg.toFixed(1)}°`);
    }
  }
});

test('the team source and its tag clear the 64px masthead even on a phone held sideways', () => {
  for (const [w, h, team] of [[844, 390, 4], [667, 375, 4], [1440, 900, 6], [390, 844, 4]]) {
    const L = layoutFor(w / h, team);
    assert.ok((1 - L.source[1] - SOURCE_R) * h >= 64, `${w}×${h}: the source's top is ${((1 - L.source[1] - SOURCE_R) * h).toFixed(1)}px down`);
  }
});

test('the name is gone before the masthead starts to show, so the two never overlap', () => {
  const L = layoutFor(16 / 9, 6);
  for (let i = 0; i <= 2000; i++) {
    const s = storyState(i / 2000, L);
    assert.ok(!(s.name.opacity > 0 && s.masthead > 0), `p=${i / 2000}: name ${s.name.opacity} under masthead ${s.masthead}`);
  }
});

test('a label that would run off the stage comes back to the gutter, and only then', () => {
  // A 390px stage with 16px gutters.
  assert.equal(nudgeInside(-12, 100, 390, 16), 28);      // cut off on the left: back to 16
  assert.equal(nudgeInside(300, 420, 390, 16), -46);     // cut off on the right: back to 374
  assert.equal(nudgeInside(40, 200, 390, 16), 0);        // on the stage: left alone
  assert.equal(nudgeInside(5, 120, 390, 16), 0);         // in the gutter but whole: left on its node
  assert.equal(nudgeInside(-20, 400, 390, 16), 0);       // wider than the room: no move would help
});

test('the shape labels show from the first silhouette on, and the one the water holds is marked', () => {
  const L = layoutFor(16 / 9, 6);
  const shape = (t) => storyState((2.25 + t) / RUNWAY_SCREENS, L);
  // The beat settles three times; its labels wait only for the first (the truck), not for the beat's t 0.4.
  assert.equal(shape(0.05).overlays.shape, 0);
  assert.ok(shape(0.28).overlays.shape > 0.99, 'the labels are up while the truck holds');
  assert.deepEqual([0.28, 0.61, 0.84].map((t) => shape(t).shapeIndex), [0, 1, 2]);
  assert.equal(shape(0.999).shapeIndex, 2);   // (shape t 1 is the team beat's first frame)
  for (const p of [0.1, 0.5, 0.9]) assert.equal(storyState(p, L).shapeIndex, null, `p=${p} is not the shape beat`);
});

test('the tickets: most stop at the first gate, one climbs to the second, one reaches the person', () => {
  // Spec beat 4 (ruling R28): six tickets, four of them fixed at the first gate.
  assert.equal(TICKETS.length, 6);
  assert.deepEqual([0, 1, 2].map((g) => TICKETS.filter((x) => x === g).length), [4, 1, 1]);
  const ticketStart = 3.25 + 1.25, ticketScreens = 1;
  for (const [aspect, team] of STAGES) {
    const L = layoutFor(aspect, team), o = overlaysFor(L);
    const chain = [L.nodes[0], ...L.gates];
    const drops = (t) => slotsFor('tickets', t, L).filter((s) => active(s) && s.th === 0 && s.r === DROP_R);
    // The person, three gates, three links and six drops: 13 of the 16 slots.
    assert.equal(slotsFor('tickets', 1, L).filter(active).length, 13, `${aspect}×${team}`);
    assert.ok(13 <= MAX_SLOTS);
    // Once the chain has formed (t 0.4) every drop waits on the person, where the screen tile sits: they leave from it.
    for (const d of drops(0.4)) assert.deepEqual(d.a, [o.tickets.source.x, o.tickets.source.y]);
    assert.equal(drops(0.4).length, TICKETS.length);
    // At the end each drop sits on its gate: four on the first (the check's), one on each of the others.
    const at = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 1e-9;
    const end = drops(1);
    assert.equal(end.length, TICKETS.length);
    assert.deepEqual(L.gates.map((g) => end.filter((d) => at(d.a, g)).length), [4, 1, 1], `${aspect}×${team} drops per gate`);
    assert.deepEqual([o.tickets.check.x, o.tickets.check.y], L.gates[0], 'the check marks the gate most tickets stop at');

    // Every drop rides the chain, only ever forward, and never past its own gate.
    const reach = (p) => {   // how far along the chain point p is (it must be on it)
      let best = Infinity, d = 0, along = 0;
      for (let i = 1; i < chain.length; i++) {
        const len = Math.hypot(chain[i][0] - chain[i - 1][0], chain[i][1] - chain[i - 1][1]);
        const off = toSegment(p, chain[i - 1], chain[i]);
        if (off < best - 1e-12) { best = off; along = d + Math.hypot(p[0] - chain[i - 1][0], p[1] - chain[i - 1][1]); }
        d += len;
      }
      assert.ok(best < 1e-9, `${aspect}×${team}: a drop left the chain by ${best}`);
      return along;
    };
    const gateAt = L.gates.map((g) => reach(g));
    const left = TICKETS.map(() => null), arrived = TICKETS.map(() => null), last = TICKETS.map(() => 0);
    for (let i = 400; i <= 1000; i++) {
      const t = i / 1000;
      slotsFor('tickets', t, L).slice(7, 7 + TICKETS.length).forEach((d, j) => {
        assert.ok(active(d) && d.r === DROP_R && d.th === 0, `slot ${7 + j} is drop ${j}`);
        const s = reach(d.a);
        assert.ok(s >= last[j] - 1e-12, `${aspect}×${team}: drop ${j} went back at t=${t}`);
        assert.ok(s <= gateAt[TICKETS[j]] + 1e-9, `${aspect}×${team}: drop ${j} ran past its gate`);
        if (left[j] === null && s > 1e-9) left[j] = t;
        if (arrived[j] === null && Math.abs(s - gateAt[TICKETS[j]]) < 1e-9) arrived[j] = t;
        last[j] = s;
      });
    }
    // Staggered: they leave one after another, never two together, and only once the chain is formed.
    assert.ok(left.every((t) => t !== null) && left[0] > 0.4, `${left}`);
    for (let j = 1; j < left.length; j++) assert.ok(left[j] - left[j - 1] >= 0.04, `drop ${j} leaves ${left[j]}, ${left[j - 1]} before it`);
    // All are home before the caption starts to fade (t 0.85); the one that reaches the person is the last in.
    assert.ok(arrived.every((t) => t !== null && t <= 0.85), `${arrived}`);
    const person = TICKETS.indexOf(2);
    assert.equal(Math.max(...arrived), arrived[person], 'the person has the last word');
  }
  // The trips: leave in order, each climb a little longer the further it goes.
  for (let j = 1; j < TICKETS.length; j++) assert.ok(ticketTrip(j).leave > ticketTrip(j - 1).leave);
  for (let j = 0; j < TICKETS.length; j++) assert.ok(ticketTrip(j).leave >= 0.4 && ticketTrip(j).arrive <= 0.85, `trip ${j}`);
  // And the overlay (the gates' labels and the check) is up by the time the first drop gets there.
  const L = layoutFor(16 / 9, 6);
  assert.equal(storyState((ticketStart + ticketTrip(0).arrive * ticketScreens) / RUNWAY_SCREENS, L).overlays.tickets > 0.9, true);
});

test('the water has a deadline: late, the story goes static once; on time, never; whatever arrives late is dropped', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  assert.equal(WATER_DEADLINE_MS, 4000);
  // Late: nothing by 4s, so onLate runs once, and a load that resolves after that is told it missed.
  let late = 0;
  const slow = deadline(WATER_DEADLINE_MS, () => late++);
  t.mock.timers.tick(3999);
  assert.equal(late, 0, 'not before the deadline');
  t.mock.timers.tick(1);
  assert.equal(late, 1, 'at the deadline');
  t.mock.timers.tick(10000);
  assert.equal(late, 1, 'once');
  assert.equal(slow.met(), false, 'the water that came after it is dropped');
  // On time: met() stops the clock, so the story never goes static on its account.
  let missed = 0;
  const quick = deadline(WATER_DEADLINE_MS, () => missed++);
  t.mock.timers.tick(2500);
  assert.equal(quick.met(), true);
  t.mock.timers.tick(10000);
  assert.equal(missed, 0);
  assert.equal(quick.met(), false, 'met only once');
  // Cancelled (the story went static another way, or unmounted): no verdict, and no call.
  let cancelled = 0;
  deadline(WATER_DEADLINE_MS, () => cancelled++).cancel();
  t.mock.timers.tick(10000);
  assert.equal(cancelled, 0);
  // It takes its timers from the caller, so it needs no window.
  const calls = [];
  const fake = { setTimeout: (fn, ms) => { calls.push(['set', ms]); return 7; }, clearTimeout: (id) => calls.push(['clear', id]) };
  deadline(123, () => {}, fake).met();
  assert.deepEqual(calls, [['set', 123], ['clear', 7]]);
});
