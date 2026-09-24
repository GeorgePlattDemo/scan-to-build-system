import { expect, test } from '@playwright/test';

import { ACTORS, COPY } from '../../shared/contracts.mjs';

async function startOwnProject(page, actorId = 'new') {
  await page.goto('/');
  await page.getByRole('button', { name: ACTORS[actorId].label }).click();
  await expect(page.locator('[data-screen="orientation"]')).toBeVisible();
  await page.getByRole('button', { name: COPY.next }).click();
  await expect(page.locator('[data-screen="begin"]')).toBeVisible();
  await page.getByRole('button', { name: COPY.startOwn }).click();
  await expect(page.locator('[data-screen="hub"]')).toBeVisible();
}

test('landing and orientation expose the broad intake contract without promoting authority', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('[data-narrative="landing-contract"]')).toContainText(
    'nothing becomes controlling merely because software read it',
  );
  await expect(page.locator('.landing-sequence .narrative-detail')).toHaveCount(0);
  await expect(page.locator('#landing-sequence li')).toHaveText([...COPY.sequence]);

  await page.getByRole('button', { name: ACTORS.professional.label }).click();
  await expect(page.locator('[data-narrative="orientation-professional"]')).toContainText(
    'we do not make a file authoritative by reading it',
  );
});

test('start-your-own exposes source, candidate, gap, and working next-question seams', async ({ page }) => {
  await startOwnProject(page, 'new');

  await expect(page.locator('[data-narrative="intake-contract"]')).toContainText('Receive broadly');
  await expect(page.locator('[data-narrative="intake-two-axes"]')).toContainText('How we got it');
  await expect(page.locator('[data-narrative="intake-two-axes"]')).toContainText('What authority it has');
  await expect(page.locator('.source-pane h2')).toHaveText('WHAT YOU BROUGHT');
  await expect(page.locator('.candidate-pane h2')).toHaveText('WHAT WE HAVE ESTABLISHED OR PROPOSED');
  await expect(page.locator('.needs-pane h2')).toHaveText('WHAT IS STILL UNKNOWN');
  await expect(page.locator('[data-narrative="next-question"]')).toContainText(
    'What are you trying to make, replace, change, or fit?',
  );
});

test('review, Store, result, and record pages expose authority boundaries without claiming implementation', async ({ page }) => {
  await startOwnProject(page, 'new');

  await page.locator('[data-nav-page="confirm"]').click();
  await expect(page.locator('main[data-screen="confirm"]')).toBeVisible();
  await expect(page.locator('[data-narrative="confirm-freeze"]')).toContainText(
    'does not by itself mean ordered, paid, material allocated, production released',
  );
  await expect(page.locator('[data-narrative="qualified-resolution"]')).toContainText(
    'Routing, standing validation, expiry, blocking behavior, and persistence',
  );

  await page.locator('[data-nav-page="store"]').click();
  await expect(page.locator('main[data-screen="store"]')).toBeVisible();
  await expect(page.locator('[data-narrative="store-boundary"]')).toContainText(
    'Store support is not production release or Cycle Start',
  );

  await page.locator('[data-nav-page="result"]').click();
  await expect(page.locator('main[data-screen="result"]')).toBeVisible();
  await expect(page.locator('[data-future-chain="true"]')).toContainText(
    'From confirmation to motion',
  );
  await expect(page.locator('[data-confirmation-to-motion]')).toContainText(
    'No per-job redraw. No tape layout. No programmer reconstructing the customer’s intent.',
  );
  await expect(page.locator('[data-future-chain="true"]')).toContainText(
    'Linked domains, not one giant status',
  );
  await expect(page.locator('[data-future-chain="true"]')).toContainText(
    'Release is its own authority. It is not machine readiness',
  );

  const map = page.locator('[data-narrative="authority-map"]');
  await expect(map).toContainText('YOU');
  await expect(map).toContainText('OWNER RECORD');
  await expect(map.locator('[data-authority-stage]')).toHaveCount(8);
  await expect(map.locator('[data-authority-stage="STORE"]')).toContainText('RECEIVES');
  await expect(map.locator('[data-authority-stage="STORE"]')).toContainText('MAY DO');
  await expect(map.locator('[data-authority-stage="LOCAL CELL"]')).toContainText('local Cycle Start');

  await expect(page.locator('[data-narrative="qualified-loop-result"]')).toContainText(
    'Human review answers only the stated question',
  );
  await expect(page.locator('[data-narrative="collapses"]')).toContainText(
    'Qualified resolution is not production release',
  );
  await expect(page.locator('[data-narrative="collapses"]')).toContainText(
    'Production release is not machine readiness',
  );
  await expect(page.locator('[data-narrative="collapses"]')).toContainText(
    'Machine readiness is not Cycle Start',
  );

  await page.locator('[data-nav-page="record"]').click();
  await expect(page.locator('main[data-screen="record"]')).toBeVisible();
  await expect(page.locator('[data-narrative="owner-record"]')).toContainText(
    'It preserves missing events and stopped versions',
  );
});

