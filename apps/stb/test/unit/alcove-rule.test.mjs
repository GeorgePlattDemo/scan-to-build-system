import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ALCOVE_REFERENCE_EXAMPLE,
  evaluateAlcoveConfiguration,
  normalizeAlcoveConfiguration,
} from '../../shared/alcove-rule.mjs';

test('published alcove example derives 44.75 in span without hidden allowance', () => {
  const configuration = normalizeAlcoveConfiguration(ALCOVE_REFERENCE_EXAMPLE, {
    basis: 'published-reference-example',
  });
  const result = evaluateAlcoveConfiguration(configuration);
  assert.equal(result.valid, true);
  assert.equal(result.inputs.openingWidth.canonical, '46.25');
  assert.equal(result.inputs.leftSupport.canonical, '0.75');
  assert.equal(result.inputs.rightSupport.canonical, '0.75');
  assert.equal(result.derived.span.canonical, '44.75');
  assert.equal(result.inputs.blankDepth.canonical, '11');
  assert.equal(result.inputs.blankThickness.canonical, '0.75');
  assert.equal(result.inputs.shelfCount.value, 3);
  assert.deepEqual(result.unresolvedConditions, [
    'STRUCTURAL_SPAN_NOT_EVALUATED',
    'SHELF_ELEVATIONS_UNRESOLVED',
    'INSTALLATION_NOT_DEFINED',
    'STORE_RESOLUTION_NOT_EVALUATED',
  ]);
});

test('missing input stops alcove geometry instead of inventing a value', () => {
  const configuration = normalizeAlcoveConfiguration({
    openingWidth: '46.25',
    leftSupport: '0.75',
    rightSupport: '',
    blankDepth: '11',
    blankThickness: '0.75',
    shelfCount: '3',
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
    blankDepth: '11',
    blankThickness: '0.75',
    shelfCount: '3',
  });
  const result = evaluateAlcoveConfiguration(configuration);
  assert.equal(result.valid, false);
  assert.equal(result.derived.span, null);
  assert.ok(result.unresolvedInputs.includes('nonpositive-derived-span'));
});
