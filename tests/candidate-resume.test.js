import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
const read=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8');
const source=JSON.parse(read('resume/resume-content.json'));
test('candidate copy preserves factual scope, attribution and dated boundaries',()=>{
 assert.match(source.summary,/^AI workflow integrator\. Focus: /);
 assert.match(source.summary,/AI-assisted/);
 assert.deepEqual(source.projects.map(p=>p.slug),['suite','sophos','dotz']);
 for(const [slug,pattern] of [['suite',/all ten full workflows remain UNVERIFIED/],['sophos',/Prime Intellect.*demo IPC; draft PR #10/],['dotz',/Draft PR #218.*Ubuntu acceptance not established/]]){
  const project=source.projects.find(p=>p.slug===slug);
  assert.match(project.short,pattern);
  assert.ok(read('resume/candidate-fragment.html').includes(project.short));
 }
 assert.equal(source.evidence_notes.sophos.native_ui.case_results_without_skip_marker,57);
 assert.equal(source.evidence_notes.sophos.native_ui.explicit_skipped_branches,2);
 assert.equal(source.evidence_notes.dotz.hosted_ci.core_jobs.Ubuntu.state,'FAILURE');
 assert.match(source.evidence_notes.industry_ai_suite.historical_model_evidence,/failure and corrected retry/);
 assert.match(source.snapshot_note,/October 5, 2026.*not rechecked/);
 assert.equal(source.additional_experience.length,4);
});
test('the homepage reaches the résumé page and both candidate PDFs',()=>{
 const home=read('index.html');
 assert.ok(home.includes('href="resume.html"'));
 for(const pdf of ['Cayleb-James-polished-resume.pdf','Cayleb-James-polished-one-page.pdf'])assert.ok(home.includes(`href="${pdf}" download`),pdf);
});
test('headline is integrator',()=>{
 assert.equal(source.headline,'AI workflow integrator');
 assert.equal(source.summary,'AI workflow integrator. Focus: shadowing employees to learn how they work, building each person a custom AI agent that fits their day, and teaching them to use it well, then scaling across the company. Independent, AI-assisted developer of local workflow tools, desktop interfaces and source-grounded review workflows. Background includes service and hands-on work.');
 assert.doesNotMatch(source.summary,/clients?|customers?|deployed/i);
});
