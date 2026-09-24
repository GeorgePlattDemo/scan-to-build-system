import assert from 'node:assert/strict';
import test from 'node:test';

import { USER_DEFINED_BOARD_DEFINITION } from '../../shared/contracts.mjs';
import { normalizeUser1XBraceConfiguration } from '../../shared/user1-xbrace-rule.mjs';
import { planUser1XBraceDerivation } from '../../browser/domain/user1-xbrace-engine.mjs';

test('Job 1 derivation stays own-entry while producing user_defined_board.v1 demand', () => {
  const plan = planUser1XBraceDerivation({
    candidateRevisionId: 'cand-1',
    createdAt: '2026-09-24T00:00:00Z',
    projectId: 'project-1',
    payload: { configuration: normalizeUser1XBraceConfiguration({ partLengthIn: 16 }) },
    previousPayload: {},
    previousDefinitions: new Map(),
  });
  assert.equal(plan.candidatePatch.definitionKind, USER_DEFINED_BOARD_DEFINITION.kind);
  assert.equal(plan.candidatePatch.unresolved, false);
  const projection = plan.records.find((record) => record.kind === 'projection');
  assert.ok(projection);
  assert.equal(projection.payload.classId, null);
  assert.equal(projection.payload.valid, true);
  assert.equal(projection.payload.storeDemand.definedWorkpieceLengthCanonical, '60');
  assert.equal(projection.payload.storeDemand.sawAngleDeg, 30);
  assert.equal(projection.payload.storeDemand.sawCuts, 3);
  assert.deepEqual(projection.payload.storeDemand.parts.map((part) => part.lengthIn), [16, 16]);
  assert.deepEqual(projection.payload.storeDemand.parts.map((part) => part.features[0].xIn), [8, 8]);
  assert.equal(projection.payload.physicalFabricationEligible, false);
  assert.equal(projection.payload.productionAuthorization, false);
});
