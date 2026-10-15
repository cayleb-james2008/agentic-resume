// The Lumora homepage's sections and assets (2026-10-15): images with provenance, and the markup the
// mounts and the no-JS reading depend on.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const path = (p) => new URL(p, root);

/** Width and height from a baseline or progressive JPEG's frame header. */
function jpegSize(buf) {
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    if (marker === 0xc0 || marker === 0xc2) return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    i += 2 + buf.readUInt16BE(i + 2);
  }
  throw new Error('no frame header');
}

test('every image on the site is listed with its source and hash', () => {
  const images = JSON.parse(readFileSync(path('assets/IMAGES.json'), 'utf8'));
  const files = ['assets/hero/', 'assets/work/'].flatMap((dir) => readdirSync(path(dir)).map((f) => dir + f));
  assert.ok(files.length >= 7, 'four hero layers and three screenshots');
  for (const file of files) {
    const record = images[file];
    assert.ok(record, `${file} is listed in assets/IMAGES.json`);
    const buf = readFileSync(path(file));
    assert.equal(createHash('sha256').update(buf).digest('hex'), record.sha256, `${file} hash`);
    assert.deepEqual(jpegSize(buf), { width: record.width, height: record.height }, `${file} size`);
    assert.ok(record.source && record.source.length > 10, `${file} says where it came from`);
  }
  for (const file of Object.keys(images)) assert.ok(existsSync(path(file)), `${file} exists`);
  assert.equal(existsSync(path('assets/home')), false, 'the pictures of Cayleb stay gone');
});
