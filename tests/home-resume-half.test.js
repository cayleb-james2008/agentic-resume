import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (file) => readFileSync(new URL(file, root), 'utf8');

// --- The approved copy: content.json carries it word for word (pinned below) --------------------------------

const RESUME_HALF = {
  kicker: 'Résumé',
  title: 'The official version',
  experience: 'Experience', projects: 'Projects', education: 'Education and skills',
  skills: 'Skills', caseStudy: 'Case study',
  workEthic: { title: 'Work ethic', line: 'Real jobs, real hours. Where I learned how teams actually work.' },
  status: { ergon: 'Windows pilot · live checks pending' },
  lab: { label: 'See the lab', sub: '10 recorded demos', href: 'lab/' },
  downloads: [
    { label: 'Résumé PDF', href: 'Cayleb-James-polished-resume.pdf' },
    { label: 'One-page PDF', href: 'Cayleb-James-polished-one-page.pdf' },
  ],
};
const content = JSON.parse(read('site/content.json'));
const resume = JSON.parse(read('resume/resume-content.json'));
const { meta } = content;

// --- Rendering and reading ---------------------------------------------------------------------------------

const PY = [
  'import json, sys',
  "sys.path.insert(0, 'scripts/home')",
  'from templates import resume_half',
  'data = json.load(sys.stdin)',
  'sys.stdout.write(resume_half.render(data["content"], data["resume"]))',
].join('\n');
const render = (resumeData = resume) =>
  execFileSync('python3', ['-c', PY], { cwd: root, input: JSON.stringify({ content, resume: resumeData }), encoding: 'utf8' });

const html = render();

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
const textOf = (fragment) => fragment
  .replace(/<[^>]+>/g, ' ')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ').trim();
const count = (source, pattern) => (source.match(pattern) || []).length;
/** What `text()` makes of a string: the three characters that matter in a text node. */
const escaped = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const section = (id) => one(html, 'section', new RegExp(`\\bid="${id}"`));
const projects = () => elements(html, 'article', /class="resume-project\b/);
const CASE_PAGE = (slug) => (slug === 'suite' ? 'industry-ai-suite' : slug);

test('content.json carries the approved résumé-half copy', () => {
  assert.deepEqual(content.resumeHalf, RESUME_HALF);
});

// --- 1. The head -----------------------------------------------------------------------------------------------

test('the résumé half reads like the résumé: name, title, place, both PDFs', () => {
  assert.ok(html.startsWith('<div class="resume-half" id="resume">'), 'one root div');
  assert.ok(html.endsWith('</div>'));
  assert.equal(count(html, /\bid="resume"/g), 1);

  assert.equal(textOf(one(html, 'p', /class="resume-half-kicker"/)), RESUME_HALF.kicker);
  assert.equal(textOf(one(html, 'p', /class="resume-half-title"/)), RESUME_HALF.title);
  assert.equal(textOf(one(html, 'p', /class="resume-half-name"/)), resume.full_name);
  assert.equal(
    textOf(one(html, 'p', /class="resume-half-meta"/)),
    'Forward Thinking Engineer · Connecticut, USA · Remote-only',
  );

  // The two PDFs the page already offers; the labels come from content, the files from meta.
  assert.deepEqual(RESUME_HALF.downloads.map((d) => d.href), [meta.resumePdf, meta.onePagePdf]);
  const downloads = one(html, 'ul', /class="resume-half-downloads"/);
  assert.equal(count(downloads, /<li\b/g), 2);
  for (const { label, href } of RESUME_HALF.downloads) {
    assert.ok(html.includes(`href="${href}" download`), href);
    assert.ok(downloads.includes(`>${label}</a>`), label);
  }

  // Everything printed is escaped, in text and in attributes.
  const hostile = structuredClone(resume);
  hostile.full_name = 'A <i>&B</i>';
  hostile.projects[0].links = [{ label: 'x<y', url: 'https://example.com/?a="1"&b=2' }];
  const out = render(hostile);
  assert.ok(out.includes('A &lt;i&gt;&amp;B&lt;/i&gt;'));
  assert.ok(!out.includes('<i>'));
  assert.ok(out.includes('x&lt;y'));
  assert.ok(out.includes('href="https://example.com/?a=&quot;1&quot;&amp;b=2"'));
});

// --- 2. Experience ---------------------------------------------------------------------------------------------

test('experience lists the main role, then the other jobs as work ethic', () => {
  const box = section('experience');
  assert.equal(textOf(one(box, 'h2')), RESUME_HALF.experience);

  const entry = one(box, 'article', /class="resume-entry"/);
  const { title, dates, intro } = resume.experience;
  assert.ok(title.includes('&'), 'the real title has an ampersand to escape');
  const dotted = (value) => value.replace(' - ', ' · '); // the official résumé page's separator (build_resume.py)
  assert.ok(title.includes(' - '), 'the real title has a spaced hyphen to set');
  assert.ok(entry.includes(escaped(dotted(title))), 'title, " · " and "&" escaped');
  assert.equal(textOf(one(entry, 'h3')), dotted(title));
  assert.equal(textOf(one(entry, 'p', /class="resume-dates"/)), dates);
  assert.ok(textOf(entry).includes(intro));

  // Work ethic: an h3 with its line, after the main role, then the jobs in résumé order.
  const ethic = one(box, 'div', /class="resume-ethic"/);
  assert.equal(textOf(one(ethic, 'h3')), RESUME_HALF.workEthic.title);
  assert.equal(textOf(one(ethic, 'p')), RESUME_HALF.workEthic.line);
  assert.ok(box.indexOf(entry) < box.indexOf(ethic));
  assert.ok(ethic.indexOf('<h3') < ethic.indexOf('<ul'));

  const jobs = elements(one(ethic, 'ul', /class="resume-jobs"/), 'li');
  assert.equal(jobs.length, resume.additional_experience.length);
  resume.additional_experience.forEach((job, i) => {
    const [org, role] = job.organization.split(' — ');
    const li = jobs[i];
    assert.equal(textOf(one(li, 'span', /class="resume-dates"/)), job.dates);
    const label = one(li, 'span', /class="resume-org"/);
    assert.equal(textOf(label), job.organization.replace(' — ', ' · '), 'company · role, as the official résumé page sets it');
    assert.equal(textOf(one(label, 'span', /class="resume-company"/)), org);
    if (role) assert.equal(textOf(one(label, 'span', /class="resume-role"/)), role);
    else assert.equal(count(label, /resume-role/g), 0, `${org} has no role`);
  });
  // Every title and name is set with " · ": no spaced hyphen or em dash is left, and apostrophes stay straight.
  assert.ok(!html.includes(' - ') && !html.includes(' — '), 'separators match the official résumé page');
  assert.ok(!html.includes('’'), 'no curly apostrophe');
  // The names the recruiter test looks for, apostrophes literal.
  for (const phrase of ['Dunkin', 'Robert H. Lord Company', "Tommy's Pizza", 'David Cooke Plaster']) {
    assert.ok(html.includes(phrase), phrase);
  }
});

// --- 3. Projects -----------------------------------------------------------------------------------------------

test('projects come in résumé order with Ergon first, each linking its case study', () => {
  const box = section('work');
  assert.equal(textOf(one(box, 'h2')), RESUME_HALF.projects);

  const cards = projects();
  assert.equal(cards.length, resume.projects.length);
  assert.deepEqual(cards.map((c) => textOf(one(c, 'h3'))), resume.projects.map((p) => p.name.replace(' - ', ' · ')), 'résumé order, names set with " · "');

  // Ergon leads, alone, and alone carries its status.
  assert.match(cards[0], /^<article class="resume-project resume-project--lead"/);
  assert.equal(resume.projects[0].slug, 'ergon');
  assert.equal(count(html, /resume-project--lead/g), 1);
  assert.equal(textOf(one(cards[0], 'p', /class="resume-status"/)), 'Windows pilot · live checks pending');
  assert.equal(count(html, /class="resume-status"/g), 1);

  resume.projects.forEach((project, i) => {
    const card = cards[i];
    // Each project is a deep link by its slug: the suite's ten tool pages link back to index.html#suite.
    assert.match(card, new RegExp(`^<article class="resume-project[^"]*" id="${project.slug}">`), `#${project.slug}`);
    assert.equal(textOf(one(card, 'p', /class="resume-stack"/)), project.stack);
    const bullets = elements(one(card, 'ul'), 'li').map(textOf);
    assert.deepEqual(bullets, project.bullets);

    // The case study: projects/<page>.html, suite → industry-ai-suite; the page is there.
    const page = `projects/${CASE_PAGE(project.slug)}.html`;
    assert.ok(existsSync(new URL(page, root)), page);
    assert.equal(count(card, new RegExp(`href="${page}"`, 'g')), 1, `${project.slug} links ${page} once`);
    const caseLink = one(card, 'a', new RegExp(`href="${page}"`));
    assert.equal(textOf(caseLink), RESUME_HALF.caseStudy);

    // The résumé's own links: repositories stay as written, the site's own pages go relative, none twice.
    const links = one(card, 'p', /class="resume-links"/);
    for (const { url } of project.links) {
      if (url.startsWith(meta.siteUrl)) {
        assert.ok(links.includes(`href="${url.slice(meta.siteUrl.length)}"`), `${url} made relative`);
      } else {
        assert.ok(links.includes(`href="${url}"`), url);
      }
    }
  });
  assert.ok(!html.includes(meta.siteUrl), 'no link to the site itself is absolute');
  assert.equal(count(html, /href="\//g), 0, 'no leading slash');
  for (const repo of ['dotz', 'sophos', 'industry-ai-suite']) {
    assert.ok(html.includes(`href="https://github.com/cayleb-james2008/${repo}"`), repo);
  }

  // A link to the site itself becomes relative, wherever it points: a page, the lab, the home page.
  const own = structuredClone(resume);
  own.projects[1].links.push(
    { label: 'Lab', url: `${meta.siteUrl}lab/` },
    { label: 'Home', url: meta.siteUrl },
  );
  const converted = elements(render(own), 'article', /class="resume-project\b/)[1];
  assert.ok(converted.includes('href="lab/">Lab</a>'), 'site url + lab/ → lab/');
  assert.ok(converted.includes('href="./">Home</a>'), 'the bare site url → ./');
  assert.ok(!converted.includes(meta.siteUrl), 'nothing absolute is left');

  // The lab, last in the section.
  const lab = one(box, 'p', /class="resume-lab"/);
  assert.equal(textOf(one(lab, 'a')), RESUME_HALF.lab.label);
  assert.ok(lab.includes('href="lab/"'));
  assert.ok(textOf(lab).includes(RESUME_HALF.lab.sub));
  assert.ok(box.indexOf(lab) > box.lastIndexOf('</article>'));
});

// --- 4. Education and skills -----------------------------------------------------------------------------------

test('education and skills, and never certifications', () => {
  const box = section('education');
  assert.equal(textOf(one(box, 'h2')), RESUME_HALF.education);

  const edu = one(box, 'div', /class="resume-edu"/);
  const e = resume.education;
  assert.equal(textOf(one(edu, 'h3')), e.school);
  for (const field of [e.location, e.status, e.coursework]) assert.ok(textOf(edu).includes(field), field);

  assert.equal(textOf(one(box, 'h3', /class="resume-skills-title"/)), RESUME_HALF.skills);
  const rows = elements(one(box, 'dl', /class="resume-skills"/), 'div');
  assert.equal(rows.length, resume.skills.length);
  resume.skills.forEach(([label, value], i) => {
    assert.equal(textOf(one(rows[i], 'dt')), label);
    assert.equal(textOf(one(rows[i], 'dd')), value);
  });
  assert.ok(html.includes('Apps &amp; data'), 'escaped');

  // Cayleb: anyone can have an agent earn one. Not rendered, whatever the data holds.
  assert.doesNotMatch(html, /certif/i);
  const withCerts = render({ ...resume, certifications: [{ name: 'Zeta Credential' }, 'Another Credential'] });
  assert.doesNotMatch(withCerts, /certif/i);
  assert.ok(!withCerts.includes('Zeta Credential') && !withCerts.includes('Another Credential'));
  assert.equal(withCerts, html, 'a certifications key changes nothing');
});

// --- 5. Structure ----------------------------------------------------------------------------------------------

test('three sections, one h2 each, ids for deep links', () => {
  const sections = elements(html, 'section');
  assert.equal(sections.length, 3);
  for (const id of ['experience', 'work', 'education']) {
    const box = section(id);
    assert.equal(count(box, /<h2\b/g), 1, id);
    const h2 = one(box, 'h2');
    const titleId = h2.match(/\bid="([^"]+)"/)[1];
    assert.ok(box.startsWith(`<section id="${id}" aria-labelledby="${titleId}"`), `${id} is named by its h2`);
  }
  assert.equal(count(html, /<h2\b/g), 3);
  assert.equal(count(html, /<h1\b/g), 0, 'the hero holds the page\'s one h1');
  assert.equal(count(html, /<img\b/g), 0);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length, 'ids are unique');
  // The head sits above the sections; nothing renders outside the root.
  assert.ok(html.indexOf('resume-half-name') < html.indexOf('<section'));
});

// --- 6. The stylesheet -----------------------------------------------------------------------------------------

test('the stylesheet sets the half as the official sheet, within the house rules', () => {
  const css = read('site/css/resume-half.css').replace(/\/\*[\s\S]*?\*\//g, '');
  const rule = (selector) => {
    const found = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter((m) => m[1].split(',').map((s) => s.trim()).includes(selector));
    assert.ok(found.length, `a rule for ${selector}`);
    return found.map((m) => m[2]).join(';');
  };
  // A cool-grey card with the reference's 2rem radius; from 1024px the sections sit in two columns.
  assert.match(rule('.resume-half'), /background:\s*var\(--surface\)/);
  assert.match(rule('.resume-half'), /border-radius:\s*var\(--radius-card\)/);
  assert.match(css, /grid-template-areas:\s*"head head"\s*"exp edu"\s*"work edu"/);
  assert.match(rule('.resume-half h2'), /text-transform:\s*uppercase/);
  assert.match(rule('.resume-project--lead'), /border-left:\s*2px solid var\(--accent\)/);
  assert.match(css, /color:\s*var\(--accent-ink\)/, 'link hover is the accent ink');

  assert.doesNotMatch(css, /@keyframes/);
  assert.doesNotMatch(css, /opacity|visibility/, 'nothing here hides content');
  for (const [, value] of css.matchAll(/transition:\s*([^;]+);/g)) assert.match(value, /^(?:color\b|none$)/, 'transitions are hover colour only');
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b/i, 'colours come from tokens');
});

test('deep links land on the résumé, its sections and every project with no margin of their own', () => {
  const strip = (file) => read(file).replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(strip('site/css/resume-half.css'), /scroll-margin|scroll-padding/);
  // Every id the suite pages link to (index.html#suite and the rest) is a project.
  const withIds = [...html.matchAll(/<article class="([^"]*)"[^>]*\sid="([^"]+)"/g)];
  assert.ok(withIds.length >= 5, 'ergon, suite, dotz, sophos and asmodeus carry ids');
  for (const [, cls, id] of withIds) assert.match(cls, /(^|\s)resume-project(\s|$)/, `#${id} is a project`);
});
