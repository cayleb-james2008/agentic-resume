import sys
import unittest
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "scripts" / "home"))
from derive_scenes import fill_height  # noqa: E402


class FillHeightTest(unittest.TestCase):
    def test_scales_to_the_canvas_height_and_centres_by_default(self):
        img = Image.new("RGBA", (100, 50), (255, 0, 0, 255))
        out = fill_height(img, (600, 200))
        self.assertEqual(out.size, (600, 200))
        self.assertEqual(out.getchannel("A").getbbox(), (100, 0, 500, 200))

    def test_left_pins_the_figure(self):
        img = Image.new("RGBA", (100, 50), (255, 0, 0, 255))
        self.assertEqual(fill_height(img, (600, 200), left=0).getchannel("A").getbbox(), (0, 0, 400, 200))


if __name__ == "__main__":
    unittest.main()
