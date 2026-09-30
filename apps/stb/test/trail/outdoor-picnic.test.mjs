// Outdoor picnic page 0.3 wiring, in a real browser, through the real System shell.
// A scripted Store answers every request so the test checks the page's wiring, not Store prices:
//  - the top nav is the six trail steps on the Outdoor page only; steps it cannot use yet are inert
//  - each plan card resizes to the inch, inside the plan rule, and shows the Store's price for exactly that plan
//  - "take it to the bench" sends only the plan until you add work: its boards, lengths and angles, no holes
//  - the bench draws every board; spot holes and decorative cuts are set per kind of board, from the settings
//    the plan's configurator made; the bench adds none. Plan angles are never changed.
//  - hole locations are not published by the plans: none are drawn or sent until the customer places them
//  - hardware packs travel as requirements; the page names no Store item
//  - every change is a new exact request with a new version identity
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
  const items = (def.itemLines || []).map(l => ({ ...l, status: 'SUPPORTABLE', storeSku: 'FAKE-ITEM-' + l.lineId, packages: 1, sellingPrice: 2, Q: l.qty * 2, reasonCodes: [] }));
  const sum = [...packages, ...items].reduce((n, l) => n + l.Q, 0);
  const receipt = { requestId: wire.requestId, freshnessRule: 'STB-STORE-FRESH-EVALUATION-0.1', evaluatedAt: '2026-09-26T00:00:00Z',
    authority: { storeRevision: RUNTIME.storePin }, receiptHash: 'receipt-' + wire.requestId };
  const keys = ['protocolVersion', 'requestId', 'attemptId', 'projectId', 'candidateRevisionId', 'requestType', 'scope', 'demandSignature', 'payloadDigest'];
  return {
    ...Object.fromEntries(keys.map(k => [k, wire[k]])),
    storePin: RUNTIME.storePin,
    rawEvaluation: { status: 'SUPPORTABLE', freshEvaluation: true, packages, items, totals: { sumOfSupportableLines: sum, material: 6 * packages.length, machine_service: 4 * packages.length, items: items.reduce((n, l) => n + l.Q, 0) }, evaluationReceipt: receipt },
    evaluationReceipt: receipt,
  };
}

async function outdoorFrame(page) {
  for (let i = 0; i < 60; i++) {
    const f = page.frames().find(fr => fr.url().includes('stb-outdoor-picnic-0.3.html'));
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

const BENCHES_FIXED = { 'TABLE-LEG': 26, 'TABLE-SUPPORT': 27.5, 'BENCH-LEG': 16.5, 'BENCH-SUPPORT': 11.5 };
const A_FRAME_FIXED = { LEG: 31.375, BRACE: 32.875, SUPPORT: 61, 'CLEAT-END': 34.25, 'CLEAT-MID': 29.25 };
const partsOf = def => def.cutPackages.flatMap(p => p.parts.map(x => ({ ...x, pkg: p.packageId, angle: p.endCut.angleDeg })));
const prefix = id => id.replace(/-\d+$/, '');
// The plan, and only the plan: every board at the plan's length (slats at the table length), the plan's angles, no holes.
function assertOnlyThePlan(def, lengthIn, fixed, angles) {
  for (const x of partsOf(def)) {
    const kind = prefix(x.partId);
    if (fixed[kind] != null) assert.equal(x.lengthIn, fixed[kind], kind + ' stays as the plan gives it');
    else assert.equal(x.lengthIn, lengthIn, kind + ' follows the table length');
    assert.equal(x.spots, undefined, 'no holes until the customer places them: ' + x.partId);
    assert.equal(x.angle, angles[kind] || 0, 'the plan\'s angle for ' + kind);
  }
  assert.ok(def.cutPackages.every(p => p.finishedWidthIn === undefined));
  assert.ok((def.itemLines || []).every(l => l.requirement && l.storeSku === undefined), 'hardware travels as requirements, never item numbers');
}

test('Outdoor 0.3: cards resize and price, the bench takes each board, the plan stays the plan', { timeout: 180000 }, async () => {
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
    const od = () => outdoor.evaluate(() => window.STBOutdoorPicnic.state());
    const settle = async label => { for (let i = 0; i < 120; i++) { const s = await od(); if (!s.asking && s.current) return s; await page.waitForTimeout(100); } throw new Error('no answer: ' + label); };
    const cardsSettled = async () => { for (let i = 0; i < 120; i++) { const s = await od(); if (Object.values(s.cards).every(c => !c.asking && c.answered)) return; await page.waitForTimeout(100); } throw new Error('card prices never came'); };
    const cardReq = plan => requests.filter(r => r.payload.definition.configurationVersion.startsWith('od-card-') && r.payload.definition.configurationId === 'OUTDOOR-PICNIC-' + plan.toUpperCase()).at(-1);
    const exactOf = () => requests.filter(r => /^od-r\d+-/.test(r.payload.definition.configurationVersion));
    const steps = async () => (await navState(base)).filter(b => /^\d · /.test(b.label));

    // Six steps, all on the Outdoor page; only "Your idea" usable before a plan goes to the bench.
    const nav = await navState(base);
    assert.deepEqual((await steps()).map(b => b.label.replace(/^\d · /, '')), ['Your idea', 'The bench', 'The Store answers', 'Your call', 'We cut it', 'Pick up & build']);
    assert.ok((await steps()).every(b => b.go === 'outdoor-build-live'));
    assert.deepEqual((await steps()).map(b => b.inert), [false, true, true, true, true, true]);
    assert.ok(nav.every(b => /^\d · /.test(b.label) || b.go === 'projects'), 'no buttons into other jobs: ' + JSON.stringify(nav));
    assert.equal(await outdoor.locator('.step:visible').count(), 0, 'the page\'s own step buttons are hidden inside the shell');
    // One guide, not two: six rail slots filled from the guide file; the shell's own rail hidden here.
    assert.equal(await outdoor.locator('aside.rail[data-guide-id]').count(), 6);
    assert.equal(await base.locator('#outdoor-build-live > aside.rail').isVisible(), false);

    // Page 1: two cards, photos named as photos, each with its own resize and its own Store price.
    assert.equal(await outdoor.locator('#plans .plan').count(), 2);
    assert.equal(await outdoor.locator('#plans .plan .cap', { hasText: 'A photo of a finished table, not a drawing' }).count(), 2);
    await cardsSettled();
    assert.match(await outdoor.locator('[data-card="a-frame"] [data-card-price]').innerText(), /\$\d/);
    assertOnlyThePlan(cardReq('a-frame').payload.definition, 72, A_FRAME_FIXED, { LEG: 25, BRACE: 25 });
    assertOnlyThePlan(cardReq('table-benches').payload.definition, 72, BENCHES_FIXED, {});
    // Resize a card to the inch: 85 in. Only the slats follow; the price is asked again for exactly that size.
    await outdoor.locator('[data-card="table-benches"] [data-card-size="12"]').click();
    await outdoor.locator('[data-card="table-benches"] [data-card-size="1"]').click();
    await cardsSettled();
    assertOnlyThePlan(cardReq('table-benches').payload.definition, 85, BENCHES_FIXED, {});
    assert.match(await outdoor.locator('[data-card="table-benches"] [data-card-price]').innerText(), /7 ft 1 in/);
    // Sizes stay inside the plan rule.
    await outdoor.evaluate(() => window.STBOutdoorPicnic.setCardLength('a-frame', 400));
    assert.equal((await od()).cards['a-frame'].lengthIn, 216);
    await outdoor.evaluate(() => window.STBOutdoorPicnic.setCardLength('a-frame', 10));
    assert.equal((await od()).cards['a-frame'].lengthIn, 60);
    await outdoor.evaluate(() => window.STBOutdoorPicnic.setCardLength('a-frame', 96));
    await cardsSettled();
    // Card prices never feed your call.
    assert.deepEqual((await steps()).map(b => b.inert), [false, true, true, true, true, true]);

    // Take the A-frame to the bench: the same plan, the same size, nothing added.
    await outdoor.locator('[data-to-bench="a-frame"]').click();
    await settle('bench');
    assert.equal((await od()).section, 'bench');
    let exact = exactOf().at(-1);
    assert.match(exact.payload.definition.configurationVersion, /^od-r\d+-[0-9a-f]{8}$/);
    assertOnlyThePlan(exact.payload.definition, 96, A_FRAME_FIXED, { LEG: 25, BRACE: 25 });
    assert.deepEqual(exact.payload.definition.cutPackages, cardReq('a-frame').payload.definition.cutPackages, 'the bench starts from exactly the card');
    assert.equal(exact.expectedStorePin, RUNTIME.storePin);
    assert.deepEqual((await steps()).map(b => b.inert), [false, false, false, false, true, true]);
    // The table set's photo, top left of the bench.
    assert.match(await outdoor.locator('#bench-photo').getAttribute('src'), /plan-a-frame-photo/);
    // Every kind of board is on the bench, drawn; the plan publishes no hole locations, and the page says so.
    assert.equal(await outdoor.locator('#parts-bench [data-part]').count(), 7);
    assert.equal(await outdoor.locator('#parts-bench svg').count(), 7);
    assert.equal(await outdoor.locator('#parts-bench svg text', { hasText: 'hole locations: not published by the plan' }).count(), 7);
    assert.match(await outdoor.locator('#s-bench .honest').innerText(), /Neither plan publishes hole locations/);
    // The bench shows exactly the settings the plan's configurator made; no decorative cut on the plan's 25° boards.
    const knobs = await outdoor.evaluate(() => window.STBOutdoorPicnic.knobs());
    assert.deepEqual((await outdoor.evaluate(() => window.STBOutdoorPicnic.benchKnobs())).sort(), [...knobs].sort());
    assert.ok(!knobs.includes('DECO:LEG') && !knobs.includes('DECO:BRACE'));
    assert.equal(await outdoor.locator('[data-part="LEG"] [data-tool="deco"]').count(), 0);

    // Wood and hardware: a new exact request each time.
    const before = exact.payload.definition.configurationVersion;
    await outdoor.locator('#woods [data-wood="cedar"]').click();
    await outdoor.locator('#tiers [data-tier="BYO"]').click();
    await settle('cedar byo');
    exact = exactOf().at(-1);
    assert.notEqual(exact.payload.definition.configurationVersion, before);
    assert.ok(exact.payload.definition.cutPackages.every(p => p.packageId.startsWith('cedar|')));
    assert.equal(exact.payload.definition.itemLines, undefined, 'bring your own sends no hardware lines');
    await outdoor.locator('#tiers [data-tier="STAINL"]').click();
    await settle('stainless');
    assert.deepEqual(exactOf().at(-1).payload.definition.itemLines.map(l => l.requirement), [{ kind: 'wood-screw', gauge: '#10', lengthIn: 2.5, finish: 'stainless', unit: 'piece' }]);

    // Spot holes on the seat boards: nothing is sent until you place them.
    await outdoor.locator('[data-part="SEAT"] [data-tool="spots"]').click();
    assert.ok((await outdoor.evaluate(() => window.STBOutdoorPicnic.conditions())).some(c => c.block && /Spot holes on Seat board/.test(c.t)));
    assert.equal(await outdoor.locator('#btn-store').isDisabled(), true);
    await outdoor.locator('[data-part="SEAT"] [data-in="fromEndIn"]').fill('4');
    await outdoor.locator('[data-part="SEAT"] [data-in="place"]').selectOption('CENTER');
    // A 45° decorative cut on the tabletop boards.
    await outdoor.locator('[data-part="TOP"] [data-tool="deco"]').click();
    await settle('spots and cut');
    exact = exactOf().at(-1);
    const byKind = kind => partsOf(exact.payload.definition).filter(x => prefix(x.partId) === kind);
    for (const x of byKind('SEAT')) { assert.deepEqual(x.spots, [{ xIn: 4, acrossWidthRule: 'CENTERED_ON_WIDE_FACE' }, { xIn: 92, acrossWidthRule: 'CENTERED_ON_WIDE_FACE' }]); assert.equal(x.angle, 0); }
    for (const x of byKind('TOP')) { assert.equal(x.angle, 45, 'decorative cut goes to the Store; the Store decides'); assert.equal(x.spots, undefined); }
    assert.ok(byKind('LEG').every(x => x.angle === 25) && byKind('BRACE').every(x => x.angle === 25), 'the plan\'s 25° is untouched');
    assert.ok(['SUPPORT', 'CLEAT-END', 'CLEAT-MID'].every(k => byKind(k).every(x => x.angle === 0 && !x.spots)), 'other boards untouched');
    assert.match(await outdoor.locator('[data-part="SEAT"] svg').innerHTML(), /circle/);
    assert.match(await outdoor.locator('[data-part="TOP"] svg').innerHTML(), /45°/);
    // Turn them off: only the plan travels again.
    await outdoor.locator('[data-part="SEAT"] [data-tool="spots"]').click();
    await outdoor.locator('[data-part="TOP"] [data-tool="deco"]').click();
    await settle('plan again');
    assertOnlyThePlan(exactOf().at(-1).payload.definition, 96, A_FRAME_FIXED, { LEG: 25, BRACE: 25 });
    await outdoor.locator('[data-part="TOP"] [data-tool="deco"]').click();
    await settle('cut again');

    // The Store answers, then your call shows the receipt of that exact request.
    exact = exactOf().at(-1);
    await outdoor.locator('#btn-store').click();
    await outdoor.waitForSelector('#s-store:not([hidden])', { timeout: 5000 });
    await base.locator('.recovery-nav button:visible', { hasText: '4 · Your call' }).first().click();
    await outdoor.waitForSelector('#s-call:not([hidden])', { timeout: 5000 });
    const receiptText = await outdoor.locator('#call-receipt').innerText();
    assert.ok(receiptText.includes(('receipt-' + exact.requestId).slice(0, 12)), receiptText);
    assert.ok(receiptText.includes(exact.payload.definition.configurationVersion), receiptText);
    assert.equal(await base.evaluate(() => [...document.querySelectorAll('.page.on')].pop()?.id), 'outdoor-build-live');

    // The shared terms flow: Store answer -> simulated offer -> accept & send -> run the yard -> record pickup.
    assert.equal(await outdoor.locator('#call-terms [data-terms-event="arrived"]').getAttribute('data-terms-state'), 'done');
    await outdoor.locator('#call-terms [data-terms-action="accept"]').click();
    await outdoor.waitForSelector('#s-yard:not([hidden])');
    for (const id of ['offered', 'decision', 'paid', 'queued']) assert.equal(await outdoor.locator(`#yard-terms [data-terms-event="${id}"]`).getAttribute('data-terms-state'), 'done', id);
    assert.ok((await outdoor.locator('#yard-boards tr').count()) > 0, 'the cut list comes from the Store answer');
    assert.deepEqual((await steps()).map(b => b.inert), [false, false, false, false, false, true]);
    await outdoor.locator('#yard-terms [data-terms-action="yard"]').click();
    await outdoor.waitForSelector('#s-record:not([hidden])');
    await outdoor.locator('#record-terms [data-terms-action="pickup"]').click();
    await outdoor.waitForSelector('#record-terms [data-terms-receipt]');
    assert.equal(await outdoor.locator('#record-terms [data-terms-state="done"]').count(), 13, 'every event recorded');
    assert.deepEqual((await steps()).map(b => b.inert), [false, false, false, false, false, false]);
    await base.locator('.recovery-nav button:visible', { hasText: '5 · We cut it' }).first().click();
    await outdoor.waitForSelector('#s-yard:not([hidden])', { timeout: 5000 });
    await base.locator('.recovery-nav button:visible', { hasText: '6 · Pick up & build' }).first().click();
    await outdoor.waitForSelector('#s-record:not([hidden])', { timeout: 5000 });

    // "Your idea" returns to the cards, still on the Outdoor page.
    await base.locator('.recovery-nav button:visible', { hasText: '1 · Your idea' }).first().click();
    await outdoor.waitForSelector('#s-plan:not([hidden])', { timeout: 5000 });
    assert.equal(await base.evaluate(() => [...document.querySelectorAll('.page.on')].pop()?.id), 'outdoor-build-live');
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
    server.close();
  }
});
