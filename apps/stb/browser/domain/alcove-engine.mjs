import { canonicalEqual } from '/shared/canonical.mjs';
import {
  ALCOVE_CLASS_ID,
  ALCOVE_CLASS_VERSION,
  ALCOVE_DEFINITION_KIND,
  ALCOVE_RULE_VERSION,
  evaluateAlcoveConfiguration,
} from '/shared/alcove-rule.mjs';

function opaqueId() {
  return crypto.randomUUID();
}

function priorDefinitionForOccurrence(previousDefinitions, occurrenceId) {
  if (!previousDefinitions) return null;
  if (previousDefinitions instanceof Map) {
    return previousDefinitions.get(occurrenceId) ?? null;
  }
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
    role: payload.role,
    ordinal: payload.ordinal,
    length: payload.length,
    depth: payload.depth,
    thickness: payload.thickness,
    quantity: payload.quantity,
    quantityUnit: payload.quantityUnit,
    referenceOperations: payload.referenceOperations,
    configurationBasis: payload.configurationBasis,
    physicalFabricationEligible: payload.physicalFabricationEligible,
  };
}

function buildRenderModel(parts, evaluation) {
  return {
    kind: 'orthographic-project-v1',
    projection: 'schematic-blank-stack',
    schematic: true,
    note: 'Blank rows are stacked for inspection only. User 1 shelf elevations and back choices are carried as holder configuration and are not silently promoted to machine instructions.',
    openingWidth: evaluation.inputs.openingWidth?.canonical ?? null,
    supportLeft: evaluation.inputs.leftSupport?.canonical ?? null,
    supportRight: evaluation.inputs.rightSupport?.canonical ?? null,
    derivedSpan: evaluation.derived.span?.canonical ?? null,
    shelfHeights: evaluation.inputs.shelfHeights?.canonical ?? [],
    materialPreference: evaluation.inputs.materialPreference?.canonical ?? null,
    backRequirement: evaluation.backRequirement ?? null,
    parts: parts.map((part) => ({
      occurrenceId: part.occurrenceId,
      definitionRevisionId: part.definitionRevisionId,
      label: part.label,
      length: part.length.canonical,
      depth: part.depth.canonical,
      thickness: part.thickness.canonical,
    })),
  };
}

function buildProjectionPayload({
  candidateRevisionId,
  configuration,
  evaluation,
  parts,
  occurrenceIds,
  definitionRevisionIds,
}) {
  const valid = evaluation.valid === true;
  const unresolvedConditions = [
    ...(evaluation.unresolvedInputs ?? []),
    ...(evaluation.unresolvedConditions ?? []),
  ];
  const materialPreference = evaluation.inputs.materialPreference?.canonical ?? null;
  const shelfHeights = evaluation.inputs.shelfHeights?.canonical ?? [];
  const backRequirement = evaluation.backRequirement ?? null;
  const backRequired = backRequirement?.style && backRequirement.style !== 'none';
  const recessedBack = backRequirement?.style === 'recessed';
  return {
    derivationVersion: ALCOVE_RULE_VERSION,
    definitionKind: ALCOVE_DEFINITION_KIND,
    ruleVersion: ALCOVE_RULE_VERSION,
    classId: ALCOVE_CLASS_ID,
    classVersion: ALCOVE_CLASS_VERSION,
    candidateRevisionId,
    valid,
    unresolvedReason: valid ? null : evaluation.unresolvedReason,
    unresolvedConditions,
    occurrenceIds,
    definitionRevisionIds,
    inputs: evaluation.inputs,
    derived: evaluation.derived,
    placementPreferences: valid
      ? {
          shelfHeights,
          basis: 'holder-configuration',
          authority: false,
          note: 'Shelf heights are User 1 placement preferences. They do not change blank length and do not create installation or structural authority.',
        }
      : null,
    backRequirement: valid ? backRequirement : null,
    parts,
    materialDemand: valid
      ? {
          form: 'sheet',
          quantity: parts.length,
          quantityUnit: 'ea',
          blank: {
            length: evaluation.derived.span,
            depth: evaluation.inputs.blankDepth,
            thickness: evaluation.inputs.blankThickness,
          },
          materialPreference,
          back: backRequired
            ? {
                required: true,
                material: backRequirement.material,
                materialLabel: backRequirement.materialLabel,
                veneerSpecies: backRequirement.veneerSpecies,
                geometryStatus: backRequirement.geometryStatus,
                sku: null,
                status: 'preference-unresolved',
              }
            : { required: false },
          species: null,
          grade: null,
          sku: null,
          status: 'preference-unresolved',
        }
      : null,
    operationRequirements: valid
      ? {
          status: 'reference-only',
          sequence: ['simulate_crosscut', 'simulate_shelf_blank'],
          requiredFeatures: [
            ...(backRequired ? ['back-panel'] : []),
            ...(recessedBack ? ['recessed-back-seat'] : []),
          ],
          sourceMeaning: 'User-visible finished choices are carried as requirements only. They are not application-issued process plans or machine instructions.',
        }
      : null,
    physicalFabricationEligible: false,
    productionAuthorization: false,
    machineReady: false,
    configurationBasis: configuration?.basis ?? 'manual-entry',
    render: buildRenderModel(parts, evaluation),
    summary: {
      title: valid ? `${parts.length} candidate shelf blank${parts.length === 1 ? '' : 's'}` : 'Alcove shelf-blank definition is unresolved',
      formula: 'nominal interior span = opening width - left support - right support',
      span: evaluation.derived.span?.canonical ?? null,
      depth: evaluation.inputs.blankDepth?.canonical ?? null,
      thickness: evaluation.inputs.blankThickness?.canonical ?? null,
      quantity: evaluation.inputs.shelfCount?.canonical ?? null,
      quantityUnit: 'ea',
      shelfHeights,
      materialPreference,
      back: backRequirement,
      orderedUnitAdjustment: null,
      configurationBasis: configuration?.basis ?? 'manual-entry',
      disclosure: evaluation.disclosure,
    },
    request: {
      complete: false,
      reason: valid ? 'Store material/capability resolution is not yet connected for the User 1 Alcove class.' : 'Class definition is incomplete.',
      intended: valid
        ? {
            form: 'sheet',
            quantity: parts.length,
            quantityUnit: 'ea',
            blankLength: evaluation.derived.span,
            blankDepth: evaluation.inputs.blankDepth,
            blankThickness: evaluation.inputs.blankThickness,
            shelfHeights,
            materialPreference,
            back: backRequirement,
            orderedUnitAdjustment: null,
            referenceOperations: ['simulate_crosscut', 'simulate_shelf_blank'],
            requiredFeatures: [
              ...(backRequired ? ['back-panel'] : []),
              ...(recessedBack ? ['recessed-back-seat'] : []),
            ],
          }
        : null,
    },
    store: {
      connected: false,
      reason: 'Store path for the full User 1 Alcove configuration is not yet admitted by the current application protocol.',
      offering: null,
      price: null,
      availability: null,
      supportability: null,
    },
  };
}

export function planAlcoveDerivation({
  candidateRevisionId,
  createdAt,
  projectId,
  payload,
  previousPayload = {},
  previousDefinitions = new Map(),
}) {
  const configuration = payload.configuration ?? null;
  const evaluation = evaluateAlcoveConfiguration(configuration);
  const records = [];
  const previousOccurrenceIds = [...(previousPayload.activeOccurrenceIds ?? [])];
  const occurrenceIds = [];
  const definitionRevisionIds = [];
  const parts = [];

  if (evaluation.valid) {
    const count = evaluation.inputs.shelfCount.value;
    for (let index = 0; index < count; index += 1) {
      let occurrenceId = previousOccurrenceIds[index] ?? null;
      if (!occurrenceId) {
        occurrenceId = opaqueId();
        records.push({
          kind: 'occurrence',
          id: occurrenceId,
          createdAt,
          payload: {
            projectId,
            introducedInRevisionId: candidateRevisionId,
            role: `shelf-blank-${index + 1}`,
            ordinal: index + 1,
            historicalOrigin: null,
          },
        });
      }
      occurrenceIds.push(occurrenceId);

      const definitionContent = {
        occurrenceId,
        definitionKind: ALCOVE_DEFINITION_KIND,
        ruleVersion: ALCOVE_RULE_VERSION,
        classId: ALCOVE_CLASS_ID,
        classVersion: ALCOVE_CLASS_VERSION,
        role: `shelf-blank-${index + 1}`,
        ordinal: index + 1,
        length: evaluation.derived.span,
        depth: evaluation.inputs.blankDepth,
        thickness: evaluation.inputs.blankThickness,
        quantity: 1,
        quantityUnit: 'ea',
        referenceOperations: ['simulate_crosscut', 'simulate_shelf_blank'],
        configurationBasis: configuration?.basis ?? 'manual-entry',
        physicalFabricationEligible: false,
      };
      const prior = priorDefinitionForOccurrence(previousDefinitions, occurrenceId);
      const priorPayload = prior?.payload ?? prior ?? null;
      let definitionRevisionId = null;
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
      definitionRevisionIds.push(definitionRevisionId);
      parts.push({
        occurrenceId,
        definitionRevisionId,
        label: `Shelf blank ${index + 1}`,
        family: 'shelf-blank',
        ordinal: index + 1,
        quantity: 1,
        quantityUnit: 'ea',
        length: evaluation.derived.span,
        depth: evaluation.inputs.blankDepth,
        thickness: evaluation.inputs.blankThickness,
        material: { form: 'sheet', preference: evaluation.inputs.materialPreference?.canonical ?? null, status: 'preference-unresolved' },
        placement: { shelfHeight: evaluation.inputs.shelfHeights?.canonical?.[index] ?? null, status: 'holder-preference' },
        requiredOps: [],
        referenceOperations: ['simulate_crosscut', 'simulate_shelf_blank'],
        physicalFabricationEligible: false,
      });
    }
  }

  const projectionId = opaqueId();
  records.push({
    kind: 'projection',
    id: projectionId,
    createdAt,
    payload: buildProjectionPayload({
      candidateRevisionId,
      configuration,
      evaluation,
      parts,
      occurrenceIds,
      definitionRevisionIds,
    }),
  });

  return {
    records,
    candidatePatch: {
      activeOccurrenceIds: occurrenceIds,
      projectionId,
      definitionRevisionIds,
      definitionRevisionId: definitionRevisionIds[0] ?? null,
      definitionKind: ALCOVE_DEFINITION_KIND,
      ruleVersion: ALCOVE_RULE_VERSION,
      unresolved: !evaluation.valid || evaluation.unresolvedConditions.length > 0,
      parts: parts.map((part) => ({
        occurrenceId: part.occurrenceId,
        definitionRevisionId: part.definitionRevisionId,
        label: part.label,
      })),
      dimensions: evaluation.valid
        ? {
            openingWidth: evaluation.inputs.openingWidth,
            supportLeft: evaluation.inputs.leftSupport,
            supportRight: evaluation.inputs.rightSupport,
            derivedSpan: evaluation.derived.span,
            blankDepth: evaluation.inputs.blankDepth,
            blankThickness: evaluation.inputs.blankThickness,
            shelfHeights: evaluation.inputs.shelfHeights,
            backSetback: evaluation.inputs.backSetback,
            orderedUnitAdjustment: null,
          }
        : null,
      material: evaluation.valid
        ? {
            form: 'sheet',
            preference: evaluation.inputs.materialPreference?.canonical ?? null,
            back: evaluation.backRequirement,
            status: 'preference-unresolved',
          }
        : null,
      backRequirement: evaluation.valid ? evaluation.backRequirement : null,
    },
  };
}
