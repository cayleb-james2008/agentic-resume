"""Refraction pass: inject decorative motion layers into the built homepage.

Runs after scripts/enhance-remake.py. Everything added here is aria-hidden or a
presentational wrapper; copy, routes, evidence and the approved artwork are untouched.
"""
from pathlib import Path
import json

R = Path(__file__).resolve().parents[1]
page = R / 'index.html'
html = page.read_text()


def once(old, new, count=1):
    global html
    assert html.count(old) >= 1, f'missing anchor: {old[:70]}'
    html = html.replace(old, new, count)


# Styles and the cache-busted controller.
once('<link rel="stylesheet" href="remake/site.css?v=9">',
     '<link rel="stylesheet" href="remake/site.css?v=9"><link rel="stylesheet" href="remake/refraction.css?v=1">')
once('remake/site.js?v=9', 'remake/site.js?v=10')

# Hide the hero only when the page-load sequence will actually run. The CSS failsafe
# reveals everything after 2.8s if the module never executes.
intro = ("<script>(function(){try{var h=location.hash;"
         "if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!/mode=professional|paused=1/.test(h)"
         "&&!/view=(?!home)/.test(h)&&!/^#(?!mode=|$)/.test(h))document.documentElement.classList.add('intro')}catch(e){}})()</script>")
once('<script src="vendor/gsap-3.14.2.min.js" defer></script>', intro + '<script src="vendor/gsap-3.14.2.min.js" defer></script>')

# Headline lines become independently animatable without changing the text.
once('<h1 id="home-title" tabindex="-1">AI that fits<br>your work.</h1>',
     '<h1 id="home-title" tabindex="-1"><span class="hl">AI that fits</span><br><span class="hl">your work.</span></h1>')

# The light path: work enters Mofu, leaves as a spectrum, settles as a decision.
beams = ['in', 'fan-a', 'fan-b', 'fan-c', 'out']
base = ''.join(f'<path data-beam="{b}"/>' for b in beams)
pulse = ''.join(f'<path data-beam="{b}" pathLength="1" stroke-dasharray=".11 2" stroke-dashoffset=".11"/>' for b in beams)
svg = (f'<svg class="light-path" aria-hidden="true" focusable="false"><g class="beam-base">{base}</g>'
       f'<g class="beam-pulse">{pulse}</g></svg><div class="light-pool light-pool--lens" aria-hidden="true"></div>')
once('<div class="opening-art" aria-label="Mofu, your guide to the workday examples"><div class="light-pool"></div>',
     '<div class="opening-art" aria-label="Mofu, your guide to the workday examples"><div class="light-pool"></div>' + svg)

# Optional Higgsfield plate, only when the generated clip has been installed.
clips = json.loads((R / 'assets/motion/higgsfield-clips.json').read_text())['clips']
plate = clips.get('hero-plate')
sources = [f for f in (plate or {}).get('files', []) if (R / f).is_file()]
if sources:
    poster = f' poster="{plate["poster"]}"' if (R / plate['poster']).is_file() else ''
    kinds = {'.webm': 'video/webm', '.mp4': 'video/mp4'}
    tags = ''.join(f'<source data-src="{f}" type="{kinds[Path(f).suffix]}">' for f in sources)
    video = (f'<video class="hero-plate" data-plate{poster} muted loop playsinline '
             f'preload="none" disablepictureinpicture aria-hidden="true" tabindex="-1">{tags}</video>')
    once('<div class="light-pool light-pool--lens" aria-hidden="true"></div>',
         '<div class="light-pool light-pool--lens" aria-hidden="true"></div>' + video)

# Story: a check sweep over the records and a sliding step thumb.
once('<div class="record-art"><div class="scene-visual" aria-hidden="true">',
     '<div class="record-art"><span class="scan-sweep" aria-hidden="true"></span><div class="scene-visual" aria-hidden="true">')
once('<nav class="step-picker" aria-label="Story steps">',
     '<nav class="step-picker" aria-label="Story steps"><span class="step-thumb" aria-hidden="true"></span>')

# Projects: one shared highlight row.
once('<div class="project-picker" role="group" aria-label="Choose a project">',
     '<div class="project-picker" role="group" aria-label="Choose a project"><span class="pick-glow" aria-hidden="true"></span>')

once('Mofu’s guide uses React Bits GlassSurface; motion uses GSAP and Lenis.',
     'Mofu’s guide uses React Bits GlassSurface; motion uses GSAP and Lenis. The hero light path is decorative code; the characters are not redrawn.')

page.write_text(html)
print('Refraction layers injected.')
