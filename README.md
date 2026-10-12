# Cayleb Alvarez-James — résumé site

Canonical website: https://cayleb-james2008.github.io/agentic-resume/

Cayleb is an AI workflow integrator: he shadows people for a couple of days to learn how they actually work, builds each of them a personal AI agent that fits their day, teaches them to use it well, and then does the same across the whole company.

## What's here

- `index.html`: the homepage, generated from `site/content.json`. It has five blocks: the hero (name, a 3D-styled character of Cayleb with a headset), how he works (Shadow → Understand → Build → Teach → whole company), work experience, selected projects and contact.
- `resume.html`: the plain résumé page. It uses the same masthead, the generated `resume/candidate-fragment.html` and a print stylesheet.
- `projects/*.html` and `lab/`: the project write-ups and the local workflow lab. These are unchanged.
- `Cayleb-James-polished-one-page.pdf` and `Cayleb-James-polished-resume.pdf` are the downloads, along with their UTF-8 `.txt` equivalents. `resume/resume-content.json` generates their copy, Markdown, text and HTML fragment. `resume/candidate-verification.json` records the source and artifact hashes. It is not a user approval or an ATS score.

Project evidence and PR statuses are an October 5, 2026 snapshot. Work history and education are self-reported. Local examples are synthetic demonstrations; all ten full workflows remain UNVERIFIED. The Industry AI Suite workflows are always called recorded demos, never "working" workflows. No production customer outcome, onboarding delivery or ROI is claimed. EvoHedge and Maki are private and still in development.

## Build and validate

No install is needed to view the site. three.js 0.185.0, Lenis 1.3.26, Oswald and Space Grotesk are all vendored, so the page makes no third-party requests.

```sh
python3 scripts/build-home.py           # index.html + resume.html from site/content.json
node --test tests/*.test.js
python3 -m unittest discover -s tests/py
python3 scripts/check-release.py
```

`build-home.py` refuses to build if a string in `content.json` is longer than the frame it sits in (`site/content-limits.json`).

`check-release.py` does three things:
- checks every local link on both pages;
- runs `scripts/home/check_assets.py` in its non-strict mode;
- re-verifies the PDF and text outputs against `resume/build_resume.py`.

`python3 scripts/home/check_assets.py --strict` is the ship gate for imagery. It fails while any placeholder listed in `assets/home/PLACEHOLDERS.json` is still on the page.

Imagery lives under `assets/home/`. Every generated illustration has an `alt` beginning "Illustration:", and its provenance is recorded in `assets/home/PROVENANCE.md`. Hero depth, normal and veil maps are derived from the portrait by `scripts/home/person_maps.py`.

To rebuild the candidate PDFs: `bash resume/build.sh`. It uses ReportLab; `PYTHON` can select another interpreter.

## History

The layout, motion and engine are adapted from a third-party "recreate this site" spec. That spec is kept locally and git-ignored. None of its racing imagery, names or assets are used. The classic character-led homepage (Mofu, Pip, Folio, Loam) is recoverable at commit `2732c2f`. The earlier public résumé is recoverable at `476bb5623ef8b438028031faf86c55ff4520c090`. `release.json` describes that historical v8 release, and the historical PDFs and `resume/approved-verification.json` remain unchanged.
