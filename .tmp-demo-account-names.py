from pathlib import Path

root = Path('apps/stb')
replacements = {
    'Sarah Smith': 'Sarah',
    'Marcus Reed': 'Tom',
    'Elena Torres': 'Dick',
    'Jordan Lee': 'Harry',
}
counts = {old: 0 for old in replacements}
for path in root.rglob('*'):
    if not path.is_file() or path.suffix not in {'.mjs', '.js', '.html', '.css', '.md', '.json'}:
        continue
    text = path.read_text()
    updated = text
    for old, new in replacements.items():
        n = updated.count(old)
        if n:
            counts[old] += n
            updated = updated.replace(old, new)
    if updated != text:
        path.write_text(updated)

for old, count in counts.items():
    if count < 1:
        raise SystemExit(f'expected at least one occurrence of {old!r}')

for path in root.rglob('*'):
    if not path.is_file() or path.suffix not in {'.mjs', '.js', '.html', '.css', '.md', '.json'}:
        continue
    text = path.read_text()
    for old in replacements:
        if old in text:
            raise SystemExit(f'stale demo name {old!r} remains in {path}')

print(counts)
