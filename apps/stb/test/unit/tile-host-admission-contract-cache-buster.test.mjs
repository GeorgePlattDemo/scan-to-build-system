import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const publicBuild = fileURLToPath(new URL('../../public-build/', import.meta.url));
const contractPath = path.join(publicBuild, 'shared', 'tile-host-admission-contract.mjs');

function gitBlobSha(bytes) {
  const header = Buffer.from(`blob ${bytes.length}\0`, 'utf8');
  return crypto.createHash('sha1').update(header).update(bytes).digest('hex');
}

function publicBuildPages(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return publicBuildPages(full);
    return /\.(html|js|mjs)$/.test(entry.name) ? [full] : [];
  });
}

// A load is a quoted URL naming the contract; prose comments that mention the file are not loads.
const LOAD = /['"`]([^'"`\s]*tile-host-admission-contract\.mjs(?:\?[^'"`\s]*)?)['"`]/g;

test('every public-build load of the tile-host admission contract carries the current blob prefix', () => {
  const blob = gitBlobSha(fs.readFileSync(contractPath));
  const loads = [];
  for (const file of publicBuildPages(publicBuild)) {
    for (const match of fs.readFileSync(file, 'utf8').matchAll(LOAD)) {
      loads.push({ file: path.relative(publicBuild, file), url: match[1] });
    }
  }
  assert.ok(loads.length > 0, 'no public-build page loads the tile-host admission contract');
  for (const { file, url } of loads) {
    const token = /\?v=([0-9a-f]+)$/.exec(url)?.[1];
    assert.ok(token && token.length >= 8, `${file} loads ${url} without a ?v= blob prefix`);
    assert.equal(token, blob.slice(0, token.length),
      `${file} loads ${url}; the contract blob is ${blob}, so a browser can run an old contract`);
  }
});
