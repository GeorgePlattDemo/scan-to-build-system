// Guard: the Start-your-own page carries four cached Store answers (16 in and 18 in, each for SPF and for
// treated SYP) in public-build/stb-store-handoff-contract.js so the bench can show a wood's price before sending.
// A cached answer is only allowed if it is exactly what the Store at System's STORE_PIN returns.
// This test sends every reference demand, with its own wood, through the pinned Store and fails on any difference,
// so moving STORE_PIN without refreshing the cache (or editing the cache by hand) turns CI red.
// It also checks the Store items the SKU box looks up against store-zero-catalog.json at the pin.

import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { STORE_PIN } from '../../shared/contracts.mjs';
import { createStoreAdapter } from '../../server/store-adapter.mjs';
import { startServer } from '../../server/main.mjs';
import { parseJson, postJob, requireCleanPinnedStore, userDefinedBoardJobBody } from './helpers.mjs';

const CONTRACT = fileURLToPath(new URL('../../public-build/stb-store-handoff-contract.js', import.meta.url));

function loadContract() {
  const sandbox = {};
  sandbox.window = sandbox;
  sandbox.self = sandbox;
  vm.runInNewContext(fs.readFileSync(CONTRACT, 'utf8'), sandbox, { filename: 'stb-store-handoff-contract.js' });
  return sandbox.STBStoreHandoffContract;
}

function referenceDemandBody(reference) {
  const d = reference.demand;
  const parts = [1, 2].map((number) => ({
    partId: 'PART-' + number,
    lengthIn: d.partLengthIn,
    features: [{
      featureId: 'SPOT-' + number,
      kind: d.spotMode,
      xIn: d.spotXIn,
      locationRule: d.spotLocationRule,
      acrossWidthRule: d.spotAcrossWidthRule,
    }],
  }));
  return userDefinedBoardJobBody({
    configurationId: d.configurationId,
    configurationVersion: d.configurationVersion,
    definedWorkpieceLengthIn: d.definedWorkpieceLengthIn,
    sawCuts: d.declaredSawCuts,
    // The page sends the derived angle rounded to 12 places (system-build-current.html, syncDefinition).
    sawAngleDeg: Number(Number(d.sawAngleDeg).toFixed(12)),
    requiredOps: [...d.requiredOps],
    cutPlane: d.cutPlane,
    endIdentity: d.endIdentity,
    endRelation: d.endRelation,
    lengthDatum: d.lengthDatum,
    datumCMethod: d.datumCMethod,
    parts,
    materialDemand: { ...d.materialDemand },
  });
}

const pick = (object, keys) => Object.fromEntries(keys.map((key) => [key, object?.[key]]));

test('cached User 1 Store references equal the Store at STORE_PIN, field for field', async (t) => {
  await requireCleanPinnedStore();
  const adapter = await createStoreAdapter();
  assert.equal(adapter.ready, true, JSON.stringify(adapter.inspection));
  const host = await startServer({ storeAdapter: adapter });
  t.after(() => host.close());

  const contract = loadContract();
  const references = [...(contract.user1StoreReferences || [])];
  assert.equal(references.length, 4, 'all four cached references (16 in and 18 in, SPF and treated SYP) are exported');
  assert.deepEqual(references.map((r) => r.demand.materialDemand.species + '@' + r.demand.partLengthIn),
    ['spf@16', 'spf@18', 'syp-treated@16', 'syp-treated@18']);

  for (const reference of references) {
    const label = reference.demand.materialDemand.species + ' ' + reference.demand.partLengthIn + '-in reference';
    assert.equal(reference.source.storePin, STORE_PIN, label + ': cached source pin is System STORE_PIN');
    assert.equal(reference.materialResolution.source.pin, STORE_PIN, label + ': cached catalog pin is System STORE_PIN');

    const body = parseJson(await postJob(await referenceDemandBody(reference)));
    assert.equal(body.evaluationReceipt.authority.storeRevision, STORE_PIN, label + ': answered by the pinned Store');
    const live = body.rawEstimate;
    const cached = reference.estimate;

    assert.deepEqual(
      pick(cached, ['status', 'complete', 'completeness', 'documentKind']),
      pick(live, ['status', 'complete', 'completeness', 'documentKind']),
      label + ': estimate status',
    );
    assert.deepEqual(pick(cached.engine, ['id', 'version', 'clock', 'documentKind']), pick(live.engine, ['id', 'version', 'clock', 'documentKind']), label + ': pricing engine');
    const cycleKeys = ['model', 'version', 'basis', 'measured', 'commissioned', 'T_job_min'];
    assert.deepEqual(pick(cached.cycle, cycleKeys), pick(live.cycle, cycleKeys), label + ': cycle');
    assert.deepEqual({ ...cached.totals }, { ...live.totals }, label + ': totals');
    const travelKeys = ['derivedSawCuts', 'derivedSpotCount', 'finalRemainderIn'];
    assert.deepEqual(pick(cached.travel, travelKeys), pick(live.travel, travelKeys), label + ': travel');
    const economicsKeys = Object.keys(cached.economics);
    assert.deepEqual(pick(cached.economics, economicsKeys), pick(live.economics, economicsKeys), label + ': economics');
    assert.deepEqual({ ...cached.calculationIdentity }, { ...body.calculationIdentity }, label + ': calculation identity');

    const materialKeys = [
      'status', 'storeSku', 'pricingReferenceSku', 'pricingReferenceStockLengthIn',
      'requestedMinimumWorkpieceLengthIn', 'requestedDefinedWorkpieceLengthIn',
      'workpieceLengthIn', 'selectionPolicy', 'allocationClaimed',
    ];
    assert.deepEqual(pick(reference.materialResolution, materialKeys), pick(body.materialResolution, materialKeys), label + ': material resolution');
    assert.equal(body.materialResolution.materialDemand.species, reference.demand.materialDemand.species, label + ': the Store resolved the stated wood');
    // The board facts the bench shows come from the Store's offering for that wood.
    assert.equal(reference.materialResolution.unitPrice, body.rawOffering.sellingPrice, label + ': unit price');
    assert.equal(reference.materialResolution.stockLengthIn, body.rawOffering.stockL_in, label + ': stock length');
    assert.deepEqual([...reference.materialResolution.supportedOps], body.rawOffering.supportedOps, label + ': supported operations');
    assert.deepEqual([...reference.materialResolution.cellFamily], body.rawOffering.cellFamily, label + ': cell family');
    // The cache lives in a vm sandbox; compare plain JSON so array prototypes do not matter.
    assert.deepEqual(
      JSON.parse(JSON.stringify(reference.materialResolution.consideredCandidates.map((c) => [c.storeSku, c.stockLengthIn, c.candidateStatus, c.reason]))),
      body.materialResolution.consideredCandidates.map((c) => [c.storeSku, c.stockLengthIn, c.candidateStatus, c.reason]),
      label + ': considered candidates',
    );
  }
});

test('the Store items the SKU box looks up are the nominal 2×4 boards in the catalog at STORE_PIN, row for row', async () => {
  const root = await requireCleanPinnedStore();
  const catalog = JSON.parse(fs.readFileSync(path.join(root, 'store-zero-catalog.json'), 'utf8'));
  const boards = catalog.offerings
    .filter((o) => o.form === 'board' && o.nominalT === 2 && o.nominalW === 4)
    .map((o) => [o.storeSku, o.species, o.grade, o.stockL_in, o.sellingPrice, o.description]);
  const contract = loadContract();
  assert.deepEqual(JSON.parse(JSON.stringify(contract.startOwnStoreItems)), boards);
  for (const [storeSku, species] of boards) {
    const item = contract.startOwnStoreItem(storeSku.toLowerCase());
    assert.equal(item.species, species);
    assert.equal(item.catalogPin, STORE_PIN, storeSku + ': looked up in the catalog at System STORE_PIN');
  }
  assert.ok(boards.some((row) => row[1] === 'cedar'), 'cedar stays in the Store catalog');
});

// The material swatches consume this mapped subset, not a second Store evaluator.
test('material swatch catalog projection matches STORE_PIN for every mapped offering', async () => {
  const root = await requireCleanPinnedStore();
  const catalog = JSON.parse(fs.readFileSync(path.join(root, 'store-zero-catalog.json'), 'utf8'));
  const contract = loadContract();
  assert.equal(contract.startOwnStoreCatalog.pin, STORE_PIN);
  assert.equal(contract.startOwnStoreCatalog.clock, catalog.clock);
  const keys = ['2x4', '2x6', '2x8', '4x4', '1x4p', '1x6p', '1x4o', '1x6o', '1x8o', '1x4c', '1x6c', '1x6w', 'p25', 'p38', 'p50', 'p63', 'p75', 'o75'];
  let count = 0;
  for (const key of keys) {
    for (const row of contract.startOwnOfferings(key)) {
      count += 1;
      const original = catalog.offerings.find((o) => o.storeSku === row.storeSku);
      assert.ok(original, row.storeSku + ': mapped Store item exists');
      const fields = ['form', 'stockL_in', 'sheetW_in', 'sheetL_in', 'sellingPrice', 'supportedOps', 'cellFamily', 'offered'];
      assert.deepEqual(JSON.parse(JSON.stringify(pick(row, fields))), pick(original, fields), row.storeSku + ': catalog projection');
    }
  }
  assert.equal(count, 54, 'the existing mapped SKU subset is preserved');
  for (const key of ['1x6p', '1x6w', '1x6c', '1x8o', '2x4', 'p75']) {
    assert.ok(contract.startOwnOfferings(key).some((row) => row.offered === true), key + ': existing visible material choice stays available');
  }
});
