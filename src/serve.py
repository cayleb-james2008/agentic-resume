"""Local preview with Vercel-style clean URLs: python3 src/serve.py [port]"""
import http.server, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
class H(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k): super().__init__(*a, directory=ROOT, **k)
    def send_head(self):
        path = self.path.split('?')[0].split('#')[0]
        if path != '/' and not os.path.splitext(path)[1] and os.path.isfile(os.path.join(ROOT, path.lstrip('/') + '.html')):
            self.path = path + '.html'
        elif not os.path.exists(os.path.join(ROOT, path.lstrip('/'))):
            self.path = '/404.html'; r = super().send_head()
            return r
        return super().send_head()
http.server.ThreadingHTTPServer(('127.0.0.1', int(sys.argv[1]) if len(sys.argv) > 1 else 8765), H).serve_forever()
