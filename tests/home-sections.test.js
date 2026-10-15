// The Lumora homepage's sections and assets (2026-10-15): images with provenance, and the markup the
// mounts and the no-JS reading depend on.
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
  const files = ['assets/hero/', 'assets/work/'].flatMap((dir) => readdirSync(path(dir)).map((f) => dir + f));
  assert.ok(files.length >= 7, 'four hero layers and three screenshots');
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

test('the loader is marked for its script and hidden from assistive technology', () => {
  assert.match(home, /<div class="loader" data-loader aria-hidden="true">/);
  assert.match(slice('<div class="loader"', '<a class="skip-link"'), /data-ld-num>000</);
});

test('the hero\'s reveal canvas is decorative and names both blueprint layers', () => {
  const hero = slice('<section class="hero"');
  assert.match(hero, /<canvas aria-hidden="true"><\/canvas>/);
  assert.match(hero, /data-liquid data-wide="assets\/hero\/blueprint-wide\.jpg" data-tall="assets\/hero\/blueprint-tall\.jpg"/);
  assert.match(hero, /<img src="assets\/hero\/surface-wide\.jpg" alt=""/);
});

test('without JS the carousel reads its first item, and every item is in the page', () => {
  const items = [...home.matchAll(/<div class="hc-item( on)?"/g)];
  assert.equal(items.length, content.hero.carousel.length);
  assert.equal(items.filter((m) => m[1]).length, 1);
  assert.equal(items[0][1], ' on');
  for (const c of content.hero.carousel) assert.ok(home.includes(c.title.replace(/'/g, "'")), c.title);
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
  assert.match(ergon, /<div class="eg-log mono" role="log" aria-live="off" aria-label="[^"]+">/);
  const people = [...ergon.matchAll(/<button class="eg-person" type="button" aria-label="([^"]+)">/g)];
  assert.equal(people.length, content.ergon.teams.office.people.length);
  assert.ok(people.every((p) => /assistant connected to/.test(p[1])));
  for (const step of content.ergon.ladder) assert.ok(ergon.includes(`<li>${step}</li>`), step);
});

test('the request modal has labelled fields, quiet errors, and never claims a message went out', () => {
  const modal = slice('<div class="modal"', '<aside class="guide"');
  assert.match(modal, /role="dialog" aria-modal="true" aria-labelledby="md-title" hidden/);
  for (const id of ['f-name', 'f-email', 'f-msg']) {
    assert.match(modal, new RegExp(`<label for="${id}">`), id);
    assert.match(modal, new RegExp(`id="e-${id.slice(2)}" hidden`), `${id} error`);
  }
  const copy = JSON.stringify(content.modal);
  assert.doesNotMatch(copy, /\b(sent|received|delivered)\b/i);
  assert.ok(modal.includes(content.meta.email), 'the address is shown, in case the mail link does nothing');
});

test('the menu is a modal dialog, hidden until opened', () => {
  assert.match(home, /<div class="menu dark-ctx" id="menu" data-menu role="dialog" aria-modal="true" aria-label="Menu" hidden>/);
  assert.match(home, /<button class="menu-btn chipbox" id="menu-btn" type="button" aria-haspopup="dialog" aria-controls="menu" aria-expanded="false">/);
});

test('the band reads as one line, not a section', () => {
  assert.match(home, /<div class="band"><ul class="shell band-in" aria-label="AI built around you">/);
});

test('the résumé half carries its title line', () => {
  assert.match(home, new RegExp(`<p class="resume-half-title">${content.resumeHalf.title}</p>`));
});

test('the stats show their final figures without JS', () => {
  const stats = slice('<section class="stats"');
  for (const item of content.stats.items) {
    const { figure } = item;
    const digits = figure.match(/[\d,]+/)[0];
    assert.ok(stats.includes(`data-count="${figure}">${digits}<`), figure);
  }
});

test('the loader shows only on a scripted page, never after the failsafe', () => {
  const css = read('site/css/hero.css').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.match(css, /(^|\})\s*\.loader\s*\{\s*display:\s*none;?\s*\}/);
  assert.match(css, /\.js:not\(\.reveal-failsafe\) \.loader\s*\{[^}]*display:\s*flex/);
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
  assert.ok(files.some((f) => f.endsWith('home/liquid.js')) && files.some((f) => f.endsWith('home/ergon.js')));
});
