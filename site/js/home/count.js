/** The stats panel's count-up, driven by scroll from "top bottom" to "center center". */

/** 0 when the figure's top reaches the viewport bottom, 1 when its centre reaches the viewport centre. */
export function countProgress(top, height, vh) {
  const p = (vh - top) / (vh / 2 + height / 2);
  return Math.max(0, Math.min(1, p));
}

/** "$100/mo" → { prefix: "$", value: 100, suffix: "/mo", comma: false }. */
export function splitFigure(figure) {
  const m = /^(\D*)([\d,]+)(.*)$/.exec(figure);
  return { prefix: m[1], value: Number(m[2].replace(/,/g, '')), suffix: m[3], comma: m[2].includes(',') };
}

export const formatCount = (n, comma) => (comma ? n.toLocaleString('en-US') : String(n));

const THROTTLE_MS = 30;

/** Counts each [data-count] figure up as it scrolls into place; the page already carries the final values. */
export function mount(section, { reduced, lenis }) {
  if (reduced) return;
  const figures = [...section.querySelectorAll('[data-count]')].map((el) => ({ el, ...splitFigure(el.dataset.count), shown: -1 }));
  let last = 0;
  const update = (force) => {
    const now = performance.now();
    if (!force && now - last < THROTTLE_MS) return;
    last = now;
    const vh = window.innerHeight;
    for (const f of figures) {
      const r = f.el.getBoundingClientRect();
      const n = Math.round(countProgress(r.top, r.height, vh) * f.value);
      if (n !== f.shown) { f.shown = n; f.el.textContent = formatCount(n, f.comma); }
    }
  };
  update(true);
  window.addEventListener('scroll', () => update(false), { passive: true });
  lenis?.on('scroll', () => update(false));
}
