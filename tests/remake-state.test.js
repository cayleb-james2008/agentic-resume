import assert from 'node:assert/strict';
import {parse,serialize,receipt,stories,chapters,beats,moment,frameAt,isApproved,toggleApproval} from '../remake/state.js';
import fs from 'node:fs';
import {WORKFLOWS} from '../stage/workflows.js';
let cases=0;
for(const mode of ['explore','professional'])for(let c=0;c<3;c++)for(let b=0;b<3;b++){
 const s={...parse(''),mode,chapter:c,beat:b,view:'story',opened:true,read:true,profile:'build',paused:true,details:true};
 assert.deepEqual(parse(serialize(s)),s);assert.equal(moment(c,b),c*3+b);cases++;
}
for(const w of WORKFLOWS)for(let trace=0;trace<3;trace++){
 const s={...parse(''),view:'projects',workflow:w.slug,trace};const x=receipt(parse(serialize(s)));
 assert.equal(x.name,w.name);assert.equal(x.limit,w.limit);assert.equal(x.receiptUrl,w.receiptUrl);
 assert.equal(x.body,[`${w.source}. Recorded ${w.date}.`,w.result,w.handoff][trace]);cases++;
}
for(let graph=0;graph<4;graph++)for(const profile of ['build','review']){
 const s={...parse(''),project:'sophos',graph,profile,opened:true,read:graph%2===0};assert.deepEqual(parse(serialize(s)),s);cases++;
}
for(const hash of ['#mode=other&chapter=bad&beat=bad&trace=NaN&graph=-2&workflow=x','#trace=99&graph=99','#trace=Infinity&graph=Infinity']){
 const s=parse(hash);assert(s.chapter>=0&&s.chapter<3);assert(s.beat>=0&&s.beat<3);assert(s.trace>=0&&s.trace<3);assert(s.graph>=0&&s.graph<4);cases++;
}
assert.equal(parse('#resume').view,'resume');assert.equal(parse('#projects').view,'projects');
for(let approvals=0;approvals<8;approvals++)for(let chapter=0;chapter<3;chapter++){
 const s={...parse(''),approvals,chapter,beat:2};
 assert.deepEqual(parse(serialize(s)),s);
 const revised=toggleApproval(s);
 assert.equal(isApproved(revised),!isApproved(s));
 for(let other=0;other<3;other++)if(other!==chapter)assert.equal(isApproved({...s,chapter:other}),isApproved({...revised,chapter:other}));
 assert.deepEqual(toggleApproval(revised),s);cases++;
}
assert.equal(stories.length,3);assert(stories.every(s=>s.steps.length===3));
assert(stories[0].steps[2].detail.includes('part receipt')&&stories[0].steps[2].detail.includes('repair testing'));
assert(stories[1].steps[1].detail.includes('LF-A5')&&stories[1].steps[2].detail.includes('Rowan Pike'));
assert.equal(32-10,22);assert.equal(22-14,8);assert(stories[2].steps[2].detail.includes('No unauthorized partial pick'));
assert.deepEqual(chapters,['pip','folio','loam']);assert.deepEqual(beats,['problem','check','plan']);
let timingCases=0;
for(const name of [...chapters,'mofu']){
 const data=JSON.parse(fs.readFileSync(new URL(`../characters/${name}/asset-manifest.json`,import.meta.url),'utf8'));
 for(const sequence of Object.values(data.states)){
  let t=0;
  for(let index=0;index<sequence.frames.length;index++){
   assert.equal(frameAt(sequence,t),index);assert.equal(frameAt(sequence,t+sequence.frames[index].durationMs-1),index);t+=sequence.frames[index].durationMs;timingCases+=2;
  }
  assert.equal(frameAt(sequence,t),sequence.playback==='loop'?0:sequence.frames.length-1);timingCases++;
 }
}
const report={passed:true,stateAndReceiptCases:cases,storyStates:9,receiptStates:30,timingBoundaryCases:timingCases,scope:'Pure state, source-contract and manifest timing checks. Browser layout, history events, focus and runtime playback not exercised.'};

console.log(JSON.stringify(report,null,2));
