import { canonicalEqual, canonicalJson } from '/shared/canonical.mjs';
import {
  PUBLISHED_PROJECT_CLIENT_ID,
  PUBLISHED_PROJECT_PATH,
  PUBLISHED_PROJECT_PROTOCOL_VERSION,
  publishedProjectForClass,
} from '/shared/published-project-contract.mjs';
import { digestCanonical } from '/shared/store-wire.mjs';
import {
  commitPreparedAppend,
  getProject,
  getRecord,
  listRecords,
} from '/data/repository.mjs';
import { currentCandidate, currentProjection, currentStoreAnswer } from '/data/selectors.mjs';

let activeTransport = null;

export function setPublishedProjectTransport(fn) {
  activeTransport = fn;
}

export function resetPublishedProjectTransport() {
  activeTransport = null;
}

function transport() {
  return activeTransport ?? globalThis.fetch.bind(globalThis);
}

function opaqueId() {
  return crypto.randomUUID();
}

function nowIso(clock) {
  return typeof clock === 'function' ? clock() : new Date().toISOString();
}

async function nextRequestSequence(localRecordId) {
  const requests = await listRecords(localRecordId, 'request');
  return requests.reduce((max, record) => Math.max(max, record.payload?.requestSequence ?? 0), 0) + 1;
}

async function findDuplicate(localRecordId, candidateRevisionId, scope, payloadDigest) {
  const requests = await listRecords(localRecordId, 'request');
  return requests
    .filter((record) =>
      record.imported !== true
      && record.payload?.candidateRevisionId === candidateRevisionId
      && record.payload?.scope === scope
      && record.payload?.payloadDigest === payloadDigest)
    .sort((a, b) => (a.payload?.requestSequence ?? 0) - (b.payload?.requestSequence ?? 0))
    .at(-1) ?? null;
}

function projectInputs(projection) {
  const inputs = projection?.payload?.inputs ?? {};
  const value = (key) => inputs[key]?.value;
  const result = {
    openingWidthIn: value('openingWidthIn'),
    straightHeightIn: value('straightHeightIn'),
    riseIn: value('riseIn'),
  };
  if (!Object.values(result).every((item) => Number.isFinite(item) && item > 0)) {
    throw new Error('published project requires a complete positive S-001 configuration');
  }
  return result;
}

function validateAnswer(answer, contract, inputs) {
  const reasons = [];
  if (!answer || typeof answer !== 'object' || Array.isArray(answer)) reasons.push('answer-not-object');
  if (answer?.ready !== true) reasons.push('answer-not-ready');
  if (answer?.jobId !== contract.jobId) reasons.push('job-id-mismatch');
  if (answer?.requestType !== contract.requestType) reasons.push('request-type-mismatch');
  if (answer?.machineFamily !== contract.machineFamily) reasons.push('machine-family-mismatch');
  if (answer?.storePin !== contract.expectedStorePin) reasons.push('store-pin-mismatch');
  if (!canonicalEqual(answer?.inputs ?? null, inputs)) reasons.push('inputs-mismatch');
  if (!['SUPPORTABLE', 'UNRESOLVED', 'REFUSED', 'UNAVAILABLE'].includes(answer?.status)) reasons.push('invalid-disposition');
  if (answer?.physicalExecutionAuthorized !== false) reasons.push('physical-authority-present');
  if (answer?.controllerOutputProduced !== false) reasons.push('controller-output-present');
  if (answer?.operationalRequirements?.sheetDrillingThisRound === true) reasons.push('s001-drilling-present');
  if (answer?.completionPreview?.physicalExecutionAuthority === true) reasons.push('completion-physical-authority-present');
  if (answer?.completionPreview?.operatorMayPromote === true) reasons.push('operator-promotion-present');
  return { ok: reasons.length === 0, reasons };
}

function estimateEnvelope(estimate) {
  if (!estimate || typeof estimate !== 'object') return null;
  return {
    status: estimate.status ?? null,
    totals: {
      material: estimate.material ?? null,
      cell_recovery: estimate.cellRecovery ?? null,
      hardware: estimate.hardware ?? null,
      Q: estimate.Q ?? null,
      Q_basis: estimate.Q_basis ?? null,
    },
    cycle: estimate.modeledTimeMin == null
      ? null
      : {
          model: estimate.cycleModel ?? null,
          basis: estimate.cycleBasis ?? null,
          measured: estimate.cycleMeasured === true,
          commissioned: false,
          T_job_min: estimate.modeledTimeMin,
        },
    note: estimate.note ?? null,
  };
}

function wrapperEnvelope({ answer, contract, project, candidateRevisionId, requestId, attemptId, payloadDigest, sentAt, receivedAt }) {
  const responseId = opaqueId();
  return {
    protocolVersion: PUBLISHED_PROJECT_PROTOCOL_VERSION,
    wrapperBuildId: PUBLISHED_PROJECT_CLIENT_ID,
    storePin: answer.storePin,
    requestId,
    projectId: project.projectId,
    candidateRevisionId,
    requestType: contract.requestType,
    scope: contract.scope,
    demandSignature: payloadDigest,
    querySignature: null,
    payloadDigest,
    attemptId,
    attemptNumber: 1,
    sentAt,
    wrapperRespondedAt: receivedAt,
    responseId,
    estimateAssociationId: null,
    rawOffering: null,
    rawEvaluation: {
      status: answer.status,
      lines: [{
        capability: {
          status: answer.status,
          missing: Array.isArray(answer.reasons) ? answer.reasons : [],
          envelope: answer.envelope ? { id: answer.envelope } : null,
        },
      }],
    },
    rawEstimate: estimateEnvelope(answer.estimate),
    attributedBasis: {
      envelope: answer.envelope ? { id: answer.envelope } : null,
      measured: answer.evidenceClass === 'MEASURED',
      commissioned: answer.commissioned === true,
      budgetaryEstimateIsNotAQuote: true,
      modeledTimeIsNotAMachineWorkPlan: true,
    },
    publishedJobAnswer: answer,
  };
}

async function persistPending({ localRecordId, project, requestRecord, attemptRecord, createdAt, actionId }) {
  return commitPreparedAppend({
    localRecordId,
    projectId: project.projectId,
    expectedHead: project.currentHead,
    createdAt,
    actionId,
    records: [requestRecord, attemptRecord],
    event: {
      localRecordId,
      projectId: project.projectId,
      kind: 'event',
      id: opaqueId(),
      requestId: requestRecord.id,
      attemptId: attemptRecord.id,
      createdAt,
      payload: { type: 'published-project-attempt-enqueued', terminal: false },
    },
  });
}

async function persistTerminal({ localRecordId, project, requestId, attemptId, createdAt, actionId, responseRecord, diagnostic = null, httpStatus = null }) {
  return commitPreparedAppend({
    localRecordId,
    projectId: project.projectId,
    expectedHead: project.currentHead,
    createdAt,
    actionId,
    records: responseRecord ? [responseRecord] : [],
    event: {
      localRecordId,
      projectId: project.projectId,
      kind: 'event',
      id: opaqueId(),
      requestId,
      attemptId,
      createdAt,
      payload: {
        type: 'published-project-attempt-terminal',
        terminal: true,
        diagnostic,
        httpStatus,
      },
    },
  });
}

export async function issuePublishedProjectQuestion(input) {
  const localRecordId = input.localRecordId;
  const project = await getProject(localRecordId);
  if (!project) throw new Error('published project Store question requires a committed project');
  const candidate = await currentCandidate(localRecordId);
  const projection = await currentProjection(localRecordId);
  if (!candidate || !projection || projection.payload?.valid !== true) {
    throw new Error('published project Store question requires a complete current projection');
  }
  const contract = publishedProjectForClass(project.classId);
  if (!contract) throw new Error('project class has no durable published-project Store contract');
  const candidateRevisionId = project.currentHead;
  const inputs = projectInputs(projection);
  const payload = { jobId: contract.jobId, inputs };
  const payloadDigest = await digestCanonical(payload);

  if (!input.refresh) {
    const duplicate = await findDuplicate(localRecordId, candidateRevisionId, contract.scope, payloadDigest);
    if (duplicate) {
      return { status: 'existing-request', requestId: duplicate.id, request: duplicate };
    }
  }

  const createdAt = nowIso(input.clock);
  const requestId = input.requestId ?? opaqueId();
  const attemptId = input.attemptId ?? opaqueId();
  const requestRecord = {
    localRecordId,
    projectId: project.projectId,
    kind: 'request',
    id: requestId,
    requestId,
    createdAt,
    payload: {
      requestType: contract.requestType,
      scope: contract.scope,
      protocolVersion: PUBLISHED_PROJECT_PROTOCOL_VERSION,
      expectedStorePin: contract.expectedStorePin,
      demandSignature: payloadDigest,
      querySignature: null,
      payload,
      payloadDigest,
      candidateRevisionId,
      requestSequence: await nextRequestSequence(localRecordId),
      path: PUBLISHED_PROJECT_PATH,
    },
  };
  const attemptRecord = {
    localRecordId,
    projectId: project.projectId,
    kind: 'attempt',
    id: attemptId,
    requestId,
    attemptId,
    createdAt,
    payload: { attemptNumber: 1, enqueuedAt: createdAt, sentAt: createdAt, timeoutMs: 10_000 },
  };

  await persistPending({
    localRecordId,
    project,
    requestRecord,
    attemptRecord,
    createdAt,
    actionId: input.actionId ?? `published-project-issue:${requestId}:${attemptId}`,
  });

  let httpStatus = null;
  let answer = null;
  try {
    const response = await transport()(PUBLISHED_PROJECT_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: canonicalJson(payload),
    });
    httpStatus = response.status;
    answer = await response.json();
  } catch {
    const receivedAt = nowIso(input.clock);
    await persistTerminal({
      localRecordId,
      project,
      requestId,
      attemptId,
      createdAt: receivedAt,
      actionId: `published-project-transport:${attemptId}:${receivedAt}`,
      diagnostic: 'PUBLISHED_PROJECT_TRANSPORT_ERROR',
    });
    return { status: 'transport', requestId, attemptId };
  }

  const receivedAt = nowIso(input.clock);
  const inspection = validateAnswer(answer, contract, inputs);
  if (httpStatus !== 200 || !inspection.ok) {
    const responseRecord = {
      localRecordId,
      projectId: project.projectId,
      kind: 'response',
      id: opaqueId(),
      requestId,
      attemptId,
      createdAt: receivedAt,
      payload: {
        receivedAt,
        diagnostic: 'PUBLISHED_PROJECT_RESPONSE_INVALID',
        validation: inspection,
        quarantined: true,
        publishedJobAnswer: answer,
      },
    };
    await persistTerminal({
      localRecordId,
      project,
      requestId,
      attemptId,
      createdAt: receivedAt,
      actionId: `published-project-invalid:${attemptId}:${receivedAt}`,
      responseRecord,
      diagnostic: 'PUBLISHED_PROJECT_RESPONSE_INVALID',
      httpStatus,
    });
    return { status: 'diagnostic', requestId, attemptId, inspection };
  }

  const envelope = wrapperEnvelope({
    answer,
    contract,
    project,
    candidateRevisionId,
    requestId,
    attemptId,
    payloadDigest,
    sentAt: createdAt,
    receivedAt,
  });
  const responseRecord = {
    localRecordId,
    projectId: project.projectId,
    kind: 'response',
    id: envelope.responseId,
    requestId,
    attemptId,
    createdAt: receivedAt,
    payload: {
      receivedAt,
      validation: { ok: true },
      quarantined: false,
      wrapperEnvelope: envelope,
      rawOffering: null,
      rawEvaluation: envelope.rawEvaluation,
      rawEstimate: envelope.rawEstimate,
      estimateAssociationId: null,
      attributedBasis: envelope.attributedBasis,
      storePin: envelope.storePin,
      protocolVersion: envelope.protocolVersion,
      publishedJobAnswer: answer,
    },
  };
  await persistTerminal({
    localRecordId,
    project,
    requestId,
    attemptId,
    createdAt: receivedAt,
    actionId: `published-project-success:${responseRecord.id}`,
    responseRecord,
    httpStatus,
  });

  const applicability = await currentStoreAnswer(localRecordId, {
    candidateRevisionId,
    scope: contract.scope,
  });
  return {
    status: applicability.current === true ? 'current' : 'historical',
    requestId,
    attemptId,
    responseId: responseRecord.id,
    applicability,
  };
}

export async function currentPublishedProjectAnswer(localRecordId) {
  const project = await getProject(localRecordId);
  if (!project) return { status: 'none', current: false, historical: false };
  const contract = publishedProjectForClass(project.classId);
  if (!contract) return { status: 'none', current: false, historical: false };
  return currentStoreAnswer(localRecordId, { candidateRevisionId: project.currentHead, scope: contract.scope });
}

export async function publishedProjectResponse(localRecordId, responseId) {
  return getRecord(localRecordId, 'response', responseId);
}
