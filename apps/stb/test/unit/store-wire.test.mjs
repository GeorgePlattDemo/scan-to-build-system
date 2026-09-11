import assert from 'node:assert/strict';
import test from 'node:test';

import { canonicalInchString } from '../../shared/canonical.mjs';
import {
  PUBLISHED_BOARD_SKU,
  STORE_PIN,
  STORE_PROTOCOL_VERSION,
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
