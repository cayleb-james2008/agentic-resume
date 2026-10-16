/**
 * Boot (the "Sign-off" look, 2026-10-16): the overlays first (the menu sheet and the composer), then the Ask bar,
 * the work index and Ergon's team graph, then the clicks that tie them together. `window.__homeBooted` is set only
 * after every mount returns; until then the head script's 4s failsafe stands ready to un-hide the page.
 * The hero's entrance needs none of this: the head script starts it.
 */
import { prefersReducedMotion } from './engine/env.js';
import { mount as mountAsk } from './ask/ask.js';
import { mount as mountErgon } from './home/ergon.js';
import { createScrollLock, mountActions, mountMenu, mountModal } from './home/overlays.js';
import { mount as mountWork } from './home/work.js';

function boot() {
  const reduced = prefersReducedMotion();
  const root = document.documentElement;
  const lock = createScrollLock({
    stop: () => { root.style.overflow = 'hidden'; },
    start: () => { root.style.removeProperty('overflow'); },
  });
  const ctx = { lock, reduced };
  const menuEl = document.querySelector('[data-menu]');
  const modalEl = document.querySelector('[data-modal-root]');
  const menu = menuEl ? mountMenu(menuEl, ctx) : null;
  const modal = modalEl ? mountModal(modalEl, ctx) : null;
  const askEl = document.querySelector('[data-ask]');
  const ask = askEl ? mountAsk(askEl, { ...ctx, modal }) : null;
  const index = document.querySelector('[data-index]');
  if (index) mountWork(index, ctx);
  const ergon = document.querySelector('[data-ergon]');
  if (ergon) mountErgon(ergon, ctx);
  mountActions(document, ctx, { menu, modal, ask });
  // Pages one level down link to index.html#ask: arrive with the field focused.
  if (location.hash === '#ask') ask?.focus();
  window.__homeBooted = true;
}

boot();
