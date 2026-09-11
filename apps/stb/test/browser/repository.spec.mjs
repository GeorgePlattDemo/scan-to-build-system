import { expect, test } from '@playwright/test';

import { DATABASE_NAME, OBJECT_STORES } from '../../shared/contracts.mjs';
import { sha256Hex } from '../../shared/canonical.mjs';
import {
  JPEG_FIXTURE,
  PDF_FIXTURE,
  PNG_FIXTURE,
  TEXT_FIXTURE,
  asArray,
} from '../fixtures/bytes.mjs';
import { repoCall, requireOk } from '../helpers/browser-repo.mjs';

function namespace() {
  return crypto.randomUUID();
}

function now() {
  return '2026-09-10T21:00:00.000Z';
}

async function prepareAllBlobs(page) {
  const prepared = {};
  for (const [name, fixture] of [
    ['text', TEXT_FIXTURE],
    ['jpeg', JPEG_FIXTURE],
    ['png', PNG_FIXTURE],
    ['pdf', PDF_FIXTURE],
  ]) {
    prepared[name] = requireOk(
      await repoCall(page, 'prepareBlob', {
        bytes: asArray(fixture.bytes),
        type: fixture.type,
      }),
      `prepare ${name}`,
    );
  }
  return prepared;
}

test('B0B-01 database stb-app-v1 has the four first-build stores', async ({ page }) => {
  await page.goto('/');
  const shape = requireOk(await repoCall(page, 'describe'), 'describe');
  expect(shape.name).toBe(DATABASE_NAME);
  expect(shape.version).toBe(1);
  expect(shape.stores).toEqual([...OBJECT_STORES]);
});

test('B0B-02 namespace isolation keeps identical domain IDs distinct', async ({ page }) => {
  await page.goto('/');
  const projectId = 'project-shared-domain';
  const recordId = 'record-shared-domain';
  const nsA = namespace();
  const nsB = namespace();

  const commit = async (localRecordId, note, head) =>
    requireOk(
      await repoCall(page, 'commit', {
        localRecordId,
        projectId,
        expectedHead: null,
        nextHead: head,
        createdAt: now(),
        actionId: crypto.randomUUID(),
        records: [
          {
            localRecordId,
            projectId,
            kind: 'note',
            id: recordId,
            createdAt: now(),
            payload: { note },
          },
        ],
        event: {
          localRecordId,
          projectId,
          kind: 'event',
          id: crypto.randomUUID(),
          createdAt: now(),
          payload: { type: 'inert-test' },
        },
      }),
      `commit ${localRecordId}`,
    );

  await commit(nsA, 'alpha', 'head-a');
  await commit(nsB, 'beta', 'head-b');

  const recordA = requireOk(
    await repoCall(page, 'record', { localRecordId: nsA, kind: 'note', id: recordId }),
    'record A',
  );
  const recordB = requireOk(
    await repoCall(page, 'record', { localRecordId: nsB, kind: 'note', id: recordId }),
    'record B',
  );
  expect(recordA.payload.note).toBe('alpha');
  expect(recordB.payload.note).toBe('beta');
  expect(requireOk(await repoCall(page, 'head', { localRecordId: nsA }), 'head A')).toBe('head-a');
  expect(requireOk(await repoCall(page, 'head', { localRecordId: nsB }), 'head B')).toBe('head-b');
});

test('B0B-03 identical insert is idempotent and conflicting content is rejected', async ({
  page,
}) => {
  await page.goto('/');
  const localRecordId = namespace();
  const projectId = crypto.randomUUID();
  const actionId = crypto.randomUUID();
  const record = {
    localRecordId,
    projectId,
    kind: 'note',
    id: 'note-1',
    createdAt: now(),
    payload: { text: 'same' },
  };
  const event = {
    localRecordId,
    projectId,
    kind: 'event',
    id: 'event-1',
    createdAt: now(),
    payload: { type: 'inert-test' },
  };
  const base = {
    localRecordId,
    projectId,
    expectedHead: null,
    nextHead: 'H1',
    createdAt: now(),
    actionId,
    records: [record],
    event,
  };

  const first = requireOk(await repoCall(page, 'commit', base), 'first insert');
  expect(first.status).toBe('committed');
  expect(first.head).toBe('H1');

  const repeat = requireOk(await repoCall(page, 'commit', base), 'repeat insert');
  expect(repeat.status).toBe('idempotent');
  expect(repeat.head).toBe('H1');
  expect(requireOk(await repoCall(page, 'head', { localRecordId }), 'head after repeat')).toBe(
    'H1',
  );

  const conflict = await repoCall(page, 'commit', {
    localRecordId,
    projectId,
    expectedHead: 'H1',
    nextHead: 'H2',
    createdAt: now(),
    actionId: crypto.randomUUID(),
    records: [{ ...record, payload: { text: 'different' } }],
    event: {
      ...event,
      id: 'event-2',
    },
  });
  expect(conflict.ok).toBe(false);
  expect(conflict.code).toBe('immutable-conflict');
  expect(requireOk(await repoCall(page, 'head', { localRecordId }), 'head after conflict')).toBe(
    'H1',
  );
  const stored = requireOk(
    await repoCall(page, 'record', { localRecordId, kind: 'note', id: 'note-1' }),
    'stored record',
  );
  expect(stored.payload.text).toBe('same');
});

test('B0B-04 successful atomic head transaction commits blob, records, event, and head together', async ({
  page,
}) => {
  await page.goto('/');
  const localRecordId = namespace();
  const projectId = crypto.randomUUID();
  const blobs = await prepareAllBlobs(page);
  const evidenceId = 'evidence-1';
  const result = requireOk(
    await repoCall(page, 'commit', {
      localRecordId,
      projectId,
      expectedHead: null,
      nextHead: 'H1',
      createdAt: now(),
      actionId: crypto.randomUUID(),
      blobs: [blobs.text],
      records: [
        {
          localRecordId,
          projectId,
          kind: 'evidence',
          id: evidenceId,
          createdAt: now(),
          payload: {
            blob: blobs.text.sha256,
            filename: 'need.txt',
            mime: blobs.text.type,
            size: blobs.text.size,
          },
        },
      ],
      event: {
        localRecordId,
        projectId,
        kind: 'event',
        id: 'event-h1',
        createdAt: now(),
        payload: { type: 'inert-test', head: 'H1' },
      },
    }),
    'commit H1',
  );
  expect(result.status).toBe('committed');
  expect(result.head).toBe('H1');
  expect(result.eventSequence).toBe(1);

  const project = requireOk(await repoCall(page, 'project', { localRecordId }), 'project');
  expect(project.currentHead).toBe('H1');
  expect(project.projectId).toBe(projectId);
  expect(
    requireOk(
      await repoCall(page, 'record', { localRecordId, kind: 'event', id: 'event-h1' }),
      'event',
    ),
  ).toBeTruthy();
  const custody = requireOk(await repoCall(page, 'blob', { sha256: blobs.text.sha256 }), 'blob');
  expect(custody.status).toBe('retained');
});

test('B0B-05 expected-head mismatch leaves current head and records unchanged', async ({
  page,
}) => {
  await page.goto('/');
  const localRecordId = namespace();
  const projectId = crypto.randomUUID();
  requireOk(
    await repoCall(page, 'commit', {
      localRecordId,
      projectId,
      expectedHead: null,
      nextHead: 'H1',
      createdAt: now(),
      actionId: crypto.randomUUID(),
      records: [
        {
          localRecordId,
          projectId,
          kind: 'note',
          id: 'kept',
          createdAt: now(),
          payload: { text: 'original' },
        },
      ],
      event: {
        localRecordId,
        projectId,
        kind: 'event',
        id: 'event-h1',
        createdAt: now(),
        payload: { type: 'inert-test' },
      },
    }),
    'seed H1',
  );

  const mismatch = await repoCall(page, 'commit', {
    localRecordId,
    projectId,
    expectedHead: 'H0',
    nextHead: 'H2',
    createdAt: now(),
    actionId: crypto.randomUUID(),
    records: [
      {
        localRecordId,
        projectId,
        kind: 'note',
        id: 'new-note',
        createdAt: now(),
        payload: { text: 'should-not-land' },
      },
    ],
    event: {
      localRecordId,
      projectId,
      kind: 'event',
      id: 'event-h2',
      createdAt: now(),
      payload: { type: 'inert-test' },
    },
  });
  expect(mismatch.ok).toBe(false);
  expect(mismatch.code).toBe('head-conflict');
  expect(requireOk(await repoCall(page, 'head', { localRecordId }), 'head')).toBe('H1');
  const missing = requireOk(
    await repoCall(page, 'record', { localRecordId, kind: 'note', id: 'new-note' }),
    'missing note',
  );
  expect(missing).toBeNull();
});

test('B0B-06 injected abort rolls back records, event, blob, and head', async ({ page }) => {
  await page.goto('/');
  const localRecordId = namespace();
  const projectId = crypto.randomUUID();
  requireOk(
    await repoCall(page, 'commit', {
      localRecordId,
      projectId,
      expectedHead: null,
      nextHead: 'H1',
      createdAt: now(),
      actionId: crypto.randomUUID(),
      event: {
        localRecordId,
        projectId,
        kind: 'event',
        id: 'event-h1',
        createdAt: now(),
        payload: { type: 'inert-test' },
      },
    }),
    'seed H1',
  );

  const blob = requireOk(
    await repoCall(page, 'prepareBlob', {
      bytes: asArray(PNG_FIXTURE.bytes),
      type: PNG_FIXTURE.type,
    }),
    'prepare png',
  );

  const aborted = await repoCall(page, 'commit', {
    localRecordId,
    projectId,
    expectedHead: 'H1',
    nextHead: 'H2',
    createdAt: now(),
    actionId: crypto.randomUUID(),
    testFault: 'abort-before-head',
    blobs: [blob],
    records: [
      {
        localRecordId,
        projectId,
        kind: 'evidence',
        id: 'rolled-back',
        createdAt: now(),
        payload: { blob: blob.sha256 },
      },
    ],
    event: {
      localRecordId,
      projectId,
      kind: 'event',
      id: 'event-h2',
      createdAt: now(),
      payload: { type: 'inert-test' },
    },
  });
  expect(aborted.ok).toBe(false);
  expect(aborted.code).toBe('injected-abort');
  expect(aborted.message).toMatch(/Injected transaction abort/);
  expect(requireOk(await repoCall(page, 'head', { localRecordId }), 'head')).toBe('H1');
  expect(
    requireOk(
      await repoCall(page, 'record', { localRecordId, kind: 'evidence', id: 'rolled-back' }),
      'rolled-back record',
    ),
  ).toBeNull();
  expect(
    requireOk(
      await repoCall(page, 'record', { localRecordId, kind: 'event', id: 'event-h2' }),
      'rolled-back event',
    ),
  ).toBeNull();
  const custody = requireOk(await repoCall(page, 'blob', { sha256: blob.sha256 }), 'blob');
  expect(custody.status).toBe('unavailable');
});

test('B0B-07 current-context blob custody retains exact text/JPEG/PNG/PDF bytes', async ({
  page,
}) => {
  await page.goto('/');
  const localRecordId = namespace();
  const projectId = crypto.randomUUID();
  const blobs = await prepareAllBlobs(page);

  requireOk(
    await repoCall(page, 'commit', {
      localRecordId,
      projectId,
      expectedHead: null,
      nextHead: 'H1',
      createdAt: now(),
      actionId: crypto.randomUUID(),
      blobs: [blobs.text, blobs.jpeg, blobs.png, blobs.pdf],
      records: [
        {
          localRecordId,
          projectId,
          kind: 'evidence',
          id: 'text',
          createdAt: now(),
          payload: { blob: blobs.text.sha256, mime: TEXT_FIXTURE.type },
        },
        {
          localRecordId,
          projectId,
          kind: 'evidence',
          id: 'jpeg',
          createdAt: now(),
          payload: { blob: blobs.jpeg.sha256, mime: JPEG_FIXTURE.type },
        },
        {
          localRecordId,
          projectId,
          kind: 'evidence',
          id: 'png',
          createdAt: now(),
          payload: { blob: blobs.png.sha256, mime: PNG_FIXTURE.type },
        },
        {
          localRecordId,
          projectId,
          kind: 'evidence',
          id: 'pdf',
          createdAt: now(),
          payload: { blob: blobs.pdf.sha256, mime: PDF_FIXTURE.type },
        },
      ],
      event: {
        localRecordId,
        projectId,
        kind: 'event',
        id: 'event-h1',
        createdAt: now(),
        payload: { type: 'inert-test' },
      },
    }),
    'commit blobs',
  );

  const fixtures = {
    text: TEXT_FIXTURE,
    jpeg: JPEG_FIXTURE,
    png: PNG_FIXTURE,
    pdf: PDF_FIXTURE,
  };
  for (const name of Object.keys(fixtures)) {
    const expectedBytes = fixtures[name].bytes;
    const expectedHash = await sha256Hex(expectedBytes);
    expect(blobs[name].sha256).toBe(expectedHash);
    expect(blobs[name].size).toBe(expectedBytes.byteLength);
    const custody = requireOk(await repoCall(page, 'blob', { sha256: blobs[name].sha256 }), name);
    expect(custody.status).toBe('retained');
    expect(custody.size).toBe(expectedBytes.byteLength);
    expect(custody.type).toBe(fixtures[name].type);
    expect(custody.bytes).toEqual(asArray(expectedBytes));
    expect(await sha256Hex(Uint8Array.from(custody.bytes))).toBe(expectedHash);
  }
});

test('B0B-08 unsupported schema stops writes and does not delete the database', async ({
  browser,
}) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/');
  requireOk(await repoCall(page, 'describe'), 'create v1');
  requireOk(await repoCall(page, 'bumpSchema'), 'bump to v2');

  const opened = await repoCall(page, 'describe');
  expect(opened.ok).toBe(false);
  expect(opened.code).toBe('unsupported-schema');
  expect(opened.message).toMatch(/not reset/);

  const localRecordId = namespace();
  const projectId = crypto.randomUUID();
  const write = await repoCall(page, 'commit', {
    localRecordId,
    projectId,
    expectedHead: null,
    nextHead: 'H1',
    createdAt: now(),
    actionId: crypto.randomUUID(),
    event: {
      localRecordId,
      projectId,
      kind: 'event',
      id: 'event-h1',
      createdAt: now(),
      payload: { type: 'inert-test' },
    },
  });
  expect(write.ok).toBe(false);
  expect(write.code).toBe('unsupported-schema');

  const names = requireOk(await repoCall(page, 'databaseNames'), 'database names');
  if (names.supported) {
    const appDb = names.databases.find((entry) => entry.name === DATABASE_NAME);
    expect(appDb).toBeTruthy();
    expect(appDb.version).toBe(2);
  }
  await context.close();
});
