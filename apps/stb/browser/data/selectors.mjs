import { workstreamsForClass } from '/shared/contracts.mjs';
import {
  describeDatabase,
  getBlob,
  getDraft,
  getProject,
  getRecord,
  getRecordsByRequestAttempt,
  listProjects,
  listRecords,
} from './repository.mjs';

export async function databaseShape() {
  return describeDatabase();
}

function withWorkstreams(project) {
  if (!project) {
    return null;
  }
  const workstreams = Array.isArray(project.workstreams)
    ? [...project.workstreams]
    : workstreamsForClass(project.classId);
  return { ...project, workstreams };
}

export async function projectIndex(localRecordId) {
  return withWorkstreams(await getProject(localRecordId));
}

export async function listSavedProjects(ownerAccountId = undefined) {
  const projects = await listProjects();
  const visible = ownerAccountId === undefined
    ? projects
    : projects.filter((project) => (project.ownerAccountId ?? null) === ownerAccountId);
  return [...visible]
    .sort((left, right) => {
      if (left.updatedAt === right.updatedAt) {
        return left.localRecordId < right.localRecordId ? 1 : -1;
      }
      return left.updatedAt < right.updatedAt ? 1 : -1;
    })
    .map((project) => ({
      localRecordId: project.localRecordId,
      projectId: project.projectId,
      currentHead: project.currentHead,
      title: project.title,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      entryMode: project.entryMode,
      classId: project.classId,
      classVersion: project.classVersion,
      workstreams: Array.isArray(project.workstreams)
        ? [...project.workstreams]
        : workstreamsForClass(project.classId),
      imported: project.imported === true,
      importOrigin: project.importOrigin ?? null,
      importArchiveId: project.importArchiveId ?? null,
      unknownClass: project.unknownClass === true,
    }));
}

export async function projectHead(localRecordId) {
  const project = await getProject(localRecordId);
  return project ? project.currentHead : null;
}

export async function recordSnapshot(localRecordId, kind, id) {
  return getRecord(localRecordId, kind, id);
}

export async function listProjectRecords(localRecordId, kind) {
  return listRecords(localRecordId, kind);
}

export async function currentCandidate(localRecordId) {
  const project = await getProject(localRecordId);
  if (!project) {
    return null;
  }
  return getRecord(localRecordId, 'candidate', project.currentHead);
}

export async function currentProjection(localRecordId) {
  const candidate = await currentCandidate(localRecordId);
  const projectionId = candidate?.payload?.projectionId ?? null;
  if (!projectionId) {
    return null;
  }
  return getRecord(localRecordId, 'projection', projectionId);
}

export async function listProjectEvidence(localRecordId) {
  const records = await listRecords(localRecordId, 'evidence');
  return [...records].sort((left, right) => {
    if (left.createdAt === right.createdAt) {
      return left.id < right.id ? -1 : 1;
    }
    return left.createdAt < right.createdAt ? -1 : 1;
  });
}

export async function listProjectObservations(localRecordId) {
  const records = await listRecords(localRecordId, 'observation');
  return [...records].sort((left, right) => {
    if (left.createdAt === right.createdAt) {
      return left.id < right.id ? -1 : 1;
    }
    return left.createdAt < right.createdAt ? -1 : 1;
  });
}

export async function unappliedDraft(localRecordId, draftId) {
  return getDraft(localRecordId, draftId);
}

export async function blobCustody(sha256) {
  const blob = await getBlob(sha256);
  if (!blob) {
    return { status: 'unavailable', sha256, reason: 'missing' };
  }
  if (blob.readError) {
    return {
      status: 'unavailable',
      sha256,
      reason: 'read-failed',
      size: blob.size,
      type: blob.type,
    };
  }
  if (!blob.digestMatches) {
    return {
      status: 'unavailable',
      sha256,
      reason: 'hash-or-size-mismatch',
      size: blob.size,
      type: blob.type,
    };
  }
  return {
    status: 'retained',
    sha256: blob.sha256,
    size: blob.size,
    type: blob.type,
    bytes: blob.bytes,
  };
}

export async function attemptInspection(localRecordId, attemptId) {
  const attempt = await getRecord(localRecordId, 'attempt', attemptId);
  if (!attempt) {
    return {
      status: 'unavailable',
      attemptId,
      success: false,
      completed: false,
      currentStoreAnswer: false,
    };
  }
  const requestId = attempt.requestId ?? null;
  const related = requestId
    ? await getRecordsByRequestAttempt(localRecordId, requestId, attemptId)
    : [attempt];
  const interruptEvent = related.find(
    (record) =>
      record.kind === 'event' &&
      record.payload &&
      record.payload.diagnostic === 'APP_ATTEMPT_INTERRUPTED',
  );
  if (interruptEvent) {
    return {
      status: 'interrupted',
      representation: 'historical',
      reason: 'APP_ATTEMPT_INTERRUPTED',
      attemptId,
      requestId,
      success: false,
      completed: true,
      currentStoreAnswer: false,
    };
  }
  const terminal = related.some(
    (record) => record.kind === 'event' && record.payload && record.payload.terminal === true,
  );
  if (!terminal) {
    return {
      status: 'interrupted',
      representation: 'historical',
      reason: 'abandoned-pending-attempt',
      attemptId,
      requestId,
      success: false,
      completed: false,
      currentStoreAnswer: false,
    };
  }
  return {
    status: 'historical',
    representation: 'historical',
    reason: 'terminal-event-present',
    attemptId,
    requestId,
    success: false,
    completed: true,
    currentStoreAnswer: false,
  };
}

function bySequence(left, right, field) {
  return (left.payload?.[field] ?? 0) - (right.payload?.[field] ?? 0);
}

export async function listStoreRequests(localRecordId) {
  const records = await listRecords(localRecordId, 'request');
  return [...records].sort((left, right) => bySequence(left, right, 'requestSequence'));
}

export async function listStoreAttempts(localRecordId, requestId) {
  const records = await listRecords(localRecordId, 'attempt');
  return records
    .filter((record) => record.requestId === requestId)
    .sort((left, right) => bySequence(left, right, 'attemptNumber'));
}

export async function listProjectEvents(localRecordId) {
  const records = await listRecords(localRecordId, 'event');
  return [...records].sort((left, right) => {
    if (left.createdAt === right.createdAt) {
      return left.id < right.id ? -1 : 1;
    }
    return left.createdAt < right.createdAt ? -1 : 1;
  });
}

export async function listProjectReviews(localRecordId) {
  const records = await listRecords(localRecordId, 'review');
  return [...records].sort((left, right) => {
    if (left.createdAt === right.createdAt) {
      return left.id < right.id ? -1 : 1;
    }
    return left.createdAt < right.createdAt ? -1 : 1;
  });
}

export async function latestStoreRequest(localRecordId, { candidateRevisionId, scope } = {}) {
  const requests = await listStoreRequests(localRecordId);
  const matching = requests.filter((record) => {
    if (candidateRevisionId && record.payload?.candidateRevisionId !== candidateRevisionId) {
      return false;
    }
    if (scope && record.payload?.scope !== scope) {
      return false;
    }
    return true;
  });
  return matching.at(-1) ?? null;
}

export async function latestStoreAttempt(localRecordId, requestId) {
  const attempts = await listStoreAttempts(localRecordId, requestId);
  return attempts.at(-1) ?? null;
}

export function responseIsUsable(response) {
  return Boolean(
    response &&
      response.kind === 'response' &&
      response.payload?.validation?.ok === true &&
      response.payload?.quarantined !== true &&
      !response.payload?.diagnostic,
  );
}

export async function currentStoreAnswer(localRecordId, { candidateRevisionId, scope } = {}) {
  const project = await getProject(localRecordId);
  if (!project) {
    return { status: 'none', current: false, historical: false };
  }
  const targetCandidate = candidateRevisionId ?? project.currentHead;
  const request = await latestStoreRequest(localRecordId, {
    candidateRevisionId: targetCandidate,
    scope,
  });
  if (!request) {
    return { status: 'none', current: false, historical: false, candidateRevisionId: targetCandidate };
  }
  const attempt = await latestStoreAttempt(localRecordId, request.id);
  if (!attempt) {
    return {
      status: 'none',
      current: false,
      historical: false,
      request,
      candidateRevisionId: targetCandidate,
    };
  }
  const related = await getRecordsByRequestAttempt(localRecordId, request.id, attempt.id);
  const terminalEvents = related.filter(
    (record) => record.kind === 'event' && record.payload?.terminal === true,
  );
  const responses = related.filter((record) => record.kind === 'response');
  const usable = responses.find((record) => responseIsUsable(record)) ?? null;
  const diagnosticEvent = terminalEvents.find((record) => record.payload?.diagnostic);
  const importedRecord =
    request.imported === true ||
    attempt.imported === true ||
    responses.some((record) => record.imported === true);
  const latestForHead =
    request.payload?.candidateRevisionId === project.currentHead &&
    request.id === (await latestStoreRequest(localRecordId, { candidateRevisionId: project.currentHead, scope }))?.id;
  const latestAttempt =
    attempt.id === (await latestStoreAttempt(localRecordId, request.id))?.id;

  if (!terminalEvents.length) {
    return {
      status: 'pending',
      current: false,
      historical: false,
      imported: importedRecord,
      request,
      attempt,
      candidateRevisionId: targetCandidate,
    };
  }

  if (importedRecord) {
    return {
      status: 'historical',
      current: false,
      historical: true,
      imported: true,
      request,
      attempt,
      response: usable,
      candidateRevisionId: targetCandidate,
      reason: 'imported-inert',
      latestForHead,
      latestAttempt,
    };
  }

  if (usable && latestForHead && latestAttempt) {
    return {
      status: 'current',
      current: true,
      historical: false,
      imported: false,
      request,
      attempt,
      response: usable,
      candidateRevisionId: targetCandidate,
    };
  }

  return {
    status: diagnosticEvent?.payload?.diagnostic ?? (usable ? 'historical' : 'error'),
    current: false,
    historical: true,
    imported: false,
    request,
    attempt,
    response: usable,
    diagnostic: diagnosticEvent?.payload?.diagnostic ?? responses.find((record) => record.payload?.diagnostic)?.payload?.diagnostic ?? null,
    candidateRevisionId: targetCandidate,
    latestForHead,
    latestAttempt,
  };
}
