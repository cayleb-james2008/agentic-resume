import test from 'node:test';
import assert from 'node:assert/strict';
import { field, marchingSegments } from '../site/js/engine/contours.js';
import { cellHash, drawDissolve } from '../site/js/engine/dissolve.js';

/** A 2D context that only records what was asked of it. */
const recorder = () => {
  const calls = { fillRect: 0, clearRect: 0 };
  return {
    calls,
    ctx: {
      fillStyle: '',
      fillRect() { calls.fillRect += 1; },
      clearRect() { calls.clearRect += 1; },
      setTransform() {},
    },
  };
};

test('one corner above level is one segment', () => {
  // 1×1 cell, values in row-major (cols + 1) order: a b / d c.
  const values = Float32Array.from([2, 0, 0, 0]);
  const segments = marchingSegments(values, 1, 1, 1, 10, 10);
  assert.equal(segments.length, 1);
  const [x1, y1, x2, y2] = segments[0];
  assert.equal(x1, 0); // starts on the left edge
  assert.equal(y2, 0); // ends on the top edge
  assert.ok(y1 > 0 && x2 > 0);
});

test('saddle draws two', () => {
  // a > level, b < level, c > level, d < level → case 10
  const values = Float32Array.from([2, 0, 0, 2]);
  assert.equal(marchingSegments(values, 1, 1, 1, 10, 10).length, 2);
  assert.equal(marchingSegments(Float32Array.from([2, 2, 2, 2]), 1, 1, 1, 10, 10).length, 0);
});

test('field matches the shader', () => {
  const expected = (Math.sin(1 * 1.0) * 0.5 + Math.sin(2 * 0.85) * 0.45 + Math.sin(3 * 0.65) * 0.35 + Math.sin(-1 * 0.95) * 0.25) * 0.5 + 0.5;
  assert.ok(Math.abs(field(1, 2, 0) - expected) < 1e-12);
});

test('dissolve solid rows at rest', () => {
  const { ctx, calls } = recorder();
  drawDissolve(ctx, { width: 240, height: 240, cell: 24, progress: 0, surface: '#fff', accent: '#0ff' });
  assert.ok(calls.fillRect >= 20, `filled ${calls.fillRect} cells`);
});

test('dissolve gone at the top', () => {
  const { ctx, calls } = recorder();
  drawDissolve(ctx, { width: 240, height: 240, cell: 24, progress: 1, surface: '#fff', accent: '#0ff' });
  assert.equal(calls.fillRect, 0);
});

test('dissolve is a pixel field, not a checkerboard', () => {
  const { ctx, calls } = recorder();
  const fills = [];
  ctx.fillRect = (x, y) => { calls.fillRect += 1; fills.push(`${x / 24},${y / 24}`); };
  drawDissolve(ctx, { width: 960, height: 480, cell: 24, progress: 0.1, surface: '#fff', accent: '#0ff' });
  const offParity = fills.filter((key) => {
    const [x, y] = key.split(',').map(Number);
    return (x + y) % 2 !== 0 && y > 3;
  });
  assert.ok(offParity.length > 0, 'cells of both parities survive the dissolve');
});

test('cellHash is deterministic and in range', () => {
  for (let x = 0; x < 40; x += 1) {
    for (let y = 0; y < 25; y += 1) {
      const h = cellHash(x, y);
      assert.ok(h >= 0 && h <= 1);
      assert.equal(h, cellHash(x, y));
    }
  }
});
