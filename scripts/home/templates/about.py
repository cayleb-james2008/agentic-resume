"""About: who he is in one statement, revealed word by word; then the band "AI built → around you"."""
from markup import attr, eyebrow, icon, rv, text


def _social(link: dict, first: bool) -> str:
    cls = ' class="acc"' if first else ""
    label = attr(link["label"])
    if link.get("modal"):
        return f'<a{cls} href="#contact" data-modal aria-label="{label}" title="{label}">{icon(link["icon"])}</a>'
    href = link["href"]
    extra = " download" if href.endswith(".pdf") else ' target="_blank" rel="noopener"'
    return f'<a{cls} href="{attr(href)}"{extra} aria-label="{label}" title="{label}">{icon(link["icon"])}</a>'


def render(content: dict) -> str:
    a = content["about"]
    socials = "".join(_social(link, i == 0) for i, link in enumerate(a["links"]))
    band = content["band"]
    tiles = (
        f'<li{rv("band", 0)}><span class="bt light">{text(band[0])}</span></li>'
        f'<li{rv("band", 120)}><span class="bt accent">{text(band[1])}</span></li>'
        f'<li{rv("band", 240)} aria-hidden="true"><span class="bt dark">{icon("arrow")}</span></li>'
        f'<li{rv("band", 360)}><span class="bt ghost">{text(band[2])}</span></li>'
    )
    return (
        '<section class="about" id="about" aria-labelledby="about-title"><div class="shell about-in">'
        '<div class="about-l"><span class="about-glyph" aria-hidden="true">&gt;_</span>'
        f'{eyebrow(a["eyebrow"])}<p class="about-cap"{rv()}>{icon("pin")}<span>{text(a["caption"])}</span></p></div>'
        '<div class="about-r">'
        f'<h2 class="about-h" id="about-title" data-words>{text(a["lead"])} <span class="mute">{text(a["rest"])}</span></h2>'
        f'<div class="about-foot"{rv("", 200)}><div><p class="af-l">{text(a["online"])}</p><div class="soc">{socials}</div></div>'
        f'<a class="pill outline arrow" href="{attr(a["cta"]["href"])}" data-go="{attr(a["cta"]["href"].lstrip("#"))}">'
        f'{text(a["cta"]["label"])}<span class="pb">{icon("arrow")}</span></a></div>'
        "</div></div></section>"
        f'<div class="band"><ul class="shell band-in" aria-label="{attr(" ".join(band))}">{tiles}</ul></div>'
    )
