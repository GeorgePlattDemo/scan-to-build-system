import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const read=(p)=>fs.readFileSync(p,'utf8');
const shell=read('system-build-current.html');
const base=read('system-build-base-8d8a9dd.html');
const journeySource=read('stb-canonical-journey.js');
const doctrineSource=read('store-zero-canonical-doctrine.js');

function runBrowserScript(source,key){
  const sandbox={window:{}};
  vm.runInNewContext(source,sandbox,{filename:key});
  return sandbox.window;
}

const journey=runBrowserScript(journeySource,'stb-canonical-journey.js').STB_CANONICAL_JOURNEY;
const doctrine=runBrowserScript(doctrineSource,'store-zero-canonical-doctrine.js').STBStoreZeroCanonicalDoctrine;

assert.deepEqual([...journey.stages],['scan','configure','store','review','request','yard','terms','recap','record']);
assert.equal(journey.gates.length,8);

// Project identity must be selected before the older document-capture preview handler can stop propagation.
assert.match(shell,/const PROJECT_TILE_TO_JOURNEY = Object\.freeze/);
assert.match(shell,/'alcove-capture': 'alcove'/);
assert.match(shell,/'window-parts': 'playhouse'/);
assert.match(shell,/'picnic-chooser': 'picnic'/);
assert.match(shell,/win\.addEventListener\('click', function\(event\) \{[\s\S]*PROJECT_TILE_TO_JOURNEY\[target\]/);
assert.equal(shell.includes("doc.addEventListener('click', function(event) {\n      const tile = event.target.closest('#projects .tile[data-go]');"),false);

// Every bounded project uses the neutral canonical stage names.
const expectedTargets={
  alcove:{scan:'alcove-capture',configure:'alcove-config',store:'store',review:'alcove-review',request:'request',yard:'yard',terms:'terms',recap:'recap',record:'record'},
  playhouse:{scan:'playhouse-s001',configure:'playhouse-machine',store:'playhouse-store',review:'playhouse-review',request:'playhouse-request',yard:'playhouse-yard',terms:'playhouse-terms',recap:'playhouse-result',record:'playhouse-record'},
  picnic:{scan:'picnic-chooser',configure:'picnic-config',store:'picnic-store',review:'picnic-review',request:'picnic-request',yard:'picnic-yard',terms:'picnic-terms',recap:'picnic-recap',record:'picnic-record'}
};
assert.match(shell,/alcove: ALCOVE_STAGE_TARGETS/);
assert.match(shell,/playhouse: Object\.freeze/);
assert.match(shell,/picnic: Object\.freeze/);
for(const [project,map] of Object.entries(expectedTargets)){
  for(const [stage,target] of Object.entries(map)){
    assert.ok(shell.includes(stage+": '"+target+"'"),project+' missing '+stage+' mapping');
  }
}

// Alcove retains the canonical event surfaces, but confirmation is inline beneath Configure.
for(const id of Object.values(expectedTargets.alcove)) assert.ok(base.includes('id="'+id+'"'),'missing Alcove page '+id);
assert.match(base,/id="confirm-alcove-inline"/);
assert.match(base,/CONFIRM &amp; SEND TO STORE ZERO →/);
assert.match(base,/show\('store'\)/);
assert.match(base,/data-go="request">Next →/);
assert.match(base,/data-go="yard">SEND TO THE YARD/);
assert.match(base,/data-go="terms">CONTINUE TO TERMS/);
assert.ok(shell.includes("['alcove-review','terms','recap']"),'Alcove internal event pages are not hidden from customer navigation');
assert.match(shell,/review:'store'/);
assert.match(shell,/request:'request'/);
assert.match(shell,/terms:'yard'/);
assert.match(shell,/recap:'record'/);
assert.match(shell,/Store Answer/);
assert.match(shell,/Accept \/ Pay/);
assert.match(shell,/Confirmed version sent to Store Zero\./);

// Shared Store doctrine is valid before confirmation and does not claim a completed event.
assert.match(doctrine.processIntroHtml,/This identified version stays unchanged unless you create or approve a new one\./);
assert.equal(doctrine.processIntroHtml.includes('Your confirmed version stays unchanged'),false);
assert.equal((doctrine.processStepsHtml.match(/class="s"/g)||[]).length,12);

// Playhouse now reaches every canonical stage without promoting its unresolved secondary work.
for(const id of ['playhouse-request','playhouse-yard','playhouse-terms']) assert.ok(shell.includes("ensureProjectJourneyPage('"+id+"'"),'missing '+id);
assert.match(shell,/CONFIRM THIS VERSION →/);
assert.match(shell,/REQUEST ≠ ORDER/);
assert.match(shell,/A mixed answer is still a valid answer/);
assert.match(shell,/CENTER ROUTE \/ STRAIGHT CUTS[\s\S]*UNRESOLVED/);
assert.match(shell,/OFFER[\s\S]*NOT ESTABLISHED/);
assert.match(shell,/PRODUCTION RELEASE[\s\S]*NOT ESTABLISHED/);
assert.match(shell,/MACHINE READINESS \/ CYCLE START[\s\S]*NOT ESTABLISHED \/ NOT AUTHORIZED/);
assert.match(shell,/RECAP · WHAT HAPPENED/);

// Playhouse and Picnic Store pages consume the same Store doctrine rather than inventing a short substitute.
assert.match(shell,/CURRENT PLAYHOUSE STATUS/);
assert.match(shell,/canonicalDoctrine\.definitionHtml/);
assert.match(shell,/canonicalDoctrine\.processIntroHtml/);
assert.match(shell,/canonicalDoctrine\.processStepsHtml/);

// Picnic is admitted and carried to the real bridge stop, not rejected or silently promoted.
for(const id of ['picnic-store','picnic-request','picnic-yard','picnic-terms','picnic-recap','picnic-record']) assert.ok(shell.includes("ensureProjectJourneyPage('"+id+"'"),'missing '+id);
assert.match(shell,/SEND TO STORE ZERO →/);
assert.match(shell,/DEFERRED · BRIDGE-GAP/);
assert.match(shell,/This is not a failed job\./);
assert.match(shell,/PROJECT STATUS<\/b><span>RETAINED · NOT REJECTED/);
assert.match(shell,/STOP AT THE REAL GATE\./);
assert.match(shell,/SEND TO THE YARD — DEFERRED/);
assert.match(shell,/projectId === 'picnic' && \['yard','terms','recap','record'\]\.includes\(stage\)/);

// Start Your Own remains broad intake and is not falsely declared to be a bounded project.
assert.match(base,/id="start-own"/);
assert.match(base,/No wrong entry/);
assert.match(base,/id="intake"/);
assert.equal(shell.includes("'start-own': '"),false,'Start Your Own was incorrectly promoted into a bounded-project journey identity');

// Safety / authority boundaries remain visible.
assert.match(shell,/No binding quote or fabrication authority is created/);
assert.match(shell,/PHYSICAL AUTHORITY<\/b><span>NOT AUTHORIZED/);
assert.match(shell,/NOT AUTHORIZED \/ NOT RECORDED/);

console.log('PASS · bounded project canonical conformance checks');
