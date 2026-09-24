import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const manifestUrl = new URL('../../public-build/SOURCE-MANIFEST.json', import.meta.url);
const manifest = JSON.parse(fs.readFileSync(manifestUrl, 'utf8'));

function gitBlobSha(bytes) {
  const header = Buffer.from(`blob ${bytes.length}\0`, 'utf8');
  return crypto.createHash('sha1').update(header).update(bytes).digest('hex');
}

test('public-build checkpoint is byte-identical to pinned Review source blobs', () => {
  assert.equal(manifest.sourceRepository, 'GeorgePlattDemo/scan-to-build-review');
  assert.equal(manifest.sourceCommit, '7b26dfc45c9832271840d134426e096787156a04');
  assert.equal(manifest.status, 'exact preservation checkpoint; not yet the canonical System runtime root');

  for (const entry of manifest.files) {
    const url = new URL('../../public-build/' + entry.path, import.meta.url);
    const bytes = fs.readFileSync(fileURLToPath(url));
    assert.equal(bytes.length, entry.bytes, entry.path + ' byte length changed');
    assert.equal(gitBlobSha(bytes), entry.sourceBlobSha, entry.path + ' is not byte-identical to source');
  }
});

test('preservation import does not invent the missing Window Seat image', () => {
  const url = new URL('../../public-build/elevation-windowseat.png', import.meta.url);
  assert.equal(fs.existsSync(fileURLToPath(url)), false);
  assert.equal(manifest.knownSourceLimitations[0].reference, 'elevation-windowseat.png');
});
