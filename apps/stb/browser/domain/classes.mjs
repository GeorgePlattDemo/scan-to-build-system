import { BOARD_DEFINITION, CLASS_REFERENCES, OWN_ENTRY } from '/shared/contracts.mjs';
import { REVIEW_CHILD_CLASS_REFERENCES } from '/shared/project-registry.mjs';
import {
  S001_CENTERED_ARCH_CLASS_ID,
  S001_CENTERED_ARCH_CLASS_VERSION,
  S001_CENTERED_ARCH_RULE_VERSION,
} from '/shared/class-config.mjs';

const INTERNAL_MAPPED_CLASSES = Object.freeze([
  ...REVIEW_CHILD_CLASS_REFERENCES,
  Object.freeze({
    kind: 'mapped',
    classId: S001_CENTERED_ARCH_CLASS_ID,
    classVersion: S001_CENTERED_ARCH_CLASS_VERSION,
    ruleVersion: S001_CENTERED_ARCH_RULE_VERSION,
    label: 'Centered arched sheet cutout',
    status: 'candidate-bounded-project',
    storePath: 'published-project-durable',
    hint: 'Internal bounded project. Page-1 presentation copy is intentionally not published yet.',
    source: Object.freeze({
      repository: 'GeorgePlattDemo/scan-to-build-system',
      pin: null,
      basis: 'Canonical S-001 centered 48 x 36 work-field project',
      ruleVersion: S001_CENTERED_ARCH_RULE_VERSION,
      sourceFile: 'apps/stb/shared/class-config.mjs',
      executable: false,
      authority: false,
    }),
  }),
]);

export function listMappedClasses() {
  // Page-1 exposure remains controlled only by CLASS_REFERENCES.
  return CLASS_REFERENCES.filter((entry) => entry.kind === 'mapped');
}

export function getMappedClass(classId) {
  return CLASS_REFERENCES.find((entry) => entry.kind === 'mapped' && entry.classId === classId)
    ?? INTERNAL_MAPPED_CLASSES.find((entry) => entry.classId === classId)
    ?? null;
}

export function ownEntry() {
  return OWN_ENTRY;
}

export function boardDefinition() {
  return BOARD_DEFINITION;
}

export function destinationView(entryMode) {
  return entryMode === 'mapped' ? 'questions' : 'hub';
}
