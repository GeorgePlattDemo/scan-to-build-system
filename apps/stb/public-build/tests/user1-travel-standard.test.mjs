import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const contractSource = fs.readFileSync('stb-store-handoff-contract.js','utf8');
const shell = fs.readFileSync('system-build-current.html','utf8');
const frame = fs.readFileSync('three-frames.html','utf8');

const sandbox = {window:{}};
vm.runInNewContext(contractSource,sandbox,{filename:'stb-store-handoff-contract.js'});
const contract = sandbox.window.STBStoreHandoffContract;

assert.ok(contract,'Store handoff contract did not load');
assert.equal(contract.version,'0.9');
assert.equal(typeof contract.resolveUser1StoreReference,'function');
assert.equal(typeof contract.requestUser1StoreEvaluation,'function');
assert.equal(typeof contract.sameUser1StoreAnswerIdentity,'function');
assert.equal(typeof contract.quoteStartOwnBoardSequence,'undefined');

const exactDemand = {
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
};

const exact = contract.resolveUser1StoreReference(exactDemand);
assert.equal(exact.status,'MATCHED_STORE_REFERENCE');
assert.equal(exact.complete,true);
assert.equal(exact.capabilityStatus,'SUPPORTABLE');
assert.equal(exact.material,2.61);
assert.equal(exact.machineService,5.89);
assert.equal(exact.combinedValue,8.50);
assert.equal(exact.estimate.cycle.T_job_min,1.4128);
assert.equal(exact.estimate.travel.derivedSawCuts,3);
assert.equal(exact.estimate.travel.derivedSpotCount,2);
assert.equal(exact.estimate.travel.finalRemainderIn,27.625);
assert.equal(exact.materialResolution.pricingReferenceSku,'STB-ZERO-SPF-2X4-60-001');
assert.equal(exact.materialResolution.pricingReferenceStockLengthIn,60);
assert.equal(exact.materialResolution.workpieceLengthIn,60);
assert.equal(exact.materialResolution.selectionPolicy,'SHORTEST_COMPLETE_STORE_OFFERING');
assert.equal(exact.source.storePin,'140217b0aed64725d26b0d9332e3bf7b5d4396e0');
assert.equal(exact.source.workflowRun,'35791021805');
assert.equal(exact.source.systemIntegrationPin,'59a9c0326c1afea7af3767e1ed89bf6465a4b809');
assert.equal(exact.calculationIdentity.inputHash,'f0918ff545e3d77d8d5ec33055d7279bb01dbe172bb4e6cc4d498469d66b2e82');
assert.equal(exact.calculationIdentity.resultHash,'2abe991dbd5331f7fa3762018fed9cc707b637d4512ba62f7fc8fe1e4e28587a');
assert.equal(exact.freshEvaluation,false);
assert.equal(exact.evaluationReceipt,null);


const exactDemand18 = {
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
};
const exact18 = contract.resolveUser1StoreReference(exactDemand18);
assert.equal(exact18.status,'MATCHED_STORE_REFERENCE');
assert.equal(exact18.complete,true);
assert.equal(exact18.material,3.13);
assert.equal(exact18.machineService,5.90);
assert.equal(exact18.combinedValue,9.03);
assert.equal(exact18.estimate.cycle.T_job_min,1.4151);
assert.equal(exact18.estimate.travel.finalRemainderIn,35.625);
assert.equal(exact18.materialResolution.requestedDefinedWorkpieceLengthIn,60);
assert.equal(exact18.materialResolution.workpieceLengthIn,72);
assert.equal(exact18.materialResolution.pricingReferenceStockLengthIn,72);
assert.equal(exact18.materialResolution.selectionPolicy,'SHORTEST_COMPLETE_STORE_OFFERING');
assert.deepEqual(
  Array.from(exact18.materialResolution.consideredCandidates).map(entry=>[entry.storeSku,entry.stockLengthIn,entry.candidateStatus,entry.reason]),
  [
    ['STB-ZERO-SPF-2X4-60-001',60,'REFUSED','LAST_REMAIN_BELOW_TWO_ROLLER_CONTROL'],
    ['STB-ZERO-SPF-2X4-72-001',72,'SUPPORTABLE',null]
  ]
);
assert.equal(exact18.source.storePin,'140217b0aed64725d26b0d9332e3bf7b5d4396e0');
assert.equal(exact18.source.systemIntegrationPin,'59a9c0326c1afea7af3767e1ed89bf6465a4b809');
assert.equal(exact18.calculationIdentity.inputHash,'4b3b498d86177ed5a13c2662778f232b2c11cfafa7f626a689b3823b6872a4cc');
assert.equal(exact18.calculationIdentity.resultHash,'59c9988c42ffd2520f6c1931d735a31e07848d72ac602182c510a17c20b89e88');

const formal18 = contract.requestUser1StoreEvaluation(exactDemand18,{
  requestId:'JOB1-18-PROMOTED',
  currentStorePin:'140217b0aed64725d26b0d9332e3bf7b5d4396e0',
  checkedAt:'2026-09-22T20:47:00.000Z'
});
assert.equal(formal18.complete,true);
assert.equal(formal18.freshEvaluation,true);
assert.equal(formal18.evaluationReceipt.currentStorePin,'140217b0aed64725d26b0d9332e3bf7b5d4396e0');
assert.equal(contract.sameUser1StoreAnswerIdentity(exact18,formal18),true);

const intermediate = contract.resolveUser1StoreReference({
  ...exactDemand18,
  configurationVersion:'review-intermediate-17.000',
  sawAngleDeg:Number((Math.asin(8/17)*180/Math.PI).toFixed(12)),
  parts:exactDemand18.parts.map((part,index)=>({
    ...part,
    lengthIn:17,
    features:[{...part.features[0],featureId:'SPOT-'+(index+1),xIn:8.5}]
  }))
});
assert.equal(intermediate.status,'STORE_REFRESH_REQUIRED');
assert.equal(intermediate.complete,false);

const formalA = contract.requestUser1StoreEvaluation(exactDemand,{
  requestId:'JOB1-FRESH-A',
  currentStorePin:'140217b0aed64725d26b0d9332e3bf7b5d4396e0',
  checkedAt:'2026-09-22T18:45:00.000Z'
});
const formalB = contract.requestUser1StoreEvaluation(exactDemand,{
  requestId:'JOB1-FRESH-B',
  currentStorePin:'140217b0aed64725d26b0d9332e3bf7b5d4396e0',
  checkedAt:'2026-09-22T18:46:00.000Z'
});
assert.equal(formalA.status,'CURRENT_STORE_REFERENCE_REVALIDATED');
assert.equal(formalA.complete,true);
assert.equal(formalA.freshEvaluation,true);
assert.equal(formalA.evaluationReceipt.requestId,'JOB1-FRESH-A');
assert.equal(formalB.evaluationReceipt.requestId,'JOB1-FRESH-B');
assert.notEqual(formalA.evaluationReceipt.requestId,formalB.evaluationReceipt.requestId);
assert.equal(formalA.evaluationReceipt.currentStorePin,'140217b0aed64725d26b0d9332e3bf7b5d4396e0');
assert.equal(formalA.evaluationReceipt.currentStoreMatchesReference,true);
assert.equal(formalA.evaluationReceipt.machineEnvelopeId,'D001-STAGE2-ENVELOPE-0.3');
assert.equal(formalA.evaluationReceipt.travelStandardId,'STB-D001-DIMENSIONAL-TRAVEL-0.1');
assert.equal(formalA.evaluationReceipt.economicsId,'STB-D001-STORE-ECONOMICS-S2-0.1');
assert.equal(formalA.calculationIdentity.inputHash,formalB.calculationIdentity.inputHash);
assert.equal(formalA.calculationIdentity.resultHash,formalB.calculationIdentity.resultHash);
assert.equal(contract.sameUser1StoreAnswerIdentity(exact,formalA),true);

const movedStore = contract.requestUser1StoreEvaluation(exactDemand,{
  requestId:'JOB1-STORE-MOVED',
  currentStorePin:'0000000000000000000000000000000000000000',
  checkedAt:'2026-09-22T18:47:00.000Z'
});
assert.equal(movedStore.status,'STORE_AUTHORITY_CHANGED');
assert.equal(movedStore.complete,false);
assert.equal(movedStore.freshEvaluation,false);
assert.deepEqual(Array.from(movedStore.unresolvedConditions),['STORE_REFRESH_REQUIRED','STORE_AUTHORITY_CHANGED']);

const noCurrentAuthority = contract.requestUser1StoreEvaluation(exactDemand,{
  requestId:'JOB1-NO-CURRENT-STORE',
  checkedAt:'2026-09-22T18:48:00.000Z'
});
assert.equal(noCurrentAuthority.status,'CURRENT_STORE_AUTHORITY_REQUIRED');
assert.equal(noCurrentAuthority.complete,false);

for (const changed of [
  {...exactDemand, configurationVersion:'0.2'},
  {...exactDemand, sawAngleDeg:31},
  {...exactDemand, definedWorkpieceLengthIn:59},
  {...exactDemand, declaredSpotCount:1},
  {...exactDemand, parts:[
    {...exactDemand.parts[0],lengthIn:17},
    exactDemand.parts[1],
  ]},
  {...exactDemand, parts:[
    {...exactDemand.parts[0],features:[{...exactDemand.parts[0].features[0],xIn:7.5}]},
    exactDemand.parts[1],
  ]},
]) {
  const answer = contract.resolveUser1StoreReference(changed);
  assert.equal(answer.status,'STORE_REFRESH_REQUIRED');
  assert.equal(answer.complete,false);
  assert.equal(answer.estimate,null);
  assert.equal(answer.combinedValue,null);
  assert.deepEqual(Array.from(answer.unresolvedConditions),['STORE_REFRESH_REQUIRED']);
}

const user1ContractStart = contractSource.indexOf('var USER1_STORE_REFERENCE');
const user1ContractEnd = contractSource.indexOf('var D001_CYCLE',user1ContractStart);
assert.ok(user1ContractStart >= 0 && user1ContractEnd > user1ContractStart);
const user1ContractBlock = contractSource.slice(user1ContractStart,user1ContractEnd);
for (const forbidden of [
  'quoteStartOwnBoardSequence',
  'machineHourRate',
  'setupCharge:35',
  'Math.cos',
  'sawTraverseIn',
]) {
  assert.equal(user1ContractBlock.includes(forbidden),false,'browser User 1 Store resolver contains forbidden local economics/motion logic: '+forbidden);
}

const syncStart = shell.indexOf('const syncDefinition = reason =>');
const syncEnd = shell.indexOf('const renderBoardGeometry = definition =>',syncStart);
assert.ok(syncStart >= 0 && syncEnd > syncStart);
const syncBlock = shell.slice(syncStart,syncEnd);
assert.match(syncBlock,/resolveUser1StoreReference/);
assert.match(syncBlock,/parts = Array\.from/);
assert.match(syncBlock,/requiredOps\.push\('SPOT_ON_LOCATION'\)/);
assert.match(syncBlock,/configurationVersion/);
for (const forbidden of [
  'quoteStartOwnBoardSequence',
  'resolveStartOwnMaterial',
  'sequenceDefinedWorkpiece',
  'machineHourRate',
  'setupCharge',
  'angleDeg > 45',
]) {
  assert.equal(syncBlock.includes(forbidden),false,'visible configurator reclaimed Store authority: '+forbidden);
}

assert.match(shell,/stb-user-defined-board-runtime-bridge\.js\?v=132f1266/);
assert.match(shell,/const user1RuntimeBridge = window\.STBUserDefinedBoardRuntimeBridge \|\| null/);
assert.match(shell,/nextStoreRequestId/);
assert.match(shell,/user1RuntimeBridge\.request\(definition\.storeDemand/);
assert.match(shell,/freshReceipt\?\.requestId === requestId/);
assert.match(shell,/LIVE STORE EVALUATION REQUIRED/);
assert.equal(shell.includes('currentStoreAuthorityUrl'),false,'active Start Own still floats on Store main');
assert.equal(shell.includes('fetchCurrentStorePin'),false,'active Start Own still fetches Store main');
assert.equal(shell.includes('sameUser1StoreAnswerIdentity(definition.storeReference'),false,'active Start Own still blocks on old static Store identity');
assert.equal(shell.includes('stbLastConfirmed'),false,'Store-send control regressed to one-use behavior');
assert.match(shell,/MODELED MACHINE SERVICE/);
assert.match(shell,/machine_service/);
assert.match(shell,/calculationIdentity/);
assert.match(shell,/proof-store/);
assert.match(shell,/proof-accept/);
assert.match(shell,/proof-yard/);
assert.match(shell,/proof-terms/);
assert.match(shell,/proof-record/);
// Store authority remains real-to-the-model while downstream commerce/fulfillment is explicitly simulated.
assert.match(shell,/data-proof-sim-action="accept-pay-yard"/);
assert.match(shell,/SIMULATED_OFFER/);
assert.match(shell,/SIMULATED_ACCEPTANCE/);
assert.match(shell,/SIMULATED_PAYMENT/);
assert.match(shell,/no money moved/);
assert.match(shell,/does not send controller code, reserve live inventory, establish commissioned-machine readiness, issue physical production authority, or create a live Cycle Start/);
assert.match(shell,/PHYSICAL FABRICATION<\/b><span>NOT CLAIMED · SIMULATION ONLY/);
assert.match(shell,/no live inventory reserved/);
assert.match(shell,/no physical production authority created/);
assert.match(shell,/no live motion or controller command/);

assert.match(frame,/Modeled machine service/);
assert.match(frame,/id="stb-config-length"[^>]*min="16"[^>]*max="18"[^>]*value="16"/);
assert.match(frame,/data-length="16">16 IN/);
assert.match(frame,/data-length="18">18 IN/);
assert.equal(frame.includes('id="stb-config-angle"'),false,'bounded demo reintroduced a customer angle control');
assert.equal(frame.includes('data-parts='),false,'bounded demo reintroduced quantity choices');
assert.equal(frame.includes('data-spot='),false,'bounded demo reintroduced spot choices');
assert.match(frame,/same 8.000 in horizontal span/i);
assert.match(frame,/18.000 in → 26.388° end cuts/);
assert.match(frame,/2×4 · 60 in/);
assert.match(frame,/Center spot = 16 ÷ 2 = 8 in/);

const handoff = contract.createComparisonHandoff({
  projectId:'start-own',
  projectClass:'USER_DEFINED_BOARD',
  definitionId:'SYO-USER1-XBRACE-0.1',
  versionId:'SYO-USER1-XBRACE-0.1-v1',
  physicalDemand:{
    stockClass:'2x4',
    parentLengthIn:60,
    definedWorkpieceLengthIn:60,
    finishedLength:16,
    quantity:2,
    endCondition:'angled',
    straightCut:false,
    angleDegrees:30,
    angleReference:'USER_1_INTENT_IMAGE',
    cutPlane:'miter-face',
    endIdentity:'both',
    endRelation:'parallel',
    lengthDatum:'long-long-outer-edge',
    datumCMethod:'REFERENCE_CUT',
    requiredOps:['MITER_LIMITED','SPOT_ON_LOCATION'],
    declaredSawCuts:3,
    declaredSpotCount:2,
    parts:exactDemand.parts,
    spotDemand:{
      required:true,
      mode:'SPOT_ON_LOCATION',
      countPerPart:1,
      locationRule:'CENTERED_ON_PART',
      locationAlongLengthIn:8,
      acrossWidthRule:'CENTERED_ON_WIDE_FACE',
      totalCount:2,
    },
  },
  unresolvedConditions:[],
});
assert.equal(handoff.requiredGeometryDatumFacts.datumCMethod,'REFERENCE_CUT');
assert.deepEqual(Array.from(handoff.requiredGeometryDatumFacts.requiredOps),['MITER_LIMITED','SPOT_ON_LOCATION']);
assert.equal(handoff.requiredGeometryDatumFacts.declaredSawCuts,3);
assert.equal(handoff.requiredGeometryDatumFacts.declaredSpotCount,2);
assert.equal(handoff.requiredGeometryDatumFacts.identifiedParts.length,2);
assert.equal(handoff.requiredGeometryDatumFacts.identifiedParts[0].features[0].xIn,8);
assert.equal(handoff.authority.physicalFabrication,false);

console.log('PASS · User 1 bounded 16–18 configurator derives geometry, carries two exact Store references, and fails closed between them');
