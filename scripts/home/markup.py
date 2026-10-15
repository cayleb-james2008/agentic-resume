"""Markup helpers shared by the homepage templates.

Text that animates is split here, at build time, into an assistive copy plus
`aria-hidden` unit spans, so the page reads in full with JavaScript off and the
script only has to move spans that already exist.
"""
from html import escape


def text(value: str) -> str:
    """Escape a text node (quotes stay literal so copy reads as written)."""
    return escape(value, quote=False)


def attr(value: str) -> str:
    """Escape an attribute value."""
    return escape(value, quote=True)


def split_units(value: str, unit: str) -> list[list[str]]:
    """Words, each a list of units — mirrors splitUnits() in reveal.js."""
    words = value.split()
    return [[w] for w in words] if unit == "word" else [list(w) for w in words]


def reveal(value: str, unit: str = "word", *, stagger: int = 110, delay: int = 0,
           config: str = "REVEAL", mode: str = "forward", gap: str | None = None,
           words: list[str] | None = None, cls: str = "") -> str:
    """A text run that the reveal engine animates unit by unit.

    `words` overrides where the run breaks (the name breaks after "Alvarez-",
    which whitespace splitting cannot express); the assistive copy is always
    `value` as written.
    """
    groups = [[w] for w in words] if words and unit == "word" else (
        [list(w) for w in words] if words else split_units(value, unit))
    inner = "".join(
        '<span class="reveal-word">'
        + "".join(f'<span class="reveal-unit">{text(u)}</span>' for u in group)
        + "</span>"
        for group in groups
    )
    style = f' style="--gap:{gap}"' if gap else ""
    classes = f"reveal {cls}".strip()
    return (
        f'<span class="{classes}" data-reveal="{unit}" data-stagger="{stagger}" '
        f'data-delay="{delay}" data-config="{config}" data-mode="{mode}"{style}>'
        f'<span class="sr-only">{text(value)}</span>'
        f'<span class="reveal-units" aria-hidden="true">{inner}</span></span>'
    )


LINE_STEP = 130
STOP = LINE_STEP + 110


def heading(lines: list[str], title_id: str, cls: str, stop_cls: str) -> str:
    stop = f'<span class="heading-stop {stop_cls}" data-fade data-delay="{STOP}" aria-hidden="true">.</span>'
    spans = "".join(
        f'<span class="heading-line">{reveal(line, "word", stagger=110, delay=i * LINE_STEP)}'
        f'{stop if i == len(lines) - 1 else ""}</span>'
        for i, line in enumerate(lines)
    )
    return f'<h2 class="{cls}" id="{title_id}">{spans}</h2>'


def link(href: str, label: str, cls: str = "", extra: str = "") -> str:
    """An anchor; PDF links are downloads, external links open normally."""
    download = " download" if href.endswith(".pdf") else ""
    klass = f' class="{cls}"' if cls else ""
    return f'<a{klass} href="{attr(href)}"{download}{extra}>{text(label)}</a>'


# --- The spec's own frames (paths verbatim) -------------------------------

def chamfer_frame(width: float, height: float, cut: float, cls: str) -> str:
    """A slab or hollow button frame chamfered bottom-right, as the spec draws it."""
    d = (f"M0.5 0.5H{width - 0.5:g}V{height - cut:g}L{width - cut:g} "
         f"{height - 0.5:g}H0.5Z")
    return (f'<svg class="cta-frame {cls}" viewBox="0 0 {width:g} {height:g}" '
            f'preserveAspectRatio="none" aria-hidden="true">'
            f'<path class="cta-body" d="{d}"/><path class="cta-flood" d="{d}"/>'
            f'<path class="cta-line" d="{d}"/></svg>')


SLAB_ARROW = ('<svg class="cta-arrow" viewBox="0 0 13.71 10.71" aria-hidden="true">'
              '<path d="M0 5.35H13M8 10.35L13 5.35L8 0.35" fill="none" stroke="currentColor"/></svg>')

# --- Icons drawn for this site (not from the reference) --------------------

def _stroked(shapes: str) -> str:
    """A 16×16 glyph stroked in the text colour."""
    return (f'<svg class="icon" viewBox="0 0 16 16" aria-hidden="true"><g fill="none" stroke="currentColor" '
            f'stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">{shapes}</g></svg>')


# The apps a team member works in (the water story's overlay tiles) and the tick.
ICONS = {
    "mail": _stroked('<rect x="1.5" y="3.5" width="13" height="9" rx="1.5"/><path d="m2 4.5 6 4.5 6-4.5"/>'),
    "calendar": _stroked('<rect x="2" y="3" width="12" height="11" rx="1.5"/><path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3"/>'),
    "sheet": _stroked('<rect x="2" y="2" width="12" height="12" rx="1.5"/><path d="M2 6h12M2 10h12M6.5 6v8"/>'),
    "phone": _stroked('<rect x="4.5" y="1.5" width="7" height="13" rx="1.5"/><path d="M7 12.5h2"/>'),
    "chat": _stroked('<path d="M2 3h12v8H8l-3.5 3v-3H2Z"/>'),
    "screen": _stroked('<rect x="1.5" y="2.5" width="13" height="8.5" rx="1"/><path d="M5.5 14h5M8 11v3"/>'),
    "checkmark": _stroked('<path d="m3 8.5 3.2 3.2L13 4.5"/>'),
}
