# Instagram story series: handoff

Paused 2026-10-15 in a cloud session that couldn't reach Instagram, couldn't generate in Higgsfield, and had no browser control. Pick this up on the desktop, where an agent can drive Cayleb's logged-in browser. Nothing has been generated and no credits have been spent.

**Visual rule:** the résumé site is being redesigned. Don't use its current version (art, characters, colors, layout) as a reference for anything visual. The look comes from @ink.industries_ and from Cayleb.

## Cayleb's original request (word for word)

> I want to make a couple posts that I can use as promotional material on my Instagram promoting myself and workflows I use but not through typical advertising but more story telling. I really like how this guys videos are directed and the style they use so we're aiming to use higgsfeild and get a similar style https://www.instagram.com/ink.industries_?rpxt=MWt1YTV6OGV4NTA2eg==
>
> Everything down to storytelling, voice, etc... needs to be perfect + well make it a series if it performs well so have this setup with multiple separate stories (none of the videos should link to each other, not that kinda story) just a self contained story. For ideas around the plot I'm ngl idk, we're gonna have to come up with something that appeals to my target audience, shows strong technical ai capabilities, without using to much technical language or visuals. I have some higgsfeild credits, and you might be able to use my browser which is logged in to direct higgsfeild, not sure about that tho.

## Decided so far

| Topic | Decision |
|---|---|
| Format | A series of **self-contained** episodes. No episode refers to another, and there's no running plot. Start with 2–3 and grow if they perform. |
| Style | Match **@ink.industries_**: directing, pacing, storytelling, voice. **Not studied yet.** The cloud session couldn't reach Instagram. |
| Audience | **Owners and hirers.** Stories are set inside small businesses (owners see themselves) and also work as proof for anyone hiring a Forward Thinking Engineer. |
| On screen | A **3D character version of Cayleb**, plus a visible on-screen form for the AI so no code or dashboards are needed. **The look isn't locked.** Design the character and the AI's form fresh with Cayleb, guided by the @ink.industries_ style. Don't copy the site's current renders or its glass-droplet agent. |
| Voice | An **AI clone of Cayleb's own voice**, made in Higgsfield with ElevenLabs. |
| Budget | Cayleb says he has about 60 credits and will move to the lowest paid plan if needed. **Check this.** On 2026-10-15 the connector saw one private workspace on the free plan with 10 credits, not marked as selected. |
| AI brief | The stories should show strong AI capability, in plain words and visuals. |

## Brand facts to stay true to (from this repo)

These cover what he does and how he talks, not how things look.

**Positioning:** Forward Thinking Engineer.
- He shadows people for two days.
- He builds each person an AI agent that fits their day, plus tools for anything digital the company wants automated.
- He teaches them, then scales it across the company.
- Method: Shadow → Understand → Build → Teach → Whole company.
- See `README.md`, `PRODUCT.md` and `site/content.json`.

**Core promise:** "No cuts. No lost pay. The money comes from fixing the busywork." "Nothing off the shelf." People approve before anything goes out.

**Real jobs he's worked (story authenticity):**
- Moving crew
- Pool plaster crew
- Busy coffee shop (Dunkin', 2024–2026)
- Pizzeria (summer 2024)
- High school: cybersecurity, AP Computer Science

**Voice:** few words, plain words, no developer jargon.

**Honesty rules:**
- Stories are illustrative fiction, not client case studies.
- Never name a real business or show its logo in generated video. That rules out Dunkin', Robert H. Lord and David Cooke Plaster.
- Never claim real customers, revenue or savings.
- Toggle Instagram's "AI info" label when posting.

**Character look:** to be designed fresh.
- Ask Cayleb for photos of himself (for likeness) and any style references he likes.
- Don't use the images under `assets/home/` or any other site art as a style reference. The site is mid-redesign.

## Story seeds (drafts, not approved; adapt to the reference style once it's studied)

Shape for every episode: one protagonist, one painful everyday moment, Cayleb quietly watching, then the AI doing the work in a way you can *see*. Show it physically: magnets sliding on a whiteboard, phones buzzing with "Booked", a stack of paper thinning out. End on a human payoff and one closing line.

1. **The Whiteboard.**
   - Setup: 5:40 a.m. at a moving company. A sick driver and a job running long, and the whole day falls apart on the dispatch board.
   - Cayleb spends two days in the corner watching.
   - Turn: the next morning the magnets slide into place and customers get "Crew arriving 9:10."
   - Payoff: the owner's coffee is still hot.
   - Closing line: "I didn't change how they work. I learned it first."
2. **Measure Twice.**
   - Setup: a sun-baked pool-plaster foreman who doesn't trust "the AI guy." He writes his estimates on cardboard at night.
   - Cayleb swings a sledgehammer beside him.
   - Turn: the foreman films a cracked pool, and the estimate is there before he's back in the truck.
   - Closing line: "Respect the work first. Then build around it."
3. **Out of Stock.**
   - Setup: the 7 a.m. rush at an unbranded café. The key item runs out again, and there's a sticky note reading "ORDER MORE."
   - The AI learns the week's rhythm.
   - Turn: a delivery shows up before she knew she needed it.
   - Closing line: "Nobody lost a shift. The shelf just stopped running empty."
4. **Who's Getting Replaced?**
   - Setup: an office worker hears "the AI guy is coming" and assumes she's done.
   - Cayleb just watches her work and asks what she hates doing.
   - Turn: the AI takes the busywork.
   - Payoff: she leaves at 5.
   - Closing line: "The goal was never fewer people. It was fewer wasted hours."
5. **The Tailor** (a metaphor that leans toward hirers).
   - Cayleb measures workdays instead of bodies: how long a phone call runs, how heavy the paperwork is.
   - He cuts an agent to fit.
   - Closing line: "Nothing off the shelf."

## Higgsfield notes (catalog read 2026-10-15)

**Stills and character consistency:**
- Nano Banana Pro or 2.1 with image references.
- Soul Cinema for cinematic stills.
- Soul Cast for keeping a character's identity consistent.
- Once the look is agreed, build a character sheet (front, three-quarter, profile, full body) for Cayleb's character and the AI's on-screen form.

**Video:**
- Cinema Studio Video 3.0: 4–15 s, up to 4K, genre hint, start and end frames.
- Seedance 2.0: strong identity consistency, but std mode **needs Plus**.
- Also listed: Seedance 2.5, MiniMax H3, Grok Video 1.5, Hailuo.
- On 2026-10-12, Seedance 2.5 was refused for needing Plus and GPT Image 2.5 for needing Basic (see `HIGGSFIELD-SHOTS.md`).

**Voice:**
- Clone his voice as a voice element from 1–3 minutes of clean audio, then generate with Eleven v4 (`voice_type: element`).
- Sync Lipsync 3 only if the character ever speaks to camera.

**Cost:** the connector doesn't show credits per generation, so read the cost in the app before every Generate.

## Next steps for the desktop agent

1. **Study the reference.**
   - Open @ink.industries_ in Cayleb's browser and break down 3–5 reels:
     - the hook in the first 1–2 seconds
     - length and aspect ratio
     - number of shots and average shot length
     - camera moves, lens feel, color grade
     - captions and typography
     - narration: point of view, tense, tone, pacing
     - music and sound effects
     - how it ends
   - Write a style guide from it.
2. **Check Higgsfield in the browser.**
   - Real balance and plan, which workspace, and credits per generation for the shortlisted models.
   - Propose a per-episode credit budget.
3. **Pitch concepts and lock the look.**
   - Rework the seeds to fit the style guide, pitch 3–5 to Cayleb, and lock the first 2–3.
   - Agree on the character style and the AI's on-screen form with him, from the style guide plus his photos. Don't take anything from the résumé site.
4. **Write each episode:**
   - logline and beat sheet
   - timed voiceover script, word for word
   - shot list with exact Higgsfield prompts, settings and reference images
   - on-screen text and captions
   - Instagram caption and hashtags
   - cover frame
5. **Make the assets:** character sheet, then stills to lock the look, then image-to-video. Do one full test episode before batching.
6. **Voice:** get a clean sample from Cayleb, make the voice element, then generate the voiceover.
7. **Edit:**
   - 9:16, 1080×1920.
   - Captions burned in, kept out of Instagram's top and bottom UI zones.
   - Music and sound effects.
8. **Never spend credits or upgrade the plan without Cayleb's OK.** Show him the cost first.

## Kickoff prompt to paste on the desktop

> Pick up my Instagram story series. Run `git fetch origin ccr-cdc7daf0-0ggnfh && git checkout ccr-cdc7daf0-0ggnfh` in cayleb-james2008/agentic-resume and read `design/INSTAGRAM-SERIES-HANDOFF.md` top to bottom first: it has my original request word for word and everything we've already decided. Then use my browser (I'm logged into Instagram and Higgsfield) to study @ink.industries_ and check my real Higgsfield credits and costs, and follow the "Next steps" in that doc. My résumé site is being redesigned, so don't use its current version as a reference for anything visual. Ask me before spending any Higgsfield credits or changing my plan.
