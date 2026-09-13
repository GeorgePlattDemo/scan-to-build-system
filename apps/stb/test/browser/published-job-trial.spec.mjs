import { expect, test } from '@playwright/test';

import { ACTORS, COPY } from '../../shared/contracts.mjs';

async function startOwnProject(page) {
  await page.goto('/');
  await page.getByRole('button', { name: ACTORS.new.label }).click();
  await page.getByRole('button', { name: COPY.next }).click();
  await page.getByRole('button', { name: COPY.startOwn }).click();
  await expect(page.locator('[data-screen="hub"]')).toBeVisible();
}

test('published sheet jobs ask the isolated Store trial and invent nothing when it is not mounted', async ({ page }) => {
  await startOwnProject(page);

  const rect = page.locator('[data-published-start="rect-stencil"]');
  const arch = page.locator('[data-published-start="arched-opening"]');
  await expect(rect).toHaveText('ASK STORE ABOUT THIS SHAPE');
  await expect(arch).toHaveText('ASK STORE ABOUT THIS SHAPE');

  await rect.click();
  await expect(page.locator('[data-published-message="true"]')).toContainText('not mounted here');
  await expect(page.locator('[data-published-message="true"]')).toContainText('No Store answer was invented');

  await arch.click();
  await expect(page.locator('[data-published-message="true"]')).toContainText('not mounted here');
  await expect(page.locator('[data-published-message="true"]')).toContainText('No Store answer was invented');
});
