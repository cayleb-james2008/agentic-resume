"""Work with me, for a team that wants AI: how it goes (a real sequence, so it is numbered), what gets built,
and one way to start, the composer (an email link without the script)."""
from markup import attr, text


def render(content: dict) -> str:
    s = content["services"]
    email = content["meta"]["email"]
    steps = "".join(
        f'<li class="step"><span class="step-n" aria-hidden="true">{i}</span>'
        f'<h3 class="step-h">{text(st["title"])}</h3><p>{text(st["text"])}</p></li>'
        for i, st in enumerate(s["steps"], 1)
    )
    offers = "".join(f'<div><dt>{text(r["title"])}</dt><dd>{text(r["text"])}</dd></div>' for r in s["rows"])
    return (
        '<section class="services" id="services" aria-labelledby="services-title"><div class="shell">'
        f'<div class="sec-head"><h2 class="sec-h" id="services-title">{text(s["headline"])}</h2>'
        f'<p class="sec-lead">{text(s["lead"])}</p></div>'
        f'<ol class="steps" aria-label="{attr(s["stepsLabel"])}">{steps}</ol>'
        '<div class="offers-wrap">'
        f'<h3 class="offers-h">{text(s["offersLabel"])}</h3>'
        f'<dl class="offers">{offers}</dl>'
        f'<div class="offers-foot"><p>{text(s["more"])}</p>'
        # Without the script this is a plain email link; with it, it opens the composer.
        f'<a class="btn btn--primary btn--lg" href="mailto:{attr(email)}" data-modal>{text(content["contact"]["cta"]["label"])}</a></div>'
        "</div></div></section>"
    )
