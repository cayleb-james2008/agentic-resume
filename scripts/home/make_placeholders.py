"""Write labelled placeholder images at every homepage image path.

    python3 scripts/home/make_placeholders.py

They keep the page and its reference checks whole until the generated
character imagery replaces them. Each one's hash is recorded in
assets/home/PLACEHOLDERS.json; `check_assets.py --strict` fails while any
recorded placeholder is still on disk, so they cannot ship by accident.
"""
import hashlib
import io
import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))
from targets import PLACEHOLDERS, ROOT, TARGETS, content_images  # noqa: E402

INK = (27, 29, 36)
INK_LIGHT = (42, 45, 54)
CYAN = (2, 210, 227)
SILHOUETTE = (122, 122, 122, 255)


def silhouette(size: tuple[int, int]) -> Image.Image:
    """A head-and-shoulders shape on transparency, filling the bottom edge."""
    w, h = size
    image = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    cx = w / 2
    head = h * 0.2
    draw.ellipse([cx - head * 0.8, h * 0.12, cx + head * 0.8, h * 0.12 + head * 2], fill=SILHOUETTE)
    draw.ellipse([cx - w * 0.36, h * 0.58, cx + w * 0.36, h * 1.5], fill=SILHOUETTE)
    return image


def plate(size: tuple[int, int], label: str) -> Image.Image:
    w, h = size
    image = Image.new("RGB", size, INK)
    draw = ImageDraw.Draw(image)
    for y in range(h):
        t = y / h
        draw.line([(0, y), (w, y)], fill=tuple(round(a + (b - a) * t) for a, b in zip(INK, INK_LIGHT)))
    for x in range(0, w, 64):
        draw.line([(x, 0), (x, h)], fill=(50, 54, 64))
    draw.rectangle([40, h - 90, 40 + 12 * len(label), h - 60], fill=CYAN)
    draw.text((48, h - 84), label.upper(), fill=INK)
    return image


def encode(image: Image.Image) -> bytes:
    buffer = io.BytesIO()
    image.save(buffer, "WEBP", quality=80, method=6)
    return buffer.getvalue()


def main(root: Path = ROOT) -> dict[str, str]:
    record = {}
    for path, kind in content_images(root).items():
        size = TARGETS[kind]["size"]
        label = f"placeholder · {Path(path).stem}"
        image = silhouette(size) if TARGETS[kind]["alpha"] else plate(size, label)
        data = encode(image)
        target = root / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
        record[path] = hashlib.sha256(data).hexdigest()
    existing = json.loads(PLACEHOLDERS.read_text()) if PLACEHOLDERS.exists() else {}
    existing.update(record)
    PLACEHOLDERS.write_text(json.dumps(dict(sorted(existing.items())), indent=2) + "\n")
    return record


if __name__ == "__main__":
    print(f"Wrote {len(main())} placeholder images")
