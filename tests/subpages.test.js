import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const read = (file) => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const content = JSON.parse(read('site/content.json'));
const projectPages = readdirSync(new URL('../projects/', import.meta.url)).filter((f) => f.endsWith('.html'));
const escape = (s) => s.replace(/&/g, '&amp;');

test('the suite workflows and five featured projects have case pages', () => {
  assert.equal(projectPages.length, 15);
  for (const name of ['industry-ai-suite.html', 'dotz.html', 'sophos.html', 'ergon.html', 'asmodeus.html', 'ledgerbridge.html']) assert.ok(projectPages.includes(name), name);
});

test('every project page wears the new look and nothing from the old one', () => {
  for (const name of projectPages) {
    const page = read(`projects/${name}`);
    for (const css of ['tokens', 'base', 'subpage']) assert.ok(page.includes(`href="../site/css/${css}.css"`), `${name} ${css}.css`);
    assert.doesNotMatch(page, /href="\.\.\/css\/|src="\.\.\/js\//, `${name} still loads the old styles or scripts`);
    assert.match(page, /<header class="sub-masthead">/, name);
    assert.match(page, /<a class="sub-wordmark" href="\.\.\/index\.html"/, name);
    assert.match(page, /<footer class="sub-footer">/, name);
    assert.ok(page.includes(escape(content.contact.copyright)), `${name} footer credit`);
  }
});

test('project-page navigation points at the new homepage', () => {
  const page = read('projects/industry-ai-suite.html');
  const nav = page.match(/<nav aria-label="Primary"><ul>([\s\S]*?)<\/ul><\/nav>/)[1];
  const hrefs = [...nav.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(hrefs, content.nav.map((n) => (n.href.startsWith('#') ? `../index.html${n.href}` : `../${n.href}`)));
});

test('project pages offer the current résumé, never the retired one', () => {
  for (const name of projectPages) {
    const page = read(`projects/${name}`);
    assert.doesNotMatch(page, /Cayleb-James-resume\.pdf|Cayleb-James-one-page-resume\.pdf/, name);
  }
  assert.match(read('projects/industry-ai-suite.html'), /href="\.\.\/Cayleb-James-polished-resume\.pdf" download/);
});

test('project pages keep the site\'s claim rules', () => {
  for (const name of projectPages) {
    const text = read(`projects/${name}`).replace(/<[^>]+>/g, ' ');
    assert.doesNotMatch(text, /hedge fund|working workflows|10 working/i, name);
    if(name==='ergon.html')assert.match(text,/live checks|require live checks/);
  }
});

test('the lab wears the new look and keeps every element its script drives', () => {
  const lab = read('lab/index.html');
  assert.ok(lab.includes('href="../site/css/tokens.css"'));
  assert.ok(lab.includes('href="lab.css'));
  assert.doesNotMatch(lab, /href="styles\.css|href="dark\.css/);
  assert.match(lab, /<a class="sub-wordmark" href="\.\.\/index\.html"/);
  const ids = new Set([...read('lab/app.js').matchAll(/\$\("([a-z-]+)"\)/g)].map((m) => m[1]));
  const built = new Set(['input-authorized', 'input-csv', 'input-cutoff', 'input-document', 'input-mode', 'input-owner',
    'input-repo', 'input-route', 'input-threshold', 'enterprise-json']); // made by app.js per workflow
  for (const id of ids) if (!built.has(id)) assert.match(lab, new RegExp(`id="${id}"`), id);
});

test('the lab\'s status strip sits in a landmark and the lab ends with the shared footer', () => {
  const lab = read('lab/index.html');
  assert.match(lab, /<aside class="lab-strip" aria-label="Lab status">/);
  assert.doesNotMatch(lab, /<div class="lab-strip">/);
  assert.match(lab, /<footer class="sub-footer">[\s\S]*<\/footer>\s*<\/body>/);
  assert.ok(lab.includes(escape(content.contact.copyright)));
});

test('on a phone the sub-page nav keeps to one row', () => {
  const css = read('site/css/subpage.css').replace(/\/\*[\s\S]*?\*\//g, '');
  const phone = css.slice(css.indexOf('@media (max-width: 639px)'));
  assert.match(phone, /\.sub-masthead nav ul\s*\{[^}]*flex-wrap:\s*nowrap/);
});

test('the five main project pages style their right-hand evidence rail via .project-aside', () => {
  const css = read('site/css/subpage.css').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.match(css, /\.project-aside\s*\{[^}]*border-top:/);
  assert.match(css, /\.project-rail h2,\s*\.project-aside h2/);
  for (const name of ['ergon.html', 'industry-ai-suite.html', 'dotz.html', 'sophos.html', 'asmodeus.html']) {
    assert.match(read(`projects/${name}`), /<aside class="project-aside"><h2>Evidence<\/h2>/, name);
  }
});

// Plain words (2026-10-13): the five main project pages read without developer jargon; the ten
// workflow pages open with a plain line. Evidence (dates, IDs, file fingerprints) stays.
const JARGON = /\b(loopback|daemon|Clippy|provenance|deterministic|leases?|manifest|IPC|catalogs?|runtime|binaries|refutation|cursors|PR #\d+|CI)\b/i;
const mainText = (name) => read(`projects/${name}`).match(/<main id="main">([\s\S]*?)<\/main>/)[1].replace(/<[^>]+>/g, ' ');
test('the five main project pages are in plain words', () => {
  for (const name of ['ergon.html', 'industry-ai-suite.html', 'dotz.html', 'sophos.html', 'asmodeus.html']) {
    const hit = mainText(name).match(JARGON);
    assert.equal(hit, null, `${name}: "${hit?.[0]}"`);
  }
});
test('every project page opens with a plain line', () => {
  for (const name of projectPages) {
    const out = read(`projects/${name}`).match(/<p class="case-hero__out">([\s\S]*?)<\/p>/)[1];
    assert.doesNotMatch(out, /\b(EVM|OPM|deterministic|bounded|slice|metadata|chronology)\b/i, `${name}: ${out}`);
    assert.doesNotMatch(mainText(name), /\bDeterministic\b/, `${name} says "deterministic"`);
  }
});

test('subpages and the résumé page carry the wordmark, its full stop in signature blue, and a way back to Ask', () => {
  const mark = 'Cayleb<span class="wm-dot">.</span>AJ</a>';
  for (const page of ['projects/ergon.html', 'projects/industry-ai-suite.html', 'lab/index.html']) {
    const html = readFileSync(new URL(`../${page}`, import.meta.url), 'utf8');
    assert.ok(html.includes(`<a class="sub-wordmark" href="../index.html" aria-label="Cayleb Alvarez-James, home">${mark}`), page);
    assert.match(html, /<a class="sub-ask" href="\.\.\/index\.html#ask">/, page);
    assert.doesNotMatch(html, /class="mk\b|&gt;_/, `${page} still carries the old >_ tile`);
  }
  const resume = readFileSync(new URL('../resume.html', import.meta.url), 'utf8');
  assert.ok(resume.includes(`<a class="resume-wordmark" href="./" aria-label="Cayleb Alvarez-James, home">${mark}`));
  assert.match(read('site/css/base.css'), /\.wm-dot\s*\{[^}]*color:\s*var\(--accent\)/);
});

test('the pages one level down speak the homepage\'s look: sentence case and pill buttons, no chamfered slabs', () => {
  for (const sheet of ['site/css/subpage.css', 'site/css/resume.css', 'lab/lab.css']) {
    const css = read(sheet).replace(/\/\*[\s\S]*?\*\//g, '');
    assert.doesNotMatch(css, /text-transform:\s*uppercase/, `${sheet} sets type in capitals`);
    assert.doesNotMatch(css, /clip-path:\s*polygon/, `${sheet} still cuts a chamfer`);
    assert.doesNotMatch(css, /var\(--font-mono\)|JetBrains|Onest/, `${sheet} names a retired face`);
  }
  assert.match(read('site/css/base.css'), /\.btn\s*\{[^}]*border-radius:\s*var\(--radius-pill\)/);
  assert.match(read('site/css/resume.css'), /\.resume-actions \.button\s*\{[^}]*border-radius:\s*var\(--radius-pill\)/);
});

test('on a phone the project page\'s one column shrinks to the screen, and long records wrap inside it', () => {
  const css = read('site/css/subpage.css').replace(/\/\*[\s\S]*?\*\//g, '');
  // A bare 1fr track is never narrower than its longest unbroken string (a file fingerprint, a URL).
  assert.match(css, /@media \(max-width: 899px\)\s*\{\s*\.project-layout\s*\{\s*grid-template-columns:\s*minmax\(0, 1fr\);/);
  assert.match(css, /\.project-content p, \.project-rail p, \.project-aside p[^{]*\{[^}]*overflow-wrap:\s*anywhere/);
});

test('the lab\'s .shell grid runs edge to edge, not inside the homepage\'s .shell container', () => {
  const base = read('site/css/base.css').replace(/\/\*[\s\S]*?\*\//g, '');
  const lab = read('lab/lab.css').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.match(base, /\.shell\s*\{[^}]*max-width/, 'the homepage container this guards against');
  const rule = lab.match(/\.shell\s*\{([^}]*)\}/)[1];
  assert.match(rule, /max-width:\s*none/);
  assert.match(rule, /margin:\s*0/);
  assert.match(rule, /padding:\s*0/);
});

test('the lab\'s wordmark reads in the lab\'s text colour, not its link cyan', () => {
  const lab = read('lab/lab.css').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.match(lab, /\.sub-wordmark\s*\{[^}]*color:\s*var\(--lab-text\)/);
});

test('project write-ups keep a reading measure, and the lab sets no wide tracking on its notes', () => {
  const css = read('site/css/subpage.css').replace(/\/\*[\s\S]*?\*\//g, '');
  const measure = css.match(/\.project-content p, \.project-content ul\s*\{[^}]*max-width:\s*(\d+)ch/);
  assert.ok(measure && Number(measure[1]) <= 68, 'paragraphs under about 80 characters a line');
  const lab = read('lab/lab.css').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(lab.match(/\.rail__foot\s*\{([^}]*)\}/)[1], /letter-spacing:\s*0\.0[1-9]/);
});
