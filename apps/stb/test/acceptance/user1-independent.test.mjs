import assert from 'node:assert/strict';
import test from 'node:test';

import { createStoreAdapter } from '../../server/store-adapter.mjs';
import { startServer } from '../../server/main.mjs';
import {
  parseJson,
  postJob,
  requireCleanPinnedStore,
  userDefinedBoardJobBody,
} from '../store/helpers.mjs';

async function withPinnedAdapter(t) {
  await requireCleanPinnedStore();
  const adapter = await createStoreAdapter();
  assert.equal(adapter.ready, true, JSON.stringify(adapter.inspection));
  const host = await startServer({ storeAdapter: adapter });
  t.after(() => host.close());
  return adapter;
}

test('acceptance fixture carries the independently specified 8-in spot location', async () => {
  const request = await userDefinedBoardJobBody();
  assert.equal(request.payload.line.sawCuts, 3);
  assert.equal(request.payload.line.spotDemand.mode, 'SPOT_ON_LOCATION');
  assert.equal(request.payload.line.spotDemand.locationAlongLengthIn, 8);
  assert.equal(request.payload.line.spotDemand.totalCount, 2);
});

test('exact pinned Store accepts 30 and 45, refuses 46, and reproduces the observed 30-degree value', async (t) => {
  await withPinnedAdapter(t);

  const at30 = parseJson(await postJob(await userDefinedBoardJobBody({ sawAngleDeg: 30 })));
  assert.equal(at30.rawEvaluation.status, 'SUPPORTABLE');
  assert.equal(at30.rawEstimate.totals.Q, 54.82);
  assert.equal(at30.mappedCallInputs.definition.definedWorkpieceLengthIn, 60);
  assert.equal(at30.mappedCallInputs.definition.totalModeledSawCuts, 3);
  assert.equal(at30.mappedCallInputs.definition.rawStockLengthIn, undefined);
  assert.equal(at30.mappedCallInputs.definition.preparation, undefined);
  assert.equal(at30.mappedCallInputs.definition.spotDemand.locationAlongLengthIn, 8);
  assert.equal(at30.mappedCallInputs.definition.drillCycles, 0);
  assert.equal(at30.materialResolution.allocationClaimed, false);

  const at45 = parseJson(await postJob(await userDefinedBoardJobBody({ sawAngleDeg: 45 })));
  assert.equal(at45.rawEvaluation.status, 'SUPPORTABLE');

  const response46 = await postJob(await userDefinedBoardJobBody({ sawAngleDeg: 46 }));
  assert.equal(response46.status, 200, '46 degrees must reach Store rather than fail application validation');
  const at46 = parseJson(response46);
  assert.equal(at46.rawEvaluation.status, 'REFUSED');
  assert.equal(at46.rawEstimate, null);
});

test('missing spot location stays unresolved and the concise adapter response preserves the Store reason', async (t) => {
  await withPinnedAdapter(t);
  const incompleteSpot = {
    required: true,
    mode: 'SPOT_ON_LOCATION',
    countPerPart: 1,
    totalCount: 2,
    locationRule: 'CENTERED_ON_PART',
    acrossWidthRule: 'CENTERED_ON_WIDE_FACE',
  };
  const body = parseJson(await postJob(await userDefinedBoardJobBody({ spotDemand: incompleteSpot })));
  assert.equal(body.rawEvaluation.status, 'UNRESOLVED');
  assert.equal(body.rawEstimate, null);
  assert.ok(body.materialResolution.unresolvedConditions.includes('SPOT_LOCATION_REQUIRED'));
  assert.ok(body.priceCompleteness.unresolvedConditions.includes('SPOT_LOCATION_REQUIRED'));
  assert.ok(body.mappedCallInputs.definition.unresolvedConditions.includes('SPOT_LOCATION_REQUIRED'));
});

test('no spot request creates no spot demand and no modeled spot cycles', async (t) => {
  await withPinnedAdapter(t);
  const body = parseJson(await postJob(await userDefinedBoardJobBody({ spotDemand: null })));
  assert.equal(body.rawEvaluation.status, 'SUPPORTABLE');
  assert.equal(body.mappedCallInputs.definition.spotDemand, null);
  assert.equal(body.mappedCallInputs.estimate.pieces[0].spots, 0);
  assert.equal(body.priceCompleteness.status, 'COMPLETE_FOR_ENCODED_DEMAND');
});
