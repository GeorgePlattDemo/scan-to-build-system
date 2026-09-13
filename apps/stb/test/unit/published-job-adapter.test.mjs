import assert from 'node:assert/strict';
import test from 'node:test';

import { createPublishedJobAdapter } from '../../server/published-job-adapter.mjs';

function fakeStore() {
  return {
    loadCatalog() {
      return { offerings: [] };
    },
    evaluateJob(_catalog, spec) {
      assert.equal(spec.lines[0].keptLengthIn, 45);
      return { status: 'SUPPORTABLE', jobType: 'BOARD_SQUARE_V1' };
    },
    estimateJob() {
      return { status: 'BUDGETARY_MATERIAL_ONLY', Q: 3.13, processQ_status: 'UNRESOLVED', note: 'Not a commercial quote.' };
    },
    evaluateSheetMode2Job(_catalog, spec) {
      assert.deepEqual(spec.line, {
        storeSku: 'STB-ZERO-PLY-075-48X96-001',
        qty: 1,
        profileKind: 'STRAIGHT_RECT',
        blankL_in: 24,
        blankW_in: 18,
        tabCount: 4,
        routeDepthIn: 0.5,
      });
      return { status: 'SUPPORTABLE', jobType: 'SHEET_MODE2_STENCIL_V1', evidenceClass: 'REFERENCE', commissioned: false };
    },
    estimateSheetMode2Job() {
      return { status: 'BUDGETARY_MATERIAL_ONLY', Q: 57.82, processQ_status: 'UNRESOLVED', note: 'Not a commercial quote.' };
    },
    evaluateSheetMode2ArchedJob(_catalog, spec) {
      assert.equal(spec.line.arcRadius_in, 19.5);
      assert.equal(spec.line.arcRise_in, 12);
      return { status: 'SUPPORTABLE', jobType: 'SHEET_MODE2_ARCHED_APERTURE_V0', evidenceClass: 'REFERENCE', commissioned: false, physicalStatus: 'NOT_CLAIMED' };
    },
    estimateSheetMode2ArchedJob() {
      return { status: 'BUDGETARY_MATERIAL_ONLY', Q: 26.55, processQ_status: 'UNRESOLVED', note: 'Not a commercial quote.' };
    },
  };
}

test('published-job adapter fails closed when candidate Store root is absent', async () => {
  const adapter = await createPublishedJobAdapter({ storeRoot: null });
  assert.equal(adapter.ready, false);
  const result = await adapter.dispatch({ jobId: 'rect-stencil' });
  assert.equal(result.status, 503);
  assert.equal(result.body.ready, false);
  assert.equal(result.body.physicalExecutionAuthorized, false);
  assert.equal(result.body.controllerOutputProduced, false);
});

test('published-job adapter accepts only one named job id', async () => {
  const adapter = await createPublishedJobAdapter({ storeModule: fakeStore() });
  assert.equal((await adapter.dispatch({})).status, 422);
  assert.equal((await adapter.dispatch({ jobId: 'not-published' })).status, 422);
  assert.equal((await adapter.dispatch({ jobId: 'rect-stencil', gcode: 'G0 X0' })).status, 422);
});

test('published-job adapter refuses an undeclared Store disposition', async () => {
  const store = fakeStore();
  store.evaluateSheetMode2Job = () => ({ status: 'NEW_UNREVIEWED_STATUS' });
  const adapter = await createPublishedJobAdapter({ storeModule: store });
  const result = await adapter.dispatch({ jobId: 'rect-stencil' });
  assert.equal(result.status, 502);
  assert.equal(result.body.ready, false);
  assert.equal(result.body.code, 'PUBLISHED_JOB_STORE_RESPONSE_INVALID');
  assert.equal(result.body.physicalExecutionAuthorized, false);
  assert.equal(result.body.controllerOutputProduced, false);
});

test('rectangular published job reaches the bounded Store evaluator without execution authority', async () => {
  const adapter = await createPublishedJobAdapter({ storeModule: fakeStore() });
  const result = await adapter.dispatch({ jobId: 'rect-stencil' });
  assert.equal(result.status, 200);
  assert.equal(result.body.status, 'SUPPORTABLE');
  assert.equal(result.body.requestType, 'SHEET_MODE2_STENCIL_V1');
  assert.equal(result.body.estimate.Q, 57.82);
  assert.equal(result.body.estimate.processQ_status, 'UNRESOLVED');
  assert.equal(result.body.physicalExecutionAuthorized, false);
  assert.equal(result.body.controllerOutputProduced, false);
});

test('arched published job reaches the exact bounded reference geometry', async () => {
  const adapter = await createPublishedJobAdapter({ storeModule: fakeStore() });
  const result = await adapter.dispatch({ jobId: 'arched-opening' });
  assert.equal(result.status, 200);
  assert.equal(result.body.status, 'SUPPORTABLE');
  assert.equal(result.body.requestType, 'SHEET_MODE2_ARCHED_APERTURE_V0');
  assert.equal(result.body.estimate.Q, 26.55);
  assert.equal(result.body.physicalExecutionAuthorized, false);
});
