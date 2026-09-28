// SHEET_PACKAGE_V1 through the real adapter and the real pinned Store evaluator. No scripted Store answer.
// Run it with STB_STORE_ZERO_ROOT at a clean Store checkout whose HEAD is the pin under test.
// For a candidate Store version, use test/candidate/run-with-candidate-store.mjs.
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import test from 'node:test';

import { STORE_PIN } from '../../shared/contracts.mjs';
import { createStoreAdapter } from '../../server/store-adapter.mjs';
import { startServer } from '../../server/main.mjs';
import { buildSheetPackageRequest, sheetPackageDemandSignature, sheetPackageJobPayload } from '../../shared/store-wire.mjs';
import { parseJson, postJob, requireCleanPinnedStore } from './helpers.mjs';
import { playhouseDefinition } from '../fixtures/playhouse.mjs';

async function withHost(t, options = {}) {
  await requireCleanPinnedStore();
  const adapter = await createStoreAdapter(options);
  assert.equal(adapter.ready, true, JSON.stringify(adapter.inspection));
  assert.ok(adapter.modules.sheetPackage, 'the pinned Store must carry the S-001 sheet evaluator for this suite');
  const host = await startServer({ storeAdapter: adapter });
  t.after(() => host.close());
  return { adapter, host };
}

async function send(definition, projectId = 'playhouse') {
  const payload = sheetPackageJobPayload(definition);
  const request = await buildSheetPackageRequest({
    requestId: crypto.randomUUID(),
    projectId,
    candidateRevisionId: definition.configurationVersion,
    attemptId: crypto.randomUUID(),
    attemptNumber: 1,
    sentAt: new Date().toISOString(),
    demandSignature: await sheetPackageDemandSignature(payload),
    payload,
  });
  const response = await postJob(request);
  return { request, response, body: response.status === 200 ? parseJson(response) : null };
}

test('canonical Playhouse gets a fresh SUPPORTABLE answer from the pinned Store', async (t) => {
  await withHost(t);
  const { request, body } = await send(playhouseDefinition());
  assert.ok(body);
  assert.equal(body.storePin, STORE_PIN);
  assert.equal(body.requestType, 'SHEET_PACKAGE_V1');
  assert.equal(body.projectId, 'playhouse');
  const answer = body.rawEvaluation;
  assert.equal(answer.freshEvaluation, true);
  assert.equal(body.evaluationReceipt.requestId, request.requestId);
  assert.equal(body.evaluationReceipt.authority.storeRevision, STORE_PIN);
  assert.equal(answer.status, 'SUPPORTABLE');
  assert.equal(answer.material.storeSku, 'STB-ZERO-PLY-050-48X96-001');
  assert.ok(answer.Q > answer.totals.material && answer.totals.machine_service > 0);
  assert.equal(answer.pieces.length, 5);
  assert.ok(answer.pieces.every((piece) => piece.disposition === 'RETURNED_TO_OWNER'));
  assert.equal(answer.evidence.measured, false);
  assert.equal(answer.evidence.commissioned, false);
});

test('the same unchanged definition asked twice gets two fresh receipts and one calculation', async (t) => {
  await withHost(t);
  const first = await send(playhouseDefinition());
  const second = await send(playhouseDefinition());
  assert.notEqual(first.body.evaluationReceipt.receiptHash, second.body.evaluationReceipt.receiptHash);
  assert.notEqual(first.body.evaluationReceipt.requestId, second.body.evaluationReceipt.requestId);
  assert.deepEqual(first.body.calculationIdentity, second.body.calculationIdentity);
});

test('a consequential definition change is a new calculation', async (t) => {
  await withHost(t);
  const first = await send(playhouseDefinition());
  const changed = await send(playhouseDefinition({ widthIn: 30 }));
  assert.notEqual(changed.body.calculationIdentity.inputHash, first.body.calculationIdentity.inputHash);
  assert.notEqual(changed.body.calculationIdentity.resultHash, first.body.calculationIdentity.resultHash);
  assert.notEqual(changed.body.rawEvaluation.Q, first.body.rawEvaluation.Q);
});

test('an opening past the working field is REFUSED by the Store and carries no price', async (t) => {
  await withHost(t);
  const { body } = await send(playhouseDefinition({ straightHeightIn: 30 }));
  assert.equal(body.rawEvaluation.status, 'REFUSED');
  assert.ok(body.rawEvaluation.refusalConditions.includes('CENTER_WORK_FIELD_EXCEEDED'));
  assert.equal(body.rawEvaluation.Q, null);
  // The Store echoes the geometry as asked; nothing is resized to fit.
  assert.equal(body.rawEvaluation.features.apertures[0].straightHeightIn, 30);
});

test('an undeclared operation is REFUSED by the Store; machine-local language never reaches it', async (t) => {
  await withHost(t);
  const drill = await send(playhouseDefinition({ extraFeature: { featureId: 'HINGE-HOLES', kind: 'DRILL' } }));
  assert.equal(drill.body.rawEvaluation.status, 'REFUSED');
  assert.ok(drill.body.rawEvaluation.refusalConditions.includes('FEATURE_KIND_NOT_DECLARED'));
  const definition = playhouseDefinition();
  definition.gcode = 'G1 X10';
  const gcode = await send(definition);
  assert.equal(gcode.response.status, 422);
  assert.equal(parseJson(gcode.response).code, 'INVALID_BOUNDED_SCOPE');
});

test('missing required information stays UNRESOLVED', async (t) => {
  await withHost(t);
  const { body } = await send(playhouseDefinition({ tabs: null }));
  assert.equal(body.rawEvaluation.status, 'UNRESOLVED');
  assert.ok(body.rawEvaluation.unresolvedConditions.includes('TAB_COUNT_MISSING'));
  assert.equal(body.rawEvaluation.Q, null);
});

test('a shortage is UNAVAILABLE, never a fallback', async (t) => {
  const { adapter } = await withHost(t);
  const catalog = adapter.cloneCatalog();
  catalog.offerings.find((item) => item.storeSku === 'STB-ZERO-PLY-050-48X96-001').onHand = 0;
  const payload = sheetPackageJobPayload(playhouseDefinition());
  const envelope = await buildSheetPackageRequest({
    requestId: crypto.randomUUID(), projectId: 'playhouse', candidateRevisionId: 'short', attemptId: crypto.randomUUID(),
    attemptNumber: 1, sentAt: new Date().toISOString(), demandSignature: await sheetPackageDemandSignature(payload), payload,
  });
  const result = await adapter.handleSheetPackageJob(envelope, payload, { catalogOverride: catalog });
  assert.equal(result.body.rawEvaluation.status, 'UNAVAILABLE');
  assert.equal(result.body.rawEvaluation.Q, null);
});

test('a board project cannot be answered as a sheet, and a sheet cannot ride a board request', async (t) => {
  await withHost(t);
  // The Playhouse sheet sent as a D-001 cut package is not answered SUPPORTABLE by D-001.
  const { buildCutPackageRequest, cutPackageDemandSignature, cutPackageJobPayload } = await import('../../shared/store-wire.mjs');
  const cutPayload = cutPackageJobPayload({
    configurationId: 'PLAYHOUSE-AS-BOARD', configurationVersion: 'x',
    cutPackages: [{ packageId: 'SHEET', material: { species: 'pine', form: 'sheet', nominalT: 0.5, nominalW: 48, grade: 'sheathing-4ply' }, parts: [{ partId: 'A', lengthIn: 24 }] }],
  });
  const cutRequest = await buildCutPackageRequest({
    requestId: crypto.randomUUID(), projectId: 'playhouse', candidateRevisionId: 'x', attemptId: crypto.randomUUID(),
    attemptNumber: 1, sentAt: new Date().toISOString(), demandSignature: await cutPackageDemandSignature(cutPayload), payload: cutPayload,
  });
  const cut = parseJson(await postJob(cutRequest));
  assert.notEqual(cut.rawEvaluation.status, 'SUPPORTABLE');
  // A sheet package with a board-shaped field is refused at the wire.
  const bad = playhouseDefinition();
  bad.cutPackages = [];
  assert.equal((await send(bad)).response.status, 422);
});
