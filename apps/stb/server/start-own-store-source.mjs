import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';

import { START_OWN_STORE_PIN } from '../shared/start-own-store-wire.mjs';

const execFileAsync = promisify(execFile);

export const START_OWN_REQUIRED_STORE_FILES = Object.freeze([
  'store-zero-stage2-store.mjs',
  'store-zero-pricing-engine.mjs',
  'd001-stage2-envelope.mjs',
  'store-zero-catalog.json',
  'store-zero-observations.json',
]);

async function git(root, args) {
  const { stdout } = await execFileAsync('git', args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024,
  });
  return stdout.trim();
}

function closed(code, details, head = null, dirty = null) {
  return { ok: false, code, details, head, dirty };
}

export function startOwnStoreRootFromEnv(env = process.env) {
  const value = env.STB_STORE_START_OWN_ROOT;
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export async function inspectStartOwnStoreSource(root = startOwnStoreRootFromEnv()) {
  if (!root) return closed('STORE_SOURCE_UNAVAILABLE', 'STB_STORE_START_OWN_ROOT is not set');
  try {
    const stats = await fs.stat(root);
    if (!stats.isDirectory()) return closed('STORE_SOURCE_UNAVAILABLE', 'Store root is not a directory');
  } catch {
    return closed('STORE_SOURCE_UNAVAILABLE', 'STB_STORE_START_OWN_ROOT does not exist');
  }
  let head;
  try {
    head = await git(root, ['rev-parse', 'HEAD']);
  } catch {
    return closed('STORE_SOURCE_UNAVAILABLE', 'Store checkout is not a git repository');
  }
  if (head !== START_OWN_STORE_PIN) {
    return closed('STORE_PIN_MISMATCH', { expected: START_OWN_STORE_PIN, actual: head }, head, null);
  }
  const missing = [];
  for (const file of START_OWN_REQUIRED_STORE_FILES) {
    try { await fs.access(path.join(root, file)); } catch { missing.push(file); }
  }
  if (missing.length) return closed('MISSING_STORE_MODULE', { missing }, head, false);
  let porcelain;
  try {
    porcelain = await git(root, ['status', '--porcelain']);
  } catch {
    return closed('STORE_SOURCE_UNAVAILABLE', 'Store checkout status could not be read', head, null);
  }
  if (porcelain) return closed('STORE_CHECKOUT_DIRTY', 'Store checkout is dirty', head, true);
  return { ok: true, code: null, details: null, head, dirty: false, rootPresent: true };
}

export async function loadStartOwnStoreModules(root = startOwnStoreRootFromEnv()) {
  const inspection = await inspectStartOwnStoreSource(root);
  if (!inspection.ok) return { ok: false, inspection, modules: null };
  try {
    const store = await import(pathToFileURL(path.join(root, 'store-zero-stage2-store.mjs')).href);
    const pricing = await import(pathToFileURL(path.join(root, 'store-zero-pricing-engine.mjs')).href);
    const envelope = await import(pathToFileURL(path.join(root, 'd001-stage2-envelope.mjs')).href);
    const required = [
      [store, 'findSku'],
      [store, 'loadCatalog'],
      [store, 'loadObservations'],
      [store, 'evaluateUserDefinedBoardJob'],
      [pricing, 'ENGINE'],
      [pricing, 'CYCLE_MODEL'],
      [envelope, 'D001_STAGE2_ENVELOPE'],
    ];
    const missing = required.filter(([mod, key]) => typeof mod[key] === 'undefined').map(([, key]) => key);
    if (missing.length) {
      return {
        ok: false,
        inspection: closed('MISSING_STORE_MODULE', { missing }, inspection.head, false),
        modules: null,
      };
    }
    return {
      ok: true,
      inspection,
      modules: {
        findSku: store.findSku,
        loadCatalog: store.loadCatalog,
        loadObservations: store.loadObservations,
        evaluateUserDefinedBoardJob: store.evaluateUserDefinedBoardJob,
        ENGINE: pricing.ENGINE,
        CYCLE_MODEL: pricing.CYCLE_MODEL,
        D001_STAGE2_ENVELOPE: envelope.D001_STAGE2_ENVELOPE,
      },
    };
  } catch (error) {
    return {
      ok: false,
      inspection: closed('MISSING_STORE_MODULE', 'required Start Own Store modules could not be loaded', inspection.head, false),
      modules: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
