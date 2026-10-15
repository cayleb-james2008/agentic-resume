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
 * The ripple's own clock: a fixed 120Hz step, which is two steps per 60Hz
 * frame and one per 120Hz frame, so a fast screen does not run the water fast.
 */
export const RIPPLE_STEP_MS = 1000 / 120;

/**
 * The clock starts half a step in, and that is the point of it. Frames arrive
 * a whole number of steps apart give or take a little jitter, so whatever is
 * left over after the first frame stays where it started. Starting at 0 puts
 * that leftover right on a step boundary, where jitter tips each frame one way
 * or the other: 1, 2 or 3 steps at 60Hz, 0 or 2 at 120Hz, and the ripple
 * fronts stutter. Half a step in is as far from both boundaries as it gets.
 */
export const RIPPLE_START_OWED = RIPPLE_STEP_MS / 2;

/**
 * How many ripple steps a frame `dtMs` after the last one takes, given the
 * time still `owedMs` from before. It returns the steps and what is owed after
 * them. A long gap (the loop paused off screen) catches up at most `maxSteps`
 * and goes back to the half-step start, so the frames after it run steady.
 */
export const stepsFor = (owedMs, dtMs, stepMs, maxSteps = Infinity) => {
  const total = owedMs + Math.max(0, dtMs);
  const steps = Math.floor(total / stepMs);
  if (steps > maxSteps) return { steps: maxSteps, owed: stepMs / 2 };
  return { steps, owed: total - steps * stepMs };
};

/**
 * A stage point (origin bottom-left, y 0..1, x 0..aspect) as CSS `left`/`top`
 * percentages of the stage box (origin top-left).
 */
export const toPercent = ({ x, y }, aspect) => ({ left: (x / aspect) * 100, top: (1 - y) * 100 });
