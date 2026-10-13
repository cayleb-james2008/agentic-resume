# Homepage imagery: provenance

Every image on the homepage is an AI-generated illustration of Cayleb as a Pixar-style 3D character: brown hair, glasses, a black button shirt and jeans. Every `alt` starts with "Illustration:", and the footer reads "Illustrations generated with AI". The style example Cayleb shared in chat (a different person in a mint jacket) is not him, and nothing on the site uses it.

## Source (2026-10-12)

Cayleb generated seven scenes of his character in ChatGPT and supplied them in chat. Each is 1536×1024. The originals are not stored in the repo.

| Plate (`experience/`) | Scene | Timeline entry |
|---|---|---|
| `2024-dunkin.webp` | handing a coffee across a Dunkin' counter | Dunkin', 2024–2026 |
| `2024-pizza.webp` | sliding a pizza out of a brick oven | Tommy's Pizza, 2024 |
| `2025-moving.webp` | assembling a desk in a warehouse | Robert H. Lord Company, summer 2025, then 2026–present |
| `2026-plaster.webp` | breaking up old pool plaster with a sledgehammer | David Cooke Plaster Co., 2026 |
| `2026-school.webp` | coding at a classroom computer | Portland High School, 2022–2026 |
| `2026-builds.webp` | at a desk with two monitors and his glass-droplet AI agent | dotz · Sophos · AI Suite, since 2025 |
| `2026-integrator.webp` | beside a coworker, taking notes, the agent between them | AI workflow integration, 2026 |

The café scene shows Dunkin' branding and the pizzeria has a "TOMMY PIZZA" sign. Cayleb chose to keep both as generated. Each plate is centre-cropped to 1431×1024 by `scripts/home/import_images.py --kind plate`. `scripts/home/make_plate_sizes.py` adds a 960×687 copy of each (`*-960.webp`) for phones and the side rows.

## Character frames (plain-background renders)

Cayleb also supplied three plain-background renders of the same character, made in the same ChatGPT chat as the scenes:
- `hero.png`: waist-up, facing the camera, 1254².
- `projects.png`: typing on a laptop, 1536×1024.
- `contact.png`: waving, 1536×1024.

These aren't stored in the repo either.

1. The background is removed with rembg 2.0.85, using the ISNet `isnet-general-use` model, no alpha matting.
2. On the laptop render, the matte lost the grey lid against the grey backdrop. A backdrop-distance matte restores it inside the laptop's box.
3. `scripts/home/derive_scenes.py` frames the three renders.
4. `import_images.py` encodes them. `person_maps.py` derives the hero maps.

| File | From | Frame |
|---|---|---|
| `hero/person-*.webp`, `hero/veil-mask.png` | hero.png | 1024² portrait. Face on the centre line, eye-line 60% down, the chest fading out over the last 90 px. |
| `projects/figure.webp` | projects.png | 1186×1024, at 90% scale, standing on the foot. On desktop the CSS caps the figure at 55cqw tall so the laptop stays left of the stats panel. |
| `contact/figure.webp` | contact.png | 1536×1024, as rendered: centred, filling the bottom edge. |

`hero/noise.webp` is procedural (`scripts/home/make_noise.py`).

## Fallback drawings

`scripts/home/make_plates.py` draws a line-art plate for each job, using the site's contour field and a cyan halftone. These plates are not used on the site now. They stay available as a no-AI fallback.

## Share card

`assets/og/card.png` (1200×630) is drawn by `scripts/home/make_share_card.py` from the hero maps above (`person-diffuse` with `person-alpha` as its matte), the site's fonts and a flat drawing of his droplet agent. Its `og:image:alt` begins "Illustration:".
