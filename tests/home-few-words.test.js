// "Way less speech" (2026-10-13): the homepage says it in few, blunt words. Each budget is
// words per field; the agent gets a little caveman voice, everything else is plain and short.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const content = JSON.parse(readFileSync(new URL('../site/content.json', import.meta.url), 'utf8'));
const words = (s) => s.trim().split(/\s+/).filter((w) => /\w/.test(w)).length;
const within = (label, text, max) => assert.ok(words(text) <= max, `${label}: ${words(text)} words (max ${max}): "${text}"`);

test('hero, how-I-work and projects copy stay blunt', () => {
  within('meta.description', content.meta.description, 16);
  for (const line of content.hero.now.lines) within('hero.now line', line, 3);
  within('approach.intro', content.approach.intro, 8);
  for (const row of content.approach.rows) within('approach row', row.text, 3);
  within('projects.report', content.projects.report, 12);
});

test('each timeline entry is a few words', () => {
  for (const e of content.experience.entries.filter((x) => x.frame === 'centre')) within(`timeline ${e.year}`, `${e.lead} ${e.body}`, 14);
});

test('the agent talks short, with a caveman wink', () => {
  const g = content.guide;
  within('greeting', g.greeting, 6);
  assert.match(g.greeting, /^Me /, 'the agent introduces itself caveman-style');
  for (const [k, line] of Object.entries(g.lines)) within(`line ${k}`, line, 7);
  within('intro', g.intro, 7);
  for (const q of g.questions) {
    within(`q "${q.q}"`, q.q, 7);
    within(`a "${q.q}"`, q.a, 18);
  }
});
