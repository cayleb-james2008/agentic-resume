import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { LOOP_LENGTH, LOOP_MARKERS, LOOP_PATH, LOOP_START } from '../site/js/approach/loop-path.js';
import { TOTAL, distanceAtTime, trailUpTo } from '../site/js/approach/lap.js';
import { artboardToMap, mapToArtboard } from '../site/js/approach/map-vector.js';
import { CHEQUER_FILL, approach, buildDotField } from '../site/js/approach/dots.js';

const content = JSON.parse(readFileSync(new URL('../site/content.json', import.meta.url), 'utf8'));

test('loop closes on itself', () => {
  assert.deepEqual(LOOP_PATH[0], LOOP_PATH.at(-1));
  for (let i = 1; i < LOOP_PATH.length; i += 1) {
    const step = Math.hypot(LOOP_PATH[i][0] - LOOP_PATH[i - 1][0], LOOP_PATH[i][1] - LOOP_PATH[i - 1][1]);
    if (i < LOOP_PATH.length - 1) assert.ok(Math.abs(step - 3) <= 0.05 + 0.08, `step ${i} is ${step}`);
    else assert.ok(step <= 3.1, `closing step is ${step}`);
  }
  for (const [x, y] of LOOP_PATH) assert.ok(x >= 0 && x <= 1440 && y >= 0 && y <= 800);
});

test('stations in order', () => {
  assert.equal(LOOP_MARKERS.length, 4);
  for (let i = 1; i < LOOP_MARKERS.length; i += 1) assert.ok(LOOP_MARKERS[i].d > LOOP_MARKERS[i - 1].d);
  assert.ok(LOOP_MARKERS.at(-1).d < LOOP_LENGTH);
  assert.deepEqual(LOOP_MARKERS.map((m) => m.label), content.approach.stations);
  assert.equal(LOOP_START.label, content.approach.finish);
});

test('lap pacing', () => {
  assert.equal(distanceAtTime(0), 0);
  assert.equal(distanceAtTime(1), TOTAL);
  let previous = 0;
  for (let i = 1; i <= 200; i += 1) {
    const d = distanceAtTime(i / 200);
    assert.ok(d >= previous, `non-decreasing at ${i}`);
    previous = d;
  }
  const tip = trailUpTo(TOTAL / 2).at(-1);
  const nearest = Math.min(...LOOP_PATH.map(([x, y]) => Math.hypot(x - tip[0], y - tip[1])));
  assert.ok(nearest <= 3);
});

test('map round trip', () => {
  const [x, y] = mapToArtboard(...artboardToMap(700, 400));
  assert.ok(Math.abs(x - 700) < 1e-9 && Math.abs(y - 400) < 1e-9);
});

test('dot field', () => {
  const a = buildDotField();
  const b = buildDotField();
  assert.equal(a.count, b.count);
  assert.deepEqual(Array.from(a.points.slice(0, 20)), Array.from(b.points.slice(0, 20)));
  assert.ok(a.count >= 7500 && a.count <= 8500, `count ${a.count}`);
});

test('approach easing', () => {
  assert.ok(Math.abs(approach(0, 1, 0.07, 0.07) - (1 - Math.exp(-1))) < 1e-12);
});

test('lit dots stay a pixel grid, never a solid block', () => {
  assert.ok(CHEQUER_FILL < 1);
});

test('on a short landscape screen the loop sits right of the copy column, inside the block', async () => {
  const { stageFit, TRACK_BOX } = await import('../site/js/approach/approach.js');
  const w = 844, h = 640;
  const { s, tx, ty } = stageFit(w, h);
  const left = tx + (TRACK_BOX.cx - TRACK_BOX.width / 2) * s;
  const right = tx + (TRACK_BOX.cx + TRACK_BOX.width / 2) * s;
  const top = ty + (TRACK_BOX.cy - TRACK_BOX.height / 2) * s;
  const bottom = ty + (TRACK_BOX.cy + TRACK_BOX.height / 2) * s;
  assert.ok(left >= w * 0.3, `loop starts at ${left.toFixed(0)}`);
  assert.ok(right <= w + 1 && top >= -1 && bottom <= h + 1, 'loop inside the block');
  // A tablet in portrait keeps the full-width loop.
  const tall = stageFit(768, 1024);
  assert.ok(Math.abs(tall.s - 768 / TRACK_BOX.width) < 1e-9);
});

import { placeLabel } from '../site/js/approach/labels.js';

test('a hanging station label that would cross the frame edge moves to the station\'s other side', () => {
  // "Build" hangs right of its station; on a 390px phone it ran off the edge.
  assert.deepEqual(placeLabel({ at: 360, dx: 14, anchor: 'start', width: 40 }, 8, 382), { x: 346, anchor: 'end' });
  assert.deepEqual(placeLabel({ at: 300, dx: 14, anchor: 'start', width: 40 }, 8, 382), { x: 314, anchor: 'start' });
  // "Whole company" hangs left of the start node.
  assert.deepEqual(placeLabel({ at: 30, dx: -15, anchor: 'end', width: 90 }, 8, 382), { x: 45, anchor: 'start' });
  assert.deepEqual(placeLabel({ at: 200, dx: -15, anchor: 'end', width: 90 }, 8, 382), { x: 185, anchor: 'end' });
});

test('a centred station label slides inside the frame', () => {
  assert.deepEqual(placeLabel({ at: 20, dx: 0, anchor: 'middle', width: 80 }, 8, 382), { x: 48, anchor: 'middle' });
  assert.deepEqual(placeLabel({ at: 370, dx: 0, anchor: 'middle', width: 80 }, 8, 382), { x: 342, anchor: 'middle' });
  assert.deepEqual(placeLabel({ at: 190, dx: 0, anchor: 'middle', width: 80 }, 8, 382), { x: 190, anchor: 'middle' });
});
