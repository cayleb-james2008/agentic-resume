> **Operator model:** plain English. This file describes the current visual system; Cayleb's final visual preference remains his choice.

# Portfolio design — monochrome evidence dossier

**Status:** Implemented dark redesign of the public portfolio, case pages, résumé site, and recorded lab. Screenshots and a local review sheet accompany the release; this document does not claim personal approval or complete WCAG conformance.

## Direction

The work is presented as a technical dossier for hiring reviewers. A near-black canvas, white reading type, cool-gray evidence panels, and a restrained ice-blue edge give it a holographic feel while keeping source trails and status words legible. The former cool-light vermilion inspection-record look is superseded.

The home page retains its useful order: first-viewport lab access and proof index, established dotz and Sophos work, ten bounded suite journeys, dated public-source evidence, project résumé, and GitHub contact. Case pages keep a document-like rhythm. The lab keeps its workflow rail and source→result→human handoff. A reviewer should not have to decode color to distinguish verified sources, witnessed model samples, and unverified full jobs.

## Implemented system

| Token | Value | Role |
|---|---|---|
| `--page` | `#090C10` | Near-black canvas |
| `--surface` | `#141A21` | Reading surface |
| `--soft` | `#1A222B` | Raised fields |
| `--ink` | `#F4F7FA` | Primary text |
| `--muted` | `#B5C0CA` | Supporting text |
| `--rule` | `#46515D` | Boundaries and dividers |
| `--signal` | `#A9DCEC` | Links, focus-adjacent highlights, evidence edge |
| `--focus` | `#E8EFF4` | Keyboard focus |

- **Type:** locally available sans stack for display/body and monospace only for source IDs and status. The original content metrics stay readable; no remote font request is added.
- **Layout:** asymmetrical wide hero, stacked phone reading order, 44px controls, no hidden evidence status. Existing illustrations are shown in grayscale and remain explicitly editorial illustrations rather than product screenshots.
- **Depth:** a faint technical grid and restrained spectral border in the hero, quiet lifted lab panels, and cool gray rules. No new raster or external design library is needed.
- **Motion:** one short hero/header edge reveal and 150ms control feedback. `prefers-reduced-motion` removes these effects. No continuous animation.
- **PDF:** a white print companion with charcoal type and monochrome underlined links. It stays one page with extractable text and avoids an ink-heavy dark résumé for employer forms.

Measured base contrast ratios are recorded in `design/jobs/agentic-resume-dark-20260926/01-art-direction/direction.md` under `/home/cayleb/Work`. The palette ratios are design checks, not a blanket accessibility certification.

## Truth and review boundaries

- The public case studies are dotz and Sophos. Their public repository evidence and credit limits stay explicit.
- All ten full enterprise jobs remain `UNVERIFIED`. Five bounded local model sentences have independent transport witnesses, citations, and human public-source review. The [witness bundle](https://github.com/cayleb-james2008/industry-ai-suite/tree/main/evidence/ai-witness-20260926) keeps that scope explicit.
- SearchLift has a bounded, read-only **dated** Pages read (`clean-clone-live.json`, retrieved `2026-09-25T19:43:45Z`; source SHA-256 `b4ed4de9f785a5059acde72c7660d6c20351d8409915c6323a252836b3001c88`): one captured page contained 10/10 approved workflow names. This is not SEO, ranking, traffic, or whole-site evidence.
- No new biography, employment, education, customer, income, adoption, deployment, or AI-completion claim is introduced.
- The local grading surface is a separate offline artifact. Its Approve/Redo controls record Cayleb's visual choices and do not submit a job application.
