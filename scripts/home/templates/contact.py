"""The contact footer: the closing line and Get in touch, the brand and the email (shown as text, with a
copy button, because mail links may do nothing), the Site / Projects / Elsewhere columns, the copyright."""
from markup import attr, external, icon, link, mk, text


def _column(title: str, links: list[dict]) -> str:
    items = "".join(f"<li>{link(l['href'], l['label'], extra=external(l['href']))}</li>" for l in links)
    return f'<div><p class="ft-t">{text(title)}</p><ul>{items}</ul></div>'


def render(content: dict) -> str:
    c = content["contact"]
    email = content["meta"]["email"]
    nav = "".join(
        f'<li><a href="{attr(n["href"])}" data-go="{attr(n["href"].lstrip("#"))}">{text(n["label"])}</a></li>' for n in c["nav"]
    )
    columns = "".join(_column(col["title"], col["links"]) for col in c["columns"])
    return (
        '<section class="contact" id="contact" aria-labelledby="contact-title"><div class="shell foot-in">'
        f'<div class="ft-cta"><h2 class="ft-h" id="contact-title" data-lines data-stagger="100">{text(c["headline"])}</h2>'
        # Without the script this is a plain email link; with it, it opens the composer.
        f'<a class="pill light arrow" href="mailto:{attr(content["meta"]["email"])}" data-modal>{text(c["cta"]["label"])}<span class="pb">{icon("upright")}</span></a></div>'
        '<div class="ft-cols">'
        f'<div class="ft-brand"><p class="brandline">{mk()}{text(content["wordmark"])}</p><p>{text(c["blurb"])}</p>'
        f'<p class="ft-mail"><span class="ft-email">{text(email)}</span>'
        f'<button class="copy" type="button" data-copy="{attr(email)}" data-copied="{attr(c["copied"])}" data-failed="{attr(c["copyFailed"])}">'
        f'{icon("copy")}<span>{text(c["copy"])}</span></button></p></div>'
        f'<nav class="contact-nav" aria-label="Footer"><p class="ft-t">{text(c["siteTitle"])}</p><ul>{nav}</ul></nav>'
        f"{columns}</div>"
        f'<div class="ft-legal"><p class="contact-copyright">{text(c["copyright"])}</p><span>{text(c["place"])}</span></div>'
        f'</div><div class="ft-wm" aria-hidden="true">{text(c["watermark"])}</div></section>'
    )
