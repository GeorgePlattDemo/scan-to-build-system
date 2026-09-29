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
