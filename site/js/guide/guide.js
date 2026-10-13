/**
 * The guide (spec 2026-10-12-droplet-agent-guide-design): Cayleb's droplet
 * agent rides along in the corner once the hero is behind the reader, says a
 * line per section, and opens an "Ask my agent" panel. What to say and when is
 * queue.js; this file is the DOM, the springs and the ticker.
 */
import { prefersReducedMotion } from '../engine/scroll.js';
import { CONFIGS, Spring } from '../engine/spring.js';
import { ticker } from '../engine/ticker.js';
import { blinkSquash, nextBlinkDelay } from '../hero/droplet-shape.js';
import { createGuideState, gaze, request, setQuiet, tick } from './queue.js';

const SECTIONS = ['approach', 'experience', 'work', 'contact'];
const QUIET_KEY = 'cayleb-guide-quiet';
/** Scrolled this many viewport heights, the hero is behind the reader. */
export const APPEAR_AFTER = 0.85;
/** How far the droplet lifts to clear the footer's foot row, in px. */
export const FOOT_LIFT = 92;
const BOB_PX = 3;

const quietStore = {
  get() { try { return window.localStorage.getItem(QUIET_KEY) === '1'; } catch { return false; } },
  set(on) { try { window.localStorage.setItem(QUIET_KEY, on ? '1' : '0'); } catch { /* storage blocked */ } },
};

export function mount(root) {
  const agent = root.querySelector('[data-guide-agent]');
  const bubble = root.querySelector('[data-guide-bubble]');
  const panel = root.querySelector('#guide-panel');
  const closeBtn = root.querySelector('[data-guide-close]');
  const quietBtn = root.querySelector('[data-guide-quiet]');
  const eyes = root.querySelector('[data-guide-eyes]');
  const dock = root.querySelector('[data-guide-dock]') || root;
  if (!agent || !bubble || !panel) return;
  const phone = window.matchMedia('(max-width: 639px)');

  const reduced = prefersReducedMotion();
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const lines = {
    greeting: root.dataset.lineGreeting,
    approach: root.dataset.lineApproach,
    experience: root.dataset.lineExperience,
    work: root.dataset.lineWork,
    contact: root.dataset.lineContact,
  };

  const state = createGuideState();
  const enter = new Spring({ ...CONFIGS.ITEM, value: 0, precision: 0.001 });
  const lift = new Spring({ ...CONFIGS.SHEET, value: 0, precision: 0.1 });
  let shown = false;
  let away = true;
  /** On a phone the footer has no room beside its foot row: the droplet steps away instead of lifting. */
  let footAway = false;
  let open = false;
  let pointer = null;
  let activeHeading = null;
  let blinkAt = -1;
  let nextBlink = performance.now() + nextBlinkDelay();

  // --- Quiet -------------------------------------------------------------
  const applyQuiet = (on) => {
    quietBtn.setAttribute('aria-pressed', String(on));
    if (setQuiet(state, on).hide) bubble.hidden = true;
  };
  applyQuiet(quietStore.get());
  quietBtn.addEventListener('click', () => {
    const on = quietBtn.getAttribute('aria-pressed') !== 'true';
    quietStore.set(on);
    applyQuiet(on);
  });

  // --- The panel -----------------------------------------------------------
  const setOpen = (next, { focus = true } = {}) => {
    open = next;
    panel.hidden = !next;
    agent.setAttribute('aria-expanded', String(next));
    if (next) {
      bubble.hidden = true;
      if (focus) panel.querySelector('.guide-q')?.focus();
    } else if (focus) {
      agent.focus();
    }
  };
  agent.addEventListener('click', () => setOpen(!open));
  closeBtn?.addEventListener('click', () => setOpen(false));
  root.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && open) {
      event.stopPropagation();
      setOpen(false);
    }
  });
  document.addEventListener('pointerdown', (event) => {
    if (open && !root.contains(event.target)) setOpen(false, { focus: false });
  });
  for (const q of panel.querySelectorAll('.guide-q')) {
    q.addEventListener('click', () => {
      const expanded = q.getAttribute('aria-expanded') === 'true';
      q.setAttribute('aria-expanded', String(!expanded));
      document.getElementById(q.getAttribute('aria-controls')).hidden = expanded;
    });
  }

  // --- Appearing, sections and the footer ---------------------------------
  // Back up on the hero, the hero's own droplet is on screen: this one steps away.
  const settle = () => {
    const present = !away && !footAway;
    if (!present) {
      if (open) setOpen(false, { focus: false });
      bubble.hidden = true;
    }
    if (reduced) enter.jump(present ? 1 : 0); else enter.set(present ? 1 : 0);
    start();
  };
  const onScroll = () => {
    const past = window.scrollY > window.innerHeight * APPEAR_AFTER;
    if (past === !away) return;
    away = !past;
    if (past && !shown) {
      shown = true;
      root.hidden = false;
      request(state, 'greeting');
    }
    settle();
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  const sectionWatch = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      // A phone has no spare corner: a bubble there sits on the copy. It greets once, then
      // stays a button.
      if (!phone.matches) request(state, entry.target.id);
      activeHeading = entry.target.querySelector('h2') || entry.target;
      start();
    }
  }, { rootMargin: '-35% 0px -35% 0px' });
  for (const id of SECTIONS) {
    const el = document.getElementById(id);
    if (el) sectionWatch.observe(el);
  }

  const contact = document.getElementById('contact');
  if (contact) {
    new IntersectionObserver(([entry]) => {
      const inFooter = entry.intersectionRatio >= 0.55;
      if (phone.matches) {
        if (inFooter !== footAway) { footAway = inFooter; settle(); }
        return;
      }
      const target = inFooter ? -FOOT_LIFT : 0;
      if (reduced) lift.jump(target); else lift.set(target);
      start();
    }, { threshold: [0, 0.55, 1] }).observe(contact);
  }

  if (fine && !reduced) {
    window.addEventListener('pointermove', (event) => { pointer = { x: event.clientX, y: event.clientY }; }, { passive: true });
  }

  // --- The frame loop ------------------------------------------------------
  let unsubscribe = null;
  let last = null;
  const frame = (now) => {
    const dt = last === null ? 16 : now - last;
    last = now;
    const moving = enter.step(dt) | lift.step(dt);

    const step = tick(state, now);
    if (step.hide) bubble.hidden = true;
    if (step.show && lines[step.show] && !open && !away && !footAway) {
      bubble.textContent = lines[step.show];
      bubble.hidden = false;
    }

    const bob = reduced ? 0 : Math.sin(now / 480) * BOB_PX;
    const rise = (1 - enter.value) * 24;
    dock.style.transform = `translate3d(0, ${(rise + lift.value + bob).toFixed(2)}px, 0)`;
    root.style.opacity = String(Math.min(1, Math.max(0, enter.value)));
    root.style.visibility = (away || footAway) && enter.value < 0.02 ? 'hidden' : '';

    if (eyes && !reduced) {
      if (now >= nextBlink) { blinkAt = now; nextBlink = now + nextBlinkDelay(); }
      const box = agent.getBoundingClientRect();
      const cx = box.left + box.width / 2;
      const cy = box.top + box.height * 0.6;
      let target = pointer;
      if (!target && activeHeading) {
        const h = activeHeading.getBoundingClientRect();
        target = { x: h.left + h.width / 2, y: h.top + h.height / 2 };
      }
      const g = target ? gaze(target.x - cx, target.y - cy, 3) : { x: 0, y: 0 };
      const squash = blinkSquash(now - blinkAt);
      eyes.setAttribute('transform', `translate(${g.x.toFixed(2)} ${(g.y + 44 * (1 - squash)).toFixed(2)}) scale(1 ${squash.toFixed(3)})`);
    }

    // Idle: nothing moving, nothing showing or waiting, and no reason to animate the droplet.
    const busy = moving || state.current !== null || state.pending !== null || (state.greeting && !state.said.has('greeting'));
    if ((!busy && reduced) || ((away || footAway) && !moving)) stop();
  };
  const start = () => {
    if (!shown || unsubscribe) return;
    last = null;
    unsubscribe = ticker.subscribe(frame, () => (fine ? 0 : 1000 / 30));
  };
  const stop = () => { unsubscribe?.(); unsubscribe = null; };

  // Off-screen tab: rest.
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else start(); });
  onScroll();
}
