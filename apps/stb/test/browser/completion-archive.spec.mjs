import { expect, test } from '@playwright/test';

import { ACTORS, COPY } from '../../shared/contracts.mjs';
import {
  buildCompletionPlanRecord,
  pilotToFinalHoleExample,
} from '../../shared/completion-contract.mjs';
import { repoCall, requireOk } from '../helpers/browser-repo.mjs';

async function startOwn(page) {
  await page.goto('/');
  await page.getByRole('button', { name: ACTORS.new.label }).click();
  await page.getByRole('button', { name: COPY.next }).click();
  await page.getByRole('button', { name: COPY.startOwn }).click();
  await expect(page.locator('[data-page="page2"]')).toBeVisible();
  return page.locator('[data-local-record-id]').getAttribute('data-local-record-id');
}

test('completion records survive export/import without becoming authority', async ({ page }) => {
  const localRecordId = await startOwn(page);
  const project = requireOk(await repoCall(page, 'project', { localRecordId }));
  const createdAt = '2026-09-13T20:45:00.000Z';
  const completionPlan = buildCompletionPlanRecord({
    completionPlanId: 'CP-ARCHIVE-001',
    projectId: project.projectId,
    candidateRevisionId: project.currentHead,
    storeDisposition: 'UNRESOLVED',
    lines: [pilotToFinalHoleExample()],
    createdAt,
  });

  requireOk(await repoCall(page, 'append', {
    localRecordId,
    projectId: project.projectId,
    expectedHead: project.currentHead,
    actionId: 'ACT-COMPLETION-ARCHIVE-001',
    createdAt,
    records: [{
      localRecordId,
      projectId: project.projectId,
      kind: 'completion-plan',
      id: completionPlan.completionPlanId,
      createdAt,
      payload: completionPlan,
    }],
  }));

  const stored = requireOk(await repoCall(page, 'listRecords', {
    localRecordId,
    kind: 'completion-plan',
  }));
  expect(stored).toHaveLength(1);
  expect(stored[0].payload.storeDisposition).toBe('UNRESOLVED');
  expect(stored[0].payload.physicalExecutionAuthority).toBe(false);
  expect(stored[0].payload.operatorMayPromote).toBe(false);

  const exported = requireOk(await repoCall(page, 'exportArchive', {
    localRecordId,
    archiveId: 'ARCHIVE-COMPLETION-001',
    exportedAt: '2026-09-13T20:46:00.000Z',
  }));
  expect(exported.status).toBe('ready');
  expect(exported.document.records.some((record) => record.kind === 'completion-plan')).toBe(true);

  const imported = requireOk(await repoCall(page, 'importArchive', {
    raw: exported.json,
    serializedBytes: exported.json.length,
    separateCopy: true,
    createdAt: '2026-09-13T20:47:00.000Z',
  }));
  expect(imported.status).toBe('imported');
  expect(imported.localRecordId).not.toBe(localRecordId);

  const restored = requireOk(await repoCall(page, 'listRecords', {
    localRecordId: imported.localRecordId,
    kind: 'completion-plan',
  }));
  expect(restored).toHaveLength(1);
  expect(restored[0].imported).toBe(true);
  expect(restored[0].payload.completionPlanId).toBe('CP-ARCHIVE-001');
  expect(restored[0].payload.storeDisposition).toBe('UNRESOLVED');
  expect(restored[0].payload.physicalExecutionAuthority).toBe(false);
  expect(restored[0].payload.operatorMayPromote).toBe(false);
});
