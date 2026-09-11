import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import test from 'node:test';

import { STORE_PIN, STORE_PATHS } from '../../shared/contracts.mjs';
import { ADAPTER_ERROR_CODES } from '../../shared/store-wire.mjs';
import { inspectStoreSource, loadPinnedStoreModules } from '../../server/store-source.mjs';
import { createStoreAdapter } from '../../server/store-adapter.mjs';
import { startServer } from '../../server/main.mjs';
import { postJson, rawRequest } from '../helpers/http.mjs';
import { offeringLookupBody, requireStoreRoot } from './helpers.mjs';

function makeTempDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function git(cwd, args) {
  return execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
}

test('missing STB_STORE_ZERO_ROOT fails closed without fabricating Store data', async () => {
  const inspection = await inspectStoreSource(null);
  assert.equal(inspection.ok, false);
  assert.equal(inspection.code, ADAPTER_ERROR_CODES.STORE_SOURCE_UNAVAILABLE);
  const adapter = await createStoreAdapter({ storeRoot: null });
  assert.equal(adapter.ready, false);
  const body = await offeringLookupBody();
  const result = await adapter.dispatch(body);
  assert.equal(result.status, 503);
  assert.equal(result.body.adapterError, true);
  assert.equal(result.body.rawEvaluation, undefined);
  assert.equal(result.body.code, ADAPTER_ERROR_CODES.STORE_SOURCE_UNAVAILABLE);
});

test('nonexistent Store root fails closed', async () => {
  const inspection = await inspectStoreSource(path.join(os.tmpdir(), 'stb-store-missing-' + Date.now()));
  assert.equal(inspection.ok, false);
  assert.equal(inspection.code, ADAPTER_ERROR_CODES.STORE_SOURCE_UNAVAILABLE);
});

test('wrong Store pin fails closed and does not load a substitute', async () => {
  const dir = makeTempDir('stb-store-wrong-pin-');
  git(dir, ['init']);
  git(dir, ['config', 'user.email', 'gate@example.test']);
  git(dir, ['config', 'user.name', 'Gate']);
  fs.writeFileSync(path.join(dir, 'README.md'), 'not the pin\n');
  git(dir, ['add', '.']);
  git(dir, ['commit', '-m', 'wrong']);
  const inspection = await inspectStoreSource(dir);
  assert.equal(inspection.ok, false);
  assert.equal(inspection.code, ADAPTER_ERROR_CODES.STORE_PIN_MISMATCH);
  assert.notEqual(inspection.head, STORE_PIN);
  fs.rmSync(dir, { recursive: true, force: true });
});

test('dirty exact-pin checkout fails closed', async () => {
  const root = requireStoreRoot();
  const clean = await inspectStoreSource(root);
  assert.equal(clean.ok, true, JSON.stringify(clean));
  const marker = path.join(root, '.stb-app-gate-dirty-marker');
  fs.writeFileSync(marker, 'dirty\n');
  try {
    const dirty = await inspectStoreSource(root);
    assert.equal(dirty.ok, false);
    assert.equal(dirty.code, ADAPTER_ERROR_CODES.STORE_CHECKOUT_DIRTY);
    assert.equal(dirty.head, STORE_PIN);
  } finally {
    fs.unlinkSync(marker);
  }
  const restored = await inspectStoreSource(root);
  assert.equal(restored.ok, true);
});

test('exact clean pin loads required Store functions', async () => {
  const root = requireStoreRoot();
  const loaded = await loadPinnedStoreModules(root);
  assert.equal(loaded.ok, true, JSON.stringify(loaded.inspection));
  assert.equal(typeof loaded.modules.findSku, 'function');
  assert.equal(typeof loaded.modules.offerMaterial, 'function');
  assert.equal(typeof loaded.modules.evaluateJob, 'function');
  assert.equal(typeof loaded.modules.estimateJob, 'function');
  assert.equal(typeof loaded.modules.envelopeCheck, 'function');
  assert.equal(loaded.modules.ENGINE.version, '0.2.2');
  assert.equal(loaded.modules.CYCLE_MODEL.id, 'STB-D001-CYCLE-MODEL-S2-0.1');
  assert.equal(loaded.modules.D001_STAGE2_ENVELOPE.id, 'D001-STAGE2-ENVELOPE-0.2');
});

test('unavailable Store source leaves static host usable and Store endpoints diagnostic', async (t) => {
  const adapter = await createStoreAdapter({ storeRoot: null });
  const host = await startServer({ storeAdapter: adapter });
  t.after(() => host.close());
  assert.equal(host.storeReady, false);
  const page = await rawRequest({ path: '/' });
  assert.equal(page.status, 200);
  assert.match(page.body, /Scan-to-Build/);
  const body = await offeringLookupBody();
  const offering = await postJson(STORE_PATHS.offering, body);
  assert.equal(offering.status, 503);
  const parsed = JSON.parse(offering.body);
  assert.equal(parsed.adapterError, true);
  assert.equal(parsed.rawEvaluation, undefined);
});
