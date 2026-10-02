// Alcove on the shared tile host, against the real pinned Store.
// - The host draws Alcove's one nav line from a validated STB-TILE-HOST-0.1 message and the trail contract: the six
//   contract steps, inert steps disabled, exactly one current, and the current step follows the shown Alcove page.
// - Every Store inquiry is admit() then inquire(): a missing profile fact blocks before the Store and names its owner;
//   a complete revision still reaches the Store, and the Store definition is built only from the admitted request.
// - The old Alcove shell path is gone: no applyAlcoveNavState, alcoveStageOpen, Alcove branches or data-go remapping,
//   and no Store definition built outside admission.
// - An Alcove inquiry has one admission decision, admit(): its transport is sendAdmittedJob, and it never calls
//   admitPublicStoreRequest.
// The rest of Alcove's preserved journey (answer → your call → yard → pickup, decline, refusal past the envelope,
// a stale acceptance) is in trail-terms.test.mjs and trail-stale-version.test.mjs.

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
const alcoveCalls = log => log.filter(e => e.request.projectId === 'alcove' && e.request.requestType === 'ALCOVE_INSERT_V1');
const live = (frame, fn, arg) => frame.evaluate(fn, arg);

// Opens the tile and waits for the answer the page asks for on arrival.
async function openAlcove(browser, origin) {
  const { page, frame, errors } = await openTile(browser, origin, 'Critical fit');
  await until(() => live(frame, () => { const s = window.STBAlcoveLive?.state(); return s && !s.asking && s.answer?.authority === 'CURRENT'; }), 'arrival answer');
  await page.waitForTimeout(300);
  return { page, frame, errors };
}

test('the old Alcove shell path is gone; one Store handoff, inside inquire()', () => {
  const shell = read('system-build-current.html');
  for (const name of ['applyAlcoveNavState', 'alcoveStageOpen', 'customerStage', 'buildAlcoveStoreDefinition', 'STBAlcoveStoreBridge']) {
    assert.equal(shell.includes(name), false, name + ' is still in the shell');
  }
  assert.doesNotMatch(shell, /activeJourneyProject\s*[!=]==?\s*['"]alcove['"]|['"]alcove['"]\s*[!=]==?\s*activeJourneyProject/, 'no Alcove branch in the shell');
  assert.doesNotMatch(shell, /projectId\s*===\s*['"]alcove['"]/, 'no Alcove branch in the stage router');
  assert.match(shell, /registerTileHost\(ALCOVE_PROJECT_ID, \{/);

  const base = read('system-build-base-8d8a9dd.html');
  assert.equal(base.includes('buildAlcoveStoreDefinition'), false, 'no Store definition is built outside admission');
  assert.equal(base.includes('STBAlcoveStoreDefinition'), false);
  // One Store handoff on the page: the bridge, called only as inquire()'s transport, after admit().
  assert.equal((base.match(/bridge\.request\(/g) || []).length, 1);
  assert.match(base, /const admission=C\.admit\(\{revision,inquiryScope:ALCOVE_INQUIRY_SCOPE\}\);[\s\S]*?C\.inquire\(admission,request=>bridge\.request\(request,alcoveDefinitionFrom\(request\)\)\)/);
  const bridge = read('stb-alcove-store-bridge.js');
  // The bridge sends the admitted request without the old door.
  assert.equal((bridge.match(/client\.sendAdmittedJob\(/g) || []).length, 1);
  assert.match(bridge, /client\.sendAdmittedJob\(\{\s*admitted,/);
  assert.equal(bridge.includes('sendJob('), false, 'no Alcove inquiry goes through sendJob');
  assert.match(bridge, /ALCOVE_ADMITTED_REQUEST_REQUIRED/);

  // The contract is loaded from the one deployed copy, never pasted in; page and host load the same bytes.
  const blob = execFileSync('git', ['hash-object', fileURLToPath(new URL('../../public-build/shared/tile-host-admission-contract.mjs', import.meta.url))], { encoding: 'utf8' }).trim().slice(0, 8);
  for (const [name, source] of [['base', base], ['shell', shell]]) {
    assert.ok(source.includes(`import('./shared/tile-host-admission-contract.mjs?v=${blob}')`), name + ' loads the deployed contract at its current bytes');
    assert.equal(source.includes('export function admit'), false, name + ' does not carry a copy of the contract');
  }
});

test('the shared host draws the Alcove nav from its validated STB-TILE-HOST-0.1 message', { timeout: 240000 }, async () => {
  await withBrowser(async ({ browser, origin }) => {
    const { page, frame, errors } = await openAlcove(browser, origin);

    // Intent: the six contract steps after the Project Library; Your call waits for a confirmed version's answer.
    let message = await live(frame, () => window.STBAlcoveTileHost.hostMessage());
    assert.deepEqual(Object.keys(message).sort(), ['interface', 'navigationRequest', 'stage', 'tileId', 'usableSteps']);
    assert.equal(message.interface, 'STB-TILE-HOST-0.1');
    assert.equal(message.tileId, 'alcove');
    assert.equal(message.stage, 'Intent');
    assert.deepEqual(message.usableSteps, TRAIL_STEPS.slice(0, 3));
    assert.equal(await live(frame, () => document.documentElement.dataset.tileHostRejected ?? null), null);
    let line = await navLine(frame);
    assert.deepEqual(line.map(b => b.label), ['← Project Library', ...TRAIL_STEPS.map((step, i) => `${i + 1} · ${step}`)]);
    assert.deepEqual(steps(line).map(b => b.inert), [false, false, false, true, true, true]);
    assert.deepEqual(await currentLabels(frame), ['1 · Intent']);
    assert.equal(await frame.locator('.recovery-nav .job-nav-context').innerText(), 'ALCOVE · CRITICAL FIT');

    // The bench opens Alcove's configure page; the current step moves with it.
    await frame.locator('.recovery-nav button[data-job-project="alcove"][data-journey-stage="configure"]').click();
    await until(async () => (await currentLabels(frame)).join() === '2 · The bench', 'bench current');
    assert.equal(await live(frame, () => [...document.querySelectorAll('.page.on')].pop()?.id), 'alcove-config');

    // Confirming the version sends it and opens The Store answers; with its answer in the terms flow, Your call opens.
    await frame.locator('#confirm-alcove-inline').click();
    await until(async () => (await currentLabels(frame)).join() === '3 · The Store answers', 'store current');
    assert.equal(await live(frame, () => [...document.querySelectorAll('.page.on')].pop()?.id), 'store');
    await until(async () => !steps(await navLine(frame)).find(b => b.stage === 'request').inert, 'your call usable');
    message = await live(frame, () => window.STBAlcoveTileHost.hostMessage());
    assert.deepEqual(message.usableSteps, TRAIL_STEPS.slice(0, 4));
    assert.equal(await frame.locator('[data-alcove-commercial-action="accept-page"]').isDisabled(), false);
    // We cut it and Pick up & build stay inert, and their in-page actions with them, until the terms flow opens them.
    assert.deepEqual(steps(await navLine(frame)).map(b => b.inert), [false, false, false, false, true, true]);
    assert.equal(await frame.locator('#yard [data-alcove-commercial-action="record"]').isDisabled(), true);

    // Your call opens Alcove's own page for it, through the same gate as an in-page action.
    await frame.locator('[data-alcove-commercial-action="accept-page"]').click();
    await until(async () => (await currentLabels(frame)).join() === '4 · Your call', 'your call current');
    assert.equal(await live(frame, () => [...document.querySelectorAll('.page.on')].pop()?.id), 'request');

    // An internal event page lands on its customer page: review on the Store page.
    await live(frame, () => window.show('alcove-review'));
    await until(async () => (await currentLabels(frame)).join() === '3 · The Store answers', 'review lands on store');
    assert.equal(await live(frame, () => [...document.querySelectorAll('.page.on')].pop()?.id), 'store');
    assert.deepEqual(errors, []);
    await page.close();
  });
});

test('a missing profile fact blocks before the Store and names its owner; a complete revision still reaches the Store', { timeout: 240000 }, async () => {
  await withBrowser(async ({ browser, origin, log }) => {
    const { frame } = await openAlcove(browser, origin);

    // The page's state is complete: admitted, with exactly the profile's facts; hardware travels open for the Store.
    const admission = await live(frame, () => window.STBAlcoveLive.admission());
    assert.equal(admission.admission.result, 'ADMITTED');
    assert.deepEqual(Object.keys(admission.request.facts).sort(),
      ['alcove.board-requirements', 'alcove.component-programs', 'alcove.material', 'alcove.opening', 'alcove.spot-demand']);
    assert.deepEqual(admission.request.openDemands, ['alcove.hardware']);
    assert.equal(admission.request.profileVersion, '0.2');
    assert.equal(admission.request.requestType, 'ALCOVE_INSERT_V1');
    // What reached the Store is the definition built from that admitted request, for that revision.
    const sent = alcoveCalls(log).at(-1).request;
    assert.equal(sent.candidateRevisionId, admission.definitionRevisionId);
    assert.deepEqual(sent.payload.definition, await live(frame, () => window.STBAlcoveLive.definition()));
    assert.equal(sent.payload.definition.configurationVersion, admission.definitionRevisionId);
    assert.deepEqual(sent.payload.definition.hardwareDemand, { requirementId: 'ALCOVE-PINS-AND-SCREWS', description: 'pins + screws', qty: 1, selectionAuthority: 'STORE_ZERO' });

    // Each declared fact left out blocks before the Store and names its owner.
    const before = alcoveCalls(log).length;
    for (const [factId, owner, title] of [
      ['alcove.opening', 'USER', 'Unit width, height and depth fitted to the opening'],
      ['alcove.component-programs', 'PROJECT', 'Component programs for every parent'],
      ['alcove.spot-demand', 'USER', 'Pilot spot demand, on or off'],
    ]) {
      const result = await live(frame, id => {
        const revision = window.STBAlcoveLive.revision();
        delete revision.facts[id];
        revision.definitionRevisionId += '-without-' + id;
        return window.STBAlcoveLive.inquire(revision);
      }, factId);
      assert.equal(result.admission.result, 'BLOCKED', factId);
      assert.equal(result.admission.reason, 'REQUIRED_FACT_UNSETTLED');
      assert.deepEqual(result.admission.blocking, [{ factId, owner, title, condition: 'MISSING' }]);
      assert.equal(result.request, null);
      await frame.page().waitForTimeout(500);
      assert.equal(alcoveCalls(log).length, before, factId + ': a blocked revision never reaches the Store');
      assert.equal(await frame.locator('#p-price').textContent(), 'NOT SENT TO THE STORE');
      assert.equal(await frame.locator('#p-basis').textContent(), 'Not sent to the Store. Missing: ' + title + ' · owner ' + owner);
      // Not admitted: The Store answers and every later step are inert.
      const inert = Object.fromEntries(steps(await navLine(frame)).map(b => [b.stage, b.inert]));
      assert.deepEqual(inert, { scan: false, configure: false, store: true, request: true, yard: true, record: true });
    }

    // The complete revision is admitted and reaches the Store, and its answer is current authority again.
    await live(frame, () => window.STBAlcoveLive.inquire(window.STBAlcoveLive.revision()));
    const state = await until(async () => { const s = await live(frame, () => window.STBAlcoveLive.state()); return !s.asking && s.answer?.authority === 'CURRENT' ? s : null; }, 'complete answer');
    assert.equal(state.admission.result, 'ADMITTED');
    assert.equal(alcoveCalls(log).length, before + 1);
    assert.equal(state.answer.definitionRevisionId, await live(frame, () => window.STBAlcoveLive.revision().definitionRevisionId));
    await until(async () => !steps(await navLine(frame)).find(b => b.stage === 'store').inert, 'The Store answers usable');
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
// Other tiles still use the old door; only Alcove calls are read, from every frame of the page.
const alcoveOldDoorCalls = page => Promise.all(page.frames().map(f => f.evaluate(() => window.__stbOldDoorCalls ?? [])))
  .then(lists => lists.flat().filter(projectId => projectId === 'alcove'));

test('an Alcove inquiry has one admission decision, admit(); it never calls admitPublicStoreRequest', { timeout: 240000 }, async () => {
  await withBrowser(async ({ browser, origin, log }) => {
    // Arrival asks the Store once, admitted, through inquire().
    const { page, frame, errors } = await openAlcove(browser, origin);
    const arrived = alcoveCalls(log).length;
    assert.ok(arrived >= 1, 'the arrival answer reached the Store');

    // A complete revision still reaches the Store, with the definition built from the admitted request on the wire.
    let result = await live(frame, () => window.STBAlcoveLive.inquire(window.STBAlcoveLive.revision()));
    assert.equal(result.admission.result, 'ADMITTED');
    assert.deepEqual(result.request.openDemands, ['alcove.hardware'], 'hardware stays a Store-owned open demand');
    await until(async () => { const s = await live(frame, () => window.STBAlcoveLive.state()); return !s.asking && s.answer?.authority === 'CURRENT'; }, 'complete answer');
    assert.equal(alcoveCalls(log).length, arrived + 1, 'a complete revision reaches the Store');
    const sent = alcoveCalls(log).at(-1).request;
    assert.equal(sent.candidateRevisionId, result.request.definitionRevisionId);
    assert.deepEqual(sent.payload.definition, await live(frame, () => window.STBAlcoveLive.definition()));
    assert.equal(sent.payload.definitionKind, 'alcove_insert.v1');
    assert.equal(sent.payload.ruleVersion, '0.1');

    // A missing opening still blocks before the Store, in admit(), and names its owner.
    const reached = alcoveCalls(log).length;
    result = await live(frame, () => {
      const revision = window.STBAlcoveLive.revision();
      delete revision.facts['alcove.opening'];
      revision.definitionRevisionId += '-without-opening';
      return window.STBAlcoveLive.inquire(revision);
    });
    assert.equal(result.admission.result, 'BLOCKED');
    assert.equal(result.admission.reason, 'REQUIRED_FACT_UNSETTLED');
    assert.deepEqual(result.admission.blocking, [{ factId: 'alcove.opening', owner: 'USER', title: 'Unit width, height and depth fitted to the opening', condition: 'MISSING' }]);
    assert.equal(result.request, null);
    await page.waitForTimeout(600);
    assert.equal(alcoveCalls(log).length, reached, 'a missing opening never reaches the Store');

    // No Alcove inquiry, admitted or blocked, called the old door.
    assert.deepEqual(await alcoveOldDoorCalls(page), []);

    // Control: the recorder is live. The old door still runs for a direct sendJob call, and is counted.
    const direct = await live(frame, () => window.STBStoreClient.sendJob({
      projectId: 'alcove', requestType: 'ALCOVE_INSERT_V1', candidateRevisionId: 'control', payload: {},
    }).then(() => 'sent', error => String(error?.message || error)));
    assert.match(direct, /SYSTEM_ADMISSION_/);
    assert.deepEqual(await alcoveOldDoorCalls(page), ['alcove']);
    assert.deepEqual(errors, []);
  }, null, { [OLD_DOOR]: recordOldDoor });
});
