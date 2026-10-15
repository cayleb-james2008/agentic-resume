// "Way less speech" (2026-10-13): the homepage says it in few, blunt words. Each budget is
// words per field; the agent gets a little caveman voice, everything else is plain and short.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const content = JSON.parse(readFileSync(new URL('../site/content.json', import.meta.url), 'utf8'));
const words = (s) => s.trim().split(/\s+/).filter((w) => /\w/.test(w)).length;
const within = (label, text, max) => assert.ok(words(text) <= max, `${label}: ${words(text)} words (max ${max}): "${text}"`);

test('the story says it in few words', () => {
  within('meta.description', content.meta.description, 16);
  const [hero, ...rest] = content.story.beats;
  assert.equal(hero.id, 'hero');
  within('hero headline', hero.headline, 10);
  // Ruling R4 (2026-10-15): Cayleb's approved support line is 23 words, so its budget is 24.
  within('hero line', hero.line, 24);
  for (const b of rest) {
    within(`${b.id} headline`, b.headline, 6);
    within(`${b.id} line`, b.line, 16);
  }
});

test('every role, label and ladder step is a word or two', () => {
  const labels = content.story.beats.flatMap((b) => [...(b.roles ?? []), ...(b.labels ?? []), ...(b.ladder ?? [])]);
  assert.ok(labels.length > 0);
  for (const label of labels) within('story label', label, 2);
});

test('the agent talks plainly and briefly — no caveman voice, no meta lines', () => {
  const g = content.guide;
  within('greeting', g.greeting, 10);
  const all = [g.greeting, ...Object.values(g.lines), ...g.questions.flatMap((q) => [q.q, q.a])].join(' ');
  assert.doesNotMatch(all, /\bMe (agent|ride|look|follow|build|watch)\b/, 'caveman voice');
  assert.equal(g.intro, undefined, 'no "Cayleb wrote these. No live AI." line');
  for (const [k, line] of Object.entries(g.lines)) within(`line ${k}`, line, 12);
  for (const q of g.questions) {
    within(`q "${q.q}"`, q.q, 7);
    within(`a "${q.q}"`, q.a, 32);
  }
});

// Plain words for the people who hire: no developer jargon in the homepage copy.
const JARGON = /\b(loopback|daemon|JSON-RPC|Tauri|axum|Rust|React|Python|LLMs?|Clippy|SHA|provenance|deterministic|repo|PR|API|CLI|workbench|pipeline|IPC|SDK|runtime)\b/i;
test('homepage copy has no developer jargon', () => {
  const skip = new Set(['href', 'repo', 'image', 'alt', 'icon', 'marker', 'id', 'resumePdf', 'onePagePdf', 'email', 'github', 'siteUrl', 'shareImage']);
  const walk = (o, path) => Object.entries(o).flatMap(([k, v]) =>
    skip.has(k) ? [] : typeof v === 'string' ? [[`${path}.${k}`, v]] : v && typeof v === 'object' ? walk(v, `${path}.${k}`) : []);
  for (const [path, text] of walk(content, 'content')) assert.doesNotMatch(text, JARGON, `${path}: "${text}"`);
});
