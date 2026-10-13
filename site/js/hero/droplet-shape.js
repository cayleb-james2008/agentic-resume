/**
 * Cayleb's agent, the glass droplet — its shape and the pure parts of how it
 * moves. Kept free of three so the numbers can be tested in Node; droplet.js
 * builds the meshes from them.
 */

/** Droplet height and belly radius, in the droplet's own units. */
const HEIGHT = 1;
const RADIUS = 0.5;
const SAMPLES = 40;

/**
 * The lathe profile, foot to tip: [x, y] pairs with y strictly increasing.
 *
 * The classic teardrop x = sin t · sin(t/2), y = (1 + cos t) / 2 with t running
 * π → 0: round at the foot (where sin(t/2) ≈ 1 the curve is a circle) and
 * drawn to a soft point at the top (near t = 0 it grows as t²/2). Its belly
 * falls a third of the way up, which is what makes it read as a drop and not
 * an egg.
 */
export const DROPLET_PROFILE = Object.freeze(
  Array.from({ length: SAMPLES + 1 }, (_, i) => {
    const t = Math.PI * (1 - i / SAMPLES);
    const x = RADIUS * Math.sin(t) * Math.sin(t / 2);
    const y = (HEIGHT * (1 + Math.cos(t))) / 2;
    return Object.freeze([Math.max(0, +x.toFixed(5)), +y.toFixed(5)]);
  }),
);

/** How far the eyes turn toward the cursor, at most, either way. */
export const EYE_MAX_DEG = 28;
const EYE_MAX = (EYE_MAX_DEG * Math.PI) / 180;
const EYE_GAIN = EYE_MAX * 1.25;

const clamp = (v, max) => Math.max(-max, Math.min(max, v));

/**
 * Eye angles for a pointer in normalised screen space (−1…1, y down): yaw
 * positive toward the right of the screen, pitch positive toward the bottom.
 * Saturates a little before the screen edge so the gaze settles rather than
 * pinning at the clamp.
 */
export const lookAngles = (x, y) => ({
  yaw: clamp(x * EYE_GAIN, EYE_MAX) || 0,
  pitch: clamp(y * EYE_GAIN, EYE_MAX) || 0,
});

/** One blink, start to finish. */
export const BLINK_MS = 140;

/** The eyes' vertical scale `ms` into a blink: 1, down to 0.08 at the middle, back to 1. */
export const blinkSquash = (ms) =>
  ms < 0 || ms > BLINK_MS ? 1 : 1 - 0.92 * Math.sin((Math.PI * ms) / BLINK_MS);

/** The next blink's delay: 3–6 s, so it never reads as a metronome. */
export const nextBlinkDelay = (random = Math.random) => 3000 + random() * 3000;
