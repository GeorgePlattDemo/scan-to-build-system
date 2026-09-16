import { expect, test } from '@playwright/test';

import { ACTORS, COPY } from '../../shared/contracts.mjs';

async function startOwnProject(page) {
  await page.goto('/');
  await page.getByRole('button', { name: ACTORS.new.label }).click();
  await page.getByRole('button', { name: COPY.next }).click();
  await page.getByRole('button', { name: COPY.startOwn }).click();
  await page.getByRole('button', { name: COPY.openProjectDefinition }).click();
  await expect(page.locator('[data-screen="workspace"]')).toBeVisible();
}

function assertBoundedRequest(actual, expected) {
  expect(actual).toEqual(expected);
  const serialized = JSON.stringify(actual);
  expect(serialized).not.toMatch(/arcRadius|geometryClass|gcode|controller|toolpath|cycleStart|feedRate|spindle|workField|placement/i);
}

test('published sheet jobs expose human dimensions and canonical S-001 configurator fails closed without Store checkout', async ({ page }) => {
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
  assertBoundedRequest(rectRequest.postDataJSON(), { jobId: 'rect-stencil', inputs: { lengthIn: 30, widthIn: 20 } });
  await expect(page.locator('[data-published-message="true"]')).toContainText('not mounted here');
  await expect(page.locator('[data-published-message="true"]')).toContainText('No Store answer was invented');

  await expect(archCard).toContainText('Centered arched cutout');
  await expect(archCard).toContainText('48 × 96');
  await expect(archCard).toContainText('centered 48 × 36 in field');
  await expect(archCard.getByLabel('Opening width (in)')).toHaveValue('36');
  await expect(archCard.getByLabel('Straight height (in)')).toHaveValue('24');
  await expect(archCard.getByLabel('Arch rise (in)')).toHaveValue('12');

  const preview = archCard.locator('[data-s001-preview]');
  await expect(preview).toContainText('Sheet 96 × 48');
  await expect(preview).toContainText('field 48 × 36');
  await expect(preview).toContainText('opening 36 × 36 overall');
  await expect(preview).toContainText('Sheet margins: 30 left/right, 6 top/bottom');
  await expect(preview).toContainText('Within field: 6 left/right, 0 top/bottom');
  await expect(preview.locator('[data-s001-gate]')).toHaveText('INSIDE CANONICAL FIELD');
  await expect(preview).toContainText('Preview only');

  await archCard.getByLabel('Opening width (in)').fill('60');
  await archCard.getByLabel('Straight height (in)').fill('30');
  await archCard.getByLabel('Arch rise (in)').fill('10');
  await expect(preview.locator('[data-s001-gate]')).toContainText('OUTSIDE CANONICAL FIELD');
  await expect(preview).toContainText('Within field: -6 left/right, -2 top/bottom');

  const archRequestPromise = page.waitForRequest((request) => request.url().endsWith('/api/published-job'));
  await archCard.getByRole('button', { name: 'ASK STORE' }).click();
  const archRequest = await archRequestPromise;
  assertBoundedRequest(archRequest.postDataJSON(), {
    jobId: 'arched-opening',
    inputs: { openingWidthIn: 60, straightHeightIn: 30, riseIn: 10 },
  });
  await expect(page.locator('[data-published-message="true"]')).toContainText('not mounted here');
  await expect(page.locator('[data-published-message="true"]')).toContainText('No Store answer was invented');
});
