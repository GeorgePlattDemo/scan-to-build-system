import assert from 'node:assert/strict';
import test from 'node:test';

import {
  PUBLISHED_JOBS,
  PUBLISHED_JOB_STORE_PIN,
  buildPublishedJobSpec,
  normalizePublishedJobInputs,
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

test('published defaults are human numbers, with fixed Store policy kept separate', () => {
  assert.deepEqual(publishedJob('square-stick').defaults, { keptLengthIn: 45 });
  assert.deepEqual(publishedJob('rect-stencil').defaults, { lengthIn: 24, widthIn: 18 });
  assert.deepEqual(publishedJob('rect-stencil').fixed, {
    profileKind: 'STRAIGHT_RECT',
    tabCount: 4,
    routeDepthIn: 0.5,
  });
  assert.deepEqual(publishedJob('arched-opening').defaults, {
    openingWidthIn: 36,
    straightHeightIn: 36,
    riseIn: 12,
  });
  assert.deepEqual(publishedJob('arched-opening').fixed, {
    outerL_in: 72,
    outerW_in: 48,
    tabCount: 4,
    routeDepthIn: 0.5,
  });
});

test('rect human inputs map only to Store blank dimensions', () => {
  const job = publishedJob('rect-stencil');
  const spec = buildPublishedJobSpec(job, { lengthIn: 30, widthIn: 20 });
  assert.deepEqual(spec.inputs, { lengthIn: 30, widthIn: 20 });
  assert.deepEqual(spec.evaluation.line, {
    storeSku: 'STB-ZERO-PLY-075-48X96-001',
    qty: 1,
    profileKind: 'STRAIGHT_RECT',
    blankL_in: 30,
    blankW_in: 20,
    tabCount: 4,
    routeDepthIn: 0.5,
  });
});

test('arch sends opening width as chord and does not derive or transmit radius', () => {
  const job = publishedJob('arched-opening');
  const spec = buildPublishedJobSpec(job, {
    openingWidthIn: 40,
    straightHeightIn: 30,
    riseIn: 10,
  });
  assert.deepEqual(spec.inputs, { openingWidthIn: 40, straightHeightIn: 30, riseIn: 10 });
  assert.deepEqual(spec.evaluation.line, {
    storeSku: 'STB-ZERO-PLY-050-48X96-001',
    qty: 1,
    outerL_in: 72,
    outerW_in: 48,
    apertureW_in: 40,
    apertureStraightH_in: 30,
    arcChord_in: 40,
    arcRise_in: 10,
    tabCount: 4,
    routeDepthIn: 0.5,
  });
  assert.equal('arcRadius_in' in spec.evaluation.line, false);
  assert.equal('geometryClass' in spec.evaluation.line, false);
});

test('published input schema rejects missing, extra, and non-finite values without Store range clamping', () => {
  const rect = publishedJob('rect-stencil');
  assert.throws(() => normalizePublishedJobInputs(rect, { lengthIn: 24 }), /exactly/);
  assert.throws(() => normalizePublishedJobInputs(rect, { lengthIn: 24, widthIn: 18, routeDepthIn: 0.5 }), /exactly/);
  assert.throws(() => normalizePublishedJobInputs(rect, { lengthIn: Number.NaN, widthIn: 18 }), /finite/);
  assert.deepEqual(normalizePublishedJobInputs(rect, { lengthIn: -1, widthIn: 1000 }), { lengthIn: -1, widthIn: 1000 });
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
