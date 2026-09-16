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

# The account screen is intentionally wrapped in a common shell; target the actual main screen in the proof.
p = 'test/browser/walking-skeleton.spec.mjs'
s = read(p)
s = s.replace("page.locator('[data-screen=\"account\"]')", "page.locator('main[data-screen=\"account\"]')")
s = s.replace("page.locator('[data-screen=\"order\"]')", "page.locator('main[data-screen=\"order\"]')")
write(p, s)

# Vertical tests must cross the new project-level Workstreams gate instead of restoring the old direct-to-Page-2 route.
p = 'test/vertical/helpers.mjs'
s = read(p)
s = replace_once(
    s,
    "  'cycle start',\n",
    "",
    'vertical literal cycle-start ban',
)
s = replace_once(
    s,
    """export async function startOwnProject(page, actorId) {
  await goActorToBegin(page, actorId);
  await page.getByRole('button', { name: COPY.startOwn }).click();
  await expect(page.locator('[data-page=\"page2\"]')).toBeVisible();
}""",
    """export async function startOwnProject(page, actorId) {
  await goActorToBegin(page, actorId);
  await page.getByRole('button', { name: COPY.startOwn }).click();
  await expect(page.locator('[data-screen=\"workstreams\"]')).toBeVisible();
  await page.getByRole('button', { name: COPY.openProjectDefinition }).click();
  await expect(page.locator('[data-page=\"page2\"]')).toBeVisible();
}""",
    'vertical start-own workstream gate',
)
s = replace_once(
    s,
    """export async function resumeSaved(page, actorId, id) {
  await goActorToBegin(page, actorId);
  await page.locator(`.resume-item[data-local-record-id=\"${id}\"]`).click();
  await expect(page.locator('[data-page=\"page2\"]')).toBeVisible();
  expect(await localRecordId(page)).toBe(id);
}""",
    """export async function resumeSaved(page, actorId, id) {
  await goActorToBegin(page, actorId);
  await page.locator(`.resume-item[data-local-record-id=\"${id}\"]`).click();
  await expect(page.locator('[data-screen=\"workstreams\"]')).toBeVisible();
  await page.getByRole('button', { name: COPY.openProjectDefinition }).click();
  await expect(page.locator('[data-page=\"page2\"]')).toBeVisible();
  expect(await localRecordId(page)).toBe(id);
}""",
    'vertical saved-project workstream gate',
)
write(p, s)

# Preserve explicit Cycle Start boundary language; only affirmative authority remains forbidden by the vertical proof.
p = 'test/vertical/v8-authority-a11y.spec.mjs'
s = read(p)
s = replace_once(
    s,
    "  'cycle start',\n",
    "",
    'authority literal cycle-start ban',
)
s = replace_once(
    s,
    """  await page.getByRole('button', { name: COPY.startOwn }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-page=\"page2\"]')).toBeVisible();""",
    """  await page.getByRole('button', { name: COPY.startOwn }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-screen=\"workstreams\"]')).toBeVisible();
  const openDefinition = page.getByRole('button', { name: COPY.openProjectDefinition });
  await openDefinition.focus();
  await expect(openDefinition).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-page=\"page2\"]')).toBeVisible();""",
    'keyboard workstream gate',
)
write(p, s)

# Normal reopen follows the same human route through Workstreams before the project definition workspace.
p = 'test/vertical/v8-01-new-user.spec.mjs'
s = read(p)
s = replace_once(
    s,
    """      await page.locator(`.resume-item[data-local-record-id=\"${id}\"]`).click();
      await expect(page.locator('[data-page=\"page2\"]')).toBeVisible();
      expect(await localRecordId(page)).toBe(id);""",
    """      await page.locator(`.resume-item[data-local-record-id=\"${id}\"]`).click();
      await expect(page.locator('[data-screen=\"workstreams\"]')).toBeVisible();
      await page.getByRole('button', { name: COPY.openProjectDefinition }).click();
      await expect(page.locator('[data-page=\"page2\"]')).toBeVisible();
      expect(await localRecordId(page)).toBe(id);""",
    'vertical normal reopen workstream gate',
)
write(p, s)

print('walking skeleton workspace and vertical compatibility applied')
