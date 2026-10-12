/**
 * The hero's 3D object: a procedural AI headset in place of the reference's
 * helmet model. A lathed shell with its front opened toward the camera, and a
 * glossy cyan visor across the eye band. Built in code — no model file, no
 * third-party licence.
 */
import { Color, Group, LatheGeometry, Mesh, MeshPhysicalMaterial, MeshStandardMaterial, Vector2 } from "three";
import { HEADSET_PROFILE, VISOR_BAND, VISOR_SCALE } from "./headset-profile.js";

const DEG = Math.PI / 180;

/** The shell's own colour — the scene scales it for brightness. */
export const SHELL_BASE = new Color("#1b1d24");

/** Profile points inside the visor band, interpolated at its two edges. */
function visorProfile() {
  const [low, high] = VISOR_BAND;
  const at = (y) => {
    for (let i = 1; i < HEADSET_PROFILE.length; i += 1) {
      const [x0, y0] = HEADSET_PROFILE[i - 1];
      const [x1, y1] = HEADSET_PROFILE[i];
      if (y >= y0 && y <= y1) return [x0 + ((x1 - x0) * (y - y0)) / (y1 - y0), y];
    }
    return HEADSET_PROFILE.at(-1);
  };
  const inside = HEADSET_PROFILE.filter(([, y]) => y > low && y < high);
  return [at(low), ...inside, at(high)].map(([x, y]) => new Vector2(x * VISOR_SCALE, y));
}

export function buildHeadset() {
  const root = new Group();
  root.name = "headset";

  // The gap faces +z (the camera): lathe phi 0 points along +z.
  const shell = new Mesh(
    new LatheGeometry(HEADSET_PROFILE.map(([x, y]) => new Vector2(x, y)), 96, 55 * DEG, 250 * DEG),
    new MeshStandardMaterial({ color: SHELL_BASE.clone(), metalness: 0.6, roughness: 0.35 }),
  );
  shell.name = "shell";

  const visor = new Mesh(
    new LatheGeometry(visorProfile(), 48, -60 * DEG, 120 * DEG),
    new MeshPhysicalMaterial({
      color: new Color("#02d2e3"),
      metalness: 0,
      roughness: 0.05,
      clearcoat: 1,
      transparent: true,
      opacity: 0.6,
    }),
  );
  visor.name = "visor";

  // No DoubleSide: the scene forces FrontSide on every masked material (see
  // buildHelmet in scene.js), and the lathe's normals face outward.
  root.add(shell, visor);
  return root;
}
