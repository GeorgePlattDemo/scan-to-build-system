export const STORE_CALCULATION_DIVERGENCE = 'STORE_CALCULATION_DIVERGENCE';

function nonempty(value) {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export function calculationIdentityFromEnvelope(envelope) {
  const direct = envelope?.calculationIdentity ?? null;
  const estimate = envelope?.rawEstimate?.calculationIdentity ?? null;
  const value = direct ?? estimate;
  if (!value || typeof value !== 'object') {
    return null;
  }
  const inputHash = nonempty(value.inputHash);
  const resultHash = nonempty(value.resultHash);
  if (!inputHash || !resultHash) {
    return null;
  }
  return Object.freeze({ inputHash, resultHash });
}

export function compareStoreCalculationIdentities(passA, passB) {
  if (!passA || !passB) {
    return Object.freeze({
      ok: false,
      code: STORE_CALCULATION_DIVERGENCE,
      reason: 'CALCULATION_IDENTITY_REQUIRED',
    });
  }
  if (passA.inputHash !== passB.inputHash) {
    return Object.freeze({
      ok: false,
      code: STORE_CALCULATION_DIVERGENCE,
      reason: 'CALCULATION_INPUT_DIVERGENCE',
      passA,
      passB,
    });
  }
  if (passA.resultHash !== passB.resultHash) {
    return Object.freeze({
      ok: false,
      code: STORE_CALCULATION_DIVERGENCE,
      reason: 'CALCULATION_RESULT_DIVERGENCE',
      passA,
      passB,
    });
  }
  return Object.freeze({
    ok: true,
    code: null,
    reason: null,
    passA,
    passB,
  });
}
