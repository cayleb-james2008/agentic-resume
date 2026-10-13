import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import test from 'node:test';
const read=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8');
const home=read('index.html');
test('candidate website retains a direct reading résumé and sequential PDF/text downloads',()=>{
 for(const name of ['Cayleb-James-polished-one-page.pdf','Cayleb-James-polished-resume.pdf'])assert.ok(home.includes(`href="${name}" download`),name);
 for(const name of ['Cayleb-James-polished-one-page.pdf','Cayleb-James-polished-resume.pdf','Cayleb-James-polished-one-page.txt','Cayleb-James-polished-resume.txt'])assert.ok(existsSync(new URL('../'+name,import.meta.url)),name);
 assert.ok(home.includes('href="resume.html"'));
});
test('all three portfolio projects retain their source and evidence destinations',()=>{
 for(const name of ['industry-ai-suite','sophos','dotz']){
  assert.ok(home.includes('https://github.com/cayleb-james2008/'+name));
  const page=read('projects/'+name+'.html');
  assert.ok(page.includes('project-content'));
  assert.ok(page.includes('Evidence'));
  assert.match(page,/Verification|Source proof/);
 }
});
test('all ten dated receipts remain readable from the linked lab',()=>{
 for(const name of ['ledgerbridge','marketbrief','backtestguard','sentineldesk','onboardpath','handoffhub','replycraft','pipelinerelay','searchlift','chainwatch']){
  assert.ok(existsSync(new URL('../lab/receipts/'+name+'.json',import.meta.url)));
 }
 assert.ok(home.includes('href="lab/"'));
});
test('suite overview retains source, witness evidence and explicit limits',()=>{
 const page=read('projects/industry-ai-suite.html');
 for(const text of ['../lab/','github.com/cayleb-james2008/industry-ai-suite','evidence/ai-witness-20260926','2026-09-26','UNVERIFIED'])assert.ok(page.includes(text));
});
