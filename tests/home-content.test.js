import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const content = JSON.parse(read('site/content.json'));
const resumeText = read('resume/resume-content.json');
const resume = JSON.parse(resumeText);
const limits = JSON.parse(read('site/content-limits.json'));

/** Every string in a JSON value, with its dotted path. */
const strings = (value, path = '') => {
  if (typeof value === 'string') return [[path, value]];
  if (Array.isArray(value)) return value.flatMap((item, i) => strings(item, `${path}[${i}]`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) => strings(item, path ? `${path}.${key}` : key));
  }
  return [];
};

/** Values at a path pattern such as `projects.cards[].name`. */
const select = (value, pattern) => {
  const parts = pattern.split('.');
  let nodes = [[value, '']];
  for (const part of parts) {
    const list = part.endsWith('[]');
    const key = list ? part.slice(0, -2) : part;
    nodes = nodes.flatMap(([node, path]) => {
      const next = node?.[key];
      const at = path ? `${path}.${key}` : key;
      if (next === undefined) return [];
      return list ? next.map((item, i) => [item, `${at}[${i}]`]) : [[next, at]];
    });
  }
  return nodes;
};

test('numbers trace to the résumé', () => {
  const allowed = new Set([...resumeText.matchAll(/\d+(?:,\d{3})*/g)].map((m) => m[0]));
  for (const ordinal of ['01', '02', '03']) allowed.add(ordinal);
  for (const [path, text] of strings(content)) {
    for (const [token] of text.matchAll(/\d+(?:,\d{3})*/g)) {
      assert.ok(allowed.has(token), `${path}: "${token}" does not appear in resume-content.json`);
    }
  }
});

test('computed stats match', () => {
  const stat = (label) => content.hero.glance.stats.find((s) => s.label === label).value;
  assert.equal(stat('Projects'), String(content.projects.cards.length));
  const languages = resume.skills.find(([name]) => name === 'Languages')[1].split(',');
  assert.equal(stat('Languages'), String(languages.length));
  assert.equal(stat('Tools'), '10');
  assert.match(resume.projects.find(p=>p.slug==='suite').bullets[0], /ten/i);
  assert.match(content.hero.lab.sub, /^10 recorded demos$/);
});

test('name renders as three words', () => {
  const [first, ...rest] = content.hero.nameWords;
  assert.equal(content.hero.nameWords.length, 3);
  assert.equal(`${first} ${rest.join('')}`, resume.full_name);
});

test('employers match the résumé', () => {
  const entries = content.experience.entries;
  const text = entries.map((e) => `${e.lead ?? ''} ${e.title ?? ''}`).join(' | ');
  for (const job of resume.additional_experience) {
    const name = job.organization.split(' — ')[0];
    assert.ok(text.includes(name), `${name} appears in the timeline`);
  }
  assert.ok(text.includes(resume.education.school));
});

test('content lengths stay inside their frames', () => {
  for (const [pattern, max] of Object.entries(limits)) {
    const found = select(content, pattern);
    assert.ok(found.length > 0, `limit ${pattern} matches something`);
    for (const [value, path] of found) {
      const length = [...String(value)].length;
      assert.ok(length <= max, `${path} is ${length} characters; its frame allows ${max}`);
    }
  }
  const labels = content.hero.glance.stats.map((s) => [...s.label].length).reduce((a, b) => a + b, 0);
  assert.ok(labels <= 22, `the three stat labels total ${labels} characters; their row allows 22`);
  for (const entry of content.experience.entries.filter((e) => e.frame === 'centre')) {
    const length = [...`${entry.lead} ${entry.body}`].length;
    assert.ok(length <= 190, `centre copy "${entry.lead}" is ${length} characters; its column allows 190`);
  }
});

test('banned claims stay out', () => {
  for (const [path, text] of strings(content)) {
    assert.doesNotMatch(text, /\b(hedge fund|returns?|profit|revenue|clients?)\b/i, path);
  }
  assert.equal(content.projects.cards.some(c=>['EvoHedge','Maki'].includes(c.name)),false);
  for(const name of ['Ergon','Asmodeus'])assert.ok(content.projects.cards.find(c=>c.name===name).href);
  assert.equal(content.projects.cards.find(c=>c.name==='Ergon').status,'Windows pilot');
  assert.match(resume.evidence_notes.ergon.windows_acceptance,/User testing is underway/);
});

test('generated imagery is labelled as illustration', () => {
  const images = [
    ...content.experience.entries,
    content.projects.figure,
    content.contact.figure,
  ];
  for (const image of images) assert.match(image.alt, /^Illustration: /);
});
