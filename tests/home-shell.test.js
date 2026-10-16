// The page shell (the "Sign-off" look, 2026-10-16): the tokens, the head, the failsafe, and the rule that
// nothing is ever hidden unless the script is running.
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

// The palette, verbatim: one family of cool neutrals and one accent, the blue of signature ink, by day and by night.
const RAW = {
  '--raw-paper': '#f5f6f8',
  '--raw-white': '#ffffff',
  '--raw-midnight': '#121a2b',
  '--raw-graphite': '#4a5468',
  '--raw-hairline': '#dce0e7',
  '--raw-control': '#7c8598',
  '--raw-ink-blue': '#2340d8',
  '--raw-night': '#121a2b',
  '--raw-night-raised': '#1a2338',
  '--raw-mist': '#e9ecf2',
  '--raw-mist-2': '#a7b0c2',
  '--raw-periwinkle': '#8c9bff',
};

test('the palette is verbatim, and every role is re-pointed for dark mode in one place', () => {
  const tokens = css['tokens.css'];
  for (const [name, value] of Object.entries(RAW)) assert.match(tokens, new RegExp(`${name}:\\s*${value};`), name);
  const dark = tokens.slice(tokens.indexOf('@media (prefers-color-scheme: dark)'));
  for (const role of ['--bg', '--surface', '--fg', '--fg-2', '--line', '--line-strong', '--accent', '--on-accent']) {
    assert.match(dark, new RegExp(`${role}:\\s*var\\(--raw-`), `${role} in dark mode`);
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

test('failsafe reveals the page, and the hero\'s entrance never waits for the modules', () => {
  const home = read('index.html');
  const head = home.slice(0, home.indexOf('</head>'));
  assert.match(head, /__homeBooted/);
  assert.match(head, /4000/);
  assert.match(head, /requestAnimationFrame\(function\(\)\{requestAnimationFrame\(function\(\)\{d\.classList\.add\("is-in"\)\}\)\}\)/);
  const main = read('site/js/main.js');
  const booted = main.indexOf('window.__homeBooted = true');
  assert.ok(main.lastIndexOf('mount') > 0, 'main.js mounts the blocks');
  assert.ok(booted > main.lastIndexOf('mountActions('), '__homeBooted is set after every mount');
  for (const module of ['./ask/ask.js', './home/ergon.js', './home/overlays.js', './home/work.js']) {
    assert.ok(main.includes(`from '${module}'`), module);
  }
  assert.doesNotMatch(main, /lenis|story|three|loader|liquid|carousel/i);
});

test('no keyframes: motion is transitions and the Web Animations API, so it can be interrupted', () => {
  for (const [file, text] of Object.entries(css)) assert.doesNotMatch(text, /@keyframes/, file);
});

test('the head is shell.py\'s: no import map, Mona Sans preloaded, light and dark theme colours', () => {
  const blocks = ['masthead', 'hero', 'built', 'services', 'ergon', 'resume_half', 'contact', 'menu', 'modal'];
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
  assert.doesNotMatch(head, /importmap|three|modulepreload|assets\/hero/);
  assert.ok(head.includes('<link rel="preload" href="assets/fonts/mona-sans-latin-wdth-normal.woff2" as="font" type="font/woff2" crossorigin>'));
  assert.ok(head.includes('<meta name="color-scheme" content="light dark">'));
  assert.ok(head.includes('<meta name="theme-color" media="(prefers-color-scheme: light)" content="#f5f6f8">'));
  assert.ok(head.includes('<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#121a2b">'));
  assert.ok(head.indexOf('<script>') < head.indexOf('<script type="module" src="site/js/main.js">'));
  for (const [, href] of head.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)) assert.doesNotThrow(() => read(href), href);
});

test('the hero\'s entrance is set only under motion allowed, and only while the page is scripted and not yet in', () => {
  const hero = css['hero.css'].replace(/\/\*[\s\S]*?\*\//g, '');
  const motion = hero.slice(hero.indexOf('@media (prefers-reduced-motion: no-preference)'));
  assert.ok(motion.length < hero.length, 'the entrance lives in a no-preference block');
  assert.match(motion, /\.js:not\(\.reveal-failsafe\):not\(\.is-in\) \.hero \[data-in\]\s*\{[^}]*opacity:\s*0/);
  assert.doesNotMatch(hero.slice(0, hero.indexOf('@media (prefers-reduced-motion: no-preference)')), /opacity:\s*0/);
  assert.match(css['base.css'], /@media \(prefers-reduced-motion: reduce\)\s*\{[^}]*transition:\s*none !important/);
});
