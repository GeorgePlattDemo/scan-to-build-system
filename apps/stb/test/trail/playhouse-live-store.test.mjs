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
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.css': 'text/css' };

// Serves the public build, answers stb-store-runtime.json with a loopback endpoint, and passes every Store
// POST to the real adapter. `tamper` lets one test hand the page an answer meant for someone else.
function serve(adapter, log, tamper = null) {
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
  throw new Error('Playhouse never settled on a Store answer');
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

async function withBrowser(fn, tamper = null) {
  await requireCleanPinnedStore();
  const adapter = await createStoreAdapter();
  assert.equal(adapter.ready, true, JSON.stringify(adapter.inspection));
  assert.ok(adapter.modules.sheetPackage, 'the pinned Store must carry the S-001 sheet evaluator for this suite');
  const log = [];
  const server = await serve(adapter, log, tamper);
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
    // A SUPPORTABLE answer for this version opens steps 4–6.
    const inert = await navInert(frame);
    assert.equal(inert.request, false);
    assert.equal(inert.yard, false);
    assert.equal(inert.record, false);
    await frame.locator('.recovery-nav button[data-journey-stage="record"]').click();
    await frame.page().waitForTimeout(300);
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
    assert.match(await frame.locator('#s001-live-reasons').innerText(), /CENTER_WORK_FIELD_EXCEEDED/);
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
