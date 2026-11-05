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
import { mountScramble } from './home/scramble.js';

/* Scroll reveals: a block gets .in as it arrives; with motion reduced, or no observer to ask, every
   block is simply in. The CSS half lives in base.css and hides a block only while scripts run. */
function mountReveals(scope, { reduced }) {
  const blocks = scope.querySelectorAll('[data-reveal]');
  if (reduced || !('IntersectionObserver' in window)) {
    blocks.forEach((b) => b.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }
  }, { threshold: 0.1 });
  blocks.forEach((b) => io.observe(b));
}

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
  const eyebrow = document.querySelector('[data-scramble]');
  if (eyebrow) mountScramble(eyebrow, ctx);
  mountReveals(document, ctx);
  // Pages one level down link to index.html#ask: arrive with the field focused. The browser's own jump to the
  // fragment resets focus (its target box is not focusable), so focus the field once that jump is done.
  if (location.hash === '#ask' && ask) {
    const arrive = () => window.setTimeout(() => ask.focus(), 0);
    if (document.readyState === 'complete') arrive();
    else window.addEventListener('load', arrive, { once: true });
  }
  window.__homeBooted = true;
}

boot();
