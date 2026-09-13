import { expect, test } from '@playwright/test';

import { ACTORS, COPY } from '../../shared/contracts.mjs';

async function startOwnProject(page) {
  await page.goto('/');
  await page.getByRole('button', { name: ACTORS.new.label }).click();
  await page.getByRole('button', { name: COPY.next }).click();
  await page.getByRole('button', { name: COPY.startOwn }).click();
  await expect(page.locator('[data-screen="hub"]')).toBeVisible();
}

test('published sheet jobs expose only human dimensions and fail closed when candidate Store is absent', async ({ page }) => {
  await startOwnProject(page);

  const rectCard = page.locator('[data-published-job="rect-stencil"]');
  const archCard = page.locator('[data-published-job="arched-opening"]');
  await expect(rectCard.getByRole('button', { name: 'ASK STORE' })).toBeVisible();
  await expect(archCard.getByRole('button', { name: 'ASK STORE' })).toBeVisible();

  await expect(rectCard.getByLabel('Length (in)')).toHaveValue('24');
  await expect(rectCard.getByLabel('Width (in)')).toHaveValue('18');
  await rectCard.getByLabel('Length (in)').fill('30');
  await rectCard.getByLabel('Width (in)').fill('20');
  const rectRequestPromise = page.waitForRequest((request) => request.url().endsWith('/api/published-job'));
  await rectCard.getByRole('button', { name: 'ASK STORE' }).click();
  const rectRequest = await rectRequestPromise;
  assertBoundedRequest(rectRequest.postDataJSON(), {
    jobId: 'rect-stencil',
    inputs: { lengthIn: 30, widthIn: 20 },
  });
  await expect(page.locator('[data-published-message="true"]')).toContainText('not mounted here');
  await expect(page.locator('[data-published-message="true"]')).toContainText('No Store answer was invented');

  await expect(archCard.getByLabel('Opening width (in)')).toHaveValue('36');
  await expect(archCard.getByLabel('Straight height (in)')).toHaveValue('36');
  await expect(archCard.getByLabel('Rise (in)')).toHaveValue('12');
  await expect(archCard).toContainText('Radius is not calculated by the app');
  await archCard.getByLabel('Opening width (in)').fill('40');
  await archCard.getByLabel('Straight height (in)').fill('30');
  await archCard.getByLabel('Rise (in)').fill('10');
  const archRequestPromise = page.waitForRequest((request) => request.url().endsWith('/api/published-job'));
  await archCard.getByRole('button', { name: 'ASK STORE' }).click();
  const archRequest = await archRequestPromise;
  assertBoundedRequest(archRequest.postDataJSON(), {
    jobId: 'arched-opening',
    inputs: { openingWidthIn: 40, straightHeightIn: 30, riseIn: 10 },
  });
  await expect(page.locator('[data-published-message="true"]')).toContainText('not mounted here');
  await expect(page.locator('[data-published-message="true"]')).toContainText('No Store answer was invented');
});

function assertBoundedRequest(actual, expected) {
  expect(actual).toEqual(expected);
  const serialized = JSON.stringify(actual);
  expect(serialized).not.toMatch(/arcRadius|geometryClass|gcode|controller|toolpath|cycleStart|feedRate|spindle/i);
}
