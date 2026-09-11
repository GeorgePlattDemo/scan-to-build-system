import { COPY, SHEET_DEFINITION, STORE_UNAVAILABLE } from '/shared/contracts.mjs';
import { canonicalEqual } from '/shared/canonical.mjs';
import { evaluateSheetRequirement } from '/shared/sheet-rule.mjs';

export const SHEET_DERIVATION_VERSION = SHEET_DEFINITION.derivationVersion;

function opaqueId() {
  return crypto.randomUUID();
}

export function lastSheetMapping(mappings) {
  const matches = (mappings ?? []).filter(
    (entry) => entry.inputKey === SHEET_DEFINITION.inputKey && entry.status === 'accepted',
  );
  return matches.length > 0 ? matches[matches.length - 1] : null;
}

function definitionBasis(content) {
  return {
    occurrenceId: content.occurrenceId,
    definitionKind: content.definitionKind,
    ruleVersion: content.ruleVersion,
    profileKind: content.profileKind,
    blankLength: content.blankLength,
    blankWidth: content.blankWidth,
    tabCount: content.tabCount,
    routeDepth: content.routeDepth,
    quantity: content.quantity,
    quantityUnit: content.quantityUnit,
    requiredOps: content.requiredOps,
    valid: content.valid,
    unresolvedReason: content.unresolvedReason,
    observationId: content.observationId,
  };
}

function sameDefinition(left, right) {
  if (!left || !right) {
    return false;
  }
  return canonicalEqual(definitionBasis(left), definitionBasis(right));
}

function dim(canonical) {
  if (!canonical) {
    return null;
  }
  return { value: Number(canonical), unit: SHEET_DEFINITION.unit, canonical };
}

export function planSheetDerivation({
  candidateRevisionId,
  createdAt,
  projectId,
  payload,
  observationById,
  previousPayload,
  previousDefinition,
}) {
  const mapping = lastSheetMapping(payload.mappings);
  const observation = mapping ? observationById.get(mapping.observationId) ?? null : null;
  const sheet = observation?.sheet ?? observation ?? null;
  const evaluation = evaluateSheetRequirement(sheet);

  let occurrenceId = (payload.activeOccurrenceIds ?? [])[0] ?? null;
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
        role: SHEET_DEFINITION.occurrenceRole,
        historicalOrigin: null,
      },
    });
  }

  const definitionContent = occurrenceId
    ? {
        occurrenceId,
        definitionKind: SHEET_DEFINITION.kind,
        ruleVersion: SHEET_DEFINITION.ruleVersion,
        profileKind: evaluation.profileKind,
        blankLength: evaluation.valid ? dim(evaluation.blankLCanonical) : null,
        blankWidth: evaluation.valid ? dim(evaluation.blankWCanonical) : null,
        tabCount: evaluation.tabCount,
        routeDepth: evaluation.valid ? dim(evaluation.routeDepthCanonical) : null,
        quantity: SHEET_DEFINITION.quantity,
        quantityUnit: SHEET_DEFINITION.quantityUnit,
        requiredOps: [...SHEET_DEFINITION.requiredOps],
        valid: evaluation.valid,
        unresolvedReason: evaluation.valid ? null : evaluation.unresolvedReason,
        observationId: mapping ? mapping.observationId : null,
        evidenceId: observation?.evidenceId ?? null,
        inputKey: mapping ? SHEET_DEFINITION.inputKey : null,
        method: observation?.method ?? null,
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
    payload: {
      derivationVersion: SHEET_DERIVATION_VERSION,
      definitionKind: SHEET_DEFINITION.kind,
      ruleVersion: SHEET_DEFINITION.ruleVersion,
      candidateRevisionId,
      valid: evaluation.valid,
      unresolvedReason: evaluation.valid ? null : evaluation.unresolvedReason,
      occurrenceId,
      definitionRevisionId,
      profileKind: evaluation.profileKind,
      blankLength: evaluation.valid ? dim(evaluation.blankLCanonical) : null,
      blankWidth: evaluation.valid ? dim(evaluation.blankWCanonical) : null,
      tabCount: evaluation.tabCount,
      routeDepth: evaluation.valid ? dim(evaluation.routeDepthCanonical) : null,
      quantity: SHEET_DEFINITION.quantity,
      quantityUnit: SHEET_DEFINITION.quantityUnit,
      requiredOps: [...SHEET_DEFINITION.requiredOps],
      geometry: {
        kind: 'sheet-profile-schematic',
        scale: 'non-scale',
        profileKind: evaluation.profileKind,
        lengthCanonical: evaluation.blankLCanonical ?? null,
        widthCanonical: evaluation.blankWCanonical ?? null,
        unit: SHEET_DEFINITION.unit,
        tabCount: evaluation.tabCount,
        routeDepthCanonical: evaluation.routeDepthCanonical ?? null,
        toolpath: false,
      },
      parts: evaluation.valid && occurrenceId && definitionRevisionId
        ? [{
            occurrenceId,
            definitionRevisionId,
            label: 'Sheet stencil component',
            quantity: SHEET_DEFINITION.quantity,
            quantityUnit: SHEET_DEFINITION.quantityUnit,
            profileKind: evaluation.profileKind,
            requiredOps: [...SHEET_DEFINITION.requiredOps],
          }]
        : [],
      summary: {
        title: evaluation.valid ? 'One desired sheet stencil' : 'Sheet requirement is unresolved',
        occurrenceId,
        definitionRevisionId,
        finishedLength: evaluation.valid
          ? `${evaluation.blankLCanonical} in × ${evaluation.blankWCanonical} in`
          : null,
        quantity: '1 ea',
        operation: evaluation.profileKind ?? null,
        cut: evaluation.profileKind ?? null,
        schematicNote: COPY.sheetNotToScale,
        store: STORE_UNAVAILABLE.reason,
        provenance: 'Manually entered Mode-2 sheet stencil. Not a toolpath.',
        unresolvedReason: evaluation.valid ? null : evaluation.unresolvedReason,
        valid: evaluation.valid,
      },
      source: mapping && observation
        ? { observationId: mapping.observationId, evidenceId: observation.evidenceId ?? null, inputKey: SHEET_DEFINITION.inputKey, method: observation.method ?? null }
        : null,
      store: { ...STORE_UNAVAILABLE },
      request: {
        complete: false,
        reason: STORE_UNAVAILABLE.reason,
        intended: evaluation.valid
          ? {
              definitionKind: SHEET_DEFINITION.kind,
              ruleVersion: SHEET_DEFINITION.ruleVersion,
              profileKind: evaluation.profileKind,
              quantity: SHEET_DEFINITION.quantity,
              quantityUnit: SHEET_DEFINITION.quantityUnit,
              requiredOps: [...SHEET_DEFINITION.requiredOps],
              blankLength: dim(evaluation.blankLCanonical),
              blankWidth: dim(evaluation.blankWCanonical),
              tabCount: evaluation.tabCount,
              routeDepth: dim(evaluation.routeDepthCanonical),
            }
          : null,
      },
    },
  });

  return {
    records,
    candidatePatch: {
      activeOccurrenceIds: occurrenceId ? [occurrenceId] : [],
      projectionId,
      definitionRevisionId,
      definitionKind: SHEET_DEFINITION.kind,
      ruleVersion: SHEET_DEFINITION.ruleVersion,
      unresolved: !evaluation.valid,
    },
  };
}
