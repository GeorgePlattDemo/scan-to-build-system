from pathlib import Path

ROOT = Path('apps/stb')

def read(rel):
    return (ROOT / rel).read_text()

def write(rel, text):
    (ROOT / rel).write_text(text)

def replace_once(text, old, new, label):
    n = text.count(old)
    assert n == 1, f'{label}: expected 1, found {n}'
    return text.replace(old, new, 1)

# Avoid accessible-name collision between H1 Projects and H2 Your projects.
p = 'shared/contracts.mjs'
s = read(p)
s = replace_once(s, "resumeHeading: 'Your projects',", "resumeHeading: 'Project list',", 'project-list heading')

# Preserve old explicit child deep links while normal project opens stop at the new workstream gate.
old = """  const params = new URLSearchParams(location.search);
  const viewParam = params.get('view');
  const view = PROJECT_VIEWS.includes(viewParam) ? viewParam : 'hub';
  const child = params.get('child');
  const workstreamParam = params.get('workstream');"""
new = """  const params = new URLSearchParams(location.search);
  const viewParam = params.get('view');
  const requestedView = PROJECT_VIEWS.includes(viewParam) ? viewParam : 'hub';
  const child = params.get('child');
  const view = requestedView === 'hub' && child ? 'workspace' : requestedView;
  const workstreamParam = params.get('workstream');"""
s = replace_once(s, old, new, 'legacy child route compatibility')
write(p, s)

# Workspace is a real screen name now; do not keep calling it hub in the DOM.
p = 'browser/ui/panels.mjs'
s = read(p)
s = replace_once(s, "'data-screen': isQuestions ? 'questions' : 'hub',", "'data-screen': isQuestions ? 'questions' : 'workspace',", 'workspace data-screen')
write(p, s)

# Archive resume is a normal human resume: stop at workstreams, then choose definition for this unassigned project.
p = 'test/browser/archive.spec.mjs'
s = read(p)
old = """  await page.getByRole('button', { name: COPY.recordResume }).click();
  await expect(page.locator('[data-page=\"page2\"]')).toBeVisible();
  expect(await localRecordId(page)).toBe(id);"""
new = """  await page.getByRole('button', { name: COPY.recordResume }).click();
  await expect(page.locator('[data-screen=\"workstreams\"]')).toBeVisible();
  await page.getByRole('button', { name: COPY.openProjectDefinition }).click();
  await expect(page.locator('[data-page=\"page2\"]')).toBeVisible();
  expect(await localRecordId(page)).toBe(id);"""
s = replace_once(s, old, new, 'archive record resume gate')
write(p, s)

# Page 1 switch-after-creation must intentionally reopen the start controls.
p = 'test/browser/page1.spec.mjs'
s = read(p)
old = """  await page.getByRole('button', { name: COPY.back }).click();
  await page.getByRole('button', { name: COPY.chooseMapped }).click();"""
new = """  await page.getByRole('button', { name: COPY.back }).click();
  await page.getByRole('button', { name: COPY.startAnotherProject }).click();
  await page.getByRole('button', { name: COPY.chooseMapped }).click();"""
# This sequence should occur only in the switch test after the chassis patch.
assert s.count(old) >= 1
s = s.replace(old, new, 1)
# After keep-and-start, mapped project stops at gate before questions.
old2 = """  await page.getByRole('button', { name: COPY.keepAndStart }).click();
  await expect(page.locator('[data-screen=\"workstreams\"]')).toBeVisible();"""
if old2 not in s:
    old2 = """  await page.getByRole('button', { name: COPY.keepAndStart }).click();
  await expect(page.locator('[data-screen=\"questions\"]')).toBeVisible();"""
    new2 = """  await page.getByRole('button', { name: COPY.keepAndStart }).click();
  await expect(page.locator('[data-screen=\"workstreams\"]')).toBeVisible();"""
    s = replace_once(s, old2, new2, 'switch mapped gate')
write(p, s)

# Existing Page 2 actor-priority test resumes an own project; cross the common unassigned-project gate first.
p = 'test/browser/page2.spec.mjs'
s = read(p)
old = """  await page.locator('.resume-item').first().click();
  await expect(page.locator('[data-page=\"page2\"]')).toBeVisible();"""
new = """  await page.locator('.resume-item').first().click();
  await expect(page.locator('[data-screen=\"workstreams\"]')).toBeVisible();
  await page.getByRole('button', { name: COPY.openProjectDefinition }).click();
  await expect(page.locator('[data-page=\"page2\"]')).toBeVisible();"""
s = replace_once(s, old, new, 'page2 resume gate')
write(p, s)

# Vertical record resume should follow the same human route.
p = 'test/vertical/v8-01-new-user.spec.mjs'
s = read(p)
old = """      await page.getByRole('button', { name: COPY.recordResume }).click();
      await expect(page.locator('[data-page=\"page2\"]')).toBeVisible();
      await openBoardChild(page);"""
new = """      await page.getByRole('button', { name: COPY.recordResume }).click();
      await expect(page.locator('[data-screen=\"workstreams\"]')).toBeVisible();
      await page.getByRole('button', { name: COPY.openProjectDefinition }).click();
      await expect(page.locator('[data-page=\"page2\"]')).toBeVisible();
      await openBoardChild(page);"""
if old in s:
    s = replace_once(s, old, new, 'vertical record resume gate')
write(p, s)

# Contract test: explicit old hub+child link remains usable as workspace deep link.
p = 'test/unit/entry.test.mjs'
s = read(p)
anchor = """  const workspace = screenFromLocation({
    pathname: '/project',
    search: '?id=local-1&view=workspace',
  });
  assert.equal(workspace.view, 'workspace');
});"""
new = """  const workspace = screenFromLocation({
    pathname: '/project',
    search: '?id=local-1&view=workspace',
  });
  assert.equal(workspace.view, 'workspace');
  const legacyChild = screenFromLocation({
    pathname: '/project',
    search: '?id=local-1&view=hub&child=board',
  });
  assert.equal(legacyChild.view, 'workspace');
  assert.equal(legacyChild.child, 'board');
});"""
s = replace_once(s, anchor, new, 'legacy child unit test')
write(p, s)

print('project chassis postfix applied')
