"""The document shell (the 2026-10-15 layout): the head, then the loader, the masthead, <main> (hero through
the résumé half), the contact footer, and the overlays: menu, request modal and Ask my agent.

The résumé half sits inside <main>: its <header class="resume-half-head"> would be a second banner landmark
anywhere else.
"""
from markup import attr, text
from templates import social

STYLES = ("tokens", "base", "masthead", "hero", "about", "ergon", "built", "services", "resume-half", "contact",
          "overlays", "guide")
BLOCKS = ("loader", "masthead", "hero", "about", "ergon", "built", "services", "stats", "resume_half", "contact",
          "menu", "modal", "guide")
MAIN = ("hero", "about", "ergon", "built", "services", "stats", "resume_half")

IMPORT_MAP = '{"imports":{"lenis":"./vendor/lenis-1.3.26/lenis.mjs"}}'

# Marks the page as scripted, opens it at the top unless a deep link names a section, and un-hides everything if
# the module graph never finishes booting.
HEAD_SCRIPT = (
    'document.documentElement.classList.add("js");'
    'if("scrollRestoration" in history)history.scrollRestoration="manual";'
    "if(!location.hash)scrollTo(0,0);"
    'setTimeout(function(){if(!window.__homeBooted)document.documentElement.classList.add("reveal-failsafe")},4000);'
)

PRELOAD_FONTS = ("onest-latin-600-normal", "onest-latin-400-normal")
HERO_PRELOAD = '<link rel="preload" href="assets/hero/surface-wide.jpg" as="image" media="(min-aspect-ratio: 3/4)">'
THEME_COLOR = "#090a0b"


def render(content: dict, blocks: dict) -> str:
    meta = content["meta"]
    styles = "".join(f'<link rel="stylesheet" href="site/css/{name}.css">' for name in STYLES)
    fonts = "".join(
        f'<link rel="preload" href="assets/fonts/{name}.woff2" as="font" type="font/woff2" crossorigin>'
        for name in PRELOAD_FONTS
    )
    main = "".join(blocks[k] for k in MAIN)
    return (
        '<!doctype html>\n<html lang="en"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        f"<title>{text(meta['title'])}</title>"
        f'<meta name="description" content="{attr(meta["description"])}">'
        f'{social.tags(meta, "", meta["title"], meta["description"])}'
        f'<meta name="theme-color" content="{THEME_COLOR}">'
        '<link rel="icon" href="favicon.svg" type="image/svg+xml">'
        f"<script>{HEAD_SCRIPT}</script>{fonts}{HERO_PRELOAD}{styles}"
        f'<script type="importmap">{IMPORT_MAP}</script>'
        '<script type="module" src="site/js/main.js"></script>'
        "</head><body>"
        f"{blocks['loader']}"
        f'<a class="skip-link" href="#main">{text(content["masthead"]["skip"])}</a>'
        f"{blocks['masthead']}"
        f'<main id="main">{main}</main>'
        f'<footer class="site-footer dark-ctx">{blocks["contact"]}</footer>'
        f"{blocks['menu']}{blocks['modal']}{blocks['guide']}"
        "</body></html>\n"
    )
