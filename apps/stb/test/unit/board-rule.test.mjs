import assert from 'node:assert/strict';
import test from 'node:test';

import {
  BOARD_DEFINITION,
  BOARD_INPUT_KEY,
  CUT001_DOCUMENTARY_REFERENCE,
} from '../../shared/contracts.mjs';
import { evaluateBoardRequirement } from '../../shared/board-rule.mjs';
import { canonicalInchString } from '../../shared/canonical.mjs';

function observation(overrides = {}) {
  return {
    rawText: '45',
    declaredUnit: 'in',
    interpretedValue: 45,
    interpretedUnit: 'in',
    unresolvedReason: null,
    method: 'entered',
    ...overrides,
  };
}

test('Board definition kind and inclusive inch envelope are inspectable', () => {
  assert.equal(BOARD_DEFINITION.kind, 'board.square.v1');
  assert.equal(BOARD_DEFINITION.ruleVersion, '0.1');
  assert.equal(BOARD_DEFINITION.inputKey, BOARD_INPUT_KEY);
  assert.equal(BOARD_INPUT_KEY, 'finished length');
  assert.equal(BOARD_DEFINITION.unit, 'in');
  assert.equal(BOARD_DEFINITION.minInches, 24);
  assert.equal(BOARD_DEFINITION.maxInches, 60);
  assert.equal(BOARD_DEFINITION.inclusive, true);
  assert.equal(BOARD_DEFINITION.quantity, 1);
  assert.equal(BOARD_DEFINITION.quantityUnit, 'ea');
  assert.deepEqual([...BOARD_DEFINITION.requiredOps], ['CROSSCUT']);
  assert.equal(BOARD_DEFINITION.squareCut, true);
});

test('CUT-001 documentary reference is inert provenance only', () => {
  assert.equal(CUT001_DOCUMENTARY_REFERENCE.id, 'CUT-001');
  assert.equal(
    CUT001_DOCUMENTARY_REFERENCE.pin,
    'a6c7bef784c0468555735a1ad620d163aae9feea',
  );
  assert.equal(CUT001_DOCUMENTARY_REFERENCE.finishedLengthRaw, '60.000');
  assert.equal(CUT001_DOCUMENTARY_REFERENCE.method, 'documentary-reference');
  assert.equal(CUT001_DOCUMENTARY_REFERENCE.authority, false);
  assert.equal(CUT001_DOCUMENTARY_REFERENCE.storeSupport, false);
  assert.equal(CUT001_DOCUMENTARY_REFERENCE.machineCommissioning, false);
  assert.equal(CUT001_DOCUMENTARY_REFERENCE.fabricationAuthorization, false);
  assert.equal(CUT001_DOCUMENTARY_REFERENCE.physicalExecution, false);
});

test('M2-05/R02 24 and 60 are accepted and 16 is not clamped', () => {
  const accepted24 = evaluateBoardRequirement(observation({ rawText: '24', interpretedValue: 24 }));
  const accepted60 = evaluateBoardRequirement(observation({ rawText: '60', interpretedValue: 60 }));
  const sixteen = evaluateBoardRequirement(observation({ rawText: '16', interpretedValue: 16 }));
  assert.equal(accepted24.valid, true);
  assert.equal(accepted24.canonical, '24');
  assert.equal(accepted60.valid, true);
  assert.equal(accepted60.canonical, '60');
  assert.equal(sixteen.valid, false);
  assert.equal(sixteen.unresolvedReason, 'below-minimum');
  assert.equal(sixteen.canonical, '16');
  assert.equal(sixteen.canonical === '24', false);
});

test('invalid Board demand remains unresolved without conversion or fallback', () => {
  const cases = [
    [null, 'missing-finished-length'],
    [observation({ unresolvedReason: 'blank', interpretedValue: null, interpretedUnit: null, rawText: '' }), 'blank'],
    [observation({ rawText: '-5', interpretedValue: -5 }), 'negative'],
    [observation({ rawText: '0', interpretedValue: 0 }), 'zero'],
    [observation({ unresolvedReason: 'malformed', interpretedValue: null, rawText: 'NaN' }), 'malformed'],
    [observation({ unresolvedReason: 'missing-unit', interpretedValue: null, interpretedUnit: null, declaredUnit: null }), 'missing-unit'],
    [observation({ rawText: '45', interpretedValue: 45, interpretedUnit: 'mm', declaredUnit: 'mm' }), 'unsupported-unit'],
    [observation({ rawText: '23.999', interpretedValue: 23.999 }), 'below-minimum'],
    [observation({ rawText: '60.001', interpretedValue: 60.001 }), 'above-maximum'],
    [observation({ rawText: '61', interpretedValue: 61 }), 'above-maximum'],
  ];
  for (const [input, reason] of cases) {
    const result = evaluateBoardRequirement(input);
    assert.equal(result.valid, false, reason);
    assert.equal(result.unresolvedReason, reason);
  }
});

test('canonical inch strings are non-exponent and strip trailing zeros', () => {
  assert.equal(canonicalInchString(45), '45');
  assert.equal(canonicalInchString(60), '60');
  assert.equal(canonicalInchString(60.0), '60');
  assert.equal(canonicalInchString(24.5), '24.5');
  assert.equal(canonicalInchString(24.50), '24.5');
  assert.equal(canonicalInchString(-5), '-5');
  assert.equal(/[eE]/.test(canonicalInchString(45)), false);
  assert.throws(() => canonicalInchString(Number.NaN), TypeError);
  assert.throws(() => canonicalInchString(Infinity), TypeError);
});
