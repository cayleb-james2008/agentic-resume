// The final quality pass (2026-10-12): contrast, the hero's in-between widths, legibility over
// pictures and halftone, the guide's corner, landscape phones and the covered stack layer.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const strip = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const tokensCss = read('site/css/tokens.css');

// --- Colour maths (WCAG 2.x) -------------------------------------------------
const tokens = {};
for (const [, name, value] of strip(tokensCss).matchAll(/(--[\w-]+):\s*([^;]+);/g)) if (!(name in tokens)) tokens[name] = value.trim();
const resolve = (value) => {
  let m;
  while ((m = /^var\((--[\w-]+)\)$/.exec(value))) value = tokens[m[1]];
  return value;
};
const rgba = (value) => {
  const v = resolve(value);
  const hex = /^#([0-9a-f]{6})$/i.exec(v);
  if (hex) return [0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16)).concat(1);
  const fn = /^rgb\((\d+) (\d+) (\d+)(?: \/ ([\d.]+))?\)$/.exec(v);
  assert.ok(fn, `not a colour: ${value} → ${v}`);
  return [Number(fn[1]), Number(fn[2]), Number(fn[3]), fn[4] === undefined ? 1 : Number(fn[4])];
};
const over = (fg, bg) => fg.slice(0, 3).map((c, i) => c * fg[3] + bg[i] * (1 - fg[3]));
const luminance = (rgb) => {
  const [r, g, b] = rgb.map((c) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (fgToken, bgToken) => {
  const bg = rgba(`var(${bgToken})`);
  const [a, b] = [luminance(over(rgba(`var(${fgToken})`), bg)), luminance(bg.slice(0, 3))];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};

test('muted labels on the light ground read at 4.5:1 or better', () => {
  assert.ok(contrast('--foreground-muted', '--background') >= 4.5, contrast('--foreground-muted', '--background').toFixed(2));
});

test('the footer copyright reads at 4.5:1 or better on black', () => {
  assert.ok(contrast('--foreground-on-dark-faint', '--surface-black') >= 4.5);
});

test('accent type on the light ground uses the deeper ink accent, 4.5:1 or better', () => {
  assert.ok(contrast('--accent-ink', '--background') >= 4.5);
  const hero = strip(read('site/css/hero.css'));
  assert.match(hero, /\.panel-eyebrow\s*\{[^}]*color:\s*var\(--accent-ink\)/);
  // Hover and focus on the light hero go to the ink accent too.
  for (const sel of ['.masthead-action:hover', '.hero-lab:hover .hero-lab-label', '.hero-links a:hover']) {
    const rule = hero.slice(hero.indexOf(sel));
    assert.match(rule.slice(0, rule.indexOf('}')), /color:\s*var\(--accent-ink\)/, sel);
  }
});

test('the spec\'s tier-1 colours stay; the new ones are added beside them', () => {
  assert.match(tokensCss, /--raw-color-ink-alpha-35: rgb\(9 10 11 \/ 0\.35\);/);
  assert.match(tokensCss, /--raw-color-white-alpha-40: rgb\(255 255 255 \/ 0\.4\);/);
  // The stats panel's hairlines keep the faint ink they were drawn in.
  assert.match(strip(read('site/css/projects.css')), /background:\s*var\(--hairline-ink\)/);
});

// --- The hero between the reference's widths ---------------------------------
const heroCss = strip(read('site/css/hero.css'));
const block = (css, query) => {
  const at = css.indexOf(`@media ${query}`);
  assert.ok(at >= 0, `no @media ${query}`);
  let depth = 0;
  for (let i = css.indexOf('{', at); i < css.length; i++) {
    if (css[i] === '{') depth++;
    if (css[i] === '}' && --depth === 0) return css.slice(at, i + 1);
  }
  return '';
};

test('from 1441px the eyebrow and identity column grow with the name', () => {
  const band = block(heroCss, '(min-width: 1441px) and (max-width: 1920px)');
  assert.match(band, /\.hero-id\s*\{[^}]*left:\s*calc\(22\.5rem \* var\(--hero-base\)\)/);
  assert.match(band, /\.hero-identity\s*\{[^}]*max-width:\s*calc\(26\.0625rem \* var\(--hero-base\)\)/);
});

test('between 1024 and 1279 the action row stands at the hero\'s foot, off his face', () => {
  const tight = block(heroCss, '(min-width: 768px) and (max-width: 1023px)');
  assert.match(tight, /\.hero-middle\s*\{[^}]*flex:\s*0/);
  assert.doesNotMatch(block(heroCss, '(min-width: 768px) and (max-width: 1279px)'), /flex:\s*0/);
});

test('on tablets the portrait starts below the action row', () => {
  const tablet = block(heroCss, '(max-width: 1023px)');
  assert.match(tablet, /\.hero-fit\s*\{[^}]*top:\s*clamp\(30%, 23\.5rem, 45%\)/);
});

// --- Legibility over pictures and halftone ------------------------------------
test('timeline copy keeps its dark halo at every width', () => {
  const css = strip(read('site/css/experience.css'));
  const rule = css.match(/(^|\})\s*\.row-copy, \.row-title\s*\{([^}]*)\}/);
  assert.ok(rule, 'an unconditional .row-copy, .row-title rule');
  assert.match(rule[2], /text-shadow:/);
});

test('the approach intro and map labels carry a dark halo', () => {
  const css = strip(read('site/css/approach.css'));
  assert.match(css, /\.approach-intro\s*\{[^}]*text-shadow:/);
  assert.match(css, /\.map-label\s*\{[^}]*paint-order:\s*stroke/);
});

// --- The guide's corner --------------------------------------------------------
test('from 640px the loop legend sits bottom-left, out of the guide\'s corner', () => {
  const css = strip(read('site/css/approach.css'));
  const all = css.split('@media (min-width: 640px)').slice(1).map((part) => block('@media (min-width: 640px)' + part, '(min-width: 640px)'));
  assert.ok(all.some((b) => /\.approach-plate\s*\{[^}]*align-self:\s*flex-start/.test(b)));
  // …and after the base rule, which would otherwise win.
  assert.ok(css.lastIndexOf('align-self: flex-start') > css.indexOf('.approach-plate {'));
});

test('landscape phones get the phone guide: one greeting, then a button', () => {
  const js = read('site/js/guide/guide.js');
  assert.match(js, /matchMedia\('\(max-width: 639px\), \(max-height: 500px\)'\)/);
});

// --- Projects on phones -----------------------------------------------------------
test('on phones the projects figure keeps his whole head and the laptop in frame', () => {
  const phone = block(strip(read('site/css/projects.css')), '(max-width: 639px)');
  const cap = phone.match(/--fig-cap:\s*min\((\d+)px, ([\d.]+)cqw\)/);
  const x = phone.match(/--fig-x-override:\s*calc\(50% \+ (\d+)px\)/);
  assert.ok(cap && x, 'phone --fig-cap: min(Npx, Mcqw) and --fig-x-override: calc(50% + Npx)');
  // Measured on assets/home/projects/figure.webp (1186×1024): back of the hair at x=234,
  // the laptop's far corner at x=874.
  const W = 1186, H = 1024, HEAD = 234, LAPTOP = 874;
  for (const vw of [360, 390, 414, 430]) {
    const h = Math.min(Number(cap[1]), (Number(cap[2]) * vw) / 100);
    const scale = h / H;
    const left = vw / 2 + Number(x[1]) - (W * scale) / 2;
    assert.ok(left + HEAD * scale >= 8, `${vw}: hair cut at ${(left + HEAD * scale).toFixed(1)}px`);
    assert.ok(left + LAPTOP * scale <= vw, `${vw}: laptop cut at ${(left + LAPTOP * scale).toFixed(1)}px`);
  }
});

test('a landscape phone gives the projects block room for its stats and copy', () => {
  const short = block(strip(read('site/css/projects.css')), '(max-height: 500px) and (min-width: 640px)');
  const vw = short.match(/--block-h:\s*max\(100lvh, (\d+)vw\)/);
  assert.ok(vw && Number(vw[1]) >= 106, short);
  // …and a figure that stands right of the stats and the intro copy (which end 35.5% across)
  // with the laptop still inside the frame. Arm at x=19 and laptop corner at x=874 of 1186×1024.
  const cap = short.match(/--fig-cap:\s*([\d.]+)cqw/);
  const x = short.match(/--fig-x-override:\s*([\d.]+)%/);
  assert.ok(cap && x, 'short landscape sets --fig-cap (cqw) and --fig-x-override (%)');
  const scale = Number(cap[1]) / 100 / 1024; // per px of width
  const left = Number(x[1]) / 100 - (1186 * scale) / 2;
  assert.ok(left + 19 * scale >= 0.355, `arm at ${(left + 19 * scale).toFixed(3)} of the width`);
  assert.ok(left + 874 * scale <= 0.985, `laptop at ${(left + 874 * scale).toFixed(3)} of the width`);
});

// --- The stack -----------------------------------------------------------------------
test('a covered stack layer fades out but stays in the accessibility tree', () => {
  const js = read('site/js/engine/stack.js');
  assert.doesNotMatch(js, /style\.visibility/);
  assert.match(js, /inner\.style\.opacity/);
});

// --- The agent's face -------------------------------------------------------------------
// His generated scenes draw the agent as clear glass, two oval eyes and a cyan glow along the
// foot. The old cyan core sat just under the eyes and read as a nose or a mouth.
test('the hero droplet has no core under its eyes; a cyan rim lights its foot', () => {
  const js = read('site/js/hero/droplet.js');
  assert.doesNotMatch(js, /name = "core"/);
  assert.match(js, /name = "rim"/);
});

test('the guide droplet matches: no core disc, a rim along the foot', () => {
  const home = read('index.html');
  assert.doesNotMatch(home, /guide-droplet-core/);
  // The rim is the body's own outline filled with a glow that rises from the foot.
  const body = home.match(/<path class="guide-droplet-body" d="([^"]+)"/)[1];
  assert.ok(home.includes(`<path class="guide-droplet-rim" d="${body}"/>`));
  assert.match(home, /<linearGradient id="guide-foot"[^>]*>(<stop[^>]*>){2}<\/linearGradient>/);
  assert.match(read('site/css/guide.css'), /\.guide-droplet-rim\s*\{\s*fill:\s*url\(#guide-foot\)/);
  assert.doesNotMatch(read('site/css/guide.css'), /guide-droplet-core/);
});

// --- Weight ----------------------------------------------------------------------------
test('timeline plates offer a 960px file, so phones and the side plates skip the full 1431px one', async () => {
  const { existsSync } = await import('node:fs');
  const home = read('index.html');
  const imgs = [...home.matchAll(/<img src="(assets\/home\/experience\/[^"]+\.webp)"[^>]*>/g)];
  assert.equal(imgs.length, 7);
  for (const [tag, src] of imgs) {
    const small = src.replace(/\.webp$/, '-960.webp');
    assert.ok(tag.includes(`srcset="${small} 960w, ${src} 1431w"`), tag);
    assert.match(tag, /sizes="\(max-width: 639px\) 82vw, (50|24)vw"/);
    assert.ok(existsSync(new URL('../' + small, import.meta.url)), small);
  }
});
