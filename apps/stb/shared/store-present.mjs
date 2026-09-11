import { COPY, STORE_JOB_STATUSES } from './contracts.mjs';
import { APP_DIAGNOSTICS, isKnownJobStatus } from './store-wire.mjs';

export function formatReturnedAmount(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }
  return `$${value.toFixed(2)}`;
}

export function formatReturnedMinutes(value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return null;
  }
  return `${value} min`;
}

function displayOrMissing(value) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  return value;
}

function envelopeFrom(applicability) {
  const payload = applicability?.response?.payload ?? {};
  return payload.wrapperEnvelope ?? null;
}

function copyOffering(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }
  return {
    storeSku: displayOrMissing(raw.storeSku),
    description: displayOrMissing(raw.description),
    species: displayOrMissing(raw.species),
    grade: displayOrMissing(raw.grade),
    form: displayOrMissing(raw.form),
    nominalT: displayOrMissing(raw.nominalT),
    nominalW: displayOrMissing(raw.nominalW),
    actualT: displayOrMissing(raw.actualT),
    actualW: displayOrMissing(raw.actualW),
    stockL_in: displayOrMissing(raw.stockL_in),
    uom: displayOrMissing(raw.uom),
    offered: raw.offered === true,
    observationId: displayOrMissing(raw.observationId),
  };
}

function copyStock(line) {
  const stock = line?.stock;
  if (!stock || typeof stock !== 'object') {
    return null;
  }
  return {
    status: displayOrMissing(stock.status),
    available: displayOrMissing(stock.available),
    qtyNeeded: displayOrMissing(stock.qtyNeeded),
    fixtureDeclaredOnHand: displayOrMissing(stock.fixtureDeclaredOnHand),
    allocatedSimulated: displayOrMissing(stock.allocatedSimulated),
    reason: displayOrMissing(stock.reason),
    supplierPath: displayOrMissing(stock.supplierPath),
    asOf: displayOrMissing(stock.asOf),
  };
}

function copyCapability(line) {
  const capability = line?.capability;
  if (!capability || typeof capability !== 'object') {
    return null;
  }
  const missing = Array.isArray(capability.missing)
    ? capability.missing.filter((item) => typeof item === 'string')
    : [];
  const envelopeReasons = Array.isArray(capability.envelope?.reasons)
    ? capability.envelope.reasons.filter((item) => typeof item === 'string')
    : [];
  const reasons = missing.length > 0 ? missing : envelopeReasons;
  return {
    status: displayOrMissing(capability.status),
    reason: displayOrMissing(capability.reason),
    missing: reasons,
    envelopeId: displayOrMissing(capability.envelope?.envelope ?? capability.envelope?.id),
  };
}

function copyPrice(line) {
  const price = line?.price;
  if (!price || typeof price !== 'object') {
    return null;
  }
  return {
    status: displayOrMissing(price.status),
    reason: displayOrMissing(price.reason),
    sellingPrice: typeof price.sellingPrice === 'number' ? price.sellingPrice : null,
    sellingPriceDisplay: formatReturnedAmount(price.sellingPrice),
    asOf: displayOrMissing(price.asOf),
    observationId: displayOrMissing(price.observationId),
  };
}

function copyEstimate(envelope) {
  const rawEstimate = envelope?.rawEstimate ?? null;
  const estimateError = envelope?.estimateError ?? null;
  if (!rawEstimate && !estimateError) {
    return {
      available: false,
      reason: 'missing',
      status: null,
      q: null,
      qDisplay: null,
      material: null,
      materialDisplay: null,
      recovery: null,
      recoveryDisplay: null,
      hardware: null,
      minutes: null,
      minutesDisplay: null,
      cycleModel: null,
      engineId: null,
      engineVersion: null,
    };
  }
  if (!rawEstimate) {
    return {
      available: false,
      reason: estimateError?.code ?? 'estimate-failed',
      status: null,
      q: null,
      qDisplay: null,
      material: null,
      materialDisplay: null,
      recovery: null,
      recoveryDisplay: null,
      hardware: null,
      minutes: null,
      minutesDisplay: null,
      cycleModel: null,
      engineId: null,
      engineVersion: null,
      estimateError,
    };
  }
  const totals = rawEstimate.totals && typeof rawEstimate.totals === 'object' ? rawEstimate.totals : {};
  const q = typeof totals.Q === 'number' && Number.isFinite(totals.Q) ? totals.Q : null;
  const material = typeof totals.material === 'number' && Number.isFinite(totals.material) ? totals.material : null;
  const recovery =
    typeof totals.cell_recovery === 'number' && Number.isFinite(totals.cell_recovery)
      ? totals.cell_recovery
      : null;
  const hardware = typeof totals.hardware === 'number' && Number.isFinite(totals.hardware) ? totals.hardware : null;
  const minutes =
    typeof rawEstimate.cycle?.T_job_min === 'number' && Number.isFinite(rawEstimate.cycle.T_job_min)
      ? rawEstimate.cycle.T_job_min
      : null;
  return {
    available: rawEstimate.status === 'BUDGETARY_ESTIMATE' && q !== null,
    reason: displayOrMissing(rawEstimate.reason) ?? (q === null ? 'missing-q' : null),
    status: displayOrMissing(rawEstimate.status),
    q,
    qDisplay: formatReturnedAmount(q),
    material,
    materialDisplay: formatReturnedAmount(material),
    recovery,
    recoveryDisplay: formatReturnedAmount(recovery),
    hardware,
    hardwareDisplay: formatReturnedAmount(hardware),
    minutes,
    minutesDisplay: formatReturnedMinutes(minutes),
    cycleModel: displayOrMissing(rawEstimate.cycle?.model),
    measured: rawEstimate.cycle?.measured === true,
    commissioned: rawEstimate.cycle?.commissioned === true,
    engineId: displayOrMissing(rawEstimate.engine?.id),
    engineVersion: displayOrMissing(rawEstimate.engine?.version),
    estimateError,
  };
}

function copyBasis(envelope) {
  const basis = envelope?.attributedBasis ?? {};
  return {
    storePin: displayOrMissing(envelope?.storePin),
    protocolVersion: displayOrMissing(envelope?.protocolVersion),
    wrapperBuildId: displayOrMissing(envelope?.wrapperBuildId),
    requestId: displayOrMissing(envelope?.requestId),
    responseId: displayOrMissing(envelope?.responseId),
    attemptId: displayOrMissing(envelope?.attemptId),
    attemptNumber: displayOrMissing(envelope?.attemptNumber),
    candidateRevisionId: displayOrMissing(envelope?.candidateRevisionId),
    sourceAsOf: displayOrMissing(basis.sourceClock ?? envelope?.rawOffering?.catalogClock),
    wrapperRespondedAt: displayOrMissing(envelope?.wrapperRespondedAt),
    pricingEngineId: displayOrMissing(basis.pricingEngine?.id),
    pricingEngineVersion: displayOrMissing(basis.pricingEngine?.version),
    cycleModelId: displayOrMissing(basis.cycleModel?.id),
    envelopeId: displayOrMissing(basis.envelope?.id),
    assertionBasis: basis.assertionBasis ?? null,
    observationId: displayOrMissing(basis.observationId ?? envelope?.rawOffering?.observationId),
    measured: basis.measured === true,
    commissioned: basis.commissioned === true,
    budgetaryEstimateIsNotAQuote: basis.budgetaryEstimateIsNotAQuote !== false,
    modeledTimeIsNotAMachineWorkPlan: basis.modeledTimeIsNotAMachineWorkPlan !== false,
  };
}

function dispositionCopy(status) {
  switch (status) {
    case 'SUPPORTABLE':
      return COPY.storeSupportable;
    case 'UNRESOLVED':
      return COPY.storeUnresolved;
    case 'REFUSED':
      return COPY.storeRefused;
    case 'UNAVAILABLE':
      return COPY.storeUnavailableJob;
    default:
      return null;
  }
}

function diagnosticKind(diagnostic) {
  switch (diagnostic) {
    case APP_DIAGNOSTICS.APP_TRANSPORT_ERROR:
      return 'transport';
    case APP_DIAGNOSTICS.APP_ADAPTER_ERROR:
      return 'adapter';
    case APP_DIAGNOSTICS.APP_MALFORMED_RESPONSE:
      return 'malformed';
    case APP_DIAGNOSTICS.APP_CORRELATION_ERROR:
      return 'correlation';
    case APP_DIAGNOSTICS.APP_ATTEMPT_INTERRUPTED:
      return 'interrupted';
    default:
      return 'error';
  }
}

function diagnosticHeadline(kind) {
  switch (kind) {
    case 'transport':
      return COPY.storeTransport;
    case 'adapter':
      return COPY.storeAdapter;
    case 'malformed':
      return COPY.storeMalformed;
    case 'correlation':
      return COPY.storeCorrelation;
    case 'interrupted':
      return COPY.storeInterrupted;
    default:
      return COPY.storeMalformed;
  }
}

function emptyView(overrides) {
  return {
    kind: 'none',
    current: false,
    historical: false,
    pending: false,
    retryable: false,
    inspectable: false,
    headline: COPY.storeUnavailable,
    label: null,
    dispositionPlain: null,
    dispositionEnum: null,
    diagnostic: null,
    candidateRevisionId: null,
    requestId: null,
    attemptId: null,
    responseId: null,
    offering: null,
    stock: null,
    capability: null,
    price: null,
    estimate: null,
    q: null,
    qDisplay: null,
    basis: null,
    reasons: [],
    receivedAt: null,
    sourceAsOf: null,
    wrapperRespondedAt: null,
    rawRequest: null,
    rawResponse: null,
    unapplied: false,
    ...overrides,
  };
}

export function presentStoreAnswer(applicability, options = {}) {
  const unapplied = options.unapplied === true;
  const projectionValid = options.projectionValid;
  const candidateRevisionId =
    applicability?.candidateRevisionId ?? options.candidateRevisionId ?? null;

  if (!applicability || applicability.status === 'none') {
    return emptyView({
      kind: projectionValid === false ? 'incomplete' : 'none',
      headline: projectionValid === false ? COPY.storeIncomplete : COPY.storeUnavailable,
      candidateRevisionId,
      unapplied,
    });
  }

  if (applicability.status === 'pending') {
    return emptyView({
      kind: 'pending',
      pending: true,
      headline: COPY.storePending,
      candidateRevisionId,
      requestId: applicability.request?.id ?? null,
      attemptId: applicability.attempt?.id ?? null,
      rawRequest: applicability.request?.payload?.payload ?? null,
      unapplied,
    });
  }

  const diagnostic = applicability.diagnostic ?? null;
  const envelope = envelopeFrom(applicability);
  const usable = applicability.response && applicability.current === true;
  const historicalUsable = applicability.historical === true && envelope && !diagnostic;

  if (diagnostic && !usable) {
    const kind = diagnosticKind(diagnostic);
    return emptyView({
      kind,
      historical: applicability.historical === true,
      retryable: kind === 'transport' || kind === 'adapter' || kind === 'interrupted',
      inspectable: true,
      headline: diagnosticHeadline(kind),
      diagnostic,
      candidateRevisionId,
      requestId: applicability.request?.id ?? envelope?.requestId ?? null,
      attemptId: applicability.attempt?.id ?? envelope?.attemptId ?? null,
      responseId: applicability.response?.id ?? envelope?.responseId ?? null,
      receivedAt: applicability.response?.payload?.receivedAt ?? null,
      rawRequest: applicability.request?.payload?.payload ?? null,
      rawResponse: envelope,
      unapplied,
    });
  }

  const evaluation = envelope?.rawEvaluation ?? null;
  const jobStatus = isKnownJobStatus(evaluation?.status) ? evaluation.status : null;
  const line = Array.isArray(evaluation?.lines) ? evaluation.lines[0] ?? null : null;
  const offering = copyOffering(envelope?.rawOffering);
  const stock = copyStock(line);
  const capability = copyCapability(line);
  const price = copyPrice(line);
  const estimate = copyEstimate(envelope);
  const basis = copyBasis(envelope);
  basis.receivedAt = displayOrMissing(applicability.response?.payload?.receivedAt);
  const reasons = capability?.missing?.length
    ? capability.missing
    : capability?.reason
      ? [capability.reason]
      : price?.reason
        ? [price.reason]
        : [];
  const current = applicability.current === true && jobStatus !== null;
  const historical = current ? false : applicability.historical === true || historicalUsable;

  return {
    kind: jobStatus ? 'store' : 'none',
    current,
    historical,
    pending: false,
    retryable: false,
    inspectable: true,
    headline: current ? COPY.storeCurrent : historical ? COPY.storeHistorical : COPY.storeUnavailable,
    label: current ? COPY.storeCurrent : COPY.storeHistorical,
    dispositionPlain: dispositionCopy(jobStatus),
    dispositionEnum: jobStatus,
    diagnostic: null,
    candidateRevisionId: candidateRevisionId ?? envelope?.candidateRevisionId ?? null,
    requestId: applicability.request?.id ?? envelope?.requestId ?? null,
    attemptId: applicability.attempt?.id ?? envelope?.attemptId ?? null,
    responseId: applicability.response?.id ?? envelope?.responseId ?? null,
    offering,
    stock,
    capability,
    price,
    estimate,
    q: estimate.q,
    qDisplay: estimate.qDisplay,
    basis,
    reasons,
    receivedAt: basis.receivedAt,
    sourceAsOf: basis.sourceAsOf,
    wrapperRespondedAt: basis.wrapperRespondedAt,
    rawRequest: applicability.request?.payload?.payload ?? envelope?.mappedCallInputs ?? null,
    rawResponse: envelope,
    unapplied,
    jobStatuses: STORE_JOB_STATUSES,
  };
}

export { APP_DIAGNOSTICS };
