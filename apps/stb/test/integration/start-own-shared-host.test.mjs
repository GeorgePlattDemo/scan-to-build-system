// Start your own on the shared tile host, against the real pinned Store.
// - Start your own opens on Intent, step 1 (the trail contract's one opensOn exception). Intent has the Store lookup
//   beside the wood, Job 1's tools and the tool box, and a frame of the wood and tools it takes to the bench.
//   Idea, the Job 1 picture and one line, is one back control away and shows no numbered step.
// - A wood change shows its price on the bench. ITEM LOOKUP asks the hosted Store's offering service, once per
//   LOOK UP or Enter; showing results changes nothing, and USE SKU applies Job 1's woods rule. No browser fallback.
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

import { withBrowser, openTile, STORE_PIN } from './helpers.mjs';

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
const offeringCalls = log => log.filter(e => e.path === '/api/store-zero/offering');
// Start your own's /job requests. (The shared home's Outdoor tile asks /job for its own options; that is not this tile.)
const jobCalls = log => log.filter(e => e.path === '/api/store-zero/job' && e.request.projectId === 'start-own');
const live = (frame, fn, arg) => frame.evaluate(fn, arg);
const bench = page => page.frames().find(f => f.url().includes('three-frames.html'));

// Start your own opens on Intent. Nothing is clicked to get there.
async function landOnIntent(frame) {
  await until(async () => (await currentLabels(frame)).join() === '1 · Intent', 'opens on 1 · Intent');
}
async function openStartOwn(browser, origin) {
  const { page, frame, errors } = await openTile(browser, origin, 'Start your own');
  await until(async () => bench(page) && await bench(page).$('#stb-confirm-store'), 'Start your own page');
  await landOnIntent(frame);
  // Intent states the wood: SPF, shown in its handoff frame. The bench has no wood choice, so its revision is complete.
  await benchAdmitted(frame);
  assert.equal(await live(frame, () => window.STBStartOwnLive.revision().facts['start-own.material']?.value?.species ?? null), 'spf');
  return { page, frame, errors };
}
async function benchAdmitted(frame) {
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

test('the shell does not read the proof frame window for state three-frames.html never had', () => {
  const shell = read('system-build-current.html');
  for (const name of ['captureStartOwnProof', 'STBProjectBridge', 'contentWindow?.S', 'proofDecisions', 'proofActions', 'classifyStartOwnDecision']) {
    assert.equal(shell.includes(name), false, name + ' is still in the shell');
  }
  // three-frames.html has one script, which draws the bench geometry from the shell's message. It keeps no window
  // state and reads no document but its own.
  const scripts = read('three-frames.html').match(/<script[\s\S]*?<\/script>/g) || [];
  assert.equal(scripts.length, 1, 'three-frames.html carries one script');
  assert.doesNotMatch(scripts[0], /window\.[\w$]+\s*=[^=]/, 'the bench script sets no window state');
  for (const reach of ['parent.document', 'top.', 'opener', 'frameElement', 'contentDocument', 'contentWindow']) {
    assert.equal(scripts[0].includes(reach), false, 'the bench script reaches ' + reach);
  }
});

test('the bench page draws its own parts, cuts and spots for a complete revision; the shell does not write them (R28)', { timeout: 240000 }, async () => {
  const shell = read('system-build-current.html');
  assert.equal(shell.includes('stb-bench-dynamic-geometry'), false, 'the shell does not reach #stb-bench-dynamic-geometry');
  assert.equal(shell.includes('overlay.innerHTML'), false, 'the shell does not write the bench geometry');
  assert.match(shell, /proofFrame\.contentWindow\?\.postMessage\(\{\s*type:'STB_BENCH_GEOMETRY'/);

  await withBrowser(async ({ browser, origin }) => {
    const { page, frame, errors } = await openStartOwn(browser, origin);
    await frame.locator('.recovery-nav button[data-job-project="start-own"][data-journey-stage="configure"]').click();
    await until(async () => (await currentLabels(frame)).join() === '2 · The bench', 'bench current');
    await benchAdmitted(frame);

    const geometry = () => bench(page).$eval('#stb-bench-dynamic-geometry', g => ({
      texts: [...g.querySelectorAll('text')].map(t => t.textContent),
      cuts: g.querySelectorAll('line[stroke-width="5"]').length,
      spots: g.querySelectorAll('circle[r="12"]').length,
    }));
    let drawn = await until(async () => { const g = await geometry(); return g.texts.includes('PART 2') && g; }, 'bench parts drawn');
    assert.deepEqual(drawn.texts, ['PART 1', '16 in', 'PART 2', '16 in', '1', '2', '3']);
    assert.equal(drawn.cuts, 3);
    assert.equal(drawn.spots, 2);
    assert.equal(await bench(page).locator('#stb-bench-dynamic-geometry text', { hasText: 'PART 1' }).isVisible(), true);
    assert.equal(await bench(page).locator('#stb-bench-static-parts').isVisible(), false, 'the static drawing gives way');

    // A changed definition is drawn again from the next message.
    await bench(page).locator('#stb-bench-controls [data-length="18"]').click();
    drawn = await until(async () => { const g = await geometry(); return g.texts.includes('18 in') && g; }, 'bench redrawn at 18 in');
    assert.deepEqual(drawn.texts, ['PART 1', '18 in', 'PART 2', '18 in', '1', '2', '3']);
    assert.deepEqual(errors, []);
  });
});

test('the bench page places its own spare and remain labels for a complete revision; the shell does not (R30)', { timeout: 240000 }, async () => {
  const shell = read('system-build-current.html');
  assert.equal(shell.includes("getElementById('stb-bench-spare-label')"), false, 'the shell does not read #stb-bench-spare-label');
  assert.equal(shell.includes("getElementById('stb-bench-remain-label')"), false, 'the shell does not read #stb-bench-remain-label');
  assert.doesNotMatch(shell, /(spare|remain)Label\.setAttribute\('x'/, 'the shell does not place the spare or remain label');
  assert.equal((shell.match(/type:'STB_BENCH_GEOMETRY'/g) || []).length, 1, 'the shell posts one geometry message');

  await withBrowser(async ({ browser, origin }) => {
    const { page, frame, errors } = await openStartOwn(browser, origin);
    await frame.locator('.recovery-nav button[data-job-project="start-own"][data-journey-stage="configure"]').click();
    await until(async () => (await currentLabels(frame)).join() === '2 · The bench', 'bench current');
    await benchAdmitted(frame);

    const labels = () => bench(page).evaluate(() => Object.fromEntries(['spare', 'remain'].map(name => {
      const el = document.getElementById('stb-bench-' + name + '-label');
      return [name, { x: Number(el.getAttribute('x')), text: el.textContent }];
    })));
    // 60 in board, two 16 in parts: the parts end at x 477.3, so spare centers at 504.7 and remain at 668.7.
    let placed = await until(async () => { const l = await labels(); return /spare$/.test(l.spare.text) && !l.spare.text.startsWith('Store') && l; }, 'spare label worded');
    assert.ok(Math.abs(placed.spare.x - 504.667) < 0.01, 'spare x ' + placed.spare.x);
    assert.ok(Math.abs(placed.remain.x - 668.667) < 0.01, 'remain x ' + placed.remain.x);
    assert.match(placed.remain.text, /remains · .* retained-control minimum · .* spare · Store returned$/);
    assert.equal(await bench(page).locator('#stb-bench-spare-label').isVisible(), true);
    assert.equal(await bench(page).locator('#stb-bench-remain-label').isVisible(), true);

    // A changed definition places them again from the next message: at 18 in the Store picks a 72 in board, the
    // parts end at x 450, so spare centers at 491 and remain at 655.
    await bench(page).locator('#stb-bench-controls [data-length="18"]').click();
    placed = await until(async () => { const l = await labels(); return Math.abs(l.spare.x - 491) < 0.01 && l; }, 'labels placed again at 18 in');
    assert.ok(Math.abs(placed.remain.x - 655) < 0.01, 'remain x ' + placed.remain.x);
    assert.match(placed.spare.text, /^\S+ in spare$/);
    assert.match(placed.remain.text, /remains · .* retained-control minimum · .* spare · Store returned$/);
    assert.deepEqual(errors, []);
  });
});

test('Start your own opens on Intent: the wood and its tools go to the bench; Idea is one back control away', { timeout: 240000 }, async () => {
  await withBrowser(async ({ browser, origin, log }) => {
    const { page, frame, errors } = await openTile(browser, origin, 'Start your own');
    await until(async () => bench(page) && await bench(page).$('#stb-confirm-store'), 'Start your own page');

    // Entry: the tile lands on 1 · Intent. Idea is the unnumbered back control, never current.
    await landOnIntent(frame);
    let message = await live(frame, () => window.STBStartOwnLive.hostMessage());
    assert.equal(message.tileId, 'start-own');
    assert.equal(message.stage, 'Intent');
    assert.equal(await live(frame, () => document.documentElement.dataset.tileHostRejected ?? null), null);
    assert.deepEqual((await navLine(frame)).map(b => b.label), ['← Project Library', 'Idea', ...TRAIL_STEPS.map((step, i) => `${i + 1} · ${step}`)]);
    assert.deepEqual(await currentLabels(frame), ['1 · Intent']);
    assert.equal(await shownPage(frame), 'start-own-live');
    assert.equal(await live(frame, () => document.getElementById('start-own-live').dataset.revStage), 'intent');
    assert.equal(await bench(page).locator('#stb-start-intent-screen').isHidden(), false);
    assert.equal(await bench(page).locator('#stb-start-idea-screen').isHidden(), true);
    assert.equal(await bench(page).locator('#stb-start-bench-screen').isHidden(), true);
    const intent = bench(page).locator('#stb-start-intent-screen');

    // The top: the title line, the hook, the six Store boards in their order, the 2×4 ringed, and the Store lookup.
    assert.equal((await intent.locator('.stb-title-row').innerText()).replace(/\s+/g, ' ').trim(),
      'Start your own project Nothing on the list fits? Fine. Here’s how we help.');
    assert.equal(await intent.locator('.stb-grab').innerText(), 'Grab a board from the Store and tell us what you want done to it.');
    assert.deepEqual(await intent.locator('.boards .board > p').allInnerTexts(), ['1×6 pine', '1×6 poplar', '1×6 cherry', '1×8 oak', '2×4 stud', '¾ plywood']);
    const formRing = intent.locator('#stb-store-board-2x4 .stb-form-ring ellipse');
    assert.equal(await formRing.isVisible(), true, 'the 2×4 is ringed');
    assert.equal(await formRing.getAttribute('stroke'), '#d1242f', 'in the photograph ring red');
    assert.equal(await intent.locator('.stb-form-ring').count(), 1, 'only the 2×4 is ringed');
    assert.equal(await intent.locator('.boards #stb-intent-sku').isVisible(), true, 'the Store lookup sits with the wood');
    assert.equal(await intent.locator('label[for="stb-intent-sku"]').innerText(), 'ITEM LOOKUP');
    assert.equal(await bench(page).locator('#stb-intent-sku').count(), 1, 'one Store lookup');
    assert.equal(await intent.locator('.stb-user1-body #stb-intent-sku, .stb-user1-body input').count(), 0, 'no lookup left by the picture');
    // Intent has no wood buttons. It states the wood as SPF in its handoff frame; its lookup can state the other wood.
    assert.equal(await intent.locator('[data-species], [data-intent-species]').count(), 0);
    assert.equal(await live(frame, () => window.STBStartOwnLive.revision().facts['start-own.material']?.value?.species ?? null), 'spf');
    assert.deepEqual(await live(frame, () => window.STBStartOwnLive.admission().admission.blocking), []);
    assert.equal(await intent.locator('#stb-store-glossary-status').isHidden(), true, 'every Store board is backed');
    assert.deepEqual(await intent.locator('input:visible').evaluateAll(els => els.map(e => e.id)), ['stb-intent-sku', 'stb-add-tool-input']);
    // The full list opens, changes nothing, and CLOSE shuts it.
    const revisionBefore = await live(frame, () => window.STBStartOwnLive.revision().definitionRevisionId);
    assert.equal(await intent.locator('#stb-ops-list').isHidden(), true);
    await intent.locator('#stb-ops-open').click();
    assert.equal(await intent.locator('#stb-ops-list').isVisible(), true);
    assert.equal(await intent.locator('#stb-ops-open').getAttribute('aria-expanded'), 'true');
    assert.equal(await intent.locator('#stb-ops-list input:not([disabled])').count(), 0, 'every box on the full list is disabled');
    await intent.locator('#stb-ops-close').click();
    assert.equal(await intent.locator('#stb-ops-list').isHidden(), true);
    assert.equal(await intent.locator('#stb-ops-open').getAttribute('aria-expanded'), 'false');
    assert.equal(await live(frame, () => window.STBStartOwnLive.revision().definitionRevisionId), revisionBefore, 'the full list changed the definition');

    // Intent, said once; the ways to add definition are not numbered steps; Job 1's tools and the tool box.
    assert.equal(await intent.locator('.stb-intent-define h2').innerText(), 'This is Intent.');
    assert.equal(await intent.locator('.stb-intent-body').innerText(),
      'Starting with your scan, picture, or idea from the previous page, this is where the job starts to get defined. Choose the wood and add the tools this job needs here. The Bench can change the values those tools carry, but it does not create new tools. When you’re ready, bring the wood choice and tools to the Bench.');
    assert.deepEqual(await intent.locator('.stb-ways b').allInnerTexts(), [
      'Add pieces as you go.', 'Just tell us in plain words.', 'Type the numbers.', 'Send a scan or a photo.',
      'Draw it here.', 'Bring what you already have.']);
    assert.equal(await intent.locator('ol, .morelist').count(), 0, 'no numbered list of ways');
    assert.equal(await intent.locator('.stb-ways button, .stb-ways input, .stb-ways a').count(), 0, 'the ways are not controls');
    assert.deepEqual(await intent.locator('.stb-added-tools > span:not(#stb-added-tools)').allInnerTexts(), ['Cut', 'At an angle', 'Spot drill']);
    assert.match(await intent.innerText(), /Add a tool the job needs to define/);
    assert.doesNotMatch(await intent.innerText(), /configurator/i);

    // The handoff frame: the Job 1 picture with its ring, the wood, and each tool with what it carries.
    const carry = intent.locator('.stb-user1-body');
    const job1Src = await carry.locator('.stb-user1-img').getAttribute('src');
    assert.match(job1Src, /^data:image\/webp;base64,/);
    const pickRing = carry.locator('.stb-pick-ring circle');
    assert.equal(await pickRing.isVisible(), true);
    assert.equal(await pickRing.getAttribute('stroke'), '#d1242f');
    assert.equal(await bench(page).locator('#stb-carry-wood').innerText(), '2×4 SPF', 'Intent states the wood');
    const bubbles = async () => carry.locator('.stb-tool-bubble').evaluateAll(els => els.map(e => [e.querySelector('b').textContent, e.querySelector('span').textContent]));
    assert.deepEqual(await bubbles(), [['Cut', '2 parts · 16 in each'], ['At an angle', '30° ends'], ['Spot drill', '8 in from either end']]);
    assert.equal(await bench(page).locator('#stb-user1-lineage').innerText(), 'Spot drill = 16 ÷ 2 = 8 in from either finished end.');
    assert.equal(await carry.locator('input, [data-species]').count(), 0, 'the handoff frame is not another picker');

    // What is typed becomes a control for this job: on Intent, in the handoff frame, and on the bench.
    assert.equal(await bench(page).locator('#stb-add-tool').isDisabled(), true, 'nothing typed: ADD is inert');
    await bench(page).locator('#stb-add-tool-input').fill('Countersink');
    await bench(page).locator('#stb-add-tool').click();
    assert.deepEqual(await bench(page).locator('#stb-added-tools span').allInnerTexts(), ['Countersink']);
    assert.deepEqual((await bubbles()).at(-1), ['Countersink', 'value set at the bench']);

    // The button takes the wood and tools to the bench.
    assert.equal(await carry.locator('.stb-bench-button').innerText(), 'TAKE THE WOOD AND TOOLS TO THE BENCH →');
    await carry.locator('.stb-bench-button').click();
    await until(async () => (await currentLabels(frame)).join() === '2 · The bench', 'bench current');
    assert.equal(await bench(page).locator('#stb-start-bench-screen').isHidden(), false);
    const control = bench(page).locator('#stb-bench-added-controls [data-added-control="Countersink"]');
    assert.equal(await control.locator('h2').innerText(), 'Countersink?');
    assert.deepEqual(await control.locator('button.on').allInnerTexts(), ['ON']);
    const before = await live(frame, () => window.STBStartOwnLive.revision().definitionRevisionId);
    await control.locator('[data-added-control-value="off"]').click();
    await until(async () => (await live(frame, () => window.STBStartOwnLive.revision().definitionRevisionId)) !== before, 'a new revision');
    assert.deepEqual(await control.locator('button.on').allInnerTexts(), ['OFF']);
    assert.match(await bench(page).locator('#stb-before-send').innerText(), /Countersink \(off\) — are part of this version; the Store is not asked about them\./);
    // The bench works the tools Intent made; it has nowhere to make one.
    assert.equal(await bench(page).locator('#stb-start-bench-screen input[type="text"], #stb-start-bench-screen #stb-add-tool').count(), 0);
    // The picture carries onto the bench; Intent's live wood and tools do not come with it as stale copies.
    assert.equal(await bench(page).locator('#stb-bench-intent-slot .stb-user1-img').getAttribute('src'), job1Src);
    assert.equal(await bench(page).locator('#stb-bench-intent-slot .stb-carry-live, #stb-bench-intent-slot .stb-bench-button').count(), 0);
    // The bench has no wood choice: the wood is stated on Intent.
    assert.equal(await bench(page).locator('#stb-start-bench-screen [data-species], #stb-bench-species').count(), 0);

    // A value the bench revises comes back to Intent's frame: 18 in, its angle and its spot.
    await bench(page).locator('#stb-bench-controls [data-length="18"]').click();
    await frame.locator('.recovery-nav button[data-job-project="start-own"][data-journey-stage="scan"]').click();
    await until(async () => (await currentLabels(frame)).join() === '1 · Intent', 'back on Intent');
    assert.deepEqual(await bubbles(), [['Cut', '2 parts · 18 in each'], ['At an angle', '26.4° ends'], ['Spot drill', '9 in from either end'], ['Countersink', 'value set at the bench']]);
    assert.equal(await bench(page).locator('#stb-user1-lineage').innerText(), 'Spot drill = 18 ÷ 2 = 9 in from either finished end.');

    // Idea: the back control, from Intent and from the bench. The picture and one line; no step, no machinery.
    const toIdea = async label => {
      await frame.locator('.recovery-nav button.job-idea').click();
      await until(async () => (await live(frame, () => window.STBStartOwnLive.hostMessage())).stage === 'Idea', label + ': on Idea');
      assert.equal(await bench(page).locator('#stb-start-idea-screen').isHidden(), false, label);
      assert.equal(await bench(page).locator('#stb-start-intent-screen').isHidden(), true, label);
      assert.deepEqual((await navLine(frame)).map(b => b.label), ['← Project Library', 'Intent'], label);
      assert.deepEqual(await currentLabels(frame), [], label + ': no numbered step is current');
    };
    const backToIntent = async label => {
      await frame.locator('.recovery-nav button.job-idea-onward').click();
      await until(async () => (await currentLabels(frame)).join() === '1 · Intent', label + ': back on Intent');
      assert.equal(await bench(page).locator('#stb-start-intent-screen').isHidden(), false, label);
    };
    await toIdea('from Intent');
    const idea = bench(page).locator('#stb-start-idea-screen');
    assert.equal(await idea.locator('h1').innerText(), 'Idea · what you brought');
    assert.match(await idea.innerText(), /What you bring lands here and ends at Intent\. Idea is not a step\./);
    assert.equal(await idea.locator('.stb-idea-line').innerText(), 'Two broken crossmembers, both cut from a 2×4.');
    assert.equal(await idea.locator('img').count(), 1);
    const ideaPicture = await idea.locator('img').evaluate(img => ({
      src: img.src, alt: img.alt, complete: img.complete && img.naturalWidth > 0, box: img.getBoundingClientRect().toJSON(),
      frameBox: img.closest('.frame-in').getBoundingClientRect().toJSON(),
    }));
    assert.equal(ideaPicture.src, job1Src, 'Idea shows the existing Job 1 picture');
    assert.ok(ideaPicture.complete, 'the picture is drawn');
    assert.equal(ideaPicture.alt, 'Two damaged crossmembers under a picnic-table bench.');
    assert.ok(ideaPicture.box.left - ideaPicture.frameBox.left < 30, 'left edge of its frame');
    assert.equal(await idea.locator('input, button, select, [data-species], #stb-intent-sku, #stb-add-tool-input, .stb-tool-bubble').count(), 0, 'no picker, lookup, tool box or tools on Idea');
    assert.doesNotMatch(await idea.innerText(), /\d+\s*in\b|°|\$/, 'no dimensions, angles or prices on Idea');
    await backToIntent('from Idea');
    await frame.locator('.recovery-nav button[data-job-project="start-own"][data-journey-stage="configure"]').click();
    await until(async () => (await currentLabels(frame)).join() === '2 · The bench', 'bench again');
    await toIdea('from the bench');
    await backToIntent('from Idea again');

    assert.equal(startOwnCalls(log).length, 0, 'Idea, Intent and the bench ask the Store nothing');
    assert.deepEqual(errors, []);
    await page.close();
  });
});

// A wood change shows its price on the bench, not only at the Store. The bench price is the Store-issued reference
// for that wood (checked against the pinned Store by test/store/user1-reference-guard.test.mjs); confirming asks the
// Store again and its answer is the same number. A SKU names a real Store item or nothing.
// ITEM LOOKUP: type, press LOOK UP (or Enter), and the hosted Store's offering service answers. USE SKU on one result
// applies Job 1's rule. Returns the answer line after USE SKU.
async function lookUpAndUse(page, log, searchText, storeSku) {
  const before = offeringCalls(log).length;
  await bench(page).locator('#stb-intent-sku').fill(searchText);
  await bench(page).locator('#stb-intent-sku-look').click();
  await until(async () => offeringCalls(log).length === before + 1 &&
    !/Asking/.test(await bench(page).locator('#stb-intent-sku-answer').innerText()), 'Store answered ' + searchText);
  await bench(page).locator(`#stb-intent-sku-results li[data-store-sku="${storeSku}"] button`).click();
  return bench(page).locator('#stb-intent-sku-answer').innerText();
}

test('a wood change updates the bench price; ITEM LOOKUP finds a real Store item and invents no species', { timeout: 240000 }, async () => {
  await withBrowser(async ({ browser, origin, log }) => {
    const { page, frame, errors } = await openStartOwn(browser, origin);
    const priceLine = () => bench(page).locator('#stb-bench-price-line').innerText();
    const total = () => bench(page).locator('#stb-price-total').innerText();
    const species = () => live(frame, () => window.STBStartOwnLive.revision().facts['start-own.material']?.value?.species ?? null);
    // Intent states SPF from the start, so the bench prices it before anything is clicked.
    assert.equal(await species(), 'spf');
    assert.equal(await priceLine(), '16 in braces · 30° ends · SPF · 5-foot 2×4 · $8.54 Store reference price ($2.61 wood).');
    assert.equal(await total(), '$8.54');

    const lookUp = (searchText, storeSku = searchText.toUpperCase()) => lookUpAndUse(page, log, searchText, storeSku);
    // Intent states the wood through its Store lookup; the bench shows its price.
    assert.equal(await lookUp('stb-zero-spf-2x4-96-001'),
      'STB-ZERO-SPF-2X4-96-001 · 2x4 x 96 in SPF construction. This job’s wood is now SPF; the Store still picks the board.');
    await until(async () => (await species()) === 'spf', 'SPF stated');
    assert.equal(await priceLine(), '16 in braces · 30° ends · SPF · 5-foot 2×4 · $8.54 Store reference price ($2.61 wood).');
    assert.equal(await total(), '$8.54');

    // Intent's lookup states the other wood: treated SYP has no 5-foot board, so the Store's board and price change with it.
    assert.equal(await lookUp('STB-ZERO-PTAG-2X4-72-001'),
      'STB-ZERO-PTAG-2X4-72-001 · 2x4 x 72 in SYP AC2 #2 Prime AG. This job’s wood is now treated SYP; the Store still picks the board.');
    await until(async () => (await species()) === 'syp-treated', 'treated SYP stated');
    assert.equal(await bench(page).locator('#stb-carry-wood').innerText(), '2×4 treated SYP', 'Intent shows the wood it states');
    await frame.locator('.recovery-nav button[data-job-project="start-own"][data-journey-stage="configure"]').click();
    await until(async () => (await currentLabels(frame)).join() === '2 · The bench', 'bench current');
    assert.equal(await priceLine(), '16 in braces · 30° ends · treated SYP · 6-foot 2×4 · $11.08 Store reference price ($5.15 wood).');
    assert.equal(await total(), '$11.08');
    assert.equal(await bench(page).locator('#stb-basis-sku').innerText(), 'STB-ZERO-PTAG-2X4-72-001');
    assert.match(await bench(page).locator('#stb-bench-board-swap').innerText(), /The Store has no 5-foot treated SYP 2×4; the shortest it offers for this job is a 6-foot 2×4 \(72 in\)\./);
    await bench(page).locator('#stb-bench-controls [data-length="18"]').click();
    await until(async () => (await total()) === '$11.09', '18 in treated SYP priced on the bench');
    await bench(page).locator('#stb-bench-controls [data-length="16"]').click();
    await until(async () => (await total()) === '$11.08', 'back to 16 in');

    // A SKU looks up a real Store item. One of this job's woods states that wood; anything else changes nothing.
    await frame.locator('.recovery-nav button[data-job-project="start-own"][data-journey-stage="scan"]').click();
    await until(async () => (await currentLabels(frame)).join() === '1 · Intent', 'intent current');
    assert.equal(await lookUp('stb-zero-spf-2x4-96-001'),
      'STB-ZERO-SPF-2X4-96-001 · 2x4 x 96 in SPF construction. This job’s wood is now SPF; the Store still picks the board.');
    await until(async () => (await species()) === 'spf', 'SKU states SPF');
    assert.equal(await total(), '$8.54');
    assert.equal(await lookUp('STB-ZERO-WRC-2X4-96-001'),
      'STB-ZERO-WRC-2X4-96-001 · 2x4 x 96 in Western Red Cedar S4S. A real Store Zero item, but not one of this job’s woods. Nothing changed.');
    await bench(page).locator('#stb-intent-sku').fill('STB-ZERO-WALNUT-2X4-96-001');
    await bench(page).locator('#stb-intent-sku-look').click();
    await until(async () => /^No Store Zero item matches/.test(await bench(page).locator('#stb-intent-sku-answer').innerText()), 'no walnut');
    assert.equal(await bench(page).locator('#stb-intent-sku-results li').count(), 0);
    assert.equal(await species(), 'spf', 'no species was invented');
    assert.equal(await lookUp('STB-ZERO-PTAG-2X4-72-001'),
      'STB-ZERO-PTAG-2X4-72-001 · 2x4 x 72 in SYP AC2 #2 Prime AG. This job’s wood is now treated SYP; the Store still picks the board.');
    await until(async () => (await total()) === '$11.08', 'Intent changes the bench price');
    assert.equal(startOwnCalls(log).length, 0, 'the bench price asks the Store nothing');
    assert.equal(jobCalls(log).length, 0, 'ITEM LOOKUP never asks /job');

    // Confirming asks the Store for this revision; its answer is the price the bench showed.
    await frame.locator('.recovery-nav button[data-job-project="start-own"][data-journey-stage="configure"]').click();
    await until(async () => (await currentLabels(frame)).join() === '2 · The bench', 'bench again');
    await bench(page).locator('#stb-confirm-store').click();
    await until(async () => (await currentLabels(frame)).join() === '3 · The Store answers', 'store current');
    const sent = startOwnCalls(log);
    assert.equal(sent.length, 1);
    assert.equal(sent[0].path, '/api/store-zero/job', 'the formal confirm asks /job');
    assert.deepEqual(sent[0].request.payload.line.materialDemand, { species: 'syp-treated', form: 'board', nominalT: 2, nominalW: 4 });
    assert.equal(sent[0].answer.rawEstimate.totals.Q, 11.08);
    assert.match(await frame.locator('#proof-store-q').innerText(), /11\.08/);
    assert.deepEqual(errors, []);
    await page.close();
  });
});

test('ITEM LOOKUP searches the live pinned Store Zero catalog by keyword or SKU; searching alone changes nothing', { timeout: 240000 }, async () => {
  await withBrowser(async ({ browser, origin, log }) => {
    const { page, frame, errors } = await openStartOwn(browser, origin);
    const b = bench(page);
    const input = b.locator('#stb-intent-sku');
    const lookButton = b.locator('#stb-intent-sku-look');
    const answerLine = () => b.locator('#stb-intent-sku-answer').innerText();
    const rows = () => b.$$eval('#stb-intent-sku-results li', els => els.map(li => ({
      sku: li.dataset.storeSku, title: li.querySelector('b').textContent, line: li.querySelector('span').textContent,
      use: li.querySelector('button').textContent })));
    const state = () => live(frame, () => ({
      revision: window.STBStartOwnLive.revision().definitionRevisionId,
      species: window.STBStartOwnLive.revision().facts['start-own.material']?.value?.species ?? null,
      admission: window.STBStartOwnLive.admission()?.admission?.result,
    }));
    const settle = async n => {
      await until(async () => offeringCalls(log).length === n && !/Asking/.test(await answerLine()), 'Store answered');
      await page.waitForTimeout(300);
      assert.equal(offeringCalls(log).length, n, 'one explicit lookup is one Store request');
    };

    // 1-3: the control as a person sees it; empty input does nothing.
    assert.equal(await b.locator('label[for="stb-intent-sku"]').innerText(), 'ITEM LOOKUP');
    assert.equal(await input.getAttribute('placeholder'), 'Pine, 1 x 6 pine, or Store SKU…');
    assert.equal(await lookButton.innerText(), 'LOOK UP');
    assert.equal(await lookButton.isDisabled(), true);
    await input.press('Enter');
    const before = await state();
    assert.equal(before.species, 'spf', 'Intent states SPF');

    // 4: typing asks the Store nothing.
    await input.pressSequentially('pine', { delay: 30 });
    assert.equal(await lookButton.isDisabled(), false);
    await page.waitForTimeout(500);
    assert.equal(offeringCalls(log).length, 0, 'typing does not call the Store');

    // 5-7, 11: LOOK UP asks /offering exactly once, never /job; pine is many real Store items.
    await lookButton.click();
    await settle(1);
    const call = offeringCalls(log)[0];
    assert.deepEqual(call.request.payload, { searchText: 'pine' });
    assert.equal(call.request.requestType, 'OFFERING_LOOKUP');
    assert.equal(call.request.expectedStorePin, STORE_PIN);
    assert.equal(call.answer.storePin, STORE_PIN);
    assert.equal(jobCalls(log).length, 0, 'a lookup never asks /job');
    const pine = await rows();
    assert.equal(pine.length, 20);
    assert.equal(await answerLine(), call.answer.totalMatches + ' Store Zero items match. Showing the first 20 — refine your search.');
    assert.ok(call.answer.totalMatches > 20);
    assert.deepEqual(pine.map(r => r.sku), call.answer.rawOfferings.map(r => r.storeSku), 'the rows are the Store answer');
    assert.deepEqual(pine[0], { sku: 'STB-ZERO-PINE-1X4-72-001', title: '1x4 x 72 in select pine S4S', line: 'STB-ZERO-PINE-1X4-72-001 · $8.65', use: 'USE SKU' });
    for (const row of pine) assert.ok(row.line.startsWith(row.sku), 'each row shows its Store SKU');

    // 12: search alone changes nothing about Job 1.
    assert.deepEqual(await state(), before, 'search did not change species, revision or admission');

    // 8: 1 x 6 pine narrows the list (Enter asks too).
    await input.fill('1 x 6 pine');
    await input.press('Enter');
    await settle(2);
    const oneBySix = await rows();
    assert.deepEqual(oneBySix.map(r => r.sku), ['STB-ZERO-PINE-1X6-72-001', 'STB-ZERO-PINE-1X6-96-001', 'STB-ZERO-PINE-1X6-120-001', 'STB-ZERO-PINE-1X6-144-001']);
    assert.equal(oneBySix[1].title, '1x6 x 96 in select pine S4S');
    assert.equal(oneBySix[1].line, 'STB-ZERO-PINE-1X6-96-001 · $20.99');
    assert.equal(await answerLine(), '4 Store Zero items match.');
    assert.equal(await b.locator('#stb-intent-sku-close').isVisible(), true, 'results expose an explicit CLOSE control');
    const answerBeforeClose = await answerLine();
    const searchBeforeClose = await input.inputValue();
    await b.locator('#stb-intent-sku-close').click();
    assert.equal(await b.locator('#stb-intent-sku-results li').count(), 0, 'CLOSE removes the result rows');
    assert.equal(await b.locator('#stb-intent-sku-close').isVisible(), false, 'CLOSE hides with the results');
    assert.equal(await answerLine(), '', 'CLOSE clears the Store answer line');
    assert.equal(await input.inputValue(), searchBeforeClose, 'CLOSE preserves the search text');
    await input.press('Enter');
    await settle(3);
    assert.equal(await b.locator('#stb-intent-sku-close').isVisible(), true, 'a new lookup reopens the closeable results');

    // 15: choosing 1×6 pine shows the real item and leaves Job 1 as it was.
    await b.locator('#stb-intent-sku-results li[data-store-sku="STB-ZERO-PINE-1X6-96-001"] button').click();
    assert.equal(await b.locator('#stb-intent-sku-results li').count(), 0, 'USE SKU closes the result list for an incompatible item');
    assert.equal(await answerLine(), 'STB-ZERO-PINE-1X6-96-001 · 1x6 x 96 in select pine S4S. A real Store Zero item, but not one of this job’s woods. Nothing changed.');
    assert.deepEqual(await state(), before, '1×6 pine did not change Job 1');

    // 9: a partial SKU.
    await input.fill('STB-ZERO-PINE-1X6');
    await lookButton.click();
    await settle(4);
    assert.deepEqual((await rows()).map(r => r.sku), oneBySix.map(r => r.sku));

    // 10, 13: an exact SKU, then USE SKU states SPF through Job 1's rule.
    await input.fill('stb-zero-spf-2x4-96-001');
    await lookButton.click();
    await settle(5);
    assert.deepEqual(await rows(), [{ sku: 'STB-ZERO-SPF-2X4-96-001', title: '2x4 x 96 in SPF construction', line: 'STB-ZERO-SPF-2X4-96-001 · $4.18', use: 'USE SKU' }]);
    assert.equal(await answerLine(), '1 Store Zero item matches.');
    assert.deepEqual(await state(), before, 'rendering a result changes nothing');
    await b.locator('#stb-intent-sku-results li[data-store-sku="STB-ZERO-SPF-2X4-96-001"] button').click();
    assert.equal(await b.locator('#stb-intent-sku-results li').count(), 0, 'USE SKU closes the result list for a compatible item');
    await until(async () => (await state()).species === 'spf', 'USE SKU states SPF');
    assert.equal(await answerLine(), 'STB-ZERO-SPF-2X4-96-001 · 2x4 x 96 in SPF construction. This job’s wood is now SPF; the Store still picks the board.');

    // 16: cedar is a real Store item, outside this job's woods.
    assert.equal(await lookUpAndUse(page, log, 'cedar', 'STB-ZERO-WRC-2X4-96-001'),
      'STB-ZERO-WRC-2X4-96-001 · 2x4 x 96 in Western Red Cedar S4S. A real Store Zero item, but not one of this job’s woods. Nothing changed.');
    assert.equal((await state()).species, 'spf');

    // 14: a treated SYP 2×4 states treated SYP.
    assert.equal(await lookUpAndUse(page, log, '2x4 treated', 'STB-ZERO-PT-2X4-96-001'),
      'STB-ZERO-PT-2X4-96-001 · 2x4 x 96 in treated SYP above-ground. This job’s wood is now treated SYP; the Store still picks the board.');
    await until(async () => (await state()).species === 'syp-treated', 'USE SKU states treated SYP');

    // 18: no formal /job request from Intent or the bench until the confirm point.
    await frame.locator('.recovery-nav button[data-job-project="start-own"][data-journey-stage="configure"]').click();
    await until(async () => (await currentLabels(frame)).join() === '2 · The bench', 'bench current');
    await page.waitForTimeout(500);
    assert.equal(jobCalls(log).length, 0, 'Intent and the bench ask /job nothing');
    assert.ok(log.filter(e => e.request.projectId === 'start-own').every(e => e.path === '/api/store-zero/offering'));
    assert.deepEqual(errors, []);
    await page.close();
  });
});

test('ITEM LOOKUP with no Store answer says so and answers nothing locally', { timeout: 240000 }, async () => {
  await withBrowser(async ({ browser, origin, log, control }) => {
    const { page, frame, errors } = await openStartOwn(browser, origin);
    const b = bench(page);
    const species = () => live(frame, () => window.STBStartOwnLive.revision().facts['start-own.material']?.value?.species ?? null);
    control.withholdOffering = true;
    for (const searchText of ['STB-ZERO-SPF-2X4-96-001', 'pine']) {
      await b.locator('#stb-intent-sku').fill(searchText);
      await b.locator('#stb-intent-sku-look').click();
      await until(async () => (await b.locator('#stb-intent-sku-answer').innerText()) === 'Store Zero item lookup is unavailable. Nothing changed.', 'unavailable ' + searchText);
      assert.equal(await b.locator('#stb-intent-sku-results li').count(), 0, 'no local result for ' + searchText);
    }
    assert.equal(new Set(log.filter(e => e.withheld).map(e => e.request.requestId)).size, 2, 'each lookup went to the withheld offering endpoint');
    assert.equal(jobCalls(log).length, 0, 'no /job fallback');
    assert.equal(await species(), 'spf', 'nothing changed');
    // The same lookup succeeds once the hosted offering endpoint answers: the result comes only from the Store.
    control.withholdOffering = false;
    await b.locator('#stb-intent-sku-look').click();
    await until(async () => (await b.locator('#stb-intent-sku-results li').count()) === 20, 'Store answered');
    assert.deepEqual(errors, []);
    await page.close();
  });
});

test('the shared host draws the Start your own nav from its validated STB-TILE-HOST-0.1 message', { timeout: 240000 }, async () => {
  await withBrowser(async ({ browser, origin, log }) => {
    const { page, frame, errors } = await openStartOwn(browser, origin);

    // Intent: Idea, then the six contract steps after the Project Library. The Store answers waits for an answer to show.
    let message = await live(frame, () => window.STBStartOwnLive.hostMessage());
    assert.deepEqual(Object.keys(message).sort(), ['interface', 'navigationRequest', 'stage', 'tileId', 'usableSteps']);
    assert.equal(message.interface, 'STB-TILE-HOST-0.1');
    assert.equal(message.tileId, 'start-own');
    assert.equal(message.stage, 'Intent');
    assert.deepEqual(message.usableSteps, TRAIL_STEPS.slice(0, 2));
    assert.equal(await live(frame, () => document.documentElement.dataset.tileHostRejected ?? null), null);
    let line = await navLine(frame);
    assert.deepEqual(line.map(b => b.label), ['← Project Library', 'Idea', ...TRAIL_STEPS.map((step, i) => `${i + 1} · ${step}`)]);
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
    await benchAdmitted(frame);
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
    await benchAdmitted(frame);

    // The bench's revision is complete: admitted, with exactly the profile's facts.
    const admission = await live(frame, () => window.STBStartOwnLive.admission());
    assert.equal(admission.admission.result, 'ADMITTED');
    assert.deepEqual(Object.keys(admission.request.facts).sort(),
      ['start-own.datum', 'start-own.material', 'start-own.operations', 'start-own.parts', 'start-own.spot-demand', 'start-own.workpiece-length']);
    assert.deepEqual(admission.request.openDemands, []);
    assert.equal(admission.request.profileVersion, '0.5');
    // The material is what the bench carries: the species stated on Intent, form and nominal size from its "2×4 stud" control.
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
    await landOnIntent(frame);
    await frame.locator('.recovery-nav button[data-job-project="start-own"][data-journey-stage="configure"]').click();
    await benchAdmitted(frame);

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
