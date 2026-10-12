# Homepage imagery: provenance

Every image on the homepage is an illustration of Cayleb as a 3D animated-style character. Each one's `alt` starts with "Illustration:", and the footer credits AI-generated illustrations. No image contains logos, brand marks, racing imagery or material from the layout reference.

## Character frames (2026-10-12)

**Source.** One character render that Cayleb supplied in chat on 2026-10-12. It is an AI-generated 3D animated-style image of him: crouching, mint jacket, checked shirt, glasses, plain mauve backdrop, 1024×1300. The generator was not recorded. The render itself is not stored in the repo (sha256 `07d751db1e7aac2ac84f293f7c9abe431f7481e782f54e5c8fe7d1d1989edd96`).

**Process.**
1. Background removed with rembg 2.0.85 using the ISNet `isnet-general-use` model, without alpha matting, which left blocky edges.
2. `scripts/home/derive_character.py` keeps the largest matte component and decontaminates the soft edge against the estimated backdrop. It then frames the three images below.
3. `scripts/home/import_images.py` encodes each one. `scripts/home/person_maps.py` derives the hero's diffuse, alpha, depth, normal and veil maps from the portrait.

| File | Frame |
|---|---|
| `hero/person-*.webp`, `hero/veil-mask.png` | 1024² portrait. Face on the centre line and eye-line 60% down the square, matching the hero scene's subject framing, so the headset fills the headroom. The window cuts his right arm, which fades out over 60 source px. |
| `projects/figure.webp` | 1186×1024. The whole crouched figure, 1000 px tall, standing on the foot, with its left edge at x 150 so it clears the right-hand panels. |
| `contact/figure.webp` | 1536×1024. Head to knees, filling the bottom edge, centred. |

`hero/noise.webp` is procedural (`scripts/home/make_noise.py`).

## Work-experience plates

The seven timeline plates are still generated placeholders, listed in `PLACEHOLDERS.json`. They are to be generated in ChatGPT from the same character render, one chat, using this style paragraph:

> Use the attached image as the character reference for every image in this chat. Keep the exact same person: same face shape, skin tone, curly black hair and dark rectangular glasses. Render him as a 3D animated-feature-film character with soft global illumination, subtle subsurface skin and clean modern materials. Use a slightly desaturated palette with near-white and near-black, and one cyan accent (#02D2E3) somewhere in the scene. Put no text, logos, brand names or signage anywhere. Use an editorial composition with the subject in the left or centre third. Landscape 1536×1024.

Scenes: café counter (2024–2026), pizzeria oven (2024), moving crew (2025–2026), plaster wall (2026), classroom coding (2026), two-monitor desk with the glass-droplet agent (2026), sitting beside a coworker taking notes with the agent (2026). Each is imported with `import_images.py --kind plate`.
