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

test('mature Review donor blobs remain byte-identical at admission', () => {
  const expected = new Map([
    ['browser/projects/review/system-build-base-8d8a9dd.html', '67f3c5324ac7ab2ccd798b0dc0d7179b0912eef4'],
    ['browser/projects/review/stb-window-seat-space-utilization-0.7.4.html', '96c85feef57b1196093e56495e7141452fc749a4'],
    ['browser/projects/review/stb-canonical-journey.js', 'e0619841d245b392b4065d5aa5770fe7feaeb7eb'],
    ['browser/projects/review/store-zero-canonical-doctrine.js', '653663671f61dd77e0dae73917d33b8a8e896fd2'],
  ]);
  for (const [rel, sha] of expected) assert.equal(gitBlobSha(read(rel)), sha, rel);
});

test('Alcove donor retains project-native first paint economics', () => {
  const source = read('browser/projects/review/system-build-base-8d8a9dd.html');
  assert.match(source, /id="review-price">\$374\.42/);
  assert.match(source, /const RECOVERY=\{2:\{2:63\.60[\s\S]*3:\{2:68\.59,3:73\.58,4:78\.57,5:83\.56/);
  assert.match(source, /addChrome\(\);renderHeights\(\);syncAlcove\(\);syncPicnic\(\)/);
});

test('Window Seat donor retains project/revision/store and owner-record boundaries', () => {
  const source = read('browser/projects/review/stb-window-seat-space-utilization-0.7.4.html');
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
