// Whatever Store version is pinned, a sheet package is either answered by that Store or fails closed.
// At a pin without the S-001 sheet evaluator the adapter returns STORE_CAPABILITY_NOT_AT_PIN (503):
// no local answer, no reference answer, no other project's answer.
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

import { SHEET_PACKAGE_DEFINITION, STORE_PIN } from '../../shared/contracts.mjs';
import { createStoreAdapter } from '../../server/store-adapter.mjs';
import { buildSheetPackageRequest, sheetPackageDemandSignature, sheetPackageJobPayload } from '../../shared/store-wire.mjs';
import { requireCleanPinnedStore } from './helpers.mjs';
import { playhouseDefinition } from '../fixtures/playhouse.mjs';

test('a sheet package is answered by the pinned Store or fails closed', async () => {
  const root = await requireCleanPinnedStore();
  const adapter = await createStoreAdapter();
  assert.equal(adapter.ready, true, JSON.stringify(adapter.inspection));
  const payload = sheetPackageJobPayload(playhouseDefinition());
  const request = await buildSheetPackageRequest({
    requestId: crypto.randomUUID(), projectId: 'playhouse', candidateRevisionId: 'at-pin', attemptId: crypto.randomUUID(),
    attemptNumber: 1, sentAt: new Date().toISOString(), demandSignature: await sheetPackageDemandSignature(payload), payload,
  });
  const result = await adapter.dispatch(request);
  const carriesSheet = fs.existsSync(path.join(root, SHEET_PACKAGE_DEFINITION.storeModule));
  if (carriesSheet) {
    assert.equal(result.status, 200);
    assert.equal(result.body.rawEvaluation.freshEvaluation, true);
    assert.equal(result.body.evaluationReceipt.authority.storeRevision, STORE_PIN);
  } else {
    assert.equal(result.status, 503);
    assert.equal(result.body.adapterError, true);
    assert.equal(result.body.code, 'STORE_CAPABILITY_NOT_AT_PIN');
    assert.equal(result.body.rawEvaluation, undefined);
  }
});
