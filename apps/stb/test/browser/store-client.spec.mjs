import { expect, test } from '@playwright/test';

import {
  PUBLISHED_BOARD_SKU,
  STORE_PIN,
  STORE_PROTOCOL_VERSION,
  STORE_REQUEST_TYPES,
} from '../../shared/contracts.mjs';
import { canonicalInchString } from '../../shared/canonical.mjs';
import { boardJobPayload } from '../../shared/store-wire.mjs';
import { repoCall, requireOk } from '../helpers/browser-repo.mjs';

function now() {
  return '2026-09-11T00:00:00.000Z';
}

async function seedProject(page, headLabel = 'H45') {
  const localRecordId = crypto.randomUUID();
  const projectId = crypto.randomUUID();
  const head = `${headLabel}-${crypto.randomUUID()}`;
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
          kind: 'candidate',
          id: head,
          createdAt: now(),
          payload: { label: headLabel },
        },
      ],
    }),
    'seed project',
  );
  return { localRecordId, projectId, head };
}

async function installMockTransport(page) {
  await page.evaluate(async () => {
    const { setStoreTransport } = await import('/integration/store-client.mjs');
    const { STORE_PIN, STORE_PROTOCOL_VERSION, WRAPPER_BUILD_ID } = await import('/shared/contracts.mjs');
    window.__storeHold = {};
    window.__storeCalls = [];
    window.__hold = (key) => {
      const id = String(key);
      if (!window.__storeHold[id]) {
        let release;
        const promise = new Promise((resolve) => {
          release = resolve;
        });
        window.__storeHold[id] = { promise, release };
      }
      return window.__storeHold[id];
    };
    window.__echoEnvelope = (wire, extra = {}) => ({
      protocolVersion: STORE_PROTOCOL_VERSION,
      wrapperBuildId: WRAPPER_BUILD_ID,
      storePin: STORE_PIN,
      requestId: wire.requestId,
      projectId: wire.projectId,
      candidateRevisionId: wire.candidateRevisionId,
      requestType: wire.requestType,
      scope: wire.scope,
      demandSignature: wire.demandSignature,
      querySignature: wire.querySignature,
      payloadDigest: wire.payloadDigest,
      attemptId: wire.attemptId,
      attemptNumber: wire.attemptNumber,
      wrapperRespondedAt: new Date().toISOString(),
      responseId: extra.responseId ?? crypto.randomUUID(),
      rawEvaluation: extra.rawEvaluation ?? {
        status: 'SUPPORTABLE',
        title: 'mock',
        lines: [{ storeSku: wire.payload?.line?.storeSku, qty: 1 }],
      },
      rawEstimate: extra.rawEstimate ?? {
        status: 'BUDGETARY_ESTIMATE',
        totals: { Q: 53.94 },
        cycle: { T_job_min: wire.payload?.line?.keptLength?.value === '45' ? 9.486 : 9.488 },
      },
      ...extra,
    });
    setStoreTransport(async (_url, init) => {
      const wire = JSON.parse(init.body);
      window.__storeCalls.push({
        attemptNumber: wire.attemptNumber,
        requestId: wire.requestId,
        attemptId: wire.attemptId,
        kept: wire.payload?.line?.keptLength?.value ?? null,
      });
      if (typeof window.__storeHandler === 'function') {
        return window.__storeHandler(_url, init, wire);
      }
      return new Response(JSON.stringify(window.__echoEnvelope(wire)), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });
  });
}

function jobPayload(keptLengthIn, lineId = 'line-board') {
  return boardJobPayload({
    lineId,
    storeSku: PUBLISHED_BOARD_SKU,
    keptLengthCanonical: canonicalInchString(keptLengthIn),
  });
}

test('B5 pending is committed before fetch and a valid answer can be current', async ({ page }) => {
  await page.goto('/');
  const seeded = await seedProject(page);
  await installMockTransport(page);
  await page.evaluate(() => {
    window.__storeHandler = async (_url, _init, wire) => {
      await window.__hold('first').promise;
      return new Response(JSON.stringify(window.__echoEnvelope(wire)), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };
  });

  const pending = page.evaluate(async (input) => {
    const client = await import('/integration/store-client.mjs');
    return client.issueStoreQuestion(input);
  }, {
    localRecordId: seeded.localRecordId,
    projectId: seeded.projectId,
    candidateRevisionId: seeded.head,
    requestType: STORE_REQUEST_TYPES.BOARD_SQUARE_V1,
    payload: jobPayload(45),
    requestId: 'req-45',
    attemptId: 'att-45-1',
  });

  await expect.poll(async () => {
    const attempts = requireOk(
      await repoCall(page, 'listRecords', { localRecordId: seeded.localRecordId, kind: 'attempt' }),
    );
    return attempts.length;
  }).toBe(1);

  const currentPending = requireOk(
    await repoCall(page, 'currentStore', {
      localRecordId: seeded.localRecordId,
      candidateRevisionId: seeded.head,
      scope: 'BOARD_SQUARE_V1',
    }),
  );
  expect(currentPending.status).toBe('pending');
  expect(currentPending.current).toBe(false);

  await page.evaluate(() => window.__hold('first').release());
  const result = await pending;
  expect(result.status).toBe('current');
  const current = requireOk(
    await repoCall(page, 'currentStore', {
      localRecordId: seeded.localRecordId,
      candidateRevisionId: seeded.head,
      scope: 'BOARD_SQUARE_V1',
    }),
  );
  expect(current.current).toBe(true);
  expect(current.response.payload.rawEvaluation.status).toBe('SUPPORTABLE');
});

test('M2-05/R05 late 45 remains historical after 46 is current', async ({ page }) => {
  await page.goto('/');
  const seeded = await seedProject(page, 'H45');
  await installMockTransport(page);
  await page.evaluate(() => {
    window.__storeHandler = async (_url, _init, wire) => {
      await window.__hold(wire.payload.line.keptLength.value).promise;
      return new Response(JSON.stringify(window.__echoEnvelope(wire)), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };
  });

  const first = page.evaluate(async (input) => {
    const client = await import('/integration/store-client.mjs');
    return client.issueStoreQuestion(input);
  }, {
    localRecordId: seeded.localRecordId,
    projectId: seeded.projectId,
    candidateRevisionId: seeded.head,
    requestType: STORE_REQUEST_TYPES.BOARD_SQUARE_V1,
    payload: jobPayload(45, 'line-45'),
    requestId: 'req-45',
    attemptId: 'att-45',
  });
  await expect.poll(async () => {
    const attempts = requireOk(
      await repoCall(page, 'listRecords', { localRecordId: seeded.localRecordId, kind: 'attempt' }),
    );
    return attempts.length;
  }).toBe(1);

  const head46 = `H46-${crypto.randomUUID()}`;
  requireOk(
    await repoCall(page, 'commit', {
      localRecordId: seeded.localRecordId,
      projectId: seeded.projectId,
      expectedHead: seeded.head,
      nextHead: head46,
      createdAt: now(),
      actionId: crypto.randomUUID(),
      records: [
        {
          localRecordId: seeded.localRecordId,
          projectId: seeded.projectId,
          kind: 'candidate',
          id: head46,
          createdAt: now(),
          payload: { label: 'H46' },
        },
      ],
    }),
    'commit 46',
  );

  const second = page.evaluate(async (input) => {
    const client = await import('/integration/store-client.mjs');
    return client.issueStoreQuestion(input);
  }, {
    localRecordId: seeded.localRecordId,
    projectId: seeded.projectId,
    candidateRevisionId: head46,
    requestType: STORE_REQUEST_TYPES.BOARD_SQUARE_V1,
    payload: jobPayload(46, 'line-46'),
    requestId: 'req-46',
    attemptId: 'att-46',
  });
  await page.evaluate(() => window.__hold('46').release());
  const result46 = await second;
  expect(result46.status).toBe('current');

  await page.evaluate(() => window.__hold('45').release());
  const result45 = await first;
  expect(result45.status).toBe('historical');

  const current46 = requireOk(
    await repoCall(page, 'currentStore', {
      localRecordId: seeded.localRecordId,
      candidateRevisionId: head46,
      scope: 'BOARD_SQUARE_V1',
    }),
  );
  expect(current46.current).toBe(true);
  expect(current46.request.id).toBe('req-46');
  const late45 = requireOk(
    await repoCall(page, 'currentStore', {
      localRecordId: seeded.localRecordId,
      candidateRevisionId: seeded.head,
      scope: 'BOARD_SQUARE_V1',
    }),
  );
  expect(late45.current).toBe(false);
  expect(late45.historical).toBe(true);
});

test('M2-05/R06 retry race: latest attempt controls, late 1 historical, duplicate 2 idempotent, conflict quarantined', async ({ page }) => {
  await page.goto('/');
  const seeded = await seedProject(page);
  await installMockTransport(page);
  await page.evaluate(() => {
    window.__storeHandler = async (_url, _init, wire) => {
      await window.__hold(String(wire.attemptNumber)).promise;
      return new Response(JSON.stringify(window.__echoEnvelope(wire)), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };
  });

  const first = page.evaluate(async (input) => {
    const client = await import('/integration/store-client.mjs');
    return client.issueStoreQuestion(input);
  }, {
    localRecordId: seeded.localRecordId,
    projectId: seeded.projectId,
    candidateRevisionId: seeded.head,
    requestType: STORE_REQUEST_TYPES.BOARD_SQUARE_V1,
    payload: jobPayload(45),
    requestId: 'req-retry',
    attemptId: 'att-1',
  });
  await expect.poll(async () => {
    const attempts = requireOk(
      await repoCall(page, 'listRecords', { localRecordId: seeded.localRecordId, kind: 'attempt' }),
    );
    return attempts.length;
  }).toBe(1);

  const second = page.evaluate(async (input) => {
    const client = await import('/integration/store-client.mjs');
    return client.retryStoreAttempt(input);
  }, {
    localRecordId: seeded.localRecordId,
    requestId: 'req-retry',
  });
  await expect.poll(async () => {
    const attempts = requireOk(
      await repoCall(page, 'listRecords', { localRecordId: seeded.localRecordId, kind: 'attempt' }),
    );
    return attempts.length;
  }).toBe(2);

  await page.evaluate(() => window.__hold('2').release());
  const result2 = await second;
  expect(result2.attemptNumber).toBe(2);
  expect(result2.status).toBe('current');

  await page.evaluate(() => window.__hold('1').release());
  const result1 = await first;
  expect(result1.status).toBe('historical');

  const current = requireOk(
    await repoCall(page, 'currentStore', {
      localRecordId: seeded.localRecordId,
      candidateRevisionId: seeded.head,
      scope: 'BOARD_SQUARE_V1',
    }),
  );
  expect(current.current).toBe(true);
  expect(current.attempt.payload.attemptNumber).toBe(2);

  const replay = await page.evaluate(async ({ localRecordId, requestId, attemptId }) => {
    const client = await import('/integration/store-client.mjs');
    const repo = await import('/data/repository.mjs');
    const request = await repo.getRecord(localRecordId, 'request', requestId);
    const attempt = await repo.getRecord(localRecordId, 'attempt', attemptId);
    const wire = {
      protocolVersion: request.payload.protocolVersion,
      requestId,
      projectId: request.projectId,
      candidateRevisionId: request.payload.candidateRevisionId,
      requestType: request.payload.requestType,
      scope: request.payload.scope,
      demandSignature: request.payload.demandSignature,
      querySignature: request.payload.querySignature,
      payloadDigest: request.payload.payloadDigest,
      expectedStorePin: request.payload.expectedStorePin,
      attemptId,
      attemptNumber: attempt.payload.attemptNumber,
      payload: request.payload.payload,
    };
    const existing = await repo.getRecordsByRequestAttempt(localRecordId, requestId, attemptId);
    const success = existing.find((record) => record.kind === 'response' && record.payload?.validation?.ok);
    const bytes = new TextEncoder().encode(JSON.stringify(success.payload.wrapperEnvelope));
    const identical = await client.ingestStoreHttpResult({
      localRecordId,
      projectId: request.projectId,
      wire,
      httpStatus: 200,
      bytes,
      receivedAt: new Date().toISOString(),
    });
    const conflictEnvelope = window.__echoEnvelope(wire, {
      rawEvaluation: { status: 'REFUSED', title: 'conflict' },
      rawEstimate: null,
    });
    const conflict = await client.ingestStoreHttpResult({
      localRecordId,
      projectId: request.projectId,
      wire,
      httpStatus: 200,
      bytes: new TextEncoder().encode(JSON.stringify(conflictEnvelope)),
      receivedAt: new Date().toISOString(),
    });
    return { identical: identical.status, conflict: conflict.status, conflictDiagnostic: conflict.diagnostic };
  }, {
    localRecordId: seeded.localRecordId,
    requestId: 'req-retry',
    attemptId: result2.attemptId,
  });
  expect(replay.identical).toBe('idempotent');
  expect(replay.conflict).toBe('conflict');
  expect(replay.conflictDiagnostic).toBe('APP_CORRELATION_ERROR');

  const stillCurrent = requireOk(
    await repoCall(page, 'currentStore', {
      localRecordId: seeded.localRecordId,
      candidateRevisionId: seeded.head,
      scope: 'BOARD_SQUARE_V1',
    }),
  );
  expect(stillCurrent.response.payload.rawEvaluation.status).toBe('SUPPORTABLE');
});

test('M2-05/R07 malformed, wrong correlation, transport error, and adapter error never become current', async ({ page }) => {
  await page.goto('/');
  const seeded = await seedProject(page);
  await installMockTransport(page);

  await page.evaluate(() => {
    window.__storeHandler = async () =>
      new Response('{not-json', { status: 200, headers: { 'Content-Type': 'application/json' } });
  });
  const malformed = await page.evaluate(async (input) => {
    const client = await import('/integration/store-client.mjs');
    return client.issueStoreQuestion(input);
  }, {
    localRecordId: seeded.localRecordId,
    projectId: seeded.projectId,
    candidateRevisionId: seeded.head,
    requestType: STORE_REQUEST_TYPES.BOARD_SQUARE_V1,
    payload: jobPayload(45, 'line-malformed'),
    refresh: true,
  });
  expect(malformed.diagnostic).toBe('APP_MALFORMED_RESPONSE');

  await page.evaluate(() => {
    window.__storeHandler = async (_url, _init, wire) =>
      new Response(JSON.stringify(window.__echoEnvelope(wire, { requestId: 'someone-else' })), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
  });
  const correlated = await page.evaluate(async (input) => {
    const client = await import('/integration/store-client.mjs');
    return client.issueStoreQuestion(input);
  }, {
    localRecordId: seeded.localRecordId,
    projectId: seeded.projectId,
    candidateRevisionId: seeded.head,
    requestType: STORE_REQUEST_TYPES.BOARD_SQUARE_V1,
    payload: jobPayload(46, 'line-corr'),
    refresh: true,
  });
  expect(correlated.diagnostic).toBe('APP_CORRELATION_ERROR');

  await page.evaluate(() => {
    window.__storeHandler = async () => {
      throw new TypeError('Failed to fetch');
    };
  });
  const transport = await page.evaluate(async (input) => {
    const client = await import('/integration/store-client.mjs');
    return client.issueStoreQuestion(input);
  }, {
    localRecordId: seeded.localRecordId,
    projectId: seeded.projectId,
    candidateRevisionId: seeded.head,
    requestType: STORE_REQUEST_TYPES.BOARD_SQUARE_V1,
    payload: jobPayload(45, 'line-transport'),
    refresh: true,
  });
  expect(transport.diagnostic).toBe('APP_TRANSPORT_ERROR');

  await page.evaluate(() => {
    window.__storeHandler = async () =>
      new Response(JSON.stringify({ adapterError: true, code: 'STORE_SOURCE_UNAVAILABLE' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
  });
  const adapter = await page.evaluate(async (input) => {
    const client = await import('/integration/store-client.mjs');
    return client.issueStoreQuestion(input);
  }, {
    localRecordId: seeded.localRecordId,
    projectId: seeded.projectId,
    candidateRevisionId: seeded.head,
    requestType: STORE_REQUEST_TYPES.BOARD_SQUARE_V1,
    payload: jobPayload(45, 'line-adapter'),
    refresh: true,
  });
  expect(adapter.diagnostic).toBe('APP_ADAPTER_ERROR');

  const current = requireOk(
    await repoCall(page, 'currentStore', {
      localRecordId: seeded.localRecordId,
      candidateRevisionId: seeded.head,
      scope: 'BOARD_SQUARE_V1',
    }),
  );
  expect(current.current).toBe(false);
  const responses = requireOk(
    await repoCall(page, 'listRecords', { localRecordId: seeded.localRecordId, kind: 'response' }),
  );
  expect(responses.some((record) => record.payload?.rawEvaluation?.status === 'REFUSED')).toBe(false);
  expect(responses.some((record) => record.payload?.diagnostic === 'APP_TRANSPORT_ERROR')).toBe(true);
});

test('interrupted pending attempt becomes APP_ATTEMPT_INTERRUPTED and requires Retry', async ({ page }) => {
  await page.goto('/');
  const seeded = await seedProject(page);
  requireOk(
    await repoCall(page, 'append', {
      localRecordId: seeded.localRecordId,
      projectId: seeded.projectId,
      createdAt: now(),
      actionId: crypto.randomUUID(),
      records: [
        {
          localRecordId: seeded.localRecordId,
          projectId: seeded.projectId,
          kind: 'request',
          id: 'req-int',
          requestId: 'req-int',
          createdAt: now(),
          payload: {
            requestType: STORE_REQUEST_TYPES.BOARD_SQUARE_V1,
            scope: 'BOARD_SQUARE_V1',
            protocolVersion: STORE_PROTOCOL_VERSION,
            expectedStorePin: STORE_PIN,
            demandSignature: 'abc',
            querySignature: null,
            payload: jobPayload(45),
            payloadDigest: 'd'.repeat(64),
            candidateRevisionId: seeded.head,
            requestSequence: 1,
          },
        },
        {
          localRecordId: seeded.localRecordId,
          projectId: seeded.projectId,
          kind: 'attempt',
          id: 'att-int',
          requestId: 'req-int',
          attemptId: 'att-int',
          createdAt: now(),
          payload: { attemptNumber: 1, enqueuedAt: now(), pending: true },
        },
      ],
      event: {
        localRecordId: seeded.localRecordId,
        projectId: seeded.projectId,
        kind: 'event',
        id: 'event-enqueued-int',
        requestId: 'req-int',
        attemptId: 'att-int',
        createdAt: now(),
        payload: { type: 'attempt-enqueued', terminal: false },
      },
    }),
    'seed pending',
  );

  const recovered = requireOk(
    await repoCall(page, 'recoverStore', { localRecordId: seeded.localRecordId }),
    'recover',
  );
  expect(recovered).toContain('att-int');
  const inspection = requireOk(
    await repoCall(page, 'inspectAttempt', {
      localRecordId: seeded.localRecordId,
      attemptId: 'att-int',
    }),
  );
  expect(inspection.status).toBe('interrupted');
  expect(inspection.reason).toBe('APP_ATTEMPT_INTERRUPTED');
  expect(inspection.currentStoreAnswer).toBe(false);

  await installMockTransport(page);
  const retried = await page.evaluate(async (input) => {
    const client = await import('/integration/store-client.mjs');
    return client.retryStoreAttempt(input);
  }, {
    localRecordId: seeded.localRecordId,
    requestId: 'req-int',
  });
  expect(retried.attemptNumber).toBe(2);
  expect(retried.status).toBe('current');
});
