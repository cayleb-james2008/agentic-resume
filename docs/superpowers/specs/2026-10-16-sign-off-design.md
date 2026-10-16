# "Sign-off" homepage: design

**Date:** 2026-10-16. Asked in chat:
- "I'm trying to appeal to my ideal customer of tech businesses like Anthropic, Apple, Google, etc., as well as businesses that are looking to get with the times and integrate AI. With that in mind can you completely remake my resume site using the top 3 design skills."
- "Integrate AI into their site" was a typo: he meant AI on their team, automating busywork.

## Decisions from Cayleb (2026-10-16)

1. **Audience: both, two doors.** One headline that works for both readers, then two clear paths: "I'm hiring" (the résumé, the shipped work, the test counts) and "I run a team" (what he builds for a business).
2. **Offer unchanged.** AI employees, workflows and automations for teams, remote support and Ergon. Not website AI.
3. **Signature moment: a live Ask bar in the hero.** Ask anything about Cayleb; the answer streams in with links to where it comes from. It runs in the browser on answers written ahead of time: no model, no key, and it says so plainly. It doubles as a demonstration of the kind of assistant he builds.
4. **Scope: the whole site, one look.** Homepage, résumé page, all 15 project pages, the lab and 404, the share card and favicon. URLs, PDFs, résumé data and every claim rule stay exactly as they are.

## Skills

- **frontend-design.** Ground the look in the subject; make one bold move; avoid the generated-page defaults (cream and serif with a clay accent, near-black with acid green, the SaaS card kit, eyebrows and middle-dot meta and arrows everywhere).
- **design-taste-frontend.** Read the brief, set the dials, then run its pre-flight checklist: no em dashes, one accent, one shape system, hero within the viewport, at most one eyebrow per three sections, no duplicate CTA intent, no scroll cue or locale strip, real images, reduced motion.
- **emil-design-eng.** Motion only with a reason; custom ease-out curves; UI under 300ms; buttons press to 97%; hover only under a fine pointer; transitions over keyframes; nothing animates from nothing.

## Design read

An engineer's portfolio with a small-business offer, for frontier-lab hiring managers and team owners. The language is calm, precise and product-grade, built with native CSS, one variable grotesk, and one live component as the hero. The dials: variance 6, motion 5, density 3.

## Intent

In everything Cayleb builds, **a person signs off**: drafts wait for approval, tickets climb to a person, every connection has an undo. The look takes that literally. Its one accent is the blue of signature ink, and it marks only the places where a person decides:
- the primary actions
- links
- the Person step on Ergon's ladder
- the last step of Work with me, where the team takes over

Everything else is quiet cool neutrals. The bold move is the headline: wide, heavy Mona Sans across the page.

## Page

```
masthead: Cayleb.AJ (blue full stop)    Work  Work with me  Ergon  Résumé  Contact   [Ask /]
#home      Forward Thinking Engineer
           Show me how you work.
           I'll find where AI fits.
           one plain line        ┌ Ask about Cayleb ───────────────┐
           [I'm hiring] [I run   │ greeting, field, four chips,    │
            a team]              │ answer + sources, every question│
                                 └─────────────────────────────────┘
#built     Built and tested: Ergon featured (checklist, status, count), then an index of four;
           a preview frame follows the row you point at or tab to on a wide screen.
#services  Work with me: Shadow, Map, Build, Teach (numbered: a real sequence), the offers, Get in touch.
#team      Ergon: copy, price, status, ladder; the live team graph beside it.
#resume    The official version: PDFs and the track record at its head; experience, projects, education.
#contact   Show me how your team works. Get in touch, the address and a copy button, the footer.
```

There are five layout families:
- a hero with a live component
- a featured block over an index
- a process track
- a split with a live figure
- a document sheet

Every section is a single column under 768px.

## Tokens

| Role | Light | Dark |
|---|---|---|
| Ground | `#f5f6f8` | `#121a2b` |
| Raised | `#ffffff` | `#1a2338` |
| Text | `#121a2b` (16.1:1) | `#e9ecf2` (14.7:1) |
| Secondary | `#4a5468` (7.0:1) | `#a7b0c2` (8.0:1) |
| Hairline / control border | `#dce0e7` / `#7c8598` (3.4:1) | `#2a3550` / `#66728f` (3.6:1) |
| Signature blue | `#2340d8` (6.9:1; 7.5:1 under white) | `#8c9bff` (6.8:1) |

Pending amber and fixed green appear only for real states: Ergon's status, its tickets and fixes, and the lab's results.

**Type.** Mona Sans only, variable (width 75–125, weight 200–900), vendored as one 98 KB file. Display runs at 118% width and weight 600–660 with tight tracking. The fluid steps run from 13px to 76px.

**Shape.** 16px for panels, pills for anything you press.

## The Ask bar

- **Data.** Answers live in `site/content.json`, `guide.questions`, held to every copy rule. Each answer carries its keywords, its sources and, for four of them, a suggestion chip.
- **Matching.** `site/js/ask/match.js` normalises the question (accents, apostrophes, punctuation), drops stop words, maps synonyms and stems the rest.
  - It scores each written question by the words they share. Weights run: one-word keyword 3, a keyword phrase's or the question's own words 2, the answer's 0.5. Each is multiplied by the word's rarity (idf).
  - A word one letter off a known word still counts, at 0.7.
  - A matching phrase adds 2.5. Typing a written question exactly always picks it.
- **Deciding.** It answers when the best score is at least 1.5 and 1.25 times the runner-up. Otherwise it says Cayleb hasn't written an answer to that, offers the closest three, and offers Get in touch, which opens the composer with the question drafted.
- **Honesty.**
  - The greeting says where answers come from.
  - Each answer shows the question it was matched to and its sources.
  - Nothing is sent anywhere.
  - Words the copy rules keep out of the content (client, pilot, language names) are heard only through synonyms in code.
- **Access.**
  - The field has a real label and `aria-keyshortcuts="/"`.
  - A polite live region hears each answer once; the streamed copy is `aria-hidden`.
  - The sources are inert until the text is whole.
  - `/` focuses the field, except while typing in a field, when a modifier key is held, or when a dialog is open.
  - Escape finishes the stream, or else clears the field.
  - Without the script, the field is hidden and every question and answer is listed.
- **No layout shift.** A hidden copy of the full answer sizes the box on the keypress, so the text streams in without moving anything.

## Motion

- **The one entrance.** The hero's pieces rise 12px and fade in, 600ms, `cubic-bezier(0.23, 1, 0.32, 1)`, 70ms apart. The head script starts it, under motion allowed only.
- **Everything else answers an action:**
  - the stream: 3 characters every 16ms
  - the preview wipe: `clip-path` with WAAPI, 320ms
  - button press: 97% at 160ms
  - the Ergon graph: autoplay only while on screen and motion allowed
- **No keyframes and no smooth-scroll library.**
- **When motion is off.** With motion reduced: no movement, no stream, no wipe. With scripts off or the 4-second failsafe tripped, nothing is hidden.

## Claims carried over

Unchanged and test-held:
- "Forward Thinking Engineer" and the headline.
- About $100 a person a month.
- "Windows pilot · live checks pending", now also beside Ergon's featured claims.
- Agent → Senior agent → Person, with no model names.
- No clients, revenue, profit or returns.
- No savings from anyone's hours, pay or people.
- Every number traces to the résumé.
- Work ethic jobs; no certifications.
- Recorded demos only.
- No picture of Cayleb.

## Removed

From the tech-studio homepage (`851ba6c`):
- the loader
- the liquid reveal and its four picture layers, with their renderer
- the carousel
- the Built with strip
- the clock and locale strip
- the scroll cue
- the About band
- the count-up
- Lenis
- the terminals and the `>_` tile
- the full-screen menu
- the floating "Ask my agent" pill
- Onest and JetBrains Mono

Also removed: the dead top-level `css/` and `js/`, the asset bundler and its unused npm dependencies.
