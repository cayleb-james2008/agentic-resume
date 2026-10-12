/**
 * The agent headset's silhouette, as a lathe profile: [radius, height] from
 * the neck (y 0) to the crown (y 1). Pure data so node can test it; the scene
 * normalises the built geometry to the face, so the units are relative.
 */
export const HEADSET_PROFILE = Object.freeze([
  [0.30, 0.0],
  [0.40, 0.06],
  [0.47, 0.18],
  [0.50, 0.35],
  [0.50, 0.55],
  [0.47, 0.72],
  [0.40, 0.85],
  [0.28, 0.95],
  [0.12, 0.995],
  [0.0, 1.0],
]);

/** The eye band the visor covers, as a share of the profile's height. */
export const VISOR_BAND = Object.freeze([0.35, 0.62]);

/** How far the visor sits proud of the shell. */
export const VISOR_SCALE = 1.03;
