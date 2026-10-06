// Start your own has one admission decision, admit(), and its wire material is the admitted material fact.
// Runs the real tile-host admission contract, the real User 1 bridge and the real browser Store client. Only the
// network is replaced: fetch answers the runtime config and records the one wire body it is handed. The old door,
// admitPublicStoreRequest, is reached only through the client's one import of stb-public-admission.mjs; that import
// is routed to a recorder, and a direct sendJob control call proves the recorder is live.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

import { admit, inquire } from '../../public-build/shared/tile-host-admission-contract.mjs';
import { STORE_PIN } from '../../shared/contracts.mjs';

const PUBLIC = new URL('../../public-build/', import.meta.url);
const ENDPOINT = 'http://127.0.0.1:4317/api/store-zero/job';
const SCOPE = 'USER_DEFINED_BOARD_V1';
const source = rel => fs.readFileSync(fileURLToPath(new URL(rel, PUBLIC)), 'utf8');

// One browser window holding the real Store client and the real User 1 bridge.
function browser() {
  const wire = [];
  const oldDoor = [];
  const window = {
    location: { hostname: '127.0.0.1' },
    document: { currentScript: { src: new URL('stb-store-client.js', PUBLIC).href } },
    URL, TextEncoder, AbortSignal, crypto, JSON, Promise, Error, TypeError, Object, Array, Number, String, Math, Set,
    async fetch(url, init) {
      if (String(url).endsWith('/stb-store-runtime.json')) {
        return { ok: true, json: async () => ({ jobEndpoint: ENDPOINT, offeringEndpoint: 'http://127.0.0.1:4317/api/store-zero/offering', storePin: STORE_PIN }) };
      }
      assert.equal(String(url), ENDPOINT);
      const body = JSON.parse(init.body);
      wire.push(body);
      const echo = Object.fromEntries(['protocolVersion', 'requestId', 'attemptId', 'projectId', 'candidateRevisionId',
        'requestType', 'scope', 'demandSignature', 'payloadDigest'].map(key => [key, body[key]]));
      const answer = { ...echo, storePin: STORE_PIN, rawEvaluation: { freshEvaluation: true, evaluationReceipt: {
        requestId: body.requestId, freshnessRule: 'STB-STORE-FRESH-EVALUATION-0.1', authority: { storeRevision: STORE_PIN } } } };
      return { ok: true, json: async () => answer };
    },
  };
  window.window = window;
  vm.createContext(window);
  // The client's one import of the old door is routed to a recorder; nothing else in the client changes.
  window.__oldDoorImport = async specifier => { oldDoor.push(specifier); throw new Error('OLD_DOOR_IMPORTED'); };
  const client = source('stb-store-client.js');
  assert.equal(client.split('import(ADMISSION_URL)').length, 2, 'the client imports the old door once');
  const load = (rel, code) => new vm.Script(code, { filename: rel }).runInContext(window);
  load('stb-store-client.js', client.replace('import(ADMISSION_URL)', 'root.__oldDoorImport(ADMISSION_URL)'));
  load('stb-user-defined-board-runtime-bridge.js', source('stb-user-defined-board-runtime-bridge.js'));
  return { window, wire, oldDoor };
}

// A complete Start your own revision, in the shape the page's startOwnRevision() builds it.
// The material is what the bench carries: the species stated on Intent, and form and nominal size from its "2×4 stud" control.
const MATERIAL = { species: 'cedar', form: 'board', nominalT: 2, nominalW: 4 };
function revision(id = 'SYO-USER1-XBRACE-0.1-v1') {
  const parts = [{ partId: 'XB-1', lengthIn: 16 }, { partId: 'XB-2', lengthIn: 16 }];
  return {
    definitionRevisionId: id,
    tileId: 'start-own',
    facts: {
      'start-own.material': { value: { ...MATERIAL }, status: 'CONFIRMED' },
      'start-own.workpiece-length': { value: 60, status: 'CONFIRMED' },
      'start-own.parts': { value: parts, status: 'CONFIRMED' },
      'start-own.operations': { value: ['CROSSCUT'], status: 'DERIVED' },
      'start-own.datum': { value: { sawAngleDeg: 0, cutPlane: 'miter-face', endIdentity: 'both', endRelation: 'parallel',
        lengthDatum: 'long-long-outer-edge', datumCMethod: 'REFERENCE_CUT' }, status: 'DERIVED' },
      'start-own.spot-demand': { value: { required: false }, status: 'CONFIRMED' },
    },
  };
}
// The Store demand, built only from the admitted request's facts, as the page's startOwnStoreDemandFrom() does.
function demandFrom(request) {
  const f = request.facts;
  const datum = f['start-own.datum'];
  return {
    configurationId: 'SYO-USER1-XBRACE', configurationVersion: '0.1',
    definedWorkpieceLengthIn: f['start-own.workpiece-length'],
    sawAngleDeg: datum.sawAngleDeg, cutPlane: datum.cutPlane, endIdentity: datum.endIdentity,
    endRelation: datum.endRelation, lengthDatum: datum.lengthDatum, datumCMethod: datum.datumCMethod,
    requiredOps: f['start-own.operations'], declaredSawCuts: f['start-own.parts'].length, declaredSpotCount: 0,
    parts: f['start-own.parts'],
  };
}
const ask = window => request => window.STBUserDefinedBoardRuntimeBridge.request(request, demandFrom(request), {});

test('a complete Start your own revision reaches the Store through sendAdmittedJob, never the old door', async () => {
  const { window, wire, oldDoor } = browser();
  const admission = admit({ revision: revision(), inquiryScope: SCOPE });
  assert.equal(admission.admission.result, 'ADMITTED');

  const result = await inquire(admission, ask(window));
  assert.equal(result.reachedStore, true);
  assert.equal(wire.length, 1, 'one request reached the Store');
  assert.deepEqual(oldDoor, [], 'no Start your own inquiry imports admitPublicStoreRequest');

  const sent = wire[0];
  assert.equal(sent.projectId, 'start-own');
  assert.equal(sent.requestType, 'USER_DEFINED_BOARD_V1');
  assert.equal(sent.candidateRevisionId, admission.definitionRevisionId);
  assert.equal(sent.expectedStorePin, STORE_PIN);
  // The material on the wire is the admitted start-own.material fact, the same object, nothing added.
  assert.deepEqual(sent.payload.line.materialDemand, admission.request.facts['start-own.material']);
  assert.deepEqual(sent.payload.line.materialDemand, MATERIAL);
  assert.deepEqual(sent.payload.line.parts, admission.request.facts['start-own.parts']);
  assert.deepEqual(sent.payload.line.requiredOps, admission.request.facts['start-own.operations']);

  // A changed admitted material is what travels: the bridge has no material of its own.
  const other = revision('SYO-USER1-XBRACE-0.1-v2');
  other.facts['start-own.material'].value = { species: 'cedar', form: 'board', nominalT: 2, nominalW: 6 };
  await inquire(admit({ revision: other, inquiryScope: SCOPE }), ask(window));
  assert.deepEqual(wire[1].payload.line.materialDemand, { species: 'cedar', form: 'board', nominalT: 2, nominalW: 6 });
  assert.deepEqual(oldDoor, []);
});

test('a part without an id or a length blocks in admit() before the Store', async () => {
  const { window, wire, oldDoor } = browser();
  for (const [part, field] of [[{ lengthIn: 16 }, '[0].partId'], [{ partId: 'XB-1' }, '[0].lengthIn']]) {
    const blockedRevision = revision('SYO-USER1-XBRACE-0.1-blocked');
    blockedRevision.facts['start-own.parts'].value = [part, { partId: 'XB-2', lengthIn: 16 }];
    const admission = admit({ revision: blockedRevision, inquiryScope: SCOPE });
    assert.equal(admission.admission.result, 'BLOCKED');
    assert.equal(admission.admission.blocking.length, 1);
    assert.equal(admission.admission.blocking[0].factId, 'start-own.parts');
    assert.equal(admission.admission.blocking[0].owner, 'USER');
    assert.ok(admission.admission.blocking[0].fields.includes(field), field);
    assert.equal(admission.request, null);
    const result = await inquire(admission, ask(window));
    assert.equal(result.reachedStore, false);
  }
  assert.equal(wire.length, 0, 'a blocked revision never reaches the Store');
  assert.deepEqual(oldDoor, []);
});

test('a material missing a stated field blocks in admit() before the Store', async () => {
  const { window, wire } = browser();
  for (const [material, missing] of [[{ form: 'board', nominalT: 2, nominalW: 4 }, ['species']], [{ species: 'spf', form: 'board', nominalT: 2 }, ['nominalW']], [{ species: 'spf', nominalT: 2, nominalW: 4 }, ['form']]]) {
    const blockedRevision = revision('SYO-USER1-XBRACE-0.1-material');
    blockedRevision.facts['start-own.material'].value = material;
    const admission = admit({ revision: blockedRevision, inquiryScope: SCOPE });
    assert.equal(admission.admission.result, 'BLOCKED');
    assert.deepEqual(admission.admission.blocking, [{ factId: 'start-own.material', owner: 'USER', title: 'Material demand',
      condition: 'INVALID_VALUE', fields: missing }]);
    assert.equal((await inquire(admission, ask(window))).reachedStore, false);
  }
  assert.equal(wire.length, 0);
});

// The datum's five meaning fields, a finite saw angle, and the spot demand a spot operation needs: each malformed case
// blocks in admit() and never reaches the bridge or the wire. A complete revision, spotting on or off, still does.
test('a blank datum field, a non-finite saw angle or a spot operation without its spot demand blocks before the Store', async () => {
  const { window, wire, oldDoor } = browser();
  const SPOT = { required: true, mode: 'SPOT_ON_LOCATION', countPerPart: 1, locationRule: 'CENTERED_ON_PART',
    acrossWidthRule: 'CENTERED_ON_WIDE_FACE', totalCount: 2 };
  const edit = (id, change) => { const r = revision(id); change(r.facts); return r; };
  const withSpotOp = (f, spot) => { f['start-own.operations'].value = ['CROSSCUT', 'SPOT_ON_LOCATION']; f['start-own.spot-demand'].value = spot; };
  const CASES = [
    ...['cutPlane', 'endIdentity', 'endRelation', 'lengthDatum', 'datumCMethod'].map(field =>
      [edit('datum-' + field, f => { f['start-own.datum'].value[field] = ''; }), 'start-own.datum', 'RULE', [field]]),
    [edit('angle-missing', f => { delete f['start-own.datum'].value.sawAngleDeg; }), 'start-own.datum', 'RULE', ['sawAngleDeg']],
    [edit('angle-nan', f => { f['start-own.datum'].value.sawAngleDeg = NaN; }), 'start-own.datum', 'RULE', ['sawAngleDeg']],
    [edit('angle-infinite', f => { f['start-own.datum'].value.sawAngleDeg = -Infinity; }), 'start-own.datum', 'RULE', ['sawAngleDeg']],
    [edit('spot-off', f => withSpotOp(f, { required: false })), 'start-own.spot-demand', 'USER', ['required', 'mode', 'totalCount']],
    [edit('spot-zero', f => withSpotOp(f, { ...SPOT, totalCount: 0 })), 'start-own.spot-demand', 'USER', ['totalCount']],
    [edit('spot-no-mode', f => withSpotOp(f, { ...SPOT, mode: ' ' })), 'start-own.spot-demand', 'USER', ['mode']],
    // The mode is exactly SPOT_ON_LOCATION; any other text blocks.
    [edit('spot-mode-drill', f => withSpotOp(f, { ...SPOT, mode: 'DRILL' })), 'start-own.spot-demand', 'USER', ['mode']],
    [edit('spot-mode-lowercase', f => withSpotOp(f, { ...SPOT, mode: 'spot_on_location' })), 'start-own.spot-demand', 'USER', ['mode']],
  ];
  for (const [blockedRevision, factId, owner, fields] of CASES) {
    const admission = admit({ revision: blockedRevision, inquiryScope: SCOPE });
    assert.equal(admission.admission.result, 'BLOCKED', blockedRevision.definitionRevisionId);
    assert.deepEqual(admission.admission.blocking.map(({ factId, owner, condition, fields }) => ({ factId, owner, condition, fields })),
      [{ factId, owner, condition: 'INVALID_VALUE', fields }], blockedRevision.definitionRevisionId);
    assert.equal((await inquire(admission, ask(window))).reachedStore, false);
  }
  assert.equal(wire.length, 0, 'no malformed revision reached the Store');

  // Complete, spotting on: admitted, and the spot demand travels.
  const spotOn = edit('spot-on', f => withSpotOp(f, SPOT));
  const on = await inquire(admit({ revision: spotOn, inquiryScope: SCOPE }), request =>
    window.STBUserDefinedBoardRuntimeBridge.request(request, { ...demandFrom(request), declaredSpotCount: SPOT.totalCount }, {}));
  assert.equal(on.reachedStore, true);
  assert.equal(wire[0].payload.line.spotDemand.totalCount, 2);
  // Complete, spotting off: admitted, and no spot is invented.
  const off = await inquire(admit({ revision: revision('spot-off-complete'), inquiryScope: SCOPE }), ask(window));
  assert.equal(off.reachedStore, true);
  assert.equal(wire[1].payload.line.spotDemand, null);
  assert.deepEqual(oldDoor, []);
});

test('the bridge refuses a request admit() did not admit, and a missing admitted material', async () => {
  const { window, wire } = browser();
  const bridge = window.STBUserDefinedBoardRuntimeBridge;
  await assert.rejects(bridge.request({ ...admit({ revision: revision(), inquiryScope: SCOPE }).request, interface: 'other' }, {}, {}),
    /START_OWN_ADMITTED_REQUEST_REQUIRED/);
  assert.throws(() => bridge.payloadFromDemand(demandFrom(admit({ revision: revision(), inquiryScope: SCOPE }).request)),
    /START_OWN_ADMITTED_MATERIAL_REQUIRED/);
  assert.equal(wire.length, 0);
});

test('control: the old-door recorder is live; a direct sendJob call still imports it', async () => {
  const { window, wire, oldDoor } = browser();
  await assert.rejects(window.STBStoreClient.sendJob({
    projectId: 'start-own', requestType: 'USER_DEFINED_BOARD_V1', candidateRevisionId: 'control', payload: {},
  }), /OLD_DOOR_IMPORTED/);
  assert.equal(oldDoor.length, 1);
  assert.match(oldDoor[0], /stb-public-admission\.mjs$/);
  assert.equal(wire.length, 0);
});
