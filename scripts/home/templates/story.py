"""The water story: the name, a caption for each beat, the labels the water carries and a still drawing of
each beat.

The page the scroll runway plays (site/js/story/story.js) and the page without it are the same markup. The
script moves what is here; with scripts off, motion reduced or the failsafe tripped, story.css stacks it as
plain blocks, each caption with its drawing under it, and hides the canvas and the labels.

Every word comes from `content["story"]`. The hooks (`data-story-stage`, `data-caption`, `data-overlay`,
`data-overlay-item` with its `data-index`, …) are the ones story.js selects.
"""
from markup import ICONS, attr, reveal, text

# The apps each person works in, by index: the same cycle as APPS in site/js/story/shapes.js.
APPS = [["mail", "calendar"], ["sheet", "phone", "mail"], ["chat", "calendar"]]


# --- The name and the cue ---------------------------------------------------

def name_block(intro: dict) -> str:
    words = intro["nameWords"]
    name = " ".join([words[0], "".join(words[1:])])   # the name breaks after "Alvarez-"; it reads as one
    return (
        '<div class="story-name" data-story-name>'
        '<h1 class="story-h1" id="story-name">'
        f'{reveal(name, "word", stagger=110, delay=120, config="REVEAL", mode="once", words=words)}</h1>'
        f'<p class="story-title" data-fade data-delay="420">{text(intro["title"])}</p></div>'
    )


def cue(intro: dict) -> str:
    return f'<p class="story-cue" data-story-cue aria-hidden="true" data-fade data-delay="700">{text(intro["cue"])}</p>'


# --- Captions ---------------------------------------------------------------

def caption(beat: dict) -> str:
    return (
        f'<div class="story-caption" data-caption="{attr(beat["id"])}">'
        f'<h2>{text(beat["headline"])}</h2><p>{text(beat["line"])}</p></div>'
    )


# --- Overlay labels: placed on the water's nodes by story.js, matched by data-index ---

def item(index: int | str, inner: str, cls: str = "") -> str:
    classes = f"story-item {cls}".strip()
    return f'<span class="{classes}" data-overlay-item data-index="{index}">{inner}</span>'


def tile(app: str) -> str:
    return f'<span class="story-tile" data-app="{app}">{ICONS[app]}</span>'


def shape_items(beat: dict) -> str:
    return "".join(item(i, text(label)) for i, label in enumerate(beat.get("labels", [])))


def team_items(beat: dict) -> str:
    people = "".join(
        item(
            i,
            f'<span class="story-tiles">{"".join(tile(app) for app in APPS[i % len(APPS)])}</span>'
            f'<span class="story-role">{text(role)}</span>',
            "story-person",
        )
        for i, role in enumerate(beat.get("roles", []))
    )
    # The tag labels the node the channels branch from: story.js places it by `data-index="source"`.
    tag = item("source", text(beat["tag"]), "story-tag") if people and beat.get("tag") else ""
    return people + tag


def tickets_items(beat: dict) -> str:
    gates = "".join(
        item(i, f'<span class="story-label">{text(label)}</span>', "story-gate")
        for i, label in enumerate(beat.get("ladder", []))
    )
    # The tickets come from one person: the first, where the team beat left them. They leave from the screen.
    source = item("source", tile("screen"), "story-source") if gates else ""
    # Most stop at the first gate: a check marks it (an icon, no words; story.js places it by `data-index="check"`).
    check = item("check", f'<span class="story-check">{ICONS["checkmark"]}</span>', "story-mark") if gates else ""
    return source + gates + check


def worth_items(beat: dict) -> str:
    if "price" not in beat:
        return ""
    return item(0, text(beat["price"]), "story-chip") + item(1, text(beat["more"]), "story-chip")


OVERLAYS = {"shape": shape_items, "team": team_items, "tickets": tickets_items, "worth": worth_items}


def overlay(beat: dict) -> str:
    build = OVERLAYS.get(beat["id"])
    inner = build(beat) if build else ""
    if not inner:
        return ""
    return f'<div class="story-overlay" data-overlay="{attr(beat["id"])}" aria-hidden="true">{inner}</div>'


# --- The still drawings: shapes only, coloured in story.css ----------------------

def _team_art() -> str:
    xs = [60 + 96 * i for i in range(6)]
    ys = [round(220 - 18 * (2 * i / 5 - 1) ** 2) for i in range(6)]   # a shallow arc, its ends higher
    channels = "".join(f'<path d="M300 44L{x} {y}"/>' for x, y in zip(xs, ys))
    people = "".join(f'<circle cx="{x}" cy="{y}" r="14"/>' for x, y in zip(xs, ys))
    return f'<g class="art-channel">{channels}</g><circle cx="300" cy="44" r="12"/>{people}'


def _worth_art() -> str:
    columns = "".join(f'<rect x="{70 + 84 * i}" y="90" width="48" height="130" rx="4"/>' for i in range(6))
    return f'{columns}<rect x="210" y="244" width="180" height="32" rx="16"/>'


ART = {
    # a pool with a wavy top, run past the edges so only the top shows its rim
    "hero": '<path d="M-10 170Q45 148 100 170T210 170T320 170T430 170T540 170T650 170V310H-10Z"/>',
    # a moving truck, an office desk and a shop counter, side by side
    "shape": (
        '<g><rect x="20" y="120" width="104" height="70" rx="6"/><path d="M130 146h30l20 24v20h-50z"/>'
        '<circle cx="56" cy="208" r="14"/><circle cx="156" cy="208" r="14"/></g>'
        '<g><rect x="252" y="88" width="96" height="60" rx="6"/><rect x="294" y="152" width="12" height="10"/>'
        '<rect x="220" y="166" width="160" height="12" rx="3"/><rect x="232" y="182" width="12" height="46"/>'
        '<rect x="356" y="182" width="12" height="46"/></g>'
        '<g><rect x="420" y="100" width="160" height="16" rx="3"/><rect x="432" y="120" width="10" height="46"/>'
        '<rect x="558" y="120" width="10" height="46"/><rect x="436" y="170" width="128" height="58" rx="4"/></g>'
    ),
    # a source, and a channel from it to each of six people
    "team": _team_art(),
    # three gates, each a step higher than the last; two tickets on their way to the first, which has a check
    "tickets": (
        '<path class="art-channel" d="M70 236L200 200L340 140L480 80"/>'
        '<circle cx="70" cy="236" r="14"/><circle cx="200" cy="200" r="18"/>'
        '<circle cx="340" cy="140" r="18"/><circle cx="480" cy="80" r="18"/>'
        '<circle cx="113" cy="224" r="6"/><circle cx="156" cy="212" r="6"/>'
        '<path class="art-check" d="M214 228l8 8 16-17"/>'
    ),
    # a column of water for each person, over a price mark
    "worth": _worth_art(),
}


def art(beat_id: str) -> str:
    return f'<svg class="story-art" data-art="{attr(beat_id)}" viewBox="0 0 600 300" aria-hidden="true">{ART[beat_id]}</svg>'


# --- The block --------------------------------------------------------------

def render(content: dict) -> str:
    story = content["story"]
    beats = story["beats"]
    return (
        '<section class="story" data-story id="home" aria-labelledby="story-name">'
        '<div class="story-stage" data-story-stage>'
        '<canvas class="story-canvas" data-water aria-hidden="true"></canvas>'
        f'{name_block(story["intro"])}{cue(story["intro"])}'
        f'<div class="story-captions">{"".join(caption(b) for b in beats)}</div>'
        f'{"".join(overlay(b) for b in beats)}</div>'
        f'{"".join(art(b["id"]) for b in beats)}</section>'
    )
