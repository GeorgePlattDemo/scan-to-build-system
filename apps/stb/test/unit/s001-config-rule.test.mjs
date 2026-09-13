import assert from 'node:assert/strict';
import test from 'node:test';

import {
  S001_CENTERED_ARCH_CLASS_ID,
  S001_CENTERED_ARCH_DEFAULTS,
  evaluateS001CenteredArchConfiguration,
  normalizeS001CenteredArchConfiguration,
} from '../../shared/class-config.mjs';

test('canonical S-001 configuration keeps the long axis horizontal and the stay-away margins correct', () => {
  const configuration = normalizeS001CenteredArchConfiguration(S001_CENTERED_ARCH_DEFAULTS, {
    basis: 'canonical-test',
  });
  const evaluation = evaluateS001CenteredArchConfiguration(configuration);
  assert.equal(evaluation.valid, true);
  assert.equal(evaluation.geometry.classId, S001_CENTERED_ARCH_CLASS_ID);
  assert.deepEqual(evaluation.geometry.parent, { horizontalIn: 96, verticalIn: 48 });
  assert.deepEqual(evaluation.geometry.workField.sheetOffsets, {
    leftIn: 24,
    rightIn: 24,
    bottomIn: 6,
    topIn: 6,
  });
  assert.deepEqual(evaluation.geometry.opening.sheetOffsets, {
    leftIn: 30,
    rightIn: 30,
    bottomIn: 6,
    topIn: 6,
  });
  assert.deepEqual(evaluation.geometry.opening.marginsWithinWorkField, {
    leftIn: 6,
    rightIn: 6,
    bottomIn: 0,
    topIn: 0,
  });
});

test('S-001 configuration keeps out-of-field demand unchanged and unresolved', () => {
  const configuration = normalizeS001CenteredArchConfiguration({
    openingWidthIn: '60',
    straightHeightIn: '30',
    riseIn: '10',
  });
  const evaluation = evaluateS001CenteredArchConfiguration(configuration);
  assert.equal(evaluation.valid, true);
  assert.equal(evaluation.geometry.withinWorkField, false);
  assert.equal(evaluation.geometry.opening.widthIn, 60);
  assert.equal(evaluation.geometry.opening.totalHeightIn, 40);
  assert.deepEqual(evaluation.unresolvedConditions, ['PROJECT_GEOMETRY_OUTSIDE_CANONICAL_FIELD']);
});

test('S-001 configuration never invents missing or nonpositive dimensions', () => {
  const missing = evaluateS001CenteredArchConfiguration(
    normalizeS001CenteredArchConfiguration({ openingWidthIn: '36', straightHeightIn: '', riseIn: '12' }),
  );
  assert.equal(missing.valid, false);
  assert.ok(missing.unresolvedInputs.includes('missing-straightHeightIn'));

  const nonpositive = evaluateS001CenteredArchConfiguration(
    normalizeS001CenteredArchConfiguration({ openingWidthIn: '36', straightHeightIn: '24', riseIn: '0' }),
  );
  assert.equal(nonpositive.valid, false);
  assert.ok(nonpositive.unresolvedInputs.includes('nonpositive-riseIn'));
});
