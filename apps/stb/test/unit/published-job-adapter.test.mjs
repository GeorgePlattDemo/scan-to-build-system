import assert from 'node:assert/strict';
import test from 'node:test';

import {
  boundedPublishedEstimate,
  boundedPublishedEvaluation,
  createPublishedJobAdapter,
  inspectPublishedJobRequest,
  isDeclaredPublishedJobStoreStatus,
} from '../../server/published-job-adapter.mjs';

test('published-job adapter fails closed when candidate Store root is absent', async () => {
  const adapter = await createPublishedJobAdapter({ storeRoot: null });
  assert.equal(adapter.ready, false);
  assert.equal(adapter.inspection.code, 'PUBLISHED_JOB_STORE_ROOT_MISSING');
  const result = await adapter.dispatch({ jobId: 'rect-stencil' });
  assert.equal(result.status, 503);
  assert.equal(result.body.ready, false);
  assert.equal(result.body.physicalExecutionAuthorized, false);
  assert.equal(result.body.controllerOutputProduced, false);
});

test('published-job request contract accepts only bounded job id plus bounded human inputs', () => {
  assert.deepEqual(inspectPublishedJobRequest(null), { ok: false, status: 400, code: 'MALFORMED_REQUEST' });
  assert.deepEqual(inspectPublishedJobRequest({}), { ok: false, status: 422, code: 'INVALID_BOUNDED_SCOPE' });
  assert.deepEqual(inspectPublishedJobRequest({ jobId: 'not-published' }), { ok: false, status: 422, code: 'UNKNOWN_PUBLISHED_JOB' });
  assert.equal(inspectPublishedJobRequest({ jobId: 'rect-stencil', gcode: 'G0 X0' }).code, 'INVALID_BOUNDED_SCOPE');
  assert.equal(inspectPublishedJobRequest({ jobId: 'rect-stencil', inputs: { lengthIn: 24 } }).code, 'INVALID_BOUNDED_INPUTS');
  assert.equal(inspectPublishedJobRequest({ jobId: 'rect-stencil', inputs: { lengthIn: 24, widthIn: 18, routeDepthIn: 0.1 } }).code, 'INVALID_BOUNDED_INPUTS');

  const rect = inspectPublishedJobRequest({ jobId: 'rect-stencil', inputs: { lengthIn: 30, widthIn: 20 } });
  assert.equal(rect.ok, true);
  assert.equal(rect.job.id, 'rect-stencil');
  assert.deepEqual(rect.inputs, { lengthIn: 30, widthIn: 20 });

  const arch = inspectPublishedJobRequest({ jobId: 'arched-opening', inputs: { openingWidthIn: 40, straightHeightIn: 20, riseIn: 10 } });
  assert.equal(arch.ok, true);
  assert.equal(arch.job.id, 'arched-opening');
  assert.deepEqual(arch.inputs, { openingWidthIn: 40, straightHeightIn: 20, riseIn: 10 });
});

test('published-job Store status allowlist is exact and fail-closed', () => {
  for (const status of ['SUPPORTABLE', 'UNRESOLVED', 'REFUSED', 'UNAVAILABLE']) assert.equal(isDeclaredPublishedJobStoreStatus(status), true, status);
  for (const status of [undefined, null, '', 'NEW_UNREVIEWED_STATUS', 'AUTHORIZED', 'CYCLE_START']) assert.equal(isDeclaredPublishedJobStoreStatus(status), false, String(status));
});

test('published-job estimate projection preserves dimensional modeled economics', () => {
  const estimate = boundedPublishedEstimate({
    status: 'BUDGETARY_ESTIMATE',
    cycle: { model: 'STB-D001-CYCLE-MODEL-S2-0.1', basis: 'CALCULATED', measured: false, T_job_min: 9.486 },
    totals: { material: 3.13, cell_recovery: 50.81, hardware: 0, Q: 53.94, Q_basis: 'CALCULATED', note: 'Budgetary estimate. Not a commercial quote.' },
  });
  assert.deepEqual(estimate, {
    status: 'BUDGETARY_ESTIMATE', material: 3.13, processQ: null, processQ_status: null,
    cellRecovery: 50.81, hardware: 0, Q: 53.94, Q_basis: 'CALCULATED', modeledTimeMin: 9.486,
    cycleModel: 'STB-D001-CYCLE-MODEL-S2-0.1', cycleBasis: 'CALCULATED', cycleMeasured: false,
    note: 'Budgetary estimate. Not a commercial quote.',
  });
});

test('published-job estimate projection preserves sheet material-only economics without inventing process Q', () => {
  const estimate = boundedPublishedEstimate({
    status: 'BUDGETARY_MATERIAL_ONLY', material: 57.82, processQ: null, processQ_status: 'UNRESOLVED',
    Q: 57.82, Q_basis: 'MATERIAL_FIXTURE_ONLY', note: 'Budgetary material fixture only.',
  });
  assert.deepEqual(estimate, {
    status: 'BUDGETARY_MATERIAL_ONLY', material: 57.82, processQ: null, processQ_status: 'UNRESOLVED',
    cellRecovery: null, hardware: null, Q: 57.82, Q_basis: 'MATERIAL_FIXTURE_ONLY', modeledTimeMin: null,
    cycleModel: null, cycleBasis: null, cycleMeasured: null, note: 'Budgetary material fixture only.',
  });
});

test('published-job evaluation projects Store work field, curve and bounded tab audit without microgeometry', () => {
  const projected = boundedPublishedEvaluation({
    status: 'SUPPORTABLE',
    basis: {
      envelope: 'S001-MODE2-ARCHED-APERTURE-V0',
      curve: { kind: 'CIRCULAR_SEGMENT', chord_in: 36, rise_in: 12, radius_in: 19.5, derivedRadius_in: 19.5 },
      retention: {
        class: 'STENCIL_TABS', requestedTabCount: 4, plannedTabCount: 5,
        tabPolicyId: 'S001-STENCIL-TAB-POLICY-V0', tabPlanStatus: 'REFERENCE_PLAN_READY', planningReserveTabs: 1,
        physicalRetentionStatus: 'NOT_MEASURED',
        plan: { perimeter_in: 129.864203, arcLength_in: 45.864203, nominalSpacing_in: 25.972841, physicalNote: 'Reference tab-plan geometry is complete.', candidates: [{ index: 1, x_in: 1, y_in: 2 }] },
      },
    },
    line: {
      capability: {
        status: 'SUPPORTABLE', reasons: [], unresolved: [],
        workField: {
          id: 'S001-CENTER-WORK-FIELD-V0', placement: 'CENTERED_ON_PARENT',
          horizontalAxis: 'PARENT_LONG_AXIS', verticalAxis: 'PARENT_SHORT_AXIS',
          horizontalSpan_in: 48, verticalSpan_in: 36, containment: 'WHOLE_PROFILE',
          parentContainsField: true, profileInsideField: true,
          parentMargins_in: { left: 24, right: 24, bottom: 6, top: 6 },
          profileMarginsWithinField_in: { left: 6, right: 6, bottom: 0, top: 0 },
          rawInternalThing: { shouldNotSurvive: true },
        },
      },
    },
  });

  assert.equal(projected.envelope, 'S001-MODE2-ARCHED-APERTURE-V0');
  assert.equal(projected.curve.derivedRadius_in, 19.5);
  assert.deepEqual(projected.workField, {
    id: 'S001-CENTER-WORK-FIELD-V0', placement: 'CENTERED_ON_PARENT',
    horizontalAxis: 'PARENT_LONG_AXIS', verticalAxis: 'PARENT_SHORT_AXIS', horizontalSpan_in: 48, verticalSpan_in: 36,
    containment: 'WHOLE_PROFILE', parentContainsField: true, profileInsideField: true,
    parentMargins_in: { left: 24, right: 24, bottom: 6, top: 6 },
    profileMarginsWithinField_in: { left: 6, right: 6, bottom: 0, top: 0 },
  });
  assert.equal(projected.retention.tabPolicyId, 'S001-STENCIL-TAB-POLICY-V0');
  assert.equal(projected.retention.plannedTabCount, 5);
  assert.equal(projected.retention.physicalRetentionStatus, 'NOT_MEASURED');
  assert.equal(projected.retention.perimeter_in, 129.864203);
  assert.equal('plan' in projected.retention, false);
  assert.equal(JSON.stringify(projected).includes('candidates'), false);
  assert.equal(JSON.stringify(projected).includes('rawInternalThing'), false);
});

test('published-job evaluation projection preserves D-001 envelope refusal reason from nested line', () => {
  const projected = boundedPublishedEvaluation({
    status: 'REFUSED',
    lines: [{ capability: { status: 'REFUSED', missing: ['PARENT_LENGTH_REQUIRES_UNDECLARED_EXTERNAL_SUPPORT'], envelope: { status: 'REFUSED', reasons: ['PARENT_LENGTH_REQUIRES_UNDECLARED_EXTERNAL_SUPPORT'], envelope: 'D001-STAGE2-ENVELOPE-0.2' } } }],
  });
  assert.equal(projected.envelope, 'D001-STAGE2-ENVELOPE-0.2');
  assert.deepEqual(projected.reasons, ['PARENT_LENGTH_REQUIRES_UNDECLARED_EXTERNAL_SUPPORT']);
});
