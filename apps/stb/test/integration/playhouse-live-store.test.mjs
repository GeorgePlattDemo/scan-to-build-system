// Playhouse on the live Store path, end to end in a browser.
// The page's own definition goes through the shared browser Store client to the real System adapter and the
// real pinned Store evaluator (in process; nothing scripted). Run it with STB_STORE_ZERO_ROOT at a clean Store
// checkout whose HEAD is the pin under test; for a candidate Store version use
// test/candidate/run-with-candidate-store.mjs.
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

import { STORE_PIN } from '../../shared/contracts.mjs';
import { createStoreAdapter } from '../../server/store-adapter.mjs';
import { requireCleanPinnedStore } from '../store/helpers.mjs';

const ROOT = fileURLToPath(new URL('../../public-build/', import.meta.url));
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.css': 'text/css' };

// Serves the public build, answers stb-store-runtime.json with a loopback endpoint, and passes every Store
// POST to the real adapter. `tamper` lets one test hand the page an answer meant for someone else.
// `rewrite` lets one test serve a public-build file with changed text.
function serve(adapter, log, tamper = null, rewrite = null) {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x');
    if (url.pathname === '/stb-store-runtime.json') {
      const { port } = server.address();
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ jobEndpoint: `http://127.0.0.1:${port}/api/store-zero/job`, storePin: STORE_PIN }));
      return;
    }
    if (url.pathname === '/api/store-zero/job' && req.method === 'POST') {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      let result = await adapter.dispatch(body);
      if (tamper) result = tamper(body, result) || result;
      log.push({ request: body, status: result.status, answer: result.body });
      res.writeHead(result.status, { 'content-type': 'application/json' });
      res.end(JSON.stringify(result.body));
      return;
    }
    const rel = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'system-build-current.html';
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
    if (rewrite?.[rel]) { res.end(rewrite[rel](fs.readFileSync(file, 'utf8'))); return; }
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

async function baseFrame(page) {
  for (let i = 0; i < 40; i++) {
    const frame = page.frames().find(f => f.url().includes('system-build-base-8d8a9dd.html'));
    if (frame && await frame.$('#landing')) return frame;
    await page.waitForTimeout(150);
  }
  throw new Error('base frame not found');
}

async function openPlayhouse(browser, origin) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(origin + '/system-build-current.html', { waitUntil: 'load' });
  const frame = await baseFrame(page);
  await frame.locator('#landing button', { hasText: 'NEW USER' }).first().click();
  await frame.locator('#new-user [data-door-forward]').click();
  await page.waitForTimeout(400);
  await frame.locator('#projects .tile', { hasText: 'Playhouse arched window' }).first().click();
  await page.waitForTimeout(600);
  return { page, frame, errors };
}

async function settled(frame) {
  for (let i = 0; i < 80; i++) {
    const s = await frame.evaluate(() => window.STBPlayhouseLive?.state());
    if (s && !s.asking && (s.answer || s.error)) return s;
    await frame.page().waitForTimeout(100);
  }
  throw new Error('Playhouse never settled on a Store answer: ' + JSON.stringify(await frame.evaluate(() => window.STBPlayhouseLive?.state() ?? null)));
}

async function setGeometry(frame, { width, straight, rise }) {
  await frame.evaluate(({ width, straight, rise }) => {
    const set = (id, v) => { if (v == null) return; const e = document.getElementById(id); e.value = String(v); e.dispatchEvent(new Event('input')); };
    set('s001-opening-width', width); set('s001-straight-height', straight); set('s001-arch-rise', rise);
  }, { width, straight, rise });
}

async function navInert(frame) {
  return frame.$$eval('.recovery-nav button[data-job-project="playhouse"]', els =>
    Object.fromEntries(els.filter(e => !e.hidden).map(e => [e.dataset.journeyStage, e.disabled || e.getAttribute('aria-disabled') === 'true'])));
}

async function withBrowser(fn, tamper = null, rewrite = null) {
  await requireCleanPinnedStore();
  const adapter = await createStoreAdapter();
  assert.equal(adapter.ready, true, JSON.stringify(adapter.inspection));
  assert.ok(adapter.modules.sheetPackage, 'the pinned Store must carry the S-001 sheet evaluator for this suite');
  const log = [];
  const server = await serve(adapter, log, tamper, rewrite);
  const browser = await chromium.launch(process.env.STB_CHROMIUM_PATH ? { executablePath: process.env.STB_CHROMIUM_PATH } : {});
  try {
    await fn({ browser, origin: `http://127.0.0.1:${server.address().port}`, log });
  } finally {
    await browser.close();
    server.close();
  }
}

test('Playhouse asks the live Store for its own definition and shows that fresh answer', { timeout: 180000 }, async () => {
  await withBrowser(async ({ browser, origin, log }) => {
    const { frame, errors } = await openPlayhouse(browser, origin);
    const state = await settled(frame);
    assert.equal(state.error, null);
    assert.equal(state.answer.evaluation.status, 'SUPPORTABLE');
    // What went out is the Playhouse definition, as the project defines it, on the Playhouse request type.
    const sheetCalls = log.filter(e => e.request.requestType === 'SHEET_PACKAGE_V1');
    assert.equal(sheetCalls.length, 1);
    const sent = sheetCalls[0].request;
    assert.equal(sent.projectId, 'playhouse');
    assert.equal(sent.expectedStorePin, STORE_PIN);
    assert.deepEqual(sent.payload.definition, await frame.evaluate(() => window.STBPlayhouseLive.definition()));
    assert.deepEqual(sent.payload.definition.features.map(f => [f.featureId, f.kind]),
      [['OPENING', 'ARCHED_APERTURE'], ['CENTER-SPLIT', 'STRAIGHT_SPLIT'], ['CUT-LEFT', 'CROSSCUT'], ['CUT-RIGHT', 'CROSSCUT']]);
    assert.equal(state.answer.receipt.requestId, sent.requestId);
    assert.equal(state.answer.storePin, STORE_PIN);
    // The page shows the Store's own numbers, not a local copy.
    await frame.evaluate(() => window.show('playhouse-store'));
    await frame.page().waitForTimeout(300);
    const q = state.answer.evaluation.totals.Q;
    assert.match(await frame.locator('#s001-live-q').innerText(), new RegExp('\\$' + q.toFixed(2).replace('.', '\\.')));
    assert.match(await frame.locator('#s001-live-status').innerText(), /SUPPORTABLE/);
    assert.match(await frame.locator('#s001-live-receipt').innerText(), new RegExp(String(state.answer.receipt.receiptHash).slice(0, 16)));
    assert.doesNotMatch(await frame.locator('#playhouse-store').innerText(), /\$26\.55 material-only|4402abe|SHEET_MODE2_ARCHED_APERTURE_V0/);
    // A SUPPORTABLE answer opens step 4 (your call). Steps 5 and 6 wait for the terms flow: accepted, then ready.
    const inert = await navInert(frame);
    assert.equal(inert.request, false);
    assert.equal(inert.yard, true);
    assert.equal(inert.record, true);
    assert.match(await frame.locator('#playhouse-record').innerText(), new RegExp(STORE_PIN));
    assert.deepEqual(errors, []);
  });
});

test('a changed opening is asked again as a new calculation; returning to it asks fresh again', { timeout: 180000 }, async () => {
  await withBrowser(async ({ browser, origin, log }) => {
    const { frame } = await openPlayhouse(browser, origin);
    const first = await settled(frame);
    await setGeometry(frame, { width: 30 });
    const changed = await settled(frame);
    assert.notEqual(changed.version, first.version);
    assert.notEqual(changed.answer.evaluation.calculationIdentity.inputHash, first.answer.evaluation.calculationIdentity.inputHash);
    await setGeometry(frame, { width: 36 });
    const back = await settled(frame);
    const calls = log.filter(e => e.request.requestType === 'SHEET_PACKAGE_V1');
    assert.equal(calls.length, 3, 'every changed version is a new request');
    // Same definition asked twice: two fresh receipts, one calculation.
    assert.notEqual(back.answer.receipt.receiptHash, first.answer.receipt.receiptHash);
    assert.deepEqual(back.answer.evaluation.calculationIdentity, first.answer.evaluation.calculationIdentity);
  });
});

test('an opening past the working field is REFUSED by the Store, with its reason, and steps 4–6 stay closed', { timeout: 180000 }, async () => {
  await withBrowser(async ({ browser, origin, log }) => {
    const { frame } = await openPlayhouse(browser, origin);
    await settled(frame);
    await setGeometry(frame, { straight: 30, rise: 12 });
    const state = await settled(frame);
    // The page sent the geometry as the customer set it; it did not shrink it to fit.
    const sent = log.filter(e => e.request.requestType === 'SHEET_PACKAGE_V1').pop().request.payload.definition.features[0];
    assert.equal(sent.straightHeightIn, 30);
    assert.equal(sent.riseIn, 12);
    assert.equal(state.answer.evaluation.status, 'REFUSED');
    await frame.evaluate(() => window.show('playhouse-store'));
    await frame.page().waitForTimeout(300);
    assert.match(await frame.locator('#s001-live-reasons').textContent(), /CENTER_WORK_FIELD_EXCEEDED/);
    assert.equal(await frame.locator('#s001-live-q').innerText(), '—');
    const inert = await navInert(frame);
    assert.equal(inert.request, true);
    assert.equal(inert.yard, true);
    assert.equal(inert.record, true);
    // Trying the step anyway leaves the page where it was.
    const before = await frame.evaluate(() => [...document.querySelectorAll('.page.on')].pop()?.id);
    await frame.evaluate(() => window.show('request'));
    assert.equal(await frame.evaluate(() => [...document.querySelectorAll('.page.on')].pop()?.id), before);
    assert.equal(await frame.locator('#playhouse-review [data-s001-needs-supportable]').isDisabled(), true);
  });
});

test('an arch too tall for its width is REFUSED; the page does not correct it', { timeout: 180000 }, async () => {
  await withBrowser(async ({ browser, origin }) => {
    const { frame } = await openPlayhouse(browser, origin);
    await settled(frame);
    await setGeometry(frame, { width: 12, straight: 12, rise: 12 });
    const state = await settled(frame);
    assert.equal(state.answer.evaluation.status, 'REFUSED');
    assert.ok(state.answer.evaluation.refusalConditions.includes('ARCH_RISE_EXCEEDS_HALF_WIDTH'));
    assert.equal((await navInert(frame)).request, true);
  });
});

test('Playhouse will not show an answer meant for another project or another version', { timeout: 180000 }, async () => {
  // The transport hands back an answer re-labeled for another project. The shared client and the page reject it.
  const tamper = (request, result) => {
    if (request.requestType !== 'SHEET_PACKAGE_V1') return null;
    return { ...result, body: { ...result.body, projectId: 'window-seat' } };
  };
  await withBrowser(async ({ browser, origin }) => {
    const { frame } = await openPlayhouse(browser, origin);
    const state = await settled(frame);
    assert.equal(state.answer, null);
    assert.equal(state.error, 'STORE_CORRELATION_ERROR');
    assert.equal((await navInert(frame)).request, true);
  }, tamper);
});

test('a Store that cannot answer leaves Playhouse with no answer and closed steps, never a reference answer', { timeout: 180000 }, async () => {
  const tamper = (request) => request.requestType === 'SHEET_PACKAGE_V1'
    ? { status: 503, body: { adapterError: true, code: 'STORE_CAPABILITY_NOT_AT_PIN', storePin: STORE_PIN } }
    : null;
  await withBrowser(async ({ browser, origin }) => {
    const { frame } = await openPlayhouse(browser, origin);
    const state = await settled(frame);
    assert.equal(state.answer, null);
    assert.equal(state.error, 'STORE_CAPABILITY_NOT_AT_PIN');
    await frame.evaluate(() => window.show('playhouse-store'));
    await frame.page().waitForTimeout(300);
    assert.match(await frame.locator('#s001-live-status').innerText(), /COULD NOT ANSWER/);
    assert.equal((await navInert(frame)).yard, true);
  }, tamper);
});

// ---------- On the shared tile host (STB-TILE-HOST-0.1 and admit()) ----------
const TRAIL_STEPS = ['Intent', 'The bench', 'The Store answers', 'Your call', 'We cut it', 'Pick up & build'];

async function playhouseNav(frame) {
  return frame.$$eval('.recovery-nav button[data-job-project="playhouse"]', els => els.filter(e => !e.hidden).map(e => ({
    stage: e.dataset.journeyStage,
    label: e.textContent.trim(),
    inert: e.disabled || e.getAttribute('aria-disabled') === 'true',
    current: e.getAttribute('aria-current') === 'step',
  })));
}

test('the shared host draws the Playhouse nav from its validated STB-TILE-HOST-0.1 message', { timeout: 180000 }, async () => {
  await withBrowser(async ({ browser, origin }) => {
    const { frame, errors } = await openPlayhouse(browser, origin);
    await settled(frame);
    await frame.page().waitForTimeout(300);
    const message = await frame.evaluate(() => window.STBPlayhouseLive.hostMessage());
    assert.deepEqual(Object.keys(message).sort(), ['interface', 'navigationRequest', 'stage', 'tileId', 'usableSteps']);
    assert.equal(message.interface, 'STB-TILE-HOST-0.1');
    assert.equal(message.tileId, 'playhouse');
    assert.equal(message.stage, 'Intent');
    assert.deepEqual(message.usableSteps, TRAIL_STEPS.slice(0, 4));
    assert.equal(await frame.evaluate(() => document.documentElement.dataset.tileHostRejected ?? null), null);
    const nav = await playhouseNav(frame);
    // One line, contract labels in trail order, inert steps shown disabled, exactly one current.
    assert.deepEqual(nav.map(b => b.label), TRAIL_STEPS.map((step, i) => `${i + 1} · ${step}`));
    assert.deepEqual(nav.map(b => b.inert), [false, false, false, false, true, true]);
    assert.deepEqual(nav.filter(b => b.current).map(b => b.label), ['1 · Intent']);
    // Moving to the bench moves the current step with it.
    await frame.locator('.recovery-nav button[data-job-project="playhouse"][data-journey-stage="configure"]').click();
    await frame.page().waitForTimeout(400);
    assert.deepEqual((await playhouseNav(frame)).filter(b => b.current).map(b => b.label), ['2 · The bench']);
    assert.deepEqual(errors, []);
  });
});

test('a missing profile fact blocks before the Store and names its owner; a complete revision still reaches the Store', { timeout: 180000 }, async () => {
  await withBrowser(async ({ browser, origin, log }) => {
    const { frame } = await openPlayhouse(browser, origin);
    await settled(frame);
    const sheetCalls = () => log.filter(e => e.request.requestType === 'SHEET_PACKAGE_V1').length;
    const before = sheetCalls();

    for (const [factId, owner, title] of [
      ['playhouse.opening', 'USER', 'Complete arched-opening geometry'],
      ['playhouse.sheet', 'PROJECT', 'Real sheet dimensions'],
    ]) {
      const admission = await frame.evaluate(id => {
        const revision = window.STBPlayhouseLive.revision();
        delete revision.facts[id];
        revision.definitionRevisionId += '-without-' + id;
        return window.STBPlayhouseLive.inquire(revision);
      }, factId);
      assert.equal(admission.admission.result, 'BLOCKED');
      assert.equal(admission.admission.reason, 'REQUIRED_FACT_UNSETTLED');
      assert.deepEqual(admission.admission.blocking, [{ factId, owner, title, condition: 'MISSING' }]);
      assert.equal(admission.request, null);
      await frame.page().waitForTimeout(600);
      assert.equal(sheetCalls(), before, factId + ': a blocked revision never reaches the Store');
      const state = await frame.evaluate(() => window.STBPlayhouseLive.state());
      assert.equal(state.answer, null);
      assert.equal(state.asking, false);
      assert.match(await frame.locator('#s001-live-status').textContent(), new RegExp(title + ' · owner ' + owner));
      // Not admitted: The Store answers and every later step are inert.
      const inert = Object.fromEntries((await playhouseNav(frame)).map(b => [b.stage, b.inert]));
      assert.deepEqual(inert, { scan: false, configure: false, store: true, request: true, yard: true, record: true });
    }

    // A complete revision, outside the envelope or not, is admitted and reaches the Store.
    await frame.evaluate(() => window.STBPlayhouseLive.inquire(window.STBPlayhouseLive.revision()));
    const state = await settled(frame);
    assert.equal(state.admission.result, 'ADMITTED');
    assert.equal(state.answer.evaluation.status, 'SUPPORTABLE');
    assert.equal(sheetCalls(), before + 1);
    const inert = Object.fromEntries((await playhouseNav(frame)).map(b => [b.stage, b.inert]));
    assert.equal(inert.store, false);
    assert.equal(inert.request, false);
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
// Other tiles (the Outdoor page asks its options on load) still use the old door; only Playhouse calls are read.
const playhouseOldDoorCalls = page => Promise.all(page.frames().map(f => f.evaluate(() => window.__stbOldDoorCalls ?? [])))
  .then(lists => lists.flat().filter(projectId => projectId === 'playhouse'));

test('a Playhouse inquiry has one admission decision, admit(); it never calls admitPublicStoreRequest', { timeout: 180000 }, async () => {
  await withBrowser(async ({ browser, origin, log }) => {
    const { page, frame, errors } = await openPlayhouse(browser, origin);
    const sheetCalls = () => log.filter(e => e.request.requestType === 'SHEET_PACKAGE_V1').length;

    // A complete revision still reaches the Store.
    const first = await settled(frame);
    assert.equal(first.admission.result, 'ADMITTED');
    assert.equal(first.answer.evaluation.status, 'SUPPORTABLE');
    assert.equal(sheetCalls(), 1);
    // A changed complete revision is asked again, on the same one door.
    await setGeometry(frame, { width: 30 });
    const changed = await settled(frame);
    assert.notEqual(changed.version, first.version);
    assert.equal(changed.admission.result, 'ADMITTED');
    assert.equal(sheetCalls(), 2);

    // A malformed opening (settled, but its rise is not above 0) still blocks before the Store, in admit().
    const before = sheetCalls();
    const blocked = await frame.evaluate(() => {
      const revision = window.STBPlayhouseLive.revision();
      revision.facts['playhouse.opening'].value.riseIn = 0;
      revision.definitionRevisionId += '-malformed-opening';
      return window.STBPlayhouseLive.inquire(revision);
    });
    assert.equal(blocked.admission.result, 'BLOCKED');
    assert.equal(blocked.admission.reason, 'REQUIRED_FACT_UNSETTLED');
    assert.deepEqual(blocked.admission.blocking, [{ factId: 'playhouse.opening', owner: 'USER',
      title: 'Complete arched-opening geometry', condition: 'INVALID_VALUE', fields: ['riseIn'] }]);
    assert.equal(blocked.request, null);
    await page.waitForTimeout(600);
    assert.equal(sheetCalls(), before, 'a malformed opening never reaches the Store');

    // No Playhouse inquiry, admitted or blocked, called the old door.
    assert.deepEqual(await playhouseOldDoorCalls(page), []);

    // Control: the recorder is live. The old door still runs for a direct sendJob call, and is counted.
    const direct = await page.evaluate(() => window.STBStoreClient.sendJob({
      projectId: 'playhouse', requestType: 'SHEET_PACKAGE_V1', candidateRevisionId: 'control', payload: {},
    }).then(() => 'sent', error => String(error?.message || error)));
    assert.match(direct, /SYSTEM_ADMISSION_/);
    assert.deepEqual(await playhouseOldDoorCalls(page), ['playhouse']);
    assert.equal(sheetCalls(), before);
    assert.deepEqual(errors, []);
  }, null, { [OLD_DOOR]: recordOldDoor });
});
