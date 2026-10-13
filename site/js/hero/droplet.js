/**
 * Cayleb's agent in 3D: a glass droplet with two glossy eyes and a cyan glow
 * along its foot, as his generated scenes draw it, built in code from
 * droplet-shape.js. It takes the place the reference gave its helmet — beside
 * his head, following the cursor — but is always visible: it is the second
 * character in the hero, not something revealed.
 */
import {
  BackSide, Color, FrontSide, Group, LatheGeometry, Mesh, MeshBasicMaterial,
  MeshPhysicalMaterial, ShaderMaterial, SphereGeometry, Vector2,
} from "three";
import { DROPLET_PROFILE } from "./droplet-shape.js";

/** Where the eyes sit on the droplet, before they look anywhere. */
const EYE_Y = -0.12;
const EYE_Z = 0.37;
const EYE_SPREAD = 0.11;
/** How far the eye pair slides across the face for a full-angle look. */
const LOOK_SLIDE = 0.07;

/**
 * Stylised glass: a clear-coated translucent shell over a cyan core, with a
 * back-face halo for the rim glow his generated scenes give the agent. True
 * transmission was tried first; on the hero's near-white ground it renders as
 * a grey bead (it can only refract the opaque backdrop, not the portrait or
 * the core), so every tier uses this.
 */
const bodyMaterial = () => new MeshPhysicalMaterial({
  color: new Color("#b4eff6"), roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.04,
  transparent: true, opacity: 0.5, depthWrite: false, envMapIntensity: 1.6,
  emissive: new Color("#02d2e3"), emissiveIntensity: 0.16,
});

/** Fresnel rim, weighted toward the foot (the lathe's y runs 0 at the foot to 1 at the tip). */
const rimMaterial = () => new ShaderMaterial({
  uniforms: { uColor: { value: new Color("#02d2e3") }, uStrength: { value: 0.95 } },
  vertexShader: /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vView;
    varying float vY;
    void main() {
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vNormal = normalize(normalMatrix * normal);
      vView = normalize(-mv.xyz);
      vY = position.y;
      gl_Position = projectionMatrix * mv;
    }`,
  fragmentShader: /* glsl */ `
    uniform vec3 uColor;
    uniform float uStrength;
    varying vec3 vNormal;
    varying vec3 vView;
    varying float vY;
    void main() {
      float facing = clamp(dot(normalize(vNormal), normalize(vView)), 0.0, 1.0);
      float rim = pow(1.0 - facing, 2.4);
      float foot = 1.0 - smoothstep(0.06, 0.5, vY);
      float glow = rim * (0.22 + 0.78 * foot) + foot * foot * 0.1;
      gl_FragColor = vec4(uColor, clamp(glow * uStrength, 0.0, 1.0));
      #include <colorspace_fragment>
    }`,
  transparent: true, depthWrite: false, depthTest: false, side: FrontSide,
});

export function buildDroplet() {
  const root = new Group();
  root.name = "droplet";

  const shape = new LatheGeometry(DROPLET_PROFILE.map(([x, y]) => new Vector2(x, y)), 64);
  const body = new Mesh(shape, bodyMaterial());
  body.name = "body";
  body.position.y = -0.5; // centre the drop on its own origin
  body.renderOrder = 2;

  const halo = new Mesh(
    shape,
    // Normal blending, not additive: on the hero's near-white ground an additive rim washes to white.
    new MeshBasicMaterial({ color: new Color("#02d2e3"), transparent: true, opacity: 0.2, side: BackSide, depthWrite: false }),
  );
  halo.name = "halo";
  halo.scale.setScalar(1.08);
  halo.position.y = -0.5 * 1.08;
  halo.renderOrder = 0;

  // The glow: cyan where the glass turns away from the eye, strongest along the foot, the
  // way light pools in the bottom of a drop. (A solid core used to sit just under the eyes
  // and read as a nose.)
  const rim = new Mesh(shape, rimMaterial());
  rim.name = "rim";
  rim.position.y = -0.5;
  rim.renderOrder = 3; // over the shell, under the eyes

  const eyes = new Group();
  eyes.name = "eyes";
  eyes.position.set(0, EYE_Y, EYE_Z);
  // Transparent (at full opacity) so they sort with the shell and core and honour
  // renderOrder: opaque meshes would draw first and the core would tint them.
  const pupil = new MeshPhysicalMaterial({ color: new Color("#0b0d10"), roughness: 0.15, clearcoat: 1, transparent: true, depthTest: false });
  const glint = new MeshBasicMaterial({ color: new Color("#ffffff"), transparent: true, depthTest: false });
  for (const side of [-1, 1]) {
    const eye = new Mesh(new SphereGeometry(0.055, 20, 14), pupil);
    eye.scale.set(0.8, 1.25, 0.6);
    eye.position.x = side * EYE_SPREAD;
    eye.renderOrder = 4;
    const spark = new Mesh(new SphereGeometry(0.016, 10, 8), glint);
    spark.position.set(side * EYE_SPREAD - 0.018, 0.03, 0.035);
    spark.renderOrder = 5;
    eyes.add(eye, spark);
  }

  root.add(halo, body, rim, eyes);
  return root;
}

/**
 * One frame of the droplet's own motion: the bob, the eyes sliding toward
 * where it looks (angles from lookAngles), the blink squash, and its entrance
 * scale. Placement and the whole-body lean are the scene's.
 */
export function animateDroplet(root, { bob = 0, look = { yaw: 0, pitch: 0 }, squash = 1, scale = 1 }) {
  root.position.y = bob;
  root.scale.setScalar(scale);
  const eyes = root.getObjectByName("eyes");
  if (!eyes) return;
  eyes.position.x = Math.sin(look.yaw) * LOOK_SLIDE;
  eyes.position.y = EYE_Y - Math.sin(look.pitch) * LOOK_SLIDE * 0.8;
  eyes.scale.y = squash;
}
