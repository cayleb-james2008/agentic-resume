import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => readFileSync(path.join(root, relative), "utf8");
const home = read("index.html");
const mainScript = read("js/main.js");

const primaryProjects = [
  "projects/dotz.html",
  "projects/sophos.html",
  "projects/industry-ai-suite.html",
];

test("skip link moves keyboard focus into main content", () => {
  assert.match(mainScript, /querySelectorAll\([\"']a\.skip-link[\"']\)/);
  assert.match(mainScript, /focusDestination\(destination\)/);
});

test("home page exposes the three primary project case studies", () => {
  for (const route of primaryProjects) {
    assert.ok(home.includes(`href=\"${route}\"`), `homepage should link to ${route}`);
  }
});

test("home page puts the existing project PDF within the hero actions", () => {
  const actions = home.match(/<div class=\"hero__actions\">([\s\S]*?)<\/div>/)?.[1] ?? "";
  assert.match(actions, /href=\"Cayleb-James-resume\.pdf\"[^>]*download/);
  assert.match(actions, /Download[^<]*PDF/i);
  assert.ok(existsSync(path.join(root, "Cayleb-James-resume.pdf")));
});

test("current PDF links stay intact and replacement touchpoints are documented", () => {
  const pdfPages = [
    ["index.html", 2],
    ["resume.html", 2],
    ["projects/dotz.html", 1],
    ["projects/sophos.html", 1],
    ["projects/industry-ai-suite.html", 1],
  ];
  const links = pdfPages.map(([route, expected]) => {
    const page = read(route);
    const count = (page.match(/href=\"(?:\.\.\/)?Cayleb-James-resume\.pdf\"/g) ?? []).length;
    assert.equal(count, expected, `${route} should keep ${expected} current PDF link(s)`);
    return count;
  });
  assert.equal(links.reduce((total, count) => total + count, 0), 7);

  const product = read("PRODUCT.md");
  for (const path of pdfPages.map(([route]) => route).concat("README.md", "assets/img/resume-preview.webp", "scripts/build-resume-preview.sh")) {
    assert.ok(product.includes(`\`${path}\``), `PRODUCT.md should document ${path}`);
  }
  assert.match(product, /Parent supplied the independently reviewed résumé PDF/);
});

test("primary case studies explain the work, a try path, proof, credit, and limits", () => {
  for (const route of primaryProjects) {
    const page = read(route);
    for (const heading of ["What it does", "How to try it", "Source proof", "Credit and limits"]) {
      assert.ok(page.includes(`<h2>${heading}</h2>`), `${route} needs a ${heading} section`);
    }
  }
});

test("homepage retains long-form public evidence behind native disclosures", () => {
  assert.match(home, /<details class=\"home-evidence-details\">/);
  assert.match(home, /<summary>[\s\S]*?recorded/i);
  assert.ok(home.includes("bde7791b9c12c297dd1c05af620f3618951e5c02b8d20e66a087bb0768f059af"));
  assert.ok(home.includes("b4ed4de9f785a5059acde72c7660d6c20351d8409915c6323a252836b3001c88"));
});

test("suite overview points to recorded lab, source repository, and witness evidence", () => {
  const page = read("projects/industry-ai-suite.html");
  assert.match(page, /\.\.\/lab\//);
  assert.match(page, /github\.com\/cayleb-james2008\/industry-ai-suite/);
  assert.match(page, /evidence\/ai-witness-20260926/);
  assert.match(page, /2026-09-26/);
  assert.match(page, /UNVERIFIED/);
});
