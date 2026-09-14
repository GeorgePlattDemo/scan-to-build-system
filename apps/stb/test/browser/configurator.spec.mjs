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

test('User 1 Alcove opens as the controlled Make it yours configurator and accepts exact 1/32 depth entry', async ({ page }) => {
  await openAlcove(page);
  const panel = page.locator('[data-project-configurator="alcove-shelf-blanks"]');

  await expect(panel.getByRole('heading', { name: 'Make it yours' })).toBeVisible();
  await expect(panel.getByRole('slider', { name: 'Shelves' })).toHaveValue('5');
  await expect(panel.getByRole('slider', { name: 'Depth' })).toHaveValue('14');
  await expect(panel.getByRole('slider', { name: 'Depth' })).toHaveAttribute('step', '0.03125');
  await expect(panel.locator('[data-alcove-depth-exact]')).toHaveValue('14');
  await expect(panel.locator('[data-config-field="materialPreference"]')).toHaveValue('Pine');
  await expect(panel.locator('[data-config-field="shelfHeights"]')).toHaveValue('12, 24, 36, 45, 65');
  await expect(panel.getByText('UNRESOLVED', { exact: true })).toBeVisible();

  await panel.locator('[data-alcove-depth-exact]').fill('14 5/32');
  await panel.locator('[data-alcove-depth-exact]').press('Tab');
  await expect(panel.getByRole('slider', { name: 'Depth' })).toHaveValue('14.15625');
  await expect(panel.locator('[data-alcove-depth-exact]')).toHaveValue('14 5/32');
  await panel.getByRole('button', { name: 'REVIEW AND CONFIRM' }).click();

  await expect(page.locator('main[data-screen="confirm"]')).toBeVisible();
  await expect(page.locator('[data-review-parts] [data-review-item]')).toHaveCount(5);
  await expect(page.locator('[data-review-parts]')).toContainText('44');
  await expect(page.locator('[data-review-parts]')).toContainText('14.15625');
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
  expect(assembled.projection.payload.backRequirement.style).toBe('none');
  expect(assembled.projection.payload.store.connected).toBe(false);
  expect(assembled.projection.payload.store.price).toBeNull();
});

test('recessed back records material and 1/32 setback as a holder requirement without inventing machine or price authority', async ({ page }) => {
  await openAlcove(page);
  const panel = page.locator('[data-project-configurator="alcove-shelf-blanks"]');

  await expect(panel.getByRole('button', { name: 'None', exact: true })).toHaveClass(/on/);
  await panel.getByRole('button', { name: 'Recessed', exact: true }).click();
  await panel.getByRole('button', { name: 'Veneered panel', exact: true }).click();
  await panel.getByRole('combobox', { name: 'Veneer species' }).selectOption('Cherry');
  await panel.locator('[data-alcove-back-setback-exact]').fill('1/4');
  await panel.locator('[data-alcove-back-setback-exact]').press('Tab');

  await expect(panel.getByRole('slider', { name: 'Back set back' })).toHaveValue('0.25');
  await expect(panel.locator('[data-alcove-back-setback-exact]')).toHaveValue('1/4');
  await expect(panel.locator('[data-alcove-back-summary]')).toContainText('Back: Recessed');
  await expect(panel.locator('[data-alcove-back-summary]')).toContainText('Veneered panel (Cherry)');

  await panel.getByRole('button', { name: 'REVIEW AND CONFIRM' }).click();
  await expect(page.locator('main[data-screen="confirm"]')).toBeVisible();

  const localRecordId = new URL(page.url()).searchParams.get('project');
  const assembled = requireOk(
    await repoCall(page, 'assembleReview', { localRecordId }),
    'recessed back review snapshot',
  );
  expect(assembled.projection.payload.backRequirement.style).toBe('recessed');
  expect(assembled.projection.payload.backRequirement.material).toBe('veneer');
  expect(assembled.projection.payload.backRequirement.veneerSpecies).toBe('Cherry');
  expect(assembled.projection.payload.backRequirement.setback.canonical).toBe('0.25');
  expect(assembled.projection.payload.operationRequirements.requiredFeatures).toEqual(['back-panel', 'recessed-back-seat']);
  expect(assembled.projection.payload.unresolvedConditions).toContain('BACK_PANEL_GEOMETRY_NOT_DERIVED');
  expect(assembled.projection.payload.unresolvedConditions).toContain('BACK_RECESS_FEATURE_NOT_RESOLVED');
  expect(assembled.projection.payload.store.price).toBeNull();
});
