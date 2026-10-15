import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const content = JSON.parse(read('site/content.json'));
const home = read('index.html');
const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const footer = home.slice(home.indexOf('<footer'), home.indexOf('</footer>'));

test('the footer nav lists the site\'s sections in content order', () => {
  const nav = footer.match(/<nav class="contact-nav" aria-label="Footer">([\s\S]*?)<\/nav>/);
  assert.ok(nav, 'footer nav with aria-label="Footer"');
  const hrefs = [...nav[1].matchAll(/<a href="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(hrefs, content.contact.nav.map((n) => escape(n.href)));
  assert.equal(hrefs.length, 4);
});

test('the footer shows the email as text with a copy button, since mail links may do nothing', () => {
  const email = content.meta.email;
  assert.ok(footer.includes(`<span class="ft-email">${email}</span>`), 'the address is readable text');
  assert.match(footer, new RegExp(`<button class="copy" type="button" data-copy="${email.replace(/[.]/g, '\\.')}"`));
});

test('the footer has no picture and no backdrop canvas', () => {
  const contact = home.slice(home.indexOf('<section class="contact"'), home.indexOf('</section>', home.indexOf('<section class="contact"')));
  assert.ok(contact.length > 0, 'the contact section exists');
  assert.doesNotMatch(contact, /<img/);
  assert.doesNotMatch(contact, /data-figure-layer/);
  assert.doesNotMatch(contact, /data-contours/);
  assert.doesNotMatch(contact, /<canvas/);
  assert.equal(content.contact.figure, undefined, 'content has no figure for it');
});

test('the copyright is the content line, without an illustration credit', () => {
  assert.equal(content.contact.copyright, '© 2026 Cayleb Alvarez-James.');
  assert.doesNotMatch(content.contact.copyright, /Illustrations/);
  const p = footer.match(/<p class="contact-copyright"[^>]*>([\s\S]*?)<\/p>/);
  assert.ok(p);
  assert.equal(p[1], escape(content.contact.copyright));
});

test('a jump to #contact lands the whole footer under the fixed masthead', () => {
  const css = read('site/css/contact.css').replace(/\/\*[\s\S]*?\*\//g, '');
  const contact = css.match(/(?:^|\})\s*\.contact\s*\{([^}]*)\}/)[1];
  // It stops under the masthead, not behind it: the page's one scroll padding (ruling R31), with no margin of
  // its own for Lenis or the browser to add to it...
  const masthead = read('site/css/masthead.css').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.match(masthead, /(?:^|\})\s*html\s*\{[^}]*scroll-padding-top:\s*calc\(var\(--masthead-h\) \+ 1rem\)/);
  assert.doesNotMatch(css, /scroll-margin|scroll-padding/);
  // ...and where it fills the screen, it fills only what that padding leaves, so its foot row is not pushed off.
  assert.match(contact, /min-height:\s*var\(--foot-h,\s*calc\(100lvh - var\(--masthead-h\) - 1rem\)\)/);
});
