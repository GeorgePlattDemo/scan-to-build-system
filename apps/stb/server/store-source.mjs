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
  'alcove-store-evaluator.mjs',
  'cut-package-evaluator.mjs',
  'store-zero-pricing-engine.mjs',
  'd001-stage2-envelope.mjs',
  'd001-travel-standard.mjs',
  'DIMENSIONAL-STORE-TRAVEL-STANDARD-0.1.md',
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
    const alcoveUrl = pathToFileURL(path.join(root, 'alcove-store-evaluator.mjs')).href;
    const pricingUrl = pathToFileURL(path.join(root, 'store-zero-pricing-engine.mjs')).href;
    const envelopeUrl = pathToFileURL(path.join(root, 'd001-stage2-envelope.mjs')).href;
    const cutPackageUrl = pathToFileURL(path.join(root, 'cut-package-evaluator.mjs')).href;
    const [store, alcove, pricing, envelope, cutPackage] = await Promise.all([
      import(storeUrl),
      import(alcoveUrl),
      import(pricingUrl),
      import(envelopeUrl),
      import(cutPackageUrl),
    ]);

    const required = [
      [store, 'findSku'],
      [store, 'offerMaterial'],
      [store, 'resolveBoardMaterial'],
      [store, 'evaluateJob'],
      [store, 'evaluateDimensionalTravelJob'],
      [store, 'evaluateDimensionalStoreRequest'],
      [store, 'requestDimensionalStoreEvaluation'],
      [store, 'STORE_EVALUATION_FRESHNESS'],
      [store, 'loadCatalog'],
      [store, 'loadObservations'],
      [alcove, 'evaluateAlcoveJob'],
      [alcove, 'evaluateAlcoveStoreRequest'],
      [alcove, 'requestAlcoveStoreEvaluation'],
      [alcove, 'ALCOVE_STORE_STANDARD'],
      [pricing, 'estimateJob'],
      [pricing, 'ENGINE'],
      [pricing, 'CYCLE_MODEL'],
      [envelope, 'envelopeCheck'],
      [envelope, 'D001_STAGE2_ENVELOPE'],
      [cutPackage, 'evaluateCutPackageStoreRequest'],
      [cutPackage, 'requestCutPackageStoreEvaluation'],
      [cutPackage, 'CUT_PACKAGE_STANDARD'],
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
        resolveBoardMaterial: store.resolveBoardMaterial,
        evaluateJob: store.evaluateJob,
        evaluateDimensionalTravelJob: store.evaluateDimensionalTravelJob,
        evaluateDimensionalStoreRequest: store.evaluateDimensionalStoreRequest,
        requestDimensionalStoreEvaluation: store.requestDimensionalStoreEvaluation,
        STORE_EVALUATION_FRESHNESS: store.STORE_EVALUATION_FRESHNESS,
        loadCatalog: store.loadCatalog,
        loadObservations: store.loadObservations,
        evaluateAlcoveJob: alcove.evaluateAlcoveJob,
        evaluateAlcoveStoreRequest: alcove.evaluateAlcoveStoreRequest,
        requestAlcoveStoreEvaluation: alcove.requestAlcoveStoreEvaluation,
        ALCOVE_STORE_STANDARD: alcove.ALCOVE_STORE_STANDARD,
        estimateJob: pricing.estimateJob,
        ENGINE: pricing.ENGINE,
        CYCLE_MODEL: pricing.CYCLE_MODEL,
        envelopeCheck: envelope.envelopeCheck,
        D001_STAGE2_ENVELOPE: envelope.D001_STAGE2_ENVELOPE,
        evaluateCutPackageStoreRequest: cutPackage.evaluateCutPackageStoreRequest,
        requestCutPackageStoreEvaluation: cutPackage.requestCutPackageStoreEvaluation,
        CUT_PACKAGE_STANDARD: cutPackage.CUT_PACKAGE_STANDARD,
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
