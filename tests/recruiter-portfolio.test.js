import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import test from 'node:test';
const read=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8');
const home=read('index.html');
test('canonical website retains a direct reading résumé and both downloads',()=>{
 for(const name of ['Cayleb-James-one-page-resume.pdf','Cayleb-James-resume.pdf']){
  assert.ok(home.includes(`href="${name}" download`));
  assert.ok(existsSync(new URL('../'+name,import.meta.url)));
 }
 assert.ok(home.includes('href="#resume" data-nav="resume"'));
 assert.match(read('resume.html'),/url=\.\/#mode=professional&amp;view=resume/);
});
test('all three portfolio projects retain their source and evidence destinations',()=>{
 for(const name of ['industry-ai-suite','sophos','dotz']){
  assert.ok(home.includes('https://github.com/cayleb-james2008/'+name));
  const page=read('projects/'+name+'.html');
  for(const heading of ['What it does','How to try it','Source proof','Credit and limits'])assert.ok(page.includes(`<h2>${heading}</h2>`));
 }
});
test('all ten dated receipts remain directly readable behind the project disclosure',()=>{
 for(const name of ['ledgerbridge','marketbrief','backtestguard','sentineldesk','onboardpath','handoffhub','replycraft','pipelinerelay','searchlift','chainwatch']){
  assert.ok(home.includes('lab/receipts/'+name+'.json'));
  assert.ok(existsSync(new URL('../lab/receipts/'+name+'.json',import.meta.url)));
 }
 assert.match(home,/<details class="project-playground"/);
});
test('suite overview retains source, witness evidence and explicit limits',()=>{
 const page=read('projects/industry-ai-suite.html');
 for(const text of ['../lab/','github.com/cayleb-james2008/industry-ai-suite','evidence/ai-witness-20260926','2026-09-26','UNVERIFIED'])assert.ok(page.includes(text));
});
