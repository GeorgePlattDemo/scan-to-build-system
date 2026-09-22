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

test('acceptance fixture carries finished demand and the independently specified 8-in spot location', async () => {
  const request = await userDefinedBoardJobBody();
  assert.equal(request.payload.line.finishedPartLength.value, '16.000');
  assert.equal(request.payload.line.quantity, 2);
  assert.equal(request.payload.line.sawCuts, undefined);
  assert.equal(request.payload.line.materialSource, 'STORE_SELECTED');
  assert.equal(request.payload.line.spotDemand.mode, 'SPOT_ON_LOCATION');
  assert.equal(request.payload.line.spotDemand.locationAlongLengthIn, 8);
  assert.equal(request.payload.line.spotDemand.totalCount, 2);
});

test('exact pinned Store resolves stock from finished demand; spot OFF is complete and spot ON stays partial', async (t) => {
  await withPinnedAdapter(t);

  const off = parseJson(await postJob(await userDefinedBoardJobBody({ spotDemand: null })));
  assert.equal(off.rawEvaluation.status, 'SUPPORTABLE');
  assert.equal(off.materialResolution.status, 'MAPPED');
  assert.equal(off.materialResolution.finishedPartLengthIn, 16);
  assert.equal(off.materialResolution.finishedPartQuantity, 2);
  assert.equal(off.materialResolution.pricingReferenceSku, 'STB-ZERO-SPF-2X4-72-001');
  assert.equal(off.materialResolution.pricingReferenceStockLengthIn, 72);
  assert.equal(off.materialResolution.parentCount, 1);
  assert.equal(off.materialResolution.plan.intermediateBlank, null, 'FAULT_TARGET_UNJUSTIFIED_BLANK_INSERTED');
  assert.equal(off.materialResolution.plan.accounting.productionSawCuts, 3);
  assert.equal(off.materialResolution.plan.accounting.preparationSawCuts, 0);
  assert.equal(off.materialResolution.plan.parents[0].remainderIn, 39.625);
  assert.equal(off.mappedCallInputs.definition.definedWorkpieceLengthIn, undefined);
  assert.equal(off.mappedCallInputs.definition.finishedPartLengthIn, 16);
  assert.equal(off.mappedCallInputs.definition.finishedPartQuantity, 2);
  assert.equal(off.rawEstimate.operationAccounting.totalModeledSawCuts, off.materialResolution.plan.accounting.totalModeledSawCuts, 'FAULT_TARGET_PRICED_PLAN_OMITS_NECESSARY_OPERATION');
  assert.equal(off.rawEstimate.cycle.T_job_min, 9.686);
  assert.equal(off.rawEstimate.totals.material, 3.13);
  assert.equal(off.rawEstimate.totals.cell_recovery, 51.14);
  assert.equal(off.rawEstimate.totals.Q, 54.27);
  assert.equal(off.priceCompleteness.status, 'COMPLETE_FOR_ENCODED_DEMAND');

  const on = parseJson(await postJob(await userDefinedBoardJobBody()));
  assert.equal(on.rawEvaluation.status, 'UNRESOLVED');
  assert.equal(on.materialResolution.status, 'MAPPED');
  assert.equal(on.materialResolution.pricingReferenceSku, off.materialResolution.pricingReferenceSku);
  assert.equal(on.materialResolution.pricingReferenceStockLengthIn, off.materialResolution.pricingReferenceStockLengthIn);
  assert.equal(on.materialResolution.plan.parents[0].remainderIn, off.materialResolution.plan.parents[0].remainderIn);
  assert.equal(on.rawEstimate.status, 'PARTIAL_BUDGETARY_ESTIMATE');
  assert.equal(on.rawEstimate.totals.material, 3.13);
  assert.equal(on.rawEstimate.totals.cell_recovery, 51.14);
  assert.equal(on.rawEstimate.totals.Q, 54.27);
  assert.equal(on.mappedCallInputs.definition.spotOperation.toolDiameterIn, 0.1875);
  assert.equal(on.mappedCallInputs.definition.spotOperation.fullDiameterPenetrationIn, 0.1875);
  assert.equal(on.mappedCallInputs.definition.spotOperation.pointGeometryStatus, 'UNRESOLVED');
  assert.equal(on.mappedCallInputs.definition.spotOperation.totalTipPenetrationIn, null);
  assert.ok(on.priceCompleteness.unresolvedConditions.includes('SPOT_TOOL_POINT_GEOMETRY_REQUIRED'));
  assert.ok(on.priceCompleteness.unresolvedConditions.includes('SPOT_CYCLE_TIME_APPLICABILITY_UNRESOLVED'));
});

test('finished-demand edits recompute Store selection without resizing the job', async (t) => {
  await withPinnedAdapter(t);

  const lengthEdit = parseJson(await postJob(await userDefinedBoardJobBody({
    finishedPartLengthIn: 16.5,
    spotDemand: null,
  })));
  assert.equal(lengthEdit.materialResolution.finishedPartLengthIn, 16.5);
  assert.equal(lengthEdit.materialResolution.finishedPartQuantity, 2);
  assert.equal(lengthEdit.materialResolution.pricingReferenceStockLengthIn, 72);
  assert.equal(lengthEdit.materialResolution.plan.parents[0].remainderIn, 38.625);
  assert.equal(lengthEdit.rawEstimate.totals.Q, 54.28);

  const qtyEdit = parseJson(await postJob(await userDefinedBoardJobBody({
    quantity: 4,
    spotDemand: null,
  })));
  assert.equal(qtyEdit.materialResolution.finishedPartLengthIn, 16, 'FAULT_TARGET_STOCK_LENGTH_OVERWRITES_FINISHED_GEOMETRY');
  assert.equal(qtyEdit.materialResolution.finishedPartQuantity, 4);
  assert.equal(qtyEdit.materialResolution.pricingReferenceSku, 'STB-ZERO-SPF-2X4-96-001');
  assert.equal(qtyEdit.materialResolution.pricingReferenceStockLengthIn, 96);
  assert.equal(qtyEdit.materialResolution.plan.finishedPart.lengthIn, 16);
  assert.equal(qtyEdit.materialResolution.plan.finishedPart.quantity, 4);
  assert.equal(qtyEdit.materialResolution.plan.accounting.productionSawCuts, 5);
  assert.equal(qtyEdit.materialResolution.plan.accounting.preparationSawCuts, 0);
  assert.equal(qtyEdit.materialResolution.plan.parents[0].remainderIn, 31.375);
  assert.equal(qtyEdit.rawEstimate.totals.material, 4.18);
  assert.equal(qtyEdit.rawEstimate.totals.Q, 56.18);
});

test('46-degree demand reaches Store and is refused rather than resized or blocked by the app', async (t) => {
  await withPinnedAdapter(t);
  for (const angle of [30, 45]) {
    const response = parseJson(await postJob(await userDefinedBoardJobBody({ sawAngleDeg: angle, spotDemand: null })));
    assert.equal(response.rawEvaluation.status, 'SUPPORTABLE');
    assert.equal(response.priceCompleteness.status, 'COMPLETE_FOR_ENCODED_DEMAND');
  }

  const response46 = await postJob(await userDefinedBoardJobBody({ sawAngleDeg: 46, spotDemand: null }));
  assert.equal(response46.status, 200, '46 degrees must reach Store rather than fail application validation');
  const at46 = parseJson(response46);
  assert.equal(at46.rawEvaluation.status, 'REFUSED', 'FAULT_TARGET_46_DEGREE_MITER_REFUSAL');
  assert.equal(at46.materialResolution.finishedPartLengthIn, 16);
  assert.equal(at46.materialResolution.finishedPartQuantity, 2);
  assert.equal(at46.rawEstimate, null);
});

test('missing spot location stays unresolved while selected material and saw plan remain named', async (t) => {
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
  assert.equal(body.materialResolution.status, 'MAPPED');
  assert.equal(body.materialResolution.pricingReferenceSku, 'STB-ZERO-SPF-2X4-72-001');
  assert.equal(body.materialResolution.plan.accounting.productionSawCuts, 3);
  assert.equal(body.rawEstimate.status, 'PARTIAL_BUDGETARY_ESTIMATE');
  assert.ok(body.materialResolution.unresolvedConditions.includes('SPOT_LOCATION_REQUIRED'));
  assert.ok(body.materialResolution.unresolvedConditions.includes('SPOT_TOOL_POINT_GEOMETRY_REQUIRED'));
  assert.ok(body.priceCompleteness.unresolvedConditions.includes('SPOT_LOCATION_REQUIRED'));
  assert.ok(body.mappedCallInputs.definition.unresolvedConditions.includes('SPOT_LOCATION_REQUIRED'));
});
