import { expect, test } from '@playwright/test';

import { ACTORS, COPY, DEMO_ACCOUNTS } from '../../shared/contracts.mjs';

async function enterThrough(page, actorId, accountId) {
  await page.goto('/');
  await page.getByRole('button', { name: ACTORS[actorId].label }).click();
  const picker = page.locator('[data-orientation-account]');
  await expect(picker).toBeVisible();
  await picker.selectOption(accountId);
  await page.getByRole('button', { name: COPY.next }).click();
  await expect(page.getByRole('heading', { name: COPY.beginHeading })).toBeVisible();
  await expect(page.locator('[data-account-switcher]')).toHaveValue(accountId);
}

async function createOwnProject(page) {
  await page.getByRole('button', { name: COPY.startOwn }).click();
  const workstreams = page.locator('main[data-screen="workstreams"]');
  await expect(workstreams).toBeVisible();
  const localRecordId = await workstreams.getAttribute('data-local-record-id');
  expect(localRecordId).toBeTruthy();
  await page.getByRole('button', { name: COPY.backToProjects }).click();
  await expect(page.getByRole('heading', { name: COPY.beginHeading })).toBeVisible();
  return localRecordId;
}

async function expectOnlyProject(page, localRecordId) {
  const rows = page.locator('[data-project-list] [data-action="resume-project"]');
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toHaveAttribute('data-local-record-id', localRecordId);
}

async function ownersByLocalRecord(page) {
  return page.evaluate(async () => {
    const request = indexedDB.open('stb-app-v1');
    const database = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const tx = database.transaction('projects', 'readonly');
    const getAll = tx.objectStore('projects').getAll();
    const projects = await new Promise((resolve, reject) => {
      getAll.onsuccess = () => resolve(getAll.result ?? []);
      getAll.onerror = () => reject(getAll.error);
    });
    database.close();
    return Object.fromEntries(projects.map((project) => [project.localRecordId, project.ownerAccountId ?? null]));
  });
}

test('four users exercise all three doors while My Projects stays account-scoped', async ({ page }) => {
  const [user1, user2, user3] = DEMO_ACCOUNTS;

  await enterThrough(page, 'new', user1.accountId);
  const user1Project = await createOwnProject(page);
  await expectOnlyProject(page, user1Project);

  await enterThrough(page, 'returning', user2.accountId);
  await expect(page.locator('[data-empty-saved="true"]')).toBeVisible();
  const user2Project = await createOwnProject(page);
  await expectOnlyProject(page, user2Project);

  await enterThrough(page, 'professional', user3.accountId);
  await expect(page.locator('[data-empty-saved="true"]')).toBeVisible();
  const user3Project = await createOwnProject(page);
  await expectOnlyProject(page, user3Project);

  // User 4 proves account creation is available through an existing door rather than a fourth door.
  await page.goto('/');
  await page.getByRole('button', { name: ACTORS.returning.label }).click();
  await page.locator('[data-account-field="name"]').fill('Harry');
  await page.locator('[data-account-field="addressLine1"]').fill('321 Fourth Street');
  await page.locator('[data-account-field="city"]').fill('Greensboro');
  await page.locator('[data-account-field="region"]').fill('NC');
  await page.getByRole('button', { name: COPY.accountAddUser }).click();
  await expect(page.getByRole('heading', { name: COPY.beginHeading })).toBeVisible();
  const user4AccountId = await page.locator('[data-account-switcher]').inputValue();
  expect(user4AccountId).toMatch(/^ACCT-DEMO-/);
  await expect(page.locator('[data-empty-saved="true"]')).toBeVisible();
  const user4Project = await createOwnProject(page);
  await expectOnlyProject(page, user4Project);

  const expected = [
    [user1.accountId, user1Project],
    [user2.accountId, user2Project],
    [user3.accountId, user3Project],
    [user4AccountId, user4Project],
  ];
  for (const [accountId, projectId] of expected) {
    await page.locator('[data-account-switcher]').selectOption(accountId);
    await expect(page.getByRole('heading', { name: COPY.beginHeading })).toBeVisible();
    await expectOnlyProject(page, projectId);
  }

  const owners = await ownersByLocalRecord(page);
  expect(owners[user1Project]).toBe(user1.accountId);
  expect(owners[user2Project]).toBe(user2.accountId);
  expect(owners[user3Project]).toBe(user3.accountId);
  expect(owners[user4Project]).toBe(user4AccountId);

  await page.locator('[data-utility-nav="home"]').click();
  const library = page.locator('[data-project-library="true"]');
  await expect(library).toBeVisible();
  await expect(library).toContainText('Alcove shelf blanks');
  await expect(library).not.toContainText('Sarah');
  await expect(library).not.toContainText('Tom');
  await expect(library).not.toContainText('Dick');
  await expect(library).not.toContainText('Harry');
});


test('door choice does not become account identity or change an owned project', async ({ page }) => {
  const user1 = DEMO_ACCOUNTS[0];
  await enterThrough(page, 'new', user1.accountId);
  const projectId = await createOwnProject(page);

  for (const actorId of ['returning', 'professional', 'new']) {
    await enterThrough(page, actorId, user1.accountId);
    await expectOnlyProject(page, projectId);
  }
});
