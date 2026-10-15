/**
 * Small pure helpers for story.js — what a resize means, how many pixels the
 * water is drawn at, and where a stage point sits as a CSS percentage. No DOM,
 * so node can test them.
 */

/**
 * A height change smaller than this is the phone's address bar showing or
 * hiding (about 50–120px), not a real resize. The runway is laid out in `svh`,
 * which ignores the bar, so the stage keeps its layout through it.
 */
const ADDRESS_BAR = 160;

/** Whether a stage resize from `prev` to `next` ({w, h} in CSS px) should rebuild the layout. */
export const shouldRetune = (prev, next) =>
  !prev || prev.w !== next.w || Math.abs(next.h - prev.h) >= ADDRESS_BAR;

/**
 * The drawing-buffer size for a `w`×`h` CSS-px canvas at pixel ratio `dpr`,
 * never more than `maxPixels` in all: `ratio` is `dpr`, or less when that would
 * overflow the budget. Sizes round down (and the epsilon only absorbs float
 * noise such as 0.29 × 100), so the cap holds: rounding to nearest can land a
 * few thousand pixels over it.
 */
export const renderSize = (w, h, dpr, maxPixels = 3.7e6) => {
  const area = w * h;
  const ratio = area > 0 ? Math.min(dpr, Math.sqrt(maxPixels / area)) : dpr;
  const px = (v) => Math.max(1, Math.floor(v * ratio + 1e-9));
  return { width: px(w), height: px(h), ratio };
};

/**
 * A stage point (origin bottom-left, y 0..1, x 0..aspect) as CSS `left`/`top`
 * percentages of the stage box (origin top-left).
 */
export const toPercent = ({ x, y }, aspect) => ({ left: (x / aspect) * 100, top: (1 - y) * 100 });
