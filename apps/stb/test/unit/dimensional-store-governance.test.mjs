import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const adapter = readFileSync(new URL('../../server/store-adapter.mjs', import.meta.url), 'utf8');
const coordinator = readFileSync(new URL('../../browser/integration/store-coordinator.mjs', import.meta.url), 'utf8');
const storeClient = readFileSync(new URL('../../browser/integration/store-client.mjs', import.meta.url), 'utf8');
const storeCoordinator = readFileSync(new URL('../../browser/integration/store-coordinator.mjs', import.meta.url), 'utf8');
const storeView = readFileSync(new URL('../../browser/data/store-view.mjs', import.meta.url), 'utf8');
const storeWire = readFileSync(new URL('../../shared/store-wire.mjs', import.meta.url), 'utf8');
const review = readFileSync(new URL('../../browser/domain/review.mjs', import.meta.url), 'utf8');

test('System asks Store for a fresh dimensional evaluation instead of implementing a second pricing engine', () => {
  assert.match(adapter, /runDimensionalStoreRequest/);
  assert.match(adapter, /requestDimensionalStoreEvaluation/);
  assert.match(adapter, /evaluateDimensionalStoreRequest/);
  assert.match(adapter, /evaluationReceipt/);
  assert.match(adapter, /mappedCallInputs:\s*\{[\s\S]*travel:/);
  const formalStart = adapter.indexOf('async function handleUserDefinedBoardJob');
  const formalEnd = adapter.indexOf('async function dispatch', formalStart);
  assert.ok(formalStart >= 0 && formalEnd > formalStart);
  const formalHandler = adapter.slice(formalStart, formalEnd);
  assert.match(formalHandler, /runDimensionalStoreRequest/);
  assert.doesNotMatch(
    formalHandler,
    /evaluateDimensionalTravelJob/,
    'formal USER_DEFINED_BOARD_V1 handler bypasses the fresh Store request API',
  );
  assert.match(formalHandler, /freshReceipt\?\.requestId === envelope\.requestId/);
  assert.match(adapter, /STORE_FRESH_EVALUATION_RULE_ID/);
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

test('Alcove browser plumbing carries demand to Store without a browser-side Store clone', () => {
  assert.match(storeCoordinator, /scheduleAlcoveInsertStoreQuestion/);
  assert.match(storeCoordinator, /STORE_REQUEST_TYPES\.ALCOVE_INSERT_V1/);
  assert.match(storeCoordinator, /alcoveInsertJobPayload/);
  assert.match(storeView, /options\.scope \?\? STORE_SCOPES\.BOARD_SQUARE_V1/);
  assert.match(storeClient, /buildAlcoveInsertRequest/);
  for (const forbidden of [
    'STORE_FIXTURE',
    'RECOVERY[across]',
    'CYCLE[across]',
    '15.74',
    '20.99',
    '32.18',
    '55.98',
    '374.42',
  ]) {
    assert.equal(storeCoordinator.includes(forbidden), false, 'Alcove Store clone leaked into coordinator: ' + forbidden);
    assert.equal(storeView.includes(forbidden), false, 'Alcove Store clone leaked into Store view: ' + forbidden);
  }
});

test('Confirmation invokes Store again and compares returned calculation identities', () => {
  assert.match(review, /retryStoreAttempt/);
  assert.match(review, /compareStoreCalculationIdentities/);
  assert.match(review, /store-calculation-divergence/);
  assert.match(review, /storeReconciliation/);
});


test('Job 1 client cannot reuse an old request or accept a receiptless Store answer', () => {
  assert.match(storeClient, /const alwaysFresh =/);
  assert.match(storeClient, /requestType === STORE_REQUEST_TYPES\.USER_DEFINED_BOARD_V1/);
  assert.match(storeClient, /requestType === STORE_REQUEST_TYPES\.ALCOVE_INSERT_V1/);
  assert.match(
    storeClient,
    /if \(!input\.refresh && !alwaysFresh\)/,
    'a formal Job 1 or Alcove Store issue can still dedupe to old request history',
  );
  assert.match(storeClient, /evaluationReceipt:/);
  assert.match(storeWire, /store-evaluation-not-fresh/);
  assert.match(storeWire, /missing-evaluation-receipt/);
  assert.match(storeWire, /evaluationReceipt\.requestId/);
  assert.match(storeWire, /evaluationReceipt\.storeRevision/);
  assert.match(storeWire, /missing-evaluation-receipt-hash/);
});
