/**
 * The water story's mount: scroll progress in, and out to the page each tick —
 * the name's flight to the masthead, the captions, the overlay labels and the
 * water itself (water.js). Every value comes from timeline.js as a function of
 * progress alone, so scrolling back plays the same frames in reverse.
 *
 * three.js comes in through a dynamic import, so nothing on the page waits for
 * it to parse. If it does not load, there is no WebGL, the shader does not
 * build, the context is lost, or motion is turned off (reduced motion, the
 * failsafe), the story turns static: `.story--static` takes the runway away,
 * every inline style this module wrote is taken back, and the masthead shows.
 *
 * Input only ever adds ripples. Every pointer, touch and orientation listener
 * is passive, so a swipe over the water always scrolls the page.
 *
 * Called as `mount(section, { lenis })` like every block, but it needs no Lenis
 * handle: it reads the scroll from layout each tick, and Lenis, first on the
 * shared ticker, has already moved it by then.
 */
import { prefersReducedMotion, runWhileVisible, triggerProgress } from '../engine/scroll.js';
import { readToken } from '../engine/tokens.js';
import { createRipple, rippleSize } from './ripple.js';
import { layoutFor, overlaysFor } from './shapes.js';
import { getStoryTier } from './tier.js';
import { storyState } from './timeline.js';
import { RIPPLE_START_OWED, RIPPLE_STEP_MS, nudgeInside, shouldRetune, stepsFor, toPercent } from './view.js';

/** The water's colours, read off the page so they always match it. */
const COLOR_TOKENS = { ink: '--raw-color-ink-900', deep: '--raw-color-ink-950', rim: '--raw-color-cyan-400', bg: '--raw-color-ice-50' };

/**
 * The ripple runs on its own 120Hz clock (view.js `stepsFor`). After a pause
 * it catches up at most this many steps instead of all at once.
 */
const MAX_STEPS = 4;
/** Below this the surface is still: no need to draw it again. */
const STILL = 1e-4;
/** A change in lean smaller than this (about 0.2°) is sensor noise. */
const TILT_NOISE = 0.005;

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
/** A number for a style string: four places, never an exponent, never "-0". */
const fmt = (v) => String(Math.round(v * 1e4) / 1e4 || 0);

/**
 * The point an overlay item sits on, from overlaysFor. Items are matched by
 * `data-index`: shape labels, team people and ticket gates by number; the
 * worth beat's 0 is the price and 1 the "more" mark; a team item with
 * `data-index="source"` sits on the node the channels branch from, a tickets
 * item with `data-index="source"` on the person the tickets come from, and
 * one with `data-index="check"` on the first gate, where most of them stop.
 */
export const pointOf = (o, beat, key) => {
  const i = Number(key);
  if (beat === 'shape') return o.shape[i];
  if (beat === 'team') return key === 'source' ? o.source : o.team[i];
  if (beat === 'tickets') return key === 'source' ? o.tickets.source : key === 'check' ? o.tickets.check : o.tickets.gates[i];
  if (beat === 'worth') return [o.worth.price, o.worth.more][i];
  return undefined;
};

export function mount(section) {
  const noop = () => {};
  if (prefersReducedMotion()) return noop;   // the CSS has already kept the runway off
  const root = document.documentElement;
  if (root.classList.contains('reveal-failsafe')) return noop;   // so has the failsafe

  const stage = section.querySelector('[data-story-stage]');
  const canvas = section.querySelector('canvas[data-water]');
  const name = section.querySelector('[data-story-name]');
  const cue = section.querySelector('[data-story-cue]');
  const captions = [...section.querySelectorAll('[data-caption]')];
  const overlays = [...section.querySelectorAll('[data-overlay]')];
  const shapeLabels = [...section.querySelectorAll('[data-overlay="shape"] [data-overlay-item]')];
  const masthead = document.querySelector('[data-masthead]');

  // Every inline style written, so going static can take each one back.
  const written = new Map();
  const put = (el, prop, value) => {
    let props = written.get(el);
    if (!props) written.set(el, (props = {}));
    if (props[prop] === value) return;
    props[prop] = value;
    el.style[prop] = value;
  };

  let stop = noop;   // tears the running story down, once there is one
  let ended = false;

  /** No motion after all: the static story, as if the runway had never been. */
  const toStatic = () => {
    if (ended) return;
    ended = true;
    stop();
    section.classList.add('story--static');
    for (const [el, props] of written) for (const prop of Object.keys(props)) el.style[prop] = '';
    written.clear();
    if (masthead) masthead.style.opacity = '1';
  };

  if (!stage || !canvas) {
    toStatic();
    return noop;
  }

  let tier = getStoryTier();

  const start = async () => {
    let water;
    try {
      const { Water } = await import('./water.js');
      if (ended) return;
      const colors = Object.fromEntries(Object.entries(COLOR_TOKENS).map(([key, token]) => [key, readToken(token)]));
      water = new Water(canvas, { tier, colors });
    } catch {
      toStatic();   // no three.js, no WebGL2, or a shader that did not build
      return;
    }

    let size = null;
    let layout, ripple, bytes;
    let force = true;              // draw the next frame whatever changed
    let lastProgress = null;
    let clock = null;
    let owed = RIPPLE_START_OWED;  // ripple time not yet stepped, in ms: half a step in, so frames step evenly
    let rippled = true;            // the ripple has changed since its bytes were taken
    const tilt = [0, 0];
    let drawnTilt = 0;

    /**
     * The labels sit on the water's nodes: placed once per layout, from the same maths. One that would still
     * run off the stage (a price chip on a phone) is brought back to the gutter the masthead keeps, so every
     * label is measured, and placed again once the fonts it is set in have loaded.
     */
    const placeOverlays = () => {
      const { w } = size;
      const aspect = layout.aspect;
      const o = overlaysFor(layout);
      const placed = [];
      for (const group of overlays) {
        for (const item of group.querySelectorAll('[data-overlay-item]')) {
          const point = pointOf(o, group.dataset.overlay, item.dataset.index);
          if (!point) {
            put(item, 'visibility', 'hidden');   // e.g. people five and six in a phone's team of four
            continue;
          }
          const { left, top } = toPercent(point, aspect);
          put(item, 'left', `${fmt(left)}%`);
          put(item, 'top', `${fmt(top)}%`);
          put(item, 'visibility', '');
          placed.push([item, left]);
        }
      }
      const gutter = masthead ? parseFloat(getComputedStyle(masthead).paddingLeft) || 0 : 16;
      const box = stage.getBoundingClientRect();
      for (const [item, left] of placed) {
        let lo = Infinity, hi = -Infinity;
        for (const el of [item, ...item.children]) {
          const r = el.getBoundingClientRect();
          if (r.width > 0) { lo = Math.min(lo, r.left - box.left); hi = Math.max(hi, r.right - box.left); }
        }
        const dx = lo < hi ? nudgeInside(lo, hi, w, gutter) : 0;
        if (dx) put(item, 'left', `${fmt(left + (dx / w) * 100)}%`);
      }
    };

    /** Lay everything out again for a stage of w×h CSS px. */
    const retune = (w, h) => {
      size = { w, h };
      tier = getStoryTier();
      const aspect = w / h;
      layout = layoutFor(aspect, tier.teamSize);
      ripple = createRipple(...rippleSize(aspect, tier.rippleLong));
      bytes = new Uint8Array(ripple.cols * ripple.rows);
      rippled = true;
      placeOverlays();

      water.tier = tier;
      water.resize(w, h, window.devicePixelRatio || 1);
      force = true;
    };

    const writePage = (s) => {
      if (name) {
        // name.y is up-positive in stage heights; CSS y runs down.
        put(name, 'transform', `translate3d(0, ${fmt(-s.name.y * 100)}svh, 0) scale(${fmt(s.name.scale)})`);
        put(name, 'letterSpacing', `${fmt(s.name.spread)}em`);
        put(name, 'opacity', fmt(s.name.opacity));
      }
      // The cue's own opacity belongs to the reveal engine (its fade-in, played
      // again whenever the story scrolls back into view), so the scroll fade
      // multiplies with it through filter instead of fighting over one value.
      if (cue) put(cue, 'filter', s.cue >= 1 ? '' : `opacity(${fmt(s.cue)})`);
      if (masthead) {
        // Tabbing into the masthead during the intro shows it, so focus is never invisible.
        const shown = masthead.matches(':focus-within') ? 1 : s.masthead;
        put(masthead, 'opacity', fmt(shown));
        put(masthead, 'pointerEvents', shown < 0.5 ? 'none' : '');
      }
      for (const el of captions) {
        const o = s.captions[el.dataset.caption] ?? 0;
        put(el, 'opacity', fmt(o));
        put(el, 'transform', `translateY(${fmt((1 - o) * 0.75)}rem)`);
      }
      for (const el of overlays) {
        put(el, 'opacity', fmt(s.overlays[el.dataset.overlay] ?? 0));
        put(el, 'pointerEvents', 'none');
      }
      // The three shape labels sit in a row under one silhouette at a time: the one the water holds is full.
      if (s.shapeIndex !== null) for (const el of shapeLabels) put(el, 'opacity', Number(el.dataset.index) === s.shapeIndex ? '1' : '0.4');
    };

    /**
     * One frame. Only the ticker's own frames (`tick`) advance the ripple
     * clock: a frame drawn out of turn (on resize, or as the stage leaves
     * view) would shift where the clock sits between steps.
     */
    const draw = (time, tick) => {
      const progress = triggerProgress(section.getBoundingClientRect(), window.innerHeight, 'top top', 'bottom bottom');
      const s = storyState(progress, layout);

      if (!tier.freeze) {
        // The drop lands: one splash, going forward only.
        if (lastProgress !== null && lastProgress < s.splashAt && progress >= s.splashAt) {
          ripple.poke(0.5, 0.1, 0.9, 4);
          rippled = true;
        }
        if (tick) {
          const due = stepsFor(owed, clock === null ? 0 : time - clock, RIPPLE_STEP_MS, MAX_STEPS);
          owed = due.owed;
          for (let i = 0; i < due.steps; i++) ripple.step();
          if (due.steps) rippled = true;
        }
      }
      if (tick) clock = time;

      writePage(s);

      const flow = tier.freeze ? 0 : s.flow;
      const moving = rippled && ripple.energy() > STILL;
      const leaned = Math.abs(tilt[0] - drawnTilt) > TILT_NOISE;
      if (force || progress !== lastProgress || moving || flow > 0 || leaned) {
        if (rippled) ripple.toBytes(bytes);
        rippled = false;
        drawnTilt = tilt[0];
        water.render({ slots: s.slots, flow, time, ripple: bytes, rippleSize: [ripple.cols, ripple.rows], tilt });
        force = false;
      }
      lastProgress = progress;
    };

    /**
     * A frame: the ticker's (`tick` true), or one drawn out of turn. A failure
     * here turns the story static rather than leave a blank runway.
     */
    const frame = (time, tick = true) => {
      if (ended) return;
      if (root.classList.contains('reveal-failsafe')) {
        toStatic();
        return;
      }
      try {
        draw(time, tick);
      } catch (error) {
        toStatic();
        console.error(error);
      }
    };

    // --- input: ripples only, never a blocked scroll --------------------------

    // A frozen tier steps no ripple, so a poke there would be a dent that never settles.
    const pokeAt = (event, strength) => {
      if (tier.freeze) return;
      const r = stage.getBoundingClientRect();
      const u = (event.clientX - r.left) / r.width;
      const v = 1 - (event.clientY - r.top) / r.height;
      if (!(u >= 0 && u <= 1 && v >= 0 && v <= 1)) return;
      ripple.poke(u, v, strength);
      rippled = true;
    };

    let last = null;
    const onPointerMove = (event) => {
      if (!tier.pointerEnabled || tier.freeze) return;
      if (last) {
        const dt = Math.max(1, event.timeStamp - last.t);
        const speed = (Math.hypot(event.clientX - last.x, event.clientY - last.y) / dt) * 1000;   // px/s
        pokeAt(event, Math.min(0.6, speed * 0.002));
      }
      last = { x: event.clientX, y: event.clientY, t: event.timeStamp };
    };
    const onPointerDown = (event) => {
      if (tier.freeze) return;
      pokeAt(event, 0.8);
    };
    // Tilt only where it needs no permission prompt (Android); iOS is never asked.
    const tiltFree = typeof DeviceOrientationEvent !== 'undefined'
      && typeof DeviceOrientationEvent.requestPermission !== 'function';
    const onTilt = (event) => {
      if (tier.freeze || typeof event.gamma !== 'number') return;
      tilt[0] = clamp(event.gamma / 45, -1, 1);
    };
    // Reduced motion switched on mid-visit: the CSS drops the runway, so must this.
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotion = () => {
      if (motion.matches) toStatic();
    };

    // --- size: the address bar never retunes, a real resize does -------------

    const measure = () => ({ w: stage.clientWidth || window.innerWidth, h: stage.clientHeight || window.innerHeight });
    const resizer = new ResizeObserver(() => {
      if (ended) return;
      const next = measure();
      if (next.w === size.w && next.h === size.h) return;
      // Only a touch screen has an address bar; a mouse-driven window keeps its exact shape.
      if (tier.coarsePointer && !shouldRetune(size, next)) return;
      try {
        retune(next.w, next.h);
      } catch (error) {
        toStatic();
        console.error(error);
        return;
      }
      frame(performance.now(), false);   // the resize cleared the canvas: fill it before it is shown
    });

    // The loop runs while the stage is in view. Out of view (the résumé, or a
    // deep link straight to it), one frame leaves the story's end state behind
    // with the masthead shown.
    const offscreen = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) frame(performance.now(), false);
    });

    let stopLoop = noop;
    stop = () => {
      stopLoop();
      resizer.disconnect();
      offscreen.disconnect();
      section.removeEventListener('pointermove', onPointerMove);
      section.removeEventListener('pointerdown', onPointerDown);
      if (tiltFree) window.removeEventListener('deviceorientation', onTilt);
      motion.removeEventListener('change', onMotion);
      water.dispose();
    };
    water.onLost = toStatic;

    try {
      const initial = measure();
      retune(initial.w, initial.h);
    } catch (error) {
      toStatic();
      console.error(error);
      return;
    }
    document.fonts?.ready.then(() => {
      if (!ended) placeOverlays();
    });
    section.addEventListener('pointermove', onPointerMove, { passive: true });
    section.addEventListener('pointerdown', onPointerDown, { passive: true });
    if (tiltFree) window.addEventListener('deviceorientation', onTilt, { passive: true });
    motion.addEventListener('change', onMotion, { passive: true });
    resizer.observe(stage);
    offscreen.observe(stage);
    stopLoop = runWhileVisible(stage, frame, () => tier.frameInterval);
    frame(performance.now(), false);
  };

  start();
  return () => {
    ended = true;
    stop();
  };
}
