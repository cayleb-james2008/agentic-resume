import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CALENDAR, spread } from '../site/js/projects/geometry.js';
import { crawlDirection, pulseAt } from '../site/js/projects/projects.js';

const read = (file) => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const content = JSON.parse(read('site/content.json'));
const home = read('index.html');

test('spread positions about the middle', () => {
  assert.equal(spread(347), 'calc(50% + -25.9028cqw * var(--cal-spread, 1))');
  assert.equal(spread(720), 'calc(50% + 0.0000cqw * var(--cal-spread, 1))');
});

test('connectors are the reference four', () => {
  assert.deepEqual(CALENDAR.links, [
    { x: 416, width: 126 }, { x: 580, width: 128 }, { x: 743, width: 136 }, { x: 914, width: 124 },
  ]);
});

test('project strip follows content', () => {
  const cards = [...home.matchAll(/<li class="strip-card[^"]*"[^>]*>([\s\S]*?)<\/li>/g)];
  assert.equal(cards.length, content.projects.cards.length);
  assert.equal((home.match(/strip-marker--live/g) || []).length, 1);
  assert.equal((home.match(/strip-card--live/g) || []).length, 1);
});

test('connectors crawl toward the live card', () => {
  const live = content.projects.cards.findIndex((c) => c.marker === 'live');
  assert.equal(live, 2);
  assert.deepEqual([0, 1, 2, 3].map((i) => crawlDirection(i, live)), [1, 1, -1, -1]);
});

test('the live pulse grows and fades', () => {
  assert.deepEqual(pulseAt(0), { r: 5.5, opacity: 0.5 });
  const end = pulseAt(1);
  assert.ok(Math.abs(end.r - (5.5 + 5.5 * 3.4)) < 1e-9);
  assert.equal(end.opacity, 0);
});
