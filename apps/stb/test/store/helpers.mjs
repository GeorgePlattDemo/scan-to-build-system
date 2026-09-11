import assert from 'node:assert/strict';

import { canonicalInchString } from '../../shared/canonical.mjs';
import { PUBLISHED_BOARD_SKU, STORE_PATHS } from '../../shared/contracts.mjs';
import {
  boardDemandSignature,
  boardJobPayload,
  buildJobRequest,
  buildOfferingRequest,
} from '../../shared/store-wire.mjs';
import { inspectStoreSource, storeRootFromEnv } from '../../server/store-source.mjs';
import { postJson } from '../helpers/http.mjs';

export function requireStoreRoot() {
  const root = storeRootFromEnv();
  assert.ok(
    root,
    'STB_STORE_ZERO_ROOT is absent. Refusing to skip Store integration.',
  );
  return root;
}

export async function requireCleanPinnedStore() {
  const root = requireStoreRoot();
  const inspection = await inspectStoreSource(root);
  assert.equal(
    inspection.ok,
    true,
    `exact S2.2 Store runtime unavailable: ${inspection.code} ${JSON.stringify(inspection.details)}`,
  );
  return root;
}

export async function offeringLookupBody({
  requestId = crypto.randomUUID(),
  projectId = crypto.randomUUID(),
  candidateRevisionId = crypto.randomUUID(),
  attemptId = crypto.randomUUID(),
  attemptNumber = 1,
  payload = { requestedStoreSku: PUBLISHED_BOARD_SKU },
} = {}) {
  return buildOfferingRequest({
    requestId,
    projectId,
    candidateRevisionId,
    attemptId,
    attemptNumber,
    sentAt: new Date().toISOString(),
    payload,
  });
}

export async function boardJobBody({
  requestId = crypto.randomUUID(),
  projectId = crypto.randomUUID(),
  candidateRevisionId = crypto.randomUUID(),
  attemptId = crypto.randomUUID(),
  attemptNumber = 1,
  lineId = crypto.randomUUID(),
  storeSku = PUBLISHED_BOARD_SKU,
  keptLengthIn = 45,
} = {}) {
  const payload = boardJobPayload({
    lineId,
    storeSku,
    keptLengthCanonical: canonicalInchString(keptLengthIn),
  });
  const demandSignature = await boardDemandSignature(payload);
  return buildJobRequest({
    requestId,
    projectId,
    candidateRevisionId,
    attemptId,
    attemptNumber,
    sentAt: new Date().toISOString(),
    demandSignature,
    payload,
  });
}

export async function postOffering(body, headers) {
  return postJson(STORE_PATHS.offering, body, headers);
}

export async function postJob(body, headers) {
  return postJson(STORE_PATHS.job, body, headers);
}

export function parseJson(response) {
  return JSON.parse(response.body);
}
