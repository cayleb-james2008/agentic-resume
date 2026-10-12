/**
 * react-spring's damped spring, reproduced (spec §L244–270): 1ms substeps,
 * a 64ms frame cap, mass 1 unless given. Tension and friction use
 * react-spring's own scaling (tension × 1e-6, friction × 1e-3 per ms²), so
 * the named configs below move exactly as they did in the reference.
 */

/** Every named config the page uses, verbatim from the reference. */
export const CONFIGS = Object.freeze({
  REVEAL: { tension: 90, friction: 26 },
  ROW: { tension: 170, friction: 24 },
  ITEM: { tension: 170, friction: 24 },
  SHEET: { tension: 190, friction: 26 },
  FIGURE: { tension: 200, friction: 24 },
  TYPE: { tension: 210, friction: 24 },
  YEAR: { tension: 190, friction: 24 },
  COPY: { tension: 110, friction: 26 },
  COPY_FAST: { tension: 150, friction: 24 },
  NAME: { tension: 190, friction: 24 },
  VEIL: { tension: 70, friction: 24 },
  CLEAR: { tension: 140, friction: 26 },
  LABEL: { tension: 110, friction: 26 },
  PROGRESS_WAIT: { tension: 10, friction: 30 },
  PROGRESS_READY: { tension: 170, friction: 26 },
  YEAR_SETTLE: { tension: 32, friction: 26 },
  TRIGGER: { tension: 140, friction: 30 },
});

const FRAME_CAP = 64;

export class Spring {
  constructor({ value = 0, tension, friction, mass = 1, precision = 0.01 }) {
    this.value = value;
    this.target = value;
    this.velocity = 0;
    this.tension = tension;
    this.friction = friction;
    this.mass = mass;
    this.precision = precision;
  }

  set(target) {
    this.target = target;
  }

  /** Jump to a value with no motion. */
  jump(value) {
    this.value = value;
    this.target = value;
    this.velocity = 0;
  }

  /** Advance by `dtMs`; returns false once the spring is at rest. */
  step(dtMs) {
    const steps = Math.ceil(Math.min(Math.max(dtMs, 0), FRAME_CAP));
    for (let i = 0; i < steps; i += 1) {
      if (this.atRest()) break;
      const spring = -this.tension * 1e-6 * (this.value - this.target);
      const damping = -this.friction * 1e-3 * this.velocity;
      this.velocity += (spring + damping) / this.mass;
      this.value += this.velocity;
    }
    if (this.atRest()) {
      this.value = this.target;
      this.velocity = 0;
      return false;
    }
    return true;
  }

  atRest() {
    return (
      Math.abs(this.target - this.value) < this.precision &&
      Math.abs(this.velocity * 1000) < this.precision
    );
  }
}

export const easings = Object.freeze({
  linear: (t) => t,
  easeOutQuad: (t) => 1 - (1 - t) * (1 - t),
  easeOutCubic: (t) => 1 - (1 - t) ** 3,
  easeInOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
});

/** A plain timed tween — the reference's `{ duration, easing }` configs. */
export class Tween {
  constructor({ from = 0, to = 1, duration, easing = easings.linear }) {
    this.from = from;
    this.to = to;
    this.duration = duration;
    this.easing = easing;
    this.elapsed = 0;
    this.value = from;
  }

  step(dtMs) {
    this.elapsed = Math.min(this.duration, this.elapsed + Math.max(dtMs, 0));
    if (this.elapsed >= this.duration) {
      this.value = this.to;
      return false;
    }
    this.value = this.from + (this.to - this.from) * this.easing(this.elapsed / this.duration);
    return true;
  }
}
