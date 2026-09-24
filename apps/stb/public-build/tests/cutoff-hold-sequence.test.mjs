import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';

const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync('stb-store-handoff-contract.js', 'utf8'), sandbox);
const contract = sandbox.window.STBStoreHandoffContract;

assert.equal(contract.d001Hold.holdIn, 24);
assert.equal(contract.d001Hold.kerfIn, 0.125);
assert.equal(contract.d001Hold.cutoffParents.twelveFoot.sku, 'STB-ZERO-SPF-2X4-144-001');
assert.equal(contract.d001Hold.cutoffParents.sixteenFoot.sku, 'STB-ZERO-SPF-2X4-192-001');

const twelve = contract.sequenceCrosscuts({ parentLengthIn: 144, parts: Array(8).fill(15.5) });
assert.equal(twelve.status, 'SEQUENCED');
assert.equal(twelve.sticks, 2);

const sixteen = contract.sequenceCrosscuts({ parentLengthIn: 192, parts: Array(8).fill(15.5) });
assert.equal(sixteen.status, 'SEQUENCED');
assert.equal(sixteen.sticks, 1);
assert.ok(sixteen.remain[0] >= 24);

const mapped = contract.resolveStartOwnMaterial({
  sizeKey: '2x4',
  sequence: 'CROSSCUT_HOLD',
  parts: [{ name: 'end-leg', len: 15.5, wid: 3.5, qty: 8 }]
});
assert.equal(mapped.status, 'MAPPED');
assert.equal(mapped.quantity, 1);
assert.ok(['STB-ZERO-SPF-2X4-168-001', 'STB-ZERO-SPF-2X4-192-001'].includes(mapped.storeSku));
assert.ok(mapped.left[0] >= 24);

const pair = contract.resolveStartOwnMaterial({
  sizeKey: '2x4',
  sequence: 'CROSSCUT_HOLD',
  parts: [{ name: 'p', len: 32, wid: 3.5, qty: 2 }]
});
assert.equal(pair.storeSku, 'STB-ZERO-SPF-2X4-96-001');

const user1 = contract.sequenceDefinedWorkpiece({
  definedWorkpieceLengthIn: 60,
  parts: [16,16],
  establishAngledEnd: true
});
assert.equal(user1.status, 'SEQUENCED');
assert.equal(user1.rawStockLengthIn, undefined);
assert.equal(user1.preparation, undefined);
assert.equal(user1.definedWorkpieceLengthIn, 60);
assert.equal(user1.production.length, 3);
assert.equal(user1.production[0].kind, 'ESTABLISH_ANGLE');
assert.equal(user1.production[0].retainedAfterIn, 59.875);
assert.equal(user1.production[1].retainedAfterIn, 43.75);
assert.equal(user1.production[2].retainedAfterIn, 27.625);
assert.equal(user1.finalRemainderIn, 27.625);
assert.ok(user1.production.every(row => row.pass === true));

console.log('PASS · cutoff hold 24 in and User 1 defined-workpiece sequence');
