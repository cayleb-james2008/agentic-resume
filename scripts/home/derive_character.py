"""Helpers for cutting Cayleb's character out of a render and framing it.

Used by derive_scenes.py.

Pipeline: keep the figure's largest alpha component, decontaminate the soft edge
against the locally estimated backdrop (so no background haze rides along the
hair), then crop and scale into a frame. See PROVENANCE.md.
"""
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
