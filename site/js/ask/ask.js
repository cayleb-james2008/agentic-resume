/**
 * The Ask bar in the hero. A visitor types a question (or taps a suggestion); match.js finds the written answer
 * it means, and the answer streams in under the question it was matched to, with where it comes from. When no
 * written answer fits, it says so and offers the closest questions and a way to ask Cayleb directly.
 *
 * Without the script the page shows every question and answer as a plain list (ask.py); this only adds the field.
 * No layout shift while an answer streams: a hidden copy of the full answer sizes the box on the keypress, and
 * the sources are in place from the start, fading in when the text is done.
 */
import { ask as decideFor, buildIndex } from './match.js';
import { TICK_MS, typeStep } from './stream.js';

const EDITABLE = 'input, textarea, select, [contenteditable=""], [contenteditable="true"]';

function anchor({ label, href }) {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = label;
  if (href.startsWith('#')) a.dataset.go = href.slice(1);
  else if (href.startsWith('mailto:')) a.dataset.modal = '';
  else if (/^https?:/.test(href)) { a.target = '_blank'; a.rel = 'noopener'; }
  else if (href.endsWith('.pdf')) a.setAttribute('download', '');
  return a;
}

export function mount(root, { reduced, modal }) {
  const data = JSON.parse(root.querySelector('[data-ask-data]').textContent);
  const items = data.questions;
  const index = buildIndex(items);
  const chips = items.map((q, i) => (q.chip ? i : -1)).filter((i) => i >= 0);
  const form = root.querySelector('[data-ask-form]');
  const input = form.querySelector('input');
  const chipBox = root.querySelector('[data-ask-chips]');
  const answer = root.querySelector('[data-ask-answer]');
  const matched = answer.querySelector('[data-ask-matched]');
  const body = answer.querySelector('[data-ask-body]');
  const after = answer.querySelector('[data-ask-after]');
  const said = root.querySelector('[data-ask-said]');
  const all = root.querySelector('.ask-all');
  let streaming = null;

  form.hidden = false;
  chipBox.hidden = false;
  all.open = false;

  /** The live region hears the whole answer once; the streamed copy beside it is hidden from it. */
  function announce(text) {
    said.textContent = '';
    window.requestAnimationFrame(() => { said.textContent = text; });
  }

  function stream(text, { onDone } = {}) {
    streaming?.cancel();
    const ghost = document.createElement('span');
    ghost.className = 'ask-ghost';
    ghost.textContent = text;
    const typed = document.createElement('span');
    typed.className = 'ask-typed';
    typed.setAttribute('aria-hidden', 'true');
    body.replaceChildren(ghost, typed);
    let tick = 0, timer = 0;
    const finish = () => {
      window.clearInterval(timer);
      typed.textContent = text;
      typed.classList.add('done');
      // Whole now: the text joins the page for anyone reading it later (the live region has already said it
      // once), and the sizing copy goes; the box keeps its size.
      typed.removeAttribute('aria-hidden');
      ghost.remove();
      streaming = null;
      onDone?.();
    };
    if (reduced) { finish(); return; }
    timer = window.setInterval(() => {
      typed.textContent = typeStep(text, tick++);
      if (typed.textContent.length >= text.length) finish();
    }, TICK_MS);
    // A new question cancels the old stream without revealing what belonged to it.
    streaming = { finish, cancel: () => { window.clearInterval(timer); streaming = null; } };
  }

  /** The sources and actions sit in place from the start (so nothing moves), out of reach until the text is done. */
  function reveal(nodes) {
    after.replaceChildren(...nodes);
    after.inert = true;
    after.classList.remove('in');
    return () => {
      after.inert = false;
      after.classList.add('in');
    };
  }

  function show(i) {
    const item = items[i];
    answer.hidden = false;
    answer.classList.remove('fallback');
    matched.textContent = item.q;
    const rows = [];
    if (item.sources?.length) {
      const p = document.createElement('p');
      p.className = 'ask-sources';
      const label = document.createElement('span');
      label.textContent = data.sourcesLabel;
      p.append(label, ...item.sources.map(anchor));
      rows.push(p);
    }
    if (item.links?.length) {
      const p = document.createElement('p');
      p.className = 'ask-links';
      p.append(...item.links.map((l) => Object.assign(anchor(l), { className: 'btn btn--ghost' })));
      rows.push(p);
    }
    const done = reveal(rows);
    stream(item.a, { onDone: done });
    announce(`${item.q} ${item.a}`);
  }

  function fallback(query, suggestions) {
    answer.hidden = false;
    answer.classList.add('fallback');
    matched.textContent = query;
    const list = document.createElement('p');
    list.className = 'ask-suggest';
    for (const i of suggestions) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'ask-chip';
      b.textContent = items[i].q;
      // The answer replaces this button, so focus moves to the field first rather than falling to the page.
      b.addEventListener('click', () => { input.value = items[i].q; input.focus({ preventScroll: true }); show(i); });
      list.append(b);
    }
    const direct = anchor({ label: data.fallbackContact, href: '#contact' });
    direct.className = 'btn btn--ghost';
    direct.removeAttribute('data-go');
    direct.addEventListener('click', (e) => {
      if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      e.stopPropagation();
      modal?.draft(query);
    });
    const done = reveal([list, direct]);
    stream(data.fallback, { onDone: done });
    announce(`${data.fallback} ${suggestions.map((i) => items[i].q).join(', ')}`);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    const d = decideFor(index, query, chips);
    if (d.kind === 'empty') { input.focus(); return; }
    if (d.kind === 'answer') show(d.i);
    else fallback(query, d.suggestions);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (streaming) streaming.finish();
    else if (input.value) input.value = '';
    else return;
    e.preventDefault();
  });
  chipBox.addEventListener('click', (e) => {
    const b = e.target.closest('[data-q]');
    if (!b) return;
    input.value = items[Number(b.dataset.q)].q;
    show(Number(b.dataset.q));
  });

  /** Bring the field into view and focus it. Keyboard and the shortcut jump; a pointer click may glide. */
  function focusField(smooth) {
    const r = form.getBoundingClientRect();
    const covered = document.querySelector('[data-masthead]')?.getBoundingClientRect().bottom ?? 0;
    if (r.top < covered || r.bottom > window.innerHeight) {
      form.scrollIntoView({ block: 'center', behavior: smooth && !reduced ? 'smooth' : 'auto' });
    }
    input.focus({ preventScroll: true });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
    if (e.target.closest?.(EDITABLE) || document.querySelector('[role="dialog"][aria-modal="true"]:not([hidden])')) return;
    e.preventDefault();
    focusField(false);
  });
  // The masthead's Ask link (data-go="ask") lands here through overlays.js mountActions.
  return { focus: (smooth = false) => focusField(smooth) };
}
