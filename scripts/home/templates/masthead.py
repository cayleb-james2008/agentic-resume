"""The masthead: the wordmark, the sections, and Ask, which takes you to the hero's Ask bar and focuses it.
It stays at the top as you read. On phones the sections fold into a menu sheet (the script shows the Menu
button; without the script the sections stay in a row you can scroll sideways)."""
from markup import attr, icon, text, wordmark


def _item(n: dict) -> str:
    href = n["href"]
    return f'<li><a href="{attr(href)}" data-go="{attr(href.lstrip("#"))}">{text(n["label"])}</a></li>'


def render(content: dict) -> str:
    m = content["masthead"]
    items = "".join(_item(n) for n in content["nav"])
    return (
        '<header class="masthead" data-masthead><div class="shell mh-in">'
        f'<a class="brand wordmark" href="#home" data-go="home" aria-label="{attr(m["home"])}">{wordmark(content["wordmark"])}</a>'
        f'<nav class="nav" aria-label="Primary"><ul>{items}</ul></nav>'
        '<div class="mh-r">'
        f'<a class="nav-ask" href="#ask" data-go="ask" aria-label="{attr(m["askLabel"])}">{icon("search")}'
        f'<span>{text(m["ask"])}</span><kbd aria-hidden="true">/</kbd></a>'
        '<button class="menu-btn" id="menu-btn" type="button" aria-haspopup="dialog" aria-controls="menu" aria-expanded="false">'
        f'{icon("menu")}<span class="sr-only">{text(m["menuOpen"])}</span></button>'
        "</div></div></header>"
    )


def menu(content: dict) -> str:
    mn = content["menu"]
    m = content["masthead"]
    items = "".join(_item(n) for n in content["nav"])
    return (
        f'<div class="menu-sheet" id="menu" data-menu role="dialog" aria-modal="true" aria-label="{attr(mn["label"])}" hidden>'
        f'<div class="ms-top"><span class="wordmark">{wordmark(content["wordmark"])}</span>'
        f'<button class="ms-close" type="button" data-menu-close>{icon("x")}<span>{text(mn["close"])}</span></button></div>'
        f'<nav class="ms-nav" aria-label="{attr(mn["label"])}"><ul>{items}</ul></nav>'
        f'<a class="btn btn--primary btn--lg ms-ask" href="#ask" data-go="ask">{icon("search")}{text(m["askLabel"])}</a>'
        "</div>"
    )
