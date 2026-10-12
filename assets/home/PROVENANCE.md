# Homepage imagery: provenance

Every image on the homepage is an AI-generated illustration of Cayleb as a Pixar-style 3D character: brown hair, glasses, a black button shirt and jeans. Every `alt` starts with "Illustration:", and the footer reads "Illustrations generated with AI". The style example Cayleb shared in chat (a different person in a mint jacket) is not him, and nothing on the site uses it.

## Source (2026-10-12)

Cayleb generated seven scenes of his character in ChatGPT and supplied them in chat. Each is 1536×1024. The originals are not stored in the repo.

| Plate (`experience/`) | Scene | Timeline entry |
|---|---|---|
| `2024-dunkin.webp` | handing a coffee across a Dunkin' counter | Dunkin', 2024–2026 |
| `2024-pizza.webp` | sliding a pizza out of a brick oven | Tommy's Pizza, 2024 |
| `2025-moving.webp` | assembling a desk in a warehouse | Robert H. Lord Company, 2025 & 2026 |
| `2026-plaster.webp` | breaking up old pool plaster with a sledgehammer | David Cooke Plaster Co., 2026 |
| `2026-school.webp` | coding at a classroom computer | Portland High School, 2026 |
| `2026-builds.webp` | at a desk with two monitors and his glass-droplet AI agent | dotz · Sophos · AI Suite, 2026 |
| `2026-integrator.webp` | beside a coworker, taking notes, the agent between them | AI workflow integration, 2026 |

The café scene shows Dunkin' branding and the pizzeria has a "TOMMY PIZZA" sign. Cayleb chose to keep both as generated. Each plate is centre-cropped to 1431×1024 by `scripts/home/import_images.py --kind plate`.

## Character frames

All three character frames are cut from three of those scenes.

1. The background is removed with rembg 2.0.85, using the ISNet `isnet-general-use` model. Alpha matting is left off because it produced blocky edges.
2. `scripts/home/derive_scenes.py` frames each cut-out. It uses the helpers in `derive_character.py`:
   - keep the largest matte component;
   - clear props the matte kept: the agent droplet, chair backs and the coworker;
   - decontaminate the soft edge against the local backdrop;
   - crop and scale.
3. `import_images.py` encodes the frames. `person_maps.py` derives the hero's diffuse, alpha, depth, normal and veil maps from the portrait.

| File | From | Frame |
|---|---|---|
| `hero/person-*.webp`, `hero/veil-mask.png` | classroom | 1024² portrait. Face on the centre line, eye-line 60% down, head about a third of the square, matching the hero scene's framing so the headset fills the headroom. The chest fades out over the last 90 px. |
| `projects/figure.webp` | two monitors | 1186×1024. Head to hands, typing, height-filling, pinned left so he clears the right-hand panels. His hands melt into the dark band. |
| `contact/figure.webp` | coworker | 1536×1024. Him alone with the tablet, filling the bottom edge, centred. |

`hero/noise.webp` is procedural (`scripts/home/make_noise.py`).

## Fallback drawings

`scripts/home/make_plates.py` draws a line-art plate for each job, using the site's contour field and a cyan halftone. These plates are not used on the site now. They stay available as a no-AI fallback.
