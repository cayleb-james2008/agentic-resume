"""The résumé page: the homepage's masthead, the generated candidate fragment
(resume/candidate-fragment.html, built by resume/build_resume.py) and a slim
footer. No script — it reads the same with or without JavaScript, and prints."""
from markup import attr, link, text
from templates import social

STYLES = ("tokens", "base", "resume")
TITLE = "Résumé · Cayleb Alvarez-James"
DESCRIPTION = (
    "Cayleb Alvarez-James, Forward Thinking Engineer: experience, education, selected projects and skills, "
    "with one-page and detailed PDF downloads."
)


def _href(href: str) -> str:
    """Homepage anchors become links back to the homepage section."""
    return f"./{href}" if href.startswith("#") else href


def masthead(content: dict) -> str:
    items = "".join(f"<li>{link(_href(n['href']), n['label'])}</li>" for n in content["nav"])
    return (
        '<header class="resume-masthead">'
        f'<a class="resume-wordmark" href="./" aria-label="Cayleb Alvarez-James, home">{text(content["wordmark"])}</a>'
        f'<nav aria-label="Primary"><ul>{items}</ul></nav>'
        f'<a class="resume-download" href="{attr(content["meta"]["onePagePdf"])}" download>One-page PDF ↓</a>'
        "</header>"
    )


def footer(content: dict) -> str:
    c = content["contact"]
    links = "".join(f"<li>{link(_href(l['href']), l['label'])}</li>" for l in c["links"])
    return (
        '<footer class="resume-footer">'
        f"<p>{text(c['copyright'])}</p>"
        f'<ul aria-label="Elsewhere">{links}</ul>'
        "</footer>"
    )


def render(content: dict, fragment: str) -> str:
    meta = content["meta"]
    styles = "".join(f'<link rel="stylesheet" href="site/css/{name}.css">' for name in STYLES)
    return (
        '<!doctype html>\n<html lang="en"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1">'
        f"<title>{text(TITLE)}</title>"
        f'<meta name="description" content="{attr(DESCRIPTION)}">'
        f'{social.tags(meta, "resume.html", TITLE, DESCRIPTION)}'
        '<link rel="icon" href="favicon.svg" type="image/svg+xml">'
        f"{styles}</head><body class=\"resume-page\">"
        '<a class="skip-link" href="#resume">Skip to résumé</a>'
        f"{masthead(content)}"
        f'<main class="resume-main">{fragment.strip()}</main>'
        f"{footer(content)}"
        "</body></html>\n"
    )
