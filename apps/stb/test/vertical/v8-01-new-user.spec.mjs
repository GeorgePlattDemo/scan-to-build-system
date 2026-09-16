import { expect, test } from '@playwright/test';

import { COPY, FIXED_ORIGIN, REVIEW_RECORD_TYPES, STORE_PIN } from '../../shared/contracts.mjs';
import { sha256Hex } from '../../shared/canonical.mjs';
import { asArray, JPEG_FIXTURE } from '../fixtures/bytes.mjs';
import {
  launchPersistentProfile,
  makeProfileDir,
  removeProfileDir,
} from '../helpers/persistent-browser.mjs';
import { repoCall, requireOk } from '../helpers/browser-repo.mjs';
import {
  applyLengthUi,
  assertArchiveDocument,
  assertCopiedQ,
  assertNoFabricatedAuthority,
  assertObserverJob,
  assertPinnedStoreAnswer,
  assertReviewBindsStore,
  attachJpegViaUi,
  attachStoreObserver,
  backToHub,
  blobBytes,
  confirmDefinition,
  currentQDisplay,
  envelopeOf,
  exportViaUi,
  goActorToBegin,
  importSeparateCopyViaUi,
  localRecordId,
  openBoardChild,
  snapshot,
  startOwnProject,
  waitForStoreIdle,
} from './helpers.mjs';

test('V8-01 NEW USER complete real path with 45→46, reopen, export/import', async () => {
  test.setTimeout(180_000);
  const userDataDir = makeProfileDir();
  const jpegHash = await sha256Hex(JPEG_FIXTURE.bytes);
  const jpegBytes = asArray(JPEG_FIXTURE.bytes);
  let context;
  const ledger = {};

  try {
    context = await launchPersistentProfile(userDataDir);
    let page = await context.newPage();
    const observer = attachStoreObserver(page);

    await test.step('NEW USER orientation through Start Your Own and retained source', async () => {
      await startOwnProject(page, 'new');
      await attachJpegViaUi(page);
      await openBoardChild(page);
    });

    const id = await localRecordId(page);
    ledger.localRecordId = id;
    const created = requireOk(await repoCall(page, 'project', { localRecordId: id }));
    ledger.projectId = created.projectId;

    await test.step('45-inch Board asks the actual pinned Store and is reviewed', async () => {
      await applyLengthUi(page, '45');
      await observer.waitForCount(1);
      const at45 = await snapshot(page, id);
      ledger.candidate45 = at45.candidate.id;
      ledger.definition45 = at45.candidate.payload.definitionRevisionId;
      ledger.occurrenceId = at45.candidate.payload.activeOccurrenceIds[0];
      ledger.request45 = at45.store.request.id;
      ledger.response45 = at45.store.response.id;
      ledger.q45 = envelopeOf(at45.store).rawEstimate.totals.Q;
      ledger.cycle45 = envelopeOf(at45.store).rawEstimate.cycle.T_job_min;
      expect(at45.store.current).toBe(true);
      expect(at45.projection.payload.geometry.lengthCanonical).toBe('45');
      expect(at45.projection.payload.occurrenceId).toBe(ledger.occurrenceId);
      assertPinnedStoreAnswer(envelopeOf(at45.store), 45);
      expect(envelopeOf(at45.store).rawEstimate.totals.material).toBeCloseTo(3.13, 2);
      expect(envelopeOf(at45.store).rawEstimate.totals.Q).toBeCloseTo(53.94, 2);
      expect(envelopeOf(at45.store).rawEstimate.cycle.T_job_min).toBeCloseTo(9.486, 3);
      assertObserverJob(observer.jobs[0], {
        keptLength: '45',
        candidateRevisionId: at45.candidate.id,
      });
      expect(observer.jobs[0].response.responseId).toBe(at45.store.response.id);
      expect(await currentQDisplay(page)).toBe(`$${Number(ledger.q45).toFixed(2)}`);

      await page.getByRole('button', { name: COPY.storeInspect }).first().click();
      await expect(page.locator('[data-page="page5"]')).toBeVisible();
      const full = page.locator('[data-store-panel="full"]');
      await expect(full).toHaveAttribute('data-current', 'true');
      await expect(full.locator('[data-store-pin]')).toContainText(STORE_PIN);
      await expect(full.locator('[data-store-actual-w]')).toContainText('3.5');
      await page.locator('[data-action="back-to-hub"]').first().click();
      await openBoardChild(page);
      await waitForStoreIdle(page);

      await confirmDefinition(page);
      await assertNoFabricatedAuthority(page);
      const reviewed = await snapshot(page, id);
      expect(reviewed.reviews).toHaveLength(1);
      ledger.review45 = reviewed.reviews[0].id;
      assertReviewBindsStore(reviewed.reviews[0], at45.candidate, at45.store);
      assertCopiedQ(at45.store, reviewed.reviews[0], await currentQDisplay(page));
      expect(reviewed.presentation.currentReview.id).toBe(ledger.review45);
    });

    await test.step('46-inch revision keeps the occurrence and retires 45 Store/review', async () => {
      await backToHub(page);
      await openBoardChild(page);
      await applyLengthUi(page, '46', 'in', { waitForIdle: false });
      const afterCommit = await snapshot(page, id);
      expect(afterCommit.candidate.id).not.toBe(ledger.candidate45);
      expect(afterCommit.candidate.payload.definitionRevisionId).not.toBe(ledger.definition45);
      expect(afterCommit.candidate.payload.activeOccurrenceIds).toEqual([ledger.occurrenceId]);
      expect(afterCommit.projection.payload.geometry.lengthCanonical).toBe('46');
      expect(afterCommit.presentation.currentReview).toBeNull();
      const historical45Review = afterCommit.reviews.find((record) => record.id === ledger.review45);
      expect(historical45Review).toBeTruthy();
      expect(afterCommit.presentation.historicalReviews.some((record) => record.id === ledger.review45)).toBe(
        true,
      );
      if (afterCommit.store.status === 'pending') {
        expect(afterCommit.store.current).toBe(false);
      }
      await waitForStoreIdle(page);
      await observer.waitForCount(2);
      const at46 = await snapshot(page, id);
      ledger.candidate46 = at46.candidate.id;
      ledger.definition46 = at46.candidate.payload.definitionRevisionId;
      ledger.request46 = at46.store.request.id;
      ledger.response46 = at46.store.response.id;
      ledger.q46 = envelopeOf(at46.store).rawEstimate.totals.Q;
      ledger.cycle46 = envelopeOf(at46.store).rawEstimate.cycle.T_job_min;
      expect(at46.store.current).toBe(true);
      expect(at46.store.request.id).not.toBe(ledger.request45);
      expect(at46.store.response.id).not.toBe(ledger.response45);
      expect(ledger.cycle46).not.toBe(ledger.cycle45);
      expect(at46.store.request.payload.payload.line.keptLength.value).toBe('46');
      assertPinnedStoreAnswer(envelopeOf(at46.store), 46);
      assertObserverJob(observer.jobs[1], {
        keptLength: '46',
        candidateRevisionId: at46.candidate.id,
      });
      expect(observer.jobs[1].response.responseId).toBe(at46.store.response.id);
      const request45 = at46.requests.find((record) => record.id === ledger.request45);
      expect(request45).toBeTruthy();
      expect(at46.store.request.id).toBe(ledger.request46);
      await expect(page.locator('[data-store-panel="compact"]')).toHaveAttribute('data-current', 'true');
      await expect(page.locator('[data-part-summary]')).toHaveAttribute('data-finished-length', '46');
      await expect(page.locator('[data-part-schematic]')).toHaveAttribute('data-finished-length', '46');

      await confirmDefinition(page);
      const reviewed46 = await snapshot(page, id);
      expect(reviewed46.reviews).toHaveLength(2);
      const currentReview = reviewed46.reviews.find((record) => record.id !== ledger.review45);
      ledger.review46 = currentReview.id;
      assertReviewBindsStore(currentReview, at46.candidate, at46.store);
      assertCopiedQ(at46.store, currentReview, await currentQDisplay(page));
      expect(reviewed46.presentation.currentReview.id).toBe(ledger.review46);
      expect(reviewed46.presentation.historicalReviews.some((record) => record.id === ledger.review45)).toBe(
        true,
      );
      await assertNoFabricatedAuthority(page);
      await expect(page.locator('[data-result-review]')).toHaveAttribute(
        'data-result-review',
        REVIEW_RECORD_TYPES.DefinitionReviewRecorded,
      );
    });

    await test.step('owner record agrees with Result on current identities', async () => {
      await page.locator('[data-nav-page="record"]').click();
      await expect(page.locator('[data-page="page8"]')).toBeVisible();
      await expect(page.locator('[data-current-head]')).toHaveAttribute(
        'data-current-head',
        ledger.candidate46,
      );
      await expect(page.locator(`[data-record-review="${ledger.review46}"]`)).toHaveAttribute(
        'data-review-current',
        'true',
      );
      await expect(page.locator(`[data-record-review="${ledger.review45}"]`)).toHaveAttribute(
        'data-review-current',
        'false',
      );
      await expect(page.locator('[data-store-current="true"]')).toBeVisible();
      const evidence = requireOk(await repoCall(page, 'listEvidence', { localRecordId: id }));
      expect(evidence[0].payload.sha256).toBe(jpegHash);
      const retained = await blobBytes(page, jpegHash);
      expect(retained.status).toBe('retained');
      expect(retained.bytes).toEqual(jpegBytes);
      ledger.sourceSha256 = jpegHash;
    });

    const requestCountBeforeClose = (await snapshot(page, id)).requests.length;
    await context.close();
    context = null;

    await test.step('normal close/reopen retains current local applicability and original bytes', async () => {
      context = await launchPersistentProfile(userDataDir);
      page = await context.newPage();
      await page.goto(FIXED_ORIGIN);
      await goActorToBegin(page, 'new');
      await page.locator(`.resume-item[data-local-record-id="${id}"]`).click();
      await expect(page.locator('main[data-screen="workstreams"]')).toBeVisible();
      await page.getByRole('button', { name: COPY.openProjectDefinition }).click();
      await expect(page.locator('[data-page="page2"]')).toBeVisible();
      expect(await localRecordId(page)).toBe(id);
      await openBoardChild(page);
      await waitForStoreIdle(page);
      const reopened = await snapshot(page, id);
      expect(reopened.project.projectId).toBe(ledger.projectId);
      expect(reopened.project.localRecordId).toBe(ledger.localRecordId);
      expect(reopened.candidate.id).toBe(ledger.candidate46);
      expect(reopened.candidate.payload.definitionRevisionId).toBe(ledger.definition46);
      expect(reopened.candidate.payload.activeOccurrenceIds).toEqual([ledger.occurrenceId]);
      expect(reopened.store.current).toBe(true);
      expect(reopened.store.imported).not.toBe(true);
      expect(reopened.store.request.id).toBe(ledger.request46);
      expect(reopened.store.response.id).toBe(ledger.response46);
      expect(reopened.presentation.currentReview.id).toBe(ledger.review46);
      expect(reopened.requests).toHaveLength(requestCountBeforeClose);
      const retained = await blobBytes(page, jpegHash);
      expect(retained.status).toBe('retained');
      expect(retained.bytes).toEqual(jpegBytes);
      expect(await sha256Hex(Uint8Array.from(retained.bytes))).toBe(jpegHash);
    });

    await test.step('export/import preserves history as an inert snapshot', async () => {
      const exported = await exportViaUi(page);
      assertArchiveDocument(exported.document, {
        projectId: ledger.projectId,
        namedHead: ledger.candidate46,
      });
      const blob = exported.document.evidenceBlobs[jpegHash];
      expect(blob).toBeTruthy();
      expect(exported.document.records.some((record) => record.id === ledger.review45)).toBe(true);
      expect(exported.document.records.some((record) => record.id === ledger.review46)).toBe(true);
      expect(exported.document.records.some((record) => record.id === ledger.request45)).toBe(true);
      expect(exported.document.records.some((record) => record.id === ledger.request46)).toBe(true);

      const importObserver = attachStoreObserver(page);
      await importSeparateCopyViaUi(page, exported);
      const importedId = await localRecordId(page);
      expect(importedId).not.toBe(id);
      ledger.importedLocalRecordId = importedId;
      ledger.archiveId = exported.document.manifest.archiveId;

      const imported = await snapshot(page, importedId);
      expect(imported.project.projectId).toBe(ledger.projectId);
      expect(imported.project.imported).toBe(true);
      expect(imported.project.localRecordId).toBe(importedId);
      expect(imported.candidate.payload.activeOccurrenceIds).toEqual([ledger.occurrenceId]);
      expect(imported.candidate.payload.definitionRevisionId).toBe(ledger.definition46);
      const importedReviews = imported.reviews.filter((record) => record.imported === true);
      expect(importedReviews.map((record) => record.id).sort()).toEqual(
        [ledger.review45, ledger.review46].sort(),
      );
      expect(imported.requests.some((record) => record.id === ledger.request45 && record.imported === true)).toBe(
        true,
      );
      expect(imported.requests.some((record) => record.id === ledger.request46 && record.imported === true)).toBe(
        true,
      );
      const importedBytes = await blobBytes(page, jpegHash);
      expect(importedBytes.status).toBe('retained');
      expect(importedBytes.bytes).toEqual(jpegBytes);

      await expect.poll(async () => {
        const now = await snapshot(page, importedId);
        return now.presentation.currentReview === null;
      }).toBe(true);

      await page.getByRole('button', { name: COPY.recordResume }).click();
      await expect(page.locator('[data-screen="workstreams"]')).toBeVisible();
      await page.getByRole('button', { name: COPY.openProjectDefinition }).click();
      await expect(page.locator('[data-page="page2"]')).toBeVisible();
      await openBoardChild(page);
      await waitForStoreIdle(page);
      await importObserver.waitForCount(1);
      const afterLocal = await snapshot(page, importedId);
      expect(afterLocal.store.current).toBe(true);
      expect(afterLocal.store.imported).not.toBe(true);
      expect(afterLocal.store.request.id).not.toBe(ledger.request45);
      expect(afterLocal.store.request.id).not.toBe(ledger.request46);
      expect(afterLocal.store.request.imported).not.toBe(true);
      expect(afterLocal.presentation.currentReview).toBeNull();
      expect(
        afterLocal.reviews.every(
          (record) => record.imported === true || record.id !== afterLocal.presentation.currentReview?.id,
        ),
      ).toBe(true);
      assertPinnedStoreAnswer(envelopeOf(afterLocal.store), 46);
      assertObserverJob(importObserver.jobs[0], {
        keptLength: '46',
        candidateRevisionId: afterLocal.candidate.id,
      });
      ledger.postImportRequest = afterLocal.store.request.id;
      ledger.postImportResponse = afterLocal.store.response.id;

      await confirmDefinition(page);
      const afterReview = await snapshot(page, importedId);
      const localReview = afterReview.reviews.find((record) => record.imported !== true);
      expect(localReview).toBeTruthy();
      expect(afterReview.presentation.currentReview.id).toBe(localReview.id);
      assertReviewBindsStore(localReview, afterLocal.candidate, afterLocal.store);
      expect(afterReview.presentation.historicalReviews.some((record) => record.id === ledger.review46)).toBe(
        true,
      );
      await assertNoFabricatedAuthority(page);
      await page.locator('[data-nav-page="record"]').click();
      await expect(page.locator(`[data-record-review="${localReview.id}"]`)).toHaveAttribute(
        'data-review-current',
        'true',
      );
      await expect(page.locator(`[data-record-review="${ledger.review46}"]`)).toHaveAttribute(
        'data-review-current',
        'false',
      );
      ledger.postImportReview = localReview.id;
    });

    expect(ledger.occurrenceId).toBeTruthy();
    expect(ledger.candidate45).not.toBe(ledger.candidate46);
    expect(ledger.definition45).not.toBe(ledger.definition46);
    expect(ledger.request45).not.toBe(ledger.request46);
    expect(ledger.review45).not.toBe(ledger.review46);
    expect(ledger.importedLocalRecordId).not.toBe(ledger.localRecordId);
    expect(ledger.postImportRequest).not.toBe(ledger.request46);
    expect(ledger.postImportReview).not.toBe(ledger.review46);
  } finally {
    if (context) {
      await context.close();
    }
    removeProfileDir(userDataDir);
  }
});
