export const PROVISIONAL_MATERIAL_STATUS = Object.freeze({
  PROVISIONAL: 'PROVISIONAL',
  RESOLVED_TO_STORE_SKU: 'RESOLVED_TO_STORE_SKU',
  KEPT_UNRESOLVED: 'KEPT_UNRESOLVED',
  REMOVED_OR_REPLACED: 'REMOVED_OR_REPLACED',
});

export const PROVISIONAL_CATALOG_STATUS = 'NOT_IN_STORE_CATALOG';
export const PROVISIONAL_GATE_STATUS = 'HUMAN_RESOLUTION_REQUIRED';

export const PROVISIONAL_DECISIONS = Object.freeze({
  MAP_TO_STORE_OFFERING: 'MAP_TO_STORE_OFFERING',
  KEEP_UNRESOLVED: 'KEEP_UNRESOLVED',
  REMOVE_OR_REPLACE: 'REMOVE_OR_REPLACE',
});

const ALLOWED_DECISIONS = new Set(Object.values(PROVISIONAL_DECISIONS));

function nonempty(name, value) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new TypeError(`${name} must be a non-empty string`);
  }
  return value.trim();
}

function finitePositiveOrNull(name, value) {
  if (value == null) return null;
  if (!Number.isFinite(value) || value <= 0) {
    throw new TypeError(`${name} must be a positive finite number when supplied`);
  }
  return value;
}

function copyRequestedOps(value) {
  if (value == null) return [];
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || item.length === 0)) {
    throw new TypeError('requestedOps must be an array of non-empty strings');
  }
  return [...new Set(value)];
}

export function createProvisionalMaterial({
  provisionalMaterialId,
  form,
  species = null,
  grade = null,
  nominalThicknessIn = null,
  nominalWidthIn = null,
  parentWidthIn = null,
  parentLengthIn = null,
  requestedOps = [],
  source = null,
} = {}) {
  const id = nonempty('provisionalMaterialId', provisionalMaterialId);
  if (!id.startsWith('PROVISIONAL-')) {
    throw new TypeError('provisionalMaterialId must begin with PROVISIONAL-');
  }
  const normalizedForm = nonempty('form', form);
  if (!['board', 'sheet'].includes(normalizedForm)) {
    throw new TypeError('form must be board or sheet');
  }

  return Object.freeze({
    provisionalMaterialId: id,
    status: PROVISIONAL_MATERIAL_STATUS.PROVISIONAL,
    catalogStatus: PROVISIONAL_CATALOG_STATUS,
    declaredMaterial: Object.freeze({
      form: normalizedForm,
      species: species == null ? null : String(species),
      grade: grade == null ? null : String(grade),
      nominalThicknessIn: finitePositiveOrNull('nominalThicknessIn', nominalThicknessIn),
      nominalWidthIn: finitePositiveOrNull('nominalWidthIn', nominalWidthIn),
      parentWidthIn: finitePositiveOrNull('parentWidthIn', parentWidthIn),
      parentLengthIn: finitePositiveOrNull('parentLengthIn', parentLengthIn),
    }),
    requestedOps: Object.freeze(copyRequestedOps(requestedOps)),
    source: source ?? null,

    storeSku: null,
    storeDisposition: 'UNRESOLVED',
    sellingPrice: null,
    stockStatus: null,
    supportedOps: null,
    cellFamily: null,

    cleanupRequired: true,
    cleanupAction: 'MAP_TO_REAL_STORE_OFFERING_OR_REMOVE',
    authority: false,
    commercial: false,
    physical: false,
  });
}

export function evaluateProvisionalMaterialGate(entry, { consequential = true } = {}) {
  if (!entry || entry.status !== PROVISIONAL_MATERIAL_STATUS.PROVISIONAL) {
    return Object.freeze({
      gate: 'NOT_APPLICABLE',
      blocked: false,
      humanDecisionRequired: false,
      reason: null,
    });
  }

  if (!consequential) {
    return Object.freeze({
      gate: 'PROVISIONAL_RETAINED',
      blocked: false,
      humanDecisionRequired: false,
      reason: 'PROVISIONAL_MATERIAL_NOT_YET_CONSEQUENTIAL',
    });
  }

  return Object.freeze({
    gate: PROVISIONAL_GATE_STATUS,
    blocked: true,
    humanDecisionRequired: true,
    reason: 'PROVISIONAL_MATERIAL_REQUIRES_HUMAN_RESOLUTION_BEFORE_SUPPORTED_REVIEW',
    allowedDecisions: Object.freeze([...ALLOWED_DECISIONS]),
    storeOverrideAllowed: false,
    fabricationAuthorityAllowed: false,
  });
}

export function decideProvisionalMaterial(entry, {
  decision,
  storeSku = null,
  reason = null,
  decidedBy = 'human',
  decidedAt = null,
} = {}) {
  if (!entry || entry.status !== PROVISIONAL_MATERIAL_STATUS.PROVISIONAL) {
    throw new TypeError('decision requires a PROVISIONAL material entry');
  }
  if (!ALLOWED_DECISIONS.has(decision)) {
    throw new TypeError('unsupported provisional-material decision');
  }
  if (decidedBy !== 'human') {
    throw new TypeError('provisional-material resolution must be a human decision');
  }

  const common = {
    provisionalMaterialId: entry.provisionalMaterialId,
    decision,
    decidedBy: 'human',
    decidedAt: decidedAt ?? null,
    reason: reason ?? null,
    authority: false,
    commercial: false,
    physical: false,
    storeOverrideAllowed: false,
  };

  if (decision === PROVISIONAL_DECISIONS.MAP_TO_STORE_OFFERING) {
    const mappedSku = nonempty('storeSku', storeSku);
    return Object.freeze({
      ...common,
      status: PROVISIONAL_MATERIAL_STATUS.RESOLVED_TO_STORE_SKU,
      storeSku: mappedSku,
      requiresNewCandidateRevision: true,
      requiresNewStoreQuestion: true,
      requiresNewReview: true,
      storeDisposition: null,
      note:
        'Human selected a Store offering identity. Store must evaluate the new candidate revision; this decision does not make the job SUPPORTABLE.',
    });
  }

  if (storeSku != null) {
    throw new TypeError('storeSku is allowed only when mapping to a Store offering');
  }

  if (decision === PROVISIONAL_DECISIONS.KEEP_UNRESOLVED) {
    return Object.freeze({
      ...common,
      status: PROVISIONAL_MATERIAL_STATUS.KEPT_UNRESOLVED,
      storeSku: null,
      requiresNewCandidateRevision: false,
      requiresNewStoreQuestion: false,
      requiresNewReview: false,
      storeDisposition: 'UNRESOLVED',
      reviewMode: 'UNRESOLVED_ONLY',
      note:
        'Material identity remains provisional. A complete supported review is blocked; unresolved acknowledgment may remain available.',
    });
  }

  return Object.freeze({
    ...common,
    status: PROVISIONAL_MATERIAL_STATUS.REMOVED_OR_REPLACED,
    storeSku: null,
    requiresNewCandidateRevision: true,
    requiresNewStoreQuestion: false,
    requiresNewReview: true,
    storeDisposition: 'UNRESOLVED',
    note:
      'The provisional material is removed from the active candidate or replaced by a new material entry. Any consequential replacement must be evaluated separately.',
  });
}

export function provisionalMaterialAuditRecord(entry, gate, decisionRecord = null) {
  return Object.freeze({
    kind: 'provisional-material-audit/v1',
    provisionalMaterialId: entry?.provisionalMaterialId ?? null,
    materialStatus: entry?.status ?? null,
    catalogStatus: entry?.catalogStatus ?? null,
    requestedOps: Array.isArray(entry?.requestedOps) ? [...entry.requestedOps] : [],
    gate: gate?.gate ?? null,
    humanDecisionRequired: gate?.humanDecisionRequired === true,
    decision: decisionRecord?.decision ?? null,
    mappedStoreSku: decisionRecord?.storeSku ?? null,
    requiresNewStoreQuestion: decisionRecord?.requiresNewStoreQuestion === true,
    storeOverrideAllowed: false,
    authority: false,
  });
}
