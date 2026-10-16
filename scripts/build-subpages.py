"""Give the project pages the homepage's look, keeping each page's own content.

    python3 scripts/build-subpages.py

For every projects/*.html: keep its title, description and everything inside
<main id="main">…</main>; replace the head's styles and scripts, the header
and the footer with the shared masthead and footer (templates/subpage.py).
Links to the retired v8 résumé PDF are pointed at the current one. Running it
again is a no-op on pages it has already converted.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts" / "home"))
from markup import attr, text  # noqa: E402
from templates import social, subpage  # noqa: E402

RETIRED_PDFS = {
    "Cayleb-James-resume.pdf": "Cayleb-James-polished-resume.pdf",
    "Cayleb-James-one-page-resume.pdf": "Cayleb-James-polished-one-page.pdf",
}


def field(pattern: str, page: str, name: str) -> str:
    match = re.search(pattern, page, re.S)
    if not match:
        raise SystemExit(f"{name}: no {pattern!r}")
    return match.group(1)


def convert(page: str, content: dict, name: str) -> str:
    title = field(r"<title>(.*?)</title>", page, name)
    description = field(r'<meta name="description" content="([^"]*)"', page, name)
    main = field(r'(<main id="main">.*?</main>)', page, name)
    for old, new in RETIRED_PDFS.items():
        main = main.replace(f"../{old}", f"../{new}")
    main = re.sub(r'<span id="y"></span>', "2026", main)
    return (
        '<!doctype html>\n<html lang="en"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1">'
        f"<title>{title}</title>"
        f'<meta name="description" content="{description}">'
        f"{social.tags(content['meta'], f'projects/{name}', html.unescape(title), html.unescape(description))}"
        f"{social.theme()}"
        '<link rel="icon" href="../favicon.svg" type="image/svg+xml">'
        f"{subpage.stylesheets('../')}</head>"
        '<body class="project-page">'
        '<a class="skip-link" href="#main">Skip to content</a>'
        f"{subpage.masthead(content, '../')}"
        f"{main}"
        f"{subpage.footer(content, '../')}"
        "</body></html>\n"
    )


LAB_STRIP = (
    '<aside class="lab-strip" aria-label="Lab status"><span class="lab-strip__edition">Industry AI Suite, recorded journeys</span>'
    '<span class="lab-strip__status">Recorded, read only</span></aside>'
)


LAB_TITLE = "Industry AI Suite — recorded journeys"
LAB_DESCRIPTION = (
    "Ten recorded Industry AI Suite journeys by Cayleb Alvarez-James. Each shows its source, "
    "the actual output and the decision left with a person. Read-only replays, not live runs."
)


def convert_lab(page: str, content: dict) -> str:
    """The lab keeps its app and markup; the head's styles and sharing tags, the top bar and the footer change."""
    head_end = page.index("</head>")
    head = re.sub(r'\s*<link rel="stylesheet" href="[^"]*">', "", page[:head_end]).rstrip()
    # Sharing tags are rebuilt every run: drop any from a previous one.
    head = re.sub(r'\n[ \t]*<meta name="description"[^\n]*', "", head)
    head = head.replace(f"<title>{text(LAB_TITLE)}</title>", f"<title>{text(LAB_TITLE)}</title>\n  "
                        f'<meta name="description" content="{attr(LAB_DESCRIPTION)}">'
                        f"{social.tags(content['meta'], 'lab/', LAB_TITLE, LAB_DESCRIPTION)}"
                        '<link rel="icon" href="../favicon.svg" type="image/svg+xml">', 1)
    if LAB_DESCRIPTION not in html.unescape(head):
        raise SystemExit("lab/index.html: title changed; update LAB_TITLE")
    # Theme metas are rebuilt every run too (the pair carries `media`, so match any theme-color meta).
    head = re.sub(r'\s*<meta name="(?:theme-color|color-scheme)"[^>]*>', "", head)
    head = head.replace('<link rel="icon" href="../favicon.svg" type="image/svg+xml">',
                        f'{social.theme()}<link rel="icon" href="../favicon.svg" type="image/svg+xml">', 1)
    head += "\n  " + subpage.stylesheets("../") + '<link rel="stylesheet" href="lab.css">\n'
    body = page[head_end:]
    top = re.compile(r'<header class="(?:topbar|sub-masthead)">.*?</header>'
                     r'(?:<(?:div|aside) class="lab-strip"[^>]*>.*?</span>\s*</(?:div|aside)>)?', re.S)
    if not top.search(body):
        raise SystemExit("lab/index.html: no top bar to replace")
    body = top.sub(lambda _: subpage.masthead(content, "../") + LAB_STRIP, body, count=1)
    # The shared footer, once, after the noscript note.
    body = re.sub(r'\s*<footer class="sub-footer">.*?</footer>', "", body, flags=re.S)
    body = body.replace("</body>", f"  {subpage.footer(content, '../')}\n</body>", 1)
    return head + body


def not_found(content: dict) -> str:
    """404.html. GitHub Pages serves it for any missing path at any depth, so every link is
    relative to the site root through <base>, and the page has no bare #-links, which <base>
    would send to the homepage."""
    site = content["meta"]["siteUrl"]
    return (
        '<!doctype html>\n<html lang="en"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1">'
        f'<base href="{attr(site)}">'
        "<title>Page not found · Cayleb Alvarez-James</title>"
        '<meta name="robots" content="noindex">'
        f"{social.theme()}"
        '<link rel="icon" href="favicon.svg" type="image/svg+xml">'
        f"{subpage.stylesheets('')}</head>"
        '<body class="project-page not-found-page">'
        f"{subpage.masthead(content, '')}"
        '<main class="not-found" id="main">'
        '<p class="not-found-code">404</p>'
        '<h1 class="not-found-title">Page not found<span class="wm-dot">.</span></h1>'
        "<p class=\"not-found-copy\">This page isn't here. It may have moved, or the link may be old.</p>"
        '<ul class="not-found-links">'
        '<li><a class="btn btn--primary" href="index.html">Home</a></li>'
        '<li><a class="btn btn--ghost" href="resume.html">Résumé</a></li>'
        '<li><a class="btn btn--ghost" href="index.html#built">Work</a></li>'
        '<li><a class="btn btn--ghost" href="lab/">Lab</a></li>'
        '<li><a class="btn btn--ghost" href="index.html#ask">Ask about Cayleb</a></li></ul>'
        "</main>"
        f"{subpage.footer(content, '')}"
        "</body></html>\n"
    )


def sitemap(content: dict) -> str:
    site = content["meta"]["siteUrl"]
    paths = ["", "resume.html", "lab/", *(f"projects/{p.name}" for p in sorted((ROOT / "projects").glob("*.html")))]
    urls = "".join(f"  <url><loc>{site}{p}</loc></url>\n" for p in paths)
    return f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}</urlset>\n'


def write(path: Path, body: str) -> None:
    """Write through a temporary file, so a reader never sees half a page."""
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_text(body)
    tmp.replace(path)


def main() -> list[Path]:
    content = json.loads((ROOT / "site/content.json").read_text())
    written = []
    for path in sorted((ROOT / "projects").glob("*.html")):
        write(path, convert(path.read_text(), content, path.name))
        written.append(path)
    lab = ROOT / "lab/index.html"
    write(lab, convert_lab(lab.read_text(), content))
    written.append(lab)
    for name, body in (("404.html", not_found(content)), ("sitemap.xml", sitemap(content))):
        write(ROOT / name, body)
        written.append(ROOT / name)
    return written


if __name__ == "__main__":
    for path in main():
        print(path.relative_to(ROOT))
