import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { existsSync } from 'node:fs';
import { askVisible, typeStep, TYPE_PER_TICK } from '../site/js/guide/guide.js';

const read = (file) => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const content = JSON.parse(read('site/content.json'));
const home = read('index.html');
const guide = content.guide;

test('Ask my agent appears once the hero is mostly out of view, and not before', () => {
  assert.equal(askVisible(1), false);
  assert.equal(askVisible(0.5), false);
  assert.equal(askVisible(0.35), false, 'exactly at the line is not yet past it');
  assert.equal(askVisible(0.2), true);
  assert.equal(askVisible(0), true);
});

test('answers print three characters a tick and finish on the full text', () => {
  assert.equal(TYPE_PER_TICK, 3);
  assert.equal(typeStep('abcdefg', 0), 'abc');
  assert.equal(typeStep('abcdefg', 1), 'abcdef');
  assert.equal(typeStep('abcdefg', 2), 'abcdefg');
  assert.equal(typeStep('abcdefg', 9), 'abcdefg');
});

test('the guide has no face and no queue: it only answers what is asked', () => {
  const js = read('site/js/guide/guide.js');
  assert.doesNotMatch(js, /droplet-shape|blinkSquash|nextBlinkDelay|data-guide-eyes|gaze|pointermove|queue\.js/);
  assert.equal(existsSync(new URL('../site/js/guide/queue.js', import.meta.url)), false);
  assert.doesNotMatch(home, /data-guide-eyes|guide-bubble/);
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
  assert.match(home, /<div class="guide-log mono" id="guide-log" data-lenis-prevent role="log" aria-live="polite">/);
  const buttons = [...home.matchAll(/<button type="button" class="guide-q" data-q="(\d+)" data-cmd="([^"]+)">/g)];
  assert.equal(buttons.length, guide.questions.length);
  buttons.forEach((b, i) => {
    assert.equal(Number(b[1]), i);
    assert.equal(b[2], guide.questions[i].cmd);
  });
  assert.ok(guide.questions.some((q) => q.q === 'What does Ergon cost?' && q.a === 'About $100 a person a month.'));
});
