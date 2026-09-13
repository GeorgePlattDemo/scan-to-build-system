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
      assert.equal(spec.line.profileKind, 'STRAIGHT_RECT');
      assert.equal(spec.line.tabCount, 4);
      assert.equal(spec.line.routeDepthIn, 0.5);
      return {
        status: spec.line.blankL_in < 6 ? 'REFUSED' : 'SUPPORTABLE',
        reasons: spec.line.blankL_in < 6 ? ['BLANK_BELOW_REFERENCE_MINIMUM'] : [],
        unresolved: [],
        envelope: 'S001-MODE2-STENCIL-V1',
        jobType: 'SHEET_MODE2_STENCIL_V1',
        evidenceClass: 'REFERENCE',
        commissioned: false,
        physicalStatus: 'NOT_CLAIMED',
      };
    },
    estimateSheetMode2Job() {
      return { status: 'BUDGETARY_MATERIAL_ONLY', Q: 57.82, processQ_status: 'UNRESOLVED', note: 'Not a commercial quote.' };
    },
    evaluateSheetMode2ArchedJob(_catalog, spec) {
      assert.equal('arcRadius_in' in spec.line, false);
      const radius = spec.line.arcChord_in * spec.line.arcChord_in / (8 * spec.line.arcRise_in) + spec.line.arcRise_in / 2;
      return {
        status: 'SUPPORTABLE',
        reasons: [],
        unresolved: [],
        envelope: 'S001-MODE2-ARCHED-APERTURE-V0',
        jobType: 'SHEET_MODE2_ARCHED_APERTURE_V0',
        evidenceClass: 'REFERENCE',
        commissioned: false,
        physicalStatus: 'NOT_CLAIMED',
        curve: {
          kind: 'CIRCULAR_SEGMENT',
          chord_in: spec.line.arcChord_in,
          rise_in: spec.line.arcRise_in,
          radius_in: radius,
          derivedRadius_in: radius,
        },
        retention: {
          class: 'STENCIL_TABS',
          requestedTabCount: spec.line.tabCount,
          plannedTabCount: spec.line.tabCount,
          tabPolicyId: 'TEST-TABS',
          tabPlanStatus: 'SUPPORTABLE',
          fullSeverance: false,
        },
      };
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

test('published-job adapter accepts only bounded job id plus bounded human inputs', async () => {
  const adapter = await createPublishedJobAdapter({ storeModule: fakeStore() });
  assert.equal((await adapter.dispatch({})).status, 422);
  assert.equal((await adapter.dispatch({ jobId: 'not-published' })).status, 422);
  assert.equal((await adapter.dispatch({ jobId: 'rect-stencil', gcode: 'G0 X0' })).status, 422);
  assert.equal((await adapter.dispatch({ jobId: 'rect-stencil', inputs: { lengthIn: 24 } })).status, 422);
  assert.equal((await adapter.dispatch({ jobId: 'rect-stencil', inputs: { lengthIn: 24, widthIn: 18, routeDepthIn: 0.1 } })).status, 422);
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

test('rectangular human numbers reach Store and Store remains responsible for envelope refusal', async () => {
  const adapter = await createPublishedJobAdapter({ storeModule: fakeStore() });
  const supported = await adapter.dispatch({
    jobId: 'rect-stencil',
    inputs: { lengthIn: 30, widthIn: 20 },
  });
  assert.equal(supported.status, 200);
  assert.deepEqual(supported.body.inputs, { lengthIn: 30, widthIn: 20 });
  assert.equal(supported.body.status, 'SUPPORTABLE');
  assert.equal(supported.body.envelope, 'S001-MODE2-STENCIL-V1');
  assert.equal(supported.body.evidenceClass, 'REFERENCE');
  assert.equal(supported.body.physicalStatus, 'NOT_CLAIMED');
  assert.equal(supported.body.commissioned, false);
  assert.equal(supported.body.estimate.Q, 57.82);
  assert.equal(supported.body.physicalExecutionAuthorized, false);
  assert.equal(supported.body.controllerOutputProduced, false);

  const refused = await adapter.dispatch({
    jobId: 'rect-stencil',
    inputs: { lengthIn: 5, widthIn: 20 },
  });
  assert.equal(refused.body.status, 'REFUSED');
  assert.deepEqual(refused.body.reasons, ['BLANK_BELOW_REFERENCE_MINIMUM']);
  assert.equal(refused.body.estimate, null);
});

test('arched human numbers let Store derive radius and return bounded tab planning', async () => {
  const adapter = await createPublishedJobAdapter({ storeModule: fakeStore() });
  const result = await adapter.dispatch({
    jobId: 'arched-opening',
    inputs: { openingWidthIn: 40, straightHeightIn: 30, riseIn: 10 },
  });
  assert.equal(result.status, 200);
  assert.equal(result.body.status, 'SUPPORTABLE');
  assert.deepEqual(result.body.inputs, { openingWidthIn: 40, straightHeightIn: 30, riseIn: 10 });
  assert.equal(result.body.requestType, 'SHEET_MODE2_ARCHED_APERTURE_V0');
  assert.equal(result.body.curve.chord_in, 40);
  assert.equal(result.body.curve.rise_in, 10);
  assert.equal(result.body.curve.derivedRadius_in, 25);
  assert.equal(result.body.retention.plannedTabCount, 4);
  assert.equal(result.body.evidenceClass, 'REFERENCE');
  assert.equal(result.body.physicalStatus, 'NOT_CLAIMED');
  assert.equal(result.body.commissioned, false);
  assert.equal(result.body.physicalExecutionAuthorized, false);
  assert.equal(result.body.controllerOutputProduced, false);
});
