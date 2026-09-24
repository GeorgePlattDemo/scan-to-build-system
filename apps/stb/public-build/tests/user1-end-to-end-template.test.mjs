import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const shell = fs.readFileSync('system-build-current.html','utf8');
const frame = fs.readFileSync('three-frames.html','utf8');
const contractSource = fs.readFileSync('stb-store-handoff-contract.js','utf8');

const sandbox={window:{}};
vm.runInNewContext(contractSource,sandbox,{filename:'stb-store-handoff-contract.js'});
const contract=sandbox.window.STBStoreHandoffContract;

const STORE_SHA='140217b0aed64725d26b0d9332e3bf7b5d4396e0';
const SYSTEM_SHA='59a9c0326c1afea7af3767e1ed89bf6465a4b809';
const INPUT_HASH='f0918ff545e3d77d8d5ec33055d7279bb01dbe172bb4e6cc4d498469d66b2e82';
const RESULT_HASH='2abe991dbd5331f7fa3762018fed9cc707b637d4512ba62f7fc8fe1e4e28587a';

const exactDemand={
  configurationId:'SYO-USER1-XBRACE',
  configurationVersion:'0.1',
  definedWorkpieceLengthIn:60,
  sawAngleDeg:30,
  cutPlane:'miter-face',
  endIdentity:'both',
  endRelation:'parallel',
  lengthDatum:'long-long-outer-edge',
  datumCMethod:'REFERENCE_CUT',
  requiredOps:['MITER_LIMITED','SPOT_ON_LOCATION'],
  declaredSawCuts:3,
  declaredSpotCount:2,
  parts:[
    {partId:'PART-1',lengthIn:16,features:[{featureId:'SPOT-1',kind:'SPOT_ON_LOCATION',xIn:8,locationRule:'CENTERED_ON_PART',acrossWidthRule:'CENTERED_ON_WIDE_FACE'}]},
    {partId:'PART-2',lengthIn:16,features:[{featureId:'SPOT-2',kind:'SPOT_ON_LOCATION',xIn:8,locationRule:'CENTERED_ON_PART',acrossWidthRule:'CENTERED_ON_WIDE_FACE'}]},
  ],
};

const storeAnswer=contract.resolveUser1StoreReference(exactDemand);
assert.equal(storeAnswer.complete,true,'Job 1 did not obtain a complete Store answer');
assert.equal(storeAnswer.status,'MATCHED_STORE_REFERENCE');
assert.equal(storeAnswer.source.storePin,STORE_SHA);
assert.equal(storeAnswer.source.systemIntegrationPin,SYSTEM_SHA);
assert.equal(storeAnswer.calculationIdentity.inputHash,INPUT_HASH);
assert.equal(storeAnswer.calculationIdentity.resultHash,RESULT_HASH);
assert.equal(storeAnswer.material,2.61);
assert.equal(storeAnswer.machineService,5.89);
assert.equal(storeAnswer.combinedValue,8.50);
assert.equal(storeAnswer.estimate.cycle.T_job_min,1.4128);
assert.equal(storeAnswer.materialResolution.pricingReferenceSku,'STB-ZERO-SPF-2X4-60-001');
assert.equal(storeAnswer.materialResolution.pricingReferenceStockLengthIn,60);
assert.equal(storeAnswer.materialResolution.selectionPolicy,'SHORTEST_COMPLETE_STORE_OFFERING');

const formalStoreAnswerA=contract.requestUser1StoreEvaluation(exactDemand,{
  requestId:'JOB1-E2E-A',
  currentStorePin:STORE_SHA,
  checkedAt:'2026-09-22T18:50:00.000Z'
});
const formalStoreAnswerB=contract.requestUser1StoreEvaluation(exactDemand,{
  requestId:'JOB1-E2E-B',
  currentStorePin:STORE_SHA,
  checkedAt:'2026-09-22T18:51:00.000Z'
});
assert.equal(formalStoreAnswerA.complete,true);
assert.equal(formalStoreAnswerA.freshEvaluation,true);
assert.equal(formalStoreAnswerB.complete,true);
assert.notEqual(formalStoreAnswerA.evaluationReceipt.requestId,formalStoreAnswerB.evaluationReceipt.requestId);
assert.equal(formalStoreAnswerA.calculationIdentity.inputHash,INPUT_HASH);
assert.equal(formalStoreAnswerA.calculationIdentity.resultHash,RESULT_HASH);
assert.equal(contract.sameUser1StoreAnswerIdentity(storeAnswer,formalStoreAnswerA),true);

// ENTRY / DEFINE
assert.match(frame,/Start your own project/);
assert.match(frame,/2×4 · 60 in/);
assert.match(frame,/id="stb-config-length"[^>]*min="16"[^>]*max="18"[^>]*value="16"/);
assert.match(frame,/data-length="16">16 IN/);
assert.match(frame,/data-length="18">18 IN/);
assert.equal(frame.includes('id="stb-config-angle"'),false);
assert.equal(frame.includes('data-parts='),false);
assert.equal(frame.includes('data-spot='),false);
assert.match(frame,/18\.000 in → 26\.388° end cuts/);
assert.match(frame,/Center spot = 16 ÷ 2 = 8 in/);
assert.match(shell,/definitionId:'SYO-USER1-XBRACE-0\.1'/);
assert.match(shell,/configurationId = 'SYO-USER1-XBRACE'/);
assert.match(shell,/endpoint16[\s\S]*?endpoint18[\s\S]*?'0\.1'[\s\S]*?'0\.2'/);
assert.match(shell,/DEMO_HORIZONTAL_SPAN_IN = 8/);
assert.match(shell,/Math\.asin\(spanRatio\)/);
assert.equal(shell.includes('GROW_TO_RETAINED_CONTROL'),false);
assert.match(shell,/parts = Array\.from/);
assert.match(shell,/requiredOps\.push\('SPOT_ON_LOCATION'\)/);
assert.match(shell,/resolveUser1StoreReference\(storeDemand\)/);

// CHANGED DEFINITIONS GO TO THE LIVE STORE. No browser-side answer is substituted.
assert.match(shell,/LIVE STORE EVALUATION REQUIRED/);
assert.match(shell,/confirmButton\.disabled = !runtimeAvailable/);

// CONFIRM performs a fresh USER_DEFINED_BOARD_V1 request on every press, then creates the Job 1 handoff.
assert.match(shell,/job:'JOB 1 · START YOUR OWN'/);
assert.match(shell,/source:'start-own'/);
assert.match(shell,/storeReference:freshStoreReference/);
assert.match(shell,/stb-proof-handoff-job1/);
assert.match(shell,/originalShow\.call\(win,'proof-store'\)/);
assert.match(shell,/stb-user-defined-board-runtime-bridge\.js\?v=132f1266/);
assert.match(shell,/const requestId = nextStoreRequestId\(definition\)/);
assert.match(shell,/user1RuntimeBridge\.request\(definition\.storeDemand/);
assert.match(shell,/freshEvaluation\?\.freshEvaluation === true/);
assert.match(shell,/freshReceipt\?\.requestId === requestId/);
assert.equal(shell.includes('currentStoreAuthorityUrl'),false,'Job 1 still floats on Store main');
assert.equal(shell.includes('sameUser1StoreAnswerIdentity(definition.storeReference'),false,'Job 1 still compares live Store to old static identity');
assert.equal(shell.includes('stbLastConfirmed'),false,'Job 1 Store-send button became one-use again');

// Canonical downstream actor mapping for Job 1.
assert.match(shell,/'start-own': Object\.freeze\(\{[\s\S]*?store:'proof-store'[\s\S]*?request:'proof-accept'[\s\S]*?yard:'proof-yard'[\s\S]*?terms:'proof-yard'[\s\S]*?record:'proof-record'/);

// Gate navigation is sequential from Store answer to one continuous Yard surface and final custody record.
assert.match(shell,/data-proof-go="proof-accept">CONTINUE → ACCEPT \/ PAY/);
assert.match(shell,/id="proof-accept-pay-yard"[^>]*data-proof-sim-action="accept-pay-yard">ACCEPT ESTIMATE \/ PAY \/ SEND TO YARD →/);
assert.match(shell,/id="proof-yard-handoff"[^>]*data-proof-sim-action="handoff-record">CUSTOMER \/ YARD RECORD HANDOFF →/);
assert.match(shell,/1 · Your idea/);
assert.match(shell,/3 · The Store answers/);
assert.match(shell,/05 · FROM CONFIRMATION TO MOTION/);
assert.match(shell,/PICKED UP\. GO FIX THAT BENCH\./);
assert.match(shell,/YOU BUILD\./);
assert.equal(shell.includes('id="proof-yard-next"'),false,'Job 1 Yard still has a separate receipts-next button');
assert.match(shell,/canOpenStartOwnSimulationStage/);
assert.match(shell,/stage==='yard'[\s\S]*SIMULATED_PAYMENT/);
assert.match(shell,/stage==='record'[\s\S]*SIMULATED_CUSTODY_TRANSFER/);

// Each downstream gate exposes the same custody spine.
for(const gate of ['store','accept','yard','terms','record']){
  assert.match(shell,new RegExp('id="proof-'+gate+'-pin"'),'missing Store SHA field on '+gate);
  assert.match(shell,new RegExp('id="proof-'+gate+'-input-hash"'),'missing input hash field on '+gate);
  assert.match(shell,new RegExp('id="proof-'+gate+'-result-hash"'),'missing result hash field on '+gate);
}
for(const gate of ['store','accept','yard','terms','record']){
  assert.match(
    shell,
    new RegExp("'proof-"+gate+"-pin'"),
    'Store SHA is not synchronized into '+gate
  );
  assert.match(
    shell,
    new RegExp("'proof-"+gate+"-input-hash'"),
    'input hash is not synchronized into '+gate
  );
  assert.match(
    shell,
    new RegExp("'proof-"+gate+"-result-hash'"),
    'result hash is not synchronized into '+gate
  );
}

// Store answer remains the only economics engine.
assert.match(shell,/MODELED MACHINE SERVICE/);
assert.match(shell,/STORE BUDGETARY Q/);
assert.match(shell,/machine_service/);
assert.match(shell,/estimate\?\.cycle\?\.T_job_min/,'visible Job 1 must present Store-returned modeled time rather than hard-code a cycle value');
assert.equal(shell.includes('quoteStartOwnBoardSequence'),false,'Job 1 has a second browser pricing engine');
assert.equal(shell.includes('machineHourRate'),false,'Job 1 browser contains a Store machine rate');
assert.equal(shell.includes('setupCharge'),false,'Job 1 browser contains a Store setup charge');

// ACCEPT/PAY: one customer action preserves three explicit commerce receipts.
assert.match(shell,/← GO BACK \/ CHANGE DEFINITION/);
assert.match(shell,/ACCEPT ESTIMATE \/ PAY \/ SEND TO YARD →/);
assert.match(shell,/data-proof-sim-action="accept-pay-yard"/);
assert.equal(shell.includes('CREATE SIMULATED OFFER'),false,'Accept/Pay still exposes the old offer button');
assert.equal(shell.includes('ACCEPT SIMULATED OFFER'),false,'Accept/Pay still exposes the old acceptance button');
assert.match(shell,/SIMULATED_OFFER/);
assert.match(shell,/SIMULATED_ACCEPTANCE/);
assert.match(shell,/SIMULATED_PAYMENT/);
assert.match(shell,/no money moved/);
assert.match(shell,/modeled machine-service portion for this exact definition/);
assert.match(shell,/proof-accept-service-copy/);

// STORE/YARD: the accepted demonstration runs the internal simulation in sequence and exposes it in one scroll.
for(const type of [
  'SIMULATED_ALLOCATION',
  'SIMULATED_QUEUE',
  'SIMULATED_PRODUCTION_RELEASE',
  'SIMULATED_MACHINE_NEUTRAL_PLAN',
  'SIMULATED_LOCAL_LOWERING',
  'SIMULATED_CELL_READINESS',
  'SIMULATED_OPERATOR_LOAD',
  'SIMULATED_CYCLE_START',
  'SIMULATED_EXECUTION',
  'SIMULATED_INSPECTION_STAGING',
  'SIMULATED_READY_NOTICE',
]){
  assert.match(shell,new RegExp(type));
}
for(const oldButton of ['SIMULATE ALLOCATION','SIMULATE RELEASE','RUN CELL SIMULATION','ISSUE READY NOTICE']){
  assert.equal(shell.includes(oldButton),false,'Yard still exposes internal event button: '+oldButton);
}
assert.match(shell,/DEFINE → VERIFY → QUOTE → PURCHASE → ALLOCATE → QUEUE → TRANSLATE → LOAD → CYCLE → INSPECT → STAGE → HANDOFF/);
assert.match(shell,/NO BLOOD ON WOOD/);
assert.match(shell,/Scrolling creates no event/);
assert.match(shell,/FROM CONFIRMATION TO MOTION/);
assert.match(shell,/specialist intermediary chain is absent by architecture/);
assert.match(shell,/candidate bounded cell/);
assert.match(shell,/proof-yard-receipt-ledger/);

// RECEIPTS are tied to the exact Store evaluation/result identity.
assert.match(shell,/receiptIdentity=economics\.storeReceipt\?\.receiptHash\|\|economics\.storeReceipt\?\.requestId\|\|economics\.resultHash/);
assert.match(shell,/receiptId:'SIM-'/);

// RECORD closes only after the Yard handoff creates separate custody.
assert.match(shell,/CUSTOMER \/ YARD RECORD HANDOFF →/);
assert.match(shell,/SIMULATED_CUSTODY_TRANSFER/);
assert.match(shell,/READY is not custody/);
assert.match(shell,/CLOSED · SIMULATED OWNER RECORD/);
assert.match(shell,/PHYSICAL FABRICATION<\/b><span>NOT CLAIMED · SIMULATION ONLY/);

// The downstream simulation never claims live commerce, inventory, or motion.
assert.match(shell,/No money moves/);
assert.match(shell,/No physical stock is reserved/);
assert.match(shell,/no live inventory reserved/);
assert.match(shell,/no physical production authority created/);
assert.match(shell,/no live motion or controller command/);

// Template authority: Review points to the tested Store and System candidates.
assert.equal(contract.storeAuthority('startOwn').economicsPin,STORE_SHA);
assert.equal(contract.user1StoreReference.source.storePin,STORE_SHA);
assert.equal(contract.user1StoreReference.source.systemIntegrationPin,SYSTEM_SHA);
assert.equal(contract.user1StoreReference.estimate.calculationIdentity.inputHash,INPUT_HASH);
assert.equal(contract.user1StoreReference.estimate.calculationIdentity.resultHash,RESULT_HASH);


const exactDemand18={
  configurationId:'SYO-USER1-XBRACE',
  configurationVersion:'0.2',
  definedWorkpieceLengthIn:60,
  sawAngleDeg:26.387799961243,
  cutPlane:'miter-face',
  endIdentity:'both',
  endRelation:'parallel',
  lengthDatum:'long-long-outer-edge',
  datumCMethod:'REFERENCE_CUT',
  requiredOps:['MITER_LIMITED','SPOT_ON_LOCATION'],
  declaredSawCuts:3,
  declaredSpotCount:2,
  parts:[
    {partId:'PART-1',lengthIn:18,features:[{featureId:'SPOT-1',kind:'SPOT_ON_LOCATION',xIn:9,locationRule:'CENTERED_ON_PART',acrossWidthRule:'CENTERED_ON_WIDE_FACE'}]},
    {partId:'PART-2',lengthIn:18,features:[{featureId:'SPOT-2',kind:'SPOT_ON_LOCATION',xIn:9,locationRule:'CENTERED_ON_PART',acrossWidthRule:'CENTERED_ON_WIDE_FACE'}]},
  ],
};
const storeAnswer18=contract.resolveUser1StoreReference(exactDemand18);
assert.equal(storeAnswer18.complete,true);
assert.equal(storeAnswer18.source.storePin,STORE_SHA);
assert.equal(storeAnswer18.materialResolution.workpieceLengthIn,72);
assert.equal(storeAnswer18.materialResolution.pricingReferenceStockLengthIn,72);
assert.equal(storeAnswer18.materialResolution.selectionPolicy,'SHORTEST_COMPLETE_STORE_OFFERING');
assert.deepEqual(
  Array.from(storeAnswer18.materialResolution.consideredCandidates).map(entry=>[entry.storeSku,entry.stockLengthIn,entry.candidateStatus,entry.reason]),
  [
    ['STB-ZERO-SPF-2X4-60-001',60,'REFUSED','LAST_REMAIN_BELOW_TWO_ROLLER_CONTROL'],
    ['STB-ZERO-SPF-2X4-72-001',72,'SUPPORTABLE',null]
  ]
);
assert.equal(storeAnswer18.material,3.13);
assert.equal(storeAnswer18.machineService,5.90);
assert.equal(storeAnswer18.combinedValue,9.03);
assert.equal(storeAnswer18.estimate.cycle.T_job_min,1.4151);
assert.equal(storeAnswer18.estimate.travel.finalRemainderIn,35.625);
assert.equal(storeAnswer18.calculationIdentity.inputHash,'4b3b498d86177ed5a13c2662778f232b2c11cfafa7f626a689b3823b6872a4cc');
assert.equal(storeAnswer18.calculationIdentity.resultHash,'59c9988c42ffd2520f6c1931d735a31e07848d72ac602182c510a17c20b89e88');
assert.equal(shell.includes('candidateReference'),false);
assert.equal(shell.includes('CANDIDATE STORE PIN'),false);

// A moved Store authority invalidates the displayed result even when the definition did not change.
const staleStoreAnswer=contract.requestUser1StoreEvaluation(exactDemand,{
  requestId:'JOB1-E2E-STALE',
  currentStorePin:'0000000000000000000000000000000000000000',
  checkedAt:'2026-09-22T18:52:00.000Z'
});
assert.equal(staleStoreAnswer.status,'STORE_AUTHORITY_CHANGED');
assert.equal(staleStoreAnswer.complete,false);
assert.equal(staleStoreAnswer.combinedValue,null);

// Any changed governing input is not allowed to borrow Job 1's Store result.
for(const changed of [
  {...exactDemand,configurationVersion:'0.2'},
  {...exactDemand,sawAngleDeg:31},
  {...exactDemand,declaredSawCuts:2},
  {...exactDemand,parts:[{...exactDemand.parts[0],lengthIn:17},exactDemand.parts[1]]},
]){
  const answer=contract.resolveUser1StoreReference(changed);
  assert.equal(answer.status,'STORE_REFRESH_REQUIRED');
  assert.equal(answer.complete,false);
  assert.equal(answer.combinedValue,null);
}

// No live machine/control vocabulary crosses the browser boundary.
assert.equal(/\bG0?\d\b|\bM0?3\b|G-code|remote Cycle Start/i.test(shell+frame),false);

console.log('PASS · JOB 1 OPERABLE TEMPLATE · intent → definition → Store → simulated accept/pay → simulated yard → receipts → simulated handoff/record');
