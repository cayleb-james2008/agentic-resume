# Brief — agentic-resume energetic redesign
Date: 2026-09-22
Author: Outis (brief only — builder is separate)

## Audience
Hiring managers and technical interviewers evaluating Cayleb Alvarez-James for AI/engineering roles. They skim in under 30 seconds.

## Job to be done
Make Cayleb feel like someone already in motion — sharp, hire-ready, energetic — and get them to open a project or the resume PDF.

## One primary action
Click **See the work** (projects) or **Download resume**.

## Route
**Persuade** (portfolio / landing showcase), not Operate.

## Voice
Confident and ready to work. Energetic without hype-bro. No equal-weight defensiveness. No honesty-theater. Full name: **Cayleb Alvarez-James**. GitHub: **cayleb-james2008** only.

## Visual identity
- Keep mocha / cappuccino dark base (warm espresso, not cold slate).
- Energy comes from: larger type, hotter latte accent, kinetic motion, stronger contrast, denser rhythm, not from dumping neon or templates.
- Distinct accessible surface — not generic AI-portfolio grey.

## Tokens (must set before build)
- `--bg` deep espresso
- `--surface` raised mocha panel
- `--text` near-cream
- `--muted` warm grey-brown
- `--accent` bright latte / cappuccino (punchier than current)
- `--accent-hot` optional secondary for CTAs / glow
- Radius generous; shadows warm not blue
- Type: distinctive pairing (display + body). System stack OK if character is strong via size/weight/tracking; prefer one Google font pair loaded once if needed (e.g. Syne + DM Sans, or similar high-craft pair — builder picks one coherent pair).

## Motion lane
CSS + light JS only (no npm runtime deps). Scroll reveal, hero entrance, card hover lift/sheen, CTA pulse/sheen. Honor `prefers-reduced-motion: reduce` (instant states, no motion).

## Structure
Keep multi-page: Home, Projects, Principles, Resume PDF, PDM Forge case study. Equal visual weight across project cards (layout), but copy never lectures about “equal weight.”

## Success criteria (grader sees)
1. Hero feels alive within 1s on desktop and mobile.
2. Accent and type read as energetic, not sleepy.
3. Primary CTA is obvious.
4. Live URL shows Cayleb Alvarez-James + cayleb-james2008 links only.
5. Visual screenshots shown to Cayleb for grading (not a file path dump).

## Out of scope
Marketing posts, paid fonts, new frameworks, weakening honesty labels on the PDM simulator case study (keep factual simulator banner; tone can be tighter).
