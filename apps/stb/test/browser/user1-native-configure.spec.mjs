import { expect, test } from '@playwright/test';

import {
  ACTORS,
  COPY,
  STORE_REQUEST_TYPES,
  STORE_SCOPES,
  USER_DEFINED_BOARD_DEFINITION,
} from '../../shared/contracts.mjs';
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

async function localRecordId(page) {
  return page.locator('[data-local-record-id]').getAttribute('data-local-record-id');
}

async function installCaptureTransport(page) {
  await page.evaluate(async () => {
    const { setStoreTransport } = await import('/integration/store-client.mjs');
    const {
      STORE_PIN,
      STORE_PROTOCOL_VERSION,
      STORE_FRESH_EVALUATION_RULE_ID,
      WRAPPER_BUILD_ID,
    } = await import('/shared/contracts.mjs');
    window.__user1StoreCalls = [];
    setStoreTransport(async (_url, init) => {
      const wire = JSON.parse(init.body);
      window.__user1StoreCalls.push(structuredClone(wire));
      const line = wire.payload?.line ?? {};
      return new Response(JSON.stringify({
        protocolVersion: STORE_PROTOCOL_VERSION,
        wrapperBuildId: WRAPPER_BUILD_ID,
        storePin: STORE_PIN,
        requestId: wire.requestId,
        projectId: wire.projectId,
        candidateRevisionId: wire.candidateRevisionId,
        requestType: wire.requestType,
        scope: wire.scope,
        demandSignature: wire.demandSignature,
        querySignature: wire.querySignature,
        payloadDigest: wire.payloadDigest,
        attemptId: wire.attemptId,
        attemptNumber: wire.attemptNumber,
        wrapperRespondedAt: new Date().toISOString(),
        responseId: crypto.randomUUID(),
        rawOffering: null,
        rawEvaluation: {
          status: 'SUPPORTABLE',
          freshEvaluation: true,
          evaluationReceipt: {
            requestId: wire.requestId,
            freshnessRule: STORE_FRESH_EVALUATION_RULE_ID,
            authority: { storeRevision: STORE_PIN },
            receiptHash: `test-receipt-${wire.requestId}`,
          },
          lines: [{
            lineId: line.lineId ?? null,
            status: 'SUPPORTABLE',
            requiredOps: Array.isArray(line.requiredOps) ? line.requiredOps : [],
            capability: { status: 'SUPPORTABLE' },
          }],
        },
        rawEstimate: null,
        attributedBasis: {
          sourceClock: 'test-only',
          measured: false,
          commissioned: false,
          budgetaryEstimateIsNotAQuote: true,
          modeledTimeIsNotAMachineWorkPlan: true,
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });
}

async function waitForCalls(page, count) {
  await page.waitForFunction(
    (expected) => Array.isArray(window.__user1StoreCalls) && window.__user1StoreCalls.length === expected,
    count,
  );
}

test('Job 1 bench is a native own-entry definition with fresh User-defined Board Store requests', async ({ page }) => {
  await openBoard(page);
  await installCaptureTransport(page);
  const id = await localRecordId(page);

  await page.getByRole('button', { name: 'TAKE THIS 2×4 TO THE BENCH' }).click();
  await expect(page.locator('[data-user1-configure="true"]')).toBeVisible();
  await waitForCalls(page, 1);

  const candidate16 = requireOk(await repoCall(page, 'currentCandidate', { localRecordId: id }));
  const projection16 = requireOk(await repoCall(page, 'currentProjection', { localRecordId: id }));
  expect(candidate16.payload.classReference ?? null).toBeNull();
  expect(candidate16.payload.definitionKind).toBe(USER_DEFINED_BOARD_DEFINITION.kind);
  expect(projection16.payload.definitionKind).toBe(USER_DEFINED_BOARD_DEFINITION.kind);
  expect(projection16.payload.classId).toBeNull();
  expect(projection16.payload.derived.angleDeg).toBe(30);
  expect(projection16.payload.derived.definedWorkpieceLengthIn.value).toBe(60);
  expect(projection16.payload.parts.map((part) => part.lengthIn)).toEqual([16, 16]);
  expect(projection16.payload.parts.map((part) => part.features[0].xIn)).toEqual([8, 8]);

  await expect(page.locator('[data-definition-kind="user_defined_board.v1"]')).toBeVisible();
  await expect(page.locator('[data-user1-workpiece]')).toHaveAttribute('data-user1-workpiece', '60');
  await expect(page.locator('[data-user1-parts] [data-user1-part]')).toHaveCount(2);
  await expect(page.locator('[data-store-disposition]')).toHaveText('SUPPORTABLE');
  await expect(page.locator('[data-store-q]')).toHaveAttribute('data-store-q', 'none');

  const first = await page.evaluate(() => window.__user1StoreCalls[0]);
  expect(first.requestType).toBe(STORE_REQUEST_TYPES.USER_DEFINED_BOARD_V1);
  expect(first.scope).toBe(STORE_SCOPES.USER_DEFINED_BOARD_V1);
  expect(first.payload.definitionKind).toBe(USER_DEFINED_BOARD_DEFINITION.kind);
  expect(first.payload.line.configurationId).toBe('SYO-USER1-XBRACE');
  expect(first.payload.line.configurationVersion).toBe('0.1');
  expect(first.payload.line.definedWorkpieceLength).toEqual({ value: '60', unit: 'in' });
  expect(first.payload.line.sawCuts).toBe(3);
  expect(first.payload.line.sawAngleDeg).toBe(30);
  expect(first.payload.line.cutPlane).toBe('miter-face');
  expect(first.payload.line.endRelation).toBe('parallel');
  expect(first.payload.line.lengthDatum).toBe('long-long-outer-edge');
  expect(first.payload.line.materialSource).toBe('STORE_ZERO');
  expect(first.payload.line.parts.map((part) => part.lengthIn)).toEqual([16, 16]);
  expect(first.payload.line.parts.map((part) => part.features[0].xIn)).toEqual([8, 8]);

  const head16 = candidate16.id;
  const length = page.locator('[data-field="user1-part-length"]');
  await length.fill('18');
  await length.evaluate((node) => node.dispatchEvent(new Event('change', { bubbles: true })));
  await waitForCalls(page, 2);

  const candidate18 = requireOk(await repoCall(page, 'currentCandidate', { localRecordId: id }));
  const projection18 = requireOk(await repoCall(page, 'currentProjection', { localRecordId: id }));
  expect(candidate18.id).not.toBe(head16);
  expect(candidate18.payload.definitionKind).toBe(USER_DEFINED_BOARD_DEFINITION.kind);
  expect(projection18.payload.derived.angleDeg).toBeCloseTo(26.387799961243, 10);
  expect(projection18.payload.derived.definedWorkpieceLengthIn.value).toBe(60);
  expect(projection18.payload.parts.map((part) => part.lengthIn)).toEqual([18, 18]);
  expect(projection18.payload.parts.map((part) => part.features[0].xIn)).toEqual([9, 9]);

  const second = await page.evaluate(() => window.__user1StoreCalls[1]);
  expect(second.candidateRevisionId).not.toBe(first.candidateRevisionId);
  expect(second.requestType).toBe(STORE_REQUEST_TYPES.USER_DEFINED_BOARD_V1);
  expect(second.payload.line.configurationVersion).toBe('0.2');
  expect(second.payload.line.definedWorkpieceLength).toEqual({ value: '60', unit: 'in' });
  expect(second.payload.line.sawAngleDeg).toBeCloseTo(26.387799961243, 10);
  expect(second.payload.line.parts.map((part) => part.lengthIn)).toEqual([18, 18]);
  expect(second.payload.line.parts.map((part) => part.features[0].xIn)).toEqual([9, 9]);

  expect(requireOk(await repoCall(page, 'listRecords', { localRecordId: id, kind: 'request' }))).toHaveLength(2);

  const head18 = candidate18.id;
  await page.getByRole('button', { name: 'UPDATE DEFINITION' }).click();
  await expect.poll(async () =>
    (await page.evaluate(() => window.__user1StoreCalls.length))
  ).toBe(2);
  const candidateAfterRepeat = requireOk(await repoCall(page, 'currentCandidate', { localRecordId: id }));
  expect(candidateAfterRepeat.id).toBe(head18);
  expect(requireOk(await repoCall(page, 'listRecords', { localRecordId: id, kind: 'request' }))).toHaveLength(2);
});
