import { expect, test } from '@playwright/test';

import { ACTORS, COPY } from '../../shared/contracts.mjs';

async function startOwn(page, actorId = 'new') {
  await page.goto('/');
  await page.getByRole('button', { name: ACTORS[actorId].label }).click();
  await page.getByRole('button', { name: COPY.next }).click();
  await page.getByRole('button', { name: COPY.startOwn }).click();
  await page.getByRole('button', { name: COPY.openProjectDefinition }).click();
  await expect(page.locator('[data-screen="workspace"]')).toBeVisible();
}

test('open-door launcher routes broad starting material into existing bounded intake paths', async ({ page }) => {
  await startOwn(page);

  const door = page.locator('[data-open-door="true"]');
  await expect(door).toBeVisible();
  await expect(door.locator('[data-open-door-child]')).toHaveCount(9);
  await expect(door).toContainText('Bring more than one');
  await expect(door).toContainText('Use the least that works');
  await expect(door.locator('[data-open-door-child="board"]')).toBeVisible();

  await door.getByRole('button', { name: /Attach a drawing or PDF/ }).click();
  await expect(page.locator('[data-child-panel="drawing"]')).toBeVisible();
  await expect(page.locator('[data-child-panel="drawing"]')).toContainText('No OCR and no scale extraction');

  await page.getByRole('button', { name: COPY.back }).first().click();
  await expect(page.locator('[data-open-door="true"]')).toBeVisible();

  const cad = page.locator('[data-open-door-child="cad"]');
  await expect(cad).toHaveAttribute('data-open-door-status', 'planned');
  await expect(cad).toContainText('interpretation planned');
  await cad.click();
  await expect(page.locator('[data-child-panel="cad"]')).toBeVisible();
  await expect(page.locator('[data-child-panel="cad"]')).toContainText('Structured extraction is not available');
});

test('professional starts at the same open door rather than a separate intake engine', async ({ page }) => {
  await startOwn(page, 'professional');

  const screen = page.locator('[data-screen="workspace"]');
  await expect(screen).toHaveAttribute('data-actor-order', 'professional');
  await expect(page.locator('[data-open-door="true"]')).toBeVisible();
  await expect(page.locator('[data-open-door-child="takeoff"]')).toBeVisible();
  await expect(page.locator('[data-open-door-child="measurements"]')).toBeVisible();
});
