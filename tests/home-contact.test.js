import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PARALLAX_FIGURE, px } from '../site/js/contact/geometry.js';
import { FIGURE_WINDOW } from '../site/js/contact/contact.js';

const read = (file) => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const content = JSON.parse(read('site/content.json'));
const home = read('index.html');
const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const footer = home.slice(home.indexOf('<footer'), home.indexOf('</footer>'));

test('the footer nav lists five links in content order', () => {
  const nav = footer.match(/<nav class="contact-nav" aria-label="Footer">([\s\S]*?)<\/nav>/);
  assert.ok(nav, 'footer nav with aria-label="Footer"');
  const hrefs = [...nav[1].matchAll(/<a href="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(hrefs, content.contact.nav.map((n) => escape(n.href)));
  assert.equal(hrefs.length, 5);
});

test('the copyright is the content line', () => {
  const p = footer.match(/<p class="contact-copyright"[^>]*>([\s\S]*?)<\/p>/);
  assert.ok(p);
  assert.equal(p[1], escape(content.contact.copyright));
});

test('the figure is labelled as an illustration', () => {
  const img = footer.match(/<img class="contact-figure"[^>]*alt="([^"]*)"/);
  assert.ok(img);
  assert.match(img[1], /^Illustration:/);
});

test('the figure rides back into place by the end of the page', () => {
  assert.deepEqual(FIGURE_WINDOW, { start: 'top bottom', end: 'bottom bottom', from: px(PARALLAX_FIGURE), to: '0cqw' });
  assert.equal(FIGURE_WINDOW.from, '4.1667cqw');
});

test('the hollow button keeps a dark ground so its label reads over the figure', () => {
  const css = readFileSync(new URL('../site/css/contact.css', import.meta.url), 'utf8');
  const rule = css.match(/\.cta-frame--hollow \.cta-body\s*\{([^}]*)\}/);
  assert.ok(rule);
  assert.doesNotMatch(rule[1], /fill:\s*none/);
  assert.match(rule[1], /fill:\s*rgb\(9 10 11 \/ 0\.\d+\)/);
});
