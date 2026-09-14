import { expect, test } from '@playwright/test';

import { ACTORS, COPY } from '../../shared/contracts.mjs';

async function openBegin(page) {
  await page.goto('/');
  await page.getByRole('button', { name: ACTORS.new.label }).click();
  await page.getByRole('button', { name: COPY.next }).click();
  await expect(page.locator('[data-screen="begin"]')).toBeVisible();
}

async function openPicnicChooser(page) {
  await openBegin(page);
  await expect(page.locator('[data-stb-project-doors]')).toBeVisible();
  await page.locator('[data-front-door="picnic"]').click();
  await expect(page.locator('[data-stb-picnic-chooser]')).toBeVisible();
}

async function choosePicnicPath(page, form, scope) {
  await openPicnicChooser(page);
  await page.locator(`[data-picnic-form="${form}"][data-picnic-scope="${scope}"]`).click();
  await expect(page.locator('[data-screen="questions"][data-class-id="classic-picnic-table-fixture"]')).toBeVisible();
  const panel = page.locator('[data-project-configurator="classic-picnic-table-fixture"]');
  await expect(panel).toBeVisible();
  await expect(panel.locator('[data-config-field="tableForm"]')).toHaveValue(form);
  await expect(panel.locator('[data-config-field="requestedScope"]')).toHaveValue(scope);
  return panel;
}

test('Page 1 restores four functional visual project doors', async ({ page }) => {
  await openBegin(page);
  const doors = page.locator('[data-stb-project-doors] [data-front-door]');
  await expect(doors).toHaveCount(4);
  await expect(page.locator('[data-front-door="start-own"] svg')).toBeVisible();
  await expect(page.locator('[data-front-door="alcove"] svg')).toBeVisible();
  await expect(page.locator('[data-front-door="window-seat"] svg')).toBeVisible();
  await expect(page.locator('[data-front-door="picnic"] svg')).toBeVisible();
});

test('picnic image opens the dedicated four-way family chooser', async ({ page }) => {
  await openPicnicChooser(page);
  await expect(page.getByRole('heading', { name: 'Picnic tables' })).toBeVisible();
  await expect(page.locator('[data-picnic-form][data-picnic-scope]')).toHaveCount(4);
  await expect(page.locator('[data-picnic-form="attached-bench"][data-picnic-scope="complete-part-set"]')).toBeVisible();
  await expect(page.locator('[data-picnic-form="attached-bench"][data-picnic-scope="frame-kit"]')).toBeVisible();
  await expect(page.locator('[data-picnic-form="separate-benches"][data-picnic-scope="complete-part-set"]')).toBeVisible();
  await expect(page.locator('[data-picnic-form="separate-benches"][data-picnic-scope="frame-kit"]')).toBeVisible();
});

test('attached frame-kit path persists form and scope and splits we make from holder supply', async ({ page }) => {
  const panel = await choosePicnicPath(page, 'attached-bench', 'frame-kit');
  await panel.locator('[data-config-field="productLength"]').fill('96');
  await panel.getByRole('button', { name: 'APPLY TO CANDIDATE' }).click();

  await expect(page.locator('[data-config-engine="valid"]')).toBeVisible();
  await expect(page.locator('[data-picnic-we-make]')).toContainText('End A left leg');
  await expect(page.locator('[data-picnic-we-make]')).not.toContainText('Tabletop member 1');
  await expect(page.locator('[data-picnic-you-supply]')).toContainText('Tabletop member 1');
  await expect(page.locator('[data-picnic-you-supply]')).toContainText('holder supplied');
  await expect(page.locator('[data-config-engine="valid"]')).toContainText('STORE_RESOLUTION_NOT_EVALUATED');
});

test('separate-benches is retained as a real form choice and fails closed on missing geometry', async ({ page }) => {
  const panel = await choosePicnicPath(page, 'separate-benches', 'complete-part-set');
  await panel.locator('[data-config-field="productLength"]').fill('96');
  await panel.getByRole('button', { name: 'APPLY TO CANDIDATE' }).click();

  await expect(page.locator('[data-config-engine="valid"]')).toContainText('SEPARATE_BENCH_GEOMETRY_UNRESOLVED');
  await expect(page.locator('[data-picnic-we-make]')).toContainText('No frame parts are derived until separate-bench geometry is admitted.');
  await expect(panel.locator('[data-config-field="tableForm"]')).toHaveValue('separate-benches');
});

test('planned window-seat imagery does not invent a mapped class', async ({ page }) => {
  await openBegin(page);
  await page.locator('[data-front-door="window-seat"]').click();
  await expect(page.locator('.stb-front-door-status')).toContainText('No current mapped window-seat class is registered');
  await expect(page.locator('[data-screen="questions"]')).toHaveCount(0);
});
