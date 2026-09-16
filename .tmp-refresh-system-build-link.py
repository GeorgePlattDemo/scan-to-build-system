from pathlib import Path

path = Path('README.md')
text = path.read_text()
old = 'https://georgeplattdemo.github.io/scan-to-build-review/system-build-current.html?v=303bcc6'
new = 'https://georgeplattdemo.github.io/scan-to-build-review/system-build-current.html?v=8d8a9dd'
if text.count(old) != 1:
    raise SystemExit(f'expected one old System Build URL, found {text.count(old)}')
text = text.replace(old, new, 1)
path.write_text(text)
print('System Build cache key refreshed')
