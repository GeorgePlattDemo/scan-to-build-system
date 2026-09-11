import { expect, test } from '@playwright/test';

import { ACTORS, COPY } from '../../shared/contracts.mjs';
import { repoCall, requireOk } from '../helpers/browser-repo.mjs';

async function openBoard(page) {
  await page.goto('/');
  await page.getByRole('button', { name: ACTORS.new.label }).click();
  await page.getByRole('button', { name: COPY.next }).click();
  await page.getByRole('button', { name: COPY.startOwn }).click();
  await expect(page.locator('[data-page="page2"]')).toBeVisible();
  await page.getByRole('button', { name: 'PICK A BOARD', exact: true }).click();
  await expect(page.locator('[data-child-panel="board"]')).toBeVisible();
}

async function waitForStoreIdle(page) {
  const panel = page.locator('[data-store-panel="compact"]');
  await expect(panel).toBeVisible();
  await expect(panel).not.toHaveAttribute('data-pending', 'true', { timeout: 20_000 });
}

async function applyLengthUi(page, raw, unit = 'in') {
  await page.locator('[data-field="board-length"]').fill(raw);
  await page.locator('[data-field="board-unit"]').fill(unit);
  await page.getByRole('button', { name: COPY.boardApply }).click();
  await expect(page.locator('[data-unapplied="board"]')).toBeHidden();
  await expect(page.locator('[data-candidate-view="true"]')).toBeVisible();
  const valid = await page.locator('[data-candidate-view="true"]').getAttribute('data-valid');
  if (valid === 'true') {
    await waitForStoreIdle(page);
  }
}

async function currentRecords(page, localRecordId) {
  const candidate = requireOk(
    await repoCall(page, 'currentCandidate', { localRecordId }),
    'candidate',
  );
  const projection = requireOk(
    await repoCall(page, 'currentProjection', { localRecordId }),
    'projection',
  );
  return { candidate, projection };
}

test('P2-B01 blank nonfinite unitless and negative lengths create no valid part', async ({ page }) => {
  await openBoard(page);
  const localRecordId = await page.locator('[data-local-record-id]').getAttribute('data-local-record-id');
  await expect(page.locator('[data-candidate-view="empty"]')).toBeVisible();
  await expect(page.locator('[data-store-panel="compact"]')).toHaveAttribute('data-store-kind', 'incomplete');
  await expect(page.locator('[data-store-headline]')).toHaveText(COPY.storeIncomplete);

  for (const [raw, unit] of [
    ['', 'in'],
    ['NaN', 'in'],
    ['45', ''],
    ['-5', 'in'],
    ['16', 'in'],
  ]) {
    await applyLengthUi(page, raw, unit);
    await expect(page.locator('[data-candidate-view][data-valid="false"]')).toBeVisible();
    const { candidate, projection } = await currentRecords(page, localRecordId);
    expect(candidate.payload.parts).toBeNull();
    expect(projection.payload.valid).toBe(false);
    expect(projection.payload.request.complete).toBe(false);
    expect(projection.payload.store.offering).toBeNull();
    const expectedLength = projection.payload.geometry.lengthCanonical ?? '';
    await expect(page.locator('[data-candidate-view="true"]')).toHaveAttribute(
      'data-finished-length',
      expectedLength,
    );
  }
});

test('P2-B02 documentary 60 and manual 60 keep distinct provenance in the shared view', async ({ page }) => {
  await openBoard(page);
  await page.getByRole('button', { name: COPY.boardCut001 }).click();
  await expect(page.locator('[data-candidate-view][data-valid="true"]')).toBeVisible();
  await waitForStoreIdle(page);
  await expect(page.locator('[data-summary-provenance]')).toContainText('CUT-001 documentary reference');
  const localRecordId = await page.locator('[data-local-record-id]').getAttribute('data-local-record-id');
  const documentary = await currentRecords(page, localRecordId);
  expect(documentary.projection.payload.finishedLength.canonical).toBe('60');
  expect(documentary.projection.payload.source.method).toBe('documentary-reference');

  await applyLengthUi(page, '60', 'in');
  await expect(page.locator('[data-summary-provenance]')).toContainText('Manually entered');
  const manual = await currentRecords(page, localRecordId);
  expect(manual.candidate.id).not.toBe(documentary.candidate.id);
  expect(manual.projection.payload.finishedLength.canonical).toBe('60');
  expect(manual.projection.payload.source.method).toBe('entered');
  expect(manual.candidate.payload.activeOccurrenceIds[0]).toBe(
    documentary.candidate.payload.activeOccurrenceIds[0],
  );
});

test('P2-B03 / M2-05/R01 45 then 46 updates SVG and summary together', async ({ page }) => {
  await openBoard(page);
  await applyLengthUi(page, '45');
  await expect(page.locator('[data-part-summary]')).toHaveAttribute('data-finished-length', '45');
  await expect(page.locator('[data-part-schematic]')).toHaveAttribute('data-finished-length', '45');
  const occurrenceId = await page.locator('[data-candidate-view="true"]').getAttribute('data-occurrence-id');
  const definition45 = await page.locator('[data-candidate-view="true"]').getAttribute('data-definition-revision-id');
  const projection45 = await page.locator('[data-candidate-view="true"]').getAttribute('data-projection-id');

  await applyLengthUi(page, '46');
  await expect(page.locator('[data-part-summary]')).toHaveAttribute('data-finished-length', '46');
  await expect(page.locator('[data-part-schematic]')).toHaveAttribute('data-finished-length', '46');
  await expect(page.locator('[data-summary-length]')).toHaveAttribute('data-summary-length', '46 in');
  await expect(page.locator('[data-candidate-view="true"]')).toHaveAttribute('data-occurrence-id', occurrenceId);
  const definition46 = await page.locator('[data-candidate-view="true"]').getAttribute('data-definition-revision-id');
  const projection46 = await page.locator('[data-candidate-view="true"]').getAttribute('data-projection-id');
  expect(definition46).not.toBe(definition45);
  expect(projection46).not.toBe(projection45);
  await expect(page.locator('[data-finished-length="45"]')).toHaveCount(0);
});

test('P4-01 schematic and summary expose the same occurrence and length', async ({ page }) => {
  await openBoard(page);
  await applyLengthUi(page, '45');
  const summary = page.locator('[data-part-summary]');
  const schematic = page.locator('[data-part-schematic]');
  const occurrenceId = await summary.getAttribute('data-occurrence-id');
  const definitionId = await summary.getAttribute('data-definition-revision-id');
  const projectionId = await summary.getAttribute('data-projection-id');
  expect(await schematic.getAttribute('data-occurrence-id')).toBe(occurrenceId);
  expect(await schematic.getAttribute('data-definition-revision-id')).toBe(definitionId);
  expect(await schematic.getAttribute('data-projection-id')).toBe(projectionId);
  expect(await schematic.getAttribute('data-finished-length')).toBe('45');
  await schematic.click();
  await expect(page.locator('.board-schematic')).toHaveAttribute('data-selected', 'true');
  await expect(page.locator('[data-part-summary]')).toHaveAttribute('data-selected', 'true');
  await expect(page.locator('[data-occurrence-inspector]')).toContainText(occurrenceId);
  await expect(page.locator('[data-definition-inspector]')).toContainText(definitionId);
});

test('P4-06 one finished occurrence and current length; P4-07 derivation projection request.complete remains false', async ({ page }) => {
  await openBoard(page);
  const localRecordId = await page.locator('[data-local-record-id]').getAttribute('data-local-record-id');
  await expect(page.locator('[data-candidate-view="empty"]')).toBeVisible();
  const saved = requireOk(await repoCall(page, 'project', { localRecordId }), 'saved');
  expect(saved.currentHead).toBeTruthy();

  await applyLengthUi(page, '45');
  await expect(page.locator('[data-candidate-view="true"]')).toHaveAttribute('data-store-request-complete', 'false');
  const { candidate, projection } = await currentRecords(page, localRecordId);
  expect(candidate.payload.activeOccurrenceIds).toHaveLength(1);
  expect(projection.payload.parts).toHaveLength(1);
  expect(projection.payload.request.complete).toBe(false);
  expect(projection.payload.store.connected).toBe(false);
  expect(projection.payload.geometry.width).toBeNull();
  expect(projection.payload.geometry.thickness).toBeNull();
});

test('M2-05/R04 Enter then blur commits once and restore is a new revision', async ({ page }) => {
  await openBoard(page);
  const localRecordId = await page.locator('[data-local-record-id]').getAttribute('data-local-record-id');
  const length = page.locator('[data-field="board-length"]');
  await length.fill('45');
  await length.press('Enter');
  await expect(page.locator('[data-candidate-view][data-valid="true"]')).toBeVisible();
  await waitForStoreIdle(page);
  const afterEnter = await currentRecords(page, localRecordId);
  await length.blur();
  const afterBlur = await currentRecords(page, localRecordId);
  expect(afterBlur.candidate.id).toBe(afterEnter.candidate.id);

  await length.fill('46');
  await length.press('Enter');
  await expect(page.locator('[data-part-summary]')).toHaveAttribute('data-finished-length', '46');
  await waitForStoreIdle(page);
  const changed = await currentRecords(page, localRecordId);
  expect(changed.candidate.id).not.toBe(afterEnter.candidate.id);
  expect(changed.candidate.payload.activeOccurrenceIds[0]).toBe(
    afterEnter.candidate.payload.activeOccurrenceIds[0],
  );

  await length.fill('45');
  await length.press('Enter');
  await expect(page.locator('[data-part-summary]')).toHaveAttribute('data-finished-length', '45');
  await waitForStoreIdle(page);
  const restored = await currentRecords(page, localRecordId);
  expect(restored.candidate.id).not.toBe(changed.candidate.id);
  expect(restored.candidate.id).not.toBe(afterEnter.candidate.id);
  expect(restored.projection.payload.finishedLength.canonical).toBe('45');
  expect(restored.candidate.payload.activeOccurrenceIds[0]).toBe(
    afterEnter.candidate.payload.activeOccurrenceIds[0],
  );
});

test('Build 3 Keep/Use still do not invent a Board from an unmapped measurement', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: ACTORS.new.label }).click();
  await page.getByRole('button', { name: COPY.next }).click();
  await page.getByRole('button', { name: COPY.startOwn }).click();
  await page.getByRole('button', { name: 'MEASUREMENTS', exact: true }).click();
  await page.locator('[data-field="measurement-raw"]').fill('45');
  await page.locator('[data-field="measurement-unit"]').fill('in');
  await page.locator('[data-field="measurement-role"]').fill('opening width');
  await page.getByRole('button', { name: COPY.keepObservation }).click();
  await expect(page.getByText(COPY.notMapped, { exact: true })).toBeVisible();
  const localRecordId = await page.locator('[data-local-record-id]').getAttribute('data-local-record-id');
  const { candidate, projection } = await currentRecords(page, localRecordId);
  expect(candidate.payload.mappings).toEqual([]);
  expect(candidate.payload.activeOccurrenceIds ?? []).toEqual([]);
  expect(projection.payload.valid).toBe(false);
});
