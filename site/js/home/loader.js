/** The intro loader: a terminal boot that counts 000 → 100, then slides up and opens the page. */
export const FILL_MS = 1300;

export const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** The counter as the loader shows it, zero-padded to three digits. */
export const counterLabel = (p) => String(p).padStart(3, '0');

/** Plays only on a first visit in this tab, with motion allowed and no deep link to land on. */
export const shouldPlay = ({ reduced, hash, seen }) => !reduced && !hash && !seen;
