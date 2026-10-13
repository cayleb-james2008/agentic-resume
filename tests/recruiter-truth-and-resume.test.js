import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import test from 'node:test';
const read=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8');
test('suite examples retain synthetic and unverified scope without production claims',()=>{
 const home=read('index.html');
 assert.doesNotMatch(home,/10 WORKING PATHS|Ten working workflows|ten working local review paths/i);
 assert.doesNotMatch(home,/working workflows|10 working/i);
 assert.match(home,/recorded demos/i);
 assert.match(read('projects/industry-ai-suite.html'),/organization outcomes remain UNVERIFIED/);
 assert.match(read('projects/ergon.html'),/Native Windows installation/);
 assert.match(read('projects/asmodeus.html'),/paper simulation/);
});
test('public PDFs match the exact user-approved release bytes',()=>{
 const manifest=JSON.parse(read('resume/approved-verification.json'));
 for(const [file,record] of Object.entries(manifest.artifacts)){
  const bytes=readFileSync(new URL('../'+file,import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),record.sha256);
 }
});
test('homepage timeline names only résumé employment',()=>{
 const page=read('index.html');
 for(const phrase of ['Portland High School','Dunkin','Robert H. Lord Company',"Tommy's Pizza",'David Cooke Plaster'])assert.ok(page.includes(phrase),phrase);
});
