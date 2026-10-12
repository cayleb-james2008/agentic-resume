/**
 * Selected projects — the reference's paddock block (§L4717–4894): the
 * portrait drifting up over the dark band, the strip's dashed connectors
 * crawling toward the featured project, its marker pulsing, and the bracket
 * around it opening 5 design px on hover.
 */
import { runWhileVisible, scrubTrigger } from '../engine/scroll.js';
import { easings } from '../engine/spring.js';
import { PARALLAX_PORTRAIT, px } from './geometry.js';

const CRAWL_MS = 5200;
const PULSE_MS = 3200;
const PULSE_REACH = 3.4;
const DOT_R = 5.5;
const DASH_PERIOD = 11.45;
const BRACKET_SPREAD = 5;

/** Connectors left of the live card crawl right (+1); those right of it, left (−1). */
export const crawlDirection = (index, live) => (index < live ? 1 : -1);

/** The live marker's ring at eased progress `v`. */
export const pulseAt = (v) => ({ r: DOT_R + v * DOT_R * PULSE_REACH, opacity: 0.5 * (1 - v) * (1 - v) });

export function mount(section) {
  const layer = section.querySelector('[data-figure-layer]');
  if (layer) {
    scrubTrigger(section, {
      start: 'top bottom', end: 'bottom top', from: '0cqw', to: px(-PARALLAX_PORTRAIT),
      apply: (value) => { layer.style.top = value; },
    });
  }

  const strip = section.querySelector('[data-strip]');
  if (!strip) return;
  const cards = [...strip.querySelectorAll('[data-card]')];
  const live = cards.findIndex((card) => card.classList.contains('strip-card--live'));
  const links = [...strip.querySelectorAll('[data-link]')];
  const pulse = strip.querySelector('[data-pulse]');
  const period = px(DASH_PERIOD);

  const liveCard = cards[live];
  if (liveCard) {
    liveCard.addEventListener('pointerenter', () => strip.style.setProperty('--bracket-spread', px(BRACKET_SPREAD)));
    liveCard.addEventListener('pointerleave', () => strip.style.setProperty('--bracket-spread', '0px'));
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  runWhileVisible(strip, (now) => {
    const crawl = (now % CRAWL_MS) / CRAWL_MS;
    links.forEach((link, i) => {
      link.style.backgroundPositionX = `calc(${period} * ${(crawl * crawlDirection(i, live)).toFixed(4)})`;
    });
    if (pulse) {
      const { r, opacity } = pulseAt(easings.easeOutQuad((now % PULSE_MS) / PULSE_MS));
      pulse.setAttribute('r', String(r));
      pulse.setAttribute('opacity', String(opacity));
    }
  });
}
