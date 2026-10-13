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


def backdrop_matte(ref: np.ndarray, near: float = 0.08, far: float = 0.16) -> np.ndarray:
    """Alpha from distance to the plain backdrop's colour (the median of the image border)."""
    border = np.concatenate([ref[0], ref[-1], ref[:, 0], ref[:, -1]])
    bg = np.median(border, axis=0)
    dist = np.sqrt(((ref - bg) ** 2).sum(-1))
    return np.clip((dist - near) / (far - near), 0, 1)


def cut(scenes: Path, mattes: Path, name: str, keep_largest=True, clear=(), recover=()) -> Image.Image:
    ref = np.asarray(Image.open(scenes / f"{name}.png").convert("RGB"), dtype=np.float64) / 255
    alpha = np.asarray(Image.open(mattes / f"cut-{name}.png").getchannel("A"), dtype=np.float64) / 255
    alpha = alpha.copy()
    if recover:  # props the matte lost against a plain backdrop — the grey laptop lid on grey
        colour = backdrop_matte(ref)
        for x0, y0, x1, y1 in recover:
            alpha[y0:y1, x0:x1] = np.maximum(alpha[y0:y1, x0:x1], colour[y0:y1, x0:x1])
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


def main(renders: Path, mattes: Path, out: Path) -> list[Path]:
    """Frame the three plain-background renders (hero.png, projects.png, contact.png)."""
    out.mkdir(parents=True, exist_ok=True)
    # Hero — facing the camera: eye-line 60% down the square (the hero scene's own framing),
    # face on the centre line, head about a third of the square.
    hero = cut(renders, mattes, "hero")
    face_x, eye_y, span = 610, 483, 800
    x0, y0 = face_x - span // 2, eye_y - round(0.60 * span)
    portrait = window(hero, x0, y0, x0 + span, y0 + span, (1024, 1024), fade_bottom=90)
    # Projects — typing on the laptop, at 90%: standing on the foot of the frame and ending
    # before the right-hand panels (the laptop's corner would otherwise sit under the stats).
    laptop = cut(renders, mattes, "projects", recover=[(560, 560, 1040, 1024)])
    scaled = laptop.resize((round(laptop.width * 0.9), round(laptop.height * 0.9)), Image.Resampling.LANCZOS)
    projects = Image.new("RGBA", (1186, 1024), (0, 0, 0, 0))
    projects.paste(scaled, (-20, 1024 - scaled.height), scaled)
    # Contact — the wave, as rendered: centred, filling the bottom edge.
    contact = cut(renders, mattes, "contact")
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
