/**
 * The hero's contour field on a 2D canvas, by marching squares
 * (spec §L4728–4783) — the projects and contact backdrops, and the hero's
 * no-WebGL fallback.
 */
import { runWhileVisible } from './scroll.js';
import { readToken } from './tokens.js';

const LINE_SCALE = 3.8;
const LINE_COUNT = 2.5;
const WAVE_AMOUNT = 0.37;
const WAVE_SPEED = 1.66;
const LINE_OPACITY = 0.85;
const CELLS = 96;
const FRAME_MS = 24;

/** Spec §L4738–4744, verbatim — the same four sines as the hero shader. */
export const field = (x, y, t) => {
  let f = Math.sin(x * 1.0 + t * 0.6) * 0.5;
  f += Math.sin(y * 0.85 - t * 0.45) * 0.45;
  f += Math.sin((x + y) * 0.65 + t * 0.35) * 0.35;
  f += Math.sin((x - y) * 0.95 - t * 0.55) * 0.25;
  return f * 0.5 + 0.5;
};

/**
 * Iso-line segments at `level` over a (cols + 1) × (rows + 1) grid of values,
 * as [x1, y1, x2, y2] — the case table of spec §L4757–4781.
 */
export function marchingSegments(values, cols, rows, level, stepX, stepY) {
  const out = [];
  const w = cols + 1;
  for (let j = 0; j < rows; j += 1) {
    for (let i = 0; i < cols; i += 1) {
      const a = values[j * w + i];
      const b = values[j * w + i + 1];
      const c = values[(j + 1) * w + i + 1];
      const d = values[(j + 1) * w + i];
      const index = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
      if (index === 0 || index === 15) continue;
      const x0 = i * stepX;
      const y0 = j * stepY;
      const top = [x0 + stepX * ((level - a) / (b - a)), y0];
      const right = [x0 + stepX, y0 + stepY * ((level - b) / (c - b))];
      const bottom = [x0 + stepX * ((level - d) / (c - d)), y0 + stepY];
      const left = [x0, y0 + stepY * ((level - a) / (d - a))];
      const seg = (p, q) => out.push([p[0], p[1], q[0], q[1]]);
      switch (index) {
        case 1: case 14: seg(left, bottom); break;
        case 2: case 13: seg(bottom, right); break;
        case 3: case 12: seg(left, right); break;
        case 4: case 11: seg(top, right); break;
        case 6: case 9: seg(top, bottom); break;
        case 7: case 8: seg(left, top); break;
        case 5: seg(left, top); seg(bottom, right); break; // the saddles
        case 10: seg(left, bottom); seg(top, right); break;
        default: break;
      }
    }
  }
  return out;
}

/** One frame of the contour backdrop, in CSS pixels. */
export function drawContours(ctx, { width, height, t, colour, cells = CELLS }) {
  const cols = width >= height ? cells : Math.max(8, Math.round((cells * width) / height));
  const rows = Math.max(8, Math.round((cols * height) / width));
  const stepX = width / cols;
  const stepY = height / rows;
  const aspect = width / height;
  const values = new Float32Array((cols + 1) * (rows + 1));
  for (let j = 0; j <= rows; j += 1) {
    for (let i = 0; i <= cols; i += 1) {
      const nx = ((i / cols) * 2 - 1) * aspect * LINE_SCALE;
      const ny = ((j / rows) * 2 - 1) * LINE_SCALE;
      const qx = nx + Math.sin(ny * 0.8 + t * 0.7) * WAVE_AMOUNT;
      const qy = ny + Math.cos(nx * 0.7 - t * 0.6) * WAVE_AMOUNT;
      values[j * (cols + 1) + i] = field(qx, qy, t) * LINE_COUNT;
    }
  }
  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = colour;
  ctx.lineWidth = 1;
  ctx.globalAlpha = LINE_OPACITY;
  ctx.beginPath();
  for (let level = 0.5; level < LINE_COUNT; level += 1) {
    for (const [x1, y1, x2, y2] of marchingSegments(values, cols, rows, level, stepX, stepY)) {
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
    }
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/** Sizes a canvas to its box at min(DPR, 2); returns the CSS size. */
export function fitCanvas(canvas, maxRatio = 2) {
  const ratio = Math.min(window.devicePixelRatio || 1, maxRatio);
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const w = Math.max(1, Math.round(width * ratio));
  const h = Math.max(1, Math.round(height * ratio));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  canvas.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0);
  return { width, height };
}

/** Runs the backdrop on `canvas` while it is in view, redrawn every 24ms. */
export function mountContours(canvas, colourToken) {
  const ctx = canvas.getContext('2d');
  const colour = readToken(colourToken);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const start = performance.now();
  let size = fitCanvas(canvas);
  const observer = new ResizeObserver(() => {
    size = fitCanvas(canvas);
    if (reduced) draw(start);
  });
  observer.observe(canvas);
  const draw = (now) => {
    if (!size.width || !size.height) return;
    const t = ((now - start) / 1000) * WAVE_SPEED;
    drawContours(ctx, { ...size, t, colour });
  };
  if (reduced) {
    draw(start);
    return () => observer.disconnect();
  }
  const stop = runWhileVisible(canvas, draw, () => FRAME_MS);
  return () => { observer.disconnect(); stop(); };
}
