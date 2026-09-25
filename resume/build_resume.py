"""Build the repository's one-page resume PDF from resume/resume.md.

Uses the prior verified resume builder's offline ReportLab workflow, with a
strict one-page gate, selectable text, and an allowlist for public links.
"""
from __future__ import annotations

import html
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path
from urllib.parse import urlparse

from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Paragraph


HERE = Path(__file__).resolve().parent
SOURCE = HERE / "resume.md"
OUTPUT = HERE.parent / "Cayleb-James-resume.pdf"
ALLOWED_LINKS = {
    "https://github.com/cayleb-james2008",
    "https://github.com/cayleb-james2008/dotz",
    "https://github.com/cayleb-james2008/sophos",
    "https://github.com/cayleb-james2008/agentic-resume",
    "https://github.com/cayleb-james2008/industry-ai-suite",
    "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/dts/deposits_withdrawals_operating_cash?page%5Bsize%5D=10&sort=-record_date",
    "https://fiscaldata.treasury.gov/api-documentation/",
    "https://api.worldbank.org/v2/country/USA/indicator/NY.GDP.MKTP.CD?format=json&per_page=15",
    "https://datacatalog.worldbank.org/public-licenses",
    "https://data.worldbank.org/indicator/NY.GDP.MKTP.CD",
    "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json",
    "https://creativecommons.org/publicdomain/zero/1.0/",
    "https://api.github.com/repos/pytest-dev/pytest",
    "https://api.github.com/licenses/mit",
    "https://www.federalregister.gov/api/v1/documents.json?conditions%5Bagency_ids%5D%5B%5D=406&per_page=10&order=newest",
    "https://www.govinfo.gov/content/pkg/FR-2026-09-18/html/2026-19222.htm",
    "https://www.govinfo.gov/content/pkg/FR-2026-09-18/html/2026-19222.htm#DATES",
    "https://www.govinfo.gov/about/policies#copyright",
}
FORBIDDEN_HISTORY_MARKERS = (
    "tommy's pizza",
    "dunkin",
    "robert h. lord",
    "rhl",
    "david cooke plaster",
    "dcpc",
    "portland high school",
    "cybersecurity",
    "ap computer science",
)
ALLOWED_HOSTS = {
    "github.com",
    "api.fiscaldata.treasury.gov",
    "fiscaldata.treasury.gov",
    "api.worldbank.org",
    "datacatalog.worldbank.org",
    "data.worldbank.org",
    "www.cisa.gov",
    "creativecommons.org",
    "api.github.com",
    "www.federalregister.gov",
    "www.govinfo.gov",
}
LINK_OR_BOLD = re.compile(r"(\[[^\]]+\]\(https?://[^)\s]+\)|\*\*[^*]+\*\*)")
LINK = re.compile(r"^\[([^\]]+)\]\((https?://[^)\s]+)\)$")

TITLE = ParagraphStyle(
    "title", fontName="Helvetica-Bold", fontSize=15, leading=17,
    spaceAfter=2, textColor="#17171f",
)
H2 = ParagraphStyle(
    "h2", fontName="Helvetica-Bold", fontSize=8.4, leading=10,
    spaceBefore=5, spaceAfter=1.5, textColor="#282832",
)
BODY = ParagraphStyle(
    "body", fontName="Helvetica", fontSize=8.5, leading=10,
    spaceAfter=0.8, textColor="#202027",
)
BULLET = ParagraphStyle(
    "bullet", parent=BODY, leftIndent=10, firstLineIndent=0,
    bulletIndent=1, spaceAfter=1.2,
)


def inline_markup(text: str) -> str:
    """Escape plain text and render only allowlisted Markdown links/bold."""
    output: list[str] = []
    for part in LINK_OR_BOLD.split(text):
        if not part:
            continue
        match = LINK.fullmatch(part)
        if match:
            label, target = match.groups()
            parsed = urlparse(target)
            if target not in ALLOWED_LINKS or parsed.scheme != "https" or parsed.netloc not in ALLOWED_HOSTS:
                raise ValueError(f"Resume link is not in the verified public allowlist: {target}")
            output.append(
                f'<link href="{html.escape(target, quote=True)}" color="#51406b">'
                f"<u>{html.escape(label)}</u></link>"
            )
        elif part.startswith("**") and part.endswith("**"):
            output.append(f"<b>{html.escape(part[2:-2])}</b>")
        else:
            output.append(html.escape(part))
    return "".join(output)


def parse_markdown(path: Path) -> list[Paragraph]:
    story: list[Paragraph] = []
    pending: list[str] = []

    def flush() -> None:
        if pending:
            story.append(Paragraph(inline_markup(" ".join(pending)), BODY))
            pending.clear()

    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line:
            flush()
        elif line.startswith("# "):
            flush()
            story.append(Paragraph(inline_markup(line[2:].strip()), TITLE))
        elif line.startswith("## "):
            flush()
            story.append(Paragraph(inline_markup(line[3:].strip()).upper(), H2))
        elif line.startswith("- "):
            flush()
            story.append(Paragraph(inline_markup(line[2:].strip()), BULLET, bulletText="•"))
        else:
            pending.append(line)
    flush()
    return story


def verify_pdf_text(path: Path) -> None:
    pdftotext = shutil.which("pdftotext")
    if not pdftotext:
        raise RuntimeError("pdftotext is required to confirm selectable PDF text")
    result = subprocess.run(
        [pdftotext, str(path), "-"], capture_output=True, text=True, timeout=30, check=True
    )
    content = result.stdout
    if not content.strip():
        raise RuntimeError("Generated PDF contains no extractable text")
    normalized_content = re.sub(r"\s+", " ", content).casefold()
    required = (
        "Project résumé / selected verified work", "Cayleb Alvarez-James",
        "LedgerBridge", "SearchLift", "UNVERIFIED",
        "Treasury", "World Bank", "CISA", "pytest-dev/pytest", "2026-19222",
        "GovInfo", "public-policy question", "DATES",
        "SearchLift before-state", "0/10 approved workflow names",
        "License : CC BY-4.0", "17:15:50 UTC",
        "AI UNVERIFIED", "all 10 AI statuses: UNVERIFIED",
    )
    for phrase in required:
        if phrase.casefold() not in normalized_content:
            raise RuntimeError(f"Generated PDF is missing required text: {phrase}")
    if "TO BE SUPPLIED" in content:
        raise RuntimeError("Generated PDF contains unresolved placeholder text")
    if "@" in content:
        raise RuntimeError("Generated PDF contains an email address or unverified contact marker")
    phone_pattern = re.compile(r"(?<!\d)(?:\+?1[ .-]?)?(?:\(\d{3}\)|\d{3})[ .-]?\d{3}[ .-]?\d{4}(?!\d)")
    if phone_pattern.search(content):
        raise RuntimeError("Generated PDF contains a phone-number pattern")
    forbidden = [marker for marker in FORBIDDEN_HISTORY_MARKERS if marker in normalized_content]
    if forbidden:
        raise RuntimeError("Generated PDF contains unverified personal-history claims")
    stale_ai_claim = "all ten package ai outputs were rejected"
    if stale_ai_claim in content.casefold():
        raise RuntimeError("Generated PDF repeats a superseded AI-status claim")
    forbidden_no_call_claims = ("no ai route was invoked", "no independent ai route run")
    if any(claim in normalized_content for claim in forbidden_no_call_claims):
        raise RuntimeError("Generated PDF makes an absolute AI no-call claim")


def verify_pdf_metadata(path: Path) -> None:
    qpdf = shutil.which("qpdf")
    if not qpdf:
        raise RuntimeError("qpdf is required to confirm PDF metadata and link annotations")
    result = subprocess.run(
        [qpdf, "--json", str(path)], capture_output=True, text=True, timeout=30, check=True
    )
    metadata = json.dumps(json.loads(result.stdout), ensure_ascii=False).casefold()
    required = (
        "project résumé / selected verified work",
        "cayleb alvarez-james",
        "https://github.com/cayleb-james2008/industry-ai-suite",
    )
    if any(value not in metadata for value in required):
        raise RuntimeError("PDF metadata is missing the selected-work title or author")
    if any(marker in metadata for marker in FORBIDDEN_HISTORY_MARKERS):
        raise RuntimeError("PDF metadata contains unverified personal-history claims")


def main() -> int:
    source_text = SOURCE.read_text(encoding="utf-8")
    if "TO BE SUPPLIED" in source_text:
        print("FAIL: placeholder gate — unresolved resume text remains", file=sys.stderr)
        return 1
    if not source_text.startswith("# Project résumé / selected verified work\n"):
        print("FAIL: résumé must be explicitly titled as selected verified project work", file=sys.stderr)
        return 1
    if any(marker in source_text.casefold() for marker in FORBIDDEN_HISTORY_MARKERS):
        print("FAIL: unverified personal-history claims remain in the public résumé source", file=sys.stderr)
        return 1

    page_count = [0]

    def on_page(canvas, _doc) -> None:
        page_count[0] += 1
        canvas.setTitle("Project résumé / selected verified work")
        canvas.setAuthor("Cayleb Alvarez-James")
        canvas.setSubject("Selected verified public projects and evidence-backed public-data work")
        canvas.setKeywords("project resume, selected verified work, WIP workflows")
        canvas.setCreator("agentic-resume offline PDF builder")
        canvas.setFont("Helvetica", 6.5)
        canvas.setFillColor("#55555d")
        canvas.drawCentredString(
            4.25 * inch,
            0.28 * inch,
            "All 10 full jobs: UNVERIFIED · All 10 AI statuses: UNVERIFIED.",
        )

    doc = BaseDocTemplate(
        str(OUTPUT), pagesize=LETTER,
        leftMargin=0.55 * inch, rightMargin=0.55 * inch,
        topMargin=0.42 * inch, bottomMargin=0.43 * inch,
    )
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="resume")
    doc.addPageTemplates([PageTemplate(id="one-page", frames=[frame], onPage=on_page)])
    doc.build(parse_markdown(SOURCE))

    if page_count[0] != 1:
        print(f"FAIL: generated resume is {page_count[0]} pages, expected exactly 1", file=sys.stderr)
        return 1
    verify_pdf_text(OUTPUT)
    verify_pdf_metadata(OUTPUT)
    print(f"OK: {OUTPUT.name} built as one page with extractable text and allowlisted public links")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
