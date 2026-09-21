import assert from 'node:assert/strict';
import test from 'node:test';

import {
  BOARD_OFFERING_QUERY,
  PUBLISHED_BOARD_SKU,
  STORE_PATHS,
  STORE_PIN,
  STORE_PROTOCOL_VERSION,
  WRAPPER_BUILD_ID,
} from '../../shared/contracts.mjs';
import { ADAPTER_ERROR_CODES } from '../../shared/store-wire.mjs';
import { createStoreAdapter } from '../../server/store-adapter.mjs';
import { startServer } from '../../server/main.mjs';
import { postJson, rawRequest } from '../helpers/http.mjs';
import {
  boardJobBody,
  offeringLookupBody,
  parseJson,
  postJob,
  postOffering,
  requireCleanPinnedStore,
  userDefinedBoardJobBody,
} from './helpers.mjs';

async function withHost(t) {
  await requireCleanPinnedStore();
  const adapter = await createStoreAdapter();
  assert.equal(adapter.ready, true, JSON.stringify(adapter.inspection));
  const host = await startServer({ storeAdapter: adapter });
  t.after(() => host.close());
  return { adapter, host };
}

test('offering lookup returns the matching published Board SKU only', async (t) => {
  const { adapter } = await withHost(t);
  const request = await offeringLookupBody();
  const response = await postOffering(request);
  assert.equal(response.status, 200);
  const body = parseJson(response);
  assert.equal(body.protocolVersion, STORE_PROTOCOL_VERSION);
  assert.equal(body.wrapperBuildId, WRAPPER_BUILD_ID);
  assert.equal(body.storePin, STORE_PIN);
  assert.equal(body.requestId, request.requestId);
  assert.equal(body.attemptId, request.attemptId);
  assert.equal(body.found, true);
  assert.equal(body.rawOffering.storeSku, PUBLISHED_BOARD_SKU);
  assert.equal(body.rawOffering.offered, true);
  assert.equal(body.rawOffering.form, 'board');
  assert.equal(body.rawOffering.species, 'spf');
  assert.equal(body.rawOffering.actualW, 3.5);
  assert.equal(body.rawOffering.actualT, 1.5);
  assert.equal(body.rawOffering.stockL_in, 72);
  assert.equal(body.rawOffering.uom, 'ea');
  assert.equal(body.rawEvaluation, undefined);
  assert.ok(!Array.isArray(body.rawOffering.offerings));
  assert.notEqual(body.rawOffering.skuCount, 92);
  const item = adapter.modules.findSku(adapter.catalog, PUBLISHED_BOARD_SKU);
  assert.equal(body.rawOffering.description, item.description);

  const byQuery = await postOffering(await offeringLookupBody({ payload: { ...BOARD_OFFERING_QUERY } }));
  assert.equal(byQuery.status, 200);
  assert.equal(parseJson(byQuery).rawOffering.storeSku, PUBLISHED_BOARD_SKU);
});

test('BOARD_SQUARE_V1 45-in and 46-in invoke actual evaluate then estimate', async (t) => {
  const { adapter } = await withHost(t);
  adapter.instrumentation.evaluationCalls = 0;
  adapter.instrumentation.estimateCalls = 0;

  const req45 = await boardJobBody({ keptLengthIn: 45 });
  const res45 = await postJob(req45);
  assert.equal(res45.status, 200);
  const body45 = parseJson(res45);
  assert.equal(body45.rawEvaluation.status, 'SUPPORTABLE');
  assert.equal(body45.mappedCallInputs.evaluation.lines[0].storeSku, PUBLISHED_BOARD_SKU);
  assert.equal(body45.mappedCallInputs.evaluation.lines[0].qty, 1);
  assert.deepEqual(body45.mappedCallInputs.evaluation.lines[0].requiredOps, ['CROSSCUT']);
  assert.equal(body45.mappedCallInputs.evaluation.lines[0].keptLengthIn, 45);
  assert.equal(body45.mappedCallInputs.estimate.pieces[0].keptLengthIn, 45);
  assert.equal(body45.mappedCallInputs.estimate.pieces[0].widthIn, 3.5);
  assert.equal(body45.mappedCallInputs.estimate.classId, 'app.board.square.v1');
  assert.equal(body45.mappedCallInputs.estimate.hardwareSku, undefined);
  assert.equal(body45.rawEstimate.status, 'BUDGETARY_ESTIMATE');
  assert.ok(body45.estimateAssociationId);
  assert.equal(body45.rawEstimate.engine.id, 'STB-STORE-ZERO-PRICE-1');
  assert.equal(body45.rawEstimate.engine.version, '0.2.3');
  assert.equal(body45.rawEstimate.cycle.model, 'STB-D001-CYCLE-MODEL-S2-0.1');
  assert.equal(body45.attributedBasis.envelope.id, 'D001-STAGE2-ENVELOPE-0.3');
  assert.equal(body45.attributedBasis.measured, false);
  assert.equal(body45.attributedBasis.commissioned, false);

  const direct45 = adapter.modules.estimateJob(adapter.catalog, body45.mappedCallInputs.estimate);
  assert.deepEqual(body45.rawEstimate, direct45);

  const req46 = await boardJobBody({ keptLengthIn: 46 });
  const res46 = await postJob(req46);
  const body46 = parseJson(res46);
  assert.equal(body46.rawEvaluation.status, 'SUPPORTABLE');
  assert.equal(body46.mappedCallInputs.estimate.pieces[0].keptLengthIn, 46);
  const direct46 = adapter.modules.estimateJob(adapter.catalog, body46.mappedCallInputs.estimate);
  assert.deepEqual(body46.rawEstimate, direct46);
  assert.notEqual(body45.rawEstimate.cycle.T_job_min, body46.rawEstimate.cycle.T_job_min);
  const cut001 = adapter.modules.estimateJob(adapter.catalog, {
    title: 'CUT-001 — 2x4 finished 60.000 in',
    classId: 'cut-001',
    pieces: [{ storeSku: PUBLISHED_BOARD_SKU, qty: 1, keptLengthIn: 60, widthIn: 3.5 }],
  });
  assert.notEqual(body45.rawEstimate.cycle.T_job_min, cut001.cycle.T_job_min);
  assert.notEqual(body46.rawEstimate.cycle.T_job_min, cut001.cycle.T_job_min);
  assert.equal(adapter.instrumentation.evaluationCalls, 2);
  assert.equal(adapter.instrumentation.estimateCalls, 2);
});

test('USER_DEFINED_BOARD_V1 models the frozen 60-in X-brace without raw-stock reinterpretation', async (t) => {
  const { adapter } = await withHost(t);
  adapter.instrumentation.evaluationCalls = 0;
  adapter.instrumentation.estimateCalls = 0;

  const request = await userDefinedBoardJobBody();
  const response = await postJob(request);
  assert.equal(response.status, 200);
  const body = parseJson(response);

  assert.equal(body.rawEvaluation.status, 'SUPPORTABLE');
  assert.deepEqual(body.mappedCallInputs.evaluation.lines[0].requiredOps, ['MITER_LIMITED']);
  assert.equal(body.mappedCallInputs.evaluation.lines[0].keptLengthIn, 60);

  const definition = body.mappedCallInputs.definition;
  assert.equal(definition.materialSource, 'STORE_ZERO');
  assert.equal(definition.rawStockLengthIn, undefined);
  assert.equal(definition.preparation, undefined);
  assert.equal(definition.definedWorkpieceLengthIn, 60);
  assert.equal(definition.productionSawCuts, 3);
  assert.equal(definition.totalModeledSawCuts, 3);
  assert.equal(definition.sawAngleDeg, 30);
  assert.equal(definition.drillCycles, 0);
  assert.equal(definition.drillDepthIn, null);
  assert.equal(definition.cutPlane, 'miter-face');
  assert.equal(definition.endIdentity, 'both');
  assert.equal(definition.endRelation, 'parallel');
  assert.equal(definition.lengthDatum, 'long-long-outer-edge');
  assert.equal(definition.spotDemand.mode, 'SPOT_ON_LOCATION');
  assert.equal(definition.spotDemand.totalCount, 2);
  assert.equal(definition.spotDemand.toolingStatus, undefined);
  assert.deepEqual(definition.unresolvedConditions, []);

  assert.equal(body.materialResolution.status, 'MAPPED');
  assert.equal(body.materialResolution.workpieceLengthIn, 60);
  assert.equal(body.materialResolution.pricingReferenceSku, PUBLISHED_BOARD_SKU);
  assert.equal(body.materialResolution.pricingReferenceStockLengthIn, 72);
  assert.equal(body.materialResolution.allocationClaimed, false);

  assert.equal(body.mappedCallInputs.estimate.pieces[0].sawCuts, 3);
  assert.equal(body.mappedCallInputs.estimate.pieces[0].holes, 0);
  assert.equal(body.mappedCallInputs.estimate.pieces[0].spots, 2);
  assert.equal(body.rawEstimate.status, 'BUDGETARY_ESTIMATE');
  assert.equal(body.rawEstimate.cycle.T_job_min, 10.014);
  assert.equal(body.rawEstimate.totals.material, 3.13);
  assert.equal(body.rawEstimate.totals.cell_recovery, 51.69);
  assert.equal(body.rawEstimate.totals.Q, 54.82);
  assert.equal(body.priceCompleteness.status, 'COMPLETE_FOR_ENCODED_DEMAND');
  assert.deepEqual(body.priceCompleteness.unresolvedConditions, []);
  assert.equal(body.attributedBasis.pricingEngine.id, 'STB-STORE-ZERO-PRICE-1');
  assert.equal(body.attributedBasis.pricingEngine.version, '0.2.3');
  assert.equal(body.attributedBasis.envelope.id, 'D001-STAGE2-ENVELOPE-0.3');
  assert.equal(adapter.instrumentation.evaluationCalls, 1);
  assert.equal(adapter.instrumentation.estimateCalls, 1);
});

test('USER_DEFINED_BOARD_V1 sends 46-degree demand to Store and receives REFUSED', async (t) => {
  const { adapter } = await withHost(t);
  adapter.instrumentation.evaluationCalls = 0;
  adapter.instrumentation.estimateCalls = 0;

  const response = await postJob(await userDefinedBoardJobBody({ sawAngleDeg: 46 }));
  assert.equal(response.status, 200);
  const body = parseJson(response);
  assert.equal(body.rawEvaluation.status, 'REFUSED');
  assert.equal(body.materialResolution.status, 'REFUSED');
  assert.equal(body.rawEstimate, null);
  assert.equal(body.priceCompleteness.status, 'UNAVAILABLE');
  assert.equal(adapter.instrumentation.estimateCalls, 0);
});

test('support-before-estimate does not call estimate for unknown SKU', async (t) => {
  const { adapter } = await withHost(t);
  adapter.instrumentation.estimateCalls = 0;
  const request = await boardJobBody({ storeSku: 'STB-ZERO-DOES-NOT-EXIST', keptLengthIn: 45 });
  const response = await postJob(request);
  assert.equal(response.status, 200);
  const body = parseJson(response);
  assert.equal(body.rawEvaluation.status, 'UNRESOLVED');
  assert.equal(body.rawEstimate, null);
  assert.equal(body.estimateAssociationId, null);
  assert.equal(body.rawEvaluation.lines[0].capability.reason, 'NO_OFFERING');
  assert.equal(body.rawEvaluation.lines[0].price.reason, 'MISSING_PRICE');
  assert.equal(adapter.instrumentation.estimateCalls, 0);
});

test('wrapper rejects wrong content type, digest mismatch, oversized body, and foreign origin', async (t) => {
  await withHost(t);
  const request = await boardJobBody({ keptLengthIn: 45 });

  const wrongType = await rawRequest({
    method: 'POST',
    path: STORE_PATHS.job,
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(request),
  });
  assert.equal(wrongType.status, 415);
  const wrongTypeBody = parseJson(wrongType);
  assert.equal(wrongTypeBody.adapterError, true);
  assert.equal(wrongTypeBody.code, ADAPTER_ERROR_CODES.INVALID_CONTENT_TYPE);
  assert.equal(wrongTypeBody.rawEvaluation, undefined);

  const mismatched = { ...request, payloadDigest: '0'.repeat(64) };
  const digest = await postJob(mismatched);
  assert.equal(digest.status, 422);
  assert.equal(parseJson(digest).code, ADAPTER_ERROR_CODES.PAYLOAD_DIGEST_MISMATCH);

  const oversized = await rawRequest({
    method: 'POST',
    path: STORE_PATHS.job,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...request, pad: 'x'.repeat(70 * 1024) }),
  });
  assert.equal(oversized.status, 413);

  const foreign = await postJson(STORE_PATHS.job, request, { Origin: 'http://evil.example' });
  assert.equal(foreign.status, 403);
  assert.doesNotMatch(foreign.body, /SUPPORTABLE/);
});

test('only the two declared Store endpoints exist and they are not static catalog files', async (t) => {
  await withHost(t);
  const getOffering = await rawRequest({ path: STORE_PATHS.offering });
  assert.equal(getOffering.status, 405);
  const getJob = await rawRequest({ path: STORE_PATHS.job });
  assert.equal(getJob.status, 405);
  const catalog = await rawRequest({ path: '/store-zero-catalog.json' });
  assert.equal(catalog.status, 404);
  const envelope = await rawRequest({ path: '/d001-stage2-envelope.mjs' });
  assert.equal(envelope.status, 404);
  const pricing = await rawRequest({ path: '/store-zero-pricing-engine.mjs' });
  assert.equal(pricing.status, 404);
  const extra = await rawRequest({
    method: 'POST',
    path: '/api/store-zero/envelope',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  });
  assert.ok(extra.status === 404 || extra.status === 405);
  const offering = await postOffering(await offeringLookupBody());
  assert.equal(offering.headers['access-control-allow-origin'], undefined);
});

test('16 in is an adapter scope error on the Board HTTP endpoint, not a Store disposition', async (t) => {
  const { buildJobRequest, boardDemandSignature } = await import('../../shared/store-wire.mjs');
  await withHost(t);
  const payload = {
    line: {
      lineId: 'line-short',
      storeSku: PUBLISHED_BOARD_SKU,
      quantity: 1,
      unit: 'ea',
      requiredOps: ['CROSSCUT'],
      keptLength: { value: '16', unit: 'in' },
    },
    definitionKind: 'board.square.v1',
    ruleVersion: '0.1',
  };
  const rebuilt = await buildJobRequest({
    requestId: crypto.randomUUID(),
    projectId: crypto.randomUUID(),
    candidateRevisionId: crypto.randomUUID(),
    attemptId: crypto.randomUUID(),
    attemptNumber: 1,
    sentAt: new Date().toISOString(),
    demandSignature: await boardDemandSignature(payload),
    payload,
  });
  const response = await postJob(rebuilt);
  assert.equal(response.status, 422);
  const body = parseJson(response);
  assert.equal(body.adapterError, true);
  assert.equal(body.code, ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE);
  assert.equal(body.rawEvaluation, undefined);
});
