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

/** Values at a path pattern such as `story.beats[].roles[]`. */
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
  // Cayleb's stated per-person monthly price, 2026-10-15.
  const worth = content.story.beats.find((b) => b.id === 'worth');
  if (/\$100/.test(JSON.stringify(worth))) allowed.add('100');
  for (const [path, text] of strings(content)) {
    for (const [token] of text.matchAll(/\d+(?:,\d{3})*/g)) {
      assert.ok(allowed.has(token), `${path}: "${token}" does not appear in resume-content.json`);
    }
  }
});

test('name renders as three words', () => {
  const [first, ...rest] = content.story.intro.nameWords;
  assert.equal(content.story.intro.nameWords.length, 3);
  assert.equal(`${first} ${rest.join('')}`, resume.full_name);
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
});

test('banned claims stay out', () => {
  for (const [path, text] of strings(content)) {
    assert.doesNotMatch(text, /\b(hedge fund|returns?|profit|revenue|clients?)\b/i, path);
  }
  assert.equal(resume.projects.some((p) => /\bEvoHedge\b|\bMaki\b/.test(p.name)), false);
  assert.doesNotMatch(JSON.stringify(content), /\bEvoHedge\b|\bMaki\b/);
  assert.match(resume.evidence_notes.ergon.windows_acceptance, /User testing is underway/);
});
