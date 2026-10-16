"""The share card script (scripts/home/make_share_card.py): the only image script left."""
import sys
import tempfile
import unittest
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts" / "home"))

import make_share_card  # noqa: E402


class ShareCard(unittest.TestCase):
    def test_the_card_is_1200_by_630_and_small(self):
        with tempfile.TemporaryDirectory() as tmp:
            out = make_share_card.main(Path(tmp) / "nested" / "card.png")
            with Image.open(out) as img:
                self.assertEqual((img.size, img.mode, img.format), ((1200, 630), "RGB", "PNG"))
            self.assertLess(out.stat().st_size, 400_000)

    def test_the_same_inputs_give_the_same_file(self):
        with tempfile.TemporaryDirectory() as tmp:
            first = make_share_card.main(Path(tmp) / "a.png").read_bytes()
            second = make_share_card.main(Path(tmp) / "b.png").read_bytes()
        self.assertEqual(first, second)

    def test_the_card_draws_with_the_vendored_face_only(self):
        import json
        provenance = json.loads((ROOT / "vendor" / "PROVENANCE.json").read_text())
        self.assertIn(make_share_card.MONA.relative_to(ROOT).as_posix(), provenance)
        source = (ROOT / "scripts" / "home" / "make_share_card.py").read_text()
        for retired in ("onest", "jetbrains", "MONO ="):
            self.assertNotIn(retired, source.lower() if retired.islower() else source)


if __name__ == "__main__":
    unittest.main()
