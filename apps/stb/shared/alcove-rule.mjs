import { canonicalInchString } from './canonical.mjs';

export const ALCOVE_CLASS_ID = 'alcove-shelf-blanks';
export const ALCOVE_CLASS_VERSION = '0.1-reference';
export const ALCOVE_RULE_VERSION = 'alcove.shelf-blanks/0.1-candidate';
export const ALCOVE_DEFINITION_KIND = 'alcove.shelf-blanks.v1';

// User 1 is the single worked Alcove project in this build. These values are
// presentation/reference facts carried forward from the public review project.
// They are not personalization and they are not an ordering allowance.
export const ALCOVE_USER1_BASELINE = Object.freeze({
  actorId: 'user-1',
  projectLabel: 'Alcove shelf insert',
  openingWidthIn: 45.5,
  mantelHeightIn: 45,
  topShelfPreferenceIn: 65,
  floorSlopeDeg: 1.2,
  wallCondition: 'bowed-wall-recorded',
  shelfCount: 5,
  shelfDepthIn: 14,
  shelfThicknessIn: 0.75,
  shelfHeightsIn: Object.freeze([12, 24, 36, 45, 65]),
  materialPreference: 'Pine',
  sideThicknessIn: 0.75,
  orderedUnitAdjustmentIn: null,
  orderedUnitAdjustmentStatus: 'NOT_YET_DECIDED',
});

// The candidate engine still carries the two side members explicitly because
// downstream part derivation currently consumes them. The later ordering step
// may apply a holder-selected unit-width adjustment; that decision is not
// silently baked into this baseline.
export const ALCOVE_REFERENCE_EXAMPLE = Object.freeze({
  basis: 'user1-sarah-baseline',
  openingWidth: '45.5',
  leftSupport: '0.75',
  rightSupport: '0.75',
  blankDepth: '14',
  blankThickness: '0.75',
  shelfCount: '5',
  shelfHeights: '12, 24, 36, 45, 65',
  materialPreference: 'Pine',
});

const INPUT_KEYS = Object.freeze([
  'openingWidth',
  'leftSupport',
  'rightSupport',
  'blankDepth',
  'blankThickness',
  'shelfCount',
  'shelfHeights',
  'materialPreference',
]);

function raw(input, key) {
  const value = input?.[key];
  if (value && typeof value === 'object' && 'raw' in value) {
    return String(value.raw ?? '').trim();
  }
  return String(value ?? '').trim();
}

function parsePositiveInches(input, key, label, unresolved) {
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
  if (value <= 0) {
    unresolved.push(`nonpositive-${key}`);
    return null;
  }
  return {
    label,
    value,
    unit: 'in',
    canonical: canonicalInchString(value),
    raw: text,
  };
}

function parseCount(input, unresolved) {
  const text = raw(input, 'shelfCount');
  if (!text) {
    unresolved.push('missing-shelfCount');
    return null;
  }
  const value = Number(text);
  if (!Number.isInteger(value) || value <= 0) {
    unresolved.push('invalid-shelfCount');
    return null;
  }
  return {
    label: 'Shelf count',
    value,
    unit: 'ea',
    canonical: String(value),
    raw: text,
  };
}

function parseInchToken(token) {
  const text = String(token ?? '').trim();
  if (!text) return null;
  let match = text.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (match) {
    const denominator = Number(match[3]);
    if (!(denominator > 0)) return null;
    return Number(match[1]) + Number(match[2]) / denominator;
  }
  match = text.match(/^(\d+)\/(\d+)$/);
  if (match) {
    const denominator = Number(match[2]);
    if (!(denominator > 0)) return null;
    return Number(match[1]) / denominator;
  }
  const value = Number(text);
  return Number.isFinite(value) ? value : null;
}

function parseShelfHeights(input, shelfCount, unresolved) {
  const text = raw(input, 'shelfHeights');
  if (!text) {
    unresolved.push('missing-shelfHeights');
    return null;
  }
  const tokens = text.split(',').map((item) => item.trim()).filter(Boolean);
  if (!shelfCount || tokens.length < shelfCount.value) {
    unresolved.push('insufficient-shelfHeights');
    return null;
  }
  const values = tokens.slice(0, shelfCount.value).map(parseInchToken);
  if (values.some((value) => !Number.isFinite(value) || value <= 0)) {
    unresolved.push('invalid-shelfHeights');
    return null;
  }
  for (let index = 1; index < values.length; index += 1) {
    if (!(values[index] > values[index - 1])) {
      unresolved.push('shelfHeights-not-ascending');
      return null;
    }
  }
  return {
    label: 'Shelf heights',
    values,
    unit: 'in',
    canonical: values.map(canonicalInchString),
    raw: text,
  };
}

function parseMaterialPreference(input, unresolved) {
  const text = raw(input, 'materialPreference');
  if (!text) {
    unresolved.push('missing-materialPreference');
    return null;
  }
  return {
    label: 'Material preference',
    raw: text,
    canonical: text,
    authority: 'holder-preference',
  };
}

export function normalizeAlcoveConfiguration(input = {}, { basis = 'manual-entry' } = {}) {
  const normalized = {
    kind: 'alcove.shelf-blanks.config.v1',
    basis,
    inputs: {},
  };
  for (const key of INPUT_KEYS) {
    const value = raw(input.inputs ?? input, key);
    normalized.inputs[key] = {
      raw: value,
      unit: key === 'shelfCount' ? 'ea' : key === 'materialPreference' ? 'plain-words' : key === 'shelfHeights' ? 'in-list' : 'in',
      method: basis,
    };
  }
  return normalized;
}

export function evaluateAlcoveConfiguration(configuration) {
  const unresolved = [];
  const inputs = configuration?.inputs ?? configuration ?? {};
  const openingWidth = parsePositiveInches(inputs, 'openingWidth', 'Opening clear width', unresolved);
  const leftSupport = parsePositiveInches(inputs, 'leftSupport', 'Left support thickness', unresolved);
  const rightSupport = parsePositiveInches(inputs, 'rightSupport', 'Right support thickness', unresolved);
  const blankDepth = parsePositiveInches(inputs, 'blankDepth', 'Blank depth', unresolved);
  const blankThickness = parsePositiveInches(inputs, 'blankThickness', 'Blank thickness', unresolved);
  const shelfCount = parseCount(inputs, unresolved);
  const shelfHeights = parseShelfHeights(inputs, shelfCount, unresolved);
  const materialPreference = parseMaterialPreference(inputs, unresolved);

  let span = null;
  if (openingWidth && leftSupport && rightSupport) {
    const value = openingWidth.value - leftSupport.value - rightSupport.value;
    if (!(value > 0)) {
      unresolved.push('nonpositive-derived-span');
    } else {
      span = {
        label: 'Nominal interior shelf span before ordering adjustment',
        value,
        unit: 'in',
        canonical: canonicalInchString(value),
        formula: 'openingWidth - leftSupport - rightSupport',
      };
    }
  }

  const arithmeticValid = unresolved.length === 0;
  const engineeringUnresolved = arithmeticValid
    ? [
        'ORDERED_UNIT_ADJUSTMENT_NOT_DECIDED',
        'STRUCTURAL_SPAN_NOT_EVALUATED',
        'INSTALLATION_NOT_DEFINED',
        'STORE_RESOLUTION_NOT_EVALUATED',
      ]
    : [];

  return {
    valid: arithmeticValid,
    unresolvedReason: arithmeticValid ? null : unresolved[0],
    unresolvedInputs: unresolved,
    unresolvedConditions: engineeringUnresolved,
    inputs: {
      openingWidth,
      leftSupport,
      rightSupport,
      blankDepth,
      blankThickness,
      shelfCount,
      shelfHeights,
      materialPreference,
    },
    derived: {
      span,
    },
    disclosure: 'Arithmetic completeness is not the holder\'s ordered-size decision, structural adequacy, Store support, production release, machine readiness, or fabrication authorization.',
  };
}
