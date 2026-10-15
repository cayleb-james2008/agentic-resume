/**
 * The water's surface, as a damped wave on a small grid — pure maths, on the
 * CPU, so the renderer only has to upload a byte texture each frame (no float
 * render targets).
 *
 * Row 0 is the bottom of the stage (v = 0) and row `rows - 1` the top, the same
 * order a texture uploaded straight from `toBytes` reads in GL, so a stage
 * coordinate maps to the grid with no flip. Edges are clamped (Neumann): a
 * wave reflects off them instead of leaking out.
 */

/** Cells to put along the long side; the short side keeps the stage's aspect. */
export const rippleSize = (aspect, longSide) => (aspect >= 1
  ? [longSide, Math.round(longSide / aspect)]
  : [Math.round(longSide * aspect), longSide]);

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

export const createRipple = (cols, rows, { damping = 0.985 } = {}) => {
  // Two buffers: `cur` is the surface now, `prev` the one before it. A step
  // overwrites `prev` in place (each cell reads only its own old value from it)
  // and then the two swap, so `height` must be read afresh after every step.
  let cur = new Float32Array(cols * rows);
  let prev = new Float32Array(cols * rows);

  return {
    cols,
    rows,
    get height() { return cur; },

    /**
     * Push the surface at (u, v) — both 0..1 across the grid — by `strength`
     * (negative pulls it down). It falls off as (1 - d/radius)² and reaches no
     * further than `radius` cells; heights clamp to [-1, 1].
     */
    poke(u, v, strength, radius = 2) {
      const cx = u * (cols - 1), cy = v * (rows - 1);
      const x0 = Math.max(0, Math.ceil(cx - radius)), x1 = Math.min(cols - 1, Math.floor(cx + radius));
      const y0 = Math.max(0, Math.ceil(cy - radius)), y1 = Math.min(rows - 1, Math.floor(cy + radius));
      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const d = Math.hypot(x - cx, y - cy);
          if (d >= radius) continue;
          const k = 1 - d / radius;
          const i = y * cols + x;
          cur[i] = clamp(cur[i] + strength * k * k, -1, 1);
        }
      }
    },

    /** One tick of the wave equation: the four neighbours, less last tick, damped. */
    step() {
      for (let y = 0; y < rows; y++) {
        const row = y * cols, up = Math.min(y + 1, rows - 1) * cols, down = Math.max(y - 1, 0) * cols;
        for (let x = 0; x < cols; x++) {
          const l = row + Math.max(x - 1, 0), r = row + Math.min(x + 1, cols - 1);
          prev[row + x] = ((cur[l] + cur[r] + cur[up + x] + cur[down + x]) * 0.5 - prev[row + x]) * damping;
        }
      }
      const next = prev;
      prev = cur;
      cur = next;
    },

    /** The sum of squared heights: how much the surface is still moving. */
    energy() {
      let sum = 0;
      for (let i = 0; i < cur.length; i++) sum += cur[i] * cur[i];
      return sum;
    },

    /** Heights as bytes for a texture: 0 is 128, -1 is 0, +1 is 255. Returns `out`. */
    toBytes(out) {
      for (let i = 0; i < cur.length; i++) out[i] = Math.round((clamp(cur[i], -1, 1) * 0.5 + 0.5) * 255);
      return out;
    },
  };
};
