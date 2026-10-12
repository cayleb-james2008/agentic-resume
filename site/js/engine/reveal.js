/**
 * The text engine and block entrances (spec §L244–277).
 *
 * The page is built with every animated run already split into
 * `.reveal-unit` spans (scripts/home/markup.py), so this module only moves
 * what exists. Four kinds of animatable, all springs from 0 to 1:
 *
 *   .reveal[data-reveal]  units rise {0, 0.35em} (words) / {0, 0.3em} (letters)
 *   [data-rise]           block rises from data-from (default translateY(0.75rem))
 *   [data-fade]           opacity only
 *   [data-grow]           scaleX from the left edge
 *
 * Each carries data-delay (ms after its scope arrives); reveals also carry
 * data-stagger, data-config and data-mode (once | forward | always).
 */
import { inView, interpolate, prefersReducedMotion } from './scroll.js';
import { CONFIGS, Spring } from './spring.js';
import { ticker } from './ticker.js';

export const SELECTOR = '.reveal[data-reveal], [data-rise], [data-fade], [data-grow]';

/** Words, each a list of units — mirrors split_units() in markup.py. */
export function splitUnits(text, unit) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return unit === 'word' ? words.map((w) => [w]) : words.map((w) => Array.from(w));
}

export const delayFor = (index, delayIn, stagger) => delayIn + index * stagger;

// --- the scheduler: every running spring on one ticker subscription -------

const running = new Set();
const jobs = new WeakMap();
let unsubscribe = null;
let lastTime = null;

const tick = (time) => {
  const dt = lastTime === null ? 16 : time - lastTime;
  lastTime = time;
  for (const job of [...running]) {
    if (time < job.startAt) continue;
    const moving = job.spring.step(dt);
    job.apply(job.spring.value);
    if (!moving) running.delete(job);
  }
  if (running.size === 0) {
    unsubscribe?.();
    unsubscribe = null;
    lastTime = null;
  }
};

const now = () => globalThis.performance?.now() ?? 0;

function drive(key, target, delay, config, apply) {
  let job = jobs.get(key);
  if (!job) {
    job = { spring: new Spring({ ...CONFIGS[config] ?? CONFIGS.REVEAL, precision: 0.001 }), apply, startAt: 0 };
    jobs.set(key, job);
  }
  job.spring.set(target);
  job.startAt = now() + delay;
  if (prefersReducedMotion()) {
    job.spring.jump(target);
    apply(target);
    return;
  }
  running.add(job);
  if (!unsubscribe) unsubscribe = ticker.subscribe(tick, () => 0);
}


// --- how each kind draws its 0–1 value ------------------------------------

const styleUnit = (unit, offset) => (p) => {
  unit.style.opacity = String(p);
  unit.style.transform = p >= 1 ? 'none' : `translateY(${((1 - p) * offset).toFixed(4)}em)`;
};

const styleRise = (el) => {
  const from = el.dataset.from || 'translateY(0.75rem)';
  const to = from.replace(/-?\d*\.?\d+/, '0');
  return (p) => {
    el.style.opacity = String(p);
    el.style.transform = p >= 1 ? 'none' : interpolate(from, to, p);
  };
};

const styleFade = (el) => (p) => { el.style.opacity = String(p); };
const styleGrow = (el) => (p) => { el.style.transform = `scaleX(${p})`; };

/** Animate one animatable in (`target` 1) or out (0), `base` ms late. */
export function animate(el, target, base = 0) {
  const delay = base + Number(el.dataset.delay || 0);
  if (el.matches('.reveal[data-reveal]')) {
    const letter = el.dataset.reveal === 'letter';
    const stagger = Number(el.dataset.stagger || 0);
    const config = el.dataset.config || 'REVEAL';
    const units = el.querySelectorAll('.reveal-unit');
    units.forEach((unit, i) => {
      drive(unit, target, delayFor(i, delay, target ? stagger : 0), config, styleUnit(unit, letter ? 0.3 : 0.35));
    });
    return;
  }
  const config = el.dataset.config || 'REVEAL';
  const apply = el.hasAttribute('data-rise') ? styleRise(el)
    : el.hasAttribute('data-grow') ? styleGrow(el) : styleFade(el);
  drive(el, target, target ? delay : 0, config, apply);
}

/** Every animatable inside `root` (including root itself). */
export const animatables = (root) =>
  [...(root.matches?.(SELECTOR) ? [root] : []), ...root.querySelectorAll(SELECTOR)];

export function playIn(elements, base = 0) {
  for (const el of elements) animate(el, 1, base);
}

export function playOut(elements) {
  for (const el of elements) animate(el, 0);
}

/**
 * Wires every animatable below `root` to the scope it belongs to: a timeline
 * row, the project strip, or its section. Scopes inside `skip` (the hero,
 * whose entrance waits for the loader) are left to their own module.
 */
export function mountReveals(root, { skip = '[data-hero]' } = {}) {
  const scopes = new Map();
  for (const el of root.querySelectorAll(SELECTOR)) {
    if (skip && el.closest(skip)) continue;
    const gate = el.dataset.gate ? el.closest(`[data-${el.dataset.gate}]`) : null;
    const scope = gate || el.closest('[data-row]') || el.closest('section') || root;
    if (!scopes.has(scope)) scopes.set(scope, []);
    scopes.get(scope).push(el);
  }
  const cleanups = [];
  for (const [scope, elements] of scopes) {
    const margin = scope.matches('[data-row]') ? '0% 0% -25% 0%'
      : scope.matches('[data-strip]') ? '0% 0% -20% 0%' : '0% 0% -15% 0%';
    const played = new WeakSet();
    cleanups.push(inView(scope, { rootMargin: margin }, (visible, entry) => {
      for (const el of elements) {
        const mode = el.dataset.mode || 'forward';
        if (visible) {
          if (mode === 'once' && played.has(el)) continue;
          played.add(el);
          animate(el, 1);
        } else if (mode === 'always' || (mode === 'forward' && entry.boundingClientRect.top > 0)) {
          animate(el, 0);
        }
      }
    }));
  }
  return () => cleanups.forEach((fn) => fn());
}
