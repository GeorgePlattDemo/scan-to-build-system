import {
  START_OWN_STORE_PIN,
  START_OWN_STORE_PROTOCOL_VERSION,
  START_OWN_STORE_REQUEST_TYPE,
  START_OWN_STORE_SCOPE,
  validateStartOwnStoreRequest,
} from '../shared/start-own-store-wire.mjs';
import { loadStartOwnStoreModules, startOwnStoreRootFromEnv } from './start-own-store-source.mjs';

function nowIso() {
  return new Date().toISOString();
}

function errorEnvelope(code, details, request = null) {
  return {
    protocolVersion: START_OWN_STORE_PROTOCOL_VERSION,
    storePin: START_OWN_STORE_PIN,
    adapterError: true,
    code,
    details: details ?? null,
    requestId: request?.requestId ?? null,
    projectId: request?.projectId ?? null,
    definitionId: request?.definitionId ?? null,
    requestType: request?.requestType ?? null,
    scope: request?.scope ?? null,
    demandSignature: request?.demandSignature ?? null,
    payloadDigest: request?.payloadDigest ?? null,
    attemptId: request?.attemptId ?? null,
    attemptNumber: request?.attemptNumber ?? null,
  };
}

function attributedOffering(item, catalog, observations) {
  if (!item) return null;
  const observationId = item.observationId ?? null;
  const observation = observationId && Array.isArray(observations?.observations)
    ? observations.observations.find((entry) => entry.id === observationId) ?? null
    : null;
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
    sellingPrice: item.sellingPrice ?? null,
    priceBasis: item.priceBasis ?? null,
    onHand: item.onHand ?? null,
    allocated: item.allocated ?? null,
    assertions: item.assertions ?? null,
    observationId,
    observation,
    catalogClock: catalog?.clock ?? null,
  };
}

export async function createStartOwnStoreAdapter({
  storeRoot = startOwnStoreRootFromEnv(),
  catalogOverride = null,
  observationsOverride = null,
} = {}) {
  const loaded = await loadStartOwnStoreModules(storeRoot);
  if (!loaded.ok) {
    return {
      ready: false,
      inspection: loaded.inspection,
      async dispatch(body) {
        return {
          status: 503,
          body: errorEnvelope(
            loaded.inspection?.code ?? 'STORE_SOURCE_UNAVAILABLE',
            loaded.inspection?.details ?? null,
            body && typeof body === 'object' ? body : null,
          ),
        };
      },
    };
  }

  const catalog = catalogOverride ?? loaded.modules.loadCatalog();
  const observations = observationsOverride ?? loaded.modules.loadObservations();

  async function dispatch(body) {
    const checked = await validateStartOwnStoreRequest(body);
    if (!checked.ok) {
      const status = checked.code === 'STORE_PIN_MISMATCH' ? 503 : 422;
      return { status, body: errorEnvelope(checked.code, checked.details, body) };
    }

    const rawEvaluation = loaded.modules.evaluateUserDefinedBoardJob(catalog, checked.payload);
    const material = rawEvaluation?.materialResolution ?? null;
    const item = material?.storeSku ? loaded.modules.findSku(catalog, material.storeSku) : null;
    const rawEstimate = rawEvaluation?.estimate ?? null;

    return {
      status: 200,
      body: {
        protocolVersion: START_OWN_STORE_PROTOCOL_VERSION,
        storePin: START_OWN_STORE_PIN,
        requestId: body.requestId,
        projectId: body.projectId,
        definitionId: body.definitionId,
        requestType: START_OWN_STORE_REQUEST_TYPE,
        scope: START_OWN_STORE_SCOPE,
        demandSignature: body.demandSignature,
        payloadDigest: body.payloadDigest,
        attemptId: body.attemptId,
        attemptNumber: body.attemptNumber,
        wrapperRespondedAt: nowIso(),
        rawOffering: attributedOffering(item, catalog, observations),
        rawEvaluation,
        rawEstimate,
        attributedBasis: {
          pricingEngine: {
            id: loaded.modules.ENGINE.id,
            version: loaded.modules.ENGINE.version,
            clock: loaded.modules.ENGINE.clock ?? null,
          },
          cycleModel: {
            id: loaded.modules.CYCLE_MODEL.id,
            basis: loaded.modules.CYCLE_MODEL.basis,
            measured: loaded.modules.CYCLE_MODEL.measured === true,
            commissioned: loaded.modules.CYCLE_MODEL.commissioned === true,
          },
          envelope: {
            id: loaded.modules.D001_STAGE2_ENVELOPE.id,
            basis: loaded.modules.D001_STAGE2_ENVELOPE.basis,
            measured: loaded.modules.D001_STAGE2_ENVELOPE.measured === true,
            commissioned: loaded.modules.D001_STAGE2_ENVELOPE.commissioned === true,
          },
          budgetaryEstimateIsNotAQuote: true,
          modeledTimeIsNotAMachineWorkPlan: true,
        },
        physicalExecutionAuthorized: false,
        controllerOutputProduced: false,
      },
    };
  }

  return {
    ready: true,
    inspection: loaded.inspection,
    modules: loaded.modules,
    catalog,
    observations,
    dispatch,
  };
}
