import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { GAP_MS, SHOW_MS, createGuideState, request, setQuiet, tick } from '../site/js/guide/queue.js';
import * as guideModule from '../site/js/guide/guide.js';
import { FOOT_LIFT, pastStory } from '../site/js/guide/guide.js';

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

test('the guide appears once the story is behind the reader, and not before', () => {
  assert.equal(pastStory(0, 6000, 800), false);
  assert.equal(pastStory(5600, 6000, 800), true, '60% of the viewport reaches the resume');
  assert.equal(pastStory(5400, 6000, 800), false);
  assert.equal(pastStory(0, Infinity, 800), false, 'with no resume on the page it never appears');
  assert.equal(pastStory(1e9, Infinity, 800), false);
});

test('the guide module exports pastStory and FOOT_LIFT, and no longer APPEAR_AFTER', () => {
  assert.equal(typeof guideModule.pastStory, 'function');
  assert.equal(typeof FOOT_LIFT, 'number');
  assert.equal('APPEAR_AFTER' in guideModule, false);
});

test('the guide has no face: no eyes, no blink, no gaze', () => {
  const js = read('site/js/guide/guide.js');
  assert.match(js, /const SECTIONS = \['experience', 'work', 'education', 'contact'\];/);
  assert.doesNotMatch(js, /droplet-shape|blinkSquash|nextBlinkDelay|data-guide-eyes|gaze|pointermove/);
  assert.doesNotMatch(read('site/js/guide/queue.js'), /gaze/);
  assert.match(home, /class="guide-bead"/);
  assert.doesNotMatch(home, /data-guide-eyes/);
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
