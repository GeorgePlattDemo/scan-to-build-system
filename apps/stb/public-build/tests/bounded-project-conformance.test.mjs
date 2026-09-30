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
assert.equal(shell.includes("'picnic-chooser': 'picnic'"),false,'the old Picnic journey identity is gone; the Outdoor tile selects outdoor');
assert.match(shell,/win\.addEventListener\('click', function\(event\) \{[\s\S]*PROJECT_TILE_TO_JOURNEY\[target\]/);
assert.equal(shell.includes("doc.addEventListener('click', function(event) {\n      const tile = event.target.closest('#projects .tile[data-go]');"),false);

// Every bounded project uses the neutral canonical stage names.
const expectedTargets={
  alcove:{scan:'alcove-capture',configure:'alcove-config',store:'store',review:'alcove-review',request:'request',yard:'yard',terms:'terms',recap:'recap',record:'record'},
  playhouse:{scan:'playhouse-s001',configure:'playhouse-machine',store:'playhouse-store',review:'playhouse-review',request:'playhouse-request',yard:'playhouse-yard',terms:'playhouse-terms',recap:'playhouse-result',record:'playhouse-record'}
};
assert.match(shell,/alcove: ALCOVE_STAGE_TARGETS/);
assert.match(shell,/playhouse: Object\.freeze/);
assert.equal(/picnic: Object\.freeze/.test(shell),false);
// Outdoor's six steps all stay on the Outdoor page.
for(const stage of ['scan','configure','store','review','request','yard','terms','recap','record']) assert.ok(shell.includes(stage+":'outdoor-build-live'"),'outdoor '+stage+' leaves its page');
assert.match(shell,/outdoor:'OUTDOOR · PICNIC TABLE'/);
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
assert.ok(shell.includes("if (stage === 'review' || stage === 'terms' || stage === 'recap') button.hidden = true;"),'Alcove internal event pages are not hidden from customer navigation');
assert.match(shell,/review:'store'/);
assert.match(shell,/request:'request'/);
assert.match(shell,/terms:'yard'/);
assert.match(shell,/recap:'record'/);
assert.match(shell,/request:'4 · Your call'/);
assert.match(shell,/Confirmed version sent to Store Zero\./);

// Every live Store answer page carries the one shared Store Zero text (never a local copy).
for(const file of ['stb-window-seat-0.9.html','stb-outdoor-picnic-0.2.html']){
  const page=read(file);
  assert.match(page,/store-zero-canonical-doctrine\.js\?v=/,file+' loads the shared Store Zero text');
  assert.match(page,/function renderStoreDoctrine/,file+' renders it with its Store answer');
  assert.equal(page.includes('Store Zero is a declared reference lumberyard'),false,file+' must not copy the Store Zero text');
}
// Shared Store doctrine is valid before confirmation and does not claim a completed event.
assert.match(doctrine.processIntroHtml,/This identified version stays unchanged unless you create or approve a new one\./);
assert.equal(doctrine.processIntroHtml.includes('Your confirmed version stays unchanged'),false);
assert.equal((doctrine.processStepsHtml.match(/class="s"/g)||[]).length,12);

// Playhouse now reaches every canonical stage without promoting its unresolved secondary work.
for(const id of ['playhouse-request','playhouse-yard','playhouse-terms']) assert.ok(shell.includes("ensureProjectJourneyPage('"+id+"'"),'missing '+id);
assert.match(shell,/CONFIRM THIS VERSION →/);
assert.match(shell,/REQUEST ≠ ORDER/);
// Playhouse's Store step is the live Store's answer for the current version, never a stored reference answer.
assert.match(shell,/requestType:S001_REQUEST_TYPE/);
assert.match(shell,/const S001_REQUEST_TYPE = 'SHEET_PACKAGE_V1'/);
assert.match(shell,/window\.STBStoreClient/);
assert.match(shell,/data-s001-needs-supportable/);
// Playhouse's steps 4–6 run the shared terms flow, like every tile.
for(const step of ['call','yard','chain','record']) assert.ok(shell.includes('<div class="s001-terms-host" data-terms-step="'+step+'"></div>'),'Playhouse terms host missing: '+step);
assert.doesNotMatch(shell,/SUPPORTABLE · REFERENCE|\$26\.55|4402abeb6b0299a5b6db2eec85ed04c3b0236bcc|SHEET_MODE2_ARCHED_APERTURE_V0/);
assert.match(shell,/RECAP · WHAT HAPPENED/);

// Playhouse and Picnic Store pages consume the same Store doctrine rather than inventing a short substitute.
assert.match(shell,/CURRENT PLAYHOUSE STATUS/);
assert.match(shell,/canonicalDoctrine\.definitionHtml/);
assert.match(shell,/canonicalDoctrine\.processIntroHtml/);
assert.match(shell,/canonicalDoctrine\.processStepsHtml/);

// Picnic has one path: the Outdoor tile's page, answered by the live Store (CUT_PACKAGE_V1).
// The old Picnic journey pages that stopped at a Store bridge gap are gone, and old routes lead to the Outdoor page.
for(const id of ['picnic-store','picnic-request','picnic-yard','picnic-terms','picnic-recap','picnic-record']) assert.equal(shell.includes("ensureProjectJourneyPage('"+id+"'"),false,'old picnic page still built: '+id);
assert.equal(shell.includes('DEFERRED · BRIDGE-GAP'),false);
assert.equal(shell.includes("type === 'STB_OUTDOOR_CONFIRMED'"),false,'Outdoor must not hand off into Job 1 proof pages');
assert.match(shell,/src="stb-outdoor-picnic-0\.2\.html\?v=[0-9a-f]{8}"/);
assert.match(shell,/QUARANTINED_OUTDOOR_TARGETS\.has\(target\)[\s\S]*openCurrentOutdoorBuildFromLegacyRoute\(\)/);
const outdoorPage = fs.readFileSync(new URL('../stb-outdoor-picnic-0.2.html', import.meta.url),'utf8');
assert.match(outdoorPage,/CUT_PACKAGE_V1/);
assert.match(outdoorPage,/stb-store-client\.js/);
assert.equal(/Math\.min\(14/.test(outdoorPage),false,'no length ceiling of our own in the Outdoor page');
// 0.2: the only length bounds are the plan rule's (picnic-rule.mjs, kept in step by test/unit/outdoor-picnic-rule-sync).
assert.match(outdoorPage,/Math\.min\(RULE\.lengthIn\.max,Math\.max\(RULE\.lengthIn\.min,n\)\)/);
// No Store item numbers in the page: hardware packs travel as requirements the Store resolves.
assert.equal(/STB-ZERO-HW/.test(outdoorPage),false,'Outdoor page names no Store hardware item');
// One guide, not two: the shell's own rail is hidden on the Outdoor page, which fills its own rail slots.
assert.match(shell,/\.outdoor-build-shell-page>aside\.rail\{display:none!important\}/);
for(const id of ['outdoor-plan','outdoor-yours','outdoor-bench','outdoor-store','outdoor-call','outdoor-yard','outdoor-record']) assert.match(outdoorPage,new RegExp('data-guide-id="'+id+'"'));

// Start Your Own remains broad intake and is not falsely declared to be a bounded project.
assert.match(base,/id="start-own"/);
assert.match(base,/No wrong entry/);
assert.match(base,/id="intake"/);
assert.equal(shell.includes("'start-own': '"),false,'Start Your Own was incorrectly promoted into a bounded-project journey identity');

// Safety / authority boundaries remain visible.
assert.match(shell,/No binding quote or fabrication authority is created/);
assert.match(shell,/PHYSICAL AUTHORITY<\/b><span>NOT AUTHORIZED/);
// The old Picnic record page carried "NOT AUTHORIZED / NOT RECORDED"; the Outdoor page states its own boundary.
assert.match(outdoorPage,/Nothing is cut until you accept and send it to the Store/);

console.log('PASS · bounded project canonical conformance checks');
