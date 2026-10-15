/**
 * The hero's liquid reveal: the pointer paints the blueprint layer over the surface layer with a soft
 * brush that decays. The constants are the reference's; the maths below is pure and tested.
 */
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
