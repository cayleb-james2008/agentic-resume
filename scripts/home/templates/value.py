"""Worth it: how the value gets made (2026-10-13).

Three kinds of business Cayleb has worked in — a moving company, a plaster and
pool crew, a shop or restaurant. Each shows the busywork today, what his tools
do instead, and what the business gets. The value never comes from anyone's
hours or pay, and the examples carry no figures they can't back.
"""
from markup import corners, text
from templates.approach import heading


def example(e: dict, i: int, now: str, then: str) -> str:
    rows = "".join(
        f'<li class="value-row"><span class="value-now">{text(r["now"])}</span>'
        f'<span class="value-arrow" aria-hidden="true">→</span>'
        f'<span class="value-then">{text(r["then"])}</span></li>'
        for r in e["rows"]
    )
    return (
        f'<article class="value-example" data-rise data-delay="{220 + i * 120}">{corners()}'
        f'<h3 class="value-kind">{text(e["kind"])}</h3>'
        f'<p class="value-heads" aria-hidden="true"><span>{text(now)}</span><span>{text(then)}</span></p>'
        f'<ul class="value-rows" aria-label="{text(now)}, then {text(then).lower()}">{rows}</ul>'
        f'<p class="value-gain">{text(e["value"])}</p></article>'
    )


def render(content: dict) -> str:
    v = content["value"]
    examples = "".join(example(e, i, v["now"], v["then"]) for i, e in enumerate(v["examples"]))
    steps = "".join(f"<li>{text(step)}</li>" for step in v["steps"])
    return (
        '<section class="value" data-value id="value" aria-labelledby="value-title">'
        '<div class="value-inner">'
        '<div class="value-head">'
        f'{heading(v["lines"], "value-title", "value-title", "heading-stop--white")}'
        f'<p class="value-intro" data-rise data-delay="160">{text(v["intro"])}</p>'
        f'<p class="value-proof-line" data-rise data-delay="240">{text(v["proof"])}</p>'
        "</div>"
        f'<div class="value-examples">{examples}</div>'
        f'<div class="value-proof" data-rise data-delay="600"><p class="value-proof-title">{text(v["stepsTitle"])}</p>'
        f'<ol class="value-steps">{steps}</ol></div>'
        "</div></section>"
    )
