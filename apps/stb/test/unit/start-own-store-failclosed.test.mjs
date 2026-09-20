import test from 'node:test';
import assert from 'node:assert/strict';

import { buildStartOwnStoreRequest } from '../../shared/start-own-store-wire.mjs';
import { createStartOwnStoreAdapter } from '../../server/start-own-store-adapter.mjs';

test('missing Start Own Store source fails closed without a fabricated answer', async () => {
  const adapter = await createStartOwnStoreAdapter({ storeRoot: null });
  assert.equal(adapter.ready, false);
  const request = await buildStartOwnStoreRequest({
    projectId: 'project-start-own-fail-closed',
    definitionId: 'SYO-SHA256-fail-closed',
    payload: {
      sizeKey: '2x8',
      finishedLengthIn: 33.75,
      partQty: 8,
      angleDeg: 30,
      cutPlane: 'miter-face',
      endIdentity: 'both',
      endRelation: 'parallel',
      lengthDatum: 'long-long-outer-edge',
    },
  });
  const result = await adapter.dispatch(request);
  assert.equal(result.status, 503);
  assert.equal(result.body.adapterError, true);
  assert.equal(result.body.code, 'STORE_SOURCE_UNAVAILABLE');
  assert.equal(result.body.rawEvaluation, undefined);
  assert.equal(result.body.rawEstimate, undefined);
});
