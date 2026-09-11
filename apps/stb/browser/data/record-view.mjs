import { COPY } from '/shared/contracts.mjs';
import { blobCustody, listProjectEvidence, listStoreRequests } from '/data/selectors.mjs';
import { loadReviewPresentation, eventLabel } from '/data/review-view.mjs';
import { loadStoreHistory } from '/data/store-view.mjs';

export async function loadRecordPresentation(localRecordId, { unapplied = false } = {}) {
  const presentation = await loadReviewPresentation(localRecordId, { unapplied });
  if (!presentation) {
    return null;
  }
  const project = presentation.project;
  const evidenceRecords = await listProjectEvidence(localRecordId);
  const sources = [];
  for (const record of evidenceRecords) {
    const sha256 = record.payload?.sha256 ?? null;
    const custody = sha256
      ? await blobCustody(sha256)
      : { status: 'unavailable', reason: 'missing' };
    sources.push({
      id: record.id,
      filename: record.payload?.originalFilename ?? record.payload?.role ?? record.id,
      mime: record.payload?.declaredMime ?? record.payload?.displayType ?? null,
      sha256,
      size: record.payload?.size ?? null,
      retained: custody.status === 'retained',
      reason: custody.status === 'retained' ? null : custody.reason ?? 'missing',
    });
  }
  const storeHistory = await loadStoreHistory(localRecordId, project.currentHead);
  const requests = await listStoreRequests(localRecordId);
  const imported = project.imported === true;
  const currentStoreImported = presentation.store?.imported === true;
  return {
    ...presentation,
    sources,
    storeHistory,
    requestCount: requests.length,
    imported,
    unknownClass: project.unknownClass === true,
    importOrigin: project.importOrigin ?? null,
    importArchiveId: project.importArchiveId ?? null,
    currentStoreImported,
    currentReview: presentation.currentReview,
    copy: {
      heading: COPY.recordHeading,
      localOnly: COPY.recordLocalOnly,
      ownerArchive: COPY.recordOwnerArchive,
    },
  };
}

export { eventLabel };
