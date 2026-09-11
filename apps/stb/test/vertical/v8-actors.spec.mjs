import { expect, test } from '@playwright/test';

import { ACTOR_CARD_ORDER, INTAKE_CARDS } from '../../shared/contracts.mjs';
import {
  applyLengthUi,
  assertCopiedQ,
  assertNoFabricatedAuthority,
  assertObserverJob,
  assertPinnedStoreAnswer,
  assertReviewBindsStore,
  attachStoreObserver,
  backToHub,
  confirmDefinition,
  currentQDisplay,
  envelopeOf,
  goActorToBegin,
  localRecordId,
  openBoardChild,
  resumeSaved,
  snapshot,
  startOwnProject,
  waitForStoreIdle,
} from './helpers.mjs';

async function runBoundedActorPath(page, actorId) {
  const observer = attachStoreObserver(page);
  await startOwnProject(page, actorId);
  const names = await page.locator('[data-intake-card] .intake-open').allTextContents();
  expect(names).toEqual(ACTOR_CARD_ORDER[actorId].map((id) => INTAKE_CARDS.find((card) => card.id === id).name));
  await openBoardChild(page);
  const id = await localRecordId(page);
  await applyLengthUi(page, '45');
  await observer.waitForCount(1);
  const at45 = await snapshot(page, id);
  expect(at45.store.current).toBe(true);
  assertPinnedStoreAnswer(envelopeOf(at45.store), 45);
  assertObserverJob(observer.jobs[0], {
    keptLength: '45',
    candidateRevisionId: at45.candidate.id,
  });
  const occurrenceId = at45.candidate.payload.activeOccurrenceIds[0];
  const definition45 = at45.candidate.payload.definitionRevisionId;
  await confirmDefinition(page);
  const reviewed45 = await snapshot(page, id);
  assertReviewBindsStore(reviewed45.reviews[0], at45.candidate, at45.store);
  assertCopiedQ(at45.store, reviewed45.reviews[0], await currentQDisplay(page));
  await assertNoFabricatedAuthority(page);

  await backToHub(page);
  await openBoardChild(page);
  await applyLengthUi(page, '46');
  await observer.waitForCount(2);
  const at46 = await snapshot(page, id);
  expect(at46.candidate.payload.activeOccurrenceIds).toEqual([occurrenceId]);
  expect(at46.candidate.payload.definitionRevisionId).not.toBe(definition45);
  expect(at46.store.current).toBe(true);
  expect(at46.store.request.id).not.toBe(at45.store.request.id);
  expect(envelopeOf(at46.store).rawEstimate.cycle.T_job_min).not.toBe(
    envelopeOf(at45.store).rawEstimate.cycle.T_job_min,
  );
  expect(at46.store.request.payload.payload.line.keptLength.value).toBe('46');
  assertPinnedStoreAnswer(envelopeOf(at46.store), 46);
  assertObserverJob(observer.jobs[1], {
    keptLength: '46',
    candidateRevisionId: at46.candidate.id,
  });
  expect(at46.presentation.currentReview).toBeNull();
  await confirmDefinition(page);
  const reviewed46 = await snapshot(page, id);
  const current = reviewed46.presentation.currentReview;
  expect(current.id).not.toBe(reviewed45.reviews[0].id);
  assertReviewBindsStore(current, at46.candidate, at46.store);
  expect(reviewed46.presentation.historicalReviews.some((record) => record.id === reviewed45.reviews[0].id)).toBe(
    true,
  );
  return {
    actorId,
    localRecordId: id,
    projectId: at45.project.projectId,
    occurrenceId,
    candidate45: at45.candidate.id,
    candidate46: at46.candidate.id,
    request45: at45.store.request.id,
    request46: at46.store.request.id,
    response45: at45.store.response.id,
    response46: at46.store.response.id,
    review45: reviewed45.reviews[0].id,
    review46: current.id,
    projection46: at46.candidate.payload.projectionId,
    demandSignature46: at46.store.request.payload.demandSignature,
  };
}

test('V8-02 RETURNING USER reaches the same bounded architecture', async ({ page }) => {
  const path = await runBoundedActorPath(page, 'returning');
  expect(path.occurrenceId).toBeTruthy();
  expect(path.candidate45).not.toBe(path.candidate46);
  expect(path.request45).not.toBe(path.request46);
});

test('V8-03 PROFESSIONAL reaches the same bounded architecture', async ({ page }) => {
  const path = await runBoundedActorPath(page, 'professional');
  expect(path.occurrenceId).toBeTruthy();
  expect(path.candidate45).not.toBe(path.candidate46);
  expect(path.request45).not.toBe(path.request46);
});

test('V8-04 same saved project is unchanged under all actor priorities', async ({ page }) => {
  const created = await runBoundedActorPath(page, 'new');
  const identities = [];
  for (const actorId of ['new', 'returning', 'professional']) {
    await resumeSaved(page, actorId, created.localRecordId);
    expect(await page.locator('[data-actor]').getAttribute('data-actor')).toBe(actorId);
    const names = await page.locator('[data-intake-card] .intake-open').allTextContents();
    expect(names).toEqual(ACTOR_CARD_ORDER[actorId].map((id) => INTAKE_CARDS.find((card) => card.id === id).name));
    await openBoardChild(page);
    await waitForStoreIdle(page);
    const now = await snapshot(page, created.localRecordId);
    identities.push({
      actorId,
      projectId: now.project.projectId,
      localRecordId: now.project.localRecordId,
      candidate: now.candidate.id,
      projection: now.candidate.payload.projectionId,
      occurrence: now.candidate.payload.activeOccurrenceIds[0],
      request: now.store.request.id,
      response: now.store.response.id,
      review: now.presentation.currentReview.id,
      demandSignature: now.store.request.payload.demandSignature,
    });
    expect(now.store.current).toBe(true);
    expect(now.candidate.id).toBe(created.candidate46);
    expect(now.store.request.id).toBe(created.request46);
    expect(now.presentation.currentReview.id).toBe(created.review46);
  }
  expect(new Set(identities.map((entry) => entry.projectId)).size).toBe(1);
  expect(new Set(identities.map((entry) => entry.localRecordId)).size).toBe(1);
  expect(new Set(identities.map((entry) => entry.candidate)).size).toBe(1);
  expect(new Set(identities.map((entry) => entry.projection)).size).toBe(1);
  expect(new Set(identities.map((entry) => entry.occurrence)).size).toBe(1);
  expect(new Set(identities.map((entry) => entry.request)).size).toBe(1);
  expect(new Set(identities.map((entry) => entry.response)).size).toBe(1);
  expect(new Set(identities.map((entry) => entry.review)).size).toBe(1);
  expect(new Set(identities.map((entry) => entry.demandSignature)).size).toBe(1);
  expect(identities.map((entry) => entry.actorId)).toEqual(['new', 'returning', 'professional']);
});
