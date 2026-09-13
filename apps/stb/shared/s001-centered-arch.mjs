export const S001_CENTERED_ARCH_CLASS_ID = 'S001_CENTERED_ARCHED_SHEET_V0';
export const S001_CENTERED_WORK_FIELD_ID = 'S001-CENTER-WORK-FIELD-V0';

export const S001_CENTERED_ARCH_FIXED = Object.freeze({
  parentHorizontalIn: 96,
  parentVerticalIn: 48,
  outerL_in: 96,
  outerW_in: 48,
  placement: 'CENTERED_ON_PARENT',
  workField: Object.freeze({
    id: S001_CENTERED_WORK_FIELD_ID,
    horizontalIn: 48,
    verticalIn: 36,
    containment: 'WHOLE_PROFILE',
  }),
  tabCount: 4,
  routeDepthIn: 0.5,
});

export const S001_CENTERED_ARCH_DEFAULTS = Object.freeze({
  openingWidthIn: 36,
  straightHeightIn: 24,
  riseIn: 12,
});

function finiteNumber(name, value) {
  if (!Number.isFinite(value)) throw new TypeError(`${name} must be a finite number`);
  return value;
}

export function deriveS001CenteredArchGeometry(inputs = S001_CENTERED_ARCH_DEFAULTS) {
  if (!inputs || typeof inputs !== 'object' || Array.isArray(inputs)) {
    throw new TypeError('S-001 centered arch inputs must be an object');
  }
  const openingWidthIn = finiteNumber('openingWidthIn', inputs.openingWidthIn);
  const straightHeightIn = finiteNumber('straightHeightIn', inputs.straightHeightIn);
  const riseIn = finiteNumber('riseIn', inputs.riseIn);

  const parentHorizontalIn = S001_CENTERED_ARCH_FIXED.parentHorizontalIn;
  const parentVerticalIn = S001_CENTERED_ARCH_FIXED.parentVerticalIn;
  const fieldHorizontalIn = S001_CENTERED_ARCH_FIXED.workField.horizontalIn;
  const fieldVerticalIn = S001_CENTERED_ARCH_FIXED.workField.verticalIn;
  const openingHeightIn = straightHeightIn + riseIn;

  const sheetOffsets = Object.freeze({
    leftIn: (parentHorizontalIn - openingWidthIn) / 2,
    rightIn: (parentHorizontalIn - openingWidthIn) / 2,
    bottomIn: (parentVerticalIn - openingHeightIn) / 2,
    topIn: (parentVerticalIn - openingHeightIn) / 2,
  });
  const fieldOffsets = Object.freeze({
    leftIn: (parentHorizontalIn - fieldHorizontalIn) / 2,
    rightIn: (parentHorizontalIn - fieldHorizontalIn) / 2,
    bottomIn: (parentVerticalIn - fieldVerticalIn) / 2,
    topIn: (parentVerticalIn - fieldVerticalIn) / 2,
  });
  const openingMarginsWithinField = Object.freeze({
    leftIn: (fieldHorizontalIn - openingWidthIn) / 2,
    rightIn: (fieldHorizontalIn - openingWidthIn) / 2,
    bottomIn: (fieldVerticalIn - openingHeightIn) / 2,
    topIn: (fieldVerticalIn - openingHeightIn) / 2,
  });

  const withinWorkField = openingWidthIn > 0
    && straightHeightIn > 0
    && riseIn > 0
    && openingWidthIn <= fieldHorizontalIn
    && openingHeightIn <= fieldVerticalIn;

  return Object.freeze({
    classId: S001_CENTERED_ARCH_CLASS_ID,
    placement: S001_CENTERED_ARCH_FIXED.placement,
    basis: 'PROJECT_CLASS_DERIVATION',
    parent: Object.freeze({ horizontalIn: parentHorizontalIn, verticalIn: parentVerticalIn }),
    workField: Object.freeze({
      ...S001_CENTERED_ARCH_FIXED.workField,
      sheetOffsets: fieldOffsets,
    }),
    opening: Object.freeze({
      widthIn: openingWidthIn,
      straightHeightIn,
      riseIn,
      totalHeightIn: openingHeightIn,
      sheetOffsets,
      marginsWithinWorkField: openingMarginsWithinField,
    }),
    withinWorkField,
    localGate: withinWorkField
      ? 'PROJECT_GEOMETRY_INSIDE_CANONICAL_FIELD'
      : 'PROJECT_GEOMETRY_OUTSIDE_CANONICAL_FIELD',
    storeCapabilityClaim: false,
  });
}
