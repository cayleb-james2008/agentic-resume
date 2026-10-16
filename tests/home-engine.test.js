// The page's one animation loop (site/js/engine/ticker.js), which moves the Ergon graph's packets.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createTicker } from '../site/js/engine/ticker.js';

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
