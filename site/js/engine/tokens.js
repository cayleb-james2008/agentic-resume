/**
 * Resolves a design token to a concrete colour by bouncing it through a probe
 * element's computed `color` (a custom property read off :root can still be an
 * unsubstituted var() chain).
 */
export function readToken(token) {
  const probe = document.createElement('span');
  probe.style.cssText = `position:absolute;visibility:hidden;color:var(${token})`;
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  return resolved;
}

/** "rgb(2, 210, 227)" / "rgb(2 210 227 / 0.25)" → [r, g, b]. */
export function rgbOf(colour) {
  const parts = colour.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0];
  return parts.slice(0, 3);
}
