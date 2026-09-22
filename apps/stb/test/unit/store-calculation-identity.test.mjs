import assert from 'node:assert/strict';
import test from 'node:test';

import {
  STORE_CALCULATION_DIVERGENCE,
  calculationIdentityFromEnvelope,
  compareStoreCalculationIdentities,
} from '../../shared/store-calculation-identity.mjs';

test('Store calculation identity is read, not recalculated', () => {
  const identity = calculationIdentityFromEnvelope({
    calculationIdentity: { inputHash: 'input-a', resultHash: 'result-a' },
  });
  assert.deepEqual(identity, { inputHash: 'input-a', resultHash: 'result-a' });
});

test('same Store input/result identity reconciles', () => {
  const passA = { inputHash: 'input-a', resultHash: 'result-a' };
  const passB = { inputHash: 'input-a', resultHash: 'result-a' };
  assert.equal(compareStoreCalculationIdentities(passA, passB).ok, true);
});

test('changed Store input or result fails closed', () => {
  const passA = { inputHash: 'input-a', resultHash: 'result-a' };
  const changedInput = compareStoreCalculationIdentities(passA, {
    inputHash: 'input-b',
    resultHash: 'result-a',
  });
  assert.equal(changedInput.ok, false);
  assert.equal(changedInput.code, STORE_CALCULATION_DIVERGENCE);
  assert.equal(changedInput.reason, 'CALCULATION_INPUT_DIVERGENCE');

  const changedResult = compareStoreCalculationIdentities(passA, {
    inputHash: 'input-a',
    resultHash: 'result-b',
  });
  assert.equal(changedResult.ok, false);
  assert.equal(changedResult.reason, 'CALCULATION_RESULT_DIVERGENCE');

  const missing = compareStoreCalculationIdentities(passA, null);
  assert.equal(missing.ok, false);
  assert.equal(missing.reason, 'CALCULATION_IDENTITY_REQUIRED');
});
