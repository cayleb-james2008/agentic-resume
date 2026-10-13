/**
 * Keeps a station label on screen. Each label hangs off its station on one
 * side (text-anchor start or end) or sits centred over it. Below 1024 the loop
 * is fitted edge to edge, so a hanging label can run past the frame — "Build"
 * did on a phone. It moves to the station's other side instead; a centred
 * label slides in.
 *
 * Every length is in screen px: `at` is the station, `dx` the label's offset
 * from it, `width` the label's rendered width, and [lo, hi] the visible span.
 * Returns where the label's anchor goes and which anchor it uses.
 */
export function placeLabel({ at, dx, anchor, width }, lo, hi) {
  if (anchor === 'start' && at + dx + width > hi) return { x: at - dx, anchor: 'end' };
  if (anchor === 'end' && at + dx - width < lo) return { x: at - dx, anchor: 'start' };
  if (anchor === 'middle') return { x: Math.min(Math.max(at + dx, lo + width / 2), hi - width / 2), anchor };
  return { x: at + dx, anchor };
}
