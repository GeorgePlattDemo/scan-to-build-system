// Start your own on the shared tile host, against the real pinned Store.
// - Start your own opens on its Idea intake: no numbered step, the Idea line's one way on is Intent. Idea is the
//   Job 1 picture and one line; Intent has the six ways and the tool box, the circled 2×4 and its two woods.
//   From Intent on, Idea is the back control.
// - A wood change shows its price on the bench; a SKU looks up a real Store item.
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

// Start your own opens on its Idea intake; the Idea line's one way on is Intent.
async function enterIntent(frame) {
  await frame.locator('.recovery-nav button.job-idea-onward').click();
  await until(async () => (await currentLabels(frame)).join() === '1 · Intent', 'intent current');
}
async function openStartOwn(browser, origin) {
  const { page, frame, errors } = await openTile(browser, origin, 'Start your own');
  await until(async () => bench(page) && await bench(page).$('#stb-confirm-store'), 'Start your own page');
  await enterIntent(frame);
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
    await chooseSpecies(page, frame, 'spf');

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
    await chooseSpecies(page, frame, 'spf');

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

test('Start your own opens on Idea: the Job 1 picture and one line; Intent is step 1 with the seven items', { timeout: 240000 }, async () => {
  await withBrowser(async ({ browser, origin, log }) => {
    const { page, frame, errors } = await openTile(browser, origin, 'Start your own');
    await until(async () => bench(page) && await bench(page).$('#stb-confirm-store'), 'Start your own page');

    // Idea: the intake, not a step. No numbered step shows and none is current; the one way on is Intent.
    let message = await until(async () => { const m = await live(frame, () => window.STBStartOwnLive.hostMessage()); return m.stage === 'Idea' && m; }, 'Idea stage');
    assert.equal(message.tileId, 'start-own');
    assert.equal(await live(frame, () => document.documentElement.dataset.tileHostRejected ?? null), null);
    assert.deepEqual((await navLine(frame)).map(b => b.label), ['← Project Library', 'Intent']);
    assert.deepEqual(await currentLabels(frame), []);
    assert.equal(await shownPage(frame), 'start-own-live');
    assert.equal(await bench(page).locator('#stb-start-idea-screen').isHidden(), false);
    assert.equal(await bench(page).locator('#stb-start-intent-screen').isHidden(), true);
    assert.equal(await bench(page).locator('#stb-start-bench-screen').isHidden(), true);

    // Idea is this job's story: the existing Job 1 picture, top left, and one line. No ways list, no carried values.
    const idea = bench(page).locator('#stb-start-idea-screen');
    assert.equal((await idea.innerText()).trim(), 'Two broken crossmembers, both cut from a 2×4.');
    assert.equal(await idea.locator('img').count(), 1);
    assert.equal(await idea.locator('.morelist, #stb-idea-known').count(), 0);
    const ideaPicture = await idea.locator('img').evaluate(img => ({
      src: img.src, complete: img.complete && img.naturalWidth > 0, box: img.getBoundingClientRect().toJSON(),
      frameBox: img.closest('.frame-in').getBoundingClientRect().toJSON(),
    }));
    const job1Src = await bench(page).locator('#stb-start-intent-screen .stb-user1-img').getAttribute('src');
    assert.equal(ideaPicture.src, job1Src, 'Idea shows the existing Job 1 picture');
    assert.ok(ideaPicture.complete, 'the picture is drawn');
    assert.ok(ideaPicture.box.left - ideaPicture.frameBox.left < 30 && ideaPicture.box.top - ideaPicture.frameBox.top < 30, 'top left');
    // Nothing is chosen for the user: the wood is not carried, so the revision still blocks before the Store on it.
    assert.deepEqual(await live(frame, () => window.STBStartOwnLive.admission().admission.blocking),
      [{ factId: 'start-own.material', owner: 'USER', title: 'Material demand', condition: 'INVALID_VALUE', fields: ['species'] }]);

    // Intent is step 1: the six ways back in their old order, and the seventh is the type box.
    await enterIntent(frame);
    assert.deepEqual((await navLine(frame)).map(b => b.label), ['← Project Library', 'Idea', ...TRAIL_STEPS.map((step, i) => `${i + 1} · ${step}`)]);
    assert.equal(await bench(page).locator('#stb-start-intent-screen').isHidden(), false);
    assert.equal(await bench(page).locator('#stb-start-idea-screen').isHidden(), true);
    assert.equal((await live(frame, () => window.STBStartOwnLive.hostMessage())).stage, 'Intent');
    const intent = bench(page).locator('#stb-start-intent-screen');
    assert.deepEqual(await intent.locator('.morelist > li > b').allInnerTexts(), [
      'Add pieces as you go.', 'Just tell us in plain words.', 'Type the numbers.', 'Send a scan or a photo.',
      'Draw it here.', 'Bring what you already have.', 'Add a tool this job needs.']);
    assert.equal(await intent.locator('.morelist > li').nth(6).locator('#stb-add-tool-input').isVisible(), true);
    // The two boxes Intent has: the tool box and the SKU box. Nothing else to type.
    assert.deepEqual(await intent.locator('input:visible').evaluateAll(els => els.map(e => e.id)), ['stb-add-tool-input', 'stb-intent-sku']);

    // The same picture, half again as large on Idea; on Intent a red circle on the 2×4 this job picked,
    // and under it the two demo woods.
    const intentPicture = await intent.locator('.stb-user1-img').evaluate(img => img.getBoundingClientRect().width);
    assert.ok(Math.abs(ideaPicture.box.width / intentPicture - 1.5) < 0.05, `Idea picture is half again as large (${ideaPicture.box.width} vs ${intentPicture})`);
    const ring = intent.locator('.stb-user1-pic .stb-pick-ring circle');
    assert.equal(await ring.isVisible(), true);
    assert.equal(await ring.getAttribute('stroke'), '#d1242f');
    assert.deepEqual(await intent.locator('#stb-intent-wood [data-intent-species]').allInnerTexts(), ['SPF', 'TREATED SYP']);

    // What is typed becomes a control for this job. The bench can work it; each change is a new revision.
    assert.equal(await bench(page).locator('#stb-add-tool').isDisabled(), true, 'nothing typed: ADD is inert');
    await bench(page).locator('#stb-add-tool-input').fill('Countersink');
    await bench(page).locator('#stb-add-tool').click();
    assert.deepEqual(await bench(page).locator('#stb-added-tools span').allInnerTexts(), ['Countersink']);
    await frame.locator('.recovery-nav button[data-job-project="start-own"][data-journey-stage="configure"]').click();
    await until(async () => (await currentLabels(frame)).join() === '2 · The bench', 'bench current');
    const control = bench(page).locator('#stb-bench-added-controls [data-added-control="Countersink"]');
    assert.equal(await control.locator('h2').innerText(), 'Countersink?');
    assert.deepEqual(await control.locator('button.on').allInnerTexts(), ['ON']);
    const before = await live(frame, () => window.STBStartOwnLive.revision().definitionRevisionId);
    await control.locator('[data-added-control-value="off"]').click();
    await until(async () => (await live(frame, () => window.STBStartOwnLive.revision().definitionRevisionId)) !== before, 'a new revision');
    assert.deepEqual(await control.locator('button.on').allInnerTexts(), ['OFF']);
    assert.match(await bench(page).locator('#stb-before-send').innerText(), /Countersink \(off\) — are part of this version; the Store is not asked about them\./);
    // The picture carries onto the bench; Intent's wood buttons do not come with it as dead copies.
    assert.equal(await bench(page).locator('#stb-bench-intent-slot .stb-user1-img').getAttribute('src'), job1Src);
    assert.equal(await bench(page).locator('#stb-bench-intent-slot .stb-intent-wood').count(), 0);
    // Cedar is off this bench's choices.
    assert.deepEqual(await bench(page).locator('#stb-bench-species [data-species]').evaluateAll(els => els.map(e => e.dataset.species)), ['spf', 'syp-treated']);

    // Idea is the back control from Intent and from the bench, never current.
    const backToIdea = async label => {
      await frame.locator('.recovery-nav button.job-idea').click();
      await until(async () => (await live(frame, () => window.STBStartOwnLive.hostMessage())).stage === 'Idea', label + ': back on Idea');
      assert.equal(await bench(page).locator('#stb-start-idea-screen').isHidden(), false, label);
      assert.deepEqual((await navLine(frame)).map(b => b.label), ['← Project Library', 'Intent'], label);
    };
    await backToIdea('from the bench');
    await enterIntent(frame);
    await backToIdea('from Intent');

    assert.equal(startOwnCalls(log).length, 0, 'Idea, Intent and the bench ask the Store nothing');
    assert.deepEqual(errors, []);
    await page.close();
  });
});

// A wood change shows its price on the bench, not only at the Store. The bench price is the Store-issued reference
// for that wood (checked against the pinned Store by test/store/user1-reference-guard.test.mjs); confirming asks the
// Store again and its answer is the same number. A SKU names a real Store item or nothing.
test('a wood change updates the bench price; a SKU looks up a real Store item and invents no species', { timeout: 240000 }, async () => {
  await withBrowser(async ({ browser, origin, log }) => {
    const { page, frame, errors } = await openStartOwn(browser, origin);
    const priceLine = () => bench(page).locator('#stb-bench-price-line').innerText();
    const total = () => bench(page).locator('#stb-price-total').innerText();
    const species = () => live(frame, () => window.STBStartOwnLive.revision().facts['start-own.material']?.value?.species ?? null);
    assert.match(await priceLine(), /pick a wood to see its price\.$/);
    assert.equal(await total(), 'NOT COMPLETE');

    // Intent states the wood; the bench shows its price.
    await bench(page).locator('#stb-intent-wood [data-intent-species="spf"]').click();
    await until(async () => (await species()) === 'spf', 'SPF stated');
    assert.equal(await priceLine(), '16 in braces · 30° ends · SPF · 5-foot 2×4 · $8.54 Store reference price ($2.61 wood).');
    assert.equal(await total(), '$8.54');

    // The bench revises it: treated SYP has no 5-foot board, so the Store's board and price change with it.
    await frame.locator('.recovery-nav button[data-job-project="start-own"][data-journey-stage="configure"]').click();
    await until(async () => (await currentLabels(frame)).join() === '2 · The bench', 'bench current');
    await bench(page).locator('#stb-bench-species [data-species="syp-treated"]').click();
    await until(async () => (await species()) === 'syp-treated', 'treated SYP stated');
    assert.equal(await priceLine(), '16 in braces · 30° ends · treated SYP · 6-foot 2×4 · $11.08 Store reference price ($5.15 wood).');
    assert.equal(await total(), '$11.08');
    assert.equal(await bench(page).locator('#stb-basis-sku').innerText(), 'STB-ZERO-PTAG-2X4-72-001');
    assert.match(await bench(page).locator('#stb-bench-board-swap').innerText(), /The Store has no 5-foot treated SYP 2×4; the shortest it offers for this job is a 6-foot 2×4 \(72 in\)\./);
    assert.deepEqual(await bench(page).locator('#stb-intent-wood [data-intent-species].on').evaluateAll(els => els.map(e => e.dataset.intentSpecies)), ['syp-treated'], 'Intent shows the same wood');
    await bench(page).locator('#stb-bench-controls [data-length="18"]').click();
    await until(async () => (await total()) === '$11.09', '18 in treated SYP priced on the bench');
    await bench(page).locator('#stb-bench-controls [data-length="16"]').click();
    await until(async () => (await total()) === '$11.08', 'back to 16 in');

    // A SKU looks up a real Store item. One of this job's woods states that wood; anything else changes nothing.
    await frame.locator('.recovery-nav button[data-job-project="start-own"][data-journey-stage="scan"]').click();
    await until(async () => (await currentLabels(frame)).join() === '1 · Intent', 'intent current');
    const lookUp = async sku => {
      await bench(page).locator('#stb-intent-sku').fill(sku);
      await bench(page).locator('#stb-intent-sku-look').click();
      return bench(page).locator('#stb-intent-sku-answer').innerText();
    };
    assert.equal(await lookUp('stb-zero-spf-2x4-96-001'),
      'STB-ZERO-SPF-2X4-96-001 · 2x4 x 96 in SPF construction · $4.18. This job’s wood is now SPF; the Store still picks the board.');
    await until(async () => (await species()) === 'spf', 'SKU states SPF');
    assert.equal(await total(), '$8.54');
    assert.equal(await lookUp('STB-ZERO-WRC-2X4-96-001'),
      'STB-ZERO-WRC-2X4-96-001 · 2x4 x 96 in Western Red Cedar S4S · $13.13. A real Store item, but not one of this job’s woods. Nothing changed.');
    assert.equal(await lookUp('STB-ZERO-WALNUT-2X4-96-001'), 'STB-ZERO-WALNUT-2X4-96-001 is not a Store 2×4. Nothing changed.');
    assert.equal(await species(), 'spf', 'no species was invented');
    await bench(page).locator('#stb-intent-wood [data-intent-species="syp-treated"]').click();
    await until(async () => (await total()) === '$11.08', 'Intent changes the bench price');
    assert.equal(startOwnCalls(log).length, 0, 'the bench price asks the Store nothing');

    // Confirming asks the Store for this revision; its answer is the price the bench showed.
    await frame.locator('.recovery-nav button[data-job-project="start-own"][data-journey-stage="configure"]').click();
    await until(async () => (await currentLabels(frame)).join() === '2 · The bench', 'bench again');
    await bench(page).locator('#stb-confirm-store').click();
    await until(async () => (await currentLabels(frame)).join() === '3 · The Store answers', 'store current');
    const sent = startOwnCalls(log);
    assert.equal(sent.length, 1);
    assert.deepEqual(sent[0].request.payload.line.materialDemand, { species: 'syp-treated', form: 'board', nominalT: 2, nominalW: 4 });
    assert.equal(sent[0].answer.rawEstimate.totals.Q, 11.08);
    assert.match(await frame.locator('#proof-store-q').innerText(), /11\.08/);
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
    await enterIntent(frame);
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
