import { expect, test } from '@playwright/test';

import { FIXED_ORIGIN } from '../../shared/contracts.mjs';
import { JPEG_FIXTURE, MALFORMED_PDF_FIXTURE, PDF_FIXTURE, asArray } from '../fixtures/bytes.mjs';
import { repoCall, requireOk } from '../helpers/browser-repo.mjs';
import {
  launchPersistentProfile,
  makeProfileDir,
  removeProfileDir,
} from '../helpers/persistent-browser.mjs';

function now() {
  return '2026-09-10T21:00:00.000Z';
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function createOwn(page, actorId = 'new') {
  return requireOk(
    await repoCall(page, 'createProject', {
      actionId: crypto.randomUUID(),
      entryMode: 'own',
      createdAt: now(),
      actorId,
    }),
    'create',
  );
}

test('P2-02 typed 45 in is stored as entered and used as 45', async ({ page }) => {
  await page.goto('/');
  const project = await createOwn(page);
  const missing = requireOk(
    await repoCall(page, 'recordObservation', {
      localRecordId: project.localRecordId,
      expectedHead: project.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      rawText: '45',
      unit: '',
      role: 'opening width',
      kind: 'measurement',
    }),
    'missing unit',
  );
  expect(missing.observation.payload.rawText).toBe('45');
  expect(missing.observation.payload.interpretedValue).toBeNull();
  expect(missing.observation.payload.unresolvedReason).toBe('missing-unit');
  expect(missing.candidate.payload.mappings).toEqual([]);
  expect(missing.candidate.payload.parts).toBeNull();
  const missingMap = await repoCall(page, 'mapObservation', {
    localRecordId: project.localRecordId,
    expectedHead: missing.currentHead,
    actionId: crypto.randomUUID(),
    createdAt: now(),
    observationId: missing.observationId,
    inputKey: 'opening width',
  });
  expect(missingMap.ok).toBe(false);
  expect(missingMap.code).toBe('unresolved-observation');

  const recorded = requireOk(
    await repoCall(page, 'recordObservation', {
      localRecordId: project.localRecordId,
      expectedHead: missing.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      rawText: '45',
      unit: 'in',
      role: 'opening width',
      kind: 'measurement',
    }),
    'kept 45',
  );
  expect(recorded.observation.id).toMatch(UUID_RE);
  expect(recorded.observation.id).not.toBe(recorded.observation.payload.evidenceId);
  expect(recorded.observation.payload.rawText).toBe('45');
  expect(recorded.observation.payload.interpretedValue).toBe(45);
  expect(recorded.observation.payload.interpretedUnit).toBe('in');
  expect(recorded.observation.payload.method).toBe('entered');
  expect(recorded.observation.payload.unresolvedReason).toBeNull();
  expect(recorded.candidate.payload.mappings).toEqual([]);
  expect(recorded.candidate.payload.dimensions).toBeNull();
  expect(recorded.candidate.payload.parts).toBeNull();
  const mapped = requireOk(
    await repoCall(page, 'mapObservation', {
      localRecordId: project.localRecordId,
      expectedHead: recorded.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      observationId: recorded.observationId,
      inputKey: 'opening width',
    }),
    'use in candidate',
  );
  expect(mapped.candidate.payload.mappings).toEqual([
    { observationId: recorded.observationId, inputKey: 'opening width', status: 'accepted' },
  ]);
  const evidence = requireOk(
    await repoCall(page, 'record', {
      localRecordId: project.localRecordId,
      kind: 'evidence',
      id: recorded.observation.payload.evidenceId,
    }),
    'typed evidence',
  );
  expect(evidence.payload.rawText).toBe('45');
  expect(evidence.payload.role).toBe('measurement');
});

test('P2-03 correction preserves old observation and revises the candidate once', async ({ page }) => {
  await page.goto('/');
  const project = await createOwn(page);
  const first = requireOk(
    await repoCall(page, 'recordObservation', {
      localRecordId: project.localRecordId,
      expectedHead: project.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      rawText: '45',
      unit: 'in',
      role: 'opening width',
    }),
    'first',
  );
  const mapped = requireOk(
    await repoCall(page, 'mapObservation', {
      localRecordId: project.localRecordId,
      expectedHead: first.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      observationId: first.observationId,
      inputKey: 'opening width',
    }),
    'map first',
  );
  const corrected = requireOk(
    await repoCall(page, 'correctObservation', {
      localRecordId: project.localRecordId,
      expectedHead: mapped.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      observationId: first.observationId,
      rawText: '46',
      unit: 'in',
      role: 'opening width',
    }),
    'correct',
  );
  expect(corrected.status).toBe('committed');
  expect(corrected.observationId).not.toBe(first.observationId);
  expect(corrected.observation.payload.supersedesObservationId).toBe(first.observationId);
  expect(corrected.observation.payload.rawText).toBe('46');
  expect(corrected.observation.payload.interpretedValue).toBe(46);
  expect(corrected.currentHead).not.toBe(mapped.currentHead);
  const original = requireOk(
    await repoCall(page, 'record', {
      localRecordId: project.localRecordId,
      kind: 'observation',
      id: first.observationId,
    }),
    'old remains',
  );
  expect(original.payload.rawText).toBe('45');
  expect(original.payload.interpretedValue).toBe(45);
  expect(corrected.candidate.payload.activeObservationIds).toEqual([corrected.observationId]);
  expect(corrected.candidate.payload.mappings).toEqual([
    { observationId: corrected.observationId, inputKey: 'opening width', status: 'accepted' },
  ]);
  const noop = requireOk(
    await repoCall(page, 'correctObservation', {
      localRecordId: project.localRecordId,
      expectedHead: corrected.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      observationId: corrected.observationId,
      rawText: '46',
      unit: 'in',
      role: 'opening width',
    }),
    'noop',
  );
  expect(noop.status).toBe('noop');
  expect(noop.currentHead).toBe(corrected.currentHead);
});

test('unsupported unit, invalid number, and duplicate action stay honest', async ({ page }) => {
  await page.goto('/');
  const project = await createOwn(page);
  const unit = requireOk(
    await repoCall(page, 'recordObservation', {
      localRecordId: project.localRecordId,
      expectedHead: project.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      rawText: '45',
      unit: 'furlongs',
      role: 'opening width',
    }),
    'unit',
  );
  expect(unit.observation.payload.unresolvedReason).toBe('unsupported-unit');
  expect(unit.observation.payload.interpretedValue).toBeNull();
  expect(unit.candidate.payload.mappings).toEqual([]);
  const furlongsMap = await repoCall(page, 'mapObservation', {
    localRecordId: project.localRecordId,
    expectedHead: unit.currentHead,
    actionId: crypto.randomUUID(),
    createdAt: now(),
    observationId: unit.observationId,
    inputKey: 'opening width',
  });
  expect(furlongsMap.ok).toBe(false);
  expect(furlongsMap.code).toBe('unresolved-observation');
  expect(requireOk(await repoCall(page, 'head', { localRecordId: project.localRecordId }), 'head after furlongs')).toBe(
    unit.currentHead,
  );

  const invalid = requireOk(
    await repoCall(page, 'recordObservation', {
      localRecordId: project.localRecordId,
      expectedHead: unit.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      rawText: 'NaN',
      unit: 'in',
      role: 'opening width',
    }),
    'invalid',
  );
  expect(invalid.observation.payload.rawText).toBe('NaN');
  expect(invalid.observation.payload.interpretedValue).toBeNull();
  expect(invalid.observation.payload.unresolvedReason).toBe('malformed');
  const nanMap = await repoCall(page, 'mapObservation', {
    localRecordId: project.localRecordId,
    expectedHead: invalid.currentHead,
    actionId: crypto.randomUUID(),
    createdAt: now(),
    observationId: invalid.observationId,
    inputKey: 'opening width',
  });
  expect(nanMap.ok).toBe(false);
  expect(nanMap.code).toBe('unresolved-observation');

  const actionId = crypto.randomUUID();
  const first = requireOk(
    await repoCall(page, 'recordObservation', {
      localRecordId: project.localRecordId,
      expectedHead: invalid.currentHead,
      actionId,
      createdAt: now(),
      rawText: '24',
      unit: 'in',
      role: 'length',
    }),
    'first action',
  );
  const second = requireOk(
    await repoCall(page, 'recordObservation', {
      localRecordId: project.localRecordId,
      expectedHead: invalid.currentHead,
      actionId,
      createdAt: now(),
      rawText: '99',
      unit: 'in',
      role: 'length',
    }),
    'dup action',
  );
  expect(second.status).toBe('idempotent');
  expect(second.observationId).toBe(first.observationId);
  expect(second.currentHead).toBe(first.currentHead);
});

test('P2-06 drawing and measurement map into the same candidate without actor identity change', async ({
  page,
}) => {
  await page.goto('/');
  const project = await createOwn(page, 'new');
  const prepared = requireOk(
    await repoCall(page, 'prepareFile', {
      bytes: asArray(PDF_FIXTURE.bytes),
      type: PDF_FIXTURE.type,
      filename: 'drawing.pdf',
    }),
    'pdf',
  );
  const attached = requireOk(
    await repoCall(page, 'attachEvidence', {
      localRecordId: project.localRecordId,
      expectedHead: project.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      prepared,
    }),
    'attach pdf',
  );
  const measured = requireOk(
    await repoCall(page, 'recordObservation', {
      localRecordId: project.localRecordId,
      expectedHead: attached.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      rawText: '45',
      unit: 'in',
      role: 'opening width',
      method: 'entered',
    }),
    'measure',
  );
  expect(measured.projectId).toBe(project.projectId);
  expect(measured.candidate.payload.activeEvidenceIds).toContain(attached.evidenceId);
  expect(measured.candidate.payload.activeObservationIds).toContain(measured.observationId);
  expect(measured.observation.id).not.toBe(attached.evidenceId);
  const professional = await createOwn(page, 'professional');
  expect(professional.projectId).not.toBe(project.projectId);
  const listed = requireOk(
    await repoCall(page, 'listObservations', { localRecordId: project.localRecordId }),
    'list',
  );
  expect(listed.some((entry) => entry.id === measured.observationId)).toBe(true);
});

test('manual takeoff row is supplied demand and not a parts list', async ({ page }) => {
  await page.goto('/');
  const project = await createOwn(page);
  const lengthAsQuantity = requireOk(
    await repoCall(page, 'recordObservation', {
      localRecordId: project.localRecordId,
      expectedHead: project.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      kind: 'takeoff-row',
      takeoff: {
        label: 'shelf blank',
        quantity: '2',
        unit: 'in',
        dimensions: '45 in × 11 in × 0.75 in',
        material: 'pine',
      },
    }),
    'length unit as quantity',
  );
  expect(lengthAsQuantity.observation.payload.kind).toBe('takeoff-row');
  expect(lengthAsQuantity.observation.payload.takeoff.quantity).toBe(2);
  expect(lengthAsQuantity.observation.payload.takeoff.dimensions).toBe('45 in × 11 in × 0.75 in');
  expect(lengthAsQuantity.observation.payload.unresolvedReason).toBe('unsupported-unit');
  expect(lengthAsQuantity.candidate.payload.parts).toBeNull();
  expect(lengthAsQuantity.candidate.payload.mappings).toEqual([]);
  const refused = await repoCall(page, 'mapObservation', {
    localRecordId: project.localRecordId,
    expectedHead: lengthAsQuantity.currentHead,
    actionId: crypto.randomUUID(),
    createdAt: now(),
    observationId: lengthAsQuantity.observationId,
    inputKey: 'shelf blank',
  });
  expect(refused.ok).toBe(false);
  expect(refused.code).toBe('unresolved-observation');

  const row = requireOk(
    await repoCall(page, 'recordObservation', {
      localRecordId: project.localRecordId,
      expectedHead: lengthAsQuantity.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      kind: 'takeoff-row',
      takeoff: {
        label: 'shelf blank',
        quantity: '2',
        unit: 'ea',
        dimensions: '45 in × 11 in × 0.75 in',
        material: 'pine',
      },
    }),
    'takeoff ea',
  );
  expect(row.observation.payload.kind).toBe('takeoff-row');
  expect(row.observation.payload.takeoff.quantity).toBe(2);
  expect(row.observation.payload.interpretedUnit).toBe('ea');
  expect(row.observation.payload.takeoff.dimensions).toBe('45 in × 11 in × 0.75 in');
  expect(row.observation.payload.unresolvedReason).toBeNull();
  expect(row.candidate.payload.parts).toBeNull();
  expect(row.candidate.payload.mappings).toEqual([]);
  const mapped = requireOk(
    await repoCall(page, 'mapObservation', {
      localRecordId: project.localRecordId,
      expectedHead: row.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      observationId: row.observationId,
      inputKey: 'shelf blank',
    }),
    'map takeoff',
  );
  expect(mapped.candidate.payload.parts).toBeNull();
  expect(mapped.candidate.payload.mappings).toEqual([
    { observationId: row.observationId, inputKey: 'shelf blank', status: 'accepted' },
  ]);
});

test('P2-07 unclassified need has no phantom parts', async ({ page }) => {
  await page.goto('/');
  const project = await createOwn(page);
  const recorded = requireOk(
    await repoCall(page, 'recordObservation', {
      localRecordId: project.localRecordId,
      expectedHead: project.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      rawText: 'something odd I cannot classify',
      kind: 'typed-need',
      mapTo: null,
    }),
    'unclassified',
  );
  expect(recorded.observation.payload.kind).toBe('typed-need');
  expect(recorded.observation.payload.unresolvedReason).toBe('unclassified-need');
  expect(recorded.candidate.payload.parts).toBeNull();
  expect(recorded.candidate.payload.dimensions).toBeNull();
  expect(recorded.candidate.payload.material).toBeNull();
  expect(recorded.candidate.payload.mappings).toEqual([]);
});

test('P2-08 detach keeps historical evidence and observations', async ({ page }) => {
  await page.goto('/');
  const project = await createOwn(page);
  const recorded = requireOk(
    await repoCall(page, 'recordObservation', {
      localRecordId: project.localRecordId,
      expectedHead: project.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      rawText: '45',
      unit: 'in',
      role: 'opening width',
    }),
    'record',
  );
  const detached = requireOk(
    await repoCall(page, 'detachEvidence', {
      localRecordId: project.localRecordId,
      expectedHead: recorded.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      evidenceId: recorded.observation.payload.evidenceId,
    }),
    'detach',
  );
  expect(detached.currentHead).not.toBe(recorded.currentHead);
  expect(detached.candidate.payload.activeEvidenceIds).not.toContain(
    recorded.observation.payload.evidenceId,
  );
  expect(detached.candidate.payload.activeObservationIds).not.toContain(recorded.observationId);
  expect(detached.candidate.payload.mappings).toEqual([]);
  const evidence = requireOk(
    await repoCall(page, 'record', {
      localRecordId: project.localRecordId,
      kind: 'evidence',
      id: recorded.observation.payload.evidenceId,
    }),
    'evidence remains',
  );
  expect(evidence.payload.rawText).toBe('45');
  const observation = requireOk(
    await repoCall(page, 'record', {
      localRecordId: project.localRecordId,
      kind: 'observation',
      id: recorded.observationId,
    }),
    'observation remains',
  );
  expect(observation.payload.interpretedValue).toBe(45);
  const noop = requireOk(
    await repoCall(page, 'detachEvidence', {
      localRecordId: project.localRecordId,
      expectedHead: detached.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      evidenceId: recorded.observation.payload.evidenceId,
    }),
    'already detached',
  );
  expect(noop.status).toBe('noop');
  expect(noop.currentHead).toBe(detached.currentHead);
});

test('explicit mapping is required and identical mapping is a no-op', async ({ page }) => {
  await page.goto('/');
  const project = await createOwn(page);
  const recorded = requireOk(
    await repoCall(page, 'recordObservation', {
      localRecordId: project.localRecordId,
      expectedHead: project.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      rawText: '12',
      unit: 'in',
      role: '',
      mapTo: null,
    }),
    'unmapped',
  );
  expect(recorded.candidate.payload.mappings).toEqual([]);
  const mapped = requireOk(
    await repoCall(page, 'mapObservation', {
      localRecordId: project.localRecordId,
      expectedHead: recorded.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      observationId: recorded.observationId,
      inputKey: 'shelf depth',
    }),
    'map',
  );
  expect(mapped.status).toBe('committed');
  expect(mapped.currentHead).not.toBe(recorded.currentHead);
  const again = requireOk(
    await repoCall(page, 'mapObservation', {
      localRecordId: project.localRecordId,
      expectedHead: mapped.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      observationId: recorded.observationId,
      inputKey: 'shelf depth',
    }),
    'map again',
  );
  expect(again.status).toBe('noop');
  expect(again.currentHead).toBe(mapped.currentHead);
});

test('M2-06 observation abort and stale head leave prior state', async ({ page }) => {
  await page.goto('/');
  const project = await createOwn(page);
  const failed = await repoCall(page, 'recordObservation', {
    localRecordId: project.localRecordId,
    expectedHead: project.currentHead,
    actionId: crypto.randomUUID(),
    createdAt: now(),
    rawText: '45',
    unit: 'in',
    role: 'opening width',
    testFault: 'abort-after-writes',
  });
  expect(failed.ok).toBe(false);
  expect(failed.code).toBe('injected-abort');
  expect(requireOk(await repoCall(page, 'head', { localRecordId: project.localRecordId }), 'head')).toBe(
    project.currentHead,
  );
  expect(
    requireOk(await repoCall(page, 'listObservations', { localRecordId: project.localRecordId }), 'obs'),
  ).toHaveLength(0);

  const first = requireOk(
    await repoCall(page, 'recordObservation', {
      localRecordId: project.localRecordId,
      expectedHead: project.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      rawText: '45',
      unit: 'in',
      role: 'opening width',
    }),
    'first',
  );
  const stale = await repoCall(page, 'recordObservation', {
    localRecordId: project.localRecordId,
    expectedHead: project.currentHead,
    actionId: crypto.randomUUID(),
    createdAt: now(),
    rawText: '46',
    unit: 'in',
    role: 'opening width',
  });
  expect(stale.ok).toBe(false);
  expect(stale.code).toBe('head-conflict');
  expect(requireOk(await repoCall(page, 'head', { localRecordId: project.localRecordId }), 'still')).toBe(
    first.currentHead,
  );
});

test('M2-06/T06 unreadable PDF bytes remain retained', async ({ page }) => {
  await page.goto('/');
  const project = await createOwn(page);
  const prepared = requireOk(
    await repoCall(page, 'prepareFile', {
      bytes: asArray(MALFORMED_PDF_FIXTURE.bytes),
      type: MALFORMED_PDF_FIXTURE.type,
      filename: 'broken.pdf',
    }),
    'prepare',
  );
  expect(prepared.displayType).toBe('pdf');
  const attached = requireOk(
    await repoCall(page, 'attachEvidence', {
      localRecordId: project.localRecordId,
      expectedHead: project.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      prepared,
    }),
    'attach',
  );
  const custody = requireOk(
    await repoCall(page, 'blob', { sha256: attached.evidence.payload.sha256 }),
    'bytes',
  );
  expect(custody.status).toBe('retained');
  expect(attached.candidate.payload.parts).toBeNull();
});

test('M2-06/T01 restart retains observation mapping and original bytes', async () => {
  test.setTimeout(60_000);
  const userDataDir = makeProfileDir();
  let localRecordId;
  let projectId;
  let observationId;
  let evidenceId;
  let head;
  const first = await launchPersistentProfile(userDataDir);
  try {
    const page = await first.newPage();
    await page.goto(FIXED_ORIGIN);
    const project = await createOwn(page);
    localRecordId = project.localRecordId;
    projectId = project.projectId;
    const jpeg = requireOk(
      await repoCall(page, 'prepareFile', {
        bytes: asArray(JPEG_FIXTURE.bytes),
        type: JPEG_FIXTURE.type,
        filename: 'photo.jpg',
      }),
      'jpeg',
    );
    const attached = requireOk(
      await repoCall(page, 'attachEvidence', {
        localRecordId,
        expectedHead: project.currentHead,
        actionId: crypto.randomUUID(),
        createdAt: now(),
        prepared: jpeg,
      }),
      'attach jpeg',
    );
    const measured = requireOk(
      await repoCall(page, 'recordObservation', {
        localRecordId,
        expectedHead: attached.currentHead,
        actionId: crypto.randomUUID(),
        createdAt: now(),
        rawText: '45',
        unit: 'in',
        role: 'opening width',
      }),
      'measure',
    );
    const mapped = requireOk(
      await repoCall(page, 'mapObservation', {
        localRecordId,
        expectedHead: measured.currentHead,
        actionId: crypto.randomUUID(),
        createdAt: now(),
        observationId: measured.observationId,
        inputKey: 'opening width',
      }),
      'map',
    );
    observationId = measured.observationId;
    evidenceId = measured.observation.payload.evidenceId;
    head = mapped.currentHead;
  } finally {
    await first.close();
  }

  const second = await launchPersistentProfile(userDataDir);
  try {
    const page = await second.newPage();
    await page.goto(FIXED_ORIGIN);
    const project = requireOk(await repoCall(page, 'project', { localRecordId }), 'reopen');
    expect(project.projectId).toBe(projectId);
    expect(project.currentHead).toBe(head);
    const observation = requireOk(
      await repoCall(page, 'record', { localRecordId, kind: 'observation', id: observationId }),
      'obs',
    );
    expect(observation.payload.interpretedValue).toBe(45);
    const candidate = requireOk(await repoCall(page, 'currentCandidate', { localRecordId }), 'head');
    expect(candidate.payload.mappings[0].observationId).toBe(observationId);
    const custody = requireOk(
      await repoCall(page, 'blob', {
        sha256: requireOk(
          await repoCall(page, 'record', { localRecordId, kind: 'evidence', id: evidenceId }),
          'ev',
        ).payload.sha256,
      }),
      'typed bytes',
    );
    expect(custody.status).toBe('retained');
    expect(new TextDecoder().decode(Uint8Array.from(custody.bytes))).toBe('45');
  } finally {
    await second.close();
    removeProfileDir(userDataDir);
  }
});

test('keep does not map; explicit mapTo on record is the only implicit-free API mapping', async ({ page }) => {
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
    }),
    'keep only',
  );
  expect(kept.candidate.payload.mappings).toEqual([]);
  const explicit = requireOk(
    await repoCall(page, 'recordObservation', {
      localRecordId: project.localRecordId,
      expectedHead: kept.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      rawText: '11',
      unit: 'in',
      role: 'shelf depth',
      mapTo: 'shelf depth',
    }),
    'explicit mapTo',
  );
  expect(explicit.candidate.payload.mappings).toEqual([
    { observationId: explicit.observationId, inputKey: 'shelf depth', status: 'accepted' },
  ]);
  const unresolvedMapOnRecord = await repoCall(page, 'recordObservation', {
    localRecordId: project.localRecordId,
    expectedHead: explicit.currentHead,
    actionId: crypto.randomUUID(),
    createdAt: now(),
    rawText: '45',
    unit: 'furlongs',
    role: 'opening width',
    mapTo: 'opening width',
  });
  expect(unresolvedMapOnRecord.ok).toBe(false);
  expect(unresolvedMapOnRecord.code).toBe('unresolved-observation');
  expect(requireOk(await repoCall(page, 'head', { localRecordId: project.localRecordId }), 'head')).toBe(
    explicit.currentHead,
  );
});

test('provenance-only correction is a real correction', async ({ page }) => {
  await page.goto('/');
  const project = await createOwn(page);
  const first = requireOk(
    await repoCall(page, 'recordObservation', {
      localRecordId: project.localRecordId,
      expectedHead: project.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      rawText: '45',
      unit: 'in',
      role: 'opening width',
      sourceLocation: { evidenceId: project.projectId, page: 2 },
      method: 'entered',
    }),
    'page 2',
  );
  const mapped = requireOk(
    await repoCall(page, 'mapObservation', {
      localRecordId: project.localRecordId,
      expectedHead: first.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      observationId: first.observationId,
      inputKey: 'opening width',
    }),
    'map',
  );
  const corrected = requireOk(
    await repoCall(page, 'correctObservation', {
      localRecordId: project.localRecordId,
      expectedHead: mapped.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      observationId: first.observationId,
      rawText: '45',
      unit: 'in',
      role: 'opening width',
      sourceLocation: { evidenceId: project.projectId, page: 3 },
      method: 'entered',
    }),
    'page 3',
  );
  expect(corrected.status).toBe('committed');
  expect(corrected.observationId).not.toBe(first.observationId);
  expect(corrected.observation.payload.supersedesObservationId).toBe(first.observationId);
  expect(corrected.observation.payload.interpretedValue).toBe(45);
  expect(corrected.observation.payload.sourceLocation).toEqual({
    evidenceId: project.projectId,
    page: 3,
  });
  expect(corrected.currentHead).not.toBe(mapped.currentHead);
  const original = requireOk(
    await repoCall(page, 'record', {
      localRecordId: project.localRecordId,
      kind: 'observation',
      id: first.observationId,
    }),
    'old provenance',
  );
  expect(original.payload.sourceLocation).toEqual({
    evidenceId: project.projectId,
    page: 2,
  });
  expect(corrected.candidate.payload.mappings).toEqual([
    { observationId: corrected.observationId, inputKey: 'opening width', status: 'accepted' },
  ]);
});

test('role correction does not leave two candidate meanings', async ({ page }) => {
  await page.goto('/');
  const project = await createOwn(page);
  const first = requireOk(
    await repoCall(page, 'recordObservation', {
      localRecordId: project.localRecordId,
      expectedHead: project.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      rawText: '45',
      unit: 'in',
      role: 'opening width',
      mapTo: 'opening width',
    }),
    'mapped width',
  );
  expect(first.candidate.payload.mappings).toEqual([
    { observationId: first.observationId, inputKey: 'opening width', status: 'accepted' },
  ]);
  const relabeled = requireOk(
    await repoCall(page, 'correctObservation', {
      localRecordId: project.localRecordId,
      expectedHead: first.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      observationId: first.observationId,
      rawText: '45',
      unit: 'in',
      role: 'shelf depth',
    }),
    'role only',
  );
  expect(relabeled.observationId).not.toBe(first.observationId);
  expect(relabeled.observation.payload.role).toBe('shelf depth');
  expect(relabeled.candidate.payload.mappings).toEqual([]);
  const replaced = requireOk(
    await repoCall(page, 'correctObservation', {
      localRecordId: project.localRecordId,
      expectedHead: relabeled.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      observationId: relabeled.observationId,
      rawText: '45',
      unit: 'in',
      role: 'shelf depth',
      mapTo: 'shelf depth',
    }),
    'explicit replacement',
  );
  expect(replaced.candidate.payload.mappings).toEqual([
    { observationId: replaced.observationId, inputKey: 'shelf depth', status: 'accepted' },
  ]);
  const retarget = requireOk(
    await repoCall(page, 'correctObservation', {
      localRecordId: project.localRecordId,
      expectedHead: replaced.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      observationId: replaced.observationId,
      rawText: '45',
      unit: 'in',
      role: 'opening width',
      mapTo: 'opening width',
    }),
    'replace target',
  );
  expect(retarget.candidate.payload.mappings).toEqual([
    { observationId: retarget.observationId, inputKey: 'opening width', status: 'accepted' },
  ]);
  expect(retarget.candidate.payload.mappings).toHaveLength(1);
});
