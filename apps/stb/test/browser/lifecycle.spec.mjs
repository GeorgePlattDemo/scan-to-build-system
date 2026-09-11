import { expect, test } from '@playwright/test';

import { FIXED_ORIGIN } from '../../shared/contracts.mjs';
import { sha256Hex } from '../../shared/canonical.mjs';
import {
  JPEG_FIXTURE,
  PDF_FIXTURE,
  PNG_FIXTURE,
  TEXT_FIXTURE,
  asArray,
} from '../fixtures/bytes.mjs';
import { ALTERNATE_ORIGIN, startAlternateOriginServer } from '../helpers/alternate-origin.mjs';
import { repoCall, requireOk } from '../helpers/browser-repo.mjs';
import {
  launchPersistentProfile,
  makeProfileDir,
  removeProfileDir,
} from '../helpers/persistent-browser.mjs';

function now() {
  return '2026-09-10T22:00:00.000Z';
}

async function prepareFixtures(page) {
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

async function seedCustody(page, { localRecordId, projectId }) {
  const blobs = await prepareFixtures(page);
  const records = ['text', 'jpeg', 'png', 'pdf'].flatMap((name) => [
    {
      localRecordId,
      projectId,
      kind: 'evidence',
      id: `evidence-${name}`,
      createdAt: now(),
      payload: {
        blob: blobs[name].sha256,
        filename: `source.${name}`,
        mime: blobs[name].type,
        size: blobs[name].size,
      },
    },
    {
      localRecordId,
      projectId,
      kind: 'observation',
      id: `observation-${name}`,
      createdAt: now(),
      payload: {
        evidenceId: `evidence-${name}`,
        blob: blobs[name].sha256,
        role: 'inert-test',
      },
    },
  ]);
  requireOk(
    await repoCall(page, 'save', {
      localRecordId,
      projectId,
      expectedHead: null,
      nextHead: 'H0',
      createdAt: now(),
      actionId: crypto.randomUUID(),
      blobs: Object.values(blobs),
      records,
      event: {
        localRecordId,
        projectId,
        kind: 'event',
        id: 'event-h0',
        createdAt: now(),
        payload: { type: 'inert-test' },
      },
    }),
    'seed custody',
  );
  return blobs;
}

test('B0-04 real browser process restart retains original bytes and head', async () => {
  test.setTimeout(60_000);
  const userDataDir = makeProfileDir();
  const localRecordId = crypto.randomUUID();
  const projectId = crypto.randomUUID();
  let first;
  try {
    first = await launchPersistentProfile(userDataDir);
    const writer = await first.newPage();
    await writer.goto(FIXED_ORIGIN);
    const blobs = await seedCustody(writer, { localRecordId, projectId });
    expect(await writer.locator('#save-status').textContent()).toBe('Saved on this device');
    await first.close();
    first = null;

    const second = await launchPersistentProfile(userDataDir);
    try {
      const reader = await second.newPage();
      await reader.goto(FIXED_ORIGIN);
      expect(requireOk(await repoCall(reader, 'head', { localRecordId }), 'reopened head')).toBe(
        'H0',
      );
      const fixtures = { text: TEXT_FIXTURE, jpeg: JPEG_FIXTURE, png: PNG_FIXTURE, pdf: PDF_FIXTURE };
      for (const name of Object.keys(fixtures)) {
        const expectedHash = await sha256Hex(fixtures[name].bytes);
        expect(blobs[name].sha256).toBe(expectedHash);
        const evidence = requireOk(
          await repoCall(reader, 'record', {
            localRecordId,
            kind: 'evidence',
            id: `evidence-${name}`,
          }),
          `evidence ${name}`,
        );
        const observation = requireOk(
          await repoCall(reader, 'record', {
            localRecordId,
            kind: 'observation',
            id: `observation-${name}`,
          }),
          `observation ${name}`,
        );
        expect(evidence.payload.blob).toBe(expectedHash);
        expect(evidence.payload.mime).toBe(fixtures[name].type);
        expect(evidence.payload.size).toBe(fixtures[name].bytes.byteLength);
        expect(observation.payload.evidenceId).toBe(`evidence-${name}`);
        const custody = requireOk(
          await repoCall(reader, 'inspectSource', { sha256: expectedHash }),
          `custody ${name}`,
        );
        expect(custody.status).toBe('retained');
        expect(custody.bytes).toEqual(asArray(fixtures[name].bytes));
        expect(await sha256Hex(Uint8Array.from(custody.bytes))).toBe(expectedHash);
      }
    } finally {
      await second.close();
    }
  } finally {
    if (first) {
      await first.close();
    }
    removeProfileDir(userDataDir);
  }
});

test('B0-06 two real tabs conflict on the same expected head', async ({ page, context }) => {
  const pageA = page;
  const pageB = await context.newPage();
  await pageA.goto('/');
  await pageB.goto('/');
  const localRecordId = crypto.randomUUID();
  const projectId = crypto.randomUUID();

  requireOk(
    await repoCall(pageA, 'save', {
      localRecordId,
      projectId,
      expectedHead: null,
      nextHead: 'H0',
      createdAt: now(),
      actionId: crypto.randomUUID(),
      event: {
        localRecordId,
        projectId,
        kind: 'event',
        id: 'event-h0',
        createdAt: now(),
        payload: { type: 'inert-test' },
      },
    }),
    'seed H0',
  );

  await repoCall(pageA, 'putDraft', {
    localRecordId,
    draftId: 'tab-a',
    expectedHead: 'H0',
    createdAt: now(),
    payload: { nextHead: 'HA', note: 'from-A' },
  });
  await repoCall(pageB, 'putDraft', {
    localRecordId,
    draftId: 'tab-b',
    expectedHead: 'H0',
    createdAt: now(),
    payload: { nextHead: 'HB', note: 'from-B' },
  });

  const commitA = {
    localRecordId,
    projectId,
    expectedHead: 'H0',
    nextHead: 'HA',
    createdAt: now(),
    actionId: crypto.randomUUID(),
    records: [
      {
        localRecordId,
        projectId,
        kind: 'note',
        id: 'note-a',
        createdAt: now(),
        payload: { from: 'A' },
      },
    ],
    event: {
      localRecordId,
      projectId,
      kind: 'event',
      id: 'event-ha',
      createdAt: now(),
      payload: { type: 'inert-test', from: 'A' },
    },
  };
  const commitB = {
    localRecordId,
    projectId,
    expectedHead: 'H0',
    nextHead: 'HB',
    createdAt: now(),
    actionId: crypto.randomUUID(),
    records: [
      {
        localRecordId,
        projectId,
        kind: 'note',
        id: 'note-b',
        createdAt: now(),
        payload: { from: 'B' },
      },
    ],
    event: {
      localRecordId,
      projectId,
      kind: 'event',
      id: 'event-hb',
      createdAt: now(),
      payload: { type: 'inert-test', from: 'B' },
    },
  };

  const [resultA, resultB] = await Promise.all([
    repoCall(pageA, 'save', commitA),
    repoCall(pageB, 'save', commitB),
  ]);

  const outcomes = [
    { tab: 'A', result: resultA, head: 'HA', note: 'note-a', draft: 'tab-a' },
    { tab: 'B', result: resultB, head: 'HB', note: 'note-b', draft: 'tab-b' },
  ];
  const winners = outcomes.filter(
    (entry) => entry.result.ok && entry.result.value.status === 'committed',
  );
  const losers = outcomes.filter(
    (entry) => !entry.result.ok && entry.result.code === 'head-conflict',
  );
  expect(winners).toHaveLength(1);
  expect(losers).toHaveLength(1);

  const winner = winners[0];
  const loser = losers[0];
  const durableHead = requireOk(await repoCall(pageA, 'head', { localRecordId }), 'durable head');
  expect(durableHead).toBe(winner.head);
  expect(durableHead).not.toBe(loser.head);

  expect(
    requireOk(
      await repoCall(pageA, 'record', { localRecordId, kind: 'note', id: winner.note }),
      'winner note',
    ),
  ).toBeTruthy();
  expect(
    requireOk(
      await repoCall(pageA, 'record', { localRecordId, kind: 'note', id: loser.note }),
      'loser note',
    ),
  ).toBeNull();

  const loserPage = loser.tab === 'A' ? pageA : pageB;
  const winnerPage = winner.tab === 'A' ? pageA : pageB;
  expect(await winnerPage.locator('#save-status').textContent()).toBe('Saved on this device');
  expect(await loserPage.locator('#save-status').textContent()).toBe('Save failed');

  const recovered = requireOk(
    await repoCall(loserPage, 'inspectUnapplied', {
      localRecordId,
      draftId: loser.draft,
    }),
    'loser draft',
  );
  expect(recovered.payload.nextHead).toBe(loser.head);
  expect(recovered.expectedHead).toBe('H0');
  expect(await loserPage.locator('#unapplied-status').textContent()).toBe('Unapplied changes');
});

test('B0-07 interrupted pending attempt survives process restart as history', async () => {
  test.setTimeout(60_000);
  const userDataDir = makeProfileDir();
  const localRecordId = crypto.randomUUID();
  const projectId = crypto.randomUUID();
  let first;
  try {
    first = await launchPersistentProfile(userDataDir);
    const writer = await first.newPage();
    await writer.goto(FIXED_ORIGIN);
    requireOk(
      await repoCall(writer, 'save', {
        localRecordId,
        projectId,
        expectedHead: null,
        nextHead: 'H0',
        createdAt: now(),
        actionId: crypto.randomUUID(),
        records: [
          {
            localRecordId,
            projectId,
            kind: 'request',
            id: 'req-1',
            requestId: 'req-1',
            createdAt: now(),
            payload: { scope: 'inert-test' },
          },
          {
            localRecordId,
            projectId,
            kind: 'attempt',
            id: 'att-1',
            requestId: 'req-1',
            attemptId: 'att-1',
            createdAt: now(),
            payload: { attemptNumber: 1, enqueuedAt: now(), pending: true },
          },
        ],
        event: {
          localRecordId,
          projectId,
          kind: 'event',
          id: 'event-enqueued',
          requestId: 'req-1',
          attemptId: 'att-1',
          createdAt: now(),
          payload: { type: 'attempt-enqueued', terminal: false },
        },
      }),
      'seed pending attempt',
    );
    await first.close();
    first = null;

    const second = await launchPersistentProfile(userDataDir);
    try {
      const reader = await second.newPage();
      const network = [];
      reader.on('request', (request) => network.push(request.url()));
      await reader.goto(FIXED_ORIGIN);
      const inspection = requireOk(
        await repoCall(reader, 'inspectAttempt', {
          localRecordId,
          attemptId: 'att-1',
        }),
        'inspect attempt',
      );
      expect(inspection.status).toBe('interrupted');
      expect(inspection.representation).toBe('historical');
      expect(inspection.success).toBe(false);
      expect(inspection.completed).toBe(false);
      expect(inspection.currentStoreAnswer).toBe(false);
      expect(await reader.locator('#attempt-status').textContent()).toBe(
        'Interrupted historical attempt',
      );
      expect(network.some((url) => /\/api\/store-zero\//.test(url))).toBe(false);
    } finally {
      await second.close();
    }
  } finally {
    if (first) {
      await first.close();
    }
    removeProfileDir(userDataDir);
  }
});

test('B0-07 alternate origin cannot see product-origin records', async () => {
  test.setTimeout(60_000);
  const alternate = await startAlternateOriginServer();
  const userDataDir = makeProfileDir();
  const localRecordId = crypto.randomUUID();
  const projectId = crypto.randomUUID();
  let context;
  try {
    context = await launchPersistentProfile(userDataDir);
    const product = await context.newPage();
    await product.goto(FIXED_ORIGIN);
    await seedCustody(product, { localRecordId, projectId });

    const other = await context.newPage();
    await other.goto(ALTERNATE_ORIGIN);
    await expect(other.locator('#storage-origin-status')).toHaveText(/were not deleted/);
    const names = requireOk(await repoCall(other, 'databaseNames'), 'alt databases');
    if (names.supported) {
      expect(names.databases.some((entry) => entry.name === 'stb-app-v1')).toBe(false);
    }
    const missing = requireOk(
      await repoCall(other, 'project', { localRecordId }),
      'alt project',
    );
    expect(missing).toBeNull();
    expect(requireOk(await repoCall(other, 'head', { localRecordId }), 'alt head')).toBeNull();

    await context.close();
    context = await launchPersistentProfile(userDataDir);
    const reopened = await context.newPage();
    await reopened.goto(FIXED_ORIGIN);
    expect(requireOk(await repoCall(reopened, 'head', { localRecordId }), 'returned head')).toBe(
      'H0',
    );
    const textHash = await sha256Hex(TEXT_FIXTURE.bytes);
    const custody = requireOk(
      await repoCall(reopened, 'blob', { sha256: textHash }),
      'returned blob',
    );
    expect(custody.status).toBe('retained');
    expect(custody.bytes).toEqual(asArray(TEXT_FIXTURE.bytes));
  } finally {
    if (context) {
      await context.close();
    }
    removeProfileDir(userDataDir);
    await alternate.close();
  }
});
