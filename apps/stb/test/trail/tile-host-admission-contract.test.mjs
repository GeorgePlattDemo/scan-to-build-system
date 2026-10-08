// Tile/host and definition/Store admission contract (the shared tile host uses it; every tile is on it).
// Contract: apps/stb/shared/tile-host-admission-contract.mjs. Spec: docs/application/TILE-HOST-ADMISSION-CONTRACT.md.
//
// Proves three cases for every tile declared in public-build/stb-trail-contract.js:
//   1. A missing required fact blocks before Store and names its owner, even when the tile reports
//      "The Store answers" as usable. Admission reads the profile's declared requirements, not the rows
//      a tile emitted.
//   2. A complete request outside Store capability still reaches Store. Admission makes no capability
//      check; the request is bounded to the scope's declared facts and leaves out source material and
//      retained requests the job record holds.
//   3. Reopening a record restores history and recalculates available steps. A saved Store answer comes
//      back as history, never as current authority, even for the current revision.
//   5. A Store answer authorizes nothing unless it is the fresh answer for this exact revision and this
//      inquiry scope: a saved answer, another revision's or another scope's answer, an answer from before the
//      definition changed, and a refusal all leave Your call inert. A fresh in-envelope answer opens it.
// No live Store is used: `ask` stands in for the Store transport and records what reached it.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import {
  TILE_HOST_VERSION,
  DEFINITION_STORE_VERSION,
  ADMISSION_PROFILES,
  ADMISSION_RESULT,
  BLOCK_REASON,
  ANSWER_AUTHORITY,
  LIBRARY_TARGET,
  validateTileHostMessage,
  hostNavLine,
  admit,
  inquire,
  availableSteps,
  isCurrentAnswer,
  reopenJobRecord,
} from '../../shared/tile-host-admission-contract.mjs';
import { STATUS, OWNER } from '../../shared/definition-contract.mjs';

const ROOT = fileURLToPath(new URL('../../public-build/', import.meta.url));
const sandbox = {};
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'stb-trail-contract.js'), 'utf8'), sandbox, { filename: 'stb-trail-contract.js' });
const trail = sandbox.STBTrailContract;
const [INTENT, BENCH, STORE_ANSWERS, YOUR_CALL, WE_CUT, PICK_UP] = trail.steps;
const TILE_IDS = [...trail.tiles.map(tile => tile.id)];

const ok = value => ({ value, status: STATUS.CONFIRMED });

// One complete job-definition revision per tile, the USER-owned fact case 1 leaves out, and the values that
// put case 2 past any envelope the Store would support (System does not know or check that envelope).
const FIXTURES = {
  'start-own': {
    scope: 'USER_DEFINED_BOARD_V1',
    facts: {
      'start-own.material': ok({ species: 'white-oak', form: 'S4S', nominalT: 1, nominalW: 6 }),
      'start-own.workpiece-length': ok(48),
      'start-own.parts': ok([{ partId: 'P1', lengthIn: 22 }, { partId: 'P2', lengthIn: 22 }]),
      'start-own.operations': ok(['CROSSCUT']),
      'start-own.datum': ok({ sawAngleDeg: 0, cutPlane: 'miter-face', endIdentity: 'both', endRelation: 'parallel',
        lengthDatum: 'long-long-outer-edge', datumCMethod: 'REFERENCE_CUT' }),
      'start-own.spot-demand': ok({ required: false }),
    },
    userFact: 'start-own.workpiece-length',
    pastEnvelope: { 'start-own.workpiece-length': ok(4800), 'start-own.parts': ok([{ partId: 'P1', lengthIn: 4790 }]) },
  },
  alcove: {
    scope: 'ALCOVE_INSERT_V1',
    facts: {
      'alcove.opening': ok({ widthIn: 30, heightIn: 72, depthIn: 12 }),
      'alcove.material': ok({ species: 'poplar', form: 'S4S', nominalT: 1, nominalW: 12 }),
      'alcove.board-requirements': ok([{ requirementId: 'ALCOVE-UPRIGHT-PARENTS', requiredOps: ['CROSSCUT'] },
        { requirementId: 'ALCOVE-SHELF-PARENTS', requiredOps: ['CROSSCUT'] }]),
      'alcove.component-programs': ok([
        { componentId: 'U1', requirementId: 'ALCOVE-UPRIGHT-PARENTS', finishedLengthIn: 72, finishedWidthIn: 5.5 },
        { componentId: 'S1', requirementId: 'ALCOVE-SHELF-PARENTS', finishedLengthIn: 28.5, finishedWidthIn: 5.5 }]),
      'alcove.spot-demand': ok({ enabled: false, mode: 'SPOT_ON_LOCATION', toolDiameterIn: 0.1875, features: [] }),
      // alcove.hardware is STORE-owned and deliberately left unresolved: the Store selects it.
    },
    userFact: 'alcove.opening',
    pastEnvelope: { 'alcove.opening': ok({ widthIn: 1000, heightIn: 1000, depthIn: 400 }) },
  },
  'window-seat': {
    scope: 'WINDOW_SEAT_COMMITTED',
    facts: {
      'window-seat.width': ok(60),
      'window-seat.height': ok(18),
      'window-seat.depth': ok(16),
      'window-seat.boards': { value: [{ id: 'B1', len: 60, w: 16 }], status: STATUS.DERIVED },
      'window-seat.added-knobs': ok({ front: { board: true }, xspot: null, screws: null }),
      'window-seat.kept-asks': ok({ kept: 1 }),
    },
    userFact: 'window-seat.depth',
    pastEnvelope: { 'window-seat.width': ok(900), 'window-seat.boards': { value: [{ id: 'B1', len: 900, w: 60 }], status: STATUS.DERIVED } },
  },
  outdoor: {
    scope: 'OUTDOOR_COMMITTED',
    facts: {
      'outdoor.plan': ok('OUTDOOR-PICNIC-6FT'),
      'outdoor.cut-packages': ok([{ packageId: 'TOP', material: { species: 'cedar', form: 'board', nominalT: 2, nominalW: 4 }, parts: [{ partId: 'T1', lengthIn: 72 }] }]),
      'outdoor.bench-work': ok({ work: [] }),
    },
    userFact: 'outdoor.plan',
    pastEnvelope: { 'outdoor.cut-packages': ok([{ packageId: 'TOP', material: { species: 'cedar', form: 'board', nominalT: 2, nominalW: 4 }, parts: [{ partId: 'T1', lengthIn: 2000 }] }]) },
  },
  playhouse: {
    scope: 'SHEET_PACKAGE_V1',
    facts: {
      'playhouse.sheet': ok({ thicknessIn: 0.75, lengthIn: 96, widthIn: 48 }),
      'playhouse.opening': ok({ widthIn: 18, straightHeightIn: 12, riseIn: 9, requestedTabCount: 4 }),
    },
    userFact: 'playhouse.opening',
    pastEnvelope: { 'playhouse.sheet': ok({ thicknessIn: 4, lengthIn: 400, widthIn: 400 }) },
  },
};

const SOURCE_MATERIAL = [{ kind: 'photo', name: 'SOURCE-PHOTO-front-wall.jpg' }, { kind: 'sketch', name: 'SOURCE-SKETCH-napkin.png' }];
const RETAINED_REQUEST_ID = 'RETAINED-REQUEST-r1';

function revision(tileId, id, facts) {
  // A fact the tile emitted that its profile does not declare. It must never travel.
  return { definitionRevisionId: id, tileId, facts: { ...facts, [`${tileId}.scratch-note`]: ok('UNDECLARED-FACT') } };
}
function record(tileId, current) {
  const fx = FIXTURES[tileId];
  return {
    tileId,
    currentRevisionId: current.definitionRevisionId,
    inquiryScope: fx.scope,
    lastStage: YOUR_CALL,
    sourceMaterial: SOURCE_MATERIAL,
    revisions: [revision(tileId, `${tileId}-r1`, fx.facts), current],
    retainedRequests: [{ requestId: RETAINED_REQUEST_ID, definitionRevisionId: `${tileId}-r1`, inquiryScope: fx.scope }],
    storeAnswers: [
      { requestId: RETAINED_REQUEST_ID, definitionRevisionId: `${tileId}-r1`, status: 'BUDGETARY_ESTIMATE', withinEnvelope: true, authority: ANSWER_AUTHORITY.CURRENT },
      { requestId: 'RETAINED-REQUEST-r2', definitionRevisionId: current.definitionRevisionId, status: 'BUDGETARY_ESTIMATE', withinEnvelope: true, authority: ANSWER_AUTHORITY.CURRENT },
    ],
    savedUsableSteps: [...trail.steps],
  };
}
function storeStub(answer) {
  const calls = [];
  const ask = async request => { calls.push(request); return answer; };
  return { calls, ask };
}
function tileMessage(tileId, extra = {}) {
  return {
    interface: TILE_HOST_VERSION,
    tileId,
    stage: BENCH,
    usableSteps: [INTENT, BENCH, STORE_ANSWERS],
    navigationRequest: { target: STORE_ANSWERS },
    ...extra,
  };
}

test('contract covers exactly the five declared tiles', () => {
  assert.deepEqual(TILE_IDS, ['start-own', 'alcove', 'window-seat', 'outdoor', 'playhouse']);
  assert.deepEqual(Object.keys(ADMISSION_PROFILES).sort(), [...TILE_IDS].sort());
  assert.deepEqual(Object.keys(FIXTURES).sort(), [...TILE_IDS].sort());
  for (const id of TILE_IDS) assert.ok(Object.keys(ADMISSION_PROFILES[id].scopes).length > 0, id);
});

test('case 1: a missing required fact blocks before Store and names the owner', async () => {
  for (const tileId of TILE_IDS) {
    const fx = FIXTURES[tileId];

    // The tile says "The Store answers" is usable and asks to go there. That message is valid tile-host data,
    // and it authorizes nothing: admission never reads it.
    const message = tileMessage(tileId);
    assert.equal(validateTileHostMessage(trail, message).ok, true, tileId);

    // The tile simply did not emit the fact. The profile still requires it.
    const { [fx.userFact]: _omitted, ...emitted } = fx.facts;
    const rev = revision(tileId, `${tileId}-r2`, emitted);
    const result = admit({ revision: rev, inquiryScope: fx.scope });
    assert.equal(result.interface, DEFINITION_STORE_VERSION);
    assert.equal(result.admission.result, ADMISSION_RESULT.BLOCKED, tileId);
    assert.equal(result.admission.reason, BLOCK_REASON.REQUIRED_FACT_UNSETTLED, tileId);
    assert.deepEqual(result.admission.blocking.map(b => [b.factId, b.owner, b.condition]), [[fx.userFact, OWNER.USER, 'MISSING']], tileId);
    assert.equal(result.request, null, tileId);

    const store = storeStub({ status: 'SHOULD_NOT_BE_ASKED' });
    const sent = await inquire(result, store.ask);
    assert.equal(sent.reachedStore, false, tileId);
    assert.equal(store.calls.length, 0, `${tileId}: nothing reached Store`);
    assert.equal(sent.blocking[0].owner, OWNER.USER, tileId);
    assert.ok(!availableSteps({ trail, admission: result }).includes(STORE_ANSWERS), `${tileId}: The Store answers is inert`);

    // Present but unresolved is the same block; the owner is still named.
    const unresolved = revision(tileId, `${tileId}-r3`, { ...fx.facts, [fx.userFact]: { value: null, status: STATUS.UNRESOLVED } });
    const second = admit({ revision: unresolved, inquiryScope: fx.scope });
    assert.deepEqual(second.admission.blocking.map(b => [b.factId, b.owner, b.condition]), [[fx.userFact, OWNER.USER, 'STATUS_UNRESOLVED']], tileId);
  }

  // Only profile-declared requirements count. A tile emitting extra rows cannot stand in for a missing one.
  const fx = FIXTURES.playhouse;
  const padded = revision('playhouse', 'playhouse-r4', {
    'playhouse.sheet': fx.facts['playhouse.sheet'],
    'playhouse.opening-ok': ok(true),
    'playhouse.unresolved': ok([]),
  });
  assert.equal(admit({ revision: padded, inquiryScope: fx.scope }).admission.result, ADMISSION_RESULT.BLOCKED);

  // A tile with no declared profile, or an undeclared scope, fails closed rather than passing on what it emitted.
  assert.equal(admit({ revision: revision('unknown-tile', 'u-r1', {}), inquiryScope: 'X' }).admission.reason, BLOCK_REASON.PROFILE_MISSING);
  assert.equal(admit({ revision: revision('outdoor', 'o-r1', FIXTURES.outdoor.facts), inquiryScope: 'OUTDOOR_WHATEVER' }).admission.reason, BLOCK_REASON.SCOPE_UNDECLARED);
});

test('case 2: a complete request outside Store capability still reaches Store', async () => {
  for (const tileId of TILE_IDS) {
    const fx = FIXTURES[tileId];
    const rec = record(tileId, revision(tileId, `${tileId}-r2`, { ...fx.facts, ...fx.pastEnvelope }));
    const current = rec.revisions.at(-1);

    const result = admit({ revision: current, inquiryScope: fx.scope });
    assert.equal(result.admission.result, ADMISSION_RESULT.ADMITTED, tileId);
    assert.deepEqual(result.admission.blocking, [], tileId);

    const refusal = { status: 'REFUSED', reason: 'OUTSIDE_STORE_ENVELOPE', withinEnvelope: false };
    const store = storeStub(refusal);
    const sent = await inquire(result, store.ask);
    assert.equal(sent.reachedStore, true, tileId);
    assert.equal(store.calls.length, 1, `${tileId}: exactly one request reached Store`);
    assert.equal(sent.answer.status, 'REFUSED', `${tileId}: the refusal is the result`);
    assert.equal(sent.answer.authority, ANSWER_AUTHORITY.CURRENT);

    // The request is bounded: the scope's declared facts, this revision, this scope. Nothing else from the record.
    const request = store.calls[0];
    const profile = ADMISSION_PROFILES[tileId].scopes[fx.scope];
    const declared = profile.requires.map(r => r.id);
    assert.equal(request.definitionRevisionId, current.definitionRevisionId);
    assert.equal(request.inquiryScope, fx.scope);
    assert.equal(request.requestType, profile.requestType);
    assert.ok(Object.keys(request.facts).every(id => declared.includes(id)), `${tileId}: only declared facts travel`);
    for (const [id, fact] of Object.entries(fx.pastEnvelope)) assert.deepEqual(request.facts[id], fact.value, `${tileId}: ${id} travels as defined`);
    const wire = JSON.stringify(request);
    for (const absent of ['SOURCE-PHOTO', 'SOURCE-SKETCH', RETAINED_REQUEST_ID, 'UNDECLARED-FACT', `${tileId}-r1`]) {
      assert.ok(!wire.includes(absent), `${tileId}: request leaves out ${absent}`);
    }
    // The record still holds them.
    assert.equal(rec.sourceMaterial.length, 2);
    assert.equal(rec.retainedRequests[0].requestId, RETAINED_REQUEST_ID);

    // Past the envelope, Your call stays inert (rule 5).
    const usable = availableSteps({ trail, admission: result, freshAnswer: sent.answer });
    assert.deepEqual(usable, [INTENT, BENCH, STORE_ANSWERS], tileId);
  }

  // A STORE-owned requirement travels as an open demand for Store to resolve; it does not block.
  const alcove = admit({ revision: revision('alcove', 'alcove-r9', FIXTURES.alcove.facts), inquiryScope: 'ALCOVE_INSERT_V1' });
  assert.deepEqual(alcove.request.openDemands, ['alcove.hardware']);
});

test('case 3: reopening restores history and recalculates; a saved answer is never current authority', () => {
  for (const tileId of TILE_IDS) {
    const fx = FIXTURES[tileId];
    const rec = record(tileId, revision(tileId, `${tileId}-r2`, fx.facts));
    const reopened = reopenJobRecord({ trail, record: rec });

    // History is restored whole.
    assert.deepEqual(reopened.history.revisions.map(r => r.definitionRevisionId), [`${tileId}-r1`, `${tileId}-r2`]);
    assert.deepEqual(reopened.history.sourceMaterial, SOURCE_MATERIAL);
    assert.equal(reopened.history.retainedRequests[0].requestId, RETAINED_REQUEST_ID);
    assert.equal(reopened.history.storeAnswers.length, 2);
    assert.ok(reopened.history.storeAnswers.every(a => a.authority === ANSWER_AUTHORITY.HISTORY), `${tileId}: saved answers are history`);

    // Even the saved answer for the current revision is not restored as current authority.
    assert.equal(reopened.history.storeAnswers[1].definitionRevisionId, reopened.current.definitionRevisionId);
    assert.equal(reopened.current.storeAnswer, null, tileId);

    // Available steps are recalculated, not restored from savedUsableSteps.
    assert.equal(reopened.current.admission.admission.result, ADMISSION_RESULT.ADMITTED, tileId);
    assert.deepEqual(reopened.current.usableSteps, [INTENT, BENCH, STORE_ANSWERS], tileId);
    for (const inert of [YOUR_CALL, WE_CUT, PICK_UP]) assert.ok(!reopened.current.usableSteps.includes(inert), `${tileId}: ${inert} inert after reopen`);
    assert.equal(reopened.current.stage, STORE_ANSWERS, `${tileId}: saved stage "${YOUR_CALL}" is not restored`);

    // The host would draw that state: the saved stage cannot be navigated to.
    const message = tileMessage(tileId, { stage: reopened.current.stage, usableSteps: [...reopened.current.usableSteps], navigationRequest: { target: YOUR_CALL } });
    assert.deepEqual([...validateTileHostMessage(trail, message).errors], ['NAVIGATION_TO_INERT_STEP'], tileId);

    // A reopened record whose current revision lost a required fact recalculates to blocked and names the owner.
    const { [fx.userFact]: _gone, ...rest } = fx.facts;
    const stale = reopenJobRecord({ trail, record: record(tileId, revision(tileId, `${tileId}-r2`, rest)) });
    assert.deepEqual(stale.current.usableSteps, [INTENT, BENCH], tileId);
    assert.equal(stale.current.admission.admission.blocking[0].owner, OWNER.USER, tileId);
    assert.equal(stale.history.storeAnswers.length, 2, `${tileId}: history kept even when blocked`);

    // Restored history cannot be edited into authority.
    assert.throws(() => { reopened.history.storeAnswers[1].authority = ANSWER_AUTHORITY.CURRENT; }, TypeError);
  }
});

test('tile-host interface carries navigation only; the Window Seat Idea fork is presentation only', () => {
  // No definition, request or admission travels tile -> host.
  const smuggled = tileMessage('alcove', { storeRequest: { requestType: 'ALCOVE_INSERT_V1' }, admission: { result: 'ADMITTED' } });
  assert.deepEqual([...validateTileHostMessage(trail, smuggled).errors], ['UNKNOWN_FIELD:storeRequest', 'UNKNOWN_FIELD:admission']);
  assert.ok(validateTileHostMessage(trail, tileMessage('outdoor', { interface: 'STB-TILE-HOST-0.0' })).errors.includes('INTERFACE_VERSION_MISMATCH'));
  assert.ok(validateTileHostMessage(trail, tileMessage('nope')).errors.includes('TILE_NOT_DECLARED'));
  assert.equal(validateTileHostMessage(trail, tileMessage('start-own', { navigationRequest: { target: LIBRARY_TARGET } })).ok, true);

  // Inert steps are drawn disabled, never dropped.
  const line = hostNavLine(trail, tileMessage('playhouse'));
  assert.deepEqual(line.steps.map(s => [s.number, s.label, s.enabled]), trail.steps.map((label, i) => [i + 1, label, i < 3]));
  assert.equal(line.steps.filter(s => s.current).length, 1);
  assert.equal(hostNavLine(trail, tileMessage('playhouse', { stage: trail.idea.label, navigationRequest: null })).stepBarShown, false);

  // The fork lives on Window Seat's Idea line only.
  const fork = trail.presentationForks.find(f => f.tileId === 'window-seat');
  assert.deepEqual([...fork.options], ['Intent', 'One full scroll']);
  for (const option of fork.options) {
    assert.equal(validateTileHostMessage(trail, tileMessage('window-seat', { stage: fork.line, presentationFork: option, navigationRequest: null })).ok, true, option);
  }
  assert.ok(validateTileHostMessage(trail, tileMessage('window-seat', { presentationFork: 'One full scroll' })).errors.includes('PRESENTATION_FORK_OFF_ITS_LINE'));
  assert.ok(validateTileHostMessage(trail, tileMessage('outdoor', { stage: trail.idea.label, presentationFork: 'Intent', navigationRequest: null })).errors.includes('PRESENTATION_FORK_NOT_DECLARED'));

  // Either way through, the same revision gives the same admission and the same request. Admission has no
  // tile-host input: a message handed to it alongside the revision is ignored, fork and usable steps included.
  const rev = revision('window-seat', 'window-seat-r2', FIXTURES['window-seat'].facts);
  const plainAdmit = admit({ revision: rev, inquiryScope: 'WINDOW_SEAT_COMMITTED' });
  for (const option of fork.options) {
    const message = tileMessage('window-seat', { stage: fork.line, presentationFork: option, navigationRequest: null, usableSteps: [...trail.steps] });
    assert.deepEqual(admit({ revision: rev, inquiryScope: 'WINDOW_SEAT_COMMITTED', tileHostMessage: message }), plainAdmit, option);
  }
  const { [FIXTURES['window-seat'].userFact]: _d, ...short } = FIXTURES['window-seat'].facts;
  const allUsable = tileMessage('window-seat', { usableSteps: [...trail.steps], stage: YOUR_CALL });
  assert.equal(admit({ revision: revision('window-seat', 'window-seat-r5', short), inquiryScope: 'WINDOW_SEAT_COMMITTED', tileHostMessage: allUsable }).admission.result, ADMISSION_RESULT.BLOCKED);
});

test('the shared tile host loads the exact contract bytes', () => {
  const canonical = fs.readFileSync(new URL('../../shared/tile-host-admission-contract.mjs', import.meta.url));
  const deployed = fs.readFileSync(new URL('../../public-build/shared/tile-host-admission-contract.mjs', import.meta.url));
  assert.deepEqual(deployed, canonical);
});

// Case 4: a nonempty object or list is not a complete fact. Where a profile names the fields its page emits, a
// settled fact missing one blocks before Store with the fact id, its owner and the missing field paths. A complete
// one still reaches Store, past any envelope. Only the four tightened facts are exercised; the rest stay presence only.
test('case 4: a malformed nested fact blocks before Store with the fact id and owner; a complete one still reaches Store', async () => {
  const facts = (tileId, overrides) => revision(tileId, `${tileId}-n`, { ...FIXTURES[tileId].facts, ...overrides });
  const title = id => Object.values(ADMISSION_PROFILES).flatMap(p => Object.values(p.scopes)).flatMap(s => s.requires).find(r => r.id === id).title;
  const BLOCKS = [
    // Window Seat added knobs: an added knob stated as an object of nulls does not admit.
    ['window-seat', 'window-seat.added-knobs', { front: null, xspot: { target: null, offset: null, place: null }, screws: null },
      ['xspot.target', 'xspot.offset', 'xspot.place']],
    // The extra spot needs a part, a distance and a placement.
    ['window-seat', 'window-seat.added-knobs', { front: null, xspot: { target: 'C-SEAT', offset: '3 1/2', place: '' }, screws: null },
      ['xspot.place']],
    ['window-seat', 'window-seat.added-knobs', { front: null, xspot: { target: 'C-SEAT', offset: '0', place: 'center' }, screws: null },
      ['xspot.offset']],
    // Screws need a gauge, a length, a finish and a count.
    ['window-seat', 'window-seat.added-knobs', { front: null, xspot: null, screws: { gauge: '#8', lengthIn: '1 1/4', finish: '', qty: '' } },
      ['screws.finish', 'screws.qty']],
    ['window-seat', 'window-seat.added-knobs', { front: null, xspot: null, screws: { gauge: '', lengthIn: 'long', finish: 'zinc', qty: '2.5' } },
      ['screws.gauge', 'screws.lengthIn', 'screws.qty']],
    // A knob the page always states, left out of the object, is missing.
    ['window-seat', 'window-seat.added-knobs', { front: { board: true } }, ['xspot', 'screws']],
    ['window-seat', 'window-seat.added-knobs', { front: { board: 'yes' }, xspot: null, screws: null }, ['front.board']],
    // Kept asks: the page emits a count. Something that is not a count does not admit.
    ['window-seat', 'window-seat.kept-asks', { kept: null }, ['kept']],
    ['window-seat', 'window-seat.kept-asks', { other: 'Something else' }, ['kept']],
    // Start your own: a part without an id, or without a length above 0.
    ['start-own', 'start-own.parts', [{ partId: 'P1', lengthIn: 22 }, { lengthIn: 22 }], ['[1].partId']],
    ['start-own', 'start-own.parts', [{ partId: 'P1', lengthIn: 0 }, { partId: ' ', lengthIn: -1 }], ['[0].lengthIn', '[1].partId', '[1].lengthIn']],
    ['start-own', 'start-own.parts', [null], ['[0]']],
    // Playhouse opening: width, straight height and rise present and above 0.
    ['playhouse', 'playhouse.opening', { widthIn: 18, straightHeightIn: 0, riseIn: 9 }, ['straightHeightIn']],
    ['playhouse', 'playhouse.opening', { widthIn: 18, straightHeightIn: 12 }, ['riseIn']],
    ['playhouse', 'playhouse.opening', { widthIn: null, straightHeightIn: null, riseIn: null }, ['widthIn', 'straightHeightIn', 'riseIn']],
  ];
  for (const [tileId, factId, value, missing] of BLOCKS) {
    const label = `${factId} ${JSON.stringify(value)}`;
    const result = admit({ revision: facts(tileId, { [factId]: ok(value) }), inquiryScope: FIXTURES[tileId].scope });
    assert.equal(result.admission.result, ADMISSION_RESULT.BLOCKED, label);
    assert.equal(result.admission.reason, BLOCK_REASON.REQUIRED_FACT_UNSETTLED, label);
    assert.deepEqual(result.admission.blocking,
      [{ factId, owner: OWNER.USER, title: title(factId), condition: 'INVALID_VALUE', fields: missing }], label);
    assert.equal(result.request, null, label);
    const store = storeStub({ status: 'SHOULD_NOT_BE_ASKED' });
    const sent = await inquire(result, store.ask);
    assert.equal(sent.reachedStore, false, label);
    assert.equal(store.calls.length, 0, `${label}: nothing reached Store`);
    assert.deepEqual(sent.blocking.map(b => [b.factId, b.owner]), [[factId, OWNER.USER]], label);
  }

  const ADMITS = [
    // Every knob off, as the page states it: nothing added, nothing missing.
    ['window-seat', 'window-seat.added-knobs', { front: null, xspot: null, screws: null }],
    // Every knob on and complete, in the forms the page emits (typed text for amounts).
    ['window-seat', 'window-seat.added-knobs', {
      front: { board: false },
      xspot: { target: 'C-SEAT', offset: '3 1/2', place: 'center' },
      screws: { gauge: '#8', lengthIn: '1 1/4', finish: 'zinc', qty: '24' },
    }],
    ['window-seat', 'window-seat.kept-asks', { kept: 0 }],
    ['window-seat', 'window-seat.kept-asks', { kept: 5 }],
    ['start-own', 'start-own.parts', [{ partId: 'PART-1', lengthIn: 4790, features: [] }]],
    // No machine envelope: an opening no sheet could hold is complete, and the Store answers it.
    ['playhouse', 'playhouse.opening', { widthIn: 400, straightHeightIn: 400, riseIn: 200 }],
  ];
  for (const [tileId, factId, value] of ADMITS) {
    const label = `${factId} ${JSON.stringify(value)}`;
    const result = admit({ revision: facts(tileId, { [factId]: ok(value) }), inquiryScope: FIXTURES[tileId].scope });
    assert.equal(result.admission.result, ADMISSION_RESULT.ADMITTED, label);
    const store = storeStub({ status: 'REFUSED', withinEnvelope: false });
    const sent = await inquire(result, store.ask);
    assert.equal(sent.reachedStore, true, label);
    assert.equal(store.calls.length, 1, label);
    assert.deepEqual(store.calls[0].facts[factId], value, `${label}: travels exactly as defined`);
  }

  // A STORE-owned fact still travels open, whatever its value.
  const alcove = admit({ revision: facts('alcove', {}), inquiryScope: 'ALCOVE_INSERT_V1' });
  assert.deepEqual(alcove.request.openDemands, ['alcove.hardware']);

  // Only the facts whose fields the live page emits carry a form. Start your own's material carries the four fields
  // its bench carries: species as stated on Intent, form and nominal size from its "2×4 stud" control.
  const formed = Object.entries(ADMISSION_PROFILES).flatMap(([, p]) => Object.values(p.scopes))
    .flatMap(s => s.requires).filter(r => r.form).map(r => r.id);
  assert.deepEqual([...new Set(formed)].sort(),
    ['alcove.board-requirements', 'alcove.component-programs', 'alcove.material', 'alcove.spot-demand',
      'outdoor.cut-packages', 'playhouse.opening', 'playhouse.sheet', 'start-own.datum', 'start-own.material', 'start-own.parts', 'start-own.spot-demand',
      'window-seat.added-knobs', 'window-seat.boards', 'window-seat.kept-asks']);
  const stated = { species: 'cedar', form: 'board', nominalT: 2, nominalW: 4 };
  const material = admit({ revision: facts('start-own', { 'start-own.material': ok(stated) }), inquiryScope: 'USER_DEFINED_BOARD_V1' });
  assert.equal(material.admission.result, ADMISSION_RESULT.ADMITTED);
  assert.deepEqual(material.request.facts['start-own.material'], stated, 'travels exactly as stated');
  for (const [value, missing] of [
    [{ origin: 'STORE_ZERO', stockClass: 'board' }, ['species', 'form', 'nominalT', 'nominalW']],
    [{ form: 'board', nominalT: 2, nominalW: 4 }, ['species']],
    [{ species: 'spf', form: 'board', nominalT: 2 }, ['nominalW']],
    [{ species: ' ', form: ' ', nominalT: 0, nominalW: 4 }, ['species', 'form', 'nominalT']],
  ]) {
    const blocked = admit({ revision: facts('start-own', { 'start-own.material': ok(value) }), inquiryScope: 'USER_DEFINED_BOARD_V1' });
    assert.equal(blocked.admission.result, ADMISSION_RESULT.BLOCKED, JSON.stringify(value));
    assert.deepEqual(blocked.admission.blocking,
      [{ factId: 'start-own.material', owner: OWNER.USER, title: 'Material demand', condition: 'INVALID_VALUE', fields: missing }]);
    const store = storeStub({ status: 'SHOULD_NOT_BE_ASKED' });
    assert.equal((await inquire(blocked, store.ask)).reachedStore, false);
    assert.equal(store.calls.length, 0, 'a material missing a stated field never reaches the Store');
  }
});

// Playhouse's sheet, as its page emits it: the fixed sheet's thickness, length and width ({thicknessIn, lengthIn,
// widthIn}). A missing one or one not above 0 blocks before Store with owner PROJECT and the field names. No upper
// bound: a sheet no machine could cut is complete, reaches Store, and the Store refuses it.
test('case 4, Playhouse: the sheet has a thickness, length and width above 0', async () => {
  const SCOPE = 'SHEET_PACKAGE_V1';
  const base = FIXTURES.playhouse.facts;
  const SHEET = { thicknessIn: 0.5, lengthIn: 96, widthIn: 48 };
  const without = key => (({ [key]: _, ...rest }) => rest)(SHEET);
  const sheet = value => revision('playhouse', 'playhouse-sheet', { ...base, 'playhouse.sheet': ok(value) });
  const BLOCKS = [
    [without('thicknessIn'), ['thicknessIn']],
    [without('lengthIn'), ['lengthIn']],
    [without('widthIn'), ['widthIn']],
    [{ ...SHEET, thicknessIn: 0 }, ['thicknessIn']],
    [{ ...SHEET, lengthIn: 0 }, ['lengthIn']],
    [{ ...SHEET, widthIn: 0 }, ['widthIn']],
    [{ ...SHEET, thicknessIn: -0.5 }, ['thicknessIn']],
    [{ ...SHEET, lengthIn: '96' }, ['lengthIn']],
    [{ ...SHEET, widthIn: NaN }, ['widthIn']],
    [{ ...SHEET, thicknessIn: null }, ['thicknessIn']],
    [{ thicknessIn: 0, lengthIn: 0, widthIn: 0 }, ['thicknessIn', 'lengthIn', 'widthIn']],
    // A nonempty object is no longer a sheet.
    [{ material: 'plywood' }, ['thicknessIn', 'lengthIn', 'widthIn']],
  ];
  for (const [value, missing] of BLOCKS) {
    const label = JSON.stringify(value);
    const result = admit({ revision: sheet(value), inquiryScope: SCOPE });
    assert.equal(result.admission.result, ADMISSION_RESULT.BLOCKED, label);
    assert.equal(result.admission.reason, BLOCK_REASON.REQUIRED_FACT_UNSETTLED, label);
    assert.deepEqual(result.admission.blocking, [{ factId: 'playhouse.sheet', owner: OWNER.PROJECT,
      title: 'Real sheet dimensions', condition: 'INVALID_VALUE', fields: missing }], label);
    assert.equal(result.request, null, label);
    const store = storeStub({ status: 'SHOULD_NOT_BE_ASKED' });
    assert.equal((await inquire(result, store.ask)).reachedStore, false, label);
    assert.equal(store.calls.length, 0, `${label}: nothing reached Store`);
  }

  // The page's sheet, and a sheet past any machine envelope: both admitted, both reach Store exactly as defined.
  for (const value of [SHEET, { thicknessIn: 4, lengthIn: 400, widthIn: 400 }]) {
    const label = JSON.stringify(value);
    const result = admit({ revision: sheet(value), inquiryScope: SCOPE });
    assert.equal(result.admission.result, ADMISSION_RESULT.ADMITTED, label);
    assert.equal(result.request.profileVersion, '0.2', label);
    const store = storeStub({ status: 'REFUSED', withinEnvelope: false });
    assert.equal((await inquire(result, store.ask)).reachedStore, true, label);
    assert.deepEqual(store.calls[0].facts['playhouse.sheet'], value, `${label}: travels exactly as defined`);
  }
});

// Window Seat's boards, board by board, as its page emits them ({id, len, w}). A board without an id, or without a
// length and width above 0, blocks before Store with owner PROJECT and the field paths. Every board real, it still
// reaches Store, past any envelope.
test('case 4, Window Seat: every board has an id and a length and width above 0', async () => {
  const SCOPE = 'WINDOW_SEAT_COMMITTED';
  const base = FIXTURES['window-seat'].facts;
  const B1 = { id: 'C-SEAT-1', len: 55, w: 7.25 };
  const B2 = { id: 'L-TOP-1', len: 24, w: 7.25 };
  const without = (item, key) => (({ [key]: _, ...rest }) => rest)(item);
  const boards = value => revision('window-seat', 'window-seat-boards', { ...base, 'window-seat.boards': { value, status: STATUS.DERIVED } });
  const BLOCKS = [
    [[B1, { ...B2, id: '' }], ['[1].id']],
    [[B1, { ...B2, id: '  ' }], ['[1].id']],
    [[without(B1, 'id'), B2], ['[0].id']],
    [[B1, { ...B2, id: 7 }], ['[1].id']],
    [[{ ...B1, len: 0 }, B2], ['[0].len']],
    [[B1, { ...B2, w: 0 }], ['[1].w']],
    [[{ ...B1, len: -1, w: -7.25 }, B2], ['[0].len', '[0].w']],
    [[B1, without(B2, 'len')], ['[1].len']],
    [[B1, { ...B2, w: '7.25' }], ['[1].w']],
    [[B1, { ...B2, len: NaN }], ['[1].len']],
    [[{ id: '', len: 0, w: 0 }], ['[0].id', '[0].len', '[0].w']],
    [[B1, null], ['[1]']],
  ];
  for (const [value, missing] of BLOCKS) {
    const label = JSON.stringify(value);
    const result = admit({ revision: boards(value), inquiryScope: SCOPE });
    assert.equal(result.admission.result, ADMISSION_RESULT.BLOCKED, label);
    assert.equal(result.admission.reason, BLOCK_REASON.REQUIRED_FACT_UNSETTLED, label);
    assert.deepEqual(result.admission.blocking, [{ factId: 'window-seat.boards', owner: OWNER.PROJECT,
      title: 'Every defined board with real length and width', condition: 'INVALID_VALUE', fields: missing }], label);
    assert.equal(result.request, null, label);
    const store = storeStub({ status: 'SHOULD_NOT_BE_ASKED' });
    assert.equal((await inquire(result, store.ask)).reachedStore, false, label);
    assert.equal(store.calls.length, 0, `${label}: nothing reached Store`);
  }

  for (const value of [[B1], [B1, B2], [{ id: 'C-SEAT-1', len: 900, w: 60 }]]) {
    const label = JSON.stringify(value);
    const result = admit({ revision: boards(value), inquiryScope: SCOPE });
    assert.equal(result.admission.result, ADMISSION_RESULT.ADMITTED, label);
    const store = storeStub({ status: 'REFUSED', withinEnvelope: false });
    assert.equal((await inquire(result, store.ask)).reachedStore, true, label);
    assert.deepEqual(store.calls[0].facts['window-seat.boards'], value, `${label}: travels exactly as defined`);
  }
});

// Start your own's datum, saw angle and spot demand, field by field, as the page emits them. A blank datum field or a
// missing or non-finite saw angle blocks with owner RULE; a spot operation without a spot demand that says required,
// its mode and a count above 0 blocks with owner USER. With spotting off, no spot is asked for.
test('case 4, Start your own: datum fields, a finite saw angle and the spot demand a spot operation needs', async () => {
  const SCOPE = 'USER_DEFINED_BOARD_V1';
  const base = FIXTURES['start-own'].facts;
  const datum = base['start-own.datum'].value;
  const SPOT_OPS = ['MITER_LIMITED', 'SPOT_ON_LOCATION'];
  const SPOT = { required: true, mode: 'SPOT_ON_LOCATION', countPerPart: 1, locationRule: 'CENTERED_ON_PART', totalCount: 2 };
  const revisionWith = overrides => revision('start-own', 'start-own-datum', { ...base, ...overrides });
  const BLOCKS = [
    ...['cutPlane', 'endIdentity', 'endRelation', 'lengthDatum', 'datumCMethod'].flatMap(field => [
      [{ 'start-own.datum': ok({ ...datum, [field]: '' }) }, 'start-own.datum', OWNER.RULE, [field]],
      [{ 'start-own.datum': ok({ ...datum, [field]: null }) }, 'start-own.datum', OWNER.RULE, [field]],
    ]),
    [{ 'start-own.datum': ok({ ...datum, cutPlane: ' ', datumCMethod: '' }) }, 'start-own.datum', OWNER.RULE, ['cutPlane', 'datumCMethod']],
    [{ 'start-own.datum': ok((({ sawAngleDeg, ...rest }) => rest)(datum)) }, 'start-own.datum', OWNER.RULE, ['sawAngleDeg']],
    [{ 'start-own.datum': ok({ ...datum, sawAngleDeg: NaN }) }, 'start-own.datum', OWNER.RULE, ['sawAngleDeg']],
    [{ 'start-own.datum': ok({ ...datum, sawAngleDeg: Infinity }) }, 'start-own.datum', OWNER.RULE, ['sawAngleDeg']],
    [{ 'start-own.datum': ok({ ...datum, sawAngleDeg: '30' }) }, 'start-own.datum', OWNER.RULE, ['sawAngleDeg']],
    [{ 'start-own.datum': ok({ ...datum, sawAngleDeg: undefined }) }, 'start-own.datum', OWNER.RULE, ['sawAngleDeg']],
    [{ 'start-own.operations': ok(SPOT_OPS), 'start-own.spot-demand': ok({ required: false }) },
      'start-own.spot-demand', OWNER.USER, ['required', 'mode', 'totalCount']],
    [{ 'start-own.operations': ok(SPOT_OPS), 'start-own.spot-demand': ok({ ...SPOT, totalCount: 0 }) }, 'start-own.spot-demand', OWNER.USER, ['totalCount']],
    [{ 'start-own.operations': ok(SPOT_OPS), 'start-own.spot-demand': ok({ ...SPOT, mode: '' }) }, 'start-own.spot-demand', OWNER.USER, ['mode']],
    // The mode is exactly SPOT_ON_LOCATION; any other text blocks.
    ...['DRILL', 'spot_on_location', 'SPOT_ON_LOCATION ', 'CENTERED_ON_PART'].map(mode =>
      [{ 'start-own.operations': ok(SPOT_OPS), 'start-own.spot-demand': ok({ ...SPOT, mode }) }, 'start-own.spot-demand', OWNER.USER, ['mode']]),
    [{ 'start-own.operations': ok(SPOT_OPS), 'start-own.spot-demand': ok((({ mode, ...rest }) => rest)(SPOT)) }, 'start-own.spot-demand', OWNER.USER, ['mode']],
    [{ 'start-own.operations': ok(SPOT_OPS), 'start-own.spot-demand': ok({ ...SPOT, required: 'yes' }) }, 'start-own.spot-demand', OWNER.USER, ['required']],
  ];
  for (const [overrides, factId, owner, missing] of BLOCKS) {
    const label = JSON.stringify(overrides);
    const result = admit({ revision: revisionWith(overrides), inquiryScope: SCOPE });
    assert.equal(result.admission.result, ADMISSION_RESULT.BLOCKED, label);
    assert.deepEqual(result.admission.blocking,
      [{ factId, owner, title: factId === 'start-own.datum' ? 'Cut and datum meaning' : 'Center spot demand, on or off',
        condition: 'INVALID_VALUE', fields: missing }], label);
    const store = storeStub({ status: 'SHOULD_NOT_BE_ASKED' });
    assert.equal((await inquire(result, store.ask)).reachedStore, false, label);
    assert.equal(store.calls.length, 0, `${label}: nothing reached Store`);
  }

  const ADMITS = [
    // Spotting off, as the page states it: no spot is asked for.
    {},
    { 'start-own.datum': ok({ ...datum, sawAngleDeg: 26.387799961243 }) },
    // Spotting on and complete.
    { 'start-own.operations': ok(SPOT_OPS), 'start-own.spot-demand': ok(SPOT) },
    // A spot demand stated without the spot operation is not asked to be complete; it is sent as stated.
    { 'start-own.spot-demand': ok({ required: false, note: 'off' }) },
  ];
  for (const overrides of ADMITS) {
    const label = JSON.stringify(overrides);
    const result = admit({ revision: revisionWith(overrides), inquiryScope: SCOPE });
    assert.equal(result.admission.result, ADMISSION_RESULT.ADMITTED, label);
    const store = storeStub({ status: 'REFUSED', withinEnvelope: false });
    assert.equal((await inquire(result, store.ask)).reachedStore, true, label);
    assert.deepEqual(store.calls[0].facts['start-own.spot-demand'], (overrides['start-own.spot-demand'] ?? base['start-own.spot-demand']).value, label);
  }
});

// Alcove's material, parents, component programs and spot demand, field by field, as its page emits them. A blank or
// zero material field, a missing parent, a parent without operations, or a program without its ids or a length and
// width above 0 blocks with owner PROJECT; spotting on without mode SPOT_ON_LOCATION, a tool above 0 and a list of
// features blocks with owner USER. With spotting off, nothing more is asked of the spot demand.
test('case 4, Alcove: material fields, both parents and real program sizes, and the spot demand spotting on needs', async () => {
  const SCOPE = 'ALCOVE_INSERT_V1';
  const base = FIXTURES.alcove.facts;
  const material = base['alcove.material'].value;
  const parents = base['alcove.board-requirements'].value;
  const programs = base['alcove.component-programs'].value;
  const SPOT_ON = { enabled: true, mode: 'SPOT_ON_LOCATION', toolDiameterIn: 0.1875, source: 'SHELF_ELEVATIONS',
    features: [{ featureId: 'ALCOVE-UPRIGHT-01-SPOT-01', kind: 'SPOT_ON_LOCATION', targetComponentId: 'U1', xIn: 12 }] };
  const TITLE = {
    'alcove.material': 'Material demand',
    'alcove.board-requirements': 'Upright and shelf parent responsibilities',
    'alcove.component-programs': 'Component programs for every parent',
    'alcove.spot-demand': 'Pilot spot demand, on or off',
  };
  const without = (item, key) => (({ [key]: _, ...rest }) => rest)(item);
  const revisionWith = overrides => revision('alcove', 'alcove-fields', { ...base, ...overrides });
  const P = OWNER.PROJECT;
  const BLOCKS = [
    // Material: species and form are nonempty text; nominalT and nominalW are above 0.
    ...['species', 'form'].flatMap(field => [
      [{ 'alcove.material': ok({ ...material, [field]: '' }) }, 'alcove.material', P, [field]],
      [{ 'alcove.material': ok({ ...material, [field]: '  ' }) }, 'alcove.material', P, [field]],
      [{ 'alcove.material': ok(without(material, field)) }, 'alcove.material', P, [field]],
    ]),
    ...['nominalT', 'nominalW'].flatMap(field => [
      [{ 'alcove.material': ok({ ...material, [field]: 0 }) }, 'alcove.material', P, [field]],
      [{ 'alcove.material': ok({ ...material, [field]: -1 }) }, 'alcove.material', P, [field]],
      [{ 'alcove.material': ok({ ...material, [field]: '1' }) }, 'alcove.material', P, [field]],
      [{ 'alcove.material': ok(without(material, field)) }, 'alcove.material', P, [field]],
    ]),
    [{ 'alcove.material': ok({ grade: 'select' }) }, 'alcove.material', P, ['species', 'form', 'nominalT', 'nominalW']],
    // Parents: both are there, each with a nonempty requiredOps.
    [{ 'alcove.board-requirements': ok([parents[0]]) }, 'alcove.board-requirements', P, ['[requirementId=ALCOVE-SHELF-PARENTS]']],
    [{ 'alcove.board-requirements': ok([parents[1]]) }, 'alcove.board-requirements', P, ['[requirementId=ALCOVE-UPRIGHT-PARENTS]']],
    [{ 'alcove.board-requirements': ok([{ requirementId: 'OTHER', requiredOps: ['CROSSCUT'] }]) }, 'alcove.board-requirements', P,
      ['[requirementId=ALCOVE-UPRIGHT-PARENTS]', '[requirementId=ALCOVE-SHELF-PARENTS]']],
    [{ 'alcove.board-requirements': ok([parents[0], { ...parents[1], requiredOps: [] }]) }, 'alcove.board-requirements', P, ['[1].requiredOps']],
    [{ 'alcove.board-requirements': ok([without(parents[0], 'requiredOps'), parents[1]]) }, 'alcove.board-requirements', P, ['[0].requiredOps']],
    // Programs: both parents have one; each has its ids and a length and width above 0.
    [{ 'alcove.component-programs': ok([programs[0]]) }, 'alcove.component-programs', P, ['[requirementId=ALCOVE-SHELF-PARENTS]']],
    [{ 'alcove.component-programs': ok([programs[1]]) }, 'alcove.component-programs', P, ['[requirementId=ALCOVE-UPRIGHT-PARENTS]']],
    ...['finishedLengthIn', 'finishedWidthIn'].flatMap(field => [
      [{ 'alcove.component-programs': ok([programs[0], { ...programs[1], [field]: 0 }]) }, 'alcove.component-programs', P, [`[1].${field}`]],
      [{ 'alcove.component-programs': ok([{ ...programs[0], [field]: -5.5 }, programs[1]]) }, 'alcove.component-programs', P, [`[0].${field}`]],
      [{ 'alcove.component-programs': ok([programs[0], without(programs[1], field)]) }, 'alcove.component-programs', P, [`[1].${field}`]],
    ]),
    [{ 'alcove.component-programs': ok([{ ...programs[0], componentId: '' }, programs[1]]) }, 'alcove.component-programs', P, ['[0].componentId']],
    [{ 'alcove.component-programs': ok([...programs, { ...programs[1], componentId: 'S2', requirementId: ' ' }]) },
      'alcove.component-programs', P, ['[2].requirementId']],
    // Spot demand: on or off is a boolean; on asks for mode exactly SPOT_ON_LOCATION, a tool above 0 and a list.
    [{ 'alcove.spot-demand': ok({ ...SPOT_ON, enabled: 'yes' }) }, 'alcove.spot-demand', OWNER.USER, ['enabled']],
    [{ 'alcove.spot-demand': ok(without(SPOT_ON, 'enabled')) }, 'alcove.spot-demand', OWNER.USER, ['enabled']],
    ...['DRILL', 'spot_on_location', ' SPOT_ON_LOCATION', ''].map(mode =>
      [{ 'alcove.spot-demand': ok({ ...SPOT_ON, mode }) }, 'alcove.spot-demand', OWNER.USER, ['mode']]),
    [{ 'alcove.spot-demand': ok(without(SPOT_ON, 'mode')) }, 'alcove.spot-demand', OWNER.USER, ['mode']],
    [{ 'alcove.spot-demand': ok({ ...SPOT_ON, toolDiameterIn: 0 }) }, 'alcove.spot-demand', OWNER.USER, ['toolDiameterIn']],
    [{ 'alcove.spot-demand': ok(without(SPOT_ON, 'toolDiameterIn')) }, 'alcove.spot-demand', OWNER.USER, ['toolDiameterIn']],
    [{ 'alcove.spot-demand': ok({ ...SPOT_ON, features: null }) }, 'alcove.spot-demand', OWNER.USER, ['features']],
    [{ 'alcove.spot-demand': ok(without(SPOT_ON, 'features')) }, 'alcove.spot-demand', OWNER.USER, ['features']],
    [{ 'alcove.spot-demand': ok({ enabled: true }) }, 'alcove.spot-demand', OWNER.USER, ['mode', 'toolDiameterIn', 'features']],
  ];
  for (const [overrides, factId, owner, missing] of BLOCKS) {
    const label = JSON.stringify(overrides);
    const result = admit({ revision: revisionWith(overrides), inquiryScope: SCOPE });
    assert.equal(result.admission.result, ADMISSION_RESULT.BLOCKED, label);
    assert.deepEqual(result.admission.blocking,
      [{ factId, owner, title: TITLE[factId], condition: 'INVALID_VALUE', fields: missing }], label);
    const store = storeStub({ status: 'SHOULD_NOT_BE_ASKED' });
    assert.equal((await inquire(result, store.ask)).reachedStore, false, label);
    assert.equal(store.calls.length, 0, `${label}: nothing reached Store`);
  }

  const ADMITS = [
    // The page's complete revision, spotting off: the spot demand is sent as stated and no spot is invented.
    {},
    // Spotting off asks nothing more of it, whatever else it carries.
    { 'alcove.spot-demand': ok({ enabled: false }) },
    { 'alcove.spot-demand': ok({ enabled: false, mode: 'NONE', toolDiameterIn: 0, features: null }) },
    // Spotting on and complete; an empty feature list is a list.
    { 'alcove.spot-demand': ok(SPOT_ON) },
    { 'alcove.spot-demand': ok({ ...SPOT_ON, features: [] }) },
    // More programs per parent, in any order, and extra material fields the page states.
    { 'alcove.component-programs': ok([programs[1], ...programs, { ...programs[1], componentId: 'S2' }]) },
    { 'alcove.material': ok({ ...material, grade: 'select', nominalT: 0.75 }) },
  ];
  for (const overrides of ADMITS) {
    const label = JSON.stringify(overrides);
    const result = admit({ revision: revisionWith(overrides), inquiryScope: SCOPE });
    assert.equal(result.admission.result, ADMISSION_RESULT.ADMITTED, label);
    assert.deepEqual(result.request.openDemands, ['alcove.hardware'], label);
    const store = storeStub({ status: 'REFUSED', withinEnvelope: false });
    assert.equal((await inquire(result, store.ask)).reachedStore, true, label);
    assert.deepEqual(store.calls[0].facts['alcove.spot-demand'], (overrides['alcove.spot-demand'] ?? base['alcove.spot-demand']).value, label);
  }
});

// Outdoor's cut packages, package by package and part by part, as its page emits them ({packageId, parts: [{partId,
// lengthIn}]}), in both of its scopes. A package without an id, or a part without an id or a length above 0, blocks
// before Store with owner PROJECT and the field paths. Every package real, it still reaches Store, past any envelope.
// The scopes stay apart: OUTDOOR_OPTIONS asks for the packages only; OUTDOOR_COMMITTED still asks for the plan and the
// bench work as well.
test('case 4, Outdoor: every package has an id and every part an id and a length above 0, in both scopes', async () => {
  const base = FIXTURES.outdoor.facts;
  const wood = { species: 'cedar', form: 'board', nominalT: 2, nominalW: 4 };
  const P1 = { packageId: 'CEDAR|TOP', material: wood, endCut: { angleDeg: 0 }, parts: [{ partId: 'TOP-01', lengthIn: 72 }, { partId: 'TOP-02', lengthIn: 72 }] };
  const P2 = { packageId: 'CEDAR|LEG|A30', material: wood, parts: [{ partId: 'LEG-01', lengthIn: 30, spots: [{ xIn: 4 }] }] };
  const without = (item, key) => (({ [key]: _, ...rest }) => rest)(item);
  const withPart = (pkg, i, part) => ({ ...pkg, parts: pkg.parts.map((x, j) => (j === i ? part : x)) });
  const BLOCKS = [
    [[P1, { ...P2, packageId: '' }], ['[1].packageId']],
    [[P1, { ...P2, packageId: '  ' }], ['[1].packageId']],
    [[without(P1, 'packageId'), P2], ['[0].packageId']],
    [[P1, { ...P2, packageId: 7 }], ['[1].packageId']],
    [[withPart(P1, 1, { partId: 'TOP-02', lengthIn: 0 }), P2], ['[0].parts[1].lengthIn']],
    [[P1, withPart(P2, 0, { partId: 'LEG-01', lengthIn: -30 })], ['[1].parts[0].lengthIn']],
    [[P1, withPart(P2, 0, { partId: 'LEG-01' })], ['[1].parts[0].lengthIn']],
    [[P1, withPart(P2, 0, { partId: 'LEG-01', lengthIn: '30' })], ['[1].parts[0].lengthIn']],
    [[P1, withPart(P2, 0, { partId: 'LEG-01', lengthIn: NaN })], ['[1].parts[0].lengthIn']],
    [[withPart(P1, 0, { partId: '', lengthIn: 72 }), P2], ['[0].parts[0].partId']],
    [[withPart(P1, 0, { lengthIn: 72 }), P2], ['[0].parts[0].partId']],
    [[withPart(P1, 0, { partId: '', lengthIn: 0 }), P2], ['[0].parts[0].partId', '[0].parts[0].lengthIn']],
    [[P1, without(P2, 'parts')], ['[1].parts']],
    [[P1, without(P2, 'material')], ['[1].material']],
    [[P1, { ...P2, material: { species: 'cedar' } }], ['[1].material.form', '[1].material.nominalT', '[1].material.nominalW']],
    [[P1, { ...P2, parts: [] }], ['[1].parts']],
    [[P1, { ...P2, parts: null }], ['[1].parts', '[1].parts']],
    [[P1, withPart(P2, 0, null)], ['[1].parts[0]']],
    [[P1, null], ['[1]']],
  ];
  for (const scope of ['OUTDOOR_OPTIONS', 'OUTDOOR_COMMITTED']) {
    // Each scope's revision carries only what the page sends for it: the options revision has only the packages.
    const packages = value => revision('outdoor', `outdoor-packages-${scope}`, scope === 'OUTDOOR_OPTIONS'
      ? { 'outdoor.cut-packages': { value, status: STATUS.DERIVED } }
      : { ...base, 'outdoor.cut-packages': { value, status: STATUS.DERIVED } });
    for (const [value, missing] of BLOCKS) {
      const label = `${scope} ${JSON.stringify(value)}`;
      const result = admit({ revision: packages(value), inquiryScope: scope });
      assert.equal(result.admission.result, ADMISSION_RESULT.BLOCKED, label);
      assert.equal(result.admission.reason, BLOCK_REASON.REQUIRED_FACT_UNSETTLED, label);
      assert.deepEqual(result.admission.blocking, [{ factId: 'outdoor.cut-packages', owner: OWNER.PROJECT,
        title: 'Requested work with real part values', condition: 'INVALID_VALUE', fields: missing }], label);
      assert.equal(result.request, null, label);
      const store = storeStub({ status: 'SHOULD_NOT_BE_ASKED' });
      assert.equal((await inquire(result, store.ask)).reachedStore, false, label);
      assert.equal(store.calls.length, 0, `${label}: nothing reached Store`);
    }
    for (const value of [[P1], [P1, P2], [{ packageId: 'CEDAR|TOP', material: wood, parts: [{ partId: 'TOP-01', lengthIn: 2000 }] }]]) {
      const label = `${scope} ${JSON.stringify(value)}`;
      const result = admit({ revision: packages(value), inquiryScope: scope });
      assert.equal(result.admission.result, ADMISSION_RESULT.ADMITTED, label);
      assert.equal(result.request.profileVersion, '0.4', label);
      const store = storeStub({ status: 'REFUSED', withinEnvelope: false });
      assert.equal((await inquire(result, store.ask)).reachedStore, true, label);
      assert.deepEqual(store.calls[0].facts['outdoor.cut-packages'], value, `${label}: travels exactly as defined`);
      assert.deepEqual(Object.keys(store.calls[0].facts).sort(), scope === 'OUTDOOR_OPTIONS'
        ? ['outdoor.cut-packages'] : ['outdoor.bench-work', 'outdoor.cut-packages', 'outdoor.plan'], `${label}: only its scope's facts`);
    }
  }

  // Not collapsed: real packages alone admit an options inquiry, never a committed one.
  const optionsOnly = revision('outdoor', 'outdoor-options-only', { 'outdoor.cut-packages': { value: [P1], status: STATUS.DERIVED } });
  assert.equal(admit({ revision: optionsOnly, inquiryScope: 'OUTDOOR_OPTIONS' }).admission.result, ADMISSION_RESULT.ADMITTED);
  const committed = admit({ revision: optionsOnly, inquiryScope: 'OUTDOOR_COMMITTED' });
  assert.equal(committed.admission.result, ADMISSION_RESULT.BLOCKED);
  assert.deepEqual(committed.admission.blocking.map(b => b.factId), ['outdoor.plan', 'outdoor.bench-work']);
});

test('the old path is still there and still runs after admit()', () => {
  const oldPath = fs.readFileSync(new URL('../../public-build/stb-public-admission.mjs', import.meta.url), 'utf8');
  const client = fs.readFileSync(new URL('../../public-build/stb-store-client.js', import.meta.url), 'utf8');
  assert.match(oldPath, /export function admitPublicStoreRequest\(/);
  assert.match(client, /admission\.admitPublicStoreRequest\(/);
});

// Case 5: one rule. A Store answer authorizes nothing unless it is the fresh answer for this exact revision and
// this inquiry scope. Each tile's own scope; Outdoor's other declared scope (OUTDOOR_OPTIONS) is the real one a
// committed admission must not take an answer from. `ask` stands in for the Store and counts what reached it.
test('case 5: only the fresh answer for this exact revision and scope opens Your call; mismatches and refusals do not', async () => {
  const OTHER_SCOPE = { 'start-own': 'ALCOVE_INSERT_V1', alcove: 'USER_DEFINED_BOARD_V1', 'window-seat': 'OUTDOOR_COMMITTED', outdoor: 'OUTDOOR_OPTIONS', playhouse: 'WINDOW_SEAT_COMMITTED' };
  const opensCall = (admission, freshAnswer) => availableSteps({ trail, admission, freshAnswer }).includes(YOUR_CALL);
  for (const tileId of TILE_IDS) {
    const fx = FIXTURES[tileId];
    const r1 = revision(tileId, `${tileId}-r1`, fx.facts);
    const admission = admit({ revision: r1, inquiryScope: fx.scope });
    assert.equal(admission.admission.result, ADMISSION_RESULT.ADMITTED, tileId);
    const store = storeStub({ status: 'BUDGETARY_ESTIMATE' });
    const { answer } = await inquire(admission, store.ask);

    // inquire() stamps the answer with the revision and the scope it answers.
    assert.equal(answer.authority, ANSWER_AUTHORITY.CURRENT, tileId);
    assert.equal(answer.definitionRevisionId, `${tileId}-r1`, tileId);
    assert.equal(answer.inquiryScope, fx.scope, tileId);

    // Fresh, in the envelope: Your call opens. The later steps stay with the terms flow.
    assert.equal(isCurrentAnswer({ admission, answer }), true, tileId);
    assert.deepEqual([...availableSteps({ trail, admission, freshAnswer: { ...answer, withinEnvelope: true } })],
      [INTENT, BENCH, STORE_ANSWERS, YOUR_CALL], `${tileId}: fresh in-envelope answer opens Your call`);

    // A refusal leaves Your call (and so steps 4–6) inert. The Store answers stays usable: the refusal is the result.
    assert.deepEqual([...availableSteps({ trail, admission, freshAnswer: { ...answer, withinEnvelope: false } })],
      [INTENT, BENCH, STORE_ANSWERS], `${tileId}: refusal`);

    // A saved answer comes back as history. Reopening does not make it current, even for the current revision.
    const rec = { ...record(tileId, r1), storeAnswers: [{ ...answer, withinEnvelope: true }] };
    const reopened = reopenJobRecord({ trail, record: rec });
    const saved = reopened.history.storeAnswers[0];
    assert.equal(saved.authority, ANSWER_AUTHORITY.HISTORY, tileId);
    assert.equal(saved.definitionRevisionId, reopened.current.definitionRevisionId, `${tileId}: saved answer names the current revision`);
    assert.equal(saved.inquiryScope, reopened.current.inquiryScope, `${tileId}: and the current scope`);
    assert.equal(reopened.current.storeAnswer, null, tileId);
    assert.ok(!reopened.current.usableSteps.includes(YOUR_CALL), `${tileId}: reopened Your call inert`);
    assert.equal(isCurrentAnswer({ admission: reopened.current.admission, answer: saved }), false, tileId);
    assert.equal(opensCall(reopened.current.admission, saved), false, `${tileId}: history handed back as fresh`);

    // An answer for a different revision does not open Your call: same facts, another revision id.
    const other = admit({ revision: revision(tileId, `${tileId}-r1-other`, fx.facts), inquiryScope: fx.scope });
    assert.equal(other.admission.result, ADMISSION_RESULT.ADMITTED, tileId);
    assert.equal(isCurrentAnswer({ admission: other, answer }), false, tileId);
    assert.equal(opensCall(other, { ...answer, withinEnvelope: true }), false, `${tileId}: other revision`);

    // An answer for a different scope does not open Your call, nor does one that names no scope.
    assert.equal(opensCall(admission, { ...answer, inquiryScope: OTHER_SCOPE[tileId], withinEnvelope: true }), false, `${tileId}: other scope`);
    const { inquiryScope: _scope, ...unscoped } = answer;
    assert.equal(opensCall(admission, { ...unscoped, withinEnvelope: true }), false, `${tileId}: answer without a scope`);

    // A changed definition asks again; the previous answer does not carry forward.
    const changedFacts = { ...fx.facts, ...fx.pastEnvelope };
    const r2 = admit({ revision: revision(tileId, `${tileId}-r2`, changedFacts), inquiryScope: fx.scope });
    assert.equal(r2.admission.result, ADMISSION_RESULT.ADMITTED, tileId);
    assert.equal(opensCall(r2, { ...answer, withinEnvelope: true }), false, `${tileId}: r1 answer carried to r2`);
    assert.deepEqual([...availableSteps({ trail, admission: r2, freshAnswer: null })], [INTENT, BENCH, STORE_ANSWERS], tileId);
    const asked = await inquire(r2, store.ask);
    assert.equal(store.calls.length, 2, `${tileId}: the changed definition reached the Store again`);
    assert.equal(store.calls[1].definitionRevisionId, `${tileId}-r2`, tileId);
    assert.equal(opensCall(r2, { ...asked.answer, withinEnvelope: true }), true, `${tileId}: r2's own fresh answer`);

    // A blocked revision opens nothing, whatever answer is handed in.
    const { [fx.userFact]: _gone, ...short } = fx.facts;
    const blocked = admit({ revision: revision(tileId, `${tileId}-r1`, short), inquiryScope: fx.scope });
    assert.equal(isCurrentAnswer({ admission: blocked, answer }), false, tileId);
    assert.deepEqual([...availableSteps({ trail, admission: blocked, freshAnswer: { ...answer, withinEnvelope: true } })], [INTENT, BENCH], tileId);
  }

  // Outdoor's two declared scopes, same revision: the OUTDOOR_OPTIONS answer cannot stand in for OUTDOOR_COMMITTED.
  const od = revision('outdoor', 'outdoor-r1', FIXTURES.outdoor.facts);
  const committed = admit({ revision: od, inquiryScope: 'OUTDOOR_COMMITTED' });
  const options = admit({ revision: od, inquiryScope: 'OUTDOOR_OPTIONS' });
  assert.equal(options.admission.result, ADMISSION_RESULT.ADMITTED);
  const { answer: optionsAnswer } = await inquire(options, storeStub({ status: 'BUDGETARY_ESTIMATE' }).ask);
  assert.equal(optionsAnswer.inquiryScope, 'OUTDOOR_OPTIONS');
  assert.equal(optionsAnswer.definitionRevisionId, committed.definitionRevisionId);
  assert.equal(isCurrentAnswer({ admission: committed, answer: optionsAnswer }), false);
  assert.equal(opensCall(committed, { ...optionsAnswer, withinEnvelope: true }), false, 'outdoor: options answer opens no Your call');
});
