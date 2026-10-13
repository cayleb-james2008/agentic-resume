"""Give the project pages the homepage's look, keeping each page's own content.

    python3 scripts/build-subpages.py

For every projects/*.html: keep its title, description and everything inside
<main id="main">…</main>; replace the head's styles and scripts, the header
and the footer with the shared masthead and footer (templates/subpage.py).
Links to the retired v8 résumé PDF are pointed at the current one. Running it
again is a no-op on pages it has already converted.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts" / "home"))
from markup import attr, text  # noqa: E402
from templates import subpage  # noqa: E402

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
        '<meta name="theme-color" content="#090a0b">'
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
    '<div class="lab-strip"><span class="lab-strip__edition">Industry AI Suite · recorded journeys / 01</span>'
    '<span class="lab-strip__status"><span class="live-dot" aria-hidden="true"></span>Recorded · read only</span></div>'
)


def convert_lab(page: str, content: dict) -> str:
    """The lab keeps its app and markup; only the head's styles and the top bar change."""
    head_end = page.index("</head>")
    head = re.sub(r'\s*<link rel="stylesheet" href="[^"]*">', "", page[:head_end]).rstrip()
    head = head.replace('<meta name="theme-color" content="#090C10">', '<meta name="theme-color" content="#090a0b">')
    head += "\n  " + subpage.stylesheets("../") + '<link rel="stylesheet" href="lab.css">\n'
    body = page[head_end:]
    top = re.compile(r'<header class="(?:topbar|sub-masthead)">.*?</header>(?:<div class="lab-strip">.*?</span></div>)?', re.S)
    if not top.search(body):
        raise SystemExit("lab/index.html: no top bar to replace")
    body = top.sub(lambda _: subpage.masthead(content, "../") + LAB_STRIP, body, count=1)
    return head + body


def main() -> list[Path]:
    content = json.loads((ROOT / "site/content.json").read_text())
    written = []
    for path in sorted((ROOT / "projects").glob("*.html")):
        path.write_text(convert(path.read_text(), content, path.name))
        written.append(path)
    lab = ROOT / "lab/index.html"
    lab.write_text(convert_lab(lab.read_text(), content))
    written.append(lab)
    return written


if __name__ == "__main__":
    for path in main():
        print(path.relative_to(ROOT))
