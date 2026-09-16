import { expect, test } from '@playwright/test';

import { ACTORS, COPY } from '../../shared/contracts.mjs';

const STORE_IDLE = { timeout: 20_000 };

async function waitForStoreIdle(page) {
  const panel = page.locator('[data-store-panel="compact"]').first();
  await expect(panel).toBeVisible();
  await expect(panel).not.toHaveAttribute('data-pending', 'true', STORE_IDLE);
}

test('Customer Zero walking skeleton keeps library anonymous and payment gates queue release', async ({ page }) => {
  await page.goto('/');

  const library = page.locator('[data-project-library="true"]');
  await expect(library).toBeVisible();
  await expect(library).toContainText('Alcove shelf blanks');
  await expect(library).toContainText('D ✓');
  await expect(library).not.toContainText('Sarah');
  await expect(library).not.toContainText('123 Alcove Lane');

  await page.locator('[data-utility-nav="account"]').click();
  await expect(page.locator('main[data-screen="account"]')).toBeVisible();
  await page.getByRole('button', { name: COPY.useCustomerZero }).click();
  await expect(page.locator('[data-account-id="ACCT-000001"]')).toContainText('Sarah');
  await expect(page.locator('main[data-screen="account"]')).toContainText('123 Alcove Lane');

  await page.locator('[data-utility-nav="home"]').click();
  await page.getByRole('button', { name: ACTORS.new.label }).click();
  await page.getByRole('button', { name: COPY.next }).click();
  await expect(page.getByRole('heading', { name: COPY.beginHeading })).toBeVisible();
  await page.getByRole('button', { name: COPY.startOwn }).click();
  await expect(page.locator('[data-screen="workstreams"]')).toBeVisible();
  await page.getByRole('button', { name: COPY.openProjectDefinition }).click();
  await expect(page.locator('[data-page="page2"]')).toBeVisible();
  await page.getByRole('button', { name: 'PICK A BOARD', exact: true }).click();
  await page.locator('[data-field="board-length"]').fill('45');
  await page.locator('[data-field="board-unit"]').fill('in');
  await page.getByRole('button', { name: COPY.boardApply }).click();
  await waitForStoreIdle(page);
  await expect(page.locator('[data-store-panel="compact"]').first()).toHaveAttribute('data-current', 'true', STORE_IDLE);

  await page.locator('[data-nav-page="confirm"]').click();
  await page.getByRole('button', { name: COPY.reviewConfirm }).click();
  await expect(page.locator('main[data-screen="result"]')).toBeVisible();
  await page.getByRole('button', { name: COPY.continueToOrder }).click();
  await expect(page.locator('main[data-screen="order"]')).toBeVisible();
  await expect(page.locator('[data-order-account="ACCT-000001"]')).toContainText('Sarah');
  await expect(page.locator('[data-release-permitted="true"]')).toHaveCount(0);

  await page.getByRole('button', { name: COPY.continueToPayment }).click();
  await expect(page.locator('[data-payment-zero]')).toContainText(COPY.paymentRule);
  await expect(page.locator('[data-release-permitted="true"]')).toHaveCount(0);
  await page.getByRole('button', { name: COPY.receivePaymentInFull }).click();
  await expect(page.locator('[data-payment-state="PAYMENT_RECEIVED"]')).toBeVisible();
  await expect(page.locator('[data-release-permitted="true"]')).toHaveCount(0);
  await page.getByRole('button', { name: COPY.markFundsAvailable }).click();
  await expect(page.locator('[data-funds-status="available"]')).toHaveText(COPY.fundsAvailable);
  await expect(page.locator('[data-release-permitted="true"]')).toHaveText(COPY.releasePermitted);
  await page.getByRole('button', { name: COPY.releaseToQueue }).click();
  await expect(page.locator('[data-queue-released="true"]')).toHaveText(COPY.releasedToQueue);
  await expect(page.locator('[data-machine-boundary="true"]')).toContainText('does not start a machine');

  await page.locator('[data-nav-page="record"]').click();
  await page.getByRole('button', { name: COPY.addAnonymousLibrary }).click();
  await expect(page.locator('[data-record-status="true"]')).toHaveText(COPY.libraryAdded);
  await page.locator('[data-utility-nav="home"]').click();
  const updated = page.locator('[data-project-library="true"]');
  await expect(updated.locator('[data-library-source="ANONYMOUS_CONTRIBUTION"]')).toBeVisible();
  await expect(updated).not.toContainText('Sarah');
  await expect(updated).not.toContainText('123 Alcove Lane');
});
