/** The intro loader: a terminal boot that counts 000 → 100, then slides up and opens the page. */

import { ticker } from '../engine/ticker.js';
export const FILL_MS = 1300;

export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** The counter as the loader shows it, zero-padded to three digits. */
export const counterLabel = (p) => String(p).padStart(3, '0');

/** Plays only on a first visit in this tab, with motion allowed and no deep link to land on. */
export const shouldPlay = ({ reduced, hash, seen }) => !reduced && !hash && !seen;


const SEEN_KEY = 'cayleb-intro-seen';
const EXIT_MS = 1100;

const seenBefore = () => { try { return sessionStorage.getItem(SEEN_KEY) === '1'; } catch { return false; } };
const markSeen = () => { try { sessionStorage.setItem(SEEN_KEY, '1'); } catch { /* private mode: it plays again */ } };

/**
 * Counts to 100 with the boot lines appearing as it passes them, slides up, and only then opens the page
 * (`onDone`). Scroll stays locked while it plays. When it should not play, it goes at once.
 */
export function mount(el, { lock, onDone, reduced }) {
  const failsafe = document.documentElement.classList.contains('reveal-failsafe');
  if (!el || failsafe || !shouldPlay({ reduced, hash: location.hash, seen: seenBefore() })) {
    el?.remove();
    onDone();
    return;
  }
  lock.lock();
  const fill = el.querySelector('[data-ld-fill]');
  const num = el.querySelector('[data-ld-num]');
  const lines = [...el.querySelectorAll('[data-at]')];
  const t0 = performance.now();
  const stop = ticker.subscribe((now) => {
    const t = Math.min(1, (now - t0) / FILL_MS);
    const p = Math.round(easeInOutCubic(t) * 100);
    fill.style.width = `${p}%`;
    num.textContent = counterLabel(p);
    lines.forEach((line) => line.classList.toggle('on', p >= Number(line.dataset.at)));
    if (t >= 1) { stop(); window.setTimeout(exit, 140); }
  });
  function exit() {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      el.remove();
      lock.unlock();
      markSeen();
      onDone();
    };
    el.addEventListener('transitionend', (e) => { if (e.target === el) finish(); });
    el.classList.add('out');
    window.setTimeout(finish, EXIT_MS);
  }
}
