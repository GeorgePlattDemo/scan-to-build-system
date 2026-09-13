export const COMPLETION_ROLES = Object.freeze({
  CUSTOMER: 'CUSTOMER',
  CELL_STEWARD: 'CELL_STEWARD',
  OPERATOR: 'OPERATOR',
});

export const COMPLETION_ACTIONS = Object.freeze({
  CHOOSE_SECONDARY_OPTION: 'CHOOSE_SECONDARY_OPTION',
  DECLINE_SECONDARY_OPTION: 'DECLINE_SECONDARY_OPTION',
  ACCEPT_COMPLETION_PLAN: 'ACCEPT_COMPLETION_PLAN',
  REJECT_COMPLETION_PLAN: 'REJECT_COMPLETION_PLAN',
  ACCEPT_YARD_SECONDARY: 'ACCEPT_YARD_SECONDARY',
  REJECT_YARD_SECONDARY: 'REJECT_YARD_SECONDARY',
  MARK_SECONDARY_COMPLETE: 'MARK_SECONDARY_COMPLETE',
  MARK_LABEL_APPLIED: 'MARK_LABEL_APPLIED',
  MARK_STAGED: 'MARK_STAGED',
  RECORD_CUSTODY_TRANSFER: 'RECORD_CUSTODY_TRANSFER',
  CLOSE_PROJECT: 'CLOSE_PROJECT',
  STOP_WORK: 'STOP_WORK',
  REPORT_CONDITION: 'REPORT_CONDITION',
});

export const SECONDARY_OPTIONS = Object.freeze({
  YARD_SECONDARY: 'YARD_SECONDARY',
  CUSTOMER_COMPLETES: 'CUSTOMER_COMPLETES',
  THIRD_PARTY_COMPLETES: 'THIRD_PARTY_COMPLETES',
});

export const COMPLETION_LINE_STATUS = Object.freeze({
  MACHINE_COMPLETE: 'MACHINE_COMPLETE',
  YARD_COMPLETE: 'YARD_COMPLETE',
  ASSIGNED_TO_CUSTOMER: 'ASSIGNED_TO_CUSTOMER',
  ASSIGNED_TO_THIRD_PARTY: 'ASSIGNED_TO_THIRD_PARTY',
  UNRESOLVED: 'UNRESOLVED',
  REFUSED: 'REFUSED',
});

export const COMPLETION_PLAN_STATUS = Object.freeze({
  BLOCKED: 'BLOCKED',
  NEEDS_CUSTOMER_DECISION: 'NEEDS_CUSTOMER_DECISION',
  NEEDS_STEWARD_DECISION: 'NEEDS_STEWARD_DECISION',
  SECONDARY_WORK_PENDING: 'SECONDARY_WORK_PENDING',
  READY_FOR_HANDOFF: 'READY_FOR_HANDOFF',
  CLOSED: 'CLOSED',
});

export const RECEIPT_PROFILES = Object.freeze({
  INDIVIDUAL: 'INDIVIDUAL',
  CONTRACTOR: 'CONTRACTOR',
});

const ROLE_ACTIONS = Object.freeze({
  [COMPLETION_ROLES.CUSTOMER]: new Set([
    COMPLETION_ACTIONS.CHOOSE_SECONDARY_OPTION,
    COMPLETION_ACTIONS.DECLINE_SECONDARY_OPTION,
  ]),
  [COMPLETION_ROLES.CELL_STEWARD]: new Set([
    COMPLETION_ACTIONS.ACCEPT_COMPLETION_PLAN,
    COMPLETION_ACTIONS.REJECT_COMPLETION_PLAN,
    COMPLETION_ACTIONS.ACCEPT_YARD_SECONDARY,
    COMPLETION_ACTIONS.REJECT_YARD_SECONDARY,
    COMPLETION_ACTIONS.MARK_SECONDARY_COMPLETE,
    COMPLETION_ACTIONS.MARK_LABEL_APPLIED,
    COMPLETION_ACTIONS.MARK_STAGED,
    COMPLETION_ACTIONS.RECORD_CUSTODY_TRANSFER,
    COMPLETION_ACTIONS.CLOSE_PROJECT,
    COMPLETION_ACTIONS.STOP_WORK,
    COMPLETION_ACTIONS.REPORT_CONDITION,
  ]),
  [COMPLETION_ROLES.OPERATOR]: new Set([
    COMPLETION_ACTIONS.STOP_WORK,
    COMPLETION_ACTIONS.REPORT_CONDITION,
  ]),
});

export function roleCan(role, action) {
  return ROLE_ACTIONS[role]?.has(action) === true;
}

function string(value) {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function finitePositive(value) {
  return Number.isFinite(value) && value > 0;
}

function uniqueStrings(values) {
  return [...new Set((Array.isArray(values) ? values : []).filter((value) => string(value)))];
}

export function pilotToFinalHoleExample() {
  return Object.freeze({
    lineId: 'HOLE-001',
    requirement: Object.freeze({
      operationClass: 'DRILL_HOLE',
      finalDiameterIn: 0.375,
    }),
    primaryContribution: Object.freeze({
      status: 'PARTIAL',
      operationClass: 'PILOT_DRILL',
      diameterIn: 0.1875,
    }),
    residualOperation: Object.freeze({
      operationClass: 'FINAL_DRILL_TO_DIAMETER',
      targetDiameterIn: 0.375,
    }),
    allowedSecondaryOptions: Object.freeze([
      SECONDARY_OPTIONS.YARD_SECONDARY,
      SECONDARY_OPTIONS.CUSTOMER_COMPLETES,
      SECONDARY_OPTIONS.THIRD_PARTY_COMPLETES,
    ]),
  });
}

export function evaluateCompletionLine(line) {
  if (!line || typeof line !== 'object' || Array.isArray(line)) {
    return { status: COMPLETION_LINE_STATUS.UNRESOLVED, reasons: ['COMPLETION_LINE_MISSING'] };
  }

  const reasons = [];
  const primaryStatus = string(line.primaryContribution?.status);
  if (primaryStatus === 'COMPLETE') {
    return {
      lineId: string(line.lineId),
      status: COMPLETION_LINE_STATUS.MACHINE_COMPLETE,
      reasons,
      selectedOption: null,
      customerAccepted: null,
      stewardAccepted: null,
    };
  }

  if (!['PARTIAL', 'NONE'].includes(primaryStatus)) {
    reasons.push('PRIMARY_CONTRIBUTION_STATUS_UNRESOLVED');
  }

  const allowed = uniqueStrings(line.allowedSecondaryOptions);
  const selectedOption = string(line.selectedOption);
  if (!selectedOption) reasons.push('SECONDARY_OPTION_NOT_SELECTED');
  else if (!allowed.includes(selectedOption)) reasons.push('SECONDARY_OPTION_NOT_ALLOWED');

  const customerAccepted = line.customerDecision === 'ACCEPTED';
  const customerDeclined = line.customerDecision === 'DECLINED';
  if (selectedOption && !customerAccepted && !customerDeclined) {
    reasons.push('CUSTOMER_DECISION_REQUIRED');
  }
  if (customerDeclined) reasons.push('CUSTOMER_DECLINED_COMPLETION_OPTION');

  const stewardAccepted = line.stewardDecision === 'ACCEPTED';
  const stewardRejected = line.stewardDecision === 'REJECTED';
  if (customerAccepted && !stewardAccepted && !stewardRejected) {
    reasons.push('STEWARD_DECISION_REQUIRED');
  }
  if (stewardRejected) reasons.push('STEWARD_REJECTED_COMPLETION_PLAN');

  if (selectedOption === SECONDARY_OPTIONS.YARD_SECONDARY) {
    if (!string(line.secondaryServiceRef)) reasons.push('YARD_SECONDARY_SERVICE_REFERENCE_REQUIRED');
    if (stewardAccepted && line.secondaryExecutionStatus !== 'COMPLETE') {
      reasons.push('YARD_SECONDARY_WORK_PENDING');
    }
  }

  if (reasons.length > 0) {
    return {
      lineId: string(line.lineId),
      status: stewardRejected
        ? COMPLETION_LINE_STATUS.REFUSED
        : COMPLETION_LINE_STATUS.UNRESOLVED,
      reasons,
      selectedOption,
      customerAccepted,
      stewardAccepted,
    };
  }

  let status = COMPLETION_LINE_STATUS.UNRESOLVED;
  if (selectedOption === SECONDARY_OPTIONS.YARD_SECONDARY) {
    status = COMPLETION_LINE_STATUS.YARD_COMPLETE;
  } else if (selectedOption === SECONDARY_OPTIONS.CUSTOMER_COMPLETES) {
    status = COMPLETION_LINE_STATUS.ASSIGNED_TO_CUSTOMER;
  } else if (selectedOption === SECONDARY_OPTIONS.THIRD_PARTY_COMPLETES) {
    status = COMPLETION_LINE_STATUS.ASSIGNED_TO_THIRD_PARTY;
  }

  return {
    lineId: string(line.lineId),
    status,
    reasons: [],
    selectedOption,
    customerAccepted,
    stewardAccepted,
  };
}

export function evaluateCompletionPlan(plan) {
  const reasons = [];
  if (!plan || typeof plan !== 'object' || Array.isArray(plan)) {
    return {
      status: COMPLETION_PLAN_STATUS.BLOCKED,
      reasons: ['COMPLETION_PLAN_MISSING'],
      lines: [],
      handoffReady: false,
      closeoutReady: false,
    };
  }

  if (plan.storeDisposition !== 'SUPPORTABLE') {
    reasons.push('STORE_DISPOSITION_NOT_SUPPORTABLE');
  }

  const lines = (Array.isArray(plan.lines) ? plan.lines : []).map(evaluateCompletionLine);
  if (lines.length === 0) reasons.push('COMPLETION_LINES_MISSING');

  const customerDecisionPending = lines.some((line) => line.reasons.includes('CUSTOMER_DECISION_REQUIRED'));
  const stewardDecisionPending = lines.some((line) => line.reasons.includes('STEWARD_DECISION_REQUIRED'));
  const yardWorkPending = lines.some((line) => line.reasons.includes('YARD_SECONDARY_WORK_PENDING'));
  const lineBlocked = lines.some((line) =>
    [COMPLETION_LINE_STATUS.UNRESOLVED, COMPLETION_LINE_STATUS.REFUSED].includes(line.status),
  );

  if (plan.labelingStatus !== 'APPLIED') reasons.push('LABELING_NOT_COMPLETE');
  if (plan.stagingStatus !== 'STAGED') reasons.push('STAGING_NOT_COMPLETE');
  if (!['PICKUP_READY', 'DELIVERY_ARRANGED'].includes(plan.fulfillmentStatus)) {
    reasons.push('FULFILLMENT_NOT_READY');
  }
  if (plan.closeoutRecordStatus !== 'PREPARED') reasons.push('CLOSEOUT_RECORD_NOT_PREPARED');

  const handoffReady = reasons.length === 0 && !lineBlocked;
  const closeoutReady = handoffReady && plan.custodyStatus === 'TRANSFERRED';

  let status = COMPLETION_PLAN_STATUS.BLOCKED;
  if (customerDecisionPending) status = COMPLETION_PLAN_STATUS.NEEDS_CUSTOMER_DECISION;
  else if (stewardDecisionPending) status = COMPLETION_PLAN_STATUS.NEEDS_STEWARD_DECISION;
  else if (yardWorkPending) status = COMPLETION_PLAN_STATUS.SECONDARY_WORK_PENDING;
  else if (handoffReady) status = COMPLETION_PLAN_STATUS.READY_FOR_HANDOFF;
  if (closeoutReady) status = COMPLETION_PLAN_STATUS.CLOSED;

  return {
    status,
    reasons,
    lines,
    handoffReady,
    closeoutReady,
    operatorMayPromote: false,
  };
}

export function buildPartLabel(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('label input must be an object');
  }
  const required = ['projectId', 'partId', 'revision', 'recordRef'];
  for (const key of required) {
    if (!string(input[key])) throw new TypeError(`${key} is required`);
  }
  return Object.freeze({
    labelVersion: 'STB-PART-LABEL-0.1',
    projectId: input.projectId,
    partId: input.partId,
    revision: input.revision,
    material: string(input.material),
    definition: string(input.definition),
    primaryStatus: string(input.primaryStatus),
    secondaryStatus: string(input.secondaryStatus),
    handoffStatus: string(input.handoffStatus),
    recordRef: input.recordRef,
    // Deliberately excluded from the physical part label by default:
    customerName: null,
    customerAddress: null,
    price: null,
  });
}

export function receiptSections(profile) {
  if (profile === RECEIPT_PROFILES.INDIVIDUAL) {
    return Object.freeze([
      'PROJECT_IDENTITY',
      'PARTS_AND_MATERIALS',
      'WHAT_WAS_DONE',
      'WHAT_REMAINS_OR_IS_ASSIGNED',
      'PICKUP_OR_DELIVERY',
      'RECORD_REFERENCE',
    ]);
  }
  if (profile === RECEIPT_PROFILES.CONTRACTOR) {
    return Object.freeze([
      'PROJECT_IDENTITY',
      'REVISION_AND_PART_SCHEDULE',
      'MATERIAL_AND_SKU_BASIS',
      'PRIMARY_OPERATIONS',
      'SECONDARY_OPERATIONS',
      'INSPECTION_DISPOSITIONS',
      'LABEL_AND_PACKAGE_IDS',
      'STAGING_GROUPS',
      'PICKUP_OR_DELIVERY',
      'CUSTODY_TRANSFER',
      'EXCEPTIONS',
      'RECORD_REFERENCE',
    ]);
  }
  throw new TypeError('unknown receipt profile');
}

export function validateHoleRequirement(line) {
  const finalDiameter = line?.requirement?.finalDiameterIn;
  const pilotDiameter = line?.primaryContribution?.diameterIn;
  if (!finitePositive(finalDiameter)) return { ok: false, reason: 'FINAL_DIAMETER_REQUIRED' };
  if (!finitePositive(pilotDiameter)) return { ok: false, reason: 'PILOT_DIAMETER_REQUIRED' };
  if (pilotDiameter >= finalDiameter) return { ok: false, reason: 'PILOT_MUST_BE_SMALLER_THAN_FINAL' };
  return {
    ok: true,
    finalDiameterIn: finalDiameter,
    pilotDiameterIn: pilotDiameter,
    residualDiameterIn: finalDiameter,
  };
}
