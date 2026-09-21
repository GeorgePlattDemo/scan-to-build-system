import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const coordinatorUrl = new URL('../../browser/integration/store-coordinator.mjs', import.meta.url);
const coordinatorPath = fileURLToPath(coordinatorUrl);
const source = fs.readFileSync(coordinatorUrl, 'utf8');

test('user-defined Board Store coordinator is syntactically complete', () => {
  const checked = spawnSync(process.execPath, ['--check', coordinatorPath], {
    encoding: 'utf8',
  });
  assert.equal(
    checked.status,
    0,
    `store-coordinator.mjs failed node --check:\n${checked.stderr || checked.stdout}`,
  );
});

test('user-defined Board Store coordinator carries the semantic Store payload', () => {
  const start = source.indexOf('export async function scheduleUserDefinedBoardStoreQuestion(');
  const end = source.indexOf('export async function retryCurrentStore', start);
  assert.ok(start >= 0 && end > start, 'user-defined Board coordinator function is missing');

  const body = source.slice(start, end);
  for (const field of [
    'definedWorkpieceLengthCanonical',
    'sawCuts',
    'sawAngleDeg',
    'drillCycles',
    'drillDepthIn',
    'requiredOps',
    'cutPlane',
    'endIdentity',
    'endRelation',
    'lengthDatum',
    'spotDemand',
    'unresolvedConditions',
    'materialSource',
  ]) {
    assert.match(body, new RegExp('\\b' + field + '\\b'), `coordinator dropped ${field}`);
  }
  assert.match(body, /requestType:\s*STORE_REQUEST_TYPES\.USER_DEFINED_BOARD_V1/);
  assert.match(body, /payload:\s*userDefinedBoardJobPayload\(\{/);
  assert.match(body, /scope:\s*STORE_SCOPES\.USER_DEFINED_BOARD_V1/);
});
