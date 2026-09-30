// Window Seat 0.9 on the trail: the fully worked example follows the same rules as every tile.
// - Page 1 is her idea, with the two routes stated on it: the regular path and one long scroll.
// - Intent makes the knobs, including any added by hand. The bench only turns them; it has no way to add one.
// - Both routes are one state, one definition and one Store request: the request is identical from either.
// - The request is a plain cut-package request the System wire accepts (rule 4: the live Store answers).
// - Depth stays the customer's number: boards that aren't that wide are edge-milled, and the finished width travels
//   in the cut package for the Store to time, price or refuse. The page keeps no copy of the mill's limit.
// - Spot facing for shelf pins travels inside each tower side's own boards, in the Store's declared placements.
// - The long scroll ends in an audit copy: the definition, what was sent and the Store answer, as plain text.
// Answers from the real pinned Store are checked in test/integration/window-seat-journey.test.mjs.

import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { buildCutPackageRequest, cutPackageDemandSignature, cutPackageJobPayload, validateWireRequest } from '../../shared/store-wire.mjs';

const ROOT = fileURLToPath(new URL('../../public-build/', import.meta.url));
const FILE = 'stb-window-seat-0.9.html';
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png' };

// Serves public-build. Store requests are recorded exactly as sent and answered "unavailable": this test checks what
// the page sends, never a Store answer.
function serve(sent) {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x');
    if (url.pathname === '/stb-store-runtime.json') {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ jobEndpoint: `http://127.0.0.1:${server.address().port}/api/store-zero/job`, storePin: '0'.repeat(40) }));
      return;
    }
    if (url.pathname === '/api/store-zero/job' && req.method === 'POST') {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      sent.push(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      res.writeHead(503, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ adapterError: true, code: 'STORE_ZERO_UNAVAILABLE' }));
      return;
    }
    const rel = decodeURIComponent(url.pathname).replace(/^\/+/, '');
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

async function wireOk(definition) {
  const payload = cutPackageJobPayload(definition);
  const request = await buildCutPackageRequest({
    requestId: 'window-seat-test', projectId: 'window-seat', candidateRevisionId: definition.configurationVersion,
    attemptId: 'attempt-1', attemptNumber: 1, sentAt: new Date().toISOString(),
    demandSignature: await cutPackageDemandSignature(payload), payload,
  });
  return validateWireRequest(request);
}
const request = page => page.evaluate(() => window.STBWindowSeat.request());
const setRange = (page, id, value) => page.locator('#' + id).evaluate((e, v) => { e.value = v; e.dispatchEvent(new Event('input')); }, String(value));
async function asked(page) {
  for (let i = 0; i < 100; i++) {
    const s = await page.evaluate(() => window.STBWindowSeat.state());
    if (!s.asking && (s.error || s.answered)) return s;
    await page.waitForTimeout(100);
  }
  throw new Error('the page never finished asking');
}

test('Window Seat 0.9: one job, two routes, same rules, live-Store request', { timeout: 180000 }, async () => {
  const sent = [];
  const server = await serve(sent);
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch(process.env.STB_CHROMIUM_PATH ? { executablePath: process.env.STB_CHROMIUM_PATH } : {});
  try {
    // ── The regular path ──
    const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(`${origin}/${FILE}`, { waitUntil: 'load' });

    // Page 1 is her idea, alone, with both routes on it.
    assert.equal(await page.evaluate(() => document.body.dataset.view), 'trail');
    assert.deepEqual(await page.locator('.step:visible').evaluateAll(els => els.map(e => e.id)), ['s-hero']);
    assert.equal(await page.locator('#fork [data-route="trail"]').count(), 1);
    assert.equal(await page.locator('#fork [data-route="whole"]').count(), 1);
    assert.equal(await page.locator('[data-nav="request"]').isDisabled(), true, 'your call is inert before a Store answer');
    // Each page's Dev/Rev rail is a slot filled from the app's one guide file.
    assert.equal(await page.locator('aside.rail[data-guide-id]').count(), 8);
    assert.match(await page.locator('#s-hero aside.rail').innerText(), /DEV GUIDE|DEV\/REV GUIDE/);
    assert.match(await page.locator('#s-hero aside.rail').innerText(), /window-seat-hero/);

    await page.locator('#fork [data-route="trail"]').click();
    assert.deepEqual(await page.locator('.step:visible').evaluateAll(els => els.map(e => e.id)), ['s-intent']);
    assert.equal(await page.locator('[data-nav="scan"]').getAttribute('class'), 'pill on', 'both idea pages sit on step 1');

    // The knob rule: every knob, including those added by hand, is made on the intent page. The bench shows exactly
    // those knobs and has no control that adds one.
    const knobs = await page.evaluate(() => window.STBWindowSeat.knobs());
    assert.equal(knobs.length, 14);
    assert.equal(await page.locator('#knob-table tbody tr').count(), 14);
    assert.ok(await page.locator('#s-intent [data-add]').count() >= 4, 'add a knob by hand lives on the intent page');
    assert.equal(await page.locator('#s-bench [data-add], #s-bench [data-kept]').count(), 0, 'the bench adds no knob');
    assert.deepEqual((await page.evaluate(() => window.STBWindowSeat.benchKnobs())).sort(), [...knobs].sort());

    // The sketch's 14 in depth over two boards is 7 in each: 1×8 select pine, edge-milled to 7 in.
    let req = await request(page);
    assert.deepEqual([...new Set(req.cutPackages.map(p => p.material.nominalW))], [8]);
    assert.ok(req.cutPackages.every(p => p.material.species === 'pine' && p.material.grade === 'select'));
    assert.ok(req.cutPackages.every(p => p.finishedWidthIn === 7), 'finished width travels to the Store');
    assert.ok((await wireOk(req)).ok, 'System wire accepts the Window Seat request');
    assert.match(await page.locator('#ws-reg').innerText(), /Edge-mill 1×8 boards to 7 in wide/);
    const firstVersion = req.configurationVersion;
    assert.match(firstVersion, /^ws-r\d+-[0-9a-f]{8}$/);

    await page.locator('#s-intent [data-to="bench"]').click();
    assert.deepEqual(await page.locator('.step:visible').evaluateAll(els => els.map(e => e.id)), ['s-bench']);
    assert.equal(await page.locator('#btn-call').isDisabled(), true);

    // Boards across the depth: 2 at 14 in by the stated rule (fewest 1× boards that cover the depth).
    assert.equal(await page.locator('#v-runs').innerText(), '2 (by the rule)');
    // At 15 in the rule still gives 2 boards: 1×10s edge-milled to 7½ in. Whether the mill takes 1¾ in off is the
    // Store's answer, so the page doesn't block it; the pinned Store's refusal is checked in window-seat-journey.
    await setRange(page, 'c-d', 15);
    assert.equal(await page.locator('#v-runs').innerText(), '2 (by the rule)');
    req = await request(page);
    assert.ok(req.cutPackages.every(p => p.material.nominalW === 10 && p.finishedWidthIn === 7.5));
    assert.equal((await page.evaluate(() => window.STBWindowSeat.conditions())).some(c => c.block), false, 'no browser copy of the mill limit');
    assert.notEqual(req.configurationVersion, firstVersion, 'a changed bench is a new version identity');
    // Turning the knob to 3 boards: 1×6s milled to 5 in, and the wire accepts it.
    await page.locator('#c-runs [data-n="3"]').click();
    assert.equal(await page.locator('#v-runs').innerText(), '3 (set by hand)');
    req = await request(page);
    assert.ok(req.cutPackages.every(p => p.material.nominalW === 6 && p.finishedWidthIn === 5));
    assert.ok((await wireOk(req)).ok);
    await page.locator('#c-runs [data-n="derived"]').click();
    await setRange(page, 'c-d', 14);

    // Depth is the customer's number, a quarter inch at a time; the boards are milled to match.
    await page.locator('#depth-panel [data-depth="0.25"]').click();
    assert.equal(await page.locator('#v-d').innerText(), '14 1/4 in');
    assert.match(await page.locator('#v-runw').innerText(), /1×8 .* edge-milled to 7 1\/8 in/);
    assert.ok((await request(page)).cutPackages.every(p => p.finishedWidthIn === 7.125));
    await page.locator('#depth-panel [data-depth="-0.25"]').click();

    // A depth that lands on a board sends no milling.
    await page.locator('#p-depth button', { hasText: 'USE 14 1/2 IN' }).click();
    assert.doesNotMatch(await page.locator('#ws-reg').innerText(), /Edge-mill/);
    assert.ok((await request(page)).cutPackages.every(p => p.finishedWidthIn === undefined));

    // Spot facing for shelf pins is a knob added by hand on the intent page, then turned on the bench:
    // 2 in from the edge, one spot per board, per tower side, per shelf.
    assert.equal(await page.locator('#c-spot-place').count(), 0, 'not on the bench until intent adds it');
    // A missing knob sends you back to intent; the bench has no way to add it.
    await page.locator('#s-bench .backlink [data-to="intent"]').click();
    assert.deepEqual(await page.locator('.step:visible').evaluateAll(els => els.map(e => e.id)), ['s-intent']);
    await page.locator('#add-knobs [data-add="spots"]').check();
    await page.locator('#s-intent [data-to="bench"]').click();
    assert.deepEqual((await page.evaluate(() => window.STBWindowSeat.knobs())).filter(k => !knobs.includes(k)), ['SPOTS']);
    await page.locator('#c-spot-place button', { hasText: '2 in' }).click();
    req = await request(page);
    const spots = req.cutPackages.flatMap(p => p.parts).flatMap(part => part.spots || []);
    assert.equal(spots.length, (4 + 4) * 2 * 2);
    assert.ok(spots.every(s => s.acrossWidthRule === 'INSET_FROM_EDGE' && s.insetFromEdgeIn === 2));
    const spotted = req.cutPackages.flatMap(p => p.parts).filter(part => part.spots);
    assert.ok(spotted.every(part => /^[LR]-UPRIGHT-/.test(part.partId)), 'spots only on tower sides');
    assert.ok((await wireOk(req)).ok, 'System wire accepts spotted parts');
    assert.match(req.configurationVersion, /^ws-r\d+-[0-9a-f]{8}$/);

    // Every Store answer carries the shared Store Zero text and "What happens next", all twelve steps.
    assert.match(await page.locator('#store-doctrine').innerText(), /Store Zero is a declared reference lumberyard/);
    assert.match(await page.locator('#store-doctrine').innerText(), /What happens next/);
    assert.equal(await page.locator('#store-doctrine .s').count(), 12);

    // Ask from the regular path: exactly one request for this version.
    const trailRequest = await request(page);
    let n = sent.length;
    await page.locator('#btn-ask').click();
    const s1 = await asked(page);
    assert.equal(sent.length - n, 1, 'one Store request');
    assert.deepEqual(sent[n].payload.definition, trailRequest);
    assert.match(s1.error, /STORE_ZERO_UNAVAILABLE/, 'no answer stays no answer');
    assert.match(await page.locator('#store-panel').innerText(), /Nothing is shown in its place/);
    assert.equal(await page.locator('[data-nav="request"]').isDisabled(), true);
    assert.deepEqual(errors, []);

    // ── One long scroll: the same job, set the same way ──
    const whole = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
    const errors2 = [];
    whole.on('pageerror', e => errors2.push(e.message));
    await whole.goto(`${origin}/${FILE}`, { waitUntil: 'load' });
    await whole.locator('#fork [data-route="whole"]').click();
    assert.equal(await whole.evaluate(() => document.body.dataset.view), 'whole');
    assert.equal(await whole.locator('.step:visible').count(), 8, 'seven pages and the audit copy');
    await whole.locator('#p-depth button', { hasText: 'USE 14 1/2 IN' }).click();
    await whole.locator('#add-knobs [data-add="spots"]').check();
    await whole.locator('#c-spot-place button', { hasText: '2 in' }).click();
    n = sent.length;
    await whole.locator('#btn-ask').click();
    await asked(whole);
    assert.equal(sent.length - n, 1, 'one Store request');
    // The fork: one state, one definition, one Store request, whichever route.
    assert.deepEqual(sent[n].payload.definition, sent[n - 1].payload.definition, 'the request is identical from both routes');
    assert.equal(sent[n].payloadDigest, sent[n - 1].payloadDigest);
    assert.equal(sent[n].demandSignature, sent[n - 1].demandSignature);

    // The audit copy: the full definition, what was sent, and the Store answer, as plain copyable text.
    const audit = await whole.locator('#audit-text').innerText();
    assert.equal(audit, await whole.evaluate(() => window.STBWindowSeat.auditText()));
    assert.equal(await whole.locator('#copy-audit').count(), 1);
    for (const heading of ['1 · IDENTIFIED DEFINITION', '2 · SENT TO THE STORE', '3 · STORE BUDGETARY ANSWER', '4 · AFTER THE ANSWER', '5 · CHECK IT YOURSELF'])
      assert.ok(audit.includes(heading), 'audit copy has ' + heading);
    assert.ok(audit.includes('Version: ' + trailRequest.configurationVersion));
    assert.ok(audit.includes(JSON.stringify(trailRequest, null, 2)), 'the exact request, as sent');
    assert.match(audit, /Knobs made at intent/);
    assert.match(audit, /A person sits on the seat · UNRESOLVED · owner: QUALIFIED PERSON/);
    assert.match(audit, /No answer: STORE_ZERO_UNAVAILABLE/);
    // Switching route keeps the one state.
    const before = await whole.evaluate(() => window.STBWindowSeat.state());
    await whole.locator('[data-view-btn="trail"]').click();
    const after = await whole.evaluate(() => window.STBWindowSeat.state());
    assert.equal(after.view, 'trail');
    assert.equal(after.rev, before.rev);
    assert.deepEqual(await request(whole), trailRequest);
    assert.deepEqual(errors2, []);
  } finally {
    await browser.close();
    server.close();
  }
});
