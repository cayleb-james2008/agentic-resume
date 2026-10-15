"""Crops the work screenshots and writes assets/IMAGES.json, the provenance of every image on the site.

    python3 scripts/home/prep_images.py <dir holding the dotz, sophos and industry-ai-suite checkouts>

The screenshots are Cayleb's own product UI, taken from his repositories at the commits below. The hero
layers are rendered by scripts/home/render_hero.mjs. No image on the site shows a person.
"""
import hashlib
import json
import sys
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[2]

WORK = {
    "assets/work/dotz.jpg": {
        "repo": "https://github.com/cayleb-james2008/dotz", "commit": "2139526fae091915a6c74eec673c5f188dfc520d",
        "file": "docs/screenshot.png", "crop": [240, 40, 1680, 940]},
    "assets/work/sophos.jpg": {
        "repo": "https://github.com/cayleb-james2008/sophos", "commit": "33559fc996d04badc00ab62a0469d2ee7be023cd",
        "file": "eval-shots/01-welcome.png", "crop": [0, 0, 1440, 900]},
    "assets/work/suite.jpg": {
        "repo": "https://github.com/cayleb-james2008/industry-ai-suite", "commit": "f4a93ddb93a4e3ec7068383ec0875cbc127f855c",
        "file": "session-artifacts/industry-ai-suite-full-workflows-20260926/workbench-before.png", "crop": [0, 0, 1440, 900]},
}
CHECKOUT = {"assets/work/dotz.jpg": "dotz", "assets/work/sophos.jpg": "sophos", "assets/work/suite.jpg": "industry-ai-suite"}
HERO_SOURCE = "Rendered by scripts/home/render_hero.mjs from scripts/home/hero_scene.html; counts read from resume/resume-content.json"


def crop_work(checkouts: Path) -> None:
    for out, meta in WORK.items():
        im = Image.open(checkouts / CHECKOUT[out] / meta["file"]).convert("RGB").crop(tuple(meta["crop"]))
        im = im.resize((1280, round(1280 * im.height / im.width)), Image.LANCZOS)
        im = im.filter(ImageFilter.UnsharpMask(radius=0.7, percent=55, threshold=2))
        (ROOT / out).parent.mkdir(parents=True, exist_ok=True)
        im.save(ROOT / out, quality=82, progressive=True, optimize=True)


def manifest() -> dict:
    entries = {}
    for path in sorted([*ROOT.glob("assets/hero/*.jpg"), *ROOT.glob("assets/work/*.jpg")]):
        rel = path.relative_to(ROOT).as_posix()
        with Image.open(path) as im:
            width, height = im.size
        record = {"source": HERO_SOURCE} if rel.startswith("assets/hero/") else {
            "source": f"Cayleb's own product screenshot: {WORK[rel]['repo']} @ {WORK[rel]['commit'][:7]}", **WORK[rel]}
        entries[rel] = {**record, "width": width, "height": height,
                        "sha256": hashlib.sha256(path.read_bytes()).hexdigest()}
    return entries


if __name__ == "__main__":
    if len(sys.argv) > 1:
        crop_work(Path(sys.argv[1]))
    (ROOT / "assets/IMAGES.json").write_text(json.dumps(manifest(), indent=2) + "\n")
    print("Wrote assets/IMAGES.json")
