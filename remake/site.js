import {WORKFLOWS} from '../stage/workflows.js';
import {chapters,beats,stories,parse,serialize,receipt,moment,clamp,frameAt,isApproved,toggleApproval} from './state.js';
import Lenis from './vendor/lenis.mjs';

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const root=document.documentElement, reduce=matchMedia('(prefers-reduced-motion: reduce)');
let motionPreference=reduce.matches;
let state=parse(location.hash), pin=false, distance=0, storyTop=110, scrollQueued=false;
let restoring=false, guideReturn=null, ambientTime=0, lastTime=null;
let paintedMode=null, openingVisible=false, sceneMotion=null, sceneGhost=null, guideMotion=null, guideFlight=null;
let guideSource=null, lastScene=null;
let lenis=null, guideMaterial=null;
const shellMemory={explore:null,professional:null};
const modeViews={explore:state.mode==='explore'?state.view:'home'};
const shellIds=['story-shell','projects-shell','service-shell','reading'];
const manifests=new Map(), players=new Map(), decoded=new Map();
history.scrollRestoration='manual';

function persist(push=false){history[push?'pushState':'replaceState']({...state},'',serialize(state));}
function announce(message){$('#live-status').textContent=message;}
function setText(id,value){$('#'+id).textContent=value;}
function setPose(img,name,pose){
 let p=players.get(img);
 if(!p){p={name,pose,elapsed:0,index:-1,visible:false};players.set(img,p);visibility.observe(img);}
 if(p.name!==name||p.pose!==pose){Object.assign(p,{name,pose,elapsed:0,index:-1});}
 img.dataset.character=name;img.dataset.pose=pose;
 const fallback=`characters/${name}/frames/idle/frame-000.png`;
 if(reduce.matches||state.paused){img.src=fallback;p.index=-1;return;}
 const frame=manifests.get(name)?.states[pose]?.frames[0];
 img.src=frame?`characters/${name}/${frame.file}`:fallback;
 warmFrames(name,pose);
}
function warmFrames(name,pose){
 const frames=manifests.get(name)?.states[pose]?.frames||[];
 for(const frame of frames){const url=`characters/${name}/${frame.file}`;
  if(decoded.has(url))continue;
  const img=new Image();decoded.set(url,{img,ready:false});img.src=url;
  img.decode().then(()=>{decoded.get(url).ready=true;}).catch(()=>{decoded.delete(url);});
 }
}
const visibility=new IntersectionObserver(entries=>{
 for(const e of entries){
  if(e.target.matches('.opening-art'))openingVisible=e.isIntersecting;
  const p=players.get(e.target);if(p)p.visible=e.isIntersecting;
 }
},{rootMargin:'30px'});
visibility.observe($('.opening-art'));

// One elapsed-time clock drives exact manifest frames and a bounded, seekable loop.
const ambient=window.gsap?.timeline({paused:true});
if(ambient){
 ambient.fromTo('.hero-mofu',{y:0},{y:-9,duration:4,ease:'sine.inOut'},0)
  .to('.hero-mofu',{y:0,duration:4,ease:'sine.inOut'},4)
  .fromTo('.chip-work',{y:0},{y:5,duration:4,ease:'sine.inOut'},0)
  .to('.chip-work',{y:0,duration:4,ease:'sine.inOut'},4)
  .fromTo('.chip-review',{y:0},{y:-4,duration:4,ease:'sine.inOut'},0)
  .to('.chip-review',{y:0,duration:4,ease:'sine.inOut'},4);
}
function tick(time){
 syncMotionPreference();
 lenis?.raf(time);
 const dt=lastTime===null?0:Math.min(time-lastTime,80);lastTime=time;
 const enabled=!reduce.matches&&!state.paused&&!document.hidden;
 if(enabled){
  if(state.mode==='explore'&&openingVisible){ambientTime=(ambientTime+dt)%8000;ambient?.time(ambientTime/1000,true);}
  for(const [img,p] of players){
   if(!p.visible)continue;
   const seq=manifests.get(p.name)?.states[p.pose];if(!seq)continue;
   p.elapsed+=dt;
   const index=frameAt(seq,p.elapsed);
   if(p.index!==index){const url=`characters/${p.name}/${seq.frames[index].file}`;
    if(decoded.get(url)?.ready){img.src=url;p.index=index;}}
  }
 }
 requestAnimationFrame(tick);
}
document.addEventListener('visibilitychange',()=>{lastTime=null;});

function paintStory(){
 const sceneKey=`${state.chapter}:${state.beat}:${isApproved(state)}`;
 const changed=lastScene!==null&&lastScene!==sceneKey;
 const priorChapter=root.dataset.chapter;
 const proofBefore=changed&&priorChapter==='folio'&&state.chapter===1&&motionAllowed()?
  $$('[data-proof-comment]').map(el=>({el,rect:el.getBoundingClientRect()})):[];
 stopSceneMotion();
 const image=$('.story-character');
 if(changed&&priorChapter!==chapters[state.chapter]&&motionAllowed()){
  sceneGhost=image.cloneNode();sceneGhost.className='scene-ghost';sceneGhost.alt='';sceneGhost.setAttribute('aria-hidden','true');
  Object.assign(sceneGhost.style,{position:'absolute',left:`${image.offsetLeft}px`,top:`${image.offsetTop}px`,width:`${image.offsetWidth}px`,height:`${image.offsetHeight}px`,margin:'0',maxWidth:'none',pointerEvents:'none'});
  image.parentElement.append(sceneGhost);
 }
 const c=stories[state.chapter],s=c.steps[state.beat];
 const approved=state.beat===2&&isApproved(state);
 root.dataset.chapter=chapters[state.chapter];root.dataset.beat=beats[state.beat];
 $('#story-title').innerHTML=s.title;
 setText('role-label',`${c.person} at ${c.company}`);setText('story-line',s.line);
 for(const [slot,row] of [['a',s.a],['b',s.b]]){
  setText(`record-${slot}-label`,row[0]);setText(`record-${slot}-value`,row[1]);setText(`record-${slot}-note`,row[2]);
 }
 setText('decision-label',approved?[
  'Tessa approved the hold · pickup unconfirmed',
  'Mina approved the pack · release pending',
  'Dev approved the plan · nothing ships'
 ][state.chapter]:s.decision);setText('story-benefit',s.benefit);setText('source-detail',s.detail);
 $('#story-approval').hidden=state.beat!==2;
 setText('story-approval',approved?'Reset this illustration':['Approve the hold','Approve the pack','Approve the plan'][state.chapter]);
 $('#story-approval').setAttribute('aria-pressed',String(approved));
 $('#story-source').href=c.source;
 setText('assistant-caption',`${c.name} · ${c.role.toLowerCase()}`);
 const img=$('.story-character');img.alt=c.alt;setPose(img,chapters[state.chapter],approved?'complete':s.pose);
 $$('button[data-chapter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.chapter===chapters[state.chapter])));
 $$('button[data-beat]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.beat===state.beat)));
 $$('[data-visual]').forEach(el=>el.hidden=el.dataset.visual!==chapters[state.chapter]);
 $('[data-action=back]').disabled=moment(state.chapter,state.beat)===0;
 $('[data-action=next]').innerHTML=(state.beat<2?['See the check','Review the plan'][state.beat]:state.chapter<2?`Meet ${stories[state.chapter+1].name}`:'See the projects')+' '+arrow;
 setText('journey-count',`${moment(state.chapter,state.beat)+1} / 9`);
 const stock=$$('.stock-unit');stock.forEach((el,i)=>{el.dataset.allocation=state.beat===2?(i<14?'first':'second'):'available';});
 $$('[data-order]').forEach(el=>el.hidden=state.beat!==2);
 $$('[data-proof-comment]').forEach(el=>el.classList.toggle('collected',state.beat>0));
 $$('[data-repair-check]').forEach(el=>el.classList.toggle('prepared',state.beat>0));
 if(changed&&motionAllowed()){
  sceneMotion=window.gsap.timeline({onComplete:stopSceneMotion});
  sceneMotion.fromTo($$('#story-line,#decision-label,.glass-record strong'),{opacity:.55},{opacity:1,duration:.18,ease:'power3.out',clearProps:'opacity'},0);
  if(sceneGhost){
   sceneMotion.fromTo(image,{opacity:0},{opacity:1,duration:.26,ease:'power3.out',clearProps:'opacity'},0)
    .to(sceneGhost,{opacity:0,duration:.26,ease:'power3.out'},0);
  }
  for(const {el,rect} of proofBefore){
   const to=el.getBoundingClientRect(),x=rect.left-to.left,y=rect.top-to.top;
   if(Math.abs(x)+Math.abs(y)>1)sceneMotion.fromTo(el,{x,y},{x:0,y:0,duration:.32,ease:'power3.out',clearProps:'transform'},0);
  }
 }
 lastScene=sceneKey;
}
function motionAllowed(){return state.mode==='explore'&&!reduce.matches&&!state.paused&&!!window.gsap;}
function stopSceneMotion(){
 sceneMotion?.kill();sceneMotion=null;sceneGhost?.remove();sceneGhost=null;
 $$('#story-line,#decision-label,.glass-record strong,.story-character').forEach(el=>el.style.removeProperty('opacity'));
 $$('[data-proof-comment]').forEach(el=>el.style.removeProperty('transform'));
}
const arrow='<svg class="aether-prism-btn__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
function paintProjects(){
 const w=receipt(state);
 $$('[data-project]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.project===state.project)));
 $$('[data-project-panel]').forEach(el=>el.hidden=el.dataset.projectPanel!==state.project);
 $('#workflow-select').value=state.workflow;
 $$('[data-trace]').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.trace===state.trace)));
 setText('receipt-name',w.name);setText('receipt-source',w.source);setText('receipt-proof',w.ai);
 setText('receipt-stage',w.stage);setText('receipt-body',w.body);setText('receipt-limit',w.limit);
 setText('receipt-ids',w.ids.length?w.ids.join(' · '):'Data and scope are in the full receipt.');
 $('#receipt-json').href=w.receiptUrl;$('#receipt-official').hidden=!w.sourceUrl;if(w.sourceUrl)$('#receipt-official').href=w.sourceUrl;
 $('.receipt-object').dataset.trace=state.trace;$('.graph-map').dataset.step=state.graph;
 $$('[data-node]').forEach((b,i)=>{b.disabled=false;b.setAttribute('aria-pressed',String(i===state.graph));});
 setText('graph-log',['A bounded task, ready to split.','Implementation and review paths are prepared.','Simulated patch and review are ready to inspect.','Human checkpoint: ship, revise or stop.'][state.graph]);
 setText('graph-advance',state.graph===3?'Reset the simulation':'Advance the workflow');
 $('#inbox-message').setAttribute('aria-expanded',String(state.opened));$('#inbox-detail').hidden=!state.opened;
 setText('unread-count',state.read?'Read':'1 unread');$('#mark-read').disabled=state.read;setText('mark-read',state.read?'Marked read':'Mark as read');
 $('#profile-select').value=state.profile;setText('profile-note',`${state.profile==='build'?'Build':'Review'} profile selected in this page’s simulation.`);
 $('#project-playground').open=state.details;
}
function paintMotion(){
 if(!motionAllowed()){stopSceneMotion();stopGuideMotion();}
 root.classList.toggle('motion-paused',state.paused||reduce.matches);
 $('#motion-toggle').setAttribute('aria-pressed',String(state.paused));
 setText('motion-toggle',state.paused?'Resume ambient motion':'Pause ambient motion');
 setText('motion-status',reduce.matches?'System reduced motion: static approved artwork.':state.paused?'Motion paused. The workday still uses direct steps.':'Motion follows the workday. Offscreen artwork pauses.');
 for(const [img,p] of players){setPose(img,p.name,p.pose);}
 if(state.paused||reduce.matches||state.mode==='professional')ambient?.time(0,true);
}
function paint(){
 if(paintedMode!==state.mode){
  if(paintedMode)shellMemory[paintedMode]=Object.fromEntries(shellIds.map(id=>[id,$('#'+id).open]));
  const defaults={"story-shell":state.mode==='explore',"projects-shell":state.mode==='explore',"service-shell":false,reading:false};
  const saved=shellMemory[state.mode]||defaults;
  for(const id of shellIds)$('#'+id).open=saved[id];
  // Keep keyboard and reading order identical to the rendered mode order.
  const order=state.mode==='professional'?['resume','home','story-shell','projects-shell','service-shell','reading']:['home','story-shell','projects-shell','reading','service-shell','resume'];
  document.querySelector('main').append(...order.map(id=>$('#'+id)));
  paintedMode=state.mode;
 }
 root.dataset.mode=state.mode;$('#mode').checked=state.mode==='explore';
 $('#mode').setAttribute('aria-label','Explore mode; uncheck for Professional résumé');
 paintStory();paintProjects();paintMotion();layoutJourney();
}
function layoutJourney(){
 const journey=$('#story-journey');
 storyTop=innerWidth<=760?76:90;
 pin=state.mode==='explore'&&!reduce.matches&&!state.paused&&$('#story-shell').open&&innerWidth>=900&&innerHeight>=760;
 // Keep the runway in place while measuring. Collapsing it at a story boundary
 // lets the browser clamp/anchor scrollY, pulling reverse scrolling downward.
 if(pin){
  distance=Math.round(innerHeight*3.2);
  root.style.setProperty('--story-top',`${storyTop}px`);
  root.style.setProperty('--page-width',`${root.clientWidth}px`);
  const height=`${innerHeight-storyTop+distance}px`;
  if(journey.style.height!==height)journey.style.height=height;
  root.classList.add('scroll-story');
 }else{
  distance=0;root.classList.remove('scroll-story');
  if(journey.style.height)journey.style.height='';
 }
 syncScroll();
}
function syncScroll(){
 const smooth=pin&&motionAllowed();
 if(smooth&&!lenis)lenis=new Lenis({autoRaf:false,lerp:.18,smoothWheel:true,syncTouch:false,overscroll:false,
  prevent:node=>!!node.closest('#guide,[data-lenis-prevent]')});
 else if(!smooth&&lenis){lenis.destroy();lenis=null;}
 lenis?.resize();
}
function scrollPageTo(y){
 const target=Math.max(0,Math.min(y,document.documentElement.scrollHeight-innerHeight));
 if(lenis){lenis.resize();lenis.scrollTo(target,{immediate:true,force:true});}
 else window.scrollTo({top:target,behavior:'instant'});
}
function scrollPageBy(y){scrollPageTo(scrollY+y);}
function scrollElementTo(el){
 if(el)scrollPageTo(el.getBoundingClientRect().top+scrollY-(parseFloat(getComputedStyle(el).scrollMarginTop)||0));
}
function jumpStory(){
 if(pin){const y=$('#story-journey').getBoundingClientRect().top+scrollY-storyTop+distance*moment(state.chapter,state.beat)/8;scrollPageTo(y);}
 else scrollElementTo($('#story'));
}
function openFor(view){
 if(view==='story')$('#story-shell').open=true;
 if(view==='projects')$('#projects-shell').open=true;
 if(view==='services')$('#service-shell').open=true;
 if(view==='reading')$('#reading').open=true;
}
function scrollView(focus=false){
 openFor(state.view);layoutJourney();
 if(state.view==='home')scrollPageTo(0);
 else if(state.view==='story')jumpStory();
 else scrollElementTo($('#'+state.view));
 if(focus){const el=state.view==='reading'?$('#reading summary'):$('#'+state.view+'-title');el?.focus({preventScroll:true});}
}
function navigate(view){state.view=view;persist(true);closeGuide(false);scrollView(true);}
function select(chapter,beat,options={}){
 Object.assign(state,{chapter,beat});if(!options.preserveView)state.view='story';openFor('story');paintStory();
 // Native scrolling updates the scene only; direct controls may seek explicitly.
 if(!options.scroll){layoutJourney();jumpStory();}
 persist(!options.scroll);if(!options.scroll)announce(`${stories[chapter].name}. ${stories[chapter].steps[beat].line}`);
}
function next(){const n=moment(state.chapter,state.beat)+1;n>8?navigate('projects'):select(Math.floor(n/3),n%3);}
function back(){const n=Math.max(0,moment(state.chapter,state.beat)-1);select(Math.floor(n/3),n%3);}
function projectUpdate(update){Object.assign(state,update,{view:'projects',details:true});paintProjects();persist(true);}
function stopGuideMotion(){
 guideMotion?.kill();guideMotion=null;guideFlight?.remove();guideFlight=null;
 guideSource?.style.removeProperty('opacity');guideSource=null;
 $('#guide').style.removeProperty('transform');$('#guide').style.removeProperty('transform-origin');$('#guide').style.removeProperty('opacity');
 $('#guide>.character').style.removeProperty('opacity');
}
function closeGuide(returnFocus=true){stopGuideMotion();$('#guide').hidden=true;$('.guide-toggle').setAttribute('aria-expanded','false');if(returnFocus)guideReturn?.focus({preventScroll:true});}
function openGuide(trigger){
 stopGuideMotion();guideReturn=trigger;
 const source=trigger.querySelector('.character'),from=source.getBoundingClientRect();
 const panel=$('#guide'),image=$('#guide>.character');panel.hidden=false;
 $('.guide-toggle').setAttribute('aria-expanded','true');setPose(image,'mofu','greeting');
 $('.close-guide').focus({preventScroll:true});
 guideMaterial??=import('./vendor/guide-glass.js').then(module=>module.mountGuideMaterial()).catch(()=>{});
 if(!motionAllowed())return;
 const to=image.getBoundingClientRect(),box=panel.getBoundingClientRect();
 guideSource=source;guideFlight=source.cloneNode();guideFlight.className='guide-flight';guideFlight.alt='';guideFlight.setAttribute('aria-hidden','true');
 Object.assign(guideFlight.style,{position:'fixed',left:`${from.left}px`,top:`${from.top}px`,width:`${from.width}px`,height:`${from.height}px`,maxWidth:'none',margin:'0',zIndex:'70',pointerEvents:'none',transformOrigin:'0 0'});
 document.body.append(guideFlight);source.style.opacity='0';image.style.opacity='0';
 guideMotion=window.gsap.timeline({onComplete:stopGuideMotion});
 guideMotion.fromTo(panel,{opacity:0,scale:.18,x:from.left+from.width/2-box.left-box.width/2,y:from.top+from.height/2-box.top,transformOrigin:'50% 0%'},{opacity:1,scale:1,x:0,y:0,duration:.42,ease:'power3.out'},0);
 guideMotion.to(guideFlight,{x:to.left-from.left,y:to.top-from.top,scale:to.width/from.width,duration:.42,ease:'power3.out'},0)
  .to(guideFlight,{opacity:0,duration:.1},.32).to(image,{opacity:1,duration:.1},.32);
}

$$('[data-nav]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();navigate(a.dataset.nav);}));
$$('[data-start]').forEach(b=>b.addEventListener('click',()=>select(chapters.indexOf(b.dataset.start),0)));
$$('button[data-chapter]').forEach(b=>b.addEventListener('click',()=>select(chapters.indexOf(b.dataset.chapter),0)));
$$('button[data-beat]').forEach(b=>b.addEventListener('click',()=>select(state.chapter,+b.dataset.beat)));
$('[data-action=next]').addEventListener('click',next);$('[data-action=back]').addEventListener('click',back);
$('#story-approval').addEventListener('click',()=>{
 state=toggleApproval(state);paintStory();layoutJourney();persist(true);
 announce(isApproved(state)?`${stories[state.chapter].person} approved this fictional review. Nothing is sent, released or shipped.`:'Fictional review reset.');
});
$('.story-controls').addEventListener('keydown',e=>{if(e.target.matches('input,select,textarea')||e.altKey||e.ctrlKey||e.metaKey)return;if(e.key==='ArrowRight'){e.preventDefault();next();}if(e.key==='ArrowLeft'){e.preventDefault();back();}});
$('#mode').addEventListener('change',()=>{
 restoring=true;
 modeViews[state.mode]=state.view;
 lenis?.stop();closeGuide(false);
 state.mode=$('#mode').checked?'explore':'professional';
 state.view=state.mode==='professional'?'resume':modeViews.explore||'home';
 paint();persist(true);
 if(state.mode==='professional')scrollPageTo(0);
 else scrollView(false);
 requestAnimationFrame(()=>requestAnimationFrame(()=>{restoring=false;}));
 announce(state.mode==='professional'?'Professional résumé mode.':'Explore mode.');
});
$('.guide-toggle').addEventListener('click',e=>$('#guide').hidden?openGuide(e.currentTarget):closeGuide());
$('.hero-mofu').addEventListener('click',e=>openGuide(e.currentTarget));$('.close-guide').addEventListener('click',()=>closeGuide());
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#guide').hidden){e.preventDefault();closeGuide();}});
document.addEventListener('pointerdown',e=>{if(!$('#guide').hidden&&!e.target.closest('#guide,.guide-toggle,.hero-mofu'))closeGuide(false);});
$('#motion-toggle').addEventListener('click',()=>{const y=scrollY;state.paused=!state.paused;paintMotion();layoutJourney();persist(true);scrollPageTo(y);});
function syncMotionPreference(){
 if(motionPreference===reduce.matches)return;
 motionPreference=reduce.matches;
 paintMotion();layoutJourney();
 if(state.view==='story')jumpStory();
}
reduce.addEventListener('change',syncMotionPreference);
$$('[data-project]').forEach(b=>b.addEventListener('click',()=>projectUpdate({project:b.dataset.project})));
$('#workflow-select').addEventListener('change',e=>projectUpdate({workflow:e.target.value,trace:0}));
$$('[data-trace]').forEach(b=>b.addEventListener('click',()=>projectUpdate({trace:+b.dataset.trace})));
$('#graph-advance').addEventListener('click',()=>projectUpdate({graph:(state.graph+1)%4}));
$$('[data-node]').forEach((b,i)=>b.addEventListener('click',()=>projectUpdate({graph:i})));
$('#inbox-message').addEventListener('click',()=>projectUpdate({opened:!state.opened}));
$('#mark-read').addEventListener('click',()=>projectUpdate({read:true}));
$('#profile-select').addEventListener('change',e=>projectUpdate({profile:e.target.value}));
$('#desktop-restart').addEventListener('click',()=>{persist();location.reload();});
$('#desktop-reset').addEventListener('click',()=>{projectUpdate({profile:'review',opened:false,read:false});setText('desktop-status','Simulation reset. Changes remain in this page.');});
$$('[data-goto-project]').forEach(a=>a.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();projectUpdate({project:a.dataset.gotoProject});scrollView(true);}));
$('#project-playground').addEventListener('toggle',()=>{if(restoring)return;state.details=$('#project-playground').open;persist();});
$('#story-shell').addEventListener('toggle',layoutJourney);
$('#record-detail').addEventListener('toggle',layoutJourney);
addEventListener('resize',()=>{const box=$('#story-journey').getBoundingClientRect(),active=box.top<storyTop+30&&box.bottom>storyTop;const was=pin;layoutJourney();if(was&&pin&&active)jumpStory();});
addEventListener('scroll',()=>{
 if(scrollQueued||restoring)return;scrollQueued=true;
 requestAnimationFrame(()=>{scrollQueued=false;if(!pin||restoring)return;
  const top=$('#story-journey').getBoundingClientRect().top;
  const progress=(storyTop-top)/distance;
  const n=Math.round(clamp(progress)*8);
  if(n!==moment(state.chapter,state.beat)){select(Math.floor(n/3),n%3,{scroll:true,preserveView:progress<0||progress>1});}
 });
},{passive:true});
function restore(){
 restoring=true;state=parse(location.hash);paint();openFor(state.view);
 requestAnimationFrame(()=>{scrollView(false);requestAnimationFrame(()=>{restoring=false;});});
}
addEventListener('popstate',restore);addEventListener('hashchange',()=>{if(serialize(state)!==location.hash)restore();});

// Progressive enhancement: the source stories and all projects stay readable without JS.
root.classList.add('js');$('#reading').open=false;
$$('.character').forEach(img=>setPose(img,img.dataset.character,img.dataset.pose||'idle'));
paint();persist();requestAnimationFrame(tick);
Promise.all(chapters.concat('mofu').map(async name=>{
 try{const res=await fetch(`characters/${name}/asset-manifest.json`);if(!res.ok)throw new Error('manifest');
  manifests.set(name,await res.json());
  for(const [img,p] of players)if(p.name===name)setPose(img,p.name,p.pose);
 }catch{setText('motion-status','Artwork remains still while animation is unavailable.');}
}));
document.fonts.ready.then(()=>{layoutJourney();if(location.hash&&state.view!=='home')scrollView(false);});

// Read-only diagnostics for browser QA. No tool, model or external action runs here.
window.remake={getState:()=>({...state}),getMotion:()=>({reduced:reduce.matches,paused:state.paused,pin,lenis:!!lenis,scrollAuthority:lenis?'Lenis 1.3.26':'native',reactBits:!!$('#guide-material .glass-surface'),
 players:[...players].map(([img,p])=>({name:p.name,pose:p.pose,visible:p.visible,currentSrc:img.currentSrc,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,elapsed:p.elapsed}))})};
