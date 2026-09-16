from pathlib import Path

ROOT = Path('.')


def read(path):
    return (ROOT / path).read_text()


def write(path, text):
    (ROOT / path).write_text(text)


def replace_once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise SystemExit(f'{label}: expected exactly one anchor, found {count}')
    return text.replace(old, new, 1)

# Keep the account chooser in the real keyboard order instead of teaching the
# product to skip it merely to preserve the old NEXT-button tab position.
path = 'apps/stb/test/browser/entry.spec.mjs'
text = read(path)
old = """  await expect(page.locator('#screen-heading')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: COPY.next })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: COPY.back })).toBeFocused();
"""
new = """  await expect(page.locator('#screen-heading')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('[data-orientation-account]')).toBeFocused();
  await page.keyboard.press('ArrowDown');
  for (let index = 0; index < 7; index += 1) {
    await page.keyboard.press('Tab');
  }
  await expect(page.getByRole('button', { name: COPY.next })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: COPY.back })).toBeFocused();
"""
text = replace_once(text, old, new, 'entry keyboard first orientation')
old = """  await expect(page.locator('#screen-heading')).toBeFocused();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-screen=\"begin\"]')).toBeVisible();
"""
new = """  await expect(page.locator('#screen-heading')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('[data-orientation-account]')).toBeFocused();
  for (let index = 0; index < 7; index += 1) {
    await page.keyboard.press('Tab');
  }
  await expect(page.getByRole('button', { name: COPY.next })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-screen=\"begin\"]')).toBeVisible();
"""
text = replace_once(text, old, new, 'entry keyboard returning orientation')
text = text.replace(
    "test('B1-08 keyboard-only actor selection, Back, reselect, and NEXT'",
    "test('B1-08 keyboard-only actor selection, account choice, Back, reselect, and My Projects'",
    1,
)
write(path, text)

# The account switcher is a real control but must not widen a phone viewport.
path = 'apps/stb/browser/styles.css'
text = read(path)
old = """.utility-nav {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}
"""
new = """.utility-nav {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 1rem;
}

.account-switcher {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
  max-width: 100%;
}

.account-switcher .hint {
  margin: 0;
  white-space: nowrap;
}

.account-switcher select,
.orientation-account select {
  font: inherit;
  min-width: 0;
  max-width: 100%;
}

@media (max-width: 40rem) {
  .account-switcher {
    flex: 1 1 100%;
    width: 100%;
  }

  .account-switcher select {
    flex: 1 1 auto;
    width: 100%;
  }
}
"""
text = replace_once(text, old, new, 'responsive account switcher')
write(path, text)

# The vertical keyboard test must cross the same real account chooser before
# OPEN MY PROJECTS. This is the same user-visible order proved by entry.spec.
path = 'apps/stb/test/vertical/v8-authority-a11y.spec.mjs'
text = read(path)
old = """  await expect(page.locator('#screen-heading')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: COPY.next })).toBeFocused();
  await page.keyboard.press('Enter');
"""
new = """  await expect(page.locator('#screen-heading')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('[data-orientation-account]')).toBeFocused();
  for (let index = 0; index < 7; index += 1) {
    await page.keyboard.press('Tab');
  }
  await expect(page.getByRole('button', { name: COPY.next })).toBeFocused();
  await page.keyboard.press('Enter');
"""
text = replace_once(text, old, new, 'vertical keyboard account chooser')
write(path, text)

print('multi-account keyboard and narrow-layout reconciliation applied')
