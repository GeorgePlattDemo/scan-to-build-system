import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, '../..');
function read(rel) { return fs.readFileSync(path.join(projectRoot, rel), 'utf8'); }
function gitBlobSha(text) {
  return crypto.createHash('sha1')
    .update('blob ' + Buffer.byteLength(text, 'utf8') + '\0' + text, 'utf8')
    .digest('hex');
}
function gitBlobShaFile(rel) {
  const bytes = fs.readFileSync(path.join(projectRoot, rel));
  return crypto.createHash('sha1')
    .update('blob ' + bytes.length + '\0', 'utf8')
    .update(bytes)
    .digest('hex');
}

test('mature Review donor blobs remain byte-identical at admission', () => {
  const expected = new Map([
    ['review-donors/system-build-base-8d8a9dd.html', '67f3c5324ac7ab2ccd798b0dc0d7179b0912eef4'],
    ['review-donors/stb-window-seat-space-utilization-0.7.4.html', '96c85feef57b1196093e56495e7141452fc749a4'],
    ['review-donors/stb-canonical-journey.js', 'e0619841d245b392b4065d5aa5770fe7feaeb7eb'],
    ['review-donors/store-zero-canonical-doctrine.js', '653663671f61dd77e0dae73917d33b8a8e896fd2'],
    ['review-donors/stb-outdoor-reference-authority-0.3.html', '289e178b1c7a526c802e908155d4405e593cc706'],
    ['review-donors/STB-OUTDOOR-ANGLED-FRAME-RESEARCH-DOSSIER-0.1.html', '5c7d1acb78f65ab421423f531c87d2b4eb41059a'],
    ['review-donors/stb-outdoor-build-deck-0.1.html', '8d619fbec7954c13d82a3b187c7d4fc5b84f46e7'],
    ['review-donors/stb-start-own-0.10.html', 'cbdb02996e161b951704acae29d8da2dd1c68c03'],
    ['review-donors/stb-start-own-0.11.html', '45132afea1cc796b10e0fb667a7d2db3ee10e284'],
    ['review-donors/stb-outdoor-build.html', '7772620381179a70d550bbceda3da5155d445591'],
    ['review-donors/stb-store-handoff-contract.js', '6be0f8b6d527c553b965a946a99adb848b3c9b7e'],
    ['review-donors/assets/project-tiles/start-your-own.webp', 'd7696f41ba26c6ed7c08fee1ded33e01e151f09a'],
    ['review-donors/assets/project-tiles/plywood-curvilinear-shapes.webp', '677334bf55d6ed8adc61d3028f90beef22bad34b'],
  ]);
  for (const [rel, sha] of expected) assert.equal(gitBlobShaFile(rel), sha, rel);
});

test('Alcove donor retains project-native first paint economics', () => {
  const source = read('review-donors/system-build-base-8d8a9dd.html');
  assert.match(source, /id="review-price">\$374\.42/);
  assert.match(source, /const RECOVERY=\{2:\{2:63\.60[\s\S]*3:\{2:68\.59,3:73\.58,4:78\.57,5:83\.56/);
  assert.match(source, /addChrome\(\);renderHeights\(\);syncAlcove\(\);syncPicnic\(\)/);
});

test('Window Seat donor retains project/revision/store and owner-record boundaries', () => {
  const source = read('review-donors/stb-window-seat-space-utilization-0.7.4.html');
  for (const token of [
    "project:{id:'window-seat'",
    'storeRequest:req',
    'storeAnswer:answer',
    'READY is not custody',
    'NO CONTROLLER OUTPUT',
    'NO BLOOD ON WOOD',
    'exact component occurrences',
  ]) assert.ok(source.includes(token), token);
  assert.match(source, /WINDOW_SEAT_ACTOR_STAGES=\['scan','configure','store-answer','accept-pay','store-yard','handoff-record'\]/);
});


test('System host does not reprice Alcove or mint custody from Store navigation', () => {
  const source = read('browser/ui/canonical-project-host.mjs');
  for (const forbidden of [
    'applyAlcoveEconomicsBoundary',
    'quoteAlcoveInsert',
    'createComparisonStoreHandoff',
    'STBStoreHandoffContract',
    'alcove-store-answer-view',
  ]) assert.equal(source.includes(forbidden), false, forbidden);
  for (const donorValue of ['272.86', '83.56', '374.42']) {
    assert.equal(source.includes(donorValue), false, donorValue);
  }
  assert.match(source, /persist\(ctx, alcoveSnapshot\(ctx\), 'alcove-native-confirmation'\)/);
  assert.match(source, /snapshotCarriesFormalStoreAnswer/);
});
