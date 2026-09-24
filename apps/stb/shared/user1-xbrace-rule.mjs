import { canonicalInchString } from './canonical.mjs';

export const USER1_XBRACE_CONFIGURATION_KIND = 'user1.xbrace.v1';
export const USER1_XBRACE_CONFIGURATION_ID = 'SYO-USER1-XBRACE';
export const USER1_XBRACE_RULE_VERSION = 'user1.xbrace/0.1';
export const USER1_XBRACE_MIN_PART_LENGTH_IN = 16;
export const USER1_XBRACE_MAX_PART_LENGTH_IN = 18;
export const USER1_XBRACE_STEP_IN = 0.125;
export const USER1_XBRACE_FIXED_HORIZONTAL_SPAN_IN = 8;
export const USER1_XBRACE_DEFINED_WORKPIECE_LENGTH_IN = 60;
export const USER1_XBRACE_PART_QTY = 2;

function inch(value) {
  return { value, unit: 'in', canonical: canonicalInchString(value) };
}

function invalid(reason, raw = null) {
  return {
    valid: false,
    unresolvedReason: reason,
    input: raw == null ? null : { partLengthIn: raw },
    derived: null,
    parts: [],
    spotDemand: null,
    storeDemand: null,
  };
}

function onStep(value) {
  const ticks = (value - USER1_XBRACE_MIN_PART_LENGTH_IN) / USER1_XBRACE_STEP_IN;
  return Math.abs(ticks - Math.round(ticks)) < 1e-9;
}

export function normalizeUser1XBraceConfiguration(input = {}, { basis = 'customer-configure' } = {}) {
  return {
    kind: USER1_XBRACE_CONFIGURATION_KIND,
    basis,
    partLengthIn: input.partLengthIn ?? input.finishedLengthIn ?? 16,
  };
}

export function evaluateUser1XBraceConfiguration(configuration) {
  if (configuration?.kind !== USER1_XBRACE_CONFIGURATION_KIND) {
    return invalid('wrong-configuration-kind');
  }
  const partLengthIn = Number(configuration.partLengthIn);
  if (!Number.isFinite(partLengthIn)) {
    return invalid('invalid-part-length', configuration.partLengthIn ?? null);
  }
  if (
    partLengthIn < USER1_XBRACE_MIN_PART_LENGTH_IN - 1e-9
    || partLengthIn > USER1_XBRACE_MAX_PART_LENGTH_IN + 1e-9
  ) {
    return invalid('outside-job1-range', partLengthIn);
  }
  if (!onStep(partLengthIn)) {
    return invalid('part-length-not-on-one-eighth-increment', partLengthIn);
  }

  const spanRatio = USER1_XBRACE_FIXED_HORIZONTAL_SPAN_IN / partLengthIn;
  const angleDeg = Number((Math.asin(spanRatio) * 180 / Math.PI).toFixed(12));
  const achievedRiseIn = Number(Math.sqrt(
    partLengthIn * partLengthIn
      - USER1_XBRACE_FIXED_HORIZONTAL_SPAN_IN * USER1_XBRACE_FIXED_HORIZONTAL_SPAN_IN,
  ).toFixed(6));
  const centerSpotIn = Number((partLengthIn / 2).toFixed(6));
  const partLength = inch(partLengthIn);
  const centerSpot = inch(centerSpotIn);
  const endpoint16 = Math.abs(partLengthIn - 16) < 1e-9;
  const endpoint18 = Math.abs(partLengthIn - 18) < 1e-9;
  const configurationVersion = endpoint16
    ? '0.1'
    : endpoint18
      ? '0.2'
      : `configured-${canonicalInchString(partLengthIn)}`;
  const parts = Array.from({ length: USER1_XBRACE_PART_QTY }, (_, index) => ({
    partId: `PART-${index + 1}`,
    lengthIn: partLengthIn,
    features: [{
      featureId: `SPOT-${index + 1}`,
      kind: 'SPOT_ON_LOCATION',
      xIn: centerSpotIn,
      locationRule: 'CENTERED_ON_PART',
      acrossWidthRule: 'CENTERED_ON_WIDE_FACE',
    }],
  }));
  const spotDemand = {
    required: true,
    mode: 'SPOT_ON_LOCATION',
    countPerPart: 1,
    locationRule: 'CENTERED_ON_PART',
    acrossWidthRule: 'CENTERED_ON_WIDE_FACE',
    totalCount: USER1_XBRACE_PART_QTY,
  };
  const requiredOps = ['MITER_LIMITED', 'SPOT_ON_LOCATION'];

  return {
    valid: true,
    unresolvedReason: null,
    input: {
      partLengthIn: partLength,
      basis: configuration.basis ?? 'customer-configure',
    },
    configurationId: USER1_XBRACE_CONFIGURATION_ID,
    configurationVersion,
    derived: {
      fixedHorizontalSpanIn: inch(USER1_XBRACE_FIXED_HORIZONTAL_SPAN_IN),
      angleDeg,
      achievedRiseIn: inch(achievedRiseIn),
      centerSpotIn: centerSpot,
      definedWorkpieceLengthIn: inch(USER1_XBRACE_DEFINED_WORKPIECE_LENGTH_IN),
      partQty: USER1_XBRACE_PART_QTY,
      sawCuts: 3,
      cutPlane: 'miter-face',
      endIdentity: 'both',
      endRelation: 'parallel',
      lengthDatum: 'long-long-outer-edge',
      datumCMethod: 'REFERENCE_CUT',
      requiredOps,
    },
    parts,
    spotDemand,
    storeDemand: {
      configurationId: USER1_XBRACE_CONFIGURATION_ID,
      configurationVersion,
      definedWorkpieceLengthCanonical: canonicalInchString(USER1_XBRACE_DEFINED_WORKPIECE_LENGTH_IN),
      sawCuts: 3,
      sawAngleDeg: angleDeg,
      drillCycles: 0,
      drillDepthIn: null,
      requiredOps,
      cutPlane: 'miter-face',
      endIdentity: 'both',
      endRelation: 'parallel',
      lengthDatum: 'long-long-outer-edge',
      datumCMethod: 'REFERENCE_CUT',
      parts,
      spotDemand,
      unresolvedConditions: [],
      materialSource: 'STORE_ZERO',
    },
  };
}
