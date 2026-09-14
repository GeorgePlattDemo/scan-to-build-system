import { expect, test } from '@playwright/test';

import { ACTORS, COPY } from '../../shared/contracts.mjs';
import { repoCall, requireOk } from '../helpers/browser-repo.mjs';

async function openAlcove(page) {
  await page.goto('/');
  await page.getByRole('button', { name: ACTORS.new.label }).click();
  await page.getByRole('button', { name: COPY.next }).click();
  await page.getByRole('button', { name: COPY.chooseMapped }).click();
  await page.getByRole('button', { name: 'Alcove shelf blanks — bounded reference' }).click();
  await expect(page.locator('[data-screen="questions"]')).toBeVisible();
  await expect(page.locator('[data-project-configurator="alcove-shelf-blanks"]')).toBeVisible();
}

test('User 1 Alcove opens as the controlled Make it yours configurator and applies one exact review revision', async ({ page }) => {
  await openAlcove(page);
  const panel = page.locator('[data-project-configurator="alcove-shelf-blanks"]');

  await expect(panel.getByRole('heading', { name: 'Make it yours' })).toBeVisible();
  await expect(panel.getByRole('slider', { name: 'Shelves' })).toHaveValue('5');
  await expect(panel.getByRole('slider', { name: 'Depth' })).toHaveValue('14');
  await expect(panel.locator('[data-config-field="materialPreference"]')).toHaveValue('Pine');
  await expect(panel.locator('[data-config-field="shelfHeights"]')).toHaveValue('12, 24, 36, 45, 65');
  await expect(panel.getByText('UNRESOLVED', { exact: true })).toBeVisible();

  await panel.getByRole('slider', { name: 'Depth' }).fill('10');
  await panel.getByRole('button', { name: 'REVIEW AND CONFIRM' }).click();

  await expect(page.locator('main[data-screen="confirm"]')).toBeVisible();
  await expect(page.locator('[data-review-parts] [data-review-item]')).toHaveCount(5);
  await expect(page.locator('[data-review-parts]')).toContainText('44');
  await expect(page.locator('[data-review-parts]')).toContainText('10');
  await expect(page.locator('[data-review-unresolved]')).toContainText('ORDERED_UNIT_ADJUSTMENT_NOT_DECIDED');
  await expect(page.locator('[data-review-unresolved]')).toContainText('store-request-absent');
  await expect(page.getByRole('button', { name: COPY.reviewUnresolved })).toBeVisible();
  await expect(page.getByRole('button', { name: COPY.reviewConfirm })).toHaveCount(0);
});

test('shelf count, shelf heights and material preference remain holder configuration while Store support stays unresolved', async ({ page }) => {
  await openAlcove(page);
  const panel = page.locator('[data-project-configurator="alcove-shelf-blanks"]');

  await panel.getByRole('slider', { name: 'Shelves' }).fill('4');
  await panel.locator('[data-alcove-height-index="3"]').fill('46');
  await panel.locator('[data-alcove-height-index="3"]').press('Tab');
  await panel.getByRole('button', { name: 'Cherry' }).click();
  await panel.getByRole('button', { name: 'REVIEW AND CONFIRM' }).click();

  await expect(page.locator('main[data-screen="confirm"]')).toBeVisible();
  await expect(page.locator('[data-review-parts] [data-review-item]')).toHaveCount(4);

  const localRecordId = new URL(page.url()).searchParams.get('project');
  const assembled = requireOk(
    await repoCall(page, 'assembleReview', { localRecordId }),
    'mapped review snapshot',
  );
  expect(assembled.snapshot.occurrenceIds).toHaveLength(4);
  expect(assembled.snapshot.definitionRevisionIds).toHaveLength(4);
  expect(assembled.projection.payload.inputs.shelfHeights.canonical).toEqual(['12', '24', '36', '46']);
  expect(assembled.projection.payload.inputs.materialPreference.canonical).toBe('Cherry');
  expect(assembled.projection.payload.store.connected).toBe(false);
  expect(assembled.projection.payload.store.price).toBeNull();
});
