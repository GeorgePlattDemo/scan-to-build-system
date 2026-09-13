import assert from 'node:assert/strict';
import test from 'node:test';

import {
  PROVISIONAL_DECISIONS,
  PROVISIONAL_GATE_STATUS,
  PROVISIONAL_MATERIAL_STATUS,
  createProvisionalMaterial,
  decideProvisionalMaterial,
  evaluateProvisionalMaterialGate,
  provisionalMaterialAuditRecord,
} from '../../shared/provisional-material.mjs';

function sheet() {
  return createProvisionalMaterial({
    provisionalMaterialId: 'PROVISIONAL-PLY-075-48X96-001',
    form: 'sheet',
    species: 'plywood',
    nominalThicknessIn: 0.75,
    parentWidthIn: 48,
    parentLengthIn: 96,
    requestedOps: ['ROUTE_PROFILE', 'RETAIN_TABS'],
  });
}

test('provisional material cannot impersonate a Store offering', () => {
  const entry = sheet();
  assert.equal(entry.status, 'PROVISIONAL');
  assert.equal(entry.catalogStatus, 'NOT_IN_STORE_CATALOG');
  assert.equal(entry.storeSku, null);
  assert.equal(entry.sellingPrice, null);
  assert.equal(entry.stockStatus, null);
  assert.equal(entry.supportedOps, null);
  assert.equal(entry.cellFamily, null);
  assert.equal(entry.storeDisposition, 'UNRESOLVED');
  assert.equal(entry.authority, false);
});

test('consequential provisional material raises a human resolution gate', () => {
  const gate = evaluateProvisionalMaterialGate(sheet(), { consequential: true });
  assert.equal(gate.gate, PROVISIONAL_GATE_STATUS);
  assert.equal(gate.blocked, true);
  assert.equal(gate.humanDecisionRequired, true);
  assert.equal(gate.storeOverrideAllowed, false);
  assert.equal(gate.fabricationAuthorityAllowed, false);
  assert.deepEqual([...gate.allowedDecisions].sort(), [
    'KEEP_UNRESOLVED',
    'MAP_TO_STORE_OFFERING',
    'REMOVE_OR_REPLACE',
  ]);
});

test('human may map a provisional identity but cannot mint Store support', () => {
  const decision = decideProvisionalMaterial(sheet(), {
    decision: PROVISIONAL_DECISIONS.MAP_TO_STORE_OFFERING,
    storeSku: 'STB-ZERO-PLY-075-48X96-001',
    decidedAt: '2026-09-13T20:00:00.000Z',
  });
  assert.equal(decision.status, PROVISIONAL_MATERIAL_STATUS.RESOLVED_TO_STORE_SKU);
  assert.equal(decision.requiresNewCandidateRevision, true);
  assert.equal(decision.requiresNewStoreQuestion, true);
  assert.equal(decision.requiresNewReview, true);
  assert.equal(decision.storeDisposition, null);
  assert.equal(decision.storeOverrideAllowed, false);
  assert.equal(decision.authority, false);
});

test('human may keep the material unresolved without bypassing Review', () => {
  const decision = decideProvisionalMaterial(sheet(), {
    decision: PROVISIONAL_DECISIONS.KEEP_UNRESOLVED,
    reason: 'No exact Store offering selected yet',
  });
  assert.equal(decision.status, PROVISIONAL_MATERIAL_STATUS.KEPT_UNRESOLVED);
  assert.equal(decision.storeDisposition, 'UNRESOLVED');
  assert.equal(decision.reviewMode, 'UNRESOLVED_ONLY');
  assert.equal(decision.requiresNewStoreQuestion, false);
});

test('human may remove or replace provisional material but may not attach a Store SKU to that decision', () => {
  const decision = decideProvisionalMaterial(sheet(), {
    decision: PROVISIONAL_DECISIONS.REMOVE_OR_REPLACE,
  });
  assert.equal(decision.status, PROVISIONAL_MATERIAL_STATUS.REMOVED_OR_REPLACED);
  assert.equal(decision.requiresNewCandidateRevision, true);
  assert.throws(
    () => decideProvisionalMaterial(sheet(), {
      decision: PROVISIONAL_DECISIONS.REMOVE_OR_REPLACE,
      storeSku: 'STB-ZERO-PLY-075-48X96-001',
    }),
    /storeSku/,
  );
});

test('resolution cannot be automated or turned into an override decision', () => {
  assert.throws(
    () => decideProvisionalMaterial(sheet(), {
      decision: PROVISIONAL_DECISIONS.MAP_TO_STORE_OFFERING,
      storeSku: 'STB-ZERO-PLY-075-48X96-001',
      decidedBy: 'system',
    }),
    /human decision/,
  );
  assert.throws(
    () => decideProvisionalMaterial(sheet(), { decision: 'OVERRIDE_STORE_REFUSAL' }),
    /unsupported/,
  );
});

test('audit record is decision-level and does not invent controller or Store facts', () => {
  const entry = sheet();
  const gate = evaluateProvisionalMaterialGate(entry);
  const decision = decideProvisionalMaterial(entry, {
    decision: PROVISIONAL_DECISIONS.MAP_TO_STORE_OFFERING,
    storeSku: 'STB-ZERO-PLY-075-48X96-001',
  });
  const audit = provisionalMaterialAuditRecord(entry, gate, decision);
  assert.equal(audit.kind, 'provisional-material-audit/v1');
  assert.equal(audit.humanDecisionRequired, true);
  assert.equal(audit.mappedStoreSku, 'STB-ZERO-PLY-075-48X96-001');
  assert.equal(audit.requiresNewStoreQuestion, true);
  assert.equal(audit.storeOverrideAllowed, false);
  assert.equal(audit.authority, false);
  assert.equal(JSON.stringify(audit).match(/gcode|spindle|sawblade|cycleStart/gi), null);
});
