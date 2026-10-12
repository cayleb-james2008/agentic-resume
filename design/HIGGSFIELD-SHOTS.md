# Higgsfield shot list — refraction pass

## Installed optical loop · 2026-10-12

The hero now includes an 8-second, 24 fps environmental light loop rendered with
Python/NumPy and FFmpeg in Higgsfield `sandbox_exec`, exported through its media
upload/confirm tools. It is a procedural ray-density simulation, not AI-generated
video. Both model submissions were rejected before generation: Seedance 2.5
required Plus; GPT Image 2.5 required Basic. No generation job was created.

The delivered assets are 960×540, silent, and loop through periodic wave phases.
The WebM is 26,632 bytes; the MP4 fallback is 67,106 bytes. The reproducible source
is `scripts/render-caustics.py`; hashes and method are in
`assets/motion/higgsfield-clips.json`. Character images were not used by the
renderer and remain unchanged. Reduced-motion and Professional views do not load
the clip. Explore loads it only when the hero enters view, and pauses it when
offscreen, hidden, or paused with either motion control.

### Earlier optional model-generation brief

The notes below record the earlier proposed shot, not the provenance of the
installed procedural loop. Current model availability and pricing supersede
those earlier catalog observations.

Checked 2026-10-12 through the Higgsfield connector: private workspace, free plan, 10 credits, no earlier generations. The connector can read the model catalog but cannot generate, so these shots run in the Higgsfield web app. Per-generation credit cost is not exposed through the connector; check the cost the app shows before you press generate.

The site is complete without any of this. The hero light path, story motion and indicators are code. A plate only adds depth behind Mofu.

## The one rule

Plates are light, never characters. Mofu, Pip, Folio and Loam stay the approved frame packs, used unchanged. Don't feed their PNGs into a video model for anything shown on the site: a generated clip redraws the approved geometry, which `DESIGN.md` and `characters/verification.json` rule out.

## Shot 1 — Hero caustic plate (worth the credits)

Light rippling as if it passed through a glass droplet, playing slowly behind Mofu. The page screen-blends it and fades it out with a radial mask, so a dark background and soft edges matter more than detail.

**Step A — still (used as start and end frame)**

- Model: Nano Banana 2 · 1k · 16:9 (Cinema Studio Image 2.5 at 1k is the richer alternative)
- Prompt:
  > Soft caustic light patterns projected on a deep indigo-black surface, as if light passes through a glass droplet of water. Pale cyan, lavender and faint peach refractions in gentle rippling ribbons. Very dark background close to #1e1e2e, a soft central glow fading to black at every edge. No objects, no visible glass, no text, no people. Minimal, macro photography, high dynamic range.

**Step B — seamless loop**

- Model: Seedance 2.0 Mini (budget) · 720p · 16:9 · 8 s · `generate_audio: false`
- Media: `start_image` = the still, `end_image` = the same still, so the last frame meets the first.
- Prompt:
  > Locked-off camera, no camera movement. The caustic light ribbons drift and ripple slowly, like light refracting through gently moving water in a glass. No new objects appear. Colours stay pale cyan, lavender and faint peach on near-black. The final frame matches the first frame exactly.
- If Mini wobbles or adds objects, rerun on Seedance 2.0 (std, 720p) with the same inputs.
- 8 seconds matches the site's ambient clock, though the plate loops on its own.

**Install**

```sh
ffmpeg -i higgsfield.mp4 -t 8 -vf "scale=1280:-2,fps=24" -an -c:v libvpx-vp9 -b:v 600k -row-mt 1 assets/motion/hero-caustics.webm
ffmpeg -i higgsfield.mp4 -t 8 -vf "scale=1280:-2,fps=24" -an -c:v libx264 -crf 28 -preset slow -pix_fmt yuv420p -movflags +faststart assets/motion/hero-caustics.mp4
ffmpeg -i higgsfield.mp4 -frames:v 1 -vf "scale=1280:-2" assets/motion/hero-caustics.webp
python3 scripts/build-remake.py
```

Then set `"status"` in `assets/motion/higgsfield-clips.json` to the generation date and model. Aim for each video under about 1.5 MB.

What the page does with it: the build injects a muted, chrome-free `<video>` only when a file exists. It loads on first use, plays only while the hero is on screen in Explore mode, pauses offscreen, in Professional mode and when ambient motion is paused, and is never loaded when the visitor prefers reduced motion.

## Not needed

- A separate 9:16 phone plate. The 16:9 plate is cropped with `object-fit: cover` and masked, so it already fits narrow screens.
- Per-character story plates. Each chapter already shifts its aura colour in CSS; more video there would compete with the record cards.

## Off-site only

For a social teaser of Mofu (like the earlier brag reel), Seedance 2.0 with the canonical PNG as `start_image` or Cinema Studio Video 3.0 can animate the character. Keep that output off the site and label it as a generated animation, since it is not the approved frame pack.
