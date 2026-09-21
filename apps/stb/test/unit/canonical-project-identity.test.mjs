import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  canonicalPayloadDigest,
  reviewChildDefinitionIdentity,
} from '../../shared/review-child-identity.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, '../..');

test('reconciliation payload digest is canonical across object-key insertion order', async () => {
  const left = {
    definition: { width: 72, depth: 18, options: { shelves: 3, species: 'pine' } },
    revision: { number: 4, confirmed: true },
  };
  const right = {
    revision: { confirmed: true, number: 4 },
    definition: { options: { species: 'pine', shelves: 3 }, depth: 18, width: 72 },
  };
  assert.equal(await canonicalPayloadDigest(left), await canonicalPayloadDigest(right));
});

test('changed consequential Window Seat definition changes canonical SHA-256 identity', async () => {
  const base = {
    revision: { number: 4 },
    definition: { width: 72, depth: 18, shelfCount: 3 },
  };
  const reordered = {
    definition: { shelfCount: 3, depth: 18, width: 72 },
    revision: { number: 4 },
  };
  const changed = {
    revision: { number: 4 },
    definition: { width: 73, depth: 18, shelfCount: 3 },
  };
  const baseId = await reviewChildDefinitionIdentity('window-seat', base);
  assert.equal(baseId, await reviewChildDefinitionIdentity('window-seat', reordered));
  assert.notEqual(baseId, await reviewChildDefinitionIdentity('window-seat', changed));
  assert.match(baseId, /^WINDOW-SEAT-R4-SHA256-[0-9a-f]{64}$/);
});

test('authoritative donor definition/version identifiers remain authoritative', async () => {
  assert.equal(
    await reviewChildDefinitionIdentity('start-own', { id: 'SYO-DONOR-42', width: 42 }),
    'SYO-DONOR-42',
  );
  assert.equal(
    await reviewChildDefinitionIdentity('outdoor', {
      normalizedPart: { versionId: 'OUTDOOR-PART-7', length: 22 },
    }),
    'OUTDOOR-PART-7',
  );
});

test('reconciliation-critical host no longer contains FNV identity or deduplication', () => {
  const host = fs.readFileSync(path.join(projectRoot, 'browser/ui/canonical-project-host.mjs'), 'utf8');
  assert.equal(host.includes('fnv1a'), false);
  assert.match(host, /canonicalPayloadDigest/);
  assert.match(host, /reviewChildDefinitionIdentity/);
});
