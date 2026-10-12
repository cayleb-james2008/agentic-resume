/**
 * Work experience — the reference's timeline (§L4339–4434): a rail with a
 * progress thread and a square marker that turns five times, rows on three
 * parallax layers, years that assemble and settle, and a hover that dims
 * every other row (CSS).
 */
import { inView, scrubTrigger } from '../engine/scroll.js';
import { CONFIGS, Spring } from '../engine/spring.js';
import { ticker } from '../engine/ticker.js';
import {
  MARK_SIZE, MARK_SIZE_NARROW, NARROW_UNDER, PARALLAX, RAIL_DASH, RAIL_GAP, RAIL_SOLID, RAIL_START,
  px, railHeight, restingPoint,
} from './geometry.js';

const SVG = 'http://www.w3.org/2000/svg';
const YEAR_RESTING = 0.4;
const YEAR_HOLD = 2200;
const TURNS = 5;

/**
 * The rail's own units are design pixels, measured from where the rail
 * starts. Returns the SVG's height and where the thread comes to rest.
 */
export function railLayout({ sectionWidth, railTop, railHeightPx, entries }) {
  const unitsPerPx = 1440 / sectionWidth;
  const origin = railTop * unitsPerPx;
  return {
    viewH: railHeightPx * unitsPerPx,
    rest: restingPoint(entries) * railHeight(entries) + RAIL_START - origin,
  };
}

/** Centre rows' years settle back to 40% after their hold; side rows stay. */
export const yearOpacityAfter = (frame) => (frame === 'centre' ? YEAR_RESTING : 1);

const svgEl = (name, attrs, parent) => {
  const node = document.createElementNS(SVG, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, String(v));
  parent?.append(node);
  return node;
};

function mountRail(section, rail, entries) {
  const svg = svgEl('svg', { preserveAspectRatio: 'xMidYMin meet', 'aria-hidden': 'true', focusable: 'false' }, rail);
  const solid = svgEl('line', { x1: 8, x2: 8, y1: 0, y2: RAIL_SOLID, class: 'rail-track' }, svg);
  const dashed = svgEl('line', { x1: 8, x2: 8, y1: RAIL_SOLID + RAIL_GAP, class: 'rail-track', 'stroke-dasharray': `${RAIL_DASH} ${RAIL_DASH}` }, svg);
  const thread = svgEl('rect', { x: 7.5, y: 0, width: 1, height: 0, class: 'rail-thread' }, svg);
  const marker = svgEl('rect', { class: 'rail-marker' }, svg);
  let layout = { viewH: 1, rest: 1 };
  let run = 0;
  const draw = () => {
    thread.setAttribute('height', String(run));
    marker.setAttribute('transform', `translate(8 ${run}) rotate(${(run / layout.rest) * 360 * TURNS})`);
  };
  const measure = () => {
    if (!rail.clientHeight) return;
    layout = railLayout({
      sectionWidth: section.clientWidth,
      railTop: rail.offsetTop,
      railHeightPx: rail.clientHeight,
      entries,
    });
    svg.setAttribute('viewBox', `0 0 16 ${layout.viewH}`);
    dashed.setAttribute('y2', String(Math.max(RAIL_SOLID + RAIL_GAP, layout.rest)));
    solid.setAttribute('y2', String(Math.min(RAIL_SOLID, layout.rest)));
    const size = section.clientWidth < NARROW_UNDER ? MARK_SIZE_NARROW : MARK_SIZE;
    for (const [k, v] of Object.entries({ x: -size / 2, y: -size / 2, width: size, height: size })) marker.setAttribute(k, String(v));
    draw();
  };
  new ResizeObserver(measure).observe(section);
  measure();
  scrubTrigger(rail, {
    start: 'top center', end: 'bottom bottom', smooth: true,
    apply: (_, p) => { run = p * layout.rest; draw(); },
  });
}

function settleYear(row) {
  const figure = row.querySelector('.row-year-figure');
  if (!figure) return;
  const spring = new Spring({ ...CONFIGS.YEAR_SETTLE, value: 1, precision: 0.001 });
  spring.set(YEAR_RESTING);
  setTimeout(() => {
    let last = null;
    const unsubscribe = ticker.subscribe((time) => {
      const dt = last === null ? 16 : time - last;
      last = time;
      const moving = spring.step(dt);
      figure.style.opacity = String(spring.value);
      if (!moving) unsubscribe();
    }, () => 0);
  }, YEAR_HOLD);
}

export function mount(section) {
  const rows = [...section.querySelectorAll('[data-row]')];
  const entries = rows.map((row) => ({ frame: row.dataset.frame }));
  const rail = section.querySelector('[data-rail]');
  if (rail) mountRail(section, rail, entries);

  for (const row of rows) {
    const frame = row.dataset.frame;
    const plateTravel = PARALLAX.plate[frame];
    for (const layer of row.querySelectorAll('[data-layer]')) {
      const travel = layer.dataset.layer === 'copy' ? PARALLAX.copy : plateTravel;
      scrubTrigger(row, {
        start: 'top bottom', end: 'bottom top', from: px(travel), to: px(-travel),
        apply: (value) => { layer.style.top = value; },
      });
    }
    const slot = row.querySelector('[data-plate-slot]');
    if (slot) {
      scrubTrigger(row, {
        start: 'top bottom', end: 'top center', from: '-10%', to: '0%',
        apply: (value) => { slot.style.top = value; },
      });
    }
    if (yearOpacityAfter(frame) < 1) {
      inView(row, { rootMargin: '0% 0% -25% 0%', once: true }, (visible) => { if (visible) settleYear(row); });
    }
  }
}
