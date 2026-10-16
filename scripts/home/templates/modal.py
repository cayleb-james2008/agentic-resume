"""The request modal: it composes an email to Cayleb (site/js/home/mail.js). Nothing is sent from the
page, and it never says otherwise; his address is shown as text in case the mail link does nothing."""
from markup import attr, icon, text


def _field(key: str, f: dict) -> str:
    control = (
        f'<textarea id="f-{key}" name="{key}" rows="4" placeholder="{attr(f["placeholder"])}" required></textarea>'
        if key == "msg" else
        f'<input id="f-{key}" name="{key}" type="{"email" if key == "email" else "text"}" '
        f'autocomplete="{"email" if key == "email" else "name"}" placeholder="{attr(f["placeholder"])}" required>'
    )
    return f'<label for="f-{key}">{text(f["label"])}{control}<span class="md-err" id="e-{key}" hidden>{text(f["error"])}</span></label>'


def render(content: dict) -> str:
    m = content["modal"]
    email = content["meta"]["email"]
    fields = "".join(_field(k, m["fields"][k]) for k in ("name", "email", "msg"))
    data = (
        f' data-email="{attr(email)}" data-eyebrow="{attr(m["eyebrow"])}" data-topic-prefix="{attr(m["topicPrefix"])}"'
        f' data-topic-ph="{attr(m["topicPlaceholder"])}" data-other-ph="{attr(m["otherPlaceholder"])}"'
        f' data-other-topic="{attr(m["otherTopic"])}" data-default-ph="{attr(m["fields"]["msg"]["placeholder"])}"'
    )
    return (
        f'<div class="modal" id="modal" data-modal-root{data} role="dialog" aria-modal="true" aria-labelledby="md-title" hidden>'
        '<div class="md-panel">'
        f'<button class="md-x" type="button" data-modal-close aria-label="{attr(m["close"])}">{icon("x")}</button>'
        '<div data-md-form-wrap>'
        f'<div class="md-head"><p class="md-eb"><span data-md-topic>{text(m["eyebrow"])}</span></p>'
        f'<h2 id="md-title">{text(m["headline"])}</h2></div>'
        f'<form class="md-form" data-md-form novalidate>{fields}'
        f'<div class="md-row"><p class="md-note">{text(m["note"])}</p>'
        f'<button class="btn btn--primary btn--lg" type="submit">{text(m["submit"])}</button></div>'
        "</form></div>"
        f'<div class="md-done" data-md-done hidden><span class="md-badge" aria-hidden="true">{icon("check")}</span><h2 tabindex="-1" id="md-done-title" data-md-done-title>{text(m["doneTitle"])}</h2>'
        f'<p>{text(m["doneText"])} <span class="sel">{text(email)}</span>.</p>'
        f'<textarea class="md-raw" data-md-raw readonly rows="6" aria-label="{attr(m["rawLabel"])}" hidden></textarea>'
        f'<div class="md-acts"><button class="btn btn--ghost" type="button" data-md-copy data-copied="{attr(m["copied"])}" data-failed="{attr(m["copyFailed"])}">{text(m["copy"])}</button>'
        f'<button class="btn btn--ink" type="button" data-modal-close>{text(m["close"])}</button></div></div>'
        "</div></div>"
    )
