import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import path from 'node:path';
import test from 'node:test';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';

import { d001FeaturedBoardStoreSpec } from '../../shared/d001-featured-board.mjs';

const execFileAsync = promisify(execFile);
const STORE_CANDIDATE_PIN = '3e1f9f2c18668de86d92c6ccae7e79d3cadd35a1';
const root = process.env.STB_D001_STORE_CANDIDATE_ROOT ?? null;

async function loadCandidate() {
  if (!root) return null;
  const { stdout } = await execFileAsync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' });
  assert.equal(stdout.trim(), STORE_CANDIDATE_PIN);
  const porcelain = await execFileAsync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' });
  assert.equal(porcelain.stdout.trim(), '');
  const store = await import(pathToFileURL(path.join(root, 'store-zero-stage2-store.mjs')).href);
  const fiveTool = await import(pathToFileURL(path.join(root, 'd001-five-tool.mjs')).href);
  return { store, fiveTool };
}

test('D-001 five-tool candidate zipper: app requirement -> Store candidate', { skip: !root }, async () => {
  const modules = await loadCandidate();
  const catalog = modules.store.loadCatalog();
  const item = modules.store.findSku(catalog, 'STB-ZERO-SPF-2X4-72-001');

  const appDado = d001FeaturedBoardStoreSpec({
    keptLengthIn: 60,
    features: [{ kind: 'DADO', xFromLeftIn: 18, widthIn: 0.75, depthIn: 0.375 }],
  });
  assert.equal(appDado.valid, true);
  const storeDado = modules.fiveTool.evaluateD001FeaturedBoard(item, appDado.spec);
  assert.equal(storeDado.status, 'SUPPORTABLE');
  assert.equal(storeDado.featureResults[0].toolSlot, 'T2');

  const appTooDeep = d001FeaturedBoardStoreSpec({
    keptLengthIn: 60,
    features: [{ kind: 'DADO', xFromLeftIn: 18, widthIn: 0.75, depthIn: 0.5 }],
  });
  assert.equal(appTooDeep.valid, true);
  const storeTooDeep = modules.fiveTool.evaluateD001FeaturedBoard(item, appTooDeep.spec);
  assert.equal(storeTooDeep.status, 'REFUSED');
  assert.ok(storeTooDeep.reasons.includes('DADO:DADO_DEPTH_EXCEEDS_REFERENCE_ENVELOPE'));

  const appMiter = d001FeaturedBoardStoreSpec({
    keptLengthIn: 60,
    features: [{ kind: 'ANGLED_END_SINGLE_PLANE', end: 'RIGHT', angleDeg: 30 }],
  });
  assert.equal(appMiter.valid, true);
  const storeMiter = modules.fiveTool.evaluateD001FeaturedBoard(item, appMiter.spec);
  assert.equal(storeMiter.status, 'UNRESOLVED');
  assert.ok(storeMiter.unresolved.includes('ANGLED_END_SINGLE_PLANE:MITER_RANGE_NOT_PUBLISHED'));

  const appPilot = d001FeaturedBoardStoreSpec({
    keptLengthIn: 60,
    features: [{ kind: 'PILOT_FACE_3_16', xFromLeftIn: 20, yFromFenceIn: 1.75 }],
  });
  assert.equal(appPilot.valid, true);
  const storePilot = modules.fiveTool.evaluateD001FeaturedBoard(item, appPilot.spec);
  assert.equal(storePilot.status, 'SUPPORTABLE');
  assert.equal(storePilot.featureResults[0].derived.diameterIn, 0.1875);
});
