import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ALCOVE_REFERENCE_EXAMPLE,
  ALCOVE_USER1_BASELINE,
  evaluateAlcoveConfiguration,
  normalizeAlcoveConfiguration,
} from '../../shared/alcove-rule.mjs';

test('User 1 Alcove baseline stays normalized to the public review measurements', () => {
  assert.equal(ALCOVE_USER1_BASELINE.actorId, 'user-1');
  assert.equal(ALCOVE_USER1_BASELINE.openingWidthIn, 45.5);
  assert.equal(ALCOVE_USER1_BASELINE.mantelHeightIn, 45);
  assert.equal(ALCOVE_USER1_BASELINE.topShelfPreferenceIn, 65);
  assert.equal(ALCOVE_USER1_BASELINE.floorSlopeDeg, 1.2);
  assert.deepEqual(ALCOVE_USER1_BASELINE.shelfHeightsIn, [12, 24, 36, 45, 65]);
  assert.equal(ALCOVE_USER1_BASELINE.shelfDepthIn, 14);
  assert.equal(ALCOVE_USER1_BASELINE.shelfCount, 5);
  assert.equal(ALCOVE_USER1_BASELINE.materialPreference, 'Pine');
  assert.equal(ALCOVE_USER1_BASELINE.orderedUnitAdjustmentIn, null);
  assert.equal(ALCOVE_USER1_BASELINE.orderedUnitAdjustmentStatus, 'NOT_YET_DECIDED');
});

test('User 1 Alcove candidate derives the nominal interior span without inventing an ordering allowance', () => {
  const configuration = normalizeAlcoveConfiguration(ALCOVE_REFERENCE_EXAMPLE, {
    basis: 'user1-sarah-baseline',
  });
  const result = evaluateAlcoveConfiguration(configuration);
  assert.equal(result.valid, true);
  assert.equal(result.inputs.openingWidth.canonical, '45.5');
  assert.equal(result.inputs.leftSupport.canonical, '0.75');
  assert.equal(result.inputs.rightSupport.canonical, '0.75');
  assert.equal(result.derived.span.canonical, '44');
  assert.equal(result.inputs.blankDepth.canonical, '14');
  assert.equal(result.inputs.blankThickness.canonical, '0.75');
  assert.equal(result.inputs.shelfCount.value, 5);
  assert.deepEqual(result.unresolvedConditions, [
    'ORDERED_UNIT_ADJUSTMENT_NOT_DECIDED',
    'STRUCTURAL_SPAN_NOT_EVALUATED',
    'INSTALLATION_NOT_DEFINED',
    'STORE_RESOLUTION_NOT_EVALUATED',
  ]);
});

test('missing input stops alcove geometry instead of inventing a value', () => {
  const configuration = normalizeAlcoveConfiguration({
    openingWidth: '45.5',
    leftSupport: '0.75',
    rightSupport: '',
    blankDepth: '14',
    blankThickness: '0.75',
    shelfCount: '5',
  });
  const result = evaluateAlcoveConfiguration(configuration);
  assert.equal(result.valid, false);
  assert.equal(result.derived.span, null);
  assert.ok(result.unresolvedInputs.includes('missing-rightSupport'));
});

test('nonpositive derived span is refused', () => {
  const configuration = normalizeAlcoveConfiguration({
    openingWidth: '1',
    leftSupport: '0.75',
    rightSupport: '0.75',
    blankDepth: '14',
    blankThickness: '0.75',
    shelfCount: '5',
  });
  const result = evaluateAlcoveConfiguration(configuration);
  assert.equal(result.valid, false);
  assert.equal(result.derived.span, null);
  assert.ok(result.unresolvedInputs.includes('nonpositive-derived-span'));
});
