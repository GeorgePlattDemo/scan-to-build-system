import { ALCOVE_CLASS_ID, ALCOVE_REFERENCE_EXAMPLE } from './alcove-rule.mjs';
import { PICNIC_CLASS_ID, PICNIC_REFERENCE_EXAMPLES } from './picnic-rule.mjs';

export const CLASS_CONFIGURATORS = Object.freeze({
  [ALCOVE_CLASS_ID]: Object.freeze({
    classId: ALCOVE_CLASS_ID,
    title: 'ALCOVE SHELF BLANKS',
    kicker: 'Bounded project configurator · running candidate engine',
    lead: 'These six inputs drive one deterministic candidate calculation. Nothing is silently defaulted. Applying a change creates a new candidate revision; it does not place an order or authorize fabrication.',
    fields: Object.freeze([
      Object.freeze({ key: 'openingWidth', label: 'Opening clear width', unit: 'in', inputMode: 'decimal', help: 'Measured clear width between the two support locations.' }),
      Object.freeze({ key: 'leftSupport', label: 'Left support thickness', unit: 'in', inputMode: 'decimal', help: 'Deducted from the opening. No hidden allowance is added.' }),
      Object.freeze({ key: 'rightSupport', label: 'Right support thickness', unit: 'in', inputMode: 'decimal', help: 'Deducted from the opening. No hidden allowance is added.' }),
      Object.freeze({ key: 'blankDepth', label: 'Shelf blank depth', unit: 'in', inputMode: 'decimal', help: 'Candidate blank depth. This does not establish installed clearance.' }),
      Object.freeze({ key: 'blankThickness', label: 'Shelf blank thickness', unit: 'in', inputMode: 'decimal', help: 'Candidate blank thickness. Structural adequacy is not evaluated here.' }),
      Object.freeze({ key: 'shelfCount', label: 'Shelf count', unit: 'ea', inputMode: 'numeric', help: 'Number of separate candidate blank occurrences.' }),
    ]),
    examples: Object.freeze([
      Object.freeze({
        id: 'published-reference-example',
        label: 'USE PUBLISHED EXAMPLE',
        basis: 'published-reference-example',
        configuration: ALCOVE_REFERENCE_EXAMPLE,
      }),
    ]),
    exampleNote: 'Published example is an explicit reference choice: 46.25 − 0.75 − 0.75 = 44.75 in; 3 blanks at 44.75 × 11.00 × 0.75 in. Structural span is not evaluated.',
  }),
  [PICNIC_CLASS_ID]: Object.freeze({
    classId: PICNIC_CLASS_ID,
    title: 'CLASSIC PICNIC TABLE — SOFTWARE FIXTURE',
    kicker: 'Second bounded class · shared runner proof',
    lead: 'Only product length is editable in this slice. Every other dimension, count, offset, profile and leg coordinate is a named software-fixture assumption used to prove shared application reuse. It is not an approved furniture design.',
    fields: Object.freeze([
      Object.freeze({ key: 'productLength', label: 'Product length', unit: 'in', inputMode: 'decimal', help: 'This fixture accepts only the two declared software-test lengths: 72 in and 84 in.' }),
    ]),
    examples: Object.freeze(PICNIC_REFERENCE_EXAMPLES.map((example) => Object.freeze({
      id: example.id,
      label: example.label,
      basis: example.basis,
      configuration: Object.freeze({ productLength: example.productLength }),
    }))),
    exampleNote: 'Changing 72 → 84 in is the declared software proof. Longitudinal members change by ΔL while fixed leg geometry remains unchanged. Engineering, hardware suitability, Store support and any governed make path remain unresolved.',
  }),
});

export function getClassConfigurator(classId) {
  return CLASS_CONFIGURATORS[classId] ?? null;
}
