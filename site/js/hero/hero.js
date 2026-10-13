/**
 * The hero block's behaviour — spec §L333–550.
 *
 * The loading veil creeps to 70% on a soft spring and completes on a stiff one
 * the moment the scene reports ready; then it clears in three beats, and the
 * page's entrance (and the scene's rise) begin on the same tick. The scene is
 * loaded with a dynamic import so nothing on the page waits for three.js to
 * parse, and so node can import this module's constants.
 */
import { animatables, playIn } from '../engine/reveal.js';
import { drawContours, fitCanvas } from '../engine/contours.js';
import { CONFIGS, Spring } from '../engine/spring.js';
import { ticker } from '../engine/ticker.js';
import { readToken } from '../engine/tokens.js';
import { fitSubjectToBox } from './fit.js';

export const VEIL = Object.freeze({ CREEP: 0.7, CLEAR_MS: 430, PAUSE_MS: 240, LIFT_TIMEOUT_MS: 3000, GONE_AT: 0.004, MAX_WAIT_MS: 8000 });

/**
 * The veil waits for the scene, but never forever: a GPU that stalls on
 * compile, or a texture request that hangs without failing, would otherwise
 * leave a full-screen cover over the whole page. By the deadline the veil
 * lifts and the scene appears whenever it is ready. `ready()` is idempotent,
 * so a scene that makes it in time simply wins the race.
 */
export const liftByDeadline = (veil, ms = VEIL.MAX_WAIT_MS, setTimer = globalThis.setTimeout) =>
  setTimer(() => veil.ready(), ms);
export const ENTRANCE = Object.freeze({ nav: 0, identity: 180, panels: 900, actions: 1500 });
/** The hero is sticky; past this many viewport heights it is covered. */
export const COVERED_AFTER = 1.15;
const NAME_RISE_AT = 260;

export const formatAssetError = (url) => `Couldn't load ${url}`;

/** A visible banner naming the asset that failed (spec: failures must show). */
export function showAssetError(url) {
  const banner = document.querySelector('.asset-banner');
  if (!banner) return;
  const line = document.createElement('p');
  line.textContent = formatAssetError(url);
  banner.append(line);
  banner.hidden = false;
}

/** Any page image that fails to load gets named in the banner. */
export function watchImages(doc = document) {
  doc.addEventListener('error', (event) => {
    const target = event.target;
    if (target instanceof HTMLImageElement) showAssetError(target.getAttribute('src'));
  }, true);
  for (const img of doc.images) {
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('loading') !== 'lazy') {
      showAssetError(img.getAttribute('src'));
    }
  }
}

const media = (query) => window.matchMedia(query).matches;

function webglAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/** The veil: progress springs, the three-beat exit, removal on rendered opacity. */
function createVeil(veil, onLift) {
  const fill = veil.querySelector('[data-veil-fill]');
  const meter = veil.querySelector('[data-veil-meter]');
  const name = veil.querySelector('[data-veil-name]');
  const contents = [veil.querySelector('.veil-mark'), name, veil.querySelector('.veil-meter')];
  const progress = new Spring({ ...CONFIGS.PROGRESS_WAIT, precision: 0.0005 });
  const nameRise = new Spring({ ...CONFIGS.COPY, precision: 0.001 });
  const clear = new Spring({ ...CONFIGS.CLEAR, value: 1, precision: 0.001 });
  const lift = new Spring({ ...CONFIGS.VEIL, value: 1, precision: 0.001 });
  const born = performance.now();
  let readyAt = null;
  let liftAt = null;
  let lifted = false;
  progress.set(VEIL.CREEP);

  let last = null;
  const draw = (time) => {
    const dt = last === null ? 16 : time - last;
    last = time;
    if (time - born >= NAME_RISE_AT) nameRise.set(1);
    progress.step(dt);
    nameRise.step(dt);
    fill.style.transform = `scaleY(${progress.value})`;
    meter.style.transform = `scaleX(${progress.value})`;
    name.style.opacity = String(nameRise.value);
    name.style.transform = `translateY(${((1 - nameRise.value) * 0.6).toFixed(4)}rem)`;
    if (readyAt !== null) {
      clear.set(0);
      clear.step(dt);
      for (const el of contents) {
        el.style.opacity = String(clear.value * (el === name ? nameRise.value : 1));
        el.style.transform = `translateY(${((1 - clear.value) * -0.75).toFixed(4)}rem)`;
      }
      if (time - readyAt >= VEIL.CLEAR_MS + VEIL.PAUSE_MS) {
        if (!lifted) {
          lifted = true;
          liftAt = time;
          onLift();
        }
        lift.set(0);
        lift.step(dt);
        veil.style.opacity = String(lift.value);
        const rendered = Number(getComputedStyle(veil).opacity);
        if (rendered <= VEIL.GONE_AT || time - liftAt > VEIL.LIFT_TIMEOUT_MS) {
          veil.remove();
          unsubscribe();
        }
      }
    }
  };
  const unsubscribe = ticker.subscribe(draw, () => 0);

  return {
    ready() {
      if (readyAt !== null) return;
      readyAt = performance.now();
      progress.tension = CONFIGS.PROGRESS_READY.tension;
      progress.friction = CONFIGS.PROGRESS_READY.friction;
      progress.set(1);
      veil.classList.add('is-ready');
      veil.setAttribute('aria-label', veil.dataset.doneLabel || 'Loaded');
    },
    skip() {
      // No motion wanted, or nothing to wait for: lift at once.
      unsubscribe();
      onLift();
      veil.remove();
    },
  };
}

/** No WebGL: the contour backdrop and the plain portrait in the fit box. */
function mountFallback(section, container) {
  container.replaceChildren();
  const canvas = document.createElement('canvas');
  const img = document.createElement('img');
  img.className = 'hero-fallback-portrait';
  img.alt = '';
  img.src = 'assets/home/hero/person-diffuse.webp';
  container.style.setProperty('--fallback-mask', 'url("assets/home/hero/person-alpha.webp")');
  container.append(canvas, img);
  const place = () => {
    const box = section.querySelector('[data-hero-fit-box]');
    const s = section.getBoundingClientRect();
    if (box && box.offsetParent !== null) {
      const b = box.getBoundingClientRect();
      Object.assign(img.style, { left: `${b.left - s.left}px`, top: `${b.top - s.top}px`, width: `${b.width}px`, height: `${b.height}px` });
    } else {
      Object.assign(img.style, { left: '0', top: '0', width: '100%', height: '100%' });
    }
    const size = fitCanvas(canvas);
    drawContours(canvas.getContext('2d'), { ...size, t: 0, colour: readToken('--surface-soft') });
  };
  new ResizeObserver(place).observe(section);
  place();
}

export async function mount(section) {
  watchImages();
  const container = section.querySelector('[data-hero-scene]');
  const canvas = container.querySelector('canvas');
  const box = section.querySelector('[data-hero-fit-box]');
  const veilEl = section.querySelector('[data-veil]');
  const entrance = animatables(section);
  let scene = null;

  const begin = () => {
    playIn(entrance);
    scene?.beginRise();
  };
  const veil = veilEl ? createVeil(veilEl, begin) : { ready: begin, skip: begin };
  if (veilEl) liftByDeadline(veil);

  if (!webglAvailable()) {
    mountFallback(section, container);
    veil.skip();
    return;
  }

  let module;
  try {
    module = await import('./scene.js');
    scene = new module.HeroScene(canvas);
  } catch (error) {
    showAssetError(error?.url ?? 'site/js/hero/scene.js');
    mountFallback(section, container);
    veil.skip();
    return;
  }
  const { DEFAULT_PARAMS } = module;

  const applyFit = () => {
    const shown = box && box.offsetParent !== null;
    let fit = null;
    if (shown) {
      const s = section.getBoundingClientRect();
      const b = box.getBoundingClientRect();
      fit = fitSubjectToBox(DEFAULT_PARAMS, { top: b.top - s.top, height: b.height }, container.clientHeight);
    }
    // No reveal at any width: the droplet is always visible, so neither the grey
    // cursor reveal nor the idle sweep has anything left to uncover.
    scene.setParams({
      ...DEFAULT_PARAMS, ...fit, bgRevealOpacity: 0, autoSweepAmount: 0,
      // On a phone the screen is narrower than his shoulders: the droplet comes in closer.
      ...(media('(max-width: 639px)') ? { helmetX: DEFAULT_PARAMS.helmetX * 0.8, helmetY: DEFAULT_PARAMS.helmetY + 0.15 } : null),
    });
  };

  const resize = () => {
    scene.resize(container.clientWidth, container.clientHeight);
    applyFit();
  };

  // The pointer, bound only while the tier wants it.
  const onPointer = (event) => {
    scene.setPointer((event.clientX / window.innerWidth) * 2 - 1, (event.clientY / window.innerHeight) * 2 - 1);
  };
  let pointerBound = false;
  const bindPointer = () => {
    const want = scene.tier.pointerEnabled;
    if (want && !pointerBound) window.addEventListener('pointermove', onPointer, { passive: true });
    if (!want && pointerBound) window.removeEventListener('pointermove', onPointer);
    pointerBound = want;
  };

  // The render loop: in view (plus ten frames), tab visible, hero not yet covered.
  let unsubscribe = null;
  let visible = true;
  let tail = 10;
  const frame = (time) => {
    const covered = window.scrollY > window.innerHeight * COVERED_AFTER;
    if (!visible || document.hidden || covered) {
      if (--tail <= 0) stop();
      return;
    }
    tail = 10;
    scene.update(time);
  };
  const start = () => {
    tail = 10;
    if (!unsubscribe) unsubscribe = ticker.subscribe(frame, () => scene.tier.frameInterval);
  };
  const stop = () => {
    unsubscribe?.();
    unsubscribe = null;
  };
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start();
  }).observe(section);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) start(); });
  window.addEventListener('scroll', () => {
    if (window.scrollY <= window.innerHeight * COVERED_AFTER) start();
  }, { passive: true });

  // Re-read the tier on a width change or a pointer-class flip; height-only
  // changes on a coarse pointer are ignored (the iOS URL bar).
  let lastWidth = container.clientWidth;
  let pending = 0;
  const onResize = () => {
    pending = 0;
    const width = container.clientWidth;
    const coarse = media('(hover: none) and (pointer: coarse)');
    if (width !== lastWidth) {
      lastWidth = width;
      scene.retune();
      bindPointer();
      resize();
    } else if (!coarse) {
      resize();
    }
  };
  new ResizeObserver(() => { if (!pending) pending = requestAnimationFrame(onResize); }).observe(container);
  window.matchMedia('(hover: none) and (pointer: coarse)').addEventListener('change', () => {
    scene.retune();
    bindPointer();
    resize();
  });

  scene.onReady = () => veil.ready();
  scene.onError = (url) => {
    showAssetError(url);
    stop();
    mountFallback(section, container);
    veil.ready();
  };
  resize();
  bindPointer();
  start();
  if (scene.failed) scene.onError(scene.failed);
  else if (scene.ready) veil.ready();
}
