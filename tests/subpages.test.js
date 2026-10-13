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
