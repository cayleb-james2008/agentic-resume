import test from 'node:test';
import assert from 'node:assert/strict';
import { CAP_60, getSceneTier } from '../site/js/hero/tier.js';
import { DEG, fitSubjectToBox, swing } from '../site/js/hero/fit.js';
import { BLINK_MS, DROPLET_PROFILE, EYE_MAX_DEG, blinkSquash, lookAngles } from '../site/js/hero/droplet-shape.js';

/** A stand-in for window: width, pointer class, reduced motion, save-data. */
const env = ({ width, coarse = false, reduced = false, saveData = false, memory = 8 }) => ({
  innerWidth: width,
  matchMedia: (query) => ({
    matches:
      (query.includes('pointer: coarse') && coarse) ||
      (query.includes('prefers-reduced-motion') && reduced),
  }),
  navigator: { connection: { saveData }, deviceMemory: memory },
});

test('tier matrix', () => {
  const phone = getSceneTier(env({ width: 390, coarse: true }));
  assert.equal(phone.name, 'mobile');
  assert.equal(phone.maxDpr, 1);
  assert.equal(phone.trailSamples, 28);
  assert.equal(phone.reveal, false);
  assert.equal(phone.outline, false);

  const tablet = getSceneTier(env({ width: 900 }));
  assert.equal(tablet.name, 'tablet');
  assert.equal(tablet.maxDpr, 1.25);
  assert.equal(tablet.trailSamples, 44);
  assert.equal(tablet.frameInterval, CAP_60);

  const desktop = getSceneTier(env({ width: 1440 }));
  assert.equal(desktop.name, 'desktop');
  assert.equal(desktop.maxDpr, 1.5);
  assert.equal(desktop.trailSamples, 72);
  assert.equal(desktop.frameInterval, 0);
  assert.equal(desktop.antialias, true);

  assert.equal(getSceneTier(env({ width: 1000, coarse: true })).name, 'mobile');
  assert.equal(getSceneTier(env({ width: 1100, coarse: true })).name, 'tablet');

  const reduced = getSceneTier(env({ width: 1440, reduced: true }));
  assert.equal(reduced.pointerEnabled, false);
  assert.equal(reduced.freeze, true);

  assert.equal(getSceneTier(env({ width: 390, coarse: true, saveData: true })).freeze, true);
});

test('fit is identity for the full canvas', () => {
  const params = { subjectScale: 1.15, subjectY: 0.42, cameraZ: 6.5 };
  const same = fitSubjectToBox(params, { top: 0, height: 800 }, 800);
  assert.equal(same.subjectScale, 1.15);
  assert.ok(Math.abs(same.subjectY - 0.42) < 1e-12);
  const half = fitSubjectToBox(params, { top: 400, height: 400 }, 800);
  assert.ok(Math.abs(half.subjectScale - 0.575) < 1e-12);
});

test('swing reaches the amplitude', () => {
  assert.equal(swing(1, 2.5, 0), 2.5 * DEG);
  assert.ok(Math.abs(swing(1, 8, 3) - 8 * DEG) < 1e-12);
  assert.equal(swing(0, 8, 3), 0);
});

test('the droplet is a closed teardrop, round at the foot and pointed at the top', () => {
  for (let i = 1; i < DROPLET_PROFILE.length; i += 1) {
    assert.ok(DROPLET_PROFILE[i][1] > DROPLET_PROFILE[i - 1][1], 'y strictly increases');
  }
  assert.ok(DROPLET_PROFILE.every(([x]) => x >= 0));
  assert.equal(DROPLET_PROFILE[0][0], 0, 'closed at the foot');
  assert.equal(DROPLET_PROFILE.at(-1)[0], 0, 'closed at the tip');
  const top = DROPLET_PROFILE.at(-1)[1];
  const widest = DROPLET_PROFILE.reduce((a, b) => (b[0] > a[0] ? b : a));
  assert.ok(widest[1] < top * 0.45, 'the belly sits in the lower half');
});

test('the eyes look toward the cursor, never past their clamp', () => {
  assert.deepEqual(lookAngles(0, 0), { yaw: 0, pitch: 0 });
  const right = lookAngles(1, 0);
  assert.ok(right.yaw > 0 && right.pitch === 0);
  const far = lookAngles(9, 9);
  assert.ok(Math.abs(far.yaw) <= EYE_MAX_DEG * Math.PI / 180 + 1e-12);
  assert.ok(Math.abs(far.pitch) <= EYE_MAX_DEG * Math.PI / 180 + 1e-12);
  assert.ok(far.pitch > 0, 'cursor below (screen y down) pitches down');
});

test('a blink squashes the eyes briefly and returns to full height', () => {
  assert.equal(blinkSquash(-1), 1);
  assert.equal(blinkSquash(BLINK_MS + 1), 1);
  assert.ok(blinkSquash(BLINK_MS / 2) < 0.2);
  assert.ok(blinkSquash(BLINK_MS / 4) < 1 && blinkSquash(BLINK_MS / 4) > blinkSquash(BLINK_MS / 2));
});
