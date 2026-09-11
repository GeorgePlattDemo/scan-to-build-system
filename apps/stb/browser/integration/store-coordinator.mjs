import {
  PUBLISHED_BOARD_SKU,
  PUBLISHED_SHEET_SKU,
  STORE_REQUEST_TYPES,
  STORE_SCOPES,
} from '/shared/contracts.mjs';
import { boardJobPayload, sheetJobPayload } from '/shared/store-wire.mjs';
import {
  issueStoreQuestion,
  recoverInterruptedAttempts,
  retryStoreAttempt,
} from '/integration/store-client.mjs';
import { currentProjection, currentStoreAnswer, projectIndex } from '/data/selectors.mjs';

const inFlight = new Map();
const recovered = new Set();

function scheduleKey(localRecordId, candidateRevisionId) {
  return `${localRecordId}:${candidateRevisionId}`;
}

export async function recoverStoreOnOpen(localRecordId) {
  if (!localRecordId || recovered.has(localRecordId)) {
    return [];
  }
  recovered.add(localRecordId);
  return recoverInterruptedAttempts(localRecordId);
}

export async function scheduleBoardStoreQuestion(localRecordId, { unapplied = false } = {}) {
  if (!localRecordId || unapplied) {
    return { status: 'skipped' };
  }
  const project = await projectIndex(localRecordId);
  if (!project) {
    return { status: 'no-project' };
  }
  const projection = await currentProjection(localRecordId);
  if (!projection?.payload?.valid) {
    return { status: 'incomplete' };
  }
  if (project.unknownClass === true) {
    return { status: 'unknown-class' };
  }
  const candidateRevisionId = project.currentHead;
  const keptLengthCanonical = projection.payload.geometry?.lengthCanonical;
  const occurrenceId = projection.payload.occurrenceId;
  if (!keptLengthCanonical || !occurrenceId) {
    return { status: 'incomplete' };
  }

  const existing = await currentStoreAnswer(localRecordId, {
    candidateRevisionId,
    scope: STORE_SCOPES.BOARD_SQUARE_V1,
  });
  if (existing?.request && existing.imported !== true && existing.request.imported !== true) {
    return {
      status: 'existing-request',
      requestId: existing.request.id,
      applicability: existing,
    };
  }

  const key = scheduleKey(localRecordId, candidateRevisionId);
  if (inFlight.has(key)) {
    return inFlight.get(key);
  }

  const work = issueStoreQuestion({
    localRecordId,
    projectId: project.projectId,
    candidateRevisionId,
    requestType: STORE_REQUEST_TYPES.BOARD_SQUARE_V1,
    payload: boardJobPayload({
      lineId: occurrenceId,
      storeSku: PUBLISHED_BOARD_SKU,
      keptLengthCanonical,
    }),
    background: true,
  }).then((result) => {
    inFlight.delete(key);
    return result;
  });
  inFlight.set(key, work);
  return work;
}

export async function retryCurrentStore(localRecordId, requestId) {
  if (!localRecordId || !requestId) {
    throw new Error('Store retry requires a request');
  }
  return retryStoreAttempt({ localRecordId, requestId, background: true });
}

export async function scheduleSheetStoreQuestion(localRecordId, { unapplied = false } = {}) {
  if (!localRecordId || unapplied) {
    return { status: 'skipped' };
  }
  const project = await projectIndex(localRecordId);
  if (!project) {
    return { status: 'no-project' };
  }
  const projection = await currentProjection(localRecordId);
  if (projection?.payload?.definitionKind !== 'sheet.mode2.stencil.v1') {
    return { status: 'not-sheet' };
  }
  if (!projection?.payload?.valid) {
    return { status: 'incomplete' };
  }
  if (project.unknownClass === true) {
    return { status: 'unknown-class' };
  }
  const candidateRevisionId = project.currentHead;
  const occurrenceId = projection.payload.occurrenceId;
  const geometry = projection.payload.geometry ?? {};
  if (!occurrenceId || !geometry.lengthCanonical || !geometry.widthCanonical) {
    return { status: 'incomplete' };
  }

  const existing = await currentStoreAnswer(localRecordId, {
    candidateRevisionId,
    scope: STORE_SCOPES.SHEET_MODE2_STENCIL_V1,
  });
  if (existing?.request && existing.imported !== true && existing.request.imported !== true) {
    return {
      status: 'existing-request',
      requestId: existing.request.id,
      applicability: existing,
    };
  }

  const key = scheduleKey(localRecordId, candidateRevisionId);
  if (inFlight.has(key)) {
    return inFlight.get(key);
  }

  const work = issueStoreQuestion({
    localRecordId,
    projectId: project.projectId,
    candidateRevisionId,
    requestType: STORE_REQUEST_TYPES.SHEET_MODE2_STENCIL_V1,
    payload: sheetJobPayload({
      lineId: occurrenceId,
      storeSku: PUBLISHED_SHEET_SKU,
      profileKind: geometry.profileKind,
      blankLengthCanonical: geometry.lengthCanonical,
      blankWidthCanonical: geometry.widthCanonical,
      tabCount: geometry.tabCount,
      routeDepthCanonical: geometry.routeDepthCanonical,
    }),
    background: true,
  }).then((result) => {
    inFlight.delete(key);
    return result;
  });
  inFlight.set(key, work);
  return work;
}
