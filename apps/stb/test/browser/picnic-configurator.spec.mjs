import { expect, test } from '@playwright/test';

import { ACTORS, COPY } from '../../shared/contracts.mjs';

async function openPicnic(page) {
  await page.goto('/');
  await page.getByRole('button', { name: ACTORS.new.label }).click();
  await page.getByRole('button', { name: COPY.next }).click();
  await page.getByRole('button', { name: COPY.chooseMapped }).click();
  await page.getByRole('button', { name: 'Classic Picnic Table — configurable demonstration' }).click();
  await expect(page.locator('[data-screen="questions"]')).toBeVisible();
  await expect(page.locator('[data-project-configurator="classic-picnic-table-fixture"]')).toBeVisible();
}

test('picnic candidate carries broad length, scope and material preference without promoting them to Store or structural authority', async ({ page }) => {
  await openPicnic(page);
  const panel = page.locator('[data-project-configurator="classic-picnic-table-fixture"]');
  await panel.getByRole('button', { name: 'USE 144 IN FRAME-KIT EXAMPLE' }).click();

  await expect(page.locator('[data-config-engine="valid"]')).toBeVisible();
  await expect(panel.locator('[data-config-field="productLength"]')).toHaveValue('144');
  await expect(panel.locator('[data-config-field="requestedScope"]')).toHaveValue('frame-kit');
  await expect(panel.locator('[data-config-field="materialPreference"]')).toHaveValue('cedar');
  await expect(page.locator('[data-config-engine="valid"]')).toContainText('STRUCTURAL_SPAN_NOT_EVALUATED');
  await expect(page.locator('[data-config-engine="valid"]')).toContainText('MATERIAL_IDENTITY_UNRESOLVED');
  await expect(page.locator('[data-config-engine="valid"]')).toContainText('STORE_RESOLUTION_NOT_EVALUATED');
  await expect(page.locator('[data-render-occurrence]').first()).toBeVisible();

  await page.locator('[data-nav-page="confirm"]').click();
  await expect(page.locator('main[data-screen="confirm"]')).toBeVisible();
  await expect(page.locator('[data-review-unresolved]')).toContainText('STRUCTURAL_SPAN_NOT_EVALUATED');
  await expect(page.getByRole('button', { name: COPY.reviewUnresolved })).toBeVisible();
  await expect(page.getByRole('button', { name: COPY.reviewConfirm })).toHaveCount(0);
});

test('picnic candidate refuses out-of-range demo inputs without clamping them', async ({ page }) => {
  await openPicnic(page);
  const panel = page.locator('[data-project-configurator="classic-picnic-table-fixture"]');
  await panel.locator('[data-config-field="productLength"]').fill('217');
  await panel.locator('[data-config-field="requestedScope"]').fill('complete-part-set');
  await panel.getByRole('button', { name: 'APPLY TO CANDIDATE' }).click();

  await expect(page.locator('[data-config-engine="unresolved"]')).toContainText('outside-candidate-productLength-range');
  await expect(panel.locator('[data-config-field="productLength"]')).toHaveValue('217');
});

