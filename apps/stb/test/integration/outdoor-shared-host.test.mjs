// Outdoor on the shared tile host, against the real pinned Store.
// - Outdoor opens on its Idea intake: no step bar, the Idea line's one way on is Intent, and the values the bounded
//   tile already knows are carried to Intent.
// - The host draws Outdoor's one nav line from a validated STB-TILE-HOST-0.1 message the Outdoor frame posts, and the
//   trail contract: Idea, then the six contract steps, inert steps disabled, exactly one current, and the current step follows
//   the page shown in the frame. A frame speaking for another tile is rejected and the steps go inert.
// - Every Store inquiry is admit() then inquire(), in the outdoor profile's two scopes: OUTDOOR_OPTIONS (the "From"
//   and option prices) and OUTDOOR_COMMITTED (this exact table). A missing profile fact blocks before the Store and
//   names its owner; a complete revision still reaches the Store.
// - Both scopes have one admission decision, admit(): the transport is sendAdmittedJob, and no Outdoor inquiry, options
//   or committed, calls admitPublicStoreRequest.
// - The old Outdoor shell path is gone: no applyOutdoorNavState, outdoorNavState, outdoorFrame, STB_OUTDOOR_*
//   messages or Outdoor branches in the shell, and one Store handoff on the page, inside inquire().
// The rest of Outdoor's preserved journey (plans → bench → answer → your call → yard → pickup, the bigger bench,
// decline, refusal past the envelope, a stale acceptance) is in trail/outdoor-picnic.test.mjs, trail-terms.test.mjs
// and trail-stale-version.test.mjs.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

import { withBrowser, openTile } from './helpers.mjs';

const TRAIL_STEPS = ['Intent', 'The bench', 'The Store answers', 'Your call', 'We cut it', 'Pick up & build'];
const read = rel => fs.readFileSync(fileURLToPath(new URL('../../public-build/' + rel, import.meta.url)), 'utf8');

const frameOf = (page, part) => page.frames().find(f => f.url().includes(part));
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
const outdoorCalls = log => log.filter(e => e.request.projectId === 'outdoor' && e.request.requestType === 'CUT_PACKAGE_V1');
const committedCalls = log => outdoorCalls(log).filter(e => e.request.payload.definition.configurationId !== 'OUTDOOR-PICNIC-OPTIONS');

// Opens the tile on its Idea intake and takes the Idea line's one way on to Intent.
async function openOutdoor(browser, origin) {
  const { page, frame, errors } = await openTile(browser, origin, 'Outdoor build');
  const od = await until(() => frameOf(page, 'stb-outdoor-picnic-0.4.html'), 'outdoor frame');
  await until(() => od.evaluate(() => !!window.STBOutdoorPicnic?.hostMessage()), 'outdoor contract loaded');
  await until(() => od.evaluate(() => window.STBOutdoorPicnic.hostMessage().stage === 'Idea'), 'idea shown');
  await frame.locator('.recovery-nav button.job-idea-onward').click();
  await until(async () => (await currentLabels(frame)).join() === '1 · Intent', 'intent drawn');
  return { page, frame, od, errors };
}
// Store requests the page has sent and not yet had answered. The test server logs a call only once it is answered,
// so a count taken while a price request is in flight would gain that call later.
function storeInFlight(page) {
  const open = new Set();
  const isStore = r => r.method() === 'POST' && new URL(r.url()).pathname === '/api/store-zero/job';
  page.on('request', r => { if (isStore(r)) open.add(r); });
  page.on('requestfinished', r => open.delete(r));
  page.on('requestfailed', r => open.delete(r));
  return open;
}
// No Store request in flight, and none started, for longer than the page's 350 ms option-price debounce.
async function storeQuiet(page, open, quietMs = 700) {
  let since = Date.now(), seen = 0;
  const onRequest = () => { seen++; };
  page.on('request', onRequest);
  try {
    await until(() => {
      if (open.size || seen) { seen = 0; since = Date.now(); return false; }
      return Date.now() - since >= quietMs;
    }, 'Store requests settled');
  } finally { page.off('request', onRequest); }
}
const settle = od => until(() => od.evaluate(() => { const s = window.STBOutdoorPicnic.state(); return !s.asking && s.current ? s : null; }), 'committed answer');

test('the old Outdoor shell path is gone; one Store handoff, inside inquire()', () => {
  const shell = read('system-build-current.html');
  for (const name of ['applyOutdoorNavState', 'outdoorNavState', 'outdoorFrame', 'STB_OUTDOOR_STATE', 'STB_OUTDOOR_GO']) {
    assert.equal(shell.includes(name), false, name + ' is still in the shell');
  }
  assert.doesNotMatch(shell, /activeJourneyProject\s*[!=]==?\s*['"]outdoor['"]|['"]outdoor['"]\s*[!=]==?\s*activeJourneyProject/, 'no Outdoor branch in the shell');
  assert.doesNotMatch(shell, /projectId\s*===\s*['"]outdoor['"]/, 'no Outdoor branch in the stage router');
  assert.doesNotMatch(shell, /source\s*===\s*['"]outdoor['"]/, 'no Outdoor proof handoff');
  assert.match(shell, /registerTileHost\('outdoor', \{ frame:\(\) => doc\.getElementById\('outdoor-bench-leg-frame'\), idea:true \}\)/);

  const page = read('stb-outdoor-picnic-0.4.html');
  assert.equal(page.includes('STB_OUTDOOR_'), false, 'the page speaks only STB-TILE-HOST-0.1 to the host');
  assert.equal(/\bsend\(/.test(page), false, 'no Store send outside inquire()');
  // One Store handoff on the page: the transport inside inquire(), after admit(), in each scope. It sends the request
  // admit() admitted through sendAdmittedJob; the old door (sendJob) is not on the page.
  assert.equal((page.match(/client\.sendAdmittedJob\(/g) || []).length, 1);
  assert.equal(page.includes('sendJob('), false, 'no Outdoor inquiry goes through sendJob');
  assert.match(page, /function storeTransport\(definition,got\)\{\s*return request=>\{[\s\S]*?client\.sendAdmittedJob\(\{admitted:request,/);
  assert.match(page, /C\.admit\(\{revision:optionsRevision\(def\),inquiryScope:OPTIONS_SCOPE\}\);[\s\S]*?C\.inquire\(admission,storeTransport\(def,got\)\)/);
  assert.match(page, /C\.admit\(\{revision:rv\|\|revision\(req\),inquiryScope:COMMITTED_SCOPE\}\);[\s\S]*?C\.inquire\(admission,storeTransport\(req\.definition,got\)\)/);

  // The contract is loaded from the one deployed copy, never pasted in; page and host load the same bytes.
  const blob = execFileSync('git', ['hash-object', fileURLToPath(new URL('../../public-build/shared/tile-host-admission-contract.mjs', import.meta.url))], { encoding: 'utf8' }).trim().slice(0, 8);
  for (const [name, source] of [['outdoor page', page], ['shell', shell]]) {
    assert.ok(source.includes(`import('./shared/tile-host-admission-contract.mjs?v=${blob}')`), name + ' loads the deployed contract at its current bytes');
    assert.equal(source.includes('export function admit'), false, name + ' does not carry a copy of the contract');
  }
});

test('the shared host draws the Outdoor nav from its validated STB-TILE-HOST-0.1 message', { timeout: 240000 }, async () => {
  await withBrowser(async ({ browser, origin }) => {
    // Outdoor opens on its Idea intake: no step bar, and the Idea line's one way on is Intent. The values the bounded
    // tile already knows are there, carried to Intent, and Intent opens with them.
    {
      const { page: ideaPage, frame: idea } = await openTile(browser, origin, 'Outdoor build');
      const ideaOd = await until(() => frameOf(ideaPage, 'stb-outdoor-picnic-0.4.html'), 'outdoor frame');
      await until(() => ideaOd.evaluate(() => !!window.STBOutdoorPicnic?.hostMessage()), 'outdoor contract loaded');
      const ideaMessage = await ideaOd.evaluate(() => window.STBOutdoorPicnic.hostMessage());
      assert.equal(ideaMessage.stage, 'Idea');
      assert.deepEqual(ideaMessage.usableSteps, ['Intent']);
      assert.equal(await ideaOd.evaluate(() => window.STBOutdoorPicnic.state().section), 'idea');
      await until(async () => (await navLine(idea)).map(b => b.label).join() === '← Project Library,Intent', 'idea line');
      assert.match(await ideaOd.locator('[data-idea-plan="table-benches"]').innerText(), /Length · 6 ft[\s\S]*Wood · Ground-contact[\s\S]*Hardware pack · Coated/);
      await idea.locator('.recovery-nav button.job-idea-onward').click();
      await until(async () => (await currentLabels(idea)).join() === '1 · Intent', 'Intent from Idea');
      // Intent opens with the carried values: picking the plan sends them, nothing re-entered.
      await ideaOd.locator('[data-plan="table-benches"]').click();
      const carried = await ideaOd.evaluate(() => window.STBOutdoorPicnic.state());
      assert.equal(carried.lengthIn, 72);
      assert.ok((await ideaOd.evaluate(() => window.STBOutdoorPicnic.request())).cutPackages.every(p => p.packageId.startsWith('ground-contact|')));
      // From Intent on, Idea is the back control and never current; it returns to the Idea page.
      await idea.locator('.recovery-nav button.job-idea').click();
      await until(() => ideaOd.evaluate(() => window.STBOutdoorPicnic.state().section === 'idea'), 'Idea from Intent');
      await ideaPage.close();
    }

    const { page, frame, od, errors } = await openOutdoor(browser, origin);

    // Intent, before a plan is picked: Idea, then the six contract steps after the Project Library; only Intent usable.
    let message = await od.evaluate(() => window.STBOutdoorPicnic.hostMessage());
    assert.deepEqual(Object.keys(message).sort(), ['interface', 'navigationRequest', 'stage', 'tileId', 'usableSteps']);
    assert.equal(message.interface, 'STB-TILE-HOST-0.1');
    assert.equal(message.tileId, 'outdoor');
    assert.equal(message.stage, 'Intent');
    assert.deepEqual(message.usableSteps, ['Intent']);
    assert.equal(await frame.evaluate(() => document.documentElement.dataset.tileHostRejected ?? null), null);
    let line = await navLine(frame);
    assert.deepEqual(line.map(b => b.label), ['← Project Library', 'Idea', ...TRAIL_STEPS.map((step, i) => `${i + 1} · ${step}`)]);
    assert.deepEqual(steps(line).map(b => b.inert), [false, true, true, true, true, true]);
    assert.equal(await frame.locator('.recovery-nav .job-nav-context').innerText(), 'OUTDOOR · PICNIC TABLE');

    // Picking a plan opens the bench; the committed answer opens The Store answers and, in the terms flow, Your call.
    await od.locator('[data-plan="table-benches"]').click();
    await settle(od);
    await until(async () => (await currentLabels(frame)).join() === '2 · The bench', 'bench current');
    await until(async () => !steps(await navLine(frame)).find(b => b.stage === 'request').inert, 'your call usable');
    message = await od.evaluate(() => window.STBOutdoorPicnic.hostMessage());
    assert.deepEqual(message.usableSteps, TRAIL_STEPS.slice(0, 4));
    assert.deepEqual(steps(await navLine(frame)).map(b => b.inert), [false, false, false, false, true, true]);

    // The Store answers opens the answer on Outdoor's own page, and is the current step.
    await frame.locator('.recovery-nav button[data-job-project="outdoor"][data-journey-stage="store"]').click();
    await until(async () => (await currentLabels(frame)).join() === '3 · The Store answers', 'store current');
    assert.equal(await od.evaluate(() => window.STBOutdoorPicnic.state().section), 'build');
    assert.equal(await frame.evaluate(() => [...document.querySelectorAll('.page.on')].pop()?.id), 'outdoor-build-live');

    // Your call opens Outdoor's own page for it.
    await frame.locator('.recovery-nav button[data-job-project="outdoor"][data-journey-stage="request"]').click();
    await until(async () => (await currentLabels(frame)).join() === '4 · Your call', 'your call current');
    assert.equal(await od.evaluate(() => window.STBOutdoorPicnic.state().section), 'call');

    // Intent goes back to the plans, and the current step follows.
    await frame.locator('.recovery-nav button[data-job-project="outdoor"][data-journey-stage="scan"]').click();
    await until(async () => (await currentLabels(frame)).join() === '1 · Intent', 'intent current again');
    assert.equal(await od.evaluate(() => window.STBOutdoorPicnic.state().section), 'plans');

    // A frame speaking for another tile is rejected; the Outdoor steps go inert until Outdoor speaks again.
    await od.evaluate(() => window.parent.postMessage({ type: 'STB_TILE_HOST', message: { interface: 'STB-TILE-HOST-0.1', tileId: 'alcove', stage: 'Intent', usableSteps: ['Intent'], navigationRequest: null } }, location.origin));
    await until(() => frame.evaluate(() => document.documentElement.dataset.tileHostRejected === 'TILE_FRAME_MISMATCH'), 'mismatch rejected');
    assert.ok(steps(await navLine(frame)).every(b => b.inert));
    assert.deepEqual(errors, []);
    await page.close();
  });
});

test('a missing profile fact blocks before the Store and names its owner; a complete revision still reaches the Store', { timeout: 240000 }, async () => {
  await withBrowser(async ({ browser, origin, log }) => {
    const { frame, od } = await openOutdoor(browser, origin);
    const inFlight = storeInFlight(od.page());

    // The "From" prices are OUTDOOR_OPTIONS inquiries; they reach the Store and never the terms flow.
    await until(() => od.evaluate(() => [...document.querySelectorAll('[data-from]')].every(e => /From/.test(e.textContent))), 'from prices');
    assert.ok(outdoorCalls(log).length >= 2);
    assert.equal(committedCalls(log).length, 0, 'nothing committed before a plan');

    await od.locator('[data-plan="a-frame"]').click();
    await settle(od);

    // The page's state is complete: admitted under OUTDOOR_COMMITTED, with exactly the profile's facts.
    const admission = await od.evaluate(() => window.STBOutdoorPicnic.admission());
    assert.equal(admission.admission.result, 'ADMITTED');
    assert.equal(admission.inquiryScope, 'OUTDOOR_COMMITTED');
    assert.deepEqual(Object.keys(admission.request.facts).sort(), ['outdoor.bench-work', 'outdoor.cut-packages', 'outdoor.plan']);
    assert.deepEqual(admission.request.openDemands, []);
    assert.equal(admission.request.profileVersion, '0.4');
    assert.equal(admission.request.requestType, 'CUT_PACKAGE_V1');
    // What reached the Store is the definition for that admitted revision, with exactly the admitted packages.
    const sent = committedCalls(log).at(-1).request;
    assert.equal(sent.candidateRevisionId, admission.definitionRevisionId);
    assert.equal(sent.payload.definition.configurationVersion, admission.definitionRevisionId);
    assert.deepEqual(sent.payload.definition.cutPackages, admission.request.facts['outdoor.cut-packages']);
    assert.deepEqual(sent.payload.definition, await od.evaluate(() => window.STBOutdoorPicnic.request()));

    // Each declared fact left out blocks before the Store and names its owner. The plan's option prices are asked
    // after the plan is picked; they finish before the calls are counted.
    await storeQuiet(od.page(), inFlight);
    const before = outdoorCalls(log).length;
    for (const [factId, owner, title] of [
      ['outdoor.plan', 'USER', 'Chosen plan'],
      ['outdoor.cut-packages', 'PROJECT', 'Requested work with real part values'],
      ['outdoor.bench-work', 'USER', 'Every spot hole and decorative cut tried on the bench, set'],
    ]) {
      const result = await od.evaluate(id => {
        const revision = window.STBOutdoorPicnic.revision();
        delete revision.facts[id];
        revision.definitionRevisionId += '-without-' + id;
        return window.STBOutdoorPicnic.inquire(revision);
      }, factId);
      assert.equal(result.admission.result, 'BLOCKED', factId);
      assert.equal(result.admission.reason, 'REQUIRED_FACT_UNSETTLED');
      assert.deepEqual(result.admission.blocking, [{ factId, owner, title, condition: 'MISSING' }]);
      assert.equal(result.request, null);
      await od.page().waitForTimeout(500);
      assert.equal(outdoorCalls(log).length, before, factId + ': a blocked revision never reaches the Store');
      assert.equal(await od.locator('#instant [data-not-sent]').textContent(), 'NOT SENT TO THE STORE. Missing: ' + title + ' · owner ' + owner);
      // Not admitted: The Store answers and every later step are inert.
      const inert = Object.fromEntries(steps(await navLine(frame)).map(b => [b.stage, b.inert]));
      assert.deepEqual(inert, { scan: false, configure: false, store: true, request: true, yard: true, record: true });
    }

    // The complete revision is admitted and reaches the Store, and its answer is current authority again.
    await od.evaluate(() => window.STBOutdoorPicnic.inquire(window.STBOutdoorPicnic.revision()));
    const state = await settle(od);
    assert.equal(state.admission.result, 'ADMITTED');
    assert.equal(outdoorCalls(log).length, before + 1);
    assert.equal(state.answer.authority, 'CURRENT');
    assert.equal(state.answer.definitionRevisionId, await od.evaluate(() => window.STBOutdoorPicnic.revision().definitionRevisionId));
    await until(async () => !steps(await navLine(frame)).find(b => b.stage === 'store').inert, 'The Store answers usable');
    assert.equal(await od.locator('#instant [data-not-sent]').count(), 0);

    // On the bench, an unplaced spot hole is the page's own blocking condition: it holds outdoor.bench-work open, so
    // the revision is blocked before the Store and the page names the fact and its owner.
    await od.locator('#to-edge').click();
    const quiet = outdoorCalls(log).filter(e => e.request.payload.definition.configurationId !== 'OUTDOOR-PICNIC-OPTIONS').length;
    await od.locator('[data-part="SEAT"] [data-tool="spots"]').click();
    await until(() => od.evaluate(() => window.STBOutdoorPicnic.state().admission?.result === 'BLOCKED'), 'bench work blocks');
    const blocked = await od.evaluate(() => window.STBOutdoorPicnic.state().admission);
    assert.deepEqual(blocked.blocking, [{ factId: 'outdoor.bench-work', owner: 'USER', title: 'Every spot hole and decorative cut tried on the bench, set', condition: 'STATUS_UNRESOLVED' }]);
    await od.page().waitForTimeout(600);
    assert.equal(committedCalls(log).length, quiet, 'an unset spot hole never reaches the Store');
    assert.match(await od.locator('#edge-answer [data-not-sent]').textContent(), /owner USER/);
    // Placing it settles the fact; the revision is admitted and reaches the Store.
    await od.locator('[data-part="SEAT"] [data-in="fromEndIn"]').fill('4');
    await od.locator('[data-part="SEAT"] [data-in="place"]').selectOption('CENTER');
    await settle(od);
    assert.equal(committedCalls(log).length, quiet + 1);
    assert.ok(committedCalls(log).at(-1).request.payload.definition.cutPackages.some(p => p.parts.some(x => x.spots)));
  });
});

// The old door, served with a recorder: every call to admitPublicStoreRequest in that page is counted on the
// window that imported it, with the project and the configuration it was called for. Nothing else about the module
// changes.
const OLD_DOOR = 'stb-public-admission.mjs';
const recordOldDoor = source => {
  const head = 'export function admitPublicStoreRequest(';
  assert.equal(source.split(head).length, 2, 'the old door is exported once');
  return source.replace(head, 'function oldDoorUnrecorded(') + `
export function admitPublicStoreRequest(input) {
  (globalThis.__stbOldDoorCalls ||= []).push({ projectId: input?.projectId ?? null, configurationId: input?.payload?.definition?.configurationId ?? null });
  return oldDoorUnrecorded(input);
}
`;
};
// Other tiles still use the old door; only Outdoor calls are read, from every frame of the page.
const outdoorOldDoorCalls = page => Promise.all(page.frames().map(f => f.evaluate(() => window.__stbOldDoorCalls ?? [])))
  .then(lists => lists.flat().filter(call => call.projectId === 'outdoor'));
const optionsCalls = log => outdoorCalls(log).filter(e => e.request.payload.definition.configurationId === 'OUTDOOR-PICNIC-OPTIONS');

test('both Outdoor scopes have one admission decision, admit(); no Outdoor inquiry calls admitPublicStoreRequest', { timeout: 240000 }, async () => {
  await withBrowser(async ({ browser, origin, log }) => {
    const { page, od, errors } = await openOutdoor(browser, origin);

    // OUTDOOR_OPTIONS before a plan: the "From" prices reach the Store, one per plan, nothing committed.
    const plans = await od.evaluate(() => window.STBOutdoorPicnic.plans);
    await until(() => optionsCalls(log).length >= plans.length, 'from prices reached the Store');
    assert.equal(committedCalls(log).length, 0, 'nothing committed before a plan');
    for (const { request } of optionsCalls(log)) {
      assert.match(request.candidateRevisionId, /^od-options-[0-9a-f]{8}$/);
      assert.equal(request.candidateRevisionId, request.payload.definition.configurationVersion);
    }

    // OUTDOOR_OPTIONS for the plan just picked: its option prices reach the Store, through the same admitted door.
    await od.locator('[data-plan="a-frame"]').click();
    await settle(od);
    const picked = await od.evaluate(() => window.STBOutdoorPicnic.optionsRequest());
    assert.ok(picked.itemLines.length > 0, 'the picked plan prices its hardware packs too');
    await until(() => optionsCalls(log).some(e => isDeepStrictEqual(e.request.payload.definition, picked)), 'picked plan options reached the Store');
    assert.equal(optionsCalls(log).find(e => isDeepStrictEqual(e.request.payload.definition, picked)).request.candidateRevisionId, picked.configurationVersion);

    // OUTDOOR_COMMITTED: a complete revision still reaches the Store, with the definition for the admitted revision.
    const reached = committedCalls(log).length;
    let result = await od.evaluate(() => window.STBOutdoorPicnic.inquire(window.STBOutdoorPicnic.revision()));
    assert.equal(result.admission.result, 'ADMITTED');
    assert.equal(result.inquiryScope, 'OUTDOOR_COMMITTED');
    const state = await settle(od);
    assert.equal(state.answer.authority, 'CURRENT');
    assert.equal(committedCalls(log).length, reached + 1, 'a complete committed revision reaches the Store');
    const sent = committedCalls(log).at(-1).request;
    assert.equal(sent.candidateRevisionId, result.definitionRevisionId);
    assert.deepEqual(sent.payload.definition, await od.evaluate(() => window.STBOutdoorPicnic.request()));
    assert.equal(sent.payload.definitionKind, 'cut_package.v1');
    assert.equal(sent.payload.ruleVersion, '0.1');

    // OUTDOOR_COMMITTED: a missing plan still blocks before the Store, in admit(), and names its owner.
    const before = outdoorCalls(log).length;
    result = await od.evaluate(() => {
      const revision = window.STBOutdoorPicnic.revision();
      delete revision.facts['outdoor.plan'];
      revision.definitionRevisionId += '-without-plan';
      return window.STBOutdoorPicnic.inquire(revision);
    });
    assert.equal(result.admission.result, 'BLOCKED');
    assert.equal(result.admission.reason, 'REQUIRED_FACT_UNSETTLED');
    assert.deepEqual(result.admission.blocking, [{ factId: 'outdoor.plan', owner: 'USER', title: 'Chosen plan', condition: 'MISSING' }]);
    assert.equal(result.request, null);
    await page.waitForTimeout(600);
    assert.equal(outdoorCalls(log).length, before, 'a missing plan never reaches the Store');

    // No Outdoor inquiry, options or committed, admitted or blocked, called the old door.
    assert.deepEqual(await outdoorOldDoorCalls(page), []);

    // Control: the recorder is live. The old door still runs for a direct sendJob call in either scope, and is counted.
    const direct = await od.evaluate(() => Promise.all(['OUTDOOR-PICNIC-OPTIONS', 'OUTDOOR-PICNIC-A-FRAME'].map(configurationId =>
      window.STBStoreClient.sendJob({ projectId: 'outdoor', requestType: 'CUT_PACKAGE_V1', candidateRevisionId: 'control',
        payload: { definition: { configurationId } } }).then(() => 'sent', error => String(error?.message || error)))));
    for (const outcome of direct) assert.match(outcome, /SYSTEM_ADMISSION_/);
    assert.deepEqual(await outdoorOldDoorCalls(page), [
      { projectId: 'outdoor', configurationId: 'OUTDOOR-PICNIC-OPTIONS' },
      { projectId: 'outdoor', configurationId: 'OUTDOOR-PICNIC-A-FRAME' },
    ]);
    assert.deepEqual(errors, []);
  }, null, { [OLD_DOOR]: recordOldDoor });
});

// One revision id per definition sent. The "From" price and the option prices for the same plan at the same length
// are different definitions (the "From" sends no hardware packs); each carries the id of exactly what it sends, and
// an OUTDOOR_OPTIONS answer for one is not current for the other.
test('the "From" and option prices for one plan send different definitions under different revision ids', { timeout: 240000 }, async () => {
  const { admit, inquire, isCurrentAnswer, ADMISSION_RESULT } = await import('../../public-build/shared/tile-host-admission-contract.mjs');
  await withBrowser(async ({ browser, origin, log }) => {
    const { od, errors } = await openOutdoor(browser, origin);
    const plans = await od.evaluate(() => window.STBOutdoorPicnic.plans);
    await until(() => optionsCalls(log).length >= plans.length, 'from prices reached the Store');

    // Same plan, same length: the plan just opened is the one its "From" price was asked for.
    await od.locator('[data-plan="a-frame"]').click();
    await settle(od);
    const picked = await od.evaluate(() => window.STBOutdoorPicnic.optionsRequest());
    await until(() => optionsCalls(log).some(e => isDeepStrictEqual(e.request.payload.definition, picked)), 'option prices reached the Store');
    const option = optionsCalls(log).find(e => isDeepStrictEqual(e.request.payload.definition, picked));
    const from = optionsCalls(log).find(e => !e.request.payload.definition.itemLines
      && isDeepStrictEqual(e.request.payload.definition.cutPackages, picked.cutPackages));
    assert.ok(from, 'the "From" price for this plan at this length was asked');
    assert.ok(picked.itemLines.length > 0, 'the option prices carry the hardware packs; the "From" does not');

    // Different definitions sent, different revision ids; each id is the one on the definition it went out with.
    assert.notDeepEqual(from.request.payload.definition, option.request.payload.definition);
    assert.notEqual(from.request.candidateRevisionId, option.request.candidateRevisionId);
    for (const { request } of [from, option]) assert.equal(request.candidateRevisionId, request.payload.definition.configurationVersion);
    // Across every options inquiry, one id never names two payloads.
    const byId = new Map();
    for (const { request } of optionsCalls(log)) {
      const seen = byId.get(request.candidateRevisionId);
      if (seen) assert.deepEqual(request.payload.definition, seen, request.candidateRevisionId + ' names two definitions');
      else byId.set(request.candidateRevisionId, request.payload.definition);
    }

    // An answer for one does not open the other: the Store's answer to each, under the page's own admission, is
    // current for its own revision only.
    const admitted = ({ request }) => admit({ inquiryScope: 'OUTDOOR_OPTIONS', revision: { definitionRevisionId: request.candidateRevisionId,
      tileId: 'outdoor', facts: { 'outdoor.cut-packages': { value: request.payload.definition.cutPackages, status: 'DERIVED' } } } });
    const fromAdmission = admitted(from), optionAdmission = admitted(option);
    for (const a of [fromAdmission, optionAdmission]) assert.equal(a.admission.result, ADMISSION_RESULT.ADMITTED);
    const { answer: fromAnswer } = await inquire(fromAdmission, () => from.answer);
    const { answer: optionAnswer } = await inquire(optionAdmission, () => option.answer);
    assert.equal(isCurrentAnswer({ admission: fromAdmission, answer: fromAnswer }), true);
    assert.equal(isCurrentAnswer({ admission: optionAdmission, answer: optionAnswer }), true);
    assert.equal(isCurrentAnswer({ admission: optionAdmission, answer: fromAnswer }), false, 'the "From" answer does not open the option prices');
    assert.equal(isCurrentAnswer({ admission: fromAdmission, answer: optionAnswer }), false, 'the option answer does not open the "From"');
    assert.deepEqual(errors, []);
  });
});

// Outdoor 0.3, on the live route against the pinned Store, in both scopes. The page is served with one defect put
// into its own options generator, since nothing outside the page can hand the "From" a body: the A-frame's options
// carry a zero-length part and a package without an id, and the Table + benches "From" goes out under its plan's
// committed configuration id. Each blocks before the Store: the first in admit(), the second in the transport. The
// Table + benches option prices are untouched and still reach the Store. Under OUTDOOR_COMMITTED, a revision with a
// bad part blocks in admit(); a revision whose admitted packages are not the packages the page sends, counted by id,
// blocks in the transport; the complete revision still reaches the Store.
const tamperOutdoorOptions = source => {
  const packages = 'const body={cutPackages:packagesFor(cfg,WOODS.map(w=>w.key))};';
  const id = 'return {configurationId:OPTIONS_CONFIGURATION,';
  assert.equal(source.split(packages).length, 2, 'the options generator builds its packages once');
  assert.equal(source.split(id).length, 2, 'the options generator names its configuration once');
  return source
    .replace(packages, packages + "if(cfg.plan==='a-frame'){body.cutPackages[0].parts[0].lengthIn=0;body.cutPackages[1].packageId=''}")
    .replace(id, "return {configurationId:cfg.plan==='table-benches'&&!hardware?'OUTDOOR-PICNIC-TABLE-BENCHES':OPTIONS_CONFIGURATION,");
};
const partIds = request => request.payload.definition.cutPackages.flatMap(p => p.parts.map(x => x.partId));

test('a bad part or a package mismatch blocks before the Store on the live route, in both scopes; complete inquiries still reach it', { timeout: 240000 }, async () => {
  await withBrowser(async ({ browser, origin, log }) => {
    const { page, frame, od, errors } = await openOutdoor(browser, origin);
    const fromText = key => od.locator(`[data-card="${key}"] [data-from]`).textContent();

    // OUTDOOR_OPTIONS: a zero-length part and a package without an id block in admit() and name the fact and owner.
    await until(async () => /Store unavailable/.test(await fromText('a-frame')), 'A-frame "From" blocked');
    assert.equal(await fromText('a-frame'), 'Store unavailable (Not sent to the Store. Missing: Requested work with real part values · owner PROJECT)');
    // OUTDOOR_OPTIONS: a "From" carrying a committed body never reaches the Store.
    await until(async () => /Store unavailable/.test(await fromText('table-benches')), 'Table + benches "From" blocked');
    assert.equal(await fromText('table-benches'), 'Store unavailable (BODY_NOT_FOR_INQUIRY_SCOPE)');
    await page.waitForTimeout(600);
    assert.deepEqual(outdoorCalls(log), [], 'neither "From" reached the Store');

    // OUTDOOR_OPTIONS: the complete option prices for the plan picked still reach the Store.
    await od.locator('[data-plan="table-benches"]').click();
    await settle(od);
    const picked = await od.evaluate(() => window.STBOutdoorPicnic.optionsRequest());
    await until(() => optionsCalls(log).some(e => isDeepStrictEqual(e.request.payload.definition, picked)), 'option prices reached the Store');
    assert.ok(optionsCalls(log).every(e => !partIds(e.request).includes('TOP-01')), 'no A-frame options reached the Store');

    // OUTDOOR_COMMITTED: the complete revision on screen reached the Store, admitted under profile 0.3.
    const admission = await od.evaluate(() => window.STBOutdoorPicnic.admission());
    assert.equal(admission.admission.result, 'ADMITTED');
    assert.equal(admission.request.profileVersion, '0.4');
    assert.ok(admission.request.facts['outdoor.cut-packages'].length >= 2, 'the plan sends more than one package');
    assert.equal(committedCalls(log).length, 1);
    assert.deepEqual(committedCalls(log)[0].request.payload.definition, await od.evaluate(() => window.STBOutdoorPicnic.request()));

    // OUTDOOR_COMMITTED: a bad part or a package without an id blocks in admit(), before the Store, with the fields.
    const reached = outdoorCalls(log).length;
    for (const [label, fields] of [
      ['zero-length part', ['[0].parts[0].lengthIn']],
      ['part without an id', ['[1].parts[2].partId']],
      ['package without an id', ['[1].packageId']],
    ]) {
      const result = await od.evaluate(label => {
        const revision = window.STBOutdoorPicnic.revision();
        const packages = revision.facts['outdoor.cut-packages'].value;
        if (label === 'zero-length part') packages[0].parts[0].lengthIn = 0;
        if (label === 'part without an id') delete packages[1].parts[2].partId;
        if (label === 'package without an id') packages[1].packageId = '';
        revision.definitionRevisionId += '-' + label.replace(/ /g, '-');
        return window.STBOutdoorPicnic.inquire(revision);
      }, label);
      assert.equal(result.admission.result, 'BLOCKED', label);
      assert.equal(result.admission.reason, 'REQUIRED_FACT_UNSETTLED', label);
      assert.deepEqual(result.admission.blocking, [{ factId: 'outdoor.cut-packages', owner: 'PROJECT',
        title: 'Requested work with real part values', condition: 'INVALID_VALUE', fields }], label);
      assert.equal(result.request, null, label);
      await page.waitForTimeout(500);
      assert.equal(outdoorCalls(log).length, reached, label + ': never reaches the Store');
      assert.equal(await od.locator('#instant [data-not-sent]').textContent(),
        'NOT SENT TO THE STORE. Missing: Requested work with real part values · owner PROJECT', label);
      const inert = Object.fromEntries(steps(await navLine(frame)).map(b => [b.stage, b.inert]));
      assert.deepEqual(inert, { scan: false, configure: false, store: true, request: true, yard: true, record: true }, label);
    }

    // OUTDOOR_COMMITTED: the revision on screen, admitted with packages that are not the ones the page sends, counted by
    // id. An admitted package that is not sent blocks, and so does a sent package that was not admitted, in the
    // transport, before the Store.
    for (const [label, error] of [
      ['admitted package not sent', 'ADMITTED_PACKAGE_NOT_SENT'],
      ['admitted package sent once, admitted twice', 'ADMITTED_PACKAGE_NOT_SENT'],
      ['sent package not admitted', 'SENT_PACKAGE_NOT_ADMITTED'],
    ]) {
      const result = await od.evaluate(label => {
        const revision = window.STBOutdoorPicnic.revision();
        const fact = revision.facts['outdoor.cut-packages'];
        if (label === 'admitted package not sent') fact.value.push({ ...fact.value[0], packageId: fact.value[0].packageId + '|EXTRA' });
        if (label === 'admitted package sent once, admitted twice') fact.value.push(fact.value[0]);
        if (label === 'sent package not admitted') fact.value.pop();
        return window.STBOutdoorPicnic.inquire(revision);
      }, label);
      assert.equal(result.admission.result, 'ADMITTED', label + ': every package and part is real');
      assert.equal(result.inquiryScope, 'OUTDOOR_COMMITTED', label);
      assert.equal(await od.evaluate(() => window.STBOutdoorPicnic.state().error), error, label);
      await page.waitForTimeout(500);
      assert.equal(outdoorCalls(log).length, reached, label + ': never reaches the Store');
      await until(async () => steps(await navLine(frame)).find(b => b.stage === 'request').inert, label + ': Your call inert');
    }

    // The complete revision is admitted and reaches the Store again, and its answer is current.
    await od.evaluate(() => window.STBOutdoorPicnic.inquire(window.STBOutdoorPicnic.revision()));
    const state = await settle(od);
    assert.equal(state.error, null);
    assert.equal(state.answer.authority, 'CURRENT');
    assert.equal(state.answer.inquiryScope, 'OUTDOOR_COMMITTED');
    assert.equal(outdoorCalls(log).length, reached + 1);
    assert.deepEqual(committedCalls(log).at(-1).request.payload.definition, await od.evaluate(() => window.STBOutdoorPicnic.request()));
    assert.deepEqual(errors, []);
  }, null, { 'stb-outdoor-picnic-0.4.html': tamperOutdoorOptions });
});
