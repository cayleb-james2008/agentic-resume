"""The 960px copy of each timeline plate, for phones and the side rows.

    python3 scripts/home/make_plate_sizes.py

For every assets/home/experience/<name>.webp (1431×1024) writes <name>-960.webp
(960×687). The page offers both through srcset (templates/experience.py).
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
PLATES = ROOT / "assets" / "home" / "experience"
WIDTH = 960


def main() -> list[Path]:
    written = []
    for src in sorted(PLATES.glob("*.webp")):
        if src.stem.endswith(f"-{WIDTH}"):
            continue
        with Image.open(src) as image:
            height = round(image.height * WIDTH / image.width)
            out = src.with_name(f"{src.stem}-{WIDTH}.webp")
            image.convert("RGB").resize((WIDTH, height), Image.LANCZOS).save(out, "WEBP", quality=82, method=6)
            written.append(out)
    return written


if __name__ == "__main__":
    for path in main():
        print(path.relative_to(ROOT))
