// "Worth it" (2026-10-13): what an employer gets for the money. The value comes from fewer
// mistakes, faster answers, less outside spend and people staying, never from cutting anyone's
// hours or pay. The calculator runs on the visitor's own numbers; nothing is claimed as achieved.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { valueMath } from '../site/js/value/math.js';

const read = (file) => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const content = JSON.parse(read('site/content.json'));
const home = read('index.html');
const section = home.match(/<section class="value"[\s\S]*?<\/section>/)?.[0] ?? '';
const words = (s) => s.trim().split(/\s+/).filter((w) => /\w/.test(w)).length;

test('the value section sits between projects and contact, with one h2', () => {
  assert.ok(section, 'section.value');
  assert.match(section, /^<section class="value" data-value id="value" aria-labelledby="value-title">/);
  assert.equal((section.match(/<h2\b/g) || []).length, 1);
  assert.ok(home.indexOf('id="work"') < home.indexOf('id="value"'));
  assert.ok(home.indexOf('id="value"') < home.indexOf('id="contact"'));
  assert.ok(home.includes('href="site/css/value.css"'));
  assert.match(read('site/js/main.js'), /\['\[data-value\]', mountValue\]/);
});

test('it names four ways the money comes back, each in a few words', () => {
  const v = content.value;
  assert.equal(v.levers.length, 4);
  for (const l of v.levers) {
    assert.ok(words(l.title) <= 3, l.title);
    assert.ok(words(l.line) <= 7, l.line);
    assert.ok(section.includes(l.title.replace(/'/g, '&#x27;')) || section.includes(l.title), l.title);
  }
  assert.ok(words(v.intro) <= 12, v.intro);
  assert.equal(v.steps.length, 3);
  for (const s of v.steps) assert.ok(words(s) <= 3, s);
});

test('the pitch never saves money by taking hours, pay or people', () => {
  const all = JSON.stringify(content.value) + section;
  assert.doesNotMatch(all, /headcount|lay ?offs?|replac\w* (staff|workers|people|employees)|fewer (people|staff|employees|workers)|cut\w* (hours|pay|wages|staff|jobs)|(reduce|lower)\w* (payroll|wages|hours)/i);
  assert.match(content.value.intro, /no cuts/i);
});

test('the calculator is labelled, runs on the visitor\'s numbers and says so', () => {
  const inputs = [...section.matchAll(/<input\b[^>]*>/g)].map((m) => m[0]);
  assert.equal(inputs.length, 4);
  for (const input of inputs) {
    const id = input.match(/id="([^"]+)"/)[1];
    assert.ok(section.includes(`<label for="${id}"`), `label for ${id}`);
    assert.match(input, /inputmode="(decimal|numeric)"/);
    assert.doesNotMatch(input, /\svalue="[^"]+"/, 'no made-up defaults: the visitor brings the numbers');
  }
  assert.match(section, /<output[^>]*aria-live="polite"/);
  assert.match(content.value.calc.note, /your numbers/i);
});

test('the math: yearly savings from the visitor\'s costs, and the return on hiring', () => {
  assert.deepEqual(valueMath({ mistakes: 5000, outside: 3000, trim: 25, hire: 60000 }), { perYear: 24000, multiple: 0.4 });
  assert.deepEqual(valueMath({ mistakes: 20000, outside: 10000, trim: 25, hire: 60000 }), { perYear: 90000, multiple: 1.5 });
  assert.deepEqual(valueMath({ mistakes: 4000, outside: 0, trim: 50 }), { perYear: 24000, multiple: null });
  assert.deepEqual(valueMath({}), { perYear: null, multiple: null });
  assert.deepEqual(valueMath({ mistakes: -5, outside: 'x', trim: 300, hire: 0 }), { perYear: 0, multiple: null });
});

test('the agent has a line for the value section', () => {
  assert.ok(content.guide.lines.value && words(content.guide.lines.value) <= 7);
  assert.match(read('site/js/guide/guide.js'), /const SECTIONS = \[[^\]]*'value'/);
});
