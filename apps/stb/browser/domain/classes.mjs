import { BOARD_DEFINITION, CLASS_REFERENCES, OWN_ENTRY } from '/shared/contracts.mjs';

export function listMappedClasses() {
  return CLASS_REFERENCES.filter((entry) => entry.kind === 'mapped');
}

export function getMappedClass(classId) {
  return CLASS_REFERENCES.find((entry) => entry.kind === 'mapped' && entry.classId === classId) ?? null;
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
