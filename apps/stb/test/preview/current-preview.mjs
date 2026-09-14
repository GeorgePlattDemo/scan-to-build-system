import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const APP_ROOT = fileURLToPath(new URL('../..', import.meta.url));
const ORIGIN = 'http://localhost:4317';
const OUT = process.env.STB_VISUAL_PREVIEW_OUT
  ? path.resolve(process.env.STB_VISUAL_PREVIEW_OUT)
  : path.join(APP_ROOT, 'visual-preview-output');

const sourceBranch = process.env.GITHUB_REF_NAME ?? 'local';
const sourceSha = process.env.GITHUB_SHA ?? 'local';
const generatedAt = new Date().toISOString();

async function waitForServer() {
  let lastError;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(ORIGIN);
      if (response.ok) return;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw lastError ?? new Error('Scan-to-Build preview server did not become ready');
}

async function openBegin(page) {
  await page.goto(`${ORIGIN}/`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'NEW USER' }).click();
  await page.getByRole('button', { name: 'NEXT' }).click();
  await page.locator('[data-stb-project-doors]').waitFor({ state: 'visible' });
}

async function openPicnicChooser(page) {
  await openBegin(page);
  await page.locator('[data-front-door="picnic"]').click();
  await page.locator('[data-stb-picnic-chooser]').waitFor({ state: 'visible' });
}

async function capture(page, filename) {
  await page.evaluate(() => document.fonts?.ready);
  await page.screenshot({
    path: path.join(OUT, filename),
    fullPage: true,
    animations: 'disabled',
  });
}

await mkdir(OUT, { recursive: true });

const server = spawn(process.execPath, ['server/main.mjs'], {
  cwd: APP_ROOT,
  env: { ...process.env },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let serverOutput = '';
server.stdout.on('data', (chunk) => { serverOutput += chunk.toString(); });
server.stderr.on('data', (chunk) => { serverOutput += chunk.toString(); });

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });

  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      colorScheme: 'light',
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await page.goto(`${ORIGIN}/`, { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'NEW USER' }).waitFor({ state: 'visible' });
    await capture(page, '01-landing.png');

    await page.getByRole('button', { name: 'NEW USER' }).click();
    await page.getByRole('button', { name: 'NEXT' }).click();
    await page.locator('[data-stb-project-doors]').waitFor({ state: 'visible' });
    await capture(page, '02-project-doors.png');

    await page.locator('[data-front-door="picnic"]').click();
    await page.locator('[data-stb-picnic-chooser]').waitFor({ state: 'visible' });
    await capture(page, '03-picnic-chooser.png');

    await page.locator('[data-picnic-form="attached-bench"][data-picnic-scope="frame-kit"]').click();
    const panel = page.locator('[data-project-configurator="classic-picnic-table-fixture"]');
    await panel.waitFor({ state: 'visible' });
    await panel.locator('[data-config-field="productLength"]').fill('96');
    await panel.getByRole('button', { name: 'APPLY TO CANDIDATE' }).click();
    await page.locator('[data-picnic-you-supply]').waitFor({ state: 'visible' });
    await capture(page, '04-attached-frame-kit.png');
    await context.close();
  }

  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      colorScheme: 'light',
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await openPicnicChooser(page);
    await page.locator('[data-picnic-form="separate-benches"][data-picnic-scope="frame-kit"]').click();
    const panel = page.locator('[data-project-configurator="classic-picnic-table-fixture"]');
    await panel.waitFor({ state: 'visible' });
    await panel.locator('[data-config-field="productLength"]').fill('96');
    await panel.getByRole('button', { name: 'APPLY TO CANDIDATE' }).click();
    await page.getByText('SEPARATE_BENCH_GEOMETRY_UNRESOLVED', { exact: true }).waitFor({ state: 'visible' });
    await capture(page, '05-separate-benches-unresolved.png');
    await context.close();
  }

  const previewMarkdown = `# Scan-to-Build — current visual checkpoint\n\n` +
    `**Source branch:** \`${sourceBranch}\`  \n` +
    `**Source commit:** \`${sourceSha}\`  \n` +
    `**Generated:** ${generatedAt}\n\n` +
    `This page is generated from the actual \`apps/stb\` application source. It is a visual review surface only. It does not add Store, machine, commercial, ordering, payment, reservation, or fabrication authority.\n\n` +
    `If the branch or commit above is not the work you intend to review, do not treat these screenshots as current.\n\n` +
    `## 1. Landing\n\n![Landing](01-landing.png)\n\n` +
    `## 2. Project doors\n\n![Project doors](02-project-doors.png)\n\n` +
    `## 3. Picnic family chooser\n\n![Picnic chooser](03-picnic-chooser.png)\n\n` +
    `## 4. Attached bench — frames only\n\n![Attached frame kit](04-attached-frame-kit.png)\n\n` +
    `## 5. Separate benches — retained but unresolved geometry\n\n![Separate benches unresolved](05-separate-benches-unresolved.png)\n\n` +
    `---\n\n**NO BLOOD ON WOOD.**\n`;

  await writeFile(path.join(OUT, 'README.md'), previewMarkdown, 'utf8');
  await writeFile(path.join(OUT, 'source.json'), JSON.stringify({
    sourceBranch,
    sourceSha,
    generatedAt,
    origin: ORIGIN,
  }, null, 2) + '\n', 'utf8');
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
  await new Promise((resolve) => setTimeout(resolve, 200));
  if (!server.killed) server.kill('SIGKILL');
}

if (server.exitCode && server.exitCode !== 0 && server.exitCode !== null) {
  throw new Error(`Preview server exited with ${server.exitCode}: ${serverOutput}`);
}
