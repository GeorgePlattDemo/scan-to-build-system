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
// One Store request per version: settle, then find the single request sent for the version now on screen.
async function answered(page, log, from = 0) {
  await settled(page);
  const v = await page.evaluate(() => window.STBWindowSeat.request().configurationVersion);
  const hits = log.slice(from).filter(l => l.request.payload.definition.configurationVersion === v);
  assert.equal(hits.length, 1, 'one Store request for version ' + v);
  return hits[0];
}
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

    // Arriving at the bench asks the Store for pine by itself. No ask button on the bench.
    const n0 = log.length;
    await page.locator('#s-intent [data-to="bench"]').click();
    const first = await answered(page, log);
    assert.equal(log.length - n0, 1, 'arriving at the bench asks the Store once');
    assert.ok(first.request.payload.definition.cutPackages.every(p => p.material.species === 'pine'), 'pine, already selected');
    assert.equal(await page.locator('#bench-money button, #s-configure [data-ask]').count(), 0, 'no ask button on the bench');
    await page.locator('#btn-ask').click();
    assert.equal(log.length - n0, 1, 'going on to the Store page sends no duplicate');
    const trailSent = first.request.payload.definition;
    const trailHash = first.answer.calculationIdentity.resultHash;
    assert.equal(first.answer.rawEvaluation.status, 'SUPPORTABLE');
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
    const fromB = log.length; // the long scroll is a fresh page: its requests are counted from here
    const b = await open(browser, origin);
    page = b.page;
    await page.locator('[data-view-btn="whole"]').click();
    assert.equal(await page.evaluate(() => [...document.querySelectorAll('.step')].filter(s => s.offsetParent).length), 8, 'seven pages and the audit copy, one scroll');
    await page.locator('#btn-ask').click();
    const w1 = await answered(page, log, fromB);
    assert.deepEqual(w1.request.payload.definition, trailSent, 'both routes send the same definition');
    assert.equal(w1.answer.calculationIdentity.resultHash, trailHash, 'and get the same Store calculation');
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
    await page.locator('#btn-ask').click();
    const r2 = await answered(page, log, fromB);
    assert.match(r2.request.payload.definition.configurationVersion, /^ws-r2-/);
    assert.notEqual(r2.answer.rawEvaluation.status, 'SUPPORTABLE');
    assert.match(JSON.stringify(r2.answer.rawEvaluation.packages.map(p => p.reasonCodes)), /EDGE_MILL_REMOVAL_EXCEEDS_D001_MAX_CUT_WIDTH/);
    assert.match(await page.locator('#store-panel').innerText(), /No complete budgetary estimate/);
    s = await seat(page);
    assert.equal(s.terms.stage, 'REFUSED_BY_STORE', 'the refusal is the result');
    assert.equal(await page.locator('[data-nav="request"]').isDisabled(), true, 'steps 4–6 stay inert past the envelope');
    // Turn the knob, not the rule: three boards across, and the Store answers again.
    await page.locator('#c-runs [data-n="3"]').click();
    await page.locator('#btn-ask').click();
    await answered(page, log, fromB);
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
    await page.locator('#btn-ask').click();
    const r3 = await answered(page, log, fromB);
    assert.deepEqual(r3.request.payload.definition.itemLines, [screws], 'the requirement is on the wire');
    assert.equal(r3.answer.rawEvaluation.status, 'SUPPORTABLE');
    const screwAnswer = r3.answer.rawEvaluation.items.find(i => i.lineId === 'SCREWS');
    assert.equal(screwAnswer.status, 'SUPPORTABLE');
    assert.ok(typeof screwAnswer.storeSku === 'string' && screwAnswer.storeSku.length > 0, 'the Store names its own item');
    assert.equal(SOURCE.includes(screwAnswer.storeSku), false, 'the page never names that item');
    assert.match(await page.locator('#audit-text').innerText(), /Hardware requirement: 60 × #10 wood screw, 2 1\/2 in, coated \(sent as a requirement/);
    assert.doesNotMatch(await page.locator('#audit-text').innerText(), /Wood screws[^\n]*KEPT · NOT SENT|wood screw[^\n]*kept, not sent/);

    // #8 stays selectable. The pinned Store stocks no #8 wood screw, so the refusal is the Store's, with its reason.
    await page.locator('#sc-gauge').selectOption('#8');
    assert.equal((await page.evaluate(() => window.STBWindowSeat.conditions())).some(c => c.block), false, 'the page does not pre-judge the gauge');
    await page.locator('#btn-ask').click();
    const r4 = await answered(page, log, fromB);
    assert.equal(r4.request.payload.definition.itemLines[0].requirement.gauge, '#8');
    const refused = r4.answer.rawEvaluation.items.find(i => i.lineId === 'SCREWS');
    assert.equal(refused.status, 'REFUSED');
    assert.deepEqual(refused.reasonCodes, ['NO_MATCHING_HARDWARE_OFFERING']);
    assert.equal(refused.storeSku ?? null, null);

    // Wood is Alcove's material block, on the bench, pine already selected, directly beneath the bench's one price.
    // Changing it is a new version: the bench asks the Store again by itself (no ask button) and the Store's new
    // price replaces the old one. The page computes no price; a wood the pinned Store can't supply comes back as the
    // Store's refusal. The Store-answer page shows the answer and holds no wood control.
    await page.locator('#sc-gauge').selectOption('#10');
    // Back to the standard job: 14 in deep, boards across by the rule (1×8s edge-milled to 7 in).
    await page.locator('#c-d').evaluate(e => { e.value = '14'; e.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.locator('#c-runs [data-n="derived"]').click();
    const pine = await answered(page, log, fromB);
    assert.equal(pine.answer.rawEvaluation.status, 'SUPPORTABLE');
    assert.ok(pine.request.payload.definition.cutPackages.every(p => p.material.species === 'pine'), 'pine to start');
    const pineQ = pine.answer.rawEvaluation.totals.sumOfSupportableLines;
    assert.equal(await page.locator('#species').count(), 1, 'one wood control');
    assert.equal(await page.locator('#s-configure #species').count(), 1, 'on the bench');
    assert.equal(await page.locator('#s-store #species, #store-wood').count(), 0, 'not on the Store-answer page');
    assert.equal(await page.evaluate(() => document.getElementById('bench-money-box').nextElementSibling.querySelector('#species') !== null), true, 'the wood sits directly beneath the price');
    assert.equal(await page.locator('#species .swatch.on').getAttribute('data-material'), 'pine');
    const pinePrice = await page.locator('#bench-money .big').innerText();
    const askWood = async k => {
      const n = log.length;
      await page.locator('#species [data-material="' + k + '"]').click();
      await until(async () => log.length > n, 'Store asked for ' + k);
      const hit = await answered(page, log, fromB);
      assert.equal(log.length - n, 1, 'one Store request for ' + k + ', asked by the bench itself');
      assert.equal((await seat(page)).current, true, 'the answer on screen is for ' + k);
      assert.equal(await page.locator('#bench-money button').count(), 0, 'no ask button');
      assert.equal(await page.locator('#species .swatch.on').getAttribute('data-material'), k);
      return hit;
    };
    const poplar = await askWood('poplar');
    assert.ok(poplar.request.payload.definition.cutPackages.every(p => p.material.species === 'poplar'), 'the species fact is on the definition');
    assert.notEqual(poplar.request.payload.definition.configurationVersion, pine.request.payload.definition.configurationVersion, 'a new version');
    assert.equal(poplar.answer.rawEvaluation.status, 'SUPPORTABLE');
    assert.notEqual(poplar.answer.rawEvaluation.totals.sumOfSupportableLines, pineQ, 'the Store repriced');
    assert.notEqual(await page.locator('#bench-money .big').innerText(), pinePrice, 'the new price replaces the old one');
    assert.equal(await page.locator('#bench-money .big').count(), 1, 'one price');
    const cherry = await askWood('cherry');
    assert.ok(cherry.request.payload.definition.cutPackages.every(p => p.material.species === 'cherry'));
    assert.equal((await page.evaluate(() => window.STBWindowSeat.conditions())).some(c => c.block), false, 'the page does not pre-judge the wood');
    assert.notEqual(cherry.answer.rawEvaluation.status, 'SUPPORTABLE', 'the pinned Store stocks no cherry this wide');
    const cherryCodes = [...new Set(cherry.answer.rawEvaluation.packages.filter(p => p.status !== 'SUPPORTABLE').flatMap(p => p.reasonCodes))];
    assert.ok(cherryCodes.length > 0, 'the refusal carries the Store\'s reasons');
    assert.match(await page.locator('#bench-money').innerText(), /No complete budgetary estimate/);
    const backToPine = await askWood('pine');
    assert.equal(backToPine.answer.rawEvaluation.totals.sumOfSupportableLines, pineQ, 'pine prices as pine again');
    assert.equal(await page.locator('#bench-money .big').innerText(), pinePrice);
    assert.deepEqual(b.errors, []);
  } finally {
    await browser.close();
    server.close();
  }
});
