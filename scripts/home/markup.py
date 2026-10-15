"""Markup helpers shared by the homepage templates (the 2026-10-15 layout).

Every value that reaches the page goes through `text()` or `attr()`. Icons are inline stroke SVGs in one
weight; the `>_` tile is the wordmark's mark. Terminal lines are plain strings in content.json: `term()`
colours a leading `$` or `›` and every `✓`, and nothing else.
"""
import json
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def text(value: str) -> str:
    """Escape a text node (quotes stay literal so copy reads as written)."""
    return escape(value, quote=False)


def attr(value: str) -> str:
    """Escape an attribute value."""
    return escape(value, quote=True)


def link(href: str, label: str, cls: str = "", extra: str = "") -> str:
    """An anchor; PDF links are downloads, external links open normally."""
    download = " download" if href.endswith(".pdf") else ""
    klass = f' class="{cls}"' if cls else ""
    return f'<a{klass} href="{attr(href)}"{download}{extra}>{text(label)}</a>'


def external(href: str) -> str:
    """Attributes for a link that leaves the site."""
    return ' target="_blank" rel="noopener"' if href.startswith(("http://", "https://")) else ""


_STROKE = 'fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"'
ICONS = {
    "arrow": f'<svg class="icon ar" viewBox="0 0 24 24" {_STROKE} stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    "upright": f'<svg class="icon ur" viewBox="0 0 24 24" {_STROKE} stroke-width="2"><path d="M7 17 17 7M8 7h9v9"/></svg>',
    "x": f'<svg class="icon" viewBox="0 0 24 24" {_STROKE} stroke-width="2"><path d="M4 4l16 16M20 4 4 20"/></svg>',
    "menu": f'<svg class="icon" viewBox="0 0 24 24" {_STROKE} stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
    "dot": (f'<svg class="icon" viewBox="0 0 24 24" {_STROKE} stroke-width="1.6"><circle cx="12" cy="12" r="9"/>'
            '<circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none"/></svg>'),
    "pin": (f'<svg class="icon" viewBox="0 0 24 24" {_STROKE} stroke-width="1.6">'
            '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>'),
    "code": f'<svg class="icon" viewBox="0 0 24 24" {_STROKE} stroke-width="1.9"><path d="M8 7l-5 5 5 5M16 7l5 5-5 5"/></svg>',
    "mail": (f'<svg class="icon" viewBox="0 0 24 24" {_STROKE} stroke-width="1.7">'
             '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M4 7.5l8 5.5 8-5.5"/></svg>'),
    "doc": (f'<svg class="icon" viewBox="0 0 24 24" {_STROKE} stroke-width="1.7">'
            '<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 13h6M10 17h6"/></svg>'),
    "copy": (f'<svg class="icon" viewBox="0 0 24 24" {_STROKE} stroke-width="1.8"><rect x="8" y="8" width="12" height="12" rx="2.5"/>'
             '<path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>'),
    "person": f'<svg class="icon" viewBox="0 0 24 24" {_STROKE} stroke-width="1.7"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
    "check": f'<svg class="icon" viewBox="0 0 24 24" {_STROKE} stroke-width="2.2"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
}


def icon(name: str) -> str:
    return ICONS[name]


def mk(cls: str = "") -> str:
    """The `>_` tile."""
    return f'<span class="mk{" " + cls if cls else ""}" aria-hidden="true">&gt;_</span>'


def rv(kind: str = "", delay: int = 0, extra: str = "") -> str:
    """Reveal attributes: `data-rv` (with a kind) and its delay."""
    kind_attr = f' data-rv="{kind}"' if kind else " data-rv"
    style = f"--d:{delay}ms;{extra}" if delay or extra else ""
    return kind_attr + (f' style="{style}"' if style else "")


def eyebrow(label: str, cls: str = "", reveal: str = "") -> str:
    klass = f"eyebrow {cls}".strip()
    return f'<p class="{klass}"{reveal}><i></i>{text(label)}</p>'


def term_line(line: str) -> str:
    """One terminal line: a leading prompt and every tick coloured, the rest as written."""
    body = text(line)
    for prompt in ("$", "›"):
        if line.startswith(prompt):
            body = f'<span class="c">{prompt}</span>{text(line[len(prompt):])}'
            break
    return body.replace("✓", '<span class="g">✓</span>')


def term(lines: list[str]) -> str:
    return "\n".join(term_line(line) for line in lines)


def image_size(src: str) -> tuple[int, int]:
    """An image's pixel size from assets/IMAGES.json, so every <img> reserves its box."""
    record = json.loads((ROOT / "assets/IMAGES.json").read_text())[src]
    return record["width"], record["height"]
