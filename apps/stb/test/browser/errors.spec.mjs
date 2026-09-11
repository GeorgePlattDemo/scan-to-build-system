import { expect, test } from '@playwright/test';

import { PNG_FIXTURE, TEXT_FIXTURE, asArray } from '../fixtures/bytes.mjs';
import { repoCall, requireOk } from '../helpers/browser-repo.mjs';

function now() {
  return '2026-09-10T22:30:00.000Z';
}

async function seedHead(page, { localRecordId, projectId, blobs = [], records = [] }) {
  return requireOk(
    await repoCall(page, 'save', {
      localRecordId,
      projectId,
      expectedHead: null,
      nextHead: 'H0',
      createdAt: now(),
      actionId: crypto.randomUUID(),
      blobs,
      records,
      event: {
        localRecordId,
        projectId,
        kind: 'event',
        id: 'event-h0',
        createdAt: now(),
        payload: { type: 'inert-test' },
      },
    }),
    'seed H0',
  );
}

test('B0-05 hash mismatch does not save or advance head', async ({ page }) => {
  await page.goto('/');
  const localRecordId = crypto.randomUUID();
  const projectId = crypto.randomUUID();
  await seedHead(page, { localRecordId, projectId });
  const prepared = requireOk(
    await repoCall(page, 'prepareBlob', {
      bytes: asArray(TEXT_FIXTURE.bytes),
      type: TEXT_FIXTURE.type,
    }),
    'prepare text',
  );
  const failed = await repoCall(page, 'save', {
    localRecordId,
    projectId,
    expectedHead: 'H0',
    nextHead: 'H1',
    createdAt: now(),
    actionId: crypto.randomUUID(),
    blobs: [{ ...prepared, sha256: '0'.repeat(64) }],
    event: {
      localRecordId,
      projectId,
      kind: 'event',
      id: 'event-h1',
      createdAt: now(),
      payload: { type: 'inert-test' },
    },
  });
  expect(failed.ok).toBe(false);
  expect(failed.code).toBe('hash-mismatch');
  expect(await page.locator('#save-status').textContent()).toBe('Save failed');
  expect(requireOk(await repoCall(page, 'head', { localRecordId }), 'head')).toBe('H0');
  expect(
    requireOk(await repoCall(page, 'record', { localRecordId, kind: 'event', id: 'event-h1' }), 'event'),
  ).toBeNull();
});

test('B0-05 injected abort is labeled injected and keeps retryable draft', async ({ page }) => {
  await page.goto('/');
  const localRecordId = crypto.randomUUID();
  const projectId = crypto.randomUUID();
  await seedHead(page, { localRecordId, projectId });
  requireOk(
    await repoCall(page, 'putDraft', {
      localRecordId,
      draftId: 'retry',
      expectedHead: 'H0',
      createdAt: now(),
      payload: { nextHead: 'H1', note: 'retry-me' },
    }),
    'draft',
  );
  const aborted = await repoCall(page, 'save', {
    localRecordId,
    projectId,
    expectedHead: 'H0',
    nextHead: 'H1',
    createdAt: now(),
    actionId: crypto.randomUUID(),
    testFault: 'abort-before-head',
    event: {
      localRecordId,
      projectId,
      kind: 'event',
      id: 'event-h1',
      createdAt: now(),
      payload: { type: 'inert-test' },
    },
  });
  expect(aborted.ok).toBe(false);
  expect(aborted.code).toBe('injected-abort');
  expect(aborted.message).toMatch(/Injected transaction abort/);
  expect(await page.locator('#save-status').textContent()).toBe('Save failed');
  expect(requireOk(await repoCall(page, 'head', { localRecordId }), 'head')).toBe('H0');
  const draft = requireOk(
    await repoCall(page, 'inspectUnapplied', { localRecordId, draftId: 'retry' }),
    'draft',
  );
  expect(draft.payload.note).toBe('retry-me');
  expect(await page.locator('#unapplied-status').textContent()).toBe('Unapplied changes');
});

test('B0-08 missing blob is unavailable and does not invent an original', async ({ page }) => {
  await page.goto('/');
  const localRecordId = crypto.randomUUID();
  const projectId = crypto.randomUUID();
  const text = requireOk(
    await repoCall(page, 'prepareBlob', {
      bytes: asArray(TEXT_FIXTURE.bytes),
      type: TEXT_FIXTURE.type,
    }),
    'text',
  );
  const png = requireOk(
    await repoCall(page, 'prepareBlob', {
      bytes: asArray(PNG_FIXTURE.bytes),
      type: PNG_FIXTURE.type,
    }),
    'png',
  );
  await seedHead(page, {
    localRecordId,
    projectId,
    blobs: [text, png],
    records: [
      {
        localRecordId,
        projectId,
        kind: 'evidence',
        id: 'evidence-text',
        createdAt: now(),
        payload: { blob: text.sha256, mime: text.type, size: text.size },
      },
      {
        localRecordId,
        projectId,
        kind: 'evidence',
        id: 'evidence-png',
        createdAt: now(),
        payload: { blob: png.sha256, mime: png.type, size: png.size },
      },
    ],
  });
  requireOk(await repoCall(page, 'deleteBlob', { sha256: text.sha256 }), 'delete text blob');
  const missing = requireOk(
    await repoCall(page, 'inspectSource', { sha256: text.sha256 }),
    'missing',
  );
  expect(missing.status).toBe('unavailable');
  expect(missing.reason).toBe('missing');
  expect(missing.bytes).toBeUndefined();
  expect(await page.locator('#source-status').textContent()).toBe('Original source unavailable');
  const evidence = requireOk(
    await repoCall(page, 'record', { localRecordId, kind: 'evidence', id: 'evidence-text' }),
    'evidence metadata',
  );
  expect(evidence.payload.blob).toBe(text.sha256);
  expect(requireOk(await repoCall(page, 'head', { localRecordId }), 'head')).toBe('H0');
  const retained = requireOk(await repoCall(page, 'inspectSource', { sha256: png.sha256 }), 'png');
  expect(retained.status).toBe('retained');
  expect(retained.bytes).toEqual(asArray(PNG_FIXTURE.bytes));
});

test('B0-08 corrupted blob is unavailable and does not replace the original', async ({ page }) => {
  await page.goto('/');
  const localRecordId = crypto.randomUUID();
  const projectId = crypto.randomUUID();
  const text = requireOk(
    await repoCall(page, 'prepareBlob', {
      bytes: asArray(TEXT_FIXTURE.bytes),
      type: TEXT_FIXTURE.type,
    }),
    'text',
  );
  await seedHead(page, {
    localRecordId,
    projectId,
    blobs: [text],
    records: [
      {
        localRecordId,
        projectId,
        kind: 'evidence',
        id: 'evidence-text',
        createdAt: now(),
        payload: { blob: text.sha256, mime: text.type, size: text.size },
      },
    ],
  });
  requireOk(
    await repoCall(page, 'overwriteBlob', {
      sha256: text.sha256,
      size: text.size,
      type: text.type,
      bytes: asArray(PNG_FIXTURE.bytes),
    }),
    'corrupt blob',
  );
  const custody = requireOk(
    await repoCall(page, 'inspectSource', { sha256: text.sha256 }),
    'corrupt custody',
  );
  expect(custody.status).toBe('unavailable');
  expect(custody.reason).toBe('hash-or-size-mismatch');
  expect(custody.bytes).toBeUndefined();
  expect(await page.locator('#source-status').textContent()).toBe('Original source unavailable');
  expect(requireOk(await repoCall(page, 'head', { localRecordId }), 'head')).toBe('H0');
});
