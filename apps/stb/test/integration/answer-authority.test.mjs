// One rule, on the five tiles already on the shared tile host, against the real System adapter and the real pinned
// Store evaluator (test/integration/helpers.mjs). Run with STB_STORE_ZERO_ROOT at a clean Store checkout whose HEAD
// is STORE_PIN.
//
//   A Store answer authorizes nothing unless it is the fresh answer for this exact revision and this inquiry scope.
//
// For every tile:
//   1. A fresh in-envelope answer opens Your call. That live answer, saved and reopened, comes back as history and
//      opens nothing. The same answer handed in for another revision or another scope opens nothing. The tile's own
//      inquiry about another revision does not open Your call for the revision on the page.
//   2. A changed definition asks again. The previous answer does not carry forward.
//   3. A refusal leaves steps 4–6 inert, though the refusal itself is the current answer.
// The host nav (the shared tile host's drawing of each tile's validated message) is what is checked, not page state.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

import { withBrowser, openTile } from './helpers.mjs';
import {
  ANSWER_AUTHORITY,
  availableSteps,
  isCurrentAnswer,
  reopenJobRecord,
} from '../../shared/tile-host-admission-contract.mjs';

const ROOT = fileURLToPath(new URL('../../public-build/', import.meta.url));
const sandbox = {};
vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'stb-trail-contract.js'), 'utf8'), sandbox, { filename: 'stb-trail-contract.js' });
const trail = sandbox.STBTrailContract;
const YOUR_CALL = trail.steps[3];

const wait = (page, ms) => page.waitForTimeout(ms);
const frameOf = (page, part) => page.frames().find(f => f.url().includes(part));
async function until(fn, label, tries = 120) {
  for (let i = 0; i < tries; i++) { const v = await fn(); if (v) return v; await new Promise(r => setTimeout(r, 150)); }
  throw new Error('timed out: ' + label);
}
// The shared tile host's nav for one tile: stage -> inert.
async function navInert(frame, projectId) {
  return frame.$$eval(`.recovery-nav button[data-job-project="${projectId}"]`, els =>
    Object.fromEntries(els.filter(e => !e.hidden).map(e => [e.dataset.journeyStage, e.disabled || e.getAttribute('aria-disabled') === 'true'])));
}
const stepsFourToSixInert = nav => nav.request === true && nav.yard === true && nav.record === true;
const storeCalls = (log, tile) => log.filter(e => e.request.projectId === tile.projectId && e.request.requestType === tile.requestType
  && e.request.payload?.definition?.configurationId !== 'OUTDOOR-PICNIC-OPTIONS');

// ---------- Tile drivers: each reaches the live Store the way a customer would, and reads its own hook ----------
// snap() -> { admission, answer, onScreen }: the admission the tile gates on, the stamps of the answer it holds, and
// the revision on the page now.
const TILES = {
  playhouse: {
    label: 'Playhouse arched window', projectId: 'playhouse', requestType: 'SHEET_PACKAGE_V1', scope: 'SHEET_PACKAGE_V1', otherScope: 'WINDOW_SEAT_COMMITTED',
    win: ({ frame }) => frame,
    snap: ({ frame }) => frame.evaluate(() => {
      const L = window.STBPlayhouseLive, s = L.state();
      return { admission: L.admission(), answer: s.answer && { authority: s.answer.authority, definitionRevisionId: s.answer.definitionRevisionId, inquiryScope: s.answer.inquiryScope },
        status: s.answer?.evaluation?.status ?? null, asking: s.asking, onScreen: L.revision().definitionRevisionId };
    }),
    async answer(ctx) {
      await until(async () => { const s = await TILES.playhouse.snap(ctx); return !s.asking && s.status === 'SUPPORTABLE'; }, 'playhouse answer');
    },
    inquire: ({ frame }, revision) => frame.evaluate(rv => window.STBPlayhouseLive.inquire(rv), revision),
    revision: ({ frame }) => frame.evaluate(() => window.STBPlayhouseLive.revision()),
    async change({ frame }) {
      await frame.evaluate(() => { const e = document.getElementById('s001-opening-width'); e.value = '30'; e.dispatchEvent(new Event('input')); });
    },
    async fresh() {},
    async refuse({ frame }) {
      await frame.evaluate(() => { const e = document.getElementById('s001-straight-height'); e.value = '30'; e.dispatchEvent(new Event('input')); });
      await until(() => frame.evaluate(() => { const s = window.STBPlayhouseLive.state(); return !s.asking && s.answer?.evaluation?.status === 'REFUSED'; }), 'playhouse refusal');
    },
  },
  alcove: {
    label: 'Critical fit', projectId: 'alcove', requestType: 'ALCOVE_INSERT_V1', scope: 'ALCOVE_INSERT_V1', otherScope: 'USER_DEFINED_BOARD_V1',
    win: ({ frame }) => frame,
    snap: ({ frame }) => frame.evaluate(() => {
      const L = window.STBAlcoveLive, a = window.STBAlcoveStoreAnswer;
      return { admission: L.admission(), answer: a && a.authority ? { authority: a.authority, definitionRevisionId: a.definitionRevisionId, inquiryScope: a.inquiryScope } : null,
        status: a?.rawEvaluation?.status ?? a?.status ?? null, asking: L.state().asking, onScreen: L.revision().definitionRevisionId };
    }),
    async answer({ page, frame }) {
      // Alcove opens on its Idea intake; the Idea line's one way on is Intent.
      await frame.locator('.recovery-nav button.job-idea-onward').click();
      await frame.locator('.recovery-nav button[data-journey-stage="configure"]').click();
      await wait(page, 800);
      await frame.locator('#confirm-alcove-inline').click();
      await until(() => page.evaluate(() => window.STBTermsFlow.instance('alcove')?.state()?.stage === 'ANSWERED'), 'alcove answer');
    },
    inquire: ({ frame }, revision) => frame.evaluate(rv => window.STBAlcoveLive.inquire(rv), revision),
    revision: ({ frame }) => frame.evaluate(() => window.STBAlcoveLive.revision()),
    async change({ page, frame }) {
      await frame.locator('.recovery-nav button[data-journey-stage="configure"]').click();
      await wait(page, 500);
      await frame.locator('[data-material="poplar"]').first().click();
    },
    async fresh({ frame }) { await frame.locator('#confirm-alcove-inline').click(); },
    async refuse({ page, frame }) {
      await frame.locator('.recovery-nav button[data-journey-stage="configure"]').click();
      await wait(page, 800);
      await frame.locator('[data-material="cherry"]').first().click();
      await frame.locator('#confirm-alcove-inline').click();
      await until(() => page.evaluate(() => window.STBTermsFlow.instance('alcove')?.state()?.stage === 'REFUSED_BY_STORE'), 'alcove refusal');
    },
  },
  'start-own': {
    label: 'Start your own', projectId: 'start-own', requestType: 'USER_DEFINED_BOARD_V1', scope: 'USER_DEFINED_BOARD_V1', otherScope: 'ALCOVE_INSERT_V1',
    win: ({ frame }) => frame,
    snap: ({ frame }) => frame.evaluate(() => {
      const L = window.STBStartOwnLive, s = L.state();
      return { admission: L.admission(), answer: s.answer, status: null, asking: s.asking, onScreen: L.revision()?.definitionRevisionId ?? null };
    }),
    async answer({ page, frame }) {
      await frame.locator('.recovery-nav button[data-journey-stage="configure"]').click();
      await wait(page, 1500);
      // The bench has no default species; the user states one before confirming.
      await frameOf(page, 'three-frames.html').locator('#stb-bench-species [data-species="spf"]').click();
      await frameOf(page, 'three-frames.html').locator('#stb-confirm-store').click();
      await until(() => page.evaluate(() => window.STBTermsFlow.instance('start-own')?.state()?.stage === 'ANSWERED'), 'job 1 answer');
    },
    inquire: ({ frame }, revision) => frame.evaluate(rv => window.STBStartOwnLive.inquire(rv), revision),
    revision: ({ frame }) => frame.evaluate(() => window.STBStartOwnLive.revision()),
    async change({ page, frame }) {
      await frame.locator('.recovery-nav button[data-journey-stage="configure"]').click();
      await wait(page, 600);
      await frameOf(page, 'three-frames.html').locator('button[data-length="18"]').click();
    },
    // Start your own keeps its human gate: a changed definition is asked only when the user confirms it.
    async fresh({ page }) { await frameOf(page, 'three-frames.html').locator('#stb-confirm-store').click(); },
    // Job 1 offers only in-envelope choices on its bench; the Store's refusal is reached through the tile's own
    // inquiry hook with a definition past the envelope (the same admit() and inquire() path the bench uses): a
    // 46-degree saw angle, which the Store refuses (test/store/pinned.test.mjs).
    async refuse(ctx) {
      const revision = await TILES['start-own'].revision(ctx);
      revision.definitionRevisionId += '-past-envelope';
      revision.facts['start-own.datum'].value.sawAngleDeg = 46;
      const result = await TILES['start-own'].inquire(ctx, revision);
      assert.equal(result.reachedStore, true, 'start-own: a complete request past the envelope still reaches the Store');
      assert.notEqual(result.answer.status, 'SUPPORTABLE', 'start-own: the Store refuses it');
      return { offScreen: true };
    },
  },
  outdoor: {
    label: 'Outdoor build', projectId: 'outdoor', requestType: 'CUT_PACKAGE_V1', scope: 'OUTDOOR_COMMITTED', otherScope: 'OUTDOOR_OPTIONS',
    win: ({ page }) => frameOf(page, 'stb-outdoor-picnic-0.4.html'),
    snap: ctx => TILES.outdoor.win(ctx).evaluate(() => {
      const L = window.STBOutdoorPicnic, s = L.state(), admission = L.admission();
      return { admission, answer: s.answer && !s.answer.stale ? { authority: s.answer.authority, definitionRevisionId: s.answer.definitionRevisionId, inquiryScope: s.answer.inquiryScope } : null,
        status: null, asking: s.asking, error: s.error, onScreen: admission?.definitionRevisionId ?? null };
    }),
    async answer({ page, frame }) {
      const od = await until(async () => { const f = frameOf(page, 'stb-outdoor-picnic-0.4.html'); return f && await f.$('#plans .plan') ? f : null; }, 'outdoor frame');
      // Outdoor opens on its Idea intake; the Idea line's one way on is Intent.
      await frame.locator('.recovery-nav button.job-idea-onward').click();
      await od.locator('[data-plan="table-benches"]').click();
      await until(() => od.evaluate(() => window.STBTermsFlow.instance('outdoor')?.state()?.stage === 'ANSWERED'), 'outdoor answer');
    },
    inquire: (ctx, revision) => TILES.outdoor.win(ctx).evaluate(rv => window.STBOutdoorPicnic.inquire(rv), revision),
    revision: ctx => TILES.outdoor.win(ctx).evaluate(() => window.STBOutdoorPicnic.revision()),
    async change(ctx) {
      await ctx.frame.locator('.recovery-nav button[data-journey-stage="configure"]').click();
      await wait(ctx.page, 350);
      await TILES.outdoor.win(ctx).locator('#s-build [data-size="1"]').click();
    },
    async fresh() {},
    async refuse(ctx) {
      // The largest size the plan rule offers, 216 in: the Store has no board long enough, and says so.
      const od = TILES.outdoor.win(ctx);
      await od.evaluate(() => window.STBOutdoorPicnic.setLength(216));
      await until(() => od.evaluate(() => window.STBTermsFlow.instance('outdoor')?.state()?.stage === 'REFUSED_BY_STORE'), 'outdoor refusal');
    },
  },
  'window-seat': {
    label: 'Space utilization', projectId: 'window-seat', requestType: 'CUT_PACKAGE_V1', scope: 'WINDOW_SEAT_COMMITTED', otherScope: 'OUTDOOR_COMMITTED',
    win: ({ page }) => frameOf(page, 'stb-window-seat-0.9.html'),
    snap: ctx => TILES['window-seat'].win(ctx).evaluate(() => {
      const L = window.STBWindowSeat, s = L.state(), admission = L.admission();
      return { admission, answer: s.answer && !s.answer.stale ? { authority: s.answer.authority, definitionRevisionId: s.answer.definitionRevisionId, inquiryScope: s.answer.inquiryScope } : null,
        status: null, asking: s.asking, error: s.error, onScreen: admission?.definitionRevisionId ?? null };
    }),
    async answer({ page }) {
      const seat = await until(() => frameOf(page, 'stb-window-seat-0.9.html'), 'seat frame');
      await frameOf(page, 'system-build-base-8d8a9dd.html').locator('.recovery-nav [data-presentation-fork="Intent"]').click();
      await seat.locator('#s-intent [data-to="bench"]').click();
      await seat.locator('#btn-ask').click();
      await until(() => seat.evaluate(() => window.STBTermsFlow.instance('window-seat')?.state()?.stage === 'ANSWERED'), 'window seat answer');
    },
    inquire: (ctx, revision) => TILES['window-seat'].win(ctx).evaluate(rv => window.STBWindowSeat.inquire(rv), revision),
    revision: ctx => TILES['window-seat'].win(ctx).evaluate(() => window.STBWindowSeat.revision()),
    async change(ctx) {
      await ctx.frame.locator('.recovery-nav button[data-journey-stage="configure"]').click();
      await wait(ctx.page, 350);
      await TILES['window-seat'].win(ctx).locator('#depth-panel [data-depth="0.25"]').click();
    },
    async fresh(ctx) { await TILES['window-seat'].win(ctx).locator('#btn-ask').click(); },
    async refuse(ctx) {
      // A wood the Store does not stock for these boards: the bench asks, and the Store refuses.
      const seat = TILES['window-seat'].win(ctx);
      await ctx.frame.locator('.recovery-nav button[data-journey-stage="configure"]').click();
      await wait(ctx.page, 350);
      await seat.locator('#species [data-material="cherry"]').click();
      await until(() => seat.evaluate(() => window.STBTermsFlow.instance('window-seat')?.state()?.stage === 'REFUSED_BY_STORE'), 'window seat refusal');
    },
  },
};

// The tile holds a fresh in-envelope answer for the revision on the page, under its own scope, and the host nav
// shows Your call usable.
async function freshInEnvelope(tile, ctx, label) {
  const s = await until(async () => {
    const v = await tile.snap(ctx);
    return !v.asking && v.answer && v.admission && v.answer.definitionRevisionId === v.onScreen ? v : null;
  }, label + ': fresh answer for the revision on the page');
  assert.equal(s.answer.authority, ANSWER_AUTHORITY.CURRENT, label);
  assert.equal(s.answer.inquiryScope, tile.scope, label + ': the answer names its inquiry scope');
  assert.equal(s.admission.inquiryScope, tile.scope, label);
  assert.equal(s.answer.definitionRevisionId, s.admission.definitionRevisionId, label);
  assert.equal(isCurrentAnswer({ admission: s.admission, answer: s.answer }), true, label);
  await until(async () => (await navInert(ctx.frame, tile.projectId)).request === false, label + ': Your call usable on the host nav');
  return s;
}

for (const [id, tile] of Object.entries(TILES)) {
  test(`ANSWER AUTHORITY ${id}: a fresh in-envelope answer opens Your call; history, another revision and another scope do not`, { timeout: 240000 }, async () => {
    await withBrowser(async ({ browser, origin, log }) => {
      const { page, frame, errors } = await openTile(browser, origin, tile.label);
      const ctx = { page, frame, log };
      await tile.answer(ctx);
      const live = await freshInEnvelope(tile, ctx, id);
      const fresh = { ...live.answer, withinEnvelope: true };
      assert.ok(availableSteps({ trail, admission: live.admission, freshAnswer: fresh }).includes(YOUR_CALL), id + ': the live answer opens Your call');

      // Saved and reopened, the live answer is history, even though it names the current revision and scope.
      const reopened = reopenJobRecord({ trail, record: {
        tileId: id, currentRevisionId: live.admission.definitionRevisionId, inquiryScope: tile.scope, lastStage: YOUR_CALL,
        revisions: [await tile.revision(ctx)], storeAnswers: [fresh], savedUsableSteps: [...trail.steps],
      } });
      const saved = reopened.history.storeAnswers[0];
      assert.equal(reopened.current.admission.definitionRevisionId, live.admission.definitionRevisionId, id + ': reopened on the same revision');
      assert.equal(saved.authority, ANSWER_AUTHORITY.HISTORY, id + ': a saved answer comes back as history');
      assert.equal(reopened.current.storeAnswer, null, id);
      assert.ok(!reopened.current.usableSteps.includes(YOUR_CALL), id + ': reopening does not open Your call');
      assert.ok(!availableSteps({ trail, admission: reopened.current.admission, freshAnswer: saved }).includes(YOUR_CALL), id + ': history handed back as fresh');

      // The same live answer for another revision, or another scope, opens nothing.
      const otherRevision = { ...live.admission, definitionRevisionId: live.admission.definitionRevisionId + '-other' };
      assert.ok(!availableSteps({ trail, admission: otherRevision, freshAnswer: fresh }).includes(YOUR_CALL), id + ': answer for another revision');
      assert.ok(!availableSteps({ trail, admission: live.admission, freshAnswer: { ...fresh, inquiryScope: tile.otherScope } }).includes(YOUR_CALL), id + ': answer for another scope');

      // Through the tile itself: an inquiry about another revision does not open Your call for the one on the page.
      const before = storeCalls(log, tile).length;
      const other = await tile.revision(ctx);
      other.definitionRevisionId += '-other';
      await tile.inquire(ctx, other);
      const after = await until(async () => { const v = await tile.snap(ctx); return v.asking ? null : v; }, id + ': other revision settled');
      assert.notEqual(after.onScreen, other.definitionRevisionId, id + ': the page still shows its own revision');
      if (after.answer?.definitionRevisionId === other.definitionRevisionId) {
        // The Store answered the other revision: that answer is current only for it, never for the page's revision.
        assert.equal(storeCalls(log, tile).at(-1).request.candidateRevisionId, other.definitionRevisionId, id);
        assert.equal(storeCalls(log, tile).length, before + 1, id);
      } else {
        // The page refused to send a revision that is not on screen; the Store was not asked.
        assert.equal(after.error, 'ADMITTED_REVISION_NOT_ON_SCREEN', id + ': ' + JSON.stringify(after));
        assert.equal(storeCalls(log, tile).length, before, id);
      }
      await wait(page, 400);
      assert.equal((await navInert(frame, tile.projectId)).request, true, id + ': Your call inert for an answer about another revision');
      assert.deepEqual(errors, []);
    });
  });

  test(`ANSWER AUTHORITY ${id}: a changed definition asks again; the previous answer does not carry forward`, { timeout: 240000 }, async () => {
    await withBrowser(async ({ browser, origin, log }) => {
      const { page, frame, errors } = await openTile(browser, origin, tile.label);
      const ctx = { page, frame, log };
      await tile.answer(ctx);
      const first = await freshInEnvelope(tile, ctx, id + ' before the change');
      const before = storeCalls(log, tile).length;

      await tile.change(ctx);
      const changed = await until(async () => { const v = await tile.snap(ctx); return v.onScreen && v.onScreen !== first.onScreen ? v : null; }, id + ': definition changed');
      // The previous answer is not current for the changed definition, whatever the tile still holds.
      const nowAdmission = changed.admission?.definitionRevisionId === changed.onScreen ? changed.admission
        : { ...first.admission, definitionRevisionId: changed.onScreen };
      assert.equal(isCurrentAnswer({ admission: nowAdmission, answer: first.answer }), false, id + ': the previous answer does not carry forward');
      assert.ok(!availableSteps({ trail, admission: nowAdmission, freshAnswer: { ...first.answer, withinEnvelope: true } }).includes(YOUR_CALL), id);
      if (id === 'start-own') {
        // Not yet confirmed, so not yet asked: Your call is inert on the host nav until the Store answers again.
        await until(async () => (await navInert(frame, tile.projectId)).request === true, id + ': Your call inert after the change');
      }

      await tile.fresh(ctx);
      const second = await freshInEnvelope(tile, ctx, id + ' after the change');
      assert.notEqual(second.answer.definitionRevisionId, first.answer.definitionRevisionId, id + ': a new answer for the new revision');
      const asked = storeCalls(log, tile).slice(before);
      assert.ok(asked.some(e => e.request.candidateRevisionId === second.answer.definitionRevisionId), id + ': the changed definition was asked again');
      assert.deepEqual(errors, []);
    });
  });

  test(`ANSWER AUTHORITY ${id}: a refusal leaves steps 4–6 inert`, { timeout: 240000 }, async () => {
    await withBrowser(async ({ browser, origin, log }) => {
      const { page, frame, errors } = await openTile(browser, origin, tile.label);
      const ctx = { page, frame, log };
      await tile.answer(ctx);
      await freshInEnvelope(tile, ctx, id);
      const before = storeCalls(log, tile).length;
      const result = await tile.refuse(ctx) || {};
      assert.ok(storeCalls(log, tile).length > before, id + ': the refused definition reached the Store');
      const refused = storeCalls(log, tile).at(-1);
      assert.notEqual(refused.answer.rawEvaluation?.status ?? refused.answer.status, 'SUPPORTABLE', id + ': the Store refused it');
      if (!result.offScreen) {
        // The refusal is the current answer: fresh, for this exact revision and scope. Only the envelope closes Your call.
        const s = await until(async () => { const v = await tile.snap(ctx); return !v.asking && v.answer?.definitionRevisionId === v.onScreen ? v : null; }, id + ': refusal is current');
        assert.equal(isCurrentAnswer({ admission: s.admission, answer: s.answer }), true, id + ': the refusal is the current answer');
      }
      await wait(page, 400);
      const nav = await navInert(frame, tile.projectId);
      assert.ok(stepsFourToSixInert(nav), id + ': steps 4–6 inert after a refusal ' + JSON.stringify(nav));
      assert.deepEqual(errors, []);
    });
  });
}
