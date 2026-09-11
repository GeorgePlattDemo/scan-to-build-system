import assert from 'node:assert/strict';
import test from 'node:test';

import { canonicalEqual, canonicalInchString, canonicalJson, sha256Hex } from '../../shared/canonical.mjs';

test('sha256Hex hashes known UTF-8 bytes', async () => {
  const digest = await sha256Hex(new TextEncoder().encode('abc'));
  assert.equal(
    digest,
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
  );
});

test('sha256Hex rejects non-byte input', async () => {
  await assert.rejects(() => sha256Hex('abc'), TypeError);
});

test('canonicalJson sorts keys and rejects non-finite values', () => {
  assert.equal(canonicalJson({ b: 1, a: { d: 2, c: 3 } }), '{"a":{"c":3,"d":2},"b":1}');
  assert.equal(canonicalEqual({ a: 1, b: 2 }, { b: 2, a: 1 }), true);
  assert.throws(() => canonicalJson({ n: Number.NaN }), TypeError);
  assert.throws(() => canonicalJson({ n: Infinity }), TypeError);
  assert.throws(() => canonicalJson({ proto: undefined }), TypeError);
});

test('canonicalInchString normalizes finite inch decimals', () => {
  assert.equal(canonicalInchString(45), '45');
  assert.equal(canonicalInchString(24.5000), '24.5');
  assert.equal(canonicalInchString(0), '0');
  assert.equal(canonicalInchString(-0), '0');
});
