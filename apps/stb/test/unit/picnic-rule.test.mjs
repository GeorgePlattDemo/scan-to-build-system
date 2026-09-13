import test from 'node:test';
import assert from 'node:assert/strict';

import {
  PICNIC_CANDIDATE_REVISION,
  evaluatePicnicConfiguration,
  normalizePicnicConfiguration,
} from '../../shared/picnic-rule.mjs';

test('picnic candidate accepts a broader geometry input without converting it into structural authority', () => {
  const configuration = normalizePicnicConfiguration({
    productLength: '144',
    requestedScope: 'frame-kit',
    materialPreference: 'cedar',
  }, { basis: 'picnic-donor-candidate-0.2' });

  const result = evaluatePicnicConfiguration(configuration);

  assert.equal(result.valid, true);
  assert.equal(configuration.candidateRevision, PICNIC_CANDIDATE_REVISION);
  assert.equal(result.input.productLength.canonical, '144');
  assert.equal(result.input.requestedScope.id, 'frame-kit');
  assert.equal(result.input.materialPreference.raw, 'cedar');
  assert.equal(result.derived.clearSpanBetweenEndFrames.canonical, '128');
  assert.ok(result.unresolvedConditions.includes('STRUCTURAL_SPAN_NOT_EVALUATED'));
  assert.ok(result.unresolvedConditions.includes('MATERIAL_IDENTITY_UNRESOLVED'));
  assert.ok(result.unresolvedConditions.includes('STORE_RESOLUTION_NOT_EVALUATED'));
});

test('picnic candidate range is an explicit app bound and does not clamp demand', () => {
  for (const value of ['59', '217']) {
    const result = evaluatePicnicConfiguration(normalizePicnicConfiguration({
      productLength: value,
      requestedScope: 'complete-part-set',
    }));
    assert.equal(result.valid, false);
    assert.equal(result.unresolvedReason, 'outside-candidate-productLength-range');
    assert.equal(result.input.productLength.canonical, value);
  }
});

test('missing or unknown requested scope stays unresolved instead of being defaulted', () => {
  const missing = evaluatePicnicConfiguration(normalizePicnicConfiguration({
    productLength: '96',
  }));
  assert.equal(missing.valid, true);
  assert.equal(missing.input.requestedScope, null);
  assert.ok(missing.unresolvedConditions.includes('REQUESTED_SCOPE_UNRESOLVED'));

  const unknown = evaluatePicnicConfiguration(normalizePicnicConfiguration({
    productLength: '96',
    requestedScope: 'whatever-is-cheapest',
  }));
  assert.equal(unknown.valid, true);
  assert.equal(unknown.input.requestedScope, null);
  assert.ok(unknown.unresolvedConditions.includes('REQUESTED_SCOPE_UNRESOLVED'));
});
