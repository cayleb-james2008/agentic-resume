/**
 * One 6-second pass of the loop when the block arrives — spec §L3117–3269,
 * verbatim, on our loop instead of the race circuit and without the flag cut.
 * The lap slows through the bends and runs away down the straights: pacing
 * lives in the path's own curvature.
 */
import { LOOP_MARKERS, LOOP_PATH, LOOP_STEP } from './loop-path.js';

export const LAP_MS = 6000;
export const COOL_MS = 800;
const LINE_WIDTH = 5.9;
const GLOW_WIDTH = 15;
const HEAD_UNITS = 210;
const MARKER_POP_UNITS = 90;
const CORNER_BRAKE = 9;

const PATH = LOOP_PATH;

export const CUMULATIVE = PATH.reduce((acc, point, index) => {
  if (index === 0) return [0];
  const previous = PATH[index - 1];
  acc.push(acc[index - 1] + Math.hypot(point[0] - previous[0], point[1] - previous[1]));
  return acc;
}, []);

/** Measured from the points themselves — a rounded constant would reopen the seam. */
export const TOTAL = CUMULATIVE[CUMULATIVE.length - 1];

const TIME_AT = (() => {
  const count = PATH.length;
  const turn = new Array(count).fill(0);
  for (let i = 1; i < count - 1; i += 1) {
    const [ax, ay] = PATH[i - 1];
    const [bx, by] = PATH[i];
    const [cx, cy] = PATH[i + 1];
    const ux = bx - ax, uy = by - ay, vx = cx - bx, vy = cy - by;
    const lengths = (Math.hypot(ux, uy) || 1) * (Math.hypot(vx, vy) || 1);
    turn[i] = Math.acos(Math.min(1, Math.max(-1, (ux * vx + uy * vy) / lengths)));
  }
  const window = 6;
  const smoothed = turn.map((_, i) => {
    let sum = 0;
    let n = 0;
    for (let j = Math.max(0, i - window); j <= Math.min(count - 1, i + window); j += 1) {
      sum += turn[j];
      n += 1;
    }
    return sum / n;
  });
  const accumulated = [0];
  for (let i = 1; i < count; i += 1) {
    const span = CUMULATIVE[i] - CUMULATIVE[i - 1];
    const speed = 1 / (1 + CORNER_BRAKE * smoothed[i]);
    accumulated.push(accumulated[i - 1] + span / speed);
  }
  const total = accumulated[count - 1] || 1;
  return accumulated.map((value) => value / total);
})();

export const distanceAtTime = (time) => {
  if (time <= 0) return 0;
  if (time >= 1) return TOTAL;
  let low = 0;
  let high = TIME_AT.length - 1;
  while (low < high - 1) {
    const mid = (low + high) >> 1;
    if (TIME_AT[mid] <= time) low = mid;
    else high = mid;
  }
  const span = TIME_AT[high] - TIME_AT[low] || 1;
  const ratio = (time - TIME_AT[low]) / span;
  return CUMULATIVE[low] + (CUMULATIVE[high] - CUMULATIVE[low]) * ratio;
};

/** Points up to a distance, plus the partial segment. */
export const trailUpTo = (distance) => {
  const out = [];
  for (let i = 0; i < PATH.length; i += 1) {
    if (CUMULATIVE[i] <= distance) {
      out.push(PATH[i]);
      continue;
    }
    const a = PATH[i - 1];
    const b = PATH[i];
    const ratio = (distance - CUMULATIVE[i - 1]) / (CUMULATIVE[i] - CUMULATIVE[i - 1]);
    out.push([a[0] + (b[0] - a[0]) * ratio, a[1] + (b[1] - a[1]) * ratio]);
    break;
  }
  return out;
};

export const mix = (a, b, t) => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
];

/** accent from the token, white, and the light accent between them. */
export const makePalette = (accent) => {
  const white = [255, 255, 255];
  return { accent, white, bright: mix(accent, white, 0.55) };
};

const rgba = ([r, g, b], alpha) => `rgb(${r} ${g} ${b} / ${alpha})`;

const stroke = (context, points, scale, from = 0) => {
  context.beginPath();
  context.moveTo(points[from][0] * scale, points[from][1] * scale);
  for (let i = from + 1; i < points.length; i += 1) context.lineTo(points[i][0] * scale, points[i][1] * scale);
  context.stroke();
};

const drawTrail = (context, points, scale, minWidth, glow, heat, palette) => {
  if (points.length < 2) return;
  const width = Math.max(minWidth, LINE_WIDTH * scale);
  context.lineCap = 'round';
  context.lineJoin = 'round';
  if (glow) {
    context.save();
    context.globalCompositeOperation = 'lighter';
    context.strokeStyle = rgba(palette.accent, 0.05);
    context.lineWidth = GLOW_WIDTH * scale;
    stroke(context, points, scale);
    context.strokeStyle = rgba(palette.accent, 0.1);
    context.lineWidth = GLOW_WIDTH * 0.45 * scale;
    stroke(context, points, scale);
    context.restore();
  }
  // The hot zone: accent into the light accent, at the SAME width.
  const head = Math.max(2, Math.round(HEAD_UNITS / LOOP_STEP));
  const from = Math.max(0, points.length - head);
  const tip = points[points.length - 1];
  const hot = context.createLinearGradient(points[from][0] * scale, points[from][1] * scale, tip[0] * scale, tip[1] * scale);
  hot.addColorStop(0, rgba(palette.accent, 0));
  hot.addColorStop(0.45, rgba(palette.accent, 0.9));
  hot.addColorStop(1, rgba(mix(palette.accent, palette.bright, heat), 1));
  context.strokeStyle = hot;
  context.lineWidth = width;
  stroke(context, points, scale, from);
  // A white filament down the middle of the last third — the only white on the canvas.
  const coreFrom = Math.max(0, points.length - Math.round(head * 0.42));
  if (points.length - coreFrom > 1) {
    const core = context.createLinearGradient(points[coreFrom][0] * scale, points[coreFrom][1] * scale, tip[0] * scale, tip[1] * scale);
    core.addColorStop(0, rgba(palette.bright, 0));
    core.addColorStop(1, rgba(palette.white, 0.95 * heat));
    context.strokeStyle = core;
    context.lineWidth = Math.max(minWidth * 0.6, width * 0.38);
    stroke(context, points, scale, coreFrom);
  }
  // Behind the hot zone the lap is the map SVG's accent ribbon, uncovered by
  // the lap mask on the same distance curve — not drawn here.
};

/** Draw the lap at `progress` (0–1) with the head at `heat` (1 hot → 0 cool). */
export function renderLap(context, progress, heat, palette) {
  const distance = distanceAtTime(progress);
  const points = trailUpTo(distance);
  context.clearRect(0, 0, 1440, 800);
  if (points.length > 1) {
    drawTrail(context, points, 1, 0.6, true, heat, palette);
    const [tx, ty] = points[points.length - 1];
    context.save();
    context.globalCompositeOperation = 'lighter';
    const spark = context.createRadialGradient(tx, ty, 0, tx, ty, LINE_WIDTH * 2.6);
    spark.addColorStop(0, rgba(palette.white, 0.85 * heat));
    spark.addColorStop(0.35, rgba(palette.bright, 0.4 * heat));
    spark.addColorStop(1, rgba(palette.accent, 0));
    context.fillStyle = spark;
    context.beginPath();
    context.arc(tx, ty, LINE_WIDTH * 2.6, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }
  for (const marker of LOOP_MARKERS) {
    if (distance < marker.d) continue;
    const age = Math.min(1, (distance - marker.d) / MARKER_POP_UNITS);
    const radius = 12 + (1 - age) * 14;
    const glow = context.createRadialGradient(marker.x, marker.y, 0, marker.x, marker.y, radius);
    glow.addColorStop(0, rgba(palette.bright, 0.5 + 0.45 * (1 - age)));
    glow.addColorStop(0.45, rgba(palette.accent, 0.32));
    glow.addColorStop(1, rgba(palette.accent, 0));
    context.save();
    context.globalCompositeOperation = 'lighter';
    context.fillStyle = glow;
    context.beginPath();
    context.arc(marker.x, marker.y, radius, 0, Math.PI * 2);
    context.fill();
    context.restore();
    if (age < 1) {
      context.strokeStyle = rgba(palette.bright, (1 - age) * 0.6);
      context.lineWidth = 1;
      context.beginPath();
      context.arc(marker.x, marker.y, 9 + age * 20, 0, Math.PI * 2);
      context.stroke();
    }
  }
  return distance;
}
