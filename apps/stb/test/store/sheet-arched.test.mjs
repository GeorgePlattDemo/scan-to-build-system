import assert from 'node:assert/strict';
import test from 'node:test';

import { canonicalInchString } from '../../shared/canonical.mjs';
import {
  PUBLISHED_ARCHED_SHEET_SKU,
  PUBLISHED_BOARD_SKU,
  STORE_PIN,
  STORE_REQUEST_TYPES,
} from '../../shared/contracts.mjs';
import { createStoreAdapter } from '../../server/store-adapter.mjs';
import {
  boardJobBody,
  parseJson,
  postJob,
  requireCleanPinnedStore,
} from './helpers.mjs';
import {
  archedDemandSignature,
  archedJobPayload,
  buildArchedJobRequest,
} from '../../shared/store-wire.mjs';
import { startServer } from '../../server/main.mjs';

async function archedJobBody() {
  const payload = archedJobPayload({
    lineId: crypto.randomUUID(),
    storeSku: PUBLISHED_ARCHED_SHEET_SKU,
    outerLengthCanonical: canonicalInchString(72),
    outerWidthCanonical: canonicalInchString(48),
    apertureWidthCanonical: canonicalInchString(36),
    apertureStraightHeightCanonical: canonicalInchString(36),
    arcChordCanonical: canonicalInchString(36),
    arcRiseCanonical: canonicalInchString(12),
    arcRadiusCanonical: canonicalInchString(19.5),
    tabCount: 4,
    routeDepthCanonical: canonicalInchString(0.5),
  });
  return buildArchedJobRequest({
    requestId: crypto.randomUUID(),
    projectId: crypto.randomUUID(),
    candidateRevisionId: crypto.randomUUID(),
    attemptId: crypto.randomUUID(),
    attemptNumber: 1,
    sentAt: new Date().toISOString(),
    demandSignature: await archedDemandSignature(payload),
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

test('arched aperture job is SUPPORTABLE on the 1/2 in SKU and does not emit controller data', async (t) => {
  const { adapter } = await withHost(t);
  const body = parseJson(await postJob(await archedJobBody()));
  assert.equal(body.storePin, STORE_PIN);
  assert.equal(body.requestType, STORE_REQUEST_TYPES.SHEET_MODE2_ARCHED_APERTURE_V0);
  assert.equal(body.rawEvaluation.status, 'SUPPORTABLE');
  assert.equal(body.rawEvaluation.jobType, 'SHEET_MODE2_ARCHED_APERTURE_V0');
  assert.equal(body.rawEvaluation.geometryClass, 'CURVILINEAR');
  assert.equal(body.rawEvaluation.basis.observationId, 'OBS-017');
  assert.equal(body.rawEvaluation.basis.list_reference, 25.29);
  assert.equal(body.rawEvaluation.line.capability.curve.radius_in, 19.5);
  assert.equal(body.rawEvaluation.line.capability.retention.fullSeverance, false);
  assert.ok(body.rawEvaluation.not_claimed.includes('G-code'));
  assert.ok(body.rawEvaluation.not_claimed.includes('Cycle Start'));
  assert.equal(body.rawEstimate.status, 'BUDGETARY_MATERIAL_ONLY');
  assert.equal(body.rawEstimate.processQ_status, 'UNRESOLVED');
  assert.equal(JSON.stringify(body).includes('G2'), false);
  assert.ok(adapter.modules.evaluateSheetMode2ArchedJob);

  const board = parseJson(await postJob(await boardJobBody({ keptLengthIn: 45 })));
  assert.equal(board.rawEvaluation.status, 'SUPPORTABLE');
  assert.equal(board.mappedCallInputs.evaluation.lines[0].storeSku, PUBLISHED_BOARD_SKU);
});
