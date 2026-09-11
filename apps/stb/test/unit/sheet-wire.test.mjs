import assert from 'node:assert/strict';
import test from 'node:test';

import { canonicalInchString } from '../../shared/canonical.mjs';
import {
  PUBLISHED_SHEET_SKU,
  STORE_REQUEST_TYPES,
  STORE_SCOPES,
} from '../../shared/contracts.mjs';
import {
  ADAPTER_ERROR_CODES,
  buildSheetJobRequest,
  sheetDemandSignature,
  sheetJobPayload,
  validateWireRequest,
} from '../../shared/store-wire.mjs';

test('sheet wire request validates pin, digest, and Mode-2 slice', async () => {
  const payload = sheetJobPayload({
    lineId: 'line-sheet',
    storeSku: PUBLISHED_SHEET_SKU,
    profileKind: 'CURVILINEAR_OUTLINE',
    blankLengthCanonical: canonicalInchString(24),
    blankWidthCanonical: canonicalInchString(18),
    tabCount: 4,
    routeDepthCanonical: canonicalInchString(0.5),
  });
  const request = await buildSheetJobRequest({
    requestId: 'req-s',
    projectId: 'proj-s',
    candidateRevisionId: 'cand-s',
    attemptId: 'att-s',
    attemptNumber: 1,
    sentAt: '2026-09-11T00:00:00.000Z',
    demandSignature: await sheetDemandSignature(payload),
    payload,
  });
  const ok = await validateWireRequest(request);
  assert.equal(ok.ok, true);
  assert.equal(ok.requestType, STORE_REQUEST_TYPES.SHEET_MODE2_STENCIL_V1);
  assert.equal(ok.payload.line.profileKind, 'CURVILINEAR_OUTLINE');
  assert.equal(ok.payload.line.tabCount, 4);
  assert.equal(request.scope, STORE_SCOPES.SHEET_MODE2_STENCIL_V1);

  const gcodePayload = {
    ...payload,
    line: { ...payload.line, gcode: 'G1 X1' },
  };
  const bad = await buildSheetJobRequest({
    requestId: 'req-s',
    projectId: 'proj-s',
    candidateRevisionId: 'cand-s',
    attemptId: 'att-s',
    attemptNumber: 1,
    sentAt: '2026-09-11T00:00:00.000Z',
    demandSignature: await sheetDemandSignature(payload),
    payload: gcodePayload,
  });
  const refused = await validateWireRequest(bad);
  assert.equal(refused.ok, false);
  assert.equal(refused.code, ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE);
});
