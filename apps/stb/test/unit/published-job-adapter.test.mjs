import assert from 'node:assert/strict';
import test from 'node:test';

import {
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
  assert.deepEqual(inspectPublishedJobRequest(null), {
    ok: false,
    status: 400,
    code: 'MALFORMED_REQUEST',
  });
  assert.deepEqual(inspectPublishedJobRequest({}), {
    ok: false,
    status: 422,
    code: 'INVALID_BOUNDED_SCOPE',
  });
  assert.deepEqual(inspectPublishedJobRequest({ jobId: 'not-published' }), {
    ok: false,
    status: 422,
    code: 'UNKNOWN_PUBLISHED_JOB',
  });
  assert.equal(
    inspectPublishedJobRequest({ jobId: 'rect-stencil', gcode: 'G0 X0' }).code,
    'INVALID_BOUNDED_SCOPE',
  );
  assert.equal(
    inspectPublishedJobRequest({ jobId: 'rect-stencil', inputs: { lengthIn: 24 } }).code,
    'INVALID_BOUNDED_INPUTS',
  );
  assert.equal(
    inspectPublishedJobRequest({
      jobId: 'rect-stencil',
      inputs: { lengthIn: 24, widthIn: 18, routeDepthIn: 0.1 },
    }).code,
    'INVALID_BOUNDED_INPUTS',
  );

  const rect = inspectPublishedJobRequest({
    jobId: 'rect-stencil',
    inputs: { lengthIn: 30, widthIn: 20 },
  });
  assert.equal(rect.ok, true);
  assert.equal(rect.job.id, 'rect-stencil');
  assert.deepEqual(rect.inputs, { lengthIn: 30, widthIn: 20 });

  const arch = inspectPublishedJobRequest({
    jobId: 'arched-opening',
    inputs: { openingWidthIn: 40, straightHeightIn: 30, riseIn: 10 },
  });
  assert.equal(arch.ok, true);
  assert.equal(arch.job.id, 'arched-opening');
  assert.deepEqual(arch.inputs, { openingWidthIn: 40, straightHeightIn: 30, riseIn: 10 });
});

test('published-job Store status allowlist is exact and fail-closed', () => {
  for (const status of ['SUPPORTABLE', 'UNRESOLVED', 'REFUSED', 'UNAVAILABLE']) {
    assert.equal(isDeclaredPublishedJobStoreStatus(status), true, status);
  }
  for (const status of [undefined, null, '', 'NEW_UNREVIEWED_STATUS', 'AUTHORIZED', 'CYCLE_START']) {
    assert.equal(isDeclaredPublishedJobStoreStatus(status), false, String(status));
  }
});
