// Alcove on the shared tile host, against the real pinned Store.
// - The host draws Alcove's one nav line from a validated STB-TILE-HOST-0.1 message and the trail contract: the six
//   contract steps, inert steps disabled, exactly one current, and the current step follows the shown Alcove page.
// - Every Store inquiry is admit() then inquire(): a missing profile fact blocks before the Store and names its owner;
//   a complete revision still reaches the Store, and the Store definition is built only from the admitted request.
// - Material, parents, component programs and the spot demand are checked field by field: a blank or zero material
//   field, a missing parent, a bad program size or, with spotting on, an incomplete spot demand blocks before the Store.
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

const shownPage = frame => live(frame, () => [...document.querySelectorAll('.page.on')].pop()?.id);

// Opens the tile on its Idea intake, takes the Idea line's one way on to Intent, and waits for the answer the page
// asks for on arrival.
async function openAlcove(browser, origin) {
  const { page, frame, errors } = await openTile(browser, origin, 'Critical fit');
  await until(() => live(frame, () => { const s = window.STBAlcoveLive?.state(); return s && !s.asking && s.answer?.authority === 'CURRENT'; }), 'arrival answer');
  await page.waitForTimeout(300);
  await frame.locator('.recovery-nav button.job-idea-onward').click();
  await until(async () => (await shownPage(frame)) === 'alcove-capture', 'Intent shown');
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
    // Alcove opens on its Idea intake: no step bar, and the Idea line's one way on is Intent. The known values are
    // already there, carried to Intent.
    {
      const { page: ideaPage, frame: idea } = await openTile(browser, origin, 'Critical fit');
      await until(async () => (await shownPage(idea)) === 'alcove-idea', 'Idea shown');
      await ideaPage.waitForTimeout(300);
      assert.equal((await live(idea, () => window.STBAlcoveTileHost.hostMessage())).stage, 'Idea');
      assert.deepEqual((await navLine(idea)).map(b => b.label), ['← Project Library', 'Intent']);
      assert.match(await idea.locator('#alcove-idea-known').innerText(), /Height 94½ in floor to ceiling · Width 45½ in opening · Depth 14½ in available at the face/);
      await idea.locator('.recovery-nav button.job-idea-onward').click();
      await until(async () => (await shownPage(idea)) === 'alcove-capture', 'Intent from Idea');
      assert.match(await idea.locator('#alcove-intent-measured').innerText(), /Height 94½ in floor to ceiling · Width 45½ in opening · Depth 14½ in available at the face/);
      // From Intent, Idea is the back control and never current; it returns to the Idea page.
      await idea.locator('.recovery-nav button.job-idea').click();
      await until(async () => (await shownPage(idea)) === 'alcove-idea', 'Idea from Intent');
      await ideaPage.close();
    }

    const { page, frame, errors } = await openAlcove(browser, origin);

    // Intent: Idea, then the six contract steps after the Project Library; Your call waits for a confirmed version's answer.
    let message = await live(frame, () => window.STBAlcoveTileHost.hostMessage());
    assert.deepEqual(Object.keys(message).sort(), ['interface', 'navigationRequest', 'stage', 'tileId', 'usableSteps']);
    assert.equal(message.interface, 'STB-TILE-HOST-0.1');
    assert.equal(message.tileId, 'alcove');
    assert.equal(message.stage, 'Intent');
    assert.deepEqual(message.usableSteps, TRAIL_STEPS.slice(0, 3));
    assert.equal(await live(frame, () => document.documentElement.dataset.tileHostRejected ?? null), null);
    let line = await navLine(frame);
    assert.deepEqual(line.map(b => b.label), ['← Project Library', 'Idea', ...TRAIL_STEPS.map((step, i) => `${i + 1} · ${step}`)]);
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
    assert.equal(admission.request.profileVersion, '0.3');
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

// Material, parents, component programs and the spot demand are checked field by field, on the live route: each
// malformed case is one edit to the page's own revision, sent through the page's one inquiry path; it blocks in admit()
// before the Store and names the fact's owner and the fields. The complete revision still reaches the Store, spotting
// off or on. Only the fields the page already emits are checked; with spotting off, no spot is asked for or sent.
test('a blank or zero material field, a missing parent, a bad program size or an incomplete spot demand blocks before the Store', { timeout: 300000 }, async () => {
  await withBrowser(async ({ browser, origin, log }) => {
    const { page, frame, errors } = await openAlcove(browser, origin);
    const idle = label => until(async () => { const s = await live(frame, () => window.STBAlcoveLive.state()); return !s.asking && s.answer?.authority === 'CURRENT' ? s : null; }, label);

    // The revision as the page emits it, spotting off.
    const off = await live(frame, () => window.STBAlcoveLive.revision());
    assert.deepEqual(Object.keys(off.facts['alcove.material'].value).sort(), ['form', 'grade', 'nominalT', 'nominalW', 'species']);
    assert.deepEqual(off.facts['alcove.board-requirements'].value.map(r => [r.requirementId, r.requiredOps]),
      [['ALCOVE-UPRIGHT-PARENTS', ['CROSSCUT']], ['ALCOVE-SHELF-PARENTS', ['CROSSCUT']]]);
    assert.deepEqual([...new Set(off.facts['alcove.component-programs'].value.map(p => p.requirementId))], ['ALCOVE-UPRIGHT-PARENTS', 'ALCOVE-SHELF-PARENTS']);
    assert.deepEqual(off.facts['alcove.spot-demand'].value,
      { enabled: false, mode: 'SPOT_ON_LOCATION', toolDiameterIn: 0.1875, source: 'SHELF_ELEVATIONS', features: [] });

    // One edit to the page's own revision: set or delete a field of the fact, set or delete a field of one list item,
    // keep only the list items for one parent, or replace the whole value.
    const ask = (factId, edit, tag) => live(frame, ({ factId, edit, tag }) => {
      const r = window.STBAlcoveLive.revision();
      const f = r.facts[factId];
      if (edit.replace !== undefined) f.value = edit.replace;
      else if (edit.only) f.value = f.value.filter(item => item.requirementId === edit.only);
      else if (edit.item) { const [i, key, value] = edit.item; if (edit.del) delete f.value[i][key]; else f.value[i][key] = value; }
      else if (edit.del) delete f.value[edit.del];
      else f.value[edit.set[0]] = edit.set[1];
      r.definitionRevisionId += '-' + tag;
      return window.STBAlcoveLive.inquire(r);
    }, { factId, edit, tag });
    const OWNERS = {
      'alcove.material': ['PROJECT', 'Material demand'],
      'alcove.board-requirements': ['PROJECT', 'Upright and shelf parent responsibilities'],
      'alcove.component-programs': ['PROJECT', 'Component programs for every parent'],
      'alcove.spot-demand': ['USER', 'Pilot spot demand, on or off'],
    };
    const blocks = async CASES => {
      const before = alcoveCalls(log).length;
      for (const [factId, edit, fields, tag] of CASES) {
        const [owner, title] = OWNERS[factId];
        const result = await ask(factId, edit, tag);
        assert.equal(result.admission.result, 'BLOCKED', tag);
        assert.equal(result.admission.reason, 'REQUIRED_FACT_UNSETTLED', tag);
        assert.deepEqual(result.admission.blocking, [{ factId, owner, title, condition: 'INVALID_VALUE', fields }], tag);
        assert.equal(result.request, null, tag);
        assert.equal(await frame.locator('#p-price').textContent(), 'NOT SENT TO THE STORE', tag);
        assert.equal(await frame.locator('#p-basis').textContent(), 'Not sent to the Store. Missing: ' + title + ' · owner ' + owner, tag);
        const inert = Object.fromEntries(steps(await navLine(frame)).map(b => [b.stage, b.inert]));
        assert.deepEqual(inert, { scan: false, configure: false, store: true, request: true, yard: true, record: true }, tag);
      }
      await page.waitForTimeout(500);
      assert.equal(alcoveCalls(log).length, before, 'no malformed revision reached the Store');
    };
    // The complete page revision reaches the Store, and the definition on the wire carries the checked facts as stated.
    const reaches = async label => {
      const before = alcoveCalls(log).length;
      const revision = await live(frame, () => window.STBAlcoveLive.revision());
      const result = await live(frame, r => window.STBAlcoveLive.inquire(r), revision);
      assert.equal(result.admission.result, 'ADMITTED', label);
      await idle(label);
      assert.equal(alcoveCalls(log).length, before + 1, label + ': reaches the Store');
      const sent = alcoveCalls(log).at(-1).request.payload.definition;
      assert.deepEqual(sent.materialDemand, revision.facts['alcove.material'].value, label);
      assert.deepEqual(sent.boardRequirements, revision.facts['alcove.board-requirements'].value, label);
      assert.deepEqual(sent.componentPrograms, revision.facts['alcove.component-programs'].value, label);
      assert.deepEqual(sent.spotDemand, revision.facts['alcove.spot-demand'].value, label);
      return sent;
    };

    await blocks([
      // Material: species and form nonempty text, nominalT and nominalW above 0. Owner PROJECT.
      ...['species', 'form'].flatMap(field => [
        ['alcove.material', { set: [field, ''] }, [field], `blank-${field}`],
        ['alcove.material', { set: [field, '  '] }, [field], `space-${field}`],
        ['alcove.material', { del: field }, [field], `no-${field}`],
      ]),
      ...['nominalT', 'nominalW'].flatMap(field => [
        ['alcove.material', { set: [field, 0] }, [field], `zero-${field}`],
        ['alcove.material', { set: [field, -1] }, [field], `negative-${field}`],
        ['alcove.material', { del: field }, [field], `no-${field}`],
      ]),
      // Parents: both there, each with operations. Owner PROJECT.
      ['alcove.board-requirements', { only: 'ALCOVE-UPRIGHT-PARENTS' }, ['[requirementId=ALCOVE-SHELF-PARENTS]'], 'no-shelf-parent'],
      ['alcove.board-requirements', { only: 'ALCOVE-SHELF-PARENTS' }, ['[requirementId=ALCOVE-UPRIGHT-PARENTS]'], 'no-upright-parent'],
      ['alcove.board-requirements', { item: [1, 'requiredOps', []] }, ['[1].requiredOps'], 'shelf-no-ops'],
      ['alcove.board-requirements', { item: [0, 'requiredOps'], del: true }, ['[0].requiredOps'], 'upright-ops-missing'],
      // Programs: both parents have one; each has its ids and a length and width above 0. Owner PROJECT.
      ['alcove.component-programs', { only: 'ALCOVE-UPRIGHT-PARENTS' }, ['[requirementId=ALCOVE-SHELF-PARENTS]'], 'no-shelf-program'],
      ['alcove.component-programs', { only: 'ALCOVE-SHELF-PARENTS' }, ['[requirementId=ALCOVE-UPRIGHT-PARENTS]'], 'no-upright-program'],
      ['alcove.component-programs', { item: [0, 'finishedLengthIn', 0] }, ['[0].finishedLengthIn'], 'zero-length'],
      ['alcove.component-programs', { item: [4, 'finishedWidthIn', 0] }, ['[4].finishedWidthIn'], 'zero-width'],
      ['alcove.component-programs', { item: [4, 'finishedLengthIn', -1] }, ['[4].finishedLengthIn'], 'negative-length'],
      ['alcove.component-programs', { item: [1, 'finishedWidthIn'], del: true }, ['[1].finishedWidthIn'], 'no-width'],
      ['alcove.component-programs', { item: [2, 'componentId', ''] }, ['[2].componentId'], 'blank-component-id'],
      // Spot demand: on or off is a boolean. Owner USER.
      ['alcove.spot-demand', { set: ['enabled', 'no'] }, ['enabled'], 'spot-enabled-text'],
    ]);
    // The complete revision, spotting off, reaches the Store; no spot is invented on the wire.
    let sent = await reaches('spotting off');
    assert.equal(sent.spotDemand.enabled, false);
    assert.deepEqual(sent.spotDemand.features, []);
    assert.equal(sent.componentPrograms.flatMap(p => p.features).some(f => f.kind === 'SPOT_ON_LOCATION'), false, 'spotting off sends no spot');

    // Spotting on, through the page's own control: the page states mode, tool and features.
    await frame.locator('#c-pilot-shelves').evaluate(el => el.click());
    const on = await until(async () => { const r = await live(frame, () => window.STBAlcoveLive.revision()); return r.facts['alcove.spot-demand'].value.enabled ? r : null; }, 'spotting on');
    await idle('spotting on, asked');
    assert.ok(on.facts['alcove.spot-demand'].value.features.length > 0);
    await blocks([
      // Mode exactly SPOT_ON_LOCATION, a tool above 0, and features a list. Owner USER.
      ...['DRILL', 'spot_on_location', ' SPOT_ON_LOCATION ', ''].map(mode =>
        ['alcove.spot-demand', { set: ['mode', mode] }, ['mode'], `spot-mode-${mode.trim() || 'blank'}`]),
      ['alcove.spot-demand', { del: 'mode' }, ['mode'], 'spot-no-mode'],
      ['alcove.spot-demand', { set: ['toolDiameterIn', 0] }, ['toolDiameterIn'], 'spot-zero-tool'],
      ['alcove.spot-demand', { del: 'toolDiameterIn' }, ['toolDiameterIn'], 'spot-no-tool'],
      ['alcove.spot-demand', { set: ['features', null] }, ['features'], 'spot-features-null'],
      ['alcove.spot-demand', { del: 'features' }, ['features'], 'spot-no-features'],
      ['alcove.spot-demand', { replace: { enabled: true } }, ['mode', 'toolDiameterIn', 'features'], 'spot-on-empty'],
    ]);
    // The complete revision, spotting on, reaches the Store with its spots.
    sent = await reaches('spotting on');
    assert.equal(sent.spotDemand.enabled, true);
    assert.equal(sent.spotDemand.mode, 'SPOT_ON_LOCATION');
    assert.deepEqual(sent.spotDemand.features, on.facts['alcove.spot-demand'].value.features);

    // Spotting off again: admitted and no spot is sent.
    await frame.locator('#c-pilot-shelves').evaluate(el => el.click());
    await until(async () => !(await live(frame, () => window.STBAlcoveLive.revision())).facts['alcove.spot-demand'].value.enabled, 'spotting off');
    await idle('spotting off, asked');
    sent = await reaches('spotting off again');
    assert.equal(sent.spotDemand.enabled, false);
    assert.deepEqual(sent.spotDemand.features, []);
    assert.equal(sent.componentPrograms.flatMap(p => p.features).some(f => f.kind === 'SPOT_ON_LOCATION'), false, 'spotting off sends no spot');
    await until(async () => !steps(await navLine(frame)).find(b => b.stage === 'store').inert, 'The Store answers usable');
    assert.deepEqual(errors, []);
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
