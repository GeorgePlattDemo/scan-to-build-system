import { MAX_PROJECT_EVIDENCE_BYTES } from '/shared/contracts.mjs';
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

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const SUPPORTED_UNITS = Object.freeze({
  in: 'in',
  inch: 'in',
  inches: 'in',
  mm: 'mm',
  cm: 'cm',
  ft: 'ft',
  m: 'm',
});

export const SUPPORTED_QUANTITY_UNITS = Object.freeze({
  ea: 'ea',
});

function requireString(name, value) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new RepositoryError('invalid-argument', `${name} is required`);
  }
  return value;
}

function opaqueId() {
  return crypto.randomUUID();
}

function mappingRequest(input) {
  if (!Object.prototype.hasOwnProperty.call(input, 'mapTo')) {
    return { provided: false, value: null };
  }
  if (input.mapTo == null) {
    return { provided: true, value: null };
  }
  const trimmed = String(input.mapTo).trim();
  return { provided: true, value: trimmed.length > 0 ? trimmed : null };
}

export function observationIsResolved(payload) {
  return Boolean(payload) && payload.unresolvedReason == null;
}

export function parseRawNumber(raw) {
  const rawText = raw == null ? '' : String(raw);
  if (rawText.trim() === '') {
    return { rawText, numeric: null, unresolvedReason: 'blank' };
  }
  const trimmed = rawText.trim();
  if (!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(trimmed)) {
    return { rawText, numeric: null, unresolvedReason: 'malformed' };
  }
  const numeric = Number(trimmed);
  if (!Number.isFinite(numeric)) {
    return { rawText, numeric: null, unresolvedReason: 'nonfinite' };
  }
  return { rawText, numeric, unresolvedReason: null };
}

function classifyNamedUnit(unit, table) {
  if (unit == null || String(unit).trim() === '') {
    return { status: 'missing', declared: unit == null ? null : String(unit), canonical: null };
  }
  const declared = String(unit);
  const key = declared.trim().toLowerCase();
  if (Object.prototype.hasOwnProperty.call(table, key)) {
    return { status: 'supported', declared, canonical: table[key] };
  }
  return { status: 'unsupported', declared, canonical: null };
}

export function classifyUnit(unit) {
  return classifyNamedUnit(unit, SUPPORTED_UNITS);
}

export function classifyQuantityUnit(unit) {
  return classifyNamedUnit(unit, SUPPORTED_QUANTITY_UNITS);
}

export function interpretMeasurement({ rawText, unit, role, kind = 'measurement' }) {
  const parsed = parseRawNumber(rawText);
  const units = classifyUnit(unit);
  const trimmedRole = role == null ? null : String(role).trim() || null;
  let unresolvedReason = null;
  let interpretedValue = null;
  let interpretedUnit = null;
  if (kind === 'typed-need') {
    unresolvedReason = 'unclassified-need';
  } else if (parsed.unresolvedReason) {
    unresolvedReason = parsed.unresolvedReason;
  } else if (units.status === 'missing') {
    unresolvedReason = 'missing-unit';
  } else if (units.status === 'unsupported') {
    unresolvedReason = 'unsupported-unit';
  } else {
    interpretedValue = parsed.numeric;
    interpretedUnit = units.canonical;
  }
  return {
    rawText: kind === 'typed-need' ? String(rawText ?? '') : parsed.rawText,
    declaredUnit: units.declared,
    interpretedValue,
    interpretedUnit,
    role: trimmedRole,
    unresolvedReason,
    mappable: unresolvedReason == null && trimmedRole != null,
  };
}

export function interpretTakeoffRow(row) {
  const label = row.label == null ? '' : String(row.label);
  const quantityRaw = row.quantity == null ? '' : String(row.quantity);
  const dimensions = row.dimensions == null ? '' : String(row.dimensions);
  const material = row.material == null ? '' : String(row.material);
  const units = classifyQuantityUnit(row.unit);
  const reasons = [];
  let quantity = null;
  if (quantityRaw.trim() === '') {
    reasons.push('missing-quantity');
  } else if (!/^[1-9]\d*$/.test(quantityRaw.trim())) {
    reasons.push('invalid-quantity');
  } else {
    quantity = Number(quantityRaw.trim());
  }
  if (units.status === 'missing') {
    reasons.push('missing-unit');
  } else if (units.status === 'unsupported') {
    reasons.push('unsupported-unit');
  }
  if (material.trim() === '') {
    reasons.push('unknown-material');
  }
  const rawText = row.rawText == null || String(row.rawText) === ''
    ? [label, quantityRaw, units.declared ?? '', dimensions, material].filter((part) => String(part).length > 0).join(' | ')
    : String(row.rawText);
  return {
    rawText,
    declaredUnit: units.declared,
    interpretedValue: quantity,
    interpretedUnit: units.canonical,
    role: label.trim() || null,
    unresolvedReason: reasons.length > 0 ? reasons.join(',') : null,
    mappable: reasons.length === 0 && label.trim().length > 0,
    takeoff: {
      label,
      quantityRaw,
      quantity,
      unit: units.declared,
      dimensions,
      material,
    },
  };
}

function sameMapping(left, right) {
  return left.observationId === right.observationId && left.inputKey === right.inputKey;
}

function stableJson(value) {
  return JSON.stringify(value ?? null);
}

function sameObservationContent(left, right) {
  return (
    left.rawText === right.rawText
    && left.declaredUnit === right.declaredUnit
    && left.interpretedValue === right.interpretedValue
    && left.interpretedUnit === right.interpretedUnit
    && left.role === right.role
    && left.evidenceId === right.evidenceId
    && left.kind === right.kind
    && left.method === right.method
    && stableJson(left.sourceLocation) === stableJson(right.sourceLocation)
    && stableJson(left.takeoff) === stableJson(right.takeoff)
  );
}

function mappingKeysFor(mappings, observationId) {
  return (mappings ?? [])
    .filter((entry) => entry.observationId === observationId)
    .map((entry) => entry.inputKey)
    .sort();
}

function refuseUnresolvedMapping() {
  throw new RepositoryError(
    'unresolved-observation',
    'Unresolved observations cannot be mapped into the candidate',
  );
}

async function recoverCurrent(localRecordId, status) {
  const project = await getProject(localRecordId);
  if (!project) {
    throw new RepositoryError('not-found', 'Committed project could not be read');
  }
  const candidate = await getRecord(localRecordId, 'candidate', project.currentHead);
  return {
    status,
    localRecordId: project.localRecordId,
    projectId: project.projectId,
    currentHead: project.currentHead,
    candidateRevisionId: project.currentHead,
    eventId: null,
    project,
    candidate,
  };
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

function observationRecord({
  interpreted,
  evidenceId,
  sourceLocation,
  method,
  kind,
  supersedesObservationId,
}) {
  return {
    evidenceId,
    sourceLocation: sourceLocation ?? null,
    rawText: interpreted.rawText,
    declaredUnit: interpreted.declaredUnit,
    interpretedValue: interpreted.interpretedValue,
    interpretedUnit: interpreted.interpretedUnit,
    role: interpreted.role,
    method,
    creator: 'user',
    kind,
    unresolvedReason: interpreted.unresolvedReason,
    supersedesObservationId: supersedesObservationId ?? null,
    takeoff: interpreted.takeoff ?? null,
  };
}

function mappingsAfterCorrection({
  previousMappings,
  previousId,
  observationId,
  previousRole,
  interpreted,
  mapTo,
}) {
  const others = (previousMappings ?? []).filter((entry) => entry.observationId !== previousId);
  if (!observationIsResolved(interpreted)) {
    return others;
  }
  if (mapTo.provided) {
    if (!mapTo.value) {
      return others;
    }
    return [...others, { observationId, inputKey: mapTo.value, status: 'accepted' }];
  }
  if (interpreted.role !== previousRole) {
    return others;
  }
  return (previousMappings ?? [])
    .filter((entry) => entry.observationId === previousId)
    .map((entry) => ({ ...entry, observationId, status: 'accepted' }))
    .concat(others);
}

async function commitObservationChange(input) {
  const localRecordId = requireString('localRecordId', input.localRecordId);
  const actionId = requireString('actionId', input.actionId);
  const createdAt = requireString('createdAt', input.createdAt);
  const expectedHead = requireString('expectedHead', input.expectedHead);
  return commitCandidateChange({
    localRecordId,
    expectedHead,
    actionId,
    createdAt,
    blobs: input.blobs ?? [],
    records: input.records ?? [],
    eventType: input.eventType,
    eventPayload: input.eventPayload,
    buildPayload: input.buildPayload,
    testFault: input.testFault ?? null,
  });
}

export async function recordEnteredObservation(input) {
  const localRecordId = requireString('localRecordId', input.localRecordId);
  const actionId = requireString('actionId', input.actionId);
  const existingAction = await getRecord(localRecordId, 'action', actionId);
  if (existingAction) {
    const recovered = await commitObservationChange({
      ...input,
      blobs: [],
      records: [],
      eventType: 'observation-recorded',
      eventPayload: {},
      buildPayload() {
        return {};
      },
    });
    const observationId = recovered.event?.payload?.observationId ?? null;
    const observation = observationId
      ? await getRecord(localRecordId, 'observation', observationId)
      : null;
    return {
      ...recovered,
      observationId,
      observation,
      evidenceId: recovered.event?.payload?.evidenceId ?? null,
    };
  }
  const kind = input.kind ?? 'measurement';
  const interpreted = kind === 'takeoff-row'
    ? interpretTakeoffRow(input.takeoff ?? input)
    : interpretMeasurement({
        rawText: input.rawText,
        unit: input.unit,
        role: input.role,
        kind,
      });
  const mapTo = mappingRequest(input);
  if (mapTo.value && !observationIsResolved(interpreted)) {
    refuseUnresolvedMapping();
  }
  const observationId = opaqueId();
  const records = [];
  const blobs = [];
  let evidenceId = input.evidenceId ?? null;
  if (evidenceId && !UUID_RE.test(evidenceId)) {
    throw new RepositoryError('invalid-argument', 'evidenceId must be an opaque UUID');
  }
  if (!evidenceId) {
    const prepared = await prepareTypedOriginal({
      text: interpreted.rawText,
      role: kind,
      acquisitionContext: input.acquisitionContext ?? kind,
    });
    await ensureEvidenceBudget(localRecordId, prepared);
    evidenceId = prepared.evidenceId;
    blobs.push(prepared.blob);
    records.push({
      kind: 'evidence',
      id: prepared.evidenceId,
      payload: evidencePayloadFromPrepared(prepared),
    });
  }
  records.push({
    kind: 'observation',
    id: observationId,
    payload: observationRecord({
      interpreted,
      evidenceId,
      sourceLocation: input.sourceLocation ?? null,
      method: input.method ?? 'entered',
      kind,
      supersedesObservationId: null,
    }),
  });
  const result = await commitObservationChange({
    ...input,
    blobs,
    records,
    eventType: 'observation-recorded',
    eventPayload: {
      observationId,
      evidenceId,
      kind,
      mapped: Boolean(mapTo.value),
    },
    buildPayload(previous) {
      const evidenceIds = [...(previous.payload.activeEvidenceIds ?? [])];
      if (evidenceId && !evidenceIds.includes(evidenceId)) {
        evidenceIds.push(evidenceId);
      }
      const observationIds = [...(previous.payload.activeObservationIds ?? [])];
      if (!observationIds.includes(observationId)) {
        observationIds.push(observationId);
      }
      const mappings = [...(previous.payload.mappings ?? [])];
      if (mapTo.value) {
        const next = { observationId, inputKey: mapTo.value, status: 'accepted' };
        if (!mappings.some((entry) => sameMapping(entry, next))) {
          mappings.push(next);
        }
      }
      return successorCandidatePayload(previous, {
        activeEvidenceIds: evidenceIds,
        activeObservationIds: observationIds,
        mappings,
        originalNeed:
          kind === 'typed-need'
            ? previous.payload.originalNeed ?? evidenceId
            : previous.payload.originalNeed ?? null,
        unresolved: true,
        parts: null,
        dimensions: null,
        material: null,
      });
    },
  });
  const observation = await getRecord(localRecordId, 'observation', observationId);
  return {
    ...result,
    observationId,
    observation,
    evidenceId,
  };
}

export async function mapObservationToInput(input) {
  const localRecordId = requireString('localRecordId', input.localRecordId);
  const observationId = requireString('observationId', input.observationId);
  const inputKey = requireString('inputKey', input.inputKey);
  const observation = await getRecord(localRecordId, 'observation', observationId);
  if (!observation) {
    throw new RepositoryError('invalid-argument', 'Observation does not exist');
  }
  if (!observationIsResolved(observation.payload)) {
    refuseUnresolvedMapping();
  }
  const project = await getProject(localRecordId);
  if (!project) {
    throw new RepositoryError('invalid-argument', 'Project does not exist');
  }
  const existingAction = await getRecord(localRecordId, 'action', requireString('actionId', input.actionId));
  if (existingAction) {
    const recovered = await recoverCurrent(localRecordId, 'idempotent');
    return { ...recovered, observationId, observation };
  }
  const current = await getRecord(localRecordId, 'candidate', requireString('expectedHead', input.expectedHead));
  if (!current) {
    throw new RepositoryError('invalid-argument', 'Expected candidate head was not found');
  }
  const already = (current.payload.mappings ?? []).some(
    (entry) => entry.observationId === observationId && entry.inputKey === inputKey,
  );
  if (already) {
    const recovered = await recoverCurrent(localRecordId, 'noop');
    return { ...recovered, observationId, observation };
  }
  const result = await commitObservationChange({
    ...input,
    eventType: 'observation-mapped',
    eventPayload: { observationId, inputKey },
    buildPayload(previous) {
      const observationIds = [...(previous.payload.activeObservationIds ?? [])];
      if (!observationIds.includes(observationId)) {
        observationIds.push(observationId);
      }
      const mappings = [...(previous.payload.mappings ?? [])];
      mappings.push({ observationId, inputKey, status: 'accepted' });
      return successorCandidatePayload(previous, {
        activeObservationIds: observationIds,
        mappings,
        unresolved: true,
        parts: null,
        dimensions: null,
        material: null,
      });
    },
  });
  return { ...result, observationId, observation };
}

export async function correctObservation(input) {
  const localRecordId = requireString('localRecordId', input.localRecordId);
  const actionId = requireString('actionId', input.actionId);
  const previousId = requireString('observationId', input.observationId);
  const previous = await getRecord(localRecordId, 'observation', previousId);
  if (!previous) {
    throw new RepositoryError('invalid-argument', 'Observation does not exist');
  }
  const existingAction = await getRecord(localRecordId, 'action', actionId);
  if (existingAction) {
    const recovered = await commitObservationChange({
      ...input,
      blobs: [],
      records: [],
      eventType: 'observation-corrected',
      eventPayload: {},
      buildPayload() {
        return {};
      },
    });
    const observationId = recovered.event?.payload?.observationId ?? previousId;
    const observation = await getRecord(localRecordId, 'observation', observationId);
    return {
      ...recovered,
      observationId,
      observation,
      supersededObservationId: recovered.event?.payload?.supersedesObservationId ?? previousId,
    };
  }
  const kind = input.kind ?? previous.payload.kind ?? 'measurement';
  const interpreted = kind === 'takeoff-row'
    ? interpretTakeoffRow(input.takeoff ?? input)
    : interpretMeasurement({
        rawText: input.rawText ?? previous.payload.rawText,
        unit: input.unit === undefined ? previous.payload.declaredUnit : input.unit,
        role: input.role === undefined ? previous.payload.role : input.role,
        kind,
      });
  const mapTo = mappingRequest(input);
  if (mapTo.value && !observationIsResolved(interpreted)) {
    refuseUnresolvedMapping();
  }
  const nextPayload = observationRecord({
    interpreted,
    evidenceId: input.evidenceId ?? previous.payload.evidenceId,
    sourceLocation: input.sourceLocation === undefined
      ? previous.payload.sourceLocation
      : input.sourceLocation,
    method: input.method ?? previous.payload.method ?? 'entered',
    kind,
    supersedesObservationId: previousId,
  });
  const current = await getRecord(
    localRecordId,
    'candidate',
    requireString('expectedHead', input.expectedHead),
  );
  if (!current) {
    throw new RepositoryError('invalid-argument', 'Expected candidate head was not found');
  }
  const previousKeys = mappingKeysFor(current.payload.mappings, previousId);
  const nextMappings = mappingsAfterCorrection({
    previousMappings: current.payload.mappings ?? [],
    previousId,
    observationId: 'pending',
    previousRole: previous.payload.role,
    interpreted,
    mapTo,
  });
  const nextKeys = mappingKeysFor(
    nextMappings.map((entry) => (
      entry.observationId === 'pending' ? { ...entry, observationId: previousId } : entry
    )),
    previousId,
  );
  if (sameObservationContent(previous.payload, nextPayload) && stableJson(previousKeys) === stableJson(nextKeys)) {
    const recovered = await recoverCurrent(localRecordId, 'noop');
    return { ...recovered, observationId: previousId, observation: previous };
  }
  const observationId = opaqueId();
  const result = await commitObservationChange({
    ...input,
    records: [
      {
        kind: 'observation',
        id: observationId,
        payload: nextPayload,
      },
    ],
    eventType: 'observation-corrected',
    eventPayload: {
      observationId,
      supersedesObservationId: previousId,
    },
    buildPayload(previousCandidate) {
      const observationIds = (previousCandidate.payload.activeObservationIds ?? []).map((id) =>
        id === previousId ? observationId : id,
      );
      if (!observationIds.includes(observationId)) {
        observationIds.push(observationId);
      }
      return successorCandidatePayload(previousCandidate, {
        activeObservationIds: observationIds,
        mappings: mappingsAfterCorrection({
          previousMappings: previousCandidate.payload.mappings ?? [],
          previousId,
          observationId,
          previousRole: previous.payload.role,
          interpreted,
          mapTo,
        }),
        unresolved: true,
        parts: null,
        dimensions: null,
        material: null,
      });
    },
  });
  const observation = await getRecord(localRecordId, 'observation', observationId);
  return { ...result, observationId, observation, supersededObservationId: previousId };
}

export async function detachActiveEvidence(input) {
  const localRecordId = requireString('localRecordId', input.localRecordId);
  const evidenceId = requireString('evidenceId', input.evidenceId);
  const existingAction = await getRecord(localRecordId, 'action', requireString('actionId', input.actionId));
  if (existingAction) {
    return recoverCurrent(localRecordId, 'idempotent');
  }
  const current = await getRecord(
    localRecordId,
    'candidate',
    requireString('expectedHead', input.expectedHead),
  );
  if (!current) {
    throw new RepositoryError('invalid-argument', 'Expected candidate head was not found');
  }
  const active = current.payload.activeEvidenceIds ?? [];
  if (!active.includes(evidenceId)) {
    return recoverCurrent(localRecordId, 'noop');
  }
  const observations = await listRecords(localRecordId, 'observation');
  const affected = observations
    .filter((record) => record.payload && record.payload.evidenceId === evidenceId)
    .map((record) => record.id);
  const result = await commitObservationChange({
    ...input,
    eventType: 'evidence-detached',
    eventPayload: { evidenceId, observationIds: affected },
    buildPayload(previous) {
      return successorCandidatePayload(previous, {
        activeEvidenceIds: (previous.payload.activeEvidenceIds ?? []).filter((id) => id !== evidenceId),
        activeObservationIds: (previous.payload.activeObservationIds ?? []).filter(
          (id) => !affected.includes(id),
        ),
        mappings: (previous.payload.mappings ?? []).filter((entry) => !affected.includes(entry.observationId)),
        unresolved: true,
        parts: null,
        dimensions: null,
        material: null,
      });
    },
  });
  return { ...result, evidenceId };
}
