// Access at runtime, carried over from the 2026-10-15 reviews to the "Sign-off" look (2026-10-16): scrolling inside
// overlays, focus after in-page navigation and after a ticket, the Ask bar's typing in a live region, touch
// targets, the composer's draft, and the layout jump when an overlay locks scroll.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (file) => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const strip = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
/** The declarations of every rule whose selector list names `selector`. */
const rule = (css, selector) => {
  const found = [...strip(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter((m) => m[1].split(',').map((x) => x.trim()).includes(selector));
  assert.ok(found.length, `no rule for ${selector}`);
  return found.map((m) => m[2]).join(';');
};
const home = read('index.html');

test('the menu sheet, the composer panel and the list of questions scroll inside themselves, not the page', () => {
  assert.match(rule(read('site/css/masthead.css'), '.menu-sheet'), /overscroll-behavior:\s*contain/);
  assert.match(rule(read('site/css/overlays.css'), '.md-panel'), /overscroll-behavior:\s*contain/);
  assert.match(rule(read('site/css/ask.css'), '.ask-list'), /overscroll-behavior:\s*contain/);
  assert.doesNotMatch(home, /data-lenis-prevent/);
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
  assert.match(strip(read('site/css/base.css')), /\.btn\[aria-disabled="true"\]/);
});

test('the Ask bar\'s streamed answer is hidden from the live region, which hears the full answer once', () => {
  const ask = read('site/js/ask/ask.js');
  assert.match(ask, /typed\.setAttribute\('aria-hidden', 'true'\)/);
  assert.match(ask, /said\.textContent = text/);
  assert.match(ask, /announce\(`\$\{item\.q\} \$\{item\.a\}`\)/);
  assert.doesNotMatch(ask, /said\.textContent = typeStep/);
  // The live region is in the page before anything is asked, outside the answer box that starts hidden.
  assert.match(home, /<\/div><p class="sr-only" aria-live="polite" data-ask-said><\/p><details class="ask-all"/);
});

test('every small control has a 44px touch target', () => {
  const targets = [
    ['site/css/base.css', '.btn'], ['site/css/base.css', '.skip-link'],
    ['site/css/masthead.css', '.nav a'], ['site/css/masthead.css', '.nav-ask'], ['site/css/masthead.css', '.ms-close'],
    ['site/css/hero.css', '.door'],
    ['site/css/ask.css', '.ask-chip'], ['site/css/ask.css', '.ask-sources a'],
    ['site/css/built.css', '.row-code'],
    ['site/css/ergon.css', '.seg button'],
    ['site/css/contact.css', '.copy'], ['site/css/contact.css', '.contact-nav a'],
    ['site/css/resume-half.css', '.resume-link'], ['site/css/resume-half.css', '.resume-half-download'],
    ['site/css/subpage.css', '.sub-masthead nav a'], ['site/css/subpage.css', '.sub-ask'], ['site/css/subpage.css', '.sub-footer a'],
    ['site/css/resume.css', '.resume-masthead nav a'], ['site/css/resume.css', '.resume-download'],
    ['site/css/resume.css', '.resume-actions .button'], ['site/css/resume.css', '.resume-footer a'],
    ['lab/lab.css', '.source-links a'],
  ];
  for (const [sheet, selector] of targets) assert.match(rule(read(sheet), selector), /min-height:\s*(?:44px|52px|60px|max\(44px)/, `${sheet} ${selector}`);
  for (const [sheet, selector] of [['site/css/masthead.css', '.menu-btn'], ['site/css/overlays.css', '.md-x']]) {
    const r = rule(read(sheet), selector);
    assert.match(r, /width:\s*44px/, `${sheet} ${selector}`);
    assert.match(r, /height:\s*44px/, `${sheet} ${selector}`);
  }
  // The field's own height, and summary rows in the list of questions.
  assert.match(rule(read('site/css/ask.css'), '.ask-input'), /height:\s*44px/);
  assert.match(strip(read('site/css/ask.css')), /\.ask-all > summary, \.ask-item > summary\s*\{[^}]*min-height:\s*44px/);
  assert.match(rule(read('lab/lab.css'), '.button'), /min-height:\s*max\(44px, 2\.875rem\)/);
  assert.match(strip(read('site/css/resume.css')), /\.resume-contact a, \.resume-actions \.quiet\s*\{[^}]*min-height:\s*44px/);
  assert.match(strip(read('site/css/subpage.css')), /\.project-aside p > a:only-child, \.source-links a\s*\{[^}]*min-height:\s*44px/);
  assert.match(rule(read('site/css/resume.css'), '.resume-selected h3 > a'), /min-height:\s*44px/);
});

test('the composer keeps a draft the visitor dismissed, and a failed copy shows the message to select', () => {
  const js = read('site/js/home/overlays.js');
  assert.match(js, /onClose: \(\) => \{ if \(!done\.hidden\) (?:resetTimer = )?window\.setTimeout\(reset, 300\); \}/);
  assert.match(home, /<button class="btn btn--ghost" type="button" data-md-copy data-copied="Copied" data-failed="[^"]+">/);
  assert.match(home, /<textarea class="md-raw" data-md-raw readonly rows="6" aria-label="[^"]+" hidden><\/textarea>/);
  assert.match(js, /copy\.dataset\.failed/);
  assert.match(js, /raw\.select\(\)/);
});

test('locking scroll for an overlay keeps the scrollbar\'s room, so the page never jumps sideways', () => {
  assert.match(strip(read('site/css/base.css')), /html\s*\{[^}]*scrollbar-gutter:\s*stable/);
});

// The rest of the Codex review (2026-10-15).
const body = (src, start) => { const i = src.indexOf(start); assert.ok(i >= 0, start); return src.slice(i, src.indexOf('\n  }\n', i)); };

test('a routine reads its person after the wire animation, so a team switch mid-flight logs the new team', () => {
  const routine = body(read('site/js/home/ergon.js'), 'async function routine(');
  assert.ok(routine.indexOf('data.teams[team].people[i]') > routine.indexOf('await packet('), routine);
});

test('the Ask bar\'s shortcut never steals a key from a field or an open dialog, and a new question cancels the old stream quietly', () => {
  const ask = read('site/js/ask/ask.js');
  assert.match(ask, /if \(e\.key !== '\/' \|\| e\.ctrlKey \|\| e\.metaKey \|\| e\.altKey \|\| e\.defaultPrevented\) return;/);
  assert.match(ask, /e\.target\.closest\?\.\(EDITABLE\)/);
  assert.match(ask, /\[role="dialog"\]\[aria-modal="true"\]:not\(\[hidden\]\)/);
  assert.match(body(ask, '  function stream('), /streaming\?\.cancel\(\)/);
  // Its sources sit in place from the start and are out of reach until the text is whole.
  assert.match(ask, /after\.inert = true/);
});

test('reopening the composer right after a written email starts on a clean form, not the old done view', () => {
  const js = read('site/js/home/overlays.js');
  assert.match(js, /resetTimer = window\.setTimeout\(reset, 300\)/);
  const open = body(js, '    open(t = \'\') {');
  assert.match(open, /window\.clearTimeout\(resetTimer\)/);
  assert.match(open, /reset\(\)/);
});

test('a generic open of the composer puts back the generic prompt', () => {
  const open = body(read('site/js/home/overlays.js'), '    open(t = \'\') {');
  assert.match(open, /fields\.msg\.placeholder = t \? [^;]+ : d\.defaultPh;/);
});

// Codex, second pass (2026-10-15).
test('Back and Forward after in-page jumps scroll to the section in the URL', () => {
  const js = read('site/js/home/overlays.js');
  assert.match(js, /window\.addEventListener\('popstate', /);
  assert.match(body(js, "window.addEventListener('popstate', "), /location\.hash/);
});

test('the composer is named by whichever heading it shows', () => {
  assert.match(home, /<h2 tabindex="-1" id="md-done-title" data-md-done-title>/);
  const js = read('site/js/home/overlays.js');
  assert.match(js, /root\.setAttribute\('aria-labelledby', 'md-done-title'\)/);
  assert.match(body(js, '  const reset = () => {'), /root\.setAttribute\('aria-labelledby', 'md-title'\)/);
});

test('Ergon autoplays only while at least a quarter of the figure is on screen', () => {
  assert.match(read('site/js/home/ergon.js'), /visible = e\.intersectionRatio >= 0\.25/);
});

// Codex, third pass (2026-10-15).
test('every control that opens the composer still goes somewhere without JS', () => {
  assert.doesNotMatch(home, /<button[^>]*\sdata-modal[\s>=]/, 'a <button data-modal> does nothing without the script');
  const opens = [...home.matchAll(/<a [^>]*\sdata-modal[\s>=][^>]*>/g)].map((m) => m[0]);
  assert.ok(opens.length >= 2, 'work with me and the footer');
  for (const tag of opens) assert.match(tag, /href="(?:#contact|mailto:caylebalvarezjames@gmail\.com)"/, tag);
});

test('the 404 page sends Work to the Work section, not the résumé\'s projects list', () => {
  const page = read('404.html');
  assert.match(page, /<li><a href="index\.html#built">Work<\/a><\/li>/);
  assert.doesNotMatch(page, /index\.html#work"/);
});
