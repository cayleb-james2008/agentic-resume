from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse,unquote
import hashlib,json,re,subprocess
R=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.refs=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id'])
  self.refs.extend(a[k] for k in ('href','src') if k in a)
ids=refs=0
for page in ('index.html','resume.html','404.html','lab/index.html',*sorted(str(x.relative_to(R)) for x in (R/'projects').glob('*.html'))):
 p=Page();p.feed((R/page).read_text());assert len(p.ids)==len(set(p.ids)),page
 ids+=len(p.ids);refs+=len(p.refs)
 for ref in p.refs:
  u=urlparse(ref)
  if u.scheme or ref.startswith('#'):continue
  target=(R/page).parent/unquote(u.path)
  assert (target/'index.html' if u.path.endswith('/') or not u.path else target).is_file(),(page,ref)
  assert not u.path.startswith('/'),(page,ref)
for f in (R/'site/css').glob('*.css'):
 for url in re.findall(r'url\([\"\']?([^\)\"\']+)',f.read_text()):
  if not url.startswith(('data:','#')):assert (f.parent/url.split('?')[0]).is_file(),url
import sys
sys.path.insert(0,str(R/'scripts/home'))
import check_assets
assert check_assets.main(R,strict=False)==0,'check_assets'
for file,record in json.loads((R/'resume/approved-verification.json').read_text())['artifacts'].items():
 assert hashlib.sha256((R/file).read_bytes()).hexdigest()==record['sha256']
 info=subprocess.check_output(['pdfinfo',str(R/file)],text=True)
 assert int(re.search(r'Pages:\s+(\d+)',info).group(1))==record['pages']
 assert re.search(r'Encrypted:\s+no',info)
import runpy
builder=runpy.run_path(str(R/'resume/build_resume.py'))
source=json.loads((R/'resume/resume-content.json').read_text())
candidate=json.loads((R/'resume/candidate-verification.json').read_text())
assert candidate['source_sha256']==hashlib.sha256((R/candidate['source']).read_bytes()).hexdigest()
for file,record in candidate['artifacts'].items():
 assert hashlib.sha256((R/file).read_bytes()).hexdigest()==record['sha256'],file
 if file.endswith('.pdf'):
  short='one-page' in file
  actual=builder['check_pdf'](R/file,builder['records'](source,short),1 if short else 2,1 if short else None)
  assert actual==record
for short,stem,md in [(True,'Cayleb-James-polished-one-page','one-page.md'),(False,'Cayleb-James-polished-resume','resume.md')]:
 rows=builder['records'](source,short)
 assert (R/(stem+'.txt')).read_text()==builder['text_export'](rows)
 assert (R/'resume'/md).read_text()==builder['markdown_export'](rows)
assert (R/'resume/candidate-fragment.html').read_text()==builder['short_fragment'](source)
print(json.dumps({'passed':True,'uniqueIds':ids,'references':refs,'approvedPdfPages':[1,2],'candidatePdfPages':[1,2],'candidateTextAndExtraction':True,'deploymentPath':'/agentic-resume/'}))
