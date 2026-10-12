"""Build unpublished candidate exports from resume-content.json; never overwrite approved PDFs."""
from __future__ import annotations
import argparse
import hashlib
import html
import json
import re
import subprocess
from pathlib import Path
from urllib.parse import urlparse

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
SOURCE = HERE / 'resume-content.json'


def plain(value):
    # PDF fonts and exported text use ordinary hyphens/apostrophes for reliable extraction.
    return value.translate(str.maketrans({'—': '-', '–': '-', '’': "'", '·': '|'}))


def records(data, short=False):
    rows = [('title', data['full_name']), ('body', data['headline']),
            ('body', f"{data['location']} | {data['work_preference']} | {data['email']}"),
            ('links', list(data['links'].values())), ('h2', 'Summary'), ('body', data['summary']),
            ('h2', 'Experience'), ('h3', f"{data['experience']['title']} | {data['experience']['dates']}"),
            ('body', data['experience']['intro']), ('h2', 'Selected Projects')]
    for project in data['projects']:
        rows.append(('h3', project['short_name'] if short else project['name']))
        if short:
            rows.append(('links', project['links'][:1]))
        else:
            rows += [('body', project['stack']), ('links', project['links'])]
        rows += [('bullet', b) for b in ([project['short']] if short else project['bullets'])]
    rows.append(('h2', 'Skills'))
    rows += [('body', value) for value in data['short_skills']] if short else [('body', f'{label}: {value}') for label, value in data['skills']]
    rows.append(('h2', 'Additional Experience'))
    rows += [('body', f"{job['organization']} | {job['dates']}") for job in data['additional_experience']]
    school = data['education']
    rows += [('h2', 'Education'), ('body', f"{school['school']} | {school['location']} | {school['status']}"),
             ('body', f"Coursework: {school['coursework']}"), ('body', data['snapshot_note'])]
    return rows


def validate_source(data):
    assert data['headline'] == 'AI workflow integrator'
    assert [p['slug'] for p in data['projects']] == ['suite', 'sophos', 'dotz']
    assert data['summary'].startswith('AI workflow integrator. Focus: ')
    assert not re.search(r'\b(clients?|customers?|deployed)\b', data['summary'], re.I)
    assert len(data['additional_experience']) == 4
    assert data['education']['school'] == 'Portland High School'
    for link in [*data['links'].values(), *(l for p in data['projects'] for l in p['links'])]:
        parsed = urlparse(link['url'])
        assert parsed.scheme == 'https' and parsed.netloc in {'github.com', 'cayleb-james2008.github.io'}
    assert not re.search(r'TO BE SUPPLIED|PLACEHOLDER', json.dumps(data))


def text_export(rows):
    return '\n\n'.join(plain(' | '.join(f"{l['label']}: {l['url']}" for l in value) if kind == 'links'
                                  else ('- ' if kind == 'bullet' else '') + value)
                        for kind, value in rows) + '\n'


def markdown_export(rows):
    prefix = {'title': '# ', 'h2': '## ', 'h3': '### ', 'bullet': '- ', 'body': ''}
    return '\n\n'.join(' | '.join(f"[{l['label']}]({l['url']})" for l in value) if kind == 'links'
                        else prefix[kind] + value for kind, value in rows) + '\n'


def detailed_fragment(rows):
    tags = {'title': 'h1', 'h2': 'h2', 'h3': 'h3', 'body': 'p', 'bullet': 'p'}
    parts = ['<article class="resume" id="resume">']
    for kind, value in rows:
        if kind == 'links':
            parts.append('<p>' + ' | '.join(f'<a href="{html.escape(l["url"], quote=True)}">{html.escape(l["label"])}</a>' for l in value) + '</p>')
        else:
            tag = tags[kind]
            parts.append(f'<{tag}>' + html.escape(value) + f'</{tag}>')
    return '\n'.join(parts + ['</article>', ''])


def short_fragment(data):
    template = (ROOT / 'resume/fragment-template.html').read_text()
    template = template.replace('Cayleb Alvarez-James', html.escape(data['full_name'])).replace('caylebalvarezjames@gmail.com', data['email'])
    def replace(pattern, value):
        nonlocal template
        template, count = re.subn(pattern, lambda _: value, template, count=1)
        assert count == 1, pattern
    replace(r'<p>AI workflow developer · Connecticut</p>', f'<p>{html.escape(data["headline"])} · Connecticut · {data["work_preference"]}</p>')
    replace(r'(<div class="resume-summary"><h2>Summary</h2>)<p>.*?</p>', '<div class="resume-summary"><h2>Summary</h2><p>' + html.escape(data['summary']) + '</p>')
    replace(r'(<p class="resume-date">2026</p>)<p>.*?</p>', '<p class="resume-date">' + data['experience']['dates'] + '</p><p>' + html.escape(data['experience']['intro']) + '</p>')
    jobs = '<div class="resume-jobs">' + ''.join('<p><strong>' + html.escape(j['organization'].replace("'", '’').replace(' — ', ' · ')) + '</strong><span>' + html.escape(j['dates']) + '</span></p>' for j in data['additional_experience']) + '</div>'
    replace(r'<div class="resume-jobs">.*?</div>', jobs)
    school = data['education']
    replace(r'<h3>Portland High School</h3><p>.*?</p>', '<h3>' + html.escape(school['school']) + '</h3><p>' + html.escape(school['location'] + ' · ' + school['status']) + '<br>' + html.escape(school['coursework']) + '</p>')
    projects = '<div class="resume-selected">' + ''.join(f'<h3><a href="{p["links"][0]["url"]}" data-goto-project="{p["slug"]}">{p["short_name"]} ↗</a></h3><p>{html.escape(p["short"])}</p>' for p in data['projects']) + '</div>'
    replace(r'<div class="resume-selected">.*?</div>', projects)
    replace(r'<section><h2>Skills</h2><p>.*?</p></section>', '<section><h2>Skills</h2><p>' + '<br>'.join(html.escape(value) for value in data['short_skills']) + '</p></section>')
    actions = '<footer class="resume-actions"><a class="button primary" href="Cayleb-James-polished-one-page.pdf" download>One-page résumé PDF ↓</a><a class="quiet" href="Cayleb-James-polished-resume.pdf" download>Detailed résumé PDF ↓</a><a class="quiet" href="Cayleb-James-polished-one-page.txt" download>One-page text ↓</a><a class="quiet" href="Cayleb-James-polished-resume.txt" download>Detailed text ↓</a><a class="quiet" href="mailto:' + data['email'] + '">Let’s talk ↗</a><p>' + html.escape(data['snapshot_note']) + '</p></footer>'
    replace(r'<footer class="resume-actions">.*?</footer>', actions)
    return template


def normalized(value):
    return re.sub(r'\s+', ' ', plain(value)).strip()


def check_pdf(path, rows, max_pages, exact_pages=None):
    info = subprocess.check_output(['pdfinfo', str(path)], text=True)
    pages = int(re.search(r'Pages:\s+(\d+)', info).group(1))
    assert 1 <= pages <= max_pages and (exact_pages is None or pages == exact_pages), (path, pages)
    assert path.stat().st_size < 2_000_000 and re.search(r'Encrypted:\s+no', info)
    expected = [plain(l['label']) for k, v in rows for l in v if k == 'links']
    expected += [plain(v) for k, v in rows if k != 'links']
    for layout in ([], ['-layout']):
        output = subprocess.check_output(['pdftotext', *layout, str(path), '-'], text=True)
        content = normalized(output)
        for value in expected:
            assert normalized(value) in content, (path.name, value)
        # All source records, including dates and project boundaries, extract in reading order.
        cursor = 0
        for kind, value in rows:
            values = [l['label'] for l in value] if kind == 'links' else [value]
            for item in values:
                position = content.find(normalized(item), cursor)
                assert position >= cursor, (path.name, item, 'extraction order')
                cursor = position + len(normalized(item))
        assert not re.search(r'\*\*|TO BE SUPPLIED|\[[^\]]+\]\(https', output)
    return {'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'pages': pages, 'bytes': path.stat().st_size}


def build_pdf(path, rows, short):
    from reportlab.lib.pagesizes import LETTER
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.platypus import SimpleDocTemplate, Paragraph, PageBreak
    body = ParagraphStyle('body', fontName='Helvetica', fontSize=10 if short else 10.5, leading=12 if short else 13, spaceAfter=3)
    styles = {'body': body, 'links': ParagraphStyle('links', parent=body),
              'title': ParagraphStyle('title', parent=body, fontName='Helvetica-Bold', fontSize=18, leading=21, spaceAfter=4),
              'h2': ParagraphStyle('h2', parent=body, fontName='Helvetica-Bold', fontSize=11, leading=14, spaceBefore=7, spaceAfter=3, keepWithNext=True),
              'h3': ParagraphStyle('h3', parent=body, fontName='Helvetica-Bold', spaceBefore=4, keepWithNext=True),
              'bullet': ParagraphStyle('bullet', parent=body, leftIndent=10, bulletIndent=0)}
    story = []
    for kind, value in rows:
        if not short and kind == 'h3' and value.startswith('dotz -'):
            story.append(PageBreak())
        if kind == 'links':
            value = ' | '.join(f'<link href="{html.escape(l["url"], quote=True)}"><u>{html.escape(plain(l["label"]))}</u></link>' for l in value)
        else:
            value = html.escape(plain(value))
        story.append(Paragraph(value, styles[kind], bulletText='-' if kind == 'bullet' else None))
    doc = SimpleDocTemplate(str(path), pagesize=LETTER, leftMargin=36, rightMargin=36, topMargin=30, bottomMargin=30,
                            title='Cayleb Alvarez-James - AI workflow developer', author='Cayleb Alvarez-James',
                            subject='Unpublished resume polish candidate; October 5, 2026 project snapshot', invariant=1)
    doc.build(story)
    return check_pdf(path, rows, 1 if short else 2, 1 if short else None)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--content-only', action='store_true', help='Generate text/HTML/Markdown without ReportLab')
    args = parser.parse_args()
    data = json.loads(SOURCE.read_text()); validate_source(data)
    approved = json.loads((HERE / 'approved-verification.json').read_text())
    for name, record in approved['artifacts'].items():
        assert hashlib.sha256((ROOT / name).read_bytes()).hexdigest() == record['sha256']
    exports = {}
    for short, stem, mdname in [(True, 'Cayleb-James-polished-one-page', 'one-page.md'), (False, 'Cayleb-James-polished-resume', 'resume.md')]:
        rows = records(data, short)
        (HERE / mdname).write_text(markdown_export(rows), encoding='utf-8')
        path = ROOT / (stem + '.txt'); path.write_text(text_export(rows), encoding='utf-8')
        exports[path.name] = {'sha256': hashlib.sha256(path.read_bytes()).hexdigest()}
        if not args.content_only:
            exports[stem + '.pdf'] = build_pdf(ROOT / (stem + '.pdf'), rows, short)
    (HERE / 'resume-fragment.html').write_text(detailed_fragment(records(data)))
    (HERE / 'candidate-fragment.html').write_text(short_fragment(data))
    if not args.content_only:
        manifest = {'status': 'Unpublished candidate, not user-approved or deployed', 'source': 'resume/resume-content.json',
                    'source_sha256': hashlib.sha256(SOURCE.read_bytes()).hexdigest(), 'body_font_pt': {'one_page': 10, 'detailed': 10.5},
                    'checks': ['Sequential default and layout PDF extraction matched all source records', 'One-page PDF exactly one page; detailed PDF at most two pages', 'Approved PDF hashes unchanged'],
                    'limits': ['No ATS score, hiring prediction, new project execution or employment verification', data['snapshot_note']], 'artifacts': exports}
        (HERE / 'candidate-verification.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print('Generated candidate text, Markdown and fragments' + ('' if args.content_only else '; PDFs passed extraction/order/page checks'))


if __name__ == '__main__':
    main()
