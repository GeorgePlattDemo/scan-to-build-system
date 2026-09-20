import { canonicalJson, sha256Hex } from './canonical.mjs';

export const START_OWN_STORE_PROTOCOL_VERSION = 'stb-store-zero-start-own-http/1';
export const START_OWN_STORE_PATH = '/api/store-zero/start-own';
export const START_OWN_STORE_PIN = '17166324763f8c9b1e31efb0290f01db87931a9e';
export const START_OWN_STORE_REQUEST_TYPE = 'USER_DEFINED_BOARD_V1';
export const START_OWN_STORE_SCOPE = 'USER_DEFINED_BOARD_REFERENCE';

const SIZE_KEYS = Object.freeze(['2x4', '2x6', '2x8', '4x4']);
const CUT_PLANES = Object.freeze(['miter-face', 'bevel-thickness']);
const END_IDENTITIES = Object.freeze(['both', 'first']);
const END_RELATIONS = Object.freeze(['parallel', 'opposed', null]);

function fail(code, details) {
  return { ok: false, code, details };
}

async function digestCanonical(value) {
  return sha256Hex(new TextEncoder().encode(canonicalJson(value)));
}

function finiteInRange(value, min, max) {
  return Number.isFinite(value) && value >= min && value <= max;
}

export function validateStartOwnPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return fail('MALFORMED_REQUEST', 'payload must be an object');
  }
  const allowed = new Set([
    'sizeKey',
    'finishedLengthIn',
    'partQty',
    'angleDeg',
    'cutPlane',
    'endIdentity',
    'endRelation',
  ]);
  if (Object.keys(payload).some((key) => !allowed.has(key))) {
    return fail('INVALID_BOUNDED_SCOPE', 'unexpected user-defined board fields');
  }
  if (!SIZE_KEYS.includes(payload.sizeKey)) {
    return fail('INVALID_BOUNDED_SCOPE', 'sizeKey is outside the bounded Grab a Board set');
  }
  if (!finiteInRange(payload.finishedLengthIn, 6, 96)) {
    return fail('INVALID_BOUNDED_SCOPE', 'finishedLengthIn must be 6–96 in');
  }
  if (!Number.isInteger(payload.partQty) || payload.partQty < 1 || payload.partQty > 48) {
    return fail('INVALID_BOUNDED_SCOPE', 'partQty must be an integer from 1 through 48');
  }
  if (!finiteInRange(payload.angleDeg, 0, 55)) {
    return fail('INVALID_BOUNDED_SCOPE', 'angleDeg must be 0–55° so Store can refuse beyond its machine envelope');
  }
  if (!CUT_PLANES.includes(payload.cutPlane)) {
    return fail('INVALID_BOUNDED_SCOPE', 'cutPlane must be miter-face or bevel-thickness');
  }
  if (!END_IDENTITIES.includes(payload.endIdentity)) {
    return fail('INVALID_BOUNDED_SCOPE', 'endIdentity must be both or first');
  }
  if (!END_RELATIONS.includes(payload.endRelation ?? null)) {
    return fail('INVALID_BOUNDED_SCOPE', 'endRelation must be parallel, opposed, or null');
  }
  return {
    ok: true,
    payload: {
      sizeKey: payload.sizeKey,
      finishedLengthIn: payload.finishedLengthIn,
      partQty: payload.partQty,
      angleDeg: payload.angleDeg,
      cutPlane: payload.cutPlane,
      endIdentity: payload.endIdentity,
      endRelation: payload.endRelation ?? null,
    },
  };
}

export async function buildStartOwnStoreRequest({
  requestId = crypto.randomUUID(),
  projectId,
  definitionId,
  attemptId = crypto.randomUUID(),
  attemptNumber = 1,
  sentAt = new Date().toISOString(),
  payload,
} = {}) {
  const checked = validateStartOwnPayload(payload);
  if (!checked.ok) throw new Error(checked.details);
  const payloadDigest = await digestCanonical(checked.payload);
  const demandSignature = await digestCanonical({
    requestType: START_OWN_STORE_REQUEST_TYPE,
    scope: START_OWN_STORE_SCOPE,
    payload: checked.payload,
  });
  return {
    protocolVersion: START_OWN_STORE_PROTOCOL_VERSION,
    requestId,
    projectId,
    definitionId,
    requestType: START_OWN_STORE_REQUEST_TYPE,
    scope: START_OWN_STORE_SCOPE,
    demandSignature,
    payloadDigest,
    expectedStorePin: START_OWN_STORE_PIN,
    attemptId,
    attemptNumber,
    sentAt,
    payload: checked.payload,
  };
}

export async function validateStartOwnStoreRequest(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return fail('MALFORMED_REQUEST', 'request body must be an object');
  }
  if (body.protocolVersion !== START_OWN_STORE_PROTOCOL_VERSION) return fail('UNSUPPORTED_PROTOCOL', null);
  if (body.requestType !== START_OWN_STORE_REQUEST_TYPE || body.scope !== START_OWN_STORE_SCOPE) {
    return fail('INVALID_BOUNDED_SCOPE', 'request type or scope mismatch');
  }
  for (const key of ['requestId', 'projectId', 'definitionId', 'demandSignature', 'payloadDigest', 'expectedStorePin', 'attemptId', 'sentAt']) {
    if (typeof body[key] !== 'string' || body[key].length === 0) return fail('MALFORMED_REQUEST', key + ' must be nonempty');
  }
  if (!Number.isInteger(body.attemptNumber) || body.attemptNumber < 1) return fail('MALFORMED_REQUEST', 'attemptNumber must be positive');
  if (body.expectedStorePin !== START_OWN_STORE_PIN) {
    return fail('STORE_PIN_MISMATCH', { expected: START_OWN_STORE_PIN, received: body.expectedStorePin });
  }
  const checked = validateStartOwnPayload(body.payload);
  if (!checked.ok) return checked;
  const payloadDigest = await digestCanonical(checked.payload);
  if (payloadDigest !== body.payloadDigest) return fail('PAYLOAD_DIGEST_MISMATCH', null);
  const demandSignature = await digestCanonical({
    requestType: START_OWN_STORE_REQUEST_TYPE,
    scope: START_OWN_STORE_SCOPE,
    payload: checked.payload,
  });
  if (demandSignature !== body.demandSignature) return fail('PAYLOAD_DIGEST_MISMATCH', 'demand signature mismatch');
  return { ok: true, envelope: body, payload: checked.payload };
}

export function inspectStartOwnStoreResponse(request, response) {
  if (!response || typeof response !== 'object' || Array.isArray(response)) return fail('MALFORMED_RESPONSE', null);
  if (response.adapterError === true) return fail(response.code || 'STORE_ADAPTER_ERROR', response.details ?? null);
  for (const key of ['protocolVersion', 'requestId', 'projectId', 'definitionId', 'requestType', 'scope', 'demandSignature', 'payloadDigest', 'attemptId', 'attemptNumber']) {
    if (response[key] !== request[key]) return fail('CORRELATION_ERROR', key);
  }
  if (response.storePin !== START_OWN_STORE_PIN) return fail('CORRELATION_ERROR', 'storePin');
  return { ok: true };
}
