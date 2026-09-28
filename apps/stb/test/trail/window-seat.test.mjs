// Window Seat on the trail: the one fully worked example follows the same rules as every tile.
// - The request it sends is a plain cut-package request the System wire accepts (rule 4: the live Store answers).
// - Depth that isn't a board width stays the customer's number: its boards are edge-milled to width, and the
//   finished width travels in the cut package for the Store to time and price.
// - Spot facing for shelf pins travels inside each tower side's own boards, in the Store's declared placements.
// - Two views of one job: the whole job in one scroll, or one step at a time.

import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { buildCutPackageRequest, cutPackageDemandSignature, cutPackageJobPayload, validateWireRequest } from '../../shared/store-wire.mjs';

const ROOT = fileURLToPath(new URL('../../public-build/', import.meta.url));
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png' };
function serve() {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '');
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

test('Window Seat: one job, same rules, live-Store request', { timeout: 120000 }, async () => {
  const server = await serve();
  const browser = await chromium.launch(process.env.STB_CHROMIUM_PATH ? { executablePath: process.env.STB_CHROMIUM_PATH } : {});
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(`http://127.0.0.1:${server.address().port}/stb-window-seat-0.8.html`, { waitUntil: 'load' });

    // Opens as the whole job, every step in one scroll, with the fork at the end of step 1.
    assert.equal(await page.evaluate(() => document.body.dataset.view), 'whole');
    assert.equal(await page.locator('.step:visible').count(), 6);
    assert.equal(await page.locator('#fork [data-to-step="configure"]').count(), 1);
    assert.equal(await page.locator('#fork [data-read-whole]').count(), 1);

    // The drawing's 14 in depth over two boards is 7 in each: 1×8s edge-milled to 7 in.
    let req = await page.evaluate(() => window.STBWindowSeat.request());
    assert.deepEqual([...new Set(req.cutPackages.map(p => p.material.nominalW))], [8]);
    assert.ok(req.cutPackages.every(p => p.material.species === 'pine' && p.material.grade === 'select'));
    assert.ok(req.cutPackages.every(p => p.finishedWidthIn === 7), 'finished width travels to the Store');
    assert.ok((await wireOk(req)).ok, 'System wire accepts the Window Seat request');
    assert.doesNotMatch(await page.locator('#ws-reg').innerText(), /ASKED · NOT ANSWERED/);
    assert.match(await page.locator('#ws-reg').innerText(), /Edge-mill 1×8 boards to 7 in wide/);

    // Fork: to the bench. One step at a time from here.
    await page.locator('#fork [data-to-step="configure"]').click();
    assert.equal(await page.evaluate(() => document.body.dataset.view), 'trail');
    assert.equal(await page.locator('.step:visible').count(), 1);
    assert.equal(await page.locator('#s-configure').isVisible(), true);
    assert.equal(await page.locator('#btn-call').isDisabled(), true);

    // Boards across the depth plan themselves (Auto): the fewest boards the edge mill can reach.
    assert.equal(await page.locator('#v-runs').innerText(), '2 (auto)');
    await page.evaluate(() => { const e = document.getElementById('c-d'); e.value = '15'; e.dispatchEvent(new Event('input')); });
    assert.equal(await page.locator('#v-runs').innerText(), '3 (auto)', '7 1/2 in boards would need 1 3/4 in off a 1×10; 3 × 1×6 milled to 5 in works');
    assert.ok((await page.evaluate(() => window.STBWindowSeat.request())).cutPackages.every(p => p.material.nominalW === 6 && p.finishedWidthIn === 5));
    // Forcing 2 boards at 15 in is not plausible, and the bench says so before asking the Store.
    await page.locator('#c-runs [data-n="2"]').click();
    assert.ok((await page.evaluate(() => window.STBWindowSeat.conditions())).some(c => c.block && /Too much to mill/.test(c.t)));
    assert.equal(await page.locator('#btn-ask').isDisabled(), true);
    await page.locator('#c-runs [data-n="auto"]').click();
    await page.evaluate(() => { const e = document.getElementById('c-d'); e.value = '14'; e.dispatchEvent(new Event('input')); });

    // Depth is the customer's number, a quarter inch at a time; the boards are milled to match.
    await page.locator('#depth-panel [data-depth="0.25"]').click();
    assert.equal(await page.locator('#v-d').innerText(), '14 1/4 in');
    assert.match(await page.locator('#v-runw').innerText(), /1×8 .* edge-milled to 7 1\/8 in/);
    assert.ok((await page.evaluate(() => window.STBWindowSeat.request())).cutPackages.every(p => p.finishedWidthIn === 7.125));
    await page.locator('#depth-panel [data-depth="-0.25"]').click();

    // Pick a depth that lands on a board: no milling is asked.
    await page.locator('#p-depth button', { hasText: 'USE 14 1/2 IN' }).click();
    assert.doesNotMatch(await page.locator('#ws-reg').innerText(), /Edge-mill/);
    assert.ok((await page.evaluate(() => window.STBWindowSeat.request())).cutPackages.every(p => p.finishedWidthIn === undefined));

    // Spot facing for shelf pins, 2 in from the edge: one spot per board, per tower side, per shelf.
    await page.locator('#c-spots').check();
    await page.locator('#c-spot-place button', { hasText: '2 in' }).click();
    req = await page.evaluate(() => window.STBWindowSeat.request());
    const spots = req.cutPackages.flatMap(p => p.parts).flatMap(part => part.spots || []);
    assert.equal(spots.length, (4 + 4) * 2 * 2);
    assert.ok(spots.every(s => s.acrossWidthRule === 'INSET_FROM_EDGE' && s.insetFromEdgeIn === 2));
    const spotted = req.cutPackages.flatMap(p => p.parts).filter(part => part.spots);
    assert.ok(spotted.every(part => /^[LR]-UPRIGHT-/.test(part.partId)), 'spots only on tower sides');
    assert.ok((await wireOk(req)).ok, 'System wire accepts spotted parts');

    // A changed bench is a new version identity.
    assert.match(req.configurationVersion, /^ws-r\d+-[0-9a-f]{8}$/);

    // Every Store answer carries the shared Store Zero text and "What happens next", all twelve steps.
    assert.match(await page.locator('#store-doctrine').innerText(), /Store Zero is a declared reference lumberyard/);
    assert.equal(await page.locator('#store-doctrine .s').count(), 12);

    // Back to the whole job: every step visible again.
    await page.locator('[data-view-btn="whole"]').click();
    assert.equal(await page.locator('.step:visible').count(), 6);
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
    server.close();
  }
});
