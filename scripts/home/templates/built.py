"""What I've built: five black cards. Real product screenshots for dotz, Sophos and the Suite; small
terminals for Ergon and Asmodeus. Each card links to its case study or repository."""
from markup import attr, external, icon, image_size, rv, term, text

DELAYS = (0, 90, 180, 0, 90)


def card(c: dict, delay: int, status: str) -> str:
    tags = "".join(f"<li>{text(t)}</li>" for t in c["tags"]) + f'<li class="n">{text(c["count"])}</li>'
    chip = f'<span class="status mono">{text(status)}</span>' if c.get("status") else ""
    words = f'<div class="wc-text"><h3>{text(c["title"])}</h3><p>{text(c["text"])}</p><ul class="tags">{tags}</ul>{chip}</div>'
    shell = f'<pre class="wc-term mono">{term(c["terminal"])}</pre>' if c.get("terminal") else ""
    picture = ""
    if c.get("image"):
        width, height = image_size(c["image"]["src"])
        picture = (f'<figure class="wc-shot"><img src="{attr(c["image"]["src"])}" alt="{attr(c["image"]["alt"])}" '
                   f'width="{width}" height="{height}" loading="lazy" decoding="async"></figure>')
    body = f'<div class="wc-body">{words}{shell}</div>' if c.get("wide") else f"{picture}{shell}{words}"
    return (
        f'<li class="wc{" wide" if c.get("wide") else ""}"{rv("card2", delay)}>'
        f'<a class="wc-a" href="{attr(c["href"])}"{external(c["href"])}><article class="wc-art dark-ctx">'
        f'<div class="wc-meta"><span>{text(c["category"])}</span><span class="wc-badge">{icon("upright")}</span></div>'
        f"{body}</article></a></li>"
    )


def render(content: dict) -> str:
    b = content["built"]
    status = content["ergon"]["status"]
    cards = "".join(card(c, DELAYS[i % len(DELAYS)], status) for i, c in enumerate(b["cards"]))
    return (
        '<section class="built" id="built" aria-labelledby="built-title"><div class="shell">'
        f'<div class="sec-head"><p class="eyebrow pillish"{rv()}><i></i>{text(b["eyebrow"])}</p>'
        f'<h2 class="h2" id="built-title" data-lines style="--d:120ms">{text(b["headline"])}</h2></div>'
        f'<ul class="cards">{cards}</ul></div></section>'
    )
