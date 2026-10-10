import {WORKFLOWS} from '../stage/workflows.js';

export const chapters=['pip','folio','loam'];
export const beats=['problem','check','plan'];
export const views=['home','story','projects','reading','resume','services'];
export const projects=['suite','sophos','dotz'];
export const clamp=(n,a=0,b=1)=>Number.isFinite(Number(n))?Math.min(b,Math.max(a,Number(n))):a;
export const moment=(chapter,beat)=>chapter*3+beat;
export const isApproved=s=>Boolean(s.approvals&(1<<s.chapter));
export const toggleApproval=s=>({...s,approvals:s.approvals^(1<<s.chapter)});
export function frameAt(sequence,elapsed){
 const total=sequence.frames.reduce((sum,frame)=>sum+frame.durationMs,0);
 let time=sequence.playback==='loop'?elapsed%total:Math.min(elapsed,total-1),index=0;
 while(index<sequence.frames.length-1&&time>=sequence.frames[index].durationMs){time-=sequence.frames[index].durationMs;index++;}
 return index;
}
export function parse(hash){
 const p=new URLSearchParams(hash.replace(/^#/,''));
 const direct=hash.replace(/^#/,'');
 const chapter=Math.max(0,chapters.indexOf(p.get('chapter')));
 const beat=Math.max(0,beats.indexOf(p.get('beat')));
 return {mode:p.get('mode')==='professional'?'professional':'explore',chapter,beat,
  view:views.includes(p.get('view'))?p.get('view'):views.includes(direct)?direct:'home',
  project:projects.includes(p.get('project'))?p.get('project'):'suite',
  workflow:WORKFLOWS.some(w=>w.slug===p.get('workflow'))?p.get('workflow'):'ledgerbridge',
  trace:Math.floor(clamp(p.get('trace'),0,2)),graph:Math.floor(clamp(p.get('graph'),0,3)),
  opened:p.get('opened')==='1',read:p.get('read')==='1',profile:p.get('profile')==='build'?'build':'review',
  paused:p.get('paused')==='1',details:p.get('details')==='1',approvals:Math.floor(clamp(p.get('approvals'),0,7))};
}
export function serialize(s){return '#'+new URLSearchParams({mode:s.mode,view:s.view,
 chapter:chapters[s.chapter],beat:beats[s.beat],project:s.project,workflow:s.workflow,
 trace:s.trace,graph:s.graph,opened:s.opened?'1':'0',read:s.read?'1':'0',profile:s.profile,
 paused:s.paused?'1':'0',details:s.details?'1':'0',approvals:s.approvals});}
export function receipt(s){
 const w=WORKFLOWS.find(w=>w.slug===s.workflow)||WORKFLOWS[0];
 return {...w,stage:['Source record','Recorded answer','Human handoff'][s.trace],
 body:[`${w.source}. Recorded ${w.date}.`,w.result,w.handoff][s.trace]};
}
export const stories=[
 {name:'Pip',person:'Tessa Rowan',company:'Brackenvale Workshop',role:'Repair coordination',
  source:'stage/sources/repair-fiction.json',alt:'Pip, a translucent horizontal glass bean',
  steps:[
   {title:'When can it be<br>picked up?',line:'A lamp repair is waiting on a part.',pose:'idle',
    a:['Repair ticket','Part missing','Desk lamp · SW-17'],b:['Pickup','No date yet','Tessa needs a clear answer'],
    decision:'Pip gathers the repair notes',benefit:'One repair. Its next step in view.',
    detail:'Tessa Rowan coordinates repairs at fictional Brackenvale Workshop. The SW-17 part has not been received. A customer needs a pickup date; no promise has been made.'},
   {title:'Pip checks<br>the part.',line:'Thursday is a forecast. Receipt comes first.',pose:'working',
    a:['Supplier note','Thu 15 Oct','Expected 10:00 · not received'],b:['Repair checklist','Receipt + test','Both required before pickup'],
    decision:'Notes and parts, brought together',benefit:'Tessa can answer from the same records.',
    detail:'The supplier forecast is Thursday 15 October at 10:00. It is not proof of receipt or a pickup promise. Pip brings the part status and repair testing requirement into one conditional plan.'},
   {title:'Tessa reviews<br>the plan.',line:'Hold Thursday. Confirm after receipt and testing.',pose:'waiting',
    a:['Provisional hold','Thursday','Pending arrival and repair test'],b:['Tessa’s review','Approve the hold','Confirm only after both checks'],
    decision:'Prepared for Tessa · nothing sent',benefit:'A useful reply, ready for her decision.',
    detail:'Pip prepares a provisional Thursday hold. Tessa reviews and may approve the hold in this fictional illustration. Pickup can only be confirmed after actual part receipt and successful repair testing. No reply is sent.'}]},
 {name:'Folio',person:'Mina Solis',company:'Larkspur Field Guides',role:'Editorial production',
  source:'stage/sources/role-fiction.json',alt:'Folio, a translucent folded glass cushion',
  steps:[
   {title:'Is this proof<br>approved?',line:'Proof comments are scattered across versions.',pose:'idle',
    a:['Current proof','v5 · 52 pages','Full layout needs approval'],b:['Older approval','v4 · 48 pages','Text only · different scope'],
    decision:'Folio collects the review records',benefit:'Mina sees which comments belong together.',
    detail:'Mina Solis prepares releases at fictional Larkspur Field Guides. The latest v5 proof has 52 pages. An older approval covers only text in a 48-page v4 proof. Being the newest file does not make it approved.'},
   {title:'Folio makes<br>one review.',line:'The proof and its approval now match.',pose:'working',
    a:['Proof record','v5 · 52 pages','Print specs attached'],b:['Anika’s approval','Full v5 proof','Staged record LF-A5'],
    decision:'Version, scope and comments aligned',benefit:'Mina can review one complete pack.',
    detail:'A staged update from editor Anika Frost approves the full v5 proof, record LF-A5. Folio matches both version and scope, then gathers the proof record, print specifications and approval. These are source records, not an actual proof PDF.'},
   {title:'Mina reviews<br>the pack.',line:'She approves the prepared pack for release review.',pose:'waiting',
    a:['Review pack','Proof + specs','Exact approval included'],b:['Release decision','Rowan authorizes','External release remains pending'],
    decision:'Prepared for Mina · nothing released',benefit:'A clear handoff to the person who releases it.',
    detail:'Folio prepares one proof/specification/approval manifest. Mina reviews and may approve the prepared pack. Production lead Rowan Pike must separately authorize any external release. No printer delivery or actual downloadable proof is claimed.'}]},
 {name:'Loam',person:'Dev Ellis',company:'Copper Finch Supply',role:'Stock coordination',
  source:'stage/sources/role-fiction.json',alt:'Loam, a translucent rounded glass block',
  steps:[
   {title:'What can<br>we promise?',line:'Two orders need the same limited stock.',pose:'idle',
    a:['Stock records','36 or 32?','A signed recount is needed'],b:['Orders in line','14 + 9 units','Earlier reservations protected'],
    decision:'Loam checks what is actually available',benefit:'Dev sees the conflict before promising stock.',
    detail:'Dev Ellis coordinates stock at fictional Copper Finch Supply. The ledger says 36; an unsigned shelf note says 32. Order 204 needs 14 and order 205 needs nine. A signed recount is required before new allocation; 24 unreceived inbound units cannot be used.'},
   {title:'Loam checks<br>the count.',line:'32 counted. 10 reserved. 22 available.',pose:'working',
    a:['Sam’s signed count','32 units','Staged signed shelf recount'],b:['Available to allocate','22 units','32 − 10 locked reservations'],
    decision:'Earlier reservations stay protected',benefit:'Dev has a count he can review.',
    detail:'Sam Alder’s staged signed count confirms 32. Ten units are already locked in earlier reservations, leaving 22 available for new orders. Unreceived inbound stock is excluded.'},
   {title:'Dev reviews<br>the allocation.',line:'14 for the first order. Eight held for the next.',pose:'waiting',
    a:['Order 204','14 allocated','Whole order prepared'],b:['Order 205','8 of 9 held','One short · no partial pick'],
    decision:'Prepared for Dev · nothing ships',benefit:'The shortfall is clear before a commitment.',
    detail:'Loam drafts a whole 14-unit allocation for order 204. The remaining eight are earmarked for order 205, which needs nine, pending Dev’s review. No unauthorized partial pick, skipping to order 206 or use of inbound stock is permitted. Dev reviews and may approve the prepared plan; nothing ships.'}]}
];
