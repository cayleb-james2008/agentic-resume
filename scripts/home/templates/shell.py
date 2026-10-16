"""The document shell (the "Sign-off" look, 2026-10-16): the head, then the skip link, the masthead, <main>
(hero through the résumé half), the contact footer, and the two overlays: the phone menu and the composer.

The résumé half sits inside <main>: its <header class="resume-half-head"> would be a second banner landmark
anywhere else.
"""
from markup import attr, text
from templates import social

STYLES = ("tokens", "base", "masthead", "hero", "ask", "built", "services", "ergon", "resume-half", "contact",
          "overlays")
BLOCKS = ("masthead", "hero", "built", "services", "ergon", "resume_half", "contact", "menu", "modal")
MAIN = ("hero", "built", "services", "ergon", "resume_half")

# Marks the page as scripted; two frames later starts the hero's one entrance (CSS, under motion allowed only),
# so a slow module never holds the headline back. If the modules never finish booting, everything un-hides.
HEAD_SCRIPT = (
    "var d=document.documentElement;d.classList.add(\"js\");"
    "requestAnimationFrame(function(){requestAnimationFrame(function(){d.classList.add(\"is-in\")})});"
    'setTimeout(function(){if(!window.__homeBooted)d.classList.add("reveal-failsafe")},4000);'
)

PRELOAD_FONTS = ("mona-sans-latin-wdth-normal",)


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
        f"{social.theme()}"
        '<link rel="icon" href="favicon.svg" type="image/svg+xml">'
        f"<script>{HEAD_SCRIPT}</script>{fonts}{styles}"
        '<script type="module" src="site/js/main.js"></script>'
        "</head><body>"
        f'<a class="skip-link" href="#main">{text(content["masthead"]["skip"])}</a>'
        f"{blocks['masthead']}"
        f'<main id="main">{main}</main>'
        f'<footer class="site-footer">{blocks["contact"]}</footer>'
        f"{blocks['menu']}{blocks['modal']}"
        "</body></html>\n"
    )
