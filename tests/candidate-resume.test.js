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
 assert.equal(source.evidence_notes.sophos.source_sha,'3e3e52c8693f415be2aa6695feff112d710ca344');
 assert.equal(source.evidence_notes.sophos.merge_commit,'33559fc996d04badc00ab62a0469d2ee7be023cd');
 assert.equal(source.evidence_notes.sophos.final_ci_run,38471697435);
 assert.equal(source.evidence_notes.sophos.cua_suites,'8/8 passed; 59/59 assertions, with two keyboard interactions skipped');
 assert.match(source.evidence_notes.sophos.status,/PR #20 merged.*Final hosted CI run 38471697435 passed/i);
 assert.match(source.evidence_notes.sophos.native_windows_acceptance,/source-head MSI is not verified.*demo\/mock IPC.*inference is untested/i);
 assert.equal(source.evidence_notes.ergon.next_build.version,'1.5.0 source candidate');
 assert.equal(source.evidence_notes.ergon.next_build.source_commit,'099ce52bf1e08aa17ce23425c9c79d269faaafc8');
 assert.equal(source.evidence_notes.ergon.next_build.installer.filename,'OpenClaw-Baseline-Setup-1.5.0.exe');
 assert.equal(source.evidence_notes.ergon.next_build.installer.sha256,'726ea20ee7506216e63654936803078e660966683ad4255f5fc0ccae323d5f13');
 assert.equal(source.evidence_notes.ergon.next_build.source_archive.sha256,'d1fefcfecdf5d374f5a0feac8fe7bc7df00ffcad7ccd74d52f3d53cb26bae090');
 assert.equal(source.evidence_notes.ergon.next_build.protected_feed.signature,'Ed25519 verified');
 assert.equal(source.evidence_notes.ergon.next_build.protected_feed.authenticated_full_https_payload_readback.status,200);
 assert.equal(source.evidence_notes.ergon.next_build.protected_feed.authenticated_full_https_payload_readback.sha256,source.evidence_notes.ergon.next_build.installer.sha256);
 assert.equal(source.evidence_notes.ergon.next_build.protected_feed.unauthenticated_access,401);
 assert.equal(source.evidence_notes.ergon.next_build.protected_feed.non_device_roles,403);
 assert.equal(source.evidence_notes.ergon.next_build.verification.node_tests_passed,539);
 assert.match(source.evidence_notes.ergon.next_build.limits,/memory endpoint returns 503 pending model choice/);
 assert.match(source.evidence_notes.ergon.next_build.limits,/Windows installation and runtime acceptance remain unverified/);
 assert.equal(source.evidence_notes.dotz.merge_commit,'4df6871ff45250e52b6a2276d37b5f9303743bf0');
 assert.equal(source.historical_evidence_notes.remote_state_snapshot.captured_at,'2026-10-05T14:31:17-04:00');
 assert.equal(source.historical_evidence_notes.dotz.state,'OPEN_DRAFT');
 assert.match(source.status,/Unpublished polish candidate; approved PDF artifacts remain unchanged/);
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
 assert.equal(source.summary,"Forward Thinking Engineer. Focus: integrate AI, custom-built around each company's tools, workflows and needs; shadow employees, build agents and tools for any digital task, teach, scale. Goal: lower costs, no cuts to people. Independent, AI-assisted developer.");
 assert.doesNotMatch(source.summary,/clients?|customers?|deployed/i);
});
test('the résumé page is a real page carrying the candidate fragment, and its links resolve',()=>{
 const page=read('resume.html');
 assert.doesNotMatch(page,/http-equiv="refresh"/);
 assert.ok(page.includes(read('resume/candidate-fragment.html').trim()));
 assert.ok(page.includes('href="site/css/resume.css"'));
 assert.ok(page.includes('href="./"'));
 assert.match(page,/<header class="resume-masthead">[\s\S]*?<a class="resume-download" href="Cayleb-James-polished-one-page\.pdf" download>/);
 const local=[...page.matchAll(/(?:href|src)="([^"#:?]+)"/g)].map(m=>m[1]).filter(h=>h!=='./');
 assert.ok(local.length>3);
 for(const href of local)assert.ok(existsSync(new URL('../'+href,import.meta.url)),href);
});
test('plain words: résumé lines are short and free of developer jargon, facts kept',()=>{
 const count=s=>s.trim().split(/\s+/).length;
 const JARGON=/\b(loopback|daemon|JSON-RPC|axum|Clippy|SHA|provenance|deterministic|Gateway|manifest|leases?|REST|IPC|catalogs?|chronological|source-grounded|replay|routing)\b/i;
 assert.ok(count(source.summary)<=36,`summary ${count(source.summary)} words`);
 assert.ok(count(source.experience.intro)<=18,'experience intro');
 for(const t of [source.summary,source.experience.intro])assert.doesNotMatch(t,JARGON,t);
 for(const p of source.projects){
  for(const b of p.bullets){assert.ok(count(b)<=24,`${p.slug} bullet: ${count(b)} words: ${b}`);assert.doesNotMatch(b,JARGON,b);}
  assert.ok(count(p.short)<=20,`${p.slug} short: ${count(p.short)} words`);
  assert.doesNotMatch(p.short,JARGON,p.short);
  assert.doesNotMatch(p.name,JARGON,p.name);
 }
 // No small meta line under the résumé: the page footer and the PDFs end with the content.
 assert.doesNotMatch(read('resume/candidate-fragment.html'),/Updated October 13, 2026/);
 // Every project short line and project bullet set carries concrete verification numbers.
 for(const p of source.projects){
  assert.match(p.short,/\d/,`${p.slug} short has a proof number`);
  assert.match(p.bullets.join(' '),/\d/,`${p.slug} bullets have a proof number`);
 }
 assert.match(source.experience.intro,/3,300\+/);
});
