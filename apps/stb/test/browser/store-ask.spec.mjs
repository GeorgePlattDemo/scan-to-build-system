import { expect, test } from '@playwright/test';

import {
  ACTORS,
  COPY,
  PUBLISHED_BOARD_SKU,
  STORE_PIN,
} from '../../shared/contracts.mjs';
import { repoCall, requireOk } from '../helpers/browser-repo.mjs';

const STORE_IDLE = { timeout: 20_000 };

async function openBoard(page) {
  await page.goto('/');
  await page.getByRole('button', { name: ACTORS.new.label }).click();
  await page.getByRole('button', { name: COPY.next }).click();
  await page.getByRole('button', { name: COPY.startOwn }).click();
  await expect(page.locator('[data-page="page2"]')).toBeVisible();
  await page.getByRole('button', { name: 'PICK A BOARD', exact: true }).click();
  await expect(page.locator('[data-child-panel="board"]')).toBeVisible();
}

async function waitForStoreIdle(page, mode = 'compact') {
  const panel = page.locator(`[data-store-panel="${mode}"]`).first();
  await expect(panel).toBeVisible();
  await expect(panel).not.toHaveAttribute('data-pending', 'true', STORE_IDLE);
}

async function applyLengthUi(page, raw, unit = 'in', { waitForIdle = true } = {}) {
  await page.locator('[data-field="board-length"]').fill(raw);
  await page.locator('[data-field="board-unit"]').fill(unit);
  await page.getByRole('button', { name: COPY.boardApply }).click();
  await expect(page.locator('[data-unapplied="board"]')).toBeHidden();
  await expect(page.locator('[data-candidate-view="true"]')).toBeVisible();
  const valid = await page.locator('[data-candidate-view="true"]').getAttribute('data-valid');
  if (waitForIdle && valid === 'true') {
    await waitForStoreIdle(page);
  }
}

async function localRecordId(page) {
  return page.locator('[data-local-record-id]').getAttribute('data-local-record-id');
}

async function listKind(page, id, kind) {
  return requireOk(await repoCall(page, 'listRecords', { localRecordId: id, kind }));
}

async function openStorePage(page) {
  await page.getByRole('button', { name: COPY.storeInspect }).first().click();
  await expect(page.locator('[data-page="page5"]')).toBeVisible();
  await expect(page.locator('[data-store-panel="full"]')).toBeVisible();
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
      requestId: extra.requestId ?? wire.requestId,
      projectId: wire.projectId,
      candidateRevisionId: wire.candidateRevisionId,
      requestType: wire.requestType,
      scope: wire.scope,
      demandSignature: wire.demandSignature,
      querySignature: wire.querySignature,
      payloadDigest: wire.payloadDigest,
      attemptId: extra.attemptId ?? wire.attemptId,
      attemptNumber: wire.attemptNumber,
      wrapperRespondedAt: new Date().toISOString(),
      responseId: extra.responseId ?? crypto.randomUUID(),
      rawOffering: extra.rawOffering ?? {
        storeSku: wire.payload?.line?.storeSku,
        description: '2x4 x 72 in SPF construction',
        species: 'spf',
        actualW: 3.5,
        actualT: 1.5,
        stockL_in: 72,
        offered: true,
        catalogClock: '2026-09-10',
      },
      rawEvaluation: extra.rawEvaluation ?? {
        status: 'SUPPORTABLE',
        lines: [
          {
            stock: { status: 'ON_HAND_SUFFICIENT', available: 84, qtyNeeded: 1, asOf: '2026-09-10' },
            price: { sellingPrice: 3.13, asOf: '2026-09-10' },
            capability: { status: 'SUPPORTABLE' },
          },
        ],
      },
      rawEstimate: extra.rawEstimate === undefined
        ? {
            status: 'BUDGETARY_ESTIMATE',
            totals: { material: 3.13, cell_recovery: 50.81, Q: 53.94 },
            cycle: { model: 'STB-D001-CYCLE-MODEL-S2-0.1', T_job_min: 9.486, measured: false },
            engine: { id: 'STB-STORE-ZERO-PRICE-1', version: '0.2.3' },
          }
        : extra.rawEstimate,
      attributedBasis: extra.attributedBasis ?? {
        pricingEngine: { id: 'STB-STORE-ZERO-PRICE-1', version: '0.2.3' },
        cycleModel: { id: 'STB-D001-CYCLE-MODEL-S2-0.1' },
        envelope: { id: 'D001-STAGE2-ENVELOPE-0.3' },
        sourceClock: '2026-09-10',
        measured: false,
        commissioned: false,
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

test('P5-01 valid committed 45 auto-asks once and Board/Page 5 copy the actual Store answer', async ({ page }) => {
  const jobs = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().includes('/api/store-zero/job')) {
      jobs.push(request.url());
    }
  });
  await openBoard(page);
  const id = await localRecordId(page);
  await applyLengthUi(page, '45');
  const compact = page.locator('[data-store-panel="compact"]');
  await expect(compact).toHaveAttribute('data-current', 'true');
  await expect(compact.locator('[data-store-disposition]')).toHaveText('SUPPORTABLE');
  await expect(compact.locator('[data-store-sku]')).toHaveText(PUBLISHED_BOARD_SKU);
  await expect(compact.locator('[data-store-q]')).toHaveAttribute('data-store-q', '$53.94');
  await expect(compact.locator('[data-store-reference-scope]')).toHaveText(COPY.storeReferenceScope);
  await expect(compact).not.toContainText(COPY.storeUnavailable);

  const requestsAfterAsk = await listKind(page, id, 'request');
  expect(requestsAfterAsk).toHaveLength(1);
  expect(jobs.length).toBe(1);

  await page.getByRole('button', { name: COPY.back, exact: true }).first().click();
  await expect(page.locator('[data-intake-grid]')).toBeVisible();
  await page.getByRole('button', { name: 'PICK A BOARD', exact: true }).click();
  await expect(compact).toHaveAttribute('data-current', 'true');
  expect(await listKind(page, id, 'request')).toHaveLength(1);
  expect(jobs.length).toBe(1);

  await openStorePage(page);
  const full = page.locator('[data-store-panel="full"]');
  await expect(full).toHaveAttribute('data-current', 'true');
  await expect(full.locator('[data-store-disposition]')).toHaveText('SUPPORTABLE');
  await expect(full.locator('[data-store-sku]').first()).toContainText(PUBLISHED_BOARD_SKU);
  await expect(full.locator('[data-store-q]')).toHaveAttribute('data-store-q', '$53.94');
  await expect(full.locator('[data-store-actual-w]')).toContainText('3.5');
  await expect(full.locator('[data-store-material]')).toContainText('$3.13');
  await expect(full.locator('[data-store-minutes]')).toContainText('9.486 min');
  await expect(full.locator('[data-pricing-engine]')).toContainText('STB-STORE-ZERO-PRICE-1');
  await expect(full.locator('[data-pricing-engine-version]')).toContainText('0.2.3');
  await expect(full.locator('[data-cycle-model]')).toContainText('STB-D001-CYCLE-MODEL-S2-0.1');
  await expect(full.locator('[data-envelope-id]')).toContainText('D001-STAGE2-ENVELOPE-0.3');
  await expect(full.locator('[data-store-pin]')).toContainText(STORE_PIN);
  await expect(full.locator('[data-store-basis-line]')).toHaveText(COPY.storeBasisLine);
  await expect(full.getByText(COPY.storeNotQuote)).toBeVisible();
  await expect(full.getByText(COPY.storeModeledTime)).toBeVisible();
  expect(await listKind(page, id, 'request')).toHaveLength(1);
  expect(jobs.length).toBe(1);

  await page.reload();
  await expect(page.locator('[data-store-panel="full"]')).toHaveAttribute('data-current', 'true');
  await expect(page.locator('[data-store-q]')).toHaveAttribute('data-store-q', '$53.94');
  expect(await listKind(page, id, 'request')).toHaveLength(1);
  expect(jobs.length).toBe(1);
});

test('P5-06 45 to 46 invalidates the old Q immediately and keeps 45 historical', async ({ page }) => {
  await openBoard(page);
  await installMockTransport(page);
  await page.evaluate(() => {
    window.__storeHandler = async (_url, _init, wire) => {
      const kept = wire.payload.line.keptLength.value;
      if (kept === '46') {
        await window.__hold('46').promise;
      }
      const q = kept === '46' ? 54.12 : 53.94;
      const minutes = kept === '46' ? 9.488 : 9.486;
      return new Response(
        JSON.stringify(
          window.__echoEnvelope(wire, {
            rawEstimate: {
              status: 'BUDGETARY_ESTIMATE',
              totals: { material: 3.13, cell_recovery: kept === '46' ? 50.99 : 50.81, Q: q },
              cycle: { model: 'STB-D001-CYCLE-MODEL-S2-0.1', T_job_min: minutes, measured: false },
              engine: { id: 'STB-STORE-ZERO-PRICE-1', version: '0.2.3' },
            },
          }),
        ),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
    };
  });

  await applyLengthUi(page, '45');
  const id = await localRecordId(page);
  const head45 = requireOk(await repoCall(page, 'currentCandidate', { localRecordId: id })).id;
  await expect(page.locator('[data-store-panel="compact"]')).toHaveAttribute('data-current', 'true');
  await expect(page.locator('[data-store-q]')).toHaveAttribute('data-store-q', '$53.94');
  await expect(page.locator('[data-store-panel="compact"]')).toHaveAttribute('data-store-revision', head45);
  expect(await listKind(page, id, 'request')).toHaveLength(1);

  await applyLengthUi(page, '46', 'in', { waitForIdle: false });
  await expect(page.locator('[data-part-summary]')).toHaveAttribute('data-finished-length', '46');
  await expect(page.locator('[data-store-panel="compact"]')).toHaveAttribute('data-pending', 'true');
  await expect(page.locator('[data-store-headline]')).toHaveText(COPY.storePending);
  await expect(page.locator('[data-store-panel="compact"] [data-store-q]')).toHaveCount(0);
  expect(await listKind(page, id, 'request')).toHaveLength(2);

  await page.evaluate(() => window.__hold('46').release());
  await waitForStoreIdle(page);
  const head46 = requireOk(await repoCall(page, 'currentCandidate', { localRecordId: id })).id;
  expect(head46).not.toBe(head45);
  await expect(page.locator('[data-store-panel="compact"]')).toHaveAttribute('data-current', 'true');
  await expect(page.locator('[data-store-q]')).toHaveAttribute('data-store-q', '$54.12');
  await expect(page.locator('[data-store-panel="compact"]')).toHaveAttribute('data-store-revision', head46);

  await openStorePage(page);
  await expect(page.locator('[data-store-panel="full"]')).toHaveAttribute('data-current', 'true');
  await expect(page.locator('[data-store-panel="full"] [data-store-q]')).toHaveAttribute('data-store-q', '$54.12');
  await expect(page.locator('[data-store-history]')).toBeVisible();
  const historical = page.locator('[data-store-history] [data-store-panel="compact"]');
  await expect(historical).toHaveAttribute('data-historical', 'true');
  await expect(historical).toHaveAttribute('data-current', 'false');
  await expect(historical.locator('[data-store-headline]')).toHaveText(COPY.storeHistorical);
  await expect(historical.locator('[data-store-q]')).toHaveAttribute('data-store-q', '$53.94');
  expect(await listKind(page, id, 'request')).toHaveLength(2);
  expect(await page.evaluate(() => window.__storeCalls.length)).toBe(2);
});

test('incomplete Board and unapplied buffer do not auto-ask', async ({ page }) => {
  const jobs = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().includes('/api/store-zero/job')) {
      jobs.push(request.url());
    }
  });
  await openBoard(page);
  const id = await localRecordId(page);
  await applyLengthUi(page, '16');
  await expect(page.locator('[data-store-panel="compact"]')).toHaveAttribute('data-store-kind', 'incomplete');
  expect(await listKind(page, id, 'request')).toHaveLength(0);
  expect(jobs.length).toBe(0);

  await applyLengthUi(page, '45');
  expect(await listKind(page, id, 'request')).toHaveLength(1);
  expect(jobs.length).toBe(1);
  await page.locator('[data-field="board-length"]').fill('46');
  await expect(page.locator('[data-unapplied="board"]')).toBeVisible();
  await expect(page.locator('[data-unapplied="store"]')).toBeVisible();
  await expect(page.locator('[data-store-panel="compact"]')).toHaveAttribute('data-current', 'true');
  await expect(page.locator('[data-store-q]')).toHaveAttribute('data-store-q', '$53.94');
  expect(await listKind(page, id, 'request')).toHaveLength(1);
  expect(jobs.length).toBe(1);
});

test('pending copy has no earlier Q; transport error offers Retry as a new attempt', async ({ page }) => {
  await openBoard(page);
  await installMockTransport(page);
  await page.evaluate(() => {
    window.__storeHandler = async (_url, _init, wire) => {
      await window.__hold('first').promise;
      throw new TypeError('Failed to fetch');
    };
  });
  await applyLengthUi(page, '45', 'in', { waitForIdle: false });
  await expect(page.locator('[data-store-headline]')).toHaveText(COPY.storePending);
  await expect(page.locator('[data-store-panel="compact"]')).toHaveAttribute('data-pending', 'true');
  await expect(page.locator('[data-store-q]')).toHaveCount(0);
  await expect(page.locator('[data-store-disposition]')).toHaveCount(0);

  await page.evaluate(() => window.__hold('first').release());
  await waitForStoreIdle(page);
  await expect(page.locator('[data-store-headline]')).toHaveText(COPY.storeTransport);
  await expect(page.locator('[data-store-diagnostic]')).toHaveText('APP_TRANSPORT_ERROR');
  await expect(page.locator('[data-store-disposition]')).toHaveCount(0);
  const id = await localRecordId(page);
  expect(await listKind(page, id, 'request')).toHaveLength(1);
  expect(await listKind(page, id, 'attempt')).toHaveLength(1);

  await page.evaluate(() => {
    window.__storeHandler = async (_url, _init, wire) => {
      await window.__hold('retry').promise;
      return new Response(JSON.stringify(window.__echoEnvelope(wire)), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };
  });
  await page.getByRole('button', { name: COPY.storeRetry }).click();
  await expect(page.locator('[data-store-panel="compact"]')).toHaveAttribute('data-pending', 'true');
  await page.evaluate(() => window.__hold('retry').release());
  await waitForStoreIdle(page);
  await expect(page.locator('[data-store-disposition]')).toHaveText('SUPPORTABLE');
  expect(await listKind(page, id, 'request')).toHaveLength(1);
  expect(await listKind(page, id, 'attempt')).toHaveLength(2);
  expect(await page.evaluate(() => window.__storeCalls.map((call) => call.attemptNumber))).toEqual([1, 2]);
});

test('reopen of a pending attempt is interrupted and does not silently resume', async ({ page }) => {
  await openBoard(page);
  await installMockTransport(page);
  await page.evaluate(() => {
    window.__storeHandler = async (_url, _init, wire) => {
      await window.__hold('open').promise;
      return new Response(JSON.stringify(window.__echoEnvelope(wire)), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };
  });
  await applyLengthUi(page, '45', 'in', { waitForIdle: false });
  await expect(page.locator('[data-store-panel="compact"]')).toHaveAttribute('data-pending', 'true');
  const id = await localRecordId(page);
  expect(await listKind(page, id, 'request')).toHaveLength(1);

  await page.reload();
  await expect(page.locator('[data-child-panel="board"]')).toBeVisible();
  await expect(page.locator('[data-store-headline]')).toHaveText(COPY.storeInterrupted);
  await expect(page.locator('[data-store-diagnostic]')).toHaveText('APP_ATTEMPT_INTERRUPTED');
  await expect(page.locator('[data-store-disposition]')).toHaveCount(0);
  expect(await listKind(page, id, 'request')).toHaveLength(1);
  expect(await page.evaluate(() => window.__storeCalls?.length ?? 0)).toBe(0);

  await installMockTransport(page);
  await page.getByRole('button', { name: COPY.storeRetry }).click();
  await waitForStoreIdle(page);
  await expect(page.locator('[data-store-disposition]')).toHaveText('SUPPORTABLE');
  expect(await listKind(page, id, 'request')).toHaveLength(1);
  expect(await listKind(page, id, 'attempt')).toHaveLength(2);
});

test('malformed and correlation diagnostics stay inspectable and never current Q', async ({ page }) => {
  await openBoard(page);
  await installMockTransport(page);
  await page.evaluate(() => {
    window.__storeHandler = async () =>
      new Response('{not-json', { status: 200, headers: { 'Content-Type': 'application/json' } });
  });
  await applyLengthUi(page, '45');
  await expect(page.locator('[data-store-headline]')).toHaveText(COPY.storeMalformed);
  await expect(page.locator('[data-store-diagnostic]')).toHaveText('APP_MALFORMED_RESPONSE');
  await expect(page.locator('[data-store-q]')).toHaveCount(0);
  await expect(page.locator('[data-store-disposition]')).toHaveCount(0);

  await page.evaluate(() => {
    window.__storeHandler = async (_url, _init, wire) =>
      new Response(JSON.stringify(window.__echoEnvelope(wire, { requestId: 'someone-else' })), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
  });
  await applyLengthUi(page, '46');
  await expect(page.locator('[data-store-headline]')).toHaveText(COPY.storeCorrelation);
  await expect(page.locator('[data-store-diagnostic]')).toHaveText('APP_CORRELATION_ERROR');
  await expect(page.locator('[data-store-q]')).toHaveCount(0);
});

test('Store UNRESOLVED REFUSED UNAVAILABLE keep exact enums and reasons with no Q', async ({ page }) => {
  await openBoard(page);
  await installMockTransport(page);

  await page.evaluate(() => {
    window.__storeHandler = async (_url, _init, wire) =>
      new Response(
        JSON.stringify(
          window.__echoEnvelope(wire, {
            rawEvaluation: {
              status: 'UNRESOLVED',
              lines: [{ capability: { status: 'UNRESOLVED', missing: ['UNKNOWN_SKU'] } }],
            },
            rawEstimate: null,
          }),
        ),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
  });
  await applyLengthUi(page, '45');
  await expect(page.locator('[data-store-disposition]')).toHaveText('UNRESOLVED');
  await expect(page.locator('[data-raw-reason]').first()).toHaveText('UNKNOWN_SKU');
  await expect(page.locator('[data-store-q]')).toHaveAttribute('data-store-q', 'none');

  await page.evaluate(() => {
    window.__storeHandler = async (_url, _init, wire) =>
      new Response(
        JSON.stringify(
          window.__echoEnvelope(wire, {
            rawEvaluation: {
              status: 'REFUSED',
              lines: [
                {
                  capability: {
                    status: 'REFUSED',
                    missing: ['STOCK_WIDTH_EXCEEDS_D001_STAGE2_ENVELOPE'],
                  },
                },
              ],
            },
            rawEstimate: null,
          }),
        ),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
  });
  await applyLengthUi(page, '46');
  await expect(page.locator('[data-store-disposition]')).toHaveText('REFUSED');
  await expect(page.locator('[data-raw-reason]').first()).toHaveText(
    'STOCK_WIDTH_EXCEEDS_D001_STAGE2_ENVELOPE',
  );
  await expect(page.locator('[data-store-q]')).toHaveAttribute('data-store-q', 'none');

  await page.evaluate(() => {
    window.__storeHandler = async (_url, _init, wire) =>
      new Response(
        JSON.stringify(
          window.__echoEnvelope(wire, {
            rawEvaluation: {
              status: 'UNAVAILABLE',
              lines: [{ stock: { status: 'ON_HAND_SHORT', reason: 'ON_HAND_SHORT', available: 3, qtyNeeded: 10 } }],
            },
            rawEstimate: null,
          }),
        ),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
  });
  await applyLengthUi(page, '47');
  await expect(page.locator('[data-store-disposition]')).toHaveText('UNAVAILABLE');
  await openStorePage(page);
  await expect(page.locator('[data-store-panel="full"] [data-store-disposition]')).toHaveText('UNAVAILABLE');
  await expect(page.locator('[data-stock-status]')).toContainText('ON_HAND_SHORT');
  await expect(page.locator('[data-store-diagnostic]')).toHaveCount(0);
  await expect(page.locator('[data-store-panel="full"] [data-store-q]')).toHaveAttribute('data-store-q', 'none');
});

test('SUPPORTABLE with estimate failure shows support and no zero Q', async ({ page }) => {
  await openBoard(page);
  await installMockTransport(page);
  await page.evaluate(() => {
    window.__storeHandler = async (_url, _init, wire) =>
      new Response(
        JSON.stringify(
          window.__echoEnvelope(wire, {
            rawEvaluation: {
              status: 'SUPPORTABLE',
              lines: [{ capability: { status: 'SUPPORTABLE' }, price: { reason: 'MISSING_PRICE' } }],
            },
            rawEstimate: null,
            estimateError: { code: 'ESTIMATE_FAILED' },
          }),
        ),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      );
  });
  await applyLengthUi(page, '45');
  await expect(page.locator('[data-store-disposition]')).toHaveText('SUPPORTABLE');
  await openStorePage(page);
  await expect(page.locator('[data-store-panel="full"] [data-store-disposition]')).toHaveText('SUPPORTABLE');
  await expect(page.locator('[data-store-q]')).toHaveAttribute('data-store-q', 'none');
  await expect(page.getByText(COPY.storeEstimateFailed)).toBeVisible();
  await expect(page.locator('[data-store-panel="full"]')).not.toContainText('$0.00');
  await expect(page.locator('[data-store-diagnostic]')).toHaveCount(0);
});
