"""Crop and encode a generated image to its homepage frame.

    python3 scripts/home/import_images.py --kind plate SRC.png assets/home/experience/2024-dunkin.webp
    python3 scripts/home/import_images.py --kind portrait SRC.png SCRATCH/portrait.png

Kinds and sizes live in targets.py. Images are centre-cropped to the frame's
aspect, resized with LANCZOS and saved as WebP (quality 85, alpha kept for the
cut-out figures). The portrait is saved as PNG: it is the source person_maps.py
derives the hero's four maps from, not something the page loads.
"""
import argparse
import sys
from pathlib import Path

from PIL import Image, ImageOps

sys.path.insert(0, str(Path(__file__).resolve().parent))
from targets import TARGETS  # noqa: E402


def crop_to(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    return ImageOps.fit(image, size, method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))


def import_image(kind: str, src: Path, dest: Path) -> Path:
    target = TARGETS[kind]
    with Image.open(src) as opened:
        image = ImageOps.exif_transpose(opened)
        image = image.convert("RGBA" if target["alpha"] else "RGB")
        image = crop_to(image, target["size"])
    dest = Path(dest)
    dest.parent.mkdir(parents=True, exist_ok=True)
    if kind == "portrait":
        image.save(dest, "PNG")
    else:
        image.save(dest, "WEBP", quality=85, alpha_quality=100, method=6)
    return dest


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--kind", required=True, choices=sorted(TARGETS))
    parser.add_argument("src", type=Path)
    parser.add_argument("dest", type=Path)
    args = parser.parse_args(argv)
    out = import_image(args.kind, args.src, args.dest)
    print(f"{args.kind}: {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
