import { OWN_ENTRY } from '/shared/contracts.mjs';
import { getMappedClass } from '/domain/classes.mjs';
import {
  RepositoryError,
  commitPreparedChange,
  getProject,
  getRecord,
  listRecords,
} from '/data/repository.mjs';
import { planBoardDerivation } from '/domain/derive.mjs';
import { lastSheetMapping, planSheetDerivation } from '/domain/sheet-derive.mjs';

function requireString(name, value) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new RepositoryError('invalid-argument', `${name} is required`);
  }
  return value;
}

function opaqueId() {
  return crypto.randomUUID();
}

function classReferenceSnapshot(classRef) {
  if (!classRef) {
    return null;
  }
  return {
    classId: classRef.classId,
    classVersion: classRef.classVersion,
    ruleVersion: classRef.ruleVersion ?? null,
    status: classRef.status,
    storePath: classRef.storePath,
    source: classRef.source ?? null,
  };
}

export function emptyCandidatePayload({ entryMode, classRef, actorId }) {
  return {
    parentCandidateRevisionId: null,
    entryMode,
    classReference: classReferenceSnapshot(classRef),
    originalNeed: null,
    unresolved: true,
    actorContext: actorId,
    parts: null,
    dimensions: null,
    material: null,
    activeEvidenceIds: [],
    activeObservationIds: [],
    mappings: [],
    activeOccurrenceIds: [],
    projectionId: null,
    definitionRevisionId: null,
  };
}

export function successorCandidatePayload(previous, patch = {}) {
  const prior = previous.payload ?? {};
  return {
    parentCandidateRevisionId: previous.id,
    entryMode: prior.entryMode,
    classReference: prior.classReference ?? null,
    originalNeed: prior.originalNeed ?? null,
    unresolved: prior.unresolved !== false,
    actorContext: prior.actorContext ?? null,
    parts: null,
    dimensions: null,
    material: null,
    activeEvidenceIds: [...(prior.activeEvidenceIds ?? [])],
    activeObservationIds: [...(prior.activeObservationIds ?? [])],
    mappings: [...(prior.mappings ?? [])],
    activeOccurrenceIds: [...(prior.activeOccurrenceIds ?? [])],
    projectionId: prior.projectionId ?? null,
    definitionRevisionId: prior.definitionRevisionId ?? null,
    ...patch,
  };
}

export function prepareProjectCreation(input) {
  const actionId = requireString('actionId', input.actionId);
  const createdAt = requireString('createdAt', input.createdAt);
  const entryMode = requireString('entryMode', input.entryMode);
  const actorId = input.actorId ?? null;

  let classRef = null;
  if (entryMode === 'mapped') {
    classRef = getMappedClass(input.classId);
    if (!classRef) {
      throw new RepositoryError('invalid-argument', 'Unknown mapped class reference');
    }
  } else if (entryMode === 'own') {
    if (input.classId) {
      throw new RepositoryError(
        'invalid-argument',
        'Own-project start cannot carry a mapped class reference',
      );
    }
  } else {
    throw new RepositoryError('invalid-argument', 'entryMode must be mapped or own');
  }

  // localRecordId remains the original-create storage namespace used by
  // [localRecordId, actionId] idempotency. It is not domain project identity.
  const localRecordId = actionId;
  const projectId = opaqueId();
  const candidateRevisionId = opaqueId();
  const eventId = opaqueId();

  return {
    ids: {
      localRecordId,
      projectId,
      candidateRevisionId,
      eventId,
      entryMode,
      classId: classRef ? classRef.classId : null,
      classVersion: classRef ? classRef.classVersion : null,
    },
    commitInput: {
      localRecordId,
      projectId,
      expectedHead: null,
      nextHead: candidateRevisionId,
      createdAt,
      actionId,
      index: {
        title: classRef ? classRef.label : 'Untitled project',
        entryMode,
        classId: classRef ? classRef.classId : null,
        classVersion: classRef ? classRef.classVersion : null,
      },
      records: [
        {
          localRecordId,
          projectId,
          kind: 'candidate',
          id: candidateRevisionId,
          createdAt,
          payload: emptyCandidatePayload({ entryMode, classRef, actorId }),
        },
      ],
      event: {
        localRecordId,
        projectId,
        kind: 'event',
        id: eventId,
        createdAt,
        payload: {
          type: 'project-created',
          entryMode,
          classId: classRef ? classRef.classId : null,
          unclassified: entryMode === 'own' ? OWN_ENTRY.unclassified : false,
        },
      },
    },
  };
}

async function recoverCommitted(localRecordId, actionId, result) {
  const project = await getProject(localRecordId);
  if (!project) {
    throw new RepositoryError('not-found', 'Committed project could not be read');
  }
  const candidateRevisionId = project.currentHead;
  const candidate = await getRecord(localRecordId, 'candidate', candidateRevisionId);
  const action = await getRecord(localRecordId, 'action', actionId);
  const eventId = action?.payload?.eventId ?? null;
  const event = eventId ? await getRecord(localRecordId, 'event', eventId) : null;
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
    status: result.status,
    localRecordId: project.localRecordId,
    projectId: project.projectId,
    currentHead: project.currentHead,
    candidateRevisionId,
    eventId,
    entryMode: project.entryMode,
    classId: project.classId,
    classVersion: project.classVersion,
    title: project.title,
    project,
    candidate,
    event,
    projection,
    occurrence,
    definition,
    projectionId,
    occurrenceId,
    definitionRevisionId,
  };
}

async function commitCreation(prepared) {
  const result = await commitPreparedChange(prepared.commitInput);
  return recoverCommitted(prepared.commitInput.localRecordId, prepared.commitInput.actionId, result);
}

export async function createProject(input) {
  return commitCreation(prepareProjectCreation(input));
}

export async function commitCandidateChange(input) {
  const localRecordId = requireString('localRecordId', input.localRecordId);
  const actionId = requireString('actionId', input.actionId);
  const createdAt = requireString('createdAt', input.createdAt);
  const expectedHead = requireString('expectedHead', input.expectedHead);
  const eventType = requireString('eventType', input.eventType);

  const project = await getProject(localRecordId);
  if (!project) {
    throw new RepositoryError('invalid-argument', 'Project does not exist');
  }
  if (project.unknownClass === true) {
    throw new RepositoryError(
      'unknown-class',
      'Unknown class version. Inspectable only. Editing and derivation are disabled.',
    );
  }

  const existingAction = await getRecord(localRecordId, 'action', actionId);
  if (existingAction) {
    return recoverCommitted(localRecordId, actionId, { status: 'idempotent' });
  }

  if (project.currentHead !== expectedHead) {
    throw new RepositoryError(
      'head-conflict',
      `Expected head ${expectedHead} but found ${String(project.currentHead)}`,
    );
  }

  const previous = await getRecord(localRecordId, 'candidate', expectedHead);
  if (!previous) {
    throw new RepositoryError('invalid-argument', 'Expected candidate head was not found');
  }

  const nextHead = opaqueId();
  const eventId = opaqueId();
  const payload = input.buildPayload(previous);
  const extraRecords = (input.records ?? []).map((record) => ({
    ...record,
    localRecordId,
    projectId: project.projectId,
    createdAt: record.createdAt ?? createdAt,
  }));

  const observationById = new Map();
  const existingObservations = await listRecords(localRecordId, 'observation');
  for (const record of existingObservations) {
    observationById.set(record.id, record.payload);
  }
  for (const record of extraRecords) {
    if (record.kind === 'observation') {
      observationById.set(record.id, record.payload);
    }
  }

  const previousDefinitionId = previous.payload?.definitionRevisionId ?? null;
  const previousDefinition = previousDefinitionId
    ? await getRecord(localRecordId, 'definition', previousDefinitionId)
    : null;
  const useSheet =
    lastSheetMapping(payload.mappings)
    || previous.payload?.definitionKind === 'sheet.mode2.stencil.v1';
  const planned = (useSheet ? planSheetDerivation : planBoardDerivation)({
    candidateRevisionId: nextHead,
    createdAt,
    projectId: project.projectId,
    payload,
    observationById,
    previousPayload: previous.payload ?? {},
    previousDefinition,
  });
  const derivedPayload = {
    ...payload,
    ...planned.candidatePatch,
  };
  extraRecords.push(
    ...planned.records.map((record) => ({
      ...record,
      localRecordId,
      projectId: project.projectId,
      createdAt: record.createdAt ?? createdAt,
    })),
  );

  const result = await commitPreparedChange({
    localRecordId,
    projectId: project.projectId,
    expectedHead,
    nextHead,
    createdAt,
    actionId,
    records: [
      {
        localRecordId,
        projectId: project.projectId,
        kind: 'candidate',
        id: nextHead,
        createdAt,
        payload: derivedPayload,
      },
      ...extraRecords,
    ],
    blobs: input.blobs ?? [],
    event: {
      localRecordId,
      projectId: project.projectId,
      kind: 'event',
      id: eventId,
      createdAt,
      payload: {
        type: eventType,
        ...(input.eventPayload ?? {}),
      },
    },
    testFault: input.testFault ?? null,
  });

  return recoverCommitted(localRecordId, actionId, result);
}
