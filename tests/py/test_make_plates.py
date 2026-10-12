import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts" / "home"))
from make_plates import PLATES, plate  # noqa: E402


class MakePlatesTest(unittest.TestCase):
    def test_every_timeline_entry_has_a_plate_and_an_alt_that_describes_it(self):
        entries = json.loads((ROOT / "site/content.json").read_text())["experience"]["entries"]
        for entry in entries:
            name = Path(entry["image"]).stem
            self.assertIn(name, PLATES)
            self.assertEqual(entry["alt"], "Illustration: line drawing of " + PLATES[name][2])

    def test_a_plate_is_the_plate_frame_with_the_cyan_accent(self):
        img = plate("2024-dunkin")
        self.assertEqual((img.size, img.mode), ((1431, 1024), "RGB"))
        r, g, b = img.split()
        cyanish = sum(1 for px in zip(r.getdata(), g.getdata(), b.getdata()) if px[0] < 60 and px[1] > 150 and px[2] > 160)
        self.assertGreater(cyanish, 500)


if __name__ == "__main__":
    unittest.main()
