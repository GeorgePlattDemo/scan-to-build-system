import { expect, test } from '@playwright/test';

test('hidden S-001 mapped engine loads and preserves the canonical bounded geometry without Page-1 exposure', async ({ page }) => {
  await page.goto('/');

  const result = await page.evaluate(async () => {
    const engine = await import('/domain/s001-engine.mjs');
    const classes = await import('/shared/class-config.mjs');
    const contracts = await import('/shared/contracts.mjs');

    const planned = engine.planS001CenteredArchDerivation({
      candidateRevisionId: 'candidate-s001-test',
      createdAt: '2026-09-13T21:00:00.000Z',
      projectId: 'project-s001-test',
      payload: {
        configuration: classes.normalizeS001CenteredArchConfiguration(
          { openingWidthIn: '36', straightHeightIn: '24', riseIn: '12' },
          { basis: 'manual-entry' },
        ),
      },
      previousPayload: {},
      previousDefinitions: new Map(),
    });

    const projection = planned.records.find((record) => record.kind === 'projection');
    const definition = planned.records.find((record) => record.kind === 'definition');
    return {
      projection: projection?.payload ?? null,
      definition: definition?.payload ?? null,
      candidatePatch: planned.candidatePatch,
      page1ClassIds: contracts.CLASS_REFERENCES.map((entry) => entry.classId),
    };
  });

  expect(result.projection.classId).toBe('S001_CENTERED_ARCHED_SHEET_V0');
  expect(result.projection.geometry.parent).toEqual({ horizontalIn: 96, verticalIn: 48 });
  expect(result.projection.geometry.workField.sheetOffsets).toEqual({
    leftIn: 24,
    rightIn: 24,
    bottomIn: 6,
    topIn: 6,
  });
  expect(result.projection.geometry.opening.widthIn).toBe(36);
  expect(result.projection.geometry.opening.totalHeightIn).toBe(36);
  expect(result.projection.operationRequirements.required).toEqual(['ROUTE_PROFILE', 'RETAIN_TABS']);
  expect(result.projection.operationRequirements.sheetDrillingThisRound).toBe(false);
  expect(result.projection.operationRequirements.tabRemovalSelective).toBe(true);
  expect(result.projection.operationRequirements.labelingRequired).toBe(true);
  expect(result.projection.unresolvedConditions).not.toContain('DURABLE_S001_STORE_CUSTODY_NOT_CONNECTED');
  expect(result.definition.sheetDrillingThisRound).toBe(false);
  expect(result.definition.labelingRequired).toBe(true);
  expect(result.candidatePatch.unresolved).toBe(true);

  // George's Page-1 bounded-project copy remains intentionally untouched.
  expect(result.page1ClassIds).not.toContain('S001_CENTERED_ARCHED_SHEET_V0');
});

test('hidden S-001 engine does not clamp an oversized opening into the centered field', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(async () => {
    const engine = await import('/domain/s001-engine.mjs');
    const classes = await import('/shared/class-config.mjs');
    const planned = engine.planS001CenteredArchDerivation({
      candidateRevisionId: 'candidate-s001-oversize',
      createdAt: '2026-09-13T21:00:00.000Z',
      projectId: 'project-s001-oversize',
      payload: {
        configuration: classes.normalizeS001CenteredArchConfiguration(
          { openingWidthIn: '60', straightHeightIn: '30', riseIn: '10' },
          { basis: 'manual-entry' },
        ),
      },
    });
    const projection = planned.records.find((record) => record.kind === 'projection');
    return projection.payload;
  });

  expect(result.valid).toBe(true);
  expect(result.geometry.withinWorkField).toBe(false);
  expect(result.geometry.opening.widthIn).toBe(60);
  expect(result.geometry.opening.totalHeightIn).toBe(40);
  expect(result.geometry.opening.marginsWithinWorkField.leftIn).toBe(-6);
  expect(result.geometry.opening.marginsWithinWorkField.topIn).toBe(-2);
  expect(result.unresolvedConditions).toContain('PROJECT_GEOMETRY_OUTSIDE_CANONICAL_FIELD');
});
