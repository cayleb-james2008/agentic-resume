// What it is worth (2026-10-15): the water story's last beat replaces "Worth it". One plain
// price per person, the time it gives back, and hard tickets that climb to a person. The money
// never comes from anyone's hours, pay or job, and no AI model is named.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const raw = read('site/content.json');
const content = JSON.parse(raw);
const home = read('index.html');
const beat = (id) => content.story.beats.find((b) => b.id === id);

test('the pitch never saves money by taking hours, pay or people', () => {
  const all = JSON.stringify(content.story) + JSON.stringify(content.guide) + content.meta.description;
  assert.doesNotMatch(all, /headcount|lay ?offs?|replac\w* (staff|workers|people|employees|crew)|fewer (people|staff|employees|workers)|cut\w* (hours|pay|wages|staff|jobs)|(reduce|lower)\w* (payroll|wages|hours)/i);
});

test('the worth beat names the price per person, and the page shows it', () => {
  const worth = beat('worth');
  assert.match(worth.headline, /\$100 a person a month/);
  assert.ok(home.includes(`<h2>${worth.headline}</h2>`), 'the headline is on the page');
});

test('hard tickets go up the ladder to a person', () => {
  assert.deepEqual(beat('tickets').ladder, ['Agent', 'Senior agent', 'Person']);
});

test('no AI model is named anywhere in the content', () => {
  assert.doesNotMatch(raw, /Haiku|Sonnet|Opus/i);
});
