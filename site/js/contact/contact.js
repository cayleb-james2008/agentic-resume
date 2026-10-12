/**
 * Contact footer — the reference's sign-off (§L5275–5476). The figure is
 * displaced 60 design px when the footer first appears and rides back into
 * place as the page reaches its end: the window closes at `bottom bottom`, so
 * the frame a reader comes to rest on is the design's own.
 */
import { scrubTrigger } from '../engine/scroll.js';
import { PARALLAX_FIGURE, px } from './geometry.js';

export const FIGURE_WINDOW = Object.freeze({
  start: 'top bottom', end: 'bottom bottom', from: px(PARALLAX_FIGURE), to: '0cqw',
});

export function mount(section) {
  const layer = section.querySelector('[data-figure-layer]');
  if (!layer) return;
  scrubTrigger(section, {
    ...FIGURE_WINDOW,
    apply: (value) => { layer.style.top = value; },
  });
}
