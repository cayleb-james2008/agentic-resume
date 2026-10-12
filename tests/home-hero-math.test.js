import test from 'node:test';
import assert from 'node:assert/strict';
import { CAP_60, getSceneTier } from '../site/js/hero/tier.js';
import { DEG, fitSubjectToBox, swing } from '../site/js/hero/fit.js';
import { HEADSET_PROFILE, VISOR_BAND } from '../site/js/hero/headset-profile.js';

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

test('headset profile is a closed dome', () => {
  for (let i = 1; i < HEADSET_PROFILE.length; i += 1) {
    assert.ok(HEADSET_PROFILE[i][1] > HEADSET_PROFILE[i - 1][1], 'y strictly increases');
  }
  assert.ok(HEADSET_PROFILE.every(([x]) => x >= 0));
  assert.equal(HEADSET_PROFILE.at(-1)[0], 0);
  const inBand = HEADSET_PROFILE.filter(([, y]) => y >= VISOR_BAND[0] && y <= VISOR_BAND[1]);
  assert.ok(inBand.length >= 2);
});
