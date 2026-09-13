import { ALCOVE_CLASS_ID, ALCOVE_REFERENCE_EXAMPLE } from './alcove-rule.mjs';
import { PICNIC_CLASS_ID, PICNIC_REFERENCE_EXAMPLES } from './picnic-rule.mjs';

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

export const CLASS_CONFIGURATORS = Object.freeze({
  [ALCOVE_CLASS_ID]: Object.freeze({
    classId: ALCOVE_CLASS_ID,
    title: 'ALCOVE SHELF BLANKS',
    kicker: 'Bounded project configurator · running candidate engine',
    lead: 'These six inputs drive one deterministic candidate calculation. Nothing is silently defaulted. Applying a change creates a new candidate revision; it does not place an order or authorize fabrication.',
    fields: Object.freeze([
      Object.freeze({ key: 'openingWidth', label: 'Opening clear width', unit: 'in', inputMode: 'decimal', help: 'Measured clear width between the two support locations.' }),
      Object.freeze({ key: 'leftSupport', label: 'Left support thickness', unit: 'in', inputMode: 'decimal', help: 'Deducted from the opening. No hidden allowance is added.' }),
      Object.freeze({ key: 'rightSupport', label: 'Right support thickness', unit: 'in', inputMode: 'decimal', help: 'Deducted from the opening. No hidden allowance is added.' }),
      Object.freeze({ key: 'blankDepth', label: 'Shelf blank depth', unit: 'in', inputMode: 'decimal', help: 'Candidate blank depth. This does not establish installed clearance.' }),
      Object.freeze({ key: 'blankThickness', label: 'Shelf blank thickness', unit: 'in', inputMode: 'decimal', help: 'Candidate blank thickness. Structural adequacy is not evaluated here.' }),
      Object.freeze({ key: 'shelfCount', label: 'Shelf count', unit: 'ea', inputMode: 'numeric', help: 'Number of separate candidate blank occurrences.' }),
    ]),
    examples: Object.freeze([
      Object.freeze({
        id: 'published-reference-example',
        label: 'USE PUBLISHED EXAMPLE',
        basis: 'published-reference-example',
        configuration: ALCOVE_REFERENCE_EXAMPLE,
      }),
    ]),
    exampleNote: 'Published example is an explicit reference choice: 46.25 − 0.75 − 0.75 = 44.75 in; 3 blanks at 44.75 × 11.00 × 0.75 in. Structural span is not evaluated.',
  }),
  [PICNIC_CLASS_ID]: Object.freeze({
    classId: PICNIC_CLASS_ID,
    title: 'CLASSIC PICNIC TABLE — CANDIDATE FIXTURE',
    kicker: 'Second bounded class · shared runner proof + donor extension',
    lead: 'Product length drives candidate geometry. Requested scope and material are holder inputs only: they do not create Store availability, price, structural adequacy, machine support, production release, or fabrication authority.',
    fields: Object.freeze([
      Object.freeze({
        key: 'productLength',
        label: 'Overall product length',
        unit: 'in',
        inputMode: 'decimal',
        help: 'Candidate input range 60–216 in. This range is only an application/demo bound, not a structural rule, Store stock limit, or machine envelope.',
      }),
      Object.freeze({
        key: 'requestedScope',
        label: 'Requested scope',
        unit: 'complete-part-set | frame-kit',
        inputMode: 'text',
        help: 'Holder request only. “frame-kit” does not mean a Store or machine can fulfill it.',
      }),
      Object.freeze({
        key: 'materialPreference',
        label: 'Material preference',
        unit: 'plain words',
        inputMode: 'text',
        help: 'Preference only. Store material identity, treatment/use category, SKU, availability and price remain unresolved.',
      }),
    ]),
    examples: Object.freeze(PICNIC_REFERENCE_EXAMPLES.map((example) => Object.freeze({
      id: example.id,
      label: example.label,
      basis: example.basis,
      configuration: Object.freeze({
        productLength: example.productLength,
        requestedScope: example.requestedScope,
        materialPreference: example.materialPreference,
      }),
    }))),
    exampleNote: 'This pass admits the donor’s broader length and frame-kit request vocabulary without admitting its structural, price, Store, shipping, or machine claims. Separate-benches geometry and adjustable-height geometry remain donor research, not implemented class behavior.',
  }),
  [S001_CENTERED_ARCH_CLASS_ID]: Object.freeze({
    classId: S001_CENTERED_ARCH_CLASS_ID,
    title: 'CENTERED ARCHED SHEET CUTOUT',
    kicker: 'Canonical S-001 bounded project · full-sheet centered field',
    lead: 'The 48 × 96 in parent sheet and centered 48 × 36 in working field are fixed. Change only opening width, straight height, and arch rise. The preview does not authorize fabrication; Store independently evaluates the same bounded demand.',
    fields: Object.freeze([
      Object.freeze({ key: 'openingWidthIn', label: 'Opening width', unit: 'in', inputMode: 'decimal', help: 'Whole profile must remain inside the centered 48 in horizontal work field.' }),
      Object.freeze({ key: 'straightHeightIn', label: 'Straight side height', unit: 'in', inputMode: 'decimal', help: 'Straight portion below the arch.' }),
      Object.freeze({ key: 'riseIn', label: 'Arch rise', unit: 'in', inputMode: 'decimal', help: 'Added to straight height. Straight height + rise must remain within the centered 36 in vertical work field.' }),
    ]),
    examples: Object.freeze([
      Object.freeze({
        id: 'canonical-s001-reference',
        label: 'USE CANONICAL 4 × 8 EXAMPLE',
        basis: 'canonical-s001-centered-field-reference',
        configuration: S001_CENTERED_ARCH_DEFAULTS,
      }),
    ]),
    exampleNote: 'Canonical project: 36 in opening width, 24 in straight height, 12 in rise. Total opening height is 36 in. The centered work field leaves 24 in of the full sheet at each long-axis end and 6 in at top/bottom outside the field.',
  }),
});

export function getClassConfigurator(classId) {
  return CLASS_CONFIGURATORS[classId] ?? null;
}
