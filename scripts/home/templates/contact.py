"""Contact footer — the reference's sign-off (§L5275–5476) with Cayleb's links."""
from markup import SLAB_ARROW, attr, chamfer_frame, link, reveal, text
from templates.approach import heading

LOGO = 120
NAV, NAV_STEP = 260, 80
FOOT = (640, 720, 800)
FIGURE_SIZE = (1536, 1024)


def render(content: dict) -> str:
    c = content["contact"]
    nav = "".join(
        f'<li><a href="{attr(n["href"])}"{" download" if n["href"].endswith(".pdf") else ""}>'
        f'{reveal(n["label"], "letter", stagger=22, delay=NAV + i * NAV_STEP, config="ROW", gap="0.2em")}'
        '<span class="contact-nav-arrow" aria-hidden="true">→</span></a></li>'
        for i, n in enumerate(c["nav"])
    )
    links = "".join(f"<li>{link(l['href'], l['label'])}</li>" for l in c["links"])
    figure = c["figure"]
    return (
        '<section class="contact" data-contact id="contact" aria-labelledby="contact-title">'
        '<div class="contact-panel"><canvas class="contours" data-contours="--footer-contour" aria-hidden="true"></canvas></div>'
        '<div class="contact-figure-group"><div class="contact-figure-layer" data-figure-layer>'
        f'<img class="contact-figure" src="{attr(figure["image"])}" alt="{attr(figure["alt"])}" '
        f'width="{FIGURE_SIZE[0]}" height="{FIGURE_SIZE[1]}" loading="lazy" decoding="async"></div></div>'
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
