"""Derive the hero's portrait maps from one cut-out PNG.

    python3 scripts/home/person_maps.py PORTRAIT.png assets/home/hero

Writes person-diffuse.webp (RGB), person-alpha.webp, person-depth.webp,
person-normal.webp (all 1024²) and veil-mask.png (the loader's silhouette).

Depth is a bas-relief, not a measurement: the cut-out's distance-from-edge
gives the figure a dome, luminance adds a little surface detail. The scene
only shifts the portrait by its depth at 0.005 strength and relights it off
the normals, so a plausible relief is all it needs.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

SIZE = 1024
VEIL = 512


def chamfer_distance(mask: np.ndarray) -> np.ndarray:
    """Two-pass 3-4 chamfer distance to the nearest pixel outside `mask`."""
    big = 1 << 28
    h, w = mask.shape
    d = np.where(mask, big, 0).astype(np.int64)
    for y in range(h):
        for x in range(w):
            if not d[y, x]:
                continue
            best = d[y, x]
            if x > 0: best = min(best, d[y, x - 1] + 3)
            if y > 0:
                best = min(best, d[y - 1, x] + 3)
                if x > 0: best = min(best, d[y - 1, x - 1] + 4)
                if x < w - 1: best = min(best, d[y - 1, x + 1] + 4)
            d[y, x] = best
    for y in range(h - 1, -1, -1):
        for x in range(w - 1, -1, -1):
            if not d[y, x]:
                continue
            best = d[y, x]
            if x < w - 1: best = min(best, d[y, x + 1] + 3)
            if y < h - 1:
                best = min(best, d[y + 1, x] + 3)
                if x < w - 1: best = min(best, d[y + 1, x + 1] + 4)
                if x > 0: best = min(best, d[y + 1, x - 1] + 4)
            d[y, x] = best
    d[d >= big] = 0
    return d


def _blur(values: np.ndarray, radius: float) -> np.ndarray:
    """Separable Gaussian blur (sigma = radius), edges clamped."""
    reach = max(1, int(round(radius * 3)))
    kernel = np.exp(-0.5 * (np.arange(-reach, reach + 1) / radius) ** 2)
    kernel /= kernel.sum()
    padded = np.pad(values, reach, mode="edge")
    rows = np.apply_along_axis(lambda r: np.convolve(r, kernel, mode="valid"), 1, padded)
    return np.apply_along_axis(lambda c: np.convolve(c, kernel, mode="valid"), 0, rows)


def depth_from_alpha(alpha: np.ndarray, luminance: np.ndarray, blur: float = 6) -> np.ndarray:
    """0–1 relief: 70% dome from the silhouette, 30% luminance, zero outside."""
    distance = chamfer_distance(alpha > 0.5).astype(np.float64)
    if distance.max() > 0:
        distance /= distance.max()
    raw = (0.7 * np.sqrt(distance) + 0.3 * luminance) * alpha
    smooth = _blur(raw, blur) * alpha
    peak = smooth.max()
    return smooth / peak if peak > 0 else smooth


def normals_from_depth(depth: np.ndarray, strength: float = 4.0) -> np.ndarray:
    """Tangent-space normals (+Y up), encoded as 8-bit RGB."""
    gy, gx = np.gradient(depth.astype(np.float64))
    n = np.dstack([-gx * strength * depth.shape[1] / 64, gy * strength * depth.shape[0] / 64, np.ones_like(depth)])
    n /= np.linalg.norm(n, axis=2, keepdims=True)
    return np.round((n * 0.5 + 0.5) * 255).astype(np.uint8)


def main(src: Path, out_dir: Path) -> list[Path]:
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    with Image.open(src) as opened:
        rgba = opened.convert("RGBA").resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    pixels = np.asarray(rgba, dtype=np.float64) / 255
    alpha = pixels[..., 3]
    luminance = np.asarray(rgba.convert("L"), dtype=np.float64) / 255
    depth = depth_from_alpha(alpha, luminance)
    normals = normals_from_depth(depth)
    written = []

    def save(image: Image.Image, name: str, **options):
        path = out_dir / name
        image.save(path, **options)
        written.append(path)

    save(rgba.convert("RGB"), "person-diffuse.webp", format="WEBP", quality=85, method=6)
    save(Image.fromarray(np.round(alpha * 255).astype(np.uint8), "L"), "person-alpha.webp", format="WEBP", lossless=True)
    save(Image.fromarray(np.round(depth * 255).astype(np.uint8), "L"), "person-depth.webp", format="WEBP", lossless=True)
    save(Image.fromarray(normals, "RGB"), "person-normal.webp", format="WEBP", quality=90, method=6)
    veil = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 0))
    veil.putalpha(rgba.getchannel("A"))
    save(veil.resize((VEIL, VEIL), Image.Resampling.LANCZOS), "veil-mask.png", format="PNG", optimize=True)
    return written


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    for path in main(Path(sys.argv[1]), Path(sys.argv[2])):
        print(path)
