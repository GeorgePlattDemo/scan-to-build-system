import {
  MAX_STORE_RESPONSE_BYTES,
  STORE_CLIENT_TIMEOUT_MS,
  STORE_PATHS,
  STORE_PIN,
  STORE_PROTOCOL_VERSION,
  STORE_REQUEST_TYPES,
  STORE_SCOPES,
} from '/shared/contracts.mjs';
import { canonicalEqual, canonicalJson } from '/shared/canonical.mjs';
import {
  APP_DIAGNOSTICS,
  boardDemandSignature,
  buildJobRequest,
  buildOfferingRequest,
  buildSheetJobRequest,
  inspectStoreResponse,
  sheetDemandSignature,
} from '/shared/store-wire.mjs';
import {
  commitPreparedAppend,
  getProject,
  getRecord,
  getRecordsByRequestAttempt,
  listRecords,
} from '/data/repository.mjs';
import { currentStoreAnswer } from '/data/selectors.mjs';

let activeTransport = null;

export function setStoreTransport(fn) {
  activeTransport = fn;
}

export function resetStoreTransport() {
  activeTransport = null;
}

function transport() {
  if (activeTransport) {
    return activeTransport;
  }
  return globalThis.fetch.bind(globalThis);
}

function opaqueId() {
  return crypto.randomUUID();
}

function nowIso(clock) {
  if (typeof clock === 'function') {
    return clock();
  }
  return new Date().toISOString();
}

function pathForRequestType(requestType) {
  if (requestType === STORE_REQUEST_TYPES.OFFERING_LOOKUP) {
    return STORE_PATHS.offering;
  }
  return STORE_PATHS.job;
}

function comparableAnswer(payload) {
  return {
    storePin: payload.storePin ?? null,
    requestId: payload.requestId ?? null,
    attemptId: payload.attemptId ?? null,
    payloadDigest: payload.payloadDigest ?? null,
    rawOffering: payload.rawOffering ?? null,
    rawEvaluation: payload.rawEvaluation ?? null,
    rawEstimate: payload.rawEstimate ?? null,
  };
}

async function nextRequestSequence(localRecordId) {
  const requests = await listRecords(localRecordId, 'request');
  let max = 0;
  for (const record of requests) {
    const value = record.payload?.requestSequence ?? 0;
    if (value > max) {
      max = value;
    }
  }
  return max + 1;
}

async function nextAttemptNumber(localRecordId, requestId) {
  const attempts = (await listRecords(localRecordId, 'attempt')).filter(
    (record) => record.requestId === requestId,
  );
  let max = 0;
  for (const record of attempts) {
    const value = record.payload?.attemptNumber ?? 0;
    if (value > max) {
      max = value;
    }
  }
  return max + 1;
}

async function findDuplicateRequest(localRecordId, candidateRevisionId, scope, payloadDigest) {
  const requests = await listRecords(localRecordId, 'request');
  const matches = requests.filter(
    (record) =>
      record.imported !== true &&
      record.payload?.candidateRevisionId === candidateRevisionId &&
      record.payload?.scope === scope &&
      record.payload?.payloadDigest === payloadDigest,
  );
  matches.sort((left, right) => (left.payload?.requestSequence ?? 0) - (right.payload?.requestSequence ?? 0));
  return matches.at(-1) ?? null;
}

async function persistAppend(input) {
  return commitPreparedAppend(input);
}

export async function recoverInterruptedAttempts(localRecordId, { clock } = {}) {
  const project = await getProject(localRecordId);
  if (!project) {
    return [];
  }
  const attempts = await listRecords(localRecordId, 'attempt');
  const recovered = [];
  for (const attempt of attempts) {
    const requestId = attempt.requestId;
    if (!requestId) {
      continue;
    }
    const related = await getRecordsByRequestAttempt(localRecordId, requestId, attempt.id);
    const terminal = related.some(
      (record) => record.kind === 'event' && record.payload?.terminal === true,
    );
    if (terminal) {
      continue;
    }
    const createdAt = nowIso(clock);
    await persistAppend({
      localRecordId,
      projectId: project.projectId,
      createdAt,
      actionId: `store-interrupt:${attempt.id}`,
      records: [],
      event: {
        localRecordId,
        projectId: project.projectId,
        kind: 'event',
        id: opaqueId(),
        requestId,
        attemptId: attempt.id,
        createdAt,
        payload: {
          type: 'attempt-terminal',
          terminal: true,
          diagnostic: APP_DIAGNOSTICS.APP_ATTEMPT_INTERRUPTED,
        },
      },
    });
    recovered.push(attempt.id);
  }
  return recovered;
}

async function persistPending({
  localRecordId,
  projectId,
  requestRecord,
  attemptRecord,
  createdAt,
  actionId,
}) {
  await persistAppend({
    localRecordId,
    projectId,
    createdAt,
    actionId,
    records: [requestRecord, attemptRecord].filter(Boolean),
    event: {
      localRecordId,
      projectId,
      kind: 'event',
      id: opaqueId(),
      requestId: attemptRecord.requestId,
      attemptId: attemptRecord.id,
      createdAt,
      payload: {
        type: 'attempt-enqueued',
        terminal: false,
      },
    },
  });
}

async function persistTerminal({
  localRecordId,
  projectId,
  requestId,
  attemptId,
  createdAt,
  diagnostic,
  records,
  actionId,
  httpStatus,
}) {
  return persistAppend({
    localRecordId,
    projectId,
    createdAt,
    actionId,
    records: records ?? [],
    event: {
      localRecordId,
      projectId,
      kind: 'event',
      id: opaqueId(),
      requestId,
      attemptId,
      createdAt,
      payload: {
        type: 'attempt-terminal',
        terminal: true,
        diagnostic: diagnostic ?? null,
        httpStatus: httpStatus ?? null,
      },
    },
  });
}

async function existingUsableResponse(localRecordId, requestId, attemptId) {
  const related = await getRecordsByRequestAttempt(localRecordId, requestId, attemptId);
  return (
    related.find(
      (record) =>
        record.kind === 'response' &&
        record.payload?.validation?.ok === true &&
        record.payload?.quarantined !== true,
    ) ?? null
  );
}

async function handleFetchedBody({
  localRecordId,
  projectId,
  wire,
  httpStatus,
  bytes,
  receivedAt,
}) {
  let parsed = null;
  let jsonFailed = false;
  const prefix = new TextDecoder().decode(bytes.slice(0, 4096));
  if (bytes.byteLength > MAX_STORE_RESPONSE_BYTES) {
    await persistTerminal({
      localRecordId,
      projectId,
      requestId: wire.requestId,
      attemptId: wire.attemptId,
      createdAt: receivedAt,
      diagnostic: APP_DIAGNOSTICS.APP_MALFORMED_RESPONSE,
      httpStatus,
      actionId: `store-malformed:${wire.attemptId}:${receivedAt}`,
      records: [
        {
          localRecordId,
          projectId,
          kind: 'response',
          id: opaqueId(),
          requestId: wire.requestId,
          attemptId: wire.attemptId,
          createdAt: receivedAt,
          payload: {
            receivedAt,
            diagnostic: APP_DIAGNOSTICS.APP_MALFORMED_RESPONSE,
            validation: { ok: false, reason: 'oversized' },
            quarantined: true,
            incomplete: true,
            inertPrefix: prefix,
          },
        },
      ],
    });
    return { status: 'malformed', diagnostic: APP_DIAGNOSTICS.APP_MALFORMED_RESPONSE };
  }

  try {
    parsed = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    jsonFailed = true;
  }

  if (jsonFailed) {
    await persistTerminal({
      localRecordId,
      projectId,
      requestId: wire.requestId,
      attemptId: wire.attemptId,
      createdAt: receivedAt,
      diagnostic: APP_DIAGNOSTICS.APP_MALFORMED_RESPONSE,
      httpStatus,
      actionId: `store-malformed:${wire.attemptId}:${receivedAt}`,
      records: [
        {
          localRecordId,
          projectId,
          kind: 'response',
          id: opaqueId(),
          requestId: wire.requestId,
          attemptId: wire.attemptId,
          createdAt: receivedAt,
          payload: {
            receivedAt,
            diagnostic: APP_DIAGNOSTICS.APP_MALFORMED_RESPONSE,
            validation: { ok: false, reason: 'invalid-json' },
            quarantined: true,
            inertPrefix: prefix,
          },
        },
      ],
    });
    return { status: 'malformed', diagnostic: APP_DIAGNOSTICS.APP_MALFORMED_RESPONSE };
  }

  const inspection = inspectStoreResponse(wire, parsed, {
    httpStatus,
    byteLength: bytes.byteLength,
  });

  if (!inspection.ok) {
    const diagnostic = inspection.diagnostic;
    await persistTerminal({
      localRecordId,
      projectId,
      requestId: wire.requestId,
      attemptId: wire.attemptId,
      createdAt: receivedAt,
      diagnostic,
      httpStatus,
      actionId: `store-diag:${wire.attemptId}:${diagnostic}:${receivedAt}`,
      records: [
        {
          localRecordId,
          projectId,
          kind: 'response',
          id: opaqueId(),
          requestId: wire.requestId,
          attemptId: wire.attemptId,
          createdAt: receivedAt,
          payload: {
            receivedAt,
            diagnostic,
            validation: inspection,
            quarantined: true,
            wrapperEnvelope: parsed,
          },
        },
      ],
    });
    return { status: 'diagnostic', diagnostic, inspection };
  }

  const existing = await existingUsableResponse(localRecordId, wire.requestId, wire.attemptId);
  if (existing) {
    const same = canonicalEqual(comparableAnswer(existing.payload.wrapperEnvelope ?? {}), comparableAnswer(parsed));
    if (same) {
      return { status: 'idempotent', response: existing };
    }
    await persistTerminal({
      localRecordId,
      projectId,
      requestId: wire.requestId,
      attemptId: wire.attemptId,
      createdAt: receivedAt,
      diagnostic: APP_DIAGNOSTICS.APP_CORRELATION_ERROR,
      httpStatus,
      actionId: `store-conflict:${wire.attemptId}:${receivedAt}`,
      records: [
        {
          localRecordId,
          projectId,
          kind: 'response',
          id: opaqueId(),
          requestId: wire.requestId,
          attemptId: wire.attemptId,
          createdAt: receivedAt,
          payload: {
            receivedAt,
            diagnostic: APP_DIAGNOSTICS.APP_CORRELATION_ERROR,
            validation: { ok: false, reason: 'conflicting-duplicate' },
            quarantined: true,
            wrapperEnvelope: parsed,
          },
        },
      ],
    });
    return { status: 'conflict', diagnostic: APP_DIAGNOSTICS.APP_CORRELATION_ERROR, response: existing };
  }

  const responseRecord = {
    localRecordId,
    projectId,
    kind: 'response',
    id: parsed.responseId ?? opaqueId(),
    requestId: wire.requestId,
    attemptId: wire.attemptId,
    createdAt: receivedAt,
    payload: {
      receivedAt,
      validation: { ok: true },
      quarantined: false,
      wrapperEnvelope: parsed,
      rawOffering: parsed.rawOffering ?? null,
      rawEvaluation: parsed.rawEvaluation ?? null,
      rawEstimate: parsed.rawEstimate ?? null,
      estimateAssociationId: parsed.estimateAssociationId ?? null,
      attributedBasis: parsed.attributedBasis ?? null,
      storePin: parsed.storePin,
      protocolVersion: parsed.protocolVersion,
    },
  };
  const extra = [];
  if (parsed.estimateAssociationId) {
    extra.push({
      localRecordId,
      projectId,
      kind: 'estimate-association',
      id: parsed.estimateAssociationId,
      requestId: wire.requestId,
      attemptId: wire.attemptId,
      createdAt: receivedAt,
      payload: {
        responseId: responseRecord.id,
        candidateRevisionId: wire.candidateRevisionId,
        digest: parsed.mappedCallInputs?.estimateDigest ?? null,
      },
    });
  }
  await persistTerminal({
    localRecordId,
    projectId,
    requestId: wire.requestId,
    attemptId: wire.attemptId,
    createdAt: receivedAt,
    diagnostic: null,
    httpStatus,
    actionId: `store-success:${responseRecord.id}`,
    records: [responseRecord, ...extra],
  });
  const applicability = await currentStoreAnswer(localRecordId, {
    candidateRevisionId: wire.candidateRevisionId,
    scope: wire.scope,
  });
  const thisAttemptCurrent =
    applicability.current === true && applicability.attempt?.id === wire.attemptId;
  return {
    status: thisAttemptCurrent ? 'current' : 'historical',
    response: responseRecord,
    applicability,
  };
}

async function dispatchAttempt({ localRecordId, projectId, wire, clock }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), STORE_CLIENT_TIMEOUT_MS);
  try {
    const response = await transport()(pathForRequestType(wire.requestType), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: canonicalJson(wire),
      signal: controller.signal,
    });
    const buffer = await response.arrayBuffer();
    const receivedAt = nowIso(clock);
    return handleFetchedBody({
      localRecordId,
      projectId,
      wire,
      httpStatus: response.status,
      bytes: new Uint8Array(buffer),
      receivedAt,
    });
  } catch {
    const createdAt = nowIso(clock);
    await persistTerminal({
      localRecordId,
      projectId,
      requestId: wire.requestId,
      attemptId: wire.attemptId,
      createdAt,
      diagnostic: APP_DIAGNOSTICS.APP_TRANSPORT_ERROR,
      actionId: `store-transport:${wire.attemptId}:${createdAt}`,
      records: [
        {
          localRecordId,
          projectId,
          kind: 'response',
          id: opaqueId(),
          requestId: wire.requestId,
          attemptId: wire.attemptId,
          createdAt,
          payload: {
            receivedAt: createdAt,
            diagnostic: APP_DIAGNOSTICS.APP_TRANSPORT_ERROR,
            validation: { ok: false, reason: 'transport' },
            quarantined: true,
          },
        },
      ],
    });
    return { status: 'transport', diagnostic: APP_DIAGNOSTICS.APP_TRANSPORT_ERROR };
  } finally {
    clearTimeout(timer);
  }
}

export async function issueStoreQuestion(input) {
  const localRecordId = input.localRecordId;
  const project = await getProject(localRecordId);
  if (!project) {
    throw new Error('Store question requires a committed project');
  }
  const projectId = input.projectId ?? project.projectId;
  const candidateRevisionId = input.candidateRevisionId ?? project.currentHead;
  const requestType = input.requestType;
  const payload = input.payload;
  const createdAt = nowIso(input.clock);
  const requestId = input.requestId ?? opaqueId();
  const attemptId = input.attemptId ?? opaqueId();

  let wire;
  if (requestType === STORE_REQUEST_TYPES.OFFERING_LOOKUP) {
    wire = await buildOfferingRequest({
      requestId,
      projectId,
      candidateRevisionId,
      attemptId,
      attemptNumber: 1,
      sentAt: createdAt,
      payload,
    });
  } else if (requestType === STORE_REQUEST_TYPES.BOARD_SQUARE_V1) {
    const demandSignature = input.demandSignature ?? (await boardDemandSignature(payload));
    wire = await buildJobRequest({
      requestId,
      projectId,
      candidateRevisionId,
      attemptId,
      attemptNumber: 1,
      sentAt: createdAt,
      demandSignature,
      payload,
    });
  } else if (requestType === STORE_REQUEST_TYPES.SHEET_MODE2_STENCIL_V1) {
    const demandSignature = input.demandSignature ?? (await sheetDemandSignature(payload));
    wire = await buildSheetJobRequest({
      requestId,
      projectId,
      candidateRevisionId,
      attemptId,
      attemptNumber: 1,
      sentAt: createdAt,
      demandSignature,
      payload,
    });
  } else {
    throw new Error('unsupported Store requestType');
  }

  if (!input.refresh) {
    const duplicate = await findDuplicateRequest(
      localRecordId,
      candidateRevisionId,
      wire.scope,
      wire.payloadDigest,
    );
    if (duplicate) {
      return {
        status: 'existing-request',
        requestId: duplicate.id,
        request: duplicate,
      };
    }
  }

  const requestSequence = await nextRequestSequence(localRecordId);
  const requestRecord = {
    localRecordId,
    projectId,
    kind: 'request',
    id: wire.requestId,
    requestId: wire.requestId,
    createdAt,
    payload: {
      requestType: wire.requestType,
      scope: wire.scope,
      protocolVersion: STORE_PROTOCOL_VERSION,
      expectedStorePin: STORE_PIN,
      demandSignature: wire.demandSignature,
      querySignature: wire.querySignature,
      payload: wire.payload,
      payloadDigest: wire.payloadDigest,
      candidateRevisionId,
      occurrenceLineCorrelation: input.occurrenceLineCorrelation ?? null,
      requestSequence,
      path: pathForRequestType(wire.requestType),
    },
  };
  const attemptRecord = {
    localRecordId,
    projectId,
    kind: 'attempt',
    id: wire.attemptId,
    requestId: wire.requestId,
    attemptId: wire.attemptId,
    createdAt,
    payload: {
      attemptNumber: 1,
      enqueuedAt: createdAt,
      sentAt: wire.sentAt,
      timeoutMs: STORE_CLIENT_TIMEOUT_MS,
    },
  };

  await persistPending({
    localRecordId,
    projectId,
    requestRecord,
    attemptRecord,
    createdAt,
    actionId: input.actionId ?? `store-issue:${wire.requestId}:${wire.attemptId}`,
  });

  const dispatch = dispatchAttempt({ localRecordId, projectId, wire, clock: input.clock });
  if (input.background) {
    return {
      status: 'pending',
      requestId: wire.requestId,
      attemptId: wire.attemptId,
      attemptNumber: 1,
      done: dispatch,
    };
  }
  const result = await dispatch;
  return {
    ...result,
    requestId: wire.requestId,
    attemptId: wire.attemptId,
    attemptNumber: 1,
  };
}

export async function retryStoreAttempt({ localRecordId, requestId, actionId, clock, background } = {}) {
  const project = await getProject(localRecordId);
  if (!project) {
    throw new Error('Store retry requires a committed project');
  }
  const request = await getRecord(localRecordId, 'request', requestId);
  if (!request) {
    throw new Error('Store retry requires the original request');
  }
  const createdAt = nowIso(clock);
  const attemptId = crypto.randomUUID();
  const attemptNumber = await nextAttemptNumber(localRecordId, requestId);
  const payload = request.payload.payload;
  let wire;
  if (request.payload.requestType === STORE_REQUEST_TYPES.OFFERING_LOOKUP) {
    wire = await buildOfferingRequest({
      requestId,
      projectId: project.projectId,
      candidateRevisionId: request.payload.candidateRevisionId,
      attemptId,
      attemptNumber,
      sentAt: createdAt,
      payload,
    });
  } else if (request.payload.requestType === STORE_REQUEST_TYPES.SHEET_MODE2_STENCIL_V1) {
    wire = await buildSheetJobRequest({
      requestId,
      projectId: project.projectId,
      candidateRevisionId: request.payload.candidateRevisionId,
      attemptId,
      attemptNumber,
      sentAt: createdAt,
      demandSignature: request.payload.demandSignature,
      payload,
    });
  } else {
    wire = await buildJobRequest({
      requestId,
      projectId: project.projectId,
      candidateRevisionId: request.payload.candidateRevisionId,
      attemptId,
      attemptNumber,
      sentAt: createdAt,
      demandSignature: request.payload.demandSignature,
      payload,
    });
  }

  const attemptRecord = {
    localRecordId,
    projectId: project.projectId,
    kind: 'attempt',
    id: attemptId,
    requestId,
    attemptId,
    createdAt,
    payload: {
      attemptNumber,
      enqueuedAt: createdAt,
      sentAt: wire.sentAt,
      timeoutMs: STORE_CLIENT_TIMEOUT_MS,
    },
  };

  await persistPending({
    localRecordId,
    projectId: project.projectId,
    requestRecord: null,
    attemptRecord,
    createdAt,
    actionId: actionId ?? `store-retry:${requestId}:${attemptId}`,
  });

  const dispatch = dispatchAttempt({
    localRecordId,
    projectId: project.projectId,
    wire,
    clock,
  });
  if (background) {
    return {
      status: 'pending',
      requestId,
      attemptId,
      attemptNumber,
      done: dispatch,
    };
  }
  const result = await dispatch;
  return {
    ...result,
    requestId,
    attemptId,
    attemptNumber,
  };
}

export async function ingestStoreHttpResult(input) {
  return handleFetchedBody(input);
}

export { STORE_SCOPES, currentStoreAnswer };
