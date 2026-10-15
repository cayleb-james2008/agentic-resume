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


def px(value: float) -> str:
    """One design pixel of the 1440 frame, as a share of the block's width."""
    return f"{value / 1440 * 100:.4f}cqw"


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

CORNER = ('<svg class="corner corner--{pos}" viewBox="0 0 10.5 10.5" aria-hidden="true">'
          '<path d="M0 0.5H10V10.5" fill="none" stroke="currentColor"/></svg>')


def corners() -> str:
    return "".join(CORNER.format(pos=p) for p in ("tl", "tr", "br", "bl"))


ARROW = ('<svg class="cta-arrow" viewBox="0 0 13.7071 10.7071" aria-hidden="true">'
         '<path d="M0 5.35355H13M8 10.3536L13 5.35355L8 0.353553" fill="none" '
         'stroke="currentColor"/></svg>')

HERO_CTA_FRAME = (
    '<svg class="cta-frame" viewBox="0 0 220 50" preserveAspectRatio="none" aria-hidden="true">'
    '<path class="cta-body" d="M220 42L212.932 50H0V0H220V42Z"/>'
    '<path class="cta-flood" d="M220 42L212.932 50H0V0H220V42Z"/>'
    '<path class="cta-ring" d="M220 42L212.932 50H0V0H220V42Z"/>'
    '<path class="cta-brackets" d="M205 49.5H213L219.5 42V36M212 0.5H219.5V7M8 0.5H0.5V7M7.5 49.5H0.5V42.5"/>'
    "</svg>"
)


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

PLATE_OUTLINE = (
    "M13.6168 0.497469H697.378C700.858 0.497469 704.195 1.38786 706.655 2.97277C709.115 "
    "4.55769 710.498 6.70729 710.498 8.94869V411.208C710.498 413.449 709.115 415.599 706.655 "
    "417.183C704.195 418.768 700.858 419.659 697.378 419.659H460.249C454.073 419.659 447.976 "
    "420.555 442.411 422.281C436.847 424.008 431.958 426.519 428.107 429.63L399.246 "
    "452.95C395.559 455.928 390.878 458.333 385.55 459.986C380.223 461.639 374.385 462.497 "
    "368.472 462.497H13.6168C10.1373 462.497 6.80038 461.607 4.34003 460.022C1.87968 458.437 "
    "0.497469 456.288 0.497469 454.046V8.94869C0.497469 6.70729 1.87968 4.55769 4.34003 "
    "2.97277C6.80038 1.38786 10.1373 0.497469 13.6168 0.497469Z"
)

PLATE_CLIP = (
    "M 0.01915,0.00107H 0.98085C 0.98574,0.00107 0.99044,0.00300 0.99390,0.00642C "
    "0.99736,0.00984 0.99930,0.01449 0.99930,0.01933V 0.88815C 0.99930,0.89299 0.99736,0.89763 "
    "0.99390,0.90105C 0.99044,0.90448 0.98574,0.90640 0.98085,0.90640H 0.64733C 0.63864,0.90640 "
    "0.63007,0.90834 0.62224,0.91206C 0.61442,0.91579 0.60754,0.92122 0.60212,0.92794L "
    "0.56153,0.97830C 0.55635,0.98474 0.54976,0.98993 0.54227,0.99350C 0.53478,0.99707 "
    "0.52656,0.99892 0.51825,0.99892H 0.01915C 0.01426,0.99892 0.00956,0.99700 0.00610,0.99358C "
    "0.00264,0.99016 0.00070,0.98551 0.00070,0.98067V 0.01933C 0.00070,0.01449 0.00264,0.00984 "
    "0.00610,0.00642C 0.00956,0.00300 0.01426,0.00107 0.01915,0.00107Z"
)

# --- Icons drawn for this site (not from the reference) --------------------

ICONS = {
    "pin": ('<svg class="icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 15s5-4.6 5-8.5A5 5 0 0 0 3 6.5C3 10.4 8 15 8 15Z" '
            'fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="6.5" r="1.8" fill="currentColor"/></svg>'),
    "spark": ('<svg class="icon" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5 9.6 6.4 14.5 8 9.6 9.6 8 14.5 6.4 9.6 1.5 8 6.4 6.4Z" '
              'fill="currentColor"/></svg>'),
    "play": ('<svg class="icon icon--play" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="15.5" fill="none" '
             'stroke="currentColor"/><path d="M13 10.5v11l9-5.5Z" fill="currentColor"/></svg>'),
    "graph": ('<svg class="panel-graph" viewBox="0 0 78 50" aria-hidden="true"><g fill="none" stroke="currentColor">'
              '<path d="M8 40 26 12 50 30 70 8M26 12 70 8"/></g><g fill="currentColor"><circle cx="8" cy="40" r="4"/>'
              '<circle cx="26" cy="12" r="4"/><circle cx="50" cy="30" r="4"/><circle cx="70" cy="8" r="4"/></g></svg>'),
    "check": ('<svg class="icon icon--stat" viewBox="0 0 31 31" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.5">'
              '<rect x="1" y="1" width="29" height="29" rx="3"/><path d="m8 16 5 5 10-11"/></g></svg>'),
    "bars": ('<svg class="icon icon--stat" viewBox="0 0 31 31" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.5">'
             '<path d="M4 29V18M12 29V11M20 29V15M28 29V3"/></g></svg>'),
    "quote": ('<svg class="icon icon--stat" viewBox="0 0 31 31" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.5">'
              '<path d="M3 5h25v17H14l-7 6v-6H3Z"/><path d="M9 11h13M9 16h9"/></g></svg>'),
    "gauge": ('<svg class="icon icon--stat" viewBox="0 0 31 31" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.5">'
              '<path d="M3 24a12.5 12.5 0 1 1 25 0"/><path d="m15.5 24 6-9"/></g><circle cx="15.5" cy="24" r="2" fill="currentColor"/></svg>'),
}


def _stroked(shapes: str) -> str:
    """A 16×16 stroked glyph, drawn like the others above."""
    return (f'<svg class="icon" viewBox="0 0 16 16" aria-hidden="true"><g fill="none" stroke="currentColor" '
            f'stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">{shapes}</g></svg>')


# The apps a team member works in (the water story's overlay tiles) and the tick.
ICONS.update({
    "mail": _stroked('<rect x="1.5" y="3.5" width="13" height="9" rx="1.5"/><path d="m2 4.5 6 4.5 6-4.5"/>'),
    "calendar": _stroked('<rect x="2" y="3" width="12" height="11" rx="1.5"/><path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3"/>'),
    "sheet": _stroked('<rect x="2" y="2" width="12" height="12" rx="1.5"/><path d="M2 6h12M2 10h12M6.5 6v8"/>'),
    "phone": _stroked('<rect x="4.5" y="1.5" width="7" height="13" rx="1.5"/><path d="M7 12.5h2"/>'),
    "chat": _stroked('<path d="M2 3h12v8H8l-3.5 3v-3H2Z"/>'),
    "screen": _stroked('<rect x="1.5" y="2.5" width="13" height="8.5" rx="1"/><path d="M5.5 14h5M8 11v3"/>'),
    "checkmark": _stroked('<path d="m3 8.5 3.2 3.2L13 4.5"/>'),
})
