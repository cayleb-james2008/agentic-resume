"""The masthead: the wordmark, the primary nav and the burger, fixed over the page."""
from markup import attr, link, text


def render(content: dict) -> str:
    items = "".join(f"<li>{link(n['href'], n['label'])}</li>" for n in content["nav"])
    action = content["navAction"]
    return (
        '<header class="masthead" data-masthead>'
        f'<a class="wordmark" href="./" aria-label="Cayleb Alvarez-James, home">{text(content["wordmark"])}</a>'
        f'<nav class="masthead-nav" aria-label="Primary"><ul>{items}</ul></nav>'
        f'<a class="masthead-action" href="{attr(action["href"])}">'
        f'<span aria-hidden="true">[ </span>{text(action["label"])}<span aria-hidden="true"> → ]</span></a>'
        '<button class="burger" type="button" aria-label="Open menu" aria-expanded="false" '
        'aria-controls="menu-sheet" data-burger><span></span><span></span></button>'
        "</header>"
    )
