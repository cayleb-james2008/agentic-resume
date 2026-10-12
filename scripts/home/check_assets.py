"""Every homepage image exists at its frame's size, with alpha where needed.

    python3 scripts/home/check_assets.py            # sizes and modes
    python3 scripts/home/check_assets.py --strict   # …and no placeholder left

Exits 1 and names the first bad file. `--strict` is the ship gate: it also
fails while any image still has the hash make_placeholders.py recorded.
"""
import argparse
import hashlib
import json
import sys
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parent))
from targets import HERO_MAPS, PLACEHOLDERS, ROOT, TARGETS, content_images  # noqa: E402

VEIL_MASK = "assets/home/hero/veil-mask.png"


def problems(root: Path, strict: bool = False):
    for path, kind in content_images(root).items():
        target = TARGETS[kind]
        file = root / path
        if not file.is_file():
            yield f"missing: {path}"
            continue
        with Image.open(file) as image:
            if image.size != tuple(target["size"]):
                yield f"wrong size {image.size}, want {target['size']}: {path}"
            if target["alpha"] and "A" not in image.getbands():
                yield f"no alpha channel: {path}"
    for path, spec in HERO_MAPS.items():
        file = root / path
        if not file.is_file():
            yield f"missing: {path}"
            continue
        with Image.open(file) as image:
            if image.size != tuple(spec["size"]):
                yield f"wrong size {image.size}, want {spec['size']}: {path}"
    if not (root / VEIL_MASK).is_file():
        yield f"missing: {VEIL_MASK}"
    if strict:
        placeholders = root / PLACEHOLDERS.relative_to(ROOT)
        recorded = json.loads(placeholders.read_text()) if placeholders.is_file() else {}
        for path, digest in recorded.items():
            file = root / path
            if file.is_file() and hashlib.sha256(file.read_bytes()).hexdigest() == digest:
                yield f"still a placeholder: {path}"


def main(root: Path = ROOT, strict: bool = False) -> int:
    for problem in problems(Path(root), strict):
        print(problem, file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=ROOT)
    parser.add_argument("--strict", action="store_true")
    args = parser.parse_args()
    sys.exit(main(args.root, args.strict))
