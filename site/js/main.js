/**
 * Boot (the 2026-10-15 layout): Lenis on the shared ticker first, so every reader sees this frame's scroll;
 * then the root size and the clock; then each block's mount; then the reveals; and the loader last, since it
 * opens the page. `window.__homeBooted` is set only after every mount returns; until then the head script's
 * 4s failsafe stands ready to un-hide the page.
 */
import Lenis from 'lenis';
import { prefersReducedMotion } from './engine/scroll.js';
import { ticker } from './engine/ticker.js';
import { mount as mountGuide } from './guide/guide.js';
import { mount as mountCarousel } from './home/carousel.js';
import { mount as mountClock } from './home/clock.js';
import { mount as mountCount } from './home/count.js';
import { mount as mountErgon } from './home/ergon.js';
import { mount as mountGrid } from './home/grid.js';
import { mount as mountLiquid } from './home/liquid.js';
import { mount as mountLoader } from './home/loader.js';
import { createScrollLock, mountActions, mountMenu, mountModal } from './home/overlays.js';
import { mount as mountReveal } from './home/reveal.js';

/** Each block's mount, in page order. */
const MOUNTS = [
  ['[data-liquid]', mountLiquid],
  ['[data-carousel]', mountCarousel],
  ['[data-ergon]', mountErgon],
  ['#stats', mountCount],
];

function startLenis(reduced) {
  if (reduced) return null;
  // No `anchors`: it would scroll on Ctrl/Cmd-clicks too; mountActions scrolls plain clicks on [data-go].
  const lenis = new Lenis({ smoothWheel: true });
  ticker.subscribe((time) => lenis.raf(time), () => 0);
  return lenis;
}

/** Callbacks queued until the intro has finished, then run at once for anyone who asks later. */
function readiness() {
  let ready = false;
  const queue = [];
  return {
    on: (fn) => (ready ? fn() : queue.push(fn)),
    fire: () => {
      if (ready) return;
      ready = true;
      document.documentElement.classList.add('is-ready');
      queue.splice(0).forEach((fn) => fn());
    },
  };
}

function boot() {
  const reduced = prefersReducedMotion();
  const root = document.documentElement;
  const lenis = startLenis(reduced);
  window.__lenis = lenis;
  const lock = createScrollLock({
    stop: () => { lenis?.stop(); root.style.overflow = 'hidden'; },
    start: () => { lenis?.start(); root.style.removeProperty('overflow'); },
  });
  const ready = readiness();
  const ctx = { lenis, lock, reduced, onReady: ready.on };
  mountGrid();
  mountClock();
  for (const [selector, mount] of MOUNTS) {
    const el = document.querySelector(selector);
    if (el) mount(el, ctx);
  }
  const menuEl = document.querySelector('[data-menu]');
  const modalEl = document.querySelector('[data-modal-root]');
  const menu = menuEl ? mountMenu(menuEl, ctx) : null;
  const modal = modalEl ? mountModal(modalEl, ctx) : null;
  mountActions(document, ctx, { menu, modal });
  const guide = document.querySelector('[data-guide]');
  if (guide) mountGuide(guide, { ...ctx, onModal: () => modal?.open() });
  mountReveal(document.body, ctx);
  mountLoader(document.querySelector('[data-loader]'), { ...ctx, onDone: ready.fire });
  window.__homeBooted = true;
}

boot();
