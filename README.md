# Cayleb Alvarez-James — résumé site

Canonical website: https://cayleb-james2008.github.io/agentic-resume/

The role Cayleb is going for is Forward Thinking Engineer: he learns how a role really works, then finds where AI fits. It saves time and raises quality, in any field. Ergon, one of his builds, gives each employee a personal assistant. The homepage gives its price as about $100 a person a month.

## What's here

- `index.html`: the homepage, generated from `site/content.json` and `resume/resume-content.json`. It has two halves and a contact footer. The first half is the water story: a scroll-driven intro where one calm body of water takes the shape of a moving crew, an office and a shop, branches into an assistant for every employee (Ergon), shows how a problem climbs from Agent to Senior agent to Person, and ends on the price. It is a few plain words at a time, top left. The second half is the official résumé: the two PDFs at its head, then experience (with the other jobs shown as work ethic), projects with Ergon first, and education and skills. The contact footer has the email, GitHub and the downloads. With scripts off, motion reduced or no WebGL, the story is a plain stack of blocks and reads the same. There is no picture of Cayleb anywhere on the site.
- `resume.html`: the plain résumé page. It uses the same masthead, the generated `resume/candidate-fragment.html` and a print stylesheet.
- `projects/*.html` and `lab/`: the project write-ups (the five featured projects and ten suite workflows) and the recorded workflow lab. `scripts/build-subpages.py` gives them the homepage's masthead, footer and look (`site/css/subpage.css`, `lab/lab.css`); the lab's app and historical receipts are preserved.
- `Cayleb-James-polished-one-page.pdf` and `Cayleb-James-polished-resume.pdf` are the downloads, along with their UTF-8 `.txt` equivalents. `resume/resume-content.json` generates their copy, Markdown, text and HTML fragment. `resume/candidate-verification.json` records the source, artifact hashes and local build checks; it does not claim independent employment verification or an ATS score.

Engineering evidence and project copy are updated from the October 13 implementation work. The current featured projects are Ergon, dotz, Sophos, Industry AI Suite and Asmodeus. Sophos PR #20 merged at `33559fc`; final hosted checks passed, including 1,224 interface tests, 82 Node tests, 56/56 Windows checks, all 8 automated interface suites (59 assertions, two keyboard skips) and a 7/7 fresh-profile smoke. The interface suite used a simulated connection; clean installation of the source-head MSI and live model inference remain unverified. Work history and education remain self-reported. The hosted lab retains its dated recorded receipts; project pages separate source checks from native installation, live providers and customer outcomes. Private projects publish sanitized case studies only.

## Build and validate

No install is needed to view the site. three.js 0.185.0, Lenis 1.3.26, Oswald and Space Grotesk are all vendored, so the page makes no third-party requests.

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

Every page carries a canonical address and Open Graph/Twitter tags (`scripts/home/templates/social.py`) pointing at one share card, `assets/og/card.png`, drawn by `python3 scripts/home/make_share_card.py` from type and water: his name, the title, the headline and a line of ink water. `404.html` is served by GitHub Pages for any missing path; it resolves its links through `<base>`, so it works at any depth. `sitemap.xml` is for submitting to a search console by hand (a project site's `robots.txt` is never read).

To rebuild the résumé PDFs: `bash resume/build.sh`. It uses ReportLab; `PYTHON` can select another interpreter.

## History

The layout, motion and engine are adapted from a third-party "recreate this site" spec. That spec is kept locally and git-ignored. None of its racing imagery, names or assets are used. The illustrated, character-led homepage is recoverable at commit `cbdd73c`. The classic character-led homepage (Mofu, Pip, Folio, Loam) is recoverable at commit `2732c2f`. The earlier public résumé is recoverable at `476bb5623ef8b438028031faf86c55ff4520c090`. `release.json` describes that historical v8 release, and the historical PDFs and `resume/approved-verification.json` remain unchanged.
