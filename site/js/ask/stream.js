/**
 * How an answer appears: a few characters a tick, so it reads as it arrives, then whole. With motion reduced it
 * appears whole at once. Screen readers never hear the steps: ask.js writes the full answer to a live region once.
 */
export const TYPE_PER_TICK = 3;
export const TICK_MS = 16;

/** The part of an answer shown after `tick` ticks. */
export const typeStep = (full, tick) => full.slice(0, Math.min(full.length, (tick + 1) * TYPE_PER_TICK));

/** How many ticks an answer streams for: none with motion reduced. */
export const ticksFor = (full, reduced) => (reduced ? 0 : Math.ceil(full.length / TYPE_PER_TICK));
