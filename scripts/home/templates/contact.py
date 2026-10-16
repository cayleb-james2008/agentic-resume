"""The contact footer: the closing line and Get in touch, the email (shown as text, with a copy button, because
mail links may do nothing), the site's sections, the projects and elsewhere, and the copyright."""
from markup import attr, external, icon, link, text, wordmark


def _column(title: str, links: list[dict]) -> str:
    items = "".join(f"<li>{link(l['href'], l['label'], extra=external(l['href']))}</li>" for l in links)
    return f'<div class="ft-col"><p class="ft-t">{text(title)}</p><ul>{items}</ul></div>'


def render(content: dict) -> str:
    c = content["contact"]
    email = content["meta"]["email"]
    nav = "".join(
        f'<li><a href="{attr(n["href"])}" data-go="{attr(n["href"].lstrip("#"))}">{text(n["label"])}</a></li>' for n in c["nav"]
    )
    columns = "".join(_column(col["title"], col["links"]) for col in c["columns"])
    return (
        '<section class="contact" id="contact" aria-labelledby="contact-title"><div class="shell foot-in">'
        '<div class="ct-main">'
        f'<h2 class="ct-h" id="contact-title">{text(c["headline"])}</h2>'
        f'<p class="ct-blurb">{text(c["blurb"])}</p>'
        '<div class="ct-actions">'
        # Without the script this is a plain email link; with it, it opens the composer.
        f'<a class="btn btn--primary btn--lg" href="mailto:{attr(email)}" data-modal>{text(c["cta"]["label"])}</a>'
        f'<p class="ft-mail"><span class="ft-email">{text(email)}</span>'
        f'<button class="copy" type="button" data-copy="{attr(email)}" data-copied="{attr(c["copied"])}" data-failed="{attr(c["copyFailed"])}">'
        f'{icon("copy")}<span>{text(c["copy"])}</span></button></p></div></div>'
        '<div class="ft-cols">'
        f'<div class="ft-brand"><p class="wordmark">{wordmark(content["wordmark"])}</p><p>{text(content["hero"]["eyebrow"])}</p></div>'
        f'<nav class="contact-nav" aria-label="Footer"><p class="ft-t">{text(c["siteTitle"])}</p><ul>{nav}</ul></nav>'
        f"{columns}</div>"
        f'<div class="ft-legal"><p class="contact-copyright">{text(c["copyright"])}</p><p>{text(c["place"])}</p></div>'
        "</div></section>"
    )
