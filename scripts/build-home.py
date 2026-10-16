"""Render index.html (and resume.html) from site/content.json.

    python3 scripts/build-home.py

Every visible string lives in site/content.json, bar the résumé half, which is
set from resume/resume-content.json (the PDFs' own source); this script only
arranges them, one block per section (scripts/home/templates/).
It refuses to build when a string is longer than the frame it sits in
(site/content-limits.json), so an edit that would overflow fails here rather
than on the live page.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts" / "home"))

from templates import (  # noqa: E402
    built, contact, ergon, hero, masthead, modal, resume, resume_half, services, shell,
)


def select(value, pattern: str):
    """(value, path) pairs for a pattern such as `story.beats[].roles[]`."""
    nodes = [(value, "")]
    for part in pattern.split("."):
        many = part.endswith("[]")
        key = part[:-2] if many else part
        found = []
        for node, path in nodes:
            if not isinstance(node, dict) or key not in node:
                continue
            here = f"{path}.{key}" if path else key
            if many:
                found += [(item, f"{here}[{i}]") for i, item in enumerate(node[key])]
            else:
                found.append((node[key], here))
        nodes = found
    return nodes


def check_limits(content: dict, limits: dict) -> list[str]:
    problems = []
    for pattern, limit in limits.items():
        for value, path in select(content, pattern):
            if len(str(value)) > limit:
                problems.append(f"{path} is {len(str(value))} characters; its frame allows {limit}")
    return problems


def build() -> str:
    content = json.loads((ROOT / "site/content.json").read_text())
    limits = json.loads((ROOT / "site/content-limits.json").read_text())
    problems = check_limits(content, limits)
    if problems:
        raise SystemExit("content.json does not fit its frames:\n  " + "\n  ".join(problems))
    resume_data = json.loads((ROOT / "resume/resume-content.json").read_text())
    blocks = {
        "masthead": masthead.render(content),
        "hero": hero.render(content),
        "built": built.render(content),
        "services": services.render(content),
        "ergon": ergon.render(content),
        "resume_half": resume_half.render(content, resume_data),
        "contact": contact.render(content),
        "menu": masthead.menu(content),
        "modal": modal.render(content),
    }
    assert set(blocks) == set(shell.BLOCKS), "every block the shell places is rendered"
    return shell.render(content, blocks)


def build_resume() -> str:
    content = json.loads((ROOT / "site/content.json").read_text())
    return resume.render(content, (ROOT / "resume/candidate-fragment.html").read_text())


def write(path: Path, body: str) -> None:
    """Write through a temporary file, so a reader (a test running alongside) never sees half a page."""
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_text(body)
    tmp.replace(path)


if __name__ == "__main__":
    write(ROOT / "index.html", build())
    write(ROOT / "resume.html", build_resume())
    print("Built index.html and resume.html from site/content.json")
