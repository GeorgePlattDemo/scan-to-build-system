import { canonicalInchString } from './canonical.mjs';

export const PICNIC_CLASS_ID = 'classic-picnic-table-fixture';
export const PICNIC_CLASS_VERSION = '0.1-software-fixture';
export const PICNIC_RULE_VERSION = 'classic.picnic-table.fixture/0.1';
export const PICNIC_DEFINITION_KIND = 'classic.picnic-table.fixture.v1';

export const PICNIC_FIXTURE = Object.freeze({
  fixtureId: 'PT-SOFTWARE-FIXTURE-0.1',
  permittedProductLengths: Object.freeze([72, 84]),
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

export const PICNIC_REFERENCE_EXAMPLES = Object.freeze([
  Object.freeze({ id: 'fixture-72', label: 'USE 72 IN SOFTWARE FIXTURE', productLength: '72', basis: 'software-fixture-0.1' }),
  Object.freeze({ id: 'fixture-84', label: 'USE 84 IN SOFTWARE FIXTURE', productLength: '84', basis: 'software-fixture-0.1' }),
]);

function inch(value) {
  return { value, unit: 'in', canonical: canonicalInchString(value) };
}

export function normalizePicnicConfiguration(input = {}, { basis = 'manual-entry' } = {}) {
  const raw = String(input?.productLength ?? input?.inputs?.productLength?.raw ?? '').trim();
  return {
    kind: 'classic.picnic-table.fixture.config.v1',
    basis,
    fixtureId: PICNIC_FIXTURE.fixtureId,
    inputs: {
      productLength: {
        raw,
        unit: 'in',
        method: basis,
      },
    },
  };
}

export function evaluatePicnicConfiguration(configuration) {
  const raw = String(configuration?.inputs?.productLength?.raw ?? '').trim();
  if (!raw) {
    return {
      valid: false,
      unresolvedReason: 'missing-productLength',
      unresolvedConditions: [],
      input: null,
      fixture: PICNIC_FIXTURE,
      derived: null,
    };
  }
  const productLength = Number(raw);
  if (!Number.isFinite(productLength)) {
    return {
      valid: false,
      unresolvedReason: 'invalid-productLength',
      unresolvedConditions: [],
      input: { raw },
      fixture: PICNIC_FIXTURE,
      derived: null,
    };
  }
  if (!PICNIC_FIXTURE.permittedProductLengths.includes(productLength)) {
    return {
      valid: false,
      unresolvedReason: 'outside-software-fixture-lengths',
      unresolvedConditions: [],
      input: { raw, productLength: inch(productLength) },
      fixture: PICNIC_FIXTURE,
      derived: null,
    };
  }

  const longitudinal = productLength - 2 * PICNIC_FIXTURE.endOverhang;
  const frameA = PICNIC_FIXTURE.endFrameInset;
  const frameB = productLength - PICNIC_FIXTURE.endFrameInset;
  const legDx = PICNIC_FIXTURE.leg.lower.x - PICNIC_FIXTURE.leg.upper.x;
  const legDy = PICNIC_FIXTURE.leg.lower.y - PICNIC_FIXTURE.leg.upper.y;
  const legLength = Math.sqrt(legDx ** 2 + legDy ** 2);
  const holeFromUpper = legLength * PICNIC_FIXTURE.leg.holeFractionFromUpper;
  const affectedCount = PICNIC_FIXTURE.tabletopCount + PICNIC_FIXTURE.seatCount;
  const totalLongitudinalLength = longitudinal * affectedCount;

  return {
    valid: true,
    unresolvedReason: null,
    unresolvedConditions: [
      'ENGINEERING_NOT_EVALUATED',
      'HARDWARE_SUITABILITY_UNRESOLVED',
      'LEG_END_CUT_ANGLES_UNRESOLVED',
      'DRILL_DIAMETER_DEPTH_UNRESOLVED',
      'STORE_RESOLUTION_NOT_EVALUATED',
      'GOVERNED_MAKE_PATH_ABSENT',
    ],
    input: {
      productLength: inch(productLength),
    },
    fixture: PICNIC_FIXTURE,
    derived: {
      longitudinalMemberLength: inch(longitudinal),
      framePositions: Object.freeze({ a: inch(frameA), b: inch(frameB) }),
      legLength: inch(legLength),
      legHoleFromUpper: inch(holeFromUpper),
      affectedLongitudinalCount: affectedCount,
      totalLongitudinalLength: inch(totalLongitudinalLength),
    },
    disclosure: 'All non-length dimensions, counts, leg coordinates, profiles and feature locations are software-fixture assumptions for reuse testing. They are not engineering limits, construction specifications, Store capability, or fabrication authority.',
  };
}
