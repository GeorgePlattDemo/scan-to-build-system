import assert from 'node:assert/strict';
import os from 'node:os';
import test from 'node:test';

import { FIXED_HOST, FIXED_ORIGIN, FIXED_PORT } from '../../shared/contracts.mjs';
import { startServer } from '../../server/main.mjs';
import { connect, occupyPort, rawRequest } from '../helpers/http.mjs';

test('static host binds loopback, serves the foundation page and internal S-001 engine, and rejects invalid access', async (t) => {
  const host = await startServer();
  t.after(() => host.close());

  assert.equal(host.origin, FIXED_ORIGIN);
  assert.equal(host.port, FIXED_PORT);
  for (const address of host.addresses) {
    assert.ok(address.address === '127.0.0.1' || address.address === '::1');
    assert.equal(address.port, FIXED_PORT);
    assert.notEqual(address.address, '0.0.0.0');
  }

  const page = await rawRequest({ path: '/' });
  assert.equal(page.status, 200);
  assert.match(page.body, /Scan-to-Build/);
  assert.match(page.body, /NO BLOOD ON WOOD/);
  assert.match(page.body, /id="app"/);
  assert.match(page.headers['content-type'], /text\/html/);

  const moduleResponse = await rawRequest({ path: '/app.mjs' });
  assert.equal(moduleResponse.status, 200);
  assert.match(moduleResponse.headers['content-type'], /javascript/);

  const s001Engine = await rawRequest({ path: '/domain/s001-engine.mjs' });
  assert.equal(s001Engine.status, 200);
  assert.match(s001Engine.headers['content-type'], /javascript/);
  assert.match(s001Engine.body, /planS001CenteredArchDerivation/);

  const invalidHost = await rawRequest({
    headers: { Host: 'evil.example:4317' },
  });
  assert.equal(invalidHost.status, 403);

  const ipv4Host = await rawRequest({
    headers: { Host: '127.0.0.1:4317' },
  });
  assert.equal(ipv4Host.status, 403);

  const foreignOrigin = await rawRequest({
    headers: {
      Host: FIXED_HOST,
      Origin: 'http://evil.example',
    },
  });
  assert.equal(foreignOrigin.status, 403);

  const storePost = await rawRequest({
    method: 'POST',
    path: '/api/store',
    headers: { 'Content-Type': 'application/json' },
  });
  assert.notEqual(storePost.status, 200);
  assert.ok(storePost.status === 404 || storePost.status === 405);

  const localIpv4 = await connect('127.0.0.1', FIXED_PORT);
  assert.equal(localIpv4.connected, true);

  for (const nic of Object.values(os.networkInterfaces())) {
    for (const entry of nic ?? []) {
      if (entry.internal || entry.family !== 'IPv4') {
        continue;
      }
      const remote = await connect(entry.address, FIXED_PORT);
      assert.equal(remote.connected, false, `bound beyond loopback at ${entry.address}`);
    }
  }
});

test('occupied loopback port fails visibly and does not select another port', async () => {
  const blocker = await occupyPort('127.0.0.1', FIXED_PORT);
  try {
    await assert.rejects(
      () => startServer(),
      (error) => {
        assert.equal(error.code, 'EADDRINUSE');
        assert.match(error.message, /occupied/);
        assert.match(error.message, /Refusing to select another port/);
        return true;
      },
    );
  } finally {
    await blocker.close();
  }
});
