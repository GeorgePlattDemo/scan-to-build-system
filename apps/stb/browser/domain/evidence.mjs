import {
  MAX_PROJECT_EVIDENCE_BYTES,
  MAX_SOURCE_BYTES,
  classifyDisplayType,
} from '/shared/contracts.mjs';
import {
  RepositoryError,
  getProject,
  getRecord,
  listRecords,
  prepareBlob,
} from '/data/repository.mjs';
import { commitCandidateChange, successorCandidatePayload } from '/domain/candidate.mjs';

function requireString(name, value) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new RepositoryError('invalid-argument', `${name} is required`);
  }
  return value;
}

function opaqueId() {
  return crypto.randomUUID();
}

function toBytes(bytes) {
  if (bytes instanceof Uint8Array) {
    return bytes;
  }
  if (bytes instanceof ArrayBuffer) {
    return new Uint8Array(bytes);
  }
  if (Array.isArray(bytes)) {
    return Uint8Array.from(bytes);
  }
  throw new RepositoryError('invalid-argument', 'evidence bytes must be a byte array');
}

export function uniqueEvidenceBytes(records) {
  const sizes = new Map();
  for (const record of records) {
    const sha256 = record?.payload?.sha256;
    const size = record?.payload?.size;
    if (typeof sha256 === 'string' && sha256.length > 0 && Number.isFinite(size)) {
      if (!sizes.has(sha256)) {
        sizes.set(sha256, size);
      }
    }
  }
  let total = 0;
  for (const size of sizes.values()) {
    total += size;
  }
  return total;
}

export function evidencePayloadFromPrepared(prepared) {
  return {
    acquisitionMethod: prepared.acquisitionMethod,
    acquisitionContext: prepared.acquisitionContext ?? null,
    originalFilename: prepared.originalFilename,
    declaredMime: prepared.declaredMime,
    displayType: prepared.displayType,
    size: prepared.blob.size,
    sha256: prepared.blob.sha256,
    origin: prepared.origin ?? null,
    predecessorEvidenceId: prepared.predecessorEvidenceId ?? null,
    role: prepared.role,
    rawText: prepared.rawText ?? null,
    bytesRetained: true,
  };
}

export async function prepareTypedOriginal(input) {
  if (typeof input.text !== 'string') {
    throw new RepositoryError('invalid-argument', 'Typed original text is required');
  }
  const bytes = new TextEncoder().encode(input.text);
  if (bytes.byteLength > MAX_SOURCE_BYTES) {
    throw new RepositoryError(
      'source-too-large',
      `Original source exceeds ${MAX_SOURCE_BYTES} bytes`,
    );
  }
  const blob = await prepareBlob({ bytes, type: 'text/plain' });
  const role = typeof input.role === 'string' && input.role.trim()
    ? input.role.trim()
    : 'typed-need';
  return {
    evidenceId: opaqueId(),
    blob,
    acquisitionMethod: 'typed',
    acquisitionContext: input.acquisitionContext ?? 'typed-original',
    originalFilename: null,
    declaredMime: 'text/plain',
    displayType: 'text',
    role,
    rawText: input.text,
    origin: input.origin ?? null,
    predecessorEvidenceId: null,
  };
}

export async function prepareFileOriginal(input) {
  const bytes = toBytes(input.bytes);
  if (bytes.byteLength > MAX_SOURCE_BYTES) {
    throw new RepositoryError(
      'source-too-large',
      `Original source exceeds ${MAX_SOURCE_BYTES} bytes`,
    );
  }
  const declaredMime = requireString('type', input.type);
  const displayType = classifyDisplayType(declaredMime);
  const blob = await prepareBlob({ bytes, type: declaredMime });
  return {
    evidenceId: opaqueId(),
    blob,
    acquisitionMethod: 'file-upload',
    acquisitionContext: input.acquisitionContext ?? 'file-api',
    originalFilename: input.filename ?? null,
    declaredMime,
    displayType,
    role: input.role ?? 'source-file',
    rawText: null,
    origin: input.origin ?? null,
    predecessorEvidenceId: null,
  };
}

export async function attachPreparedEvidence(input) {
  const localRecordId = requireString('localRecordId', input.localRecordId);
  const actionId = requireString('actionId', input.actionId);
  const createdAt = requireString('createdAt', input.createdAt);
  const expectedHead = requireString('expectedHead', input.expectedHead);
  const prepared = input.prepared;
  if (!prepared?.blob || !prepared.evidenceId) {
    throw new RepositoryError('invalid-argument', 'Prepared evidence is required');
  }

  const project = await getProject(localRecordId);
  if (!project) {
    throw new RepositoryError('invalid-argument', 'Project does not exist');
  }

  const existingAction = await getRecord(localRecordId, 'action', actionId);
  if (!existingAction) {
    const existing = await listRecords(localRecordId, 'evidence');
    const alreadyKnown = existing.some(
      (record) => record.payload && record.payload.sha256 === prepared.blob.sha256,
    );
    if (!alreadyKnown) {
      const nextTotal = uniqueEvidenceBytes(existing) + prepared.blob.size;
      if (nextTotal > MAX_PROJECT_EVIDENCE_BYTES) {
        throw new RepositoryError(
          'project-evidence-limit',
          `Unique evidence bytes would exceed ${MAX_PROJECT_EVIDENCE_BYTES}`,
        );
      }
    }
  }

  const result = await commitCandidateChange({
    localRecordId,
    expectedHead,
    actionId,
    createdAt,
    blobs: [prepared.blob],
    records: [
      {
        kind: 'evidence',
        id: prepared.evidenceId,
        payload: evidencePayloadFromPrepared(prepared),
      },
    ],
    eventType: 'evidence-attached',
    eventPayload: {
      evidenceId: prepared.evidenceId,
      displayType: prepared.displayType,
      sha256: prepared.blob.sha256,
    },
    buildPayload(previous) {
      const ids = [...(previous.payload.activeEvidenceIds ?? [])];
      if (!ids.includes(prepared.evidenceId)) {
        ids.push(prepared.evidenceId);
      }
      return successorCandidatePayload(previous, {
        activeEvidenceIds: ids,
        originalNeed:
          prepared.role === 'typed-need'
            ? previous.payload.originalNeed ?? prepared.evidenceId
            : previous.payload.originalNeed ?? null,
        unresolved: true,
        parts: null,
        dimensions: null,
        material: null,
      });
    },
    testFault: input.testFault ?? null,
  });

  const evidenceId = result.event?.payload?.evidenceId ?? null;
  const evidence = evidenceId
    ? await getRecord(localRecordId, 'evidence', evidenceId)
    : null;

  return {
    ...result,
    evidenceId,
    evidence,
  };
}
