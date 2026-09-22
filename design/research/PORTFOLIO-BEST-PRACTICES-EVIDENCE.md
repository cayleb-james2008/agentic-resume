# Portfolio Landing Pages — Evidence Brief (2025–2026)

**Pass type:** web-research fetch only · **No redesign advice**  
**Compiled:** 2026-09-22 (America/New_York)  
**Scope:** high-end personal developer / AI-engineer portfolio landing pages — layout, typography, motion, hero video, case-study presentation, mobile, accessibility; plus what award / Linear–Vercel-adjacent sites are documented as doing.

**Verification legend**
- **VERIFIED** — claim appears in the cited primary/secondary source (quoted or closely paraphrased).
- **UNVERIFIED** — widely asserted in secondary commentary but not confirmed against a primary source in this pass.
- **[unclear]** — gap, conflicting numbers, or insufficient dated primary evidence in this pass.

---

## 1. Award systems & what “high-end” is scored on

### 1.1 Awwwards official weights
| Field | Value |
| --- | --- |
| Source | https://www.awwwards.com/about-evaluation/ |
| Date | [unclear] — page undated; fetched 2026-09-22 |
| Claim | Evaluation uses four weighted criteria: Design 40%, Usability 30%, Creativity 20%, Content 10%. Sites go to a minimum of 18 jury members; three scores furthest from average are eliminated; voting lasts 5 days; HM at jury ≥ 6.5; SOTD is highest-scoring of the day. |
| Status | **VERIFIED** |

> “The evaluation system used to score the websites submitted to awwwards is based on the following 4 criteria: Design: 40% points Usability: 30% points Creativity: 20% points Content: 10% points.”

### 1.2 Awwwards criteria interpreted by a jury-scored practitioner (2026)
| Field | Value |
| --- | --- |
| Source | https://www.hontran.dev/blog/awwwards-judging-criteria |
| Date | July 22, 2026 |
| Claim | Design + Usability = 70%. Usability folds in navigation clarity, performance, responsiveness, accessibility (keyboard, focus, reduced-motion). Creativity is a differentiator (20%), not a foundation. Content (10%) breaks ties; placeholder copy reads as template demos. |
| Status | **VERIFIED** (secondary practitioner / jury-member account; aligns with official weights above) |

> “Design and Usability together are 70% of your score. Creativity — the flashy WebGL, the clever scroll — is only 20%.”

> “Accessibility — keyboard navigation, focus states, and honoring reduced-motion preferences.”

### 1.3 Awwwards playbook claims (same author, 2026)
| Field | Value |
| --- | --- |
| Source | https://www.hontran.dev/blog/how-to-build-an-award-winning-portfolio-site |
| Date | June 27, 2026 |
| Claims | (a) One-sentence concept before code; one signature moment; cut competing ideas. (b) Motion must serve navigation. (c) Animate `transform`/`opacity` only; lazy-init WebGL; cap DPR ≤ 2; aim LCP &lt; 2.5s. (d) Three exceptional case studies beat twelve thumbnails. (e) Ignoring mobile caps scores; long loaders are usability penalties. (f) WebGL not required for SOTD. |
| Status | **VERIFIED** as author claims; **[unclear]** how representative of all 2025–2026 SOTDs beyond this author’s sample |

> “Design + Usability is 70% of your score… A groundbreaking site that takes five seconds to load or confuses navigation scores lower than a clean, fast, beautifully typeset site with modest ambition.”

> “Three exceptional case studies beat twelve thumbnails.”

### 1.4 CSS Design Awards (CSSDA) — 2025 winners + scoring model
| Field | Value |
| --- | --- |
| Source | https://www.cssdesignawards.com/blog/2025-website-of-the-year-winners/430/ |
| Date | 12 Feb 2026 |
| Claim | WOTY 2025 Top 10 includes multiple personal portfolios: Bruno’s Portfolio (Bruno Simon) 8.84; Merouane Bali — Portfolio 8.82. Best Portfolio Site: Bruno Simon. Best Innovation Site: Merouane Bali — Portfolio. |
| Status | **VERIFIED** |

| Field | Value |
| --- | --- |
| Source | https://www.webdesignawards.io/awards/cssda (secondary summary) |
| Date | last reviewed 2026-08-24 |
| Claim | CSSDA judges UI, UX, Innovation; average &gt; 8.00 → Website of the Day; ≥ ~6.0 → Special Kudos. |
| Status | **VERIFIED** as secondary report of CSSDA practice; primary submit-page fetch timed out this pass **[unclear]** exact official wording |

---

## 2. Layout & information architecture (landing)

### 2.1 Hero as positioning / story start (2025 career-portfolio guide)
| Field | Value |
| --- | --- |
| Source | https://blog.opendoorscareers.com/p/designing-your-portfolio-in-2025-a-comprehensive-guide |
| Date | Jul 30, 2025 |
| Claim | Hero should carry a short intro (2–3 lines), clear role statement, 2–3 defining strengths reflected in case studies; optional subtle motion or short video if it adds to the story. Work preview should not be a dense thumbnail grid — prefer impact-forward titles and one focused visual per project. |
| Status | **VERIFIED** (design-career context; transferable structure claims) |

> “A short, well-written intro (2–3 lines max)… A clear, confident statement of what kind of designer you are… Optional: subtle motion, creative framing, or even a short video snippet, if it adds to the story.”

> “Don’t cram in 4 tiny thumbnails per project. One focused, zoomed-in frame is far more convincing.”

### 2.2 Minimal / Swiss-inspired award portfolio layouts (Codrops case studies)
| Field | Value |
| --- | --- |
| Source | https://tympanus.net/codrops/2025/03/05/case-study-stefan-vitasovic-portfolio-2025/ |
| Date | March 5, 2025 |
| Claim | Minimalist design + typographic animations + WebGL video grid + page transitions; Swiss-inspired offset grids, generous empty space, strong typography; homepage acts as welcome then scroll-navigates into projects. |
| Status | **VERIFIED** |

> “The site is based around a minimalist design complemented by dynamic visuals. These include typographic animations, WebGL video grid and seamless page transitions.”

> “This aesthetic, inspired by Swiss print design, blends offset grid layouts with generous empty space and a strong focus on typography.”

| Field | Value |
| --- | --- |
| Source | https://tympanus.net/codrops/2026/03/31/arnaud-roccas-portfolio-from-a-gsap-powered-motion-system-to-fluid-webgl/ |
| Date | March 31, 2026 |
| Claim | Home must be impactful as entry point; project pages use minimalist uncluttered layout, generous white space, neutral palette + per-project accent color. |
| Status | **VERIFIED** |

> “I deliberately went for a minimalist and uncluttered layout with generous white space and neutral colors, although I enhanced this color palette with an accent color that is different for each project.”

### 2.3 NN/g — scanning, first impression, dwell time (older but still cited / last-reviewed)
| Field | Value |
| --- | --- |
| Source | https://www.nngroup.com/articles/how-long-do-users-stay-on-web-pages/ |
| Date | Sep 11, 2011 |
| Claim | Probability of leaving is very high in first ~10 seconds; communicate value proposition within 10 seconds to earn longer attention. |
| Status | **VERIFIED** (classic NN/g; not portfolio-specific) |

> “To gain several minutes of user attention, you must clearly communicate your value proposition within 10 seconds.”

| Field | Value |
| --- | --- |
| Source | https://www.nngroup.com/articles/first-impressions-human-automaticity/ |
| Date | Oct 1, 2017 |
| Claim | Aesthetic judgment can form by ~50 ms; limit accent colors/fonts; grids aid balance; unclear value proposition increases cognitive effort and suspicion. |
| Status | **VERIFIED** |

> “a decision on aesthetics is made as early as 50 milliseconds into visiting a site”

> “Limit accent colors and fonts… Too many colors (more than 4) and too many fonts (more than 2)… can result in the ‘rainbow effect’”

| Field | Value |
| --- | --- |
| Source | https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/ |
| Date | Nov 12, 2017 · last reviewed Aug 19, 2026 |
| Claim | F-pattern and other scan patterns persist on desktop and mobile; antidotes include front-loaded important points, headings, bolding, bullets, cutting unnecessary content. |
| Status | **VERIFIED** |

> “Include the most important points in the first two paragraphs on the page.”

### 2.4 Linear / Vercel-style aesthetic (product sites → portfolio mimicry)
| Field | Value |
| --- | --- |
| Source | https://www.pixeldarts.com/en/post/four-design-principles-behind-stripe-linear-and-vercel |
| Date | May 14, 2026 |
| Claim | Shared traits attributed to Stripe / Linear / Vercel: high contrast, generous whitespace, monochrome base + one accent, sharp geometric typography (Geist cited for Vercel). |
| Status | **VERIFIED** as this blog’s synthesis; **[unclear]** whether Linear/Vercel corp blogs endorse this four-principle framing |

> “Their branding has high contrast, smart usage of white space, and they use a monochrome color foundation.”

| Field | Value |
| --- | --- |
| Source | https://mantlr.com/blog/stripe-linear-vercel-premium-ui |
| Date | May 26, 2026 (verified May 2026) |
| Claim | Recurring craft patterns across Linear/Vercel/Stripe primary sources: interaction density over visual clutter; typography as brand (Inter / Geist / Söhne); color restraint; crafted microstates; physical motion metaphor; obsession with specific cases. |
| Status | **VERIFIED** as synthesis citing Linear Method, Rauno Freiberg craft writing, Stripe dashboard writeups |

| Field | Value |
| --- | --- |
| Source | https://linear.app/now/how-we-redesigned-the-linear-ui |
| Date | March 28, 2024 |
| Claim | Linear redesign goals included reducing visual noise, visual alignment, hierarchy/density of navigation; Inter Display for headings + Inter for body; contrast/theme systems (LCH). |
| Status | **VERIFIED** (product UI, not a personal portfolio — evidence of the aesthetic language often imitated) |

> “We’ve adjusted the sidebar, tabs, headers, and panels to reduce visual noise, maintain visual alignment, and increase the hierarchy and density of navigation elements.”

> “We started using Inter Display to add more expression to our headings… and kept using regular Inter for the rest of the text elements.”

**Gap:** Direct primary essays titled “how to make a Linear/Vercel-style *personal portfolio*” were thin in this pass; most “Linear/Vercel portfolio” hits were template/AI-builder marketing. **[unclear]**

---

## 3. Typography

### 3.1 Award / creative-dev portfolios treat type as interface
| Field | Value |
| --- | --- |
| Source | https://www.hontran.dev/blog/mat-voyce-case-study-award-winning-portfolio |
| Date | June 27, 2026 (describes Jan 2025 Awwwards SOTD) |
| Claim | For kinetic-type portfolio: headlines are hero + navigation cue + personality; per-character/word `transform`/`opacity` timelines via GSAP SplitText. |
| Status | **VERIFIED** |

> “Headlines aren't labels sitting above content — they're the hero, the navigation cue, and the personality.”

### 3.2 Character-assembly / split-text motifs (2025 Codrops)
| Field | Value |
| --- | --- |
| Source | https://tympanus.net/codrops/2025/03/05/case-study-stefan-vitasovic-portfolio-2025/ |
| Date | March 5, 2025 |
| Claim | Principal motion motif: characters-to-word animation; words split into characters that reassemble (mask + x-axis parallax). |
| Status | **VERIFIED** |

### 3.3 Fluid type / clamp tokens for fidelity across breakpoints
| Field | Value |
| --- | --- |
| Source | https://www.hontran.dev/blog/minh-pham-portfolio-case-study |
| Date | June 27, 2026 |
| Claim | Fluid `clamp()` type and gutter tokens used so spacing/type scale hold across viewports on an Awwwards SOTD designer portfolio. |
| Status | **VERIFIED** |

### 3.4 Smashing Magazine — typography-relevant platform features (2024→2025)
| Field | Value |
| --- | --- |
| Source | https://www.smashingmagazine.com/2024/12/new-front-end-features-for-designers-in-2025/ |
| Date | Dec 31, 2024 |
| Claim | Documents broad browser support for `text-wrap: balance` / `pretty`, `clamp()` fluid scales, View Transitions API, `:focus-visible`, scroll snap, responsive HTML video `media` attribute. |
| Status | **VERIFIED** (platform capabilities; not portfolio prescriptions) |

> “By applying the `text-wrap: balance` property, the browser will automatically calculate the number of words and divide them equally between two lines — perfect for page titles…”

### 3.5 Coding-portfolio guide typography restraint (2026)
| Field | Value |
| --- | --- |
| Source | https://thecrit.co/resources/coding-portfolio-guide |
| Date | Feb 2026 |
| Claim | Recommends ≤2 typefaces; cites Next.js font optimization; “real flex” framed as fast loads + clean typography + storytelling case studies (not heavy animation). |
| Status | **VERIFIED** as that guide’s claims |

> “The real flex: Not animations — fast loads, clean typography, and case studies that tell stories”

---

## 4. Motion systems

### 4.1 NN/g motion purpose (restraint)
| Field | Value |
| --- | --- |
| Source | https://www.nngroup.com/articles/animation-purpose-ux/ |
| Date | Jan 12, 2020 |
| Claim | Motion should be subtle, brief, unobtrusive; best for feedback, state change, spatial/nav metaphors, signifiers — not downtime delight. Overuse distracts. |
| Status | **VERIFIED** |

> “when UI animations are subtle, unobtrusive, and brief, they can improve the user experience… But they should not be overused, as they can easily become overwhelming and distract users.”

### 4.2 Shared motion language (not one-off tweens)
| Field | Value |
| --- | --- |
| Source | https://www.hontran.dev/blog/minh-pham-portfolio-case-study · https://www.hontran.dev/blog/mat-voyce-case-study-award-winning-portfolio · https://tympanus.net/codrops/2026/03/31/arnaud-roccas-portfolio-from-a-gsap-powered-motion-system-to-fluid-webgl/ |
| Dates | 2026 |
| Claim | Awarded portfolios document one shared ease/duration scale (GSAP effects / ScrollTrigger reveals); sync smooth-scroll to GSAP ticker; `gsap.matchMedia()` / `prefers-reduced-motion`. |
| Status | **VERIFIED** across multiple case studies |

> Arnaud Rocca (2026): “I then used this Ref to replace the home page WebGL effect with a simple cross-fade… and wrapped all scroll-based animations in gsap.matchMedia()”

### 4.3 Performance-safe properties
| Field | Value |
| --- | --- |
| Source | Hon Tran award guides (2026); Mat Voyce FAQ; Monotonomo CWV (Apr 2026) |
| Claim | Prefer animating `transform` and `opacity`; avoid layout properties (`width`, `top`, `height`, etc.) on scroll for CLS/INP. |
| Status | **VERIFIED** |

### 4.4 Immersive stack snapshot (2026 engineering blog)
| Field | Value |
| --- | --- |
| Source | https://adamarant.com/en/blog/immersive-web-stack-in-2026-lenis-gsap-and-what-to-skip |
| Date | May 28, 2026 (updated Jun 3, 2026) |
| Claim | Production marketing/case-study stack: Lenis (~3 kB) + GSAP + ScrollTrigger; CSS scroll-driven animations as baseline; Motion (ex-Framer Motion) for component UI; View Transitions for page morphs. GSAP Club plugins free since Apr 30, 2025 (Webflow). Accessibility floor: `prefers-reduced-motion` first. |
| Status | **VERIFIED** as that studio’s shipping guidance |

> “Animation that ignores vestibular disorders is not a feature trade-off, it is an accessibility failure.”

### 4.5 Observed Awwwards element patterns (examples, not prescriptions)
| Field | Value |
| --- | --- |
| Source | https://www.awwwards.com/sites/portfolio-2025 (Rauno Freiberg Portfolio 2025) |
| Date | [unclear] listing date; content shows 2025 portfolio elements |
| Claim | Featured elements include Hero Reveal, Horizontal Scroll, Contact motion, Minimap navigation. |
| Status | **VERIFIED** as documented site elements on Awwwards |

---

## 5. Hero video / showreels

### 5.1 One-active-video discipline
| Field | Value |
| --- | --- |
| Source | https://www.hontran.dev/blog/mat-voyce-case-study-award-winning-portfolio |
| Date | June 27, 2026 |
| Claim | Showreel selector: only hovered/selected video plays; others paused posters; lazy-load below fold; swap with transform/opacity. |
| Status | **VERIFIED** |

> “One active video at a time. Only the hovered/selected showreel plays; the rest stay paused posters until needed.”

### 5.2 WebGL video textures + mobile fallback
| Field | Value |
| --- | --- |
| Source | https://tympanus.net/codrops/2025/03/05/case-study-stefan-vitasovic-portfolio-2025/ |
| Date | March 5, 2025 |
| Claim | HD video at 60fps via CDN (Cloudflare R2); WebGL textures with LED/noise overlay for compression tolerance; mobile drops WebGL for native HTML5 video. |
| Status | **VERIFIED** |

> “The mobile version retains the same UI interactions and motion principles with the exception of the WebGL layer… leveraging native HTML5 video elements”

### 5.3 Hero reel + dither/shader treatment
| Field | Value |
| --- | --- |
| Source | https://tympanus.net/codrops/2025/03/25/stas-bondar-25-the-code-techniques-behind-a-next-level-portfolio/ |
| Date | March 25, 2025 |
| Claim | Hero uses reel video with ordered dithering shader; GSAP drives shader uniforms on hover. |
| Status | **VERIFIED** |

### 5.4 LCP / hero media CWV (2026)
| Field | Value |
| --- | --- |
| Source | https://www.monotonomo.com/journal/core-web-vitals-portfolio-sites-2026/ |
| Date | 9 April 2026 |
| Claim | For image heroes: preload LCP image; AVIF primary + JPEG fallback; explicit width/height; never lazy-load LCP; defer noncritical CSS/fonts/scripts. Thresholds cited: LCP 2.5s, INP 200ms, CLS 0.1. Claims ~40% of design portfolios fail ≥1 CWV at p75 (CrUX 2026) — treat as **that article’s statistic**. |
| Status | **VERIFIED** as Monotonomo’s reporting; independent CrUX replication **[unclear]** this pass |

> “Avoid lazy-loading the LCP element… The hero image should use `loading=\"eager\"` or simply omit the attribute entirely.”

**Gap:** Few 2025–2026 *primary* sources specifically prescribe muted autoplay + poster for *developer* portfolio heroes (more common in film/motion portfolios). Treat autoplay norms as **[unclear]** for AI-engineer portfolios unless work is video-native.

---

## 6. Case-study presentation

### 6.1 Scannable decision stories (UX portfolio structure)
| Field | Value |
| --- | --- |
| Source | https://cursa.app/en/article/ux-portfolio-case-studies-a-clear-structure-that-recruiters-can-scan-in-minutes |
| Date | [unclear] — undated page; fetched 2026-09-22 |
| Claim | Header with title, product type, role, timeline/team, tools, outcome headline; problem as tension; process as decisions; research as insight→implication; wireframes with why captions; accessibility section; end with outcomes + “what I’d improve”; consistent section order; headings every 1–2 screens; short paragraphs. |
| Status | **VERIFIED** as that guide’s structure |

### 6.2 Editorial / magazine rhythm in coded portfolios
| Field | Value |
| --- | --- |
| Source | https://thecrit.co/resources/coding-portfolio-guide |
| Date | Feb 2026 |
| Claim | Case study rhythm: context → visuals → reflection; alternate max-width text columns with full-bleed imagery; outcome-led headlines; show messy middle; real metrics when available. |
| Status | **VERIFIED** |

### 6.3 Awarded creative portfolios — project pages as first-class
| Field | Value |
| --- | --- |
| Source | Arnaud Rocca Codrops (Mar 31, 2026); Stefan Vitasović (Mar 5, 2025); Stas Bondar (Mar 25, 2025) |
| Claim | Project/case pages co-equal with home; often per-project visual language; Bondar: case pages reuse techniques from the original client work + section highlighter nav. |
| Status | **VERIFIED** |

### 6.4 Content weight on Awwwards
| Field | Value |
| --- | --- |
| Source | Awwwards evaluation + Hon Tran judging criteria (2026) |
| Claim | Content is 10% but tie-breaking; real copy/imagery/video integrated with design; no lorem. |
| Status | **VERIFIED** |

---

## 7. Mobile

### 7.1 Award/usability pressure on mobile
| Field | Value |
| --- | --- |
| Source | https://www.hontran.dev/blog/how-to-build-an-award-winning-portfolio-site · https://www.hontran.dev/blog/awwwards-judging-criteria |
| Dates | 2026 |
| Claim | Desktop-only masterpieces with broken phone layouts capped; same four Awwwards criteria apply on mobile; Mobile Excellence track referenced against Google mobile criteria (70/100 qualify — **secondary**). |
| Status | **VERIFIED** for “mobile matters to score”; Mobile Excellence numeric threshold **[unclear]** without official PDF in this pass |

### 7.2 Documented mobile adaptations in SOTD-class case studies
| Field | Value |
| --- | --- |
| Source | Stefan Vitasović Codrops, Mar 5, 2025 |
| Claim | Same motion principles; WebGL removed; native video; alternate grid treatments. |
| Status | **VERIFIED** |

| Field | Value |
| --- | --- |
| Source | Stas Bondar Codrops, Mar 25, 2025 |
| Claim | Cases grid column count adapts: 5 desktop / 3 tablet / 1 mobile; Draggable + wheel per column. |
| Status | **VERIFIED** |

### 7.3 CWV mobile concentration of failures
| Field | Value |
| --- | --- |
| Source | Monotonomo CWV portfolios, Apr 9, 2026 |
| Claim | CrUX mobile/desktop separate; failures concentrate on mobile despite same thresholds. |
| Status | **VERIFIED** as that article’s claim |

---

## 8. Accessibility

### 8.1 WCAG technique — `prefers-reduced-motion`
| Field | Value |
| --- | --- |
| Source | https://www.w3.org/WAI/WCAG22/Techniques/css/C39 |
| Date | WCAG 2.2 technique (living); fetched 2026-09-22 |
| Claim | Use `@media (prefers-reduced-motion: reduce)` (or inverse `no-preference`) so interaction-triggered motion can be disabled; relates to 2.3.3 Animation from Interactions. |
| Status | **VERIFIED** |

### 8.2 Portfolio case studies implementing a11y floors
| Field | Value |
| --- | --- |
| Source | Arnaud Rocca Codrops, Mar 31, 2026 |
| Claim | Screen-reader testing beyond automated tools; pair mouseenter/leave with focus/blur; reduced-motion replaces WebGL with crossfade; noscript/`<noscript>` CSS path for JS-off content via SSG. |
| Status | **VERIFIED** |

> “accessibility and creativity are not mutually exclusive.”

| Field | Value |
| --- | --- |
| Source | Smashing Magazine Dec 31, 2024 |
| Claim | Documents `:focus-visible` for keyboard-vs-pointer focus rings; accessible native `<dialog>` / popover patterns. |
| Status | **VERIFIED** |

### 8.3 NN/g homepage process note (credibility vs trendy illegible type)
| Field | Value |
| --- | --- |
| Source | https://www.nngroup.com/articles/case-study-iterative-design-prototyping/ |
| Date | Aug 26, 2018 |
| Claim | “large fonts are both appealing and usable; small text overlaid on images looks trendy but impedes reading.” |
| Status | **VERIFIED** (homepage redesign case; transferable readability claim) |

---

## 9. Popular stacks mentioned (evidence only)

| Stack piece | Where mentioned (2024–2026) | Status |
| --- | --- | --- |
| **Next.js** (App / Pages Router) | Hon Tran award playbook (Jun 2026); Mat Voyce / Minh Pham case studies; Stefan Vitasović Codrops (2025); The Crit coding guide (Feb 2026) | **VERIFIED** frequent |
| **Vercel** hosting | Stefan Vitasović; The Crit; many portfolio deploys | **VERIFIED** frequent |
| **GSAP + ScrollTrigger + SplitText** | Hon Tran; Mat Voyce; Minh Pham; Arnaud Rocca; Stas Bondar; Adam Arant 2026 stack | **VERIFIED** dominant in award case studies |
| **Lenis** (smooth scroll; aka former Studio Freight) | Hon Tran; Arnaud Rocca; Adam Arant (May 2026) | **VERIFIED** frequent in immersive stacks |
| **Framer Motion / Motion** | Stefan Vitasović (Framer Motion → Motion); The Crit; Adam Arant (component UI) | **VERIFIED** |
| **Three.js / React Three Fiber / GLSL** | Hon Tran; Minh Pham; Stefan Vitasović; Stas Bondar | **VERIFIED** when concept needs WebGL |
| **OGL** | Arnaud Rocca (minimal WebGL) | **VERIFIED** in that case study |
| **Astro** | Stas Bondar (static + handcrafted JS) | **VERIFIED** in that case study |
| **Nuxt** | Arnaud Rocca | **VERIFIED** in that case study |
| **Barba.js** page transitions | Stas Bondar | **VERIFIED** in that case study |
| **Matter.js** physics | Stas Bondar falling-text about | **VERIFIED** |
| **Strapi / Prismic** headless CMS | Mat Voyce (Strapi); Arnaud Rocca (Prismic) | **VERIFIED** |
| **Tailwind CSS** | The Crit 2026 coding guide | **VERIFIED** in that guide’s recommendation |
| **anime.js** | Secondary “animated libraries 2026” blog mentions as lighter DOM/SVG option | **UNVERIFIED** as common in Awwwards SOTD primary case studies this pass **[unclear]** |
| **CSS scroll-driven animations / View Transitions API** | Smashing Mag Dec 2024; Adam Arant May 2026 | **VERIFIED** as emerging native options |

---

## 10. What top award / Linear–Vercel-adjacent work is documented as *doing* (descriptive)

| Pattern observed | Evidence anchors | Status |
| --- | --- | --- |
| Typography-first / kinetic hero type | Mat Voyce SOTD; Stefan character-assembly; Awwwards “kinetic hero typography” elements | **VERIFIED** |
| Minimal Swiss / editorial whitespace + offset grids | Stefan Vitasović; Arnaud project pages | **VERIFIED** |
| Horizontal / multi-column project browsing | Rauno Portfolio 2025 elements; Stas Bondar cases page | **VERIFIED** |
| Scroll-as-narrative (pin/scrub) | Hon Tran playbook; Bondar cube/sections | **VERIFIED** |
| Page transitions as signature | Stefan (Motion AnimatePresence); Bondar (Barba + Flip); Smashing View Transitions | **VERIFIED** |
| WebGL only where it earns weight; pause offscreen | Hon Tran; Minh Pham; Stefan mobile drop | **VERIFIED** |
| Showreels with single active video | Mat Voyce | **VERIFIED** |
| High-contrast monochrome + one accent (Linear/Vercel language) | Pixel Darts May 2026; Mantlr May 2026; Linear redesign Mar 2024 | **VERIFIED** as product-brand language; portfolio imitation **[unclear]** frequency |
| CSSDA 2025 elevating personal portfolios (Bruno Simon, Merouane Bali) | CSSDA WOTY post Feb 12, 2026 | **VERIFIED** |
| Fundamentals (design/usability/perf/a11y) outweigh gimmicks in scoring | Awwwards official weights; Hon Tran 2026 | **VERIFIED** |

---

## 11. Gaps / [unclear] after this pass

1. **Official Awwwards Developer Guidelines PDF / Mobile Excellence PDF** — not successfully fetched; numeric “70/100” mobile threshold only via secondary blog.
2. **CSSDA primary “submit/criteria” page** — fetch timeout; scoring details via secondary award directory.
3. **NN/g portfolio-specific studies 2024–2026** — none found; relied on general scanning / motion / first-impression articles (some older).
4. **Smashing Magazine portfolio how-tos 2025–2026** — platform feature roundup found; dedicated “portfolio landing best practices” article not found this pass.
5. **anime.js prevalence on award-winning 2025–2026 portfolios** — not corroborated in Codrops/Awwwards case studies fetched; GSAP dominates those primaries.
6. **Hero video autoplay conventions for AI/dev portfolios** — strong evidence for *motion/film* portfolios; weak primary evidence that autoplay video heroes are standard for AI-engineer resumes.
7. **Quantitative layout norms** (exact type scales, section counts, fold composition %) — sources stay qualitative; no single authoritative numeric “best practice” table.
8. **Direct Linear.app / Vercel.com design-system docs applied to personal portfolios** — mostly third-party synthesis + product redesign posts.

---

## 12. Source index (fetched / cited)

| # | URL | Date (if known) |
| --- | --- | --- |
| 1 | https://www.awwwards.com/about-evaluation/ | undated |
| 2 | https://www.hontran.dev/blog/awwwards-judging-criteria | 2026-07-22 |
| 3 | https://www.hontran.dev/blog/how-to-build-an-award-winning-portfolio-site | 2026-06-27 |
| 4 | https://www.hontran.dev/blog/mat-voyce-case-study-award-winning-portfolio | 2026-06-27 |
| 5 | https://www.hontran.dev/blog/minh-pham-portfolio-case-study | 2026-06-27 |
| 6 | https://tympanus.net/codrops/2025/03/05/case-study-stefan-vitasovic-portfolio-2025/ | 2025-03-05 |
| 7 | https://tympanus.net/codrops/2025/03/25/stas-bondar-25-the-code-techniques-behind-a-next-level-portfolio/ | 2025-03-25 |
| 8 | https://tympanus.net/codrops/2026/03/31/arnaud-roccas-portfolio-from-a-gsap-powered-motion-system-to-fluid-webgl/ | 2026-03-31 |
| 9 | https://www.cssdesignawards.com/blog/2025-website-of-the-year-winners/430/ | 2026-02-12 |
| 10 | https://www.webdesignawards.io/awards/cssda | reviewed 2026-08-24 |
| 11 | https://www.monotonomo.com/journal/core-web-vitals-portfolio-sites-2026/ | 2026-04-09 |
| 12 | https://blog.opendoorscareers.com/p/designing-your-portfolio-in-2025-a-comprehensive-guide | 2025-07-30 |
| 13 | https://cursa.app/en/article/ux-portfolio-case-studies-a-clear-structure-that-recruiters-can-scan-in-minutes | undated |
| 14 | https://thecrit.co/resources/coding-portfolio-guide | 2026-02 |
| 15 | https://www.smashingmagazine.com/2024/12/new-front-end-features-for-designers-in-2025/ | 2024-12-31 |
| 16 | https://www.nngroup.com/articles/animation-purpose-ux/ | 2020-01-12 |
| 17 | https://www.nngroup.com/articles/how-long-do-users-stay-on-web-pages/ | 2011-09-11 |
| 18 | https://www.nngroup.com/articles/first-impressions-human-automaticity/ | 2017-10-01 |
| 19 | https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/ | 2017-11-12 · reviewed 2026-08-19 |
| 20 | https://www.nngroup.com/articles/case-study-iterative-design-prototyping/ | 2018-08-26 |
| 21 | https://www.w3.org/WAI/WCAG22/Techniques/css/C39 | WCAG 2.2 |
| 22 | https://linear.app/now/how-we-redesigned-the-linear-ui | 2024-03-28 |
| 23 | https://www.pixeldarts.com/en/post/four-design-principles-behind-stripe-linear-and-vercel | 2026-05-14 |
| 24 | https://mantlr.com/blog/stripe-linear-vercel-premium-ui | 2026-05-26 |
| 25 | https://adamarant.com/en/blog/immersive-web-stack-in-2026-lenis-gsap-and-what-to-skip | 2026-05-28 |
| 26 | https://www.awwwards.com/sites/portfolio-2025 | undated listing |

---

*End of evidence brief. No redesign recommendations included.*
