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

test('exact pinned Store keeps miter support independent and returns partial depth-defined spot economics', async (t) => {
  await withPinnedAdapter(t);

  const reference = parseJson(await postJob(await userDefinedBoardJobBody({ sawAngleDeg: 30 })));
  assert.equal(reference.rawEvaluation.status, 'UNRESOLVED');
  assert.equal(reference.materialResolution.status, 'UNRESOLVED');
  assert.equal(reference.rawEstimate.status, 'PARTIAL_BUDGETARY_ESTIMATE');
  assert.equal(reference.rawEstimate.totals.material, 3.13);
  assert.equal(reference.rawEstimate.cycle.T_job_min, 9.694);
  assert.equal(reference.rawEstimate.totals.cell_recovery, 51.16);
  assert.equal(reference.rawEstimate.totals.Q, 54.29);
  assert.equal(reference.rawEstimate.totals.Q_basis, 'PARTIAL_CALCULATED');
  assert.equal(reference.priceCompleteness.status, 'PARTIAL');
  assert.ok(reference.priceCompleteness.unresolvedConditions.includes('SPOT_TOOL_POINT_GEOMETRY_REQUIRED'));
  assert.ok(reference.priceCompleteness.unresolvedConditions.includes('SPOT_CYCLE_TIME_APPLICABILITY_UNRESOLVED'));
  assert.equal(reference.mappedCallInputs.definition.definedWorkpieceLengthIn, 60);
  assert.equal(reference.mappedCallInputs.definition.totalModeledSawCuts, 3);
  assert.equal(reference.mappedCallInputs.definition.rawStockLengthIn, undefined);
  assert.equal(reference.mappedCallInputs.definition.preparation, undefined);
  assert.equal(reference.mappedCallInputs.definition.spotDemand.locationAlongLengthIn, 8);
  assert.equal(reference.mappedCallInputs.definition.drillCycles, 0);
  assert.equal(reference.mappedCallInputs.definition.spotOperation.operationContract, 'SPOT_ON_LOCATION/0.2');
  assert.equal(reference.mappedCallInputs.definition.spotOperation.toolDiameterIn, 0.1875);
  assert.equal(reference.mappedCallInputs.definition.spotOperation.fullDiameterPenetrationIn, 0.1875);
  assert.equal(reference.mappedCallInputs.definition.spotOperation.depthReference, 'ENTRY_SURFACE_ALONG_DRILL_AXIS');
  assert.equal(reference.mappedCallInputs.definition.spotOperation.pointGeometryStatus, 'UNRESOLVED');
  assert.equal(reference.mappedCallInputs.definition.spotOperation.pointAngleDeg, null);
  assert.equal(reference.mappedCallInputs.definition.spotOperation.pointAxialLengthIn, null);
  assert.equal(reference.mappedCallInputs.definition.spotOperation.totalTipPenetrationIn, null);
  assert.equal(reference.materialResolution.allocationClaimed, false);

  const at30 = parseJson(await postJob(await userDefinedBoardJobBody({ sawAngleDeg: 30, spotDemand: null })));
  assert.equal(at30.rawEvaluation.status, 'SUPPORTABLE');
  assert.equal(at30.priceCompleteness.status, 'COMPLETE_FOR_ENCODED_DEMAND');

  const at45 = parseJson(await postJob(await userDefinedBoardJobBody({ sawAngleDeg: 45, spotDemand: null })));
  assert.equal(at45.rawEvaluation.status, 'SUPPORTABLE');
  assert.equal(at45.priceCompleteness.status, 'COMPLETE_FOR_ENCODED_DEMAND');

  const response46 = await postJob(await userDefinedBoardJobBody({ sawAngleDeg: 46, spotDemand: null }));
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
  assert.equal(body.rawEstimate.status, 'PARTIAL_BUDGETARY_ESTIMATE');
  assert.ok(body.materialResolution.unresolvedConditions.includes('SPOT_LOCATION_REQUIRED'));
  assert.ok(body.materialResolution.unresolvedConditions.includes('SPOT_TOOL_POINT_GEOMETRY_REQUIRED'));
  assert.ok(body.priceCompleteness.unresolvedConditions.includes('SPOT_LOCATION_REQUIRED'));
  assert.ok(body.mappedCallInputs.definition.unresolvedConditions.includes('SPOT_LOCATION_REQUIRED'));
});

test('no spot request creates no spot demand and no modeled spot cycles', async (t) => {
  await withPinnedAdapter(t);
  const body = parseJson(await postJob(await userDefinedBoardJobBody({ spotDemand: null })));
  assert.equal(body.rawEvaluation.status, 'SUPPORTABLE');
  assert.equal(body.mappedCallInputs.definition.spotDemand, null);
  assert.equal(body.mappedCallInputs.estimate.spotCycles, 0);
  assert.equal(body.priceCompleteness.status, 'COMPLETE_FOR_ENCODED_DEMAND');
});
