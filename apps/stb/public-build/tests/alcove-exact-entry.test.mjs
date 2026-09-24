import fs from 'node:fs';
import assert from 'node:assert/strict';

const source=fs.readFileSync('system-build-base-8d8a9dd.html','utf8');

for(const id of ['x-h','x-w','x-d','x-n']) assert.match(source,new RegExp('id="'+id+'"'));
for(const slider of ['c-h','c-w','c-d']) assert.match(source,new RegExp('id="'+slider+'"[^>]+step="0\\.03125"'));
assert.match(source,/Type a decimal or fraction\. Read back to the nearest 1\/32 in\./);
assert.match(source,/function round32\(v\)\{return Math\.round\(v\*32\)\/32\}/);
assert.match(source,/function fmt32\(v\)/);
assert.match(source,/function applyExactEntry\(sliderId,inputId\)/);
assert.match(source,/parseHeight\(input\.value\)/);
assert.match(source,/slider\.value=String\(value\);syncAlcove\(\);syncExactEntries\(\)/);
assert.match(source,/\['c-h','x-h'\],\['c-w','x-w'\],\['c-d','x-d'\]/);
assert.match(source,/id="x-n" type="number" min="2" max="7" step="1"/);

assert.match(source,/NEXT → CONFIGURE/);
assert.equal(source.includes('>TYPE THE NUMBERS<'),false);

// Exact-entry controls feed the inline confirmation gate.
assert.match(source,/id="confirm-alcove-inline"/);
assert.match(source,/CONFIRM &amp; SEND TO STORE ZERO →/);
assert.match(source,/show\('store'\)/);

console.log('PASS · Alcove exact-entry regression checks');
