/**
 * Text reveals: headings rise line by line out of a clip, the About statement word by word. Words are
 * grouped into lines by their measured top at the moment they reveal, so the stagger follows the real wrap.
 */

/** A line index per word: words whose tops sit within `tolerance` px share a line. */
export function lineIndexes(tops, tolerance = 4) {
  let line = -1, top = null;
  return tops.map((y) => {
    if (top === null || Math.abs(y - top) > tolerance) { line++; top = y; }
    return line;
  });
}

/** Splits a heading's text nodes into word spans (kept inline, so the line wraps as before). */
function wrapWords(node) {
  for (const child of [...node.childNodes]) {
    if (child.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment();
      for (const part of child.textContent.split(/(\s+)/)) {
        if (!part) continue;
        if (/^\s+$/.test(part)) { frag.append(document.createTextNode(' ')); continue; }
        const outer = document.createElement('span');
        outer.className = 'wo';
        const inner = document.createElement('span');
        inner.className = 'wi';
        inner.textContent = part;
        outer.append(inner);
        frag.append(outer);
      }
      child.replaceWith(frag);
    } else if (child.nodeType === Node.ELEMENT_NODE) wrapWords(child);
  }
}

function stagger(el) {
  const words = [...el.querySelectorAll('.wo')];
  const lines = lineIndexes(words.map((w) => w.offsetTop));
  const step = Number(el.dataset.stagger || 0);
  words.forEach((w, i) => w.firstElementChild.style.setProperty('--ld', `${lines[i] * step}ms`));
}

/**
 * Every [data-rv] block, [data-lines] heading and [data-words] statement reveals once, as it enters the
 * viewport; the hero's wait for the intro to finish (`onReady`), and so does the masthead. With motion
 * reduced, or without IntersectionObserver, everything is simply shown.
 */
export function mount(root, { onReady, reduced }) {
  root.querySelectorAll('[data-lines]').forEach(wrapWords);
  root.querySelectorAll('[data-words]').forEach((el) => {
    wrapWords(el);
    el.querySelectorAll('.wi').forEach((w, i) => w.style.setProperty('--wd', `${i * 35}ms`));
  });
  const all = [...root.querySelectorAll('[data-rv], [data-lines], [data-words]')];
  const masthead = root.querySelector('[data-masthead]');
  const show = (el) => {
    if (el.matches('[data-lines]')) stagger(el);
    el.classList.add('in');
  };
  if (reduced || !('IntersectionObserver' in window)) {
    all.forEach((el) => el.classList.add('in'));
    masthead?.classList.add('in');
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { show(e.target); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
  for (const el of all) {
    if (el.closest('.hero')) onReady(() => show(el));
    else io.observe(el);
  }
  onReady(() => masthead?.classList.add('in'));
}
