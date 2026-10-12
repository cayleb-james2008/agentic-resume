"""Portrait maps, noise and the asset checker (scripts/home)."""
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "scripts" / "home"))

import make_noise  # noqa: E402
import person_maps  # noqa: E402


class PersonMaps(unittest.TestCase):
    def test_flat_depth_gives_straight_up_normals(self):
        normals = person_maps.normals_from_depth(np.full((32, 32), 0.5))
        self.assertTrue(np.all(np.abs(normals.astype(int) - [128, 128, 255]) <= 1))

    def test_depth_is_zero_outside_the_figure(self):
        size = 64
        yy, xx = np.mgrid[0:size, 0:size]
        alpha = (((xx - 32) ** 2 + (yy - 32) ** 2) < 20 ** 2).astype(np.float64)
        depth = person_maps.depth_from_alpha(alpha, np.full((size, size), 0.5))
        self.assertEqual(float(depth[alpha == 0].max()), 0.0)
        self.assertAlmostEqual(float(depth[32, 32]), float(depth.max()), delta=0.05)

    def test_chamfer_distance_peaks_in_the_middle(self):
        mask = np.zeros((21, 21), bool)
        mask[2:19, 2:19] = True
        distance = person_maps.chamfer_distance(mask)
        self.assertEqual(distance[0, 0], 0)
        self.assertEqual(np.unravel_index(distance.argmax(), distance.shape), (10, 10))


class Noise(unittest.TestCase):
    def test_noise_tiles(self):
        n = make_noise.noise(512).astype(float)
        self.assertLess(np.abs(n[:, 0] - n[:, -1]).mean(), 3)
        self.assertLess(np.abs(n[0, :] - n[-1, :]).mean(), 3)

    def test_noise_is_deterministic(self):
        self.assertTrue(np.array_equal(make_noise.noise(64), make_noise.noise(64)))


class CheckAssets(unittest.TestCase):
    def test_check_assets_fails_on_a_missing_file(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / "site").mkdir()
            content = json.loads((ROOT / "site/content.json").read_text())
            (root / "site/content.json").write_text(json.dumps(content))
            result = subprocess.run(
                [sys.executable, str(ROOT / "scripts/home/check_assets.py"), "--root", str(root)],
                capture_output=True, text=True,
            )
            self.assertEqual(result.returncode, 1)
            self.assertIn("assets/home/", result.stderr)


if __name__ == "__main__":
    unittest.main()
