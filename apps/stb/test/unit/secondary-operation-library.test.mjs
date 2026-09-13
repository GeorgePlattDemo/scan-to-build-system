import assert from 'node:assert/strict';
import test from 'node:test';

import { SECONDARY_OPTIONS } from '../../shared/completion-contract.mjs';
import {
  SECONDARY_OPERATION_CLASSES,
  SECONDARY_OPERATION_LIBRARY_VERSION,
  buildResidualOperation,
  listSecondaryOperations,
  secondaryOperation,
} from '../../shared/secondary-operation-library.mjs';

test('secondary-operation library contains only current bounded cross-machine residuals', () => {
  assert.deepEqual(
    listSecondaryOperations().map((entry) => entry.operationClass).sort(),
    [
      SECONDARY_OPERATION_CLASSES.FINAL_DRILL_TO_DIAMETER,
      SECONDARY_OPERATION_CLASSES.REMOVE_RETAINED_TABS,
    ].sort(),
  );
});

test('D-001 final-drill residual does not create machine or yard capability', () => {
  const entry = secondaryOperation(SECONDARY_OPERATION_CLASSES.FINAL_DRILL_TO_DIAMETER);
  assert.ok(entry.allowedOptions.includes(SECONDARY_OPTIONS.CUSTOMER_COMPLETES));
  assert.equal(entry.createsStoreCapability, false);
  assert.equal(entry.createsYardService, false);
  assert.equal(entry.physicalExecutionAuthority, false);
});

test('S-001 retained-tab separation is explicit and downstream', () => {
  const entry = secondaryOperation(SECONDARY_OPERATION_CLASSES.REMOVE_RETAINED_TABS);
  assert.match(entry.basis, /retains the cut part/i);
  assert.equal(entry.createsStoreCapability, false);
});

test('residual builder preserves the library basis and explicit target detail', () => {
  const residual = buildResidualOperation(
    SECONDARY_OPERATION_CLASSES.FINAL_DRILL_TO_DIAMETER,
    { targetDiameterIn: 0.375 },
  );
  assert.equal(residual.libraryVersion, SECONDARY_OPERATION_LIBRARY_VERSION);
  assert.equal(residual.targetDiameterIn, 0.375);
  assert.equal(residual.physicalExecutionAuthority, false);
});

test('unknown secondary operations are not admitted', () => {
  assert.equal(secondaryOperation('COUNTERSINK_EVERYTHING'), null);
  assert.throws(() => buildResidualOperation('COUNTERSINK_EVERYTHING'), /unknown secondary operation/);
});
