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
assert.match(surface,/Spot drill/);
assert.match(surface,/Spot drill = 16 ÷ 2 = 8 in/);
assert.match(surface,/TAKE THE WOOD AND TOOLS TO THE BENCH →/);
assert.equal(surface.includes('<p>2×6 stud</p>'),false);
assert.equal(surface.includes('<p>2×8 stud</p>'),false);
assert.equal(surface.includes('FRAME 1 · THE WARM INTRO'),false);
assert.equal(surface.includes('>USER 1 INTENT<'),false);
assert.equal(surface.includes('PREVIEW — the three frames'),false);

// Bench is a separate, full project-working surface.
assert.match(surface,/id="stb-start-bench-screen" hidden/);
assert.match(surface,/id="stb-bench-back">← Back/);
assert.match(surface,/id="stb-bench-library">← PROJECT LIBRARY/);
assert.match(surface,/<h1>The bench<\/h1>/);
assert.match(surface,/id="stb-bench-intent-slot"/);
assert.match(surface,/THE SAME BOARD, ON THE BENCH/);
assert.match(surface,/2×4 · 60 in/,'60-in defined workpiece changed');
assert.match(surface,/27⅝ in remains/,'60-in retained math changed');
assert.match(surface,/3⅝ in spare/,'60-in spare math changed');
assert.match(surface,/id="stb-bench-controls"/);
assert.match(surface,/Want it a little higher\?/);
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
assert.match(shell,/three-frames\.html\?v=3f615bac/);
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
assert.match(shell,/stb-user-defined-board-runtime-bridge\.js\?v=db611717/);
assert.match(shell,/user1RuntimeBridge\.request\(request, startOwnStoreDemandFrom\(request\), \{ requestId \}\)/);
assert.equal(shell.includes('currentStoreAuthorityUrl'),false,'active Start Own still floats on Store main');
assert.equal(shell.includes('stbLastConfirmed'),false,'Store-send button regressed to one-use behavior');
assert.match(shell,/const spotDemand =/);
assert.match(shell,/physicalDemand\.spotDemand = spotDemand/);
assert.match(shell,/formula:'finishedLengthIn \/ 2'/);
assert.match(shell,/renderBoardGeometry\(definition\)/);
// Start your own opens on Intent, step 1, by the trail contract's one opensOn exception. Idea stays its unnumbered
// intake; the go target maps Idea, Intent and the bench.
assert.match(shell,/showStartOwnStage\('intent'\)/);
assert.equal(shell.includes("showStartOwnStage('idea')"),false,'Start your own still opens on Idea');
assert.match(shell,/startOwnPage\.dataset\.revStage = 'intent';/);
assert.match(shell,/let pendingStartOwnStage = 'intent';/);
assert.match(shell,/const screen = target === trailContract\.idea\.label \? 'idea' : at === 0 \? 'intent' : at === 1 \? 'bench' : null;/);
assert.match(shell,/if \(screen\) setTimeout\(\(\) => openStartOwnStage\(screen, null\), 0\)/);
assert.match(surface,/<section id="stb-start-idea-screen" hidden>/);
assert.match(surface,/<section id="stb-start-intent-screen">/);

// Idea is this job's own story: where it came from, the Job 1 picture and one line. No machinery, no numbers.
const ideaScreen = surface.slice(surface.indexOf('<section id="stb-start-idea-screen"'), surface.indexOf('<section id="stb-start-intent-screen"'));
assert.match(ideaScreen,/<h1 class="sy">Idea · what you brought<\/h1>/);
assert.match(ideaScreen,/What you bring lands here and ends at Intent\. Idea is not a step\./);
assert.match(ideaScreen,/<img class="stb-idea-img" id="stb-idea-img" alt="Two damaged crossmembers under a picnic-table bench\.">/);
assert.match(ideaScreen,/<p class="stb-idea-line">Two broken crossmembers, both cut from a 2×4\.<\/p>/);
for (const machinery of ['morelist','stb-ways','<input','<button','data-species','stb-intent-sku','stb-add-tool','stb-tool-bubble','16 in','30°']) {
  assert.equal(ideaScreen.includes(machinery),false,'Idea carries '+machinery);
}
assert.equal(surface.includes('stb-idea-known'),false,'carried-value chips are back on Idea');
assert.equal(ideaScreen.includes('data:image'),false,'Idea carries a second copy of the picture');
assert.match(surface,/ideaImg\.src = job1Img\.src/,'Idea shows the same Job 1 picture as Intent');
// Intent: the hook, the Store lookup in the row of boards, Intent said once, the ways, the tool box with Job 1's tools.
const intentScreen = surface.slice(surface.indexOf('<section id="stb-start-intent-screen"'), surface.indexOf('<section id="stb-start-bench-screen"'));
assert.match(intentScreen,/<p class="stb-grab">Grab a board from the Store and tell us what you want done to it\.<\/p>/);
const boardsRow = intentScreen.slice(intentScreen.indexOf('<div class="boards">'), intentScreen.indexOf('id="stb-intent-sku-answer"'));
assert.match(boardsRow,/<svg class="stb-form-ring"[^>]*><ellipse[^>]*stroke="#d1242f"/,'the 2×4 is ringed in the photograph red');
assert.match(boardsRow,/id="stb-intent-sku"/,'the Store lookup sits in the row of boards');
assert.equal((surface.match(/id="stb-intent-sku"/g) || []).length,1,'one Store lookup');
assert.equal(/<ol\b|<li><b>/.test(intentScreen),false,'the ways are a numbered list again');
assert.deepEqual([...intentScreen.matchAll(/<div><b>([^<]+)<\/b>/g)].map(m => m[1]), [
  'Add pieces as you go.', 'Just tell us in plain words.', 'Type the numbers.', 'Send a scan or a photo.',
  'Draw it here.', 'Bring what you already have.']);
assert.match(intentScreen,/<p class="lead">Add a tool the job needs to define<\/p>/);
assert.match(intentScreen,/id="stb-add-tool-input"/);
assert.match(intentScreen,/id="stb-add-tool" disabled>ADD/);
assert.match(intentScreen,/<span>Cut<\/span><span>At an angle<\/span><span>Spot drill<\/span><span id="stb-added-tools"><\/span>/);
assert.equal(/configurator/i.test(intentScreen),false,'the customer page says configurator');
// The handoff frame: the picture with its ring, the wood and each tool with what it carries. Not another picker.
const handoffFrame = intentScreen.slice(intentScreen.indexOf('<div class="stb-user1-body">'));
assert.match(handoffFrame,/<svg class="stb-pick-ring"[^>]*><circle[^>]*stroke="#d1242f"/);
assert.match(handoffFrame,/<span id="stb-carry-wood">2×4 stud<\/span>/);
assert.match(handoffFrame,/<b>Cut<\/b><span id="stb-carry-cut">2 parts · 16 in each<\/span>/);
assert.match(handoffFrame,/<b>At an angle<\/b><span id="stb-carry-angle">30° ends<\/span>/);
assert.match(handoffFrame,/<b>Spot drill<\/b><span id="stb-carry-spot">8 in from either end<\/span>/);
assert.equal(/<input|data-species|data-intent-species/.test(handoffFrame),false,'the handoff frame carries a picker');
assert.equal(/data-intent-species/.test(surface),false,'Intent has a second wood state');
assert.match(shell,/clone\.querySelector\('\.stb-carry-live'\)\?\.remove\(\)/,'the bench copy of the picture carries no stale wood or tools');
// Cedar is off this bench's choices; it stays in the Store catalog.
assert.equal(/data-(?:intent-)?species="cedar"/.test(surface),false,'cedar is still a bench choice');
assert.deepEqual([...surface.matchAll(/data-species="([^"]+)"/g)].map(m => m[1]), ['spf','syp-treated']);
// ITEM LOOKUP asks the hosted Store's offering endpoint; the browser holds no copied catalog to answer from.
assert.equal(shell.includes('startOwnStoreItem'),false,'ITEM LOOKUP still answers from a browser copy');
assert.match(shell,/window\.STBStoreClient\.lookupOfferings\(\{/);
assert.match(surface,/<label class="stb-label" for="stb-intent-sku">ITEM LOOKUP<\/label>/);
assert.match(surface,/placeholder="Pine, 1 x 6 pine, or Store SKU…"/);
assert.match(surface,/id="stb-intent-sku-look" disabled>LOOK UP</);
assert.equal(surface.includes('STORE LOOKUP'),false);
assert.match(shell,/materialDemand:statedMaterial\(\)/,'the bench reference is looked up for the stated wood');
assert.match(shell,/definitionId:'SYO-USER1-XBRACE-0\.1'/);
assert.match(shell,/originalShow\.call\(win,'proof-store'\)/);
assert.match(shell,/ensureProjectJourneyPage\('proof-terms'/);
assert.match(shell,/terms:'proof-yard'/);
assert.equal(shell.includes("target==='proof-record' && go.closest('#proof-yard')"),false,'Job 1 still forces the separate receipts detour');
assert.match(shell,/showMappedProjectStage\(activeJourneyProject,'configure'\)/);
assert.match(shell,/STORE BUDGETARY Q<\/b><span id="proof-store-q"/);
assert.match(shell,/<div class="start-own-terms-host" data-terms-step="call"><\/div>/);
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
assert.match(runtimeBridgeSource,/STBStoreClient/);
assert.match(read('stb-store-client.js'),/stb-store-runtime\.json/);
assert.match(shell,/stb-store-client\.js\?v=[0-9a-f]{8}"><\/script>\n<script src="stb-user-defined-board-runtime-bridge\.js/);
// The wire material is the admitted start-own.material fact; the bridge carries no material constant of its own.
assert.match(runtimeBridgeSource,/payloadFromDemand\(demand, \(admitted\.facts \|\| \{\}\)\['start-own\.material'\]\)/);
assert.match(runtimeBridgeSource,/materialDemand:clone\(materialDemand\)/);
for (const constant of ["species:'spf'","form:'board'",'nominalT','nominalW']) {
  assert.equal(runtimeBridgeSource.includes(constant),false,'bridge carries a material constant: '+constant);
}
for (const forbidden of ['sellingPrice','machineHourRate','setupCharge','parentLengthIn','storeSku:']) {
  assert.equal(runtimeBridgeSource.includes(forbidden),false,'live User 1 bridge reclaimed Store authority: '+forbidden);
}

// Shared contract preserves the checked reference previews and resolved 3/16 spot meaning.
const sandbox = {window:{}};
vm.runInNewContext(contractSource,sandbox,{filename:'stb-store-handoff-contract.js'});
const contract = sandbox.window.STBStoreHandoffContract;
assert.equal(contract.version,'0.9');
assert.equal(typeof contract.quoteStartOwnBoardSequence,'undefined');
assert.equal(typeof contract.resolveUser1StoreReference,'function');

// The bench reference is per wood: SPF and treated SYP at 16 and 18 in, nothing for a wood not stated.
assert.equal(contract.user1StoreReferences.length,4);
assert.deepEqual(Array.from(contract.user1StoreReferences, r => r.demand.materialDemand.species+'@'+r.demand.partLengthIn),
  ['spf@16','spf@18','syp-treated@16','syp-treated@18']);
// The old copied 2×4 SKU table and its exact-match lookup are gone; ITEM LOOKUP asks the Store.
assert.equal(typeof contract.startOwnStoreItem,'undefined');
assert.equal(typeof contract.startOwnStoreItems,'undefined');
assert.equal(/START_OWN_STORE_ITEMS|STB-ZERO-WRC-2X4-96-001/.test(contractSource),false,'the copied SKU table is still in the contract');

const exactStoreAnswer = contract.resolveUser1StoreReference({
  configurationId:'SYO-USER1-XBRACE',
  materialDemand:{species:'spf',form:'board',nominalT:2,nominalW:4},
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
assert.equal(exactStoreAnswer.machineService,5.93);
assert.equal(exactStoreAnswer.combinedValue,8.54);
assert.equal(exactStoreAnswer.estimate.cycle.T_job_min,1.4227);
assert.equal(exactStoreAnswer.estimate.travel.derivedSawCuts,3);
assert.equal(exactStoreAnswer.estimate.travel.derivedSpotCount,2);
assert.equal(exactStoreAnswer.estimate.travel.finalRemainderIn,27.625);
assert.equal(exactStoreAnswer.materialResolution.pricingReferenceSku,'STB-ZERO-SPF-2X4-60-001');
assert.equal(exactStoreAnswer.materialResolution.pricingReferenceStockLengthIn,60);
assert.equal(exactStoreAnswer.materialResolution.selectionPolicy,'SHORTEST_COMPLETE_STORE_OFFERING');
assert.equal(exactStoreAnswer.estimate.engine.version,'0.3.0');
assert.equal(exactStoreAnswer.source.storePin,'9c62d9d6f7775deef83d47196d32c9b5174a352c');
assert.equal(exactStoreAnswer.calculationIdentity.inputHash,'bea3c0b3841d013b463277ebaa02121bef79b65abe5e46b05a40f337afa3b868');
assert.equal(exactStoreAnswer.calculationIdentity.resultHash,'0fd6b7d19ef8f64d133486c9d2ccf72256b2993bb60aa14c77b3c3e8004973bc');


const exactStoreAnswer18 = contract.resolveUser1StoreReference({
  configurationId:'SYO-USER1-XBRACE',
  materialDemand:{species:'spf',form:'board',nominalT:2,nominalW:4},
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
assert.equal(exactStoreAnswer18.calculationIdentity.inputHash,'e594a8fd7ca9de466c0f5e85fc929ec51221e45405add3e5707fa0277fbb2add');
assert.equal(exactStoreAnswer18.calculationIdentity.resultHash,'595b797784e7f97d11a16e70a6e202eddf2cd6f38c02a165159fe4ce2abf9a37');
assert.equal(exactStoreAnswer18.machineService,5.94);
assert.equal(exactStoreAnswer18.combinedValue,9.07);
assert.equal(exactStoreAnswer18.estimate.cycle.T_job_min,1.425);
assert.equal(exactStoreAnswer18.estimate.travel.finalRemainderIn,35.625);
assert.equal(exactStoreAnswer18.source.storePin,'9c62d9d6f7775deef83d47196d32c9b5174a352c');
const changedRevision = contract.resolveUser1StoreReference({
  configurationId:'SYO-USER1-XBRACE',
  materialDemand:{species:'spf',form:'board',nominalT:2,nominalW:4},
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
