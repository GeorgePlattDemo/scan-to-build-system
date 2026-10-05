import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const read = name => fs.readFileSync(new URL(name, root), 'utf8');
const source = read('stb-store-handoff-contract.js');
const shell = read('system-build-current.html');
const sandbox = { window: {} };
vm.runInNewContext(source, sandbox);
const contract = sandbox.window.STBStoreHandoffContract;

// A browser preview must never manufacture a fresh Store evaluation or calculate Store decisions.
for (const name of [
  'resolveStartOwnMaterial', 'requestUser1StoreEvaluation', 'sameUser1StoreAnswerIdentity',
  'd001Cycle', 'd001Envelope', 'd001Hold', 'sequenceCrosscuts', 'sequenceDefinedWorkpiece',
]) {
  assert.equal(typeof contract[name], 'undefined', 'retired browser Store helper returned: ' + name);
  assert.equal(source.includes(name), false, 'retired helper remains in published source: ' + name);
}
assert.equal(/freshEvaluation\s*:\s*true/.test(source), false, 'cached references claim fresh evaluation');
assert.equal(shell.includes('stb-user-defined-board-store.js'), false, 'shell loads the retired surrogate');
assert.equal(fs.existsSync(new URL('stb-user-defined-board-store.js', root)), false, 'retired surrogate is still published');

for (const reference of contract.user1StoreReferences) {
  const d = reference.demand;
  const preview = contract.resolveUser1StoreReference({
    ...d,
    parts: [1, 2].map(n => ({
      partId: 'PART-' + n, lengthIn: d.partLengthIn,
      features: [{ featureId: 'SPOT-' + n, kind: d.spotMode, xIn: d.spotXIn,
        locationRule: d.spotLocationRule, acrossWidthRule: d.spotAcrossWidthRule }],
    })),
  });
  assert.equal(preview.complete, true);
  assert.equal(preview.freshEvaluation, false);
  assert.equal(preview.evaluationReceipt, null);
  assert.equal(preview.combinedValue, reference.estimate.totals.Q);
}

assert.match(shell, /user1RuntimeBridge\.request\(request, startOwnStoreDemandFrom\(request\), \{ requestId \}\)/);
assert.match(read('stb-user-defined-board-runtime-bridge.js'), /sendAdmittedJob/);
console.log('PASS · browser references remain previews; Store decisions and fresh evaluations stay on the live bridge');
