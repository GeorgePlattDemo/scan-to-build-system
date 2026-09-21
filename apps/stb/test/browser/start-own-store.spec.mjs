import { expect, test } from '@playwright/test';

import { ACTORS, COPY } from '../../shared/contracts.mjs';
import { START_OWN_STORE_PIN } from '../../shared/start-own-store-wire.mjs';
import { repoCall, requireOk } from '../helpers/browser-repo.mjs';

const exactStoreMounted = Boolean(process.env.STB_STORE_START_OWN_ROOT);

async function openStartOwn(page) {
  await page.goto('/');
  await page.getByRole('button', { name: ACTORS.new.label }).click();
  await page.getByRole('button', { name: COPY.next }).click();
  await page.getByRole('button', { name: 'Start Your Own / Grab a Board', exact: true }).click();
  const url = new URL(page.url());
  const localRecordId = url.searchParams.get('id');
  expect(localRecordId).toBeTruthy();
  return localRecordId;
}

async function finishClaudeDefault(frame) {
  await frame.locator('#go').click();
  await frame.locator('select[data-fact="cutPlane"]').selectOption('miter-face');
  await frame.locator('select[data-fact="endIdentity"]').selectOption('both');
  await frame.locator('select[data-fact="endRelation"]').selectOption('parallel');
  await frame.locator('select[data-fact="lengthDatum"]').selectOption('long-long-outer-edge');
}

test('exact Store preview and formal answer bind Claude Grab a Board default', async ({ page }) => {
  test.skip(!exactStoreMounted, 'requires exact STB_STORE_START_OWN_ROOT checkout');

  const localRecordId = await openStartOwn(page);
  const host = page.locator('[data-canonical-project-host="start-own"]');
  const frame = page.frameLocator('iframe[data-canonical-child-frame="start-own"]');

  await finishClaudeDefault(frame);

  await expect(frame.getByText('Store Zero answer')).toBeVisible();
  await expect(frame.getByText(/4 × 2×8 × 96 in/)).toBeVisible();
  await expect(frame.getByText(/\$39\.80 \+ work unresolved/)).toBeVisible();
  await expect(frame.getByText(/Capability · SUPPORTABLE/)).toBeVisible();
  await expect(frame.getByText(/4 parent boards · 12 saw cuts/)).toBeVisible();
  await expect(frame.getByText(/UNRESOLVED_CLASS_SCOPED_RECOVERY/)).toBeVisible();

  const childDefinitionId = await frame.locator('body').evaluate(() => window.currentDefinitionId());
  expect(childDefinitionId).toMatch(/^PTL-/);

  await expect(frame.locator('#go')).toBeEnabled();
  await frame.locator('#go').click();

  await expect(host).toHaveAttribute('data-canonical-stage', 'store-answer');
  await expect(page.locator('[data-store-applicability="current"]')).toContainText(
    'CURRENT FOR IDENTIFIED DEFINITION',
  );

  const snapshots = requireOk(
    await repoCall(page, 'listRecords', { localRecordId, kind: 'child-snapshot' }),
    'Start Own exact Store snapshots',
  );
  expect(snapshots).toHaveLength(1);
  const snapshot = snapshots[0].payload;
  expect(snapshot.definitionId).toMatch(/^SYO-SHA256-/);
  expect(snapshot.definitionId).not.toBe(childDefinitionId);
  expect(snapshot.payload.formalStoreDefinitionId).toBe(snapshot.definitionId);
  expect(snapshot.payload.storeDiagnostic).toBeNull();

  const answer = snapshot.payload.storeAnswer;
  expect(answer.storePin).toBe(START_OWN_STORE_PIN);
  expect(answer.rawEvaluation.status).toBe('SUPPORTABLE');
  expect(answer.rawEvaluation.materialResolution.storeSku).toBe('STB-ZERO-SPF-2X8-96-001');
  expect(answer.rawEvaluation.materialResolution.quantity).toBe(4);
  expect(answer.rawEvaluation.materialResolution.materialTotal).toBe(39.8);
  expect(answer.rawEvaluation.materialResolution.modeledWork.cutCount).toBe(12);
  expect(answer.rawEvaluation.capability.status).toBe('SUPPORTABLE');
  expect(answer.rawEstimate.status).toBe('BUDGETARY_PARTIAL');
  expect(answer.rawEstimate.totals.material).toBe(39.8);
  expect(answer.rawEstimate.totals.cell_recovery).toBeNull();
  expect(answer.rawEstimate.totals.Q).toBeNull();
  expect(answer.rawEstimate.economics.status).toBe('UNRESOLVED_CLASS_SCOPED_RECOVERY');
  expect(answer.physicalExecutionAuthorized).toBe(false);
  expect(answer.controllerOutputProduced).toBe(false);
});

test('changing the configured length replaces the live preview rather than reusing stale Store value', async ({ page }) => {
  test.skip(!exactStoreMounted, 'requires exact STB_STORE_START_OWN_ROOT checkout');

  await openStartOwn(page);
  const frame = page.frameLocator('iframe[data-canonical-child-frame="start-own"]');
  await finishClaudeDefault(frame);

  await expect(frame.getByText(/\$39\.80 \+ work unresolved/)).toBeVisible();
  const before = await frame.locator('body').evaluate(() => ({
    id: window.currentDefinitionId(),
    answerId: window.A.storePreviewDefinitionId,
  }));
  expect(before.answerId).toBe(before.id);

  await frame.locator('button[data-step="len:0.25"]').click();
  await expect.poll(async () => frame.locator('body').evaluate(() => window.A.storePreviewDefinitionId))
    .not.toBe(before.id);
  const after = await frame.locator('body').evaluate(() => ({
    id: window.currentDefinitionId(),
    answerId: window.A.storePreviewDefinitionId,
  }));
  expect(after.answerId).toBe(after.id);
  expect(after.id).not.toBe(before.id);
});
