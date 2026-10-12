/**
 * Boot: Lenis on the shared ticker first (so every reader sees this frame's
 * scrollY), then the sticky stack, the menu, and each block's mount.
 * `window.__homeBooted` is set only after every mount returns; until then the
 * head script's 4s failsafe stands ready to un-hide the page.
 */
import Lenis from 'lenis';
import { mountContours } from './engine/contours.js';
import { mountDissolve } from './engine/dissolve.js';
import { mountReveals } from './engine/reveal.js';
import { prefersReducedMotion } from './engine/scroll.js';
import { initStack } from './engine/stack.js';
import { ticker } from './engine/ticker.js';
import { mount as mountApproach } from './approach/approach.js';
import { mount as mountHero } from './hero/hero.js';
import { mountMenu } from './hero/menu.js';

/** Each block's mount, added as the block is built. */
const MOUNTS = [
  ['[data-hero]', mountHero],
  ['[data-approach]', mountApproach],
];

function sizeRoot() {
  const root = document.documentElement;
  root.style.fontSize = window.innerWidth > 1920 ? `${(16 * window.innerWidth) / 1920}px` : '';
}

function startLenis() {
  if (prefersReducedMotion()) return null;
  const lenis = new Lenis({ smoothWheel: true, anchors: true });
  ticker.subscribe((time) => lenis.raf(time), () => 0);
  return lenis;
}

function boot() {
  const lenis = startLenis();
  window.__lenis = lenis;
  sizeRoot();
  window.addEventListener('resize', sizeRoot);
  const stack = document.querySelector('[data-stack]');
  if (stack) initStack(stack);
  const header = document.querySelector('[data-masthead]');
  if (header) mountMenu(header, { lenis });
  mountReveals(document.body);
  document.querySelectorAll('canvas[data-seam]').forEach((band) => mountDissolve(band, band.dataset.seam));
  document.querySelectorAll('canvas[data-contours]').forEach((canvas) => mountContours(canvas, canvas.dataset.contours));
  for (const [selector, mount] of MOUNTS) {
    const el = document.querySelector(selector);
    if (el) mount(el, { lenis });
  }
  window.__homeBooted = true;
}

boot();
