# Droplet agent and guide: design

**Date:** 2026-10-12. Approved in chat: Cayleb chose "Your AI agent droplet" and "Droplet becomes your guide", then "Yes, build it".

## Intent

Cayleb asked for three things, in his words: replace the hero's helmet with something else, add an "above and beyond" personal touch, and get handoff prompts for any imagery or video he should generate.

The site's theme is that Cayleb builds personal AI agents for people. The glass-droplet agent from his generated scenes becomes his agent's mascot. It does two jobs:

- In the hero, it is the 3D object beside him, replacing the helmet.
- Down the page, it rides along as a guide that talks in his voice and answers a few questions.

Success means:

- The hero reads as "Cayleb and his agent", not as a racing visor.
- The guide feels personal, never blocks content, and never makes a claim the rest of the site doesn't make.

## 1. Hero: the droplet replaces the helmet

**Removed.** These are deleted from the hero:

- the procedural headset (`headset.js`, `headset-profile.js`) and its tests;
- the scanning wireframe outline and the burn entrance;
- the grey "X-ray" reveal that followed the cursor and the idle sweep. Concretely, `bgRevealOpacity` and `autoSweepAmount` are set to 0 at every width.

The backdrop's contour lines and the portrait's parallax and relight stay.

**New: `site/js/hero/droplet.js`.** It exports `DROPLET_PROFILE`, a closed teardrop with the point up, and `buildDroplet({ glass })`. That returns a `Group` containing:

- the lathed body;
- a soft cyan core (an emissive sphere, additive);
- an `eyes` group with two glossy dark ellipsoids, each with a white catch-light.

Glass quality depends on the device tier:

- **Desktop and tablet:** `MeshPhysicalMaterial` with transmission (ior 1.33, thin, faint cyan attenuation).
- **Mobile tier, or energy saver:** a cheaper clear-coated, semi-transparent physical material with no transmission pass.

**Scene wiring.**

- `HeroScene.load()` calls `buildAgent(buildDroplet(...), noise)` instead of `buildHelmet`.
- `buildAgent` creates the shared reveal uniforms the backdrop still reads. It does not inject reveal masks: the droplet is always visible.
- `buildAgent` parents the droplet under `helmetGroup` at `agentOffset`, which sits beside his head on his left, at eye level and in front of the portrait plane.

**Motion.** Driven by the existing ticker and pointer smoothing:

- a 3 s vertical bob;
- the body yaws and pitches a little toward the cursor, reusing the helmet's tilt and yaw filters;
- the eyes turn further toward the cursor, clamped to about ±28°;
- a blink every 3–6 s, randomised, done as a 120 ms vertical squash on the eye group.

With reduced motion, or a frozen tier, it holds still with its eyes centred.

Placement uses the existing parameters (`helmetX`, `helmetY`, `helmetScale`) plus `agentOffset`. They are tuned by screenshot at 390, 768, 1024, 1440 and 2560.

## 2. The guide

**Markup.** Built at build time from `content.json` → `guide`, and `hidden` until the script mounts it, so it does not exist without JavaScript. It has three parts:

- **`button.guide-agent`:** an inline SVG twin of the droplet (body, core, eyes), bottom-right, 64px, or 52px under 640. Its accessible name is "Ask my agent".
- **`p.guide-bubble`:** a speech bubble anchored above the button, with `aria-hidden="true"`. Its lines restate the section and are decoration for screen readers.
- **`div.guide-panel`:** `role="dialog"`, `aria-modal="false"`, labelled by its heading. It contains:
  - the heading "Ask my agent";
  - five questions as disclosure buttons (`aria-expanded`), each with its answer underneath;
  - links (email, résumé PDF) where an answer needs them;
  - a "Quiet" toggle (`aria-pressed`) that stops the bubbles;
  - a close button.
  On phones it is a bottom sheet.

**Copy.** Everything lives in `content.json`, with limits added to `content-limits.json`:

- greeting ≤ 80 characters;
- section lines ≤ 90;
- questions ≤ 40;
- answers ≤ 280.

Lines are keyed by section id: `approach`, `experience`, `work`, `contact`.

| When | Line |
|---|---|
| greeting, first time it appears | "Hey, I'm Cayleb's agent. I'll ride along." |
| `approach` | "This is the loop he runs with every person: shadow, understand, build, teach." |
| `experience` | "Real jobs first. He learned how teams actually work before building for them." |
| `work` | "These are his own builds: recorded demos and drafts, labelled honestly." |
| `contact` | "Want an agent built around how you work? This is where you say hi." |

Questions and answers:

- **What does Cayleb do?** The integrator loop in two sentences.
- **How does a shadow day work?** He spends a couple of days alongside someone, notes where their time goes, then builds an agent around those tasks and teaches them to use it.
- **Is this live with clients yet?** "Not yet. Everything here is his own work, labelled as demos or drafts."
- **What's EvoHedge?** "A private research project, still in development: an autonomous trading research system. No performance claims."
- **How do I reach him?** Email and the résumé PDF.

**Behaviour.** Implemented in `site/js/guide/guide.js`, with pure logic in `site/js/guide/queue.js`.

- **Appearing.** It appears when the hero has scrolled off (the hero section's bottom passes 15% of the viewport). It rises in with a spring and says the greeting once.
- **Section lines.** When a section's heading enters the middle band of the viewport (an `IntersectionObserver` with rootMargin -35% top and bottom), its line is queued. Each line shows once per page load, for 5.5 s, with at least 1.2 s between lines. A newer section replaces a waiting line instead of piling up.
- **Quiet.** When on, it suppresses bubbles. The droplet stays clickable. The setting is remembered in `localStorage`, wrapped in try/catch, so the page works without it.
- **Panel.** Clicking or pressing Enter on the droplet opens the panel and moves focus to the first question. Escape, the close button or clicking the droplet again closes it and returns focus to the droplet. Opening it hides any bubble.
- **Footer.** It never covers the footer's foot row. While the contact section is ≥ 55% visible, the droplet lifts with a spring to sit above the foot row.
- **Eyes.** On a fine pointer, they follow the cursor (clamped). Otherwise they glance toward the active section's heading. Blinks and the bob run on the shared ticker. There are no CSS keyframes; CSS transitions are used only for hover colour.
- **Reduced motion.** No bob, blink or eye-follow. Bubbles and the panel appear without transitions.

**Layering.** `z-index` 40: above content, below the menu sheet and veil (50) and the asset banner (70). It respects `env(safe-area-inset-*)`.

## 3. Claim rules (unchanged, now tested on the guide too)

- No "client(s)", "customer(s)", "pilot", "hedge fund", returns, profit or revenue claims in guide copy.
- No mention of Robert H. Lord Company or RHL in the guide.
- EvoHedge is "private, in development".
- Demos are "recorded".
- No live AI calls and no third-party requests.

## 4. Testing

- **Node tests:**
  - guide copy limits and banned words;
  - every guide section id exists on the homepage;
  - `queue.js`: greeting first, once-per-section, replace-not-pile, quiet suppression, minimum gap;
  - eye-offset clamp;
  - the `DROPLET_PROFILE` shape (closed, point up, monotonic y);
  - markup: the dialog's ARIA, `hidden` until mount, the aria-hidden bubble.
- **Removed:** the headset tests.
- **Screenshots:** hero at 390, 768, 1440 and 2560 (and reduced motion); the guide at 1440 and 390 with the panel open and a bubble showing; the footer with the droplet lifted.
- **All three suites and `check_assets.py --strict` pass.**

## 5. Handoff prompts (optional)

Nothing here needs generated art. These are optional upgrades Cayleb can generate:

- a front-facing, plain-background, waist-up portrait, for a crisper hero cut-out;
- a waving shot for the footer.

## Out of scope

- Real chat or LLM answers.
- Analytics.
- Changes to other blocks beyond the guide's footer lift.
