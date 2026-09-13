import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';

import {
  PUBLISHED_JOB_STORE_PIN,
  buildPublishedJobSpec,
  publishedJob,
} from '../ops/published-jobs.mjs';

const execFileAsync = promisify(execFile);
const ALLOWED_STORE_STATUSES = new Set(['SUPPORTABLE', 'UNRESOLVED', 'REFUSED', 'UNAVAILABLE']);

export const PUBLISHED_JOB_PATH = '/api/published-job';

async function git(root, args) {
  const { stdout } = await execFileAsync('git', args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024,
  });
  return stdout.trim();
}

async function inspectStoreRoot(root) {
  if (!root) return { ok: false, code: 'PUBLISHED_JOB_STORE_ROOT_MISSING' };
  const stat = await fs.stat(root).catch(() => null);
  if (!stat?.isDirectory()) return { ok: false, code: 'PUBLISHED_JOB_STORE_ROOT_INVALID' };
  const head = await git(root, ['rev-parse', 'HEAD']).catch(() => null);
  if (!head) return { ok: false, code: 'PUBLISHED_JOB_STORE_NOT_GIT' };
  if (head !== PUBLISHED_JOB_STORE_PIN) {
    return {
      ok: false,
      code: 'PUBLISHED_JOB_STORE_PIN_MISMATCH',
      expected: PUBLISHED_JOB_STORE_PIN,
      actual: head,
    };
  }
  const dirty = await git(root, ['status', '--porcelain']).catch(() => '__git_error__');
  if (dirty === '__git_error__') return { ok: false, code: 'PUBLISHED_JOB_STORE_GIT_ERROR' };
  if (dirty) return { ok: false, code: 'PUBLISHED_JOB_STORE_DIRTY' };
  const modulePath = path.join(root, 'store-zero-stage2-store.mjs');
  const exists = await fs.access(modulePath).then(() => true).catch(() => false);
  if (!exists) return { ok: false, code: 'PUBLISHED_JOB_STORE_MODULE_MISSING' };
  return { ok: true, code: 'READY', head, modulePath };
}

function requireExports(store) {
  const required = [
    'loadCatalog',
    'evaluateJob',
    'estimateJob',
    'evaluateSheetMode2Job',
    'estimateSheetMode2Job',
    'evaluateSheetMode2ArchedJob',
    'estimateSheetMode2ArchedJob',
  ];
  return required.filter((name) => typeof store?.[name] !== 'function');
}

function runJob(store, catalog, job, inputs) {
  const spec = buildPublishedJobSpec(job, inputs);
  let evaluation;
  let estimate = null;
  if (job.requestType === 'BOARD_SQUARE_V1') {
    evaluation = store.evaluateJob(catalog, spec.evaluation);
    if (evaluation.status === 'SUPPORTABLE') estimate = store.estimateJob(catalog, spec.estimate);
  } else if (job.requestType === 'SHEET_MODE2_STENCIL_V1') {
    evaluation = store.evaluateSheetMode2Job(catalog, spec.evaluation);
    if (evaluation.status === 'SUPPORTABLE') estimate = store.estimateSheetMode2Job(catalog, spec.estimate);
  } else if (job.requestType === 'SHEET_MODE2_ARCHED_APERTURE_V0') {
    evaluation = store.evaluateSheetMode2ArchedJob(catalog, spec.evaluation);
    if (evaluation.status === 'SUPPORTABLE') estimate = store.estimateSheetMode2ArchedJob(catalog, spec.estimate);
  } else {
    throw new Error(`unsupported published job type: ${job.requestType}`);
  }
  return { evaluation, estimate, inputs: spec.inputs };
}

function unavailable(inspection) {
  return {
    ready: false,
    inspection,
    async dispatch() {
      return {
        status: 503,
        body: {
          kind: 'published-job-store-answer',
          ready: false,
          storePin: PUBLISHED_JOB_STORE_PIN,
          code: inspection?.code ?? 'PUBLISHED_JOB_STORE_UNAVAILABLE',
          physicalExecutionAuthorized: false,
          controllerOutputProduced: false,
        },
      };
    },
  };
}

function boundedEvaluation(evaluation) {
  const curve = evaluation?.curve && typeof evaluation.curve === 'object'
    ? {
        kind: evaluation.curve.kind ?? null,
        chord_in: evaluation.curve.chord_in ?? null,
        rise_in: evaluation.curve.rise_in ?? null,
        radius_in: evaluation.curve.radius_in ?? null,
        derivedRadius_in: evaluation.curve.derivedRadius_in ?? null,
      }
    : null;
  const retention = evaluation?.retention && typeof evaluation.retention === 'object'
    ? {
        class: evaluation.retention.class ?? null,
        requestedTabCount: evaluation.retention.requestedTabCount ?? null,
        plannedTabCount: evaluation.retention.plannedTabCount ?? null,
        tabPolicyId: evaluation.retention.tabPolicyId ?? null,
        tabPlanStatus: evaluation.retention.tabPlanStatus ?? null,
        tabWidth_in: evaluation.retention.tabWidth_in ?? null,
        maxAllowedGap_in: evaluation.retention.maxAllowedGap_in ?? null,
        placement: evaluation.retention.placement ?? null,
        fullSeverance: evaluation.retention.fullSeverance ?? null,
        physicalRetentionStatus: evaluation.retention.physicalRetentionStatus ?? null,
        secondarySeparation: evaluation.retention.secondarySeparation ?? null,
      }
    : null;
  return {
    envelope: evaluation?.envelope ?? null,
    reasons: Array.isArray(evaluation?.reasons) ? [...evaluation.reasons] : [],
    unresolved: Array.isArray(evaluation?.unresolved) ? [...evaluation.unresolved] : [],
    curve,
    retention,
    secondarySeparation: evaluation?.secondarySeparation ?? null,
  };
}

export async function createPublishedJobAdapter({
  storeRoot = process.env.STB_STORE_PUBLISHED_JOBS_ROOT ?? null,
  storeModule = null,
} = {}) {
  let inspection;
  let store = storeModule;
  if (!store) {
    inspection = await inspectStoreRoot(storeRoot);
    if (!inspection.ok) return unavailable(inspection);
    store = await import(pathToFileURL(inspection.modulePath).href);
  } else {
    inspection = { ok: true, code: 'INJECTED_TEST_MODULE', head: PUBLISHED_JOB_STORE_PIN };
  }

  const missing = requireExports(store);
  if (missing.length > 0) {
    return unavailable({ ok: false, code: 'PUBLISHED_JOB_STORE_EXPORT_MISSING', missing });
  }
  const catalog = store.loadCatalog();

  return {
    ready: true,
    inspection,
    async dispatch(body) {
      if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return { status: 400, body: { ready: true, code: 'MALFORMED_REQUEST' } };
      }
      const keys = Object.keys(body).sort();
      const allowedKeys = body.inputs === undefined ? ['jobId'] : ['inputs', 'jobId'];
      if (
        keys.length !== allowedKeys.length
        || keys.some((key, index) => key !== allowedKeys[index])
        || typeof body.jobId !== 'string'
      ) {
        return { status: 422, body: { ready: true, code: 'INVALID_BOUNDED_SCOPE' } };
      }
      const job = publishedJob(body.jobId);
      if (!job) return { status: 422, body: { ready: true, code: 'UNKNOWN_PUBLISHED_JOB' } };

      let result;
      try {
        result = runJob(store, catalog, job, body.inputs ?? null);
      } catch (error) {
        if (error instanceof TypeError) {
          return { status: 422, body: { ready: true, code: 'INVALID_BOUNDED_INPUTS', message: error.message } };
        }
        throw error;
      }
      const { evaluation, estimate, inputs } = result;
      if (!ALLOWED_STORE_STATUSES.has(evaluation?.status)) {
        return {
          status: 502,
          body: {
            kind: 'published-job-store-answer',
            ready: false,
            storePin: PUBLISHED_JOB_STORE_PIN,
            code: 'PUBLISHED_JOB_STORE_RESPONSE_INVALID',
            physicalExecutionAuthorized: false,
            controllerOutputProduced: false,
          },
        };
      }
      return {
        status: 200,
        body: {
          kind: 'published-job-store-answer',
          ready: true,
          jobId: job.id,
          label: job.label,
          requestType: job.requestType,
          storeSku: job.storeSku,
          storePin: PUBLISHED_JOB_STORE_PIN,
          inputs,
          status: evaluation.status,
          evidenceClass: evaluation?.evidenceClass ?? null,
          physicalStatus: evaluation?.physicalStatus ?? null,
          commissioned: evaluation?.commissioned ?? null,
          ...boundedEvaluation(evaluation),
          estimate: estimate
            ? {
                status: estimate.status ?? null,
                material: estimate.material ?? null,
                processQ_status: estimate.processQ_status ?? null,
                Q: estimate.Q ?? null,
                note: estimate.note ?? null,
              }
            : null,
          boundary: job.boundary,
          notClaimed: job.notClaimed,
          physicalExecutionAuthorized: false,
          controllerOutputProduced: false,
        },
      };
    },
  };
}
