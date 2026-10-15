"""The 1200×630 share card that link previews show (Open Graph / Twitter).

    python3 scripts/home/make_share_card.py assets/og/card.png

The site shows no picture of him, so the card is type and water: his name in Oswald
on the site's ice ground, the title and the headline under it, and a line of ink water
along the bottom with the site's cyan rim on its top edge and the address on the water.
Deterministic: the same inputs give the same file.
"""
import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
W, H = 1200, 630
ICE, INK, MUTED, CYAN = (247, 250, 251), (9, 10, 11), (104, 106, 107), (2, 210, 227)
WATER = (14, 15, 20)  # the story's water: --raw-color-ink-900
FONTS = ROOT / "assets" / "fonts"
DISPLAY = FONTS / "oswald-latin-700-normal.woff2"
SANS = FONTS / "space-grotesk-latin-500-normal.woff2"

NAME = ("CAYLEB", "ALVAREZ-", "JAMES")
TITLE = "Forward Thinking Engineer"
HEADLINE = "Show me how you work. I'll find where AI fits."
URL = "cayleb-james2008.github.io/agentic-resume"

SS = 4  # the water is drawn at 4× and shrunk, so its edge is smooth


def edge(x: float) -> float:
    """The water's top edge: a slow swell with a quicker ripple on it."""
    return 470 + 14 * math.sin(x / 95) + 6 * math.sin(x / 37)


def water() -> Image.Image:
    """Ink water below the edge, with a 3px cyan rim along it."""
    big = Image.new("RGB", (W * SS, H * SS), ICE)
    draw = ImageDraw.Draw(big)
    xs = [i / SS for i in range(-2 * SS, (W + 2) * SS + 1)]  # a little past both sides
    top = [(x * SS, edge(x) * SS) for x in xs]
    draw.polygon(top + [(top[-1][0], H * SS), (top[0][0], H * SS)], fill=WATER)
    draw.line(top, fill=CYAN, width=3 * SS, joint="curve")
    return big.resize((W, H), Image.LANCZOS)


def card() -> Image.Image:
    img = water()
    draw = ImageDraw.Draw(img)
    # Name, with the site's cyan full stop on the last baseline.
    big = ImageFont.truetype(str(DISPLAY), 96)
    y = 36
    for line in NAME:
        draw.text((64, y), line, font=big, fill=INK)
        y += 90
    baseline = y - 90 + big.getbbox(NAME[-1])[3]
    stop_x = 64 + draw.textlength(NAME[-1], font=big)
    draw.rectangle((stop_x + 6, baseline - 12, stop_x + 18, baseline), fill=CYAN)
    # Title row, then the headline.
    small = ImageFont.truetype(str(SANS), 25)
    y += 46
    draw.polygon([(72, y + 4), (78, y + 12), (72, y + 20), (66, y + 12)], fill=CYAN)
    draw.text((92, y), TITLE.upper(), font=small, fill=INK)
    lead = ImageFont.truetype(str(SANS), 34)
    draw.text((64, y + 40), HEADLINE, font=lead, fill=INK)
    # Address, bottom left, on the water.
    tiny = ImageFont.truetype(str(SANS), 20)
    draw.text((64, H - 56), URL.upper(), font=tiny, fill=ICE)
    return img


def main(out: Path) -> Path:
    out = Path(out)
    out.parent.mkdir(parents=True, exist_ok=True)
    card().save(out, "PNG", optimize=True)
    return out


if __name__ == "__main__":
    print(main(Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "assets" / "og" / "card.png"))
