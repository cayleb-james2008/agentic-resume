/**
 * What the guide says, and when — kept pure so it can be tested in Node.
 *
 * The greeting goes first. After it, one section line at a time: each line is
 * said once per page load, shows for SHOW_MS, and waits GAP_MS after the last
 * one so lines never run together. Only one section waits at a time — a newer
 * section replaces it, because by the time it would show the reader has moved
 * on. Quiet hides what is showing and drops everything until it is turned off.
 */
export const SHOW_MS = 5500;
export const GAP_MS = 1200;

export const createGuideState = () => ({
  said: new Set(),
  greeting: false,
  pending: null,
  current: null,
  until: 0,
  nextAt: 0,
  quiet: false,
});

/** Ask for a line: "greeting" or a section id. */
export function request(state, key) {
  if (state.quiet || state.said.has(key)) return;
  if (key === 'greeting') state.greeting = true;
  else state.pending = key;
}

/** Advance to `now` (ms): what, if anything, to show or hide this frame. */
export function tick(state, now) {
  const out = { show: null, hide: false };
  if (state.current !== null && now >= state.until) {
    state.current = null;
    state.nextAt = now + GAP_MS;
    out.hide = true;
  }
  if (state.current === null && !state.quiet && now >= state.nextAt) {
    let key = null;
    if (state.greeting && !state.said.has('greeting')) key = 'greeting';
    else if (state.pending !== null) key = state.pending;
    if (key !== null) {
      if (key === state.pending) state.pending = null;
      state.greeting = state.greeting && key !== 'greeting';
      state.said.add(key);
      state.current = key;
      state.until = now + SHOW_MS;
      out.show = key;
    }
  }
  return out;
}

/** Turn quiet on or off. Turning it on hides the current line at once. */
export function setQuiet(state, quiet) {
  state.quiet = quiet;
  const out = { show: null, hide: false };
  if (quiet) {
    if (state.current !== null) out.hide = true;
    state.current = null;
    state.pending = null;
    state.greeting = false;
  }
  return out;
}

/**
 * Where the pupils sit when looking toward a point `dx, dy` px away from the
 * droplet: the direction, scaled down and held inside a circle of `max` px so
 * the eyes never leave their sockets.
 */
export function gaze(dx, dy, max = 3) {
  const d = Math.hypot(dx, dy);
  if (d === 0) return { x: 0, y: 0 };
  const reach = Math.min(max, d / 60);
  return { x: (dx / d) * reach, y: (dy / d) * reach };
}
