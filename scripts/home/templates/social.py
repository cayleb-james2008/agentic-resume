"""What a page tells search engines and link previews: its canonical address and the share card.

Every page gets the same card (assets/og/card.png, made by make_share_card.py) with its own
title, description and address.
"""
from markup import attr


def tags(meta: dict, path: str, title: str, description: str) -> str:
    """Canonical link, Open Graph and Twitter tags for the page at `path` (relative to the site root)."""
    url = meta["siteUrl"] + path
    image = meta["siteUrl"] + meta["shareImage"]
    pairs = (
        ("property", "og:type", "website"),
        ("property", "og:site_name", "Cayleb Alvarez-James"),
        ("property", "og:title", title),
        ("property", "og:description", description),
        ("property", "og:url", url),
        ("property", "og:image", image),
        ("property", "og:image:width", "1200"),
        ("property", "og:image:height", "630"),
        ("property", "og:image:alt", meta["shareAlt"]),
        ("name", "twitter:card", "summary_large_image"),
        ("name", "twitter:title", title),
        ("name", "twitter:description", description),
        ("name", "twitter:image", image),
        ("name", "twitter:image:alt", meta["shareAlt"]),
    )
    return f'<link rel="canonical" href="{attr(url)}">' + "".join(
        f'<meta {kind}="{key}" content="{attr(value)}">' for kind, key, value in pairs
    )
