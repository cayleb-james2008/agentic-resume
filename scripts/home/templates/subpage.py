"""The masthead and footer shared by the pages one level down (projects/*, lab/) and the 404 page.

Same wordmark, sections and footer credit as the homepage, with every link made relative to the page's folder,
plus Ask, which opens the homepage at its Ask bar with the field focused (site/js/main.js reads `#ask`).
"""
from markup import attr, icon, link, text, wordmark


def _href(href: str, root: str) -> str:
    """Homepage anchors and site-relative links, as seen from a page under `root` (e.g. "../")."""
    if href.startswith("#"):
        return f"{root}index.html{href}"
    if href.startswith(("http://", "https://", "mailto:")):
        return href
    return root + href


def masthead(content: dict, root: str = "../", tagline: str = "") -> str:
    items = "".join(f"<li>{link(_href(n['href'], root), n['label'])}</li>" for n in content["nav"])
    tag = f'<span class="sub-tagline">{text(tagline)}</span>' if tagline else ""
    m = content["masthead"]
    return (
        '<header class="sub-masthead">'
        f'<a class="sub-wordmark" href="{attr(root)}index.html" aria-label="Cayleb Alvarez-James, home">'
        f"{wordmark(content['wordmark'])}</a>{tag}"
        f'<nav aria-label="Primary"><ul>{items}</ul></nav>'
        f'<a class="sub-ask" href="{attr(root)}index.html#ask" aria-label="{attr(m["askLabel"])}">{icon("search")}'
        f'<span>{text(m["askLabel"])}</span></a>'
        f'<a class="sub-resume" href="{attr(root + content["meta"]["resumePdf"])}" download>Résumé PDF</a>'
        "</header>"
    )


def footer(content: dict, root: str = "../") -> str:
    c = content["contact"]
    links = "".join(f"<li>{link(_href(l['href'], root), l['label'])}</li>" for l in c["links"])
    return (
        '<footer class="sub-footer">'
        f"<p>{text(c['copyright'])}</p>"
        f'<ul aria-label="Elsewhere">{links}</ul>'
        "</footer>"
    )


def stylesheets(root: str = "../", extra: tuple[str, ...] = ("subpage",)) -> str:
    names = ("tokens", "base", *extra)
    return "".join(f'<link rel="stylesheet" href="{attr(root)}site/css/{n}.css">' for n in names)
