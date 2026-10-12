"""Draw the work-experience plates as line illustrations in the site's own language.

    python3 scripts/home/make_plates.py

One plate per timeline entry (1431×1024, RGB WebP): the hero's contour field
in faint white, a cyan halftone bloom, and a line drawing of the job at the
lower-left — the plate's middle carries the timeline's year and title and,
on a phone, the row's copy, so the drawing stays out of both and stays dim. They stand
in until generated scenes of Cayleb's character replace them (PROVENANCE.md);
`import_images.py --kind plate` overwrites any one of them in place.
"""
import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw
from skimage import measure

ROOT = Path(__file__).resolve().parents[2]
W, H = 1431, 1024
S = 2  # drawn at 2× and reduced, for clean anti-aliased strokes
INK = (233, 238, 240)
CYAN = (2, 210, 227)
CYAN_DOT = CYAN
DRAWING_OPACITY = 0.75
TOP, FOOT = (24, 27, 31), (10, 11, 13)


def field(x, y, t):
    """The hero shader's contour field (site/js/engine/contours.js), verbatim."""
    f = np.sin(x * 1.0 + t * 0.6) * 0.5
    f += np.sin(y * 0.85 - t * 0.45) * 0.45
    f += np.sin((x + y) * 0.65 + t * 0.35) * 0.35
    f += np.sin((x - y) * 0.95 - t * 0.55) * 0.25
    return f * 0.5 + 0.5


def backdrop(seed: float) -> Image.Image:
    w, h = W * S, H * S
    ramp = np.linspace(0, 1, h)[:, None, None]
    base = (np.array(TOP) * (1 - ramp) + np.array(FOOT) * ramp) * np.ones((h, w, 3))
    img = Image.fromarray(base.astype(np.uint8), "RGB")
    # Contours: the same field the projects and contact backdrops draw, frozen at t = seed.
    cols, rows = 140, 100
    aspect = w / h
    xs = (np.linspace(0, 1, cols) * 2 - 1) * aspect * 3.8
    ys = (np.linspace(0, 1, rows) * 2 - 1) * 3.8
    nx, ny = np.meshgrid(xs, ys)
    qx = nx + np.sin(ny * 0.8 + seed * 0.7) * 0.37
    qy = ny + np.cos(nx * 0.7 - seed * 0.6) * 0.37
    values = field(qx, qy, seed) * 2.5
    lines = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(lines)
    for level in (0.5, 1.5):
        for contour in measure.find_contours(values, level):
            pts = [(c * w / (cols - 1), r * h / (rows - 1)) for r, c in contour]
            draw.line(pts, fill=(255, 255, 255, 26), width=2 * S, joint="curve")
    img.paste(lines, (0, 0), lines)
    return img


def halftone(img: Image.Image, cx: float, cy: float, reach: float) -> None:
    """A cyan dot bloom around the drawing, dots shrinking with distance."""
    draw = ImageDraw.Draw(img, "RGBA")
    step = 28 * S
    for gy in range(step // 2, img.height, step):
        for gx in range(step // 2, img.width, step):
            d = math.hypot(gx - cx, gy - cy) / reach
            if d >= 1:
                continue
            r = (1 - d) ** 1.4 * 7 * S
            if r < 0.6 * S:
                continue
            draw.ellipse([gx - r, gy - r, gx + r, gy + r], fill=CYAN_DOT + (round(170 * (1 - d) ** 0.8),))


class Pen:
    """Line drawing in a 100-unit box centred on (cx, cy), `size` px tall."""

    def __init__(self, img, cx, cy, size):
        self.d = ImageDraw.Draw(img, "RGBA")
        self.cx, self.cy, self.k = cx, cy, size / 100

    def p(self, x, y):
        return (self.cx + (x - 50) * self.k, self.cy + (y - 50) * self.k)

    def line(self, pts, colour=INK, width=2.2):
        self.d.line([self.p(*q) for q in pts], fill=colour, width=round(width * self.k), joint="curve")
        for q in (pts[0], pts[-1]):
            x, y = self.p(*q)
            r = width * self.k / 2
            self.d.ellipse([x - r, y - r, x + r, y + r], fill=colour)

    def rect(self, x0, y0, x1, y1, colour=INK, width=2.2, radius=2):
        self.d.rounded_rectangle([self.p(x0, y0), self.p(x1, y1)], radius=radius * self.k,
                                 outline=colour, width=round(width * self.k))

    def circle(self, x, y, r, colour=INK, width=2.2, fill=None):
        (a, b), (c, d) = self.p(x - r, y - r), self.p(x + r, y + r)
        self.d.ellipse([a, b, c, d], outline=colour, width=round(width * self.k), fill=fill)

    def arc(self, x, y, r, start, end, colour=INK, width=2.2):
        (a, b), (c, d) = self.p(x - r, y - r), self.p(x + r, y + r)
        self.d.arc([a, b, c, d], start, end, fill=colour, width=round(width * self.k))

    def wave(self, x, y0, y1, amp, colour=CYAN, width=2.2):
        pts = [(x + amp * math.sin((y - y0) / (y1 - y0) * 2 * math.pi), y) for y in np.linspace(y0, y1, 24)]
        self.line(pts, colour, width)

    def droplet(self, x, y, r, width=2.2):
        """The AI agent: a small glass droplet, tip up, with two eyes."""
        tip = 1.7 * r
        alpha = math.degrees(math.acos(r / tip))
        self.arc(x, y, r, 270 + alpha, 270 - alpha + 360, CYAN, width)
        for side in (-1, 1):
            a = math.radians(270 + side * alpha)
            self.line([(x, y - tip), (x + r * math.cos(a), y + r * math.sin(a))], CYAN, width)
        for ex in (-0.35, 0.35):
            self.circle(x + ex * r, y + 0.05 * r, 0.13 * r, CYAN, 1.0, fill=CYAN)


def cafe(p):
    p.line([(28, 40), (32, 80), (64, 80), (68, 40), (28, 40)])
    p.arc(70, 54, 10, 270, 90)
    p.line([(18, 86), (78, 86)])
    for x in (38, 48, 58):
        p.wave(x, 14, 34, 2.4)


def pizza(p):
    p.arc(50, 58, 38, 180, 360)
    p.line([(12, 58), (12, 84), (88, 84), (88, 58)])
    p.arc(50, 58, 26, 180, 360, CYAN, 1.6)
    p.circle(42, 72, 14)
    for a in (0, 60, 120):
        r = math.radians(a)
        p.line([(42 - 14 * math.cos(r), 72 - 14 * math.sin(r)), (42 + 14 * math.cos(r), 72 + 14 * math.sin(r))], width=1.4)
    p.line([(56, 72), (94, 72)])


def moving(p):
    for x0, y0, x1, y1 in ((14, 56, 46, 86), (48, 56, 80, 86), (30, 24, 64, 54)):
        p.rect(x0, y0, x1, y1)
        mid = (x0 + x1) / 2
        p.line([(mid - 5, y0), (mid - 5, y0 + 9), (mid + 5, y0 + 9), (mid + 5, y0)], width=1.4)
    p.line([(70, 34), (92, 34)], CYAN)
    p.line([(86, 28), (92, 34), (86, 40)], CYAN)


def plaster(p):
    p.rect(10, 12, 78, 88, width=1.6, radius=1)
    for y in (30, 46, 62):
        p.line([(18 + i * 3, y + 4 * math.sin(i / 2.5)) for i in range(17)], CYAN, 1.8)
    p.line([(52, 64), (88, 64), (88, 72), (52, 72), (52, 64)])
    p.line([(70, 64), (70, 54), (76, 48)])


def school(p):
    p.rect(8, 16, 70, 60)
    p.line([(30, 60), (26, 72)])
    p.line([(48, 60), (52, 72)])
    p.line([(18, 74), (60, 74)])
    for i, w in enumerate((28, 40, 22, 34)):
        p.line([(16, 26 + i * 8), (16 + w, 26 + i * 8)], width=1.6)
    p.line([(80, 30), (94, 36), (94, 52), (80, 62), (66, 52), (66, 36), (80, 30)], CYAN)
    for x, y in ((76, 42), (86, 44), (80, 52)):
        p.circle(x, y, 1.6, CYAN, 1.2, fill=CYAN)


def builds(p):
    p.rect(4, 22, 46, 58)
    p.rect(52, 22, 94, 58)
    for i, w in enumerate((24, 30, 16, 26)):
        p.line([(10, 30 + i * 7), (10 + w, 30 + i * 7)], width=1.4)
    p.line([(58, 50), (68, 40), (76, 46), (88, 30)], CYAN, 1.8)
    p.line([(25, 58), (25, 68)])
    p.line([(73, 58), (73, 68)])
    p.line([(10, 70), (88, 70)])
    p.droplet(50, 86, 6)


def integrator(p):
    for x in (24, 76):
        p.circle(x, 36, 11)
        p.arc(x, 78, 22, 200, 340)
    p.line([(14, 90), (86, 90)])
    p.rect(64, 60, 84, 84, width=1.6)
    for i in range(3):
        p.line([(68, 66 + i * 5), (80, 66 + i * 5)], width=1.2)
    p.droplet(50, 34, 7)


PLATES = {
    "2024-dunkin": (cafe, 0.4, "a coffee cup with rising steam on a café counter"),
    "2024-pizza": (pizza, 1.3, "a pizza on a peel in front of a brick oven"),
    "2025-moving": (moving, 2.1, "stacked moving boxes and an arrow"),
    "2026-plaster": (plaster, 2.9, "a trowel smoothing plaster strokes on a wall"),
    "2026-school": (school, 3.7, "a classroom computer with code and a security shield"),
    "2026-builds": (builds, 4.6, "two monitors of code and a chart, with a small glass-droplet AI agent"),
    "2026-integrator": (integrator, 5.4, "two people at a desk with notes and a glass-droplet AI agent between them"),
}


def plate(name: str) -> Image.Image:
    draw_fn, seed, _ = PLATES[name]
    img = backdrop(seed)
    cx, cy, size = 0.25 * W * S, 0.56 * H * S, 0.40 * H * S
    halftone(img, cx, cy, size * 1.05)
    # Drawn opaque on its own layer, then laid down at one opacity, so caps and joins never double up.
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw_fn(Pen(layer, cx, cy, size))
    layer.putalpha(layer.getchannel("A").point(lambda a: round(a * DRAWING_OPACITY)))
    img.paste(layer, (0, 0), layer)
    return img.resize((W, H), Image.Resampling.LANCZOS)


def main(root: Path = ROOT) -> list[Path]:
    written = []
    for name in PLATES:
        out = root / "assets/home/experience" / f"{name}.webp"
        out.parent.mkdir(parents=True, exist_ok=True)
        plate(name).save(out, "WEBP", quality=88, method=6)
        written.append(out)
    return written


if __name__ == "__main__":
    for path in main(Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT):
        print(path)
