/**
 * Device tier for the water story — decided once at construction and read by
 * everything (render DPR, frame budget, pointer ripples, ripple grid, team
 * size), so the values can never drift apart. Feature-local port of the
 * canonical device module from the optimize-3d-scene skill (§2), retuned for a
 * single fullscreen fragment pass instead of a modelled scene.
 *
 * It reads `env` (window by default) so node can test the matrix. Nothing runs
 * at import: the browser lookup is only built when `getStoryTier()` is called
 * with no argument.
 *
 * Read at construction, and again when the stage **width** changes (the story
 * retunes only on that, so iOS address-bar resizes don't thrash). A device does
 * not change tier mid-session, but a window dragged across a breakpoint and a
 * device emulator switched off both do.
 */
const browserEnv = () => ({
  matchMedia: (q) => window.matchMedia(q),
  innerWidth: window.innerWidth,
  navigator,
});

/**
 * The cap for touch tiers, as the shared ticker measures it.
 *
 * The ticker skips while `time - last <= framerate`, so a budget of exactly
 * 1000/60 lets a 60Hz screen through every tick (16.67 is not <= 16.67 minus
 * float noise… until it is), and on a 120Hz screen the first tick past it
 * lands at 25ms — 40fps, not 60. Two milliseconds under puts 60Hz on every
 * tick and 120Hz on every second one, which is what "60" is meant to say.
 */
export const CAP_60 = 1000 / 60 - 2;

/**
 * The nearest web-exposed proxy for iOS Low Power Mode, which has no API.
 * Save-Data is an explicit request to spend less; 2GB or under is the class of
 * device that cannot hold a 60fps fragment loop anyway.
 */
const isEnergySaver = (nav) => Boolean(nav.connection?.saveData) || (nav.deviceMemory ?? 8) <= 2;

export const getStoryTier = (env = browserEnv()) => {
  // The coarse-pointer clause is what catches tablets and large phones; width
  // alone misses an iPad in landscape.
  const coarse = env.matchMedia('(hover: none) and (pointer: coarse)').matches;
  const width = env.innerWidth;
  const name = width < 768 || (coarse && width < 1024)
    ? 'mobile'
    : coarse || width < 1280
      ? 'tablet'
      : 'desktop';
  const mobile = name === 'mobile';
  const reducedMotion = env.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const saver = isEnergySaver(env.navigator ?? {});
  return {
    name,
    mobile,
    coarsePointer: coarse,
    reducedMotion,
    // 1 → 1.25 → 1.5. The water is a soft signed-distance edge with no hairline
    // detail, so a phone holds at 1 rather than paying for its native 3×; and
    // nothing goes above 1.5, which would only buy fragments nobody can see.
    maxDpr: mobile ? 1 : name === 'tablet' ? 1.25 : 1.5,
    // Touch tiers cap at 60, desktop runs every tick. The ripples and the
    // morphs are the only motion a reader watches closely, and a stepped
    // ripple reads as lag, so the cap is 60 and not lower.
    frameInterval: name === 'desktop' ? 0 : CAP_60,
    // A fine pointer ripples the water as it moves; touch and reduced motion do not.
    pointerEnabled: !coarse && !reducedMotion,
    // The long side of the ripple grid, in cells (ripple.js `rippleSize`).
    rippleLong: mobile ? 72 : 128,
    // How many people the team beat fans out to (shapes.js `layoutFor`).
    teamSize: mobile ? 4 : 6,
    // Reduced motion, or a phone in energy-saver mode: render only when scroll
    // progress changes, with no ripples and no idle wobble.
    freeze: reducedMotion || (mobile && saver),
  };
};
