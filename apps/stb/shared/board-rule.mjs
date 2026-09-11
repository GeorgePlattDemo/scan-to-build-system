import { BOARD_DEFINITION } from './contracts.mjs';
import { canonicalInchString } from './canonical.mjs';

function emptyEvaluation(unresolvedReason) {
  return {
    valid: false,
    unresolvedReason,
    value: null,
    unit: null,
    canonical: null,
    rawText: null,
    declaredUnit: null,
  };
}

export function evaluateBoardRequirement(observation) {
  if (!observation) {
    return emptyEvaluation('missing-finished-length');
  }
  if (observation.unresolvedReason) {
    return {
      valid: false,
      unresolvedReason: observation.unresolvedReason,
      value: observation.interpretedValue ?? null,
      unit: observation.interpretedUnit ?? null,
      canonical: null,
      rawText: observation.rawText ?? null,
      declaredUnit: observation.declaredUnit ?? null,
    };
  }
  const value = observation.interpretedValue;
  const unit = observation.interpretedUnit;
  if (unit !== BOARD_DEFINITION.unit) {
    return {
      valid: false,
      unresolvedReason: 'unsupported-unit',
      value: value ?? null,
      unit: unit ?? null,
      canonical: null,
      rawText: observation.rawText ?? null,
      declaredUnit: observation.declaredUnit ?? null,
    };
  }
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return {
      valid: false,
      unresolvedReason: 'nonfinite',
      value: null,
      unit,
      canonical: null,
      rawText: observation.rawText ?? null,
      declaredUnit: observation.declaredUnit ?? null,
    };
  }
  let unresolvedReason = null;
  if (value < 0) {
    unresolvedReason = 'negative';
  } else if (value === 0) {
    unresolvedReason = 'zero';
  } else if (value < BOARD_DEFINITION.minInches) {
    unresolvedReason = 'below-minimum';
  } else if (value > BOARD_DEFINITION.maxInches) {
    unresolvedReason = 'above-maximum';
  }
  return {
    valid: unresolvedReason == null,
    unresolvedReason,
    value,
    unit,
    canonical: canonicalInchString(value),
    rawText: observation.rawText ?? null,
    declaredUnit: observation.declaredUnit ?? null,
  };
}
