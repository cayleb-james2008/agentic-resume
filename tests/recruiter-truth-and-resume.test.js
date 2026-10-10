import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import test from 'node:test';
const read=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8');
test('suite examples retain synthetic and unverified scope without production claims',()=>{
 const home=read('index.html');
 assert.doesNotMatch(home,/10 WORKING PATHS|Ten working workflows|ten working local review paths/i);
 assert.match(home,/recorded example/i);
 assert.match(home,/Live model inference is not demonstrated here/);
 assert.match(home,/Workflow simulation\. No coding agents execute, and no files are edited/);
 assert.match(read('projects/industry-ai-suite.html'),/Local examples are synthetic demonstrations; all ten full workflows remain UNVERIFIED/);
 for(const file of ['README.md','PRODUCT.md'])assert.match(read(file),/all ten full workflows remain UNVERIFIED/);
});
test('public PDFs match the exact user-approved release bytes',()=>{
 const manifest=JSON.parse(read('resume/approved-verification.json'));
 for(const [file,record] of Object.entries(manifest.artifacts)){
  const bytes=readFileSync(new URL('../'+file,import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),record.sha256);
 }
});
test('professional résumé embeds the approved reading source without invented employment',()=>{
 const page=read('index.html');
 assert.ok(page.replaceAll(' aether-prism-btn','').includes(read('stage/incumbent-resume-source.html').trim()));
 for(const phrase of ['Portland High School','Dunkin','Robert H. Lord Company','Tommy’s Pizza','David Cooke Plaster'])assert.ok(page.includes(phrase));
});
