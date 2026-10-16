// What the site vendors (2026-10-16): one font, Mona Sans, with its licence and hash. No script library: the page
// loads nothing from anywhere else.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const path = (p) => new URL(p, root);
const provenance = JSON.parse(readFileSync(path('vendor/PROVENANCE.json'), 'utf8'));
const FONT = 'assets/fonts/mona-sans-latin-wdth-normal.woff2';

test('vendored files match provenance', () => {
  const entries = Object.entries(provenance);
  assert.ok(entries.length >= 1, 'provenance lists every vendored file');
  for (const [file, record] of entries) {
    assert.ok(existsSync(path(file)), `${file} exists`);
    const hash = createHash('sha256').update(readFileSync(path(file))).digest('hex');
    assert.equal(hash, record.sha256, `${file} hash`);
  }
});

test('Mona Sans is the one vendored face, with its OFL licence, carrying both its width and weight axes', () => {
  assert.ok(provenance[FONT], `${FONT} is in PROVENANCE.json`);
  assert.match(provenance[FONT].package, /^@fontsource-variable\/mona-sans@/);
  assert.match(provenance[FONT].axes, /wdth.*wght/);
  assert.deepEqual(readdirSync(path('assets/fonts')), ['mona-sans-latin-wdth-normal.woff2']);
  assert.deepEqual(readdirSync(path('assets/licenses')), ['mona-sans-OFL.txt']);
  assert.match(readFileSync(path('assets/licenses/mona-sans-OFL.txt'), 'utf8'), /SIL Open Font License, Version 1\.1/);
});

test('no script library and none of the retired faces remain', () => {
  assert.equal(existsSync(path('vendor/lenis-1.3.26')), false);
  assert.equal(existsSync(path('vendor/three-0.185.0')), false);
  for (const key of Object.keys(provenance)) assert.doesNotMatch(key, /lenis|three|onest|jetbrains|oswald|space-grotesk|plex|bricolage/, key);
  const pkg = JSON.parse(readFileSync(path('package.json'), 'utf8'));
  assert.equal(pkg.dependencies, undefined);
  assert.equal(pkg.devDependencies, undefined);
});

test('every stylesheet loads only the vendored face, and every face it loads exists', () => {
  const sheets = [...readdirSync(path('site/css/')).map((f) => `site/css/${f}`), 'lab/lab.css'];
  for (const sheet of sheets) {
    const css = readFileSync(path(sheet), 'utf8');
    for (const [, url] of css.matchAll(/url\("?([^")]+\.woff2)"?\)/g)) {
      assert.ok(existsSync(new URL(url, path(sheet))), `${sheet} loads ${url}`);
      assert.match(url, /mona-sans-latin-wdth-normal\.woff2$/, `${sheet} loads ${url}`);
    }
  }
});
