# Cayleb Alvarez-James — résumé site

Canonical website: https://cayleb-james2008.github.io/agentic-resume/

The role Cayleb is going for is Forward Thinking Engineer: he shadows people for a couple of days to learn how they actually work, builds each of them a personal AI agent that fits their day, plus custom tools for anything digital the company wants automated, teaches them to use it well, and then does the same across the whole company.

## What's here

- `index.html`: the homepage, generated from `site/content.json`. It has five blocks: the hero (name, Cayleb as a Pixar-style 3D character, and his glass-droplet AI agent), how he works (Shadow → Understand → Build → Teach → whole company), work experience, selected projects, "Worth it" (the full systems he builds for a moving company, a plaster and pool crew and a shop, against how the work is done today, each with the money lost a month before and after and the yearly saving) and contact. Copy is deliberately short and plain.
- `resume.html`: the plain résumé page. It uses the same masthead, the generated `resume/candidate-fragment.html` and a print stylesheet.
- `projects/*.html` and `lab/`: the project write-ups (the five featured projects and ten suite workflows) and the recorded workflow lab. `scripts/build-subpages.py` gives them the homepage's masthead, footer and look (`site/css/subpage.css`, `lab/lab.css`); the lab's app and historical receipts are preserved.
- `Cayleb-James-polished-one-page.pdf` and `Cayleb-James-polished-resume.pdf` are the downloads, along with their UTF-8 `.txt` equivalents. `resume/resume-content.json` generates their copy, Markdown, text and HTML fragment. `resume/candidate-verification.json` records the source and artifact hashes. It is not a user approval or an ATS score.

Engineering evidence and project copy are updated from the October 13 implementation work. The current featured projects are Ergon, dotz, Sophos, Industry AI Suite and Asmodeus. Work history and education remain self-reported. The hosted lab retains its dated recorded receipts; project pages separate source checks from native installation, live providers and customer outcomes. Private projects publish sanitized case studies only.

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

`check-release.py` does three things:
- checks every local link on the homepage, the résumé page, the 404 page, the lab and every project page;
- runs `scripts/home/check_assets.py` in its non-strict mode;
- re-verifies the PDF and text outputs against `resume/build_resume.py`.

`python3 scripts/home/check_assets.py --strict` is the ship gate for imagery. It fails while any placeholder listed in `assets/home/PLACEHOLDERS.json` is still on the page.

Every page carries a canonical address and Open Graph/Twitter tags (`scripts/home/templates/social.py`) pointing at one share card, `assets/og/card.png`, drawn by `python3 scripts/home/make_share_card.py` from the hero maps. `404.html` is served by GitHub Pages for any missing path; it resolves its links through `<base>`, so it works at any depth. `sitemap.xml` is for submitting to a search console by hand (a project site's `robots.txt` is never read).

Imagery lives under `assets/home/`. Every image is an AI-generated illustration of Cayleb, its `alt` begins "Illustration:", and its provenance is recorded in `assets/home/PROVENANCE.md`. `scripts/home/derive_scenes.py` cuts the hero, projects and contact frames out of his scenes. Hero depth, normal and veil maps are derived from the portrait by `scripts/home/person_maps.py`. `scripts/home/make_plate_sizes.py` writes a 960px copy of each timeline plate, which the page offers through `srcset`.

To rebuild the candidate PDFs: `bash resume/build.sh`. It uses ReportLab; `PYTHON` can select another interpreter.

## History

The layout, motion and engine are adapted from a third-party "recreate this site" spec. That spec is kept locally and git-ignored. None of its racing imagery, names or assets are used. The classic character-led homepage (Mofu, Pip, Folio, Loam) is recoverable at commit `2732c2f`. The earlier public résumé is recoverable at `476bb5623ef8b438028031faf86c55ff4520c090`. `release.json` describes that historical v8 release, and the historical PDFs and `resume/approved-verification.json` remain unchanged.
