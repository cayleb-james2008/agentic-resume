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
  assert.match(v.proof,/Illustrative estimates; actual savings are measured with each team\./);
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
});

// Dollars before and after (2026-10-13, third pass). Each card carries a sized example: what the
// busywork loses a month today, what it loses with his systems, and the yearly saving. The figures
// are whole numbers in content.json and the yearly saving is worked out at build time, so the
// arithmetic on the page can't drift. Each card says what business size the figures assume and
// where the money comes from — never from anyone's hours or pay.
const usd = (n) => '$' + n.toLocaleString('en-US');

test('each card shows the money lost a month, before and after, and the yearly saving', () => {
  const v = content.value;
  assert.match(v.money.label, /^Lost each month$/);
  assert.equal(v.money.today, v.todayLabel);
  assert.ok(v.money.after && v.money.saves && v.money.year);
  const cards = section.match(/<article class="value-example"[\s\S]*?<\/article>/g) || [];
  assert.equal(cards.length, v.examples.length);
  v.examples.forEach((e, i) => {
    const m = e.money;
    assert.ok(m, `${e.kind}: money`);
    assert.ok(Number.isInteger(m.today) && Number.isInteger(m.after), `${e.kind}: whole dollars`);
    assert.ok(m.today > m.after && m.after > 0, `${e.kind}: today ${m.today} > after ${m.after} > 0`);
    // Keep it believable for a small business.
    assert.ok(m.today <= 10000, `${e.kind}: ${m.today} a month is too big to believe`);
    const yearly = (m.today - m.after) * 12;
    assert.ok(yearly % 1000 === 0 && yearly <= 60000, `${e.kind}: yearly ${yearly}`);
    assert.ok(words(m.basis) <= 12, `basis: ${m.basis}`);
    assert.doesNotMatch(m.basis, /\d/, 'basis is words, the money is in the figures');
    assert.doesNotMatch(m.basis, /\b(pay|payroll|wages?|hours?|overtime|labou?r|staff|salar\w*)\b/i, m.basis);
    const card = cards[i];
    const money = card.match(/<div class="value-money">[\s\S]*?<\/div>/)?.[0] ?? '';
    assert.ok(money, `${e.kind}: .value-money block`);
    assert.ok(card.indexOf('class="value-rows"') < card.indexOf('class="value-money"'), 'money comes after the systems');
    assert.ok(money.includes(`${esc(v.money.label)}`), 'label');
    assert.match(money, new RegExp(`${v.money.today}</span> \\${usd(m.today)}<`), `today ${usd(m.today)}`);
    assert.match(money, new RegExp(`${v.money.after}</span> \\${usd(m.after)}<`), `after ${usd(m.after)}`);
    assert.ok(money.includes(`${v.money.saves} ${usd(yearly)} ${v.money.year}`), `saves ${usd(yearly)} ${v.money.year}`);
    assert.ok(money.includes(esc(m.basis)), m.basis);
    // The arrow is decoration; a screen reader hears "Today $5,000, With it $1,500".
    assert.match(money, /<span class="value-money-arrow" aria-hidden="true">→<\/span>/);
  });
});

test('the agent has a line for the value section', () => {
  assert.ok(content.guide.lines.value && words(content.guide.lines.value) <= 12);
  assert.match(read('site/js/guide/guide.js'), /const SECTIONS = \[[^\]]*'value'/);
});
