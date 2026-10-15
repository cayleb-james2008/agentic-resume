"""The track record: four figures on a black panel. The page carries the final values; with motion
allowed, site/js/home/count.js counts them up as they scroll into place."""
import re

from markup import attr, eyebrow, rv, text


def figure(value: str) -> str:
    prefix, digits, suffix = re.match(r"^(\D*)([\d,]+)(.*)$", value).groups()
    tail = f"<small>{text(suffix)}</small>" if suffix.startswith("/") else text(suffix)
    return f'{text(prefix)}<span data-count="{attr(value)}">{text(digits)}</span>{tail}'


def render(content: dict) -> str:
    s = content["stats"]
    items = "".join(
        f'<li{rv("", i * 90, "--ty:20px")}><p class="st-n">{figure(item["figure"])}</p><p class="st-l">{text(item["label"])}</p></li>'
        for i, item in enumerate(s["items"])
    )
    return (
        '<section class="stats" id="stats" aria-labelledby="stats-title"><div class="shell">'
        f'<div class="st-panel dark-ctx"{rv("panel")}>'
        f'{eyebrow(s["eyebrow"], "light")}'
        f'<h2 class="st-h" id="stats-title" data-lines style="--d:120ms">{text(s["headline"])}</h2>'
        f'<ul class="st-grid">{items}</ul><p class="st-foot">{text(s["note"])}</p>'
        "</div></div></section>"
    )
