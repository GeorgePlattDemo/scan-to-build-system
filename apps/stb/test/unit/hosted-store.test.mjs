import assert from 'node:assert/strict';
import test from 'node:test';

import { STORE_PATHS } from '../../shared/contracts.mjs';
import { rawRequest } from '../helpers/http.mjs';
import { PUBLIC_REVIEW_ORIGIN, startHostedStore } from '../../server/hosted-store.mjs';

function fakeAdapter() {
  let calls = 0;
  return {
    ready: true,
    inspection: { ok: true, head: 'test-store-pin', dirty: false },
    get calls() {
      return calls;
    },
    async dispatch(body) {
      calls += 1;
      return {
        status: 200,
        body: {
          ok: true,
          echoed: body,
        },
      };
    },
  };
}

test('hosted Store transport exposes health and only accepts the public Review origin', async (t) => {
  const adapter = fakeAdapter();
  const host = await startHostedStore({
    host: '127.0.0.1',
    port: 0,
    storeAdapter: adapter,
  });
  t.after(() => host.close());

  const health = await rawRequest({
    port: host.port,
    path: '/healthz',
    headers: { Host: 'hosted-store.example' },
  });
  assert.equal(health.status, 200);
  assert.equal(health.body, 'ok');

  const preflight = await rawRequest({
    port: host.port,
    path: STORE_PATHS.job,
    method: 'OPTIONS',
    headers: {
      Host: 'hosted-store.example',
      Origin: PUBLIC_REVIEW_ORIGIN,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type',
    },
  });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers['access-control-allow-origin'], PUBLIC_REVIEW_ORIGIN);

  const wrongOrigin = await rawRequest({
    port: host.port,
    path: STORE_PATHS.job,
    method: 'POST',
    headers: {
      Host: 'hosted-store.example',
      Origin: 'https://example.invalid',
      'Content-Type': 'application/json',
    },
    body: '{}',
  });
  assert.equal(wrongOrigin.status, 403);
  assert.equal(adapter.calls, 0);

  const missingOrigin = await rawRequest({
    port: host.port,
    path: STORE_PATHS.job,
    method: 'POST',
    headers: {
      Host: 'hosted-store.example',
      'Content-Type': 'application/json',
    },
    body: '{}',
  });
  assert.equal(missingOrigin.status, 403);
  assert.equal(adapter.calls, 0);

  const accepted = await rawRequest({
    port: host.port,
    path: STORE_PATHS.job,
    method: 'POST',
    headers: {
      Host: 'hosted-store.example',
      Origin: PUBLIC_REVIEW_ORIGIN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ hello: 'store' }),
  });
  assert.equal(accepted.status, 200);
  assert.equal(accepted.headers['access-control-allow-origin'], PUBLIC_REVIEW_ORIGIN);
  assert.deepEqual(JSON.parse(accepted.body), {
    ok: true,
    echoed: { hello: 'store' },
  });
  assert.equal(adapter.calls, 1);
});
