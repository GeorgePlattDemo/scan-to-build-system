import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';

import {
  PUBLISHED_JOB_STORE_PIN,
  buildPublishedJobSpec,
  normalizePublishedJobInputs,
  publishedJob,
} from '../ops/published-jobs.mjs';

const execFileAsync = promisify(execFile);
const ALLOWED_STORE_STATUSES = new Set(['SUPPORTABLE', 'UNRESOLVED', 'REFUSED', 'UNAVAILABLE']);

export const PUBLISHED_JOB_PATH = '/api/published-job';

export function isDeclaredPublishedJobStoreStatus(status) {
  return ALLOWED_STORE_STATUSES.has(status);
}

export function inspectPublishedJobRequest(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { ok: false, status: 400, code: 'MALFORMED_REQUEST' };
  }
  const keys = Object.keys(body).sort();
  const allowedKeys = body.inputs === undefined ? ['jobId'] : ['inputs', 'jobId'];
  if (
    keys.length !== allowedKeys.length
    || keys.some((key, index) => key !== allowedKeys[index])
    || typeof body.jobId !== 'string'
  ) {
    return { ok: false, status: 422, code: 'INVALID_BOUNDED_SCOPE' };
  }
  const job = publishedJob(body.jobId);
  if (!job) return { ok: false, status: 422, code: 'UNKNOWN_PUBLISHED_JOB' };
  try {
    return { ok: true, job, inputs: normalizePublishedJobInputs(job, body.inputs ?? null) };
  } catch (error) {
    if (error instanceof TypeError) {
      return { ok: false, status: 422, code: 'INVALID_BOUNDED_INPUTS', message: error.message };
    }
    throw error;
  }
}

async function git(root, args) {
  const { stdout } = await execFileAsync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 1024 * 1024 });
  return stdout.trim();
}

async function inspectStoreRoot(root) {
  if (!root) return { ok: false, code: 'PUBLISHED_JOB_STORE_ROOT_MISSING' };
  const stat = await fs.stat(root).catch(() => null);
  if (!stat?.isDirectory()) return { ok: false, code: 'PUBLISHED_JOB_STORE_ROOT_INVALID' };
  const head = await git(root, ['rev-parse', 'HEAD']).catch(() => null);
  if (!head) return { ok: false, code: 'PUBLISHED_JOB_STORE_NOT_GIT' };
  if (head !== PUBLISHED_JOB_STORE_PIN) {
    return { ok: false, code: 'PUBLISHED_JOB_STORE_PIN_MISMATCH', expected: PUBLISHED_JOB_STORE_PIN, actual: head };
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

function firstCapability(evaluation) {
  if (evaluation?.line?.capability && typeof evaluation.line.capability === 'object') return evaluation.line.capability;
  const firstLine = Array.isArray(evaluation?.lines) ? evaluation.lines[0] : null;
  if (firstLine?.capability && typeof firstLine.capability === 'object') return firstLine.capability;
  return null;
}

function capabilityEnvelopeId(capability) {
  const envelope = capability?.envelope;
  if (typeof envelope === 'string') return envelope;
  if (envelope && typeof envelope === 'object') return envelope.envelope ?? envelope.id ?? null;
  return null;
}

function boundedCurve(curve) {
  if (!curve || typeof curve !== 'object') return null;
  return {
    kind: curve.kind ?? null,
    chord_in: curve.chord_in ?? null,
    rise_in: curve.rise_in ?? null,
    radius_in: curve.radius_in ?? null,
    derivedRadius_in: curve.derivedRadius_in ?? null,
  };
}

function fourMargins(value) {
  if (!value || typeof value !== 'object') return null;
  return {
    left: value.left ?? null,
    right: value.right ?? null,
    bottom: value.bottom ?? null,
    top: value.top ?? null,
  };
}

function boundedWorkField(workField) {
  if (!workField || typeof workField !== 'object') return null;
  return {
    id: workField.id ?? null,
    placement: workField.placement ?? null,
    horizontalAxis: workField.horizontalAxis ?? null,
    verticalAxis: workField.verticalAxis ?? null,
    horizontalSpan_in: workField.horizontalSpan_in ?? null,
    verticalSpan_in: workField.verticalSpan_in ?? null,
    containment: workField.containment ?? null,
    parentContainsField: workField.parentContainsField ?? null,
    profileInsideField: workField.profileInsideField ?? null,
    parentMargins_in: fourMargins(workField.parentMargins_in),
    profileMarginsWithinField_in: fourMargins(workField.profileMarginsWithinField_in),
  };
}

function boundedRetention(retention) {
  if (!retention || typeof retention !== 'object') return null;
  const plan = retention.plan && typeof retention.plan === 'object' ? retention.plan : null;
  return {
    class: retention.class ?? null,
    requestedTabCount: retention.requestedTabCount ?? plan?.requestedTabCount ?? null,
    plannedTabCount: retention.plannedTabCount ?? plan?.plannedTabCount ?? null,
    tabPolicyId: retention.tabPolicyId ?? plan?.policyId ?? null,
    tabPlanStatus: retention.tabPlanStatus ?? plan?.status ?? null,
    planningReserveTabs: retention.planningReserveTabs ?? plan?.planningReserveTabs ?? null,
    tabWidth_in: retention.tabWidth_in ?? plan?.minBridgeWidth_in ?? null,
    maxAllowedGap_in: retention.maxAllowedGap_in ?? plan?.maxAllowedGap_in ?? null,
    perimeter_in: plan?.perimeter_in ?? null,
    arcLength_in: plan?.arcLength_in ?? null,
    nominalSpacing_in: plan?.nominalSpacing_in ?? null,
    placement: retention.placement ?? plan?.placementMethod ?? null,
    fullSeverance: retention.fullSeverance ?? null,
    physicalRetentionStatus: retention.physicalRetentionStatus ?? plan?.physicalRetentionStatus ?? null,
    secondarySeparation: retention.secondarySeparation ?? null,
    physicalNote: plan?.physicalNote ?? null,
  };
}

export function boundedPublishedEvaluation(evaluation) {
  const capability = firstCapability(evaluation);
  const basis = evaluation?.basis && typeof evaluation.basis === 'object' ? evaluation.basis : null;
  const curve = evaluation?.curve ?? basis?.curve ?? capability?.curve ?? null;
  const retention = evaluation?.retention ?? basis?.retention ?? capability?.retention ?? null;
  const workField = evaluation?.workField ?? basis?.workField ?? capability?.workField ?? null;

  const reasons = Array.isArray(evaluation?.reasons)
    ? evaluation.reasons
    : Array.isArray(capability?.reasons)
      ? capability.reasons
      : Array.isArray(capability?.missing)
        ? capability.missing
        : Array.isArray(capability?.envelope?.reasons)
          ? capability.envelope.reasons
          : [];
  const unresolved = Array.isArray(evaluation?.unresolved)
    ? evaluation.unresolved
    : Array.isArray(capability?.unresolved)
      ? capability.unresolved
      : [];

  return {
    envelope: evaluation?.envelope ?? basis?.envelope ?? capabilityEnvelopeId(capability) ?? null,
    reasons: [...reasons],
    unresolved: [...unresolved],
    workField: boundedWorkField(workField),
    curve: boundedCurve(curve),
    retention: boundedRetention(retention),
    secondarySeparation: evaluation?.secondarySeparation ?? capability?.secondarySeparation ?? null,
  };
}

export function boundedPublishedEstimate(estimate) {
  if (!estimate || typeof estimate !== 'object' || Array.isArray(estimate)) return null;
  const totals = estimate.totals && typeof estimate.totals === 'object' ? estimate.totals : null;
  const cycle = estimate.cycle && typeof estimate.cycle === 'object' ? estimate.cycle : null;
  return {
    status: estimate.status ?? null,
    material: estimate.material ?? totals?.material ?? null,
    processQ: estimate.processQ ?? null,
    processQ_status: estimate.processQ_status ?? null,
    cellRecovery: totals?.cell_recovery ?? null,
    hardware: totals?.hardware ?? null,
    Q: estimate.Q ?? totals?.Q ?? null,
    Q_basis: estimate.Q_basis ?? totals?.Q_basis ?? null,
    modeledTimeMin: cycle?.T_job_min ?? null,
    cycleModel: cycle?.model ?? null,
    cycleBasis: cycle?.basis ?? null,
    cycleMeasured: cycle?.measured ?? null,
    note: estimate.note ?? totals?.note ?? null,
  };
}

export async function createPublishedJobAdapter({ storeRoot = process.env.STB_STORE_PUBLISHED_JOBS_ROOT ?? null } = {}) {
  const inspection = await inspectStoreRoot(storeRoot);
  if (!inspection.ok) return unavailable(inspection);
  const store = await import(pathToFileURL(inspection.modulePath).href);
  const missing = requireExports(store);
  if (missing.length > 0) return unavailable({ ok: false, code: 'PUBLISHED_JOB_STORE_EXPORT_MISSING', missing });
  const catalog = store.loadCatalog();

  return {
    ready: true,
    inspection,
    async dispatch(body) {
      const request = inspectPublishedJobRequest(body);
      if (!request.ok) {
        return { status: request.status, body: { ready: true, code: request.code, ...(request.message ? { message: request.message } : {}) } };
      }
      const { evaluation, estimate, inputs } = runJob(store, catalog, request.job, request.inputs);
      if (!isDeclaredPublishedJobStoreStatus(evaluation?.status)) {
        return {
          status: 502,
          body: {
            kind: 'published-job-store-answer', ready: false, storePin: PUBLISHED_JOB_STORE_PIN,
            code: 'PUBLISHED_JOB_STORE_RESPONSE_INVALID', physicalExecutionAuthorized: false, controllerOutputProduced: false,
          },
        };
      }
      return {
        status: 200,
        body: {
          kind: 'published-job-store-answer',
          ready: true,
          jobId: request.job.id,
          label: request.job.label,
          requestType: request.job.requestType,
          storeSku: request.job.storeSku,
          storePin: PUBLISHED_JOB_STORE_PIN,
          inputs,
          status: evaluation.status,
          evidenceClass: evaluation?.evidenceClass ?? null,
          physicalStatus: evaluation?.physicalStatus ?? null,
          commissioned: evaluation?.commissioned ?? null,
          ...boundedPublishedEvaluation(evaluation),
          estimate: boundedPublishedEstimate(estimate),
          boundary: request.job.boundary,
          notClaimed: request.job.notClaimed,
          physicalExecutionAuthorized: false,
          controllerOutputProduced: false,
        },
      };
    },
  };
}
