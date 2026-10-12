import sys
import unittest
from pathlib import Path

import numpy as np
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "scripts" / "home"))
from derive_character import decontaminate, place, window  # noqa: E402


def figure(size=(200, 300), box=(50, 40, 150, 260)):
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    img.paste((10, 200, 180, 255), box)
    return img


class DeriveCharacterTest(unittest.TestCase):
    def test_window_pads_past_the_image_with_transparency(self):
        out = window(figure(), -50, -50, 150, 150, (100, 100))
        self.assertEqual(out.size, (100, 100))
        self.assertEqual(out.getpixel((0, 0))[3], 0)
        self.assertEqual(out.getpixel((60, 60))[3], 255)

    def test_window_fades_the_cut_edge(self):
        out = window(figure(), 0, 0, 100, 300, (100, 300), fade_right=20)
        self.assertEqual(out.getpixel((99, 150))[3], 0)
        self.assertEqual(out.getpixel((70, 150))[3], 255)

    def test_place_scales_the_figure_box_to_height(self):
        canvas = place(figure(), (400, 300), 30, 10, 220)
        self.assertEqual(canvas.size, (400, 300))
        self.assertEqual(canvas.getchannel("A").getbbox(), (30, 10, 130, 230))

    def test_decontaminate_recovers_the_foreground_on_a_soft_edge(self):
        backdrop = np.array([0.5, 0.4, 0.5])
        fg = np.array([0.1, 0.8, 0.7])
        ref = np.zeros((40, 40, 3)) + backdrop
        alpha = np.zeros((40, 40))
        alpha[10:30, 10:30] = 1.0
        alpha[10:30, 30] = 0.5
        ref[alpha == 1.0] = fg
        ref[:, 30][alpha[:, 30] == 0.5] = 0.5 * fg + 0.5 * backdrop
        rgb, _ = decontaminate(ref, alpha, sigma=3)
        np.testing.assert_allclose(rgb[20, 30], fg, atol=0.05)


if __name__ == "__main__":
    unittest.main()
