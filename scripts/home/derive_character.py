"""Derive the homepage's character frames from Cayleb's character render.

    python3 scripts/home/derive_character.py REFERENCE.png MATTE.png OUT_DIR

REFERENCE is the character render Cayleb supplied (kept out of the repo).
MATTE is its background-removed copy (rembg, ISNet `isnet-general-use`), whose
alpha channel is the only thing read from it. Writes OUT_DIR/portrait.png
(1024², fed to person_maps.py), OUT_DIR/projects.png (1186×1024) and
OUT_DIR/contact.png (1536×1024); import_images.py then encodes them in place.

Steps: keep the figure's largest alpha component, decontaminate the soft edge
against the estimated backdrop (so no mauve haze rides along the hair), then
crop and scale into each frame. The frame numbers are measured on the
2026-10-12 render (face centre x≈410, eye-line y≈270) — see PROVENANCE.md.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage


def largest_component(alpha: np.ndarray, grow: int = 6) -> np.ndarray:
    """Alpha with everything but the biggest solid region (grown by its soft edge) cleared."""
    solid = alpha > 0.5
    labels, count = ndimage.label(solid)
    if not count:
        return alpha
    sizes = ndimage.sum(solid, labels, range(1, count + 1))
    keep = ndimage.binary_dilation(labels == 1 + int(np.argmax(sizes)), iterations=grow)
    return np.where(keep, alpha, 0.0)


def decontaminate(ref: np.ndarray, alpha: np.ndarray, sigma: float = 24) -> tuple[np.ndarray, np.ndarray]:
    """Solve C = a·F + (1 − a)·B for F on the soft edge; B is a masked blur of the pure backdrop.

    Returns the foreground colour and the matte tightened by 6% so no backdrop haze survives.
    """
    bg = (alpha < 0.02).astype(np.float64)
    num = np.stack([ndimage.gaussian_filter(ref[..., c] * bg, sigma) for c in range(3)], -1)
    den = ndimage.gaussian_filter(bg, sigma)[..., None]
    backdrop = num / np.maximum(den, 1e-4)
    a = alpha[..., None]
    fg = np.where(a > 0.04, (ref - (1 - a) * backdrop) / np.maximum(a, 0.04), ref)
    fg = np.where(a >= 0.98, ref, np.clip(fg, 0, 1))
    return fg, np.clip((alpha - 0.06) / 0.94, 0, 1)


def window(img: Image.Image, x0: int, y0: int, x1: int, y1: int, size: tuple[int, int],
           fade_right: int = 0, fade_bottom: int = 0) -> Image.Image:
    """Crop [x0,x1)×[y0,y1) — padded transparent past the image — optionally fading a cut edge, then scale."""
    canvas = Image.new("RGBA", (x1 - x0, y1 - y0), (0, 0, 0, 0))
    canvas.paste(img, (-x0, -y0))
    if fade_right or fade_bottom:
        arr = np.asarray(canvas, dtype=np.float64).copy()
        h, w = arr.shape[:2]
        ramp = np.ones((h, w))
        if fade_right:
            ramp *= np.clip((w - 1 - np.arange(w)) / fade_right, 0, 1)[None, :] ** 1.5
        if fade_bottom:
            ramp *= np.clip((h - 1 - np.arange(h)) / fade_bottom, 0, 1)[:, None] ** 1.5
        arr[..., 3] *= ramp
        canvas = Image.fromarray(np.round(arr).astype(np.uint8), "RGBA")
    return canvas.resize(size, Image.Resampling.LANCZOS)


def place(img: Image.Image, size: tuple[int, int], left: int, top: int, height: int) -> Image.Image:
    """Scale the figure's bounding box to `height` and set it at (left, top) on a transparent canvas."""
    fig = img.crop(img.getchannel("A").getbbox())
    fig = fig.resize((round(fig.width * height / fig.height), height), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", size, (0, 0, 0, 0))
    canvas.paste(fig, (left, top))
    return canvas


# Measured on the 2026-10-12 render.
FACE_X, EYE_Y = 410, 270
PORTRAIT_SPAN, PORTRAIT_EYE_LINE = 985, 0.60
PROJECTS_LEFT, PROJECTS_HEIGHT = 150, 1000
CONTACT_BOTTOM = 860


def main(ref_path: Path, matte_path: Path, out_dir: Path) -> list[Path]:
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    ref = np.asarray(Image.open(ref_path).convert("RGB"), dtype=np.float64) / 255
    alpha = largest_component(np.asarray(Image.open(matte_path).getchannel("A"), dtype=np.float64) / 255)
    fg, alpha = decontaminate(ref, alpha)
    cut = Image.fromarray(np.round(np.dstack([fg, alpha]) * 255).astype(np.uint8), "RGBA")
    box = cut.getchannel("A").getbbox()

    # Hero: framed the way the hero scene frames its subject — eye-line 60% down the square (the
    # headset fills the headroom), face on the centre line; the arm the window cuts fades out.
    x0 = FACE_X - PORTRAIT_SPAN // 2
    y0 = EYE_Y - round(PORTRAIT_EYE_LINE * PORTRAIT_SPAN)
    portrait = window(cut, x0, y0, x0 + PORTRAIT_SPAN, y0 + PORTRAIT_SPAN, (1024, 1024), fade_right=60)
    # Projects: the whole figure, standing on the foot, left of the right-hand panels.
    projects = place(cut, (1186, 1024), PROJECTS_LEFT, 1024 - PROJECTS_HEIGHT, PROJECTS_HEIGHT)
    # Contact: head to knees, filling the bottom edge, centred.
    left, right, top = box[0] - 20, box[2] + 20, box[1] - 40
    crop = window(cut, left, top, right, CONTACT_BOTTOM, (right - left, CONTACT_BOTTOM - top))
    crop = crop.resize((round(crop.width * 1024 / crop.height), 1024), Image.Resampling.LANCZOS)
    contact = Image.new("RGBA", (1536, 1024), (0, 0, 0, 0))
    contact.paste(crop, ((1536 - crop.width) // 2, 0))

    written = []
    for name, image in (("portrait.png", portrait), ("projects.png", projects), ("contact.png", contact)):
        image.save(out_dir / name)
        written.append(out_dir / name)
    return written


if __name__ == "__main__":
    if len(sys.argv) != 4:
        sys.exit(__doc__)
    for path in main(*map(Path, sys.argv[1:4])):
        print(path)
