"""Contact footer — the reference's sign-off (§L5275–5476) with Cayleb's links, on a plain dark panel."""
from markup import SLAB_ARROW, attr, chamfer_frame, heading, link, reveal, text

LOGO = 120
NAV, NAV_STEP = 260, 80
FOOT = (640, 720, 800)


def render(content: dict) -> str:
    c = content["contact"]
    nav = "".join(
        f'<li><a href="{attr(n["href"])}"{" download" if n["href"].endswith(".pdf") else ""}>'
        f'{reveal(n["label"], "letter", stagger=22, delay=NAV + i * NAV_STEP, config="ROW", gap="0.2em")}'
        '<span class="contact-nav-arrow" aria-hidden="true">→</span></a></li>'
        for i, n in enumerate(c["nav"])
    )
    links = "".join(f"<li>{link(l['href'], l['label'])}</li>" for l in c["links"])
    return (
        '<section class="contact" data-contact id="contact" aria-labelledby="contact-title">'
        '<div class="contact-panel"></div>'
        f'<a class="contact-wordmark" href="./" data-fade data-delay="{LOGO}" aria-label="Cayleb Alvarez-James, home">'
        f'{text(content["wordmark"])}</a>'
        f'{heading(c["lines"], "contact-title", "contact-title", "heading-stop--white")}'
        f'<nav class="contact-nav" aria-label="Footer"><ul>{nav}</ul></nav>'
        f'<p class="contact-copyright" data-rise data-delay="{FOOT[0]}">{text(c["copyright"])}</p>'
        f'<a class="cta cta--hollow" href="{attr(c["cta"]["href"])}" download data-rise data-delay="{FOOT[1]}">'
        f'{chamfer_frame(275, 50, 8.835, "cta-frame--hollow")}<span class="cta-label">{text(c["cta"]["label"])}</span>{SLAB_ARROW}</a>'
        f'<ul class="contact-links" data-rise data-delay="{FOOT[2]}">{links}</ul>'
        "</section>"
    )
