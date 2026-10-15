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

/** Everything a visitor can read on the homepage: its text with the tags stripped, and the words in its attributes. */
const visible = (() => {
  const page = home.replace(/<(script|style)\b[\s\S]*?<\/\1>/g, ' ');
  const decode = (t) => t.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  const text = decode(page.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
  const attributes = [...page.matchAll(/\s(?:alt|aria-label|title|content|placeholder)="([^"]*)"/g)].map((m) => decode(m[1]));
  return [text, ...attributes];
})();
/** Every string in content.json, with its path. */
const strings = [];
(function walk(value, path) {
  if (typeof value === 'string') strings.push([path, value]);
  else if (value && typeof value === 'object') for (const [k, v] of Object.entries(value)) walk(v, `${path}.${k}`);
})(content, 'content');

const TAKES = /headcount|lay ?offs?|replac\w* (staff|workers|people|employees|crew)|fewer (people|staff|employees|workers)|cut\w* (hours|pay|wages|staff|jobs)|(reduce|lower)\w* (payroll|wages|hours)/i;

test('the pitch never saves money by taking hours, pay or people: not in any of the homepage\'s copy', () => {
  // All of it (ruling R32): every string in content.json, and all the homepage shows, the résumé half included.
  assert.ok(strings.length > 100, `${strings.length} content strings`);
  for (const [path, value] of strings) assert.doesNotMatch(value, TAKES, path);
  // The page's own text is all there to check: the story, the résumé half, the footer and the guide.
  const [text] = visible;
  for (const piece of [beat('worth').headline, 'Work ethic', content.contact.copyright, content.meta.description]) {
    assert.ok(visible.some((v) => v.includes(piece)), `the homepage shows "${piece}"`);
  }
  assert.ok(text.length > 3000);
  for (const value of visible) assert.doesNotMatch(value, TAKES);
});

test('no clients, revenue, profit or returns anywhere a visitor reads on the homepage', () => {
  for (const value of visible) assert.doesNotMatch(value, /\b(clients?|revenue|profits?|returns?)\b/i);
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
