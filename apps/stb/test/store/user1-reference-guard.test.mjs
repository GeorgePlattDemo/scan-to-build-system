// Guard: the Start-your-own page carries two cached Store answers (16 in and 18 in) in
// public-build/stb-store-handoff-contract.js so it can show the reference order before sending.
// A cached answer is only allowed if it is exactly what the Store at System's STORE_PIN returns.
// This test sends both reference demands through the pinned Store and fails on any difference,
// so moving STORE_PIN without refreshing the cache (or editing the cache by hand) turns CI red.

import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import vm from 'node:vm';
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
  assert.equal(references.length, 2, 'both cached references (16 in and 18 in) are exported');

  for (const reference of references) {
    const label = reference.demand.partLengthIn + '-in reference';
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
    // The cache lives in a vm sandbox; compare plain JSON so array prototypes do not matter.
    assert.deepEqual(
      JSON.parse(JSON.stringify(reference.materialResolution.consideredCandidates.map((c) => [c.storeSku, c.stockLengthIn, c.candidateStatus, c.reason]))),
      body.materialResolution.consideredCandidates.map((c) => [c.storeSku, c.stockLengthIn, c.candidateStatus, c.reason]),
      label + ': considered candidates',
    );
  }
});
