import { expect, test } from '@playwright/test';

test('two different accepted finished-length observations stop instead of choosing a winner', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(async () => {
    const { planBoardDerivation } = await import('/domain/derive.mjs');
    const observationById = new Map([
      ['obs-a', {
        rawText: '46.25', declaredUnit: 'in', interpretedValue: 46.25, interpretedUnit: 'in', unresolvedReason: null, method: 'entered', evidenceId: 'evidence-a',
      }],
      ['obs-b', {
        rawText: '46.5', declaredUnit: 'in', interpretedValue: 46.5, interpretedUnit: 'in', unresolvedReason: null, method: 'entered', evidenceId: 'evidence-b',
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
    return {
      valid: projection.payload.valid,
      unresolvedReason: projection.payload.unresolvedReason,
      conflicts: projection.payload.conflicts,
      activeOccurrenceCount: planned.candidatePatch.activeOccurrenceIds.length,
    };
  });

  expect(result.valid).toBe(false);
  expect(result.unresolvedReason).toBe('conflicting-finished-length');
  expect(result.conflicts).toHaveLength(1);
  expect(result.conflicts[0].observationIds).toEqual(['obs-a', 'obs-b']);
  expect(result.activeOccurrenceCount).toBe(0);
});

test('two accepted mappings with the same resolved value may corroborate without creating a conflict', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(async () => {
    const { planBoardDerivation } = await import('/domain/derive.mjs');
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
    return {
      valid: projection.payload.valid,
      unresolvedReason: projection.payload.unresolvedReason,
      conflicts: projection.payload.conflicts,
      canonical: projection.payload.finishedLength.canonical,
    };
  });

  expect(result.valid).toBe(true);
  expect(result.unresolvedReason).toBe(null);
  expect(result.conflicts).toEqual([]);
  expect(result.canonical).toBe('46.25');
});
