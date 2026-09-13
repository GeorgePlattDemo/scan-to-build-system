import { SECONDARY_OPTIONS } from './completion-contract.mjs';

export const SECONDARY_OPERATION_LIBRARY_VERSION = 'STB-SECONDARY-OPS-0.1';

export const SECONDARY_OPERATION_CLASSES = Object.freeze({
  FINAL_DRILL_TO_DIAMETER: 'FINAL_DRILL_TO_DIAMETER',
  REMOVE_RETAINED_TABS: 'REMOVE_RETAINED_TABS',
});

const LIBRARY = Object.freeze({
  [SECONDARY_OPERATION_CLASSES.FINAL_DRILL_TO_DIAMETER]: Object.freeze({
    operationClass: SECONDARY_OPERATION_CLASSES.FINAL_DRILL_TO_DIAMETER,
    label: 'Final drill to required diameter',
    basis: 'D-001 may provide a bounded pilot/spot while the finished hole requirement remains larger.',
    allowedOptions: Object.freeze([
      SECONDARY_OPTIONS.YARD_SECONDARY,
      SECONDARY_OPTIONS.CUSTOMER_COMPLETES,
      SECONDARY_OPTIONS.THIRD_PARTY_COMPLETES,
    ]),
    createsStoreCapability: false,
    createsYardService: false,
    physicalExecutionAuthority: false,
  }),
  [SECONDARY_OPERATION_CLASSES.REMOVE_RETAINED_TABS]: Object.freeze({
    operationClass: SECONDARY_OPERATION_CLASSES.REMOVE_RETAINED_TABS,
    label: 'Separate retained tabbed part',
    basis: 'S-001 stencil/tab planning intentionally retains the cut part for later secondary separation.',
    allowedOptions: Object.freeze([
      SECONDARY_OPTIONS.YARD_SECONDARY,
      SECONDARY_OPTIONS.CUSTOMER_COMPLETES,
      SECONDARY_OPTIONS.THIRD_PARTY_COMPLETES,
    ]),
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

export function buildResidualOperation(operationClass, overrides = {}) {
  const entry = secondaryOperation(operationClass);
  if (!entry) throw new TypeError(`unknown secondary operation: ${operationClass}`);
  return Object.freeze({
    libraryVersion: SECONDARY_OPERATION_LIBRARY_VERSION,
    operationClass: entry.operationClass,
    label: entry.label,
    basis: entry.basis,
    allowedSecondaryOptions: entry.allowedOptions,
    ...overrides,
    createsStoreCapability: false,
    createsYardService: false,
    physicalExecutionAuthority: false,
  });
}
