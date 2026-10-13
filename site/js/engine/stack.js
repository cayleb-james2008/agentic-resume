/**
 * The sticky stack (spec §L301–332): each pinned block recedes — scale 0.9,
 * 55% black — as the next one comes over it. The transform lives on the
 * inner wrapper, never on the sticky element.
 */
const RECEDE_SCALE = 0.9;
const RECEDE_SHADE = 0.55;

/** Spec §L309–327, verbatim, as a pure function of the next layer's top. */
export function recede(nextTop, view, phone) {
  const shrink = phone ? 0 : 1 - RECEDE_SCALE;
  // 0 while the next block is still a full screen away, 1 once it has taken the whole viewport.
  const p = Math.min(1, Math.max(0, 1 - nextTop / (view || 1)));
  // No transform at rest: a scale(1) would make the layer the containing block
  // for the hero's position:fixed loader.
  const moving = p > 0 && shrink > 0;
  return {
    transform: moving ? `scale(${1 - shrink * p})` : '',
    willChange: moving ? 'transform' : '',
    shade: RECEDE_SHADE * p,
    visible: p < 1,
  };
}

export function initStack(root) {
  const layers = [...root.querySelectorAll('[data-stack-layer]')];
  const pinned = layers.map((layer) => ({
    inner: layer.querySelector('[data-stack-inner]'),
    shade: layer.querySelector('[data-stack-shade]'),
    next: layer.nextElementSibling,
  })).filter((p) => p.next);
  const phone = window.matchMedia('(max-width: 639px)');
  let frame = 0;
  const apply = () => {
    frame = 0;
    const view = window.innerHeight || 1;
    for (const { inner, shade, next } of pinned) {
      const state = recede(next.getBoundingClientRect().top, view, phone.matches);
      inner.style.transform = state.transform;
      inner.style.willChange = state.willChange;
      shade.style.opacity = String(state.shade);
      // Opacity, not visibility: a covered layer drops out of sight but not out of the
      // accessibility tree, so the hero's h1 is still there for a screen reader further down.
      inner.style.opacity = state.visible ? '' : '0';
    }
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(apply); };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  apply();
  return () => {
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', schedule);
    if (frame) cancelAnimationFrame(frame);
  };
}
