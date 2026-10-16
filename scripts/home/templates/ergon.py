"""Ergon: what it is, the price and its honest status, the support ladder, and beside them a live team graph
(site/js/home/ergon.js). The graph opens on the Office sample team, already wired, with its log filled in, so it
reads whole without JavaScript; the other teams ride along as JSON for the script."""
import json

from markup import attr, icon, text


def person(p: dict, f: dict) -> str:
    label = f["personLabel"].format(role=p["role"], apps=f["appsJoin"].join(p["apps"]))
    apps = "".join(f"<span>{text(a)}</span>" for a in p["apps"])
    return (
        f'<li><button class="eg-person" type="button" aria-label="{attr(label)}">'
        f'<span class="av">{icon("person")}</span>'
        f'<span class="who"><b class="role">{text(p["role"])}</b><span class="st">{text(f["assistantOn"])}</span></span>'
        f'<span class="apps">{apps}</span><span class="tkb" aria-hidden="true">{text(f["ticket"])}</span></button></li>'
    )


def data(e: dict) -> str:
    """The teams and strings the graph needs, as inert JSON (never `</` inside a script)."""
    payload = {k: e[k] for k in ("teamOrder", "teams", "ladder")} | {"figure": e["figure"]}
    return json.dumps(payload, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")


def render(content: dict) -> str:
    e = content["ergon"]
    f = e["figure"]
    team = e["teamOrder"][0]
    radios = []
    for name in e["teamOrder"]:
        checked = "true" if name == team else "false"
        roving = "" if name == team else ' tabindex="-1"'
        radios.append(f'<button type="button" role="radio" aria-checked="{checked}" data-team="{attr(name)}"{roving}>'
                      f'{text(e["teams"][name]["label"])}</button>')
    ladder = "".join(f"<li>{text(step)}</li>" for step in e["ladder"])
    people = "".join(person(p, f) for p in e["teams"][team]["people"])
    log = "".join(f"<p>{text(line)}</p>" for line in f["log"])
    return (
        '<section class="ergon" id="team" aria-labelledby="ergon-title"><div class="shell ergon-in">'
        '<div class="eg-copy">'
        f'<h2 class="sec-h" id="ergon-title">{text(e["headline"])}</h2>'
        f'<p class="eg-p">{text(e["body"])}</p>'
        f'<div class="eg-price"><p><b>{text(e["price"])}</b> {text(e["priceRest"])}</p>'
        f'<p class="status">{text(e["status"])}</p></div>'
        f'<div class="eg-ladder"><p class="eg-lbl">{text(e["ladderLabel"])}</p><ol class="ladder" data-ladder>{ladder}</ol>'
        f'<p class="eg-note">{text(e["ladderNote"])}</p></div>'
        "</div>"
        '<figure class="eg-panel" data-ergon aria-labelledby="eg-caption">'
        f'<figcaption class="sr-only" id="eg-caption">{text(f["caption"])}</figcaption>'
        f'<div class="eg-bar"><p class="eg-lbl" id="team-label">{text(e["tryLabel"])}</p>'
        f'<div class="seg" role="radiogroup" aria-labelledby="team-label" data-seg>{"".join(radios)}</div>'
        f'<p class="eg-sample">{text(f["sample"])}</p></div>'
        '<div class="eg-stage" data-stage><svg class="eg-wires" data-wires aria-hidden="true"></svg>'
        f'<div class="eg-hub" data-hub><span class="eg-mark" data-hub-mark aria-hidden="true"></span>'
        f'<div><b>{text(f["hub"])}</b><small>{text(f["hubSub"])}</small></div></div>'
        f'<ul class="eg-people" data-people>{people}</ul></div>'
        f'<div class="eg-ctl"><button class="btn btn--ghost" type="button" data-ticket>{text(f["button"])}</button>'
        f'<p>{text(f["tap"])}</p></div>'
        f'<div class="eg-log" role="log" aria-live="off" aria-label="{attr(f["logLabel"])}">{log}</div>'
        f'<script type="application/json" data-ergon-data>{data(e)}</script>'
        "</figure></div></section>"
    )
