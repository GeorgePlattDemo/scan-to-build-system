import { expect, test } from '@playwright/test';

const ORIENTATION = {
  'NEW USER': { heading: 'We don’t sell products.', button: 'START' },
  'RETURNING USER': { heading: 'Nothing moved while you were gone.', button: 'START SOMETHING NEW' },
  PROFESSIONAL: { heading: 'Send us what you want. Nothing else.', button: 'TYPE IT IN' },
};

async function openPage1(page, actor = 'NEW USER') {
  await page.goto('/');
  await page.getByRole('button', { name: actor, exact: true }).click();
  const orientation = ORIENTATION[actor];
  await expect(page.getByRole('heading', { name: orientation.heading, exact: true })).toBeVisible();
  await page.getByRole('button', { name: orientation.button, exact: true }).click();
  await expect(page.locator('main[data-screen="begin"]')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'What are you making?', exact: true })).toBeVisible();
}

test('restored landing and all three orientation doors converge on the same Page 1', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'SCAN TO BUILD' })).toBeVisible();
  await expect(page.getByText('Capture the space with laser, AR, or tape. The measurements are yours.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'NEW USER' }).click();
  await expect(page.getByRole('heading', { name: 'We don’t sell products.' })).toBeVisible();
  await page.getByRole('button', { name: 'START', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'What are you making?' })).toBeVisible();

  await page.goto('/');
  await page.getByRole('button', { name: 'RETURNING USER' }).click();
  await expect(page.getByRole('heading', { name: 'Nothing moved while you were gone.' })).toBeVisible();
  await page.getByRole('button', { name: 'START SOMETHING NEW', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'What are you making?' })).toBeVisible();

  await page.goto('/');
  await page.getByRole('button', { name: 'PROFESSIONAL' }).click();
  await expect(page.getByRole('heading', { name: 'Send us what you want. Nothing else.' })).toBeVisible();
  await page.getByRole('button', { name: 'TYPE IT IN', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'What are you making?' })).toBeVisible();
});

test('Page 1 has four visual doors and Start your own restores the work behind the icon', async ({ page }) => {
  await openPage1(page);
  await expect(page.locator('[data-front-door="start-own"]')).toBeVisible();
  await expect(page.locator('[data-front-door="alcove"]')).toBeVisible();
  await expect(page.locator('[data-front-door="window-seat"]')).toBeVisible();
  await expect(page.locator('[data-front-door="picnic"]')).toBeVisible();

  await page.locator('[data-front-door="start-own"]').click();
  await expect(page.locator('main[data-screen="hub"]')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Start your own project' })).toBeVisible();
  await expect(page.getByText('Grab a board and tell us what you want done to it.', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Bring what you have.' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Scan it/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Attach a file/ })).toBeVisible();
});

test('Start your own intake doors connect to the current source/candidate path', async ({ page }) => {
  await openPage1(page);
  await page.locator('[data-front-door="start-own"]').click();
  await page.getByRole('button', { name: /Scan it/ }).click();
  await expect(page.locator('main[data-screen="hub"][data-child="scan"]')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Define your project to your space — and your taste' })).toBeVisible();
  await expect(page.getByText('A scan is not a measurement.', { exact: false })).toBeVisible();
  await expect(page.locator('.child-panel[data-child-panel="scan"]')).toBeVisible();
});

test('Critical fit picture opens recovered capture/configure presentation on current alcove engine', async ({ page }) => {
  await openPage1(page);
  await page.locator('[data-front-door="alcove"]').click();
  await expect(page.locator('main[data-screen="questions"][data-class-id="alcove-shelf-blanks"]')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Define your project to your space — and your taste' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Make it yours' })).toBeVisible();
  await expect(page.locator('[data-project-configurator="alcove-shelf-blanks"]')).toBeVisible();
});

test('Space utilization picture opens the preserved nine-step window-seat reference journey', async ({ page }) => {
  await openPage1(page);
  await page.locator('[data-front-door="window-seat"]').click();
  await expect(page.getByRole('heading', { name: 'Window Seat Insert — 103″ Wall Fixture' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The Object She Wants' })).toBeVisible();
  await page.getByRole('button', { name: 'Capture', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'The Room Becomes Data' })).toBeVisible();
  await expect(page.getByText('103″ overall wall width', { exact: true })).toBeVisible();
});

test('Outdoor build picture opens four picnic choices and hands the choice to the current configurator', async ({ page }) => {
  await openPage1(page);
  await page.locator('[data-front-door="picnic"]').click();
  await expect(page.getByRole('heading', { name: 'Picnic tables' })).toBeVisible();
  await expect(page.getByText('Off the shelf, three choices. You have a tape measure.', { exact: true })).toBeVisible();
  await expect(page.locator('[data-picnic-form][data-picnic-scope]')).toHaveCount(4);
  await page.locator('[data-picnic-form="attached-bench"][data-picnic-scope="frame-kit"]').click();
  await expect(page.locator('main[data-screen="questions"][data-class-id="classic-picnic-table-fixture"]')).toBeVisible();
  await expect(page.locator('[data-project-configurator="classic-picnic-table-fixture"]')).toBeVisible();
  await expect(page.getByText('The historical donor’s placeholder 2×6 SKUs, prices, 60 in structural trigger, and cell-recovery arithmetic are not imported as present authority.', { exact: true })).toBeVisible();
});
