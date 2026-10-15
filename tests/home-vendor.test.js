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

test('fonts and licenses are present', () => {
  for (const family of ['oswald', 'space-grotesk']) {
    for (const weight of [400, 500, 700]) {
      const file = `assets/fonts/${family}-latin-${weight}-normal.woff2`;
      assert.ok(existsSync(path(file)), file);
    }
  }
  for (const name of ['three-MIT', 'lenis-MIT', 'oswald-OFL', 'space-grotesk-OFL']) {
    assert.ok(existsSync(path(`assets/licenses/${name}.txt`)), name);
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

test('three is revision 185', async () => {
  const { REVISION } = await import(path('vendor/three-0.185.0/three.core.min.js'));
  assert.equal(REVISION, '185');
});
