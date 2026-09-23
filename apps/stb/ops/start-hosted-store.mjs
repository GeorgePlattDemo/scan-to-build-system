import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import { STORE_PIN, STORE_REPOSITORY } from '../shared/contracts.mjs';
import { inspectStoreSource } from '../server/store-source.mjs';
import { startHostedStore } from '../server/hosted-store.mjs';

const execFileAsync = promisify(execFile);

async function run(command, args, cwd = undefined) {
  const { stdout, stderr } = await execFileAsync(command, args, {
    cwd,
    encoding: 'utf8',
    maxBuffer: 4 * 1024 * 1024,
  });
  return { stdout: stdout.trim(), stderr: stderr.trim() };
}

async function prepareStoreCheckout() {
  const supplied = process.env.STB_STORE_ZERO_ROOT?.trim();
  if (supplied) {
    const inspection = await inspectStoreSource(supplied);
    if (!inspection.ok) {
      throw new Error('Supplied STB_STORE_ZERO_ROOT failed the Store source gate: ' + JSON.stringify(inspection));
    }
    return supplied;
  }

  const root = path.join(os.tmpdir(), 'stb-store-zero-' + STORE_PIN.slice(0, 12));
  await fs.rm(root, { recursive: true, force: true });
  await fs.mkdir(root, { recursive: true });

  await run('git', ['init', '--quiet'], root);
  await run('git', ['remote', 'add', 'origin', 'https://github.com/' + STORE_REPOSITORY + '.git'], root);
  await run('git', ['fetch', '--quiet', '--depth=1', 'origin', STORE_PIN], root);
  await run('git', ['checkout', '--quiet', '--detach', 'FETCH_HEAD'], root);

  process.env.STB_STORE_ZERO_ROOT = root;
  const inspection = await inspectStoreSource(root);
  if (!inspection.ok) {
    throw new Error('Fetched Store source failed the Store source gate: ' + JSON.stringify(inspection));
  }
  return root;
}

try {
  const root = await prepareStoreCheckout();
  const hosted = await startHostedStore();
  console.log(
    'Hosted Store Zero ready on port ' +
      hosted.port +
      ' using ' +
      STORE_REPOSITORY +
      '@' +
      STORE_PIN +
      ' from ' +
      root,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
