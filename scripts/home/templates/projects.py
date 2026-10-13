"""Selected projects — the reference's paddock block (§L4717–4894) with Cayleb's projects."""
from markup import ICONS, SLAB_ARROW, attr, chamfer_frame, corners, px, reveal, text
from templates.approach import heading

INTRO = 2 * 130 + 90
BUTTON = 2 * 130 + 260
MEET_FRAME, MEET_TEXT = 320, 410
STATS = 460
ROW_STEP = 90
CARD, CARD_STEP = 560, 90
FIGURE_SIZE = (1186, 1024)

# The strip, in the frame's own pixels from the top of the dark band (spec CALENDAR).
CARDS = [(347, 100), (511, 100), (675, 100), (839, 114), (1017, 76)]
LINKS = [(416, 126), (580, 128), (743, 136), (914, 124)]
# Wider and lower than the spec's 669–781 × 32–113: its live round read "12 jul"; this one reads
# "Merged PR #1", and the spec's corners sat on those letters.
LIVE = {"left": 655, "right": 795, "top": 32, "bottom": 120}


def spread(x: float) -> str:
    """An x of the frame, spread about the block's middle by --cal-spread."""
    return f"calc(50% + {px(x - 720)} * var(--cal-spread, 1))"


def stat_rows(stats: list[dict]) -> str:
    out = []
    for i, s in enumerate(stats):
        start = STATS + i * ROW_STEP
        if i:
            out.append(f'<li class="stats-rule" data-grow data-delay="{start}" aria-hidden="true"></li>')
        out.append(
            f'<li class="stats-row" data-rise data-delay="{start + 40}">{ICONS[s["icon"]]}'
            f'<span class="stats-text"><span class="stats-label">{text(s["label"])}</span>'
            f'<span class="stats-figure">{reveal(s["value"], "letter", stagger=24, delay=start + 120, config="FIGURE")}</span>'
            "</span></li>"
        )
    return "".join(out)


def card(index: int, c: dict) -> str:
    live = c["marker"] == "live"
    name = text(c["name"])
    if c.get("href"):
        name = f'<a href="{attr(c["href"])}">{name}</a>'
    status = text(c["status"])
    if c.get("repo"):
        status = f'<a href="{attr(c["repo"])}">{status}</a>'
    delay = CARD + index * CARD_STEP
    x, w = CARDS[index]
    place = (f'left:calc({spread(x + w / 2)} - {px(w / 2)});'
             f'--card-w:{px(w)}')
    return (
        f'<li class="strip-card{" strip-card--live" if live else ""}" data-card data-index="{index}" style="{place}" '
        f'data-rise data-from="translateY(0.5rem)" data-delay="{delay}" data-gate="strip">'
        f'<span class="strip-kicker">{text(c["kicker"])}</span>'
        f'<span class="strip-name" data-rise data-from="translateY(0.3em)" data-config="NAME" '
        f'data-delay="{delay + 110}" data-gate="strip">{name}</span>'
        f'<span class="strip-status">{status}</span></li>'
    )


def marker(index: int, c: dict) -> str:
    delay = CARD + index * CARD_STEP + 60
    kind = c["marker"]
    if kind == "pr":
        body = '<span class="marker-text">PR</span>'
    elif kind == "live":
        body = ('<svg viewBox="0 0 11 11" class="marker-dot"><circle class="marker-pulse" data-pulse cx="5.5" cy="5.5" r="5.5" opacity="0.5"/>'
                '<circle cx="5.5" cy="5.5" r="5.5"/></svg>')
    else:
        body = '<svg viewBox="0 0 11 11" class="marker-ring"><circle cx="5.5" cy="5.5" r="5"/></svg>'
    x, w = CARDS[index]
    return (f'<span class="strip-marker strip-marker--{kind}" data-marker data-index="{index}" style="left:{spread(x + w / 2)}" '
            f'data-fade data-delay="{delay}" data-gate="strip" aria-hidden="true">{body}</span>')


def render(content: dict) -> str:
    p = content["projects"]
    feature = p["feature"]
    meet_lines = "".join(f"<li>{text(line)}</li>" for line in feature["lines"])
    cards = "".join(card(i, c) for i, c in enumerate(p["cards"]))
    markers = "".join(marker(i, c) for i, c in enumerate(p["cards"]))
    links = "".join(
        f'<span class="strip-link" data-link data-index="{i}" data-grow data-delay="{CARD + i * CARD_STEP}" '
        f'data-gate="strip" aria-hidden="true" style="left:{spread(x)};width:calc({px(w)} * var(--cal-spread, 1))"></span>'
        for i, (x, w) in enumerate(LINKS)
    )
    figure = p["figure"]
    return (
        '<section class="projects" data-projects id="work" aria-labelledby="projects-title">'
        '<canvas class="contours" data-contours="--paddock-contour" aria-hidden="true"></canvas>'
        '<div class="projects-band" aria-hidden="true"></div>'
        '<div class="projects-figure-layer" data-figure-layer>'
        f'<img class="projects-figure" src="{attr(figure["image"])}" alt="{attr(figure["alt"])}" '
        f'width="{FIGURE_SIZE[0]}" height="{FIGURE_SIZE[1]}" loading="lazy" decoding="async"></div>'
        '<div class="projects-melt" aria-hidden="true"></div>'
        '<canvas class="seam" data-seam="dark" aria-hidden="true"></canvas>'
        f'{heading(p["lines"], "projects-title", "projects-title", "heading-stop--accent")}'
        '<div class="projects-intro" id="suite">'
        f'<p class="projects-report">{reveal(p["report"], "word", stagger=30, delay=INTRO, config="COPY_FAST", gap="0.22em")}</p>'
        f'<a class="cta cta--slab" href="{attr(p["cta"]["href"])}" data-rise data-delay="{BUTTON}">'
        f'{chamfer_frame(217, 50, 8, "cta-frame--slab")}<span class="cta-label">{text(p["cta"]["label"])}</span>{SLAB_ARROW}</a>'
        "</div>"
        '<div class="projects-panels">'
        f'<div class="panel-frame panel-frame--meet" data-fade data-delay="{MEET_FRAME}" aria-hidden="true">{corners()}</div>'
        f'<div class="projects-meet" data-rise data-delay="{MEET_TEXT}"><p class="meet-name">{text(feature["name"])}</p>'
        f"<ul>{meet_lines}</ul></div>"
        f'<div class="panel-frame panel-frame--stats" data-fade data-delay="{STATS}" aria-hidden="true">{corners()}</div>'
        f'<ul class="projects-stats">{stat_rows(p["stats"])}</ul>'
        "</div>"
        '<div class="projects-strip" data-strip>'
        f'<div class="strip-links" aria-hidden="true">{links}</div>'
        f'<ol class="strip-cards">{cards}</ol>{markers}'
        f'<div class="strip-bracket" data-strip-bracket data-fade data-delay="{CARD + 5 * CARD_STEP}" '
        f'style="left:{spread(LIVE["left"])};width:calc({px(LIVE["right"] - LIVE["left"])} * var(--cal-spread, 1));'
        f'top:calc({px(LIVE["top"])} + var(--bracket-drop, 0px));height:{px(LIVE["bottom"] - LIVE["top"])}" '
        f'data-gate="strip" aria-hidden="true">{corners()}</div>'
        "</div></section>"
    )
