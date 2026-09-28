// A cut package may state the width its boards are edge-milled to. System checks the shape only;
// whether the D-001 cell can mill it, how long it takes and what it costs are the Store's answer.
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCutPackageRequest, cutPackageDemandSignature, cutPackageJobPayload, validateWireRequest } from '../../shared/store-wire.mjs';

async function check(pkgExtra) {
  const definition = {
    configurationId: 'FINISHED-WIDTH-TEST', configurationVersion: 'v1',
    cutPackages: [{ packageId: 'P', material: { species: 'pine', form: 'board', nominalT: 1, nominalW: 8, grade: 'select' },
      endCut: { angleDeg: 0 }, parts: [{ partId: 'A', lengthIn: 94 }], ...pkgExtra }],
  };
  const payload = cutPackageJobPayload(definition);
  const request = await buildCutPackageRequest({
    requestId: 'r', projectId: 'window-seat', candidateRevisionId: 'v1', attemptId: 'a', attemptNumber: 1,
    sentAt: new Date().toISOString(), demandSignature: await cutPackageDemandSignature(payload), payload,
  });
  return validateWireRequest(request);
}

test('cut package: finishedWidthIn is optional and must be a positive number', async () => {
  assert.equal((await check({})).ok, true);
  assert.equal((await check({ finishedWidthIn: 7 })).ok, true);
  // System does not decide what the cell can mill: a width wider than the board still travels to the Store.
  assert.equal((await check({ finishedWidthIn: 7.5 })).ok, true);
  for (const bad of [0, -1, '7']) assert.equal((await check({ finishedWidthIn: bad })).ok, false, String(bad));
  assert.equal((await check({ millTo: 7 })).ok, false, 'no other package fields');
});
