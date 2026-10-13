// Sharing and finding the site: every page's description, canonical address and link-preview
// card; the not-found page; the sitemap.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const read = (file) => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const content = JSON.parse(read('site/content.json'));
const SITE = 'https://cayleb-james2008.github.io/agentic-resume/';
const projects = readdirSync(new URL('../projects/', import.meta.url)).filter((f) => f.endsWith('.html')).sort();
const PAGES = { 'index.html': '', 'resume.html': 'resume.html', 'lab/index.html': 'lab/', ...Object.fromEntries(projects.map((p) => [`projects/${p}`, `projects/${p}`])) };
const unescape = (v) => v?.replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const meta = (html, attr, key) => unescape(html.match(new RegExp(`<meta ${attr}="${key}" content="([^"]*)"`))?.[1]);

test('the site address and the share card live in content.json', () => {
  assert.equal(content.meta.siteUrl, SITE);
  assert.equal(content.meta.shareImage, 'assets/og/card.png');
  assert.match(content.meta.shareAlt, /^Illustration:/);
});

test('the share card is a 1200×630 PNG', () => {
  const png = readFileSync(new URL('../assets/og/card.png', import.meta.url));
  assert.equal(png.toString('ascii', 1, 4), 'PNG');
  assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [1200, 630]);
  assert.ok(png.length < 400_000, `${png.length} bytes`);
});

for (const [file, path] of Object.entries(PAGES)) {
  test(`${file}: description, canonical address and link-preview card`, () => {
    const html = read(file);
    const head = html.slice(0, html.indexOf('</head>'));
    const url = SITE + path;
    assert.ok((meta(head, 'name', 'description') || '').length >= 50, 'a real description');
    assert.ok(head.includes(`<link rel="canonical" href="${url}">`), `canonical ${url}`);
    assert.equal(meta(head, 'property', 'og:url'), url);
    assert.equal(meta(head, 'property', 'og:title'), unescape(head.match(/<title>([^<]*)<\/title>/)[1]));
    assert.equal(meta(head, 'property', 'og:description'), meta(head, 'name', 'description'));
    assert.equal(meta(head, 'property', 'og:image'), SITE + content.meta.shareImage);
    assert.equal(meta(head, 'property', 'og:image:width'), '1200');
    assert.equal(meta(head, 'property', 'og:image:height'), '630');
    assert.match(meta(head, 'property', 'og:image:alt'), /^Illustration:/);
    assert.equal(meta(head, 'name', 'twitter:card'), 'summary_large_image');
    assert.match(head, /<link rel="icon" href="[^"]*favicon\.svg"/);
    assert.equal((head.match(/rel="canonical"/g) || []).length, 1, 'one canonical');
  });
}

test('the not-found page wears the site, works at any depth and stays out of search', () => {
  assert.ok(existsSync(new URL('../404.html', import.meta.url)));
  const page = read('404.html');
  assert.ok(page.includes(`<base href="${SITE}">`), 'links resolve from the site root at any depth');
  assert.match(page, /<meta name="robots" content="noindex">/);
  assert.match(page, /<title>Page not found · Cayleb Alvarez-James<\/title>/);
  assert.match(page, /<header class="sub-masthead">/);
  assert.match(page, /<footer class="sub-footer">/);
  assert.match(page, /<h1[^>]*>[^<]*Page not found/);
  assert.match(page, /href="index\.html"/);
  assert.match(page, /href="site\/css\/subpage\.css"/);
});

// A project site's robots.txt is never read (crawlers only ask the domain root), so there is
// none; the sitemap is for submitting to a search console by hand.
test('the sitemap lists every page by its canonical address', () => {
  const sitemap = read('sitemap.xml');
  assert.match(sitemap, /^<\?xml version="1\.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.deepEqual(locs.sort(), Object.values(PAGES).map((p) => SITE + p).sort());
});
