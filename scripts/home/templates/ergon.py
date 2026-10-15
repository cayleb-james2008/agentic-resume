"""Ergon: the copy, the team switch, the support ladder and the price, beside a live team graph
(site/js/home/ergon.js). The graph opens on the Office sample team, already wired, with its log filled in,
so it reads whole without JavaScript; the other teams ride along as JSON for the script."""
import json

from markup import attr, eyebrow, icon, mk, rv, term_line, text


def person(p: dict, f: dict) -> str:
    label = f["personLabel"].format(role=p["role"], apps=f["appsJoin"].join(p["apps"]))
    apps = "".join(f"<span>{text(a)}</span>" for a in p["apps"])
    return (
        f'<li><button class="eg-person" type="button" aria-label="{attr(label)}">'
        f'<span class="av">{icon("person")}<span class="as" aria-hidden="true">&gt;_</span></span>'
        f'<span class="who"><b class="role">{text(p["role"])}</b><span class="st mono">{text(f["assistantOn"])}</span></span>'
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
    radios = "".join(radios)
    ladder = "".join(f"<li>{text(step)}</li>" for step in e["ladder"])
    people = "".join(person(p, f) for p in e["teams"][team]["people"])
    # The two oldest lines fade, as in the running log.
    old = len(f["terminal"]) - 2
    log = "".join(
        f'<p class="old">{term_line(line)}</p>' if i < old else f"<p>{term_line(line)}</p>"
        for i, line in enumerate(f["terminal"])
    )
    return (
        '<section class="ergon" id="team" aria-labelledby="ergon-title"><div class="shell ergon-in">'
        '<div class="eg-copy">'
        f'{eyebrow(e["eyebrow"], "pillish", rv())}'
        f'<h2 class="h2" id="ergon-title" data-lines data-stagger="110">{text(e["headline"])}</h2>'
        f'<p class="eg-p"{rv("", 120)}>{text(e["body"])}</p>'
        f'<div{rv("", 180)}><p class="eg-lbl" id="team-label">{text(e["tryLabel"])}</p>'
        f'<div class="seg" role="radiogroup" aria-labelledby="team-label" data-seg>{radios}</div></div>'
        f'<div{rv("", 240)}><p class="eg-lbl">{text(e["ladderLabel"])}</p><ol class="ladder" data-ladder>{ladder}</ol>'
        f'<p class="eg-note">{text(e["ladderNote"])}</p></div>'
        f'<div class="eg-price"{rv("", 300)}><p><b>{text(e["price"])}</b> {text(e["priceRest"])}</p>'
        f'<span class="status mono">{text(e["status"])}</span></div>'
        "</div>"
        f'<figure class="eg-panel"{rv("panel", 120)} data-ergon aria-labelledby="eg-caption">'
        f'<figcaption class="sr-only" id="eg-caption">{text(f["caption"])}</figcaption>'
        f'<div class="egp-top mono"><span><b>&gt;_</b> {text(f["prompt"])}</span><span class="live"><i></i>{text(f["sample"])}</span></div>'
        '<div class="eg-stage" data-stage><svg class="eg-wires" data-wires aria-hidden="true"></svg>'
        f'<div class="eg-hub" data-hub>{mk()}<div><b>{text(f["hub"])}</b><small>{text(f["hubSub"])}</small></div></div>'
        f'<ul class="eg-people" data-people>{people}</ul></div>'
        f'<div class="eg-ctl"><button class="pill outline sm" type="button" data-ticket>{text(f["button"])}</button><p>{text(f["tap"])}</p></div>'
        f'<div class="eg-log mono" role="log" aria-live="off" aria-label="{attr(f["logLabel"])}">{log}</div>'
        f'<script type="application/json" data-ergon-data>{data(e)}</script>'
        "</figure></div></section>"
    )
