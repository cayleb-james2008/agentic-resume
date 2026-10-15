/**
 * The water, drawn: one fullscreen fragment shader on the vendored three.js.
 *
 * It only draws what it is given. story.js decides the shape (the slots from
 * timeline.js), the swell (`flow`), the ripple heights (ripple.js, as bytes)
 * and the lean (`tilt`); this module packs them into uniforms and renders.
 *
 * The shader works in **stage units** (shapes.js): `p = gl_FragCoord.xy / uRes.y`,
 * so y runs 0..1 up the stage and x runs 0..aspect. The water is the smooth
 * union of the active slots, each an oriented box from `a` to `b'` (`b` pulled
 * back to `a + (b - a)·fill`) with its full thickness `th`, its corners grown
 * by `r` — the same geometry shapes.js measures its bounds with.
 *
 * Colours are written out exactly as given (sRGB, no tone mapping and no
 * output conversion: a bare ShaderMaterial gets neither), so the background is
 * the page's own ice and the water meets it with no seam.
 */
import {
  DataTexture, GLSL3, LinearFilter, Mesh, OrthographicCamera, PlaneGeometry, RedFormat,
  Scene, ShaderMaterial, UnsignedByteType, Vector2, Vector3, Vector4, WebGLRenderer,
} from 'three';
import { rgbOf } from '../engine/tokens.js';
import { MAX_SLOTS } from './shapes.js';
import { renderSize } from './view.js';

/** The tokens' values, for when a colour is not passed. */
const DEFAULT_COLORS = Object.freeze({
  ink: 'rgb(14, 15, 20)',     // --raw-color-ink-900
  deep: 'rgb(9, 10, 11)',     // --raw-color-ink-950
  rim: 'rgb(2, 210, 227)',    // --raw-color-cyan-400
  bg: 'rgb(247, 250, 251)',   // --raw-color-ice-50
});

/**
 * The swell's two waves turn at 0.002 and 0.0015 rad/ms, both whole multiples
 * of 0.0005, so time can wrap at 2π/0.0005 ms (about 3.5 hours) with no jump —
 * and float32 keeps the phase sharp instead of drifting as the page stays open.
 */
const TIME_PERIOD = (2 * Math.PI) / 0.0005;

/**
 * Shorter than this (stage units), the shader treats a slot as a point. A box
 * that is still filling from nothing keeps its axis by being drawn at least
 * this long instead: a sliver across its thickness, not a disc as wide as it.
 */
const MIN_LENGTH = 2e-5;

const CONTEXT_ATTRIBUTES = Object.freeze({
  alpha: false,
  antialias: false,
  depth: false,          // one quad, no depth test: no depth buffer to fill
  stencil: false,
  powerPreference: 'high-performance',
});

const VERTEX = /* glsl */ `
void main() {
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAGMENT = /* glsl */ `
uniform vec2 uRes;
uniform float uAspect;
uniform float uTime;
uniform float uFlow;
uniform vec2 uTilt;
uniform vec4 uSlotA[${MAX_SLOTS}];   // ax, ay, bx', by'
uniform vec4 uSlotB[${MAX_SLOTS}];   // th, r, active, 0
uniform sampler2D uRipple;
uniform vec3 uInk;
uniform vec3 uDeep;
uniform vec3 uRim;
uniform vec3 uBg;

layout(location = 0) out highp vec4 fragColor;

float sdOrientedBox(vec2 p, vec2 a, vec2 b, float th) {
  float l = length(b - a);
  if (l < 1e-5) return length(p - a) - th * 0.5;
  vec2 d = (b - a) / l;
  vec2 q = p - (a + b) * 0.5;
  q = mat2(d.x, -d.y, d.y, d.x) * q;
  q = abs(q) - vec2(l, th) * 0.5;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
}

float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}

void main() {
  vec2 p = gl_FragCoord.xy / uRes.y;
  p.y += uTilt.x * (p.x - uAspect * 0.5) * 0.08;   // a leaning surface

  float d = 1e5;
  for (int i = 0; i < ${MAX_SLOTS}; i++) {
    vec4 b = uSlotB[i];
    if (b.z < 0.5) continue;
    vec4 a = uSlotA[i];
    d = smin(d, sdOrientedBox(p, a.xy, a.zw, b.x) - b.y, 0.035);
  }

  float h = texture(uRipple, p / vec2(uAspect, 1.0)).r * 2.0 - 1.0;
  d -= h * 0.012;
  d += uFlow * 0.006 * sin(p.x * 23.0 + uTime * 0.002) * sin(p.y * 17.0 - uTime * 0.0015);

  // fwidth is 0 where d is flat (no water at all); smoothstep needs edge0 < edge1.
  float aa = max(fwidth(d), 1e-5);
  float inside = 1.0 - smoothstep(-aa, aa, d);
  vec2 n = normalize(vec2(dFdx(d), dFdy(d)) + vec2(0.0, 1e-6));
  float rim = (1.0 - smoothstep(0.0, 0.006, -d)) * inside * (0.55 + 0.45 * max(n.y, 0.0));
  float spec = pow(max(dot(n, normalize(vec2(-0.4, 1.0))), 0.0), 24.0) * (1.0 - smoothstep(0.0, 0.02, -d)) * inside;

  vec3 body = mix(uDeep, uInk, smoothstep(0.0, 0.4, p.y)) + uRim * 0.12 * abs(h);
  vec3 col = mix(uBg, body, inside);
  col = mix(col, uRim, rim);
  col += spec * 0.35;
  fragColor = vec4(col, 1.0);
}
`;

/** "rgb(…)" (what readToken gives) → a 0..1 vector. */
const colorOf = (css) => {
  const [r, g, b] = rgbOf(css);
  return new Vector3(r / 255, g / 255, b / 255);
};

/** A ripple texture: one byte of height per cell, row 0 at the bottom (ripple.js's order). */
const rippleTexture = (bytes, cols, rows) => {
  const texture = new DataTexture(bytes, cols, rows, RedFormat, UnsignedByteType);
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  texture.generateMipmaps = false;
  texture.unpackAlignment = 1;   // rows such as 33 bytes are not multiples of 4
  texture.needsUpdate = true;
  return texture;
};

export class Water {
  /**
   * Throws when there is no WebGL2 context or the shader does not build;
   * story.js turns the story static on either.
   */
  constructor(canvas, { tier, colors = {} } = {}) {
    this.canvas = canvas;
    this.tier = tier;
    /** Called once if the GPU drops the context. */
    this.onLost = null;

    // Ask for the context here rather than letting three do it: three logs an
    // error before it throws, and a browser without WebGL is not an error.
    const gl = canvas.getContext('webgl2', CONTEXT_ATTRIBUTES);
    if (!gl) throw new Error('WebGL2 is unavailable');
    this.gl = gl;
    this.loseContext = gl.getExtension('WEBGL_lose_context');

    this.renderer = new WebGLRenderer({
      canvas, context: gl, antialias: false, alpha: false, powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(1);   // resize() sizes the drawing buffer itself

    const c = { ...DEFAULT_COLORS, ...colors };
    this.ripple = rippleTexture(new Uint8Array([128]), 1, 1);   // flat water until the first render
    this.uniforms = {
      uRes: { value: new Vector2(1, 1) },
      uAspect: { value: 1 },
      uTime: { value: 0 },
      uFlow: { value: 0 },
      uTilt: { value: new Vector2(0, 0) },
      uSlotA: { value: Array.from({ length: MAX_SLOTS }, () => new Vector4()) },
      uSlotB: { value: Array.from({ length: MAX_SLOTS }, () => new Vector4()) },
      uRipple: { value: this.ripple },
      uInk: { value: colorOf(c.ink) },
      uDeep: { value: colorOf(c.deep) },
      uRim: { value: colorOf(c.rim) },
      uBg: { value: colorOf(c.bg) },
    };
    this.material = new ShaderMaterial({
      glslVersion: GLSL3,
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      uniforms: this.uniforms,
      depthTest: false,
      depthWrite: false,
    });
    this.geometry = new PlaneGeometry(2, 2);
    const quad = new Mesh(this.geometry, this.material);
    quad.frustumCulled = false;
    this.scene = new Scene();
    this.scene.add(quad);
    this.camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.handleLost = () => this.onLost?.();
    canvas.addEventListener('webglcontextlost', this.handleLost);

    // Build the program now, so a shader that does not compile throws here
    // instead of drawing nothing: three logs the compiler's message and marks
    // the program it could not link (`diagnostics.runnable`).
    this.renderer.setSize(1, 1, false);
    this.renderer.render(this.scene, this.camera);
    if (this.renderer.info.programs?.some((program) => program.diagnostics?.runnable === false)) {
      this.dispose();
      throw new Error('the water shader did not build');
    }
  }

  /** Size the drawing buffer for a `cssW`×`cssH` canvas, under the tier's pixel-ratio cap. */
  resize(cssW, cssH, dpr) {
    const { width, height } = renderSize(cssW, cssH, Math.min(dpr, this.tier.maxDpr));
    this.renderer.setSize(width, height, false);
    this.uniforms.uRes.value.set(width, height);
    this.uniforms.uAspect.value = width / height;
  }

  /**
   * Draw one frame. `slots` are shapes.js slots; a slot is drawn when it has
   * size (`r + th > 0`) and some fill. `ripple` is ripple.js `toBytes` output
   * for a `rippleSize` [cols, rows] grid; `time` is in ms.
   */
  render({ slots, flow = 0, time = 0, ripple, rippleSize, tilt = [0, 0] }) {
    const A = this.uniforms.uSlotA.value;
    const B = this.uniforms.uSlotB.value;
    for (let i = 0; i < MAX_SLOTS; i++) {
      const s = slots[i];
      if (!s || !(s.r + s.th > 0) || !(s.fill > 0)) {
        B[i].set(0, 0, 0, 0);
        continue;
      }
      const dx = s.b[0] - s.a[0], dy = s.b[1] - s.a[1], length = Math.hypot(dx, dy);
      let fill = Math.min(1, s.fill);
      if (length > MIN_LENGTH && length * fill < MIN_LENGTH) fill = MIN_LENGTH / length;
      A[i].set(s.a[0], s.a[1], s.a[0] + dx * fill, s.a[1] + dy * fill);
      B[i].set(s.th, s.r, 1, 0);
    }

    if (ripple && rippleSize) this.uploadRipple(ripple, rippleSize[0], rippleSize[1]);
    this.uniforms.uFlow.value = flow;
    this.uniforms.uTime.value = time % TIME_PERIOD;
    this.uniforms.uTilt.value.set(tilt[0], tilt[1]);
    this.renderer.render(this.scene, this.camera);
  }

  /** The ripple bytes, re-uploaded every frame; a new grid size needs a new texture. */
  uploadRipple(bytes, cols, rows) {
    const image = this.ripple.image;
    if (image.width !== cols || image.height !== rows) {
      this.ripple.dispose();
      this.ripple = rippleTexture(bytes, cols, rows);
      this.uniforms.uRipple.value = this.ripple;
      return;
    }
    image.data = bytes;
    this.ripple.needsUpdate = true;
  }

  /** Free the GPU: the texture, the program, the quad, and the context itself. */
  dispose() {
    this.canvas.removeEventListener('webglcontextlost', this.handleLost);
    this.onLost = null;
    this.ripple.dispose();
    this.material.dispose();
    this.geometry.dispose();
    this.renderer.dispose();
    if (!this.gl.isContextLost()) this.loseContext?.loseContext();
  }
}
