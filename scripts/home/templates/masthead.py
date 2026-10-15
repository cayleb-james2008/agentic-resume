"""The masthead over the hero (it scrolls away with it), and the full-screen menu it opens."""
from markup import attr, icon, mk, text


def _target(href: str) -> str:
    """Contact opens the request modal; every other item scrolls to its section."""
    return " data-modal" if href == "#contact" else f' data-go="{attr(href.lstrip("#"))}"'


def render(content: dict) -> str:
    m = content["masthead"]
    items = []
    for n in content["nav"]:
        current = ' aria-current="page"' if n["href"] == "#home" else ""
        items.append(f'<li><a href="{attr(n["href"])}"{_target(n["href"])}{current}>{text(n["label"])}</a></li>')
    items = "".join(items)
    return (
        '<header class="masthead" data-masthead><div class="shell hdr-in">'
        f'<a class="brand" href="#home" data-go="home" aria-label="{attr(m["home"])}">{mk()}{text(content["wordmark"])}</a>'
        f'<nav class="nav" aria-label="Primary"><ul>{items}</ul></nav>'
        '<div class="hdr-r">'
        f'<div class="clock chipbox"><span class="cl-l">{text(m["place"])}</span>'
        f'<span class="cl-t" data-time>{text(m["timeFallback"])}</span><span class="cl-s" aria-hidden="true">•</span>'
        f'<span class="cl-d" data-date>{text(m["dateFallback"])}</span></div>'
        '<button class="menu-btn chipbox" id="menu-btn" type="button" aria-haspopup="dialog" aria-controls="menu" aria-expanded="false">'
        f'{icon("menu")}<span class="lbl" aria-hidden="true">{text(m["menu"])}</span><span class="sr-only">{text(m["menuOpen"])}</span></button>'
        "</div></div></header>"
    )


def menu(content: dict) -> str:
    mn = content["menu"]
    items = []
    for i, (n, route) in enumerate(zip(content["nav"], mn["routes"])):
        inner = f'<span class="mn-i mono">{text(route)}</span><span class="mn-l">{text(n["label"])}</span>'
        if n["href"] == "#contact":
            items.append(f'<li><button type="button" data-modal style="--i:{i}">{inner}</button></li>')
        else:
            items.append(f'<li><a href="{attr(n["href"])}"{_target(n["href"])} style="--i:{i}">{inner}</a></li>')
    return (
        '<div class="menu dark-ctx" id="menu" data-menu role="dialog" aria-modal="true" aria-label="Menu" hidden>'
        f'<div class="shell mn-top"><span class="brandline">{mk()}{text(content["wordmark"])}</span>'
        f'<button class="mn-close" type="button" data-menu-close>{icon("x")}{text(mn["close"])}</button></div>'
        f'<nav class="shell mn-nav" aria-label="{attr(mn["label"])}"><ul>{"".join(items)}</ul></nav>'
        f'<div class="shell mn-bot"><span>{text(mn["place"])} — <span data-time>{text(content["masthead"]["timeFallback"])}</span></span>'
        f'<button type="button" data-modal>{text(mn["start"])}</button></div>'
        "</div>"
    )
