import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => readFileSync(path.join(root, file), 'utf8');

test('suite metrics describe review paths, not verified full workflows', () => {
  const home = read('index.html');
  assert.doesNotMatch(home, /10 WORKING PATHS|Ten working workflows|ten working local review paths/i);
  assert.match(home, /10 LOCAL REVIEW PATHS/);
  assert.match(home, /Local examples are synthetic demonstrations; all ten full workflows remain UNVERIFIED/);
  assert.match(read('projects/industry-ai-suite.html'), /Local examples are synthetic demonstrations; all ten full workflows remain UNVERIFIED/);
  for (const file of ['README.md', 'PRODUCT.md']) {
    assert.doesNotMatch(read(file), /working local review paths/);
    assert.match(read(file), /all ten full workflows remain UNVERIFIED/);
  }
});

test('stable public PDF matches independently reviewed document', () => {
  const hash = createHash('sha256').update(readFileSync(path.join(root, 'Cayleb-James-resume.pdf'))).digest('hex');
  assert.equal(hash, '6683e120435fcdccddd64aeda300b2e11a932622514235c418746f72af32913f');
});

test('web resume embeds the exact reviewed source fragment', () => {
  assert.ok(read('resume.html').includes(read('resume/resume-fragment.html').trim()));
  const page = read('resume.html');
  assert.match(page, /Portland High School/);
  assert.match(page, /Dunkin/);
  assert.match(page, /not live provider inference/);
  assert.match(page, /Open draft PR #10/);
});
