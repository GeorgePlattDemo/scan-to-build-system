import { REVIEW_DIGEST_VERSION } from './contracts.mjs';
import { digestCanonical } from './store-wire.mjs';

function sortedCopy(values) {
  return [...new Set(values)].sort();
}

function sortedObjects(values) {
  return [...values].sort((left, right) => {
    const a = JSON.stringify(left);
    const b = JSON.stringify(right);
    if (a === b) {
      return 0;
    }
    return a < b ? -1 : 1;
  });
}

/**
 * Review digest input contract (`review-digest/v1`).
 *
 * Included — consequential identity of the reviewed definition and Store basis:
 * projectId, candidateRevisionId, projectionId, occurrence/definition IDs,
 * definition kind/rule/class reference, evidence IDs, observation IDs,
 * accepted mapping identities, Store request/attempt/response/estimate IDs,
 * demandSignature, payloadDigest, storePin, Store disposition, estimate
 * status/Q, sorted disclosures, sorted unresolved conditions.
 *
 * Excluded — transient presentation and action metadata that must not
 * invalidate a still-exact review: actionId, reviewId, timestamps, actor,
 * page/drawer, receivedAt/wrapper clocks, display strings, SVG pixels,
 * unapplied buffer, import provenance flags.
 *
 * The digest is identity/comparison evidence only. It is not authority.
 */
export function reviewDigestInput(snapshot) {
  return {
    version: REVIEW_DIGEST_VERSION,
    projectId: snapshot.projectId ?? null,
    candidateRevisionId: snapshot.candidateRevisionId ?? null,
    projectionId: snapshot.projectionId ?? null,
    occurrenceIds: sortedCopy(snapshot.occurrenceIds ?? []),
    definitionRevisionIds: sortedCopy(snapshot.definitionRevisionIds ?? []),
    definitionKind: snapshot.definitionKind ?? null,
    ruleVersion: snapshot.ruleVersion ?? null,
    classReference: snapshot.classReference ?? null,
    evidenceIds: sortedCopy(snapshot.evidenceIds ?? []),
    observationIds: sortedCopy(snapshot.observationIds ?? []),
    mappings: sortedObjects(snapshot.mappings ?? []),
    requestId: snapshot.requestId ?? null,
    attemptId: snapshot.attemptId ?? null,
    responseId: snapshot.responseId ?? null,
    estimateAssociationId: snapshot.estimateAssociationId ?? null,
    demandSignature: snapshot.demandSignature ?? null,
    payloadDigest: snapshot.payloadDigest ?? null,
    storePin: snapshot.storePin ?? null,
    storeDisposition: snapshot.storeDisposition ?? null,
    estimateStatus: snapshot.estimateStatus ?? null,
    estimateQ: snapshot.estimateQ ?? null,
    disclosures: sortedCopy(snapshot.disclosures ?? []),
    unresolvedConditions: sortedCopy(snapshot.unresolvedConditions ?? []),
  };
}

export async function computeReviewDigest(snapshot) {
  return digestCanonical(reviewDigestInput(snapshot));
}

export function collectUnresolvedConditions({
  projection,
  store,
  storeView,
  imported = false,
} = {}) {
  const conditions = [];
  if (imported) {
    conditions.push('imported-inert');
  }
  for (const item of projection?.payload?.unresolvedConditions ?? []) {
    if (item) conditions.push(item);
  }
  if (!projection || projection.payload?.valid !== true) {
    conditions.push(projection?.payload?.unresolvedReason ?? 'incomplete-requirement');
  }
  if (!store || store.status === 'none') {
    conditions.push('store-request-absent');
  } else if (store.status === 'pending') {
    conditions.push('store-pending');
  } else if (store.current !== true) {
    if (store.diagnostic) {
      conditions.push(`store-diagnostic:${store.diagnostic}`);
    } else {
      conditions.push('store-not-current');
    }
  } else {
    const disposition = storeView?.dispositionEnum ?? null;
    if (disposition && disposition !== 'SUPPORTABLE') {
      conditions.push(`store-${disposition.toLowerCase()}`);
    } else if (!disposition) {
      conditions.push('store-not-current');
    }
    if (storeView?.estimate?.available !== true) {
      conditions.push('missing-budgetary-estimate');
    }
  }
  return sortedCopy(conditions);
}

export function collectDisclosures({ projection, storeView, documentaryReference } = {}) {
  const disclosures = [
    'Recording this review affirms the intended definition and displayed evidence basis.',
    'This review does not place an order, reserve inventory, authorize fabrication, or start a machine.',
  ];
  const definitionKind = projection?.payload?.definitionKind ?? null;
  if (definitionKind === 'board.square.v1') {
    disclosures.push(
      'Stage-2 SUPPORTABLE is not machine approval, production readiness, or fabrication authorization.',
      'Budgetary Q is not a quote, sale price, or reservation.',
      'Fixture stock is declared reference information, not a live inventory count.',
    );
  }
  if (projection?.payload?.classId === 'alcove-shelf-blanks') {
    disclosures.push(
      'Alcove arithmetic does not establish structural adequacy, shelf elevations, installation design, Store support, or production eligibility.',
      'The displayed simulate_crosscut → simulate_shelf_blank sequence is reference context only, not an application-issued process plan or machine instruction.',
    );
  }
  if (documentaryReference?.id === 'CUT-001' || projection?.payload?.source?.method === 'documentary-reference') {
    disclosures.push(
      'CUT-001 documentary reference is not Store support, machine commissioning, or fabrication authorization.',
    );
  }
  if (storeView?.dispositionEnum && storeView.dispositionEnum !== 'SUPPORTABLE') {
    disclosures.push('The displayed Store disposition is not a complete supported review.');
  }
  return sortedCopy(disclosures);
}

export function evaluateReviewPredicate(assembled) {
  const unapplied = assembled.unapplied === true;
  const imported = assembled.imported === true;
  const projectionValid = assembled.projection?.payload?.valid === true;
  const storeCurrent = assembled.store?.current === true;
  const supportable = assembled.storeView?.dispositionEnum === 'SUPPORTABLE';
  const estimateComplete = assembled.storeView?.estimate?.available === true;
  const unresolved = assembled.snapshot?.unresolvedConditions ?? [];
  const complete =
    !unapplied &&
    !imported &&
    projectionValid &&
    storeCurrent &&
    supportable &&
    estimateComplete &&
    Boolean(assembled.snapshot?.requestId) &&
    Boolean(assembled.snapshot?.responseId) &&
    unresolved.length === 0;
  return {
    completeSupportedReviewAvailable: complete,
    unresolvedAcknowledgmentAvailable: Boolean(assembled.candidate) && !complete && !unapplied,
    blockedByUnapplied: unapplied,
    imported,
    reasons: unresolved,
  };
}

export function reviewMatchesCurrent(review, assembled) {
  if (!review || !assembled?.snapshot) {
    return false;
  }
  if (assembled.imported) {
    return false;
  }
  const payload = review.payload ?? {};
  if (review.imported === true || payload.imported === true) {
    return false;
  }
  if (payload.candidateRevisionId !== assembled.snapshot.candidateRevisionId) {
    return false;
  }
  return payload.reviewDigest === assembled.snapshot.reviewDigest;
}
