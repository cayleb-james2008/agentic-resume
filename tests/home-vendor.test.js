import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const path = (p) => new URL(p, root);

test('vendored files match provenance', () => {
  const provenance = JSON.parse(readFileSync(path('vendor/PROVENANCE.json'), 'utf8'));
  const entries = Object.entries(provenance);
  assert.ok(entries.length >= 5, 'provenance lists every vendored file');
  for (const [file, record] of entries) {
    assert.ok(existsSync(path(file)), `${file} exists`);
    const hash = createHash('sha256').update(readFileSync(path(file))).digest('hex');
    assert.equal(hash, record.sha256, `${file} hash`);
  }
});

test('Lenis is the one vendored library; three.js and the old faces are gone', () => {
  const provenance = JSON.parse(readFileSync(path('vendor/PROVENANCE.json'), 'utf8'));
  assert.ok(existsSync(path('vendor/lenis-1.3.26/lenis.mjs')));
  assert.ok(existsSync(path('assets/licenses/lenis-MIT.txt')));
  assert.equal(existsSync(path('vendor/three-0.185.0')), false);
  assert.equal(existsSync(path('assets/licenses/three-MIT.txt')), false);
  for (const key of Object.keys(provenance)) assert.doesNotMatch(key, /three|oswald|space-grotesk/, key);
  for (const face of ['oswald', 'space-grotesk']) {
    for (const weight of [400, 500, 700]) assert.equal(existsSync(path(`assets/fonts/${face}-latin-${weight}-normal.woff2`)), false, face);
    assert.equal(existsSync(path(`assets/licenses/${face}-OFL.txt`)), false, face);
  }
});

test('every stylesheet names only the vendored faces, and every face it loads exists', async () => {
  const { readdirSync } = await import('node:fs');
  const sheets = [...readdirSync(path('site/css/')).map((f) => `site/css/${f}`), 'lab/lab.css'];
  for (const sheet of sheets) {
    const css = readFileSync(path(sheet), 'utf8');
    assert.doesNotMatch(css, /Oswald|Space Grotesk/, sheet);
    for (const [, url] of css.matchAll(/url\("?([^")]+\.woff2)"?\)/g)) {
      assert.ok(existsSync(new URL(url, path(sheet))), `${sheet} loads ${url}`);
    }
  }
});

test('Onest and JetBrains Mono are vendored with licences', () => {
  const provenance = JSON.parse(readFileSync(path('vendor/PROVENANCE.json'), 'utf8'));
  const fonts = [
    ...[400, 500, 600, 700].map((w) => `assets/fonts/onest-latin-${w}-normal.woff2`),
    ...[400, 500].map((w) => `assets/fonts/jetbrains-mono-latin-${w}-normal.woff2`),
  ];
  for (const file of fonts) {
    assert.ok(existsSync(path(file)), file);
    assert.ok(provenance[file], `${file} is in PROVENANCE.json`);
    const hash = createHash('sha256').update(readFileSync(path(file))).digest('hex');
    assert.equal(hash, provenance[file].sha256, `${file} hash`);
  }
  for (const name of ['onest-OFL', 'jetbrains-mono-OFL']) {
    const licence = path(`assets/licenses/${name}.txt`);
    assert.ok(existsSync(licence), name);
    assert.match(readFileSync(licence, 'utf8'), /SIL Open Font License, Version 1\.1/);
  }
});

