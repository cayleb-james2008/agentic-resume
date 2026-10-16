// The quality floor (the "Sign-off" look, 2026-10-16): contrast in light and in dark, one type family, hover only
// where a mouse can hover, and no text under 12px.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const strip = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const tokensCss = strip(read('site/css/tokens.css'));
const sheets = [...readdirSync(new URL('../site/css/', import.meta.url)).filter((f) => f.endsWith('.css')).map((f) => `site/css/${f}`), 'lab/lab.css'];

// --- Colour maths (WCAG 2.x) -------------------------------------------------
const darkAt = tokensCss.indexOf('@media (prefers-color-scheme: dark)');
const declare = (css) => Object.fromEntries([...css.matchAll(/(--[\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
const LIGHT = declare(tokensCss.slice(0, darkAt));
const DARK = { ...LIGHT, ...declare(tokensCss.slice(darkAt)) };
const resolve = (tokens, value) => {
  let m;
  while ((m = /^var\((--[\w-]+)\)$/.exec(value))) value = tokens[m[1]];
  return value;
};
const rgb = (tokens, name) => {
  const hex = /^#([0-9a-f]{6})$/i.exec(resolve(tokens, `var(${name})`));
  assert.ok(hex, `${name} is a hex colour`);
  return [0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16));
};
const luminance = (c) => {
  const [r, g, b] = c.map((v) => { const s = v / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (tokens, fg, bg) => {
  const [a, b] = [luminance(rgb(tokens, fg)), luminance(rgb(tokens, bg))];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};

const PAIRS = [
  // text and its grounds: 4.5:1 or better
  ['--fg', '--bg', 4.5], ['--fg', '--surface', 4.5], ['--fg-2', '--bg', 4.5], ['--fg-2', '--surface', 4.5], ['--fg-2', '--sunk', 4.5],
  ['--accent', '--bg', 4.5], ['--accent', '--surface', 4.5], ['--accent', '--accent-wash', 4.5], ['--on-accent', '--accent', 4.5],
  ['--fg', '--accent-wash', 4.5], ['--warn', '--warn-wash', 4.5], ['--ok', '--ok-wash', 4.5], ['--ok', '--surface', 4.5],
  // field and control borders, and the focus ring: 3:1 or better
  ['--line-strong', '--bg', 3], ['--line-strong', '--surface', 3],
];
for (const [mode, tokens] of [['light', LIGHT], ['dark', DARK]]) {
  test(`every text and control colour reads in ${mode} mode`, () => {
    for (const [fg, bg, min] of PAIRS) {
      const ratio = contrast(tokens, fg, bg);
      assert.ok(ratio >= min, `${mode}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1, under ${min}:1`);
    }
  });
}

test('one family: Mona Sans, with the system monospace kept for code in the project pages', () => {
  assert.match(LIGHT['--font'], /^"Mona Sans"/);
  assert.match(LIGHT['--mono'], /^ui-monospace/);
  for (const sheet of sheets) assert.doesNotMatch(read(sheet), /Onest|JetBrains|IBM Plex|Bricolage|--font-mono/, sheet);
});

test('hover only where a mouse can hover', () => {
  for (const sheet of sheets) {
    // Drop the fine-pointer blocks, then nothing left may react to hover at all.
    const css = strip(read(sheet)).replace(/@media \(hover: hover\) and \(pointer: fine\)\s*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '');
    for (const [, selector] of css.matchAll(/([^{}]+)\{[^{}]*\}/g)) assert.doesNotMatch(selector, /:hover/, `${sheet}: ${selector.trim()}`);
  }
});

// The root stays at the browser's 16px; the smallest step is 13px. A bare rem or a clamp's floor under 0.75rem
// would put text under 12px.
test('no text renders under 12px', () => {
  const under = [];
  for (const sheet of [...sheets, 'site/css/tokens.css']) {
    for (const [, selector, decls] of strip(read(sheet)).matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      for (const [, value] of decls.matchAll(/(?<![-\w])(?:font(?:-size)?|--step-[-\d]+):\s*([^;]+)/g)) {
        const floor = /^clamp\(\s*([\d.]+)rem/.exec(value) || /^max\(\s*(\d+)px/.exec(value);
        if (floor) { if ((value.startsWith('max') ? Number(floor[1]) : Number(floor[1]) * 16) < 12) under.push(`${sheet}: ${selector.trim()} → ${value}`); continue; }
        for (const [, n] of value.matchAll(/(?<![\d.])(\d*\.?\d+)rem/g)) if (Number(n) * 16 < 12) under.push(`${sheet}: ${selector.trim()} → ${value}`);
        for (const [, n] of value.matchAll(/(?<![\d.])(\d*\.?\d+)px/g)) if (Number(n) < 12) under.push(`${sheet}: ${selector.trim()} → ${value}`);
      }
    }
  }
  assert.deepEqual(under, []);
});

test('no AI-template chrome: no em dashes or arrows in the copy, no uppercase labels, no terminal styling', () => {
  const content = JSON.parse(read('site/content.json'));
  const strings = [];
  (function walk(v, path) {
    if (typeof v === 'string') strings.push([path, v]);
    else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) walk(x, `${path}.${k}`);
  })(content, 'content');
  for (const [path, value] of strings) assert.doesNotMatch(value, /[—–→↗↓]/, `${path}: "${value}"`);
  for (const sheet of sheets.filter((s) => !s.startsWith('lab/'))) {
    assert.doesNotMatch(strip(read(sheet)), /text-transform:\s*uppercase/, sheet);
  }
  const home = read('index.html');
  assert.doesNotMatch(home, /class="[^"]*\bmono\b|class="mk\b|&gt;_/, 'no terminal styling or >_ tile on the homepage');
});
