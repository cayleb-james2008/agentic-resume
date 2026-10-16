"""The hero: the title, the headline in two lines, one plain sentence, the two doors (hiring, or a team that
wants AI) and, beside them, the Ask bar (ask.py). Each piece carries `data-in` and its place in the one
entrance sequence; with the script off or motion reduced, everything simply stands there."""
from markup import attr, icon, text
from templates import ask


def _lines(headline: str) -> str:
    """The headline's two sentences as two lines, with a real space between them for anything that reads text."""
    first, sep, rest = headline.partition(". ")
    parts = [f"{first}.", rest] if sep else [headline]
    return " ".join(f'<span class="hl" data-in style="--i:{i + 1}">{text(p)}</span>' for i, p in enumerate(parts))


def render(content: dict) -> str:
    h = content["hero"]
    doors = "".join(
        f'<a class="door{" door--first" if i == 0 else ""}" href="{attr(d["href"])}" data-go="{attr(d["href"].lstrip("#"))}">'
        f'<span>{text(d["label"])}</span>{icon("down")}</a>'
        for i, d in enumerate(h["doors"])
    )
    return (
        '<section class="hero" id="home" aria-labelledby="hero-title"><div class="shell hero-in">'
        f'<p class="hero-eyebrow" data-in style="--i:0">{text(h["eyebrow"])}</p>'
        f'<h1 class="hero-h" id="hero-title">{_lines(h["headline"])}</h1>'
        '<div class="hero-side">'
        f'<p class="hero-lead" data-in style="--i:3">{text(h["lead"])}</p>'
        f'<nav class="doors" aria-label="{attr(h["doorsLabel"])}" data-in style="--i:4">{doors}</nav>'
        "</div>"
        f"{ask.render(content)}"
        "</div></section>"
    )
