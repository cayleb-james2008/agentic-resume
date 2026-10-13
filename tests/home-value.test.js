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
});

// Built around each company (2026-10-13, fifth pass). A big part of the value is the fit: each
// build is shaped by the company's situation, the tools it already uses, how its people work and
// what it needs. It sits right after the head, before the examples, so it frames them.
test('the value section says every build is shaped around the company', () => {
  const f = content.value.fit;
  assert.match(f.title, /^Built around each company$/);
  assert.ok(words(f.lead) <= 8, `lead: ${f.lead}`);
  assert.deepEqual(f.points.map((p) => p.name), ['Their situation', 'Their tools', 'How they work', 'What they need']);
  for (const p of f.points) assert.ok(words(p.text) >= 8 && words(p.text) <= 18, `${p.name}: ${p.text}`);
  // The old "wired into the tools they already use" line now lives in "Their tools".
  assert.equal(content.value.wired, undefined);
  assert.match(f.points[1].text, /phones/i);
  assert.match(f.points[1].text, /already use/i);
  assert.match(f.points[2].text, /shadows/i);
  const fit = section.match(/<div class="value-fit"[\s\S]*?<\/ul><\/div>/)?.[0] ?? '';
  assert.ok(fit, '.value-fit block');
  assert.ok(section.indexOf('class="value-fit"') < section.indexOf('class="value-examples"'), 'before the examples');
  assert.ok(fit.includes(`<h3 class="value-fit-title">${esc(f.title)}</h3>`), 'h3 title');
  assert.ok(fit.includes(esc(f.lead)), 'lead');
  const items = fit.match(/<li class="value-fit-point">[\s\S]*?<\/li>/g) || [];
  assert.equal(items.length, 4);
  f.points.forEach((p, i) => {
    assert.ok(items[i].includes(`<p class="value-fit-name">${esc(p.name)}</p>`), p.name);
    assert.ok(items[i].includes(`<p class="value-fit-text">${esc(p.text)}</p>`), p.text);
  });
});

test('the page description and the agent say it too: AI built around each company, saving money', () => {
  assert.match(content.meta.description, /Integrates AI built around each company\. Saves money, no cuts\.$/);
  assert.match(content.guide.lines.value, /each company/i);
  const what = content.guide.questions.find((q) => q.q === 'What does Cayleb do?');
  assert.match(what.a, /bring AI into companies to save them money/i);
  assert.match(what.a, /around how they work, what they use and what they need/i);
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

// Dollars before and after, as a receipt (2026-10-13, fourth pass). Each card carries a sized
// example: every cost line names what the busywork loses, how many a month today → with his
// systems, and the price of each. The site multiplies and adds, so the line amounts, the totals
// and the yearly saving always agree. Each card says what business size it assumes. The money
// never comes from anyone's hours or pay.
const usd = (n) => '$' + (Number.isInteger(n) ? n.toLocaleString('en-US') : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
const NOT_PAY = /\b(pay|payroll|wages?|hours?|overtime|labou?r|staff|salar\w*|shifts?)\b/i;
const receipt = (m) => {
  const lines = m.items.map((it) => ({ ...it, today: Math.round(it.qty[0] * it.each), after: Math.round(it.qty[1] * it.each) }));
  const today = lines.reduce((t, l) => t + l.today, 0);
  const after = lines.reduce((t, l) => t + l.after, 0);
  return { lines, today, after, yearly: (today - after) * 12 };
};

test('each card itemizes the money lost a month, today and with his systems', () => {
  const v = content.value;
  assert.match(v.money.label, /^Lost each month$/);
  assert.equal(v.money.today, v.todayLabel);
  for (const k of ['after', 'total', 'item', 'to', 'per', 'saves', 'year']) assert.ok(v.money[k], `money.${k}`);
  for (const e of v.examples) {
    const m = e.money;
    assert.ok(m.items.length >= 3 && m.items.length <= 4, `${e.kind}: 3 or 4 cost lines`);
    for (const it of m.items) {
      assert.ok(words(it.what) <= 5, `cost line: ${it.what}`);
      assert.doesNotMatch(it.what + ' ' + it.unit, /\d/, 'names are words; counts and prices are numbers');
      assert.doesNotMatch(it.what + ' ' + it.unit, NOT_PAY, it.what);
      assert.ok(words(it.unit) === 1 && !/s$/.test(it.unit), `one of a thing: ${it.unit}`);
      assert.ok(it.qty.length === 2 && it.qty.every(Number.isInteger), `${it.what}: whole counts`);
      assert.ok(it.qty[0] > it.qty[1] && it.qty[1] >= 0, `${it.what}: fewer with his systems`);
      assert.ok(it.each > 0 && Number.isInteger(Math.round(it.each * 100)) && Math.abs(it.each * 100 - Math.round(it.each * 100)) < 1e-9, `${it.what}: price in cents`);
      assert.ok(Number.isInteger(it.qty[0] * it.each), `${it.what}: whole-dollar line`);
    }
    const r = receipt(m);
    assert.ok(r.today > r.after && r.after > 0, `${e.kind}: ${r.today} > ${r.after} > 0`);
    // Believable for a small business.
    assert.ok(r.today <= 10000 && r.yearly <= 60000, `${e.kind}: ${r.today}/mo, ${r.yearly}/yr`);
    // The receipt shows where the money comes from; the line under it says what size of business.
    assert.match(m.basis, /^Sized for (a|an|one) [a-z -]+\.$/, `basis: ${m.basis}`);
    assert.equal(m.today, undefined, 'totals are worked out, not typed');
    assert.equal(m.after, undefined, 'totals are worked out, not typed');
  }
});

test('the receipt on the page shows every line, the totals and the yearly saving', () => {
  const v = content.value;
  const L = v.money;
  const cards = section.match(/<article class="value-example"[\s\S]*?<\/article>/g) || [];
  assert.equal(cards.length, v.examples.length);
  v.examples.forEach((e, i) => {
    const r = receipt(e.money);
    const card = cards[i];
    const money = card.match(/<div class="value-money">[\s\S]*?<\/div>/)?.[0] ?? '';
    assert.ok(money, `${e.kind}: .value-money`);
    assert.ok(card.indexOf('class="value-rows"') < card.indexOf('class="value-money"'), 'money comes after the systems');
    const table = money.match(/<table class="value-receipt">[\s\S]*?<\/table>/)?.[0] ?? '';
    assert.ok(table, 'a real table');
    assert.ok(table.includes(`<caption class="value-money-label">${L.label}</caption>`), 'caption');
    assert.ok(table.includes(`<thead><tr><th scope="col"><span class="sr-only">${L.item}</span></th><th scope="col">${L.today}</th><th scope="col">${L.after}</th></tr></thead>`), 'column heads');
    const rows = table.match(/<tbody>([\s\S]*?)<\/tbody>/)[1].match(/<tr>[\s\S]*?<\/tr>/g) || [];
    assert.equal(rows.length, r.lines.length, `${e.kind}: one row per cost line`);
    r.lines.forEach((l, j) => {
      const row = rows[j];
      assert.ok(row.startsWith(`<tr><th scope="row"><span class="value-receipt-what">${esc(l.what)}</span>`), l.what);
      const math = `${l.qty[0].toLocaleString('en-US')} <span aria-hidden="true">→</span><span class="sr-only"> ${L.to}</span> ${l.qty[1].toLocaleString('en-US')}, ${usd(l.each)} ${L.per} ${esc(l.unit)}`;
      assert.ok(row.includes(`<span class="value-receipt-math">${math}</span>`), `math: ${l.what}`);
      assert.ok(row.endsWith(`<td>${usd(l.today)}</td><td>${usd(l.after)}</td></tr>`), `amounts: ${l.what} ${usd(l.today)} → ${usd(l.after)}`);
    });
    assert.ok(table.includes(`<tfoot><tr><th scope="row">${L.total}</th><td>${usd(r.today)}</td><td>${usd(r.after)}</td></tr></tfoot>`), `${e.kind}: total ${usd(r.today)} → ${usd(r.after)}`);
    assert.ok(money.includes(`<p class="value-money-saved">${L.saves} ${usd(r.yearly)} ${L.year}</p>`), `saves ${usd(r.yearly)}`);
    assert.ok(money.includes(esc(e.money.basis)), e.money.basis);
  });
});

test('the agent has a line for the value section', () => {
  assert.ok(content.guide.lines.value && words(content.guide.lines.value) <= 12);
  assert.match(read('site/js/guide/guide.js'), /const SECTIONS = \[[^\]]*'value'/);
});
