// The Lumora homepage's pure helpers (2026-10-15): every number that moves or decides is tested here,
// so the mounts in site/js/home/* only wire them to the DOM.
import test from 'node:test';
import assert from 'node:assert/strict';
import { rootFontSize } from '../site/js/home/grid.js';
import { counterLabel, easeInOutCubic, FILL_MS, shouldPlay } from '../site/js/home/loader.js';
import { BRUSH_RADIUS, coverRect, DECAY, FADE_FRAMES, fadeFor, trailPoints } from '../site/js/home/liquid.js';
import { lineIndexes } from '../site/js/home/reveal.js';
import { step } from '../site/js/home/carousel.js';
import { formatClock } from '../site/js/home/clock.js';
import { countProgress, formatCount, splitFigure } from '../site/js/home/count.js';
import { ladderStop, nextTeam, wirePath } from '../site/js/home/graph.js';
import { createScrollLock } from '../site/js/home/overlays.js';
import { composeMail, validate } from '../site/js/home/mail.js';

const close = (a, b, eps = 1e-3) => assert.ok(Math.abs(a - b) < eps, `${a} ≈ ${b}`);
const points = (d) => [...d.matchAll(/(-?[\d.]+),(-?[\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]);

test('the rem grid leaves 1920px and below to CSS and scales up above it', () => {
  assert.equal(rootFontSize(1440), null);
  assert.equal(rootFontSize(1920), null);
  close(rootFontSize(2560), 19.5552);
});

test('the loader counts 000 to 100 over 1.3s with easeInOutCubic', () => {
  assert.equal(FILL_MS, 1300);
  assert.equal(counterLabel(0), '000');
  assert.equal(counterLabel(7), '007');
  assert.equal(counterLabel(100), '100');
  assert.equal(easeInOutCubic(0), 0);
  assert.equal(easeInOutCubic(1), 1);
  close(easeInOutCubic(0.5), 0.5);
  close(easeInOutCubic(0.25), 0.0625);
});

test('the loader plays only on a first, plain, motion-allowed visit', () => {
  assert.equal(shouldPlay({ reduced: false, hash: '', seen: false }), true);
  assert.equal(shouldPlay({ reduced: true, hash: '', seen: false }), false);
  assert.equal(shouldPlay({ reduced: false, hash: '#experience', seen: false }), false);
  assert.equal(shouldPlay({ reduced: false, hash: '', seen: true }), false);
});

test('the liquid trail fills gaps between pointer moves, at most 60 points per move', () => {
  assert.equal(BRUSH_RADIUS, 143);
  assert.equal(DECAY, 0.016);
  assert.equal(FADE_FRAMES, 120);
  assert.deepEqual(trailPoints(null, { x: 5, y: 5 }, 143), [{ x: 5, y: 5 }]);
  const near = trailPoints({ x: 0, y: 0 }, { x: 100, y: 0 }, 143);
  assert.equal(near.length, Math.ceil(100 / (143 * 0.3)));
  const far = trailPoints({ x: 0, y: 0 }, { x: 10000, y: 0 }, 143);
  assert.equal(far.length, 60);
  assert.deepEqual(far.at(-1), { x: 10000, y: 0 });
  assert.equal(trailPoints({ x: 0, y: 0 }, { x: 0.2, y: 0 }, 0.5).length, 1, 'a tiny radius still steps at least 1px');
});

test('the trail fades at the base rate while drawing and faster once idle, capped at 0.5', () => {
  assert.equal(fadeFor(true, 9), 0.016);
  close(fadeFor(false, 10), 0.056);
  assert.equal(fadeFor(false, 200), 0.5);
});

test('the blueprint covers the hero like object-fit: cover', () => {
  const r = coverRect(1920, 1080, 390, 900);
  close(r.h, 900);
  close(r.w, 1600);
  close(r.x, (390 - 1600) / 2);
  close(r.y, 0);
});

test('words that share a top share a line', () => {
  assert.deepEqual(lineIndexes([0, 0, 40, 40, 80]), [0, 0, 1, 1, 2]);
  assert.deepEqual(lineIndexes([10, 12, 13]), [0, 0, 0], 'within the tolerance');
  assert.deepEqual(lineIndexes([]), []);
});

test('the carousel wraps both ways', () => {
  assert.equal(step(3, 1, 4), 0);
  assert.equal(step(0, -1, 4), 3);
  assert.equal(step(1, 1, 4), 2);
});

test('the clock reads Connecticut time', () => {
  assert.deepEqual(formatClock(new Date('2026-10-15T20:22:00Z')), { time: '4:22pm', date: '15 October, 2026' });
  assert.deepEqual(formatClock(new Date('2026-01-05T05:07:00Z')), { time: '12:07am', date: '5 January, 2026' });
});

test('count-up runs from the top at the viewport bottom to the centre at the viewport centre', () => {
  const vh = 900, h = 100;
  assert.equal(countProgress(vh, h, vh), 0);
  assert.equal(countProgress(vh + 50, h, vh), 0);
  close(countProgress(vh / 2 - h / 2, h, vh), 1);
  assert.equal(countProgress(-500, h, vh), 1);
});

test('stat figures split into prefix, value and suffix', () => {
  assert.deepEqual(splitFigure('3,300+'), { prefix: '', value: 3300, suffix: '+', comma: true });
  assert.deepEqual(splitFigure('$100/mo'), { prefix: '$', value: 100, suffix: '/mo', comma: false });
  assert.deepEqual(splitFigure('5'), { prefix: '', value: 5, suffix: '', comma: false });
  assert.equal(formatCount(3300, true), '3,300');
  assert.equal(formatCount(1234, false), '1234');
});

test('most tickets stop at the agent; some climb to the senior agent; a few reach a person', () => {
  const stops = Array.from({ length: 21 }, (_, i) => ladderStop(i + 1));
  assert.equal(stops.filter((s) => s === 0).length, 12);
  assert.equal(stops.filter((s) => s === 1).length, 6);
  assert.equal(stops.filter((s) => s === 2).length, 3);
  assert.equal(ladderStop(7), 2);
  assert.equal(ladderStop(3), 1);
  assert.equal(ladderStop(1), 0);
});

test('wires run from the hub to each person, as columns or as a bus', () => {
  const hub = { left: 300, top: 20, width: 200, height: 50 };
  const card = { left: 40, top: 160, width: 120, height: 180 };
  const mark = { left: 310, top: 26, width: 36, height: 36 };
  const cols = points(wirePath('cols', hub, card, mark));
  assert.deepEqual(cols[0], [400, 70], 'starts at the hub bottom centre');
  assert.deepEqual(cols.at(-1), [100, 160], 'ends at the card top centre');
  const target = { left: 60, top: 200, width: 40, height: 40 };
  const rows = wirePath('rows', hub, target, mark);
  assert.match(rows, /^M328,70 V210 Q328,220 338,220 H60$/);
});

test('the team switch wraps through the teams in order', () => {
  const names = ['office', 'shop', 'trades', 'clinic'];
  assert.equal(nextTeam(names, 'clinic', 1), 'office');
  assert.equal(nextTeam(names, 'office', -1), 'clinic');
  assert.equal(nextTeam(names, 'shop', 1), 'trades');
});

test('the scroll lock stops once and starts once, however many overlays stack', () => {
  const calls = [];
  const lock = createScrollLock({ stop: () => calls.push('stop'), start: () => calls.push('start') });
  lock.lock(); lock.lock(); lock.unlock();
  assert.deepEqual(calls, ['stop']);
  assert.equal(lock.count, 1);
  lock.unlock();
  assert.deepEqual(calls, ['stop', 'start']);
  lock.unlock();
  assert.deepEqual(calls, ['stop', 'start'], 'an extra unlock does nothing');
  assert.equal(lock.count, 0);
});

test('the request form says which fields need fixing', () => {
  assert.deepEqual(validate({ name: ' ', email: '', msg: '' }), { name: true, email: true, msg: true });
  assert.equal(validate({ name: 'Sam', email: 'a@b', msg: 'Hi' }).email, true);
  assert.deepEqual(validate({ name: 'Sam', email: 'a@b.co', msg: 'Hi' }), { name: false, email: false, msg: false });
});

test('the mail draft carries any characters intact and names the topic', () => {
  const m = composeMail({ name: 'Sam', email: 'sam@example.com', msg: 'Ünïcode & ?=# done', topic: 'AI employees' }, 'me@example.com');
  assert.equal(m.subject, 'AI employees: Sam');
  assert.equal(m.body, 'Ünïcode & ?=# done\n\nSam\nsam@example.com');
  assert.ok(m.href.startsWith('mailto:me@example.com?subject='));
  const query = new URLSearchParams(m.href.split('?')[1]);
  assert.equal(query.get('subject'), m.subject);
  assert.equal(query.get('body'), m.body);
  assert.equal(m.text, `To: me@example.com\nSubject: ${m.subject}\n\n${m.body}`);
  assert.equal(composeMail({ name: 'Sam', email: 'a@b.co', msg: 'x', topic: '' }, 'me@example.com').subject, 'Project: Sam');
});
