/**
 * The page's one requestAnimationFrame loop (spec §L230–243).
 *
 * Subscribers register `(callback, getFramerate)` and are called only when
 * more than `getFramerate()` ms have passed since their last call, so a
 * framerate of 0 runs every tick and `1000 / 60 - 2` gives 60fps on a 60Hz
 * screen and every second tick at 120Hz. The loop starts with the first
 * subscriber and cancels with the last.
 */
export function createTicker({ raf, caf } = {}) {
  const request = (fn) => (raf ?? globalThis.requestAnimationFrame)(fn);
  const cancel = (id) => (caf ?? globalThis.cancelAnimationFrame)(id);
  const subscribers = new Set();
  let handle = null;

  const loop = (time) => {
    handle = request(loop);
    for (const subscriber of [...subscribers]) {
      if (!subscribers.has(subscriber)) continue;
      if (time - subscriber.last > subscriber.getFramerate()) {
        subscriber.last = time;
        subscriber.callback(time);
      }
    }
  };

  const subscribe = (callback, getFramerate = () => 0) => {
    const subscriber = { callback, getFramerate, last: -Infinity };
    subscribers.add(subscriber);
    if (handle === null) handle = request(loop);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0 && handle !== null) {
        cancel(handle);
        handle = null;
      }
    };
  };

  return { subscribe };
}

/** The shared instance; it binds to the browser's rAF on first use. */
export const ticker = createTicker();
