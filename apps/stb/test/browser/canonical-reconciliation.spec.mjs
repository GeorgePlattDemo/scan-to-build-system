import { expect, test } from '@playwright/test';

import { ACTORS, COPY } from '../../shared/contracts.mjs';
import { repoCall, requireOk } from '../helpers/browser-repo.mjs';

const CANONICAL = [
  ['start-own', 'Start Your Own / Grab a Board'],
  ['outdoor', 'Outdoor Build'],
  ['alcove', 'Alcove Insert'],
  ['window-seat', 'Window Seat / Space Utilization'],
  ['s001', 'S-001 / Centered Arched Sheet'],
];

async function openLibrary(page) {
  await page.goto('/');
  await page.getByRole('button', { name: ACTORS.new.label }).click();
  await page.getByRole('button', { name: COPY.next }).click();
  await expect(page.locator('[data-canonical-project-library="true"]')).toBeVisible();
}

async function openCanonical(page, projectId, name) {
  await openLibrary(page);
  await page.getByRole('button', { name, exact: true }).click();
  await expect(page).toHaveURL(new RegExp('catalog=' + projectId));
  const url = new URL(page.url());
  const localRecordId = url.searchParams.get('id');
  expect(localRecordId).toBeTruthy();
  return localRecordId;
}

test('reconciliation library exposes five canonical identities and keeps retained System paths visible', async ({ page }) => {
  await openLibrary(page);
  const cards = page.locator('.canonical-project-card');
  await expect(cards).toHaveCount(5);
  await expect(cards).toHaveText(CANONICAL.map(([, name]) => name));
  await expect(page.getByRole('button', { name: COPY.startOwn })).toBeVisible();
  await expect(page.getByRole('button', { name: COPY.chooseMapped })).toBeVisible();
});

for (const [projectId, name, source] of [
  ['start-own', 'Start Your Own / Grab a Board', '/project-children/stb-start-own-picnic-leg-0.1.html'],
  ['outdoor', 'Outdoor Build', '/review-donors/stb-outdoor-build.html'],
  ['window-seat', 'Window Seat / Space Utilization', '/review-donors/stb-window-seat-space-utilization-0.7.4.html'],
]) {
  test('reconciliation hosts preserved donor child: ' + projectId, async ({ page }) => {
    const localRecordId = await openCanonical(page, projectId, name);
    const host = page.locator('[data-canonical-project-host="' + projectId + '"]');
    await expect(host).toBeVisible();
    const iframe = host.locator('iframe[data-canonical-child-frame="' + projectId + '"]');
    await expect(iframe).toHaveAttribute('src', source);
    await expect(page.frameLocator('iframe[data-canonical-child-frame="' + projectId + '"]').locator('body')).toBeVisible();
    const project = requireOk(await repoCall(page, 'project', { localRecordId }), 'canonical project');
    expect(project.localRecordId).toBe(localRecordId);
  });
}

test('S-001 canonical library entry stays System-native and preserves project identity', async ({ page }) => {
  const localRecordId = await openCanonical(page, 's001', 'S-001 / Centered Arched Sheet');
  const project = requireOk(await repoCall(page, 'project', { localRecordId }), 'S-001 project');
  expect(project.classId).toBe('S001_CENTERED_ARCHED_SHEET_V0');
  expect(new URL(page.url()).searchParams.get('catalog')).toBe('s001');
  await expect(page.locator('[data-canonical-project-host]')).toHaveCount(0);
  await expect(page.locator('[data-canonical-project-id="s001"][data-canonical-stage="scan-evidence"]')).toBeVisible();
});

test('Alcove keeps donor economics, same-project stage routing, custody, and stale-answer truth', async ({ page }) => {
  const localRecordId = await openCanonical(page, 'alcove', 'Alcove Insert');
  const host = page.locator('[data-canonical-project-host="alcove"]');
  const frame = page.frameLocator('iframe[data-canonical-child-frame="alcove"]');

  await expect(host).toBeVisible();
  await expect(frame.locator('#review-price')).toHaveText('$374.42');
  await expect(frame.locator('#p-basis')).toContainText('material $272.86');
  await expect(frame.locator('#p-basis')).toContainText('cell $83.56');
  await expect(frame.locator('#p-basis')).toContainText('hardware $18.00');

  const originalProject = requireOk(await repoCall(page, 'project', { localRecordId }), 'Alcove project');
  expect(originalProject.classId).toBe('REVIEW_ALCOVE_INSERT_CURRENT');

  await page.locator('[data-canonical-stage="configure"]').click();
  await expect(page).toHaveURL(new RegExp('id=' + localRecordId + '.*catalog=alcove.*stage=configure'));
  await expect(frame.locator('#alcove-config')).toBeVisible();

  await frame.locator('#confirm-alcove-inline').click();
  await expect(host).toHaveAttribute('data-canonical-stage', 'store-answer');
  await expect(page.locator('[data-store-applicability="current"]')).toContainText('CURRENT FOR IDENTIFIED DEFINITION');

  let snapshots = requireOk(
    await repoCall(page, 'listRecords', { localRecordId, kind: 'child-snapshot' }),
    'Alcove snapshots after confirm',
  );
  expect(snapshots).toHaveLength(1);
  expect(snapshots[0].payload.sourceEvent).toBe('alcove-native-confirmation');
  expect(snapshots[0].payload.payload.economics.displayedTotal).toBe('$374.42');

  await page.locator('[data-canonical-stage="configure"]').click();
  await expect(frame.locator('#alcove-config')).toBeVisible();
  await frame.locator('#x-n').fill('4');
  await frame.locator('#x-n').press('Enter');
  await expect(frame.locator('#p-shelves')).toHaveText('4');

  await page.locator('[data-canonical-stage="store-answer"]').click();
  await expect(page.locator('[data-store-applicability="stale"]')).toContainText('STALE / HISTORICAL ONLY');
  snapshots = requireOk(
    await repoCall(page, 'listRecords', { localRecordId, kind: 'child-snapshot' }),
    'Alcove snapshots after navigation only',
  );
  expect(snapshots).toHaveLength(1);

  const afterNavigation = requireOk(await repoCall(page, 'project', { localRecordId }), 'Alcove after stage navigation');
  expect(afterNavigation.projectId).toBe(originalProject.projectId);
  expect(afterNavigation.localRecordId).toBe(originalProject.localRecordId);

  await page.locator('[data-canonical-stage="configure"]').click();
  await frame.locator('#confirm-alcove-inline').click();
  await expect(page.locator('[data-store-applicability="current"]')).toContainText('CURRENT FOR IDENTIFIED DEFINITION');
  snapshots = requireOk(
    await repoCall(page, 'listRecords', { localRecordId, kind: 'child-snapshot' }),
    'Alcove snapshots after reconfirm',
  );
  expect(snapshots).toHaveLength(2);
  expect(snapshots[1].payload.definitionId).not.toBe(snapshots[0].payload.definitionId);
});

test('Window Seat parent navigation does not mint an answer; project confirmation does', async ({ page }) => {
  const localRecordId = await openCanonical(page, 'window-seat', 'Window Seat / Space Utilization');
  const host = page.locator('[data-canonical-project-host="window-seat"]');
  const frame = page.frameLocator('iframe[data-canonical-child-frame="window-seat"]');

  const stages = await frame.locator('body').evaluate(() => window.STBWindowSeatJourney.actorStages);
  expect(stages).toEqual(['scan', 'configure', 'store-answer', 'accept-pay', 'store-yard', 'handoff-record']);

  await page.locator('[data-canonical-stage="store-answer"]').click();
  await expect(host).toHaveAttribute('data-canonical-stage', 'store-answer');
  await expect(page.locator('[data-store-applicability="stale"]')).toContainText('NO IDENTIFIED CURRENT ANSWER');
  let snapshots = requireOk(
    await repoCall(page, 'listRecords', { localRecordId, kind: 'child-snapshot' }),
    'Window Seat snapshots after navigation',
  );
  expect(snapshots).toHaveLength(0);

  await page.locator('[data-canonical-stage="configure"]').click();
  await frame.locator('[data-ws-confirm-send]').click();
  await expect(host).toHaveAttribute('data-canonical-stage', 'store-answer');
  await expect(page.locator('[data-store-applicability="current"]')).toContainText('CURRENT FOR IDENTIFIED DEFINITION');

  snapshots = requireOk(
    await repoCall(page, 'listRecords', { localRecordId, kind: 'child-snapshot' }),
    'Window Seat snapshots after confirm',
  );
  expect(snapshots).toHaveLength(1);
  expect(snapshots[0].payload.payload.revision.confirmed).toBe(true);
  expect(snapshots[0].payload.payload.storeAnswer).toBeTruthy();

  await page.locator('[data-canonical-stage="accept-pay"]').click();
  const afterStage = requireOk(
    await repoCall(page, 'listRecords', { localRecordId, kind: 'child-snapshot' }),
    'Window Seat snapshots after Accept/Pay navigation',
  );
  expect(afterStage).toHaveLength(1);
});


test('Start Your Own admitted child fails closed without its exact Store source and keeps canonical identity', async ({ page }) => {
  const localRecordId = await openCanonical(page, 'start-own', 'Start Your Own / Grab a Board');
  const host = page.locator('[data-canonical-project-host="start-own"]');
  const frame = page.frameLocator('iframe[data-canonical-child-frame="start-own"]');

  await frame.locator('#go').click();
  await frame.locator('select[data-fact="cutPlane"]').selectOption('miter-face');
  await frame.locator('select[data-fact="endIdentity"]').selectOption('both');
  await frame.locator('select[data-fact="endRelation"]').selectOption('parallel');
  await frame.locator('select[data-fact="lengthDatum"]').selectOption('long-long-outer-edge');

  await expect(frame.getByText(/Store Zero could not return a current answer/)).toBeVisible();
  await expect(frame.locator('#go')).toBeEnabled();
  await frame.locator('#go').click();

  await expect(host).toHaveAttribute('data-canonical-stage', 'store-answer');
  await expect(page.locator('[data-store-applicability="stale"]')).toContainText(
    'NO IDENTIFIED CURRENT ANSWER',
  );

  const snapshots = requireOk(
    await repoCall(page, 'listRecords', { localRecordId, kind: 'child-snapshot' }),
    'Start Your Own snapshots after fail-closed confirmation',
  );
  expect(snapshots).toHaveLength(1);
  expect(snapshots[0].payload.sourceEvent).toBe('STB_START_OWN_CONFIRMED');
  expect(snapshots[0].payload.definitionId).toMatch(/^SYO-SHA256-/);
  expect(snapshots[0].payload.definitionId).not.toMatch(/^PTL-/);
  expect(snapshots[0].payload.payload.storeAnswer).toBeNull();
  expect(snapshots[0].payload.payload.storeDiagnostic).toBe('STORE_SOURCE_UNAVAILABLE');

  const before = requireOk(await repoCall(page, 'project', { localRecordId }), 'Start Your Own project');
  await page.locator('[data-canonical-stage="accept-pay"]').click();
  await page.locator('[data-canonical-stage="store-answer"]').click();
  const after = requireOk(await repoCall(page, 'project', { localRecordId }), 'Start Your Own after navigation');
  expect(after.projectId).toBe(before.projectId);
  expect(after.localRecordId).toBe(before.localRecordId);
});

test('Outdoor confirmation carries unresolved project-specific Store truth without invented economics', async ({ page }) => {
  const localRecordId = await openCanonical(page, 'outdoor', 'Outdoor Build');
  const host = page.locator('[data-canonical-project-host="outdoor"]');
  const frame = page.frameLocator('iframe[data-canonical-child-frame="outdoor"]');

  await frame.locator('[data-outdoor-open]').click();
  await frame.locator('button[data-outdoor-assembly="left-bench"]').click();
  await frame.locator('button[data-outdoor-part="end-leg"]').click();
  await expect(frame.locator('#outdoor-confirm')).toBeVisible();
  await frame.locator('#outdoor-confirm').click();

  await expect(host).toHaveAttribute('data-canonical-stage', 'store-answer');
  await expect(page.locator('[data-store-applicability="current"]')).toContainText(
    'CURRENT FOR IDENTIFIED DEFINITION',
  );

  const snapshots = requireOk(
    await repoCall(page, 'listRecords', { localRecordId, kind: 'child-snapshot' }),
    'Outdoor snapshots after confirmation',
  );
  expect(snapshots).toHaveLength(1);
  expect(snapshots[0].payload.sourceEvent).toBe('STB_OUTDOOR_CONFIRMED');
  const storeReference = snapshots[0].payload.payload.storeReference;
  expect(storeReference).toBeTruthy();
  expect(storeReference.economicsStatus).toBe('UNRESOLVED_CLASS_SCOPED_RECOVERY');
  expect(storeReference.unresolvedConditions).toContain('STORE-PRICING-BRIDGE-GAP');
  expect(snapshots[0].payload.payload.storeEconomics.engine).toBeNull();
  expect(snapshots[0].payload.payload.storeEconomics.version).toBeNull();

  await page.locator('[data-canonical-stage="store-yard"]').click();
  const afterNavigation = requireOk(
    await repoCall(page, 'listRecords', { localRecordId, kind: 'child-snapshot' }),
    'Outdoor snapshots after stage navigation',
  );
  expect(afterNavigation).toHaveLength(1);
});


test('Start Your Own new child remains the same project across canonical stage navigation', async ({ page }) => {
  const localRecordId = await openCanonical(page, 'start-own', 'Start Your Own / Grab a Board');
  const before = requireOk(await repoCall(page, 'project', { localRecordId }), 'Start Your Own before navigation');

  for (const stage of ['configure', 'store-answer', 'accept-pay', 'store-yard', 'handoff-record']) {
    await page.locator('[data-canonical-stage="' + stage + '"]').click();
    expect(new URL(page.url()).searchParams.get('catalog')).toBe('start-own');
    expect(new URL(page.url()).searchParams.get('id')).toBe(localRecordId);
  }

  const after = requireOk(await repoCall(page, 'project', { localRecordId }), 'Start Your Own after navigation');
  expect(after.projectId).toBe(before.projectId);
  expect(after.localRecordId).toBe(before.localRecordId);
  expect(after.classId).toBe(before.classId);
});

test('Outdoor keeps its preserved comparison and Store handoff receipt visible at Store Answer', async ({ page }) => {
  await openCanonical(page, 'outdoor', 'Outdoor Build');
  const host = page.locator('[data-canonical-project-host="outdoor"]');
  const frame = page.frameLocator('iframe[data-canonical-child-frame="outdoor"]');

  await frame.getByRole('button', { name: /OPEN THIS BOUNDED PROJECT/ }).click();
  await frame.locator('button[data-outdoor-assembly="left-bench"]').first().click();
  await frame.locator('button[data-outdoor-part="end-leg"]').click();
  await frame.locator('#outdoor-confirm').click();

  await expect(host).toHaveAttribute('data-canonical-stage', 'store-answer');
  await expect(page.locator('iframe[data-canonical-child-frame="outdoor"]')).toBeVisible();
  await expect(frame.locator('#comparison-receipt')).toBeVisible();
  await expect(frame.locator('#comparison-receipt')).toContainText('STORE ECONOMICS');
  await expect(frame.locator('#comparison-receipt')).toContainText('UNRESOLVED');
  await expect(page.locator('[data-store-applicability="current"]')).toContainText('CURRENT FOR IDENTIFIED DEFINITION');
});
