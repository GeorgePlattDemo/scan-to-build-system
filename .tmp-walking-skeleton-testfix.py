from pathlib import Path

path = Path('apps/stb/test/unit/entry.test.mjs')
text = path.read_text()

def replace_once(old, new, label):
    global text
    count = text.count(old)
    assert count == 1, f'{label}: expected 1, found {count}'
    text = text.replace(old, new, 1)

replace_once(
    "'Reference demonstration. Ordering, physical fabrication, and pickup notifications are not available in this build.'",
    "'Reference demonstration. Account, order and payment screens are synthetic. No real charge, fabrication or pickup occurs in this build.'",
    'reference demonstration expectation',
)
replace_once(
    "assert.equal(COPY.beginHeading, 'Projects');",
    "assert.equal(COPY.beginHeading, 'My Projects');",
    'my projects heading expectation',
)
replace_once(
    "assert.equal(PRIMARY_PAGES[0].label, 'Projects');",
    "assert.equal(PRIMARY_PAGES[0].label, 'My Projects');",
    'my projects primary label expectation',
)

path.write_text(text)
print('walking skeleton contract expectations updated')
