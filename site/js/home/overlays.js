/** The menu and the request modal. The scroll lock is counted so stacked overlays release it once. */

import { composeMail, validate } from './mail.js';

export function createScrollLock({ stop, start }) {
  let count = 0;
  return {
    lock() { if (count++ === 0) stop(); },
    unlock() { if (count === 0) return; if (--count === 0) start(); },
    get count() { return count; },
  };
}


const CLOSE_MS = 380;
const FOCUSABLE = 'a[href], button:not([disabled]), input, textarea, [tabindex]:not([tabindex="-1"])';

/** Keeps Tab inside an open overlay. */
function trap(container, e) {
  if (e.key !== 'Tab') return;
  const items = [...container.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
  if (!items.length) return;
  const first = items[0], last = items[items.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

/** One overlay: shown from `hidden`, faded in, scroll locked, focus trapped, Escape closes, focus handed back. */
export function overlay(el, { lock, reduced, focus, onOpen, onClose }) {
  let back = null, open = false;
  const key = (e) => { if (e.key === 'Escape') close(); else trap(el, e); };
  function show() {
    if (open) return;
    open = true;
    back = document.activeElement;
    el.hidden = false;
    void el.offsetWidth;
    el.classList.add('open');
    lock.lock();
    document.addEventListener('keydown', key);
    onOpen?.();
    (focus?.() || el.querySelector('button'))?.focus({ preventScroll: true });
  }
  function close(then) {
    if (!open) return;
    open = false;
    el.classList.remove('open');
    el.classList.add('closing');
    document.removeEventListener('keydown', key);
    window.setTimeout(() => {
      el.hidden = true;
      el.classList.remove('closing');
      lock.unlock();
      onClose?.();
      // Focus goes home first, so an overlay opened next (menu → Contact) records the real opener.
      back?.focus?.({ preventScroll: true });
      if (typeof then === 'function') then();
    }, reduced ? 0 : CLOSE_MS);
  }
  return { show, close, get open() { return open; } };
}

/** Copies text, falling back to a selected textarea; resolves to whether it worked. */
export async function copyText(value) {
  try { await navigator.clipboard.writeText(value); return true; } catch { /* fall back */ }
  const ta = document.createElement('textarea');
  ta.value = value;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.left = '-9999px';
  document.body.append(ta);
  ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch { ok = false; }
  ta.remove();
  return ok;
}

export function mountMenu(menuEl, ctx) {
  const button = document.getElementById('menu-btn');
  const menu = overlay(menuEl, {
    ...ctx,
    focus: () => menuEl.querySelector('[data-menu-close]'),
    onOpen: () => button?.setAttribute('aria-expanded', 'true'),
    onClose: () => button?.setAttribute('aria-expanded', 'false'),
  });
  button?.addEventListener('click', () => menu.show());
  return menu;
}

/** The request composer: validates in place, writes a mailto, then shows the address and a Copy button. */
export function mountModal(root, ctx) {
  const form = root.querySelector('[data-md-form]');
  const wrap = root.querySelector('[data-md-form-wrap]');
  const done = root.querySelector('[data-md-done]');
  const doneTitle = root.querySelector('[data-md-done-title]');
  const topicLabel = root.querySelector('[data-md-topic]');
  const copy = root.querySelector('[data-md-copy]');
  const raw = root.querySelector('[data-md-raw]');
  const fields = { name: form.elements.name, email: form.elements.email, msg: form.elements.msg };
  const d = root.dataset;
  let topic = '', mail = null;
  const reset = () => {
    form.reset();
    fields.msg.placeholder = d.defaultPh;
    for (const k of Object.keys(fields)) { fields[k].removeAttribute('aria-invalid'); root.querySelector(`#e-${k}`).hidden = true; }
    wrap.hidden = false;
    done.hidden = true;
    raw.hidden = true;
    copy.textContent = copy.dataset.label || copy.textContent;
  };
  copy.dataset.label = copy.textContent;
  const modal = overlay(root, {
    ...ctx,
    focus: () => (done.hidden ? fields.name : doneTitle),
    // A draft the visitor dismissed stays for when they come back; only a written email clears the form.
    onClose: () => { if (!done.hidden) window.setTimeout(reset, 300); },
  });
  root.addEventListener('click', (e) => { if (e.target === root) modal.close(); });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const values = Object.fromEntries(Object.entries(fields).map(([k, el]) => [k, el.value]));
    const bad = validate(values);
    for (const k of Object.keys(fields)) {
      root.querySelector(`#e-${k}`).hidden = !bad[k];
      if (bad[k]) fields[k].setAttribute('aria-invalid', 'true');
      else fields[k].removeAttribute('aria-invalid');
    }
    const first = Object.keys(bad).find((k) => bad[k]);
    if (first) { fields[first].focus(); return; }
    mail = composeMail({ ...values, topic: topic === d.otherTopic ? '' : topic }, d.email);
    const a = document.createElement('a');
    a.href = mail.href;
    a.rel = 'noopener';
    try { a.click(); } catch { /* the Copy button covers it */ }
    wrap.hidden = true;
    done.hidden = false;
    doneTitle.focus({ preventScroll: true });
  });
  copy.addEventListener('click', async () => {
    if (!mail) return;
    if (await copyText(mail.text)) { copy.textContent = copy.dataset.copied; return; }
    // Neither clipboard path worked: show the message itself, selected, so a long-press or Ctrl+C takes it.
    copy.textContent = copy.dataset.failed;
    raw.value = mail.text;
    raw.hidden = false;
    raw.focus({ preventScroll: true });
    raw.select();
  });
  return {
    open(t = '') {
      topic = t;
      topicLabel.textContent = t ? `${d.topicPrefix}${t}` : d.eyebrow;
      if (t) fields.msg.placeholder = t === d.otherTopic ? d.otherPh : d.topicPh.replace('{topic}', t.toLowerCase());
      modal.show();
    },
    close: () => modal.close(),
    get isOpen() { return modal.open; },
  };
}

/** After an in-page jump: the next Tab starts from the section, and its address is in the URL, as a native link would leave it. */
export function land(target, id, hist = window.history) {
  if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
  hist.pushState(null, '', `#${id}`);
}

/** Every [data-go] scrolls to its section, every [data-modal] opens the composer, every [data-copy] copies. */
export function mountActions(doc, { lenis, reduced }, { menu, modal }) {
  const go = (id) => {
    const target = document.getElementById(id);
    if (!target) return;
    if (lenis) lenis.scrollTo(target, { duration: 1.2 });
    else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    land(target, id);
  };
  doc.addEventListener('click', async (e) => {
    const t = e.target.closest('[data-go], [data-modal], [data-menu-close], [data-modal-close], [data-copy]');
    if (!t) return;
    if (t.matches('[data-copy]')) {
      const label = t.querySelector('span');
      const ok = await copyText(t.dataset.copy);
      label.textContent = ok ? t.dataset.copied : t.dataset.failed;
      window.setTimeout(() => { label.textContent = t.dataset.label || label.textContent; }, 1800);
      return;
    }
    e.preventDefault();
    if (t.matches('[data-menu-close]')) { menu?.close(); return; }
    if (t.matches('[data-modal-close]')) { modal?.close(); return; }
    const run = t.matches('[data-modal]') ? () => modal?.open(t.dataset.modal || '') : () => go(t.dataset.go);
    if (menu?.open) menu.close(run);
    else run();
  });
  doc.querySelectorAll('[data-copy]').forEach((b) => { b.dataset.label = b.querySelector('span').textContent; });
}
