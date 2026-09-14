import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildD001PilotCompletion,
  derivePublishedJobCompletionPreview,
} from '../../shared/completion-from-result.mjs';
import { MACHINE_FAMILIES } from '../../shared/secondary-operation-library.mjs';

test('S-001 retained tabs create one selective completion choice and mandatory labeling', () => {
  const preview = derivePublishedJobCompletionPreview({
    status: 'SUPPORTABLE',
    machineFamily: MACHINE_FAMILIES.S001,
    operationalRequirements: {
      labeling: { required: true, timing: 'WHEN_PART_OR_PACKAGE_LEAVES_PRIMARY_CELL_STREAM' },
      sheetDrillingThisRound: false,
      tabRemovalSelective: true,
    },
    retention: {
      requestedTabCount: 4,
      plannedTabCount: 5,
      physicalRetentionStatus: 'NOT_MEASURED',
      secondarySeparation: 'REQUIRED',
    },
  });

  assert.equal(preview.eligible, true);
  assert.equal(preview.machineFamily, 'S001');
  assert.equal(preview.labeling.required, true);
  assert.equal(preview.labeling.selective, false);
  assert.equal(preview.secondarySelectionRequired, true);
  assert.equal(preview.lines.length, 1);
  assert.equal(preview.lines[0].primaryContribution.status, 'PARTIAL');
  assert.equal(preview.lines[0].residualOperation.operationClass, 'REMOVE_RETAINED_TABS');
  assert.equal(preview.lines[0].residualOperation.selectionRequired, true);
  assert.equal(preview.lines[0].residualOperation.autoSelected, false);
  assert.equal(preview.lines[0].selectedOption, null);
  assert.equal(preview.operatorMayPromote, false);
});

test('S-001 drilling is a hard stop for this round', () => {
  assert.throws(
    () => derivePublishedJobCompletionPreview({
      status: 'SUPPORTABLE',
      machineFamily: MACHINE_FAMILIES.S001,
      operationalRequirements: {
        labeling: { required: true },
        sheetDrillingThisRound: true,
      },
    }),
    /S-001 drilling is not admitted/,
  );
});

test('D-001 square cut creates no fake secondary operation but still requires labeling', () => {
  const preview = derivePublishedJobCompletionPreview({
    status: 'SUPPORTABLE',
    machineFamily: MACHINE_FAMILIES.D001,
    operationalRequirements: { labeling: { required: true } },
  });
  assert.equal(preview.eligible, true);
  assert.equal(preview.secondarySelectionRequired, false);
  assert.equal(preview.lines[0].primaryContribution.operationClass, 'CROSSCUT');
  assert.equal(preview.lines[0].primaryContribution.status, 'COMPLETE');
  assert.equal(preview.lines[0].residualOperation, null);
  assert.equal(preview.labeling.required, true);
});

test('D-001 pilot smaller than finished hole creates explicit selectable final drilling', () => {
  const line = buildD001PilotCompletion({ finalDiameterIn: 0.375, pilotDiameterIn: 0.1875 });
  assert.equal(line.machineFamily, 'D001');
  assert.equal(line.requirement.finalDiameterIn, 0.375);
  assert.equal(line.primaryContribution.operationClass, 'PILOT_DRILL');
  assert.equal(line.primaryContribution.diameterIn, 0.1875);
  assert.equal(line.residualOperation.operationClass, 'FINAL_DRILL_TO_DIAMETER');
  assert.equal(line.residualOperation.selectionRequired, true);
  assert.equal(line.selectedOption, null);
});

test('Store refusal blocks completion rather than converting it to secondary work', () => {
  const preview = derivePublishedJobCompletionPreview({
    status: 'REFUSED',
    machineFamily: MACHINE_FAMILIES.S001,
    operationalRequirements: { labeling: { required: true }, sheetDrillingThisRound: false },
    retention: { plannedTabCount: 5 },
  });
  assert.equal(preview.eligible, false);
  assert.equal(preview.reason, 'STORE_DISPOSITION_NOT_SUPPORTABLE');
  assert.deepEqual(preview.lines, []);
  assert.equal(preview.secondarySelectionRequired, false);
});

test('published answers cannot make mandatory labeling optional', () => {
  for (const machineFamily of [MACHINE_FAMILIES.D001, MACHINE_FAMILIES.S001]) {
    for (const status of ['SUPPORTABLE', 'REFUSED']) {
      const preview = derivePublishedJobCompletionPreview({
        status,
        machineFamily,
        operationalRequirements: { labeling: { required: false } },
      });
      assert.equal(preview.labeling.required, true);
      assert.equal(preview.labeling.selective, false);
    }
  }
});
