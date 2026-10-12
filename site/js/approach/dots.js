/**
 * The map's halftone and the cursor reticle — spec map-dots.ts and
 * season-dots.tsx (§L3552–4336), ported from React hooks to a class.
 *
 * Deltas: the dots are generated from the contour field (the reference's were
 * a landmass); only the reticle lights them (the shipped source was `none`);
 * and lit dots square up into a gapped pixel grid rather than a chequer — the
 * parity skip is gone and the squares stop short of the pitch, so a lit patch
 * never closes into a solid block.
 */
import { field } from '../engine/contours.js';

/** Lattice pitch and origin, in the map's 2560×1440 space (spec, verbatim). */
export const DOT_LATTICE = { pitchX: 7.8, pitchY: 7.7, originX: 5.0, originY: 16.64 };
export const DOT_RADIUS = 1.75;
const MAP_W = 2560;
const MAP_H = 1440;

/** Every lattice point where the contour field crosses `threshold`. */
export function buildDotField(threshold = 0.8) {
  const xs = [];
  const cols = [];
  const rws = [];
  const lastI = Math.floor((MAP_W - DOT_LATTICE.originX) / DOT_LATTICE.pitchX);
  const lastJ = Math.floor((MAP_H - DOT_LATTICE.originY) / DOT_LATTICE.pitchY);
  for (let j = 0; j <= lastJ; j += 1) {
    const y = DOT_LATTICE.originY + j * DOT_LATTICE.pitchY;
    for (let i = 0; i <= lastI; i += 1) {
      const x = DOT_LATTICE.originX + i * DOT_LATTICE.pitchX;
      if (field((x / MAP_W) * 7.6 * 1.778 - 6.76, (y / MAP_H) * 7.6 - 3.8, 0) > threshold) {
        xs.push(x, y);
        cols.push(i);
        rws.push(j);
      }
    }
  }
  return {
    points: Float32Array.from(xs),
    columns: Int16Array.from(cols),
    rows: Int16Array.from(rws),
    count: cols.length,
  };
}

/** Below this a dot has gone back to being a dot. */
const MIN_LEVEL = 0.02;
const POINTER_HEAT = 0.95;
const RETICLE_OPEN = 420;
const RETICLE_SETTLE = 900;
const SPREAD_OPEN = 0.38;
const SPREAD_SHUT = 0.09;
const RETICLE_ARM = 0.82;
const RETICLE_CORE = 54;
const POINTER_TRAIL = 0.07;
const POINTER_RISE = 0.14;
const POINTER_FALL = 0.3;
/** Square side at full light / at the threshold, as shares of the pitch. */
export const CHEQUER_FILL = 0.78;
export const CHEQUER_SEED = 0.55;
export const PARAMS = Object.freeze({ threshold: 0.34, radius: 170, waveSpeed: 0.16, fade: 0.9 });

/** Exponential approach — frame-rate independent (the spec omits the body). */
export const approach = (from, to, dt, tau) => from + (to - from) * (1 - Math.exp(-dt / Math.max(tau, 1e-4)));

const mixRgb = (a, b, t) => [0, 1, 2].map((k) => Math.round(a[k] + (b[k] - a[k]) * t));
const css = ([r, g, b]) => `rgb(${r} ${g} ${b})`;

/** Soft round falloff — the same shape the marker flares use. */
const falloff = (t) => {
  if (t >= 1) return 0;
  const u = 1 - t;
  return u * u;
};

function buildIndex(dots) {
  const { columns, rows, count } = dots;
  let minI = Infinity, maxI = -Infinity, minJ = Infinity, maxJ = -Infinity;
  for (let i = 0; i < count; i += 1) {
    if (columns[i] < minI) minI = columns[i];
    if (columns[i] > maxI) maxI = columns[i];
    if (rows[i] < minJ) minJ = rows[i];
    if (rows[i] > maxJ) maxJ = rows[i];
  }
  const w = maxI - minI + 1;
  const h = maxJ - minJ + 1;
  const cell = new Int32Array(w * h).fill(-1);
  for (let i = 0; i < count; i += 1) cell[(rows[i] - minJ) * w + (columns[i] - minI)] = i;
  return { cell, w, h, minI, minJ };
}

export class Halftone {
  constructor(canvas, { dot, accent, maxRatio = 2 }) {
    this.canvas = canvas;
    this.dots = buildDotField();
    this.index = buildIndex(this.dots);
    this.palette = { dot, accent, bright: mixRgb(accent, [255, 255, 255], 0.55), white: [255, 255, 255] };
    this.maxRatio = maxRatio;
    this.level = new Float32Array(this.dots.count);
    this.active = new Int32Array(this.dots.count);
    this.inList = new Uint8Array(this.dots.count);
    this.activeCount = 0;
    this.pointer = { x: 0, y: 0, heat: 0 };
    this.target = { x: 0, y: 0, on: false };
    this.spread = 0;
    this.dirty = true;
    this.baked = null;
  }

  /** The resting field, baked once per size change. */
  bake() {
    const { canvas } = this;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    const ratio = Math.min(window.devicePixelRatio || 1, this.maxRatio);
    const w = Math.round(width * ratio);
    const h = Math.round(height * ratio);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    const baked = this.baked ?? document.createElement('canvas');
    this.baked = baked;
    baked.width = w;
    baked.height = h;
    const context = baked.getContext('2d');
    const scale = w / MAP_W;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.clearRect(0, 0, MAP_W, MAP_H);
    const { points, count } = this.dots;
    context.fillStyle = css(this.palette.dot);
    context.beginPath();
    for (let i = 0; i < count; i += 1) {
      const x = points[i * 2];
      const y = points[i * 2 + 1];
      context.moveTo(x + DOT_RADIUS, y);
      context.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
    }
    context.fill();
    this.dirty = true;
    this.draw();
  }

  add(i, value) {
    if (value <= MIN_LEVEL) return;
    if (value > this.level[i]) this.level[i] = value;
    if (!this.inList[i]) {
      this.inList[i] = 1;
      this.active[this.activeCount] = i;
      this.activeCount += 1;
    }
  }

  /** A round light at a point: ask the lattice for its rows and columns. */
  addPoint(source, reach) {
    if (source.heat <= 0.01) return;
    const { cell, w, h, minI, minJ } = this.index;
    const { points } = this.dots;
    const i0 = Math.floor((source.x - reach - DOT_LATTICE.originX) / DOT_LATTICE.pitchX);
    const i1 = Math.ceil((source.x + reach - DOT_LATTICE.originX) / DOT_LATTICE.pitchX);
    const j0 = Math.floor((source.y - reach - DOT_LATTICE.originY) / DOT_LATTICE.pitchY);
    const j1 = Math.ceil((source.y + reach - DOT_LATTICE.originY) / DOT_LATTICE.pitchY);
    for (let j = Math.max(minJ, j0); j <= Math.min(minJ + h - 1, j1); j += 1) {
      const row = (j - minJ) * w;
      for (let i = Math.max(minI, i0); i <= Math.min(minI + w - 1, i1); i += 1) {
        const idx = cell[row + (i - minI)];
        if (idx < 0) continue;
        const d = Math.hypot(points[idx * 2] - source.x, points[idx * 2 + 1] - source.y);
        this.add(idx, falloff(d / reach) * source.heat);
      }
    }
  }

  /** The reticle: the cursor's own lattice row and column, then a bloom where they cross. */
  addReticle(source) {
    if (source.heat <= 0.01) return;
    const { cell, w, h, minI, minJ } = this.index;
    const { points } = this.dots;
    const ci = Math.round((source.x - DOT_LATTICE.originX) / DOT_LATTICE.pitchX);
    const cj = Math.round((source.y - DOT_LATTICE.originY) / DOT_LATTICE.pitchY);
    const arm = RETICLE_ARM * source.heat;
    const reach = RETICLE_OPEN * this.spread;
    if (reach > 1 && cj >= minJ && cj < minJ + h) {
      const row = (cj - minJ) * w;
      const span = Math.ceil(reach / DOT_LATTICE.pitchX);
      for (let i = Math.max(minI, ci - span); i <= Math.min(minI + w - 1, ci + span); i += 1) {
        const idx = cell[row + (i - minI)];
        if (idx < 0) continue;
        this.add(idx, (1 - Math.abs(points[idx * 2] - source.x) / reach) * arm);
      }
    }
    if (reach > 1 && ci >= minI && ci < minI + w) {
      const span = Math.ceil(reach / DOT_LATTICE.pitchY);
      for (let j = Math.max(minJ, cj - span); j <= Math.min(minJ + h - 1, cj + span); j += 1) {
        const idx = cell[(j - minJ) * w + (ci - minI)];
        if (idx < 0) continue;
        this.add(idx, (1 - Math.abs(points[idx * 2 + 1] - source.y) / reach) * arm);
      }
    }
    this.addPoint(source, RETICLE_CORE);
  }

  /** Blit the baked field, lift the lit dots out, then lay the squares down. */
  draw() {
    const { canvas, baked } = this;
    if (!baked || !canvas.width) return;
    const context = canvas.getContext('2d');
    const scale = canvas.width / MAP_W;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.clearRect(0, 0, MAP_W, MAP_H);
    context.drawImage(baked, 0, 0, MAP_W, MAP_H);
    const { level, active, activeCount } = this;
    const { points } = this.dots;
    const { accent, bright, white } = this.palette;
    const box = DOT_RADIUS * 2 + 1;
    const span = 1 - PARAMS.threshold || 1;
    let drew = 0;
    for (let k = 0; k < activeCount; k += 1) {
      const idx = active[k];
      if (level[idx] < PARAMS.threshold) continue;
      context.clearRect(points[idx * 2] - DOT_RADIUS - 0.5, points[idx * 2 + 1] - DOT_RADIUS - 0.5, box, box);
      drew += 1;
    }
    if (!drew) return;
    for (let k = 0; k < activeCount; k += 1) {
      const idx = active[k];
      const value = level[idx];
      if (value < PARAMS.threshold) continue;
      const t = Math.min(1, (value - PARAMS.threshold) / span);
      const side = DOT_LATTICE.pitchX * (CHEQUER_SEED + (CHEQUER_FILL - CHEQUER_SEED) * t);
      context.fillStyle = css(value > 0.8 ? white : value > 0.5 ? bright : mixRgb(accent, bright, value));
      context.fillRect(points[idx * 2] - side / 2, points[idx * 2 + 1] - side / 2, side, side);
    }
  }

  setTarget(x, y, on) {
    this.target.x = x;
    this.target.y = y;
    this.target.on = on;
  }

  /** One frame; `dt` in seconds (capped at 0.1). Returns whether it drew. */
  frame(dt) {
    const { pointer, target, level, active, inList } = this;
    const wanted = target.on ? POINTER_HEAT : 0;
    if (pointer.heat <= 0.001 && wanted > 0) {
      pointer.x = target.x;
      pointer.y = target.y;
    } else if (dt > 0) {
      const px = pointer.x;
      const py = pointer.y;
      pointer.x = approach(px, target.x, dt, POINTER_TRAIL);
      pointer.y = approach(py, target.y, dt, POINTER_TRAIL);
      const speed = Math.hypot(pointer.x - px, pointer.y - py) / dt;
      const wantedSpread = Math.max(0, 1 - speed / RETICLE_SETTLE);
      this.spread = approach(this.spread, wantedSpread, dt, wantedSpread > this.spread ? SPREAD_OPEN : SPREAD_SHUT);
    }
    pointer.heat = approach(pointer.heat, wanted, dt, wanted > pointer.heat ? POINTER_RISE : POINTER_FALL);
    if (pointer.heat < 0.005) {
      pointer.heat = 0;
      this.spread = 0;
    }
    const decay = Math.exp(-dt / Math.max(0.05, PARAMS.fade / 3));
    let write = 0;
    for (let k = 0; k < this.activeCount; k += 1) {
      const idx = active[k];
      const value = level[idx] * decay;
      if (value > MIN_LEVEL) {
        level[idx] = value;
        active[write] = idx;
        write += 1;
      } else {
        level[idx] = 0;
        inList[idx] = 0;
      }
    }
    const before = this.activeCount;
    this.activeCount = write;
    this.addReticle(pointer);
    if (this.activeCount === 0 && before === 0 && !this.dirty) return false;
    this.dirty = false;
    this.draw();
    return true;
  }
}
