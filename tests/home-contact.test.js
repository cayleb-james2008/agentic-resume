import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

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

test('the footer has no picture and no backdrop canvas', () => {
  const contact = home.slice(home.indexOf('<section class="contact"'), home.indexOf('</section>', home.indexOf('<section class="contact"')));
  assert.ok(contact.length > 0, 'the contact section exists');
  assert.doesNotMatch(contact, /<img/);
  assert.doesNotMatch(contact, /data-figure-layer/);
  assert.doesNotMatch(contact, /data-contours/);
  assert.doesNotMatch(contact, /<canvas/);
});

test('the copyright is the content line, without an illustration credit', () => {
  assert.equal(content.contact.copyright, '© 2026 Cayleb Alvarez-James.');
  assert.doesNotMatch(content.contact.copyright, /Illustrations/);
  const p = footer.match(/<p class="contact-copyright"[^>]*>([\s\S]*?)<\/p>/);
  assert.ok(p);
  assert.equal(p[1], escape(content.contact.copyright));
});
