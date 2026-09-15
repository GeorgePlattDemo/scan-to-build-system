import { commitPreparedAppend, getProject, getRecord, listRecords } from '/data/repository.mjs';
import { canonicalEqual, canonicalJson, sha256Hex } from '/shared/canonical.mjs';
import { ALCOVE_CLASS_ID } from '/shared/alcove-rule.mjs';

const KIND = 'reference-exchange';
const CHOICES = Object.freeze({
  edge: ['ascut', 'deburr', 's150'], bore: ['class', 'cols', 'none'],
  hw: ['none', 'yard', 'mine'], label: ['std', 'sheet', 'qr'], finish: ['none'],
  excess: ['take', 'dispose', 'rack'], pack: ['loose', 'band', 'box'],
  handoff: ['pickup', 'later', 'curb', 'door'], who: ['me', 'agent', 'contractor'],
  stock: ['ask', 'wait', 'refuse'],
});

export async function referenceReceipts(localRecordId) {
  return (await listRecords(localRecordId, KIND)).sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
}

async function currentProject(localRecordId, candidateRevisionId) {
  const project = await getProject(localRecordId);
  if (!project || project.classId !== ALCOVE_CLASS_ID || project.imported || project.currentHead !== candidateRevisionId) {
    throw new Error('The project changed or is imported. Reopen and review its current definition before saving a reference receipt.');
  }
  return project;
}

async function append(project, payload, parentKind, parentId) {
  const id = `ref-${await sha256Hex(new TextEncoder().encode(canonicalJson({
    projectId: project.projectId, parentKind, parentId, payload,
  })))}`;
  const existing = await getRecord(project.localRecordId, KIND, id);
  if (existing) return existing;
  const parent = await getRecord(project.localRecordId, parentKind, parentId);
  const createdAt = new Date(Math.max(Date.now(), (Date.parse(parent?.createdAt) || 0) + 1)).toISOString();
  const record = {
    localRecordId: project.localRecordId, projectId: project.projectId,
    kind: KIND, id, createdAt, parentKind, parentId,
    payload: { ...payload, referenceOnly: true, authority: false, commercial: false, physical: false },
  };
  await commitPreparedAppend({
    localRecordId: project.localRecordId, projectId: project.projectId,
    expectedHead: project.currentHead, createdAt, actionId: id,
    records: [record],
    event: {
      localRecordId: project.localRecordId, projectId: project.projectId,
      kind: 'event', id: `${id}-event`, createdAt, parentKind: KIND, parentId: id,
      payload: { type: payload.type, receiptId: id, candidateRevisionId: project.currentHead,
        authority: false, commercial: false, physical: false },
    },
  });
  return (await getRecord(project.localRecordId, KIND, id));
}

export async function saveReferenceRequest({ localRecordId, candidateRevisionId, choices }) {
  const project = await currentProject(localRecordId, candidateRevisionId);
  const candidate = await getRecord(localRecordId, 'candidate', candidateRevisionId);
  if (!candidate?.payload?.configuration) throw new Error('The identified configuration is unavailable. Nothing was submitted.');
  if (!choices || Object.keys(choices).length !== 10 || Object.entries(CHOICES).some(([key, allowed]) => !allowed.includes(choices[key]))) {
    throw new Error('Complete the ten service choices before saving the reference request.');
  }
  const requests = (await referenceReceipts(localRecordId)).filter(record => record.payload.type === 'ReferenceRequestSaved');
  const previous = requests.at(-1);
  if (previous?.payload.candidateRevisionId === candidateRevisionId && canonicalEqual(previous.payload.choices, choices)) return previous;
  return append(project, {
    type: 'ReferenceRequestSaved', candidateRevisionId,
    configuration: candidate.payload.configuration, choices: structuredClone(choices),
    previousReceiptId: previous?.id ?? null,
    reason: previous ? 'Project definition or service choices revised; prior request retained.' : 'Initial reference request.',
  }, previous ? KIND : 'candidate', previous?.id ?? candidateRevisionId);
}

export async function saveReferenceMaterialChoice({ localRecordId, candidateRevisionId, requestId, choice }) {
  const project = await currentProject(localRecordId, candidateRevisionId);
  if (!['wait', 'review'].includes(choice)) throw new Error('Choose whether to wait or review a substitute.');
  const records = await referenceReceipts(localRecordId);
  const request = records.filter(record => record.payload.type === 'ReferenceRequestSaved').at(-1);
  if (!request || request.id !== requestId || request.payload.candidateRevisionId !== candidateRevisionId) {
    throw new Error('This response belongs to an earlier request. Reopen the current request before continuing.');
  }
  const previous = records.filter(record => record.payload.type === 'ReferenceMaterialChoiceSaved' && record.payload.requestId === requestId).at(-1);
  if (previous?.payload.choice === choice) return previous;
  return append(project, {
    type: 'ReferenceMaterialChoiceSaved', candidateRevisionId, requestId, choice,
    scenarioId: 'REF-SZ-001',
    previousDecisionId: previous?.id ?? null,
    situation: 'Reference scenario: requested material is unavailable; the yard asks for a decision.',
    reason: choice === 'wait' ? 'Wait for the requested material; no substitution accepted.' : 'Ask to review a substitute; no substitution accepted.',
  }, KIND, previous?.id ?? requestId);
}
