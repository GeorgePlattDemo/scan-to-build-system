import assert from 'node:assert/strict';
import test from 'node:test';

import { canonicalInchString } from '../../shared/canonical.mjs';
import {
  PUBLISHED_BOARD_SKU,
  PUBLISHED_SHEET_SKU,
  STORE_PIN,
  STORE_REQUEST_TYPES,
} from '../../shared/contracts.mjs';
import { createStoreAdapter } from '../../server/store-adapter.mjs';
import {
  boardJobBody,
  offeringLookupBody,
  parseJson,
  postJob,
  postOffering,
  requireCleanPinnedStore,
} from './helpers.mjs';
import {
  buildSheetJobRequest,
  sheetDemandSignature,
  sheetJobPayload,
} from '../../shared/store-wire.mjs';
import { startServer } from '../../server/main.mjs';

async function sheetJobBody({
  profileKind = 'STRAIGHT_RECT',
  blankL = 24,
  blankW = 18,
  tabCount = 4,
  routeDepth = 0.5,
} = {}) {
  const payload = sheetJobPayload({
    lineId: crypto.randomUUID(),
    storeSku: PUBLISHED_SHEET_SKU,
    profileKind,
    blankLengthCanonical: canonicalInchString(blankL),
    blankWidthCanonical: canonicalInchString(blankW),
    tabCount,
    routeDepthCanonical: canonicalInchString(routeDepth),
  });
  return buildSheetJobRequest({
    requestId: crypto.randomUUID(),
    projectId: crypto.randomUUID(),
    candidateRevisionId: crypto.randomUUID(),
    attemptId: crypto.randomUUID(),
    attemptNumber: 1,
    sentAt: new Date().toISOString(),
    demandSignature: await sheetDemandSignature(payload),
    payload,
  });
}

async function withHost(t) {
  await requireCleanPinnedStore();
  const adapter = await createStoreAdapter();
  assert.equal(adapter.ready, true, JSON.stringify(adapter.inspection));
  const host = await startServer({ storeAdapter: adapter });
  t.after(() => host.close());
  return { adapter, host };
}

test('sheet Mode-2 job evaluates independently of BOARD_SQUARE_V1', async (t) => {
  const { adapter } = await withHost(t);
  const straight = await postJob(await sheetJobBody({ profileKind: 'STRAIGHT_RECT' }));
  assert.equal(straight.status, 200);
  const body = parseJson(straight);
  assert.equal(body.storePin, STORE_PIN);
  assert.equal(body.requestType, STORE_REQUEST_TYPES.SHEET_MODE2_STENCIL_V1);
  assert.equal(body.rawEvaluation.status, 'SUPPORTABLE');
  assert.equal(body.rawEvaluation.jobType, 'SHEET_MODE2_STENCIL_V1');
  assert.equal(body.rawEvaluation.evidenceClass, 'REFERENCE');
  assert.equal(body.rawEvaluation.commissioned, false);
  assert.equal(body.rawEvaluation.line.capability.profileKind, 'STRAIGHT_RECT');
  assert.ok(body.rawEvaluation.neutralOps.includes('ROUTE_PROFILE'));
  assert.ok(body.rawEvaluation.neutralOps.includes('RETAIN_TABS'));
  assert.ok(body.rawEvaluation.not_claimed.includes('G-code'));
  assert.equal(body.rawEstimate.status, 'BUDGETARY_MATERIAL_ONLY');
  assert.equal(body.rawEstimate.processQ_status, 'UNRESOLVED');

  const curve = parseJson(await postJob(await sheetJobBody({ profileKind: 'CURVILINEAR_OUTLINE' })));
  assert.equal(curve.rawEvaluation.line.capability.profileKind, 'CURVILINEAR_OUTLINE');

  const board = parseJson(await postJob(await boardJobBody({ keptLengthIn: 45 })));
  assert.equal(board.rawEvaluation.status, 'SUPPORTABLE');
  assert.equal(board.mappedCallInputs.evaluation.lines[0].storeSku, PUBLISHED_BOARD_SKU);

  const offering = parseJson(await postOffering(await offeringLookupBody({
    payload: { requestedStoreSku: PUBLISHED_SHEET_SKU },
  })));
  assert.equal(offering.found, true);
  assert.equal(offering.rawOffering.form, 'sheet');
  assert.ok(adapter.modules.evaluateSheetMode2Job);
});
