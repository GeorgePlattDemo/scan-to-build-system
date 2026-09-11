import {
  BOARD_DEFINITION,
  PUBLISHED_BOARD_SKU,
  PUBLISHED_SHEET_SKU,
  STORE_PIN,
  STORE_PROTOCOL_VERSION,
  STORE_REQUEST_TYPES,
  WRAPPER_BUILD_ID,
} from '../shared/contracts.mjs';
import {
  ADAPTER_ERROR_CODES,
  adapterErrorBody,
  correlationFields,
  digestCanonical,
  httpStatusForAdapterCode,
  validateWireRequest,
} from '../shared/store-wire.mjs';
import { loadPinnedStoreModules, storeRootFromEnv } from './store-source.mjs';

function nowIso() {
  return new Date().toISOString();
}

function opaqueId() {
  return crypto.randomUUID();
}

function offeringAttributesComplete(item) {
  if (!item || item.offered !== true) {
    return false;
  }
  if (item.form === 'sheet') {
    if (typeof item.actualT !== 'number' || !Number.isFinite(item.actualT)) {
      return false;
    }
    if (typeof item.sheetW_in !== 'number' || !Number.isFinite(item.sheetW_in)) {
      return false;
    }
    if (typeof item.sheetL_in !== 'number' || !Number.isFinite(item.sheetL_in)) {
      return false;
    }
    if (typeof item.uom !== 'string' || item.uom.length === 0) {
      return false;
    }
    if (!Array.isArray(item.supportedOps)) {
      return false;
    }
    if (!Array.isArray(item.cellFamily) || !item.cellFamily.includes('S-001')) {
      return false;
    }
    return true;
  }
  if (item.form !== 'board') {
    return false;
  }
  if (typeof item.actualW !== 'number' || !Number.isFinite(item.actualW)) {
    return false;
  }
  if (typeof item.actualT !== 'number' || !Number.isFinite(item.actualT)) {
    return false;
  }
  if (typeof item.stockL_in !== 'number' || !Number.isFinite(item.stockL_in)) {
    return false;
  }
  if (typeof item.uom !== 'string' || item.uom.length === 0) {
    return false;
  }
  if (!Array.isArray(item.supportedOps)) {
    return false;
  }
  if (!Array.isArray(item.cellFamily) || !item.cellFamily.includes('D-001')) {
    return false;
  }
  return true;
}

function observationReference(observations, observationId) {
  if (!observationId || !observations || !Array.isArray(observations.observations)) {
    return null;
  }
  const found = observations.observations.find((entry) => entry.id === observationId);
  if (!found) {
    return null;
  }
  return {
    id: found.id,
    desc: found.desc ?? null,
    mapsTo: found.mapsTo ?? null,
    uom: found.uom ?? null,
  };
}

function attributedOffering(item, catalog, observations) {
  if (!item) {
    return null;
  }
  return {
    storeSku: item.storeSku,
    description: item.description ?? null,
    form: item.form ?? null,
    species: item.species ?? null,
    grade: item.grade ?? null,
    nominalT: item.nominalT ?? null,
    nominalW: item.nominalW ?? null,
    actualT: item.actualT ?? null,
    actualW: item.actualW ?? null,
    stockL_in: item.stockL_in ?? null,
    sheetW_in: item.sheetW_in ?? null,
    sheetL_in: item.sheetL_in ?? null,
    uom: item.uom ?? null,
    offered: item.offered === true,
    supportedOps: item.supportedOps ?? null,
    cellFamily: item.cellFamily ?? null,
    limitations: item.limitations ?? [],
    list_reference: item.list_reference ?? null,
    listReferenceBasis: item.listReferenceBasis ?? null,
    mark_on: item.mark_on ?? null,
    sellingPrice: item.sellingPrice ?? null,
    priceBasis: item.priceBasis ?? null,
    onHand: item.onHand ?? null,
    allocated: item.allocated ?? null,
    supplierPath: item.supplierPath ?? null,
    assertions: item.assertions ?? null,
    observationId: item.observationId ?? null,
    observation: observationReference(observations, item.observationId ?? null),
    catalogClock: catalog?.clock ?? null,
  };
}

function storeBasis({ modules, offering, evaluation, estimate }) {
  const line = evaluation?.lines?.[0] ?? null;
  const envelope = line?.capability?.envelope ?? null;
  return {
    pricingEngine: modules?.ENGINE
      ? { id: modules.ENGINE.id, version: modules.ENGINE.version, clock: modules.ENGINE.clock ?? null }
      : estimate?.engine ?? null,
    cycleModel: modules?.CYCLE_MODEL
      ? {
          id: modules.CYCLE_MODEL.id,
          basis: modules.CYCLE_MODEL.basis,
          measured: modules.CYCLE_MODEL.measured === true,
          commissioned: modules.CYCLE_MODEL.commissioned === true,
        }
      : estimate?.cycle
        ? { id: estimate.cycle.model, basis: estimate.cycle.basis, measured: estimate.cycle.measured === true }
        : null,
    envelope: modules?.D001_STAGE2_ENVELOPE
      ? {
          id: modules.D001_STAGE2_ENVELOPE.id,
          basis: modules.D001_STAGE2_ENVELOPE.basis,
          measured: modules.D001_STAGE2_ENVELOPE.measured === true,
          commissioned: modules.D001_STAGE2_ENVELOPE.commissioned === true,
        }
      : envelope
        ? { id: envelope.envelope ?? envelope.id ?? null }
        : null,
    sheetEnvelope: modules?.S001_MODE2_ENVELOPE
      ? {
          id: modules.S001_MODE2_ENVELOPE.id,
          capabilityId: modules.S001_MODE2_ENVELOPE.capabilityId,
          evidenceClass: modules.S001_MODE2_ENVELOPE.evidenceClass,
          measured: modules.S001_MODE2_ENVELOPE.measured === true,
          commissioned: modules.S001_MODE2_ENVELOPE.commissioned === true,
          physicalStatus: modules.S001_MODE2_ENVELOPE.physicalStatus,
        }
      : null,
    assertionBasis: offering?.assertions ?? line?.stock?.assertions ?? null,
    observationId: offering?.observationId ?? line?.price?.observationId ?? null,
    sourceClock:
      offering?.catalogClock ??
      line?.price?.asOf ??
      line?.stock?.asOf ??
      null,
    measured: false,
    commissioned: false,
    budgetaryEstimateIsNotAQuote: true,
    modeledTimeIsNotAMachineWorkPlan: true,
  };
}

function lookupItem(modules, catalog, offeringPayload) {
  if (offeringPayload.kind === 'sku') {
    return modules.findSku(catalog, offeringPayload.storeSku);
  }
  const matches = modules.offerMaterial(catalog, offeringPayload.query);
  if (!Array.isArray(matches) || matches.length !== 1) {
    return null;
  }
  return matches[0];
}

export async function createStoreAdapter({
  storeRoot = storeRootFromEnv(),
  catalogOverride = null,
  observationsOverride = null,
  hooks = {},
} = {}) {
  const loaded = await loadPinnedStoreModules(storeRoot);
  async function closedDispatch(body) {
    return {
      status: 503,
      body: adapterErrorBody(
        loaded.inspection.code,
        loaded.inspection.details,
        body && typeof body === 'object' ? body : null,
      ),
    };
  }

  if (!loaded.ok) {
    return {
      ready: false,
      inspection: loaded.inspection,
      modules: null,
      catalog: null,
      observations: null,
      instrumentation: { estimateCalls: 0, evaluationCalls: 0 },
      dispatch: closedDispatch,
    };
  }

  const catalog = catalogOverride ?? loaded.modules.loadCatalog();
  const observations = observationsOverride ?? loaded.modules.loadObservations();
  const instrumentation = { estimateCalls: 0, evaluationCalls: 0 };

  async function successEnvelope(envelope, fields) {
    return {
      protocolVersion: STORE_PROTOCOL_VERSION,
      wrapperBuildId: WRAPPER_BUILD_ID,
      storePin: STORE_PIN,
      ...correlationFields(envelope),
      wrapperRespondedAt: nowIso(),
      responseId: opaqueId(),
      ...fields,
    };
  }

  async function handleOffering(envelope, offeringPayload, runtimeCatalog = catalog) {
    const item = lookupItem(loaded.modules, runtimeCatalog, offeringPayload);
    const offered = item && item.offered === true ? item : null;
    if (offered && offeringPayload.kind === 'sku') {
      if (offered.storeSku !== PUBLISHED_BOARD_SKU && offered.storeSku !== PUBLISHED_SHEET_SKU) {
        return {
          status: 422,
          body: adapterErrorBody(
            ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE,
            'offering lookup accepts only the published Board SKU or published sheet SKU',
            envelope,
          ),
        };
      }
    }
    const rawOffering = attributedOffering(offered, runtimeCatalog, observations);
    return {
      status: 200,
      body: await successEnvelope(envelope, {
        rawOffering,
        found: rawOffering !== null,
        mappedCallInputs: {
          offering: offeringPayload.kind === 'sku'
            ? { storeSku: offeringPayload.storeSku }
            : { query: offeringPayload.query },
        },
        attributedBasis: storeBasis({ modules: loaded.modules, offering: rawOffering }),
      }),
    };
  }

  async function runEvaluation(runtimeCatalog, spec) {
    instrumentation.evaluationCalls += 1;
    return loaded.modules.evaluateJob(runtimeCatalog, spec);
  }

  async function runEstimate(runtimeCatalog, spec) {
    instrumentation.estimateCalls += 1;
    if (hooks.failEstimate) {
      throw new Error('injected estimate failure');
    }
    if (typeof hooks.beforeEstimate === 'function') {
      await hooks.beforeEstimate(spec);
    }
    return loaded.modules.estimateJob(runtimeCatalog, spec);
  }

  async function handleJob(envelope, jobPayload, options = {}) {
    const runtimeCatalog = options.catalogOverride ?? catalog;
    const storeSku = jobPayload.line.storeSku;
    const item = loaded.modules.findSku(runtimeCatalog, storeSku);

    if (item && storeSku !== PUBLISHED_BOARD_SKU) {
      return {
        status: 422,
        body: adapterErrorBody(
          ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE,
          'a known different offering is outside the published Board endpoint',
          envelope,
        ),
      };
    }

    if (item && !offeringAttributesComplete(item)) {
      return {
        status: 422,
        body: adapterErrorBody(
          ADAPTER_ERROR_CODES.OFFERING_INCOMPLETE,
          'selected offering is missing required Store attributes',
          envelope,
        ),
      };
    }

    const title = `Board square-cut ${jobPayload.line.keptLengthIn} in`;
    const evaluateInput = {
      title,
      lines: [
        {
          storeSku,
          qty: 1,
          requiredOps: ['CROSSCUT'],
          keptLengthIn: jobPayload.line.keptLengthIn,
        },
      ],
    };
    const rawEvaluation = await runEvaluation(runtimeCatalog, evaluateInput);
    const evaluateDigest = await digestCanonical(evaluateInput);
    const offering = attributedOffering(item, runtimeCatalog, observations);

    let rawEstimate = null;
    let estimateInput = null;
    let estimateDigest = null;
    let estimateAssociationId = null;
    let estimateError = null;

    if (rawEvaluation.status === 'SUPPORTABLE' && item) {
      estimateInput = {
        title,
        classId: 'app.board.square.v1',
        pieces: [
          {
            storeSku: item.storeSku,
            qty: 1,
            keptLengthIn: jobPayload.line.keptLengthIn,
            widthIn: item.actualW,
          },
        ],
      };
      try {
        rawEstimate = await runEstimate(runtimeCatalog, estimateInput);
        estimateDigest = await digestCanonical(estimateInput);
        estimateAssociationId = opaqueId();
      } catch (error) {
        rawEstimate = null;
        estimateError = {
          code: ADAPTER_ERROR_CODES.ESTIMATE_FAILED,
          details: error instanceof Error ? error.message : String(error),
        };
      }
    }

    return {
      status: 200,
      body: await successEnvelope(envelope, {
        rawOffering: offering,
        rawEvaluation,
        rawEstimate,
        estimateAssociationId,
        estimateError,
        mappedCallInputs: {
          evaluation: evaluateInput,
          evaluationDigest: evaluateDigest,
          estimate: estimateInput,
          estimateDigest,
        },
        attributedBasis: storeBasis({
          modules: loaded.modules,
          offering,
          evaluation: rawEvaluation,
          estimate: rawEstimate,
        }),
      }),
    };
  }

  async function handleSheetJob(envelope, jobPayload, options = {}) {
    const runtimeCatalog = options.catalogOverride ?? catalog;
    const storeSku = jobPayload.line.storeSku;
    const item = loaded.modules.findSku(runtimeCatalog, storeSku);

    if (item && storeSku !== PUBLISHED_SHEET_SKU) {
      return {
        status: 422,
        body: adapterErrorBody(
          ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE,
          'a known different offering is outside the published sheet endpoint',
          envelope,
        ),
      };
    }

    if (item && !offeringAttributesComplete(item)) {
      return {
        status: 422,
        body: adapterErrorBody(
          ADAPTER_ERROR_CODES.OFFERING_INCOMPLETE,
          'selected offering is missing required Store attributes',
          envelope,
        ),
      };
    }

    const title = `Sheet Mode-2 ${jobPayload.line.profileKind}`;
    const evaluateInput = {
      title,
      line: {
        storeSku,
        qty: 1,
        profileKind: jobPayload.line.profileKind,
        blankL_in: jobPayload.line.blankL_in,
        blankW_in: jobPayload.line.blankW_in,
        tabCount: jobPayload.line.tabCount,
        routeDepthIn: jobPayload.line.routeDepthIn,
      },
    };
    instrumentation.evaluationCalls += 1;
    const rawEvaluation = loaded.modules.evaluateSheetMode2Job(runtimeCatalog, evaluateInput);
    const evaluateDigest = await digestCanonical(evaluateInput);
    const offering = attributedOffering(item, runtimeCatalog, observations);

    let rawEstimate = null;
    let estimateInput = null;
    let estimateDigest = null;
    let estimateAssociationId = null;
    let estimateError = null;
    if (rawEvaluation.status === 'SUPPORTABLE' && item) {
      estimateInput = { title, line: evaluateInput.line };
      try {
        instrumentation.estimateCalls += 1;
        rawEstimate = loaded.modules.estimateSheetMode2Job(runtimeCatalog, estimateInput);
        estimateDigest = await digestCanonical(estimateInput);
        estimateAssociationId = opaqueId();
      } catch (error) {
        rawEstimate = null;
        estimateError = {
          code: ADAPTER_ERROR_CODES.ESTIMATE_FAILED,
          details: error instanceof Error ? error.message : String(error),
        };
      }
    }

    return {
      status: 200,
      body: await successEnvelope(envelope, {
        rawOffering: offering,
        rawEvaluation,
        rawEstimate,
        estimateAssociationId,
        estimateError,
        mappedCallInputs: {
          evaluation: evaluateInput,
          evaluationDigest: evaluateDigest,
          estimate: estimateInput,
          estimateDigest,
        },
        attributedBasis: storeBasis({
          modules: loaded.modules,
          offering,
          evaluation: rawEvaluation,
          estimate: rawEstimate,
        }),
      }),
    };
  }

  async function dispatch(body) {
    const validated = await validateWireRequest(body);
    if (!validated.ok) {
      return {
        status: httpStatusForAdapterCode(validated.code),
        body: adapterErrorBody(validated.code, validated.details, body),
        code: validated.code,
      };
    }
    if (validated.requestType === 'OFFERING_LOOKUP') {
      return handleOffering(validated.envelope, validated.payload);
    }
    if (validated.requestType === STORE_REQUEST_TYPES.SHEET_MODE2_STENCIL_V1) {
      return handleSheetJob(validated.envelope, validated.payload);
    }
    return handleJob(validated.envelope, validated.payload);
  }

  return {
    ready: true,
    inspection: loaded.inspection,
    modules: loaded.modules,
    catalog,
    observations,
    instrumentation,
    handleOffering: (envelope, payload, runtimeCatalog) =>
      handleOffering(envelope, payload, runtimeCatalog),
    handleJob: (envelope, payload, options) => handleJob(envelope, payload, options),
    dispatch,
    diagnosticEvaluateJob(spec, runtimeCatalog = catalog) {
      return runEvaluation(runtimeCatalog, spec);
    },
    diagnosticEstimateJob(spec, runtimeCatalog = catalog) {
      return runEstimate(runtimeCatalog, spec);
    },
    cloneCatalog() {
      return structuredClone(catalog);
    },
  };
}

export function unavailableAdapter(inspection) {
  return {
    ready: false,
    inspection,
    modules: null,
    catalog: null,
    observations: null,
    instrumentation: { estimateCalls: 0, evaluationCalls: 0 },
    async dispatch(body) {
      return {
        status: 503,
        body: adapterErrorBody(
          inspection?.code ?? ADAPTER_ERROR_CODES.STORE_SOURCE_UNAVAILABLE,
          inspection?.details ?? 'Store source is unavailable',
          body && typeof body === 'object' ? body : null,
        ),
      };
    },
  };
}

export { BOARD_DEFINITION, PUBLISHED_BOARD_SKU };
