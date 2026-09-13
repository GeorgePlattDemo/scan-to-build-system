import { SECONDARY_OPTIONS } from './completion-contract.mjs';

export const SECONDARY_OPERATION_LIBRARY_VERSION = 'STB-SECONDARY-OPS-0.2';

export const MACHINE_FAMILIES = Object.freeze({
  D001: 'D001',
  S001: 'S001',
});

export const SECONDARY_OPERATION_CLASSES = Object.freeze({
  FINAL_DRILL_TO_DIAMETER: 'FINAL_DRILL_TO_DIAMETER',
  REMOVE_RETAINED_TABS: 'REMOVE_RETAINED_TABS',
});

const LIBRARY = Object.freeze({
  [SECONDARY_OPERATION_CLASSES.FINAL_DRILL_TO_DIAMETER]: Object.freeze({
    operationClass: SECONDARY_OPERATION_CLASSES.FINAL_DRILL_TO_DIAMETER,
    label: 'Final drill to required diameter',
    basis: 'D-001 may provide a bounded pilot/spot while the finished hole requirement remains larger.',
    originatingMachineFamilies: Object.freeze([MACHINE_FAMILIES.D001]),
    allowedOptions: Object.freeze([
      SECONDARY_OPTIONS.YARD_SECONDARY,
      SECONDARY_OPTIONS.CUSTOMER_COMPLETES,
      SECONDARY_OPTIONS.THIRD_PARTY_COMPLETES,
    ]),
    selectionRequired: true,
    autoSelected: false,
    createsStoreCapability: false,
    createsYardService: false,
    physicalExecutionAuthority: false,
  }),
  [SECONDARY_OPERATION_CLASSES.REMOVE_RETAINED_TABS]: Object.freeze({
    operationClass: SECONDARY_OPERATION_CLASSES.REMOVE_RETAINED_TABS,
    label: 'Separate retained tabbed part',
    basis: 'S-001 stencil/tab planning intentionally retains the cut part for later secondary separation.',
    originatingMachineFamilies: Object.freeze([MACHINE_FAMILIES.S001]),
    allowedOptions: Object.freeze([
      SECONDARY_OPTIONS.YARD_SECONDARY,
      SECONDARY_OPTIONS.CUSTOMER_COMPLETES,
      SECONDARY_OPTIONS.THIRD_PARTY_COMPLETES,
    ]),
    selectionRequired: true,
    autoSelected: false,
    createsStoreCapability: false,
    createsYardService: false,
    physicalExecutionAuthority: false,
  }),
});

export function secondaryOperation(operationClass) {
  return LIBRARY[operationClass] ?? null;
}

export function listSecondaryOperations() {
  return Object.values(LIBRARY);
}

export function operationAllowedForMachine(operationClass, machineFamily) {
  const entry = secondaryOperation(operationClass);
  return entry?.originatingMachineFamilies.includes(machineFamily) === true;
}

export function buildResidualOperation(operationClass, overrides = {}) {
  const entry = secondaryOperation(operationClass);
  if (!entry) throw new TypeError(`unknown secondary operation: ${operationClass}`);
  const machineFamily = overrides.machineFamily ?? null;
  if (machineFamily && !entry.originatingMachineFamilies.includes(machineFamily)) {
    throw new TypeError(`${operationClass} is not admitted from machine family ${machineFamily}`);
  }
  return Object.freeze({
    ...overrides,
    libraryVersion: SECONDARY_OPERATION_LIBRARY_VERSION,
    operationClass: entry.operationClass,
    label: entry.label,
    basis: entry.basis,
    originatingMachineFamilies: entry.originatingMachineFamilies,
    allowedSecondaryOptions: entry.allowedOptions,
    selectionRequired: true,
    autoSelected: false,
    createsStoreCapability: false,
    createsYardService: false,
    physicalExecutionAuthority: false,
  });
}
