/**
 * Renders the hero's two layers into assets/hero/ from scripts/home/hero_scene.html.
 *
 *   node scripts/home/render_hero.mjs        (needs Playwright with Chromium; run by hand)
 *
 * Every check count drawn in the layers is read here from resume/resume-content.json, so a picture can never
 * claim more than the résumé does. The outputs are committed: the site build never needs Playwright.
 */
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');

/** The counts each layer shows, pulled out of the résumé's own sentences. */
export function countsFrom(resume) {
  const bullets = (slug) => resume.projects.find((p) => p.slug === slug).bullets.join(' ');
  const pick = (text, re, label) => {
    const m = re.exec(text);
    if (!m) throw new Error(`the résumé no longer states ${label}`);
    return m;
  };
  const ergon = pick(bullets('ergon'), /(\d[\d,]*) passing tests/, 'Ergon test count');
  const dotz = pick(bullets('dotz'), /Windows \((\d+)\), macOS \((\d+)\) and Linux \((\d+)\)/, 'dotz test counts');
  const sophos = pick(bullets('sophos'), /([\d,]+) interface, (\d+) Node and (\d+\/\d+) Windows/, 'Sophos check counts');
  const suite = pick(bullets('suite'), /\((\d+) Python/, 'Industry AI Suite test count');
  const asmodeus = pick(bullets('asmodeus'), /([\d,]+) Rust and (\d+) Python/, 'Asmodeus test counts');
  const total = pick(resume.experience.intro, /([\d,]+\+) automated checks across (\d+) systems/, 'the check total');
  return {
    ergon: ergon[1],
    dotz: `${dotz[1]} · ${dotz[2]} · ${dotz[3]}`,
    sophos: `${sophos[1]} · ${sophos[2]} · ${sophos[3]}`,
    sophosShort: `${sophos[1]} · ${sophos[2]}`,
    suite: suite[1],
    asmodeus: `${asmodeus[1]} + ${asmodeus[2]}`,
    total: total[1],
    systems: total[2],
  };
}

async function loadPlaywright() {
  for (const spec of ['playwright', process.env.PLAYWRIGHT_MODULE, '/opt/node22/lib/node_modules/playwright/index.mjs']) {
    if (!spec) continue;
    try { return await import(spec.startsWith('/') ? pathToFileURL(spec).href : spec); } catch { /* next */ }
  }
  throw new Error('Playwright is not installed: npm i -g playwright, or set PLAYWRIGHT_MODULE');
}

async function main() {
  const resume = JSON.parse(readFileSync(join(root, 'resume/resume-content.json'), 'utf8'));
  const counts = encodeURIComponent(JSON.stringify(countsFrom(resume)));
  const { chromium } = await loadPlaywright();
  const out = join(root, 'assets/hero');
  mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const formats = [
    { fmt: 'wide', width: 1920, height: 1080, scale: 4 / 3 },
    { fmt: 'tall', width: 540, height: 1400, scale: 2 },
  ];
  for (const f of formats) {
    const page = await browser.newPage({ viewport: { width: f.width, height: f.height }, deviceScaleFactor: f.scale });
    for (const layer of ['surface', 'blueprint']) {
      await page.goto(`${pathToFileURL(join(here, 'hero_scene.html')).href}?layer=${layer}&fmt=${f.fmt}&counts=${counts}`);
      await page.waitForSelector('body[data-ready="1"]');
      await page.waitForTimeout(150);
      const file = join(out, `${layer}-${f.fmt}.jpg`);
      await page.screenshot({ path: file, type: 'jpeg', quality: 80 });
      console.log(file);
    }
    await page.close();
  }
  await browser.close();
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
