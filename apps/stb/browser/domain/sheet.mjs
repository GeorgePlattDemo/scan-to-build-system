import { MAX_PROJECT_EVIDENCE_BYTES, SHEET_DEFINITION } from '/shared/contracts.mjs';
import { evaluateSheetRequirement } from '/shared/sheet-rule.mjs';
import {
  RepositoryError,
  getProject,
  getRecord,
  listRecords,
} from '/data/repository.mjs';
import { commitCandidateChange, successorCandidatePayload } from '/domain/candidate.mjs';
import {
  evidencePayloadFromPrepared,
  prepareTypedOriginal,
  uniqueEvidenceBytes,
} from '/domain/evidence.mjs';
import { lastSheetMapping } from '/domain/sheet-derive.mjs';

function requireString(name, value) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new RepositoryError('invalid-argument', `${name} is required`);
  }
  return value;
}

function opaqueId() {
  return crypto.randomUUID();
}

async function recoverSheet(localRecordId, status) {
  const project = await getProject(localRecordId);
  if (!project) {
    throw new RepositoryError('not-found', 'Committed project could not be read');
  }
  const candidate = await getRecord(localRecordId, 'candidate', project.currentHead);
  const projectionId = candidate?.payload?.projectionId ?? null;
  const occurrenceId = candidate?.payload?.activeOccurrenceIds?.[0] ?? null;
  const definitionRevisionId = candidate?.payload?.definitionRevisionId ?? null;
  const projection = projectionId ? await getRecord(localRecordId, 'projection', projectionId) : null;
  const occurrence = occurrenceId ? await getRecord(localRecordId, 'occurrence', occurrenceId) : null;
  const definition = definitionRevisionId
    ? await getRecord(localRecordId, 'definition', definitionRevisionId)
    : null;
  return {
    status,
    localRecordId: project.localRecordId,
    projectId: project.projectId,
    currentHead: project.currentHead,
    candidateRevisionId: project.currentHead,
    project,
    candidate,
    projection,
    occurrence,
    definition,
    projectionId,
    occurrenceId,
    definitionRevisionId,
  };
}

function sameSheet(observation, input) {
  const sheet = observation?.payload?.sheet ?? observation?.sheet ?? null;
  if (!sheet) {
    return false;
  }
  return (
    sheet.profileKind === input.profileKind
    && sheet.blankL === input.blankL
    && sheet.blankW === input.blankW
    && sheet.tabCount === input.tabCount
    && sheet.routeDepthIn === input.routeDepthIn
    && (sheet.unit ?? 'in') === (input.unit ?? 'in')
  );
}

export async function applySheetDefinition(input) {
  const localRecordId = requireString('localRecordId', input.localRecordId);
  const actionId = requireString('actionId', input.actionId);
  const createdAt = requireString('createdAt', input.createdAt);
  const expectedHead = requireString('expectedHead', input.expectedHead);
  const existingAction = await getRecord(localRecordId, 'action', actionId);
  if (existingAction) {
    return recoverSheet(localRecordId, 'idempotent');
  }

  const sheet = {
    profileKind: input.profileKind,
    blankL: Number(input.blankL),
    blankW: Number(input.blankW),
    tabCount: Number(input.tabCount),
    routeDepthIn: Number(input.routeDepthIn),
    unit: input.unit ?? SHEET_DEFINITION.unit,
  };
  const evaluation = evaluateSheetRequirement(sheet);
  const current = await getRecord(localRecordId, 'candidate', expectedHead);
  if (!current) {
    throw new RepositoryError('invalid-argument', 'Expected candidate head was not found');
  }
  const currentMapping = lastSheetMapping(current.payload.mappings);
  const currentObservation = currentMapping
    ? await getRecord(localRecordId, 'observation', currentMapping.observationId)
    : null;
  if (currentMapping && currentObservation && sameSheet(currentObservation, sheet) && evaluation.valid) {
    return recoverSheet(localRecordId, 'noop');
  }

  const observationId = opaqueId();
  const rawText = [
    sheet.profileKind,
    `${sheet.blankL}x${sheet.blankW} in`,
    `tabs ${sheet.tabCount}`,
    `depth ${sheet.routeDepthIn}`,
  ].join(' ');
  const prepared = await prepareTypedOriginal({
    text: rawText,
    role: 'sheet-mode2-stencil',
    acquisitionContext: 'entered',
  });
  const existing = await listRecords(localRecordId, 'evidence');
  const alreadyKnown = existing.some((record) => record.payload && record.payload.sha256 === prepared.blob.sha256);
  if (!alreadyKnown) {
    const nextTotal = uniqueEvidenceBytes(existing) + prepared.blob.size;
    if (nextTotal > MAX_PROJECT_EVIDENCE_BYTES) {
      throw new RepositoryError(
        'project-evidence-limit',
        `Unique evidence bytes would exceed ${MAX_PROJECT_EVIDENCE_BYTES}`,
      );
    }
  }

  const result = await commitCandidateChange({
    localRecordId,
    expectedHead,
    actionId,
    createdAt,
    blobs: [prepared.blob],
    records: [
      {
        kind: 'evidence',
        id: prepared.evidenceId,
        payload: evidencePayloadFromPrepared(prepared),
      },
      {
        kind: 'observation',
        id: observationId,
        payload: {
          evidenceId: prepared.evidenceId,
          rawText,
          declaredUnit: sheet.unit,
          role: SHEET_DEFINITION.inputKey,
          method: 'entered',
          creator: 'user',
          kind: 'sheet-stencil',
          unresolvedReason: evaluation.valid ? null : evaluation.unresolvedReason,
          supersedesObservationId: currentObservation?.id ?? null,
          sheet,
        },
      },
    ],
    eventType: 'sheet-requirement-applied',
    eventPayload: {
      observationId,
      evidenceId: prepared.evidenceId,
      mapped: evaluation.valid,
      profileKind: sheet.profileKind,
    },
    buildPayload(previous) {
      const evidenceIds = [...(previous.payload.activeEvidenceIds ?? [])];
      if (!evidenceIds.includes(prepared.evidenceId)) {
        evidenceIds.push(prepared.evidenceId);
      }
      const observationIds = [...(previous.payload.activeObservationIds ?? [])];
      if (!observationIds.includes(observationId)) {
        observationIds.push(observationId);
      }
      const mappings = (previous.payload.mappings ?? []).filter(
        (entry) => entry.inputKey !== SHEET_DEFINITION.inputKey && entry.inputKey !== 'finished length',
      );
      if (evaluation.valid) {
        mappings.push({
          observationId,
          inputKey: SHEET_DEFINITION.inputKey,
          status: 'accepted',
        });
      }
      return successorCandidatePayload(previous, {
        activeEvidenceIds: evidenceIds,
        activeObservationIds: observationIds,
        mappings,
        unresolved: !evaluation.valid,
        parts: null,
        dimensions: null,
        material: null,
      });
    },
  });

  const recovered = await recoverSheet(localRecordId, result.status);
  return {
    ...recovered,
    observationId,
    evidenceId: prepared.evidenceId,
  };
}
