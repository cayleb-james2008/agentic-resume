> **Operator model:** plain English; this design proposal is not operator approval.

# Portfolio design — civic works-record field guide

**Status:** Local design candidate, pending operator grading. The current public site still shows the old look. This replacement is **not approved and not published**. This document records a design direction; it does not claim accessibility conformance or user approval.

**Candidate fingerprint:** `eabd85f161341c0c268038ad47ac20bba61648f26939e1900c2c5f3a54d81c33` (local candidate diff + brief identity used by the review surface).

## Six-block direction

### THESIS

A portfolio that routes a reviewer from inspectable public work to ten plainly marked WIP workflows. Refuse the dark bandit/reel shell, generic SaaS cards, and any visual that makes a source slice look like a completed job.

### OWN-WORLD

Municipal works-order inspection-record grammar: cool-light ground, deep blue-charcoal text, one vermilion signal, system sans typography, labeled evidence/limit/handoff fields. Abstract the record structure; do not impersonate a government form or invent ticket data.

### STORY

The visitor sees two public case studies, then the ten in-progress workflows and their evidence boundaries, then the project résumé or GitHub contact. Source verification never stands in for job or AI verification.

### FIRST VIEWPORT

At 1440px, use a compact single-line header and asymmetrical 12-column 7/5 split. The left is a large vermilion portfolio field with “Security-first systems work.”, concise evidence-led copy, “Inspect public work” and “Project résumé” actions. The right is a cool-light, divided text index: dotz and Sophos public case-study/repository proof, then “10 workflows · WIP · INCOMPLETE”, “Full job · UNVERIFIED”, and “AI · UNVERIFIED”. Keep source status distinct from job and AI status. At 390px, stack in that order without hiding links or status.

### FORM

Use the assigned municipal works-order inspection-tag world, seed `a8dcc35e`, index 3 of the director’s ranked seven. None of the six named challengers wins on both audience identification and truthful proof clarity; retain their useful disciplines only, not their visual treatments. The inspection-record grammar is a navigation and evidence structure, not a claim that this is a municipal service.

### FINISH

“unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance”

## Implemented visual system

| Token | Value | Role |
|---|---|---|
| `--page` | `#F3F6F8` | Cool-light page ground |
| `--surface` | `#FFFFFF` | Reading surface |
| `--soft` | `#E7EEF2` | Secondary section field |
| `--ink` | `#172B3A` | Main text |
| `--muted` | `#4B5D69` | Supporting text |
| `--rule` | `#C5D0D8` | Dividers |
| `--signal` | `#B6422A` | Single vermilion field, links, and markers |
| `--signal-ink` | `#FFFFFF` | Text on vermilion |
| `--focus` | `#123F70` | Focus on light ground; white outline on vermilion |

- **Type:** local system sans stack for display/body; metadata-only monospace stack. Hero `clamp(3rem, 6vw, 5rem)`, H2 `clamp(2rem, 3vw, 2.75rem)`, body `1.0625rem`, metadata minimum `0.8125rem`; no serif or remote font.
- **Rhythm and shape:** `4, 8, 16, 24, 40, 64, 96px`; square corners; one level of evidence fields rather than nested cards; controls target at least 44px.
- **Motion:** content stays static. Only brief underline/border feedback is needed; reduce nonessential motion when requested.
- **Layout:** asymmetrical 7/5 split at wide viewports, then a single reading order on phone. Public proof and WIP status remain separate, with text labels rather than color alone.

These values document the candidate direction. They are not a measured WCAG result or a conformance claim.

## Truth and review boundaries

- The public case studies are dotz and Sophos. Their public repository evidence and credit limits stay explicit.
- All ten Industry AI Suite workflows remain `WIP · INCOMPLETE`; every full job remains `UNVERIFIED`; AI remains `UNVERIFIED`. Source status is kept separate from job and AI status.
- No new biography, employment, education, customer, income, adoption, deployment, or AI-completion claim is introduced.
- The local grading surface is a separate offline artifact. Its Approve/Redo controls record local review choices only; they do not authorize a release or publish anything.
- The existing public site still has the old look. This candidate remains local, unapproved, and unpublished until the operator reviews this exact revision.
