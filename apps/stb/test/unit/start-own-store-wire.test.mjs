import test from 'node:test';
import assert from 'node:assert/strict';

import {
  START_OWN_STORE_PIN,
  START_OWN_STORE_REQUEST_TYPE,
  START_OWN_STORE_SCOPE,
  buildStartOwnStoreRequest,
  inspectStartOwnStoreResponse,
  validateStartOwnStoreRequest,
} from '../../shared/start-own-store-wire.mjs';

const demand = Object.freeze({
  sizeKey: '2x8',
  finishedLengthIn: 33.75,
  partQty: 8,
  angleDeg: 30,
  cutPlane: 'miter-face',
  endIdentity: 'both',
  endRelation: 'parallel',
  lengthDatum: 'long-long-outer-edge',
});

test('Start Own wire binds exact miter demand and Store pin', async () => {
  const request = await buildStartOwnStoreRequest({
    requestId: 'req-start-own-1',
    projectId: 'project-domain-1',
    definitionId: 'SYO-SHA256-example',
    attemptId: 'attempt-1',
    attemptNumber: 1,
    sentAt: '2026-09-20T06:30:00.000Z',
    payload: demand,
  });
  assert.equal(request.expectedStorePin, START_OWN_STORE_PIN);
  assert.equal(request.requestType, START_OWN_STORE_REQUEST_TYPE);
  assert.equal(request.scope, START_OWN_STORE_SCOPE);
  assert.equal(request.payload.lengthDatum, 'long-long-outer-edge');
  assert.equal((await validateStartOwnStoreRequest(request)).ok, true);
});

test('wire admits an out-of-envelope angle so Store can return a capability refusal', async () => {
  const request = await buildStartOwnStoreRequest({
    projectId: 'project-domain-1',
    definitionId: 'SYO-SHA256-angle-46',
    payload: { ...demand, angleDeg: 46 },
  });
  assert.equal((await validateStartOwnStoreRequest(request)).ok, true);
});

test('wire refuses missing datum and unexpected fields instead of interpreting them', async () => {
  await assert.rejects(
    () => buildStartOwnStoreRequest({
      projectId: 'project-domain-1',
      definitionId: 'SYO-SHA256-no-datum',
      payload: { ...demand, lengthDatum: undefined },
    }),
    /lengthDatum/,
  );
  await assert.rejects(
    () => buildStartOwnStoreRequest({
      projectId: 'project-domain-1',
      definitionId: 'SYO-SHA256-extra',
      payload: { ...demand, inventedPrice: 42 },
    }),
    /unexpected/,
  );
});

test('response correlation is exact including definition and Store pin', async () => {
  const request = await buildStartOwnStoreRequest({
    projectId: 'project-domain-1',
    definitionId: 'SYO-SHA256-correlation',
    payload: demand,
  });
  const base = {
    protocolVersion: request.protocolVersion,
    storePin: START_OWN_STORE_PIN,
    requestId: request.requestId,
    projectId: request.projectId,
    definitionId: request.definitionId,
    requestType: request.requestType,
    scope: request.scope,
    demandSignature: request.demandSignature,
    payloadDigest: request.payloadDigest,
    attemptId: request.attemptId,
    attemptNumber: request.attemptNumber,
  };
  assert.equal(inspectStartOwnStoreResponse(request, base).ok, true);
  assert.equal(
    inspectStartOwnStoreResponse(request, { ...base, definitionId: 'other-definition' }).ok,
    false,
  );
  assert.equal(
    inspectStartOwnStoreResponse(request, { ...base, storePin: 'wrong-pin' }).ok,
    false,
  );
});
