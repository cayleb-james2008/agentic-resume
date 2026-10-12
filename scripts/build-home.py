"""Render index.html (and resume.html) from site/content.json.

    python3 scripts/build-home.py

Every visible string lives in site/content.json; this script only arranges it.
It refuses to build when a string is longer than the frame it sits in
(site/content-limits.json), so an edit that would overflow fails here rather
than on the live page.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts" / "home"))

from templates import approach, contact, experience, hero, projects, resume, shell  # noqa: E402

CENTRE_COPY_MAX = 190
STAT_LABELS_MAX = 22


def select(value, pattern: str):
    """(value, path) pairs for a pattern such as `projects.cards[].name`."""
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
    labels = sum(len(s["label"]) for s in content["hero"]["glance"]["stats"])
    if labels > STAT_LABELS_MAX:
        problems.append(f"hero.glance.stats labels total {labels} characters; their row allows {STAT_LABELS_MAX}")
    for i, entry in enumerate(content["experience"]["entries"]):
        if entry["frame"] == "centre":
            length = len(f"{entry['lead']} {entry['body']}")
            if length > CENTRE_COPY_MAX:
                problems.append(f"experience.entries[{i}] copy is {length} characters; its column allows {CENTRE_COPY_MAX}")
    return problems


def build() -> str:
    content = json.loads((ROOT / "site/content.json").read_text())
    limits = json.loads((ROOT / "site/content-limits.json").read_text())
    problems = check_limits(content, limits)
    if problems:
        raise SystemExit("content.json does not fit its frames:\n  " + "\n  ".join(problems))
    blocks = {
        "hero": hero.render(content),
        "approach": approach.render(content),
        "experience": experience.render(content),
        "projects": projects.render(content),
        "contact": contact.render(content),
    }
    return shell.render(content, blocks)


def build_resume() -> str:
    content = json.loads((ROOT / "site/content.json").read_text())
    return resume.render(content, (ROOT / "resume/candidate-fragment.html").read_text())


if __name__ == "__main__":
    (ROOT / "index.html").write_text(build())
    (ROOT / "resume.html").write_text(build_resume())
    print("Built index.html and resume.html from site/content.json")
