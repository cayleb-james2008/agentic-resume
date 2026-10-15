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

test('one h1, in the story, holding the full name for assistive technology', () => {
  assert.equal(count(/<h1\b/g), 1);
  const h1 = home.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)[1];
  assert.match(h1, /<span class="sr-only">Cayleb Alvarez-James<\/span>/);
  const story = sectionBodies().find((s) => /^<section\b[^>]*\sdata-story[\s>]/.test(s));
  assert.ok(story, 'the story section');
  assert.ok(story.includes('<h1'), 'the h1 lives in the story section');
});

test('five sections: the story, the résumé\'s three and contact; all but the story with one h2', () => {
  // Split on "<section": no section sits inside another, so each closes before the next opens.
  const chunks = home.split('<section').slice(1);
  assert.equal(count(/<\/section>/g), chunks.length, 'every section closes');
  const sections = chunks.map((chunk) => {
    const end = chunk.indexOf('</section>');
    assert.ok(end >= 0, 'a section closes before the next opens');
    return `<section${chunk.slice(0, end)}`;
  });
  assert.deepEqual(sections.map((s) => s.match(/^<section\b[^>]*\sid="([^"]+)"/)?.[1]),
    ['home', 'experience', 'work', 'education', 'contact']);
  assert.match(sections[0], /^<section class="story" data-story id="home"/);
  for (const section of sections.slice(1)) assert.equal((section.match(/<h2\b/g) || []).length, 1, section.slice(0, 60));
});

test('ids for the story, the résumé and each section exist and are unique', () => {
  for (const id of ['home', 'resume', 'experience', 'work', 'education', 'contact']) {
    assert.equal(count(new RegExp(`\\sid="${id}"`, 'g')), 1, id);
  }
  const ids = [...home.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length, 'ids are unique');
});

test('one banner and one main: the masthead, then the story and the résumé; the skip link goes to the résumé', () => {
  assert.equal(count(/<main\b/g), 1);
  const main = home.slice(home.indexOf('<main'), home.indexOf('</main>'));
  assert.ok(main.includes('data-story') && main.includes('class="resume-half" id="resume"'), 'the story and the résumé sit in main');
  // The résumé half's own <header> is a banner landmark only outside <main>.
  const outside = home.slice(0, home.indexOf('<main')) + home.slice(home.indexOf('</main>'));
  assert.equal((outside.match(/<header\b/g) || []).length, 1, 'the masthead is the only banner');
  assert.match(outside, /<header class="masthead" data-masthead>/);
  assert.match(home, /<a class="skip-link" href="#resume">Skip to résumé<\/a>/);
});

test('no <img> on the homepage', () => {
  assert.equal(count(/<img\b/g), 0);
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
