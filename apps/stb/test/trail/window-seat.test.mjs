// Window Seat 0.9 on the trail: the fully worked example follows the same rules as every tile.
// - Page 1 is the want, kept behind the trail: no nav step is current there. The two routes are the top pills, and
//   page 1 has one forward control, Intent. Step 1, Intent, is the next page.
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

    // Page 1 is the want, alone, outside the trail steps. One bar at a time: here, the two routes, at the top and
    // again at the bottom, and no step bar. One forward control, Intent.
    assert.equal(await page.evaluate(() => document.body.dataset.view), 'trail');
    assert.deepEqual(await page.locator('.step:visible').evaluateAll(els => els.map(e => e.id)), ['s-hero']);
    assert.equal(await page.locator('[data-view-btn="trail"]:visible').count(), 2, 'routes at the top and the bottom of page 1');
    assert.equal(await page.locator('[data-view-btn="whole"]:visible').count(), 2);
    assert.equal(await page.locator('#s-hero .route.foot [data-view-btn]').count(), 2, 'the bottom copy closes page 1');
    assert.equal(await page.locator('#bar').isVisible(), false, 'no step bar on page 1');
    assert.deepEqual(await page.locator('#s-hero button[data-to]').evaluateAll(els => els.map(e => [e.dataset.to, e.innerText.trim()])), [['intent', 'Intent →']]);
    assert.equal(await page.locator('[data-nav].on').count(), 0, 'page 1 is not a trail step');
    assert.equal(await page.locator('[data-nav="scan"]').innerText(), '1 · Intent');
    assert.equal(await page.locator('[data-nav="request"]').isDisabled(), true, 'your call is inert before a Store answer');
    // Each page's Dev/Rev rail is a slot filled from the app's one guide file.
    assert.equal(await page.locator('aside.rail[data-guide-id]').count(), 8);
    assert.match(await page.locator('#s-hero aside.rail').innerText(), /DEV GUIDE|DEV\/REV GUIDE/);
    assert.match(await page.locator('#s-hero aside.rail').innerText(), /window-seat-hero/);

    await page.locator('#s-hero [data-to="intent"]').click();
    assert.deepEqual(await page.locator('.step:visible').evaluateAll(els => els.map(e => e.id)), ['s-intent']);
    assert.equal(await page.locator('[data-nav="scan"]').getAttribute('class'), 'pill on', 'step 1, Intent, starts on the intent page');
    // From Intent on, the step bar is the only bar.
    assert.equal(await page.locator('#bar').isVisible(), true);
    assert.equal(await page.locator('.route:visible').count(), 0, 'the route bar stays on page 1');
    // No qualified person: the seat is the customer's seat. Assembly on site is the customer's.
    assert.doesNotMatch(await page.locator('#s-intent .main').innerText(), /qualified person|connection design/i);

    // The knob rule: every knob, including those added by hand, is made on the intent page. The bench shows exactly
    // those knobs and has no control that adds one.
    const knobs = await page.evaluate(() => window.STBWindowSeat.knobs());
    assert.equal(knobs.length, 15);
    assert.equal(await page.locator('#knob-table tbody tr').count(), 15);
    assert.ok(knobs.includes('SPOTS'), 'drill spotting is one of this job’s knobs, made at intent');
    assert.equal(await page.locator('#add-knobs [data-add="spots"]').count(), 0, 'not an add-by-hand option');
    assert.ok(await page.locator('#s-intent [data-add]').count() >= 3, 'add a knob by hand lives on the intent page');
    assert.equal(await page.locator('#s-bench [data-add], #s-bench [data-kept]').count(), 0, 'the bench adds no knob');
    assert.deepEqual((await page.evaluate(() => window.STBWindowSeat.benchKnobs())).sort(), [...knobs].sort());
    // As Alcove: wood is the material block on the bench, pine already selected, and the bench's one price sits directly
    // beneath it. The Store-answer page shows the answer and holds no wood control.
    assert.equal(await page.locator('#species').count(), 1, 'one wood control');
    assert.equal(await page.locator('#s-configure [data-knob="WOOD"]').count(), 1, 'on the bench');
    assert.equal(await page.locator('#s-store [data-knob="WOOD"], #store-wood').count(), 0, 'not on the Store-answer page');
    assert.deepEqual(await page.locator('#species .swatch').evaluateAll(els => els.map(e => [e.dataset.material, e.innerText.trim()])), [['pine', 'Pine'], ['poplar', 'Poplar'], ['cherry', 'Cherry'], ['oak', 'Oak']]);
    assert.equal(await page.locator('#species .swatch.on').getAttribute('data-material'), 'pine', 'wood starts resolved as pine');
    assert.deepEqual(await page.evaluate(() => [...document.getElementById('species').closest('.matprice').children].map(e => e.dataset.knob || e.id)), ['WOOD', 'SPOTS', 'bench-money-box'], 'one frame: wood, then spotting, then the Store price');
    assert.equal(await page.locator('#bench-money-box').count(), 1, 'one money block on the bench');

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
    assert.equal(await page.locator('#v-d').inputValue(), '14 1/4');
    assert.match(await page.locator('#v-runw').innerText(), /1×8 .* edge-milled to 7 1\/8 in/);
    assert.ok((await request(page)).cutPackages.every(p => p.finishedWidthIn === 7.125));
    await page.locator('#depth-panel [data-depth="-0.25"]').click();
    // Every slider has a typed box. A typed number (decimal or fraction) moves the knob, within its range and step.
    assert.equal(await page.locator('#ctlcol input[type=range]').count(), await page.locator('#ctlcol [data-exact]').count(), 'one typed box per slider');
    await page.locator('#v-d').fill('15 1/2');
    await page.locator('#v-d').press('Enter');
    assert.equal(await page.locator('#c-d').inputValue(), '15.5');
    assert.ok((await request(page)).cutPackages.every(p => p.finishedWidthIn === 7.75), 'a typed depth is the depth');
    // What's typed is the value: 60.5 stays 60.5, though the slider moves in whole inches.
    await page.locator('#v-wC').fill('60.5');
    await page.locator('#v-wC').press('Enter');
    assert.equal(await page.locator('#v-wC').inputValue(), '60 1/2');
    assert.equal(await page.evaluate(() => window.STBWindowSeat.definition().W), 108.5, '24 + 60.5 + 24');
    // Outside the knob's range: kept as typed, not applied, and the box says why.
    await page.locator('#v-wC').fill('200');
    await page.locator('#v-wC').press('Enter');
    assert.equal(await page.locator('#v-wC').inputValue(), '200');
    assert.match(await page.locator('#ctlcol .exactnote').innerText(), /runs from 30 to 84 in\. Not applied/);
    assert.equal(await page.evaluate(() => window.STBWindowSeat.definition().W), 108.5, 'nothing changed behind your back');
    await page.locator('#v-wC').fill('55');
    await page.locator('#v-wC').press('Enter');
    assert.equal(await page.locator('#ctlcol .exactnote').count(), 0);
    await setRange(page, 'c-d', 14);

    // A depth that lands on a board sends no milling.
    await page.locator('#p-depth button', { hasText: 'USE 14 1/2 IN' }).click();
    assert.doesNotMatch(await page.locator('#ws-reg').innerText(), /Edge-mill/);
    assert.ok((await request(page)).cutPackages.every(p => p.finishedWidthIn === undefined));

    // A missing knob sends you back to intent; the bench has no way to add it.
    await page.locator('#s-bench .backlink [data-to="intent"]').click();
    assert.deepEqual(await page.locator('.step:visible').evaluateAll(els => els.map(e => e.id)), ['s-intent']);
    await page.locator('#s-intent [data-to="bench"]').click();

    // Drill spotting sits with the wood, over the price, and starts off: no spots are sent.
    assert.equal((await request(page)).cutPackages.flatMap(p => p.parts).filter(part => part.spots).length, 0, 'off to start');
    // Tower sides, 2 in from the edge: one spot per board, per tower side, per shelf.
    await page.locator('#c-spot-sides [data-k="2"]').click();
    req = await request(page);
    let spots = req.cutPackages.flatMap(p => p.parts).flatMap(part => part.spots || []);
    assert.equal(spots.length, (4 + 4) * 2 * 2);
    assert.ok(spots.every(s => s.acrossWidthRule === 'INSET_FROM_EDGE' && s.insetFromEdgeIn === 2));
    const spotted = req.cutPackages.flatMap(p => p.parts).filter(part => part.spots);
    assert.ok(spotted.every(part => /^[LR]-UPRIGHT-/.test(part.partId)), 'side spots only on tower sides');
    // Dividers, centered: where each divider meets the board above and below it, centered on the divider, one per board.
    await page.locator('#c-spot-div [data-k="on"]').click();
    req = await request(page);
    const div = req.cutPackages.flatMap(p => p.parts).flatMap(part => (part.spots || []).filter(s => s.acrossWidthRule === 'CENTERED_ON_WIDE_FACE').map(s => [part.partId, s.xIn]));
    assert.equal(div.length, (1 + 1) * 2 * 2, 'one upper divider and one cubby divider, two boards each, above and below');
    assert.ok(div.every(([id]) => /^C-(TOP|BOTTOM|SEAT|UPPER-SHELF)-/.test(id)), 'on the center module’s horizontal boards');
    assert.ok(div.every(([, x]) => x === 26.75), 'centered on the divider: halfway along a 53½ in board');
    spots = req.cutPackages.flatMap(p => p.parts).flatMap(part => part.spots || []);
    assert.equal(spots.length, 32 + 8);
    assert.ok((await wireOk(req)).ok, 'System wire accepts spotted parts');
    assert.match(req.configurationVersion, /^ws-r\d+-[0-9a-f]{8}$/);

    // Every Store answer carries the shared Store Zero text and "What happens next", all twelve steps.
    assert.match(await page.locator('#store-doctrine').innerText(), /Store Zero is a declared reference lumberyard/);
    assert.match(await page.locator('#store-doctrine').innerText(), /What happens next/);
    assert.equal(await page.locator('#store-doctrine .s').count(), 12);

    // The bench asks the Store by itself for the version on it: no ask button on the bench.
    const trailRequest = await request(page);
    const s1 = await asked(page);
    assert.deepEqual(sent[sent.length - 1].payload.definition, trailRequest, 'the bench asked for exactly this version');
    assert.match(s1.error, /STORE_ZERO_UNAVAILABLE/, 'no answer stays no answer');
    assert.match(await page.locator('#bench-money').innerText(), /Nothing is shown in its place/);
    assert.equal(await page.locator('#s-configure button[data-ask], #bench-money button').count(), 0, 'no ask button on the bench');
    // Going on to the Store's page sends no duplicate for the same version.
    let n = sent.length;
    await page.locator('#btn-ask').click();
    assert.equal(sent.length - n, 0, 'no second request for the same version');
    assert.match(await page.locator('#store-panel').innerText(), /Nothing is shown in its place/);
    assert.equal(await page.locator('[data-nav="request"]').isDisabled(), true);
    assert.deepEqual(errors, []);

    const trailLast = sent[sent.length - 1];
    // ── One long scroll: the same job, set the same way ──
    const whole = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
    const errors2 = [];
    whole.on('pageerror', e => errors2.push(e.message));
    await whole.goto(`${origin}/${FILE}`, { waitUntil: 'load' });
    await whole.locator('#route [data-view-btn="whole"]').click();
    assert.equal(await whole.evaluate(() => document.body.dataset.view), 'whole');
    assert.equal(await whole.locator('.step:visible').count(), 8, 'seven pages and the audit copy');
    await whole.locator('#p-depth button', { hasText: 'USE 14 1/2 IN' }).click();
    await whole.locator('#c-spot-sides [data-k="2"]').click();
    await whole.locator('#c-spot-div [data-k="on"]').click();
    n = sent.length;
    await whole.locator('#btn-ask').click();
    await asked(whole);
    assert.ok(sent.length > n, 'the long scroll asks the Store too');
    // The fork: one state, one definition, one Store request, whichever route.
    assert.deepEqual(sent[sent.length - 1].payload.definition, trailLast.payload.definition, 'the request is identical from both routes');
    assert.equal(sent[sent.length - 1].payloadDigest, trailLast.payloadDigest);
    assert.equal(sent[sent.length - 1].demandSignature, trailLast.demandSignature);

    // The audit copy: the full definition, what was sent, and the Store answer, as plain copyable text.
    const audit = await whole.locator('#audit-text').innerText();
    assert.equal(audit, await whole.evaluate(() => window.STBWindowSeat.auditText()));
    assert.equal(await whole.locator('#copy-audit').count(), 1);
    for (const heading of ['1 · IDENTIFIED DEFINITION', '2 · SENT TO THE STORE', '3 · STORE BUDGETARY ANSWER', '4 · AFTER THE ANSWER', '5 · CHECK IT YOURSELF'])
      assert.ok(audit.includes(heading), 'audit copy has ' + heading);
    assert.ok(audit.includes('Version: ' + trailRequest.configurationVersion));
    assert.ok(audit.includes(JSON.stringify(trailRequest, null, 2)), 'the exact request, as sent');
    assert.match(audit, /Knobs made at intent/);
    assert.match(audit, /How it goes together on site · YOURS · owner: YOU/);
    assert.doesNotMatch(audit, /QUALIFIED PERSON|A person sits on the seat/);
    assert.match(audit, /No answer: STORE_ZERO_UNAVAILABLE/);
    // Switching route keeps the one state. The routes live on page 1 only: back to the top, then switch.
    const before = await whole.evaluate(() => window.STBWindowSeat.state());
    assert.equal(await whole.locator('.route:visible').count(), 0, 'no route bar past page 1');
    await whole.evaluate(() => window.scrollTo(0, 0));
    await whole.waitForFunction(() => window.STBWindowSeat.state().section === 'hero');
    await whole.locator('#route [data-view-btn="trail"]').click();
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
