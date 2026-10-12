"""How I work — the reference's season block (§L2794–2838) on our own loop."""
from markup import attr, reveal, text

LINE_STEP = 130
STOP = LINE_STEP + 110
RULE = 2 * LINE_STEP
INTRO = 2 * LINE_STEP + 90
PLATE = 260
TYPE = 430
ROW_STEP = 110

GLOBE = (
    '<svg class="plate-globe" viewBox="0 0 37 23" aria-hidden="true" data-globe>'
    '<ellipse cx="18.5" cy="11.5" rx="18" ry="11"/><line x1="0.5" y1="11.5" x2="36.5" y2="11.5"/>'
    '<ellipse cx="18.5" cy="11.5" rx="18" ry="11" data-meridian/></svg>'
)

PLATE_FRAME = (
    '<svg class="plate-frame" viewBox="0 0 277 78" preserveAspectRatio="none" aria-hidden="true">'
    '<path d="M0.5 0.5H276.5V69L268 77.5H0.5Z"/><line x1="83" y1="0.5" x2="83" y2="77.5"/></svg>'
)


def heading(lines: list[str], title_id: str, cls: str, stop_cls: str) -> str:
    stop = f'<span class="heading-stop {stop_cls}" data-fade data-delay="{STOP}" aria-hidden="true">.</span>'
    spans = "".join(
        f'<span class="heading-line">{reveal(line, "word", stagger=110, delay=i * LINE_STEP)}'
        f'{stop if i == len(lines) - 1 else ""}</span>'
        for i, line in enumerate(lines)
    )
    return f'<h2 class="{cls}" id="{title_id}">{spans}</h2>'


def render(content: dict) -> str:
    a = content["approach"]
    badge = (
        f'<p class="plate-badge-type">'
        f'<span class="plate-white">{reveal(a["badge"][0], "letter", stagger=22, delay=TYPE, config="TYPE")}</span>'
        f'<span class="plate-accent">{reveal(a["badge"][1], "letter", stagger=22, delay=TYPE + 60, config="TYPE")}</span></p>'
    )
    rows = "".join(
        f'<div class="plate-row"><dt>{reveal(r["n"], "letter", stagger=22, delay=TYPE + i * ROW_STEP, config="TYPE")}</dt>'
        f'<dd>{reveal(r["text"], "letter", stagger=22, delay=TYPE + i * ROW_STEP + 70, config="TYPE")}</dd></div>'
        for i, r in enumerate(a["rows"])
    )
    stations = "".join(f"<li>{text(s)}</li>" for s in [*a["stations"], a["finish"]])
    labels = " ".join(
        f'data-station-{i}="{attr(s)}"' for i, s in enumerate(a["stations"])
    )
    return (
        '<section class="approach" data-approach id="approach" aria-labelledby="approach-title">'
        '<div class="approach-stage-frame" aria-hidden="true">'
        f'<div class="approach-stage" data-approach-stage {labels} data-finish="{attr(a["finish"])}">'
        '<div class="approach-map" data-approach-map><canvas class="approach-dots" data-approach-dots></canvas></div>'
        '<canvas class="approach-trace" data-approach-trace></canvas></div></div>'
        '<canvas class="seam" data-seam="light" aria-hidden="true"></canvas>'
        '<div class="approach-copy"><div class="approach-head">'
        f'{heading(a["lines"], "approach-title", "approach-title", "heading-stop--white")}'
        f'<span class="approach-rule" data-grow data-delay="{RULE}" aria-hidden="true"></span>'
        f'<p class="approach-intro">{reveal(a["intro"], "word", stagger=34, delay=INTRO, config="COPY_FAST", gap="0.22em")}</p>'
        f'<ol class="sr-only" aria-label="The loop">{stations}</ol></div>'
        f'<div class="approach-plate" data-rise data-delay="{PLATE}">{PLATE_FRAME}'
        f'<div class="plate-badge">{GLOBE}{badge}</div>'
        f'<dl class="plate-rows">{rows}</dl></div>'
        "</div></section>"
    )
