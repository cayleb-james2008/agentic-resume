# Homepage imagery: provenance

Every image on the homepage is an illustration. Each one's `alt` starts with "Illustration:", and the footer credits the AI-generated character art. No image contains logos, brand marks, racing imagery or material from the layout reference.

## Character frames: pending

The hero portrait and its maps, the projects figure and the contact figure are still placeholders, listed in `PLACEHOLDERS.json`. `check_assets.py --strict` fails until they are replaced.

They will come from a Pixar-style 3D render of Cayleb, generated in ChatGPT from a photo of him, in casual clothes (a baggy black t-shirt and sweatpants). The path from that render to the frames:
1. Remove the background with rembg (ISNet, no alpha matting).
2. Run `scripts/home/derive_character.py`, after re-measuring its face and eye-line constants on the new render.
3. Run `import_images.py`, then `person_maps.py`.

The style example Cayleb shared in chat is not him and is not used anywhere on the site.

## Work-experience plates (2026-10-12)

The seven timeline plates are line drawings, one per job, made by `scripts/home/make_plates.py`. No AI is involved in these. Each plate layers:
- the hero's contour field, frozen;
- a cyan halftone bloom;
- the drawing itself, at the lower left.

The plate's middle stays clear for the year and title. Each alt reads "Illustration: line drawing of …". These plates stand in for generated scenes of Cayleb's character, which haven't been made yet. To replace any plate, run `python3 scripts/home/import_images.py --kind plate SRC.png assets/home/experience/<name>.webp`, then update that entry's alt in `site/content.json`.

The generated scenes are meant to be made in ChatGPT from the same character render, in a single chat, using this style paragraph:

> Use the attached image as the character reference for every image in this chat. Keep the exact same person: same face shape, skin tone, curly black hair and dark rectangular glasses. Render him as a 3D animated-feature-film character with soft global illumination, subtle subsurface skin and clean modern materials. Use a slightly desaturated palette with near-white and near-black, and one cyan accent (#02D2E3) somewhere in the scene. Put no text, logos, brand names or signage anywhere. Use an editorial composition with the subject in the left or centre third. Landscape 1536×1024.

The seven scenes are:
1. café counter (2024–2026)
2. pizzeria oven (2024)
3. moving crew (2025–2026)
4. plaster wall (2026)
5. classroom coding (2026)
6. two-monitor desk with the glass-droplet agent (2026)
7. sitting beside a coworker taking notes, with the agent (2026)

The footer credit reads "Character art generated with AI", because only the character frames are AI-generated.
