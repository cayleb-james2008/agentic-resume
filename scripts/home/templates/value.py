"""Worth it: what an employer gets for the money (2026-10-13).

Four places the money comes back (fewer mistakes, faster answers, less outside
spend, people staying), how it gets proven (measure, build, measure), and a
calculator on the visitor's own numbers. Savings never come from anyone's hours
or pay; the calculator has no made-up defaults.
"""
from markup import attr, corners, text
from templates.approach import heading


def render(content: dict) -> str:
    v = content["value"]
    levers = "".join(
        f'<li class="value-lever" data-rise data-delay="{220 + i * 90}">'
        f'<span class="value-lever-n" aria-hidden="true">{i + 1:02d}</span>'
        f'<h3 class="value-lever-title">{text(lever["title"])}</h3>'
        f'<p class="value-lever-line">{text(lever["line"])}</p></li>'
        for i, lever in enumerate(v["levers"])
    )
    steps = "".join(f"<li>{text(step)}</li>" for step in v["steps"])
    c = v["calc"]
    fields = "".join(
        f'<div class="value-field">'
        f'<label for="{attr(f["id"])}">{text(f["label"])}</label>'
        f'<span class="value-input"><input id="{attr(f["id"])}" name="{attr(f["key"])}" type="text" '
        f'inputmode="decimal" autocomplete="off" spellcheck="false">'
        f'<span class="value-unit" aria-hidden="true">{text(f["unit"])}</span></span></div>'
        for f in c["fields"]
    )
    ids = " ".join(f["id"] for f in c["fields"])
    return (
        '<section class="value" data-value id="value" aria-labelledby="value-title">'
        '<div class="value-inner">'
        '<div class="value-pitch">'
        f'{heading(v["lines"], "value-title", "value-title", "heading-stop--white")}'
        f'<p class="value-intro" data-rise data-delay="160">{text(v["intro"])}</p>'
        f'<ul class="value-levers">{levers}</ul>'
        f'<div class="value-proof" data-rise data-delay="600"><p class="value-proof-title">{text(v["stepsTitle"])}</p>'
        f'<ol class="value-steps">{steps}</ol></div>'
        "</div>"
        f'<form class="value-calc" data-value-calc aria-labelledby="value-calc-title" novalidate data-rise data-delay="300">'
        f'{corners()}'
        f'<h3 class="value-calc-title" id="value-calc-title">{text(c["title"])}</h3>'
        f"{fields}"
        f'<p class="value-result"><span class="value-result-label">{text(c["result"])}</span>'
        f'<output class="value-out" for="{ids}" aria-live="polite" data-value-out data-empty="{attr(c["empty"])}">—</output></p>'
        f'<p class="value-result value-result--multiple"><span class="value-result-label">{text(c["multiple"])}</span>'
        f'<output class="value-out value-out--multiple" for="{ids}" aria-live="polite" data-value-multiple>—</output></p>'
        f'<p class="value-note">{text(c["note"])}</p>'
        "</form>"
        "</div></section>"
    )
