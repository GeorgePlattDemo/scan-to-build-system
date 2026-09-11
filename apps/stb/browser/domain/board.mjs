import {
  BOARD_INPUT_KEY,
  CUT001_DOCUMENTARY_REFERENCE,
  MAX_PROJECT_EVIDENCE_BYTES,
} from '/shared/contracts.mjs';
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
import { interpretMeasurement, observationIsResolved } from '/domain/observation.mjs';
import { lastFinishedLengthMapping } from '/domain/derive.mjs';

function requireString(name, value) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new RepositoryError('invalid-argument', `${name} is required`);
  }
  return value;
}

function opaqueId() {
  return crypto.randomUUID();
}

function documentarySnapshot(reference) {
  if (!reference) {
    return null;
  }
  return {
    id: reference.id,
    repository: reference.repository,
    pin: reference.pin,
    authority: false,
    storeSupport: false,
    machineCommissioning: false,
    fabricationAuthorization: false,
    physicalExecution: false,
  };
}

function sameBoardBasis(observation, input) {
  if (!observation) {
    return false;
  }
  const payload = observation.payload ?? observation;
  const method = input.method ?? 'entered';
  if (payload.rawText !== input.rawText) {
    return false;
  }
  if ((payload.declaredUnit ?? null) !== (input.unit ?? null) && payload.declaredUnit !== input.unit) {
    const declared = payload.declaredUnit == null ? '' : String(payload.declaredUnit);
    const next = input.unit == null ? '' : String(input.unit);
    if (declared !== next) {
      return false;
    }
  }
  if ((payload.method ?? 'entered') !== method) {
    return false;
  }
  const previousPin = payload.documentaryReference?.pin ?? null;
  const nextPin = input.documentaryReference?.pin ?? null;
  return previousPin === nextPin;
}

async function ensureEvidenceBudget(localRecordId, prepared) {
  const existing = await listRecords(localRecordId, 'evidence');
  const alreadyKnown = existing.some(
    (record) => record.payload && record.payload.sha256 === prepared.blob.sha256,
  );
  if (alreadyKnown) {
    return;
  }
  const nextTotal = uniqueEvidenceBytes(existing) + prepared.blob.size;
  if (nextTotal > MAX_PROJECT_EVIDENCE_BYTES) {
    throw new RepositoryError(
      'project-evidence-limit',
      `Unique evidence bytes would exceed ${MAX_PROJECT_EVIDENCE_BYTES}`,
    );
  }
}

async function recoverBoard(localRecordId, status) {
  const project = await getProject(localRecordId);
  if (!project) {
    throw new RepositoryError('not-found', 'Committed project could not be read');
  }
  const candidate = await getRecord(localRecordId, 'candidate', project.currentHead);
  const projectionId = candidate?.payload?.projectionId ?? null;
  const occurrenceId = candidate?.payload?.activeOccurrenceIds?.[0] ?? null;
  const definitionRevisionId = candidate?.payload?.definitionRevisionId ?? null;
  const projection = projectionId
    ? await getRecord(localRecordId, 'projection', projectionId)
    : null;
  const occurrence = occurrenceId
    ? await getRecord(localRecordId, 'occurrence', occurrenceId)
    : null;
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

export async function applyBoardFinishedLength(input) {
  const localRecordId = requireString('localRecordId', input.localRecordId);
  const actionId = requireString('actionId', input.actionId);
  const createdAt = requireString('createdAt', input.createdAt);
  const expectedHead = requireString('expectedHead', input.expectedHead);
  const existingAction = await getRecord(localRecordId, 'action', actionId);
  if (existingAction) {
    return recoverBoard(localRecordId, 'idempotent');
  }

  const method = input.method ?? 'entered';
  const documentaryReference = documentarySnapshot(input.documentaryReference);
  const interpreted = interpretMeasurement({
    rawText: input.rawText,
    unit: input.unit,
    role: BOARD_INPUT_KEY,
    kind: 'measurement',
  });
  const current = await getRecord(localRecordId, 'candidate', expectedHead);
  if (!current) {
    throw new RepositoryError('invalid-argument', 'Expected candidate head was not found');
  }
  const currentMapping = lastFinishedLengthMapping(current.payload.mappings);
  const currentObservation = currentMapping
    ? await getRecord(localRecordId, 'observation', currentMapping.observationId)
    : null;
  const resolved = observationIsResolved(interpreted);
  if (
    currentMapping
    && currentObservation
    && resolved === observationIsResolved(currentObservation.payload)
    && sameBoardBasis(currentObservation, {
      rawText: interpreted.rawText,
      unit: interpreted.declaredUnit,
      method,
      documentaryReference,
    })
  ) {
    return recoverBoard(localRecordId, 'noop');
  }

  const observationId = opaqueId();
  const records = [];
  const blobs = [];
  const prepared = await prepareTypedOriginal({
    text: interpreted.rawText,
    role: method === 'documentary-reference' ? 'board-documentary-reference' : 'board-finished-length',
    acquisitionContext: method,
  });
  await ensureEvidenceBudget(localRecordId, prepared);
  const evidenceId = prepared.evidenceId;
  blobs.push(prepared.blob);
  records.push({
    kind: 'evidence',
    id: prepared.evidenceId,
    payload: evidencePayloadFromPrepared(prepared),
  });
  records.push({
    kind: 'observation',
    id: observationId,
    payload: {
      evidenceId,
      sourceLocation: input.sourceLocation ?? null,
      rawText: interpreted.rawText,
      declaredUnit: interpreted.declaredUnit,
      interpretedValue: interpreted.interpretedValue,
      interpretedUnit: interpreted.interpretedUnit,
      role: BOARD_INPUT_KEY,
      method,
      creator: 'user',
      kind: 'measurement',
      unresolvedReason: interpreted.unresolvedReason,
      supersedesObservationId: currentObservation?.id ?? null,
      takeoff: null,
      documentaryReference,
    },
  });

  const result = await commitCandidateChange({
    localRecordId,
    expectedHead,
    actionId,
    createdAt,
    blobs,
    records,
    eventType:
      method === 'documentary-reference' ? 'board-cut001-referenced' : 'board-requirement-applied',
    eventPayload: {
      observationId,
      evidenceId,
      method,
      mapped: resolved,
      documentaryReference,
    },
    buildPayload(previous) {
      const evidenceIds = [...(previous.payload.activeEvidenceIds ?? [])];
      if (!evidenceIds.includes(evidenceId)) {
        evidenceIds.push(evidenceId);
      }
      const observationIds = [...(previous.payload.activeObservationIds ?? [])];
      if (!observationIds.includes(observationId)) {
        observationIds.push(observationId);
      }
      const mappings = (previous.payload.mappings ?? []).filter(
        (entry) => entry.inputKey !== BOARD_INPUT_KEY,
      );
      if (resolved) {
        mappings.push({
          observationId,
          inputKey: BOARD_INPUT_KEY,
          status: 'accepted',
        });
      }
      return successorCandidatePayload(previous, {
        activeEvidenceIds: evidenceIds,
        activeObservationIds: observationIds,
        mappings,
        unresolved: true,
        parts: null,
        dimensions: null,
        material: null,
      });
    },
  });

  const recovered = await recoverBoard(localRecordId, result.status);
  return {
    ...recovered,
    observationId,
    evidenceId,
  };
}

export async function applyCut001DocumentaryReference(input) {
  return applyBoardFinishedLength({
    ...input,
    rawText: CUT001_DOCUMENTARY_REFERENCE.finishedLengthRaw,
    unit: CUT001_DOCUMENTARY_REFERENCE.finishedLengthUnit,
    method: CUT001_DOCUMENTARY_REFERENCE.method,
    documentaryReference: CUT001_DOCUMENTARY_REFERENCE,
  });
}

export async function retireBoardOccurrence(input) {
  const localRecordId = requireString('localRecordId', input.localRecordId);
  const actionId = requireString('actionId', input.actionId);
  const existingAction = await getRecord(localRecordId, 'action', actionId);
  if (existingAction) {
    return recoverBoard(localRecordId, 'idempotent');
  }
  const expectedHead = requireString('expectedHead', input.expectedHead);
  const current = await getRecord(localRecordId, 'candidate', expectedHead);
  if (!current) {
    throw new RepositoryError('invalid-argument', 'Expected candidate head was not found');
  }
  const occurrenceId = current.payload.activeOccurrenceIds?.[0] ?? null;
  if (!occurrenceId) {
    return recoverBoard(localRecordId, 'noop');
  }
  const result = await commitCandidateChange({
    localRecordId,
    expectedHead,
    actionId,
    createdAt: requireString('createdAt', input.createdAt),
    eventType: 'board-occurrence-retired',
    eventPayload: { occurrenceId },
    buildPayload(previous) {
      return successorCandidatePayload(previous, {
        activeOccurrenceIds: [],
        definitionRevisionId: null,
        mappings: (previous.payload.mappings ?? []).filter(
          (entry) => entry.inputKey !== BOARD_INPUT_KEY,
        ),
        unresolved: true,
        parts: null,
        dimensions: null,
        material: null,
      });
    },
  });
  const recovered = await recoverBoard(localRecordId, result.status);
  return {
    ...recovered,
    retiredOccurrenceId: occurrenceId,
  };
}
