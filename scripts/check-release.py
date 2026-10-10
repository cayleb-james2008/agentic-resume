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
p=Page();p.feed((R/'index.html').read_text());assert len(p.ids)==len(set(p.ids))
for ref in p.refs:
 u=urlparse(ref)
 if u.scheme or ref.startswith('#'):continue
 assert (R/unquote(u.path)).is_file(),ref
 assert not u.path.startswith('/'),ref
for f in (R/'remake').glob('*.css'):
 for url in re.findall(r'url\([\"\']?([^\)\"\']+)',f.read_text()):
  if not url.startswith('data:'):assert (f.parent/url.split('?')[0]).is_file(),url
frames=0
for name in ('mofu','pip','folio','loam'):
 m=json.loads((R/'characters'/name/'asset-manifest.json').read_text())
 for seq in m['states'].values():
  for frame in seq['frames']:
   data=(R/'characters'/name/frame['file']).read_bytes();assert hashlib.sha256(data).hexdigest()==frame['sha256'];frames+=1
for file,record in json.loads((R/'resume/approved-verification.json').read_text())['artifacts'].items():
 assert hashlib.sha256((R/file).read_bytes()).hexdigest()==record['sha256']
 info=subprocess.check_output(['pdfinfo',str(R/file)],text=True)
 assert int(re.search(r'Pages:\s+(\d+)',info).group(1))==record['pages']
 assert re.search(r'Encrypted:\s+no',info)
assert 'id="journey-progress"' not in (R/'index.html').read_text()
print(json.dumps({'passed':True,'uniqueIds':len(p.ids),'references':len(p.refs),'approvedPngFrames':frames,'pdfPages':[1,2],'deploymentPath':'/agentic-resume/'}))
