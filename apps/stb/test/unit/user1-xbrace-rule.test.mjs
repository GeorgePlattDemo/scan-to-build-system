import assert from 'node:assert/strict';
import test from 'node:test';

import {
  USER1_XBRACE_CONFIGURATION_KIND,
  evaluateUser1XBraceConfiguration,
  normalizeUser1XBraceConfiguration,
} from '../../shared/user1-xbrace-rule.mjs';

test('Job 1 16 in baseline is the locked 30 degree X-brace demand', () => {
  const result = evaluateUser1XBraceConfiguration(
    normalizeUser1XBraceConfiguration({ partLengthIn: 16 }),
  );
  assert.equal(result.valid, true);
  assert.equal(result.configurationVersion, '0.1');
  assert.equal(result.derived.definedWorkpieceLengthIn.value, 60);
  assert.equal(result.derived.angleDeg, 30);
  assert.equal(result.derived.sawCuts, 3);
  assert.deepEqual(result.derived.requiredOps, ['MITER_LIMITED', 'SPOT_ON_LOCATION']);
  assert.equal(result.parts.length, 2);
  assert.deepEqual(result.parts.map((part) => part.lengthIn), [16, 16]);
  assert.deepEqual(result.parts.map((part) => part.features[0].xIn), [8, 8]);
  assert.equal(result.spotDemand.totalCount, 2);
  assert.equal(result.storeDemand.materialSource, 'STORE_ZERO');
});

test('Job 1 18 in same-span variant moves the spot and derives the lower angle', () => {
  const result = evaluateUser1XBraceConfiguration({
    kind: USER1_XBRACE_CONFIGURATION_KIND,
    basis: 'customer-configure',
    partLengthIn: 18,
  });
  assert.equal(result.valid, true);
  assert.equal(result.configurationVersion, '0.2');
  assert.equal(result.derived.angleDeg, 26.387799961243);
  assert.equal(result.derived.fixedHorizontalSpanIn.value, 8);
  assert.deepEqual(result.parts.map((part) => part.features[0].xIn), [9, 9]);
  assert.equal(result.storeDemand.definedWorkpieceLengthCanonical, '60');
});

test('Job 1 configuration is bounded to 16–18 in on one-eighth increments', () => {
  for (const partLengthIn of [15.875, 18.125, 16.1]) {
    const result = evaluateUser1XBraceConfiguration({
      kind: USER1_XBRACE_CONFIGURATION_KIND,
      partLengthIn,
    });
    assert.equal(result.valid, false);
  }
  assert.equal(
    evaluateUser1XBraceConfiguration({ kind: 'something-else', partLengthIn: 16 }).valid,
    false,
  );
});
