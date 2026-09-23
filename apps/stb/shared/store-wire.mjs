import { canonicalInchString, canonicalJson, sha256Hex } from './canonical.mjs';
import {
  ALCOVE_INSERT_DEFINITION,
  BOARD_DEFINITION,
  BOARD_OFFERING_QUERY,
  MAX_STORE_RESPONSE_BYTES,
  PUBLISHED_BOARD_SKU,
  STORE_CLIENT_TIMEOUT_MS,
  STORE_JOB_STATUSES,
  STORE_PATHS,
  STORE_PIN,
  STORE_FRESH_EVALUATION_RULE_ID,
  STORE_PROTOCOL_VERSION,
  STORE_REQUEST_TYPES,
  STORE_SCOPES,
  USER_DEFINED_BOARD_DEFINITION,
  USER_DEFINED_BOARD_MATERIAL_DEMAND,
  WRAPPER_BUILD_ID,
} from './contracts.mjs';

export const ADAPTER_ERROR_CODES = Object.freeze({
  STORE_SOURCE_UNAVAILABLE: 'STORE_SOURCE_UNAVAILABLE',
  STORE_PIN_MISMATCH: 'STORE_PIN_MISMATCH',
  STORE_CHECKOUT_DIRTY: 'STORE_CHECKOUT_DIRTY',
  MISSING_STORE_MODULE: 'MISSING_STORE_MODULE',
  UNSUPPORTED_PROTOCOL: 'UNSUPPORTED_PROTOCOL',
  INVALID_CONTENT_TYPE: 'INVALID_CONTENT_TYPE',
  MALFORMED_REQUEST: 'MALFORMED_REQUEST',
  REQUEST_TOO_LARGE: 'REQUEST_TOO_LARGE',
  PAYLOAD_DIGEST_MISMATCH: 'PAYLOAD_DIGEST_MISMATCH',
  INVALID_BOUNDED_SCOPE: 'INVALID_BOUNDED_SCOPE',
  OFFERING_INCOMPLETE: 'OFFERING_INCOMPLETE',
  ESTIMATE_FAILED: 'ESTIMATE_FAILED',
});

export const APP_DIAGNOSTICS = Object.freeze({
  APP_TRANSPORT_ERROR: 'APP_TRANSPORT_ERROR',
  APP_MALFORMED_RESPONSE: 'APP_MALFORMED_RESPONSE',
  APP_CORRELATION_ERROR: 'APP_CORRELATION_ERROR',
  APP_ATTEMPT_INTERRUPTED: 'APP_ATTEMPT_INTERRUPTED',
  APP_ADAPTER_ERROR: 'APP_ADAPTER_ERROR',
});

const ENVELOPE_FIELDS = Object.freeze([
  'protocolVersion',
  'requestId',
  'projectId',
  'candidateRevisionId',
  'requestType',
  'scope',
  'demandSignature',
  'querySignature',
  'payloadDigest',
  'expectedStorePin',
  'attemptId',
  'attemptNumber',
  'sentAt',
  'payload',
]);

function fail(code, details) {
  return { ok: false, code, details };
}

function requireNonemptyString(name, value) {
  if (typeof value !== 'string' || value.length === 0) {
    return `${name} must be a nonempty string`;
  }
  return null;
}

export function isJsonContentType(value) {
  if (typeof value !== 'string') {
    return false;
  }
  return value.split(';')[0].trim().toLowerCase() === 'application/json';
}

export async function digestCanonical(value) {
  return sha256Hex(new TextEncoder().encode(canonicalJson(value)));
}

export async function payloadDigest(payload) {
  return digestCanonical(payload);
}

export function isKnownJobStatus(status) {
  return STORE_JOB_STATUSES.includes(status);
}

export function parseCanonicalInch(value) {
  if (typeof value !== 'string' || !/^-?\d+(\.\d+)?$/.test(value)) {
    return { ok: false, reason: 'keptLength.value must be a canonical inch decimal string' };
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return { ok: false, reason: 'keptLength.value is not finite' };
  }
  if (canonicalInchString(numeric) !== value) {
    return { ok: false, reason: 'keptLength.value is not canonical' };
  }
  return { ok: true, value: numeric, canonical: value };
}

function sameOfferingQuery(payload) {
  return (
    payload.species === BOARD_OFFERING_QUERY.species &&
    payload.form === BOARD_OFFERING_QUERY.form &&
    payload.nominalT === BOARD_OFFERING_QUERY.nominalT &&
    payload.nominalW === BOARD_OFFERING_QUERY.nominalW &&
    payload.stockL_in === BOARD_OFFERING_QUERY.stockL_in
  );
}

function validateOfferingPayload(payload) {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    return fail(ADAPTER_ERROR_CODES.MALFORMED_REQUEST, 'offering payload must be an object');
  }
  const keys = Object.keys(payload).sort();
  if (payload.requestedStoreSku !== undefined) {
    const skuError = requireNonemptyString('requestedStoreSku', payload.requestedStoreSku);
    if (skuError) {
      return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, skuError);
    }
    if (payload.requestedStoreSku !== PUBLISHED_BOARD_SKU) {
      return fail(
        ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE,
        'offering lookup accepts only the published Board SKU or its frozen equivalent query',
      );
    }
    const extra = keys.filter((key) => key !== 'requestedStoreSku');
    if (extra.length > 0 && !sameOfferingQuery(payload)) {
      return fail(
        ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE,
        'offering lookup does not accept additional query fields unless they match the frozen Board query',
      );
    }
    if (extra.length > 0 && sameOfferingQuery(payload)) {
      const allowed = new Set(['requestedStoreSku', ...Object.keys(BOARD_OFFERING_QUERY)]);
      if (keys.some((key) => !allowed.has(key))) {
        return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'unexpected offering query fields');
      }
    }
    return { ok: true, kind: 'sku', storeSku: payload.requestedStoreSku };
  }
  if (sameOfferingQuery(payload) && keys.every((key) => key in BOARD_OFFERING_QUERY)) {
    return { ok: true, kind: 'query', query: { ...BOARD_OFFERING_QUERY } };
  }
  return fail(
    ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE,
    'offering lookup accepts only the published Board SKU or its frozen equivalent query',
  );
}

function validateJobPayload(payload) {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    return fail(ADAPTER_ERROR_CODES.MALFORMED_REQUEST, 'job payload must be an object');
  }
  const extra = Object.keys(payload).filter(
    (key) => key !== 'line' && key !== 'definitionKind' && key !== 'ruleVersion',
  );
  if (extra.length > 0) {
    return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'unexpected job payload fields');
  }
  if (payload.definitionKind !== BOARD_DEFINITION.kind) {
    return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'definitionKind must be board.square.v1');
  }
  if (payload.ruleVersion !== BOARD_DEFINITION.ruleVersion) {
    return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'ruleVersion must match the Board slice');
  }
  const line = payload.line;
  if (line === null || typeof line !== 'object' || Array.isArray(line)) {
    return fail(ADAPTER_ERROR_CODES.MALFORMED_REQUEST, 'job payload requires one line');
  }
  const lineKeys = Object.keys(line);
  const allowedLine = new Set(['lineId', 'storeSku', 'quantity', 'unit', 'requiredOps', 'keptLength']);
  if (lineKeys.some((key) => !allowedLine.has(key))) {
    return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'unexpected job line fields');
  }
  const lineIdError = requireNonemptyString('lineId', line.lineId);
  if (lineIdError) {
    return fail(ADAPTER_ERROR_CODES.MALFORMED_REQUEST, lineIdError);
  }
  const skuError = requireNonemptyString('storeSku', line.storeSku);
  if (skuError) {
    return fail(ADAPTER_ERROR_CODES.MALFORMED_REQUEST, skuError);
  }
  if (line.quantity !== 1) {
    return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'Board job quantity must be 1');
  }
  if (line.unit !== 'ea') {
    return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'Board job unit must be ea');
  }
  if (
    !Array.isArray(line.requiredOps) ||
    line.requiredOps.length !== 1 ||
    line.requiredOps[0] !== 'CROSSCUT'
  ) {
    return fail(
      ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE,
      'Board job requiredOps must be exactly ["CROSSCUT"]',
    );
  }
  const kept = line.keptLength;
  if (kept === null || typeof kept !== 'object' || Array.isArray(kept)) {
    return fail(ADAPTER_ERROR_CODES.MALFORMED_REQUEST, 'keptLength must be an object');
  }
  if (kept.unit !== BOARD_DEFINITION.unit) {
    return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'keptLength.unit must be in');
  }
  const parsed = parseCanonicalInch(kept.value);
  if (!parsed.ok) {
    return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, parsed.reason);
  }
  if (parsed.value < BOARD_DEFINITION.minInches || parsed.value > BOARD_DEFINITION.maxInches) {
    return fail(
      ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE,
      'Board kept length must be 24–60 in inclusive',
    );
  }
  return {
    ok: true,
    line: {
      lineId: line.lineId,
      storeSku: line.storeSku,
      quantity: 1,
      unit: 'ea',
      requiredOps: ['CROSSCUT'],
      keptLength: { value: parsed.canonical, unit: 'in' },
      keptLengthIn: parsed.value,
    },
    definitionKind: BOARD_DEFINITION.kind,
    ruleVersion: BOARD_DEFINITION.ruleVersion,
  };
}

function validateUserDefinedBoardPayload(payload) {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    return fail(ADAPTER_ERROR_CODES.MALFORMED_REQUEST, 'user-defined board payload must be an object');
  }
  const extra = Object.keys(payload).filter(
    (key) => key !== 'line' && key !== 'definitionKind' && key !== 'ruleVersion',
  );
  if (extra.length > 0) {
    return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'unexpected user-defined board payload fields');
  }
  if (payload.definitionKind !== USER_DEFINED_BOARD_DEFINITION.kind) {
    return fail(
      ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE,
      'definitionKind must be user_defined_board.v1',
    );
  }
  if (payload.ruleVersion !== USER_DEFINED_BOARD_DEFINITION.ruleVersion) {
    return fail(
      ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE,
      'ruleVersion must match the user-defined Board slice',
    );
  }

  const line = payload.line;
  if (line === null || typeof line !== 'object' || Array.isArray(line)) {
    return fail(ADAPTER_ERROR_CODES.MALFORMED_REQUEST, 'user-defined Board payload requires one line');
  }
  const allowedLine = new Set([
    'lineId',
    'configurationId',
    'configurationVersion',
    'materialDemand',
    'quantity',
    'unit',
    'requiredOps',
    'definedWorkpieceLength',
    'sawCuts',
    'sawAngleDeg',
    'drillCycles',
    'drillDepthIn',
    'cutPlane',
    'endIdentity',
    'endRelation',
    'lengthDatum',
    'datumCMethod',
    'parts',
    'spotDemand',
    'unresolvedConditions',
    'materialSource',
  ]);
  if (Object.keys(line).some((key) => !allowedLine.has(key))) {
    return fail(
      ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE,
      'unexpected user-defined Board line fields',
    );
  }

  for (const key of ['lineId', 'configurationId', 'configurationVersion']) {
    const error = requireNonemptyString(key, line[key]);
    if (error) return fail(ADAPTER_ERROR_CODES.MALFORMED_REQUEST, error);
  }

  if (line.materialDemand === null || typeof line.materialDemand !== 'object' || Array.isArray(line.materialDemand)) {
    return fail(
      ADAPTER_ERROR_CODES.MALFORMED_REQUEST,
      'user-defined Board request requires materialDemand',
    );
  }
  for (const key of ['species', 'form', 'nominalT', 'nominalW']) {
    if (line.materialDemand[key] !== USER_DEFINED_BOARD_MATERIAL_DEMAND[key]) {
      return fail(
        ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE,
        'user-defined Board materialDemand must match the frozen User 1 SPF 2x4 demand',
      );
    }
  }
  if (Object.keys(line.materialDemand).some((key) => !Object.hasOwn(USER_DEFINED_BOARD_MATERIAL_DEMAND, key))) {
    return fail(
      ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE,
      'user-defined Board materialDemand contains unexpected fields',
    );
  }
  if (line.quantity !== USER_DEFINED_BOARD_DEFINITION.quantity || line.unit !== 'ea') {
    return fail(
      ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE,
      'user-defined Board quantity must be exactly 1 ea',
    );
  }

  if (!Array.isArray(line.requiredOps) || line.requiredOps.length === 0) {
    return fail(
      ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE,
      'user-defined Board requiredOps must be a nonempty array',
    );
  }
  const allowedOps = new Set(USER_DEFINED_BOARD_DEFINITION.allowedOps);
  if (line.requiredOps.some((op) => !allowedOps.has(op))) {
    return fail(
      ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE,
      'user-defined Board requiredOps contain an unsupported operation name',
    );
  }
  if (new Set(line.requiredOps).size !== line.requiredOps.length) {
    return fail(
      ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE,
      'user-defined Board requiredOps must not contain duplicates',
    );
  }

  const workpiece = line.definedWorkpieceLength;
  if (workpiece === null || typeof workpiece !== 'object' || Array.isArray(workpiece)) {
    return fail(
      ADAPTER_ERROR_CODES.MALFORMED_REQUEST,
      'definedWorkpieceLength must be an object',
    );
  }
  if (workpiece.unit !== USER_DEFINED_BOARD_DEFINITION.unit) {
    return fail(
      ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE,
      'definedWorkpieceLength.unit must be in',
    );
  }
  const parsed = parseCanonicalInch(workpiece.value);
  if (!parsed.ok) return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, parsed.reason);
  if (
    parsed.value < USER_DEFINED_BOARD_DEFINITION.minWorkpieceInches ||
    parsed.value > USER_DEFINED_BOARD_DEFINITION.maxWorkpieceInches
  ) {
    return fail(
      ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE,
      'defined workpiece length must be 24–60 in inclusive',
    );
  }

  if (!Number.isInteger(line.sawCuts) || line.sawCuts < 1 || line.sawCuts > 8) {
    return fail(
      ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE,
      'sawCuts must be an integer from 1 through 8',
    );
  }
  if (
    typeof line.sawAngleDeg !== 'number' ||
    !Number.isFinite(line.sawAngleDeg) ||
    line.sawAngleDeg < 0 ||
    line.sawAngleDeg >= 90
  ) {
    return fail(
      ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE,
      'sawAngleDeg must be a finite single-plane angle from 0 up to but not including 90; Store owns machine limits',
    );
  }
  if (!Number.isInteger(line.drillCycles) || line.drillCycles < 0 || line.drillCycles > 16) {
    return fail(
      ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE,
      'drillCycles must be an integer from 0 through 16',
    );
  }
  if (line.sawAngleDeg > 0 && !line.requiredOps.includes('MITER_LIMITED')) {
    return fail(
      ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE,
      'nonzero saw angle requires MITER_LIMITED demand',
    );
  }
  if (line.drillCycles > 0 && !line.requiredOps.includes('DRILL')) {
    return fail(
      ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE,
      'positive drillCycles requires DRILL demand',
    );
  }
  if (line.drillCycles > 0 && !(Number.isFinite(line.drillDepthIn) && line.drillDepthIn > 0)) {
    return fail(
      ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE,
      'positive drillCycles requires explicit positive drillDepthIn',
    );
  }

  for (const key of ['cutPlane', 'endIdentity', 'endRelation', 'lengthDatum', 'materialSource']) {
    if (line[key] != null && (typeof line[key] !== 'string' || line[key].trim() === '')) {
      return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, key + ' must be a nonempty string when supplied');
    }
  }

  if (typeof line.datumCMethod !== 'string' || line.datumCMethod.trim() === '') {
    return fail(
      ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE,
      'datumCMethod must be a nonempty project-supplied reference-establishment method; Store owns admissibility',
    );
  }

  if (
    line.unresolvedConditions != null &&
    (!Array.isArray(line.unresolvedConditions) ||
      line.unresolvedConditions.some((item) => typeof item !== 'string' || item.trim() === ''))
  ) {
    return fail(
      ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE,
      'unresolvedConditions must be an array of nonempty strings when supplied',
    );
  }

  if (!Array.isArray(line.parts) || line.parts.length === 0) {
    return fail(
      ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE,
      'user-defined Board requires identified parts and part-relative features',
    );
  }
  const partIds = new Set();
  let derivedSpotCount = 0;
  const parts = [];
  for (const rawPart of line.parts) {
    if (rawPart === null || typeof rawPart !== 'object' || Array.isArray(rawPart)) {
      return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'each part must be an object');
    }
    const extraPart = Object.keys(rawPart).filter((key) => !['partId', 'lengthIn', 'features'].includes(key));
    if (extraPart.length) {
      return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'unexpected part fields');
    }
    const partIdError = requireNonemptyString('partId', rawPart.partId);
    if (partIdError || partIds.has(rawPart.partId)) {
      return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'partId must be nonempty and unique');
    }
    partIds.add(rawPart.partId);
    if (!Number.isFinite(rawPart.lengthIn) || rawPart.lengthIn <= 0) {
      return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'part lengthIn must be positive and finite');
    }
    if (!Array.isArray(rawPart.features)) {
      return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'part features must be an array');
    }
    const features = [];
    const featureIds = new Set();
    for (const feature of rawPart.features) {
      if (feature === null || typeof feature !== 'object' || Array.isArray(feature)) {
        return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'each part feature must be an object');
      }
      const extraFeature = Object.keys(feature).filter(
        (key) => !['featureId', 'kind', 'xIn', 'locationRule', 'acrossWidthRule'].includes(key),
      );
      if (extraFeature.length) {
        return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'unexpected part feature fields');
      }
      const featureIdError = requireNonemptyString('featureId', feature.featureId);
      if (featureIdError || featureIds.has(feature.featureId)) {
        return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'featureId must be nonempty and unique within a part');
      }
      featureIds.add(feature.featureId);
      if (feature.kind !== 'SPOT_ON_LOCATION') {
        return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'only SPOT_ON_LOCATION is admitted on the User 1 feature contract');
      }
      if (!Number.isFinite(feature.xIn) || feature.xIn < 0 || feature.xIn > rawPart.lengthIn) {
        return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'spot xIn must lie on its identified part');
      }
      if (feature.locationRule !== 'CENTERED_ON_PART') {
        return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'spot locationRule must be CENTERED_ON_PART');
      }
      if (feature.acrossWidthRule !== 'CENTERED_ON_WIDE_FACE') {
        return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'spot acrossWidthRule must be CENTERED_ON_WIDE_FACE');
      }
      derivedSpotCount += 1;
      features.push({ ...feature });
    }
    parts.push({ partId: rawPart.partId, lengthIn: rawPart.lengthIn, features });
  }

  if (line.spotDemand != null) {
    if (typeof line.spotDemand !== 'object' || Array.isArray(line.spotDemand)) {
      return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'spotDemand must be an object when supplied');
    }
    if (line.spotDemand.mode !== 'SPOT_ON_LOCATION') {
      return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'spotDemand mode must be SPOT_ON_LOCATION');
    }
    if (
      Number.isFinite(Number(line.spotDemand.totalCount)) &&
      Number(line.spotDemand.totalCount) !== derivedSpotCount
    ) {
      return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'spotDemand totalCount must match identified part features');
    }
  }

  return {
    ok: true,
    line: {
      lineId: line.lineId,
      configurationId: line.configurationId,
      configurationVersion: line.configurationVersion,
      materialDemand: { ...line.materialDemand },
      quantity: 1,
      unit: 'ea',
      requiredOps: [...line.requiredOps],
      definedWorkpieceLength: { value: parsed.canonical, unit: 'in' },
      definedWorkpieceLengthIn: parsed.value,
      sawCuts: line.sawCuts,
      sawAngleDeg: line.sawAngleDeg,
      drillCycles: line.drillCycles,
      drillDepthIn: line.drillDepthIn ?? null,
      cutPlane: line.cutPlane ?? null,
      endIdentity: line.endIdentity ?? null,
      endRelation: line.endRelation ?? null,
      lengthDatum: line.lengthDatum ?? null,
      datumCMethod: line.datumCMethod,
      parts,
      spotDemand: line.spotDemand ?? null,
      unresolvedConditions: [...(line.unresolvedConditions ?? [])],
      materialSource: line.materialSource ?? null,
    },
    definitionKind: USER_DEFINED_BOARD_DEFINITION.kind,
    ruleVersion: USER_DEFINED_BOARD_DEFINITION.ruleVersion,
  };
}


function validateAlcoveInsertPayload(payload) {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    return fail(ADAPTER_ERROR_CODES.MALFORMED_REQUEST, 'Alcove payload must be an object');
  }
  const extra = Object.keys(payload).filter(
    (key) => key !== 'definition' && key !== 'definitionKind' && key !== 'ruleVersion',
  );
  if (extra.length) {
    return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'unexpected Alcove payload fields');
  }
  if (payload.definitionKind !== ALCOVE_INSERT_DEFINITION.kind) {
    return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'definitionKind must be alcove_insert.v1');
  }
  if (payload.ruleVersion !== ALCOVE_INSERT_DEFINITION.ruleVersion) {
    return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'ruleVersion must match the Alcove slice');
  }

  const definition = payload.definition;
  if (definition === null || typeof definition !== 'object' || Array.isArray(definition)) {
    return fail(ADAPTER_ERROR_CODES.MALFORMED_REQUEST, 'Alcove payload requires one definition');
  }
  const allowedDefinition = new Set([
    'configurationId',
    'configurationVersion',
    'materialDemand',
    'boardRequirements',
    'hardwareDemand',
    'spotDemand',
    'unresolvedConditions',
    'materialSource',
  ]);
  if (Object.keys(definition).some((key) => !allowedDefinition.has(key))) {
    return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'unexpected Alcove definition fields');
  }
  for (const key of ['configurationId', 'configurationVersion']) {
    const error = requireNonemptyString(key, definition[key]);
    if (error) return fail(ADAPTER_ERROR_CODES.MALFORMED_REQUEST, error);
  }

  const material = definition.materialDemand;
  if (material === null || typeof material !== 'object' || Array.isArray(material)) {
    return fail(ADAPTER_ERROR_CODES.MALFORMED_REQUEST, 'Alcove definition requires materialDemand');
  }
  const allowedMaterial = new Set(['species', 'form', 'nominalT', 'nominalW', 'grade']);
  if (Object.keys(material).some((key) => !allowedMaterial.has(key))) {
    return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'unexpected Alcove materialDemand fields');
  }
  const speciesError = requireNonemptyString('materialDemand.species', material.species);
  if (speciesError) return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, speciesError);
  if (
    material.form !== ALCOVE_INSERT_DEFINITION.materialForm ||
    material.nominalT !== ALCOVE_INSERT_DEFINITION.nominalT ||
    material.nominalW !== ALCOVE_INSERT_DEFINITION.nominalW
  ) {
    return fail(
      ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE,
      'Alcove materialDemand must remain a nominal 1x6 board class; Store owns the SKU answer',
    );
  }
  if (material.grade != null && (typeof material.grade !== 'string' || material.grade.trim() === '')) {
    return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'materialDemand.grade must be a nonempty string when supplied');
  }

  if (!Array.isArray(definition.boardRequirements) || definition.boardRequirements.length === 0) {
    return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'Alcove requires project-derived boardRequirements');
  }
  const requirementIds = new Set();
  const boardRequirements = [];
  for (const raw of definition.boardRequirements) {
    if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
      return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'each Alcove board requirement must be an object');
    }
    const allowed = new Set([
      'requirementId',
      'role',
      'stockLengthIn',
      'keptLengthIn',
      'qty',
      'requiredOps',
      'carriesSpotDemand',
    ]);
    if (Object.keys(raw).some((key) => !allowed.has(key))) {
      return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'unexpected Alcove board requirement fields');
    }
    const requirementIdError = requireNonemptyString('requirementId', raw.requirementId);
    const roleError = requireNonemptyString('role', raw.role);
    if (requirementIdError || roleError || requirementIds.has(raw.requirementId)) {
      return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'Alcove requirementId must be nonempty and unique and role must be nonempty');
    }
    requirementIds.add(raw.requirementId);
    if (!Number.isFinite(raw.stockLengthIn) || raw.stockLengthIn <= 0) {
      return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'Alcove stockLengthIn must be positive and finite');
    }
    if (!Number.isFinite(raw.keptLengthIn) || raw.keptLengthIn <= 0) {
      return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'Alcove keptLengthIn must be positive and finite');
    }
    if (!Number.isInteger(raw.qty) || raw.qty < 1 || raw.qty > 100) {
      return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'Alcove requirement qty must be an integer from 1 through 100');
    }
    if (!Array.isArray(raw.requiredOps) || raw.requiredOps.length === 0) {
      return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'Alcove requiredOps must be a nonempty array');
    }
    const allowedOps = new Set(['CROSSCUT', 'SPOT_ON_LOCATION']);
    if (raw.requiredOps.some((op) => !allowedOps.has(op)) || new Set(raw.requiredOps).size !== raw.requiredOps.length) {
      return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'Alcove requiredOps must use unique declared project operation names');
    }
    if (raw.carriesSpotDemand != null && typeof raw.carriesSpotDemand !== 'boolean') {
      return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'carriesSpotDemand must be boolean when supplied');
    }
    boardRequirements.push({
      requirementId: raw.requirementId,
      role: raw.role,
      stockLengthIn: raw.stockLengthIn,
      keptLengthIn: raw.keptLengthIn,
      qty: raw.qty,
      requiredOps: [...raw.requiredOps],
      carriesSpotDemand: raw.carriesSpotDemand === true,
    });
  }

  let hardwareDemand = null;
  if (definition.hardwareDemand != null) {
    const hardware = definition.hardwareDemand;
    if (typeof hardware !== 'object' || Array.isArray(hardware)) {
      return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'hardwareDemand must be an object when supplied');
    }
    if (Object.keys(hardware).some((key) => !['storeSku', 'qty'].includes(key))) {
      return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'unexpected hardwareDemand fields');
    }
    const hardwareSkuError = requireNonemptyString('hardwareDemand.storeSku', hardware.storeSku);
    if (hardwareSkuError || !Number.isInteger(hardware.qty) || hardware.qty < 1 || hardware.qty > 20) {
      return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'hardwareDemand requires Store SKU and positive integer qty');
    }
    hardwareDemand = { storeSku: hardware.storeSku, qty: hardware.qty };
  }

  let spotDemand = null;
  if (definition.spotDemand != null) {
    const spot = definition.spotDemand;
    if (typeof spot !== 'object' || Array.isArray(spot)) {
      return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'spotDemand must be an object when supplied');
    }
    const allowedSpot = new Set(['enabled', 'mode', 'toolDiameterIn', 'source', 'features']);
    if (Object.keys(spot).some((key) => !allowedSpot.has(key))) {
      return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'unexpected Alcove spotDemand fields');
    }
    if (typeof spot.enabled !== 'boolean' || spot.mode !== 'SPOT_ON_LOCATION') {
      return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'Alcove spotDemand must declare enabled and SPOT_ON_LOCATION');
    }
    if (!Number.isFinite(spot.toolDiameterIn) || spot.toolDiameterIn <= 0) {
      return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'Alcove spot toolDiameterIn must be positive and finite');
    }
    const sourceError = requireNonemptyString('spotDemand.source', spot.source);
    if (sourceError) return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, sourceError);
    if (!Array.isArray(spot.features)) {
      return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'Alcove spotDemand.features must be an array');
    }
    const featureIds = new Set();
    const features = [];
    for (const feature of spot.features) {
      if (feature === null || typeof feature !== 'object' || Array.isArray(feature)) {
        return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'each Alcove spot feature must be an object');
      }
      const allowedFeature = new Set([
        'featureId',
        'targetRole',
        'kind',
        'xIn',
        'partRelativeXIn',
        'reference',
        'acrossWidthRule',
        'toolDiameterIn',
        'basis',
      ]);
      if (Object.keys(feature).some((key) => !allowedFeature.has(key))) {
        return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'unexpected Alcove spot feature fields');
      }
      const featureIdError = requireNonemptyString('featureId', feature.featureId);
      const targetRoleError = requireNonemptyString('targetRole', feature.targetRole);
      const referenceError = requireNonemptyString('reference', feature.reference);
      if (featureIdError || targetRoleError || referenceError || featureIds.has(feature.featureId)) {
        return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'Alcove spot feature identity, targetRole, and reference are required and featureId must be unique');
      }
      featureIds.add(feature.featureId);
      if (
        feature.kind !== 'SPOT_ON_LOCATION' ||
        feature.acrossWidthRule !== 'CENTERED_ON_WIDE_FACE' ||
        !Number.isFinite(feature.xIn) ||
        feature.xIn < 0 ||
        !Number.isFinite(feature.partRelativeXIn) ||
        feature.partRelativeXIn < 0
      ) {
        return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'Alcove spot feature geometry is malformed');
      }
      features.push({ ...feature });
    }
    spotDemand = {
      enabled: spot.enabled,
      mode: spot.mode,
      toolDiameterIn: spot.toolDiameterIn,
      source: spot.source,
      features,
    };
  }

  if (
    definition.unresolvedConditions != null &&
    (!Array.isArray(definition.unresolvedConditions) ||
      definition.unresolvedConditions.some((value) => typeof value !== 'string' || value.trim() === ''))
  ) {
    return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'Alcove unresolvedConditions must be nonempty strings');
  }
  if (definition.materialSource != null && (typeof definition.materialSource !== 'string' || definition.materialSource.trim() === '')) {
    return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'Alcove materialSource must be a nonempty string when supplied');
  }

  return {
    ok: true,
    definition: {
      configurationId: definition.configurationId,
      configurationVersion: definition.configurationVersion,
      materialDemand: { ...material },
      boardRequirements,
      hardwareDemand,
      spotDemand,
      unresolvedConditions: [...(definition.unresolvedConditions ?? [])],
      materialSource: definition.materialSource ?? null,
    },
    definitionKind: ALCOVE_INSERT_DEFINITION.kind,
    ruleVersion: ALCOVE_INSERT_DEFINITION.ruleVersion,
  };
}

export async function validateWireRequest(body) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    return fail(ADAPTER_ERROR_CODES.MALFORMED_REQUEST, 'request body must be a JSON object');
  }
  const extra = Object.keys(body).filter((key) => !ENVELOPE_FIELDS.includes(key));
  if (extra.length > 0) {
    return fail(ADAPTER_ERROR_CODES.MALFORMED_REQUEST, `unexpected request fields: ${extra.join(',')}`);
  }
  if (body.protocolVersion !== STORE_PROTOCOL_VERSION) {
    return fail(ADAPTER_ERROR_CODES.UNSUPPORTED_PROTOCOL, 'unsupported protocolVersion');
  }
  for (const name of [
    'requestId',
    'projectId',
    'candidateRevisionId',
    'requestType',
    'scope',
    'payloadDigest',
    'expectedStorePin',
    'attemptId',
    'sentAt',
  ]) {
    const error = requireNonemptyString(name, body[name]);
    if (error) {
      return fail(ADAPTER_ERROR_CODES.MALFORMED_REQUEST, error);
    }
  }
  if (!Number.isInteger(body.attemptNumber) || body.attemptNumber < 1) {
    return fail(ADAPTER_ERROR_CODES.MALFORMED_REQUEST, 'attemptNumber must be a positive integer');
  }
  if (body.expectedStorePin !== STORE_PIN) {
    return fail(ADAPTER_ERROR_CODES.STORE_PIN_MISMATCH, {
      expected: STORE_PIN,
      received: body.expectedStorePin,
    });
  }
  const digest = await payloadDigest(body.payload);
  if (digest !== body.payloadDigest) {
    return fail(ADAPTER_ERROR_CODES.PAYLOAD_DIGEST_MISMATCH, {
      expected: digest,
      received: body.payloadDigest,
    });
  }
  if (body.requestType === STORE_REQUEST_TYPES.OFFERING_LOOKUP) {
    if (body.scope !== STORE_SCOPES.OFFERING_LOOKUP) {
      return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'offering scope mismatch');
    }
    if (body.demandSignature !== null) {
      return fail(
        ADAPTER_ERROR_CODES.MALFORMED_REQUEST,
        'offering lookup demandSignature must be null',
      );
    }
    const queryError = requireNonemptyString('querySignature', body.querySignature);
    if (queryError) {
      return fail(ADAPTER_ERROR_CODES.MALFORMED_REQUEST, queryError);
    }
    const payload = validateOfferingPayload(body.payload);
    if (!payload.ok) {
      return payload;
    }
    return { ok: true, requestType: body.requestType, payload, envelope: body };
  }
  if (body.requestType === STORE_REQUEST_TYPES.ALCOVE_INSERT_V1) {
    if (body.scope !== STORE_SCOPES.ALCOVE_INSERT_V1) {
      return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'Alcove scope mismatch');
    }
    const demandError = requireNonemptyString('demandSignature', body.demandSignature);
    if (demandError) return fail(ADAPTER_ERROR_CODES.MALFORMED_REQUEST, demandError);
    if (body.querySignature !== null) {
      return fail(ADAPTER_ERROR_CODES.MALFORMED_REQUEST, 'Alcove querySignature must be null');
    }
    const payload = validateAlcoveInsertPayload(body.payload);
    if (!payload.ok) return payload;
    return { ok: true, requestType: body.requestType, payload, envelope: body };
  }
  if (body.requestType === STORE_REQUEST_TYPES.USER_DEFINED_BOARD_V1) {
    if (body.scope !== STORE_SCOPES.USER_DEFINED_BOARD_V1) {
      return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'user-defined Board scope mismatch');
    }
    const demandError = requireNonemptyString('demandSignature', body.demandSignature);
    if (demandError) {
      return fail(ADAPTER_ERROR_CODES.MALFORMED_REQUEST, demandError);
    }
    if (body.querySignature !== null) {
      return fail(
        ADAPTER_ERROR_CODES.MALFORMED_REQUEST,
        'user-defined Board querySignature must be null',
      );
    }
    const payload = validateUserDefinedBoardPayload(body.payload);
    if (!payload.ok) {
      return payload;
    }
    return { ok: true, requestType: body.requestType, payload, envelope: body };
  }
  if (body.requestType === STORE_REQUEST_TYPES.BOARD_SQUARE_V1) {
    if (body.scope !== STORE_SCOPES.BOARD_SQUARE_V1) {
      return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'job scope mismatch');
    }
    const demandError = requireNonemptyString('demandSignature', body.demandSignature);
    if (demandError) {
      return fail(ADAPTER_ERROR_CODES.MALFORMED_REQUEST, demandError);
    }
    if (body.querySignature !== null) {
      return fail(ADAPTER_ERROR_CODES.MALFORMED_REQUEST, 'job querySignature must be null');
    }
    const payload = validateJobPayload(body.payload);
    if (!payload.ok) {
      return payload;
    }
    return { ok: true, requestType: body.requestType, payload, envelope: body };
  }
  return fail(ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE, 'unsupported requestType');
}

export function correlationFields(envelope) {
  return {
    protocolVersion: envelope.protocolVersion,
    wrapperBuildId: WRAPPER_BUILD_ID,
    storePin: STORE_PIN,
    requestId: envelope.requestId,
    projectId: envelope.projectId,
    candidateRevisionId: envelope.candidateRevisionId,
    requestType: envelope.requestType,
    scope: envelope.scope,
    demandSignature: envelope.demandSignature,
    querySignature: envelope.querySignature,
    payloadDigest: envelope.payloadDigest,
    attemptId: envelope.attemptId,
    attemptNumber: envelope.attemptNumber,
  };
}

export function adapterErrorBody(code, details, envelope = null, extra = {}) {
  return {
    protocolVersion: STORE_PROTOCOL_VERSION,
    wrapperBuildId: WRAPPER_BUILD_ID,
    storePin: STORE_PIN,
    adapterError: true,
    code,
    details: details ?? null,
    requestId: envelope?.requestId ?? null,
    projectId: envelope?.projectId ?? null,
    candidateRevisionId: envelope?.candidateRevisionId ?? null,
    requestType: envelope?.requestType ?? null,
    scope: envelope?.scope ?? null,
    attemptId: envelope?.attemptId ?? null,
    attemptNumber: envelope?.attemptNumber ?? null,
    ...extra,
  };
}

export function httpStatusForAdapterCode(code) {
  switch (code) {
    case ADAPTER_ERROR_CODES.REQUEST_TOO_LARGE:
      return 413;
    case ADAPTER_ERROR_CODES.STORE_SOURCE_UNAVAILABLE:
    case ADAPTER_ERROR_CODES.STORE_PIN_MISMATCH:
    case ADAPTER_ERROR_CODES.STORE_CHECKOUT_DIRTY:
    case ADAPTER_ERROR_CODES.MISSING_STORE_MODULE:
      return 503;
    case ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE:
    case ADAPTER_ERROR_CODES.PAYLOAD_DIGEST_MISMATCH:
    case ADAPTER_ERROR_CODES.OFFERING_INCOMPLETE:
      return 422;
    case ADAPTER_ERROR_CODES.INVALID_CONTENT_TYPE:
      return 415;
    default:
      return 400;
  }
}

export async function buildOfferingRequest({
  requestId,
  projectId,
  candidateRevisionId,
  attemptId,
  attemptNumber,
  sentAt,
  payload,
}) {
  const payloadHash = await payloadDigest(payload);
  const querySignature = await digestCanonical(payload);
  return {
    protocolVersion: STORE_PROTOCOL_VERSION,
    requestId,
    projectId,
    candidateRevisionId,
    requestType: STORE_REQUEST_TYPES.OFFERING_LOOKUP,
    scope: STORE_SCOPES.OFFERING_LOOKUP,
    demandSignature: null,
    querySignature,
    payloadDigest: payloadHash,
    expectedStorePin: STORE_PIN,
    attemptId,
    attemptNumber,
    sentAt,
    payload,
  };
}

export async function buildJobRequest({
  requestId,
  projectId,
  candidateRevisionId,
  attemptId,
  attemptNumber,
  sentAt,
  demandSignature,
  payload,
}) {
  const payloadHash = await payloadDigest(payload);
  return {
    protocolVersion: STORE_PROTOCOL_VERSION,
    requestId,
    projectId,
    candidateRevisionId,
    requestType: STORE_REQUEST_TYPES.BOARD_SQUARE_V1,
    scope: STORE_SCOPES.BOARD_SQUARE_V1,
    demandSignature,
    querySignature: null,
    payloadDigest: payloadHash,
    expectedStorePin: STORE_PIN,
    attemptId,
    attemptNumber,
    sentAt,
    payload,
  };
}

export async function buildAlcoveInsertRequest({
  requestId,
  projectId,
  candidateRevisionId,
  attemptId,
  attemptNumber,
  sentAt,
  demandSignature,
  payload,
}) {
  const payloadHash = await payloadDigest(payload);
  return {
    protocolVersion: STORE_PROTOCOL_VERSION,
    requestId,
    projectId,
    candidateRevisionId,
    requestType: STORE_REQUEST_TYPES.ALCOVE_INSERT_V1,
    scope: STORE_SCOPES.ALCOVE_INSERT_V1,
    demandSignature,
    querySignature: null,
    payloadDigest: payloadHash,
    expectedStorePin: STORE_PIN,
    attemptId,
    attemptNumber,
    sentAt,
    payload,
  };
}

export function alcoveInsertJobPayload({
  configurationId,
  configurationVersion,
  materialDemand,
  boardRequirements,
  hardwareDemand = null,
  spotDemand = null,
  unresolvedConditions = [],
  materialSource = null,
}) {
  return {
    definition: {
      configurationId,
      configurationVersion,
      materialDemand: structuredClone(materialDemand),
      boardRequirements: structuredClone(boardRequirements),
      hardwareDemand: hardwareDemand == null ? null : structuredClone(hardwareDemand),
      spotDemand: spotDemand == null ? null : structuredClone(spotDemand),
      unresolvedConditions: [...unresolvedConditions],
      materialSource,
    },
    definitionKind: ALCOVE_INSERT_DEFINITION.kind,
    ruleVersion: ALCOVE_INSERT_DEFINITION.ruleVersion,
  };
}

export async function alcoveInsertDemandSignature(payload) {
  return digestCanonical({
    definitionKind: payload.definitionKind,
    ruleVersion: payload.ruleVersion,
    requestType: STORE_REQUEST_TYPES.ALCOVE_INSERT_V1,
    scope: STORE_SCOPES.ALCOVE_INSERT_V1,
    definition: payload.definition,
  });
}

export async function buildUserDefinedBoardRequest({
  requestId,
  projectId,
  candidateRevisionId,
  attemptId,
  attemptNumber,
  sentAt,
  demandSignature,
  payload,
}) {
  const payloadHash = await payloadDigest(payload);
  return {
    protocolVersion: STORE_PROTOCOL_VERSION,
    requestId,
    projectId,
    candidateRevisionId,
    requestType: STORE_REQUEST_TYPES.USER_DEFINED_BOARD_V1,
    scope: STORE_SCOPES.USER_DEFINED_BOARD_V1,
    demandSignature,
    querySignature: null,
    payloadDigest: payloadHash,
    expectedStorePin: STORE_PIN,
    attemptId,
    attemptNumber,
    sentAt,
    payload,
  };
}

export function userDefinedBoardJobPayload({
  lineId,
  configurationId,
  configurationVersion,
  materialDemand = USER_DEFINED_BOARD_MATERIAL_DEMAND,
  definedWorkpieceLengthCanonical,
  sawCuts,
  sawAngleDeg,
  drillCycles = 0,
  drillDepthIn = null,
  requiredOps,
  cutPlane = null,
  endIdentity = null,
  endRelation = null,
  lengthDatum = null,
  datumCMethod = 'REFERENCE_CUT',
  parts = [],
  spotDemand = null,
  unresolvedConditions = [],
  materialSource = null,
}) {
  return {
    line: {
      lineId,
      configurationId,
      configurationVersion,
      materialDemand: { ...materialDemand },
      quantity: 1,
      unit: 'ea',
      requiredOps: [...requiredOps],
      definedWorkpieceLength: { value: definedWorkpieceLengthCanonical, unit: 'in' },
      sawCuts,
      sawAngleDeg,
      drillCycles,
      drillDepthIn,
      cutPlane,
      endIdentity,
      endRelation,
      lengthDatum,
      datumCMethod,
      parts: structuredClone(parts),
      spotDemand,
      unresolvedConditions: [...unresolvedConditions],
      materialSource,
    },
    definitionKind: USER_DEFINED_BOARD_DEFINITION.kind,
    ruleVersion: USER_DEFINED_BOARD_DEFINITION.ruleVersion,
  };
}

export async function userDefinedBoardDemandSignature(payload) {
  return digestCanonical({
    definitionKind: payload.definitionKind,
    ruleVersion: payload.ruleVersion,
    requestType: STORE_REQUEST_TYPES.USER_DEFINED_BOARD_V1,
    scope: STORE_SCOPES.USER_DEFINED_BOARD_V1,
    lineId: payload.line.lineId,
    configurationId: payload.line.configurationId,
    configurationVersion: payload.line.configurationVersion,
    materialDemand: payload.line.materialDemand,
    quantity: payload.line.quantity,
    unit: payload.line.unit,
    requiredOps: payload.line.requiredOps,
    definedWorkpieceLength: payload.line.definedWorkpieceLength,
    sawCuts: payload.line.sawCuts,
    sawAngleDeg: payload.line.sawAngleDeg,
    drillCycles: payload.line.drillCycles,
    drillDepthIn: payload.line.drillDepthIn ?? null,
    cutPlane: payload.line.cutPlane ?? null,
    endIdentity: payload.line.endIdentity ?? null,
    endRelation: payload.line.endRelation ?? null,
    lengthDatum: payload.line.lengthDatum ?? null,
    datumCMethod: payload.line.datumCMethod,
    parts: payload.line.parts,
    spotDemand: payload.line.spotDemand ?? null,
    unresolvedConditions: payload.line.unresolvedConditions ?? [],
    materialSource: payload.line.materialSource ?? null,
  });
}

export function boardJobPayload({ lineId, storeSku = PUBLISHED_BOARD_SKU, keptLengthCanonical }) {
  return {
    line: {
      lineId,
      storeSku,
      quantity: 1,
      unit: 'ea',
      requiredOps: ['CROSSCUT'],
      keptLength: { value: keptLengthCanonical, unit: 'in' },
    },
    definitionKind: BOARD_DEFINITION.kind,
    ruleVersion: BOARD_DEFINITION.ruleVersion,
  };
}

export async function boardDemandSignature(payload) {
  return digestCanonical({
    definitionKind: payload.definitionKind,
    ruleVersion: payload.ruleVersion,
    requestType: STORE_REQUEST_TYPES.BOARD_SQUARE_V1,
    scope: STORE_SCOPES.BOARD_SQUARE_V1,
    lineId: payload.line.lineId,
    storeSku: payload.line.storeSku,
    quantity: payload.line.quantity,
    unit: payload.line.unit,
    requiredOps: payload.line.requiredOps,
    keptLength: payload.line.keptLength,
  });
}

export const STORE_CLIENT_LIMITS = Object.freeze({
  timeoutMs: STORE_CLIENT_TIMEOUT_MS,
  paths: STORE_PATHS,
  maxResponseBytes: MAX_STORE_RESPONSE_BYTES,
});

function mismatch(reason, details) {
  return {
    ok: false,
    current: false,
    diagnostic: APP_DIAGNOSTICS.APP_CORRELATION_ERROR,
    reason,
    details: details ?? null,
  };
}

export function inspectStoreResponse(request, parsed, { httpStatus, byteLength } = {}) {
  if (typeof byteLength === 'number' && byteLength > MAX_STORE_RESPONSE_BYTES) {
    return {
      ok: false,
      current: false,
      diagnostic: APP_DIAGNOSTICS.APP_MALFORMED_RESPONSE,
      reason: 'oversized',
      incomplete: true,
    };
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {
      ok: false,
      current: false,
      diagnostic: APP_DIAGNOSTICS.APP_MALFORMED_RESPONSE,
      reason: 'not-object',
    };
  }
  if (parsed.adapterError === true) {
    return {
      ok: false,
      current: false,
      diagnostic: APP_DIAGNOSTICS.APP_ADAPTER_ERROR,
      reason: parsed.code ?? 'adapter-error',
      adapter: {
        code: parsed.code ?? null,
        details: parsed.details ?? null,
      },
    };
  }
  if (httpStatus !== undefined && httpStatus !== 200) {
    return {
      ok: false,
      current: false,
      diagnostic: APP_DIAGNOSTICS.APP_TRANSPORT_ERROR,
      reason: `http-${httpStatus}`,
    };
  }
  if (parsed.protocolVersion !== STORE_PROTOCOL_VERSION) {
    return mismatch('protocolVersion', parsed.protocolVersion ?? null);
  }
  if (parsed.storePin !== STORE_PIN) {
    return mismatch('storePin', parsed.storePin ?? null);
  }
  if (parsed.requestId !== request.requestId) {
    return mismatch('requestId', parsed.requestId ?? null);
  }
  if (parsed.attemptId !== request.attemptId) {
    return mismatch('attemptId', parsed.attemptId ?? null);
  }
  if (parsed.projectId !== request.projectId) {
    return mismatch('projectId', parsed.projectId ?? null);
  }
  if (parsed.candidateRevisionId !== request.candidateRevisionId) {
    return mismatch('candidateRevisionId', parsed.candidateRevisionId ?? null);
  }
  if (parsed.requestType !== request.requestType || parsed.scope !== request.scope) {
    return mismatch('scope', { requestType: parsed.requestType, scope: parsed.scope });
  }
  if (parsed.payloadDigest !== request.payloadDigest) {
    return mismatch('payloadDigest', parsed.payloadDigest ?? null);
  }
  if (parsed.demandSignature !== request.demandSignature) {
    return mismatch('demandSignature', parsed.demandSignature ?? null);
  }
  if (parsed.querySignature !== request.querySignature) {
    return mismatch('querySignature', parsed.querySignature ?? null);
  }
  if (parsed.attemptNumber !== request.attemptNumber) {
    return mismatch('attemptNumber', parsed.attemptNumber ?? null);
  }
  if (
    request.requestType === STORE_REQUEST_TYPES.BOARD_SQUARE_V1 ||
    request.requestType === STORE_REQUEST_TYPES.USER_DEFINED_BOARD_V1 ||
    request.requestType === STORE_REQUEST_TYPES.ALCOVE_INSERT_V1
  ) {
    const status = parsed.rawEvaluation?.status;
    if (!isKnownJobStatus(status)) {
      return {
        ok: false,
        current: false,
        diagnostic: APP_DIAGNOSTICS.APP_MALFORMED_RESPONSE,
        reason: 'unknown-aggregate',
        details: status ?? null,
      };
    }
  }
  if (
    request.requestType === STORE_REQUEST_TYPES.USER_DEFINED_BOARD_V1 ||
    request.requestType === STORE_REQUEST_TYPES.ALCOVE_INSERT_V1
  ) {
    const receipt = parsed.evaluationReceipt ?? parsed.rawEvaluation?.evaluationReceipt ?? null;
    if (parsed.rawEvaluation?.freshEvaluation !== true) {
      return {
        ok: false,
        current: false,
        diagnostic: APP_DIAGNOSTICS.APP_MALFORMED_RESPONSE,
        reason: 'store-evaluation-not-fresh',
      };
    }
    if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt)) {
      return {
        ok: false,
        current: false,
        diagnostic: APP_DIAGNOSTICS.APP_MALFORMED_RESPONSE,
        reason: 'missing-evaluation-receipt',
      };
    }
    if (receipt.requestId !== request.requestId) {
      return mismatch('evaluationReceipt.requestId', receipt.requestId ?? null);
    }
    if (receipt.freshnessRule !== STORE_FRESH_EVALUATION_RULE_ID) {
      return mismatch('evaluationReceipt.freshnessRule', receipt.freshnessRule ?? null);
    }
    if (receipt.authority?.storeRevision !== STORE_PIN) {
      return mismatch('evaluationReceipt.storeRevision', receipt.authority?.storeRevision ?? null);
    }
    if (typeof receipt.receiptHash !== 'string' || receipt.receiptHash.length === 0) {
      return {
        ok: false,
        current: false,
        diagnostic: APP_DIAGNOSTICS.APP_MALFORMED_RESPONSE,
        reason: 'missing-evaluation-receipt-hash',
      };
    }
  }
  if (request.requestType === STORE_REQUEST_TYPES.OFFERING_LOOKUP && !('rawOffering' in parsed)) {
    return {
      ok: false,
      current: false,
      diagnostic: APP_DIAGNOSTICS.APP_MALFORMED_RESPONSE,
      reason: 'missing-offering',
    };
  }
  return { ok: true, current: false, diagnostic: null, reason: null };
}
