// Window Seat 0.9, one journey, two routes, against the real pinned Store (no scripted answers).
// - Page 1 is the want, kept behind the trail (no nav step current); the pills are the fork; page 2, Intent, is
//   step 1 and makes the knobs; the bench only turns them.
// - The regular path and the one long scroll are one state: the same definition, one Store request each,
//   the same Store identity, and the same audit copy.
// - The page holds no Store logic: no SKU, price, time, capability or envelope. A refusal is the result, and a
//   partial answer is never shown as a complete budgetary estimate.
// - A changed definition is a new version and needs a fresh Store answer.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from '@playwright/test';

import { createStoreAdapter } from '../../server/store-adapter.mjs';
import { requireCleanPinnedStore } from '../store/helpers.mjs';
import { serve } from './helpers.mjs';

const FILE = 'stb-window-seat-0.9.html';
const SOURCE = fs.readFileSync(new URL('../../public-build/' + FILE, import.meta.url), 'utf8');
const launch = () => chromium.launch(process.env.STB_CHROMIUM_PATH ? { executablePath: process.env.STB_CHROMIUM_PATH } : {});

async function until(fn, label, ms = 20000) {
  const start = Date.now();
  while (Date.now() - start < ms) { if (await fn()) return; await new Promise(r => setTimeout(r, 120)); }
  throw new Error('timed out: ' + label);
}
const seat = page => page.evaluate(() => window.STBWindowSeat.state());
const settled = page => until(async () => { const s = await seat(page); return !s.asking && (s.answered || s.error); }, 'Store answer');
async function open(browser, origin) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(origin + '/' + FILE, { waitUntil: 'load' });
  return { page, errors };
}
// Run-specific lines (request ids, times, event hashes) differ between two runs; the definition, the request and
// the Store's calculation must not.
const stable = text => text.split('\n').map(l => l.replace(/ORDER-[0-9A-F]+/g, 'ORDER-…'))
  .filter(l => !/receipt hash|Store pin .* request|^\s+(sent|arrived|answered|offered|decision|paid|queued|allocated|released|cut|staged|ready|custody) · /.test(l)).join('\n');

test('Window Seat 0.9 holds no Store logic and no demo-account names', () => {
  const script = SOURCE.slice(SOURCE.indexOf('<script>\n'));
  assert.doesNotMatch(script, /STB-ZERO-/, 'no Store SKU in the page');
  assert.doesNotMatch(script, /sellingPrice\s*\*|EDGE_MILL_MAX_IN|MAX_CUT_IN\b|onHand|list_reference/, 'no Store price, capability or stock logic');
  assert.doesNotMatch(SOURCE, /User 1/, 'the guest is the user');
  assert.match(SOURCE, /store-zero-canonical-doctrine\.js\?v=/);
  assert.match(SOURCE, /function renderStoreDoctrine/);
  assert.equal(SOURCE.includes('Store Zero is a declared reference lumberyard.'), false, 'the Store Zero text is shared, not copied');
});

test('Window Seat 0.9: two routes, one state, one live-Store answer', { timeout: 240000 }, async () => {
  await requireCleanPinnedStore();
  const adapter = await createStoreAdapter();
  const log = [];
  const server = await serve(adapter, log);
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await launch();
  try {
    // ── The regular path ──
    const a = await open(browser, origin);
    let page = a.page;
    // Page 1 is the want, behind the trail: the fork is the pills, and no nav step is current here.
    assert.deepEqual(await page.evaluate(() => [...document.querySelectorAll('.step')].filter(s => s.offsetParent).map(s => s.id)), ['s-hero']);
    assert.equal(await page.locator('[data-view-btn="trail"]').count(), 1);
    assert.equal(await page.locator('[data-view-btn="whole"]').count(), 1);
    assert.equal(await page.locator('[data-nav="scan"]').getAttribute('class'), 'pill', 'page 1 is not a trail step');
    assert.equal(await page.locator('[data-nav="request"]').isDisabled(), true, 'your call is inert before an answer');
    await page.locator('#s-hero [data-to="intent"]').click();
    assert.equal((await seat(page)).section, 'intent');
    assert.equal(await page.locator('[data-nav="scan"]').getAttribute('class'), 'pill on', 'step 1, Intent, starts on the intent page');

    // Intent makes the knobs; the bench shows exactly those, and has no way to add one.
    const knobs = await page.evaluate(() => window.STBWindowSeat.knobs());
    assert.deepEqual((await page.evaluate(() => window.STBWindowSeat.benchKnobs())).sort(), [...knobs].sort());
    assert.equal(await page.locator('#s-configure [data-add]').count(), 0, 'no knob is added on the bench');
    await page.locator('#add-knobs [data-add="spots"]').check();
    const withSpots = await page.evaluate(() => window.STBWindowSeat.knobs());
    assert.deepEqual(withSpots.filter(k => !knobs.includes(k)), ['SPOTS']);
    assert.deepEqual((await page.evaluate(() => window.STBWindowSeat.benchKnobs())).sort(), [...withSpots].sort());
    // A knob added by hand brings its required facts empty: no hidden default, so the Store is not asked yet.
    assert.ok((await page.evaluate(() => window.STBWindowSeat.conditions())).some(c => c.block && /placement/.test(c.t)));
    await page.locator('#add-knobs [data-add="spots"]').uncheck();
    assert.deepEqual(await page.evaluate(() => window.STBWindowSeat.knobs()), knobs);

    await page.locator('#s-intent [data-to="bench"]').click();
    const n0 = log.length;
    await page.locator('#btn-ask').click();
    await settled(page);
    assert.equal(log.length - n0, 1, 'one Store request for one version');
    const trailSent = log[n0].request.payload.definition;
    const trailHash = log[n0].answer.calculationIdentity.resultHash;
    assert.equal(log[n0].answer.rawEvaluation.status, 'SUPPORTABLE');
    assert.ok(trailSent.cutPackages.every(p => p.finishedWidthIn === 7 && p.material.nominalW === 8), '14 in over 2 boards: 1×8s edge-milled to 7 in');
    assert.match(await page.locator('#store-panel').innerText(), /STORE BUDGETARY ANSWER/);
    assert.match(await page.locator('#store-panel').innerText(), /Complete budgetary estimate/);
    assert.equal(await page.locator('#store-doctrine .s').count(), 12);
    await page.locator('#btn-call').click();
    await page.locator('#call-terms [data-terms-action="accept"]').click();
    await until(async () => (await seat(page)).terms.stage === 'QUEUED', 'queued');
    await page.locator('#yard-terms [data-terms-action="yard"]').click();
    await until(async () => (await seat(page)).terms.stage === 'READY', 'ready');
    await page.locator('#record-terms [data-terms-action="pickup"]').click();
    await until(async () => (await seat(page)).terms.stage === 'HANDED_OFF', 'custody');
    assert.equal(await page.evaluate(s => window.STBTermsFlow.verify(s), (await seat(page)).terms), true, 'hash-linked terms chain');
    const trailAudit = await page.evaluate(() => window.STBWindowSeat.auditText());
    // Switching route keeps the one state.
    await page.locator('[data-view-btn="whole"]').click();
    assert.equal((await seat(page)).terms.stage, 'HANDED_OFF');
    assert.equal(await page.locator('#s-audit').isVisible(), true, 'the audit copy is in the long scroll');
    assert.equal(await page.locator('#audit-text').innerText(), await page.evaluate(() => window.STBWindowSeat.auditText()));
    assert.deepEqual(a.errors, []);

    // ── One long scroll ──
    const b = await open(browser, origin);
    page = b.page;
    await page.locator('[data-view-btn="whole"]').click();
    assert.equal(await page.evaluate(() => [...document.querySelectorAll('.step')].filter(s => s.offsetParent).length), 8, 'seven pages and the audit copy, one scroll');
    const n1 = log.length;
    await page.locator('#btn-ask').click();
    await settled(page);
    assert.equal(log.length - n1, 1, 'one Store request for one version');
    assert.deepEqual(log[n1].request.payload.definition, trailSent, 'both routes send the same definition');
    assert.equal(log[n1].answer.calculationIdentity.resultHash, trailHash, 'and get the same Store calculation');
    await page.locator('#call-terms [data-terms-action="accept"]').click();
    await until(async () => (await seat(page)).terms.stage === 'QUEUED', 'queued (scroll)');
    await page.locator('#yard-terms [data-terms-action="yard"]').click();
    await until(async () => (await seat(page)).terms.stage === 'READY', 'ready (scroll)');
    await page.locator('#record-terms [data-terms-action="pickup"]').click();
    await until(async () => (await seat(page)).terms.stage === 'HANDED_OFF', 'custody (scroll)');
    const wholeAudit = await page.locator('#audit-text').innerText();
    assert.equal(stable(wholeAudit), stable(trailAudit), 'the same audit copy from either route');
    for (const label of ['SENT      payload digest', 'ARRIVED   receipt hash', 'ANSWERED  result hash', 'Store pin', trailHash, '"configurationVersion"'])
      assert.ok(wholeAudit.includes(label), 'audit copy carries ' + label);
    assert.deepEqual(b.errors, []);

    // A changed definition is a new version: the old answer is history, and the Store is asked again.
    await page.locator('#c-d').evaluate(e => { e.value = '15'; e.dispatchEvent(new Event('input', { bubbles: true })); });
    let s = await seat(page);
    assert.equal(s.current, false);
    assert.equal(s.rev, 2);
    assert.equal(s.terms.stage, 'NO_ANSWER', 'downstream steps close for the changed version');
    assert.equal(await page.locator('[data-nav="yard"]').isDisabled(), true);
    // 15 in over 2 boards means 7½ in from a 1×10. Whether the edge mill takes 1¾ in is the Store's call, not ours.
    assert.equal((await page.evaluate(() => window.STBWindowSeat.conditions())).some(c => c.block), false, 'the page does not pre-judge the mill');
    const n2 = log.length;
    await page.locator('#btn-ask').click();
    await settled(page);
    assert.equal(log.length - n2, 1);
    assert.match(log[n2].request.payload.definition.configurationVersion, /^ws-r2-/);
    assert.notEqual(log[n2].answer.rawEvaluation.status, 'SUPPORTABLE');
    assert.match(JSON.stringify(log[n2].answer.rawEvaluation.packages.map(p => p.reasonCodes)), /EDGE_MILL_REMOVAL_EXCEEDS_D001_MAX_CUT_WIDTH/);
    assert.match(await page.locator('#store-panel').innerText(), /No complete budgetary estimate/);
    s = await seat(page);
    assert.equal(s.terms.stage, 'REFUSED_BY_STORE', 'the refusal is the result');
    assert.equal(await page.locator('[data-nav="request"]').isDisabled(), true, 'steps 4–6 stay inert past the envelope');
    // Turn the knob, not the rule: three boards across, and the Store answers again.
    await page.locator('#c-runs [data-n="3"]').click();
    await page.locator('#btn-ask').click();
    await settled(page);
    assert.equal((await seat(page)).terms.stage, 'ANSWERED');

    // Hardware is a requirement, stated at intent: gauge, length, finish and count. The page sends the requirement,
    // never a Store item number; the Store picks its own item or refuses. A missing field blocks the ask.
    await page.locator('#add-knobs [data-add="screws"]').check();
    assert.ok((await page.evaluate(() => window.STBWindowSeat.conditions())).some(c => c.block && /screws/.test(c.t)), 'incomplete screws block the ask');
    assert.equal((await page.evaluate(() => window.STBWindowSeat.request())).itemLines, undefined, 'an incomplete requirement is not sent');
    await page.locator('#sc-gauge').selectOption('#10');
    await page.locator('#sc-len').fill('2.5');
    await page.locator('#sc-finish').selectOption('coated');
    await page.locator('#sc-qty').fill('60');
    assert.equal((await page.evaluate(() => window.STBWindowSeat.conditions())).some(c => c.block), false);
    const screws = { lineId: 'SCREWS', qty: 60, requirement: { kind: 'wood-screw', gauge: '#10', lengthIn: 2.5, finish: 'coated', unit: 'piece' } };
    assert.deepEqual((await page.evaluate(() => window.STBWindowSeat.request())).itemLines, [screws], 'the requirement, not an item number');
    assert.match(await page.locator('#ws-reg').innerText(), /Wood screws[^\n]*sent as a requirement[\s\S]*?SENT/);
    assert.doesNotMatch(await page.locator('#ws-reg').innerText(), /Wood screws[^\n]*\n?KEPT · NOT SENT/);
    const n3 = log.length;
    await page.locator('#btn-ask').click();
    await settled(page);
    assert.deepEqual(log[n3].request.payload.definition.itemLines, [screws], 'the requirement is on the wire');
    assert.equal(log[n3].answer.rawEvaluation.status, 'SUPPORTABLE');
    const screwAnswer = log[n3].answer.rawEvaluation.items.find(i => i.lineId === 'SCREWS');
    assert.equal(screwAnswer.status, 'SUPPORTABLE');
    assert.ok(typeof screwAnswer.storeSku === 'string' && screwAnswer.storeSku.length > 0, 'the Store names its own item');
    assert.equal(SOURCE.includes(screwAnswer.storeSku), false, 'the page never names that item');
    assert.match(await page.locator('#audit-text').innerText(), /Hardware requirement: 60 × #10 wood screw, 2 1\/2 in, coated \(sent as a requirement/);
    assert.doesNotMatch(await page.locator('#audit-text').innerText(), /Wood screws[^\n]*KEPT · NOT SENT|wood screw[^\n]*kept, not sent/);

    // #8 stays selectable. The pinned Store stocks no #8 wood screw, so the refusal is the Store's, with its reason.
    await page.locator('#sc-gauge').selectOption('#8');
    assert.equal((await page.evaluate(() => window.STBWindowSeat.conditions())).some(c => c.block), false, 'the page does not pre-judge the gauge');
    const n4 = log.length;
    await page.locator('#btn-ask').click();
    await settled(page);
    assert.equal(log[n4].request.payload.definition.itemLines[0].requirement.gauge, '#8');
    const refused = log[n4].answer.rawEvaluation.items.find(i => i.lineId === 'SCREWS');
    assert.equal(refused.status, 'REFUSED');
    assert.deepEqual(refused.reasonCodes, ['NO_MATCHING_HARDWARE_OFFERING']);
    assert.equal(refused.storeSku ?? null, null);
    assert.deepEqual(b.errors, []);
  } finally {
    await browser.close();
    server.close();
  }
});
