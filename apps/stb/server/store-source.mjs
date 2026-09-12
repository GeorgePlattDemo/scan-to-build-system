import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';

import { STORE_PIN } from '../shared/contracts.mjs';
import { ADAPTER_ERROR_CODES } from '../shared/store-wire.mjs';

const execFileAsync = promisify(execFile);

export const REQUIRED_STORE_FILES = Object.freeze([
  'store-zero-stage2-store.mjs',
  'store-zero-pricing-engine.mjs',
  'd001-stage2-envelope.mjs',
  's001-mode2-envelope.mjs',
  's001-mode2-arched.mjs',
  'circular-segment.mjs',
  'store-zero-catalog.json',
  'store-zero-observations.json',
]);

function closed(code, details) {
  return {
    ok: false,
    code,
    head: null,
    dirty: null,
    details,
  };
}

async function git(root, args) {
  const { stdout } = await execFileAsync('git', args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024,
  });
  return stdout.trim();
}

export function storeRootFromEnv(env = process.env) {
  const value = env.STB_STORE_ZERO_ROOT;
  if (typeof value !== 'string' || value.trim().length === 0) {
    return null;
  }
  return value.trim();
}

export async function inspectStoreSource(root = storeRootFromEnv()) {
  if (!root) {
    return closed(
      ADAPTER_ERROR_CODES.STORE_SOURCE_UNAVAILABLE,
      'STB_STORE_ZERO_ROOT is not set',
    );
  }

  let stats;
  try {
    stats = await fs.stat(root);
  } catch {
    return closed(
      ADAPTER_ERROR_CODES.STORE_SOURCE_UNAVAILABLE,
      'STB_STORE_ZERO_ROOT does not exist',
    );
  }
  if (!stats.isDirectory()) {
    return closed(
      ADAPTER_ERROR_CODES.STORE_SOURCE_UNAVAILABLE,
      'STB_STORE_ZERO_ROOT is not a directory',
    );
  }

  let head;
  try {
    head = await git(root, ['rev-parse', 'HEAD']);
  } catch {
    return closed(
      ADAPTER_ERROR_CODES.STORE_SOURCE_UNAVAILABLE,
      'Store checkout is not a git repository',
    );
  }

  if (head !== STORE_PIN) {
    return {
      ok: false,
      code: ADAPTER_ERROR_CODES.STORE_PIN_MISMATCH,
      head,
      dirty: null,
      details: { expected: STORE_PIN, actual: head },
    };
  }

  const missing = [];
  for (const file of REQUIRED_STORE_FILES) {
    try {
      await fs.access(path.join(root, file));
    } catch {
      missing.push(file);
    }
  }
  if (missing.length > 0) {
    return {
      ok: false,
      code: ADAPTER_ERROR_CODES.MISSING_STORE_MODULE,
      head,
      dirty: null,
      details: { missing },
    };
  }

  let porcelain;
  try {
    porcelain = await git(root, ['status', '--porcelain']);
  } catch {
    return closed(
      ADAPTER_ERROR_CODES.STORE_SOURCE_UNAVAILABLE,
      'Store checkout status could not be read',
    );
  }
  if (porcelain.length > 0) {
    return {
      ok: false,
      code: ADAPTER_ERROR_CODES.STORE_CHECKOUT_DIRTY,
      head,
      dirty: true,
      details: 'Store checkout is dirty',
    };
  }

  return {
    ok: true,
    code: null,
    head,
    dirty: false,
    details: null,
    rootPresent: true,
  };
}

export async function loadPinnedStoreModules(root) {
  const inspection = await inspectStoreSource(root);
  if (!inspection.ok) {
    return { ok: false, inspection, modules: null };
  }

  try {
    const storeUrl = pathToFileURL(path.join(root, 'store-zero-stage2-store.mjs')).href;
    const pricingUrl = pathToFileURL(path.join(root, 'store-zero-pricing-engine.mjs')).href;
    const envelopeUrl = pathToFileURL(path.join(root, 'd001-stage2-envelope.mjs')).href;
    const sheetUrl = pathToFileURL(path.join(root, 's001-mode2-envelope.mjs')).href;
    const [store, pricing, envelope, sheet] = await Promise.all([
      import(storeUrl),
      import(pricingUrl),
      import(envelopeUrl),
      import(sheetUrl),
    ]);

    const required = [
      [store, 'findSku'],
      [store, 'offerMaterial'],
      [store, 'evaluateJob'],
      [store, 'evaluateSheetMode2Job'],
      [store, 'estimateSheetMode2Job'],
      [store, 'evaluateSheetMode2ArchedJob'],
      [store, 'estimateSheetMode2ArchedJob'],
      [store, 'loadCatalog'],
      [store, 'loadObservations'],
      [pricing, 'estimateJob'],
      [pricing, 'ENGINE'],
      [pricing, 'CYCLE_MODEL'],
      [envelope, 'envelopeCheck'],
      [envelope, 'D001_STAGE2_ENVELOPE'],
      [sheet, 'evaluateSheetMode2'],
      [sheet, 'S001_MODE2_ENVELOPE'],
    ];
    const missing = required
      .filter(([mod, name]) => typeof mod[name] === 'undefined')
      .map(([, name]) => name);
    if (missing.length > 0) {
      return {
        ok: false,
        inspection: {
          ok: false,
          code: ADAPTER_ERROR_CODES.MISSING_STORE_MODULE,
          head: inspection.head,
          dirty: false,
          details: { missing },
        },
        modules: null,
      };
    }

    return {
      ok: true,
      inspection,
      modules: {
        findSku: store.findSku,
        offerMaterial: store.offerMaterial,
        evaluateJob: store.evaluateJob,
        evaluateSheetMode2Job: store.evaluateSheetMode2Job,
        estimateSheetMode2Job: store.estimateSheetMode2Job,
        evaluateSheetMode2ArchedJob: store.evaluateSheetMode2ArchedJob,
        estimateSheetMode2ArchedJob: store.estimateSheetMode2ArchedJob,
        loadCatalog: store.loadCatalog,
        loadObservations: store.loadObservations,
        estimateJob: pricing.estimateJob,
        ENGINE: pricing.ENGINE,
        CYCLE_MODEL: pricing.CYCLE_MODEL,
        envelopeCheck: envelope.envelopeCheck,
        D001_STAGE2_ENVELOPE: envelope.D001_STAGE2_ENVELOPE,
        evaluateSheetMode2: sheet.evaluateSheetMode2,
        S001_MODE2_ENVELOPE: sheet.S001_MODE2_ENVELOPE,
      },
    };
  } catch (error) {
    return {
      ok: false,
      inspection: {
        ok: false,
        code: ADAPTER_ERROR_CODES.MISSING_STORE_MODULE,
        head: inspection.head,
        dirty: false,
        details: 'required Store modules could not be loaded',
      },
      modules: null,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
