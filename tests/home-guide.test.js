// The Ask bar in the hero (2026-10-16): it answers only with what Cayleb wrote, streams the answer a few characters
// a tick, and keeps the site's claim rules. Matching itself is tested in home-ask.test.js.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { existsSync } from 'node:fs';
import { ticksFor, typeStep, TYPE_PER_TICK } from '../site/js/ask/stream.js';

const read = (file) => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const content = JSON.parse(read('site/content.json'));
const home = read('index.html');
const guide = content.guide;

test('answers print three characters a tick and finish on the full text; with motion reduced, at once', () => {
  assert.equal(TYPE_PER_TICK, 3);
  assert.equal(typeStep('abcdefg', 0), 'abc');
  assert.equal(typeStep('abcdefg', 1), 'abcdef');
  assert.equal(typeStep('abcdefg', 2), 'abcdefg');
  assert.equal(typeStep('abcdefg', 9), 'abcdefg');
  assert.equal(ticksFor('abcdefg', false), 3);
  assert.equal(ticksFor('abcdefg', true), 0);
});

test('the guide has no face and no queue: it only answers what is asked', () => {
  const js = read('site/js/ask/ask.js');
  assert.doesNotMatch(js, /droplet-shape|blinkSquash|nextBlinkDelay|data-guide-eyes|gaze|pointermove|queue\.js/);
  assert.equal(existsSync(new URL('../site/js/guide', import.meta.url)), false, 'the old corner agent is gone');
  assert.doesNotMatch(home, /data-guide-eyes|guide-bubble|class="guide-agent"/);
});

test('the guide keeps the site\'s claim rules', () => {
  // "pilot" appears once, as Ergon's verified status in the résumé half's words: his own Windows
  // pilot with its live checks still pending (water story plan, 2026-10-15). Never a pilot for a company.
  const STATUS = 'Windows pilot, live checks pending';
  assert.match(guide.questions.find((q) => q.q === "What's Ergon?").a, new RegExp(`${STATUS}\\.$`));
  const text = JSON.stringify(guide).replace(STATUS, '');
  assert.doesNotMatch(text, /\bclients?\b|\bcustomers?\b|\bpilots?\b|hedge fund|\brevenue\b|\bprofits?\b|\breturns\b|Robert H\.? Lord|\bRHL\b/i);
  assert.match(guide.questions.find((q) => /Asmodeus/.test(q.q)).a, /private/i);
  assert.ok(guide.questions.some((q) => q.q === 'What does Ergon cost?' && q.a === 'About $100 a person a month.'));
});

test('the greeting says where the answers come from, and claims no live model', () => {
  assert.match(guide.greeting, /résumé/);
  assert.doesNotMatch(JSON.stringify(guide), /\b(GPT|LLM|chatbot|live AI|real-time AI)\b/i);
});

test('the Ask bar sits in the hero; without the script its field is hidden and every answer is in the page', () => {
  const hero = home.slice(home.indexOf('<section class="hero"'), home.indexOf('</section>'));
  assert.match(hero, /<div class="ask" id="ask" data-ask/);
  assert.match(hero, /<form class="ask-form" role="search" aria-label="[^"]+" data-ask-form hidden>/);
  assert.match(hero, /<label class="sr-only" for="ask-q">/);
  assert.match(hero, /<input class="ask-input" id="ask-q"[^>]*aria-keyshortcuts="\/"/);
  assert.match(hero, /<div class="ask-chips" data-ask-chips hidden>/);
  assert.match(hero, /<div class="ask-answer" data-ask-answer hidden>/);
  assert.match(hero, /<p class="sr-only" aria-live="polite" data-ask-said><\/p>/, 'the live region is in the page from the start');
  assert.match(hero, /<details class="ask-all" open>/);
  const items = [...hero.matchAll(/<details class="ask-item"><summary>([^<]+)<\/summary><div class="ask-item-b"><p>([^<]+)<\/p>/g)];
  assert.equal(items.length, guide.questions.length);
  const decode = (t) => t.replace(/&#x27;/g, "'").replace(/&amp;/g, '&');
  items.forEach((m, i) => {
    assert.equal(decode(m[1]), guide.questions[i].q);
    assert.equal(decode(m[2]), guide.questions[i].a);
  });
  const chips = [...hero.matchAll(/<button type="button" class="ask-chip" data-q="(\d+)">/g)].map((m) => Number(m[1]));
  assert.deepEqual(chips, guide.questions.map((q, i) => (q.chip ? i : -1)).filter((i) => i >= 0));
  assert.equal(chips.length, 4);
});
