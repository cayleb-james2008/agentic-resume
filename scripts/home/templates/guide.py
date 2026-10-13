"""The guide: Cayleb's droplet agent riding along in the corner (spec 2026-10-12-droplet-agent-guide-design).

Everything is `hidden` until site/js/guide/guide.js mounts it, so without
JavaScript the guide simply isn't there. The bubble restates each section and
is aria-hidden; the panel is the accessible part — a labelled, non-modal
dialog of disclosure questions.
"""
from markup import attr, link, text

# The droplet, flat: the hero's teardrop (point up), its cyan core, two eyes.
DROPLET_SVG = (
    '<svg class="guide-droplet" viewBox="0 0 64 72" aria-hidden="true" focusable="false">'
    '<defs><radialGradient id="guide-glass" cx="0.38" cy="0.62" r="0.75">'
    '<stop offset="0" stop-color="#eafcfe"/><stop offset="0.6" stop-color="#b4eff6"/>'
    '<stop offset="1" stop-color="#5fdbe8"/></radialGradient></defs>'
    '<path class="guide-droplet-body" d="M32 4C37 17 56 30 56 46A24 24 0 0 1 8 46C8 30 27 17 32 4Z"/>'
    '<circle class="guide-droplet-core" cx="32" cy="52" r="8"/>'
    '<g class="guide-droplet-eyes" data-guide-eyes>'
    '<ellipse cx="25" cy="44" rx="3.2" ry="4.6"/><ellipse cx="39" cy="44" rx="3.2" ry="4.6"/>'
    '<circle class="guide-droplet-glint" cx="24" cy="42" r="1.1"/>'
    '<circle class="guide-droplet-glint" cx="38" cy="42" r="1.1"/></g>'
    '<path class="guide-droplet-shine" d="M20 30C22 25 25 21 28 17"/>'
    "</svg>"
)


def question(index: int, item: dict) -> str:
    links = ""
    if item.get("links"):
        links = '<p class="guide-links">' + "".join(link(l["href"], l["label"]) for l in item["links"]) + "</p>"
    return (
        f'<li><button type="button" class="guide-q" id="guide-q-{index}" aria-expanded="false" '
        f'aria-controls="guide-a-{index}">{text(item["q"])}</button>'
        f'<div class="guide-a" id="guide-a-{index}" role="region" aria-labelledby="guide-q-{index}" hidden>'
        f'<p>{text(item["a"])}</p>{links}</div></li>'
    )


def render(content: dict) -> str:
    g = content["guide"]
    lines = {"greeting": g["greeting"], **g["lines"]}
    data = "".join(f' data-line-{attr(k)}="{attr(v)}"' for k, v in lines.items())
    questions = "".join(question(i, q) for i, q in enumerate(g["questions"]))
    return (
        f'<aside class="guide" data-guide hidden aria-label="{attr(g["label"])}"{data}>'
        '<div class="guide-panel" id="guide-panel" role="dialog" aria-modal="false" aria-labelledby="guide-title" hidden>'
        '<div class="guide-panel-head">'
        f'<h2 class="guide-title" id="guide-title">{text(g["title"])}</h2>'
        f'<button type="button" class="guide-close" data-guide-close aria-label="{attr(g["close"])}">'
        '<span aria-hidden="true"></span><span aria-hidden="true"></span></button></div>'
        f'<p class="guide-intro">{text(g["intro"])}</p>'
        f'<ul class="guide-qs">{questions}</ul>'
        f'<button type="button" class="guide-quiet" data-guide-quiet aria-pressed="false">{text(g["quiet"])}</button>'
        "</div>"
        # The dock moves (bob, rise, footer lift); the panel does not — a transformed
        # ancestor would also trap the phone's fixed bottom sheet inside it.
        '<div class="guide-dock" data-guide-dock>'
        '<p class="guide-bubble" data-guide-bubble aria-hidden="true" hidden></p>'
        f'<button type="button" class="guide-agent" data-guide-agent aria-controls="guide-panel" aria-expanded="false" '
        f'aria-label="{attr(g["label"])}">{DROPLET_SVG}</button>'
        "</div></aside>"
    )
