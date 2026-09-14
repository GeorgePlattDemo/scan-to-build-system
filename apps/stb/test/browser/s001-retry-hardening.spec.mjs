import { expect, test } from '@playwright/test';

import { repoCall, requireOk } from '../helpers/browser-repo.mjs';

const S001_CLASS_ID = 'S001_CENTERED_ARCHED_SHEET_V0';

async function createS001Project(page) {
  await page.goto('/');
  const created = requireOk(await repoCall(page, 'createProject', {
    actionId: crypto.randomUUID(),
    createdAt: '2026-09-13T22:40:00.000Z',
    entryMode: 'mapped',
    classId: S001_CLASS_ID,
    actorId: 'new',
  }));
  const configured = await page.evaluate(async ({ localRecordId, expectedHead }) => {
    const configurator = await import('/domain/configurator.mjs');
    return configurator.applyMappedConfiguration({
      localRecordId,
      expectedHead,
      actionId: crypto.randomUUID(),
      createdAt: '2026-09-13T22:41:00.000Z',
      basis: 'retry-hardening-test',
      configuration: {
        openingWidthIn: '36',
        straightHeightIn: '24',
        riseIn: '12',
      },
    });
  }, { localRecordId: created.localRecordId, expectedHead: created.currentHead });
  return { localRecordId: created.localRecordId, configured };
}

async function installFailingTransport(page) {
  await page.evaluate(async () => {
    const client = await import('/integration/published-project-client.mjs');
    client.setPublishedProjectTransport(async () => {
      throw new Error('simulated transport failure');
    });
  });
}

async function issueFailingRequest(page, localRecordId) {
  return page.evaluate(async (id) => {
    const client = await import('/integration/published-project-client.mjs');
    return client.issuePublishedProjectQuestion({ localRecordId: id });
  }, localRecordId);
}

test('current native S-001 request remains retryable', async ({ page }) => {
  const { localRecordId } = await createS001Project(page);
  await installFailingTransport(page);
  const first = await issueFailingRequest(page, localRecordId);
  expect(first.status).toBe('transport');

  const retried = await page.evaluate(async ({ id, requestId }) => {
    const client = await import('/integration/published-project-client.mjs');
    return client.retryPublishedProjectQuestion({ localRecordId: id, requestId });
  }, { id: localRecordId, requestId: first.requestId });
  expect(retried.status).toBe('transport');

  const attempts = requireOk(await repoCall(page, 'listRecords', { localRecordId, kind: 'attempt' }));
  expect(attempts).toHaveLength(2);
  expect(
    attempts.map((record) => record.payload.attemptNumber).sort((left, right) => left - right),
  ).toEqual([1, 2]);
});

test('S-001 retry refuses a request from an older candidate revision', async ({ page }) => {
  const { localRecordId, configured } = await createS001Project(page);
  await installFailingTransport(page);
  const first = await issueFailingRequest(page, localRecordId);
  expect(first.status).toBe('transport');

  await page.evaluate(async ({ id, expectedHead }) => {
    const configurator = await import('/domain/configurator.mjs');
    await configurator.applyMappedConfiguration({
      localRecordId: id,
      expectedHead,
      actionId: crypto.randomUUID(),
      createdAt: '2026-09-13T22:42:00.000Z',
      basis: 'retry-hardening-test',
      configuration: {
        openingWidthIn: '34',
        straightHeightIn: '24',
        riseIn: '12',
      },
    });
  }, { id: localRecordId, expectedHead: configured.project.currentHead });

  const error = await page.evaluate(async ({ id, requestId }) => {
    const client = await import('/integration/published-project-client.mjs');
    try {
      await client.retryPublishedProjectQuestion({ localRecordId: id, requestId });
      return null;
    } catch (cause) {
      return cause instanceof Error ? cause.message : String(cause);
    }
  }, { id: localRecordId, requestId: first.requestId });
  expect(error).toContain('current candidate revision');
});

test('S-001 retry refuses an imported historical request', async ({ page }) => {
  const { localRecordId } = await createS001Project(page);
  await installFailingTransport(page);
  const first = await issueFailingRequest(page, localRecordId);
  expect(first.status).toBe('transport');

  const exported = requireOk(await repoCall(page, 'exportArchive', {
    localRecordId,
    archiveId: 'ARCHIVE-S001-RETRY-001',
    exportedAt: '2026-09-13T22:43:00.000Z',
  }));
  const imported = requireOk(await repoCall(page, 'importArchive', {
    raw: exported.json,
    serializedBytes: exported.json.length,
    separateCopy: true,
    createdAt: '2026-09-13T22:44:00.000Z',
  }));
  const requests = requireOk(await repoCall(page, 'listRecords', {
    localRecordId: imported.localRecordId,
    kind: 'request',
  }));
  expect(requests).toHaveLength(1);
  expect(requests[0].imported).toBe(true);

  const error = await page.evaluate(async ({ id, requestId }) => {
    const client = await import('/integration/published-project-client.mjs');
    try {
      await client.retryPublishedProjectQuestion({ localRecordId: id, requestId });
      return null;
    } catch (cause) {
      return cause instanceof Error ? cause.message : String(cause);
    }
  }, { id: imported.localRecordId, requestId: requests[0].id });
  expect(error).toContain('imported historical requests');
});
