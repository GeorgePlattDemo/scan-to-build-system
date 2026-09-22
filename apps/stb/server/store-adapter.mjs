import {
  BOARD_DEFINITION,
  PUBLISHED_BOARD_SKU,
  STORE_PIN,
  STORE_FRESH_EVALUATION_RULE_ID,
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
      instrumentation: { estimateCalls: 0, evaluationCalls: 0, travelCalls: 0 },
      dispatch: closedDispatch,
    };
  }

  const catalog = catalogOverride ?? loaded.modules.loadCatalog();
  const observations = observationsOverride ?? loaded.modules.loadObservations();
  const instrumentation = { estimateCalls: 0, evaluationCalls: 0, travelCalls: 0 };

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

  async function runDimensionalTravel(runtimeCatalog, demand) {
    instrumentation.travelCalls += 1;
    if (typeof hooks.beforeTravel === 'function') {
      await hooks.beforeTravel(demand);
    }
    return loaded.modules.evaluateDimensionalTravelJob(runtimeCatalog, demand);
  }

  async function runDimensionalStoreRequest(runtimeCatalog, demand, request, { reloadCurrentStore = true } = {}) {
    instrumentation.travelCalls += 1;
    if (typeof hooks.beforeTravel === 'function') {
      await hooks.beforeTravel(demand);
    }
    if (reloadCurrentStore) {
      return loaded.modules.requestDimensionalStoreEvaluation(demand, request);
    }
    return loaded.modules.evaluateDimensionalStoreRequest(runtimeCatalog, demand, request);
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

  async function handleUserDefinedBoardJob(envelope, jobPayload, options = {}) {
    const runtimeCatalog = options.catalogOverride ?? catalog;
    const line = jobPayload.line;
    const title = `User-defined Board · ${line.definedWorkpieceLengthIn} in workpiece`;

    // Governing anti-shortcut rule: every formal HTTP Store submission is a new
    // Store evaluation request. System sends the identified physical demand and
    // request identity; Store reloads current Store state and evaluates again.
    // System does not derive saw travel, spot cycles, machine time, Store rate,
    // capability, refusal, or Q locally, and no prior Store answer authorizes
    // this request.
    const travelInput = {
      title,
      configurationId: line.configurationId,
      configurationVersion: line.configurationVersion,
      classId: 'app.user-defined-board.v1',
      materialDemand: { ...line.materialDemand },
      definedWorkpieceLengthIn: line.definedWorkpieceLengthIn,
      requiredOps: [...line.requiredOps],
      sawAngleDeg: line.sawAngleDeg,
      cutPlane: line.cutPlane,
      datumCMethod: line.datumCMethod,
      declaredSawCuts: line.sawCuts,
      declaredSpotCount:
        line.spotDemand && Number.isFinite(Number(line.spotDemand.totalCount))
          ? Number(line.spotDemand.totalCount)
          : null,
      parts: structuredClone(line.parts),
      unresolvedConditions: [...(line.unresolvedConditions ?? [])],
      storeRevision: STORE_PIN,
    };

    const storeRequest = {
      requestId: envelope.requestId,
      evaluatedAt: nowIso(),
      storeRevision: STORE_PIN,
    };
    const reloadCurrentStore = catalogOverride === null && options.catalogOverride == null;

    let storeResult;
    try {
      storeResult = await runDimensionalStoreRequest(
        runtimeCatalog,
        travelInput,
        storeRequest,
        { reloadCurrentStore },
      );
    } catch (error) {
      return {
        status: 200,
        body: await successEnvelope(envelope, {
          rawOffering: null,
          materialResolution: null,
          rawEvaluation: {
            status: 'UNRESOLVED',
            complete: false,
            reason: ADAPTER_ERROR_CODES.ESTIMATE_FAILED,
          },
          rawEstimate: null,
          estimateAssociationId: null,
          estimateError: {
            code: ADAPTER_ERROR_CODES.ESTIMATE_FAILED,
            details: error instanceof Error ? error.message : String(error),
          },
          priceCompleteness: {
            status: 'UNAVAILABLE',
            unresolvedConditions: ['STORE_TRAVEL_EVALUATION_FAILED'],
            note: 'The governing Store travel evaluator did not return a result. No local fallback was used.',
          },
          calculationIdentity: null,
          evaluationReceipt: null,
          mappedCallInputs: {
            definition: {
              configurationId: line.configurationId,
              configurationVersion: line.configurationVersion,
              materialSource: line.materialSource,
              materialDemand: { ...line.materialDemand },
              definedWorkpieceLengthIn: line.definedWorkpieceLengthIn,
              productionSawCuts: line.sawCuts,
              sawAngleDeg: line.sawAngleDeg,
              drillCycles: line.drillCycles,
              drillDepthIn: line.drillDepthIn,
              cutPlane: line.cutPlane,
              endIdentity: line.endIdentity,
              endRelation: line.endRelation,
              lengthDatum: line.lengthDatum,
              datumCMethod: line.datumCMethod,
              parts: structuredClone(line.parts),
              spotDemand: line.spotDemand,
              unresolvedConditions: [...(line.unresolvedConditions ?? [])],
            },
            travel: travelInput,
            storeRequest,
          },
          attributedBasis: storeBasis({ modules: loaded.modules }),
        }),
      };
    }

    const rawEstimate = storeResult?.estimate ?? null;
    const materialResolution = storeResult?.materialResolution ?? null;
    const storeSku =
      materialResolution?.pricingReferenceSku ??
      materialResolution?.storeSku ??
      storeResult?.lines?.[0]?.storeSku ??
      null;
    const item = storeSku ? loaded.modules.findSku(runtimeCatalog, storeSku) : null;
    const offering = attributedOffering(item, runtimeCatalog, observations);

    const storeUnresolved = [
      ...(Array.isArray(rawEstimate?.unresolved) ? rawEstimate.unresolved : []),
      ...(Array.isArray(line.unresolvedConditions) ? line.unresolvedConditions : []),
    ];
    const uniqueUnresolved = [...new Set(storeUnresolved)];
    const freshReceipt = storeResult?.evaluationReceipt ?? null;
    const complete =
      storeResult?.status === 'SUPPORTABLE' &&
      storeResult?.freshEvaluation === true &&
      freshReceipt?.requestId === envelope.requestId &&
      freshReceipt?.freshnessRule === STORE_FRESH_EVALUATION_RULE_ID &&
      rawEstimate?.complete === true &&
      uniqueUnresolved.length === 0 &&
      rawEstimate?.calculationIdentity?.inputHash &&
      rawEstimate?.calculationIdentity?.resultHash;

    const priceCompleteness = {
      status: complete ? 'COMPLETE_FOR_TRAVEL_STANDARD' : rawEstimate ? 'PARTIAL' : 'UNAVAILABLE',
      unresolvedConditions: uniqueUnresolved,
      note: complete
        ? 'Complete Stage-2 dimensional Store answer under the governing travel standard. Budgetary only; not a commercial quote or fabrication authorization.'
        : 'No complete dimensional Q exists unless the governing Store travel evaluator returns a complete identified result.',
    };

    return {
      status: 200,
      body: await successEnvelope(envelope, {
        rawOffering: offering,
        materialResolution: materialResolution
          ? {
              ...materialResolution,
              materialDemand: { ...line.materialDemand },
              workpieceLengthIn: line.definedWorkpieceLengthIn,
            }
          : null,
        rawEvaluation: storeResult,
        rawEstimate,
        estimateAssociationId: rawEstimate?.calculationIdentity?.resultHash ?? null,
        estimateError: null,
        priceCompleteness,
        calculationIdentity: rawEstimate?.calculationIdentity ?? null,
        evaluationReceipt: freshReceipt,
        mappedCallInputs: {
          definition: {
            configurationId: line.configurationId,
            configurationVersion: line.configurationVersion,
            materialSource: line.materialSource,
            materialDemand: { ...line.materialDemand },
            definedWorkpieceLengthIn: line.definedWorkpieceLengthIn,
            productionSawCuts: line.sawCuts,
            sawAngleDeg: line.sawAngleDeg,
            drillCycles: line.drillCycles,
            drillDepthIn: line.drillDepthIn,
            cutPlane: line.cutPlane,
            endIdentity: line.endIdentity,
            endRelation: line.endRelation,
            lengthDatum: line.lengthDatum,
            datumCMethod: line.datumCMethod,
            parts: structuredClone(line.parts),
            spotDemand: line.spotDemand,
            unresolvedConditions: uniqueUnresolved,
          },
          travel: travelInput,
          storeRequest,
        },
        attributedBasis: storeBasis({
          modules: loaded.modules,
          offering,
          evaluation: storeResult,
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
    diagnosticDimensionalTravel(demand, runtimeCatalog = catalog) {
      return runDimensionalTravel(runtimeCatalog, demand);
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
