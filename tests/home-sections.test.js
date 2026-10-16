// The homepage's sections and assets (the "Sign-off" look, 2026-10-16): images with provenance, and the markup
// the mounts and the no-JS reading depend on.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const path = (p) => new URL(p, root);

/** Width and height from a baseline or progressive JPEG's frame header. */
function jpegSize(buf) {
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    if (marker === 0xc0 || marker === 0xc2) return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    i += 2 + buf.readUInt16BE(i + 2);
  }
  throw new Error('no frame header');
}

test('every image on the site is listed with its source and hash', () => {
  const images = JSON.parse(readFileSync(path('assets/IMAGES.json'), 'utf8'));
  const files = ['assets/work/'].flatMap((dir) => readdirSync(path(dir)).map((f) => dir + f));
  assert.ok(files.length >= 3, 'three product screenshots');
  assert.equal(existsSync(path('assets/hero')), false, 'the old hero layers are gone');
  for (const file of files) {
    const record = images[file];
    assert.ok(record, `${file} is listed in assets/IMAGES.json`);
    const buf = readFileSync(path(file));
    assert.equal(createHash('sha256').update(buf).digest('hex'), record.sha256, `${file} hash`);
    assert.deepEqual(jpegSize(buf), { width: record.width, height: record.height }, `${file} size`);
    assert.ok(record.source && record.source.length > 10, `${file} says where it came from`);
  }
  for (const file of Object.keys(images)) assert.ok(existsSync(path(file)), `${file} exists`);
  assert.equal(existsSync(path('assets/home')), false, 'the pictures of Cayleb stay gone');
});

// --- The sections' markup -------------------------------------------------------------------------------------
const read = (file) => readFileSync(path(file), 'utf8');
const home = read('index.html');
const content = JSON.parse(read('site/content.json'));
const slice = (open, close = '</section>') => {
  const at = home.indexOf(open);
  assert.ok(at >= 0, open);
  return home.slice(at, home.indexOf(close, at));
};

test('the hero offers two doors: the hiring path and the team path', () => {
  const hero = slice('<section class="hero"');
  const doors = [...hero.matchAll(/<a class="door[^"]*" href="([^"]+)" data-go="([^"]+)"><span>([^<]+)<\/span>/g)];
  assert.deepEqual(doors.map((d) => d[1]), content.hero.doors.map((d) => d.href));
  assert.deepEqual(doors.map((d) => d[1]), ['#resume', '#services']);
  assert.deepEqual(doors.map((d) => d[3].replace(/&#x27;/g, "'")), content.hero.doors.map((d) => d.label));
  for (const [, href, go] of doors) assert.equal(href, `#${go}`);
});

test('the work index: Ergon featured with its honest status, then each project with its own picture or checklist', () => {
  const built = slice('<section class="built"');
  assert.match(built, /<article class="feature" id="work-ergon">/);
  assert.ok(built.includes(`<p class="status">${content.ergon.status}</p>`), 'Ergon carries its status beside its claims');
  const rows = [...built.matchAll(/<li class="row" data-row><article class="row-in" id="work-(\w+)">/g)].map((m) => m[1]);
  assert.deepEqual(rows, content.built.cards.slice(1).map((c) => c.slug));
  assert.equal((built.match(/<figure class="row-shot">/g) || []).length, 3);
  assert.equal((built.match(/<div class="row-shot row-shot--checks">/g) || []).length, 1);
  for (const c of content.built.cards) assert.ok(built.includes(`href="${c.href}"`), `${c.title} links its case study`);
});

test('work with me is a numbered sequence, the offers and one way to start', () => {
  const services = slice('<section class="services"');
  const steps = [...services.matchAll(/<li class="step"><span class="step-n" aria-hidden="true">(\d)<\/span><h3 class="step-h">([^<]+)<\/h3>/g)];
  assert.deepEqual(steps.map((m) => m[2]), content.services.steps.map((st) => st.title));
  assert.deepEqual(steps.map((m) => m[1]), ['1', '2', '3', '4']);
  assert.equal((services.match(/<dt>/g) || []).length, content.services.rows.length);
  assert.equal((services.match(/data-modal/g) || []).length, 1, 'one way to start');
});

test('the team switch is a radio group with one choice checked', () => {
  const group = slice('<div class="seg" role="radiogroup"', '</div>');
  const radios = [...group.matchAll(/<button type="button" role="radio" aria-checked="(true|false)" data-team="(\w+)"/g)];
  assert.deepEqual(radios.map((r) => r[2]), content.ergon.teamOrder);
  assert.equal(radios.filter((r) => r[1] === 'true').length, 1);
});

test('the team graph is a captioned figure with a quiet log and a person button per role', () => {
  const ergon = slice('<section class="ergon"');
  assert.match(ergon, /<figure class="eg-panel"[^>]*data-ergon[^>]*aria-labelledby="eg-caption">/);
  assert.match(ergon, /<figcaption class="sr-only" id="eg-caption">/);
  assert.match(ergon, /<div class="eg-log" role="log" aria-live="off" aria-label="[^"]+">/);
  for (const line of content.ergon.figure.log) assert.ok(ergon.includes(`<p>${line.replace(/'/g, '&#x27;')}</p>`) || ergon.includes(`<p>${line}</p>`), line);
  const people = [...ergon.matchAll(/<button class="eg-person" type="button" aria-label="([^"]+)">/g)];
  assert.equal(people.length, content.ergon.teams.office.people.length);
  assert.ok(people.every((p) => /assistant connected to/.test(p[1])));
  for (const step of content.ergon.ladder) assert.ok(ergon.includes(`<li>${step}</li>`), step);
});

test('the request modal has labelled fields, quiet errors, and never claims a message went out', () => {
  const modal = slice('<div class="modal"', '</body>');
  assert.match(modal, /role="dialog" aria-modal="true" aria-labelledby="md-title" hidden/);
  for (const id of ['f-name', 'f-email', 'f-msg']) {
    assert.match(modal, new RegExp(`<label for="${id}">`), id);
    assert.match(modal, new RegExp(`id="e-${id.slice(2)}" hidden`), `${id} error`);
  }
  const copy = JSON.stringify(content.modal);
  assert.doesNotMatch(copy, /\b(sent|received|delivered)\b/i);
  assert.ok(modal.includes(content.meta.email), 'the address is shown, in case the mail link does nothing');
});

test('the phone menu is a modal sheet, hidden until opened; its button shows only with the script', () => {
  assert.match(home, /<div class="menu-sheet" id="menu" data-menu role="dialog" aria-modal="true" aria-label="Menu" hidden>/);
  assert.match(home, /<button class="menu-btn" id="menu-btn" type="button" aria-haspopup="dialog" aria-controls="menu" aria-expanded="false">/);
  const css = read('site/css/masthead.css').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.match(css, /\.menu-btn\s*\{[^}]*display:\s*none/);
  assert.match(css, /\.js \.menu-btn\s*\{[^}]*display:\s*inline-grid/);
});

test('the résumé half carries its title line', () => {
  assert.match(home, new RegExp(`<p class="resume-half-title">${content.resumeHalf.title}</p>`));
});

test('the record shows its figures as text, in the résumé\'s head', () => {
  const head = slice('<header class="resume-half-head"', '</header>');
  for (const item of content.record.items) assert.ok(head.includes(`<dd>${item.figure}</dd>`), item.figure);
  assert.ok(head.includes(content.record.note.replace(/'/g, '&#x27;')) || head.includes(content.record.note));
});

test('scripts load nothing from another origin, and scroll and pointer listeners never block scrolling', async () => {
  const { readdirSync, statSync } = await import('node:fs');
  const walk = (dir) => readdirSync(dir).flatMap((n) => (statSync(`${dir}/${n}`).isDirectory() ? walk(`${dir}/${n}`) : [`${dir}/${n}`]));
  const files = walk(new URL('../site/js', import.meta.url).pathname).filter((f) => f.endsWith('.js'));
  for (const file of files) {
    const js = readFileSync(file, 'utf8');
    // XML namespaces (the SVG one) are names, not requests.
    assert.doesNotMatch(js.replace(/'http:\/\/www\.w3\.org\/2000\/svg'/g, ''), /https?:\/\//, `${file} fetches nothing remote`);
    for (const m of js.matchAll(/addEventListener\('(pointermove|scroll|touchmove|wheel)'/g)) {
      // Read the whole call, to its closing parenthesis, and check its options.
      let depth = 0, end = m.index + 'addEventListener'.length;
      for (; end < js.length; end++) {
        if (js[end] === '(') depth++;
        else if (js[end] === ')' && --depth === 0) break;
      }
      assert.match(js.slice(m.index, end + 1), /\{\s*passive:\s*true\s*\}\s*\)$/, `${file}: ${m[1]} listener is passive`);
    }
  }
  assert.ok(files.some((f) => f.endsWith('ask/ask.js')) && files.some((f) => f.endsWith('home/ergon.js')));
});
