# Cayleb’s résumé polish candidate

Canonical website: https://cayleb-james2008.github.io/agentic-resume/

This checkout is an unpublished candidate on `polish/hiring-panel-20261012`. It preserves the approved character-led design, projects, story records, artwork and layout. A single root overflow rule contains the existing mobile character canvas. Small copy changes distinguish documented independent development from proposed assistant implementation, workflow automation and business support. Employee onboarding is a proposed use case.

Explore retains three explicitly fictional workdays. Professional presents the concise résumé. Direct résumé links and `resume.html` select Professional when JavaScript is available; ordinary `#resume` anchors remain usable without JavaScript. Mofu, Pip, Folio and Loam keep the approved frame packs and interactions.

The candidate downloads are `Cayleb-James-polished-one-page.pdf`, `Cayleb-James-polished-resume.pdf` and their UTF-8 `.txt` equivalents. Both PDFs use a single reading column and body type of at least 10 points. `resume/resume-content.json` generates their copy, Markdown, text and HTML fragments. `resume/candidate-verification.json` records source/artifact hashes and extraction checks; it is not user approval or a predictive ATS score.

Project evidence and PR statuses remain the October 5, 2026 snapshot. No project checks were rerun for this polish. Work history and education are self-reported. Local examples are synthetic demonstrations; all ten full workflows remain UNVERIFIED. No production customer outcome, onboarding delivery or ROI is claimed.

## Build and validate

No installation is required. Fonts, character assets and motion libraries are local. The candidate PDF builder defaults to the installed bundled Python with ReportLab; `PYTHON` can select another existing interpreter.

```sh
bash resume/build.sh
python3 scripts/build-remake.py
node --test tests/*.test.js
python3 scripts/check-release.py
```

The website builder generates candidate fragments with system Python without importing ReportLab. `--content-only` is available for text/HTML generation. Full PDF generation validates all source records in both default and layout text extraction, section and job/date ordering, size and page counts. The detailed PDF is at most two pages; the short PDF is exactly one page.

The reviewed project/story inputs stay in `remake/project-source.html` and `remake/reading-source.html`. `stage/incumbent-resume-source.html` remains the historical layout/copy template; the site embeds generated `resume/candidate-fragment.html`. GSAP, Lenis, React/ReactDOM, React Bits GlassSurface and Aether source/license notices remain in place. React loads only when Mofu’s guide opens.

## Candidate and rollback boundary

No push or deployment is authorized for this candidate. `release.json` describes the historical approved v8 release, not these edits. The historical PDFs `Cayleb-James-one-page-resume.pdf` and `Cayleb-James-resume.pdf`, their `resume/approved-verification.json` manifest, and the historical DOCX remain unchanged. Release validation checks those approved hashes as well as the separate candidate outputs. The approved original checkout and frozen source remain available outside this worktree.

## Refraction motion pass (2026-10-12)

Branch `design/refraction-motion-20261012` layers decorative motion on the approved homepage without changing copy, evidence, routes or character frames. Mofu is treated as a glass lens: a dotted light path runs from "Your work" into Mofu, leaves as a sky/mauve/peach spectrum toward "A useful draft", and arcs under Mofu to "Your decision". Pulses ride the existing 8-second ambient clock, so pause, reduced motion, offscreen pausing and Professional mode behave as before.

- `remake/refraction.js` and `remake/refraction.css` hold the pass; `scripts/enhance-refraction.py` injects its aria-hidden layers during `python3 scripts/build-remake.py`.
- Page load: the headline resolves into focus, Mofu settles, then the path and chips appear. Skipped for reduced motion, Professional mode, paused motion and deep links; a CSS failsafe reveals everything if the script never runs.
- Story: records turn over like glass cards, the check beat sweeps light across them, the decision pill fills, approval glows once, a single thumb slides between steps, and each assistant's aura shifts colour.
- Projects: one highlight follows the hovered or focused row.
- Optional Higgsfield plate: `assets/motion/higgsfield-clips.json` and `design/HIGGSFIELD-SHOTS.md`. No clip is installed; the page is unchanged until one is.
