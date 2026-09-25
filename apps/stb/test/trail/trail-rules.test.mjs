// Trail scoreboard: checks every Shared Home tile against the trail rules (System AGENTS.md, "Trail rules")
// using the declarations in public-build/stb-trail-contract.js.
//
// It is a ratchet. KNOWN_FAILING lists today's violations so they do not block merges.
// - A violation that is not in KNOWN_FAILING fails the test (nothing may get worse).
// - A KNOWN_FAILING entry that no longer happens also fails the test, telling you to delete it
//   (once a tile is fixed, it stays fixed).
//
// Checks per tile (the one declared exception, Window Seat, is skipped):
//   R1  the top nav shows the six trail steps, with the contract labels, in order
//   R2  every visible nav button lands on this tile's own pages (or Landing / Home); no other buttons
//   R3  a step you cannot use yet is shown inert (disabled); steps 2-6 never silently do nothing
//   R8  every tile on the Shared Home is declared in the contract, and every declared tile is on the Shared Home
//   R9  no demo-account names on the tile's pages
// Live-Store rules (R4-R6: fresh Store answer, refusal past the limits, one terms flow) are the next scoreboard.

import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const ROOT = fileURLToPath(new URL('../../public-build/', import.meta.url));
const contractSource = fs.readFileSync(path.join(ROOT, 'stb-trail-contract.js'), 'utf8');
const sandbox = {};
vm.runInNewContext(contractSource, sandbox, { filename: 'stb-trail-contract.js' });
const contract = sandbox.STBTrailContract;

const KNOWN_FAILING = new Set([
  // start-own: owns its six steps, but steps 2-6 neither move nor show as inert from a fresh start.
  'start-own:R3',
  // outdoor: old nav labels; Store Answer/Accept/Yard/Record jump into Job 1's proof pages; extra "Bring what you have".
  'outdoor:R1', 'outdoor:R2',
  // playhouse: old 12-button nav; extra "Bring what you have"; "Sarah" on its pages.
  'playhouse:R1', 'playhouse:R2', 'playhouse:R9',
]);

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

const stripNumber = label => label.replace(/^\s*\d+\s*·\s*/, '').replace(/\s+/g, ' ').trim();
const ACCOUNT_NAMES = /\b(Sarah|Tom|Dick|Harry)\b/;

async function baseFrame(page) {
  for (let i = 0; i < 40; i++) {
    const frame = page.frames().find(f => f.url().includes('system-build-base-8d8a9dd.html'));
    if (frame && await frame.$('#landing')) return frame;
    await page.waitForTimeout(150);
  }
  throw new Error('base frame not found');
}

async function activePage(frame) {
  return frame.evaluate(() => {
    const pages = [...document.querySelectorAll('.page.on')];
    const page = pages[pages.length - 1];
    return page ? page.id : '';
  });
}

async function fingerprint(page, frame) {
  const parts = [await activePage(frame)];
  for (const f of page.frames()) {
    parts.push(await f.evaluate(() => {
      const on = document.querySelector('.page.on, main, body');
      return (on ? on.innerText : '').slice(0, 4000) + '|' + Math.round(window.scrollY);
    }).catch(() => ''));
  }
  return parts.join('\n');
}

async function visibleNav(frame) {
  return frame.$$eval('.recovery-nav button', els => els
    .filter(e => !e.hidden && e.offsetParent !== null)
    .map(e => ({
      label: e.innerText.trim(),
      go: e.getAttribute('data-go') || e.getAttribute('data-canonical-go') || '',
      inert: e.disabled || e.getAttribute('aria-disabled') === 'true',
    })));
}

async function pageText(page) {
  const texts = [];
  for (const f of page.frames()) {
    texts.push(await f.evaluate(() => {
      const on = [...document.querySelectorAll('.page.on')].pop();
      return on ? on.innerText : (document.body ? document.body.innerText : '');
    }).catch(() => ''));
  }
  return texts.join('\n');
}

async function enterTile(browser, origin, tile) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  await page.goto(origin + '/system-build-current.html', { waitUntil: 'load' });
  const frame = await baseFrame(page);
  await frame.locator('#landing button', { hasText: 'NEW USER' }).first().click();
  await frame.locator('#new-user [data-door-forward]').click();
  await page.waitForTimeout(400);
  await frame.locator('#projects .tile', { hasText: tile.tileLabel }).first().click();
  await page.waitForTimeout(1200);
  return { page, frame };
}

test('trail scoreboard: every tile against the trail rules', { timeout: 600000 }, async () => {
  const server = await serve();
  const origin = `http://127.0.0.1:${server.address().port}`;
  // CI installs Playwright's own Chromium; STB_CHROMIUM_PATH lets a local run point at another build.
  const browser = await chromium.launch(process.env.STB_CHROMIUM_PATH ? { executablePath: process.env.STB_CHROMIUM_PATH } : {});
  const violations = new Map();
  const add = (tile, rule, detail) => {
    const key = `${tile}:${rule}`;
    if (!violations.has(key)) violations.set(key, []);
    violations.get(key).push(detail);
  };
  try {
    // R8: the Shared Home and the contract agree.
    {
      const page = await browser.newPage();
      await page.goto(origin + '/system-build-current.html', { waitUntil: 'load' });
      const frame = await baseFrame(page);
      const tileTexts = await frame.$$eval('#projects .tile', els => els.map(e => e.innerText.replace(/\s+/g, ' ')));
      for (const text of tileTexts) {
        if (!contract.tiles.some(t => text.includes(t.tileLabel))) add('shared-home', 'R8', `tile not declared in contract: ${text.slice(0, 60)}`);
      }
      for (const t of contract.tiles) {
        if (!tileTexts.some(text => text.includes(t.tileLabel))) add(t.id, 'R8', `declared tile missing from Shared Home: ${t.tileLabel}`);
      }
      await page.close();
    }

    for (const tile of contract.tiles) {
      if (tile.exception) continue;
      const allowed = new Set([...tile.pages, ...contract.sharedPages]);

      let { page, frame } = await enterTile(browser, origin, tile);
      const entry = await activePage(frame);
      if (!tile.pages.includes(entry)) add(tile.id, 'R2', `entering the tile lands on "${entry}", not one of its pages`);
      if (ACCOUNT_NAMES.test(await pageText(page))) add(tile.id, 'R9', `account name on entry page "${entry}"`);

      const nav = await visibleNav(frame);
      const steps = nav.filter(b => contract.steps.includes(stripNumber(b.label)));
      const stepLabels = steps.map(b => stripNumber(b.label));
      if (JSON.stringify(stepLabels) !== JSON.stringify([...contract.steps])) {
        add(tile.id, 'R1', `nav steps are [${nav.map(b => b.label).join(' | ')}]`);
      }
      for (const b of nav) {
        const isStep = contract.steps.includes(stripNumber(b.label));
        if (!isStep && !contract.sharedPages.includes(b.go)) add(tile.id, 'R2', `extra nav button "${b.label}" → ${b.go}`);
      }
      await page.close();

      // Click each visible button from a fresh entry.
      for (const b of nav) {
        if (b.inert) continue;
        ({ page, frame } = await enterTile(browser, origin, tile));
        const before = await fingerprint(page, frame);
        await frame.locator('.recovery-nav button:visible', { hasText: b.label }).first().click();
        await page.waitForTimeout(1000);
        const landed = await activePage(frame);
        const after = await fingerprint(page, frame);
        if (!allowed.has(landed)) add(tile.id, 'R2', `"${b.label}" crosses to "${landed}"`);
        const stepIndex = contract.steps.indexOf(stripNumber(b.label));
        if (stepIndex >= 1 && before === after) add(tile.id, 'R3', `"${b.label}" does nothing and is not shown inert`);
        if (allowed.has(landed) && ACCOUNT_NAMES.test(await pageText(page))) add(tile.id, 'R9', `account name on "${landed}"`);
        await page.close();
      }
    }
  } finally {
    await browser.close();
    server.close();
  }

  const found = new Set(violations.keys());
  const lines = ['', 'TRAIL SCOREBOARD (' + contract.version + ')'];
  for (const tile of contract.tiles) {
    if (tile.exception) { lines.push(`  ${tile.id.padEnd(12)} EXCEPTION: ${tile.exception}`); continue; }
    const keys = [...found].filter(k => k.startsWith(tile.id + ':')).sort();
    lines.push(`  ${tile.id.padEnd(12)} ${keys.length ? 'FAILS ' + keys.map(k => k.split(':')[1]).join(' ') : 'PASSES all trail rules'}`);
    for (const k of keys) for (const d of violations.get(k)) lines.push(`      ${k.split(':')[1]}  ${d}`);
  }
  for (const k of [...found].filter(k => k.startsWith('shared-home:'))) for (const d of violations.get(k)) lines.push(`  shared-home  R8  ${d}`);
  console.log(lines.join('\n'));

  const unexpected = [...found].filter(k => !KNOWN_FAILING.has(k));
  const fixed = [...KNOWN_FAILING].filter(k => !found.has(k));
  assert.deepEqual(unexpected, [], `New trail-rule violations (not allowed to get worse): ${unexpected.join(', ')}`);
  assert.deepEqual(fixed, [], `These now pass. Remove them from KNOWN_FAILING so they stay fixed: ${fixed.join(', ')}`);
});
