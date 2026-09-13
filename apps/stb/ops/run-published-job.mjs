import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';

import {
  PUBLISHED_JOBS,
  PUBLISHED_JOB_STORE_PIN,
  buildPublishedJobSpec,
  publishedJob,
} from './published-jobs.mjs';

const execFileAsync = promisify(execFile);
const ALLOWED_STATUSES = new Set(['SUPPORTABLE', 'UNRESOLVED', 'REFUSED', 'UNAVAILABLE']);

async function git(root, args) {
  const { stdout } = await execFileAsync('git', args, {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024,
  });
  return stdout.trim();
}

async function requirePinnedStore(root) {
  if (!root) throw new Error('STB_STORE_PUBLISHED_JOBS_ROOT is required');
  const stat = await fs.stat(root).catch(() => null);
  if (!stat?.isDirectory()) throw new Error('STB_STORE_PUBLISHED_JOBS_ROOT is not a directory');
  const head = await git(root, ['rev-parse', 'HEAD']).catch(() => null);
  if (!head) throw new Error('Store checkout is not a git repository');
  if (head !== PUBLISHED_JOB_STORE_PIN) {
    throw new Error(`Store pin mismatch: expected ${PUBLISHED_JOB_STORE_PIN}, found ${head}`);
  }
  const dirty = await git(root, ['status', '--porcelain']);
  if (dirty) throw new Error('Store checkout is dirty');
  const modulePath = path.join(root, 'store-zero-stage2-store.mjs');
  await fs.access(modulePath);
  return modulePath;
}

function requireStoreExports(store) {
  const required = [
    'loadCatalog',
    'evaluateJob',
    'estimateJob',
    'evaluateSheetMode2Job',
    'estimateSheetMode2Job',
    'evaluateSheetMode2ArchedJob',
    'estimateSheetMode2ArchedJob',
  ];
  const missing = required.filter((name) => typeof store[name] !== 'function');
  if (missing.length) throw new Error(`Store candidate is missing required exports: ${missing.join(', ')}`);
}

function executePublishedJob(store, catalog, job) {
  const spec = buildPublishedJobSpec(job);
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
  if (!ALLOWED_STATUSES.has(evaluation?.status)) {
    throw new Error(`Store returned an undeclared disposition for ${job.id}`);
  }
  return {
    id: job.id,
    label: job.label,
    requestType: job.requestType,
    storeSku: job.storeSku,
    status: evaluation.status,
    evaluation,
    estimate,
    boundary: job.boundary,
    notClaimed: job.notClaimed,
  };
}

function selectedJobs(argv) {
  if (argv.includes('--all')) return [...PUBLISHED_JOBS];
  const id = argv.find((arg) => !arg.startsWith('-'));
  if (!id) throw new Error('Pass --all or one published job id: square-stick, rect-stencil, arched-opening');
  const job = publishedJob(id);
  if (!job) throw new Error(`Unknown published job: ${id}`);
  return [job];
}

async function main() {
  const modulePath = await requirePinnedStore(process.env.STB_STORE_PUBLISHED_JOBS_ROOT);
  const store = await import(pathToFileURL(modulePath).href);
  requireStoreExports(store);
  const catalog = store.loadCatalog();
  const jobs = selectedJobs(process.argv.slice(2));
  const results = jobs.map((job) => executePublishedJob(store, catalog, job));
  const payload = {
    kind: 'scan-to-build-published-job-trial',
    storePin: PUBLISHED_JOB_STORE_PIN,
    physicalExecutionAuthorized: false,
    controllerOutputProduced: false,
    results,
  };
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
  if (results.some((result) => result.status !== 'SUPPORTABLE')) process.exitCode = 2;
}

main().catch((error) => {
  process.stderr.write(`published-job trial refused: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
