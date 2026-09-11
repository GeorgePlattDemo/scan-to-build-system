import { fileURLToPath } from 'node:url';
import { defineConfig } from '@playwright/test';

import { FIXED_ORIGIN } from '../shared/contracts.mjs';

export default defineConfig({
  testDir: './browser',
  testMatch: '*.spec.mjs',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
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
