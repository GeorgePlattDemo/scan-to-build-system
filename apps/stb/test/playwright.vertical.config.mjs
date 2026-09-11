import { fileURLToPath } from 'node:url';
import { defineConfig } from '@playwright/test';

import { FIXED_ORIGIN } from '../shared/contracts.mjs';

if (!process.env.STB_STORE_ZERO_ROOT) {
  throw new Error(
    'STB_STORE_ZERO_ROOT is required for test:vertical. Refusing to skip the pinned Store.',
  );
}

export default defineConfig({
  testDir: './vertical',
  testMatch: '*.spec.mjs',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  timeout: 120_000,
  expect: { timeout: 20_000 },
  use: {
    baseURL: FIXED_ORIGIN,
    headless: true,
    trace: 'off',
    video: 'off',
  },
  webServer: {
    command: 'node server/main.mjs',
    url: FIXED_ORIGIN,
    reuseExistingServer: false,
    timeout: 20_000,
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    env: { ...process.env },
  },
});
