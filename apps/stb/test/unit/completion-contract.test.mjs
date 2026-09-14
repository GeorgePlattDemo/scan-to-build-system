import assert from 'node:assert/strict';
import test from 'node:test';

import {
  COMPLETION_ACTIONS,
  COMPLETION_LINE_STATUS,
  COMPLETION_PLAN_STATUS,
  COMPLETION_RECORD_TYPES,
  COMPLETION_ROLES,
  LABELING_REQUIREMENT,
  RECEIPT_PROFILES,
  SECONDARY_OPTIONS,
  buildCloseoutRecord,
  buildCompletionDecision,
  buildCompletionPlanRecord,
  buildPartLabel,
  evaluateCompletionLine,
  evaluateCompletionPlan,
  pilotToFinalHoleExample,
  receiptSections,
  roleCan,
  validateHoleRequirement,
} from '../../shared/completion-contract.mjs';

test('operator authority is stop/report only', () => {
  assert.equal(roleCan(COMPLETION_ROLES.OPERATOR, COMPLETION_ACTIONS.STOP_WORK), true);
  assert.equal(roleCan(COMPLETION_ROLES.OPERATOR, COMPLETION_ACTIONS.REPORT_CONDITION), true);
  for (const action of [
    COMPLETION_ACTIONS.CHOOSE_SECONDARY_OPTION,
    COMPLETION_ACTIONS.ACCEPT_COMPLETION_PLAN,
    COMPLETION_ACTIONS.MARK_SECONDARY_COMPLETE,
    COMPLETION_ACTIONS.RECORD_INSPECTION,
    COMPLETION_ACTIONS.MARK_LABEL_APPLIED,
    COMPLETION_ACTIONS.MARK_STAGED,
    COMPLETION_ACTIONS.MARK_PICKUP_READY,
    COMPLETION_ACTIONS.MARK_DELIVERY_ARRANGED,
    COMPLETION_ACTIONS.PREPARE_CLOSEOUT_RECORD,
    COMPLETION_ACTIONS.RECORD_CUSTODY_TRANSFER,
    COMPLETION_ACTIONS.CLOSE_PROJECT,
  ]) {
    assert.equal(roleCan(COMPLETION_ROLES.OPERATOR, action), false, action);
  }
});

test('cell steward owns explicit post-production state transitions', () => {
  for (const action of [
    COMPLETION_ACTIONS.RECORD_INSPECTION,
    COMPLETION_ACTIONS.MARK_LABEL_APPLIED,
    COMPLETION_ACTIONS.MARK_STAGED,
    COMPLETION_ACTIONS.MARK_PICKUP_READY,
    COMPLETION_ACTIONS.MARK_DELIVERY_ARRANGED,
    COMPLETION_ACTIONS.PREPARE_CLOSEOUT_RECORD,
    COMPLETION_ACTIONS.RECORD_CUSTODY_TRANSFER,
    COMPLETION_ACTIONS.CLOSE_PROJECT,
  ]) {
    assert.equal(roleCan(COMPLETION_ROLES.CELL_STEWARD, action), true, action);
  }
});

test('labeling is a nonselective operational requirement', () => {
  assert.equal(LABELING_REQUIREMENT.required, true);
  assert.equal(LABELING_REQUIREMENT.selective, false);
  assert.equal(LABELING_REQUIREMENT.authorityEffect, false);
});

test('customer chooses but cannot accept the yard plan', () => {
  assert.equal(
    roleCan(COMPLETION_ROLES.CUSTOMER, COMPLETION_ACTIONS.CHOOSE_SECONDARY_OPTION),
    true,
  );
  assert.equal(
    roleCan(COMPLETION_ROLES.CUSTOMER, COMPLETION_ACTIONS.ACCEPT_COMPLETION_PLAN),
    false,
  );
  assert.equal(
    roleCan(COMPLETION_ROLES.CELL_STEWARD, COMPLETION_ACTIONS.ACCEPT_COMPLETION_PLAN),
    true,
  );
});

test('3/8 finished hole with 3/16 pilot remains an explicit residual operation', () => {
  const line = pilotToFinalHoleExample();
  assert.equal(line.requirement.finalDiameterIn, 0.375);
  assert.equal(line.primaryContribution.diameterIn, 0.1875);
  assert.equal(line.primaryContribution.status, 'PARTIAL');
  assert.equal(line.residualOperation.operationClass, 'FINAL_DRILL_TO_DIAMETER');
  assert.equal(validateHoleRequirement(line).ok, true);

  const unresolved = evaluateCompletionLine(line);
  assert.equal(unresolved.status, COMPLETION_LINE_STATUS.UNRESOLVED);
  assert.ok(unresolved.reasons.includes('SECONDARY_OPTION_NOT_SELECTED'));

  const plan = evaluateCompletionPlan({ storeDisposition: 'SUPPORTABLE', lines: [line] });
  assert.equal(plan.status, COMPLETION_PLAN_STATUS.NEEDS_CUSTOMER_DECISION);
});

test('completion line can read allowed options from its residual-operation record', () => {
  const line = {
    lineId: 'TAB-001',
    primaryContribution: { status: 'PARTIAL' },
    residualOperation: {
      allowedSecondaryOptions: [SECONDARY_OPTIONS.CUSTOMER_COMPLETES],
    },
    selectedOption: SECONDARY_OPTIONS.CUSTOMER_COMPLETES,
    customerDecision: 'ACCEPTED',
    stewardDecision: 'ACCEPTED',
  };
  assert.equal(evaluateCompletionLine(line).status, COMPLETION_LINE_STATUS.ASSIGNED_TO_CUSTOMER);
});

test('customer acceptance alone does not bind the yard', () => {
  const line = {
    ...pilotToFinalHoleExample(),
    selectedOption: SECONDARY_OPTIONS.CUSTOMER_COMPLETES,
    customerDecision: 'ACCEPTED',
  };
  const evaluated = evaluateCompletionLine(line);
  assert.equal(evaluated.status, COMPLETION_LINE_STATUS.UNRESOLVED);
  assert.ok(evaluated.reasons.includes('STEWARD_DECISION_REQUIRED'));
  assert.equal(
    evaluateCompletionPlan({ storeDisposition: 'SUPPORTABLE', lines: [line] }).status,
    COMPLETION_PLAN_STATUS.NEEDS_STEWARD_DECISION,
  );
});

test('yard secondary work requires a declared service reference and completion record', () => {
  const base = {
    ...pilotToFinalHoleExample(),
    selectedOption: SECONDARY_OPTIONS.YARD_SECONDARY,
    customerDecision: 'ACCEPTED',
    stewardDecision: 'ACCEPTED',
  };
  const missingService = evaluateCompletionLine(base);
  assert.ok(missingService.reasons.includes('YARD_SECONDARY_SERVICE_REFERENCE_REQUIRED'));

  const pending = evaluateCompletionLine({ ...base, secondaryServiceRef: 'YARD-DRILL-038-01' });
  assert.ok(pending.reasons.includes('YARD_SECONDARY_WORK_PENDING'));

  const complete = evaluateCompletionLine({
    ...base,
    secondaryServiceRef: 'YARD-DRILL-038-01',
    secondaryExecutionStatus: 'COMPLETE',
  });
  assert.equal(complete.status, COMPLETION_LINE_STATUS.YARD_COMPLETE);
  assert.deepEqual(complete.reasons, []);
});

test('customer-completes path can be handed off only after customer and steward agree', () => {
  const line = {
    ...pilotToFinalHoleExample(),
    selectedOption: SECONDARY_OPTIONS.CUSTOMER_COMPLETES,
    customerDecision: 'ACCEPTED',
    stewardDecision: 'ACCEPTED',
  };
  const result = evaluateCompletionPlan({
    storeDisposition: 'SUPPORTABLE',
    lines: [line],
    inspectionStatus: 'RECORDED',
    labelingStatus: 'APPLIED',
    stagingStatus: 'STAGED',
    fulfillmentStatus: 'PICKUP_READY',
    closeoutRecordStatus: 'PREPARED',
    custodyStatus: 'NOT_TRANSFERRED',
  });
  assert.equal(result.status, COMPLETION_PLAN_STATUS.READY_FOR_HANDOFF);
  assert.equal(result.handoffReady, true);
  assert.equal(result.closeoutReady, false);
  assert.equal(result.lines[0].status, COMPLETION_LINE_STATUS.ASSIGNED_TO_CUSTOMER);
  assert.equal(result.operatorMayPromote, false);
});

test('inspection, labeling, staging, fulfillment and closeout preparation are distinct hard gates', () => {
  const base = {
    storeDisposition: 'SUPPORTABLE',
    lines: [{ lineId: 'CUT-001', primaryContribution: { status: 'COMPLETE' } }],
    inspectionStatus: 'RECORDED',
    labelingStatus: 'APPLIED',
    stagingStatus: 'STAGED',
    fulfillmentStatus: 'PICKUP_READY',
    closeoutRecordStatus: 'PREPARED',
    custodyStatus: 'NOT_TRANSFERRED',
  };
  const cases = [
    ['inspectionStatus', 'NOT_RECORDED', 'INSPECTION_NOT_RECORDED'],
    ['labelingStatus', 'NOT_STARTED', 'LABELING_NOT_COMPLETE'],
    ['stagingStatus', 'NOT_STARTED', 'STAGING_NOT_COMPLETE'],
    ['fulfillmentStatus', 'NOT_READY', 'FULFILLMENT_NOT_READY'],
    ['closeoutRecordStatus', 'NOT_PREPARED', 'CLOSEOUT_RECORD_NOT_PREPARED'],
  ];
  for (const [field, value, reason] of cases) {
    const result = evaluateCompletionPlan({ ...base, [field]: value });
    assert.equal(result.handoffReady, false, field);
    assert.ok(result.reasons.includes(reason), reason);
  }
});

test('Store refusal cannot be converted into a completion plan', () => {
  const result = evaluateCompletionPlan({
    storeDisposition: 'REFUSED',
    lines: [{ primaryContribution: { status: 'COMPLETE' } }],
    inspectionStatus: 'RECORDED',
    labelingStatus: 'APPLIED',
    stagingStatus: 'STAGED',
    fulfillmentStatus: 'PICKUP_READY',
    closeoutRecordStatus: 'PREPARED',
    custodyStatus: 'TRANSFERRED',
  });
  assert.equal(result.status, COMPLETION_PLAN_STATUS.BLOCKED);
  assert.equal(result.handoffReady, false);
  assert.ok(result.reasons.includes('STORE_DISPOSITION_NOT_SUPPORTABLE'));
});

test('custody transfer closes an otherwise handoff-ready plan', () => {
  const result = evaluateCompletionPlan({
    storeDisposition: 'SUPPORTABLE',
    lines: [{ lineId: 'CUT-001', primaryContribution: { status: 'COMPLETE' } }],
    inspectionStatus: 'RECORDED',
    labelingStatus: 'APPLIED',
    stagingStatus: 'STAGED',
    fulfillmentStatus: 'DELIVERY_ARRANGED',
    closeoutRecordStatus: 'PREPARED',
    custodyStatus: 'TRANSFERRED',
  });
  assert.equal(result.status, COMPLETION_PLAN_STATUS.CLOSED);
  assert.equal(result.closeoutReady, true);
});

test('completion decisions enforce role authority at record construction time', () => {
  const common = {
    decisionId: 'D-1',
    projectId: 'P-1',
    candidateRevisionId: 'R-1',
    completionPlanId: 'CP-1',
    createdAt: '2026-09-13T20:00:00Z',
  };
  const customer = buildCompletionDecision({
    ...common,
    role: COMPLETION_ROLES.CUSTOMER,
    action: COMPLETION_ACTIONS.CHOOSE_SECONDARY_OPTION,
    lineId: 'HOLE-001',
    selectedOption: SECONDARY_OPTIONS.CUSTOMER_COMPLETES,
  });
  assert.equal(customer.recordType, COMPLETION_RECORD_TYPES.DECISION);
  assert.equal(customer.changesStoreDisposition, false);
  assert.equal(customer.physicalExecutionAuthority, false);

  assert.throws(
    () => buildCompletionDecision({
      ...common,
      decisionId: 'D-2',
      role: COMPLETION_ROLES.OPERATOR,
      action: COMPLETION_ACTIONS.ACCEPT_COMPLETION_PLAN,
    }),
    /not permitted/,
  );
});

test('completion plan record carries project/Store identity and mandatory labeling without authority', () => {
  const plan = buildCompletionPlanRecord({
    completionPlanId: 'CP-1',
    projectId: 'P-1',
    candidateRevisionId: 'R-1',
    reviewId: 'REV-1',
    storeRequestId: 'SQ-1',
    storeResponseId: 'SA-1',
    storeDisposition: 'SUPPORTABLE',
    lines: [pilotToFinalHoleExample()],
    createdAt: '2026-09-13T20:00:00Z',
  });
  assert.equal(plan.recordType, COMPLETION_RECORD_TYPES.PLAN);
  assert.equal(plan.completionPlanVersion, 'STB-COMPLETION-PLAN-0.2');
  assert.equal(plan.storeDisposition, 'SUPPORTABLE');
  assert.equal(plan.inspectionStatus, 'NOT_RECORDED');
  assert.equal(plan.labelingRequired, true);
  assert.equal(plan.physicalExecutionAuthority, false);
  assert.equal(plan.operatorMayPromote, false);
});

test('closeout record cannot exist before custody transfer', () => {
  const plan = {
    storeDisposition: 'SUPPORTABLE',
    lines: [{ lineId: 'CUT-001', primaryContribution: { status: 'COMPLETE' } }],
    inspectionStatus: 'RECORDED',
    labelingStatus: 'APPLIED',
    stagingStatus: 'STAGED',
    fulfillmentStatus: 'PICKUP_READY',
    closeoutRecordStatus: 'PREPARED',
    custodyStatus: 'NOT_TRANSFERRED',
  };
  assert.throws(
    () => buildCloseoutRecord({
      closeoutId: 'CO-1',
      projectId: 'P-1',
      candidateRevisionId: 'R-1',
      completionPlanId: 'CP-1',
      plan,
      custody: { method: 'PICKUP', transferredAt: '2026-09-13T21:00:00Z' },
      recordRef: 'stb://P-1/R-1',
      createdAt: '2026-09-13T21:00:00Z',
    }),
    /transferred custody/,
  );
});

test('physical part label carries identity but excludes customer PII and price', () => {
  const label = buildPartLabel({
    projectId: 'P-100',
    partId: 'SHELF-003',
    revision: '07',
    material: '3/4 in plywood',
    definition: '44.750 x 11.000 x 0.750 in',
    primaryStatus: 'CUT COMPLETE',
    secondaryStatus: 'FINAL DRILL - CUSTOMER',
    handoffStatus: 'READY FOR PICKUP',
    recordRef: 'stb://P-100/07/SHELF-003',
    customerName: 'Do not print',
    customerAddress: 'Do not print',
    price: 99,
  });
  assert.equal(label.projectId, 'P-100');
  assert.equal(label.customerName, null);
  assert.equal(label.customerAddress, null);
  assert.equal(label.price, null);
});

test('individual and contractor receipts are presentations over the same record', () => {
  const individual = receiptSections(RECEIPT_PROFILES.INDIVIDUAL);
  const contractor = receiptSections(RECEIPT_PROFILES.CONTRACTOR);
  assert.ok(individual.includes('WHAT_REMAINS_OR_IS_ASSIGNED'));
  assert.ok(contractor.includes('SECONDARY_OPERATIONS'));
  assert.ok(contractor.includes('INSPECTION_DISPOSITIONS'));
  assert.ok(contractor.includes('CUSTODY_TRANSFER'));
  assert.ok(individual.includes('RECORD_REFERENCE'));
  assert.ok(contractor.includes('RECORD_REFERENCE'));
});

test('closeout identity must match the plan whose custody was evaluated', () => {
  const plan = buildCompletionPlanRecord({
    projectId: 'P-1', candidateRevisionId: 'R-1', completionPlanId: 'CP-1',
    storeDisposition: 'SUPPORTABLE',
    lines: [{ lineId: 'CUT-001', primaryContribution: { status: 'COMPLETE' } }],
    inspectionStatus: 'RECORDED', labelingStatus: 'APPLIED',
    stagingStatus: 'STAGED', fulfillmentStatus: 'PICKUP_READY',
    closeoutRecordStatus: 'PREPARED', custodyStatus: 'TRANSFERRED',
    createdAt: '2026-09-13T21:00:00Z',
  });
  const input = {
    closeoutId: 'CO-1', projectId: 'P-1', candidateRevisionId: 'R-1',
    completionPlanId: 'CP-1', plan,
    custody: { method: 'PICKUP', transferredAt: '2026-09-13T21:00:00Z' },
    recordRef: 'stb://P-1/R-1', createdAt: '2026-09-13T21:00:00Z',
  };
  assert.equal(buildCloseoutRecord(input).completionPlanId, plan.completionPlanId);
  for (const key of ['projectId', 'candidateRevisionId', 'completionPlanId']) {
    assert.throws(() => buildCloseoutRecord({ ...input, [key]: 'UNRELATED' }), /must match/);
    assert.throws(() => buildCloseoutRecord({ ...input, plan: { ...plan, [key]: undefined } }), /required/);
  }
});
