// "Way less speech" (2026-10-13): the homepage says it in few, blunt words. Each budget is
// words per field; the agent gets a little caveman voice, everything else is plain and short.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const content = JSON.parse(readFileSync(new URL('../site/content.json', import.meta.url), 'utf8'));
const words = (s) => s.trim().split(/\s+/).filter((w) => /\w/.test(w)).length;
const within = (label, text, max) => assert.ok(words(text) <= max, `${label}: ${words(text)} words (max ${max}): "${text}"`);

test('the page says it in few words', () => {
  within('meta.description', content.meta.description, 16);
  within('hero headline', content.hero.headline, 10);
  within('hero lead', content.hero.lead, 24);
  within('about statement', `${content.about.lead} ${content.about.rest}`, 30);
  within('ergon body', content.ergon.body, 40);
  for (const [label, line] of [
    ['ergon', content.ergon.headline], ['built', content.built.headline], ['services', content.services.headline],
    ['stats', content.stats.headline], ['contact', content.contact.headline], ['modal', content.modal.headline],
  ]) within(`${label} headline`, line, 8);
  const lines = [
    ...content.built.cards.map((c) => c.text), ...content.services.rows.map((r) => r.text),
    ...content.stats.items.map((i) => i.label), ...content.hero.carousel.map((c) => c.title), content.ergon.ladderNote,
  ];
  for (const line of lines) within('line', line, 24);
});

test('every role, app and ladder step is a word or two', () => {
  const people = Object.values(content.ergon.teams).flatMap((t) => t.people);
  const labels = [...people.flatMap((p) => [p.role, ...p.apps]), ...content.ergon.ladder];
  assert.ok(labels.length > 0);
  for (const label of labels) within('ergon label', label, 2);
});

test('the agent talks plainly and briefly — no caveman voice, no meta lines', () => {
  const g = content.guide;
  within('greeting', g.greeting, 10);
  const all = [g.greeting, ...g.questions.flatMap((q) => [q.q, q.a])].join(' ');
  assert.doesNotMatch(all, /\bMe (agent|ride|look|follow|build|watch)\b/, 'caveman voice');
  assert.equal(g.intro, undefined, 'no "Cayleb wrote these. No live AI." line');
  assert.equal(g.lines, undefined, 'no speech-bubble lines');
  for (const q of g.questions) {
    within(`q "${q.q}"`, q.q, 7);
    within(`a "${q.q}"`, q.a, 32);
  }
});

// Plain words for the people who hire: no developer jargon in the homepage copy. Cayleb (2026-10-15): tech names
// may appear in the Built with list, the work cards' tags and terminal text (`builtWith`, `tags`, `terminal`, `cmd`).
const JARGON = /\b(loopback|daemon|JSON-RPC|Tauri|axum|Rust|React|Python|LLMs?|Clippy|SHA|provenance|deterministic|repo|PR|API|CLI|workbench|pipeline|IPC|SDK|runtime)\b/i;
test('homepage copy has no developer jargon', () => {
  const skip = new Set(['href', 'repo', 'image', 'alt', 'icon', 'marker', 'id', 'resumePdf', 'onePagePdf', 'email', 'github', 'siteUrl', 'shareImage', 'builtWith', 'tags', 'terminal', 'cmd']);
  const walk = (o, path) => Object.entries(o).flatMap(([k, v]) =>
    skip.has(k) ? [] : typeof v === 'string' ? [[`${path}.${k}`, v]] : v && typeof v === 'object' ? walk(v, `${path}.${k}`) : []);
  for (const [path, text] of walk(content, 'content')) assert.doesNotMatch(text, JARGON, `${path}: "${text}"`);
});

test('every tech name the page shows is one the résumé names', () => {
  const resume = readFileSync(new URL('../resume/resume-content.json', import.meta.url), 'utf8');
  const names = [...content.hero.builtWith, ...content.built.cards.flatMap((c) => c.tags).filter((t) => JARGON.test(t) || /TypeScript|Node|C#|SQLite|Windows/.test(t))];
  assert.ok(names.length >= 8);
  for (const name of names) assert.ok(resume.includes(name), `"${name}" is in resume-content.json`);
});
