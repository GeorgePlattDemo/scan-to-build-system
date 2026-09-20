import {
  START_OWN_STORE_PATH,
  buildStartOwnStoreRequest,
  inspectStartOwnStoreResponse,
} from '/shared/start-own-store-wire.mjs';

function payloadFromDefinition(definition = {}) {
  return {
    sizeKey: String(definition.stockClass || ''),
    finishedLengthIn: Number(definition.finishedLength),
    partQty: Number(definition.quantity),
    angleDeg: Number(definition.angleDegrees),
    cutPlane: definition.cutPlane,
    endIdentity: definition.endIdentity,
    endRelation: definition.endRelation ?? null,
  };
}

export async function askStartOwnStore({ projectId, definitionId, definition, signal } = {}) {
  const payload = payloadFromDefinition(definition);
  const request = await buildStartOwnStoreRequest({
    projectId,
    definitionId,
    payload,
  });
  let response;
  try {
    response = await fetch(START_OWN_STORE_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal,
    });
  } catch {
    return { ok: false, code: 'STORE_TRANSPORT_ERROR', request, answer: null };
  }
  let answer;
  try {
    answer = await response.json();
  } catch {
    return { ok: false, code: 'STORE_MALFORMED_RESPONSE', request, answer: null };
  }
  const inspection = inspectStartOwnStoreResponse(request, answer);
  if (!inspection.ok) {
    return {
      ok: false,
      code: inspection.code,
      details: inspection.details ?? null,
      httpStatus: response.status,
      request,
      answer,
    };
  }
  return {
    ok: response.status === 200,
    code: response.status === 200 ? null : 'STORE_HTTP_' + response.status,
    httpStatus: response.status,
    request,
    answer,
  };
}

export { payloadFromDefinition };
