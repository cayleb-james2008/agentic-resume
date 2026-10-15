"""The official half of the homepage: the résumé itself, plainly set.

It is rendered from resume/resume-content.json, the same source as the PDFs, so the page and the
files cannot drift apart. Labels and notes that are not in the résumé (section titles, the Ergon
status, the lab link, the download labels) come from content["resumeHalf"].

There are no certifications, by Cayleb's decision: anyone can have an agent earn one. They are
never rendered, so a `certifications` key in the résumé data is never read.
"""
from markup import link, text

# Case-study pages live at projects/<slug>.html, bar the ones named here.
CASE_PAGES = {"suite": "projects/industry-ai-suite.html"}


def case_page(slug: str) -> str:
    return CASE_PAGES.get(slug, f"projects/{slug}.html")


def local(url: str, site_url: str) -> str:
    """A link to the site's own pages goes relative; anything else stays as written."""
    if site_url and url.startswith(site_url):
        return url[len(site_url):] or "./"
    return url


def section(section_id: str, title: str, body: str) -> str:
    title_id = f"resume-{section_id}-title"
    return (
        f'<section id="{section_id}" aria-labelledby="{title_id}">'
        f'<h2 id="{title_id}">{text(title)}</h2>{body}</section>'
    )


def head(half: dict, resume: dict) -> str:
    place = " · ".join((resume["headline"], resume["location"], resume["work_preference"]))
    downloads = "".join(
        f'<li>{link(d["href"], d["label"], "resume-half-download")}</li>' for d in half["downloads"]
    )
    return (
        '<header class="resume-half-head">'
        f'<p class="resume-half-kicker">{text(half["kicker"])}</p>'
        f'<p class="resume-half-name">{text(resume["full_name"])}</p>'
        f'<p class="resume-half-meta">{text(place)}</p>'
        f'<ul class="resume-half-downloads">{downloads}</ul></header>'
    )


def job(item: dict) -> str:
    """An organization, then its role when the résumé gives one (split on " — ")."""
    company, _, role = item["organization"].partition(" — ")
    org = f'<span class="resume-company">{text(company)}</span>'
    if role:
        org += f' — <span class="resume-role">{text(role)}</span>'
    return f'<li><span class="resume-org">{org}</span><span class="resume-dates">{text(item["dates"])}</span></li>'


def experience(half: dict, resume: dict) -> str:
    e = resume["experience"]
    ethic = half["workEthic"]
    jobs = "".join(job(item) for item in resume["additional_experience"])
    body = (
        '<article class="resume-entry">'
        f'<h3>{text(e["title"])}</h3><p class="resume-dates">{text(e["dates"])}</p><p>{text(e["intro"])}</p></article>'
        '<div class="resume-ethic">'
        f'<h3>{text(ethic["title"])}</h3><p>{text(ethic["line"])}</p><ul class="resume-jobs">{jobs}</ul></div>'
    )
    return section("experience", half["experience"], body)


def project(index: int, item: dict, half: dict, site_url: str) -> str:
    page = case_page(item["slug"])
    links = [link(page, half["caseStudy"], "resume-link")]
    for ref in item["links"]:
        href = local(ref["url"], site_url)
        if href != page:  # the case study is already there
            links.append(link(href, ref["label"], "resume-link"))
    status = half.get("status", {}).get(item["slug"])
    note = f'<p class="resume-status">{text(status)}</p>' if status else ""
    bullets = "".join(f"<li>{text(b)}</li>" for b in item["bullets"])
    lead = " resume-project--lead" if index == 0 else ""
    return (
        f'<article class="resume-project{lead}">'
        f'<h3>{text(item["name"])}</h3><p class="resume-stack">{text(item["stack"])}</p>{note}'
        f'<ul>{bullets}</ul><p class="resume-links">{" ".join(links)}</p></article>'
    )


def work(half: dict, resume: dict, site_url: str) -> str:
    cards = "".join(project(i, item, half, site_url) for i, item in enumerate(resume["projects"]))
    lab = half["lab"]
    body = (
        f'<div class="resume-projects">{cards}</div>'
        f'<p class="resume-lab">{link(lab["href"], lab["label"], "resume-link")} '
        f'<span class="resume-lab-sub">{text(lab["sub"])}</span></p>'
    )
    return section("work", half["projects"], body)


def education(half: dict, resume: dict) -> str:
    e = resume["education"]
    rows = "".join(f"<div><dt>{text(label)}</dt><dd>{text(value)}</dd></div>" for label, value in resume["skills"])
    body = (
        '<div class="resume-edu">'
        f'<h3>{text(e["school"])}</h3><p class="resume-dates">{text(e["status"])}</p>'
        f'<p>{text(e["location"])}</p><p>{text(e["coursework"])}</p></div>'
        f'<h3 class="resume-skills-title">{text(half["skills"])}</h3><dl class="resume-skills">{rows}</dl>'
    )
    return section("education", half["education"], body)


def render(content: dict, resume: dict) -> str:
    half = content["resumeHalf"]
    site_url = content["meta"]["siteUrl"]
    return (
        '<div class="resume-half" id="resume">'
        f"{head(half, resume)}{experience(half, resume)}{work(half, resume, site_url)}{education(half, resume)}"
        "</div>"
    )
