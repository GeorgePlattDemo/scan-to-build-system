import {
  ARCHIVE_FILENAME_SUFFIX,
  ARCHIVE_MIME,
  MAX_ARCHIVE_RECORDS,
} from '/shared/contracts.mjs';
import {
  ArchiveError,
  buildArchiveDocument,
  parseAndValidateArchive,
  serializeArchive,
} from '/shared/archive-format.mjs';
import {
  RepositoryError,
  importProjectNamespace,
  readConsistentProjectSnapshot,
} from '/data/repository.mjs';

export { ArchiveError };

function failed(error, fallbackCode) {
  return {
    status: 'failed',
    code: error.code ?? fallbackCode,
    message: error.message ?? String(error),
  };
}

export async function exportOwnerArchive(localRecordId, { testYield, exportedAt, archiveId } = {}) {
  try {
    const snapshot = await readConsistentProjectSnapshot(localRecordId, { testYield });
    if (!snapshot) {
      throw new RepositoryError('not-found', 'Cannot export a project that is not present');
    }
    if (snapshot.records.length > MAX_ARCHIVE_RECORDS) {
      throw new ArchiveError('too-many-records', 'Archive exceeds the record limit');
    }
    const document = await buildArchiveDocument({
      archiveId: archiveId ?? crypto.randomUUID(),
      exportedAt: exportedAt ?? new Date().toISOString(),
      project: snapshot.project,
      records: snapshot.records,
      blobs: snapshot.blobs,
      missingEvidence: snapshot.missingEvidence,
    });
    const serialized = serializeArchive(document);
    return {
      status: 'ready',
      document,
      json: serialized.json,
      bytes: serialized.bytes,
      filename: `${snapshot.project.projectId}${ARCHIVE_FILENAME_SUFFIX}`,
      mime: ARCHIVE_MIME,
      incomplete: snapshot.missingEvidence.length > 0,
      missingEvidence: snapshot.missingEvidence,
      namedHead: snapshot.namedHead,
      recordCount: snapshot.records.length,
      projectId: snapshot.project.projectId,
      localRecordId,
    };
  } catch (error) {
    return failed(error, 'export-failed');
  }
}

export function requestArchiveDownload({ json, filename, mime = ARCHIVE_MIME }) {
  const blob = new Blob([json], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
  return { status: 'download-requested', filename };
}

export async function importOwnerArchive(raw, { serializedBytes, separateCopy = false, createdAt } = {}) {
  let parsed;
  try {
    parsed = await parseAndValidateArchive(raw, { serializedBytes });
  } catch (error) {
    return failed(error, 'invalid-archive');
  }
  try {
    const result = await importProjectNamespace({
      project: parsed.document.project,
      records: parsed.document.records,
      blobs: parsed.blobs,
      archiveId: parsed.document.manifest.archiveId,
      unknownClass: parsed.unknownClass,
      createdAt: createdAt ?? new Date().toISOString(),
      separateCopy,
    });
    return {
      ...result,
      unknownClass: parsed.unknownClass,
      missingEvidence: parsed.missingEvidence,
      incomplete: parsed.incomplete,
      recordCount: parsed.document.records.length,
      archiveId: parsed.document.manifest.archiveId,
      namedHead: parsed.document.manifest.namedHead ?? parsed.document.project.currentHead ?? null,
    };
  } catch (error) {
    return failed(error, 'import-failed');
  }
}
