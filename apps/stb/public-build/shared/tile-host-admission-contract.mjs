// Tile/host and definition/Store admission contract. Owner: System.
//
// Executable half of docs/application/TILE-HOST-ADMISSION-CONTRACT.md. The shared tile host in
// public-build/system-build-current.html loads the deployed copy (public-build/shared/, byte for byte).
// Playhouse, Window Seat, Alcove and Outdoor are on it; the other tiles keep their current paths until each is migrated.
//
// Two interfaces, kept separate on purpose:
//
//   1. Tile -> host (STB-TILE-HOST-0.1). What a tile tells the shell it is embedded in: tile id,
//      interface version, current stage, which steps are usable, and an optional navigation request.
//      It carries no definition, no Store request and no admission evidence. A usable step does not
//      authorize a Store inquiry; nothing in interface 2 reads a tile-host message.
//
//   2. Definition -> Store (STB-DEFINITION-STORE-0.1). From one job-definition revision and one inquiry
//      scope: the admission result and, only when admitted, the bounded request. Admission checks the
//      requirements the tile's admission profile declares, not responsibility rows a tile happened to
//      emit. Admission never checks Store capability: a complete request outside the envelope still
//      reaches Store, and the Store's refusal is the result.
//
// The step labels, Idea label, tile ids and presentation forks are never repeated here. Every function
// that needs them takes the trail contract (STBTrailContract from public-build/stb-trail-contract.js).

import { STATUS, OWNER } from './definition-contract.mjs';

export const TILE_HOST_VERSION = 'STB-TILE-HOST-0.1';
export const DEFINITION_STORE_VERSION = 'STB-DEFINITION-STORE-0.1';
export const LIBRARY_TARGET = 'Project Library';

export const ADMISSION_RESULT = Object.freeze({ ADMITTED: 'ADMITTED', BLOCKED: 'BLOCKED' });
export const BLOCK_REASON = Object.freeze({
  PROFILE_MISSING: 'ADMISSION_PROFILE_MISSING',
  SCOPE_UNDECLARED: 'INQUIRY_SCOPE_UNDECLARED',
  REVISION_REQUIRED: 'DEFINITION_REVISION_REQUIRED',
  REQUIRED_FACT_UNSETTLED: 'REQUIRED_FACT_UNSETTLED',
});
export const ANSWER_AUTHORITY = Object.freeze({ CURRENT: 'CURRENT', HISTORY: 'HISTORY' });

// ---------------------------------------------------------------------------------------------
// Plain-data helpers

function isObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
function text(value) {
  return typeof value === 'string' && value.trim().length > 0;
}
function plain(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}
function deepFreeze(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

// ---------------------------------------------------------------------------------------------
// Interface 1: tile -> host

const TILE_HOST_FIELDS = new Set(['interface', 'tileId', 'stage', 'usableSteps', 'navigationRequest', 'presentationFork']);

// Returns { ok, errors }. The host acts on a message only when ok is true.
export function validateTileHostMessage(trail, message) {
  const errors = [];
  if (!isObject(message)) return Object.freeze({ ok: false, errors: Object.freeze(['MESSAGE_NOT_OBJECT']) });

  for (const key of Object.keys(message)) {
    // Keeps the interfaces separate: a definition, Store request or admission result is not tile-host data.
    if (!TILE_HOST_FIELDS.has(key)) errors.push(`UNKNOWN_FIELD:${key}`);
  }
  if (message.interface !== TILE_HOST_VERSION) errors.push('INTERFACE_VERSION_MISMATCH');

  const tile = trail.tiles.find(item => item.id === message.tileId);
  if (!tile) errors.push('TILE_NOT_DECLARED');

  const ideaLabel = trail.idea.label;
  const steps = [...trail.steps];
  const onIdea = message.stage === ideaLabel;
  if (!onIdea && !steps.includes(message.stage)) errors.push('STAGE_NOT_DECLARED');

  const usable = Array.isArray(message.usableSteps) ? message.usableSteps : null;
  if (!usable) {
    errors.push('USABLE_STEPS_REQUIRED');
  } else {
    if (usable.some(step => !steps.includes(step))) errors.push('USABLE_STEP_NOT_DECLARED');
    if (new Set(usable).size !== usable.length) errors.push('USABLE_STEP_DUPLICATED');
    const order = usable.map(step => steps.indexOf(step));
    if (order.some((index, i) => i > 0 && index < order[i - 1])) errors.push('USABLE_STEPS_OUT_OF_ORDER');
    if (!onIdea && steps.includes(message.stage) && !usable.includes(message.stage)) errors.push('CURRENT_STEP_NOT_USABLE');
  }

  const nav = message.navigationRequest;
  if (nav !== null && nav !== undefined) {
    if (!isObject(nav) || Object.keys(nav).some(key => key !== 'target') || !text(nav.target)) {
      errors.push('NAVIGATION_REQUEST_MALFORMED');
    } else if (nav.target !== ideaLabel && nav.target !== LIBRARY_TARGET) {
      if (!steps.includes(nav.target)) errors.push('NAVIGATION_TARGET_NOT_DECLARED');
      else if (!usable || !usable.includes(nav.target)) errors.push('NAVIGATION_TO_INERT_STEP');
    }
  }

  if (message.presentationFork !== undefined) {
    // Rule 7: the one presentation exception. It lives on its declared line and changes no operational rule.
    const fork = trail.presentationForks.find(item => item.tileId === message.tileId);
    if (!fork) errors.push('PRESENTATION_FORK_NOT_DECLARED');
    else if (message.stage !== fork.line) errors.push('PRESENTATION_FORK_OFF_ITS_LINE');
    else if (!fork.options.includes(message.presentationFork)) errors.push('PRESENTATION_FORK_OPTION_NOT_DECLARED');
  }

  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

// The nav line the host draws from a valid message. Inert steps are shown disabled, never hidden and
// never a silent no-op. Nothing here can start a Store inquiry.
export function hostNavLine(trail, message) {
  const check = validateTileHostMessage(trail, message);
  if (!check.ok) throw new TypeError('TILE_HOST_MESSAGE_INVALID: ' + check.errors.join(', '));
  const onIdea = message.stage === trail.idea.label;
  return Object.freeze({
    tileId: message.tileId,
    stepBarShown: !onIdea,
    steps: Object.freeze(trail.steps.map((label, index) => Object.freeze({
      label,
      number: index + 1,
      current: label === message.stage,
      enabled: message.usableSteps.includes(label),
    }))),
  });
}

// ---------------------------------------------------------------------------------------------
// Interface 2: definition -> Store

// A requirement is declared by the profile. `owner` is who must settle it. A STORE-owned requirement
// is a demand the Store resolves (for example hardware selection); it travels open and does not block.
const KIND = Object.freeze({
  text: value => text(value),
  'positive-number': value => Number.isFinite(value) && value > 0,
  'nonempty-list': value => Array.isArray(value) && value.length > 0,
  object: value => isObject(value) && Object.keys(value).length > 0,
});
const req = (id, owner, kind, title) => Object.freeze({ id, owner, kind, title });

// Admission profiles, one per tile declared in the trail contract. A registry keyed by tile id: shared
// admission code does not branch on tile identity. Profiles here are first declarations for the
// contract tests; they are not yet a port of every row in public-build/stb-public-admission.mjs.
export const ADMISSION_PROFILES = deepFreeze({
  'start-own': {
    version: '0.1',
    scopes: {
      USER_DEFINED_BOARD_V1: {
        requestType: 'USER_DEFINED_BOARD_V1',
        requires: [
          req('start-own.material', OWNER.PROJECT, 'object', 'Material demand'),
          req('start-own.workpiece-length', OWNER.USER, 'positive-number', 'Defined workpiece length (in)'),
          req('start-own.parts', OWNER.USER, 'nonempty-list', 'Identified parts with real lengths'),
          req('start-own.operations', OWNER.PROJECT, 'nonempty-list', 'Declared operations'),
          req('start-own.datum', OWNER.RULE, 'object', 'Cut and datum meaning'),
        ],
      },
    },
  },
  // Alcove 0.2: what its page already sends the Store with every definition. The opening is the unit's width,
  // height and depth as the page fits them to the measured room. Added: the pilot spot demand, on or off, which
  // the page always states and the Store must evaluate or refuse (USER).
  alcove: {
    version: '0.2',
    scopes: {
      ALCOVE_INSERT_V1: {
        requestType: 'ALCOVE_INSERT_V1',
        requires: [
          req('alcove.opening', OWNER.USER, 'object', 'Unit width, height and depth fitted to the opening'),
          req('alcove.material', OWNER.PROJECT, 'object', 'Material demand'),
          req('alcove.board-requirements', OWNER.PROJECT, 'nonempty-list', 'Upright and shelf parent responsibilities'),
          req('alcove.component-programs', OWNER.PROJECT, 'nonempty-list', 'Component programs for every parent'),
          req('alcove.spot-demand', OWNER.USER, 'object', 'Pilot spot demand, on or off'),
          req('alcove.hardware', OWNER.STORE, 'object', 'Pins-and-screws selection'),
        ],
      },
    },
  },
  // Window Seat 0.2: what its page already requires before it asks the Store (each blocking condition on the
  // page names one of these facts). Width and height are the unit's overall W and H, as the page defines them.
  'window-seat': {
    version: '0.2',
    scopes: {
      WINDOW_SEAT_COMMITTED: {
        requestType: 'CUT_PACKAGE_V1',
        requires: [
          req('window-seat.width', OWNER.USER, 'positive-number', 'Overall width W (in)'),
          req('window-seat.height', OWNER.USER, 'positive-number', 'Overall height H (in)'),
          req('window-seat.depth', OWNER.USER, 'positive-number', 'Depth (in)'),
          req('window-seat.boards', OWNER.PROJECT, 'nonempty-list', 'Every defined board with real length and width'),
          req('window-seat.added-knobs', OWNER.USER, 'object', 'Every knob added by hand, with what it needs'),
          req('window-seat.kept-asks', OWNER.USER, 'object', 'Every ask kept on the job, described'),
        ],
      },
    },
  },
  // Outdoor 0.2: what its page already requires before it asks. Two scopes, kept apart: OUTDOOR_OPTIONS prices the
  // "From" and the option buttons and never reaches the terms flow; OUTDOOR_COMMITTED is this exact table. Added to
  // the committed scope: every spot hole and decorative cut tried on the bench is set (each blocking condition on
  // the bench is one of these), owned by the user.
  outdoor: {
    version: '0.2',
    scopes: {
      OUTDOOR_OPTIONS: {
        requestType: 'CUT_PACKAGE_V1',
        requires: [
          req('outdoor.cut-packages', OWNER.PROJECT, 'nonempty-list', 'Requested work with real part values'),
        ],
      },
      OUTDOOR_COMMITTED: {
        requestType: 'CUT_PACKAGE_V1',
        requires: [
          req('outdoor.plan', OWNER.USER, 'text', 'Chosen plan'),
          req('outdoor.cut-packages', OWNER.PROJECT, 'nonempty-list', 'Requested work with real part values'),
          req('outdoor.bench-work', OWNER.USER, 'object', 'Every spot hole and decorative cut tried on the bench, set'),
        ],
      },
    },
  },
  playhouse: {
    version: '0.1',
    scopes: {
      SHEET_PACKAGE_V1: {
        requestType: 'SHEET_PACKAGE_V1',
        requires: [
          req('playhouse.sheet', OWNER.PROJECT, 'object', 'Real sheet dimensions'),
          req('playhouse.opening', OWNER.USER, 'object', 'Complete arched-opening geometry'),
        ],
      },
    },
  },
});

const SETTLED = new Set([STATUS.CONFIRMED, STATUS.DERIVED]);

function blocked(revision, inquiryScope, reason, blocking) {
  return deepFreeze({
    interface: DEFINITION_STORE_VERSION,
    definitionRevisionId: revision?.definitionRevisionId ?? null,
    inquiryScope: inquiryScope ?? null,
    admission: { result: ADMISSION_RESULT.BLOCKED, reason, blocking },
    request: null,
  });
}

// admit({ profiles, revision, inquiryScope }) -> { interface, definitionRevisionId, inquiryScope, admission, request }
//
// `revision` is one job-definition revision: { definitionRevisionId, tileId, facts: { [factId]: { value, status } } }.
// Only the profile's declared requirements are read. A fact the revision carries but the scope does not
// declare is not sent. Source material and retained requests live on the job record, not the revision,
// and are never read here. Takes no tile-host message: a usable step cannot admit anything.
export function admit({ profiles = ADMISSION_PROFILES, revision, inquiryScope }) {
  if (!isObject(revision) || !text(revision.definitionRevisionId)) {
    return blocked(revision, inquiryScope, BLOCK_REASON.REVISION_REQUIRED,
      [{ factId: null, owner: OWNER.PROJECT, title: 'Identified job-definition revision', condition: 'MISSING' }]);
  }
  const profile = profiles[revision.tileId];
  if (!profile) {
    return blocked(revision, inquiryScope, BLOCK_REASON.PROFILE_MISSING,
      [{ factId: null, owner: OWNER.PROJECT, title: `Admission profile for ${revision.tileId}`, condition: 'MISSING' }]);
  }
  const scope = profile.scopes[inquiryScope];
  if (!scope) {
    return blocked(revision, inquiryScope, BLOCK_REASON.SCOPE_UNDECLARED,
      [{ factId: null, owner: OWNER.PROJECT, title: `Inquiry scope ${inquiryScope} on ${revision.tileId}`, condition: 'UNDECLARED' }]);
  }

  const facts = isObject(revision.facts) ? revision.facts : {};
  const blocking = [];
  const sent = {};
  const openDemands = [];
  for (const requirement of scope.requires) {
    const fact = Object.prototype.hasOwnProperty.call(facts, requirement.id) ? facts[requirement.id] : undefined;
    const condition = !isObject(fact) ? 'MISSING'
      : !SETTLED.has(fact.status) ? `STATUS_${fact.status ?? 'NONE'}`
      : !KIND[requirement.kind](fact.value) ? 'INVALID_VALUE'
      : null;
    if (condition === null) {
      sent[requirement.id] = plain(fact.value);
    } else if (requirement.owner === OWNER.STORE) {
      openDemands.push(requirement.id);
    } else {
      blocking.push({ factId: requirement.id, owner: requirement.owner, title: requirement.title, condition });
    }
  }
  if (blocking.length) return blocked(revision, inquiryScope, BLOCK_REASON.REQUIRED_FACT_UNSETTLED, blocking);

  // No envelope, capability, price or supportability check belongs here. That is the Store's answer.
  return deepFreeze({
    interface: DEFINITION_STORE_VERSION,
    definitionRevisionId: revision.definitionRevisionId,
    inquiryScope,
    admission: { result: ADMISSION_RESULT.ADMITTED, reason: null, blocking: [] },
    request: {
      interface: DEFINITION_STORE_VERSION,
      tileId: revision.tileId,
      profileVersion: profile.version,
      requestType: scope.requestType,
      inquiryScope,
      definitionRevisionId: revision.definitionRevisionId,
      facts: sent,
      openDemands,
    },
  });
}

// inquire(admission, ask) -> { reachedStore, answer }. `ask` is the transport to the live Store.
// A blocked admission never calls it. An admitted one always does, whatever the values are.
export async function inquire(admission, ask) {
  if (admission?.admission?.result !== ADMISSION_RESULT.ADMITTED) {
    return deepFreeze({ reachedStore: false, answer: null, blocking: plain(admission?.admission?.blocking ?? []) });
  }
  const answer = await ask(admission.request);
  return deepFreeze({
    reachedStore: true,
    answer: { ...plain(answer), definitionRevisionId: admission.definitionRevisionId, authority: ANSWER_AUTHORITY.CURRENT },
    blocking: [],
  });
}

// ---------------------------------------------------------------------------------------------
// Available steps and reopening a job record

// Recalculated, never restored. Intent and the bench are always usable. "The Store answers" is usable
// when the current revision is admitted. "Your call" needs a fresh, current-authority answer for this
// exact revision that is within the envelope; a refusal leaves it inert (rule 5). The later steps are
// gated by stb-terms-flow.js and stay inert in this contract.
export function availableSteps({ trail, admission, freshAnswer = null }) {
  const [intent, bench, storeAnswers, yourCall] = trail.steps;
  const usable = [intent, bench];
  const admitted = admission?.admission?.result === ADMISSION_RESULT.ADMITTED;
  if (admitted) usable.push(storeAnswers);
  if (admitted
      && freshAnswer?.authority === ANSWER_AUTHORITY.CURRENT
      && freshAnswer.definitionRevisionId === admission.definitionRevisionId
      && freshAnswer.withinEnvelope === true) {
    usable.push(yourCall);
  }
  return Object.freeze(usable);
}

// reopenJobRecord({ trail, profiles, record }) restores the job record's history and recalculates what is
// available now. A saved Store answer is history, not current authority, even when it names the current
// revision: reopening never restores an answer as current. Saved usable steps are ignored.
//
// record: { tileId, currentRevisionId, inquiryScope, lastStage, sourceMaterial, revisions[], retainedRequests[],
//           storeAnswers[], savedUsableSteps[] }
export function reopenJobRecord({ trail, profiles = ADMISSION_PROFILES, record }) {
  const revisions = Array.isArray(record?.revisions) ? record.revisions : [];
  const current = revisions.find(item => item?.definitionRevisionId === record?.currentRevisionId) || null;
  const admission = admit({ profiles, revision: current, inquiryScope: record?.inquiryScope });
  const usableSteps = availableSteps({ trail, admission, freshAnswer: null });
  const stage = usableSteps.includes(record?.lastStage) ? record.lastStage : usableSteps[usableSteps.length - 1];

  return deepFreeze({
    tileId: record?.tileId ?? null,
    history: {
      sourceMaterial: plain(record?.sourceMaterial ?? []),
      revisions: plain(revisions),
      retainedRequests: plain(record?.retainedRequests ?? []),
      storeAnswers: (Array.isArray(record?.storeAnswers) ? record.storeAnswers : [])
        .map(answer => ({ ...plain(answer), authority: ANSWER_AUTHORITY.HISTORY })),
    },
    current: {
      definitionRevisionId: current?.definitionRevisionId ?? null,
      inquiryScope: record?.inquiryScope ?? null,
      admission,
      storeAnswer: null,
      usableSteps,
      stage,
    },
  });
}
