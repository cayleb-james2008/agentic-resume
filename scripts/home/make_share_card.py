"""The 1200×630 share card that link previews show (Open Graph / Twitter).

    python3 scripts/home/make_share_card.py assets/og/card.png

The site shows no picture of him, so the card is type and one small figure, in the
homepage's look: the >_ tile and the wordmark, the title in accent ink, the headline
in Onest, a terminal chip with the résumé's counts, and in the corner the team graph
from the Ergon section (a hub wired to four people, one wire carrying an update).
Deterministic: the same inputs give the same file.
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
W, H = 1200, 630
SS = 2  # drawn at 2× and shrunk, so the rounded shapes and the tick are smooth

# The homepage's tokens (site/css/tokens.css).
GROUND = (225, 229, 230)   # --raw-color-cool-100, the share card ground
INK = (9, 10, 11)          # --raw-color-ink-950
ACCENT = (2, 210, 227)     # --raw-color-cyan-400
ACCENT_INK = (0, 122, 133)  # --raw-color-cyan-700
MUTED = (88, 92, 94)       # ink at about 63% on the ground
TERM = (15, 21, 25)        # --raw-color-term-900
TERM_FG = (207, 220, 222)  # --raw-color-term-200
TERM_DIM = (138, 157, 162)  # --raw-color-term-400
OK = (126, 226, 184)       # --raw-color-ok-300
SURFACE = (240, 242, 242)  # --raw-color-cool-50
WIRE = (190, 199, 202)     # a shade under --raw-color-cool-200, so the wires read at preview size
WIRE_HOT = (2, 210, 227)

FONTS = ROOT / "assets" / "fonts"
ONEST = {w: FONTS / f"onest-latin-{w}-normal.woff2" for w in (400, 500, 600)}
MONO = FONTS / "jetbrains-mono-latin-500-normal.woff2"

WORDMARK = "Cayleb.AJ"
TITLE = "Forward Thinking Engineer"
HEADLINE = "Show me how you work. I'll find where AI fits."
CHIP = ("3,300+ automated checks", "5 systems")
URL = "cayleb-james2008.github.io/agentic-resume"
X = 80


def font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(path), size * SS)


def s(*values: float):
    """Card coordinates (1×) to canvas coordinates."""
    return tuple(v * SS for v in values)


def tile(draw: ImageDraw.ImageDraw, x: int, y: int, size: int, mono: int) -> None:
    """The >_ tile: ink square, accent mono glyphs, centred."""
    draw.rounded_rectangle(s(x, y, x + size, y + size), radius=size * 0.24 * SS, fill=INK)
    f = font(MONO, mono)
    box = draw.textbbox((0, 0), ">_", font=f)
    gx = x * SS + (size * SS - (box[2] - box[0])) / 2 - box[0]
    gy = y * SS + (size * SS - (box[3] - box[1])) / 2 - box[1]
    draw.text((gx, gy), ">_", font=f, fill=ACCENT)


def chip(draw: ImageDraw.ImageDraw, x: int, y: int) -> None:
    """The terminal chip: a drawn tick (the mono subset has no ✓), the counts, a dim middle dot."""
    f = font(MONO, 22)
    pad, gap, tick = 20, 12, 16
    parts = [(CHIP[0], TERM_FG), ("  ·  ", TERM_DIM), (CHIP[1], TERM_FG)]
    text_w = sum(draw.textlength(t, font=f) for t, _ in parts) / SS
    h = 52
    draw.rounded_rectangle(s(x, y, x + pad + tick + gap + text_w + pad, y + h), radius=10 * SS, fill=TERM)
    cy = y + h / 2
    tx = x + pad
    draw.line(s(tx, cy, tx + 5.5, cy + 5.5, tx + tick, cy - 6), fill=OK, width=3 * SS, joint="curve")
    cx = (tx + tick + gap) * SS
    for text, colour in parts:
        draw.text((cx, cy * SS), text, font=f, fill=colour, anchor="lm")
        cx += draw.textlength(text, font=f)


def graph(draw: ImageDraw.ImageDraw) -> None:
    """The Ergon figure in miniature: a hub wired down to four people; the second wire is live."""
    hub = (896, 428, 1120, 484)
    people = [(868 + k * 66, 540, 868 + k * 66 + 48, 588) for k in range(4)]
    bus = 512
    hx = (hub[0] + hub[2]) / 2
    for k, (l, t, r, _) in enumerate(people):
        px = (l + r) / 2
        colour = WIRE_HOT if k == 1 else WIRE
        draw.line(s(hx, hub[3], hx, bus, px, bus, px, t), fill=colour, width=2 * SS, joint="curve")
    # The update in flight, partway along the live wire.
    live = (people[1][0] + people[1][2]) / 2
    dot = ((hx + live) / 2, bus)
    draw.ellipse(s(dot[0] - 6, dot[1] - 6, dot[0] + 6, dot[1] + 6), fill=ACCENT)
    draw.rounded_rectangle(s(*hub), radius=14 * SS, fill=INK)
    tile(draw, hub[0] + 10, hub[1] + 10, 36, 16)
    draw.text(s(hub[0] + 60, (hub[1] + hub[3]) / 2), "Ergon", font=font(ONEST[500], 22), fill=SURFACE, anchor="lm")
    for k, box in enumerate(people):
        draw.rounded_rectangle(s(*box), radius=12 * SS, fill=SURFACE, outline=ACCENT if k == 1 else WIRE, width=2 * SS)
        l, t, r, b = box
        draw.ellipse(s(l + 15, t + 9, r - 15, t + 27), fill=WIRE)
        draw.rounded_rectangle(s(l + 10, b - 14, r - 10, b - 9), radius=2 * SS, fill=WIRE)


def card() -> Image.Image:
    img = Image.new("RGB", (W * SS, H * SS), GROUND)
    draw = ImageDraw.Draw(img)
    tile(draw, X, 64, 56, 24)
    draw.text(s(X + 56 + 18, 64 + 28), WORDMARK, font=font(ONEST[600], 34), fill=INK, anchor="lm")
    draw.text(s(X, 196), TITLE, font=font(ONEST[500], 26), fill=ACCENT_INK)
    big = font(ONEST[600], 64)
    first, second = HEADLINE.split(". ", 1)
    draw.text(s(X, 238), first + ".", font=big, fill=INK)
    draw.text(s(X, 238 + 74), second, font=big, fill=INK)
    chip(draw, X, 436)
    draw.text(s(X, 546), URL, font=font(ONEST[400], 20), fill=MUTED)
    graph(draw)
    return img.resize((W, H), Image.LANCZOS)


def main(out: Path) -> Path:
    out = Path(out)
    out.parent.mkdir(parents=True, exist_ok=True)
    card().save(out, "PNG", optimize=True)
    return out


if __name__ == "__main__":
    print(main(Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "assets" / "og" / "card.png"))
