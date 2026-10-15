// The Lumora homepage's outline (2026-10-15): one h1 (the headline), a section per part of the pitch, the
// official résumé's three sections, and the contact footer. Images are Cayleb's own product UI only.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (file) => readFileSync(new URL(file, root), 'utf8');
const home = read('index.html');
const content = JSON.parse(read('site/content.json'));
const images = JSON.parse(read('assets/IMAGES.json'));

const count = (pattern) => (home.match(pattern) || []).length;
const decode = (t) => t.replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const sections = () => {
  // Split on "<section": no section sits inside another, so each closes before the next opens.
  const chunks = home.split('<section').slice(1);
  assert.equal(count(/<\/section>/g), chunks.length, 'every section closes');
  return chunks.map((chunk) => {
    const end = chunk.indexOf('</section>');
    assert.ok(end >= 0, 'a section closes before the next opens');
    return `<section${chunk.slice(0, end)}`;
  });
};

test('one h1: the headline, in the hero', () => {
  assert.equal(count(/<h1\b/g), 1);
  const h1 = home.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)[1];
  assert.equal(decode(h1.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim(), content.hero.headline);
  assert.ok(sections()[0].includes('<h1'), 'the h1 lives in the hero');
});

test('the sections run hero, about, Ergon\'s team, work, services, stats, the résumé\'s three, contact; one h2 each after the hero', () => {
  const list = sections();
  assert.deepEqual(list.map((s) => s.match(/^<section\b[^>]*\sid="([^"]+)"/)?.[1]),
    ['home', 'about', 'team', 'built', 'services', 'stats', 'experience', 'work', 'education', 'contact']);
  assert.match(list[0], /^<section class="hero" id="home"/);
  for (const section of list.slice(1)) assert.equal((section.match(/<h2\b/g) || []).length, 1, section.slice(0, 70));
});

test('ids for every section and the résumé exist once, and every id is unique', () => {
  for (const id of ['home', 'about', 'team', 'built', 'services', 'stats', 'resume', 'experience', 'work', 'education', 'contact']) {
    assert.equal(count(new RegExp(`\\sid="${id}"`, 'g')), 1, id);
  }
  const ids = [...home.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length, 'ids are unique');
});

test('one banner and one main; the skip link goes to main', () => {
  assert.equal(count(/<main\b/g), 1);
  assert.match(home, /<main id="main">/);
  const main = home.slice(home.indexOf('<main'), home.indexOf('</main>'));
  assert.ok(main.includes('<section class="hero" id="home"') && main.includes('class="resume-half" id="resume"'),
    'the hero and the résumé sit in main');
  // The résumé half's own <header> is a banner landmark only outside <main>.
  const outside = home.slice(0, home.indexOf('<main')) + home.slice(home.indexOf('</main>'));
  assert.equal((outside.match(/<header\b/g) || []).length, 1, 'the masthead is the only banner');
  assert.match(outside, /<header class="masthead" data-masthead>/);
  assert.match(home, /<a class="skip-link" href="#main">Skip to content<\/a>/);
});

test('images are Cayleb\'s own product UI, each listed with its provenance', () => {
  const tags = [...home.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  assert.ok(tags.length >= 4, 'the hero surface and three screenshots');
  for (const tag of tags) {
    const src = tag.match(/\ssrc="([^"]+)"/)[1];
    assert.match(src, /^assets\/(hero|work)\//, src);
    assert.ok(images[src], `${src} is listed in assets/IMAGES.json`);
    const alt = tag.match(/\salt="([^"]*)"/);
    assert.ok(alt, `${src} has an alt attribute`);
    if (src.startsWith('assets/work/')) assert.ok(alt[1].length > 20, `${src} is described`);
    assert.match(tag, new RegExp(`width="${images[src].width}" height="${images[src].height}"`), `${src} reserves its box`);
  }
  for (const [, src] of home.matchAll(/\ssrcset="([^"]+)"/g)) assert.ok(images[src], `${src} is listed`);
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
  const banned = /\b(kimi|antonelli|mercedes|grido1|grid01|formula ?1|f1|race|racing|driver|paddock|podium|lap|circuit|chequer\w*|checkered|helmet|getlayers|lumora)\b/i;
  for (const value of [text, ...attributes]) assert.doesNotMatch(value, banned);
});

test('no illustration and no pictures of Cayleb on any served page', () => {
  const pages = ['index.html', 'resume.html', '404.html', 'lab/index.html',
    ...readdirSync(new URL('projects/', root)).filter((f) => f.endsWith('.html')).map((f) => `projects/${f}`)];
  for (const page of pages) {
    const html = read(page);
    assert.doesNotMatch(html, /illustration/i, page);
    assert.doesNotMatch(html, /assets\/home\//, page);
  }
});

test('build is reproducible', () => {
  const build = () => {
    execFileSync('python3', ['scripts/build-home.py'], { cwd: root });
    return read('index.html');
  };
  assert.equal(build(), build());
});

test('served code carries no names from either layout reference', () => {
  const walk = (dir) => readdirSync(dir).flatMap((name) => {
    const path = `${dir}/${name}`;
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
  const files = walk(`${new URL('../', import.meta.url).pathname}site`).filter((f) => /\.(js|css|json)$/.test(f));
  assert.ok(files.length > 20);
  for (const file of files) {
    assert.doesNotMatch(readFileSync(file, 'utf8'), /kimi|antonelli|mercedes|grid0?1\b|getlayers|lumora/i, file);
  }
});
