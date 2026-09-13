import assert from 'node:assert/strict';
import test from 'node:test';

import {
  PUBLISHED_JOBS,
  PUBLISHED_JOB_STORE_PIN,
  buildPublishedJobSpec,
  publishedJob,
} from '../../ops/published-jobs.mjs';

const FORBIDDEN_EXECUTION_KEYS = /(?:gcode|g-code|controller|toolpath|cycleStart|cycle-start|feedRate|spindleSpeed)/i;

test('published job menu is exactly the bounded three-offering trial', () => {
  assert.equal(PUBLISHED_JOB_STORE_PIN, '096e99d645d745b1670185f46c75de75f9e59661');
  assert.deepEqual(PUBLISHED_JOBS.map((job) => job.id), [
    'square-stick',
    'rect-stencil',
    'arched-opening',
  ]);
  assert.deepEqual(PUBLISHED_JOBS.map((job) => job.requestType), [
    'BOARD_SQUARE_V1',
    'SHEET_MODE2_STENCIL_V1',
    'SHEET_MODE2_ARCHED_APERTURE_V0',
  ]);
});

test('published defaults preserve the named human starts', () => {
  assert.equal(publishedJob('square-stick').defaults.keptLengthIn, 45);
  assert.deepEqual(publishedJob('rect-stencil').defaults, {
    profileKind: 'STRAIGHT_RECT',
    blankL_in: 24,
    blankW_in: 18,
    tabCount: 4,
    routeDepthIn: 0.5,
  });
  assert.deepEqual(publishedJob('arched-opening').defaults, {
    geometryClass: 'CURVILINEAR',
    outerL_in: 72,
    outerW_in: 48,
    apertureW_in: 36,
    apertureStraightH_in: 36,
    arcChord_in: 36,
    arcRise_in: 12,
    arcRadius_in: 19.5,
    tabCount: 4,
    routeDepthIn: 0.5,
  });
});

test('published job specs contain demand geometry, not executable machine instructions', () => {
  for (const job of PUBLISHED_JOBS) {
    const serialized = JSON.stringify(buildPublishedJobSpec(job));
    assert.equal(FORBIDDEN_EXECUTION_KEYS.test(serialized), false, `${job.id} leaked an execution key`);
  }
});

test('unknown published job does not silently fall through', () => {
  assert.equal(publishedJob('not-a-job'), null);
});
