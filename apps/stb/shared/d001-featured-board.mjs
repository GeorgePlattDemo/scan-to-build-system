/**
 * App-side part requirement for the D-001 five-tool candidate.
 *
 * This validates user-visible, part-relative feature syntax only. It does not
 * decide Store supportability and does not contain machine coordinates or motion.
 */

export const D001_FEATURED_BOARD_DEFINITION = Object.freeze({
  kind: 'board.featured.v0',
  ruleVersion: '0.1-candidate',
  unit: 'in',
  quantity: 1,
  quantityUnit: 'ea',
  minFinishedLengthIn: 24,
  maxFinishedLengthIn: 60,
  pilotDiameterIn: 0.1875,
  featureKinds: Object.freeze([
    'ANGLED_END_SINGLE_PLANE',
    'DADO',
    'TRANSVERSE_GROOVE',
    'EDGE_NOTCH',
    'ROUTED_END',
    'PILOT_FACE_3_16',
    'PILOT_EDGE_3_16',
  ]),
  physicalStatus: 'NOT_CLAIMED',
});

const MACHINE_LOCAL_FIELDS = Object.freeze([
  'gcode',
  'controller',
  'toolNumber',
  'stationXIn',
  'feedRate',
  'feedInPerMin',
  'spindleRpm',
  'cycleStart',
]);

function finite(value) {
  return Number.isFinite(value);
}

function positive(value) {
  return finite(value) && value > 0;
}

function normalizeFeature(feature, index) {
  if (!feature || typeof feature !== 'object' || Array.isArray(feature)) {
    return { ok: false, reason: `feature-${index}-object-required` };
  }
  for (const key of MACHINE_LOCAL_FIELDS) {
    if (feature[key] != null) {
      return { ok: false, reason: `machine-local-field-not-accepted:${key}` };
    }
  }
  if (!D001_FEATURED_BOARD_DEFINITION.featureKinds.includes(feature.kind)) {
    return { ok: false, reason: `unsupported-feature-kind:${feature.kind ?? 'missing'}` };
  }
  const base = {
    featureId: feature.featureId ?? `feature-${index + 1}`,
    kind: feature.kind,
  };

  switch (feature.kind) {
    case 'DADO':
    case 'TRANSVERSE_GROOVE': {
      if (!positive(feature.xFromLeftIn)) return { ok: false, reason: `${feature.kind}:x-required` };
      if (!positive(feature.widthIn)) return { ok: false, reason: `${feature.kind}:width-required` };
      if (!positive(feature.depthIn)) return { ok: false, reason: `${feature.kind}:depth-required` };
      if ((feature.extent ?? 'FULL_WIDTH') !== 'FULL_WIDTH') {
        return { ok: false, reason: `${feature.kind}:only-full-width-in-v0` };
      }
      return {
        ok: true,
        feature: {
          ...base,
          xFromLeftIn: feature.xFromLeftIn,
          widthIn: feature.widthIn,
          depthIn: feature.depthIn,
          extent: 'FULL_WIDTH',
        },
      };
    }
    case 'ANGLED_END_SINGLE_PLANE': {
      if (!['LEFT', 'RIGHT'].includes(feature.end)) {
        return { ok: false, reason: 'angled-end:end-required' };
      }
      if (!finite(feature.angleDeg) || Math.abs(feature.angleDeg) >= 90) {
        return { ok: false, reason: 'angled-end:angle-invalid' };
      }
      return { ok: true, feature: { ...base, end: feature.end, angleDeg: feature.angleDeg } };
    }
    case 'PILOT_FACE_3_16': {
      if (
        feature.diameterIn != null &&
        feature.diameterIn !== D001_FEATURED_BOARD_DEFINITION.pilotDiameterIn
      ) {
        return { ok: false, reason: 'pilot-diameter-fixed-3-16' };
      }
      if (!finite(feature.xFromLeftIn) || feature.xFromLeftIn < 0) {
        return { ok: false, reason: 'pilot-face:x-required' };
      }
      if (!finite(feature.yFromFenceIn) || feature.yFromFenceIn < 0) {
        return { ok: false, reason: 'pilot-face:y-required' };
      }
      return {
        ok: true,
        feature: {
          ...base,
          xFromLeftIn: feature.xFromLeftIn,
          yFromFenceIn: feature.yFromFenceIn,
          diameterIn: D001_FEATURED_BOARD_DEFINITION.pilotDiameterIn,
        },
      };
    }
    case 'PILOT_EDGE_3_16': {
      if (
        feature.diameterIn != null &&
        feature.diameterIn !== D001_FEATURED_BOARD_DEFINITION.pilotDiameterIn
      ) {
        return { ok: false, reason: 'pilot-diameter-fixed-3-16' };
      }
      if (!finite(feature.xFromLeftIn) || feature.xFromLeftIn < 0) {
        return { ok: false, reason: 'pilot-edge:x-required' };
      }
      if (feature.zFromTableIn != null && (!finite(feature.zFromTableIn) || feature.zFromTableIn < 0)) {
        return { ok: false, reason: 'pilot-edge:z-invalid' };
      }
      return {
        ok: true,
        feature: {
          ...base,
          xFromLeftIn: feature.xFromLeftIn,
          zFromTableIn: feature.zFromTableIn ?? null,
          diameterIn: D001_FEATURED_BOARD_DEFINITION.pilotDiameterIn,
        },
      };
    }
    case 'EDGE_NOTCH': {
      if (!finite(feature.xFromLeftIn) || feature.xFromLeftIn < 0) {
        return { ok: false, reason: 'edge-notch:x-required' };
      }
      return { ok: true, feature: { ...base, xFromLeftIn: feature.xFromLeftIn } };
    }
    case 'ROUTED_END': {
      if (!['LEFT', 'RIGHT'].includes(feature.end)) {
        return { ok: false, reason: 'routed-end:end-required' };
      }
      return { ok: true, feature: { ...base, end: feature.end } };
    }
    default:
      return { ok: false, reason: 'unsupported-feature-kind' };
  }
}

export function evaluateD001FeaturedBoardRequirement(input = {}) {
  const keptLengthIn = input.keptLengthIn;
  if (!finite(keptLengthIn)) {
    return { valid: false, unresolvedReason: 'missing-finished-length', normalized: null };
  }
  if (
    keptLengthIn < D001_FEATURED_BOARD_DEFINITION.minFinishedLengthIn ||
    keptLengthIn > D001_FEATURED_BOARD_DEFINITION.maxFinishedLengthIn
  ) {
    return { valid: false, unresolvedReason: 'finished-length-outside-board-slice', normalized: null };
  }
  if (!Array.isArray(input.features)) {
    return { valid: false, unresolvedReason: 'feature-list-required', normalized: null };
  }
  const normalized = [];
  for (let index = 0; index < input.features.length; index += 1) {
    const result = normalizeFeature(input.features[index], index);
    if (!result.ok) {
      return { valid: false, unresolvedReason: result.reason, normalized: null };
    }
    const feature = result.feature;
    if (feature.xFromLeftIn != null && feature.xFromLeftIn > keptLengthIn) {
      return { valid: false, unresolvedReason: `${feature.kind}:x-outside-finished-length`, normalized: null };
    }
    normalized.push(feature);
  }
  return {
    valid: true,
    unresolvedReason: null,
    normalized: {
      definitionKind: D001_FEATURED_BOARD_DEFINITION.kind,
      ruleVersion: D001_FEATURED_BOARD_DEFINITION.ruleVersion,
      keptLengthIn,
      quantity: 1,
      unit: 'ea',
      features: normalized,
    },
  };
}

export function d001FeaturedBoardStoreSpec(input = {}) {
  const evaluated = evaluateD001FeaturedBoardRequirement(input);
  if (!evaluated.valid) return evaluated;
  return {
    valid: true,
    unresolvedReason: null,
    spec: {
      keptLengthIn: evaluated.normalized.keptLengthIn,
      features: evaluated.normalized.features,
    },
  };
}
