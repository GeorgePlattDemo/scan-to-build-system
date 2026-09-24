import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

test('Job 1 Yard is one continuous scroll with one final customer action', () => {
  const shell=fs.readFileSync(new URL('../system-build-current.html',import.meta.url),'utf8');
  const start=shell.indexOf("ensureProjectJourneyPage('proof-yard'");
  const end=shell.indexOf("ensureProjectJourneyPage('proof-terms'",start);
  assert.ok(start>=0 && end>start);
  const yard=shell.slice(start,end);

  const buttons=[...yard.matchAll(/<button\b/g)];
  assert.equal(buttons.length,1,'Yard must expose exactly one page action');
  assert.match(yard,/data-proof-sim-action="handoff-record">CUSTOMER \/ YARD RECORD HANDOFF →<\/button>/);

  for(const oldButton of ['SIMULATE ALLOCATION','SIMULATE RELEASE','RUN CELL SIMULATION','INSPECT / LABEL / STAGE','ISSUE READY NOTICE','CONTINUE → RECEIPTS']){
    assert.equal(yard.includes(oldButton),false,'obsolete Yard button remains: '+oldButton);
  }

  assert.match(yard,/DEFINE → VERIFY → QUOTE → PURCHASE → ALLOCATE → QUEUE → TRANSLATE → LOAD → CYCLE → INSPECT → STAGE → HANDOFF/);
  assert.match(yard,/FROM CONFIRMATION TO MOTION/);
  assert.match(yard,/specialist intermediary chain is absent by architecture/);
  assert.match(yard,/FULFILLMENT REGISTER/);
  assert.match(yard,/Delivery to door \/ curb/);
  assert.match(yard,/Delivery inside/);
  assert.match(yard,/Assembly \/ installation service/);
  assert.match(yard,/READY is not custody/);
  assert.match(yard,/proof-yard-receipt-ledger/);

  assert.match(shell,/function completeProofYardSimulation\(\)/);
  assert.match(shell,/SIMULATED_ALLOCATION[\s\S]*SIMULATED_QUEUE[\s\S]*SIMULATED_PRODUCTION_RELEASE[\s\S]*SIMULATED_MACHINE_NEUTRAL_PLAN[\s\S]*SIMULATED_LOCAL_LOWERING[\s\S]*SIMULATED_CELL_READINESS[\s\S]*SIMULATED_OPERATOR_LOAD[\s\S]*SIMULATED_CYCLE_START[\s\S]*SIMULATED_EXECUTION[\s\S]*SIMULATED_INSPECTION_STAGING[\s\S]*SIMULATED_READY_NOTICE/);
  assert.match(shell,/action==='handoff-record'[\s\S]*SIMULATED_CUSTODY_TRANSFER[\s\S]*originalShow\.call\(win,'proof-record'\)/);
});
