import { expect, test } from '@playwright/test';

import { COPY, PUBLISHED_BOARD_SKU } from '../../shared/contracts.mjs';

async function renderPanel(page, applicability, options = {}, mode = 'full') {
  await page.goto('/');
  await page.evaluate(
    async ({ applicability, options, mode }) => {
      const { presentStoreAnswer } = await import('/shared/store-present.mjs');
      const { renderStorePanel } = await import('/ui/store-panel.mjs');
      const view = presentStoreAnswer(applicability, options);
      document.getElementById('app').replaceChildren(renderStorePanel(view, { mode }));
    },
    { applicability, options, mode },
  );
}

function supportableApplicability() {
  return {
    status: 'current',
    current: true,
    historical: false,
    candidateRevisionId: 'cand-45',
    request: { id: 'req-1', payload: { payload: { line: { lineId: 'occ-1' } } } },
    attempt: { id: 'att-1' },
    response: {
      id: 'resp-1',
      payload: {
        receivedAt: '2026-09-11T00:00:03.000Z',
        validation: { ok: true },
        wrapperEnvelope: {
          storePin: 'b40cdc60a405d6c2a63d846f2c2e89cddc5bb95d',
          protocolVersion: 'stb-store-zero-http/1',
          wrapperBuildId: 'stb-app-build-5',
          requestId: 'req-1',
          responseId: 'resp-1',
          attemptId: 'att-1',
          candidateRevisionId: 'cand-45',
          wrapperRespondedAt: '2026-09-11T00:00:02.000Z',
          rawOffering: {
            storeSku: PUBLISHED_BOARD_SKU,
            description: '2x4 x 72 in SPF construction',
            species: 'spf',
            actualW: 3.5,
            actualT: 1.5,
            stockL_in: 72,
            offered: true,
            catalogClock: '2026-09-10',
          },
          rawEvaluation: {
            status: 'SUPPORTABLE',
            lines: [
              {
                stock: { status: 'ON_HAND_SUFFICIENT', available: 84, qtyNeeded: 1, asOf: '2026-09-10' },
                price: { sellingPrice: 3.13, asOf: '2026-09-10' },
                capability: { status: 'SUPPORTABLE' },
              },
            ],
          },
          rawEstimate: {
            status: 'BUDGETARY_ESTIMATE',
            totals: { material: 3.13, cell_recovery: 50.81, Q: 53.94 },
            cycle: { model: 'STB-D001-CYCLE-MODEL-S2-0.1', T_job_min: 9.486, measured: false },
            engine: { id: 'STB-STORE-ZERO-PRICE-1', version: '0.2.2' },
          },
          attributedBasis: {
            pricingEngine: { id: 'STB-STORE-ZERO-PRICE-1', version: '0.2.2' },
            cycleModel: { id: 'STB-D001-CYCLE-MODEL-S2-0.1' },
            envelope: { id: 'D001-STAGE2-ENVELOPE-0.2' },
            sourceClock: '2026-09-10',
            measured: false,
            commissioned: false,
          },
        },
      },
    },
  };
}

test('full panel shows offering stock capability estimate and copied Q', async ({ page }) => {
  await renderPanel(page, supportableApplicability());
  await expect(page.locator('[data-store-panel="full"]')).toHaveAttribute('data-current', 'true');
  await expect(page.locator('[data-store-disposition]')).toHaveText('SUPPORTABLE');
  await expect(page.locator('[data-store-sku]').first()).toContainText(PUBLISHED_BOARD_SKU);
  await expect(page.locator('[data-store-q]')).toHaveAttribute('data-store-q', '$53.94');
  await expect(page.locator('[data-store-section="offering"]')).toBeVisible();
  await expect(page.locator('[data-store-section="stock"]')).toBeVisible();
  await expect(page.locator('[data-store-section="capability"]')).toBeVisible();
  await expect(page.locator('[data-store-section="estimate"]')).toBeVisible();
  await expect(page.locator('[data-store-basis-line]')).toHaveText(COPY.storeBasisLine);
  await expect(page.locator('[data-pricing-engine-version]')).toContainText('0.2.2');
  await expect(page.locator('[data-source-asof]')).toContainText('2026-09-10');
  await expect(page.locator('[data-received-at]')).toContainText('2026-09-11T00:00:03.000Z');
  await page.locator('.store-details summary').focus();
  await expect(page.locator('.store-details summary')).toBeFocused();
});

test('compact and full panels agree on current identity and Q', async ({ page }) => {
  await renderPanel(page, supportableApplicability(), {}, 'compact');
  await expect(page.locator('[data-store-panel="compact"]')).toHaveAttribute('data-current', 'true');
  await expect(page.locator('[data-store-sku]')).toHaveText(PUBLISHED_BOARD_SKU);
  await expect(page.locator('[data-store-q]')).toHaveAttribute('data-store-q', '$53.94');
  await expect(page.locator('[data-store-reference-scope]')).toHaveText(COPY.storeReferenceScope);
  await expect(page.getByRole('button', { name: COPY.storeInspect })).toBeVisible();
});

test('pending shows frozen copy and no earlier Q', async ({ page }) => {
  await renderPanel(page, {
    status: 'pending',
    current: false,
    historical: false,
    candidateRevisionId: 'cand-46',
    request: { id: 'req-46' },
    attempt: { id: 'att-46' },
  });
  await expect(page.locator('[data-store-headline]')).toHaveText(COPY.storePending);
  await expect(page.locator('[data-store-panel]')).toHaveAttribute('data-pending', 'true');
  await expect(page.locator('[data-store-q]')).toHaveCount(0);
  await expect(page.locator('[data-store-disposition]')).toHaveCount(0);
});

test('transport error offers Retry and is not Store UNAVAILABLE', async ({ page }) => {
  await renderPanel(page, {
    status: 'APP_TRANSPORT_ERROR',
    current: false,
    historical: true,
    diagnostic: 'APP_TRANSPORT_ERROR',
    candidateRevisionId: 'cand-45',
    request: { id: 'req-1' },
  });
  await expect(page.locator('[data-store-headline]')).toHaveText(COPY.storeTransport);
  await expect(page.getByRole('button', { name: COPY.storeRetry })).toBeVisible();
  await expect(page.locator('[data-store-disposition]')).toHaveCount(0);
  await expect(page.locator('[data-store-diagnostic]')).toHaveText('APP_TRANSPORT_ERROR');
});

test('REFUSED shows exact raw reason and no Q', async ({ page }) => {
  const applicability = supportableApplicability();
  applicability.response.payload.wrapperEnvelope.rawEvaluation = {
    status: 'REFUSED',
    lines: [
      {
        capability: { status: 'REFUSED', missing: ['STOCK_WIDTH_EXCEEDS_D001_STAGE2_ENVELOPE'] },
        stock: { status: 'ON_HAND_SUFFICIENT' },
        price: { sellingPrice: 3.13 },
      },
    ],
  };
  applicability.response.payload.wrapperEnvelope.rawEstimate = null;
  await renderPanel(page, applicability);
  await expect(page.locator('[data-store-disposition]')).toHaveText('REFUSED');
  await expect(page.locator('[data-raw-reason]').first()).toHaveText(
    'STOCK_WIDTH_EXCEEDS_D001_STAGE2_ENVELOPE',
  );
  await expect(page.locator('[data-store-q]')).toHaveAttribute('data-store-q', 'none');
});
