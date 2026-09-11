import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ARCHIVE_FORMAT,
  ARCHIVE_VERSION,
  COPY,
} from '../../shared/contracts.mjs';
import {
  ArchiveError,
  buildArchiveDocument,
  computeRecordDigest,
  parseAndValidateArchive,
  serializeArchive,
} from '../../shared/archive-format.mjs';

function projectFixture(overrides = {}) {
  return {
    schemaVersion: 1,
    localRecordId: 'ns-1',
    projectId: 'proj-1',
    currentHead: 'cand-1',
    eventSequence: 1,
    createdAt: '2026-09-11T00:00:00.000Z',
    updatedAt: '2026-09-11T00:00:00.000Z',
    title: 'Untitled project',
    entryMode: 'own',
    classId: null,
    classVersion: null,
    ...overrides,
  };
}

function candidateRecord(overrides = {}) {
  return {
    schemaVersion: 1,
    localRecordId: 'ns-1',
    projectId: 'proj-1',
    kind: 'candidate',
    id: 'cand-1',
    createdAt: '2026-09-11T00:00:00.000Z',
    payload: { unresolved: true, originalNeed: 'keep this text' },
    ...overrides,
  };
}

async function archiveDocument(overrides = {}) {
  return buildArchiveDocument({
    archiveId: 'arch-1',
    exportedAt: '2026-09-11T00:00:00.000Z',
    project: projectFixture(overrides.project),
    records: overrides.records ?? [candidateRecord()],
    blobs: overrides.blobs ?? {},
    missingEvidence: overrides.missingEvidence ?? [],
  });
}

async function parseJson(document) {
  const { json } = serializeArchive(document);
  return parseAndValidateArchive(json, { serializedBytes: json.length });
}

test('P8-04 unknown archive format and version are rejected', async () => {
  const document = await archiveDocument();
  document.manifest.format = 'stb-work-packet';
  await assert.rejects(() => parseJson(document), (error) => {
    assert.equal(error instanceof ArchiveError, true);
    assert.equal(error.code, 'unsupported-format');
    return true;
  });
  const versioned = await archiveDocument();
  versioned.manifest.version = 2;
  await assert.rejects(() => parseJson(versioned), (error) => {
    assert.equal(error.code, 'unsupported-version');
    return true;
  });
});

test('P8-04 unknown class remains inspectable and is not silently migrated', async () => {
  const document = await archiveDocument({
    project: { classId: 'future-unbundled-class', classVersion: '9.9' },
  });
  document.manifest.recordDigest = await computeRecordDigest(document.project, document.records);
  document.manifest.classId = 'future-unbundled-class';
  document.manifest.classVersion = '9.9';
  const parsed = await parseJson(document);
  assert.equal(parsed.unknownClass, true);
  assert.equal(parsed.document.project.classId, 'future-unbundled-class');
});

test('M2-06/T08 corrupt hash, duplicate id, cycle, unresolved link, and active fields are rejected', async () => {
  const text = new TextEncoder().encode('typed original');
  const sha256 = '0'.repeat(64);
  const withBlob = await archiveDocument({
    blobs: {
      [sha256]: { bytes: text, size: text.byteLength, type: 'text/plain' },
    },
  });
  await assert.rejects(() => parseJson(withBlob), (error) => {
    assert.equal(error.code, 'hash-mismatch');
    return true;
  });

  const duplicate = await archiveDocument({
    records: [candidateRecord(), candidateRecord({ payload: { other: true } })],
  });
  await assert.rejects(() => parseJson(duplicate), (error) => {
    assert.equal(error.code, 'duplicate-id');
    return true;
  });

  const cycle = await archiveDocument({
    records: [
      candidateRecord({ parentKind: 'candidate', parentId: 'cand-2' }),
      candidateRecord({ id: 'cand-2', parentKind: 'candidate', parentId: 'cand-1' }),
    ],
  });
  cycle.manifest.recordDigest = await computeRecordDigest(cycle.project, cycle.records);
  cycle.manifest.recordCount = 2;
  await assert.rejects(() => parseJson(cycle), (error) => {
    assert.equal(error.code, 'parent-cycle');
    return true;
  });

  const unresolved = await archiveDocument({
    records: [candidateRecord({ parentKind: 'candidate', parentId: 'missing-parent' })],
  });
  unresolved.manifest.recordDigest = await computeRecordDigest(
    unresolved.project,
    unresolved.records,
  );
  await assert.rejects(() => parseJson(unresolved), (error) => {
    assert.equal(error.code, 'unresolved-link');
    return true;
  });

  const active = await archiveDocument();
  active.records[0].authorization = { token: 'live' };
  active.manifest.recordDigest = await computeRecordDigest(active.project, active.records);
  await assert.rejects(() => parseJson(active), (error) => {
    assert.equal(error.code, 'active-schema');
    return true;
  });

  const extra = await archiveDocument();
  extra.rules = { execute: true };
  await assert.rejects(() => parseJson(extra), (error) => {
    assert.equal(error.code, 'forbidden-field');
    return true;
  });
});

test('P8-05 nested historical claims remain parseable and do not become live schema', async () => {
  const document = await archiveDocument({
    records: [
      candidateRecord({
        payload: {
          unresolved: true,
          authorization: { verified: true, physical: 'complete' },
          gateResult: 'PASS',
        },
      }),
    ],
  });
  const parsed = await parseJson(document);
  assert.equal(parsed.document.records[0].payload.authorization.verified, true);
  assert.equal(Object.prototype.hasOwnProperty.call(parsed.document.records[0], 'authorization'), false);
  assert.equal(COPY.recordNotCurrent.includes('historical'), true);
});

test('tampered recordDigest is rejected', async () => {
  const document = await archiveDocument();
  document.records[0].payload = { unresolved: false, mutated: true };
  await assert.rejects(() => parseJson(document), (error) => {
    assert.equal(error.code, 'tampered-digest');
    return true;
  });
});

test('malformed JSON and invalid base64 fail closed', async () => {
  await assert.rejects(() => parseAndValidateArchive('{not json'), (error) => {
    assert.equal(error.code, 'malformed-json');
    return true;
  });
  const document = await archiveDocument();
  document.evidenceBlobs = {
    abc: { base64: '@@@', size: 1, type: 'text/plain' },
  };
  await assert.rejects(() => parseJson(document), (error) => {
    assert.equal(error.code, 'invalid-base64');
    return true;
  });
});

test('archive format constants stay on the inert owner-record contract', () => {
  assert.equal(ARCHIVE_FORMAT, 'stb-owner-archive');
  assert.equal(ARCHIVE_VERSION, 1);
  assert.equal(COPY.recordHeading, 'Keep your project record');
  assert.equal(COPY.recordOwnerArchive.includes('production packet'), true);
  assert.equal(/workpacket/i.test(COPY.recordOwnerArchive), false);
});
