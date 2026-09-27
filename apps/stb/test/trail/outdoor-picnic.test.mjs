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

// Scripted Store for the page mechanics (the real pinned Store is exercised in the next test): every cut package is
// supportable with a Store SKU; a hardware requirement line is resolved by the Store to a SKU, packages and price,
// except silicon bronze, which this scripted Store refuses so the fail-closed path is covered.
function answer(wire) {
  const def = wire.payload.definition;
  const packages = def.cutPackages.map(p => ({
    packageId: p.packageId, status: 'SUPPORTABLE', storeSku: 'FAKE-' + p.packageId, boards: 1, sellingPrice: 6,
    totals: { material: 6, machine_service: 4, Q: 10 }, Q: 10, time: { T_MACHINE_min: 1 }, spotCount: 0, reasonCodes: [],
    stubs: [{ boardId: p.packageId + '-B1', stubIn: 3 }],
    cutPlan: [{ boardId: p.packageId + '-B1', storeSku: 'FAKE-' + p.packageId, stockLengthIn: 96, partsInCutOrder: p.parts.slice(0, 2).map(x => ({ partId: x.partId, lengthIn: x.lengthIn })), stubIn: 3 }],
  }));
  const items = (def.itemLines || []).map(l => l.requirement.finish === 'silicon-bronze'
    ? { kind: 'ITEM', lineId: l.lineId, storeSku: null, qty: l.qty, status: 'REFUSED', Q: null, reasonCodes: ['NO_MATCHING_HARDWARE_OFFERING'] }
    : { kind: 'ITEM', lineId: l.lineId, storeSku: 'FAKE-HW-' + l.lineId + '-' + wire.requestId.slice(0, 4), qty: l.qty, requiredPieces: l.qty,
        piecesPerPackage: 50, packages: Math.ceil(l.qty / 50), piecesSupplied: Math.ceil(l.qty / 50) * 50, sellingPrice: 3,
        Q: Math.ceil(l.qty / 50) * 3, status: 'SUPPORTABLE', reasonCodes: [] });
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
    await outdoor.waitForSelector('#a-total-wrap:not([hidden])', { timeout: 20000 });
    const exactOf = () => requests.filter(r => r.requestType === 'CUT_PACKAGE_V1' && !r.payload.definition.configurationVersion.includes('compare'));
    let exact = exactOf().at(-1);
    assert.equal(exact.payload.definition.configurationVersion, 'table-benches-6ft-ground-contact-COATED-v1');
    assert.ok(exact.payload.definition.cutPackages.every(p => p.packageId.startsWith('ground-contact|')));
    assert.ok(exact.payload.definition.itemLines.every(l => l.lineId.startsWith('COATED|')));
    // Hardware is sent as a neutral requirement in pieces: no Store SKU and no package size from System.
    assert.ok(exact.payload.definition.itemLines.every(l => !('storeSku' in l) && l.requirement.finish === 'coated' && l.requirement.kind && l.requirement.unit === 'piece'), JSON.stringify(exact.payload.definition.itemLines));
    assert.deepEqual(exact.payload.definition.itemLines.map(l => l.qty), [26, 48, 8]);
    assert.equal(exact.expectedStorePin, RUNTIME.storePin);
    assert.equal(await outdoor.locator('[data-tier="BYO"]').count(), 0, 'no bring-your-own hardware');
    nav = await navState(base);
    assert.deepEqual(nav.filter(b => /^\d · /.test(b.label)).map(b => b.inert), [false, false, false, false, true, true]);

    // A different wood is a new exact request; a different hardware finish too. No earlier answer is reused.
    const settle = async (before) => {
      for (let i = 0; i < 100 && exactOf().length === before; i++) await page.waitForTimeout(100);
      await page.waitForTimeout(400);
      return exactOf().at(-1);
    };
    let before = exactOf().length;
    await outdoor.locator('[data-wood="cedar"]').click();
    exact = await settle(before);
    await outdoor.waitForSelector('#a-total-wrap:not([hidden])', { timeout: 20000 });
    assert.equal(exact.payload.definition.configurationVersion, 'table-benches-6ft-cedar-COATED-v1');
    assert.ok(exact.payload.definition.cutPackages.every(p => p.packageId.startsWith('cedar|')));
    const woodRequestId = exact.requestId;
    before = exactOf().length;
    await outdoor.locator('[data-tier="STAINL"]').click();
    exact = await settle(before);
    await outdoor.waitForSelector('#a-total-wrap:not([hidden])', { timeout: 20000 });
    assert.notEqual(exact.requestId, woodRequestId);
    assert.equal(exact.payload.definition.configurationVersion, 'table-benches-6ft-cedar-STAINL-v1');
    assert.ok(exact.payload.definition.itemLines.every(l => l.lineId.startsWith('STAINL|') && l.requirement.finish === 'stainless' && !('storeSku' in l)));

    // "Your call" shows the Store's hardware SKU and packages from that exact answer, and its receipt.
    await base.locator('.recovery-nav button:visible', { hasText: 'Your call' }).first().click();
    await page.waitForTimeout(500);
    assert.equal(await outdoor.locator('#view-call').isVisible(), true);
    const lines = await outdoor.locator('#call-lines').innerText();
    assert.ok(lines.includes('FAKE-HW-STAINL|SCR-2P5-' + exact.requestId.slice(0, 4)), lines);
    assert.ok(lines.includes('1 × 50 (50 pcs)'), lines);
    const receiptText = await outdoor.locator('#call-receipt').innerText();
    assert.ok(receiptText.includes(('receipt-' + exact.requestId).slice(0, 12)), receiptText);
    assert.ok(receiptText.includes('table-benches-6ft-cedar-STAINL-v1'), receiptText);
    await base.locator('.recovery-nav button:visible', { hasText: 'Make it yours' }).first().click();
    await page.waitForTimeout(400);

    // Hardware the Store refuses fails closed: no total, "Your call" inert.
    before = exactOf().length;
    await outdoor.locator('[data-tier="SILICO"]').click();
    await settle(before);
    await outdoor.waitForSelector('#a-refusals li', { timeout: 20000 });
    assert.match(await outdoor.locator('#a-refusals').innerText(), /stocks no hardware that matches this exactly/);
    assert.equal(await outdoor.locator('#a-total-wrap').isVisible(), false);
    assert.equal(await outdoor.locator('#confirm').isDisabled(), true);
    nav = await navState(base);
    assert.deepEqual(nav.filter(b => /^\d · /.test(b.label)).map(b => b.inert), [false, false, false, true, true, true]);

    // No length cap in System: 16 ft goes to the Store.
    for (let i = 0; i < 10; i++) await outdoor.locator('#longer').click();
    for (let i = 0; i < 100 && !exactOf().at(-1).payload.definition.configurationVersion.startsWith('table-benches-16ft'); i++) await page.waitForTimeout(100);
    exact = exactOf().at(-1);
    assert.equal(exact.payload.definition.configurationVersion, 'table-benches-16ft-cedar-SILICO-v1');
    assert.ok(exact.payload.definition.cutPackages[0].parts.some(p => p.lengthIn === 16 * 12 - 0.5));
    assert.equal(await base.evaluate(() => [...document.querySelectorAll('.page.on')].pop()?.id), 'outdoor-build-live');

    // Back to a finish the Store resolves: a fresh exact answer, complete again.
    before = exactOf().length;
    await outdoor.locator('[data-tier="COATED"]').click();
    exact = await settle(before);
    await outdoor.waitForSelector('#a-total-wrap:not([hidden])', { timeout: 20000 });
    assert.equal(exact.payload.definition.configurationVersion, 'table-benches-16ft-cedar-COATED-v1');
    await base.locator('.recovery-nav button:visible', { hasText: 'Your call' }).first().click();
    await page.waitForTimeout(500);
    assert.equal(await outdoor.locator('#view-call').isVisible(), true);

    // Accept & pay (simulated) -> We cut it -> Pick up & build, all on the Outdoor page, carrying the exact receipt.
    assert.equal(await outdoor.locator('#accept-pay').isDisabled(), true, 'nothing is paid before accepting');
    await outdoor.locator('#accept-box').check();
    await outdoor.locator('#accept-pay').click();
    await page.waitForTimeout(400);
    assert.equal(await outdoor.locator('#view-yard').isVisible(), true);
    assert.match(await outdoor.locator('#yard-timeline').innerText(), new RegExp(('receipt-' + exact.requestId).slice(0, 12)));
    assert.ok((await outdoor.locator('#yard-boards tr').count()) > 0, 'the cut list comes from the Store answer');
    nav = await navState(base);
    assert.deepEqual(nav.filter(b => /^\d · /.test(b.label)).map(b => b.inert), [false, false, false, false, false, true]);
    await outdoor.locator('#mark-cut').click();
    await page.waitForTimeout(400);
    assert.equal(await outdoor.locator('#view-record').isVisible(), true);
    assert.match(await outdoor.locator('#record-kit').innerText(), /FAKE-HW-COATED\|SCR-2P5-[\s\S]*1 × 50 \(50 pcs\)/, 'the kit lists the Store-resolved hardware and packages');
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

// The real pinned Store, through the real System server: needs a Store checkout at STORE_PIN (STB_STORE_ZERO_ROOT).
test('Outdoor against the pinned Store: both plans get a complete exact answer; hardware SKU, packages and price come from the Store', { timeout: 300000, skip: !process.env.STB_STORE_ZERO_ROOT && 'needs STB_STORE_ZERO_ROOT (Store checkout at STORE_PIN)' }, async () => {
  const { STORE_PIN, STORE_PATHS } = await import('../../shared/contracts.mjs');
  const { createStoreAdapter } = await import('../../server/store-adapter.mjs');
  const { startServer } = await import('../../server/main.mjs');
  const { postJson } = await import('../helpers/http.mjs');
  const { requireCleanPinnedStore } = await import('../store/helpers.mjs');
  await requireCleanPinnedStore();
  const adapter = await createStoreAdapter();
  assert.equal(adapter.ready, true, JSON.stringify(adapter.inspection));
  assert.equal(RUNTIME.storePin, STORE_PIN, 'the browser runtime and the server pin the same Store');
  const host = await startServer({ storeAdapter: adapter });
  const server = await serve();
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch(process.env.STB_CHROMIUM_PATH ? { executablePath: process.env.STB_CHROMIUM_PATH } : {});
  const calls = [];
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.route(RUNTIME.jobEndpoint, async route => {
      const wire = JSON.parse(route.request().postData());
      const response = await postJson(STORE_PATHS.job, wire);
      calls.push({ wire, status: response.status, body: response.status === 200 ? JSON.parse(response.body) : null });
      await route.fulfill({ status: response.status, headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' }, body: response.body });
    });
    await page.goto(origin + '/system-build-current.html', { waitUntil: 'load' });
    const base = await baseFrame(page);
    await base.locator('#landing button', { hasText: 'NEW USER' }).first().click();
    await base.locator('#new-user [data-door-forward]').click();
    await page.waitForTimeout(400);
    await base.locator('#projects .tile', { hasText: 'Outdoor build' }).first().click();
    const outdoor = await outdoorFrame(page);
    const exactCalls = () => calls.filter(c => !c.wire.payload.definition.configurationVersion.includes('compare'));
    const latest = async (version) => {
      for (let i = 0; i < 300 && exactCalls().at(-1)?.wire.payload.definition.configurationVersion !== version; i++) await page.waitForTimeout(100);
      await outdoor.waitForSelector('#a-total-wrap:not([hidden])', { timeout: 60000 });
      const call = exactCalls().at(-1);
      assert.equal(call.wire.payload.definition.configurationVersion, version);
      assert.equal(call.status, 200);
      return call;
    };
    // Every hardware line: the Store resolved it; SKU, packages and price are the Store's catalog facts.
    const checkHardware = (call, tier) => {
      const items = call.body.rawEvaluation.items;
      assert.ok(items.length > 0);
      for (const item of items) {
        assert.equal(item.status, 'SUPPORTABLE', JSON.stringify(item));
        const offering = adapter.modules.findSku(adapter.catalog, item.storeSku);
        assert.ok(offering && offering.offered, item.storeSku);
        assert.equal(offering.fastener.tier, tier);
        assert.equal(item.piecesPerPackage, offering.fastener.piecesPerPackage);
        assert.equal(item.packages, Math.ceil(item.requiredPieces / item.piecesPerPackage));
        assert.equal(item.sellingPrice, offering.sellingPrice);
      }
      assert.equal(call.body.storePin, STORE_PIN);
      assert.equal(call.body.evaluationReceipt.authority.storeRevision, STORE_PIN);
      return items;
    };
    const callShows = async (call, items) => {
      await base.locator('.recovery-nav button:visible', { hasText: 'Your call' }).first().click();
      await page.waitForTimeout(500);
      const text = await outdoor.locator('#call-lines').innerText();
      for (const item of items) {
        assert.ok(text.includes(item.storeSku), text);
        assert.ok(text.includes(`${item.packages} × ${item.piecesPerPackage} (${item.piecesSupplied} pcs)`), text);
      }
      const receipt = await outdoor.locator('#call-receipt').innerText();
      assert.ok(receipt.includes(String(call.body.evaluationReceipt.receiptHash).slice(0, 12)), receipt);
      assert.ok(receipt.includes(call.wire.payload.definition.configurationVersion), receipt);
      const sum = [...call.body.rawEvaluation.packages, ...items].reduce((s, l) => s + l.Q, 0);
      assert.equal(await outdoor.locator('#call-total').innerText(), '$' + sum.toFixed(2));
      await base.locator('.recovery-nav button:visible', { hasText: 'Make it yours' }).first().click();
      await page.waitForTimeout(300);
      return call.body.evaluationReceipt.receiptHash;
    };

    await outdoor.locator('[data-plan="table-benches"]').click();
    let call = await latest('table-benches-6ft-ground-contact-COATED-v1');
    const receipts = [await callShows(call, checkHardware(call, 'COATED'))];
    await outdoor.locator('[data-tier="HOTDIP"]').click();
    call = await latest('table-benches-6ft-ground-contact-HOTDIP-v1');
    receipts.push(await callShows(call, checkHardware(call, 'HOT_DIP_GALVANIZED')));
    await outdoor.locator('[data-wood="cedar"]').click();
    call = await latest('table-benches-6ft-cedar-HOTDIP-v1');
    receipts.push(await callShows(call, checkHardware(call, 'HOT_DIP_GALVANIZED')));

    await base.locator('.recovery-nav button:visible', { hasText: 'Your idea' }).first().click();
    await page.waitForTimeout(400);
    await outdoor.locator('[data-plan="a-frame"]').click();
    call = await latest('a-frame-6ft-treated-COATED-v1');
    receipts.push(await callShows(call, checkHardware(call, 'COATED')));
    await outdoor.locator('[data-tier="STAINL"]').click();
    call = await latest('a-frame-6ft-treated-STAINL-v1');
    receipts.push(await callShows(call, checkHardware(call, 'STAINLESS')));

    assert.equal(new Set(receipts).size, receipts.length, 'every changed definition got a new Store receipt');
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
    server.close();
    await host.close();
  }
});
