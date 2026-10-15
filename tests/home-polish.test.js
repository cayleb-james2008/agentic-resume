// The quality pass (2026-10-12, trimmed for the water story 2026-10-15): contrast, the accent ink
// on the light ground, landscape phones and the guide's faceless bead.
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

test('the terminal dim tone reads on the terminal ground', () => {
  assert.ok(contrast('--term-dim', '--term') >= 4.5, contrast('--term-dim', '--term').toFixed(2));
  assert.ok(contrast('--term-fg', '--term') >= 7);
});

test('the type roles are Onest, with JetBrains Mono for terminal text', () => {
  assert.match(tokens['--font-sans'], /^"Onest"/);
  assert.match(tokens['--font-display'], /^"Onest"/);
  assert.match(tokens['--font-mono'], /^"JetBrains Mono"/);
});

test('the footer copyright reads at 4.5:1 or better on black', () => {
  assert.ok(contrast('--foreground-on-dark-faint', '--surface-black') >= 4.5);
});

/** The declarations of every rule whose selector list names `selector`. */
const rule = (css, selector) => {
  const found = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter((m) => m[1].split(',').map((x) => x.trim()).includes(selector));
  assert.ok(found.length, `a rule for ${selector}`);
  return found.map((m) => m[2]).join(';');
};

test('accent type on the light ground uses the deeper ink accent, 4.5:1 or better', () => {
  assert.ok(contrast('--accent-ink', '--background') >= 4.5);
  // Hover and focus on the résumé half go to the ink accent.
  const half = strip(read('site/css/resume-half.css'));
  const hovers = [...half.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter((m) => /:hover/.test(m[1]));
  assert.ok(hovers.length > 0, 'the résumé half styles its link hovers');
  for (const [, selector, decls] of hovers) assert.match(decls, /(^|;)\s*color:\s*var\(--accent-ink\)/, selector.trim());
});

test('the spec\'s tier-1 colours stay; the new ones are added beside them', () => {
  assert.match(tokensCss, /--raw-color-ink-alpha-35: rgb\(9 10 11 \/ 0\.35\);/);
  assert.match(tokensCss, /--raw-color-white-alpha-40: rgb\(255 255 255 \/ 0\.4\);/);
});

test("on a landscape phone the agent's answers scroll inside the panel, never past the screen", () => {
  const css = strip(read('site/css/guide.css'));
  assert.match(css, /\.guide-log\s*\{[^}]*max-height:\s*min\(17rem, 45vh\)[^}]*overflow-y:\s*auto/);
  assert.match(css, /\.guide-panel\s*\{[^}]*width:\s*min\(23rem, calc\(100vw - 2rem\)\)/);
});

test('the agent is the >_ tile, with no face, on the homepage and the 404 page', () => {
  const py = read('scripts/home/templates/guide.py');
  assert.doesNotMatch(py, /eyes|glint|DROPLET|BEAD/);
  for (const page of ['index.html', '404.html']) {
    assert.doesNotMatch(read(page), /guide-bead|guide-droplet|guide-glass|guide-foot/, page);
  }
  assert.match(read('index.html'), /<button type="button" class="guide-agent"[^>]*><span class="mk" aria-hidden="true">&gt;_<\/span>/);
  assert.match(read('404.html'), /<div class="not-found-agent" aria-hidden="true"><span class="mk mk--xl" aria-hidden="true">&gt;_<\/span><\/div>/);
  assert.match(strip(read('site/css/base.css')), /\.mk--xl\s*\{/);
});

test('hover motion only where a mouse can hover', async () => {
  const { readdirSync } = await import('node:fs');
  for (const file of readdirSync(new URL('../site/css/', import.meta.url)).filter((f) => f.endsWith('.css'))) {
    let css = strip(read(`site/css/${file}`));
    // Drop the fine-pointer blocks, then nothing left may move on hover.
    css = css.replace(/@media \(hover: hover\) and \(pointer: fine\)\s*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '');
    for (const [, selector, decls] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      if (/:hover/.test(selector)) assert.doesNotMatch(decls, /transform/, `${file}: ${selector.trim()}`);
    }
  }
});

// The root grid drops to 13px between 1024 and about 1170px wide (and to 14px on tablets), so a bare
// 0.75rem label renders at 9.75px there. Every size that could fall under 12px carries a 12px floor;
// only the aria-hidden >_ glyphs in their tiles (.mk, the person cards' .as) are exempt.
test('no text renders under 12px at the smallest root size', async () => {
  const { readdirSync } = await import('node:fs');
  const sheets = [...readdirSync(new URL('../site/css/', import.meta.url)).filter((f) => f.endsWith('.css')).map((f) => `site/css/${f}`), 'lab/lab.css'];
  const under = [];
  for (const sheet of sheets) {
    for (const [, selector, decls] of strip(read(sheet)).matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      if (/\.mk\b|\.as\b/.test(selector)) continue;
      for (const [, value] of decls.matchAll(/(?<![-\w])font(?:-size)?:\s*([^;]+)/g)) {
        if (/(?:max|clamp)\(12px,/.test(value)) continue;
        for (const [, n] of value.matchAll(/(?<![\d.])(\d*\.?\d+)rem/g)) {
          if (Number(n) * 13 < 12) under.push(`${sheet}: ${selector.trim()} → ${value.trim()}`);
        }
      }
    }
  }
  assert.deepEqual(under, []);
});
