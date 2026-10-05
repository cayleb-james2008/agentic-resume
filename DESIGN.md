> **Operator model:** plain English. This file describes the approved dark visual system and its current copy rules.

# Portfolio design — monochrome evidence dossier

**Status:** Approved dark direction with a September 2026 typography and component refinement across the portfolio, case pages, suite overview, and web résumé. The recorded lab retains its established styling. This document does not claim complete WCAG conformance.

## Direction

The work is presented as a technical dossier for hiring reviewers. A near-black canvas, white reading type, cool-gray evidence panels, and a restrained ice-blue edge give it a holographic feel while keeping source trails and scope notes legible. The former cool-light vermilion inspection-record look is superseded.

The home page retains its useful order: first-viewport lab access and proof index, featured dotz and Sophos work, the Industry AI Suite overview and ten local workflows, dated public-source evidence, project résumé, and direct email contact. Homepage evidence details are collapsed until requested; every date, source link, and response hash remains in the page, while all ten lab receipts remain untouched. Case pages keep a document-like rhythm. The lab keeps its workflow rail and source→result→human handoff. Visitor-facing copy names what works and states what private data or approval is still needed; dated receipts retain technical status fields.

## Implemented portfolio and résumé layer

| Token | Value | Role |
|---|---|---|
| `--page` | `#080D12` | Near-black canvas |
| `--surface` | `#111B24` | Reading surface |
| `--soft` | `#18242D` | Raised fields |
| `--ink` | `#F2F7F9` | Primary text |
| `--muted` | `#BCCAD0` | Supporting text |
| `--rule` | `#405663` | Boundaries and dividers |
| `--signal` | `#A9DDEC` | Links, focus-adjacent highlights, evidence edge |
| `--focus` | `#E8EFF4` | Keyboard focus |

- **Type:** self-hosted IBM Plex Sans for headlines and reading, IBM Plex Mono for source IDs and compact evidence facts. No remote font request is added.
- **Layout:** a shorter asymmetrical hero puts the proof index and next section closer to the first screen; the phone layout stacks the same reading order. Existing illustrations remain grayscale and explicitly labeled as editorial rather than product screenshots.
- **Depth:** graphite reading planes, fine cool-gray rules, and one pale-blue accent line. The site does not simulate a dashboard or invent product imagery.
- **Components:** Web Awesome 3.14.0 supplies keyboard-operable disclosures for the web résumé's six dated source notes and a copy-email control. Both components are bundled locally. The home page uses native keyboard-operable disclosures for long-form public-source records. The original source notes remain in HTML if scripts fail.
- **Motion:** Anime.js 4.5.0 adds a brief title and proof-index entrance. A timed finish prevents a paused browser animation from leaving content dimmed. `prefers-reduced-motion` skips the entrance, and disclosures open without a transition under that preference.
- **PDF:** the original white, one-page print companion remains the authoritative downloadable file. The web résumé shows a small preview rendered from that PDF; it must be regenerated when the PDF changes.

Measured base contrast ratios are recorded in `design/jobs/agentic-resume-dark-20260926/01-art-direction/direction.md` under `/home/cayleb/Work`. The palette ratios are design checks, not a blanket accessibility certification.

## Truth and review boundaries

- The public case studies are dotz and Sophos. Their public repository evidence and credit limits stay explicit.
- Ten local review paths are available; no company deployment or customer outcome is shown. Five bounded local model sentences have independent transport witnesses, citations, and human public-source review. The [witness bundle](https://github.com/cayleb-james2008/industry-ai-suite/tree/main/evidence/ai-witness-20260926) keeps that scope explicit.
- SearchLift has a bounded, read-only **dated** Pages read (`clean-clone-live.json`, retrieved `2026-09-25T19:43:45Z`; source SHA-256 `b4ed4de9f785a5059acde72c7660d6c20351d8409915c6323a252836b3001c88`): one captured page contained 10/10 approved workflow names. This is not SEO, ranking, traffic, or whole-site evidence.
- No new biography, employment, education, customer, income, adoption, deployment, or AI-completion claim is introduced.
- The local grading surface is a separate offline artifact. Its Approve/Redo controls record Cayleb's visual choices and do not submit a job application.
