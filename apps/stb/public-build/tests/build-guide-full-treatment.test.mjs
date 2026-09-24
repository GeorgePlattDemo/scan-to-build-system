import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const shell=fs.readFileSync(new URL('../system-build-current.html',import.meta.url),'utf8');
const base=fs.readFileSync(new URL('../system-build-base-8d8a9dd.html',import.meta.url),'utf8');
const source=fs.readFileSync(new URL('../stb-build-guide-spec.js',import.meta.url),'utf8');

const sandbox={window:{}};
vm.runInNewContext(source,sandbox,{filename:'stb-build-guide-spec.js'});
const spec=sandbox.window.STBBuildGuideSpec;

test('Dev Guide covers current pages and only rewrites the reserved rail',()=>{
  assert.equal(spec.version,'STB-DEV-GUIDE-0.2');
  assert.match(shell,/stb-build-guide-spec\.js\?v=/);
  assert.match(shell,/function installDeveloperBuildGuides\(\)/);

  const fn=shell.slice(shell.indexOf('function installDeveloperBuildGuides()'),shell.indexOf('installDeveloperBuildGuides();',shell.indexOf('function installDeveloperBuildGuides()')));
  assert.match(fn,/page\.querySelector\(':scope > aside\.rail'\)/);
  assert.match(fn,/page\.append\(rail\)/);
  assert.match(fn,/rail\.innerHTML = spec\.render\(page\.id\)/);
  assert.equal(/\.main[^\n]*innerHTML|querySelector\([^\n]*\.main[^\n]*\)\.innerHTML/.test(fn),false,'Dev Guide installer rewrites customer main content');

  const baseIds=[...base.matchAll(/<section[^>]+id="([^"]+)"/g)].map(m=>m[1]);
  const dynamicIds=[
    'start-own-live','outdoor-build-live','window-seat-live',
    'proof-store','proof-accept','proof-yard','proof-terms','proof-record',
    'playhouse-s001','playhouse-machine','playhouse-store','playhouse-review','playhouse-request','playhouse-yard','playhouse-terms','playhouse-result','playhouse-record',
    'picnic-store','picnic-request','picnic-yard','picnic-terms','picnic-recap','picnic-record',
    'alcove-store-order-surface','alcove-store-service-choices','alcove-store-yard-answer','alcove-store-commercial-sequence','alcove-store-returned-offer'
  ];

  for(const id of new Set([...baseIds,...dynamicIds])){
    assert.ok(spec.pages[id],`missing Dev Guide: ${id}`);
    assert.ok(spec.pages[id].rows.length>=2 && spec.pages[id].rows.length<=5,`Dev Guide not shorthand-sized: ${id}`);
    const rendered=spec.render(id);
    assert.match(rendered,/DEV GUIDE/);
    assert.equal(rendered.includes('GLOBAL WARTS'),false);
    assert.equal(rendered.includes('PRODUCTION BASELINE'),false);
    assert.equal(rendered.includes('BUILD GUIDE · FULL BUILD'),false);
  }
});

test('landing Dev Guide restores the original short cues',()=>{
  const html=spec.render('landing');
  for(const phrase of [
    'Say what this is','One screen, no scrolling to understand it.',
    'Show who does what','Four steps are yours, one is ours.',
    'Make the seam visible','The definition reaches the cut unchanged.',
    'Offer three ways in','Same road after. Different opening.'
  ]) assert.ok(html.includes(phrase),`landing Dev Guide lost: ${phrase}`);
});

test('sharp shorthand still names the important build debt',()=>{
  assert.match(spec.render('projects'),/Don’t overcrowd/);
  assert.match(spec.render('alcove-config'),/Kill stale replies/);
  assert.match(spec.render('proof-store'),/Reject stale results/);
  assert.match(spec.render('proof-accept'),/One click, three receipts/);
  assert.match(spec.render('proof-accept'),/idempotent/i);
  assert.match(spec.render('proof-yard'),/READY ≠ custody/);
  assert.match(spec.render('proof-yard'),/No magic controller/);
  assert.match(spec.render('proof-yard'),/Durable queue/);
  assert.match(spec.render('intake'),/Don’t trust uploads/);
  assert.match(spec.render('start-own-live'),/postMessage is a contract/);
});
