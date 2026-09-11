import { expect, test } from '@playwright/test';

import { MAX_PROJECT_EVIDENCE_BYTES, MAX_SOURCE_BYTES, FIXED_ORIGIN } from '../../shared/contracts.mjs';
import { sha256Hex } from '../../shared/canonical.mjs';
import {
  JPEG_FIXTURE,
  PDF_FIXTURE,
  PNG_FIXTURE,
  TEXT_FIXTURE,
  asArray,
} from '../fixtures/bytes.mjs';
import { repoCall, requireOk } from '../helpers/browser-repo.mjs';
import {
  launchPersistentProfile,
  makeProfileDir,
  removeProfileDir,
} from '../helpers/persistent-browser.mjs';

function now() {
  return '2026-09-10T20:00:00.000Z';
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

function expectOpaqueUuid(value) {
  expect(value).toMatch(UUID_RE);
}

test('B3A-01 typed original is retained separately from any mapped value', async ({ page }) => {
  await page.goto('/');
  const project = await createOwn(page);
  const prepared = requireOk(
    await repoCall(page, 'prepareTyped', { text: 'opening is about 45 inches' }),
    'prepare typed',
  );
  expectOpaqueUuid(prepared.evidenceId);
  expect(prepared.evidenceId).not.toBe(prepared.blob.sha256);
  expect(prepared.rawText).toBe('opening is about 45 inches');
  const attached = requireOk(
    await repoCall(page, 'attachEvidence', {
      localRecordId: project.localRecordId,
      expectedHead: project.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      prepared,
    }),
    'attach typed',
  );
  expect(attached.status).toBe('committed');
  expect(attached.projectId).toBe(project.projectId);
  expect(attached.currentHead).not.toBe(project.currentHead);
  expect(attached.candidate.payload.parentCandidateRevisionId).toBe(project.currentHead);
  expect(attached.candidate.payload.dimensions).toBeNull();
  expect(attached.candidate.payload.parts).toBeNull();
  expect(attached.candidate.payload.material).toBeNull();
  expect(attached.candidate.payload.activeEvidenceIds).toEqual([attached.evidenceId]);
  expect(attached.evidence.payload.rawText).toBe('opening is about 45 inches');
  expect(attached.evidence.payload.displayType).toBe('text');
  expect(attached.evidence.id).not.toBe(attached.evidence.payload.sha256);
  expect(attached.evidence.id).not.toBe(project.projectId);
  const custody = requireOk(
    await repoCall(page, 'blob', { sha256: attached.evidence.payload.sha256 }),
    'typed bytes',
  );
  expect(custody.status).toBe('retained');
  expect(new TextDecoder().decode(Uint8Array.from(custody.bytes))).toBe(
    'opening is about 45 inches',
  );
});

test('B3A-02 JPEG PNG and PDF bytes are retained with matching hashes', async ({ page }) => {
  await page.goto('/');
  let project = await createOwn(page);
  const fixtures = [
    ['jpeg', JPEG_FIXTURE, 'image-jpeg', 'photo.jpg'],
    ['png', PNG_FIXTURE, 'image-png', 'sketch.png'],
    ['pdf', PDF_FIXTURE, 'pdf', 'drawing.pdf'],
  ];
  const hashes = {};
  for (const [name, fixture, displayType, filename] of fixtures) {
    const prepared = requireOk(
      await repoCall(page, 'prepareFile', {
        bytes: asArray(fixture.bytes),
        type: fixture.type,
        filename,
      }),
      `prepare ${name}`,
    );
    const attached = requireOk(
      await repoCall(page, 'attachEvidence', {
        localRecordId: project.localRecordId,
        expectedHead: project.currentHead,
        actionId: crypto.randomUUID(),
        createdAt: now(),
        prepared,
      }),
      `attach ${name}`,
    );
    expect(attached.evidence.payload.displayType).toBe(displayType);
    expect(attached.evidence.payload.originalFilename).toBe(filename);
    expect(attached.candidate.payload.dimensions).toBeNull();
    const custody = requireOk(
      await repoCall(page, 'blob', { sha256: attached.evidence.payload.sha256 }),
      `${name} custody`,
    );
    expect(custody.status).toBe('retained');
    expect(custody.bytes).toEqual(asArray(fixture.bytes));
    hashes[name] = attached.evidence.payload.sha256;
    project = attached;
  }
  expect(hashes.jpeg).not.toBe(hashes.png);
  const listed = requireOk(
    await repoCall(page, 'listEvidence', { localRecordId: project.localRecordId }),
    'list',
  );
  expect(listed).toHaveLength(3);
});

test('B3A-03 duplicate evidence actionId is idempotent', async ({ page }) => {
  await page.goto('/');
  const project = await createOwn(page);
  const prepared = requireOk(
    await repoCall(page, 'prepareTyped', { text: '45 in' }),
    'prepare',
  );
  const actionId = crypto.randomUUID();
  const first = requireOk(
    await repoCall(page, 'attachEvidence', {
      localRecordId: project.localRecordId,
      expectedHead: project.currentHead,
      actionId,
      createdAt: now(),
      prepared,
    }),
    'first attach',
  );
  const secondPrepared = requireOk(
    await repoCall(page, 'prepareTyped', { text: '45 in' }),
    'second prepare',
  );
  const second = requireOk(
    await repoCall(page, 'attachEvidence', {
      localRecordId: project.localRecordId,
      expectedHead: project.currentHead,
      actionId,
      createdAt: now(),
      prepared: secondPrepared,
    }),
    'second attach',
  );
  expect(second.status).toBe('idempotent');
  expect(second.currentHead).toBe(first.currentHead);
  expect(second.evidenceId).toBe(first.evidenceId);
  expect(second.projectId).toBe(first.projectId);
  const listed = requireOk(
    await repoCall(page, 'listEvidence', { localRecordId: project.localRecordId }),
    'list',
  );
  expect(listed).toHaveLength(1);
});

test('B3A-04 oversized source is rejected and leaves prior head intact', async ({ page }) => {
  await page.goto('/');
  const project = await createOwn(page);
  const oversized = await page.evaluate(async (maxBytes) => {
    const evidence = await import('/domain/evidence.mjs');
    try {
      await evidence.prepareFileOriginal({
        bytes: new Uint8Array(maxBytes + 1),
        type: 'application/octet-stream',
        filename: 'huge.bin',
      });
      return { ok: true };
    } catch (error) {
      return { ok: false, code: error.code ?? error.name ?? null, message: error.message };
    }
  }, MAX_SOURCE_BYTES);
  expect(oversized.ok).toBe(false);
  expect(oversized.code).toBe('source-too-large');
  expect(requireOk(await repoCall(page, 'head', { localRecordId: project.localRecordId }), 'head')).toBe(
    project.currentHead,
  );
});

test('typed original evidence role is the caller role', async ({ page }) => {
  await page.goto('/');
  const project = await createOwn(page);
  const need = requireOk(
    await repoCall(page, 'prepareTyped', { text: 'something I cannot name yet' }),
    'default need',
  );
  expect(need.role).toBe('typed-need');
  const measured = requireOk(
    await repoCall(page, 'prepareTyped', {
      text: '45 in',
      role: 'measurement',
    }),
    'measurement source',
  );
  expect(measured.role).toBe('measurement');
  const attached = requireOk(
    await repoCall(page, 'attachEvidence', {
      localRecordId: project.localRecordId,
      expectedHead: project.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      prepared: measured,
    }),
    'attach measurement source',
  );
  expect(attached.evidence.payload.role).toBe('measurement');
  const takeoff = requireOk(
    await repoCall(page, 'prepareTyped', {
      text: 'Shelf blank | 2 | ea',
      role: 'takeoff-row',
    }),
    'takeoff source',
  );
  expect(takeoff.role).toBe('takeoff-row');
});

test('oversized typed original is rejected before any partial persistence', async ({ page }) => {
  await page.goto('/');
  const project = await createOwn(page);
  const oversized = await page.evaluate(async (maxBytes) => {
    const evidence = await import('/domain/evidence.mjs');
    try {
      await evidence.prepareTypedOriginal({
        text: 'x'.repeat(maxBytes + 1),
        role: 'typed-need',
      });
      return { ok: true };
    } catch (error) {
      return { ok: false, code: error.code ?? error.name ?? null, message: error.message };
    }
  }, MAX_SOURCE_BYTES);
  expect(oversized.ok).toBe(false);
  expect(oversized.code).toBe('source-too-large');
  const recorded = await page.evaluate(async ({ maxBytes, localRecordId, expectedHead, createdAt }) => {
    const observation = await import('/domain/observation.mjs');
    try {
      await observation.recordEnteredObservation({
        localRecordId,
        expectedHead,
        actionId: crypto.randomUUID(),
        createdAt,
        rawText: 'x'.repeat(maxBytes + 1),
        kind: 'typed-need',
        mapTo: null,
      });
      return { ok: true };
    } catch (error) {
      return { ok: false, code: error.code ?? error.name ?? null, message: error.message };
    }
  }, {
    maxBytes: MAX_SOURCE_BYTES,
    localRecordId: project.localRecordId,
    expectedHead: project.currentHead,
    createdAt: now(),
  });
  expect(recorded.ok).toBe(false);
  expect(recorded.code).toBe('source-too-large');
  expect(requireOk(await repoCall(page, 'head', { localRecordId: project.localRecordId }), 'head')).toBe(
    project.currentHead,
  );
  expect(
    requireOk(await repoCall(page, 'listEvidence', { localRecordId: project.localRecordId }), 'evidence'),
  ).toHaveLength(0);
  expect(
    requireOk(await repoCall(page, 'listObservations', { localRecordId: project.localRecordId }), 'obs'),
  ).toHaveLength(0);
});

test('B3A-05 project unique-evidence limit rejects additional unique bytes', async ({ page }) => {
  await page.goto('/');
  const project = await createOwn(page);
  requireOk(
    await repoCall(page, 'commit', {
      localRecordId: project.localRecordId,
      projectId: project.projectId,
      expectedHead: project.currentHead,
      nextHead: crypto.randomUUID(),
      createdAt: now(),
      actionId: crypto.randomUUID(),
      records: [
        {
          localRecordId: project.localRecordId,
          projectId: project.projectId,
          kind: 'evidence',
          id: crypto.randomUUID(),
          createdAt: now(),
          payload: {
            sha256: 'a'.repeat(64),
            size: MAX_PROJECT_EVIDENCE_BYTES - 4,
            displayType: 'opaque',
            bytesRetained: false,
          },
        },
      ],
      event: {
        localRecordId: project.localRecordId,
        projectId: project.projectId,
        kind: 'event',
        id: crypto.randomUUID(),
        createdAt: now(),
        payload: { type: 'evidence-limit-seed' },
      },
    }),
    'seed large unique size',
  );
  const head = requireOk(await repoCall(page, 'head', { localRecordId: project.localRecordId }), 'head');
  const prepared = requireOk(
    await repoCall(page, 'prepareFile', {
      bytes: asArray(TEXT_FIXTURE.bytes),
      type: TEXT_FIXTURE.type,
      filename: 'extra.txt',
    }),
    'prepare extra',
  );
  const failed = await repoCall(page, 'attachEvidence', {
    localRecordId: project.localRecordId,
    expectedHead: head,
    actionId: crypto.randomUUID(),
    createdAt: now(),
    prepared,
  });
  expect(failed.ok).toBe(false);
  expect(failed.code).toBe('project-evidence-limit');
  expect(requireOk(await repoCall(page, 'head', { localRecordId: project.localRecordId }), 'still')).toBe(
    head,
  );
});

test('B3A-06 injected abort leaves prior head and no partial evidence', async ({ page }) => {
  await page.goto('/');
  const project = await createOwn(page);
  const prepared = requireOk(
    await repoCall(page, 'prepareTyped', { text: 'keep unresolved' }),
    'prepare',
  );
  const failed = await repoCall(page, 'attachEvidence', {
    localRecordId: project.localRecordId,
    expectedHead: project.currentHead,
    actionId: crypto.randomUUID(),
    createdAt: now(),
    prepared,
    testFault: 'abort-after-writes',
  });
  expect(failed.ok).toBe(false);
  expect(failed.code).toBe('injected-abort');
  expect(requireOk(await repoCall(page, 'head', { localRecordId: project.localRecordId }), 'head')).toBe(
    project.currentHead,
  );
  const listed = requireOk(
    await repoCall(page, 'listEvidence', { localRecordId: project.localRecordId }),
    'list',
  );
  expect(listed).toHaveLength(0);
});

test('B3A-07 missing or mismatched blob is unavailable and does not invent an original', async ({
  page,
}) => {
  await page.goto('/');
  const project = await createOwn(page);
  const prepared = requireOk(
    await repoCall(page, 'prepareFile', {
      bytes: asArray(PNG_FIXTURE.bytes),
      type: PNG_FIXTURE.type,
      filename: 'keep.png',
    }),
    'prepare png',
  );
  const attached = requireOk(
    await repoCall(page, 'attachEvidence', {
      localRecordId: project.localRecordId,
      expectedHead: project.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      prepared,
    }),
    'attach png',
  );
  requireOk(await repoCall(page, 'deleteBlob', { sha256: attached.evidence.payload.sha256 }), 'delete');
  const missing = requireOk(
    await repoCall(page, 'inspectSource', { sha256: attached.evidence.payload.sha256 }),
    'missing',
  );
  expect(missing.status).toBe('unavailable');
  expect(missing.reason).toBe('missing');
  expect(await page.locator('#source-status').textContent()).toBe('Original source unavailable');
  const evidence = requireOk(
    await repoCall(page, 'record', {
      localRecordId: project.localRecordId,
      kind: 'evidence',
      id: attached.evidenceId,
    }),
    'evidence remains',
  );
  expect(evidence.payload.originalFilename).toBe('keep.png');
});

test('B3A-08 opaque script-capable files retain bytes without display execution type', async ({
  page,
}) => {
  await page.goto('/');
  const project = await createOwn(page);
  const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"></svg><script>x</script>');
  const prepared = requireOk(
    await repoCall(page, 'prepareFile', {
      bytes: asArray(svg),
      type: 'image/svg+xml',
      filename: 'drawing.svg',
    }),
    'prepare svg',
  );
  expect(prepared.displayType).toBe('opaque');
  const attached = requireOk(
    await repoCall(page, 'attachEvidence', {
      localRecordId: project.localRecordId,
      expectedHead: project.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      prepared,
    }),
    'attach svg',
  );
  expect(attached.evidence.payload.displayType).toBe('opaque');
  expect(attached.candidate.payload.parts).toBeNull();
  const custody = requireOk(
    await repoCall(page, 'blob', { sha256: attached.evidence.payload.sha256 }),
    'svg bytes',
  );
  expect(custody.status).toBe('retained');
});

test('B3A-09 stale expected head does not attach evidence', async ({ page }) => {
  await page.goto('/');
  const project = await createOwn(page);
  const firstPrepared = requireOk(
    await repoCall(page, 'prepareTyped', { text: 'first' }),
    'first prepare',
  );
  const first = requireOk(
    await repoCall(page, 'attachEvidence', {
      localRecordId: project.localRecordId,
      expectedHead: project.currentHead,
      actionId: crypto.randomUUID(),
      createdAt: now(),
      prepared: firstPrepared,
    }),
    'first',
  );
  const late = await repoCall(page, 'attachEvidence', {
    localRecordId: project.localRecordId,
    expectedHead: project.currentHead,
    actionId: crypto.randomUUID(),
    createdAt: now(),
    prepared: requireOk(await repoCall(page, 'prepareTyped', { text: 'late' }), 'late prepare'),
  });
  expect(late.ok).toBe(false);
  expect(late.code).toBe('head-conflict');
  expect(requireOk(await repoCall(page, 'head', { localRecordId: project.localRecordId }), 'head')).toBe(
    first.currentHead,
  );
});

test('B3A-10 restart retains typed original bytes and evidence identity', async () => {
  test.setTimeout(60_000);
  const userDataDir = makeProfileDir();
  const text = 'opening is about 45 inches';
  let localRecordId;
  let projectId;
  let evidenceId;
  let sha256;
  let head;
  const first = await launchPersistentProfile(userDataDir);
  try {
    const page = await first.newPage();
    await page.goto(FIXED_ORIGIN);
    const project = await createOwn(page);
    localRecordId = project.localRecordId;
    projectId = project.projectId;
    const prepared = requireOk(
      await repoCall(page, 'prepareTyped', { text }),
      'prepare',
    );
    const attached = requireOk(
      await repoCall(page, 'attachEvidence', {
        localRecordId,
        expectedHead: project.currentHead,
        actionId: crypto.randomUUID(),
        createdAt: now(),
        prepared,
      }),
      'attach',
    );
    evidenceId = attached.evidenceId;
    sha256 = attached.evidence.payload.sha256;
    head = attached.currentHead;
    expect(await sha256Hex(new TextEncoder().encode(text))).toBe(sha256);
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
    const evidence = requireOk(
      await repoCall(page, 'record', { localRecordId, kind: 'evidence', id: evidenceId }),
      'evidence',
    );
    expect(evidence.payload.rawText).toBe(text);
    const custody = requireOk(await repoCall(page, 'blob', { sha256 }), 'bytes');
    expect(custody.status).toBe('retained');
    expect(new TextDecoder().decode(Uint8Array.from(custody.bytes))).toBe(text);
  } finally {
    await second.close();
    removeProfileDir(userDataDir);
  }
});
