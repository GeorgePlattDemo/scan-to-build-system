// Trail scoreboard: checks every Shared Home tile against the trail rules (System AGENTS.md, "Trail rules")
// using the declarations in public-build/stb-trail-contract.js.
//
// It is a ratchet. KNOWN_FAILING lists today's violations so they do not block merges.
// - A violation that is not in KNOWN_FAILING fails the test (nothing may get worse).
// - A KNOWN_FAILING entry that no longer happens also fails the test, telling you to delete it
//   (once a tile is fixed, it stays fixed).
//
// Checks per tile (no tile is excepted):
//   R1  A tile opens on Idea, which shows no numbered step, unless the contract declares it opens on Intent (opensOn);
//       then it opens on the Intent line and its Idea back control leads to the same Idea checks. From Intent on, the
//       nav reads Idea (an unnumbered back control, never current), then the six trail steps with the contract labels,
//       in order, exactly one current. Only Start your own may declare opensOn (the owner's one-time exception).
//   R2  every visible nav button lands on this tile's own pages (or Landing / Home); no other buttons. The fork options
//       a tile declares for its Idea line (contract presentationForks) are that declared exception, not extra nav.
//   R3  a step you cannot use yet is shown inert (disabled); steps 2-6 never silently do nothing
//   R8  every tile on the Shared Home is declared in the contract, and every declared tile is on the Shared Home
//   R9  no demo-account names on the tile's pages
// Live-Store rules R4-R6 (fresh Store answer, refusal past the limits, one terms flow) are checked for every
// tile against the real pinned Store in test/integration/trail-terms.test.mjs.

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

// Rule-only migration from System main 2de7ce8b0881a34e032fc3160b3d3b118eb23b79.
// Do not make these tiles pass by editing their pages in this PR. Each entry is today's R1 drift:
// the tile still exposes "Your idea" where the contract now requires Intent as step 1.
// Remove an entry only when that tile's later bounded migration puts Idea in its intake/back-control role
// and Intent at step 1. The ratchet then prevents that tile from drifting back.
// playhouse:R2 left on system/playhouse-on-shared-host: the shared tile host draws Playhouse's nav labels
// from the trail contract. playhouse:R1 left on system/playhouse-idea-intake: Playhouse opens on its Idea intake,
// and from Intent on its nav reads Idea, then the six steps.
// alcove:R2 left on system/alcove-on-shared-host, for the same reason. alcove:R1 left on system/alcove-idea-intake:
// Alcove opens on its Idea intake, and from Intent on its nav reads Idea, then the six steps.
// outdoor:R2 left on system/outdoor-on-shared-host, for the same reason. outdoor:R1 left on system/outdoor-idea-intake:
// Outdoor opens on its Idea intake, and from Intent on its nav reads Idea, then the six steps.
// start-own:R2 left on system/start-own-on-shared-host, for the same reason. start-own:R1 left on
// system/start-own-idea-intake: Start your own opens on its Idea intake, and from Intent on its nav reads Idea, then
// the six steps.
const KNOWN_FAILING = new Set([
]);

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.css': 'text/css' };
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
      current: e.getAttribute('aria-current') === 'step',
    })));
}

const NUMBERED = /^\s*\d+\s*·/;
const IDEA = contract.idea.label;
// The fork options a tile declares for its Idea line. On Idea they are the declared exception, not extra nav.
const forkOptions = tile => new Set(contract.presentationForks
  .filter(f => f.tileId === tile.id && f.line === IDEA)
  .flatMap(f => [...f.options]));

// From Idea to Intent: the Idea line's own control for step 1 (a declared fork option, or an unnumbered button).
async function toIntent(frame, page, nav, tileSteps, forks) {
  const way = nav.find(b => !NUMBERED.test(b.label) && b.label === tileSteps[0] && (forks.has(b.label) || !b.go));
  if (!way) return false;
  await frame.locator('.recovery-nav button:visible', { hasText: way.label }).first().click();
  await page.waitForTimeout(1000);
  return true;
}

// From Intent to Idea: the Intent line's unnumbered Idea back control.
async function toIdea(frame, page, nav) {
  const way = nav.find(b => b.label === IDEA && !NUMBERED.test(b.label) && !b.current);
  if (!way) return false;
  await frame.locator('.recovery-nav button:visible', { hasText: way.label }).first().click();
  await page.waitForTimeout(1000);
  return true;
}

// The steps a tile opens on: Intent when the contract declares opensOn for it, otherwise Idea.
const opensOnIntent = tile => tile.opensOn?.step === (tile.steps || contract.steps)[0];
const OPENS_ON_INTENT = ['start-own'];

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

    // The open-on-Intent exception is the owner's, for Start your own only. Any other tile declaring it fails.
    assert.deepEqual([...contract.tiles.filter(t => t.opensOn).map(t => t.id)], OPENS_ON_INTENT, 'only Start your own may open on Intent');
    for (const t of contract.tiles.filter(t => t.opensOn)) {
      assert.equal(opensOnIntent(t), true, `${t.id}: opensOn names step 1 of its trail`);
      assert.ok(typeof t.opensOn.owner === 'string' && t.opensOn.owner.length > 0, `${t.id}: opensOn names its owner`);
    }

    for (const tile of contract.tiles) {
      if (tile.exception) continue;
      const allowed = new Set([...tile.pages, ...contract.sharedPages]);
      const tileSteps = tile.steps || contract.steps;

      let { page, frame } = await enterTile(browser, origin, tile);
      const entry = await activePage(frame);
      if (!tile.pages.includes(entry)) add(tile.id, 'R2', `entering the tile lands on "${entry}", not one of its pages`);
      if (ACCOUNT_NAMES.test(await pageText(page))) add(tile.id, 'R9', `account name on entry page "${entry}"`);

      const forks = forkOptions(tile);
      const want = [IDEA, ...tileSteps.map((st, i) => `${i + 1} · ${st}`)];
      // R1 from Intent on: Idea (never current), then the six steps in order, exactly one current: step 1 here.
      const checkIntentLine = intentNav => {
        const got = intentNav.filter(b => !contract.sharedPages.includes(b.go)).map(b => b.label.replace(/\s+/g, ' '));
        if (JSON.stringify(got) !== JSON.stringify(want)) add(tile.id, 'R1', `from Intent the nav is [${intentNav.map(b => b.label).join(' | ')}]`);
        const current = intentNav.filter(b => b.current).map(b => b.label);
        if (current.length !== 1 || current[0] !== want[1]) add(tile.id, 'R1', `on Intent the current step is [${current.join(' | ')}]`);
        for (const b of intentNav) {
          if (forks.has(b.label) && !NUMBERED.test(b.label)) add(tile.id, 'R2', `fork option "${b.label}" off the Idea line`);
          const isStep = NUMBERED.test(b.label) && tileSteps.includes(stripNumber(b.label));
          if (!isStep && b.label !== IDEA && !contract.sharedPages.includes(b.go)) add(tile.id, 'R2', `extra nav button "${b.label}" from Intent → ${b.go}`);
        }
      };
      // R1 on Idea: the intake, not a step. No numbered step shows and none is current.
      const checkIdeaLine = ideaNav => {
        const ok = !ideaNav.some(b => NUMBERED.test(b.label) || b.current);
        if (!ok) add(tile.id, 'R1', `Idea shows numbered steps: nav is [${ideaNav.map(b => b.label).join(' | ')}]`);
        for (const b of ideaNav) {
          const isStep = tileSteps.includes(stripNumber(b.label));
          if (!isStep && !forks.has(b.label) && !contract.sharedPages.includes(b.go)) add(tile.id, 'R2', `extra nav button "${b.label}" → ${b.go}`);
        }
        return ok;
      };

      const onIntentFirst = opensOnIntent(tile);
      let nav = [];
      let intentNav = [];
      if (onIntentFirst) {
        // Declared exception: the tile opens on Intent. Idea is one back control away and passes the same Idea checks.
        intentNav = await visibleNav(frame);
        checkIntentLine(intentNav);
        if (!await toIdea(frame, page, intentNav)) add(tile.id, 'R1', 'Intent has no Idea back control');
        else {
          nav = await visibleNav(frame);
          if (checkIdeaLine(nav)) {
            if (!await toIntent(frame, page, nav, tileSteps, forks)) add(tile.id, 'R1', 'Idea has no way to Intent');
            else {
              const back = (await visibleNav(frame)).filter(b => b.current).map(b => b.label);
              if (back.length !== 1 || back[0] !== want[1]) add(tile.id, 'R1', `Idea's way on lands on [${back.join(' | ')}], not Intent`);
            }
          }
        }
      } else {
        nav = await visibleNav(frame);
        if (checkIdeaLine(nav)) {
          if (!await toIntent(frame, page, nav, tileSteps, forks)) add(tile.id, 'R1', 'Idea has no way to Intent');
          else {
            intentNav = await visibleNav(frame);
            checkIntentLine(intentNav);
          }
        }
      }
      // From a fresh entry to Idea, or to Intent, whichever the tile opens on.
      const freshAtIdea = async () => {
        const at = await enterTile(browser, origin, tile);
        if (onIntentFirst) await toIdea(at.frame, at.page, await visibleNav(at.frame));
        return at;
      };
      const freshAtIntent = async () => {
        const at = await enterTile(browser, origin, tile);
        if (!onIntentFirst) await toIntent(at.frame, at.page, await visibleNav(at.frame), tileSteps, forks);
        return at;
      };
      await page.close();

      // On Idea: click each visible button from a fresh visit.
      for (const b of nav) {
        if (b.inert) continue;
        ({ page, frame } = await freshAtIdea());
        const before = await fingerprint(page, frame);
        await frame.locator('.recovery-nav button:visible', { hasText: b.label }).first().click();
        await page.waitForTimeout(1000);
        const landed = await activePage(frame);
        const after = await fingerprint(page, frame);
        if (!allowed.has(landed)) add(tile.id, 'R2', `"${b.label}" crosses to "${landed}"`);
        const stepIndex = tileSteps.indexOf(stripNumber(b.label));
        if (stepIndex >= 1 && before === after) add(tile.id, 'R3', `"${b.label}" does nothing and is not shown inert`);
        if (allowed.has(landed) && ACCOUNT_NAMES.test(await pageText(page))) add(tile.id, 'R9', `account name on "${landed}"`);
        await page.close();
      }

      // From Intent: every enabled nav button opens this tile's own page; steps 2-6 never silently do nothing.
      for (const b of intentNav) {
        if (b.inert) continue;
        ({ page, frame } = await freshAtIntent());
        const before = await fingerprint(page, frame);
        await frame.locator('.recovery-nav button:visible', { hasText: b.label }).first().click();
        await page.waitForTimeout(1000);
        const landed = await activePage(frame);
        const after = await fingerprint(page, frame);
        if (!allowed.has(landed)) add(tile.id, 'R2', `"${b.label}" from Intent crosses to "${landed}"`);
        const stepIndex = NUMBERED.test(b.label) ? tileSteps.indexOf(stripNumber(b.label)) : -1;
        if ((stepIndex >= 1 || b.label === IDEA) && before === after) add(tile.id, 'R3', `"${b.label}" from Intent does nothing and is not shown inert`);
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
