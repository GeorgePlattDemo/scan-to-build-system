import assert from 'node:assert/strict';
import test from 'node:test';

import { canonicalInchString } from '../../shared/canonical.mjs';
import {
  PUBLISHED_BOARD_SKU,
  STORE_PIN,
  STORE_PROTOCOL_VERSION,
  USER_DEFINED_BOARD_MATERIAL_DEMAND,
} from '../../shared/contracts.mjs';
import {
  ADAPTER_ERROR_CODES,
  APP_DIAGNOSTICS,
  boardDemandSignature,
  boardJobPayload,
  buildJobRequest,
  inspectStoreResponse,
  isJsonContentType,
  payloadDigest,
  userDefinedBoardDemandSignature,
  userDefinedBoardJobPayload,
  buildUserDefinedBoardRequest,
  validateWireRequest,
} from '../../shared/store-wire.mjs';

test('JSON content type accepts charset but rejects other media types', () => {
  assert.equal(isJsonContentType('application/json'), true);
  assert.equal(isJsonContentType('application/json; charset=utf-8'), true);
  assert.equal(isJsonContentType('text/plain'), false);
  assert.equal(isJsonContentType(undefined), false);
});

test('payload digest is canonical and independent of key order', async () => {
  const left = await payloadDigest({ b: 1, a: 2 });
  const right = await payloadDigest({ a: 2, b: 1 });
  assert.equal(left, right);
  assert.equal(left.length, 64);
});

test('job wire request validates pin, digest, and Board slice', async () => {
  const payload = boardJobPayload({
    lineId: 'line-1',
    storeSku: PUBLISHED_BOARD_SKU,
    keptLengthCanonical: canonicalInchString(45),
  });
  const request = await buildJobRequest({
    requestId: 'req-1',
    projectId: 'proj-1',
    candidateRevisionId: 'cand-1',
    attemptId: 'att-1',
    attemptNumber: 1,
    sentAt: '2026-09-11T00:00:00.000Z',
    demandSignature: await boardDemandSignature(payload),
    payload,
  });
  const ok = await validateWireRequest(request);
  assert.equal(ok.ok, true);
  assert.equal(ok.payload.line.keptLengthIn, 45);

  const wrongPin = await validateWireRequest({ ...request, expectedStorePin: '0'.repeat(40) });
  assert.equal(wrongPin.ok, false);
  assert.equal(wrongPin.code, ADAPTER_ERROR_CODES.STORE_PIN_MISMATCH);

  const wrongDigest = await validateWireRequest({ ...request, payloadDigest: '0'.repeat(64) });
  assert.equal(wrongDigest.ok, false);
  assert.equal(wrongDigest.code, ADAPTER_ERROR_CODES.PAYLOAD_DIGEST_MISMATCH);

  const tooShort = boardJobPayload({
    lineId: 'line-1',
    storeSku: PUBLISHED_BOARD_SKU,
    keptLengthCanonical: canonicalInchString(16),
  });
  const shortRequest = await buildJobRequest({
    requestId: 'req-1',
    projectId: 'proj-1',
    candidateRevisionId: 'cand-1',
    attemptId: 'att-1',
    attemptNumber: 1,
    sentAt: '2026-09-11T00:00:00.000Z',
    demandSignature: await boardDemandSignature(tooShort),
    payload: tooShort,
  });
  const short = await validateWireRequest(shortRequest);
  assert.equal(short.ok, false);
  assert.equal(short.code, ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE);
  assert.equal(request.protocolVersion, STORE_PROTOCOL_VERSION);
  assert.equal(request.expectedStorePin, STORE_PIN);
});

test('user-defined Board wire preserves project demand and leaves machine limits to Store', async () => {
  const payload = userDefinedBoardJobPayload({
    lineId: 'line-x',
    definedWorkpieceLengthCanonical: canonicalInchString(60),
    sawCuts: 3,
    sawAngleDeg: 30,
    drillCycles: 0,
    requiredOps: ['MITER_LIMITED'],
    cutPlane: 'miter-face',
    endIdentity: 'both',
    endRelation: 'parallel',
    lengthDatum: 'long-long-outer-edge',
    materialSource: 'STORE_ZERO',
    spotDemand: {
      required: true,
      mode: 'SPOT_ON_LOCATION',
      countPerPart: 1,
      totalCount: 2,
      locationRule: 'CENTERED_ON_PART',
      locationAlongLengthIn: 8,
      acrossWidthRule: 'CENTERED_ON_WIDE_FACE',
    },
    unresolvedConditions: [],
  });
  const request = await buildUserDefinedBoardRequest({
    requestId: 'req-x',
    projectId: 'proj-x',
    candidateRevisionId: 'cand-x',
    attemptId: 'att-x',
    attemptNumber: 1,
    sentAt: '2026-09-21T00:00:00.000Z',
    demandSignature: await userDefinedBoardDemandSignature(payload),
    payload,
  });
  const validated = await validateWireRequest(request);
  assert.equal(validated.ok, true);
  assert.deepEqual(validated.payload.line.materialDemand, USER_DEFINED_BOARD_MATERIAL_DEMAND);
  assert.equal(validated.payload.line.storeSku, undefined);
  assert.equal(validated.payload.line.definedWorkpieceLengthIn, 60);
  assert.equal(validated.payload.line.sawCuts, 3);
  assert.equal(validated.payload.line.sawAngleDeg, 30);
  assert.equal(validated.payload.line.drillCycles, 0);
  assert.equal(validated.payload.line.drillDepthIn, null);
  assert.deepEqual(validated.payload.line.requiredOps, ['MITER_LIMITED']);
  assert.equal(validated.payload.line.cutPlane, 'miter-face');
  assert.equal(validated.payload.line.endIdentity, 'both');
  assert.equal(validated.payload.line.endRelation, 'parallel');
  assert.equal(validated.payload.line.lengthDatum, 'long-long-outer-edge');
  assert.equal(validated.payload.line.materialSource, 'STORE_ZERO');
  assert.equal(validated.payload.line.spotDemand.mode, 'SPOT_ON_LOCATION');
  assert.equal(validated.payload.line.spotDemand.totalCount, 2);
  assert.equal(validated.payload.line.spotDemand.toolingStatus, undefined);
  assert.deepEqual(validated.payload.line.unresolvedConditions, []);

  const fortySix = {
    ...payload,
    line: { ...payload.line, sawAngleDeg: 46 },
  };
  const fortySixRequest = await buildUserDefinedBoardRequest({
    requestId: 'req-x2',
    projectId: 'proj-x',
    candidateRevisionId: 'cand-x2',
    attemptId: 'att-x2',
    attemptNumber: 1,
    sentAt: '2026-09-21T00:00:00.000Z',
    demandSignature: await userDefinedBoardDemandSignature(fortySix),
    payload: fortySix,
  });
  const fortySixValidated = await validateWireRequest(fortySixRequest);
  assert.equal(fortySixValidated.ok, true, '46 degrees is valid project demand; Store owns the 45-degree machine limit');

  const invalidGeometry = {
    ...payload,
    line: { ...payload.line, sawAngleDeg: 90 },
  };
  const invalidGeometryRequest = await buildUserDefinedBoardRequest({
    requestId: 'req-x90',
    projectId: 'proj-x',
    candidateRevisionId: 'cand-x90',
    attemptId: 'att-x90',
    attemptNumber: 1,
    sentAt: '2026-09-21T00:00:00.000Z',
    demandSignature: await userDefinedBoardDemandSignature(invalidGeometry),
    payload: invalidGeometry,
  });
  const invalidGeometryResult = await validateWireRequest(invalidGeometryRequest);
  assert.equal(invalidGeometryResult.ok, false);
  assert.equal(invalidGeometryResult.code, ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE);

  const drillWithoutDepth = {
    ...payload,
    line: {
      ...payload.line,
      requiredOps: ['MITER_LIMITED', 'DRILL'],
      drillCycles: 2,
      drillDepthIn: null,
    },
  };
  const drillWithoutDepthRequest = await buildUserDefinedBoardRequest({
    requestId: 'req-x3',
    projectId: 'proj-x',
    candidateRevisionId: 'cand-x3',
    attemptId: 'att-x3',
    attemptNumber: 1,
    sentAt: '2026-09-21T00:00:00.000Z',
    demandSignature: await userDefinedBoardDemandSignature(drillWithoutDepth),
    payload: drillWithoutDepth,
  });
  const drillRejected = await validateWireRequest(drillWithoutDepthRequest);
  assert.equal(drillRejected.ok, false);
  assert.equal(drillRejected.code, ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE);
});

test('inspectStoreResponse quarantines wrong correlation and unknown aggregates', async () => {
  const payload = boardJobPayload({
    lineId: 'line-1',
    storeSku: PUBLISHED_BOARD_SKU,
    keptLengthCanonical: canonicalInchString(45),
  });
  const request = await buildJobRequest({
    requestId: 'req-1',
    projectId: 'proj-1',
    candidateRevisionId: 'cand-1',
    attemptId: 'att-1',
    attemptNumber: 1,
    sentAt: '2026-09-11T00:00:00.000Z',
    demandSignature: await boardDemandSignature(payload),
    payload,
  });
  const base = {
    protocolVersion: STORE_PROTOCOL_VERSION,
    storePin: STORE_PIN,
    requestId: 'req-1',
    projectId: 'proj-1',
    candidateRevisionId: 'cand-1',
    requestType: request.requestType,
    scope: request.scope,
    demandSignature: request.demandSignature,
    querySignature: null,
    payloadDigest: request.payloadDigest,
    attemptId: 'att-1',
    attemptNumber: 1,
    rawEvaluation: { status: 'SUPPORTABLE' },
  };
  assert.equal(inspectStoreResponse(request, base, { httpStatus: 200 }).ok, true);
  assert.equal(
    inspectStoreResponse(request, { ...base, requestId: 'other' }, { httpStatus: 200 }).diagnostic,
    APP_DIAGNOSTICS.APP_CORRELATION_ERROR,
  );
  assert.equal(
    inspectStoreResponse(request, { ...base, storePin: '0'.repeat(40) }, { httpStatus: 200 }).diagnostic,
    APP_DIAGNOSTICS.APP_CORRELATION_ERROR,
  );
  assert.equal(
    inspectStoreResponse(request, { ...base, rawEvaluation: { status: 'MAYBE' } }, { httpStatus: 200 })
      .diagnostic,
    APP_DIAGNOSTICS.APP_MALFORMED_RESPONSE,
  );
  assert.equal(
    inspectStoreResponse(request, { adapterError: true, code: 'STORE_SOURCE_UNAVAILABLE' }, { httpStatus: 503 })
      .diagnostic,
    APP_DIAGNOSTICS.APP_ADAPTER_ERROR,
  );
});
