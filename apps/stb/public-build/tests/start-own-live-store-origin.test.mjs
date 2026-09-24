import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const read = path => fs.readFileSync(path,'utf8');
const surface = read('three-frames.html');
const shell = read('system-build-current.html');
const contractSource = read('stb-store-handoff-contract.js');
const runtimeBridgeSource = read('stb-user-defined-board-runtime-bridge.js');

// Landing remains the simple Scan-to-Build entry / intent surface.
assert.match(surface,/id="stb-start-intent-screen"/);
assert.match(surface,/Start your own project/);
for(const label of ['1×6 pine','1×6 poplar','1×6 cherry','1×8 oak','2×4 stud','¾ plywood']){
  assert.ok(surface.includes(label),'missing landing material choice '+label);
}
for(const key of ['1x6p','1x6w','1x6c','1x8o','2x4','p75']){
  assert.match(surface,new RegExp('data-store-size-key="'+key+'"'),'missing Store glossary key '+key);
}
assert.match(surface,/These material choices are checked against the current Store/);
assert.match(surface,/Grab a board from the Store and tell us what you want done to it/);
assert.match(surface,/2 parts/);
assert.match(surface,/16 in each/);
assert.match(surface,/30° ends/);
assert.match(surface,/center spot/);
assert.match(surface,/Center spot = 16 ÷ 2 = 8 in/);
assert.match(surface,/TAKE THIS 2×4 TO THE BENCH →/);
assert.equal(surface.includes('<p>2×6 stud</p>'),false);
assert.equal(surface.includes('<p>2×8 stud</p>'),false);
assert.equal(surface.includes('FRAME 1 · THE WARM INTRO'),false);
assert.equal(surface.includes('>USER 1 INTENT<'),false);
assert.equal(surface.includes('PREVIEW — the three frames'),false);

// Bench is a separate, full project-working surface.
assert.match(surface,/id="stb-start-bench-screen" hidden/);
assert.match(surface,/id="stb-bench-back">← Back/);
assert.match(surface,/id="stb-bench-library">← PROJECT LIBRARY/);
assert.match(surface,/Make it yours/);
assert.match(surface,/id="stb-bench-intent-slot"/);
assert.match(surface,/THE SAME BOARD, ON THE BENCH/);
assert.match(surface,/2×4 · 60 in/,'60-in defined workpiece changed');
assert.match(surface,/27⅝ in remains/,'60-in retained math changed');
assert.match(surface,/3⅝ in spare/,'60-in spare math changed');
assert.match(surface,/id="stb-bench-controls"/);
assert.match(surface,/One change\. Same span\./);
assert.match(surface,/id="stb-config-length"[^>]*min="16"[^>]*max="18"[^>]*value="16"/);
assert.match(surface,/data-length="16">16 IN/);
assert.match(surface,/data-length="18">18 IN/);
assert.match(surface,/18\.000 in → 26\.388° end cuts/);
assert.equal(surface.includes('id="stb-config-angle"'),false,'customer angle control returned');
assert.equal(surface.includes('data-parts='),false,'quantity choices returned');
assert.equal(surface.includes('data-spot='),false,'spot choices returned');
assert.match(surface,/RESULTING DEFINITION \/ REFERENCE ORDER — USER 1/);
assert.match(surface,/<span>Store-selected workpiece<\/span><span id="stb-def-workpiece">60 in<\/span>/);
assert.match(shell,/setText\('stb-def-workpiece',formatInches\(demand\.definedWorkpieceLengthIn\)\)/);
assert.match(surface,/MATERIAL REQUIRED/);
assert.match(surface,/REFERENCE CALCULATED PRICE/);
assert.match(surface,/STORE \/ PRICE BASIS/);
assert.match(surface,/id="stb-basis-unit-price"/);
assert.match(surface,/id="stb-basis-cell-family"/);
assert.match(surface,/id="stb-basis-supported-ops"/);
assert.match(surface,/Before you send it/);
assert.match(surface,/CONFIRM &amp; SEND TO STORE ZERO →/);
assert.match(surface,/id="stb-bench-dynamic-geometry"/);

// Host carries one definition through intent, bench, Store, Terms and record.
assert.match(shell,/three-frames\.html\?v=8fbe4542/);
assert.match(shell,/const definedWorkpieceLengthIn = 60;/);
assert.match(shell,/DEMO_HORIZONTAL_SPAN_IN = 8/);
assert.match(shell,/Math\.asin\(spanRatio\)/);
assert.match(shell,/parentLengthIn:effectiveWorkpieceLengthIn/);
assert.equal(shell.includes('GROW_TO_RETAINED_CONTROL'),false);
assert.match(shell,/materialSource:'STORE_ZERO'/);
assert.equal(shell.includes('sequenceDefinedWorkpiece'),false,'visible User 1 still performs Store travel/control sequencing in the browser');
assert.match(shell,/resolveUser1StoreReference/);
assert.equal(shell.includes('preparationSawCuts'),false,'phantom Store preparation cut returned');
assert.match(shell,/requiredOps\.push\('SPOT_ON_LOCATION'\)/);
assert.match(shell,/parts = Array\.from/);
assert.equal(shell.includes('previewFromDemand'),false,'active Start Own still invokes legacy Store preview authority');
assert.equal(shell.includes('quoteStartOwnBoardSequence'),false,'visible User 1 reintroduced browser-side pricing');
assert.equal(shell.includes('machineHourRate'),false,'visible User 1 reintroduced Store rate logic');
assert.equal(shell.includes('setupCharge'),false,'visible User 1 reintroduced Store setup-charge logic');
assert.match(shell,/STORE_REFRESH_REQUIRED/);
assert.match(shell,/stb-user-defined-board-runtime-bridge\.js\?v=132f1266/);
assert.match(shell,/user1RuntimeBridge\.request\(definition\.storeDemand/);
assert.equal(shell.includes('currentStoreAuthorityUrl'),false,'active Start Own still floats on Store main');
assert.equal(shell.includes('stbLastConfirmed'),false,'Store-send button regressed to one-use behavior');
assert.match(shell,/const spotDemand =/);
assert.match(shell,/physicalDemand\.spotDemand = spotDemand/);
assert.match(shell,/formula:'finishedLengthIn \/ 2'/);
assert.match(shell,/renderBoardGeometry\(definition\)/);
assert.match(shell,/showStartOwnStage\('intent'\)/);
assert.match(shell,/showStartOwnStage\('bench'\)/);
assert.match(shell,/definitionId:'SYO-USER1-XBRACE-0\.1'/);
assert.match(shell,/originalShow\.call\(win,'proof-store'\)/);
assert.match(shell,/ensureProjectJourneyPage\('proof-terms'/);
assert.match(shell,/terms:'proof-yard'/);
assert.equal(shell.includes("target==='proof-record' && go.closest('#proof-yard')"),false,'Job 1 still forces the separate receipts detour');
assert.match(shell,/setTimeout\(\(\) => showStartOwnStage\('bench'\),0\)/);
assert.match(shell,/STORE BUDGETARY Q<\/b><span id="proof-store-q"/);
assert.match(shell,/data-proof-sim-action="accept-pay-yard"/);
assert.match(shell,/ACCEPT ESTIMATE \/ PAY \/ SEND TO YARD →/);
assert.match(shell,/SIMULATED_OFFER/);
assert.match(shell,/SIMULATED_ACCEPTANCE/);
assert.match(shell,/SIMULATED_PAYMENT/);
assert.match(shell,/completeProofYardSimulation\(\)/);
assert.match(shell,/SIMULATED_QUEUE/);
assert.match(shell,/SIMULATED_MACHINE_NEUTRAL_PLAN/);
assert.match(shell,/SIMULATED_LOCAL_LOWERING/);
assert.match(shell,/SIMULATED_OPERATOR_LOAD/);
assert.match(shell,/SIMULATED_CYCLE_START/);
assert.match(shell,/CUSTOMER \/ YARD RECORD HANDOFF →/);
assert.match(shell,/No money moves/);
assert.equal(shell.includes('START-OWN-CLASS-SCOPED-RECOVERY-NOT-PUBLISHED'),false);
assert.equal(shell.includes('60-in customer board'),false);
assert.equal(shell.includes('photo, board, or file you already have'),false);
assert.equal(shell.includes('parentLengthIn = 72'),false);

// The live bridge is transport/correlation only; it does not reclaim Store decisions.
assert.match(runtimeBridgeSource,/USER_DEFINED_BOARD_V1/);
assert.match(runtimeBridgeSource,/stb-store-runtime\.json/);
assert.match(runtimeBridgeSource,/materialDemand:\{species:'spf',form:'board',nominalT:2,nominalW:4\}/);
for (const forbidden of ['sellingPrice','machineHourRate','setupCharge','parentLengthIn','storeSku:']) {
  assert.equal(runtimeBridgeSource.includes(forbidden),false,'live User 1 bridge reclaimed Store authority: '+forbidden);
}

// Shared contract begins at the frozen 60-in workpiece and preserves the resolved 3/16 spot meaning.
const sandbox = {window:{}};
vm.runInNewContext(contractSource,sandbox,{filename:'stb-store-handoff-contract.js'});
const contract = sandbox.window.STBStoreHandoffContract;
assert.equal(contract.version,'0.9');
assert.equal(typeof contract.quoteStartOwnBoardSequence,'undefined');
assert.equal(typeof contract.resolveUser1StoreReference,'function');
assert.equal(typeof contract.requestUser1StoreEvaluation,'function');
assert.equal(typeof contract.sequenceDefinedWorkpiece,'function');

const lineage = contract.sequenceDefinedWorkpiece({
  definedWorkpieceLengthIn:60,
  parts:[16,16],
  establishAngledEnd:true
});
assert.equal(lineage.status,'SEQUENCED');
assert.equal(lineage.rawStockLengthIn,undefined);
assert.equal(lineage.preparation,undefined);
assert.equal(lineage.definedWorkpieceLengthIn,60);
assert.equal(lineage.production.length,3);
assert.equal(lineage.production[0].kind,'ESTABLISH_ANGLE');
assert.equal(lineage.finalRemainderIn,27.625);
assert.equal(lineage.holdIn,24);
assert.equal(lineage.finalRemainderIn-lineage.holdIn,3.625);

const exactStoreAnswer = contract.resolveUser1StoreReference({
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
    {partId:'PART-2',lengthIn:16,features:[{featureId:'SPOT-2',kind:'SPOT_ON_LOCATION',xIn:8,locationRule:'CENTERED_ON_PART',acrossWidthRule:'CENTERED_ON_WIDE_FACE'}]}
  ]
});
assert.equal(exactStoreAnswer.status,'MATCHED_STORE_REFERENCE');
assert.equal(exactStoreAnswer.complete,true);
assert.equal(exactStoreAnswer.capabilityStatus,'SUPPORTABLE');
assert.equal(exactStoreAnswer.priceCompleteness,'COMPLETE_FOR_TRAVEL_STANDARD');
assert.equal(exactStoreAnswer.material,2.61);
assert.equal(exactStoreAnswer.machineService,5.89);
assert.equal(exactStoreAnswer.combinedValue,8.50);
assert.equal(exactStoreAnswer.estimate.cycle.T_job_min,1.4128);
assert.equal(exactStoreAnswer.estimate.travel.derivedSawCuts,3);
assert.equal(exactStoreAnswer.estimate.travel.derivedSpotCount,2);
assert.equal(exactStoreAnswer.estimate.travel.finalRemainderIn,27.625);
assert.equal(exactStoreAnswer.materialResolution.pricingReferenceSku,'STB-ZERO-SPF-2X4-60-001');
assert.equal(exactStoreAnswer.materialResolution.pricingReferenceStockLengthIn,60);
assert.equal(exactStoreAnswer.materialResolution.selectionPolicy,'SHORTEST_COMPLETE_STORE_OFFERING');
assert.equal(exactStoreAnswer.estimate.engine.version,'0.3.0');
assert.equal(exactStoreAnswer.source.storePin,'140217b0aed64725d26b0d9332e3bf7b5d4396e0');
assert.equal(exactStoreAnswer.calculationIdentity.inputHash,'f0918ff545e3d77d8d5ec33055d7279bb01dbe172bb4e6cc4d498469d66b2e82');
assert.equal(exactStoreAnswer.calculationIdentity.resultHash,'2abe991dbd5331f7fa3762018fed9cc707b637d4512ba62f7fc8fe1e4e28587a');


const exactStoreAnswer18 = contract.resolveUser1StoreReference({
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
    {partId:'PART-2',lengthIn:18,features:[{featureId:'SPOT-2',kind:'SPOT_ON_LOCATION',xIn:9,locationRule:'CENTERED_ON_PART',acrossWidthRule:'CENTERED_ON_WIDE_FACE'}]}
  ]
});
assert.equal(exactStoreAnswer18.status,'MATCHED_STORE_REFERENCE');
assert.equal(exactStoreAnswer18.complete,true);
assert.equal(exactStoreAnswer18.materialResolution.workpieceLengthIn,72);
assert.equal(exactStoreAnswer18.materialResolution.pricingReferenceStockLengthIn,72);
assert.equal(exactStoreAnswer18.materialResolution.selectionPolicy,'SHORTEST_COMPLETE_STORE_OFFERING');
assert.equal(exactStoreAnswer18.calculationIdentity.inputHash,'4b3b498d86177ed5a13c2662778f232b2c11cfafa7f626a689b3823b6872a4cc');
assert.equal(exactStoreAnswer18.calculationIdentity.resultHash,'59c9988c42ffd2520f6c1931d735a31e07848d72ac602182c510a17c20b89e88');
assert.equal(exactStoreAnswer18.machineService,5.90);
assert.equal(exactStoreAnswer18.combinedValue,9.03);
assert.equal(exactStoreAnswer18.estimate.cycle.T_job_min,1.4151);
assert.equal(exactStoreAnswer18.estimate.travel.finalRemainderIn,35.625);
assert.equal(exactStoreAnswer18.source.storePin,'140217b0aed64725d26b0d9332e3bf7b5d4396e0');
const freshStoreAnswer = contract.requestUser1StoreEvaluation({
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
    {partId:'PART-2',lengthIn:16,features:[{featureId:'SPOT-2',kind:'SPOT_ON_LOCATION',xIn:8,locationRule:'CENTERED_ON_PART',acrossWidthRule:'CENTERED_ON_WIDE_FACE'}]}
  ]
},{
  requestId:'START-OWN-RECHECK',
  currentStorePin:'140217b0aed64725d26b0d9332e3bf7b5d4396e0',
  checkedAt:'2026-09-22T18:55:00.000Z'
});
assert.equal(freshStoreAnswer.complete,true);
assert.equal(freshStoreAnswer.freshEvaluation,true);
assert.equal(freshStoreAnswer.evaluationReceipt.requestId,'START-OWN-RECHECK');

const changedRevision = contract.resolveUser1StoreReference({
  configurationId:'SYO-USER1-XBRACE',
  configurationVersion:'review-revision-2',
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
    {partId:'PART-2',lengthIn:16,features:[{featureId:'SPOT-2',kind:'SPOT_ON_LOCATION',xIn:8,locationRule:'CENTERED_ON_PART',acrossWidthRule:'CENTERED_ON_WIDE_FACE'}]}
  ]
});
assert.equal(changedRevision.status,'STORE_REFRESH_REQUIRED');
assert.equal(changedRevision.complete,false);
assert.equal(changedRevision.estimate,null);
assert.deepEqual(Array.from(changedRevision.unresolvedConditions),['STORE_REFRESH_REQUIRED']);

const legacyPart = {
  stockClass:'2x4',finishedLength:15.5,quantity:8,endCondition:'angled',straightCut:true,
  angleDegrees:10,angleReference:'source-stated',cutPlane:'bevel-thickness',
  endIdentity:'both',endRelation:'parallel',lengthDatum:'source-length'
};
const legacyStart = contract.createComparisonHandoff({
  projectId:'start-own',projectClass:'USER_DEFINED_BOARD',definitionId:'SYO-TEST',
  physicalDemand:legacyPart,sourceAuthority:{kind:'USER-DEFINED'}
});
const legacyOutdoor = contract.createComparisonHandoff({
  projectId:'outdoor-build',projectClass:'BOUNDED_SOURCE_BACKED',definitionId:'OB-SAW-TEST',
  physicalDemand:legacyPart,sourceAuthority:{kind:'BOUNDED SOURCE-BACKED'}
});
assert.equal(contract.sameStoreDemand(legacyStart,legacyOutdoor),true);

const defined = {
  stockClass:'2x4',parentLengthIn:60,finishedLength:16,quantity:2,endCondition:'angled',straightCut:false,
  angleDegrees:30,angleReference:'USER_1_INTENT_IMAGE',cutPlane:'miter-face',
  endIdentity:'both',endRelation:'parallel',lengthDatum:'long-long-outer-edge',
  spotDemand:{
    required:true,mode:'SPOT_ON_LOCATION',countPerPart:1,locationRule:'CENTERED_ON_PART',
    locationAlongLengthIn:8,acrossWidthRule:'CENTERED_ON_WIDE_FACE',totalCount:2,
    derivation:{basis:'DERIVED',formula:'finishedLengthIn / 2',input:{finishedLengthIn:16},output:{locationAlongLengthIn:8}}
  }
};
const handoff = contract.createComparisonHandoff({
  projectId:'start-own',projectClass:'USER_DEFINED_BOARD',definitionId:'SYO-USER1-XBRACE-0.1',
  physicalDemand:defined,unresolvedConditions:[]
});
assert.equal(handoff.requiredGeometryDatumFacts.parentLengthIn,60);
const spot = handoff.operationDemand.find(op => op.kind==='SPOT_ON_LOCATION');
assert.ok(spot);
assert.equal(spot.countPerPart,1);
assert.equal(spot.locationAlongLengthIn,8);
assert.equal(spot.derivation.formula,'finishedLengthIn / 2');
assert.equal(spot.totalCount,2);
assert.equal(handoff.operationDemand.some(op => op.kind==='DRILL'),false,'spot was silently converted into a drill operation');
assert.equal(handoff.authority.physicalFabrication,false);



console.log('PASS · Start Your Own bounded 16–18 bench preserves rendering, derives geometry, and uses Store-issued references without a second pricing engine');
