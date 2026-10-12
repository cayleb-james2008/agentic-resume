"""The shared reveal/burn noise texture: 512² grey, exactly tileable.

    python3 scripts/home/make_noise.py assets/home/hero/noise.webp

A sum of sines whose frequencies are whole cycles across the tile, so the
right edge runs straight into the left one under RepeatWrapping.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

SEED = 7
WAVES = 24


def noise(size: int = 512) -> np.ndarray:
    rng = np.random.default_rng(SEED)
    yy, xx = np.mgrid[0:size, 0:size] / size
    total = np.zeros((size, size))
    for _ in range(WAVES):
        fx, fy = rng.integers(-6, 7, size=2)
        if fx == 0 and fy == 0:
            fx = 1
        amplitude = 1 / np.hypot(fx, fy)
        total += amplitude * np.sin(2 * np.pi * (fx * xx + fy * yy) + rng.uniform(0, 2 * np.pi))
    total -= total.min()
    total /= total.max()
    return np.round(total * 255).astype(np.uint8)


def main(out: Path) -> Path:
    out = Path(out)
    out.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(noise(), "L").save(out, "WEBP", lossless=True)
    return out


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    print(main(Path(sys.argv[1])))
