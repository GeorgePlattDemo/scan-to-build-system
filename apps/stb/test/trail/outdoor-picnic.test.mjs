// Outdoor picnic page 0.4 wiring, in a real browser, through the real System shell.
// A scripted Store answers every request so the test checks the page's wiring, not Store prices:
//  - the top nav is the six trail steps on the Outdoor page only; steps it cannot use yet are inert
//  - screen 1: two plan cards, each with a "From" price the Store answered
//  - screen 2: the plan as published. Grow or shrink to the inch inside the plan rule, pick wood and hardware,
//    the Store's live total, "Confirm & send". Only the plan is sent: its boards, lengths and angles, no holes
//  - one small button takes the plan to a bigger bench: every board drawn, spot holes and decorative cuts per
//    kind of board, the Store's answer for each thing tried, and who upstream could move the edge
//  - "Back to the plan as is" drops the work and asks the Store for the plan again
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
    const f = page.frames().find(fr => fr.url().includes('stb-outdoor-picnic-0.4.html'));
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

test('Outdoor 0.4: the plan as published, a bigger bench, and back', { timeout: 180000 }, async () => {
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
    const exactOf = () => requests.filter(r => /^od-r\d+-/.test(r.payload.definition.configurationVersion));
    const optionsOf = () => requests.filter(r => r.payload.definition.configurationId === 'OUTDOOR-PICNIC-OPTIONS');
    const steps = async () => (await navState(base)).filter(b => /^\d · /.test(b.label));

    // Six steps, all on the Outdoor page; only "Your idea" usable before a plan is picked.
    const nav = await navState(base);
    assert.deepEqual((await steps()).map(b => b.label.replace(/^\d · /, '')), ['Your idea', 'The bench', 'The Store answers', 'Your call', 'We cut it', 'Pick up & build']);
    assert.ok((await steps()).every(b => b.go === 'outdoor-build-live'));
    assert.deepEqual((await steps()).map(b => b.inert), [false, true, true, true, true, true]);
    assert.ok(nav.every(b => /^\d · /.test(b.label) || b.go === 'projects'), 'no buttons into other jobs: ' + JSON.stringify(nav));
    assert.equal(await outdoor.locator('.step:visible').count(), 0, 'the page\'s own step buttons are hidden inside the shell');
    // One guide, not two: six rail slots filled from the guide file; the shell's own rail hidden here.
    assert.equal(await outdoor.locator('aside.rail[data-guide-id]').count(), 6);
    assert.equal(await base.locator('#outdoor-build-live > aside.rail').isVisible(), false);

    // Screen 1: two cards, photos named as photos, each with a "From" price the Store answered for the plan as published.
    assert.equal(await outdoor.locator('#plans .plan').count(), 2);
    assert.equal(await outdoor.locator('#plans .plan .cap', { hasText: 'A photo of a finished table, not a drawing' }).count(), 2);
    await outdoor.waitForFunction(() => [...document.querySelectorAll('[data-from]')].every(e => /From/.test(e.textContent)), null, { timeout: 10000 });
    for (const r of optionsOf().slice(0, 2)) assert.equal(r.payload.definition.itemLines, undefined, '"From" is your own hardware');
    const fromAF = optionsOf().slice(0, 2).find(r => r.payload.definition.cutPackages.some(p => p.packageId.endsWith('|LEGS')));
    assertOnlyThePlan({ cutPackages: fromAF.payload.definition.cutPackages.filter(p => p.packageId.startsWith('treated|')) }, 72, A_FRAME_FIXED, { LEG: 25, BRACE: 25 });

    // Screen 2: the plan as published, at 6 ft, nothing added.
    await outdoor.locator('[data-plan="a-frame"]').click();
    await settle('build');
    assert.equal((await od()).section, 'build');
    let exact = exactOf().at(-1);
    assert.match(exact.payload.definition.configurationVersion, /^od-r\d+-[0-9a-f]{8}$/);
    assertOnlyThePlan(exact.payload.definition, 72, A_FRAME_FIXED, { LEG: 25, BRACE: 25 });
    assert.equal(exact.expectedStorePin, RUNTIME.storePin);
    assert.deepEqual((await steps()).map(b => b.inert), [false, false, false, false, true, true]);
    assert.match(await outdoor.locator('#photo').getAttribute('src'), /plan-a-frame-photo/);
    assert.equal(await outdoor.locator('#parts tr').count(), 7);
    assert.equal(await outdoor.locator('#s-build [data-tool]').count(), 0, 'screen 2 adds no work: it is the plan as published');
    assert.equal(await outdoor.locator('#confirm').isDisabled(), false);
    assert.match(await outdoor.locator('#to-edge').innerText(), /Bring this to a bigger bench for more work/);

    // Grow to the inch: 85 in. Only the slats follow; the Store is asked again for exactly that size.
    await outdoor.locator('#s-build [data-size="12"]').click();
    await outdoor.locator('#s-build [data-size="1"]').click();
    await settle('85');
    assertOnlyThePlan(exactOf().at(-1).payload.definition, 85, A_FRAME_FIXED, { LEG: 25, BRACE: 25 });
    assert.match(await outdoor.locator('#len-val').innerText(), /7 ft 1 in/);
    // Sizes stay inside the plan rule.
    await outdoor.evaluate(() => window.STBOutdoorPicnic.setLength(400));
    assert.equal((await od()).lengthIn, 216);
    await outdoor.evaluate(() => window.STBOutdoorPicnic.setLength(10));
    assert.equal((await od()).lengthIn, 60);
    await outdoor.evaluate(() => window.STBOutdoorPicnic.setLength(96));
    await settle('96');

    // Wood and hardware: a new exact request each time.
    const before = exactOf().at(-1).payload.definition.configurationVersion;
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
    // "The set" puts back the plan's wood, the coated pack and 6 ft.
    await outdoor.locator('#the-set').click();
    await settle('the set');
    exact = exactOf().at(-1);
    assertOnlyThePlan(exact.payload.definition, 72, A_FRAME_FIXED, { LEG: 25, BRACE: 25 });
    assert.ok(exact.payload.definition.cutPackages.every(p => p.packageId.startsWith('treated|')));
    assert.equal(exact.payload.definition.itemLines[0].requirement.finish, 'coated');
    const planVersion = exact.payload.definition.configurationVersion.replace(/^od-r\d+-/, '');

    // The button: a bigger bench. The photo top left, every board drawn, no holes until you place them.
    await outdoor.locator('#to-edge').click();
    assert.equal((await od()).section, 'edge');
    assert.equal(await outdoor.locator('#s-edge:not([hidden])').count(), 1);
    assert.match(await outdoor.locator('#edge-photo').getAttribute('src'), /plan-a-frame-photo/);
    assert.equal(await outdoor.locator('#parts-bench [data-part]').count(), 7);
    assert.equal(await outdoor.locator('#parts-bench svg text', { hasText: 'hole locations: not published by the plan' }).count(), 7);
    assert.match(await outdoor.locator('#edge-list').innerText(), /Published plans aren’t detailed enough to drill from/);
    assert.match(await outdoor.locator('#s-edge .edge-head').innerText(), /Information travels before atoms/);
    assert.equal(await outdoor.locator('#send-work').isDisabled(), true, 'nothing tried yet');
    // The edge shows exactly the settings the plan's configurator made; no decorative cut on the plan's 25° boards.
    const knobs = await outdoor.evaluate(() => window.STBOutdoorPicnic.knobs());
    assert.deepEqual((await outdoor.evaluate(() => window.STBOutdoorPicnic.benchKnobs())).sort(), [...knobs].sort());
    assert.ok(!knobs.includes('DECO:LEG') && !knobs.includes('DECO:BRACE'));
    assert.equal(await outdoor.locator('[data-part="LEG"] [data-tool="deco"]').count(), 0);

    // Spot holes on the seat boards: nothing is sent until you place them.
    await outdoor.locator('[data-part="SEAT"] [data-tool="spots"]').click();
    assert.ok((await outdoor.evaluate(() => window.STBOutdoorPicnic.conditions())).some(c => c.block && /Spot holes on Seat board/.test(c.t)));
    assert.match(await outdoor.locator('#tried').innerText(), /WAITING/);
    await outdoor.locator('[data-part="SEAT"] [data-in="fromEndIn"]').fill('4');
    await outdoor.locator('[data-part="SEAT"] [data-in="place"]').selectOption('CENTER');
    // A decorative cut on the tabletop boards, 45° to start.
    await outdoor.locator('[data-part="TOP"] [data-tool="deco"]').click();
    await settle('spots and cut');
    exact = exactOf().at(-1);
    const byKind = kind => partsOf(exact.payload.definition).filter(x => prefix(x.partId) === kind);
    for (const x of byKind('SEAT')) { assert.deepEqual(x.spots, [{ xIn: 4, acrossWidthRule: 'CENTERED_ON_WIDE_FACE' }, { xIn: 68, acrossWidthRule: 'CENTERED_ON_WIDE_FACE' }]); assert.equal(x.angle, 0); }
    for (const x of byKind('TOP')) { assert.equal(x.angle, 45, 'decorative cut goes to the Store; the Store decides'); assert.equal(x.spots, undefined); }
    assert.ok(byKind('LEG').every(x => x.angle === 25) && byKind('BRACE').every(x => x.angle === 25), 'the plan\'s 25° is untouched');
    assert.ok(['SUPPORT', 'CLEAT-END', 'CLEAT-MID'].every(k => byKind(k).every(x => x.angle === 0 && !x.spots)), 'other boards untouched');
    assert.match(await outdoor.locator('[data-part="SEAT"] svg').innerHTML(), /circle/);
    assert.match(await outdoor.locator('[data-part="TOP"] svg').innerHTML(), /45°/);
    assert.equal(await outdoor.locator('#tried .res.ok').count(), 2, 'each thing tried gets the Store\'s answer');
    assert.equal(await outdoor.locator('#send-work').isDisabled(), false);
    // Screen 2 says the answer includes the work, and offers to drop it.
    assert.equal((await outdoor.evaluate(() => window.STBOutdoorPicnic.work())).length, 2);

    // Back to the plan as is: the work is dropped and only the plan is asked again.
    await outdoor.locator('#back-plan').click();
    await settle('back');
    assert.equal((await od()).section, 'build');
    assert.deepEqual(await outdoor.evaluate(() => window.STBOutdoorPicnic.work()), []);
    exact = exactOf().at(-1);
    assertOnlyThePlan(exact.payload.definition, 72, A_FRAME_FIXED, { LEG: 25, BRACE: 25 });
    assert.equal(exact.payload.definition.configurationVersion.replace(/^od-r\d+-/, ''), planVersion, 'the same plan as before the bench');
    await outdoor.locator('#to-edge').click();
    assert.equal(await outdoor.locator('#parts-bench [data-part].worked').count(), 0, 'the work was dropped');

    // Try it again, and send it with the work: your call shows the receipt of that exact request.
    await outdoor.locator('[data-part="TOP"] [data-tool="deco"]').click();
    await settle('cut again');
    exact = exactOf().at(-1);
    await outdoor.locator('#send-work').click();
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
    await outdoor.waitForSelector('#s-plans:not([hidden])', { timeout: 5000 });
    assert.equal(await base.evaluate(() => [...document.querySelectorAll('.page.on')].pop()?.id), 'outdoor-build-live');
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
    server.close();
  }
});
