"""Built and tested: Ergon featured on top, with its checklist and its honest status; then an index of the other
four. Each row is the project's name (linking its case study), a line on what it is, its test count, its tags and,
where the code is public, a link to it. Each carries one real screenshot, or for Asmodeus, which is private, its
checklist.

On a wide screen with the script, site/js/home/work.js turns the index into a list beside one preview frame that
follows the row you point at or tab to; everywhere else each row shows its own picture."""
from markup import attr, external, icon, image_size, link, text


def checks(items: list[str], cls: str = "checks") -> str:
    rows = "".join(f"<li>{icon('check')}<span>{text(c)}</span></li>" for c in items)
    return f'<ul class="{cls}">{rows}</ul>'


def tags(c: dict) -> str:
    return f'<ul class="tags">{"".join(f"<li>{text(t)}</li>" for t in c["tags"])}</ul>'


def code_link(c: dict, label: str) -> str:
    if not c.get("code"):
        return ""
    return (f'<a class="row-code" href="{attr(c["code"])}"{external(c["code"])}>'
            f'<span>{text(label)}</span>{icon("upright")}</a>')


def feature(c: dict, b: dict, status: str) -> str:
    chip = f'<p class="status">{text(status)}</p>' if c.get("status") else ""
    return (
        f'<article class="feature" id="work-{attr(c["slug"])}">'
        '<div class="feature-text">'
        f'<p class="feature-cat">{text(c["category"])}</p>'
        f'<h3 class="feature-h"><a href="{attr(c["href"])}">{text(c["title"])}</a></h3>'
        f'<p class="feature-p">{text(c["text"])}</p>{chip}'
        f'<p class="feature-foot"><span class="count">{text(c["count"])}</span>'
        f'{link(c["href"], b["caseLabel"], "btn btn--ghost")}</p>'
        "</div>"
        f'{checks(c.get("checks", []), "checks checks--feature")}'
        "</article>"
    )


def row(c: dict, b: dict) -> str:
    if c.get("image"):
        width, height = image_size(c["image"]["src"])
        visual = (f'<figure class="row-shot"><img src="{attr(c["image"]["src"])}" alt="{attr(c["image"]["alt"])}" '
                  f'width="{width}" height="{height}" loading="lazy" decoding="async"></figure>')
    else:
        visual = f'<div class="row-shot row-shot--checks">{checks(c.get("checks", []))}</div>'
    return (
        f'<li class="row" data-row><article class="row-in" id="work-{attr(c["slug"])}">'
        '<div class="row-text">'
        f'<h3 class="row-h"><a class="row-link" href="{attr(c["href"])}">{text(c["title"])}</a></h3>'
        f'<p class="row-cat">{text(c["category"])}</p>'
        f'<p class="row-p">{text(c["text"])}</p>'
        f'<div class="row-meta"><span class="count">{text(c["count"])}</span>{tags(c)}</div>'
        f'{code_link(c, b["codeLabel"])}'
        f"</div>{visual}</article></li>"
    )


def render(content: dict) -> str:
    b = content["built"]
    status = content["ergon"]["status"]
    first, rest = b["cards"][0], b["cards"][1:]
    rows = "".join(row(c, b) for c in rest)
    return (
        '<section class="built" id="built" aria-labelledby="built-title"><div class="shell">'
        f'<div class="sec-head"><h2 class="sec-h" id="built-title">{text(b["headline"])}</h2>'
        f'<p class="sec-lead">{text(b["lead"])}</p></div>'
        f"{feature(first, b, status)}"
        f'<div class="index" data-index><ul class="index-rows">{rows}</ul></div>'
        "</div></section>"
    )
