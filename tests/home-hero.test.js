import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ENTRANCE, VEIL, formatAssetError, liftByDeadline } from '../site/js/hero/hero.js';

const read = (file) => readFileSync(new URL('../' + file, import.meta.url), 'utf8');
const home = read('index.html');
const content = JSON.parse(read('site/content.json'));

test('asset error banner names the url', () => {
  assert.equal(
    formatAssetError('assets/home/hero/person-depth.webp'),
    "Couldn't load assets/home/hero/person-depth.webp",
  );
  assert.equal((home.match(/class="asset-banner"/g) || []).length, 1);
  assert.match(home, /<div class="asset-banner" role="alert" hidden><\/div>/);
});

test('veil timings', () => {
  assert.deepEqual(VEIL, { CREEP: 0.7, CLEAR_MS: 430, PAUSE_MS: 240, LIFT_TIMEOUT_MS: 3000, GONE_AT: 0.004, MAX_WAIT_MS: 8000 });
  assert.deepEqual(ENTRANCE, { nav: 0, identity: 180, panels: 900, actions: 1500 });
});

test('hero markup', () => {
  const veil = home.match(/<div class="veil"[^>]*>/)[0];
  assert.match(veil, /role="status"/);
  assert.ok(veil.includes(`aria-label="${content.loading.label.replace("'", '&#x27;')}"`));
  assert.match(home, /<div class="hero-scene" data-hero-scene aria-hidden="true">/);
});

test('the veil only shows on a scripted page and never after the failsafe', () => {
  const css = read('site/css/hero.css');
  assert.match(css, /\.veil\s*\{[^}]*display:\s*none/);
  assert.match(css, /\.js:not\(\.reveal-failsafe\) \.veil\s*\{[^}]*display:\s*flex/);
});

test('a scene that never becomes ready still lifts the veil by the deadline', () => {
  let scheduled = null;
  let readied = 0;
  const timer = (fn, ms) => { scheduled = { fn, ms }; return 1; };
  liftByDeadline({ ready: () => { readied += 1; } }, VEIL.MAX_WAIT_MS, timer);
  assert.equal(scheduled.ms, 8000);
  assert.equal(readied, 0);
  scheduled.fn();
  assert.equal(readied, 1);
});
