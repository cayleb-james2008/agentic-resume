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
  assert.match(js, /onClose: \(\) => \{ if \(!done\.hidden\) (?:resetTimer = )?window\.setTimeout\(reset, 300\); \}/);
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

test('at the very end of the page the footer\'s last line clears the floating Ask my agent pill', () => {
  // The pill sits 1rem from the bottom and is 3rem tall; the page can't scroll past the footer, so it leaves room.
  assert.match(rule(read('site/css/contact.css'), '.ft-legal'), /padding-bottom:\s*calc\(5rem \+ env\(safe-area-inset-bottom, 0px\)\)/);
});

// Codex review, 2026-10-15: the rem grid drops the root to 13px at 1024px (an iPad in landscape) and to
// about 14px on a 320px phone, so a control sized only in rem falls under the 44px floor there.
test('controls sized in rem keep a 44px floor at the smallest root size', () => {
  const floors = [
    ['site/css/base.css', '.pill', /min-height:\s*44px/],
    ['site/css/masthead.css', '.nav a', /min-height:\s*44px/],
    ['site/css/about.css', '.soc a', /width:\s*max\(44px, 2\.75rem\)[^}]*height:\s*max\(44px, 2\.75rem\)/],
    ['site/css/ergon.css', '.seg button', /min-height:\s*max\(44px, 2\.75rem\)/],
    ['site/css/overlays.css', '.md-x', /width:\s*max\(44px, 2\.5rem\)[^}]*height:\s*max\(44px, 2\.5rem\)/],
    ['site/css/guide.css', '.guide-agent', /height:\s*max\(44px, 3rem\)/],
    ['site/css/subpage.css', '.sub-resume', /min-height:\s*44px/],
    ['site/css/resume.css', '.resume-download', /min-height:\s*44px/],
    ['site/css/resume.css', '.resume-actions .button', /min-height:\s*44px/],
    ['lab/lab.css', '.button', /min-height:\s*max\(44px, 2\.875rem\)/],
  ];
  for (const [sheet, selector, re] of floors) assert.match(rule(read(sheet), selector), re, `${sheet} ${selector}`);
  // Standalone links (not words inside a sentence) get the same floor.
  assert.match(strip(read('site/css/resume.css')), /\.resume-contact a, \.resume-actions \.quiet\s*\{[^}]*min-height:\s*44px/);
  assert.match(strip(read('site/css/subpage.css')), /\.project-aside p > a:only-child, \.source-links a\s*\{[^}]*min-height:\s*44px/);
  assert.match(strip(read('lab/lab.css')), /\.source-links a\s*\{[^}]*min-height:\s*44px/);
  assert.match(rule(read('site/css/subpage.css'), '.sub-footer a'), /min-height:\s*44px/);
  assert.match(rule(read('site/css/resume.css'), '.resume-footer a'), /min-height:\s*44px/);
  assert.match(rule(read('site/css/resume.css'), '.resume-selected h3 > a'), /min-height:\s*44px/);
});

// The rest of the Codex review (2026-10-15).
const body = (src, start) => { const i = src.indexOf(start); assert.ok(i >= 0, start); return src.slice(i, src.indexOf('\n  }\n', i)); };

test('a routine reads its person after the wire animation, so a team switch mid-flight logs the new team', () => {
  const routine = body(read('site/js/home/ergon.js'), 'async function routine(');
  assert.ok(routine.indexOf('data.teams[team].people[i]') > routine.indexOf('await packet('), routine);
});

test('Ask my agent keeps its own open state and cancels a pending hide when reopened quickly', () => {
  const guide = read('site/js/guide/guide.js');
  assert.match(guide, /agent\.addEventListener\('click', \(\) => toggle\(!open\)\)/);
  assert.match(guide, /window\.clearTimeout\(hideTimer\)/);
  assert.doesNotMatch(guide, /toggle\(panel\.hidden\)/);
});

test('on a short landscape phone the whole agent panel fits the screen and scrolls', () => {
  assert.match(home, /<div class="guide-panel" id="guide-panel" data-lenis-prevent role="dialog"/);
  const panel = rule(read('site/css/guide.css'), '.guide-panel');
  assert.match(panel, /max-height:\s*calc\(100svh - 5\.5rem - env\(safe-area-inset-bottom, 0px\)\)/);
  assert.match(panel, /overflow-y:\s*auto/);
  assert.match(panel, /overscroll-behavior:\s*contain/);
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

test('without JS every carousel item is readable by everyone; the script hides the inactive ones', () => {
  const items = [...home.matchAll(/<div class="hc-item[^"]*"[^>]*>/g)].map((m) => m[0]);
  assert.ok(items.length === 4, items.join());
  for (const tag of items) assert.doesNotMatch(tag, /aria-hidden/);
  assert.match(read('site/js/home/carousel.js'), /items\.forEach\(\(it, k\) => \{ if \(k\) it\.setAttribute\('aria-hidden', 'true'\); \}\)/);
});

test('Ergon autoplays only while at least a quarter of the figure is on screen', () => {
  assert.match(read('site/js/home/ergon.js'), /visible = e\.intersectionRatio >= 0\.25/);
});

test('Lenis leaves link clicks alone: our handler scrolls plain clicks, the browser keeps Ctrl/Cmd-click and the skip link', () => {
  const main = read('site/js/main.js');
  assert.match(main, /new Lenis\(\{ smoothWheel: true \}\)/);
  assert.doesNotMatch(main, /anchors:\s*true/);
});
