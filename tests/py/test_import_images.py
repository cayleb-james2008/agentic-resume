"""Cropping generated images to their frames (scripts/home/import_images.py)."""
import sys
import tempfile
import unittest
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts" / "home"))

import import_images  # noqa: E402


class ImportImages(unittest.TestCase):
    def test_crop_hits_the_target(self):
        with tempfile.TemporaryDirectory() as tmp:
            src = Path(tmp) / "plate.png"
            Image.new("RGB", (1536, 1024), (40, 40, 40)).save(src)
            out = Path(tmp) / "plate.webp"
            import_images.import_image("plate", src, out)
            with Image.open(out) as image:
                self.assertEqual(image.size, (1431, 1024))

    def test_figures_keep_alpha(self):
        with tempfile.TemporaryDirectory() as tmp:
            src = Path(tmp) / "figure.png"
            Image.new("RGBA", (1536, 1024), (40, 40, 40, 0)).save(src)
            out = Path(tmp) / "figure.webp"
            import_images.import_image("contact-figure", src, out)
            with Image.open(out) as image:
                self.assertEqual(image.size, (1536, 1024))
                self.assertIn("A", image.getbands())

    def test_portrait_is_saved_as_png_source(self):
        with tempfile.TemporaryDirectory() as tmp:
            src = Path(tmp) / "portrait-in.png"
            Image.new("RGBA", (1024, 1536), (10, 10, 10, 255)).save(src)
            out = Path(tmp) / "portrait.png"
            import_images.import_image("portrait", src, out)
            with Image.open(out) as image:
                self.assertEqual((image.format, image.size), ("PNG", (1024, 1024)))


if __name__ == "__main__":
    unittest.main()
