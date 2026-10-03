// Trail scoreboard, live-Store half: rules 4–6 for every tile, against the real System adapter and the real
// pinned Store evaluator (test/integration/helpers.mjs). Run with STB_STORE_ZERO_ROOT at a clean Store checkout
// whose HEAD is STORE_PIN.
//
//   R4  "The Store answers" is a fresh answer from the Store for the current definition.
//   R5  Within the envelope: Store answer → simulated offer → your call → paid (simulated) → yard → pickup
//       and a terms / handoff receipt. Past it: the choice is declined with its reason and steps 4–6 stay inert.
//   R6  One terms flow for every tile: the shared stb-terms-flow.js chain, thirteen events, each event after
//       the Store answer hash-linked to the one before. Declining ends the chain at "your call".
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { withBrowser, openTile, STORE_PIN } from './helpers.mjs';

const wait = (page, ms) => page.waitForTimeout(ms);
const frameOf = (page, part) => page.frames().find(f => f.url().includes(part));
const activePage = frame => frame.evaluate(() => [...document.querySelectorAll('.page.on')].pop()?.id);
async function navInert(frame, projectId) {
  return frame.$$eval(`.recovery-nav button[data-job-project="${projectId}"]`, els =>
    Object.fromEntries(els.filter(e => !e.hidden).map(e => [e.dataset.journeyStage, e.disabled || e.getAttribute('aria-disabled') === 'true'])));
}
async function terms(win, projectId) {
  return win.evaluate(id => window.STBTermsFlow.instance(id)?.state() ?? null, projectId);
}
async function until(fn, label, tries = 80) {
  for (let i = 0; i < tries; i++) { const v = await fn(); if (v) return v; await new Promise(r => setTimeout(r, 150)); }
  throw new Error('timed out: ' + label);
}
function assertFullChain(state, label) {
  assert.equal(state.stage, 'HANDED_OFF', label + ': handed off');
  assert.deepEqual(state.events.map(e => e.id),
    ['sent', 'arrived', 'answered', 'offered', 'decision', 'paid', 'queued', 'allocated', 'released', 'cut', 'staged', 'ready', 'custody'], label + ': thirteen events in order');
  assert.ok(state.events.slice(0, 3).every(e => typeof e.hash === 'string' && e.hash.length > 0), label + ': sent, arrived and answered carry Store hashes');
  assert.match(state.events[3].detail, /^SIMULATED_OFFER · /, label + ': System creates the simulated offer after the Store answer');
  for (let i = 3; i < state.events.length; i++) {
    assert.equal(state.events[i].prevHash, state.events[i - 1].hash, label + ': ' + state.events[i].id + ' links to ' + state.events[i - 1].id);
  }
  assert.equal(state.events[4].detail, 'ACCEPTED');
  assert.ok(state.receipt && state.receipt.events.length === 13, label + ': terms / handoff receipt at custody');
  assert.equal(state.receipt.storePin, STORE_PIN, label + ': receipt names the pinned Store');
}
function assertAnswered(state, log, requestType, projectId, label) {
  assert.equal(state?.stage, 'ANSWERED', label + ': fresh SUPPORTABLE answer reached the terms flow');
  const sent = log.filter(e => e.request.requestType === requestType && e.request.projectId === projectId);
  assert.ok(sent.length > 0, label + ': asked the Store on ' + requestType);
  const last = sent[sent.length - 1];
  assert.equal(last.answer.evaluationReceipt?.authority?.storeRevision, STORE_PIN, label + ': answered by the pinned Store');
  assert.equal(state.events[1].hash, last.answer.evaluationReceipt.receiptHash, label + ': arrival hash is the Store receipt');
  assert.equal(state.events[0].hash, last.request.payloadDigest, label + ': sent hash is the request payload digest');
  assert.equal(state.events.length, 3, label + ': Store answer is not silently promoted into a simulated offer');
}
function requestsFor(log, tile) {
  return log.filter(e => e.request.requestType === tile.requestType && e.request.projectId === tile.projectId);
}
function committedRequestFor(tile, entries) {
  if (tile.projectId !== 'outdoor') return entries.at(-1) ?? null;
  return [...entries].reverse().find(e => e.request.payload?.definition?.configurationId !== 'OUTDOOR-PICNIC-OPTIONS') ?? null;
}
function omittedPayload(tile, payload) {
  const copy = JSON.parse(JSON.stringify(payload));
  if (tile.projectId === 'start-own') delete copy.line.parts;
  else if (tile.projectId === 'alcove') delete copy.definition.boardRequirements;
  else if (tile.projectId === 'playhouse') delete copy.definition.sheet;
  else delete copy.definition.cutPackages;
  return copy;
}

// ---------- Tile drivers: each reaches a fresh Store answer the way a customer would ----------
const TILES = {
  playhouse: {
    label: 'Playhouse arched window', projectId: 'playhouse', requestType: 'SHEET_PACKAGE_V1',
    async answer({ page, frame }) {
      await until(() => frame.evaluate(() => { const s = window.STBPlayhouseLive?.state(); return s && !s.asking && (s.answer || s.error); }), 'playhouse answer');
      return { win: page };
    },
    call: frame => frame.evaluate(() => window.show('playhouse-request')),
    hosts: { call: '#playhouse-request .s001-terms-host', yard: '#playhouse-yard .s001-terms-host', record: '#playhouse-record .s001-terms-host' },
    async invalid({ page, frame, log }) {
      const before = requestsFor(log, TILES.playhouse).length;
      await frame.evaluate(() => { const e = document.getElementById('s001-straight-height'); e.value = '30'; e.dispatchEvent(new Event('input')); });
      await until(() => frame.evaluate(() => { const s = window.STBPlayhouseLive.state(); return !s.asking && s.answer?.evaluation?.status === 'REFUSED'; }), 'playhouse refusal');
      assert.ok(requestsFor(log, TILES.playhouse).length > before, 'playhouse: complete out-of-envelope geometry still reaches Store');
      return { win: page, reason: 'CENTER_WORK_FIELD_EXCEEDED' };
    },
  },
  alcove: {
    label: 'Critical fit', projectId: 'alcove', requestType: 'ALCOVE_INSERT_V1',
    async answer({ page, frame }) {
      // Alcove opens on its Idea intake; the Idea line's one way on is Intent.
      await frame.locator('.recovery-nav button.job-idea-onward').click();
      await frame.locator('.recovery-nav button[data-journey-stage="configure"]').click();
      await wait(page, 800);
      await frame.locator('#confirm-alcove-inline').click();
      await until(async () => (await terms(page, 'alcove'))?.stage === 'ANSWERED', 'alcove answer');
      return { win: page };
    },
    call: frame => frame.locator('.recovery-nav button[data-journey-stage="request"]').click(),
    hosts: { call: '#request .alcove-terms-host', yard: '#yard .alcove-terms-host', record: '#record .alcove-terms-host' },
    async invalid({ page, frame }) {
      // Alcove opens on its Idea intake; the Idea line's one way on is Intent.
      await frame.locator('.recovery-nav button.job-idea-onward').click();
      await frame.locator('.recovery-nav button[data-journey-stage="configure"]').click();
      await wait(page, 800);
      await frame.locator('[data-material="cherry"]').first().click();
      await frame.locator('#confirm-alcove-inline').click();
      await until(async () => (await terms(page, 'alcove'))?.stage === 'REFUSED_BY_STORE', 'alcove refusal');
      return { win: page, reason: null };
    },
  },
  'start-own': {
    label: 'Start your own', projectId: 'start-own', requestType: 'USER_DEFINED_BOARD_V1',
    async answer({ page, frame }) {
      await frame.locator('.recovery-nav button[data-journey-stage="configure"]').click();
      await wait(page, 1500);
      // The bench has no default species; the user states one before confirming.
      await frameOf(page, 'three-frames.html').locator('#stb-bench-species [data-species="spf"]').click();
      await frameOf(page, 'three-frames.html').locator('#stb-confirm-store').click();
      await until(async () => (await terms(page, 'start-own'))?.stage === 'ANSWERED', 'job 1 answer');
      return { win: page };
    },
    call: frame => frame.locator('.recovery-nav button[data-journey-stage="request"]').click(),
    hosts: { call: '#proof-accept .start-own-terms-host', yard: '#proof-yard .start-own-terms-host', record: '#proof-record .start-own-terms-host' },
    beforeRecord: frame => frame.locator('#proof-yard-handoff').click(),
    invalid: null, // Job 1 offers only in-envelope choices (16 in or 18 in parts); nothing on the bench can be past the envelope.
  },
  outdoor: {
    label: 'Outdoor build', projectId: 'outdoor', requestType: 'CUT_PACKAGE_V1',
    async answer({ page }) {
      const outdoor = await until(async () => { const f = frameOf(page, 'stb-outdoor-picnic-0.4.html'); return f && await f.$('#plans .plan') ? f : null; }, 'outdoor frame');
      await outdoor.locator('[data-plan="table-benches"]').click();
      await outdoor.waitForSelector('#instant .total:not(.none)', { timeout: 30000 });
      await until(async () => (await terms(outdoor, 'outdoor'))?.stage === 'ANSWERED', 'outdoor answer');
      return { win: outdoor };
    },
    // 0.4: screen 2 (the plan as published, with the Store's answer) → Confirm & send → your call.
    call: async (frame, win) => { await win.locator('#confirm').click(); },
    inner: true,
    hosts: { call: '#call-terms', yard: '#yard-terms', record: '#record-terms' },
    async invalid({ page }) {
      // The largest size the plan rule offers, 216 in: the Store has no board long enough, and says so.
      const { win } = await TILES.outdoor.answer({ page });
      await win.evaluate(() => window.STBOutdoorPicnic.setLength(216));
      await until(async () => (await terms(win, 'outdoor'))?.stage === 'REFUSED_BY_STORE', 'outdoor refusal');
      assert.equal(await win.locator('#confirm').isDisabled(), true, 'outdoor: no way to your call past the envelope');
      return { win, reason: 'PART_LONGER_THAN_LONGEST_STOCKED_BOARD|PART_NOT_HALF_INCH_UNDER_BOARD|NO_MATCHING_BOARD_OFFERING' };
    },
  },
  'window-seat': {
    label: 'Space utilization', projectId: 'window-seat', requestType: 'CUT_PACKAGE_V1',
    async answer({ page }) {
      const seat = await until(() => frameOf(page, 'stb-window-seat-0.9.html'), 'seat frame');
      await frameOf(page, 'system-build-base-8d8a9dd.html').locator('.recovery-nav [data-presentation-fork="Intent"]').click();
      await seat.locator('#s-intent [data-to="bench"]').click();
      await seat.locator('#btn-ask').click();
      await until(async () => (await terms(seat, 'window-seat'))?.stage === 'ANSWERED', 'window seat answer');
      return { win: seat };
    },
    call: (frame, win) => win.locator('#btn-call').click(),
    inner: true,
    hosts: { call: '#call-terms', yard: '#yard-terms', record: '#record-terms' },
    async invalid({ page }) {
      // Window Seat checks its own geometry first: a bench past what the drawing allows is declined with its
      // reason before any Store request, and the Store is never asked for it.
      const seat = await until(() => frameOf(page, 'stb-window-seat-0.9.html'), 'seat frame');
      await frameOf(page, 'system-build-base-8d8a9dd.html').locator('.recovery-nav [data-presentation-fork="Intent"]').click();
      await seat.locator('#s-intent [data-to="bench"]').click();
      await seat.evaluate(() => { const e = document.getElementById('c-wC'); e.value = '84'; e.dispatchEvent(new Event('input')); });
      await wait(page, 300);
      const blocks = await seat.evaluate(() => window.STBWindowSeat.conditions().filter(c => c.block).map(c => c.t));
      assert.ok(blocks.length > 0 && blocks.every(t => t.length > 0), 'window seat: the refusal names its reason');
      return { win: seat, reason: null, systemBlock: blocks[0] };
    },
  },
};

async function walkToHandoff(tile, ctx) {
  const { page, frame } = ctx;
  const { win } = await tile.answer(ctx);
  const inner = tile.inner ? win : frame;
  assertAnswered(await terms(win, tile.projectId), ctx.log, tile.requestType, tile.projectId, tile.projectId);
  if (!tile.inner) assert.equal((await navInert(frame, tile.projectId)).yard, true, tile.projectId + ': yard closed before acceptance');
  await tile.call(frame, win);
  await wait(page, 600);
  await inner.locator(`${tile.hosts.call} [data-terms-action="accept"]`).click();
  await until(async () => (await terms(win, tile.projectId))?.stage === 'QUEUED', tile.projectId + ' queued');
  await wait(page, 600);
  await inner.locator(`${tile.hosts.yard} [data-terms-action="yard"]`).click();
  await until(async () => (await terms(win, tile.projectId))?.stage === 'READY', tile.projectId + ' ready');
  await wait(page, 600);
  if (tile.beforeRecord) { await tile.beforeRecord(frame); await wait(page, 600); }
  await inner.locator(`${tile.hosts.record} [data-terms-action="pickup"]`).click();
  await until(async () => (await terms(win, tile.projectId))?.stage === 'HANDED_OFF', tile.projectId + ' handed off');
  await wait(page, 400);
  const state = await terms(win, tile.projectId);
  assertFullChain(state, tile.projectId);
  assert.equal(await win.evaluate(s => window.STBTermsFlow.verify(s), state), true);
  assert.equal(await inner.locator(`${tile.hosts.record} [data-terms-receipt]`).count(), 1, tile.projectId + ': terms / handoff receipt shown');
  assert.equal(await inner.locator(`${tile.hosts.record} [data-terms-state="done"]`).count(), 13, tile.projectId + ': every event shown done');
  if (!tile.inner) {
    const inert = await navInert(frame, tile.projectId);
    assert.ok(!inert.request && !inert.yard && !inert.record, tile.projectId + ': steps 4–6 open after handoff');
  }
}

for (const [id, tile] of Object.entries(TILES)) {
  test(`R4–R6 ${id}: fresh Store answer → simulated offer → accept & send → yard → pickup → terms / handoff receipt`, { timeout: 240000 }, async () => {
    await withBrowser(async ({ browser, origin, log }) => {
      const { page, frame, errors } = await openTile(browser, origin, tile.label);
      await walkToHandoff(tile, { page, frame, log });
      assert.deepEqual(errors, []);
    });
  });

  test(`R5 ${id}: declining the simulated offer ends the chain at your call; yard and pickup stay closed`, { timeout: 240000 }, async () => {
    await withBrowser(async ({ browser, origin, log }) => {
      const { page, frame } = await openTile(browser, origin, tile.label);
      const { win } = await tile.answer({ page, frame, log });
      const inner = tile.inner ? win : frame;
      await tile.call(frame, win);
      await wait(page, 600);
      await inner.locator(`${tile.hosts.call} [data-terms-action="decline"]`).click();
      const state = await until(async () => { const s = await terms(win, tile.projectId); return s?.stage === 'DECLINED' ? s : null; }, id + ' declined');
      assert.equal(state.events.length, 5);
      assert.match(state.events[3].detail, /^SIMULATED_OFFER · /);
      assert.equal(state.events[4].detail, 'DECLINED');
      assert.equal(state.events[4].prevHash, state.events[3].hash);
      assert.equal(state.yardOpen, false);
      assert.equal(state.recordOpen, false);
      if (!tile.inner) {
        const inert = await navInert(frame, tile.projectId);
        assert.ok(inert.yard && inert.record, id + ': yard and pickup inert after decline');
      }
    });
  });

  test(`R5 ${id}: an invalid choice is declined with its reason and steps 4–6 stay inert`, { timeout: 240000 }, async () => {
    await withBrowser(async ({ browser, origin, log }) => {
      const { page, frame } = await openTile(browser, origin, tile.label);
      if (!tile.invalid) {
        // Nothing on this tile can be past the envelope; before any Store answer, steps 4–6 are inert.
        const inert = await navInert(frame, tile.projectId);
        assert.ok(inert.request && inert.yard && inert.record, id + ': steps 4–6 inert before a Store answer');
        return;
      }
      const result = await tile.invalid({ page, frame, log });
      const state = await terms(result.win, tile.projectId);
      if (result.systemBlock) {
        assert.notEqual(state?.stage, 'ANSWERED');
        assert.equal(state?.canAccept ?? false, false);
      } else {
        assert.equal(state.stage, 'REFUSED_BY_STORE', id + ': refused by the Store');
        assert.ok(state.reasons.length > 0 && state.reasons.every(r => r.code), id + ': the refusal carries its reasons');
        if (result.reason) assert.ok(state.reasons.some(r => new RegExp(result.reason).test(r.code)), id + ': ' + JSON.stringify(state.reasons));
        assert.equal(state.canAccept, false);
      }
      if (!tile.inner) {
        const inert = await navInert(frame, tile.projectId);
        assert.ok(inert.request && inert.yard && inert.record, id + ': steps 4–6 inert past the envelope ' + JSON.stringify(inert));
      } else {
        const hostFrame = page.frames().find(f => f.url().includes('system-build-base-8d8a9dd.html'));
        const inert = await navInert(hostFrame, tile.projectId);
        assert.ok(inert.request && inert.yard && inert.record, id + ': steps 4–6 inert past the envelope ' + JSON.stringify(inert));
      }
    });
  });
}

// ---------- Shared admission seam: same assertions, project-specific fixtures ----------
test('public admission deployment uses the exact shared definition contract bytes', () => {
  const canonical = fs.readFileSync(new URL('../../shared/definition-contract.mjs', import.meta.url));
  const deployed = fs.readFileSync(new URL('../../public-build/shared/definition-contract.mjs', import.meta.url));
  assert.deepEqual(deployed, canonical);
});

for (const [id, tile] of Object.entries(TILES)) {
  test(`ADMISSION ${id}: an omitted required fact cannot reach the Store even if caller says ready`, { timeout: 240000 }, async () => {
    await withBrowser(async ({ browser, origin, log }) => {
      const { page, frame } = await openTile(browser, origin, tile.label);
      const { win } = await tile.answer({ page, frame, log });
      const entries = requestsFor(log, tile);
      const baseline = committedRequestFor(tile, entries);
      assert.ok(baseline, id + ': baseline request exists before omission test');
      const before = log.length;
      const payload = omittedPayload(tile, baseline.request.payload);
      const clientWindow = (id === 'window-seat' || id === 'outdoor') ? win : page;
      const result = await clientWindow.evaluate(async input => {
        try {
          await window.STBStoreClient.sendJob({
            projectId: input.projectId,
            requestType: input.requestType,
            candidateRevisionId: input.candidateRevisionId,
            payload: input.payload,
            ready: true,
          });
          return { ok:true };
        } catch (error) {
          return { ok:false, code:error?.code || null, message:String(error?.message || error) };
        }
      }, {
        projectId:tile.projectId,
        requestType:tile.requestType,
        candidateRevisionId:baseline.request.candidateRevisionId,
        payload,
      });
      assert.equal(result.ok, false, id + ': omitted fact is blocked');
      assert.match(result.code || result.message, /SYSTEM_ADMISSION_/, id + ': shared seam names an admission failure');
      assert.equal(log.length, before, id + ': omitted fact never creates a Store POST');
    });
  });
}

test('ADMISSION window-seat: an unmapped source board fails closed instead of shrinking the Store package', { timeout: 240000 }, async () => {
  await withBrowser(async ({ browser, origin, log }) => {
    const { page, frame } = await openTile(browser, origin, TILES['window-seat'].label);
    const { win:seat } = await TILES['window-seat'].answer({ page, frame, log });
    const before = requestsFor(log, TILES['window-seat']).length;
    const result = await seat.evaluate(async () => {
      const source = window.STBWindowSeat.definition();
      const request = JSON.parse(JSON.stringify(window.STBWindowSeat.request()));
      const liveSent = new Set((request.cutPackages || []).flatMap(pkg => pkg.parts || []).map(part => part.partId));
      const liveMissing = source.boards.map(board => board.id).filter(id => !liveSent.has(id));
      if (liveMissing.length === 0) {
        const pkg = (request.cutPackages || []).find(item => Array.isArray(item.parts) && item.parts.length);
        if (pkg) pkg.parts = pkg.parts.slice(1);
      }
      const sent = new Set((request.cutPackages || []).flatMap(pkg => pkg.parts || []).map(part => part.partId));
      const missing = source.boards.map(board => board.id).filter(id => !sent.has(id));
      try {
        await window.STBStoreClient.sendJob({
          projectId: 'window-seat',
          requestType: 'CUT_PACKAGE_V1',
          candidateRevisionId: request.configurationVersion,
          payload: { definition: request, definitionKind: 'cut_package.v1', ruleVersion: '0.1' },
          ready: true,
        });
        return { ok:true, missing };
      } catch (error) {
        return { ok:false, code:error?.code || null, message:String(error?.message || error), missing };
      }
    });
    assert.ok(result.missing.length > 0, 'fixture exposes at least one defined board missing from the outgoing package');
    assert.equal(result.ok, false, 'shrunken package is blocked');
    assert.match(String(result.message || ''), /SYSTEM_ADMISSION_/, 'shared seam names an admission failure');
    assert.match(String(result.message || ''), /UNMAPPED_PART:/, 'admission names the unmapped part');
    assert.ok(result.missing.some(id => String(result.message || '').includes(id)), 'admission names the missing board id');
    assert.equal(requestsFor(log, TILES['window-seat']).length, before, 'unmapped board never reaches Store');
  });
});

test('ADMISSION outdoor: options inquiry cannot satisfy the committed job answer', { timeout: 240000 }, async () => {
  await withBrowser(async ({ browser, origin, log }) => {
    const { page, frame } = await openTile(browser, origin, TILES.outdoor.label);
    const { win } = await TILES.outdoor.answer({ page, frame, log });
    const entries = requestsFor(log, TILES.outdoor);
    const options = entries.filter(entry => entry.request.payload?.definition?.configurationId === 'OUTDOOR-PICNIC-OPTIONS');
    const committed = entries.filter(entry => entry.request.payload?.definition?.configurationId !== 'OUTDOOR-PICNIC-OPTIONS');
    assert.ok(options.length > 0, 'outdoor: options inquiry reached Store under its own scope');
    assert.ok(committed.length > 0, 'outdoor: committed job reached Store');
    const state = await terms(win, 'outdoor');
    const sentHash = state.events.find(event => event.id === 'sent')?.hash;
    assert.ok(committed.some(entry => entry.request.payloadDigest === sentHash), 'outdoor: terms flow is bound to committed request');
    assert.ok(options.every(entry => entry.request.payloadDigest !== sentHash), 'outdoor: options answer cannot satisfy committed job');
  });
});
