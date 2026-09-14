import { expect, test } from '@playwright/test';

async function clickVisibleButton(page, label) {
  await page.locator('button', { hasText: new RegExp(`^${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }).click();
}

async function openPage1(page, actor = 'NEW USER', forward = 'START') {
  await page.goto('/');
  await page.getByRole('button', { name: actor, exact: true }).click();
  await clickVisibleButton(page, forward);
  await expect(page.locator('[data-controlled-projects="true"]')).toBeVisible();
}

test('landing reproduces the controlling words, order, rail, and README pill', async ({ page }) => {
  await page.goto('/');
  const landing = page.locator('[data-controlled-page="landing"]');
  await expect(landing).toBeVisible();
  await expect(landing.getByRole('heading', { name: 'SCAN TO BUILD', exact: true })).toBeVisible();
  await expect(landing.getByText('Your idea. Your measurements. Your parts.', { exact: true })).toBeVisible();
  await expect(landing.locator('.verb b')).toHaveText([
    'YOU SCAN',
    'YOU DEFINE',
    'YOU SELECT',
    'YOU CONFIRM',
    'YOUR DEFINITION REACHES THE CUT',
    'WE CUT · MILL · DRILL · LABEL',
  ]);
  await expect(landing.locator('.verb .dim')).toHaveText([
    'Capture the space with laser, AR, or tape. The measurements are yours.',
    "One part, several parts, or a need we don't offer yet.",
    'Set the material, size, doors, and other available options.',
    'Approve exactly what you want built—and nothing else.',
    'Your confirmed dimensions guide the work without being redrawn, retyped, or reinterpreted along the way.',
    "Within stated limits. Staged for pickup. We tell you when they're ready.",
  ]);
  await expect(landing.getByText('YOU BUILD.', { exact: true })).toBeVisible();
  await expect(landing.getByText('HOW ARE YOU STARTING?', { exact: true })).toBeVisible();
  await expect(landing.getByRole('button', { name: 'NEW USER', exact: true })).toBeVisible();
  await expect(landing.getByRole('button', { name: 'RETURNING USER', exact: true })).toBeVisible();
  await expect(landing.getByRole('button', { name: 'PROFESSIONAL', exact: true })).toBeVisible();
  await expect(landing.locator('[data-build-guide] .row b')).toHaveText([
    'Say what this is',
    'Show who does what',
    'Make the seam visible',
    'Offer three ways in',
  ]);
  const readme = landing.getByRole('link', { name: 'Readme', exact: true });
  await expect(readme).toHaveAttribute('href', 'https://github.com/GeorgePlattDemo/scan-to-build-system#readme');
  await expect(landing.locator('[data-build-guide] .foot')).toContainText('Reference build. Input welcome.');
});

test('all three orientation pages reproduce the controlling copy and converge on Page 1', async ({ page }) => {
  const cases = [
    ['NEW USER', "We don't sell products.", 'START'],
    ['RETURNING USER', 'Nothing moved while you were gone.', 'OPEN A PROJECT'],
    ['PROFESSIONAL', 'Send us what you want. Nothing else.', 'ATTACH A FILE'],
  ];
  for (const [actor, heading, forward] of cases) {
    await page.goto('/');
    await page.getByRole('button', { name: actor, exact: true }).click();
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '← Back', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Readme', exact: true })).toBeVisible();
    await expect(page.locator('button', { hasText: new RegExp(`^${forward.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) })).toBeVisible();
    await clickVisibleButton(page, forward);
    await expect(page.getByRole('heading', { name: 'What are you making?', exact: true })).toBeVisible();
  }
});

test('Page 1 reproduces the controlling four-door ribbon and explanatory field', async ({ page }) => {
  await openPage1(page);
  const page1 = page.locator('[data-controlled-page="projects"]');
  await expect(page1).toBeVisible();
  await expect(page1.locator('[data-project-door]')).toHaveCount(4);
  await expect(page1.locator('[data-project-door] svg')).toHaveCount(4);
  await expect(page1.locator('.tile .t1')).toHaveText([
    'Start your own',
    'Critical fit',
    'Space utilization',
    'Outdoor build',
  ]);
  await expect(page1.locator('.tile .t2')).toHaveText([
    'Board, sketch, or file',
    'Shelf insert',
    'Window seat',
    'To fit your space',
  ]);
  await expect(page1.getByText('A bounded project is one somebody already worked out.', { exact: true })).toBeVisible();
  await expect(page1.getByText("You're not designing furniture. If a question needs a woodworker to answer it, we shouldn't be asking you.", { exact: true })).toBeVisible();
  await expect(page1.getByRole('heading', { name: 'Some answers open more questions', exact: true })).toBeVisible();
  await expect(page1.getByRole('heading', { name: 'If nothing here is your thing', exact: true })).toBeVisible();
  await expect(page1.locator('[data-build-guide] .row b')).toHaveText([
    'Name the problem',
    'Make it want touching',
    'Keep the door open',
    'Capture the miss',
  ]);
  await expect(page1.getByRole('link', { name: 'Readme', exact: true })).toHaveAttribute(
    'href',
    'https://github.com/GeorgePlattDemo/scan-to-build-system#readme',
  );
  await expect(page1.getByRole('button', { name: '← Back', exact: true })).toBeVisible();
});

test('existing project plumbing remains behind Start your own, Critical fit, and Outdoor build', async ({ page }) => {
  await openPage1(page);
  await page.locator('[data-project-door="own"]').click();
  await expect(page.locator('main[data-screen="hub"]')).toBeVisible();

  await page.goto('/');
  await page.getByRole('button', { name: 'NEW USER', exact: true }).click();
  await clickVisibleButton(page, 'START');
  await page.locator('[data-project-door="alcove"]').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Keep this project and start another', exact: true }).click();
  await expect(page.locator('main[data-screen="questions"][data-class-id="alcove-shelf-blanks"]')).toBeVisible();

  await page.goto('/');
  await page.getByRole('button', { name: 'NEW USER', exact: true }).click();
  await clickVisibleButton(page, 'START');
  await page.locator('[data-project-door="picnic"]').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Keep this project and start another', exact: true }).click();
  await expect(page.locator('main[data-screen="questions"][data-class-id="classic-picnic-table-fixture"]')).toBeVisible();
});

test('window-seat door emits the dedicated reference-navigation event instead of acting as decoration', async ({ page }) => {
  await openPage1(page);
  await page.evaluate(() => {
    window.__windowSeatReferenceRequested = false;
    window.addEventListener('stb:open-window-seat-reference', () => {
      window.__windowSeatReferenceRequested = true;
    }, { once: true });
  });
  await page.locator('[data-project-door="window"]').click();
  await expect.poll(() => page.evaluate(() => window.__windowSeatReferenceRequested)).toBe(true);
});
