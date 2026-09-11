import { expect, test } from '@playwright/test';

import { CLASS_REFERENCES, GR_SOURCE, OWN_ENTRY } from '../../shared/contracts.mjs';
import { repoCall, requireOk } from '../helpers/browser-repo.mjs';

function now() {
  return '2026-09-10T23:00:00.000Z';
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function expectOpaqueUuid(value) {
  expect(value).toMatch(UUID_RE);
  expect(value.startsWith('candidate-')).toBe(false);
  expect(value.startsWith('event-')).toBe(false);
}

function expectIndependentIdentities(created) {
  expectOpaqueUuid(created.projectId);
  expectOpaqueUuid(created.candidateRevisionId);
  expectOpaqueUuid(created.eventId);
  expect(created.projectId).not.toBe(created.localRecordId);
  expect(created.candidateRevisionId).not.toBe(created.projectId);
  expect(created.candidateRevisionId).not.toBe(created.localRecordId);
  expect(created.eventId).not.toBe(created.projectId);
  expect(created.eventId).not.toBe(created.candidateRevisionId);
  expect(created.eventId).not.toBe(created.localRecordId);
  expect(created.candidate.id).toBe(created.candidateRevisionId);
  expect(created.currentHead).toBe(created.candidateRevisionId);
  expect(created.event.id).toBe(created.eventId);
}

test('B2-01 mapped and own creation each make one durable project', async ({ page }) => {
  await page.goto('/');
  const mapped = requireOk(
    await repoCall(page, 'createProject', {
      actionId: crypto.randomUUID(),
      entryMode: 'mapped',
      classId: CLASS_REFERENCES[0].classId,
      createdAt: now(),
      actorId: 'new',
    }),
    'mapped create',
  );
  const own = requireOk(
    await repoCall(page, 'createProject', {
      actionId: crypto.randomUUID(),
      entryMode: 'own',
      createdAt: now(),
      actorId: 'professional',
    }),
    'own create',
  );

  expect(mapped.status).toBe('committed');
  expect(own.status).toBe('committed');
  expectIndependentIdentities(mapped);
  expectIndependentIdentities(own);
  expect(mapped.localRecordId).not.toBe(own.localRecordId);
  expect(mapped.projectId).not.toBe(own.projectId);
  expect(mapped.classId).toBe('alcove-shelf-blanks');
  expect(own.classId).toBeNull();
  expect(mapped.candidate.payload.classReference.classId).toBe('alcove-shelf-blanks');
  expect(mapped.candidate.payload.classReference.classVersion).toBe('0.1-reference');
  expect(mapped.candidate.payload.classReference.ruleVersion).toBeNull();
  expect(mapped.candidate.payload.classReference.status).toBe('candidate-reference');
  expect(mapped.candidate.payload.classReference.storePath).toBe('unresolved');
  expect(mapped.candidate.payload.classReference.source.repository).toBe(GR_SOURCE.repository);
  expect(mapped.candidate.payload.classReference.source.pin).toBe(GR_SOURCE.pin);
  expect(mapped.candidate.payload.classReference.source.executable).toBe(false);
  expect(mapped.candidate.payload.classReference.source.authority).toBe(false);
  expect(mapped.candidate.payload.dimensions).toBeNull();
  expect(mapped.candidate.payload.parts).toBeNull();
  expect(mapped.candidate.payload.material).toBeNull();
  expect(own.candidate.payload.classReference).toBeNull();
  expect(own.candidate.payload.unresolved).toBe(true);
  expect(own.candidate.payload.parts).toBeNull();
  expect(OWN_ENTRY.source).toBeNull();

  const saved = requireOk(await repoCall(page, 'listSaved'), 'list');
  expect(saved).toHaveLength(2);
  expect(saved.every((project) => project.projectId !== project.localRecordId)).toBe(true);
});

test('B2-02 duplicate actionId returns the original committed identities', async ({ page }) => {
  await page.goto('/');
  const actionId = crypto.randomUUID();
  const first = requireOk(
    await repoCall(page, 'createProject', {
      actionId,
      entryMode: 'own',
      createdAt: now(),
    }),
    'first',
  );
  const second = requireOk(
    await repoCall(page, 'createProject', {
      actionId,
      entryMode: 'own',
      createdAt: now(),
    }),
    'second',
  );
  expect(second.status).toBe('idempotent');
  expect(second.localRecordId).toBe(first.localRecordId);
  expect(second.projectId).toBe(first.projectId);
  expect(second.currentHead).toBe(first.currentHead);
  expect(second.candidateRevisionId).toBe(first.candidateRevisionId);
  expect(second.eventId).toBe(first.eventId);
  expect(second.candidate.id).toBe(first.candidate.id);
  expectIndependentIdentities(second);
  const saved = requireOk(await repoCall(page, 'listSaved'), 'list');
  expect(saved).toHaveLength(1);
  expect(saved[0].localRecordId).toBe(first.localRecordId);
  expect(saved[0].projectId).toBe(first.projectId);
  expect(saved[0].currentHead).toBe(first.currentHead);
  const originalEvent = requireOk(
    await repoCall(page, 'record', {
      localRecordId: first.localRecordId,
      kind: 'event',
      id: first.eventId,
    }),
    'original event',
  );
  expect(originalEvent.id).toBe(first.eventId);
  const originalCandidate = requireOk(
    await repoCall(page, 'record', {
      localRecordId: first.localRecordId,
      kind: 'candidate',
      id: first.candidateRevisionId,
    }),
    'original candidate',
  );
  expect(originalCandidate.id).toBe(first.candidateRevisionId);
});

test('B2-03 later class start preserves the first project history', async ({ page }) => {
  await page.goto('/');
  const first = requireOk(
    await repoCall(page, 'createProject', {
      actionId: crypto.randomUUID(),
      entryMode: 'mapped',
      classId: CLASS_REFERENCES[0].classId,
      createdAt: now(),
    }),
    'first',
  );
  const second = requireOk(
    await repoCall(page, 'createProject', {
      actionId: crypto.randomUUID(),
      entryMode: 'own',
      createdAt: now(),
    }),
    'second',
  );
  const original = requireOk(
    await repoCall(page, 'project', { localRecordId: first.localRecordId }),
    'reload first',
  );
  expect(original.projectId).toBe(first.projectId);
  expect(original.projectId).not.toBe(original.localRecordId);
  expect(original.classId).toBe('alcove-shelf-blanks');
  expect(original.currentHead).toBe(first.currentHead);
  expect(original.entryMode).toBe('mapped');
  expect(second.localRecordId).not.toBe(first.localRecordId);
  expect(second.projectId).not.toBe(first.projectId);
  expect(second.entryMode).toBe('own');
  const saved = requireOk(await repoCall(page, 'listSaved'), 'list');
  expect(saved).toHaveLength(2);
});
