"""Ask my agent: Cayleb's guide as a small terminal. Each question is a button; its answer prints under a
`$ <cmd>` echo (site/js/guide/guide.js). Hidden until the script mounts it, so without JavaScript it simply
isn't there; the same answers live in the page's own sections."""
import json

from markup import attr, icon, mk, text


def render(content: dict) -> str:
    g = content["guide"]
    buttons = "".join(
        f'<button type="button" class="guide-q" data-q="{i}" data-cmd="{attr(q["cmd"])}">{text(q["q"])}</button>'
        for i, q in enumerate(g["questions"])
    )
    answers = json.dumps([{k: q[k] for k in ("cmd", "a", "links") if k in q} for q in g["questions"]],
                         ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    return (
        f'<aside class="guide" data-guide hidden aria-label="{attr(g["label"])}">'
        '<div class="guide-panel" id="guide-panel" role="dialog" aria-modal="false" aria-labelledby="guide-title" hidden>'
        f'<div class="guide-top mono"><h2 class="guide-title" id="guide-title">{text(g["title"])}</h2>'
        f'<button type="button" class="guide-close" data-guide-close aria-label="{attr(g["close"])}">{icon("x")}</button></div>'
        f'<div class="guide-log mono" id="guide-log" role="log" aria-live="polite"><p class="d">{text(g["greeting"])}</p></div>'
        f'<div class="guide-qs">{buttons}</div>'
        f'<script type="application/json" data-guide-answers>{answers}</script>'
        "</div>"
        f'<button type="button" class="guide-agent" aria-controls="guide-panel" aria-expanded="false">{mk()}<span>{text(g["label"])}</span></button>'
        "</aside>"
    )
