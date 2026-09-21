import assert from 'node:assert/strict';
import test from 'node:test';

import { PUBLISHED_BOARD_SKU } from '../../shared/contracts.mjs';
import { ADAPTER_ERROR_CODES } from '../../shared/store-wire.mjs';
import { createStoreAdapter } from '../../server/store-adapter.mjs';
import { startServer } from '../../server/main.mjs';
import {
  boardJobBody,
  parseJson,
  postJob,
  requireCleanPinnedStore,
  userDefinedBoardJobBody,
} from './helpers.mjs';

async function withAdapter(t, options = {}) {
  await requireCleanPinnedStore();
  const adapter = await createStoreAdapter(options);
  assert.equal(adapter.ready, true, JSON.stringify(adapter.inspection));
  const host = await startServer({ storeAdapter: adapter });
  t.after(() => host.close());
  return adapter;
}

function cloneOffering(catalog, storeSku, patch) {
  return {
    ...catalog,
    offerings: catalog.offerings.map((item) =>
      item.storeSku === storeSku ? { ...item, ...patch } : item,
    ),
  };
}

test('actual 45-in and 46-in Board HTTP invoke pinned evaluateJob and matching estimateJob', async (t) => {
  const adapter = await withAdapter(t);
  const body45 = parseJson(await postJob(await boardJobBody({ keptLengthIn: 45 })));
  assert.equal(body45.rawEvaluation.status, 'SUPPORTABLE');
  assert.equal(body45.mappedCallInputs.evaluation.lines[0].storeSku, PUBLISHED_BOARD_SKU);
  assert.equal(body45.mappedCallInputs.evaluation.lines[0].qty, 1);
  assert.deepEqual(body45.mappedCallInputs.evaluation.lines[0].requiredOps, ['CROSSCUT']);
  assert.equal(body45.mappedCallInputs.evaluation.lines[0].keptLengthIn, 45);
  assert.equal(body45.mappedCallInputs.estimate.pieces[0].keptLengthIn, 45);
  assert.equal(body45.mappedCallInputs.estimate.pieces[0].widthIn, 3.5);
  assert.equal(body45.mappedCallInputs.estimate.classId, 'app.board.square.v1');
  assert.equal(body45.rawEstimate.status, 'BUDGETARY_ESTIMATE');
  const direct45 = adapter.modules.estimateJob(adapter.catalog, body45.mappedCallInputs.estimate);
  assert.deepEqual(body45.rawEstimate, direct45);

  const body46 = parseJson(await postJob(await boardJobBody({ keptLengthIn: 46 })));
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
  assert.notEqual(body45.rawEstimate.totals.Q, 0);
  assert.notEqual(body46.rawEstimate.totals.Q, 0);
});

test('user-defined X-brace invokes pinned Store evaluation and sequence pricing', async (t) => {
  const adapter = await withAdapter(t);
  const body = parseJson(await postJob(await userDefinedBoardJobBody()));
  assert.equal(body.rawEvaluation.status, 'SUPPORTABLE');
  assert.deepEqual(body.mappedCallInputs.evaluation.lines[0].requiredOps, ['MITER_LIMITED', 'DRILL']);
  assert.equal(body.mappedCallInputs.evaluation.lines[0].keptLengthIn, 60);
  assert.equal(body.mappedCallInputs.definition.definedWorkpieceLengthIn, 60);
  assert.equal(body.mappedCallInputs.definition.sawCuts, 3);
  assert.equal(body.mappedCallInputs.definition.sawAngleDeg, 30);
  assert.equal(body.mappedCallInputs.definition.drillCycles, 2);
  assert.equal(body.mappedCallInputs.estimate.pieces[0].keptLengthIn, 60);
  assert.equal(body.mappedCallInputs.estimate.pieces[0].sawCuts, 3);
  assert.equal(body.mappedCallInputs.estimate.pieces[0].holes, 2);
  assert.equal(body.mappedCallInputs.estimate.pieces[0].depthIn, 0.75);
  assert.ok(body.mappedCallInputs.estimate.pieces[0].sawTraverseIn > 3.5);
  assert.equal(body.rawEstimate.status, 'BUDGETARY_ESTIMATE');
  assert.equal(body.rawEstimate.totals.material, 3.13);
  assert.equal(body.rawEstimate.cycle.T_job_min, 10.077);
  assert.equal(body.rawEstimate.totals.cell_recovery, 51.79);
  assert.equal(body.rawEstimate.totals.Q, 54.92);
  assert.equal(body.rawEstimate.cycle.model, 'STB-D001-CYCLE-MODEL-S2-0.1');
  assert.equal(body.attributedBasis.pricingEngine.id, 'STB-STORE-ZERO-PRICE-1');
  assert.equal(body.attributedBasis.pricingEngine.version, '0.2.2');
});

test('unknown SKU through actual evaluateJob retains UNRESOLVED and raw NO_OFFERING/MISSING_PRICE', async (t) => {
  const adapter = await withAdapter(t);
  const raw = await adapter.diagnosticEvaluateJob({
    title: 'unknown',
    lines: [{ storeSku: 'STB-ZERO-DOES-NOT-EXIST', qty: 1, requiredOps: ['CROSSCUT'], keptLengthIn: 45 }],
  });
  assert.equal(raw.status, 'UNRESOLVED');
  assert.equal(raw.lines[0].capability.reason, 'NO_OFFERING');
  assert.equal(raw.lines[0].price.reason, 'MISSING_PRICE');
  const http = parseJson(await postJob(await boardJobBody({ storeSku: 'STB-ZERO-DOES-NOT-EXIST' })));
  assert.equal(http.rawEvaluation.status, 'UNRESOLVED');
  assert.equal(http.rawEstimate, null);
});

test('availability clones retain ON_HAND_SHORT then NOT_ON_HAND via actual evaluateJob', async (t) => {
  const adapter = await withAdapter(t);
  const shortCatalog = cloneOffering(adapter.catalog, PUBLISHED_BOARD_SKU, { onHand: 3, allocated: 0 });
  const short = await adapter.diagnosticEvaluateJob(
    {
      title: 'short',
      lines: [{ storeSku: PUBLISHED_BOARD_SKU, qty: 10, requiredOps: ['CROSSCUT'], keptLengthIn: 45 }],
    },
    shortCatalog,
  );
  assert.equal(short.status, 'UNAVAILABLE');
  assert.equal(short.lines[0].stock.status, 'ON_HAND_SHORT');
  assert.equal(short.lines[0].stock.supplierPath, 'SPECIAL_ORDER_REPRESENTED');

  const emptyCatalog = cloneOffering(adapter.catalog, PUBLISHED_BOARD_SKU, { onHand: 0, allocated: 0 });
  const empty = await adapter.diagnosticEvaluateJob(
    {
      title: 'empty',
      lines: [{ storeSku: PUBLISHED_BOARD_SKU, qty: 1, requiredOps: ['CROSSCUT'], keptLengthIn: 45 }],
    },
    emptyCatalog,
  );
  assert.equal(empty.status, 'UNAVAILABLE');
  assert.equal(empty.lines[0].stock.status, 'NOT_ON_HAND');

  const request = await boardJobBody({ keptLengthIn: 45 });
  const zeroAdapter = await createStoreAdapter({ catalogOverride: emptyCatalog });
  const dispatched = await zeroAdapter.dispatch(request);
  assert.equal(dispatched.status, 200);
  assert.equal(dispatched.body.rawEvaluation.status, 'UNAVAILABLE');
  assert.equal(dispatched.body.rawEvaluation.lines[0].stock.status, 'NOT_ON_HAND');
  assert.equal(dispatched.body.rawEstimate, null);
  assert.equal(zeroAdapter.instrumentation.estimateCalls, 0);
});

test('width envelope clone retains STOCK_WIDTH_EXCEEDS_D001_STAGE2_ENVELOPE', async (t) => {
  const adapter = await withAdapter(t);
  const wide = cloneOffering(adapter.catalog, PUBLISHED_BOARD_SKU, { actualW: 13.25 });
  const evaluation = await adapter.diagnosticEvaluateJob(
    {
      title: 'wide',
      lines: [{ storeSku: PUBLISHED_BOARD_SKU, qty: 1, requiredOps: ['CROSSCUT'], keptLengthIn: 45 }],
    },
    wide,
  );
  assert.equal(evaluation.status, 'REFUSED');
  assert.ok(
    evaluation.lines[0].capability.missing.includes('STOCK_WIDTH_EXCEEDS_D001_STAGE2_ENVELOPE'),
  );
});

test('actual 144-in parent retains PARENT_LENGTH_REQUIRES_UNDECLARED_EXTERNAL_SUPPORT', async (t) => {
  const adapter = await withAdapter(t);
  const evaluation = await adapter.diagnosticEvaluateJob({
    title: 'long parent',
    lines: [
      {
        storeSku: 'STB-ZERO-SPF-2X4-144-001',
        qty: 1,
        requiredOps: ['CROSSCUT'],
        keptLengthIn: 45,
      },
    ],
  });
  assert.equal(evaluation.status, 'REFUSED');
  assert.ok(
    evaluation.lines[0].capability.missing.includes('PARENT_LENGTH_REQUIRES_UNDECLARED_EXTERNAL_SUPPORT'),
  );
  const http = await postJob(await boardJobBody({ storeSku: 'STB-ZERO-SPF-2X4-144-001' }));
  assert.equal(http.status, 422);
  assert.equal(parseJson(http).code, ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE);
});

test('96-in parent kept 16 retains KEPT_LENGTH_BELOW_TWO_ROLLER_CONTROL', async (t) => {
  const adapter = await withAdapter(t);
  const evaluation = await adapter.diagnosticEvaluateJob({
    title: 'too short',
    lines: [
      {
        storeSku: 'STB-ZERO-SPF-2X4-96-001',
        qty: 1,
        requiredOps: ['CROSSCUT'],
        keptLengthIn: 16,
      },
    ],
  });
  assert.equal(evaluation.status, 'REFUSED');
  assert.ok(evaluation.lines[0].capability.missing.includes('KEPT_LENGTH_BELOW_TWO_ROLLER_CONTROL'));
});

test('RIP diagnostic retains exact OP_NOT_ON_OFFERING:RIP', async (t) => {
  const adapter = await withAdapter(t);
  const evaluation = await adapter.diagnosticEvaluateJob({
    title: 'rip',
    lines: [{ storeSku: PUBLISHED_BOARD_SKU, qty: 1, requiredOps: ['RIP'], keptLengthIn: 45 }],
  });
  assert.equal(evaluation.status, 'REFUSED');
  assert.deepEqual(evaluation.lines[0].capability.missing, ['OP_NOT_ON_OFFERING:RIP']);
});

test('Store basis distinguishes pricing engine, cycle model, and envelope identity', async (t) => {
  const adapter = await withAdapter(t);
  assert.equal(adapter.modules.ENGINE.id, 'STB-STORE-ZERO-PRICE-1');
  assert.equal(adapter.modules.ENGINE.version, '0.2.2');
  assert.equal(adapter.modules.CYCLE_MODEL.id, 'STB-D001-CYCLE-MODEL-S2-0.1');
  assert.equal(adapter.modules.CYCLE_MODEL.measured, false);
  assert.equal(adapter.modules.CYCLE_MODEL.commissioned, false);
  assert.equal(adapter.modules.D001_STAGE2_ENVELOPE.id, 'D001-STAGE2-ENVELOPE-0.2');
  assert.equal(adapter.modules.D001_STAGE2_ENVELOPE.measured, false);
  assert.equal(adapter.modules.D001_STAGE2_ENVELOPE.commissioned, false);
  assert.equal(adapter.modules.D001_STAGE2_ENVELOPE.motion.Y_MILL_TRAVEL_MAX_IN, 14);
  assert.equal(adapter.modules.D001_STAGE2_ENVELOPE.stock.maxWidthIn, 12);
  assert.equal(adapter.modules.D001_STAGE2_ENVELOPE.motion.FEED_X_MAX_LOADED_IN_PER_MIN, 480);
  assert.equal(adapter.modules.D001_STAGE2_ENVELOPE.motion.MILL_CUTTING_FEED_IN_PER_MIN, 48);
  assert.equal(adapter.modules.D001_STAGE2_ENVELOPE.base.lengthIn, 72);
  assert.equal(adapter.modules.D001_STAGE2_ENVELOPE.stock.maxParentLengthWithoutExternalSupportIn, 96);
  assert.equal(adapter.modules.D001_STAGE2_ENVELOPE.stock.minControlledLengthIn, 24);
  const body = parseJson(await postJob(await boardJobBody({ keptLengthIn: 45 })));
  assert.equal(body.attributedBasis.pricingEngine.version, '0.2.2');
  assert.equal(body.attributedBasis.cycleModel.id, 'STB-D001-CYCLE-MODEL-S2-0.1');
  assert.equal(body.attributedBasis.envelope.id, 'D001-STAGE2-ENVELOPE-0.2');
});

test('missing selling price remains UNRESOLVED and never $0', async (t) => {
  const adapter = await withAdapter(t);
  const missing = cloneOffering(adapter.catalog, PUBLISHED_BOARD_SKU, { sellingPrice: null });
  const evaluation = await adapter.diagnosticEvaluateJob(
    {
      title: 'no price',
      lines: [{ storeSku: PUBLISHED_BOARD_SKU, qty: 1, requiredOps: ['CROSSCUT'], keptLengthIn: 45 }],
    },
    missing,
  );
  assert.equal(evaluation.status, 'UNRESOLVED');
  assert.equal(evaluation.lines[0].price.reason, 'MISSING_PRICE');
  const estimate = await adapter.diagnosticEstimateJob(
    {
      title: 'no price',
      classId: 'app.board.square.v1',
      pieces: [{ storeSku: PUBLISHED_BOARD_SKU, qty: 1, keptLengthIn: 45, widthIn: 3.5 }],
    },
    missing,
  );
  assert.equal(estimate.status, 'UNRESOLVED');
  assert.notEqual(estimate.totals?.Q, 0);
  assert.equal(estimate.totals, undefined);
});

test('estimate failure after SUPPORTABLE preserves raw evaluation and omits budget', async (t) => {
  await requireCleanPinnedStore();
  const adapter = await createStoreAdapter({ hooks: { failEstimate: true } });
  const host = await startServer({ storeAdapter: adapter });
  t.after(() => host.close());
  const body = parseJson(await postJob(await boardJobBody({ keptLengthIn: 45 })));
  assert.equal(body.rawEvaluation.status, 'SUPPORTABLE');
  assert.equal(body.rawEstimate, null);
  assert.equal(body.estimateError.code, ADAPTER_ERROR_CODES.ESTIMATE_FAILED);
  assert.notEqual(body.rawEvaluation.status, 'UNRESOLVED');
  assert.equal(body.rawEstimate?.totals?.Q, undefined);
});
