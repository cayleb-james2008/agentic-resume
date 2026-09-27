# agentic-resume

Selected-work portfolio for **Cayleb Alvarez-James** (`cayleb-james2008`), focused on remote-only software engineering and applied AI roles.

Recruiter contact: [caylebalvarezjames@gmail.com](mailto:caylebalvarezjames@gmail.com).

## Current public portfolio (GitHub Pages)

- [Live home](https://cayleb-james2008.github.io/agentic-resume/)
- [Project résumé](https://cayleb-james2008.github.io/agentic-resume/resume.html)
- [One-page PDF](https://cayleb-james2008.github.io/agentic-resume/Cayleb-James-resume.pdf)
- [Interactive recorded lab](https://cayleb-james2008.github.io/agentic-resume/lab/)

GitHub Pages is the public destination for this dark, near-monochrome application portfolio. The suite offers ten working local review paths, and the hosted lab replays bounded results from all ten. Five include source-cited local model samples with independently witnessed calls. Company deployments and customer outcomes are not claimed. The older Vercel deployment is stale and is not the current portfolio link.

## Preview (local)

```bash
# Run from the repository root.
npm ci
npm run build:assets
python3 -m http.server 8765
# open the local loopback preview on port 8765
```

The visual layer uses self-hosted IBM Plex fonts, Anime.js 4.5.0 for brief entrance motion, and Web Awesome 3.14.0 for the résumé evidence disclosures and email-copy control. The build copies license notices into `assets/licenses/`; it needs no CDN or hosted font service. `index.html`, `resume.html`, and the case studies still contain their reading content if JavaScript fails. The recorded lab keeps its existing rendering and evidence behavior.

If the one-page PDF changes, run `bash scripts/build-resume-preview.sh` after rebuilding the PDF. The résumé page displays this image as a preview of the actual PDF. Its PDF links and the document itself remain the authoritative copy.

The portfolio lives at repo root (`index.html`, `resume.html`, `css/`, `js/`, `projects/`, `lab/`). Its established public case-study pages are dotz and Sophos; ten separate Industry AI Suite project pages describe the workflows and their evidence. The hosted lab replays dated receipts and performs no fresh source request. Its dark stylesheet is exported from the suite repository, so future receipt exports preserve the visual system. The suite repository contains a local workbench for fresh public data and permitted, de-identified input.

## Résumé and evidence

- Source: `resume/resume.md`. The PDF keeps a white print ground with monochrome type and links; the web résumé uses the dark site theme.
- Build: install `resume/requirements.txt`, then run `PYTHON=python3 bash resume/build.sh` with that interpreter. The script writes the one-page `Cayleb-James-resume.pdf` at the repository root and fails if text, links, or page count do not meet its checks.
- Seven dated public-data slices are documented with source identity, source-as-of value, retrieval time, terms, evidence links, and limits. The labeled synthetic ReplyCraft public-policy question reuses the GovInfo text and is not an additional source record; these are dated records, not live widgets.
- The ten local workflows accept public-source or permitted, de-identified input; ChainWatch's local EVM review uses supplied observations, while its hosted result is a labelled example with no live chain feed. Five source-cited local model samples have independently witnessed request/response exchanges. The witness proves execution, the app validator checks citations, and human review checked these five narrow public-source statements. No revenue, customer, adoption, or company-deployment result is claimed.
- The [public suite repository](https://github.com/cayleb-james2008/industry-ai-suite) and [witness bundle](https://github.com/cayleb-james2008/industry-ai-suite/tree/main/evidence/ai-witness-20260926) are linked from the site and project résumé.

Historical local asset record (superseded visual direction): see `assets/BRAND-LOCK.md`.

Before claiming a release, compare live Pages bytes with the exact committed files and verify all ten lab routes.
