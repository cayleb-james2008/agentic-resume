"""The document shell: head, then the masthead, the story and the résumé half in <main>, the contact footer and
the guide.

The résumé half sits inside <main>: its <header class="resume-half-head"> would be a second banner landmark
anywhere else.
"""
from markup import attr, text
from templates import social

STYLES = ("tokens", "base", "masthead", "story", "resume-half", "contact", "guide")

IMPORT_MAP = (
    '{"imports":{"three":"./vendor/three-0.185.0/three.module.min.js",'
    '"three/addons/":"./vendor/three-0.185.0/addons/",'
    '"lenis":"./vendor/lenis-1.3.26/lenis.mjs"}}'
)

# Marks the page as scripted, opens it at the top unless a deep link names a section, and un-hides everything if
# the module graph never finishes booting (see Review Focus 3).
HEAD_SCRIPT = (
    'document.documentElement.classList.add("js");'
    'if("scrollRestoration" in history)history.scrollRestoration="manual";'
    "if(!location.hash)scrollTo(0,0);"
    'setTimeout(function(){if(!window.__homeBooted)document.documentElement.classList.add("reveal-failsafe")},4000);'
)

PRELOAD_FONTS = ("oswald-latin-700-normal", "space-grotesk-latin-400-normal")

# The water's modules, fetched alongside main.js rather than only once story.js asks for them, so the story is
# not left waiting on three.js (it gives up after 4s; see story.js). Only where motion is allowed: with motion
# reduced the story never loads them. They follow the import map, which must come before any module fetch.
PRELOAD_MODULES = (
    "site/js/story/water.js",
    "vendor/three-0.185.0/three.module.min.js",
    "vendor/three-0.185.0/three.core.min.js",
)
MOTION_OK = "(prefers-reduced-motion: no-preference)"


def render(content: dict, blocks: dict) -> str:
    meta = content["meta"]
    styles = "".join(f'<link rel="stylesheet" href="site/css/{name}.css">' for name in STYLES)
    fonts = "".join(
        f'<link rel="preload" href="assets/fonts/{name}.woff2" as="font" type="font/woff2" crossorigin>'
        for name in PRELOAD_FONTS
    )
    modules = "".join(f'<link rel="modulepreload" href="{path}" media="{MOTION_OK}">' for path in PRELOAD_MODULES)
    return (
        '<!doctype html>\n<html lang="en"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1">'
        f"<title>{text(meta['title'])}</title>"
        f'<meta name="description" content="{attr(meta["description"])}">'
        f'{social.tags(meta, "", meta["title"], meta["description"])}'
        '<meta name="theme-color" content="#f7fafb">'
        '<link rel="icon" href="favicon.svg" type="image/svg+xml">'
        f"<script>{HEAD_SCRIPT}</script>{fonts}{styles}"
        f'<script type="importmap">{IMPORT_MAP}</script>{modules}'
        '<script type="module" src="site/js/main.js"></script>'
        "</head><body>"
        '<a class="skip-link" href="#resume">Skip to résumé</a>'
        f"{blocks['masthead']}"
        f"<main>{blocks['story']}{blocks['resume_half']}</main>"
        f'<footer class="site-footer">{blocks["contact"]}</footer>'
        f"{blocks['guide']}"
        "</body></html>\n"
    )
