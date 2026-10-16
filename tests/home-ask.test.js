// The Ask bar's matcher (site/js/ask/match.js, 2026-10-16): a visitor's question finds the written answer it means,
// a question with no written answer says so, and nothing ever leaves the page.
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { SYNONYMS, ask, buildIndex, decide, normalize, oneEdit, rank, stem, tokens } from '../site/js/ask/match.js';

const read = (file) => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const content = JSON.parse(read('site/content.json'));
const home = read('index.html');
const questions = content.guide.questions;
const index = buildIndex(questions);
const chips = questions.map((q, i) => (q.chip ? i : -1)).filter((i) => i >= 0);
const answerFor = (query) => {
  const d = ask(index, query, chips);
  return d.kind === 'answer' ? questions[d.i].q : d.kind;
};

test('a question is read for its words: accents off, curly apostrophes straightened, plurals and tenses met', () => {
  assert.equal(normalize('  Résumé, PLEASE!  '), 'resume please');
  assert.equal(normalize('What’s Ergon?'), "what's ergon");
  assert.equal(stem('tests'), 'test');
  assert.equal(stem('testing'), 'test');
  assert.equal(stem('companies'), 'company');
  assert.deepEqual(tokens('What does Cayleb do?'), []);
  assert.deepEqual(tokens('Do you have clients?'), ['company'], 'a word the copy rules keep out is still heard');
  assert.ok(oneEdit('ergon', 'ergn') && oneEdit('price', 'prise') && !oneEdit('cost', 'post!'));
});

test('every written question finds itself', () => {
  questions.forEach((q, i) => {
    const d = ask(index, q.q, chips);
    assert.deepEqual(d, { kind: 'answer', i }, q.q);
  });
});

const CASES = [
  ['how much is ergon', 'What does Ergon cost?'],
  ['pricing?', 'What does Ergon cost?'],
  ['ergn price', 'What does Ergon cost?'],
  ['are you available', 'Can I hire Cayleb?'],
  ['can we hire him', 'Can I hire Cayleb?'],
  ['cv', 'Can I hire Cayleb?'],
  ['is he remote', 'Can I hire Cayleb?'],
  ['do you have clients', 'Done this for a company?'],
  ['has he done a pilot', 'Done this for a company?'],
  ['what languages do you know', 'What does he build with?'],
  ['python?', 'What does he build with?'],
  ['show me a demo', 'Can I see it working?'],
  ['github', 'Is the code public?'],
  ['can i see the code', 'Is the code public?'],
  ['will ai replace my staff', "Will it take anyone's job?"],
  ['will people lose their jobs', "Will it take anyone's job?"],
  ['is my data private', 'What if a tool makes a mistake?'],
  ['is it safe', 'What if a tool makes a mistake?'],
  ['trading', "What's Asmodeus?"],
  ['email', 'How do I reach him?'],
  ['what is ergon', "What's Ergon?"],
  ['what does he do', 'What does Cayleb do?'],
  ['who is cayleb', 'What does Cayleb do?'],
  ['how do you test', 'How does he test his work?'],
  ['does he use chatgpt', 'Does he use AI to code?'],
  ['where did he go to school', 'Where did he study?'],
  ['how do we start', 'How would he start with my team?'],
  ['does it work with quickbooks', 'What apps does it work with?'],
  ['what can you automate', 'What kind of tools?'],
  // From the 2026-10-16 reviews: his rate is its own answer, never Ergon's price; a past job is his experience;
  // place is hiring.
  ['What is his hourly rate?', 'What does Cayleb charge?'],
  ['What are his rates?', 'What does Cayleb charge?'],
  ['salary expectations', 'What does Cayleb charge?'],
  ['What does Cayleb charge?', 'What does Cayleb charge?'],
  ['how much does he charge', 'What does Cayleb charge?'],
  ['What do you charge?', 'What does Cayleb charge?'],
  ['How much do your services cost?', 'What does Cayleb charge?'],
  ['can I get a quote', 'What does Cayleb charge?'],
  ['how much per person per month', 'What does Ergon cost?'],
  ['What was his last job?', 'Done this for a company?'],
  ['Would he work in our office?', 'Can I hire Cayleb?'],
  ['Is he open to on-site work?', 'Can I hire Cayleb?'],
  ['Is he open to hybrid?', 'Can I hire Cayleb?'],
  ['Can he relocate?', 'Can I hire Cayleb?'],
];
for (const [query, expected] of CASES) {
  test(`"${query}" finds "${expected}"`, () => assert.equal(answerFor(query), expected));
}

test('Ergon\'s price is never the answer for another product, or for what Cayleb charges', () => {
  for (const query of ['How much is dotz?', 'What does Sophos cost?', 'What does Sophos charge?', 'How much is the suite?',
    'What does Cayleb charge?', 'how much does he charge', 'What do you charge?', 'what are your prices']) {
    assert.notEqual(answerFor(query), 'What does Ergon cost?', query);
  }
  for (const query of ['How much is dotz?', 'What does Sophos cost?', 'How much is the suite?']) {
    assert.equal(answerFor(query), 'fallback', `${query}: no written answer, so it says so`);
  }
  // Ergon's own price, asked with "charge": the price answer, or the price offered first.
  const ergon = ask(index, 'What does Ergon charge?', chips);
  const first = ergon.kind === 'answer' ? ergon.i : ergon.suggestions[0];
  assert.equal(questions[first].q, 'What does Ergon cost?');
});

test('his age has no written answer, so an age question says so rather than answering about school', () => {
  assert.ok(!('age' in SYNONYMS) && !('old' in SYNONYMS));
  for (const query of ['How old is Cayleb?', 'how old is he', 'what is his age']) {
    assert.equal(answerFor(query), 'fallback', query);
  }
});

test('a question with no written answer says so and offers the closest ones, or the suggestions', () => {
  assert.deepEqual(ask(index, '', chips), { kind: 'empty' });
  assert.deepEqual(ask(index, '   ', chips), { kind: 'empty' });
  for (const query of ['asdfgh', 'the weather today', 'favourite colour']) {
    const d = ask(index, query, chips);
    assert.equal(d.kind, 'fallback', query);
    assert.ok(d.suggestions.length >= 1 && d.suggestions.length <= 3, query);
  }
  assert.deepEqual(ask(index, 'asdfgh', chips).suggestions, chips.slice(0, 3));
  // Two questions close together: no guess, both offered.
  assert.deepEqual(decide([{ i: 2, score: 5 }, { i: 7, score: 4.8 }], 'x'), { kind: 'fallback', suggestions: [2, 7] });
});

test('the same question always gives the same answer', () => {
  for (const [query] of CASES) assert.deepEqual(rank(index, query), rank(index, query), query);
});

test('every written answer has words to be found by and somewhere to read more', () => {
  assert.equal(chips.length, 4);
  for (const q of questions) {
    assert.ok(q.keywords.length >= 2, `${q.q} keywords`);
    assert.ok(q.sources.length >= 1, `${q.q} sources`);
    for (const { href } of [...q.sources, ...(q.links ?? [])]) {
      if (href.startsWith('#')) assert.match(home, new RegExp(`\\sid="${href.slice(1)}"`), href);
      else if (href.startsWith('https://')) assert.match(href, /^https:\/\/github\.com\/cayleb-james2008\//, href);
      else if (!href.startsWith('mailto:')) assert.ok(existsSync(new URL(`../${href.endsWith('/') ? `${href}index.html` : href}`, import.meta.url)), href);
    }
  }
});

test('nothing a visitor types leaves the page: no script makes a request', () => {
  const walk = (dir) => readdirSync(dir).flatMap((n) => (statSync(`${dir}/${n}`).isDirectory() ? walk(`${dir}/${n}`) : [`${dir}/${n}`]));
  const files = walk(new URL('../site/js', import.meta.url).pathname).filter((f) => f.endsWith('.js'));
  assert.ok(files.some((f) => f.endsWith('ask/ask.js')));
  for (const file of files) {
    assert.doesNotMatch(readFileSync(file, 'utf8'), /\bfetch\(|XMLHttpRequest|WebSocket|sendBeacon|EventSource|\bimport\(/, file);
  }
});
