// Window Seat on the trail: the one fully worked example follows the same rules as every tile.
// - The request it sends is a plain cut-package request the System wire accepts (rule 4: the live Store answers).
// - Depth that isn't a board width stays the customer's number; the mill-to-width ask is kept, not sent, and
//   blocks Your call until answered or until the customer picks a depth that lands on a board.
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

    // The drawing's 14 in depth over two boards is 7 in each: not a board width.
    let req = await page.evaluate(() => window.STBWindowSeat.request());
    assert.deepEqual([...new Set(req.cutPackages.map(p => p.material.nominalW))], [8]);
    assert.ok(req.cutPackages.every(p => p.material.species === 'pine' && p.material.grade === 'select'));
    assert.ok((await wireOk(req)).ok, 'System wire accepts the Window Seat request');
    assert.match(await page.locator('#ws-reg').innerText(), /ASKED · NOT ANSWERED/);

    // Fork: to the bench. One step at a time from here.
    await page.locator('#fork [data-to-step="configure"]').click();
    assert.equal(await page.evaluate(() => document.body.dataset.view), 'trail');
    assert.equal(await page.locator('.step:visible').count(), 1);
    assert.equal(await page.locator('#s-configure').isVisible(), true);
    assert.equal(await page.locator('#btn-call').isDisabled(), true);

    // Pick a depth that lands on a board: the mill ask disappears.
    await page.locator('#p-depth button', { hasText: 'USE 14 1/2 IN' }).click();
    assert.doesNotMatch(await page.locator('#ws-reg').innerText(), /ASKED · NOT ANSWERED/);

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

    // Back to the whole job: every step visible again.
    await page.locator('[data-view-btn="whole"]').click();
    assert.equal(await page.locator('.step:visible').count(), 6);
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
    server.close();
  }
});
