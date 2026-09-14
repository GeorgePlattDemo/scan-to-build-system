import { ALCOVE_CLASS_ID, ALCOVE_REFERENCE_EXAMPLE } from './alcove-rule.mjs';
import { PICNIC_CLASS_ID, PICNIC_REFERENCE_EXAMPLES } from './picnic-rule.mjs';

export const S001_CENTERED_ARCH_CLASS_ID = 'S001_CENTERED_ARCHED_SHEET_V0';
export const S001_CENTERED_ARCH_CLASS_VERSION = '0.1-canonical-bounded';
export const S001_CENTERED_ARCH_RULE_VERSION = 's001.centered-arched-sheet/0.1';
export const S001_CENTERED_ARCH_DEFINITION_KIND = 's001.centered-arched-sheet.v1';
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

function raw(input, key) {
  const value = input?.[key];
  if (value && typeof value === 'object' && 'raw' in value) {
    return String(value.raw ?? '').trim();
  }
  return String(value ?? '').trim();
}

function parsePositive(input, key, unresolved) {
  const text = raw(input, key);
  if (!text) {
    unresolved.push(`missing-${key}`);
    return null;
  }
  const value = Number(text);
  if (!Number.isFinite(value)) {
    unresolved.push(`invalid-${key}`);
    return null;
  }
  if (!(value > 0)) {
    unresolved.push(`nonpositive-${key}`);
    return null;
  }
  return Object.freeze({ raw: text, value, unit: 'in', canonical: String(value) });
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

export function normalizeS001CenteredArchConfiguration(input = {}, { basis = 'manual-entry' } = {}) {
  const source = input.inputs ?? input;
  return Object.freeze({
    kind: 's001.centered-arched-sheet.config.v1',
    basis,
    inputs: Object.freeze({
      openingWidthIn: Object.freeze({ raw: raw(source, 'openingWidthIn'), unit: 'in', method: basis }),
      straightHeightIn: Object.freeze({ raw: raw(source, 'straightHeightIn'), unit: 'in', method: basis }),
      riseIn: Object.freeze({ raw: raw(source, 'riseIn'), unit: 'in', method: basis }),
    }),
  });
}

export function evaluateS001CenteredArchConfiguration(configuration) {
  const unresolvedInputs = [];
  const inputs = configuration?.inputs ?? configuration ?? {};
  const openingWidth = parsePositive(inputs, 'openingWidthIn', unresolvedInputs);
  const straightHeight = parsePositive(inputs, 'straightHeightIn', unresolvedInputs);
  const rise = parsePositive(inputs, 'riseIn', unresolvedInputs);
  if (unresolvedInputs.length > 0) {
    return Object.freeze({
      valid: false,
      unresolvedReason: unresolvedInputs[0],
      unresolvedInputs,
      unresolvedConditions: [],
      inputs: Object.freeze({ openingWidthIn: openingWidth, straightHeightIn: straightHeight, riseIn: rise }),
      geometry: null,
    });
  }
  const geometry = deriveS001CenteredArchGeometry({
    openingWidthIn: openingWidth.value,
    straightHeightIn: straightHeight.value,
    riseIn: rise.value,
  });
  return Object.freeze({
    valid: true,
    unresolvedReason: null,
    unresolvedInputs: [],
    unresolvedConditions: geometry.withinWorkField ? [] : ['PROJECT_GEOMETRY_OUTSIDE_CANONICAL_FIELD'],
    inputs: Object.freeze({ openingWidthIn: openingWidth, straightHeightIn: straightHeight, riseIn: rise }),
    geometry,
  });
}

export const CLASS_CONFIGURATORS = Object.freeze({
  [ALCOVE_CLASS_ID]: Object.freeze({
    classId: ALCOVE_CLASS_ID,
    title: 'ALCOVE SHELF BLANKS',
    kicker: 'Bounded project configurator · User 1 baseline',
    lead: 'The current candidate engine carries User 1’s measured 45.5 in opening as the baseline. Side members remain 0.75 in each and the present depth is 14 in. No ordered-size adjustment is silently applied here; that later holder decision remains separate.',
    fields: Object.freeze([
      Object.freeze({ key: 'openingWidth', label: 'Opening clear width', unit: 'in', inputMode: 'decimal', help: 'User 1 baseline: measured 45.5 in clear opening.' }),
      Object.freeze({ key: 'leftSupport', label: 'Left support thickness', unit: 'in', inputMode: 'decimal', help: 'Bounded-class side thickness currently carried explicitly by the candidate engine.' }),
      Object.freeze({ key: 'rightSupport', label: 'Right support thickness', unit: 'in', inputMode: 'decimal', help: 'Bounded-class side thickness currently carried explicitly by the candidate engine.' }),
      Object.freeze({ key: 'blankDepth', label: 'Shelf blank depth', unit: 'in', inputMode: 'decimal', help: 'User 1 baseline: 14 in. The visible control accepts fractions or decimals and resolves in 1/32 in increments.' }),
      Object.freeze({ key: 'blankThickness', label: 'Shelf blank thickness', unit: 'in', inputMode: 'decimal', help: 'Bounded-class blank thickness. Structural adequacy is not evaluated here.' }),
      Object.freeze({ key: 'shelfCount', label: 'Shelf count', unit: 'ea', inputMode: 'numeric', help: 'User 1 baseline: five shelf occurrences.' }),
      Object.freeze({ key: 'shelfHeights', label: 'Shelf heights', unit: 'in, comma-separated', inputMode: 'text', help: 'User preference carried with the candidate. Fractions or decimals are accepted; values must rise from bottom to top.' }),
      Object.freeze({ key: 'materialPreference', label: 'Material preference', unit: 'plain words', inputMode: 'text', help: 'Holder preference only. Store material identity, availability and price still require a Store answer.' }),
      Object.freeze({ key: 'backType', label: 'Back', unit: 'none | flush | recessed', inputMode: 'text', help: 'Holder-visible finished result. Machine operations are derived later; the user is not asked to choose a routing operation.' }),
      Object.freeze({ key: 'backMaterial', label: 'Back material', unit: 'plain words', inputMode: 'text', help: 'Used only when a back is selected: Match project material, Veneered panel, or MDF.' }),
      Object.freeze({ key: 'veneerSpecies', label: 'Veneer species', unit: 'plain words', inputMode: 'text', help: 'Used only for a veneered panel. It remains a holder preference until Store resolution.' }),
      Object.freeze({ key: 'backSetback', label: 'Back set back', unit: 'in', inputMode: 'decimal', help: 'Used only for a recessed back. Fractions or decimals are accepted and the visible control resolves in 1/32 in increments.' }),
    ]),
    examples: Object.freeze([
      Object.freeze({ id: 'user1-sarah-baseline', label: 'USE USER 1 BASELINE', basis: 'user1-sarah-baseline', configuration: ALCOVE_REFERENCE_EXAMPLE }),
    ]),
    exampleNote: 'User 1 baseline is 45.5 in opening, 0.75 in sides, 14 in depth, 0.75 in thickness, 5 shelves at 12 / 24 / 36 / 45 / 65 in, with Pine as the holder preference and no back selected. The candidate engine carries a 44.0 in nominal interior span before any later ordered-unit adjustment. The ordering/fit decision is intentionally not baked into this screen.',
  }),
  [PICNIC_CLASS_ID]: Object.freeze({
    classId: PICNIC_CLASS_ID,
    title: 'CLASSIC PICNIC TABLE — CANDIDATE FIXTURE',
    kicker: 'Second bounded class · shared runner proof + donor extension',
    lead: 'Product length drives candidate geometry. Requested scope and material are holder inputs only: they do not create Store availability, price, structural adequacy, machine support, production release, or fabrication authority.',
    fields: Object.freeze([
      Object.freeze({ key: 'productLength', label: 'Overall product length', unit: 'in', inputMode: 'decimal', help: 'Candidate input range 60–216 in. This range is only an application/demo bound, not a structural rule, Store stock limit, or machine envelope.' }),
      Object.freeze({ key: 'requestedScope', label: 'Requested scope', unit: 'complete-part-set | frame-kit', inputMode: 'text', help: 'Holder request only. “frame-kit” does not mean a Store or machine can fulfill it.' }),
      Object.freeze({ key: 'materialPreference', label: 'Material preference', unit: 'plain words', inputMode: 'text', help: 'Preference only. Store material identity, treatment/use category, SKU, availability and price remain unresolved.' }),
    ]),
    examples: Object.freeze(PICNIC_REFERENCE_EXAMPLES.map((example) => Object.freeze({
      id: example.id,
      label: example.label,
      basis: example.basis,
      configuration: Object.freeze({ productLength: example.productLength, requestedScope: example.requestedScope, materialPreference: example.materialPreference }),
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
      Object.freeze({ id: 'canonical-s001-reference', label: 'USE CANONICAL 4 × 8 EXAMPLE', basis: 'canonical-s001-centered-field-reference', configuration: S001_CENTERED_ARCH_DEFAULTS }),
    ]),
    exampleNote: 'Canonical project: 36 in opening width, 24 in straight height, 12 in rise. Total opening height is 36 in. The centered work field leaves 24 in of the full sheet at each long-axis end and 6 in at top/bottom outside the field.',
  }),
});

export function getClassConfigurator(classId) {
  return CLASS_CONFIGURATORS[classId] ?? null;
}
