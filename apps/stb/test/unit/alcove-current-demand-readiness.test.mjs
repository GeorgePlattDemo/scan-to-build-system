import assert from 'node:assert/strict';
import test from 'node:test';

import {
  BOUNDARY,
  DISPOSITION,
  OWNER,
  STATUS,
  blockingForBoundary,
  storeSubmissionReadiness,
} from '../../shared/definition-contract.mjs';

const STORE_CANDIDATE_PIN = '2cb41231f7facecd3f212fb5d4efe572a96354ae';

const CURRENT_VISIBLE_ALCOVE = Object.freeze({
  source: Object.freeze({
    repository: 'GeorgePlattDemo/scan-to-build-review',
    commit: 'd99285cbc4e05a3f8123301c33f66e2f184ae2e4',
    file: 'system-build-base-8d8a9dd.html',
  }),
  classId: 'alcove.insert.square_shelves',
  configuration: Object.freeze({
    heightIn: 72,
    widthIn: 45.5,
    depthIn: 14,
    sideThicknessIn: 0.75,
    interiorSpanIn: 44,
    shelfCount: 5,
    shelfElevationsIn: Object.freeze([12, 24, 36, 45, 65]),
    species: 'pine',
  }),
  currentMaterialDemandEvidence: Object.freeze({
    piecesAcross: 3,
    boardsPerShelf: 2,
    parent72Count: 4,
    parent96Count: 10,
    hardwarePackCount: 1,
  }),
});

function baseRows() {
  return [
    {
      id: 'alcove.unit.height',
      title: 'Configured unit height',
      status: STATUS.CONFIRMED,
      owner: OWNER.USER,
      blocks: [BOUNDARY.DEFINITION, BOUNDARY.STORE_SUBMISSION],
      value: { value: 72, unit: 'in' },
      basis: 'current-visible-configure',
    },
    {
      id: 'alcove.unit.width',
      title: 'Configured unit width',
      status: STATUS.CONFIRMED,
      owner: OWNER.USER,
      blocks: [BOUNDARY.DEFINITION, BOUNDARY.STORE_SUBMISSION],
      value: { value: 45.5, unit: 'in' },
      basis: 'current-visible-configure',
    },
    {
      id: 'alcove.unit.depth',
      title: 'Configured unit depth',
      status: STATUS.CONFIRMED,
      owner: OWNER.USER,
      blocks: [BOUNDARY.DEFINITION, BOUNDARY.STORE_SUBMISSION],
      value: { value: 14, unit: 'in' },
      basis: 'current-visible-configure',
    },
    {
      id: 'alcove.interior.span',
      title: 'Derived interior span',
      status: STATUS.DERIVED,
      owner: OWNER.RULE,
      blocks: [BOUNDARY.DEFINITION, BOUNDARY.STORE_SUBMISSION],
      value: { value: 44, unit: 'in' },
      basis: 'current-visible-definition',
      derivation: {
        rule: 'unitWidth - leftSideThickness - rightSideThickness',
        inputs: { unitWidthIn: 45.5, leftSideThicknessIn: 0.75, rightSideThicknessIn: 0.75 },
      },
    },
    {
      id: 'alcove.shelves.elevations',
      title: 'Configured shelf elevations',
      status: STATUS.CONFIRMED,
      owner: OWNER.USER,
      blocks: [BOUNDARY.DEFINITION, BOUNDARY.STORE_SUBMISSION],
      value: { values: [12, 24, 36, 45, 65], unit: 'in', reference: 'FROM_BASE' },
      basis: 'current-visible-definition',
    },
    {
      id: 'alcove.material.species',
      title: 'Selected material species',
      status: STATUS.CONFIRMED,
      owner: OWNER.USER,
      blocks: [BOUNDARY.DEFINITION, BOUNDARY.STORE_SUBMISSION],
      value: 'pine',
      basis: 'current-visible-configure',
    },
    {
      id: 'alcove.side.occurrences',
      title: 'Identified finished side/upright occurrences',
      status: STATUS.UNRESOLVED,
      owner: OWNER.RULE,
      blocks: [BOUNDARY.DEFINITION, BOUNDARY.STORE_SUBMISSION],
      value: null,
      basis: null,
      condition: 'IDENTIFIED_SIDE_OCCURRENCES_REQUIRED',
    },
    {
      id: 'alcove.shelf.finishedLength',
      title: 'Finished shelf-member length',
      status: STATUS.UNRESOLVED,
      owner: OWNER.RULE,
      blocks: [BOUNDARY.DEFINITION, BOUNDARY.STORE_SUBMISSION],
      value: null,
      basis: null,
      condition: 'SHELF_FINISHED_LENGTH_REQUIRED',
    },
    {
      id: 'alcove.shelf.finishedWidths',
      title: 'Finished shelf-member width set',
      status: STATUS.UNRESOLVED,
      owner: OWNER.RULE,
      blocks: [BOUNDARY.DEFINITION, BOUNDARY.STORE_SUBMISSION],
      value: null,
      basis: null,
      condition: 'SHELF_FINISHED_WIDTH_SET_REQUIRED',
    },
    {
      id: 'alcove.store.materialResolution',
      title: 'Store material / SKU resolution',
      status: STATUS.UNRESOLVED,
      owner: OWNER.STORE,
      blocks: [BOUNDARY.STORE_SUBMISSION],
      value: null,
      basis: null,
      condition: 'ASK_STORE',
    },
  ];
}

function ledger({ pilot = false } = {}) {
  const responsibilities = baseRows();
  if (pilot) {
    responsibilities.push({
      id: 'alcove.pilot.targetOccurrences',
      title: 'Pilot spot target occurrence binding',
      status: STATUS.UNRESOLVED,
      owner: OWNER.RULE,
      blocks: [BOUNDARY.DEFINITION, BOUNDARY.STORE_SUBMISSION],
      value: null,
      basis: null,
      condition: 'PILOT_TARGET_OCCURRENCE_BINDING_REQUIRED',
    });
  }
  return {
    disposition: DISPOSITION.CLASSIFIED,
    classId: CURRENT_VISIBLE_ALCOVE.classId,
    classVersion: 'current-visible-review-d99285c',
    definitionKind: null,
    ruleVersion: 'alcove.current-demand-fail-first/0.1',
    candidateRevisionId: pilot ? 'ALCOVE-CURRENT-PILOT-ON' : 'ALCOVE-CURRENT-PILOT-OFF',
    storeQueryContract: {
      repository: 'GeorgePlattDemo/scan-to-build-store',
      pin: STORE_CANDIDATE_PIN,
      requestType: 'DIMENSIONAL_ALCOVE_V1_CANDIDATE',
    },
    responsibilities,
  };
}

test('current visible Alcove facts are frozen without inventing missing manufacturing geometry', () => {
  assert.equal(CURRENT_VISIBLE_ALCOVE.configuration.heightIn, 72);
  assert.equal(CURRENT_VISIBLE_ALCOVE.configuration.widthIn, 45.5);
  assert.equal(CURRENT_VISIBLE_ALCOVE.configuration.depthIn, 14);
  assert.equal(CURRENT_VISIBLE_ALCOVE.configuration.interiorSpanIn, 44);
  assert.deepEqual(CURRENT_VISIBLE_ALCOVE.configuration.shelfElevationsIn, [12, 24, 36, 45, 65]);
  assert.equal(CURRENT_VISIBLE_ALCOVE.currentMaterialDemandEvidence.piecesAcross, 3);
  assert.equal(CURRENT_VISIBLE_ALCOVE.currentMaterialDemandEvidence.boardsPerShelf, 2);
  assert.equal(CURRENT_VISIBLE_ALCOVE.currentMaterialDemandEvidence.parent72Count, 4);
  assert.equal(CURRENT_VISIBLE_ALCOVE.currentMaterialDemandEvidence.parent96Count, 10);

  assert.equal('shelfFinishedLengthIn' in CURRENT_VISIBLE_ALCOVE, false);
  assert.equal('shelfFinishedWidthsIn' in CURRENT_VISIBLE_ALCOVE, false);
  assert.equal('parentToPartCutPlan' in CURRENT_VISIBLE_ALCOVE, false);
  assert.equal('storeSku' in CURRENT_VISIBLE_ALCOVE, false);
  assert.equal('Q' in CURRENT_VISIBLE_ALCOVE, false);
});

test('pilot OFF is definition-blocked before Store because finished part geometry is not yet emitted', () => {
  const trial = ledger({ pilot: false });
  const blockers = blockingForBoundary(trial, BOUNDARY.DEFINITION);
  assert.deepEqual(blockers.map((row) => row.condition), [
    'IDENTIFIED_SIDE_OCCURRENCES_REQUIRED',
    'SHELF_FINISHED_LENGTH_REQUIRED',
    'SHELF_FINISHED_WIDTH_SET_REQUIRED',
  ]);
  assert.deepEqual(storeSubmissionReadiness(trial), {
    ready: false,
    reason: 'DEFINITION_BLOCKED',
    blockingIds: [
      'alcove.side.occurrences',
      'alcove.shelf.finishedLength',
      'alcove.shelf.finishedWidths',
    ],
  });
});

test('pilot ON adds target-occurrence binding but does not turn Store allocation into project truth', () => {
  const trial = ledger({ pilot: true });
  const blockers = blockingForBoundary(trial, BOUNDARY.DEFINITION);
  assert.deepEqual(blockers.map((row) => row.condition), [
    'IDENTIFIED_SIDE_OCCURRENCES_REQUIRED',
    'SHELF_FINISHED_LENGTH_REQUIRED',
    'SHELF_FINISHED_WIDTH_SET_REQUIRED',
    'PILOT_TARGET_OCCURRENCE_BINDING_REQUIRED',
  ]);
  assert.equal(
    trial.responsibilities.some((row) => row.id === 'alcove.store.parentAllocation'),
    false,
  );
  assert.equal(storeSubmissionReadiness(trial).ready, false);
  assert.equal(storeSubmissionReadiness(trial).reason, 'DEFINITION_BLOCKED');
});

test('Store-owned unresolved material resolution is not misclassified as the current definition blocker', () => {
  const trial = ledger({ pilot: false });
  const storeRow = trial.responsibilities.find((row) => row.id === 'alcove.store.materialResolution');
  assert.equal(storeRow.owner, OWNER.STORE);
  assert.deepEqual(storeRow.blocks, [BOUNDARY.STORE_SUBMISSION]);
  assert.equal(
    blockingForBoundary(trial, BOUNDARY.DEFINITION).some((row) => row.id === storeRow.id),
    false,
  );
});

console.log('alcove-current-demand-readiness.test.mjs ok — expected result UNRESOLVED / BRIDGE-GAP');
