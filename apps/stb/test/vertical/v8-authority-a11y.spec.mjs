import { expect, test } from '@playwright/test';

import { ACTORS, COPY } from '../../shared/contracts.mjs';
import {
  applyLengthUi,
  assertNoFabricatedAuthority,
  assertPinnedStoreAnswer,
  attachStoreObserver,
  confirmDefinition,
  envelopeOf,
  localRecordId,
  openBoardChild,
  snapshot,
  startOwnProject,
  tabUntilFocused,
  waitForStoreIdle,
} from './helpers.mjs';

const AUTHORITY_TERMS = Object.freeze([
  'commercial order',
  'payment received',
  'inventory reserved',
  'governed production authority',
  'physical execution recorded',
  'pickup-ready',
  'cycle start',
  'g-code',
  'workpacket issued',
]);

test('V8-05 complete vertical still has no commercial or physical authority', async ({ page }) => {
  const observer = attachStoreObserver(page);
  await startOwnProject(page, 'new');
  await openBoardChild(page);
  await applyLengthUi(page, '45');
  await observer.waitForCount(1);
  const id = await localRecordId(page);
  const at45 = await snapshot(page, id);
  assertPinnedStoreAnswer(envelopeOf(at45.store), 45);
  await confirmDefinition(page);
  await assertNoFabricatedAuthority(page);
  const body = ((await page.locator('body').innerText()) ?? '').toLowerCase();
  for (const phrase of AUTHORITY_TERMS) {
    expect(body, phrase).not.toContain(phrase);
  }
  const reviewed = await snapshot(page, id);
  expect(reviewed.reviews[0].payload.authority).toBe(false);
  expect(reviewed.reviews[0].payload.commercial).toBe(false);
  expect(reviewed.reviews[0].payload.physical).toBe(false);
  expect(reviewed.events.every((event) => event.payload?.physical !== true)).toBe(true);
  expect(reviewed.events.every((event) => event.payload?.commercial !== true)).toBe(true);
  expect(reviewed.events.some((event) => /order|payment|reserv|fulfill/i.test(event.payload?.type ?? ''))).toBe(
    false,
  );
  await expect(page.locator('[data-simulation-execution="false"]')).toBeVisible();
  await expect(page.locator('[data-cut001-reference="absent"]')).toBeVisible();
});

test('V8-06 keyboard and narrow viewport can complete the bounded Board vertical', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto('/');
  await expect(page.locator('#screen-heading')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: ACTORS.new.label })).toBeFocused();
  await expect(page.getByRole('button', { name: ACTORS.new.label })).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-screen="orientation"][data-actor="new"]')).toBeVisible();
  await expect(page.locator('#screen-heading')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: COPY.next })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-screen="begin"]')).toBeVisible();
  await page.getByRole('button', { name: COPY.startOwn }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-page="page2"]')).toBeVisible();
  const sourceBox = await page.locator('.source-pane').boundingBox();
  const candidateBox = await page.locator('.candidate-pane').boundingBox();
  expect(sourceBox.y).toBeLessThan(candidateBox.y);
  await page.getByRole('button', { name: 'PICK A BOARD', exact: true }).focus();
  await expect(page.getByRole('button', { name: 'PICK A BOARD', exact: true })).toHaveCSS(
    'outline-style',
    'solid',
  );
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-child-panel="board"]')).toBeVisible();
  await page.locator('[data-field="board-length"]').fill('45');
  await page.locator('[data-field="board-unit"]').fill('in');
  await page.getByRole('button', { name: COPY.boardApply }).focus();
  await page.keyboard.press('Enter');
  await waitForStoreIdle(page);
  await expect(page.locator('[data-store-headline]')).toBeVisible();
  await expect(page.locator('[data-store-disposition]')).toHaveText('SUPPORTABLE');
  await expect(page.locator('[data-store-q]')).not.toHaveAttribute('data-store-q', 'none');
  await page.getByRole('button', { name: COPY.storeInspect }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-page="page5"]')).toBeVisible();
  await page.locator('summary').first().focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-store-pin]')).toBeVisible();
  await page.locator('[data-action="back-to-hub"]').first().focus();
  await page.keyboard.press('Enter');
  await openBoardChild(page);
  await waitForStoreIdle(page);
  const confirm = page.getByRole('button', { name: COPY.reviewConfirm });
  await page.locator('[data-field="board-length"]').focus();
  await tabUntilFocused(page, confirm);
  await expect(confirm).toHaveCSS('outline-style', 'solid');
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-page="page7"]')).toBeVisible();
  await assertNoFabricatedAuthority(page);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
  const id = await localRecordId(page);
  const now = await snapshot(page, id);
  expect(now.presentation.currentReview.payload.type).toBe('DefinitionReviewRecorded');
  expect(now.store.current).toBe(true);
});
