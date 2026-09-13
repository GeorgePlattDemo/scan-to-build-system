import assert from 'node:assert/strict';
import test from 'node:test';

import { SECONDARY_OPTIONS } from '../../shared/completion-contract.mjs';
import {
  MACHINE_FAMILIES,
  SECONDARY_OPERATION_CLASSES,
  SECONDARY_OPERATION_LIBRARY_VERSION,
  buildResidualOperation,
  listSecondaryOperations,
  operationAllowedForMachine,
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

test('D-001 final-drill residual is selective and does not create machine or yard capability', () => {
  const entry = secondaryOperation(SECONDARY_OPERATION_CLASSES.FINAL_DRILL_TO_DIAMETER);
  assert.ok(entry.allowedOptions.includes(SECONDARY_OPTIONS.CUSTOMER_COMPLETES));
  assert.deepEqual(entry.originatingMachineFamilies, [MACHINE_FAMILIES.D001]);
  assert.equal(entry.selectionRequired, true);
  assert.equal(entry.autoSelected, false);
  assert.equal(entry.createsStoreCapability, false);
  assert.equal(entry.createsYardService, false);
  assert.equal(entry.physicalExecutionAuthority, false);
});

test('S-001 retained-tab separation is selective and downstream', () => {
  const entry = secondaryOperation(SECONDARY_OPERATION_CLASSES.REMOVE_RETAINED_TABS);
  assert.match(entry.basis, /retains the cut part/i);
  assert.deepEqual(entry.originatingMachineFamilies, [MACHINE_FAMILIES.S001]);
  assert.equal(entry.selectionRequired, true);
  assert.equal(entry.autoSelected, false);
  assert.equal(entry.createsStoreCapability, false);
});

test('machine-family firewall prevents sheet drilling from entering S-001 completion', () => {
  assert.equal(
    operationAllowedForMachine(SECONDARY_OPERATION_CLASSES.FINAL_DRILL_TO_DIAMETER, MACHINE_FAMILIES.S001),
    false,
  );
  assert.equal(
    operationAllowedForMachine(SECONDARY_OPERATION_CLASSES.REMOVE_RETAINED_TABS, MACHINE_FAMILIES.S001),
    true,
  );
  assert.throws(
    () => buildResidualOperation(
      SECONDARY_OPERATION_CLASSES.FINAL_DRILL_TO_DIAMETER,
      { machineFamily: MACHINE_FAMILIES.S001, targetDiameterIn: 0.375 },
    ),
    /not admitted from machine family S001/,
  );
});

test('residual builder preserves the library basis, machine family and explicit target detail', () => {
  const residual = buildResidualOperation(
    SECONDARY_OPERATION_CLASSES.FINAL_DRILL_TO_DIAMETER,
    { machineFamily: MACHINE_FAMILIES.D001, targetDiameterIn: 0.375 },
  );
  assert.equal(residual.libraryVersion, SECONDARY_OPERATION_LIBRARY_VERSION);
  assert.equal(residual.machineFamily, MACHINE_FAMILIES.D001);
  assert.equal(residual.targetDiameterIn, 0.375);
  assert.equal(residual.selectionRequired, true);
  assert.equal(residual.autoSelected, false);
  assert.equal(residual.physicalExecutionAuthority, false);
});

test('unknown secondary operations are not admitted', () => {
  assert.equal(secondaryOperation('COUNTERSINK_EVERYTHING'), null);
  assert.throws(() => buildResidualOperation('COUNTERSINK_EVERYTHING'), /unknown secondary operation/);
});
