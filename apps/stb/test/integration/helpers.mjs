// Shared browser harness for integration tests: the public build, a loopback runtime config, and every Store
// POST passed to the real System adapter over the real pinned Store evaluator. Nothing scripted.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

import { STORE_PIN } from '../../shared/contracts.mjs';
import { createStoreAdapter } from '../../server/store-adapter.mjs';
import { requireCleanPinnedStore } from '../store/helpers.mjs';

const ROOT = fileURLToPath(new URL('../../public-build/', import.meta.url));
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.css': 'text/css' };

// Serves the public build, answers stb-store-runtime.json with a loopback endpoint, and passes every Store
// POST to the real adapter. `tamper` lets one test hand the page an answer meant for someone else.
export function serve(adapter, log, tamper = null) {
  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x');
    if (url.pathname === '/stb-store-runtime.json') {
      const { port } = server.address();
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ jobEndpoint: `http://127.0.0.1:${port}/api/store-zero/job`, storePin: STORE_PIN }));
      return;
    }
    if (url.pathname === '/api/store-zero/job' && req.method === 'POST') {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
      let result = await adapter.dispatch(body);
      if (tamper) result = tamper(body, result) || result;
      log.push({ request: body, status: result.status, answer: result.body });
      res.writeHead(result.status, { 'content-type': 'application/json' });
      res.end(JSON.stringify(result.body));
      return;
    }
    const rel = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'system-build-current.html';
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

export async function baseFrame(page) {
  for (let i = 0; i < 40; i++) {
    const frame = page.frames().find(f => f.url().includes('system-build-base-8d8a9dd.html'));
    if (frame && await frame.$('#landing')) return frame;
    await page.waitForTimeout(150);
  }
  throw new Error('base frame not found');
}

export async function openPlayhouse(browser, origin) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(origin + '/system-build-current.html', { waitUntil: 'load' });
  const frame = await baseFrame(page);
  await frame.locator('#landing button', { hasText: 'NEW USER' }).first().click();
  await frame.locator('#new-user [data-door-forward]').click();
  await page.waitForTimeout(400);
  await frame.locator('#projects .tile', { hasText: 'Playhouse arched window' }).first().click();
  await page.waitForTimeout(600);
  return { page, frame, errors };
}


export async function openTile(browser, origin, tileLabel) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(origin + '/system-build-current.html', { waitUntil: 'load' });
  const frame = await baseFrame(page);
  await frame.locator('#landing button', { hasText: 'NEW USER' }).first().click();
  await frame.locator('#new-user [data-door-forward]').click();
  await page.waitForTimeout(400);
  await frame.locator('#projects .tile', { hasText: tileLabel }).first().click();
  await page.waitForTimeout(800);
  return { page, frame, errors };
}

export async function withBrowser(fn, tamper = null) {
  await requireCleanPinnedStore();
  const adapter = await createStoreAdapter();
  assert.equal(adapter.ready, true, JSON.stringify(adapter.inspection));
  const log = [];
  const server = await serve(adapter, log, tamper);
  const browser = await chromium.launch(process.env.STB_CHROMIUM_PATH ? { executablePath: process.env.STB_CHROMIUM_PATH } : {});
  try {
    await fn({ browser, origin: `http://127.0.0.1:${server.address().port}`, log, adapter });
  } finally {
    await browser.close();
    server.close();
  }
}

export { STORE_PIN };
