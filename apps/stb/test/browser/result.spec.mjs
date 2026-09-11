import { expect, test } from '@playwright/test';

import { ACTORS, COPY, REVIEW_RECORD_TYPES } from '../../shared/contracts.mjs';
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
  const valid = await page.locator('[data-candidate-view="true"]').getAttribute('data-valid');
  if (waitForIdle && valid === 'true') {
    await waitForStoreIdle(page);
  }
}

async function localRecordId(page) {
  return page.locator('[data-local-record-id]').getAttribute('data-local-record-id');
}

async function installMockTransport(page, evaluationStatus = 'SUPPORTABLE') {
  await page.evaluate(async (evaluationStatus) => {
    const { setStoreTransport } = await import('/integration/store-client.mjs');
    const { STORE_PIN, STORE_PROTOCOL_VERSION, WRAPPER_BUILD_ID } = await import(
      '/shared/contracts.mjs'
    );
    setStoreTransport(async (_url, init) => {
      const wire = JSON.parse(init.body);
      const supportable = evaluationStatus === 'SUPPORTABLE';
      const body = {
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
        responseId: crypto.randomUUID(),
        estimateAssociationId: supportable ? crypto.randomUUID() : null,
        rawOffering: {
          storeSku: wire.payload?.line?.storeSku,
          description: '2x4 x 72 in SPF construction',
          offered: true,
        },
        rawEvaluation: {
          status: evaluationStatus,
          lines: [
            supportable
              ? { capability: { status: 'SUPPORTABLE' }, stock: { status: 'ON_HAND_SUFFICIENT' } }
              : { capability: { status: evaluationStatus, reason: 'OP_NOT_ON_OFFERING:RIP' } },
          ],
        },
        rawEstimate: supportable
          ? {
              status: 'BUDGETARY_ESTIMATE',
              totals: { material: 3.13, cell_recovery: 50.81, Q: 53.94 },
              cycle: { model: 'STB-D001-CYCLE-MODEL-S2-0.1', T_job_min: 9.486, measured: false },
              engine: { id: 'STB-STORE-ZERO-PRICE-1', version: '0.2.2' },
            }
          : null,
        attributedBasis: {
          pricingEngine: { id: 'STB-STORE-ZERO-PRICE-1', version: '0.2.2' },
          cycleModel: { id: 'STB-D001-CYCLE-MODEL-S2-0.1' },
          envelope: { id: 'D001-STAGE2-ENVELOPE-0.2' },
          sourceClock: '2026-09-10',
        },
      };
      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });
  }, evaluationStatus);
}

test('P7-01 / M2-15/O01 confirming a supported board records no physical outcome', async ({
  page,
}) => {
  await openBoard(page);
  await installMockTransport(page);
  await applyLengthUi(page, '45');
  await page.getByRole('button', { name: COPY.reviewConfirm }).click();
  await expect(page.locator('[data-page="page7"]')).toBeVisible();
  await expect(page.locator('[data-result-retained]')).toHaveText(COPY.resultRetained);
  await expect(page.locator('[data-physical-absent]')).toHaveText(COPY.resultPhysicalAbsent);
  await expect(page.locator('[data-pickup-absent]')).toHaveText(COPY.resultPickupAbsent);
  await expect(page.locator('[data-physical-outcome]')).toHaveAttribute(
    'data-physical-outcome',
    'absent',
  );
  await expect(page.locator('[data-pickup]')).toHaveAttribute('data-pickup', 'absent');
  await expect(page.locator('[data-page="page7"]')).not.toContainText('fabricated');
  await expect(page.locator('[data-page="page7"]')).not.toContainText('in production');
  await expect(page.locator('[data-page="page7"]')).not.toContainText('pickup ready');
  await expect(page.locator('[data-result-review]')).toHaveAttribute(
    'data-result-review',
    REVIEW_RECORD_TYPES.DefinitionReviewRecorded,
  );
  await expect(page.locator('[data-store-on-result] [data-store-disposition]')).toHaveText(
    'SUPPORTABLE',
  );
  await expect(page.locator('[data-result-events]')).toBeVisible();
});

test('P7-02 Store REFUSED remains visible and no downstream completion appears', async ({
  page,
}) => {
  await openBoard(page);
  await installMockTransport(page, 'REFUSED');
  await applyLengthUi(page, '45');
  await page.getByRole('button', { name: COPY.reviewUnresolved }).click();
  await expect(page.locator('[data-page="page7"]')).toBeVisible();
  await expect(page.locator('[data-store-on-result] [data-store-disposition]')).toHaveText(
    'REFUSED',
  );
  await expect(page.locator('[data-result-review]')).toHaveAttribute(
    'data-result-review',
    REVIEW_RECORD_TYPES.UnresolvedDefinitionAcknowledged,
  );
  await expect(page.locator('[data-physical-outcome]')).toHaveAttribute(
    'data-physical-outcome',
    'absent',
  );
  await expect(page.locator('[data-page="page7"]')).not.toContainText('fabricated');
});

test('P7-03 / P7-04 documentary CUT-001 is labeled reference, not ran now', async ({ page }) => {
  await openBoard(page);
  await installMockTransport(page);
  await page.getByRole('button', { name: COPY.boardCut001 }).click();
  await waitForStoreIdle(page);
  await page.getByRole('button', { name: COPY.reviewConfirm }).click();
  await expect(page.locator('[data-page="page7"]')).toBeVisible();
  await expect(page.locator('[data-cut001-reference]')).toContainText('Documentary reference');
  await expect(page.locator('[data-cut001-reference]')).toContainText('It did not run');
  await expect(page.locator('[data-simulation-execution]')).toHaveAttribute(
    'data-simulation-execution',
    'false',
  );
  await expect(page.locator('[data-page="page7"]')).not.toContainText('ran now');
});

test('P7-05 no result action claims physical completion, and historical review stays historical', async ({
  page,
}) => {
  await openBoard(page);
  await installMockTransport(page);
  await applyLengthUi(page, '45');
  await page.getByRole('button', { name: COPY.reviewConfirm }).click();
  await expect(page.locator('[data-page="page7"]')).toBeVisible();
  const id = await localRecordId(page);
  await page.goto(`/project?id=${id}&view=hub&child=board`);
  await applyLengthUi(page, '46');
  await page.getByRole('link', { name: 'Result', exact: true }).click();
  await expect(page.locator('[data-page="page7"]')).toBeVisible();
  await expect(page.locator('[data-review-current]')).toHaveAttribute('data-review-current', 'false');
  await expect(page.locator('[data-review-history]')).toBeVisible();
  await expect(page.locator('[data-physical-outcome]')).toHaveAttribute(
    'data-physical-outcome',
    'absent',
  );
  const commands = await page.evaluate(() =>
    [...document.querySelectorAll('[data-action]')].map((node) => node.getAttribute('data-action')),
  );
  expect(commands.includes('cycle-start')).toBe(false);
  expect(commands.includes('dispatch-machine')).toBe(false);
});
