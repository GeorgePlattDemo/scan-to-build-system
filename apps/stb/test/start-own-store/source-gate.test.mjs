import test from 'node:test';
import assert from 'node:assert/strict';

import {
  START_OWN_STORE_PIN,
  buildStartOwnStoreRequest,
  inspectStartOwnStoreResponse,
} from '../../shared/start-own-store-wire.mjs';
import {
  inspectStartOwnStoreSource,
  loadStartOwnStoreModules,
  startOwnStoreRootFromEnv,
} from '../../server/start-own-store-source.mjs';
import { createStartOwnStoreAdapter } from '../../server/start-own-store-adapter.mjs';

function requireRoot() {
  const root = startOwnStoreRootFromEnv();
  assert.ok(root, 'STB_STORE_START_OWN_ROOT must point to the exact clean Start Own Store checkout');
  return root;
}

const defaultDemand = Object.freeze({
  sizeKey: '2x8',
  finishedLengthIn: 33.75,
  partQty: 8,
  angleDeg: 30,
  cutPlane: 'miter-face',
  endIdentity: 'both',
  endRelation: 'parallel',
  lengthDatum: 'long-long-outer-edge',
});

test('exact clean Start Own Store pin loads the user-defined miter path', async () => {
  const root = requireRoot();
  const inspection = await inspectStartOwnStoreSource(root);
  assert.equal(inspection.ok, true, JSON.stringify(inspection));
  assert.equal(inspection.head, START_OWN_STORE_PIN);

  const loaded = await loadStartOwnStoreModules(root);
  assert.equal(loaded.ok, true, JSON.stringify(loaded.inspection));
  assert.equal(typeof loaded.modules.evaluateUserDefinedBoardJob, 'function');
  assert.equal(loaded.modules.D001_STAGE2_ENVELOPE.id, 'D001-STAGE2-ENVELOPE-0.3');
  assert.equal(loaded.modules.D001_STAGE2_ENVELOPE.saw.bladeDiameterIn, 20);
  assert.equal(loaded.modules.D001_STAGE2_ENVELOPE.saw.strokeDirection, 'DOWN');
  assert.equal(loaded.modules.D001_STAGE2_ENVELOPE.saw.miterAbsMaxDeg, 45);
});

test('Claude Grab a Board default gets exact material, capability, and partial economics', async () => {
  const adapter = await createStartOwnStoreAdapter({ storeRoot: requireRoot() });
  assert.equal(adapter.ready, true, JSON.stringify(adapter.inspection));

  const request = await buildStartOwnStoreRequest({
    projectId: 'project-start-own-proof',
    definitionId: 'SYO-SHA256-proof',
    payload: defaultDemand,
  });
  const result = await adapter.dispatch(request);
  assert.equal(result.status, 200);
  assert.equal(inspectStartOwnStoreResponse(request, result.body).ok, true);

  const answer = result.body;
  assert.equal(answer.storePin, START_OWN_STORE_PIN);
  assert.equal(answer.rawEvaluation.status, 'SUPPORTABLE');
  assert.equal(answer.rawEvaluation.materialResolution.storeSku, 'STB-ZERO-SPF-2X8-96-001');
  assert.equal(answer.rawEvaluation.materialResolution.quantity, 4);
  assert.equal(answer.rawEvaluation.materialResolution.materialTotal, 39.8);
  assert.equal(answer.rawEvaluation.materialResolution.modeledWork.finishedParts, 8);
  assert.equal(answer.rawEvaluation.materialResolution.modeledWork.cutCount, 12);
  assert.equal(answer.rawEvaluation.capability.status, 'SUPPORTABLE');

  assert.equal(answer.rawEstimate.status, 'BUDGETARY_PARTIAL');
  assert.equal(answer.rawEstimate.totals.material, 39.8);
  assert.equal(answer.rawEstimate.totals.cell_recovery, null);
  assert.equal(answer.rawEstimate.totals.Q, null);
  assert.equal(answer.rawEstimate.economics.status, 'UNRESOLVED_CLASS_SCOPED_RECOVERY');
  assert.ok(answer.rawEstimate.cycle.T_job_min > 0);
  assert.equal(answer.physicalExecutionAuthorized, false);
  assert.equal(answer.controllerOutputProduced, false);
});

test('46 degree demand reaches Store and is refused by the 45 degree machine envelope', async () => {
  const adapter = await createStartOwnStoreAdapter({ storeRoot: requireRoot() });
  const request = await buildStartOwnStoreRequest({
    projectId: 'project-start-own-46',
    definitionId: 'SYO-SHA256-46',
    payload: { ...defaultDemand, angleDeg: 46 },
  });
  const result = await adapter.dispatch(request);
  assert.equal(result.status, 200);
  assert.equal(result.body.rawEvaluation.status, 'REFUSED');
  assert.ok(
    result.body.rawEvaluation.capability.missing.includes('MITER_ANGLE_EXCEEDS_D001_STAGE2_ENVELOPE'),
  );
  assert.equal(result.body.rawEstimate, null);
});

test('bevel-through-thickness is not smuggled through the face-miter capability', async () => {
  const adapter = await createStartOwnStoreAdapter({ storeRoot: requireRoot() });
  const request = await buildStartOwnStoreRequest({
    projectId: 'project-start-own-bevel',
    definitionId: 'SYO-SHA256-bevel',
    payload: { ...defaultDemand, cutPlane: 'bevel-thickness' },
  });
  const result = await adapter.dispatch(request);
  assert.equal(result.status, 200);
  assert.equal(result.body.rawEvaluation.status, 'REFUSED');
  assert.ok(
    result.body.rawEvaluation.capability.missing.some((reason) =>
      reason === 'MITER_PLANE_NOT_SUPPORTED' || reason === 'BEVEL_OR_COMPOUND_MITER_NOT_DECLARED'
    ),
  );
  assert.equal(result.body.rawEstimate, null);
});
