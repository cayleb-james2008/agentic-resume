/**
 * What the water is shaped like in each beat — pure maths, no DOM, no WebGL.
 *
 * Everything is in **stage units**: origin bottom-left, y runs 0..1 (the stage
 * height) and x runs 0..aspect. The shader draws a smooth union of up to
 * `MAX_SLOTS` primitives, each a **slot**:
 *
 *     { a: [x, y], b: [x, y], th, r, fill }
 *
 * an oriented box that runs from `a` to `b` along its axis and is `th` thick
 * across it, rounded by `r`, with `fill` (0..1) of its length from `a` filled.
 * A circle is `a = b, th = 0, r`; a channel is `th = 0` and a small `r`. A slot
 * with no size or no fill is not drawn; unused slots are `PAD` (all zero).
 *
 * The layout (`layoutFor`) is the single source of positions: `slotsFor` builds
 * the water from it and `overlaysFor` places the DOM labels from it, so a label
 * sits exactly on the node the shader draws.
 */
export const MAX_SLOTS = 16;

/** A beat's first 40% is its morph in from the beat before. */
const MORPH = 0.4;
/** The beats, in order. timeline.js owns their lengths; this is only the order. */
const ORDER = ['intro', 'hero', 'shape', 'team', 'tickets', 'worth', 'drain'];
/** How far the pool and waterline reach past each side of the stage. */
const BLEED = 0.3;
/** How much of the art box a silhouette may fill, either way. */
const FIT = 0.78;

/**
 * The radii of the team and tickets beats' circles, in stage heights. The
 * story's CSS places the labels' offsets from them (story.css `--node-r`,
 * `--gate-r`), and a test holds the two together.
 */
export const SOURCE_R = 0.045;
export const NODE_R = 0.032;
export const GATE_R = 0.03;

// ease and ramp are timeline.js's too; two one-liners are cheaper than a module.
const ramp = (x, a, b) => Math.min(1, Math.max(0, (x - a) / (b - a)));
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const lerp = (x, y, e) => x + (y - x) * e;

// --- Slots ------------------------------------------------------------------

const PAD = () => ({ a: [0, 0], b: [0, 0], th: 0, r: 0, fill: 0 });
const slot = (a, b, th, r, fill = 1) => ({ a: [a[0], a[1]], b: [b[0], b[1]], th, r, fill });
const circle = (c, r, fill = 1) => slot(c, c, 0, r, fill);
const capsule = (a, b, fill, r = 0.006) => slot(a, b, 0, r, fill);
const padded = (list) => {
  while (list.length < MAX_SLOTS) list.push(PAD());
  return list;
};
const isPad = (s) => s.r === 0 && s.th === 0 && s.fill === 0;

/** The tight bounds of a slot, for fitting silhouettes: its box's corners, grown by `r`. */
const reach = (s) => {
  const dx = s.b[0] - s.a[0], dy = s.b[1] - s.a[1], len = Math.hypot(dx, dy), half = s.th / 2;
  const gx = len > 1e-9 ? (Math.abs(dy) / len) * half : half;
  const gy = len > 1e-9 ? (Math.abs(dx) / len) * half : half;
  return {
    x0: Math.min(s.a[0], s.b[0]) - gx - s.r, x1: Math.max(s.a[0], s.b[0]) + gx + s.r,
    y0: Math.min(s.a[1], s.b[1]) - gy - s.r, y1: Math.max(s.a[1], s.b[1]) + gy + s.r,
  };
};

const centre = (s) => [(s.a[0] + s.b[0]) / 2, (s.a[1] + s.b[1]) / 2];
const ghost = (s) => ({ a: centre(s), b: centre(s), th: 0, r: 0, fill: 0 });

/**
 * Blend one beat's slots into another's, slot i into slot i. A slot that is
 * unused on one side shrinks to (or grows from) the point at the middle of its
 * counterpart, so water appears and vanishes in place instead of sliding in
 * from the corner.
 */
const lerpSlots = (from, to, e) => from.map((f, i) => {
  const g = to[i];
  const p = isPad(f) ? ghost(g) : f, q = isPad(g) ? ghost(f) : g;
  return {
    a: [lerp(p.a[0], q.a[0], e), lerp(p.a[1], q.a[1], e)],
    b: [lerp(p.b[0], q.b[0], e), lerp(p.b[1], q.b[1], e)],
    th: lerp(p.th, q.th, e), r: lerp(p.r, q.r, e), fill: lerp(p.fill, q.fill, e),
  };
});

// --- Layout -----------------------------------------------------------------

/**
 * The reserved top-left box the captions sit in. No water may enter it. On a
 * wide stage it is the left half's upper part; on a tall one the top band.
 */
export const CAPTION_BOX = (aspect) => (aspect >= 1
  ? { x0: 0, x1: 0.5 * aspect, y0: 0.55, y1: 1 }
  : { x0: 0, x1: aspect, y0: 0.64, y1: 1 });

/**
 * Where everything goes for one stage shape. `art` is the box the beats draw
 * in (right of the caption on a wide stage, below it on a tall one); the rest
 * are points inside it, as [x, y]:
 *
 *   nodes    one per person: a shallow arc (wide) or a grid, two across (tall)
 *   source   the root the channels branch from, at the top centre
 *   gates    the three escalation steps, rising left to right
 *   columns  one x per person for the worth beat's columns (left 75%)
 *
 * `teamSize` is 6, or 4 on a phone; the tall grid is two across whatever it is.
 */
export const layoutFor = (aspect, teamSize) => {
  const wide = aspect >= 1;
  const art = wide
    ? { x0: 0.54 * aspect, x1: 0.96 * aspect, y0: 0.1, y1: 0.9 }
    : { x0: 0.06 * aspect, x1: 0.94 * aspect, y0: 0.06, y1: 0.58 };
  const w = art.x1 - art.x0, h = art.y1 - art.y0;
  const at = (fx, fy) => [art.x0 + w * fx, art.y0 + h * fy];   // a point by fraction of the art box
  const rows = Math.ceil(teamSize / 2);

  const nodes = Array.from({ length: teamSize }, (_, i) => {
    if (!wide) return at(i % 2 ? 0.85 : 0.15, 0.6 * (1 - (Math.floor(i / 2) + 0.5) / rows));   // lower 60%, wide apart so no channel grazes another node
    const s = teamSize > 1 ? i / (teamSize - 1) : 0.5;
    return at(0.08 + 0.84 * s, 0.22 + 0.06 * (2 * s - 1) ** 2);   // the ends sit 0.06h higher
  });
  // The tall stage lifts its gates so the chain still climbs from its first node (a grid node, above a wide arc's end).
  const gateY = wide ? [0.36, 0.52, 0.68] : [0.6, 0.72, 0.84];
  return {
    aspect,
    teamSize,
    art,
    poolTop: wide ? 0.34 : 0.3,
    nodes,
    source: at(0.5, 0.92),
    gates: [0.35, 0.6, 0.85].map((fx, i) => at(fx, gateY[i])),
    columns: Array.from({ length: teamSize }, (_, i) => art.x0 + w * 0.75 * ((i + 0.5) / teamSize)),
  };
};

/** The spill container on the worth beat: the right 20% of the art box. */
const spillOf = ({ art }) => {
  const w = art.x1 - art.x0, h = art.y1 - art.y0;
  return { x: art.x0 + w * 0.9, width: w * 0.16, top: art.y0 + h * 0.5 };
};

// --- Silhouettes ------------------------------------------------------------

/**
 * The three shapes the water takes, drawn in their own units (y up) as
 * [ax, ay, bx, by, th, r]. Slot 0 is always the low, wide body, so the pool
 * rises into it without sweeping through the caption; the rest grow in place.
 * Each is at most 6 slots, and `fitSilhouette` scales it into the art box.
 */
const SILHOUETTES = [
  [   // moving truck: chassis, cargo box, cab, two wheels
    [0, 0.45, 3.3, 0.45, 0.3, 0.04],
    [0, 1.35, 2.3, 1.35, 1.5, 0.08],
    [2.55, 1.0, 3.3, 1.0, 0.95, 0.08],
    [0.75, 0.3, 0.75, 0.3, 0, 0.4],
    [2.65, 0.3, 2.65, 0.3, 0, 0.4],
  ],
  [   // office desk: top, monitor, two legs, stand
    [0, 1.1, 3.2, 1.1, 0.22, 0.04],
    [0.9, 1.95, 2.3, 1.95, 1.0, 0.08],
    [0.35, 0, 0.35, 1.1, 0.3, 0],
    [2.85, 0, 2.85, 1.1, 0.3, 0],
    [1.6, 1.2, 1.6, 1.45, 0.3, 0.03],
  ],
  [   // shop counter: counter, awning, two posts
    [0.2, 0.55, 2.9, 0.55, 1.1, 0.05],
    [-0.1, 2.2, 3.2, 2.2, 0.3, 0.05],
    [0.15, 1.0, 0.15, 2.2, 0.22, 0],
    [2.95, 1.0, 2.95, 2.2, 0.22, 0],
  ],
];

/** Scale a silhouette to FIT of the art box (whichever way is tighter) and centre it there. */
const fitSilhouette = (prims, art) => {
  const raw = prims.map(([ax, ay, bx, by, th, r]) => slot([ax, ay], [bx, by], th, r));
  const boxes = raw.map(reach);
  const x0 = Math.min(...boxes.map((b) => b.x0)), x1 = Math.max(...boxes.map((b) => b.x1));
  const y0 = Math.min(...boxes.map((b) => b.y0)), y1 = Math.max(...boxes.map((b) => b.y1));
  const k = Math.min((FIT * (art.x1 - art.x0)) / (x1 - x0), (FIT * (art.y1 - art.y0)) / (y1 - y0));
  const cx = (art.x0 + art.x1) / 2, cy = (art.y0 + art.y1) / 2, mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  const map = ([x, y]) => [cx + (x - mx) * k, cy + (y - my) * k];
  return padded(raw.map((s) => slot(map(s.a), map(s.b), s.th * k, s.r * k)));
};

// --- The beats --------------------------------------------------------------

const poolAt = (aspect, th) => slot([-BLEED, th / 2], [aspect + BLEED, th / 2], th, 0);

/** A drop falls from the name, lands at the foot of the stage and joins a pool rising under it. */
const introSlots = (t, L) => {
  const list = [poolAt(L.aspect, L.poolTop * ramp(t, 0.55, 1))];
  const q = ramp(t, 0.35, 0.6);
  const r = 0.022 * ramp(t, 0.35, 0.4) * (1 - ramp(t, 0.6, 0.75));
  if (r > 0) list.push(circle([L.aspect / 2, lerp(0.5, L.poolTop * 0.1, q * q)], r));
  return padded(list);
};

/** The calm pool across the foot of the stage. */
const heroSlots = (t, L) => padded([poolAt(L.aspect, L.poolTop)]);

/** Thirds of the beat pick the silhouette; each morphs in over its first 40%, then holds. */
const third = (t) => {
  const k = Math.min(2, Math.floor(t * 3));
  return { k, u: t * 3 - k };
};
const shapeSlots = (t, L) => {
  const { k, u } = third(t);
  const to = fitSilhouette(SILHOUETTES[k], L.art);
  if (u >= MORPH) return to;
  return lerpSlots(k === 0 ? heroSlots(1, L) : fitSilhouette(SILHOUETTES[k - 1], L.art), to, ease(u / MORPH));
};

/**
 * A source, and a channel from it to each person that fills out in turn; each
 * person's node swells once its channel arrives. Slot 0 is the source, then the
 * nodes, then the channels.
 */
const teamSlots = (t, L) => {
  const start = (i) => 0.1 + 0.06 * i;
  return padded([
    circle(L.source, SOURCE_R),
    ...L.nodes.map((p, i) => circle(p, NODE_R * ease(ramp(t, start(i) + 0.2, start(i) + 0.3)))),
    ...L.nodes.map((p, i) => capsule(L.source, p, ease(ramp(t, start(i), start(i) + 0.2)))),
  ]);
};

/** The point `d` along a polyline of [x, y]s. */
const along = (points, d) => {
  for (let i = 1; i < points.length; i++) {
    const len = Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
    if (d <= len || i === points.length - 1) {
      const f = len > 0 ? Math.min(1, d / len) : 1;
      return [lerp(points[i - 1][0], points[i][0], f), lerp(points[i - 1][1], points[i][1], f)];
    }
    d -= len;
  }
  return points[0];
};

/**
 * One person, three gates in a chain, and three drops sent down it: the first
 * stops at gate 0, the second at gate 1, the third goes all the way to gate 2.
 */
const ticketSlots = (t, L) => {
  const chain = [L.nodes[0], ...L.gates];
  const to = [0];   // distance along the chain to each point
  for (let i = 1; i < chain.length; i++) to.push(to[i - 1] + Math.hypot(chain[i][0] - chain[i - 1][0], chain[i][1] - chain[i - 1][1]));
  return padded([
    circle(chain[0], NODE_R),
    ...L.gates.map((g) => circle(g, GATE_R)),
    ...[0, 1, 2].map((i) => capsule(chain[i], chain[i + 1], 1)),
    ...[0, 1, 2].map((j) => {
      const go = ease(ramp(t, 0.4 + 0.12 * j, 0.68 + 0.12 * j));
      return circle(along(chain, go * to[j + 1]), 0.014);
    }),
  ]);
};

/**
 * A column of water per person, rising together, and a container to the right
 * that fills from a spout off the last column. Slots 0..n-1 are the columns,
 * then the container, then the spout.
 */
const worthSlots = (t, L) => {
  const { art, columns } = L;
  const w = art.x1 - art.x0, h = art.y1 - art.y0, spill = spillOf(L);
  const rise = art.y0 + h * (0.12 + 0.43 * ease(t));
  return padded([
    ...columns.map((x) => slot([x, art.y0], [x, rise], (0.5 * w) / L.teamSize, 0)),
    slot([spill.x, art.y0], [spill.x, spill.top], spill.width, 0, ease(ramp(t, 0.6, 1))),
    capsule([columns[L.teamSize - 1], rise], [spill.x, art.y0 + h * 0.4], ease(ramp(t, 0.5, 0.65))),
  ]);
};

/** Everything drains to one line along the foot of the stage. */
const drainSlots = (t, L) => padded([slot([-BLEED, 0.012], [L.aspect + BLEED, 0.012], 0.012, 0)]);

const BUILD = { intro: introSlots, hero: heroSlots, shape: shapeSlots, team: teamSlots, tickets: ticketSlots, worth: worthSlots, drain: drainSlots };

/** The beats that open by flowing in from the one before (shape handles its own, hero and intro have none). */
const FLOWS_IN = new Set(['team', 'tickets', 'worth', 'drain']);

/**
 * How far through its morph a beat is at local time `t`: 0 as it starts, 1 once
 * it has settled. The intro hands the hero a finished pool, so neither morphs;
 * the shape beat morphs three times, at the start of each third.
 */
export const morphAt = (id, t) => {
  if (id === 'intro' || id === 'hero') return 1;
  return Math.min(1, (id === 'shape' ? third(t).u : t) / MORPH);
};

/**
 * The `MAX_SLOTS` slots for beat `id` at local time `t` (0..1). During a beat's
 * morph (its first 40%; the shape beat's own, at the start of each third) they
 * blend from the previous beat's last frame, eased, so scrolling back plays the
 * same frames in reverse.
 */
export const slotsFor = (id, t, layout) => {
  const build = BUILD[id];
  if (!build) throw new RangeError(`unknown beat: ${id}`);
  const local = Math.min(1, Math.max(0, t));
  const slots = build(local, layout);
  const m = morphAt(id, local);
  if (!FLOWS_IN.has(id) || m >= 1) return slots;
  return lerpSlots(BUILD[ORDER[ORDER.indexOf(id) - 1]](1, layout), slots, ease(m));
};

// --- Overlays ---------------------------------------------------------------

/** Each person's apps; the three lists cycle by index. */
const APPS = [['mail', 'calendar'], ['sheet', 'phone', 'mail'], ['chat', 'calendar']];

/**
 * Where the DOM labels go, from the same layout as the water: positions and
 * indices only — every word comes from content and is set by the story markup.
 * `source` is the team beat's root, the node every channel branches from;
 * `tickets.source` is something else: the person the tickets come from.
 */
export const overlaysFor = (layout) => {
  const { art, nodes, gates, columns } = layout;
  const w = art.x1 - art.x0, h = art.y1 - art.y0, spill = spillOf(layout);
  const labelY = Math.max(0.045, art.y0 - 0.05);   // under the art box, clear of the stage edge
  return {
    shape: [0, 1, 2].map((index) => ({ x: art.x0 + (w * (2 * index + 1)) / 6, y: labelY, index })),
    team: nodes.map(([x, y], index) => ({ x, y, index, apps: [...APPS[index % APPS.length]] })),
    source: { x: layout.source[0], y: layout.source[1] },
    tickets: {
      source: { x: nodes[0][0], y: nodes[0][1] },
      gates: gates.map(([x, y], index) => ({ x, y, index })),
    },
    worth: {
      price: { x: columns[0], y: art.y0 + h * 0.12 },
      more: { x: spill.x, y: spill.top },
    },
  };
};
