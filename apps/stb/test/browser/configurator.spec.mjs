import { expect, test } from '@playwright/test';

import { ACTORS, COPY } from '../../shared/contracts.mjs';

async function openAlcove(page) {
  await page.goto('/');
  await page.getByRole('button', { name: ACTORS.new.label }).click();
  await page.getByRole('button', { name: COPY.next }).click();
  await page.getByRole('button', { name: COPY.chooseMapped }).click();
  await page.getByRole('button', { name: 'Alcove shelf blanks — bounded reference' }).click();
  await expect(page.locator('[data-screen="questions"]')).toBeVisible();
  await expect(page.locator('[data-project-configurator="alcove-shelf-blanks"]')).toBeVisible();
}

test('mapped alcove configurator runs the published arithmetic and renders three stable blank occurrences', async ({ page }) => {
  await openAlcove(page);
  const panel = page.locator('[data-project-configurator="alcove-shelf-blanks"]');
  await panel.getByRole('button', { name: 'USE PUBLISHED EXAMPLE' }).click();

  await expect(page.locator('[data-config-engine="valid"]')).toBeVisible();
  await expect(page.locator('[data-config-engine="valid"]')).toContainText('Derived span: 44.75 in');
  await expect(page.locator('[data-config-engine="valid"]')).toContainText('Shelf blank 1: 44.75 × 11 × 0.75 in');
  await expect(page.locator('[data-config-engine="valid"]')).toContainText('STRUCTURAL_SPAN_NOT_EVALUATED');
  await expect(page.locator('[data-render-occurrence]')).toHaveCount(3);

  const beforeIds = await page.locator('[data-render-occurrence]').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-render-occurrence')),
  );
  await page.locator('[data-config-field="blankDepth"]').fill('10.00');
  await page.getByRole('button', { name: 'APPLY TO CANDIDATE' }).click();
  await expect(page.locator('[data-config-engine="valid"]')).toContainText('Shelf blank 1: 44.75 × 10 × 0.75 in');
  const afterIds = await page.locator('[data-render-occurrence]').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-render-occurrence')),
  );
  expect(afterIds).toEqual(beforeIds);
});

test('changing shelf count revises demand while review remains unresolved rather than fabricating Store support', async ({ page }) => {
  await openAlcove(page);
  await page.getByRole('button', { name: 'USE PUBLISHED EXAMPLE' }).click();
  await expect(page.locator('[data-render-occurrence]')).toHaveCount(3);

  await page.locator('[data-config-field="shelfCount"]').fill('4');
  await page.getByRole('button', { name: 'APPLY TO CANDIDATE' }).click();
  await expect(page.locator('[data-render-occurrence]')).toHaveCount(4);
  await expect(page.locator('[data-config-engine="valid"]')).toContainText('4 ea sheet-form blanks');

  await page.locator('[data-nav-page="confirm"]').click();
  await expect(page.locator('[data-screen="confirm"]')).toBeVisible();
  await expect(page.locator('[data-review-parts] [data-review-item]')).toHaveCount(4);
  await expect(page.locator('[data-review-unresolved]')).toContainText('STRUCTURAL_SPAN_NOT_EVALUATED');
  await expect(page.locator('[data-review-unresolved]')).toContainText('store-request-absent');
  await expect(page.getByRole('button', { name: COPY.reviewUnresolved })).toBeVisible();
  await expect(page.getByRole('button', { name: COPY.reviewConfirm })).toHaveCount(0);
});
