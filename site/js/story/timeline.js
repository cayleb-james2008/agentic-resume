/**
 * The story's clock — pure maths, no DOM. Scroll progress (0..1 over the whole
 * runway) goes in; everything the page draws comes out: the name's flight to
 * the masthead, each beat's caption and overlay opacity, and the water's slots.
 * Every value is a function of progress alone (no history), so scrolling back
 * plays the same frames in reverse.
 *
 * Beat lengths are in screens, as the runway is laid out: the section is
 * `RUNWAY_SCREENS` viewports of scrolling, so progress p is at p × 7 screens.
 */
import { morphAt, silhouetteAt, slotsFor } from './shapes.js';

export const BEATS = Object.freeze([
  { id: 'intro', screens: 1.5 }, { id: 'hero', screens: 0.75 }, { id: 'shape', screens: 1 },
  { id: 'team', screens: 1.25 }, { id: 'tickets', screens: 1 }, { id: 'worth', screens: 1 }, { id: 'drain', screens: 0.5 },
].map(Object.freeze));

/** The runway's length in screens: the sum of BEATS. */
export const RUNWAY_SCREENS = 7;

// ease and ramp are shapes.js's too; two one-liners are cheaper than a module.
const ramp = (x, a, b) => Math.min(1, Math.max(0, (x - a) / (b - a)));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Each beat's start, in screens. */
const STARTS = BEATS.map((_, i) => BEATS.slice(0, i).reduce((s, b) => s + b.screens, 0));

/** The global progress at which the intro's drop lands (intro t 0.6). */
const SPLASH_AT = (0.6 * BEATS[0].screens) / RUNWAY_SCREENS;

/** The hero line rises from intro t 0.8 and is full by hero t 0.2, in screens: [1.2, 1.65]. */
const HERO_RISE = [STARTS[0] + 0.8 * BEATS[0].screens, STARTS[1] + 0.2 * BEATS[1].screens];

/** Which beat progress is in, and how far through it (0..1). Out-of-range progress clamps. */
export const beatAt = (progress) => {
  const screens = Math.min(1, Math.max(0, Number(progress) || 0)) * RUNWAY_SCREENS;
  let index = BEATS.findIndex((b, i) => screens < STARTS[i] + b.screens);
  if (index < 0) index = BEATS.length - 1;
  return { index, id: BEATS[index].id, t: ramp(screens, STARTS[index], STARTS[index] + BEATS[index].screens) };
};

/** A caption fades in over the first 25% of its beat and out over the last 15%. */
const fadeOut = (t) => 1 - ease(ramp(t, 0.85, 1));
const captionAt = (t) => ease(ramp(t, 0, 0.25)) * fadeOut(t);

/**
 * Everything at one scroll position, for the layout `layoutFor` made.
 *
 *   beat      the beat's id, and `t` how far through it (0..1)
 *   name      the name block: `y` is how far it has risen (stage heights, up
 *             positive like every stage coordinate), `scale`, letter `spread`
 *             (em) and `opacity`; it has flown to the masthead, and faded, by intro t 0.6
 *   cue       the scroll cue's opacity; masthead, the masthead's
 *   captions  opacity per caption; at most one is above 0.5
 *   overlays  opacity per label group: its caption's, but only once the beat's
 *             morph is over (t 0.4); the shape beat's once its first silhouette
 *             has settled, for it morphs three times
 *   shapeIndex the silhouette the shape beat holds (0 truck, 1 desk, 2 shop),
 *             so its label can be marked; null in every other beat
 *   slots     the water, `MAX_SLOTS` of them (shapes.js)
 *   flow      0..1, a swell while the water changes shape (0 when it is still)
 *   splashAt  the progress at which the drop lands: a constant, for the ripple
 */
export const storyState = (progress, layout) => {
  const { index, id, t } = beatAt(progress);
  const screens = Math.min(1, Math.max(0, Number(progress) || 0)) * RUNWAY_SCREENS;
  const intro = index === 0 ? t : 1;   // the intro's own clock, finished once it is over
  const fly = ease(ramp(intro, 0, 0.6));

  // Only a beat's own caption and overlay show, and only the hero's reaches back into the intro.
  const caption = (name) => (id === name ? captionAt(t) : 0);
  const captions = {
    hero: index <= 1 ? ease(ramp(screens, HERO_RISE[0], HERO_RISE[1])) * (id === 'hero' ? fadeOut(t) : 1) : 0,
    shape: caption('shape'),
    team: caption('team'),
    tickets: caption('tickets'),
    worth: caption('worth'),
  };
  const settled = ease(ramp(t, 0.4, 0.55));
  const overlays = {
    shape: captions.shape * ease(ramp(t, 0.4 / 3, 0.55 / 3)),   // the first third's own settle
    team: captions.team * settled,
    tickets: captions.tickets * settled,
    worth: captions.worth * settled,
  };

  const morph = morphAt(id, t);
  return {
    beat: id,
    t,
    name: {
      y: 0.38 * fly,
      scale: 1 - 0.65 * fly,
      spread: 0.3 * ramp(intro, 0, 0.5),
      // Gone by the time it reaches the top (intro t 0.6), when the masthead starts to show: the two never overlap.
      opacity: 1 - ramp(intro, 0.4, 0.6),
    },
    cue: 1 - ramp(intro, 0, 0.15),
    masthead: ramp(intro, 0.6, 0.9),
    captions,
    overlays,
    shapeIndex: id === 'shape' ? silhouetteAt(t) : null,
    slots: slotsFor(id, t, layout),
    flow: morph < 1 ? Math.sin(Math.PI * morph) : 0,
    splashAt: SPLASH_AT,
  };
};
