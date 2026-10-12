import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (file) => readFileSync(new URL(file, root), 'utf8');
const home = read('index.html');
const content = JSON.parse(read('site/content.json'));

const count = (pattern) => (home.match(pattern) || []).length;
const sectionBodies = () => [...home.matchAll(/<section\b[^>]*>([\s\S]*?)<\/section>/g)].map((m) => m[0]);

test('one h1 holding the full name for assistive technology', () => {
  assert.equal(count(/<h1\b/g), 1);
  const h1 = home.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)[1];
  assert.match(h1, /<span class="sr-only">Cayleb Alvarez-James<\/span>/);
  const hero = sectionBodies().find((s) => s.includes('data-hero'));
  assert.ok(hero.includes('<h1'), 'the h1 lives in the hero section');
});

test('five sections, the other four each with one h2', () => {
  const sections = sectionBodies();
  assert.equal(sections.length, 5);
  for (const section of sections.filter((s) => !s.includes('data-hero'))) {
    assert.equal((section.match(/<h2\b/g) || []).length, 1);
  }
});

test('section ids exist and are unique', () => {
  for (const id of ['home', 'approach', 'experience', 'work', 'suite', 'contact']) {
    assert.equal(count(new RegExp(`id="${id}"`, 'g')), 1, id);
  }
  const ids = [...home.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length, 'ids are unique');
});

test('project-page anchors resolve', () => {
  const pages = readdirSync(new URL('projects/', root)).filter((f) => f.endsWith('.html'));
  const sources = [...pages.map((p) => read(`projects/${p}`)), read('lab/index.html')];
  const anchors = new Set(sources.flatMap((s) => [...s.matchAll(/href="\.\.\/index\.html#([^"]+)"/g)].map((m) => m[1])));
  assert.ok(anchors.size > 0);
  for (const anchor of anchors) assert.match(home, new RegExp(`id="${anchor}"`), `#${anchor}`);
});

test('résumés, repositories and primary nav are linked', () => {
  for (const pdf of [content.meta.resumePdf, content.meta.onePagePdf]) {
    assert.ok(home.includes(`href="${pdf}" download`), pdf);
  }
  for (const repo of ['dotz', 'sophos', 'industry-ai-suite']) {
    assert.ok(home.includes(`https://github.com/cayleb-james2008/${repo}`), repo);
  }
  assert.match(home, /<nav\b[^>]*aria-label="Primary"/);
});

test('visible text has no racing or source-site terms', () => {
  const stripped = home.replace(/<(script|style)\b[\s\S]*?<\/\1>/g, ' ');
  const text = stripped.replace(/<[^>]+>/g, ' ');
  const attributes = [...stripped.matchAll(/\s(?:alt|aria-label|title)="([^"]*)"/g)].map((m) => m[1]);
  const banned = /\b(kimi|antonelli|mercedes|grido1|grid01|formula ?1|f1|race|racing|driver|paddock|podium|lap|circuit|chequer\w*|checkered|helmet|getlayers)\b/i;
  for (const value of [text, ...attributes]) assert.doesNotMatch(value, banned);
});

test('build is reproducible', () => {
  const build = () => {
    execFileSync('python3', ['scripts/build-home.py'], { cwd: root });
    return read('index.html');
  };
  assert.equal(build(), build());
});

test('served code carries no names from the layout reference', async () => {
  const { readdirSync, statSync } = await import('node:fs');
  const walk = (dir) => readdirSync(dir).flatMap((name) => {
    const path = `${dir}/${name}`;
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
  const root = new URL('../', import.meta.url).pathname;
  const files = walk(`${root}site`).filter((f) => /\.(js|css|json)$/.test(f));
  assert.ok(files.length > 20);
  for (const file of files) {
    assert.doesNotMatch(readFileSync(file, 'utf8'), /kimi|antonelli|mercedes|grid0?1\b|getlayers/i, file);
  }
});
