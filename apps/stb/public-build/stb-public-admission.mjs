import {
  DEFINITION_CONTRACT_VERSION,
  STATUS,
  OWNER,
  BOUNDARY,
  DISPOSITION,
  storeSubmissionReadiness,
} from './shared/definition-contract.mjs';

export const PUBLIC_ADMISSION_VERSION = 'STB-PUBLIC-ADMISSION-0.1';
const STORE_REPOSITORY = 'GeorgePlattDemo/scan-to-build-store';
const PUBLIC_PROJECTS = new Set(['start-own', 'alcove', 'window-seat', 'outdoor', 'playhouse']);

function isObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
function text(value) {
  return typeof value === 'string' && value.trim().length > 0;
}
function finite(value) {
  return Number.isFinite(Number(value));
}
function positive(value) {
  return finite(value) && Number(value) > 0;
}
function nonnegative(value) {
  return finite(value) && Number(value) >= 0;
}
function nonempty(value) {
  return Array.isArray(value) && value.length > 0;
}
function json(value) {
  if (value === null) return 'null';
  const type = typeof value;
  if (type === 'string' || type === 'boolean') return JSON.stringify(value);
  if (type === 'number') {
    if (!Number.isFinite(value)) throw new TypeError('admission comparison rejects non-finite numbers');
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return '[' + value.map(json).join(',') + ']';
  if (isObject(value)) {
    return '{' + Object.keys(value).sort().map(key => JSON.stringify(key) + ':' + json(value[key])).join(',') + '}';
  }
  throw new TypeError('admission comparison rejects ' + type);
}
function same(left, right) {
  try { return json(left) === json(right); } catch { return false; }
}
function row(id, title, ok, {
  owner = OWNER.PROJECT,
  blocks = [BOUNDARY.DEFINITION, BOUNDARY.STORE_SUBMISSION],
  condition = null,
  status = null,
} = {}) {
  const resolvedStatus = status || (ok ? STATUS.CONFIRMED : STATUS.UNRESOLVED);
  const resolved = resolvedStatus === STATUS.CONFIRMED || resolvedStatus === STATUS.DERIVED;
  return {
    id,
    title,
    status: resolvedStatus,
    owner,
    blocks,
    value: resolved ? true : null,
    basis: resolved ? `public-admission:${id}` : null,
    condition: condition || (ok ? null : title),
  };
}
function deferredRow(id, title, condition) {
  return {
    id,
    title,
    status: STATUS.DEFERRED,
    owner: OWNER.PROJECT,
    blocks: [],
    value: null,
    basis: null,
    condition,
  };
}
function notRequiredRow(id, title, condition = null) {
  return {
    id,
    title,
    status: STATUS.NOT_REQUIRED,
    owner: OWNER.PROJECT,
    blocks: [],
    value: null,
    basis: null,
    condition,
  };
}
function missingIds(requiredIds, rows) {
  const present = new Set(rows.map(item => item.id));
  return requiredIds.filter(id => !present.has(id));
}

export class PublicAdmissionError extends Error {
  constructor(code, { projectId, requestType, scope, blockingIds = [], details = [] } = {}) {
    const suffix = details.length ? ': ' + details.join(' | ') : blockingIds.length ? ': ' + blockingIds.join(', ') : '';
    super(code + suffix);
    this.name = 'PublicAdmissionError';
    this.code = code;
    this.projectId = projectId || null;
    this.requestType = requestType || null;
    this.scope = scope || null;
    this.blockingIds = Object.freeze([...blockingIds]);
    this.details = Object.freeze([...details]);
  }
}

function fail(code, context, blockingIds = [], details = []) {
  throw new PublicAdmissionError(code, { ...context, blockingIds, details });
}

function runReadiness({ projectId, requestType, scope, definitionKind, ruleVersion, candidateRevisionId, storePin, requiredIds, rows, withheldScope = [] }) {
  const context = { projectId, requestType, scope };
  const absent = missingIds(requiredIds, rows);
  if (absent.length) fail('SYSTEM_ADMISSION_COVERAGE_GAP', context, absent, absent.map(id => `MISSING_REQUIRED_ROW:${id}`));

  const ledger = {
    contractVersion: DEFINITION_CONTRACT_VERSION,
    disposition: DISPOSITION.CLASSIFIED,
    definitionKind,
    ruleVersion,
    candidateRevisionId,
    storeQueryContract: {
      repository: STORE_REPOSITORY,
      pin: storePin,
      requestType,
      scope,
    },
    responsibilities: rows,
  };

  let readiness;
  try {
    readiness = storeSubmissionReadiness(ledger);
  } catch (error) {
    fail('SYSTEM_ADMISSION_LEDGER_INVALID', context, [], [String(error?.message || error)]);
  }
  if (!readiness.ready) {
    const blocking = readiness.blockingIds || [];
    const details = rows
      .filter(item => blocking.includes(item.id))
      .map(item => item.condition || item.title)
      .filter(Boolean);
    fail('SYSTEM_ADMISSION_' + readiness.reason, context, blocking, details);
  }
  return Object.freeze({
    ready: true,
    version: PUBLIC_ADMISSION_VERSION,
    projectId,
    requestType,
    scope,
    candidateRevisionId,
    withheldScope: Object.freeze([...withheldScope]),
  });
}

function startOwnProfile({ payload, candidateRevisionId, storePin }) {
  const line = payload?.line;
  const parts = Array.isArray(line?.parts) ? line.parts : [];
  const ops = Array.isArray(line?.requiredOps) ? line.requiredOps : [];
  const spotsRequired = ops.includes('SPOT_ON_LOCATION');
  const spot = line?.spotDemand;
  const unresolved = Array.isArray(line?.unresolvedConditions) ? line.unresolvedConditions : null;
  const rows = [
    row('start-own.identity', 'Start your own requires identified configuration and revision', text(line?.configurationId) && text(line?.configurationVersion) && text(candidateRevisionId)),
    row('start-own.material', 'Start your own requires a material demand', isObject(line?.materialDemand) && text(line.materialDemand.species) && text(line.materialDemand.form) && positive(line.materialDemand.nominalT) && positive(line.materialDemand.nominalW)),
    row('start-own.workpiece-length', 'Start your own requires a real defined workpiece length', isObject(line?.definedWorkpieceLength) && text(line.definedWorkpieceLength.value) && finite(line.definedWorkpieceLength.value) && Number(line.definedWorkpieceLength.value) > 0 && line.definedWorkpieceLength.unit === 'in', { owner: OWNER.USER }),
    row('start-own.operations', 'Start your own requires its declared operations', nonempty(ops) && Number.isInteger(line?.sawCuts) && line.sawCuts > 0 && finite(line?.sawAngleDeg)),
    row('start-own.parts', 'Start your own requires identified parts with real lengths', nonempty(parts) && parts.every(part => isObject(part) && text(part.partId || part.id) && positive(part.lengthIn ?? part.length?.value))),
    row('start-own.datum', 'Start your own requires its cut/datum meaning', text(line?.cutPlane) && text(line?.endIdentity) && text(line?.endRelation) && text(line?.lengthDatum) && text(line?.datumCMethod)),
    row('start-own.spots', 'Start your own spot demand must remain represented when SPOT_ON_LOCATION is required', !spotsRequired || (isObject(spot) && spot.required === true && spot.mode === 'SPOT_ON_LOCATION' && Number.isInteger(spot.totalCount) && spot.totalCount > 0)),
    row('start-own.unresolved', 'Start your own cannot hide unresolved definition conditions', unresolved !== null && unresolved.length === 0, { owner: OWNER.USER, condition: unresolved?.length ? unresolved.join(', ') : null }),
    row('start-own.scope', 'Start your own request scope must remain USER_DEFINED_BOARD_V1', payload?.definitionKind === 'user_defined_board.v1' && payload?.ruleVersion === '0.1' && text(line?.lineId) && line?.materialSource === 'STORE_ZERO'),
  ];
  const requiredIds = rows.map(item => item.id);
  return runReadiness({ projectId:'start-own', requestType:'USER_DEFINED_BOARD_V1', scope:'USER_DEFINED_BOARD_V1', definitionKind:'user_defined_board.v1', ruleVersion:'0.1', candidateRevisionId, storePin, requiredIds, rows });
}

function alcoveProfile({ payload, candidateRevisionId, storePin }) {
  const definition = payload?.definition;
  const requirements = Array.isArray(definition?.boardRequirements) ? definition.boardRequirements : [];
  const programs = Array.isArray(definition?.componentPrograms) ? definition.componentPrograms : [];
  const requirementIds = new Set(requirements.map(item => item?.requirementId).filter(text));
  const representedRequirements = new Set(programs.map(item => item?.requirementId).filter(text));
  const requiredParents = ['ALCOVE-UPRIGHT-PARENTS', 'ALCOVE-SHELF-PARENTS'];
  const unresolved = Array.isArray(definition?.unresolvedConditions) ? definition.unresolvedConditions : null;
  const spot = definition?.spotDemand;
  const rows = [
    row('alcove.identity', 'Alcove requires identified configuration and revision', text(definition?.configurationId) && text(definition?.configurationVersion) && text(candidateRevisionId)),
    row('alcove.material', 'Alcove requires a real material demand', isObject(definition?.materialDemand) && text(definition.materialDemand.species) && text(definition.materialDemand.form) && positive(definition.materialDemand.nominalT) && positive(definition.materialDemand.nominalW)),
    row('alcove.board-requirements', 'Alcove requires both upright and shelf parent responsibilities', requiredParents.every(id => requirementIds.has(id)) && requirements.every(item => nonempty(item?.requiredOps) && item?.selectionAuthority === 'STORE_ZERO')),
    row('alcove.component-programs', 'Alcove requires component programs for every required parent responsibility', nonempty(programs) && requiredParents.every(id => representedRequirements.has(id)) && programs.every(item => text(item?.componentId) && text(item?.requirementId) && positive(item?.finishedLengthIn) && positive(item?.finishedWidthIn))),
    row('alcove.hardware', 'Alcove keeps its declared pins-and-screws requirement represented for Store selection', isObject(definition?.hardwareDemand) && text(definition.hardwareDemand.requirementId) && positive(definition.hardwareDemand.qty) && definition.hardwareDemand.selectionAuthority === 'STORE_ZERO', { owner: OWNER.STORE }),
    row('alcove.spot-demand', 'Alcove spot scope must be explicit', isObject(spot) && typeof spot.enabled === 'boolean' && (!spot.enabled || (spot.mode === 'SPOT_ON_LOCATION' && positive(spot.toolDiameterIn) && Array.isArray(spot.features)))),
    row('alcove.unresolved', 'Alcove unresolved definition conditions must be explicit and settled before submission', unresolved !== null && unresolved.length === 0, { owner: OWNER.USER, condition: unresolved?.length ? unresolved.join(', ') : null }),
    row('alcove.scope', 'Alcove request scope must remain ALCOVE_INSERT_V1', payload?.definitionKind === 'alcove_insert.v1' && payload?.ruleVersion === '0.1' && definition?.materialSource === 'STORE_ZERO'),
  ];
  const requiredIds = rows.map(item => item.id);
  return runReadiness({ projectId:'alcove', requestType:'ALCOVE_INSERT_V1', scope:'ALCOVE_INSERT_V1', definitionKind:'alcove_insert.v1', ruleVersion:'0.1', candidateRevisionId, storePin, requiredIds, rows });
}

function flattenPartIds(definition) {
  const packages = Array.isArray(definition?.cutPackages) ? definition.cutPackages : [];
  return packages.flatMap(pkg => Array.isArray(pkg?.parts) ? pkg.parts : []).map(part => part?.partId).filter(text);
}

function windowSeatProfile({ root, payload, candidateRevisionId, storePin }) {
  const api = root?.STBWindowSeat;
  const source = typeof api?.definition === 'function' ? api.definition() : null;
  const expected = typeof api?.request === 'function' ? api.request() : null;
  const conditionRows = typeof api?.conditions === 'function' ? api.conditions() : [];
  const blockers = Array.isArray(conditionRows) ? conditionRows.filter(item => item?.block) : [];
  const sourceIds = Array.isArray(source?.boards) ? source.boards.map(board => board?.id).filter(text) : [];
  const sentIds = new Set(flattenPartIds(payload?.definition));
  const missing = sourceIds.filter(id => !sentIds.has(id));
  const screwsInScope = typeof api?.knobs === 'function' && api.knobs().includes('SCREWS');
  const rows = [
    row('window-seat.identity', 'Window Seat requires identified configuration and revision', text(payload?.definition?.configurationId) && text(payload?.definition?.configurationVersion) && text(candidateRevisionId)),
    row('window-seat.required-values', 'Window Seat definition facts must be real before submission', !!source && positive(source.W) && positive(source.H) && positive(source.depth) && nonempty(source.boards) && source.boards.every(board => text(board?.id) && positive(board?.len) && positive(board?.w)), { owner: OWNER.USER }),
    row('window-seat.local-definition-blockers', 'Window Seat definition conditions must be settled before submission', blockers.length === 0, { owner: OWNER.USER, condition: blockers.map(item => item.t).filter(Boolean).join(', ') || null }),
    row('window-seat.scope-accounting', 'Every defined Window Seat board must survive translation into the Store request', missing.length === 0, { condition: missing.length ? missing.map(id => `UNMAPPED_PART:${id}`).join(', ') : null }),
    row('window-seat.generator-consistency', 'Window Seat sends the exact request generated for its current definition', !!expected && same(payload?.definition, expected)),
    screwsInScope
      ? deferredRow('window-seat.hardware-withheld', 'Window Seat screws are explicitly withheld from Store scope in this version', 'WITHHELD_SCOPE:HARDWARE_SENT=false')
      : notRequiredRow('window-seat.hardware-withheld', 'Window Seat screws are outside the selected project scope'),
    row('window-seat.scope', 'Window Seat committed request scope must remain CUT_PACKAGE_V1', payload?.definitionKind === 'cut_package.v1' && payload?.ruleVersion === '0.1' && Array.isArray(payload?.definition?.cutPackages) && payload.definition.cutPackages.length > 0),
  ];
  const requiredIds = rows.map(item => item.id);
  return runReadiness({ projectId:'window-seat', requestType:'CUT_PACKAGE_V1', scope:'WINDOW_SEAT_COMMITTED', definitionKind:'cut_package.v1', ruleVersion:'0.1', candidateRevisionId, storePin, requiredIds, rows, withheldScope:screwsInScope ? ['WINDOW_SEAT_HARDWARE'] : [] });
}

function outdoorProfile({ root, payload, candidateRevisionId, storePin }) {
  const api = root?.STBOutdoorPicnic;
  const definition = payload?.definition;
  const options = definition?.configurationId === 'OUTDOOR-PICNIC-OPTIONS';
  const expected = options ? null : (typeof api?.request === 'function' ? api.request() : null);
  const optionsIdentity = options && /^od-options-[0-9a-f]{8}$/.test(String(definition?.configurationVersion || '')) && candidateRevisionId === definition.configurationVersion;
  const conditionRows = options ? [] : (typeof api?.conditions === 'function' ? api.conditions() : []);
  const blockers = Array.isArray(conditionRows) ? conditionRows.filter(item => item?.block) : [];
  const packages = Array.isArray(definition?.cutPackages) ? definition.cutPackages : [];
  const rows = [
    row('outdoor.identity', 'Outdoor request requires identified configuration and revision', text(definition?.configurationId) && text(definition?.configurationVersion) && text(candidateRevisionId)),
    row('outdoor.required-values', 'Outdoor requested work must have real part values', nonempty(packages) && packages.every(pkg => text(pkg?.packageId) && isObject(pkg?.material) && nonempty(pkg?.parts) && pkg.parts.every(part => text(part?.partId) && positive(part?.lengthIn)))),
    options
      ? notRequiredRow('outdoor.local-definition-blockers', 'Outdoor options inquiry does not use committed-job definition blockers', 'OPTIONS_SCOPE_EXCLUDES_COMMITTED_BLOCKERS')
      : row('outdoor.local-definition-blockers', 'Outdoor committed definition conditions must be settled before Store inquiry', blockers.length === 0, { owner: OWNER.USER, condition: blockers.map(item => item.t).filter(Boolean).join(', ') || null }),
    row('outdoor.generator-consistency', options ? 'Outdoor options inquiry keeps its generated options identity' : 'Outdoor sends the exact request generated for this inquiry scope', options ? optionsIdentity : !!expected && same(definition, expected)),
    row('outdoor.scope', 'Outdoor Store inquiry scope must be explicit', options ? definition.configurationId === 'OUTDOOR-PICNIC-OPTIONS' : /^OUTDOOR-PICNIC-(?!OPTIONS)/.test(String(definition?.configurationId || ''))),
  ];
  const requiredIds = rows.map(item => item.id);
  return runReadiness({ projectId:'outdoor', requestType:'CUT_PACKAGE_V1', scope:options ? 'OUTDOOR_OPTIONS' : 'OUTDOOR_COMMITTED', definitionKind:'cut_package.v1', ruleVersion:'0.1', candidateRevisionId, storePin, requiredIds, rows });
}

function playhouseProfile({ payload, candidateRevisionId, storePin }) {
  const definition = payload?.definition;
  const sheet = definition?.sheet;
  const features = Array.isArray(definition?.features) ? definition.features : [];
  const opening = features.find(item => item?.featureId === 'OPENING' && item?.kind === 'ARCHED_APERTURE');
  const rows = [
    row('playhouse.identity', 'Playhouse requires identified configuration and revision', text(definition?.configurationId) && text(definition?.configurationVersion) && text(candidateRevisionId)),
    row('playhouse.sheet', 'Playhouse requires real sheet dimensions', isObject(sheet) && positive(sheet.thicknessIn) && positive(sheet.lengthIn) && positive(sheet.widthIn)),
    row('playhouse.opening', 'Playhouse requires complete arched-opening geometry', !!opening && positive(opening.widthIn) && nonnegative(opening.straightHeightIn) && positive(opening.riseIn) && text(opening.placement) && text(opening.retain) && Number.isInteger(opening.requestedTabCount) && opening.requestedTabCount > 0, { owner: OWNER.USER }),
    row('playhouse.scope', 'Playhouse request scope must remain SHEET_PACKAGE_V1', payload?.definitionKind === 'sheet_package.v1' && payload?.ruleVersion === '0.1' && nonempty(features)),
  ];
  const requiredIds = rows.map(item => item.id);
  return runReadiness({ projectId:'playhouse', requestType:'SHEET_PACKAGE_V1', scope:'SHEET_PACKAGE_V1', definitionKind:'sheet_package.v1', ruleVersion:'0.1', candidateRevisionId, storePin, requiredIds, rows });
}

export function admitPublicStoreRequest({ root = globalThis, projectId, requestType, payload, candidateRevisionId, storePin }) {
  if (!PUBLIC_PROJECTS.has(projectId)) {
    throw new PublicAdmissionError('SYSTEM_ADMISSION_PUBLIC_PROJECT_REQUIRED', { projectId, requestType, scope:requestType });
  }
  if (!text(candidateRevisionId)) {
    throw new PublicAdmissionError('SYSTEM_ADMISSION_CANDIDATE_REVISION_REQUIRED', { projectId, requestType, scope:requestType });
  }
  if (!text(storePin) || !/^[0-9a-f]{40}$/i.test(storePin)) {
    throw new PublicAdmissionError('SYSTEM_ADMISSION_STORE_PIN_REQUIRED', { projectId, requestType, scope:requestType });
  }
  if (!isObject(payload)) {
    throw new PublicAdmissionError('SYSTEM_ADMISSION_PAYLOAD_REQUIRED', { projectId, requestType, scope:requestType });
  }

  if (projectId === 'start-own') {
    if (requestType !== 'USER_DEFINED_BOARD_V1') fail('SYSTEM_ADMISSION_REQUEST_TYPE_MISMATCH', { projectId, requestType, scope:'USER_DEFINED_BOARD_V1' });
    return startOwnProfile({ payload, candidateRevisionId, storePin });
  }
  if (projectId === 'alcove') {
    if (requestType !== 'ALCOVE_INSERT_V1') fail('SYSTEM_ADMISSION_REQUEST_TYPE_MISMATCH', { projectId, requestType, scope:'ALCOVE_INSERT_V1' });
    return alcoveProfile({ payload, candidateRevisionId, storePin });
  }
  if (projectId === 'window-seat') {
    if (requestType !== 'CUT_PACKAGE_V1') fail('SYSTEM_ADMISSION_REQUEST_TYPE_MISMATCH', { projectId, requestType, scope:'WINDOW_SEAT_COMMITTED' });
    return windowSeatProfile({ root, payload, candidateRevisionId, storePin });
  }
  if (projectId === 'outdoor') {
    if (requestType !== 'CUT_PACKAGE_V1') fail('SYSTEM_ADMISSION_REQUEST_TYPE_MISMATCH', { projectId, requestType, scope:'OUTDOOR' });
    return outdoorProfile({ root, payload, candidateRevisionId, storePin });
  }
  if (requestType !== 'SHEET_PACKAGE_V1') fail('SYSTEM_ADMISSION_REQUEST_TYPE_MISMATCH', { projectId, requestType, scope:'SHEET_PACKAGE_V1' });
  return playhouseProfile({ payload, candidateRevisionId, storePin });
}
