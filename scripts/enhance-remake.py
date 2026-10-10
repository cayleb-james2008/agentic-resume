from pathlib import Path
R=Path(__file__).resolve().parents[1]
html=(R/'index.html').read_text()
arrow='<svg class="aether-prism-btn__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
html=html.replace('<link rel="stylesheet" href="remake/site.css?v=1">','<link rel="stylesheet" href="remake/vendor/lenis.css"><link rel="stylesheet" href="remake/vendor/guide-glass.css"><link rel="stylesheet" href="remake/aether.css?v=8"><link rel="stylesheet" href="remake/site.css?v=8">').replace('remake/site.js?v=1','remake/site.js?v=8')
html=html.replace('<aside id="guide" hidden aria-label="Mofu guide">','<aside id="guide" hidden aria-label="Mofu guide" data-lenis-prevent><div id="guide-material" aria-hidden="true"></div>')
html=html.replace('class="primary"','class="primary aether-prism-btn"').replace('class="button primary"','class="button primary aether-prism-btn"')
html=html.replace('<span>↗</span>',arrow).replace('<span>→</span>',arrow)
html=html.replace('class="mode"','class="mode aether-switch"').replace('id="mode" type="checkbox"','id="mode" class="aether-switch__input" type="checkbox"').replace('class="mode-surface"','class="mode-surface aether-switch__track"').replace('<i></i></span></label>','<i class="aether-switch__thumb"></i></span></label>')
html=html.replace('<p class="eyebrow">Personal AI · freelance consulting</p>','').replace('AI that fits<br><em>your work.</em>','AI that fits<br>your work.').replace('I learn the job. Build your assistant.<br>Help your team make it useful.','I learn the job, build your assistant,<br>and help your team use it.')
html=html.replace('A little help. You stay in charge.','Your work. A useful draft. Your decision.')
html=html.replace('<span>01</span> ','').replace('<span>02</span> ','').replace('<span>03</span> ','')
html=html.replace('<div class="story-scene">','<div class="story-scene" aria-describedby="story-line story-benefit">')
html=html.replace('<p id="story-line">A part is missing. A customer needs a date.</p>','<p id="story-line">A lamp repair is waiting on a part.</p><p id="story-benefit" class="story-benefit">One repair. Its next step in view.</p>')
html=html.replace('</p></div><div class="record-art">','</p><button id="story-approval" type="button" aria-pressed="false" hidden>Approve the hold</button></div><div class="record-art">',1)
decor='''<div class="scene-visual" aria-hidden="true">
 <div class="repair-visual" data-visual="pip"><div class="ticket-edge"></div><div class="repair-checks"><span data-repair-check>Receipt pending<i></i></span><span data-repair-check>Test after repair<i></i></span></div><div class="calendar-hold"><small>October</small><b>15</b><span>provisional</span></div></div>
 <div class="proof-visual" data-visual="folio" hidden><div class="proof-leaf leaf-back"></div><div class="proof-leaf leaf-front"><span>FIELD GUIDE</span><div class="proof-title-lines"></div><div class="proof-page-columns"><i></i><i></i></div><small>52</small></div><span class="proof-comment comment-a" data-proof-comment>v4</span><span class="proof-comment comment-b" data-proof-comment>text</span><span class="proof-comment comment-c" data-proof-comment>v5</span><div class="proof-approval">LF-A5 · full proof</div></div>
 <div class="stock-visual" data-visual="loam" hidden><div class="stock-tray">'''+''.join('<i class="stock-unit"></i>' for _ in range(22))+'''</div><div class="order-bar" data-order hidden><span>204 <b>14</b></span><span>205 <b>8 / 9</b></span></div><div class="reserved-note">10 already reserved</div></div>
</div>'''
html=html.replace('<div class="record-art">','<div class="record-art">'+decor)
html=html.replace('<span class="scroll-note">Scroll to follow the workday</span>','<div class="journey-position"><span class="scroll-note">Scroll to follow</span><span id="journey-count">1 / 9</span></div>')
html=html.replace('<details id="record-detail">','<details id="record-detail" data-lenis-prevent>')
html=html.replace('<small>Your system’s reduced-motion preference is respected separately.</small>','<small id="motion-status">Your system’s reduced-motion preference is respected separately.</small>')
html=html.replace('<h2>Learn. Build. Keep it useful.</h2>','<h2 id="services-title" tabindex="-1">Learn. Build. Keep it useful.</h2>')
html=html.replace('Try the actual projects','Selected projects').replace('Try the work.','A few things I’ve built.').replace('<p class="section-label">Built &amp; documented</p>','')
html=html.replace('<button type="button" data-project="suite" aria-pressed="true">Industry AI Suite</button>','<button type="button" data-project="suite" aria-pressed="true"><strong>Industry AI Suite</strong><span>Ten source-backed review workflows</span>'+arrow+'</button>')
html=html.replace('<button type="button" data-project="sophos" aria-pressed="false">Sophos</button>','<button type="button" data-project="sophos" aria-pressed="false"><strong>Sophos</strong><span>A desktop agent workspace</span>'+arrow+'</button>')
html=html.replace('<button type="button" data-project="dotz" aria-pressed="false">dotz</button>','<button type="button" data-project="dotz" aria-pressed="false"><strong>dotz</strong><span>Coding work with a human decision</span>'+arrow+'</button>')
html=html.replace('<article class="project-panel suite-project"','<details class="project-playground" id="project-playground" open><summary>Open a recorded example</summary><article class="project-panel suite-project"')
html=html.replace('</article>\n</section>\n</details>','</article></details>\n</section>\n</details>')
# The wrapped source closes only at the projects section, independent of its newline formatting.
start=html.index('<details class="project-playground"');end=html.index('</section>',start)
chunk=html[start:end]
if not chunk.rstrip().endswith('</details>'):html=html[:end]+'</details>'+html[end:]
html=html.replace('Glass surfaces and motion are original code by Sol; artwork is 2D, not a rigged 3D model.','Glass controls adapt free Aether components by Astronaut (MIT).')
html=html.replace('<a href="characters/verification.json">Asset provenance</a>','<a href="characters/verification.json">Artwork provenance</a> · <a href="vendor/aether-free/README.md">Free component sources</a>')
html=html.replace('class="guide-toggle" aria-expanded','class="guide-toggle" aria-label="Meet Mofu; open guidance" aria-expanded')
html=html.replace('class="eyebrow">Tessa','class="story-person">Tessa')
html=html.replace('Glass controls adapt free Aether components by Astronaut (MIT).','Glass controls adapt free Aether components by Astronaut (MIT). Mofu’s guide uses React Bits GlassSurface; motion uses GSAP and Lenis.')
# Source reading order matches the visible section order before enhancement too.
reading_start=html.index('<details id="reading"')
reading_end=html.index('<details class="section-shell projects-shell"',reading_start)
reading=html[reading_start:reading_end]
html=html[:reading_start]+html[reading_end:]
service_start=html.index('<details class="section-shell service-shell"')
html=html[:service_start]+reading+html[service_start:]
html=html.replace('</body>','<p id="live-status" class="sr-only" role="status" aria-live="polite"></p></body>')
(R/'index.html').write_text(html)

html=(R/'index.html').read_text().replace('<title>','<link rel="canonical" href="https://cayleb-james2008.github.io/agentic-resume/"><title>',1)
(R/'index.html').write_text(html)
