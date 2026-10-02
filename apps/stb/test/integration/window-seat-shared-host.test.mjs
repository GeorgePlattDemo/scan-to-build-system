// Window Seat on the shared tile host, against the real pinned Store.
// - The host draws Window Seat's one nav line from a validated STB-TILE-HOST-0.1 message and the trail contract:
//   on Idea, the declared fork Intent | One full scroll and no steps; from Intent on, Idea as a back control and the
//   six contract steps, inert steps disabled, one current. The fork is presentation only: it changes no admission.
// - A frame that speaks for another tile, or sends an invalid message, is rejected and the steps go inert.
// - Every Store inquiry is admit() then inquire(): a missing profile fact blocks before the Store and names its owner;
//   a complete revision still reaches the Store.
// - The old Window Seat shell path is gone: no seatGo, seatNavButton, applySeatNavState or STB_SEAT_* messages.
// - A Window Seat inquiry has one admission decision, admit(): its transport is sendAdmittedJob, and it never calls
//   admitPublicStoreRequest.
// - Boards: every board has an id and a length and width above 0; a missing id or a zero blocks before the Store in
//   admit() and names the owner. Sent work matches admitted work: an admitted board that is not sent, or a sent board
//   that was not admitted, stops in the transport before the Store. Added screws travel with the gauge, length,
//   finish and count admitted.

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { withBrowser, openTile } from './helpers.mjs';

const TRAIL_STEPS = ['Intent', 'The bench', 'The Store answers', 'Your call', 'We cut it', 'Pick up & build'];
const SHELL = fileURLToPath(new URL('../../public-build/system-build-current.html', import.meta.url));
const PAGE = fileURLToPath(new URL('../../public-build/stb-window-seat-0.9.html', import.meta.url));

const frameOf = (page, part) => page.frames().find(f => f.url().includes(part));
async function until(fn, label, tries = 80) {
  for (let i = 0; i < tries; i++) { const v = await fn(); if (v) return v; await new Promise(r => setTimeout(r, 150)); }
  throw new Error('timed out: ' + label);
}
// The visible nav line, in order: what a person sees.
async function navLine(frame) {
  return frame.$$eval('.recovery-nav button', els => els
    .filter(e => !e.hidden && getComputedStyle(e).display !== 'none' && e.closest('.recovery-nav') && getComputedStyle(e.closest('.trail-fork') || e).display !== 'none')
    .map(e => ({
      label: e.textContent.trim(),
      stage: e.dataset.journeyStage || null,
      fork: e.dataset.presentationFork || null,
      inert: e.disabled || e.getAttribute('aria-disabled') === 'true',
      current: e.getAttribute('aria-current') === 'step',
      pressed: e.getAttribute('aria-pressed') === 'true',
    })));
}
const steps = line => line.filter(b => b.stage);
const cutCalls = log => log.filter(e => e.request.projectId === 'window-seat' && e.request.requestType === 'CUT_PACKAGE_V1').length;

async function openSeat(browser, origin) {
  const { page, frame, errors } = await openTile(browser, origin, 'Space utilization');
  const seat = await until(() => frameOf(page, 'stb-window-seat-0.9.html'), 'seat frame');
  await until(() => seat.evaluate(() => !!window.STBWindowSeat?.hostMessage()), 'seat contract loaded');
  await until(async () => (await steps(await navLine(frame))).length === 0 && (await navLine(frame)).some(b => b.fork), 'idea line');
  return { page, frame, seat, errors };
}

test('the old Window Seat shell path is gone', () => {
  const shell = fs.readFileSync(SHELL, 'utf8');
  for (const name of ['seatGo', 'seatNavButton', 'applySeatNavState', 'seatNavState', 'seatPlace', 'STB_SEAT_STATE', 'STB_SEAT_GO', 'TRAIL_NAV_LABEL_OVERRIDES']) {
    assert.equal(shell.includes(name), false, name + ' is still in the shell');
  }
  assert.doesNotMatch(shell, /activeJourneyProject\s*[!=]==?\s*['"]window-seat['"]/, 'no Window Seat branch in the shell');
  const page = fs.readFileSync(PAGE, 'utf8');
  assert.equal(page.includes('STB_SEAT_'), false, 'the page speaks only STB-TILE-HOST-0.1 to the host');
  // One Store handoff on the page: inside inquire(), after admit(), sending the admitted request without the old door.
  assert.equal((page.match(/client\.sendAdmittedJob\(/g) || []).length, 1);
  assert.match(page, /C\.inquire\(admission,request=>\{[\s\S]*?client\.sendAdmittedJob\(\{admitted:request,/);
  assert.equal(page.includes('sendJob('), false, 'no Window Seat inquiry goes through sendJob');
  // The contract is loaded from the one deployed copy, never pasted in.
  assert.match(page, /import\('\.\/shared\/tile-host-admission-contract\.mjs\?v=[0-9a-f]{8}'\)/);
  assert.equal(page.includes('export function admit'), false);
});

test('the shared host draws the Window Seat nav from its validated STB-TILE-HOST-0.1 message', { timeout: 240000 }, async () => {
  await withBrowser(async ({ browser, origin }) => {
    const { page, frame, seat, errors } = await openSeat(browser, origin);

    // Idea: the intake. The tile's message carries the declared fork; the host shows it, and no step.
    let message = await seat.evaluate(() => window.STBWindowSeat.hostMessage());
    assert.deepEqual(Object.keys(message).sort(), ['interface', 'navigationRequest', 'presentationFork', 'stage', 'tileId', 'usableSteps']);
    assert.equal(message.interface, 'STB-TILE-HOST-0.1');
    assert.equal(message.tileId, 'window-seat');
    assert.equal(message.stage, 'Idea');
    assert.equal(message.presentationFork, 'Intent');
    assert.equal(await frame.evaluate(() => document.documentElement.dataset.tileHostRejected ?? null), null);
    let line = await navLine(frame);
    assert.deepEqual(line.map(b => b.label), ['← Project Library', 'Intent', 'One full scroll']);
    assert.deepEqual(line.filter(b => b.fork).map(b => [b.fork, b.pressed]), [['Intent', true], ['One full scroll', false]]);
    assert.match(await frame.locator('.recovery-nav .trail-fork').innerText(), /^Two ways through this job:/);
    assert.equal(line.some(b => b.current), false, 'Idea is not a step');

    // From Intent on: Idea as the back control, the six contract steps in order, inert ones disabled, one current.
    await frame.locator('.recovery-nav [data-presentation-fork="Intent"]').click();
    await until(async () => steps(await navLine(frame)).some(b => b.current), 'intent current');
    line = await navLine(frame);
    assert.deepEqual(line.map(b => b.label), ['← Project Library', 'Idea', ...TRAIL_STEPS.map((step, i) => `${i + 1} · ${step}`)]);
    assert.deepEqual(steps(line).map(b => b.inert), [false, false, false, true, true, true]);
    assert.deepEqual(line.filter(b => b.current).map(b => b.label), ['1 · Intent']);
    assert.equal((await seat.evaluate(() => window.STBWindowSeat.state())).section, 'intent');
    message = await seat.evaluate(() => window.STBWindowSeat.hostMessage());
    assert.equal(message.presentationFork, undefined, 'the fork lives on the Idea line only');
    assert.deepEqual(message.usableSteps, TRAIL_STEPS.slice(0, 3));

    // A step on the line opens it on the tile's own page; the current step moves with it.
    await frame.locator('.recovery-nav button[data-job-project="window-seat"][data-journey-stage="configure"]').click();
    await until(async () => (await seat.evaluate(() => window.STBWindowSeat.state())).section === 'bench', 'bench');
    await until(async () => (await navLine(frame)).filter(b => b.current).map(b => b.label).join() === '2 · The bench', 'bench current');

    // Idea goes back to the intake; the fork is drawn again with the same choice.
    await frame.locator('.recovery-nav .job-idea').click();
    await until(async () => steps(await navLine(frame)).length === 0, 'back on Idea');
    assert.equal((await seat.evaluate(() => window.STBWindowSeat.state())).section, 'hero');

    // The other fork option is the same job, shown as one long scroll. It is presentation only.
    const before = await seat.evaluate(() => ({ revision: window.STBWindowSeat.revision(), admission: window.STBWindowSeat.admission() }));
    await frame.locator('.recovery-nav [data-presentation-fork="One full scroll"]').click();
    await until(async () => (await seat.evaluate(() => window.STBWindowSeat.state())).view === 'whole', 'whole view');
    await until(async () => (await navLine(frame)).some(b => b.fork === 'One full scroll' && b.pressed), 'fork pressed');
    const after = await seat.evaluate(() => ({ revision: window.STBWindowSeat.revision(), admission: window.STBWindowSeat.admission() }));
    assert.deepEqual(after, before, 'the fork changes neither the revision nor its admission');

    // A frame that speaks for another tile is rejected, and the steps go inert.
    await seat.evaluate(() => window.parent.postMessage({ type: 'STB_TILE_HOST', message: { ...window.STBWindowSeat.hostMessage(), tileId: 'playhouse' } }, location.origin));
    await until(() => frame.evaluate(() => document.documentElement.dataset.tileHostRejected === 'TILE_FRAME_MISMATCH'), 'mismatch rejected');
    // An invalid message for itself (a fork off its line) is rejected too.
    await seat.evaluate(() => window.parent.postMessage({ type: 'STB_TILE_HOST', message: { ...window.STBWindowSeat.hostMessage(), stage: 'The bench', presentationFork: 'Intent' } }, location.origin));
    await until(() => frame.evaluate(() => /PRESENTATION_FORK_OFF_ITS_LINE/.test(document.documentElement.dataset.tileHostRejected || '')), 'invalid rejected');
    assert.ok(steps(await navLine(frame)).every(b => b.inert) || (await navLine(frame)).every(b => !b.stage), 'no usable step from a rejected message');
    assert.deepEqual(errors, []);
    await page.close();
  });
});

test('a missing profile fact blocks before the Store and names its owner; a complete revision still reaches the Store', { timeout: 240000 }, async () => {
  await withBrowser(async ({ browser, origin, log }) => {
    const { frame, seat } = await openSeat(browser, origin);
    await frame.locator('.recovery-nav [data-presentation-fork="Intent"]').click();
    await until(async () => (await seat.evaluate(() => window.STBWindowSeat.state())).section === 'intent', 'intent');

    // The page's state is complete: admitted, with exactly the profile's facts.
    const admission = await seat.evaluate(() => window.STBWindowSeat.admission());
    assert.equal(admission.admission.result, 'ADMITTED');
    assert.deepEqual(Object.keys(admission.request.facts).sort(),
      ['window-seat.added-knobs', 'window-seat.boards', 'window-seat.depth', 'window-seat.height', 'window-seat.kept-asks', 'window-seat.width']);
    assert.equal(admission.request.profileVersion, '0.3');
    assert.equal(admission.request.requestType, 'CUT_PACKAGE_V1');

    // Each declared fact left out blocks before the Store and names its owner.
    const before = cutCalls(log);
    for (const [factId, owner, title] of [
      ['window-seat.width', 'USER', 'Overall width W (in)'],
      ['window-seat.boards', 'PROJECT', 'Every defined board with real length and width'],
      ['window-seat.kept-asks', 'USER', 'Every ask kept on the job, described'],
    ]) {
      const result = await seat.evaluate(id => {
        const revision = window.STBWindowSeat.revision();
        delete revision.facts[id];
        return window.STBWindowSeat.inquire(revision);
      }, factId);
      assert.equal(result.admission.result, 'BLOCKED', factId);
      assert.equal(result.admission.reason, 'REQUIRED_FACT_UNSETTLED');
      assert.deepEqual(result.admission.blocking, [{ factId, owner, title, condition: 'MISSING' }]);
      assert.equal(result.request, null);
      await frame.page().waitForTimeout(500);
      assert.equal(cutCalls(log), before, factId + ': a blocked revision never reaches the Store');
      assert.match(await seat.locator('#store-panel').innerText(), new RegExp('NOT SENT TO THE STORE[\\s\\S]*' + title.replace(/[()]/g, '\\$&') + ' · owner ' + owner));
    }

    // On the bench, a center wider than the controlling width holds the USER's width open: The Store answers is
    // inert, nothing is sent, and the page names the fact and its owner.
    await frame.locator('.recovery-nav button[data-job-project="window-seat"][data-journey-stage="configure"]').click();
    await until(async () => (await seat.evaluate(() => window.STBWindowSeat.state())).section === 'bench', 'bench');
    await until(async () => (await seat.evaluate(() => window.STBWindowSeat.state())).answered, 'first answer');
    const answered = cutCalls(log);
    await seat.evaluate(() => { const e = document.getElementById('c-wC'); e.value = '84'; e.dispatchEvent(new Event('input')); });
    await frame.page().waitForTimeout(600);
    const blocked = await seat.evaluate(() => window.STBWindowSeat.admission());
    assert.equal(blocked.admission.result, 'BLOCKED');
    assert.deepEqual(blocked.admission.blocking.map(b => [b.factId, b.owner, b.condition]), [['window-seat.width', 'USER', 'STATUS_UNRESOLVED']]);
    assert.equal(cutCalls(log), answered, 'nothing sent for a blocked revision');
    assert.match(await seat.locator('#bench-money').innerText(), /Not sent to the Store\. Missing: Overall width W \(in\) · owner USER/);
    const inert = Object.fromEntries(steps(await navLine(frame)).map(b => [b.stage, b.inert]));
    assert.deepEqual(inert, { scan: false, configure: false, store: true, request: true, yard: true, record: true });
    assert.equal(await seat.locator('#btn-ask').isDisabled(), true);

    // Settled again, the complete revision is admitted and reaches the Store by itself, and its answer is current.
    await seat.evaluate(() => { const e = document.getElementById('c-wC'); e.value = '55'; e.dispatchEvent(new Event('input')); });
    await until(() => cutCalls(log) > answered, 'complete revision reaches the Store');
    const state = await until(async () => { const s = await seat.evaluate(() => window.STBWindowSeat.state()); return !s.asking && s.answered && s.current ? s : null; }, 'answer');
    assert.equal(state.error, null);
    assert.equal(state.admission.result, 'ADMITTED');
    const sent = log.filter(e => e.request.projectId === 'window-seat').pop().request;
    assert.equal(sent.candidateRevisionId, await seat.evaluate(() => window.STBWindowSeat.revision().definitionRevisionId));
    assert.deepEqual(sent.payload.definition, await seat.evaluate(() => window.STBWindowSeat.request()));
    await until(async () => !steps(await navLine(frame)).find(b => b.stage === 'store').inert, 'The Store answers usable');
  });
});

// A nonempty object is not a complete fact. On the live page, through the deployed contract and the real pinned Store:
// - Kept asks: the profile fact is a count, not a disposition. "Something else" with a blank description blocks before
//   the Store and names its owner; once described it is admitted, stays on the job record and is not sent.
// - Added knobs: an added extra spot stated as an object of nulls blocks in admit() itself, with the fact id, its
//   owner and the missing fields, even when it is marked settled; a complete one is admitted and reaches the Store.
test('a malformed nested fact blocks before the Store with its fact id and owner; a complete one still reaches the Store', { timeout: 240000 }, async () => {
  await withBrowser(async ({ browser, origin, log }) => {
    const { frame, seat } = await openSeat(browser, origin);
    await frame.locator('.recovery-nav [data-presentation-fork="Intent"]').click();
    await until(async () => (await seat.evaluate(() => window.STBWindowSeat.state())).section === 'intent', 'intent');
    const keptBefore = (await seat.evaluate(() => window.STBWindowSeat.revision())).facts['window-seat.kept-asks'].value.kept;
    const set = (id, value, type = 'input') => seat.evaluate(([id, value, type]) => {
      const e = document.getElementById(id); e.value = value; e.dispatchEvent(new Event(type, { bubbles: true }));
    }, [id, value, type]);
    const tick = (selector) => seat.evaluate(s => { const e = document.querySelector(s); e.checked = true; e.dispatchEvent(new Event('change', { bubbles: true })); }, selector);

    // "Something else", kept with a blank description: blocking. Nothing reaches the Store.
    const before = cutCalls(log);
    await tick('#kept-asks [data-kept="other"]');
    let result = await seat.evaluate(() => window.STBWindowSeat.inquire(window.STBWindowSeat.revision()));
    assert.equal(result.admission.result, 'BLOCKED');
    assert.deepEqual(result.admission.blocking.map(b => [b.factId, b.owner, b.condition]), [['window-seat.kept-asks', 'USER', 'STATUS_UNRESOLVED']]);
    await frame.page().waitForTimeout(500);
    assert.equal(cutCalls(log), before, 'a blank "Something else" never reaches the Store');

    // Described: admitted, carried as a count, kept on the job record and excluded from what is sent.
    await set('other-text', 'Leave the offcuts in the bundle');
    const rev = await seat.evaluate(() => window.STBWindowSeat.revision());
    assert.deepEqual(rev.facts['window-seat.kept-asks'], { value: { kept: keptBefore + 1 }, status: 'CONFIRMED' });
    assert.ok((await seat.evaluate(() => window.STBWindowSeat.record())).keptNotSent.includes('Something else: Leave the offcuts in the bundle'));
    assert.match(await seat.locator('#kept-asks [data-kept="other"]').locator('xpath=..').innerText(), /KEPT · NOT SENT/);
    result = await seat.evaluate(() => window.STBWindowSeat.inquire(window.STBWindowSeat.revision()));
    assert.equal(result.admission.result, 'ADMITTED');
    await until(() => cutCalls(log) === before + 1, 'described ask: the revision reaches the Store');
    const keptSent = JSON.stringify(log.filter(e => e.request.projectId === 'window-seat').pop().request);
    assert.equal(keptSent.includes('Leave the offcuts'), false, 'the described ask is not sent');
    assert.equal(keptSent.includes('Something else'), false, 'the described ask is not sent');

    // Add the extra spot by hand. The page states it with its fields empty, and holds it open.
    await tick('#add-knobs [data-add="xspot"]');
    const opened = await seat.evaluate(() => window.STBWindowSeat.admission());
    assert.deepEqual(opened.admission.blocking.map(b => [b.factId, b.owner, b.condition]), [['window-seat.added-knobs', 'USER', 'STATUS_UNRESOLVED']]);

    // The same knob as an object of nulls, marked settled: admit() itself refuses it and names the missing fields.
    const calls = cutCalls(log);
    result = await seat.evaluate(() => {
      const rv = window.STBWindowSeat.revision();
      rv.facts['window-seat.added-knobs'] = { value: { ...rv.facts['window-seat.added-knobs'].value, xspot: { target: null, offset: null, place: null } }, status: 'CONFIRMED' };
      return window.STBWindowSeat.inquire(rv);
    });
    assert.equal(result.admission.result, 'BLOCKED');
    assert.equal(result.admission.reason, 'REQUIRED_FACT_UNSETTLED');
    assert.deepEqual(result.admission.blocking, [{ factId: 'window-seat.added-knobs', owner: 'USER', title: 'Every knob added by hand, with what it needs',
      condition: 'INVALID_VALUE', fields: ['xspot.target', 'xspot.offset', 'xspot.place'] }]);
    assert.equal(result.request, null);
    await frame.page().waitForTimeout(500);
    assert.equal(cutCalls(log), calls, 'a malformed nested fact never reaches the Store');

    // Give it a part, a distance and a placement: complete, admitted, and it reaches the Store with the spot on it.
    const target = await seat.evaluate(() => window.STBWindowSeat.definition().feats[0].id);
    await set('xs-target', target, 'change');
    await set('xs-off', '3');
    await set('xs-place', 'CENTER', 'change');
    const complete = await seat.evaluate(() => window.STBWindowSeat.revision());
    assert.deepEqual(complete.facts['window-seat.added-knobs'].value.xspot, { target, offset: '3', place: 'CENTER' });
    result = await seat.evaluate(() => window.STBWindowSeat.inquire(window.STBWindowSeat.revision()));
    assert.equal(result.admission.result, 'ADMITTED');
    assert.deepEqual(result.request.facts['window-seat.added-knobs'].xspot, { target, offset: '3', place: 'CENTER' });
    await until(() => cutCalls(log) === calls + 1, 'complete nested fact reaches the Store');
    const sent = log.filter(e => e.request.projectId === 'window-seat').pop().request;
    assert.deepEqual(sent.payload.definition, await seat.evaluate(() => window.STBWindowSeat.request()), 'the bridge sends what it sent before: the page request');
    assert.ok(JSON.stringify(sent.payload.definition).includes('-X1'), 'the extra spot is on the wire');
  });
});

// On the live page, through the deployed contract and the real pinned Store:
// - A board without an id, or with a zero length or width, blocks in admit() before the Store: the fact, its owner
//   (PROJECT) and the board's field paths are named, and the page shows it as not sent.
// - Sent work matches admitted work. A revision admitted with a board the page's request does not carry, or without a
//   board the request carries, stops in the transport before the Store (ADMITTED_BOARD_NOT_SENT, SENT_BOARD_NOT_ADMITTED).
// - Added screws travel with the gauge, length, finish and count admitted; any other admitted screws stop in the
//   transport (ADMITTED_SCREWS_NOT_SENT). Kept asks still travel only as a count and are not sent.
// - A complete revision still reaches the Store, before and after.
test('a bad board blocks before the Store; sent work must match admitted work on the live route; a complete revision still reaches the Store', { timeout: 240000 }, async () => {
  await withBrowser(async ({ browser, origin, log }) => {
    const { frame, seat, errors } = await openSeat(browser, origin);
    await frame.locator('.recovery-nav [data-presentation-fork="Intent"]').click();
    await until(async () => (await seat.evaluate(() => window.STBWindowSeat.state())).section === 'intent', 'intent');
    const idle = () => until(async () => { const s = await seat.evaluate(() => window.STBWindowSeat.state()); return !s.asking ? s : null; }, 'idle');
    const lastSent = () => log.filter(e => e.request.projectId === 'window-seat').pop().request;
    const set = (id, value, type = 'input') => seat.evaluate(([id, value, type]) => {
      const e = document.getElementById(id); e.value = value; e.dispatchEvent(new Event(type, { bubbles: true }));
    }, [id, value, type]);
    const tick = selector => seat.evaluate(s => { const e = document.querySelector(s); e.checked = true; e.dispatchEvent(new Event('change', { bubbles: true })); }, selector);
    // Inquire about the page's own revision, changed by `edit` (a function body over `rv`).
    const inquireWith = edit => seat.evaluate(body => {
      const rv = window.STBWindowSeat.revision();
      new Function('rv', body)(rv);
      return window.STBWindowSeat.inquire(rv);
    }, edit);

    await idle();
    // A bad board blocks in admit() before the Store and names its owner and the board's fields.
    let calls = cutCalls(log);
    let result;
    for (const [edit, fields] of [
      ["rv.facts['window-seat.boards'].value[0].id = ''", ['[0].id']],
      ["delete rv.facts['window-seat.boards'].value[1].id", ['[1].id']],
      ["rv.facts['window-seat.boards'].value[1].len = 0", ['[1].len']],
      ["rv.facts['window-seat.boards'].value[0].w = 0", ['[0].w']],
    ]) {
      result = await inquireWith(edit);
      assert.equal(result.admission.result, 'BLOCKED', edit);
      assert.equal(result.admission.reason, 'REQUIRED_FACT_UNSETTLED', edit);
      assert.deepEqual(result.admission.blocking, [{ factId: 'window-seat.boards', owner: 'PROJECT',
        title: 'Every defined board with real length and width', condition: 'INVALID_VALUE', fields }], edit);
      assert.equal(result.request, null, edit);
      assert.deepEqual((await seat.evaluate(() => window.STBWindowSeat.state())).admission, result.admission, edit);
      assert.match(await seat.locator('#store-panel').innerText(), /NOT SENT TO THE STORE[\s\S]*Every defined board with real length and width · owner PROJECT/, edit);
    }
    await frame.page().waitForTimeout(500);
    assert.equal(cutCalls(log), calls, 'a bad board never reaches the Store');

    // The page emits every board as {id, len, w}, each real. A complete revision is admitted and reaches the Store.
    const boards = (await seat.evaluate(() => window.STBWindowSeat.revision())).facts['window-seat.boards'].value;
    assert.ok(boards.length > 1);
    for (const board of boards) {
      assert.deepEqual(Object.keys(board).sort(), ['id', 'len', 'w']);
      assert.ok(typeof board.id === 'string' && board.id.trim() && board.len > 0 && board.w > 0, JSON.stringify(board));
    }
    calls = cutCalls(log);
    result = await inquireWith('');
    assert.equal(result.admission.result, 'ADMITTED');
    await until(() => cutCalls(log) === calls + 1, 'complete revision reaches the Store');
    let state = await idle();
    assert.equal(state.error, null);
    assert.deepEqual(lastSent().payload.definition, await seat.evaluate(() => window.STBWindowSeat.request()));

    // Sent work matches admitted work. Each revision here is admitted; the transport stops it before the Store.
    calls = cutCalls(log);
    for (const [edit, code] of [
      // An admitted board that the page's request does not carry.
      ["rv.facts['window-seat.boards'].value.push({ id: 'GHOST-BOARD', len: 24, w: 7.25 })", 'ADMITTED_BOARD_NOT_SENT'],
      // A board the page's request carries that was not admitted.
      ["rv.facts['window-seat.boards'].value.pop()", 'SENT_BOARD_NOT_ADMITTED'],
      // The same board admitted twice: one board sent, so the second is admitted and not sent.
      ["rv.facts['window-seat.boards'].value.push({ ...rv.facts['window-seat.boards'].value[0] })", 'ADMITTED_BOARD_NOT_SENT'],
      // An admitted board renamed: the admitted name is not sent, and the sent one was not admitted.
      ["rv.facts['window-seat.boards'].value[0].id += '-RENAMED'", 'ADMITTED_BOARD_NOT_SENT'],
      // Screws admitted that the page does not send.
      ["rv.facts['window-seat.added-knobs'].value.screws = { gauge: '#8', lengthIn: '1 1/4', finish: 'coated', qty: '24' }", 'ADMITTED_SCREWS_NOT_SENT'],
    ]) {
      result = await inquireWith(edit);
      assert.equal(result.admission.result, 'ADMITTED', edit);
      state = await idle();
      assert.equal(state.error, code, edit);
    }
    await frame.page().waitForTimeout(500);
    assert.equal(cutCalls(log), calls, 'work that does not match its admission never reaches the Store');

    // Add screws by hand with a gauge, a length, a finish and a count: admitted with all four, and they reach the
    // Store with the same four. Kept asks still travel only as a count.
    await tick('#add-knobs [data-add="screws"]');
    await set('sc-gauge', '#8', 'change');
    await set('sc-len', '1 1/4');
    await set('sc-finish', 'coated', 'change');
    await set('sc-qty', '24');
    await idle();
    const rev = await seat.evaluate(() => window.STBWindowSeat.revision());
    assert.deepEqual(rev.facts['window-seat.added-knobs'].value.screws, { gauge: '#8', lengthIn: '1 1/4', finish: 'coated', qty: '24' });
    assert.deepEqual(Object.keys(rev.facts['window-seat.kept-asks'].value), ['kept']);
    calls = cutCalls(log);
    result = await inquireWith('');
    assert.equal(result.admission.result, 'ADMITTED');
    await until(() => cutCalls(log) === calls + 1, 'screws reach the Store');
    state = await idle();
    assert.equal(state.error, null);
    const line = lastSent().payload.definition.itemLines.find(l => l.lineId === 'SCREWS');
    assert.deepEqual([line.requirement.gauge, line.requirement.lengthIn, line.requirement.finish, line.qty], ['#8', 1.25, 'coated', 24]);

    // Admitted screws that differ from the ones sent, in any of the four, or admitted as not added, stop before the Store.
    calls = cutCalls(log);
    for (const edit of [
      "rv.facts['window-seat.added-knobs'].value.screws.gauge = '#10'",
      "rv.facts['window-seat.added-knobs'].value.screws.lengthIn = '1 1/2'",
      "rv.facts['window-seat.added-knobs'].value.screws.finish = 'stainless'",
      "rv.facts['window-seat.added-knobs'].value.screws.qty = '30'",
      "rv.facts['window-seat.added-knobs'].value.screws = null",
    ]) {
      result = await inquireWith(edit);
      assert.equal(result.admission.result, 'ADMITTED', edit);
      state = await idle();
      assert.equal(state.error, 'ADMITTED_SCREWS_NOT_SENT', edit);
    }
    await frame.page().waitForTimeout(500);
    assert.equal(cutCalls(log), calls, 'screws that do not match their admission never reach the Store');

    // The complete revision still reaches the Store.
    result = await inquireWith('');
    assert.equal(result.admission.result, 'ADMITTED');
    await until(() => cutCalls(log) === calls + 1, 'complete revision reaches the Store again');
    state = await idle();
    assert.equal(state.error, null);
    assert.deepEqual(lastSent().payload.definition, await seat.evaluate(() => window.STBWindowSeat.request()));
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
// Other tiles still use the old door; only Window Seat calls are read, from every frame of the page.
const seatOldDoorCalls = page => Promise.all(page.frames().map(f => f.evaluate(() => window.__stbOldDoorCalls ?? [])))
  .then(lists => lists.flat().filter(projectId => projectId === 'window-seat'));

test('a Window Seat inquiry has one admission decision, admit(); it never calls admitPublicStoreRequest', { timeout: 240000 }, async () => {
  await withBrowser(async ({ browser, origin, log }) => {
    const { page, frame, seat, errors } = await openSeat(browser, origin);
    await frame.locator('.recovery-nav [data-presentation-fork="Intent"]').click();
    await until(async () => (await seat.evaluate(() => window.STBWindowSeat.state())).section === 'intent', 'intent');
    const set = (id, value, type = 'input') => seat.evaluate(([id, value, type]) => {
      const e = document.getElementById(id); e.value = value; e.dispatchEvent(new Event(type, { bubbles: true }));
    }, [id, value, type]);
    const tick = selector => seat.evaluate(s => { const e = document.querySelector(s); e.checked = true; e.dispatchEvent(new Event('change', { bubbles: true })); }, selector);

    // A complete revision still reaches the Store, with the page's own request on the wire.
    const before = cutCalls(log);
    let result = await seat.evaluate(() => window.STBWindowSeat.inquire(window.STBWindowSeat.revision()));
    assert.equal(result.admission.result, 'ADMITTED');
    await until(() => cutCalls(log) === before + 1, 'complete revision reaches the Store');
    let state = await until(async () => { const s = await seat.evaluate(() => window.STBWindowSeat.state()); return !s.asking && s.answered ? s : null; }, 'answer');
    assert.equal(state.error, null);
    let sent = log.filter(e => e.request.projectId === 'window-seat').pop().request;
    assert.equal(sent.candidateRevisionId, await seat.evaluate(() => window.STBWindowSeat.revision().definitionRevisionId));
    assert.deepEqual(sent.payload.definition, await seat.evaluate(() => window.STBWindowSeat.request()));

    // A malformed added knob (the extra spot as an object of nulls, marked settled) still blocks before the Store, in admit().
    await tick('#add-knobs [data-add="xspot"]');
    const calls = cutCalls(log);
    result = await seat.evaluate(() => {
      const rv = window.STBWindowSeat.revision();
      rv.facts['window-seat.added-knobs'] = { value: { ...rv.facts['window-seat.added-knobs'].value, xspot: { target: null, offset: null, place: null } }, status: 'CONFIRMED' };
      return window.STBWindowSeat.inquire(rv);
    });
    assert.equal(result.admission.result, 'BLOCKED');
    assert.equal(result.admission.reason, 'REQUIRED_FACT_UNSETTLED');
    assert.deepEqual(result.admission.blocking, [{ factId: 'window-seat.added-knobs', owner: 'USER', title: 'Every knob added by hand, with what it needs',
      condition: 'INVALID_VALUE', fields: ['xspot.target', 'xspot.offset', 'xspot.place'] }]);
    assert.equal(result.request, null);
    await page.waitForTimeout(600);
    assert.equal(cutCalls(log), calls, 'a malformed added knob never reaches the Store');

    // Completed, the changed revision is admitted and reaches the Store on the same one door.
    const target = await seat.evaluate(() => window.STBWindowSeat.definition().feats[0].id);
    await set('xs-target', target, 'change');
    await set('xs-off', '3');
    await set('xs-place', 'CENTER', 'change');
    await until(async () => (await seat.evaluate(() => window.STBWindowSeat.state())).asking === false, 'idle');
    const reached = cutCalls(log);
    result = await seat.evaluate(() => window.STBWindowSeat.inquire(window.STBWindowSeat.revision()));
    assert.equal(result.admission.result, 'ADMITTED');
    await until(() => cutCalls(log) > reached, 'completed revision reaches the Store');
    sent = log.filter(e => e.request.projectId === 'window-seat').pop().request;
    assert.ok(JSON.stringify(sent.payload.definition).includes('-X1'), 'the extra spot is on the wire');

    // No Window Seat inquiry, admitted or blocked, called the old door.
    assert.ok(cutCalls(log) >= before + 2);
    assert.deepEqual(await seatOldDoorCalls(page), []);

    // Control: the recorder is live. The old door still runs for a direct sendJob call, and is counted.
    const direct = await seat.evaluate(() => window.STBStoreClient.sendJob({
      projectId: 'window-seat', requestType: 'CUT_PACKAGE_V1', candidateRevisionId: 'control', payload: {},
    }).then(() => 'sent', error => String(error?.message || error)));
    assert.match(direct, /SYSTEM_ADMISSION_/);
    assert.deepEqual(await seatOldDoorCalls(page), ['window-seat']);
    assert.deepEqual(errors, []);
  }, null, { [OLD_DOOR]: recordOldDoor });
});
