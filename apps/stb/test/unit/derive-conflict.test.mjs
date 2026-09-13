import assert from 'node:assert/strict';
import test from 'node:test';

import { planBoardDerivation } from '../../browser/domain/derive.mjs';

test('two different accepted finished-length observations stop instead of choosing a winner', () => {
  const observationById = new Map([
    ['obs-a', {
      rawText: '46.25',
      declaredUnit: 'in',
      interpretedValue: 46.25,
      interpretedUnit: 'in',
      unresolvedReason: null,
      method: 'entered',
      evidenceId: 'evidence-a',
    }],
    ['obs-b', {
      rawText: '46.5',
      declaredUnit: 'in',
      interpretedValue: 46.5,
      interpretedUnit: 'in',
      unresolvedReason: null,
      method: 'entered',
      evidenceId: 'evidence-b',
    }],
  ]);
  const planned = planBoardDerivation({
    candidateRevisionId: 'candidate-next',
    createdAt: '2026-09-13T12:40:00.000Z',
    projectId: 'project-1',
    payload: {
      mappings: [
        { observationId: 'obs-a', inputKey: 'finished length', status: 'accepted' },
        { observationId: 'obs-b', inputKey: 'finished length', status: 'accepted' },
      ],
    },
    observationById,
    previousPayload: { activeOccurrenceIds: [], definitionRevisionId: null },
    previousDefinition: null,
  });
  const projection = planned.records.find((record) => record.kind === 'projection');
  assert.equal(projection.payload.valid, false);
  assert.equal(projection.payload.unresolvedReason, 'conflicting-finished-length');
  assert.equal(projection.payload.conflicts.length, 1);
  assert.deepEqual(projection.payload.conflicts[0].observationIds, ['obs-a', 'obs-b']);
  assert.equal(planned.candidatePatch.activeOccurrenceIds.length, 0);
});

test('two accepted mappings with the same resolved value may corroborate without creating a conflict', () => {
  const observationById = new Map([
    ['obs-a', {
      rawText: '46.25', declaredUnit: 'in', interpretedValue: 46.25, interpretedUnit: 'in', unresolvedReason: null, method: 'entered', evidenceId: 'evidence-a',
    }],
    ['obs-b', {
      rawText: '46.250', declaredUnit: 'in', interpretedValue: 46.25, interpretedUnit: 'in', unresolvedReason: null, method: 'entered', evidenceId: 'evidence-b',
    }],
  ]);
  const planned = planBoardDerivation({
    candidateRevisionId: 'candidate-next',
    createdAt: '2026-09-13T12:40:00.000Z',
    projectId: 'project-1',
    payload: {
      mappings: [
        { observationId: 'obs-a', inputKey: 'finished length', status: 'accepted' },
        { observationId: 'obs-b', inputKey: 'finished length', status: 'accepted' },
      ],
    },
    observationById,
    previousPayload: { activeOccurrenceIds: [], definitionRevisionId: null },
    previousDefinition: null,
  });
  const projection = planned.records.find((record) => record.kind === 'projection');
  assert.equal(projection.payload.valid, true);
  assert.equal(projection.payload.unresolvedReason, null);
  assert.deepEqual(projection.payload.conflicts, []);
  assert.equal(projection.payload.finishedLength.canonical, '46.25');
});
