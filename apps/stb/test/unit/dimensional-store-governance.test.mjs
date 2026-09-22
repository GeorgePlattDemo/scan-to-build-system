import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const adapter = readFileSync(new URL('../../server/store-adapter.mjs', import.meta.url), 'utf8');
const coordinator = readFileSync(new URL('../../browser/integration/store-coordinator.mjs', import.meta.url), 'utf8');
const review = readFileSync(new URL('../../browser/domain/review.mjs', import.meta.url), 'utf8');

test('System asks Store for dimensional economics instead of implementing a second pricing engine', () => {
  assert.match(adapter, /evaluateDimensionalTravelJob/);
  assert.match(adapter, /mappedCallInputs:\s*\{[\s\S]*travel:/);
  for (const forbidden of [
    'machineHourRate',
    'setupCharge',
    'cell_recovery',
    'Math.cos',
    'sawTraverseIn',
    'feedFpm',
  ]) {
    assert.equal(adapter.includes(forbidden), false, `Store-owned calculation leaked into System adapter: ${forbidden}`);
  }
});

test('Configurator carries identified parts and features to Store', () => {
  assert.match(coordinator, /parts = \[\]/);
  assert.match(coordinator, /datumCMethod/);
  assert.match(coordinator, /userDefinedBoardJobPayload/);
  assert.doesNotMatch(coordinator, /machineHourRate|setupCharge|cell_recovery|sawTraverseIn/);
});

test('Confirmation invokes Store again and compares returned calculation identities', () => {
  assert.match(review, /retryStoreAttempt/);
  assert.match(review, /compareStoreCalculationIdentities/);
  assert.match(review, /store-calculation-divergence/);
  assert.match(review, /storeReconciliation/);
});
