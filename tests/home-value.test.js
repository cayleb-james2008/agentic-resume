// "Worth it" (2026-10-13, second pass): how the value gets made in businesses like the ones
// Cayleb has worked in — a moving company, a plaster and pool crew, a shop. Each example shows
// the busywork today, what his tools do instead, and what the business gets. No calculator.
// The value never comes from anyone's hours or pay.
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const content = JSON.parse(read('site/content.json'));
const home = read('index.html');
const section = (home.match(/<section class="value"[\s\S]*?<\/section>/)?.[0] ?? '').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"');
const words = (s) => s.trim().split(/\s+/).filter((w) => /\w/.test(w)).length;
const esc = (s) => s.replace(/&/g, '&amp;');

test('the value section sits between projects and contact, with one h2', () => {
  assert.ok(section, 'section.value');
  assert.match(section, /^<section class="value" data-value id="value" aria-labelledby="value-title">/);
  assert.equal((section.match(/<h2\b/g) || []).length, 1);
  assert.ok(home.indexOf('id="work"') < home.indexOf('id="value"'));
  assert.ok(home.indexOf('id="value"') < home.indexOf('id="contact"'));
});

test('it shows full systems for three kinds of business he has worked in', () => {
  const v = content.value;
  assert.deepEqual(v.examples.map((e) => e.kind), ['A moving company', 'A plaster and pool crew', 'A shop or restaurant']);
  for (const e of v.examples) {
    assert.equal(e.rows.length, 3, e.kind);
    for (const r of e.rows) {
      assert.ok(words(r.system) <= 4, `system name: ${r.system}`);
      assert.ok(words(r.then) >= 12 && words(r.then) <= 28, `${e.kind}: a whole system, said briefly: "${r.then}"`);
      assert.ok(words(r.now) <= 10, `today: ${r.now}`);
      for (const t of [r.system, r.then, r.now]) assert.ok(section.includes(esc(t)), t);
    }
    assert.ok(words(e.value) <= 12, e.value);
    assert.ok(section.includes(esc(e.value)));
  }
  assert.ok(section.includes(esc(v.proof)));
  assert.ok(section.includes(esc(v.wired)));
});

test('the systems read as his confident offer, without naming a real company as a client', () => {
  assert.match(content.value.cardLabel, /^What he builds for$/);
  assert.ok(section.includes(esc(content.value.cardLabel)));
  assert.doesNotMatch(JSON.stringify(content.value) + section, /Robert H\.? Lord|\bRHL\b|David Cooke|Dunkin|Tommy/i);
});

test('no calculator: no form, no inputs, no script', () => {
  assert.doesNotMatch(section, /<form|<input|<output/);
  assert.equal(existsSync(new URL('../site/js/value/value.js', import.meta.url)), false);
  assert.doesNotMatch(read('site/js/main.js'), /value\.js/);
  assert.equal(content.value.calc, undefined);
});

test('the pitch never saves money by taking hours, pay or people', () => {
  const all = JSON.stringify(content.value) + section;
  assert.doesNotMatch(all, /headcount|lay ?offs?|replac\w* (staff|workers|people|employees|crew)|fewer (people|staff|employees|workers)|cut\w* (hours|pay|wages|staff|jobs)|(reduce|lower)\w* (payroll|wages|hours)/i);
  assert.match(content.value.intro, /no cuts/i);
  // No numbers it can't back: the examples carry no figures.
  for (const e of content.value.examples) assert.doesNotMatch(JSON.stringify(e), /\d/, e.kind);
});

test('the agent has a line for the value section', () => {
  assert.ok(content.guide.lines.value && words(content.guide.lines.value) <= 12);
  assert.match(read('site/js/guide/guide.js'), /const SECTIONS = \[[^\]]*'value'/);
});
