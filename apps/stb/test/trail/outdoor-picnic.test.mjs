// Outdoor picnic page 0.2 wiring, in a real browser, through the real System shell.
// A scripted Store answers every request so the test checks the page's wiring, not Store prices:
//  - the top nav is the six trail steps on the Outdoor page only; steps it cannot use yet are inert
//  - page 1 (your plan) and page 2 (make it yours) both sit on step 1
//  - the plan road sends only the plan: its parts, its lengths (slats follow the table length), its angles
//  - sizes stay inside the plan rule, to the inch; the Store decides what it can cut
//  - additions (a decorative slat-end angle, holes for hardware) are made on page 2 only, and never travel on the plan road
//  - hardware packs travel as requirements; the page names no Store item
//  - every change is a new exact request with a new version identity
//  - "Your call" shows the receipt of the exact request, never the option prices
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
    const f = page.frames().find(fr => fr.url().includes('stb-outdoor-picnic-0.2.html'));
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
// The plan, and only the plan: every part at the plan's length (slats at the table length), the plan's angles, no holes.
function assertOnlyThePlan(def, lengthIn, fixed, angles) {
  for (const x of partsOf(def)) {
    const kind = prefix(x.partId);
    if (fixed[kind] != null) assert.equal(x.lengthIn, fixed[kind], kind + ' stays as the plan gives it');
    else assert.equal(x.lengthIn, lengthIn, kind + ' follows the table length');
    assert.equal(x.spots, undefined, 'the plan road sends no holes: ' + x.partId);
    assert.equal(x.angle, angles[kind] || 0, 'the plan\'s angle for ' + kind);
  }
  assert.ok(def.cutPackages.every(p => p.finishedWidthIn === undefined));
  assert.ok((def.itemLines || []).every(l => l.requirement && l.storeSku === undefined), 'hardware travels as requirements, never item numbers');
}

test('Outdoor 0.2: two roads, the plan road sends only the plan, additions made at intent', { timeout: 180000 }, async () => {
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
    const exactOf = () => requests.filter(r => r.payload.definition.configurationId !== 'OUTDOOR-PICNIC-OPTIONS');
    const steps = async () => (await navState(base)).filter(b => /^\d · /.test(b.label));

    // Six steps, all on the Outdoor page; only "Your idea" usable before a plan is chosen.
    let nav = await navState(base);
    assert.deepEqual((await steps()).map(b => b.label.replace(/^\d · /, '')), ['Your idea', 'The bench', 'The Store answers', 'Your call', 'We cut it', 'Pick up & build']);
    assert.ok((await steps()).every(b => b.go === 'outdoor-build-live'));
    assert.deepEqual((await steps()).map(b => b.inert), [false, true, true, true, true, true]);
    assert.ok(nav.every(b => /^\d · /.test(b.label) || b.go === 'projects'), 'no buttons into other jobs: ' + JSON.stringify(nav));
    assert.equal(await outdoor.locator('.step:visible').count(), 0, 'the page\'s own step buttons are hidden inside the shell');
    // One guide, not two: the page's rail slots are filled from the guide file, the shell's own rail is hidden here.
    assert.equal(await outdoor.locator('aside.rail[data-guide-id]').count(), 7);
    assert.match(await outdoor.locator('#s-plan aside.rail').innerText(), /outdoor-plan/);
    assert.equal(await base.locator('#outdoor-build-live > aside.rail').isVisible(), false);

    // Page 1: two plans, their pictures named as photos, not drawings.
    assert.equal(await outdoor.locator('#plans .plan').count(), 2);
    assert.equal(await outdoor.locator('#plans .plan .cap', { hasText: 'A photo of a finished table, not a drawing' }).count(), 2);

    // Pick the table + benches: the instant price is the Store's answer to exactly this table.
    await outdoor.locator('[data-plan="table-benches"]').click();
    await settle('benches');
    let exact = exactOf().at(-1);
    assert.match(exact.payload.definition.configurationVersion, /^od-r\d+-[0-9a-f]{8}$/);
    assert.ok(exact.payload.definition.cutPackages.every(p => p.packageId.startsWith('ground-contact|')));
    assert.deepEqual(exact.payload.definition.itemLines.map(l => l.requirement.finish), ['coated', 'coated', 'coated']);
    assertOnlyThePlan(exact.payload.definition, 72, BENCHES_FIXED, {});
    assert.equal(exact.expectedStorePin, RUNTIME.storePin);
    assert.match(await outdoor.locator('#instant').innerText(), /Complete budgetary estimate/);
    // Option prices come from one Store request covering every wood and every pack; it never feeds your call.
    for (let i = 0; i < 60 && !requests.some(r => r.payload.definition.configurationId === 'OUTDOOR-PICNIC-OPTIONS'); i++) await page.waitForTimeout(100);
    const options = requests.find(r => r.payload.definition.configurationId === 'OUTDOOR-PICNIC-OPTIONS');
    assert.ok(options, 'one options request');
    assert.equal(new Set(options.payload.definition.cutPackages.map(p => p.packageId.split('|')[0])).size, 5, 'every wood');
    assert.deepEqual([...new Set(options.payload.definition.itemLines.map(l => l.requirement.finish))], ['coated', 'hot-dip-galvanized', 'stainless', 'silicon-bronze'], 'every pack, cheap to good');
    assert.deepEqual((await steps()).map(b => b.inert), [false, false, false, false, true, true]);

    // Grow it to the inch: 85 in. Only the slats follow; every other part and every angle stays as the plan gives it.
    await outdoor.locator('#s-plan [data-size="12"]').click();
    await outdoor.locator('#s-plan [data-size="1"]').click();
    await settle('85 in');
    exact = exactOf().at(-1);
    assertOnlyThePlan(exact.payload.definition, 85, BENCHES_FIXED, {});
    // Sizes stay inside the plan rule.
    await outdoor.evaluate(() => window.STBOutdoorPicnic.setLength(400));
    assert.equal((await od()).lengthIn, 216);
    await outdoor.evaluate(() => window.STBOutdoorPicnic.setLength(10));
    assert.equal((await od()).lengthIn, 60);
    await outdoor.locator('#size-chips [data-size-to="96"]').click();
    await settle('96 in');

    // The A-frame keeps its 25° legs and cross supports at any size.
    await outdoor.locator('[data-plan="a-frame"]').click();
    await settle('a-frame');
    await outdoor.locator('#size-chips [data-size-to="96"]').click();
    await settle('a-frame 96');
    exact = exactOf().at(-1);
    assertOnlyThePlan(exact.payload.definition, 96, A_FRAME_FIXED, { LEG: 25, BRACE: 25 });
    assert.ok(exact.payload.definition.cutPackages.every(p => p.packageId.startsWith('treated|')));

    // A different wood and bring-your-own hardware: a new exact request with a new version.
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

    // Make it yours: additions are made on page 2 only. The bench turns what it arrives with and adds nothing.
    await outdoor.locator('[data-road="yours"]').click();
    assert.equal((await od()).section, 'yours');
    assert.equal((await steps()).find(b => /Your idea/.test(b.label)).inert, false);
    await outdoor.locator('#add-miter [data-add]').check();
    await outdoor.locator('#add-holes [data-add]').check();
    assert.deepEqual(await outdoor.evaluate(() => window.STBOutdoorPicnic.knobs()), ['SIZE', 'WOOD', 'HARDWARE', 'MITER', 'HOLES']);
    await outdoor.locator('#s-yours [data-to="bench"]').click();
    assert.deepEqual((await outdoor.evaluate(() => window.STBOutdoorPicnic.benchKnobs())).sort(), ['HARDWARE', 'HOLES', 'MITER', 'SIZE', 'WOOD']);
    assert.equal(await outdoor.locator('#s-bench [data-add]').count(), 0, 'the bench has no control that adds a setting');
    // An addition brings its facts empty: the Store isn't asked until they're set.
    assert.deepEqual((await outdoor.evaluate(() => window.STBOutdoorPicnic.conditions())).filter(c => c.block).map(c => c.t),
      ['The decorative angle needs a number', 'The holes need a distance from each end and a placement']);
    assert.equal(await outdoor.locator('#btn-store').isDisabled(), true);
    await outdoor.locator('#b-miter').fill('30');
    await outdoor.locator('#b-hole-end').fill('4');
    await outdoor.locator('#b-hole-place').selectOption('CENTER');
    await outdoor.locator('#s-bench h1').click();
    await settle('additions');
    exact = exactOf().at(-1);
    const slats = exact.payload.definition.cutPackages.find(p => p.packageId.endsWith('|SLATS'));
    assert.equal(slats.endCut.angleDeg, 30, 'the decorative angle goes to the Store; the Store decides');
    for (const x of slats.parts) assert.deepEqual(x.spots, [{ xIn: 4, acrossWidthRule: 'CENTERED_ON_WIDE_FACE' }, { xIn: 92, acrossWidthRule: 'CENTERED_ON_WIDE_FACE' }], 'holes where you said, on every slat');
    for (const p of exact.payload.definition.cutPackages.filter(p => !p.packageId.endsWith('|SLATS'))) {
      assert.equal(p.endCut.angleDeg, { LEGS: 25, BRACES: 25 }[p.packageId.split('|')[1]] || 0, 'the plan\'s own angles are untouched');
      assert.ok(p.parts.every(x => !x.spots));
    }
    // Back on the plan road, the additions are not sent: only the plan travels.
    await outdoor.locator('#s-bench [data-back-from-bench]').click();
    await outdoor.locator('#s-yours [data-to="plan"]').click();
    await outdoor.locator('[data-road="plan"]').click();
    await settle('plan road again');
    assertOnlyThePlan(exactOf().at(-1).payload.definition, 96, A_FRAME_FIXED, { LEG: 25, BRACE: 25 });
    assert.deepEqual(await outdoor.evaluate(() => window.STBOutdoorPicnic.benchKnobs()), ['SIZE', 'WOOD', 'HARDWARE']);

    // "Your call" from the top nav shows the receipt of that exact request.
    exact = exactOf().at(-1);
    nav = await navState(base);
    await base.locator('.recovery-nav button:visible', { hasText: '4 · Your call' }).first().click();
    // Top-nav clicks reach the Outdoor page as a message; wait for it to switch, then check.
    await outdoor.locator('#s-call').waitFor({ state: 'visible', timeout: 5000 });
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
    // Top-nav clicks reach the Outdoor page as a message; wait for it to switch, then check.
    await outdoor.locator('#s-yard').waitFor({ state: 'visible', timeout: 5000 });
    await base.locator('.recovery-nav button:visible', { hasText: '6 · Pick up & build' }).first().click();
    // Top-nav clicks reach the Outdoor page as a message; wait for it to switch, then check.
    await outdoor.locator('#s-record').waitFor({ state: 'visible', timeout: 5000 });

    // "Your idea" returns to page 1, still on the Outdoor page.
    await base.locator('.recovery-nav button:visible', { hasText: '1 · Your idea' }).first().click();
    // Top-nav clicks reach the Outdoor page as a message; wait for it to switch, then check.
    await outdoor.locator('#s-plan').waitFor({ state: 'visible', timeout: 5000 });
    assert.equal(await base.evaluate(() => [...document.querySelectorAll('.page.on')].pop()?.id), 'outdoor-build-live');
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
    server.close();
  }
});
