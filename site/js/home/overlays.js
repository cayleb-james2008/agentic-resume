/** The menu and the request modal. The scroll lock is counted so stacked overlays release it once. */

export function createScrollLock({ stop, start }) {
  let count = 0;
  return {
    lock() { if (count++ === 0) stop(); },
    unlock() { if (count === 0) return; if (--count === 0) start(); },
    get count() { return count; },
  };
}
