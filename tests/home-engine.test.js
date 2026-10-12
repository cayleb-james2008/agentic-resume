import test from 'node:test';
import assert from 'node:assert/strict';
import { createTicker } from '../site/js/engine/ticker.js';
import { CONFIGS, Spring, Tween, easings } from '../site/js/engine/spring.js';

/** A ticker driven by hand at a fixed frame spacing. */
const fakeTicker = () => {
  let pending = null;
  let cancelled = 0;
  const ticker = createTicker({
    raf: (fn) => { pending = fn; return 1; },
    caf: () => { cancelled += 1; pending = null; },
  });
  const run = (frames, spacing) => {
    for (let i = 0; i < frames; i += 1) {
      const fn = pending;
      pending = null;
      fn?.(i * spacing);
    }
  };
  return { ticker, run, cancelled: () => cancelled };
};

test('ticker gates by framerate', () => {
  const { ticker, run } = fakeTicker();
  let sixty = 0;
  let every = 0;
  ticker.subscribe(() => { sixty += 1; }, () => 1000 / 60 - 2);
  ticker.subscribe(() => { every += 1; }, () => 0);
  run(10, 1000 / 120);
  assert.equal(sixty, 5);
  assert.equal(every, 10);
});

test('ticker stops on last unsubscribe', () => {
  const { ticker, cancelled } = fakeTicker();
  const a = ticker.subscribe(() => {}, () => 0);
  const b = ticker.subscribe(() => {}, () => 0);
  a();
  assert.equal(cancelled(), 0);
  b();
  assert.equal(cancelled(), 1);
});

test('spring settles', () => {
  const spring = new Spring({ ...CONFIGS.REVEAL });
  spring.set(1);
  let elapsed = 0;
  while (spring.step(16)) {
    elapsed += 16;
    assert.ok(elapsed < 3000, 'settles within 3s');
  }
  assert.ok(Math.abs(spring.value - 1) < 0.01);
});

test('spring caps a long frame', () => {
  const a = new Spring({ ...CONFIGS.ITEM });
  const b = new Spring({ ...CONFIGS.ITEM });
  a.set(1);
  b.set(1);
  a.step(1000);
  b.step(64);
  assert.equal(a.value, b.value);
  assert.equal(a.velocity, b.velocity);
});

test('tween ends exactly', () => {
  const tween = new Tween({ from: 0, to: 1, duration: 6000, easing: easings.easeInOutSine });
  let moving = true;
  for (let i = 0; i < 400 && moving; i += 1) moving = tween.step(16);
  assert.equal(moving, false);
  assert.equal(tween.value, 1);
});

test('named configs are the reference values', () => {
  assert.deepEqual(CONFIGS.REVEAL, { tension: 90, friction: 26 });
  assert.deepEqual(CONFIGS.VEIL, { tension: 70, friction: 24 });
  assert.deepEqual(CONFIGS.YEAR_SETTLE, { tension: 32, friction: 26 });
  assert.deepEqual(CONFIGS.TRIGGER, { tension: 140, friction: 30 });
});

import { interpolate, triggerProgress } from '../site/js/engine/scroll.js';
import { splitUnits } from '../site/js/engine/reveal.js';
import { recede } from '../site/js/engine/stack.js';

test('triggerProgress endpoints', () => {
  const vh = 800;
  const rect = (top) => ({ top, height: 400, bottom: top + 400 });
  assert.equal(triggerProgress(rect(vh), vh, 'top bottom', 'top top'), 0);
  assert.equal(triggerProgress(rect(0), vh, 'top bottom', 'top top'), 1);
  assert.equal(triggerProgress(rect(vh / 2), vh, 'top bottom', 'top top'), 0.5);
});

test('interpolate units', () => {
  assert.equal(interpolate('0cqw', '-3.3334cqw', 0.5), '-1.6667cqw');
  assert.equal(interpolate('translateY(0.75rem)', 'translateY(0rem)', 0.5), 'translateY(0.375rem)');
  assert.equal(interpolate(0, 10, 0.25), 2.5);
});

test('splitUnits', () => {
  assert.deepEqual(splitUnits('next race', 'letter'), [['n', 'e', 'x', 't'], ['r', 'a', 'c', 'e']]);
  assert.deepEqual(splitUnits('a b', 'word'), [['a'], ['b']]);
});

test('recede', () => {
  const vh = 800;
  assert.deepEqual(
    (({ transform, shade, visible }) => ({ transform, shade, visible }))(recede(vh, vh, false)),
    { transform: '', shade: 0, visible: true },
  );
  assert.deepEqual(
    (({ transform, shade, visible }) => ({ transform, shade, visible }))(recede(0, vh, false)),
    { transform: 'scale(0.9)', shade: 0.55, visible: false },
  );
  const phone = recede(vh / 2, vh, true);
  assert.equal(phone.transform, '');
  assert.equal(phone.shade, 0.275);
});
