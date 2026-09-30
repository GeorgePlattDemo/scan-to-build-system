// Project-definition readiness only.
//
// This module explains a supplied responsibility ledger. It does not prove that a
// class adapter emitted every responsibility that class requires; required-row
// coverage remains the producing adapter's obligation.
//
// This module does not own Store evaluation, completion/fulfillment, machine
// readiness, production authority, physical release, persistence, routing, or UI.
//
export const DEFINITION_CONTRACT_VERSION = 'STB-DEFINITION-CONTRACT-0.1';
export const PHYSICAL_RELEASE_ISSUABLE = false;

export const STATUS = Object.freeze({
  CANDIDATE: 'CANDIDATE',
  CONFIRMED: 'CONFIRMED',
  DERIVED: 'DERIVED',
  UNRESOLVED: 'UNRESOLVED',
  DEFERRED: 'DEFERRED',
  NOT_REQUIRED: 'NOT_REQUIRED',
});

export const OWNER = Object.freeze({
  USER: 'USER',
  PROJECT: 'PROJECT',
  RULE: 'RULE',
  STORE: 'STORE',
  QUALIFIED_PERSON: 'QUALIFIED_PERSON',
  GOVERNED: 'GOVERNED',
});

export const BOUNDARY = Object.freeze({
  DEFINITION: 'DEFINITION',
  STORE_SUBMISSION: 'STORE_SUBMISSION',
  PHYSICAL_RELEASE: 'PHYSICAL_RELEASE',
});

export const DISPOSITION = Object.freeze({
  CLASSIFIED: 'CLASSIFIED',
  UNCLASSIFIED: 'UNCLASSIFIED',
});

const STATUS_VALUES = new Set(Object.values(STATUS));
const OWNER_VALUES = new Set(Object.values(OWNER));
const BOUNDARY_VALUES = new Set(Object.values(BOUNDARY));
const DISPOSITION_VALUES = new Set(Object.values(DISPOSITION));

function isPlainObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

function requiredString(name, value) {
  if (typeof value !== 'string' || value.length === 0) {
    throw new TypeError(`${name} is required`);
  }
  return value;
}

function optionalString(name, value) {
  if (value == null) return null;
  return requiredString(name, value);
}

function cloneAndFreeze(value, path = 'value') {
  if (
    value == null
    || typeof value === 'string'
    || typeof value === 'number'
    || typeof value === 'boolean'
  ) {
    if (typeof value === 'number' && !Number.isFinite(value)) {
      throw new TypeError(`${path} must contain only finite numbers`);
    }
    return value;
  }
  if (Array.isArray(value)) {
    return Object.freeze(value.map((item, index) => cloneAndFreeze(item, `${path}[${index}]`)));
  }
  if (!isPlainObject(value)) {
    throw new TypeError(`${path} must contain only plain data`);
  }
  const copy = {};
  for (const [key, item] of Object.entries(value)) {
    copy[key] = cloneAndFreeze(item, `${path}.${key}`);
  }
  return Object.freeze(copy);
}

function freezeBasis(value) {
  if (typeof value === 'string') {
    return requiredString('basis', value);
  }
  if (!isPlainObject(value) || Object.keys(value).length === 0) {
    throw new TypeError('basis must be a nonempty string or plain object');
  }
  return cloneAndFreeze(value, 'basis');
}

function freezeDerivation(value) {
  if (!isPlainObject(value)) {
    throw new TypeError('derivation must be an object');
  }
  const rule = requiredString('derivation.rule', value.rule);
  const inputs = value.inputs;
  if (
    !(Array.isArray(inputs) && inputs.length > 0)
    && !(isPlainObject(inputs) && Object.keys(inputs).length > 0)
  ) {
    throw new TypeError('derivation.inputs must be a nonempty array or object');
  }
  return Object.freeze({
    rule,
    inputs: cloneAndFreeze(inputs, 'derivation.inputs'),
  });
}

function freezeBlocks(blocks) {
  if (!Array.isArray(blocks)) {
    throw new TypeError('blocks must be an array');
  }
  const seen = new Set();
  const copy = blocks.map((boundary) => {
    if (!BOUNDARY_VALUES.has(boundary)) {
      throw new TypeError(`unknown boundary: ${String(boundary)}`);
    }
    if (seen.has(boundary)) {
      throw new TypeError(`duplicate boundary: ${boundary}`);
    }
    seen.add(boundary);
    return boundary;
  });
  return Object.freeze(copy);
}

function freezeStoreQueryContract(contract) {
  if (contract == null) return null;
  if (!isPlainObject(contract)) {
    throw new TypeError('storeQueryContract must be an object or null');
  }
  const repository = requiredString('storeQueryContract.repository', contract.repository);
  const pin = requiredString('storeQueryContract.pin', contract.pin);
  if (!/^[0-9a-f]{40}$/i.test(pin)) {
    throw new TypeError('storeQueryContract.pin must be an exact 40-character commit identity');
  }
  const queryIdentity = [
    contract.requestType,
    contract.queryId,
    contract.kind,
  ].find((value) => typeof value === 'string' && value.length > 0);
  if (!queryIdentity) {
    throw new TypeError('storeQueryContract requires a bounded query identity');
  }
  return Object.freeze({
    ...cloneAndFreeze(contract, 'storeQueryContract'),
    repository,
    pin,
  });
}

export function freezeResponsibility(record) {
  if (!isPlainObject(record)) {
    throw new TypeError('responsibility must be an object');
  }

  const id = requiredString('id', record.id);
  const title = requiredString('title', record.title);
  if (!STATUS_VALUES.has(record.status)) {
    throw new TypeError(`unknown status: ${String(record.status)}`);
  }
  if (!OWNER_VALUES.has(record.owner)) {
    throw new TypeError(`unknown owner: ${String(record.owner)}`);
  }

  const status = record.status;
  const owner = record.owner;
  const blocks = freezeBlocks(record.blocks);

  const hasValue = record.value !== undefined && record.value !== null;
  const basisRequired = hasValue
    || [STATUS.CANDIDATE, STATUS.CONFIRMED, STATUS.DERIVED].includes(status);
  if (basisRequired && record.basis == null) {
    throw new TypeError(`basis is required for ${status}`);
  }
  const basis = record.basis == null ? null : freezeBasis(record.basis);

  let derivation = null;
  if (status === STATUS.DERIVED) {
    derivation = freezeDerivation(record.derivation);
  } else if (record.derivation != null) {
    throw new TypeError('derivation is allowed only for DERIVED responsibilities');
  }

  const condition = optionalString('condition', record.condition);
  const value = hasValue ? cloneAndFreeze(record.value, 'value') : null;

  return Object.freeze({
    id,
    title,
    status,
    owner,
    blocks,
    value,
    basis,
    derivation,
    condition,
  });
}

export function freezeLedger(ledger) {
  if (!isPlainObject(ledger)) {
    throw new TypeError('ledger must be an object');
  }
  if (
    ledger.contractVersion != null
    && ledger.contractVersion !== DEFINITION_CONTRACT_VERSION
  ) {
    throw new TypeError(`unsupported contractVersion: ${String(ledger.contractVersion)}`);
  }
  if (!DISPOSITION_VALUES.has(ledger.disposition)) {
    throw new TypeError(`unknown disposition: ${String(ledger.disposition)}`);
  }

  const responsibilitiesInput = ledger.responsibilities;
  if (!Array.isArray(responsibilitiesInput)) {
    throw new TypeError('responsibilities must be an array');
  }
  if (ledger.disposition === DISPOSITION.CLASSIFIED && responsibilitiesInput.length === 0) {
    throw new TypeError('classified ledger must contain at least one responsibility');
  }

  const responsibilities = responsibilitiesInput.map(freezeResponsibility);
  const ids = new Set();
  for (const row of responsibilities) {
    if (ids.has(row.id)) throw new TypeError(`duplicate responsibility id: ${row.id}`);
    ids.add(row.id);
  }

  const classId = optionalString('classId', ledger.classId);
  const classVersion = optionalString('classVersion', ledger.classVersion);
  const definitionKind = optionalString('definitionKind', ledger.definitionKind);
  const ruleVersion = optionalString('ruleVersion', ledger.ruleVersion);

  if (ledger.disposition === DISPOSITION.CLASSIFIED) {
    const hasClassIdentity = classId != null && classVersion != null;
    const hasDefinitionIdentity = definitionKind != null;
    if (!hasClassIdentity && !hasDefinitionIdentity) {
      throw new TypeError('classified ledger requires class identity or definitionKind');
    }
    if (ruleVersion == null) {
      throw new TypeError('classified ledger requires ruleVersion');
    }
    if ((classId == null) !== (classVersion == null)) {
      throw new TypeError('classId and classVersion must be supplied together');
    }
  }

  const candidateRevisionId = optionalString('candidateRevisionId', ledger.candidateRevisionId);
  const storeQueryContract = freezeStoreQueryContract(ledger.storeQueryContract);

  if (ledger.disposition === DISPOSITION.UNCLASSIFIED && storeQueryContract != null) {
    throw new TypeError('unclassified ledger cannot carry a Store query contract');
  }

  return Object.freeze({
    contractVersion: DEFINITION_CONTRACT_VERSION,
    disposition: ledger.disposition,
    classId,
    classVersion,
    definitionKind,
    ruleVersion,
    candidateRevisionId,
    storeQueryContract,
    responsibilities: Object.freeze(responsibilities),
  });
}

function normalizedLedger(ledger) {
  return freezeLedger(ledger);
}

function isAccountedFor(row, boundary) {
  if (row.status === STATUS.NOT_REQUIRED) return true;
  if (row.status === STATUS.CONFIRMED || row.status === STATUS.DERIVED) return true;
  if (row.status === STATUS.UNRESOLVED && row.owner === OWNER.STORE) {
    return boundary === BOUNDARY.STORE_SUBMISSION;
  }
  if (row.status === STATUS.DEFERRED) {
    return !row.blocks.includes(boundary);
  }
  return false;
}

export function blockingForBoundary(ledger, boundary) {
  if (!BOUNDARY_VALUES.has(boundary)) {
    throw new TypeError(`unknown boundary: ${String(boundary)}`);
  }
  const frozen = normalizedLedger(ledger);
  return Object.freeze(
    frozen.responsibilities.filter(
      (row) => row.blocks.includes(boundary) && !isAccountedFor(row, boundary),
    ),
  );
}

const HOLDER_STATUS = new Set([STATUS.CANDIDATE, STATUS.UNRESOLVED]);
const BOUNDARY_ORDER = Object.freeze([
  BOUNDARY.DEFINITION,
  BOUNDARY.STORE_SUBMISSION,
  BOUNDARY.PHYSICAL_RELEASE,
]);

function earliestBoundaryIndex(row) {
  const indexes = row.blocks.map((boundary) => BOUNDARY_ORDER.indexOf(boundary));
  return indexes.length === 0 ? Number.POSITIVE_INFINITY : Math.min(...indexes);
}

export function holderQuestions(ledger) {
  const frozen = normalizedLedger(ledger);
  return Object.freeze(
    frozen.responsibilities
      .filter(
        (row) =>
          row.owner === OWNER.USER
          && HOLDER_STATUS.has(row.status)
          && row.blocks.length > 0,
      )
      .sort((a, b) => earliestBoundaryIndex(a) - earliestBoundaryIndex(b)),
  );
}

function validStoreQueryContract(contract) {
  return (
    contract != null
    && typeof contract.repository === 'string'
    && contract.repository.length > 0
    && typeof contract.pin === 'string'
    && /^[0-9a-f]{40}$/i.test(contract.pin)
    && [contract.requestType, contract.queryId, contract.kind]
      .some((value) => typeof value === 'string' && value.length > 0)
  );
}

export function storeSubmissionReadiness(ledger) {
  const frozen = normalizedLedger(ledger);

  if (frozen.disposition !== DISPOSITION.CLASSIFIED) {
    return Object.freeze({ ready: false, reason: 'UNCLASSIFIED' });
  }
  if (!frozen.candidateRevisionId) {
    return Object.freeze({ ready: false, reason: 'CANDIDATE_REVISION_REQUIRED' });
  }
  if (!validStoreQueryContract(frozen.storeQueryContract)) {
    return Object.freeze({ ready: false, reason: 'STORE_QUERY_CONTRACT_REQUIRED' });
  }

  const definitionBlockers = blockingForBoundary(frozen, BOUNDARY.DEFINITION);
  if (definitionBlockers.length > 0) {
    return Object.freeze({
      ready: false,
      reason: 'DEFINITION_BLOCKED',
      blockingIds: Object.freeze(definitionBlockers.map((row) => row.id)),
    });
  }

  const storeBlockers = blockingForBoundary(frozen, BOUNDARY.STORE_SUBMISSION);
  if (storeBlockers.length > 0) {
    return Object.freeze({
      ready: false,
      reason: 'STORE_SUBMISSION_BLOCKED',
      blockingIds: Object.freeze(storeBlockers.map((row) => row.id)),
    });
  }

  return Object.freeze({ ready: true, reason: null, blockingIds: Object.freeze([]) });
}

export function physicalReleaseReadiness(_ledger) {
  return Object.freeze({
    ready: false,
    reason: 'PRODUCTION_AUTHORIZATION_NOT_ISSUABLE',
  });
}
