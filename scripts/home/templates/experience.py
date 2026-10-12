"""Work experience — the reference's timeline (§L4339–4434) with Cayleb's history."""
from markup import PLATE_OUTLINE, attr, px, reveal, text
from templates.approach import heading

PLATE_SIZE = (1431, 1024)


def row(index: int, entry: dict) -> str:
    frame = entry["frame"]
    align = entry.get("align", "centre")
    classes = f"row row--{frame}" + (f" row--{align}" if frame == "side" else "")
    side = "left" if index % 2 == 0 else "right"
    plate = (
        f'<div class="row-layer row-layer--plate" data-layer="plate">'
        f'<figure class="plate" data-plate>'
        f'<div class="plate-fill" style="clip-path:url(#plate-clip)"><div class="plate-slot" data-plate-slot>'
        f'<img src="{attr(entry["image"])}" alt="{attr(entry["alt"])}" width="{PLATE_SIZE[0]}" '
        f'height="{PLATE_SIZE[1]}" loading="lazy" decoding="async"></div></div>'
        f'<svg class="plate-outline" viewBox="0 0 710.995 462.995" preserveAspectRatio="none" aria-hidden="true">'
        f'<path d="{PLATE_OUTLINE}"/></svg></figure></div>'
    )
    title = f'<span class="row-title">{text(entry["title"])}</span>' if frame == "side" else ""
    year = (
        f'<div class="row-layer row-layer--year" data-layer="year">'
        f'<p class="row-year" data-year data-settle="{str(frame == "centre").lower()}">'
        f'{reveal(entry["year"], "letter", stagger=26, config="YEAR", mode="forward", cls="row-year-figure")}'
        f"{title}</p></div>"
    )
    copy = ""
    if frame == "centre":
        copy = (
            f'<div class="row-layer row-layer--copy" data-layer="copy">'
            f'<p class="row-copy" data-row-copy data-rise data-delay="220" data-config="COPY" style="--copy-w:{px(entry["copyWidth"])}">'
            f'<strong>{text(entry["lead"])}</strong> {text(entry["body"])}</p></div>'
        )
    return (
        f'<li class="{classes}" data-row data-frame="{frame}" data-side="{side}">'
        f"{plate}{year}{copy}</li>"
    )


def render(content: dict) -> str:
    e = content["experience"]
    rows = "".join(row(i, entry) for i, entry in enumerate(e["entries"]))
    return (
        '<section class="experience" data-experience id="experience" aria-labelledby="experience-title">'
        '<canvas class="seam" data-seam="light" aria-hidden="true"></canvas>'
        '<div class="experience-inner">'
        '<div class="experience-rail" data-rail aria-hidden="true"></div>'
        f'{heading(e["lines"], "experience-title", "experience-title", "heading-stop--white")}'
        f'<ol class="experience-rows">{rows}</ol></div></section>'
    )
