import { expect, test } from '@playwright/test';

import { BOARD_DEFINITION, BOARD_INPUT_KEY, CUT001_DOCUMENTARY_REFERENCE } from '../../shared/contracts.mjs';
import { repoCall, requireOk } from '../helpers/browser-repo.mjs';

function now() {
  return '2026-09-10T22:00:00.000Z';
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function createOwn(page) {
  return requireOk(
    await repoCall(page, 'createProject', {
      actionId: crypto.randomUUID(),
      entryMode: 'own',
      createdAt: now(),
      actorId: 'new',
    }),
    'create',
  );
}

async function applyLength(page, project, rawText, unit = 'in', extras = {}) {
  return requireOk(
    await repoCall(page, 'applyBoardLength', {
      localRecordId: project.localRecordId,
      expectedHead: project.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      rawText,
      unit,
      ...extras,
    }),
    `apply ${rawText} ${unit}`,
  );
}

test('createProject does not mint a Board projection before any mutation', async ({ page }) => {
  await page.goto('/');
  const project = await createOwn(page);
  expect(project.candidate.payload.projectionId ?? null).toBeNull();
  expect(project.candidate.payload.activeOccurrenceIds ?? []).toEqual([]);
  const projection = requireOk(
    await repoCall(page, 'currentProjection', { localRecordId: project.localRecordId }),
    'projection',
  );
  expect(projection).toBeNull();
});

test('M2-05/R01 45 then 46 keeps occurrenceId and creates a new definition revision', async ({ page }) => {
  await page.goto('/');
  const project = await createOwn(page);
  const first = await applyLength(page, project, '45');
  expect(first.status).toBe('committed');
  expect(first.occurrenceId).toMatch(UUID_RE);
  expect(first.definitionRevisionId).toMatch(UUID_RE);
  expect(first.projectionId).toMatch(UUID_RE);
  expect(first.occurrenceId).not.toBe(first.definitionRevisionId);
  expect(first.definition.payload.finishedLength.canonical).toBe('45');
  expect(first.definition.payload.quantity).toBe(1);
  expect(first.definition.payload.quantityUnit).toBe('ea');
  expect(first.definition.payload.requiredOps).toEqual(['CROSSCUT']);
  expect(first.definition.payload.squareCut).toBe(true);
  expect(first.definition.payload.valid).toBe(true);
  expect(first.projection.payload.valid).toBe(true);
  expect(first.projection.payload.finishedLength.canonical).toBe('45');
  expect(first.projection.payload.geometry.lengthCanonical).toBe('45');
  expect(first.projection.payload.summary.finishedLength).toBe('45 in');
  expect(first.projection.payload.store.connected).toBe(false);
  expect(first.projection.payload.store.offering).toBeNull();
  expect(first.projection.payload.store.price).toBeNull();
  expect(first.projection.payload.geometry.width).toBeNull();
  expect(first.projection.payload.geometry.thickness).toBeNull();
  expect(first.projection.payload.request.complete).toBe(false);
  expect(first.candidate.payload.parts).toBeNull();
  expect(first.candidate.payload.unresolved).toBe(false);

  const second = await applyLength(page, first, '46');
  expect(second.currentHead).not.toBe(first.currentHead);
  expect(second.occurrenceId).toBe(first.occurrenceId);
  expect(second.definitionRevisionId).not.toBe(first.definitionRevisionId);
  expect(second.projectionId).not.toBe(first.projectionId);
  expect(second.definition.payload.finishedLength.canonical).toBe('46');
  expect(second.definition.payload.parentDefinitionRevisionId).toBe(first.definitionRevisionId);
  expect(second.projection.payload.geometry.lengthCanonical).toBe('46');
  expect(second.projection.payload.summary.finishedLength).toBe('46 in');
  expect(second.projection.payload.parts[0].finishedLength.canonical).toBe('46');

  const oldDefinition = requireOk(
    await repoCall(page, 'record', {
      localRecordId: project.localRecordId,
      kind: 'definition',
      id: first.definitionRevisionId,
    }),
    'old definition',
  );
  expect(oldDefinition.payload.finishedLength.canonical).toBe('45');
  const oldProjection = requireOk(
    await repoCall(page, 'record', {
      localRecordId: project.localRecordId,
      kind: 'projection',
      id: first.projectionId,
    }),
    'old projection',
  );
  expect(oldProjection.payload.geometry.lengthCanonical).toBe('45');
});

test('M2-05/R02 invalid demand is retained and never clamped', async ({ page }) => {
  await page.goto('/');
  const project = await createOwn(page);
  const cases = [
    { rawText: '', unit: 'in', reason: 'blank' },
    { rawText: '-5', unit: 'in', reason: 'negative' },
    { rawText: 'NaN', unit: 'in', reason: 'malformed' },
    { rawText: '45', unit: '', reason: 'missing-unit' },
    { rawText: '45', unit: 'furlong', reason: 'unsupported-unit' },
    { rawText: '16', unit: 'in', reason: 'below-minimum' },
  ];
  let head = project;
  for (const item of cases) {
    const result = await applyLength(page, head, item.rawText, item.unit);
    expect(result.projection.payload.valid).toBe(false);
    expect(result.occurrenceId).toBeNull();
    expect(result.projection.payload.store.offering).toBeNull();
    const observation = requireOk(
      await repoCall(page, 'record', {
        localRecordId: project.localRecordId,
        kind: 'observation',
        id: result.observationId,
      }),
      `kept ${item.reason}`,
    );
    expect(observation.payload.rawText).toBe(item.rawText);
    if (item.reason === 'below-minimum') {
      expect(result.projection.payload.unresolvedReason).toBe('below-minimum');
      expect(result.projection.payload.finishedLength.canonical).toBe('16');
      expect(result.projection.payload.finishedLength.canonical).not.toBe('24');
    }
    if (item.reason === 'negative') {
      expect(result.projection.payload.unresolvedReason).toBe('negative');
      expect(result.projection.payload.finishedLength.canonical).toBe('-5');
    }
    if (item.reason === 'blank' || item.reason === 'malformed' || item.reason === 'missing-unit' || item.reason === 'unsupported-unit') {
      expect(result.candidate.payload.mappings.some((entry) => entry.inputKey === BOARD_INPUT_KEY)).toBe(
        false,
      );
    }
    head = result;
  }

  const accepted24 = await applyLength(page, head, '24');
  expect(accepted24.projection.payload.valid).toBe(true);
  expect(accepted24.projection.payload.finishedLength.canonical).toBe('24');
  const accepted60 = await applyLength(page, accepted24, '60');
  expect(accepted60.projection.payload.valid).toBe(true);
  expect(accepted60.projection.payload.finishedLength.canonical).toBe('60');
  expect(accepted60.occurrenceId).toBe(accepted24.occurrenceId);
});

test('invalid after valid does not reuse last-valid geometry', async ({ page }) => {
  await page.goto('/');
  const project = await createOwn(page);
  const valid = await applyLength(page, project, '45');
  const invalid = await applyLength(page, valid, '16');
  expect(invalid.occurrenceId).toBe(valid.occurrenceId);
  expect(invalid.definitionRevisionId).not.toBe(valid.definitionRevisionId);
  expect(invalid.projection.payload.valid).toBe(false);
  expect(invalid.projection.payload.geometry.lengthCanonical).toBe('16');
  expect(invalid.projection.payload.summary.finishedLength).toBe('16 in');
  expect(invalid.candidate.payload.unresolved).toBe(true);
});

test('M2-05/R03 retired occurrence IDs are never recycled', async ({ page }) => {
  await page.goto('/');
  const project = await createOwn(page);
  const first = await applyLength(page, project, '45');
  const retired = requireOk(
    await repoCall(page, 'retireBoardOccurrence', {
      localRecordId: project.localRecordId,
      expectedHead: first.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
    }),
    'retire',
  );
  expect(retired.retiredOccurrenceId).toBe(first.occurrenceId);
  expect(retired.occurrenceId).toBeNull();
  const historical = requireOk(
    await repoCall(page, 'record', {
      localRecordId: project.localRecordId,
      kind: 'occurrence',
      id: first.occurrenceId,
    }),
    'historical occurrence',
  );
  expect(historical.payload.role).toBe(BOARD_DEFINITION.occurrenceRole);
  const second = await applyLength(page, retired, '46');
  expect(second.occurrenceId).toMatch(UUID_RE);
  expect(second.occurrenceId).not.toBe(first.occurrenceId);
  expect(second.definition.payload.parentDefinitionRevisionId).toBeNull();
});

test('M2-05/R04 same basis is a no-op and restore is a child revision', async ({ page }) => {
  await page.goto('/');
  const project = await createOwn(page);
  const first = await applyLength(page, project, '45');
  const noop = await applyLength(page, first, '45');
  expect(noop.status).toBe('noop');
  expect(noop.currentHead).toBe(first.currentHead);
  expect(noop.definitionRevisionId).toBe(first.definitionRevisionId);

  const changed = await applyLength(page, first, '46');
  const restored = await applyLength(page, changed, '45');
  expect(restored.currentHead).not.toBe(changed.currentHead);
  expect(restored.currentHead).not.toBe(first.currentHead);
  expect(restored.occurrenceId).toBe(first.occurrenceId);
  expect(restored.definitionRevisionId).not.toBe(first.definitionRevisionId);
  expect(restored.projection.payload.finishedLength.canonical).toBe('45');
});

test('P2-B02 manual 60 and documentary 60 have distinct provenance', async ({ page }) => {
  await page.goto('/');
  const project = await createOwn(page);
  const manual = await applyLength(page, project, '60');
  expect(manual.definition.payload.finishedLength.canonical).toBe('60');
  expect(manual.definition.payload.method).toBe('entered');
  expect(manual.definition.payload.documentaryReference).toBeNull();
  expect(manual.projection.payload.summary.provenance).toMatch(/Manually entered/);

  const documentary = requireOk(
    await repoCall(page, 'applyCut001', {
      localRecordId: project.localRecordId,
      expectedHead: manual.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
    }),
    'cut-001',
  );
  expect(documentary.currentHead).not.toBe(manual.currentHead);
  expect(documentary.occurrenceId).toBe(manual.occurrenceId);
  expect(documentary.definitionRevisionId).not.toBe(manual.definitionRevisionId);
  expect(documentary.definition.payload.finishedLength.canonical).toBe('60');
  expect(documentary.definition.payload.method).toBe('documentary-reference');
  expect(documentary.definition.payload.documentaryReference.pin).toBe(
    CUT001_DOCUMENTARY_REFERENCE.pin,
  );
  expect(documentary.definition.payload.documentaryReference.authority).toBe(false);
  expect(documentary.definition.payload.documentaryReference.storeSupport).toBe(false);
  expect(documentary.projection.payload.summary.provenance).toMatch(/CUT-001 documentary reference/);
  expect(documentary.projection.payload.store.connected).toBe(false);

  const sameDocumentary = requireOk(
    await repoCall(page, 'applyCut001', {
      localRecordId: project.localRecordId,
      expectedHead: documentary.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
    }),
    'cut-001 again',
  );
  expect(sameDocumentary.status).toBe('noop');
  expect(sameDocumentary.currentHead).toBe(documentary.currentHead);
});

test('Keep without mapping and opening-width mapping do not derive a Board part', async ({ page }) => {
  await page.goto('/');
  const project = await createOwn(page);
  const kept = requireOk(
    await repoCall(page, 'recordObservation', {
      localRecordId: project.localRecordId,
      expectedHead: project.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      rawText: '45',
      unit: 'in',
      role: 'opening width',
      kind: 'measurement',
    }),
    'keep',
  );
  expect(kept.candidate.payload.mappings).toEqual([]);
  expect(kept.candidate.payload.activeOccurrenceIds).toEqual([]);
  expect(kept.projection.payload.valid).toBe(false);
  expect(kept.projection.payload.unresolvedReason).toBe('missing-finished-length');

  const mapped = requireOk(
    await repoCall(page, 'mapObservation', {
      localRecordId: project.localRecordId,
      expectedHead: kept.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      observationId: kept.observationId,
      inputKey: 'opening width',
    }),
    'map opening width',
  );
  expect(mapped.candidate.payload.activeOccurrenceIds).toEqual([]);
  expect(mapped.projection.payload.valid).toBe(false);
});

test('explicit finished-length mapping from an observation derives the Board', async ({ page }) => {
  await page.goto('/');
  const project = await createOwn(page);
  const kept = requireOk(
    await repoCall(page, 'recordObservation', {
      localRecordId: project.localRecordId,
      expectedHead: project.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      rawText: '45',
      unit: 'in',
      role: BOARD_INPUT_KEY,
      kind: 'measurement',
    }),
    'keep finished length',
  );
  expect(kept.candidate.payload.activeOccurrenceIds).toEqual([]);
  const mapped = requireOk(
    await repoCall(page, 'mapObservation', {
      localRecordId: project.localRecordId,
      expectedHead: kept.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      observationId: kept.observationId,
      inputKey: BOARD_INPUT_KEY,
    }),
    'use finished length',
  );
  expect(mapped.candidate.payload.activeOccurrenceIds).toHaveLength(1);
  expect(mapped.projection.payload.valid).toBe(true);
  expect(mapped.projection.payload.finishedLength.canonical).toBe('45');
});

test('duplicate actionId is idempotent for Board apply', async ({ page }) => {
  await page.goto('/');
  const project = await createOwn(page);
  const actionId = crypto.randomUUID();
  const first = requireOk(
    await repoCall(page, 'applyBoardLength', {
      localRecordId: project.localRecordId,
      expectedHead: project.currentHead,
      actionId,
      createdAt: now(),
      rawText: '45',
      unit: 'in',
    }),
    'first apply',
  );
  const duplicate = requireOk(
    await repoCall(page, 'applyBoardLength', {
      localRecordId: project.localRecordId,
      expectedHead: project.currentHead,
      actionId,
      createdAt: now(),
      rawText: '45',
      unit: 'in',
    }),
    'duplicate apply',
  );
  expect(duplicate.status).toBe('idempotent');
  expect(duplicate.currentHead).toBe(first.currentHead);
  expect(duplicate.occurrenceId).toBe(first.occurrenceId);
});
