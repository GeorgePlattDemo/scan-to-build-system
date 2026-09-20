export const CANONICAL_PROJECT_STAGES = Object.freeze([
  'scan-evidence',
  'configure',
  'store-answer',
  'accept-pay',
  'store-yard',
  'handoff-record',
]);

const REVIEW_DONOR = Object.freeze({
  repository: 'GeorgePlattDemo/scan-to-build-review',
  commit: '2d75939a5a1cc11de41ed53aad7f86412f39a327',
});

const SYSTEM_SOURCE = Object.freeze({
  repository: 'GeorgePlattDemo/scan-to-build-system',
  commit: 'b18580f198d2535ec6644f0c8433ff45a8bafa36',
});

function project(definition) {
  return Object.freeze({
    ...definition,
    legalStages: Object.freeze([...definition.legalStages]),
    stageDestinations: Object.freeze({ ...definition.stageDestinations }),
    sourceAuthority: Object.freeze({ ...definition.sourceAuthority }),
  });
}

export const PROJECT_REGISTRY = Object.freeze([
  project({
    projectId: 'start-own',
    systemClassId: 'REVIEW_START_OWN_V011',
    displayName: 'Start Your Own / Grab a Board',
    projectClass: 'USER_DEFINED_BOARD',
    hostMode: 'review-child',
    entryArtifact: '/project-children/stb-start-own-picnic-leg-0.1.html',
    sourceAuthority: {
      class: 'SYSTEM_ADMITTED_USER_DEFINED_CHILD',
      repository: 'GeorgePlattDemo/scan-to-build-system',
      donorName: 'stb-start-own-picnic-leg-0.1.html',
      donorSha256: '455db6e8351c9f5f28feac98e80461c852cd0f7682a9834a378bbedc82c17fed',
      donorBasis: 'User-provided Claude interaction prototype; Store logic removed from browser and rebound through System.',
      storeRepository: 'GeorgePlattDemo/scan-to-build-store',
      storePin: 'c66363597ed9b5ed355220d5599e726730cd2802',
      priorReviewImplementationBlob: '45132afea1cc796b10e0fb667a7d2db3ee10e284',
      provenanceBlob: 'cbdb02996e161b951704acae29d8da2dd1c68c03',
    },
    definitionContractVersion: 'review-child-snapshot/1',
    confirmationEvent: 'STB_START_OWN_CONFIRMED',
    legalStages: CANONICAL_PROJECT_STAGES,
    stageDestinations: {
      'scan-evidence': 'child',
      configure: 'child',
      'store-answer': 'system-store-boundary',
      'accept-pay': 'system-commercial-boundary',
      'store-yard': 'system-yard-boundary',
      'handoff-record': 'system-owner-record',
    },
    storeAdapterPath: 'start-own-store-http/1',
    ownerRecordPath: 'system-owner-record',
  }),
  project({
    projectId: 'outdoor',
    systemClassId: 'REVIEW_OUTDOOR_BUILD_V01',
    displayName: 'Outdoor Build',
    projectClass: 'BOUNDED_SOURCE_BACKED',
    hostMode: 'review-child',
    entryArtifact: '/review-donors/stb-outdoor-build.html',
    sourceAuthority: {
      class: 'REVIEW_DONOR_BOUNDED_SOURCE',
      ...REVIEW_DONOR,
      blob: '7772620381179a70d550bbceda3da5155d445591',
      authorityBlob: '289e178b1c7a526c802e908155d4405e593cc706',
      researchBlob: '5c7d1acb78f65ab421423f531c87d2b4eb41059a',
    },
    definitionContractVersion: 'review-child-snapshot/1',
    confirmationEvent: 'STB_OUTDOOR_CONFIRMED',
    legalStages: CANONICAL_PROJECT_STAGES,
    stageDestinations: {
      'scan-evidence': 'child',
      configure: 'child',
      'store-answer': 'system-store-boundary',
      'accept-pay': 'system-commercial-boundary',
      'store-yard': 'system-yard-boundary',
      'handoff-record': 'system-owner-record',
    },
    storeAdapterPath: 'review-store-handoff/0.5',
    ownerRecordPath: 'system-owner-record',
  }),
  project({
    projectId: 'alcove',
    systemClassId: 'REVIEW_ALCOVE_INSERT_CURRENT',
    displayName: 'Alcove Insert',
    projectClass: 'ALCOVE_INSERT_MATURE',
    hostMode: 'review-child',
    entryArtifact: '/review-donors/system-build-base-8d8a9dd.html',
    sourceAuthority: {
      class: 'PROJECT_SPECIFIC_DONOR',
      ...REVIEW_DONOR,
      blob: '67f3c5324ac7ab2ccd798b0dc0d7179b0912eef4',
      economicsOwner: 'project-native',
    },
    definitionContractVersion: 'review-child-snapshot/1',
    confirmationEvent: 'alcove-native-confirmation',
    legalStages: CANONICAL_PROJECT_STAGES,
    stageDestinations: {
      'scan-evidence': 'child:alcove-capture',
      configure: 'child:alcove-config',
      'store-answer': 'child:store',
      'accept-pay': 'child:request',
      'store-yard': 'child:yard',
      'handoff-record': 'child:record',
    },
    storeAdapterPath: 'project-native-alcove',
    ownerRecordPath: 'system-owner-record',
  }),
  project({
    projectId: 'window-seat',
    systemClassId: 'REVIEW_WINDOW_SEAT_V074',
    displayName: 'Window Seat / Space Utilization',
    projectClass: 'WINDOW_SEAT_SPACE_UTILIZATION',
    hostMode: 'review-child',
    entryArtifact: '/review-donors/stb-window-seat-space-utilization-0.7.4.html',
    sourceAuthority: {
      class: 'PROJECT_SPECIFIC_DONOR',
      ...REVIEW_DONOR,
      blob: '96c85feef57b1196093e56495e7141452fc749a4',
      goldStandard: true,
    },
    definitionContractVersion: 'review-child-snapshot/1',
    confirmationEvent: 'window-seat-confirmed-snapshot',
    legalStages: CANONICAL_PROJECT_STAGES,
    stageDestinations: {
      'scan-evidence': 'child:scan',
      configure: 'child:configure',
      'store-answer': 'child:store-answer',
      'accept-pay': 'child:accept-pay',
      'store-yard': 'child:store-yard',
      'handoff-record': 'child:handoff-record',
    },
    storeAdapterPath: 'project-native-window-seat',
    ownerRecordPath: 'system-owner-record',
  }),
  project({
    projectId: 's001',
    systemClassId: 'S001_CENTERED_ARCHED_SHEET_V0',
    displayName: 'S-001 / Centered Arched Sheet',
    projectClass: 'S001_CENTERED_ARCHED_SHEET_V0',
    hostMode: 'system-native',
    entryArtifact: '/project',
    sourceAuthority: {
      class: 'SYSTEM_ACCEPTED',
      ...SYSTEM_SOURCE,
      storeProofPin: '4402abeb6b0299a5b6db2eec85ed04c3b0236bcc',
    },
    definitionContractVersion: 'system-definition-contract',
    confirmationEvent: 'DefinitionReviewRecorded',
    legalStages: CANONICAL_PROJECT_STAGES,
    stageDestinations: {
      'scan-evidence': 'system:questions',
      configure: 'system:questions',
      'store-answer': 'system:store',
      'accept-pay': 'system:confirm',
      'store-yard': 'system:result',
      'handoff-record': 'system:record',
    },
    storeAdapterPath: 'published-project-durable',
    ownerRecordPath: 'system-owner-record',
  }),
]);

const BY_ID = new Map(PROJECT_REGISTRY.map((entry) => [entry.projectId, entry]));
const BY_CLASS_ID = new Map(PROJECT_REGISTRY.map((entry) => [entry.systemClassId, entry]));

export function getProjectDefinition(projectId) {
  return BY_ID.get(projectId) ?? null;
}

export function getProjectDefinitionByClassId(classId) {
  return BY_CLASS_ID.get(classId) ?? null;
}

export function listCanonicalProjects() {
  return PROJECT_REGISTRY.slice();
}

export function resolveProjectStage(projectId, requestedStage) {
  const definition = getProjectDefinition(projectId);
  if (!definition || !definition.legalStages.includes(requestedStage)) {
    return null;
  }
  const destination = definition.stageDestinations[requestedStage] ?? null;
  return destination ? Object.freeze({
    projectId,
    requestedStage,
    destination,
    hostMode: definition.hostMode,
    entryArtifact: definition.entryArtifact,
  }) : null;
}

export function projectStageAllowed(projectId, requestedStage) {
  return resolveProjectStage(projectId, requestedStage) !== null;
}

export function canonicalProjectHref(localRecordId, projectId, stage) {
  if (!localRecordId || !resolveProjectStage(projectId, stage)) return null;
  const params = new URLSearchParams({
    id: localRecordId,
    catalog: projectId,
    stage,
  });
  return '/project?' + params.toString();
}

export const REVIEW_CHILD_CLASS_REFERENCES = Object.freeze(
  PROJECT_REGISTRY
    .filter((entry) => entry.hostMode === 'review-child')
    .map((entry) => Object.freeze({
      kind: 'mapped',
      classId: entry.systemClassId,
      classVersion: 'review-child-adapter/0.1',
      ruleVersion: null,
      label: entry.displayName,
      status: 'admitted-review-child',
      storePath: entry.storeAdapterPath,
      hint: 'Preserved Review donor hosted by the canonical System application.',
      source: Object.freeze({
        repository: entry.sourceAuthority.repository,
        pin: entry.sourceAuthority.commit ?? null,
        basis: 'REVIEW-TO-SYSTEM-ADMISSION-0.1',
        ruleVersion: null,
        sourceFile: entry.entryArtifact,
        executable: false,
        authority: false,
      }),
    })),
);
