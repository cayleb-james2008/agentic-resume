"""Hero block — spec §L333–501, with the Personalization map's substitutions."""
from markup import ARROW, HERO_CTA_FRAME, ICONS, attr, corners, link, reveal, text

# Entrance delays, measured from the loader's handover (spec §L5502–5512).
IDENTITY = 180
META = IDENTITY + 260
META_STEP = 130
PANELS = 900
ACTIONS = 1500


def masthead(content: dict) -> str:
    items = "".join(f"<li>{link(n['href'], n['label'])}</li>" for n in content["nav"])
    action = content["navAction"]
    return (
        '<header class="masthead" data-masthead data-rise data-delay="0">'
        f'<a class="wordmark" href="./" aria-label="Cayleb Alvarez-James, home">{text(content["wordmark"])}</a>'
        f'<nav class="masthead-nav" aria-label="Primary"><ul>{items}</ul></nav>'
        f'<a class="masthead-action" href="{attr(action["href"])}">'
        f'<span aria-hidden="true">[ </span>{text(action["label"])}<span aria-hidden="true"> → ]</span></a>'
        '<button class="burger" type="button" aria-label="Open menu" aria-expanded="false" '
        'aria-controls="menu-sheet" data-burger><span></span><span></span></button>'
        "</header>"
    )


def identity(hero: dict) -> str:
    name = " ".join([hero["nameWords"][0], "".join(hero["nameWords"][1:])])
    meta = "".join(
        f'<li data-rise data-delay="{META + i * META_STEP}">{ICONS[row["icon"]]}<span>{text(row["label"])}</span></li>'
        for i, row in enumerate(hero["meta"])
    )
    return (
        '<div class="hero-identity">'
        f'<p class="hero-id" data-fade data-delay="{IDENTITY}">{text(hero["eyebrow"])}</p>'
        f'<h1 class="hero-name" id="hero-name">'
        f'{reveal(name, "word", stagger=110, delay=IDENTITY, config="REVEAL", mode="once", words=hero["nameWords"])}'
        "</h1>"
        f'<ul class="hero-meta">{meta}</ul></div>'
    )


def panels(hero: dict) -> str:
    now = hero["now"]
    lines = "".join(f"<dd>{text(line)}</dd>" for line in now["lines"])
    glance = hero["glance"]
    stats = "".join(
        f'<div class="stat"><dt>{text(s["label"])}</dt>'
        f'<dd>{reveal(s["value"], "letter", stagger=26, delay=PANELS + i * 90, config="FIGURE", mode="forward")}</dd></div>'
        for i, s in enumerate(glance["stats"])
    )
    return (
        f'<div class="hero-panels" data-hero-panels data-rise data-from="translateY(1.25rem)" data-delay="{PANELS}">'
        f'<div class="bracket-panel">{corners()}'
        f'<p class="panel-eyebrow">{text(now["eyebrow"])}</p>'
        f'<div class="panel-row"><dl class="panel-list"><dt>{text(now["title"])}</dt>{lines}</dl>{ICONS["graph"]}</div></div>'
        f'<div class="bracket-panel">{corners()}'
        f'<p class="panel-eyebrow">{text(glance["eyebrow"])}</p>'
        f'<dl class="hero-stats" data-hero-stats>{stats}</dl></div>'
        "</div>"
    )


def actions(hero: dict) -> str:
    lab, cta = hero["lab"], hero["cta"]
    links = "".join(f"<li>{link(l['href'], l['label'])}</li>" for l in hero["links"])
    return (
        f'<div class="hero-actions" data-rise data-from="translateY(1.25rem)" data-delay="{ACTIONS}">'
        f'<a class="hero-lab" href="{attr(lab["href"])}">{ICONS["play"]}'
        f'<span class="hero-lab-text"><span class="hero-lab-label">{text(lab["label"])}</span>'
        f'<span class="hero-lab-sub">{text(lab["sub"])}</span></span></a>'
        f'<a class="cta cta--hero" href="{attr(cta["href"])}" download>{HERO_CTA_FRAME}'
        f'<span class="cta-label">{text(cta["label"])}</span>{ARROW}</a>'
        f'<ul class="hero-links">{links}</ul></div>'
    )


def veil(content: dict) -> str:
    loading = content["loading"]
    return (
        f'<div class="veil" data-veil role="status" aria-label="{attr(loading["label"])}" '
        f'data-done-label="{attr(loading["done"])}">'
        '<div class="veil-mark" aria-hidden="true"><span class="veil-shell"></span>'
        '<span class="veil-fill" data-veil-fill></span></div>'
        f'<p class="veil-name" data-veil-name aria-hidden="true">{text(loading["name"].lower())}</p>'
        '<div class="veil-meter" aria-hidden="true"><span data-veil-meter></span></div></div>'
    )


def render(content: dict) -> str:
    hero = content["hero"]
    return (
        '<section class="hero" data-hero id="home" aria-labelledby="hero-name">'
        '<div class="hero-scene" data-hero-scene aria-hidden="true"><canvas></canvas></div>'
        '<div class="hero-ramp" aria-hidden="true"></div>'
        '<div class="hero-fit" aria-hidden="true"><div class="hero-fit-box" data-hero-fit-box></div>'
        '<div class="hero-fit-ramp"></div></div>'
        f"{veil(content)}"
        '<div class="hero-content">'
        f"{masthead(content)}"
        f'<div class="hero-middle">{identity(hero)}{panels(hero)}</div>'
        f"{actions(hero)}</div></section>"
    )
