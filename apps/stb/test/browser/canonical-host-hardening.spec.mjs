import { expect, test } from '@playwright/test';

import { ACTORS, COPY } from '../../shared/contracts.mjs';
import { repoCall, requireOk } from '../helpers/browser-repo.mjs';

const CANONICAL = [
  ['start-own', 'REVIEW_START_OWN_V011', 'review-child'],
  ['outdoor', 'REVIEW_OUTDOOR_BUILD_V01', 'review-child'],
  ['alcove', 'REVIEW_ALCOVE_INSERT_CURRENT', 'review-child'],
  ['window-seat', 'REVIEW_WINDOW_SEAT_V074', 'review-child'],
  ['s001', 'S001_CENTERED_ARCHED_SHEET_V0', 'system-native'],
];

async function openLibrary(page) {
  await page.goto('/');
  await page.getByRole('button', { name: ACTORS.new.label }).click();
  await page.getByRole('button', { name: COPY.next }).click();
  await expect(page.locator('[data-canonical-project-library="true"]')).toBeVisible();
}

async function backToLibrary(page) {
  await page.locator('[data-action="back-to-begin"]:visible').first().click();
  await expect(page.locator('[data-canonical-project-library="true"]')).toBeVisible();
}

async function startCanonical(page, projectId) {
  await page.locator(
    `[data-action="start-canonical-project"][data-canonical-project-id="${projectId}"]`,
  ).click();

  const dialog = page.locator('.switch-dialog[role="dialog"]');
  try {
    await dialog.waitFor({ state: 'visible', timeout: 1_000 });
    await dialog.getByRole('button', { name: COPY.keepAndStart, exact: true }).click();
  } catch (_) {}

  await expect(page).toHaveURL(new RegExp(`catalog=${projectId}`));
  const url = new URL(page.url());
  const localRecordId = url.searchParams.get('id');
  expect(localRecordId).toBeTruthy();
  return localRecordId;
}

async function resumeSaved(page, localRecordId, projectId) {
  await page.locator(
    `[data-action="resume-project"][data-local-record-id="${localRecordId}"]`,
  ).click();
  await expect(page).toHaveURL(new RegExp(`id=${localRecordId}.*catalog=${projectId}`));
}

async function childSnapshots(page, localRecordId, label) {
  return requireOk(
    await repoCall(page, 'listRecords', { localRecordId, kind: 'child-snapshot' }),
    label,
  );
}

async function confirmAlcove(page) {
  const frame = page.frameLocator('iframe[data-canonical-child-frame="alcove"]');
  await page.locator(
    '[data-canonical-project-id="alcove"][data-canonical-stage="configure"]',
  ).click();
  await expect(frame.locator('#alcove-config')).toBeVisible();
  await frame.locator('#confirm-alcove-inline').click();
  await expect(page.locator('[data-canonical-project-host="alcove"]'))
    .toHaveAttribute('data-canonical-stage', 'store-answer');
  await expect(page.locator('[data-store-applicability="current"]'))
    .toContainText('CURRENT FOR IDENTIFIED DEFINITION');
}

async function confirmOutdoor(page) {
  const frame = page.frameLocator('iframe[data-canonical-child-frame="outdoor"]');
  await page.locator(
    '[data-canonical-project-id="outdoor"][data-canonical-stage="configure"]',
  ).click();
  await frame.locator('[data-outdoor-open]').click();
  await frame.locator('button[data-outdoor-assembly="left-bench"]').first().click();
  await frame.locator('button[data-outdoor-part="end-leg"]').click();
  await expect(frame.locator('#outdoor-confirm')).toBeVisible();
  await frame.locator('#outdoor-confirm').click();
  await expect(page.locator('[data-canonical-project-host="outdoor"]'))
    .toHaveAttribute('data-canonical-stage', 'store-answer');
  await expect(page.locator('[data-store-applicability="current"]'))
    .toContainText('CURRENT FOR IDENTIFIED DEFINITION');
}

test('canonical five-project journey remains usable at a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openLibrary(page);

  for (const [projectId, classId, hostMode] of CANONICAL) {
    const localRecordId = await startCanonical(page, projectId);
    const project = requireOk(
      await repoCall(page, 'project', { localRecordId }),
      `narrow ${projectId} project`,
    );
    expect(project.localRecordId).toBe(localRecordId);
    expect(project.classId).toBe(classId);

    const configure = page.locator(
      `[data-canonical-project-id="${projectId}"][data-canonical-stage="configure"]`,
    );
    await expect(configure).toBeVisible();
    await configure.click();
    await expect(page).toHaveURL(
      new RegExp(`id=${localRecordId}.*catalog=${projectId}.*stage=configure`),
    );

    const afterStage = requireOk(
      await repoCall(page, 'project', { localRecordId }),
      `narrow ${projectId} after stage`,
    );
    expect(afterStage.localRecordId).toBe(localRecordId);
    expect(afterStage.projectId).toBe(project.projectId);
    expect(afterStage.classId).toBe(classId);

    if (hostMode === 'review-child') {
      const host = page.locator(`[data-canonical-project-host="${projectId}"]`);
      await expect(host).toHaveAttribute('data-local-record-id', localRecordId);
      await expect(host).toHaveAttribute('data-canonical-stage', 'configure');
      await expect(
        page.frameLocator(
          `iframe[data-canonical-child-frame="${projectId}"]`,
        ).locator('body'),
      ).toBeVisible();
    } else {
      await expect(page.locator('[data-screen="questions"]')).toBeVisible();
    }

    await expect(page.locator('[data-action="back-to-begin"]:visible').first()).toBeVisible();
    await backToLibrary(page);
  }
});

test('cross-project switching keeps durable records and child state segregated', async ({ page }) => {
  await openLibrary(page);

  const alcoveId = await startCanonical(page, 'alcove');
  const alcoveProject = requireOk(
    await repoCall(page, 'project', { localRecordId: alcoveId }),
    'Alcove project before switching',
  );
  await confirmAlcove(page);
  const alcoveSnapshots = await childSnapshots(page, alcoveId, 'Alcove snapshots');
  expect(alcoveSnapshots).toHaveLength(1);
  const alcoveDefinitionId = alcoveSnapshots[0].payload.definitionId;

  await backToLibrary(page);
  const outdoorId = await startCanonical(page, 'outdoor');
  expect(outdoorId).not.toBe(alcoveId);
  expect(await childSnapshots(page, outdoorId, 'new Outdoor snapshots')).toHaveLength(0);

  await page.locator(
    '[data-canonical-project-id="outdoor"][data-canonical-stage="store-answer"]',
  ).click();
  await expect(page.locator('[data-store-applicability="stale"]'))
    .toContainText('NO IDENTIFIED CURRENT ANSWER');

  await confirmOutdoor(page);
  const outdoorSnapshots = await childSnapshots(page, outdoorId, 'Outdoor snapshots');
  expect(outdoorSnapshots).toHaveLength(1);
  expect(outdoorSnapshots[0].payload.catalogProjectId).toBe('outdoor');
  expect(outdoorSnapshots[0].payload.definitionId).not.toBe(alcoveDefinitionId);

  const retainedAlcove = requireOk(
    await repoCall(page, 'project', { localRecordId: alcoveId }),
    'retained Alcove project',
  );
  expect(retainedAlcove.localRecordId).toBe(alcoveId);
  expect(retainedAlcove.projectId).toBe(alcoveProject.projectId);
  expect(retainedAlcove.classId).toBe('REVIEW_ALCOVE_INSERT_CURRENT');

  await backToLibrary(page);
  const windowSeatId = await startCanonical(page, 'window-seat');
  expect(windowSeatId).not.toBe(outdoorId);
  expect(await childSnapshots(page, windowSeatId, 'new Window Seat snapshots')).toHaveLength(0);

  await page.locator(
    '[data-canonical-project-id="window-seat"][data-canonical-stage="store-answer"]',
  ).click();
  await expect(page.locator('[data-store-applicability="stale"]'))
    .toContainText('NO IDENTIFIED CURRENT ANSWER');
  expect(await childSnapshots(page, windowSeatId, 'Window Seat after navigation')).toHaveLength(0);

  await backToLibrary(page);
  await resumeSaved(page, alcoveId, 'alcove');
  await page.locator(
    '[data-canonical-project-id="alcove"][data-canonical-stage="store-answer"]',
  ).click();
  await expect(page.locator('[data-store-applicability="current"]'))
    .toContainText('CURRENT FOR IDENTIFIED DEFINITION');

  const reopenedAlcove = requireOk(
    await repoCall(page, 'project', { localRecordId: alcoveId }),
    'reopened Alcove project',
  );
  expect(reopenedAlcove.localRecordId).toBe(alcoveId);
  expect(reopenedAlcove.projectId).toBe(alcoveProject.projectId);
  expect(reopenedAlcove.classId).toBe('REVIEW_ALCOVE_INSERT_CURRENT');
  expect(await childSnapshots(page, alcoveId, 'reopened Alcove snapshots')).toHaveLength(1);
  expect(await childSnapshots(page, outdoorId, 'retained Outdoor snapshots')).toHaveLength(1);
  expect(await childSnapshots(page, windowSeatId, 'retained Window Seat snapshots')).toHaveLength(0);
});

test('owner-record handoff survives leave and reopen without minting authority or a Store answer', async ({ page }) => {
  await openLibrary(page);
  const alcoveId = await startCanonical(page, 'alcove');
  const originalProject = requireOk(
    await repoCall(page, 'project', { localRecordId: alcoveId }),
    'owner-record Alcove project',
  );

  await confirmAlcove(page);
  let snapshots = await childSnapshots(page, alcoveId, 'owner-record Alcove snapshots');
  expect(snapshots).toHaveLength(1);
  const recorded = snapshots[0].payload;
  expect(recorded.catalogProjectId).toBe('alcove');
  expect(recorded.authority).toEqual({
    commercial: false,
    productionRelease: false,
    machineReadiness: false,
    cycleStart: false,
    physicalFabrication: false,
  });
  expect(recorded.payload.authority).toEqual({
    commercial: false,
    payment: false,
    productionRelease: false,
    cycleStart: false,
    physicalFabrication: false,
  });

  await page.locator(
    '[data-canonical-project-id="alcove"][data-canonical-stage="handoff-record"]',
  ).click();
  await expect(page.locator('[data-store-applicability="current"]'))
    .toContainText('CURRENT FOR IDENTIFIED DEFINITION');

  const beforeLeave = requireOk(
    await repoCall(page, 'listAllRecords', { localRecordId: alcoveId }),
    'records before owner-record leave',
  ).map((row) => `${row.kind}:${row.id}`).sort();

  await backToLibrary(page);
  await resumeSaved(page, alcoveId, 'alcove');
  await page.locator(
    '[data-canonical-project-id="alcove"][data-canonical-stage="handoff-record"]',
  ).click();
  await expect(page.locator('[data-store-applicability="current"]'))
    .toContainText('CURRENT FOR IDENTIFIED DEFINITION');

  snapshots = await childSnapshots(page, alcoveId, 'owner-record Alcove after reopen');
  expect(snapshots).toHaveLength(1);
  expect(snapshots[0].payload.definitionId).toBe(recorded.definitionId);
  expect(snapshots[0].payload.authority).toEqual(recorded.authority);

  const afterReopen = requireOk(
    await repoCall(page, 'listAllRecords', { localRecordId: alcoveId }),
    'records after owner-record reopen',
  ).map((row) => `${row.kind}:${row.id}`).sort();
  expect(afterReopen).toEqual(beforeLeave);

  const reopenedProject = requireOk(
    await repoCall(page, 'project', { localRecordId: alcoveId }),
    'owner-record reopened project',
  );
  expect(reopenedProject.localRecordId).toBe(originalProject.localRecordId);
  expect(reopenedProject.projectId).toBe(originalProject.projectId);
  expect(reopenedProject.classId).toBe(originalProject.classId);
});
