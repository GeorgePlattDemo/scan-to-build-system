import { canonicalJson, sha256Hex } from './canonical.mjs';

const encoder = new TextEncoder();

function jsonValue(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

export async function canonicalPayloadDigest(value) {
  return sha256Hex(encoder.encode(canonicalJson(jsonValue(value))));
}

function donorDefinitionId(projectId, payload) {
  if (projectId === 'start-own') {
    return payload?.id ?? payload?.definitionId ?? null;
  }
  if (projectId === 'outdoor') {
    return payload?.id
      ?? payload?.definitionId
      ?? payload?.versionId
      ?? payload?.normalizedPart?.versionId
      ?? null;
  }
  return null;
}

export async function reviewChildDefinitionIdentity(projectId, payload) {
  const supplied = donorDefinitionId(projectId, payload);
  if (supplied !== null && supplied !== undefined && String(supplied).length > 0) {
    return String(supplied);
  }
  if (projectId === 'window-seat') {
    const revision = payload?.revision?.number ?? payload?.storeRequest?.revision ?? 'candidate';
    return `WINDOW-SEAT-R${String(revision)}-SHA256-${await canonicalPayloadDigest(payload?.definition ?? null)}`;
  }
  if (projectId === 'alcove') {
    return `ALCOVE-SHA256-${await canonicalPayloadDigest(payload ?? null)}`;
  }
  if (projectId === 'start-own') {
    return `SYO-SHA256-${await canonicalPayloadDigest(payload ?? null)}`;
  }
  if (projectId === 'outdoor') {
    return `OUTDOOR-SHA256-${await canonicalPayloadDigest(payload?.normalizedPart ?? payload ?? null)}`;
  }
  return `${String(projectId).toUpperCase()}-SHA256-${await canonicalPayloadDigest(payload ?? null)}`;
}
