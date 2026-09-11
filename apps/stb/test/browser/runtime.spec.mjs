import { expect, test } from '@playwright/test';

import { FIXED_ORIGIN } from '../../shared/contracts.mjs';

test('real browser reaches the fixed origin foundation page', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });

  const response = await page.goto('/');
  expect(response.status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'SCAN TO BUILD' })).toBeVisible();
  await expect(page.getByText('NO BLOOD ON WOOD', { exact: true })).toBeVisible();
  await expect(page.locator('#origin-status')).toHaveText(FIXED_ORIGIN);
  await expect(page.locator('#storage-origin-status')).toHaveText(`Product origin ${FIXED_ORIGIN}`);
  await expect(page.locator('#save-status')).toHaveText('idle');
  await expect(page.locator('#indexeddb-status')).toHaveText('available');
  await expect(page.locator('#blob-status')).toHaveText('available');
  await expect(page.locator('#sha256-status')).toHaveText(/^[0-9a-f]{64}$/);
  expect(page.url()).toBe(`${FIXED_ORIGIN}/`);
  expect(errors).toEqual([]);
});

test('browser APIs for IndexedDB, Blob, and SHA-256 are actually present', async ({ page }) => {
  await page.goto('/');
  const capabilities = await page.evaluate(async () => {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('abc'));
    const hex = [...new Uint8Array(digest)]
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
    return {
      origin: window.location.origin,
      indexedDB: typeof indexedDB === 'object' && indexedDB !== null,
      blob: typeof Blob === 'function',
      sha256: hex,
    };
  });
  expect(capabilities.origin).toBe(FIXED_ORIGIN);
  expect(capabilities.indexedDB).toBe(true);
  expect(capabilities.blob).toBe(true);
  expect(capabilities.sha256).toBe(
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
  );
});
