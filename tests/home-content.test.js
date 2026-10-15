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
  for (const [path, text] of strings(content)) {
    for (const m of text.matchAll(/\d+(?:,\d{3})*/g)) {
      // Cayleb's stated per-person monthly price, 2026-10-15, written only as "$100".
      if (m[0] === '100' && text[m.index - 1] === '$') continue;
      assert.ok(allowed.has(m[0]), `${path}: "${m[0]}" does not appear in resume-content.json`);
    }
  }
});

test("the page's parts each have their copy, and the water story is gone", () => {
  for (const key of ['loader', 'masthead', 'menu', 'hero', 'about', 'band', 'ergon', 'built', 'services', 'stats', 'resumeHalf', 'contact', 'modal', 'guide']) {
    assert.ok(content[key], `content.${key}`);
  }
  assert.equal(content.story, undefined);
  assert.equal(content.navAction, undefined);
  assert.equal(content.wordmark, 'Cayleb.AJ');
  assert.equal(content.hero.headline, "Show me how you work. I'll find where AI fits.");
  assert.equal(content.hero.eyebrow, 'Forward Thinking Engineer');
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
    assert.doesNotMatch(text, /\b(hedge fund|returns?|profit|revenue|clients?|customers?)\b/i, path);
  }
  assert.equal(resume.projects.some((p) => /\bEvoHedge\b|\bMaki\b/.test(p.name)), false);
  assert.doesNotMatch(JSON.stringify(content), /\bEvoHedge\b|\bMaki\b/);
  assert.match(resume.evidence_notes.ergon.windows_acceptance, /User testing is underway/);
});
