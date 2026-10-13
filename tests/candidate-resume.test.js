import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import test from 'node:test';
const read=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8');
const source=JSON.parse(read('resume/resume-content.json'));
test('candidate copy preserves factual scope, attribution and dated boundaries',()=>{
 assert.match(source.summary,/^Forward Thinking Engineer\. Focus: /);
 assert.match(source.summary,/AI-assisted/);
 assert.deepEqual(source.projects.map(p=>p.slug),['ergon','suite','dotz','sophos','asmodeus']);
 for(const project of source.projects)assert.ok(read('resume/candidate-fragment.html').includes(project.short));
 assert.equal(source.evidence_notes.industry_ai_suite.python_tests,382);
 assert.equal(source.evidence_notes.industry_ai_suite.actual_model_inference,'not exercised: configured loopback endpoint was unavailable during the current run');
 assert.match(source.evidence_notes.ergon.windows_acceptance,/User testing is underway/);
 assert.match(source.evidence_notes.asmodeus.scope,/No live broker, real-money execution/);
 assert.equal(source.evidence_notes.sophos.ui_tests,1224);
 assert.equal(source.evidence_notes.dotz.merge_commit,'4df6871ff45250e52b6a2276d37b5f9303743bf0');
 assert.match(source.historical_evidence_notes.context,/superseded by evidence_notes/);
 assert.doesNotMatch(source.status,/unpublished/i);
 assert.match(source.snapshot_note,/October 13, 2026/);
 assert.doesNotMatch(source.projects.map(p=>p.name).join(' '),/Maki|EvoHedge/);
 assert.equal(source.additional_experience.length,4);
});
test('the homepage reaches the résumé page and both candidate PDFs',()=>{
 const home=read('index.html');
 assert.ok(home.includes('href="resume.html"'));
 for(const pdf of ['Cayleb-James-polished-resume.pdf','Cayleb-James-polished-one-page.pdf'])assert.ok(home.includes(`href="${pdf}" download`),pdf);
});
test('headline is the target role, Forward Thinking Engineer',()=>{
 assert.equal(source.headline,'Forward Thinking Engineer');
 assert.equal(source.summary,'Forward Thinking Engineer. Focus: shadowing employees to learn how they work, building each person a custom AI agent that fits their day, and teaching them to use it well, then scaling across the company. Independent, AI-assisted developer of local workflow tools, desktop interfaces and source-grounded review workflows. Background includes service and hands-on work.');
 assert.doesNotMatch(source.summary,/clients?|customers?|deployed/i);
});
test('the résumé page is a real page carrying the candidate fragment, and its links resolve',()=>{
 const page=read('resume.html');
 assert.doesNotMatch(page,/http-equiv="refresh"/);
 assert.ok(page.includes(read('resume/candidate-fragment.html').trim()));
 assert.ok(page.includes('href="site/css/resume.css"'));
 assert.ok(page.includes('href="./"'));
 const local=[...page.matchAll(/(?:href|src)="([^"#:?]+)"/g)].map(m=>m[1]).filter(h=>h!=='./');
 assert.ok(local.length>3);
 for(const href of local)assert.ok(existsSync(new URL('../'+href,import.meta.url)),href);
});
