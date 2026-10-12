import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import test from 'node:test';
const read=f=>readFileSync(new URL('../'+f,import.meta.url),'utf8');
const home=read('index.html');

test('refraction layers are decorative and keep the headline text intact',()=>{
 assert.ok(home.includes('href="remake/refraction.css?v=1"'));
 for(const layer of ['class="light-path" aria-hidden="true"','class="scan-sweep" aria-hidden="true"','class="step-thumb" aria-hidden="true"','class="pick-glow" aria-hidden="true"','light-pool--lens" aria-hidden="true"'])
  assert.ok(home.includes(layer),layer);
 const h1=home.match(/<h1 id="home-title"[^>]*>(.*?)<\/h1>/)[1].replace(/<br>/g,' ').replace(/<[^>]+>/g,'');
 assert.equal(h1,'AI that fits your work.');
 assert.equal((home.match(/data-beam="/g)||[]).length,10);
});

test('page-load hiding has a failsafe and skips reduced motion and deep links',()=>{
 assert.match(home,/prefers-reduced-motion: reduce/);
 assert.match(home,/mode=professional\|paused=1/);
 assert.match(read('remake/refraction.css'),/animation:intro-failsafe \.01s 2\.8s forwards/);
});

test('Higgsfield plate is only injected when an installed clip exists',()=>{
 const {clips}=JSON.parse(read('assets/motion/higgsfield-clips.json'));
 const installed=clips['hero-plate'].files.some(f=>existsSync(new URL('../'+f,import.meta.url)));
 assert.equal(home.includes('data-plate'),installed);
});

test('motion never swaps or redraws the approved character frames',()=>{
 const js=read('remake/refraction.js');
 assert.doesNotMatch(js,/characters\/|scaleY/);
 for(const line of js.split('\n').filter(l=>l.includes('scaleX')))assert.match(line,/light-pool/,'only the light pool stretches');
});
