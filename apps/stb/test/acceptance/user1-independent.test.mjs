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

test('acceptance fixture carries finished-member demand and independently specified 8-in spot location', async () => {
  const request = await userDefinedBoardJobBody();
  assert.equal(request.payload.line.finishedPartLength.value, '16');
  assert.equal(request.payload.line.quantity, 2);
  assert.equal(request.payload.line.definedWorkpieceLength, undefined);
  assert.equal(request.payload.line.sawCuts, undefined);
  assert.equal(request.payload.line.materialSource, 'STORE_SELECTED');
  assert.equal(request.payload.line.spotDemand.mode, 'SPOT_ON_LOCATION');
  assert.equal(request.payload.line.spotDemand.locationAlongLengthIn, 8);
  assert.equal(request.payload.line.spotDemand.totalCount, 2);
});

test('exact pinned Store selects parent stock, preserves miter support, and returns partial spot economics', async (t) => {
  await withPinnedAdapter(t);

  const reference = parseJson(await postJob(await userDefinedBoardJobBody({ sawAngleDeg: 30 })));
  assert.equal(reference.rawEvaluation.status, 'UNRESOLVED');
  assert.equal(reference.materialResolution.status, 'MAPPED');
  assert.equal(reference.materialResolution.finishedPartLengthIn, 16);
  assert.equal(reference.materialResolution.finishedPartQuantity, 2);
  assert.equal(reference.materialResolution.pricingReferenceSku, 'STB-ZERO-SPF-2X4-72-001');
  assert.equal(reference.materialResolution.pricingReferenceStockLengthIn, 72);
  assert.equal(reference.materialResolution.parentCount, 1);
  assert.equal(reference.materialResolution.plan.intermediateBlank, null);
  assert.equal(reference.materialResolution.plan.accounting.productionSawCuts, 3);
  assert.equal(reference.materialResolution.plan.accounting.preparationSawCuts, 0);
  assert.equal(reference.materialResolution.plan.parents[0].remainderIn, 39.625);
  assert.equal(reference.materialResolution.allocationClaimed, false);

  const definition = reference.mappedCallInputs.definition;
  assert.equal(definition.materialSource, 'STORE_SELECTED');
  assert.equal(definition.definedWorkpieceLengthIn, undefined);
  assert.equal(definition.finishedPartLengthIn, 16);
  assert.equal(definition.finishedPartQuantity, 2);
  assert.equal(definition.selectedParentPlan.selected.parentStockLengthIn, 72);
  assert.equal(definition.selectedParentPlan.parents[0].remainderIn, 39.625);
  assert.equal(definition.sawAngleDeg, 30);
  assert.equal(definition.drillCycles, 0);
  assert.equal(definition.cutPlane, 'miter-face');
  assert.equal(definition.endIdentity, 'both');
  assert.equal(definition.endRelation, 'parallel');
  assert.equal(definition.lengthDatum, 'long-long-outer-edge');
  assert.equal(definition.spotDemand.mode, 'SPOT_ON_LOCATION');
  assert.equal(definition.spotDemand.locationAlongLengthIn, 8);
  assert.equal(definition.spotDemand.totalCount, 2);
  assert.equal(definition.spotOperation.operationContract, 'SPOT_ON_LOCATION/0.2');
  assert.equal(definition.spotOperation.toolDefinitionId, 'D001-SPOT-3_16-TOOL-0.2');
  assert.equal(definition.spotOperation.toolDiameterIn, 0.1875);
  assert.equal(definition.spotOperation.fullDiameterPenetrationIn, 0.1875);
  assert.equal(definition.spotOperation.depthReference, 'ENTRY_SURFACE_ALONG_DRILL_AXIS');
  assert.equal(definition.spotOperation.pointGeometryStatus, 'UNRESOLVED');
  assert.equal(definition.spotOperation.pointAngleDeg, null);
  assert.equal(definition.spotOperation.pointAxialLengthIn, null);
  assert.equal(definition.spotOperation.totalTipPenetrationIn, null);
  assert.ok(definition.unresolvedConditions.includes('SPOT_TOOL_POINT_GEOMETRY_REQUIRED'));
  assert.ok(definition.unresolvedConditions.includes('SPOT_CYCLE_TIME_APPLICABILITY_UNRESOLVED'));

  assert.equal(reference.mappedCallInputs.estimate.plan.selected.parentStockLengthIn, 72);
  assert.equal(reference.mappedCallInputs.estimate.spotCycles, 2);
  assert.equal(reference.rawEstimate.status, 'PARTIAL_BUDGETARY_ESTIMATE');
  assert.equal(reference.rawEstimate.totals.material, 3.13);
  assert.equal(reference.rawEstimate.cycle.T_job_min, 9.686);
  assert.equal(reference.rawEstimate.totals.cell_recovery, 51.14);
  assert.equal(reference.rawEstimate.totals.Q, 54.27);
  assert.equal(reference.rawEstimate.totals.Q_basis, 'PARTIAL_CALCULATED');
  assert.equal(reference.priceCompleteness.status, 'PARTIAL');
  assert.ok(reference.priceCompleteness.unresolvedConditions.includes('SPOT_TOOL_POINT_GEOMETRY_REQUIRED'));
  assert.ok(reference.priceCompleteness.unresolvedConditions.includes('SPOT_CYCLE_TIME_APPLICABILITY_UNRESOLVED'));
  assert.equal(reference.attributedBasis.pricingEngine.id, 'STB-STORE-ZERO-PRICE-1');
  assert.equal(reference.attributedBasis.pricingEngine.version, '0.3.0');
  assert.equal(reference.attributedBasis.envelope.id, 'D001-STAGE2-ENVELOPE-0.4');

  const at30 = parseJson(await postJob(await userDefinedBoardJobBody({ sawAngleDeg: 30, spotDemand: null })));
  assert.equal(at30.rawEvaluation.status, 'SUPPORTABLE');
  assert.equal(at30.priceCompleteness.status, 'COMPLETE_FOR_ENCODED_DEMAND');
  assert.equal(at30.rawEstimate.totals.Q, 54.27);

  const at45 = parseJson(await postJob(await userDefinedBoardJobBody({ sawAngleDeg: 45, spotDemand: null })));
  assert.equal(at45.rawEvaluation.status, 'SUPPORTABLE');
  assert.equal(at45.priceCompleteness.status, 'COMPLETE_FOR_ENCODED_DEMAND');

  const response46 = await postJob(await userDefinedBoardJobBody({ sawAngleDeg: 46, spotDemand: null }));
  assert.equal(response46.status, 200, '46 degrees must reach Store rather than fail application validation');
  const at46 = parseJson(response46);
  assert.equal(at46.rawEvaluation.status, 'REFUSED');
  assert.equal(at46.materialResolution.finishedPartLengthIn, 16);
  assert.equal(at46.materialResolution.finishedPartQuantity, 2);
  assert.equal(at46.rawEstimate, null);
});

test('16.5-in and quantity-four edits recompute Store parent choice without resizing finished parts', async (t) => {
  await withPinnedAdapter(t);

  const lengthEdit=parseJson(await postJob(await userDefinedBoardJobBody({
    finishedPartLengthIn:16.5,
    spotDemand:null
  })));
  assert.equal(lengthEdit.materialResolution.finishedPartLengthIn,16.5);
  assert.equal(lengthEdit.materialResolution.finishedPartQuantity,2);
  assert.equal(lengthEdit.materialResolution.pricingReferenceStockLengthIn,72);
  assert.equal(lengthEdit.materialResolution.plan.parents[0].remainderIn,38.625);

  const qtyEdit=parseJson(await postJob(await userDefinedBoardJobBody({
    quantity:4,
    spotDemand:null
  })));
  assert.equal(qtyEdit.materialResolution.finishedPartLengthIn,16);
  assert.equal(qtyEdit.materialResolution.finishedPartQuantity,4);
  assert.equal(qtyEdit.materialResolution.pricingReferenceSku,'STB-ZERO-SPF-2X4-96-001');
  assert.equal(qtyEdit.materialResolution.pricingReferenceStockLengthIn,96);
  assert.equal(qtyEdit.materialResolution.plan.accounting.productionSawCuts,5);
  assert.equal(qtyEdit.materialResolution.plan.parents[0].remainderIn,31.375);
  assert.equal(qtyEdit.rawEstimate.totals.material,4.18);
  assert.equal(qtyEdit.rawEstimate.totals.Q,56.18);
});

test('missing spot location stays unresolved while Store-selected material and saw plan remain resolved', async (t) => {
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
  assert.equal(body.materialResolution.pricingReferenceStockLengthIn,72);
  assert.equal(body.materialResolution.plan.parents[0].remainderIn,39.625);
  assert.equal(body.rawEstimate.status, 'PARTIAL_BUDGETARY_ESTIMATE');
  assert.equal(body.rawEstimate.totals.material,3.13);
  assert.equal(body.rawEstimate.totals.Q,54.27);
  assert.ok(body.materialResolution.unresolvedConditions.includes('SPOT_LOCATION_REQUIRED'));
  assert.ok(body.materialResolution.unresolvedConditions.includes('SPOT_TOOL_POINT_GEOMETRY_REQUIRED'));
  assert.ok(body.priceCompleteness.unresolvedConditions.includes('SPOT_LOCATION_REQUIRED'));
  assert.ok(body.mappedCallInputs.definition.unresolvedConditions.includes('SPOT_LOCATION_REQUIRED'));
});

test('no spot request creates no spot demand and leaves the parent/saw answer complete', async (t) => {
  await withPinnedAdapter(t);
  const body = parseJson(await postJob(await userDefinedBoardJobBody({ spotDemand: null })));
  assert.equal(body.rawEvaluation.status, 'SUPPORTABLE');
  assert.equal(body.materialResolution.status,'MAPPED');
  assert.equal(body.materialResolution.pricingReferenceStockLengthIn,72);
  assert.equal(body.materialResolution.plan.accounting.productionSawCuts,3);
  assert.equal(body.mappedCallInputs.definition.spotDemand, null);
  assert.equal(body.mappedCallInputs.definition.spotOperation, null);
  assert.equal(body.mappedCallInputs.estimate.spotCycles, 0);
  assert.equal(body.priceCompleteness.status, 'COMPLETE_FOR_ENCODED_DEMAND');
  assert.equal(body.rawEstimate.totals.Q,54.27);
});
