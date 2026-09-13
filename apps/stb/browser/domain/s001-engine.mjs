import { canonicalEqual } from '/shared/canonical.mjs';
import {
  S001_CENTERED_ARCH_CLASS_ID,
  S001_CENTERED_ARCH_CLASS_VERSION,
  S001_CENTERED_ARCH_DEFINITION_KIND,
  S001_CENTERED_ARCH_FIXED,
  S001_CENTERED_ARCH_RULE_VERSION,
  evaluateS001CenteredArchConfiguration,
} from '/shared/class-config.mjs';

function opaqueId() {
  return crypto.randomUUID();
}

function priorDefinition(previousDefinitions, occurrenceId) {
  if (previousDefinitions instanceof Map) return previousDefinitions.get(occurrenceId) ?? null;
  return null;
}

function definitionBasis(payload) {
  if (!payload) return null;
  return {
    occurrenceId: payload.occurrenceId,
    definitionKind: payload.definitionKind,
    ruleVersion: payload.ruleVersion,
    classId: payload.classId,
    classVersion: payload.classVersion,
    parent: payload.parent,
    workField: payload.workField,
    opening: payload.opening,
    requiredOps: payload.requiredOps,
    tabCountRequested: payload.tabCountRequested,
    routeDepthIn: payload.routeDepthIn,
    sheetDrillingThisRound: payload.sheetDrillingThisRound,
    labelingRequired: payload.labelingRequired,
    configurationBasis: payload.configurationBasis,
  };
}

function projectionPayload({ candidateRevisionId, configuration, evaluation, occurrenceId, definitionRevisionId }) {
  const valid = evaluation.valid === true;
  const unresolvedConditions = [
    ...(evaluation.unresolvedInputs ?? []),
    ...(evaluation.unresolvedConditions ?? []),
    ...(valid ? ['DURABLE_S001_STORE_CUSTODY_NOT_CONNECTED'] : []),
  ];
  return {
    derivationVersion: S001_CENTERED_ARCH_RULE_VERSION,
    definitionKind: S001_CENTERED_ARCH_DEFINITION_KIND,
    ruleVersion: S001_CENTERED_ARCH_RULE_VERSION,
    classId: S001_CENTERED_ARCH_CLASS_ID,
    classVersion: S001_CENTERED_ARCH_CLASS_VERSION,
    candidateRevisionId,
    valid,
    unresolvedReason: valid ? null : evaluation.unresolvedReason,
    unresolvedConditions,
    occurrenceIds: occurrenceId ? [occurrenceId] : [],
    definitionRevisionIds: definitionRevisionId ? [definitionRevisionId] : [],
    inputs: evaluation.inputs,
    geometry: evaluation.geometry,
    parts: valid
      ? [{
          occurrenceId,
          definitionRevisionId,
          label: 'Centered arched sheet project',
          quantity: 1,
          quantityUnit: 'ea',
          material: {
            form: 'sheet',
            storeSku: 'STB-ZERO-PLY-050-48X96-001',
            parentHorizontalIn: 96,
            parentVerticalIn: 48,
            nominalThicknessIn: 0.5,
          },
          requiredOps: ['ROUTE_PROFILE', 'RETAIN_TABS'],
          sheetDrillingThisRound: false,
          labelingRequired: true,
          physicalFabricationEligible: false,
        }]
      : [],
    materialDemand: valid
      ? {
          form: 'sheet',
          quantity: 1,
          quantityUnit: 'ea',
          storeSku: 'STB-ZERO-PLY-050-48X96-001',
          parentHorizontalIn: 96,
          parentVerticalIn: 48,
          nominalThicknessIn: 0.5,
        }
      : null,
    operationRequirements: valid
      ? {
          required: ['ROUTE_PROFILE', 'RETAIN_TABS'],
          sheetDrillingThisRound: false,
          tabRemovalSelective: true,
          labelingRequired: true,
        }
      : null,
    physicalFabricationEligible: false,
    productionAuthorization: false,
    machineReady: false,
    configurationBasis: configuration?.basis ?? 'manual-entry',
    request: {
      complete: valid,
      publishedJobId: valid ? 'arched-opening' : null,
      reason: valid
        ? 'Bounded S-001 demand is defined, but durable Store request/response custody is not connected to this mapped class yet.'
        : 'Class definition is incomplete.',
    },
    store: {
      connected: false,
      reason: 'Exact published-job Store proof exists separately; durable mapped-project Store custody is not connected in this build.',
      offering: null,
      price: null,
      availability: null,
      supportability: null,
    },
    summary: {
      title: valid ? 'One centered arched sheet project' : 'S-001 centered arched sheet definition is unresolved',
      parent: '96 × 48 in',
      workField: '48 × 36 in centered',
      opening: evaluation.geometry?.opening ?? null,
      localGate: evaluation.geometry?.localGate ?? null,
      configurationBasis: configuration?.basis ?? 'manual-entry',
      disclosure: 'Project geometry is not Store disposition, machine readiness, production release, or physical fabrication authority.',
    },
  };
}

export function planS001CenteredArchDerivation({
  candidateRevisionId,
  createdAt,
  projectId,
  payload,
  previousPayload = {},
  previousDefinitions = new Map(),
}) {
  const configuration = payload.configuration ?? null;
  const evaluation = evaluateS001CenteredArchConfiguration(configuration);
  const records = [];
  let occurrenceId = previousPayload.activeOccurrenceIds?.[0] ?? null;
  let definitionRevisionId = null;

  if (evaluation.valid) {
    if (!occurrenceId) {
      occurrenceId = opaqueId();
      records.push({
        kind: 'occurrence',
        id: occurrenceId,
        createdAt,
        payload: {
          projectId,
          introducedInRevisionId: candidateRevisionId,
          role: 'centered-arched-sheet-1',
          ordinal: 1,
          historicalOrigin: null,
        },
      });
    }

    const definitionContent = {
      occurrenceId,
      definitionKind: S001_CENTERED_ARCH_DEFINITION_KIND,
      ruleVersion: S001_CENTERED_ARCH_RULE_VERSION,
      classId: S001_CENTERED_ARCH_CLASS_ID,
      classVersion: S001_CENTERED_ARCH_CLASS_VERSION,
      parent: evaluation.geometry.parent,
      workField: evaluation.geometry.workField,
      opening: evaluation.geometry.opening,
      requiredOps: ['ROUTE_PROFILE', 'RETAIN_TABS'],
      tabCountRequested: S001_CENTERED_ARCH_FIXED.tabCount,
      routeDepthIn: S001_CENTERED_ARCH_FIXED.routeDepthIn,
      sheetDrillingThisRound: false,
      labelingRequired: true,
      configurationBasis: configuration?.basis ?? 'manual-entry',
      physicalFabricationEligible: false,
    };
    const prior = priorDefinition(previousDefinitions, occurrenceId);
    const priorPayload = prior?.payload ?? prior ?? null;
    if (priorPayload && canonicalEqual(definitionBasis(priorPayload), definitionBasis(definitionContent))) {
      definitionRevisionId = prior.id ?? previousPayload.definitionRevisionId ?? opaqueId();
    } else {
      definitionRevisionId = opaqueId();
      records.push({
        kind: 'definition',
        id: definitionRevisionId,
        createdAt,
        payload: {
          ...definitionContent,
          parentDefinitionRevisionId: prior?.id ?? null,
        },
      });
    }
  }

  const projectionId = opaqueId();
  records.push({
    kind: 'projection',
    id: projectionId,
    createdAt,
    payload: projectionPayload({
      candidateRevisionId,
      configuration,
      evaluation,
      occurrenceId,
      definitionRevisionId,
    }),
  });

  return {
    records,
    candidatePatch: {
      activeOccurrenceIds: occurrenceId ? [occurrenceId] : [],
      projectionId,
      definitionRevisionIds: definitionRevisionId ? [definitionRevisionId] : [],
      definitionRevisionId,
      definitionKind: S001_CENTERED_ARCH_DEFINITION_KIND,
      ruleVersion: S001_CENTERED_ARCH_RULE_VERSION,
      unresolved: !evaluation.valid || evaluation.unresolvedConditions.length > 0 || true,
      parts: definitionRevisionId
        ? [{ occurrenceId, definitionRevisionId, label: 'Centered arched sheet project' }]
        : [],
      dimensions: evaluation.geometry?.opening ?? null,
      material: evaluation.valid
        ? {
            form: 'sheet',
            storeSku: 'STB-ZERO-PLY-050-48X96-001',
            status: 'published-bounded-reference',
          }
        : null,
    },
  };
}
