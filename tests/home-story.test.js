import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { GATE_R, NODE_R, SOURCE_R, layoutFor, overlaysFor, slotsFor } from '../site/js/story/shapes.js';
import { pointOf } from '../site/js/story/story.js';

const root = new URL('../', import.meta.url);
const read = (file) => readFileSync(new URL(file, root), 'utf8');

// --- The approved copy: content.json carries it word for word (pinned below) -----------------------------

const STORY = {
  intro: { nameWords: ['Cayleb', 'Alvarez-', 'James'], title: 'Forward Thinking Engineer', cue: 'Scroll' },
  beats: [
    { id: 'hero', headline: "Show me how you work. I'll find where AI fits.",
      line: 'Forward Thinking Engineer. I learn the job first, then build AI and automation into it. Saves time and raises quality, in any field.' },
    { id: 'shape', headline: 'Every team works differently.', line: 'I build to fit yours.', labels: ['Moving crew', 'Office', 'Shop'] },
    { id: 'team', headline: 'Everyone gets their own assistant.', line: 'Built around the apps they already use.', tag: 'Ergon',
      roles: ['Owner', 'Dispatch', 'Front desk', 'Books', 'Crew lead', 'Sales'] },
    { id: 'tickets', headline: 'Problems fix themselves.', line: 'Right on the computer. Hard ones go up. A person has the last word.',
      ladder: ['Agent', 'Senior agent', 'Person'] },
    { id: 'worth', headline: 'About $100 a person a month.', line: 'Time back to take on more work.',
      price: '$100 / mo', more: '+ more work' },
  ],
};
const content = JSON.parse(read('site/content.json'));

test('content.json carries the approved story copy', () => {
  assert.deepEqual(content.story, STORY);
});

// --- Rendering and reading ----------------------------------------------------------------------------

const PY = [
  'import json, sys',
  "sys.path.insert(0, 'scripts/home')",
  'from importlib import import_module',
  "module = import_module('templates.' + sys.argv[1])",
  'sys.stdout.write(module.render(json.load(sys.stdin)))',
].join('\n');
const render = (name) => execFileSync('python3', ['-c', PY, name], { cwd: root, input: JSON.stringify(content), encoding: 'utf8' });
const python = (code) => execFileSync('python3', ['-c', `import sys\nsys.path.insert(0, 'scripts/home')\n${code}`], { cwd: root, encoding: 'utf8' });

const html = render('story');
const masthead = render('masthead');

/** Outer HTML of every <tag> whose opening tag matches `open`, balanced across nested same-name tags. */
const elements = (source, tag, open = /./) => {
  const found = [];
  const start = new RegExp(`<${tag}\\b[^>]*>`, 'g');
  for (let m; (m = start.exec(source));) {
    if (!open.test(m[0])) continue;
    const next = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'g');
    next.lastIndex = m.index;
    let depth = 0;
    for (let t; (t = next.exec(source));) {
      depth += t[1] ? -1 : 1;
      if (depth === 0) {
        found.push(source.slice(m.index, next.lastIndex));
        break;
      }
    }
  }
  return found;
};
const one = (source, tag, open) => {
  const list = elements(source, tag, open);
  assert.equal(list.length, 1, `${tag} ${open}: ${list.length} found`);
  return list[0];
};
const textOf = (fragment) => fragment.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const count = (source, pattern) => (source.match(pattern) || []).length;

const beat = (id) => STORY.beats.find((b) => b.id === id);
const caption = (id) => one(html, 'div', new RegExp(`data-caption="${id}"`));
const overlay = (id) => one(html, 'div', new RegExp(`data-overlay="${id}"`));
const items = (id) => elements(overlay(id), '(?:div|span)', /data-overlay-item/);

// --- A small CSS reader: every rule with the at-rules it sits in --------------------------------------------

const rulesOf = (file) => {
  const css = read(file).replace(/\/\*[\s\S]*?\*\//g, '');
  const rules = [];
  const walk = (text, at) => {
    const pattern = /([^{}]+)\{/g;
    for (let m; (m = pattern.exec(text));) {
      const head = m[1].trim();
      let depth = 1;
      let i = pattern.lastIndex;
      for (; i < text.length && depth > 0; i++) depth += text[i] === '{' ? 1 : text[i] === '}' ? -1 : 0;
      const body = text.slice(pattern.lastIndex, i - 1);
      if (head.startsWith('@')) walk(body, [...at, head]);
      else rules.push({ selector: head, parts: head.split(',').map((s) => s.trim()), body, at });
      pattern.lastIndex = i;
    }
  };
  walk(css, []);
  return rules;
};
const MOTION = '@media (prefers-reduced-motion: no-preference)';
const GUARD = '.js:not(.reveal-failsafe)';
const RUNWAY = '.story:not(.story--static)';
/** A property in a declaration list (min-height and max-height do not count as height). */
const declares = (body, property, value = '[^;]+') => new RegExp(`(?:^|[;\\s])${property}\\s*:\\s*${value}`).test(body);

// --- 1. The h1 -------------------------------------------------------------------------------------------

test('the story holds the one h1: the name for assistive tech, the words split for motion', () => {
  assert.equal(count(html, /<h1\b/g), 1);
  const h1 = one(html, 'h1', /id="story-name"/);
  assert.match(h1, /<span class="sr-only">Cayleb Alvarez-James<\/span>/);
  const units = h1.match(/<span class="reveal-units" aria-hidden="true">([\s\S]*)<\/span><\/span><\/h1>$/)[1];
  assert.deepEqual([...units.matchAll(/<span class="reveal-word">([\s\S]*?)<\/span><\/span>/g)].map((m) => textOf(m[1])), STORY.intro.nameWords);
  assert.match(h1, /data-reveal="word"[^>]*data-mode="once"/);

  const section = html.match(/^<section\b[^>]*>/)[0];
  assert.equal(section, '<section class="story" data-story id="home" aria-labelledby="story-name">');
  const name = one(html, 'div', /data-story-name/);
  assert.match(name, /class="story-name"/);
  assert.ok(name.includes(h1), 'the h1 sits in the name block');
  assert.match(name, /<\/h1><p class="story-title" data-fade data-delay="420">Forward Thinking Engineer<\/p>/);

  const cue = one(html, 'p', /data-story-cue/);
  assert.match(cue, /^<p class="story-cue" data-story-cue aria-hidden="true" data-fade data-delay="700">Scroll<\/p>$/);
});

// --- 2. Beats ---------------------------------------------------------------------------------------------

test('each beat has one h2 caption, its line, and a static drawing', () => {
  assert.equal(count(html, /data-caption="/g), STORY.beats.length);
  for (const b of STORY.beats) {
    const box = caption(b.id);
    assert.match(box, /^<div class="story-caption"/);
    assert.equal(count(box, /<h2\b/g), 1, b.id);
    assert.equal(textOf(one(box, 'h2')), b.headline);
    assert.equal(textOf(one(box, 'p')), b.line);
    const art = one(html, 'svg', new RegExp(`data-art="${b.id}"`));
    assert.match(art, /^<svg class="story-art" data-art="[a-z]+" viewBox="0 0 600 300" aria-hidden="true">/);
  }
  assert.equal(count(html, /<svg class="story-art"/g), STORY.beats.length);
  assert.equal(count(html, /<h2\b/g), STORY.beats.length, 'no other h2');
  // The drawings come after the stage, so the static page can set each under its caption.
  assert.ok(html.indexOf('<svg class="story-art"') > html.indexOf('data-overlay='));
  assert.ok(html.indexOf('<svg class="story-art"') > elements(html, 'div', /data-story-stage/)[0].length);
  assert.doesNotMatch(html, /<img\b/);
});

// --- 3. Overlays ------------------------------------------------------------------------------------------

test('overlay labels come from content and are hidden from assistive tech', () => {
  const groups = [...html.matchAll(/data-overlay="([a-z]+)"/g)].map((m) => m[1]);
  assert.deepEqual(groups, ['shape', 'team', 'tickets', 'worth'], 'one overlay per beat that has labels, none for the hero');
  for (const id of groups) assert.match(overlay(id), /^<div class="story-overlay" data-overlay="[a-z]+" aria-hidden="true">/);

  // shape: three labels, by number
  assert.deepEqual(items('shape').map(textOf), beat('shape').labels);
  assert.deepEqual(items('shape').map((el) => el.match(/data-index="(\w+)"/)[1]), ['0', '1', '2']);

  // team: six people, each with the apps overlaysFor names for that index, and the tag on the source
  const team = items('team');
  const people = team.filter((el) => !/data-index="source"/.test(el));
  assert.equal(team.length, 7);
  assert.equal(people.length, 6);
  const apps = overlaysFor(layoutFor(1.6, 6)).team.map((p) => p.apps);
  people.forEach((person, i) => {
    assert.match(person, new RegExp(`data-index="${i}"`));
    assert.equal(textOf(one(person, 'span', /class="story-role"/)), beat('team').roles[i]);
    assert.deepEqual([...person.matchAll(/data-app="(\w+)"/g)].map((m) => m[1]), apps[i], `person ${i}`);
    assert.equal(count(person, /<svg\b/g), apps[i].length);
  });
  assert.deepEqual(people.map((p) => textOf(one(p, 'span', /class="story-role"/))), beat('team').roles);
  const tag = team.filter((el) => /data-index="source"/.test(el));
  assert.equal(tag.length, 1, 'one item sits on the team source');
  assert.match(tag[0], /^<span class="story-item story-tag" data-overlay-item data-index="source">Ergon<\/span>$/);
  assert.equal(count(overlay('team'), /story-tag/g), 1);
  assert.ok(!people.some((p) => p.includes('story-tag')));

  // tickets: three gates by number, and a source on the person, holding the screen glyph
  const tickets = items('tickets');
  const gates = tickets.filter((el) => !/data-index="source"/.test(el));
  assert.deepEqual(gates.map(textOf), beat('tickets').ladder);
  assert.deepEqual(gates.map((el) => el.match(/data-index="(\w+)"/)[1]), ['0', '1', '2']);
  const source = tickets.filter((el) => /data-index="source"/.test(el));
  assert.equal(source.length, 1);
  assert.match(source[0], /data-app="screen"/);
  assert.equal(count(source[0], /<svg\b/g), 1);
  assert.equal(textOf(source[0]), '');

  // worth: 0 is the price, 1 the "more" mark
  const worth = items('worth');
  assert.deepEqual(worth.map(textOf), ['$100 / mo', '+ more work']);
  assert.deepEqual(worth.map((el) => el.match(/data-index="(\w+)"/)[1]), ['0', '1']);

});

test('every overlay item in the markup is one story.js can place, from the same layout the water uses', () => {
  const L = layoutFor(1.6, 6);
  const o = overlaysFor(L);
  assert.deepEqual(o.source, { x: L.source[0], y: L.source[1] }, 'overlaysFor exposes the team source');
  assert.notDeepEqual(o.source, o.tickets.source, 'the team source is not the ticket person');
  for (const id of ['shape', 'team', 'tickets', 'worth']) {
    for (const el of items(id)) {
      const index = el.match(/data-index="(\w+)"/)[1];
      assert.ok(pointOf(o, id, index), `${id} item ${index} has a point`);
    }
  }
  // The team source lands on the water's source slot, and the tickets source on the first person.
  assert.equal(pointOf(o, 'team', 'source'), o.source);
  assert.equal(pointOf(o, 'tickets', 'source'), o.tickets.source);
  assert.ok(slotsFor('team', 1, L).some((s) => s.a[0] === o.source.x && s.a[1] === o.source.y && s.th === 0 && s.r === SOURCE_R));
  // On a phone's team of four the last two people have no point (story.js hides them); the source still does.
  const phone = overlaysFor(layoutFor(390 / 844, 4));
  assert.equal(pointOf(phone, 'team', '4'), undefined);
  assert.ok(pointOf(phone, 'team', 'source'));
});

test('the label offsets in story.css are the layout\'s radii, and no position is copied from it', () => {
  const css = read('site/css/story.css');
  const radius = (name) => Number(css.match(new RegExp(`${name}:\\s*([\\d.]+)svh;`))[1]);
  // A stage is 100svh high, so a radius in stage heights is its value times 100 svh.
  assert.ok(Math.abs(radius('--node-r') - NODE_R * 100) < 1e-9, `--node-r is ${NODE_R * 100}svh`);
  assert.ok(Math.abs(radius('--gate-r') - GATE_R * 100) < 1e-9, `--gate-r is ${GATE_R * 100}svh`);
  // The team nodes, the ticket person and the gates really are drawn with those radii.
  const L = layoutFor(1.6, 6);
  const drawn = (id) => slotsFor(id, 1, L).filter((s) => s.th === 0 && s.a[0] === s.b[0] && s.a[1] === s.b[1]).map((s) => s.r);
  assert.ok(drawn('team').includes(NODE_R) && drawn('team').includes(SOURCE_R));
  assert.ok(drawn('tickets').includes(NODE_R) && drawn('tickets').includes(GATE_R));
  // Offsets use the variables. The only other svh in the file are the stage's own height and the name's size.
  assert.match(css, /\.story-role \{[^}]*calc\(50% \+ var\(--node-r\)/);
  assert.match(css, /\.story-label \{[^}]*var\(--gate-r\)[^}]*var\(--gate-r\)/);
  const others = [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([\w-]+):[^;{}]*?([\d.]+)svh/g)]
    .filter(([, property]) => !['--node-r', '--gate-r'].includes(property))
    .map(([, property, value]) => `${property} ${value}`);
  assert.deepEqual(others.sort(), ['font-size 15', 'height 100', 'height 100'].sort(), 'no radius is copied into a rule');
  // Nothing places a label by a number worked out from the layout: no percentages on an item, no orientation switch.
  assert.doesNotMatch(css, /orientation/);
  const rules = rulesOf('site/css/story.css');
  for (const rule of rules.filter((r) => r.parts.some((p) => /\.story-(?:item|tag|chip|gate|person|source)\b/.test(p)))) {
    assert.ok(!declares(rule.body, '(?:left|top)', '[^;]*%'), `${rule.selector} is placed by story.js, not by a percentage`);
  }
});

test('every visible string is the content, not the template', () => {
  const allowed = new Set([...JSON.stringify(STORY).matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => JSON.parse(`"${m[1]}"`)));
  allowed.add('Cayleb Alvarez-James');
  const stripped = html.replace(/<svg\b[\s\S]*?<\/svg>/g, '');
  const strings = [...stripped.matchAll(/>([^<]+)</g)].map((m) => m[1].replace(/&#x27;/g, "'").replace(/&amp;/g, '&').trim()).filter(Boolean);
  assert.ok(strings.length > 20);
  for (const s of strings) assert.ok(allowed.has(s), `"${s}" is not in the story content`);
  assert.doesNotMatch(html, /\bclaude|opus|sonnet|gpt\b/i);
});

// --- 4. The canvas ----------------------------------------------------------------------------------------

test('the water canvas is decorative and never blocks a vertical swipe', () => {
  const stage = one(html, 'div', /data-story-stage/);
  assert.equal(count(stage, /<canvas\b/g), 1);
  assert.match(stage, /<canvas class="story-canvas" data-water aria-hidden="true"><\/canvas>/);
  assert.ok(stage.indexOf('<canvas') < stage.indexOf('data-story-name'), 'the canvas is the bottom layer');
  assert.ok(stage.indexOf('data-story-cue') < stage.indexOf('data-caption='));
  assert.ok(stage.indexOf('data-caption=') < stage.indexOf('data-overlay='));

  const canvas = rulesOf('site/css/story.css').filter((r) => r.parts.some((p) => p.endsWith('.story-canvas')));
  assert.ok(canvas.some((r) => declares(r.body, 'touch-action', 'pan-y')), 'the canvas rule has touch-action: pan-y');
  assert.ok(canvas.every((r) => !declares(r.body, 'touch-action') || declares(r.body, 'touch-action', 'pan-y')));

  // Ruling R3: story.js adds no listener that could hold up a scroll.
  const script = read('site/js/story/story.js');
  const listeners = [...script.matchAll(/addEventListener\(\s*'([^']+)'[^;]*;/g)];
  const input = listeners.filter(([, type]) => /^(pointer|touch|mouse|wheel|deviceorientation)/.test(type));
  assert.deepEqual(input.map(([, type]) => type).sort(), ['deviceorientation', 'pointerdown', 'pointermove']);
  for (const [statement, type] of input) assert.match(statement, /\{\s*passive:\s*true\s*\}\s*\)/, `${type} is passive`);
  assert.doesNotMatch(script, /preventDefault/);
});

// --- 5. The runway ----------------------------------------------------------------------------------------

test('the runway only exists for a scripted page that allows motion', () => {
  const rules = rulesOf('site/css/story.css');
  const tall = rules.filter((r) => declares(r.body, 'height', '[^;]*svh'));
  const sticky = rules.filter((r) => declares(r.body, 'position', 'sticky'));
  assert.ok(tall.length >= 2 && sticky.length === 1, 'the section and the stage are the only tall things');
  for (const rule of [...tall, ...sticky]) {
    assert.deepEqual(rule.at, [MOTION], rule.selector);
    for (const part of rule.parts) {
      assert.ok(part.startsWith(GUARD), `${part} starts with the failsafe guard`);
      assert.ok(part.includes(RUNWAY), `${part} is limited to a story that has not gone static`);
    }
  }
  assert.ok(sticky[0].parts.every((p) => p.endsWith('.story-stage')));
  assert.ok(tall.some((r) => r.parts.includes(`${GUARD} ${RUNWAY}`) && declares(r.body, 'height', 'calc\\(100svh \\* 8\\)')),
    'the runway is one stage and seven screens: calc(100svh * 8)');
  assert.ok(tall.some((r) => r.parts.every((p) => p.endsWith('.story-stage')) && declares(r.body, 'height', '100svh')));

  // The story itself, outside that block, is only ever a normal-flow stack.
  const outside = rules.filter((r) => !r.at.includes(MOTION));
  for (const r of outside) {
    assert.ok(!declares(r.body, 'position', '(?:sticky|fixed)'), `${r.selector} stays in flow`);
    assert.ok(!declares(r.body, 'height', '[^;]*vh'), `${r.selector} has no viewport height`);
    assert.ok(!declares(r.body, 'opacity', '0(?![.\\d])'), `${r.selector} hides nothing`);
    assert.ok(!declares(r.body, 'visibility', 'hidden'), `${r.selector} hides nothing`);
  }
  // The canvas and the overlays are off by default, and on only in the runway.
  const off = (selector) => outside.some((r) => r.parts.some((p) => p.endsWith(selector)) && declares(r.body, 'display', 'none'));
  for (const selector of ['.story-canvas', '.story-overlay', '.story-cue']) {
    assert.ok(off(selector), `${selector} is display: none in the static story`);
  }
  const inside = rules.filter((r) => r.at.includes(MOTION));
  assert.ok(inside.some((r) => r.parts.some((p) => p.endsWith('.story-art')) && declares(r.body, 'display', 'none')), 'the drawings step aside');
  assert.ok(inside.some((r) => r.parts.some((p) => p.endsWith('.story-overlay')) && declares(r.body, 'display', 'block')));
  assert.ok(inside.every((r) => r.parts.every((p) => p.startsWith(GUARD))), 'everything in the block is guarded');
  assert.ok(inside.every((r) => r.parts.every((p) => p.includes(RUNWAY))), 'and limited to a story still running');

  // Nothing here moves on its own.
  assert.doesNotMatch(read('site/css/story.css') + read('site/css/masthead.css'), /@keyframes|animation\s*:/);
});

// --- 6. The headline ----------------------------------------------------------------------------------------

test('the headline flips over the water, with a plain fallback', () => {
  const rules = rulesOf('site/css/story.css');
  const flip = rules.filter((r) => declares(r.body, 'mix-blend-mode', 'difference'));
  assert.ok(flip.length >= 1);
  assert.ok(flip.some((r) => r.parts.some((p) => p.endsWith('.story-caption'))));
  for (const rule of flip) assert.deepEqual(rule.at, [MOTION], 'the flip belongs to the runway block');
  const caption = flip.find((r) => r.parts.some((p) => p.endsWith('.story-caption')));
  assert.ok(declares(caption.body, 'opacity', '0(?![.\\d])') && declares(caption.body, 'color', '#fff'));
  assert.ok(declares(caption.body, 'position', 'absolute'));
  assert.match(caption.body, /left:\s*var\(--gutter\)/);
  assert.match(caption.body, /top:\s*calc\(var\(--masthead-h\) \+ 2rem\)/);
  assert.match(caption.body, /max-width:\s*min\(34rem, 46vw\)/);

  const plain = rules.filter((r) => r.at.includes('@supports not (mix-blend-mode: difference)'));
  assert.ok(plain.some((r) => r.parts.some((p) => p.endsWith('.story-caption')) && declares(r.body, 'color', 'var\\(--foreground\\)')));
  for (const rule of plain) for (const part of rule.parts) assert.ok(part.startsWith(GUARD) && part.includes(RUNWAY), part);

  // On a phone the caption spans the top.
  const phone = rules.filter((r) => r.at.some((a) => a.includes('max-width: 639px')) && r.parts.some((p) => p.endsWith('.story-caption')));
  assert.ok(phone.length >= 1 && phone.every((r) => r.at.some((a) => a.includes('prefers-reduced-motion: no-preference'))));
  assert.ok(phone.every((r) => r.parts.every((p) => p.startsWith(GUARD) && p.includes(RUNWAY))));
  assert.ok(phone.some((r) => /right:\s*var\(--gutter\)/.test(r.body)));

  // Type: Oswald headlines, the hero's the biggest, the rest 70% of it; lines in body size and muted.
  const css = read('site/css/story.css');
  assert.match(css, /clamp\(2\.4rem, 5\.2vw, 5\.5rem\)/);
  assert.match(css, /\.story-caption h2[^{]*\{[^}]*var\(--font-display\)/);
  assert.match(css, /\.story-caption p[^{]*\{[^}]*var\(--type-body\)[^}]*var\(--foreground-muted\)/);
});

test('the static drawings are ink with a cyan rim, set in CSS', () => {
  const css = read('site/css/story.css');
  const art = rulesOf('site/css/story.css').filter((r) => r.parts.some((p) => /\.story-art\b/.test(p)));
  assert.ok(art.some((r) => declares(r.body, 'fill', 'var\\(--raw-color-ink-900\\)')));
  assert.ok(art.some((r) => declares(r.body, 'stroke', 'var\\(--raw-color-cyan-400\\)')));
  assert.doesNotMatch(css, /#0e0f14|#02d2e3/i, 'colours come from the tokens');
  const arts = elements(html, 'svg', /class="story-art"/).join('');
  assert.doesNotMatch(arts, /\b(?:fill|stroke|style)="/, 'the drawings carry no colour of their own');
  assert.doesNotMatch(arts, /<text\b/, 'no words in a drawing');
  const unit = (id) => one(html, 'svg', new RegExp(`data-art="${id}"`));
  assert.ok(count(unit('shape'), /<g\b/g) >= 3, 'three silhouettes');
  assert.equal(count(unit('team'), /<line\b|<path\b/g) >= 6, true, 'six channels');
  assert.ok(count(unit('team'), /<circle\b/g) >= 7, 'a source and six people');
  assert.equal(count(unit('tickets'), /<circle\b/g) >= 3, true, 'three gates');
});

// --- 7. The masthead ----------------------------------------------------------------------------------------

test('the masthead renders the nav from content and the burger', () => {
  const header = one(masthead, 'header', /class="masthead" data-masthead>/);
  assert.doesNotMatch(header, /data-rise|data-delay/);
  assert.match(header, /<a class="wordmark" href="\.\/" aria-label="Cayleb Alvarez-James, home">CAYLEB\.AJ<\/a>/);
  const nav = one(header, 'nav', /aria-label="Primary"/);
  const links = [...nav.matchAll(/<a href="([^"]*)">([^<]*)<\/a>/g)].map((m) => ({ label: m[2], href: m[1] }));
  assert.deepEqual(links, content.nav);
  const action = header.match(/<a class="masthead-action" href="([^"]*)">([\s\S]*?)<\/a>/);
  assert.equal(action[1], content.navAction.href);
  assert.equal(textOf(action[2]).replace(/\[\s*|\s*→\s*\]/g, ''), content.navAction.label);
  const burger = header.match(/<button\b[^>]*data-burger[^>]*>/)[0];
  assert.match(burger, /aria-controls="menu-sheet"/);
  assert.match(burger, /aria-expanded="false"/);
  assert.match(burger, /aria-label="Open menu"/);
  assert.equal(count(masthead, /<h1\b/g), 0);
});

test('the masthead is fixed and solid, and hidden only while the runway plays', () => {
  const rules = rulesOf('site/css/masthead.css');
  const css = read('site/css/masthead.css');
  const root = rules.find((r) => r.parts.includes(':root'));
  assert.match(root.body, /--masthead-h:\s*4rem;/);
  assert.match(root.body, /--gutter:\s*clamp\(1rem, 4vw, 3rem\);/);
  const bar = rules.find((r) => r.parts.includes('.masthead'));
  assert.ok(declares(bar.body, 'position', 'fixed'));
  assert.match(bar.body, /inset:\s*0 0 auto/);
  assert.ok(declares(bar.body, 'z-index', '30'));
  assert.match(bar.body, /background:\s*var\(--background\)/);
  assert.match(css, /\.masthead-action:hover,\s*\.masthead-action:focus-visible\s*\{\s*color:\s*var\(--accent-ink\)/);

  const hidden = rules.filter((r) => declares(r.body, 'opacity', '0(?![.\\d])'));
  assert.equal(hidden.length, 1);
  assert.deepEqual(hidden[0].parts, [`${GUARD} [data-masthead]`]);
  assert.deepEqual(hidden[0].at, [MOTION]);
  assert.doesNotMatch(css, /@keyframes|animation\s*:/);
  assert.ok(rules.every((r) => !r.body.includes('transition') || /transition:\s*color\b/.test(r.body)), 'transitions are for hover colour only');
});

test('story.css leans on the masthead height and the gutter', () => {
  const css = read('site/css/story.css');
  assert.match(css, /var\(--masthead-h\)/);
  assert.match(css, /var\(--gutter\)/);
  assert.doesNotMatch(css, /--masthead-h:|--gutter:/, 'defined once, in masthead.css');
});

// --- The helpers the templates share -------------------------------------------------------------------------

test('markup carries the heading and the app icons', () => {
  const out = JSON.parse(python([
    'import json',
    'import markup',
    'print(json.dumps({"heading": markup.heading(["One", "Two"], "t", "head", "stop"), "icons": {k: markup.ICONS[k] for k in',
    '  ["mail", "calendar", "sheet", "phone", "chat", "screen", "checkmark"]}, "step": [markup.LINE_STEP, markup.STOP]}))',
  ].join('\n')));
  assert.deepEqual(out.step, [130, 240]);
  const h2 = one(out.heading, 'h2', /class="head" id="t"/);
  assert.equal(count(h2, /class="heading-line"/g), 2);
  assert.match(h2, /data-delay="0"[\s\S]*data-delay="130"[\s\S]*class="heading-stop stop" data-fade data-delay="240" aria-hidden="true">\.</);
  for (const [name, icon] of Object.entries(out.icons)) {
    assert.match(icon, /^<svg class="icon" viewBox="0 0 16 16" aria-hidden="true">/, name);
    assert.match(icon, /stroke="currentColor"/, name);
    assert.match(icon, /fill="none"/, name);
    assert.equal(count(icon, /<svg\b/g), 1, name);
  }
});

test('the menu moved to the masthead folder and the page still loads it', () => {
  const menu = read('site/js/masthead/menu.js');
  assert.match(menu, /from '\.\.\/engine\/scroll\.js'/);
  assert.match(menu, /from '\.\.\/engine\/spring\.js'/);
  assert.match(menu, /from '\.\.\/engine\/ticker\.js'/);
  assert.match(read('site/js/main.js'), /from '\.\/masthead\/menu\.js'/);
  assert.throws(() => read('site/js/hero/menu.js'), /ENOENT/);
});
