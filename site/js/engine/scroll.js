/**
 * Scroll triggers (spec §L271–300): positions of an element relative to the
 * viewport turned into a 0–1 progress, and the "loop in view" rule every
 * canvas on the page follows — compute only while visible, plus ten frames.
 */
import { CONFIGS, Spring } from './spring.js';
import { ticker } from './ticker.js';

const TRIGGER_FRAMERATE = 10;
const TAIL_FRAMES = 10;

const clamp01 = (v) => Math.min(Math.max(v, 0), 1);

/** Spec §L278–288, verbatim. `start`/`end` are e.g. "top bottom". */
export function triggerProgress(bb, vh, start, end) {
  const poses = {
    top_top: bb.top,
    center_top: bb.top + bb.height / 2,
    bottom_top: bb.bottom,
    top_bottom: bb.top - vh,
    center_bottom: bb.top + bb.height / 2 - vh,
    bottom_bottom: bb.bottom - vh,
    top_center: bb.top - vh / 2,
    center_center: bb.top + bb.height / 2 - vh / 2,
    bottom_center: bb.bottom - vh / 2,
  };
  const scrollStart = poses[start.replace(' ', '_')];
  const scrollEnd = poses[end.replace(' ', '_')];
  const length = Math.abs(scrollStart - scrollEnd);
  if (length === 0) return scrollStart <= 0 ? 1 : 0;
  return clamp01(1 - (scrollStart + length) / length);
}

const PARTS = /^([a-zA-Z]+\()?\s*(-?\d*\.?\d+)([a-z%]*)\s*(\))?$/;

const format = (value) => String(Number(value.toFixed(4)));

/** Interpolate a number, "<n><unit>", or "fn(<n><unit>)" linearly by p. */
export function interpolate(from, to, p) {
  if (typeof from === 'number' && typeof to === 'number') return from + (to - from) * p;
  const a = String(from).match(PARTS);
  const b = String(to).match(PARTS);
  if (!a || !b) return p < 1 ? from : to;
  const value = Number(a[2]) + (Number(b[2]) - Number(a[2])) * p;
  const unit = a[3] || b[3];
  const fn = a[1] || b[1] || '';
  return `${fn}${format(value)}${unit}${fn ? ')' : ''}`;
}

/**
 * Runs `callback(time)` on the shared ticker only while `el` is in view,
 * plus ten frames after it leaves. Returns a cleanup function.
 */
export function runWhileVisible(el, callback, getFramerate = () => 0) {
  let unsubscribe = null;
  let tail = 0;
  const start = () => {
    tail = TAIL_FRAMES;
    if (!unsubscribe) {
      unsubscribe = ticker.subscribe((time) => {
        callback(time);
        if (!visible && --tail <= 0) stop();
      }, getFramerate);
    }
  };
  const stop = () => {
    unsubscribe?.();
    unsubscribe = null;
  };
  let visible = false;
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start();
  });
  observer.observe(el);
  return () => {
    observer.disconnect();
    stop();
  };
}

/**
 * A scrubbed trigger: `apply(value)` receives `from`→`to` interpolated by the
 * element's progress between `start` and `end`. With `smooth`, the progress
 * first runs through a TRIGGER spring (the reference's interpolatedProgress).
 */
export function scrubTrigger(el, { start, end, from = 0, to = 1, apply, smooth = false }) {
  const spring = smooth ? new Spring({ ...CONFIGS.TRIGGER, precision: 0.0005 }) : null;
  let last = null;
  return runWhileVisible(el, () => {
    const progress = triggerProgress(el.getBoundingClientRect(), window.innerHeight, start, end);
    let p = progress;
    if (spring) {
      spring.set(progress);
      spring.step(16);
      p = spring.value;
    }
    if (p === last) return;
    last = p;
    apply(interpolate(from, to, p), p);
  }, () => (smooth ? 0 : TRIGGER_FRAMERATE));
}

/** Calls `callback(visible, entry)` as `el` enters and leaves the inset viewport. */
export function inView(el, { rootMargin = '0px', once = false } = {}, callback) {
  const observer = new IntersectionObserver(([entry]) => {
    callback(entry.isIntersecting, entry);
    if (once && entry.isIntersecting) observer.disconnect();
  }, { rootMargin });
  observer.observe(el);
  return () => observer.disconnect();
}

export const prefersReducedMotion = () =>
  globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
