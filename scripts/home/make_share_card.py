"""The 1200×630 share card that link previews show (Open Graph / Twitter).

    python3 scripts/home/make_share_card.py assets/og/card.png

The site shows no picture of him, so the card is type and one small figure, in the homepage's look: the
wordmark with its blue full stop, the title, the headline in two lines of wide Mona Sans, and the hero's Ask
bar with its suggestions (read from site/content.json, so they cannot drift from the page).
Deterministic: the same inputs give the same file.
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
W, H = 1200, 630
SS = 2  # drawn at 2× and shrunk, so the rounded shapes are smooth

# The homepage's light tokens (site/css/tokens.css).
PAPER = (245, 246, 248)      # --raw-paper
WHITE = (255, 255, 255)      # --raw-white
SUNK = (236, 238, 242)       # --raw-sunk
MIDNIGHT = (18, 26, 43)      # --raw-midnight
GRAPHITE = (74, 84, 104)     # --raw-graphite
CONTROL = (124, 133, 152)    # --raw-control
HAIRLINE = (220, 224, 231)   # --raw-hairline
INK_BLUE = (35, 64, 216)     # --raw-ink-blue

MONA = ROOT / "assets" / "fonts" / "mona-sans-latin-wdth-normal.woff2"

WORDMARK = "Cayleb.AJ"
TITLE = "Forward Thinking Engineer"
HEADLINE = "Show me how you work. I'll find where AI fits."
URL = "cayleb-james2008.github.io/agentic-resume"
X = 80


def font(size: float, weight: int, width: int = 100) -> ImageFont.FreeTypeFont:
    """Mona Sans at a weight and width. Its default instance is the lightest, so every face sets both axes."""
    f = ImageFont.truetype(str(MONA), int(size * SS))
    names = [a["name"].decode() if isinstance(a["name"], bytes) else a["name"] for a in f.get_variation_axes()]
    f.set_variation_by_axes([width if n == "Width" else weight for n in names])
    return f


def s(*values: float):
    """Card coordinates (1×) to canvas coordinates."""
    return tuple(v * SS for v in values)


def ask_content() -> tuple[str, list[str]]:
    content = json.loads((ROOT / "site" / "content.json").read_text())
    guide = content["guide"]
    return guide["placeholder"], [q["q"] for q in guide["questions"] if q.get("chip")]


def wordmark(draw: ImageDraw.ImageDraw, x: float, y: float) -> None:
    """Cayleb.AJ, its full stop in signature blue."""
    f = font(34, 650, 118)
    first, _, rest = WORDMARK.partition(".")
    for text, colour in ((first, MIDNIGHT), (".", INK_BLUE), (rest, MIDNIGHT)):
        draw.text((x * SS, y * SS), text, font=f, fill=colour, anchor="ls")
        x += draw.textlength(text, font=f) / SS


def headline(draw: ImageDraw.ImageDraw, y: float) -> None:
    first, second = HEADLINE.split(". ", 1)
    size = 76
    while True:  # the longer line fits the card's measure
        f = font(size, 640, 118)
        if max(draw.textlength(t, font=f) for t in (first + ".", second)) / SS <= W - 2 * X or size <= 40:
            break
        size -= 2
    draw.text(s(X, y), first + ".", font=f, fill=MIDNIGHT, anchor="ls")
    draw.text(s(X, y + size * 1.02), second, font=f, fill=MIDNIGHT, anchor="ls")


def ask_bar(draw: ImageDraw.ImageDraw, y: float) -> None:
    """The hero's Ask bar in miniature: the field, its blue Ask button, and the suggestions under it."""
    placeholder, chips = ask_content()
    x0, x1, h = X, 820, 72
    draw.rounded_rectangle(s(x0, y, x1, y + h), radius=h / 2 * SS, fill=WHITE, outline=CONTROL, width=2 * SS)
    draw.text(s(x0 + 30, y + h / 2), placeholder, font=font(25, 420), fill=GRAPHITE, anchor="lm")
    bf = font(23, 580)
    bw = draw.textlength("Ask", font=bf) / SS + 52
    draw.rounded_rectangle(s(x1 - 8 - bw, y + 8, x1 - 8, y + h - 8), radius=(h - 16) / 2 * SS, fill=INK_BLUE)
    draw.text(s(x1 - 8 - bw / 2, y + h / 2), "Ask", font=bf, fill=WHITE, anchor="mm")
    cf = font(19, 540)
    cx, cy, ch = X, y + h + 20, 44
    for text in chips:
        cw = draw.textlength(text, font=cf) / SS + 36
        if cx + cw > W - X:
            break
        draw.rounded_rectangle(s(cx, cy, cx + cw, cy + ch), radius=ch / 2 * SS, fill=SUNK)
        draw.text(s(cx + cw / 2, cy + ch / 2), text, font=cf, fill=MIDNIGHT, anchor="mm")
        cx += cw + 10


def card() -> Image.Image:
    img = Image.new("RGB", (W * SS, H * SS), PAPER)
    draw = ImageDraw.Draw(img)
    wordmark(draw, X, 92)
    draw.text(s(W - X, 92), URL, font=font(20, 460), fill=GRAPHITE, anchor="rs")
    draw.line(s(X, 124, W - X, 124), fill=HAIRLINE, width=2 * SS)
    draw.text(s(X, 186), TITLE, font=font(26, 560), fill=GRAPHITE, anchor="ls")
    headline(draw, 272)
    ask_bar(draw, 406)
    return img.resize((W, H), Image.LANCZOS)


def main(out: Path) -> Path:
    out = Path(out)
    out.parent.mkdir(parents=True, exist_ok=True)
    card().save(out, "PNG", optimize=True)
    return out


if __name__ == "__main__":
    print(main(Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "assets" / "og" / "card.png"))
