import { expect } from '@playwright/test';

import {
  ACTORS,
  ARCHIVE_FORMAT,
  ARCHIVE_VERSION,
  COPY,
  PUBLISHED_BOARD_SKU,
  REVIEW_RECORD_TYPES,
  STORE_PATHS,
  STORE_PIN,
} from '../../shared/contracts.mjs';
import { formatReturnedAmount } from '../../shared/store-present.mjs';
import { JPEG_FIXTURE } from '../fixtures/bytes.mjs';
import { repoCall, requireOk } from '../helpers/browser-repo.mjs';

export const STORE_IDLE = { timeout: 20_000 };

export const FORBIDDEN_PHYSICAL = Object.freeze([
  'production started',
  'work complete',
  'pickup ready',
  'machine authorized',
  'cycle start',
  'g-code',
  'workpacket',
]);

export function attachStoreObserver(page) {
  const jobs = [];
  page.on('request', (request) => {
    if (request.method() !== 'POST' || !request.url().includes(STORE_PATHS.job)) {
      return;
    }
    const entry = {
      url: request.url(),
      path: new URL(request.url()).pathname,
      body: null,
      response: null,
    };
    try {
      entry.body = request.postDataJSON();
    } catch {
      entry.body = request.postData();
    }
    jobs.push(entry);
    request
      .response()
      .then(async (response) => {
        if (!response) {
          return;
        }
        try {
          entry.status = response.status();
          entry.response = await response.json();
        } catch {
          entry.responseText = await response.text();
        }
      })
      .catch(() => {});
  });
  return {
    jobs,
    completed() {
      return jobs.filter((job) => job.response);
    },
    async waitForCount(count) {
      await expect.poll(() => jobs.filter((job) => job.response).length).toBe(count);
      return jobs.filter((job) => job.response);
    },
  };
}

export async function waitForStoreIdle(page, mode = 'compact') {
  const panel = page.locator(`[data-store-panel="${mode}"]`).first();
  await expect(panel).toBeVisible();
  await expect(panel).not.toHaveAttribute('data-pending', 'true', STORE_IDLE);
}

export async function goActorToBegin(page, actorId) {
  await page.goto('/');
  await page.getByRole('button', { name: ACTORS[actorId].label }).click();
  await expect(page.locator('[data-screen="orientation"]')).toBeVisible();
  await expect(page.locator('[data-actor]')).toHaveAttribute('data-actor', actorId);
  await page.getByRole('button', { name: COPY.next }).click();
  await expect(page.locator('[data-screen="begin"]')).toBeVisible();
}

export async function startOwnProject(page, actorId) {
  await goActorToBegin(page, actorId);
  await page.getByRole('button', { name: COPY.startOwn }).click();
  await expect(page.locator('[data-page="page2"]')).toBeVisible();
}

export async function openBoardChild(page) {
  await page.getByRole('button', { name: 'PICK A BOARD', exact: true }).click();
  await expect(page.locator('[data-child-panel="board"]')).toBeVisible();
}

export async function backToHub(page) {
  await page.locator('[data-action="back-to-hub"]').first().click();
  await expect(page.locator('[data-intake-grid]')).toBeVisible();
}

export async function applyLengthUi(page, raw, unit = 'in', { waitForIdle = true } = {}) {
  await page.locator('[data-field="board-length"]').fill(raw);
  await page.locator('[data-field="board-unit"]').fill(unit);
  await page.getByRole('button', { name: COPY.boardApply }).click();
  await expect(page.locator('[data-unapplied="board"]')).toBeHidden();
  await expect(page.locator('[data-candidate-view="true"]')).toBeVisible();
  const valid = await page.locator('[data-candidate-view="true"]').getAttribute('data-valid');
  if (waitForIdle && valid === 'true') {
    await waitForStoreIdle(page);
  }
  return valid === 'true';
}

export async function localRecordId(page) {
  return page.locator('[data-local-record-id]').getAttribute('data-local-record-id');
}

export async function listKind(page, id, kind) {
  return requireOk(await repoCall(page, 'listRecords', { localRecordId: id, kind }), kind);
}

export async function snapshot(page, id) {
  const project = requireOk(await repoCall(page, 'project', { localRecordId: id }), 'project');
  const candidate = requireOk(
    await repoCall(page, 'currentCandidate', { localRecordId: id }),
    'candidate',
  );
  const projection = requireOk(
    await repoCall(page, 'currentProjection', { localRecordId: id }),
    'projection',
  );
  const store = requireOk(await repoCall(page, 'currentStore', { localRecordId: id }), 'store');
  const reviews = requireOk(await repoCall(page, 'listReviews', { localRecordId: id }), 'reviews');
  const requests = await listKind(page, id, 'request');
  const responses = await listKind(page, id, 'response');
  const evidence = requireOk(
    await repoCall(page, 'listEvidence', { localRecordId: id }),
    'evidence',
  );
  const presentation = requireOk(
    await repoCall(page, 'loadReviewPresentation', { localRecordId: id }),
    'review presentation',
  );
  const events = await listKind(page, id, 'event');
  return {
    project,
    candidate,
    projection,
    store,
    reviews,
    requests,
    responses,
    evidence,
    presentation,
    events,
  };
}

export function envelopeOf(store) {
  return store?.response?.payload?.wrapperEnvelope ?? store?.response?.payload ?? {};
}

export function keptLengthFromWire(body) {
  return body?.payload?.line?.keptLength?.value ?? null;
}

export function assertPinnedStoreAnswer(envelope, keptLength) {
  expect(envelope.storePin, 'wrapper used the exact Store pin').toBe(STORE_PIN);
  expect(envelope.rawEvaluation?.status).toBe('SUPPORTABLE');
  expect(envelope.mappedCallInputs?.evaluation?.lines?.[0]?.storeSku).toBe(PUBLISHED_BOARD_SKU);
  expect(envelope.mappedCallInputs?.evaluation?.lines?.[0]?.qty).toBe(1);
  expect(envelope.mappedCallInputs?.evaluation?.lines?.[0]?.requiredOps).toEqual(['CROSSCUT']);
  expect(Number(envelope.mappedCallInputs?.evaluation?.lines?.[0]?.keptLengthIn)).toBe(
    Number(keptLength),
  );
  expect(Number(envelope.mappedCallInputs?.estimate?.pieces?.[0]?.keptLengthIn)).toBe(
    Number(keptLength),
  );
  expect(envelope.mappedCallInputs?.estimate?.pieces?.[0]?.widthIn).toBe(3.5);
  expect(envelope.rawOffering?.actualW).toBe(3.5);
  expect(envelope.rawEstimate?.status).toBe('BUDGETARY_ESTIMATE');
  expect(envelope.rawEstimate?.engine?.id).toBe('STB-STORE-ZERO-PRICE-1');
  expect(envelope.rawEstimate?.engine?.version).toBe('0.2.2');
  expect(envelope.rawEstimate?.cycle?.model).toBe('STB-D001-CYCLE-MODEL-S2-0.1');
  expect(envelope.attributedBasis?.envelope?.id).toBe('D001-STAGE2-ENVELOPE-0.2');
  expect(envelope.attributedBasis?.measured).toBe(false);
  expect(envelope.attributedBasis?.commissioned).toBe(false);
  expect(envelope.rawEstimate?.totals?.Q).not.toBe(0);
  expect(typeof envelope.rawEstimate?.totals?.Q).toBe('number');
}

export function assertCopiedQ(store, review, compact) {
  const envelope = envelopeOf(store);
  const q = envelope.rawEstimate?.totals?.Q;
  expect(q, 'Q came from returned rawEstimate').toEqual(expect.any(Number));
  expect(review?.payload?.estimateQ).toBe(q);
  expect(store.response.payload.rawEstimate.totals.Q).toBe(q);
  if (compact) {
    expect(compact).toBe(formatReturnedAmount(q));
  }
}

export async function attachJpegViaUi(page) {
  await page.getByRole('button', { name: 'SKETCH / PHOTO', exact: true }).click();
  await expect(page.locator('[data-child-panel="sketch"]')).toBeVisible();
  const [chooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: 'Attach JPEG or PNG' }).click(),
  ]);
  await chooser.setFiles({
    name: 'opening.jpg',
    mimeType: JPEG_FIXTURE.type,
    buffer: Buffer.from(JPEG_FIXTURE.bytes),
  });
  await expect(page.locator('[data-page-status]')).toHaveText(COPY.originalRetained);
  await backToHub(page);
}

export async function confirmDefinition(page) {
  await expect(page.locator('[data-review-actions="inline"]')).toHaveAttribute(
    'data-complete-supported',
    'true',
  );
  await page.getByRole('button', { name: COPY.reviewConfirm }).click();
  await expect(page.locator('[data-page="page7"]')).toBeVisible();
  await expect(page.locator('[data-result-retained]')).toHaveText(COPY.resultRetained);
  await expect(page.locator('[data-physical-outcome]')).toHaveAttribute(
    'data-physical-outcome',
    'absent',
  );
}

export async function assertNoFabricatedAuthority(page) {
  await expect(page.locator('[data-physical-outcome]')).toHaveAttribute(
    'data-physical-outcome',
    'absent',
  );
  await expect(page.locator('[data-pickup]')).toHaveAttribute('data-pickup', 'absent');
  const body = ((await page.locator('main').innerText()) ?? '').toLowerCase();
  for (const phrase of FORBIDDEN_PHYSICAL) {
    expect(body, `result/record must not claim ${phrase}`).not.toContain(phrase);
  }
  expect(body).toContain('no physical fabrication recorded');
}

export function assertReviewBindsStore(review, candidate, store) {
  expect(review.payload.type).toBe(REVIEW_RECORD_TYPES.DefinitionReviewRecorded);
  expect(review.payload.candidateRevisionId).toBe(candidate.id);
  expect(review.payload.projectionId).toBe(candidate.payload.projectionId);
  expect(review.payload.occurrenceIds).toEqual(candidate.payload.activeOccurrenceIds);
  expect(review.payload.definitionRevisionIds).toEqual([candidate.payload.definitionRevisionId]);
  expect(review.payload.requestId).toBe(store.request.id);
  expect(review.payload.attemptId).toBe(store.attempt.id);
  expect(review.payload.responseId).toBe(store.response.id);
  expect(review.payload.estimateAssociationId).toBe(store.response.payload.estimateAssociationId);
  expect(review.payload.storeDisposition).toBe('SUPPORTABLE');
  expect(review.payload.storePin).toBe(STORE_PIN);
  expect(review.payload.authority).toBe(false);
  expect(review.payload.commercial).toBe(false);
  expect(review.payload.physical).toBe(false);
  expect(review.payload.reviewDigest).toMatch(/^[0-9a-f]{64}$/i);
}

export async function currentQDisplay(page, mode = 'compact') {
  return page.locator(`[data-store-panel="${mode}"] [data-store-q]`).first().getAttribute('data-store-q');
}

export async function resumeSaved(page, actorId, id) {
  await goActorToBegin(page, actorId);
  await page.locator(`.resume-item[data-local-record-id="${id}"]`).click();
  await expect(page.locator('[data-page="page2"]')).toBeVisible();
  expect(await localRecordId(page)).toBe(id);
}

export function assertArchiveDocument(document, { projectId, namedHead }) {
  expect(document.manifest.format).toBe(ARCHIVE_FORMAT);
  expect(document.manifest.version).toBe(ARCHIVE_VERSION);
  expect(document.manifest.projectId).toBe(projectId);
  expect(document.manifest.namedHead).toBe(namedHead);
  expect(document.manifest.recordDigest).toMatch(/^[0-9a-f]{64}$/i);
  expect(Array.isArray(document.records)).toBe(true);
  expect(document.records.length).toBeGreaterThan(0);
  expect(document.project.projectId).toBe(projectId);
}

export async function exportViaUi(page) {
  await page.locator('[data-nav-page="record"]').click();
  await expect(page.locator('[data-page="page8"]')).toBeVisible();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: COPY.recordExport }).click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/\.stb\.json$/);
  await expect(page.locator('[data-record-status]')).toHaveText(COPY.recordExportReady);
  const downloadPath = await download.path();
  const { readFileSync } = await import('node:fs');
  const json = readFileSync(downloadPath, 'utf8');
  return {
    filename: download.suggestedFilename(),
    json,
    document: JSON.parse(json),
  };
}

export async function importSeparateCopyViaUi(page, exported) {
  const [chooser] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByRole('button', { name: COPY.recordImport }).click(),
  ]);
  await chooser.setFiles({
    name: exported.filename,
    mimeType: 'application/json',
    buffer: Buffer.from(exported.json),
  });
  await expect(page.locator('[data-collision-dialog]')).toBeVisible();
  await expect(page.locator('[data-collision-dialog]')).toContainText(COPY.recordCollision);
  await page.getByRole('button', { name: COPY.recordImportCopy }).click();
  await expect(page.locator('[data-page="page8"]')).toBeVisible();
  await expect(page.locator('[data-imported="true"]')).toBeVisible();
}

export function assertObserverJob(job, { keptLength, candidateRevisionId }) {
  expect(job.path).toBe(STORE_PATHS.job);
  expect(job.body.expectedStorePin).toBe(STORE_PIN);
  expect(job.body.candidateRevisionId).toBe(candidateRevisionId);
  expect(keptLengthFromWire(job.body)).toBe(String(keptLength));
  expect(job.body.payload.line.storeSku).toBe(PUBLISHED_BOARD_SKU);
  expect(job.body.payload.line.quantity).toBe(1);
  expect(job.body.payload.line.requiredOps).toEqual(['CROSSCUT']);
  expect(job.response.storePin).toBe(STORE_PIN);
  expect(job.response.responseId).toBeTruthy();
  expect(job.response.rawEstimate.totals.Q).toEqual(expect.any(Number));
}

export async function blobBytes(page, sha256) {
  return requireOk(await repoCall(page, 'blob', { sha256 }), 'blob');
}

export async function tabUntilFocused(page, locator, { max = 24 } = {}) {
  for (let i = 0; i < max; i += 1) {
    if (await locator.evaluate((el) => el === document.activeElement).catch(() => false)) {
      return;
    }
    await page.keyboard.press('Tab');
  }
  await expect(locator).toBeFocused();
}
