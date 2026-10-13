"""Worth it: how the value gets made (2026-10-13).

Full systems for three kinds of business Cayleb has worked in — a moving
company, a plaster and pool crew, a shop or restaurant. Each row names the
system he builds, what it does end to end, and how the work gets done today;
each card ends with what the business gets, then the money: what the busywork
loses a month today, what it loses with his systems, and the yearly saving
(worked out here, so the page's arithmetic can't drift), sized for a named
business and sourced from lost jobs, miles, material, claims and waste.
Confident present tense; no real company named as a client. The value never
comes from anyone's hours or pay.
"""
from markup import corners, text
from templates.approach import heading


def usd(n: int) -> str:
    return f"${n:,}"


def money(m: dict, labels: dict) -> str:
    yearly = (m["today"] - m["after"]) * 12
    return (
        '<div class="value-money">'
        f'<p class="value-money-label">{text(labels["label"])}</p>'
        '<p class="value-money-row">'
        f'<span class="value-money-before"><span class="value-money-tag">{text(labels["today"])}</span> {usd(m["today"])}</span>'
        '<span class="value-money-arrow" aria-hidden="true">→</span>'
        f'<span class="value-money-after"><span class="value-money-tag">{text(labels["after"])}</span> {usd(m["after"])}</span>'
        "</p>"
        f'<p class="value-money-saved">{text(labels["saves"])} {usd(yearly)} {text(labels["year"])}</p>'
        f'<p class="value-money-basis">{text(m["basis"])}</p>'
        "</div>"
    )


def example(e: dict, i: int, label: str, today: str, labels: dict) -> str:
    rows = "".join(
        f'<li class="value-row">'
        f'<p class="value-system">{text(r["system"])}</p>'
        f'<p class="value-then">{text(r["then"])}</p>'
        f'<p class="value-now"><span class="value-now-label">{text(today)}:</span> {text(r["now"])}</p></li>'
        for r in e["rows"]
    )
    return (
        f'<article class="value-example" data-rise data-delay="{220 + i * 120}">{corners()}'
        f'<p class="value-label">{text(label)}</p>'
        f'<h3 class="value-kind">{text(e["kind"])}</h3>'
        f'<ul class="value-rows">{rows}</ul>'
        f'<p class="value-gain">{text(e["value"])}</p>'
        f'{money(e["money"], labels)}</article>'
    )


def render(content: dict) -> str:
    v = content["value"]
    examples = "".join(example(e, i, v["cardLabel"], v["todayLabel"], v["money"]) for i, e in enumerate(v["examples"]))
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
        f'<p class="value-wired" data-rise data-delay="520">{text(v["wired"])}</p>'
        f'<div class="value-proof" data-rise data-delay="600"><p class="value-proof-title">{text(v["stepsTitle"])}</p>'
        f'<ol class="value-steps">{steps}</ol></div>'
        "</div></section>"
    )
