import assert from 'node:assert/strict';
import test from 'node:test';

import {
  APP_BUILD_ID,
  COPY,
  REVIEW_ACTIONS,
  REVIEW_DIGEST_VERSION,
  REVIEW_RECORD_TYPES,
} from '../../shared/contracts.mjs';
import { digestCanonical } from '../../shared/store-wire.mjs';
import {
  collectDisclosures,
  collectUnresolvedConditions,
  computeReviewDigest,
  evaluateReviewPredicate,
  reviewDigestInput,
  reviewMatchesCurrent,
} from '../../shared/review-digest.mjs';

function snapshot(overrides = {}) {
  return {
    projectId: 'proj-1',
    candidateRevisionId: 'cand-45',
    projectionId: 'projn-1',
    occurrenceIds: ['occ-1'],
    definitionRevisionIds: ['def-1'],
    definitionKind: 'board.square.v1',
    ruleVersion: '0.1',
    classReference: null,
    evidenceIds: ['ev-1'],
    observationIds: ['obs-1'],
    mappings: [
      {
        observationId: 'obs-1',
        inputKey: 'finished length',
        status: 'accepted',
        method: 'entered',
        documentaryPin: null,
      },
    ],
    requestId: 'req-1',
    attemptId: 'att-1',
    responseId: 'resp-1',
    estimateAssociationId: 'est-1',
    demandSignature: 'demand-1',
    payloadDigest: 'payload-1',
    storePin: 'b40cdc60a405d6c2a63d846f2c2e89cddc5bb95d',
    storeDisposition: 'SUPPORTABLE',
    estimateStatus: 'BUDGETARY_ESTIMATE',
    estimateQ: 53.94,
    disclosures: ['a-disclosure', 'b-disclosure'],
    unresolvedConditions: [],
    ...overrides,
  };
}

test('review digest is canonical identity over the documented snapshot contract', async () => {
  const first = snapshot();
  const second = snapshot({
    disclosures: ['b-disclosure', 'a-disclosure'],
    occurrenceIds: ['occ-1'],
  });
  const digest = await computeReviewDigest(first);
  assert.equal(digest, await computeReviewDigest(second));
  assert.equal(digest, await digestCanonical(reviewDigestInput(first)));
  assert.equal(reviewDigestInput(first).version, REVIEW_DIGEST_VERSION);
  assert.equal(
    Object.prototype.hasOwnProperty.call(reviewDigestInput(first), 'actionId'),
    false,
  );
  assert.equal(
    Object.prototype.hasOwnProperty.call(reviewDigestInput(first), 'receivedAt'),
    false,
  );
  const changedResponse = snapshot({ responseId: 'resp-2' });
  assert.notEqual(digest, await computeReviewDigest(changedResponse));
  const changedCandidate = snapshot({ candidateRevisionId: 'cand-46' });
  assert.notEqual(digest, await computeReviewDigest(changedCandidate));
});

test('complete supported review requires current SUPPORTABLE plus complete Q', () => {
  const projection = { payload: { valid: true } };
  const store = { current: true, status: 'current', request: { id: 'req-1' }, response: { id: 'resp-1' } };
  const storeView = {
    dispositionEnum: 'SUPPORTABLE',
    estimate: { available: true, q: 53.94, status: 'BUDGETARY_ESTIMATE' },
  };
  const assembled = {
    candidate: { id: 'cand-45' },
    projection,
    store,
    storeView,
    unapplied: false,
    imported: false,
    snapshot: {
      requestId: 'req-1',
      responseId: 'resp-1',
      unresolvedConditions: collectUnresolvedConditions({ projection, store, storeView }),
    },
  };
  assembled.snapshot.unresolvedConditions = collectUnresolvedConditions({
    projection,
    store,
    storeView,
  });
  const predicate = evaluateReviewPredicate(assembled);
  assert.equal(predicate.completeSupportedReviewAvailable, true);
  assert.equal(predicate.unresolvedAcknowledgmentAvailable, false);
  assert.deepEqual(assembled.snapshot.unresolvedConditions, []);
});

test('REFUSED, missing Q, unapplied, and incomplete cannot create a supported review', () => {
  const projection = { payload: { valid: true } };
  const refused = evaluateReviewPredicate({
    candidate: { id: 'c' },
    projection,
    store: { current: true, status: 'current' },
    storeView: {
      dispositionEnum: 'REFUSED',
      estimate: { available: false },
    },
    unapplied: false,
    snapshot: {
      requestId: 'req-1',
      responseId: 'resp-1',
      unresolvedConditions: ['store-refused', 'missing-budgetary-estimate'],
    },
  });
  assert.equal(refused.completeSupportedReviewAvailable, false);
  assert.equal(refused.unresolvedAcknowledgmentAvailable, true);

  const missingQ = evaluateReviewPredicate({
    candidate: { id: 'c' },
    projection,
    store: { current: true, status: 'current' },
    storeView: {
      dispositionEnum: 'SUPPORTABLE',
      estimate: { available: false },
    },
    unapplied: false,
    snapshot: {
      requestId: 'req-1',
      responseId: 'resp-1',
      unresolvedConditions: ['missing-budgetary-estimate'],
    },
  });
  assert.equal(missingQ.completeSupportedReviewAvailable, false);
  assert.equal(missingQ.unresolvedAcknowledgmentAvailable, true);

  const unapplied = evaluateReviewPredicate({
    candidate: { id: 'c' },
    projection,
    store: { current: true, status: 'current' },
    storeView: {
      dispositionEnum: 'SUPPORTABLE',
      estimate: { available: true, q: 53.94 },
    },
    unapplied: true,
    snapshot: {
      requestId: 'req-1',
      responseId: 'resp-1',
      unresolvedConditions: [],
    },
  });
  assert.equal(unapplied.completeSupportedReviewAvailable, false);
  assert.equal(unapplied.unresolvedAcknowledgmentAvailable, false);
  assert.equal(unapplied.blockedByUnapplied, true);

  const incomplete = evaluateReviewPredicate({
    candidate: { id: 'c' },
    projection: { payload: { valid: false, unresolvedReason: 'below-minimum' } },
    store: { status: 'none' },
    storeView: { dispositionEnum: null, estimate: { available: false } },
    unapplied: false,
    snapshot: {
      requestId: null,
      responseId: null,
      unresolvedConditions: ['below-minimum', 'store-request-absent'],
    },
  });
  assert.equal(incomplete.completeSupportedReviewAvailable, false);
  assert.equal(incomplete.unresolvedAcknowledgmentAvailable, true);
});

test('review records do not mint commercial or physical authority', () => {
  assert.equal(REVIEW_ACTIONS.CONFIRM_DEFINITION, 'CONFIRM_DEFINITION');
  assert.equal(REVIEW_RECORD_TYPES.DefinitionReviewRecorded, 'DefinitionReviewRecorded');
  assert.equal(REVIEW_RECORD_TYPES.UnresolvedDefinitionAcknowledged, 'UnresolvedDefinitionAcknowledged');
  assert.equal(COPY.reviewNoOrder.includes('order'), true);
  assert.equal(COPY.resultRetained.includes('physical fabrication'), true);
  assert.match(COPY.reviewMeaningBody, /does not place an order/);
  assert.equal(APP_BUILD_ID, 'stb-app-build-7');
  const disclosures = collectDisclosures({});
  assert.equal(disclosures.some((line) => line.includes('does not place an order')), true);
});

test('a changed digest makes a prior review historical', async () => {
  const assembled = {
    imported: false,
    snapshot: {
      candidateRevisionId: 'cand-45',
      reviewDigest: await computeReviewDigest(snapshot()),
    },
  };
  const review = {
    payload: {
      candidateRevisionId: 'cand-45',
      reviewDigest: assembled.snapshot.reviewDigest,
      imported: false,
    },
  };
  assert.equal(reviewMatchesCurrent(review, assembled), true);
  assembled.snapshot.reviewDigest = await computeReviewDigest(snapshot({ responseId: 'resp-2' }));
  assert.equal(reviewMatchesCurrent(review, assembled), false);
});
