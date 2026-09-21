import {
  commitPreparedAppend,
  getProject,
  listRecords,
} from '/data/repository.mjs';

function clean(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

export async function recordReviewChildSnapshot({
  localRecordId,
  catalogProjectId,
  definitionId,
  sourceEvent,
  payload,
  createdAt = new Date().toISOString(),
}) {
  const project = await getProject(localRecordId);
  if (!project) throw new Error('Project record not found for child snapshot');
  const recordId = crypto.randomUUID();
  const eventId = crypto.randomUUID();
  const actionId = crypto.randomUUID();
  const snapshot = {
    schemaVersion: 'review-child-snapshot/1',
    catalogProjectId,
    definitionId: String(definitionId || 'UNIDENTIFIED'),
    sourceEvent: String(sourceEvent || 'adapter-capture'),
    sourceClassId: project.classId,
    capturedAt: createdAt,
    payload: clean(payload),
    authority: {
      commercial: false,
      productionRelease: false,
      machineReadiness: false,
      cycleStart: false,
      physicalFabrication: false,
    },
  };
  await commitPreparedAppend({
    localRecordId,
    projectId: project.projectId,
    expectedHead: project.currentHead,
    actionId,
    createdAt,
    records: [{
      localRecordId,
      projectId: project.projectId,
      kind: 'child-snapshot',
      id: recordId,
      createdAt,
      payload: snapshot,
    }],
    event: {
      localRecordId,
      projectId: project.projectId,
      kind: 'event',
      id: eventId,
      createdAt,
      payload: {
        type: 'ReviewChildSnapshotRecorded',
        catalogProjectId,
        definitionId: snapshot.definitionId,
        sourceEvent: snapshot.sourceEvent,
      },
    },
  });
  return snapshot;
}

export async function listReviewChildSnapshots(localRecordId) {
  const rows = await listRecords(localRecordId, 'child-snapshot');
  return rows.slice().sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
}

export async function latestReviewChildSnapshot(localRecordId) {
  const rows = await listReviewChildSnapshots(localRecordId);
  return rows.length ? rows[rows.length - 1] : null;
}
