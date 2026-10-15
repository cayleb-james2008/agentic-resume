// What the final whole-branch review (2026-10-15) found at runtime: scrolling inside overlays, focus after
// in-page navigation and after a ticket, the agent's typing in a live region, touch targets, the composer's
// draft, the About statement's contrast on narrow phones, and the layout jump when an overlay locks scroll.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const strip = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const rule = (css, selector) => {
  const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = strip(css).match(new RegExp(`(?:^|[}\\s])${esc}\\s*\\{([^}]*)\\}`));
  assert.ok(m, `no rule for ${selector}`);
  return m[1];
};
const home = read('index.html');

test('the menu, the composer panel and the agent log scroll natively while Lenis holds the page', () => {
  // Lenis cancels wheel and touch while stopped; data-lenis-prevent hands these boxes back to the browser.
  assert.match(home, /<div class="menu dark-ctx" id="menu" data-menu data-lenis-prevent /);
  assert.match(home, /<div class="md-panel" data-lenis-prevent>/);
  assert.match(home, /<div class="guide-log mono" id="guide-log" data-lenis-prevent /);
  assert.match(rule(read('site/css/masthead.css'), '.menu'), /overscroll-behavior:\s*contain/);
  assert.match(rule(read('site/css/overlays.css'), '.md-panel'), /overscroll-behavior:\s*contain/);
  assert.match(rule(read('site/css/guide.css'), '.guide-log'), /overscroll-behavior:\s*contain/);
});

test('in-page navigation lands focus on the section and puts its address in the URL', async () => {
  const { land } = await import('../site/js/home/overlays.js');
  const calls = [];
  const attrs = {};
  const section = {
    hasAttribute: (k) => k in attrs, setAttribute: (k, v) => { attrs[k] = v; },
    focus: (o) => calls.push(['focus', o]),
  };
  const history = { pushState: (s, t, url) => calls.push(['push', url]) };
  land(section, 'built', history);
  assert.equal(attrs.tabindex, '-1', 'a section takes programmatic focus');
  assert.deepEqual(calls, [['focus', { preventScroll: true }], ['push', '#built']]);
  attrs.tabindex = '0';
  land(section, 'built', history);
  assert.equal(attrs.tabindex, '0', 'an element that is already focusable keeps its tab stop');
  assert.match(strip(read('site/css/base.css')), /\[tabindex="-1"\]:focus\s*\{[^}]*outline:\s*none/);
});

test('the test-ticket button never disables itself, so focus stays on it while a ticket runs', () => {
  const ergon = read('site/js/home/ergon.js');
  assert.doesNotMatch(ergon, /button\.disabled\s*=/);
  assert.match(ergon, /button\.setAttribute\('aria-disabled', 'true'\)/);
  assert.match(ergon, /button\.removeAttribute\('aria-disabled'\)/);
  assert.match(strip(read('site/css/base.css')), /\.pill\[aria-disabled="true"\]/);
});

test('the agent\'s typed answer is hidden from the live region, which hears the full answer once', () => {
  const guide = read('site/js/guide/guide.js');
  assert.match(guide, /typed\.setAttribute\('aria-hidden', 'true'\)/);
  assert.match(guide, /said\.className = 'sr-only'/);
  assert.match(guide, /said\.textContent = item\.a/);
  assert.doesNotMatch(guide, /\ba\.textContent = typeStep/);
});

test('every small control has a 44px touch target', () => {
  const targets = [
    ['site/css/contact.css', '.ft-cols ul a'], ['site/css/contact.css', '.copy'],
    ['site/css/resume-half.css', '.resume-link'], ['site/css/base.css', '.pill.sm'],
    ['site/css/guide.css', '.guide-q'], ['site/css/subpage.css', '.sub-masthead nav a'],
    ['site/css/resume.css', '.resume-masthead nav a'],
  ];
  for (const [sheet, selector] of targets) assert.match(rule(read(sheet), selector), /min-height:\s*44px/, `${sheet} ${selector}`);
  const close = rule(read('site/css/guide.css'), '.guide-close');
  assert.match(close, /width:\s*44px/);
  assert.match(close, /height:\s*44px/);
});

test('the composer keeps a draft the visitor dismissed, and a failed copy shows the message to select', () => {
  const js = read('site/js/home/overlays.js');
  assert.match(js, /onClose: \(\) => \{ if \(!done\.hidden\) window\.setTimeout\(reset, 300\); \}/);
  assert.match(home, /<button class="pill light" type="button" data-md-copy data-copied="Copied" data-failed="[^"]+">/);
  assert.match(home, /<textarea class="md-raw" data-md-raw readonly rows="6" aria-label="[^"]+" hidden><\/textarea>/);
  assert.match(js, /copy\.dataset\.failed/);
  assert.match(js, /raw\.select\(\)/);
});

test('the About statement\'s quiet half stays large text at every width (it is 3.3:1 on white)', () => {
  assert.match(rule(read('site/css/about.css'), '.about-h'), /font-size:\s*max\(24px, 1\.5rem\)/);
});

test('locking scroll for an overlay keeps the scrollbar\'s room, so the page never jumps sideways', () => {
  assert.match(strip(read('site/css/base.css')), /html\s*\{[^}]*scrollbar-gutter:\s*stable/);
});
