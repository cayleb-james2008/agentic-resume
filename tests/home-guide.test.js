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
  assert.equal(pastStory(5520, 6000, 800), false, 'exactly at the line is not yet past it');
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
  assert.doesNotMatch(home, /data-guide-eyes|guide-bead/);
});

test('the guide measures the résumé from the top of the page, again once the fonts are in', () => {
  const js = read('site/js/guide/guide.js');
  assert.match(js, /getBoundingClientRect\(\)\.top \+ window\.scrollY/);
  assert.doesNotMatch(js, /offsetTop/, 'offsetTop is relative to the offset parent, not the page');
  assert.match(js, /document\.fonts\?\.ready/);
});

test('the guide keeps the site\'s claim rules', () => {
  // "pilot" appears once, as Ergon's verified status in the résumé half's words: his own Windows
  // pilot with its live checks still pending (water story plan, 2026-10-15). Never a pilot for a company.
  const STATUS = 'Windows pilot, live checks pending';
  assert.match(guide.questions.find((q) => q.q === "What's Ergon?").a, new RegExp(`${STATUS}\\.$`));
  const text = JSON.stringify(guide).replace(STATUS, '');
  assert.doesNotMatch(text, /\bclients?\b|\bcustomers?\b|\bpilots?\b|hedge fund|\brevenue\b|\bprofits?\b|\breturns\b|Robert H\.? Lord|\bRHL\b/i);
  assert.match(guide.questions.find((q) => /Asmodeus/.test(q.q)).a, /private/i);
});

test('Ask my agent is hidden until its script mounts it, and its panel is a labelled dialog of questions', () => {
  const aside = home.match(/<aside class="guide"[^>]*>/)[0];
  assert.match(aside, /\shidden(\s|>)/);
  assert.match(aside, /\sdata-guide(\s|>)/);
  assert.match(home, /<div class="guide-panel" id="guide-panel" role="dialog" aria-modal="false" aria-labelledby="guide-title" hidden>/);
  assert.match(home, /<button[^>]*class="guide-agent"[^>]*aria-controls="guide-panel"[^>]*aria-expanded="false"/);
  assert.match(home, /<div class="guide-log mono" id="guide-log" role="log" aria-live="polite">/);
  const buttons = [...home.matchAll(/<button type="button" class="guide-q" data-q="(\d+)" data-cmd="([^"]+)">/g)];
  assert.equal(buttons.length, guide.questions.length);
  buttons.forEach((b, i) => {
    assert.equal(Number(b[1]), i);
    assert.equal(b[2], guide.questions[i].cmd);
  });
  assert.ok(guide.questions.some((q) => q.q === 'What does Ergon cost?' && q.a === 'About $100 a person a month.'));
});
