// Refraction pass (2026-10-12). Decorative motion layered on the approved remake.
// Mofu is a glass lens: your work goes in, a useful draft comes out, a person decides.
// Nothing here changes copy, state, routes or the approved character frames.

const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(n,a=-1,b=1)=>Math.min(b,Math.max(a,n));
const f=n=>n.toFixed(1);
const gsap=()=>window.gsap;

// ---------- Hero light path ----------
// Geometry comes from the real layout boxes, so every breakpoint gets its own path.
export function layoutBeams(){
 const art=$('.opening-art'),svg=art&&$('.light-path',art);
 if(!svg||!art.offsetWidth)return;
 const W=art.offsetWidth,H=art.offsetHeight;
 svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
 const box=el=>({x:el.offsetLeft,y:el.offsetTop,w:el.offsetWidth,h:el.offsetHeight});
 const work=box($('.chip-work',art)),draft=box($('.chip-draft',art)),review=box($('.chip-review',art)),m=box($('.hero-mofu',art));
 const lens={x:m.x+m.w*.5,y:m.y+m.h*.64};
 const d={};
 // Work leaves its chip and falls into the lens.
 const s={x:work.x+work.w*.62,y:work.y+work.h*.9};
 d.in=`M${f(s.x)} ${f(s.y)}C${f(s.x+12)} ${f(s.y+(lens.y-s.y)*.75)} ${f(lens.x-m.w*.5)} ${f(lens.y+6)} ${f(lens.x)} ${f(lens.y)}`;
 // The lens disperses it into a spectrum that lands on the draft.
 ['fan-a','fan-b','fan-c'].forEach((name,k)=>{
  const e={x:draft.x+10,y:draft.y+draft.h*(.28+.22*k)};
  d[name]=`M${f(lens.x)} ${f(lens.y)}C${f(lens.x+m.w*.42)} ${f(lens.y+(k-1)*26)} ${f(e.x-m.w*.22)} ${f(e.y+(k-1)*8)} ${f(e.x)} ${f(e.y)}`;
 });
 // The draft arcs under Mofu and settles as the person's decision.
 const o={x:draft.x+draft.w*.45,y:draft.y+draft.h*.92},r={x:review.x+review.w-12,y:review.y+review.h*.5};
 const floor=Math.max(m.y+m.h*.98,r.y+12);
 d.out=`M${f(o.x)} ${f(o.y)}C${f(o.x+18)} ${f(floor+8)} ${f(r.x+m.w*.55)} ${f(floor+22)} ${f(r.x)} ${f(r.y)}`;
 for(const path of $$('path[data-beam]',svg))path.setAttribute('d',d[path.dataset.beam]);
}

// Adds the light path to the existing 8 s ambient clock, so pause, reduced motion,
// offscreen and Professional mode all keep working exactly as before.
export function extendAmbient(tl){
 if(!tl)return;
 const p=name=>`.beam-pulse [data-beam="${name}"]`;
 const travel=(name,at,duration,ease)=>tl.fromTo(p(name),{attr:{'stroke-dashoffset':.11}},{attr:{'stroke-dashoffset':-1},duration,ease},at);
 const glow=(sel,at,rise=.3,fall=1.25)=>tl.fromTo(sel,{'--glow':0},{'--glow':1,duration:rise,ease:'power2.out'},at).to(sel,{'--glow':0,duration:fall,ease:'sine.inOut'},at+rise);
 glow('.chip-work',1.3);
 travel('in',1.6,1.45,'power1.in');
 tl.fromTo('.light-pool--lens',{opacity:0},{opacity:1,duration:.3,ease:'power2.out'},2.9).to('.light-pool--lens',{opacity:0,duration:1.3,ease:'sine.inOut'},3.2);
 ['fan-a','fan-b','fan-c'].forEach((name,i)=>travel(name,3.0+i*.08,1.15,'power2.out'));
 glow('.chip-draft',3.95);
 travel('out',4.6,1.75,'sine.inOut');
 glow('.chip-review',6.1);
 tl.fromTo('.chip-review span',{scale:1},{scale:1.4,duration:.16,ease:'power2.out'},6.15).to('.chip-review span',{scale:1,duration:.55,ease:'elastic.out(1,.45)'},6.31);
}

// ---------- One page-load moment ----------
export function intro(allowed){
 const root=document.documentElement;
 if(!root.classList.contains('intro'))return;
 const g=gsap();
 if(!allowed||!g){root.classList.remove('intro');return;}
 const lines=$$('.opening h1 .hl'),chips=$$('.loop-chip'),cards=$$('.question-choices>button');
 const hidden=[...lines,$('.opening .lead'),$('.opening-actions'),$('.hero-mofu'),$('.opening-art>.light-pool:not(.light-pool--lens)'),$('.light-path'),$('.mofu-caption'),...chips,...cards].filter(Boolean);
 g.set(hidden,{opacity:0});root.classList.remove('intro');
 const tl=g.timeline({defaults:{ease:'power3.out'},onComplete:()=>g.set(hidden,{clearProps:'opacity'})});
 // The headline comes into focus the way light resolves through glass.
 tl.fromTo(lines,{opacity:0,y:20,filter:'blur(14px)',fontWeight:280},{opacity:1,y:0,filter:'blur(0px)',fontWeight:650,duration:1,stagger:.14,clearProps:'transform,filter,fontWeight'},0)
  .to(['.opening .lead','.opening-actions'],{opacity:1,duration:.7,stagger:.1},.5)
  .fromTo('.opening .lead,.opening-actions',{y:12},{y:0,duration:.7,stagger:.1,clearProps:'transform'},.5)
  .to('.hero-mofu',{opacity:1,duration:.35},.35)
  .fromTo('.hero-mofu img',{y:-52,scale:.9},{y:0,scale:1,duration:1.05,ease:'back.out(1.6)',clearProps:'transform'},.35)
  .fromTo('.opening-art>.light-pool:not(.light-pool--lens)',{opacity:0,scaleX:.25},{opacity:1,scaleX:1,duration:.9,clearProps:'transform'},.7)
  .to('.light-path',{opacity:1,duration:.9},1.0)
  .to(chips,{opacity:1,duration:.5,stagger:.14},.95)
  .to('.mofu-caption',{opacity:1,duration:.6},1.3)
  .to(cards,{opacity:1,duration:.5,stagger:.08},1.15)
  .fromTo(cards,{y:14},{y:0,duration:.6,stagger:.08,clearProps:'transform'},1.15);
}

// ---------- Pointer depth (fine pointers only) ----------
let pointer=null;
export function bindPointer(allowed){
 const g=gsap(),hero=$('.opening'),art=$('.opening-art');
 if(!g||!hero||!art||!matchMedia('(pointer: fine)').matches)return;
 const proxy={x:0,y:0};
 const write=()=>{art.style.setProperty('--px',proxy.x.toFixed(3));art.style.setProperty('--py',proxy.y.toFixed(3));};
 const qx=g.quickTo(proxy,'x',{duration:1,ease:'power3.out',onUpdate:write});
 const qy=g.quickTo(proxy,'y',{duration:1,ease:'power3.out',onUpdate:write});
 pointer={reset:()=>{qx(0);qy(0);}};
 hero.addEventListener('pointermove',e=>{
  if(!allowed())return;
  const b=art.getBoundingClientRect();
  qx(clamp((e.clientX-b.left-b.width/2)/(b.width/2)));qy(clamp((e.clientY-b.top-b.height/2)/(b.height/2)));
 },{passive:true});
 hero.addEventListener('pointerleave',()=>pointer.reset());
}
export function resetPointer(){pointer?.reset();}

// ---------- Story: the objects show what changed ----------
const sceneTargets='#story-title,.glass-record,.review-pill,.story-character,.scan-sweep,.stock-unit,.order-bar span,.calendar-hold,.repair-checks i';
export function clearScene(){
 const g=gsap();if(!g)return;
 g.set(sceneTargets,{clearProps:'transform,opacity,left,filter'});
 $('.review-pill')?.style.removeProperty('--glow');
}
export function sceneTweens(tl,from,to){
 if(!tl)return;
 const moved=!from||from.chapter!==to.chapter||from.beat!==to.beat;
 const entered=beat=>moved&&to.beat===beat;
 if(from&&from.chapter!==to.chapter){
  // The next assistant lands in place; uniform scale only, artwork untouched.
  tl.fromTo('.story-character',{y:-34,scale:.92},{y:0,scale:1,duration:.8,ease:'back.out(1.7)',clearProps:'transform'},0);
 }
 if(moved){
  // Records turn over like glass cards rather than swapping text in place.
  tl.fromTo('#story-title',{opacity:.15,y:8,filter:'blur(8px)'},{opacity:1,y:0,filter:'blur(0px)',duration:.5,ease:'power3.out',clearProps:'opacity,transform,filter'},0);
  tl.fromTo('.glass-record',{rotationX:-74,y:-10},{rotationX:0,y:0,duration:.55,ease:'back.out(1.35)',stagger:.08,clearProps:'transform'},0)
   .fromTo('.review-pill',{y:10},{y:0,duration:.45,ease:'power3.out',clearProps:'transform'},.14);
 }
 if(entered(1)){
  // The check: one sweep of light across the records.
  tl.fromTo('.scan-sweep',{left:'-30%'},{left:'104%',duration:.95,ease:'power2.inOut',clearProps:'left'},.12)
   .fromTo('.scan-sweep',{opacity:0},{opacity:1,duration:.2},.12).to('.scan-sweep',{opacity:0,duration:.3,clearProps:'opacity'},.8);
  if(to.chapter===0)tl.fromTo('.repair-checks i',{scale:.5},{scale:1,duration:.45,ease:'back.out(2.4)',stagger:.12,clearProps:'transform'},.35);
 }
 if(entered(2)){
  if(to.chapter===0)tl.fromTo('.calendar-hold',{y:-18,rotation:18},{y:0,rotation:8,duration:.7,ease:'back.out(1.8)',clearProps:'transform'},.1);
  if(to.chapter===2)tl.fromTo('.stock-unit',{scale:.55,opacity:.3},{scale:1,opacity:1,duration:.34,ease:'back.out(2)',stagger:.028,clearProps:'transform,opacity'},.08)
   .fromTo('.order-bar span',{y:8,opacity:0},{y:0,opacity:1,duration:.4,stagger:.1,clearProps:'transform,opacity'},.5);
 }
 if(from&&!moved&&to.approved&&!from.approved){
  // Approval: the prepared review glows once. Nothing is sent.
  tl.fromTo('.review-pill',{'--glow':1,scale:1.05},{'--glow':0,scale:1,duration:.9,ease:'power2.out',clearProps:'transform'},0);
 }
}

// ---------- Indicators that follow attention ----------
let hoverRow=null;
function place(el,props,first){
 if(first)el.style.transition='none';
 for(const [k,v] of Object.entries(props))el.style.setProperty(k,v);
 if(first)requestAnimationFrame(()=>requestAnimationFrame(()=>el.style.removeProperty('transition')));
}
function stepThumb(){
 const picker=$('.step-picker'),thumb=picker&&$('.step-thumb',picker),on=picker&&$('button[aria-pressed=true]',picker);
 if(!thumb||!on||!on.offsetWidth)return;
 const first=!picker.classList.contains('has-thumb');
 place(thumb,{'--x':on.offsetLeft+'px','--w':on.offsetWidth+'px',top:on.offsetTop+'px',height:on.offsetHeight+'px'},first);
 picker.classList.add('has-thumb');
}
function projectGlow(){
 const picker=$('.project-picker'),glow=picker&&$('.pick-glow',picker);
 if(!glow)return;
 const row=hoverRow||$('button[aria-pressed=true]',picker);
 if(!row||!row.offsetHeight){picker.classList.remove('has-glow');return;}
 const first=!picker.classList.contains('has-glow');
 place(glow,{'--y':row.offsetTop+'px','--h':row.offsetHeight+'px'},first);
 picker.classList.add('has-glow');
}
export function paintIndicators(){stepThumb();projectGlow();}
export function bindIndicators(){
 const picker=$('.project-picker');
 if(picker){
  picker.addEventListener('pointerover',e=>{const b=e.target.closest('button[data-project]');if(b&&b!==hoverRow){hoverRow=b;projectGlow();}});
  picker.addEventListener('pointerleave',()=>{hoverRow=null;projectGlow();});
  picker.addEventListener('focusin',e=>{hoverRow=e.target.closest('button[data-project]');projectGlow();});
  picker.addEventListener('focusout',()=>{hoverRow=null;projectGlow();});
 }
 const watch=new ResizeObserver(()=>{layoutBeams();paintIndicators();});
 for(const el of $$('.opening-art,.step-picker,.project-picker'))watch.observe(el);
}

// ---------- Optional Higgsfield plate ----------
let plateOn=false;
export function plate(on){
 const v=$('video[data-plate]');
 if(!v||on===plateOn)return;plateOn=on;
 if(on){
  if(!v.dataset.loaded){v.dataset.loaded='1';for(const s of v.querySelectorAll('source[data-src]'))s.src=s.dataset.src;v.preload='auto';v.load();}
  v.play().catch(()=>{});
 }
 else v.pause();
}
