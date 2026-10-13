"""Worth it: how the value gets made (2026-10-13).

First, the fit: every build is shaped around the company's situation, the
tools it already uses, how its people work and what it needs. Then full
systems for three kinds of business Cayleb has worked in — a moving
company, a plaster and pool crew, a shop or restaurant. Each row names the
system he builds, what it does end to end, and how the work gets done today;
each card ends with what the business gets, then the money as a receipt: each
cost line (how many a month today → with his systems, times the price of
each), the monthly totals and the yearly saving, all worked out here so the
page's arithmetic can't drift. Sized for a named business; the money comes
from lost jobs, miles, material, claims and waste.
Confident present tense; no real company named as a client. The value never
comes from anyone's hours or pay.
"""
from markup import corners, text
from templates.approach import heading


def usd(n: float) -> str:
    return f"${n:,}" if float(n).is_integer() else f"${n:,.2f}"


def receipt(m: dict) -> tuple[list[dict], int, int]:
    """Each cost line priced out, plus the monthly totals today and with his systems."""
    lines = [{**it, "today": round(it["qty"][0] * it["each"]), "after": round(it["qty"][1] * it["each"])} for it in m["items"]]
    return lines, sum(l["today"] for l in lines), sum(l["after"] for l in lines)


def money(m: dict, labels: dict) -> str:
    lines, today, after = receipt(m)
    to = f'<span aria-hidden="true">→</span><span class="sr-only"> {text(labels["to"])}</span>'
    rows = "".join(
        "<tr>"
        f'<th scope="row"><span class="value-receipt-what">{text(l["what"])}</span>'
        f'<span class="value-receipt-math">{l["qty"][0]:,} {to} {l["qty"][1]:,}, {usd(l["each"])} {text(labels["per"])} {text(l["unit"])}</span></th>'
        f'<td>{usd(l["today"])}</td><td>{usd(l["after"])}</td>'
        "</tr>"
        for l in lines
    )
    return (
        '<div class="value-money">'
        '<table class="value-receipt">'
        f'<caption class="value-money-label">{text(labels["label"])}</caption>'
        f'<thead><tr><th scope="col"><span class="sr-only">{text(labels["item"])}</span></th>'
        f'<th scope="col">{text(labels["today"])}</th><th scope="col">{text(labels["after"])}</th></tr></thead>'
        f"<tbody>{rows}</tbody>"
        f'<tfoot><tr><th scope="row">{text(labels["total"])}</th><td>{usd(today)}</td><td>{usd(after)}</td></tr></tfoot>'
        "</table>"
        f'<p class="value-money-saved">{text(labels["saves"])} {usd((today - after) * 12)} {text(labels["year"])}</p>'
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


def fit(f: dict) -> str:
    """Built around each company: situation, tools, how they work, what they need."""
    points = "".join(
        f'<li class="value-fit-point"><p class="value-fit-name">{text(p["name"])}</p>'
        f'<p class="value-fit-text">{text(p["text"])}</p></li>'
        for p in f["points"]
    )
    return (
        '<div class="value-fit" data-rise data-delay="200">'
        f'<div class="value-fit-head"><h3 class="value-fit-title">{text(f["title"])}</h3>'
        f'<p class="value-fit-lead">{text(f["lead"])}</p></div>'
        f'<ul class="value-fit-points">{points}</ul></div>'
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
        f'{fit(v["fit"])}'
        f'<div class="value-examples">{examples}</div>'
        f'<div class="value-proof" data-rise data-delay="600"><p class="value-proof-title">{text(v["stepsTitle"])}</p>'
        f'<ol class="value-steps">{steps}</ol></div>'
        "</div></section>"
    )
