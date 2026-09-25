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

test('public-build files match their pinned Review source blob or their recorded System edit', () => {
  assert.equal(manifest.sourceRepository, 'GeorgePlattDemo/scan-to-build-review');
  assert.equal(manifest.sourceCommit, '7b26dfc45c9832271840d134426e096787156a04');
  assert.equal(manifest.status, 'System-owned checkpoint; source blobs recorded, later System edits listed in systemEdits');
  const edits = new Map((manifest.systemEdits || []).map(edit => [edit.path, edit]));

  for (const entry of manifest.files) {
    const url = new URL('../../public-build/' + entry.path, import.meta.url);
    const bytes = fs.readFileSync(fileURLToPath(url));
    const edit = edits.get(entry.path);
    if (edit) {
      assert.ok(edit.pass && edit.reason, entry.path + ' System edit must name its pass and reason');
      assert.equal(bytes.length, edit.bytes, entry.path + ' changed after its recorded System edit');
      assert.equal(gitBlobSha(bytes), edit.blobSha, entry.path + ' does not match its recorded System edit');
    } else {
      assert.equal(bytes.length, entry.bytes, entry.path + ' byte length changed');
      assert.equal(gitBlobSha(bytes), entry.sourceBlobSha, entry.path + ' is not byte-identical to source');
    }
  }
});

test('preservation import does not invent the missing Window Seat image', () => {
  const url = new URL('../../public-build/elevation-windowseat.png', import.meta.url);
  assert.equal(fs.existsSync(fileURLToPath(url)), false);
  assert.equal(manifest.knownSourceLimitations[0].reference, 'elevation-windowseat.png');
});
