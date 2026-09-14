import { expect, test } from '@playwright/test';

import { ACTORS } from '../../shared/contracts.mjs';
import { repoCall, requireOk } from '../helpers/browser-repo.mjs';

async function openAlcove(page) {
  await page.goto('/');
  await page.getByRole('button', { name: ACTORS.new.label, exact: true }).click();
  await page.getByRole('button', { name: 'START', exact: true }).click();
  await expect(page.locator('[data-controlled-projects="true"]')).toBeVisible();
  await page.locator('[data-project-door="alcove"]').click();
  await expect(page.locator('main[data-screen="questions"][data-class-id="alcove-shelf-blanks"]')).toBeVisible();
  await expect(page.locator('[data-project-configurator="alcove-shelf-blanks"]')).toBeVisible();
}

async function setSlider(locator, value) {
  await locator.evaluate((element, nextValue) => {
    element.value = String(nextValue);
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
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

  await setSlider(panel.getByRole('slider', { name: 'Depth' }), 10);
  await expect(panel.getByRole('slider', { name: 'Depth' })).toHaveValue('10');
  await panel.getByRole('button', { name: 'REVIEW AND CONFIRM' }).click();

  await expect(page.locator('main[data-screen="confirm"]')).toBeVisible();
  await expect(page.locator('[data-review-parts] [data-review-item]')).toHaveCount(5);
  await expect(page.locator('[data-review-parts]')).toContainText('44');
  await expect(page.locator('[data-review-parts]')).toContainText('10');
  await expect(page.locator('[data-review-unresolved]')).toContainText('ORDERED_UNIT_ADJUSTMENT_NOT_DECIDED');
  await expect(page.locator('[data-review-unresolved]')).toContainText('store-request-absent');
});

test('shelf count, shelf heights and material preference remain holder configuration while Store support stays unresolved', async ({ page }) => {
  await openAlcove(page);
  const panel = page.locator('[data-project-configurator="alcove-shelf-blanks"]');

  await setSlider(panel.getByRole('slider', { name: 'Shelves' }), 4);
  await panel.locator('[data-alcove-height-index="3"]').fill('46');
  await panel.locator('[data-alcove-height-index="3"]').press('Tab');
  await panel.getByRole('button', { name: 'Cherry', exact: true }).click();
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
