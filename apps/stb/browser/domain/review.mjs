import {
  APP_BUILD_ID,
  FIXED_ORIGIN,
  REVIEW_ACTIONS,
  REVIEW_KIND,
  REVIEW_RECORD_TYPES,
  STORE_SCOPES,
  USER_DEFINED_BOARD_DEFINITION,
} from '/shared/contracts.mjs';
import { S001_CENTERED_ARCH_CLASS_ID } from '/shared/class-config.mjs';
import { presentStoreAnswer } from '/shared/store-present.mjs';
import {
  calculationIdentityFromEnvelope,
  compareStoreCalculationIdentities,
} from '/shared/store-calculation-identity.mjs';
import { retryStoreAttempt } from '/integration/store-client.mjs';
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

function storeScopeForProject(project, candidate, projection) {
  if (project?.classId === S001_CENTERED_ARCH_CLASS_ID) {
    return 'SHEET_MODE2_ARCHED_APERTURE_V0';
  }
  const definitionKind =
    candidate?.payload?.definitionKind ??
    projection?.payload?.definitionKind ??
    null;
  if (definitionKind === USER_DEFINED_BOARD_DEFINITION.kind) {
    return STORE_SCOPES.USER_DEFINED_BOARD_V1;
  }
  return STORE_SCOPES.BOARD_SQUARE_V1;
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
  const calculationIdentity = calculationIdentityFromEnvelope(envelope);
  return {
    estimateAssociationId: associationId,
    estimateStatus: estimate?.status ?? envelope.rawEstimate?.status ?? null,
    estimateQ: estimate?.available === true ? estimate.q : null,
    calculationIdentity,
  };
}

function candidateDefinitionRevisionIds(candidate) {
  const ids = candidate?.payload?.definitionRevisionIds;
  if (Array.isArray(ids)) {
    return [...ids];
  }
  const first = candidate?.payload?.definitionRevisionId ?? null;
  return first ? [first] : [];
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
    scope: storeScopeForProject(project, candidate, projection),
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
    definitionRevisionIds: candidateDefinitionRevisionIds(candidate),
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
    calculationInputHash: estimate.calculationIdentity?.inputHash ?? null,
    calculationResultHash: estimate.calculationIdentity?.resultHash ?? null,
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
      calculationInputHash: snapshot.calculationInputHash,
      calculationResultHash: snapshot.calculationResultHash,
      storeReconciliation: assembled.reconciliation ?? null,
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
        calculationResultHash: snapshot.calculationResultHash,
        storeReconciliationStatus: assembled.reconciliation?.status ?? null,
        authority: false,
        commercial: false,
        physical: false,
      },
    },
  });

  return recoverReview(localRecordId, actionId, result);
}

async function reconcileConfirmedUserDefinedStore(localRecordId, assembled) {
  if (assembled.snapshot?.definitionKind !== USER_DEFINED_BOARD_DEFINITION.kind) {
    return assembled;
  }

  const passA = assembled.snapshot?.calculationInputHash && assembled.snapshot?.calculationResultHash
    ? {
        inputHash: assembled.snapshot.calculationInputHash,
        resultHash: assembled.snapshot.calculationResultHash,
      }
    : null;
  if (!passA || !assembled.snapshot?.requestId) {
    throw new RepositoryError(
      'store-calculation-divergence',
      'Confirmed User-defined Board review requires a current Store calculation identity',
    );
  }

  const retried = await retryStoreAttempt({
    localRecordId,
    requestId: assembled.snapshot.requestId,
    background: false,
  });
  const passBEnvelope = retried?.response?.payload?.wrapperEnvelope ?? null;
  const passB = calculationIdentityFromEnvelope(passBEnvelope);
  const comparison = compareStoreCalculationIdentities(passA, passB);
  if (!comparison.ok) {
    throw new RepositoryError(
      'store-calculation-divergence',
      `Confirmed Store reconciliation failed closed: ${comparison.reason}`,
    );
  }

  const refreshed = await assembleReviewSnapshot(localRecordId, { unapplied: assembled.unapplied });
  if (!refreshed || refreshed.snapshot?.candidateRevisionId !== assembled.snapshot.candidateRevisionId) {
    throw new RepositoryError(
      'store-calculation-divergence',
      'Candidate revision changed during confirmed Store reconciliation',
    );
  }
  if (!refreshed.predicate.completeSupportedReviewAvailable) {
    throw new RepositoryError(
      'store-calculation-divergence',
      'Confirmed Store reconciliation did not return a complete supported answer',
    );
  }

  const refreshedIdentity =
    refreshed.snapshot?.calculationInputHash && refreshed.snapshot?.calculationResultHash
      ? {
          inputHash: refreshed.snapshot.calculationInputHash,
          resultHash: refreshed.snapshot.calculationResultHash,
        }
      : null;
  const refreshedComparison = compareStoreCalculationIdentities(passA, refreshedIdentity);
  if (!refreshedComparison.ok) {
    throw new RepositoryError(
      'store-calculation-divergence',
      `Persisted confirmed Store answer diverged: ${refreshedComparison.reason}`,
    );
  }

  refreshed.reconciliation = Object.freeze({
    status: 'MATCH',
    passA,
    passB: refreshedIdentity,
    requestId: refreshed.snapshot.requestId,
    passAAttemptId: assembled.snapshot.attemptId,
    passBAttemptId: refreshed.snapshot.attemptId,
    passAResponseId: assembled.snapshot.responseId,
    passBResponseId: refreshed.snapshot.responseId,
  });
  return refreshed;
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
  let assembled = await assembleReviewSnapshot(localRecordId, { unapplied });
  if (!assembled) {
    throw new RepositoryError('not-found', 'Review requires a project');
  }
  if (!assembled.predicate.completeSupportedReviewAvailable) {
    throw new RepositoryError(
      'review-not-supported',
      'A complete supported review is not available for this revision',
    );
  }
  assembled = await reconcileConfirmedUserDefinedStore(localRecordId, assembled);
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
