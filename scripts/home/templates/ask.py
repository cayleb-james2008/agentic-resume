"""The Ask bar in the hero: ask about Cayleb, get the answer he wrote (site/js/ask/ask.js matches the question
in the browser; nothing is sent anywhere).

Without the script the field would do nothing, so it is rendered `hidden`, and the panel shows every question
and its answer as an open list instead. With the script the list stays, folded, under the field: a way to
browse for anyone who would rather not type."""
import json

from markup import attr, icon, link, text


def _anchor(item: dict) -> str:
    href = item["href"]
    extra = ' target="_blank" rel="noopener"' if href.startswith(("http://", "https://")) else ""
    return link(href, item["label"], extra=extra)


def _entry(q: dict, g: dict) -> str:
    sources = ""
    if q.get("sources"):
        sources = (f'<p class="ask-sources"><span>{text(g["sourcesLabel"])}</span>'
                   f'{"".join(_anchor(s) for s in q["sources"])}</p>')
    links = ""
    if q.get("links"):
        links = f'<p class="ask-links">{"".join(_anchor(l) for l in q["links"])}</p>'
    return (f'<li><details class="ask-item"><summary>{text(q["q"])}</summary>'
            f'<div class="ask-item-b"><p>{text(q["a"])}</p>{sources}{links}</div></details></li>')


def data(g: dict) -> str:
    """Everything the script needs, as inert JSON (never `</` inside a script)."""
    keys = ("sourcesLabel", "fallback", "fallbackContact")
    payload = {k: g[k] for k in keys} | {"questions": g["questions"]}
    return json.dumps(payload, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")


def render(content: dict) -> str:
    g = content["guide"]
    chips = "".join(
        f'<li><button type="button" class="ask-chip" data-q="{i}">{text(q["q"])}</button></li>'
        for i, q in enumerate(g["questions"]) if q.get("chip")
    )
    entries = "".join(_entry(q, g) for q in g["questions"])
    return (
        '<div class="ask" id="ask" data-ask data-in style="--i:3">'
        f'<div class="ask-top"><p class="ask-title">{text(g["fieldLabel"])}</p>'
        f'<p class="ask-greet" id="ask-greet">{text(g["greeting"])}</p></div>'
        f'<form class="ask-form" role="search" aria-label="{attr(g["fieldLabel"])}" data-ask-form hidden>'
        f'<label class="sr-only" for="ask-q">{text(g["fieldLabel"])}</label>'
        f'<input class="ask-input" id="ask-q" name="q" type="text" autocomplete="off" enterkeyhint="send" '
        f'placeholder="{attr(g["placeholder"])}" aria-describedby="ask-greet" aria-keyshortcuts="/">'
        '<kbd class="ask-kbd" aria-hidden="true">/</kbd>'
        f'<button class="ask-submit btn btn--primary" type="submit">{text(g["submit"])}</button></form>'
        f'<div class="ask-chips" data-ask-chips hidden><p class="ask-chips-l" id="ask-chips-l">{text(g["chipsLabel"])}</p>'
        f'<ul aria-labelledby="ask-chips-l">{chips}</ul></div>'
        '<div class="ask-answer" data-ask-answer hidden>'
        '<p class="ask-matched" data-ask-matched></p><p class="ask-body" data-ask-body></p>'
        '<div class="ask-after" data-ask-after></div></div>'
        '<p class="sr-only" aria-live="polite" data-ask-said></p>'
        f'<details class="ask-all" open><summary>{text(g["browse"])}</summary><ul class="ask-list">{entries}</ul></details>'
        f'<script type="application/json" data-ask-data>{data(g)}</script>'
        "</div>"
    )
