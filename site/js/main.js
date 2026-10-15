/**
 * Boot: Lenis on the shared ticker first (so every reader sees this frame's
 * scrollY), then the menu, the reveals, and each block's mount: the water
 * story, then the guide. `window.__homeBooted` is set only after every mount
 * returns; until then the head script's 4s failsafe stands ready to un-hide
 * the page.
 */
import Lenis from 'lenis';
import { mountReveals } from './engine/reveal.js';
import { prefersReducedMotion } from './engine/scroll.js';
import { ticker } from './engine/ticker.js';
import { mount as mountGuide } from './guide/guide.js';
import { mountMenu } from './masthead/menu.js';
import { mount as mountStory } from './story/story.js';

/** Each block's mount, in page order. */
const MOUNTS = [
  ['[data-story]', mountStory],
  ['[data-guide]', mountGuide],
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
  const header = document.querySelector('[data-masthead]');
  if (header) mountMenu(header, { lenis });
  mountReveals(document.body);
  for (const [selector, mount] of MOUNTS) {
    const el = document.querySelector(selector);
    if (el) mount(el, { lenis });
  }
  window.__homeBooted = true;
}

boot();
