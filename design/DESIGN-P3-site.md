> **Operator model:** The reader is a non-technical goal-bringer. Plain English, no unexplained jargon.

# P3 DESIGN record — résumé / portfolio site

Date: 2026-09-24 · Route: Showcase / persuade · Stack: inherited static HTML, CSS, and JavaScript.

## Design read

Recruiters and hiring managers need an editorial scan from established public work to ten clearly bounded project pages, dated evidence, a project-only résumé, and one public contact route. The site retains the brief’s identity verbatim: **“Swiss editorial portfolio crossed with a dark digital bandit.”** It keeps the existing Catppuccin Mocha tokens, system/local sans typography, mono only for short metadata, the inherited bandit mark/poster, and the established dotz/Sophos illustrations.

## Layout and task flows

- Home: type-led left copy with the local static poster; established dotz and Sophos case studies; three grouped links to all ten individual suite pages; six dated public-source evidence summaries; a short résumé/skills preview; and GitHub contact.
- Résumé: selected public projects, ten separate WIP workflow references, dated public-data slices, source limitations, evidence-backed skills, and the one-page PDF. It is explicitly a project résumé, not a complete biography.
- Each suite page: project need, recorded slice or honest absence, separate `Source`, `Full job`, and `AI UNVERIFIED` text states, dated source evidence, limitation, human handoff, and only the approved public app-code path.
- Motion: only the inherited one-time dotz reveal remains; the page hero is a local static poster. The heavy local video is not requested on page load. Reduced-motion users receive static final content.

## Token and legibility decisions

The inherited token values are unchanged: `--color-crust #11111b`; `--color-base #1e1e2e`; `--color-mantle #181825`; `--color-surface-0 #313244`; `--color-surface-1 #45475a`; `--color-overlay #6c7086`; `--color-subtext #a6adc8`; `--color-text #cdd6f4`; `--color-accent #cba6f7`; `--color-accent-dim #b4befe`; `--color-cta-fg #11111b`; `--color-cta-bg #cba6f7`; `--color-focus #cba6f7`.

Measured from these hex values: subtext on base is 7.37:1, mauve on base 8.07:1, filled CTA foreground/background 9.23:1, and overlay on base only 3.36:1 (overlay on mantle 3.59:1). Small footer and contact-meta copy therefore uses the existing higher-contrast `--color-subtext`; the original overlay token remains untouched for decorative use. This is a narrow legibility adjustment, not a new palette.

## Interaction and accessibility intent

- Native links and buttons; skip link; visible focus ring; responsive navigation with `aria-expanded`, Escape-to-close, and focus return; no hover-only content.
- Project status is written in text and never communicated by color alone. Source and full-job states remain separate; AI remains `AI UNVERIFIED pending independent witness`.
- Internal evidence links are grouped as 44px-minimum touch targets; header, PDF buttons, project code, and case-study navigation meet the same target. Text wraps for long IDs at narrow widths.
- Color pairs above were measured by a local contrast calculation. This record is a design rationale, **not** a WCAG conformance claim. Browser keyboard, 200% zoom, automated accessibility, 390px/1440px visual checks, and performance measurements remain lead-owned.

## Link and asset boundaries

The only external destinations are the approved public GitHub profile and repositories, the exact recorded public source/terms links, and the ten suite app paths pinned to `industry-ai-suite/tree/a4c1bd3125dce543e75e0d140c487ecb1e4df37f/apps/<slug>`. No stale SearchLift page URL, local receipt, private path, remote font, remote script, remote stylesheet, external media runtime, or background source fetch is used. The dotz and Sophos artwork is captioned as editorial illustration, not a product screenshot.
