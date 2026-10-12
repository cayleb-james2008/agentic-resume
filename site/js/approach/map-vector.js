/**
 * The map's instrument-panel artwork, in its own 2560×1440 space — spec
 * map-vector.ts (§L2980–3114) minus the race track, the flag and the turn
 * triangles, which the loop (loop-path.js) replaces.
 */

/** The artwork's frame; `band` is what has to be undone to seat it on the artboard. */
export const MAP_VIEW = { width: 2560, height: 1440, band: 11.67 };

/**
 * The canvas layers draw in the 1440×800 artboard; the map draws in its own
 * frame. This is the one conversion between them.
 */
const ART_BOX = { top: 2, width: 1438.43, height: 796 };
const ART_SCALE_X = MAP_VIEW.width / ART_BOX.width;
const ART_SCALE_Y = (MAP_VIEW.height - MAP_VIEW.band * 2) / ART_BOX.height;

export const mapToArtboard = (x, y) => [x / ART_SCALE_X, (y - MAP_VIEW.band) / ART_SCALE_Y + ART_BOX.top];
export const artboardToMap = (x, y) => [x * ART_SCALE_X, MAP_VIEW.band + (y - ART_BOX.top) * ART_SCALE_Y];

/** Where the map sits on the artboard (spec §L2894): the band undone. */
export const MAP_PLACEMENT = {
  top: 2 - (11.67 * 796) / 1416.66,
  width: 1438.43,
  height: (796 * 1440) / 1416.66,
};

export const GRID_AXES_X = [645.31, 1276.96, 1908.61];
export const GRID_AXIS_Y = 697.98;
export const GRID_DASH = '12.15 8.35';
export const GRID_DASH_PERIOD = 20.5;
export const GRID_STROKE = 2.13;
export const GRID_OVERRUN = 4000;

export const HUB = { x: 1278.48, y: 699.5, r: 10.63 };
export const RINGS = [
  { r: 69.85, width: 3.04, ghost: false },
  { r: 356.06, width: 2.13, ghost: true },
  { r: 442.61, width: 2.13, ghost: true },
];

/** The frame's corner ticks (the bottom-right one is dropped, as in the reference). */
export const CORNER_MARKS = [
  [65.29, 76.96], [2471.93, 76.96], [65.29, 931.81], [2471.93, 931.81],
  [65.29, 1343.3], [1155.49, 1343.3], [1384.77, 1343.3],
];
export const CORNER_MARK_SIZE = 16.7;

/** Loop timings (spec §L5502–5512). */
export const DRIFT_MS = 7000;
export const PING_MS = 4200;
export const PING_REACH = 86;
