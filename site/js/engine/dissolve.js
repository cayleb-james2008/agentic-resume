/**
 * The seam between a light block and a dark one: the ground carried into the
 * next block as solid rows that break into pixels and burn off as you scroll
 * (spec §L2839–2877). The reference kept only one colour of a chequerboard;
 * here every cell can survive, so it reads as a pixel dissolve, not a flag.
 */
import { CONFIGS, Spring } from './spring.js';
import { runWhileVisible, triggerProgress } from './scroll.js';
import { fitCanvas } from './contours.js';
import { readToken } from './tokens.js';

const CELL = 24;
const SOLID_UNTIL = 0.16;
const LIFT = 2;
const ACCENT_SHARE = 0.06;

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);

/** Deterministic per-cell hash — spec §L2850–2855, verbatim. */
export const cellHash = (x, y) => {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};

export function drawDissolve(ctx, { width, height, cell = CELL, progress, surface, accent }) {
  ctx.clearRect(0, 0, width, height);
  const columns = Math.ceil(width / cell);
  const rows = Math.ceil(height / cell);
  const lift = progress * LIFT;
  for (let y = 0; y < rows; y += 1) {
    const depth = y / Math.max(1, rows - 1) + lift;
    if (depth > 1) break;
    const solid = depth <= SOLID_UNTIL;
    const fade = clamp01(1 - (depth - SOLID_UNTIL) / (1 - SOLID_UNTIL));
    if (!solid && fade <= 0) break;
    for (let x = 0; x < columns; x += 1) {
      if (!solid && cellHash(x, y) > fade) continue;
      ctx.fillStyle = !solid && cellHash(x + 101, y + 57) < ACCENT_SHARE ? accent : surface;
      ctx.fillRect(x * cell, y * cell, cell, cell);
    }
  }
}

/** Scrubs a seam band from "top bottom" to "top top". */
export function mountDissolve(band, carry = 'light') {
  const ctx = band.getContext('2d');
  const surface = readToken(carry === 'light' ? '--background' : '--surface-black');
  const accent = readToken('--accent');
  const spring = new Spring({ ...CONFIGS.TRIGGER, precision: 0.0005 });
  let size = fitCanvas(band);
  let drawn = null;
  const observer = new ResizeObserver(() => { size = fitCanvas(band); drawn = null; });
  observer.observe(band);
  const render = () => {
    const target = triggerProgress(band.getBoundingClientRect(), window.innerHeight, 'top bottom', 'top top');
    spring.set(target);
    spring.step(16);
    const progress = spring.value;
    if (progress === drawn) return;
    drawn = progress;
    drawDissolve(ctx, { ...size, progress, surface, accent });
  };
  const stop = runWhileVisible(band, render, () => 0);
  return () => { observer.disconnect(); stop(); };
}
