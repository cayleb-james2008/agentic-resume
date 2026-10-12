import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PARALLAX, railHeight, restingPoint } from '../site/js/experience/geometry.js';
import { railLayout, yearOpacityAfter } from '../site/js/experience/timeline.js';

const read = (file) => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const content = JSON.parse(read('site/content.json'));
const home = read('index.html');
const escape = (text) => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const entries = ['centre', 'side', 'centre', 'side', 'centre', 'side', 'centre'].map((frame) => ({ frame }));

test('rail geometry for seven rows', () => {
  assert.equal(railHeight(entries), 2668);
  assert.ok(Math.abs(restingPoint(entries) - 2387 / 2668) < 1e-9);
});

test('parallax figures', () => {
  assert.deepEqual(PARALLAX, { plate: { side: 60, centre: 20 }, copy: 110 });
});

test('rows match content', () => {
  const rows = [...home.matchAll(/<li class="row row--(centre|side)[^"]*"[^>]*>([\s\S]*?)<\/li>/g)];
  assert.equal(rows.length, content.experience.entries.length);
  rows.forEach(([, frame, body], i) => {
    const entry = content.experience.entries[i];
    assert.equal(frame, entry.frame);
    if (frame === 'centre') assert.ok(body.includes(`<strong>${escape(entry.lead)}</strong>`), entry.lead);
    else assert.ok(body.includes(`<span class="row-title">${escape(entry.title)}</span>`), entry.title);
  });
});

test('rail layout ends on the last entry', () => {
  // A 1440-wide block whose rail starts at its top and runs 2818 design px.
  const layout = railLayout({ sectionWidth: 1440, railTop: 0, railHeightPx: 2818, entries });
  assert.equal(layout.viewH, 2818);
  assert.ok(Math.abs(layout.rest - 2387) < 1e-9);
  // Below lg the rail starts lower; its rest is measured from where it starts.
  const narrow = railLayout({ sectionWidth: 720, railTop: 84.5, railHeightPx: 1324.5, entries });
  assert.ok(Math.abs(narrow.rest - (2387 - 169)) < 1e-6);
});

test('centre years settle to 40% after the hold', () => {
  assert.equal(yearOpacityAfter('centre'), 0.4);
  assert.equal(yearOpacityAfter('side'), 1);
});
