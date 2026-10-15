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
