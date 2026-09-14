import { canonicalEqual } from '/shared/canonical.mjs';
import {
  PICNIC_CLASS_ID,
  PICNIC_CLASS_VERSION,
  PICNIC_DEFINITION_KIND,
  PICNIC_FIXTURE,
  PICNIC_RULE_VERSION,
  evaluatePicnicConfiguration,
} from '/shared/picnic-rule.mjs';

function opaqueId() {
  return crypto.randomUUID();
}

function profile(width, thickness) {
  return {
    width: { value: width, unit: 'in', canonical: String(width) },
    thickness: { value: thickness, unit: 'in', canonical: String(thickness) },
  };
}

function holderSupplied(template) {
  return {
    ...template,
    quantity: 1,
    quantityUnit: 'ea',
    fulfillment: 'holder-supplied',
    physicalFabricationEligible: false,
  };
}

function roleDefinitions(evaluation) {
  if (!evaluation.valid) return { parts: [], holderSuppliedParts: [] };
  if (evaluation.input?.tableForm?.id === 'separate-benches') {
    return { parts: [], holderSuppliedParts: [] };
  }

  const fixture = evaluation.fixture;
  const longitudinal = evaluation.derived.longitudinalMemberLength;
  const parts = [];
  const holderSuppliedParts = [];
  const frameKit = evaluation.input?.requestedScope?.id === 'frame-kit';

  const longitudinalMembers = [];
  for (let index = 0; index < fixture.tabletopCount; index += 1) {
    longitudinalMembers.push({
      role: `tabletop-${index + 1}`,
      family: 'tabletop-member',
      label: `Tabletop member ${index + 1}`,
      length: longitudinal,
      profile: profile(fixture.tabletopProfile.width, fixture.tabletopProfile.thickness),
      placement: { view: 'top', lane: index + 1, longitudinal: true },
      features: [],
      operationNeeds: ['SQUARE_CUT'],
    });
  }
  for (let index = 0; index < fixture.seatCount; index += 1) {
    longitudinalMembers.push({
      role: `seat-${index + 1}`,
      family: 'seat-member',
      label: `Seat member ${index + 1}`,
      length: longitudinal,
      profile: profile(fixture.seatProfile.width, fixture.seatProfile.thickness),
      placement: { view: 'top', side: index === 0 ? 'left' : 'right', longitudinal: true },
      features: [],
      operationNeeds: ['SQUARE_CUT'],
    });
  }
  if (frameKit) {
    holderSuppliedParts.push(...longitudinalMembers.map(holderSupplied));
  } else {
    parts.push(...longitudinalMembers);
  }

  const framePositions = [
    ['end-a', evaluation.derived.framePositions.a],
    ['end-b', evaluation.derived.framePositions.b],
  ];
  for (const [end, position] of framePositions) {
    for (const side of ['left', 'right']) {
      parts.push({
        role: `${end}-leg-${side}`,
        family: 'end-frame-leg',
        label: `${end === 'end-a' ? 'End A' : 'End B'} ${side} leg`,
        length: evaluation.derived.legLength,
        profile: profile(fixture.legProfile.width, fixture.legProfile.thickness),
        placement: {
          view: 'end-elevation',
          end,
          endPosition: position,
          side,
          sourceEndpoints: fixture.leg,
          transform: side === 'right' ? 'mirror-x' : 'identity',
        },
        features: [
          {
            id: 'fixture-hole-1',
            kind: 'hole-center-marker',
            partRelativeDistanceFromUpper: evaluation.derived.legHoleFromUpper,
            source: 'same-source-feature-plus-declared-mirror-transform',
            diameter: null,
            depth: null,
          },
        ],
        operationNeeds: ['PLANAR_MEMBER_GEOMETRY', 'DRILL_FEATURE_UNRESOLVED'],
      });
    }
  }

  for (let index = 0; index < fixture.topTransverseCount; index += 1) {
    parts.push({
      role: `top-transverse-${index + 1}`,
      family: 'top-transverse-member',
      label: `Top transverse member ${index + 1}`,
      length: { value: fixture.transverseLength, unit: 'in', canonical: String(fixture.transverseLength) },
      profile: profile(fixture.transverseProfile.width, fixture.transverseProfile.thickness),
      placement: { view: 'top', frame: index === 0 ? 'end-a' : 'end-b', transverse: true },
      features: [],
      operationNeeds: ['SQUARE_CUT'],
    });
  }
  for (let index = 0; index < fixture.seatTransverseCount; index += 1) {
    parts.push({
      role: `seat-transverse-${index + 1}`,
      family: 'seat-transverse-member',
      label: `Seat transverse member ${index + 1}`,
      length: { value: fixture.transverseLength, unit: 'in', canonical: String(fixture.transverseLength) },
      profile: profile(fixture.transverseProfile.width, fixture.transverseProfile.thickness),
      placement: { view: 'top', frame: index === 0 ? 'end-a' : 'end-b', transverse: true, seatSupport: true },
      features: [],
      operationNeeds: ['SQUARE_CUT'],
    });
  }
  return { parts, holderSuppliedParts };
}

function definitionBasis(payload) {
  if (!payload) return null;
  return {
    occurrenceId: payload.occurrenceId,
    definitionKind: payload.definitionKind,
    ruleVersion: payload.ruleVersion,
    fixtureId: payload.fixtureId,
    role: payload.role,
    family: payload.family,
    length: payload.length,
    profile: payload.profile,
    placement: payload.placement,
    features: payload.features,
    operationNeeds: payload.operationNeeds,
    physicalFabricationEligible: payload.physicalFabricationEligible,
  };
}

function priorDefinition(previousDefinitions, occurrenceId) {
  return previousDefinitions instanceof Map ? previousDefinitions.get(occurrenceId) ?? null : null;
}

function previousOccurrenceByRole(previousDefinitions) {
  const byRole = new Map();
  if (!(previousDefinitions instanceof Map)) return byRole;
  for (const [occurrenceId, record] of previousDefinitions.entries()) {
    const role = record?.payload?.role ?? record?.role ?? null;
    if (role) byRole.set(role, occurrenceId);
  }
  return byRole;
}

function totalLinearDemand(parts) {
  const byFamily = new Map();
  let total = 0;
  for (const part of parts) {
    const length = Number(part.length?.value ?? 0);
    if (!Number.isFinite(length)) continue;
    total += length;
    const row = byFamily.get(part.family) ?? { family: part.family, count: 0, total: 0 };
    row.count += 1;
    row.total += length;
    byFamily.set(part.family, row);
  }
  return {
    totalInches: total,
    totalFeet: total / 12,
    families: [...byFamily.values()].map((row) => ({
      family: row.family,
      count: row.count,
      totalInches: row.total,
    })),
  };
}

function buildRender(parts, holderSuppliedParts, evaluation) {
  return {
    kind: 'orthographic-project-v1',
    projection: 'picnic-fixture-orthographic',
    schematic: true,
    fixtureId: evaluation.fixture.fixtureId,
    tableForm: evaluation.input?.tableForm?.id ?? null,
    requestedScope: evaluation.input?.requestedScope?.id ?? null,
    productLength: evaluation.input.productLength.canonical,
    overallWidth: String(evaluation.fixture.overallWidth),
    topHeight: String(evaluation.fixture.topHeight),
    seatHeight: String(evaluation.fixture.seatHeight),
    frameA: evaluation.derived.framePositions.a.canonical,
    frameB: evaluation.derived.framePositions.b.canonical,
    legSource: evaluation.fixture.leg,
    note: 'Software-fixture orthographic proof only. Placement is not a construction drawing. Dashed/holder-supplied meaning is presentation-only until a governed fulfillment path exists.',
    parts: [
      ...parts.map((part) => ({
        occurrenceId: part.occurrenceId,
        definitionRevisionId: part.definitionRevisionId,
        role: part.role,
        family: part.family,
        label: part.label,
        length: part.length.canonical,
        profile: part.profile,
        placement: part.placement,
        features: part.features,
        fulfillment: 'candidate-we-make',
      })),
      ...holderSuppliedParts.map((part) => ({
        occurrenceId: null,
        definitionRevisionId: null,
        role: part.role,
        family: part.family,
        label: part.label,
        length: part.length.canonical,
        profile: part.profile,
        placement: part.placement,
        features: part.features,
        fulfillment: 'holder-supplied',
      })),
    ],
  };
}

export function planPicnicDerivation({
  candidateRevisionId,
  createdAt,
  projectId,
  payload,
  previousPayload = {},
  previousDefinitions = new Map(),
}) {
  const configuration = payload.configuration ?? null;
  const evaluation = evaluatePicnicConfiguration(configuration);
  const definitions = roleDefinitions(evaluation);
  const templates = definitions.parts;
  const holderSuppliedParts = definitions.holderSuppliedParts;
  const priorByRole = previousOccurrenceByRole(previousDefinitions);
  const records = [];
  const occurrenceIds = [];
  const definitionRevisionIds = [];
  const parts = [];

  for (const template of templates) {
    let occurrenceId = priorByRole.get(template.role) ?? null;
    if (!occurrenceId) {
      occurrenceId = opaqueId();
      records.push({
        kind: 'occurrence',
        id: occurrenceId,
        createdAt,
        payload: {
          projectId,
          introducedInRevisionId: candidateRevisionId,
          role: template.role,
          historicalOrigin: null,
        },
      });
    }
    occurrenceIds.push(occurrenceId);
    const definitionContent = {
      occurrenceId,
      definitionKind: PICNIC_DEFINITION_KIND,
      ruleVersion: PICNIC_RULE_VERSION,
      classId: PICNIC_CLASS_ID,
      classVersion: PICNIC_CLASS_VERSION,
      fixtureId: evaluation.fixture.fixtureId,
      role: template.role,
      family: template.family,
      length: template.length,
      profile: template.profile,
      placement: template.placement,
      features: template.features,
      operationNeeds: template.operationNeeds,
      material: { form: 'dimensional', species: null, grade: null, sku: null, status: 'unresolved' },
      physicalFabricationEligible: false,
    };
    const prior = priorDefinition(previousDefinitions, occurrenceId);
    const priorPayload = prior?.payload ?? prior ?? null;
    let definitionRevisionId;
    if (priorPayload && canonicalEqual(definitionBasis(priorPayload), definitionBasis(definitionContent))) {
      definitionRevisionId = prior.id;
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
      ...template,
      occurrenceId,
      definitionRevisionId,
      quantity: 1,
      quantityUnit: 'ea',
      material: definitionContent.material,
      fulfillment: 'candidate-we-make',
      physicalFabricationEligible: false,
    });
  }

  const projectionId = opaqueId();
  const unresolvedConditions = [
    ...(evaluation.unresolvedReason ? [evaluation.unresolvedReason] : []),
    ...(evaluation.unresolvedConditions ?? []),
  ];
  const materialDemand = evaluation.valid ? totalLinearDemand(parts) : null;
  const holderSupplyDemand = evaluation.valid ? totalLinearDemand(holderSuppliedParts) : null;
  const renderable = evaluation.valid && evaluation.input?.tableForm?.id !== 'separate-benches';
  records.push({
    kind: 'projection',
    id: projectionId,
    createdAt,
    payload: {
      derivationVersion: PICNIC_RULE_VERSION,
      definitionKind: PICNIC_DEFINITION_KIND,
      ruleVersion: PICNIC_RULE_VERSION,
      classId: PICNIC_CLASS_ID,
      classVersion: PICNIC_CLASS_VERSION,
      fixtureId: PICNIC_FIXTURE.fixtureId,
      candidateRevisionId,
      valid: evaluation.valid,
      unresolvedReason: evaluation.unresolvedReason,
      unresolvedConditions,
      occurrenceIds,
      definitionRevisionIds,
      input: evaluation.input,
      derived: evaluation.derived,
      parts,
      holderSuppliedParts,
      materialDemand,
      holderSupplyDemand,
      operationRequirements: evaluation.valid && parts.length > 0
        ? {
            status: 'application-requirements-only',
            required: [...new Set(parts.flatMap((part) => part.operationNeeds))],
            unresolved: ['LEG_END_CUT_ANGLES_UNRESOLVED', 'DRILL_DIAMETER_DEPTH_UNRESOLVED'],
            storeNeutralSequence: null,
          }
        : null,
      physicalFabricationEligible: false,
      productionAuthorization: false,
      machineReady: false,
      configurationBasis: configuration?.basis ?? 'manual-entry',
      render: renderable ? buildRender(parts, holderSuppliedParts, evaluation) : null,
      summary: {
        title: evaluation.valid ? 'Picnic Table candidate' : 'Picnic Table software fixture is unresolved',
        tableForm: evaluation.input?.tableForm?.id ?? null,
        requestedScope: evaluation.input?.requestedScope?.id ?? null,
        productLength: evaluation.input?.productLength?.canonical ?? null,
        affectedLongitudinalLength: evaluation.derived?.longitudinalMemberLength?.canonical ?? null,
        totalLongitudinalLength: evaluation.derived?.totalLongitudinalLength?.canonical ?? null,
        partCount: parts.length,
        holderSuppliedPartCount: holderSuppliedParts.length,
        fixtureId: PICNIC_FIXTURE.fixtureId,
        configurationBasis: configuration?.basis ?? 'manual-entry',
        disclosure: evaluation.disclosure ?? 'Synthetic software fixture only.',
      },
      request: {
        complete: false,
        reason: evaluation.valid ? 'Store material/capability resolution is not implemented for this synthetic class.' : evaluation.unresolvedReason,
        intended: evaluation.valid
          ? {
              dimensionalMemberCount: parts.length,
              holderSuppliedMemberCount: holderSuppliedParts.length,
              materialDemand,
              holderSupplyDemand,
              operationRequirements: [...new Set(parts.flatMap((part) => part.operationNeeds))],
            }
          : null,
      },
      store: {
        connected: false,
        reason: 'Store path unresolved for Classic Picnic Table software fixture.',
        offering: null,
        price: null,
        availability: null,
        supportability: null,
      },
    },
  });

  return {
    records,
    candidatePatch: {
      activeOccurrenceIds: occurrenceIds,
      projectionId,
      definitionRevisionIds,
      definitionRevisionId: definitionRevisionIds[0] ?? null,
      definitionKind: PICNIC_DEFINITION_KIND,
      ruleVersion: PICNIC_RULE_VERSION,
      unresolved: !evaluation.valid || unresolvedConditions.length > 0,
      parts: parts.map((part) => ({
        occurrenceId: part.occurrenceId,
        definitionRevisionId: part.definitionRevisionId,
        label: part.label,
        family: part.family,
        fulfillment: 'candidate-we-make',
      })),
      holderSuppliedParts: holderSuppliedParts.map((part) => ({
        role: part.role,
        label: part.label,
        family: part.family,
        length: part.length,
        profile: part.profile,
        fulfillment: 'holder-supplied',
      })),
      dimensions: evaluation.valid
        ? {
            productLength: evaluation.input.productLength,
            longitudinalMemberLength: evaluation.derived.longitudinalMemberLength,
            legLength: evaluation.derived.legLength,
            framePositions: evaluation.derived.framePositions,
          }
        : null,
      material: evaluation.valid ? { form: 'dimensional', status: 'unresolved' } : null,
    },
  };
}
