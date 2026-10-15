"""What I do: five rows that fill on hover; each opens the request modal on its topic."""
from markup import attr, eyebrow, icon, rv, text


def render(content: dict) -> str:
    s = content["services"]
    rows = "".join(
        f'<li{rv("row", i * 80)}><a class="sv-row" href="#contact" data-modal="{attr(r["topic"])}">'
        f'<span class="sv-i mono">{text(r["route"])}</span>'
        f'<div class="sv-mid"><h3>{text(r["title"])}</h3><p>{text(r["text"])}</p></div>'
        f'<span class="sv-b">{icon("upright")}</span></a></li>'
        for i, r in enumerate(s["rows"])
    )
    return (
        '<section class="services" id="services" aria-labelledby="services-title"><div class="shell">'
        f'{eyebrow(s["eyebrow"], reveal=rv())}'
        f'<h2 class="h2 sv-h" id="services-title" data-lines style="--d:120ms">{text(s["headline"])}</h2>'
        f'<ul class="sv">{rows}</ul></div></section>'
    )
