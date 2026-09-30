import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

// Uniform accuracy. Locks the flag line, the knob rule, the Store authority line and three definitions.
// Presentation is not locked.
const source=fs.readFileSync(new URL('../stb-build-guide-spec.js',import.meta.url),'utf8');
const definitions=fs.readFileSync(new URL('../../../../docs/definitions/README.md',import.meta.url),'utf8');
const sandbox={window:{}};
vm.runInNewContext(source,sandbox,{filename:'stb-build-guide-spec.js'});
const rails=sandbox.window.STBBuildGuideSpec.rails;
const job1=['job1-idea','job1-bench','job1-store'].map(k=>rails[k]);
const lines=r=>[r.flag,...r.bullets,...r.sections.flatMap(s=>s.items)];

const FLAG='Intent makes the knobs. The bench only turns them.';
const STORE_OWNS='Store owns capability, time, economics, and retained-control truth.';

test('Job 1 carries one flag across all three pages',()=>{
  for(const r of job1) assert.ok(r.flag.startsWith(FLAG),`flag drifted: ${r.header}`);
});

test('the knob rule is stated on intent and on the bench',()=>{
  assert.ok(lines(rails['job1-idea']).some(l=>/Knobs for this job are made here/.test(l)),'intent lost: knobs made here');
  assert.ok(lines(rails['job1-idea']).some(l=>/Never added on the bench/.test(l)),'intent lost: never added on the bench');
  assert.ok(lines(rails['job1-bench']).some(l=>/Knobs are used here\. Never added here\./.test(l)),'bench lost: used, never added');
});

test('the Store authority line is one line wherever it appears',()=>{
  const all=Object.values(rails).flatMap(lines).filter(l=>/^Store owns /.test(l));
  assert.ok(all.length>=2);
  for(const l of all) assert.equal(l,STORE_OWNS);
});

test('bench, knob and configurator are defined once, as approved',()=>{
  assert.ok(definitions.includes('The bench turns the knobs made at intent. It never adds one.'));
  assert.ok(definitions.includes('**Knob** — One setting a job needs so it can be defined and accepted. Made at intent, for that job, auto or by hand, from the need. Turned on the bench. Never added there.'));
  assert.ok(definitions.includes('**Configurator** — The knobs made for one job at intent. A tool, not the program. There is no universal configurator.'));
  for(const t of ['**Knob** —','**Configurator** —']) assert.equal(definitions.split(t).length-1,1,`${t} defined more than once`);
});

const job2=['alcove-idea','alcove-bench','alcove-store'].map(k=>rails[k]);
const text=r=>lines(r).join('\n');

test('Job 2 (Alcove) carries the same flag across all three pages',()=>{
  for(const r of job2) assert.ok(r.flag.startsWith(FLAG),`flag drifted: ${r.header}`);
  assert.ok(rails['alcove-store'].flag.endsWith('Store answers Store questions.'));
  assert.ok(rails['job1-store'].flag.endsWith('Store answers Store questions.'));
});

test('Alcove states the knob rule on intent and on the bench',()=>{
  assert.match(text(rails['alcove-idea']),/No universal configurator\./);
  assert.match(text(rails['alcove-idea']),/Never invent a new knob on the bench\./);
  assert.match(text(rails['alcove-idea']),/The bench does not enlarge it\./);
  assert.match(text(rails['alcove-bench']),/Do not rename it configurator\./);
});

test('Store Zero is named one way on every Store answer page',()=>{
  assert.match(text(rails['job1-store']),/Declared reference lumberyard\./);
  assert.match(text(rails['alcove-store']),/Store Zero is a declared reference lumberyard\./);
  for(const r of Object.values(rails)) assert.equal(/controlled reference Store/i.test(text(r)),false);
});

test('budgetary answer (whole Store result) and complete budgetary estimate (the number) stay distinct',()=>{
  assert.match(text(rails['alcove-store']),/ANSWERED — Store budgetary answer or refusal\./);
  assert.match(text(rails['alcove-store']),/no complete budgetary estimate\./);
  assert.match(text(rails['job1-store']),/no complete budgetary estimate\./);
});

test('the shared trail is not given a stale count',()=>{
  for(const r of Object.values(rails)) assert.equal(/Twelve events/.test(text(r)),false);
  assert.ok(rails['alcove-store'].sections.some(s=>s.title==='SHARED 13-STEP TRAIL' && s.items.length===13));
});

const job4=['hero','intent','bench','store','request','yard','record','audit'].map(k=>rails['ws-'+k]);

test('Job 3 (Window Seat) carries the same flag on every page',()=>{
  for(const r of job4) assert.ok(r && r.flag.startsWith(FLAG),`flag drifted: ${r && r.header}`);
  assert.ok(rails['ws-store'].flag.endsWith('Store answers Store questions.'));
});

test('Window Seat states the knob rule on intent and on the bench',()=>{
  assert.match(text(rails['ws-intent']),/No universal configurator\./);
  assert.match(text(rails['ws-intent']),/Every knob is made here\./);
  assert.match(text(rails['ws-intent']),/Never invent one on the bench\./);
  assert.match(text(rails['ws-bench']),/Do not rename it configurator\./);
  assert.match(text(rails['ws-bench']),/The bench turns the knobs made at intent\. It never adds one\./);
});

test('Window Seat names Store Zero and the budgetary terms the same way',()=>{
  assert.match(text(rails['ws-store']),/Store Zero is a declared reference lumberyard\./);
  assert.match(text(rails['ws-store']),/The Store budgetary answer is the whole Store result\./);
  assert.match(text(rails['ws-store']),/no complete budgetary estimate\./);
});

const outdoor=['plan','bench','edge','call','yard','record'].map(k=>rails['od-'+k]);

test('Job 4 (Outdoor build) carries the same flag on every page',()=>{
  for(const r of outdoor) assert.ok(r && r.flag.startsWith(FLAG),`flag drifted: ${r && r.header}`);
  assert.ok(rails['od-bench'].flag.endsWith('Store answers Store questions.'));
  assert.ok(rails['od-edge'].flag.endsWith('Store answers Store questions.'));
});

test('Outdoor states where the app starts, the knob rule, and where it stops',()=>{
  assert.match(text(rails['od-plan']),/This app turns a defined plan into a runnable job\./);
  assert.match(text(rails['od-plan']),/design and CAD\/CAM work/);
  assert.match(text(rails['od-bench']),/Do not rename it configurator\./);
  assert.match(text(rails['od-bench']),/It never adds one\./);
  assert.match(text(rails['od-bench']),/Every price is a live Store answer\. None is cached\./);
  assert.match(text(rails['od-edge']),/Say where the app stops\./);
  assert.match(text(rails['od-edge']),/Past the edge is a result, not an error\./);
});

test('Outdoor names Store Zero and the budgetary terms the same way',()=>{
  for(const k of ['od-bench','od-edge']){
    assert.match(text(rails[k]),/Store Zero is a declared reference lumberyard\./);
    assert.match(text(rails[k]),/The Store budgetary answer is the whole Store result\./);
    assert.match(text(rails[k]),/no complete budgetary estimate\./);
  }
});

const playhouse=['idea','bench','store','review','call','yard','terms','recap','record'].map(k=>rails['ph-'+k]);

test('Job 5 (Playhouse) carries the same flag on every page',()=>{
  for(const r of playhouse) assert.ok(r && r.flag.startsWith(FLAG),`flag drifted: ${r && r.header}`);
  assert.ok(rails['ph-store'].flag.endsWith('Store answers Store questions.'));
});

test('Playhouse states the knob rule and names the Store the same way',()=>{
  assert.match(text(rails['ph-bench']),/Do not rename it configurator\./);
  assert.match(text(rails['ph-bench']),/It never adds one\./);
  assert.match(text(rails['ph-store']),/Store Zero is a declared reference lumberyard\./);
  assert.match(text(rails['ph-store']),/The Store budgetary answer is the whole Store result\./);
  assert.match(text(rails['ph-store']),/no complete budgetary estimate\./);
});
