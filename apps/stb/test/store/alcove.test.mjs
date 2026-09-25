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
  assert.equal(pine.body.rawEvaluation.status, 'SUPPORTABLE');
  assert.equal(pine.body.rawEvaluation.complete, true);
  assert.equal(pine.body.priceCompleteness.status, 'COMPLETE_FOR_DECLARED_COMPONENT_TRAVEL');
  assert.deepEqual(
    pine.body.rawEvaluation.lines.map((line) => [line.role, line.storeSku, line.qty, line.status]),
    [
      ['UPRIGHTS', 'STB-ZERO-PINE-1X6-72-001', 4, 'SUPPORTABLE'],
      ['SHELVES', 'STB-ZERO-PINE-1X6-96-001', 8, 'SUPPORTABLE'],
    ],
  );
  assert.equal(
    pine.body.rawEvaluation.materialResolution.selectionPolicy,
    'LOWEST_MATERIAL_EXTENSION_COMPLETE_STORE_OFFERING',
  );
  assert.equal(pine.body.rawEstimate.totals.material, 230.88);
  assert.equal(pine.body.rawEstimate.totals.hardware, 18);
  assert.equal(pine.body.rawEstimate.totals.machine_service, 133.67);
  assert.equal(pine.body.rawEstimate.totals.Q, 382.55);

  const poplar = await answer('poplar');
  assert.equal(poplar.body.rawEvaluation.status, 'SUPPORTABLE');
  assert.deepEqual(
    poplar.body.rawEvaluation.lines.map((line) => line.storeSku),
    ['STB-ZERO-POP-1X6-72-001', 'STB-ZERO-POP-1X6-96-001'],
  );
  assert.equal(poplar.body.rawEstimate.totals.material, 354);
  assert.equal(poplar.body.rawEstimate.totals.Q, 505.67);
  assert.notEqual(
    pine.body.calculationIdentity.inputHash,
    poplar.body.calculationIdentity.inputHash,
  );
  assert.notEqual(
    pine.body.evaluationReceipt.receiptHash,
    poplar.body.evaluationReceipt.receiptHash,
  );
});

test('ALCOVE_INSERT_V1 returns Store-owned material and capability gap reasons', async (t) => {
  await withHost(t);

  const missingMaterial = await answer('walnut');
  assert.equal(missingMaterial.body.rawEvaluation.status, 'UNAVAILABLE');
  assert.equal(missingMaterial.body.priceCompleteness.status, 'UNAVAILABLE');
  assert.ok(
    missingMaterial.body.priceCompleteness.reasonRecords.some(
      (reason) => reason.category === 'MATERIAL_GAP' && reason.authority === 'STORE_ZERO',
    ),
  );
  assert.equal(missingMaterial.body.rawEstimate.totals.Q, null);

  const oakMilled = await answer('oak', {
    heightIn: 65,
    depthIn: 14,
    unresolvedConditions: [],
  });
  assert.equal(oakMilled.body.rawEvaluation.status, 'REFUSED');
  assert.equal(oakMilled.body.priceCompleteness.status, 'REFUSED');
  assert.ok(
    oakMilled.body.priceCompleteness.reasonRecords.some(
      (reason) => reason.category === 'CAPABILITY_GAP' && reason.authority === 'STORE_ZERO',
    ),
  );
  assert.equal(oakMilled.body.rawEstimate.totals.Q, null);
});

test('ALCOVE_INSERT_V1 prices governed cut and mill component travel and depth changes required work', async (t) => {
  await withHost(t);

  const pine = await answer('pine', {
    heightIn: 65,
    depthIn: 14,
    unresolvedConditions: [],
  });
  assert.equal(pine.body.rawEvaluation.status, 'SUPPORTABLE');
  assert.equal(pine.body.priceCompleteness.status, 'COMPLETE_FOR_DECLARED_COMPONENT_TRAVEL');
  assert.deepEqual(pine.body.priceCompleteness.unresolvedConditions, []);
  assert.equal(pine.body.rawEstimate.status, 'BUDGETARY_ESTIMATE');
  assert.equal(pine.body.rawEstimate.complete, true);
  assert.equal(pine.body.rawEstimate.totals.material, 230.88);
  assert.equal(pine.body.rawEstimate.totals.hardware, 18);
  assert.equal(pine.body.rawEstimate.totals.machine_service, 133.67);
  assert.equal(pine.body.rawEstimate.totals.Q, 382.55);
  assert.equal(pine.body.rawEstimate.cycle.T_job_min, 32.0801);
  assert.ok(pine.body.rawEvaluation.machineEvaluation.time.T_MILL_sec > 0);
  assert.equal(pine.body.mappedCallInputs.definition.componentPrograms.length, 19);

  const shallow = await answer('pine', {
    heightIn: 65,
    depthIn: 11,
    unresolvedConditions: [],
  });
  assert.equal(shallow.body.rawEvaluation.status, 'SUPPORTABLE');
  assert.equal(shallow.body.rawEvaluation.machineEvaluation.time.T_MILL_sec, 0);
  assert.notEqual(shallow.body.calculationIdentity.inputHash, pine.body.calculationIdentity.inputHash);
  assert.notEqual(shallow.body.rawEstimate.totals.Q, pine.body.rawEstimate.totals.Q);

  const oakCutOnly = await answer('oak', {
    heightIn: 65,
    depthIn: 11,
    unresolvedConditions: [],
  });
  assert.equal(oakCutOnly.body.rawEvaluation.status, 'SUPPORTABLE');
  assert.equal(oakCutOnly.body.rawEstimate.totals.Q, 366.02);

  const cherryCutOnly = await answer('cherry', {
    heightIn: 65,
    depthIn: 11,
    unresolvedConditions: [],
  });
  assert.equal(cherryCutOnly.body.rawEvaluation.status, 'SUPPORTABLE');
  assert.equal(cherryCutOnly.body.rawEstimate.totals.Q, 533.93);

  const exact72 = await answer('pine', {
    heightIn: 72,
    depthIn: 14,
    unresolvedConditions: [],
  });
  assert.equal(exact72.body.rawEvaluation.status, 'SUPPORTABLE');
  const uprights = exact72.body.rawEvaluation.lines.find((line) => line.role === 'UPRIGHTS');
  assert.equal(uprights.storeSku, 'STB-ZERO-PINE-1X6-96-001');
  assert.equal(uprights.demandedStockLengthIn, 96);
});

test('ALCOVE_INSERT_V1 carries spotting to Store and reports the unresolved target-component mapping', async (t) => {
  await withHost(t);

  const spotted = await answer('pine', { pilot: true });
  assert.equal(spotted.body.rawEvaluation.status, 'UNRESOLVED');
  assert.equal(spotted.body.priceCompleteness.status, 'PARTIAL');
  const uprights = spotted.body.rawEvaluation.lines.find((line) => line.role === 'UPRIGHTS');
  assert.ok(uprights.requiredOps.includes('SPOT_ON_LOCATION'));
  assert.equal(uprights.capability.status, 'SUPPORTABLE');
  assert.ok(
    spotted.body.priceCompleteness.reasonRecords.some(
      (reason) =>
        reason.category === 'DEFINITION_GAP' &&
        reason.code === 'ALCOVE_SPOT_TARGET_COMPONENT_MAPPING_REQUIRED',
    ),
  );
  assert.equal(spotted.body.rawEstimate.totals.Q, null);
});

test('ALCOVE_INSERT_V1 upright spots at 1 1/2 in or 2 in are timed and priced; any other inset is refused by Store', async (t) => {
  await withHost(t);

  const plain = await answer('pine', { heightIn: 72 });
  assert.equal(plain.body.rawEvaluation.status, 'SUPPORTABLE');
  const plainQ = plain.body.rawEstimate.totals.Q;

  let previousSpotSec = 0;
  for (const inset of [1.5, 2]) {
    const spotted = await answer('pine', { heightIn: 72, pilot: true, uprightSpotInsetIn: inset });
    assert.equal(spotted.body.rawEvaluation.status, 'SUPPORTABLE', inset + ' in inset is supportable');
    assert.equal(spotted.body.evaluationReceipt.authority.storeRevision, STORE_PIN);
    const time = spotted.body.rawEvaluation.machineEvaluation.time;
    assert.ok(time.T_DRILL_SPOT_sec > previousSpotSec, inset + ' in: spot time is modeled and grows with the inset');
    previousSpotSec = time.T_DRILL_SPOT_sec;
    assert.ok(spotted.body.rawEstimate.totals.Q > plainQ, inset + ' in: spots are priced');
    const spotOps = spotted.body.rawEvaluation.machineEvaluation.componentPlans
      .flatMap((plan) => plan.operations.filter((op) => op.kind === 'SPOT_ON_LOCATION'));
    assert.equal(spotOps.length, 20, 'one spot per upright per shelf: 4 uprights x 5 shelves');
  }

  // System carries the number as entered; only Store decides. 1 3/4 in is not a declared inset.
  const undeclared = await answer('pine', { heightIn: 72, pilot: true, uprightSpotInsetIn: 1.75 });
  assert.equal(undeclared.body.rawEvaluation.status, 'REFUSED');
  assert.ok(JSON.stringify(undeclared.body.rawEvaluation).includes('SPOT_INSET_NOT_DECLARED'));
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
