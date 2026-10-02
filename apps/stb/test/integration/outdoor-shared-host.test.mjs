// Outdoor on the shared tile host, against the real pinned Store.
// - The host draws Outdoor's one nav line from a validated STB-TILE-HOST-0.1 message the Outdoor frame posts, and the
//   trail contract: the six contract steps, inert steps disabled, exactly one current, and the current step follows
//   the page shown in the frame. A frame speaking for another tile is rejected and the steps go inert.
// - Every Store inquiry is admit() then inquire(), in the outdoor profile's two scopes: OUTDOOR_OPTIONS (the "From"
//   and option prices) and OUTDOOR_COMMITTED (this exact table). A missing profile fact blocks before the Store and
//   names its owner; a complete revision still reaches the Store.
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

async function openOutdoor(browser, origin) {
  const { page, frame, errors } = await openTile(browser, origin, 'Outdoor build');
  const od = await until(() => frameOf(page, 'stb-outdoor-picnic-0.4.html'), 'outdoor frame');
  await until(() => od.evaluate(() => !!window.STBOutdoorPicnic?.hostMessage()), 'outdoor contract loaded');
  await until(async () => (await currentLabels(frame)).join() === '1 · Intent', 'intent drawn');
  return { page, frame, od, errors };
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
  assert.match(shell, /registerTileHost\('outdoor', \{ frame:\(\) => doc\.getElementById\('outdoor-bench-leg-frame'\) \}\)/);

  const page = read('stb-outdoor-picnic-0.4.html');
  assert.equal(page.includes('STB_OUTDOOR_'), false, 'the page speaks only STB-TILE-HOST-0.1 to the host');
  assert.equal(/\bsend\(/.test(page), false, 'no Store send outside inquire()');
  // One Store handoff on the page: the transport inside inquire(), after admit(), in each scope.
  assert.equal((page.match(/client\.sendJob\(/g) || []).length, 1);
  assert.match(page, /function storeTransport\(definition,got\)\{\s*return request=>\{[\s\S]*?client\.sendJob\(/);
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
    const { page, frame, od, errors } = await openOutdoor(browser, origin);

    // Intent, before a plan is picked: the six contract steps after the Project Library; only Intent usable.
    let message = await od.evaluate(() => window.STBOutdoorPicnic.hostMessage());
    assert.deepEqual(Object.keys(message).sort(), ['interface', 'navigationRequest', 'stage', 'tileId', 'usableSteps']);
    assert.equal(message.interface, 'STB-TILE-HOST-0.1');
    assert.equal(message.tileId, 'outdoor');
    assert.equal(message.stage, 'Intent');
    assert.deepEqual(message.usableSteps, ['Intent']);
    assert.equal(await frame.evaluate(() => document.documentElement.dataset.tileHostRejected ?? null), null);
    let line = await navLine(frame);
    assert.deepEqual(line.map(b => b.label), ['← Project Library', ...TRAIL_STEPS.map((step, i) => `${i + 1} · ${step}`)]);
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
    assert.equal(admission.request.profileVersion, '0.2');
    assert.equal(admission.request.requestType, 'CUT_PACKAGE_V1');
    // What reached the Store is the definition for that admitted revision, with exactly the admitted packages.
    const sent = committedCalls(log).at(-1).request;
    assert.equal(sent.candidateRevisionId, admission.definitionRevisionId);
    assert.equal(sent.payload.definition.configurationVersion, admission.definitionRevisionId);
    assert.deepEqual(sent.payload.definition.cutPackages, admission.request.facts['outdoor.cut-packages']);
    assert.deepEqual(sent.payload.definition, await od.evaluate(() => window.STBOutdoorPicnic.request()));

    // Each declared fact left out blocks before the Store and names its owner.
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
