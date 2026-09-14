import { canonicalInchString } from './canonical.mjs';

export const ALCOVE_CLASS_ID = 'alcove-shelf-blanks';
export const ALCOVE_CLASS_VERSION = '0.1-reference';
export const ALCOVE_RULE_VERSION = 'alcove.shelf-blanks/0.1-candidate';
export const ALCOVE_DEFINITION_KIND = 'alcove.shelf-blanks.v1';

export const ALCOVE_REFERENCE_EXAMPLE = Object.freeze({
  basis: 'published-reference-example',
  openingWidth: '46.25',
  leftSupport: '0.75',
  rightSupport: '0.75',
  blankDepth: '11.00',
  blankThickness: '0.75',
  shelfCount: '3',
});

const INPUT_KEYS = Object.freeze([
  'openingWidth',
  'leftSupport',
  'rightSupport',
  'blankDepth',
  'blankThickness',
  'shelfCount',
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
      unit: key === 'shelfCount' ? 'ea' : 'in',
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

  let span = null;
  if (openingWidth && leftSupport && rightSupport) {
    const value = openingWidth.value - leftSupport.value - rightSupport.value;
    if (!(value > 0)) {
      unresolved.push('nonpositive-derived-span');
    } else {
      span = {
        label: 'Derived shelf span',
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
        'STRUCTURAL_SPAN_NOT_EVALUATED',
        'SHELF_ELEVATIONS_UNRESOLVED',
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
    },
    derived: {
      span,
    },
    disclosure: 'Arithmetic completeness is not structural adequacy, Store support, production release, machine readiness, or fabrication authorization.',
  };
}
