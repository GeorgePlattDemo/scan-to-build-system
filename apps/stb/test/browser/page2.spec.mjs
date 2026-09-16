import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ACTORS, COPY, INTAKE_CARDS, PDFJS } from '../../shared/contracts.mjs';
import { JPEG_FIXTURE, MALFORMED_PDF_FIXTURE, PDF_FIXTURE, PNG_FIXTURE } from '../fixtures/bytes.mjs';
import { repoCall, requireOk } from '../helpers/browser-repo.mjs';

const APP_ROOT = fileURLToPath(new URL('../..', import.meta.url));

async function openOwnHub(page, actorId = 'new') {
  await page.goto('/');
  await page.getByRole('button', { name: ACTORS[actorId].label }).click();
  await page.getByRole('button', { name: COPY.next }).click();
  await page.getByRole('button', { name: COPY.startOwn }).click();
  await page.getByRole('button', { name: COPY.openProjectDefinition }).click();
  await expect(page.locator('[data-page="page2"]')).toBeVisible();
}

function cardNames(page) {
  return page.locator('[data-intake-card] .intake-open').allTextContents();
}

async function childBack(page) {
  const back = page.locator('[data-child-panel] [data-action="back-to-hub"]');
  await expect(back).toBeVisible();
  await back.click();
  await expect(page.locator('[data-intake-grid]')).toBeVisible();
}

async function waitDisplayedImage(page) {
  const img = page.locator('img.source-image');
  await expect(img).toBeVisible();
  await expect
    .poll(async () => img.evaluate((el) => Boolean(el.complete && el.naturalWidth > 0)))
    .toBe(true);
}

test('P2-01 seven cards open and return to the same project', async ({ page }) => {
  await openOwnHub(page);
  const projectId = await page.locator('[data-project-id]').getAttribute('data-project-id');
  for (const card of INTAKE_CARDS) {
    await page.getByRole('button', { name: card.name, exact: true }).click();
    await expect(page.locator(`[data-child-panel="${card.id}"]`)).toBeVisible();
    expect(await page.locator('[data-project-id]').getAttribute('data-project-id')).toBe(projectId);
    await childBack(page);
  }
});

test('P2 actor order changes only card priority', async ({ page }) => {
  await openOwnHub(page, 'new');
  expect(await cardNames(page)).toEqual([
    'PICK A BOARD',
    'MEASUREMENTS',
    'SCAN A SPACE',
    'SKETCH / PHOTO',
    'DRAWING / PDF',
    'TAKEOFF / CUT LIST',
    'CAD / BIM / STRUCTURED FILE',
  ]);
  const projectId = await page.locator('[data-project-id]').getAttribute('data-project-id');
  await page.goto('/');
  await page.getByRole('button', { name: ACTORS.professional.label }).click();
  await page.getByRole('button', { name: COPY.next }).click();
  await page.locator('.resume-item').first().click();
  await expect(page.locator('[data-screen="workstreams"]')).toBeVisible();
  await page.getByRole('button', { name: COPY.openProjectDefinition }).click();
  await expect(page.locator('[data-page="page2"]')).toBeVisible();
  expect(await page.locator('[data-project-id]').getAttribute('data-project-id')).toBe(projectId);
  expect(await cardNames(page)).toEqual([
    'DRAWING / PDF',
    'TAKEOFF / CUT LIST',
    'CAD / BIM / STRUCTURED FILE',
    'MEASUREMENTS',
    'PICK A BOARD',
    'SCAN A SPACE',
    'SKETCH / PHOTO',
  ]);
});

test('P2-04 JPEG PNG and PDF display from retained bytes without observations', async ({ page }) => {
  await openOwnHub(page);
  await page.getByRole('button', { name: 'SKETCH / PHOTO', exact: true }).click();
  const [jpegChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: 'Attach JPEG or PNG' }).click(),
  ]);
  await jpegChooser.setFiles({
    name: 'photo.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from(JPEG_FIXTURE.bytes),
  });
  await waitDisplayedImage(page);
  await expect(page.getByText(COPY.originalRetained, { exact: true })).toBeVisible();
  await expect(page.getByText(COPY.viewingCreatesNoObservation, { exact: true })).toBeVisible();

  await childBack(page);
  await page.getByRole('button', { name: 'SKETCH / PHOTO', exact: true }).click();
  const [pngChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: 'Attach JPEG or PNG' }).click(),
  ]);
  await pngChooser.setFiles({
    name: 'sketch.png',
    mimeType: 'image/png',
    buffer: Buffer.from(PNG_FIXTURE.bytes),
  });
  await waitDisplayedImage(page);

  await childBack(page);
  await page.getByRole('button', { name: 'DRAWING / PDF', exact: true }).click();
  const [pdfChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: 'Attach PDF' }).click(),
  ]);
  await pdfChooser.setFiles({
    name: 'drawing.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from(PDF_FIXTURE.bytes),
  });
  await expect(page.locator('[data-pdf-viewer]')).toBeVisible();
  await expect(page.locator('[data-pdf-page]')).toContainText('Page 1 of');
  await expect(page.getByText(COPY.viewingCreatesNoObservation, { exact: true })).toBeVisible();
  await page.locator('[data-pdf-viewer]').click();

  const localRecordId = await page.locator('[data-local-record-id]').getAttribute('data-local-record-id');
  await page.reload();
  await expect(page.locator('[data-page="page2"]')).toBeVisible();
  await page.locator('[data-display-type="pdf"]').click();
  await expect(page.locator('[data-pdf-viewer]')).toBeVisible();
  await expect(page.locator('[data-pdf-page]')).toContainText('Page 1 of');

  const observations = requireOk(
    await repoCall(page, 'listRecords', { localRecordId, kind: 'observation' }),
    'observations',
  );
  expect(observations).toHaveLength(0);
  const candidate = requireOk(
    await repoCall(page, 'currentCandidate', { localRecordId }),
    'candidate',
  );
  expect(candidate.payload.parts).toBeNull();
  expect(candidate.payload.dimensions).toBeNull();
});

test('P2 scan and CAD stay planned with opaque retention only', async ({ page }) => {
  await openOwnHub(page);
  await page.getByRole('button', { name: 'SCAN A SPACE', exact: true }).click();
  await expect(page.getByText(COPY.scanStatus, { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'MEASUREMENTS', exact: true })).toBeVisible();
  const [scanChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: COPY.attachFile }).click(),
  ]);
  await scanChooser.setFiles({
    name: 'room.e57',
    mimeType: 'application/octet-stream',
    buffer: Buffer.from('opaque-scan'),
  });
  await expect(page.getByText(COPY.opaqueKept)).toBeVisible();

  await childBack(page);
  await page.getByRole('button', { name: 'CAD / BIM / STRUCTURED FILE', exact: true }).click();
  await expect(page.getByText(COPY.cadStatus, { exact: true })).toBeVisible();

  await childBack(page);
  await page.getByRole('button', { name: 'PICK A BOARD', exact: true }).click();
  await expect(page.getByRole('button', { name: COPY.boardApply })).toBeVisible();
  await expect(page.locator('[data-store-panel="compact"]')).toHaveAttribute('data-store-kind', 'incomplete');
  await expect(page.locator('[data-store-headline]')).toHaveText(COPY.storeIncomplete);
  const localRecordId = await page.locator('[data-local-record-id]').getAttribute('data-local-record-id');
  const candidate = requireOk(
    await repoCall(page, 'currentCandidate', { localRecordId }),
    'candidate',
  );
  expect(candidate.payload.parts).toBeNull();
});

test('P2 PDF.js is the locally pinned display dependency', async () => {
  expect(PDFJS.version).toBe('4.10.38');
  expect(PDFJS.cdn).toBe(false);
  const pkg = JSON.parse(fs.readFileSync(path.join(APP_ROOT, 'package.json'), 'utf8'));
  expect(pkg.dependencies['pdfjs-dist']).toBe('4.10.38');
  expect(fs.readFileSync(path.join(APP_ROOT, 'browser/vendor/pdfjs/VERSION'), 'utf8').trim()).toBe(
    '4.10.38',
  );
  expect(fs.existsSync(path.join(APP_ROOT, 'browser/vendor/pdfjs/pdf.min.mjs'))).toBe(true);
  expect(fs.existsSync(path.join(APP_ROOT, 'browser/vendor/pdfjs/pdf.worker.min.mjs'))).toBe(true);
});

test('P2-02 measurement with unit and role is entered as 45 without a fit allowance', async ({ page }) => {
  await openOwnHub(page);
  await page.getByRole('button', { name: 'MEASUREMENTS', exact: true }).click();
  await page.locator('[data-field="measurement-raw"]').fill('45');
  await page.locator('[data-field="measurement-unit"]').fill('in');
  await page.locator('[data-field="measurement-role"]').fill('opening width');
  await page.getByRole('button', { name: COPY.keepObservation }).click();
  await expect(page.locator('[data-interpreted="45"]')).toBeVisible();
  await expect(page.getByText(COPY.notMapped, { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: COPY.useInCandidate })).toBeVisible();
  const localRecordId = await page.locator('[data-local-record-id]').getAttribute('data-local-record-id');
  const kept = requireOk(
    await repoCall(page, 'listObservations', { localRecordId }),
    'obs',
  );
  expect(kept).toHaveLength(1);
  expect(kept[0].payload.interpretedValue).toBe(45);
  expect(kept[0].payload.interpretedUnit).toBe('in');
  expect(requireOk(await repoCall(page, 'currentCandidate', { localRecordId }), 'kept cand').payload.mappings).toEqual([]);
  await page.getByRole('button', { name: COPY.useInCandidate }).click();
  await expect(page.locator('[data-mapped-input="opening width"]')).toBeVisible();
  await expect(page.locator('[data-page-status]')).toHaveText(COPY.mappedAccepted);
  const candidate = requireOk(await repoCall(page, 'currentCandidate', { localRecordId }), 'cand');
  expect(candidate.payload.parts).toBeNull();
  expect(candidate.payload.mappings).toEqual([
    { observationId: kept[0].id, inputKey: 'opening width', status: 'accepted' },
  ]);
});

test('P2-03 correcting a measurement keeps the old record', async ({ page }) => {
  await openOwnHub(page);
  await page.getByRole('button', { name: 'MEASUREMENTS', exact: true }).click();
  await page.locator('[data-field="measurement-raw"]').fill('45');
  await page.locator('[data-field="measurement-unit"]').fill('in');
  await page.locator('[data-field="measurement-role"]').fill('opening width');
  await page.getByRole('button', { name: COPY.keepObservation }).click();
  await expect(page.locator('article[data-observation-id]')).toHaveCount(1);
  const firstId = await page.locator('article[data-observation-id]').getAttribute('data-observation-id');
  await page.getByRole('button', { name: COPY.correctValue }).click();
  await expect(page.locator('[data-field="measurement-raw"]')).toHaveValue('45');
  await page.locator('[data-field="measurement-raw"]').fill('46');
  await page.getByRole('button', { name: COPY.applyCorrection }).click();
  await expect(page.locator('[data-interpreted="46"]')).toBeVisible();
  await expect(page.getByText(COPY.earlierValues)).toBeVisible();
  const localRecordId = await page.locator('[data-local-record-id]').getAttribute('data-local-record-id');
  const observations = requireOk(
    await repoCall(page, 'listObservations', { localRecordId }),
    'obs',
  );
  expect(observations).toHaveLength(2);
  const original = observations.find((entry) => entry.id === firstId);
  expect(original.payload.rawText).toBe('45');
  const candidate = requireOk(await repoCall(page, 'currentCandidate', { localRecordId }), 'cand');
  expect(candidate.payload.activeObservationIds).toHaveLength(1);
  expect(candidate.payload.activeObservationIds[0]).not.toBe(firstId);
});

test('Enter then blur does not double-commit and Escape discards the buffer', async ({ page }) => {
  await openOwnHub(page);
  await page.getByRole('button', { name: 'MEASUREMENTS', exact: true }).click();
  await page.locator('[data-field="measurement-raw"]').fill('45');
  await page.locator('[data-field="measurement-unit"]').fill('in');
  await page.locator('[data-field="measurement-role"]').fill('opening width');
  await page.locator('[data-field="measurement-role"]').press('Enter');
  await page.locator('[data-field="measurement-role"]').blur();
  await expect(page.locator('[data-interpreted="45"]')).toBeVisible();
  const localRecordId = await page.locator('[data-local-record-id]').getAttribute('data-local-record-id');
  expect(
    requireOk(await repoCall(page, 'listObservations', { localRecordId }), 'after enter'),
  ).toHaveLength(1);

  await page.locator('[data-field="measurement-raw"]').fill('99');
  await page.locator('[data-field="measurement-unit"]').fill('in');
  await page.locator('[data-field="measurement-role"]').fill('ignored');
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-field="measurement-raw"]')).toHaveValue('');
  expect(
    requireOk(await repoCall(page, 'listObservations', { localRecordId }), 'after escape'),
  ).toHaveLength(1);
});

test('P2-05 missing bytes and unreadable PDF stay explicit', async ({ page }) => {
  await openOwnHub(page);
  await page.getByRole('button', { name: 'SKETCH / PHOTO', exact: true }).click();
  const [chooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: 'Attach JPEG or PNG' }).click(),
  ]);
  await chooser.setFiles({
    name: 'keep.png',
    mimeType: 'image/png',
    buffer: Buffer.from(PNG_FIXTURE.bytes),
  });
  await waitDisplayedImage(page);
  const localRecordId = await page.locator('[data-local-record-id]').getAttribute('data-local-record-id');
  const evidence = requireOk(
    await repoCall(page, 'listEvidence', { localRecordId }),
    'evidence',
  );
  requireOk(await repoCall(page, 'deleteBlob', { sha256: evidence[0].payload.sha256 }), 'delete');
  await page.locator('[data-display-type="image-png"]').click();
  await expect(page.locator('[data-source-status="missing"]')).toBeVisible();
  await expect(page.getByText(COPY.sourceUnavailable, { exact: true })).toBeVisible();

  await childBack(page);
  await page.getByRole('button', { name: 'DRAWING / PDF', exact: true }).click();
  const [pdfChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: 'Attach PDF' }).click(),
  ]);
  await pdfChooser.setFiles({
    name: 'broken.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from(MALFORMED_PDF_FIXTURE.bytes),
  });
  await expect(page.locator('[data-source-status="unreadable"]')).toBeVisible();
  await expect(page.getByText(COPY.originalRetained, { exact: true })).toBeVisible();
  const listed = requireOk(await repoCall(page, 'listEvidence', { localRecordId }), 'after pdf');
  expect(listed.some((entry) => entry.payload.originalFilename === 'broken.pdf')).toBe(true);
});

test('P2-07 unclassified need creates no parts', async ({ page }) => {
  await openOwnHub(page);
  await page.getByRole('button', { name: 'MEASUREMENTS', exact: true }).click();
  await page.locator('[data-field="typed-need"]').fill('something I cannot name yet');
  await page.getByRole('button', { name: COPY.typedNeedSubmit }).click();
  await expect(page.locator('[data-page-status]')).toHaveText(COPY.unclassifiedKept);
  await expect(page.locator('[data-no-parts]')).toBeVisible();
  const localRecordId = await page.locator('[data-local-record-id]').getAttribute('data-local-record-id');
  const candidate = requireOk(await repoCall(page, 'currentCandidate', { localRecordId }), 'cand');
  expect(candidate.payload.parts).toBeNull();
  expect(candidate.payload.mappings).toEqual([]);
});

test('P2-08 detach removes the source from the candidate and keeps history', async ({ page }) => {
  await openOwnHub(page);
  await page.getByRole('button', { name: 'MEASUREMENTS', exact: true }).click();
  await page.locator('[data-field="measurement-raw"]').fill('45');
  await page.locator('[data-field="measurement-unit"]').fill('in');
  await page.locator('[data-field="measurement-role"]').fill('opening width');
  await page.getByRole('button', { name: COPY.keepObservation }).click();
  await expect(page.locator('article[data-observation-id]')).toBeVisible();
  await page.getByRole('button', { name: COPY.detachSource }).click();
  await expect(page.locator('[data-page-status]')).toHaveText(COPY.detachKept);
  const localRecordId = await page.locator('[data-local-record-id]').getAttribute('data-local-record-id');
  const candidate = requireOk(await repoCall(page, 'currentCandidate', { localRecordId }), 'cand');
  expect(candidate.payload.activeEvidenceIds).toEqual([]);
  expect(candidate.payload.activeObservationIds).toEqual([]);
  expect(
    requireOk(await repoCall(page, 'listObservations', { localRecordId }), 'history'),
  ).toHaveLength(1);
});

test('M2-18 keyboard can keep a measurement and narrow screens stack source first', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await openOwnHub(page);
  const sourceBox = await page.locator('.source-pane').boundingBox();
  const candidateBox = await page.locator('.candidate-pane').boundingBox();
  expect(sourceBox.y).toBeLessThan(candidateBox.y);
  await page.locator('[data-intake-card="measurements"] .intake-open').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-child-panel="measurements"]')).toBeVisible();
  await page.locator('[data-field="measurement-raw"]').fill('45');
  await page.locator('[data-field="measurement-unit"]').fill('in');
  await page.locator('[data-field="measurement-role"]').fill('opening width');
  await page.locator('[data-field="measurement-role"]').press('Enter');
  await expect(page.locator('[data-interpreted="45"]')).toBeVisible();
});

test('unresolved observations cannot be used in the candidate from the UI', async ({ page }) => {
  await openOwnHub(page);
  await page.getByRole('button', { name: 'MEASUREMENTS', exact: true }).click();
  await page.locator('[data-field="measurement-raw"]').fill('45');
  await page.locator('[data-field="measurement-unit"]').fill('furlongs');
  await page.locator('[data-field="measurement-role"]').fill('opening width');
  await page.getByRole('button', { name: COPY.keepObservation }).click();
  await expect(page.locator('[data-page-status]')).toHaveText(COPY.unsupportedUnit);
  await expect(page.getByRole('button', { name: COPY.useInCandidate })).toHaveCount(0);
  const localRecordId = await page.locator('[data-local-record-id]').getAttribute('data-local-record-id');
  const observations = requireOk(
    await repoCall(page, 'listObservations', { localRecordId }),
    'unresolved obs',
  );
  expect(observations).toHaveLength(1);
  expect(observations[0].payload.unresolvedReason).toBe('unsupported-unit');
  expect(requireOk(await repoCall(page, 'currentCandidate', { localRecordId }), 'cand').payload.mappings).toEqual([]);
});

test('PDF page provenance is retained on Keep and mapped only by Use', async ({ page }) => {
  await openOwnHub(page);
  await page.getByRole('button', { name: 'DRAWING / PDF', exact: true }).click();
  const [pdfChooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: 'Attach PDF' }).click(),
  ]);
  await pdfChooser.setFiles({
    name: 'drawing.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from(PDF_FIXTURE.bytes),
  });
  await expect(page.locator('[data-pdf-viewer]')).toBeVisible();
  await expect(page.locator('[data-pdf-page]')).toContainText('Page 1 of');
  await expect(page.locator('[data-pdf-page-number]').first()).toHaveAttribute('data-pdf-page-number', '1');
  const evidenceId = await page.locator('[data-pdf-viewer]').getAttribute('data-evidence-id');
  const localRecordId = await page.locator('[data-local-record-id]').getAttribute('data-local-record-id');
  expect(
    requireOk(await repoCall(page, 'listObservations', { localRecordId }), 'viewing minted none'),
  ).toHaveLength(0);

  await childBack(page);
  await page.getByRole('button', { name: 'MEASUREMENTS', exact: true }).click();
  await expect(page.locator('[data-pdf-viewer]')).toBeVisible();
  await expect(page.locator('[data-pdf-page-number]').first()).toHaveAttribute('data-pdf-page-number', '1');
  await page.locator('[data-field="measurement-raw"]').fill('45');
  await page.locator('[data-field="measurement-unit"]').fill('in');
  await page.locator('[data-field="measurement-role"]').fill('opening width');
  await page.getByRole('button', { name: COPY.keepObservation }).click();
  await expect(page.getByText(COPY.notMapped, { exact: true })).toBeVisible();
  const observations = requireOk(
    await repoCall(page, 'listObservations', { localRecordId }),
    'pdf-backed obs',
  );
  expect(observations).toHaveLength(1);
  expect(observations[0].payload.evidenceId).toBe(evidenceId);
  expect(observations[0].payload.sourceLocation).toEqual({ evidenceId, page: 1 });
  expect(observations[0].payload.interpretedValue).toBe(45);
  expect(requireOk(await repoCall(page, 'currentCandidate', { localRecordId }), 'unmapped').payload.mappings).toEqual([]);
  await page.getByRole('button', { name: COPY.useInCandidate }).click();
  await expect(page.locator('[data-mapped-input="opening width"]')).toBeVisible();
  await expect(page.locator('[data-page-status]')).toHaveText(COPY.mappedAccepted);
  const candidate = requireOk(await repoCall(page, 'currentCandidate', { localRecordId }), 'mapped');
  expect(candidate.payload.mappings).toEqual([
    { observationId: observations[0].id, inputKey: 'opening width', status: 'accepted' },
  ]);
});

test('takeoff quantity unit ea is kept separately from dimensional text', async ({ page }) => {
  await openOwnHub(page);
  await page.getByRole('button', { name: 'TAKEOFF / CUT LIST', exact: true }).click();
  await page.locator('[data-field="takeoff-label"]').fill('Shelf blank');
  await page.locator('[data-field="takeoff-quantity"]').fill('2');
  await page.locator('[data-field="takeoff-unit"]').fill('ea');
  await page.locator('[data-field="takeoff-dimensions"]').fill('45 in × 11 in × 0.75 in');
  await page.locator('[data-field="takeoff-material"]').fill('pine');
  await page.getByRole('button', { name: COPY.keepTakeoffRow }).click();
  await expect(page.getByText(COPY.notMapped, { exact: true })).toBeVisible();
  const localRecordId = await page.locator('[data-local-record-id]').getAttribute('data-local-record-id');
  const observations = requireOk(
    await repoCall(page, 'listObservations', { localRecordId }),
    'takeoff obs',
  );
  expect(observations).toHaveLength(1);
  expect(observations[0].payload.interpretedUnit).toBe('ea');
  expect(observations[0].payload.takeoff.dimensions).toBe('45 in × 11 in × 0.75 in');
  expect(observations[0].payload.unresolvedReason).toBeNull();
  expect(requireOk(await repoCall(page, 'currentCandidate', { localRecordId }), 'cand').payload.parts).toBeNull();
});
