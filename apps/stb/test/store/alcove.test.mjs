import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

import { STORE_PIN } from '../../shared/contracts.mjs';
import { createStoreAdapter } from '../../server/store-adapter.mjs';
import { startServer } from '../../server/main.mjs';
import {
  alcoveInsertJobBody,
  parseJson,
  postJob,
  requireCleanPinnedStore,
} from './helpers.mjs';

async function withHost(t) {
  await requireCleanPinnedStore();
  const adapter = await createStoreAdapter();
  assert.equal(adapter.ready, true, JSON.stringify(adapter.inspection));
  const host = await startServer({ storeAdapter: adapter });
  t.after(() => host.close());
  return { adapter, host };
}

async function answer(species, options = {}) {
  const request = await alcoveInsertJobBody({ species, ...options });
  const response = await postJob(request);
  assert.equal(response.status, 200);
  return { request, body: parseJson(response) };
}

test('ALCOVE_INSERT_V1 asks pinned Store fresh and species changes the Store answer', async (t) => {
  await withHost(t);

  const pine = await answer('pine');
  assert.equal(pine.body.storePin, STORE_PIN);
  assert.equal(pine.body.rawEvaluation.freshEvaluation, true);
  assert.equal(pine.body.evaluationReceipt.requestId, pine.request.requestId);
  assert.equal(pine.body.evaluationReceipt.freshnessRule, 'STB-STORE-FRESH-EVALUATION-0.1');
  assert.equal(pine.body.evaluationReceipt.authority.storeRevision, STORE_PIN);
  assert.equal(pine.body.rawEvaluation.status, 'UNRESOLVED');
  assert.equal(pine.body.rawEvaluation.complete, false);
  assert.equal(pine.body.priceCompleteness.status, 'PARTIAL');
  assert.deepEqual(
    pine.body.rawEvaluation.lines.map((line) => [line.role, line.storeSku, line.qty, line.status]),
    [
      ['UPRIGHTS', 'STB-ZERO-PINE-1X6-72-001', 4, 'SUPPORTABLE'],
      ['SHELVES', 'STB-ZERO-PINE-1X6-96-001', 10, 'SUPPORTABLE'],
    ],
  );
  assert.equal(pine.body.rawEstimate.totals.material, 272.86);
  assert.equal(pine.body.rawEstimate.totals.hardware, 18);
  assert.equal(pine.body.rawEstimate.totals.machine_service, null);
  assert.equal(pine.body.rawEstimate.totals.Q, null);
  assert.ok(
    pine.body.priceCompleteness.unresolvedConditions.includes(
      'ALCOVE_COMPONENT_PROGRAMS_REQUIRED',
    ),
  );

  const poplar = await answer('poplar');
  assert.equal(poplar.body.rawEvaluation.status, 'UNRESOLVED');
  assert.deepEqual(
    poplar.body.rawEvaluation.lines.map((line) => line.storeSku),
    ['STB-ZERO-POP-1X6-72-001', 'STB-ZERO-POP-1X6-96-001'],
  );
  assert.equal(poplar.body.rawEstimate.totals.material, 418.36);
  assert.equal(poplar.body.rawEstimate.totals.Q, null);
  assert.notEqual(
    pine.body.calculationIdentity.inputHash,
    poplar.body.calculationIdentity.inputHash,
  );
  assert.notEqual(
    pine.body.calculationIdentity.resultHash,
    poplar.body.calculationIdentity.resultHash,
  );
  assert.notEqual(
    pine.body.evaluationReceipt.receiptHash,
    poplar.body.evaluationReceipt.receiptHash,
  );
});

test('ALCOVE_INSERT_V1 exposes current Store stock shortages instead of cloning availability', async (t) => {
  await withHost(t);

  const oak = await answer('oak');
  assert.equal(oak.body.rawEvaluation.status, 'UNAVAILABLE');
  assert.equal(oak.body.priceCompleteness.status, 'UNAVAILABLE');
  const oakShelves = oak.body.rawEvaluation.lines.find((line) => line.role === 'SHELVES');
  assert.equal(oakShelves.storeSku, 'STB-ZERO-OAK-1X6-96-001');
  assert.equal(oakShelves.stock.status, 'ON_HAND_SHORT');
  assert.equal(oakShelves.stock.available, 8);
  assert.equal(oakShelves.stock.qtyNeeded, 10);
  assert.equal(oak.body.rawEstimate.totals.Q, null);

  const cherry = await answer('cherry');
  assert.equal(cherry.body.rawEvaluation.status, 'UNAVAILABLE');
  const cherryShelves = cherry.body.rawEvaluation.lines.find((line) => line.role === 'SHELVES');
  assert.equal(cherryShelves.storeSku, 'STB-ZERO-CHR-1X6-96-001');
  assert.equal(cherryShelves.stock.status, 'ON_HAND_SHORT');
  assert.equal(cherryShelves.stock.available, 6);
  assert.equal(cherryShelves.stock.qtyNeeded, 10);
  assert.equal(cherry.body.rawEstimate.totals.Q, null);
});

test('ALCOVE_INSERT_V1 prices governed cut and mill component travel and depth changes required work', async (t) => {
  await withHost(t);

  const pine = await answer('pine', {
    heightIn: 65,
    depthIn: 14,
    withPrograms: true,
    unresolvedConditions: [],
  });
  assert.equal(pine.body.rawEvaluation.status, 'SUPPORTABLE');
  assert.equal(pine.body.rawEvaluation.complete, true);
  assert.equal(pine.body.priceCompleteness.status, 'COMPLETE_FOR_DECLARED_COMPONENT_TRAVEL');
  assert.deepEqual(pine.body.priceCompleteness.unresolvedConditions, []);
  assert.equal(pine.body.rawEstimate.status, 'BUDGETARY_ESTIMATE');
  assert.equal(pine.body.rawEstimate.complete, true);
  assert.equal(pine.body.rawEstimate.totals.material, 272.86);
  assert.equal(pine.body.rawEstimate.totals.hardware, 18);
  assert.equal(pine.body.rawEstimate.totals.machine_service, 133.67);
  assert.equal(pine.body.rawEstimate.totals.Q, 424.53);
  assert.equal(pine.body.rawEstimate.cycle.T_job_min, 32.0801);
  assert.ok(pine.body.rawEvaluation.machineEvaluation.time.T_MILL_sec > 0);
  assert.equal(pine.body.mappedCallInputs.definition.componentPrograms.length, 19);
  assert.equal(pine.body.mappedCallInputs.demand.componentPrograms.length, 19);
  assert.ok(
    pine.body.rawEvaluation.lines
      .find((line) => line.role === 'SHELVES')
      .requiredOps.includes('MILL_LONGITUDINAL_PROFILE'),
  );

  const poplar = await answer('poplar', {
    heightIn: 65,
    depthIn: 14,
    withPrograms: true,
    unresolvedConditions: [],
  });
  assert.equal(poplar.body.rawEvaluation.status, 'SUPPORTABLE');
  assert.equal(poplar.body.priceCompleteness.status, 'COMPLETE_FOR_DECLARED_COMPONENT_TRAVEL');
  assert.equal(poplar.body.rawEstimate.totals.material, 418.36);
  assert.equal(poplar.body.rawEstimate.totals.machine_service, 133.67);
  assert.equal(poplar.body.rawEstimate.totals.Q, 570.03);
  assert.equal(poplar.body.rawEstimate.cycle.T_job_min, 32.0801);

  const oakMilled = await answer('oak', {
    heightIn: 65,
    depthIn: 14,
    withPrograms: true,
    unresolvedConditions: [],
  });
  assert.equal(oakMilled.body.rawEvaluation.status, 'REFUSED');
  assert.equal(oakMilled.body.priceCompleteness.status, 'REFUSED');
  assert.ok(
    oakMilled.body.rawEvaluation.lines
      .find((line) => line.role === 'SHELVES')
      .capability.missing.includes('OP_NOT_ON_OFFERING:MILL_LONGITUDINAL_PROFILE'),
  );
  assert.equal(oakMilled.body.rawEstimate.totals.Q, null);

  const oakCutOnly = await answer('oak', {
    heightIn: 65,
    depthIn: 11,
    withPrograms: true,
    unresolvedConditions: [],
  });
  assert.equal(oakCutOnly.body.rawEvaluation.status, 'SUPPORTABLE');
  assert.equal(oakCutOnly.body.priceCompleteness.status, 'COMPLETE_FOR_DECLARED_COMPONENT_TRAVEL');
  assert.equal(oakCutOnly.body.rawEvaluation.machineEvaluation.time.T_MILL_sec, 0);
  assert.equal(oakCutOnly.body.rawEstimate.totals.Q, 366.02);

  const cherryCutOnly = await answer('cherry', {
    heightIn: 65,
    depthIn: 11,
    withPrograms: true,
    unresolvedConditions: [],
  });
  assert.equal(cherryCutOnly.body.rawEvaluation.status, 'SUPPORTABLE');
  assert.equal(cherryCutOnly.body.priceCompleteness.status, 'COMPLETE_FOR_DECLARED_COMPONENT_TRAVEL');
  assert.equal(cherryCutOnly.body.rawEvaluation.machineEvaluation.time.T_MILL_sec, 0);
  assert.equal(cherryCutOnly.body.rawEstimate.totals.Q, 533.93);

  const exact72 = await answer('pine', {
    heightIn: 72,
    depthIn: 14,
    withPrograms: true,
    unresolvedConditions: [],
  });
  assert.equal(exact72.body.rawEvaluation.status, 'REFUSED');
  assert.ok(
    exact72.body.rawEvaluation.refusalConditions.includes(
      'COMPONENTS_EXCEED_DECLARED_PARENT_MATERIAL:ALCOVE-UPRIGHT-PARENTS',
    ),
  );
  assert.equal(exact72.body.rawEstimate.totals.Q, null);
});

test('ALCOVE_INSERT_V1 carries shelf spotting to Store and fails on the current narrower face-spot envelope', async (t) => {
  await withHost(t);

  const spotted = await answer('pine', { pilot: true });
  assert.equal(spotted.body.rawEvaluation.status, 'REFUSED');
  assert.equal(spotted.body.priceCompleteness.status, 'REFUSED');
  const uprights = spotted.body.rawEvaluation.lines.find((line) => line.role === 'UPRIGHTS');
  assert.ok(uprights.requiredOps.includes('SPOT_ON_LOCATION'));
  assert.equal(uprights.capability.status, 'REFUSED');
  assert.ok(uprights.capability.missing.includes('SPOT_LOCATION_RULE_NOT_DECLARED'));
  assert.ok(
    spotted.body.rawEvaluation.unresolvedConditions.includes(
      'ALCOVE_FACE_SPOT_DEMAND_OUTSIDE_CURRENT_DECLARED_SPOT_ENVELOPE',
    ),
  );
  assert.equal(spotted.body.rawEstimate.totals.Q, null);
});

test('System carries Alcove demand but contains no Alcove Store clone economics', () => {
  const adapter = fs.readFileSync(new URL('../../server/store-adapter.mjs', import.meta.url), 'utf8');
  const wire = fs.readFileSync(new URL('../../shared/store-wire.mjs', import.meta.url), 'utf8');

  for (const rejected of [
    'STORE_FIXTURE',
    'RECOVERY[across]',
    'CYCLE[across]',
    '15.74',
    '20.99',
    '32.18',
    '55.98',
    '374.42',
  ]) {
    assert.equal(adapter.includes(rejected), false, 'adapter contains Alcove Store clone token: ' + rejected);
    assert.equal(wire.includes(rejected), false, 'wire contains Alcove Store clone token: ' + rejected);
  }
  assert.match(adapter, /requestAlcoveStoreEvaluation/);
  assert.match(adapter, /evaluateAlcoveStoreRequest/);
  assert.match(adapter, /No local fallback was used/);
});

console.log('PASS · System Alcove request is Store-owned, species-sensitive, and fail-first');
