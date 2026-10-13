"""The document shell: head, the sticky stack, and the blocks in order."""
from markup import PLATE_CLIP, attr, text
from templates import social

STYLES = ("tokens", "base", "hero", "approach", "experience", "projects", "contact", "guide")

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


def stack_layer(section: str) -> str:
    return (
        '<div class="stack-layer" data-stack-layer>'
        f'<div class="stack-inner" data-stack-inner>{section}</div>'
        '<div class="stack-shade" data-stack-shade aria-hidden="true"></div></div>'
    )


def render(content: dict, blocks: dict) -> str:
    meta = content["meta"]
    styles = "".join(f'<link rel="stylesheet" href="site/css/{name}.css">' for name in STYLES)
    fonts = "".join(
        f'<link rel="preload" href="assets/fonts/{name}.woff2" as="font" type="font/woff2" crossorigin>'
        for name in PRELOAD_FONTS
    )
    defs = (
        '<svg class="svg-defs" width="0" height="0" aria-hidden="true" focusable="false">'
        '<clipPath id="plate-clip" clipPathUnits="objectBoundingBox">'
        f'<path d="{PLATE_CLIP}"/></clipPath></svg>'
    )
    return (
        '<!doctype html>\n<html lang="en"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1">'
        f"<title>{text(meta['title'])}</title>"
        f'<meta name="description" content="{attr(meta["description"])}">'
        f'{social.tags(meta, "", meta["title"], meta["description"])}'
        '<meta name="theme-color" content="#f7fafb">'
        '<link rel="icon" href="favicon.svg" type="image/svg+xml">'
        f"<script>{HEAD_SCRIPT}</script>{fonts}{styles}"
        f'<script type="importmap">{IMPORT_MAP}</script>'
        '<script type="module" src="site/js/main.js"></script>'
        "</head><body>"
        '<a class="skip-link" href="#experience">Skip to experience</a>'
        '<div class="asset-banner" role="alert" hidden></div>'
        f"{defs}<main>"
        '<div class="stack" data-stack>'
        f"{stack_layer(blocks['hero'])}{stack_layer(blocks['approach'])}"
        f'<div class="stack-last">{blocks["experience"]}</div>'
        "</div>"
        f"{blocks['projects']}</main>"
        f"<footer class=\"site-footer\">{blocks['contact']}</footer>"
        f"{blocks['guide']}"
        "</body></html>\n"
    )
