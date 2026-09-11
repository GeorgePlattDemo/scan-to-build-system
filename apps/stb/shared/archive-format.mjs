import { canonicalize, canonicalJson, sha256Hex } from './canonical.mjs';
import { digestCanonical } from './store-wire.mjs';
import {
  APP_BUILD_ID,
  ARCHIVE_FORMAT,
  ARCHIVE_VERSION,
  CLASS_REFERENCES,
  FIXED_ORIGIN,
  MAX_ARCHIVE_RECORD_JSON_BYTES,
  MAX_ARCHIVE_RECORDS,
  MAX_ARCHIVE_SERIALIZED_BYTES,
  MAX_PROJECT_EVIDENCE_BYTES,
  MAX_SOURCE_BYTES,
} from './contracts.mjs';

const FORBIDDEN_KEYS = new Set(['__proto__', 'prototype', 'constructor']);
const ARCHIVE_KEYS = Object.freeze(['manifest', 'project', 'records', 'evidenceBlobs']);
const FORBIDDEN_TOP_LEVEL = Object.freeze([
  'rules',
  'scripts',
  'authority',
  'token',
  'authorization',
  'executable',
  'gateResult',
  'controller',
]);
const MANIFEST_KEYS = Object.freeze([
  'format',
  'version',
  'archiveId',
  'exportedAt',
  'appBuildId',
  'projectId',
  'origin',
  'classId',
  'classVersion',
  'ruleVersion',
  'recordCount',
  'namedHead',
  'blobInventory',
  'missingEvidence',
  'recordDigest',
  'incomplete',
]);

export class ArchiveError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'ArchiveError';
    this.code = code;
  }
}

function bytesToBase64(bytes) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < view.length; i += chunk) {
    binary += String.fromCharCode(...view.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function base64ToBytes(value) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new ArchiveError('invalid-base64', 'Evidence bytes must be base64');
  }
  try {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  } catch {
    throw new ArchiveError('invalid-base64', 'Evidence bytes are not valid base64');
  }
}

function rejectForbiddenKeys(value, path = '$') {
  if (value === null || typeof value !== 'object') {
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => rejectForbiddenKeys(item, `${path}[${index}]`));
    return;
  }
  for (const key of Object.keys(value)) {
    if (FORBIDDEN_KEYS.has(key)) {
      throw new ArchiveError('forbidden-key', `Archive rejects key ${key} at ${path}`);
    }
    rejectForbiddenKeys(value[key], `${path}.${key}`);
  }
}

function recordKey(record) {
  return `${record.kind}/${record.id}`;
}

function collectCycles(records) {
  const byKey = new Map(records.map((record) => [recordKey(record), record]));
  const visiting = new Set();
  const visited = new Set();
  const cycle = (record) => {
    const key = recordKey(record);
    if (visited.has(key)) {
      return false;
    }
    if (visiting.has(key)) {
      return true;
    }
    visiting.add(key);
    if (record.parentKind && record.parentId) {
      const parent = byKey.get(`${record.parentKind}/${record.parentId}`);
      if (parent && cycle(parent)) {
        return true;
      }
    }
    visiting.delete(key);
    visited.add(key);
    return false;
  };
  return records.some((record) => cycle(record));
}

function unresolvedParentLinks(records) {
  const byKey = new Set(records.map(recordKey));
  return records.filter(
    (record) =>
      record.parentKind &&
      record.parentId &&
      !byKey.has(`${record.parentKind}/${record.parentId}`),
  );
}

export function knownClassId(classId) {
  if (!classId) {
    return true;
  }
  return CLASS_REFERENCES.some((entry) => entry.classId === classId);
}

export function archiveDigestInput(project, records) {
  return {
    project,
    records,
  };
}

export async function computeRecordDigest(project, records) {
  return digestCanonical(canonicalize(archiveDigestInput(project, records)));
}

export async function buildArchiveDocument({
  archiveId,
  exportedAt,
  project,
  records,
  blobs,
  missingEvidence = [],
}) {
  const blobInventory = Object.keys(blobs)
    .sort()
    .map((sha256) => ({
      sha256,
      size: blobs[sha256].size,
      type: blobs[sha256].type ?? null,
    }));
  const manifestWithoutDigest = {
    format: ARCHIVE_FORMAT,
    version: ARCHIVE_VERSION,
    archiveId,
    exportedAt,
    appBuildId: APP_BUILD_ID,
    projectId: project.projectId,
    origin: FIXED_ORIGIN,
    classId: project.classId ?? null,
    classVersion: project.classVersion ?? null,
    ruleVersion: project.ruleVersion ?? null,
    recordCount: records.length,
    namedHead: project.currentHead ?? null,
    blobInventory,
    missingEvidence: [...missingEvidence].sort(),
    incomplete: missingEvidence.length > 0,
  };
  const recordDigest = await computeRecordDigest(project, records);
  const evidenceBlobs = {};
  for (const sha256 of Object.keys(blobs).sort()) {
    const blob = blobs[sha256];
    evidenceBlobs[sha256] = {
      base64: bytesToBase64(blob.bytes),
      size: blob.size,
      type: blob.type ?? null,
    };
  }
  return {
    manifest: { ...manifestWithoutDigest, recordDigest },
    project,
    records,
    evidenceBlobs,
  };
}

export function serializeArchive(document) {
  const json = canonicalJson(document);
  const bytes = new TextEncoder().encode(json);
  if (bytes.byteLength > MAX_ARCHIVE_SERIALIZED_BYTES) {
    throw new ArchiveError(
      'archive-too-large',
      `Serialized archive exceeds ${MAX_ARCHIVE_SERIALIZED_BYTES} bytes`,
    );
  }
  return { json, bytes };
}

export async function parseAndValidateArchive(raw, { serializedBytes = null } = {}) {
  if (serializedBytes != null && serializedBytes > MAX_ARCHIVE_SERIALIZED_BYTES) {
    throw new ArchiveError(
      'archive-too-large',
      `Serialized archive exceeds ${MAX_ARCHIVE_SERIALIZED_BYTES} bytes`,
    );
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ArchiveError('malformed-json', 'Archive is not valid JSON');
  }
  rejectForbiddenKeys(parsed);
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new ArchiveError('invalid-structure', 'Archive must be a JSON object');
  }
  for (const key of Object.keys(parsed)) {
    if (!ARCHIVE_KEYS.includes(key) || FORBIDDEN_TOP_LEVEL.includes(key)) {
      throw new ArchiveError(
        'forbidden-field',
        `Archive top-level field ${key} is not allowlisted`,
      );
    }
  }
  for (const key of ARCHIVE_KEYS) {
    if (!(key in parsed)) {
      throw new ArchiveError('invalid-structure', `Archive missing ${key}`);
    }
  }
  const manifest = parsed.manifest;
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    throw new ArchiveError('invalid-structure', 'Archive manifest is required');
  }
  for (const key of Object.keys(manifest)) {
    if (!MANIFEST_KEYS.includes(key)) {
      throw new ArchiveError('forbidden-field', `Manifest field ${key} is not allowlisted`);
    }
  }
  if (manifest.format !== ARCHIVE_FORMAT) {
    throw new ArchiveError('unsupported-format', 'Unknown archive format');
  }
  if (manifest.version !== ARCHIVE_VERSION) {
    throw new ArchiveError('unsupported-version', 'Unknown archive version');
  }
  if (typeof manifest.archiveId !== 'string' || manifest.archiveId.length === 0) {
    throw new ArchiveError('invalid-structure', 'archiveId is required');
  }
  if (!Array.isArray(parsed.records)) {
    throw new ArchiveError('invalid-structure', 'records must be an array');
  }
  if (parsed.records.length > MAX_ARCHIVE_RECORDS) {
    throw new ArchiveError('too-many-records', 'Archive exceeds the record limit');
  }
  if (manifest.recordCount !== parsed.records.length) {
    throw new ArchiveError('count-mismatch', 'Manifest recordCount does not match records');
  }
  const recordJsonBytes = new TextEncoder().encode(canonicalJson(parsed.records)).byteLength;
  if (recordJsonBytes > MAX_ARCHIVE_RECORD_JSON_BYTES) {
    throw new ArchiveError('records-too-large', 'Archive record JSON exceeds the first-build limit');
  }
  const project = parsed.project;
  if (!project || typeof project !== 'object' || Array.isArray(project)) {
    throw new ArchiveError('invalid-structure', 'project is required');
  }
  if (typeof project.projectId !== 'string' || project.projectId.length === 0) {
    throw new ArchiveError('invalid-structure', 'project.projectId is required');
  }
  if (manifest.projectId !== project.projectId) {
    throw new ArchiveError('identity-mismatch', 'Manifest projectId does not match project');
  }
  const seen = new Set();
  for (const record of parsed.records) {
    if (!record || typeof record !== 'object' || Array.isArray(record)) {
      throw new ArchiveError('invalid-record', 'Each record must be an object');
    }
    rejectForbiddenKeys(record);
    if (typeof record.kind !== 'string' || typeof record.id !== 'string') {
      throw new ArchiveError('invalid-record', 'Records require kind and id');
    }
    const key = recordKey(record);
    if (seen.has(key)) {
      throw new ArchiveError('duplicate-id', `Duplicate record ${key}`);
    }
    seen.add(key);
    for (const field of FORBIDDEN_TOP_LEVEL) {
      if (Object.prototype.hasOwnProperty.call(record, field)) {
        throw new ArchiveError(
          'active-schema',
          `Record ${key} carries active field ${field}`,
        );
      }
    }
  }
  if (collectCycles(parsed.records)) {
    throw new ArchiveError('parent-cycle', 'Archive records contain a parent cycle');
  }
  const unresolved = unresolvedParentLinks(parsed.records);
  if (unresolved.length > 0) {
    throw new ArchiveError(
      'unresolved-link',
      `Archive has unresolved parent links (${unresolved.length})`,
    );
  }
  const blobs = parsed.evidenceBlobs;
  if (!blobs || typeof blobs !== 'object' || Array.isArray(blobs)) {
    throw new ArchiveError('invalid-structure', 'evidenceBlobs must be an object');
  }
  let decodedTotal = 0;
  const decodedBlobs = {};
  for (const [sha256, entry] of Object.entries(blobs)) {
    if (!entry || typeof entry !== 'object') {
      throw new ArchiveError('invalid-blob', `Blob ${sha256} is invalid`);
    }
    const bytes = base64ToBytes(entry.base64);
    if (bytes.byteLength > MAX_SOURCE_BYTES) {
      throw new ArchiveError('source-too-large', `Blob ${sha256} exceeds the source limit`);
    }
    if (entry.size !== bytes.byteLength) {
      throw new ArchiveError('hash-mismatch', `Blob ${sha256} size does not match decoded bytes`);
    }
    const digest = await sha256Hex(bytes);
    if (digest !== sha256) {
      throw new ArchiveError('hash-mismatch', `Blob ${sha256} hash does not match decoded bytes`);
    }
    decodedTotal += bytes.byteLength;
    decodedBlobs[sha256] = {
      sha256,
      size: bytes.byteLength,
      type: entry.type ?? 'application/octet-stream',
      bytes,
    };
  }
  if (decodedTotal > MAX_PROJECT_EVIDENCE_BYTES) {
    throw new ArchiveError(
      'evidence-too-large',
      'Decoded evidence bytes exceed the project unique-byte limit',
    );
  }
  const expectedDigest = await computeRecordDigest(project, parsed.records);
  if (manifest.recordDigest !== expectedDigest) {
    throw new ArchiveError('tampered-digest', 'Archive recordDigest does not match contents');
  }
  const unknownClass = Boolean(project.classId) && !knownClassId(project.classId);
  return {
    document: parsed,
    blobs: decodedBlobs,
    unknownClass,
    missingEvidence: Array.isArray(manifest.missingEvidence) ? manifest.missingEvidence : [],
    incomplete: manifest.incomplete === true,
  };
}

export { bytesToBase64, base64ToBytes };
