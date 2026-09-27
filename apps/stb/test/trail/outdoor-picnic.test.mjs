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

// Scripted Store, shaped like Store fc3f555: every cut package supportable with a Store SKU; an item line
// naming an exact SKU is priced; a requirement line (no SKU) is UNRESOLVED / STORE_SKU_REQUIRED, as the real Store answers.
function answer(wire) {
  const def = wire.payload.definition;
  const packages = def.cutPackages.map(p => ({
    packageId: p.packageId, status: 'SUPPORTABLE', storeSku: 'FAKE-' + p.packageId, boards: 1, sellingPrice: 6,
    totals: { material: 6, machine_service: 4, Q: 10 }, Q: 10, time: { T_MACHINE_min: 1 }, spotCount: 0, stubs: [], reasonCodes: [],
  }));
  const items = (def.itemLines || []).map(l => l.storeSku
    ? { kind: 'ITEM', lineId: l.lineId, storeSku: l.storeSku, qty: l.qty, status: 'SUPPORTABLE', sellingPrice: 2, Q: l.qty * 2, reasonCodes: [] }
    : { kind: 'ITEM', lineId: l.lineId, storeSku: '', qty: l.qty, status: 'UNRESOLVED', reasonCodes: ['STORE_SKU_REQUIRED'] });
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
    assert.deepEqual(steps.map(b => b.label.replace(/^\d · /, '')), ['Your idea', 'Make it yours', 'The Store answers', 'Your call', 'We cut it', 'Pick up & build']);
    assert.ok(steps.every(b => b.go === 'outdoor-build-live'), JSON.stringify(steps));
    assert.deepEqual(steps.map(b => b.inert), [false, true, true, true, true, true]);
    assert.ok(nav.every(b => /^\d · /.test(b.label) || b.go === 'projects'), 'no buttons into other jobs: ' + JSON.stringify(nav));
    // The page's own copy of the step buttons is hidden inside the shell.
    assert.equal(await outdoor.locator('.step:visible').count(), 0);

    // Pick the table + benches plan: comparison and exact requests go out.
    await outdoor.locator('[data-plan="table-benches"]').click();
    await outdoor.waitForSelector('#a-refusals li', { timeout: 20000 });
    const exactOf = () => requests.filter(r => r.requestType === 'CUT_PACKAGE_V1' && !r.payload.definition.configurationVersion.includes('compare'));
    let exact = exactOf().at(-1);
    assert.equal(exact.payload.definition.configurationVersion, 'table-benches-6ft-ground-contact-COATED-v1');
    assert.ok(exact.payload.definition.cutPackages.every(p => p.packageId.startsWith('ground-contact|')));
    assert.ok(exact.payload.definition.itemLines.every(l => l.lineId.startsWith('COATED|')));
    // Hardware is sent as a neutral requirement: no Store SKU is named by System.
    assert.ok(exact.payload.definition.itemLines.every(l => !('storeSku' in l) && l.requirement.finish === 'coated' && l.requirement.kind), JSON.stringify(exact.payload.definition.itemLines));
    assert.deepEqual(exact.payload.definition.itemLines.map(l => l.qty), [26, 48, 8]);
    assert.equal(exact.expectedStorePin, RUNTIME.storePin);
    // The Store leaves the hardware unresolved, so the table is not complete: no total, "Your call" stays inert.
    await outdoor.waitForSelector('#a-refusals li', { timeout: 20000 });
    assert.match(await outdoor.locator('#a-refusals').innerText(), /can’t yet match this hardware requirement/);
    assert.equal(await outdoor.locator('#a-total-wrap').isVisible(), false);
    assert.equal(await outdoor.locator('#confirm').isDisabled(), true);
    assert.equal(await outdoor.locator('#a-hw').innerText(), '—');
    assert.equal(await outdoor.locator('[data-tier="BYO"]').count(), 0, 'no bring-your-own hardware');
    await outdoor.waitForFunction(() => !document.querySelector('[data-tier="COATED"]').innerText.includes('…'), null, { timeout: 20000 });
    assert.match(await outdoor.locator('[data-tier="COATED"]').innerText(), /Store can’t match yet/);
    nav = await navState(base);
    assert.deepEqual(nav.filter(b => /^\d · /.test(b.label)).map(b => b.inert), [false, false, false, true, true, true]);

    // A different wood is a new exact request; a different hardware choice too. No earlier answer is reused.
    const answered = async (before) => {
      for (let i = 0; i < 100 && exactOf().length === before; i++) await page.waitForTimeout(100);
      await outdoor.waitForSelector('#a-refusals li', { timeout: 20000 });
      return exactOf().at(-1);
    };
    let before = exactOf().length;
    await outdoor.locator('[data-wood="cedar"]').click();
    exact = await answered(before);
    assert.equal(exact.payload.definition.configurationVersion, 'table-benches-6ft-cedar-COATED-v1');
    assert.ok(exact.payload.definition.cutPackages.every(p => p.packageId.startsWith('cedar|')));
    const woodRequestId = exact.requestId;
    before = exactOf().length;
    await outdoor.locator('[data-tier="STAINL"]').click();
    exact = await answered(before);
    assert.notEqual(exact.requestId, woodRequestId);
    assert.equal(exact.payload.definition.configurationVersion, 'table-benches-6ft-cedar-STAINL-v1');
    assert.ok(exact.payload.definition.itemLines.every(l => l.lineId.startsWith('STAINL|') && l.requirement.finish === 'stainless' && !('storeSku' in l)));

    // No length cap in System: 16 ft goes to the Store.
    for (let i = 0; i < 10; i++) await outdoor.locator('#longer').click();
    for (let i = 0; i < 100 && !exactOf().at(-1).payload.definition.configurationVersion.startsWith('table-benches-16ft'); i++) await page.waitForTimeout(100);
    exact = exactOf().at(-1);
    assert.equal(exact.payload.definition.configurationVersion, 'table-benches-16ft-cedar-STAINL-v1');
    assert.ok(exact.payload.definition.cutPackages[0].parts.some(p => p.lengthIn === 16 * 12 - 0.5));
    await outdoor.waitForSelector('#a-refusals li', { timeout: 20000 });
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

test('Outdoor page names no Store SKU and computes no Store price', () => {
  const src = fs.readFileSync(path.join(ROOT, 'stb-outdoor-picnic-0.1.html'), 'utf8');
  assert.doesNotMatch(src, /STB-ZERO/, 'no Store SKU strings or SKU naming convention');
  assert.doesNotMatch(src, /\bsku\s*:/i, 'no SKU fields in the plan hardware');
  assert.doesNotMatch(src, /pieces\s*:/, 'no Store package sizes in System');
  assert.doesNotMatch(src, /sellingPrice\s*\*/, 'no price arithmetic from Store unit prices');
  assert.doesNotMatch(src, /Bring your own|You supply|'BYO'/, 'no bring-your-own path');
  assert.match(src, /STBStoreClient/, 'Outdoor uses the shared Store client');
  assert.doesNotMatch(src, /fetch\(/, 'no transport of its own');
});
