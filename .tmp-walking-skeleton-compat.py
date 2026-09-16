from pathlib import Path

ROOT = Path('apps/stb')

def read(rel):
    return (ROOT / rel).read_text()

def write(rel, text):
    (ROOT / rel).write_text(text)

def replace_once(text, old, new, label):
    count = text.count(old)
    assert count == 1, f'{label}: expected 1, found {count}'
    return text.replace(old, new, 1)

# The Page-2 working surface was renamed from hub to workspace by the chassis.
# Preserve the existing narrative and open-door layers on that same surface.
p = 'browser/ui/narrative.mjs'
s = read(p)
s = replace_once(
    s,
    "else if (name === 'hub' || name === 'questions') decoratePage2(screen);",
    "else if (name === 'hub' || name === 'workspace' || name === 'questions') decoratePage2(screen);",
    'narrative workspace compatibility',
)
write(p, s)

p = 'browser/ui/open-door.mjs'
s = read(p)
s = replace_once(
    s,
    "const screen = root.querySelector('[data-screen=\"hub\"][data-child=\"board\"], [data-screen=\"questions\"][data-child=\"board\"]');",
    "const screen = root.querySelector('[data-screen=\"hub\"][data-child=\"board\"], [data-screen=\"workspace\"][data-child=\"board\"], [data-screen=\"questions\"][data-child=\"board\"]');",
    'board workspace compatibility',
)
s = replace_once(
    s,
    "const screen = root.querySelector('[data-screen=\"hub\"], [data-screen=\"questions\"]');",
    "const screen = root.querySelector('[data-screen=\"hub\"], [data-screen=\"workspace\"], [data-screen=\"questions\"]');",
    'open-door workspace compatibility',
)
write(p, s)

# Common-shell screens carry data-screen on both the shell and the main page.
# The walking-skeleton proof targets the actual page, not both matching nodes.
p = 'test/browser/walking-skeleton.spec.mjs'
s = read(p)
s = s.replace("page.locator('[data-screen=\"account\"]')", "page.locator('main[data-screen=\"account\"]')")
s = s.replace("page.locator('[data-screen=\"result\"]')", "page.locator('main[data-screen=\"result\"]')")
s = s.replace("page.locator('[data-screen=\"order\"]')", "page.locator('main[data-screen=\"order\"]')")
write(p, s)

print('walking skeleton workspace compatibility applied')
