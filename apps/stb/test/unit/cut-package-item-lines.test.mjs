// A cut-package item line names an exact Store item and a count, or states a neutral hardware requirement in pieces
// that the pinned Store resolves to its own item (or refuses). System checks the shape only: which kinds, sizes and
// finishes exist, which item fits, and its price are the Store's answer. No item number is chosen in System.
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCutPackageRequest, cutPackageDemandSignature, cutPackageJobPayload, validateWireRequest } from '../../shared/store-wire.mjs';

async function check(itemLines) {
  const definition = {
    configurationId: 'ITEM-LINE-TEST', configurationVersion: 'v1',
    cutPackages: [{ packageId: 'P', material: { species: 'spf', form: 'board', nominalT: 2, nominalW: 4, grade: 'construction' },
      endCut: { angleDeg: 0 }, parts: [{ partId: 'A', lengthIn: 60 }] }],
    itemLines,
  };
  const payload = cutPackageJobPayload(definition);
  const request = await buildCutPackageRequest({
    requestId: 'r', projectId: 'outdoor', candidateRevisionId: 'v1', attemptId: 'a', attemptNumber: 1,
    sentAt: new Date().toISOString(), demandSignature: await cutPackageDemandSignature(payload), payload,
  });
  return validateWireRequest(request);
}
const screws = (extra = {}) => ({ lineId: 'SCREWS', qty: 100, requirement: { kind: 'wood-screw', gauge: '#10', lengthIn: 2.5, finish: 'stainless', unit: 'piece', ...extra } });

test('item line by exact Store item still travels', async () => {
  assert.equal((await check([{ lineId: 'HW', storeSku: 'ANY-ITEM', qty: 2 }])).ok, true);
  assert.equal((await check([{ lineId: 'HW', qty: 2 }])).ok, false, 'an item line needs an item or a requirement');
});

test('item line by neutral hardware requirement travels for the Store to resolve', async () => {
  assert.equal((await check([screws()])).ok, true);
  assert.equal((await check([{ lineId: 'BOLTS', qty: 8, requirement: { kind: 'carriage-bolt', diameterIn: 0.375, lengthIn: 5, finish: 'coated' } }])).ok, true);
  // System does not judge whether the Store stocks it: an unknown finish or size still goes to the Store.
  assert.equal((await check([screws({ finish: 'gold-plated', lengthIn: 7 })])).ok, true);
});

test('a malformed requirement is stopped before it travels', async () => {
  assert.equal((await check([{ ...screws(), storeSku: 'X' }])).ok, false, 'not both an item and a requirement');
  const noGauge = screws(); delete noGauge.requirement.gauge;
  assert.equal((await check([noGauge])).ok, false, 'gauge or diameter');
  assert.equal((await check([screws({ diameterIn: 0.2 })])).ok, false, 'not both gauge and diameter');
  assert.equal((await check([screws({ lengthIn: 0 })])).ok, false);
  assert.equal((await check([screws({ finish: '' })])).ok, false);
  assert.equal((await check([screws({ unit: 'box' })])).ok, false, 'counted in pieces');
  assert.equal((await check([screws({ colour: 'red' })])).ok, false, 'no other requirement fields');
  assert.equal((await check([{ ...screws(), qty: 1.5 }])).ok, false);
});
