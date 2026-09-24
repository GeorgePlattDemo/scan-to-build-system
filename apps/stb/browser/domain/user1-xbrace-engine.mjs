import { canonicalEqual } from '/shared/canonical.mjs';
import {
  USER_DEFINED_BOARD_DEFINITION,
  USER_DEFINED_BOARD_MATERIAL_DEMAND,
} from '/shared/contracts.mjs';
import {
  USER1_XBRACE_RULE_VERSION,
  evaluateUser1XBraceConfiguration,
} from '/shared/user1-xbrace-rule.mjs';

function opaqueId() {
  return crypto.randomUUID();
}

function priorDefinition(previousDefinitions, occurrenceId) {
  return previousDefinitions instanceof Map
    ? previousDefinitions.get(occurrenceId) ?? null
    : null;
}

function definitionBasis(payload) {
  if (!payload) return null;
  return {
    occurrenceId: payload.occurrenceId,
    definitionKind: payload.definitionKind,
    ruleVersion: payload.ruleVersion,
    configurationId: payload.configurationId,
    configurationVersion: payload.configurationVersion,
    materialDemand: payload.materialDemand,
    definedWorkpieceLength: payload.definedWorkpieceLength,
    sawCuts: payload.sawCuts,
    sawAngleDeg: payload.sawAngleDeg,
    requiredOps: payload.requiredOps,
    cutPlane: payload.cutPlane,
    endIdentity: payload.endIdentity,
    endRelation: payload.endRelation,
    lengthDatum: payload.lengthDatum,
    datumCMethod: payload.datumCMethod,
    parts: payload.parts,
    spotDemand: payload.spotDemand,
    materialSource: payload.materialSource,
  };
}

export function planUser1XBraceDerivation({
  candidateRevisionId,
  createdAt,
  projectId,
  payload,
  previousPayload = {},
  previousDefinitions = new Map(),
}) {
  const evaluation = evaluateUser1XBraceConfiguration(payload.configuration ?? null);
  const records = [];
  let occurrenceId = (previousPayload.activeOccurrenceIds ?? [])[0] ?? null;
  let definitionRevisionId = null;

  if (!evaluation.valid) {
    const projectionId = opaqueId();
    records.push({
      kind: 'projection',
      id: projectionId,
      createdAt,
      payload: {
        derivationVersion: USER1_XBRACE_RULE_VERSION,
        definitionKind: USER_DEFINED_BOARD_DEFINITION.kind,
        ruleVersion: USER_DEFINED_BOARD_DEFINITION.ruleVersion,
        classId: null,
        classVersion: null,
        candidateRevisionId,
        valid: false,
        unresolvedReason: evaluation.unresolvedReason,
        unresolvedConditions: [evaluation.unresolvedReason],
        occurrenceId: null,
        occurrenceIds: [],
        definitionRevisionId: null,
        definitionRevisionIds: [],
        geometry: {
          kind: 'length-only-schematic',
          scale: 'non-scale',
          axis: 'length',
          lengthCanonical: null,
          unit: 'in',
          width: null,
          thickness: null,
          absentReason: evaluation.unresolvedReason,
        },
        parts: [],
        summary: {
          title: 'Job 1 X-brace definition is unresolved',
          finishedLength: null,
          quantity: '1 workpiece',
          operation: 'MITER_LIMITED + SPOT_ON_LOCATION',
          cut: 'project geometry unresolved',
          provenance: 'System Job 1 configuration; Store facts not yet requested.',
          valid: false,
          unresolvedReason: evaluation.unresolvedReason,
        },
        materialDemand: USER_DEFINED_BOARD_MATERIAL_DEMAND,
        storeDemand: null,
        request: { complete: false, reason: evaluation.unresolvedReason, intended: null },
        physicalFabricationEligible: false,
        productionAuthorization: false,
        machineReady: false,
      },
    });
    return {
      records,
      candidatePatch: {
        activeOccurrenceIds: [],
        projectionId,
        definitionRevisionIds: [],
        definitionRevisionId: null,
        definitionKind: USER_DEFINED_BOARD_DEFINITION.kind,
        ruleVersion: USER_DEFINED_BOARD_DEFINITION.ruleVersion,
        unresolved: true,
        parts: [],
        dimensions: null,
        material: {
          ...USER_DEFINED_BOARD_MATERIAL_DEMAND,
          source: 'STORE_ZERO',
          status: 'store-owned',
        },
      },
    };
  }

  if (!occurrenceId) {
    occurrenceId = opaqueId();
    records.push({
      kind: 'occurrence',
      id: occurrenceId,
      createdAt,
      payload: {
        projectId,
        introducedInRevisionId: candidateRevisionId,
        role: USER_DEFINED_BOARD_DEFINITION.occurrenceRole,
        historicalOrigin: null,
      },
    });
  }

  const definitionContent = {
    occurrenceId,
    definitionKind: USER_DEFINED_BOARD_DEFINITION.kind,
    ruleVersion: USER_DEFINED_BOARD_DEFINITION.ruleVersion,
    classId: null,
    classVersion: null,
    configurationId: evaluation.configurationId,
    configurationVersion: evaluation.configurationVersion,
    materialDemand: { ...USER_DEFINED_BOARD_MATERIAL_DEMAND },
    quantity: USER_DEFINED_BOARD_DEFINITION.quantity,
    quantityUnit: USER_DEFINED_BOARD_DEFINITION.quantityUnit,
    definedWorkpieceLength: evaluation.derived.definedWorkpieceLengthIn,
    sawCuts: evaluation.derived.sawCuts,
    sawAngleDeg: evaluation.derived.angleDeg,
    drillCycles: 0,
    drillDepthIn: null,
    requiredOps: [...evaluation.derived.requiredOps],
    cutPlane: evaluation.derived.cutPlane,
    endIdentity: evaluation.derived.endIdentity,
    endRelation: evaluation.derived.endRelation,
    lengthDatum: evaluation.derived.lengthDatum,
    datumCMethod: evaluation.derived.datumCMethod,
    parts: structuredClone(evaluation.parts),
    spotDemand: structuredClone(evaluation.spotDemand),
    unresolvedConditions: [],
    materialSource: 'STORE_ZERO',
    physicalFabricationEligible: false,
  };

  const prior = priorDefinition(previousDefinitions, occurrenceId);
  const priorPayload = prior?.payload ?? prior ?? null;
  if (priorPayload && canonicalEqual(definitionBasis(priorPayload), definitionBasis(definitionContent))) {
    definitionRevisionId = prior.id;
  } else {
    definitionRevisionId = opaqueId();
    records.push({
      kind: 'definition',
      id: definitionRevisionId,
      createdAt,
      payload: {
        ...definitionContent,
        parentDefinitionRevisionId: prior?.id ?? null,
      },
    });
  }

  const projectionId = opaqueId();
  records.push({
    kind: 'projection',
    id: projectionId,
    createdAt,
    payload: {
      derivationVersion: USER1_XBRACE_RULE_VERSION,
      definitionKind: USER_DEFINED_BOARD_DEFINITION.kind,
      ruleVersion: USER_DEFINED_BOARD_DEFINITION.ruleVersion,
      classId: null,
      classVersion: null,
      candidateRevisionId,
      valid: true,
      unresolvedReason: null,
      unresolvedConditions: [],
      occurrenceId,
      occurrenceIds: [occurrenceId],
      definitionRevisionId,
      definitionRevisionIds: [definitionRevisionId],
      geometry: {
        kind: 'length-only-schematic',
        scale: 'non-scale',
        axis: 'length',
        lengthCanonical: evaluation.derived.definedWorkpieceLengthIn.canonical,
        unit: 'in',
        width: null,
        thickness: null,
        absentReason: null,
      },
      input: evaluation.input,
      derived: evaluation.derived,
      parts: structuredClone(evaluation.parts),
      materialDemand: { ...USER_DEFINED_BOARD_MATERIAL_DEMAND },
      operationRequirements: {
        status: 'application-demand',
        required: [...evaluation.derived.requiredOps],
        declaredSawCuts: evaluation.derived.sawCuts,
        declaredSpotCount: evaluation.spotDemand.totalCount,
      },
      spotDemand: structuredClone(evaluation.spotDemand),
      storeDemand: {
        lineId: occurrenceId,
        ...structuredClone(evaluation.storeDemand),
      },
      summary: {
        title: 'Job 1 · X-brace defined workpiece',
        finishedLength: `${evaluation.derived.definedWorkpieceLengthIn.canonical} in`,
        quantity: '1 workpiece',
        operation: 'MITER_LIMITED + SPOT_ON_LOCATION',
        cut: `3 saw cuts · ${evaluation.derived.angleDeg}° face-miter demand`,
        provenance: 'Project definition only. Store owns stock selection, capability, modeled work, remnant, and Q.',
        valid: true,
        unresolvedReason: null,
      },
      request: {
        complete: false,
        reason: 'Fresh Store evaluation required for this candidate revision.',
        intended: structuredClone(evaluation.storeDemand),
      },
      physicalFabricationEligible: false,
      productionAuthorization: false,
      machineReady: false,
    },
  });

  return {
    records,
    candidatePatch: {
      activeOccurrenceIds: [occurrenceId],
      projectionId,
      definitionRevisionIds: [definitionRevisionId],
      definitionRevisionId,
      definitionKind: USER_DEFINED_BOARD_DEFINITION.kind,
      ruleVersion: USER_DEFINED_BOARD_DEFINITION.ruleVersion,
      unresolved: false,
      parts: evaluation.parts.map((part) => ({
        partId: part.partId,
        lengthIn: part.lengthIn,
        spotXIn: part.features[0]?.xIn ?? null,
      })),
      dimensions: {
        definedWorkpieceLength: evaluation.derived.definedWorkpieceLengthIn,
        partLength: evaluation.input.partLengthIn,
        fixedHorizontalSpan: evaluation.derived.fixedHorizontalSpanIn,
        angleDeg: evaluation.derived.angleDeg,
        centerSpot: evaluation.derived.centerSpotIn,
      },
      material: {
        ...USER_DEFINED_BOARD_MATERIAL_DEMAND,
        source: 'STORE_ZERO',
        status: 'store-owned',
      },
    },
  };
}
