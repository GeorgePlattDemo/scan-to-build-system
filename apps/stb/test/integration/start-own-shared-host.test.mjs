// Start your own on the shared tile host, against the real pinned Store.
// - The host draws Start your own's one nav line from a validated STB-TILE-HOST-0.1 message and the trail contract:
//   the six contract steps, inert steps disabled, exactly one current, and the current step follows the shown page
//   (and, on the Start your own page, its Intent or bench screen).
// - Every Store inquiry is admit() then inquire(): a missing profile fact blocks before the Store and names its owner;
//   a complete revision still reaches the Store, and the Store demand is built only from the admitted request.
// - A Start your own inquiry has one admission decision, admit(): its transport is sendAdmittedJob, it never calls
//   admitPublicStoreRequest, and the material on the wire is the admitted start-own.material fact.
// - The old Start your own shell path is gone: no applyStartOwnNavState, wireStartOwnJourneyNav, its own step gate
//   or labels, no activeJourneyProject 'start-own' branch, and no second Store handoff.
// The rest of Start your own's preserved journey (answer → your call → yard → pickup, decline) is in
// trail-terms.test.mjs.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { withBrowser, openTile } from './helpers.mjs';

const TRAIL_STEPS = ['Intent', 'The bench', 'The Store answers', 'Your call', 'We cut it', 'Pick up & build'];
const read = rel => fs.readFileSync(fileURLToPath(new URL('../../public-build/' + rel, import.meta.url)), 'utf8');

async function until(fn, label, tries = 100) {
  for (let i = 0; i < tries; i++) { const v = await fn(); if (v) return v; await new Promise(r => setTimeout(r, 150)); }
  throw new Error('timed out: ' + label);
}
// The visible nav line, in order: what a person sees.
async function navLine(frame) {
  return frame.$$eval('.recovery-nav button', els => els
    .filter(e => !e.hidden && getComputedStyle(e).display !== 'none')
    .map(e => ({
      label: e.textContent.trim(),
      stage: e.dataset.journeyStage || null,
      inert: e.disabled || e.getAttribute('aria-disabled') === 'true',
      current: e.getAttribute('aria-current') === 'step',
    })));
}
const steps = line => line.filter(b => b.stage);
const currentLabels = async frame => steps(await navLine(frame)).filter(b => b.current).map(b => b.label);
const inertByStage = async frame => Object.fromEntries(steps(await navLine(frame)).map(b => [b.stage, b.inert]));
const shownPage = frame => frame.evaluate(() => [...document.querySelectorAll('.page.on')].pop()?.id);
const startOwnCalls = log => log.filter(e => e.request.projectId === 'start-own' && e.request.requestType === 'USER_DEFINED_BOARD_V1');
const live = (frame, fn, arg) => frame.evaluate(fn, arg);
const bench = page => page.frames().find(f => f.url().includes('three-frames.html'));

async function openStartOwn(browser, origin) {
  const { page, frame, errors } = await openTile(browser, origin, 'Start your own');
  await until(async () => bench(page) && await bench(page).$('#stb-confirm-store'), 'Start your own page');
  // The bench has no default species: until the user chooses one, the revision blocks before the Store on the
  // material and names its owner.
  await until(() => live(frame, () => window.STBStartOwnLive?.admission()?.admission?.result === 'BLOCKED'), 'bench revision blocked on species');
  assert.deepEqual(await live(frame, () => window.STBStartOwnLive.admission().admission.blocking),
    [{ factId: 'start-own.material', owner: 'USER', title: 'Material demand', condition: 'INVALID_VALUE', fields: ['species'] }]);
  return { page, frame, errors };
}
// The user states a species on the bench; the bench revision is then admitted.
async function chooseSpecies(page, frame, species) {
  await bench(page).locator(`#stb-bench-species [data-species="${species}"]`).click();
  await until(() => live(frame, () => window.STBStartOwnLive?.admission()?.admission?.result === 'ADMITTED'), 'bench revision admitted');
}

test('the old Start your own shell path is gone; one Store handoff, inside inquire()', () => {
  const shell = read('system-build-current.html');
  for (const name of ['applyStartOwnNavState', 'wireStartOwnJourneyNav', 'canOpenStartOwnSimulationStage', 'START_OWN_NAV_LABELS',
    'syncJourneyNav', 'STB_START_OWN_CONFIRMED', 'STB_PROOF_OPEN_JOB1', '1 · Your idea']) {
    assert.equal(shell.includes(name), false, name + ' is still in the shell');
  }
  assert.doesNotMatch(shell, /activeJourneyProject\s*[!=]==?\s*['"]start-own['"]|['"]start-own['"]\s*[!=]==?\s*activeJourneyProject/, 'no Start your own branch in the shell');
  assert.doesNotMatch(shell, /projectId\s*===\s*['"]start-own['"]/, 'no Start your own branch in the stage router');
  assert.match(shell, /registerTileHost\(START_OWN_PROJECT_ID, \{/);

  // One Store handoff: the User 1 bridge, called only as inquire()'s transport, after admit().
  assert.equal((shell.match(/user1RuntimeBridge\.request\(/g) || []).length, 1);
  assert.match(shell, /const admission = tileHostContract\.admit\(\{ revision, inquiryScope:START_OWN_INQUIRY_SCOPE \}\);[\s\S]*?tileHostContract\.inquire\(admission, request => \{[\s\S]*?user1RuntimeBridge\.request\(request, startOwnStoreDemandFrom\(request\), \{ requestId \}\)/);
  const bridge = read('stb-user-defined-board-runtime-bridge.js');
  // The bridge sends the admitted request without the old door.
  assert.equal((bridge.match(/client\.sendAdmittedJob\(/g) || []).length, 1);
  assert.match(bridge, /client\.sendAdmittedJob\(\{\s*admitted,/);
  assert.equal(bridge.includes('sendJob('), false, 'no Start your own inquiry goes through sendJob');
  assert.match(bridge, /START_OWN_ADMITTED_REQUEST_REQUIRED/);
  
  // The contract is loaded from the one deployed copy, never pasted in.
  const blob = execFileSync('git', ['hash-object', fileURLToPath(new URL('../../public-build/shared/tile-host-admission-contract.mjs', import.meta.url))], { encoding: 'utf8' }).trim().slice(0, 8);
  assert.ok(shell.includes(`import('./shared/tile-host-admission-contract.mjs?v=${blob}')`), 'shell loads the deployed contract at its current bytes');
  assert.equal(shell.includes('export function admit'), false, 'shell does not carry a copy of the contract');
});

test('the shared host draws the Start your own nav from its validated STB-TILE-HOST-0.1 message', { timeout: 240000 }, async () => {
  await withBrowser(async ({ browser, origin, log }) => {
    const { page, frame, errors } = await openStartOwn(browser, origin);

    // Intent: the six contract steps after the Project Library. The Store answers waits for an answer to show.
    let message = await live(frame, () => window.STBStartOwnLive.hostMessage());
    assert.deepEqual(Object.keys(message).sort(), ['interface', 'navigationRequest', 'stage', 'tileId', 'usableSteps']);
    assert.equal(message.interface, 'STB-TILE-HOST-0.1');
    assert.equal(message.tileId, 'start-own');
    assert.equal(message.stage, 'Intent');
    assert.deepEqual(message.usableSteps, TRAIL_STEPS.slice(0, 2));
    assert.equal(await live(frame, () => document.documentElement.dataset.tileHostRejected ?? null), null);
    let line = await navLine(frame);
    assert.deepEqual(line.map(b => b.label), ['← Project Library', ...TRAIL_STEPS.map((step, i) => `${i + 1} · ${step}`)]);
    assert.deepEqual(steps(line).map(b => b.inert), [false, false, true, true, true, true]);
    assert.deepEqual(await currentLabels(frame), ['1 · Intent']);
    assert.equal(await frame.locator('.recovery-nav .job-nav-context').innerText(), 'JOB 1 · START YOUR OWN');
    assert.equal(startOwnCalls(log).length, 0, 'arriving asks the Store nothing');

    // The bench is the bench screen of the same page; the current step moves with it, and back.
    await frame.locator('.recovery-nav button[data-job-project="start-own"][data-journey-stage="configure"]').click();
    await until(async () => (await currentLabels(frame)).join() === '2 · The bench', 'bench current');
    assert.equal(await shownPage(frame), 'start-own-live');
    assert.equal(await bench(page).locator('#stb-start-bench-screen').isHidden(), false);
    await frame.locator('.recovery-nav button[data-job-project="start-own"][data-journey-stage="scan"]').click();
    await until(async () => (await currentLabels(frame)).join() === '1 · Intent', 'intent current');
    assert.equal(await bench(page).locator('#stb-start-intent-screen').isHidden(), false);
    await frame.locator('.recovery-nav button[data-job-project="start-own"][data-journey-stage="configure"]').click();
    await until(async () => (await currentLabels(frame)).join() === '2 · The bench', 'bench current again');

    // Confirming the bench asks the Store once and opens The Store answers with Your call usable.
    await chooseSpecies(page, frame, 'spf');
    await bench(page).locator('#stb-confirm-store').click();
    await until(async () => (await currentLabels(frame)).join() === '3 · The Store answers', 'store current');
    assert.equal(await shownPage(frame), 'proof-store');
    assert.equal(startOwnCalls(log).length, 1);
    message = await live(frame, () => window.STBStartOwnLive.hostMessage());
    assert.deepEqual(message.usableSteps, TRAIL_STEPS.slice(0, 4));
    assert.deepEqual(steps(await navLine(frame)).map(b => b.inert), [false, false, false, false, true, true]);

    // Your call opens Start your own's own page for it, from the page's continue button, through the same gate.
    await frame.locator('#proof-store [data-proof-go="proof-accept"]').click();
    await until(async () => (await currentLabels(frame)).join() === '4 · Your call', 'your call current');
    assert.equal(await shownPage(frame), 'proof-accept');
    // We cut it is inert, so its in-page action does nothing but stay where it is.
    await frame.evaluate(() => document.querySelector('#proof-yard-handoff')?.click());
    assert.equal(await shownPage(frame), 'proof-accept');

    // A changed definition is asked again: the earlier answer is no longer this revision's, so steps 3–6 go inert.
    await frame.locator('.recovery-nav button[data-job-project="start-own"][data-journey-stage="configure"]').click();
    await until(async () => (await currentLabels(frame)).join() === '2 · The bench', 'back on the bench');
    await bench(page).locator('[data-length="18"]').first().click();
    await until(async () => { const i = await inertByStage(frame); return i.store && i.request && i.yard && i.record; }, 'steps 3–6 inert after a change');
    assert.equal(await page.evaluate(() => window.STBTermsFlow.instance('start-own').state().stage), 'NO_ANSWER');
    assert.equal(startOwnCalls(log).length, 1, 'a change on the bench is not sent until it is confirmed');
    assert.deepEqual(errors, []);
    await page.close();
  });
});

// The old door, served with a recorder: every call to admitPublicStoreRequest in that page is counted on the
// window that imported it, with the project it was called for. Nothing else about the module changes.
const OLD_DOOR = 'stb-public-admission.mjs';
const recordOldDoor = source => {
  const head = 'export function admitPublicStoreRequest(';
  assert.equal(source.split(head).length, 2, 'the old door is exported once');
  return source.replace(head, 'function oldDoorUnrecorded(') + `
export function admitPublicStoreRequest(input) {
  (globalThis.__stbOldDoorCalls ||= []).push(input?.projectId ?? null);
  return oldDoorUnrecorded(input);
}
`;
};
const startOwnOldDoorCalls = page => Promise.all(page.frames().map(f => f.evaluate(() => window.__stbOldDoorCalls ?? [])))
  .then(lists => lists.flat().filter(projectId => projectId === 'start-own'));

test('a missing profile fact blocks before the Store and names its owner; a complete revision still reaches the Store', { timeout: 240000 }, async () => {
  await withBrowser(async ({ browser, origin, log }) => {
    const { page, frame } = await openStartOwn(browser, origin);
    await frame.locator('.recovery-nav button[data-job-project="start-own"][data-journey-stage="configure"]').click();
    await chooseSpecies(page, frame, 'spf');

    // The bench's revision is complete: admitted, with exactly the profile's facts.
    const admission = await live(frame, () => window.STBStartOwnLive.admission());
    assert.equal(admission.admission.result, 'ADMITTED');
    assert.deepEqual(Object.keys(admission.request.facts).sort(),
      ['start-own.datum', 'start-own.material', 'start-own.operations', 'start-own.parts', 'start-own.spot-demand', 'start-own.workpiece-length']);
    assert.deepEqual(admission.request.openDemands, []);
    assert.equal(admission.request.profileVersion, '0.5');
    // The material is what the bench states: the species the user chose, form and nominal size from its "2×4 stud" control.
    assert.deepEqual(admission.request.facts['start-own.material'], { species: 'spf', form: 'board', nominalT: 2, nominalW: 4 });
    assert.equal(admission.request.requestType, 'USER_DEFINED_BOARD_V1');

    // Each declared fact left out blocks before the Store and names its owner, on the bench and in the nav.
    for (const [factId, owner, title] of [
      ['start-own.parts', 'USER', 'Identified parts with real lengths'],
      ['start-own.operations', 'PROJECT', 'Declared operations'],
      ['start-own.datum', 'RULE', 'Cut and datum meaning'],
      ['start-own.spot-demand', 'USER', 'Center spot demand, on or off'],
    ]) {
      const result = await live(frame, id => {
        const revision = window.STBStartOwnLive.revision();
        delete revision.facts[id];
        revision.definitionRevisionId += '-without-' + id;
        return window.STBStartOwnLive.inquire(revision);
      }, factId);
      assert.equal(result.reachedStore, false, factId);
      assert.deepEqual(result.blocking, [{ factId, owner, title, condition: 'MISSING' }]);
      const state = await live(frame, () => window.STBStartOwnLive.state());
      assert.equal(state.admission.result, 'BLOCKED');
      assert.equal(state.admission.reason, 'REQUIRED_FACT_UNSETTLED');
      await page.waitForTimeout(300);
      assert.equal(startOwnCalls(log).length, 0, factId + ': a blocked revision never reaches the Store');
      assert.match(await bench(page).locator('#stb-before-send').textContent(), new RegExp('^NOT SENT TO THE STORE · MISSING: ' + title + ' · owner ' + owner));
      assert.deepEqual(await inertByStage(frame), { scan: false, configure: false, store: true, request: true, yard: true, record: true });
    }

    // The complete revision is admitted and reaches the Store, and the demand sent is built from the admitted facts.
    // The material on the wire is the admitted start-own.material fact, exactly the four fields the bench states.
    const revision = await live(frame, () => window.STBStartOwnLive.revision());
    const result = await live(frame, r => window.STBStartOwnLive.inquire(r), revision);
    assert.equal(result.reachedStore, true);
    assert.equal(result.answer.authority, 'CURRENT');
    assert.equal(result.answer.definitionRevisionId, revision.definitionRevisionId);
    const sent = startOwnCalls(log);
    assert.equal(sent.length, 1, 'a complete revision reaches the Store');
    assert.equal(sent[0].request.candidateRevisionId, revision.definitionRevisionId);
    const lineSent = sent[0].request.payload.line;
    assert.deepEqual(lineSent.materialDemand, revision.facts['start-own.material'].value);
    assert.deepEqual(lineSent.materialDemand, { species: 'spf', form: 'board', nominalT: 2, nominalW: 4 });
    assert.equal(sent[0].status, 200);
    assert.equal(sent[0].answer.materialResolution.status, 'MAPPED');
    assert.equal(sent[0].answer.materialResolution.materialDemand.species, 'spf');
    assert.deepEqual(lineSent.parts, revision.facts['start-own.parts'].value);
    assert.deepEqual(lineSent.requiredOps, revision.facts['start-own.operations'].value);
    assert.equal(Number(lineSent.definedWorkpieceLength.value), revision.facts['start-own.workpiece-length'].value);
    assert.equal(lineSent.sawAngleDeg, revision.facts['start-own.datum'].value.sawAngleDeg);
    assert.equal(lineSent.spotDemand?.totalCount ?? 0, revision.facts['start-own.spot-demand'].value.totalCount ?? 0);

    // A material without a species blocks before the Store and names its owner and the field.
    const noSpecies = await live(frame, () => {
      const r = window.STBStartOwnLive.revision();
      delete r.facts['start-own.material'].value.species;
      r.definitionRevisionId += '-without-species';
      return window.STBStartOwnLive.inquire(r);
    });
    assert.equal(noSpecies.reachedStore, false);
    assert.deepEqual(noSpecies.blocking, [{ factId: 'start-own.material', owner: 'USER', title: 'Material demand', condition: 'INVALID_VALUE', fields: ['species'] }]);

    // A material missing another stated field blocks the same way.
    const noWidth = await live(frame, () => {
      const r = window.STBStartOwnLive.revision();
      delete r.facts['start-own.material'].value.nominalW;
      r.definitionRevisionId += '-without-nominalW';
      return window.STBStartOwnLive.inquire(r);
    });
    assert.equal(noWidth.reachedStore, false);
    assert.deepEqual(noWidth.blocking, [{ factId: 'start-own.material', owner: 'USER', title: 'Material demand', condition: 'INVALID_VALUE', fields: ['nominalW'] }]);
    await page.waitForTimeout(300);
    assert.equal(startOwnCalls(log).length, 1, 'a material missing a stated field never reaches the Store');

    // The bridge sends nothing that admit() did not admit.
    const refused = await page.evaluate(async () => {
      try { await window.STBUserDefinedBoardRuntimeBridge.request({ tileId: 'start-own' }, {}, {}); return null; }
      catch (error) { return error.message; }
    });
    assert.equal(refused, 'START_OWN_ADMITTED_REQUEST_REQUIRED');
    assert.equal(startOwnCalls(log).length, 1);

    // No Start your own inquiry, admitted or blocked, called the old door.
    assert.deepEqual(await startOwnOldDoorCalls(page), []);

    // Control: the recorder is live. The old door still runs for a direct sendJob call, and is counted.
    const direct = await live(frame, () => window.STBStoreClient.sendJob({
      projectId: 'start-own', requestType: 'USER_DEFINED_BOARD_V1', candidateRevisionId: 'control', payload: {},
    }).then(() => 'sent', error => String(error?.message || error)));
    assert.match(direct, /SYSTEM_ADMISSION_/);
    assert.deepEqual(await startOwnOldDoorCalls(page), ['start-own']);
  }, null, { [OLD_DOOR]: recordOldDoor });
});

// The datum, saw angle and spot demand are checked field by field, on the live route: each malformed case blocks in
// admit() before the Store and names the fact's owner and the missing field; the complete bench revision still
// reaches the Store. Only the fields the page already emits are checked. With spotting off, no spot is asked for
// and none is sent.
test('a blank datum field, a non-finite saw angle or a spot operation without its spot demand blocks before the Store', { timeout: 240000 }, async () => {
  await withBrowser(async ({ browser, origin, log }) => {
    const { page, frame } = await openTile(browser, origin, 'Start your own');
    await until(async () => bench(page) && await bench(page).$('#stb-confirm-store'), 'Start your own page');
    await frame.locator('.recovery-nav button[data-job-project="start-own"][data-journey-stage="configure"]').click();
    await chooseSpecies(page, frame, 'spf');

    // The bench's revision as the page emits it: six datum keys and, with spotting on, the spot demand.
    const bench0 = await live(frame, () => window.STBStartOwnLive.revision());
    assert.deepEqual(Object.keys(bench0.facts['start-own.datum'].value).sort(),
      ['cutPlane', 'datumCMethod', 'endIdentity', 'endRelation', 'lengthDatum', 'sawAngleDeg']);
    assert.ok(bench0.facts['start-own.operations'].value.includes('SPOT_ON_LOCATION'));
    assert.equal(bench0.facts['start-own.spot-demand'].value.required, true);

    // Each case is one edit to the bench's own revision, made in the page and sent through the page's one inquiry
    // path: set a field to a value, or delete it, or replace the whole fact value.
    const ask = (factId, edit, tag) => live(frame, ({ factId, edit, tag }) => {
      const r = window.STBStartOwnLive.revision();
      if (edit.replace) r.facts[factId].value = edit.replace;
      else if (edit.del) delete r.facts[factId].value[edit.del];
      else r.facts[factId].value[edit.set[0]] = edit.set[1];
      r.definitionRevisionId += '-' + tag;
      return window.STBStartOwnLive.inquire(r);
    }, { factId, edit, tag });
    const CASES = [
      // Datum: the five meaning fields are nonempty text. Owner RULE.
      ...['cutPlane', 'endIdentity', 'endRelation', 'lengthDatum', 'datumCMethod'].flatMap(field => [
        ['start-own.datum', { set: [field, ''] }, [field], `blank-${field}`],
        ['start-own.datum', { set: [field, '  '] }, [field], `space-${field}`],
        ['start-own.datum', { set: [field, null] }, [field], `null-${field}`],
      ]),
      // Saw angle: finite. Missing or non-finite blocks. Owner RULE.
      ['start-own.datum', { del: 'sawAngleDeg' }, ['sawAngleDeg'], 'no-angle'],
      ['start-own.datum', { set: ['sawAngleDeg', NaN] }, ['sawAngleDeg'], 'nan-angle'],
      ['start-own.datum', { set: ['sawAngleDeg', Infinity] }, ['sawAngleDeg'], 'infinite-angle'],
      ['start-own.datum', { set: ['sawAngleDeg', null] }, ['sawAngleDeg'], 'null-angle'],
      // Spot demand: the operations include SPOT_ON_LOCATION, so it says required, its mode and a count above 0. Owner USER.
      ['start-own.spot-demand', { replace: { required: false } }, ['required', 'mode', 'totalCount'], 'spot-off'],
      ['start-own.spot-demand', { set: ['totalCount', 0] }, ['totalCount'], 'spot-zero'],
      ['start-own.spot-demand', { del: 'totalCount' }, ['totalCount'], 'spot-no-count'],
      ['start-own.spot-demand', { set: ['mode', ''] }, ['mode'], 'spot-no-mode'],
      // The mode is exactly SPOT_ON_LOCATION: any other text, or none, blocks.
      ['start-own.spot-demand', { set: ['mode', 'DRILL'] }, ['mode'], 'spot-mode-drill'],
      ['start-own.spot-demand', { set: ['mode', 'spot_on_location'] }, ['mode'], 'spot-mode-lowercase'],
      ['start-own.spot-demand', { set: ['mode', ' SPOT_ON_LOCATION '] }, ['mode'], 'spot-mode-padded'],
      ['start-own.spot-demand', { del: 'mode' }, ['mode'], 'spot-mode-missing'],
      ['start-own.spot-demand', { set: ['required', false] }, ['required'], 'spot-not-required'],
    ];
    const OWNERS = { 'start-own.datum': ['RULE', 'Cut and datum meaning'], 'start-own.spot-demand': ['USER', 'Center spot demand, on or off'] };
    for (const [factId, edit, fields, tag] of CASES) {
      const [owner, title] = OWNERS[factId];
      const result = await ask(factId, edit, tag);
      assert.equal(result.reachedStore, false, tag);
      assert.deepEqual(result.blocking, [{ factId, owner, title, condition: 'INVALID_VALUE', fields }], tag);
      assert.match(await bench(page).locator('#stb-before-send').textContent(), new RegExp('^NOT SENT TO THE STORE · MISSING: ' + title + ' · owner ' + owner), tag);
      assert.deepEqual(await inertByStage(frame), { scan: false, configure: false, store: true, request: true, yard: true, record: true }, tag);
    }
    await page.waitForTimeout(300);
    assert.equal(startOwnCalls(log).length, 0, 'no malformed revision reached the Store');

    // The complete bench revision still reaches the Store, with its datum, angle and spot demand on the wire.
    const complete = await live(frame, () => window.STBStartOwnLive.revision());
    const sent = await live(frame, r => window.STBStartOwnLive.inquire(r), complete);
    assert.equal(sent.reachedStore, true);
    assert.equal(startOwnCalls(log).length, 1);
    const line = startOwnCalls(log)[0].request.payload.line;
    const datum = complete.facts['start-own.datum'].value;
    for (const field of ['cutPlane', 'endIdentity', 'endRelation', 'lengthDatum', 'datumCMethod', 'sawAngleDeg']) {
      assert.equal(line[field], datum[field], field);
    }
    assert.equal(line.spotDemand.required, true);
    assert.equal(line.spotDemand.mode, 'SPOT_ON_LOCATION');
    assert.equal(line.spotDemand.totalCount, complete.facts['start-own.spot-demand'].value.totalCount);

    // Spotting off: no SPOT_ON_LOCATION and {required:false}, as the page states it off. Admitted, and no spot is sent.
    const off = await live(frame, () => {
      const r = window.STBStartOwnLive.revision();
      r.facts['start-own.operations'].value = r.facts['start-own.operations'].value.filter(op => op !== 'SPOT_ON_LOCATION');
      r.facts['start-own.spot-demand'].value = { required: false };
      r.definitionRevisionId += '-spot-off';
      return window.STBStartOwnLive.inquire(r);
    });
    assert.equal(off.reachedStore, true);
    assert.equal(startOwnCalls(log).length, 2);
    assert.equal(startOwnCalls(log)[1].request.payload.line.spotDemand, null, 'spotting off sends no spot');
    assert.equal(startOwnCalls(log)[1].request.payload.line.requiredOps.includes('SPOT_ON_LOCATION'), false);
  });
});
