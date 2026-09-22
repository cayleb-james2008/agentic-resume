# DESIGN v5 — Visual Gate Brief
**Role:** Visual Gate Brief Author (web-design-pipeline) · **Not** the UI builder  
**Date:** 2026-09-22 (America/New_York)  
**Authority:** `BRIEF-v5-breathtaking.md` + `gauntlet/FROZEN-BAR-v5-breathtaking.md` (SITE craft)  
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
| `--font-display` | Sharp geometric sans with editorial weight (e.g. Syne / Outfit / similar — **not** Inter as the personality) | Hero H1, section openers |
| `--font-body` | Clean readable sans (distinct from display; e.g. Source Sans 3 / IBM Plex Sans / similar) | Continuous prose, nav, UI |
| `--font-mono` | Humanist mono (IBM Plex Mono / JetBrains Mono) | Meta, paths, short code cues |

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

**ONE signature moment (prose — not code):** On first scroll into the Work band, the flagship case (dotz) does a single choreographed reveal: the impact title and one focused visual ease from a slight vertical offset and soft fade into their final Swiss lockup, while a thin mauve rule draws once beneath the title — a “bandit stamp” of arrival, not a carnival. No second competing wow (no parallel WebGL hero, no infinite logo loop, no CRT boot sequence). Scroll linkage may scrub or play-once; it must feel like editorial punctuation, not a product demo.

**Reduced motion:** Under `prefers-reduced-motion: reduce`, the signature lands at its **static final state** (no scrub, no continuous/infinite animation on hero/nav). Decorative motion duration → 0 / disabled; hover opacity shifts may remain instantaneous. No auto-playing motion on hero/nav.

**Higgsfield motion-asset pipeline (LOCKED — see `design/research/HIGGSFIELD-CREATIVE-METHODS.md`):** Identity video/stills are produced outside the page craft loop: (1) Hero Frame First — approve bandit still before any video; (2) DP-style rig (camera/lens/focal/aperture); (3) shot list, not one lucky clip; (4) cinema vocabulary over mood words; (5) Cinema Studio 4.0 Director’s Panel look-lock; (6) Elements/Soul Cast for bandit consistency; (7) grid/storyboard + inspect failure modes; (8) site ships muted loop + poster, `prefers-reduced-motion` → poster only. **Do not** invent CRT reels or multi-video showreels as primary craft. **Do not** spend Higgsfield credits without Cayleb’s OK. Until an approved MP4 exists, static typography + one GSAP signature beat meet the bar.

---

## 6. Dos and don’ts (mapped to bar anti-patterns)

| Do | Don’t (instant SITE FAIL if primary — bar §C) |
| --- | --- |
| One concept: dark digital bandit + Swiss quiet hire signal | Spray-and-pray theme flips; dual primary identities (bandit + coffee-mug, Swiss + CRT carnival) |
| Mauve-on-dark restraint; thin borders; sharp minimal mark | Sticker-grunge / painted grit as dominant identity; neon glow stacks |
| Typography-led hero; negative space ≤60% occupancy floor | Sticky demo wall / equal-weight gadget gallery above the fold |
| Exactly one signature beat; `prefers-reduced-motion` honored | Multiple competing “wow” systems; infinite hero animation under reduce |
| ≥3 deep case studies (problem → role → craft → outcome) | Equal-weight waffle; volume theater (more projects = quality) |
| One focused visual per project; impact-forward titles | Fake research-desk / cosplay demos substituting for real copy |
| Transform/opacity motion only; usable scroll on mid-phone | WebGL/3D jank that blocks reading; CRT/scanline overload as main look |
| PDM Forge labeled **simulator / case study**; honest outbound GitHub links | Untruthful production users/revenue claims without cited public source |
| Minimal nav + visible Hire/Contact CTA; keyboard focus visible | Link farm nav; invisible focus; keyboard traps on graded path |
| **Bandit** mark — minimal, sharp, outlaw-digital | **Nomad outline / NOMAD.LINK** as primary brand; coffee-cup imagery |

---

## 7. Content truth list

| Lock | Truth |
| --- | --- |
| Name | **Cayleb Alvarez-James** (site header/footer + `<title>`; matches GitHub display name) |
| GitHub | `https://github.com/cayleb-james2008` |
| Positioning (who / specialty / outcome) | AI/agentic systems + systems engineering — hire-ready proof for technical leads evaluating agentic craft and fail-closed systems thinking |
| Primary CTA | Reach out / hire (contact); secondary: open flagship case study **dotz** |
| **dotz** | Multi-agent coding dashboard (axum + Tauri); no inflated “production SaaS users” without cited public source; outbound `github.com/cayleb-james2008/dotz` |
| **Sophos** | Windows coding agent / Prime Intellect credit — credit stated where claim appears |
| **Solomon** | RSI fleet control, fail-closed money — do not soft-wash into generic “AI trading” |
| **apotheka-site** | Static lookbook — not a dynamic product platform |
| **PDM Forge** | **Simulator case study only** — copy must say simulator/case study; no live production users/revenue/customers without cited public source |
| Secondary projects | Allowed only as visually subordinate; inventing equal-weight filler = FAIL |
| Brand identity | **Dark digital bandit** (clean, high-craft, premium) — **not** outline cyber-nomad / NOMAD.LINK |
| Publish | Draft + screenshots for grading; live Vercel alias only after Cayleb’s explicit sign-off |

---

## Out of scope for this author

- No HTML/CSS/JS implementation.
- No long component-library shopping list.
- No stack/file-tree as a quality signal (builder chooses means; bar judges outcomes).
- Higgsfield generations (paid) wait for Cayleb; wire approved assets per §5 methods.

*End of DESIGN-v5.md*
