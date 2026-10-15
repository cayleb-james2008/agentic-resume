import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';

const read = (file) => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const css = Object.fromEntries(
  readdirSync(new URL('../site/css/', import.meta.url))
    .filter((f) => f.endsWith('.css'))
    .map((f) => [f, read(`site/css/${f}`)]),
);

const TIER_1 = {
  '--raw-color-ice-50': '#f7fafb',
  '--raw-color-ice-100': '#ebeef1',
  '--raw-color-ice-200': '#dfe5e9',
  '--raw-color-steel-400': '#b6c1c8',
  '--raw-color-ink-950': '#090a0b',
  '--raw-color-ink-900': '#0e0f14',
  '--raw-color-ink-800': '#1b1d24',
  '--raw-color-ink-700': '#2a2d36',
  '--raw-color-ink-alpha-35': 'rgb(9 10 11 / 0.35)',
  '--raw-color-slate-500': '#7a7a7a',
  '--raw-color-slate-600': '#4d4d4d',
  '--raw-color-slate-900': '#1e1e1e',
  '--raw-color-cyan-400': '#02d2e3',
  '--raw-color-cyan-alpha-25': 'rgb(2 210 227 / 0.25)',
  '--raw-color-stone-600': '#535450',
  '--raw-color-white-alpha-10': 'rgb(255 255 255 / 0.1)',
  '--raw-color-white-alpha-20': 'rgb(255 255 255 / 0.2)',
  '--raw-color-ink-alpha-08': 'rgb(9 10 11 / 0.08)',
  '--raw-color-white-alpha-40': 'rgb(255 255 255 / 0.4)',
  '--raw-color-white': '#ffffff',
  '--raw-color-orange-500': '#ff6b00',
  '--raw-font-size-96': '6rem',
  '--raw-font-size-70': '4.375rem',
  '--raw-font-size-52': '3.25rem',
  '--raw-font-size-38': '2.375rem',
  '--raw-font-size-20': '1.25rem',
  '--raw-font-size-18': '1.125rem',
  '--raw-font-size-16': '1rem',
  '--raw-font-size-14': '0.875rem',
  '--raw-font-size-12': '0.75rem',
  '--raw-font-size-55': '3.4375rem',
  '--raw-font-size-36': '2.25rem',
};

test('tier-1 tokens are verbatim', () => {
  for (const [name, value] of Object.entries(TIER_1)) {
    const escaped = value.replace(/[()/.]/g, '\\$&');
    assert.match(css['tokens.css'], new RegExp(`${name}:\\s*${escaped};`), name);
  }
});

test('hidden states only apply under .js', () => {
  const allowed = /\.menu-sheet\[hidden\]|\.sr-only/;
  for (const [file, text] of Object.entries(css)) {
    const rules = text.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g);
    for (const [, selector, body] of rules) {
      if (!/(^|[;\s{])(opacity:\s*0(?![.\d])|visibility:\s*hidden)/.test(body)) continue;
      for (const part of selector.split(',').map((s) => s.trim())) {
        if (allowed.test(part)) continue;
        assert.match(part, /^\.js:not\(\.reveal-failsafe\)/, `${file}: "${part}" hides content without the .js guard`);
      }
    }
  }
});

test('failsafe reveals the page', () => {
  const home = read('index.html');
  const head = home.slice(0, home.indexOf('</head>'));
  assert.match(head, /__homeBooted/);
  assert.match(head, /4000/);
  const main = read('site/js/main.js');
  const booted = main.indexOf('window.__homeBooted = true');
  assert.ok(main.lastIndexOf('mount(') > 0, 'main.js mounts the blocks');
  assert.ok(booted > main.lastIndexOf('mount('), '__homeBooted is set after every mount');
  for (const module of ['loader', 'liquid', 'reveal', 'carousel', 'clock', 'count', 'ergon', 'overlays', 'grid']) {
    assert.match(main, new RegExp(`from '\\./home/${module}\\.js'`), module);
  }
  assert.match(main, /from '\.\/guide\/guide\.js'/);
  assert.doesNotMatch(main, /story|three/);
});

test('no keyframes', () => {
  for (const [file, text] of Object.entries(css)) assert.doesNotMatch(text, /@keyframes/, file);
});

test('the head is shell.py\'s: Lenis is the only import, the fonts and hero picture are preloaded', () => {
  const blocks = ['loader', 'masthead', 'hero', 'about', 'ergon', 'built', 'services', 'stats', 'resume_half', 'contact', 'menu', 'modal', 'guide'];
  const shell = execFileSync('python3', ['-c', [
    'import json, sys',
    "sys.path.insert(0, 'scripts/home')",
    'from templates import shell',
    `blocks = {k: '' for k in ${JSON.stringify(blocks)}}`,
    "sys.stdout.write(shell.render(json.load(open('site/content.json')), blocks))",
  ].join('\n')], { cwd: new URL('../', import.meta.url), encoding: 'utf8' });
  const home = read('index.html');
  const head = home.slice(0, home.indexOf('</head>'));
  assert.equal(shell.slice(0, shell.indexOf('</head>')), head, 'index.html has the head shell.py renders');
  assert.match(head, /<script type="importmap">\{"imports":\{"lenis":"\.\/vendor\/lenis-1\.3\.26\/lenis\.mjs"\}\}<\/script>/);
  assert.doesNotMatch(head, /three|modulepreload/);
  for (const font of ['onest-latin-600-normal', 'onest-latin-400-normal']) {
    assert.ok(head.includes(`<link rel="preload" href="assets/fonts/${font}.woff2" as="font" type="font/woff2" crossorigin>`), font);
  }
  assert.match(head, /<link rel="preload" href="assets\/hero\/surface-wide\.jpg" as="image" media="\(min-width: 1024px\) and \(min-aspect-ratio: 7\/5\)">/);
  assert.match(head, /<meta name="theme-color" content="#090a0b">/);
  assert.ok(head.indexOf('<script type="importmap">') < head.indexOf('<script type="module" src="site/js/main.js">'));
  for (const [, href] of head.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)) assert.doesNotThrow(() => read(href), href);
});

// The wide layer's cards sit right of the desktop headline. Below 1024px the hero stacks its text over the whole
// picture (a landscape phone puts the headline straight on the cards), and on a 4:3 screen (1024×768, 1100×800)
// the cover crop pulls the Assistant panel over the headline's first line. In both cases the hero shows the
// texture-only tall layer; the picture, the preload and the liquid reveal share one query, so the blueprint
// stays registered to the surface.
test('the wide hero layer, whose cards sit right of the headline, shows only beside the desktop headline on screens wider than 7:5', () => {
  const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const liquid = readFileSync(new URL('../site/js/home/liquid.js', import.meta.url), 'utf8');
  assert.match(html, /<picture><source media="\(max-width: 1023\.98px\), \(max-aspect-ratio: 7\/5\)" srcset="assets\/hero\/surface-tall\.jpg">/);
  assert.match(liquid, /matchMedia\('\(max-width: 1023\.98px\), \(max-aspect-ratio: 7\/5\)'\)/);
  assert.doesNotMatch(html + liquid, /aspect-ratio: 3\/4/);
});
