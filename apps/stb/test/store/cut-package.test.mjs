import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import test from 'node:test';

import { STORE_PIN } from '../../shared/contracts.mjs';
import { createStoreAdapter } from '../../server/store-adapter.mjs';
import { startServer } from '../../server/main.mjs';
import { buildCutPackageRequest, cutPackageDemandSignature, cutPackageJobPayload } from '../../shared/store-wire.mjs';
import { parseJson, postJob, requireCleanPinnedStore } from './helpers.mjs';

async function withHost(t) {
  await requireCleanPinnedStore();
  const adapter = await createStoreAdapter();
  assert.equal(adapter.ready, true, JSON.stringify(adapter.inspection));
  const host = await startServer({ storeAdapter: adapter });
  t.after(() => host.close());
  return { adapter, host };
}

async function send(definition) {
  const payload = cutPackageJobPayload(definition);
  const request = await buildCutPackageRequest({
    requestId: crypto.randomUUID(),
    projectId: 'cut-package-test',
    candidateRevisionId: definition.configurationVersion,
    attemptId: crypto.randomUUID(),
    attemptNumber: 1,
    sentAt: new Date().toISOString(),
    demandSignature: await cutPackageDemandSignature(payload),
    payload,
  });
  const response = await postJob(request);
  return { request, response, body: response.status === 200 ? parseJson(response) : null };
}

const many = (prefix, count, lengthIn, spots = []) =>
  Array.from({ length: count }, (_, i) => ({ partId: `${prefix}-${i + 1}`, lengthIn, spots }));

test('CUT_PACKAGE_V1 carries a la carte lines to the pinned Store and returns its fresh line-by-line answer', async (t) => {
  await withHost(t);
  const { request, body } = await send({
    configurationId: 'CUT-PACKAGE-TEST',
    configurationVersion: 'v1',
    cutPackages: [
      {
        packageId: 'LONG',
        material: { species: 'syp-treated', nominalT: 2, nominalW: 6, grade: 'ground-contact' },
        endCut: { angleDeg: 0 },
        parts: many('L', 4, 71.5, [{ xIn: 4.75, acrossWidthRule: 'CENTERED_ON_WIDE_FACE' }]),
      },
      {
        packageId: 'TOO-LONG',
        material: { species: 'cedar', nominalT: 2, nominalW: 6, grade: 'S4S' },
        parts: many('X', 1, 190),
      },
    ],
    itemLines: [
      { lineId: 'SCREWS', storeSku: 'STB-ZERO-HW-COATED-SCR10-2P5-90-001', qty: 2 },
      { lineId: 'GHOST', storeSku: 'STB-ZERO-NO-SUCH-SKU', qty: 1 },
    ],
  });
  assert.ok(body);
  assert.equal(body.storePin, STORE_PIN);
  const answer = body.rawEvaluation;
  assert.equal(answer.freshEvaluation, true);
  assert.equal(body.evaluationReceipt.requestId, request.requestId);
  assert.equal(body.evaluationReceipt.authority.storeRevision, STORE_PIN);
  assert.equal(answer.status, 'NOT_ALL_LINES_SUPPORTABLE');
  const long = answer.packages.find((line) => line.packageId === 'LONG');
  assert.equal(long.status, 'SUPPORTABLE');
  assert.match(long.storeSku, /^STB-ZERO-PTGC-2X6-/);
  assert.ok(long.Q > 0 && long.time.T_MACHINE_min > 0);
  assert.equal(answer.packages.find((line) => line.packageId === 'TOO-LONG').status, 'REFUSED');
  const screws = answer.items.find((line) => line.lineId === 'SCREWS');
  assert.equal(screws.status, 'SUPPORTABLE');
  assert.equal(screws.Q, Math.round(screws.sellingPrice * 2 * 100) / 100);
  assert.deepEqual(answer.items.find((line) => line.lineId === 'GHOST').reasonCodes, ['NO_OFFERING']);
  assert.equal(answer.totals.sumOfSupportableLines, Math.round((long.Q + screws.Q) * 100) / 100);
});

test('CUT_PACKAGE_V1 wire gate checks shape only and never answers for the Store', async (t) => {
  await withHost(t);
  const extraField = await send({
    configurationId: 'CUT-PACKAGE-TEST',
    configurationVersion: 'v2',
    cutPackages: [{ packageId: 'P', material: { species: 'spf', nominalT: 2, nominalW: 4, grade: 'construction', price: 1 }, parts: many('A', 1, 20) }],
  });
  assert.equal(extraField.response.status, 422);
  const badQty = await send({ configurationId: 'CUT-PACKAGE-TEST', configurationVersion: 'v3', itemLines: [{ lineId: 'A', storeSku: 'X', qty: 1.5 }] });
  assert.equal(badQty.response.status, 400);
  // A 14 ft part is not refused by System; the Store answers it.
  const long = await send({
    configurationId: 'CUT-PACKAGE-TEST',
    configurationVersion: 'v4',
    cutPackages: [{ packageId: 'P', material: { species: 'spf', nominalT: 2, nominalW: 6, grade: 'construction' }, parts: many('A', 2, 167.5) }],
  });
  assert.equal(long.response.status, 200);
  assert.equal(long.body.rawEvaluation.packages[0].status, 'SUPPORTABLE');
  assert.ok(long.body.rawEvaluation.packages[0].stockLengthIn >= 168);
});
