import { canonicalInchString } from './canonical.mjs';

export const PICNIC_CLASS_ID = 'classic-picnic-table-fixture';
export const PICNIC_CLASS_VERSION = '0.1-software-fixture';
export const PICNIC_RULE_VERSION = 'classic.picnic-table.fixture/0.1';
export const PICNIC_DEFINITION_KIND = 'classic.picnic-table.fixture.v1';

/*
 * Candidate extension admitted from stb-picnic-tables-0.1 donor.
 *
 * Compatibility note:
 * CLASS_ID / CLASS_VERSION / RULE_VERSION stay unchanged in this branch so
 * existing candidate records remain inspectable. The added range, requested
 * scope, and material-preference fields are candidate-only inputs. A later
 * sanitizing/versioning pass should decide whether to cut a 0.2 class/rule ID.
 */
export const PICNIC_CANDIDATE_REVISION = '0.2-donor-extension';

export const PICNIC_FIXTURE = Object.freeze({
  fixtureId: 'PT-SOFTWARE-FIXTURE-0.1',
  candidateProductLengthRange: Object.freeze({
    min: 60,
    max: 216,
    unit: 'in',
    basis: 'candidate-input-range-only',
  }),
  referenceProductLengths: Object.freeze([72, 84, 96, 144]),
  endOverhang: 6,
  overallWidth: 60,
  topHeight: 30,
  seatHeight: 17,
  tabletopCount: 5,
  seatCount: 2,
  tabletopProfile: Object.freeze({ width: 5.5, thickness: 1.5 }),
  seatProfile: Object.freeze({ width: 5.5, thickness: 1.5 }),
  transverseProfile: Object.freeze({ width: 3.5, thickness: 1.5 }),
  legProfile: Object.freeze({ width: 3.5, thickness: 1.5 }),
  transverseLength: 54,
  topTransverseCount: 2,
  seatTransverseCount: 2,
  endFrameInset: 8,
  leg: Object.freeze({
    upper: Object.freeze({ x: -8, y: 0 }),
    lower: Object.freeze({ x: -16, y: 28 }),
    holeFractionFromUpper: 0.5,
  }),
});

export const PICNIC_REQUEST_SCOPES = Object.freeze([
  Object.freeze({ id: 'complete-part-set', label: 'Complete part-set request' }),
  Object.freeze({ id: 'frame-kit', label: 'Frame-kit request; long deck stock holder-supplied' }),
]);

export const PICNIC_REFERENCE_EXAMPLES = Object.freeze([
  Object.freeze({
    id: 'fixture-72',
    label: 'USE 72 IN COMPLETE-PART EXAMPLE',
    productLength: '72',
    requestedScope: 'complete-part-set',
    materialPreference: '',
    basis: 'software-fixture-0.1',
  }),
  Object.freeze({
    id: 'fixture-84',
    label: 'USE 84 IN COMPLETE-PART EXAMPLE',
    productLength: '84',
    requestedScope: 'complete-part-set',
    materialPreference: '',
    basis: 'software-fixture-0.1',
  }),
  Object.freeze({
    id: 'candidate-96-frame-kit',
    label: 'USE 96 IN FRAME-KIT EXAMPLE',
    productLength: '96',
    requestedScope: 'frame-kit',
    materialPreference: 'pressure-treated pine',
    basis: 'picnic-donor-candidate-0.2',
  }),
  Object.freeze({
    id: 'candidate-144-frame-kit',
    label: 'USE 144 IN FRAME-KIT EXAMPLE',
    productLength: '144',
    requestedScope: 'frame-kit',
    materialPreference: 'cedar',
    basis: 'picnic-donor-candidate-0.2',
  }),
]);

function inch(value) {
  return { value, unit: 'in', canonical: canonicalInchString(value) };
}

function raw(value) {
  return String(value ?? '').trim();
}

function readRawInput(input, key) {
  return raw(input?.[key] ?? input?.inputs?.[key]?.raw);
}

export function normalizePicnicConfiguration(input = {}, { basis = 'manual-entry' } = {}) {
  const productLength = readRawInput(input, 'productLength');
  const requestedScope = readRawInput(input, 'requestedScope');
  const materialPreference = readRawInput(input, 'materialPreference');
  return {
    kind: 'classic.picnic-table.fixture.config.v1',
    basis,
    candidateRevision: PICNIC_CANDIDATE_REVISION,
    fixtureId: PICNIC_FIXTURE.fixtureId,
    inputs: {
      productLength: {
        raw: productLength,
        unit: 'in',
        method: basis,
      },
      requestedScope: {
        raw: requestedScope,
        unit: null,
        method: basis,
      },
      materialPreference: {
        raw: materialPreference,
        unit: null,
        method: basis,
      },
    },
  };
}

export function evaluatePicnicConfiguration(configuration) {
  const productLengthRaw = raw(configuration?.inputs?.productLength?.raw);
  const requestedScopeRaw = raw(configuration?.inputs?.requestedScope?.raw);
  const materialPreferenceRaw = raw(configuration?.inputs?.materialPreference?.raw);

  if (!productLengthRaw) {
    return {
      valid: false,
      unresolvedReason: 'missing-productLength',
      unresolvedConditions: [],
      input: null,
      fixture: PICNIC_FIXTURE,
      derived: null,
    };
  }

  const productLength = Number(productLengthRaw);
  if (!Number.isFinite(productLength)) {
    return {
      valid: false,
      unresolvedReason: 'invalid-productLength',
      unresolvedConditions: [],
      input: { raw: productLengthRaw },
      fixture: PICNIC_FIXTURE,
      derived: null,
    };
  }

  const range = PICNIC_FIXTURE.candidateProductLengthRange;
  if (productLength < range.min || productLength > range.max) {
    return {
      valid: false,
      unresolvedReason: 'outside-candidate-productLength-range',
      unresolvedConditions: [],
      input: { raw: productLengthRaw, productLength: inch(productLength) },
      fixture: PICNIC_FIXTURE,
      derived: null,
    };
  }

  const scopeIds = new Set(PICNIC_REQUEST_SCOPES.map((item) => item.id));
  const requestedScope = requestedScopeRaw && scopeIds.has(requestedScopeRaw)
    ? {
        id: requestedScopeRaw,
        status: 'holder-request',
        authority: false,
      }
    : null;

  const longitudinal = productLength - 2 * PICNIC_FIXTURE.endOverhang;
  const frameA = PICNIC_FIXTURE.endFrameInset;
  const frameB = productLength - PICNIC_FIXTURE.endFrameInset;
  const clearSpanBetweenEndFrames = frameB - frameA;
  const legDx = PICNIC_FIXTURE.leg.lower.x - PICNIC_FIXTURE.leg.upper.x;
  const legDy = PICNIC_FIXTURE.leg.lower.y - PICNIC_FIXTURE.leg.upper.y;
  const legLength = Math.sqrt(legDx ** 2 + legDy ** 2);
  const holeFromUpper = legLength * PICNIC_FIXTURE.leg.holeFractionFromUpper;
  const affectedCount = PICNIC_FIXTURE.tabletopCount + PICNIC_FIXTURE.seatCount;
  const totalLongitudinalLength = longitudinal * affectedCount;

  const unresolvedConditions = [
    'STRUCTURAL_SPAN_NOT_EVALUATED',
    'ENGINEERING_NOT_EVALUATED',
    'HARDWARE_SUITABILITY_UNRESOLVED',
    'LEG_END_CUT_ANGLES_UNRESOLVED',
    'DRILL_DIAMETER_DEPTH_UNRESOLVED',
    'MATERIAL_IDENTITY_UNRESOLVED',
    'STORE_RESOLUTION_NOT_EVALUATED',
    'GOVERNED_MAKE_PATH_ABSENT',
  ];
  if (!requestedScopeRaw || !requestedScope) {
    unresolvedConditions.push('REQUESTED_SCOPE_UNRESOLVED');
  }

  return {
    valid: true,
    unresolvedReason: null,
    unresolvedConditions,
    input: {
      productLength: inch(productLength),
      requestedScope,
      materialPreference: materialPreferenceRaw
        ? {
            raw: materialPreferenceRaw,
            status: 'holder-preference',
            authority: false,
          }
        : null,
    },
    fixture: PICNIC_FIXTURE,
    derived: {
      longitudinalMemberLength: inch(longitudinal),
      framePositions: Object.freeze({ a: inch(frameA), b: inch(frameB) }),
      clearSpanBetweenEndFrames: inch(clearSpanBetweenEndFrames),
      legLength: inch(legLength),
      legHoleFromUpper: inch(holeFromUpper),
      affectedLongitudinalCount: affectedCount,
      totalLongitudinalLength: inch(totalLongitudinalLength),
    },
    disclosure:
      'Candidate geometry only. The 60–216 in input range is not a structural rule, Store stock limit, machine envelope, or fulfillment promise. Material text is a holder preference, not material identity. Structural span remains unresolved until an attributed rule or qualified person resolves the exact condition.',
  };
}
