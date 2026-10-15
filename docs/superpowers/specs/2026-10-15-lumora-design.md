# Lumora layout homepage: design

**Date:** 2026-10-15. Approved in chat, third round:
- The water story (live at `b0763a3`) and the Aero night mockup both missed.
- Cayleb then pasted a third-party "recreate this site" spec for a studio page called Lumora. He asked for it to be rebuilt as his résumé site "with that tech kind of feel… terminals… but not making it feel too complicated".
- Mid-build he added two asks: an Ergon graph showing it managing a team and how it adapts, and the focus "AI employees, AI workflows, AI automations, AI everything".
- He reviewed the mockup (a private artifact). His words: "the vibe does feel right", and "you can say the tech names".

## Intent

The homepage should read as a professional, minimal tech page:
- calm light surfaces, black cards and one cyan accent;
- terminals present where the machine speaks, never in the way;
- easy to take in at a glance.

It tells a business three things, in order:
1. **What he does.** He comes into a business, learns how the team works, and builds AI around it: AI employees, workflows and automations on the apps they already use.
2. **How it looks in practice.** Ergon gives every person their own assistant, managed remotely, with tickets fixed on the machine.
3. **That he has shipped real, tested software.**

The official résumé follows, then a way to get in touch.

## Decisions from Cayleb (2026-10-15)

1. **Layout reference: the Lumora spec.** It is kept local and git-ignored at `docs/superpowers/specs/2026-10-15-lumora-layout-reference.md`, the same treatment as the 2026-10-12 reference.
   - The rule carries over from the first build. We reuse its structure, components, motion and timings.
   - We use none of its names, copy, logo mark, partner names, ratings, stats or images.
2. **Feel.** "A softer tech vibe where… you know the tech is there… but it's easy to intake." Professional, minimal, "tech CEO-esque".
   - Monospace appears only where the machine speaks: loader, proof chip, terminals, the Ergon log and route labels.
3. **Main focus.** "I can go into your business and I can build AIs around you and what you need. AI employees, AI workflows, AI automations, AI everything. Forward thinking engineer."
4. **Ergon graph.** "Some kind of graph showing Ergon managing the employees… focusing on how adaptable my workflows are and how they can be applied to you."
   - This becomes a live team graph with a team switch.
5. **Tech names are allowed** in the "Built with" list and in terminal text. Headings and body copy stay plain.
6. **The vibe of the mockup is approved.** This spec ports it into the repo's build without changing its look.
7. **Carried over from earlier rounds:**
   - No pictures of him anywhere.
   - The exact title "Forward Thinking Engineer".
   - The headline "Show me how you work. I'll find where AI fits."
   - The other jobs shown under "Work ethic".
   - No certifications.
   - Escalation in plain words, Agent → Senior agent → Person, with no model names.
   - About $100 a person a month.
   - Ergon's status stays honest: "Windows pilot · live checks pending".
   - The official résumé comes at the end.
   - No third-party requests at runtime.
   - Nothing merges to `main` (GitHub Pages publishes it) without his "merge it".

## The new page

```
loader (fixed, ink; first visit per tab only)          >_ Cayleb.AJ · tagline · terminal boot lines · 000→100
header.masthead (absolute over the hero)               >_ Cayleb.AJ · Home Ergon Work "What I do" Résumé Contact · Connecticut clock · Menu
<main>
  section#home.hero        <picture> surface layer + <canvas> blueprint reveal, CAYLEB watermark,
                           eyebrow, the page's only <h1>, lead, proof chip, CTAs, cursor hint,
                           carousel card, "Built with", status bar
  section#about            >_ glyph, caption, word-reveal statement (h2), Find me online, Read my résumé
  div.band                 AI · built · → · around you   (a list, not a section)
  section#team             copy (Ergon), team switch, ladder, price + status  |  figure: team graph, ticket button, log
  section#built            "What I've built so far": Ergon (wide, mini terminal), dotz, Sophos,
                           Industry AI Suite (real screenshots), Asmodeus (mini terminal)
  section#services         "AI built around how you work": five hover-fill rows that open the request modal
  section#stats            black panel: 3,300+ · 5 · 10 · $100/mo with scroll count-up, honest footnote
  div.resume-half#resume   the official résumé: #experience, #work, #education (markup as today)
</main>
footer.site-footer > section.contact#contact    CTA h2 + Get in touch, brand + email (copy), Site / Projects /
                                                 Elsewhere columns (nav aria-label="Footer"), copyright, watermark
div#menu (full-screen ink overlay) · div#modal (request composer) · aside.guide ("Ask my agent" terminal)
```

## Sections

| Section | Content (copy in `site/content.json` unless noted) | Behaviour |
|---|---|---|
| Loader | `>_ Cayleb.AJ`. The headline as its tagline. Four boot lines (`$ hello --from cayleb`, `› loading the work … ok`, `› loading ergon … ok`, `› ready`). "Loading" and a zero-padded counter. | Counts 0→100 over 1300ms with easeInOutCubic. Each line shows when the count passes it. Then it slides up (0.75s) and the hero reveals start. Scroll is locked meanwhile. The digits come from JS, never content.json. |
| Header | Wordmark `content.wordmark` ("Cayleb.AJ") after a `>_` tile. Nav from `content.nav`. Clock chip "Connecticut · 4:22pm • 15 October, 2026". Menu button. | Absolute, so it scrolls away. Enters 150ms after the loader. The clock is America/New_York, ticking every second. Contact opens the modal; the rest smooth-scroll. |
| Hero | Eyebrow "Forward Thinking Engineer". H1 headline. Lead (≤24 words: "I come into your business, learn how your team works, and build AI around it: AI employees, workflows and automations."). Proof chip `✓ 3,300+ automated checks · 5 systems`. CTAs "Let's talk" / "View work". Hint "› move your cursor to see how it's built". Carousel: AI employees, AI workflows, AI automations, AI everything. "Built with" list. Status bar: "Building since Oct 2025 · Remote-only · Connecticut · Scroll to explore". | The liquid reveal (below). A line reveal on the H1. Staggered entrances after the loader. The carousel auto-advances every 4.2s until touched. It is `min-height: 100svh` from 1024px up. |
| About | Eyebrow "About". Caption "One engineer. Remote-only, based in Connecticut." Statement (h2): "I come into your business and learn how your team really works," then, muted, "then build AI employees, workflows and automations around it, on the apps you already use." Chips for GitHub, Email and Résumé PDF. "Read my résumé". | Word reveal, staggered 35ms. |
| Band | Pills: "AI" (light), "built" (cyan), → (ink), "around you" (ghost). | Staggered rise. The tiles scale on hover. |
| Ergon | Eyebrow "Ergon". H2 "One assistant per person. Shaped to your team." Body. "Try it on a team" with Office / Shop / Trades / Clinic. "When something breaks" with the ladder Agent → Senior agent → Person and the note "Hard tickets move up a step. A person always has the last word." Then "**About $100** a person a month." and the status chip. Figure: a "Sample team" chip, the hub "Ergon · Managed remotely", five person cards (role, `>_` assistant badge, "assistant on", two app chips), "Send a test ticket", "Tap a person to see their assistant." and a mono log. | The team graph (below). |
| Built | Eyebrow "Work". H2 "What I've built so far". Five black cards, each with a category line, an ↗ badge, a name, one sentence, tags and a mono count tag (622 tests, 828+ tests, 1,224 checks, 382 tests, 1,111 tests). Ergon is wide, with a mini `ergon status` terminal and its status chip. dotz, Sophos and the Suite carry real screenshots. Asmodeus has an `asmodeus replay --past-data` terminal. The links are the case studies or repos. | Cards rise in, staggered 90ms. Hover lifts a card 8px and turns its badge 45°. |
| Services | Eyebrow "What I do". H2 "AI built around how you work". Rows: /employees AI employees, /workflows AI workflows, /automations AI automations, /support Remote support, /everything AI everything, each with one line. | Hover fills the row and slides its badge. A click opens the modal with that topic. |
| Stats | Eyebrow "Track record". H2 "Tested before it ships." 3,300+ "Automated checks across my systems". 5 "Systems built and tested". 10 "Recorded demos in the lab". $100/mo "Ergon, about a person a month". Footnote: "Counts come from each project's own test runs. Ergon's live checks are still pending, and it hasn't had a paid rollout yet." | Count-up driven by scroll: from the element's top at the viewport bottom to its centre at the viewport centre. The HTML carries the final values. |
| Résumé | Today's `resume_half.py` markup and content: kicker, name, meta, downloads, then `#experience` (with Work ethic), `#work` (Ergon first, status, case studies, lab link) and `#education` (with skills). The header gains the line "The official version". | Restyled as the mockup's sheet: a cool-grey card, small uppercase section labels and two columns from 1024px. No motion beyond colour on hover. |
| Footer | H2 "Show me how your team works." with "Get in touch". The brand line and "Forward Thinking Engineer. I build AI employees, workflows and automations around the way your team already works." The email shown as text with a Copy button. The Site / Projects / Elsewhere columns. "© 2026 Cayleb Alvarez-James." and "Remote-only · Connecticut, USA". A 5% CAYLEB watermark. | Links nudge 4px on hover. |
| Menu | Full-screen ink overlay: brand, Close, items with mono route labels (`/`, `/ergon`, `/work`, `/build`, `/resume`, `/contact`), "Connecticut — time", "Start a project →". | Fades in, then the items stagger in (45ms each, plus 80ms). Escape and Close shut it. Focus is trapped and handed back on close. |
| Modal | "Start a project" (or "About: <topic>"). H2 "Tell me how your team works." Fields: Name, Email, Your team. "I read every message myself." "Write the email". | Inline validation that says how to fix each field. On submit it composes a `mailto:` to his address. Then it shows: "Your email app should open with this message. If it didn't, copy it and send it to caylebalvarezjames@gmail.com." with "Copy message". It never says a message was sent. |
| Ask my agent | The guide's questions as buttons. Each answer is printed under a `$ <cmd>` echo (whoami, ergon --about, ergon --price, tools --list, history --rollouts, safety --check, asmodeus --about, contact). | A floating pill appears once the hero is mostly out of view. The panel types each answer (3 characters per 16ms). Escape closes it. |

## Mechanics

- **Adaptive grid.** Everything is sized in rem.
  - The root size is 16px up to 1440px. Between 1024 and 1440px it is `clamp(13px, 1.1111vw, 16px)`.
  - Below 1024px it is `clamp(14px, 1.5625vw, 16px)`. At 640px and below it is `min(4.4444vw, 18px)`.
  - Above 1920px, JS scales it up with the reference's formula (base 1920, coefficient 0.6666).
- **Liquid reveal** (`site/js/home/liquid.js`). A `<picture>` shows the surface layer. A canvas paints the blueprint layer along the pointer's trail.
  - Constants: brush radius 143 CSS px; decay 0.016 per frame; DPR capped at 2; 120 fade frames; idle fade `min(decay + idle × 0.004, 0.5)`.
  - The brush gradient stops are 1, 0.82 and 0 at positions 0, 0.55 and 1.
  - Points between pointer moves are spaced `max(radius × 0.3, 1)` apart, up to 60 per move.
  - It stamps with `source-in` from an offscreen cover canvas and fades with `destination-out`.
  - One automatic stroke runs 650ms after the loader, so phones see it once. It is skipped if the pointer has already moved.
  - The wide or tall layer is picked by `(max-aspect-ratio: 3/4)`.
- **Text reveals** (`site/js/home/reveal.js`, CSS transitions).
  - Headings split into word spans. Words are grouped into lines by `offsetTop` at reveal time and staggered 120ms per line (100ms in the footer), over 900ms with `cubic-bezier(.215,.61,.355,1)`.
  - The About statement staggers each word by 35ms over 700ms with `cubic-bezier(.165,.84,.44,1)`.
  - Blocks rise 12–48px over 750–900ms with `cubic-bezier(.22,1,.36,1)`.
  - Hero items wait for the loader, using the reference's delays: eyebrow 200, H1 250, card 400, Built with 550, proof chip 650, CTAs 750, status bar 900 and watermark 300 (in ms). Everything else reveals once, when it enters the viewport.
- **Hover.** Only inside `(hover: hover) and (pointer: fine)`. Named properties only, and `scale(.97)` while pressed. No `@keyframes` anywhere.
- **Team graph** (`site/js/home/ergon.js`, with pure helpers in `site/js/home/graph.js`).
  - **Wires** are SVG paths measured from the DOM. From 768px up, each is a curve from the hub's bottom centre to a card's top centre. Below 768px a left bus runs from the hub's `>_` mark into each card's left edge.
  - **Packets** are SVG dots moved with `getPointAtLength`, eased in and out over about 0.9s. Updates travel down to the person; tickets travel up in amber.
  - **Autoplay** runs every 2.3s, only while the figure is at least 25% visible and the tab is visible. It alternates routine updates with a ticket on every third tick.
  - **Ladder outcome** is deterministic. Ticket *n* stops at Person if *n* is a multiple of 7, otherwise at Senior agent if it is a multiple of 3, otherwise at Agent. Most stop at Agent.
  - **Team switch** is a radio group with arrow-key support. It swaps roles, app chips and aria-labels, re-measures the wires, and logs `$ ergon shape --team <name>`.
  - **Person click** runs that person's routine.
  - **Re-layout** resolves any packet in flight, so nothing awaiting it stalls.
  - **The log** keeps four lines. It announces only events the visitor started (team switch, test ticket, person click); autoplay is not announced.
- **Count-up** (`site/js/home/count.js`): `progress = clamp((vh − top) / (vh/2 + h/2))`, `round(progress × value)`, throttled to 30ms, with commas where the value has them.
- **Scroll.** Lenis, vendored, runs on the shared ticker. `stopScroll()` and `startScroll()` are reference-counted across the loader, menu and modal.
- **Loader gating.** It plays only when the page has JS, motion is allowed, there is no deep link (`location.hash` empty) and it has not already played in this tab (`sessionStorage`, wrapped in try/catch).

## Fallbacks and accessibility

- **No JS, reduced motion or failsafe.** Everything is visible at rest: no loader, no canvas, no autoplay, no packets. The carousel shows its first item.
  - Hiding CSS (`opacity:0` or `visibility:hidden`) appears only under `.js:not(.reveal-failsafe)`. That covers reveal start states, overlay closed states and inactive carousel items.
  - The 4s head failsafe stays.
- **Reduced motion.** The team switch, test ticket and Ask my agent still work, with instant steps and no travel.
- **Structure.**
  - One `<h1>`: the headline. Each `<section>` after the hero holds one `<h2>`.
  - The ids `home`, `about`, `team`, `built`, `services`, `stats`, `resume`, `experience`, `work`, `education` and `contact` are all unique. The deep links that subpages use (`#experience`, `#work`, `#suite`, `#contact`) still land.
  - The skip link goes to `#main`.
- **Images.** The hero surface layer is decorative (`alt=""`). The screenshots get real descriptions. The graph is a `<figure>` with a figcaption, and its person cards are buttons with aria-labels.
- **Craft floor.**
  - Text contrast is at least 4.5:1, checked against the real backgrounds; the decorative watermarks are exempt.
  - Text is at least 12px.
  - Touch targets are at least 44px, or have an enlarged hit area.
  - Focus is visible on light and dark grounds.
  - Nothing scrolls sideways at any width.

## Content and copy rules

- **Keys.** `content.json` drops `story` and gains `hero`, `about`, `band`, `ergon` (including `teams` and `ladder`), `built`, `services`, `stats` and `modal`.
  - `resumeHalf` gains `title: "The official version"`.
  - `guide` drops `lines` and gains a `cmd` per question, plus the question "What does Ergon cost?" with the answer "About $100 a person a month."
  - `contact` gains its columns.
  - `wordmark` becomes "Cayleb.AJ"; the `>_` tile is markup.
- **Numbers.**
  - Every digit run in `content.json` must appear in `resume/resume-content.json`.
  - The only exception is `100` written as `$100`, which is Cayleb's documented 2026-10-15 price.
  - Loader digits and the clock come from JS.
- **Jargon.** The existing ban stays for all copy, except keys holding the Built with list (`hero.builtWith`) or terminal text (`terminal`, `cmd`).
  - A new test requires every Built with name to appear in `resume-content.json` (stacks or skills).
- **Banned words stay.**
  - Claims: clients, customers, revenue, profit, returns, hedge fund.
  - Hours/pay/people takes.
  - Model names.
  - Racing words, including "driver" ("print driver" is out).
  - "Illustration".
  - "Pilot" anywhere in the guide except "Windows pilot, live checks pending".
  - Names from both layout references; `lumora` joins the list.
  - Because of these rules, the Shop team's "Returns" app becomes "Refunds".
- **Sample teams** are labelled "Sample team" on the page. Roles are at most 2 words and 16 characters; apps at most 12 characters. They contain no digits, surnames or client names.

## Assets

- **Hero layers.** These are four JPEGs in `assets/hero/`: surface and blueprint, each in a wide 2560×1440 and a tall 1080×2800 version. The tall ones are texture only, so nothing sits behind the phone's stacked text.
  - They are rendered from `scripts/home/hero_scene.html` by `scripts/home/render_hero.mjs` (Playwright, run by hand). The renderer injects the check counts from `resume-content.json`.
  - The outputs are committed, so the site build never needs Playwright.
- **Work screenshots.** `assets/work/{dotz,sophos,suite}.jpg`, 1280×800 at q82, cropped from his own repos:
  - dotz `docs/screenshot.png` @ `2139526`;
  - Sophos `eval-shots/01-welcome.png` @ `33559fc`;
  - industry-ai-suite `…/workbench-before.png` @ `f4a93dd`.
  - Each is recorded in `assets/IMAGES.json` with its source repo, path, commit, crop and sha256.
  - `sophos/assets/sophos-main.png` is avoided because it shows a personal Windows path.
- **Fonts.** Onest 400/500/600/700 (@fontsource/onest 5.3.1) and JetBrains Mono 400/500 (@fontsource/jetbrains-mono 5.3.0) go into `assets/fonts/`.
  - Each gets a `vendor/PROVENANCE.json` entry with its sha256, and `assets/licenses/{onest,jetbrains-mono}-OFL.txt` is added.
  - Onest 600 and 400 are preloaded.
  - Oswald and Space Grotesk leave once nothing loads them; the share card moves to Onest.
- **Share card.** `assets/og/card.png` is redrawn as 1200×630, under 400KB and deterministic, with no "alpha" in the script.
  - Cool grey ground, the `>_` tile and Cayleb.AJ, the headline in Onest 600, "Forward Thinking Engineer", and a dark proof chip.
- **theme-color** is `#090a0b` on every page.

## Subpages

`resume.html`, `projects/*.html`, `lab/` and `404.html` keep their layouts and content. Through `tokens.css` and `base.css` they pick up the new roles: Onest, the cool neutrals and the cyan accent ink.
- Their masthead and footer (`subpage.py`) get the `>_` tile and the new wordmark.
- The nav is rebuilt from `content.nav`.
- 404's agent becomes the `>_` tile.
- Each subpage's own CSS changes only where it named Oswald, Space Grotesk or a removed token.

## What gets removed

- **Water story:**
  - JS: `site/js/story/*` (7 files).
  - Templates and CSS: `story.py`, `story.css`.
  - Content: `content.story`.
  - Tests: `home-story-math.test.js` and the story parts of `home-story.test.js`.
- **three.js:** `vendor/three-0.185.0/`, its 4 PROVENANCE entries, its import-map entries and module preloads, and `assets/licenses/three-MIT.txt`.
- **The guide's speech bubbles:** `guide.lines`, `site/js/guide/queue.js` and the bead SVG. The Q&A stays.
- **The old menu sheet:** `menu.js`'s cloning of the masthead into `#menu-sheet`. It is replaced by the template-built overlay.
- **Oswald and Space Grotesk** files and licences, once the share card and subpages no longer use them.
- **Engine modules** are deleted only if nothing imports them. `ticker`, `spring` and `scroll` stay.
- **Recovery.** The water story stays recoverable at `b0763a3`.

## Tests

All of these keep their intent; only the page they describe changes.

- **Delete:** `home-story-math.test.js`.
- **Rewrite:**
  - `home-structure`:
    - one h1 holding `content.hero.headline`;
    - the new ids and section order;
    - one h2 per section after the hero;
    - one `<main>`, an absolute `header.masthead` and the skip link to `#main`;
    - `<img>` only from `assets/hero/` or `assets/work/`, every one listed in `assets/IMAGES.json`;
    - subpage deep links resolve;
    - PDFs and GitHub links present;
    - racing-word and name bans plus `lumora`;
    - deterministic rebuild;
    - more than 20 `site/` files.
  - `home-shell`:
    - the new `STYLES` and block keys;
    - the head equals the shell's;
    - the import map has Lenis only;
    - Onest preloads;
    - the failsafe, the hiding guard and the keyframe ban stay.
  - `home-content`:
    - the new keys exist;
    - numbers trace, with the `$100` exception;
    - every limit pattern matches;
    - the claim bans stay.
  - `home-few-words`:
    - description ≤16 words;
    - headline ≤10 and lead ≤24;
    - other section headlines ≤8, the About statement ≤30, section bodies ≤40, and card, row and stat lines ≤24;
    - roles, apps and ladder ≤2 words;
    - guide limits;
    - jargon with the two new skip keys.
  - `home-worth`:
    - the hours/pay/people guard over all copy;
    - visible text >3000 characters;
    - the price line `About $100 a person a month.` in the Ergon section;
    - the ladder deep-equals `['Agent','Senior agent','Person']`;
    - no model names.
  - `home-guide`:
    - the Ask my agent markup: dialog, question buttons, `cmd` echoes;
    - it appears after the hero;
    - the pilot rule, the Asmodeus "private" rule and the word budgets stay.
  - `home-polish`: contrast for `--foreground-muted`, `--accent-ink`, `--foreground-on-dark-faint` and the new terminal dim tone; the 404 `>_` tile.
  - `home-contact`:
    - the footer nav and its hrefs;
    - the copyright;
    - no `<img>` or `<canvas>`;
    - the new columns and the Copy button.
  - `home-resume-half`:
    - the markup, content and escaping assertions stay;
    - the CSS pins move to the sheet look: no hex, no keyframes, colour-only transitions;
    - `resumeHalf` gains `title`.
  - `home-vendor`:
    - PROVENANCE sha256s;
    - Onest and JetBrains Mono files and licences;
    - Lenis present, three absent.
  - `site-meta`:
    - the card checks;
    - the script includes `content.hero.headline` and "Forward Thinking Engineer";
    - the title and subpage social tags as today;
    - theme-color.
  - `subpages`: the new wordmark markup; the nav from `content.nav`.
- **Keep unchanged:** `home-engine`, `candidate-resume`, `recruiter-*`, `hosted-lab-uncertainty`, `tests/py/test_make_share_card.py`.
- **Add:**
  - `home-math.test.js` covers the pure helpers:
    - the grid scale-up formula;
    - loader easing, padding and `shouldPlay`;
    - liquid interpolation spacing, the 60-point cap, the fade formula and cover-fit;
    - count-up progress;
    - clock formatting for a fixed instant in America/New_York;
    - carousel wrap;
    - wire paths for both modes;
    - the ladder outcome sequence (of tickets 1–21, 12 stop at Agent, 6 at Senior agent and 3 at Person);
    - the shape of the team data.
  - `home-sections.test.js` covers the markup of the new sections:
    - the loader under the guard;
    - the canvas `aria-hidden`;
    - the carousel's no-JS state;
    - Built with names traced to the résumé;
    - the team radio group;
    - the figure caption;
    - the log `role="log"`;
    - the modal fields with ids and inline errors;
    - no "sent" or "received" claim;
    - the menu dialog.

## Deviations from the reference

1. **Root font size.** The reference's root size jumps (16px→12px at 1441px, 10px↔28px at 640px). It now scales smoothly, with floors.
2. **Hero images.** The before/after photos become two layers rendered from his own content. The surface shows his product; the reveal shows a light blueprint of it. A dark terminal was tried first, but its fade left smoke over the headline.
3. **Made-up content is replaced with his real material:**
   - partners become "Built with";
   - the star rating becomes the proof chip;
   - the stats are his;
   - the studio copy becomes his voice.
4. **Request modal.** The stubbed "Request received" becomes an honest email composer.
5. **Springs** become CSS transitions plus small rAF loops, with the same feel.
6. **Watermark** is `min(13rem, 22vw)` so it fits on phones.
7. **Loader** plays once per tab and never on deep links.
8. **Additions:** the Ergon graph, the official résumé, Ask my agent, and a Connecticut clock in place of "Local time".

## Execution

1. Commit this spec. Cayleb reviews it.
2. Run `superpowers:writing-plans` to write `docs/superpowers/plans/2026-10-15-lumora.md` in the repo's format. Cayleb picks the execution method.
3. Build on `ccr-d07f46e5-5gyzor`. Draft PR #10 tracks it.

## Verification

- **Builds:** `python3 scripts/build-home.py && python3 scripts/build-subpages.py`. Two builds in a row must be byte-identical.
- **Tests:** `node --test tests/*.test.js`, `python3 -m unittest discover -s tests/py`, `python3 scripts/check-release.py`.
- **Playwright QA** (Chromium at `/opt/pw-browsers`, served with `python3 -m http.server`):
  - widths 390, 768, 1280, 1440 and 2560;
  - loader, fold, a cursor reveal, every section, the team switch and a ticket, the menu, the modal (errors and done), and Ask my agent;
  - reduced motion and no JS;
  - a deep link to `#experience`;
  - zero console errors, zero requests to other origins, no horizontal overflow, and contrast sampled on the real backgrounds;
  - `resume.html`, a project page, the lab and 404.
- **Gates:** the site-studio gates (taste lint and the impeccable detector) are run. The lint's house-rule flags for eyebrows, hairlines, mono, blur and shadows are accepted, because the reference calls for them. Contrast and size findings are fixed.
- **Before the PR leaves draft,** Cayleb gets screenshots of the fold and every section, at desktop and phone widths.

## Open items (not blocking)

- **Résumé and PDF bullets** for Ergon stay as they are.
- **Rasters** could switch to WebP later if page weight matters. Today the JPEGs total about 0.7MB, and only the surface layer loads before the loader ends.
