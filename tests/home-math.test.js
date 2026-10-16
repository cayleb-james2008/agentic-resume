// The homepage's pure helpers (2026-10-16): every number that moves or decides is tested here, so the mounts in
// site/js/home/* only wire them to the DOM. The Ask bar's matcher has its own file (home-ask.test.js).
import test from 'node:test';
import assert from 'node:assert/strict';
import { ladderStop, nextTeam, wirePath } from '../site/js/home/graph.js';
import { createScrollLock } from '../site/js/home/overlays.js';
import { composeMail, validate } from '../site/js/home/mail.js';

const points = (d) => [...d.matchAll(/(-?[\d.]+),(-?[\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]);

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

test('an overlay that hands off to another (menu → Contact) gives focus back before the next one opens', async () => {
  const { overlay } = await import('../site/js/home/overlays.js');
  const calls = [];
  const opener = { focus: () => { calls.push('opener'); globalThis.document.activeElement = opener; } };
  const button = { focus: () => { globalThis.document.activeElement = button; } };
  globalThis.window ??= globalThis;
  globalThis.document = { activeElement: opener, addEventListener() {}, removeEventListener() {} };
  const el = { hidden: true, offsetWidth: 0, classList: { add() {}, remove() {} }, querySelector: () => button };
  const lock = createScrollLock({ stop() {}, start() {} });
  const menu = overlay(el, { lock, reduced: true });
  menu.show();
  assert.equal(globalThis.document.activeElement, button, 'focus moves into the overlay');
  await new Promise((done) => menu.close(() => { calls.push('then:' + (globalThis.document.activeElement === opener ? 'opener' : 'lost')); done(); }));
  assert.deepEqual(calls, ['opener', 'then:opener'], 'the next overlay records the real opener, so closing it returns focus there');
  assert.equal(lock.count, 0);
  delete globalThis.document;
});

test('a service topic reads naturally mid-sentence: lower-case first word, acronyms kept', async () => {
  const { topicPhrase } = await import('../site/js/home/mail.js');
  assert.equal(topicPhrase('AI employees'), 'AI employees');
  assert.equal(topicPhrase('AI everything'), 'AI everything');
  assert.equal(topicPhrase('Remote support'), 'remote support');
});

test('a test ticket goes to the next person who is not busy, or waits if everyone is', async () => {
  const { ticketCard } = await import('../site/js/home/graph.js');
  assert.equal(ticketCard(2, [false, false, false, false, false]), 2);
  assert.equal(ticketCard(2, [false, false, true, false, false]), 3, 'the planned card is busy with a routine');
  assert.equal(ticketCard(4, [false, true, false, false, true]), 0, 'wraps round');
  assert.equal(ticketCard(1, [true, true, true]), -1);
});

test('only a plain primary click is taken over; Ctrl, Cmd, Shift, Alt and middle clicks keep the browser\'s own behaviour', async () => {
  const { plainClick } = await import('../site/js/home/overlays.js');
  assert.equal(plainClick({ button: 0 }), true);
  for (const k of ['ctrlKey', 'metaKey', 'shiftKey', 'altKey']) assert.equal(plainClick({ button: 0, [k]: true }), false, k);
  assert.equal(plainClick({ button: 1 }), false);
});
