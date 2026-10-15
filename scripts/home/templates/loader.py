"""The intro loader: a terminal boot that counts 000 → 100, then slides away (site/js/home/loader.js).

It shows only on a scripted page (`.js:not(.reveal-failsafe)`), and only on a first, plain visit in a tab.
It is aria-hidden: the page underneath is already whole.
"""
from markup import mk, term_line, text

# The count (0–100) at which each boot line appears.
LINE_AT = (0, 28, 60, 94)


def render(content: dict) -> str:
    l = content["loader"]
    lines = "".join(f'<span data-at="{at}">{term_line(line)}</span>' for at, line in zip(LINE_AT, l["terminal"]))
    return (
        '<div class="loader" data-loader aria-hidden="true">'
        f'<div class="ld-center"><div class="ld-brand">{mk()}{text(content["wordmark"])}</div>'
        f'<p class="ld-tag">{text(l["tagline"])}</p></div>'
        '<div class="ld-prog">'
        f'<div class="ld-term mono">{lines}</div>'
        '<div class="ld-track"><i data-ld-fill></i></div>'
        f'<div class="ld-row"><span>{text(l["label"])}</span><span data-ld-num>000</span></div>'
        "</div></div>"
    )
