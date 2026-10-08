#!/usr/bin/env python3
"""Build the homepage demos from local copies of the app repos.

Usage (from the root of this repo):

    python3 tools/build-demos.py --open-loops ../open-loops --morning-brief ../morning-brief

Pass one or both. For each app this:

  1. copies the app's page to demos/<app>/index.html with these changes:
       - the Supabase CDN script is removed (the demo layer stands in for it)
       - demo-config.js and the demo layer load first in <head>
       - the manifest and icon links are dropped (nothing to install here)
       - a noindex tag is added, so search engines skip the copy
       - demo-fixes.css is linked, if that file exists in the demo folder
  2. copies the files the page loads by relative path (scripts, data, audio,
     images, fonts, and any other .html page it links to). The service
     worker and the manifest are skipped.

It never overwrites demo-config.js, demo-fixes.css or demos/demo-layer.js.
Run it again whenever an app changes, then commit the demos folder.

Python 3.8+, standard library only.
"""
import argparse
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
APPS = {
    'open-loops': 'open-loops.html',
    'morning-brief': 'morning-brief.html',
}
KEEP = {'demo-config.js', 'demo-layer.js', 'demo-fixes.css', 'index.html'}
ASSET = re.compile(r'\.(js|json|mp3|ogg|wav|m4a|png|jpe?g|gif|svg|webp|ico|css|woff2?)$', re.I)
SKIP = re.compile(r'(^|[-_.])sw\.js$|manifest[^/]*\.json$|^package(-lock)?\.json$', re.I)
SUPABASE_CDN = re.compile(
    r'<script[^>]*src="https://cdn\.jsdelivr\.net/npm/@supabase/supabase-js[^"]*"[^>]*>\s*</script>\s*', re.S)


def build(app, src, layer_path):
    src = Path(src).expanduser().resolve()
    page = src / APPS[app]
    if not page.exists():
        sys.exit(f'{app}: could not find {page}')
    out = ROOT / 'demos' / app
    out.mkdir(parents=True, exist_ok=True)

    html = page.read_text(encoding='utf-8')
    html, n = SUPABASE_CDN.subn('', html)
    if n != 1:
        print(f'  note: expected one Supabase script tag in {page.name}, removed {n}')
    html = re.sub(r'<link rel="manifest"[^>]*>\s*', '', html)
    html = re.sub(r'<link rel="(?:icon|apple-touch-icon)"[^>]*>\s*', '', html)

    i = html.find('<head>')
    if i < 0:
        sys.exit(f'{app}: no <head> tag in {page.name}')
    i += len('<head>')
    # keep <meta charset> first; the demo scripts go right after it
    m = re.compile(r'<meta charset[^>]*>', re.I).search(html, i, i + 2000)
    if m:
        i = m.end()
    head = ('\n<meta name="robots" content="noindex">'
            '\n<!-- Auxila demo mode: these load before anything else. See README. -->'
            '\n<script src="demo-config.js"></script>'
            f'\n<script src="{layer_path}"></script>\n')
    html = html[:i] + head + html[i:]
    if (out / 'demo-fixes.css').exists():
        j = html.find('</head>')
        html = html[:j] + '<link rel="stylesheet" href="demo-fixes.css">\n' + html[j:]
    (out / 'index.html').write_text(html, encoding='utf-8')

    copied = []
    for f in sorted(src.iterdir()):
        if not f.is_file() or f.name in KEEP or f.name == page.name or SKIP.search(f.name):
            continue
        linked_page = f.suffix.lower() == '.html' and f.name in html
        if ASSET.search(f.name) or linked_page:
            shutil.copy2(f, out / f.name)
            copied.append(f.name)

    for needed in ('demo-config.js',):
        if not (out / needed).exists():
            print(f'  warning: demos/{app}/{needed} is missing; the demo will not start without it')
    print(f'{app}: wrote demos/{app}/index.html and copied {len(copied)} files')
    for name in copied:
        print(f'    {name}')


def main():
    ap = argparse.ArgumentParser(description='Build the Auxila homepage demos from the app repos.')
    ap.add_argument('--open-loops', help='path to a local copy of the open-loops repo')
    ap.add_argument('--morning-brief', help='path to a local copy of the morning-brief repo')
    ap.add_argument('--layer-path', default='../demo-layer.js',
                    help='where the page loads the demo layer from (default: ../demo-layer.js)')
    a = ap.parse_args()
    if not (a.open_loops or a.morning_brief):
        ap.error('pass --open-loops and/or --morning-brief')
    if a.open_loops:
        build('open-loops', a.open_loops, a.layer_path)
    if a.morning_brief:
        build('morning-brief', a.morning_brief, a.layer_path)


if __name__ == '__main__':
    main()
