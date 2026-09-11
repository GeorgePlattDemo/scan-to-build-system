import { expect, test } from '@playwright/test';

import {
  ACTORS,
  COPY,
  REVIEW_RECORD_TYPES,
} from '../../shared/contracts.mjs';
import {
  computeRecordDigest,
  serializeArchive,
} from '../../shared/archive-format.mjs';
import { asArray, JPEG_FIXTURE } from '../fixtures/bytes.mjs';
import { repoCall, requireOk } from '../helpers/browser-repo.mjs';

const STORE_IDLE = { timeout: 20_000 };

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
  const panel = page.locator('[data-store-panel="compact"]').first();
  await expect(panel).toBeVisible();
  await expect(panel).not.toHaveAttribute('data-pending', 'true', STORE_IDLE);
}

async function applyLengthUi(page, raw, unit = 'in') {
  await page.locator('[data-field="board-length"]').fill(raw);
  await page.locator('[data-field="board-unit"]').fill(unit);
  await page.getByRole('button', { name: COPY.boardApply }).click();
  await expect(page.locator('[data-unapplied="board"]')).toBeHidden();
  await expect(page.locator('[data-candidate-view="true"]')).toBeVisible();
  await waitForStoreIdle(page);
}

async function localRecordId(page) {
  return page.locator('[data-local-record-id]').getAttribute('data-local-record-id');
}

async function listKind(page, id, kind) {
  return requireOk(await repoCall(page, 'listRecords', { localRecordId: id, kind }));
}

async function installMockTransport(page, evaluationStatus = 'SUPPORTABLE') {
  await page.evaluate(async (status) => {
    const { setStoreTransport } = await import('/integration/store-client.mjs');
    const { STORE_PIN, STORE_PROTOCOL_VERSION, WRAPPER_BUILD_ID } = await import(
      '/shared/contracts.mjs'
    );
    window.__echoEnvelope = (wire, extra = {}) => ({
      protocolVersion: STORE_PROTOCOL_VERSION,
      wrapperBuildId: WRAPPER_BUILD_ID,
      storePin: STORE_PIN,
      requestId: extra.requestId ?? wire.requestId,
      projectId: wire.projectId,
      candidateRevisionId: wire.candidateRevisionId,
      requestType: wire.requestType,
      scope: wire.scope,
      demandSignature: wire.demandSignature,
      querySignature: wire.querySignature,
      payloadDigest: wire.payloadDigest,
      attemptId: extra.attemptId ?? wire.attemptId,
      attemptNumber: wire.attemptNumber,
      wrapperRespondedAt: new Date().toISOString(),
      responseId: extra.responseId ?? crypto.randomUUID(),
      estimateAssociationId: extra.estimateAssociationId ?? crypto.randomUUID(),
      rawOffering: extra.rawOffering ?? {
        storeSku: wire.payload?.line?.storeSku,
        description: '2x4 x 72 in SPF construction',
        species: 'spf',
        actualW: 3.5,
        actualT: 1.5,
        stockL_in: 72,
        offered: true,
        catalogClock: '2026-09-10',
      },
      rawEvaluation: extra.rawEvaluation ?? {
        status,
        lines: [
          {
            stock: { status: 'ON_HAND_SUFFICIENT', available: 84, qtyNeeded: 1, asOf: '2026-09-10' },
            price: { sellingPrice: 3.13, asOf: '2026-09-10' },
            capability: { status: 'SUPPORTABLE' },
          },
        ],
      },
      rawEstimate: extra.rawEstimate ?? {
        status: 'BUDGETARY_ESTIMATE',
        totals: { material: 3.13, cell_recovery: 50.81, Q: 53.94 },
        cycle: { model: 'STB-D001-CYCLE-MODEL-S2-0.1', T_job_min: 9.486, measured: false },
        engine: { id: 'STB-STORE-ZERO-PRICE-1', version: '0.2.2' },
      },
      attributedBasis: extra.attributedBasis ?? {
        pricingEngine: { id: 'STB-STORE-ZERO-PRICE-1', version: '0.2.2' },
        cycleModel: { id: 'STB-D001-CYCLE-MODEL-S2-0.1' },
        envelope: { id: 'D001-STAGE2-ENVELOPE-0.2' },
        sourceClock: '2026-09-10',
        measured: false,
        commissioned: false,
      },
    });
    setStoreTransport(async (_url, init) => {
      const wire = JSON.parse(init.body);
      return new Response(JSON.stringify(window.__echoEnvelope(wire)), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });
  }, evaluationStatus);
}

async function attachTyped(page, id, text) {
  const project = requireOk(await repoCall(page, 'project', { localRecordId: id }));
  const prepared = requireOk(await repoCall(page, 'prepareTyped', { text }));
  return requireOk(
    await repoCall(page, 'attachEvidence', {
      localRecordId: id,
      expectedHead: project.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      prepared,
    }),
  );
}

async function supportedBoard(page) {
  await openBoard(page);
  await installMockTransport(page);
  const id = await localRecordId(page);
  await attachTyped(page, id, 'opening is about 45 inches');
  await applyLengthUi(page, '45');
  await page.getByRole('button', { name: COPY.reviewConfirm }).click();
  await expect(page.locator('[data-page="page7"]')).toBeVisible();
  return id;
}

async function exportJson(page, id) {
  const exported = requireOk(await repoCall(page, 'exportArchive', { localRecordId: id }), 'export');
  expect(exported.status).toBe('ready');
  expect(exported.filename).toMatch(/\.stb\.json$/);
  return exported;
}

async function importCopy(page, raw, options = {}) {
  return requireOk(
    await repoCall(page, 'importArchive', {
      raw,
      serializedBytes: raw.length,
      separateCopy: true,
      createdAt: '2026-09-11T04:00:00.000Z',
      ...options,
    }),
    'import',
  );
}

test('P8-01 / M2-06/T07 export/import preserves bytes, IDs, Store basis and confirmation', async ({
  page,
}) => {
  const id = await supportedBoard(page);
  const original = requireOk(await repoCall(page, 'project', { localRecordId: id }));
  const evidence = requireOk(await repoCall(page, 'listEvidence', { localRecordId: id }));
  const reviews = await listKind(page, id, 'review');
  const requests = await listKind(page, id, 'request');
  const occurrences = await listKind(page, id, 'occurrence');
  const sha256 = evidence[0].payload.sha256;
  const originalBytes = requireOk(await repoCall(page, 'blob', { sha256 }));
  expect(originalBytes.status).toBe('retained');

  await page.locator('[data-nav-page="record"]').click();
  await expect(page.locator('[data-page="page8"]')).toBeVisible();
  await expect(page.locator('#screen-heading')).toHaveText(COPY.recordHeading);
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: COPY.recordExport }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.stb\.json$/);
  await expect(page.locator('[data-record-status]')).toHaveText(COPY.recordExportReady);

  const exported = await exportJson(page, id);
  expect(exported.namedHead).toBe(original.currentHead);
  expect(exported.incomplete).toBe(false);
  const imported = await importCopy(page, exported.json);
  expect(imported.status).toBe('imported');
  expect(imported.localRecordId).not.toBe(id);
  expect(imported.projectId).toBe(original.projectId);

  const restored = requireOk(
    await repoCall(page, 'project', { localRecordId: imported.localRecordId }),
  );
  expect(restored.imported).toBe(true);
  expect(restored.currentHead).toBe(original.currentHead);
  expect(restored.localRecordId).toBe(imported.localRecordId);
  const restoredEvidence = requireOk(
    await repoCall(page, 'listEvidence', { localRecordId: imported.localRecordId }),
  );
  expect(restoredEvidence[0].id).toBe(evidence[0].id);
  expect(restoredEvidence[0].payload.sha256).toBe(sha256);
  const restoredBytes = requireOk(await repoCall(page, 'blob', { sha256 }));
  expect(restoredBytes.status).toBe('retained');
  expect(restoredBytes.bytes).toEqual(originalBytes.bytes);
  const restoredReviews = await listKind(page, imported.localRecordId, 'review');
  expect(restoredReviews).toHaveLength(1);
  expect(restoredReviews[0].id).toBe(reviews[0].id);
  expect(restoredReviews[0].imported).toBe(true);
  expect(restoredReviews[0].payload.type).toBe(REVIEW_RECORD_TYPES.DefinitionReviewRecorded);
  const restoredRequests = await listKind(page, imported.localRecordId, 'request');
  expect(restoredRequests[0].id).toBe(requests[0].id);
  expect(restoredRequests[0].imported).toBe(true);
  const restoredOccurrences = await listKind(page, imported.localRecordId, 'occurrence');
  expect(restoredOccurrences[0].id).toBe(occurrences[0].id);

  await repoCall(page, 'deleteBlob', { sha256 });
  const incomplete = requireOk(await repoCall(page, 'exportArchive', { localRecordId: id }));
  expect(incomplete.status).toBe('ready');
  expect(incomplete.incomplete).toBe(true);
  expect(incomplete.missingEvidence).toContain(sha256);
});

test('P8-02 reopen keeps identity; older revisions stay historical', async ({ page }) => {
  const id = await supportedBoard(page);
  const first = requireOk(await repoCall(page, 'project', { localRecordId: id }));
  const firstHead = first.currentHead;
  await page.locator('[data-nav-page="record"]').click();
  await page.getByRole('button', { name: COPY.recordResume }).click();
  await expect(page.locator('[data-page="page2"]')).toBeVisible();
  expect(await localRecordId(page)).toBe(id);
  await page.getByRole('button', { name: 'PICK A BOARD', exact: true }).click();
  await installMockTransport(page);
  await applyLengthUi(page, '46');
  const after = requireOk(await repoCall(page, 'project', { localRecordId: id }));
  expect(after.currentHead).not.toBe(firstHead);
  expect(after.projectId).toBe(first.projectId);
  const candidates = await listKind(page, id, 'candidate');
  expect(candidates.some((record) => record.id === firstHead)).toBe(true);
  expect(candidates.some((record) => record.id === after.currentHead)).toBe(true);
  const store = requireOk(await repoCall(page, 'currentStore', { localRecordId: id }));
  expect(store.current).toBe(true);
  expect(store.request.payload.candidateRevisionId).toBe(after.currentHead);
});

test('P8-04 unknown class imports inspectably and disables editing', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: ACTORS.new.label }).click();
  await page.getByRole('button', { name: COPY.next }).click();
  await page.getByRole('button', { name: COPY.startOwn }).click();
  const id = await localRecordId(page);
  const exported = await exportJson(page, id);
  const document = exported.document;
  document.project.classId = 'future-unbundled-class';
  document.project.classVersion = '9.9';
  document.manifest.classId = 'future-unbundled-class';
  document.manifest.classVersion = '9.9';
  document.manifest.recordDigest = await computeRecordDigest(document.project, document.records);
  const { json } = serializeArchive(document);
  const imported = await importCopy(page, json);
  expect(imported.status).toBe('imported');
  expect(imported.unknownClass).toBe(true);
  const restored = requireOk(
    await repoCall(page, 'project', { localRecordId: imported.localRecordId }),
  );
  expect(restored.unknownClass).toBe(true);
  const edit = await repoCall(page, 'applyBoardLength', {
    localRecordId: imported.localRecordId,
    expectedHead: restored.currentHead,
    actionId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    rawText: '45',
    unit: 'in',
    method: 'entered',
  });
  expect(edit.ok).toBe(false);
  expect(edit.code).toBe('unknown-class');
  await page.goto(`/project?id=${imported.localRecordId}&view=record`);
  await expect(page.locator('[data-page="page8"]')).toBeVisible();
  await expect(page.locator('[data-unknown-class]')).toHaveAttribute('data-unknown-class', 'true');
  await expect(page.locator('[data-unknown-class-note]')).toHaveText(COPY.recordUnknownClass);
});

test('P8-05 imported authorization and physical claims stay inert', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: ACTORS.new.label }).click();
  await page.getByRole('button', { name: COPY.next }).click();
  await page.getByRole('button', { name: COPY.startOwn }).click();
  const id = await localRecordId(page);
  const exported = await exportJson(page, id);
  const document = exported.document;
  const target = document.records.find((record) => record.kind === 'candidate');
  target.payload = {
    ...target.payload,
    authorization: { verified: true },
    physicalComplete: true,
    gateResult: 'PASS',
  };
  document.manifest.recordDigest = await computeRecordDigest(document.project, document.records);
  const { json } = serializeArchive(document);
  const imported = await importCopy(page, json);
  const records = requireOk(
    await repoCall(page, 'listAllRecords', { localRecordId: imported.localRecordId }),
  );
  const candidate = records.find((record) => record.id === target.id);
  expect(candidate.imported).toBe(true);
  expect(candidate.payload.authorization.verified).toBe(true);
  expect(candidate.authorization).toBeUndefined();
  expect(candidate.payload.physicalComplete).toBe(true);
  expect(records.every((record) => record.authorization === undefined)).toBe(true);
  const store = requireOk(
    await repoCall(page, 'currentStore', { localRecordId: imported.localRecordId }),
  );
  expect(store.current).toBe(false);
  const presentation = requireOk(
    await repoCall(page, 'loadReviewPresentation', { localRecordId: imported.localRecordId }),
  );
  expect(presentation.predicate.completeSupportedReviewAvailable).toBe(false);
  expect(presentation.currentReview).toBeNull();
});

test('P8-06 unclassified incomplete demand survives export/import', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: ACTORS.new.label }).click();
  await page.getByRole('button', { name: COPY.next }).click();
  await page.getByRole('button', { name: COPY.startOwn }).click();
  const id = await localRecordId(page);
  const project = requireOk(await repoCall(page, 'project', { localRecordId: id }));
  requireOk(
    await repoCall(page, 'recordObservation', {
      localRecordId: id,
      expectedHead: project.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      rawText: 'unclassified leftover lumber',
      unit: null,
      role: null,
      kind: 'typed-need',
      mapTo: null,
      method: 'entered',
    }),
  );
  const exported = await exportJson(page, id);
  const imported = await importCopy(page, exported.json);
  const observations = requireOk(
    await repoCall(page, 'listObservations', { localRecordId: imported.localRecordId }),
  );
  expect(observations.some((record) => record.payload?.rawText === 'unclassified leftover lumber')).toBe(
    true,
  );
  const candidate = requireOk(
    await repoCall(page, 'currentCandidate', { localRecordId: imported.localRecordId }),
  );
  expect(candidate.payload.parts).toBeNull();
  expect(candidate.payload.unresolved).toBe(true);
});

test('P8-07 more than 400 events remain retained after export/import', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: ACTORS.new.label }).click();
  await page.getByRole('button', { name: COPY.next }).click();
  await page.getByRole('button', { name: COPY.startOwn }).click();
  const id = await localRecordId(page);
  const project = requireOk(await repoCall(page, 'project', { localRecordId: id }));
  const extras = Array.from({ length: 401 }, (_, index) => ({
    localRecordId: id,
    projectId: project.projectId,
    kind: 'event',
    id: crypto.randomUUID(),
    createdAt: `2026-09-11T05:00:${String(index % 60).padStart(2, '0')}.000Z`,
    payload: { type: 'bulk-history', n: index },
  }));
  requireOk(
    await repoCall(page, 'append', {
      localRecordId: id,
      projectId: project.projectId,
      createdAt: '2026-09-11T05:01:00.000Z',
      expectedHead: project.currentHead,
      records: extras,
    }),
  );
  const before = await listKind(page, id, 'event');
  expect(before.length).toBeGreaterThan(400);
  const exported = await exportJson(page, id);
  expect(exported.recordCount).toBeGreaterThan(400);
  const imported = await importCopy(page, exported.json);
  const after = await listKind(page, imported.localRecordId, 'event');
  expect(after.length).toBe(before.length);
  await page.goto(`/project?id=${imported.localRecordId}&view=record`);
  await expect(page.locator('[data-page="page8"]')).toBeVisible();
  await expect(page.locator('[data-record-history]')).toHaveAttribute(
    'data-event-count',
    String(after.length),
  );
});

test('P8-08 export/import failure is visible and leaves existing projects intact', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: ACTORS.new.label }).click();
  await page.getByRole('button', { name: COPY.next }).click();
  await page.getByRole('button', { name: COPY.startOwn }).click();
  const id = await localRecordId(page);
  const savedBefore = requireOk(await repoCall(page, 'listSaved'));
  const failedExport = requireOk(
    await repoCall(page, 'exportArchive', { localRecordId: 'missing-namespace' }),
  );
  expect(failedExport.status).toBe('failed');
  const failedImport = requireOk(
    await repoCall(page, 'importArchive', { raw: '{not-json', serializedBytes: 10 }),
  );
  expect(failedImport.status).toBe('failed');
  const savedAfter = requireOk(await repoCall(page, 'listSaved'));
  expect(savedAfter.map((entry) => entry.localRecordId)).toEqual(
    savedBefore.map((entry) => entry.localRecordId),
  );

  await page.goto('/begin');
  await page.locator('[data-archive-input]').setInputFiles({
    name: 'broken.stb.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{not-json'),
  });
  await expect(page.locator('[data-import-status]')).toHaveText(COPY.recordImportFailed);
  expect(
    requireOk(await repoCall(page, 'listSaved')).some((entry) => entry.localRecordId === id),
  ).toBe(true);

  const exported = await exportJson(page, id);
  const parsed = JSON.parse(exported.json);
  const aborted = await repoCall(page, 'importNamespace', {
    project: parsed.project,
    records: parsed.records,
    blobs: {},
    archiveId: crypto.randomUUID(),
    unknownClass: false,
    createdAt: '2026-09-11T06:00:00.000Z',
    separateCopy: true,
    testFault: 'abort-after-writes',
  });
  expect(aborted.ok).toBe(false);
  expect(aborted.code).toBe('injected-abort');
  expect(
    requireOk(await repoCall(page, 'listSaved')).some((entry) => entry.localRecordId === id),
  ).toBe(true);
});

test('M2-06/T09 snapshot excludes later commits; duplicate archive is idempotent; collision does not merge', async ({
  page,
}) => {
  const id = await supportedBoard(page);
  const before = requireOk(await repoCall(page, 'project', { localRecordId: id }));
  const snapshot = requireOk(await repoCall(page, 'snapshot', { localRecordId: id }));
  expect(snapshot.namedHead).toBe(before.currentHead);
  await page.goto(`/project?id=${id}&view=hub&child=board`);
  await installMockTransport(page);
  await applyLengthUi(page, '46');
  const after = requireOk(await repoCall(page, 'project', { localRecordId: id }));
  expect(after.currentHead).not.toBe(before.currentHead);
  expect(snapshot.records.some((record) => record.id === after.currentHead)).toBe(false);
  expect(snapshot.namedHead).toBe(before.currentHead);

  const exported = await exportJson(page, id);
  const first = await importCopy(page, exported.json);
  expect(first.status).toBe('imported');
  const second = requireOk(
    await repoCall(page, 'importArchive', {
      raw: exported.json,
      serializedBytes: exported.json.length,
      separateCopy: true,
      createdAt: '2026-09-11T07:00:00.000Z',
    }),
  );
  expect(second.status).toBe('idempotent');
  expect(second.localRecordId).toBe(first.localRecordId);

  const collision = requireOk(
    await repoCall(page, 'importArchive', {
      raw: exported.json,
      serializedBytes: exported.json.length,
      separateCopy: false,
      createdAt: '2026-09-11T07:01:00.000Z',
    }),
  );
  expect(collision.status).toBe('idempotent');

  const otherExport = await exportJson(page, id);
  expect(otherExport.document.manifest.archiveId).not.toBe(exported.document.manifest.archiveId);
  const colliding = requireOk(
    await repoCall(page, 'importArchive', {
      raw: otherExport.json,
      serializedBytes: otherExport.json.length,
      separateCopy: false,
      createdAt: '2026-09-11T07:02:00.000Z',
    }),
  );
  expect(colliding.status).toBe('collision');
  expect(colliding.existing.projectId).toBe(before.projectId);
  const copy = await importCopy(page, otherExport.json);
  expect(copy.status).toBe('imported');
  expect(copy.localRecordId).not.toBe(id);
  expect(copy.localRecordId).not.toBe(first.localRecordId);
  expect(copy.projectId).toBe(before.projectId);
});

test('M2-06/T10 imported SUPPORTABLE review is not current until a new local answer', async ({
  page,
}) => {
  const id = await supportedBoard(page);
  const exported = await exportJson(page, id);
  const imported = await importCopy(page, exported.json);
  const store = requireOk(
    await repoCall(page, 'currentStore', { localRecordId: imported.localRecordId }),
  );
  expect(store.current).toBe(false);
  expect(store.imported).toBe(true);
  expect(store.historical).toBe(true);
  const presentation = requireOk(
    await repoCall(page, 'loadReviewPresentation', { localRecordId: imported.localRecordId }),
  );
  expect(presentation.currentReview).toBeNull();
  expect(presentation.historicalReviews.length).toBeGreaterThan(0);
  expect(presentation.predicate.completeSupportedReviewAvailable).toBe(false);
  expect(presentation.snapshot.unresolvedConditions).toContain('imported-inert');

  await page.evaluate((href) => {
    window.history.pushState({ path: href }, '', href);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, `/project?id=${imported.localRecordId}&view=hub&child=board`);
  await expect(page.locator('[data-child-panel="board"]')).toBeVisible();
  await waitForStoreIdle(page);
  const localStore = requireOk(
    await repoCall(page, 'currentStore', { localRecordId: imported.localRecordId }),
  );
  expect(localStore.current).toBe(true);
  expect(localStore.imported).toBe(false);
  expect(localStore.request.imported).not.toBe(true);
  const afterPresentation = requireOk(
    await repoCall(page, 'loadReviewPresentation', { localRecordId: imported.localRecordId }),
  );
  expect(afterPresentation.currentReview).toBeNull();
  expect(
    afterPresentation.reviews.every(
      (record) => record.imported === true || record.id !== afterPresentation.currentReview?.id,
    ),
  ).toBe(true);
  await page.getByRole('button', { name: COPY.reviewConfirm }).click();
  await expect(page.locator('[data-page="page7"]')).toBeVisible();
  const reviews = await listKind(page, imported.localRecordId, 'review');
  expect(reviews.length).toBe(2);
  const localReview = reviews.find((record) => record.imported !== true);
  expect(localReview.payload.type).toBe(REVIEW_RECORD_TYPES.DefinitionReviewRecorded);
  const current = requireOk(
    await repoCall(page, 'loadReviewPresentation', { localRecordId: imported.localRecordId }),
  );
  expect(current.currentReview.id).toBe(localReview.id);
});

test('P8-01 original source bytes survive archive roundtrip', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: ACTORS.new.label }).click();
  await page.getByRole('button', { name: COPY.next }).click();
  await page.getByRole('button', { name: COPY.startOwn }).click();
  const id = await localRecordId(page);
  const project = requireOk(await repoCall(page, 'project', { localRecordId: id }));
  const prepared = requireOk(
    await repoCall(page, 'prepareFile', {
      bytes: asArray(JPEG_FIXTURE.bytes),
      type: JPEG_FIXTURE.type,
      filename: 'opening.jpg',
      role: 'source-file',
    }),
  );
  requireOk(
    await repoCall(page, 'attachEvidence', {
      localRecordId: id,
      expectedHead: project.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      prepared,
    }),
  );
  const exported = await exportJson(page, id);
  const imported = await importCopy(page, exported.json);
  const evidence = requireOk(
    await repoCall(page, 'listEvidence', { localRecordId: imported.localRecordId }),
  );
  const blob = requireOk(await repoCall(page, 'blob', { sha256: evidence[0].payload.sha256 }));
  expect(blob.status).toBe('retained');
  expect(blob.bytes).toEqual(asArray(JPEG_FIXTURE.bytes));
  expect(evidence[0].payload.originalFilename).toBe('opening.jpg');
  expect(evidence[0].payload.declaredMime).toBe(JPEG_FIXTURE.type);
});
