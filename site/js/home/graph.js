/** The Ergon team graph's pure parts: where tickets stop, how wires run, which team comes next. */

/** Ticket n stops at the agent (0), the senior agent (1) or a person (2). Most stop at the agent. */
export const ladderStop = (n) => (n % 7 === 0 ? 2 : n % 3 === 0 ? 1 : 0);

/**
 * The SVG path for one wire, in stage coordinates. "cols": a curve from the hub's bottom centre to the
 * card's top centre. "rows" (phones): a bus down from the hub's mark, turning into the target's left edge.
 */
export function wirePath(mode, hub, target, mark) {
  const sy = hub.top + hub.height;
  if (mode === 'rows') {
    const sx = mark.left + mark.width / 2, ex = target.left, ey = target.top + target.height / 2, r = 10;
    return `M${sx},${sy} V${ey - r} Q${sx},${ey} ${sx + r},${ey} H${ex}`;
  }
  const sx = hub.left + hub.width / 2, ex = target.left + target.width / 2, ey = target.top;
  const my = sy + (ey - sy) * 0.5;
  return `M${sx},${sy} C${sx},${my} ${ex},${my} ${ex},${ey}`;
}

export function nextTeam(names, current, delta) {
  const i = names.indexOf(current);
  return names[(i + delta + names.length) % names.length];
}
