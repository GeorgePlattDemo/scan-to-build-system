import {
  APP_BUILD_ID,
  FIXED_ORIGIN,
  REVIEW_ACTIONS,
  REVIEW_KIND,
  REVIEW_RECORD_TYPES,
  STORE_SCOPES,
} from '/shared/contracts.mjs';
import { presentStoreAnswer } from '/shared/store-present.mjs';
import {
  collectDisclosures,
  collectUnresolvedConditions,
  computeReviewDigest,
  evaluateReviewPredicate,
  reviewMatchesCurrent,
} from '/shared/review-digest.mjs';
import {
  RepositoryError,
  commitPreparedAppend,
  getProject,
  getRecord,
  listRecords,
} from '/data/repository.mjs';
import {
  currentCandidate,
  currentProjection,
  currentStoreAnswer,
  listProjectEvidence,
  listProjectObservations,
} from '/data/selectors.mjs';

export {
  collectDisclosures,
  collectUnresolvedConditions,
  computeReviewDigest,
  evaluateReviewPredicate,
  reviewMatchesCurrent,
} from '/shared/review-digest.mjs';

function requireString(name, value) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new RepositoryError('invalid-argument', `${name} is required`);
  }
  return value;
}

function opaqueId() {
  return crypto.randomUUID();
}

function classReferenceSlice(candidate) {
  const ref = candidate?.payload?.classReference ?? null;
  if (!ref) {
    return null;
  }
  return {
    classId: ref.classId ?? null,
    classVersion: ref.classVersion ?? null,
    ruleVersion: ref.ruleVersion ?? null,
  };
}

function documentaryReferenceFrom(candidate, observations) {
  const mapping = (candidate?.payload?.mappings ?? []).find(
    (entry) => entry.status === 'accepted' && entry.inputKey === 'finished length',
  );
  if (!mapping) {
    return null;
  }
  const observation = observations.find((record) => record.id === mapping.observationId);
  return observation?.payload?.documentaryReference ?? null;
}

function estimateIdentity(storeView, store) {
  const envelope = store?.response?.payload?.wrapperEnvelope ?? {};
  const estimate = storeView?.estimate ?? null;
  const associationId =
    store?.response?.payload?.estimateAssociationId ?? envelope.estimateAssociationId ?? null;
  return {
    estimateAssociationId: associationId,
    estimateStatus: estimate?.status ?? envelope.rawEstimate?.status ?? null,
    estimateQ: estimate?.available === true ? estimate.q : null,
  };
}

export async function assembleReviewSnapshot(localRecordId, { unapplied = false } = {}) {
  const project = await getProject(localRecordId);
  if (!project) {
    return null;
  }
  const candidate = await currentCandidate(localRecordId);
  const projection = await currentProjection(localRecordId);
  const evidence = await listProjectEvidence(localRecordId);
  const observations = await listProjectObservations(localRecordId);
  const store = await currentStoreAnswer(localRecordId, {
    candidateRevisionId: project.currentHead,
    scope: STORE_SCOPES.BOARD_SQUARE_V1,
  });
  const storeView = presentStoreAnswer(store, {
    unapplied,
    projectionValid: projection?.payload?.valid === true,
    candidateRevisionId: project.currentHead,
  });
  const imported =
    store?.imported === true ||
    store?.request?.imported === true ||
    store?.response?.imported === true;
  const documentaryReference = documentaryReferenceFrom(candidate, observations);
  const mappings = (candidate?.payload?.mappings ?? [])
    .filter((entry) => entry.status === 'accepted')
    .map((entry) => {
      const observation = observations.find((record) => record.id === entry.observationId);
      return {
        observationId: entry.observationId,
        inputKey: entry.inputKey,
        status: entry.status,
        method: observation?.payload?.method ?? null,
        documentaryPin: observation?.payload?.documentaryReference?.pin ?? null,
      };
    });
  const envelope = store.response?.payload?.wrapperEnvelope ?? {};
  const estimate = estimateIdentity(storeView, store);
  const snapshotWithoutDigest = {
    projectId: project.projectId,
    candidateRevisionId: project.currentHead,
    projectionId: candidate?.payload?.projectionId ?? null,
    occurrenceIds: [...(candidate?.payload?.activeOccurrenceIds ?? [])],
    definitionRevisionIds: candidate?.payload?.definitionRevisionId
      ? [candidate.payload.definitionRevisionId]
      : [],
    definitionKind: candidate?.payload?.definitionKind ?? projection?.payload?.definitionKind ?? null,
    ruleVersion: candidate?.payload?.ruleVersion ?? projection?.payload?.ruleVersion ?? null,
    classReference: classReferenceSlice(candidate),
    evidenceIds: evidence.map((record) => record.id),
    observationIds: observations.map((record) => record.id),
    mappings,
    requestId: store.request?.id ?? null,
    attemptId: store.attempt?.id ?? null,
    responseId: store.response?.id ?? null,
    estimateAssociationId: estimate.estimateAssociationId,
    demandSignature: store.request?.payload?.demandSignature ?? null,
    payloadDigest: store.request?.payload?.payloadDigest ?? null,
    storePin: store.response?.payload?.storePin ?? envelope.storePin ?? null,
    storeDisposition: storeView.dispositionEnum ?? null,
    estimateStatus: estimate.estimateStatus,
    estimateQ: estimate.estimateQ,
    disclosures: collectDisclosures({ projection, storeView, documentaryReference }),
    unresolvedConditions: collectUnresolvedConditions({
      projection,
      store,
      storeView,
      imported,
    }),
  };
  const reviewDigest = await computeReviewDigest(snapshotWithoutDigest);
  const snapshot = { ...snapshotWithoutDigest, reviewDigest };
  const assembled = {
    project,
    candidate,
    projection,
    evidence,
    observations,
    store,
    storeView,
    documentaryReference,
    unapplied,
    imported,
    snapshot,
  };
  assembled.predicate = evaluateReviewPredicate(assembled);
  return assembled;
}

async function recoverReview(localRecordId, actionId, result) {
  const project = await getProject(localRecordId);
  const action = await getRecord(localRecordId, 'action', actionId);
  const eventId = action?.payload?.eventId ?? null;
  const event = eventId ? await getRecord(localRecordId, 'event', eventId) : null;
  const reviewId = event?.payload?.reviewId ?? null;
  const review = reviewId ? await getRecord(localRecordId, REVIEW_KIND, reviewId) : null;
  return {
    status: result.status,
    localRecordId,
    projectId: project?.projectId ?? null,
    currentHead: project?.currentHead ?? null,
    actionId,
    eventId,
    reviewId,
    project,
    action,
    event,
    review,
  };
}

async function persistReview({
  localRecordId,
  actionId,
  createdAt,
  action,
  assembled,
}) {
  const existingAction = await getRecord(localRecordId, 'action', actionId);
  if (existingAction) {
    return recoverReview(localRecordId, actionId, { status: 'idempotent' });
  }

  const project = assembled.project;
  const type =
    action === REVIEW_ACTIONS.CONFIRM_DEFINITION
      ? REVIEW_RECORD_TYPES.DefinitionReviewRecorded
      : REVIEW_RECORD_TYPES.UnresolvedDefinitionAcknowledged;
  const reviewId = opaqueId();
  const eventId = opaqueId();
  const snapshot = assembled.snapshot;
  const reviewRecord = {
    localRecordId,
    projectId: project.projectId,
    kind: REVIEW_KIND,
    id: reviewId,
    createdAt,
    payload: {
      type,
      action,
      projectId: snapshot.projectId,
      candidateRevisionId: snapshot.candidateRevisionId,
      projectionId: snapshot.projectionId,
      occurrenceIds: [...snapshot.occurrenceIds],
      definitionRevisionIds: [...snapshot.definitionRevisionIds],
      definitionKind: snapshot.definitionKind,
      ruleVersion: snapshot.ruleVersion,
      classReference: snapshot.classReference,
      evidenceIds: [...snapshot.evidenceIds],
      observationIds: [...snapshot.observationIds],
      mappings: [...snapshot.mappings],
      requestId: snapshot.requestId,
      attemptId: snapshot.attemptId,
      responseId: snapshot.responseId,
      estimateAssociationId: snapshot.estimateAssociationId,
      demandSignature: snapshot.demandSignature,
      payloadDigest: snapshot.payloadDigest,
      storePin: snapshot.storePin,
      storeDisposition: snapshot.storeDisposition,
      estimateStatus: snapshot.estimateStatus,
      estimateQ: snapshot.estimateQ,
      disclosures: [...snapshot.disclosures],
      unresolvedConditions: [...snapshot.unresolvedConditions],
      reviewDigest: snapshot.reviewDigest,
      actorContext: assembled.candidate?.payload?.actorContext ?? null,
      imported: false,
      origin: 'local-application',
      authority: false,
      commercial: false,
      physical: false,
      localContext: {
        origin: FIXED_ORIGIN,
        appBuildId: APP_BUILD_ID,
      },
    },
  };

  const result = await commitPreparedAppend({
    localRecordId,
    projectId: project.projectId,
    createdAt,
    expectedHead: project.currentHead,
    actionId,
    records: [reviewRecord],
    event: {
      localRecordId,
      projectId: project.projectId,
      kind: 'event',
      id: eventId,
      createdAt,
      payload: {
        type,
        reviewId,
        action,
        candidateRevisionId: snapshot.candidateRevisionId,
        reviewDigest: snapshot.reviewDigest,
        authority: false,
        commercial: false,
        physical: false,
      },
    },
  });

  return recoverReview(localRecordId, actionId, result);
}

export async function recordDefinitionReview(input) {
  const localRecordId = requireString('localRecordId', input.localRecordId);
  const actionId = requireString('actionId', input.actionId);
  const createdAt = requireString('createdAt', input.createdAt);
  const unapplied = input.unapplied === true;
  const existingAction = await getRecord(localRecordId, 'action', actionId);
  if (existingAction) {
    return recoverReview(localRecordId, actionId, { status: 'idempotent' });
  }
  const assembled = await assembleReviewSnapshot(localRecordId, { unapplied });
  if (!assembled) {
    throw new RepositoryError('not-found', 'Review requires a project');
  }
  if (!assembled.predicate.completeSupportedReviewAvailable) {
    throw new RepositoryError(
      'review-not-supported',
      'A complete supported review is not available for this revision',
    );
  }
  return persistReview({
    localRecordId,
    actionId,
    createdAt,
    action: REVIEW_ACTIONS.CONFIRM_DEFINITION,
    assembled,
  });
}

export async function acknowledgeUnresolvedDefinition(input) {
  const localRecordId = requireString('localRecordId', input.localRecordId);
  const actionId = requireString('actionId', input.actionId);
  const createdAt = requireString('createdAt', input.createdAt);
  const unapplied = input.unapplied === true;
  const existingAction = await getRecord(localRecordId, 'action', actionId);
  if (existingAction) {
    return recoverReview(localRecordId, actionId, { status: 'idempotent' });
  }
  const assembled = await assembleReviewSnapshot(localRecordId, { unapplied });
  if (!assembled) {
    throw new RepositoryError('not-found', 'Review requires a project');
  }
  if (!assembled.predicate.unresolvedAcknowledgmentAvailable) {
    throw new RepositoryError(
      'review-not-unresolved',
      assembled.predicate.completeSupportedReviewAvailable
        ? 'Use Confirm this definition for a complete supported review'
        : 'Unresolved acknowledgment is not available',
    );
  }
  return persistReview({
    localRecordId,
    actionId,
    createdAt,
    action: REVIEW_ACTIONS.ACKNOWLEDGE_UNRESOLVED,
    assembled,
  });
}

export async function listReviewRecords(localRecordId) {
  const records = await listRecords(localRecordId, REVIEW_KIND);
  return [...records].sort((left, right) => {
    if (left.createdAt === right.createdAt) {
      return left.id < right.id ? -1 : 1;
    }
    return left.createdAt < right.createdAt ? -1 : 1;
  });
}
