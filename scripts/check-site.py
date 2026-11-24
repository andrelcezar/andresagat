import json
import re
import subprocess
from datetime import date
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
from xml.etree import ElementTree


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = 'https://andrelcezar.github.io/andresagat/'


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.links = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            assert attrs['id'] not in self.ids, f"ID duplicado: {attrs['id']}"
            self.ids.add(attrs['id'])
        for key in ('href', 'src'):
            if attrs.get(key):
                self.links.append(attrs[key])


pages = {}
for path in ROOT.glob('*.html'):
    source = path.read_text(encoding='utf-8')
    page = pages[path] = Page()
    page.feed(source)
    for script in re.findall(r'<script>(.*?)</script>', source, re.S):
        subprocess.run(['node', '--check'], input=script, text=True, check=True)

for path in (ROOT / 'assets').glob('*.js'):
    subprocess.run(['node', '--check', str(path)], check=True)

for path, page in pages.items():
    for link in page.links:
        if link.startswith(PUBLIC):
            link = link.removeprefix(PUBLIC)
        url = urlsplit(link)
        if url.scheme or url.netloc:
            continue
        target = (path.parent / unquote(url.path)).resolve() if url.path else path
        if target.is_dir():
            target /= 'index.html'
        assert target.is_file(), f'{path.name}: recurso ausente {link}'
        if url.fragment and target in pages:
            assert unquote(url.fragment) in pages[target].ids, f'{path.name}: âncora ausente {link}'

for item in json.loads((ROOT / 'posts.json').read_text(encoding='utf-8')):
    assert item['type'] in ('evento', 'novidade') and item['title'].strip()
    date.fromisoformat(item['createdAt'])
    if item['type'] == 'evento':
        date.fromisoformat(item['eventDate'])
    for field in ('image', 'link'):
        if item.get(field):
            url = urlsplit(item[field])
            assert url.scheme in ('', 'https')
            if not url.netloc:
                assert (ROOT / url.path).is_file(), f'Recurso do post ausente: {item[field]}'

for entry in ElementTree.parse(ROOT / 'sitemap.xml').findall('.//{*}loc'):
    assert entry.text.startswith(PUBLIC)
    target = ROOT / (entry.text.removeprefix(PUBLIC) or 'index.html')
    assert target in pages, f'Sitemap aponta para página ausente: {entry.text}'

assert not (ROOT / 'blog_adm.html').exists(), 'Painel antigo no deploy'
print('Páginas, referências internas, scripts, blog e sitemap verificados.')
