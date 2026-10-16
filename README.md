# Cayleb Alvarez-James — résumé site

Canonical website: https://cayleb-james2008.github.io/agentic-resume/

The role Cayleb is going for is Forward Thinking Engineer: he comes into a business, learns how the team works, and builds AI around it — AI employees, workflows and automations on the apps they already use. Ergon, one of his builds, gives each employee a personal assistant, managed remotely. The homepage gives its price as about $100 a person a month.

## What's here

- `index.html`: the homepage, generated from `site/content.json` and `resume/resume-content.json`. It speaks to two readers at once: people hiring an engineer, and teams who want AI to take busywork off their people. The look is called "Sign-off" (`DESIGN.md`):
  - the hero: the title, the headline "Show me how you work. I'll find where AI fits." across the page, one plain line, and **two doors**: "I'm hiring" (to the résumé) and "I run a team" (to Work with me);
  - beside them, **the Ask bar**: ask anything about Cayleb and get the answer he wrote, with where it comes from. It matches the question in the browser (`site/js/ask/match.js`): no model, no key, nothing sent anywhere. Without scripts, every question and answer is listed instead;
  - Built and tested: Ergon featured with its checklist and status, then dotz, Sophos, Industry AI Suite and Asmodeus with real screenshots and test counts. On a wide screen a preview frame follows the row you point at or tab to;
  - Work with me: Shadow, Map, Build, Teach, then the offers and one way to start (a composer that drafts an email and never claims to send one);
  - **Ergon's team graph**: a hub wired to five people, updates travelling down the wires, test tickets climbing Agent → Senior agent → Person, and a switch that reshapes the team (Office, Shop, Trades, Clinic);
  - the official résumé: the two PDFs and the track record at its head, then experience (with the other jobs shown as work ethic), projects with Ergon first, and education and skills;
  - the contact footer, with the address shown as text and a copy button.

  Light or dark follows the system. With scripts off or motion reduced, everything is visible and nothing moves. There is no picture of Cayleb anywhere on the site.
- `resume.html`: the plain résumé page. It uses the same masthead, the generated `resume/candidate-fragment.html` and a print stylesheet.
- `projects/*.html` and `lab/`: the project write-ups (the five featured projects and ten suite workflows) and the recorded workflow lab. `scripts/build-subpages.py` gives them the homepage's masthead, footer and look (`site/css/subpage.css`, `lab/lab.css`); the lab's app and historical receipts are preserved.
- `Cayleb-James-polished-one-page.pdf` and `Cayleb-James-polished-resume.pdf` are the downloads, along with their UTF-8 `.txt` equivalents. `resume/resume-content.json` generates their copy, Markdown, text and HTML fragment. `resume/candidate-verification.json` records the source, artifact hashes and local build checks; it does not claim independent employment verification or an ATS score.

Engineering evidence and project copy are updated from the October 13 implementation work. The current featured projects are Ergon, dotz, Sophos, Industry AI Suite and Asmodeus. Sophos PR #20 merged at `33559fc`; final hosted checks passed, including 1,224 interface tests, 82 Node tests, 56/56 Windows checks, all 8 automated interface suites (59 assertions, two keyboard skips) and a 7/7 fresh-profile smoke. The interface suite used a simulated connection; clean installation of the source-head MSI and live model inference remain unverified. Work history and education remain self-reported. The hosted lab retains its dated recorded receipts; project pages separate source checks from native installation, live providers and customer outcomes. Private projects publish sanitized case studies only.

## Build and validate

No install is needed to view the site. The one vendored file is the Mona Sans variable font (width and weight axes, OFL; `vendor/PROVENANCE.json` holds its source and hash). There is no script library, and the page makes no third-party requests.

```sh
python3 scripts/build-home.py           # index.html + resume.html from site/content.json
python3 scripts/build-subpages.py       # project pages and the lab (shared masthead, footer, styles), 404.html, sitemap.xml
node --test tests/*.test.js
python3 -m unittest discover -s tests/py
python3 scripts/check-release.py
```

`build-home.py` refuses to build if a string in `content.json` is longer than the frame it sits in (`site/content-limits.json`).

`check-release.py` does two things:
- checks that every local `href`, `src` and stylesheet `url()` on the homepage, the résumé page, the 404 page, the lab and every project page resolves;
- re-verifies the PDF and text outputs against `resume/build_resume.py`.

The Python tests in `tests/py` cover the share card script.

The pictures are committed, so the build never needs them regenerated. The only ones on the site are the work screenshots: `python3 scripts/home/prep_images.py <dir>` crops them from Cayleb's own repositories and writes their provenance to `assets/IMAGES.json`.

Every page carries a canonical address and Open Graph/Twitter tags (`scripts/home/templates/social.py`) pointing at one share card, `assets/og/card.png`, drawn by `python3 scripts/home/make_share_card.py` from type and one small figure: the wordmark, the title, the headline and the hero's Ask bar with its suggested questions (read from `site/content.json`). `404.html` is served by GitHub Pages for any missing path; it resolves its links through `<base>`, so it works at any depth. `sitemap.xml` is for submitting to a search console by hand (a project site's `robots.txt` is never read).

To rebuild the résumé PDFs: `bash resume/build.sh`. It uses ReportLab; `PYTHON` can select another interpreter.

## History

The current "Sign-off" look (2026-10-16) is an original design: its spec and plan are in `docs/superpowers/specs/2026-10-16-sign-off-design.md` and `docs/superpowers/plans/2026-10-16-sign-off.md`. The tech-studio homepage it replaces is recoverable at commit `851ba6c`; its layout was adapted from a third-party "recreate this site" spec for a studio page (2026-10-15), kept locally and git-ignored like the first one (2026-10-12), and none of its names, copy, marks, ratings, stats or images were used. The water-story homepage is recoverable at commit `b0763a3`. The illustrated, character-led homepage is recoverable at commit `cbdd73c`. The classic character-led homepage (Mofu, Pip, Folio, Loam) is recoverable at commit `2732c2f`. The earlier public résumé is recoverable at `476bb5623ef8b438028031faf86c55ff4520c090`. `release.json` describes that historical v8 release, and the historical PDFs and `resume/approved-verification.json` remain unchanged.
