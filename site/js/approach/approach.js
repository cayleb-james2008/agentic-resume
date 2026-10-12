/**
 * "How I work" — the reference's season block (§L2794–2916, §L3117–3569) on
 * our own loop. The loop fills once, clockwise from the start node, in one
 * 6-second lap that brakes through the bends; each station lights and its
 * label appears as the lap reaches it; the head cools; then the cursor
 * becomes a reticle over the dot field.
 */
import { easings, Tween } from '../engine/spring.js';
import { prefersReducedMotion, runWhileVisible } from '../engine/scroll.js';
import { readToken, rgbOf } from '../engine/tokens.js';
import { Halftone } from './dots.js';
import { COOL_MS, LAP_MS, TOTAL, distanceAtTime, makePalette, renderLap } from './lap.js';
import { LOOP_MAP_D, LOOP_MAP_LENGTH, LOOP_MARKERS, LOOP_PATH, LOOP_START } from './loop-path.js';
import {
  CORNER_MARKS, CORNER_MARK_SIZE, DRIFT_MS, GRID_AXES_X, GRID_AXIS_Y, GRID_DASH, GRID_DASH_PERIOD,
  GRID_OVERRUN, GRID_STROKE, HUB, MAP_PLACEMENT, MAP_VIEW, PING_MS, PING_REACH, RINGS, artboardToMap,
} from './map-vector.js';

const SVG = 'http://www.w3.org/2000/svg';
const LAP_THRESHOLD = 0.35;
const SPIN_MS = 10000;
const LABEL_FADE_MS = 400;
const TRACK_PAD = 46;
const PHONE_CENTRE = 0.62;
const LABEL_SIZE = 28;
const LABEL_MIN_PX = 11;

const el = (name, attrs = {}, parent = null) => {
  const node = document.createElementNS(SVG, name);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, String(value));
  parent?.append(node);
  return node;
};

/** The loop's bounding box, padded — what the stage fits below 1024. */
const TRACK_BOX = (() => {
  const xs = LOOP_PATH.map(([x]) => x);
  const ys = LOOP_PATH.map(([, y]) => y);
  const x0 = Math.min(...xs) - TRACK_PAD;
  const x1 = Math.max(...xs) + TRACK_PAD;
  const y0 = Math.min(...ys) - TRACK_PAD;
  const y1 = Math.max(...ys) + TRACK_PAD;
  return { width: x1 - x0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
})();

function buildMap(stage) {
  const svg = el('svg', { viewBox: `0 0 ${MAP_VIEW.width} ${MAP_VIEW.height}`, class: 'approach-svg', 'aria-hidden': 'true', focusable: 'false' });
  const defs = el('defs', {}, svg);
  const mask = el('mask', { id: 'loop-lap-mask', maskUnits: 'userSpaceOnUse', x: -1000, y: -1000, width: 4560, height: 3440 }, defs);
  const lapMask = el('path', {
    d: LOOP_MAP_D, fill: 'none', stroke: 'white', 'stroke-width': 30, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
    'stroke-dasharray': `${LOOP_MAP_LENGTH + 60}`, 'stroke-dashoffset': `${60 + LOOP_MAP_LENGTH}`,
  }, mask);

  const grid = el('g', { class: 'map-grid', fill: 'none', 'stroke-width': GRID_STROKE, 'stroke-dasharray': GRID_DASH }, svg);
  const axes = [
    ...GRID_AXES_X.map((x) => el('line', { x1: x, y1: -GRID_OVERRUN, x2: x, y2: MAP_VIEW.height + GRID_OVERRUN }, grid)),
    el('line', { x1: -GRID_OVERRUN, y1: GRID_AXIS_Y, x2: MAP_VIEW.width + GRID_OVERRUN, y2: GRID_AXIS_Y }, grid),
  ];
  for (const ring of RINGS) {
    el('circle', { cx: HUB.x, cy: HUB.y, r: ring.r, fill: 'none', 'stroke-width': ring.width, class: ring.ghost ? 'map-ghost' : 'map-line' }, svg);
  }
  const ping = el('circle', { cx: HUB.x, cy: HUB.y, r: HUB.r, fill: 'none', class: 'map-ping', 'stroke-width': GRID_STROKE }, svg);
  for (const [x, y] of CORNER_MARKS) {
    el('rect', { x: x - CORNER_MARK_SIZE / 2, y: y - CORNER_MARK_SIZE / 2, width: CORNER_MARK_SIZE, height: CORNER_MARK_SIZE, class: 'map-mark' }, svg);
  }
  el('circle', { cx: HUB.x, cy: HUB.y, r: HUB.r, class: 'map-mark' }, svg);

  // The loop: a white ribbon, and its accent copy uncovered along the lap.
  const ribbon = { d: LOOP_MAP_D, fill: 'none', 'stroke-width': 10, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
  el('path', { ...ribbon, class: 'map-ribbon' }, svg);
  el('path', { ...ribbon, class: 'map-ribbon-lit', mask: 'url(#loop-lap-mask)' }, svg);

  const [sx, sy] = artboardToMap(LOOP_START.x, LOOP_START.y);
  el('rect', { x: sx - 12, y: sy - 12, width: 24, height: 24, class: 'map-mark' }, svg);
  const labels = [];
  for (const marker of LOOP_MARKERS) {
    const [x, y] = artboardToMap(marker.x, marker.y);
    el('circle', { cx: x, cy: y, r: 11, class: 'map-station' }, svg);
    labels.push({ at: marker.d, node: el('text', { x: x + marker.dx, y: y + marker.dy, 'text-anchor': marker.anchor, class: 'map-label', opacity: 0 }, svg), shownAt: null });
    labels.at(-1).node.textContent = marker.label;
  }
  const finish = { at: TOTAL, node: el('text', { x: sx + LOOP_START.dx, y: sy + LOOP_START.dy, 'text-anchor': LOOP_START.anchor, class: 'map-label', opacity: 0 }, svg), shownAt: null };
  finish.node.textContent = LOOP_START.label;
  labels.push(finish);

  stage.querySelector('[data-approach-map]').append(svg);
  return { lapMask, axes, ping, labels };
}

export function mount(section) {
  const frame = section.querySelector('.approach-stage-frame');
  const stage = section.querySelector('[data-approach-stage]');
  const mapBox = stage.querySelector('[data-approach-map]');
  const trace = stage.querySelector('[data-approach-trace]');
  const dotsCanvas = stage.querySelector('[data-approach-dots]');
  const meridian = section.querySelector('[data-meridian]');
  const reduced = prefersReducedMotion();
  const coarse = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  const ratio = coarse ? 1 : Math.min(window.devicePixelRatio || 1, 2);

  Object.assign(mapBox.style, {
    top: `${MAP_PLACEMENT.top}px`, width: `${MAP_PLACEMENT.width}px`, height: `${MAP_PLACEMENT.height}px`,
  });
  const map = buildMap(stage);
  trace.width = 1440 * ratio;
  trace.height = 800 * ratio;
  const context = trace.getContext('2d');
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  const palette = makePalette(rgbOf(readToken('--accent')));
  const halftone = new Halftone(dotsCanvas, { dot: rgbOf(readToken('--map-dot')), accent: palette.accent, maxRatio: coarse ? 1 : 2 });

  const fit = () => {
    const w = frame.clientWidth;
    const h = frame.clientHeight;
    let s, tx, ty;
    if (w >= 1024) {
      s = Math.max(w / 1440, h / 800);
      tx = (w - 1440 * s) / 2;
      ty = (h - 800 * s) / 2;
    } else {
      s = w / TRACK_BOX.width;
      tx = w / 2 - TRACK_BOX.cx * s;
      // On a phone the copy fills the top of the block, so the loop sits lower.
      ty = h * (w < 640 ? PHONE_CENTRE : 0.5) - TRACK_BOX.cy * s;
    }
    stage.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
    // Station labels never drop under 11px on screen, however small the stage.
    const mapUnitsPerPixel = MAP_VIEW.width / MAP_PLACEMENT.width / s;
    stage.style.setProperty('--label-size', `${Math.max(LABEL_SIZE, LABEL_MIN_PX * mapUnitsPerPixel)}px`);
    halftone.bake();
  };
  new ResizeObserver(fit).observe(frame);
  fit();

  // The lap: one pass, never re-run or reversed; then the head cools.
  let lap = 0;
  let heat = 1;
  let lapTween = null;
  let heatTween = null;
  let armed = false;
  const drawLap = (now) => {
    const distance = renderLap(context, lap, heat, palette);
    map.lapMask.setAttribute('stroke-dashoffset', String(60 + (1 - distance / TOTAL) * LOOP_MAP_LENGTH));
    for (const label of map.labels) {
      if (distance >= label.at - 0.01 && label.shownAt === null) label.shownAt = now;
      if (label.shownAt !== null) {
        const t = reduced ? 1 : Math.min(1, (now - label.shownAt) / LABEL_FADE_MS);
        label.node.setAttribute('opacity', String(t));
      }
    }
  };
  const startLap = () => {
    if (lapTween || lap >= 1) return;
    if (reduced) {
      lap = 1;
      heat = 0;
      drawLap(performance.now());
      return;
    }
    lapTween = new Tween({ from: 0, to: 1, duration: LAP_MS, easing: easings.easeInOutSine });
  };
  new IntersectionObserver(([entry]) => { if (entry.isIntersecting) startLap(); }, { threshold: LAP_THRESHOLD }).observe(frame);

  // Everything that loops, on one subscription that pauses off screen.
  let last = null;
  const tick = (now) => {
    const dt = last === null ? 16 : now - last;
    last = now;
    if (lapTween) {
      const moving = lapTween.step(dt);
      lap = lapTween.value;
      if (!moving) {
        lapTween = null;
        heatTween = new Tween({ from: 1, to: 0, duration: COOL_MS, easing: easings.easeOutCubic });
      }
      drawLap(now);
    } else if (heatTween) {
      const moving = heatTween.step(dt);
      heat = heatTween.value;
      drawLap(now);
      if (!moving) {
        heatTween = null;
        armed = !reduced;
      }
    } else if (map.labels.some((l) => l.shownAt !== null && Number(l.node.getAttribute('opacity')) < 1)) {
      drawLap(now);
    }
    if (reduced) return;
    const crawl = ((now % DRIFT_MS) / DRIFT_MS) * GRID_DASH_PERIOD;
    for (const axis of map.axes) axis.setAttribute('stroke-dashoffset', String(-crawl));
    const v = easings.easeOutQuad((now % PING_MS) / PING_MS);
    map.ping.setAttribute('r', String(HUB.r + v * PING_REACH));
    map.ping.setAttribute('opacity', String(0.4 * (1 - v) * (1 - v)));
    if (meridian) {
      const turn = ((now % SPIN_MS) / SPIN_MS) * Math.PI * 2;
      meridian.setAttribute('rx', String(Math.max(0.5, Math.abs(Math.cos(turn)) * 18)));
    }
    halftone.frame(Math.min(0.1, dt / 1000));
  };
  runWhileVisible(section, tick, () => 0);

  // The reticle: mouse only, never under (hover: none) or reduced motion.
  if (!reduced && !window.matchMedia('(hover: none)').matches) {
    window.addEventListener('pointermove', (event) => {
      if (event.pointerType !== 'mouse') return;
      const inside = armed && event.target instanceof Element && Boolean(event.target.closest('[data-approach]'));
      const rect = dotsCanvas.getBoundingClientRect();
      if (!rect.width) return;
      halftone.setTarget(
        ((event.clientX - rect.left) / rect.width) * MAP_VIEW.width,
        ((event.clientY - rect.top) / rect.height) * MAP_VIEW.height,
        inside,
      );
    }, { passive: true });
    const out = () => halftone.setTarget(halftone.target.x, halftone.target.y, false);
    document.addEventListener('pointerleave', out);
    window.addEventListener('blur', out);
  }
}
