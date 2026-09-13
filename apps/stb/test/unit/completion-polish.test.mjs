import assert from 'node:assert/strict';
import test from 'node:test';

import {
  COMPLETION_PLAN_STATUS,
  buildCloseoutRecord,
  buildCompletionPlanRecord,
  evaluateCompletionPlan,
} from '../../shared/completion-contract.mjs';
import { derivePublishedJobCompletionPreview } from '../../shared/completion-from-result.mjs';
import {
  MACHINE_FAMILIES,
  SECONDARY_OPERATION_CLASSES,
  buildResidualOperation,
} from '../../shared/secondary-operation-library.mjs';

test('Store refusal dominates incomplete secondary-choice state', () => {
  const result = evaluateCompletionPlan({
    storeDisposition: 'REFUSED',
    lines: [{
      lineId: 'TAB-001',
      primaryContribution: { status: 'PARTIAL' },
      residualOperation: { allowedSecondaryOptions: ['CUSTOMER_COMPLETES'] },
    }],
  });
  assert.equal(result.status, COMPLETION_PLAN_STATUS.BLOCKED);
  assert.equal(result.handoffReady, false);
  assert.ok(result.reasons.includes('STORE_DISPOSITION_NOT_SUPPORTABLE'));
});

test('published answer cannot move mandatory labeling later in the workflow', () => {
  const preview = derivePublishedJobCompletionPreview({
    status: 'SUPPORTABLE',
    machineFamily: MACHINE_FAMILIES.D001,
    operationalRequirements: {
      labeling: {
        required: true,
        timing: 'AFTER_CUSTOMER_HANDOFF',
      },
    },
  });
  assert.equal(preview.labeling.required, true);
  assert.equal(preview.labeling.timing, 'WHEN_PART_OR_PACKAGE_LEAVES_PRIMARY_CELL_STREAM');
  assert.equal(preview.labeling.selective, false);
});

test('secondary-operation overrides cannot rewrite library identity or policy', () => {
  const residual = buildResidualOperation(
    SECONDARY_OPERATION_CLASSES.FINAL_DRILL_TO_DIAMETER,
    {
      machineFamily: MACHINE_FAMILIES.D001,
      targetDiameterIn: 0.375,
      operationClass: SECONDARY_OPERATION_CLASSES.REMOVE_RETAINED_TABS,
      libraryVersion: 'FAKE',
      label: 'FAKE',
      basis: 'FAKE',
      originatingMachineFamilies: [MACHINE_FAMILIES.S001],
      allowedSecondaryOptions: ['FAKE'],
      selectionRequired: false,
      autoSelected: true,
      createsStoreCapability: true,
      createsYardService: true,
      physicalExecutionAuthority: true,
    },
  );
  assert.equal(residual.operationClass, SECONDARY_OPERATION_CLASSES.FINAL_DRILL_TO_DIAMETER);
  assert.equal(residual.libraryVersion, 'STB-SECONDARY-OPS-0.2');
  assert.equal(residual.machineFamily, MACHINE_FAMILIES.D001);
  assert.equal(residual.targetDiameterIn, 0.375);
  assert.deepEqual(residual.originatingMachineFamilies, [MACHINE_FAMILIES.D001]);
  assert.deepEqual(residual.allowedSecondaryOptions, [
    'YARD_SECONDARY',
    'CUSTOMER_COMPLETES',
    'THIRD_PARTY_COMPLETES',
  ]);
  assert.equal(residual.selectionRequired, true);
  assert.equal(residual.autoSelected, false);
  assert.equal(residual.createsStoreCapability, false);
  assert.equal(residual.createsYardService, false);
  assert.equal(residual.physicalExecutionAuthority, false);
});

test('closeout list fields are immutable after construction', () => {
  const plan = buildCompletionPlanRecord({
    projectId: 'P-1',
    candidateRevisionId: 'R-1',
    completionPlanId: 'CP-1',
    storeDisposition: 'SUPPORTABLE',
    lines: [{ lineId: 'CUT-001', primaryContribution: { status: 'COMPLETE' } }],
    inspectionStatus: 'RECORDED',
    labelingStatus: 'APPLIED',
    stagingStatus: 'STAGED',
    fulfillmentStatus: 'PICKUP_READY',
    closeoutRecordStatus: 'PREPARED',
    custodyStatus: 'TRANSFERRED',
    createdAt: '2026-09-13T22:00:00Z',
  });
  const closeout = buildCloseoutRecord({
    closeoutId: 'CO-1',
    projectId: 'P-1',
    candidateRevisionId: 'R-1',
    completionPlanId: 'CP-1',
    plan,
    labelIds: ['LBL-1'],
    packageIds: ['PKG-1'],
    receiptProfiles: ['INDIVIDUAL'],
    exceptions: ['NONE'],
    custody: {
      method: 'PICKUP',
      transferredAt: '2026-09-13T22:01:00Z',
    },
    recordRef: 'stb://P-1/R-1',
    createdAt: '2026-09-13T22:01:00Z',
  });
  for (const value of [closeout.labelIds, closeout.packageIds, closeout.receiptProfiles, closeout.exceptions]) {
    assert.equal(Object.isFrozen(value), true);
    assert.throws(() => value.push('MUTATION'));
  }
});
