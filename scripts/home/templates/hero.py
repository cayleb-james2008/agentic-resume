"""The hero: the surface layer as a picture, the blueprint painted under the pointer (site/js/home/liquid.js),
the headline, the carousel card and the Built with list. Every item is in the page without JavaScript."""
from markup import attr, eyebrow, icon, image_size, rv, text

SURFACE_WIDE, SURFACE_TALL = "assets/hero/surface-wide.jpg", "assets/hero/surface-tall.jpg"
BLUEPRINT_WIDE, BLUEPRINT_TALL = "assets/hero/blueprint-wide.jpg", "assets/hero/blueprint-tall.jpg"


def _cta(c: dict) -> str:
    if c.get("modal"):
        return f'<button class="pill dark arrow" type="button" data-modal>{text(c["label"])}<span class="pb">{icon("arrow")}</span></button>'
    return f'<a class="pill outline" href="{attr(c["href"])}" data-go="{attr(c["href"].lstrip("#"))}">{text(c["label"])}</a>'


def _carousel(h: dict) -> str:
    items = []
    for i, c in enumerate(h["carousel"]):
        state = ' class="hc-item on"' if i == 0 else ' class="hc-item"'
        items.append(f'<div{state}><p class="hc-cap">{text(c["caption"])}</p><p class="hc-title">{text(c["title"])}</p></div>')
    dots = "".join('<i class="on"></i>' if i == 0 else "<i></i>" for i in range(len(h["carousel"])))
    label = attr(h["carouselLabel"])
    return (
        f'<div class="hcard"{rv("card", 400)}>'
        f'<div class="hc-row" data-carousel role="group" aria-roledescription="carousel" aria-label="{label}">'
        f'<button class="hc-tile" type="button" data-hc="1" aria-label="{attr(h["next"])}: {label}">&gt;_</button>'
        f'<div class="hc-panel"><div class="hc-slot" aria-live="off">{"".join(items)}</div>'
        f'<div class="hc-foot"><div class="hc-dots" aria-hidden="true">{dots}</div>'
        f'<div class="hc-nav"><button class="prev" type="button" data-hc="-1" aria-label="{attr(h["previous"])}">{icon("arrow")}</button>'
        f'<button type="button" data-hc="1" aria-label="{attr(h["next"])}">{icon("arrow")}</button></div></div></div>'
        "</div></div>"
    )


def render(content: dict) -> str:
    h = content["hero"]
    width, height = image_size(SURFACE_WIDE)
    built = "".join(f"<li>{icon('dot')}{text(name)}</li>" for name in h["builtWith"])
    first, second = h["proof"]
    status = h["status"]
    return (
        '<section class="hero" id="home" aria-labelledby="hero-title">'
        f'<div class="lr" data-liquid data-wide="{BLUEPRINT_WIDE}" data-tall="{BLUEPRINT_TALL}">'
        f'<picture><source media="(max-width: 1023.98px), (max-aspect-ratio: 7/5)" srcset="{SURFACE_TALL}">'
        f'<img src="{SURFACE_WIDE}" alt="" width="{width}" height="{height}" fetchpriority="high" decoding="async"></picture>'
        '<canvas aria-hidden="true"></canvas></div>'
        '<div class="hero-vig" aria-hidden="true"></div>'
        f'<div class="hero-wm" aria-hidden="true"{rv("wm", 300)}>{text(h["watermark"])}</div>'
        '<div class="shell hero-grid"><div class="hero-l">'
        f'{eyebrow(h["eyebrow"], reveal=rv("", 200, "--ty:10px"))}'
        f'<h1 class="h1" id="hero-title" data-lines data-stagger="120" style="--d:250ms">{text(h["headline"])}</h1>'
        f'<p class="hero-lead"{rv("", 520)}>{text(h["lead"])}</p>'
        f'<p class="proof mono"{rv("", 650)}><b>✓</b>{text(first)} <span>·</span> {text(second)}</p>'
        f'<div class="ctas"{rv("", 750)}>{"".join(_cta(c) for c in h["ctas"])}</div>'
        f'<p class="hint mono"{rv("fade", 1100)}>{text(h["hint"])}</p>'
        "</div>"
        f'<div class="hero-r">{_carousel(h)}'
        f'<div class="stackline"{rv("", 550, "--ty:14px")}><p class="stackline-l">{text(h["builtWithLabel"])}</p><ul>{built}</ul></div>'
        "</div></div>"
        f'<div class="shell hero-bar"{rv("fade", 900)}><div class="hb-in"><span>{text(status[0])}</span>'
        f'<span class="hb-c">{text(status[1])}</span><span>{text(status[2])}</span></div></div>'
        "</section>"
    )
