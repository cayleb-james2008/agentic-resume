> **HISTORICAL / SUPERSEDED VISUAL DIRECTION — 2026-09-25:** This document records the former bandit/Catppuccin direction; the current local proposal (not yet operator-approved or live) is in [root `DESIGN.md`](../DESIGN.md). The original body and image/video files remain unchanged for historical provenance and are not displayed as the replacement identity. This notice changes no licence or factual claim.

# DESIGN v5 — Visual Gate Brief
**Role:** Visual Gate Brief Author (web-design-pipeline) · **Not** the UI builder  
**Date:** 2026-09-22 (America/New_York)  
**Authority:** `BRIEF-industry-ai-real-data.md` + `SITE-CRAFT-EVIDENCE-industry-ai-suite.md`
**Brand pivot (Cayleb, immediate):** **dark digital bandit** — clean, high-craft, premium. **Abandon** outline cyber-nomad / NOMAD.LINK as primary identity. Swiss negative space + typography-led hierarchy remain mandatory.

**Design read:** Hire-ready personal portfolio for technical hiring managers, with a Swiss-editorial + dark digital bandit language — mauve accent on Catppuccin-dark base; one concept, one signature moment; case-study depth over widgets.

**Dials (taste):** VARIANCE ~6 · MOTION ~5 · DENSITY ~3 (gallery air, not cockpit).

---

## 1. Aesthetic direction

The site reads as a **Swiss editorial portfolio crossed with a dark digital bandit** — sharp, minimal, outlaw-digital presence without costume theater. Surfaces stay quiet Catppuccin-dark; type carries hierarchy; mauve is a single precise accent (links, focus, CTA, thin rules), not a gradient wash. The mark/mascot is a **minimal sharp bandit/outlaw digital** silhouette or monogram — high-craft line or flat mark, never sticker pile, never painted grit collage, never coffee-mug lifestyle, never CRT/scanline carnival as the main look. Think premium quiet confidence with a slight outlaw edge: offset grids, generous empty air, impact-forward case titles, one focused visual per project. Explicitly **not** generic AI SaaS (mesh hero, three equal feature cards, Inter-on-slate defaults), **not** CRT-primary, **not** sticker-grunge-primary, **not** nomad-outline / NOMAD.LINK branding.

---

## 2. Color tokens

Catppuccin Mocha–adjacent dark base; mauve as the sole primary accent. Roles are named for CSS variables — builder binds them; do not invent a second accent system.

| Token | Hex | Role |
| --- | --- | --- |
| `--color-crust` | `#11111b` | Deepest page / chrome |
| `--color-base` | `#1e1e2e` | Default page background |
| `--color-mantle` | `#181825` | Elevated panel / footer |
| `--color-surface-0` | `#313244` | Quiet cards, hairline wells |
| `--color-surface-1` | `#45475a` | Borders / dividers |
| `--color-overlay` | `#6c7086` | Muted chrome, captions |
| `--color-subtext` | `#a6adc8` | Secondary body |
| `--color-text` | `#cdd6f4` | Primary body / headings |
| `--color-accent` | `#cba6f7` | Mauve — links, focus ring, rules, outline CTAs |
| `--color-accent-dim` | `#b4befe` | Lavender — rare hover/secondary emphasis only |
| `--color-cta-fg` | `#11111b` | Text/icon on filled primary CTA |
| `--color-cta-bg` | `#cba6f7` | Filled primary CTA fill |
| `--color-focus` | `#cba6f7` | `:focus-visible` ring (2px+, offset on dark) |

**Contrast notes (primary CTA ≥4.5:1 WCAG AA):**
- Filled CTA: `--color-cta-fg` (`#11111b`) on `--color-cta-bg` (`#cba6f7`) ≈ **9.2:1** — use this pair for Hire / Contact.
- Outline CTA / mauve text on `--color-base`: `#cba6f7` on `#1e1e2e` ≈ **8.1:1** — OK for text links and ghost buttons.
- **Do not** put `--color-text` (`#cdd6f4`) on mauve fill (≈1.4:1 — FAIL).
- Body text `#cdd6f4` on `#1e1e2e` ≈ **11.3:1** — keep continuous prose on base/crust, not on busy imagery.

Brand may keep mauve-on-dark even after the nomad abandonment; palette serves the bandit direction when used with restraint (thin borders, no neon glow stacks).

---

## 3. Typography tokens

Two primary roles above the fold only (display + body). Mono is tertiary (labels, meta, repo paths) — never competing as a second display face.

| Token | Suggested face (direction) | Role |
| --- | --- | --- |
| `--font-display` | Local/system sans with editorial weight (Liberation Sans, then system fallback) | Hero H1, section openers |
| `--font-body` | Local/system sans for readable continuous prose | Continuous prose, nav, UI |
| `--font-mono` | Local/system monospace (JetBrains Mono Nerd Font, then generic fallback) | Meta, paths, short code cues |

**Scale (fluid; hero floor locked to bar):**

| Token | Value | Notes |
| --- | --- | --- |
| `--text-hero` | `clamp(2.25rem, 1.6rem + 2.8vw, 4.5rem)` | **≥2.25rem fluid; ≥36px computed @ 1280px viewport** (bar floor) |
| `--text-h2` | `clamp(1.5rem, 1.2rem + 1.2vw, 2.25rem)` | Case-study / section titles |
| `--text-h3` | `clamp(1.125rem, 1rem + 0.5vw, 1.5rem)` | Beat labels (Problem / Role / …) |
| `--text-body` | `1rem` / `1.125rem` @ large | Line-length **~45–75ch** for prose |
| `--text-small` | `0.875rem` | Captions, meta |
| `--text-mono` | `0.8125rem`–`0.875rem` | Mono labels |

**Craft:** `text-wrap: balance` on display titles; body `line-height` ~1.5–1.65; tracking tight on hero, normal on body. No rainbow of weights — prefer one display weight + one body weight + one bold for emphasis.

---

## 4. Space rhythm

Negative space is the proof of craft: skeptical hiring managers read “serious” from air and hierarchy, not from gadget density. At least one full-viewport band (hero or work opener) must show intentional emptiness — primary content ≤ ~60% of that band’s visual weight (bar whitespace floor).

| Token | Value | Use |
| --- | --- | --- |
| `--space-1` | `0.25rem` | Hair gaps |
| `--space-2` | `0.5rem` | Inline |
| `--space-3` | `1rem` | Compact stacks |
| `--space-4` | `1.5rem` | Default component gap |
| `--space-5` | `2.5rem` | Section internal |
| `--space-6` | `4rem` | Between major blocks |
| `--space-7` | `6rem`–`8rem` | Section breathing @ desktop |
| `--space-hero-pad` | `min(12vh, 6rem)` vertical + generous inline | Hero inset |

**Max density rules:**
- Above the fold: name + ≤3-line positioning + **one** primary CTA + optional quiet mark — no demo wall, no equal card trio, no sticky gadget gallery.
- Work index: impact titles + **one focused visual per project**; secondary mentions visually subordinate.
- Case studies: editorial rhythm (text column ↔ one full-bleed or large figure); no twelve-thumbnail waffle.
- Mid-phone (~390px): same hierarchy, no horizontal overflow; tap targets usable without hover.

---

## 5. Motion tokens

Motion serves story and navigation — brief, soft, transform/opacity only. Exactly **one** signature moment; everything else is subordinate micro-feedback (hover/focus) or static.

| Token | Value |
| --- | --- |
| `--motion-fast` | `150ms` |
| `--motion-base` | `280ms` |
| `--motion-slow` | `500ms` |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` (editorial settle) |
| `--ease-in-out` | `cubic-bezier(0.45, 0, 0.55, 1)` |

**ONE signature moment (prose — not code):** On first scroll into the Work band, the flagship case (dotz) does a single choreographed reveal: the impact title and one focused visual ease from a slight vertical offset and soft fade into their final Swiss lockup, while a thin mauve rule draws once beneath the title — a “bandit stamp” of arrival, not a carnival. No second competing wow (no parallel WebGL hero, no infinite logo loop, no CRT boot sequence). A local browser observer may trigger this once; without observer support, the page remains static.

**Reduced motion:** Under `prefers-reduced-motion: reduce`, the signature lands at its **static final state** (no scrub, no continuous/infinite animation on hero/nav). Decorative motion duration → 0 / disabled; hover opacity shifts may remain instantaneous. No auto-playing motion on hero/nav.

**Local media behavior:** the existing local hero loop is muted and has a local poster fallback; `prefers-reduced-motion` shows the poster. No third-party media runtime is loaded by the page. Do not invent screenshots or add remote media.

---

## 6. Dos and don’ts (mapped to bar anti-patterns)

| Do | Don’t (instant SITE FAIL if primary — bar §C) |
| --- | --- |
| One concept: dark digital bandit + Swiss quiet hire signal | Spray-and-pray theme flips; dual primary identities (bandit + coffee-mug, Swiss + CRT carnival) |
| Mauve-on-dark restraint; thin borders; sharp minimal mark | Sticker-grunge / painted grit as dominant identity; neon glow stacks |
| Typography-led hero; negative space ≤60% occupancy floor | Sticky demo wall / equal-weight gadget gallery above the fold |
| Exactly one signature beat; `prefers-reduced-motion` honored | Multiple competing “wow” systems; infinite hero animation under reduce |
| Two established public case studies (problem → role → craft → outcome) | Treating incomplete workflow entries as completed case studies or using volume as quality |
| One focused visual per project; impact-forward titles | Fake research-desk / cosplay demos substituting for real copy |
| Transform/opacity motion only; usable scroll on mid-phone | WebGL/3D jank that blocks reading; CRT/scanline overload as main look |
| Every new suite workflow visibly labeled **WIP · INCOMPLETE** | Untruthful production users/revenue claims or presenting fixture behavior as AI completion |
| Minimal nav + visible Hire/Contact CTA; keyboard focus visible | Link farm nav; invisible focus; keyboard traps on graded path |
| **Bandit** mark — minimal, sharp, outlaw-digital | **Nomad outline / NOMAD.LINK** as primary brand; coffee-cup imagery |

---

## 7. Current content truth list

| Lock | Truth |
| --- | --- |
| Name | **Cayleb Alvarez-James** (site header/footer and page title) |
| Contact | Public GitHub profile only; no email address is published. |
| Positioning | Security-first applied AI and systems engineering across finance, support, security, marketing, and operations. |
| Established public proof | **dotz** is a multi-agent coding dashboard (axum + Tauri); **Sophos** is a Windows coding agent, with Prime Intellect credit stated. |
| New suite | LedgerBridge, MarketBrief, ChainWatch, BacktestGuard, ReplyCraft, HandoffHub, SentinelDesk, SearchLift, PipelineRelay, and OnboardPath are each `WIP · INCOMPLETE`; all ten full jobs remain `UNVERIFIED`. Seven bounded public-data slices are recorded, including a historical SearchLift before-state. On 2026-09-24 the lead independently verified five local model calls; this verifies execution only, not answer quality, workflow completion, or AI status. All ten AI labels remain `AI UNVERIFIED`; no AI-complete workflow is claimed. |
| Outcomes | No verified customers, revenue, adoption, company deployment, independent AI contribution, approvals, or performance results are claimed. |
| Brand identity | **Dark digital bandit** with Catppuccin Mocha/mauve tokens and Swiss editorial hierarchy. |
| Publishing | The `industry-ai-suite` repository is PUBLIC, but the current local suite candidate is WIP and unpublished. Do not present local site or suite bytes as released. Leave all ten mutable `tree/main/apps/...` links unchanged until the lead pins an approved suite release commit. |

---

## Out of scope for this author

- No HTML/CSS/JS implementation.
- No long component-library shopping list.
- No stack/file-tree as a quality signal (builder chooses means; bar judges outcomes).
- New media generation is outside this site-sanitization piece; reuse only the locked local assets.

*End of DESIGN-v5.md*
