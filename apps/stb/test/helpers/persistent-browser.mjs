import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { chromium } from '@playwright/test';

export function makeProfileDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'stb-b0c-profile-'));
}

export function removeProfileDir(userDataDir) {
  fs.rmSync(userDataDir, { recursive: true, force: true });
}

export async function launchPersistentProfile(userDataDir) {
  return chromium.launchPersistentContext(userDataDir, {
    headless: true,
  });
}
