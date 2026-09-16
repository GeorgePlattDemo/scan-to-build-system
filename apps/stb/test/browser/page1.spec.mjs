import { expect, test } from '@playwright/test';

import {
  ACTORS,
  CLASS_REFERENCES,
  COPY,
  ROUTES,
} from '../../shared/contracts.mjs';
import { repoCall, requireOk } from '../helpers/browser-repo.mjs';

async function openBegin(page, actorId = 'new') {
  await page.goto('/');
  await page.getByRole('button', { name: ACTORS[actorId].label }).click();
  await page.getByRole('button', { name: COPY.next }).click();
  await expect(page.locator('[data-screen="begin"]')).toBeVisible();
}

test('P1-empty truthful saved-project state', async ({ page }) => {
  await openBegin(page, 'returning');
  await expect(page.getByRole('heading', { name: COPY.beginHeading })).toBeVisible();
  await expect(page.getByText(COPY.emptySaved, { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: COPY.startOwn })).toBeVisible();
  await expect(page.getByRole('button', { name: COPY.chooseMapped })).toBeVisible();
  const saved = requireOk(await repoCall(page, 'listSaved'), 'list');
  expect(saved).toHaveLength(0);
});

test('P1-02 own start creates one project and opens the hub handoff', async ({ page }) => {
  await openBegin(page);
  await page.getByRole('button', { name: COPY.startOwn }).click();
  await expect(page.locator('[data-screen="workstreams"]')).toBeVisible();
  await expect(page.getByRole('heading', { name: COPY.workstreamsHeading })).toBeVisible();
  await expect(page.getByRole('button', { name: COPY.openProjectDefinition })).toBeVisible();
  expect(page.url()).toContain(`${ROUTES.project}?`);
  expect(page.url()).toContain('view=hub');
  const saved = requireOk(await repoCall(page, 'listSaved'), 'list');
  expect(saved).toHaveLength(1);
  expect(saved[0].entryMode).toBe('own');
  expect(saved[0].classId).toBeNull();
  expect(saved[0].projectId).not.toBe(saved[0].localRecordId);
});

test('P1-02 mapped start creates one project and opens bounded-question context', async ({
  page,
}) => {
  await openBegin(page);
  await page.getByRole('button', { name: COPY.chooseMapped }).click();
  await expect(page.getByRole('button', { name: CLASS_REFERENCES[0].label })).toBeVisible();
  await expect(page.getByText(COPY.mappedStatus, { exact: true })).toHaveCount(CLASS_REFERENCES.length);
  const before = requireOk(await repoCall(page, 'listSaved'), 'before');
  expect(before).toHaveLength(0);
  await page.getByRole('button', { name: CLASS_REFERENCES[0].label }).click();
  await expect(page.locator('[data-screen="workstreams"]')).toBeVisible();
  await expect(page.locator('[data-workstream-card="dimensional"][data-required="true"]')).toBeVisible();
  await expect(page.locator('[data-workstream-card="sheet"][data-required="false"]')).toBeVisible();
  await page.getByRole('button', { name: COPY.openDimensionalWork }).click();
  await expect(page.locator('[data-screen="questions"]')).toBeVisible();
  await expect(page.getByRole('heading', { name: COPY.questionsHeading })).toBeVisible();
  await expect(page.locator('[data-project-configurator="alcove-shelf-blanks"]')).toBeVisible();
  expect(page.url()).toContain('view=questions');
  const saved = requireOk(await repoCall(page, 'listSaved'), 'after');
  expect(saved).toHaveLength(1);
  expect(saved[0].classId).toBe('alcove-shelf-blanks');
  expect(saved[0].entryMode).toBe('mapped');
});

test('P1 picnic-table start reaches the registered shared configurator', async ({ page }) => {
  const picnic = CLASS_REFERENCES.find((entry) => entry.classId === 'classic-picnic-table-fixture');
  expect(picnic).toBeTruthy();

  await openBegin(page);
  await page.getByRole('button', { name: COPY.chooseMapped }).click();
  await expect(page.getByRole('button', { name: picnic.label })).toBeVisible();
  await page.getByRole('button', { name: picnic.label }).click();
  await expect(page.locator('[data-screen="workstreams"]')).toBeVisible();
  await page.getByRole('button', { name: COPY.openDimensionalWork }).click();

  await expect(page.locator('[data-screen="questions"]')).toBeVisible();
  await expect(page.getByRole('heading', { name: COPY.questionsHeading })).toBeVisible();
  await expect(page.locator('[data-project-configurator="classic-picnic-table-fixture"]')).toBeVisible();
  expect(page.url()).toContain('view=questions');

  const saved = requireOk(await repoCall(page, 'listSaved'), 'picnic');
  expect(saved).toHaveLength(1);
  expect(saved[0].classId).toBe('classic-picnic-table-fixture');
  expect(saved[0].entryMode).toBe('mapped');
});

test('P1-03 repeated own dispatch does not duplicate the project', async ({ page }) => {
  await openBegin(page);
  const own = page.getByRole('button', { name: COPY.startOwn });
  await Promise.all([own.click(), own.click()]);
  await expect(page.locator('[data-screen="workstreams"]')).toBeVisible();
  const saved = requireOk(await repoCall(page, 'listSaved'), 'list');
  expect(saved).toHaveLength(1);
});

test('P1-04 resume reopens the same incomplete project', async ({ page }) => {
  await openBegin(page);
  await page.getByRole('button', { name: COPY.startOwn }).click();
  await expect(page.locator('[data-screen="workstreams"]')).toBeVisible();
  const first = requireOk(await repoCall(page, 'listSaved'), 'created');
  await page.getByRole('button', { name: COPY.back }).click();
  await expect(page.locator('[data-screen="begin"]')).toBeVisible();
  await page.locator('.resume-item').first().click();
  await expect(page.locator('[data-screen="workstreams"]')).toBeVisible();
  const resumed = requireOk(await repoCall(page, 'listSaved'), 'resumed');
  expect(resumed).toHaveLength(1);
  expect(resumed[0].localRecordId).toBe(first[0].localRecordId);
  expect(resumed[0].projectId).toBe(first[0].projectId);
  expect(resumed[0].currentHead).toBe(first[0].currentHead);
  await page.reload();
  await expect(page.locator('[data-screen="workstreams"]')).toBeVisible();
  const afterReload = requireOk(await repoCall(page, 'listSaved'), 'reload');
  expect(afterReload[0].localRecordId).toBe(first[0].localRecordId);
  expect(afterReload[0].currentHead).toBe(first[0].currentHead);
});

test('P1-05 cancel before creation and switch after creation', async ({ page }) => {
  await openBegin(page);
  await page.getByRole('button', { name: COPY.chooseMapped }).click();
  await expect(page.getByRole('button', { name: CLASS_REFERENCES[0].label })).toBeVisible();
  expect(requireOk(await repoCall(page, 'listSaved'), 'expanded')).toHaveLength(0);
  await page.getByRole('button', { name: COPY.startOwn }).click();
  await expect(page.locator('[data-screen="workstreams"]')).toBeVisible();
  const first = requireOk(await repoCall(page, 'listSaved'), 'own');
  expect(first).toHaveLength(1);
  await page.getByRole('button', { name: COPY.back }).click();
  await page.getByRole('button', { name: COPY.startAnotherProject }).click();
  await page.getByRole('button', { name: COPY.chooseMapped }).click();
  await page.getByRole('button', { name: CLASS_REFERENCES[0].label }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: COPY.cancel }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  const cancelled = requireOk(await repoCall(page, 'listSaved'), 'cancelled');
  expect(cancelled).toHaveLength(1);
  expect(cancelled[0].localRecordId).toBe(first[0].localRecordId);
  expect(cancelled[0].entryMode).toBe('own');
  await page.getByRole('button', { name: COPY.chooseMapped }).click();
  await page.getByRole('button', { name: CLASS_REFERENCES[0].label }).click();
  await page.getByRole('button', { name: COPY.keepAndStart }).click();
  await expect(page.locator('[data-screen="workstreams"]')).toBeVisible();
  const both = requireOk(await repoCall(page, 'listSaved'), 'both');
  expect(both).toHaveLength(2);
  const original = both.find((project) => project.localRecordId === first[0].localRecordId);
  expect(original.entryMode).toBe('own');
  expect(original.classId).toBeNull();
  expect(original.currentHead).toBe(first[0].currentHead);
  expect(both.some((project) => project.entryMode === 'mapped')).toBe(true);
});

test('P1 all three actors reach the same Page 1 architecture', async ({ page }) => {
  for (const actorId of ['new', 'returning', 'professional']) {
    await openBegin(page, actorId);
    await expect(page.getByRole('heading', { name: COPY.beginHeading })).toBeVisible();
    await expect(page.getByRole('button', { name: COPY.startOwn })).toBeVisible();
    await expect(page.getByRole('button', { name: COPY.chooseMapped })).toBeVisible();
    await expect(page.locator('[data-shell="common"]')).toBeVisible();
    expect(requireOk(await repoCall(page, 'listSaved'), actorId)).toHaveLength(0);
  }
});

test('P1 saved project list is the common first door with D/S indicators and start-another control', async ({ page }) => {
  await openBegin(page);
  await page.getByRole('button', { name: COPY.chooseMapped }).click();
  await page.getByRole('button', { name: CLASS_REFERENCES[0].label }).click();
  await expect(page.locator('[data-screen="workstreams"]')).toBeVisible();
  await page.getByRole('button', { name: COPY.backToProjects }).click();
  await expect(page.locator('[data-project-list="true"]')).toBeVisible();
  const row = page.locator('.project-row').first();
  await expect(row.locator('[data-project-stream="dimensional"][data-required="true"]')).toBeVisible();
  await expect(row.locator('[data-project-stream="sheet"][data-required="false"]')).toBeVisible();
  await expect(page.getByRole('button', { name: COPY.startAnotherProject })).toBeVisible();
  await expect(page.getByRole('button', { name: COPY.startOwn })).toHaveCount(0);
  await page.getByRole('button', { name: COPY.startAnotherProject }).click();
  await expect(page.getByRole('button', { name: COPY.startOwn })).toBeVisible();
});

test('P1 keyboard can start own project from Begin', async ({ page }) => {
  await openBegin(page);
  await expect(page.locator('#screen-heading')).toBeFocused();
  await page.getByRole('button', { name: COPY.startOwn }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-screen="workstreams"]')).toBeVisible();
  await expect(page.locator('#screen-heading')).toBeFocused();
  expect(requireOk(await repoCall(page, 'listSaved'), 'keyboard')).toHaveLength(1);
});
