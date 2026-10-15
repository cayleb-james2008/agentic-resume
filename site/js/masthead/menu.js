/**
 * The full-screen menu sheet below 1280 (spec §L372–395). Appended to <body>,
 * never inside the masthead: the masthead is fixed and fades in with the story,
 * and the sheet must neither fade with it nor be pinned inside it.
 */
import { prefersReducedMotion } from '../engine/scroll.js';
import { CONFIGS, Spring } from '../engine/spring.js';
import { ticker } from '../engine/ticker.js';

const ITEM_BASE = 120;
const ITEM_STEP = 55;

function buildSheet(header) {
  const sheet = document.createElement('div');
  sheet.className = 'menu-sheet';
  sheet.id = 'menu-sheet';
  sheet.hidden = true;
  sheet.setAttribute('role', 'dialog');
  sheet.setAttribute('aria-modal', 'true');
  sheet.setAttribute('aria-label', 'Menu');
  const wordmark = header.querySelector('.wordmark').cloneNode(true);
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'menu-close';
  close.setAttribute('aria-label', 'Close menu');
  close.append(document.createElement('span'), document.createElement('span'));
  const top = document.createElement('div');
  top.className = 'menu-top';
  top.append(wordmark, close);
  const nav = document.createElement('nav');
  nav.className = 'menu-nav';
  nav.setAttribute('aria-label', 'Menu');
  const list = document.createElement('ul');
  const links = [...header.querySelectorAll('.masthead-nav a'), header.querySelector('.masthead-action')];
  for (const source of links) {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = source.getAttribute('href');
    link.textContent = source.textContent.replace(/[[\]→]/g, '').trim();
    item.append(link);
    list.append(item);
  }
  nav.append(list);
  sheet.append(top, nav);
  document.body.append(sheet);
  return { sheet, close, wordmark, items: [...list.children] };
}

export function mountMenu(header, { lenis = null } = {}) {
  const burger = header.querySelector('[data-burger]');
  if (!burger) return () => {};
  const { sheet, close, wordmark, items } = buildSheet(header);
  const fade = new Spring({ ...CONFIGS.SHEET, precision: 0.001 });
  const rises = items.map(() => new Spring({ ...CONFIGS.ITEM, precision: 0.001 }));
  let open = false;
  let openedAt = 0;
  let unsubscribe = null;

  let last = null;
  const draw = (time) => {
    const dt = last === null || !Number.isFinite(time) ? 16 : time - last;
    last = Number.isFinite(time) ? time : null;
    const elapsed = time - openedAt;
    let moving = fade.step(dt);
    sheet.style.opacity = String(fade.value);
    rises.forEach((spring, i) => {
      if (!open || elapsed >= ITEM_BASE + i * ITEM_STEP) moving = spring.step(dt) || moving;
      else moving = true;
      items[i].style.opacity = String(spring.value);
      items[i].style.transform = `translateY(${((1 - spring.value) * 0.75).toFixed(4)}rem)`;
    });
    if (!moving) {
      unsubscribe?.();
      unsubscribe = null;
      last = null;
      if (!open) finishClose();
    }
  };
  const run = () => {
    if (prefersReducedMotion()) {
      fade.jump(fade.target);
      rises.forEach((s) => s.jump(s.target));
      draw(Infinity);
      return;
    }
    if (!unsubscribe) unsubscribe = ticker.subscribe(draw, () => 0);
  };

  const onKey = (event) => {
    if (event.key === 'Escape') setOpen(false);
    if (event.key !== 'Tab') return;
    const focusable = [wordmark, close, ...sheet.querySelectorAll('.menu-nav a')];
    const index = focusable.indexOf(document.activeElement);
    if (event.shiftKey && index <= 0) { event.preventDefault(); focusable.at(-1).focus(); }
    if (!event.shiftKey && index === focusable.length - 1) { event.preventDefault(); focusable[0].focus(); }
  };

  const finishClose = () => {
    sheet.hidden = true;
    document.documentElement.classList.remove('menu-open');
    lenis?.start();
  };

  function setOpen(next) {
    if (next === open) return;
    open = next;
    burger.setAttribute('aria-expanded', String(open));
    if (open) {
      sheet.hidden = false;
      openedAt = performance.now();
      fade.set(1);
      rises.forEach((s) => s.set(1));
      document.documentElement.classList.add('menu-open');
      lenis?.stop();
      document.addEventListener('keydown', onKey);
      close.focus();
    } else {
      fade.set(0);
      rises.forEach((s) => s.set(0));
      document.removeEventListener('keydown', onKey);
      burger.focus();
    }
    run();
  }

  burger.addEventListener('click', () => setOpen(true));
  close.addEventListener('click', () => setOpen(false));
  wordmark.addEventListener('click', () => setOpen(false));
  sheet.querySelectorAll('.menu-nav a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  const wide = window.matchMedia('(min-width: 1280px)');
  wide.addEventListener('change', () => { if (wide.matches) setOpen(false); });
  return () => setOpen(false);
}
