"""Every homepage image: where it lives, its size, and whether it carries alpha.

Shared by import_images.py (crop targets), make_placeholders.py and
check_assets.py so the three can never disagree.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

TARGETS = {
    "portrait": {"size": (1024, 1024), "alpha": True},
    "projects-figure": {"size": (1186, 1024), "alpha": True},
    "contact-figure": {"size": (1536, 1024), "alpha": True},
    "plate": {"size": (1431, 1024), "alpha": False},
}

HERO_MAPS = {
    "assets/home/hero/person-diffuse.webp": {"size": (1024, 1024), "mode": "RGB"},
    "assets/home/hero/person-alpha.webp": {"size": (1024, 1024), "mode": "L"},
    "assets/home/hero/person-depth.webp": {"size": (1024, 1024), "mode": "L"},
    "assets/home/hero/person-normal.webp": {"size": (1024, 1024), "mode": "RGB"},
    "assets/home/hero/noise.webp": {"size": (512, 512), "mode": "L"},
}

PLACEHOLDERS = ROOT / "assets/home/PLACEHOLDERS.json"


def content_images(root: Path = ROOT) -> dict[str, str]:
    """Image path → target kind, for the images site/content.json still names. The water story names none;
    this pipeline is retired with the character assets."""
    content = json.loads((root / "site/content.json").read_text())
    images = {entry["image"]: "plate" for entry in content.get("experience", {}).get("entries", [])}
    for block, kind in (("projects", "projects-figure"), ("contact", "contact-figure")):
        figure = content.get(block, {}).get("figure")
        if figure:
            images[figure["image"]] = kind
    return images
