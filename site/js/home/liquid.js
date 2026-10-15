/**
 * The hero's liquid reveal: the pointer paints the blueprint layer over the surface layer with a soft
 * brush that decays. The constants are the reference's; the maths below is pure and tested.
 */

import { ticker } from '../engine/ticker.js';
export const BRUSH_RADIUS = 143;
export const DECAY = 0.016;
export const FADE_FRAMES = 120;
const MAX_POINTS = 60;

/** The points to stamp between the last pointer position and the next, ending exactly at `next`. */
export function trailPoints(last, next, radius) {
  if (!last) return [{ x: next.x, y: next.y }];
  const dx = next.x - last.x, dy = next.y - last.y;
  const step = Math.max(radius * 0.3, 1);
  const n = Math.max(1, Math.min(Math.ceil(Math.hypot(dx, dy) / step), MAX_POINTS));
  return Array.from({ length: n }, (_, i) => ({ x: last.x + (dx * (i + 1)) / n, y: last.y + (dy * (i + 1)) / n }));
}

/** How much of the trail fades this frame: the base rate while drawing, ramping up once idle. */
export const fadeFor = (drawing, idle) => (drawing ? DECAY : Math.min(DECAY + idle * 0.004, 0.5));

/** Where an image of iw×ih lands when it covers a w×h box (object-fit: cover, centred). */
export function coverRect(iw, ih, w, h) {
  const s = Math.max(w / iw, h / ih);
  return { x: (w - iw * s) / 2, y: (h - ih * s) / 2, w: iw * s, h: ih * s };
}


/**
 * Paints the blueprint layer along the pointer's trail over the surface picture. The trail decays each frame,
 * fades faster once the pointer rests, and clears after FADE_FRAMES idle frames, when the loop stops. One
 * unprompted stroke runs after the intro so phones see what is underneath. Skipped with motion reduced.
 */
export function mount(box, { onReady, reduced }) {
  if (reduced) return;
  const canvas = box.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const tallMQ = window.matchMedia('(max-aspect-ratio: 3/4)');
  const cover = document.createElement('canvas');
  const brush = document.createElement('canvas');
  let dpr = 1, W = 0, H = 0, radius = BRUSH_RADIUS, img = null, pts = [], last = null, idle = FADE_FRAMES + 1, stop = null, manual = false;

  function size() {
    const r = box.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, Math.round(r.width * dpr));
    H = Math.max(1, Math.round(r.height * dpr));
    canvas.width = cover.width = W;
    canvas.height = cover.height = H;
    radius = BRUSH_RADIUS * dpr;
    brush.width = brush.height = Math.ceil(radius * 2);
    if (img) {
      const c = cover.getContext('2d');
      const fit = coverRect(img.naturalWidth, img.naturalHeight, W, H);
      c.clearRect(0, 0, W, H);
      c.drawImage(img, fit.x, fit.y, fit.w, fit.h);
    }
  }
  function load() {
    const next = new Image();
    next.decoding = 'async';
    next.onload = () => { img = next; size(); };
    next.src = tallMQ.matches ? box.dataset.tall : box.dataset.wide;
  }
  function stamp(x, y) {
    const b = brush.getContext('2d');
    const d = brush.width, c = d / 2;
    b.globalCompositeOperation = 'source-over';
    b.clearRect(0, 0, d, d);
    const g = b.createRadialGradient(c, c, 0, c, c, c);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.55, 'rgba(255,255,255,.82)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    b.fillStyle = g;
    b.fillRect(0, 0, d, d);
    b.globalCompositeOperation = 'source-in';
    b.drawImage(cover, x - c, y - c, d, d, 0, 0, d, d);
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(brush, x - c, y - c);
  }
  function frame() {
    const drawing = pts.length > 0;
    if (drawing) idle = 0;
    else if (++idle > FADE_FRAMES) { halt(); return; }
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = `rgba(0,0,0,${fadeFor(drawing, idle)})`;
    ctx.fillRect(0, 0, W, H);
    if (drawing) { if (img) for (const p of pts) stamp(p.x, p.y); pts = []; }
    if (idle === FADE_FRAMES) { ctx.clearRect(0, 0, W, H); halt(); }
  }
  const halt = () => { if (stop) { stop(); stop = null; } };
  function push(x, y) {
    pts.push(...trailPoints(last, { x, y }, radius));
    last = { x, y };
    if (!stop) stop = ticker.subscribe(frame);
  }
  window.addEventListener('pointermove', (e) => {
    if (!W) return;
    const r = box.getBoundingClientRect();
    const x = (e.clientX - r.left) * dpr, y = (e.clientY - r.top) * dpr;
    if (x < -radius || y < -radius || x > W + radius || y > H + radius) { last = null; return; }
    manual = true;
    push(x, y);
  }, { passive: true });

  function sweep() {
    if (manual || !img) return;
    const r = box.getBoundingClientRect();
    if (r.bottom < 0) return;
    const tall = r.height > r.width, t0 = performance.now(), D = 1800;
    last = null;
    const off = ticker.subscribe((now) => {
      if (manual) { off(); return; }
      const t = Math.min(1, (now - t0) / D);
      const x = tall ? r.width * (0.5 + 0.32 * Math.sin(t * Math.PI * 2.2)) : r.width * (0.4 + 0.52 * t);
      const y = tall ? r.height * (0.12 + 0.62 * t) : r.height * (0.3 + 0.16 * Math.sin(t * Math.PI * 2));
      push(x * dpr, y * dpr);
      if (t >= 1) { off(); last = null; }
    });
  }
  new ResizeObserver(size).observe(box);
  tallMQ.addEventListener?.('change', load);
  load();
  onReady(() => window.setTimeout(sweep, 650));
}
