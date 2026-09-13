import {
  BOARD_DEFINITION,
  BOARD_INPUT_KEY,
  COPY,
  STORE_UNAVAILABLE,
} from '/shared/contracts.mjs';
import { canonicalEqual } from '/shared/canonical.mjs';
import { evaluateBoardRequirement } from '/shared/board-rule.mjs';

export const BOARD_DERIVATION_VERSION = BOARD_DEFINITION.derivationVersion;

function opaqueId() {
  return crypto.randomUUID();
}

export function lastFinishedLengthMapping(mappings) {
  const matches = (mappings ?? []).filter(
    (entry) => entry.inputKey === BOARD_INPUT_KEY && entry.status === 'accepted',
  );
  return matches.length > 0 ? matches[matches.length - 1] : null;
}

function finishedLengthResolution(mappings, observationById) {
  const matches = (mappings ?? []).filter(
    (entry) => entry.inputKey === BOARD_INPUT_KEY && entry.status === 'accepted',
  );
  if (matches.length === 0) {
    return { mapping: null, observation: null, evaluation: evaluateBoardRequirement(null), conflict: null };
  }
  const evaluated = matches.map((mapping) => {
    const observation = observationById.get(mapping.observationId) ?? null;
    const evaluation = evaluateBoardRequirement(observation);
    const signature = evaluation.valid
      ? `valid:${evaluation.canonical}`
      : `unresolved:${evaluation.unresolvedReason ?? 'unknown'}:${evaluation.rawText ?? ''}:${evaluation.declaredUnit ?? ''}`;
    return { mapping, observation, evaluation, signature };
  });
  const signatures = new Set(evaluated.map((entry) => entry.signature));
  if (signatures.size > 1) {
    return {
      mapping: null,
      observation: null,
      evaluation: {
        valid: false,
        unresolvedReason: 'conflicting-finished-length',
        value: null,
        unit: null,
        canonical: null,
        rawText: null,
        declaredUnit: null,
      },
      conflict: {
        inputKey: BOARD_INPUT_KEY,
        observationIds: matches.map((entry) => entry.observationId),
        values: evaluated.map((entry) => ({
          observationId: entry.mapping.observationId,
          valid: entry.evaluation.valid,
          canonical: entry.evaluation.canonical,
          rawText: entry.evaluation.rawText,
          declaredUnit: entry.evaluation.declaredUnit,
          unresolvedReason: entry.evaluation.unresolvedReason,
        })),
      },
    };
  }
  const selected = evaluated[evaluated.length - 1];
  return { ...selected, conflict: null };
}

export function definitionBasis(content) {
  return {
    occurrenceId: content.occurrenceId,
    definitionKind: content.definitionKind,
    ruleVersion: content.ruleVersion,
    finishedLength: content.finishedLength,
    quantity: content.quantity,
    quantityUnit: content.quantityUnit,
    requiredOps: content.requiredOps,
    squareCut: content.squareCut,
    valid: content.valid,
    unresolvedReason: content.unresolvedReason,
    observationId: content.observationId,
    method: content.method,
    documentaryReference: content.documentaryReference,
  };
}

function sameDefinition(left, right) {
  if (!left || !right) {
    return false;
  }
  return canonicalEqual(definitionBasis(left), definitionBasis(right));
}

function sourceFromObservation(mapping, observation) {
  if (!mapping || !observation) {
    return null;
  }
  return {
    observationId: mapping.observationId,
    evidenceId: observation.evidenceId ?? null,
    inputKey: BOARD_INPUT_KEY,
    method: observation.method ?? null,
    documentaryReference: observation.documentaryReference ?? null,
  };
}

function finishedLengthPayload(evaluation) {
  if (evaluation.canonical == null) {
    return null;
  }
  return {
    value: evaluation.value,
    unit: evaluation.unit,
    canonical: evaluation.canonical,
  };
}

function provenanceLabel(source, conflict) {
  if (conflict) {
    return 'Conflicting finished-length observations are retained. No winner was selected.';
  }
  if (!source) {
    return 'No finished-length mapping is in use.';
  }
  if (source.method === 'documentary-reference') {
    const pin = source.documentaryReference?.pin ?? null;
    return pin
      ? `CUT-001 documentary reference (${pin}). Not Store support, machine commissioning, or fabrication authorization.`
      : 'CUT-001 documentary reference. Not Store support, machine commissioning, or fabrication authorization.';
  }
  return 'Manually entered finished length.';
}

function buildProjectionPayload({
  candidateRevisionId,
  occurrenceId,
  definitionRevisionId,
  evaluation,
  source,
  conflict,
}) {
  const length = finishedLengthPayload(evaluation);
  const part =
    evaluation.valid && occurrenceId && definitionRevisionId
      ? {
          occurrenceId,
          definitionRevisionId,
          label: 'Finished board',
          quantity: BOARD_DEFINITION.quantity,
          quantityUnit: BOARD_DEFINITION.quantityUnit,
          finishedLength: length,
          requiredOps: [...BOARD_DEFINITION.requiredOps],
          squareCut: BOARD_DEFINITION.squareCut,
          material: null,
          parentDimensions: null,
          offering: null,
        }
      : null;
  return {
    derivationVersion: BOARD_DERIVATION_VERSION,
    definitionKind: BOARD_DEFINITION.kind,
    ruleVersion: BOARD_DEFINITION.ruleVersion,
    candidateRevisionId,
    valid: evaluation.valid,
    unresolvedReason: evaluation.valid ? null : evaluation.unresolvedReason,
    unresolvedConditions: conflict ? ['conflicting-finished-length'] : [],
    conflicts: conflict ? [conflict] : [],
    occurrenceId,
    definitionRevisionId,
    finishedLength: length,
    quantity: BOARD_DEFINITION.quantity,
    quantityUnit: BOARD_DEFINITION.quantityUnit,
    requiredOps: [...BOARD_DEFINITION.requiredOps],
    squareCut: BOARD_DEFINITION.squareCut,
    geometry: {
      kind: 'length-only-schematic',
      scale: 'non-scale',
      axis: 'length',
      lengthCanonical: length ? length.canonical : null,
      unit: BOARD_DEFINITION.unit,
      width: null,
      thickness: null,
      absentReason: evaluation.valid ? null : evaluation.unresolvedReason,
    },
    parts: part ? [part] : [],
    summary: {
      title: evaluation.valid ? 'One desired finished board' : 'Board requirement is unresolved',
      occurrenceId,
      definitionRevisionId,
      finishedLength: length ? `${length.canonical} in` : null,
      quantity: '1 ea',
      operation: 'CROSSCUT',
      cut: 'square cut',
      schematicNote: COPY.boardNotToScale,
      store: STORE_UNAVAILABLE.reason,
      provenance: provenanceLabel(source, conflict),
      unresolvedReason: evaluation.valid ? null : evaluation.unresolvedReason,
      valid: evaluation.valid,
    },
    source,
    store: {
      connected: STORE_UNAVAILABLE.connected,
      reason: STORE_UNAVAILABLE.reason,
      offering: null,
      price: null,
      availability: null,
      supportability: null,
    },
    request: {
      complete: false,
      reason: evaluation.valid ? STORE_UNAVAILABLE.reason : evaluation.unresolvedReason,
      intended: evaluation.valid
        ? {
            definitionKind: BOARD_DEFINITION.kind,
            ruleVersion: BOARD_DEFINITION.ruleVersion,
            quantity: BOARD_DEFINITION.quantity,
            quantityUnit: BOARD_DEFINITION.quantityUnit,
            requiredOps: [...BOARD_DEFINITION.requiredOps],
            keptLength: length,
          }
        : null,
    },
  };
}

export function planBoardDerivation({
  candidateRevisionId,
  createdAt,
  projectId,
  payload,
  observationById,
  previousPayload,
  previousDefinition,
}) {
  const resolution = finishedLengthResolution(payload.mappings, observationById);
  const { mapping, observation, evaluation, conflict } = resolution;

  let occurrenceId = (previousPayload.activeOccurrenceIds ?? [])[0] ?? null;
  const records = [];

  if (!occurrenceId && evaluation.valid) {
    occurrenceId = opaqueId();
    records.push({
      kind: 'occurrence',
      id: occurrenceId,
      createdAt,
      payload: {
        projectId,
        introducedInRevisionId: candidateRevisionId,
        role: BOARD_DEFINITION.occurrenceRole,
        historicalOrigin: null,
      },
    });
  }

  const source = sourceFromObservation(mapping, observation);
  const definitionContent = occurrenceId
    ? {
        occurrenceId,
        definitionKind: BOARD_DEFINITION.kind,
        ruleVersion: BOARD_DEFINITION.ruleVersion,
        finishedLength: finishedLengthPayload(evaluation),
        quantity: BOARD_DEFINITION.quantity,
        quantityUnit: BOARD_DEFINITION.quantityUnit,
        requiredOps: [...BOARD_DEFINITION.requiredOps],
        squareCut: BOARD_DEFINITION.squareCut,
        valid: evaluation.valid,
        unresolvedReason: evaluation.valid ? null : evaluation.unresolvedReason,
        observationId: mapping ? mapping.observationId : null,
        evidenceId: observation?.evidenceId ?? null,
        inputKey: mapping ? BOARD_INPUT_KEY : null,
        method: observation?.method ?? null,
        documentaryReference: observation?.documentaryReference ?? null,
        material: null,
        selectedOffering: null,
      }
    : null;

  const previousDefinitionId = previousPayload.definitionRevisionId ?? null;
  const previousDefinitionPayload = previousDefinition?.payload ?? previousDefinition ?? null;
  let definitionRevisionId = null;
  if (definitionContent) {
    if (
      previousDefinitionId
      && previousDefinitionPayload
      && previousDefinitionPayload.occurrenceId === occurrenceId
      && sameDefinition(previousDefinitionPayload, definitionContent)
    ) {
      definitionRevisionId = previousDefinitionId;
    } else {
      definitionRevisionId = opaqueId();
      const parentDefinitionRevisionId =
        previousDefinitionId && previousDefinitionPayload?.occurrenceId === occurrenceId
          ? previousDefinitionId
          : null;
      records.push({
        kind: 'definition',
        id: definitionRevisionId,
        createdAt,
        payload: {
          ...definitionContent,
          parentDefinitionRevisionId,
        },
      });
    }
  }

  const projectionId = opaqueId();
  records.push({
    kind: 'projection',
    id: projectionId,
    createdAt,
    payload: buildProjectionPayload({
      candidateRevisionId,
      occurrenceId,
      definitionRevisionId,
      evaluation,
      source,
      conflict,
    }),
  });

  return {
    records,
    candidatePatch: {
      activeOccurrenceIds: occurrenceId ? [occurrenceId] : [],
      projectionId,
      definitionRevisionId,
      definitionRevisionIds: definitionRevisionId ? [definitionRevisionId] : [],
      definitionKind: BOARD_DEFINITION.kind,
      ruleVersion: BOARD_DEFINITION.ruleVersion,
      unresolved: !evaluation.valid,
    },
  };
}
