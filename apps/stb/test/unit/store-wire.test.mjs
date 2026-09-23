import assert from 'node:assert/strict';
import test from 'node:test';

import { canonicalInchString } from '../../shared/canonical.mjs';
import {
  PUBLISHED_BOARD_SKU,
  STORE_PIN,
  STORE_FRESH_EVALUATION_RULE_ID,
  STORE_PROTOCOL_VERSION,
  USER_DEFINED_BOARD_MATERIAL_DEMAND,
} from '../../shared/contracts.mjs';
import {
  ADAPTER_ERROR_CODES,
  APP_DIAGNOSTICS,
  alcoveInsertDemandSignature,
  alcoveInsertJobPayload,
  boardDemandSignature,
  boardJobPayload,
  buildAlcoveInsertRequest,
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
    configurationId: 'SYO-USER1-XBRACE',
    configurationVersion: '0.1',
    definedWorkpieceLengthCanonical: canonicalInchString(60),
    sawCuts: 3,
    sawAngleDeg: 30,
    drillCycles: 0,
    requiredOps: ['MITER_LIMITED', 'SPOT_ON_LOCATION'],
    cutPlane: 'miter-face',
    endIdentity: 'both',
    endRelation: 'parallel',
    lengthDatum: 'long-long-outer-edge',
    materialSource: 'STORE_ZERO',
    parts: [
      {
        partId: 'PART-1',
        lengthIn: 16,
        features: [
          {
            featureId: 'SPOT-1',
            kind: 'SPOT_ON_LOCATION',
            xIn: 8,
            locationRule: 'CENTERED_ON_PART',
            acrossWidthRule: 'CENTERED_ON_WIDE_FACE',
          },
        ],
      },
      {
        partId: 'PART-2',
        lengthIn: 16,
        features: [
          {
            featureId: 'SPOT-2',
            kind: 'SPOT_ON_LOCATION',
            xIn: 8,
            locationRule: 'CENTERED_ON_PART',
            acrossWidthRule: 'CENTERED_ON_WIDE_FACE',
          },
        ],
      },
    ],
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
  assert.equal(validated.payload.line.configurationId, 'SYO-USER1-XBRACE');
  assert.equal(validated.payload.line.configurationVersion, '0.1');
  assert.equal(validated.payload.line.definedWorkpieceLengthIn, 60);
  assert.equal(validated.payload.line.sawCuts, 3);
  assert.equal(validated.payload.line.sawAngleDeg, 30);
  assert.equal(validated.payload.line.drillCycles, 0);
  assert.equal(validated.payload.line.drillDepthIn, null);
  assert.deepEqual(validated.payload.line.requiredOps, ['MITER_LIMITED', 'SPOT_ON_LOCATION']);
  assert.equal(validated.payload.line.parts.length, 2);
  assert.equal(validated.payload.line.parts[0].features[0].kind, 'SPOT_ON_LOCATION');
  assert.equal(validated.payload.line.parts[0].features[0].xIn, 8);
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

test('Alcove wire preserves project demand, Store SKU authority, and fresh evaluation identity', async () => {
  const payload = alcoveInsertJobPayload({
    configurationId: 'ALCOVE-USER1',
    configurationVersion: '1',
    materialDemand: {
      species: 'pine',
      form: 'board',
      nominalT: 1,
      nominalW: 6,
      grade: 'select',
    },
    boardRequirements: [
      {
        requirementId: 'ALCOVE-UPRIGHT-PARENTS',
        role: 'UPRIGHTS',
        stockLengthIn: 72,
        keptLengthIn: 65,
        qty: 4,
        requiredOps: ['CROSSCUT'],
        carriesSpotDemand: true,
      },
      {
        requirementId: 'ALCOVE-SHELF-PARENTS',
        role: 'SHELVES',
        stockLengthIn: 96,
        keptLengthIn: 44,
        qty: 10,
        requiredOps: ['CROSSCUT'],
        carriesSpotDemand: false,
      },
    ],
    componentPrograms: [
      {
        componentId: 'ALCOVE-UPRIGHT-01',
        requirementId: 'ALCOVE-UPRIGHT-PARENTS',
        finishedLengthIn: 65,
        finishedWidthIn: 5.5,
        features: [],
      },
      {
        componentId: 'ALCOVE-SHELF-01-STRIP-03',
        requirementId: 'ALCOVE-SHELF-PARENTS',
        finishedLengthIn: 44,
        finishedWidthIn: 3,
        features: [
          {
            featureId: 'ALCOVE-SHELF-01-STRIP-03-RIP',
            kind: 'MILL_LONGITUDINAL_PROFILE',
            pathLengthIn: 44,
            yIn: 3,
            totalDepthIn: 0.75,
          },
        ],
      },
    ],
    hardwareDemand: { storeSku: 'STB-ZERO-HW-ALCOVE-PACK-001', qty: 1 },
    spotDemand: {
      enabled: false,
      mode: 'SPOT_ON_LOCATION',
      toolDiameterIn: 0.1875,
      source: 'SHELF_ELEVATIONS',
      features: [],
    },
    unresolvedConditions: ['ORDERED_SIZE_ADJUSTMENT_NOT_ESTABLISHED'],
    materialSource: 'STORE_ZERO',
  });
  const request = await buildAlcoveInsertRequest({
    requestId: 'req-alcove',
    projectId: 'proj-alcove',
    candidateRevisionId: 'cand-alcove',
    attemptId: 'att-alcove',
    attemptNumber: 1,
    sentAt: '2026-09-23T00:00:00.000Z',
    demandSignature: await alcoveInsertDemandSignature(payload),
    payload,
  });

  const validated = await validateWireRequest(request);
  assert.equal(validated.ok, true);
  assert.equal(validated.payload.definition.materialDemand.species, 'pine');
  assert.equal(validated.payload.definition.materialDemand.sku, undefined);
  assert.equal(validated.payload.definition.boardRequirements.length, 2);
  assert.equal(validated.payload.definition.componentPrograms.length, 2);
  assert.equal(
    validated.payload.definition.componentPrograms[1].features[0].kind,
    'MILL_LONGITUDINAL_PROFILE',
  );
  assert.equal(validated.payload.definition.componentPrograms[1].finishedWidthIn, 3);
  assert.deepEqual(
    validated.payload.definition.boardRequirements.map((line) => [
      line.role,
      line.stockLengthIn,
      line.keptLengthIn,
      line.qty,
    ]),
    [
      ['UPRIGHTS', 72, 65, 4],
      ['SHELVES', 96, 44, 10],
    ],
  );

  const receipt = {
    freshnessRule: STORE_FRESH_EVALUATION_RULE_ID,
    requestId: request.requestId,
    evaluatedAt: '2026-09-23T00:00:01.000Z',
    authority: { storeRevision: STORE_PIN },
    receiptHash: 'alcove-receipt-hash',
  };
  const response = {
    protocolVersion: STORE_PROTOCOL_VERSION,
    storePin: STORE_PIN,
    requestId: request.requestId,
    projectId: request.projectId,
    candidateRevisionId: request.candidateRevisionId,
    requestType: request.requestType,
    scope: request.scope,
    demandSignature: request.demandSignature,
    querySignature: request.querySignature,
    payloadDigest: request.payloadDigest,
    attemptId: request.attemptId,
    attemptNumber: request.attemptNumber,
    rawEvaluation: {
      status: 'UNRESOLVED',
      freshEvaluation: true,
      evaluationReceipt: receipt,
      lines: [],
    },
    evaluationReceipt: receipt,
  };
  assert.equal(inspectStoreResponse(request, response, { httpStatus: 200 }).ok, true);

  const stale = structuredClone(response);
  stale.rawEvaluation.freshEvaluation = false;
  assert.equal(
    inspectStoreResponse(request, stale, { httpStatus: 200 }).reason,
    'store-evaluation-not-fresh',
  );
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


test('User-defined Board response is valid only with a fresh matching Store receipt', async () => {
  const payload = userDefinedBoardJobPayload({
    lineId: 'line-fresh',
    configurationId: 'SYO-USER1-XBRACE',
    configurationVersion: '0.1',
    definedWorkpieceLengthCanonical: canonicalInchString(60),
    sawCuts: 3,
    sawAngleDeg: 30,
    drillCycles: 0,
    requiredOps: ['MITER_LIMITED', 'SPOT_ON_LOCATION'],
    cutPlane: 'miter-face',
    endIdentity: 'both',
    endRelation: 'parallel',
    lengthDatum: 'long-long-outer-edge',
    materialSource: 'STORE_ZERO',
    parts: [
      { partId: 'PART-1', lengthIn: 16, features: [{ featureId: 'SPOT-1', kind: 'SPOT_ON_LOCATION', xIn: 8, locationRule: 'CENTERED_ON_PART', acrossWidthRule: 'CENTERED_ON_WIDE_FACE' }] },
      { partId: 'PART-2', lengthIn: 16, features: [{ featureId: 'SPOT-2', kind: 'SPOT_ON_LOCATION', xIn: 8, locationRule: 'CENTERED_ON_PART', acrossWidthRule: 'CENTERED_ON_WIDE_FACE' }] },
    ],
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
    requestId: 'req-fresh',
    projectId: 'proj-fresh',
    candidateRevisionId: 'cand-fresh',
    attemptId: 'att-fresh',
    attemptNumber: 1,
    sentAt: '2026-09-22T18:59:00.000Z',
    demandSignature: await userDefinedBoardDemandSignature(payload),
    payload,
  });
  const receipt = {
    freshnessRule: STORE_FRESH_EVALUATION_RULE_ID,
    requestId: request.requestId,
    evaluatedAt: '2026-09-22T18:59:01.000Z',
    authority: { storeRevision: STORE_PIN },
    receiptHash: 'receipt-fresh-1',
  };
  const base = {
    protocolVersion: STORE_PROTOCOL_VERSION,
    storePin: STORE_PIN,
    requestId: request.requestId,
    projectId: request.projectId,
    candidateRevisionId: request.candidateRevisionId,
    requestType: request.requestType,
    scope: request.scope,
    demandSignature: request.demandSignature,
    querySignature: request.querySignature,
    payloadDigest: request.payloadDigest,
    attemptId: request.attemptId,
    attemptNumber: request.attemptNumber,
    rawEvaluation: {
      status: 'SUPPORTABLE',
      freshEvaluation: true,
      evaluationReceipt: receipt,
    },
    evaluationReceipt: receipt,
  };

  assert.equal(inspectStoreResponse(request, base, { httpStatus: 200 }).ok, true);

  const noReceipt = structuredClone(base);
  delete noReceipt.evaluationReceipt;
  delete noReceipt.rawEvaluation.evaluationReceipt;
  assert.equal(
    inspectStoreResponse(request, noReceipt, { httpStatus: 200 }).reason,
    'missing-evaluation-receipt',
  );

  const notFresh = structuredClone(base);
  notFresh.rawEvaluation.freshEvaluation = false;
  assert.equal(
    inspectStoreResponse(request, notFresh, { httpStatus: 200 }).reason,
    'store-evaluation-not-fresh',
  );

  const wrongRequest = structuredClone(base);
  wrongRequest.evaluationReceipt.requestId = 'req-old';
  wrongRequest.rawEvaluation.evaluationReceipt.requestId = 'req-old';
  assert.equal(
    inspectStoreResponse(request, wrongRequest, { httpStatus: 200 }).diagnostic,
    APP_DIAGNOSTICS.APP_CORRELATION_ERROR,
  );

  const wrongRevision = structuredClone(base);
  wrongRevision.evaluationReceipt.authority.storeRevision = '0'.repeat(40);
  wrongRevision.rawEvaluation.evaluationReceipt.authority.storeRevision = '0'.repeat(40);
  assert.equal(
    inspectStoreResponse(request, wrongRevision, { httpStatus: 200 }).diagnostic,
    APP_DIAGNOSTICS.APP_CORRELATION_ERROR,
  );

  const missingHash = structuredClone(base);
  missingHash.evaluationReceipt.receiptHash = '';
  missingHash.rawEvaluation.evaluationReceipt.receiptHash = '';
  assert.equal(
    inspectStoreResponse(request, missingHash, { httpStatus: 200 }).reason,
    'missing-evaluation-receipt-hash',
  );
});
