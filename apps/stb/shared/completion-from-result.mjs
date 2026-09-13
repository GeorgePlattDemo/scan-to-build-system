import {
  MACHINE_FAMILIES,
  SECONDARY_OPERATION_CLASSES,
  buildResidualOperation,
} from './secondary-operation-library.mjs';

export const COMPLETION_PREVIEW_VERSION = 'STB-COMPLETION-PREVIEW-0.1';

function positive(name, value) {
  if (!Number.isFinite(value) || value <= 0) throw new TypeError(`${name} must be a positive finite number`);
  return value;
}

function labelRequirement(answer) {
  const declared = answer?.operationalRequirements?.labeling;
  return Object.freeze({
    required: true,
    timing: declared?.timing ?? 'WHEN_PART_OR_PACKAGE_LEAVES_PRIMARY_CELL_STREAM',
    status: 'NOT_RECORDED',
    selective: false,
    operatorMayPromote: false,
  });
}

export function buildD001PilotCompletion({
  lineId = 'HOLE-001',
  finalDiameterIn,
  pilotDiameterIn,
} = {}) {
  const finalDiameter = positive('finalDiameterIn', finalDiameterIn);
  const pilotDiameter = positive('pilotDiameterIn', pilotDiameterIn);
  if (pilotDiameter >= finalDiameter) {
    throw new TypeError('pilotDiameterIn must be smaller than finalDiameterIn');
  }
  return Object.freeze({
    lineId,
    machineFamily: MACHINE_FAMILIES.D001,
    requirement: Object.freeze({
      operationClass: 'DRILL_HOLE',
      finalDiameterIn: finalDiameter,
    }),
    primaryContribution: Object.freeze({
      status: 'PARTIAL',
      operationClass: 'PILOT_DRILL',
      diameterIn: pilotDiameter,
    }),
    residualOperation: buildResidualOperation(
      SECONDARY_OPERATION_CLASSES.FINAL_DRILL_TO_DIAMETER,
      {
        machineFamily: MACHINE_FAMILIES.D001,
        targetDiameterIn: finalDiameter,
        pilotDiameterIn: pilotDiameter,
      },
    ),
    selectedOption: null,
    customerDecision: 'PENDING',
    stewardDecision: 'NOT_YET_APPLICABLE',
  });
}

function retainedTabLine(answer) {
  const plannedTabCount = answer?.retention?.plannedTabCount ?? null;
  const requestedTabCount = answer?.retention?.requestedTabCount ?? null;
  const secondarySeparation = answer?.retention?.secondarySeparation
    ?? answer?.secondarySeparation
    ?? null;
  const retained = Number.isInteger(plannedTabCount) && plannedTabCount > 0;
  if (!retained && secondarySeparation == null) return null;
  return Object.freeze({
    lineId: 'S001-TAB-SEPARATION-001',
    machineFamily: MACHINE_FAMILIES.S001,
    requirement: Object.freeze({
      operationClass: 'RELEASE_ROUTED_PART',
      requestedTabCount,
      plannedTabCount,
    }),
    primaryContribution: Object.freeze({
      status: 'PARTIAL',
      operationClass: 'ROUTE_PROFILE_WITH_RETAINED_TABS',
      requestedTabCount,
      plannedTabCount,
      physicalRetentionStatus: answer?.retention?.physicalRetentionStatus ?? null,
    }),
    residualOperation: buildResidualOperation(
      SECONDARY_OPERATION_CLASSES.REMOVE_RETAINED_TABS,
      {
        machineFamily: MACHINE_FAMILIES.S001,
        requestedTabCount,
        plannedTabCount,
        secondarySeparation,
      },
    ),
    selectedOption: null,
    customerDecision: 'PENDING',
    stewardDecision: 'NOT_YET_APPLICABLE',
  });
}

function completedPrimaryLine(answer) {
  if (answer.machineFamily === MACHINE_FAMILIES.D001) {
    return Object.freeze({
      lineId: 'D001-PRIMARY-001',
      machineFamily: MACHINE_FAMILIES.D001,
      requirement: Object.freeze({ operationClass: 'CROSSCUT' }),
      primaryContribution: Object.freeze({ status: 'COMPLETE', operationClass: 'CROSSCUT' }),
      residualOperation: null,
      selectedOption: null,
      customerDecision: null,
      stewardDecision: null,
    });
  }
  return Object.freeze({
    lineId: 'S001-PRIMARY-001',
    machineFamily: MACHINE_FAMILIES.S001,
    requirement: Object.freeze({ operationClass: 'ROUTE_PROFILE' }),
    primaryContribution: Object.freeze({ status: 'COMPLETE', operationClass: 'ROUTE_PROFILE' }),
    residualOperation: null,
    selectedOption: null,
    customerDecision: null,
    stewardDecision: null,
  });
}

export function derivePublishedJobCompletionPreview(answer) {
  if (!answer || typeof answer !== 'object' || Array.isArray(answer)) {
    throw new TypeError('published-job answer is required');
  }
  const machineFamily = answer.machineFamily;
  if (![MACHINE_FAMILIES.D001, MACHINE_FAMILIES.S001].includes(machineFamily)) {
    throw new TypeError(`unsupported completion machine family: ${String(machineFamily)}`);
  }

  const labeling = labelRequirement(answer);
  const storeSupportable = answer.status === 'SUPPORTABLE';
  if (!storeSupportable) {
    return Object.freeze({
      version: COMPLETION_PREVIEW_VERSION,
      eligible: false,
      reason: 'STORE_DISPOSITION_NOT_SUPPORTABLE',
      machineFamily,
      lines: Object.freeze([]),
      labeling,
      secondarySelectionRequired: false,
      physicalExecutionAuthority: false,
      operatorMayPromote: false,
    });
  }

  let lines;
  if (machineFamily === MACHINE_FAMILIES.S001) {
    if (answer?.operationalRequirements?.sheetDrillingThisRound === true) {
      throw new TypeError('S-001 drilling is not admitted in this round');
    }
    const tabLine = retainedTabLine(answer);
    lines = Object.freeze(tabLine ? [tabLine] : [completedPrimaryLine(answer)]);
  } else {
    lines = Object.freeze([completedPrimaryLine(answer)]);
  }

  return Object.freeze({
    version: COMPLETION_PREVIEW_VERSION,
    eligible: true,
    reason: null,
    machineFamily,
    lines,
    labeling,
    secondarySelectionRequired: lines.some((line) => line.residualOperation?.selectionRequired === true),
    physicalExecutionAuthority: false,
    operatorMayPromote: false,
  });
}
