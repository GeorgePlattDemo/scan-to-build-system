// Outdoor picnic page wiring, in a real browser, through the real System shell.
// A scripted Store answers every request so the test checks the page's wiring, not Store prices:
//  - the top nav is the six trail steps on the Outdoor page only; steps it cannot use yet are inert
//  - every choice (wood, hardware, length) sends a new exact request with that choice in its identity
//  - "Store Zero answers" and "Your call" show the receipt of the exact request, never the comparison
//  - the length is not capped by System; the Store decides
import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const ROOT = fileURLToPath(new URL('../../public-build/', import.meta.url));
const RUNTIME = JSON.parse(fs.readFileSync(path.join(ROOT, 'stb-store-runtime.json'), 'utf8'));
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.css': 'text/css' };

function serve() {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '') || 'system-build-current.html';
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

// Scripted Store: every line supportable, one board per package, $2 per hardware unit.
function answer(wire) {
  const def = wire.payload.definition;
  const packages = def.cutPackages.map(p => ({
    packageId: p.packageId, status: 'SUPPORTABLE', storeSku: 'FAKE-' + p.packageId, boards: 1, sellingPrice: 6,
    totals: { material: 6, machine_service: 4, Q: 10 }, Q: 10, time: { T_MACHINE_min: 1 }, spotCount: 0, reasonCodes: [],
    stubs: [{ boardId: p.packageId + '-B1', stubIn: 3 }],
    cutPlan: [{ boardId: p.packageId + '-B1', storeSku: 'FAKE-' + p.packageId, stockLengthIn: 96, partsInCutOrder: p.parts.slice(0, 2).map(x => ({ partId: x.partId, lengthIn: x.lengthIn })), stubIn: 3 }],
  }));
  const items = (def.itemLines || []).map(l => ({ ...l, status: 'SUPPORTABLE', sellingPrice: 2, Q: l.qty * 2, reasonCodes: [] }));
  const receipt = { requestId: wire.requestId, freshnessRule: 'STB-STORE-FRESH-EVALUATION-0.1', evaluatedAt: '2026-09-26T00:00:00Z',
    authority: { storeRevision: RUNTIME.storePin }, receiptHash: 'receipt-' + wire.requestId };
  const keys = ['protocolVersion', 'requestId', 'attemptId', 'projectId', 'candidateRevisionId', 'requestType', 'scope', 'demandSignature', 'payloadDigest'];
  return {
    ...Object.fromEntries(keys.map(k => [k, wire[k]])),
    storePin: RUNTIME.storePin,
    rawEvaluation: { status: 'SUPPORTABLE', freshEvaluation: true, packages, items, totals: {}, evaluationReceipt: receipt },
    evaluationReceipt: receipt,
  };
}

async function outdoorFrame(page) {
  for (let i = 0; i < 60; i++) {
    const f = page.frames().find(fr => fr.url().includes('stb-outdoor-picnic-0.1.html'));
    if (f && await f.$('#plans .plan').catch(() => null)) return f;
    await page.waitForTimeout(150);
  }
  throw new Error('Outdoor frame not found');
}
async function baseFrame(page) {
  for (let i = 0; i < 40; i++) {
    const f = page.frames().find(fr => fr.url().includes('system-build-base-8d8a9dd.html'));
    if (f && await f.$('#landing')) return f;
    await page.waitForTimeout(150);
  }
  throw new Error('base frame not found');
}
const navState = base => base.$$eval('.recovery-nav button', els => els.filter(e => !e.hidden && e.offsetParent !== null)
  .map(e => ({ label: e.innerText.trim(), go: e.getAttribute('data-go') || '', inert: e.disabled })));

test('Outdoor: six trail steps on its own page, exact Store answer per choice, receipt of the exact choice', { timeout: 180000 }, async () => {
  const server = await serve();
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch(process.env.STB_CHROMIUM_PATH ? { executablePath: process.env.STB_CHROMIUM_PATH } : {});
  const requests = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.route(RUNTIME.jobEndpoint, async route => {
      const wire = JSON.parse(route.request().postData());
      requests.push(wire);
      await route.fulfill({ status: 200, headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' }, body: JSON.stringify(answer(wire)) });
    });
    await page.goto(origin + '/system-build-current.html', { waitUntil: 'load' });
    const base = await baseFrame(page);
    await base.locator('#landing button', { hasText: 'NEW USER' }).first().click();
    await base.locator('#new-user [data-door-forward]').click();
    await page.waitForTimeout(400);
    await base.locator('#projects .tile', { hasText: 'Outdoor build' }).first().click();
    const outdoor = await outdoorFrame(page);

    // Six steps, all on the Outdoor page; only "Your idea" usable before a plan is chosen.
    let nav = await navState(base);
    const steps = nav.filter(b => /^\d · /.test(b.label));
    assert.deepEqual(steps.map(b => b.label.replace(/^\d · /, '')), ['Your idea', 'The bench', 'The Store answers', 'Your call', 'We cut it', 'Pick up & build']);
    assert.ok(steps.every(b => b.go === 'outdoor-build-live'), JSON.stringify(steps));
    assert.deepEqual(steps.map(b => b.inert), [false, true, true, true, true, true]);
    assert.ok(nav.every(b => /^\d · /.test(b.label) || b.go === 'projects'), 'no buttons into other jobs: ' + JSON.stringify(nav));
    // The page's own copy of the step buttons is hidden inside the shell.
    assert.equal(await outdoor.locator('.step:visible').count(), 0);

    // Pick the table + benches plan: comparison and exact requests go out.
    await outdoor.locator('[data-plan="table-benches"]').click();
    await outdoor.waitForSelector('#a-total-wrap:not([hidden])', { timeout: 20000 });
    const exactOf = () => requests.filter(r => r.requestType === 'CUT_PACKAGE_V1' && !r.payload.definition.configurationVersion.includes('compare'));
    let exact = exactOf().at(-1);
    assert.equal(exact.payload.definition.configurationVersion, 'table-benches-6ft-ground-contact-COATED-v1');
    assert.ok(exact.payload.definition.cutPackages.every(p => p.packageId.startsWith('ground-contact|')));
    assert.ok(exact.payload.definition.itemLines.every(l => l.lineId.startsWith('COATED|')));
    assert.equal(exact.expectedStorePin, RUNTIME.storePin);
    nav = await navState(base);
    assert.deepEqual(nav.filter(b => /^\d · /.test(b.label)).map(b => b.inert), [false, false, false, false, true, true]);

    // A different wood is a new exact request; a different hardware choice too.
    await outdoor.locator('[data-wood="cedar"]').click();
    await outdoor.waitForSelector('#a-total-wrap:not([hidden])', { timeout: 20000 });
    await outdoor.locator('[data-tier="BYO"]').click();
    await outdoor.waitForSelector('#a-total-wrap:not([hidden])', { timeout: 20000 });
    exact = exactOf().at(-1);
    assert.equal(exact.payload.definition.configurationVersion, 'table-benches-6ft-cedar-BYO-v1');
    assert.ok(exact.payload.definition.cutPackages.every(p => p.packageId.startsWith('cedar|')));
    assert.equal(exact.payload.definition.itemLines, undefined, 'bring your own sends no hardware lines');
    assert.match(await outdoor.locator('#a-hw').innerText(), /You supply/);

    // No length cap in System: 16 ft goes to the Store.
    for (let i = 0; i < 10; i++) await outdoor.locator('#longer').click();
    await outdoor.waitForSelector('#a-total-wrap:not([hidden])', { timeout: 20000 });
    exact = exactOf().at(-1);
    assert.equal(exact.payload.definition.configurationVersion, 'table-benches-16ft-cedar-BYO-v1');
    assert.ok(exact.payload.definition.cutPackages[0].parts.some(p => p.lengthIn === 16 * 12 - 0.5));

    // "Your call" from the top nav shows the receipt of that exact request.
    await base.locator('.recovery-nav button:visible', { hasText: 'Your call' }).first().click();
    await page.waitForTimeout(500);
    assert.equal(await outdoor.locator('#view-call').isVisible(), true);
    const receiptText = await outdoor.locator('#call-receipt').innerText();
    assert.ok(receiptText.includes(('receipt-' + exact.requestId).slice(0, 12)), receiptText);
    assert.ok(receiptText.includes('table-benches-16ft-cedar-BYO-v1'), receiptText);
    assert.equal(await base.evaluate(() => [...document.querySelectorAll('.page.on')].pop()?.id), 'outdoor-build-live');

    // The shared terms flow: Store answer -> simulated offer -> accept & send -> run the yard -> record pickup.
    assert.equal(await outdoor.locator('#call-terms [data-terms-event="arrived"]').getAttribute('data-terms-state'), 'done');
    assert.match(await outdoor.locator('#call-terms').innerText(), new RegExp(('receipt-' + exact.requestId).slice(0, 12)));
    await outdoor.locator('#call-terms [data-terms-action="accept"]').click();
    await page.waitForTimeout(400);
    assert.equal(await outdoor.locator('#view-yard').isVisible(), true);
    for (const id of ['offered', 'decision', 'paid', 'queued']) assert.equal(await outdoor.locator(`#yard-terms [data-terms-event="${id}"]`).getAttribute('data-terms-state'), 'done', id);
    assert.ok((await outdoor.locator('#yard-boards tr').count()) > 0, 'the cut list comes from the Store answer');
    nav = await navState(base);
    assert.deepEqual(nav.filter(b => /^\d · /.test(b.label)).map(b => b.inert), [false, false, false, false, false, true]);
    await outdoor.locator('#yard-terms [data-terms-action="yard"]').click();
    await page.waitForTimeout(400);
    assert.equal(await outdoor.locator('#view-record').isVisible(), true);
    assert.match(await outdoor.locator('#record-kit').innerText(), /You supply/);
    await outdoor.locator('#record-terms [data-terms-action="pickup"]').click();
    await page.waitForTimeout(400);
    assert.equal(await outdoor.locator('#record-terms [data-terms-receipt]').count(), 1, 'terms / handoff receipt at custody');
    assert.equal(await outdoor.locator('#record-terms [data-terms-state="done"]').count(), 13, 'every event recorded');
    nav = await navState(base);
    assert.deepEqual(nav.filter(b => /^\d · /.test(b.label)).map(b => b.inert), [false, false, false, false, false, false]);
    await base.locator('.recovery-nav button:visible', { hasText: 'We cut it' }).first().click();
    await page.waitForTimeout(400);
    assert.equal(await outdoor.locator('#view-yard').isVisible(), true);
    await base.locator('.recovery-nav button:visible', { hasText: 'Pick up & build' }).first().click();
    await page.waitForTimeout(400);
    assert.equal(await outdoor.locator('#view-record').isVisible(), true);
    assert.equal(await base.evaluate(() => [...document.querySelectorAll('.page.on')].pop()?.id), 'outdoor-build-live');

    // "Your idea" returns to the plans, still on the Outdoor page.
    await base.locator('.recovery-nav button:visible', { hasText: 'Your idea' }).first().click();
    await page.waitForTimeout(500);
    assert.equal(await outdoor.locator('#view-plans').isVisible(), true);
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
    server.close();
  }
});