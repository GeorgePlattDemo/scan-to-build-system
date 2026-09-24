import fs from 'node:fs';
import assert from 'node:assert/strict';

const base=fs.readFileSync('system-build-base-8d8a9dd.html','utf8');
const front=fs.readFileSync('system-build-front-door-0.5.html','utf8');
const shell=fs.readFileSync('system-build-current.html','utf8');

const configStart=base.indexOf('<section class="page" id="alcove-config">');
const reviewStart=base.indexOf('<section class="page" id="alcove-review">');
assert.ok(configStart >= 0 && reviewStart > configStart);
const configure=base.slice(configStart,reviewStart);

assert.match(configure,/STORE \/ PRICE BASIS/,'original Configure detail was not restored');
assert.match(configure,/id="confirm-alcove-inline"/);
assert.match(configure,/Before you send it/);
assert.match(configure,/Confirm freezes the exact definition above as Version 1/);
assert.equal(configure.includes('data-go="store">SEND TO STORE ZERO'),false,'Configure still bypasses confirmation');

assert.match(base,/function confirmAlcoveVersion\(\)/);
assert.match(base,/show\('store'\)/);
assert.match(base,/id="store"/);
assert.match(base,/What happens next/);
assert.match(base,/Yard review/);
assert.match(base,/Owner record/);
assert.match(base,/data-go="request">Next →/);

assert.match(front,/if \(project\.key === 'alcove'\)/);
assert.match(front,/preview = null;[\s\S]*canonicalShow\(project\.rootId\)/);
assert.match(front,/target === 'alcove-capture'/);
assert.ok(shell.includes("['alcove-review','terms','recap']"),'Alcove internal pages are still exposed as customer nav');
assert.match(shell,/review:'store'/);
assert.match(shell,/request:'request'/);
assert.match(shell,/terms:'yard'/);
assert.match(shell,/recap:'record'/);
assert.match(shell,/Accept \/ Pay/);
assert.match(shell,/sharedBand\.innerHTML\.replace\('Reference journey shown before confirmation\.'\,'Confirmed version sent to Store Zero\.'\)/);

console.log('PASS · Alcove restore-and-correct checks');
