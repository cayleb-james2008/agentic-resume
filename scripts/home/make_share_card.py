"""The 1200×630 share card that link previews show (Open Graph / Twitter).

    python3 scripts/home/make_share_card.py assets/og/card.png

The hero in one still: his name in Oswald on the near-white ground with the
backdrop's contour lines, the three meta rows, his portrait from the hero maps
(person-diffuse with person-alpha as its matte) and his glass-droplet agent
beside his head. Deterministic: the same inputs give the same file.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[2]
W, H = 1200, 630
ICE, CONTOUR, INK, MUTED, CYAN = (247, 250, 251), (229, 234, 237), (9, 10, 11), (104, 106, 107), (2, 210, 227)
FONTS = ROOT / "assets" / "fonts"
DISPLAY = FONTS / "oswald-latin-700-normal.woff2"
SANS = FONTS / "space-grotesk-latin-500-normal.woff2"

NAME = ("CAYLEB", "ALVAREZ-", "JAMES")
META = ("Forward Thinking Engineer", "Independent developer · since 2025", "Connecticut, USA")
URL = "cayleb-james2008.github.io/agentic-resume"


def contours(img: Image.Image) -> None:
    """A few slow closed curves, like the hero's backdrop."""
    draw = ImageDraw.Draw(img)
    t = np.linspace(0, 2 * np.pi, 400)
    rng = np.random.default_rng(11)
    for _ in range(9):
        cx, cy = rng.uniform(0, W), rng.uniform(-80, H + 80)
        r = rng.uniform(140, 420)
        wob = [rng.uniform(0.05, 0.22) for _ in range(3)]
        ph = rng.uniform(0, 2 * np.pi, 3)
        rr = r * (1 + wob[0] * np.sin(2 * t + ph[0]) + wob[1] * np.sin(3 * t + ph[1]) + wob[2] * np.cos(5 * t + ph[2]) * 0.4)
        pts = list(zip(cx + rr * np.cos(t) * 1.25, cy + rr * np.sin(t)))
        draw.line(pts + [pts[0]], fill=CONTOUR, width=2)


def portrait(height: int) -> Image.Image:
    hero = ROOT / "assets" / "home" / "hero"
    rgb = Image.open(hero / "person-diffuse.webp").convert("RGB")
    alpha = Image.open(hero / "person-alpha.webp").convert("L")
    face = rgb.copy()
    face.putalpha(alpha)
    face = face.resize((height, height), Image.LANCZOS)
    # Fade the chest out over the bottom fifth, as the hero's ramp does.
    a = np.array(face.getchannel("A"), dtype=np.float32)
    ramp = np.clip((np.arange(height) - height * 0.8) / (height * 0.2), 0, 1)[:, None]
    face.putalpha(Image.fromarray((a * (1 - ramp)).astype(np.uint8)))
    return face


def droplet(size: int) -> Image.Image:
    """His agent, flat: a teardrop of pale glass, a cyan glow rising from the foot, two eyes."""
    s = 4  # supersample
    w, h = int(size * 0.78) * s, size * s
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    # Teardrop: x = sin t · sin(t/2), y = (1 + cos t)/2, tip up — the hero's profile.
    t = np.linspace(np.pi, 0, 600)
    px = np.sin(t) * np.sin(t / 2) * 0.5
    py = (1 + np.cos(t)) / 2
    v = 1 - yy / h  # 0 at the foot, 1 at the tip
    half = np.interp(v, py, px) * h * 0.98
    inside = np.abs(xx - w / 2) <= half
    # Glass: pale cyan, lighter towards the upper left; glow at the foot.
    d = np.hypot((xx - w * 0.4) / w, (yy - h * 0.6) / h)
    base = np.stack([180 + 50 * (1 - d), 239 + 10 * (1 - d), 246 + 6 * (1 - d)], -1)
    foot = np.clip((0.45 - v) / 0.45, 0, 1)[..., None] ** 1.5
    color = base * (1 - foot * 0.55) + np.array(CYAN) * foot * 0.55
    img = np.zeros((h, w, 4), np.float32)
    img[..., :3] = np.clip(color, 0, 255)
    img[..., 3] = inside * 235
    out = Image.fromarray(img.astype(np.uint8), "RGBA")
    draw = ImageDraw.Draw(out)
    # Outline, eyes, glints and a shine.
    edge = Image.fromarray((inside * 255).astype(np.uint8)).filter(ImageFilter.FIND_EDGES).filter(ImageFilter.MaxFilter(5))
    out.paste(Image.new("RGBA", out.size, CYAN + (255,)), mask=edge)
    ey, ex, rx, ry = h * 0.6, w * 0.13, w * 0.055, h * 0.062
    for side in (-1, 1):
        cx = w / 2 + side * ex
        draw.ellipse((cx - rx, ey - ry, cx + rx, ey + ry), fill=(11, 13, 16, 255))
        draw.ellipse((cx - rx * 0.6, ey - ry * 0.65, cx - rx * 0.6 + rx * 0.7, ey - ry * 0.65 + rx * 0.7), fill=(255, 255, 255, 255))
    draw.arc((w * 0.2, h * 0.32, w * 0.62, h * 0.86), 200, 245, fill=(255, 255, 255, 230), width=3 * s)
    return out.resize((w // s, h // s), Image.LANCZOS)


def card() -> Image.Image:
    img = Image.new("RGB", (W, H), ICE)
    contours(img)
    # Portrait right of centre, droplet beside his head.
    face = portrait(760)
    img.paste(face, (500, -150), face)
    agent = droplet(150)
    img.paste(agent, (1050, 170), agent)
    # Name, with the site's cyan full stop.
    draw = ImageDraw.Draw(img)
    big = ImageFont.truetype(str(DISPLAY), 112)
    y = 52
    for line in NAME:
        draw.text((64, y), line, font=big, fill=INK)
        y += 108
    stop_x = 64 + draw.textlength(NAME[-1], font=big)
    draw.rectangle((stop_x + 6, y - 27, stop_x + 20, y - 13), fill=CYAN)
    # Meta rows.
    small = ImageFont.truetype(str(SANS), 25)
    y += 46
    for row in META:
        draw.polygon([(72, y + 4), (78, y + 12), (72, y + 20), (66, y + 12)], fill=CYAN)
        draw.text((92, y), row.upper(), font=small, fill=INK)
        y += 40
    # Address, bottom left.
    tiny = ImageFont.truetype(str(SANS), 20)
    draw.text((64, H - 56), URL.upper(), font=tiny, fill=MUTED)
    return img


def main(out: Path) -> Path:
    out = Path(out)
    out.parent.mkdir(parents=True, exist_ok=True)
    card().save(out, "PNG", optimize=True)
    return out


if __name__ == "__main__":
    print(main(Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "assets" / "og" / "card.png"))
