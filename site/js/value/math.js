/**
 * The value section's sum, on the visitor's own numbers: what mistakes and rework
 * cost them a month, what they spend outside (IT help, unused tools) a month, and
 * how much of that the agents trim. Nothing here touches anyone's hours or pay.
 *
 * Returns the yearly amount back and, given a cost to hire, the multiple of that
 * cost it repays (one decimal). Missing or unreadable inputs give null, never NaN.
 */
const read = (value) => {
  if (value === undefined || value === null || value === '') return NaN;
  const n = typeof value === 'number' ? value : Number(String(value).replace(/[$,%\s]/g, ''));
  return Number.isFinite(n) ? n : NaN;
};
const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

export function valueMath({ mistakes, outside, trim, hire } = {}) {
  const costs = [read(mistakes), read(outside)];
  const share = read(trim);
  if (costs.every(Number.isNaN) || Number.isNaN(share)) return { perYear: null, multiple: null };
  const monthly = costs.reduce((sum, n) => sum + (Number.isNaN(n) ? 0 : Math.max(0, n)), 0);
  const perYear = Math.round(monthly * 12 * (clamp(share, 0, 100) / 100));
  const cost = read(hire);
  const multiple = Number.isNaN(cost) || cost <= 0 ? null : Math.round((perYear / cost) * 10) / 10;
  return { perYear, multiple };
}
