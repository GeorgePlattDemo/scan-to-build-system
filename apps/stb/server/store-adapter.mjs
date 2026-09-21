import {
  BOARD_DEFINITION,
  PUBLISHED_BOARD_SKU,
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
    if (offered && offered.storeSku !== PUBLISHED_BOARD_SKU && offeringPayload.kind === 'sku') {
      return {
        status: 422,
        body: adapterErrorBody(
          ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE,
          'offering lookup accepts only the published Board SKU',
          envelope,
        ),
      };
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

  async async function handleUserDefinedBoardJob(envelope, jobPayload, options = {}) {
    const runtimeCatalog = options.catalogOverride ?? catalog;
    const line = jobPayload.line;
    const storeSku = line.storeSku;
    const item = loaded.modules.findSku(runtimeCatalog, storeSku);

    if (item && storeSku !== PUBLISHED_BOARD_SKU) {
      return {
        status: 422,
        body: adapterErrorBody(
          ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE,
          'a known different offering is outside the current user-defined Board endpoint',
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

    const title = `User-defined Board · ${line.definedWorkpieceLengthIn} in workpiece`;
    const evaluateInput = {
      title,
      lines: [
        {
          storeSku,
          qty: 1,
          requiredOps: [...line.requiredOps],
          keptLengthIn: line.definedWorkpieceLengthIn,
        },
      ],
    };
    const rawEvaluation = await runEvaluation(runtimeCatalog, evaluateInput);
    const evaluateDigest = await digestCanonical(evaluateInput);
    const offering = attributedOffering(item, runtimeCatalog, observations);

    const preparationSawCuts =
      line.materialSource === 'STORE_ZERO' &&
      item &&
      Number.isFinite(Number(item.stockL_in)) &&
      Number(item.stockL_in) > line.definedWorkpieceLengthIn
        ? 1
        : 0;
    const totalModeledSawCuts = line.sawCuts + preparationSawCuts;
    const unresolvedConditions = [...(line.unresolvedConditions ?? [])];

    let rawEstimate = null;
    let estimateInput = null;
    let estimateDigest = null;
    let estimateAssociationId = null;
    let estimateError = null;

    if (rawEvaluation.status === 'SUPPORTABLE' && item) {
      const angleRadians = (line.sawAngleDeg * Math.PI) / 180;
      const sawTraverseIn =
        line.sawAngleDeg > 0 ? item.actualW / Math.cos(angleRadians) : item.actualW;
      estimateInput = {
        title,
        classId: 'app.user-defined-board.v1',
        pieces: [
          {
            storeSku: item.storeSku,
            qty: 1,
            keptLengthIn: line.definedWorkpieceLengthIn,
            widthIn: item.actualW,
            sawCuts: totalModeledSawCuts,
            sawTraverseIn,
            holes: line.drillCycles,
            depthIn: line.drillCycles > 0 ? line.drillDepthIn : 0,
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

    const priceCompleteness = {
      status:
        rawEstimate && unresolvedConditions.length === 0
          ? 'COMPLETE_FOR_ENCODED_DEMAND'
          : rawEstimate
            ? 'PARTIAL'
            : 'UNAVAILABLE',
      unresolvedConditions,
      note:
        unresolvedConditions.length > 0
          ? 'The Store value models only the resolved encoded operations. Unresolved work is not silently converted into a priced operation.'
          : 'The Store value models the encoded demand only. It is a Stage-2 BudgetaryEstimate, not a commercial quote.',
    };

    return {
      status: 200,
      body: await successEnvelope(envelope, {
        rawOffering: offering,
        rawEvaluation,
        rawEstimate,
        estimateAssociationId,
        estimateError,
        priceCompleteness,
        mappedCallInputs: {
          definition: {
            materialSource: line.materialSource,
            rawStockLengthIn: item?.stockL_in ?? null,
            definedWorkpieceLengthIn: line.definedWorkpieceLengthIn,
            preparation: {
              required: preparationSawCuts > 0,
              sawCuts: preparationSawCuts,
              source:
                preparationSawCuts > 0
                  ? 'Store raw stock is longer than the identified workpiece'
                  : 'No Store raw-stock preparation cut modeled',
            },
            productionSawCuts: line.sawCuts,
            totalModeledSawCuts,
            sawAngleDeg: line.sawAngleDeg,
            drillCycles: line.drillCycles,
            drillDepthIn: line.drillDepthIn,
            cutPlane: line.cutPlane,
            endIdentity: line.endIdentity,
            endRelation: line.endRelation,
            lengthDatum: line.lengthDatum,
            spotDemand: line.spotDemand,
            unresolvedConditions,
          },
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
  }) {
    const runtimeCatalog = options.catalogOverride ?? catalog;
    const line = jobPayload.line;
    const storeSku = line.storeSku;
    const item = loaded.modules.findSku(runtimeCatalog, storeSku);

    if (item && storeSku !== PUBLISHED_BOARD_SKU) {
      return {
        status: 422,
        body: adapterErrorBody(
          ADAPTER_ERROR_CODES.INVALID_BOUNDED_SCOPE,
          'a known different offering is outside the current user-defined Board endpoint',
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

    const title = `User-defined Board · ${line.definedWorkpieceLengthIn} in workpiece`;
    const evaluateInput = {
      title,
      lines: [
        {
          storeSku,
          qty: 1,
          requiredOps: [...line.requiredOps],
          keptLengthIn: line.definedWorkpieceLengthIn,
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
      const angleRadians = (line.sawAngleDeg * Math.PI) / 180;
      const sawTraverseIn =
        line.sawAngleDeg > 0 ? item.actualW / Math.cos(angleRadians) : item.actualW;
      estimateInput = {
        title,
        classId: 'app.user-defined-board.v1',
        pieces: [
          {
            storeSku: item.storeSku,
            qty: 1,
            keptLengthIn: line.definedWorkpieceLengthIn,
            widthIn: item.actualW,
            sawCuts: line.sawCuts,
            sawTraverseIn,
            holes: line.drillCycles,
            depthIn: 0.75,
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
          definition: {
            definedWorkpieceLengthIn: line.definedWorkpieceLengthIn,
            sawCuts: line.sawCuts,
            sawAngleDeg: line.sawAngleDeg,
            drillCycles: line.drillCycles,
          },
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
    if (validated.requestType === STORE_REQUEST_TYPES.OFFERING_LOOKUP) {
      return handleOffering(validated.envelope, validated.payload);
    }
    if (validated.requestType === STORE_REQUEST_TYPES.USER_DEFINED_BOARD_V1) {
      return handleUserDefinedBoardJob(validated.envelope, validated.payload);
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
    handleUserDefinedBoardJob: (envelope, payload, options) =>
      handleUserDefinedBoardJob(envelope, payload, options),
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
