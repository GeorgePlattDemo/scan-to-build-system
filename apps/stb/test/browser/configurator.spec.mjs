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

test('User 1 Alcove baseline carries the measured opening, depth, shelf heights and material preference without an ordering allowance', async ({ page }) => {
  await openAlcove(page);
  const panel = page.locator('[data-project-configurator="alcove-shelf-blanks"]');
  await panel.getByRole('button', { name: 'USE USER 1 BASELINE' }).click();

  await expect(page.locator('[data-config-engine="valid"]')).toBeVisible();
  await expect(page.locator('[data-config-engine="valid"]')).toContainText('Derived span: 44 in');
  await expect(page.locator('[data-config-engine="valid"]')).toContainText('Shelf blank 1: 44 × 14 × 0.75 in');
  await expect(page.locator('[data-config-engine="valid"]')).toContainText('ORDERED_UNIT_ADJUSTMENT_NOT_DECIDED');
  await expect(page.locator('[data-render-occurrence]')).toHaveCount(5);

  const beforeIds = await page.locator('[data-render-occurrence]').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-render-occurrence')),
  );
  await page.locator('[data-config-field="blankDepth"]').fill('10');
  await page.getByRole('button', { name: 'APPLY TO CANDIDATE' }).click();
  await expect(page.locator('[data-config-engine="valid"]')).toContainText('Shelf blank 1: 44 × 10 × 0.75 in');
  const afterIds = await page.locator('[data-render-occurrence]').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-render-occurrence')),
  );
  expect(afterIds).toEqual(beforeIds);
});

test('changing shelf count revises demand while review keeps ordering and Store responsibility unresolved', async ({ page }) => {
  await openAlcove(page);
  await page.getByRole('button', { name: 'USE USER 1 BASELINE' }).click();
  await expect(page.locator('[data-render-occurrence]')).toHaveCount(5);

  await page.locator('[data-config-field="shelfCount"]').fill('4');
  await page.getByRole('button', { name: 'APPLY TO CANDIDATE' }).click();
  await expect(page.locator('[data-render-occurrence]')).toHaveCount(4);
  await expect(page.locator('[data-config-engine="valid"]')).toContainText('4 ea sheet-form blanks');

  const localRecordId = await page.locator('[data-screen="questions"]').getAttribute('data-local-record-id');
  const assembled = requireOk(
    await repoCall(page, 'assembleReview', { localRecordId }),
    'mapped review snapshot',
  );
  expect(assembled.snapshot.occurrenceIds).toHaveLength(4);
  expect(assembled.snapshot.definitionRevisionIds).toHaveLength(4);

  await page.locator('[data-nav-page="confirm"]').click();
  await expect(page.locator('main[data-screen="confirm"]')).toBeVisible();
  await expect(page.locator('[data-review-parts] [data-review-item]')).toHaveCount(4);
  await expect(page.locator('[data-review-unresolved]')).toContainText('ORDERED_UNIT_ADJUSTMENT_NOT_DECIDED');
  await expect(page.locator('[data-review-unresolved]')).toContainText('store-request-absent');
  await expect(page.getByRole('button', { name: COPY.reviewUnresolved })).toBeVisible();
  await expect(page.getByRole('button', { name: COPY.reviewConfirm })).toHaveCount(0);
});
