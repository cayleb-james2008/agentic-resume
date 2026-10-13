"""Frame the hero portrait, projects figure and contact figure from Cayleb's generated scenes.

    python3 scripts/home/derive_scenes.py SCENES_DIR MATTES_DIR OUT_DIR

SCENES_DIR holds the timeline scenes as <name>.png (1536×1024; kept out of the
repo — the encoded plates under assets/home/experience are what ships).
MATTES_DIR holds rembg's ISNet (`isnet-general-use`, no alpha matting) cut of
each as cut-<name>.png; only its alpha is read. Writes portrait.png (1024²,
for person_maps.py), projects.png (1186×1024) and contact.png (1536×1024) for
import_images.py. Face centres and eye-lines below are measured on those
renders, in their pixels.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from derive_character import decontaminate, largest_component, window  # noqa: E402


def cut(scenes: Path, mattes: Path, name: str, keep_largest=True, clear=()) -> Image.Image:
    ref = np.asarray(Image.open(scenes / f"{name}.png").convert("RGB"), dtype=np.float64) / 255
    alpha = np.asarray(Image.open(mattes / f"cut-{name}.png").getchannel("A"), dtype=np.float64) / 255
    alpha = alpha.copy()
    for x0, y0, x1, y1 in clear:  # props the matte kept: the agent droplet, chair backs, the coworker
        alpha[y0:y1, x0:x1] = 0
    if keep_largest:
        alpha = largest_component(alpha)
    fg, alpha = decontaminate(ref, alpha)
    return Image.fromarray(np.round(np.dstack([fg, alpha]) * 255).astype(np.uint8), "RGBA")


def fill_height(img: Image.Image, size: tuple[int, int], left: int | None = None) -> Image.Image:
    """Scale to the canvas height and set it at `left` (centred when None) on a transparent canvas."""
    w, h = size
    img = img.resize((round(img.width * h / img.height), h), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    canvas.paste(img, ((w - img.width) // 2 if left is None else left, 0), img)
    return canvas


def main(scenes: Path, mattes: Path, out: Path) -> list[Path]:
    out.mkdir(parents=True, exist_ok=True)
    # Hero — the classroom shot, facing the camera: eye-line 60% down the square (the hero
    # scene's own framing), face on the centre line, head about a third of the square.
    school = cut(scenes, mattes, "2026-school")
    face_x, eye_y, span = 600, 188, 890
    x0, y0 = face_x - span // 2, eye_y - round(0.60 * span)
    portrait = window(school, x0, y0, x0 + span, y0 + span, (1024, 1024), fade_bottom=90)
    # Projects — the two-monitor shot, typing: head to hands, height-filling, left of the panels.
    builds = cut(scenes, mattes, "2026-builds", clear=[(225, 215, 385, 366), (0, 430, 192, 1024)])
    projects = fill_height(window(builds, 110, -40, 1150, 860, (1040, 900), fade_right=80), (1186, 1024), left=0)
    # Contact — beside the coworker, him alone with the tablet, filling the bottom edge, centred.
    integrator = cut(scenes, mattes, "2026-integrator", keep_largest=False,
                     clear=[(672, 0, 1536, 560), (712, 560, 1536, 1024)])
    contact = fill_height(window(integrator, 0, -60, 760, 760, (760, 820), fade_right=50), (1536, 1024))
    written = []
    for name, image in (("portrait.png", portrait), ("projects.png", projects), ("contact.png", contact)):
        image.save(out / name)
        written.append(out / name)
    return written


if __name__ == "__main__":
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    for path in main(*map(Path, sys.argv[1:4])):
        print(path)
