import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GAP_MS, SHOW_MS, createGuideState, gaze, request, setQuiet, tick } from '../site/js/guide/queue.js';

const read = (file) => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const content = JSON.parse(read('site/content.json'));
const home = read('index.html');
const guide = content.guide;

test('the greeting goes first, then each section line once', () => {
  const s = createGuideState();
  request(s, 'approach', 0);
  request(s, 'greeting', 0);
  assert.equal(tick(s, 0).show, 'greeting');
  assert.equal(tick(s, SHOW_MS).hide, true);
  const t = SHOW_MS + GAP_MS;
  assert.equal(tick(s, t).show, 'approach');
  tick(s, t + SHOW_MS);
  request(s, 'approach', t + SHOW_MS + GAP_MS);
  assert.equal(tick(s, t + SHOW_MS + GAP_MS).show, null, 'never repeats a line');
});

test('a newer section replaces one still waiting, rather than piling up', () => {
  const s = createGuideState();
  request(s, 'greeting', 0);
  tick(s, 0);
  request(s, 'approach', 100);
  request(s, 'experience', 200);
  tick(s, SHOW_MS);
  assert.equal(tick(s, SHOW_MS + GAP_MS).show, 'experience');
});

test('lines wait out the gap after the last one', () => {
  const s = createGuideState();
  request(s, 'greeting', 0);
  assert.equal(tick(s, 0).show, 'greeting');
  tick(s, SHOW_MS);
  request(s, 'work', SHOW_MS + 10);
  assert.equal(tick(s, SHOW_MS + 10).show, null);
  assert.equal(tick(s, SHOW_MS + GAP_MS).show, 'work');
});

test('quiet hides what is showing and suppresses the rest', () => {
  const s = createGuideState();
  request(s, 'greeting', 0);
  tick(s, 0);
  assert.equal(setQuiet(s, true).hide, true);
  request(s, 'contact', 10_000);
  assert.equal(tick(s, 10_000).show, null);
  setQuiet(s, false);
  request(s, 'contact', 20_000);
  assert.equal(tick(s, 20_000).show, 'contact');
});

test('the eyes glance toward a point, never past their rim', () => {
  assert.deepEqual(gaze(0, 0), { x: 0, y: 0 });
  const g = gaze(500, -500, 3);
  assert.ok(Math.hypot(g.x, g.y) <= 3 + 1e-9);
  assert.ok(g.x > 0 && g.y < 0);
});

test('every guide line belongs to a section on the page', () => {
  for (const key of Object.keys(guide.lines)) assert.match(home, new RegExp(`id="${key}"`), key);
});

test('the guide keeps the site\'s claim rules', () => {
  const text = JSON.stringify(guide);
  assert.doesNotMatch(text, /\bclients?\b|\bcustomers?\b|\bpilot\b|hedge fund|\brevenue\b|\bprofits?\b|\breturns\b|Robert H\.? Lord|\bRHL\b/i);
  assert.match(guide.questions.find((q) => /Asmodeus/.test(q.q)).a, /private/i);
});

test('the guide is hidden until its script mounts it, and its panel is an accessible dialog', () => {
  const aside = home.match(/<aside class="guide"[^>]*>/)[0];
  assert.match(aside, /\shidden(\s|>)/);
  assert.match(home, /<div class="guide-panel"[^>]*role="dialog"[^>]*aria-modal="false"[^>]*aria-labelledby="guide-title"/);
  assert.match(home, /<p class="guide-bubble"[^>]*aria-hidden="true"/);
  assert.match(home, /<button[^>]*class="guide-agent"[^>]*aria-controls="guide-panel"[^>]*aria-expanded="false"/);
  const questions = [...home.matchAll(/<button type="button" class="guide-q" id="guide-q-(\d)" aria-expanded="false" aria-controls="guide-a-\1">/g)];
  assert.equal(questions.length, guide.questions.length);
});
