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

test('the live bracket clears its card\'s status line instead of sitting on it', () => {
  const live = content.projects.cards.find((c) => c.marker === 'live');
  const style = home.match(/<div class="strip-bracket"[^>]*style="([^"]+)"/)[1];
  const cq = (re) => Number(style.match(re)[1]) * 14.4; // cqw → design px in the 1440 frame
  const width = cq(/width:calc\(([\d.]+)cqw/);
  const top = cq(/top:calc\(([\d.]+)cqw/);
  const height = cq(/height:([\d.]+)cqw/);
  const textWidth = live.status.length * 14 * 0.62;
  assert.ok(width >= textWidth + 2 * (10 + 4), `bracket ${width.toFixed(0)}px for a ${textWidth.toFixed(0)}px status`);
  assert.ok(top + height >= 118, `bracket ends at ${(top + height).toFixed(0)}px, status runs to ~117`);
});
