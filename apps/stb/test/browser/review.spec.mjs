import { expect, test } from '@playwright/test';

import {
  ACTORS,
  COPY,
  REVIEW_RECORD_TYPES,
} from '../../shared/contracts.mjs';
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

async function waitForStoreIdle(page, mode = 'compact') {
  const panel = page.locator(`[data-store-panel="${mode}"]`).first();
  await expect(panel).toBeVisible();
  await expect(panel).not.toHaveAttribute('data-pending', 'true', STORE_IDLE);
}

async function applyLengthUi(page, raw, unit = 'in', { waitForIdle = true } = {}) {
  await page.locator('[data-field="board-length"]').fill(raw);
  await page.locator('[data-field="board-unit"]').fill(unit);
  await page.getByRole('button', { name: COPY.boardApply }).click();
  await expect(page.locator('[data-unapplied="board"]')).toBeHidden();
  await expect(page.locator('[data-candidate-view="true"]')).toBeVisible();
  const valid = await page.locator('[data-candidate-view="true"]').getAttribute('data-valid');
  if (waitForIdle && valid === 'true') {
    await waitForStoreIdle(page);
  }
}

async function localRecordId(page) {
  return page.locator('[data-local-record-id]').getAttribute('data-local-record-id');
}

async function listKind(page, id, kind) {
  return requireOk(await repoCall(page, 'listRecords', { localRecordId: id, kind }));
}

async function openBoardChild(page, id) {
  await page.goto(`/project?id=${id}&view=hub&child=board`);
  await expect(page.locator('[data-child-panel="board"]')).toBeVisible();
  await installMockTransport(page);
}

async function installMockTransport(page) {
  await page.evaluate(async () => {
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
        status: 'SUPPORTABLE',
        lines: [
          {
            stock: { status: 'ON_HAND_SUFFICIENT', available: 84, qtyNeeded: 1, asOf: '2026-09-10' },
            price: { sellingPrice: 3.13, asOf: '2026-09-10' },
            capability: { status: 'SUPPORTABLE' },
          },
        ],
      },
      rawEstimate:
        extra.rawEstimate === undefined
          ? {
              status: 'BUDGETARY_ESTIMATE',
              totals: { material: 3.13, cell_recovery: 50.81, Q: 53.94 },
              cycle: { model: 'STB-D001-CYCLE-MODEL-S2-0.1', T_job_min: 9.486, measured: false },
              engine: { id: 'STB-STORE-ZERO-PRICE-1', version: '0.2.2' },
            }
          : extra.rawEstimate,
      attributedBasis: extra.attributedBasis ?? {
        pricingEngine: { id: 'STB-STORE-ZERO-PRICE-1', version: '0.2.2' },
        cycleModel: { id: 'STB-D001-CYCLE-MODEL-S2-0.1' },
        envelope: { id: 'D001-STAGE2-ENVELOPE-0.2' },
        sourceClock: extra.sourceClock ?? '2026-09-10',
        measured: false,
        commissioned: false,
      },
      ...extra,
    });
    setStoreTransport(async (_url, init) => {
      const wire = JSON.parse(init.body);
      if (typeof window.__storeHandler === 'function') {
        return window.__storeHandler(_url, init, wire);
      }
      return new Response(JSON.stringify(window.__echoEnvelope(wire)), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });
}

test('P6-01 / M2-14/C01 supported Board review binds the actual Store response and is idempotent', async ({
  page,
}) => {
  await openBoard(page);
  await installMockTransport(page);
  await applyLengthUi(page, '45');
  const id = await localRecordId(page);
  const candidate = requireOk(await repoCall(page, 'currentCandidate', { localRecordId: id }));
  const store = requireOk(await repoCall(page, 'currentStore', { localRecordId: id }));
  expect(store.current).toBe(true);
  expect(store.response.payload.wrapperEnvelope.rawEvaluation.status).toBe('SUPPORTABLE');
  await expect(page.locator('[data-review-actions="inline"]')).toHaveAttribute(
    'data-complete-supported',
    'true',
  );

  await page.getByRole('button', { name: COPY.reviewConfirm }).click();
  await expect(page.locator('[data-page="page7"]')).toBeVisible();
  await expect(page.locator('[data-result-retained]')).toHaveText(COPY.resultRetained);
  await expect(page.locator('[data-physical-outcome]')).toHaveAttribute(
    'data-physical-outcome',
    'absent',
  );

  const reviews = await listKind(page, id, 'review');
  expect(reviews).toHaveLength(1);
  const review = reviews[0];
  expect(review.payload.type).toBe(REVIEW_RECORD_TYPES.DefinitionReviewRecorded);
  expect(review.payload.candidateRevisionId).toBe(candidate.id);
  expect(review.payload.projectionId).toBe(candidate.payload.projectionId);
  expect(review.payload.occurrenceIds).toEqual(candidate.payload.activeOccurrenceIds);
  expect(review.payload.definitionRevisionIds).toEqual([candidate.payload.definitionRevisionId]);
  expect(review.payload.requestId).toBe(store.request.id);
  expect(review.payload.attemptId).toBe(store.attempt.id);
  expect(review.payload.responseId).toBe(store.response.id);
  expect(review.payload.estimateAssociationId).toBe(store.response.payload.estimateAssociationId);
  expect(review.payload.storeDisposition).toBe('SUPPORTABLE');
  expect(review.payload.estimateQ).toBe(53.94);
  expect(review.payload.authority).toBe(false);
  expect(review.payload.commercial).toBe(false);
  expect(review.payload.physical).toBe(false);

  const events = await listKind(page, id, 'event');
  const reviewEvent = events.find((event) => event.payload?.reviewId === review.id);
  expect(reviewEvent.payload.type).toBe(REVIEW_RECORD_TYPES.DefinitionReviewRecorded);
  const actions = await listKind(page, id, 'action');
  const reviewAction = actions.find((record) => record.payload?.eventId === reviewEvent.id);
  const replay = requireOk(
    await repoCall(page, 'recordReview', {
      localRecordId: id,
      actionId: reviewAction.id,
      createdAt: '2026-09-11T03:01:00.000Z',
    }),
  );
  expect(replay.status).toBe('idempotent');
  expect(replay.reviewId).toBe(review.id);
  expect(await listKind(page, id, 'review')).toHaveLength(1);
  const afterHead = requireOk(await repoCall(page, 'currentCandidate', { localRecordId: id }));
  expect(afterHead.id).toBe(candidate.id);
  expect(await listKind(page, id, 'request')).toHaveLength(1);
});

test('P6-07 inline and full Page 6 use the same confirm handler', async ({ page }) => {
  await openBoard(page);
  await installMockTransport(page);
  await applyLengthUi(page, '45');
  await page.getByRole('button', { name: COPY.reviewOpenPage }).click();
  await expect(page.locator('[data-page="page6"]')).toBeVisible();
  await expect(page.getByRole('heading', { name: COPY.reviewHeading })).toBeVisible();
  await expect(page.locator('[data-review-supplied]')).toBeVisible();
  await expect(page.locator('[data-review-chose]')).toBeVisible();
  await expect(page.locator('[data-review-parts]')).toBeVisible();
  await expect(page.locator('[data-review-store]')).toBeVisible();
  await expect(page.locator('[data-review-meaning]')).toContainText(COPY.reviewMeaningBody);
  await expect(page.locator('[data-trace-step="lowering"]')).toHaveAttribute(
    'data-trace-status',
    'unavailable',
  );
  await expect(page.locator('[data-trace-step="outcome"]')).toHaveAttribute(
    'data-trace-status',
    'unavailable',
  );
  await page.locator('[data-review-actions="full"] [data-action="confirm-definition"]').click();
  await expect(page.locator('[data-page="page7"]')).toBeVisible();
  const id = await localRecordId(page);
  expect(await listKind(page, id, 'review')).toHaveLength(1);
});

test('P6-02 changing length keeps the old review historical', async ({ page }) => {
  await openBoard(page);
  await installMockTransport(page);
  await applyLengthUi(page, '45');
  await page.getByRole('button', { name: COPY.reviewConfirm }).click();
  await expect(page.locator('[data-page="page7"]')).toBeVisible();
  const id = await localRecordId(page);
  const first = (await listKind(page, id, 'review'))[0];
  await openBoardChild(page, id);
  await applyLengthUi(page, '46');
  const presentation = requireOk(
    await repoCall(page, 'loadReviewPresentation', { localRecordId: id }),
  );
  expect(presentation.currentReview).toBeNull();
  expect(presentation.historicalReviews.some((record) => record.id === first.id)).toBe(true);
  await page.getByRole('link', { name: 'Review', exact: true }).click();
  await expect(page.locator('[data-page="page6"]')).toBeVisible();
  await expect(page.locator(`[data-historical-review="${first.id}"]`)).toBeVisible();
});

test('P6-03 / M2-14/C02 a new Store basis requires re-review at the same length', async ({
  page,
}) => {
  await openBoard(page);
  await installMockTransport(page);
  await page.evaluate(() => {
    window.__storeHandler = async (_url, _init, wire) => {
      const version = wire.attemptNumber > 1 ? '0.2.3' : '0.2.2';
      const q = wire.attemptNumber > 1 ? 54.01 : 53.94;
      return new Response(
        JSON.stringify(
          window.__echoEnvelope(wire, {
            rawEstimate: {
              status: 'BUDGETARY_ESTIMATE',
              totals: {
                material: 3.13,
                cell_recovery: wire.attemptNumber > 1 ? 50.88 : 50.81,
                Q: q,
              },
              cycle: { model: 'STB-D001-CYCLE-MODEL-S2-0.1', T_job_min: 9.486, measured: false },
              engine: { id: 'STB-STORE-ZERO-PRICE-1', version },
            },
            attributedBasis: {
              pricingEngine: { id: 'STB-STORE-ZERO-PRICE-1', version },
              cycleModel: { id: 'STB-D001-CYCLE-MODEL-S2-0.1' },
              envelope: { id: 'D001-STAGE2-ENVELOPE-0.2' },
              sourceClock: wire.attemptNumber > 1 ? '2026-09-11' : '2026-09-10',
              measured: false,
              commissioned: false,
            },
          }),
        ),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    };
  });
  await applyLengthUi(page, '45');
  await page.getByRole('button', { name: COPY.reviewConfirm }).click();
  await expect(page.locator('[data-page="page7"]')).toBeVisible();
  const id = await localRecordId(page);
  const first = (await listKind(page, id, 'review'))[0];
  requireOk(
    await repoCall(page, 'retryStore', {
      localRecordId: id,
      requestId: first.payload.requestId,
    }),
  );
  const presentation = requireOk(
    await repoCall(page, 'loadReviewPresentation', { localRecordId: id }),
  );
  expect(presentation.currentReview).toBeNull();
  expect(presentation.historicalReviews.some((record) => record.id === first.id)).toBe(true);
  expect(presentation.snapshot.requestId).toBe(first.payload.requestId);
  expect(presentation.snapshot.responseId).not.toBe(first.payload.responseId);
  expect(presentation.predicate.completeSupportedReviewAvailable).toBe(true);
});

test('P6-04 / M2-14/C03 incomplete and REFUSED cannot confirm and can acknowledge unresolved', async ({
  page,
}) => {
  await openBoard(page);
  await installMockTransport(page);
  await applyLengthUi(page, '16', 'in', { waitForIdle: false });
  await expect(page.locator('[data-review-actions="inline"]')).toHaveAttribute(
    'data-complete-supported',
    'false',
  );
  await expect(page.locator('[data-review-actions="inline"]')).toHaveAttribute(
    'data-unresolved-available',
    'true',
  );
  await expect(page.getByRole('button', { name: COPY.reviewConfirm })).toHaveCount(0);
  await page.getByRole('button', { name: COPY.reviewUnresolved }).click();
  await expect(page.locator('[data-page="page7"]')).toBeVisible();
  const id = await localRecordId(page);
  let reviews = await listKind(page, id, 'review');
  expect(reviews).toHaveLength(1);
  expect(reviews[0].payload.type).toBe(REVIEW_RECORD_TYPES.UnresolvedDefinitionAcknowledged);

  await openBoardChild(page, id);
  await page.evaluate(() => {
    window.__storeHandler = async (_url, _init, wire) =>
      new Response(
        JSON.stringify(
          window.__echoEnvelope(wire, {
            rawEvaluation: {
              status: 'REFUSED',
              lines: [
                {
                  capability: { status: 'REFUSED', reason: 'OP_NOT_ON_OFFERING:RIP' },
                },
              ],
            },
            rawEstimate: null,
          }),
        ),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
  });
  await applyLengthUi(page, '45');
  await expect(page.locator('[data-store-disposition]')).toHaveText('REFUSED');
  const refusedCall = await repoCall(page, 'recordReview', {
    localRecordId: id,
    actionId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  });
  expect(refusedCall.ok).toBe(false);
  expect(refusedCall.code).toBe('review-not-supported');
  const acknowledged = requireOk(
    await repoCall(page, 'acknowledgeUnresolved', {
      localRecordId: id,
      actionId: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }),
  );
  expect(acknowledged.review.payload.type).toBe(
    REVIEW_RECORD_TYPES.UnresolvedDefinitionAcknowledged,
  );
  reviews = await listKind(page, id, 'review');
  expect(reviews.length).toBe(2);
  const head = requireOk(await repoCall(page, 'currentCandidate', { localRecordId: id }));
  expect(head.payload.definitionRevisionId).toBeTruthy();
});

test('P6-05 / M2-14/C04 manual 60 and CUT-001 stay distinct and mint no authority', async ({
  page,
}) => {
  await openBoard(page);
  await installMockTransport(page);
  await applyLengthUi(page, '60');
  await page.getByRole('button', { name: COPY.reviewConfirm }).click();
  await expect(page.locator('[data-page="page7"]')).toBeVisible();
  const id = await localRecordId(page);
  const manual = (await listKind(page, id, 'review'))[0];
  expect(manual.payload.authority).toBe(false);
  expect(manual.payload.physical).toBe(false);
  expect(manual.payload.mappings[0].method).toBe('entered');
  await openBoardChild(page, id);
  await page.getByRole('button', { name: COPY.boardCut001 }).click();
  await expect
    .poll(async () => {
      const presentation = requireOk(
        await repoCall(page, 'loadReviewPresentation', { localRecordId: id }),
      );
      const method = presentation.snapshot?.mappings?.[0]?.method ?? null;
      return {
        method,
        complete: presentation.predicate?.completeSupportedReviewAvailable === true,
      };
    }, STORE_IDLE)
    .toEqual({ method: 'documentary-reference', complete: true });
  const cut = requireOk(
    await repoCall(page, 'recordReview', {
      localRecordId: id,
      actionId: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }),
  );
  expect(cut.review.payload.mappings[0].method).toBe('documentary-reference');
  expect(cut.review.payload.reviewDigest).not.toBe(manual.payload.reviewDigest);
  expect(cut.review.payload.authority).toBe(false);
  expect(cut.review.payload.physical).toBe(false);
  expect(await listKind(page, id, 'review')).toHaveLength(2);
});

test('P6-06 trace marks unperformed lowering and outcome unavailable', async ({ page }) => {
  await openBoard(page);
  await installMockTransport(page);
  await applyLengthUi(page, '45');
  await page.getByRole('button', { name: COPY.reviewOpenPage }).click();
  await expect(page.locator('[data-trace-step="lowering"]')).toHaveAttribute(
    'data-trace-status',
    'unavailable',
  );
  await expect(page.locator('[data-trace-step="outcome"]')).toHaveAttribute(
    'data-trace-status',
    'unavailable',
  );
  await expect(page.locator('[data-trace-step="neutral-work"]')).toHaveAttribute(
    'data-trace-status',
    'unavailable',
  );
});

test('unapplied edit buffer disables successful review', async ({ page }) => {
  await openBoard(page);
  await installMockTransport(page);
  await applyLengthUi(page, '45');
  await page.locator('[data-field="board-length"]').fill('46');
  await expect(page.locator('[data-unapplied="board"]')).toBeVisible();
  await expect(page.locator('[data-review-blocked="unapplied"]')).toBeVisible();
  await expect(page.getByRole('button', { name: COPY.reviewConfirm })).toHaveCount(0);
  const id = await localRecordId(page);
  const blocked = await repoCall(page, 'recordReview', {
    localRecordId: id,
    actionId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    unapplied: true,
  });
  expect(blocked.ok).toBe(false);
  expect(blocked.code).toBe('review-not-supported');
});
